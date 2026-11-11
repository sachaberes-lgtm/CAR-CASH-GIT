/* ===== LE NITRO PHYSIQUE ET LES DÉTAILS DE CONDUITE EN JEU (2026-11-10, Sacha : « nitro bien mécanique, flamme, variation en fonction de à quel point on appuie », « il faut que
   plein d'actions soient prises en compte : appui long, appui court, double-tap, drift, virages, vol, les roues dans le vide, la pose, la reprise ») =====
   CE QUE C'EST : un seul AudioWorklet (assets/audio/moteur-vivant/ : nitro-physique.js + details-conduite.js) calé sur la NOTE du moteur du jeu (`P9.fF`, la bûche) :
     · LE NITRO : des coups de flamme cylindre par cylindre dans un tuyau qui chauffe + une voix mécanique. Ce qu'il lit du jeu :
         le RÉSERVOIR      plein = les 8 cylindres crachent ; dans la dernière seconde ils s'éteignent un à un (le nitro TOUSSE avant la panne sèche : on l'entend venir)
         l'appui           un coup bref = un crachat ; un appui tenu = la cascade d'allumage, puis au lâcher le clac de la soupape, la purge et la postcombustion par paquets
         le double-tap     une détonation « ba-BOUM » (aussi, en petit, au mini-turbo d'un drift)
         le vol / la pose  en l'air la flamme perd son grave (plus de sol) ; à la pose elle s'écrase puis repart en surcharge
         le volant, la glisse   la flamme part à l'extérieur du virage, en drift elle se déchire ; les bosses la font tressaillir ; le 2e étage (réserve bleue) la serre
         le passage de rapport   un hoquet de 55 ms puis une grosse bouffée
     · LES DÉTAILS DE CONDUITE (le moteur) : l'aspiration quand on remet les gaz, le coup de gaz court, le chant de l'admission quand le moteur pousse longtemps, les tintements du
       collecteur qui refroidit, les roues libres et le rupteur en vol, le clonc de la transmission à la pose, le transfert de poids et le différentiel en slalom.
   LE BOOST DU JEU RESTE (le coup d'allumage `nitroWhoomp`, le feu qui rugit, le grondement) mais ses couches CONTINUES en bruit baissent à `NPHY.lit` (35 %) quand ce nitro joue —
   ce sont elles que Sacha entend comme « du vent » ; la pétarade et la soupape de fin (rugPetarade, blowOff) laissent la place à la postcombustion du nitro physique.
   LE DRAPEAU : `?nitro=physique` dans l'adresse. SANS LUI RIEN N'EST CHARGÉ ET RIEN NE CHANGE (NPHY.on faux : chaque appel sort tout de suite). Il marche avec la bûche seule
   comme avec le moteur moderne de Léo (`?moteur=buche&nitro=physique` : il entre alors dans SON étage de puissance, donc dans ses coupes anti-fatigue).
   `?details=0` : le nitro sans les détails de conduite. `dbgNPHY()` à la console. Le plan d'origine : atelier-son/nitro-fable/BRANCHEMENT-JEU.txt. */
const NPHY_DRAPEAU=/[?&]nitro=physique\b/.test(location.search);
const NPHY={on:NPHY_DRAPEAU,ok:false,charge:false,node:null,g:null,dest:false,surMB:false,vif:false,msgT:0,vu:0,nit:0,niveau:0,
  niv:.11,det:/[?&]details=0\b/.test(location.search)?0:3,lit:.35,preset:'forge'};
