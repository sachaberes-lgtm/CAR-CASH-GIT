/* ====================== LA CADENCE STABLE — CAD (2026-10-14, passe perf mobile ; Sacha : « fluide même sur un iPhone 7 », « sans bugger ») ======================
   Un téléphone qui ne tient pas 60 images/s n'en affiche pas « 45 » : il alterne des images de 16,7 ms et de 33,3 ms au hasard, et c'est
   CETTE irrégularité que le joueur appelle « ça bug ». 30 images/s RÉGULIÈRES (une image d'écran sur deux, toujours la même) se lisent
   bien mieux. CAD cale donc la boucle sur 33,3 ms quand 60 ne tient pas, et la relâche quand la marge revient.
   · EN TEMPS, pas « une image sur deux » : on saute l'appel de rAF tant qu'il ne s'est pas écoulé 33,3 ms − une demi-période d'écran depuis
     la dernière image CALCULÉE. Sur un écran 60 Hz ça donne une sur deux, sur un 120 Hz une sur quatre, et quand iOS bride déjà l'écran à
     30 Hz (économie d'énergie) plus rien n'est sauté. La période d'écran = le plus petit intervalle entre deux rAF sur 90 appels, ramené
     à une fréquence connue (Safari arrondit les horodatages à 1 ms : on lit 16 ou 17, jamais 16,67).
   · Une image sautée ne fait RIEN (ni `last`, ni moyenne, ni anneau QLR) : le `dt` de la suivante vaut ~33 ms tout seul (borné à 50 ms
     comme toujours) — exactement le chemin déjà vécu quand iOS impose 30 Hz. La simulation ne change pas.
   · ON ENTRE (en course seulement, `cadence30`) quand plus d'un quart des images ratent la synchro (`QLR.p75` > 19 ms) de façon TENUE et
     « calme » (ni reconstruction de zone, ni retour d'onglet, ni 30 Hz imposé, ni essai de résolution de l'échelle QL en cours) :
     `cadenceTenue` = 1 s sur l'ANCIEN, 2 s sur le MOYEN. Et sur l'ANCIEN, DÈS LE DÉPART de la course (`cadenceDepart`) : mesuré, une
     course lui demande ~250 appels de dessin et ~1 M de triangles — il ne tient jamais 60 ; partir à 60, c'est lui offrir à CHAQUE partie
     les secondes hachées qu'on veut supprimer. S'il a de la marge (niveau léger, palier mal deviné), la règle de sortie le rend à 60 en 5 s.
   · ON SORT quand le TRAVAIL d'une image (processeur, de `QLR.t0` à la fin de `loop` : fiable même à 30 i/s) reste sous 10 ms pour plus
     de 9 images sur 10 pendant 5 s (10 ms : il reste 6,7 ms à la puce et au compositeur sur 16,7) : ESSAI de retour à 60. Si dans les 10 s
     la lenteur revient (1 s tenue), retour à 30 et MUR — 60 s, doublé à chaque échec jusqu'à 8 min (Safari ne chronomètre pas la puce :
     l'essai et le mur sont le filet ; quand la sonde `QLR.vrai` vient de dire > 13 ms, on ne tente même pas).
   · L'ÉCHELLE QL NE S'Y TROMPE PAS : calée, chaque image dure 33 ms — lue telle quelle, la règle (19 / 24 / 17,8 ms) y verrait de la lenteur
     et sabrerait la résolution. On lui donne la durée RAMENÉE À UNE IMAGE D'ÉCRAN (`ms9` = durée − (33,3 − période d'écran)) : à l'heure =
     16,7 ; en retard de 10 ms = 26,7. Toute la règle marche donc telle quelle « contre 30 », et le détecteur de 30 Hz imposé (`loop._r30`,
     qui lit `loop._ms` entre 29,5 et 37,5) ne se déclenche pas sur NOTRE cadence. `rawMs` reste la durée VRAIE (temps de course, moniteur).
   · `cadenceMonte` : calé, l'échelle peut-elle REMONTER ? ANCIEN oui (elle est tenue par `qlMin`, et à 30 i/s il regagne sa netteté) ;
     MOYEN non — sinon elle remplirait les 33 ms de qualité et le travail ne repasserait jamais sous 10 ms : il resterait à 30 pour toujours
     alors qu'il tient 60 un cran plus bas. Lui retourne d'abord à 60, PUIS remonte.
   Palier RÉCENT : sur l'ordinateur `CAD.ok` = 0 → un test faux par point d'accroche, rien d'autre ; sur un téléphone, voir CAD30_REC (2026-10-24). Hors course (accueil, garage, écran de fin) : jamais calé.
   Banc : `dbgCadence()` décrit, `dbgCadence(30)` force, `dbgCadence(60)` coupe et fige, `dbgCadence(0)` rend la main. */
/* (2026-10-14, décision de Sacha 3 h 30) ROUVERT (7 h 50) : le choc balayé de DEBUGGING est dans le jeu ; preuve perf/banc/chef/v13.cjs (trafic niv. 19, satellites au sol et en vol, 163 / 400 / 8 010 km/h, plein axe et de biais : 20/20 chocs à 30 i/s, 0 faux positif ; l'ancien code ratait). Avant : interrupteur fermé, à 20-30 i/s la caisse traversait le trafic. `dbgCadence(30)` force toujours au banc. */PAL.B.cadence30=[1,1,0];PAL.B.cadenceDepart=[1,0,0];PAL.B.cadenceTenue=[1000,2000,2000];PAL.B.cadenceMonte=[1,0,0];
/* ===== LE TÉLÉPHONE RÉCENT QUI CHAUFFE SE CALE AUSSI SUR 30 (2026-10-24, passe perf iPhone — Sacha, sur la question « quand l'iPhone chauffe, il ne tient
   plus 60 et le jeu saccade entre 17 et 45 i/s » : « 30 i/s stables si chaud ») =====
   MESURÉ dans l'app sur l'iPhone 13 Pro (CC BANC, puis Sacha à la main, enregistreur de PERF-PC) : froid, 58-60 i/s ; au bout de 3-4 min iOS bride la puce
   (sonde CPU ×2) et la course tombe à 17-45 i/s, irrégulière, alors même que l'échelle QL est descendue au cran 9-13. Le palier RÉCENT n'avait pas la cadence :
   il hachait. Désormais, sur un VRAI téléphone (TEL_NATIF) au palier RÉCENT, la même règle que MOYEN : 60 tant qu'il tient ; calé sur 33 ms quand plus d'un
   quart des images ratent la synchro pendant 2 s ; retour à 60 quand le travail repasse sous 10 ms (essai, puis mur de 60 s doublé). `cadenceMonte` RÉCENT = 0 :
   calé, l'échelle ne remonte pas — deux fois moins d'images ET pas plus lourdes, la puce refroidit (sur l'ordinateur CAD reste éteint : la colonne 3 n'y joue pas).
   `?cad30=0` = avant (RÉCENT à 60, haché). Le RÉCENT qui tient 60 ne voit aucune différence (règle d'or). */
const CAD30_REC=TEL_NATIF&&PAL.n===2&&!/[?&]cad30=0\b/.test(location.search);
const CAD={ok:(PAL.b('cadence30',0)||CAD30_REC||POSTE.auto)?1:0, /* (2026-11-10) l'ordinateur aussi, en DERNIER recours : voir posteCadOk (moteur/poste-juge.js) */on:false,gel:false,force:0,per:1000/30,ecran:1000/60,tol:1000/120,der:0,clk:0,derP:0,rp:0,eMin:99,eN:0,
  w:0,wMax:10,wh:0,calT:0,lT:0,vu:0,crs:false,calme:false,essT:0,murT:0,murD:30000,entrees:0,sorties:0};
const FPS_CAP=!/[?&]fps=0\b/.test(location.search); /* (2026-10-20) le plafond à 60 i/s — voir le début de loop */
/* (2026-10-20, Sacha : « beaucoup de freeze et de latence sur la version vercel ») LE PLAFOND EN IMAGES ENTIÈRES. L'horloge cumulée à 1000/60
   tombait entre deux images d'écran sur un écran qui n'est pas un multiple de 60 Hz — SIMULÉ : 90 Hz → 11 / 22 ms en alternance, 144 Hz →
   14 / 21 ms, 75 et 100 Hz idem (des à-coups là où l'écran était fluide), et sur un écran à ~61 Hz une image sautée chaque seconde. On saute
   désormais UNE IMAGE D'ÉCRAN SUR n, n entier = la fréquence ÷ 60 arrondie au-dessous : 120 Hz → 60 i/s, 240 → 60, 144 → 72, toutes à la
   même cadence ; sous ~110 Hz (60, 75, 90, 100) rien ne se saute. La période d'écran = la MÉDIANE des intervalles entre deux rAF sur 90 (le
   minimum, lui, sous-estime la période dès que les horodatages tremblent : simulé à 144 Hz ± 0,6 ms, n hésitait entre 2 et 3) ; un jeu qui
   rame allonge la médiane, n baisse, on saute moins — jamais trop. Le seuil est à mi-chemin entre (n−1) et n images d'écran. */
const FPS={rp:0,eN:0,n:1,per:1000/60,der:0,a:new Float32Array(90)};
function fpsSaute(now){ // en tête de loop : rend true si cette image d'écran se saute
  const d=now-FPS.rp;FPS.rp=now;if(d>2&&d<100)FPS.a[FPS.eN++]=d;
  if(FPS.eN>=90){FPS.a.sort();FPS.per=FPS.a[45];FPS.n=Math.max(1,Math.floor(1000/FPS.per/60+.2));FPS.eN=0;}
  if(FPS.n<2)return false;
  if(now-FPS.der<FPS.per*(FPS.n-.5))return true;
  FPS.der=now;return false;}
/* ===== LA PÉRIODE D'ÉCRAN EN MÉDIANE (2026-10-25, passe perf mobile, mesure de base : « la cadence 30 est hachée ») =====
   MESURÉ dans l'app (liv4, 13 Pro à 37 °C) : `dbgCadence().ecran` = 6,94 (écran lu à 144 Hz) alors que les images arrivent toutes les ~17 ms. Cause : le PLUS PETIT
   intervalle de 90 images (`eMin`) tombe sous 7,7 ms dès qu'une image en retard est suivie d'une image de rattrapage. `tol` (demi-période) devient 3,5 ms au lieu
   de 8,3 : une image qui arrive à 26-30 ms est SAUTÉE alors que la cadence 30 la voulait, et la suivante part à ~56 ms. `fpsSaute` (plafond à 60) lit déjà la
   MÉDIANE depuis le 20/10 pour la même raison. Même règle ici. `?mob_ecran=0` = l'ancien minimum (banc A/B). */
