/* LA MÉMOIRE DES GÉOMÉTRIES PAR GROUPE (2026-11-14) : 2,5 s après le départ, les octets des géométries de la scène (attributs, index, instances) rangés par
   nom (parent|maillage) — pour comparer deux arbres poste par poste. */
(async function(){try{await new Promise(function(r){setTimeout(r,2500);});const G={};let tot=0;const vus=new Set();
dbgScene().scene.traverse(function(o){const g=o.geometry;if(!g||vus.has(g))return;vus.add(g);let b=0;for(const k in g.attributes){const a=g.attributes[k];if(a&&a.array)b+=a.array.byteLength;}if(g.index&&g.index.array)b+=g.index.array.byteLength;
  if(o.isInstancedMesh){b+=o.instanceMatrix.array.byteLength;if(o.instanceColor)b+=o.instanceColor.array.byteLength;}const k=(o.parent&&o.parent.name||'')+'|'+(o.name||o.type);const e=G[k]||(G[k]={n:0,o:0});e.n++;e.o+=b;tot+=b;});
const top=Object.keys(G).sort(function(a,b){return G[b].o-G[a].o;}).slice(0,25).map(function(k){return [k,G[k].n,+(G[k].o/1048576).toFixed(2)];});
let n9=null;try{n9=dbgVilleDeco().ville9;}catch(e){}return {Mo:+(tot/1048576).toFixed(1),geo:vus.size,top:top,info:dbgScene().rdr.info.memory,ville:n9};}catch(e){return 'erreur '+String(e).slice(0,200);}})()
