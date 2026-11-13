/* ===== LE PLAN DE FEU (2026-11-10, Sacha : « mets-toi dans la peau d'un light designer senior […] le jeu magnifique, dans la même DA, sans que ce soit
   plus lourd sur téléphone ») =====
   La couche de LUMIÈRE, posée après l'équilibre des maps. Jugée sur le chemin de l'iPhone (banc outils/banc-lumiere/studio.py : la même image figée,
   plusieurs réglages côte à côte), pas sur l'ordinateur. Une seule idée, celle d'un plateau : L'ÉCHELLE DES CLARTÉS. La caisse est la vedette, les
   sources (phares, néons, tuyères, pièces) passent devant, la route est le SOL DE SCÈNE :
   · LA NUIT ET SOUS LA TERRE, le sol recule : béton plus sombre et refroidi en bleu nuit (c'était une dalle lavande claire, L* 47-67 — plus claire que
     tout le reste de l'image : la flaque des phares, les bords néon et la caisse s'y noyaient), contre-jour rose et liseré plus forts : la caisse se
     découpe en braise sur l'encre, les phares redeviennent une lumière ;
   · À MIDI au-dessus des nuages, le sol remonte (il sortait presque noir, L* 22-28, sur les pentes à l'ombre) ; le ciel photo et la mer de
     cumulus retrouvent l'azur (CIEL_ARC, chute-menu.js) et perdent la sarcelle des ombres (daSh).
   Que des valeurs d'ambiance (rtK, rtT, kickI, rimS, daSh) : zéro programme, zéro lecture de texture, zéro lumière de plus. `?lumiere=0` = l'image
   d'avant au bit près ; `dbgLumiere(nom,{…})` essaie une retouche à chaud. Champs : ceux de l'équilibre (expo, sat, con, rtK ×…) + `kick` (× kickI). */
const LUMIERE_ON=!/[?&]lumiere=0\b/.test(location.search);
const PLAN_FEU={
  nuagesMidiCC:{rtK:1.12,rimS:.5,daSh:.25}, /* daSh : la sarcelle des ombres verdissait le ciel photo et la mer de cumulus (voir CIEL_ARC, chute-menu.js) */
  nuagesMatinCC:{daSh:.25},
  canyonSoir:{rtK:.82,rtT:[.95,.97,1.05],kick:1.4,rimS:.6}, /* la gorge au couchant : le sol à l'ombre prend le bleu du ciel, complémentaire des parois rouges */
  jade:{rtK:.8,kick:1.4,rimS:.6},                            /* le soir de Jade : le béton un cran plus profond sous le ciel d'or */
  canyonNuit:{rtK:.62,rtT:[.86,.93,1.14],kick:1.5,rimS:.7},
  espaceMatin:{rtK:.62,rtT:[.86,.93,1.14],kick:1.5,rimS:.7},
  'grt-matin':{rtK:.62,rtT:[.92,.96,1.08],kick:1.5,rimS:.7},'grt-midi':{rtK:.62,rtT:[.92,.96,1.08],kick:1.5,rimS:.7},'grt-soir':{rtK:.62,rtT:[.92,.96,1.08],kick:1.5,rimS:.7},'grt-nuit':{rtK:.62,rtT:[.92,.96,1.08],kick:1.5,rimS:.7},'grt-glace':{rtK:.62,rtT:[.92,.96,1.08],kick:1.5,rimS:.7}}; /* sous la terre, les cinq temps : la roche et les cristaux éclairent, pas la dalle */
function feuApplique(b,r){const k=r.kick;if(k!=null&&typeof b.kickI==='number')b.kickI=+(b.kickI*k).toFixed(3);const q={};for(const f in r)if(f!=='kick')q[f]=r[f];
  /* rtT (la teinte du béton) est POSÉE telle quelle : c'est la valeur jugée au studio */
  eqApplique(b,q);}
function feuPose(T){for(const k in T){const r=T[k];if(BIOMES[k])feuApplique(BIOMES[k],r);else if(/^grt-/.test(k))for(const n in BIOMES)if(n.indexOf(k+'-')===0)feuApplique(BIOMES[n],r);}}
if(LUMIERE_ON)feuPose(PLAN_FEU);
window.dbgLumiere=function(n,r){if(n&&r){const b=BIOMES[n];if(!b)return null;feuApplique(b,r);if(BIO.name===n||BIO.to===b){bioLerp(b,b,1,BIO.cur);bioApply(BIO.cur);}}return {on:LUMIERE_ON,plan:PLAN_FEU};};
/* ===== LA NUIT D'ARGENT 2 DES DUNES (2026-11-13, Sacha : « la map dune nuit est plutôt moche sur iPhone, retravaille les couleurs en restant optimisé ») =====
   Jugée au studio sur le chemin iPhone (portrait, pistegraine 777, mêmes images côte à côte). AVANT : tout dans UN bleu roi saturé (ciel chroma 85, dunes
   lointaines bleu glacier pailletées de blanc, route lavande) — la nuit des dunes se lisait comme le glacier. APRÈS, une nuit à deux températures :
   · le CIEL : marine au zénith → argent-acier à l'horizon (le même niveau de clarté, moitié moins de chroma) ;
   · le SABLE : beige sous la lune (dnA/dnB/dnL chauds), ombres bleues (dnS) — le complémentaire fait le relief ; paillettes d'OR au lieu de bleu-blanc ;
   · la LUNE argent neutre (sunC), le ciel de l'hémisphère moins bleu, le remplissage turquoise de la map adouci ;
   · la ROUTE en sol de scène graphite (rtK, rtT) : la caisse, les phares et les rails turquoise passent devant ; l'exposition remonte d'un cran (la moyenne
     de l'image reste celle d'avant : Sacha trouvait déjà les maps sombres).
   Valeurs POSÉES (celles du studio), après l'équilibre et le plan de feu. Que des valeurs d'ambiance : zéro programme, zéro texture, zéro lumière de plus.
   `?dunesnuit=0` = la nuit d'avant au bit près (DN_ARGENT, dunes-2.js : aussi la teinte du satin du sable). */
if(DN_ARGENT&&BIOMES.dunesNuit)Object.assign(BIOMES.dunesNuit,{
  cyZ:[.06,.085,.20],cyM:[.10,.13,.24],cyH:[.22,.24,.31],jZen:[.06,.085,.20],jMid:[.10,.13,.24],jHor:[.22,.24,.31],cyR:[.08,.085,.13],
  fog:[.12,.13,.19],fogCj:[.17,.18,.24],fogIn:[.16,.17,.23],
  hemiS:[.26,.30,.46],sunC:[.86,.84,.86],sunI:.75,fillC:[.24,.42,.48],
  dnA:[.46,.40,.34],dnB:[.36,.31,.27],dnL:[.80,.77,.72],dnS:[.56,.60,.80],dnH:[.10,.11,.16],dnP:[1,.82,.50,.35],
  rtK:.55,rtT:[1.06,1,.86],expo:1.04});
