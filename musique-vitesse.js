/* LA MUSIQUE QUI SUIT LA VITESSE (2026-10-01, Léo : « qu'au début, quand c'est lent, on ait quelques notes — mélodieux,
   harmonieux — puis que la musique évolue en parallèle de la vitesse de la voiture »).
   ----------------------------------------------------------------------------------------------------------------------
   Module AUTONOME (aucune globale du jeu) : utilisé tel quel par boucles.html, prêt à être branché dans index.html.
   Une boucle livrée en COUCHES (stems — voir atelier-son/boucles.py, COUCHES) : toutes jouent EN MÊME TEMPS, calées à
   l'échantillon, et chacune monte quand la vitesse passe son SEUIL. La couche 1 est toujours harmonique (nappe, accords,
   cloches) : à l'arrêt on entend la couleur du morceau, jamais un tambour seul.

   const mv = MusiqueVitesse(ac, sortie);          // ac = AudioContext, sortie = un nœud (ou ac.destination)
   await mv.charge(boucle);                        // boucle = { dur, couches:[{nom,f,seuil,sol,rms}] } (boucles-donnees.js)
   mv.joue();  mv.stop();
   mv.regle({ vitesse: v, enVol: bool, nitro: bool });   // à chaque image : v = vitesse / vitesse de croisière (0 … 1,3)
   mv.etat()  → { gains:[…], rattrapage }

   LES RÈGLES (réglables dans MV_REGLES) :
   · une couche s'ouvre sur une petite rampe autour de son seuil (± `rampe`) : pas d'interrupteur, un fondu ;
   · elle MONTE vite (τ `monte`) et REDESCEND lentement (τ `descend`) : un coup de frein ne coupe pas la musique net,
     une accélération se sent tout de suite ;
   · EN VOL, les couches `sol` (la grosse caisse) se taisent : on flotte — et elles RETOMBENT à la pose (le drop) ;
   · RATTRAPAGE : quand peu de couches jouent, le tout est remonté (jusqu'à +`rattrapageMax` dB) vers `plancher` de
     l'énergie du morceau complet — sinon la nappe seule, enfouie sous la batterie au mixage, ne s'entendrait pas ;
   · NITRO : un peu de brillance (+`nitroBrillance` dB d'aigus) par-dessus le tout. */
(function(G){
'use strict';
const MV_REGLES={rampe:.07,monte:.3,descend:1.1,plancher:.45,rattrapageMax:14,nitroBrillance:4};
function lisse(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
/* le calcul PUR (testable sans audio) : les gains voulus des couches pour un état de course */
function cibles(couches,vitesse,enVol,R){
  R=R||MV_REGLES;
  return couches.map(function(c,i){
    if(i===0)return 1;
    if(enVol&&c.sol)return 0;
    return lisse(c.seuil-R.rampe,c.seuil+R.rampe,vitesse);
  });
}
function rattrapage(couches,g,R){
  R=R||MV_REGLES;let e=0,E=0;
  for(let i=0;i<couches.length;i++){const r=couches[i].rms||.05;e+=g[i]*g[i]*r*r;E+=r*r;}
  const k=Math.sqrt(R.plancher*E/Math.max(e,1e-12));
  return Math.max(1,Math.min(Math.pow(10,R.rattrapageMax/20),k));
}
function MusiqueVitesse(ac,sortie){
  const R=MV_REGLES;
  const bus=ac.createGain(),aigus=ac.createBiquadFilter();
  aigus.type='highshelf';aigus.frequency.value=3200;aigus.gain.value=0;
  bus.connect(aigus);aigus.connect(sortie||ac.destination);
  let boucle=null,bufs=[],deb=0,srcs=[],gains=[],g=[],cible=[],mk=1,t0=0;
  async function charge(b){
    boucle=b;g=b.couches.map((c,i)=>i?0:1);cible=g.slice();
    bufs=[];
    for(const c of b.couches){const r=await fetch(c.f);if(!r.ok)throw new Error('couche introuvable : '+c.f);
      const ab=await r.arrayBuffer();bufs.push(await new Promise((ok,ko)=>ac.decodeAudioData(ab,ok,ko)));}
    // l'AAC porte ~2 112 échantillons d'amorce que tous les décodeurs ne retirent pas
    const extra=bufs[0].duration-b.dur;deb=extra>.03?Math.min(extra,2112/bufs[0].sampleRate):0;
  }
  function joue(quand){
    stop();t0=(quand||ac.currentTime)+.03;
    srcs=bufs.map(function(buf,i){
      const s=ac.createBufferSource(),gn=ac.createGain();s.buffer=buf;s.loop=true;s.loopStart=deb;s.loopEnd=deb+boucle.dur;
      gn.gain.value=g[i]*mk;s.connect(gn);gn.connect(bus);s.start(t0,deb);gains[i]=gn;return s;});
  }
  function stop(){srcs.forEach(function(s){try{s.stop();}catch(e){}});srcs=[];gains=[];}
  let tPrec=0;
  function regle(o){
    if(!boucle)return;
    const now=ac.currentTime,dt=Math.min(.1,Math.max(0,now-(tPrec||now)));tPrec=now;
    cible=cibles(boucle.couches,o.vitesse||0,!!o.enVol,R);
    for(let i=0;i<g.length;i++){const tau=cible[i]>g[i]?R.monte:R.descend;g[i]+=(cible[i]-g[i])*(1-Math.exp(-dt/tau));}
    const mkC=rattrapage(boucle.couches,g,R);mk+=(mkC-mk)*(1-Math.exp(-dt/.4));
    for(let i=0;i<gains.length;i++)gains[i].gain.setTargetAtTime(g[i]*mk,now,.03);
    aigus.gain.setTargetAtTime(o.nitro?R.nitroBrillance:0,now,.08);
  }
  function position(){return boucle?((ac.currentTime-t0)%boucle.dur+boucle.dur)%boucle.dur:0;}
  return{charge:charge,joue:joue,stop:stop,regle:regle,position:position,sortie:bus,
    etat:function(){return{gains:g.map(x=>+x.toFixed(2)),cibles:cible.slice(),rattrapage:+(20*Math.log10(mk)).toFixed(1)+' dB'};}};
}
G.MusiqueVitesse=MusiqueVitesse;G.MV_REGLES=MV_REGLES;G.MV_cibles=cibles;G.MV_rattrapage=rattrapage;
})(window);
