const HOOK=`(function(){window.__morts=[];explode=function(c){window.__morts.push({c:c,s:+s.toFixed(0),lat:+lat.toFixed(1),y:+carGroup.position.y.toFixed(1),fallT:+fallT.toFixed(2),i:tryLand._bi,hOff:+curHOff.toFixed(2),latOff:+curLatOff.toFixed(1),bd:+Math.sqrt(dalleProche.bd).toFixed(1)});};var tl=tryLand;tryLand=function(dt){var r=tl(dt);window.__lt=tryLand._bi;return r;};return 1;})()`;
export default async function(H,[carte,meteo,secs,vs]){
  await H.jouer();await H.sleep(2500);
  await H.ev('__ev('+JSON.stringify(HOOK)+')');
  const lev=JSON.parse(await H.ev(`JSON.stringify(__ev("DN.lev.map(function(l){return {s:l.s,e:l.e,aim:l.aim,tag:l.tag};})"))`));
  const V=(vs||'90,150,230').split(',').map(Number);const res=[];
  for(const l of lev){ if(l.tag==='bosse')continue; for(const v of V){
    await H.ev(`__ev("(function(){window.__morts.length=0;mode='drive';s=${l.s-70};lat=0;side=1;psi=0;yawR=0;slipB=0;driftYaw=0;vA=${v};nitroR=0;rampCd=0;graceT=3;return 1;})()")`);
    await H.ev('dbgAuto(1,0,{vol:true});dbgStep(3,16);1');
    let out='?',fell=false,tF=0;
    for(let i=0;i<260;i++){
      const st=JSON.parse(await H.ev(`JSON.stringify(__ev("({m:mode,n:window.__morts.length,s:s})"))`));
      if(st.n>0){out=JSON.parse(await H.ev('JSON.stringify(__ev("window.__morts[0]"))'));break;}
      if(st.m==='fall'){if(!fell){fell=true;await H.ev('dbgAuto(false);1');}tF++;}
      else if(fell){out='pose';break;}
      if(st.s>l.s+l.aim+300){out=fell?'pose':'pasdevol';break;}
      await H.ev('dbgStep(2,16);1');}
    const rec={lev:l.s,tag:l.tag,aim:Math.round(l.aim),v,fell,out};res.push(rec);console.log(JSON.stringify(rec));
  }}
  console.log('FIN');
}
