/* banc (non livré) : décollage de travers (cap psi, décalage lat) à chaque lèvre, mains libres au sol puis pilote de vol en l'air */
export default async function(H,[carte,meteo,secs,vs]){
  await H.jouer();await H.sleep(2500);
  await H.ev(`__ev("(function(){window.__tr=[];window.__morts=[];const t0=tryLand;tryLand=function(dt){const r=t0(dt);const a=window.__tr;a.push({r:r,h:+curHOff.toFixed(2),l:+curLatOff.toFixed(1),y_s:+(fallPos.y-dnHauteur(fallPos.x,fallPos.z)).toFixed(2),v:+(fallVel.length()*SPD).toFixed(0),dt:+dt.toFixed(3)});if(a.length>8)a.shift();return r;};explode=function(c){window.__morts.push({c:c,s:+s.toFixed(0),tr:window.__tr.slice(-4)});};return 1;})()")`);
  const lev=JSON.parse(await H.ev(`JSON.stringify(__ev("DN.lev.map(function(l){return {s:l.s,e:l.e,tag:l.tag};})"))`));
  const V=+vs||160;let N=0,pose=0;
  for(const l of lev.slice(0,4))for(const [psi,lat] of [[0,0],[.3,0],[-.3,0],[0,20],[0,-20],[.3,20],[-.3,-20]]){
    await H.ev(`__ev("(function(){window.__morts.length=0;window.__tr.length=0;mode='drive';s=${l.s-30};lat=${lat};side=1;psi=${psi};yawR=0;slipB=0;driftYaw=0;vA=${V};nitroR=1;rampCd=0;graceT=3;return 1;})()")`);
    await H.ev('dbgAuto(false);1');
    let out='rien',fell=false;const t0=Date.now();
    while(Date.now()-t0<7000){await H.sleep(30);const st=JSON.parse(await H.ev(`JSON.stringify(__ev("({m:mode,n:window.__morts.length,s:s})"))`));
      if(st.m==='fall'&&!fell){fell=true;await H.ev('dbgAuto(1,0,{vol:true});1');}
      if(st.n>0){const m=JSON.parse(await H.ev('JSON.stringify(__ev("window.__morts[0]"))'));out={c:m.c,s:m.s,tr:m.tr};break;}
      if(fell&&st.m==='drive'){out='pose';break;}}
    N++;if(out==='pose')pose++;console.log(JSON.stringify({lev:l.s,tag:l.tag,psi,lat,fell,out}));
  }
  console.log('FIN',pose+'/'+N);
}
