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
function toileRend(cv){try{if(cv&&cv.getContext)cv.width=cv.height=0;}catch(e){}}
function texLibere(tex){if(!tex||tex._lib)return tex;tex._lib=1;const av=tex.onUpdate;
  tex.onUpdate=function(t){if(av)av(t);t.onUpdate=av||null;if(PAL.b('memToiles',0)){toileRend(t.image);MEM_TOILES.n++;}};return tex;}
const MEM_TOILES={n:0};window.dbgToiles=function(){return {palier:PAL.n,actif:PAL.b('memToiles',0),rendues:MEM_TOILES.n};}; // (dev) combien de toiles ont été rendues
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
const renderer=new THREE.WebGLRenderer({antialias:!IS_MOBILE&&!IS_LOW_END,powerPreference:'high-performance'});
renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);
try{palPuce(renderer.getContext());}catch(e){} // (2026-10-14, passe perf mobile) le palier affiné par la puce graphique — voir PAL
/* ⚠ LE CONTEXTE 3D PERDU (2026-09-25, audit App Store) : iOS reprend la carte graphique d'une app en arrière-plan
   (appel, appareil photo, jeu lourd). Sans ces deux écouteurs, le jeu revenait sur un ÉCRAN NOIR définitif — le
   refus classique pour « l'app ne répond plus ». On empêche l'abandon (`preventDefault` = « je veux le récupérer »),
   et au retour du contexte on recharge proprement : la sauvegarde est sur le disque, rien n'est perdu. */
// (2026-09-30) les trois chemins finissent par un RECHARGEMENT : la partie en cours est posée (enCoursPose) avant d'être perdue — SAVE.load la versera
renderer.domElement.addEventListener('webglcontextlost',function(e){e.preventDefault();try{sessionStorage.ccCtxPerdu=(+sessionStorage.ccCtxPerdu||0)+1;}catch(err){}try{enCoursPose();SAVE.flush();}catch(err){}},false); // (compteur de session : `sessionStorage.ccCtxPerdu` dit combien de fois c'est arrivé)
renderer.domElement.addEventListener('webglcontextrestored',function(){try{enCoursPose();SAVE.flush();}catch(e){}location.reload();},false);
/* ===== LE CONTEXTE PERDU AU PREMIER PLAN (24/10, débogage sortie iOS : « zéro écran bloqué ») =====
   Les deux chemins du dessus attendent un événement : le contexte RENDU (webglcontextrestored) ou le RETOUR d'arrière-plan (visibilitychange).
   Perdu alors que l'appli reste à l'écran (pression mémoire de la carte graphique, processus GPU de WebKit relancé) et jamais rendu : rien ne
   venait — toile noire pour toujours, la course continuait à l'aveugle sous le HUD. Banc (perte sans retour, en course) : 3 s de noir, aucune
   reprise. Filet : 5 s après la perte, toujours perdu et toujours visible → le même rechargement (la partie a été posée à la perte). */
/* (même passe, intégration) PAS DE RECHARGEMENT EN BOUCLE : si la carte graphique reprend le contexte juste après chaque relance (mémoire
   saturée), le filet relançait toutes les ~20 s sans fin. À la 4e perte de la session (sessionStorage.ccCtxPerdu, compté plus haut), on pose
   l écran « CASH CAR a calé » (window.__crash) : le joueur touche RELANCER quand il veut, sa progression est sauvegardée. */
renderer.domElement.addEventListener('webglcontextlost',function(){setTimeout(function(){try{if(!document.hidden&&renderer.getContext().isContextLost()){let n9=0;try{n9=+sessionStorage.ccCtxPerdu||0;}catch(e){}if(n9>3&&typeof window.__crash==='function')window.__crash((ccCtxEn()?'3D context lost ':'contexte 3D perdu ')+'×'+n9,'');else location.reload();}}catch(e){}},5000);},false);
function ccCtxEn(){let l9='';try{l9=localStorage.ccLang||'';}catch(e){}return l9?l9!=='fr':!/^fr/i.test(navigator.language||'fr');}
// (2026-09-29, audit de sortie) iOS peut garder le contexte PERDU au retour d'arrière-plan sans jamais le rendre : écran noir pour toujours.
// Au retour, s'il est encore perdu 1,5 s plus tard, on relance (la sauvegarde a été écrite à la perte).
addEventListener('visibilitychange',function(){if(document.hidden)return;setTimeout(function(){try{if(!document.hidden&&renderer.getContext().isContextLost()){try{enCoursPose();SAVE.flush();}catch(e){}location.reload();}}catch(e){}},1500);});
/* (2026-10-25, Sacha : « Chrome prend 1 700 Mo de GPU, 1 800-2 000 en jeu ») LES DEUX PLAFONDS DE L'ORDINATEUR : la résolution de la 3D en course (1,5 → 1,25) et le budget de pixels de la vitrine du menu (8,3 M → 4,2 M ; la 4K tenait toute la carte). Le téléphone n'est pas touché. `?dprpc=1.5` · `?vhdpc=8.3` = les anciennes valeurs. */
const DPR_PC=(function(){const m=/[?&]dprpc=([d.]+)/.exec(location.search);return m?Math.min(2,Math.max(.6,+m[1]||1.25)):1.25;})();
const VHD_PX_PC=(function(){const m=/[?&]vhdpc=([d.]+)/.exec(location.search);return m?Math.min(16,Math.max(1,+m[1]||4.2))*1e6:4.2e6;})();
let DPR_CAP=Math.min(devicePixelRatio,IS_MOBILE?1:DPR_PC) /* (2026-10-25, Sacha : « trop de GPU ») plafond ordinateur 1,5 → 1,25 (−31 % de pixels) ; `?dprpc=1.5` = avant */,curDPR=Math.min(DPR_CAP,devicePixelRatio),dprT=0; // téléphone .66→1 (2026-09-24) : la résolution adaptative sait désormais REMONTER, elle protège la fluidité
// PLANCHER DE L'ADAPTATIF : sur téléphone on a le droit de descendre BAS. `setPixelRatio` ne touche
// que le canvas 3D — le HUD est du DOM, il reste net au pixel quoi qu'il arrive. On enlève donc les
// pixels là où ils coûtent (raymarch, bloom, ombres) sans jamais flouter une jauge.
const DPR_MIN=(IS_MOBILE&&!FORCE_TEL)?.5:.6; // .42 était une bouillie de pixels — et on y restait coincé (voir la remontée dans loop)
// PORTRAIT : le `fov` de three est VERTICAL — sur un écran haut, le champ HORIZONTAL s'effondre.
// FOV_K rouvre l'angle, POR (0 paysage → 1 portrait) recadre la caméra. Les deux se règlent ENSEMBLE
// avec camBack/camH : reculer rapetisse, monter redresse, viser bas remonte la caisse dans le cadre.
let FOV_K=1,FOV_TK=1,POR=0;
function fovFit(){ const a=innerWidth/Math.max(1,innerHeight);
  FOV_K=a<1?Math.min(1.30,Math.max(1,.80/a)):1;
  FOV_TK=Math.tan(FOV_K*.2*Math.PI)/Math.tan(.2*Math.PI); // 36° = .2π : calé pour que le repos (72°) retombe pile sur 72×FOV_K — le cadrage portrait validé ne bouge pas
  POR=Math.min(1,Math.max(0,(1-a)/.42)); } // 16:9 → 0 · 9:16 → 1
