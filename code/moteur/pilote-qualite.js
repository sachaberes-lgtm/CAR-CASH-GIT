/* ===== LE PILOTE DE QUALITÉ (2026-11-17, Sacha : « l'optimisation des rois : le téléphone affiche toujours le maximum de ce qu'il peut afficher, peu importe les conditions » ; plan passation/qualite/PILOTE-QUALITE.md) =====
   MESURÉ (13 Pro, builds 117-119, branché + économie d'énergie : la condition de Sacha) : le jeu partait au même niveau quelles que soient les conditions (N1, DPR 1,25, 30 i/s) ; le gouverneur réagissait
   tard et d'un coup (DPR 1,25 → 1,00 EN PLEINE COURSE, toile retaillée : gels de 270-300 ms) ; à critical la cadence 20 i/s sur un écran à 30 Hz donnait 33/66 ms en alternance.
   UN SEUL DÉCIDEUR, UN CURSEUR K (0 = l'ULTIME du niveau, 12 = la survie) posé sur les réglages qui existent déjà (imgRegle, qlMin, polyphonie, vent et émission) :
     K  ce qui s'ajoute (cumulé)                                     quand
     0  le niveau entier                                             —
     1  ombre en vol une image sur deux (qlMin 1)                    [C] en course
     2  ciel lisse une image sur 2                                   [C]
     3  polyphonie des bruitages ×½                                  [C]
     4  halo : un étage de moins                                     [C]
     5  ombre un cran plus bas (cartes préchauffées)                 [C]
     6  ciel 1/4, traits et traînées ×0,75, vent et émission ×0,75   [C]
     7  halo d'entrée en demi-résolution (cibles du halo refaites)    [P] au portail ou sous voile
     8  ombre 512, halo 2 étages, ciel 1/8, traits ×½ (= GDX_CRI)    [P] (jusqu'au 19/11 la loupe de la caisse tombait ici ; elle est désormais le cran 13, voir LA VOITURE EN DERNIER)
     9  niveau − 1 (N2 → N1)                                         [V] sous voile : départ, mort, pause, menu
    10  plafond de résolution × 0,9                                  [V]
    11  plafond de résolution × 0,8                                  [V]
    12  SURVIE : halo coupé (QUAL_LOW)                               [V]
    13  LA CAISSE : la loupe retirée (la toile visible reprend la taille de la scène)   [V] (2026-11-19, lot pilotevoiture : voir LA VOITURE EN DERNIER plus bas)
   LE NIVEAU : le réglage du joueur devient un PLAFOND. Jamais choisi = AUTO = le niveau HAUTE de la classe (N2 sur le 13 Pro, au lieu de N1) ; BASSE choisie = le niveau BASSE ; HAUTE choisie = HAUTE.
     ⚠ À VALIDER PAR SACHA. `?sans=pilauto` = un téléphone jamais choisi reste au niveau BASSE, comme avant.
   LE DÉPART (avant la première image de course, et au chargement), lu sur les conditions (`pilCond` : thermique d'iOS, branché, économie, batterie) — `pilTableC` :
     (2026-11-17, corrections du contrôle adverse : vols 117-119, au N1 branché + économie on a déjà 28,8 i/s à nominal et 26-35 ms de vrai coût à fair/serious, sans marge)
     · le niveau plein (N2 sur le 13 Pro) SEULEMENT débranché, sans économie, nominal, batterie ≥ 20 % : K0 ;
     · toute autre condition part (en AUTO ; HAUTE choisie garde son niveau) au niveau BASSE de la classe (`PILO.capN`, N1 : au mieux le rendu d'aujourd'hui), avec sur ce niveau :
       nominal K0 (K1 branché + éco) · fair K1 (K2 branché + éco) · serious K5 (K6 branché + éco) · critical K10 · batterie < 20 % : +2.
     · (4e tour) PLUS DE MONTÉE à N2 hors condition libre : la mémoire n'y apprend que le cran K, jamais le niveau. En libre : départ N2 (K appris, K0 sans mémoire) ; ÉCHEC (5e tour) = 3 s DE SUITE
       de vrais ratés dans la seconde même (> 8 % des images de CETTE seconde ; ni la fenêtre glissante, ni la sonde), urgence, ORANGE ≥ 50 % d'un segment ≥ 30 s, ou K ≥ K de départ + 3 avec ≥ 3 s
       de vrais ratés → mur N2 (24 h, puis 7 j, puis doublé jusqu'à 30 j) écrit dès le constat, retour N1 au moment sous voile suivant. Un accroc isolé ne pose jamais de mur.
     Dans la séance, une condition déjà vécue repart du K qu'elle a tenu (`PILO.sess`), et la mémoire (étape 4) au lancement suivant.
     Jamais un départ plus lourd qu'aujourd'hui en branché / éco / chaud tant que rien n'est appris. `?sans=pilhyst` = sans l'hystérésis (une condition meilleure ne compte qu'après 60 s stables).
   EN COURSE, une fois par seconde (`pilTick`), sur une fenêtre de 10 s (hors pause, menus, 1 s après un portail ou une construction) :
     · tic raté = image calculée arrivée à plus de 1,5 × la période visée ; vrai coût = la sonde de la puce (`QLR.vrai`, barrière sans attente), armée toutes les 10 s de course ;
       (2026-11-17, GELS ≠ CHARGE) un tic raté ne compte comme CHARGE que si l'image d'avant a vraiment coûté (`CAD.w` de cadFin : la boucle + l'envoi du rendu, ≥ 70 % du tic d'écran) ;
       un trou > 80 ms derrière une boucle légère est un GEL hors boucle (rAF non livré par iOS) : compté à part (`PILO.gels`, au journal), aucun cran ne descend ;
     · URGENCE : ROUGE tenu 8 s avec les crans [C] dépensés (K ≥ 6), ou critical en course avec une dette de résolution → la résolution se paie EN COURSE, une fois par course,
       au moment le moins visible (en l'air, nitro, sinon au bout de 3 s), « retaille · urgence » au journal. La fluidité passe avant le verrou. `?sans=pilurgence` = sans ;
     · ROUGE (ratés > 8 % sur 3 s, ou vrai > 1 × la période) : un cran [C] tout de suite (un toutes les 3 s au plus) ; [C] épuisés → dette ;
     · ORANGE (ratés 2-8 % sur 10 s, ou vrai > (budget + 0,05) × période ; budget 0,75, 0,85 en HAUTE, − 0,05 branché + éco) : dette + 1, payée au moment permis suivant ;
     · BLEU (ratés < 0,5 % et vrai < 0,55 × période, 60 s cumulées, aucun ROUGE depuis 120 s, thermique stable ou en baisse, le cran au-dessus prédit < 0,70 × période) : un cran de mieux au moment suivant ;
     · ANTICIPATION : la condition change (thermique qui monte, branché sous éco…) → la différence de table est posée en dette AVANT que les images ne ratent ; elle refroidit → la dette se rend ;
     · MUR : un cran remonté suivi d'un ORANGE ou ROUGE dans les 30 s → on redescend au moment suivant, et ce cran est un mur 2 min (puis 4, 8, 16) pour cette condition.
   (3e tour, 17/11, contrôle adverse S1-S3, M1-M5) · MÉMOIRE : plus de remise à zéro sur un changement de base ; un échec à N2 pose un MUR N2 par condition (7 j, doublé, 30 j au plus) ;
     · GELS : gels + trous > 0,5 % des images (ou ≥ 2 gels / 10 s) = ni BLEU, ni remontée, ni marge ; gels soutenus (10 s) ET serious ou plus = ORANGE (la chaleur) ;
     · BORNE : hors débranché + sans éco + nominal, aucun levier plus lourd que ?sans=pilote dans la même condition (pilBase, calculée par le gouverneur de base) ; à fair et plus, le niveau aussi ;
     · PORTAIL : un JETON posé par portailPasse, consommé par la fin de newTrackG ; la piste de resetGame ne paie rien ; les accrocs de 1,5 s après un portail ou une reconstruction = « construction » ;
     · URGENCE au critical : ORANGE tenu 5 s exigé (4e tour : de VRAIS ratés ≥ 2 % ou un vrai coût > (budget + 0,05) × période ; les gels au chaud ne comptent pas) ; MORT : la reprise reste possible 1,5 s, et tant qu'un jeton de la machine à sous attend (machine pas encore vue).
   LES MOMENTS (`pilMoment`) : départ et menu (tout, d'un coup) ; mort et pause de plus d'1 s (tout ; un cran de mieux au plus) ; portail (crans 0-8 seulement, jamais le niveau ni la résolution).
   Jamais pendant le 3-2-1, une réanimation, le final spin : seuls ces moments-là appellent pilAppliquer.
   PRISE DE MAIN : sous `pilOn()` le gouverneur des paliers (mobPalTick), l'image lourde (gdxLourdTick), l'échelle QL automatique (boucle-1.js), le cran de plus du critique (mobThermo) et la séance
   brûlante à chaud (pjcTick) ne décident plus : ce sont des capteurs. JOURNAL : genre `pilote` de la boîte noire (une ligne par changement, avec la raison ; une ligne `retaille` par toile refaite
   avec le moment) ; enregistreur (?perfrec=2) : colonne `PL` par seconde, histogramme `H` des intervalles d'écran par cases de 8 ms.
   Téléphone profilé seulement (`MOB_PALS && PRF.on` : TEL_NATIF, palier 2, classe connue). L'ordinateur ne voit rien.
   `?sans=pilote` = le jeu d'avant · `?pilote=N2` (niveau forcé, K0) · `?pilote=K5` · `?pilote=ultime` (K0) · `?pilote=survie` (K12) · `?pilote=fige` (le départ, puis plus rien) · `?pilote=gel` (mesure seule) ·
   `?sans=pilauto` · `?sans=pilanticipe` · `?sans=pilgels` (tout tic raté = charge, comme avant) · `?sans=pilurgence` · `?sans=pilhyst` · `?sans=pilcad33` (au critique, 50 ms visés comme avant le 22/11 ; défaut = 33 régulier sur un écran à 30) · `?sans=pilborne` (sans la borne S3) · `?sans=pilsonde` · `?pilcible=0.7` (le budget) · `dbgPilote()` · `dbgPiloteSim({t,B,E,bat,vrai,rates,eM,K,Kv})` (simule les capteurs ; eM = la médiane des images d'écran, ms ; K = un cran posé en course, Kv = le visé). */
