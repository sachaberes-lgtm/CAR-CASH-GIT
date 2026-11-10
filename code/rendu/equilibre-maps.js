/* ===== L'ÉQUILIBRE DES MAPS (2026-11-06, Sacha : « trop de maps sont sombres et ternes, retravaille la colorimétrie de plusieurs manières pour avoir un
   équilibre entre chaque map du jeu ») =====
   La DERNIÈRE couche d'étalonnage, posée APRÈS la continuité : rien ici n'est inventé à côté, ce sont des RETOUCHES des ambiances existantes, map × météo,
   calées sur les MESURES du banc (banc-couleurs/ : L* moyen, L* de la route, du ciel, chroma, part de noirs du bas de l'image) contre une CIBLE PAR TEMPS.
   Plusieurs manières à la fois, parce qu'un seul bouton ne suffit pas (la saturation seule fait du « Cheetos », l'exposition seule lave) :
   · expo (×)  : la LUMIÈRE — les sombres remontent avant le tone mapping, les lavés descendent ;
   · sat (×), con (×) : la COULEUR et le PIQUÉ — les ternes reprennent de la chroma, les délavés du contraste ;
   · lev (+)   : le DÉBOUCHAGE — un plancher coloré dans les ombres (uSh), jamais du gris ;
   · vigK (=)  : la VIGNETTE — les nuits n'ont pas à perdre 50 % de leurs bords ;
   · rtK (×)   : la clarté de la ROUTE (le repère commun) ;
   · chr (0-1) : la TEINTE de l'air — brume, ciel de l'hémisphère, remplissage : leur couleur s'éloigne du gris (0 = inchangé) ;
   · lum (×)   : les LUMIÈRES de la scène (soleil, hémisphère, remplissage) — la 3D reçoit plus de lumière, pas seulement l'image.
   `?equilibre=0` = l'image d'avant au bit près ; `?equilibre=A` / `B` = les deux pistes (A : équilibre doux, B : pop franc). Que des valeurs : zéro programme. */
const EQUILIBRE=(function(){const m=/[?&]equilibre=([^&]*)/.exec(location.search);return m?decodeURIComponent(m[1]):'A';})();
function eqChroma(v,k){if(!Array.isArray(v)||v.length<3)return v;const l=.3*v[0]+.59*v[1]+.11*v[2],o=v.slice();for(let i=0;i<3;i++)o[i]=Math.max(0,l+(v[i]-l)*(1+k));return o;} /* la teinte s'éloigne du gris de k, la clarté reste */
function eqApplique(b,r){ /* une retouche r sur l'ambiance b (voir l'en-tête) */
  if(r.expo!=null)b.expo=+((b.expo==null?1:b.expo)*r.expo).toFixed(3);
  if(r.sat!=null)b.sat=+((b.sat==null?1:b.sat)*r.sat).toFixed(3);
  if(r.con!=null)b.con=+((b.con==null?1:b.con)*r.con).toFixed(3);
  if(r.lev!=null){const s=b.sh?b.sh.slice():[0,0,0];for(let i=0;i<3;i++)s[i]+=r.lev[i];b.sh=s;}
  if(r.vigK!=null)b.vigK=r.vigK;
  if(r.rtK!=null)b.rtK=+((b.rtK==null?1:b.rtK)*r.rtK).toFixed(3);
  if(r.chr!=null)for(const f of ['fog','fogCj','fogIn','hemiS','hemiG','fillC','jZen','jMid','jHor','cyZ','cyM','cyH','cyF'])if(b[f])b[f]=eqChroma(b[f],r.chr);
  if(r.lum!=null){for(const f of ['sunI','hemiI','fillI'])if(typeof b[f]==='number')b[f]=+(b[f]*r.lum).toFixed(3);}
  if(r.fogL!=null)for(const f of ['fog','fogCj','fogIn'])if(b[f])b[f]=b[f].map(function(v){return v*r.fogL;});
  for(const k in r)if(!/^(expo|sat|con|lev|vigK|rtK|chr|lum|fogL)$/.test(k))b[k]=Array.isArray(r[k])?r[k].slice():r[k]; /* tout autre champ : posé tel quel */
}
const EQM={A:{},B:{}}; /* les retouches, par piste puis par ambiance (une clé « grt-matin » touche les six salles de ce temps) */
/* PISTE A — L'ÉQUILIBRE DOUX : chaque couple ramené vers la cible de son temps (jour L* 50-57, soir 42-48, nuit 21-27, pluie 44-50, orage 29-35 ; route 32-45 de
   jour, 24-34 au soir, 15-23 la nuit ; chroma ≥ 50 de jour, ≥ 60 au soir, ≥ 52 la nuit) sans changer l'identité de la map. MESURÉ avant (banc-couleurs/etal) :
   les LAVÉES (nuages midi L* 65 / chroma 26 / route 66 ; nuages matin chroma 34 ; canyon pluie et orage chroma 26-27 ; orbite chroma 26) et les BOUCHÉES
   (canyon soir L* 16, canyon nuit L* 12 avec 24 % de noirs, grotte cristaux et magma L* 16, forêt orage L* 20, jade nuit L* 17, nuit des nuages L* 18). */
