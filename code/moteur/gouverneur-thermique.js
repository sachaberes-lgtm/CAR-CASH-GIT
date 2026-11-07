/* ===== LE GOUVERNEUR THERMIQUE — MOB_G (2026-10-25, passe perf mobile : « 30 i/s stables si chaud » — Sacha ; mesure du 25/10 sur l'iPhone 13 Pro, dans l'app, jeu v897) =====
   MESURÉ : cinq courses de 75 s de suite (nuages niv. 1, puis niv. 2 à 9 en 25 s, tenue en ville niv. 9, pilote automatique) : 56,8 / 57,7 / 51,2 / 49,4 / 37,9 i/s
   (niveau 9 : 56,0 / 56,6 / 43,4 / 52,4 / 33,4), images > 25 ms : 52 / 38 / 262 / 109 / 425, sonde CPU 4 → 3, 4 → 3, 5 → 7, 4 → 5, 8 → 9. Le capteur de batterie ne gagne
   que 4 °C (il retarde sur la puce) : iOS bride la puce à partir de la 3e course, soit après 150 à 200 s de course à 60 i/s cumulées, menus compris. La cadence réactive
   (CAD30_REC, cadence.js) ne cale sur 30 qu'APRÈS avoir vu le quart des images rater la synchro : le joueur a déjà subi les secondes hachées. Ce morceau CALE AVANT :
   une « dose » MOB_S.D, en secondes équivalentes de 60 i/s en course, estime la chaleur sans aucun capteur.
   · Elle MONTE : +1 par seconde de course à 60 i/s, +0,5 de course déjà calée sur 30 (la puce y travaille moitié moins), +0,3 au menu / au garage (le plein rendu 3D du
     menu chauffe aussi, mais moins qu'une course).
   · Elle REDESCEND de 0,25 par seconde au repos : pause, écran de mort, application en arrière-plan, écran verrouillé, trou de plus d'une seconde entre deux images
     (rien n'est rendu). 0,25 : un repos de 60 à 120 s n'efface que 15 à 30 s de dose, comme le téléphone des cinq courses (rien n'y refroidit entre deux courses).
   · SEUIL HAUT 160 : entrée à 30 i/s. Sur la chronologie des cinq courses (22 s de menu, 75 s de course, 60 à 120 s de repos) le modèle bascule dans la 3e course,
     20 à 50 s après son départ, jamais avant la 2e (preuve : .banc-perf/gouverneur.cjs). SEUIL BAS 40 : retour à 60 seulement quand le téléphone a VRAIMENT refroidi
     (de 160 à 40 à 0,25/s : 8 min de repos complet ; plafond de la dose 230 : 13 min au pire). Entre les deux, on garde l'état (hystérésis).
   · La dose survit entre les parties (mémoire du jeu) ET entre deux lancements (localStorage `cashcarMobGouv`, daté : plus de 10 min = 0, sinon refroidie du temps écoulé).
   Branchement dans la cadence existante (cadence.js) : le départ d'une course déjà « chaude » est calé dès la 1re image ; une course qui devient chaude est calée à l'instant ;
   `mobChaud()` retient la SORTIE réactive (le retour à 60 sur « travail < 10 ms » ne joue pas tant que le gouverneur dit chaud) et gèle la remontée de l'échelle QL
   (`cadenceMonte`) : calé par chaleur, on ne remplit pas les 33 ms de qualité. Quand le gouverneur se tait, la règle réactive reprend la main telle quelle (essai de 60,
   mur…). Rien de la simulation ne change : seule la CADENCE (30 calées au lieu de 17-45 hachées), jamais l'image.
   Seulement sur un vrai téléphone (TEL_NATIF) au palier RÉCENT, comme CAD30_REC. `?mob_gouv=0` = avant (aucune ligne de ce morceau ne tourne, les tests des autres morceaux
   sont court-circuités).
   L'ÉTAT THERMIQUE D'iOS (prise pour un futur plugin Swift) : `window.dispatchEvent(new CustomEvent('cc:thermique',{detail:{etat:n}}))`, n = 0 nominal · 1 fair · 2 serious ·
   3 critical. ≥ 2 : calage immédiat sur 30, quelle que soit la dose (qu'on remonte à 160 : iOS en sait plus que nous, le modèle ne relâchera qu'après un vrai repos) ;
   3 : en plus UN cran de l'échelle QL de moins (une fois par épisode) ; 0 ou 1 : le modèle reprend la main.
   Banc : `dbgGouv()` rend {D, seuilHaut, seuilBas, actif, thermo, pourquoi} ; `dbgGouv(n)` pose la dose ; `dbgThermique(n)` simule l'événement. */
const MOB_GOUV=CAD30_REC&&!/[?&]mob_gouv=0\b/.test(location.search);
const MOB_G={course60:1,course30:.5,menu:.3,repos:.25,haut:160,tiede:50,g30:/[?&]mob_g30=1\b/.test(location.search),bas:40,max:230,trou:1,perime:600,cle:'cashcarMobGouv'}; /* tout se règle ici (secondes équivalentes, par seconde réelle) */
const MOB_S={D:0,actif:false,thermo:0,t:0,sauveT:0,q3:false};
function mobGouvEval(){ /* l'hystérésis : haut → entre, bas → sort, entre les deux on garde */
  if(MOB_S.D>=MOB_G.haut)MOB_S.actif=true;else if(MOB_S.D<MOB_G.bas)MOB_S.actif=false;}
