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
const CAD={ok:(PAL.b('cadence30',0)||CAD30_REC||POSTE.auto)?1:0, /* (2026-11-10) l'ordinateur aussi, en DERNIER recours : voir posteCadOk (moteur/poste-juge.js) */on:false,gel:false,force:0,per:1000/30,ecran:1000/60,tol:1000/120,der:0,rp:0,eMin:99,eN:0,
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
  if(MOB_ECRAN?MOB_EN>=90:++CAD.eN>=90){const m=MOB_ECRAN?(MOB_EA.sort(),MOB_EN=0,MOB_EA[45]):CAD.eMin;CAD.eN=0;CAD.eMin=99;CAD.ecran=m<7.7?1000/144:m<9.7?1000/120:m<12.6?1000/90:m<15?1000/75:1000/60;CAD.tol=(CAD_E30&&m>=24)?CAD.per*.5:CAD.ecran*.5;CAD.eco=CAD_E30&&m>=24&&(window.__ccEco===1||CAD_ECO_F);if(CAD.eco&&CAD.gel&&!(MOB_GOUV&&mobChaud()))CAD.gel=false;} /* (2026-11-12, ios-ultime vague 2, MESURÉ sur le 13 Pro, build 52) L'ÉCRAN DÉJÀ À 30 : le téléphone n'envoie que ~32 images d'écran par seconde (chaud ou en économie d'énergie), à intervalles irréguliers (22 à 33 ms). Avec la tolérance d'un écran 60 Hz (8,3 ms), une image arrivée 22-24 ms après la précédente était SAUTÉE et la suivante partait à ~55 ms : 22 i/s en vol au lieu de 30 (au sol 29). Quand la médiane des images d'écran dépasse 24 ms, la tolérance devient une demi-période de 30 (16,7 ms) : plus rien ne se saute, il n'y a rien à sauter. `?cad_e30=0` = comme avant. */ // 30 Hz imposé (m ≈ 33) : on garde 60, rien ne se saute de toute façon
  if(CAD.on&&now-CAD.der<CAD.per-CAD.tol)return true;
  CAD.der=now;return false;}
function cadPose(v,now){if(v===CAD.on)return;CAD.on=v;if(v&&MOB_GOUV)mobReactif();CAD.gel=v&&((!PAL.b('cadenceMonte',1)&&!CAD.eco)||(MOB_GOUV&&mobChaud()));/* (2026-11-12, ios-ultime) en économie d'énergie (CAD.eco) être calé ne veut rien dire — l'écran est à 30 de toute façon : l'échelle de qualité reste libre de remonter, sauf téléphone chaud */CAD.der=now;CAD.lT=0;CAD.calT=now;
  QLR.i=0;QLR.n=0; // l'anneau repart : les centiles ne mélangent pas des durées vraies et des durées ramenées
  if(v){CAD.entrees++;loop._ms=Math.max(CAD.ecran,(loop._ms||16)-(CAD.per-CAD.ecran));}else CAD.sorties++;}
