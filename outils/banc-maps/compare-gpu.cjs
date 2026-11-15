/* compare deux passages de audit-gpu-image.js (banc-maps gen) : node outils/banc-maps/compare-gpu.cjs <gen-avant.json> <gen-apres.json>
   par graine puis en moyenne : temps GPU par image (médiane, p90, p99), intervalle entre images côté processeur (médiane, p90, p99, max), images > 50 et > 100 ms, dpr. */
const fs=require('fs');const lit=f=>{const o={};for(const r of JSON.parse(fs.readFileSync(f,'utf8')))if(r.perso&&typeof r.perso==='object'&&r.perso.images)o[r.graine]=r.perso;else console.log('  graine',r.graine,':',String(r.perso||r.erreur).slice(0,140));return o;};
const A=lit(process.argv[2]),B=lit(process.argv[3]),G=Object.keys(A).filter(g=>B[g]);
const K=['gpuMed','gpuP90','gpuP99','cpuMed','cpuP90','cpuP99','cpuMax','gels50','gels100','dpr','images'];
console.log('graines communes',G.join(','));for(const g of G)console.log(' g'+g,K.map(k=>k+' '+A[g][k]+'→'+B[g][k]).join(' · '));
const m=(O,k)=>G.reduce((s,g)=>s+(+O[g][k]||0),0)/Math.max(1,G.length);
console.log('MOYENNE',K.map(k=>{const a=m(A,k),b=m(B,k);return k+' '+a.toFixed(2)+' → '+b.toFixed(2)+(a?' ('+((b/a-1)*100).toFixed(0)+' %)':'');}).join(' · '));