const PIL_Q=location.search,PIL_ON=!/[?&]sans=[^&]*\bpilote\b/.test(PIL_Q),PIL_AUTO=!/[?&]sans=[^&]*\bpilauto\b/.test(PIL_Q),PIL_ANT=!/[?&]sans=[^&]*\bpilanticipe\b/.test(PIL_Q),PIL_SONDE=!/[?&]sans=[^&]*\bpilsonde\b/.test(PIL_Q);
const PIL_F=(function(){const m=/[?&]pilote=([a-z0-9]+)/i.exec(PIL_Q);return m?m[1].toLowerCase():'';})();
const PIL_NF=/^n[1-4]$/.test(PIL_F)?+PIL_F[1]:0,PIL_KF=/^k(\d|1[0-3])$/.test(PIL_F)?Math.min(/^k13$/.test(PIL_F)&&!/[?&]sans=[^&]*\b(pilotevoiture|voituredabord)\b/.test(PIL_Q)?13:12,+PIL_F.slice(1)):PIL_F==='ultime'||PIL_NF?0:PIL_F==='survie'?12:-1,PIL_FIGE=PIL_F==='fige',PIL_GEL=PIL_F==='gel';
const PIL_B=(function(){const m=/[?&]pilcible=([\d.]+)/.exec(PIL_Q);return m?Math.max(.4,Math.min(.95,+m[1])):0;})();
const PIL_NOM=['ULTIME','ombre en vol ½','ciel ½','polyphonie ½','halo −1 étage','ombre −1','ciel ¼ · traits ¾','halo ½','recette critique','niveau −1','résolution ×0,9','résolution ×0,8','SURVIE','caisse : loupe retirée'];
/* ===== LA VOITURE EN DERNIER (2026-11-19, lot pilotevoiture, Sacha le 18/11 : « c'est pas grave si ça baisse en qualité, mais je préférais que ça soit la map qui baisse en qualité en priorité et que
   la voiture soit toujours le plus nette […] d'abord que ça soit les textures qui baissent, mais que la voiture reste la plus nette qui soit et que ensuite on baisse la voiture ») =====
   CONSTAT (contrôle de l'ensemble du 19/11) : sous le pilote, la loupe de la caisse (rendu/loupe-caisse.js, ce qui garde la voiture nette) tombait au cran 8 (`PILO.lpOff=K>=8`), en même temps
   que la recette critique du décor, AVANT le niveau, la résolution et le halo coupé ; à serious avec des ratés elle tombait à la mort et la course suivante repartait sans elle ; l'urgence ROUGE
   la retirait EN COURSE (toile visible 2532×1170 → 949×438). « La voiture d'abord » (VDA, nettete-qualite.js) n'y pouvait rien : loupeChaud rend PILO.lpOff avant sa règle.
   DÉSORMAIS (`PIV_ON`) :
   · la loupe est le DERNIER cran de l'échelle : K13, après le halo coupé (K12). Elle ne tombe qu'à K13 ou à CRITICAL (comme la voiture d'abord, et comme ?sans=pilote : la base ne garde
     pas la loupe à critical, la borne S3 non plus) ;
   · elle ne change qu'à un moment SOUS VOILE (départ, mort, pause, menu, reprise) — jamais en course, jamais à l'urgence ; et à chaque moment sous voile elle est REPOSÉE dès que l'état
     le permet (pilPaie le regarde, même si le cran ne bouge pas) ;
   · K13 ne s'apprend pas et ne sert jamais de départ (pilDepartCalc borne à 12) : une course repart toujours AVEC la loupe, sauf à critical ; il n'est atteint que par la dette d'une course
     déjà à K12 (ROUGE ou ORANGE tenus), payée à la mort ou à la pause ;
   · L'URGENCE retire d'abord le DÉCOR : 1re urgence (crans [C] dépensés, ROUGE tenu 8 s, ou vrais ratés tenus 5 s au critical) = K7-K8 (halo ½, recette critique) posés comme au portail
     (cibles du halo refaites, résolution tenue) ; la résolution (niveau − 1 ou × 0,9) ne se paie en course qu'à la 2e, si le ROUGE tient encore 8 s (5 s au critical). Avec la loupe
     posée, la toile VISIBLE ne change plus de taille : seules les cibles de la scène sont refaites.
   `?sans=pilotevoiture` (ou `?sans=voituredabord`) = l'ordre d'avant au bit près : loupe retirée dès K8, à l'urgence aussi, échelle 0-12, urgence d'un seul coup. */
const PIV_ON=!/[?&]sans=[^&]*\b(pilotevoiture|voituredabord)\b/.test(PIL_Q);
function pilLoupeOff(K,c){if(!PIV_ON)return K>=8;return K>=13||!!(c&&c.t>=3);} /* la loupe retirée : cran 13 ou critical (l'ordre d'avant : dès le cran 8) */
function pilKPlaf(K){return PIV_ON&&K>=12?13:12;} /* le cran le plus lourd qu'une dette peut viser : 13 (la caisse) seulement une fois la SURVIE (K12) posée */
const PILO={K:0,Kv:0,N0:0,capN:0,src:'',cle:'',c:null,tPrev:-9,mom:'',depT:-1e9,portT:-1e9,tk:0,pauseT:0,menu:false,mort:false,mortP:false,avMort:null,fait:false,
  h:new Uint16Array(16),per:1000/30,lastImg:0,nI:0,nR:0,nT:0,wDer:0,gels:0,gelsC:0,gelMax:0,gelNT:0,fen:[],vrai:0,vraiT:0,vT:0,sondeT:0,rougeT:-1e9,rgT0:0,cT:-1e9,oT:-1e9,bleuS:0,bleuT:-9,zone:'',monte:null,mur:{},sess:{},seg:{},
  urg:null,urgFait:false,bleuC:{},bleuK:'',nEchec:0,jetonT:0,nUrg:0,cand:'',candT:0,nPort:0,portIgn:0,nDep:0,depIgn:0,jeton:false,raz:false,razIgn:0,consT:-1e9,nCons:0,consC:0,consMax:0,gS:0,geleux:false,glS:0,orT0:0,mortT:0,spinVu:false,nBorne:0,borne:null,
  dDpr:0,dBloom:0,lpOff:false,nRet:{},nBloom:{},nOmb:{},jr:[],sim:null,chg:0};
const PIL_CAD=!/[?&]sans=[^&]*\bpilcad33\b/.test(PIL_Q); /* (2026-11-22, Sacha : « des gros gros freez des le debut […] regle ca ») LA MESURE SUR TÉLÉPHONE EST FAITE (vol-1122-2042, build 128, téléphone critique + mode économie : 30 tops d'écran par seconde mais 18,4 images calculées, 704 images à 33 ms pour 1468 entre 50 et 100 ms ; le même téléphone nominal : 29,7 images/s) : le 33 régulier devient le défaut sur un écran à 30 ; `?sans=pilcad33` = les 50 ms visés d'avant. · (cadPer, cadence.js) (3e tour, S3) au critique : le comportement de la base (50 ms visés) par défaut, la mesure sur téléphone n'étant pas faite ; ?plus=pilcad33 = 33 régulier sur un écran à 30 */
const PIL_GELS=!/[?&]sans=[^&]*\bpilgels\b/.test(PIL_Q); /* ?sans=pilgels = tout tic raté est une charge, comme avant (banc A-B) */
const PIL_URG=!/[?&]sans=[^&]*\bpilurgence\b/.test(PIL_Q),PIL_HYST=!/[?&]sans=[^&]*\bpilhyst\b/.test(PIL_Q),PIL_WC=.7,PIL_GEL_MS=80;
function pilOn(){try{return PIL_ON&&MOB_PALS&&!!PRF.on;}catch(e){return false;}}
function pilTic(){try{const S=PILO.sim;if(((S&&S.eM!=null)?S.eM:(CAD.eM||0))>=24||mobEco())return 1000/30;return CAD.ecran||1000/60;}catch(e){return 1000/60;}} /* la période des images d'écran : 33,3 si le rAF est mesuré à 30 (économie, ou la mitigation thermique de WebKit, que CAD.ecran ne voit pas) */
function pilPer(){let p=pilTic();try{if(CAD.on)p=Math.max(p,cadPer());}catch(e){}return p;} /* la période VISÉE d'une image calculée */
function pilK(){return PILO.K;}
function pilCond(){const S=PILO.sim||{};let t=-1,B=false,E=false,bat=-1;
  try{t=MOB_S.capteur?MOB_S.thermo|0:-1;}catch(e){}if(S.t!=null)t=S.t|0;
  try{B=(window.__ccBranche|0)>=2;}catch(e){}if(S.B!=null)B=!!S.B;
  try{E=mobEco();}catch(e){}if(S.E!=null)E=!!S.E;
  try{const b=window.__ccBatterie;if(b!=null&&b>=0)bat=+b;}catch(e){}if(S.bat!=null)bat=+S.bat;
  return {t:t,B:B,E:E,bat:bat,cle:'B'+(B?1:0)+'E'+(E?1:0)+'T'+t};}
function pilCondTx(c){return 'th '+c.t+' éco '+(c.E?1:0)+' br '+(c.B?1:0)+(c.bat>=0?' bat '+c.bat:'');}
function pilTableC(c){ /* {cap : départ au niveau BASSE de la classe, k : le cran sur ce niveau} — voir LE DÉPART en tête */
  const bas=c.bat>=0&&c.bat<20,BE=c.B&&c.E;let k,cap=true;
  if(!c.B&&!c.E&&c.t<=0&&!bas){cap=false;k=0;}
  else if(c.t>=3)k=10;else if(c.t===2)k=BE?6:5;else if(c.t===1)k=BE?2:1;else k=BE?1:0;
  if(bas)k+=2;return {cap:cap,k:Math.min(12,k)};}
function pilTable(c){return pilTableC(c).k;}
function pilPire(a,b){return (a.cap&&!b.cap)||(a.cap===b.cap&&a.k>b.k);} /* a plus lourd à tenir que b */
function pilNivBas(){try{return prfNivT(PRF.T,PRF.c,'fast',PRF.plaf,PRF.modele);}catch(e){return 1;}} /* le niveau BASSE de la classe : le rendu d'aujourd'hui */
function pilHauteChoisie(){try{return pilChoisi()&&PRF.q==='haute';}catch(e){return false;}} /* HAUTE choisie par le joueur : le niveau plein reste (comme avant le pilote) ; le départ par conditions ne borne qu'AUTO */
function pilPlafEff(){const p=pilPlafond();return PILO.capN&&!PIL_NF?Math.min(p,PILO.capN):p;} /* le plafond, borné par le départ des conditions */
function pilDescend(){try{return PRF.n>pilNivDe(PILO.Kv,pilPlafEff());}catch(e){return false;}} /* un niveau de moins est dû (payé sous voile) */
function pilChoisi(){try{return SAVE.d.qChoisi===1;}catch(e){}try{const s=JSON.parse(localStorage.getItem('cashcarSave')||'null')||{};return s.qChoisi===1||(s.qChoisi===undefined&&(s.q==='net'||s.q==='haute'));}catch(e){return false;}}
function pilPlafond(){if(PIL_NF)return Math.min(PIL_NF,4); /* le niveau maximal : le réglage du joueur, AUTO quand il n'a jamais choisi */
  const q=pilChoisi()||!PIL_AUTO?PRF.q:'haute';return prfNivT(PRF.T,PRF.c,q,PRF.plaf,PRF.modele);}
function pilNivDe(K,N0){return K>=9&&N0>1&&!PIL_NF?N0-1:N0;}
function pilNivRegle(nTable){if(!pilOn()||PIL_GEL)return nTable;PILO.N0=pilPlafEff();return pilNivDe(PILO.K,PILO.N0);} /* (prfRegle) le joueur change BASSE ⇄ HAUTE : le plafond suit, le cran reste */
function pilMurPlancher(cle){const M=PILO.mur[cle];return M&&performance.now()<M.fin?M.k+1:0;}
/* (4e tour, 17/11 — SIMPLIFICATION décidée par l'intégrateur) N2 n'existe qu'en CONDITION LIBRE (débranché, sans économie, nominal, batterie ≥ 20 % : pilTableC.cap faux) ; partout
   ailleurs (AUTO) le niveau est N1 et la mémoire n'apprend que le cran K, jamais le niveau. En libre : N2 au cran appris pour N2 (K0 sans mémoire) ; sous MUR N2, N1 au cran appris pour N1.
   Plus de plafond « table + 4 » : un départ n'est jamais plus léger que le cran appris (séance, sinon mémoire n ≥ 2, sinon la table). */
