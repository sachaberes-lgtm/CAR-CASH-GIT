/* ====================== LA NETTETÉ EN DERNIER — l'échelle de qualité QL (2026-09-27, passe perf iPhone) ======================
   Sacha joue en NETTE (DPR 1,5 sur iPhone 13 Pro) et la voyait fondre « surtout quand on s'envole » : dès que l'image tirait (> 19 ms),
   la résolution adaptative sabrait la RÉSOLUTION d'abord — la seule chose qu'on voit sur chaque pixel — jusqu'à 0,5, pendant que les
   paliers MOYEN/BAS (ombre, bloom) attendaient 3 à 5 s puis tombaient POUR TOUTE LA SESSION. L'ordre est retourné, et tout se RÉTABLIT.
   UNE échelle, un seul curseur `QL.k` : chaque cran enlève la chose la MOINS visible qui reste, et on remonte dans l'ordre inverse
   (la netteté revient donc la PREMIÈRE). Tous les crans sont sans recompilation (tailles de cibles, uniformes, drapeaux) :
     1 · l'ombre ne se redessine qu'une image sur deux quand la caisse vole LOIN de toute dalle (> 14 m : l'ombre qu'elle jette est à des
         dizaines de mètres, le décalage d'une image ne se voit pas — et c'est EN VOL que la passe d'ombre coûte double) ;
     2 · carte d'ombre 768 (PCF doux : le bord est déjà flouté sur ~3 texels, 6,6 → 8,9 cm par texel ne se lit pas) ;
     3 · bloom à ¾ de sa résolution (c'est un flou : il a déjà perdu ses détails) ;
     4 · carte d'ombre 512 ;
     5 · plus de flou radial au boost (le champ, les filés et le tunnel sombre gardent la sensation) ;
     puis la RÉSOLUTION, par petits crans jusqu'au PLANCHER NET — en NETTE 1,25 : ~70 % des pixels de 1,5 ; sur un iPhone de 390 pt,
     un pixel 3D y fait 0,8 pt, plus fin que le plus fin des traits dessinés (liserés néon, pointillés ~2 px), et le FXAA + le grain
     masquent l'écart ; sous 1,2 la différence avec le HUD (DOM, toujours net) commence à se lire. En RAPIDE, pas de plancher net :
     l'échelle descend jusqu'à DPR_MIN comme avant — mais seulement après les cinq crans invisibles.
     Sous le plancher net, puis le bloom éteint en tout dernier : réservés à l'EFFONDREMENT (> 24 ms, 6 s d'affilée, au plancher, hors
     chargement / onglet / cadence 30 Hz). C'est l'ancien palier BAS — mais il se RELÈVE quand la marge revient.
   ANTI-YOYO (repris de la résolution v3) : on ne descend que « calme » (ni reconstruction de zone, ni retour d'onglet, ni 30 Hz
   imposé) ; on remonte d'UN cran après ~4,5 s de marge (< 17,8 ms ou cadence 30 Hz) ; un cran remonté qui retombe en < 6 s
   devient un MUR pendant 45 s. `dbgPin(true)` fige l'échelle ; `dbgQual(k)` la force (banc) ; `?perf=1` l'affiche à l'écran. */
const QLR={a:new Float32Array(60),s:new Float32Array(60),i:0,n:0,p50:16,p75:16,p90:16, // (tour 2) les 60 dernières durées d'image, et leurs centiles
  t0:0,sN:0,sA:[],vrai:0,vraiT:0,px:new Uint8Array(4),S:{pend:0},dern:null,cg:null,sync:0}; // (tour 2) LA SONDE : le vrai coût d'une image (voir qlSonde) ; sync = banc seulement (dbgSonde('sync') rejoue l'ancienne sonde bloquante)
/* LA SONDE (2026-09-28) — MESURÉ SUR L'IPHONE 13 PRO DE SACHA (banc ?banc=1, reçu par mail) : une image lui coûte 8 à 13 ms en NETTE,
   mais l'écran n'en montre que 30 par seconde, PILE, partout — même à DPR 1,0. Ce n'était pas le jeu qui ramait : c'était l'iPhone qui
   bridait Safari à 30 i/s (mode économie d'énergie, ou surchauffe). Et la règle de qualité, qui ne voyait que « 33 ms par image »,
   sacrifiait la netteté pour rien — le « mode pixel ». Désormais, avant de baisser quoi que ce soit, on MESURE le vrai coût : cinq
   images synchronisées (un `readPixels` d'un pixel oblige le processeur à attendre la puce : le temps mesuré est ce que coûte vraiment
   l'image, hors de la grille de l'écran). Sous 14,5 ms, le téléphone POURRAIT tenir 60 i/s : c'est l'écran qui bride, on ne touche à rien
   (et on remonte ce qui aurait été baissé). La sonde ne tourne que quand des images sont ratées, au plus toutes les 8 s. */
