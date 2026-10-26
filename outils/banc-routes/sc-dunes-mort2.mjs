/* scénario (banc, non livré) : à chaque mort dans les dunes, l'état exact de la dernière pose tentée — WEB=<copie avec __ev> */
export default async function(H,[carte,meteo,secs]){
  await H.jouer();await H.sleep(2500);
  await H.ev(`__ev("(function(){window.__tr=[];window.__morts=[];const t0=tryLand;tryLand=function(dt){const r=t0(dt);const a=window.__tr;a.push({r:r,hOff:+curHOff.toFixed(2),lat:+curLatOff.toFixed(2),tOff:+curTOff.toFixed(1),bd:+Math.sqrt(dalleProche.bd).toFixed(1),near:curNear,y:+fallPos.y.toFixed(1),sand:+dnHauteur(fallPos.x,fallPos.z).toFixed(1),vel:+(fallVel.length()*SPD).toFixed(0),vN:+fallVel.dot(Nn[tryLand._bi]).toFixed(2),dt:+dt.toFixed(3),bi:tryLand._bi});if(a.length>14)a.shift();return r;};const e0=explode;explode=function(c){window.__morts.push({c:c,s:+s.toFixed(0),tr:window.__tr.slice(-8)});return e0.apply(this,arguments);};return 1;})()")`);
  await H.ev('dbgAuto(1,0,{vol:true});1');const t0=Date.now();let nm=0;
  while((Date.now()-t0)/1000<+secs){await H.sleep(400);const n=await H.ev('__ev("window.__morts.length")').catch(()=>0);
    if(n>nm){for(let i=nm;i<n;i++){console.log('MORT',JSON.stringify(await H.ev('JSON.stringify(__ev("window.__morts['+i+']"))')));}nm=n;
      await H.ev('(typeof dbgEco==="function"&&dbgEco("rejouer"),1)').catch(()=>{});await H.sleep(4000);await H.ev('dbgAuto(1,0,{vol:true});1').catch(()=>{});if(nm>=8)break;}}
  console.log('fini',nm);
}
