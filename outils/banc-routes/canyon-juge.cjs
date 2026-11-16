/* (2026-11-13, LE CANYON V3 + la charte des routes) LE JUGE DU CANYON EN NODE : la page du banc juge de la supervision (outils/banc-juge/juge-page.js, ou --juge=<chemin>)
   chargée telle quelle sur le VRAI genCanyon du vm de charge.cjs — les mêmes mesures que `juge.cjs --cartes=canyon` (graines brutes, comme dbgGenRoute), sans Chrome :
   40 graines en quelques secondes, et le détail de chaque échec (où, dans quelle pièce).
   node outils/banc-routes/canyon-juge.cjs [graines=1-8] [paliers=0,10,20] [--juge=<juge-page.js>] [--detail]
   Le bilan suit les seuils du tableau du juge : R1 cap30 ≤ 10 s (moyenne ≤ 7), R3 roulis ≤ 60 °/s (p95 ≤ 45), R5 Jaccard ≤ 0,5, R6 ≥ 2 raccourcis dont 1 robuste, R7 ≥ 75 %. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const B=require('./charge.cjs'),ctx=B.ctx,RACINE=path.resolve(__dirname,'../..');
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const [g0,g1]=(arg('graines')||'1-8').split('-').map(Number),PAL=(arg('paliers')||'0,10,20').split(',').map(Number),DET=process.argv.includes('--detail');
const JUGE=arg('--juge')||path.join(RACINE,'outils/banc-juge/juge-page.js');
if(!fs.existsSync(JUGE))throw new Error('juge-page.js introuvable : '+JUGE+' (--juge=<chemin>)');
const src=fs.readFileSync(path.join(RACINE,'code/maps/canyon-route.js'),'utf8'),a0=src.indexOf('const CY_HZ='),a1=src.indexOf('/* LES BRUITS PARTAG');
vm.runInContext('var CY={},THICK=5.2;',ctx);
vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/canyon-murs.js'),'utf8'),ctx,{filename:'canyon-murs.js'});
vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/canyon-v3.js'),'utf8'),ctx,{filename:'canyon-v3.js'});
vm.runInContext(src.slice(a0,a1),ctx,{filename:'canyon-route.js'});
vm.runInContext('var window=this;if(typeof performance==="undefined")var performance={now:function(){return Date.now();}};',ctx);
vm.runInContext(fs.readFileSync(JUGE,'utf8'),ctx,{filename:'juge-page.js'});
vm.runInContext(`function __jugeCanyon(graine,vw,palier){LVL.cur={id:'canyon',carte:'canyon',piste:'canyon',__al:.7,sansFin:1};MODMARK.length=0;
  const it=genCanyon(mulberry32(graine));let r=it.next();while(!r.done)r=it.next();const C=r.value;
  const ctrl=C.map(p=>[p.x,p.y,p.z]),N=CY.murN?CY.murN.map(v=>[v.x,v.y,v.z]):null,marks=MODMARK.map(m=>Object.assign({},m,{f:undefined}));
  const J=window.__juge({carte:'canyon',graine:graine,palier:palier,vP:vw,half:ROAD_HALF,ctrl0:ctrl,ctrl:ctrl,N:N,marks:marks,ms:0},{});
  J.pieces=CY.hz&&CY.hz.p?CY.hz.p.map(p=>p[0]+':'+p[1]).join(' '):'';return J;}`,ctx);
const res={};
for(const pal of PAL){const vw=B.VW[pal]||78;res[pal]=[];
  for(let g=g0;g<=g1;g++){ctx.__setPalier(pal,vw);let J;try{J=ctx.__jugeCanyon(g,vw,pal);}catch(e){console.log('p'+pal+' g'+g+' ERREUR '+e.stack.split('\n').slice(0,3).join(' | '));continue;}res[pal].push(J);
    const mods=J.mods||[],ou=s=>{const m=mods.find(m=>s>=m[1]&&s<=m[2]);return m?m[0]:'liaison';};
    if(DET||J.t30>9||J.rollMax>58||J.sautable<75||J.rac<2)console.log('p'+pal+' g'+g+' '+J.dur+'s cap30 '+J.t30+'s@'+J.t30At+'('+ou(J.t30At)+') droit8 '+J.t8+' roulis '+J.rollMax+'@'+J.rollMaxAt+'('+ou(J.rollMaxAt)+')/p95 '+J.rollP95+' rac '+J.rac+'('+J.racRobustes+') saut '+J.sautable+'% mods '+J.nMods+(DET?'\n   '+J.pieces+'\n   '+mods.map(m=>m[0]+'['+m[1]+'-'+m[2]+']').join(' '):''));}}
/* le bilan, comme tableau.cjs */
for(const pal of PAL){const rs=res[pal];if(!rs.length)continue;const mx=k=>Math.max(...rs.map(r=>r[k])),mn=k=>Math.min(...rs.map(r=>r[k])),moy=k=>+(rs.reduce((a,r)=>a+r[k],0)/rs.length).toFixed(2);
  let jac=0,jAt='';const tous=new Set();for(let i=0;i<rs.length;i++){for(const x of rs[i].noms)tous.add(x);if(i){const A=new Set(rs[i-1].nomsVar),Bs=new Set(rs[i].nomsVar);let n=0;for(const x of A)if(Bs.has(x))n++;const u=new Set([...A,...Bs]).size,j=u?n/u:0;if(j>jac){jac=j;jAt=(g0+i-1)+'-'+(g0+i);}}}
  const R={R1:mx('t30')<=10&&moy('t30')<=7,R2:mx('t8')<=5&&moy('t8')<=3,R3:mx('rollMax')<=60&&mx('rollP95')<=45,R4:mx('gapMax')<=15&&(pal>0||mn('nMods')>=4),
    R5:mx('repDeSuite')===0&&mx('maxMeme')<=2&&jac<=.5&&(pal>0||tous.size>=12),R6:pal>0||(mn('rac')>=2&&mn('racRobustes')>=1),R7:moy('sautable')>=75,R8:mx('envers')<=25,R10:mn('dMin')>=8};
  console.log('p'+pal+' · '+rs.length+' routes · durée '+moy('dur')+'s · '+Object.keys(R).map(k=>k+(R[k]?'✓':'✗')).join(' ')+
    ' | cap30 max '+mx('t30')+' moy '+moy('t30')+' · droit8 '+mx('t8')+' · roulis '+mx('rollMax')+'/p95 '+mx('rollP95')+' · trou '+mx('gapMax')+'s · mods≥'+mn('nMods')+' · jac '+jac.toFixed(2)+' ('+jAt+') · noms '+tous.size+' · rac≥'+mn('rac')+' rob≥'+mn('racRobustes')+' · saut moy '+moy('sautable')+'% min '+mn('sautable')+'% · dMin '+mn('dMin'));}
