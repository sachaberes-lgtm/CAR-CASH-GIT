(async function(){
  /* (2026-11-14, optimiseur de Jade) LA MS DE TIRAGE, la moins bruitée possible : à 6 abscisses (vue du conducteur, image figée, sans post), le MINIMUM de
     5 mesures dbgTemps(30) — le minimum écarte les à-coups de la machine partagée. Rend aussi le total. Même fichier sur wt-avant (crochets d'origine). */
  const att=function(ms){return new Promise(function(r){setTimeout(r,ms);});},o={pos:[]};
  const vivant=async function(){try{if(window.dbgImmortel)dbgImmortel(true);}catch(e){}for(let k=0;k<3;k++){let st=null;try{st=dbgState();}catch(e){}if(st&&st.started&&!st.gameOver)return;try{dbgJouer();}catch(e){}for(let i=0;i<40;i++){await att(500);try{st=dbgState();if(st.started&&st.running&&!st.gameOver)return;}catch(e){}}}};
  await vivant();{const t0=performance.now();while(performance.now()-t0<240000){let ok=false;try{const d=dbgJade();ok=!!(d&&d.quartiers&&dbgJadePoste('bandes')!=='pas de map');}catch(e){}if(ok)break;await att(1000);}}
  await att(15000);
  for(const s of [600,1600,2800,4000,5400,6800]){await vivant();dbgJadeAller(s);await att(2500);dbgJadeVue();await att(400);let m=1e9;for(let k=0;k<5;k++){m=Math.min(m,dbgTemps(30));await att(100);}o.pos.push([s,m]);}
  o.total=+o.pos.reduce(function(a,p){return a+p[1];},0).toFixed(2);o.moy={appels:0,g:{jO:1}};return JSON.stringify(o);})()
