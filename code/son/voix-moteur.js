/* ================= LES 30 VOIX — UNE PAR MOTEUR (2026-08-05) =================
   ⚠ C'ÉTAIT LE PLUS GROS MANQUE DU JEU (noté tel quel dans la passation). Les 30 paliers se
   partageaient les 24 timbres de `ENGINES` — des voix de CARROSSERIE — par une règle de trois :
   `Math.round(engTier*23/29)`. Conséquence : le NOMBRE DE CYLINDRES, la seule chose qui décide
   vraiment du son d'un moteur, n'entrait nulle part dans le calcul. Un V12 et un 5-cylindres
   pouvaient tomber sur la même voix, et deux paliers voisins sur la même à coup sûr (24 voix
   pour 30 paliers : six doublons garantis, par construction).

   LA PHYSIQUE, en une ligne : sur un quatre-temps il se produit `régime × cylindres / 120`
   explosions par seconde, et c'est ce nombre-là qu'on entend comme une HAUTEUR. Un V12 explose
   six fois plus souvent qu'un bicylindre au même régime : il ne gronde pas plus fort, il CHANTE
   plus haut. `i` (le ralenti) et `r` (l'étendue jusqu'à la rupture) suivent donc cylindres ×
   régime maxi — c'est ce qui range les 30 voix dans un ordre qui S'ENTEND.

   Les autres postes disent le CARACTÈRE :
     h    — les harmoniques. Peu de cylindres → impairs dominants, ça bourdonne ; beaucoup →
            empilement dense et lisse, ça hurle. Turbine → presque une sinusoïde.
     nz   — le lit de BRUIT (multiplie l'admission). C'est LUI, pas la forme d'onde, qui fait un
            réacteur : à partir du statoréacteur il n'y a plus une seule pièce mobile, juste de
            l'air maltraité. Sans ce poste, un « réacteur » n'est qu'un synthé qui monte.
     gr   — les rapports. 1 = pas de boîte : la turbine monte d'un trait, sans rupture.
     lope — le RONRON de ralenti (gros V8, bicylindre). ⚠ `lk:1` le GARDE à tous les régimes :
            c'est ce qui fait le hachoir du PULSORÉACTEUR, qui bat à ~45 Hz par construction et
            ne connaît pas d'autre régime que celui-là.
     crk  — les crépitements au lâcher. Atmo et carburateur pétaradent ; une turbine, jamais.
     whine— le sifflement (turbo, compresseur, rotor, turbine), en multiple de la fondamentale.
     fLen/fHz/fJit — LA FLAMME de la vignette : longueur, fréquence de palpitation, irrégularité.
            Un V8 crache par à-coups, une turbine tient un cône stable, un pulsoréacteur bégaie.
   ⚠ `ENGINES` reste en place mais n'est PLUS la source du son en jeu : le bruit du moteur, c'est
   le moteur, jamais la caisse. */
/* <<<SON-MOTEUR>>> ------------------------------------------------------------------------
   LES FORMULES DU SON, SORTIES DE LA BOUCLE (2026-08-05).
   ⚠ POURQUOI UN BLOC BALISÉ. `moteurs.html` doit pouvoir faire ENTENDRE chaque palier — sinon
   personne, moi le premier, ne peut juger une palette de 30 voix. Or l'atelier ne recopie jamais
   le jeu : il l'exécute. Ces formules sont donc PURES (aucune référence à un nœud audio, à une
   variable de partie ni au DOM) et prennent tout par `st`. Le jeu les applique à ses nœuds,
   l'atelier aux siens, et les deux ne peuvent pas diverger.
   ⚠ NE RIEN METTRE ICI QUI DÉPENDE DE `AC`, de `loop`, de `mode` ou d'un global de partie.
   ------------------------------------------------------------------------------------------ */
/* L'ONDE DU PALIER : les harmoniques de `h` deviennent une PeriodicWave. Mise en cache SUR la
   fiche (`e.w`) — 30 moteurs × un tableau de Fourier, autant ne le construire qu'une fois. */