/* ===== LE PREMIER SIGNE DE LENTEUR VAUT SEUIL (2026-10-25 soir, mesure du 13 Pro, séance continue de 7 min, v900) =====
   MESURÉ : la dose n'atteignait 160 qu'à la 5e minute alors que le téléphone s'effondre dès la 2e (20 puis 8 i/s aux minutes 3 et 4, p99 de 300 à 420 ms) ; une fois calé de force
   il tient 30 i/s réguliers (minutes 6 à 8 : p99 43 ms, 0 image > 50 ms). La cadence réactive (CAD30_REC) avait pourtant vu la lenteur dès la 1re minute (D=54, calée) puis
   était repartie à 60. Désormais : si la cadence réactive cale alors que la dose a déjà passé `tiede` (50, soit une minute de course), le gouverneur s'enclenche et RETIENT
   le 30 jusqu'au vrai repos (sous `bas`). Un téléphone qui ne rate jamais ses images n'est jamais touché avant 160. */
function mobReactif(){if(MOB_GOUV&&!MOB_S.actif&&MOB_S.D>=MOB_G.tiede){MOB_S.actif=true;mobGouvSauve();}} /* appelé par cadPose quand la cadence cale */
/* ===== LE 30 DÈS LE DÉPART (2026-10-26 nuit, mesure du 13 Pro : « 30 i/s stables si chaud » — Sacha) =====
   MESURÉ : une séance de 7 min CALÉE SUR 30 DÈS LA 1re SECONDE (dose forcée) ne s'effondre pas : 31,5 · 26,5 · 25,4 · 29,6 · 30,4 · 30,3 · 30,3 · 31,1 i/s, 85-100 % des intervalles entre 28 et 39 ms,
   p99 35-68 ms, alors que la batterie monte à 38 °C. Toutes les séances qui jouent les 60-100 premières secondes à 60 i/s s'effondrent à 5-13 i/s aux minutes 3-5 (la chaleur des premières minutes
   à 60 déclenche la bride d'iOS), même quand le gouverneur cale ensuite sur 30. `?mob_g30=1` = le gouverneur est TOUJOURS actif en course : 30 calées dès le départ (INACTIF par défaut :
   c'est un choix de fluidité, Sacha tranche). */
function mobChaud(){return MOB_GOUV&&(MOB_G.g30||MOB_S.thermo>=2||MOB_S.actif);} /* vrai : le gouverneur veut le téléphone calé sur 30 */
function mobGouvSauve(){try{localStorage.setItem(MOB_G.cle,JSON.stringify({D:+MOB_S.D.toFixed(1),a:MOB_S.actif?1:0,t:Date.now()}));}catch(e){}}
function mobGouvCharge(){try{const o=JSON.parse(localStorage.getItem(MOB_G.cle)||'null');if(!o||!(o.D>0))return;
  const age=(Date.now()-o.t)/1000;if(!(age>=0&&age<MOB_G.perime))return; /* plus de 10 min (ou horloge refaite) : froid */
  MOB_S.D=Math.max(0,Math.min(MOB_G.max,o.D-age*MOB_G.repos));MOB_S.actif=!!o.a;mobGouvEval();}catch(e){}}
function mobGouvTick(now){ /* en tête de cadSaute (donc à CHAQUE image d'écran, sautée ou non) : la dose suit l'horloge, pas les images calculées */
  if(!MOB_S.t){MOB_S.t=now;return;}
  const d=(now-MOB_S.t)/1000;MOB_S.t=now;if(!(d>0))return;
  let v; /* vitesse de la dose, par seconde */
  if(d>MOB_G.trou||document.hidden)v=-MOB_G.repos; /* un trou : arrière-plan, écran verrouillé, intro du studio — rien n'a été rendu */
  else if(started&&running&&!gameOver&&!garageOn&&!paused)v=CAD.on?MOB_G.course30:MOB_G.course60;
  else if(paused||gameOver)v=-MOB_G.repos;
  else v=MOB_G.menu;
  MOB_S.D=Math.max(0,Math.min(MOB_G.max,MOB_S.D+v*d));mobGouvEval();
  if(now-MOB_S.sauveT>5000){MOB_S.sauveT=now;mobGouvSauve();}}
function mobThermo(n){ /* l'état thermique d'iOS (0 nominal · 1 fair · 2 serious · 3 critical) */
  n=Math.max(0,Math.min(3,n|0));MOB_S.thermo=n;
  if(n>=2){MOB_S.D=Math.max(MOB_S.D,n===3?MOB_G.haut+30:MOB_G.haut);MOB_S.actif=true;mobGouvSauve();}
  if(n===3&&!MOB_S.q3){MOB_S.q3=true;try{qlPose(QL.k+1);}catch(e){}} /* UN cran de qualité par épisode critique (qlPose borne au dernier cran) */
  else if(n<3)MOB_S.q3=false;}
if(MOB_GOUV){mobGouvCharge();
  window.addEventListener('cc:thermique',function(e){mobThermo(+(e&&e.detail&&e.detail.etat));});
  window.addEventListener('pagehide',mobGouvSauve);
  document.addEventListener('visibilitychange',function(){if(document.hidden)mobGouvSauve();});}
window.dbgGouv=function(n){if(n!=null&&MOB_GOUV){MOB_S.D=Math.max(0,Math.min(MOB_G.max,+n||0));mobGouvEval();mobGouvSauve();} /* (banc) pose la dose */
  const pq=!MOB_GOUV?(CAD30_REC?'coupé (?mob_gouv=0)':'hors téléphone récent'):MOB_S.thermo>=2?'état thermique iOS '+MOB_S.thermo:MOB_S.actif?'dose au-dessus du seuil bas':'froid';
  return {D:+MOB_S.D.toFixed(1),seuilHaut:MOB_G.haut,seuilBas:MOB_G.bas,actif:mobChaud(),thermo:MOB_S.thermo,pourquoi:pq};};
window.dbgThermique=function(n){if(MOB_GOUV)mobThermo(+n);return MOB_S.thermo;}; /* (banc) simule l'événement 'cc:thermique' */
