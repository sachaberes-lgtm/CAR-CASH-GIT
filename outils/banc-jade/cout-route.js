(async function(){
  /* (2026-11-14, optimiseur de Jade) LE COÛT LE LONG DE LA ROUTE, poste par poste : la voiture posée à 6 abscisses (dbgJadeAller), la vue du conducteur
     (dbgJadeVue), puis pour chaque image figée : chaque appel de dessin compté (renderBufferDirect enveloppé, une image, sans post) et rangé par genre —
     jade verre (absorption / profondeur / lumière), jade opaque, autres instances, autres —, ses triangles et ses SOMMETS calculés (position.count ×
     exemplaires), puis la ms de tirage (dbgTemps, 20 images, bruitée). En fin : la mémoire (géométries / textures vivantes, tas JS) et les ms de bâtisse
     (dbgJade). N'emploie que des crochets d'origine : sert tel quel sur wt-avant. --auditfile de banc.cjs gen, ou 6e argument de sonde-tel.cjs. */
  const att=function(ms){return new Promise(function(r){setTimeout(r,ms);});},vivant=async function(){try{if(window.dbgImmortel)dbgImmortel(true);}catch(e){}for(let k=0;k<3;k++){let st=null;try{st=dbgState();}catch(e){}if(st&&st.started&&!st.gameOver)return;try{dbgJouer();}catch(e){}for(let i=0;i<40;i++){await new Promise(function(r){setTimeout(r,500);});try{st=dbgState();if(st.started&&st.running&&!st.gameOver)return;}catch(e){}}}},o={pos:[]};
  const R=dbgScene().rdr,sc=dbgScene().scene,cam=dbgScene().cam;
  const genre=function(mat,obj){const u=mat&&mat.uniforms;if(u&&u.uBump&&obj.isInstancedMesh){const d=mat.defines||{};return d.OPAQUE!==undefined?'jO':d.PASSE_M!==undefined?'jM':d.PREPASS!==undefined?'jP':'jA';}
    if(u&&u.uBump)return 'jS';return obj.isInstancedMesh?'I':obj.isPoints?'pts':'m';};
  const ABS=window.__coutAbs||[600,1600,2800,4000,5400,6800];
  /* la vallée doit être posée (JADE.root) : sur une machine chargée, l'ordi la bâtit en plusieurs dizaines de secondes */
  await vivant();{const t0=performance.now();o.attente=0;while(performance.now()-t0<240000){let ok=false;try{const d=dbgJade();ok=!!(d&&d.quartiers&&dbgJadePoste('bandes')!=='pas de map');}catch(e){}if(ok)break;await att(1000);}o.attente=Math.round((performance.now()-t0)/1000);}
  {const t0=performance.now();let der=null,st=0;while(performance.now()-t0<90000){try{const d=dbgJade();if(d.finPrets===der)st++;else{st=0;der=d.finPrets;}if(st>=6)break;}catch(e){}await att(1000);}o.attenteFins=Math.round((performance.now()-t0)/1000);o.finPrets=der;} /* les cubes fins (ordi) : attendre que leur compte ne bouge plus */
  for(const s of ABS){
    try{const al=await vivant();dbgJadeAller(s);await att(2500);const vu=dbgJadeVue();await att(400);
      const C={},orig=R.renderBufferDirect;let n=0,tri=0,som=0;
      R.renderBufferDirect=function(c9,s9,geo,mat,obj,grp){const g=genre(mat,obj),k=obj.isInstancedMesh?obj.count:1,ic=geo.index?geo.index.count:(geo.attributes.position?geo.attributes.position.count:0),pc=geo.attributes.position?geo.attributes.position.count:0;
        let ic2=ic;if(geo.drawRange&&geo.drawRange.count!==Infinity)ic2=Math.min(ic,geo.drawRange.count);
        const e=C[g]||(C[g]={n:0,tri:0,som:0});e.n++;e.tri+=ic2/3*k;e.som+=pc*k;n++;tri+=ic2/3*k;som+=pc*k;return orig.apply(this,arguments);};
      try{R.render(sc,cam);}finally{R.renderBufferDirect=orig;}
      for(const k in C){C[k].tri=Math.round(C[k].tri/1000);C[k].som=Math.round(C[k].som/1000);}
      const ms=dbgTemps(20);o.pos.push({s:s,al:al,vu:vu&&vu.cam,appels:n,tri:Math.round(tri/1000),som:Math.round(som/1000),ms:ms,g:C});}catch(e){o.pos.push({s:s,err:String(e.message||e)});}}
  try{if(window.gc){window.gc();window.gc();}const m=R.info.memory;o.mem={geo:m.geometries,tex:m.textures,prog:R.info.programs?R.info.programs.length:null,tas:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null};}catch(e){o.mem=String(e);}
  try{if(window.dbgJadeMemoire)o.memJ=dbgJadeMemoire();}catch(e){o.memJ=String(e);}
  try{const d=dbgJade();o.bati={ms:d.ms,gabaritsMs:d.gabaritsMs,montagnes:d.montagnes,rochers:d.rochers,arbres:d.arbres,cristaux:d.cristaux,cascades:d.cascades,brume:d.brume,quartiers:d.quartiers,triMs:d.tri,finPrets:d.finPrets,err:d.err,niveau:d.niveau};}catch(e){o.bati=String(e);}
  const moy=function(k){const v=o.pos.filter(function(p){return p[k]!=null;}).map(function(p){return p[k];});return v.length?+(v.reduce(function(a,b){return a+b;},0)/v.length).toFixed(2):null;};
  const mx=function(k){return Math.max.apply(null,o.pos.filter(function(p){return p[k]!=null;}).map(function(p){return p[k];}));};
  o.moy={appels:moy('appels'),appelsMax:mx('appels'),tri:moy('tri'),som:moy('som'),ms:moy('ms')};
  {const G={};for(const p of o.pos)for(const k in (p.g||{})){G[k]=G[k]||{n:0,tri:0,som:0};G[k].n+=p.g[k].n;G[k].tri+=p.g[k].tri;G[k].som+=p.g[k].som;}const N=o.pos.length||1;for(const k in G){G[k].n=+(G[k].n/N).toFixed(1);G[k].tri=Math.round(G[k].tri/N);G[k].som=Math.round(G[k].som/N);}o.moy.g=G;}
  return JSON.stringify(o);})()
