(function(){
 const R=[];explode=function(){};
 R.push(JSON.stringify(__bancAim({s0:464,sc:'D',maxf:330,imp:21,v:60,nitro:false,pilote:true})));R.push(JSON.stringify(__bancAim({s0:791,sc:'D',maxf:330,imp:21,v:60,nitro:false,pilote:true})));
 for(const s0 of [1118,1772]){
 gameOver=false;mode='drive';s=s0;lat=0;side=1;psi=0;yawR=0;slipB=0;driftYaw=0;vA=60;vL=0;
 for(let k=0;k<4;k++)dbgStep(1,16);
 psi=0;yawR=0;vA=60;vL=0;
 dbgAuto(true,0,{nit:0,vol:false});window.__dret=dbgDauphin(21,60,0,0);dbgAuto(false,0);steer=0;
 const i0=tryLand._bi,u0=VOLR.u.clone(),p0=fallPos.clone();
 R.push('dauph='+JSON.stringify(window.__dret||'').slice(0,80));R.push('--- s0='+s0+' mode='+mode+' VOLR.on='+VOLR.on+' u0='+u0.toArray().map(x=>x.toFixed(2))+' side='+side+' fss='+fallStartSide);
 for(let f=0;f<200&&mode==='fall';f++){dbgStep(1,16);
  if(f%10===0){const bi=tryLand._bi;const a=bi>=0?Math.acos(Math.max(-1,Math.min(1,u0.dot(Nn[bi]))))*57.3:-1;
   R.push((f*.016).toFixed(2)+' bi='+bi+'(Δ'+(bi-i0)+') h='+curHOff.toFixed(1)+' lat='+curLatOff.toFixed(1)+' ang(u0,Nn)='+a.toFixed(0)+' |d|='+fallPos.distanceTo(p0).toFixed(1)+' vVers='+fallVel.dot(u0).toFixed(1));}}
 R.push('fin mode='+mode+' t='+fallT.toFixed(2));
 }
 return R.join('\n');
})()