function pilDepartCalc(c){const T=pilTableC(c);let pl=4,nb=1;try{pl=pilPlafond();nb=pilNivBas();}catch(e){}
  const auto=pl>nb&&!PIL_NF&&!pilHauteChoisie();let e=null;try{e=pilMemE(c);}catch(x){}
  const m2=!T.cap&&pilMur2(c,e,pl,nb),cap=auto&&(T.cap||m2)?nb:0,n2=(cap||pl)>nb; /* n2 : le niveau qui va VRAIMENT tourner est au-dessus de BASSE (AUTO en libre, ou HAUTE choisie) : on lit k2, que pilFinCourse écrit pour ce niveau (5e tour, M1) */
  let k=pilTableK(c),src=(k<T.k?'table K'+T.k+' bornée à la base K'+k:'table')+(cap?' · N'+nb+(m2?'':' (pas N'+pl+' : '+pilCondTx(c)+')'):'');
  const s=PILO.sess[c.cle];
  if(s!=null&&s.cap===cap){k=s.k;src='séance';}
  else if(e){const km=n2?e.k2:e.k,nm=n2?(e.n2|0):(e.n|0);if(km!=null&&nm>=(n2?1:2)){k=km;src='mémoire (N'+(n2?pl:nb)+' K'+km+', n '+nm+')';}}
  if(m2)src+=' · mur N2 ('+Math.ceil((e.mur2-Date.now())/864e5)+' j)';
  const f=pilMurPlancher(c.cle);if(k<f){k=f;src+=' + mur';}
  return {k:Math.max(0,Math.min(12,k)),cap:cap,src:src};}
function pilDepartK(c){if(PIL_KF>=0){PILO.capN=0;PILO.src='forcé (?pilote='+PIL_F+')';return PIL_KF;}
  const d=pilDepartCalc(c);PILO.src=d.src;PILO.capN=d.cap;return d.k;}
function pilCondDep(c){ /* (anti-pompage) une condition MEILLEURE que la référence ne compte qu'après 60 s stables : avant, le départ garde la référence */
  if(!PIL_HYST||!PILO.cle||c.cle===PILO.cle)return c;const r=Object.assign({},c,pilDeCle(PILO.cle));r.cle=PILO.cle;
  return pilPire(pilTableC(r),pilTableC(c))?r:c;}
function pilVoulu(K){ /* la recette du cran K sur le niveau COURANT (PRF.n) : toutes les clés d'imgRegle en un appel, le plancher QL, la polyphonie, le vent et l'émission */
  const P0=mobP0Niv(),o={dpr:mobPalCapJoueur(),halo:P0.halo,mips:P0.mips,ombre:P0.ombre,ciel:0,stries:null};let ql=0,poly=false,kv=1;
  if(K>=1)ql=1;if(K>=2)o.ciel=2;if(K>=3)poly=true;if(K>=4)o.mips=Math.max(1,P0.mips-1);if(K>=5)o.ombre=mobOmbreBas(P0.ombre,1);
  if(K>=6){o.ciel=4;o.stries=.75;kv=.75;}if(K>=7&&o.halo!=='off')o.halo='demi';
  if(K>=8){o.ombre=512;o.mips=Math.min(o.mips,2);o.ciel=8;o.stries=.5;kv=.5;ql=2;}
  if(K>=10){let bas=DPR_MIN;try{bas=qlBornes().bas;}catch(e){}o.dpr=Math.max(bas,o.dpr*(K>=11?.8:.9));}
  if(K>=12)o.halo='off';
  return {o:o,ql:ql,poly:poly,kv:kv};}
/* ===== S3 — JAMAIS PLUS LOURD QUE LA BASE AU CHAUD (3e tour, contrôle adverse) =====
   Hors « débranché + sans éco + nominal », à tout départ et à tout paiement, chaque levier (DPR et plafond, étages et taille du halo, ombre, ciel, plancher QL, traits, vent et émission) est
   BORNÉ par ce que ?sans=pilote poserait dans la même condition. La borne n'est pas une table de plus : elle est CALCULÉE par le gouverneur de base lui-même (mobPalTable, mobPalVoulu,
   gouverneur-paliers.js), lu au niveau de base (le réglage du joueur, BASSE en AUTO : prfNivT) et au palier de la condition (l'état thermique ; critical = gdxCrit()). À fair et plus, le niveau
   lui-même est borné par celui de la base (un niveau de plus allume des budgets statiques que la borne par levier ne voit pas). `?sans=pilborne` = sans (banc A-B). `dbgPilote().borne`. */
const PIL_BORNE=!/[?&]sans=[^&]*\bpilborne\b/.test(PIL_Q);
function pilLibre(c){return !c.B&&!c.E&&c.t<=0;}
function pilBorneOn(c){return PIL_BORNE&&PIL_KF<0&&!PIL_NF&&!!c&&!pilLibre(c);}
function pilNivBase(){try{return prfNivT(PRF.T,PRF.c,PRF.q,PRF.plaf,PRF.modele);}catch(e){return 1;}} /* le niveau que poserait ?sans=pilote (le réglage du joueur, sans AUTO) */
function pilBase(c){ /* ce que ?sans=pilote poserait dans la condition c : {n, t (palier), o (les clés d'imgRegle), ql (plancher QL), kv (vent, émission, traits)} */
  const nb=pilNivBase(),B=mobPalBase();let t=0;try{if(c.t>=0)t=c.t>=3?gdxCrit():c.t;}catch(e){}
  let P=null;try{P=t>0?mobPalTable()[t]:null;}catch(e){}
  const o=mobPalVoulu(t,nb)||Object.assign({dpr:mobCapNiv(nb)},mobP0Niv(nb));
  let ql=B.qlMin;if(P){let kMax=99;try{kMax=qlBornes().kMax;}catch(e){}ql=Math.min(kMax,Math.max(B.qlMin,P.ql));}
  return {n:nb,t:t,o:o,ql:ql,kv:(P&&P.k)||1};}
function pilHaloR(h){return h==='off'?0:h==='demi'?.5:h==='tout'?1:(+h||1);}
function pilBorne(V,b){const o=V.o,p=b.o;let n=0; /* chaque levier au plus léger des deux */
  if(p.dpr<o.dpr-.001){o.dpr=p.dpr;n++;}if(p.mips!=null&&p.mips<o.mips){o.mips=p.mips;n++;}if(p.ombre!=null&&p.ombre<o.ombre){o.ombre=p.ombre;n++;}
  if(pilHaloR(p.halo)<pilHaloR(o.halo)){o.halo=p.halo;n++;}if((p.ciel||0)>(o.ciel||0)){o.ciel=p.ciel;n++;}
  if(p.stries!=null&&(o.stries==null||p.stries<o.stries)){o.stries=p.stries;n++;}if(b.ql>V.ql){V.ql=b.ql;n++;}if(b.kv<V.kv){V.kv=b.kv;n++;}
  return n;}
/* (5e tour, S2) LE PLAFOND DES GELS : les gels à chaud ne sont pas de la charge de rendu (baisser la résolution n'a rien fait gagner au banc de puissance). La dette qu'ils posent (chaudGel)
   ne va jamais au-delà du cran de la TABLE de la condition, ni au-delà de ce que fait ?sans=pilote dans cette condition : jamais le halo coupé (K12), jamais un cran de résolution (K10-11) dont le DPR
   tomberait sous celui de la base. Au critical (table K10, borné à DPR 1,00 = la base) : K10, identique à la base.
   (7e tour, mineur 3 du contrôle) BORNÉ LEVIER PAR LEVIER, plus seulement le DPR : le cran descend tant qu'UN levier (DPR, étages ou taille du halo, ombre, ciel, plancher QL, traits, vent et
   émission) serait plus léger que la base. Serious branché + éco : la table dit K6 (traits et vent ×0,75), la base n'a ni l'un ni l'autre → K5, identique à la base. Le même plafond borne le
   cran de TABLE au départ et dans l'anticipation, à serious et critical (pilTableK) : sans vrais ratés, le pilote ne retire jamais plus d'image que ?sans=pilote à chaud. */
function pilPlusLeger(V,b){const o=V.o,p=b.o; /* vrai : un levier au moins de V retire plus d'image que la base b */
  return o.dpr<p.dpr-.01||(p.mips!=null&&o.mips<p.mips)||(p.ombre!=null&&o.ombre<p.ombre)||pilHaloR(o.halo)<pilHaloR(p.halo)||(o.ciel||0)>(p.ciel||0)||
    (o.stries!=null&&(p.stries==null||o.stries<p.stries-.001))||V.ql>b.ql||V.kv<b.kv-.001;}
function pilCapGel(c){const ck='B'+(c.B?1:0)+'E'+(c.E?1:0)+'T'+c.t+'|'+PRF.n+'|'+(c.bat>=0&&c.bat<20?1:0);if(PILO.capGK===ck)return PILO.capGV;let k=Math.min(11,pilTable(c));
  try{const b=pilBase(c);while(k>0&&pilPlusLeger(pilVoulu(k),b))k--;}catch(e){k=Math.min(k,9);}PILO.capGK=ck;PILO.capGV=k;return k;}
function pilTableK(c){const k=pilTable(c);if(!pilBorneOn(c)||c.t<2)return k;try{return Math.min(k,pilCapGel(c));}catch(e){return k;}} /* (7e tour) le cran de table, borné à la base à chaud */
function pilNivCible(K,c){let n=pilNivDe(K,pilPlafEff());if(c&&pilBorneOn(c)&&c.t>=1)n=Math.min(n,Math.max(1,pilNivBase()));return n;}
function pilNote(m){PILO.jr.push(Math.round(performance.now()/1000)+' s · '+m);if(PILO.jr.length>40)PILO.jr.shift();try{window.__ccNote('pilote',m);}catch(e){}}
function pilEnCourse(){try{return started&&running&&!gameOver&&!garageOn&&!paused;}catch(e){return false;}}
function pilOu(){if(PILO.mom)return PILO.mom;try{if(!started||garageOn)return 'menu';if(gameOver)return 'mort';if(paused)return 'pause';}catch(e){return 'menu';}
  return performance.now()-PILO.depT<2500?'depart':'course';}
function pilVerrouV(){ /* (étape 2) 0 : tout est permis · 1 : la résolution est tenue (portail) · 2 : en course, ni résolution ni cibles du halo */
  if(!PIL_ON||!PIL_VERROU||!pilOn())return 0;if(PILO.mom==='portail')return 1;if(PILO.mom==='course')return 2;if(PILO.mom)return 0;
  try{if(VHD.on)return 0;}catch(e){}const o=pilOu();return o==='course'||o==='depart'?2:0;} /* (corrections) les 2,5 premières secondes de course sont verrouillées aussi : le départ a déjà tout posé */
const PIL_VERROU=!/[?&]sans=[^&]*\bpilverrou\b/.test(PIL_Q);
function pilRetaille(neuve){if(!pilOn())return;const o=neuve?'rotation':pilOu();PILO.nRet[o]=(PILO.nRet[o]|0)+1;if(pilOn())pilNote('retaille · '+o+' · DPR '+(+curDPR).toFixed(2).replace('.',','));} /* appelé par applyDPR (init.js) */
function pilAppliquer(K,mom,raison,nForce){ /* LE SEUL ÉCRIVAIN : pose le cran K (et son niveau) en un seul imgRegle ; nForce : le niveau tel quel (la reprise de la seconde chance) */
  if(PIL_GEL)return;const K0=PILO.K,n0=PRF.n,voile=mom!=='course'&&mom!=='portail';PILO.mom=mom;
  try{
    const cB=PILO.c||pilCond();
    if(voile){PILO.N0=pilPlafEff();const nv=nForce||pilNivCible(K,cB);if(nv!==PRF.n)prfPoseNiv(nv,true,'pilote : N'+PRF.n+' → N'+nv+' ('+mom+')');}
    else K=K0>=9?K0:Math.min(K,8); /* en course et au portail : jamais le niveau ni la résolution (crans 9-12) */
    const V=pilVoulu(K),Bb=mobPalBase();
    if(pilBorneOn(cB)){const b=pilBase(cB),nB=pilBorne(V,b);PILO.borne={cle:cB.cle,mom:mom,K:K,n:PRF.n,base:{n:b.n,palier:b.t,o:b.o,ql:b.ql,kv:b.kv},leviers:nB};if(nB)PILO.nBorne++;}else PILO.borne=null;
    mobPalEcrit('ventK',Bb.ventK*V.kv);mobPalEcrit('emiK',Bb.emiK*V.kv);mobPalEcrit('qlMin',Math.max(Bb.qlMin,V.ql));
    const kq=Math.max(prfDepart(),V.ql);if(VHD.on)VHD.k0=kq;else QL.k=kq;
    PILO.K=K;if(MOB_POLY)window.__ccPoly.on=V.poly&&pilEnCourse();
    window.imgRegle(V.o);
    if(voile&&(PILO.dDpr||PILO.dBloom)){PILO.dDpr=PILO.dBloom=0;qlPose(QL.k);}
    if(voile){pilPrechauffe();if(!PIV_ON||mom!=='urgence')PILO.lpOff=pilLoupeOff(K,cB);} /* (LA VOITURE EN DERNIER) cran 13 ou critical ; jamais à l'urgence (la toile visible ne change pas en course) */
  }catch(e){try{window.__ccNote('pilote','erreur '+String(e&&e.message).slice(0,120));}catch(x){}}
  PILO.mom='';
  if(K!==K0||PRF.n!==n0){PILO.chg++;const c=PILO.c||pilCond(),v=PILO.vraiT&&performance.now()-PILO.vraiT<15000?' · vrai '+PILO.vrai.toFixed(1).replace('.',',')+' ms':'',r=pilRates(10);
    pilNote('K'+K0+'→'+K+' ('+PIL_NOM[K]+') · N'+PRF.n+' · '+(raison||'?')+(r?' · ratés '+(r.r*100).toFixed(1).replace('.',',')+' %':'')+v+' / tic '+PILO.per.toFixed(1).replace('.',',')+' · '+pilCondTx(c)+(function(){try{return LVL.cur?' · map '+LVL.cur.id:'';}catch(e){return '';}})()+' · '+mom);}}
