/* ====================== LE PALIER DE L'APPAREIL — PAL (2026-10-14, passe perf mobile, Sacha : « la version mobile n'arrive pas à afficher
   de bons graphismes sans bugger ; comprime un maximum, que ce soit fluide même sur un iPhone 7 ») ======================
   Jusqu'ici RIEN ne distinguait un iPhone 7 d'un iPhone 15 Pro : `IS_MOBILE` = tout téléphone, Safari dit « 2 cœurs » et « Apple GPU » sur
   tous les iPhone. Un iPhone 7 démarrait donc avec les réglages du 15 Pro, puis l'échelle QL descendait cran par cran — des dizaines de
   secondes de saccades avant de trouver son régime, à chaque partie. Et l'échelle QL ne sait baisser que l'ombre, le halo et la
   résolution : pas le nombre de triangles, d'appels de dessin, de particules ni le travail du processeur, qui sont ce qui étouffe une
   vieille puce. PAL répond UNE fois, au démarrage, à « quelle machine ? » — et tout le jeu peut tailler ses budgets dessus :
     PAL.n = 0  ANCIEN  (iPhone 6s / 7 / 8 / X / SE 1 — puces A9 à A11 ; Android d'entrée de gamme) : 30 i/s STABLES valent mieux que 45 hachées
             1  MOYEN   (iPhone XR / XS / 11 / SE 2 — A12, A13 ; Android milieu de gamme)
             2  RÉCENT  (iPhone 12 et après, ordinateurs) : l'image d'avant, au pixel près — RIEN ne change pour lui.
     PAL.bas = (n===0) · PAL.moyen = (n<=1) · PAL.B = les BUDGETS par palier (`PAL.b('cle')` rend la valeur du palier courant).
   COMMENT ON SAIT (du plus sûr au moins sûr) :
     1 · `?palier=0|1|2` (banc, essai) ;
     2 · ce que le jeu a APPRIS sur cet appareil aux parties d'avant (`localStorage.cashcarPalier`, écrit par `palNote` quand la mesure
         réelle en course contredit le palier : voir palApprend) ;
     3 · la version d'iOS — une CERTITUDE matérielle : un iPhone resté en iOS 15 ne peut pas avoir mieux qu'une puce A10 (6s, 7, SE 1),
         en iOS 16 pas mieux qu'une A11 (8, X) ; en iOS 26 au moins une A13 (iPhone 11) ;
     4 · sur Android : la mémoire annoncée (`deviceMemory`) et la puce graphique (affinée par `palPuce` une fois le contexte 3D créé) ;
     5 · un PETIT BANC du processeur (quelques millisecondes d'arithmétique, le meilleur de 4 tours) pour départager le reste.
   RÈGLE D'OR : tout ce qui se taille sur PAL doit laisser le palier 2 IDENTIQUE à avant (les téléphones récents gardent toute l'image).
   `dbgPalier()` décrit ; `dbgPalier(n)` recharge la page à ce palier. */