/* (2026-10-08, Léo : « le jeu rame ») LA SONDE NE FIGE PLUS L'IMAGE — là où la puce a un CHRONOMÈTRE. MESURÉ au banc (course de 40 s,
   Chrome sur Mac M2) : chaque `readPixels` de la sonde obligeait le processeur à ATTENDRE que la puce ait tout fini — 15 lectures, 510 ms
   de jeu gelé, jusqu'à 120 ms d'un coup. Et elle ne se réveille que quand des images sont déjà ratées : sur une machine chargée, elle
   aggravait l'à-coup qu'elle venait mesurer. Là où le navigateur offre `EXT_disjoint_timer_query_webgl2` (Chrome, Edge, Android), la
   puce chronomètre elle-même son travail de l'image (une requête TIME_ELAPSED autour de la boucle) et rend le résultat quelques images
   plus tard, sans que personne n'attende ; le coût de l'image = le travail du processeur (début → fin de la boucle) + celui de la puce.
   Même seuil (14,5 ms), même décision, zéro gel. Ailleurs (Safari, iPhone) : l'ancienne lecture synchrone, INCHANGÉE.
   ⚠ Essayé d'abord : une barrière (`fenceSync`) guettée entre deux tâches — plus de gel, mais le signal « fini » arrive en retard dans
   Chrome : ~21 ms lus au calme là où l'ancienne sonde lisait ~8 → la règle aurait baissé la netteté à tort. Écarté. Aucun pixel ne change. */
const QLT={ext:null,ok:undefined,q:null,rate:0};
function qlChrono(g9){ if(QLT.ok===undefined){try{QLT.ext=renderer.capabilities.isWebGL2?g9.getExtension('EXT_disjoint_timer_query_webgl2'):null;}catch(e){QLT.ext=null;}QLT.ok=!!QLT.ext;}
  return QLT.ok&&!QLR.sync;}
function qlSondeArme(){QLR.sN=5;QLR.sA.length=0;QLR.S={pend:0};} // une SÉRIE : cinq images mesurées
function qlSondeFin(){ if(QLR.sN<=0&&QLR.S.pend<=0&&QLR.sA.length){const s9=QLR.sA.slice().sort((a,c)=>a-c);QLR.dern=s9;QLR.vrai=s9[s9.length>>1];QLR.vraiT=performance.now();QLR.sA.length=0;}}
function qlSondeDebut(){ // en TÊTE de boucle, sonde armée : la puce déclenche son chrono
  try{const g9=renderer.getContext();if(!qlChrono(g9))return;
    if(QLT.q){g9.endQuery(QLT.ext.TIME_ELAPSED_EXT);g9.deleteQuery(QLT.q);QLT.q=null;} // l'image d'avant s'est interrompue (erreur avalée) : ce chrono-là ne vaut rien
    const q=g9.createQuery();if(!q)return;g9.beginQuery(QLT.ext.TIME_ELAPSED_EXT,q);QLT.q=q;}
  catch(e){QLT.ok=false;QLT.q=null;}}
function qlSonde(){ try{ const g9=renderer.getContext();
  if(QLT.q){const q=QLT.q,S=QLR.S,cpu=performance.now()-QLR.t0,t1=performance.now();QLT.q=null;g9.endQuery(QLT.ext.TIME_ELAPSED_EXT);QLR.sN--;S.pend++;
    const pas=function(){let av=false;try{av=g9.getQueryParameter(q,g9.QUERY_RESULT_AVAILABLE);}catch(e){}
      if(!av&&performance.now()-t1<1500){setTimeout(pas,8);return;} // le résultat arrive quelques images plus tard : on repasse, sans attendre
      let gpu=null;try{if(av&&!g9.getParameter(QLT.ext.GPU_DISJOINT_EXT))gpu=g9.getQueryParameter(q,g9.QUERY_RESULT)/1e6;g9.deleteQuery(q);}catch(e){}
      S.pend--;if(gpu==null&&++QLT.rate>=5)QLT.ok=false; // une puce qui ne rend jamais son chrono : retour à l'ancienne sonde
      if(S!==QLR.S)return;if(gpu!=null){QLR.sA.push(Math.min(120,cpu+gpu));(QLR.cg||(QLR.cg=[])).push([+cpu.toFixed(1),+gpu.toFixed(1)]);if(QLR.cg.length>10)QLR.cg.shift();}qlSondeFin();};
    setTimeout(pas,8);return;}
  if(qlChrono(g9))return; // chrono pas encore lancé (la sonde vient d'être armée en cours d'image) : il partira à l'image suivante
  renderer.setRenderTarget(null);g9.readPixels(0,0,1,1,g9.RGBA,g9.UNSIGNED_BYTE,QLR.px);QLR.sN--;QLR.sA.push(performance.now()-QLR.t0);qlSondeFin();
  }catch(e){QLR.sN=0;try{if(QLT.q){renderer.getContext().endQuery(QLT.ext.TIME_ELAPSED_EXT);QLT.q=null;}}catch(e2){QLT.ok=false;}} }
