
/* ===== LE GOUVERNEUR PILOTE L'IMAGE PAR PALIERS : BAISSE À CHAUD, REMONTE À FRAIS (2026-11-07, vitesse-fluide) =====
   BAISSE — MESURÉ (13 Pro, app, build 6) : calé sur 30 et l'échelle QL au plancher (crans 9-11), la course tombe quand même à 83 ms (12 i/s) vers 8 min de jeu : à chaud la puce est bridée ~3×, il faut couper ~3× de
   travail. La dose de chaleur (gouverneur-thermique.js ; le 30 calé la monte de 0,5 par seconde : 60 ≈ 2 min, 100 ≈ 3 min 20, 140 ≈ 4 min 40 de course) pose, PAR PALIERS, la couche dynamique de la passe 3
   (`imgRegle`, rendu/nettete-qualite.js : halo, mips, ombre, plafond de résolution, ciel lisse, densité des traits d'air et traînées) — le départ de course (P2 : halo ½, ombre 768, plafond 1,25, ciel ½…) est le palier 0.
     0 · < 60   : le départ statique de P2, rien d'écrit.
     1 · ≥ 60   : plafond 1,1 ; halo ½ à 2 mips.
     2 · ≥ 100  : plafond 1,0 ; halo coupé ; ombre 512 ; ciel lisse 1 image sur 4 ; traits d'air et traînées ×½ ; échelle QL au cran maximal (flou radial coupé) ; vent et émission de la caisse ×½ ; + RÉGIME CHAUD (mobh-regime-chaud.js).
     3 · ≥ 140  : plafond 0,8 ; ciel lisse 1 image sur 8.
   L'ÉTAT THERMIQUE D'iOS (`cc:thermique`) : ≥ 2 pose la dose à 160 (gouverneur-thermique.js) = palier 3 tout de suite ; `mobPalCible` garantit au moins 2 / 3 même si la dose baissait.
   ⚠ MONTÉE immédiate, DESCENTE lente : un palier ne se lève qu'une minute après le dernier changement, un palier à la fois (la dose ne redescend que de 0,25 par seconde de repos).
   REMONTE (règle de Sacha : « fluidité d'abord ; une fois atteinte, remonter le rendu vers celui de l'ordinateur ») — paliers NÉGATIFS : le téléphone est FRAIS (dose < `MOB_R.frais`) et FLUIDE pendant 60 s
   d'affilée (travail de l'image médian < 12 ms, jamais > 16 ms, images à l'heure : p75 de l'échelle QL ≤ 19 ms) → un cran de plus : −1 = plafond de résolution du réglage du joueur (1,5 en NETTE) ; −2 = + halo plein
   (5 mips) et ombre 1024. Chaque cran demande SES 60 s. Un cran de remontée tombe d'un coup au palier 0 dès que la fluidité manque 5 s de suite, ou que la dose atteint le palier 1 ; il ne revient pas dans la même course.
   Seulement sur téléphone récent (TEL_NATIF, palier 2 : c'est MOB_GOUV). `?gouv=max` = rien de tout cela (et pas de régime chaud par défaut) ; `?mob_raise=1` = la remontée (INACTIVE par défaut depuis le 07/11 soir : build 13, 15 gels > 1 s en course, hypothèse = les bascules réallouent les cibles) ; `?mob_gouv=0` = plus de gouverneur.
   Banc : `dbgGouv()` donne `gpu` (palier, ce qui est posé) ; `dbgGouv(dose)` pose la dose et lève la garde d'une minute. */
const MOB_PALS=MOB_GOUV&&!/[?&]gouv=max\b/.test(location.search);
/* LA POLYPHONIE DES BRUITAGES SOUS LA CHALEUR (2026-11-08, vitesse-fluide : le son coûte +4 à +10 ms de processeur par image) : au palier 2 et plus, EN COURSE seulement, `window.__ccPoly.on` est vrai ; sfx.js (le lecteur de sons) ignore alors les sons de moins de `min` s (hors boucle,
   hors `force`) et ramène la polyphonie de chaque son à `k` × son maximum (au moins 1). Les plus anciennes voix s'effacent comme d'habitude. La musique n'est pas touchée. `?mob_poly=0` = jamais. Compteurs : `__ccPoly.ign` (sons ignorés), `.cou` (voix coupées). */