const PAL=(function(){
  const P={n:2,src:'défaut',ios:0,banc:null,puce:'',mem:navigator.deviceMemory||0,appris:null};
  const ua=navigator.userAgent||'',mI=/(?:iPhone|iPad|iPod).*? OS (\d+)[_.]/.exec(ua);P.ios=mI?+mI[1]:0;
  const banc=function(){ // ~3-4 ms sur une puce M (ordi), ~7 sur A15, ~10 sur A12, ~15 sur A10 (ordres de grandeur : le banc DÉPARTAGE, il ne tranche pas seul)
    try{const N=4096,a=new Float32Array(N),b=new Float32Array(N);let m=1e9;
      for(let r=0;r<4;r++){const t0=performance.now();let s=0,h=7;
        for(let k=0;k<120;k++)for(let i=0;i<N;i++){h=(Math.imul(h,1103515245)+12345)|0;a[i]=(h>>>8)*5.96e-8;b[i]=a[i]*a[(i+17)&4095]+b[(i+4095)&4095]*.5;s+=b[i];}
        const d=performance.now()-t0;if(s===s&&d<m)m=d;}
      return m;}catch(e){return null;}};
  const force=/[?&]palier=([0-2])\b/.exec(location.search);
  let appris=null;try{appris=JSON.parse(localStorage.getItem('cashcarPalier')||'null');}catch(e){}
  if(appris&&!(appris.n>=0&&appris.n<=2&&appris.v===1))appris=null;
  P.appris=appris;
  /* ===== L'ÉCRAN DE L'IPHONE DIT SA GÉNÉRATION (2026-10-24, passe perf iPhone, Sacha : « il faut que la version mobile soit parfaite ») =====
     MESURÉ sur l'iPhone 13 Pro de Sacha, DANS L'APP (copie de banc CC BANC, sans inspecteur) : le banc ci-dessus y rend 16 à 22 ms au 1er
     lancement (le compilateur de JavaScript n'est pas encore passé, et le téléphone chauffait), 3 à 8 ms une fois chaud. Classé ANCIEN et
     RETENU 7 jours : cadence 30 dès le départ, échelle QL au cran 4-5, DPR 1,25 — alors qu'au palier RÉCENT il tient 60 i/s à DPR 1,5 avec
     2 ms de JS par image. Le même iPhone tombait ANCIEN ou RÉCENT selon le lancement. Et l'app (WKWebView) comme Safari 26 écrivent
     « iPhone OS 18_7 » sous iOS 26 : la règle « iOS 26 → au moins une A13 » ne jouait jamais.
     La taille d'écran d'un iPhone (en points, portrait) et sa densité désignent sa génération sans rien mesurer :
       RÉCENT (A14 et après) : 360×780 (12 mini, 13 mini) · 390×844 (12, 13, 14, 16e) · 428×926 (12/13 Pro Max, 14 Plus) · 393×852 (14 Pro, 15, 16)
         · 430×932 (14 Pro Max, 15/16 Plus, Pro Max) · 402×874 (16 Pro, 17) · 440×956 (16/17 Pro Max) · 420×912 (Air) — et toute taille INCONNUE en
         densité 3 et ≥ 390 de large (les iPhone à venir) ;
       MOYEN (A12, A13) : 414×896 (XR, 11 en ×2 ; XS Max, 11 Pro Max en ×3) ;
       ANCIEN (A9 à A11) : 320×568 (SE 1) · 414×736 ×3 (6s, 7, 8 Plus) ;
       DOUTEUX, le banc tranche comme avant : 375×667 ×2 (6s, 7, 8, SE 2, SE 3 : A9 à A15) · 375×812 ×3 (X, XS, 11 Pro) · le Zoom de l'écran.
     Le Safari d'iOS 26 garde sa vraie version dans « Version/26 » : elle relève P.ios (l'app, elle, ne l'écrit pas).
     `?palier=` et le palier appris passent toujours avant ; le palier 2 lui-même ne change pas (RÈGLE D'OR). `?palecran=0` = l'ancien choix. */
  const mV=/Version\/(\d+)/.exec(ua);if(mV&&P.ios&&+mV[1]>=26&&P.ios<+mV[1])P.ios=+mV[1];
  const ecran=(function(){
    if(!/iPhone/.test(ua)||/[?&]palecran=0\b/.test(location.search))return null;
    const w=Math.round(Math.min(screen.width,screen.height)),h=Math.round(Math.max(screen.width,screen.height)),d=Math.round(devicePixelRatio||1),k=w+'x'+h+'@'+d;
    const n={'360x780@3':2,'390x844@3':2,'428x926@3':2,'393x852@3':2,'430x932@3':2,'402x874@3':2,'440x956@3':2,'420x912@3':2,
             '414x896@2':1,'414x896@3':1,'320x568@2':0,'414x736@3':0}[k];
    if(n!=null)return {n:n,k:k};
    if(d>=3&&w>=390&&k!=='414x736@3')return {n:2,k:k+' (inconnu)'};
    return null;})();
  if(force){P.n=+force[1];P.src='?palier';}
  else if(appris&&appris.src==='mesure'){P.n=appris.n;P.src='appris en course';}
  else if(!IS_MOBILE||FORCE_TEL){P.n=2;P.src='ordinateur';} // l'ordi (colonne comprise) : l'échelle QL suffit
  else if(P.ios&&P.ios<=15){P.n=0;P.src='iOS '+P.ios+' (A10 au mieux)';}
  else if(ecran){P.n=ecran.n;P.src='écran '+ecran.k.replace('x','×').replace('@',' ×');}
  else{
    if(appris&&appris.src==='banc'&&Date.now()-appris.t<6048e5){P.banc=appris.banc;P.n=appris.n;P.src='banc (retenu)';}
    else{P.banc=banc();const m=P.banc;P.n=m==null?1:m>=12.5?0:m>=8.5?1:2;P.src='banc '+(m==null?'?':m.toFixed(1)+' ms');
      try{localStorage.setItem('cashcarPalier',JSON.stringify({v:1,n:P.n,src:'banc',banc:m,t:Date.now()}));}catch(e){}}
    if(P.ios===16&&P.n>1){P.n=1;P.src+=' · iOS 16 (A11 au mieux)';}
    if(P.ios>=26&&P.n<1){P.n=1;P.src+=' · iOS 26 (A13 au moins)';}
    if(!P.ios&&P.mem){if(P.mem<=2&&P.n>0){P.n=0;P.src+=' · '+P.mem+' Go';}else if(P.mem<=4&&P.n>1){P.n=1;P.src+=' · '+P.mem+' Go';}}
  }
  P.bas=P.n===0;P.moyen=P.n<=1;
  try{document.documentElement.dataset.palier=String(P.n);}catch(e){} // `html[data-palier="0"]` : le CSS peut s'alléger sur les vieux appareils
  /* LES BUDGETS — une ligne par chose qui se taille, [ANCIEN, MOYEN, RÉCENT]. La 3e colonne = le jeu d'avant : on n'y touche pas.
     Chaque zone du jeu AJOUTE ses lignes ici (une seule table à régler), et lit `PAL.b('cle')`. */
  P.B={};
  P.b=function(k,d){const v=P.B[k];return v?v[P.n]:d;};
  /* ===== L'IMAGE ADAPTÉE SUR TÉLÉPHONE RÉCENT (2026-11-07, passe perf 3, P2 — Sacha : « pousse l'opti au max ») =====
     Jusqu'ici le palier 2 gardait l'image de l'ordi au pixel. Désormais, sur un VRAI téléphone (TEL_NATIF) au palier 2, six leviers (a à f) peuvent
     retirer un peu d'image quand le GPU est le goulot ; Sacha tranche levier par levier sur captures AVANT/APRÈS (passation/perf-2026-11/captures/p2-tel/).
       a · halo (bloom) : moins d'étages, entrée en demi-résolution     b · ombre de course plus petite, filtre simple
       c · résolution de course plafonnée plus bas, départ au cran 1    d · passe lisse du ciel une image sur deux
       e · stries de vent et traînées en demi-densité à grande vitesse  f · l'échelle de qualité réagit plus tôt
     `PAL.imgOn(l)` dit si le levier l est actif ; `PAL.bT(clé, avant, l)` rend la 3e colonne de `PAL.B.clé` (= le budget « récent téléphone »)
     si le levier est actif, sinon `avant` (la valeur exacte d'avant). L'ORDINATEUR (TEL_NATIF faux, même avec ?tel=1) : toujours `avant`.
     Les colonnes ancien/moyen des clés `img*` ne sont pas lues : les paliers 0 et 1 gardent leur régime existant. Interrupteurs d'URL :
     `?img=max` = tout à l'ancien · `?img=a,c` = SEULEMENT ces leviers · `?imgsans=b` = tous sauf ceux-là. `dbgImg()` décrit. */
  P.imgMax=/[?&]img=max\b/.test(location.search);
  const iSeul=/[?&]img=([a-j](?:,[a-j])*)(?:&|$)/.exec(location.search)||(/[?&]img=13(?:&|$)/.test(location.search)?[0,'a']:null), /* `?img=13` : le préréglage « doux » (OPTI ULTIME, 8/11) = SEUL le halo en demi-résolution ; plafond 1,5, ombre 1024, ciel et traits entiers = l'image d'avant moins le halo */ iSans=/[?&]imgsans=([a-j](?:,[a-j])*)(?:&|$)/.exec(location.search),iPlus=/[?&]imgplus=([a-j](?:,[a-j])*)(?:&|$)/.exec(location.search),iNeuf={g:0,i:1,j:0};
  /* (2026-11-08, dernière salve, OPTI ULTIME) les leviers g (précision mediump) et j (halo à 2 étages) sont À DEMANDER : éteints par défaut ; i (textures ≤ 2048, aniso 4) est ALLUMÉ par défaut sur téléphone récent (décision OPTI ULTIME 8/11) — table `iNeuf`, 1 = allumé, `?imgplus=g,i,j` les allume, `?img=max` / `?imgsans=` les éteignent. h (anticrénelage) = rien à faire : déjà coupé sur téléphone. */
  P.imgOn=function(l){return !!TEL_NATIF&&P.n>=2&&!P.imgMax&&(!iSeul||iSeul[1].split(',').indexOf(l)>=0)&&!(iSans&&iSans[1].split(',').indexOf(l)>=0)&&(!(l in iNeuf)||!!iNeuf[l]||!!(iPlus&&iPlus[1].split(',').indexOf(l)>=0));};
  P.bT=function(k,avant,l){const v=P.B[k];return v&&P.imgOn(l)?v[2]:avant;};
  window.dbgImg=function(){const o={};'abcdefgij'.split('').forEach(function(l){o[l]=P.imgOn(l);});return {telNatif:!!TEL_NATIF,palier:P.n,max:P.imgMax,leviers:o};}; // (banc)
  return P;})();
