/* LA FANFARE DE PALIER — quatre notes qui MONTENT, en cloche.
   ⚠ POURQUOI DES CLOCHES ET PAS UNE NAPPE. Une récompense doit s'entendre par-dessus un moteur
   à plein régime et du vent : il lui faut de l'ATTAQUE et des aigus, pas du corps — c'est le
   registre que la mécanique du jeu n'occupe pas. Chaque note = une sinusoïde fondamentale plus
   une partielle INHARMONIQUE à 2,76× : c'est ce rapport non entier qui fait « cloche » et non
   « orgue » (le même truc que les clanks de tôle du montage).
   ⚠ ET ÇA MONTE. Un accord plaqué dirait « c'est arrivé » ; un arpège ASCENDANT dit « tu es
   monté d'un cran », ce qui est exactement l'information. */
function engFan9(t0){
  if(!sfxOk())return;
  try{
    const NOTES=[noteP(0,1),noteP(2,1),noteP(3,1),noteP(5,1)];   // mi - sol# - si - mi : le plus lisible qui soit, dans la tonalité des pièces
    for(let k=0;k<NOTES.length;k++){
      const t=t0+k*.082, der=(k===NOTES.length-1), dur=der?1.05:.42;
      for(let h=0;h<2;h++){                       // h=0 la fondamentale, h=1 la partielle de cloche
        const o=AC.createOscillator(),g=AC.createGain();
        o.type='sine';o.frequency.setValueAtTime(NOTES[k]*(h?2.76:1),t);
        const v=(h?.030:.085)*(der?1.25:1);
        g.gain.setValueAtTime(0,t);
        g.gain.linearRampToValueAtTime(v,t+.008);  // attaque quasi nulle : c'est ça, un percuté
        g.gain.exponentialRampToValueAtTime(.0008,t+dur*(h?.55:1));
        o.connect(g);g.connect(MASTER);o.start(t);o.stop(t+dur+.05);
      }
    }
    // le SCINTILLEMENT : un souffle très filtré haut, qui traîne derrière la dernière note. Il ne
    // s'entend pas tout seul, il fait juste durer l'éclat une demi-seconde de plus.
    const n=AC.createBufferSource(),nb=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate),d=nb.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
    n.buffer=nb;
    const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=5200;bp.Q.value=1.4;
    const ng=AC.createGain();ng.gain.setValueAtTime(.055,t0+.20);
    ng.gain.exponentialRampToValueAtTime(.0006,t0+.80);
    n.connect(bp);bp.connect(ng);ng.connect(MASTER);n.start(t0+.20);
  }catch(e){}
}
function subBoom(vol){ // basse sourde d'impact
  if(!sfxOk())return;
  /* ⚠ LES COUPS SOURDS NE S'EMPILENT PAS (2026-09-25). Une pose de MONSTRE ×3 lançait QUATRE sinus 90→34 Hz à la même milliseconde
     (thud de pose, landBoom, son thud, rewardSfx) : même onde, même départ → les amplitudes s'ADDITIONNAIENT (.82 de crête) et le
     compresseur du bus écrasait de ~9 dB la première note du carillon — pour un grave qu'un haut-parleur de téléphone ne joue même
     pas. Dans une fenêtre de 60 ms on ne joue que l'EXCÉDENT sur le plus gros coup déjà parti. */
  {const t9=AC.currentTime;
   if(t9-subBoom._t<.06){if(vol<subBoom._v+.02)return;vol-=subBoom._v;subBoom._v+=vol;}
   else{subBoom._t=t9;subBoom._v=vol;}}
  try{
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='sine';o.frequency.setValueAtTime(TEL_NATIF?190:90,AC.currentTime); // (2026-09-26) sur téléphone, 90→34 Hz ne sortait pas du haut-parleur
    o.frequency.exponentialRampToValueAtTime(TEL_NATIF?80:34,AC.currentTime+.26);
    g.gain.setValueAtTime(TEL_NATIF?vol*.6:vol,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.3);
    o.connect(g);g.connect(MASTER);o.start();o.stop(AC.currentTime+.32);
  }catch(e){}
}
const thud=v=>{duckT=Math.max(duckT,Math.min(.7,v*.05));if(SONV2){sfx('pose.choc',{vol:Math.min(8,-10+v*.9)});return;}noiseBurst(.28,Math.min(.5,.14+v*.012),260+v*10);subBoom(Math.min(.28,.08+v*.009));}; // un choc creuse le mix : l'impact se SENT
const whoosh=()=>noiseBurst(.55,.11,650);
function heartBeat(){ // la mallette est lourde : le cœur du pilote cogne — toum-toum sourd
  if(!sfxOk())return;
  try{
    const t0=AC.currentTime;
    for(const [d9,v9] of [[0,.15],[.14,.10]]){
      const o=AC.createOscillator(),g=AC.createGain();
      o.type='sine';o.frequency.setValueAtTime(TEL_NATIF?128:58,t0+d9);o.frequency.exponentialRampToValueAtTime(TEL_NATIF?84:38,t0+d9+.1); // téléphone : le cœur doit s'entendre
      g.gain.setValueAtTime(.0001,t0+d9);g.gain.linearRampToValueAtTime(v9,t0+d9+.015);
      g.gain.exponentialRampToValueAtTime(.001,t0+d9+.16);
      o.connect(g);g.connect(MASTER);o.start(t0+d9);o.stop(t0+d9+.2);
    }
  }catch(e){}
}
/* LA GAMME DES PIÈCES (2026-09-25, « retravaille le sound design, que ce soit vraiment jouissif de conduire »).
   Une ligne de pièces JOUE une mélodie qui monte. Avant, le ding montait d'un demi-ton par pièce : une gamme
   CHROMATIQUE, qui sonne comme une alarme qui s'affole. Ici la PENTATONIQUE MAJEURE — aucune note ne peut sonner faux,
   ni avec celle d'avant ni avec la musique. Le combo (fenêtre de 3 s) EST la portée : lâche la ligne et la mélodie
   repart d'en bas. C'est ce qui donne envie de ne plus la lâcher (le même ressort que les anneaux d'un hérisson bleu). */