EQM.A={
  nuagesMatinCC:{sat:1.2,chr:.3,con:1.04,fogL:.96,rtK:.88},                      /* matin pâle : l'air reprend sa couleur, la brume un peu moins blanche */
  nuagesMidiCC:{expo:.9,sat:1.3,chr:.45,con:1.08,rtK:.62},                        /* le plus lavé du jeu : un cran d'exposition en moins, la couleur, le béton ramené de L* 66 à ~42 */
  nuagesSoir:{rtK:.8},                                                            /* déjà beau (chroma 65) : seule la route, trop claire pour un soir */
  nuagesNuit:{expo:1.15,lev:[.003,.005,.012],vigK:.26,lum:1.08},                   /* nuit bouchée (L* 18) : lumière, plancher d'encre bleue, vignette plus douce */
  tempete:{expo:1.08,sat:1.05},                                                   /* l'orage des nuages : un cran de lumière */
  cryptoMatin:{sat:.95,rtK:.75},                                                  /* déjà très coloré (chroma 73) : la route (L* 56) descend vers le gris commun */
  cryptoSoir:{sat:1.05},
  villeOrage:{expo:1.12,lev:[.004,.006,.014],vigK:.38,lum:1.12,rtK:1.2},         /* la ville au néon : elle garde sa nuit, mais 78 % de noirs en bas → on débouche sans la délaver (ses trois teintes en héritent) */
  jadeMatin:{sat:1.03},
  jadeMidi:{sat:.93,rtK:.78},                                                     /* chroma 101, route L* 54 : on redescend d'un cran vers les autres midis */
  jade:{sat:1.12,chr:.15,fogL:.93,rtK:.72,con:1.04},                               /* le soir de Léo : horizon trop blanc, route lavande L* 49 → béton plus sombre, air moins gris */
  jadeNuit:{expo:1.22,lev:[.003,.006,.012],vigK:.22,lum:1.1,sat:1.1,rtK:.85},    /* nuit encre-vert bouchée (ciel L* 8) */
  jadePluie:{con:1.03},
  jadeOrage:{sat:1.04,rtK:.75},
  espaceMatin:{expo:1.14,sat:1.15,chr:.2,lev:[.002,.003,.008],lum:1.08,rtT:[.95,.97,1.04]}, /* (2e essai : à 1,18 × 1,1 et rtT bleu, la route sortait lavande claire L* 53) */ /* l'orbite : le vide reste noir, la route et la caisse prennent le bleu de la Terre */
  'grt-matin':{expo:1.12,con:1.02},
  'grt-midi':{expo:1.25,rtK:1.15,lev:[.003,.004,.01],vigK:.22,lum:1.12},           /* CRISTAUX : L* 16, route L* 17 → la grotte explorée se lit */
  'grt-soir':{expo:1.25,rtK:1.15,lev:[.003,.004,.01],vigK:.22,lum:1.12},          /* MAGMA : idem, la lave éclaire vraiment */
  'grt-glace':{sat:.95},
  canyonMatin:{expo:1.1,rtK:.85,lum:1.05},                                        /* gorge sombre (L* 33) sous une route claire (L* 58) */
  canyonSoir:{expo:1.2,lum:1.08,lev:[.004,.004,.008],vigK:.22,rtK:1.05,rtT:[1.12,1,.78],sat:.96}, /* (1er essai : expo 1,4 × lumières 1,3 brûlaient les parois en orange plat — la gorge et la plaine ne reçoivent pas la même lumière) */ /* L* 16 : parois brunes et route marine → lumière, route réchauffée */
  canyonNuit:{expo:1.25,lum:1.15,lev:[.003,.005,.012],vigK:.3,rtK:1.15,rtT:[1.05,1,.9],sat:1.05},    /* L* 12, 24 % de noirs */
  canyonOrage:{expo:1.22,sat:1.25,chr:.4,lev:[.002,.004,.01],lum:1.1,vigK:.26},     /* L* 17, chroma 27 : sombre ET terne */
  dunesMatin:{rtK:1.1,sat:.92,expo:1.05},                                          /* chroma 96, route L* 24 sous un ciel L* 58 */
  dunesSoir:{expo:.92,sat:.95,rtK:.85},                                           /* la carte postale : L* 62, un cran de moins pour rejoindre les autres soirs */
  dunesNuit:{sat:.92},
  dunesVent:{expo:.9,rtK:.9},
  dunesTempete:{sat:.92,rtK:.8},
  nuagesPluie:{rtK:.78},                                                          /* l'averse : la route (L* 52) un cran plus sombre */
  canyonPluie:{expo:1.2,sat:1.25,chr:.35,lum:1.1,con:1.04},                         /* L* 26, chroma 26 : la gorge sous la pluie, sombre ET grise */
  banqMidi:{sat:.9},banqSoir:{sat:.92},banqNuit:{sat:.9},banqNeige:{sat:.9}}; /* le glacier (hors tirage) : chroma 96-132, le plus saturé du jeu — un cran de moins */
