/* mesure-villes.cjs : la route de la ville et de Crypto City — droites, notes, modules, ancres.
   node mesure-villes.cjs [graines=1-40] [paliers=0,10,20] [carte=ville,crypto] */
const B=require('./charge.cjs'),ctx=B.ctx;
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const [g0,g1]=arg('graines','1-40').split('-').map(Number),PAL=arg('paliers','0,10,20').split(',').map(Number),CARTES=arg('carte','ville,crypto').split(',');
const rows=[];
for(const c of CARTES)for(const pal of PAL){
  const vw=B.VW[pal]||78;ctx.__setPalier(pal,vw);
  const acc={n:0,dF:0,dS:0,droiteMax:0,note:0,vir:0,infr:0,dou:0,anc:0,mods:{}};
  for(let g=g0;g<=g1;g++){
    ctx.LVL.cur=c==='crypto'?{id:'ville',crypto:1,carte:'ville',sansFin:1}:{id:'ville',carte:'ville',sansFin:1};ctx.window.dbgEspOff=false;
    ctx.MODMARK.length=0;ctx.FILETMARK.length=0;
    const ctrl=ctx.genCtrl(ctx.mulberry32(g),new ctx.THREE.Vector3(0,0,0),0);
    const f=ctx.rythmeMesure(ctrl,{vP:vw,rP:40+.3*vw,marks:ctx.MODMARK}),note=ctx.rythmeNote(f,ctx.rythmeCible(c));
    acc.n++;acc.dF+=f.droitesFPart;acc.dS+=f.droiteS;acc.droiteMax=Math.max(acc.droiteMax,f.droiteS);acc.note+=note;acc.vir+=f.virFMin;acc.infr+=f.infr;acc.dou+=f.douilles;
    for(const m of ctx.FILETMARK)if(m.anc)acc.anc+=m.anc.filter(a=>a.t==='geante').length;
    for(const m of ctx.MODMARK){const k=m.fig||'?';acc.mods[k]=(acc.mods[k]||0)+1;if(k==='saut'||k==='grandsaut')acc.sauts=(acc.sauts||0)+1;}
  }
  const m=k=>(acc[k]/acc.n).toFixed(2);
  console.log(c.padEnd(7),'p'+String(pal).padEnd(3),'dF%',m('dF'),'droiteS moy',m('dS'),'max',acc.droiteMax,'note',m('note'),'vir/min',m('vir'),'infr m',m('infr'),'douilles',m('dou'),'ancres/route',m('anc'),'sauts/route',((acc.sauts||0)/acc.n).toFixed(2),JSON.stringify(acc.mods));
}