const HUD_SOBRE=/[?&]hudsobre=1\b/.test(location.search); /* (2026-11-12) LE HUD SOBRE EST ÉTEINT (banc : ?hudsobre=1) : poser puis retirer `animation:none` relançait les animations restées `.on` (« CHAÎNE PERDUE » rejouée à chaque pause ou refroidissement). Ce qu'il gagnait venait des filtres : l'écriture allégée (html.ecrLeger, hudCalmeTick) les retire désormais en permanence, sans toucher aux animations. */const CAD_E30=!/[?&]cad_e30=0\b/.test(location.search);const CAD_ECO_F=/[?&]eco=1\b/.test(location.search); /* (2026-11-12, ios-ultime vague 2, Sacha : « ça doit marcher même en économie d'énergie ») CAD.eco : l'app dit que l'iPhone est en économie d'énergie (window.__ccEco, GardeThermique) ET l'écran n'envoie bien que ~30 images par seconde. Alors une image de 33 ms est une image À L'HEURE : la règle de qualité la lit ramenée à une image d'écran (ms9 dans loop, comme une course calée) — elle ne descend plus au cran 10 pour rien et ne cale plus pour rien ; une image vraiment ratée (66 ms) compte toujours. `?eco=1` = le dire à la main (banc). */const MOB_ECRAN=!/[?&]mob_ecran=0\b/.test(location.search);const MOB_EA=new Float32Array(90);let MOB_EN=0;
function cadSaute(now){ // en tête de loop : rend true si cette image d'écran se saute
  if(MOB_GOUV)mobGouvTick(now); /* (2026-10-25) la dose de chaleur suit l'horloge — voir moteur/gouverneur-thermique.js */
  const d=now-CAD.rp;CAD.rp=now;CAD.rN=(CAD.rN|0)+1;if(d>3&&!(d>=CAD.rMin))CAD.rMin=d; /* (2026-11-12, ios-ultime vague 2) la boîte de vol compte les images d'ÉCRAN reçues (avant tout saut) : dit si l'écran lui-même est bridé à 30 */if(MOB_ECRAN){if(d>3&&d<100)MOB_EA[MOB_EN++]=d;}else if(d>3&&d<CAD.eMin)CAD.eMin=d;
  if(MOB_ECRAN?MOB_EN>=90:++CAD.eN>=90){const m=MOB_ECRAN?(MOB_EA.sort(),MOB_EN=0,MOB_EA[45]):CAD.eMin;CAD.eN=0;CAD.eMin=99;CAD.em=m;CAD.ecran=m<7.7?1000/144:m<9.7?1000/120:m<12.6?1000/90:m<15?1000/75:1000/60;CAD.tol=(CAD_E30&&m>=24)?CAD.per*.5:CAD.ecran*.5;CAD.eco=CAD_E30&&m>=24&&(window.__ccEco===1||CAD_ECO_F);if(CAD.eco&&CAD.gel&&!(MOB_GOUV&&mobChaud()))CAD.gel=false;} /* (2026-11-12, ios-ultime vague 2, MESURÉ sur le 13 Pro, build 52) L'ÉCRAN DÉJÀ À 30 : le téléphone n'envoie que ~32 images d'écran par seconde (chaud ou en économie d'énergie), à intervalles irréguliers (22 à 33 ms). Avec la tolérance d'un écran 60 Hz (8,3 ms), une image arrivée 22-24 ms après la précédente était SAUTÉE et la suivante partait à ~55 ms : 22 i/s en vol au lieu de 30 (au sol 29). Quand la médiane des images d'écran dépasse 24 ms, la tolérance devient une demi-période de 30 (16,7 ms) : plus rien ne se saute, il n'y a rien à sauter. `?cad_e30=0` = comme avant. */ // 30 Hz imposé (m ≈ 33) : on garde 60, rien ne se saute de toute façon
  if(!CAD_HORLOGE){if(CAD.on&&now-CAD.der<cadPer()-CAD.tol)return true;CAD.der=now;return false;}
  const per=cadPer();if(per!==CAD.derP){CAD.derP=per;CAD.clk=now-per;} /* la cadence change (30 ⇄ 20) : l'horloge repart de cette image */
  if(!CAD.on){CAD.der=now;CAD.clk=now;return false;}
  if(now-CAD.der<per-CAD.tol||(!(CAD.em>per*.9)&&now-CAD.clk<per-CAD.tol))return true; /* (l'horloge ne juge pas quand l'écran lui-même ne livre pas plus vite que la cadence visée — médiane des images d'écran > 0,9 période : un écran à 30 qui tremble ne perd pas d'image) */ /* la règle d'avant (jamais deux images calculées plus près qu'avant) ET l'horloge cumulée (jamais plus de 1000/per par seconde) */
  CAD.der=now;CAD.clk=Math.max(CAD.clk+per,now-per);CAD.hN=(CAD.hN|0)+1;return false;} /* (lot lenteur) L'HORLOGE CUMULÉE : l'échéance avance d'UNE période ; elle ne traîne jamais plus d'une période derrière l'image (arrière-plan, pause, gel : pas de rafale de rattrapage) */
/* ===== L'HORLOGE DU CALAGE (2026-11-17, qualité · lot lenteur — analyse du vol du build 120 : « la fuite du calage ») =====
   PROUVÉ dans le vol (cadence.js, cadSaute) : une image d'écran n'était sautée que si elle arrivait moins de `per − tol` (25 ms) après la dernière image CALCULÉE, puis `CAD.der=now`.
   Quand les images d'écran arrivent de travers (écran à 60 en économie, 120 Hz, images en retard), chaque image calculée à 26-30 ms repoussait l'échéance d'autant :
   81 secondes sur 864 calculaient 34 à 44 images par seconde au lieu de 30 (636 images de trop dans ce vol, jusqu'à −25 % de travail dans les secondes tièdes).
   Désormais une seconde échéance, une HORLOGE (`CAD.clk`), avance d'UNE période à chaque image calculée (`CAD.clk += cadPer()`) : une image d'écran ne se calcule que si la règle
   d'avant l'accepte (au moins `per − tol` depuis la dernière image calculée : jamais d'intervalle plus court qu'avant, donc pas d'à-coup de rattrapage) ET si l'horloge l'accepte
   (au moins `per − tol` après l'échéance) — jamais plus de 30 (ou 20) images calculées par seconde (+1 au plus, la marge d'une période).
   Quand l'écran lui-même ne livre pas plus vite que la cadence visée (médiane des images d'écran `CAD.em` > 0,9 période : l'écran à 30 de l'économie, visé 30), l'horloge
   ne juge pas : il n'y a rien à fuir, et un écran qui tremble autour de 33 ms y perdait une image toutes les 8 s (simulé).
   L'horloge ne traîne jamais plus d'une période derrière l'image (`max(clk + per, now − per)`) : une image en retard donne au plus une période d'avance aux suivantes (le
   tremblement d'un écran à 30 en économie s'absorbe), un gel, l'arrière-plan ou la pause ne font jamais rattraper ; elle repart au calage (cadPose) et au changement de cadence.
   `?sans=cadhorloge` = l'échéance d'avant (CAD.der = l'image). Banc : outils/banc-lenteur/horloge.cjs (régularité à 60, 120 et 30 Hz simulés). */
const CAD_HORLOGE=!/[?&]sans=[^&]*cadhorloge/.test(location.search);
/* ===== LA CADENCE DE SURCHAUFFE (2026-11-13, ios-ultime — Sacha : « j'ai eu des gros freeze au palier 1 », puis « oui fais-le et surtout trouve des leviers pour baisser la chaleur ») =====
   LU dans le vol du build 102 : téléphone à l'état CRITICAL (en charge à 50 %), iOS bride le processeur ~×10 — 13,6 i/s en dents de scie, 40 à 63 ms de script par image. À critical la course
   est désormais calée sur 20 i/s (une image toutes les 50 ms : exactement le pas de temps maximal du jeu, donc ni ralenti ni rattrapage) : un tiers de travail en moins par seconde, pour
   que le téléphone redescende au lieu de s'y maintenir. Tant qu'il reste bridé ×10 l'image ne sera pas fluide — c'est l'état d'avant (serious) qu'il faut ne pas dépasser.
   `?sans=crit20` = 30 i/s visées comme avant. ESSAI à une variable pour les watts : `?cadfps=20` (ou 24) impose cette cadence à TOUT état — rien sans le paramètre. */
const CAD_CRIT20=TEL_NATIF&&!/[?&]sans=[^&]*crit20/.test(location.search),CAD_FPS_ESSAI=+((/[?&]cadfps=(\d+)\b/.exec(location.search)||[])[1])||0;
function cadPer(){if(CAD_FPS_ESSAI>=10&&CAD_FPS_ESSAI<30)return 1000/CAD_FPS_ESSAI;
  if(GVL.on&&CAD_CRIT20)return 50; /* (2026-11-17, lot lenteur, ?plus=gouvlent) une rafale de lenteur : le chemin du critical (20 i/s) — voir moteur/gouverneur-thermique.js */
  if(CAD_CRIT20){try{if(MOB_S.capteur&&MOB_S.thermo>=3)return 50;}catch(e){}}
  return CAD.per;}
function cadPose(v,now,pq){if(v===CAD.on)return;CAD.on=v;if(v)CAD.pq=pq||'?'; /* (2026-11-14, LE JUGE DU PROFIL) pourquoi on est calé : 'chaud' (gouverneur), 'reactif' (60 ne tenait pas), 'depart', 'force' — voir moteur/profil-juge.js */if(v&&MOB_GOUV)mobReactif();CAD.gel=v&&((!PAL.b('cadenceMonte',1)&&!CAD.eco)||(MOB_GOUV&&mobChaud()));/* (2026-11-12, ios-ultime) en économie d'énergie (CAD.eco) être calé ne veut rien dire — l'écran est à 30 de toute façon : l'échelle de qualité reste libre de remonter, sauf téléphone chaud */CAD.der=now;CAD.lT=0;CAD.calT=now;
  QLR.i=0;QLR.n=0; // l'anneau repart : les centiles ne mélangent pas des durées vraies et des durées ramenées
  if(v){CAD.entrees++;loop._ms=Math.max(CAD.ecran,(loop._ms||16)-(CAD.per-CAD.ecran));}else CAD.sorties++;}
/* ===== LE GOUVERNEUR DOUX (2026-11-14, Sacha : « les graphismes ne sont pas au maximum » ; mesuré build 116) — le gel de l'échelle QL =====
   Calé par la chaleur, l'échelle QL ne remontait plus (CAD.gel) : avec le 30 dès le départ (MOB_FROID30) elle ne pouvait que DESCENDRE de toute la session. Sur téléphone profilé
   (`gdxOn()`, moteur/gouverneur-paliers.js), calé ou non, elle redevient libre de remonter — d'un cran, quand l'image a tenu `QL_DOUX.tenu` (20 s) depuis le dernier changement
   de cran et depuis la dernière image qui tirait (p75 au-dessus du seuil de descente, `imgQlP75`) ; la toile ne change pas plus d'une fois toutes les 10 s (qlDoux, rendu/nettete-qualite.js).
   `?sans=gouvdoux` = le gel d'avant. */
const GDX_GEL=!/[?&]sans=[^&]*gouvdoux/.test(location.search),GDX_G={malT:0,lent:0,ref:1};
window.dbgGouvLent=function(ms){GDX_G.lent=Math.max(0,Math.min(200,+ms||0));GDX_G.ref=Math.max(.5,curDPR);return GDX_G.lent;}; /* (banc) un téléphone LENT dont le coût suit les pixels : ms × (DPR / DPR au moment de l'appel)² de travail par image de course */
function gdxGel(now){let s=19;try{s=PAL.bT('imgQlP75',24,'f');}catch(e){}if(QLR.p75>s)GDX_G.malT=now;
  return now-Math.max(GDX_G.malT,QL.kT||0)<QL_DOUX.tenu;} /* vrai : l'échelle reste gelée (pas encore 20 s tenues) */
function cadFin(now){ // en fin de loop (avant la sonde, qui attend la puce) : le travail de l'image, puis la décision
  if(GVL_INJ.ms>0)gvlInj(); /* (banc, dbgRafale) une rafale simulée : du travail DANS l'image */
  const w=performance.now()-QLR.t0;CAD.w=CAD.w*.9+w*.1;if(GVL.ok)gvlTick(now,w); /* (2026-11-17, lot lenteur, ?plus=gouvlent) le gouverneur de lenteur lit le travail de l'image */CAD.wh=CAD.wh*.97+(w>CAD.wMax?1:0); // wh : compteur fuyant, ≥ 3 ≈ plus d'une image sur dix au-dessus de wMax
  const d=Math.min(100,now-CAD.vu);CAD.vu=now; if(HUD_SOBRE&&now-(CAD.hsT||0)>500){CAD.hsT=now;let h=false;try{h=TEL_NATIF&&started&&running&&!gameOver&&!paused&&!garageOn&&mobChaud()&&!(BV.on&&BV.lev!=='base');}catch(e){}if(h!==!!CAD.hs){CAD.hs=h;document.body.classList.toggle('hudSobre',h);try{if(h&&BV.c)BV.c.hs=1;}catch(e){}}} /* LE HUD SOBRE : téléphone chaud, en course — voir css/hud-da.css ; dans un build de mesure, une course à levier garde son levier */
  if(POSTE.auto)posteJuge(now); /* (2026-11-10) le juge du régime de l'ordinateur — moteur/poste-juge.js */
  if(PJG.on)prfJuge(now); /* (2026-11-14) le juge du profil de l'iPhone — moteur/profil-juge.js */
  if(CAD.force)return;
  if(CAD.on&&PRF.on&&PRF.T.n10&&(CAD.pq==='chaud'||CAD.pq==='reactif'))CAD.pq=MOB_GOUV&&mobChaud()?'chaud':'reactif'; /* (2026-11-15, relecture n10) la RAISON du calage suit l'état : un calage « chaud » devenu réactif après refroidissement (la sortie bloquée par le travail) se juge ; 'depart' et 'force' restent. Profilé seulement (seul le juge du profil la lit) ; `?sans=pqsuit` = sans */
  if(MOB_GOUV&&CAD.on&&mobChaud())CAD.gel=true; /* (2026-10-25) calé par chaleur : l'échelle QL ne remonte pas, même si l'entrée était réactive */
  if(GDX_G.lent>0&&started&&running&&!gameOver&&!paused&&!garageOn){const f=performance.now()+GDX_G.lent*Math.pow(curDPR/GDX_G.ref,2);while(performance.now()<f){}} /* (banc, dbgGouvLent) */
  if(CAD.on&&GDX_GEL&&gdxOn())CAD.gel=gdxGel(now); /* (2026-11-14, LE GOUVERNEUR DOUX) calé, l'échelle remonte quand même — après 20 s tenues (voir gdxGel) */
  if(!(started&&running&&!gameOver&&!garageOn)){CAD.crs=false;CAD.lT=0;if(CAD.on){cadPose(false,now);CAD.sorties--;}return;} // hors course : jamais calé (et ce n'est pas une « sortie »)
  if(paused)return; // en pause : l'état reste tel quel
  if(!CAD.crs){CAD.crs=true;CAD.lT=0;CAD.essT=0;if((PAL.b('cadenceDepart',0)||(MOB_GOUV&&mobChaud()))&&!loop._r30)cadPose(true,now,(MOB_GOUV&&mobChaud())?'chaud':'depart');return;} // le départ de la course (2026-10-25 : et d'une course qui démarre déjà chaude — gouverneur thermique)
  if(MOB_GOUV&&!CAD.on&&!loop._r30&&mobChaud()){CAD.essT=0;cadPose(true,now,'chaud');return;} /* (2026-10-25) la course devient chaude (dose ou état iOS) : calage immédiat, sans attendre les images ratées */
  if(!CAD.calme||QL.essai){CAD.lT=0;CAD.calT=now;return;}
  if(!CAD.on){const ess9=CAD.essT>0&&now-CAD.essT<10000;
    CAD.lT=QLR.p75>19?CAD.lT+d:0;
    if(CAD.lT>(ess9?1000:PAL.b('cadenceTenue',2000))&&posteCadOk(now)){
      if(ess9){CAD.murT=now;CAD.murD=Math.min(480000,CAD.murD*2);} // l'essai de 60 a échoué : un MUR (60 s, puis 2, 4, 8 min)
      CAD.essT=0;cadPose(true,now,'reactif');}
    else if(CAD.essT>0&&!ess9){CAD.essT=0;CAD.murD=30000;}} // l'essai a tenu 10 s : 60 est acquis, le mur repart de zéro
  else if(CAD.wh>=3||(CAD.murT>0&&now-CAD.murT<CAD.murD)||(QLR.vraiT&&now-QLR.vraiT<20000&&QLR.vrai>13)||(MOB_GOUV&&mobChaud())||GVL.on)CAD.calT=now; /* (2026-10-25) chaud : la sortie réactive ne joue pas — (2026-11-17, lot lenteur) ni pendant une rafale de lenteur */
  else if(now-CAD.calT>5000){cadPose(false,now);CAD.essT=now;}}