/* LES TOILES 2D RENDUES APRÈS L'ENVOI À LA PUCE (2026-10-14, passe perf mobile). MESURÉ (iPhone 7 émulé) : 184 toiles 2D vivantes = 52 Mo
   avant le premier écran — et iOS plafonne la mémoire de toiles d'une page (au-delà : toiles blanches, puis la page est tuée). Une toile
   qui n'a servi qu'à peindre UNE fois une `CanvasTexture` ne sert plus à rien dès que three l'a envoyée (`texture.onUpdate` est appelé
   juste après l'envoi, mipmaps comprises) : `texLibere(tex)` la vide alors (largeur = hauteur = 0 → la mémoire est rendue tout de suite,
   sans attendre le ramasse-miettes). ⚠ UNIQUEMENT pour une texture JAMAIS redessinée (aucun `needsUpdate` ultérieur, pas de redessin à
   l'arrivée de la police, image jamais relue par un autre code, texture jamais `dispose()` puis resservie). Le contexte 3D perdu ne
   demande rien : il RECHARGE la page (voir webglcontextrestored). Le palier se lit À L'ENVOI (pas à l'appel : des textures naissent
   avant PAL dans le fichier). Palier 2 : inchangé (toiles gardées, outils `dbg*` qui les relisent intacts).
   `toileRend(cv)` : pour une toile de TRAVAIL (copiée dans une autre puis jetée) — invisible, vaut pour tous les paliers. */
PAL.B.memToiles=[1,1,0]; // rendre les toiles des textures peintes une fois : ancien, moyen = oui · récent = comme avant
const MEM_ANCIEN=/[?&]memoire=ancien\b/.test(location.search); /* (2026-11-07, Perf 3 P1) `?memoire=ancien` = tout ce que la passe « mémoire » change est débrayé (libérations au portail, copies CPU gardées, sons) */
function memLibereCb(){this.array=null;}
/* `memLibere(g)` (2026-11-07, Perf 3 P1) : la copie JavaScript des attributs d'une géométrie STATIQUE est jetée une fois envoyée au GPU (même mécanisme que nuLibre / grtLibere).
   MESURÉ (instantané de tas, iPhone émulé) : les tampons typés des géométries font ~270 des ~350 Mo de `performance.memory`. ⚠ UNIQUEMENT pour une géométrie PROPRE à une piste
   (jamais partagée d'une piste à l'autre, jamais réécrite ensuite) ; les attributs dynamiques et d'instances restent. `?memoire=ancien` = tout gardé. */
function memLibere(g){if(MEM_ANCIEN||!g||!g.attributes)return g;
  try{if(g.attributes.position){if(!g.boundingBox)g.computeBoundingBox();if(!g.boundingSphere)g.computeBoundingSphere();}}catch(e){} /* les boîtes se lisent encore après (fruitLeve…) : calculées AVANT de jeter le tableau */
  for(const k in g.attributes){const a=g.attributes[k];if(a&&a.array&&!a.__bpe&&!a.isInstancedBufferAttribute&&a.usage===THREE.StaticDrawUsage){a.__bpe=a.array.BYTES_PER_ELEMENT;a.onUpload(memLibereCb);}}
  const i=g.index;if(i&&i.array&&!i.__bpe&&i.usage===THREE.StaticDrawUsage){i.__bpe=i.array.BYTES_PER_ELEMENT;i.onUpload(memLibereCb);}
  return g;}
function toileRend(cv){try{if(cv&&cv.getContext)cv.width=cv.height=0;}catch(e){}}
function texLibere(tex){if(!tex||tex._lib)return tex;tex._lib=1;const av=tex.onUpdate;
  tex.onUpdate=function(t){if(av)av(t);t.onUpdate=av||null;if(PAL.b('memToiles',0)||ALLEGE){toileRend(t.image);MEM_TOILES.n++;} /* (2026-11-05, jury RND-03) tout téléphone (ALLEGE), pas seulement les paliers ancien/moyen : un iPhone récent est au palier 0 */};return tex;}
const MEM_TOILES={n:0};window.dbgToiles=function(){return {palier:PAL.n,actif:PAL.b('memToiles',0)||ALLEGE,rendues:MEM_TOILES.n};}; // (dev) combien de toiles ont été rendues
function palPuce(gl9){ // (après la création du contexte) la puce graphique, là où le navigateur la dit (Android) : une puce d'entrée de gamme rabat le palier
  try{const x=gl9.getExtension('WEBGL_debug_renderer_info'),r=x?String(gl9.getParameter(x.UNMASKED_RENDERER_WEBGL)||''):'';PAL.puce=r;
    if(PAL.src==='?palier'||PAL.src==='appris en course'||!IS_MOBILE||FORCE_TEL)return;
    const vieux=/Adreno \(TM\) [1-5]\d\d|Mali-(4|T\d|G5[127]|G3\d|G71|G72)|PowerVR (SGX|Rogue G[6E])|Apple A(7|8|9|10)\b/i.test(r),moyenne=/Adreno \(TM\) 6[0-4]\d|Mali-G(7[6-8]|6[18])/i.test(r);
    const n=vieux?0:moyenne?Math.min(PAL.n,1):PAL.n;if(n<PAL.n){PAL.n=n;PAL.bas=n===0;PAL.moyen=n<=1;PAL.src+=' · '+r.slice(0,40);try{document.documentElement.dataset.palier=String(n);}catch(e){}}}catch(e){}}