function pilRates(s){const F=PILO.fen,n=Math.min(s,F.length);if(!n)return null;let i=0,r=0;for(let j=F.length-n;j<F.length;j++){i+=F[j][0];r+=F[j][1];}return i?{i:i,r:r/i}:null;}
function pilCons(now){let r=0;try{r=loop._rebuildT||0;}catch(e){}return (PILO.consEn&&now-PILO.consDeb<20000)||now-Math.max(PILO.consT,r)<1500;}
function pilConstr(on){if(!pilOn())return;const now=performance.now();if(on){PILO.consEn=true;PILO.consDeb=now;}else PILO.consEn=false;PILO.consT=now;} /* (5e tour, M2) newTrackG : « construction en cours » du DÉBUT (pilConstr(1)) à la FIN (pilConstr(0)) — le générateur est mené en tranches sur plusieurs images ; 20 s au plus si la fin ne vient jamais */ /* (M2) 1,5 s après une VRAIE construction (piste refaite : consT ; reconstruction : loop._rebuildT) : les accrocs sont de la construction ; (4e tour, 4) un portail sans construction (newTrack sauté) n'excuse plus rien */
function pilImg(now){ /* (cadSaute) chaque image CALCULÉE : l'intervalle depuis la précédente, contre la période visée */
  if(!pilOn())return;const d=now-PILO.lastImg;PILO.lastImg=now;if(PILO.urg)pilUrgVoit(now);if(!PILO.crs)return;
  const cons=pilCons(now);
  if(cons){if(d>PIL_GEL_MS&&d>=1.5*PILO.per){PILO.nCons++;PILO.consC++;if(d>PILO.consMax)PILO.consMax=d;}return;} /* (5e tour, M2) pendant une construction (du début à la fin, + 1,5 s) : ni gels, ni ratés, ni images comptées */
  if(d>400){if(now-PILO.depT>2500){PILO.gels++;PILO.gelsC++;PILO.gS++;if(d>PILO.gelMax)PILO.gelMax=d;}return;}PILO.nI++;
  if(d>=1.5*PILO.per){ /* (GELS ≠ CHARGE) le coût vrai de l'image d'avant (CAD.w : boucle + envoi du rendu) contre le tic d'écran */
    if(!PIL_GELS||PILO.wDer>=PIL_WC*pilTic())PILO.nR++;else if(d>PIL_GEL_MS){PILO.gels++;PILO.gelsC++;PILO.gS++;if(d>PILO.gelMax)PILO.gelMax=d;}else{PILO.nT++;PILO.gS++;}}}
function pilCout(w){if(pilOn())PILO.wDer=w;} /* (cadFin) le travail vrai de l'image calculée qui s'achève */
function pilRaf(d){if(PILO.crs&&d>0&&d<400&&pilOn())PILO.h[Math.min(15,(d/8)|0)]++;} /* (cadSaute) chaque image d'ÉCRAN : l'histogramme en cases de 8 ms */
function pilMoment(m){ /* les moments invisibles : 'depart' (resetGame, start), 'portail' (portailPasse) ; 'mort', 'pause', 'menu' sont vus par pilTick */
  if(!pilOn()||PIL_GEL)return;const now=performance.now();
  if(m==='raz'){PILO.raz=true;return;} /* (M1) resetGame commence : la piste qu'il refait n'est pas un moment */
  if(m==='depart'){PILO.raz=false;PILO.jeton=false;if(now-PILO.depT<1500){PILO.depIgn++;return;} /* (corrections) resetGame puis start : un seul départ */
    {let vu=false;for(const k9 in PILO.seg){vu=true;break;} /* (7e tour, mineur 4 du contrôle) une course quittée SANS fin (la mort n'a pas payé : offre de seconde chance ou machine encore ouvertes, puis on rejoue) : sa fin de course d'abord — l'échec, le cumul des courses courtes, la mémoire — puis la séance garde le cran tenu */
      if(vu){pilFinCourse('départ sans fin de course');if(PILO.cle&&!PIL_FIGE&&PIL_KF<0)PILO.sess[PILO.cle]={k:PILO.Kv,cap:PILO.capN};}}
    PILO.nDep++;PILO.depT=now;PILO.h.fill(0);PILO.fen.length=0;PILO.rw=[];PILO.rgSuite=0;PILO.nI=PILO.nR=PILO.nT=0;PILO.bleuS=0;PILO.bleuK='';PILO.monte=null;PILO.rgT0=0;PILO.mort=false;PILO.mortP=false;PILO.avMort=null;PILO.seg={};
    PILO.urg=null;PILO.urgFait=false;PILO.urgD=false;PILO.gels=PILO.gelsC=PILO.gelMax=0;
    PILO.vraiT=PILO.vraiPT=0;if(PILO.sim)PILO.sim.vsT=0; /* (6e tour, mineur 4) la sonde confirmée n'apparie que des échantillons de CETTE course */
    if(PIL_FIGE&&PILO.fait)return;const c0=pilCond(),c=pilCondDep(c0);PILO.c=c0;if(c===c0){PILO.cle=c.cle;PILO.cand='';}PILO.tPrev=c0.t;
    const k=pilDepartK(c),n0=PRF.n;PILO.Kv=k;PILO.fait=true;pilAppliquer(k,'depart','départ');
    pilNote('départ N'+PRF.n+' K'+PILO.K+' · clé '+(PRF.modele||'?')+'|'+c.cle+(c!==c0?' (hystérésis : '+c0.cle+' pas encore 60 s)':'')+' · source '+PILO.src+' · '+pilCondTx(c0)+' · plafond '+(PIL_NF?'forcé N'+PIL_NF:pilChoisi()?(PRF.q==='haute'?'HAUTE':'BASSE'):PIL_AUTO?'AUTO':'BASSE (sans pilauto)')+(n0!==PRF.n?' · N'+n0+' → N'+PRF.n:''));return;}
  if(m==='portail'){PILO.jeton=true;PILO.jetonT=now;PILO.portT=now; /* (4e tour, 4) le portail seul n'ouvre plus la fenêtre « construction » : seule une vraie construction (la piste, loop._rebuildT) l'ouvre */
   PILO.nPort++;pilPaie('portail');return;} /* (M1, DOUBLE PORTAIL) portailPasse paie et pose un JETON de passage */
  if(m==='piste'){PILO.consT=now; /* (M1) la fin de newTrackG : le jeton du portail est consommé ; sans jeton, hors départ (dbgSaut, événements), c'est un moment à lui seul */
    if(PILO.jeton&&now-PILO.jetonT<5000){PILO.jeton=false;PILO.portIgn++;return;}PILO.jeton=false; /* (4e tour, 4) un jeton de plus de 5 s a expiré */
    if(PILO.raz||now-PILO.depT<2500){PILO.razIgn++;return;} /* la piste refaite par resetGame : rien n'est payé */
    PILO.portT=now;PILO.nPort++;pilNote('piste refaite sans portail : un moment');pilPaie('portail');return;}
  if(m==='reprise'){ /* (seconde chance, chanceRepart, sous le volet) la course CONTINUE : le rendu d'avant la mort, au niveau près */
    const A=PILO.avMort;PILO.mort=false;PILO.crs=false;PILO.portT=now;
    if(PILO.mortP&&A&&(A.K!==PILO.K||A.N!==PRF.n)){PILO.Kv=Math.max(PILO.Kv,A.K);pilAppliquer(A.K,'reprise','reprise : le rendu de la course',A.N);}
    else pilNote('reprise · rendu inchangé · N'+PRF.n+' K'+PILO.K);
    PILO.mortP=false;PILO.avMort=null;}}
function pilReprisePossible(now){ /* l'écran de mort peut encore rendre la course : l'offre, la réanimation automatique, la pub, le volet, la machine à sous (le cœur) */
  try{if(CHANCE.offre||CHANCE.auto||CHANCE.pub)return true;}catch(e){}try{if(ecranWipe._on)return true;}catch(e){}try{if(SPIN.ouvert){PILO.spinVu=true;return true;}}catch(e){}
  if(now-PILO.mortT<1500)return true; /* (M4) l'offre et la machine s'ouvrent après coup : 1,5 s au moins */
  try{if(SPIN.on&&(SAVE.d.spinJ|0)>0&&!PILO.spinVu&&now-PILO.mortT<20000)return true;}catch(e){} /* (M4) un jeton : la machine viendra (le cœur peut rendre la course) ; 20 s au plus si elle ne vient jamais */
  return false;}
function pilRepriseQui(){const q=[];try{if(CHANCE.offre)q.push('offre');if(CHANCE.auto)q.push('auto');if(CHANCE.pub)q.push('pub');}catch(e){}try{if(ecranWipe._on)q.push('volet');}catch(e){}try{if(SPIN.ouvert)q.push('machine');if(SPIN.on&&(SAVE.d.spinJ|0)>0)q.push('jeton');}catch(e){}return q.join(',');} /* (8e tour, banc) ce qui retient la mort (dbgPilote().reprise) */
function pilUrgVoit(now){ /* (URGENCE) à chaque image calculée : le moment le moins visible — en l'air, nitro ; sinon au bout de 3 s */
  const U=PILO.urg;if(!U)return;if(!pilEnCourse()){if(!started||gameOver)PILO.urg=null;return;}let o='';
  try{if(mode!=='drive')o='en l\'air';else if(nitroOn)o='nitro';}catch(e){}if(!o&&now-U.t>=3000)o='tout de suite (3 s)';if(!o)return;
  if(U.deco){PILO.urg=null;PILO.urgD=true;PILO.nUrgD=(PILO.nUrgD|0)+1;PILO.rgT0=now;PILO.orT0=now;PILO.Kv=Math.max(PILO.Kv,8); /* (LA VOITURE EN DERNIER) 1re urgence : le DÉCOR (K7-K8) posé comme au portail, résolution et loupe tenues ; la résolution attend la 2e */
    pilAppliquer(8,'portail','urgence décor · '+U.pq+' · '+o);return;}
  PILO.urg=null;PILO.urgFait=true;PILO.nUrg++;try{const g9=PILO.seg[(PILO.c||pilCond()).cle];if(g9)g9.urg=1;}catch(e){}const eff=pilPlafEff(),dsc=pilDescend();
  const k=Math.min(12,dsc?Math.max(PILO.Kv,Math.min(PILO.K,8)):Math.max(PILO.Kv,PILO.K+1,eff>1?9:10));PILO.Kv=Math.max(PILO.Kv,k);
  pilAppliquer(k,'urgence','urgence · '+U.pq+' · '+o);}
