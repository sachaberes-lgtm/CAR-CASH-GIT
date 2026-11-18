/* LE DÉVERS DANS LES OUVRAGES DU CANYON (2026-11-17, canyon final) — Node seul, sans Chrome : le VRAI genCanyon (comme canyon.cjs).
   Les ouvrages (galerie, pont naturel, mine, tunnel d'arrivée) sont bâtis D'APLOMB (repère horizontal de la route, cyV3Fr / frameAt sans roulis) :
   si la dalle penche à cet endroit, son bord relevé entre dans leurs murs et leurs piliers. Le banc mesure le roulis de la dalle (la normale posée par cyMurPose)
   dans chaque ouvrage ; au-delà de MAX degrés : défaut.
   node outils/banc-routes/canyon-final/devers-ouvrages.cjs [graines=1-40] [palier=0] [max=1.5] [--v]      (SEARCH="?sans=cyplat" : l'avant) */
const fs=require('fs'),path=require('path'),vm=require('vm');
const B=require('../charge.cjs'),ctx=B.ctx,RACINE=path.resolve(__dirname,'../../..');
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const [g0,g1]=(arg('graines')||'1-40').split('-').map(Number),pal=+(arg('palier')||0),MAX=+(arg('max')||1.5),V=process.argv.includes('--v');
const src=fs.readFileSync(path.join(RACINE,'code/maps/canyon-route.js'),'utf8'),a0=src.indexOf('const CY_HZ='),a1=src.indexOf('/* LES BRUITS PARTAG');
vm.runInContext('var CY={},THICK=5.2;',ctx);
vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/canyon-murs.js'),'utf8'),ctx,{filename:'canyon-murs.js'});
vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/canyon-v3.js'),'utf8'),ctx,{filename:'canyon-v3.js'});
vm.runInContext(src.slice(a0,a1),ctx,{filename:'canyon-route.js'});
vm.runInContext(`function __canyon(graine){LVL.cur={id:'canyon',carte:'canyon',piste:'canyon',__al:.7};MODMARK.length=0;
  const it=genCanyon(mulberry32(graine));let r=it.next();while(!r.done)r=it.next();
  return {C:r.value,Q:CY.Q,murN:CY.murN,gab:CY.gab||null};}`,ctx);
let defauts=0,n=0;const pire={};
for(let g=g0;g<=(g1||g0);g++){ctx.__setPalier(pal,B.VW[pal]||78);const r=ctx.__canyon(g),C=r.C,N=r.murN,nC=C.length,S=new Float64Array(nC);n++;
  for(let i=1;i<nC;i++)S[i]=S[i-1]+Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z);
  const roulis=i=>{if(!N)return 0;const a=C[Math.max(0,i-1)],c=C[Math.min(nC-1,i+1)],tl=Math.hypot(c.x-a.x,c.z-a.z)||1,tx=(c.x-a.x)/tl,tz=(c.z-a.z)/tl,q=N[i];return Math.atan2(q.x*tz-q.z*tx,q.y)*57.2958;};
  const ix=p=>{let bi=0,bd=1e18;for(let j=0;j<nC;j++){const d=C[j].distanceToSquared(p);if(d<bd){bd=d;bi=j;}}return bi;};
  const Z=[];for(const z of r.gab||[])if(/^(galerie|pont)$/.test(z.t))Z.push([z.t,z.i0,Math.min(nC-1,z.i1)]);
  if(r.Q.mine0&&r.Q.mine1)Z.push(['mine',ix(r.Q.mine0.p),ix(r.Q.mine1.p)]);
  {let i=nC-1;while(i>0&&S[nC-1]-S[i]<460)i--;Z.push(['tunnel',i,nC-1]);}
  const out=[];
  for(const z of Z){let mx=0,ou=0;for(let i=z[1];i<=z[2];i++){const b=Math.abs(roulis(i));if(b>mx){mx=b;ou=i;}}
    if(!(pire[z[0]]>=mx))pire[z[0]]=mx;out.push(z[0]+' '+Math.round(S[z[1]])+'-'+Math.round(S[z[2]])+' : '+mx.toFixed(1)+'°'+(mx>MAX?' ✘ (s '+Math.round(S[ou])+')':''));if(mx>MAX)defauts++;}
  if(V||out.some(o=>o.includes('✘')))console.log('g'+g,out.join(' · '));}
console.log('BILAN',n,'canyons · roulis max par ouvrage :',Object.keys(pire).map(k=>k+' '+pire[k].toFixed(1)+'°').join(', '),'·',defauts,'ouvrage(s) penché(s) de plus de',MAX+'°');
process.exit(defauts?1:0);
