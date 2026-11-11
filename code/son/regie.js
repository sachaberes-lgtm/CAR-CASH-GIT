/* ================= LA RÉGIE (2026-11-11, Sacha : « améliore le son global du jeu. Il n'y a pas de son pour le drift ; le son des virages, on dirait un crissement
   de pneus ; le moteur et la musique, c'est mal mixé […] mets-toi dans la peau d'un sound designer professionnel : chaque action doit avoir un impact, ça joue les
   uns sur les autres […] des variations dans le moteur : qu'on entende qu'il a pris un coup après un atterrissage, après un gros drift, qu'il reparte bizarrement,
   que dans les airs il tourne différemment […] un ensemble plus cohérent ») =================
   MESURÉ AVANT (outils/banc-son/mixage.mjs, la sortie réelle du jeu) : en croisière le moteur sortait ~4 dB AU-DESSUS de la musique, en bourdon continu (65 % de son
   énergie entre 150 et 500 Hz, là où vit le corps du morceau) ; un virage appuyé déclenchait le crissement (la mesure `glisse9` compte la charge latérale) ; et le
   VRAI drift n'avait rien à lui : le même souffle de gomme, un bourdon de charge à −40 dB, et le moteur qui se TAISAIT (gaz coupés pendant la glisse).
   CE QUE FAIT LA RÉGIE — un seul état (`REG`), lu par toutes les chaînes, calculé une fois par image (`regPas`) :
   1. LES PNEUS ont trois voix au lieu d'une : LE ROULEMENT (la route sous les roues, grave ; il se coupe net quand on décolle et revient d'un coup à la pose : c'est
      lui qui fait entendre le sol), L'APPUI (le virage sans glisse : un souffle bas-médium qui gonfle du côté des roues chargées, jamais un crissement) et LA RÂPE
      (le drift : la gomme qui broute, deux résonances basses hachées par un accroche-lâche, plus rauque et plus serrée à mesure que la glisse dure). Le souffle de
      gomme d'avant ne vient plus que dans les vraies glisses.
   2. LE DRIFT A SA SCÈNE : la morsure à l'entrée, la râpe, le moteur qui RESTE en charge et s'envole (les roues patinent : régime haut, rupteur qui tremble), le
      bourdon de charge un cran plus présent, et à la sortie le pneu qui raccroche + le moteur qui a « pris un coup ».
   3. LE MOTEUR VIT : un choc (pose, bosse, sortie de gros drift) le fait PLONGER, tousser (des ratés, des pops), puis REPARTIR en dépassant sa note avant de se
      poser. En l'air il tourne à vide : plus haut, plus creux, il tremble au rupteur.
   4. LE NITRO SE DOSE À LA DURÉE (dans `rugPas`, rendu/stries-vent.js) : un appui bref = un « pof » sec ; tenu, le feu monte, puis CLAQUE par rafales ; au lâcher,
      plus on a tenu, plus la gorge met de temps à s'éteindre et plus les braises crépitent longtemps derrière.
   5. LE MIXAGE SE RÈGLE SEUL : la régie ÉCOUTE le moteur et la musique (deux analyseurs, 5 relevés par seconde) et tient le moteur à `REG_NIV.cible` dB sous le
      morceau qui joue, quel qu'il soit ; il ne passe devant que lorsqu'il PARLE (reprise, drift, choc) — la musique lui ouvre alors un peu plus son creux à 280 Hz.
   6. CHAQUE CHAÎNE ÉCOUTE LES AUTRES : le nitro baisse le roulement et le vent ; le drift baisse le vent ; l'air coupe la route ; les grands moments (`dk`) creusent
      tout ; une file de ramassages s'adoucit d'elle-même (sfx.js : LA DENSITÉ).
   `?regie=0` : tout comme avant. `dbgRegie()` : l'état ; `dbgRegie('force',{drift:1,appui:.8,…})` : forcer une entrée (le banc). Banc : outils/banc-son/mixage.mjs. */
