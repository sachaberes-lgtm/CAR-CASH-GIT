(async function(){ /* (2026-11-14, optimisation de la grotte) LES GELS EN COURSE ET LA MÉMOIRE RENDUE — banc.cjs gen --carte=grotte --attente=1 --auditfile=outils/banc-routes/grotte-gels-page.js
   Le pilote auto (nitro coupée) roule 40 s depuis le départ (la grotte se finit pendant ce temps, en tranches) ; chaque image est chronométrée (requestAnimationFrame).
   Puis : les géométries et textures vivantes, le portail (dbgSaut) vers la map suivante, et ce qui reste 8 s après (la grotte quittée doit tout rendre). LECTURE SEULE */
  var dort=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  try{dbgAuto(1,0,{nit:0});}catch(e){}
  var D=[],t0=performance.now(),der=t0,fin=t0+40000;
  await new Promise(function(ok){function f(t){D.push(t-der);der=t;if(t<fin)requestAnimationFrame(f);else ok();}requestAnimationFrame(f);});
  D.shift();var S=D.slice().sort(function(a,b){return a-b;}),q=function(p){return +S[Math.min(S.length-1,Math.floor(S.length*p))].toFixed(1);};
  var st=dbgState(),rd=dbgScene().rdr,g=dbgGrotte();
  var out={images:D.length,moy:+(D.reduce(function(a,b){return a+b;},0)/D.length).toFixed(2),p50:q(.5),p95:q(.95),p99:q(.99),max:+S[S.length-1].toFixed(1),
    sup34:D.filter(function(x){return x>34;}).length,sup50:D.filter(function(x){return x>50;}).length,sup100:D.filter(function(x){return x>100;}).length,
    vivant:!st.gameOver,s:Math.round(dbgRoute().s),pret:g.pret,msFile:g.msFile,geoGrotte:rd.info.memory.geometries,texGrotte:rd.info.memory.textures};
  if(st.gameOver){out.apres='mort : pas de portail';return out;}
  var r=dbgSaut();await dort(8000);var g2=dbgGrotte();
  out.saut=String(r&&r.id||r).slice(0,40);out.geoApres=rd.info.memory.geometries;out.texApres=rd.info.memory.textures;out.grotteRestante=!!g2.on;
  return out;
})()
