/* balaie D (m par tour) et le rayon du puits : node balayage-puits.cjs carte palier */
const B=require('./charge.cjs'),R=require('./raccourcis.cjs');
const [carte,pal]=process.argv.slice(2);
const seeds=[];for(let sd=1;sd<=60&&seeds.length<3;sd++){B.ctx.window.dbgPuits=null;const r=B.piste(carte,sd,+pal);if(r.marks.some(m=>m.fig==='puits'))seeds.push(sd);}
console.log(carte,'palier',pal,'graines puits',seeds.join(','));
for(const Rk of [1,1.25])for(const D of [45,56,70,90,120]){
  let tot=0,rob=0,gmax=0;
  for(const sd of seeds){B.ctx.window.dbgPuits={D:D,R:Rk};const r=B.piste(carte,sd,+pal);r.espace=carte==='espace';const a=R.analyse(r),s=R.resume(r,a),pm=r.marks.filter(m=>m.fig==='puits');
    const inP=s.seaux.filter(o=>pm.some(m=>o.i>=m.i0&&o.i<=m.i1));tot+=inP.length;rob+=inP.filter(o=>o.ms.size>=3).length;if(r.info.contacts)tot-=100;}
  console.log('R×',Rk,'D',D,'seaux dans le puits',tot,'robustes(≥3 vitesses)',rob);}