const REG_ON=!/[?&]regie=0\b/.test(location.search);
const REG_NIV={roul:.11,appui:.3,rape:.28,mord:.13,cible:-3,balMin:.3,balMax:1.6,parole:.38,air:1.55,charge:1.6};
const REG={ok:false,sol:0,roul:0,app:0,dr:0,drT:0,drW:false,drMax:0,pan:0,coup:0,c0:0,gate:0,gateT:0,rep:0,pose:0,par:0,bal:.5,pM:0,pS:0,tA:0,musN:null,f:null,popT:0,nRate:0,nCoup:0};
function regBatit(){
  if(!REG_ON||REG.ok||!AC||!MASTER)return;
  const ac=AC,bq=function(t,f,q){const b=ac.createBiquadFilter();b.type=t;b.frequency.value=f;if(q!=null)b.Q.value=q;return b;},
    src=function(buf,r){const s=ac.createBufferSource();s.buffer=buf;s.loop=true;s.playbackRate.value=r||1;s.start();return s;},
    pan=function(){return ac.createStereoPanner?ac.createStereoPanner():ac.createGain();},kr=function(p){try{p.automationRate='k-rate';}catch(e){}};
  /* LE BUS DES PNEUS : les trois voix sortent par un seul gain, qui suit le dosage du moteur (quand la régie baisse le moteur sous un morceau discret, les pneus baissent avec lui : la voiture reste UN objet) */
  const pB=REG.pB=ac.createGain();pB.gain.value=1;pB.connect(MASTER);
  /* LE ROULEMENT : bruit rose → passe-haut 70 Hz (le sub est au moteur) → passe-bas qui s'ouvre avec la vitesse + un filet de grain de route vers 1 kHz */
  {const s=src(pinkBuf(3),.9),hp=bq('highpass',TEL_NATIF?170:70,.6),lp=bq('lowpass',300,.5),gr=bq('bandpass',1050,.8),gg=ac.createGain(),g=ac.createGain();gg.gain.value=.22;g.gain.value=0;
   s.connect(hp);hp.connect(lp);lp.connect(g);hp.connect(gr);gr.connect(gg);gg.connect(g);g.connect(pB);kr(lp.frequency);REG.rG=g;REG.rF=lp;porte(g,pB);}
  /* L'APPUI : bruit rose → une bande large (Q 1,3) entre 320 et 620 Hz, du côté des roues chargées */
  {const s=src(pinkBuf(2),1.13),bp=bq('bandpass',380,1.3),lp=bq('lowpass',1500,.5),g=ac.createGain(),p=pan();g.gain.value=0;
   s.connect(bp);bp.connect(lp);lp.connect(g);g.connect(p);p.connect(pB);kr(bp.frequency);REG.aG=g;REG.aF=bp;REG.aP=p;porte(g,p);}
  /* LA RÂPE : bruit → deux résonances non harmoniques (×1,5) + un fond large → haché par l'accroche-lâche (dent de scie 30-55 Hz) → passe-bas 1,8 kHz.
     Les résonances restent sous 1,3 kHz : c'est la gomme qui broute, pas un sifflet. Une houle lente (5,3 Hz) les fait vivre. */
  {const s=src(noiseBuf(2),1),b1=bq('bandpass',400,4.5),b2=bq('bandpass',600,5.5),b0=bq('bandpass',520,.7),g0=ac.createGain(),am=ac.createGain(),lp=bq('lowpass',1800,.5),g=ac.createGain(),p=pan();
   g0.gain.value=.3;am.gain.value=.55;g.gain.value=0;lp.Q.value=.5;const pre=ac.createGain();pre.gain.value=3; /* les deux résonances sont étroites : elles ne laissent passer qu'un filet du bruit, on le remonte ici (mesuré au banc : −38 dB sans) */
   s.connect(b1);s.connect(b2);s.connect(b0);b0.connect(g0);b1.connect(pre);b2.connect(pre);g0.connect(pre);pre.connect(am);am.connect(lp);lp.connect(g);g.connect(p);p.connect(pB);
   const l=ac.createOscillator(),lg=ac.createGain();l.type='sawtooth';l.frequency.value=34;lg.gain.value=.4;l.connect(lg);lg.connect(am.gain);l.start();kr(l.frequency);
   const w=ac.createOscillator(),wg=ac.createGain(),wg2=ac.createGain();w.type='sine';w.frequency.value=5.3;wg.gain.value=26;wg2.gain.value=41;w.connect(wg);wg.connect(b1.frequency);w.connect(wg2);wg2.connect(b2.frequency);w.start();
   REG.dG=g;REG.dF1=b1;REG.dF2=b2;REG.dL=l;REG.dLg=lg;REG.dP=p;porte(g,p);}
  /* LES OREILLES : le moteur (à sa sortie) et la musique, pondérés : on ne compare que ce qui se MASQUE (au-dessus de 160 Hz) — la basse et la grosse caisse d'un morceau ne couvrent pas le moteur, elles ne doivent pas le faire monter */
  {const hm=bq('highpass',TEL_NATIF?200:160,.7),am=ac.createAnalyser();am.fftSize=2048;engDose.connect(hm);hm.connect(am);REG.anM=am;
   const hs=bq('highpass',TEL_NATIF?200:160,.7),as=ac.createAnalyser();as.fftSize=2048;hs.connect(as);REG.anS=as;REG.hS=hs;REG.buf=new Float32Array(2048);}
  REG.ok=true;
}
function regPw(an){an.getFloatTimeDomainData(REG.buf);let q=0;const b=REG.buf;for(let i=0;i<2048;i++)q+=b[i]*b[i];return q/2048;}
/* un événement de conduite (les points déjà posés pour le nitro physique : pose, bosse, décollage, mini-turbo, rapport) */
function regEv(k,v){
  if(!REG_ON)return;v=+v||0;
  if(k==='pose'){regCoup(Math.max(.18,Math.min(1,v*1.15)));REG.pose=Math.min(1,.45+v);}
  else if(k==='bosse')regCoup(.12+.2*Math.min(1,v));
  else if(k==='double'&&v<1)regCoup(Math.min(.75,.1+v*.75*Math.min(1,REG.drMax/1.4))); /* le mini-turbo : la sortie d'un drift — un long drift secoue plus */
  else if(k==='decolle')REG.pose=0;
}
function regCoup(c){if(c>REG.coup){REG.coup=c;REG.c0=c;REG.nCoup++;}}
{const ev0=NPHY.ev;NPHY.ev=function(k,v){try{regEv(k,v);}catch(e){}return ev0?ev0.apply(NPHY,arguments):undefined;};}
/* une image : les entrées du jeu → l'état → les trois voix des pneus. `spd3` km/h · `dk` le creux des grands moments. */
function regPas(dt,spd3,dk){
  if(!REG_ON||!REG.ok)return;
  const T=AC.currentTime,F=REG.f,vif=running&&started&&!gameOver&&!paused&&mode!=='boom',sol=vif&&mode==='drive'?1:0,v=Math.min(1,spd3/600);
  REG.sol=sol;
  /* la charge latérale (celle qu'aurait le même virage à ×1 : voir aB9, la conduite) et la glisse */
  const aB=sol?Math.abs(yawR/Math.max(1,vitMult())*vA)*SPD:0;
  let kA=sol?Math.max(0,Math.min(1,(aB-10)/60)):0,kD=sol&&driftEnCours?.55+.45*Math.min(1,Math.abs(slipB)/.4):0;
  if(F){if(F.appui!=null)kA=F.appui;if(F.drift!=null)kD=F.drift;}
  REG.app+=(kA-REG.app)*(1-Math.exp(-dt/(kA>REG.app?.09:.2)));
  REG.dr+=(kD-REG.dr)*(1-Math.exp(-dt/(kD>REG.dr?.06:.16)));
  const enDrift=kD>0;
  if(enDrift){REG.drT+=dt;REG.drMax=REG.drT;if(!REG.drW){REG.drW=true;regMord(.6+.4*v);}}
  else{if(REG.drW){REG.drW=false;if(REG.drT>.35)regRaccroche(Math.min(1,REG.drT/1.5));}REG.drT=0;}
  const cote=steer>0?1:steer<0?-1:0;REG.pan+=(cote*-.32*Math.max(REG.app,REG.dr)-REG.pan)*Math.min(1,dt*7); /* les roues chargées sont à l'EXTÉRIEUR du virage */
  /* le choc du moteur : il retombe en 0,5 à 1,4 s selon sa force ; pendant qu'il dure, des ratés ; à la fin, la reprise */
  if(REG.coup>0){const av=REG.coup;REG.coup*=Math.exp(-dt/(.35+.75*REG.c0));
    if(sol&&REG.gate<=0&&REG.coup>.1&&Math.random()<dt*(5+9*REG.coup)){REG.gate=.04+.05*Math.random();REG.nRate++;
      if(T-REG.popT>.22){REG.popT=T;try{const e9=ENG_SND[engLvl<0?0:engLvl]||ENG_SND[0];if(e9.crk>0)crackle(.18+.3*REG.coup);else noiseBurst(.04,.035,700);if(MB.ok&&MB.creuse)MB.creuse(.7);}catch(e){}}}
    if(REG.coup<.1){if(av>=.1&&REG.c0>.3)REG.rep=Math.min(1,REG.c0*1.2);REG.coup=0;}}
  if(REG.gate>0)REG.gate-=dt;
  if(REG.rep>0)REG.rep=REG.rep<.02?0:REG.rep*Math.exp(-dt/.28);
  if(REG.pose>0)REG.pose=REG.pose<.02?0:REG.pose*Math.exp(-dt/.3);
  /* LA PAROLE du moteur (0..1) : quand il a quelque chose à dire, il passe devant et la musique lui ouvre son creux */
  {const p=sol?Math.max(Math.min(1,charge9*1.15-.3),REG.dr*.9,REG.rep,nA*.5):mode==='fall'?.25:0;REG.par+=(p-REG.par)*(1-Math.exp(-dt/(p>REG.par?.12:.45)));}
  /* les trois voix */
  const nit=1-.5*nA,eau=1-.85*JEAU.k,esp=SONV2?1-Math.min(1,LVL.espace):1;
  let gR=sol?REG_NIV.roul*Math.pow(v,.75)*(1+1.1*REG.pose)*nit*(1-.55*REG.dr)*eau*dk:0;if(F&&F.roul!=null)gR=REG_NIV.roul*F.roul;
  stt(REG.rG.gain,gR,T,sol?.07:.045);if(gR>0)stt(REG.rF.frequency,Math.min(760,230+spd3*.55+260*REG.pose),T,.12);
  const gA=REG_NIV.appui*Math.pow(REG.app,1.35)*(.45+.55*v)*(1-.7*REG.dr)*eau*dk*(sol||F?1:0);
  stt(REG.aG.gain,gA<1e-4?0:gA,T,.08);if(gA>1e-4){stt(REG.aF.frequency,320+250*REG.app+Math.min(900,spd3)*.1,T,.1);if(REG.aP.pan)stt(REG.aP.pan,REG.pan,T,.08);}
  const gD=REG_NIV.rape*REG.dr*(.6+.4*v)*eau*esp*dk*(sol||F?1:0),m=Math.min(1,REG.drT/1.6);
  stt(REG.dG.gain,gD<1e-4?0:gD,T,enDrift?.05:.11);
  if(gD>1e-4){const f1=Math.min(640,320+110*REG.dr+Math.min(900,spd3)*.1+50*m);stt(REG.dF1.frequency,f1,T,.08);stt(REG.dF2.frequency,f1*1.5,T,.08);
    stt(REG.dL.frequency,30+16*REG.dr+9*m+Math.min(900,spd3)*.012,T,.1);stt(REG.dLg.gain,.34+.14*m,T,.15);if(REG.dP.pan)stt(REG.dP.pan,REG.pan*1.2,T,.08);}
  regEquilibre(dt,T,sol,dk);
}
/* LA MORSURE : la gomme décroche — un coup de râpe bref qui descend + un petit coup sourd */
function regMord(k){
  if(!sfxOk())return;
  try{const t0=AC.currentTime,s=AC.createBufferSource();s.buffer=noiseBuf(.2);const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=2.2;
    f.frequency.setValueAtTime(1150,t0);f.frequency.exponentialRampToValueAtTime(520,t0+.11);
    const g=AC.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(REG_NIV.mord*k,t0+.008);g.gain.exponentialRampToValueAtTime(.001,t0+.15);
    s.connect(f);f.connect(g);g.connect(MASTER);s.start(t0);s.stop(t0+.18);subBoom(.045*k);}catch(e){}
}
/* LE PNEU RACCROCHE : à la sortie du drift, un « tchip » qui remonte — la gomme reprend la route */
function regRaccroche(k){
  if(!sfxOk())return;
  try{const t0=AC.currentTime,s=AC.createBufferSource();s.buffer=noiseBuf(.14);const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=3;
    f.frequency.setValueAtTime(560,t0);f.frequency.exponentialRampToValueAtTime(980,t0+.07);
    const g=AC.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(REG_NIV.mord*.6*(.5+.5*k),t0+.006);g.gain.exponentialRampToValueAtTime(.001,t0+.1);
    s.connect(f);f.connect(g);g.connect(MASTER);s.start(t0);s.stop(t0+.13);}catch(e){}
}
/* LE RÉGIME vu par la régie (boucle-5, avant le lissage de engRpm) : en drift les roues patinent — le moteur s'envole et tremble au rupteur ;
   un choc le fait plonger ; la reprise dépasse la note */