const GAMME_P=[0,2,4,7,9,12,14,16,19,21,24];
// (2026-10-14, session SON) au-delà du sommet (+24), la série ne rejoue plus la même note : elle redescend et remonte l'octave haute (aller-retour, période 10)
/* (2026-09-25) UNE SEULE LANGUE pour toute la famille des récompenses : les pièces étaient en mi pentatonique, mais le FLOW jouait en
   do/ré/mi/sol majeur, le frôlé une gamme par tons, la chaîne du chromatique, l'échelle des tons depuis la5, le drift la/ré/sol…
   Or ces sons se SUPERPOSENT sans arrêt (ligne de pièces + slalom + palier de FLOW) : pièce n°3 (sol#5) contre l'accord de do du FLOW
   = une seconde mineure qui bat à 47 Hz. Tout passe maintenant par noteP : mi pentatonique majeure, dans les registres d'avant. */
const TON=330; // mi4 : la tonique EXACTE des pièces (660) et de rewardSfx (660/990/1320)
function noteP(i,oct){return TON*Math.pow(2,GAMME_P[Math.max(0,Math.min(GAMME_P.length-1,i|0))]/12+(oct||0));}
const FLOW_ACC=[null,[0,2,3],[1,3,5],[2,4,6],[3,5,7]]; // mi majeur · fa#-si-mi · sol#-do#-fa# · si-mi-si : la basse monte d'un degré par palier
/* (2026-10-15, Sacha : « quand on roule, plein de ding-ding-ding-ding, c'est insupportable ; les pièces un peu moins fort, un petit tchic
   grave ») LA LIGNE DE PIÈCES TIENT DANS UNE OCTAVE : elle montait de deux octaves (GAMME_P, jusqu'à +24 : mi7, 2,6 kHz) puis restait en
   haut. Elle monte maintenant de mi4 à mi5 (SON_PG : six pièces), puis va et vient en haut de l'octave (SON_PG_AR) ; la pièce elle-même est
   le « tchic » grave de la banque (recettes.js, LA PIÈCE v2) et sonne 5 dB plus bas (vol 0, la RÉCOLTE aussi). GAMME_P reste aux anciens sons de repli. */
const SON_PG=[0,2,4,7,9,12],SON_PG_AR=[9,7,9,12];
function blip(){
  if(SONV2){if(!sfxOk())return;const k9=Math.max(0,combo-1),st9=k9<SON_PG.length?SON_PG[k9]:SON_PG_AR[(k9-SON_PG.length)%SON_PG_AR.length];
    // (2026-10-14, session SON) toutes les 10 pièces d'affilée, le PALIER : la quinte de la note (st−5, une octave sous st+7 : reste sous la base haute), −7 dB, 30 ms après.
    // Jouée AVANT la pièce et seulement si la pièce passera son délai minimal (cd .018, chronométré ici) : on ne double jamais une pièce avalée
    try{if(combo>0&&combo%10===0&&AC.currentTime-(blip._t||-1)>=.018)sfx('piece',{st:st9-5,vol:-7,t:.03});}catch(e){} /* (2026-10-15) −7 : toujours 7 dB sous la pièce */
    if(sfx('piece',{st:st9,vol:0}))try{blip._t=AC.currentTime;}catch(e){} /* (2026-10-12, Léo : « quand je vais sur une pièce, je l'entends pas forcément ») +4 dB : sous GLISSE elles se perdaient — (2026-10-15, Sacha : « les pièces, un peu moins fort ») vol 0 : −35 en sortie (−30 avant), sous les figures (−32 à −25) */if(combo>0&&combo%5===0)sfx('piece.recolte',{vol:0});return;} // (console de son) // (2026-10-14, session SON) RÉCOLTE +4 comme la pièce : à −35 elle passait 5 dB SOUS la pièce (−30) qu'elle couronne (mesures.txt)
  if(!sfxOk())return;
  try{
    const k=Math.max(0,combo-1),st=GAMME_P[Math.min(k,GAMME_P.length-1)],f=660*Math.pow(2,st/12);
    const t0=AC.currentTime,v=.085*(1-.3*st/24); // l'aigu s'entend plus fort à volume égal : on le tempère en montant
    const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(v,t0+.004);g.gain.exponentialRampToValueAtTime(.001,t0+.2);
    o.connect(g);g.connect(MASTER);o.start(t0);o.stop(t0+.22);
    const o2=AC.createOscillator(),g2=AC.createGain();o2.type='triangle';o2.frequency.value=f*2; // l'octave, brève : le MÉTAL de la pièce
    g2.gain.setValueAtTime(.0001,t0);g2.gain.exponentialRampToValueAtTime(v*.4,t0+.003);g2.gain.exponentialRampToValueAtTime(.001,t0+.09);
    o2.connect(g2);g2.connect(MASTER);o2.start(t0);o2.stop(t0+.11);
    if(combo>0&&combo%5===0){chimeNote(f*1.5,.07,.06,.3);sparkle(.05,.07);} // la RÉCOLTE (toutes les 5) : une quinte en écho
    else if(k>=GAMME_P.length-1)sparkle(0,.035);                            // tout en haut de la gamme : la poussière d'or
  }catch(e){}
}
/* LE FWOOSH (2026-09-25) — remplace un simple carré qui glissait de 220 à 880 Hz (un bip de console, pas une poussée).
   Trois couches qui se complètent : le SOUFFLE qui monte (bruit balayé vers l'aigu : on fend l'air), le COUP DE
   POITRINE (sous-grave : on est poussé dans le siège), et une note qui DÉCOLLE de deux octaves (l'élan). `k` dose la
   force : 1 = pad turbo / pouvoir / catapulte, jusqu'à ~2 = ULTRA TURBO et FRÉNÉSIE. */
