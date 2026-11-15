/* LE COÛT DE LA SCÈNE BÂTIE, DÉTERMINISTE (2026-11-15, passe d'optimisation de l'orbite) : à l'arrêt, juste après la construction, sans rouler.
   Les objets visibles (drapeau visible, pas le champ de la caméra), triangles et sommets × instances, par groupe nommé ; le DÉCOR = tout sauf la piste
   (piste…, autoroute…), l'argent (pièces…) et la caisse (carrosserie…) — la piste dépend de l'état des niveaux de détail au moment du relevé, le décor non.
   Plus renderer.info (géométries, textures, programmes) et la mémoire des tampons (octets des attributs et index des géométries de la scène, chacune une fois).
   node outils/banc-maps/banc.cjs gen --carte=espace --meteo=soir --graines=2,3,4,5 [--tel=1] --q="poste=max&pioche=0" --auditfile=outils/banc-routes/cout-scene-page.js */
(function(){try{
  const sc=dbgScene(),scene=sc.scene,R9=sc.rdr,G={},vu=new Set();let obj=0,tri=0,som=0,dO=0,dT=0,dS=0,oct=0;
  const route=/^(piste|autoroute|pièces|carrosserie)/;
  scene.traverseVisible(function(o){if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite))return;const g=o.geometry;if(!g||!g.attributes||!g.attributes.position)return;
    const ni=o.isInstancedMesh?o.count:(g.isInstancedBufferGeometry&&g.instanceCount<Infinity?g.instanceCount:1);if(!ni)return;
    const nb=g.index?g.index.count:g.attributes.position.count,dr=Math.min(nb,g.drawRange&&g.drawRange.count<Infinity?g.drawRange.count:nb);
    const t=o.isMesh?dr/3*ni:0,s=g.attributes.position.count*ni;let a=o,k='';while(a&&a!==scene){if(a.name){k=a.name;break;}a=a.parent;}k=k||'(sans nom)';
    if(!vu.has(g)){vu.add(g);for(const n in g.attributes){const A=g.attributes[n],a9=A&&(A.array||(A.data&&A.data.array));if(a9)oct+=a9.byteLength;}if(g.index&&g.index.array)oct+=g.index.array.byteLength;}
    const e=G[k]||(G[k]={obj:0,tri:0,som:0});e.obj++;e.tri+=t;e.som+=s;obj++;tri+=t;som+=s;if(!route.test(k)){dO++;dT+=t;dS+=s;}});
  const L=Object.keys(G).map(function(k){return [k,G[k].obj,Math.round(G[k].tri),Math.round(G[k].som)];}).sort(function(a,b){return b[3]-a[3];});
  const o={obj:obj,tri:Math.round(tri),som:Math.round(som),decor:{obj:dO,tri:Math.round(dT),som:Math.round(dS)},Mo:Math.round(oct/1048576*10)/10,
    geo:R9.info.memory.geometries,tex:R9.info.memory.textures,prog:R9.info.programs?R9.info.programs.length:null,groupes:L.slice(0,30)};
  try{o.tasMo=Math.round(performance.memory.usedJSHeapSize/1048576);}catch(e){}
  /* (2026-11-15, le vérificateur : « géométries vivantes +50 à +65 selon le relevé ») les géométries et textures DE LA SCÈNE (tout le graphe, visible ou non, chacune une fois),
     et ce qui vit HORS de la scène (renderer.info − scène : pré-bâti de la map suivante, caches, objets retirés pas encore libérés) */
  {const gS=new Set(),tS=new Set();scene.traverse(function(o){if(o.geometry)gS.add(o.geometry);const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms){for(const k in m){const v=m[k];if(v&&v.isTexture)tS.add(v);}if(m.uniforms)for(const k in m.uniforms){const v=m.uniforms[k]&&m.uniforms[k].value;if(v&&v.isTexture)tS.add(v);}}});
    if(scene.background&&scene.background.isTexture)tS.add(scene.background);if(scene.environment&&scene.environment.isTexture)tS.add(scene.environment);
    o.geoScene=gS.size;o.geoHors=o.geo-gS.size;o.texScene=tS.size;o.texHors=o.tex-tS.size;
    try{o.prebati=typeof dbgPrebati==='function'?String(JSON.stringify(dbgPrebati())).slice(0,240):null;}catch(e){}}
  return JSON.stringify(o);
}catch(e){return 'ERREUR '+e.message;}})()
