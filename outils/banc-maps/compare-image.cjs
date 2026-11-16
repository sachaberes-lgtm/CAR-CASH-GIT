/* compare deux passages de audit-image-par-appel.js (banc-maps gen) : node outils/banc-maps/compare-image.cjs <gen-avant.json> <gen-apres.json> [groupes=1]
   Moyennes par graine puis sur les graines communes : appels, triangles, ms (dbgPerf), dpr, géométries, textures, programmes, tas JS, temps de construction ; par groupe (option). */
const fs=require('fs');const [fa,fb]=process.argv.slice(2);const grp=process.argv.includes('groupes=1');
const lit=f=>{const o={};for(const r of JSON.parse(fs.readFileSync(f,'utf8'))){if(r.perso&&typeof r.perso==='object'&&r.perso.images)o[r.graine]=Object.assign({constr:(r.constr||[]).map(c=>c.ms!=null?c.ms:c),L:r.L,err:(r.erreurs||[]).length},r.perso);}return o;};
const A=lit(fa),B=lit(fb),G=Object.keys(A).filter(g=>B[g]);
const K=['appels','triangles','ms','dpr','geo','tex','prog','tasMo','L'];
const moy=(o,k)=>G.reduce((s,g)=>s+(+o[g][k]||0),0)/Math.max(1,G.length);
console.log('graines communes :',G.join(','));
for(const g of G)console.log(' g'+g,K.map(k=>k+' '+(+A[g][k]).toFixed(k==='ms'||k==='dpr'?2:0)+'→'+(+B[g][k]).toFixed(k==='ms'||k==='dpr'?2:0)).join(' · '),'· err',A[g].err+'→'+B[g].err);
console.log('MOYENNE',K.map(k=>{const a=moy(A,k),b=moy(B,k);return k+' '+a.toFixed(k==='ms'||k==='dpr'?2:0)+' → '+b.toFixed(k==='ms'||k==='dpr'?2:0)+' ('+(a?((b/a-1)*100).toFixed(1):'-')+' %)';}).join(' · '));
if(grp){const S=o=>{const r={};for(const g of G)for(const t of o[g].top){r[t[0]]=r[t[0]]||[0,0];r[t[0]][0]+=t[1]/G.length;r[t[0]][1]+=t[2]/G.length;}return r;};const a=S(A),b=S(B);
  const ks=[...new Set(Object.keys(a).concat(Object.keys(b)))].sort((x,y)=>Math.abs(((b[y]||[0,0])[1]-(a[y]||[0,0])[1]))-Math.abs(((b[x]||[0,0])[1]-(a[x]||[0,0])[1])));
  console.log('GROUPES (appels, k triangles par image : avant → après)');for(const k of ks.slice(0,26)){const x=a[k]||[0,0],y=b[k]||[0,0];console.log('  ',(x[0].toFixed(1)+'→'+y[0].toFixed(1)).padEnd(12),(Math.round(x[1]/1000)+'→'+Math.round(y[1]/1000)+' k').padEnd(14),k);}}
