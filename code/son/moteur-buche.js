/* ===== LE MOTEUR MODERNE EN JEU — « bûche cyber » (2026-11-10, Léo : « dans mon téléphone, le moteur moderne bûche » ; essayé d'abord sur la page
   TEST MOTEUR MODERNE, /jouer/moteur-moderne.html, v1400) =====
   CE QUE C'EST : la BÛCHE (le moteur du jeu : voix-moteur.js, graphe-audio.js) garde TOUT, et reçoit ce qui a plu à Léo sur la page d'essai
   (assets/audio/moteur-buche/) :
     · la MATIÈRE : les coups du moteur vivant, calés sur la note de la bûche, DANS la bûche (engMix) et un peu à l'état brut à côté ;
     · la TEINTE cyber (cœur light-cycle, onduleur à marches, plasma) sous la bûche ;
     · la FICHE BÛCHE de chaque palier (harmoniques, battement, note plus grave au-dessus de 180 Hz : plus de « vent ») — paliers 1 et 2 intacts ;
     · L'ÉTAGE DE PUISSANCE : pousser = plus fort, lâcher = ça retombe, deux coupes anti-fatigue, un creux de 60 ms au passage de rapport ;
     · LA VIE (vie-moteur.js) : la route, le souffle lent, les virages (`steer`), les poses après un saut, les ratés, les rapports qui varient
       et qui accrochent, les lâchers de chaque famille (turbo, rotatif, pulso, réacteur) ;
     · la PLACE dans la musique : le creux du bus (`moteur`) quand le moteur parle.
   LE BOOST n'y entre pas (Léo, 09/11 : « on laisse le boost tel quel ») : celui du jeu, inchangé.
   LE DRAPEAU : `?moteur=buche` dans l'adresse. SANS LUI RIEN N'EST CHARGÉ ET RIEN NE CHANGE (MB.on faux : chaque appel sort tout de suite).
   L'appli de Léo l'allume (app-ios/recette-leo.js : MB_DRAPEAU=true) ; le main et l'appli de Sacha restent sur l'ancien moteur.
   `dbgMB()` à la console. */
const MB_DRAPEAU=location.search.indexOf('moteur=buche')>=0;
const MB={on:MB_DRAPEAU,ok:false,node:null,mG:null,cG:null,puis:null,creux:null,vie:null,lv:0,niv:1,msgT:0,vu:0,KM:8,KC:4,
  seuil:.99,accr:false,air:false,airT:0,pres:0,presT:0};
