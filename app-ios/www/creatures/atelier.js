





importScripts('../vendor/three.min.js','vitrail.js?v=1','singe.js?v=2');
function paquet(G){const a={};for(const k in G.attributes){const A=G.attributes[k];a[k]=[A.array,A.itemSize];}
  const s=G.boundingSphere;return {a:a,i:G.index.array,bs:[s.center.x,s.center.y,s.center.z,s.radius]};}
onmessage=function(e){
  const out=[],tr=new Set();
  for(const n of e.data.formes){const F=n==='course'?SINGE_FC:singePoseForme(n);vitrailFini(vitrailPrepare(F));
    const o={n:n,lisse:paquet(F._geo.lisse),ecailles:paquet(F._geo.ecailles)};out.push(o);
    for(const G of [o.lisse,o.ecailles]){for(const k in G.a)tr.add(G.a[k][0].buffer);tr.add(G.i.buffer);}}
  postMessage(out,Array.from(tr));
};
