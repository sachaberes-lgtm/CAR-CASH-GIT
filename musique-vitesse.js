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

   v2.2 (Léo : « plus actif, plus harmonieux, le temps peut être moins, il faut que ça SUIVE — si la voiture s'arrête, la musique
   en même temps : une rupture harmonieuse » · « plus de détails selon comment on accélère en nitro d'affilée ; l'accélération
   normale pareil, avec moins d'intensité ») :
   · FILTRE ← vitesse : sourd à l'arrêt (1,3 kHz), grand ouvert lancé — la musique suit en continu, sans attendre un temps ;
   · ACCALMIE (v2.3, « pas casser, une belle transition ») : la vitesse s'effondre (−`ruptDelta` sous `ruptSous`, ou l'arrêt) →
     sur le temps, le groove se retire en fondu, le son se ferme doucement, une FLORAISON (`rupture.m4a`) fait le pont et la
     partie ACCALMIE (`accalmie.m4a` : cloches + guitare pincée, calée) prend le relais sur la nappe ; RELANCE (vitesse > `relanceSur`) → la
     montée part tout de suite, son crash tombe sur la mesure, et le groove revient SUR cette mesure ;
   · ÉLAN (0-1) : la NITRO le monte (.35 d'emblée, +.18/s tenue ; relâchée < 1,5 s puis reprise = enchaînée, l'élan continue),
     l'ACCÉLÉRATION normale aussi mais plafonnée à .45 ; il fait : brillance (jusqu'à +6 dB d'aigus), un SOUFFLE qui grimpe
     (nitro), l'ÉNERGIE ouverte (> .55), le lead qui ne se repose plus (> .5), les variantes chargées du rythme et de l'arpège
     (> .75 tenu 1 s, rendues quand il retombe), et la nitro LÂCHÉE après 1,5 s = un crash sur le temps.
   mv.etat();                          // gains, variantes, rattrapage…
   Les couches « à l'ancienne » (un seul `f`, pas de `variantes`) marchent aussi. */
