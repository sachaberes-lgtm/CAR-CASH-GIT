/* (2026-11-15) le bilan des 72 vues (q-cout-vues.js via banc-maps --auditfile) : appels et triangles moyens / max, par sorte de vue ; plusieurs fichiers = plusieurs passages
   node outils/banc-nuages/bilan-cout.cjs <gen-nuages-midi.json> [...] */
const fs=require('fs');
for(const f of process.argv.slice(2)){const J=JSON.parse(fs.readFileSync(f,'utf8'));const G=(J.graines||J.res||J.resultats||J)[0]||J;const P=G.perso||(G.audit&&G.audit.perso)||G;
  const V=P.vues;if(!V){console.log(f,'pas de vues',Object.keys(G).slice(0,20));continue;}
  const st=function(L,k){const a=L.map(v=>typeof v[k]==='string'?parseFloat(v[k])*1000:v[k]);return {moy:Math.round(a.reduce((x,y)=>x+y,0)/a.length),max:Math.max(...a)};};
  const o={};for(const k of ['tout','sol','vol','large']){const L=k==='tout'?V:V.filter(v=>v.k===k);if(!L.length)continue;const ap=st(L,'appels'),tr=st(L,'tri');o[k]=ap.moy+'/'+ap.max+' · '+Math.round(tr.moy/1000)+'k/'+Math.round(tr.max/1000)+'k';}
  console.log(f.replace(/.*cout./,''),JSON.stringify(o),'mem',JSON.stringify(P.mem1||''));}
