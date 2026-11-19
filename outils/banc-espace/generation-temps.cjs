/* le temps de genCtrl SEUL (la partie que le pré-bâti ne découpe pas pour l'espace : ville-entree.js:708) en série, sac vivant : node generation-temps.cjs [n=150] */
const C=require('./generation-charge.cjs');const n=+(process.argv[2]||150);
for(const p of [0,10,20,27]){const M=C.creer('');const T=[];for(let k=0;k<30+n;k++){const r=M.route((k*2654435761)>>>1,p);if(k>=30)T.push(r.msGen);}T.sort((a,b)=>a-b);
  console.log('p'+p,'genCtrl seul (ms, Mac, Node) méd',T[n>>1].toFixed(0),'p95',T[Math.floor(n*.95)].toFixed(0),'pire',T[n-1].toFixed(0),'· > 50 ms :',T.filter(x=>x>50).length,'/',n);}
