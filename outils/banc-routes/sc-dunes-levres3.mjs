/* banc (non livré) : chaque lèvre de crête des dunes × plusieurs vitesses, temps réel, pilote de vol. Issue = posé | cause de mort (+ les dernières poses tentées). */
export default async function(H,[carte,meteo,secs,vs]){
  await H.jouer();await H.sleep(2500);
  await H.ev(`__ev("(function(){window.__tr=[];window.__morts=[];const t0=tryLand;tryLand=function(dt){const r=t0(dt);const a=window.__tr;a.push({r:r,h:+curHOff.toFixed(2),l:+curLatOff.toFixed(1),y_s:+(fallPos.y-dnHauteur(fallPos.x,fallPos.z)).toFixed(2),v:+(fallVel.length()*SPD).toFixed(0),vN:+fallVel.dot(Nn[tryLand._bi]).toFixed(1),dt:+dt.toFixed(3)});if(a.length>8)a.shift();return r;};explode=function(c){window.__morts.push({c:c,s:+s.toFixed(0),tr:window.__tr.slice(-4)});};return 1;})()")`);
  const lev=JSON.parse(await H.ev(`JSON.stringify(__ev("DN.lev.map(function(l){return {s:l.s,e:l.e,tag:l.tag};})"))`));
  const V=(vs||'80,160,270').split(',').map(Number);
  for(const l of lev.filter(function(q){return !process.env.TAG||q.tag===process.env.TAG;}))for(const v of V){
    await H.ev(`__ev("(function(){window.__morts.length=0;window.__tr.length=0;mode='drive';s=${l.s-70};lat=0;side=1;psi=0;yawR=0;slipB=0;driftYaw=0;vA=${v};nitroR=1;rampCd=0;graceT=3;return 1;})()")`);
    await H.ev(process.env.NOPILOT?'dbgAuto(false);1':'dbgAuto(1,0,{vol:true});1');
    let out='rien',fell=false;const t0=Date.now();
    while(Date.now()-t0<7000){await H.sleep(50);const st=JSON.parse(await H.ev(`JSON.stringify(__ev("({m:mode,n:window.__morts.length,s:s})"))`));
      if(st.m==='fall')fell=true;
      if(st.n>0){const m=JSON.parse(await H.ev('JSON.stringify(__ev("window.__morts[0]"))'));out={c:m.c,s:m.s,tr:m.tr};break;}
      if(fell&&st.m==='drive'){out='pose';break;}}
    console.log(JSON.stringify({lev:l.s,tag:l.tag,v,fell,out}));
  }
  console.log('FIN');
}