/* LES POUVOIRS ONT LEUR SIGNATURE (2026-09-26, audit son) : ils se ramassaient avec le souffle d'un pad et s'éteignaient en silence.
   Deux notes à eux par-dessus le souffle (dans la tonalité), et une tierce qui descend quand le minuteur s'épuise. */
const PWR_NOTE={n:[2,5],a:[4,7],v:[3,6],m:[0,4],x:[4,9]}; // (2026-09-28, pouvoirs v2) m aimant · x aura ×2
function pwrPrisSnd(k){if(SONV2){sfx(window.CCSON.existe('pwr.'+k)?'pwr.'+k:'pwr.autre');return;}const N=PWR_NOTE[k]||PWR_NOTE.n;try{chimeNote(noteP(N[0],1),.05,.1,.22);chimeNote(noteP(N[1],1),.13,.1,.32);}catch(e){}}
function pwrFinSnd(k){if(SONV2){sfx('pwr.fin');return;}try{chimeNote(noteP(5,1),0,.07,.18);chimeNote(noteP(2,1),.1,.07,.28);}catch(e){}}
function boostSnd(k){
  if(!sfxOk())return;k=k||1;
  try{
    const t0=AC.currentTime,vr=.94+Math.random()*.12; // ±6 % : pads, pouvoirs, portail et mini-turbo ne sonnent plus comme un seul sample en boucle
    const src=AC.createBufferSource();src.buffer=noiseBuf(.5);
    const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=1.1;
    f.frequency.setValueAtTime(380*vr,t0);f.frequency.exponentialRampToValueAtTime(3200*vr,t0+.32);
    const g=AC.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(Math.min(.32,.15*k),t0+.05);g.gain.exponentialRampToValueAtTime(.001,t0+.46);
    src.connect(f);f.connect(g);g.connect(MASTER);src.start(t0);src.stop(t0+.5);
    subBoom(Math.min(.3,.11*k));
    const o=AC.createOscillator(),go=AC.createGain();o.type='triangle';
    o.frequency.setValueAtTime(196*vr,t0);o.frequency.exponentialRampToValueAtTime(784*vr,t0+.28);
    go.gain.setValueAtTime(.0001,t0);go.gain.exponentialRampToValueAtTime(Math.min(.09,.045*k),t0+.03);go.gain.exponentialRampToValueAtTime(.001,t0+.34);
    o.connect(go);go.connect(MASTER);o.start(t0);o.stop(t0+.36);
    duckT=Math.max(duckT,Math.min(.5,.2*k)); // le mix s'écarte une fraction de seconde : la poussée passe DEVANT
  }catch(e){}
}
/* LA CHARGE DU DRIFT s'ENTEND (2026-09-25). Les étincelles changeaient de couleur, le son ne disait rien entre deux
   « ting ». Désormais un « brrrr » tient tout le drift : deux carrés à la quinte, passe-bas, trémolo — il MONTE en
   hauteur, en éclat et en vitesse de trémolo à chaque niveau (bleu → or → rose). On sait, sans regarder, qu'il est temps
   de lâcher. Chaîne créée une fois, à la première glisse, puis juste pilotée (zéro allocation par image). */
let DRS=null;
const DRS_BASE=[123.47,164.81,246.94,329.63],DRS_D0=[0,.45,.9,1.4],DRS_DD=[.45,.45,.5,1]; // (2026-10-14, passe perf mobile) les tables de la charge du drift, bâties UNE fois (3 tableaux par image de drift avant)
function driftChargeSnd(){
  if(!AC||!MASTER)return;
  const on=mode==='drive'&&driftC>0&&started&&!gameOver&&!paused;
  if(!DRS){ if(!on||DRS===false)return;
    try{const o1=AC.createOscillator(),o2=AC.createOscillator(),lp=AC.createBiquadFilter(),am=AC.createGain(),g=AC.createGain(),
          lfo=AC.createOscillator(),lg=AC.createGain();
      o1.type='square';o2.type='square';lp.type='lowpass';lp.Q.value=3.5;lp.frequency.value=700;
      am.gain.value=.6;lfo.type='sine';lfo.frequency.value=15;lg.gain.value=.4;lfo.connect(lg);lg.connect(am.gain);
      g.gain.value=0;o1.connect(lp);o2.connect(lp);lp.connect(am);am.connect(g);g.connect(MASTER);
      o1.start();o2.start();lfo.start();DRS={o1:o1,o2:o2,lp:lp,g:g,lfo:lfo};porte(g,MASTER);}catch(e){DRS=false;return;} }
  const T=AC.currentTime;
  if(on){
    const lv=driftLv,base=DRS_BASE[lv],d0=DRS_D0[lv],dd=DRS_DD[lv],fr=lv>=3?1:Math.min(1,Math.max(0,(driftC-d0)/dd));
    // (2026-10-14, session SON) le bourdon suit la TONALITÉ comme `drift.charge` de la banque (SON_TON, de −2 à +5 demi-tons ; GLISSE de Jade +1) : avant, il restait sur si-mi fixes
    // et se frottait à la note de palier de la banque (jusqu'à 5 demi-tons d'écart). `_t` est null/undefined tant que la banque n'est pas branchée : alors ×1. (audit oreille-neuve n°3 §4)
    const f=base*Math.pow(2,(sonTonSuit._t||0)/12)*(1+.25*fr);
    DRS.o1.frequency.setTargetAtTime(f,T,.03);DRS.o2.frequency.setTargetAtTime(f*1.5,T,.03);
    DRS.lp.frequency.setTargetAtTime(600+lv*650+fr*300,T,.05);
    DRS.lfo.frequency.setTargetAtTime(13+lv*4,T,.05);
    DRS.g.gain.setTargetAtTime(lv?.010+lv*.006:.005,T,.04); // (2026-10-14, session SON) −3 dB : à plein niveau le carré (−28 dBFS) écrasait le crissement qu'il accompagne (−35)
  }else DRS.g.gain.setTargetAtTime(0,T,.03);
}
/* LE RASE-BORD GRONDE (2026-09-25) : frôler le vide à pleine vitesse rechargeait le nitro en silence. Maintenant la
   caisse roule sur une BANDE RUGUEUSE — bruit grave haché par un carré (~30 Hz, plus vite avec la vitesse) — et le pouce
   la sent (un tic toutes les 160 ms). Le danger se lit à l'oreille ; et c'est un son qu'on a ENVIE d'entendre. */