const QL={k:0,mur:0,murT:0,roseT:0,up:0,efT:0,effondre:false,fr:0,N_EFF:5,ombre0:sun.shadow.mapSize.x,essai:null,plafK:0,plafT:0,
  nom:['ombre en vol ½','ombre 768','bloom ¾','ombre 512','flou radial']};
/* (2026-09-27, tour 2 — « on repasse en mode pixel assez vite après avoir lancé ») LE MODE PIXEL, C'ÉTAIT LE PLANCHER : sous l'effondrement,
   l'échelle descendait jusqu'à DPR_MIN 0,5 — un pixel 3D pour six pixels d'écran sur un iPhone. Désormais DEUX planchers par réglage :
   le NET (où l'on s'arrête en régime normal) et le BAS (qu'on ne franchit JAMAIS, même effondré) — NETTE 1,25 / 1,0 · RAPIDE 0,85 / 0,7.
   Sous 1,0 en NETTE, le joueur a choisi la netteté : on garde l'image, quitte à perdre des images par seconde. */
/* NETTE PAR PALIER (2026-10-14, passe perf mobile — GRAPHISME : « l'iPhone tourne en RAPIDE par défaut, DPR 1 : flou sur un Retina »).
   Le départ d'une course se fait AU PLAFOND (qlDepart ≤ 5 = les crans invisibles : qlDpr rend `cap`) ; pl/bas ne sont que les PLANCHERS.
   Pixels dessinés en course = largeur × hauteur (points CSS) × curDPR² ; au départ curDPR = DPR_CAP = min(densité, RAPIDE 1 · NETTE 1,5).
   NETTE d'avant sur un iPhone 7 (667×375 pt) : 1,5 → 563 000 px, 2,25 × RAPIDE, au-dessus du budget de l'ANCIEN (vhdPx 0,45 M) avant même
   la première image. Par palier [ANCIEN, MOYEN, RÉCENT] (3e colonne = avant, identique) :
     · dprNetCap : le PLAFOND en NETTE — ANCIEN 1,25 (iPhone 7 : 391 000 px · 8 Plus / X : 476 000 ≈ le budget 0,45 M) ; MOYEN 1,35
       (iPhone 11 : 676 000 px · XS : 555 000 · SE 2 : 456 000) ;
     · dprNet / dprNetBas : le plancher NET (régime normal) et le plancher BAS (effondrement) — ANCIEN 1,0 / 0,85 (iPhone 7 : 250 000 px
       = le départ RAPIDE / 181 000 = le plancher net RAPIDE) ; MOYEN 1,15 / 0,9 (iPhone 11 : 491 000 / 300 000) ;
     · qNetDefaut : 1 = une sauvegarde qui n'a JAMAIS choisi (SAVE.d.qChoisi absent ou 0) part en NETTE sur ce palier. Tout à 0 tant que
       Sacha n'a pas tranché : RAPIDE reste le défaut partout. RAPIDE n'est touché par AUCUNE de ces lignes. `dbgNette()` décrit. */
PAL.B.dprNetCap=[1.25,1.35,1.5];PAL.B.dprNet=[1,1.15,1.25];PAL.B.dprNetBas=[.85,.9,1];/* (2026-10-14 11 h 30, passe perf mobile) NETTE PAR DÉFAUT sur le palier RÉCENT seulement (sauvegarde neuve ou jamais choisie) : mesuré (perf/mesures/v10.log, iPhone émulé) — au palier 2 NETTE = 2,25× les pixels, la puce tient (le contrôle QL redescend de lui-même s il faut) ; paliers 0-1 restent RAPIDE (vieux iPhone fluides), NETTE au choix. */PAL.B.qNetDefaut=[0,0,1];
/* (2026-10-14, passe perf mobile) ⚠ `typeof SAVE` NE PROTÈGE PAS d'un `const` encore en zone morte : au chargement, le départ au bon cran
   (`qlPose(qlDepart)`, plus bas) levait « Cannot access 'SAVE' before initialization », avalé par son try — les paliers 0-1 ne partaient
   jamais à leur cran (MOYEN au cran 0 au lieu de 2, ANCIEN au 4 de qlMin au lieu de 5). Avant la sauvegarde = RAPIDE. Palier 2 : inchangé. */
