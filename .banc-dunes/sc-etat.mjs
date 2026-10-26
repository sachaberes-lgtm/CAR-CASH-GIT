export default async function(H){
  await H.jouer();await H.sleep(3000);
  console.log(await H.ev(`JSON.stringify(__ev("({niv:LVL.cur&&LVL.cur.id,CYon:CY.on,DNon:DN.on,mode:mode,s:+s.toFixed(0),L:+L.toFixed(0),lev:DN.lev&&DN.lev.length})"))`));
  await H.ev('dbgAuto(1,0,{vol:true});1');
  for(let i=0;i<6;i++){await H.sleep(2500);console.log(await H.ev(`JSON.stringify(__ev("({m:mode,s:+s.toFixed(0),y:+carGroup.position.y.toFixed(1),CYon:CY.on,DNon:DN.on,over:gameOver})"))`));}
}
