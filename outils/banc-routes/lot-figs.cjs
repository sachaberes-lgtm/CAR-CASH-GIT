/* raccourcis par type de figure : node lot-figs.cjs carte palier graines(1-40) */
const B=require('./charge.cjs'),R=require('./raccourcis.cjs');
const [carte,pal,gr]=process.argv.slice(2);const [g0,g1]=gr.split('-').map(Number);const agg={};
for(let sd=g0;sd<=g1;sd++){const r=B.piste(carte,sd,+pal);r.espace=carte==='espace';const a=R.analyse(r,{mults:[.9,1.1,1.4],offs:[-20,0,20]}),s=R.resume(r,a);
  for(const m of r.marks){const k=m.fig||'classique';const o=agg[k]||(agg[k]={n:0,seaux:0,rob:0,gain:0});o.n++;const inM=s.seaux.filter(x=>x.i>=m.i0&&x.i<=m.i1);o.seaux+=inM.length;o.rob+=inM.filter(x=>x.ms.size>=2).length;o.gain=Math.max(o.gain,...inM.map(x=>x.gain),0);}
}
for(const k in agg){const o=agg[k];console.log(carte,pal,k.padEnd(10),'modules',o.n,'raccourcis/module',(o.seaux/o.n).toFixed(2),'robustes(≥2 vitesses)',(o.rob/o.n).toFixed(2),'gain max',Math.round(o.gain));}
