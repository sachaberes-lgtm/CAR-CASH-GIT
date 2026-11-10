/* ===== LE PLAN DE FEU (2026-11-10, Sacha : « mets-toi dans la peau d'un light designer senior […] le jeu magnifique, dans la même DA, sans que ce soit
   plus lourd sur téléphone ») =====
   La couche de LUMIÈRE, posée après l'équilibre des maps. Jugée sur le chemin de l'iPhone (banc outils/banc-lumiere/studio.py : la même image figée,
   plusieurs réglages côte à côte), pas sur l'ordinateur. Une seule idée, celle d'un plateau : L'ÉCHELLE DES CLARTÉS. La caisse est la vedette, les
   sources (phares, néons, tuyères, pièces) passent devant, la route est le SOL DE SCÈNE :
   · LA NUIT ET SOUS LA TERRE, le sol recule : béton plus sombre et refroidi en bleu nuit (c'était une dalle lavande claire, L* 47-67 — plus claire que
     tout le reste de l'image : la flaque des phares, les bords néon et la caisse s'y noyaient), contre-jour rose et liseré plus forts : la caisse se
     découpe en braise sur l'encre, les phares redeviennent une lumière ;
   · À MIDI au-dessus des nuages, le sol remonte (il sortait presque noir, L* 22-28, sous un plein soleil) et la clé se réchauffe d'un cran.
   Que des valeurs d'ambiance (rtK, rtT, kickI, rimS, sunC) : zéro programme, zéro lecture de texture, zéro lumière de plus. `?lumiere=0` = l'image
   d'avant au bit près ; `dbgLumiere(nom,{…})` essaie une retouche à chaud. Champs : ceux de l'équilibre (expo, sat, con, rtK ×…) + `kick` (× kickI). */
const LUMIERE_ON=!/[?&]lumiere=0\b/.test(location.search);
const PLAN_FEU={
  nuagesMidiCC:{rtK:1.25,sunC:[1,.96,.86],rimS:.5},
  canyonSoir:{rtK:.72,rtT:[.93,.96,1.07],kick:1.4,rimS:.6}, /* la gorge au couchant : le sol à l'ombre prend le bleu du ciel, complémentaire des parois rouges */
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
