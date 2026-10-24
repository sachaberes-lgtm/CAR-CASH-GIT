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
   Palier RÉCENT : `CAD.ok` = 0 → un test faux par point d'accroche, rien d'autre. Hors course (accueil, garage, écran de fin) : jamais calé.
   Banc : `dbgCadence()` décrit, `dbgCadence(30)` force, `dbgCadence(60)` coupe et fige, `dbgCadence(0)` rend la main. */
/* (2026-10-14, décision de Sacha 3 h 30) ROUVERT (7 h 50) : le choc balayé de DEBUGGING est dans le jeu ; preuve perf/banc/chef/v13.cjs (trafic niv. 19, satellites au sol et en vol, 163 / 400 / 8 010 km/h, plein axe et de biais : 20/20 chocs à 30 i/s, 0 faux positif ; l'ancien code ratait). Avant : interrupteur fermé, à 20-30 i/s la caisse traversait le trafic. `dbgCadence(30)` force toujours au banc. */PAL.B.cadence30=[1,1,0];PAL.B.cadenceDepart=[1,0,0];PAL.B.cadenceTenue=[1000,2000,2000];PAL.B.cadenceMonte=[1,0,1];
const CAD={ok:PAL.b('cadence30',0)?1:0,on:false,gel:false,force:0,per:1000/30,ecran:1000/60,tol:1000/120,der:0,rp:0,eMin:99,eN:0,
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
function cadSaute(now){ // en tête de loop : rend true si cette image d'écran se saute
  const d=now-CAD.rp;CAD.rp=now;if(d>3&&d<CAD.eMin)CAD.eMin=d;
  if(++CAD.eN>=90){const m=CAD.eMin;CAD.eN=0;CAD.eMin=99;CAD.ecran=m<7.7?1000/144:m<9.7?1000/120:m<12.6?1000/90:m<15?1000/75:1000/60;CAD.tol=CAD.ecran*.5;} // 30 Hz imposé (m ≈ 33) : on garde 60, rien ne se saute de toute façon
  if(CAD.on&&now-CAD.der<CAD.per-CAD.tol)return true;
  CAD.der=now;return false;}
function cadPose(v,now){if(v===CAD.on)return;CAD.on=v;CAD.gel=v&&!PAL.b('cadenceMonte',1);CAD.der=now;CAD.lT=0;CAD.calT=now;
  QLR.i=0;QLR.n=0; // l'anneau repart : les centiles ne mélangent pas des durées vraies et des durées ramenées
  if(v){CAD.entrees++;loop._ms=Math.max(CAD.ecran,(loop._ms||16)-(CAD.per-CAD.ecran));}else CAD.sorties++;}
function cadFin(now){ // en fin de loop (avant la sonde, qui attend la puce) : le travail de l'image, puis la décision
  const w=performance.now()-QLR.t0;CAD.w=CAD.w*.9+w*.1;CAD.wh=CAD.wh*.97+(w>CAD.wMax?1:0); // wh : compteur fuyant, ≥ 3 ≈ plus d'une image sur dix au-dessus de wMax
  const d=Math.min(100,now-CAD.vu);CAD.vu=now;
  if(CAD.force)return;
  if(!(started&&running&&!gameOver&&!garageOn)){CAD.crs=false;CAD.lT=0;if(CAD.on){cadPose(false,now);CAD.sorties--;}return;} // hors course : jamais calé (et ce n'est pas une « sortie »)
  if(paused)return; // en pause : l'état reste tel quel
  if(!CAD.crs){CAD.crs=true;CAD.lT=0;CAD.essT=0;if(PAL.b('cadenceDepart',0)&&!loop._r30)cadPose(true,now);return;} // le départ de la course
  if(!CAD.calme||QL.essai){CAD.lT=0;CAD.calT=now;return;}
  if(!CAD.on){const ess9=CAD.essT>0&&now-CAD.essT<10000;
    CAD.lT=QLR.p75>19?CAD.lT+d:0;
    if(CAD.lT>(ess9?1000:PAL.b('cadenceTenue',2000))){
      if(ess9){CAD.murT=now;CAD.murD=Math.min(480000,CAD.murD*2);} // l'essai de 60 a échoué : un MUR (60 s, puis 2, 4, 8 min)
      CAD.essT=0;cadPose(true,now);}
    else if(CAD.essT>0&&!ess9){CAD.essT=0;CAD.murD=30000;}} // l'essai a tenu 10 s : 60 est acquis, le mur repart de zéro
  else if(CAD.wh>=3||(CAD.murT>0&&now-CAD.murT<CAD.murD)||(QLR.vraiT&&now-QLR.vraiT<20000&&QLR.vrai>13))CAD.calT=now;
  else if(now-CAD.calT>5000){cadPose(false,now);CAD.essT=now;}}
window.dbgCadence=function(f){if(f!=null){const n=performance.now();f=+f;CAD.force=(f===30||f===60)?f:0;CAD.ok=(CAD.force||PAL.b('cadence30',0))?1:0;if(CAD.force)cadPose(f===30,n);else if(!CAD.ok)cadPose(false,n);} // (banc) 30 force, 60 coupe et fige, 0 rend la main
  const n=performance.now();return {on:CAD.on,per:+CAD.per.toFixed(1),ecran:+CAD.ecran.toFixed(2),w:+CAD.w.toFixed(1),mur:(CAD.murT>0&&n-CAD.murT<CAD.murD)?Math.round((CAD.murD-(n-CAD.murT))/1000):0,entrees:CAD.entrees,sorties:CAD.sorties,force:CAD.force,auto:CAD.ok===1&&!CAD.force,essai:CAD.essT>0&&n-CAD.essT<10000,gel:CAD.gel,haut:+CAD.wh.toFixed(1),plafond:{actif:FPS_CAP,n:FPS.n,ecran:+FPS.per.toFixed(2)}};}; // (2026-10-20) plafond : une image d'écran sur n (fpsSaute)
/* ====================== HORS COURSE À 30 i/s — HC (2026-10-23, audit mobile, Sacha : « une version mobile fluide sans que ça baisse trop en qualité ») ======================
   CAD ne cale qu'EN COURSE : un accueil ou un garage laissé ouvert tournait à 60 i/s plein rendu (haute définition comprise) et chauffait comme une
   partie. Sur ANCIEN et MOYEN (CAD.ok), l'accueil et le garage se calent donc sur 33 ms, par le même saut en temps que CAD (une image d'écran sur
   deux sur 60 Hz, une sur quatre sur 120 Hz) : une image sautée ne fait RIEN, le dt de la suivante absorbe l'écart (borné à 50 ms). La durée lue par
   la règle de qualité est ramenée à une image d'écran (voir ms9 dans loop), le filet de VHD et la détection de 30 Hz imposé n'y voient donc rien.
   Palier RÉCENT : `hors30` = 0, aucun effet. `?hc=0` coupe (comparer). La course, la pause et l'écran de fin ne sont pas touchés. */
PAL.B.hors30=[1,1,0];
const HC={on:false,der:0,off:/[?&]hc=0/.test(location.search)};
function hcSaute(now){ // en tête de loop (après cadSaute, qui tient CAD.ecran à jour) : rend true si cette image d'écran se saute
  const hc=!HC.off&&PAL.b('hors30',0)&&!CAD.on&&(!started||garageOn)&&!document.hidden;
  if(!hc){HC.on=false;return false;}
  if(HC.on&&now-HC.der<CAD.per-CAD.tol)return true;
  HC.on=true;HC.der=now;return false;}