MB.script=function(src){return new Promise(function(ok,ko){const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s);});};
MB.build=function(){
  if(!MB.on||MB.node||!AC||!AC.audioWorklet||!gainN)return;
  const A='assets/audio/',F=['moteur-vivant/moteur-vivant.js?v=2','moteur-cyber/moteur-cyber.js?v=1','moteur-buche/moteur-buche.js?v=1'];
  let p=Promise.resolve();
  /* les tables et la vie, côté page (fiches, retouche, noteBuche) */
  F.concat(['moteur-buche/vie-moteur.js?v=1']).forEach(function(f){p=p.then(function(){return MB.script(A+f);});});
  /* le processeur, côté audio */
  F.concat(['moteur-buche/worklet-buche.js?v=1']).forEach(function(f){p=p.then(function(){return AC.audioWorklet.addModule(A+f);});});
  p.then(function(){
    const lv=engLvl<0?0:engLvl;
    const n=new AudioWorkletNode(AC,'moteur-buche',{numberOfInputs:0,numberOfOutputs:2,outputChannelCount:[2,2],processorOptions:{palier:lv,div:MB.div(lv)}});
    const mG=AC.createGain();mG.gain.value=0;n.connect(mG,0);mG.connect(engMix);       /* la mécanique entre DANS la bûche */
    const cG=AC.createGain();cG.gain.value=0;n.connect(cG,1);                        /* la teinte et la matière brute, après son filtre */
    const puis=AC.createGain(),creux=AC.createGain(),e1=AC.createBiquadFilter(),e2=AC.createBiquadFilter(),hp=AC.createBiquadFilter();
    e1.type='peaking';e1.frequency.value=3000;e1.Q.value=.8;e1.gain.value=-4;e2.type='highshelf';e2.frequency.value=5500;e2.gain.value=-4;
    hp.type='highpass';hp.frequency.value=28;
    try{gainN.disconnect(MASTER);}catch(e){}
    gainN.connect(puis);cG.connect(puis);puis.connect(creux);creux.connect(e1);e1.connect(e2);e2.connect(hp);hp.connect(MASTER);
    n.port.onmessage=function(e){const d=e.data;if(d&&d.niv!=null&&isFinite(d.niv))MB.niv=d.niv;};
    Object.assign(MB,{node:n,mG:mG,cG:cG,puis:puis,creux:creux,vie:new VieMoteurApi.VieMoteur(1611),ok:true});
    try{engSetTier(lv);}catch(e){}   /* la fiche BÛCHE du palier en cours */
    /* le garde-fou : plus de conduite depuis 0,7 s (menu, pause, garage) → la teinte et la matière se taisent, la bûche reste seule */
    setInterval(function(){if(MB.ok&&performance.now()-MB.vu>700)MB.repos();},250);
  }).catch(function(e){MB.on=false;MB.ok=false;try{console.warn('moteur moderne : la bûche seule',e);}catch(_){}});
};
MB.envoi=function(o){if(MB.node)try{MB.node.port.postMessage(o);}catch(e){}};
MB.fiche=function(lv){return MB.ok?MoteurBucheApi.ficheBuche(ENG_SND,lv):ENG_SND[lv];};
MB.note=function(f){return MB.ok?MoteurBucheApi.noteBuche(f,MB.lv):f;};
MB.div=function(lv){const e=ENG_SND[lv]||ENG_SND[0],h=engGenou((e.i+e.r)*.62),hm=window.MoteurBucheApi?MoteurBucheApi.noteBuche(h,lv):h;return Math.max(1,Math.pow(2,Math.ceil(Math.log2(hm/240))));};
MB.tier=function(lv){MB.lv=lv;if(!MB.ok)return;MB.envoi({palier:lv,div:MB.div(lv)});MB.vie.palier(lv,false);MB.seuil=.99;MB.accr=false;};
/* LE PASSAGE DE RAPPORT : chacun différent (seuil, durée), parfois il ACCROCHE ; rend la durée du passage */
MB.passe=function(){
  const R=MB.vie.rapport();MB.seuil=R.seuil;MB.accr=R.accroche;MB.envoi({ev:'rapport'});MB.creuse(.6);if(R.souffle)MB.rafale(5,.05,.012,1300,500,2.2,.05*.55,.04);
  return R.duree;};
MB.engage=function(e){MB.accr=false;subBoom(.13);noiseBurst(.06,.09,1600);if(e&&e.crk>0)crackle(e.crk*.6);MB.creuse(.5);};
MB.creuse=function(p){if(!MB.ok)return;const T=AC.currentTime,g=MB.creux.gain;g.cancelScheduledValues(T);g.setTargetAtTime(p,T,.006);g.setTargetAtTime(1,T+.06,.03);};
/* LES LÂCHERS DE CHAQUE FAMILLE : le turbo qui souffle, le rotor qui brappe, le pulso qui bégaie, la tuyère qui se vide */
MB.rafale=function(n,dt0,dtR,fq,fqR,Q,vol,dur){if(!sfxOk())return;try{const t0=AC.currentTime;let tt=0;
  for(let i=0;i<n;i++){const src=AC.createBufferSource();src.buffer=noiseBuf(dur+.02);const fl=AC.createBiquadFilter();fl.type='bandpass';fl.Q.value=Q;fl.frequency.value=fq+Math.random()*fqR;
    const g=AC.createGain(),v=vol*(1-i/(n+1));g.gain.setValueAtTime(.0001,t0+tt);g.gain.linearRampToValueAtTime(v,t0+tt+.006);g.gain.exponentialRampToValueAtTime(.001,t0+tt+dur);
    src.connect(fl);fl.connect(g);g.connect(MASTER);src.start(t0+tt);src.stop(t0+tt+dur+.03);tt+=dt0+Math.random()*dtR;}}catch(e){}};
MB.whoosh=function(f){if(!sfxOk())return;try{const t0=AC.currentTime,src=AC.createBufferSource();src.buffer=noiseBuf(1);const fl=AC.createBiquadFilter();fl.type='lowpass';fl.Q.value=.9;
  fl.frequency.setValueAtTime(1300,t0);fl.frequency.exponentialRampToValueAtTime(160,t0+.8);const g=AC.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(.06*f,t0+.05);
  g.gain.exponentialRampToValueAtTime(.001,t0+.9);src.connect(fl);fl.connect(g);g.connect(MASTER);src.start(t0);src.stop(t0+.95);}catch(e){}};