function cadFin(now){ // en fin de loop (avant la sonde, qui attend la puce) : le travail de l'image, puis la décision
  const w=performance.now()-QLR.t0;CAD.w=CAD.w*.9+w*.1;CAD.wh=CAD.wh*.97+(w>CAD.wMax?1:0); // wh : compteur fuyant, ≥ 3 ≈ plus d'une image sur dix au-dessus de wMax
  const d=Math.min(100,now-CAD.vu);CAD.vu=now; if(HUD_SOBRE&&now-(CAD.hsT||0)>500){CAD.hsT=now;let h=false;try{h=TEL_NATIF&&started&&running&&!gameOver&&!paused&&!garageOn&&mobChaud()&&!(BV.on&&BV.lev!=='base');}catch(e){}if(h!==!!CAD.hs){CAD.hs=h;document.body.classList.toggle('hudSobre',h);try{if(h&&BV.c)BV.c.hs=1;}catch(e){}}} /* LE HUD SOBRE : téléphone chaud, en course — voir css/hud-da.css ; dans un build de mesure, une course à levier garde son levier */
  if(POSTE.auto)posteJuge(now); /* (2026-11-10) le juge du régime de l'ordinateur — moteur/poste-juge.js */
  if(CAD.force)return;
  if(MOB_GOUV&&CAD.on&&mobChaud())CAD.gel=true; /* (2026-10-25) calé par chaleur : l'échelle QL ne remonte pas, même si l'entrée était réactive */
  if(!(started&&running&&!gameOver&&!garageOn)){CAD.crs=false;CAD.lT=0;if(CAD.on){cadPose(false,now);CAD.sorties--;}return;} // hors course : jamais calé (et ce n'est pas une « sortie »)
  if(paused)return; // en pause : l'état reste tel quel
  if(!CAD.crs){CAD.crs=true;CAD.lT=0;CAD.essT=0;if((PAL.b('cadenceDepart',0)||(MOB_GOUV&&mobChaud()))&&!loop._r30)cadPose(true,now);return;} // le départ de la course (2026-10-25 : et d'une course qui démarre déjà chaude — gouverneur thermique)
  if(MOB_GOUV&&!CAD.on&&!loop._r30&&mobChaud()){CAD.essT=0;cadPose(true,now);return;} /* (2026-10-25) la course devient chaude (dose ou état iOS) : calage immédiat, sans attendre les images ratées */
  if(!CAD.calme||QL.essai){CAD.lT=0;CAD.calT=now;return;}
  if(!CAD.on){const ess9=CAD.essT>0&&now-CAD.essT<10000;
    CAD.lT=QLR.p75>19?CAD.lT+d:0;
    if(CAD.lT>(ess9?1000:PAL.b('cadenceTenue',2000))&&posteCadOk(now)){
      if(ess9){CAD.murT=now;CAD.murD=Math.min(480000,CAD.murD*2);} // l'essai de 60 a échoué : un MUR (60 s, puis 2, 4, 8 min)
      CAD.essT=0;cadPose(true,now);}
    else if(CAD.essT>0&&!ess9){CAD.essT=0;CAD.murD=30000;}} // l'essai a tenu 10 s : 60 est acquis, le mur repart de zéro
  else if(CAD.wh>=3||(CAD.murT>0&&now-CAD.murT<CAD.murD)||(QLR.vraiT&&now-QLR.vraiT<20000&&QLR.vrai>13)||(MOB_GOUV&&mobChaud()))CAD.calT=now; /* (2026-10-25) chaud : la sortie réactive ne joue pas */
  else if(now-CAD.calT>5000){cadPose(false,now);CAD.essT=now;}}
/* ===== LE HUD CONTEMPLATIF + L'ÉCRITURE ALLÉGÉE (2026-11-12, Sacha) — voir css/hud-da.css. hudCalmeTick est appelé à chaque image de loop. Vrai téléphone seulement (TEL_NATIF, donc aussi ?tel=1 au banc).
   Le HUD s'efface quand le nitro est relâché depuis 0,9 s, en course, hors leçon d'auto-école ; il revient au nitro, en pause, à la mort, et quand le chrono de vol passe à l'urgence (on ne meurt pas sans l'avoir vu). */
const HUD_CALME={ok:!/[?&]sans=[^&]*hudcalme/.test(location.search),leger:!/[?&]sans=[^&]*ecrleger/.test(location.search),on:false,t:0,pose:false,air:null};
function hudCalmeTick(now){if(!TEL_NATIF)return;
  if(!HUD_CALME.pose){HUD_CALME.pose=true;if(HUD_CALME.leger)document.documentElement.classList.add('ecrLeger');}
  if(!HUD_CALME.ok)return;
  const course=started&&running&&!gameOver&&!paused&&!garageOn&&!(typeof TUTO!=='undefined'&&TUTO.on)&&mode!=='boom';
  if(!course||nitroOn||keys.Space||keys.ShiftLeft||keys.ShiftRight)HUD_CALME.t=now; /* (2026-11-12, chasse aux bugs du HUD) « quand le joueur RELÂCHE le nitro » : le bouton tenu compte, pas seulement la poussée — réserve à sec, le doigt appuyé, le HUD s'effaçait (et la jauge vide avec lui) */
  let h=course&&now-HUD_CALME.t>900;
  if(h&&mode==='fall'&&HUDV==='d'){const a=HUD_CALME.air||(HUD_CALME.air=document.getElementById('airHud'));if(a&&a.dataset.k==='urgent')h=false;}
  if(h!==HUD_CALME.on){HUD_CALME.on=h;document.body.classList.toggle('hudCalme',h);}}
