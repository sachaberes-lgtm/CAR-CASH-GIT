/* scénario : se poser avant une figure de la graine g et la rouler en pilote automatique, une capture toutes les 400 ms — node jeu.mjs carte meteo 0 palier graine sDepart secondes */
export default async function(H,[carte,meteo,_s,palier,g,sDep,secs]){
  await H.jouer();await H.sleep(2500);
  const t=await H.ev(`(function(){var t=dbgTrace({carte:'${carte}',meteo:'${meteo}',graine:${+g},palier:${+palier||0}});return JSON.stringify({L:t.L,ok:t.graineOk,zones:dbgHaut().info.zones});})()`);console.log(t);
  await H.ev(`dbgAuto(1,0);dbgBord({s:${+sDep},lat:0,psi:0,vA:150,grace:2});1`);
  console.log(await H.ev('JSON.stringify(Object.keys(dbgState()))'));
  const t0=Date.now();let k=0;
  while((Date.now()-t0)/1000<+secs){await H.sleep(350);
    const st=await H.ev(`JSON.stringify((function(){var s=dbgState(),b=dbgBord();return {mode:s.mode,over:s.gameOver,vH:s.vH,roulis:s.roulisDeg,lat:b.lat,s:typeof s.s==='number'?Math.round(s.s):null};})())`).catch(e=>'ERR');
    console.log(st);await H.shot('f'+String(k++).padStart(3,'0'));if(/"over":true/.test(st))break;}
}