const MOB_POLY=MOB_PALS&&!/[?&]mob_poly=0\b/.test(location.search);
if(MOB_POLY)window.__ccPoly=window.__ccPoly||{on:false,k:.5,min:.06,ign:0,cou:0};
const MOB_PP=[{d:0},{d:60,dpr:1.1,halo:'demi',mips:2,ql:3},{d:100,dpr:1,halo:'off',ombre:512,ciel:4,stries:.5,k:.5,ql:99},{d:140,dpr:.8,halo:'off',ombre:512,ciel:8,stries:.5,k:.5,ql:99}]; /* tout se règle ici ; ql 99 = le cran maximal de l'échelle */
/* LE DÉPART DE P2 (nettete-qualite.js `imgRegle`, palier-appareil.js `PAL.B.imgBloomRes`) : halo ½, 3 mips, ombre 768, ciel sans plancher, traits d'air aux budgets — à tenir d'accord avec P2 ; chaque palier est posé en UN SEUL appel qui redit ces clés (jamais reset puis pose : chaque appel d'imgRegle repasse par applyDPR) */
/* (2026-11-10, voir LE VRAI CAPTEUR, gouverneur-thermique.js) AVEC LE CAPTEUR D'iOS, LA NETTETÉ D'ABORD — choix de Léo : « quand ça ne tient pas, sacrifie les effets, garde l'image nette ».
   Le palier EST l'état thermique (0 nominal · 1 fair · 2 serious · 3 critical) : fair = halo ½ à 2 mips, ombre 512 ; serious = halo coupé, ciel lisse 1 image sur 4, traits et traînées ×½, échelle QL au
   cran maximal ; critical = en plus le plafond de résolution à 1,1 et le ciel 1 image sur 8. La résolution ne bouge qu'au dernier palier, et jamais sous 1,1. */
/* (2026-11-12, ios-ultime, Sacha : « j'ai commencé à avoir des lags au moteur 16 et plus de son au moteur 18 ») LE SÉRIEUX QUI DURE, ET LE CRITIQUE PLUS BAS.
   MESURÉ (build 69, vol 67 : une partie de 14 min, téléphone branché, déjà « serious » au lancement) : 30 i/s tenues 11 min (travail 4 ms par image, même à 1 000 km/h), puis iOS passe « critical »
   et bride la puce ×10 (travail 35-55 ms par image, 3-15 i/s, le fil du son étouffé) jusqu'à la mort. Le moteur 16 n'est que la minute où ça arrive. Au palier serious la résolution restait
   intacte (1,19) : la chaleur continuait de monter. Désormais, avec le capteur : après `MOB_LONG.s` secondes de COURSE passées en serious (cumulées, remises à zéro dès que le téléphone
   repasse fair), le palier 3 « sérieux qui dure » pose déjà le plafond 1,1 et le ciel 1 image sur 8 (l'ancien critical) ; critical devient le palier 4 : plafond 0,85 — à 5 i/s la netteté
   ne se voit plus, il faut refroidir. `?mob_long=0` = la table d'avant. */
const MOB_LONG={on:!/[?&]mob_long=0\b/.test(location.search),s:150,n:0};
const MOB_PN=MOB_LONG.on?[{d:0},{halo:'demi',mips:2,ombre:512,ql:3},{halo:'off',ombre:512,ciel:4,stries:.5,k:.5,ql:99},{dpr:1.1,halo:'off',ombre:512,ciel:8,stries:.5,k:.5,ql:99},{dpr:.85,halo:'off',ombre:512,ciel:8,stries:.5,k:.5,ql:99}]
  :[{d:0},{halo:'demi',mips:2,ombre:512,ql:3},{halo:'off',ombre:512,ciel:4,stries:.5,k:.5,ql:99},{dpr:1.1,halo:'off',ombre:512,ciel:8,stries:.5,k:.5,ql:99}];
