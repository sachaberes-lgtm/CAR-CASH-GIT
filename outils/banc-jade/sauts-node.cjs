/* LE DIAGNOSTIC DES GRANDS SAUTS (2026-11-16) : le vol de jadeAGen instrumenté (une copie en mémoire, le dépôt n'est pas touché) — pour chaque vitesse
   du test (opt ×0,9-1,8, vrai ×1-1,9) : posé ou non, gain de route (≥ 150 m), angle (cos ≥ 0,57), abscisse. node outils/banc-jade/sauts-node.cjs <racine> <forme> [graines=1-12] [paliers=0,10,20] */
const fs=require('fs'),vm=require('vm'),path=require('path');
const RAC=process.argv[2],forme=process.argv[3];const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const G=(arg('graines')||'1-12').split('-').map(Number),PAL=(arg('paliers')||'0,10,20').split(',').map(Number),VW={0:78,5:105,10:158,15:236,20:341};
const ctx=vm.createContext({console,Math,Float32Array,Float64Array,Int16Array,Uint8Array,Int32Array,Map,Set,Object,Array,Number,String,Date,Infinity,performance,JSON,Symbol,parseInt,parseFloat,isNaN});
ctx.window=ctx;ctx.location={search:'?jade=avatar&jscene='+forme};
vm.runInContext(fs.readFileSync(path.join(RAC,'VERSION PRINCIPALE/vendor/three.min.js'),'utf8'),ctx);
vm.runInContext(`var engTier=0,__vw=78,ROAD_HALF=26,SPD=.48,MODMARK=[],CAMPM=[],VX=1.75,ALLEGE=false;var JADE={},JADE_TPL=[[10,190,1],[14,250,0],[16,220,3],[18,300,2],[23,350,3],[26,330,1],[29,400,0],[36,440,2],[45,490,1],[56,540,3]],JADE_NTPL=JADE_TPL.length,JADE_BANK={on:true,max:16*Math.PI/180,W:150};
var DUREE={d0:45,d1:20,t1:25},DUREE_ELAN=[1.8,1],VEQ_K={saut:21},JADE_U={uTime:{value:0}};function vPalier(){return __vw;}function rayonPalier(){return 40+.3*__vw;}
function longueurCible(){const k=Math.min(1,engTier/25);return (45+(20-45)*k)*__vw*(1.8+(1-1.8)*k)*.85;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}`,ctx);
let src=fs.readFileSync(path.join(RAC,'code/maps/jade-alleluia.js'),'utf8');
const a1='const v9=vole(qL,opt9[0],vm,yaw,opt9[1],120);',b1=a1+'if(globalThis.__RD)globalThis.__RD.push({nom:SCN[R9.sc]?SCN[R9.sc].nom:"?",t:"opt",vm:vm,lat:opt9[0],up:opt9[1],yaw:yaw,r:v9?{g:Math.round(SS[v9.j]-SS[qL]-v9.dist),c:+v9.cosA.toFixed(2),s:Math.round(SS[v9.j]-SS[qL])}:null});';
const a2='const v9=vole(qL,0,vm,yaw,VEQ_K.saut*SPD,120,28);',b2=a2+'if(globalThis.__RD)globalThis.__RD.push({nom:SCN[R9.sc]?SCN[R9.sc].nom:"?",t:"vrai",vm:vm,yaw:yaw,r:v9?{g:Math.round(SS[v9.j]-SS[qL]-v9.dist),c:+v9.cosA.toFixed(2),s:Math.round(SS[v9.j]-SS[qL])}:null});';
if(src.split(a1).length!==2||src.split(a2).length!==2)throw new Error('repères');src=src.replace(a1,b1).replace(a2,b2);
vm.runInContext(src,ctx,{filename:'jade-alleluia.js'});vm.runInContext(fs.readFileSync(path.join(RAC,'code/maps/jade-avatar.js'),'utf8'),ctx,{filename:'jade-avatar.js'});
vm.runInContext('JADE_A.essais=1;',ctx);
for(const p of PAL){vm.runInContext('engTier='+p+';__vw='+VW[p],ctx);const bilan={ok:0,n:0};
  for(let g=G[0];g<=G[1];g++){ctx.__RD=[];vm.runInContext('genJadeA(mulberry32('+g+'),'+g+')',ctx);const a3=vm.runInContext('JADE.a3',ctx);
    const L=ctx.__RD.filter(x=>x.nom===forme);if(!L.length){console.log('p'+p,'g'+g,'(pas de',forme+')');continue;}
    const par={};for(const x of L){const k=x.t+' ×'+x.vm;const b=par[k];const sc=x.r?(x.r.c>=Math.cos(55*Math.PI/180)&&x.r.g>=150?2:1):0;if(!b||sc>b.sc)par[k]={sc:sc,r:x.r,lat:x.lat,yaw:x.yaw};}
    const ligne=Object.keys(par).map(k=>{const b=par[k];return k+':'+(b.r?(b.sc===2?'OK':'ko')+'(g'+b.r.g+',c'+b.r.c+',s'+b.r.s+')':'rien');}).join(' ');
    const ix=a3.scenes.indexOf(forme),ok=a3.racVm;console.log('p'+p,'g'+g,'racVm',JSON.stringify(ok),'|',ligne);}}
