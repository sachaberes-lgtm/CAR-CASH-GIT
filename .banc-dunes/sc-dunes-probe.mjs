/* sonde (non livrée) : un essai de lèvre suivi image par image */
export default async function(H){
  await H.jouer();await H.sleep(2500);
  await H.ev(`__ev("(function(){window.__morts=[];explode=function(c){window.__morts.push({c:c,s:+s.toFixed(0)});};return 1;})()")`);
  const l=JSON.parse(await H.ev(`JSON.stringify(__ev("DN.lev[0]"))`));console.log('lev',JSON.stringify(l));
  await H.ev(`__ev("(function(){mode='drive';s=${l.s-60};lat=0;side=1;psi=0;yawR=0;slipB=0;driftYaw=0;vA=160;nitroR=1;rampCd=0;graceT=3;return 1;})()")`);
  await H.ev('dbgAuto(1,0,{vol:true});1');
  for(let i=0;i<40;i++){await H.ev('dbgStep(6,16);1');console.log(await H.ev(`JSON.stringify(__ev("({i:${i},m:mode,s:+s.toFixed(1),vA:+vA.toFixed(1),y:+carGroup.position.y.toFixed(1),started:started,over:gameOver,paused:paused,rc:rampCd,mo:window.__morts.length,drv:driveDir,side:side,intro:typeof introD!=='undefined'?introD:null})"))`));}
}