/* ===== LE HUD CONTEMPLATIF + L'ÉCRITURE ALLÉGÉE (2026-11-12, Sacha) — voir css/hud-da.css. hudCalmeTick est appelé à chaque image de loop. Vrai téléphone seulement (TEL_NATIF, donc aussi ?tel=1 au banc).
   Le HUD s'efface quand le nitro est relâché depuis 0,9 s, en course, hors leçon d'auto-école ; il revient au nitro, en pause, à la mort, et quand le chrono de vol passe à l'urgence (on ne meurt pas sans l'avoir vu). */
const HUD_CALME={ok:!/[?&]sans=[^&]*hudcalme/.test(location.search),leger:!/[?&]sans=[^&]*ecrleger/.test(location.search),on:false,t:0,pose:false,air:null};
/* ===== LE JS PAR IMAGE (2026-11-16, lot jsimage — Sacha : « beaucoup de lag » sur le build 118 ; téléphone chaud, TOUT le fil ralentit ×8 : chaque ms de JS par image en coûte huit) =====
   Rien ne change à l'écran : le même résultat, moins de calcul. `?sans=jsimage` = exactement l'avant. Banc : outils/banc-jsimage ; journal : passation/qualite/jsimage.md.
   · LA FLAMME DU POUCE NITRO (nxfDessine, interface/boost-icones.js — le plus gros poste du HUD : ≈ 1,5 ms par image au processeur ×6) : chaque case de la boîte essayait les
     huit langues ; désormais seulement celles dont la boîte touche sa ligne, et la ligne n'est parcourue que sur leur largeur. La calotte ne calcule plus atan2 + deux sinus
     là où elle ne peut pas peindre. Mêmes octets dans la toile : prouvé par dbgNxfDouble (les deux versions sur le même état, comparées à chaque dessin).
   · LE VOLANT (stSet, à chaque touchmove — moteur/mobile-tactile.js) : la transformation du bouton et --sl/--sr/--su/--sd ne s'écrivent que si elles changent. */
const JSI={ok:!/[?&]sans=[^&]*jsimage/.test(location.search)};
/* (2026-11-15, Sacha : « en HUD calme les fruits ARRÊTENT D'APPARAÎTRE, mais ceux qui sont déjà là, tu les ramasses ») LA GARDE DU CALME (?sans=calmegarde = comme avant : tout s'efface).
   Concerne les objets que le calme cachait : les FRUITS de nitro (p.nitro, file de la ligne parfaite comprise), les POUVOIRS (p.pow) et les JETONS du final spin (p.spin) ; les pièces n'ont jamais été cachées.
   · à l'entrée du calme, ce qui est déjà dans le couloir de vue (boucle-4-effets.js) est photographié (p.cok = CALG.id) : cela RESTE et se ramasse normalement ;
   · pendant le calme, rien d'autre n'entre dans le couloir (ni ce qui arrive de l'horizon, ni ce qu'un portail vient de poser) ;
   · CALG.was suit le calme tel que la boucle des objets l'a vu (le ramassage peut passer avant elle dans l'image : rien ne surgit entre les deux) ; une partie neuve le remet à zéro (spawnPickups).
   · à la sortie, ce qui est entré pendant le calme et se trouve encore LOIN devant (plus de la moitié du couloir) GRANDIT en 0,5 s (p.cap) ; le reste, trop près pour naître sans se voir, ne vient plus (p.cgo) : pas de paquet d'un coup sous le nez. */
/* (2026-11-15, contrôle adverse) CALG.on = LE CALME DE LA GARDE, tenu par hudCalmeTick : il tombe avec le HUD calme, mais ne se lève qu'au NITRO repris (ou au vol critique qui rallume le HUD)
   EN COURSE — une pause, l'écran de mort, une réanimation, le 3-2-1 de la reprise et les 0,9 s qui suivent ne le lèvent pas : rien n'est jeté, on retrouve l'état d'avant. Partie neuve : calgRaz (resetGame, start).
   À la sortie, seul le TRÈS PROCHE (moins de 0,5 s de route à la vitesse du moment, borné 60-150 m : CALG_PRES) ne vient plus ; tout le reste GRANDIT en 0,4 s. */
const CALG={ok:!/[?&]sans=[^&]*calmegarde/.test(location.search),on:false,id:0,was:false,sortie:false,vus:0,caches:0,neufs:0,perdus:0,pres:0,ret:{f0:0,f1:0,p0:0,p1:0}};
function CALG_PRES(){return Math.min(150,Math.max(60,.5*Math.abs(vA)));}
function calgRaz(){CALG.on=false;CALG.was=false;}
function calmeCache(p){return CALG.ok&&!!(p.nitro||p.pow||p.spin)&&(!!p.cgo||(CALG.was&&p.cok!==CALG.id));}
window.dbgCalmeGarde=function(){let dev=0,cach=0,loin=0,pro=null;for(const p of pickups){if(p.taken||!(p.nitro||p.pow||p.spin)||p.face!==1)continue;const d9=p.s-s;if(d9<0||d9>700)continue;if(calmeCache(p)){cach++;if(d9>CALG_PRES())loin++;}else{dev++;if(pro==null||d9<pro)pro=d9;}}return {ok:CALG.ok,calme:HUD_CALME.on,garde:CALG.on,pres:CALG.pres,ret:CALG.ret,id:CALG.id,vus:CALG.vus,neufs:CALG.neufs,perdus:CALG.perdus,devantVisibles:dev,devantCaches:cach,cachesLoin:loin,prochainVu:pro==null?null:Math.round(pro),zones:runStats.zones|0,vA:Math.round(Math.abs(vA))};};
/* banc (outils/banc-hud/calme-garde.cjs) : dbgCalmeSuivi('pose',k,nom,ds) pose le pouvoir k à ds m et le suit sous `nom` ; ('fruit',nom) suit le premier fruit de la route devant (40-400 m) ; ('pause') bascule la pause ; ('oublie') vide la liste suivie ; ('etat') l'état des objets suivis */
const CALG_S={};
window.dbgCalmeSuivi=function(op,a,b,c){
  if(op==='pose'){const sp=window.dbgPwrDevant(a,c,0);for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];if(p.pow===a&&p.s===sp){CALG_S[b]=p;return 1;}}return 0;}
  if(op==='oublie'){for(const k in CALG_S)delete CALG_S[k];return 1;}
  if(op==='pause'){togglePause();return !!paused;} /* la vraie pause (bouton ⏸) */
  if(op==='fruit'){let m=null;for(const p of pickups)if(!p.taken&&p.nitro&&p.face===1&&p.s-s>40&&p.s-s<400&&(!m||p.s<m.s))m=p;if(m)CALG_S[a]=m;return !!m;}
  return {calme:HUD_CALME.on,garde:CALG.on,paused:!!paused,g:window.dbgCalmeGarde(),o:Object.keys(CALG_S).map(function(k){const p=CALG_S[k];return {k:k,ds:Math.round(p.s-s),vu:!!p.mesh.visible,pris:!!p.taken,cok:p.cok,cgo:!!p.cgo,cap:p.cap==null?null:+p.cap.toFixed(2),sc:+p.mesh.scale.x.toFixed(2)};})};};
if(TEL_NATIF&&!/[?&]sans=[^&]*gvfixe/.test(location.search))try{document.documentElement.classList.add('gvFixe');}catch(e){} /* (2026-11-13) le bouton MISSIONS du garage sans son animation d'entrée, dès la lecture du script : voir css/interface-opti.css §4 */
function hudCalmeTick(now){if(!TEL_NATIF)return;
  if(!HUD_CALME.pose){HUD_CALME.pose=true;if(HUD_CALME.leger)document.documentElement.classList.add('ecrLeger');}
  if(!HUD_CALME.ok)return;
  const course=started&&running&&!gameOver&&!paused&&!garageOn&&!(typeof TUTO!=='undefined'&&TUTO.on)&&mode!=='boom';
  if(!course||nitroOn||keys.Space||keys.ShiftLeft||keys.ShiftRight)HUD_CALME.t=now; /* (2026-11-12, chasse aux bugs du HUD) « quand le joueur RELÂCHE le nitro » : le bouton tenu compte, pas seulement la poussée — réserve à sec, le doigt appuyé, le HUD s'effaçait (et la jauge vide avec lui) */
  let h=course&&now-HUD_CALME.t>900;
  if(h&&mode==='fall'&&HUDV==='d'){const a=HUD_CALME.air||(HUD_CALME.air=document.getElementById('airHud'));if(a&&a.dataset.k==='urgent')h=false;}
  if(CALG.ok){if(h)CALG.on=true;else if(CALG.on&&course&&(nitroOn||keys.Space||keys.ShiftLeft||keys.ShiftRight||now-HUD_CALME.t>900))CALG.on=false;} /* (garde du calme) voir CALG.on : hors course (pause, mort) et pendant la reprise sans nitro, la garde reste calme */
  if(h!==HUD_CALME.on){HUD_CALME.on=h;document.body.classList.toggle('hudCalme',h);sonCalme(h);}}
/* (2026-11-13, Sacha : « en mode HUD calme on doit même plus voir les pièces ou les ramasser… pareil pour les pouvoirs et tout, les sons seule la musique reste ») LE SON DU CALME.
   Les effets, les moteurs et les voix passent TOUS par MASTER → MASTER._vol → MASTER._limIn → le limiteur ; la musique (l'<audio> branché, Pouce bleu) entre dans le limiteur À CÔTÉ de _limIn
   (voir musWaBranche) : fermer _limIn coupe tout sauf elle, sans toucher au réglage SON de Sacha (SND.sfx, SAVE) ni au contexte. Fondu de 0,25 s à la fermeture, retour en 0,1 s au nitro, en pause, à la mort.
   La valeur d'ouverture est celle de musWaSon : .937, ou 0 quand la musique passe par le graphe et que le bouton SON est coupé. Avec le HUD calme, un pickup se prend en silence et sans rien montrer
   (ramassage.js, pwrPrend, magSpirale, flashEcran, zapTick, coinVolTick lisent HUD_CALME.on). */
function sonCalme(h){
  if(!AC||!MASTER||!MASTER._limIn)return;
  try{const p=MASTER._limIn.gain,t=AC.currentTime,ouvert=(musGraphe()&&!SND.sfx)?0:.937;
    p.cancelScheduledValues(t);p.setTargetAtTime(h?0:ouvert,t,h?.08:.03);}catch(e){}}
