/* ===== LE MOTEUR VIVANT EN JEU (2026-10-22, session SON ; Sacha : « c'est bon, intègre le moteur vivant au jeu derrière un drapeau (?moteurvivant=1), l'ancien reste par défaut ») =====
   Le DSP est dans assets/audio/moteur-vivant/ (moteur-vivant.js + worklet-moteur.js, un AudioWorklet) ; l'atelier d'écoute et ses bancs sont dans
   atelier-son/moteur-vivant/ (hors ligne, jamais publié). ICI, seulement le BRANCHEMENT : ce que la boucle sait (régime de la boîte virtuelle, pédale, charge,
   nitro, ducking, rapport en cours) devient les commandes du moteur vivant, et ce qu'il fait entendre prend la place de la chaîne d'oscillateurs.
   · SANS le drapeau : rien n'est chargé, rien ne change, au bit près (MV.on = false : chaque appel ci-dessous sort tout de suite).
   · AVEC : les paliers à PISTONS (0 à 18) chantent avec le moteur vivant ; les turbines et réacteurs (19 à 29) gardent l'ancienne voix (un moteur à
     pistons n'a rien à dire d'un cœur à fusion). Le moteur vivant RÉUSSIT À ENTRER → `MV.use` ; sinon (pas d'AudioWorklet, fichier introuvable) rien ne change.
   · LES TROIS FICHES : V8 croisé (la plupart), 6 en ligne TURBO (paliers 5, 6, 8, 17 : ceux qui avaient un `whine`), PLAT-PLAN aigu (les V10, V12, W12,
     V16, H16, rotatif). LE VIEILLISSEMENT SERT DE LADDER : les quatre premiers paliers sonnent USÉS (santé .40 · .55 · .68 · .78 : ratés, tic des culbuteurs,
     coup de bielle) et le moteur « se répare » en montant — l'épave du début tousse, le palier 5 est rodé.
   · CE QUE LE JEU DONNE : le régime de la boîte virtuelle (engRpm 0..1 → ralenti..rupteur), la pédale (monte en 70 ms, retombe d'un coup : c'est ce qui
     déclenche le crépitement), la charge (`charge9`), le nitro (+4 % de régime), le ducking `dk`. Le passage de rapport COUPE les gaz (`engShiftT`) : le moteur
     vivant y met son « blap » ; les crépitements de l'ancienne chaîne (`crackle`) se taisent pendant ce temps (sinon deux pétarades à chaque rapport).
   · LA MORT (explosion) coupe net ; la SECONDE CHANCE (le moteur perd un palier) lui donne un choc ; le RETOUR en course rallume.
   · LA MUSIQUE : `MUS_WA.bus.moteur(présence)` — la musique s'efface de 3,5 dB à 850 Hz (et 2,5 à 1 800 Hz) pendant que le moteur parle (mesuré : c'est là que
     moteur = musique − 7 dB la couvre). Lissé 250 ms, rendu au silence quand le moteur se tait.
   · RÉGLAGES (adresse) : `?mvg=1.3` le niveau (1 = calé sur musique − 7 dB) · `?mvcreux=0` sans le creux dynamique · `?mvsante=.5` impose la santé (banc).
   · `dbgMV()` : l'état. Pas de coût hors drapeau ; avec, ~2-3 % d'un cœur (mesuré hors ligne : 15× le temps réel). */
const MV={on:/[?&]moteurvivant=1\b/.test(location.search),ok:false,use:false,node:null,hp:null,g:null,nom:'',lv:0,sante:1,etat:'off',rpm:0,niv:0,pres:0,thrS:0,vu:0,msgT:0,carveT:0,mort:false,
  niveau:+((/[?&]mvg=([\d.]+)/.exec(location.search)||[])[1])||1,creux:!/[?&]mvcreux=0\b/.test(location.search),
  santeImp:(/[?&]mvsante=([\d.]+)/.exec(location.search)||[])[1],
  cfg:{v8:{idle:760,redline:6500},flat:{idle:900,redline:8800},l6:{idle:740,redline:7000}}};