/* (2026-11-12, chasse aux bugs du HUD) le vol critique ne rallume le HUD qu'avec l'anneau de vol (?hud=d) : par défaut aucun temps de vol ne s'affiche (HUD léger), le HUD revenait sans rien montrer. */
window.dbgHudCalme=function(){return {on:HUD_CALME.on,ok:HUD_CALME.ok,leger:document.documentElement.classList.contains('ecrLeger'),nitro:!!nitroOn,depuis:Math.round(performance.now()-HUD_CALME.t)};};
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
function hudReveil(){const l=HUD_DORT.l;for(let i=0;i<l.length;i++)l[i].classList.remove('hudDortP');l.length=0;}
function hudDortTick(now){if(!TEL_NATIF||!HUD_DORT.ok)return;
  const cle=!started?'':paused?'p':gameOver?'m':HUD_CALME.on?'c':'';
  if(cle!==HUD_DORT.cle){HUD_DORT.cle=cle;HUD_DORT.t=now;hudReveil();return;}
  if(!cle||now-HUD_DORT.t<600||now-HUD_DORT.scan<1000)return;
  HUD_DORT.scan=now;
  for(let k=0;k<HUD_DORT.R.length;k++){const r=document.getElementById(HUD_DORT.R[k]);if(!r||!r.getAnimations)continue;const an=r.getAnimations({subtree:true});
    for(let i=0;i<an.length;i++){const a=an[i];if(a.playState!=='running')continue;const t=a.effect&&a.effect.target;if(!t||t.classList.contains('hudDortP'))continue;
      let boucles=true;const to=t.getAnimations();for(let j=0;j<to.length;j++){if(!to[j].animationName)continue;const tm=to[j].effect&&to[j].effect.getTiming();if(!tm||tm.iterations!==Infinity){boucles=false;break;}} /* les transitions (largeur de la jauge…) ne comptent pas : animation-play-state ne les touche pas */
      if(!boucles||hudDortVis(t)||(cle==='c'&&!hudDortSousCalme(t)))continue;t.classList.add('hudDortP');HUD_DORT.l.push(t);HUD_DORT.n++;}}}
if(TEL_NATIF&&(/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Macintosh/.test(navigator.userAgent)))&&!/[?&]sans=[^&]*reflets/.test(location.search))document.documentElement.classList.add('ifReflets'); /* (2026-11-12, interface-opti) LES REFLETS SUR LEUR COUCHE — voir css/interface-opti.css §2. iOS seulement (WebKit : vérifié identique au pixel ; dans Chrome l'antialiasing du reflet bouge de quelques niveaux) */
window.dbgHudDort=function(){return {ok:HUD_DORT.ok,cle:HUD_DORT.cle,geles:HUD_DORT.l.length,total:HUD_DORT.n,elements:HUD_DORT.l.map(function(e){return e.id||e.className;})};};
window.dbgCadence=function(f){if(f!=null){const n=performance.now();f=+f;CAD.force=(f===30||f===60)?f:0;CAD.ok=(CAD.force||PAL.b('cadence30',0)||CAD30_REC||POSTE.auto)?1:0;if(CAD.force)cadPose(f===30,n);else if(!CAD.ok)cadPose(false,n);} // (banc) 30 force, 60 coupe et fige, 0 rend la main
  const n=performance.now();return {on:CAD.on,per:+CAD.per.toFixed(1),ecran:+CAD.ecran.toFixed(2),w:+CAD.w.toFixed(1),mur:(CAD.murT>0&&n-CAD.murT<CAD.murD)?Math.round((CAD.murD-(n-CAD.murT))/1000):0,entrees:CAD.entrees,sorties:CAD.sorties,force:CAD.force,auto:CAD.ok===1&&!CAD.force,essai:CAD.essT>0&&n-CAD.essT<10000,gel:CAD.gel,haut:+CAD.wh.toFixed(1),plafond:{actif:FPS_CAP,n:FPS.n,ecran:+FPS.per.toFixed(2)}};}; // (2026-10-20) plafond : une image d'écran sur n (fpsSaute)
/* ====================== HORS COURSE À 30 i/s — HC (2026-10-23, audit mobile, Sacha : « une version mobile fluide sans que ça baisse trop en qualité ») ======================
   CAD ne cale qu'EN COURSE : un accueil ou un garage laissé ouvert tournait à 60 i/s plein rendu (haute définition comprise) et chauffait comme une
   partie. Sur ANCIEN et MOYEN (CAD.ok), l'accueil et le garage se calent donc sur 33 ms, par le même saut en temps que CAD (une image d'écran sur
   deux sur 60 Hz, une sur quatre sur 120 Hz) : une image sautée ne fait RIEN, le dt de la suivante absorbe l'écart (borné à 50 ms). La durée lue par
   la règle de qualité est ramenée à une image d'écran (voir ms9 dans loop), le filet de VHD et la détection de 30 Hz imposé n'y voient donc rien.
   Palier RÉCENT : `hors30` = 0, aucun effet. `?hc=0` coupe (comparer). La course, la pause et l'écran de fin ne sont pas touchés. */