/* ===== LE GOUVERNEUR PART DU NIVEAU DU PROFIL (2026-11-14, Sacha : « mon 13 Pro la meilleure version possible ; priorité fluidité, puis qualité max ») =====
   Les paliers ci-dessus (MOB_PN avec le capteur, MOB_PP à la dose) sont écrits pour le N1 — l'image d'aujourd'hui : plafond 1,25, halo ½ à 3 étages, ombre 768. Sous un PROFIL de niveau
   N2-N4 (`PRF.n`, rendu/soleil-planete.js), chaque palier part du niveau COURANT et en retire la MÊME PART qu'au N1 (tables MOB_PNK / MOB_PPK) :
     · le départ (palier 0, et la base de chaque palier) : halo du levier a (`PAL.bT('imgBloomRes')`, plein dès N2), étages `bloomNM()`, ombre `ombreTel()`, plafond `dprPlafond()` du niveau ;
     · fair : un étage de halo en moins, l'ombre un cran plus bas (512 · 768 · 1024 · 1280), plancher de l'échelle QL au cran 3 — au N1 : 3 → 2 étages, 768 → 512, cran 3 ;
     · serious : halo coupé, ombre 512, ciel lisse 1 image sur 4, traits et traînées ×½, vent et émission ×½ — comme au N1. LA RÉSOLUTION : au N1 le cran MAXIMAL de l'échelle la pose sur
       le plancher BAS, 1,0 pour un plafond de 1,25 = 80 %. Sous profil le plafond devient 80 % de celui du niveau (`dk`) et l'échelle est tenue au cran 5 (`N_EFF` : tous ses effets
       coupés, la résolution encore libre) : si 80 % ne tient pas, l'échelle descend d'elle-même jusqu'aux planchers du niveau. N3 : 2,0 → 1,6 (et non 1,25 d'un coup) ; N4 : 3 → 2,4 ;
     · serious qui dure : idem + ciel 1 image sur 8 — au N1 le plafond 1,1 passe sous le cran maximal de l'échelle : la résolution effective y reste 1,0, soit 80 % ;
     · critical (et serious branché) : 68 % du plafond (au N1 : 0,85 sur 1,25) ; la cadence à 20 i/s reste celle d'aujourd'hui ; le cran QL de plus du critique (mobThermo), sans effet au N1, n'est pas rejoué ;
     · sans capteur (la dose) : 88 % · 80 % · 64 % (au N1 : 1,1 · 1,0 · 0,8 sur 1,25).
   N1 et hors profil : les tables d'avant, au bit près (`mobNiv()` vaut 1). HAUTE : à serious et plus le gouverneur garde la main (qlPose, rendu/nettete-qualite.js, lit `MOB_P.t`).
   Le niveau change à chaud (BASSE ⇄ HAUTE, prfRegle) : le palier en cours se repose sur le nouveau niveau dans la seconde (UN appel à imgRegle, la minute de descente n'est pas relancée).
   La remontée (MOB_R, `?mob_raise=1`) ne joue pas sous profil : le niveau est déjà le plafond (ses crans visaient l'ombre 1024 et le plafond 1,5 de la NETTE d'avant).
   `MOB_P0` ne se recopie plus : c'est une VUE (en lecture) du départ du niveau courant (l'ancien rattrapage `prfP0` du lot 1 est retiré, 14/11).
   (2026-11-14, pilote) à serious et serious qui dure le N4 descend à 70 % de son plafond (`PRF.T.n[4].dkS`) au lieu de 80 % : 2,1 de DPR au lieu de 2,4.
   `?sans=prfgouv` = les écarts du N1 (MOB_PN, MOB_PP) posés sur le départ du niveau, comme au lot 1. Banc : `dbgGouvPaliers()` → `niveau`, `voulu`. */