let RSN=null;
function raseSnd(dt,kmh){
  if(!AC||!MASTER)return;
  const on=mode==='drive'&&raseT>0&&started&&!gameOver&&!paused;
  if(!RSN){ if(!on||RSN===false)return;
    try{const src=AC.createBufferSource();src.buffer=noiseBuf(1.2);src.loop=true;
      const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=TEL_NATIF?520:190;bp.Q.value=1.3; // (2026-10-14, session SON) iPhone : 190 Hz ne sort pas du haut-parleur (comme le moteur `lpMin` et `subBoom` TEL_NATIF) — le frôlé du vide à 700 km/h était muet ; bande à 520 Hz, l'ordi garde 190 (audit oreille-neuve n°3 §6)
      
      const am=AC.createGain();am.gain.value=.5;const lfo=AC.createOscillator(),lg=AC.createGain();lfo.type='square';lfo.frequency.value=30;lg.gain.value=.5;
      lfo.connect(lg);lg.connect(am.gain);
      const g=AC.createGain();g.gain.value=0;src.connect(bp);bp.connect(am);am.connect(g);g.connect(MASTER);src.start();lfo.start();
      RSN={g:g,lfo:lfo};porte(g,MASTER);}catch(e){RSN=false;return;} }
  const T=AC.currentTime;
  if(on){ RSN.g.gain.setTargetAtTime(Math.min(.22,.09+raseT*.12)*(TEL_NATIF?1.5:1),T,.03);RSN.lfo.frequency.setTargetAtTime(Math.min(60,18+kmh*.05),T,.05); // ⚠ la vitesse arrive en paramètre (speedKmh est locale à loop : ReferenceError avalée, le tic ne partait jamais) ; plafond 60 Hz : au-delà le hachage devient une note
    raseSnd._h=(raseSnd._h||0)-dt;if(raseSnd._h<=0){raseSnd._h=.16;hap(4);} }
  else if(raseSnd._on!==0)RSN.g.gain.setTargetAtTime(0,T,.04); // (2026-10-15, perf-devtools) la consigne 0 UNE fois, au décrochage — elle partait à CHAQUE image hors du bord (profil Chrome : 0,25-0,37 ms par image) ; la courbe exponentielle n'a pas de mémoire : même son
  raseSnd._on=on?1:0;
}
/* LE FRÔLÉ S'ENTEND : un souffle Doppler (aigu à l'approche, grave en s'éloignant — l'objet PASSE à côté de nous) et un
   « ting » qui monte d'un ton par plot enchaîné. La chaîne d'un slalom se joue comme une gamme. */
// (2026-10-14, session SON) LE CÔTÉ DE L'OBSTACLE : `ob` = l'objet frôlé (plot, satellite, voiture du trafic — tous ont .mesh.position, en monde).
// Son écart sur l'axe DROIT de la caméra (celle de l'image d'avant) le place à l'écran : le souffle passe de ce côté, ±0,35 au plus.
// Sans objet (ou sans position), pas de pan : rien n'est deviné. Vecteurs réutilisés : aucune allocation par frôlé.
const SON_FR_D=new THREE.Vector3(),SON_FR_R=new THREE.Vector3(),SON_FR_C=new THREE.Vector3();
function froleSnd(pres,n,ob){
  if(SONV2){let p9=0;try{if(ob&&ob.mesh&&ob.mesh.position){SON_FR_R.setFromMatrixColumn(camera.matrixWorld,0);SON_FR_C.setFromMatrixPosition(camera.matrixWorld);
      p9=.35*Math.max(-1,Math.min(1,SON_FR_D.copy(ob.mesh.position).sub(SON_FR_C).dot(SON_FR_R)/2.5));if(!(p9===p9))p9=0;}}catch(e){p9=0;}
    sfx('frole',{st:sonPdAR((n|0)-1),vol:-3+3*(pres||0),pan:p9});return;} // (2026-10-14, session SON) sonPdAR : aller-retour sur l'octave haute après le 9e maillon, au lieu de figer
  if(!sfxOk())return;
  try{
    const t0=AC.currentTime,d=.32,up=Math.min(1.9,1+(n-1)*.12);
    const src=AC.createBufferSource();src.buffer=noiseBuf(d+.05);
    const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=2.2;
    f.frequency.setValueAtTime(2600*up,t0);f.frequency.exponentialRampToValueAtTime(520*up,t0+d);
    const g=AC.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.12+.1*pres,t0+.06);g.gain.exponentialRampToValueAtTime(.001,t0+d);
    src.connect(f);f.connect(g);g.connect(MASTER);src.start(t0);src.stop(t0+d+.05);
    chimeNote(noteP(Math.min(9,n+3),1),.02,.045+.025*pres,.18);
  }catch(e){}
}
/* LES PALIERS DE FLOW SONNENT COMME DES ACCORDS QUI MONTENT : l'accord majeur égrené, un cran plus haut à chaque palier
   (do · ré · mi · sol), la poussière d'or à ×3, le coup de poitrine à ×4 — et la FRÉNÉSIE part avec le fwoosh entier. */