/* (2026-11-12, chasse aux bugs du HUD) le vol critique ne rallume le HUD qu'avec l'anneau de vol (?hud=d) : par défaut aucun temps de vol ne s'affiche (HUD léger), le HUD revenait sans rien montrer. */
window.dbgHudCalme=function(){return {on:HUD_CALME.on,ok:HUD_CALME.ok,leger:document.documentElement.classList.contains('ecrLeger'),nitro:!!nitroOn,depuis:Math.round(performance.now()-HUD_CALME.t),effets:(AC&&MASTER&&MASTER._limIn)?+MASTER._limIn.gain.value.toFixed(3):null};};
/* ===== LE HUD ENDORMI (2026-11-12, interface-opti — « baisser le coût de l'interface sur iPhone, sans que rien ne se voie ») =====
   MESURÉ (banc outils/banc-interface, Chrome sans fenêtre 390×844, ?tel=1) : les animations EN BOUCLE du HUD (barre de nitro : nitroPlein, hmEclairPret, nbReflet, nbRaye,
   nbBout, hmPlein ; pwrPuls…) tournent encore quand le HUD est INVISIBLE — HUD calme (opacité 0), pause, écran de mort. Chacune refait les styles et repeint à chaque
   image d'écran (60 par seconde, pas la cadence du jeu) : en course calme le style coûtait 48,8 ms/s, en pause 21,9, à l'écran de mort 57,1.
   On les GÈLE par la classe `.hudDortP` (css/interface-opti.css : animation-play-state seulement — jamais `animation:none`, rien ne rejoue ; et pas Animation.pause(),
   qui prendrait la main sur la feuille pour toujours : le reflet du logo de lancement, que la feuille gèle hors `.on`, tournait de nouveau après un réveil).
   Un élément n'est gelé que s'il est invisible (display, visibility ou opacité 0 sur lui ou un parent — pendant le fondu du HUD calme l'opacité n'est pas nulle)
   et que TOUTES ses animations sont des boucles (une annonce, `#slam9`…, n'est jamais gelée). Tout repart dans l'image même où le HUD change d'état (et au clic de
   reprise). La barre de flow n'est pas dans les racines. Vrai téléphone seulement (TEL_NATIF). ?sans=huddort */
const HUD_DORT={ok:!/[?&]sans=[^&]*huddort/.test(location.search),l:[],cle:'',t:0,scan:0,n:0,R:['hud','touchCtl','pwrFx','pwrChip','ajVols','campChip']};
function hudDortVis(el){if(getComputedStyle(el).visibility==='hidden')return false;for(let e=el;e&&e!==document.body;e=e.parentElement){const c=getComputedStyle(e);if(c.display==='none'||+c.opacity===0)return false;}return true;} /* visibility s'hérite et un enfant peut la rétablir : on ne lit que la sienne */
/* HUD CALME : la course TOURNE — une annonce peut apparaître sans que l'état change. On ne gèle donc que sous un conteneur que le HUD calme force à opacité 0
   (!important, la liste de css/hud-leger.css §4, sans la barre de flow) : tant qu'il est posé, rien là-dessous ne peut se montrer. Pause et écran de mort : la partie est figée. */
const HUD_DORT_CALME='#hud>:not(#triade):not(#cashHud):not(#money):not(#engVig):not(#engPop):not(#msg):not(#trickBox),#touchCtl,#pwrChip,#ajVols,#pwrFx,#campChip,#misBan,#slam9,#verdHud,#engBig,#figGl,#tFig,#m2Combo';
function hudDortSousCalme(el){const c=el.closest(HUD_DORT_CALME);return !!c&&+getComputedStyle(c).opacity===0;}
/* (2026-11-13, finition · deux hudReveil) renommée : une seconde `function hudReveil` écrasait celle du HUD discret (pose-verdict.js, hudReveil(id)) dans la fonction commune — la plaque discrète ne se rallumait plus et chaque cran de chaîne dégelait le HUD endormi */
function hudDortReveil(){const l=HUD_DORT.l;for(let i=0;i<l.length;i++)l[i].classList.remove('hudDortP');l.length=0;}
function hudDortClasse(){const c=HUD_DORT.cle;if(!c||!HUD_DORT.l.length)return;const B=document.body.classList; /* le réveil tombe AVANT la peinture suivante (observateur = microtâche), quel que soit le chemin qui rend le HUD */
  if((c==='p'&&!B.contains('hTp'))||(c==='m'&&!B.contains('dead'))||(c==='c'&&!B.contains('hudCalme'))){hudDortReveil();HUD_DORT.cle='';HUD_DORT.t=performance.now();}}
function hudDortTick(now){if(!TEL_NATIF||!HUD_DORT.ok)return;
  const B=document.body.classList,cle=(!started||garageOn)?'' /* (2026-11-13, Sacha : « au retour de MISSIONS dans le garage on ne voit plus le bouton MISSIONS, mais il marche encore ») le garage ouvert après une partie (écran de mort derrière) : rien n'y dort — le bouton MISSIONS, caché pendant l'écran des missions, était gelé, et au retour son entrée (gvMonte, qui part de l'opacité 0) restait figée sur sa 1re image */:(paused&&B.contains('hTp'))?'p':(gameOver&&B.contains('dead'))?'m':HUD_CALME.on?'c':''; /* ce qui CACHE le HUD : la feuille de pause (hTp — pendant le 3-2-1 de la reprise `paused` reste vrai, le HUD est déjà là), l'écran de mort (dead), le HUD calme */
  if(!HUD_DORT.obs&&window.MutationObserver){HUD_DORT.obs=new MutationObserver(hudDortClasse);HUD_DORT.obs.observe(document.body,{attributes:true,attributeFilter:['class']});}
  if(cle!==HUD_DORT.cle){HUD_DORT.cle=cle;HUD_DORT.t=now;hudDortReveil();return;}
  if(!cle||now-HUD_DORT.t<600||now-HUD_DORT.scan<1000)return;
  HUD_DORT.scan=now;
  for(let k=0;k<HUD_DORT.R.length;k++){const r=document.getElementById(HUD_DORT.R[k]);if(!r||!r.getAnimations)continue;const an=r.getAnimations({subtree:true});
    for(let i=0;i<an.length;i++){const a=an[i];if(a.playState!=='running')continue;const t=a.effect&&a.effect.target;if(!t||t.classList.contains('hudDortP'))continue;
      let boucles=true;const to=t.getAnimations();for(let j=0;j<to.length;j++){if(!to[j].animationName)continue;const tm=to[j].effect&&to[j].effect.getTiming();if(!tm||tm.iterations!==Infinity){boucles=false;break;}} /* les transitions (largeur de la jauge…) ne comptent pas : animation-play-state ne les touche pas */
      if(!boucles||hudDortVis(t)||(cle==='c'&&!hudDortSousCalme(t)))continue;t.classList.add('hudDortP');HUD_DORT.l.push(t);HUD_DORT.n++;}}}
/* ===== L'INTERFACE ALLÉGÉE SUR iOS (2026-11-12, interface-opti) — deux réglages de css/interface-opti.css, posés sur un vrai iPhone/iPad seulement (WebKit : vérifiés
   identiques au pixel ; dans Chrome l'antialiasing bouge de quelques niveaux) : §2 LES REFLETS SUR LEUR COUCHE (html.ifReflets, ?sans=reflets) ; §3 LA TRAME DE
   MISSIONS DÉPLACÉE PAR LA PUCE (html.ifTrame, ?sans=trame). */
{const ios9=TEL_NATIF&&(/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Macintosh/.test(navigator.userAgent))),q9=location.search;
  if(ios9&&!/[?&]sans=[^&]*reflets/.test(q9))document.documentElement.classList.add('ifReflets');
  if(ios9&&!/[?&]sans=[^&]*trame/.test(q9))document.documentElement.classList.add('ifTrame');}
window.dbgHudDort=function(){return {ok:HUD_DORT.ok,cle:HUD_DORT.cle,geles:HUD_DORT.l.length,total:HUD_DORT.n,elements:HUD_DORT.l.map(function(e){return e.id||e.className;})};};
/* ===== LES COUCHES DU HUD (2026-11-17, qualité · hudcouches — piste A4 de passation/qualite/CHALEUR-IDEES.md ; Sacha : « le téléphone affiche toujours le maximum de ce qu'il peut afficher ») =====
   Le HUD est du DOM posé sur la toile : WebKit en fait des COUCHES que le système mélange à chaque image. MESURÉ dans WebKit (inspecteur, domaine LayerTree ;
   banc outils/banc-hud/couches-webkit.cjs) : en course 36 à 50 couches, dont 17 à 22 d'éléments À OPACITÉ 0 (le logo du lancement et ses reflets, les voiles plein
   écran #cloudFx #gFade #flash #flash9 #flowGlow #ajVols, #toast, #lvlBan…), certaines avec leur mémoire d'image (jusqu'à 16 Mo à l'annonce) ; au HUD calme, tout
   le HUD à opacité 0 garde ses couches.
   LE VOILE : un élément de la liste dont l'opacité calculée est 0, sans transition ni animation d'opacité en cours, et que rien ne touche (pointer-events: none, lui et
   tout ce qu'il contient), reçoit `.hcVeil` (visibility:hidden, css/interface-opti.css §6). Invisible avant, invisible après : pas un pixel ne change ; WebKit ne le
   peint plus, rend sa mémoire et retire la plupart de ces couches (course 36-50 → 26-29). Rien ne touche aux animations (visibility ne les arrête pas : jamais
   `animation:none`, rien ne rejoue).
   LE RÉVEIL, avant l'image suivante : un observateur (microtâche, donc à la fin de la tranche de JS qui a écrit) regarde l'élément lui-même (classe, style, data-*),
   ses ancêtres, #hud, <body> et <html> ; au moindre changement, chaque élément voilé concerné est relu : opacité plus nulle, ou transition/animation d'opacité qui
   démarre (elle part de 0 : sa première image est la même), le voile tombe. Les éléments nés en course (#flowGlow, #slam9…) sont cherchés toutes les 2 s.
   Hors course (garage, menus) : rien n'est voilé. Vrai téléphone seulement (TEL_NATIF). ?sans=hudcouches */
const HCC={ok:TEL_NATIF&&!/[?&]sans=[^&]*hudcouches/.test(location.search),el:null,vu:null,scan:0,cherche:0,obs:null,hud:null,poses:0,reveils:0,lus:0,rap:0,gcs:0};
const HCC_IDS=['launchLogo','launchGlow','cloudFx','gFade','flash','flash9','flowGlow','ajVols','speedFx','lvlBan','toast','campChip','misBan','popTxt','slam9','verdHud','engBig','figGl','tFig','m2Combo','pwrFx','pwrChip','flowHud'];
if(HCC.ok)try{document.documentElement.classList.add('hudCouches');}catch(e){}
/* LES VOILES AU TIERS (2026-11-17, qualité · voiles) : les voiles plein écran en dégradé (vignette de vitesse, voile du haut, annonce, nuage) peints au tiers et agrandis ×3 (css/interface-opti.css §7). Vrai téléphone ; ?sans=voiles */
if(TEL_NATIF&&!/[?&]sans=[^&]*voiles/.test(location.search))try{document.documentElement.classList.add('voiles');}catch(e){}
if(TEL_NATIF&&/[?&]plus=[^&]*voilesombres/.test(location.search))try{document.documentElement.classList.add('voilesOmbres');}catch(e){} /* les lueurs en ombre interne au tiers : écart 6-9/255 sur leur flou, éteint (?plus=voilesombres) */
const VOILES_GL=TEL_NATIF&&/[?&]plus=[^&]*voilesgl/.test(location.search); /* piste d : la vignette de vitesse dans la passe de sortie WebGL (boucle-6-hud.js, triptyque-bloom.js) ; ÉTEINT : elle passe sous les traits de vitesse */
/* peut-on voiler e ? (pt : contrôler aussi qu'il ne prend aucun toucher — seulement à la pose : pointer-events ne change pas l'image) */
function hccPourquoi(e,pt){HCC.gcs++;const c=getComputedStyle(e);if(c.display==='none')return 'display';if(+c.opacity!==0)return 'visible';HCC.lus++;
  if(/\b(all|visibility)\b/.test(c.transitionProperty)&&/[1-9]/.test(c.transitionDuration))return 'transition:'+c.transitionProperty;
  const an=e.getAnimations?e.getAnimations():[];
  for(let i=0;i<an.length;i++){const a=an[i];if(a.playState==='finished'||a.playState==='idle')continue;if(!a.animationName)return 'transition en cours'; /* une transition en cours (de l'opacité ou d'autre chose) : on attend */
    let k=[];try{k=a.effect.getKeyframes();}catch(x){return 'images-clés';}for(let j=0;j<k.length;j++)if('opacity' in k[j])return 'animation d\'opacité '+a.animationName;}
  if(pt){if(c.pointerEvents!=='none')return 'toucher';const d=e.getElementsByTagName('*');for(let i=0;i<d.length;i++){HCC.gcs++;if(getComputedStyle(d[i]).pointerEvents!=='none')return 'toucher dedans';}}
  return '';}