function qlNet(){try{return !!(SAVE.d&&(SAVE.d.q==='net'||SAVE.d.q==='haute'));}catch(e){return false;}}
/* L'IMAGE EN AUTOMATIQUE, SUR TÉLÉPHONE SEULEMENT (2026-10-14, session OPTIMISATION — Sacha, relayé par PILOTAGE : « oui, en automatique » :
   sur TÉLÉPHONE et seulement quand ça rame, le jeu baisse un peu le rendu pour rester fluide ; sur PC, et quand tout va bien, rien ne change ;
   le réglage IMAGE garde la main, et si le joueur choisit HAUTE, on ne baisse jamais). L'échelle QL faisait déjà le travail (crans les moins
   visibles d'abord — ombre, halo, puis la résolution EN DERNIER : verdict du 27/09 contre le « mode pixel » —, sonde contre la bride à 30 i/s,
   remontée sans yoyo). Elle ne décide plus que : sur un VRAI téléphone (TEL_NATIF : l'ordi, colonne comprise, ne bouge plus), en COURSE
   (ni menus, ni atelier, ni photos), et pas en HAUTE. IMAGE : RAPIDE → NETTE → HAUTE (RAPIDE et NETTE restent automatiques ; HAUTE = la
   résolution NETTE, tout au plus haut, jamais baissé). */
function qHaute(){try{return !!(SAVE.d&&SAVE.d.q==='haute');}catch(e){return false;}}
function qlAuto(){return TEL_NATIF&&!qHaute()&&started&&!gameOver;}
function qSuivant(q){return q==='fast'?'net':q==='net'?'haute':'fast';}
function qLbl(){const q=SAVE.d.q;return q==='haute'?'HAUTE':q==='net'?'NETTE':'RAPIDE';}
function qlBornes(){ // les crans de résolution se recalculent (RAPIDE/NETTE, écran)
  const cap=DPR_CAP,net=qlNet(),pl=Math.min(cap,net?PAL.b('dprNet',1.25):.85),bas=Math.min(pl,Math.max(DPR_MIN,net?PAL.b('dprNetBas',1):.7)), // (2026-10-14, passe perf mobile) planchers NETTE par palier — voir NETTE PAR PALIER
        nA=Math.max(0,Math.ceil((cap-pl)/.08-1e-6)),nB=Math.max(0,Math.ceil((pl-bas)/.08-1e-6)),kNet=QL.N_EFF+nA,kBas=kNet+nB;
  return {cap,pl,bas,nA,nB,kNet,kBas,kMax:kBas+1};}
function qlDpr(k,b){ // la résolution que vaut le cran k
  if(k<=QL.N_EFF)return b.cap;
  if(k<=b.kNet)return b.cap-(b.cap-b.pl)*(k-QL.N_EFF)/Math.max(1,b.nA);
  return Math.max(b.bas,b.pl-(b.pl-b.bas)*(k-b.kNet)/Math.max(1,b.nB));}
function qlPose(k){ const b=qlBornes();k=Math.max((VHD.on||QL.force)?0:PAL.b('qlMin',0),Math.min(b.kMax,k|0));if(qHaute())k=0;QL.k=k; /* (OPTIMISATION) HAUTE : jamais baissé */ // (2026-10-14, passe perf mobile) le cran sous lequel ce palier ne remonte pas — voir LE DÉPART AU BON CRAN
  const om=VHD.on?VHD.ombre:k>=4?512:k>=2?768:QL.ombre0; // (2026-09-28) l'ACCUEIL en haute définition a sa carte d'ombre à lui (voir VHD)
  if(sun.shadow.mapSize.x!==om){if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}sun.shadow.mapSize.set(om,om);} // recrée la carte, zéro recompilation
  const br=k>=3?.75:1;if(br!==BLOOM_RES){BLOOM_RES=br;if(bloomPass&&bloomPass._W)bloomPass.setSize(bloomPass._W,bloomPass._H);}
  FLOU_OK=k<5;
  if(bloomPass)bloomPass.enabled=!REDUCED_MOTION&&k<b.kMax;
  if(k<1&&renderer.shadowMap.autoUpdate===false)renderer.shadowMap.autoUpdate=true;
  const d=VHD.on?VHD.dpr:Math.min(qlDpr(k,b),devicePixelRatio);if(Math.abs(d-curDPR)>.001){curDPR=d;applyDPR();}
  QUAL_MED=k>0;QUAL_LOW=!!bloomPass&&!bloomPass.enabled&&!REDUCED_MOTION;return k;}
function qlReprise(){ // RAPIDE⇄NETTE : le choix du joueur rend la pleine résolution tout de suite (les crans invisibles restent, l'échelle redescendra si besoin)
  QL.mur=0;QL.murT=0;QL.roseT=0;QL.up=0;QL.efT=0;QL.effondre=false;QL.essai=null;QL.plafT=0;curDPR=-1;qlPose(Math.min(QL.k,QL.N_EFF));}
