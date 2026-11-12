/* ================= LA RÉGIE (2026-11-11, Sacha : « améliore le son global du jeu. Il n'y a pas de son pour le drift ; le son des virages, on dirait un crissement
   de pneus ; le moteur et la musique, c'est mal mixé […] mets-toi dans la peau d'un sound designer professionnel : chaque action doit avoir un impact, ça joue les
   uns sur les autres […] des variations dans le moteur : qu'on entende qu'il a pris un coup après un atterrissage, après un gros drift, qu'il reparte bizarrement,
   que dans les airs il tourne différemment […] un ensemble plus cohérent ») =================
   MESURÉ AVANT (outils/banc-son/mixage.mjs, la sortie réelle du jeu) : en croisière le moteur sortait ~4 dB AU-DESSUS de la musique, en bourdon continu (65 % de son
   énergie entre 150 et 500 Hz, là où vit le corps du morceau) ; un virage appuyé déclenchait le crissement (la mesure `glisse9` compte la charge latérale) ; et le
   VRAI drift n'avait rien à lui : le même souffle de gomme, un bourdon de charge à −40 dB, et le moteur qui se TAISAIT (gaz coupés pendant la glisse).
   CE QUE FAIT LA RÉGIE — un seul état (`REG`), lu par toutes les chaînes, calculé une fois par image (`regPas`) :
   1. LES PNEUS : LE ROULEMENT (la route sous les roues, un grondement grave sous 500 Hz ; il se coupe net quand on décolle et revient d'un coup à la pose : c'est lui qui fait
      entendre le sol) ; LES VIRAGES sont à LA GOMME QUI CHANTE (Sacha, le même jour, v1457 : une note grave de gomme qui broute — plus aucun bruit filtré, « on dirait du vent ») ;
      LE DRIFT ajoute sous elle SA QUINTE GRAVE (la même gomme, jouée une quinte plus bas, qui entre en 0,2 s et grossit tant qu'on tient) : l'accord dit « drift », la note seule
      dit « virage ». Rien n'est en bruit, rien au-dessus de 1 kHz.
   2. LE DRIFT A SA SCÈNE : la morsure à l'entrée, la quinte grave, le moteur qui RESTE en charge et s'envole (les roues patinent), le bourdon de charge un cran plus présent,
      et à la sortie le pneu qui raccroche + le moteur qui a « pris un coup ».
   3. LE MOTEUR VIT, ET IL NE FATIGUE PLUS (Sacha : « le son du moteur est agaçant, à écouter au long terme ça fait mal aux oreilles, c'est comme une perceuse »). MESURÉ
      (outils/banc-son/fatigue.mjs) : son volume battait à 15 Hz sur toute sa profondeur (le « ronron » : un marteau-piqueur) et une raie pure à 205 Hz sortait 20 dB au-dessus
      du reste (la gorge du conduit posée sur un harmonique tenu). LE VELOURS : le battement ne vit plus qu'aux événements (15 % de profondeur en régime stable, il revient à la
      reprise) ; la note ne tient plus en place (une dérive lente au hasard, ±1,8 %, et deux voix plus écartées : la raie s'élargit en grain) ; la gorge est adoucie ; et
      L'ATTENTION — la technique des jeux de course (Need for Speed Unbound : le moteur devant à l'accélération et aux rapports, en retrait à vitesse tenue ; Burnout : plusieurs
      familles de sons pour ne jamais fixer l'oreille sur une seule) : dès qu'il se passe quelque chose (reprise, rapport, drift, choc, nitro) le moteur passe devant ; 2 s
      sans rien, il recule de ~4 dB et se referme, le roulement et le vent portent la vitesse.
      Un choc (pose, bosse, sortie de gros drift) le fait PLONGER, tousser (des ratés, des pops), puis REPARTIR en dépassant sa note. En l'air il tourne à vide, plus haut.
   4. LE NITRO SE DOSE À LA DURÉE (dans `rugPas`, rendu/stries-vent.js) : un appui bref = un « pof » sec ; tenu, le feu monte, puis CLAQUE par rafales ; au lâcher,
      plus on a tenu, plus la gorge met de temps à s'éteindre et plus les braises crépitent longtemps derrière.
   5. LE MIXAGE SE RÈGLE SEUL : la régie ÉCOUTE le moteur et la musique (deux analyseurs, 5 relevés par seconde) et tient le moteur à `REG_NIV.cible` dB sous le
      morceau qui joue, quel qu'il soit (avant : de +4 dB à −5 dB selon le moment du morceau) ; quand il passe devant (l'attention), la musique lui ouvre un peu plus son creux à 280 Hz.
   6. CHAQUE CHAÎNE ÉCOUTE LES AUTRES : le nitro baisse le roulement et le vent ; le drift baisse le vent ; l'air coupe la route ; les grands moments (`dk`) creusent
      tout ; une file de ramassages s'adoucit d'elle-même (sfx.js : LA DENSITÉ).
   `?regie=0` : tout comme avant. `dbgRegie()` : l'état ; `dbgRegie('force',{drift:1,appui:.8,…})` : forcer une entrée (le banc). Banc : outils/banc-son/mixage.mjs. */
