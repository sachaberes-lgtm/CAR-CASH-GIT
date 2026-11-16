/* compare deux passages de audit-memoire-cycle.js : node outils/banc-maps/compare-memoire.cjs <gen-avant.json> <gen-apres.json>
   par étape (départ, nuages 1, ville 1, …) : géométries et textures du moteur, octets des géométries de la scène, tas JS — moyenne des graines communes. */
const fs=require('fs');const lit=f=>{const o={};for(const r of JSON.parse(fs.readFileSync(f,'utf8')))if(Array.isArray(r.perso))o[r.graine]=r.perso;else console.log('  graine',r.graine,':',String(r.perso||r.erreur).slice(0,120));return o;};
const A=lit(process.argv[2]),B=lit(process.argv[3]),G=Object.keys(A).filter(g=>B[g]);console.log('graines communes',G.join(','));
const K=['geo','tex','geoScene','geoMo','tasMo','prog'];const n=G.length?A[G[0]].length:0;
for(let i=0;i<n;i++){const m=(O,k)=>G.reduce((s,g)=>s+(+O[g][i][k]||0),0)/G.length;
  console.log((A[G[0]][i].nom||'').padEnd(16),K.map(k=>k+' '+m(A,k).toFixed(k==='geoMo'||k==='tasMo'?1:0)+'→'+m(B,k).toFixed(k==='geoMo'||k==='tasMo'?1:0)).join(' · '));}