function hccVoilable(e,pt){return hccPourquoi(e,pt)==='';}
function hccLeve(e){if(e.classList.contains('hcVeil')){e.classList.remove('hcVeil');HCC.reveils++;}}
function hccLeveTout(){if(HCC.el)for(let i=0;i<HCC.el.length;i++)hccLeve(HCC.el[i]);}
/* l'observateur : relit seulement les éléments voilés que le changement peut concerner */
function hccObs(recs){HCC.rap++;let tous=false;const vus=new Set();
  for(let i=0;i<recs.length;i++){const r=recs[i],t=r.target;
    if(r.type==='attributes'&&r.attributeName==='class'&&t.classList&&HCC.el.indexOf(t)>=0&&String(r.oldValue||'').replace(/\bhcVeil\b/,'').trim().split(/\s+/).sort().join(' ')===String(t.className).replace(/\bhcVeil\b/,'').trim().split(/\s+/).sort().join(' '))continue; /* notre propre voile */
    if(t===document.body||t===document.documentElement||t===HCC.hud)tous=true;else vus.add(t.nodeType===1?t:t.parentNode);}
  for(let i=0;i<HCC.el.length;i++){const e=HCC.el[i];if(!e.classList.contains('hcVeil'))continue;
    let c9=tous||vus.has(e);if(!c9)for(const v of vus)if(v&&v!==e&&(v.contains(e)||(e.id==='toast'&&e.contains(v)))){c9=true;break;} /* lui, un de ses ancêtres, ou (le toast) son contenu */
    if(c9&&!hccVoilable(e,false))hccLeve(e);}}
function hccSuit(n,o){if(n&&HCC.obs&&!HCC.vu.has(n)){HCC.vu.add(n);HCC.obs.observe(n,o||{attributes:true,attributeOldValue:true});}}
function hccAjoute(e){if(!e||HCC.el.indexOf(e)>=0)return;HCC.el.push(e);hccSuit(e,e.id==='toast'?{attributes:true,attributeOldValue:true,childList:true,subtree:true}:null);for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement)hccSuit(a);}
/* beaucoup d'éléments du HUD naissent en course (#flowGlow, #slam9, #flash9, #pwrFx…) : on recherche les absents toutes les 2 s */
function hccCherche(){for(let i=0;i<HCC_IDS.length;i++)hccAjoute(document.getElementById(HCC_IDS[i]));
  if(HCC.hud)for(let i=0;i<HCC.hud.children.length;i++){const e=HCC.hud.children[i];if(!/^(triade|cashHud|money|feverGlow)$/.test(e.id))hccAjoute(e);} /* le reste de #hud (au HUD calme) ; l'argent est à un autre lot */}
function hccInit(){HCC.el=[];HCC.vu=new Set();HCC.hud=document.getElementById('hud');
  if(window.MutationObserver){HCC.obs=new MutationObserver(hccObs);hccSuit(document.documentElement);hccSuit(document.body);hccSuit(HCC.hud);}
  hccCherche();HCC.cherche=performance.now();}
function hccTick(now){if(!HCC.ok)return;if(!HCC.el)hccInit();
  if(!started||garageOn){if(HCC.poses)hccLeveTout();return;}
  if(now-HCC.scan<300)return;HCC.scan=now;
  if(now-HCC.cherche>2000){HCC.cherche=now;hccCherche();}
  if(HCC.obs)hccObs(HCC.obs.takeRecords()); /* ce que la page a écrit depuis la dernière microtâche passe d'abord (sinon un réveil serait jeté avec nos propres écritures) */
  for(let i=0;i<HCC.el.length;i++){const e=HCC.el[i];if(!e.classList.contains('hcVeil')&&hccVoilable(e,true)){e.classList.add('hcVeil');HCC.poses++;}}
  if(HCC.obs)HCC.obs.takeRecords();} /* nos seules écritures : rien à relire */
/* ===== L'OBSERVATEUR SANS LECTURE (2026-11-17, qualité · hudobs — Sacha : « j'ai eu quelques freezes sur la map jade ») =====
   MESURÉ dans la boîte de vol du build 120 (téléphone à l'état critique, 20 i/s) : le rappel de l'observateur `hccObs` dépassait 8 ms 23 fois en 449 s (pire 26 ms)
   et 20 fois en 110 s (pire 27 ms). Cause : au moindre changement de <html>, <body> ou #hud, il relisait getComputedStyle + getAnimations de CHAQUE élément voilé,
   et levait les voiles un par un entre deux lectures (lire, écrire, lire… : un recalcul de style forcé par élément). Et la pose relisait tous les éléments à la fois.
   Désormais : (1) LE RÉVEIL NE LIT AUCUN STYLE. Une mutation qui peut changer l'opacité d'un élément voilé lève son voile, sans rien vérifier : lever un voile sur
   un élément à opacité 0 ne change aucun pixel, et il tombe avant l'image (microtâche). Qui est concerné est connu d'avance (table ancêtre → éléments voilables),
   donc rien n'est parcouru. (2) FILTRE : une mutation de `style` qui ne touche qu'à la géométrie (largeur de la jauge, position, transform) est ignorée, comme nos
   propres écritures de `hcVeil` ; seuls class, style et data-* sont regardés. (3) LA POSE est étalée : quelques éléments par passage (toutes les lectures d'abord,
   puis les écritures : un seul recalcul), jamais quand l'image en cours a déjà pris plus de 10 ms ni après une image longue (au plus 4 passages sautés de suite). `?sans=hudobs` = l'observateur d'avant. */
const HCO={ok:HCC.ok&&!/[?&]sans=[^&]*hudobs/.test(location.search),anc:null,rap:0,rec:0,ign:0,lev:0,passes:0,sautes:0,i:0,der:0,K:6,hist:null,file:new Set(),tok:null,tokT:null,nf:0,suite:0};
/* les propriétés de style sans effet sur l'opacité (ni sur display, visibility, animation, transition) : la géométrie seule */
const HCO_GEO=/^(width|height|min-width|min-height|max-width|max-height|left|top|right|bottom|inset|transform|translate|scale|rotate|transform-origin|margin(-[a-z]+)?|padding(-[a-z]+)?|background-position(-[xy])?|--(w|h|x|y|tx|ty|nw|cw|cx|cy|lw))$/;
function hcoDecl(s){const o={};if(!s)return o;const p=String(s).split(';');for(let i=0;i<p.length;i++){const k=p[i].indexOf(':');if(k>0)o[p[i].slice(0,k).trim().toLowerCase()]=p[i].slice(k+1).trim();}return o;}
/* une mutation de style : 0 = sans effet ; 1 = peut changer l'opacité de l'élément lui-même ; 2 = aussi celle de ce qu'il contient (une variable --x, héritée).
   L'opacité d'un ancêtre, son animation, sa transition ne changent pas l'opacité CALCULÉE d'un enfant : pour lui, seules les variables comptent.
   Une opacité posée à 0 (écrite à chaque image sur un élément éteint) ne réveille pas. */
function hcoStyleEffet(a,b){const A=hcoDecl(a),B=hcoDecl(b);let n=0;
  for(const k in B)if(A[k]!==B[k]&&!HCO_GEO.test(k)){if(k.charCodeAt(0)===45&&k.charCodeAt(1)===45)return 2;if(k==='opacity'&&parseFloat(B[k])===0)continue;n=1;}
  for(const k in A)if(!(k in B)&&!HCO_GEO.test(k)){if(k.charCodeAt(0)===45&&k.charCodeAt(1)===45)return 2;n=1;}
  return n;}
/* LES CLASSES QUI COMPTENT : une seule fois (par tranches de 2 ms, aux passages de la pose), toutes les règles CSS qui posent une opacité, une animation, une transition,
   display ou une variable (--x : les opacités en var()) ; leurs classes forment HCO.tok. Une classe qui change sur un ancêtre (<body>, #hud…) ou sur l'élément, et qui
   n'apparaît dans AUCUNE de ces règles, ne peut pas changer une opacité : ignorée. Tant que la table n'est pas finie, tout changement de classe réveille. */
const HCO_PROP=/^(opacity|animation|transition|display|visibility|all|--)/;
function hcoTokTranche(t0){const T=HCO.tokT;if(!T)return;
  while(T.pile.length){if(performance.now()-t0>2)return;const f=T.pile[T.pile.length-1];if(f.i>=f.l.length){T.pile.pop();continue;}const ru=f.l[f.i++];
    if(ru.cssRules&&ru.cssRules.length&&!ru.selectorText){T.pile.push({l:ru.cssRules,i:0});continue;} /* @media, @supports */
    if(!ru.selectorText||!ru.style)continue;let ok=false;for(let k=0;k<ru.style.length;k++)if(HCO_PROP.test(ru.style[k])){ok=true;break;}if(!ok)continue;
    const m=ru.selectorText.match(/\.-?[_a-zA-Z][\w-]*/g);if(m)for(let k=0;k<m.length;k++)T.tok.add(m[k].slice(1));}
  HCO.tok=T.tok;HCO.tokT=null;}
function hcoTokLance(){const p=[];for(let i=0;i<document.styleSheets.length;i++){try{const l=document.styleSheets[i].cssRules;if(l)p.push({l:l,i:0});}catch(e){}}
  HCO.tokT={pile:p,tok:new Set()};HCO.nf=document.styleSheets.length;}
function hcoClasseSansEffet(a,b){const A=String(a||'').split(/\s+/),B=String(b||'').split(/\s+/);let ch=0;
  for(let i=0;i<A.length;i++){const k=A[i];if(!k||k==='hcVeil'||B.indexOf(k)>=0)continue;ch++;if(!HCO.tok||HCO.tok.has(k))return false;}
  for(let i=0;i<B.length;i++){const k=B[i];if(!k||k==='hcVeil'||A.indexOf(k)>=0)continue;ch++;if(!HCO.tok||HCO.tok.has(k))return false;}
  return true;} /* rien n'a changé (notre voile), ou seulement des classes sans effet sur une opacité */
function hcoLie(n,e){if(!n)return;let l=HCO.anc.get(n);if(!l)HCO.anc.set(n,l=[]);if(l.indexOf(e)<0)l.push(e);}
/* le rappel : aucune lecture de style ; une liste connue d'avance par nœud muté */
function hcoObs(recs){HCO.rap++;
  for(let i=0;i<recs.length;i++){const r=recs[i];let t=r.target;HCO.rec++;
    if(t&&t.nodeType!==1)t=t.parentNode;if(!t){HCO.ign++;continue;}
    if(r.type==='attributes'){const a=r.attributeName;
      if(a==='class'){if(hcoClasseSansEffet(r.oldValue,t.getAttribute('class'))){HCO.ign++;continue;}} /* notre propre voile, ou des classes sans effet */
      else if(a==='style'){const f=hcoStyleEffet(r.oldValue,t.getAttribute('style'));if(!f){HCO.ign++;continue;} /* la géométrie seule */
        if(f===1){if(HCO.hist){const k=(t.id||t.nodeName)+' style';HCO.hist[k]=(HCO.hist[k]|0)+1;}if(t.classList.contains('hcVeil')&&HCO.anc.has(t)){t.classList.remove('hcVeil');HCC.reveils++;HCO.lev++;HCO.file.add(t);}continue;}} /* lui seul */
      else if(a.slice(0,5)!=='data-'){HCO.ign++;continue;}}
    if(HCO.hist){const k=(t.id||t.nodeName)+' '+(r.attributeName||r.type);HCO.hist[k]=(HCO.hist[k]|0)+1;}
    let l=HCO.anc.get(t);
    if(!l&&t.closest){const ts=t.closest('#toast');if(ts)l=HCO.anc.get(ts);} /* le contenu du toast */
    if(l)for(let j=0;j<l.length;j++){const e=l[j];if(e.classList.contains('hcVeil')){e.classList.remove('hcVeil');HCC.reveils++;HCO.lev++;HCO.file.add(e);}}}} /* relu en premier aux passages suivants */
function hcoInit(){HCC.el=[];HCC.vu=new Set();HCO.anc=new Map();HCC.hud=document.getElementById('hud');
  if(window.MutationObserver){HCC.obs=new MutationObserver(hcoObs);hcoSuit(document.documentElement);hcoSuit(document.body);hcoSuit(HCC.hud);}
  hcoCherche();HCC.cherche=performance.now();hcoTokLance();}
