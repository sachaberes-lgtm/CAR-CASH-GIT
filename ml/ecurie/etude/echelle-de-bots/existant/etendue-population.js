/* Etendue des paliers de la population du Ryzen, generation par generation (generations-ryzen-f8c071fa0.jsonl, copie de
   origin/evolution-ryzen:ml/evolution/etat/generations.jsonl au commit f8c071fa0). ahat = palier moyen estime, E, F, n courses. Lecture seule. */
const fs=require('fs');const L=fs.readFileSync(__dirname+'/generations-ryzen-f8c071fa0.jsonl','utf8').split('\n').filter(Boolean).map(JSON.parse);
for(const g of L){const P=(g.population||[]).filter(x=>x.ahat!=null);if(!P.length)continue;const a=P.map(x=>x.ahat).sort((x,y)=>x-y),E=P.map(x=>x.E).sort((x,y)=>x-y);
console.log('gen',g.generation,'epoque',g.epoque,'vivants notes',P.length,'| palier moyen min/med/max',a[0].toFixed(2),a[a.length>>1].toFixed(2),a[a.length-1].toFixed(2),'| E min/max',E[0].toFixed(2),E[E.length-1].toFixed(2),'| n',[...new Set(P.map(x=>x.n))].join('/'));}
const d=L[L.length-1];console.log('derniere gen',d.generation);for(const x of (d.population||[]).sort((a,b)=>a.ahat-b.ahat))console.log(' ',x.id,'ne',x.ne,'n',x.n,'ahat',x.ahat,'E',x.E,'F',x.F);
