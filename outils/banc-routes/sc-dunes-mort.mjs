/* scénario (banc, non livré) : les dunes au pilote automatique, on note les 40 derniers relevés avant chaque mort — node jeu.mjs dunes midi secondes */
export default async function(H,[carte,meteo,secs]){
  await H.jouer();await H.sleep(2500);await H.ev('dbgAuto(1,0);1');const t0=Date.now();const hist=[];let morts=0;
  const lire=`JSON.stringify((function(){var s=dbgState(),d=dbgDunes(),e=dbgEco();return {m:s.mode,o:s.gameOver,s:Math.round(e.s),vA:+s.vA.toFixed(2),lat:+s.lat.toFixed(1),h:d.carHaut,heurt:d.heurt,sauts:d.sauts,lev:d.levre};})())`;
  while((Date.now()-t0)/1000<+secs){await H.sleep(90);let r;try{r=JSON.parse(await H.ev(lire));}catch(e){continue;}
    hist.push(r);if(hist.length>40)hist.shift();
    if(r.o||r.m==='boom'){morts++;console.log('MORT',JSON.stringify(r));console.log(hist.slice(-25).map(x=>JSON.stringify(x)).join('\n'));await H.shot('mort'+morts);
      await H.ev('(typeof dbgEco==="function"&&dbgEco("rejouer"),1)').catch(()=>{});await H.sleep(5000);await H.ev('dbgAuto(1,0);1').catch(()=>{});hist.length=0;if(morts>=4)break;}}
  console.log('fini',morts,'morts');
}
