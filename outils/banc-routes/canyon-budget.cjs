/* (2026-11-13, LE CANYON V3 + la charte des routes) LE BUDGET D'UN CANYON : pour chaque graine, la longueur visée (hz.B), la longueur réelle, et chaque tronçon
   (liaison / pièce) avec sa longueur en mètres et en secondes à la vitesse du palier — pour voir ce qui mange la route.
   node outils/banc-routes/canyon-budget.cjs [graines=1-8] [palier=0] */
const fs=require('fs'),path=require('path'),vm=require('vm');
const B=require('./charge.cjs'),ctx=B.ctx,RACINE=path.resolve(__dirname,'../..');
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const [g0,g1]=(arg('graines')||'1-8').split('-').map(Number),pal=+(arg('palier')||0);
const src=fs.readFileSync(path.join(RACINE,'code/maps/canyon-route.js'),'utf8'),a0=src.indexOf('const CY_HZ='),a1=src.indexOf('/* LES BRUITS PARTAG');
vm.runInContext('var CY={},THICK=5.2;',ctx);
vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/canyon-murs.js'),'utf8'),ctx,{filename:'canyon-murs.js'});
vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/canyon-v3.js'),'utf8'),ctx,{filename:'canyon-v3.js'});
vm.runInContext(src.slice(a0,a1),ctx,{filename:'canyon-route.js'});
vm.runInContext(`function __budget(graine){LVL.cur={id:'canyon',carte:'canyon',piste:'canyon',__al:.7};MODMARK.length=0;
  const it=genCanyon(mulberry32(graine));let r=it.next();while(!r.done)r=it.next();const C=r.value;let L=0;for(let i=1;i<C.length;i++)L+=Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z);
  return {L:L,hz:JSON.parse(JSON.stringify(CY.hz)),marks:MODMARK.map(m=>({nom:m.nom,i0:m.i0,i1:m.i1,rac:m.rac||0,climax:m.climax||0}))};}`,ctx);
const VW=B.VW[pal]||78;
for(let g=g0;g<=g1;g++){ctx.__setPalier(pal,VW);const r=ctx.__budget(g),hz=r.hz;let som=0;
  const parts=hz.p.map(p=>{som+=p[1];return p[0]+' '+p[1]+'m/'+(p[1]/VW).toFixed(1)+'s';});
  console.log('graine '+g+' · visée '+hz.B+' m · réelle '+Math.round(r.L)+' m ('+(r.L/VW).toFixed(0)+' s) · pièces+liaisons '+som+' m · VW '+VW+' RMIN '+hz.RMIN+' LL '+hz.LL);
  console.log('   '+parts.join(' | '));
  console.log('   marques : '+r.marks.map(m=>m.nom+(m.rac?'[rac]':'')+(m.climax?'[climax]':'')).join(', '));}