/* AVANT engSndParams : la vie de l'image (le régime et la charge que le SON entend ; la boîte et la physique ne bougent pas) */
MB.avant=function(dt,st){
  if(MB.air){MB.air=false;MB.vie.atterrit(Math.min(1,MB.airT/1.4));MB.airT=0;}   /* LA POSE après un saut */
  const O=MB.vie.pas(dt,st);
  O.rpm=Math.max(0,Math.min(1.08,st.rpm*O.rpmK));O.ch=Math.min(1,st.charge+O.charge);
  return O;};
/* APRÈS engSndParams : la fiche bûche et la vie posées sur les réglages, les événements joués */
MB.apres=function(P9,lv,O,e){
  P9.ev*=1-.42*O.coupe;P9.lfoG=Math.min(P9.ev*.9,P9.lfoG*(1+.3*O.lent2)*(1-.42*O.coupe));P9.lp*=1+.10*O.lent1;P9.subG*=1+.12*O.lent2;
  MoteurBucheApi.retouche(P9,lv,{rpm:O.rpm,charge:O.ch});
  for(let i=0;i<O.evs.length;i++){const v=O.evs[i];
    if(v.k==='rate')MB.creuse(.78);else if(v.k==='pop'){if(e.crk>0)crackle(.2+.3*v.f);else noiseBurst(.03,.04,900);}
    else if(v.k==='glitch')MB.envoi({ev:'glitch',f:v.f});else if(v.k==='flutter')MB.rafale(5,.05,.012,1300,500,2.2,.05*v.f,.04);
    else if(v.k==='brap')MB.rafale(4,.045,.03,280,220,1.4,.13*v.f,.05);else if(v.k==='begaie')MB.rafale(7,.021,.004,120,60,1,.12*v.f,.03);
    else if(v.k==='whoosh')MB.whoosh(v.f);else if(v.k==='crepite')crackle(.25*v.f);}
  return P9;};
/* APRÈS engApplique : l'étage de puissance, la teinte, la mécanique, le processeur ; la place dans la musique */
MB.drive=function(dt,P9,O,thr){
  if(!MB.ok)return;MB.vu=performance.now();const T=AC.currentTime;
  stt(MB.puis.gain,(.80+.45*O.ch+.12*thr)*MB.niv,T,.06);stt(MB.cG.gain,P9.ev*MB.KC,T,.08);stt(MB.mG.gain,MB.KM,T,.05);
  MB.msgT+=dt;if(MB.msgT>.025){MB.msgT=0;MB.envoi({c:{hz:P9.fF,rpmN:Math.min(1.02,O.rpm),thr:thr,load:thr?O.ch:0,boost:nA,rude:O.rude,lent1:O.lent1,lent2:O.lent2}});}
  MB.pres+=((.5+.35*O.ch+.15*thr)-MB.pres)*Math.min(1,dt*4);MB.presT-=dt;
  if(MB.presT<=0){MB.presT=.1;try{const B=(window.POUCE_JEU&&POUCE_JEU.ch&&POUCE_JEU.ch.bus)||(MUS_WA&&MUS_WA.bus);if(B&&B.moteur)B.moteur(MB.pres,5);}catch(e){}}};
/* en VOL (les roues ne touchent rien : la pose se jouera à l'atterrissage) et à la MORT : la teinte et la matière se taisent */
MB.vol=function(enVol,dt){if(!MB.ok)return;if(enVol){MB.air=true;MB.airT+=dt||0;}MB.repos();};
MB.repos=function(){if(!MB.ok)return;const T=AC.currentTime;stt(MB.cG.gain,0,T,.06);stt(MB.mG.gain,0,T,.06);stt(MB.puis.gain,1,T,.1);MB.envoi({c:{thr:0,load:0}});
  if(MB.pres>0){MB.pres=0;try{const B=(window.POUCE_JEU&&POUCE_JEU.ch&&POUCE_JEU.ch.bus)||(MUS_WA&&MUS_WA.bus);if(B&&B.moteur)B.moteur(0,5);}catch(e){}}};
window.dbgMB=function(){return {on:MB.on,ok:MB.ok,palier:MB.lv+1,niv:+MB.niv.toFixed(3),puis:MB.puis?+MB.puis.gain.value.toFixed(3):null,teinte:MB.cG?+MB.cG.gain.value.toFixed(4):null,meca:MB.mG?+MB.mG.gain.value.toFixed(2):null,place:+MB.pres.toFixed(2)};};