function engWave9(AC9,e){
  if(!e.w){const re=new Float32Array(e.h.length+1),im=new Float32Array(e.h.length+1);
    for(let i=0;i<e.h.length;i++)im[i+1]=e.h[i];
    e.w=AC9.createPeriodicWave(re,im);}
  return e.w;
}
/* (2026-10-14, session SON) LE GENOU — LA NOTE NE MONTE PLUS EN MOUSTIQUE.
   Les `r` des paliers 17-30 vont jusqu'à 3 300 : à plein régime la fondamentale grimpait à 941 Hz (palier 17), 1 342 (26), 2 081 (30),
   le sub à 1 kHz — un sifflet continu dans la zone où l'oreille est la plus sensible, 100 % du temps de la 2e moitié du jeu (audit n°3 §2).
   Au-dessus de ENG_GENOU la hauteur est COMPRIMÉE (puissance .30) : 30 → ~680 Hz, sub ~340 ; la montée ralenti → croisière reste un
   vrai « spool ». Les paliers 1-12 ne passent jamais 420 Hz (palier 12 plein régime, nitro comprise : 347) : inchangés au bit près.
   Seule la HAUTEUR est comprimée : le filtre et le souffle lisent toujours la fréquence d'origine (même timbre, même brillance).
   ENG_DOUX=false (ou `?genou=0`, ou dbgGenou(0)) = l'ancien son, pour comparer. */
let ENG_DOUX=true;
const ENG_GENOU=420,ENG_GENOU_P=.30;
function engGenou(f){return ENG_DOUX&&f>ENG_GENOU?ENG_GENOU*Math.pow(f/ENG_GENOU,ENG_GENOU_P):f;}
/* TOUS LES RÉGLAGES D'UNE FRAME, pour un moteur `e` dans un état `st`.
   st = {rpm 0..1 · charge 0..1 · ovr 0..1 · drift −.5..+.5 · nA nitro 0..1 · thr 0|1 ·
         vsp vitesse normalisée · wob · boost · cloudIn · dk ducking} */
