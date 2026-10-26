const fs=require('fs');const SNAP=fs.readFileSync(__dirname+'/mk1.cjs','utf8').match(/const SNAP=`([\s\S]*?)`;/)[1];
const S2=JSON.parse(fs.readFileSync(__dirname+'/scen2.json','utf8'));
S2.push({nom:'annule-mi-chemin',carte:'nuages',meteo:'midi',secs:6,auto:{lat:0},
 eval:`(async function(){${SNAP} const out=[];G.dbgAuto(1,0,{});await w(3000);out.push(snap('A'));G.dbgClassique('foret','nuit');G.dbgPortail(1100);await w(1200);out.push(snap('B-foret-en-cours'));
  G.dbgClassique('volcan','soir');await w(1200);out.push(snap('C-volcan-en-cours'));G.dbgChance('mort');await attend(()=>G.dbgState().gameOver,8000);await w(300);out.push(snap('D-mort'));await w(3000);out.push(snap('E-fin+3s'));
  out.push(G.dbgT('rejoue'));await w(4000);out.push(snap('F-course2'));return out;})()`,
 evalFin:`(async function(){${SNAP} return snap('fin');})()`});
fs.writeFileSync(__dirname+'/scen2.json',JSON.stringify(S2,null,1));console.log(S2.map(s=>s.nom));
