(async function(){
  /* (2026-11-15, optimiseur de Jade, 2e passe) LE SAUT DE TEINTE DE LA BANDE 1 (téléphone) : à 6 abscisses, la voiture posée et la vue du conducteur, l'écart
     pixel à pixel entre la bande 1 en VERRE (trois passes, ce que l'on voit sous 220 m) et en opaque — réglé (vrO1) puis d'avant (vrO). C'est exactement le saut
     que l'oeil voit quand une montagne passe la limite des 220 m en roulant. 6e argument de sonde-tel.cjs (branche seulement : dbgJadeB1). */
  const att=function(ms){return new Promise(function(r){setTimeout(r,ms);});},o={pos:[]};
  const vivant=async function(){try{if(window.dbgImmortel)dbgImmortel(true);}catch(e){}for(let k=0;k<3;k++){let st=null;try{st=dbgState();}catch(e){}if(st&&st.started&&!st.gameOver)return;try{dbgJouer();}catch(e){}for(let i=0;i<40;i++){await att(500);try{st=dbgState();if(st.started&&st.running&&!st.gameOver)return;}catch(e){}}}};
  await vivant();{const t0=performance.now();while(performance.now()-t0<240000){let ok=false;try{const d=dbgJade();ok=!!(d&&d.quartiers&&dbgJadePoste('bandes')!=='pas de map');}catch(e){}if(ok)break;await att(1000);}}
  await att(8000);
  for(const s of [600,1600,2800,4000,5400,6800]){try{await vivant();dbgJadeAller(s);await att(2500);dbgJadeVue();await att(400);
    dbgJadeB1('opaque');const a=dbgJadeB1('ecart');dbgJadeB1('ancien');const b=dbgJadeB1('ecart');dbgJadeB1('opaque');
    o.pos.push({s:s,regle:[a.part,a.abs,a.lumVerre,a.lumMode],ancien:[b.part,b.abs,b.lumVerre,b.lumMode]});}catch(e){o.pos.push({s:s,err:String(e.message||e)});}}
  const m=function(k,i){const v=o.pos.filter(function(p){return p[k];}).map(function(p){return p[k][i];});return v.length?+(v.reduce(function(x,y){return x+y;},0)/v.length).toFixed(2):null;};
  o.moy={regleAbs:m('regle',1),ancienAbs:m('ancien',1),regleLum:[m('regle',2),m('regle',3)],ancienLum:[m('ancien',2),m('ancien',3)],part:m('regle',0)};
  return JSON.stringify(o);})()
