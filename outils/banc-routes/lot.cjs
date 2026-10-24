/* lot : node lot.cjs carte palier graines(ex 1-12) → stats par figure (présence, raccourcis dans le puits, contacts, orientation) */
const B=require('./charge.cjs'),R=require('./raccourcis.cjs');
const [carte,pal,gr]=process.argv.slice(2);const [g0,g1]=gr.split('-').map(Number);
const agg={figs:{},L:[],up:[],tr:[],inv:[],modN:[],contacts:0,puitsSeaux:[],puitsRob:[],accid:[]};
for(let sd=g0;sd<=g1;sd++){
  const r=B.piste(carte,sd,+pal);r.espace=carte==='espace';const N=r.N,n=r.ctrl.length;
  let up=0,tr=0,iv=0;for(let i=0;i<n;i++){const y=N[i].y;if(y>.5)up++;else if(y<-.2)iv++;else tr++;}
  agg.up.push(up/n);agg.tr.push(tr/n);agg.inv.push(iv/n);agg.L.push(r.info.L);agg.modN.push(r.marks.length);if(r.info.contacts)agg.contacts++;
  for(const m of r.marks)if(m.fig)agg.figs[m.fig]=(agg.figs[m.fig]||0)+1;
  const a=R.analyse(r),s=R.resume(r,a);
  const pm=r.marks.filter(m=>m.fig==='puits');
  const inP=s.seaux.filter(o=>pm.some(m=>o.i>=m.i0&&o.i<=m.i1));
  if(pm.length){agg.puitsSeaux.push(inP.length);agg.puitsRob.push(inP.filter(o=>o.ms.size>=3).length);}
  agg.accid.push(s.seaux.filter(o=>!pm.some(m=>o.i>=m.i0&&o.i<=m.i1)).length);
  console.log(carte,sd,'L',r.info.L,'figs',r.marks.map(m=>m.fig||'-').join(','),'| rac',s.raccourcis,'(puits',inP.length,'rob',inP.filter(o=>o.ms.size>=3).length,') contacts',r.info.contacts,'ny up/tr/inv',(up/n).toFixed(2),(tr/n).toFixed(2),(iv/n).toFixed(2));
}
const mean=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(2):'-';
console.log('MOY L',mean(agg.L),'à l\'endroit',mean(agg.up),'tranche',mean(agg.tr),'envers',mean(agg.inv),'modules',mean(agg.modN),'figures',JSON.stringify(agg.figs),'puits: seaux',mean(agg.puitsSeaux),'robustes',mean(agg.puitsRob),'raccourcis hors puits',mean(agg.accid));
