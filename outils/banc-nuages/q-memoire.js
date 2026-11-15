(async function(){
  /* (2026-11-15) la mémoire vivante à temps ÉGAL : 25 s après le départ (le pilote roule), puis 25 s plus loin.
     geo / tex / prog : renderer.info ; js / gpu : TOUS les tampons des géométries de la scène ET des formes de rechange des nuages à part (userData.lod : fine et légère, corps et peau),
     chacun compté une fois — js = la copie JavaScript encore gardée, gpu = les octets envoyés (count × itemSize × octets) ; noms : les programmes par nom (pour comparer deux arbres). */
  const dort=function(ms){return new Promise(function(r){setTimeout(r,ms);});};const rd=dbgScene().rdr,sc=dbgScene().scene;try{dbgAuto(1,0,{nit:0});}catch(e){}
  const releve=function(){const P=rd.info.programs||[],N={};for(const p of P){const k=String(p.name||'')+'|'+String(p.cacheKey||'').slice(0,40).replace(/[^a-zA-Z0-9_]/g,'');N[k]=(N[k]||0)+1;}
    const A=new Set();let js=0,gpu=0,jsN=0,gpuN=0;const at=function(x,nu){if(!x||A.has(x))return;A.add(x);const bpe=x.array?x.array.BYTES_PER_ELEMENT:(x.__bpe||4),o=x.count*x.itemSize*bpe,j=x.array?x.array.byteLength:0;gpu+=o;js+=j;if(nu){gpuN+=o;jsN+=j;}};
    const geo=function(g,nu){if(!g)return;for(const k in g.attributes)at(g.attributes[k],nu);at(g.index,nu);};
    sc.traverse(function(m){if(!m.geometry)return;const nu=/nuage|coton/i.test(m.name||'')||(m.parent&&/nuage|coton/i.test(m.parent.name||''));geo(m.geometry,nu);if(m.isInstancedMesh){at(m.instanceMatrix,nu);at(m.instanceColor,nu);}
      const L=m.userData&&m.userData.lod;if(L){for(const g of L.G)geo(g,true);for(const g of L.P)geo(g,true);}});
    const Mo=function(x){return +(x/1048576).toFixed(1);};
    return {s:Math.round(dbgRoute().s||0),geo:rd.info.memory.geometries,tex:rd.info.memory.textures,prog:P.length,jsMo:Mo(js),gpuMo:Mo(gpu),nuJsMo:Mo(jsN),nuGpuMo:Mo(gpuN),tas:performance.memory?Mo(performance.memory.usedJSHeapSize):null,noms:N,ram:window.dbgRamNuages?dbgRamNuages():null};};
  await dort(25000);const a=releve();await dort(25000);const b=releve();return {a:a,b:b};
})()
