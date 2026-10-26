/* banc (non livré) : la chaîne de bosses du « rythme » d'un bout à l'autre, sans repositionner entre deux bosses */
export default async function(H,[carte,meteo,secs,vs]){
  await H.jouer();await H.sleep(2500);
  await H.ev(`__ev("(function(){window.__tr=[];window.__morts=[];const t0=tryLand;tryLand=function(dt){const r=t0(dt);const a=window.__tr;a.push({r:r,h:+curHOff.toFixed(2),l:+curLatOff.toFixed(1),y_s:+(fallPos.y-dnHauteur(fallPos.x,fallPos.z)).toFixed(2),v:+(fallVel.length()*SPD).toFixed(0),vN:+fallVel.dot(Nn[tryLand._bi]).toFixed(1),dt:+dt.toFixed(3)});if(a.length>10)a.shift();return r;};explode=function(c){window.__morts.push({c:c,s:+s.toFixed(0),mode:mode,tr:window.__tr.slice(-6)});};return 1;})()")`);
  const lev=JSON.parse(await H.ev(`JSON.stringify(__ev("DN.lev.map(function(l){return {s:l.s,e:l.e,tag:l.tag,aim:l.aim};})"))`));
  const B=lev.filter(l=>l.tag==='bosse');console.log('bosses',B.length,JSON.stringify(B.map(b=>b.s)));if(!B.length)return;
  const s0=B[0].s-120,s1=B[B.length-1].s+200;
  for(const v of (vs||'60,100,160,230').split(',').map(Number)){
    await H.ev(`__ev("(function(){window.__morts.length=0;window.__tr.length=0;DN.sauts=0;mode='drive';s=${s0};lat=0;side=1;psi=0;yawR=0;slipB=0;driftYaw=0;vA=${v};nitroR=1;rampCd=0;graceT=3;return 1;})()")`);
    await H.ev('dbgAuto(1,0,{vol:true});1');
    let out='rien';const t0=Date.now();const trace=[];
    while(Date.now()-t0<20000){await H.sleep(60);const st=JSON.parse(await H.ev(`JSON.stringify(__ev("({m:mode,n:window.__morts.length,s:+s.toFixed(0),vA:+vA.toFixed(0),sauts:DN.sauts})"))`));
      trace.push(st.m[0]+st.s);
      if(st.n>0){out=JSON.parse(await H.ev('JSON.stringify(__ev("window.__morts[0]"))'));break;}
      if(st.s>s1){out='fini';break;}}
    console.log(JSON.stringify({v,out,sauts:await H.ev('__ev("DN.sauts")'),trace:trace.join(' ').slice(-420)}));
  }
  console.log('FIN');
}
