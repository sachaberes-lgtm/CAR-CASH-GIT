/* (2026-11-13, LE CANYON V3) LA PHRASE DU MUR AU PILOTE, dans le VRAI JEU, pour `banc.cjs gen --carte=canyon --auditfile=outils/banc-routes/phrase-roule-page.js` :
   la caisse est posée 250 m avant la phrase (dbgBord), le pilote automatique roule ; on relève jusqu'où elle va, ses modes (au sol, en vol), et la mort éventuelle (abscisse, cause)
   — la paroi à 85°, le tunnel tête en bas, l'autre paroi. Rend un objet court (le banc l'écrit dans `perso`). */
(async function(){
  const Z=ms=>new Promise(r=>setTimeout(r,ms));
  if(typeof dbgMods!=='function')return 'pas de dbgMods';
  const ph=dbgMods().find(function(m){return m.fig==='phrase';});if(!ph)return 'pas de phrase';
  dbgAuto(1,0,{nit:0});await Z(300);
  dbgBord({s:ph.s0-250,lat:0,psi:0,vA:Math.round(100/.48),grace:0});
  const t0=performance.now(),modes={},trace=[];let mort=null,sMax=0,vol=0;
  while(performance.now()-t0<45000){await Z(200);const st=dbgState(),s=dbgRoute().s;if(s>sMax)sMax=s;modes[st.mode]=(modes[st.mode]||0)+1;if(st.mode!=='drive')vol++;
    if(!trace.length||s-trace[trace.length-1][0]>120)trace.push([Math.round(s),st.mode]);
    if(st.gameOver){mort={s:Math.round(s),cause:dbgRoute().cause||null};break;}
    if(s>ph.s1+300)break;}
  return {phrase:[ph.s0,ph.s1],sMax:Math.round(sMax),traverse:sMax>ph.s1,mort:mort,modes:modes,trace:trace.slice(0,40),dureeS:Math.round((performance.now()-t0)/1000)};
})()