/* PISTE B — LE POP FRANC : les mêmes cibles, atteintes plus par la LUMIÈRE DE LA SCÈNE et la couleur de l'air que par le grade seul — +10 % de saturation,
   un cran de contraste, l'air plus coloré, les lumières plus fortes sur les sombres, les vignettes plus légères. Dérivée de A : même squelette, plus de nerf. */
{for(const k in EQM.A){const a=EQM.A[k],b={};for(const f in a)b[f]=Array.isArray(a[f])?a[f].slice():a[f];
  b.sat=+(((b.sat==null?1:b.sat)*1.1)).toFixed(3);b.con=+(((b.con==null?1:b.con)*1.05)).toFixed(3);b.chr=+(((b.chr||0)+.12)).toFixed(2);
  if(b.lum!=null)b.lum=+((b.lum*1.1)).toFixed(2);if(b.vigK!=null)b.vigK=+(Math.max(.16,b.vigK-.05)).toFixed(2);EQM.B[k]=b;}}
{const T=EQM[EQUILIBRE];if(T)for(const k in T){const r=T[k];if(BIOMES[k])eqApplique(BIOMES[k],r);else if(/^grt-/.test(k))for(const n in BIOMES)if(n.indexOf(k+'-')===0)eqApplique(BIOMES[n],r);}}
window.dbgEquilibre=function(n,r){if(n&&r){const b=BIOMES[n];if(!b)return null;eqApplique(b,r);if(BIO.name===n||BIO.to===b){bioLerp(b,b,1,BIO.cur);bioApply(BIO.cur);}}return {piste:EQUILIBRE,retouches:EQM[EQUILIBRE]};}; /* banc : essayer une retouche à chaud */
