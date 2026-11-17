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
     8  ombre 512, halo 2 étages, ciel 1/8, traits ×½ (= GDX_CRI)    [P] (la loupe de la caisse, qui retaille la toile visible : coupée sous voile seulement)
     9  niveau − 1 (N2 → N1)                                         [V] sous voile : départ, mort, pause, menu
    10  plafond de résolution × 0,9                                  [V]
    11  plafond de résolution × 0,8                                  [V]
    12  SURVIE : halo coupé (QUAL_LOW)                               [V]
   LE NIVEAU : le réglage du joueur devient un PLAFOND. Jamais choisi = AUTO = le niveau HAUTE de la classe (N2 sur le 13 Pro, au lieu de N1) ; BASSE choisie = le niveau BASSE ; HAUTE choisie = HAUTE.
     ⚠ À VALIDER PAR SACHA. `?sans=pilauto` = un téléphone jamais choisi reste au niveau BASSE, comme avant.
   LE DÉPART (avant la première image de course, et au chargement), lu sur les conditions (`pilCond` : thermique d'iOS, branché, économie, batterie) — `pilTableC` :
     (2026-11-17, corrections du contrôle adverse : vols 117-119, au N1 branché + économie on a déjà 28,8 i/s à nominal et 26-35 ms de vrai coût à fair/serious, sans marge)
     · le niveau plein (N2 sur le 13 Pro) SEULEMENT débranché, sans économie, nominal, batterie ≥ 20 % : K0 ;
     · toute autre condition part (en AUTO ; HAUTE choisie garde son niveau) au niveau BASSE de la classe (`PILO.capN`, N1 : au mieux le rendu d'aujourd'hui), avec sur ce niveau :
       nominal K0 (K1 branché + éco) · fair K1 (K2 branché + éco) · serious K5 (K6 branché + éco) · critical K10 · batterie < 20 % : +2.
     · la MONTÉE vers le niveau plein dans ces conditions ne vient que de la MÉMOIRE : 2 courses de suite à N1 K0 sans ORANGE ni ROUGE (≥ 30 s) dans cette condition → N2 K3.
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
     · URGENCE au critical : ORANGE tenu 5 s exigé ; MORT : la reprise reste possible 1,5 s, et tant qu'un jeton de la machine à sous attend (machine pas encore vue).
   LES MOMENTS (`pilMoment`) : départ et menu (tout, d'un coup) ; mort et pause de plus d'1 s (tout ; un cran de mieux au plus) ; portail (crans 0-8 seulement, jamais le niveau ni la résolution).
   Jamais pendant le 3-2-1, une réanimation, le final spin : seuls ces moments-là appellent pilAppliquer.
   PRISE DE MAIN : sous `pilOn()` le gouverneur des paliers (mobPalTick), l'image lourde (gdxLourdTick), l'échelle QL automatique (boucle-1.js), le cran de plus du critique (mobThermo) et la séance
   brûlante à chaud (pjcTick) ne décident plus : ce sont des capteurs. JOURNAL : genre `pilote` de la boîte noire (une ligne par changement, avec la raison ; une ligne `retaille` par toile refaite
   avec le moment) ; enregistreur (?perfrec=2) : colonne `PL` par seconde, histogramme `H` des intervalles d'écran par cases de 8 ms.
   Téléphone profilé seulement (`MOB_PALS && PRF.on` : TEL_NATIF, palier 2, classe connue). L'ordinateur ne voit rien.
   `?sans=pilote` = le jeu d'avant · `?pilote=N2` (niveau forcé, K0) · `?pilote=K5` · `?pilote=ultime` (K0) · `?pilote=survie` (K12) · `?pilote=fige` (le départ, puis plus rien) · `?pilote=gel` (mesure seule) ·
   `?sans=pilauto` · `?sans=pilanticipe` · `?sans=pilgels` (tout tic raté = charge, comme avant) · `?sans=pilurgence` · `?sans=pilhyst` · `?plus=pilcad33` (33 régulier au critique ; défaut = 50 visés, la base) · `?sans=pilborne` (sans la borne S3) · `?sans=pilsonde` · `?pilcible=0.7` (le budget) · `dbgPilote()` · `dbgPiloteSim({t,B,E,bat,vrai,rates,eM,K,Kv})` (simule les capteurs ; eM = la médiane des images d'écran, ms ; K = un cran posé en course, Kv = le visé). */
const PIL_Q=location.search,PIL_ON=!/[?&]sans=[^&]*\bpilote\b/.test(PIL_Q),PIL_AUTO=!/[?&]sans=[^&]*\bpilauto\b/.test(PIL_Q),PIL_ANT=!/[?&]sans=[^&]*\bpilanticipe\b/.test(PIL_Q),PIL_SONDE=!/[?&]sans=[^&]*\bpilsonde\b/.test(PIL_Q);
const PIL_F=(function(){const m=/[?&]pilote=([a-z0-9]+)/i.exec(PIL_Q);return m?m[1].toLowerCase():'';})();
const PIL_NF=/^n[1-4]$/.test(PIL_F)?+PIL_F[1]:0,PIL_KF=/^k(\d|1[0-2])$/.test(PIL_F)?+PIL_F.slice(1):PIL_F==='ultime'||PIL_NF?0:PIL_F==='survie'?12:-1,PIL_FIGE=PIL_F==='fige',PIL_GEL=PIL_F==='gel';
const PIL_B=(function(){const m=/[?&]pilcible=([\d.]+)/.exec(PIL_Q);return m?Math.max(.4,Math.min(.95,+m[1])):0;})();
const PIL_NOM=['ULTIME','ombre en vol ½','ciel ½','polyphonie ½','halo −1 étage','ombre −1','ciel ¼ · traits ¾','halo ½','recette critique','niveau −1','résolution ×0,9','résolution ×0,8','SURVIE'];
const PILO={K:0,Kv:0,N0:0,capN:0,src:'',cle:'',c:null,tPrev:-9,mom:'',depT:-1e9,portT:-1e9,tk:0,pauseT:0,menu:false,mort:false,mortP:false,avMort:null,fait:false,
  h:new Uint16Array(16),per:1000/30,lastImg:0,nI:0,nR:0,nT:0,wDer:0,gels:0,gelsC:0,gelMax:0,gelNT:0,fen:[],vrai:0,vraiT:0,vT:0,sondeT:0,rougeT:-1e9,rgT0:0,cT:-1e9,oT:-1e9,bleuS:0,bleuT:-9,zone:'',monte:null,mur:{},sess:{},seg:{},
  urg:null,urgFait:false,nUrg:0,cand:'',candT:0,nPort:0,portIgn:0,nDep:0,depIgn:0,jeton:false,raz:false,razIgn:0,consT:-1e9,nCons:0,consC:0,consMax:0,gS:0,geleux:false,glS:0,orT0:0,mortT:0,spinVu:false,nBorne:0,borne:null,
  dDpr:0,dBloom:0,lpOff:false,nRet:{},nBloom:{},nOmb:{},jr:[],sim:null,chg:0};
const PIL_CAD=/[?&]plus=[^&]*\bpilcad33\b/.test(PIL_Q); /* (cadPer, cadence.js) (3e tour, S3) au critique : le comportement de la base (50 ms visés) par défaut, la mesure sur téléphone n'étant pas faite ; ?plus=pilcad33 = 33 régulier sur un écran à 30 */
const PIL_GELS=!/[?&]sans=[^&]*\bpilgels\b/.test(PIL_Q); /* ?sans=pilgels = tout tic raté est une charge, comme avant (banc A-B) */
const PIL_URG=!/[?&]sans=[^&]*\bpilurgence\b/.test(PIL_Q),PIL_HYST=!/[?&]sans=[^&]*\bpilhyst\b/.test(PIL_Q),PIL_WC=.7,PIL_GEL_MS=80,PIL_LEVE_K=3;
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
function pilDepartK(c){if(PIL_KF>=0){PILO.capN=0;PILO.src='forcé (?pilote='+PIL_F+')';return PIL_KF;}
  const T=pilTableC(c);let pl=4,nb=1;try{pl=pilPlafond();nb=pilNivBas();}catch(e){}
  let k=T.k,cap=T.cap&&pl>nb&&!PIL_NF&&!pilHauteChoisie()?nb:0,src='table'+(cap?' · départ N'+nb+' (pas N'+pl+' : '+pilCondTx(c)+')':'');
  const s=PILO.sess[c.cle];let e=null;try{e=pilMemE(c);}catch(x){}
  const m2=pilMur2(c,e,pl,nb); /* (3e tour, S1) un échec à N2 dans cette condition : pas de N2 avant la fin du mur */
  if(s!=null){k=s.k;cap=s.cap;src='séance';}
  else if(e&&e.n>=2){const a=e;
    if(cap&&a.N>=pl&&!m2){cap=0;k=Math.max(0,Math.min(T.k+4,a.k));src='mémoire (N'+a.N+' K'+a.k+', n '+a.n+')';}
    else if(cap&&a.N===nb&&(a.v|0)>=2&&a.k===0&&!m2){cap=0;k=PIL_LEVE_K;src='mémoire · marge prouvée ('+a.v+' courses N'+nb+' K0) → N'+pl+' K'+k;}
    else if(a.N===(cap||pl)){k=Math.max(0,Math.min(T.k+4,a.k));src='mémoire (N'+a.N+' K'+a.k+', n '+a.n+')';}}
  if(m2&&!cap){cap=nb;if(s==null){k=e&&e.N===nb&&e.n>=2?Math.max(0,Math.min(T.k+4,e.k)):T.k;}src+=' · mur N2 ('+Math.ceil((e.mur2-Date.now())/864e5)+' j)';}
  const f=pilMurPlancher(c.cle);if(k<f){k=f;src+=' + mur';}PILO.src=src;PILO.capN=cap;return Math.max(0,Math.min(12,k));}
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
    if(voile){pilPrechauffe();PILO.lpOff=K>=8;}
  }catch(e){try{window.__ccNote('pilote','erreur '+String(e&&e.message).slice(0,120));}catch(x){}}
  PILO.mom='';
  if(K!==K0||PRF.n!==n0){PILO.chg++;const c=PILO.c||pilCond(),v=PILO.vraiT&&performance.now()-PILO.vraiT<15000?' · vrai '+PILO.vrai.toFixed(1).replace('.',',')+' ms':'',r=pilRates(10);
    pilNote('K'+K0+'→'+K+' ('+PIL_NOM[K]+') · N'+PRF.n+' · '+(raison||'?')+(r?' · ratés '+(r.r*100).toFixed(1).replace('.',',')+' %':'')+v+' / tic '+PILO.per.toFixed(1).replace('.',',')+' · '+pilCondTx(c)+(function(){try{return LVL.cur?' · map '+LVL.cur.id:'';}catch(e){return '';}})()+' · '+mom);}}
function pilRates(s){const F=PILO.fen,n=Math.min(s,F.length);if(!n)return null;let i=0,r=0;for(let j=F.length-n;j<F.length;j++){i+=F[j][0];r+=F[j][1];}return i?{i:i,r:r/i}:null;}
function pilCons(now){let r=0;try{r=loop._rebuildT||0;}catch(e){}return now-Math.max(PILO.consT,r)<1500;} /* (M2) 1,5 s après un portail, une piste refaite ou une reconstruction : les accrocs sont de la construction */
function pilImg(now){ /* (cadSaute) chaque image CALCULÉE : l'intervalle depuis la précédente, contre la période visée */
  if(!pilOn())return;const d=now-PILO.lastImg;PILO.lastImg=now;if(PILO.urg)pilUrgVoit(now);if(!PILO.crs)return;
  const cons=pilCons(now);
  if(d>400){if(cons){PILO.nCons++;PILO.consC++;if(d>PILO.consMax)PILO.consMax=d;}else if(now-PILO.depT>2500){PILO.gels++;PILO.gelsC++;PILO.gS++;if(d>PILO.gelMax)PILO.gelMax=d;}return;}PILO.nI++;
  if(d>=1.5*PILO.per){ /* (GELS ≠ CHARGE) le coût vrai de l'image d'avant (CAD.w : boucle + envoi du rendu) contre le tic d'écran */
    if(cons&&d>PIL_GEL_MS){PILO.nCons++;PILO.consC++;if(d>PILO.consMax)PILO.consMax=d;}
    else if(!PIL_GELS||PILO.wDer>=PIL_WC*pilTic())PILO.nR++;else if(d>PIL_GEL_MS){PILO.gels++;PILO.gelsC++;PILO.gS++;if(d>PILO.gelMax)PILO.gelMax=d;}else{PILO.nT++;PILO.gS++;}}}
function pilCout(w){if(pilOn())PILO.wDer=w;} /* (cadFin) le travail vrai de l'image calculée qui s'achève */
function pilRaf(d){if(PILO.crs&&d>0&&d<400&&pilOn())PILO.h[Math.min(15,(d/8)|0)]++;} /* (cadSaute) chaque image d'ÉCRAN : l'histogramme en cases de 8 ms */
function pilMoment(m){ /* les moments invisibles : 'depart' (resetGame, start), 'portail' (portailPasse) ; 'mort', 'pause', 'menu' sont vus par pilTick */
  if(!pilOn()||PIL_GEL)return;const now=performance.now();
  if(m==='raz'){PILO.raz=true;return;} /* (M1) resetGame commence : la piste qu'il refait n'est pas un moment */
  if(m==='depart'){PILO.raz=false;PILO.jeton=false;if(now-PILO.depT<1500){PILO.depIgn++;return;} /* (corrections) resetGame puis start : un seul départ */
    PILO.nDep++;PILO.depT=now;PILO.h.fill(0);PILO.fen.length=0;PILO.nI=PILO.nR=PILO.nT=0;PILO.bleuS=0;PILO.monte=null;PILO.rougeT=-1e9;PILO.rgT0=0;PILO.mort=false;PILO.mortP=false;PILO.avMort=null;PILO.seg={};
    PILO.urg=null;PILO.urgFait=false;PILO.gels=PILO.gelsC=PILO.gelMax=0;
    if(PIL_FIGE&&PILO.fait)return;const c0=pilCond(),c=pilCondDep(c0);PILO.c=c0;if(c===c0){PILO.cle=c.cle;PILO.cand='';}PILO.tPrev=c0.t;
    const k=pilDepartK(c),n0=PRF.n;PILO.Kv=k;PILO.fait=true;pilAppliquer(k,'depart','départ');
    pilNote('départ N'+PRF.n+' K'+PILO.K+' · clé '+(PRF.modele||'?')+'|'+c.cle+(c!==c0?' (hystérésis : '+c0.cle+' pas encore 60 s)':'')+' · source '+PILO.src+' · '+pilCondTx(c0)+' · plafond '+(PIL_NF?'forcé N'+PIL_NF:pilChoisi()?(PRF.q==='haute'?'HAUTE':'BASSE'):PIL_AUTO?'AUTO':'BASSE (sans pilauto)')+(n0!==PRF.n?' · N'+n0+' → N'+PRF.n:''));return;}
  if(m==='portail'){PILO.jeton=true;PILO.consT=now;PILO.portT=now;PILO.nPort++;pilPaie('portail');return;} /* (M1, DOUBLE PORTAIL) portailPasse paie et pose un JETON de passage */
  if(m==='piste'){PILO.consT=now; /* (M1) la fin de newTrackG : le jeton du portail est consommé ; sans jeton, hors départ (dbgSaut, événements), c'est un moment à lui seul */
    if(PILO.jeton){PILO.jeton=false;PILO.portIgn++;return;}
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
function pilUrgVoit(now){ /* (URGENCE) à chaque image calculée : le moment le moins visible — en l'air, nitro ; sinon au bout de 3 s */
  const U=PILO.urg;if(!U)return;if(!pilEnCourse()){if(!started||gameOver)PILO.urg=null;return;}let o='';
  try{if(mode!=='drive')o='en l\'air';else if(nitroOn)o='nitro';}catch(e){}if(!o&&now-U.t>=3000)o='tout de suite (3 s)';if(!o)return;
  PILO.urg=null;PILO.urgFait=true;PILO.nUrg++;try{const g9=PILO.seg[(PILO.c||pilCond()).cle];if(g9)g9.urg=1;}catch(e){}const eff=pilPlafEff(),dsc=pilDescend();
  const k=Math.min(12,dsc?Math.max(PILO.Kv,Math.min(PILO.K,8)):Math.max(PILO.Kv,PILO.K+1,eff>1?9:10));PILO.Kv=Math.max(PILO.Kv,k);
  pilAppliquer(k,'urgence','urgence · '+U.pq+' · '+o);}
function pilPaie(m){ /* paie la dette au moment m (ou la rend) */
  if(PIL_FIGE||PIL_KF>=0)return;let k=PILO.Kv;const K=PILO.K;
  if(m==='portail'){if(K>=9)return;k=Math.min(k,8);if(k<K&&pilDescend())k=K;} /* un niveau de moins est dû : le portail n'alourdit rien sur le niveau d'avant */
  if(k<K)k=Math.max(k,K-1); /* vers le mieux : un cran par moment (sauf départ et menu) */
  if(m==='menu')k=PILO.Kv;
  if(k<K&&PILO.geleux){k=K;if(!PILO.glNote){PILO.glNote=1;pilNote('remontée refusée · gels hors boucle sur la fenêtre');}} /* (S2) les gels ne sont pas une marge : aucune remontée */
  const nv=pilNivCible(k,PILO.c||pilCond()),voile=m!=='portail';
  if(k!==K||(voile&&nv!==PRF.n)||(voile&&(PILO.dDpr||PILO.dBloom))){const monte=k<K;pilAppliquer(k,m,(monte?'mieux':'dette')+' payée au '+m+(PILO.zone?' · '+PILO.zone:''));
    if(monte&&m!=='menu')PILO.monte={k:k,t:performance.now(),s:0};}
  try{PILO.sess[PILO.cle||(PILO.c||pilCond()).cle]={k:PILO.Kv,cap:PILO.capN};}catch(e){}}
function pilTick(now,enC){ /* une fois par seconde (mobPalTick) : LE PILOTE */
  if(PIL_GEL&&!PILO.gelVu){PILO.gelVu=1;pilNote('gel : le pilote mesure, rien n\'est posé (N'+PRF.n+')');}
  const c=pilCond();PILO.c=c;PILO.per=pilPer();
  if(MOB_POLY)window.__ccPoly.on=PILO.K>=3&&enC;
  let menu=false,mort=false;try{menu=!started||garageOn;mort=!menu&&gameOver;}catch(e){}
  /* la condition change : l'anticipation (dette) — même hors course. (corrections, ANTI-POMPAGE) le PIRE compte tout de suite ; le MIEUX seulement après 60 s stables (fair ↔ serious qui oscille) */
  if(c.cle!==PILO.cle){const tn=pilTableC(c),to=PILO.cle?pilTableC(Object.assign({},c,pilDeCle(PILO.cle))):tn,pire=pilPire(tn,to),mieux=pilPire(to,tn);let va=true;
    if(mieux&&PIL_HYST&&PILO.cle){if(PILO.cand!==c.cle){PILO.cand=c.cle;PILO.candT=now;pilNote('hystérésis · '+PILO.cle+' → '+c.cle+' : meilleur, attendu 60 s stables');}va=now-PILO.candT>=60000;}
    if(va){if(PIL_ANT&&!PIL_FIGE&&PIL_KF<0&&!PIL_GEL&&(pire||mieux))pilAnticipe(c,tn,to);PILO.cle=c.cle;PILO.cand='';PILO.tPrev=c.t;}}
  else PILO.cand='';
  if(PIL_GEL)return;
  if(menu){PILO.crs=false;if(!PILO.menu||PILO.Kv!==PILO.K){PILO.menu=true;const k=pilDepartK(pilCondDep(c));PILO.Kv=k;if(!(PIL_FIGE&&PILO.fait))pilPaie('menu');}return;}
  PILO.menu=false;
  if(mort){PILO.crs=false;PILO.urg=null;if(!PILO.mort){PILO.mort=true;PILO.mortP=false;PILO.mortT=now;PILO.spinVu=false;PILO.jeton=false;PILO.avMort={K:PILO.K,N:PRF.n};pilNoteGels(now,true);}
    /* (corrections, SECONDE CHANCE) tant que la course peut reprendre (offre, réanimation, pub, volet, machine à sous), rien ne change : la mort définitive paie ; une reprise après coup rend le rendu d'avant (pilMoment('reprise')) */
    if(!PILO.mortP&&!pilReprisePossible(now)){PILO.mortP=true;pilFinCourse();pilPaie('mort');}return;}
  if(!enC){PILO.crs=false;try{if(paused){if(!PILO.pauseT)PILO.pauseT=now;else if(now-PILO.pauseT>1000&&!PILO.pauseP){PILO.pauseP=1;pilPaie('pause');}}}catch(e){}return;}
  PILO.pauseT=0;PILO.pauseP=0;
  if(!PILO.crs){PILO.crs=true;PILO.nI=PILO.nR=0;return;}
  /* la seconde de course */
  const calme=now-(loop._rebuildT||0)>1000&&now-PILO.portT>1000&&now-PILO.consT>1000&&now-PILO.depT>2500,S=PILO.sim;
  let nI=PILO.nI,nR=PILO.nR,gS=PILO.gS;PILO.nI=PILO.nR=PILO.gS=0;if(S&&S.rates!=null){nI=Math.max(nI,30);nR=Math.round(nI*S.rates);}if(S&&S.gels!=null)gS=+S.gels;
  if(calme){PILO.fen.push([nI,nR,gS]);if(PILO.fen.length>10)PILO.fen.shift();}
  {let gi=0,gg=0;for(const f of PILO.fen){gi+=f[0];gg+=f[2]|0;}PILO.geleux=gg>=2||(gi>0&&gg>.005*gi);PILO.glS=PILO.geleux?PILO.glS+1:0;if(!PILO.geleux)PILO.glNote=0;} /* (S2) gels + trous > 0,5 % des images de la fenêtre, ou ≥ 2 gels sur 10 s */
  const g=PILO.seg[c.cle]||(PILO.seg[c.cle]={s:0,kv:0,ro:0,kmax:0,N:0,n:0,rg:0,gl:0,nMax:0,urg:0});g.s++;g.kv=PILO.Kv;g.N=pilPlafEff();g.n=PRF.n;if(PRF.n>g.nMax)g.nMax=PRF.n;if(PILO.K>g.kmax)g.kmax=PILO.K;if(PILO.geleux)g.gl++; /* (étape 4) le segment de cette condition ; N = le niveau de base, ro = secondes ORANGE ou ROUGE, kmax = le cran le plus lourd tenu */
  pilNoteGels(now,false);
  if(S&&S.vrai!=null){QLR.vrai=+S.vrai;QLR.vraiT=now;}
  if(QLR.vraiT&&QLR.vraiT!==PILO.vT&&now-QLR.vraiT<12000){PILO.vT=QLR.vraiT;PILO.vrai=QLR.vrai;PILO.vraiT=now;}
  if(PIL_SONDE&&now-PILO.sondeT>10000&&QLR.sN<=0&&!(QLR.S&&QLR.S.pend>0)){PILO.sondeT=now;try{qlSondeArme();}catch(e){}}
  if(PIL_FIGE||PIL_KF>=0||!calme){PILO.zone='';return;}
  const T=PILO.per,b=(PIL_B||(PRF.haute()&&pilChoisi()?.85:.75))-(c.B&&c.E?.05:0),r3=pilRates(3),r10=pilRates(10),v=now-PILO.vraiT<15000&&PILO.vraiT?PILO.vrai:null;
  const rouge=(r3&&r3.i>=20&&r3.r>.08)||(v!=null&&v>T),chaudGel=!rouge&&PILO.geleux&&PILO.glS>=10&&c.t>=2; /* (S2) des gels soutenus ET serious ou plus : la chaleur mesurée, traitée comme ORANGE */
  const orange=!rouge&&((r10&&r10.i>=60&&r10.r>=.02)||(v!=null&&v>(b+.05)*T)||chaudGel);
  const bleu=!rouge&&!orange&&!PILO.geleux&&r10&&r10.i>=60&&r10.r<.005&&v!=null&&v<.55*T; /* (S2) jamais BLEU sur des gels */
  PILO.zone=rouge?'ROUGE':orange?'ORANGE':bleu?'BLEU':'VERT';PILO.chaudGel=chaudGel;
  if(rouge||orange)g.ro++;if(rouge)g.rg++;if(rouge||orange){if(!PILO.orT0)PILO.orT0=now;}else PILO.orT0=0;
  /* (corrections, URGENCE) ROUGE tenu 8 s, crans [C] dépensés ; ou critical en course avec une dette de résolution (niveau ou cran ≥ 9 dû) : la résolution se paie EN COURSE, une fois */
  if(rouge&&PILO.K>=6){if(!PILO.rgT0)PILO.rgT0=now;}else PILO.rgT0=0; /* le ROUGE compté depuis que les crans [C] sont dépensés */
  if(PIL_URG&&!PILO.urg&&!PILO.urgFait&&PILO.K<12){const r8=rouge&&PILO.K>=6&&PILO.rgT0&&now-PILO.rgT0>=8000,cr=c.t>=3&&PILO.K<9&&(PILO.Kv>=9||pilDescend()||PILO.dDpr)&&PILO.orT0&&now-PILO.orT0>=5000; /* (M3) au critical, l'urgence exige ORANGE (ou ROUGE) tenu 5 s : sans ratés, la dette attend le portail ou la mort */
    if(r8||cr){PILO.urg={t:now,pq:r8?'ROUGE tenu '+Math.round((now-PILO.rgT0)/1000)+' s à K'+PILO.K+' (crans [C] dépensés)':'critical en course, dette de résolution (visé K'+PILO.Kv+(pilDescend()?', niveau dû':'')+')'};pilNote('urgence armée · '+PILO.urg.pq);}}
  if(PILO.monte&&now-PILO.monte.t<30000&&(rouge||orange)){const M=PILO.mur[c.cle],d=M&&now<M.fin+600000?Math.min(960000,M.d*2):120000;
    PILO.mur[c.cle]={k:PILO.monte.k,fin:now+d,d:d};PILO.Kv=Math.max(PILO.Kv,PILO.monte.k+1);pilNote('mur · K'+PILO.monte.k+' rate dans les 30 s ('+PILO.zone+') · '+Math.round(d/60000)+' min · '+c.cle);PILO.monte=null;}
  if(rouge){PILO.rougeT=now;PILO.bleuS=0;
    if(PILO.K<6){if(now-PILO.cT>=3000){PILO.cT=now;PILO.Kv=Math.max(PILO.Kv,PILO.K+1);pilAppliquer(PILO.K+1,'course','rouge');}}
    else if(now-PILO.oT>=10000&&PILO.Kv<Math.min(12,PILO.K+3)){PILO.oT=now;PILO.Kv=Math.max(PILO.Kv,PILO.K)+1;pilNote('dette · rouge, crans [C] épuisés · visé K'+PILO.Kv);}}
  else if(orange){PILO.bleuS=0;if(now-PILO.oT>=10000&&PILO.Kv<Math.min(12,PILO.K+3)){PILO.oT=now;PILO.Kv=Math.max(PILO.Kv,PILO.K)+1;pilNote('dette · orange'+(chaudGel?' (gels au chaud : '+PILO.glS+' s, th '+c.t+')':'')+' · visé K'+PILO.Kv+(r10?' · ratés '+(r10.r*100).toFixed(1).replace('.',',')+' %':'')+(v!=null?' · vrai '+v.toFixed(1).replace('.',','):'')+' / '+T.toFixed(1).replace('.',','));}}
  else if(bleu){if(PILO.bleuT<0||c.t<PILO.bleuT)PILO.bleuT=c.t;if(c.t>PILO.bleuT){PILO.bleuS=0;PILO.bleuT=c.t;}PILO.bleuS++;
    if(PILO.bleuS>=60&&now-PILO.rougeT>120000&&PILO.Kv>=PILO.K&&PILO.K>0&&pilMurPlancher(c.cle)<PILO.K&&!pilDescend()){
      const k=PILO.K-1,d0=pilVoulu(PILO.K).o.dpr,d1=pilVoulu(k).o.dpr,p=v*Math.pow(d1/Math.max(.1,d0),2)*(k===8&&PILO.K===9?1.6:1);
      PILO.bleuS=0;if(p<.7*T){PILO.Kv=k;pilNote('bleu · 60 s de marge · visé K'+k+' (prédit '+p.toFixed(1).replace('.',',')+' / '+T.toFixed(1).replace('.',',')+')');}}}}
function pilAnticipe(c,tn,to){ /* la différence de table posée en dette (ou rendue) ; un changement de départ (niveau BASSE ⇄ plein) change la base du cran */
  const s=PILO.sess[c.cle],pire=pilPire(tn,to);let pl=4,nb=1;try{pl=pilPlafond();nb=pilNivBas();}catch(e){}
  let kv=PILO.Kv,cap=PILO.capN;
  if(tn.cap!==to.cap){if(tn.cap&&pl>nb&&!PIL_NF&&!pilHauteChoisie()){cap=nb;kv=tn.k;if(s!=null&&s.cap)kv=Math.max(kv,s.k);}else if(!tn.cap){let m2=false;try{m2=pilMur2(c,pilMemE(c),pl,nb);}catch(e){}cap=m2?nb:0;kv=tn.k;}}
  else{kv=PILO.Kv+(tn.k-to.k);if(pire&&s!=null&&s.cap===cap)kv=Math.max(kv,s.k);}
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
  const c=pilCond();return {on:pilOn(),force:PIL_F||null,gel:PIL_GEL,K:PILO.K,nom:PIL_NOM[PILO.K],vise:PILO.Kv,dette:PILO.Kv-PILO.K,niveau:PRF.n,plafond:(function(){try{return pilPlafEff();}catch(e){return null;}})(),plafondJoueur:(function(){try{return pilPlafond();}catch(e){return null;}})(), /* (M5) l'ordinateur n'a pas de classe : dbgPilote ne lève plus */auto:PIL_AUTO&&!pilChoisi(),src:PILO.src,cond:c,cle:(PRF.modele||'?')+'|'+c.cle,
    table:pilTable(c),tic:+pilTic().toFixed(1),per:+PILO.per.toFixed(1),eM:CAD.eM||0,zone:PILO.zone,rates3:pilRates(3),rates10:pilRates(10),vrai:PILO.vraiT?+PILO.vrai.toFixed(1):null,bleu:PILO.bleuS,
    mur:PILO.mur,seance:PILO.sess,retailles:PILO.nRet,halo:PILO.nBloom,ombresNeuves:PILO.nOmb,dettes:{dpr:PILO.dDpr,halo:PILO.dBloom},capN:PILO.capN,descend:pilDescend(),gels:PILO.gels,trous:PILO.nT,geleux:PILO.geleux,glS:PILO.glS,constructions:PILO.nCons,borne:PILO.borne,nBorne:PILO.nBorne,jeton:PILO.jeton,razIgnores:PILO.razIgn,wDer:+PILO.wDer.toFixed(1),urgence:PILO.urg?PILO.urg.pq:PILO.urgFait?'payée':null,nUrg:PILO.nUrg,portails:{payes:PILO.nPort,ignores:PILO.portIgn,raz:PILO.razIgn},departs:{notes:PILO.nDep,ignores:PILO.depIgn},cand:PILO.cand||null,mort:PILO.mort,mortP:PILO.mortP,histo:Array.from(PILO.h),changements:PILO.chg,journal:PILO.jr.slice(-15),
    img:window.imgRegle(),qlMin:PAL.b('qlMin',0),poly:MOB_POLY?window.__ccPoly.on:null,cadPer:(function(){try{return +cadPer().toFixed(1);}catch(e){return null;}})(),memoire:(function(){try{return pilMemLit();}catch(e){return null;}})()};};
window.dbgPiloteOu=function(){return pilOu();}; /* (banc) le moment de cet instant : course, depart, portail, mort, pause, menu */
window.dbgPiloteSim=function(o){ /* (banc) simule les capteurs : t (thermique iOS, joué aussi par dbgThermique), B (branché), E (économie), bat (%), vrai (ms), rates (part) ; null efface */
  if(o===null){PILO.sim=null;return null;}o=o||{};
  if(o.t!=null)try{mobThermo(+o.t);}catch(e){}
  if(o.B!=null)window.__ccBranche=o.B?2:1;if(o.E!=null)window.__ccEco=o.E?1:0;if(o.bat!=null)window.__ccBatterie=+o.bat;
  if(o.K!=null)pilAppliquer(Math.max(0,Math.min(8,+o.K)),'course','banc : K posé');if(o.Kv!=null)PILO.Kv=Math.max(0,Math.min(12,+o.Kv)); /* (banc) un cran posé en course, un cran visé */
  const S=PILO.sim||(PILO.sim={});if('vrai' in o)S.vrai=o.vrai;if('eM' in o)S.eM=o.eM;if(S.eM==null)delete S.eM;if('rates' in o)S.rates=o.rates;if('gels' in o)S.gels=o.gels;if(S.gels==null)delete S.gels;if(S.vrai==null)delete S.vrai;if(S.rates==null)delete S.rates;return Object.assign({},S);};
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
const PIL_MEM=!/[?&]sans=[^&]*\bpilmem\b/.test(PIL_Q)&&!PIL_F&&!/[?&](classe|appareil)=/.test(PIL_Q),PIL_MEM_J=7*864e5,PIL_MUR2_J=7*864e5,PIL_MUR2_MAX=30*864e5;
function pilMemLit(){try{const a=JSON.parse(localStorage.getItem('cashcarPilote')||'null');if(!a||a.v!==2||a.m!==PRF.modele||!a.K)return null;const t=Date.now();
  for(const k in a.K)if(!(t-(a.K[k].t||0)<PIL_MEM_J)&&!((a.K[k].mur2||0)>t))delete a.K[k];return a;}catch(e){return null;}}
function pilMemE(c){if(!PIL_MEM)return null;const a=pilMemLit();return a&&a.K[c.cle]||null;} /* l'entrée de la condition, quel que soit n */
function pilMemK(c){const e=pilMemE(c);return e&&e.n>=2?e:null;}
function pilMur2(c,e,pl,nb){return !!(e&&(e.mur2||0)>Date.now()&&pl>nb&&!PIL_NF&&!pilHauteChoisie());} /* vrai : le mur N2 de cette condition tient (AUTO seulement) */
function pilPrefs(){try{const C=window.Capacitor;return C&&C.Plugins&&C.Plugins.Preferences||null;}catch(e){return null;}}
function pilMemEcrit(a){try{const v=JSON.stringify(a);localStorage.setItem('cashcarPilote',v);const Pr=pilPrefs();if(Pr){const p9=Pr.set({key:'cashcarPilote',value:v});if(p9&&p9.catch)p9.catch(function(){});}}catch(e){}}
function pilApprend(cle,k,pq,N,marge,echec){if(!PIL_MEM||!PRF.modele)return;const a=pilMemLit()||{v:2,m:PRF.modele,K:{}};let e=a.K[cle];N=N||PRF.n;const now=Date.now();
  if(echec){let nb=1;try{nb=pilNivBas();}catch(x){}const kb=pilTableC(Object.assign({bat:-1},pilDeCle(cle))).k;
    if(!e)e={k:kb,n:1,t:0,N:nb,v:0};const d=e.d2?Math.min(PIL_MUR2_MAX,e.d2*2):PIL_MUR2_J;e.d2=d;e.mur2=now+d;e.v=0;e.t=now;
    if(e.N>nb){e.N=nb;e.k=kb;} /* N2 était la base de l'entrée : retour à la base BASSE, le cran de la table */
    a.K[cle]=e;pilMemEcrit(a);pilNote('mémoire · '+cle+' : ÉCHEC à N'+N+' ('+pq+') → mur N2 '+Math.round(d/864e5)+' j · base N'+e.N+' K'+e.k+' (n '+e.n+')');return;}
  if(!e)e={k:k,n:0,t:0,N:N,v:0};
  if(e.N!==N){e.N=N;e.k=Math.max(0,Math.min(12,k));} /* (S1) la base change : plus de remise à zéro, le compte n est gardé */
  else e.k=Math.max(0,Math.min(12,Math.round((e.k*e.n+k)/(e.n+1))));
  e.n=Math.min(5,e.n+1);e.v=marge?Math.min(5,(e.v|0)+1):0;e.t=now;a.K[cle]=e;pilMemEcrit(a);
  pilNote('mémoire · '+cle+' : N'+N+' K'+k+' tenu ('+pq+(marge?', marge':'')+') → appris N'+e.N+' K'+e.k+' (n '+e.n+', marge '+e.v+(e.mur2>now?', mur N2 '+Math.ceil((e.mur2-now)/864e5)+' j':'')+')');}
function pilFinCourse(){ /* à la mort : les segments de la course */
  const G=PILO.seg;PILO.seg={};const c=PILO.c||pilCond();if(!PIL_MEM||(c.bat>=0&&c.bat<20))return;let nb=1;try{nb=pilNivBas();}catch(e){}
  for(const cle in G){const g=G[cle];if(g.s<30)continue;
    const echec=g.nMax>nb&&(g.rg>=3||g.urg)&&!pilHauteChoisie(); /* (S1) le niveau plein a tourné et a raté : ROUGE tenu, ou une urgence payée */
    pilApprend(cle,g.kv,g.s+' s de course'+(g.ro?', '+g.ro+' s orange/rouge':'')+(g.rg?', '+g.rg+' s rouge':'')+(g.urg?', urgence':'')+(g.gl?', '+g.gl+' s de gels':''),g.N,!g.ro&&!g.gl&&!g.kmax&&!g.kv&&g.n===g.N,echec);}} /* (S2) des gels sur la fenêtre : pas de marge */
function pilApprendChaud(){if(!pilOn())return;const c=pilCond(),cle='B'+(c.B?1:0)+'E'+(c.E?1:0)+'T2';pilApprend(cle,Math.min(12,PILO.K+2),'course brûlante : critical vu à K'+PILO.K,pilPlafEff(),false,false);}
function pilOubli(){try{localStorage.removeItem('cashcarPilote');}catch(e){}try{const Pr=pilPrefs();if(Pr){const p9=Pr.remove({key:'cashcarPilote'});if(p9&&p9.catch)p9.catch(function(){});}}catch(e){}PILO.sess={};PILO.mur={};}
if(PIL_MEM&&pilOn())try{if(localStorage.getItem('cashcarPilote')==null){const Pr=pilPrefs();if(Pr){const p9=Pr.get({key:'cashcarPilote'});if(p9&&p9.then)p9.then(function(r){try{if(r&&r.value&&localStorage.getItem('cashcarPilote')==null)localStorage.setItem('cashcarPilote',r.value);}catch(e){}}).catch(function(){});}}}catch(e){} /* le miroir natif rend la mémoire qu'iOS aurait vidée (lue au départ suivant) */
if(pilOn()&&!PIL_GEL){ /* le départ AU CHARGEMENT (sous le serpent) : le niveau et le cran des conditions de cet instant */
  try{const c=pilCond();PILO.c=c;PILO.cle=c.cle;PILO.tPrev=c.t;const k=pilDepartK(c),n0=PRF.n;PILO.Kv=k;PILO.fait=PIL_FIGE;pilAppliquer(k,'menu','chargement');
    pilNote('chargement · N'+n0+' → N'+PRF.n+' K'+PILO.K+' · '+PRF.modele+'|'+c.cle+' · source '+PILO.src+' · plafond '+(PIL_NF?'forcé N'+PIL_NF:pilChoisi()?(PRF.q==='haute'?'HAUTE':'BASSE'):PIL_AUTO?'AUTO':'BASSE'));}catch(e){try{window.__ccNote('pilote','chargement : '+String(e&&e.message).slice(0,120));}catch(x){}}}