function engSndParams(e,st){
  // `rpm` ≥ 0 et NaN → 0 : `Math.pow(rpm,.7)` du sifflet rend NaN sur un régime négatif, et un NaN dans un AudioParam éteint le nœud
  // pour la session (vu au banc de la lignée car-crash sur un saut de palier + portail dans la même image).
  const nA=st.nA||0, ch=st.charge||0, ov=st.ovr||0, rpm=Math.max(0,st.rpm||0), dr=st.drift||0;
  const meca=e.gr>1?1:0;
  /* ⚠ LE RONRON (2026-09-24) — verdict du user en jouant : « un bruit de moustique, très monotone ;
     je veux qu'il vibre, qu'il ronronne selon comment j'appuie, et au boost ». Trois causes :
     (1) TROP HAUT — la fondamentale montait à ~560 Hz dans les paliers moyens, filtre ouvert à
         6,2 kHz, souffle à 6 kHz, sifflet de turbo : tout le spectre partait dans l'aigu. Un moteur
         qu'on SENT vit sous 200 Hz. `ENG_PITCH` descend toute la famille d'un bloc (≈ une sixte),
         sans retoucher les 30 fiches — leurs rapports entre elles restent intacts.
     (2) MONOTONE — la pulsation (`lfo`, qui module le GAIN, donc un vrai battement) ne vivait
         qu'au ralenti (`1-rpm*3.2` → coupée dès 30 % de régime) : en course il ne restait qu'une
         note tenue. Elle bat désormais TOUT LE TEMPS, plus profond sous charge et au boost.
     (3) LE BOOST MONTAIT LA NOTE (+12 %) — donc plus aigu, plus moustique. Il GONFLE maintenant
         le bas (sub + battement) au lieu de monter : on sent la poussée dans le ventre. */
  const ENG_PITCH=.62;
  const fF0=(e.i+rpm*e.r)*ENG_PITCH*(1+.04*nA)*(1+(st.wob||0)); // (2026-10-14, session SON) la fréquence d'ORIGINE : le filtre et le souffle la lisent
  const fF=engGenou(fF0)*(1+(ENG_DOUX?(st.resp||0):0));          // la HAUTEUR qu'on entend (oscillateurs, sub, cliquetis), comprimée au-dessus du genou · `resp` : la respiration (engSouffle), APRÈS le genou pour qu'il ne l'écrase pas
  /* ⚠ PLANCHER OBLIGATOIRE. `post` vaut `1.05/Math.pow(drv,.55)` : dès que `drv` passe à zéro ou
     dans le négatif (fort frein moteur, `ov` élevé et charge nulle), `Math.pow` d'un négatif rend
     NaN — et un NaN écrit dans un AudioParam ne se répare pas, il ÉTEINT le nœud pour toute la
     session. Repéré en test au moment du game over : « setTargetAtTime: non-finite value ».
     Le plancher coûte un `Math.max` et supprime la classe entière de pannes. */
  const nB=st.nB||0,gE=st.gE==null?.72:st.gE; // (2026-09-25) nB : part du nitro qui GONFLE le moteur (téléphone) · gE : recul face à la bande-son (1 sur iOS, où la musique est verrouillée à 100 %)
  const drv=Math.max(.08,.42+ch*2.45+ov*-.16+.55*nB*nA);
  const lpB=Math.max(240,Math.min(2800,e.fq+fF0*e.fr)); // (2026-10-14) fF0 : le genou ne doit pas assourdir les paliers du haut · plafond 6200→2800 : le moustique vivait au-dessus
  // ×.72 : le moteur recule d'un cran pour que la BANDE-SON passe devant (plainte du même jour)
  const ev=(.019+.026*rpm+.009*ch)*(1-.10*nA+.38*nB*nA)*e.vol*(st.dk==null?1:st.dk)*gE;
  const vsp=st.vsp||0;
  return {
    fF:fF, detune:7+ch*19, subF:Math.max(22,fF*.5),
    nzF:Math.min(3200,Math.max(260,fF0*6*(.72+ch*.62))), // (2026-10-14) fF0 : le lit de bruit des turbines garde sa couleur
    nzG:(.06+.26*ch+.08*rpm)*(e.nz||1)*(1-.5*nA)*.7,
    /* (2026-10-14, session SON) LE SIFFLET DESCEND SOUS 3,4 kHz. `fF×whine` passait 11 kHz dès 76 % de régime aux paliers 20, 21, 24-30 :
       collé à 9 000 Hz (le plafond), une dent de scie dont le filtre (ewf, 9 kHz) tombe sur sa fondamentale = un SINUS PUR, fixe, qui
       contourne le filtre du moteur — un acouphène sans aucune information de vitesse (audit n°3 §3). Le plafond MONTE AVEC LE RÉGIME
       (1 000 Hz au ralenti → 2 900-3 400 à plein, plus haut pour les gros sifflets) : il redit la vitesse. Sous ce plafond rien ne change
       (paliers 6, 7 : jamais atteint ; 9 et 12 : 3,2 / 4,3 kHz → 2,9-3,0 kHz en haut du régime seulement). Dans la zone du genou
       (fF0 > 420 Hz) le sifflet recule de 30 % au plus, en fondu sur 140 Hz (pas de marche quand le régime traverse le genou). */
    whineOn:!!e.whine, whineF:e.whine?(ENG_DOUX?Math.min(fF0*e.whine,1000+2400*Math.min(1,rpm)*(.7+.3*Math.min(1,e.whine/30))):Math.min(9000,fF0*e.whine)):2000,
    whineG:e.whine?(.10+.16*ch)*Math.pow(Math.min(1,rpm),.7)*(1-.45*nA)*(1-ov*.7)*.4*(ENG_DOUX?1-.3*Math.min(1,Math.max(0,(fF0-ENG_GENOU)/140)):1):0,
    drv:drv, post:1.05/Math.pow(drv,.55), eq:-8.0+ch*7.0,
    mix:.42+.20*ch+.10*(st.thr||0)+.05*nA,
    subG:e.sub*(.34+.30*ch+.22*(st.thr||0)+.45*nA), // la touche ET le boost gonflent le VENTRE du son
    tickF:Math.max(6,fF), tickG:meca*(.012+.055*ch+.018*rpm)*(1-.5*nA*(1-nB)),
    pinkG:(.020+.030*rpm+.020*ch)*(1-.4*nA),
    transF:240+vsp*2300*(1+dr*.004), diffF:120+vsp*760,
    transG:meca*(.008+.026*ch+.010*vsp)*(1-.55*nA),
    diffG:meca*(.006+.014*ch+.012*vsp)*(1-.55*nA),
    ovrF:200+rpm*900, ovrG:meca*ov*(.030+.070*rpm)*(1-.6*nA),
    lp:Math.max(st.lpMin||0,lpB*(.62+ch*.55)*(1-ov*.45)*(1+(st.boost?.06:0))*(1+dr*.015)*(1-.25*nA*(1-nB))*(1-.45*(st.cloudIn||0))), // lpMin : plancher du téléphone (les harmoniques passent, l'oreille reconstruit la fondamentale)
    /* LE BATTEMENT. `lfoG` s'ajoute au gain de base `ev` : tant qu'il reste SOUS `ev`, le volume
       ondule entre ~0 et 2·ev sans jamais s'inverser (un gain négatif ferait claquer la phase).
       Profondeur = le caractère de la fiche (`lope`, l'épave tousse plus qu'un V12) + la touche
       + le boost. Cadence liée au régime mais bornée 7-24 Hz : sous 7 on entend des coups
       séparés, au-dessus de 24 ça redevient une note — le ronron vit entre les deux. */
    ev:ev, lfoF:Math.min(24,Math.max(7,fF*.22)),
    lfoG:ev*Math.min(.85,.22+e.lope*.9+.22*ch+.18*(st.thr||0)+.28*nA)
  };
}
/* LE MODÈLE DE CHARGE, lui aussi pur : on lui donne l'état précédent, il rend le suivant.
   ⚠ C'est LA pièce qui manquait au son du jeu : trois états (pleine charge / stabilisé / lâché)
   là où il n'y avait qu'un booléen `thr`. Mise ici pour que l'atelier simule EXACTEMENT la même
   dynamique — sinon l'aperçu mentirait sur le seul point qui compte. */