// (2026-09-25) PORTRAIT : on élargit la TANGENTE, pas l'angle. Multiplier l'angle faisait exploser le champ à haute vitesse sur un
// vrai téléphone (135° en croisière, 162° en nitro, >180° = image retournée). Ici le zoom de vitesse garde le RAPPORT réglé sur PC,
// plafonné à 150°. Sur PC et en paysage (FOV_TK=1), la somme est identique au bit près.
function fovPor(d){return FOV_TK===1?d:Math.min(150,Math.atan(Math.tan(Math.min(170,d)*Math.PI/360)*FOV_TK)*360/Math.PI);}
fovFit(); // RÉSOLUTION ADAPTATIVE — cap desktop 1.5 : sur Retina, 1.75→1.5 = −26 % de pixels, invisible sous bloom+grain (écran 1× : min() ne change rien)
renderer.setPixelRatio(curDPR);
let composer=null,bloomPass=null,acesPass=null,POST_ON=false,SHADOW_ON=true; // POST-PROCESSING (assigné juste après)
let BLOOM_RES=1; // (2026-09-27, passe perf iPhone) part de la résolution du bloom — un cran de l'échelle de qualité (QL) la baisse à ¾
/* (perf, lot 4) LA TAILLE DE L'ÉCRAN, LUE UNE FOIS PAR REDIMENSIONNEMENT. MESURÉ (profil, téléphone émulé) : sur Chrome mobile, lire
   `innerWidth`/`innerHeight` FORCE une mise en page complète (la page à « viewport » se remet en page pour répondre) — et comme le HUD
   venait d'écrire ses styles, chaque image en payait une : 7,7 % du processeur pendant la carte MOTEUR. Ce qui suit la caisse à l'écran
   lit désormais `VP`, tenu à jour ici (écouteur posé AVANT tous les autres : ils le trouvent déjà à jour). */
const VP={w:innerWidth,h:innerHeight};
addEventListener('resize',()=>{VP.w=innerWidth;VP.h=innerHeight;});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();fovFit();renderer.setSize(innerWidth,innerHeight);if(composer)composer.setSize(innerWidth,innerHeight);slCv.width=innerWidth;slCv.height=innerHeight;if(juiceCv){juiceCv.width=innerWidth;juiceCv.height=innerHeight;}});
const hemi=new THREE.HemisphereLight(0xba86b6,0x18162e,0.40);scene.add(hemi); // ambiance VICE CITY NUIT (assombrie) : ciel rose-mauve baissé, sol indigo — la pénombre gagne, les lumières de la caisse vivent (nommée : les BIOMES la pilotent)
const sun=new THREE.DirectionalLight(0xff6a3c,1.45);sun.position.copy(SUN_DIR).multiplyScalar(3800);scene.add(sun); // BRAISE ROUGE-CORAIL : la lumière rasante peint le bitume en rouge sombre — golden hour devenue red hour
const fill=new THREE.DirectionalLight(0x4f74e8,.24);fill.position.set(-200,-400,-100);scene.add(fill); // fill BLEU NÉON par en dessous : les ventres de caisse prennent la ville
const kick=new THREE.DirectionalLight(0xff3d9e,.20);kick.position.set(-520,260,410);scene.add(kick); // baiser MAGENTA venu de la ville : le flanc opposé au soleil prend le néon
/* Paris retiré — tout est misé sur le CIEL : couchant, nuages irisés, pigeons ramiers */

