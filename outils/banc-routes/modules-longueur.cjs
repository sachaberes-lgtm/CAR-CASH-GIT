/* la longueur réelle des modules (m et s de croisière), par carte × palier — pour caler les réserves de genCtrl (2026-11-11, LA DESCENTE DES VILLES)
   node modules-longueur.cjs [cartes=ville,crypto] [paliers=0,10,20] [graines=1-16] */
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const B=require('./charge.cjs');const CARTES=(arg('cartes')||'ville,crypto').split(','),PAL=(arg('paliers')||'0,10,20').split(',').map(Number),[g0,g1]=(arg('graines')||'1-16').split('-').map(Number);
for(const c of CARTES)for(const pal of PAL){const A={};let Lt=0,n=0;
  for(let g=g0;g<=g1;g++){const r=B.piste(c,g,pal),Q=r.ctrl;const S=[0];for(let i=1;i<Q.length;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));Lt+=S[S.length-1];n++;
    for(const m of r.marks){const k=m.fig||'-';(A[k]=A[k]||[]).push({L:S[Math.min(S.length-1,m.i1)]-S[m.i0],dy:Q[m.i0].y-Q[Math.min(Q.length-1,m.i1)].y,s0:S[m.i0]});}}
  console.log(c,'p'+pal,'L',Math.round(Lt/n),'vw',r0=B.VW[pal],Object.keys(A).map(k=>{const a=A[k],m=x=>a.reduce((s,o)=>s+o[x],0)/a.length;return k+'×'+(a.length/n).toFixed(2)+' '+Math.round(m('L'))+' m ('+(m('L')/B.VW[pal]).toFixed(1)+' s, '+(m('dy')/m('L')*100).toFixed(1)+' %, départ '+Math.round(m('s0'))+')';}).join(' · '));}