function hcoSuit(n,o){if(n&&HCC.obs&&!HCC.vu.has(n)){HCC.vu.add(n);HCC.obs.observe(n,o||{attributes:true,attributeOldValue:true});}}
function hcoAjoute(e){if(!e||HCC.el.indexOf(e)>=0)return;HCC.el.push(e);hcoLie(e,e);
  hcoSuit(e,e.id==='toast'?{attributes:true,attributeOldValue:true,childList:true,subtree:true,characterData:true}:null);
  for(let a=e.parentElement;a;a=a.parentElement){hcoLie(a,e);if(a!==document.body&&a!==document.documentElement)hcoSuit(a);}}
function hcoCherche(){for(let i=0;i<HCC_IDS.length;i++){const e=document.getElementById(HCC_IDS[i]);if(e&&HCC.el.indexOf(e)<0)hcoAjoute(e);}
  if(HCC.hud)for(let i=0;i<HCC.hud.children.length;i++){const e=HCC.hud.children[i];if(!/^(triade|cashHud|money|feverGlow)$/.test(e.id)&&HCC.el.indexOf(e)<0)hcoAjoute(e);}}
/* la pose étalée : K éléments par passage, au tour par tour ; toutes les lectures d'abord, puis les écritures */
const HCO_POSE=[];
function hcoTick(now){if(!HCC.el)hcoInit();
  if(!started||garageOn){if(HCC.poses)hccLeveTout();HCO.der=now;return;}
  const dt=now-HCO.der;HCO.der=now;
  if(now-HCC.scan<(HCO.file.size?100:300))return; /* des voiles viennent de tomber : on les relit plus tôt */
  if((dt>70||performance.now()-now>10)&&HCO.suite<4){HCO.sautes++;HCO.suite++;return;} /* image longue (ou déjà chargée) : on repasse à la suivante — au plus 4 fois de suite */
  HCO.suite=0;
  HCC.scan=now;HCO.passes++;
  if(now-HCC.cherche>2000){HCC.cherche=now;hcoCherche();if(HCO.nf!==document.styleSheets.length)hcoTokLance();} /* une feuille ajoutée : la table est refaite */
  if(HCO.tokT)hcoTokTranche(performance.now());
  if(HCC.obs){const r=HCC.obs.takeRecords();if(r.length)hcoObs(r);} /* ce que la page a écrit avant nous passe d'abord */
  const n=HCC.el.length;if(!n)return;HCO_POSE.length=0;let lus=0;
  const t0=performance.now();
  for(const e of HCO.file){if(lus>=4*HCO.K||lus>=HCO.K&&performance.now()-t0>1.5)break;HCO.file.delete(e);if(e.classList.contains('hcVeil')||!e.isConnected)continue;lus++;if(hccVoilable(e,true))HCO_POSE.push(e);} /* ceux qu'un réveil vient de libérer (jusqu'à 4K, 1,5 ms au plus au-delà de K) */
  for(let k=0;k<n&&lus<HCO.K;k++){const e=HCC.el[HCO.i%n];HCO.i=(HCO.i+1)%n;if(e.classList.contains('hcVeil')||!e.isConnected||HCO_POSE.indexOf(e)>=0)continue;lus++;if(hccVoilable(e,true))HCO_POSE.push(e);}
  for(let k=0;k<HCO_POSE.length;k++){HCO_POSE[k].classList.add('hcVeil');HCC.poses++;}
  HCO_POSE.length=0;if(HCC.obs)HCC.obs.takeRecords();} /* nos seules écritures : rien à relire */
if(HCO.ok){hccTick=function(now){if(HCC.ok)hcoTick(now);};}
window.dbgHudObs=function(h){if(h===1)HCO.hist={};const o={ok:HCO.ok,rappels:HCO.rap,enregistrements:HCO.rec,ignores:HCO.ign,leves:HCO.lev,lectures:HCC.gcs,passes:HCO.passes,sautes:HCO.sautes,classesQuiComptent:HCO.tok?HCO.tok.size:-1,elements:(HCC.el||[]).length,rappelsAvant:HCC.rap};if(h===2)o.hist=HCO.hist;return o;};
window.__hcTick=function(){if(!HCC.el)return 0;if(document.documentElement.classList.contains('hudCouches')){HCC.ok=true;HCC.scan=0;if(HCO.ok){const K=HCO.K,t=performance.now();HCO.K=999;HCO.der=t;hccTick(t);HCO.K=K;}else hccTick(performance.now());}else{HCC.ok=false;hccLeveTout();}return HCC.el.filter(function(e){return e.classList.contains('hcVeil');}).length;}; /* (banc) A/B dans la même page */
window.dbgHudCouches=function(){return {ok:HCC.ok,poses:HCC.poses,reveils:HCC.reveils,lus:HCC.lus,voiles:(HCC.el||[]).filter(function(e){return e.classList.contains('hcVeil');}).map(function(e){return e.id;}),libres:(HCC.el||[]).filter(function(e){return !e.classList.contains('hcVeil');}).map(function(e){return (e.id||e.className)+' : '+hccPourquoi(e,true);})};};
window.dbgCadence=function(f){if(f!=null){const n=performance.now();f=+f;CAD.force=(f===30||f===60)?f:0;CAD.ok=(CAD.force||PAL.b('cadence30',0)||CAD30_REC||POSTE.auto)?1:0;if(CAD.force)cadPose(f===30,n,'force');else if(!CAD.ok)cadPose(false,n);} // (banc) 30 force, 60 coupe et fige, 0 rend la main
  const n=performance.now();return {on:CAD.on,per:+CAD.per.toFixed(1),ecran:+CAD.ecran.toFixed(2),w:+CAD.w.toFixed(1),mur:(CAD.murT>0&&n-CAD.murT<CAD.murD)?Math.round((CAD.murD-(n-CAD.murT))/1000):0,entrees:CAD.entrees,sorties:CAD.sorties,force:CAD.force,auto:CAD.ok===1&&!CAD.force,essai:CAD.essT>0&&n-CAD.essT<10000,gel:CAD.gel,haut:+CAD.wh.toFixed(1),plafond:{actif:FPS_CAP,n:FPS.n,ecran:+FPS.per.toFixed(2)}};}; // (2026-10-20) plafond : une image d'écran sur n (fpsSaute)
/* ====================== HORS COURSE À 30 i/s — HC (2026-10-23, audit mobile, Sacha : « une version mobile fluide sans que ça baisse trop en qualité ») ======================
   CAD ne cale qu'EN COURSE : un accueil ou un garage laissé ouvert tournait à 60 i/s plein rendu (haute définition comprise) et chauffait comme une
   partie. Sur ANCIEN et MOYEN (CAD.ok), l'accueil et le garage se calent donc sur 33 ms, par le même saut en temps que CAD (une image d'écran sur
   deux sur 60 Hz, une sur quatre sur 120 Hz) : une image sautée ne fait RIEN, le dt de la suivante absorbe l'écart (borné à 50 ms). La durée lue par
   la règle de qualité est ramenée à une image d'écran (voir ms9 dans loop), le filet de VHD et la détection de 30 Hz imposé n'y voient donc rien.
   Palier RÉCENT : `hors30` = 0, aucun effet. `?hc=0` coupe (comparer). La course, la pause et l'écran de fin ne sont pas touchés. */
PAL.B.hors30=[1,1,0];
const HC={on:false,der:0,goT:0,pT:0,off:/[?&]hc=0/.test(location.search)};const PAUSE_FROIDE=!/[?&]sans=[^&]*pausefroide/.test(location.search); /* (2026-11-13, finition) voir hcSaute */const HC_FROID=TEL_NATIF&&!/[?&]sans=[^&]*calmefroid/.test(location.search);
function hcSaute(now){ // en tête de loop (après cadSaute, qui tient CAD.ecran à jour) : rend true si cette image d'écran se saute
  /* (2026-11-12, ios-ultime, Sacha : « trouve des moyens de ne pas faire monter cette chaleur ») LA PAUSE ET L'ÉCRAN DE MORT AU FRAIS — sur l'app, la pause dessinait la scène IMMOBILE
     à 60 i/s plein rendu (cadSaute rend la main en pause, même calé), et l'écran de mort aussi (hors course : plus de calage). Désormais : en pause, 10 i/s ; sur l'écran de mort,
     3,5 s après la mort (l'explosion reste à sa cadence), la règle des menus (30 i/s, 15 au repos, 60 sous le doigt). `?sans=calmefroid` = comme avant. */
  if(!gameOver)HC.goT=now;
  if(!paused)HC.pT=now;
  const cv9=couvTick(now);veilleTick(now); /* (2026-11-15, qualité · menus froids) LA SCÈNE COUVERTE et LA VEILLE DES BOUCLES — voir plus bas */
  const froid=HC_FROID&&started&&!garageOn&&!document.hidden&&(paused?1:(gameOver&&now-HC.goT>3500)?2:0);
  /* (2026-11-13, finition · la pause plus froide) la feuille de pause ouverte depuis 2 s, sans geste ni transition depuis 2 s : la scène figée derrière elle se redessine à 2 i/s au lieu de 10.
     Un doigt (réglages, REPRENDRE) ou un pivot (retailleImage force une image) rendent les 10 i/s aussitôt ; le 3-2-1 de la reprise (feuille fermée) n'est pas touché. `?sans=pausefroide` = 10 i/s comme avant. */
  if(froid===1){HC.per=(cv9||PAUSE_FROIDE&&now-HC.pT>2000&&now-HC.gT>2000&&!hcGeste(now)&&document.body.classList.contains('hTp'))?500:100;if(HC.on&&now-HC.der<HC.per-CAD.tol)return true;HC.on=true;HC.der=now;return false;}
  const hc=!HC.off&&(PAL.b('hors30',0)||PFR_ON)&&(froid===2||(!CAD.on&&(!started||garageOn)))&&!document.hidden;
  if(!hc){HC.on=false;return false;}
  if(cv9){HC.per=500;if(HC.on&&now-HC.der<HC.per-CAD.tol)return true;HC.on=true;HC.der=now;return false;} /* LA SCÈNE COUVERTE : 2 i/s, le doigt n'y change rien (on ne voit pas la scène) ; une transition l'a déjà levée (couvTick) */
  if(!MENU_MAX&&hcGeste(now)){HC.on=false;return false;} /* (2026-11-07, Perf 3 — P5) un geste ou une transition : 60 i/s, voir HC GESTE */
  HC.per=hcRepos(now)||CAD.per; /* (2026-11-07, Perf 3 — P5) au REPOS (aucun geste depuis 3 s) 15 i/s, depuis 8 s 10 i/s — voir HC REPOS */
  if(HC.on&&now-HC.der<HC.per-CAD.tol)return true;
  HC.on=true;HC.der=now;return false;}
/* HC GESTE (2026-11-07, Perf 3 — P5, Sacha : « les menus fluides et froids ») le repos se dessine à 30 i/s (le téléphone au frais, PFR_ON) mais un doigt posé, un défilement, un
   changement d'écran ou de caisse rendent les 60 i/s — 0,35 s après le dernier signe — puis le repos reprend. `?menu=max` = comme avant (30 i/s en continu). */
HC.gT=0;HC.gR=-1;
/* ===== LA BANDE À 30 (2026-11-13, finition boutique — Sacha : « la boutique mérite d'être optimisée ») MESURÉ au banc (390×844 tactile) : pendant que le doigt tire la bande
   de la boutique, la scène 3D se redessinait à 51 i/s (le doigt comptait comme un geste du plateau) alors que rien n'y change — la caisse ne s'échange qu'au verrou (GAR.sw,
   qui rend les 60). Sur un téléphone, ces images volaient au fil principal le temps des touchmove qui font défiler la bande (le doigt tire la bande en JS : voir LE VERROU RAPIDE).
   Désormais un glissé, une molette ou un pointeur qui bouge SUR la bande ne rend plus les 60 : la scène garde la cadence du menu (30 i/s, la même qu'au repos de l'app) ; le
   toucher qui commence (pointerdown/touchstart) et l'échange de caisse rendent toujours les 60. La bande elle-même défile sur ses propres images (elle ne passe pas par loop).
   ALLEGE seulement ; `?sans=bande30` = comme avant. */
const BANDE30=ALLEGE&&!/[?&]sans=[^&]*bande30/.test(location.search);
function hcSurBande(e){const t=e&&e.target;return !!(t&&t.closest&&t.closest('#gBqPan .bqRail'));}
(function(){const m=function(e){const n=performance.now();HC.gT=n;if(BANDE30&&e.type!=='touchstart'&&e.type!=='pointerdown'&&hcSurBande(e))HC.gR=n;};['touchstart','touchmove','pointerdown','wheel'].forEach(function(e){document.addEventListener(e,m,{capture:true,passive:true});});
  document.addEventListener('pointermove',function(e){if(e.buttons){const n=performance.now();HC.gT=n;if(BANDE30&&hcSurBande(e))HC.gR=n;}},{capture:true,passive:true});})();