function pilPaie(m){ /* paie la dette au moment m (ou la rend) */
  if(PIL_FIGE||PIL_KF>=0)return;let k=PILO.Kv;const K=PILO.K;
  if(m==='portail'){if(K>=9)return;k=Math.min(k,8);if(k<K&&pilDescend())k=K;} /* un niveau de moins est dû : le portail n'alourdit rien sur le niveau d'avant */
  if(k<K)k=Math.max(k,K-1); /* vers le mieux : un cran par moment (sauf départ et menu) */
  if(m==='menu')k=PILO.Kv;
  if(k<K&&PILO.geleux){const cg=Math.min(K,pilCapGel(PILO.c||pilCond()));if(k<cg){k=cg;if(!PILO.glNote){PILO.glNote=1;pilNote('remontée '+(cg<K?'bornée au cran de table K'+cg:'refusée')+' · gels hors boucle sur la fenêtre');}}} /* (S2) les gels ne sont pas une marge : pas de remontée SOUS le cran de table ; (5e tour) jusqu'à lui, oui */
  const nv=pilNivCible(k,PILO.c||pilCond()),voile=m!=='portail';
  let lp9=false;if(PIV_ON&&voile)try{lp9=pilLoupeOff(k,PILO.c||pilCond())!==PILO.lpOff;}catch(e){} /* (LA VOITURE EN DERNIER) la loupe reposée (ou retirée) au moment sous voile, même si le cran ne bouge pas */
  if(k!==K||(voile&&nv!==PRF.n)||(voile&&(PILO.dDpr||PILO.dBloom))||lp9){const monte=k<K;pilAppliquer(k,m,(monte?'mieux':'dette')+' payée au '+m+(PILO.zone?' · '+PILO.zone:''));
    if(monte&&m!=='menu')PILO.monte={k:k,t:performance.now(),s:0};}
  try{PILO.sess[PILO.cle||(PILO.c||pilCond()).cle]={k:PILO.Kv,cap:PILO.capN};}catch(e){}}
function pilTick(now,enC){ /* une fois par seconde (mobPalTick) : LE PILOTE */
  if(PIL_GEL&&!PILO.gelVu){PILO.gelVu=1;pilNote('gel : le pilote mesure, rien n\'est posé (N'+PRF.n+')');}
  const c=pilCond();PILO.c=c;PILO.per=pilPer();
  if(MOB_POLY)window.__ccPoly.on=PILO.K>=3&&enC;
  let menu=false,mort=false;try{menu=!started||garageOn;mort=!menu&&gameOver;}catch(e){}
  /* la condition change : l'anticipation (dette) — même hors course. (corrections, ANTI-POMPAGE) le PIRE compte tout de suite ; le MIEUX seulement après 60 s stables (fair ↔ serious qui oscille) */
  if(c.cle!==PILO.cle){const oc=PILO.cle?Object.assign({},c,pilDeCle(PILO.cle)):null,tn=pilTableC(c),to=oc?pilTableC(oc):tn,pire=pilPire(tn,to),mieux=pilPire(to,tn);let va=true;
    if(mieux&&PIL_HYST&&PILO.cle){if(PILO.cand!==c.cle){PILO.cand=c.cle;PILO.candT=now;pilNote('hystérésis · '+PILO.cle+' → '+c.cle+' : meilleur, attendu 60 s stables');}va=now-PILO.candT>=60000;}
    if(va){if(PIL_ANT&&!PIL_FIGE&&PIL_KF<0&&!PIL_GEL&&(pire||mieux))pilAnticipe(c,tn,to,oc);PILO.cle=c.cle;PILO.cand='';PILO.tPrev=c.t;}}
  else PILO.cand='';
  if(PIL_GEL)return;
  if(menu){PILO.crs=false;if(!PILO.menu){let vu=false;for(const k9 in PILO.seg){vu=true;break;}if(vu||(PILO.mort&&!PILO.mortP)){if(vu)pilFinCourse('retour menu');if(PILO.cle&&!PIL_FIGE&&PIL_KF<0)PILO.sess[PILO.cle]={k:PILO.Kv,cap:PILO.capN};}PILO.mort=false;PILO.mortP=false;} /* (4e tour) une course quittée pour le menu sans que la mort ait payé (offre encore ouverte, retour depuis la pause) : la séance garde le cran tenu */if(!PILO.menu||PILO.Kv!==PILO.K){PILO.menu=true;const k=pilDepartK(pilCondDep(c));PILO.Kv=k;if(!(PIL_FIGE&&PILO.fait))pilPaie('menu');}return;}
  PILO.menu=false;
  if(mort){PILO.crs=false;PILO.urg=null;if(!PILO.mort){PILO.mort=true;PILO.mortP=false;PILO.mortT=now;PILO.spinVu=false;PILO.jeton=false;PILO.avMort={K:PILO.K,N:PRF.n};pilNoteGels(now,true);
      /* (8e tour, mineur 3 du contrôle du 7e) LA MÉMOIRE S'ÉCRIT À LA MORT MÊME, pas quand la mort « paie ». La 1re course d'un chargement n'écrivait rien avant le rechargement (pagehide) :
         sa mort restait retenue (pilReprisePossible : offre de seconde chance, jeton ou machine à sous, jusqu'à 20 s) et iOS peut tuer l'app avant. Le constat (échec N2, courses courtes, cran tenu)
         est fait tout de suite ; seul le PAIEMENT (le rendu qui change) attend la mort définitive. Une reprise continue la course dans des segments neufs */
      {let vu=false;for(const k9 in PILO.seg){vu=true;break;}if(vu)pilFinCourse('mort');}}
    /* (corrections, SECONDE CHANCE) tant que la course peut reprendre (offre, réanimation, pub, volet, machine à sous), rien ne change : la mort définitive paie ; une reprise après coup rend le rendu d'avant (pilMoment('reprise')) */
    if(!PILO.mortP&&!pilReprisePossible(now)){PILO.mortP=true;{let vu=false;for(const k9 in PILO.seg){vu=true;break;}if(vu)pilFinCourse('mort');}pilPaie('mort');}return;}
  if(!enC){PILO.crs=false;try{if(paused){if(!PILO.pauseT)PILO.pauseT=now;else if(now-PILO.pauseT>1000&&!PILO.pauseP){PILO.pauseP=1;pilPaie('pause');}}}catch(e){}return;}
  PILO.pauseT=0;PILO.pauseP=0;if(PILO.jeton&&now-PILO.jetonT>=5000){PILO.jeton=false;PILO.jetonExp=(PILO.jetonExp|0)+1;} /* (4e tour, 4) aucun jeton orphelin */
  if(!PILO.crs){PILO.crs=true;PILO.nI=PILO.nR=0;PILO.rgSuite=0;PILO.rw=[];return;}
  /* la seconde de course */
  const calme=!pilCons(now)&&now-PILO.portT>1000&&now-PILO.depT>2500,S=PILO.sim; /* (5e tour, M2) la construction en cours et 1,5 s après */
  let nI=PILO.nI,nR=PILO.nR,gS=PILO.gS;PILO.nI=PILO.nR=PILO.gS=0;const ni9=S?+(S.ni||window.__ccSimNi||0):0;if(S&&S.rates!=null){nI=ni9||Math.max(nI,30);nR=Math.round(nI*S.rates);} /* (7e tour, banc) ni : les images de la seconde simulées (60 = un écran à 60 i/s) ; (8e tour) window.__ccSimNi = le ni par défaut du banc (30, le téléphone) */if(S&&S.gels!=null)gS=+S.gels;
  if(S&&S.motif&&S.motif.length){nI=ni9||Math.max(nI,30);nR=+S.motif[(S.mi|0)%S.motif.length]|0;S.mi=(S.mi|0)+1;} /* (8e tour, banc) motif : les images ratées de chaque seconde, à la seconde près ([1,0] = une image une seconde sur deux) */
  if(S&&S.nr1){if(S.rates==null&&!(S.motif&&S.motif.length))nI=ni9||Math.max(nI,30);nR+=+S.nr1;S.nr1=0;} /* (8e tour, banc) nr1 : n images ratées dans la seconde qui vient, une seule fois */
  if(calme){PILO.fen.push([nI,nR,gS]);if(PILO.fen.length>10)PILO.fen.shift();}
  /* (5e tour, S1) les VRAIS ratés de CETTE seconde (le compteur de la seconde, pas la fenêtre glissante, pas la sonde) : > 8 % = une seconde ROUGE vraie ; la seconde ratée (rS) : voir la fenêtre de 3 s plus bas (8e tour).
     rgSuite = secondes ROUGE vraies DE SUITE (une seconde hors calme, hors course ou propre remet à 0) : seul ce compteur pose l'échec N2 par ROUGE (≥ 3) */
  /* (8e tour, S1 du contrôle du 7e) LA SECONDE RATÉE SUR UNE FENÊTRE GLISSANTE DE 3 S. Le seuil du 7e tour (3 images dans la seconde même) rendait invisibles à 30 i/s les vrais ratés tenus
     de 3 à 8 % (1 ou 2 images par seconde) : plus aucun mur N2. Une seconde est maintenant « ratée » (rS) si elle a AU MOINS 1 image ratée ET si les 3 dernières secondes calmes (elle comprise)
     en ont AU MOINS 3 ; une seconde ROUGE (> 8 %) l'est toujours. Ratés tenus à 1 image/s (3,3 % à 30 i/s, 1,7 % à 60) : chaque seconde est ratée. Une image isolée (1 ou 2 sur 3 s) : jamais.
     Un ACCROC = une suite de secondes ratées ; il ne se ferme qu'une fois la fenêtre redescendue sous 3 images (une image qui suit un pic de 1-2 s reste dans SON accroc, elle n'en ouvre pas un autre) */
  const rw=PILO.rw||(PILO.rw=[]);if(calme){rw.push(nR);if(rw.length>3)rw.shift();}let r3s=0;for(const x of rw)r3s+=x;
  const rS8=calme&&nI>=10&&nR/nI>.08,rS2=rS8||(calme&&nI>=10&&nR>=1&&r3s>=3);PILO.rgSuite=rS8?(PILO.rgSuite|0)+1:0;
  {let gi=0,gg=0;for(const f of PILO.fen){gi+=f[0];gg+=f[2]|0;}PILO.geleux=gg>=2||(gi>0&&gg>.005*gi);PILO.glS=PILO.geleux?PILO.glS+1:0;if(!PILO.geleux)PILO.glNote=0;} /* (S2) gels + trous > 0,5 % des images de la fenêtre, ou ≥ 2 gels sur 10 s */
  const g=PILO.seg[c.cle]||(PILO.seg[c.cle]={s:0,kv:0,ro:0,kmax:0,N:0,n:0,rg:0,gl:0,nMax:0,urg:0,k0:PILO.K});g.s++;g.kv=PILO.Kv;g.N=pilPlafEff();g.n=PRF.n;if(PRF.n>g.nMax)g.nMax=PRF.n;if(PILO.K>g.kmax)g.kmax=PILO.K;if(PILO.geleux)g.gl++;if(rS2){g.rS=(g.rS|0)+1;if(!g.rsRun)g.ep=(g.ep|0)+1;g.rsRun=(g.rsRun|0)+1;if(g.rsRun>(g.rsMax|0))g.rsMax=g.rsRun;}else if(calme&&r3s<3)g.rsRun=0;if(PILO.rgSuite>(g.rgMax|0))g.rgMax=PILO.rgSuite; /* (6e tour ; fenêtre du 8e tour) rS = secondes ratées (≥ 1 image ET ≥ 3 sur les 3 dernières secondes, ou > 8 %) ; un ACCROC = une suite de telles secondes (ep = le nombre d'accrocs, rsMax = le plus long) */ /* (étape 4) le segment de cette condition ; N = le niveau de base, ro = secondes ORANGE ou ROUGE, kmax = le cran le plus lourd tenu */
  pilNoteGels(now,false);
  /* (6e tour, banc fidèle) la sonde simulée échantillonne comme la vraie : un échantillon toutes les 10 s (et tout de suite quand le banc change la valeur) ; `vrai1` = UN échantillon isolé, une seule fois ;
     pendant la simulation, les vrais échantillons de la sonde du banc sont ignorés (ils ne sont pas ceux du téléphone) */
  if(S&&(S.vrai!=null||S.vrai1!=null)){if(S.vrai!=null){QLR.vrai=+S.vrai;QLR.vraiT=now;}PILO.vT=QLR.vraiT;
    if(S.vrai1!=null){pilVraiPrend(+S.vrai1,now);S.vrai1=null;S.vsT=now;S.vN=0;}else if(S.vN||!S.vsT||now-S.vsT>=10000){pilVraiPrend(+S.vrai,now);S.vsT=now;S.vN=0;}}
  else if(QLR.vraiT&&QLR.vraiT!==PILO.vT&&now-QLR.vraiT<12000){PILO.vT=QLR.vraiT;pilVraiPrend(QLR.vrai,now);}
  if(PIL_SONDE&&now-PILO.sondeT>10000&&QLR.sN<=0&&!(QLR.S&&QLR.S.pend>0)){PILO.sondeT=now;try{qlSondeArme();}catch(e){}}
  if(PIL_FIGE||PIL_KF>=0||!calme){PILO.zone='';return;}
  const T=PILO.per,b=(PIL_B||(PRF.haute()&&pilChoisi()?.85:.75))-(c.B&&c.E?.05:0),r3=pilRates(3),r10=pilRates(10),vOk=now-PILO.vraiT<15000&&PILO.vraiT,deux=vOk&&PILO.vraiPT&&PILO.vraiT-PILO.vraiPT<25000;
  /* (5e tour, S1) la sonde n'alourdit que CONFIRMÉE : le plus bas des deux derniers échantillons (un seul échantillon haut — une explosion, un GC — ne tient plus ROUGE 10 s) ; BLEU lit le plus haut */
  const v=deux?Math.min(PILO.vrai,PILO.vraiP):null,vB=vOk?(deux?Math.max(PILO.vrai,PILO.vraiP):PILO.vrai):null,capG=pilCapGel(c);
  const rouge=(r3&&r3.i>=20&&r3.r>.08)||(v!=null&&v>T),chaudGel=!rouge&&PILO.geleux&&PILO.glS>=10&&c.t>=2&&PILO.Kv<capG; /* (S2) des gels soutenus ET serious ou plus : une dette ORANGE, (5e tour) PLAFONNÉE au cran de table de la condition (pilCapGel) */
  const orV=!rouge&&((r10&&r10.i>=60&&r10.r>=.02)||(v!=null&&v>(b+.05)*T)),orange=orV||chaudGel; /* (4e tour) orV = l'ORANGE des VRAIS ratés ou du vrai coût ; chaudGel = une dette seulement */
  const bleu=!rouge&&!orange&&r10&&r10.i>=60&&r10.r<.005&&vB!=null&&vB<.55*T&&(!PILO.geleux||PILO.K>capG); /* (S2) jamais BLEU sur des gels… (5e tour) sauf pour revenir au cran de table : des gels sans ratés ni coût ne sont pas de la charge */
  PILO.zone=rouge?'ROUGE':orange?'ORANGE':bleu?'BLEU':'VERT';PILO.chaudGel=chaudGel;
  if(PILO.bleuK!==c.cle+'|'+PRF.n){PILO.bleuK=c.cle+'|'+PRF.n;PILO.bleuS=PILO.bleuC[PILO.bleuK]|0;} /* (4e tour) la marge BLEU se cumule d'une course à l'autre dans la même séance, condition et niveau */
  if(rouge||orange)g.ro++;if(rouge)g.rg++;
  pilVerifEchec(false,'');
  if(rouge||orV){if(!PILO.orT0)PILO.orT0=now;}else PILO.orT0=0; /* (4e tour, 1) les gels au chaud n'arment JAMAIS l'urgence : ni orT0, ni cr ; ils restent une dette payée au moment invisible */
  /* (corrections, URGENCE) ROUGE tenu 8 s, crans [C] dépensés ; ou critical en course avec une dette de résolution (niveau ou cran ≥ 9 dû) : la résolution se paie EN COURSE, une fois */
  if(rouge&&PILO.K>=6){if(!PILO.rgT0)PILO.rgT0=now;}else PILO.rgT0=0; /* le ROUGE compté depuis que les crans [C] sont dépensés */
  if(PIL_URG&&!PILO.urg&&!PILO.urgFait&&PILO.K<12){const r8=rouge&&PILO.K>=6&&PILO.rgT0&&now-PILO.rgT0>=8000,cr=c.t>=3&&PILO.K<9&&(PILO.Kv>=9||pilDescend()||PILO.dDpr)&&PILO.orT0&&now-PILO.orT0>=5000; /* (M3) au critical, l'urgence exige ORANGE (ou ROUGE) tenu 5 s : sans ratés, la dette attend le portail ou la mort */
    if(r8||cr){PILO.urg={t:now,deco:PIV_ON&&PILO.K<8&&!PILO.urgD,pq:r8?'ROUGE tenu '+Math.round((now-PILO.rgT0)/1000)+' s à K'+PILO.K+' (crans [C] dépensés)':'critical en course, dette de résolution (visé K'+PILO.Kv+(pilDescend()?', niveau dû':'')+')'};pilNote('urgence armée'+(PILO.urg.deco?' (décor d\'abord)':'')+' · '+PILO.urg.pq);}}
  if(PILO.monte&&now-PILO.monte.t<30000&&(rouge||orange)){const M=PILO.mur[c.cle],d=M&&now<M.fin+600000?Math.min(960000,M.d*2):120000;
    PILO.mur[c.cle]={k:PILO.monte.k,fin:now+d,d:d};PILO.Kv=Math.max(PILO.Kv,PILO.monte.k+1);pilNote('mur · K'+PILO.monte.k+' rate dans les 30 s ('+PILO.zone+') · '+Math.round(d/60000)+' min · '+c.cle);PILO.monte=null;}
  if(rouge){PILO.rougeT=now;PILO.bleuS=0;PILO.bleuC[PILO.bleuK]=0;
    if(PILO.K<6){if(now-PILO.cT>=3000){PILO.cT=now;PILO.Kv=Math.max(PILO.Kv,PILO.K+1);pilAppliquer(PILO.K+1,'course','rouge');}}
    else if(now-PILO.oT>=10000&&PILO.Kv<Math.min(pilKPlaf(PILO.K),PILO.K+3)){PILO.oT=now;PILO.Kv=Math.max(PILO.Kv,PILO.K)+1;pilNote('dette · rouge, crans [C] épuisés · visé K'+PILO.Kv);}}
  else if(orange){PILO.bleuS=0;PILO.bleuC[PILO.bleuK]=0;if(now-PILO.oT>=10000&&PILO.Kv<Math.min(pilKPlaf(PILO.K),PILO.K+3)){PILO.oT=now;PILO.Kv=Math.max(PILO.Kv,PILO.K)+1;pilNote('dette · orange'+(chaudGel?' (gels au chaud : '+PILO.glS+' s, th '+c.t+')':'')+' · visé K'+PILO.Kv+(r10?' · ratés '+(r10.r*100).toFixed(1).replace('.',',')+' %':'')+(v!=null?' · vrai '+v.toFixed(1).replace('.',','):'')+' / '+T.toFixed(1).replace('.',','));}}
  else if(bleu){if(PILO.bleuT<0||c.t<PILO.bleuT)PILO.bleuT=c.t;if(c.t>PILO.bleuT){PILO.bleuS=0;PILO.bleuT=c.t;}PILO.bleuS++;PILO.bleuC[PILO.bleuK]=PILO.bleuS;
    if(PILO.bleuS>=60&&now-PILO.rougeT>120000&&PILO.Kv>=PILO.K&&PILO.K>0&&pilMurPlancher(c.cle)<PILO.K&&!pilDescend()){
      const k=PILO.K-1,d0=pilVoulu(PILO.K).o.dpr,d1=pilVoulu(k).o.dpr,p=vB*Math.pow(d1/Math.max(.1,d0),2)*(k===8&&PILO.K===9?1.6:1);
      PILO.bleuS=0;PILO.bleuC[PILO.bleuK]=0;if(p<.7*T){PILO.Kv=k;pilNote('bleu · 60 s de marge · visé K'+k+' (prédit '+p.toFixed(1).replace('.',',')+' / '+T.toFixed(1).replace('.',',')+')');}}}}