NPHY.envoi=function(o){if(NPHY.node)try{NPHY.node.port.postMessage(o);}catch(e){}};
NPHY.build=function(){
  if(!NPHY.on||NPHY.node||NPHY.charge||!AC||!AC.audioWorklet)return;NPHY.charge=true;
  const A='assets/audio/moteur-vivant/',F=['moteur-vivant.js?v=2','nitro-matiere.js?v=2','nitro-physique.js?v=2','details-conduite.js?v=1','worklet-nitro-physique.js?v=2'];
  let p=Promise.resolve();F.forEach(function(f){p=p.then(function(){return AC.audioWorklet.addModule(A+f);});});
  p.then(function(){
    const n=new AudioWorkletNode(AC,'nitro-physique',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2],processorOptions:{preset:NPHY.preset,details:NPHY.det}});
    const g=AC.createGain();g.gain.value=0;n.connect(g);
    n.port.onmessage=function(e){const d=e.data;if(d&&d.niv!=null&&isFinite(d.niv))NPHY.niveau=d.niv;};
    Object.assign(NPHY,{node:n,g:g,ok:true});NPHY.branche();
    /* le garde-fou : plus de conduite depuis 0,3 s (pause, menu, garage, écran de fin) → coupure nette, sans scène de lâcher */
    setInterval(function(){if(NPHY.ok&&NPHY.vif&&performance.now()-NPHY.vu>300)NPHY.coupe();},150);
  }).catch(function(e){NPHY.on=false;NPHY.ok=false;try{console.warn('nitro physique : sans',e);}catch(_){}});
};
/* la sortie : dans l'étage de puissance du moteur moderne s'il est là (il arrive après, d'où le contrôle à chaque image), sinon droit dans MASTER */
NPHY.branche=function(){
  if(!NPHY.ok)return;const mb=!!(MB.ok&&MB.creux);if(NPHY.dest&&mb===NPHY.surMB)return;
  try{NPHY.g.disconnect();}catch(e){}
  try{NPHY.g.connect(mb?MB.creux:MASTER);NPHY.surMB=mb;NPHY.dest=true;}catch(e){}
};
/* À CHAQUE IMAGE de conduite ou de vol : la note du moteur, la pédale, la charge, la vitesse (0..1), en vol ?, le creux des grands moments */
NPHY.drive=function(dt,hz,thr,charge,vit,air,dk){
  if(!NPHY.ok)return;NPHY.vu=performance.now();NPHY.vif=true;NPHY.branche();
  /* LE RÉSERVOIR S'ENTEND : plein appui tant qu'il reste plus de 0,9 s de nitro, puis les cylindres s'éteignent un à un jusqu'à la panne ; pied levé (drift), la flamme baisse d'un cran */
  const inf=pwrNitroT>0||PARK.on||startBoostT>0,res=inf?9:nitroR+nitroX;
  const p=nitroOn&&mode!=='boom'&&!gameOver?Math.min(1,.38+.62*Math.min(1,res/.9))*(thr||air?1:.85):0;
  stt(NPHY.g.gain,NPHY.niv*dk,AC.currentTime,.03);
  const front=(p>0)!==(NPHY.nit>0);NPHY.nit=p;NPHY.msgT+=dt;
  if(front||NPHY.msgT>.025){NPHY.msgT=0;   /* un front part tout de suite : un coup bref de 80 ms doit s'entendre */
    NPHY.envoi({c:{f0:hz,nit:p,thr:thr?1:0,load:thr?Math.min(1,charge):0,speed:Math.min(1,Math.max(0,vit)),air:air?1:0,vir:air?0:steer,gl:air?0:glisse9,bleu:nitroBlue?1:0}});}
};
/* un geste : 'rapport', 'double' (f), 'pose' (f), 'decolle', 'bosse' (f), 'rate' */
NPHY.ev=function(k,f){if(NPHY.ok&&NPHY.vif)NPHY.envoi(f==null?{ev:k}:{ev:k,f:Math.min(1,Math.max(0,f))});};
/* la coupure nette : pause, mort, menu — rien ne traîne, rien ne reprend au REPRENDRE */
NPHY.coupe=function(){
  if(!NPHY.ok||!NPHY.vif)return;NPHY.vif=false;NPHY.nit=0;NPHY.envoi({c:{nit:0,thr:0,load:0,air:0,vir:0,gl:0},ev:'coupe'});
  try{const g=NPHY.g.gain,T=AC.currentTime;g.cancelScheduledValues(T);g.setTargetAtTime(0,T,.012);g._s9=undefined;}catch(e){}
};
/* `dbgNPHY('vu')` : le niveau (dB RMS sur 85 ms) du nitro + détails, du moteur (gainN) et du MASTER — les analyseurs n'écoutent qu'en dérivation */
window.dbgNPHY=function(q){
  if(q==='vu'){if(!AC||!NPHY.ok)return null;const V=dbgNPHY.V||(dbgNPHY.V={b:new Float32Array(4096)});
    const pose=function(k,n){if(!V[k]&&n){V[k]=AC.createAnalyser();V[k].fftSize=4096;n.connect(V[k]);}},db=function(a){if(!a)return null;a.getFloatTimeDomainData(V.b);let s=0;for(let i=0;i<4096;i++)s+=V.b[i]*V.b[i];return +(10*Math.log10(s/4096+1e-12)).toFixed(1);};
    pose('n',NPHY.g);pose('m',gainN);pose('t',MASTER);return {nitro:db(V.n),moteur:db(V.m),total:db(V.t)};}
  return {on:NPHY.on,ok:NPHY.ok,vif:NPHY.vif,surMoteurModerne:NPHY.surMB,appui:+NPHY.nit.toFixed(2),niveau:+NPHY.niveau.toFixed(4),gain:NPHY.g?+NPHY.g.gain.value.toFixed(4):null,details:NPHY.det};};