(function(G){
'use strict';
const MV_REGLES={moteurTemps:.5,hyst:.04,tenue:2,moteurSeuil:.2,plancher:.45,rattrapageMax:14,nitroBrillance:6,chanceVariante:.5,leadRespire:.7,
  // v2.2 — l'ÉLAN (nitro tenue/enchaînée, accélération), la RUPTURE et le filtre qui suit la vitesse
  nitroElan0:.35,nitroElanS:.18,nitroEnchaine:1.5,accElanK:1.2,accElanMax:.45,elanRetombe:1.8,dropApres:1.5,souffle:.09,boostSur:.75,energieElan:.55,
  ruptDelta:.32,ruptSous:.55,ruptPause:3,picDescend:.3,relanceSur:.45,ruptFc:900,fcBas:1300,fcHaut:19000};
function MusiqueVitesse(ac,sortie){
  const R=MV_REGLES;
  // bus → FILTRE (la vitesse, la rupture) → rattrapage → aigus (l'élan) → sortie ; + le SOUFFLE de la nitro, synthétisé en direct
  const bus=ac.createGain(),filt=ac.createBiquadFilter(),mkG=ac.createGain(),aigus=ac.createBiquadFilter();
  filt.type='lowpass';filt.frequency.value=20000;filt.Q.value=.5;
  aigus.type='highshelf';aigus.frequency.value=3200;aigus.gain.value=0;
  bus.connect(filt);filt.connect(mkG);mkG.connect(aigus);aigus.connect(sortie||ac.destination);
  const soufG=ac.createGain(),soufF=ac.createBiquadFilter();soufG.gain.value=0;soufF.type='bandpass';soufF.Q.value=3;soufF.frequency.value=800;
  soufF.connect(soufG);soufG.connect(aigus);let soufSrc=null;
  const calmeG=ac.createGain();calmeG.gain.value=0;calmeG.connect(filt);let calmeBuf=null,calmeSrc=null;
  let SQ=null,seqBuf=null,seqG=null,cur=null,prochDemi=0,demi=0,dropSommet=false,nivSec=0; // le SÉQUENCEUR (mode « sampling » : un morceau découpé en phrases)
  let B=null,C=[],trBuf=null,ruBuf=null,deb=0,t0=0,temps=.5,tour=16,joueOk=false,src=[],prochTour=0,nTour=0,mk=1,hasard=0x9E3779B9;
  // la course vue par la musique : vitesse lissée, son pic récent, l'accélération, l'ÉLAN (nitro tenue / enchaînée, accélération)
  let vF=0,vPic=0,vPicL=0,acc=0,tPrec=0,elan=0,nitroT=0,nitroLache=-9,nitroAvant=false,tRupt=-99,rupt=false,relanceA=0,boost=false,boostT=0;
  function alea(){hasard^=hasard<<13;hasard^=hasard>>>17;hasard^=hasard<<5;return (hasard>>>0)/4294967296;}
  async function decode(f){const r=await fetch(f);if(!r.ok)throw new Error('introuvable : '+f);const ab=await r.arrayBuffer();
    return await new Promise((ok,ko)=>ac.decodeAudioData(ab,ok,ko));}
  async function charge(b){
    B=b;temps=60/(b.bpm||120);tour=b.dur;
    C=[];
    for(const c of b.couches){
      const vs=c.variantes||[{v:'A',f:c.f,moteur:0,rms:c.rms}];
      const bufs=[];for(const v of vs)bufs.push(await decode(v.f));
      C.push({c:c,vs:vs,bufs:bufs,on:false,var:0,tChange:-99,gains:[],layer:null,avantBoost:null});
    }
    trBuf=b.transition?await decode(b.transition.f).catch(()=>null):null;
    ruBuf=b.rupture?await decode(b.rupture.f).catch(()=>null):null;
    calmeBuf=b.accalmie?await decode(b.accalmie.f).catch(()=>null):null;
    SQ=b.sequence||null;seqBuf=SQ?await decode(SQ.f):null;
    const extra=C[0].bufs[0].duration-b.dur;deb=extra>.03?Math.min(extra,2112/C[0].bufs[0].sampleRate):0; // l'amorce AAC
    if(seqBuf){const ex=seqBuf.duration-SQ.phrase*nPhrases();SQ.deb=ex>.03?Math.min(ex,2112/seqBuf.sampleRate):0;}
  }
  /* ---------------- LE SÉQUENCEUR (v3, la VILLE : « produis en samplant et en réorganisant ») ----------------
     Le morceau source est livré en PHRASES de 4 mesures (+ une queue), rangées en SECTIONS de niveau 0-4 (+ MONTÉE = 5, la nitro
     tenue). Une phrase démarre toujours sur le temps fort de la grille ; on peut changer de section au MILIEU d'une phrase (après
     2 mesures) en reprenant la nouvelle phrase à la même position : la grille d'accords continue. MONTÉE et SOMMET (une autre
     harmonie) ne s'ouvrent et ne se quittent qu'en fin de phrase. */
  function nPhrases(){let n=0;SQ.sections.forEach(x=>{n=Math.max(n,Math.max.apply(null,x.phrases)+1);});return n;}
  function secDe(niv){return SQ.sections.find(x=>x.niveau===niv)||SQ.sections[0];}
  function libre(sec){return sec.niveau<=3;} // les sections qui partagent la grille FA · RÉ m · LA m · LA m
  function lancePhrase(sec,T,pos,fondu){ // joue la phrase suivante de `sec`, à partir de `pos` secondes dans la phrase, à l'instant T
    const lg=B.dur,q=SQ.queue||.3;sec.k=((sec.k|0)+(pos>0?0:1))%sec.phrases.length;const ph=sec.phrases[sec.k];
    const s=ac.createBufferSource(),g=ac.createGain();s.buffer=seqBuf;s.connect(g);g.connect(seqG);
    g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(1,T+(fondu||.005));
    g.gain.setValueAtTime(1,T+lg-pos);g.gain.linearRampToValueAtTime(0,T+lg-pos+q); // la queue de la phrase fond sous la suivante
    s.start(T,SQ.deb+ph*SQ.phrase+pos,lg-pos+q+.05);
    if(cur&&cur.T0+lg>T){cur.g.gain.cancelScheduledValues(T);cur.g.gain.setValueAtTime(1,T);cur.g.gain.linearRampToValueAtTime(0,T+(fondu||.06));}
    cur={s:s,g:g,sec:sec,T0:T-pos};nivSec=sec.niveau;
  }
  function niveauVoulu(o,mot){
    if(rupt)return 0;
    if(o.nitro&&elan>.7)return 5;                                              // la nitro tenue : la MONTÉE
    const I=.1+.5*Math.min(1.2,vF)+.2*Math.min(1,(o.temps||0)/40)+.15*mot+.4*elan;
    return I<.35?0:I<.55?1:I<.72?2:I<.88?3:4;
  }
  function seqTick(o,mot){
    if(!SQ||!seqBuf)return;
    const now=ac.currentTime,lg=B.dur,hb=lg/2;
    while(prochDemi<now+.35){
      const T=prochDemi,finPhrase=!cur||T>=cur.T0+lg-.01;prochDemi+=hb;
      let niv=niveauVoulu(o,mot);
      if(dropSommet&&finPhrase){niv=4;dropSommet=false;}
      const voulu=secDe(niv);
      if(finPhrase){lancePhrase(voulu,T,0);}
      else if(voulu!==cur.sec&&libre(voulu)&&libre(cur.sec))lancePhrase(voulu,T,hb,.06);  // au milieu : même position, l'harmonie continue
    }
  }
  function seqSaut(niv,T,force){ // un saut IMMÉDIAT (accalmie, relance) à la même position dans la grille, fondu d'un temps
    if(!SQ||!cur)return;const sec=secDe(niv),pos=((T-cur.T0)%B.dur+B.dur)%B.dur;
    if(!force&&(!libre(sec)||!libre(cur.sec)))return;
    lancePhrase(sec,T,pos,temps*.6);
  }
  function eligibles(k,moteur){return C[k].vs.map((v,i)=>i).filter(i=>(C[k].vs[i].moteur||0)<=moteur+1e-6);}
  function joue(){
    stop();t0=ac.currentTime+.05;prochTour=t0+tour;nTour=0;vF=vPic=vPicL=acc=elan=nitroT=0;rupt=false;boost=false;tPrec=0;
    C.forEach(function(L,k){
      L.layer=ac.createGain();L.layer.gain.value=k===0?1:0;L.on=k===0;L.layer.connect(bus);L.var=0;L.gains=[];L.tChange=-99;L.avantBoost=null;
      L.bufs.forEach(function(buf,i){
        const s=ac.createBufferSource(),g=ac.createGain();s.buffer=buf;s.loop=true;s.loopStart=deb;s.loopEnd=deb+tour;
        g.gain.value=i===L.var?1:0;s.connect(g);g.connect(L.layer);s.start(t0,deb);src.push(s);L.gains.push(g);});
    });
    if(calmeBuf){calmeSrc=ac.createBufferSource();calmeSrc.buffer=calmeBuf;calmeSrc.loop=true;calmeSrc.loopStart=deb;calmeSrc.loopEnd=deb+tour;
      calmeSrc.connect(calmeG);calmeSrc.start(t0,deb);calmeG.gain.value=0;} // l'ACCALMIE tourne avec le reste, muette jusqu'à ce qu'on la réveille
    if(seqBuf){seqG=ac.createGain();seqG.connect(bus);cur=null;prochDemi=t0;demi=0;}
    // le souffle : un bruit en boucle, toujours là, muet tant que l'élan dort
    const n=ac.sampleRate*2,nb=ac.createBuffer(1,n,ac.sampleRate),d=nb.getChannelData(0);for(let i=0;i<n;i++)d[i]=alea()*2-1;
    soufSrc=ac.createBufferSource();soufSrc.buffer=nb;soufSrc.loop=true;soufSrc.connect(soufF);soufSrc.start();
    joueOk=true;
  }
  function stop(){src.forEach(s=>{try{s.stop();}catch(e){}});src=[];C.forEach(L=>{if(L.layer)try{L.layer.disconnect();}catch(e){}});
    if(seqG){try{seqG.disconnect();}catch(e){}seqG=null;cur=null;}
    if(soufSrc){try{soufSrc.stop();}catch(e){}soufSrc=null;}if(calmeSrc){try{calmeSrc.stop();}catch(e){}calmeSrc=null;}joueOk=false;}
  function prochain(pas,apres){const n=Math.ceil(((apres||ac.currentTime+.02)-t0)/pas);return t0+n*pas;} // le prochain temps (ou croche, ou mesure)
  function changeVariante(L,i,quand){if(i===L.var)return;L.gains[L.var].gain.setTargetAtTime(0,quand,.04);L.gains[i].gain.setTargetAtTime(1,quand,.02);L.var=i;}
  function couche(L,veut,quand,tau){L.on=veut;L.tChange=quand;L.layer.gain.cancelScheduledValues(quand);L.layer.gain.setTargetAtTime(veut?1:0,quand,tau);}
  function coup(buf,quand,offset,g){if(!buf)return;const s=ac.createBufferSource(),gn=ac.createGain();s.buffer=buf;gn.gain.value=g;s.connect(gn);gn.connect(bus);s.start(quand,offset||0);}
  /* L'ACCALMIE (v2.3, Léo : « la musique ne doit pas se casser, plutôt une belle transition — construire un nouveau son ») :
     la vitesse s'effondre → sur le prochain TEMPS le groove se retire en fondu (≈ un temps), le son se referme doucement, une
     FLORAISON (l'accord du morceau qui s'épanouit) fait le pont, et la partie ACCALMIE (cloches, guitare pincée, sur la même
     grille) prend le relais au-dessus de la nappe. Les couches attendent la relance. */
  function rupture(){
    const quand=prochain(temps);rupt=true;tRupt=quand;relanceA=0;
    C.forEach(function(L,k){if(k>0&&L.on)couche(L,false,quand,temps*.7);});
    coup(ruBuf,quand,0,.55);
    seqSaut(0,quand,true); // le morceau passe à son intro, à la même place dans la grille
    calmeG.gain.cancelScheduledValues(quand);calmeG.gain.setTargetAtTime(1,quand,temps*.8);
    filt.frequency.cancelScheduledValues(quand);filt.frequency.setTargetAtTime(R.ruptFc,quand,.5);
  }
  /* LA RELANCE : la vitesse revient → la montée de la transition démarre tout de suite, son CRASH tombe sur la mesure, et c'est
     sur cette mesure que les couches ont à nouveau le droit d'entrer (le drop). */
  function relance(){
    rupt=false;const mesure=temps*4,av=(B.transition&&B.transition.avance)||mesure;
    let tb=prochain(mesure);if(tb-ac.currentTime<mesure*.5)tb+=mesure;
    const debut=tb-av,now=ac.currentTime+.03;
    if(trBuf)coup(trBuf,Math.max(now,debut),Math.max(0,now-debut),.75);
    relanceA=tb;
    if(SQ)setTimeout(function(){seqSaut(Math.max(2,niveauVoulu(dernier,dernier.moteur||0)),tb);},Math.max(0,(tb-ac.currentTime-.3)*1000)); // le morceau repart sur la mesure, au moins PLEIN
    calmeG.gain.cancelScheduledValues(tb);calmeG.gain.setTargetAtTime(0,tb,temps*.5); // l'accalmie s'efface quand le groove revient
  }
  let dernier={vitesse:0,enVol:false,nitro:false,moteur:0};
  function regle(o){
    if(!joueOk||!B)return;dernier=o;
    const now=ac.currentTime,v=o.vitesse||0,mot=Math.max(0,Math.min(1,o.moteur||0));
    const dt=tPrec?Math.min(.25,Math.max(0,now-tPrec)):0;tPrec=now;
    // 0) LA COURSE : vitesse lissée, pic récent (il redescend de .8/s), accélération, élan
    const vAv=vF;vF+=(v-vF)*Math.min(1,dt*10);
    const aI=dt>0?(vF-vAv)/dt:0;acc+=(aI-acc)*Math.min(1,dt*4);
    vPic=Math.max(vF,vPic-dt*R.picDescend);vPicL=Math.max(vF,vPicL-dt*.2); // le pic rapide (le choc) et le pic lent (l'arrêt progressif)
    if(o.nitro){nitroT+=dt;}else if(nitroAvant){nitroLache=now;}
    if(!o.nitro&&now-nitroLache>R.nitroEnchaine)nitroT=Math.max(0,nitroT-dt*1.5); // relâchée : l'élan reste un instant (nitro ENCHAÎNÉE)
    const eC=o.nitro?Math.min(1,R.nitroElan0+nitroT*R.nitroElanS):Math.min(R.accElanMax,Math.max(0,acc*R.accElanK));
    elan+=(eC-elan)*Math.min(1,dt/(eC>elan?(o.nitro?.35:.8):R.elanRetombe));
    if(nitroAvant&&!o.nitro&&nitroT>R.dropApres&&trBuf&&!rupt){ // la nitro LÂCHÉE après une longue poussée : le CRASH tombe sur le temps
      const av=(B.transition&&B.transition.avance)||temps*4;coup(trBuf,prochain(temps),av,.6);dropSommet=true;}
    nitroAvant=!!o.nitro;
    // la RUPTURE (la vitesse s'effondre) et la RELANCE
    if(!rupt&&now-tRupt>R.ruptPause&&((vPic-vF>R.ruptDelta&&vF<R.ruptSous)||(vF<.08&&vPicL>.3)))rupture();
    else if(rupt&&vF>R.relanceSur&&now-tRupt>.4)relance();
    // l'ÉLAN qui dure : les variantes « chargées » (rythme, arpège) le temps de la poussée
    boostT=elan>R.boostSur?boostT+dt:0;
    if(!boost&&boostT>1){boost=true;const q=prochain(temps*4);C.forEach(function(L){if(L.c.nom==='RYTHME'||L.c.nom==='ARPEGE'){L.avantBoost=L.var;changeVariante(L,L.vs.length-1,q);}});}
    else if(boost&&elan<.3){boost=false;const q=prochain(temps*4);C.forEach(function(L){if(L.avantBoost!=null){changeVariante(L,L.avantBoost,q);L.avantBoost=null;}});}
    // 1) LES COUCHES : décision avec hystérésis, appliquée sur le prochain temps (pas de couche avant la relance)
    C.forEach(function(L,k){
      if(k===0)return;
      const el=eligibles(k,mot);
      const s=L.c.seuil*(1-R.moteurSeuil*mot);
      let veut=L.on;
      const heure=(L.c.temps||0)*(1-R.moteurTemps*mot);
      const parElan=L.c.nom==='ENERGIE'&&elan>R.energieElan;            // la nitro ouvre l'ÉNERGIE même si le moteur ne l'a pas encore débloquée
      if(parElan)veut=true;
      else if(!el.length||(o.temps!=null&&o.temps<heure))veut=false;
      else if(L.on&&s>0&&v<s-R.hyst)veut=false;else if(!L.on&&(s<=0||v>=s+R.hyst))veut=true; // seuil 0 = toujours (si les autres règles le permettent)
      if(L.c.sol&&o.enVol)veut=false;
      if(L.c.nom==='LEAD'&&L.repos&&!o.frenesie&&elan<.5)veut=false;
      if(rupt)veut=false;
      if(L.c.elanMin&&elan<L.c.elanMin&&!parElan)veut=false;           // (v3) une couche que seul l'élan ouvre
      if(SQ&&L.c.niveauMax!=null&&nivSec>L.c.niveauMax)veut=false;      // (v3) une couche réservée aux sections calmes
      if(veut===L.on)return;
      const vite=L.c.sol;
      let quand=prochain(vite&&!veut?temps/2:temps);                    // entrer / sortir : sur le temps ; la grosse caisse coupée en vol : à la croche
      if(veut&&relanceA>now)quand=Math.max(quand,relanceA);              // après une rupture : tout revient SUR la mesure de la relance
      if(!(L.c.sol&&o.enVol)&&!(veut&&relanceA>=quand-.01)&&quand-L.tChange<R.tenue*temps)return; // tenue minimale
      if(veut&&!parElan&&!el.includes(L.var))changeVariante(L,el[0],quand);
      couche(L,veut,quand,temps*(veut?.12:.5));
    });
    // 2) LA FIN DU TOUR : les variantes tournent (anti-lassitude), le lead respire
    if(now+.25>=prochTour){
      const quand=prochTour;prochTour+=tour;nTour++;
      let change=false;const cand=[];
      C.forEach(function(L,k){
        if(L.avantBoost!=null)return;
        const el=eligibles(k,mot);if(el.length<2)return;cand.push(k);
        if(alea()<R.chanceVariante){const autres=el.filter(i=>i!==L.var);changeVariante(L,autres[(alea()*autres.length)|0],quand);change=true;}
      });
      if(!change&&cand.length){const L=C[cand[(alea()*cand.length)|0]],el=eligibles(C.indexOf(L),mot).filter(i=>i!==L.var);if(el.length)changeVariante(L,el[(alea()*el.length)|0],quand);}
      C.forEach(function(L){if(L.c.nom==='LEAD')L.repos=mot<R.leadRespire&&(nTour%2===1);});
    }
    seqTick(o,mot);
    // 3) LE SON QUI SUIT : filtre ← vitesse (sourd à l'arrêt, ouvert lancé), rattrapage, brillance et souffle ← élan
    if(!rupt||now>tRupt+.3){
      const k=Math.max(0,Math.min(1,(vF-.05)/.8)),fc=rupt?R.ruptFc:R.fcBas*Math.pow(R.fcHaut/R.fcBas,Math.pow(k,.7));
      filt.frequency.setTargetAtTime(fc,now,rupt?.4:.12);
    }
    let e=0,E=0;C.forEach(function(L,k){const r=L.vs[L.var].rms||L.c.rms||.05,g=k===0||L.on?1:0;e+=g*r*r;E+=r*r;});
    const mkC=SQ?1:Math.max(1,Math.min(Math.pow(10,R.rattrapageMax/20),Math.sqrt(R.plancher*E/Math.max(e,1e-12))));
    if(Math.abs(mkC-mk)>.01){mk=mkC;mkG.gain.setTargetAtTime(mk,now,.5);}
    aigus.gain.setTargetAtTime(R.nitroBrillance*elan,now,.08);
    soufG.gain.setTargetAtTime(o.nitro?R.souffle*elan*elan:0,now,o.nitro?.1:.25);
    soufF.frequency.setTargetAtTime(500*Math.pow(16,elan),now,.15);
  }
  function palier(moteur){ // un palier moteur : montée d'une mesure puis crash SUR la barre ; les variantes s'enrichissent sur cette barre
    if(!joueOk)return;
    const mesure=temps*4,av=(B.transition&&B.transition.avance)||mesure;
    let tb=prochain(mesure);while(tb-av<ac.currentTime+.05)tb+=mesure;
    coup(trBuf,tb-av,0,.8);
    const mot=moteur!=null?Math.max(0,Math.min(1,moteur)):(dernier.moteur||0); // le moteur APRÈS le palier
    C.forEach(function(L,k){const el=eligibles(k,mot);if(el.length>1&&L.avantBoost==null)changeVariante(L,el[el.length-1],tb);}); // la plus riche débloquée
  }
  function position(){return B?((ac.currentTime-t0)%tour+tour)%tour:0;}
  return{charge:charge,joue:joue,stop:stop,regle:regle,palier:palier,position:position,sortie:bus,
    etat:function(){return{gains:C.map((L,k)=>k===0||L.on?1:0),variantes:C.map(L=>L.vs[L.var].v),noms:C.map(L=>L.c.nom),
      section:cur?cur.sec.nom:null,tour:nTour,rattrapage:+(20*Math.log10(mk)).toFixed(1)+' dB',elan:+elan.toFixed(2),acc:+acc.toFixed(2),rupture:rupt,boost:boost,
      filtre:Math.round(filt.frequency.value)};}};
}
G.MusiqueVitesse=MusiqueVitesse;G.MV_REGLES=MV_REGLES;
})(window);
