/* lit les 1 250 courses du banc des genes (aucune course jouee) : palier, survie, pieces par minute, coupees par la limite */
const fs=require('fs');
const L=fs.readFileSync('ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl','utf8').trim().split('\n').map(JSON.parse);
const q=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(p*(s.length-1)+0.5))];};
const moy=a=>a.reduce((x,y)=>x+y,0)/a.length;
function resume(C,nom){
  const pal=C.map(c=>c.palier),sv=C.map(c=>c.survie_s),pm=C.map(c=>c.pieces/(c.survie_s/60)),pc=C.map(c=>c.pieces);
  const tot=C.reduce((a,c)=>a+c.pieces,0)/C.reduce((a,c)=>a+c.survie_s/60,0);
  const h={};for(const p of pal)h[p]=(h[p]||0)+1;
  const ca={};for(const c of C)ca[c.cause]=(ca[c.cause]||0)+1;
  return {nom,n:C.length,coupees_temps:C.filter(c=>c.cause==='temps'||c.survie_s>=c.tmax-0.5).length,morts_moy:+moy(C.map(c=>c.morts)).toFixed(2),
    palier:{moy:+moy(pal).toFixed(2),q10:q(pal,.1),med:q(pal,.5),q90:q(pal,.9),max:Math.max(...pal)},hist_palier:h,
    survie_s:{moy:+moy(sv).toFixed(1),q10:q(sv,.1),med:q(sv,.5),q90:q(sv,.9),max:Math.max(...sv)},
    pieces:{moy:+moy(pc).toFixed(0),med:q(pc,.5),max:Math.max(...pc)},
    pieces_min:{rapport_des_sommes:+tot.toFixed(1),med_par_course:+q(pm,.5).toFixed(1),q10:+q(pm,.1).toFixed(1),q90:+q(pm,.9).toFixed(1)},
    vols_par_min:+(C.reduce((a,c)=>a+c.vols,0)/C.reduce((a,c)=>a+c.survie_s/60,0)).toFixed(2),causes:ca};
}
const D=L.filter(c=>c.id==='depart');
console.log(JSON.stringify(resume(D,'c0025 (bras depart)'),null,1));
console.log(JSON.stringify(resume(L,'les 1 250'),null,1));
/* survie longue : debit sur les courses de plus de 5 min */
const lg=D.filter(c=>c.survie_s>300);console.log('c0025 >300 s :',lg.length,'pieces/min',lg.length?+(lg.reduce((a,c)=>a+c.pieces,0)/lg.reduce((a,c)=>a+c.survie_s/60,0)).toFixed(1):null);
/* par bras */
const ids=[...new Set(L.map(c=>c.id))];for(const i of ids){const C=L.filter(c=>c.id===i);const r=resume(C,i);console.log(i.padEnd(10),r.n,'pal moy',r.palier.moy,'med',r.palier.med,'max',r.palier.max,'survie med',r.survie_s.med,'max',r.survie_s.max,'p/min',r.pieces_min.rapport_des_sommes);}
/* survie : part > 1,3,5,10 min (c0025) */
for(const m of [1,2,3,5,10,15])console.log('c0025 survie >',m,'min :',(D.filter(c=>c.survie_s>m*60).length/D.length*100).toFixed(1),'%');
