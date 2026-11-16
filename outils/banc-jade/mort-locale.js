(async function(){
  /* (2026-11-15, optimiseur de Jade, banc) UNE MORT À REJOUER : le pilote de course-pilote.js (dbgAuto, sauts toutes les 4 s, vol) lancé N fois de
     window.__de à window.__a (abscisses), au milieu ; chaque mort relevée (abscisse, cause, mode, position de la caisse). Crochets d'origine. */
  const att=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const vivant=async function(){for(let k=0;k<3;k++){let st=null;try{st=dbgState();}catch(e){}if(st&&st.started&&!st.gameOver)return true;try{dbgJouer();}catch(e){}
    for(let i=0;i<40;i++){await att(500);try{st=dbgState();if(st.started&&st.running&&!st.gameOver)return true;}catch(e){}}}return false;};
  try{if(window.dbgImmortel)dbgImmortel(false);}catch(e){}
  await vivant();{const t0=performance.now();while(performance.now()-t0<240000){let ok=false;try{ok=dbgJadePoste('bandes')!=='pas de map';}catch(e){}if(ok)break;await att(1000);}}
  const DE=window.__de||2300,A=window.__a||3000,N=window.__n||4,o={essais:[]};
  for(let e=0;e<N;e++){const E={morts:[]};if(!(await vivant()))break;dbgJadeAller(DE+e*15);await att(300);dbgAuto(1,0,{nit:0,vol:true,saut:4,latK:0});const t0=performance.now();
    while(performance.now()-t0<90000){await att(150);let R,st;try{R=dbgRoute();st=dbgState();}catch(x){continue;}
      if(st.gameOver){let p=null;try{const c=dbgState();p=c.pos||c.car||null;}catch(x){}E.morts.push({s:Math.round(R.s),cause:R.cause,mode:R.mode,lat:+R.lat.toFixed(1),p:p});break;}
      if(R.s>A)break;}
    dbgAuto(0);o.essais.push(E);}
  try{o.niveau=dbgJade().niveau;}catch(x){}
  return JSON.stringify(o);})()
