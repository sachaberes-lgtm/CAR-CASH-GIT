(async function(){
  /* (2026-11-15, optimiseur de Jade, banc) LE MONTAGE DE LA VALLÉE, seconde par seconde : l'état de la partie, la racine de Jade, ses quartiers, ses familles,
     les cubes fins, l'erreur de bâtisse — pour comprendre une vallée qui ne se pose pas (ordi, machine chargée). 6e argument de sonde-tel.cjs. */
  const att=function(ms){return new Promise(function(r){setTimeout(r,ms);});},L=[];const t0=performance.now();
  for(let i=0;i<60;i++){let e={t:Math.round((performance.now()-t0)/1000)};
    try{const st=dbgState();e.st=[st.started,st.running,st.gameOver,st.mode];}catch(x){e.st=String(x.message);}
    try{const d=dbgJade();e.j=[d.quartiers,d.finPrets,d.err,d.ms];}catch(x){e.j=String(x.message).slice(0,80);}
    try{e.b=dbgJadePoste('bandes');}catch(x){e.b=String(x.message).slice(0,80);}
    try{e.err=window.__jadeErr?String(window.__jadeErr).slice(0,200):null;}catch(x){}
    L.push(e);if(i===2){try{dbgJouer();}catch(x){}}await att(4000);}
  return JSON.stringify(L);})()