function regRegime(tgt,t){
  if(!REG_ON||!REG.ok)return tgt;
  if(REG.dr>.05){const m=Math.min(1,REG.drT/1.6);tgt=Math.max(tgt,.78+.1*m)+REG.dr*(.035*Math.sin(t*61)+.02*Math.sin(t*37.3));}
  if(REG.coup>0)tgt*=1-.42*REG.coup;
  if(REG.rep>0)tgt*=1+.09*REG.rep;
  return tgt;
}
/* LES RÉGLAGES DU MOTEUR vus par la régie (après engSndParams) : le choc étouffe et fait trembler, la reprise gonfle le ventre, le drift durcit */
function regMoteur(P9){
  if(!REG_ON||!REG.ok)return;
  const c=REG.coup,r=REG.rep,d=REG.dr;
  if(c>0){P9.lp*=1-.45*c;P9.ev*=1-.3*c;P9.lfoG=Math.min(P9.ev*.9,P9.lfoG*(1+1.6*c));P9.lfoF=Math.max(6,P9.lfoF*(1-.35*c));P9.detune+=30*c;}
  if(r>0){P9.subG*=1+.6*r;P9.mix*=1+.12*r;P9.lp*=1+.18*r;}
  if(d>0){P9.lfoG=Math.min(P9.ev*.9,P9.lfoG*(1+.5*d));P9.lp*=1+.12*d;P9.tickG*=1+.6*d;}
}
/* après engApplique : le RATÉ (un trou de 40 à 90 ms, franc — le lissage du moteur l'aurait gommé) et le dosage de sortie */
function regApres(P9){
  if(!REG_ON||!REG.ok)return;
  if(REG.gate>0)stt(gainN.gain,P9.ev*.2,AC.currentTime,.012);
}
/* EN L'AIR : les roues tournent dans le vide — le moteur chante plus haut et tremble au rupteur (rend [facteur de note, facteur de gain]) */
function regAirNote(t){return REG_ON&&REG.ok?1+.022*Math.sin(t*69)+.012*Math.sin(t*9.4):1;}
function regAirGain(){return REG_ON&&REG.ok?REG_NIV.air:1;}
/* L'ÉQUILIBRE moteur / musique : 5 relevés par seconde ; la puissance du moteur (ramenée à un dosage de 1) et celle de la musique (ramenée au curseur d'usine :
   le curseur MUSIQUE du joueur reste SON réglage, la régie ne le rattrape pas), lissées sur ~2,5 s ; le dosage vise `cible` dB sous la musique, borné. */