function engLoadStep(prev,thr,rpm,dSn,dt){
  const cCib=thr?Math.max(0,Math.min(1,.26+dSn*2.6)):0;
  const oCib=(!thr&&rpm>.20)?Math.min(1,(rpm-.20)*2.4):0;
  return {
    charge:prev.charge+(cCib-prev.charge)*Math.min(1,dt*(cCib>prev.charge?9:3.4)),
    ovr:prev.ovr+(oCib-prev.ovr)*Math.min(1,dt*(oCib>prev.ovr?10:4.5)),
    drift:prev.drift+((Math.random()-.5)*.9-prev.drift)*Math.min(1,dt*1.6)
  };
}
const ENG_SND=[
 {i:15, r:95,  h:[1,.42,.88,.30,.20],                     sub:.42,dr:2.7,fq:180,fr:2.3,gr:4,lope:.34,wob:.065,crk:.18,vol:1.15,nz:1.15,fLen:.75,fHz:26,fJit:.55,fmt:[210,1.6,5.0]}, //  1 ROUILLÉ : deux pattes qui toussent
 {i:18, r:150, h:[1,.30,.92,.26,.34,.16],                 sub:.46,dr:2.2,fq:210,fr:2.6,gr:4,lope:.26,wob:.030,crk:.24,vol:1.08,nz:1.05,fLen:.80,fHz:31,fJit:.42,fmt:[185,1.7,5.4]}, //  2 BICYLINDRE : le twin qui claque
 {i:24, r:200, h:[1,.26,.86,.22,.46,.18,.24],             sub:.44,dr:1.9,fq:240,fr:2.8,gr:5,lope:.15,wob:.016,crk:.20,vol:1.04,nz:1,   fLen:.82,fHz:34,fJit:.34,fmt:[168,1.5,4.4]}, //  3 3 CYLINDRES : le battement bancal
 {i:30, r:250, h:[1,.40,.80,.30,.44,.22,.26,.12],         sub:.46,dr:1.8,fq:270,fr:3.0,gr:5,lope:.11,wob:.010,crk:.22,vol:1,   nz:1,   fLen:.85,fHz:37,fJit:.30,fmt:[150,1.4,4.0]}, //  4 4 EN LIGNE
 {i:31, r:300, h:[1,.34,.86,.28,.52,.26,.32,.15,.10],     sub:.42,dr:1.9,fq:310,fr:3.3,gr:5,lope:.08,wob:.007,crk:.34,vol:1,   nz:1,   fLen:.88,fHz:41,fJit:.28,fmt:[146,1.5,4.2]}, //  5 4 SOUPAPES : ça respire par le nez
 {i:30, r:285, h:[1,.38,.74,.32,.40,.24,.22,.12],         sub:.52,dr:2.0,fq:290,fr:3.1,gr:5,lope:.09,wob:.008,crk:.58,vol:1.02,nz:1.35,fLen:.92,fHz:33,fJit:.44,whine:9,fmt:[132,1.2,3.4]},  //  6 4 EN LIGNE TURBO : le sifflet + ça pète
 {i:38, r:350, h:[1,.44,.70,.50,.36,.30,.20,.14],         sub:.50,dr:1.9,fq:320,fr:3.3,gr:5,lope:.13,wob:.024,crk:.28,vol:1.04,nz:1.1, fLen:.88,fHz:36,fJit:.38,whine:7,fmt:[138,1.4,4.6]},  //  7 5 CYLINDRES : le warble impair, inimitable
 {i:45, r:400, h:[1,.48,.72,.46,.48,.30,.30,.18,.14],     sub:.52,dr:1.8,fq:340,fr:3.6,gr:6,lope:.09,wob:.006,crk:.30,vol:1,   nz:1,   fLen:.90,fHz:40,fJit:.30,fmt:[124,1.3,4.0]}, //  8 V6 : la forme fait le son
 {i:45, r:420, h:[1,.42,.66,.44,.42,.28,.26,.16,.12],     sub:.58,dr:2.0,fq:330,fr:3.5,gr:6,lope:.08,wob:.006,crk:.46,vol:1.04,nz:1.4, fLen:.96,fHz:34,fJit:.46,whine:11,fmt:[118,1.1,3.2]}, //  9 V6 BITURBO : deux escargots, zéro patience
 // ⚠ PROFIL HARMONIQUE MESURÉ sur un vrai échappement de WRX (ralenti ~710 tr/min, F0 23,75 Hz).
 // La leçon vaut d'être notée : LA FONDAMENTALE N'EST PAS LA PLUS FORTE — le 3e ordre domine à
 // ×2,19. Toutes mes tables partaient de `1` puis décroissaient, c'est-à-dire d'un buzzer et non
 // d'un tuyau. Je ne généralise PAS ce profil (un V12 n'a aucune raison de ressembler à un
 // boxer) : il reste ici, sur la caisse qui l'a produit.
 {i:30, r:320, h:[1,1.77,2.19,1.29,.65,.44,.29,.75,.31,.16],sub:.48,dr:2.0,fq:300,fr:3.2,gr:5,lope:.20,wob:.014,crk:.34,vol:1.06,nz:1.1, fLen:.84,fHz:30,fJit:.40,fmt:[95,1.3,4.1]}, // 10 BOXER : profil relevé sur le réel
 {i:58, r:500, h:[1,.92,.44,.70,.32,.40,.24,.18,.12],     sub:.88,dr:2.3,fq:250,fr:2.7,gr:6,lope:.24,wob:.020,crk:.62,vol:1.12,nz:1,   fLen:1.02,fHz:24,fJit:.62,fmt:[ 88,1.5,5.6]}, // 11 V8 ATMO : LE grondement, et ça crache
 {i:58, r:480, h:[1,.86,.48,.66,.36,.38,.26,.20,.14],     sub:.90,dr:2.4,fq:260,fr:2.8,gr:6,lope:.20,wob:.016,crk:.50,vol:1.14,nz:1.2, fLen:1.06,fHz:27,fJit:.55,whine:13,fmt:[ 84,1.4,5.0]}, // 12 V8 COMPRESSÉ : le Roots par-dessus
 {i:74, r:700, h:[1,.34,.78,.56,.66,.42,.52,.32,.32,.20,.22],sub:.40,dr:1.7,fq:430,fr:4.3,gr:7,lope:.05,wob:.004,crk:.62,vol:1,nz:.95,fLen:1.05,fHz:46,fJit:.34,fmt:[104,1.6,4.8]}, // 13 V10 : dix cylindres, zéro argument
 {i:88, r:860, h:[1,.30,.72,.58,.74,.50,.60,.40,.42,.28,.30,.16],sub:.34,dr:1.6,fq:500,fr:4.6,gr:7,lope:.04,wob:.003,crk:.60,vol:1,nz:.9,fLen:1.10,fHz:52,fJit:.28,fmt:[112,1.7,4.6]}, // 14 V12 : le hurlement à l'unisson
 {i:88, r:700, h:[1,.52,.60,.62,.54,.48,.44,.34,.30,.22,.18],sub:.44,dr:1.5,fq:460,fr:4.2,gr:7,lope:.04,wob:.003,crk:.40,vol:.98,nz:.9,fLen:1.06,fHz:48,fJit:.24,fmt:[ 98,1.5,4.0]}, // 15 W12 : deux V6 mariés, donc plus lisse
 {i:116,r:1000,h:[1,.28,.68,.56,.76,.52,.64,.44,.46,.32,.34,.20,.16],sub:.32,dr:1.55,fq:560,fr:4.8,gr:8,lope:.03,wob:.002,crk:.58,vol:1,nz:.88,fLen:1.14,fHz:58,fJit:.26,fmt:[118,1.8,4.4]}, // 16 V16
 {i:118,r:1400,h:[1,.24,.80,.44,.86,.46,.70,.38,.50,.30,.34,.22],sub:.26,dr:1.9,fq:640,fr:5.0,gr:8,lope:.02,wob:.002,crk:.75,vol:1.04,nz:.95,fLen:1.18,fHz:66,fJit:.36,fmt:[136,2.0,5.2]}, // 17 H16 F1 : interdit en course, logique
 {i:60, r:620, h:[1,.44,.62,.48,.44,.32,.28,.20,.16],     sub:.72,dr:2.1,fq:360,fr:3.6,gr:7,lope:.06,wob:.005,crk:.55,vol:1.10,nz:1.7, fLen:1.12,fHz:30,fJit:.52,whine:15,fmt:[ 92,1.2,3.6]}, // 18 QUADRITURBO : quatre escargots
 // ⚠ LE ROTATIF N'EST PAS UN 3-CYLINDRES. Un rotor allume TROIS fois par tour, un cylindre de
 // quatre-temps une fois tous les DEUX tours : un tri-rotor sonne donc comme un NEUF-cylindres.
 // C'est toute l'explication du hurlement de la 787B, et ça se met dans `i`/`r`, pas ailleurs.
 {i:80, r:950, h:[1,.16,.62,.12,.48,.10,.30,.08],         sub:.34,dr:2.2,fq:620,fr:5.2,gr:6,lope:.02,wob:.002,crk:.58,vol:1.02,nz:1.15,fLen:1.10,fHz:72,fJit:.40,whine:8,fmt:[158,1.9,5.8]},  // 19 ROTATIF TRIPLE
 // ---- PLUS DE PISTONS : à partir d'ici c'est le LIT DE BRUIT qui porte le son, pas l'onde ----
 {i:52, r:1150,h:[1,.14,.08,.16,.05,.09],                 sub:.62,dr:1.25,fq:420,fr:4.6,gr:1,lope:0,wob:0,crk:0,vol:1,   nz:2.3, fLen:1.20,fHz:14,fJit:.10,whine:16,fmt:[ 74,0.8,3.0]}, // 20 TURBINE À GAZ : le souffle + la roue
 {i:60, r:1350,h:[1,.10,.05,.12,.03],                     sub:.58,dr:1.2, fq:520,fr:5.0,gr:1,lope:0,wob:0,crk:0,vol:1.02,nz:1.9, fLen:1.26,fHz:11,fJit:.07,whine:23,fmt:[ 68,0.7,2.6]}, // 21 TURBINE À PLASMA : plus pur, plus haut
 // le STATORÉACTEUR n'a AUCUNE pièce mobile : pas de rotor, donc pas de sifflement. Rien qu'un
 // rugissement d'air. C'est le seul de la famille sans `whine`, et c'est ça qui le distingue.
 {i:44, r:900, h:[1,.06,.03,.05,.02],                     sub:.86,dr:1.5, fq:380,fr:3.8,gr:1,lope:0,wob:0,crk:0,vol:1.08,nz:3.4, fLen:1.34,fHz:9, fJit:.16,fmt:[ 58,0.5,3.4]}, // 22 STATORÉACTEUR : il agresse l'air
 // le PULSORÉACTEUR bat à ~45 Hz par CONSTRUCTION (la V-1 : son bourdon de scie, c'est sa
 // fréquence de détonation). Sa hauteur ne monte donc presque pas — c'est le HACHOIR qui monte.
 {i:45, r:150, h:[1,.85,.70,.60,.50,.42,.34,.28,.22,.18], sub:.80,dr:3.2, fq:520,fr:6.5,gr:1,lope:.60,lk:1,wob:0,crk:.85,vol:1.10,nz:1.6,fLen:1.10,fHz:45,fJit:.85,fmt:[ 96,2.2,6.4]}, // 23 PULSORÉACTEUR
 {i:70, r:1500,h:[1,.18,.10,.20,.06,.10],                 sub:.74,dr:1.35,fq:500,fr:5.2,gr:1,lope:0,wob:0,crk:.20,vol:1.06,nz:2.0,fLen:1.28,fHz:13,fJit:.14,whine:12,fmt:[ 64,0.7,3.0]}, // 24 RÉACTEUR NUCLÉAIRE : le cœur ronfle
 {i:82, r:1750,h:[1,.09,.04,.11,.03],                     sub:.66,dr:1.2, fq:600,fr:5.4,gr:1,lope:0,wob:0,crk:0,vol:1.02,nz:1.7,fLen:1.32,fHz:10,fJit:.06,whine:26,fmt:[ 56,0.6,2.4]}, // 25 CŒUR À FUSION : une étoile tient une note
 {i:64, r:2100,h:[1,.07,.03,.09,.02],                     sub:.92,dr:1.15,fq:460,fr:4.8,gr:1,lope:0,wob:0,crk:0,vol:1.04,nz:1.5,fLen:1.24,fHz:8, fJit:.09,whine:9,fmt:[ 46,0.5,2.8]},  // 26 ANTIMATIÈRE : le sub qui aspire
 {i:96, r:2400,h:[1,.13,.07,.12,.04,.08],                 sub:.60,dr:1.25,fq:700,fr:5.6,gr:1,lope:0,wob:0,crk:0,vol:1,   nz:1.6,fLen:1.30,fHz:17,fJit:.20,whine:32,fmt:[ 62,0.8,2.2]}, // 27 DISTORSION : la route qui recule
 {i:88, r:2200,h:[1,.22,.12,.18,.08,.11],                 sub:.72,dr:1.5, fq:620,fr:5.4,gr:1,lope:0,wob:0,crk:.25,vol:1.08,nz:2.6,fLen:1.40,fHz:15,fJit:.30,whine:18,fmt:[ 70,0.9,3.6]}, // 28 COMÈTE : elle BRÛLE, donc elle rugit
 {i:120,r:2900,h:[1,.16,.09,.15,.06,.10,.04],             sub:.80,dr:1.4, fq:820,fr:5.7,gr:1,lope:0,wob:0,crk:0,vol:1.08,nz:2.2,fLen:1.44,fHz:19,fJit:.24,whine:28,fmt:[ 52,0.6,3.0]}, // 29 SUPERNOVA
 {i:56, r:3300,h:[1,.05,.02,.07,.015],                    sub:1.00,dr:1.3, fq:900,fr:5.8,gr:1,lope:0,wob:0,crk:0,vol:1.10,nz:1.3,fLen:1.50,fHz:6, fJit:.05,whine:34,fmt:[38,0.4,2.6]}  // 30 TROU NOIR : le plus GRAVE et le plus AIGU à la fois, rien au milieu
];
/* <<<FIN SON-MOTEUR>>> */
/* (2026-10-14, session SON) COMPARER LE GENOU EN JEU : `?genou=0` dans l'adresse (iPhone compris) ou dbgGenou(0) / dbgGenou(1) à la console. */
try{if(/[?&]genou=0\b/.test(location.search))ENG_DOUX=false;}catch(_){}
/* (2026-10-14, session SON) LE MOTEUR RESPIRE. À vitesse tenue la hauteur était figée au hertz près (audit n°3 §8 : `wob` ne vit que sous
   29 % de régime, `drift9` ne touche que le filtre) — un bourdon fixe sur les longues lignes des paliers 20-30, sans rapports. Deux sinus
   lents sans rapport simple (0,23 et 0,37 Hz : jamais un vibrato, jamais Math.random par image) bougent la hauteur de ±0,7 % au plus
   (12 cents, bien sous le demi-ton). Il ne s'allume qu'APRÈS le tremblement du ralenti (`wob`, éteint à 29 % de régime) : plein à 49 %. */