const PRF_GOUV=!/[?&]sans=[^&]*prfgouv/.test(location.search);
function mobNiv(){try{return PRF_GOUV&&PRF.on&&PRF.n>=2?PRF.n:1;}catch(e){return 1;}} /* le niveau d'où partent les paliers (1 = les tables d'avant) */
const MOB_PNK=MOB_LONG.on?[{d:0},{mips:-1,ombre:-1,ql:3},{halo:'off',ombre:512,ciel:4,stries:.5,k:.5,ql:5,dk:.8},{halo:'off',ombre:512,ciel:8,stries:.5,k:.5,ql:5,dk:.8},{halo:'off',ombre:512,ciel:8,stries:.5,k:.5,ql:5,dk:.68}]
  :[{d:0},{mips:-1,ombre:-1,ql:3},{halo:'off',ombre:512,ciel:4,stries:.5,k:.5,ql:5,dk:.8},{halo:'off',ombre:512,ciel:8,stries:.5,k:.5,ql:5,dk:.8}]; /* mips/ombre < 0 : étages / crans d'ombre EN MOINS ; dk : part du plafond du niveau */
const MOB_PPK=[{d:0},{d:60,mips:-1,ql:3,dk:.88},{d:100,halo:'off',ombre:512,ciel:4,stries:.5,k:.5,ql:5,dk:.8},{d:140,halo:'off',ombre:512,ciel:8,stries:.5,k:.5,ql:5,dk:.64}]; /* (sans capteur ; les seuils `d` restent ceux de MOB_PP) */
/* ===== LE GOUVERNEUR DOUX (2026-11-14, Sacha : « les graphismes ne sont pas au maximum » ; mesuré build 116) =====
   MESURÉ (iPhone 13 Pro de Sacha, build 116, boîte de vol du 14/11 au soir, 14 min de course) : Sacha joue presque toujours BRANCHÉ (la batterie charge) et en économie d'énergie ;
   iOS reste « serious » toute la séance. Le gouverneur coupait alors l'image (plafond 0,85 « serious + branché » ou 1,0, halo coupé donc QUAL_LOW : les traînées n'éclairaient
   plus la route, feu du nitro ×0,6 ; ombre 512) — pour rien : à serious, DPR 0,85-1,0, une image coûte 13-15 ms (médiane) ; à fair, DPR 1,25 avec halo, 16-17 ms ; 29-30 i/s
   tenues dans les deux cas sur 33 ms de budget. Et le banc de chaleur du 13/11 (passation/ios-ultime/PLAN-ULTIME.md, « 13/11 19 h 45 ») : la chaleur vient de la CHARGE de la
   batterie, pas du rendu (demi-résolution ou sans 3D : même effondrement). Désormais, sur un téléphone PROFILÉ (`PRF.on`, N1 à N4), avec le capteur :
     · nominal, fair : comme avant (fair : un étage de halo et un cran d'ombre en moins, plancher de l'échelle au cran 3) — jamais de résolution ;
     · serious (et serious qui dure, et serious branché : IDENTIQUES) : la résolution du niveau GARDÉE (aucun plafond posé) ; le halo RESTE (entrée en demi-résolution, un étage
       de moins) donc QUAL_LOW faux ; l'ombre un cran plus bas ; le ciel lisse 1 image sur 4 ; traits d'air et traînées pleins ; la loupe de la caisse reste ; l'échelle QL est
       LIBRE (plancher au cran 2 : le halo n'y est pas réduit) et réagit à la MESURE — c'est elle, pas l'état thermique, qui baisse la résolution si l'image ne tient pas
       (voir cadence.js `gdxGel` et rendu/nettete-qualite.js `qlPose` : un cran à la fois, la toile au plus une fois toutes les 10 s, remontée après 20 s tenues) ;
     · critical (iOS bride la puce ×10) : 80 % du plafond du niveau, halo en demi-résolution à 2 étages (éteint seulement au dernier cran de l'échelle), ombre 512, ciel 1/8,
       traits ×½ ; la cadence à 20 i/s comme avant ; le cran QL de plus du critique (mobThermo) n'est plus rejoué ;
     · sans capteur (la dose 60 / 100 / 140) : les mêmes recettes (fair · serious · critical), SANS aucune baisse de résolution — la mesure décide.
   La cadence (30 calées, 60 des profils forts, 20 à critical) ne change pas. Hors profil (PRF.on faux) et ordinateur : rien ne change.
   `?sans=gouvdoux` = le gouverneur d'avant. Banc : `dbgGouvPaliers()` → `doux` ; `dbgGouvLong(s)` pose les secondes de serious cumulées (le serious qui dure). */