// Hook console : `dbgConduite()` — l'état des nouveaux sons de conduite, et `dbgConduite('son')` les JOUE tous une fois
// (renvoie la première erreur s'il y en a : les appels de la boucle sont sous try/catch, une panne y serait muette).
window.dbgBord=function(o){ // (banc) LE BORD DE LA ROUTE : pose la caisse à un écart latéral (lat) avec une vitesse latérale (vL) · rend l'état (lat, bumps du vol, mode)
  if(o&&mode==='drive'){if(o.lat!=null)lat=+o.lat;if(o.vL!=null)vL=+o.vL;if(o.grace!=null)graceT=+o.grace;if(o.psi!=null){psi=+o.psi;yawR=0;}if(o.vA!=null)vA=+o.vA;if(o.s!=null){s=+o.s;prevTvalid=false;}if(o.saut)startFall(+o.saut,1);}
  if(o&&mode==='fall'&&o.rentre!=null&&tryLand._bi>=0)fallVel.addScaledVector(B[tryLand._bi],-Math.sign(curLatOff||1)*(+o.rentre)*vitMult()); // (banc) en vol : une vitesse vers la route (le joueur qui braque déjà)
  return {mode:mode,lat:+lat.toFixed(2),demi:ROAD_HALF,vL:+vL.toFixed(2),bumps:bounceN,fallT:+fallT.toFixed(2),side:side,hOff:+curHOff.toFixed(2),latOff:+curLatOff.toFixed(2),steer:+steer.toFixed(2),basc:bascOn};};
