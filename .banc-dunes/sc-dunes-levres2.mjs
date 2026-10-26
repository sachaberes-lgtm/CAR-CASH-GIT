/* banc (non livré) : chaque lèvre de crête des dunes × plusieurs vitesses, au pilote de vol, images fixes (dbgStep). Issue = posé | cause de mort. */
export default async function(H,[carte,meteo,secs,vs]){
  await H.jouer();await H.sleep(2500);
  await H.ev(`__ev("(function(){window.__tr=[];window.__morts=[];const t0=tryLand;tryLand=function(dt){const r=t0(dt);const a=window.__tr;a.push({r:r,hOff:+curHOff.toFixed(2),lat:+curLatOff.toFixed(2),bd:+Math.sqrt(dalleProche.bd).toFixed(1),y:+fallPos.y.toFixed(1),sand:+dnHauteur(fallPos.x,fallPos.z).toFixed(1),vel:+(fallVel.length()*SPD).toFixed(0),vN:+fallVel.dot(Nn[tryLand._bi]).toFixed(1)});if(a.length>10)a.shift();return r;};explode=function(c){window.__morts.push({c:c,s:+s.toFixed(0),tr:window.__tr.slice(-5)});};return 1;})()")`);
  const lev=JSON.parse(await H.ev(`JSON.stringify(__ev("DN.lev.map(function(l){return {s:l.s,e:l.e,tag:l.tag};})"))`));
  const V=(vs||'80,120,160,200,270').split(',').map(Number);const res=[];
  for(const l of lev)for(const v of V){
    await H.ev(`__ev("(function(){window.__morts.length=0;window.__tr.length=0;mode='drive';s=${l.s-60};lat=0;side=1;psi=0;yawR=0;slipB=0;driftYaw=0;vA=${v};nitroR=1;rampCd=0;graceT=3;return 1;})()")`);
    await H.ev('dbgAuto(1,0,{vol:true});dbgStep(3,16);1');
    let out='?',fell=false;
    for(let i=0;i<60;i++){const st=JSON.parse(await H.ev(`JSON.stringify(__ev("({m:mode,n:window.__morts.length,s:s})"))`));
      if(st.m==='fall')fell=true;
      if(st.n>0){out=JSON.parse(await H.ev('JSON.stringify(__ev("window.__morts[0]"))'));break;}
      if(fell&&st.m==='drive'){out='pose';break;}
      if(st.s>l.e+500){out=fell?'pose':'pasdevol';break;}
      await H.ev('dbgStep(10,16);1');}
    const rec={lev:l.s,tag:l.tag,v,fell,out:typeof out==='string'?out:{c:out.c,s:out.s,tr:out.tr.slice(-3)}};res.push(rec);console.log(JSON.stringify(rec));
  }
  console.log('FIN');
}