PAL.B.hors30=[1,1,0];
const HC={on:false,der:0,goT:0,off:/[?&]hc=0/.test(location.search)};const HC_FROID=TEL_NATIF&&!/[?&]sans=[^&]*calmefroid/.test(location.search);
function hcSaute(now){ // en tête de loop (après cadSaute, qui tient CAD.ecran à jour) : rend true si cette image d'écran se saute
  /* (2026-11-12, ios-ultime, Sacha : « trouve des moyens de ne pas faire monter cette chaleur ») LA PAUSE ET L'ÉCRAN DE MORT AU FRAIS — sur l'app, la pause dessinait la scène IMMOBILE
     à 60 i/s plein rendu (cadSaute rend la main en pause, même calé), et l'écran de mort aussi (hors course : plus de calage). Désormais : en pause, 10 i/s ; sur l'écran de mort,
     3,5 s après la mort (l'explosion reste à sa cadence), la règle des menus (30 i/s, 15 au repos, 60 sous le doigt). `?sans=calmefroid` = comme avant. */
  if(!gameOver)HC.goT=now;
  const froid=HC_FROID&&started&&!garageOn&&!document.hidden&&(paused?1:(gameOver&&now-HC.goT>3500)?2:0);
  if(froid===1){HC.per=100;if(HC.on&&now-HC.der<HC.per-CAD.tol)return true;HC.on=true;HC.der=now;return false;}
  const hc=!HC.off&&(PAL.b('hors30',0)||PFR_ON)&&(froid===2||(!CAD.on&&(!started||garageOn)))&&!document.hidden;
  if(!hc){HC.on=false;return false;}
  if(!MENU_MAX&&hcGeste(now)){HC.on=false;return false;} /* (2026-11-07, Perf 3 — P5) un geste ou une transition : 60 i/s, voir HC GESTE */
  HC.per=hcRepos(now)||CAD.per; /* (2026-11-07, Perf 3 — P5) au REPOS (aucun geste depuis 3 s) 15 i/s, depuis 8 s 10 i/s — voir HC REPOS */
  if(HC.on&&now-HC.der<HC.per-CAD.tol)return true;
  HC.on=true;HC.der=now;return false;}
/* HC GESTE (2026-11-07, Perf 3 — P5, Sacha : « les menus fluides et froids ») le repos se dessine à 30 i/s (le téléphone au frais, PFR_ON) mais un doigt posé, un défilement, un
   changement d'écran ou de caisse rendent les 60 i/s — 0,35 s après le dernier signe — puis le repos reprend. `?menu=max` = comme avant (30 i/s en continu). */
HC.gT=0;
(function(){const m=function(){HC.gT=performance.now();};['touchstart','touchmove','pointerdown','wheel'].forEach(function(e){document.addEventListener(e,m,{capture:true,passive:true});});
  document.addEventListener('pointermove',function(e){if(e.buttons)HC.gT=performance.now();},{capture:true,passive:true});})();
/* HC REPOS (2026-11-07, Perf 3 — P5, OPTI ULTIME : « le menu est le premier chauffe-téléphone de l'app » — mesuré au banc : l'accueil rendait 28 images/s de 146 appels et 800 k triangles, 23 M de triangles par seconde, sans que personne touche) : sur
   un vrai téléphone, sans geste depuis 3 s l'accueil, le garage et la boutique se dessinent à 15 i/s, depuis 8 s à 10 i/s (la caisse tourne à 0,24 rad/s : 1 à 1,4° par image) ; un toucher rend les 60 aussitôt (HC GESTE).
   `PAL.B.reposMs=[66,66,66]` (période à 3 s) et `PAL.B.reposLongMs=[66.7,66.7,66.7]` (à 8 s) ; 0 = coupé ; `?repos=0` ou `?menu=max` = 30 i/s en continu comme avant. */
PAL.B.reposMs=[66.7,66.7,66.7];PAL.B.reposLongMs=[66.7,66.7,66.7];
const HC_REPOS_OFF=/[?&]repos=0\b/.test(location.search);
function hcRepos(now){if(MENU_MAX||HC_REPOS_OFF||!TEL_NATIF)return 0; /* (2026-11-10) le repos à 15 i/s est une affaire de chaleur de téléphone : un ordi aux régimes LÉGER / MINIMUM garde ses menus à 30 */const d=now-HC.gT;return d>8000?PAL.b('reposLongMs',0):d>3000?PAL.b('reposMs',0):0;}
function hcGeste(now){return now-HC.gT<350||!!(typeof ecranWipe==='function'&&ecranWipe._on)||!!(typeof GAR!=='undefined'&&(GAR.go||GAR.sw))||garageDrag;}
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