const GDX_ON=!/[?&]sans=[^&]*gouvdoux/.test(location.search);
function gdxOn(){try{return GDX_ON&&MOB_PALS&&!!PRF.on;}catch(e){return false;}} /* vrai : le gouverneur doux décide (téléphone profilé) */
function gdxCrit(){return MOB_S.capteur&&MOB_LONG.on?4:3;} /* l'indice du palier « critical » dans la table doux (avec le capteur et MOB_LONG : 4 ; à la dose : 3) */
const GDX_SER=Object.freeze({halo:'demi',mips:-1,ombre:-1,ciel:4,ql:2}),GDX_CRI=Object.freeze({halo:'demi',mips:2,ombre:512,ciel:8,stries:.5,k:.5,ql:2,dk:.8});
const MOB_PDX=MOB_LONG.on?[{d:0},{mips:-1,ombre:-1,ql:3},GDX_SER,GDX_SER,GDX_CRI]:[{d:0},{mips:-1,ombre:-1,ql:3},GDX_SER,GDX_CRI]; /* (capteur) relatif au départ du niveau, N1 compris ; [3] = le serious qui dure = serious */
const MOB_PPDX=[{d:0},{d:60,mips:-1,ql:3},Object.assign({d:100},GDX_SER),Object.assign({d:140},GDX_CRI,{dk:null})]; /* (dose) aucun `dk` : la dose seule ne baisse jamais la résolution */
function mobPalTable(){if(gdxOn())return MOB_S.capteur?MOB_PDX:MOB_PPDX; /* LE GOUVERNEUR DOUX */const k=mobNiv()>=2;return MOB_S.capteur?(k?MOB_PNK:MOB_PN):(k?MOB_PPK:MOB_PP);}
const MOB_P0N1=Object.freeze({halo:'demi',mips:3,ombre:768,ciel:0,stries:null}); /* le départ de P2 au N1 (et hors profil) */
const MOB_OMB=[512,768,1024,1280]; /* les tailles d'ombre que qlPose garde en réserve (QL.ombres) : descendre d'un cran ne réalloue rien */
function mobOmbreBas(om,n){let i=MOB_OMB.length-1;while(i>0&&MOB_OMB[i]>om)i--;return MOB_OMB[Math.max(0,i-n)];}
function mobP0Niv(){let n=1;try{n=PRF.on&&PRF.n>=2?PRF.n:1;}catch(e){}if(n<2)return MOB_P0N1; /* (même sous ?sans=prfgouv : le départ du niveau, comme le rattrapage du lot 1) */let h=1,m=5,om=1024;try{h=PAL.bT('imgBloomRes',1,'a');m=bloomNM();om=ombreTel();}catch(e){}return {halo:h===.5?'demi':h===1?'tout':h,mips:m,ombre:om,ciel:0,stries:null};}
const MOB_P0={};['halo','mips','ombre','ciel','stries'].forEach(function(k){Object.defineProperty(MOB_P0,k,{enumerable:true,get:function(){return mobP0Niv()[k];},set:function(){}});}); /* la VUE du départ (voir plus haut) */
const MOB_RA=[null,{dpr:'cap'},{dpr:'cap',halo:'tout',mips:5,ombre:1024}]; /* la remontée, par cran (palier −1, −2) */
const MOB_R={on:/[?&]mob_raise=1\b/.test(location.search),frais:40,fen:60,wMed:12,wMax:16,p75:19,mal:5};
const MOB_PQ=['qlMin','ventK','emiK'],MOB_P={t:0,chg:-1e9,tk:0,b:null,n:0,s:[],mal:0,non:false};
function mobPalBase(){ /* les valeurs d'origine du palier, lues une fois, avant la 1re écriture */
  if(MOB_P.b)return MOB_P.b;const b={};for(const k of MOB_PQ)b[k]=PAL.b(k,k==='qlMin'?0:1);return(MOB_P.b=b);}
