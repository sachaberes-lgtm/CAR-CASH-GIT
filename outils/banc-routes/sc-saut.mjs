/* scénario : sortir par le bord de la route (graine g) à s0, côté `cote`, et regarder où l'on retombe — node jeu.mjs carte meteo 0 palier graine s0 cote(1|-1) volpilote(0|1) */
export default async function(H,[carte,meteo,_s,palier,g,s0,cote,vol]){
  await H.jouer();await H.sleep(2500);
  console.log(await H.ev(`(function(){var t=dbgTrace({carte:'${carte}',meteo:'${meteo}',graine:${+g},palier:${+palier||0}});return JSON.stringify({L:t.L,ok:t.graineOk,zones:dbgHaut().info.zones});})()`));
  for(const sd of [1,-1])for(const s of String(s0).split(',').map(Number)){
    await H.ev(`dbgAuto(1,0${vol==='1'?',{vol:true}':''});dbgBord({s:${s},lat:0,psi:0,vA:170,grace:1.2});1`);await H.sleep(900);
    // la sortie : on pousse la caisse au-delà du bord
    await H.ev(`dbgAuto(0);dbgBord({lat:${sd*35},vL:${sd*8}});1`);
    const t0=Date.now();let der='',vu=false,s1=s,tv=0;
    while(Date.now()-t0<9000){await H.sleep(120);const st=JSON.parse(await H.ev(`JSON.stringify((function(){var x=dbgState();return {m:x.mode,o:x.gameOver,s:Math.round(x.s),f:x.fallT};})())`));
      if(st.m==='fall')vu=true;if(vu&&st.m==='drive'){s1=st.s;der='POSE';break;}if(st.o){der='MORT';s1=st.s;break;}tv=st.f;}
    console.log('cote',sd,'s0',s,'→',der||'?','s1',s1,'gain',s1-s,'vol(s)',tv);
    if(der==='MORT')break;
  }
}