const REG_ON=!/[?&]regie=0\b/.test(location.search);
const REG_NIV={roul:.1,quinte:.035,mord:.11,cible:-4,balMin:.25,balMax:1.6,recul:.62,devant:.56,air:1.35,charge:1.6,ronron:.13};
const REG={ok:false,sol:0,roul:0,app:0,att:0,jit:0,jc:0,jn:0,rpm0:0,nA0:0,dr:0,drT:0,drW:false,drMax:0,pan:0,coup:0,c0:0,gate:0,gateT:0,rep:0,pose:0,par:0,bal:.5,pM:0,pS:0,tA:0,musN:null,f:null,popT:0,nRate:0,nCoup:0};
function regBatit(){
  if(!REG_ON||REG.ok||!AC||!MASTER)return;
  const ac=AC,bq=function(t,f,q){const b=ac.createBiquadFilter();b.type=t;b.frequency.value=f;if(q!=null)b.Q.value=q;return b;},
    src=function(buf,r){const s=ac.createBufferSource();s.buffer=buf;s.loop=true;s.playbackRate.value=r||1;s.start();return s;},
    pan=function(){return ac.createStereoPanner?ac.createStereoPanner():ac.createGain();},kr=function(p){try{p.automationRate='k-rate';}catch(e){}};
  /* LE BUS DES PNEUS : les trois voix sortent par un seul gain, qui suit le dosage du moteur (quand la régie baisse le moteur sous un morceau discret, les pneus baissent avec lui : la voiture reste UN objet) */
  const pB=REG.pB=ac.createGain();pB.gain.value=1;pB.connect(MASTER);
  /* LE ROULEMENT : bruit rose → passe-haut 70 Hz (le sub est au moteur) → deux passe-bas doux qui s'ouvrent avec la vitesse, jamais au-dessus de 520 Hz : un grondement, pas un souffle */
  {const s=src(pinkBuf(3),.9),hp=bq('highpass',TEL_NATIF?170:70,.6),lp=bq('lowpass',260,.5),lp2=bq('lowpass',700,.5),g=ac.createGain();g.gain.value=0;
   s.connect(hp);hp.connect(lp);lp.connect(lp2);lp2.connect(g);g.connect(pB);kr(lp.frequency);REG.rG=g;REG.rF=lp;porte(g,pB);}
  /* LA QUINTE GRAVE DU DRIFT : la boucle de LA GOMME QUI CHANTE (graphe-audio.js), jouée une quinte sous la note des virages → passe-bas 900 Hz. Sans la gomme qui chante
     (`?crisse=souffle|ancien`), pas de quinte : le drift garde sa scène (moteur, morsure, charge). */
  if(GOM.sSrc&&GOM.sSrc.buffer&&!GOM_SOUFFLE&&CRISSE_DOUX){const s=src(GOM.sSrc.buffer,.6),hp=bq('highpass',TEL_NATIF?190:110,.6),lp=bq('lowpass',900,.5),g=ac.createGain(),p=pan();g.gain.value=0;
   s.connect(hp);hp.connect(lp);lp.connect(g);g.connect(p);p.connect(pB);REG.dG=g;REG.dS=s;REG.dP=p;porte(g,p);}
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
  /* L'ATTENTION (0..1) : il se passe quelque chose → le moteur passe devant ; rien depuis ~2 s → il recule. Elle monte en 0,08 s, retombe en 1,6 s. */
  {const dR=Math.abs(engRpm-REG.rpm0)/Math.max(.001,dt);REG.rpm0=engRpm;const nE=nA>REG.nA0+.02?1:0;REG.nA0=nA;
   const a=sol?Math.min(1,Math.max(charge9*1.3-.4,Math.min(1,dR*1.1)-.12,engShiftT>0?1:0,REG.dr,REG.rep,REG.coup>0?1:0,nE?.9:0,0)):mode==='fall'?.5:0;
   REG.att+=(a-REG.att)*(1-Math.exp(-dt/(a>REG.att?.08:1.6)));}
  /* LA DÉRIVE de la note : un cap au hasard toutes les 0,25 à 0,7 s, rejoint lentement — jamais périodique (une note qui ne tient pas en place ne perce pas) */
  {REG.jn-=dt;if(REG.jn<=0){REG.jn=.25+.45*Math.random();REG.jc=(Math.random()*2-1)*.018;}REG.jit+=(REG.jc-REG.jit)*Math.min(1,dt*3.2);}
  /* les voix */
  const nit=1-.5*nA,eau=1-.85*JEAU.k;
  let gR=sol?REG_NIV.roul*Math.pow(v,.75)*(1+1.1*REG.pose+.9*REG.app)*nit*(1-.4*REG.dr)*eau*dk:0; /* il gonfle dans les virages appuyés (jusqu'à +5,5 dB) : c'est lui, grave, qui dit la charge — plus aucune note */if(F&&F.roul!=null)gR=REG_NIV.roul*F.roul;
  stt(REG.rG.gain,gR,T,sol?.07:.045);if(gR>0)stt(REG.rF.frequency,Math.min(520,210+spd3*.4+200*REG.pose+90*REG.app),T,.12);
  if(REG.dG){const m=Math.min(1,REG.drT/1.6),gD=REG_NIV.quinte*REG.dr*(.55+.3*v+.15*m)*(1+.2*(driftLv||0))*eau*dk*(sol||F?1:0);
    stt(REG.dG.gain,gD<1e-4?0:gD,T,enDrift?.07:.14);
    if(gD>1e-4){const r=GOM.sSrc.playbackRate.value||1;stt(REG.dS.playbackRate,r*.6667,T,.12);if(REG.dP.pan)stt(REG.dP.pan,REG.pan,T,.08);}} /* toujours une quinte juste sous la gomme, où qu'elle chante */
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
/* LE RÉGIME vu par la régie (boucle-5, avant le lissage de engRpm) : en drift les roues patinent — le moteur s'envole et sa note ondule ;
   un choc le fait plonger ; la reprise dépasse la note */
function regRegime(tgt,t){
  if(!REG_ON||!REG.ok)return tgt;
  if(REG.dr>.05){const m=Math.min(1,REG.drT/1.6);tgt=Math.max(tgt,.76+.1*m)+REG.dr*.03*Math.sin(t*5.1+1.3*Math.sin(t*1.7));} /* une houle lente du régime (les roues accrochent, lâchent), pas un tremblement rapide */
  if(REG.coup>0)tgt*=1-.42*REG.coup;
  if(REG.rep>0)tgt*=1+.09*REG.rep;
  return tgt;
}
/* LES RÉGLAGES DU MOTEUR vus par la régie (après engSndParams). LE VELOURS d'abord (voir l'en-tête, 3.) : le battement à 15 % en régime stable (il revient avec l'attention,
   à peine plus), la note qui dérive, les deux voix plus écartées, le filtre qui se referme d'un cran quand il ne se passe rien. Puis le choc (il étouffe, il se désaccorde —
   plus de battement ajouté : c'est lui qui faisait la perceuse), la reprise (le ventre gonfle), le drift (plus clair, les cylindres s'entendent). */
function regMoteur(P9){
  if(!REG_ON||!REG.ok)return;
  const c=REG.coup,r=REG.rep,d=REG.dr,a=REG.att;
  P9.lfoG*=REG_NIV.ronron+.07*a;P9.fF*=1+REG.jit;P9.subF*=1+REG.jit;P9.detune+=6;P9.lp*=.8+.2*a;
  if(c>0){P9.lp*=1-.45*c;P9.ev*=1-.3*c;P9.detune+=30*c;}
  if(r>0){P9.subG*=1+.6*r;P9.mix*=1+.12*r;P9.lp*=1+.18*r;}
  if(d>0){P9.lp*=1+.12*d;P9.tickG*=1+.6*d;}
}
/* après engApplique : le RATÉ (un trou de 40 à 90 ms, franc — le lissage du moteur l'aurait gommé) et le dosage de sortie */
function regApres(P9){
  if(!REG_ON||!REG.ok)return;
  if(REG.gate>0)stt(gainN.gain,P9.ev*.2,AC.currentTime,.012);
}
/* EN L'AIR : les roues tournent dans le vide — le moteur chante plus haut, sa note flotte (aucun battement rapide : il fatiguait) */
function regAirNote(t){return REG_ON&&REG.ok?1+REG.jit*2+.02*Math.sin(t*3.3):1;}
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
    try{const B=ch&&ch.bus;if(B&&B.parole&&Math.abs(REG.att-(REG._pp||0))>.04){REG._pp=REG.att;B.parole(REG.att);}}catch(e){}}
  stt(engDose.gain,MIX_MOTEUR*REG.bal/.71*(REG_NIV.recul+REG_NIV.devant*REG.att),T,.14); /* en retrait quand rien ne se passe (−4 dB), devant quand il parle (+1,4 dB) */
  stt(REG.pB.gain,Math.max(.55,Math.min(1.7,REG.bal/.6)),T,.3);
}
window.dbgRegie=function(c,o){
  if(c==='force'){REG.f=o||null;return REG.f;}
  if(c==='coup'){regCoup(o==null?.8:+o);return REG.coup;}
  if(c==='niv'){if(o)Object.assign(REG_NIV,o);return REG_NIV;}
  const r=function(x){return x==null?null:+(+x).toFixed(3);};
  return {on:REG_ON,ok:REG.ok,sol:REG.sol,appui:r(REG.app),drift:r(REG.dr),driftT:r(REG.drT),coup:r(REG.coup),reprise:r(REG.rep),pose:r(REG.pose),attention:r(REG.att),
    dosage:r(REG.bal),moteurDb:REG.pM?r(10*Math.log10(REG.pM)):null,musiqueDb:REG.pS?r(10*Math.log10(REG.pS)):null,rates:REG.nRate,coups:REG.nCoup,
    gains:REG.ok?{roul:r(REG.rG.gain.value),quinte:REG.dG?r(REG.dG.gain.value):null,moteur:r(engDose.gain.value)}:null,force:REG.f};};
/* (le banc) `dbgSonTap()` : les points d'écoute du graphe, pour outils/banc-son/mixage.mjs. */
window.dbgSonTap=function(){let mus=null;try{const P=window.POUCE_JEU;mus=P&&P.ch&&P.ch.e||null;}catch(e){}return {ac:AC,master:MASTER,sortie:MASTER&&MASTER._lim,pneus:REG.pB||null,gomme:GOM.sG||null,moteur:typeof engDose!=='undefined'?engDose:null,musique:mus};};