function regEquilibre(dt,T,sol,dk){
  const P=window.POUCE_JEU,ch=P&&P.ch,n=ch&&ch.e||null;
  if(n!==REG.musN){try{if(REG.musN)REG.musN.disconnect(REG.hS);}catch(e){}REG.musN=n;REG.pS=0;try{if(n)n.connect(REG.hS);}catch(e){}}
  REG.tA+=dt;
  if(REG.tA>=.2){const d=REG.tA;REG.tA=0;
    if(sol&&dk>.85&&REG.coup<=0){
      const g0=Math.max(.05,engDose.gain.value),pm=regPw(REG.anM)/(g0*g0),k=1-Math.exp(-d/2.5);
      if(pm>1e-9)REG.pM=REG.pM?REG.pM+(pm-REG.pM)*k:pm;
      if(n&&SND.music){const u=Math.max(.05,VOL.mus/.7),ps=regPw(REG.anS)/(u*u);if(ps>1e-8)REG.pS=REG.pS?REG.pS+(ps-REG.pS)*k:ps;}
      if(REG.pM>0&&REG.pS>0){
        /* la sortie du moteur = sa puissance × le bus (+8,2 dB sur les petits signaux, mesuré) × le curseur EFFETS d'usine (VOL.sfx 1 × SFX_SOUS_MUS) */
        const bus=Math.pow(10,8.2/20)*SFX_SOUS_MUS,b=Math.pow(10,REG_NIV.cible/20)*Math.sqrt(REG.pS)/(Math.sqrt(REG.pM)*bus);
        REG.bal+=(Math.max(REG_NIV.balMin,Math.min(REG_NIV.balMax,b))-REG.bal)*(1-Math.exp(-d/1.2));}}
    /* le creux de la musique s'ouvre quand le moteur parle */
    try{const B=ch&&ch.bus;if(B&&B.parole&&Math.abs(REG.par-(REG._pp||0))>.04){REG._pp=REG.par;B.parole(REG.par);}}catch(e){}}
  stt(engDose.gain,MIX_MOTEUR*REG.bal/.71*(1+REG_NIV.parole*REG.par),T,.12);
  stt(REG.pB.gain,Math.max(.55,Math.min(1.7,REG.bal/.6)),T,.3);
}
window.dbgRegie=function(c,o){
  if(c==='force'){REG.f=o||null;return REG.f;}
  if(c==='coup'){regCoup(o==null?.8:+o);return REG.coup;}
  if(c==='niv'){if(o)Object.assign(REG_NIV,o);return REG_NIV;}
  const r=function(x){return x==null?null:+(+x).toFixed(3);};
  return {on:REG_ON,ok:REG.ok,sol:REG.sol,appui:r(REG.app),drift:r(REG.dr),driftT:r(REG.drT),coup:r(REG.coup),reprise:r(REG.rep),pose:r(REG.pose),parole:r(REG.par),
    dosage:r(REG.bal),moteurDb:REG.pM?r(10*Math.log10(REG.pM)):null,musiqueDb:REG.pS?r(10*Math.log10(REG.pS)):null,rates:REG.nRate,coups:REG.nCoup,
    gains:REG.ok?{roul:r(REG.rG.gain.value),appui:r(REG.aG.gain.value),rape:r(REG.dG.gain.value),moteur:r(engDose.gain.value)}:null,force:REG.f};};
/* (le banc) `dbgSonTap()` : les points d'écoute du graphe, pour outils/banc-son/mixage.mjs. */
window.dbgSonTap=function(){let mus=null;try{const P=window.POUCE_JEU;mus=P&&P.ch&&P.ch.e||null;}catch(e){}return {ac:AC,master:MASTER,sortie:MASTER&&MASTER._lim,pneus:REG.pB||null,moteur:typeof engDose!=='undefined'?engDose:null,musique:mus};};