function pilVraiPrend(v,now){PILO.vraiP=PILO.vrai;PILO.vraiPT=PILO.vraiT;PILO.vrai=v;PILO.vraiT=now;PILO.nVrai=(PILO.nVrai|0)+1;} /* un échantillon de la sonde ; la paire (vrai, vraiP) confirme */
function pilAnticipe(c,tn,to,oc){ /* la différence de table posée en dette (ou rendue) ; un changement de départ (niveau BASSE ⇄ plein) change la base du cran */
  const s=PILO.sess[c.cle],pire=pilPire(tn,to);let pl=4,nb=1;try{pl=pilPlafond();nb=pilNivBas();}catch(e){}
  let kv=PILO.Kv,cap=PILO.capN;
  if(tn.cap!==to.cap){const d=pilDepartCalc(c);cap=d.cap;kv=d.k;} /* (4e tour) libre ⇄ pas libre : le départ de la nouvelle condition (N2 seulement en libre) */
  else{kv=PILO.Kv+(pilTableK(c)-(oc?pilTableK(oc):to.k));if(pire&&s!=null&&s.cap===cap)kv=Math.max(kv,s.k);} /* (7e tour) la différence des crans de table BORNÉS à la base (pilTableK) */
  kv=Math.max(pilMurPlancher(c.cle),Math.min(12,Math.max(0,kv)));
  if(kv!==PILO.Kv||cap!==PILO.capN)pilNote('anticipation · '+PILO.cle+' → '+c.cle+' · visé K'+PILO.Kv+' → K'+kv+(cap!==PILO.capN?' · départ '+(cap?'N'+cap:'plein N'+pl):''));
  PILO.Kv=kv;PILO.capN=cap;}
function pilNoteGels(now,fin){ /* (GELS ≠ CHARGE) les trous hors boucle, au journal toutes les 10 s au plus (et à la mort) : aucun cran ne bouge pour eux */
  if((!PILO.gelsC&&!PILO.consC)||(!fin&&now-PILO.gelNT<10000))return;PILO.gelNT=now;
  if(PILO.consC){pilNote('construction · '+PILO.consC+' accroc'+(PILO.consC>1?'s':'')+' après un portail ou une reconstruction (max '+Math.round(PILO.consMax)+' ms) · pas un gel · '+PILO.nCons+' dans la séance');PILO.consC=0;PILO.consMax=0;}
  if(!PILO.gelsC)return;
  pilNote('gel · '+PILO.gelsC+' trou'+(PILO.gelsC>1?'s':'')+' hors boucle (max '+Math.round(PILO.gelMax)+' ms, boucle '+PILO.wDer.toFixed(1).replace('.',',')+' ms) · K'+PILO.K+' inchangé · '+PILO.gels+' dans la course');PILO.gelsC=0;}
