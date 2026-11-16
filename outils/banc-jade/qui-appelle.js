(async function(){
  /* (2026-11-15, optimiseur de Jade, banc) QUI FAIT LES APPELS, abscisse par abscisse (les mêmes 6 que cout-route.js) : dbgAppels(1) rangé par objet, pour
     comparer référence et branche poste par poste. Crochets d'origine : sert tel quel sur wt-avant. 6e argument de sonde-tel.cjs. */
  const att=function(ms){return new Promise(function(r){setTimeout(r,ms);});},o={pos:[]};
  const vivant=async function(){try{if(window.dbgImmortel)dbgImmortel(true);}catch(e){}for(let k=0;k<3;k++){let st=null;try{st=dbgState();}catch(e){}if(st&&st.started&&!st.gameOver)return;try{dbgJouer();}catch(e){}for(let i=0;i<40;i++){await att(500);try{st=dbgState();if(st.started&&st.running&&!st.gameOver)return;}catch(e){}}}};
  await vivant();{const t0=performance.now();while(performance.now()-t0<240000){let ok=false;try{const d=dbgJade();ok=!!(d&&d.quartiers&&dbgJadePoste('bandes')!=='pas de map');}catch(e){}if(ok)break;await att(1000);}}
  await att(8000);const T={};
  for(const s of (window.__coutAbs||[600,1600,2800,4000,5400,6800])){try{await vivant();dbgJadeAller(s);await att(2500);dbgJadeVue();await att(400);const a=dbgAppels(400);
    const L={};for(const e of a.liste){const kk=e[2].replace(/ VIDE/,'');L[kk]=(L[kk]||0)+e[0];T[kk]=(T[kk]||0)+e[0]/6;}
    o.pos.push({s:s,n:Object.values(L).reduce(function(x,y){return x+y;},0)});}catch(e){o.pos.push({s:s,err:String(e.message||e)});}}
  o.moy=Object.fromEntries(Object.entries(T).map(function(e){return [e[0],+e[1].toFixed(1)];}).sort(function(a,b){return b[1]-a[1];}));
  return JSON.stringify(o);})()
