/* LES PAS COURTS DU TRACÉ DU CANYON (2026-11-17, canyon final) — Node seul : le VRAI genCanyon.
   Deux points de contrôle presque confondus (un reste de 2 m après un arc) cassent la dalle : la spline y plie de 5°/m (graines 25 et 40, à 353 m de l'arrivée :
   la finale plonge à −75 % juste après). Le banc liste chaque pas de moins de MIN mètres et l'angle (pente + cap) que la route y prend ; défaut s'il en reste un
   qui plie de plus de PLI degrés.   node outils/banc-routes/canyon-final/pas-courts.cjs [graines=1-40] [paliers=0,10,20] [min=8] [pli=6] [--v]   (SEARCH="?sans=cycourt" : l'avant) */
const fs=require('fs'),path=require('path'),vm=require('vm');
const B=require('../charge.cjs'),ctx=B.ctx,RACINE=path.resolve(__dirname,'../../..');
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const [g0,g1]=(arg('graines')||'1-40').split('-').map(Number),PALS=(arg('paliers')||'0,10,20').split(',').map(Number),MIN=+(arg('min')||8),PLI=+(arg('pli')||6),V=process.argv.includes('--v');
const src=fs.readFileSync(path.join(RACINE,'code/maps/canyon-route.js'),'utf8'),a0=src.indexOf('const CY_HZ='),a1=src.indexOf('/* LES BRUITS PARTAG');
vm.runInContext('var CY={},THICK=5.2;',ctx);
for(const f of ['canyon-murs.js','canyon-v3.js'])vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/'+f),'utf8'),ctx,{filename:f});
vm.runInContext(src.slice(a0,a1),ctx,{filename:'canyon-route.js'});
vm.runInContext(`function __canyon(graine){LVL.cur={id:'canyon',carte:'canyon',piste:'canyon',__al:.7};MODMARK.length=0;const it=genCanyon(mulberry32(graine));let r=it.next();while(!r.done)r=it.next();return {C:r.value};}`,ctx);
let courts=0,defauts=0,n=0,pasMin=1e9,pliMax=0;
for(const pal of PALS)for(let g=g0;g<=(g1||g0);g++){ctx.__setPalier(pal,B.VW[pal]||78);const C=ctx.__canyon(g).C,nC=C.length;n++;let S=0,tot=0;for(let i=1;i<nC;i++)tot+=C[i].distanceTo(C[i-1]);const out=[];
  const ang=i=>{const a=C[i-1],b=C[i],c=C[i+1],ux=b.x-a.x,uy=b.y-a.y,uz=b.z-a.z,vx=c.x-b.x,vy=c.y-b.y,vz=c.z-b.z,lu=Math.hypot(ux,uy,uz)||1,lv=Math.hypot(vx,vy,vz)||1;return Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy+uz*vz)/(lu*lv))))*57.2958;};
  for(let i=1;i<nC;i++){const d=C[i].distanceTo(C[i-1]);S+=d;if(d<pasMin)pasMin=d;if(d>=MIN)continue;courts++;
    const p=Math.max(i>1?ang(i-1):0,i<nC-1?ang(i):0);if(p>pliMax)pliMax=p;if(p>PLI){defauts++;out.push(Math.round(S)+' (L−'+Math.round(tot-S)+') pas '+d.toFixed(1)+' m, pli '+p.toFixed(1)+'°');}else if(V)out.push(Math.round(S)+' pas '+d.toFixed(1)+' m, pli '+p.toFixed(1)+'° (doux)');}
  if(out.length)console.log('p'+pal,'g'+g,out.join(' | '));}
console.log('BILAN',n,'canyons · pas de moins de',MIN,'m :',courts,'· le plus court',pasMin.toFixed(1),'m · pli max sur un pas court',pliMax.toFixed(1)+'° ·',defauts,'cassure(s) de plus de',PLI+'°');
process.exit(defauts?1:0);