function mobPalEcrit(k,v){const A=PAL.B[k]||(PAL.B[k]=[mobPalBase()[k],mobPalBase()[k],mobPalBase()[k]]);A[PAL.n]=v;}
/* (2026-11-13, ios-fond, Sacha : « ma dernière partie a énormément bugué, c'est injouable ») SÉRIEUX ET BRANCHÉ = LE PALIER DU CRITIQUE TOUT DE SUITE.
   MESURÉ (build 105, 6 vols) : téléphone en charge à 60 %, déjà « serious » au lancement ; 28-30 i/s pendant 3 min, puis iOS passe « critical » et bride la puce ×10
   (5-10 i/s, 45-97 ms de vrai coût par image, le portail de la grotte devient un chargement). La séance d'avant (build 104) : pareil, en charge. La charge chauffe le téléphone en plus du jeu :
   attendre 150 s de serious (LE SÉRIEUX QUI DURE) est trop long. Branché (`__ccBranche` ≥ 2 : en charge ou plein, GardeThermique) et serious → palier 4 d'emblée (plafond 0,85). `?sans=chargechaud` = comme avant. */
const MOB_CHARGE=!/[?&]sans=[^&]*chargechaud/.test(location.search);
function mobBranche(){try{return MOB_CHARGE&&(window.__ccBranche|0)>=2;}catch(e){return false;}}
function mobPalCible(){if(MOB_S.capteur&&gdxOn())return MOB_S.thermo>=3?gdxCrit():MOB_S.thermo; /* (LE GOUVERNEUR DOUX) serious qui dure et serious branché = serious */
  if(MOB_S.capteur)return MOB_LONG.on?(MOB_S.thermo>=3||(MOB_S.thermo===2&&mobBranche())?4:(MOB_S.thermo===2&&MOB_LONG.n>=MOB_LONG.s)?3:MOB_S.thermo):MOB_S.thermo; /* (2026-11-10) le capteur : le palier est l'état d'iOS, la dose ne compte plus */
  let t=0;for(let i=1;i<MOB_PP.length;i++)if(MOB_S.D>=MOB_PP[i].d)t=i;
  if(MOB_S.thermo>=3)t=3;else if(MOB_S.thermo>=2)t=Math.max(t,2);return t;}
function mobPalCapJoueur(){let c=DPR_CAP;try{c=dprPlafond(SAVE.d.q==='fast');}catch(e){}return c;} /* le plafond du réglage du joueur (RAPIDE 1, NETTE ce que le départ de P2 en fait) */
function mobPalCapPlein(){if(mobNiv()>=2)return mobPalCapJoueur(); /* (2026-11-14) sous profil : le plafond du niveau */let c=1.5;try{c=SAVE.d.q==='fast'?1:Math.min(devicePixelRatio,PAL.b('dprNetCap',1.5));}catch(e){}return c;} /* « vers l'ordinateur » : le plafond de la NETTE d'avant la passe 3 */
function mobPalVoulu(t){ /* ce qu'on pose à ce palier : TOUTES les clés (le départ de P2, puis les écarts du palier) pour un seul appel à imgRegle ; null au palier 0 (c'est `reset`) */
  if(!t)return null;const P=t>0?mobPalTable()[t]:MOB_RA[-t],o=Object.assign({dpr:mobPalCapJoueur()},MOB_P0);
  if(t>0&&gdxOn()){ /* (LE GOUVERNEUR DOUX) relatif au départ du niveau, N1 compris ; la résolution ne bouge qu'à critical (`dk`) */
    if(P.dk)o.dpr=o.dpr*P.dk;
    if(P.mips!=null)o.mips=P.mips<0?Math.max(1,o.mips+P.mips):P.mips;
    if(P.ombre!=null)o.ombre=P.ombre<0?mobOmbreBas(o.ombre,-P.ombre):P.ombre;
    for(const k of ['halo','ciel','stries'])if(P[k]!=null)o[k]=P[k];
    return o;}
  if(t>0&&mobNiv()>=2){ /* (2026-11-14, LE GOUVERNEUR PART DU NIVEAU) les écarts du palier, relatifs au départ du niveau */
    if(P.dk)o.dpr=o.dpr*(((t===2||(t===3&&MOB_S.capteur&&MOB_LONG.on))&&PRF.T.n[mobNiv()].dkS)||P.dk); /* (2026-11-14, pilote) à serious le N4 descend à 70 % (PRF.T.n[4].dkS), les autres niveaux à 80 % ; sans capteur aussi (palier 2 de la dose) */
    if(P.mips!=null)o.mips=P.mips<0?Math.max(1,o.mips+P.mips):P.mips;
    if(P.ombre!=null)o.ombre=P.ombre<0?mobOmbreBas(o.ombre,-P.ombre):P.ombre;
    for(const k of ['halo','ciel','stries'])if(P[k]!=null)o[k]=P[k];
    return o;}
  for(const k of ['dpr','halo','mips','ombre','ciel','stries'])if(P[k]!=null)o[k]=P[k];
  if(o.dpr==='cap')o.dpr=mobPalCapPlein();else o.dpr=Math.min(o.dpr,mobPalCapJoueur());
  return o;}