/* HC REPOS (2026-11-07, Perf 3 — P5, OPTI ULTIME : « le menu est le premier chauffe-téléphone de l'app » — mesuré au banc : l'accueil rendait 28 images/s de 146 appels et 800 k triangles, 23 M de triangles par seconde, sans que personne touche) : sur
   un vrai téléphone, sans geste depuis 3 s l'accueil, le garage et la boutique se dessinent à 15 i/s, depuis 8 s à 10 i/s (la caisse tourne à 0,24 rad/s : 1 à 1,4° par image) ; un toucher rend les 60 aussitôt (HC GESTE).
   `PAL.B.reposMs=[66,66,66]` (période à 3 s) et `PAL.B.reposLongMs=[66.7,66.7,66.7]` (à 8 s) ; 0 = coupé ; `?repos=0` ou `?menu=max` = 30 i/s en continu comme avant. */
PAL.B.reposMs=[66.7,66.7,66.7];PAL.B.reposLongMs=[66.7,66.7,66.7];
const HC_REPOS_OFF=/[?&]repos=0\b/.test(location.search);
/* ===== L'ACCUEIL FLUIDE (2026-11-13, ios-ultime — Sacha : « je veux plus de fluidité pour l'écran d'accueil ») =====
   MESURÉ (banc Chrome, puce ×4, 30 s d'accueil) : une image de menu coûte ~1 ms de JS (la boucle : 502 ms sur 30 s), le reste est le dessin ; ce qui saccadait,
   c'est le REPOS à 15 i/s dès 3 s sans geste : la caisse qui tourne (0,24 rad/s) avançait par crans d'1,4°. Désormais, téléphone NOMINAL ou FAIR (capteur natif),
   l'accueil, le garage et la boutique restent à 30 i/s au repos ; les 15 i/s ne reviennent que téléphone SERIOUS/CRITICAL, ou après une minute sans aucun geste
   (personne ne regarde). Sans capteur (navigateur du téléphone) : l'ancienne règle. `?sans=acc30` = le repos à 15 i/s comme le 07/11. */
const ACC30=TEL_NATIF&&!/[?&]sans=[^&]*acc30/.test(location.search);
/* (2026-11-13, session de fond — Sacha : « dans l'écran d'accueil les nuages qui tombent derrière sont saccadés ») LU dans ses vols : branché sur le Mac, son téléphone est à l'état
   SERIOUS presque tout le temps (il charge) — l'accueil retombait donc à 15 i/s trois secondes après le dernier geste, et les nuages qui tombent avancent par crans. L'accueil garde
   désormais ses 30 i/s à SERIOUS aussi ; les 15 i/s ne reviennent qu'à CRITICAL, ou après une minute sans geste. Le coût thermique de l'accueil est dans le lancement, pas dans le repos
   à l'écran-titre (mesuré le 8-9/11 : le budget remonte écran figé). `?sans=acc30chaud` = le seuil d'avant (nominal et fair seulement). */
const ACC30_CHAUD=!/[?&]sans=[^&]*acc30chaud/.test(location.search);
function accFrais(){try{return MOB_S.capteur&&MOB_S.thermo<(ACC30_CHAUD?3:2);}catch(e){return false;}}
function hcRepos(now){if(MENU_MAX||HC_REPOS_OFF||!TEL_NATIF)return 0; /* (2026-11-10) le repos à 15 i/s est une affaire de chaleur de téléphone : un ordi aux régimes LÉGER / MINIMUM garde ses menus à 30 */const d=now-HC.gT;
  if(ACC30&&d<=60000&&accFrais())return 0; /* L'ACCUEIL FLUIDE : 30 i/s (CAD.per) tant que le téléphone est frais et qu'on l'a touché depuis moins d'une minute */
  return d>8000?PAL.b('reposLongMs',0):d>3000?PAL.b('reposMs',0):0;}
/* ===== LA FENÊTRE DE TRANSITION (2026-11-13, transitions-ui — Sacha : « soigner les transitions dans l'interface, animation, plus de fluidité ») =====
   Un changement d'écran (mGo, le volet ecranWipe, garMode/gModeVa du garage, le voile du départ) joue son entrée en 0,4 à 1,5 s, mais la cadence des menus
   ne voyait que le doigt (0,35 s après le tap) et le volet baissé : la caméra du garage qui recadre la caisse et le monde qui se découvre retombaient à
   30 i/s (15 au repos) en plein mouvement, et une transition partie sans doigt (minuteur, retour automatique) jouait d'emblée à 15 i/s. `transUI(ms)` ouvre
   une fenêtre : tant qu'elle court, (1) hcGeste rend les 60 i/s (`?sans=transcad`) ; (2) les photos de caisses (photoTour, shopPhotoTour) attendent la fin
   de l'entrée au lieu de geler l'écran qui arrive (`transBloque`, téléphone/ALLEGE seulement, `?sans=transphoto`). Fonctions (hissées) : appelables avant ce morceau. */
function transUI(ms){const t=performance.now()+(ms||600);if(!(t<=(transUI.fin||0)))transUI.fin=t;}
function transCad(now){if(transCad.ok===undefined)transCad.ok=!/[?&]sans=[^&]*transcad/.test(location.search);return transCad.ok&&now<(transUI.fin||0);}
function transBloque(){if(transBloque.ok===undefined)transBloque.ok=ALLEGE&&!/[?&]sans=[^&]*transphoto/.test(location.search);return transBloque.ok&&performance.now()<(transUI.fin||0);}
window.dbgTransUI=function(){const n=performance.now();return {reste:Math.max(0,Math.round((transUI.fin||0)-n)),cad:transCad(n),photos:transBloque(),hc:HC.on,per:HC.per};};
function hcGeste(now){return (now-HC.gT<350&&HC.gR!==HC.gT /* LA BANDE À 30 : le dernier signe est un glissé sur la bande */)||transCad(performance.now())||!!(typeof ecranWipe==='function'&&ecranWipe._on)||!!(typeof GAR!=='undefined'&&(GAR.go||GAR.sw))||garageDrag||!!(typeof GBQ!=='undefined'&&GBQ.on&&(GBQ.drag||GBQ.fmv||GBQ.lan));}
/* (2026-11-13, Sacha : « quand elle revient à sa place et que le menu revient, il faut que ça soit beaucoup plus smooth ») LA BOUTIQUE SOUS LE DOIGT. MESURÉ au banc : le doigt sur la caisse ne comptait pas comme un geste — la boutique arrête son pointerdown/pointermove au niveau de la FENÊTRE (stopPropagation), l'écoute du document ne les voyait jamais ; et le LÂCHER n'en est pas un. Le focus (la colonne qui se resserre, la caisse qui s'approche) et surtout son RETOUR se jouaient donc au rythme du repos : 30 i/s, 15 dans l'app après 3 s de doigt immobile. Désormais : 60 i/s tant que le doigt tient la caisse (GBQ.drag), que le focus bouge (GBQ.fmv) ou que la caisse finit son lancer (GBQ.lan) ; le repos reprend 0,35 s après. */
/* MENU CULL (2026-11-07, Perf 3 — P5, OPTI ULTIME : « le vrai gisement est le coût par image : 800 k triangles pour une caméra de menu immobile ») mesuré au banc (nuages, accueil) : 94 maillages en `frustumCulled=false` (704 k triangles) sont envoyés au GPU à chaque image alors que
   presque tous sont HORS du champ de la caméra du menu (le niveau entier derrière le garage). Sur un vrai téléphone, au menu (pas de course), ceux dont la sphère englobante (×1,3) est hors du champ sont remis en `frustumCulled=true` le temps de l'image, et rendus à `false` dès qu'on quitte
   le menu ou qu'ils reviennent dans le champ (la caméra du garage bouge). Jamais les instanciés (leur sphère est celle d'UNE instance). `PAL.B.menuCull` (1 = actif), `?menucull=0` ou `?menu=max` = comme avant. */
PAL.B.menuCull=[1,1,1];
const MC={set:[],fr:new THREE.Frustum(),m:new THREE.Matrix4(),sp:new THREE.Sphere(),off:/[?&]menucull=0\b/.test(location.search),n:0,t:0};
function menuCull(on){
  for(let i=0;i<MC.set.length;i++)MC.set[i].frustumCulled=false;MC.set.length=0;MC.n=0;MC.t=0;
  if(!on||MC.off||MENU_MAX||!TEL_NATIF||!PAL.b('menuCull',0))return;
  camera.updateMatrixWorld();MC.m.multiplyMatrices(camera.projectionMatrix,MC.m.copy(camera.matrixWorld).invert());MC.fr.setFromProjectionMatrix(MC.m);
  scene.traverseVisible(function(o){if(o.frustumCulled||o.isInstancedMesh||o.isSkinnedMesh||!(o.isMesh||o.isPoints||o.isLine)||!o.geometry)return;
    const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const b=g.boundingSphere;if(!b||!(b.radius>=0)||b.radius>1e6)return;
    MC.sp.copy(b).applyMatrix4(o.matrixWorld);MC.sp.radius*=1.3;
    if(!MC.fr.intersectsSphere(MC.sp)){o.frustumCulled=true;MC.set.push(o);MC.n++;MC.t+=g.index?g.index.count/3:(g.attributes.position?g.attributes.position.count/3:0);}});}
window.dbgMenuCull=function(v){if(v!=null){MC.off=!v;if(!v)menuCull(false);}return {actif:!MC.off,mc:MC.n,mcTris:Math.round(MC.t)};}; /* (banc) A/B du tri du menu dans la même session */
window.dbgCullInfo=function(){ /* (2026-11-07, Perf 3 — P5) (banc) qui est dans le champ de la caméra actuelle : maillages visibles, triangles, frustumCulled=false, dans/hors champ */
  camera.updateMatrixWorld();const fr=new THREE.Frustum(),m4=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);fr.setFromProjectionMatrix(m4);
  const R={dans:{n:0,t:0},hors:{n:0,t:0},nocull:{n:0,t:0},liste:[]};
  scene.traverseVisible(function(o){if(!(o.isMesh||o.isPoints||o.isLine)||!o.geometry)return;const g=o.geometry,t=g.index?g.index.count/3:(g.attributes.position?g.attributes.position.count/3:0);if(!g.boundingSphere)g.computeBoundingSphere();
    const sp=g.boundingSphere.clone().applyMatrix4(o.matrixWorld),dans=fr.intersectsSphere(sp),k=dans?'dans':'hors';R[k].n++;R[k].t+=t;if(!o.frustumCulled){R.nocull.n++;R.nocull.t+=t;}
    if(t>20000)R.liste.push([o.name||o.type,Math.round(t/1000)+'k',dans?'dans':'HORS',o.frustumCulled?'':'NOCULL',Math.round(sp.radius),Math.round(sp.center.distanceTo(camera.position)),o.parent===scene?'scene':(o.parent&&o.parent.name)||'?']);});
  return R;};
window.dbgHC=function(){return {feuN:GAR.feuN|0,mc:MC.n,mcTris:Math.round(MC.t),on:HC.on,per:HC.per,off:HC.off,pfr:PFR_ON,hors30:PAL.b('hors30',0),cadOk:CAD.ok,cadOn:CAD.on,started:started,gameOver:gameOver,garageOn:garageOn,quiet:!!(gEl&&gEl.classList.contains('quiet')),garGo:!!GAR.go,stall:(typeof stallOn!=='undefined')?stallOn:null,vhd:VHD.on,hidden:document.hidden};}; /* (2026-11-07, Perf 3 P5) (banc) l'état des menus */
/* ===== LES MENUS FROIDS (2026-11-15, qualité · menus froids — Sacha : « refuse tout compromis visible » ; plan passation/qualite/batterie-lancement/PLAN.md, lot 3) =====
   (a) LA SCÈNE COUVERTE. Sous un écran OPAQUE qui couvre toute la toile — RÉGLAGES, MODES et la boutique de la coque (`#overlay[data-ecran=set|modes|shop]`, fond
   `--fondEcran` de `::before` à opacité 1), la PLAQUE et le PROFIL (#plq, #prof), la SÉRIE (#serieW, noir) — la 3D se redessinait à 30 i/s (15 au repos) pour rien. Elle passe à
   2 i/s, comme la pause froide : la boucle, le son, le gouverneur et les minuteries restent vivants, le dt de l'image suivante est borné comme toujours. Rien ne se voit : la
   toile est cachée (preuve au banc : photo toile cachée = toile visible, au pixel, sur chaque écran). CONFIDENTIALITÉ (#confFen) N'EN EST PAS : son fond est à .97, la scène
   s'y devine à 3 %. « Couvert » ne se décide qu'APRÈS LECTURE DU STYLE CALCULÉ (opacité 1 de l'écran et de son fond, aucun déplacement : les fondus d'entrée sont finis) et
   se lève dès que l'état change (attribut data-ecran, classes de la page, du garage, des feuilles…) : l'image suivante est dessinée à la cadence normale, avant que la
   sortie ne découvre quoi que ce soit. Une transition (transUI, volet, caméra du garage), la boutique 3D ou l'intro le lèvent aussi. `?sans=couverte` = comme avant.
   (b) LA VEILLE DES BOUCLES. Au menu, 20 s sans aucun geste (ni changement d'écran) : les éléments dont TOUTES les animations sont des boucles infinies passent en
   `animation-play-state:paused` (classe .ccVeilleP, css/interface-opti.css — jamais `animation:none` : rien ne rejoue). Premier toucher, touche, molette, retour au premier plan,
   changement d'état, ou une classe / un style qui change sur un élément gelé (ou un parent) : tout repart d'où il s'était arrêté, avant la peinture suivante. Jamais pendant une
   transition, la série, les missions, la révélation, un achat, l'auto-école, le lancement. `?sans=veille` = comme avant.
   Vrai téléphone profilé seulement (TEL_NATIF et PRF.on) : l'ordinateur et les téléphones hors profil ne changent pas. Banc : `dbgCouverte()`, `dbgVeille()`. */