window.dbgNette=function(){ const b=qlBornes(),pt=innerWidth*innerHeight,S9=(typeof SAVE!=='undefined'&&SAVE.d)||{}; // (2026-10-14, passe perf mobile) banc : la définition et ce qu'elle coûte en pixels — voir NETTE PAR PALIER
  return {palier:PAL.n,q:S9.q,choisi:S9.qChoisi|0,netDefaut:PAL.b('qNetDefaut',0),dpr:+devicePixelRatio.toFixed(2),cap:+DPR_CAP.toFixed(2),pl:+b.pl.toFixed(2),bas:+b.bas.toFixed(2),
    curDPR:+curDPR.toFixed(2),cran:QL.k,kNet:b.kNet,kBas:b.kBas,vhd:VHD.on,px:Math.round(pt*curDPR*curDPR),pxCap:Math.round(pt*b.cap*b.cap),pxPl:Math.round(pt*b.pl*b.pl),pxBas:Math.round(pt*b.bas*b.bas),
    budgets:{dprNetCap:PAL.B.dprNetCap,dprNet:PAL.B.dprNet,dprNetBas:PAL.B.dprNetBas,qNetDefaut:PAL.B.qNetDefaut}};};
/* L'ACCUEIL EN HAUTE DÉFINITION — VHD (2026-09-28, Sacha : « est-ce que tu peux pousser les graphismes au max, juste pour l'écran
   d'accueil »). Toute l'échelle QL est taillée pour la COURSE (60 i/s sous la pluie de particules, à 1 400 km/h) ; la vitrine, elle,
   c'est une caisse arrêtée sur une route, sous un ciel — une AFFICHE. Tant que l'accueil est à l'écran (vitrine qui tourne : ni
   garage, ni course), on y met tout ce que la machine a :
     · la RÉSOLUTION PLEINE de l'écran — et au-delà sur l'ordi : sur-échantillonnée ×1,5 (anticrénelage par le haut), sous un
       budget de pixels (8,3 M = la 4K sur l'ordi, 3,2 M = un iPhone plein sur téléphone, où l'on s'arrête à la densité de l'écran).
       ⚠ Dans la COLONNE de l'ordi, `devicePixelRatio` = le zoom du cadre (2,3 sur 1 920 px) : le jeu d'ordinaire calculait sa 3D à
       1 ou 1,5 et l'ÉTIRAIT — c'est le gros du flou que l'on voyait sur PC ;
     · l'OMBRE en carte 4096 (2048 sur téléphone) au lieu de 1024-1280 : la caisse pose sur le bitume avec une ombre au trait ;
     · le FILTRAGE de la route et de sa peinture au maximum de la carte (×16) — on la regarde rasante, c'est là qu'elle se lit ;
     · l'échelle QL au cran 0 (bloom plein, flou, ombre pleine) et MISE EN VEILLE : c'est VHD qui tient la résolution.
   FILET : si la machine ne suit pas (plus d'un quart des images au-delà de 22 ms, hors cadence 30 Hz imposée), la résolution de
   la vitrine descend d'un cran (×0,8) toutes les 1,5 s, jamais sous le plafond ordinaire. En sortant (garage, départ de course),
   tout revient À L'IDENTIQUE : l'échelle reprend le cran qu'elle avait, sa carte d'ombre et sa résolution. Les bascules tombent
   sous le volet (ecranWipe) : la réallocation des cibles ne se voit pas. `?hd=0` coupe le mode (comparer) ; `dbgVHD()` le décrit. */
const VHD={on:false,dpr:1,max:1,ombre:2048,t:0,k0:0,lT:0,bT:0,sT:0,mur:0,murT:0,monteT:0,bride:0,log:[],bas:0,haut:0,off:/[?&]hd=0/.test(location.search)}; // (2026-10-13) max = la pleine définition de cet écran ; lT/bT = lenteur/marge TENUES ; sT = sonde en cours ; mur = le cran qui vient d'échouer (voir LE FILET v2)
function vhdDpr(){ const px=Math.max(1,innerWidth*innerHeight),bud=TEL_NATIF?PAL.b('vhdPx',3.2e6):8.3e6; // (2026-10-14) le budget du téléphone se taille sur son palier (voir LE DÉPART AU BON CRAN)
  return Math.max(DPR_CAP,Math.min(devicePixelRatio*(TEL_NATIF?1:1.5),Math.sqrt(bud/px),4));}
function vhdAniso(on){ const m=renderer.capabilities.getMaxAnisotropy(),n=on?m:Math.min(IS_MOBILE?4:8,m);
  for(const t of [ASPH_TEX,LIGNE_TEX])if(t&&t.anisotropy!==n){t.anisotropy=n;t.needsUpdate=true;}}