function pilDeCle(cle){const m=/^B(\d)E(\d)T(-?\d)$/.exec(cle||'');return m?{B:m[1]==='1',E:m[2]==='1',t:+m[3]}:{};}
window.dbgPilote=function(o){if(o==='oubli'){try{pilOubli();}catch(e){}}
  const c=pilCond();return {on:pilOn(),pv:PIV_ON,lpOff:PILO.lpOff,loupe:(function(){try{return {on:LOUPE.on,toile:LOUPE.on?[LOUPE.bw,LOUPE.bh]:[renderer.domElement.width,renderer.domElement.height]};}catch(e){return null;}})(),nUrgD:PILO.nUrgD|0,force:PIL_F||null,gel:PIL_GEL,K:PILO.K,nom:PIL_NOM[PILO.K],vise:PILO.Kv,dette:PILO.Kv-PILO.K,niveau:PRF.n,plafond:(function(){try{return pilPlafEff();}catch(e){return null;}})(),plafondJoueur:(function(){try{return pilPlafond();}catch(e){return null;}})(), /* (M5) l'ordinateur n'a pas de classe : dbgPilote ne lève plus */auto:PIL_AUTO&&!pilChoisi(),src:PILO.src,cond:c,cle:(PRF.modele||'?')+'|'+c.cle,
    table:pilTable(c),tableBornee:(function(){try{return pilTableK(c);}catch(e){return null;}})(),tic:+pilTic().toFixed(1),per:+PILO.per.toFixed(1),eM:CAD.eM||0,zone:PILO.zone,rates3:pilRates(3),rates10:pilRates(10),vrai:PILO.vraiT?+PILO.vrai.toFixed(1):null,bleu:PILO.bleuS,
    mur:PILO.mur,seance:PILO.sess,retailles:PILO.nRet,halo:PILO.nBloom,ombresNeuves:PILO.nOmb,dettes:{dpr:PILO.dDpr,halo:PILO.dBloom},capN:PILO.capN,descend:pilDescend(),gels:PILO.gels,trous:PILO.nT,geleux:PILO.geleux,glS:PILO.glS,constructions:PILO.nCons,borne:PILO.borne,nBorne:PILO.nBorne,jeton:PILO.jeton,razIgnores:PILO.razIgn,wDer:+PILO.wDer.toFixed(1),urgence:PILO.urg?PILO.urg.pq:PILO.urgFait?'payée':null,nUrg:PILO.nUrg,nEchec:PILO.nEchec|0,rgSuite:PILO.rgSuite|0,consEn:!!PILO.consEn,capGel:(function(){try{return pilCapGel(c);}catch(e){return null;}})(),court:PILO.court||{},nVrai:PILO.nVrai|0,vraiP:PILO.vraiPT?+PILO.vraiP.toFixed(1):null,seg:(function(){const o={};for(const k in PILO.seg){const g=PILO.seg[k];o[k]={s:g.s,rS:g.rS|0,ep:g.ep|0,rsMax:g.rsMax|0,rgMax:g.rgMax|0,ro:g.ro,kv:g.kv,k0:g.k0};}return o;})(),jetonExp:PILO.jetonExp|0,bleuCumul:PILO.bleuC,portails:{payes:PILO.nPort,ignores:PILO.portIgn,raz:PILO.razIgn},departs:{notes:PILO.nDep,ignores:PILO.depIgn},cand:PILO.cand||null,mort:PILO.mort,mortP:PILO.mortP,reprise:(function(){try{return pilRepriseQui();}catch(e){return '?';}})(),fenRates:(PILO.rw||[]).slice(),histo:Array.from(PILO.h),changements:PILO.chg,journal:PILO.jr.slice(-15),
    img:window.imgRegle(),qlMin:PAL.b('qlMin',0),poly:MOB_POLY?window.__ccPoly.on:null,cadPer:(function(){try{return +cadPer().toFixed(1);}catch(e){return null;}})(),memoire:(function(){try{return pilMemLit();}catch(e){return null;}})()};};
window.dbgPiloteOu=function(){return pilOu();};
window.dbgPisteTranches=function(pas){ /* (6e tour, banc M2) une piste refaite EN COURSE par le générateur, une tranche toutes les `pas` ms (comme le chargement sous le serpent, mais étalée sur plusieurs secondes) : la construction dure plusieurs images */
  if(!started||gameOver)return 'pas de course';const g=newTrackG(),t0=performance.now();let n=0;window.__pisteTr={n:0,fini:false};
  const f=function(){let r;PISTE_TRANCHE=4;try{r=g.next();n++;}catch(e){window.__pisteTr={n:n,err:String(e&&e.message)};return;}finally{PISTE_TRANCHE=Infinity;}if(r.done){window.__pisteTr={n:n,fini:true,ms:Math.round(performance.now()-t0)};return;}window.__pisteTr.n=n;setTimeout(f,+pas||150);};
  f();return 1;}; /* (banc) le moment de cet instant : course, depart, portail, mort, pause, menu */
window.dbgPiloteSim=function(o){ /* (banc) simule les capteurs : t (thermique iOS, joué aussi par dbgThermique), B (branché), E (économie), bat (%), vrai (ms), rates (part) ; null efface */
  if(o===null){PILO.sim=null;return null;}o=o||{};
  if(o.t!=null)try{mobThermo(+o.t);}catch(e){}
  if(o.B!=null)window.__ccBranche=o.B?2:1;if(o.E!=null)window.__ccEco=o.E?1:0;if(o.bat!=null)window.__ccBatterie=+o.bat;
  if(o.K!=null)pilAppliquer(Math.max(0,Math.min(8,+o.K)),'course','banc : K posé');if(o.Kv!=null)PILO.Kv=Math.max(0,Math.min(PIV_ON?13:12,+o.Kv)); /* (banc) un cran posé en course, un cran visé */
  const S=PILO.sim||(PILO.sim={});if('vrai' in o){S.vrai=o.vrai;S.vN=1;}if(o.vrai1!=null)S.vrai1=+o.vrai1;if(o.constr!=null){pilConstr(1);setTimeout(function(){pilConstr(0);},+o.constr);} /* (6e tour) vrai1 : un échantillon isolé ; constr : une construction de constr ms */if('eM' in o)S.eM=o.eM;if(S.eM==null)delete S.eM;if('rates' in o)S.rates=o.rates;if('ni' in o)S.ni=o.ni;if('motif' in o){S.motif=o.motif;S.mi=0;if(S.motif==null)delete S.motif;}if(o.nr1!=null)S.nr1=+o.nr1; /* (8e tour) motif : ratés par seconde, en boucle ; nr1 : n ratés dans la seconde qui vient, une fois */if('gels' in o)S.gels=o.gels;if(S.gels==null)delete S.gels;if(S.vrai==null)delete S.vrai;if(S.rates==null)delete S.rates;return Object.assign({},S);};
function pilPrechauffe(){ /* (étape 2) LES CARTES D'OMBRE PRÉCHAUFFÉES : les tailles que les crans [C] et [P] peuvent poser sur ce niveau (un cran plus bas, 512) sont allouées SOUS VOILE ; en course, un cran d'ombre
     ne fait plus que changer de carte (QL.ombres, rendu/nettete-qualite.js qlPose). Coût : ~10 Mo de mémoire graphique au N2 (1024 + 512). Comme three le ferait (WebGLShadowMap : RGBA, filtres au plus proche). */
  if(!PIL_PRECH)return;let P0=null;try{P0=mobP0Niv();}catch(e){return;}const C=QL.ombres||(QL.ombres={}),cur=sun.shadow.mapSize.x;
  for(const s of [mobOmbreBas(P0.ombre,1),512]){if(s===cur||C[s]||s>1280)continue;
    try{const rt=new THREE.WebGLRenderTarget(s,s,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,format:THREE.RGBAFormat});rt.texture.name='soleil.shadowMap';
      const av=renderer.getRenderTarget();renderer.setRenderTarget(rt);renderer.setRenderTarget(av);C[s]=rt;PILO.nPre=(PILO.nPre|0)+1;}catch(e){}}}
const PIL_PRECH=!/[?&]sans=[^&]*\bpilombre\b/.test(PIL_Q);
/* ===== ÉTAPE 4 — LA MÉMOIRE DU CRAN TENU, PAR CONDITION (2026-11-17) =====
   `localStorage.cashcarPilote` = {v:2, m:modèle, K:{"B1E1T2":{k, n, t, N, v}}} (N = le niveau de base, v = courses de suite avec marge : ni ORANGE ni ROUGE, K0 tenu) (miroir dans les préférences natives, comme cashcarProfil). ÉCRITE à la mort : pour chaque condition vécue au moins 30 s
   de course, le cran VISÉ en fin de segment (ce que la règle a appris : dettes comprises), moyenné avec l'ancien (n plafonné à 5). Ignorée : batterie < 20 %, course < 30 s, `?pilote=*`, `?classe=`,
   `?appareil=`, `?sans=pilmem`. Plus de 7 jours : l'entrée est jetée. LUE au départ (n ≥ 2, et seulement si la séance n'a pas déjà vécu cette condition) : elle REMPLACE la table, au plus 4 crans
   au-dessus. La course brûlante du juge (pjcTick : critical vu) apprend à la clé serious de l'instant K + 2. `dbgPilote('oubli')` vide la clé et le miroir. */
/* (3e tour, S1 — LA MÉMOIRE QUI POMPAIT : N1, N1, N2, N1, N1, N2… quand N2 ratait) un changement de base (N1 ⇄ N2) ne remet plus l'entrée à zéro (n garde son compte, k repart du cran tenu) ;
   un ÉCHEC À N2 (ROUGE tenu 3 s ou plus, ou une urgence payée, sur une course où le niveau plein a tourné) pose un MUR N2 durable sur cette condition : `e.mur2` = date + 7 jours, doublé à chaque
   nouvel échec (`e.d2`), 30 jours au plus ; l'entrée revient à la base BASSE (son cran d'avant gardé) et la marge repart de 0 ; pendant le mur, N2 n'est ni tenté par la marge, ni gardé par la
   mémoire, ni posé par la table (même débranché à froid). Un N2 qui TIENT devient la base de l'entrée : gardé d'un lancement à l'autre. Une entrée sous mur n'est pas jetée à 7 jours. */
const PIL_MEM=!/[?&]sans=[^&]*\bpilmem\b/.test(PIL_Q)&&!PIL_F&&!/[?&](classe|appareil)=/.test(PIL_Q),PIL_MEM_J=7*864e5,PIL_MUR2_1=864e5,PIL_MUR2_J=7*864e5,PIL_MUR2_MAX=30*864e5;
/* (4e tour, 17/11) FORMAT v3 : {v:3, m, K:{cle:{k, n (le cran de N1 et son compte), k2, n2 (le cran de N2, condition libre seulement), t, v, mur2, d2}}}. La mémoire n'apprend que des CRANS ;
   le niveau vient de la condition (N2 seulement en libre). Les entrées v2 (qui portaient un niveau appris hors libre) sont jetées. L'ÉCHEC À N2 (`pilEchecN2`) est vérifié chaque seconde
   et aux fins (mort, menu, page cachée) : écrit DÈS qu'il est constaté. */
function pilMemLit(){try{const a=JSON.parse(localStorage.getItem('cashcarPilote')||'null');if(!a||a.v!==3||a.m!==PRF.modele||!a.K)return null;const t=Date.now();
  for(const k in a.K)if(!(t-(a.K[k].t||0)<PIL_MEM_J)&&!((a.K[k].mur2||0)>t))delete a.K[k];return a;}catch(e){return null;}}