function mobPalApplique(t,repose){ /* UN seul appel à imgRegle par bascule (chaque appel refait applyDPR : cibles du compositeur, halo, ombre) ; `repose` : le même palier sur un autre niveau */
  const B=mobPalBase(),P=t>0?mobPalTable()[t]:null,baisse=!repose&&t<MOB_P.t&&t>=0,o=mobPalVoulu(t),nv=mobNiv();
  mobPalEcrit('ventK',B.ventK*((P&&P.k)||1));mobPalEcrit('emiK',B.emiK*((P&&P.k)||1));
  const kMax=qlBornes().kMax,q0=PAL.b('qlMin',0),qn=P?Math.min(kMax,Math.max(B.qlMin,P.ql)):B.qlMin;mobPalEcrit('qlMin',qn);
  if(!baisse&&gdxOn()&&qn<q0&&QL.k<=q0)QL.k=qn; /* (LE GOUVERNEUR DOUX) fair → serious : le plancher de serious est plus bas (cran 2, le halo entier) ; l'échelle tenue par l'ancien plancher le suit — pas celle que la mesure a baissée */
  if(baisse)QL.k=Math.min(QL.k,(nv>=2||gdxOn())?(t===0?PAL.bT('imgQlDepart',PAL.b('qlDepart',0),'c'):Math.min(kMax,P.ql)):t===0?1:t===1?3:kMax); /* descente : l'échelle se desserre d'un coup — posé AVANT imgRegle, dont le qlPose le prend (sous profil : le cran de départ du niveau, ou le plancher du palier) */
  MOB_P.t=t;MOB_P.nv=nv;if(!repose){MOB_P.chg=performance.now();MOB_P.s.length=0;}MOB_P.n++;
  if(o)window.imgRegle(o);else window.imgRegle('reset');} /* imgRegle rejoue qlPose(QL.k) : le plancher, le cran et le plafond se posent ensemble */
function mobPalSain(){ /* l'image de cette seconde : le travail de l'image (CAD.w, lissé sur ~10 images) et la synchro (p75 de l'échelle QL, ramené à une image d'écran) */
  return {w:CAD.w,ok:QLR.p75<=MOB_R.p75};}
