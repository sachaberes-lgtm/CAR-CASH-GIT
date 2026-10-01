/* LA MUSIQUE QUI SUIT LA VITESSE ET LE MOTEUR — v2 (2026-10-01, Léo : « qu'au début, quand c'est lent, on ait quelques notes,
   mélodieux, harmonieux », puis « qu'elle évolue encore plus — ni trop vite ni trop lentement, pas casse-tête, bien rythmée,
   en fonction de la vitesse ET du moteur, un mélange des deux pour une expérience fluide »).
   ----------------------------------------------------------------------------------------------------------------------
   Module AUTONOME (aucune globale du jeu) : boucles.html et index.html l'utilisent tel quel.
   Une boucle livrée en COUCHES (atelier-son/boucles.py) : toutes jouent EN MÊME TEMPS, calées à l'échantillon.

   DEUX AXES QUI SE MÉLANGENT
   · le TEMPS (v2.1, Léo : « au début laisse vraiment la base, et évolue aussi avec le temps ») : chaque couche a une heure
     (`temps`, secondes de musique jouée) avant laquelle elle reste fermée — au départ la BASE seule ; le moteur avance ces
     heures (jusqu'à −`moteurTemps`) ;
   · la VITESSE (rapide) ouvre et ferme les couches débloquées — la couche 1 (harmonie) joue toujours ;
   · le MOTEUR (lent, 0 → 1 au fil des paliers) avance les seuils (jusqu'à −`moteurSeuil`), débloque les VARIANTES riches et
     les couches réservées (ÉNERGIE), et chaque palier gagné déclenche une TRANSITION (montée + crash sur la mesure).

   TOUT TOMBE EN RYTHME (calé sur le tempo de la boucle)
   · une couche ENTRE sur la prochaine MESURE et SORT sur le prochain temps, jamais au milieu ; hystérésis ±`hyst` autour du seuil et au
     moins `tenue` temps entre deux changements d'une même couche → pas de va-et-vient quand la vitesse hésite ;
   · entrer = net (τ ≈ 15 % d'un temps), sortir = en douceur (τ ≈ 60 % d'un temps) ;
   · EN VOL les couches `sol` (grosse caisse) sortent à la croche suivante et RETOMBENT sur le temps de la pose.

   ANTI-LASSITUDE
   · une couche peut avoir plusieurs VARIANTES (même durée, calées) : à chaque tour de boucle (≈ 16 s), chaque couche à
     variantes change avec une chance sur deux (et au moins une change) — ça bouge toutes les 16-32 s, jamais à chaque mesure ;
   · le LEAD respire : il joue un tour sur deux (tous quand le moteur est fort ou en frénésie) ;
   · RATTRAPAGE : peu de couches → le tout remonté (≤ `rattrapageMax` dB) : à l'arrêt la nappe s'entend.

   const mv = MusiqueVitesse(ac, sortie);
   await mv.charge(boucle);           // { bpm, mesures, dur, couches:[{nom,seuil,sol,rms,variantes:[{v,f,moteur,rms}]}], transition:{f,avance} }
   mv.joue(); mv.stop();
   mv.regle({ vitesse, enVol, nitro, moteur, temps });   // chaque image — vitesse ≈ 1 en croisière, moteur 0…1, temps en s
   mv.palier(moteur);                  // un palier moteur vient d'être gagné (moteur = sa valeur après le palier)
   mv.etat();                          // gains, variantes, rattrapage…
   Les couches « à l'ancienne » (un seul `f`, pas de `variantes`) marchent aussi. */