function flowSnd(lv){
  if(SONV2){if(lv>=4)sfx('frenesie.entre');else if(lv>0)sfx('flow.'+lv,{vol:2});return;} /* (2026-10-14, session SON) flow.1-3 +2 : un palier de flow (−30/−29/−28) sonnait au niveau d'une pièce (−30, son +4) ; frenesie.entre (−23) reste devant */ // (console) le palier 4 = la FRÉNÉSIE qui part
  if(!AC||!(lv>0))return;
  const I=FLOW_ACC[lv]; // (même tonalité que les pièces : mi · fa# · sol# · si)
  chimeNote(noteP(I[0],1),0,.08,.22);chimeNote(noteP(I[1],1),.06,.07,.24);chimeNote(noteP(I[2],1),.12,.07,.3);
  if(lv>=2)sparkle(.1,.07);
  if(lv>=3){subBoom(.12);chimeNote(noteP(I[0]+5,1),.18,.06,.4);}
  if(lv===4){boostSnd(1.7);duckT=Math.max(duckT,.5);}
}
function fanfare(){ // nouvelle voiture : arpège victorieux (et le mix s'incline)
  if(SONV2){sfx('victoire');return;} // (console) repli générique : les appelants principaux ont chacun leur son (voir LA CONSOLE DE SON)
  if(!sfxOk())return;
  duckT=Math.max(duckT,.5);
  try{
    [0,4,7,12].forEach(function(n,i){
      const o=AC.createOscillator(),g=AC.createGain();
      o.type='square';o.frequency.value=TON*Math.pow(2,n/12); // mi4 majeur (la tonalité commune)
      const t0=AC.currentTime+i*.09;
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.07,t0+.02);
      g.gain.exponentialRampToValueAtTime(.001,t0+.32);
      o.connect(g);g.connect(MASTER);o.start(t0);o.stop(t0+.35);
    });
  }catch(e){}
}
// ---------- SFX DE RÉCOMPENSE (psychoacoustique appliquée) ----------
// · événement FRÉQUENT → son bref (<300 ms), doux, aigu : pas d'habituation, pas de fatigue
// · contour MONTANT + intervalles CONSONANTS (tierce/quinte/octave) = valence positive
// · enveloppe percussive naturelle (attaque 8 ms, décroissance exponentielle) = « objet frappé » crédible
// · scintillement 5 kHz = la signature « or » sans volume · l'INTENSITÉ croît avec la RARETÉ
function chimeNote(f,t,vol,dur){ // note cloche : sinus + partiel triangle à l'octave
  if(!sfxOk())return;
  try{
    const o=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain(),g2=AC.createGain();
    o.type='sine';o.frequency.value=f;
    o2.type='triangle';o2.frequency.value=f*2;g2.gain.value=.25;
    const t0=AC.currentTime+t;
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.008);
    g.gain.exponentialRampToValueAtTime(.0008,t0+dur);
    o.connect(g);o2.connect(g2);g2.connect(g);g.connect(MASTER);
    o.start(t0);o.stop(t0+dur+.05);o2.start(t0);o2.stop(t0+dur+.05);
  }catch(e){}
}
function sparkle(t,vol){ // poussière d'or : souffle bandpass très bref
  if(!sfxOk())return;
  try{
    const src=AC.createBufferSource();src.buffer=noiseBuf(.09);
    const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=5200;f.Q.value=1.2;
    const g=AC.createGain();const t0=AC.currentTime+t;
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.01);
    g.gain.exponentialRampToValueAtTime(.0008,t0+.09);
    src.connect(f);f.connect(g);g.connect(MASTER);src.start(t0);src.stop(t0+.14);
  }catch(e){}
}
function rewardSfx(key,tier){ // signature courte assortie à chaque récompense
  if(!sfxOk())return;
  if(SONV2){sfx('verdict.'+Math.max(1,Math.min(3,tier|0)));return;} // (console) le verdict résout la gamme du vol sur la tonique
  // MONSTRE 1/2/3 : arpège consonant qui GRANDIT avec le tier (fondamentale → quinte → octave)
  chimeNote(660,0,.07+tier*.02,.22);
  if(tier>=2)chimeNote(990,.06,.08,.24);
  if(tier>=3){chimeNote(1320,.12,.09,.3);subBoom(.12);}
  sparkle(tier>=2?.08:.03,.05+tier*.02);
}
function pneuMord(k){ // (2026-09-25) LA GOMME ACCROCHE à la pose : une piaillée brève, plus forte si ça tape
  if(SONV2)return; // (console) le pneu qui mord est DANS le son de pose (pose.choc)
  if(!sfxOk())return;
  try{const t0=AC.currentTime,src=AC.createBufferSource();src.buffer=noiseBuf(.14);
    const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=7;f.frequency.setValueAtTime(1500,t0);f.frequency.exponentialRampToValueAtTime(950,t0+.1);
    const g=AC.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.05+.07*k,t0+.008);g.gain.exponentialRampToValueAtTime(.001,t0+.12);
    src.connect(f);f.connect(g);g.connect(MASTER);src.start(t0);src.stop(t0+.14);}catch(e){}
}
function bumpSfx(n){ // rebond sur la tranche : carillon qui GRIMPE à chaque bump enchaîné
  if(SONV2){sfx('air.regain');return;} // (console) la figure BUMP sonne dans addTrick ; ici, le chrono d'airtime qui se RECHARGE
  const b9=[1,3,4,5,6][Math.min(4,n-1)]; // une quinte juste qui grimpe, dans la tonalité commune
  chimeNote(noteP(b9),0,.11,.3);
  chimeNote(noteP(b9+3),.07,.09,.32);
  sparkle(.04,.07);
}
// ---------- TURBO v2 : décortiqué du sample WRX (analyse réelle du wav fourni) ----------
// Mesures : flutter du compresseur ≈ 27,8 Hz (période 36 ms), attaque 30 ms, décroissance ~1 s,
// souffle centré ~800 Hz + grondement 94-156 Hz dessous. Science du plaisir : l'ENCLENCHEMENT
// monte (anticipation dopaminergique), la RELÂCHE offre le « pssht-tututu » (récompense de fin,
// peak-end rule) — appuyer sur ESPACE devient un petit rituel à deux temps.
function nitroSpool(){ // enclenchement : spool de turbo qui grimpe + goulée d'air
  if(!sfxOk()||BTEST==='feu0')return;
  try{
    const lv=Math.min(15,Math.max(0,engTier|0)*.5),t0=AC.currentTime; // (2026-09-25) le palier MOTEUR, jamais la caisse (ACIDE montait à 6 kHz : le moustique)
    const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();
    o.type='sawtooth';
    const f0=650+lv*90,f1=Math.min(3400,2100+lv*180);
    o.frequency.setValueAtTime(f0,t0);
    o.frequency.exponentialRampToValueAtTime(f1,t0+Math.max(.25,.5-lv*.015)); // les grosses caisses spoolent plus vite
    f.type='bandpass';f.Q.value=7;
    f.frequency.setValueAtTime(f0*2,t0);
    f.frequency.exponentialRampToValueAtTime(f1*2,t0+.5);
    g.gain.setValueAtTime(.0001,t0);
    g.gain.exponentialRampToValueAtTime(.045+lv*.002,t0+.22);
    g.gain.exponentialRampToValueAtTime(.0008,t0+.6);
    o.connect(f);f.connect(g);g.connect(MASTER);
    o.start(t0);o.stop(t0+.65);
  }catch(e){}
  noiseBurst(.25,.05,900+Math.min(15,Math.max(0,engTier|0)*.5)*150); // l'admission avale l'air
}
function blowOff(){ // relâche : PSSHT + flutter « stu-tu-tu » calé sur le sample (≈28 Hz de référence)
  if(!sfxOk())return;
  try{
    const t9=Math.max(0,engTier|0),e9=ENG_SND[t9]||ENG_SND[0],lv=Math.min(15,t9*.5),jet=e9.gr===1,t0=AC.currentTime; // (2026-09-25) le MOTEUR : une turbine n'a pas de soupape
    duckT=Math.max(duckT,.35); // le pssht mérite sa place
    // 1) le PSShhh : souffle large, attaque 30 ms, qui descend comme sur le wav
    const s=AC.createBufferSource();s.buffer=noiseBuf(1);
    const bp=AC.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.1;
    bp.frequency.setValueAtTime(2400+lv*180,t0);
    bp.frequency.exponentialRampToValueAtTime(650,t0+.55);
    const g=AC.createGain();
    g.gain.setValueAtTime(.001,t0);g.gain.linearRampToValueAtTime(.16,t0+.03);
    // 2) le FLUTTER : hachures d'amplitude — l'épave bafouille lent (≈18 Hz), les monstres claquent vite (≈45 Hz)
    const fr=16+lv*2.2,p=1/fr,n=jet?0:Math.min(10,4+(lv>>1));
    for(let i=0;i<n;i++){
      const ta=t0+.06+i*p;
      g.gain.setValueAtTime(.15*Math.pow(.82,i),ta);
      g.gain.setValueAtTime(.02,ta+p*.45);
    }
    g.gain.exponentialRampToValueAtTime(.0008,t0+.06+n*p+.3);
    s.connect(bp);bp.connect(g);g.connect(MASTER);
    s.start(t0);s.stop(t0+1.2);
    // 3) le grondement 100-150 Hz mesuré sous le souffle
    const o2=AC.createOscillator(),g2=AC.createGain();
    o2.type='sine';o2.frequency.setValueAtTime(140,t0);
    o2.frequency.exponentialRampToValueAtTime(94,t0+.4);
    g2.gain.setValueAtTime(.08,t0);g2.gain.exponentialRampToValueAtTime(.0008,t0+.45);
    o2.connect(g2);g2.connect(MASTER);o2.start(t0);o2.stop(t0+.5);
    if(jet){ // turbines et au-delà : pas de flutter mais une coupure d'afterburner — boom + sifflet qui tombe
      subBoom(.22);
      const o=AC.createOscillator(),g3=AC.createGain();
      o.type='sine';o.frequency.setValueAtTime(1900,t0);
      o.frequency.exponentialRampToValueAtTime(300,t0+.5);
      g3.gain.setValueAtTime(.055,t0);g3.gain.exponentialRampToValueAtTime(.0008,t0+.5);
      o.connect(g3);g3.connect(MASTER);o.start(t0);o.stop(t0+.55);
    }
  }catch(e){}
}
function portalSnd(){ // portail : sweep ascendant
  if(SONV2){sfx('portail');return;}
  if(!sfxOk())return;
  try{
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='sine';o.frequency.setValueAtTime(400,AC.currentTime);
    o.frequency.exponentialRampToValueAtTime(1650,AC.currentTime+.5);
    g.gain.setValueAtTime(.11,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.6);
    o.connect(g);g.connect(MASTER);o.start();o.stop(AC.currentTime+.65);
  }catch(e){}
}
function boomSnd(){ // explosion : souffle + sub + crépitement
  if(SONV2){duckT=1;sfx('explosion');return;}
  if(!sfxOk())return;
  try{
    duckT=1; // l'explosion écrase tout le reste une seconde
    noiseBurst(.9,.5,320);noiseBurst(.3,.38,2000);
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='sine';o.frequency.setValueAtTime(140,AC.currentTime);
    o.frequency.exponentialRampToValueAtTime(26,AC.currentTime+.95);
    g.gain.setValueAtTime(.5,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+1);
    o.connect(g);g.connect(MASTER);o.start();o.stop(AC.currentTime+1.05);
    setTimeout(function(){noiseBurst(.5,.16,700);},150);
    setTimeout(function(){noiseBurst(.4,.1,500);},380);
  }catch(e){}
}
// (musique supprimée — ambiance moteur/vent uniquement)