function vhdBascule(on){ if(VHD.off||on===VHD.on)return;
  if(on){VHD.k0=QL.k;VHD.dpr=VHD.max=vhdDpr();VHD.lT=VHD.bT=VHD.sT=0;VHD.ombre=Math.min(TEL_NATIF?PAL.b('vhdOmbre',2048):4096,renderer.capabilities.maxTextureSize);VHD.t=0;VHD.on=true;curDPR=-1;qlPose(0);}
  else{VHD.on=false;curDPR=-1;qlPose(VHD.k0);}
  vhdAniso(on);}
function vhdMonte(now,vrai){ // (2026-10-13, LE FILET v2) un cran de netteté qui revient (×1,25), jamais au-delà de l'écran ni vers le cran qui vient d'échouer ;
  // vrai = le coût mesuré par la sonde (ms) : on ne monte que si l'image agrandie (coût ∝ pixels, pessimiste) tient encore sous 14 ms
  const d9=Math.min(VHD.max,VHD.dpr*1.25);if(VHD.murT&&now-VHD.murT<45000&&d9>VHD.mur-.02)return false;
  if(d9<VHD.dpr+.02||(vrai&&vrai*(d9/VHD.dpr)*(d9/VHD.dpr)>14))return false;VHD.dpr=d9;VHD.haut++;VHD.monteT=now;vhdNote(now,'monte');curDPR=-1;qlPose(0);return true;}
function vhdNote(now,quoi){VHD.log.push([Math.round(now/100)/10,quoi,+VHD.dpr.toFixed(2),+QLR.vrai.toFixed(1),+QLR.p75.toFixed(1),+QLR.p90.toFixed(1)]);if(VHD.log.length>12)VHD.log.shift();} // (banc) dbgVHD().journal
addEventListener('resize',function(){if(VHD.on){VHD.dpr=VHD.max=vhdDpr();VHD.murT=0;curDPR=-1;qlPose(0);}}); // téléphone tourné, fenêtre retaillée : le budget de pixels se recalcule
/* LE DÉPART AU BON CRAN, PAR PALIER (2026-10-14, passe perf mobile — voir PAL). MESURÉ (iPhone 7 émulé 667×375, avant) : l'accueil était
   calculé en 1067×600 avec une carte d'ombre 2048 (le budget VHD « téléphone » = 3,2 M de pixels, celui d'un iPhone 15 Pro), l'écran de fin
   de partie pareil — avec le niveau entier derrière (~1 M de triangles) —, puis chaque course repartait du cran 0 (ombre 1024, halo plein,
   flou radial) et l'échelle QL mettait des dizaines de secondes de saccades à redescendre, un cran toutes les 1,1 s. À CHAQUE partie.
   Un vieux téléphone commence désormais LÀ OÙ IL FINISSAIT :
     · qlDepart : le cran posé au démarrage — ANCIEN : les 5 allègements « invisibles » d'emblée (ombre 512, halo ¾, plus de flou radial) ;
       MOYEN : ombre ½ en vol + ombre 768 ; RÉCENT : cran 0, comme avant. L'échelle descend toujours plus bas si besoin ;
     · qlMin : le cran sous lequel l'échelle ne REMONTE pas. Sur l'ANCIEN, 4 (ombre 512 + halo ¾ tenus) : chaque remontée réalloue une carte
       d'ombre et des cibles — un à-coup — pour les reperdre dix secondes plus tard au premier envol. Le flou radial, lui, peut revenir ;
     · vhdPx / vhdOmbre : l'accueil haute définition garde sa belle caisse (Léo, 10/10) mais à la mesure de la puce — ANCIEN : 0,45 M de
       pixels (≈ densité 1,3 sur un iPhone 7) et ombre 1024 ; MOYEN et RÉCENT : 1,4 M et 2048 (3,2 M jusqu'au 20/10 : accrocs au garage sur iPhone 15). Le FILET de VHD
       (baisse ×0,8 si l'image traîne) reste par-dessus ;
     · vhdMort : l'écran de fin de partie en haute définition ? RÉCENT seulement — sur les deux autres il garde la résolution et les crans
       de la course (plus de réallocation des cibles et de la carte d'ombre à chaque mort ET à chaque REJOUER).
   `dbgQual(k)` (banc) passe outre qlMin. `?palier=2` rend exactement le comportement d'avant. */