function mobPalMediane(a){const v=a.slice().sort(function(x,y){return x-y;});return v[v.length>>1];}
function mobPalTick(now){ /* à chaque image d'écran (appelé par mobGouvTick) ; ne travaille qu'une fois par seconde */
  if(!MOB_PALS||typeof window.imgRegle!=='function'||now-MOB_P.tk<1000)return;MOB_P.tk=now;
  const enCourse=started&&running&&!gameOver&&!garageOn&&!paused;
  if(MOB_POLY)window.__ccPoly.on=MOB_P.t>=2&&enCourse; /* (voir MOB_POLY) */
  if(MOB_S.capteur){if(MOB_S.thermo<2)MOB_LONG.n=0;else if(enCourse)MOB_LONG.n++;} /* (voir LE SÉRIEUX QUI DURE) une fois par seconde */
  if(!enCourse){MOB_P.s.length=0;MOB_P.mal=0;if(!started||gameOver||garageOn)MOB_P.non=false;}
  const c=mobPalCible();
  if(MOB_S.neuf){MOB_S.neuf=false;if(c!==MOB_P.t)mobPalApplique(c);MOB_P.non=false;return;} /* (2026-11-10) le capteur vient de parler pour la 1re fois : le palier que la dose avait posé tombe d'un coup sur celui de l'état réel, sans la descente d'une minute par palier */
  if(c>Math.max(MOB_P.t,0)){mobPalApplique(c);MOB_P.non=true;return;} /* la dose monte (ou un palier négatif doit tomber au 0 / 1) : tout de suite */
  if(c<MOB_P.t&&MOB_P.t>0){if(now-MOB_P.chg>=60000)mobPalApplique(MOB_P.t-1);return;} /* descente lente, un palier à la fois */
  if(MOB_P.t>0){if(MOB_P.nv!==mobNiv()){mobPalApplique(MOB_P.t,true);return;} /* (2026-11-14) le niveau du profil a changé (BASSE ⇄ HAUTE) : le palier se repose sur le nouveau */if(DPR_CAP>mobPalVoulu(MOB_P.t).dpr+.001)window.imgRegle({dpr:mobPalVoulu(MOB_P.t).dpr});return;} /* un changement de réglage (RAPIDE/NETTE) a rendu le plafond : on le reprend */
  if(MOB_P.t<0&&mobNiv()>=2){mobPalApplique(0);return;} /* (2026-11-14) sous profil, pas de remontée au-dessus du niveau */
  if(!enCourse||!MOB_R.on||mobNiv()>=2)return;
  const e=mobPalSain();MOB_P.s.push(e);if(MOB_P.s.length>MOB_R.fen)MOB_P.s.shift();
  if(MOB_P.t<0){ /* remonté : la fluidité manque 5 s de suite → retour au départ, sans remonter dans cette course */
    MOB_P.mal=(e.w>MOB_R.wMax||!e.ok)?MOB_P.mal+1:0;
    if(MOB_P.mal>=MOB_R.mal){MOB_P.mal=0;mobPalApplique(0);MOB_P.non=true;return;}}
  if(MOB_P.non||MOB_P.t<=-MOB_RA.length+1||MOB_S.D>=MOB_R.frais||MOB_S.thermo>=1||MOB_P.s.length<MOB_R.fen)return;
  const W=MOB_P.s.map(function(x){return x.w;});
  if(MOB_P.s.every(function(x){return x.ok;})&&mobPalMediane(W)<MOB_R.wMed&&Math.max.apply(null,W)<MOB_R.wMax)mobPalApplique(MOB_P.t-1);} /* chaque cran redemande ses 60 s (mobPalApplique vide la fenêtre) */
window.dbgGouvPaliers=function(){const B=MOB_P.b;return {actif:MOB_PALS,doux:gdxOn(),long:MOB_LONG.n,branche:mobBranche(),palier:MOB_P.t,niveau:mobNiv(),voulu:MOB_P.t?mobPalVoulu(MOB_P.t):null,bascules:MOB_P.n,dprCap:+DPR_CAP.toFixed(2),cran:QL.k,qlMin:PAL.b('qlMin',0),ventK:PAL.b('ventK',1),emiK:PAL.b('emiK',1),base:B,seuils:MOB_PP.map(function(p){return p.d;}),remonte:MOB_R.on,poly:MOB_POLY?Object.assign({},window.__ccPoly):null,fenetre:MOB_P.s.length,interdit:MOB_P.non,img:typeof window.imgRegle==='function'?window.imgRegle():null};};
window.dbgGouvLong=function(s){if(s!=null)MOB_LONG.n=Math.max(0,+s||0);return MOB_LONG.n;}; /* (2026-11-14, banc du GOUVERNEUR DOUX) les secondes de serious cumulées en course (LE SÉRIEUX QUI DURE) */