(function(G){
'use strict';
const MV_REGLES={moteurTemps:.5,hyst:.04,tenue:2,moteurSeuil:.2,plancher:.45,rattrapageMax:14,nitroBrillance:4,chanceVariante:.5,leadRespire:.7};
function MusiqueVitesse(ac,sortie){
  const R=MV_REGLES;
  const bus=ac.createGain(),mkG=ac.createGain(),aigus=ac.createBiquadFilter();
  aigus.type='highshelf';aigus.frequency.value=3200;aigus.gain.value=0;
  bus.connect(mkG);mkG.connect(aigus);aigus.connect(sortie||ac.destination);
  let B=null,C=[],trBuf=null,deb=0,t0=0,temps=.5,tour=16,joueOk=false,src=[],prochTour=0,nTour=0,mk=1,hasard=0x9E3779B9;
  function alea(){hasard^=hasard<<13;hasard^=hasard>>>17;hasard^=hasard<<5;return (hasard>>>0)/4294967296;}
  async function decode(f){const r=await fetch(f);if(!r.ok)throw new Error('introuvable : '+f);const ab=await r.arrayBuffer();
    return await new Promise((ok,ko)=>ac.decodeAudioData(ab,ok,ko));}
  async function charge(b){
    B=b;temps=60/(b.bpm||120);tour=b.dur;
    C=[];
    for(const c of b.couches){
      const vs=c.variantes||[{v:'A',f:c.f,moteur:0,rms:c.rms}];
      const bufs=[];for(const v of vs)bufs.push(await decode(v.f));
      C.push({c:c,vs:vs,bufs:bufs,on:false,var:0,tChange:-99,gOn:0,gains:[],layer:null});
    }
    trBuf=b.transition?await decode(b.transition.f).catch(()=>null):null;
    const extra=C[0].bufs[0].duration-b.dur;deb=extra>.03?Math.min(extra,2112/C[0].bufs[0].sampleRate):0; // l'amorce AAC
  }
  function eligibles(k,moteur){return C[k].vs.map((v,i)=>i).filter(i=>(C[k].vs[i].moteur||0)<=moteur+1e-6);}
  function joue(){
    stop();t0=ac.currentTime+.05;prochTour=t0+tour;nTour=0;
    C.forEach(function(L,k){
      L.layer=ac.createGain();L.layer.gain.value=k===0?1:0;L.on=k===0;L.gOn=L.on?1:0;L.layer.connect(bus);L.var=0;L.gains=[];
      L.bufs.forEach(function(buf,i){
        const s=ac.createBufferSource(),g=ac.createGain();s.buffer=buf;s.loop=true;s.loopStart=deb;s.loopEnd=deb+tour;
        g.gain.value=i===L.var?1:0;s.connect(g);g.connect(L.layer);s.start(t0,deb);src.push(s);L.gains.push(g);});
    });
    joueOk=true;
  }
  function stop(){src.forEach(s=>{try{s.stop();}catch(e){}});src=[];C.forEach(L=>{if(L.layer)try{L.layer.disconnect();}catch(e){}});joueOk=false;}
  function prochain(pas){const n=Math.ceil((ac.currentTime+.02-t0)/pas);return t0+n*pas;} // le prochain temps (ou croche, ou mesure)
  function changeVariante(L,i,quand){if(i===L.var)return;L.gains[L.var].gain.setTargetAtTime(0,quand,.04);L.gains[i].gain.setTargetAtTime(1,quand,.02);L.var=i;}
  let dernier={vitesse:0,enVol:false,nitro:false,moteur:0};
  function regle(o){
    if(!joueOk||!B)return;dernier=o;
    const now=ac.currentTime,v=o.vitesse||0,mot=Math.max(0,Math.min(1,o.moteur||0));
    // 1) LES COUCHES : décision avec hystérésis, appliquée sur le prochain temps
    C.forEach(function(L,k){
      if(k===0)return;
      const el=eligibles(k,mot);
      const s=L.c.seuil*(1-R.moteurSeuil*mot);
      let veut=L.on;
      const heure=(L.c.temps||0)*(1-R.moteurTemps*mot);
      if(!el.length||(o.temps!=null&&o.temps<heure))veut=false;
      else if(L.on&&v<s-R.hyst)veut=false;else if(!L.on&&v>=s+R.hyst)veut=true;
      if(L.c.sol&&o.enVol)veut=false;
      if(L.c.nom==='LEAD'&&L.repos&&!o.frenesie)veut=false;
      if(veut===L.on)return;
      const vite=L.c.sol;                                   // la grosse caisse : à la croche (vol) / au temps (pose)
      const quand=prochain(vite&&!veut?temps/2:veut&&!(vite&&L.tChange>-99)?temps*4:temps); // entrer = sur la MESURE ; la grosse caisse qui retombe après un vol = sur le temps
      if(!(L.c.sol&&o.enVol)&&quand-L.tChange<R.tenue*temps)return; // tenue minimale (sauf la coupure du vol)
      if(veut&&!el.includes(L.var))changeVariante(L,el[0],quand);
      L.on=veut;L.tChange=quand;
      L.layer.gain.cancelScheduledValues(quand);L.layer.gain.setTargetAtTime(veut?1:0,quand,temps*(veut?.15:.6));
    });
    // 2) LA FIN DU TOUR : les variantes tournent (anti-lassitude), le lead respire
    if(now+.25>=prochTour){
      const quand=prochTour;prochTour+=tour;nTour++;
      let change=false;const cand=[];
      C.forEach(function(L,k){
        const el=eligibles(k,mot);if(el.length<2)return;cand.push(k);
        if(alea()<R.chanceVariante){const autres=el.filter(i=>i!==L.var);changeVariante(L,autres[(alea()*autres.length)|0],quand);change=true;}
      });
      if(!change&&cand.length){const L=C[cand[(alea()*cand.length)|0]],el=eligibles(C.indexOf(L),mot).filter(i=>i!==L.var);changeVariante(L,el[(alea()*el.length)|0],quand);}
      C.forEach(function(L){if(L.c.nom==='LEAD')L.repos=mot<R.leadRespire&&(nTour%2===1);});
    }
    // 3) LE RATTRAPAGE et la brillance
    let e=0,E=0;C.forEach(function(L,k){const r=L.vs[L.var].rms||L.c.rms||.05,g=k===0||L.on?1:0;e+=g*r*r;E+=r*r;});
    const mkC=Math.max(1,Math.min(Math.pow(10,R.rattrapageMax/20),Math.sqrt(R.plancher*E/Math.max(e,1e-12))));
    if(Math.abs(mkC-mk)>.01){mk=mkC;mkG.gain.setTargetAtTime(mk,now,.5);}
    aigus.gain.setTargetAtTime(o.nitro?R.nitroBrillance:0,now,.08);
  }
  function palier(moteur){ // un palier moteur : montée d'une mesure puis crash SUR la barre ; les variantes s'enrichissent sur cette barre
    if(!joueOk)return;
    const mesure=temps*4,av=(B.transition&&B.transition.avance)||mesure;
    let tb=prochain(mesure);while(tb-av<ac.currentTime+.05)tb+=mesure;
    if(trBuf){const s=ac.createBufferSource(),g=ac.createGain();s.buffer=trBuf;g.gain.value=.8;s.connect(g);g.connect(bus);s.start(tb-av);}
    const mot=moteur!=null?Math.max(0,Math.min(1,moteur)):(dernier.moteur||0); // le moteur APRÈS le palier
    C.forEach(function(L,k){const el=eligibles(k,mot);if(el.length>1)changeVariante(L,el[el.length-1],tb);}); // la plus riche débloquée
  }
  function position(){return B?((ac.currentTime-t0)%tour+tour)%tour:0;}
  return{charge:charge,joue:joue,stop:stop,regle:regle,palier:palier,position:position,sortie:bus,
    etat:function(){return{gains:C.map((L,k)=>k===0||L.on?1:0),variantes:C.map(L=>L.vs[L.var].v),noms:C.map(L=>L.c.nom),
      tour:nTour,rattrapage:+(20*Math.log10(mk)).toFixed(1)+' dB'};}};
}
G.MusiqueVitesse=MusiqueVitesse;G.MV_REGLES=MV_REGLES;
})(window);
