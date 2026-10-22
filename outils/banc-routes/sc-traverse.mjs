/* scénario : roule des pistes entières (pilote automatique) pour des graines données — node jeu.mjs carte meteo 0 palier g1,g2,g3 */
export default async function(H,[carte,meteo,_s,palier,gs]){
  await H.jouer();await H.sleep(2500);
  for(const g of gs.split(',').map(Number)){
    const t=JSON.parse(await H.ev(`(function(){var t=dbgTrace({carte:'${carte}',meteo:'${meteo}',graine:${g},palier:${+palier||0}});return JSON.stringify({L:t.L,ok:t.graineOk,zones:dbgHaut().info.zones.map(function(z){return z[0]+':'+z[1]+'-'+z[2];}),on:dbgHaut().on});})()`));
    console.log('graine',g,'L',Math.round(t.L),'tord',t.on,t.zones.join(' '));
    await H.ev(`dbgAuto(1,0);dbgBord({s:0,lat:0,psi:0,vA:150,grace:2});1`);
    const t0=Date.now();let der=-1,mort=false,rot=0;
    while(Date.now()-t0<130000){await H.sleep(1500);const st=JSON.parse(await H.ev(`JSON.stringify((function(){var x=dbgState();return {m:x.mode,o:x.gameOver,s:Math.round(x.s),lat:x.lat,tier:x.engTier,vA:x.vA,f:x.fallT,side:x.side};})())`));der=st.s;console.log('   ',JSON.stringify(st));await H.shot('r'+(rot++%4));if(st.o){mort=true;break;}if(st.s>t.L-60)break;}
    console.log('  →',mort?'MORT à s='+der:'arrivée s='+der,'/',Math.round(t.L),((Date.now()-t0)/1000).toFixed(0)+' s');
    if(mort){await H.shot('mort-'+g);break;}
  }
}
