/* LA MÉMOIRE AU CHANGEMENT DE MAP (2026-11-14, optimisation de la ville) : géométries et textures vivantes du moteur, programmes, tas JS,
   dans la map de départ (la ville), puis après trois allers-retours ville → nuages → ville (dbgTrace rebâtit la piste ET son décor comme un changement de map).
   Une fuite se voit à la croissance d'un cycle à l'autre ; le coût de la ville à l'écart ville − nuages. */
(async function(){try{const g=+((/[?&]pistegraine=(\d+)/.exec(location.search)||[])[1]||1),carte=((/[?&]carte=(\w+)/.exec(location.search)||[])[1]||'ville');
const dort=function(ms){return new Promise(function(r){setTimeout(r,ms);});};const R=dbgScene().rdr;
const mesure=async function(nom){await dort(2500);try{if(window.gc)gc();}catch(e){}const m=R.info.memory;let heap=null;try{heap=+(performance.memory.usedJSHeapSize/1048576).toFixed(1);}catch(e){}
  let n=0,oct=0;const vus=new Set();dbgScene().scene.traverse(function(o){n++;const g=o.geometry;if(!g||vus.has(g))return;vus.add(g);for(const k in g.attributes){const a=g.attributes[k];if(a&&a.array)oct+=a.array.byteLength;}if(g.index&&g.index.array)oct+=g.index.array.byteLength;if(o.isInstancedMesh){oct+=o.instanceMatrix.array.byteLength;if(o.instanceColor)oct+=o.instanceColor.array.byteLength;}});
  return {nom:nom,geo:m.geometries,tex:m.textures,prog:R.info.programs?R.info.programs.length:null,tasMo:heap,objets:n,geoScene:vus.size,geoMo:+(oct/1048576).toFixed(1)};};
const out=[];out.push(await mesure(carte+' (départ)'));
for(let k=0;k<3;k++){dbgTrace({carte:'nuages',graine:1});out.push(await mesure('nuages '+(k+1)));dbgTrace({carte:carte,graine:g});out.push(await mesure(carte+' '+(k+1)));}
return out;}catch(e){return 'erreur '+String(e&&e.stack||e).slice(0,300);}})()
