(function(){
 const R=[];
 const cfg={s0:464,sc:'D',maxf:330,imp:21,v:60,nitro:false,pilote:true};
 R.push(JSON.stringify(__bancAim(cfg)));
 R.push(JSON.stringify(dbgState()).slice(0,400));
 /* vol 2, trace */
 mode='drive';s=1118;lat=0;side=1;psi=0;vA=60;vL=0;
 for(let k=0;k<4;k++)dbgStep(1,16);
 R.push('apres pose '+JSON.stringify({mode,s:+s.toFixed(1),started,running,paused,gameOver,graceT}));
 dbgAuto(true,0,{nit:0,vol:false});dbgDauphin(21,60,0,0);
 R.push('dauphin '+mode);
 for(let f=0;f<10;f++){dbgStep(1,16);R.push(f+' '+mode+' p='+fallPos.toArray().map(x=>x.toFixed(1))+' v='+fallVel.toArray().map(x=>x.toFixed(1))+' fallT='+fallT.toFixed(2)+' paused='+paused+' go='+gameOver);}
 return R.join('\n');
})()