MV.nomDe=function(lv){return lv>18?null:(lv===5||lv===6||lv===8||lv===17)?'l6':(lv>=12)?'flat':'v8';};
MV.envoi=function(o){if(MV.node)try{MV.node.port.postMessage(o);}catch(e){}};
/* le palier a changé (engSetTier) : la fiche, et la santé (l'épave du début) */
MV.tier=function(lv){
  if(!MV.on)return;MV.lv=lv;const nom=MV.nomDe(lv);MV.sante=MV.santeImp!=null?+MV.santeImp:[.40,.55,.68,.78][lv]||1;
  MV.use=!!nom&&MV.ok;if(!nom)return;
  if(nom!==MV.nom){MV.nom=nom;MV.envoi({moteur:nom});}
};
MV.build=function(){
  if(!MV.on||MV.node||!AC||!AC.audioWorklet)return;
  const B='assets/audio/moteur-vivant/',v='?v=2';
  AC.audioWorklet.addModule(B+'moteur-vivant.js'+v).then(function(){return AC.audioWorklet.addModule(B+'worklet-moteur.js'+v);}).then(function(){
    const n=new AudioWorkletNode(AC,'moteur-vivant',{outputChannelCount:[2],processorOptions:{moteur:MV.nom||'v8'}});
    const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=TEL_NATIF?150:55;hp.Q.value=.7; /* le coupe-bas du moteur : le grave est à la musique (téléphone : le haut-parleur ne le rend pas) */
    const g=AC.createGain();g.gain.value=0;n.connect(hp);hp.connect(g);g.connect(MASTER);
    n.port.onmessage=function(e){const d=e.data;MV.rpm=d.rpm;MV.etat=d.etat;MV.niv=d.niv;};
    MV.node=n;MV.hp=hp;MV.g=g;MV.ok=true;MV.envoi({ev:'allume'});MV.tier(MV.lv);
    /* le garde-fou : plus aucune commande depuis 0,7 s (menu, pause, onglet caché) → le moteur se tait et la musique reprend sa place */
    setInterval(function(){if(MV.g&&performance.now()-MV.vu>700){MV.g.gain.setTargetAtTime(0,AC.currentTime,.08);MV.envoi({c:{thr:0,load:0}});MV.creuse(0);}},250);
  }).catch(function(e){MV.on=false;MV.use=false;try{console.warn('moteur vivant : repli sur l\'ancien moteur',e);}catch(_){}});
};
/* la musique recule là où le moteur parle (musique-bus.js, `moteur`) */
MV.creuse=function(p){
  MV.pres+=(p-MV.pres)*.25;if(!MV.creux)return;const t=performance.now();if(t-MV.carveT<100)return;MV.carveT=t;
  try{if(musWaTient()&&MUS_WA.bus&&MUS_WA.bus.moteur)MUS_WA.bus.moteur(MV.pres);}catch(e){}
};
/* UNE IMAGE de conduite : appelée par la boucle (au sol : engRpm de la boîte ; en l'air : la roue libre). `fall` : le moteur emballé en vol, plus discret. */
MV.drive=function(dt,rpmN,thr,charge,nA,dk,fall){
  if(!MV.on||!MV.ok||!MV.use||!AC)return;
  const C=MV.cfg[MV.nom];if(!C)return;
  if(MV.mort){MV.mort=false;MV.envoi({ev:'allume'});}
  MV.vu=performance.now();
  /* l'ancienne chaîne se tait : seule sa « mix » (oscillateurs, sub, souffle, tic) ; la boîte, le pont et le frein moteur restent */
  try{stt(engMix.gain,0,AC.currentTime,.05);}catch(e){}
  MV.thrS=thr>MV.thrS?Math.min(thr,MV.thrS+dt*14):thr; /* monte en 70 ms, retombe d'un coup : le lâcher doit CLAQUER */
  const ld=MV.thrS>.05?Math.min(1,charge):0;
  if(MV.vu-MV.msgT>25){MV.msgT=MV.vu;MV.envoi({c:{rpmCmd:C.idle+Math.min(1.02,rpmN)*(C.redline-C.idle)*(1+.04*nA),thr:MV.thrS,load:ld,health:MV.sante}});}
  const gv=MV.niveau*dk*(fall?.7:1);
  MV.g.gain.setTargetAtTime(gv,AC.currentTime,.05);
  MV.creuse(Math.max(0,Math.min(1,(MV.niv*gv-.008)/.06)));
};
/* le moteur se tait : `net` = la mort (explosion), sinon un fondu de 0,1 s (le nitro en l'air, la pose) */
MV.mute=function(net){
  if(!MV.on||!MV.ok||!MV.g)return;
  if(net&&!MV.mort){MV.mort=true;MV.envoi({ev:'coupe'});}
  MV.g.gain.setTargetAtTime(0,AC.currentTime,net?.03:.1);MV.creuse(0);
};
MV.coup=function(f){if(MV.on&&MV.ok)MV.envoi({ev:'coup',a:f});};
window.dbgMV=function(){return {on:MV.on,ok:MV.ok,use:MV.use,fiche:MV.nom,palier:MV.lv,sante:MV.sante,etat:MV.etat,rpm:Math.round(MV.rpm),niv:+(MV.niv||0).toFixed(4),gain:MV.g?+MV.g.gain.value.toFixed(3):null,presence:+MV.pres.toFixed(2),niveau:MV.niveau};};