PAL.B.qlDepart=[5,2,0];PAL.B.qlMin=[4,0,0];PAL.B.vhdPx=[.45e6,1.4e6,1.4e6]; /* (2026-10-20, Léo) MOYEN et RÉCENT plafonnés à 1,4 M (densité ~2 sur iPhone 15) : à 3,2 M (densité 3) le garage et la boutique tombaient à 41-58 i/s avec des accrocs de 200-700 ms, mesuré sur l'iPhone 15 de Léo le 16/10 ; c'est le réglage de son appli */PAL.B.vhdOmbre=[1024,2048,2048];PAL.B.vhdMort=[0,0,1];
if(PAL.b('qlDepart',0)>0){try{qlPose(PAL.b('qlDepart',0));}catch(e){}}
window.dbgVHD=function(){return {on:VHD.on,dpr:+curDPR.toFixed(2),max:+VHD.max.toFixed(2),baisses:VHD.bas,remontees:VHD.haut,bride:VHD.bride?Math.round((performance.now()-VHD.bride)/1000)+' s':null,mur:(VHD.murT&&performance.now()-VHD.murT<45000)?+VHD.mur.toFixed(2):null,vrai:QLR.vraiT?+QLR.vrai.toFixed(1):null,journal:VHD.log,dprEcran:+devicePixelRatio.toFixed(2),plafondCourse:+DPR_CAP.toFixed(2),
  px:Math.round(innerWidth*innerHeight*curDPR*curDPR),ombre:sun.shadow.mapSize.x,aniso:ASPH_TEX?ASPH_TEX.anisotropy:null,bloom:bloomPass?(bloomPass.enabled?BLOOM_RES:0):null,crans:QL.k};};
window.dbgDPR=function(d,sansPique){RESPIN=true;curDPR=+d;applyDPR();if(sansPique&&acesPass&&acesPass.uniforms.uSharp)acesPass.uniforms.uSharp.value=0;return {dpr:curDPR,pique:acesPass&&acesPass.uniforms.uSharp?+acesPass.uniforms.uSharp.value.toFixed(3):null};}; // (tour 2) banc : une résolution, sans rien d'autre (fige l'échelle)
/* (2026-09-28, passe graphismes mobile) BANC : chaque petite technique s'éteint et se rallume À CHAUD (des uniformes : zéro recompilation),
   pour comparer la même image avec et sans. `dbgGfx({coeur:0,trame:0,pique:0})` = le rendu d'avant ; `dbgGfx()` décrit. */
window.dbgGfx=function(o){
  if(o){if(o.coeur!=null)GFX_U.uCoeur.value=o.coeur===true?1.16:(+o.coeur||1);if(o.glace!=null)GLACE.k=o.glace===true?1:+o.glace;
    if(o.cotonOpaque!=null&&COTON.mat){COTON.mat.transparent=!o.cotonOpaque;COTON.mat.depthWrite=true;}
    if(o.trame!=null&&acesPass)acesPass.uniforms.uTrame.value=o.trame?1/255:0;
    if(o.pivot!=null)POST_PIVOT=+o.pivot; // (2026-10-14, chaîne de couleur) le pivot du contraste, à chaud (.5 = l'image d'avant)
    if(o.haloNorme!=null&&bloomPass)bloomPass.norme=!!o.haloNorme; // (2026-10-14, chaîne de couleur) le halo à largeur d'écran constante, à chaud
    if(o.pique!=null&&acesPass){RESPIN=true;acesPass.uniforms.uSharp.value=+o.pique;}}
  return {coeur:GFX_U.uCoeur.value,glace:+ROAD_U.uGlace.value.toFixed(3),trame:acesPass?+(acesPass.uniforms.uTrame.value*255).toFixed(2):null,pique:acesPass?+acesPass.uniforms.uSharp.value.toFixed(3):null,dpr:curDPR,natif:devicePixelRatio,daSat:+DA.sat.toFixed(4)};};
window.dbgSonde=function(go){if(go){QLR.sync=go==='sync'?1:0;qlSondeArme();}return {vrai:+QLR.vrai.toFixed(2),age:QLR.vraiT?Math.round(performance.now()-QLR.vraiT):null,mesures:QLR.dern&&QLR.dern.map(function(x){return +x.toFixed(1);}),cpuGpu:QLR.cg,chrono:!!QLT.ok,sN:QLR.sN,enRoute:QLR.S.pend};}; // (banc) dbgSonde(1) lance la sonde, dbgSonde() la lit
window.dbgQual=function(k){ if(k!=null){QL.force=true;qlPose(k);RESPIN=true;} const b=qlBornes(); // dbgQual(k) force le cran k ET fige (dbgPin(false) relâche)
  const al=[];for(let i=0;i<QL.N_EFF&&i<QL.k;i++)al.push(QL.nom[i]);
  return {k:QL.k,kNet:b.kNet,kMax:b.kMax,plancher:+b.pl.toFixed(2),dpr:+curDPR.toFixed(3),effondre:QL.effondre,mur:(QL.murT&&performance.now()-QL.murT<45000)?QL.mur:0,
    ombre:sun.shadow.mapSize.x,ombreVolDemi:renderer.shadowMap.autoUpdate===false,bloom:bloomPass?(bloomPass.enabled?BLOOM_RES:0):null,flou:FLOU_OK,allege:al};};