const COUV={ok:TEL_NATIF&&!/[?&]sans=[^&]*couverte/.test(location.search),cle:'',cT:0,v:false,vT:0,qui:'',n:0,nCle:0,nLit:0,rx:/(^|\s)ccVeilleP(?=\s|$)/g};
function couvCn(e){return e?String(e.className).replace(COUV.rx,''):'';} /* (contrôle, défaut 3) la classe de la veille n'entre pas dans la clé : poser .ccVeilleP sur body, le garage, #plq, #prof ou #serieW ne réveille plus la veille qu'on vient d'entrer */
function couvCle(){COUV.nCle++;let k='';try{const o=overlay,b=document.body;k=(o?o.getAttribute('data-ecran')+'/'+o.style.display:'-')+'|'+couvCn(b)+'|'+couvCn(gEl)+'|'+(started?1:0)+(gameOver?1:0)+(paused?1:0)+(garageOn?1:0)+(PLQ.on?1:0)+(PLQ.prof?1:0)+(SERIEW.on?1:0)+(M2REV.on?1:0)+(GBQ.on?1:0)+(BIENV.on?1:0)+(TUTO.on?1:0);
  const s=document.getElementById('serieW'),p=document.getElementById('plq'),f=document.getElementById('prof');k+='|'+couvCn(s)+'|'+(p?couvCn(p)+p.style.cssText:'')+'|'+couvCn(f)+'|'+(document.getElementById('confFen')?1:0)+(document.getElementById('splash')?1:0);}catch(e){k='?'+Math.random();}return k;}
function couvFond(b){ /* (contrôle, défaut 5) le fond de ::before est-il OPAQUE ? sa couleur à alpha 1, ou sa dernière couche (celle du dessous) un dégradé linéaire sans aucune couleur transparente */
  if(/^rgb\(/.test(b.backgroundColor))return true;const s=b.backgroundImage||'';let d=0,i0=0;
  for(let i=0;i<s.length;i++){const ch=s[i];if(ch==='(')d++;else if(ch===')')d--;else if(ch===','&&d===0)i0=i+1;}
  const z=s.slice(i0).trim();return /^linear-gradient\(/.test(z)&&!/rgba\(|transparent|hsla\(/.test(z);}
function couvVis(el){for(let e=el;e&&e!==document.documentElement;e=e.parentElement){const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden'||c.opacity!=='1')return false;if(e===el&&c.transform!=='none'&&c.transform!=='matrix(1, 0, 0, 1, 0, 0)')return false;}return true;}
function couvPlein(el){const r=el.getBoundingClientRect();return r.left<=0&&r.top<=0&&r.right>=innerWidth&&r.bottom>=innerHeight;}
function couvLit(){ /* le style calculé : rend le nom de l'écran qui couvre toute la toile, ou '' */
  COUV.nLit++;try{if(document.getElementById('splash')||document.getElementById('confFen')||M2REV.on||GBQ.on||BIENV.on||TUTO.on)return '';
    const s=document.getElementById('serieW');if(SERIEW.on&&s&&s.classList.contains('on')&&!s.classList.contains('fin')&&couvVis(s)&&couvPlein(s))return 'serie';
    for(const id of ['plq','prof']){const e=document.getElementById(id);if(((id==='plq'&&PLQ.on)||(id==='prof'&&PLQ.prof))&&e&&e.classList.contains('on')&&!e.classList.contains('sortant')&&couvVis(e)&&couvPlein(e))return id;}
    const o=overlay,ec=o&&o.getAttribute('data-ecran');
    if((ec==='set'||ec==='modes'||ec==='shop')&&document.body.classList.contains('touch')&&!document.body.classList.contains('setPauseSort')&&couvVis(o) /* le style CALCULÉ : au ciel, la feuille du garage-menu montre #overlay par-dessus un display:none écrit en ligne */){
      const b=getComputedStyle(o,'::before');if(b.opacity==='1'&&b.position==='fixed'&&b.content!=='none'&&b.display!=='none'&&couvFond(b))return ec;}}catch(e){}
  return '';}
function couvTick(now){if(!PRF.on||!(COUV.ok||VEIL.ok))return false;
  if(started&&!garageOn&&!paused){if(COUV.cle!==''){COUV.cle='';COUV.v=false;COUV.vT=0;COUV.qui='';}return false;} /* (contrôle, défaut 2) EN COURSE (et sur l'écran de mort) : rien, sur des variables déjà en mémoire — aucune chaîne, aucun getElementById ; la clé vidée sera refaite au retour au menu ou en pause */
  const k=couvCle();if(k!==COUV.cle){COUV.cle=k;COUV.cT=now;COUV.v=false;COUV.vT=0;COUV.qui='';} /* la clé sert aussi à la veille (un changement d'état la réveille) */
  if(!COUV.ok)return false;
  if(transCad(performance.now())||(typeof ecranWipe==='function'&&ecranWipe._on)||(typeof GAR!=='undefined'&&(GAR.go||GAR.sw))||document.hidden){COUV.v=false;COUV.vT=0;return false;}
  if(!COUV.v&&now-COUV.vT>200){COUV.vT=now;const q=couvLit();if(q){COUV.v=true;COUV.qui=q;COUV.n++;}}
  return COUV.v;}
window.dbgCouverte=function(){let I=null;try{I={frame:renderer.info.render.frame,appels:renderer.info.render.calls};}catch(e){}return {ok:COUV.ok,prf:!!PRF.on,couvert:COUV.v,qui:COUV.qui,depuis:COUV.v?Math.round(performance.now()-COUV.cT):0,entrees:COUV.n,per:HC.per,hc:HC.on,compteurs:{cle:COUV.nCle,lit:COUV.nLit,mut:VEIL.nMut,branche:VEIL.on},lu:couvLit(),rendu:I};};
const VEIL={ok:TEL_NATIF&&!/[?&]sans=[^&]*veille/.test(location.search),on:false,l:[],t:0,scan:0,n:0,obs:null,ecoute:false,pourquoi:'',nMut:0};
function veilleExclue(now){try{
    if(started&&!garageOn)return 'jeu';
    if(document.hidden||document.getElementById('splash')||window.__introCouvre)return 'lancement';
    if(transCad(performance.now())||(typeof ecranWipe==='function'&&ecranWipe._on)||GAR.go||GAR.sw)return 'transition';
    if(SERIEW.on)return 'serie';
    if(garageOn&&gEl&&gEl.classList.contains('missions'))return 'missions';
    if(M2REV.on)return 'revelation';
    if(SPOP.el&&(SPOP.el.classList.contains('on')||SPOP.el.classList.contains('attend')))return 'achat';
    if(TUTO.on||BIENV.on)return 'auto-ecole';
    if(GBQ.on&&(GBQ.drag||GBQ.fmv||GBQ.lan))return 'boutique';
  }catch(e){return 'erreur';}return '';}
function veilleReveil(){if(VEIL.obs)VEIL.obs.disconnect(); /* (contrôle, défaut 1) l'observateur n'est branché QUE pendant la veille : en course, aucun enregistrement, aucun rappel */
  const l=VEIL.l;for(let i=0;i<l.length;i++)l[i].classList.remove('ccVeilleP');l.length=0;if(VEIL.on){VEIL.on=false;document.documentElement.classList.remove('ccVeille');}VEIL.t=performance.now();}
function veilleBoucles(t){const a=t.getAnimations({subtree:true});let n=0;for(let i=0;i<a.length;i++){const x=a[i];if(x.animationName===undefined||!x.effect||x.effect.target!==t)continue;const tm=x.effect.getTiming();if(!tm||tm.iterations!==Infinity)return -1;n++;}return n;} /* -1 : une animation qui finit (annonce, entrée) : jamais gelée */
function veilleEntre(){const A=document.getAnimations(),vus=new Set();
  for(let i=0;i<A.length;i++){const x=A[i];if(x.animationName===undefined||!x.effect)continue;const t=x.effect.target;if(!t||!t.classList||vus.has(t))continue;vus.add(t);
    if(veilleBoucles(t)>0){t.classList.add('ccVeilleP');VEIL.l.push(t);}}
  VEIL.on=true;VEIL.n++;document.documentElement.classList.add('ccVeille');
  if(VEIL.obs){VEIL.obs.observe(document.body,{attributes:true,attributeFilter:['class','style'],subtree:true}); /* branché APRÈS la pose des classes : celles-ci ne le réveillent pas */
    VEIL.obs.observe(document.documentElement,{attributes:true});}} /* (contrôle, défaut 4) toute classe ou attribut de <html> (data-palier, gvFixe, c6…) réveille aussi */
function veilleMut(R){VEIL.nMut++;if(!VEIL.on)return;for(let i=0;i<R.length;i++){const t=R[i].target;if(t===document.documentElement){VEIL.pourquoi='html';veilleReveil();return;}for(let j=0;j<VEIL.l.length;j++)if(t.contains(VEIL.l[j])){VEIL.pourquoi='classe';veilleReveil();return;}}}
function veilleTick(now){if(!VEIL.ok||!PRF.on)return;
  if(started&&!garageOn){if(VEIL.on)veilleReveil();return;} /* (contrôle, défaut 2) EN COURSE, pause et écran de mort compris : rien (la veille n'y entre jamais) */
  if(!VEIL.ecoute){VEIL.ecoute=true;if(window.MutationObserver)VEIL.obs=new MutationObserver(veilleMut); /* créé ici, branché seulement par veilleEntre */
    const r=function(e){if(VEIL.on){VEIL.pourquoi=e&&(e.type==='resize'||e.type==='orientationchange')?'pivot':'geste';veilleReveil();}else VEIL.t=performance.now();};['touchstart','pointerdown','keydown','wheel'].forEach(function(e){document.addEventListener(e,r,{capture:true,passive:true});});
    document.addEventListener('visibilitychange',r);window.addEventListener('resize',r,{passive:true});window.addEventListener('orientationchange',r,{passive:true});} /* (contrôle, défaut 4) un pivot (ou une media query qui bascule avec la taille) réveille */
  const ex=veilleExclue(now),d=now-Math.max(HC.gT,COUV.cT,VEIL.t);
  if(VEIL.on){if(ex||d<20000||now-COUV.cT<20000){VEIL.pourquoi=ex||'etat';veilleReveil();return;}
    if(now-VEIL.scan>1000){VEIL.scan=now;for(let i=VEIL.l.length-1;i>=0;i--){const t=VEIL.l[i];if(!t.isConnected||veilleBoucles(t)<0){t.classList.remove('ccVeilleP');VEIL.l.splice(i,1);}}if(VEIL.obs)VEIL.obs.takeRecords();} /* takeRecords : nos propres retraits ne réveillent pas */
    return;}
  if(!ex&&d>=20000)veilleEntre();}
window.dbgVeille=function(f){if(f==='entre'){veilleEntre();}else if(f==='reveil')veilleReveil();const A=document.getAnimations();let run=0,inf=0,infRun=0;for(const x of A){if(x.animationName===undefined)continue;const it=x.effect&&x.effect.getTiming().iterations;if(x.playState==='running')run++;if(it===Infinity){inf++;if(x.playState==='running')infRun++;}}
  return {ok:VEIL.ok,prf:!!PRF.on,on:VEIL.on,geles:VEIL.l.length,entrees:VEIL.n,exclu:veilleExclue(performance.now()),calme:Math.round(performance.now()-Math.max(HC.gT,COUV.cT,VEIL.t)),pourquoi:VEIL.pourquoi,animations:{css:A.filter(function(x){return x.animationName!==undefined;}).length,enCours:run,boucles:inf,bouclesEnCours:infRun},elements:VEIL.l.slice(0,40).map(function(e){return e.id||String(e.className).slice(0,40);})};};