function engSouffle(t,rpm){return .007*(.62*Math.sin(t*1.45)+.38*Math.sin(t*2.31+1.7))*Math.min(1,Math.max(0,(rpm-.29)/.2));}
window.dbgGenou=function(v){if(v!=null)ENG_DOUX=!!v;return {genou:ENG_DOUX,hz:ENG_GENOU,puissance:ENG_GENOU_P};};
/* (2026-10-05) LES RÉGLAGES D'UNE IMAGE APPLIQUÉS AUX NŒUDS DU MOTEUR — sortis de la boucle de course pour que le BURN-OUT du garage
   (voir LE BURN-OUT) fasse chanter le MÊME moteur, au même timbre, sans recopier une ligne. */
function engApplique(P9){
  const T=AC.currentTime;
  stt(osc.frequency,P9.fF,T,.035);
  stt(osc2.frequency,P9.fF,T,.04);
  stt(osc2.detune,P9.detune,T,.07);   // l'ÉPAISSEUR : deux voix qui s'écartent battent
  stt(engSub.frequency,P9.subF,T,.05);
  stt(engNzF.frequency,P9.nzF,T,.06);
  stt(engNzG.gain,P9.nzG,T,.07);
  if(P9.whineOn)stt(engWhine.frequency,P9.whineF,T,.04);
  stt(engWhineG.gain,P9.whineG,T,.06);
  stt(engPre.gain,P9.drv,T,.06);
  stt(engPost.gain,P9.post,T,.06);
  stt(engEq.gain,P9.eq,T,.09);
  stt(engMix.gain,P9.mix,T,.05);
  stt(engSubG.gain,P9.subG,T,.08);
  stt(engTickO.frequency,P9.tickF,T,.03);
  stt(engTickG.gain,P9.tickG,T,.07);
  stt(pinkG.gain,P9.pinkG,T,.10);
  stt(transO.frequency,P9.transF,T,.08);
  stt(diffO.frequency,P9.diffF,T,.08);
  stt(transG.gain,P9.transG,T,.10);
  stt(diffG.gain,P9.diffG,T,.10);
  stt(ovrF.frequency,P9.ovrF,T,.06);
  stt(ovrG.gain,P9.ovrG,T,.05);
  stt(filt.frequency,P9.lp,T,.06);
  stt(gainN.gain,P9.ev,T,.08);
  stt(engLfo.frequency,P9.lfoF,T,.1);
  stt(engLfoG.gain,P9.lfoG,T,.1);
}
function engCurve(k){ // courbe de saturation tanh — le grain qui devient hargne quand on pousse dedans
  const n=256,c=new Float32Array(n);
  for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*k)/Math.tanh(k);}
  return c;
}
// ⚠ RENOMMÉ `engSetTier` (2026-08-05) : il ne charge plus une voix de CAISSE mais la voix du
// PALIER MOTEUR. Le nom `engSetCar` mentait depuis qu'on a tranché « le bruit du moteur, c'est
// le moteur » — et un nom qui ment finit toujours par faire recâbler quelqu'un à la mauvaise
// source. `lv` est maintenant un index de `ENG_SND`, c'est-à-dire `engTier` lui-même.
function engSetTier(lv){ // changement de palier → nouveau timbre (onde harmonique + grain + sub), à chaud
  if(!AC||!osc)return;
  const e=ENG_SND[lv]||ENG_SND[0];engLvl=lv;engGear=1;engShiftT=0;
  const w=engWave9(AC,e);                       // l'onde du palier — fabriquée par le bloc balisé
  osc.setPeriodicWave(w);osc2.setPeriodicWave(w);osc2.detune.value=7;
  // LA GORGE du palier : fixe, elle ne suit pas le régime (c'est tout l'intérêt)
  if(engFmt){const F=e.fmt||[110,1.2,3];
    engFmt.frequency.value=F[0];engFmt.Q.value=F[1];engFmt.gain.value=F[2];}
  engSubG.gain.value=e.sub*.5;
  engShaper.curve=engCurve(e.dr);
}
function crackle(amt){ // crépitements d'échappement au lâcher : pop-pop-pop dense puis qui s'égrène
  if(!sfxOk())return;
  try{
    const t0=AC.currentTime;let tt=0;
    const n=2+Math.floor(Math.random()*4+amt*3);
    for(let i=0;i<n;i++){
      const src=AC.createBufferSource();src.buffer=noiseBuf(.06);
      const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=1.6;f.frequency.value=280+Math.random()*620;
      const g=AC.createGain();const big=Math.random()<.2;
      g.gain.setValueAtTime(big?.3:.08+Math.random()*.13,t0+tt);
      g.gain.exponentialRampToValueAtTime(.001,t0+tt+(big?.06:.03));
      src.connect(f);f.connect(g);g.connect(MASTER);src.start(t0+tt);src.stop(t0+tt+.09);
      tt+=.03+Math.random()*.08*(1+i*.3);
    }
  }catch(e){}
}
// (2026-09-25) LA GARDE DES SONS PONCTUELS : contexte absent, SON coupé, pause ou iOS « interrupted » → on ne fabrique RIEN.
// Sans elle, chaque pièce, pop et carillon était créé sur une horloge figée, gardé en mémoire, puis joué d'un bloc au rallumage.
function sfxOk(){return !!AC&&SND.sfx&&AC.state==='running';}
