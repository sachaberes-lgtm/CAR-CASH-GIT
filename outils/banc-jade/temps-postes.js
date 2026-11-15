(async function(){
  /* (2026-11-15, optimiseur de Jade, banc) LA MS DE TIRAGE PAR POSTE : aux 6 abscisses de cout-route.js, le minimum de 5 × dbgTemps(20) avec tout, puis sans un
     poste à la fois (dbgJadePoste : chutes, rayons, brume, arbres, montagnes…) — la part de chaque poste dans l'image. Crochets d'origine : sert sur wt-avant. */
  const att=function(ms){return new Promise(function(r){setTimeout(r,ms);});},o={pos:[]};
  const vivant=async function(){try{if(window.dbgImmortel)dbgImmortel(true);}catch(e){}for(let k=0;k<3;k++){let st=null;try{st=dbgState();}catch(e){}if(st&&st.started&&!st.gameOver)return;try{dbgJouer();}catch(e){}for(let i=0;i<40;i++){await att(500);try{st=dbgState();if(st.started&&st.running&&!st.gameOver)return;}catch(e){}}}};
  await vivant();{const t0=performance.now();while(performance.now()-t0<240000){let ok=false;try{ok=dbgJadePoste('bandes')!=='pas de map';}catch(e){}if(ok)break;await att(1000);}}
  await att(10000);
  const mes=async function(){let m=1e9;for(let k=0;k<5;k++){m=Math.min(m,dbgTemps(20));await att(60);}return m;};
  const P=window.__postes||['chutes','rayons','brume','arbres'];
  for(const s of [600,1600,2800,4000,5400,6800]){await vivant();dbgJadeAller(s);await att(2500);dbgJadeVue();await att(400);const e={s:s,tout:await mes()};
    for(const k of P){try{dbgJadePoste(k,false);e[k]=+(e.tout-(await mes())).toFixed(2);dbgJadePoste(k,true);}catch(x){e[k]=String(x.message).slice(0,40);}}
    o.pos.push(e);}
  o.moy={};for(const k of ['tout'].concat(P)){const v=o.pos.map(function(p){return p[k];}).filter(function(x){return typeof x==='number';});o.moy[k]=v.length?+(v.reduce(function(a,b){return a+b;},0)/v.length).toFixed(2):null;}
  return JSON.stringify(o);})()