window.dbgPalier=function(n){ if(n!=null){const u=new URL(location.href);u.searchParams.set('palier',String(n|0));location.href=u.toString();return 'rechargement au palier '+(n|0);}
  return {n:PAL.n,nom:['ANCIEN','MOYEN','RÉCENT'][PAL.n],src:PAL.src,ios:PAL.ios,banc:PAL.banc,mem:PAL.mem,puce:PAL.puce,appris:PAL.appris,budgets:Object.keys(PAL.B).reduce(function(o,k){o[k]=PAL.B[k][PAL.n];return o;},{})};}; // (banc)
const REDUCED_MOTION=(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||false; // ACCESSIBILITÉ : iOS « Réduire les animations » → coupe bloom + grain + effets de vitesse
if(REDUCED_MOTION)document.documentElement.setAttribute('data-reduced-motion','1');
const FOVP_K=REDUCED_MOTION?.3:1; // (2026-09-30) « Réduire les animations » : les COUPS de champ (fovPunch — nitro, boost, drift, +34° à l'entrée en orbite) à 30 %, là où ils s'appliquent
/* (2026-10-14, passe SENSATIONS — Sacha : « sans changer radicalement le gameplay, en se focalisant sur le fun et les sensations, rajoute
   des petits détails : conduite, vol, animation, bumps, collisions, explosions, quand tu vas dans l'eau… que ce soit jouissif sur mobile »)
   UN interrupteur pour tout ce que la passe ajoute : `?sens=0` dans l'adresse rend le jeu d'AVANT (à comparer côte à côte, ou à couper
   d'un coup si un détail gêne). Rien de ce qui est gardé par SENS ne touche la physique, les vitesses ni l'économie : du ressenti seul. */
var SENS=!/[?&]sens=0/.test(location.search); var SENSG=SENS; /* le même drapeau sous un nom que rien ne masque : le bloc tactile a un `const SENS` local (l interface), qui le cachait → « Cannot access SENS before initialization », le jeu ne démarrait plus */
try{matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',function(e){if(e.matches)document.documentElement.setAttribute('data-reduced-motion','1');else document.documentElement.removeAttribute('data-reduced-motion');});}catch(e){} // (2026-09-29) le réglage d'iOS change en cours de partie : les règles qui ne lisent que l'attribut suivent
/* ===== LA TOILE SANS MSAA (2026-11-05, Sacha : « le lien Vercel a des latences et prend beaucoup de mémoire sur mon ordi, règle ça de manière durable ») =====
   MESURÉ (memory-infra de Chrome, écran 2560×1440 ×1,5, colonne de l'ordi : toile 2631×1216) : `antialias:true` donnait à la toile un tampon multi-échantillons
   ×4 et sa profondeur — 49 + 49 Mo dans le processus de rendu, autant à la carte graphique, et un « resolve » à chaque image. Or depuis le 25/10 (FXAA partout)
   la toile ne reçoit plus que la passe finale du compositeur (un quad plein écran : rien à anticréneler) ; la scène se dessine dans la cible du compositeur,
   et l'anticrénelage est le FXAA de la passe finale. Même image au pixel près, ~100 Mo de moins. `?msaa=1` (l'ancien choix, voir FXAA_ON) garde le tampon. */
const MSAA_TOILE=/[?&]msaa=1\b/.test(location.search);
const t9rend=performance.now();
PAL.B.imgPrec=['highp','highp','mediump']; /* (2026-11-08, levier g, À DEMANDER `?imgplus=g`) précision des shaders sur téléphone : mediump = 16 bits sur les GPU Apple (moitié de registres/ALU). ⚠ three r128 la pose sur le sommet ET le fragment : positions du monde en 16 bits si le GPU la respecte — à juger sur l'iPhone, jamais par défaut */
const renderer=new THREE.WebGLRenderer({antialias:!ALLEGE&&!IS_LOW_END&&MSAA_TOILE,powerPreference:'high-performance',precision:PAL.bT('imgPrec','highp','g')});
const TOILE1=!/[?&]toile1=0\b/.test(location.search); /* (2026-11-05, passe perf mobile 2, A2.c) UNE seule allocation de la toile : sa taille se pose plus bas, une fois DPR_CAP connu (`?toile1=0` = l'ancien ordre : taille puis rapport de pixels) */
if(!TOILE1)renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);
try{window.__ccSondeCrea&&window.__ccSondeCrea('#renderer',t9rend,performance.now()-t9rend);}catch(e){}try{const t9p=performance.now();palPuce(renderer.getContext());window.__ccSondeCrea&&window.__ccSondeCrea('palPuce',t9p,performance.now()-t9p);}catch(e){}
if(!/[?&]clear0=0\b/.test(location.search))try{const t9c=performance.now();renderer.clear();window.__ccSondeCrea&&window.__ccSondeCrea('#clear-1er',t9c,performance.now()-t9c);}catch(e){} /* (2026-11-07, OPTI ULTIME : « 571-924 ms avec ~130 ms de JS : attente de la puce ») UNE image vide à la création du renderer, avant tout dessin : la 1re présentation du canevas se paie ici, sous le film, et non avec la 1re vraie image. Non démontré : `?clear0=0` = avant. */ // (2026-10-14, passe perf mobile) le palier affiné par la puce graphique — voir PAL
/* ⚠ LE CONTEXTE 3D PERDU (2026-09-25, audit App Store) : iOS reprend la carte graphique d'une app en arrière-plan
   (appel, appareil photo, jeu lourd). Sans ces deux écouteurs, le jeu revenait sur un ÉCRAN NOIR définitif — le
   refus classique pour « l'app ne répond plus ». On empêche l'abandon (`preventDefault` = « je veux le récupérer »),
   et au retour du contexte on recharge proprement : la sauvegarde est sur le disque, rien n'est perdu. */
// (2026-09-30) les trois chemins finissent par un RECHARGEMENT : la partie en cours est posée (enCoursPose) avant d'être perdue — SAVE.load la versera
/* LA MÉMOIRE À LA LOUPE (2026-11-06, OPTI ULTIME : « à la fin d'une partie, parfois, retour à l'écran du début » = un rechargement ; la boîte noire doit dire si c'est le contexte 3D) :
   une ligne de compteurs — temps de session, écran (classe du body), tas JS si le navigateur le dit, textures / géométries / programmes de three.js, parties finies de la session
   (sessionStorage.ccParties, +1 à chaque endGame). Lue à la perte du contexte (genre « contexte ») et à la fin de chaque partie (genre « memoire ») : la pente d'une partie à l'autre
   dit si la mémoire monte. Lecture seule, rien ne bouge ; `?sonde=0` coupe. */
function ccMemLigne(){let r='';try{const m=renderer.info&&renderer.info.memory||{},pm=window.performance&&performance.memory,pr=renderer.info&&renderer.info.programs,k=+sessionStorage.ccParties||0;
  r=(Math.round(performance.now()/100)/10)+' s · '+(document.body&&document.body.className||'').slice(0,60)+' · tas '+(pm&&pm.usedJSHeapSize?Math.round(pm.usedJSHeapSize/1048576)+' Mo':'-')+' · textures '+m.textures+' géométries '+m.geometries+' programmes '+(pr?pr.length:'-')+' · partie n°'+k;}catch(err){r='? '+(err&&err.message);}return r;}
function ccMemNote(genre,pre){if(/[?&]sonde=0\b/.test(location.search))return;try{window.__ccNote(genre,(pre||'')+ccMemLigne());}catch(err){}}
renderer.domElement.addEventListener('webglcontextlost',function(e){e.preventDefault();ccMemNote('contexte','perdu ');try{sessionStorage.ccCtxPerdu=(+sessionStorage.ccCtxPerdu||0)+1;}catch(err){}try{enCoursPose();SAVE.flush();}catch(err){}},false); // (compteur de session : `sessionStorage.ccCtxPerdu` dit combien de fois c'est arrivé)
renderer.domElement.addEventListener('webglcontextrestored',function(){try{enCoursPose();SAVE.flush();}catch(e){}ctxRecharge();},false); /* (2026-11-05, DEBUG-TOTAL) par ctxRecharge : ce chemin rechargeait SANS lire le compteur — contexte perdu puis rendu à chaque relance (mémoire graphique saturée) = rechargement en boucle, le filet des 5 s n'y passant jamais */
/* ===== LE CONTEXTE PERDU AU PREMIER PLAN (24/10, débogage sortie iOS : « zéro écran bloqué ») =====
   Les deux chemins du dessus attendent un événement : le contexte RENDU (webglcontextrestored) ou le RETOUR d'arrière-plan (visibilitychange).
   Perdu alors que l'appli reste à l'écran (pression mémoire de la carte graphique, processus GPU de WebKit relancé) et jamais rendu : rien ne
   venait — toile noire pour toujours, la course continuait à l'aveugle sous le HUD. Banc (perte sans retour, en course) : 3 s de noir, aucune
   reprise. Filet : 5 s après la perte, toujours perdu et toujours visible → le même rechargement (la partie a été posée à la perte). */
/* (même passe, intégration) PAS DE RECHARGEMENT EN BOUCLE : si la carte graphique reprend le contexte juste après chaque relance (mémoire
   saturée), le filet relançait toutes les ~20 s sans fin. À la 4e perte de la session (sessionStorage.ccCtxPerdu, compté plus haut), on pose
   l écran « CASH CAR a calé » (window.__crash) : le joueur touche RELANCER quand il veut, sa progression est sauvegardée. */
renderer.domElement.addEventListener('webglcontextlost',function(){setTimeout(function(){try{if(!document.hidden&&renderer.getContext().isContextLost()){ctxRecharge();}}catch(e){}},5000);},false);
function ctxRecharge(){let n9=0;try{n9=+sessionStorage.ccCtxPerdu||0;}catch(e){}if(n9>3&&typeof window.__crash==='function')window.__crash((ccCtxEn()?'3D context lost ':'contexte 3D perdu ')+'×'+n9,'');else location.reload();} /* LE rechargement après un contexte 3D perdu, pour les trois chemins : à la 4e perte de la session, l'écran « a calé » au lieu d'une boucle */
function ccCtxEn(){let l9='';try{l9=localStorage.ccLang||'';}catch(e){}return l9?l9!=='fr':!/^fr/i.test(navigator.language||'fr');}
// (2026-09-29, audit de sortie) iOS peut garder le contexte PERDU au retour d'arrière-plan sans jamais le rendre : écran noir pour toujours.
// Au retour, s'il est encore perdu 1,5 s plus tard, on relance (la sauvegarde a été écrite à la perte).
addEventListener('visibilitychange',function(){if(document.hidden)return;setTimeout(function(){try{if(!document.hidden&&renderer.getContext().isContextLost()){try{enCoursPose();SAVE.flush();}catch(e){}ctxRecharge();}}catch(e){}},1500);});
let DPR_CAP=Math.min(devicePixelRatio,ALLEGE?1:1.5),curDPR=Math.min(DPR_CAP,devicePixelRatio),dprT=0; // téléphone .66→1 (2026-09-24) : la résolution adaptative sait désormais REMONTER, elle protège la fluidité
// PLANCHER DE L'ADAPTATIF : sur téléphone on a le droit de descendre BAS. `setPixelRatio` ne touche
// que le canvas 3D — le HUD est du DOM, il reste net au pixel quoi qu'il arrive. On enlève donc les
// pixels là où ils coûtent (raymarch, bloom, ombres) sans jamais flouter une jauge.
/* LE MAX SUR ORDINATEUR (2026-10-25, Sacha : « Vercel = la version maximum ») MESURÉ (Chrome, fenêtre 1440×900 ×2, cadre téléphone) : le jeu voit un écran de
   844×390 à densité 3,16 (la page-cadre zoome l'iframe), mais la course était plafonnée à DPR_CAP 1,5 : dessinée en 1 266 px de large puis étirée sur ~2 670 px
   physiques — le flou du PC. Désormais l'ordi (pas ALLEGE) dessine aux pixels RÉELS de l'écran, dans un budget de pixels (PC_PX, 4,5 M : ~4K/2) ; le téléphone
   garde son plafond de palier (`dprNetCap`). RAPIDE (choix du joueur) reste à 1. `?pcpx=N` (millions de pixels) règle le budget au banc, `?pcpx=0` = l'ancien plafond 1,5. */
/* ===== LA 4K À LA MESURE DE LA MÉMOIRE (2026-11-05, Sacha, après le bilan mémoire de l'ordi : « Résolution 4K ») =====
   MESURÉ sur l'ordi de Sacha (écran 3840×2160 à 150 % : dans la colonne le jeu voit 844×390 à densité 4,2, soit 5,8 Mpx d'écran) : la course se
   dessinait au budget plein (3,2 Mpx, toile 2631×1216) et la vitrine du menu à 4,2 Mpx — toile, cibles demi-flottantes du compositeur, halo : 300 à
   600 Mo de carte graphique, sur une machine à 1,5 Go de libre. Sur un écran de CLASSE 4K (≥ 4,5 Mpx dans la colonne : 4K à 100 ou 150 %), les budgets
   passent à 2,0 Mpx en course (toile ~2080×961 : 1,7 pixel d'écran par pixel 3D, le FXAA et le zoom bilinéaire lissent) et 2,6 Mpx à la vitrine.
   Un écran 1080p ou 1440p ne change pas d'un pixel : il est sous les budgets, il dessine à ses pixels réels (1440p à 100 % : 2,9 Mpx).
   `?4k=0` = les budgets d'avant (A/B) ; `?pcpx=` et `?vhdpc=` priment toujours (le `?vhdpc=` ne marchait pas : `[d.]` au lieu de `[\d.]`, corrigé). */
/* (2026-11-06, Léo : « le jeu est de mauvaise qualité sur iMac Safari ») UN ÉCRAN RETINA N'EST PAS UN 4K À 100 % : un iMac (densité 2) dans une fenêtre de taille normale (≤ 2,6 Mpx de points CSS, soit 1920 × 1350) a plus de 4,5 Mpx
   de pixels physiques, donc la règle « classe 4K » (budget 2,0 Mpx, vitrine 2,6) le prenait pour un téléviseur 4K : la 3D était dessinée à ~1,4 pixel par point, agrandie ×1,4 (floue) pendant que l'interface restait nette.
   Elle retrouve les budgets des écrans normaux (3,2 Mpx en course, 4,2 à la vitrine) et un plancher de 1,5 ; la résolution adaptative (QL) sait toujours baisser. `?retina=0` = avant. */
/* ===== LA 4K SE MESURE SUR L'ÉCRAN, PAS SUR LA COLONNE (2026-11-07, chasse aux bugs RND-N01 : « RETINA_OK est calculé sur l'iframe, donc VRAI sur un écran 4K ») =====
   Dans la page-cadre de l'ordi le jeu voit 844×390 POINTS à densité 3 à 4,5 (le zoom du cadre est compté dans devicePixelRatio) : 0,33 Mpx de points, loin sous les 2,6 Mpx
   de la règle Retina, et une densité ≥ 2 — un 4K à 150 % passait donc pour un iMac (RETINA_OK vrai), PC_4K tombait FAUX et les budgets remontaient à 3,2 / 4,2 Mpx : les
   300 à 600 Mo de carte graphique que la v1173 voulait retirer revenaient. ECRAN = la fenêtre du PARENT (ses points CSS, SA densité : celle de l'écran, sans le zoom du
   cadre — ce que tete.html lit aussi pour CC_DPR_CADRE) ; hors cadre, la fenêtre elle-même ; parent inaccessible : screen.width × screen.height à la densité vue.
   MESURÉ (Chrome headless, page-cadre de l'ordi, dbgVhdEcran / dbgNette, course sur les nuages) : fenêtre 1920×1080 ×1 → ECRAN 1898×982 pts, 1,9 Mpx : pas 4K, pas Retina, course aux pixels réels (1757×812, 1,43 Mpx) ;
   2560×1440 ×1,5 (le 4K à 150 %, l'ordi de Sacha) → 2538×1342 pts, 7,7 Mpx physiques : 4K, course 2080×961 = 2,0 Mpx et vitrine 2,6 (avec `?ecran4k=0`, l'ancienne mesure : 2631×1216 = 3,2 Mpx, vitrine 4,2) ;
   3840×2160 ×2 → 31,5 Mpx : 4K, 2,0 / 2,6 ; 1920×1080 ×2 et 1920×1350 ×2 (iMac Retina) → RETINA_OK, 3,2 / 4,2 et plancher 1,5 : inchangés. `?ecran4k=0` = l'ancienne mesure, sur la colonne. */
const ECRAN=(function(){let w=innerWidth,h=innerHeight,d=devicePixelRatio||1,src='fenetre';
  if(window.parent!==window&&!/[?&]ecran4k=0\b/.test(location.search)){try{const p=window.parent;w=p.innerWidth;h=p.innerHeight;d=p.devicePixelRatio||d;src='parent';}catch(e){w=screen.width;h=screen.height;src='screen';}}
  return {w:w,h:h,d:+d.toFixed(3),src:src,pts:w*h,px:Math.round(w*h*d*d)};})();
const RETINA_OK=!/[?&]retina=0\b/.test(location.search)&&ECRAN.d>=2&&ECRAN.pts<=2.6e6;
const PC_4K=!/[?&]4k=0\b/.test(location.search)&&!RETINA_OK&&ECRAN.px>=4.5e6;
const PC_PX=(function(){const m=/[?&]pcpx=([\d.]+)/.exec(location.search);return m?+m[1]*1e6:PC_4K?2.0e6:3.2e6;})(); /* (2026-10-25, Sacha : « Chrome prend 1 700 Mo de GPU ») budget 4,5 M → 3,2 M : toujours les pixels réels d'un écran 1080p, mais plus la 4K/2 ; `?pcpx=4.5` = avant */
const VHD_PX_PC=(function(){const m=/[?&]vhdpc=([\d.]+)/.exec(location.search);return m?+m[1]*1e6:PC_4K?2.6e6:4.2e6;})(); /* budget de pixels de la vitrine du menu sur ordinateur (8,3 M avant) ; `?vhdpc=8.3` = avant */
/* (2026-11-06, Léo : « le jeu est de mauvaise qualité sur iMac Safari ») LE PLANCHER D'UN ÉCRAN RETINA : sur un iMac (densité 2), le budget de pixels (PC_PX) tombe sous 1,25 dès que la fenêtre dépasse ~1,3 Mpx de points CSS,
   et le plancher le retenait à 1,25 : la 3D était dessinée à 62 % des pixels de l'écran, puis agrandie ×1,6 (floue) pendant que l'interface DOM restait nette. Sur un écran de densité ≥ 2, le plancher monte à 1,5 (le plafond « NETTE »
   des téléphones) ; la résolution adaptative (QL) sait toujours baisser si la machine tire. `?pcmin=1.25` = avant. */
const PC_MIN=(function(){const m=/[?&]pcmin=([\d.]+)/.exec(location.search);return m?+m[1]:(RETINA_OK?1.5:1.25);})();
PAL.B.imgDprCap=[1.25,1.35,1.25];PAL.B.imgQlDepart=[5,2,1];/* (2026-11-07, passe perf 3, P2 · levier c) téléphone récent : plafond NETTE 1,25 au lieu de 1,5 (−31 % de pixels : 513 000 au lieu de 740 000 sur un 390×844) et la course part au cran 1 de l'échelle QL ; `?img=max` / `?imgsans=c` = comme avant */
function dprPlafond(fast){ if(fast)return Math.min(devicePixelRatio,1);
  if(ALLEGE||!PC_PX)return Math.min(devicePixelRatio,PAL.bT('imgDprCap',PAL.b('dprNetCap',1.5),'c'));
  return Math.min(devicePixelRatio,Math.max(PC_MIN,Math.sqrt(PC_PX/Math.max(1,innerWidth*innerHeight))),4);}
/* ===== UNE SEULE ALLOCATION DE LA TOILE (2026-11-05, passe perf mobile 2, A2.c) =====
   MESURÉ (Chrome iPhone émulé ×4, palier 0) : `renderer.setSize` 2 fois avant le menu — la 1re à 1 pixel/point avec DPR_CAP provisoire, la 2e (`applyQ` → `qlReprise` → `applyDPR`, ~1,1 s) une fois le choix RAPIDE/NETTE connu :
   toile et cibles du compositeur réallouées. Ici le plafond est calculé tout de suite depuis la sauvegarde brute (même règle que `sauvegarde.js` : `q`, `qChoisi`, défaut du palier), AVANT le 1er `setSize` ;
   `applyQ` (mobile-tactile.js) ne refait rien si `DPR_CAP` n'a pas bougé. Une sauvegarde illisible ou miroir natif encore vide : repli RAPIDE, puis `applyQ` corrige comme avant. `?toile1=0` = avant. */
PAL.B.dprNetCap=[1.25,1.35,1.5]; /* le même budget que `rendu/nettete-qualite.js` (qui le redéclare, identique) : il doit exister AVANT le 1er dessin de la toile, sinon `dprPlafond` lirait le repli 1,5 et la toile serait allouée au mauvais rapport */
let TOILE1_Q=null; /* le choix d'image (fast|net|haute) lu d'avance ; null = l'ancien ordre */
if(TOILE1){try{let r9=null;try{r9=JSON.parse(localStorage.getItem('cashcarSave')||'null');}catch(e){}r9=r9&&typeof r9==='object'?r9:{};
  const netq=r9.q==='net'||r9.q==='haute',choisi=r9.qChoisi===1||(r9.qChoisi===undefined&&netq);
  TOILE1_Q=choisi?(netq?r9.q:'fast'):((PAL.b('qNetDefaut',PAL.n>=2?1:0)||!ALLEGE)?'net':'fast');
  DPR_CAP=dprPlafond(TOILE1_Q==='fast');curDPR=Math.min(DPR_CAP,devicePixelRatio);}catch(e){TOILE1_Q=null;}
  renderer.setPixelRatio(curDPR);renderer.setSize(innerWidth,innerHeight);}
const DPR_MIN=(IS_MOBILE&&!FORCE_TEL)?.5:.6; // .42 était une bouillie de pixels — et on y restait coincé (voir la remontée dans loop)
// PORTRAIT : le `fov` de three est VERTICAL — sur un écran haut, le champ HORIZONTAL s'effondre.
// FOV_K rouvre l'angle, POR (0 paysage → 1 portrait) recadre la caméra. Les deux se règlent ENSEMBLE
// avec camBack/camH : reculer rapetisse, monter redresse, viser bas remonte la caisse dans le cadre.
let FOV_K=1,FOV_TK=1,POR=0;
function fovFit(snap){ const a=innerWidth/Math.max(1,innerHeight);
  PORC.k=a<1?Math.min(1.30,Math.max(1,.80/a)):1;
  PORC.p=Math.min(1,Math.max(0,(1-a)/.42)); // 16:9 → 0 · 9:16 → 1
  if(snap||PORC.snap){PORC.snap=false;FOV_K=PORC.k;POR=PORC.p;FOV_TK=Math.tan(FOV_K*.2*Math.PI)/Math.tan(.2*Math.PI);return;} // 36° = .2π : calé pour que le repos (72°) retombe pile sur 72×FOV_K — le cadrage portrait validé ne bouge pas
  porGlisse(); }
/* ===== LA ROTATION GLISSE (2026-10-29, Léo : « la transition visuelle du sens de l'écran et de la route plus smooth, plus logique ») =====
   Avant, portrait ↔ paysage faisait SAUTER le cadrage (POR, champ, recul et hauteur de caméra) d'un coup, pile 280 ms après le pivot.
   Maintenant fovFit ne fixe qu'une CIBLE ; POR, FOV_K et FOV_TK la rejoignent en ~0,6 s (sortie douce), sur leur propre
   requestAnimationFrame, donc la caméra, la vitrine du garage et le recadrage de l'image suivent le même mouvement.
   Une fois arrivés, les trois valent EXACTEMENT la cible (au bit près comme avant) ; `?rotation=ancien` = le saut d'avant. */
const PORC={k:1,p:0,snap:/[?&]rotation=ancien/.test(location.search),t:0,on:false};
function porGlisse(){ if(PORC.on)return; PORC.on=true; PORC.t=performance.now();
  (function pas(n){ const dt=Math.min(.05,Math.max(0,(n-PORC.t)/1000));PORC.t=n;
    const e=1-Math.exp(-dt*7.5),dp=PORC.p-POR,dk=PORC.k-FOV_K;
    if(Math.abs(dp)<.002&&Math.abs(dk)<.002){POR=PORC.p;FOV_K=PORC.k;PORC.on=false;}
    else{POR+=dp*e;FOV_K+=dk*e;}
    FOV_TK=Math.tan(FOV_K*.2*Math.PI)/Math.tan(.2*Math.PI);
    if(PORC.on)requestAnimationFrame(pas); })(PORC.t); }
// (2026-09-25) PORTRAIT : on élargit la TANGENTE, pas l'angle. Multiplier l'angle faisait exploser le champ à haute vitesse sur un
// vrai téléphone (135° en croisière, 162° en nitro, >180° = image retournée). Ici le zoom de vitesse garde le RAPPORT réglé sur PC,
// plafonné à 150°. Sur PC et en paysage (FOV_TK=1), la somme est identique au bit près.
function fovPor(d){return FOV_TK===1?d:Math.min(150,Math.atan(Math.tan(Math.min(170,d)*Math.PI/360)*FOV_TK)*360/Math.PI);}
fovFit(true); // RÉSOLUTION ADAPTATIVE — cap desktop 1.5 : sur Retina, 1.75→1.5 = −26 % de pixels, invisible sous bloom+grain (écran 1× : min() ne change rien)
renderer.setPixelRatio(curDPR);
let composer=null,bloomPass=null,acesPass=null,POST_ON=false,SHADOW_ON=true; // POST-PROCESSING (assigné juste après)
PAL.B.imgBloomRes=[1,1,.5];/* (2026-11-07, passe perf 3, P2 · levier a) le halo entre en DEMI-résolution sur un téléphone récent (colonnes ancien/moyen non lues) ; `?img=max` / `?imgsans=a` = comme avant */
let BLOOM_BASE=PAL.bT('imgBloomRes',1,'a');
const IMG_DYN={dens:null,vmin:200,ciel:0}; /* (2026-11-07, P2) l'état de la couche dynamique `imgRegle` (voir nettete-qualite.js) : densité imposée des traits d'air et traînées, au-delà de `vmin` km/h */
let BLOOM_RES=BLOOM_BASE; // (2026-09-27, passe perf iPhone) part de la résolution du bloom — un cran de l'échelle de qualité (QL) la baisse à ¾
/* (perf, lot 4) LA TAILLE DE L'ÉCRAN, LUE UNE FOIS PAR REDIMENSIONNEMENT. MESURÉ (profil, téléphone émulé) : sur Chrome mobile, lire
   `innerWidth`/`innerHeight` FORCE une mise en page complète (la page à « viewport » se remet en page pour répondre) — et comme le HUD
   venait d'écrire ses styles, chaque image en payait une : 7,7 % du processeur pendant la carte MOTEUR. Ce qui suit la caisse à l'écran
   lit désormais `VP`, tenu à jour ici (écouteur posé AVANT tous les autres : ils le trouvent déjà à jour). */
const VP={w:innerWidth,h:innerHeight};
addEventListener('resize',()=>{VP.w=innerWidth;VP.h=innerHeight;});
/* (2026-11-07, chasse PC-N02) LA DENSITÉ QUI CHANGE APRÈS LE CHARGEMENT (ordi) : la page-cadre dispatche un resize dans l'iframe quand son zoom change
   (tete.html, 2026-11-06), mais DPR_CAP n'était lu qu'une fois : fenêtre agrandie, F11 ou autre écran = 3D étirée et floue jusqu'au rechargement. Le téléphone
   garde son plafond (ALLEGE / TEL_NATIF). Anti-rebond de 150 ms : qlReprise réalloue la toile et les cibles. */
let DPR_VU=devicePixelRatio,DPR_VU_T=0;
addEventListener('resize',function(){if(ALLEGE||TEL_NATIF||Math.abs(devicePixelRatio-DPR_VU)<.01)return;clearTimeout(DPR_VU_T);
  DPR_VU_T=setTimeout(function(){DPR_VU=devicePixelRatio;try{DPR_CAP=dprPlafond(!!(typeof SAVE!=='undefined'&&SAVE.d&&SAVE.d.q==='fast'));if(typeof VHD!=='undefined'&&VHD.on){VHD.dpr=VHD.max=vhdDpr();VHD.murT=0;}qlReprise();}catch(e){}},150);});
/* ===== LE RESIZE REGROUPÉ (2026-11-07, finition : « des détails plus pro sans vraie différence ») ===== sur l'ordi, tirer le bord de la fenêtre
   lance des dizaines de `resize` par seconde : chacun réallouait les cibles du bloom (composer.setSize) et EFFAÇAIT les toiles 2D en réécrivant leur
   largeur. Désormais UNE retaille par image (rAF), et une toile n'est retaillée que si sa taille change. */
let retailleRaf=0;
addEventListener('resize',()=>{cancelAnimationFrame(retailleRaf);retailleRaf=requestAnimationFrame(()=>{retailleRaf=0;if(innerWidth<1||innerHeight<1)return; /* (2026-11-05, DEBUG-TOTAL) une fenêtre à 0 px (iframe du cadre cachée, rotation de WebView) : aspect infini, matrice NaN et toiles à 0 jusqu'au resize suivant — on attend une vraie taille */camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();fovFit();renderer.setSize(innerWidth,innerHeight);if(composer)composer.setSize(innerWidth,innerHeight);if(slCv.width!==innerWidth||slCv.height!==innerHeight){slCv.width=innerWidth;slCv.height=innerHeight;}if(juiceCv&&(juiceCv.width!==innerWidth||juiceCv.height!==innerHeight)){juiceCv.width=innerWidth;juiceCv.height=innerHeight;}});});
const hemi=new THREE.HemisphereLight(0xba86b6,0x18162e,0.40);scene.add(hemi); // ambiance VICE CITY NUIT (assombrie) : ciel rose-mauve baissé, sol indigo — la pénombre gagne, les lumières de la caisse vivent (nommée : les BIOMES la pilotent)
const sun=new THREE.DirectionalLight(0xff6a3c,1.45);sun.position.copy(SUN_DIR).multiplyScalar(3800);scene.add(sun); // BRAISE ROUGE-CORAIL : la lumière rasante peint le bitume en rouge sombre — golden hour devenue red hour
const fill=new THREE.DirectionalLight(0x4f74e8,.24);fill.position.set(-200,-400,-100);scene.add(fill); // fill BLEU NÉON par en dessous : les ventres de caisse prennent la ville
const kick=new THREE.DirectionalLight(0xff3d9e,.20);kick.position.set(-520,260,410);scene.add(kick); // baiser MAGENTA venu de la ville : le flanc opposé au soleil prend le néon
/* Paris retiré — tout est misé sur le CIEL : couchant, nuages irisés, pigeons ramiers */