// ---------- LES MOTS DE L'ANNONCEUR : le texte s'affiche (2026-10-07 : plus aucune voix, les fichiers audio ne sont plus joués) ----------
const ANN_TXT={m1:'MONSTRE',m2:'DOUBLE MONSTRE',m3:'TRIPLE MONSTRE',earlyDead:'EARLY DEAD',frenesie:'TRIPLE MONSTRE'}; // m1/m2/m3 : les verdicts de pose · frenesie : la FRÉNÉSIE atteinte · earlyDead : explose avant le top 5
function annSpeak(key){return ANN_TXT[key]||null;}
/* ---------- LES SONS DE MORT — un au hasard quand la caisse explose (2026-08-11) ----------
   Quatre samples, tirés au sort à chaque explosion. Le sel, c'est le mélange des registres : deux
   explosions, une réaction de dégoût, un gong. On ne sait jamais lequel tombe, et c'est ça la blague.
   ⚠ TROIS DÉCISIONS QUI COMPTENT :
   (1) JAMAIS DEUX FOIS DE SUITE LE MÊME. Un tirage vraiment uniforme sort des doublons une fois sur
       quatre — et un doublon, sur un son de mort qu'on vient d'entendre, ne se lit pas comme du
       hasard mais comme un bug. On exclut donc le dernier joué : ça reste aléatoire, ça ne bégaie pas.
   (2) UNE DURÉE MAXIMALE PAR SON. L'explosion fait 8,4 s : sa traîne mangerait tout l'écran de fin.
       Chacun déclare son `max` et se coupe en fondu — la frappe reste, la queue part.
   (3) C'EST UN SFX, PAS UNE VOIX. Donc gate sur `SND.sfx` et pas sur `SND.voice`. ⚠ et c'est un
       HTMLAudio : il ne passe PAS par le bus WebAudio, donc `AC.suspend()` (le bouton SON) ne le
       coupe pas tout seul. Sans ce gate explicite, couper le son laisserait les morts sonores. */
const DEATH_DIR='assets/audio/death/';
// ⚠ SONS DE SYNTHÈSE (placeholders) : les originaux sous licence (minecraft/explosion/eww/gong)
//   restent à fournir par Sacha. Format AAC .m4a (WKWebView natif — afconvert ne sait pas encoder mp3).
/* (2026-10-14, session SON) LES MORTS AU MÊME COUP. Tirées au hasard, elles ne frappaient pas pareil — MESURÉ (crête de sonie sur 100 ms, × v) :
   minecraft −8,0 dB, gong −8,1, déflagration −12,8 : une mort sur trois tombait 5 dB plus bas. v recalés sur −9,5 (minecraft .80 → .68,
   déflagration .70 → .95 — pas plus : sur le chemin <audio> de repli, `volume` > 1 lèverait —, gong .85 → .72). */
