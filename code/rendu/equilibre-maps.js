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
{const T=EQM[EQUILIBRE];if(T)for(const k in T){const r=T[k];if(BIOMES[k])eqApplique(BIOMES[k],r);else if(/^grt-/.test(k))for(const n in BIOMES)if(n.indexOf(k+'-')===0)eqApplique(BIOMES[n],r);}}
window.dbgEquilibre=function(n,r){if(n&&r){const b=BIOMES[n];if(!b)return null;eqApplique(b,r);if(BIO.name===n||BIO.to===b){bioLerp(b,b,1,BIO.cur);bioApply(BIO.cur);}}return {piste:EQUILIBRE,retouches:EQM[EQUILIBRE]};}; /* banc : essayer une retouche à chaud */