function pilMemE(c){if(!PIL_MEM)return null;const a=pilMemLit();return a&&a.K[c.cle]||null;} /* l'entrée de la condition, quel que soit n */
function pilMemK(c){const e=pilMemE(c);return e&&e.n>=2?e:null;}
function pilMur2(c,e,pl,nb){return !!(e&&(e.mur2||0)>Date.now()&&pl>nb&&!PIL_NF&&!pilHauteChoisie());} /* vrai : le mur N2 de cette condition tient (AUTO seulement) */
function pilPrefs(){try{const C=window.Capacitor;return C&&C.Plugins&&C.Plugins.Preferences||null;}catch(e){return null;}}
function pilMemEcrit(a){try{const v=JSON.stringify(a);localStorage.setItem('cashcarPilote',v);const Pr=pilPrefs();if(Pr){const p9=Pr.set({key:'cashcarPilote',value:v});if(p9&&p9.catch)p9.catch(function(){});}}catch(e){}}
function pilApprend(cle,k,pq,n2,marge,echec){if(!PIL_MEM||!PRF.modele)return;const a=pilMemLit()||{v:3,m:PRF.modele,K:{}};let e=a.K[cle];const now=Date.now();
  if(!e)e={k:pilTableC(Object.assign({bat:-1},pilDeCle(cle))).k,n:0,t:0,v:0};
  if(echec){const d=!e.d2?PIL_MUR2_1:e.d2<PIL_MUR2_J?PIL_MUR2_J:Math.min(PIL_MUR2_MAX,e.d2*2); /* (5e tour) murs progressifs : 24 h, 7 j, puis doublé jusqu'à 30 j */e.d2=d;e.mur2=now+d;e.v=0;e.t=now;
    a.K[cle]=e;pilMemEcrit(a);pilNote('mémoire · '+cle+' : ÉCHEC à N2 ('+pq+') → mur N2 '+Math.round(d/864e5)+' j · retour N1 K'+e.k+' (n '+(e.n|0)+')');return;}
  k=Math.max(0,Math.min(12,k|0));
  if(n2){e.k2=e.n2?Math.round((e.k2*e.n2+k)/(e.n2+1)):k;if(k<e.k2)e.k2=k;e.n2=Math.min(5,(e.n2|0)+1);} /* un cran plus léger tenu est pris tout de suite (la remontée ne se dilue pas dans la moyenne) */
  else{e.k=e.n?Math.round((e.k*e.n+k)/(e.n+1)):k;if(k<e.k)e.k=k;e.n=Math.min(5,(e.n|0)+1);}
  e.v=marge?Math.min(5,(e.v|0)+1):0;e.t=now;a.K[cle]=e;pilMemEcrit(a);
  pilNote('mémoire · '+cle+' : N'+(n2?2:1)+' K'+k+' tenu ('+pq+(marge?', marge':'')+') → appris K'+(n2?e.k2+' (N2, n '+e.n2:e.k+' (N1, n '+e.n)+')'+(e.mur2>now?' · mur N2 '+Math.ceil((e.mur2-now)/864e5)+' j':''));}
function pilEchecN2(g,cle,fin){ /* (4e tour) l'échec du niveau plein (libre, AUTO) sur le segment g : '' ou la raison */
  if(!g||g.echec||PIL_KF>=0||PIL_NF||pilHauteChoisie())return '';let nb=1;try{nb=pilNivBas();}catch(e){}
  if(!(g.nMax>nb)||pilTableC(Object.assign({bat:-1},pilDeCle(cle))).cap)return '';
  /* (5e tour, S1) ROUGE = 3 s DE SUITE de vrais ratés dans la seconde même (g.rgMax), course courte comprise (la même exigence : plus de « course < 30 s qui a vu un tic ROUGE ») */
  if((g.rgMax|0)>=3)return 'ROUGE '+g.rgMax+' s de suite (vrais ratés)';
  /* (6e tour, S1 du contrôle) plus de fenêtre glissante ici : seules comptent les secondes ratées (rS : ≥ 1 image dans la seconde ET ≥ 3 sur les 3 dernières secondes calmes, ou > 8 % — fenêtre du 8e tour) ; et il faut plus que
     deux accrocs isolés : au moins 3 s ratées ET (un accroc de 3 s ou plus, ou 3 accrocs ou plus, comptés à ce seuil). Un ou deux accrocs isolés (≤ 2 s chacun), des images ratées isolées : jamais de mur.
     Ce « tenu » est exigé par TOUTES les règles qui suivent : l'urgence, les ratés majoritaires et « K + 3 » (des crans venus de deux pics ne suffisent pas) */
  const rS=g.rS|0,tenu=rS>=3&&((g.rsMax|0)>=3||(g.ep|0)>=3);if(!tenu)return '';
  /* (7e tour, mineur 2 du contrôle) l'URGENCE payée ne pose le mur N2 qu'avec de vrais ratés tenus : la sonde seule (vrai coût haut, 0 image ratée) arme l'urgence (une vraie surcharge : la course
     descend d'un niveau tout de suite) et la mémoire apprend le cran tenu (K9 = N1), mais pas de mur de 24 h sans une image ratée ; la marge BLEU peut rendre N2 */
  if(g.urg)return 'urgence payée ('+rS+' s de vrais ratés)';
  if(g.s>=30&&2*rS>=g.s)return 'ratés majoritaires ('+rS+'/'+g.s+' s ratées : ≥ 3 images sur 3 s)';
  if(g.kv>=g.k0+3)return 'K'+g.kv+' ≥ K départ '+g.k0+' + 3 ('+rS+' s ratées, '+(g.ep|0)+' accroc'+((g.ep|0)>1?'s':'')+')';
  return '';}
function pilEchecPose(cle,g,r,quoi){g.echec=1;PILO.nEchec=(PILO.nEchec|0)+1; /* l'échec constaté : le mur N2 écrit, la séance revient à N1 */
  if(PIL_MEM)pilApprend(cle,g.kv,r+(quoi?' · '+quoi:''),true,false,true);else pilNote('échec N2 · '+r+' (sans mémoire)');
  const c=Object.assign({bat:-1},pilDeCle(cle));c.cle=cle;if(cle===(PILO.cle||'')){let nb=1;try{nb=pilNivBas();}catch(e){}PILO.capN=nb;const d=pilDepartCalc(c);if(!PIL_MEM)d.cap=nb;PILO.Kv=d.k;PILO.sess[cle]={k:d.k,cap:nb};}}
function pilVerifEchec(fin,quoi){ /* à chaque seconde, et aux fins : le mur N2 s'écrit dès que l'échec est constaté ; le départ suivant (et le prochain moment sous voile) est N1 */
  const G=PILO.seg;for(const cle in G){const g=G[cle],r=pilEchecN2(g,cle,fin);if(r)pilEchecPose(cle,g,r,quoi);}}
/* (6e tour, mineur 2) LES COURSES COURTES : une course de moins de 30 s n'apprend rien seule ; son constat (secondes jouées, secondes à vrais ratés, accrocs) se CUMULE dans la séance, par
   condition et niveau (PILO.court), et la règle d'échec s'applique au cumul dès 30 s. Le cumul repart de zéro après un verdict (échec, ou 30 s cumulées sans échec) et après une course longue. */
function pilCumulCourt(G,quoi){let nb=1;try{nb=pilNivBas();}catch(e){}const C=PILO.court||(PILO.court={});
  for(const cle in G){const g=G[cle];if(g.echec||!(g.nMax>nb))continue;const ck=cle+'|N'+g.nMax;
    if(g.s>=30){delete C[ck];continue;}
    const a=C[ck]||(C[ck]={s:0,rS:0,ep:0,rsMax:0,kv:0,k0:g.k0,nMax:g.nMax,n:0});a.s+=g.s;a.rS+=g.rS|0;a.ep+=g.ep|0;a.rsMax=Math.max(a.rsMax,g.rsMax|0);a.kv=g.kv;a.n++;
    if(a.s<30)continue;delete C[ck];
    const r=pilEchecN2({s:a.s,rS:a.rS,ep:a.ep,rsMax:a.rsMax,kv:a.kv,k0:a.k0,nMax:a.nMax,ro:0,rgMax:0,urg:0},cle,true);
    if(r)pilEchecPose(cle,g,'cumul de '+a.n+' courses courtes ('+a.s+' s) · '+r,quoi);else pilNote('courses courtes · '+cle+' : '+a.n+' courses, '+a.s+' s cumulées, '+a.rS+' s de vrais ratés · N'+a.nMax+' tient');}}
function pilFinCourse(quoi){ /* à la mort, au retour au menu : les segments de la course */
  pilVerifEchec(true,quoi);pilCumulCourt(PILO.seg,quoi);
  const G=PILO.seg;PILO.seg={};const c=PILO.c||pilCond();if(!PIL_MEM||(c.bat>=0&&c.bat<20))return;let nb=1;try{nb=pilNivBas();}catch(e){}
  for(const cle in G){const g=G[cle];if(g.s<30||g.echec)continue;
    pilApprend(cle,g.kv,g.s+' s de course'+(g.ro?', '+g.ro+' s orange/rouge':'')+(g.rg?', '+g.rg+' s rouge':'')+(g.urg?', urgence':'')+(g.gl?', '+g.gl+' s de gels':''),g.N>nb&&(g.n>nb||g.kv>=9),!g.ro&&!g.gl&&!g.kmax&&!g.kv,false);}} /* (S2) des gels sur la fenêtre : pas de marge ; (6e tour, mineur 5) l'échelle du cran est celle du PLAFOND (g.N) : à K ≥ 9 le niveau descend d'un cran, mais le cran appris reste celui de N2 (k2), celui que le départ lit */
function pilApprendChaud(){if(!pilOn())return;const c=pilCond(),cle='B'+(c.B?1:0)+'E'+(c.E?1:0)+'T2';pilApprend(cle,Math.min(12,PILO.K+2),'course brûlante : critical vu à K'+PILO.K,false,false,false);}
try{const vu=function(){try{if(pilOn()&&!PIL_GEL&&(document.visibilityState==='hidden'||this===window))pilVerifEchec(true,'page cachée');}catch(e){}};document.addEventListener('visibilitychange',vu);window.addEventListener('pagehide',vu);window.addEventListener('pagehide',function(){try{if(pilOn()&&!PIL_GEL){let vu2=false;for(const k9 in PILO.seg){vu2=true;break;}if(vu2)pilFinCourse('page quittée');}}catch(e){}});}catch(e){} /* (7e tour, mineur 4) la page quittée (rechargement, fermeture) au milieu d'une course : sa fin de course, comme au départ suivant */ /* (4e tour) l'échec ne se perd pas si iOS tue la page */
function pilOubli(){try{localStorage.removeItem('cashcarPilote');}catch(e){}try{const Pr=pilPrefs();if(Pr){const p9=Pr.remove({key:'cashcarPilote'});if(p9&&p9.catch)p9.catch(function(){});}}catch(e){}PILO.sess={};PILO.mur={};}
if(PIL_MEM&&pilOn())try{if(localStorage.getItem('cashcarPilote')==null){const Pr=pilPrefs();if(Pr){const p9=Pr.get({key:'cashcarPilote'});if(p9&&p9.then)p9.then(function(r){try{if(r&&r.value&&localStorage.getItem('cashcarPilote')==null)localStorage.setItem('cashcarPilote',r.value);}catch(e){}}).catch(function(){});}}}catch(e){} /* le miroir natif rend la mémoire qu'iOS aurait vidée (lue au départ suivant) */
if(pilOn()&&!PIL_GEL){ /* le départ AU CHARGEMENT (sous le serpent) : le niveau et le cran des conditions de cet instant */
  try{const c=pilCond();PILO.c=c;PILO.cle=c.cle;PILO.tPrev=c.t;const k=pilDepartK(c),n0=PRF.n;PILO.Kv=k;PILO.fait=PIL_FIGE;pilAppliquer(k,'menu','chargement');
    pilNote('chargement · N'+n0+' → N'+PRF.n+' K'+PILO.K+' · '+PRF.modele+'|'+c.cle+' · source '+PILO.src+' · plafond '+(PIL_NF?'forcé N'+PIL_NF:pilChoisi()?(PRF.q==='haute'?'HAUTE':'BASSE'):PIL_AUTO?'AUTO':'BASSE'));}catch(e){try{window.__ccNote('pilote','chargement : '+String(e&&e.message).slice(0,120));}catch(x){}}}
