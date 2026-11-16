(async function(){
  /* (2026-11-15, optimiseur de Jade, banc) LES PROGRAMMES COMPILÉS : la vallée posée et vue à 3 abscisses, la liste des programmes de three par nom (et le
     nombre de chaque), les géométries et textures vivantes — pour expliquer un écart de compte entre référence et branche. Crochets d'origine. */
  const att=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const vivant=async function(){try{if(window.dbgImmortel)dbgImmortel(true);}catch(e){}for(let k=0;k<3;k++){let st=null;try{st=dbgState();}catch(e){}if(st&&st.started&&!st.gameOver)return;try{dbgJouer();}catch(e){}for(let i=0;i<40;i++){await att(500);try{st=dbgState();if(st.started&&st.running&&!st.gameOver)return;}catch(e){}}}};
  const R=dbgScene().rdr,o={};const lis=function(){const P={};for(const p of (R.info.programs||[])){const k=(p.name||'?')+(p.cacheKey?'':'');P[k]=(P[k]||0)+1;}return {n:(R.info.programs||[]).length,geo:R.info.memory.geometries,tex:R.info.memory.textures,P:P};};
  o.debut=lis();
  await vivant();{const t0=performance.now();while(performance.now()-t0<240000){let ok=false;try{const d=dbgJade();ok=!!(d&&d.quartiers&&dbgJadePoste('bandes')!=='pas de map');}catch(e){}if(ok)break;await att(1000);}}
  o.monte=lis();
  for(const s of [600,2800,5400]){await vivant();dbgJadeAller(s);await att(2500);dbgJadeVue();await att(600);}
  o.fin=lis();try{o.niveau=dbgJade().niveau;}catch(e){}
  return JSON.stringify(o);})()