const DEATH_LIB=[
  {f:'minecraft.m4a', v:.68, max:2.6},  // boum pixelisé (synthèse — placeholder)
  {f:'explosion.m4a', v:.95, max:4.5},  // déflagration (synthèse — placeholder)
  {f:'gong.m4a',      v:.72, max:3.6}   // gong (synthèse — placeholder)
];
let deathLast=-1,deathEls=[];
function deathPreload(){
  try{for(const d of DEATH_LIB){const a=new Audio(DEATH_DIR+d.f);a.preload='auto';a.load();}}catch(e){}
}
function deathStop(){ // coupe net (nouvelle partie, mute) : deux morts qui se chevauchent, c'est de la bouillie
  for(const a of deathEls){try{a.pause();}catch(e){}}
  deathEls.length=0;
}
/* ---------- LES SAMPLES D'ÉVÉNEMENT (2026-08-18) ----------------------------------------------
   Même machinerie que les sons de mort — plafond de durée, fondu de sortie, gate `SND.sfx`, tirage
   sans doublon consécutif — mais pour les moments de STYLE et d'ARGENT.
   ⚠ CE QUI TUE CE GENRE DE SON, C'EST LA RÉPÉTITION. Un « WOW » sur chaque combo devient une alarme
   en trois minutes. Deux garde-fous, donc : un SEUIL (il faut mériter le son) et une PÉRIODE
   RÉFRACTAIRE (même mérité, il ne repart pas tout de suite). Le silence est ce qui lui rend sa valeur. */
const FX_DIR='assets/audio/fx/';
/* ⚠ PAS DE VOIX ICI (2026-08-18). Les répliques parlées — « shut up and take my money », le
   « fight money » de Balrog, le medic de TF2, « loads of money » — ont été retirées : une phrase
   se reconnaît, donc elle s'use, et sur un jeu où l'argent tombe toutes les dix secondes elle finit
   par casser les oreilles. Un son de MATIÈRE (tiroir-caisse, billets, compteuse) se fond dans le
   mix et supporte la répétition. Les fichiers restent sur le disque si on veut en récupérer un. */
/* (2026-09-28, chasse aux détails) LES QUATRE SONT À LA MÊME SONIE — MESURÉ (ebur128) : compteur −7 LUFS, compteuse −18,7, cash −19,2,
   kaching −22 : tirés au hasard, le compteur claquait 13 dB au-dessus des autres (il couvrait la voix de l'annonceur), et sur iPhone
   `volume` est ignoré (VOL_LOCKED) : seuls les FICHIERS comptent. Ils ont été ramenés à −20 LUFS (crêtes ≤ −1 dB, étiquettes vidées) ;
   le `v` est donc le même pour tous. */
const FX_ARGENT=[
  {f:'kaching.mp3',   v:.7,max:2.4},  // le tiroir-caisse
  {f:'cash.mp3',      v:.7,max:2.4},  // la liasse qu'on froisse
  {f:'compteuse.mp3', v:.7,max:2.6},  // la machine à compter
  {f:'compteur.mp3',  v:.7,max:2.8}   // le compteur à billets
];
let fxEls=[],fxArgLast=-1,fxArgCd=0;
function fxStop(){for(const a of fxEls){try{a.pause();}catch(e){}}fxEls.length=0;}
function fxPreload(){try{
  const t=FX_ARGENT;
  for(const d of t){const a=new Audio(FX_DIR+d.f);a.preload='auto';a.load();}
}catch(e){}}
/* L'ARGENT — tirage sans doublon consécutif (même règle que les morts : un doublon ne se lit pas
   comme du hasard mais comme un bug) et 6 s de réfractaire, parce que l'argent tombe souvent. */
function fxTick(dt){ // les réfractaires s'égrènent — hors gate de sim, sinon ils gèlent en pause
  if(fxArgCd>0)fxArgCd=Math.max(0,fxArgCd-dt);
}
function deathSound(){
  if(!SND.sfx)return;
  const n=DEATH_LIB.length;
  let i=Math.floor(Math.random()*n);
  if(n>1&&i===deathLast)i=(i+1+Math.floor(Math.random()*(n-1)))%n; // le tirage évite le dernier joué
  deathLast=i;
  const d=DEATH_LIB[i];
  if(d.dead)return;                       // fichier absent : on ne réessaie pas, et surtout on ne plante pas
  deathStop();
  if(sampleWA(DEATH_DIR+d.f,d.v,d.max,deathEls))return; // (console de son) décodé : dans le mixage, curseur EFFETS compris sur iPhone
  let a;try{a=new Audio(DEATH_DIR+d.f);}catch(e){d.dead=true;return;}
  a.volume=d.v*sfxVol(); // HTMLAudio : hors du bus MASTER, le curseur s'applique ici
  a.addEventListener('error',function(){d.dead=true;});
  try{a.play().catch(function(er){if(er&&er.name==='NotSupportedError')d.dead=true;});}catch(e){d.dead=true;return;} // (voir fxPlay : un refus n'est pas une absence)
  deathEls.push(a);
  // FONDU DE SORTIE : on éteint sur les 500 dernières ms plutôt que de couper au couteau
  const t0=performance.now(),fade=500,lim=d.max*1000;
  const iv=setInterval(function(){
    const t=performance.now()-t0;
    if(t>=lim||a.paused||a.ended){clearInterval(iv);try{a.pause();}catch(e){}return;}
    if(t>lim-fade)a.volume=Math.max(0,d.v*sfxVol()*(lim-t)/fade);
  },50);
}
// ⚠ iOS : `volume` est en LECTURE SEULE sur HTMLAudio. Sans ce test, les trois doublures se jouent
// toutes à plein volume : au lieu d'une voix habillée, un MUR de quatre voix. Mieux vaut la voix nue.
const VOL_LOCKED=(function(){try{const a=new Audio();a.volume=.42;return Math.abs(a.volume-.42)>.01;}catch(e){return false;}})();
