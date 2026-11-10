/* ===== LE BRUIT GLSL ET LE PALIER, PARTAGÉS (2026-11-10, Sacha : « retire la map forêt du code de main et de ios ») =====
   Ces deux outils naquirent avec la forêt (foret-decor.js, foret-construction.js) mais le glacier (glacier-route.js, glacier-embelli.js) et les grottes
   (grottes-2.js, grottes-embellies.js) s'en servent aussi : ils restent ici quand la forêt quitte main (elle vit sur la branche foret-sauvee-2026-11-10).
   FG_BRUIT : le bruit de valeur fh3/fn3/fh2/fn2 collé en tête des fragments. forBruit(x,z,s) : le bruit de relief du glacier. PAL_B9(k,d) : le palier d'optimisation PAL.b(k,d), ou d s'il n'existe pas. */
const FG_BRUIT=['float fh3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
  'float fn3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);',
  ' return mix(mix(mix(fh3(i),fh3(i+vec3(1.,0.,0.)),f.x),mix(fh3(i+vec3(0.,1.,0.)),fh3(i+vec3(1.,1.,0.)),f.x),f.y),',
  '            mix(mix(fh3(i+vec3(0.,0.,1.)),fh3(i+vec3(1.,0.,1.)),f.x),mix(fh3(i+vec3(0.,1.,1.)),fh3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}',
  'float fh2(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
  'float fn2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(fh2(i),fh2(i+vec2(1.,0.)),f.x),mix(fh2(i+vec2(0.,1.)),fh2(i+vec2(1.,1.)),f.x),f.y);}'].join('\n');
function PAL_B9(k,d){try{return (typeof PAL!=='undefined'&&PAL&&typeof PAL.b==='function')?PAL.b(k,d):d;}catch(e){return d;}} // les paliers d'optimisation (PAL), s'ils existent
function forBruit(x,z,s){const a=Math.sin(x*.0123+s)*Math.sin(z*.0107-s*.7),b=Math.sin(x*.031+z*.027+s*2.1)*.5,c=Math.sin(x*.0047-z*.0051+s*.3);return (a+b+c)/2.5;}