/* LE MONITEUR (?perf=1 dans l'adresse) — une ligne de texte en haut à gauche, rien d'autre : ms/image (moyenne lissée + pire de la
   dernière seconde), images/s, résolution (actuelle/plafond), cran de l'échelle et ce qui est allégé. Éteint par défaut (charte :
   rien de développement à l'écran). Réécrit 4 fois par seconde, et seulement si le texte change. */
const PERF_MON=/[?&]perf=1/.test(location.search)?(function(){const e=document.createElement('div');e.id='perfMon';
  e.style.cssText='position:fixed;left:calc(var(--sL) + 6px);top:calc(var(--sT) + 4px);z-index:2147483000;pointer-events:none;'+
    'font:var(--f0)/1.6 var(--pix);color:var(--tx);background:var(--k1);padding:2px 5px;white-space:pre;max-width:70vw';
  document.body.appendChild(e);return {el:e,t:0,pire:0,txt:''};})():null;
/* (2026-10-14, session OPTIMISATION — Sacha : « la version mobile saccade, juste de quoi tester en bonne condition ») LE RELEVÉ DES À-COUPS :
   le moniteur ne disait que la dernière seconde. Il garde maintenant chaque image de plus de 50 ms depuis l'ouverture : combien (> 50,
   > 100, > 250 ms), et les 5 dernières avec ce qui se passait — l'écran (menu, atelier, course, fin), le niveau, une construction de
   niveau (newTrack il y a < 1 s), les PROGRAMMES compilés et les TEXTURES envoyées pendant l'image. Une capture d'écran suffit. */
function perfAcoup(now,rawMs){const M=PERF_MON,I=renderer.info,np=(I.programs||[]).length,nt=I.memory.textures,dp=np-(M.np|0),dt9=nt-(M.nt|0);M.np=np;M.nt=nt;
  if(!M.t0)M.t0=now;if(rawMs<=50||!M.vu){M.vu=1;return;}
  M.n50=(M.n50|0)+1;if(rawMs>100)M.n100=(M.n100|0)+1;if(rawMs>250)M.n250=(M.n250|0)+1;if(rawMs>(M.max|0))M.max=rawMs;
  const ou=started&&!gameOver?'course':gameOver?'fin':(typeof garageOn!=='undefined'&&garageOn)?'atelier':'menu';
  const cs=[];if(loop._rebuildT&&now-loop._rebuildT<1000)cs.push('construction');if(dp>0)cs.push('+'+dp+' prog');if(dt9>0)cs.push('+'+dt9+' tex');
  (M.L||(M.L=[])).push(Math.round((now-M.t0)/1000)+' s · '+Math.round(rawMs)+' ms · '+ou+(LVL.cur?' '+LVL.cur.id:'')+(cs.length?' · '+cs.join(' '):''));if(M.L.length>5)M.L.shift();}
function perfMonTick(now,rawMs){const M=PERF_MON;if(rawMs>M.pire)M.pire=rawMs;try{perfAcoup(now,loop._brut||rawMs);}catch(e){}if(now-M.t<250)return;M.t=now;
  const ms=loop._ms||16,al=[];for(let i=0;i<QL.N_EFF&&i<QL.k;i++)al.push(QL.nom[i]);const b=qlBornes();
  if(QL.k>b.kNet)al.push(QL.k>=b.kMax?'SOUS LE PLANCHER + BLOOM OFF':'SOUS LE PLANCHER');
  const tx=ms.toFixed(1)+' ms  pire '+M.pire.toFixed(0)+'  '+Math.round(1000/Math.max(1,ms))+' i/s'+(loop._r30?'  (30 Hz)':'')+(CAD.on?'  30 i/s CALÉ':'')+(QLR.vraiT?'  vrai '+QLR.vrai.toFixed(1):'')+(QL.bride&&now-QL.bride<3000?'  ÉCRAN BRIDÉ':'')+'  p50/75/90 '+QLR.p50.toFixed(0)+'/'+QLR.p75.toFixed(0)+'/'+QLR.p90.toFixed(0)+(QL.essai?'  essai':'')+
    '\nPALIER '+PAL.n+' ('+PAL.src+')  DPR '+curDPR.toFixed(2)+'/'+DPR_CAP.toFixed(2)+'  cran '+QL.k+'/'+b.kMax+(RESPIN?'  FIGE':'')+(bloomPass&&!bloomPass.fuse?'  bloom ancien':'')+'\n'+(al.length?al.join(' · '):'plein')
    +'\nÀ-COUPS en '+Math.round((now-(M.t0||now))/1000)+' s : '+(M.n50|0)+' > 50 ms · '+(M.n100|0)+' > 100 · '+(M.n250|0)+' > 250 · pire '+Math.round(M.max|0)+' ms'+(M.L&&M.L.length?'\n'+M.L.join('\n'):'');
  if(now-(M.p0||0)>1000){M.p0=now;M.pire=0;}
  if(tx!==M.txt){M.txt=tx;M.el.textContent=tx;}}
