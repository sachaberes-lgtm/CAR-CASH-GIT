/* banc Node rapide de la génération propre (nuages, espace) : node v2.cjs [paliers=0,10] [graines=1-6] */
const B=require('./charge.cjs');const ctx=B.ctx;const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0,10').split(',').map(Number);const [g0,g1]=(arg('graines')||'1-6').split('-').map(Number);
for(const c of ['espace','nuages'])for(const pal of PAL){const rows=[];
  for(let g=g0;g<=(g1||g0);g++){const r=B.piste(c,g,pal);const f=ctx.rythmeMesure(r.ctrl0,{vP:r.vw,rP:40+.3*r.vw,marks:r.marks0,hors:r.info&&r.info.hors});const note=ctx.rythmeNote(f,ctx.rythmeCible(c));
    rows.push({L:f.L,vir:f.virKm,dou:f.douilles,zig:f.zigzags,dF:f.droitesFPart,hors:f.horsEndroit,dS:f.droiteS,note:note,vr:r.info?r.info.vrilles:0,ct:r.info?r.info.contacts:0});
    if(arg('detail'))console.log(c,'p'+pal,'g'+g,ctx.window.__phrase.genre.padEnd(9),'L',f.L,'vir/km',f.virKm,'douilles',f.douilles,'zig',f.zigzags,'dF%',f.droitesFMin,'hors',f.horsEndroit,'droiteS',f.droiteS,'note',note,'mods',r.marks.map(m=>m.fig||'-').join(','),'vrilles',r.info&&r.info.vrilles,'contacts',r.info&&r.info.contacts,r.info&&r.info.essai);}
  const m=k=>(rows.reduce((a,x)=>a+x[k],0)/rows.length).toFixed(2);
  console.log(c.padEnd(7),'p'+String(pal).padEnd(3),'L',m('L'),'vir/km',m('vir'),'douilles',m('dou'),'zig',m('zig'),'dF%',m('dF'),'hors',m('hors'),'droiteS',m('dS'),'note',m('note'),'vrilles',m('vr'),'contacts',m('ct'));}
