/* scénario : une course au pilote automatique (dbgAuto) — node jeu.mjs carte meteo secondes */
export default async function(H,[carte,meteo,secs]){
  await H.jouer();await H.ev('dbgAuto(1,0);1');const t0=Date.now();let n=0;
  while((Date.now()-t0)/1000<+secs){await H.sleep(2000);const st=await H.ev(`JSON.stringify((function(){var s=dbgState(),h=dbgHaut();return {mode:s.mode,over:s.gameOver,vH:s.vH,on:h.on,fig:h.info&&h.info.figures};})())`).catch(e=>'ERR');console.log(st);if(/"over":true/.test(st)){await H.shot('mort');break;}if(++n%4===0)await H.shot('course-'+n);}
}
