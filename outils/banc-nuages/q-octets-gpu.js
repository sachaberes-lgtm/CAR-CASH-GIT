(async function(){/* la mémoire en octets : géométries vivantes de la scène (uniques, formes de rechange des nuages à part comprises), sur la route des nuages tout prêt, puis après le portail vers les dunes */
const dort=ms=>new Promise(r=>setTimeout(r,ms));const sc=dbgScene().scene,rd=dbgScene().rdr;dbgAuto(1,0,{nit:0});
for(let w=0;w<400;w++){let v8=0,v8f=0;sc.traverse(function(m){if(m.name==='nuages v8'){v8++;if(m.userData.fin)v8f++;}});if(dbgCoton().toutPretMs!=null&&v8f>=v8)break;await dort(500);}
await dort(3000);
function octA(a){if(!a)return 0;const bpe=a.__bpe||(a.array&&a.array.BYTES_PER_ELEMENT)||(a.data&&a.data.array&&a.data.array.BYTES_PER_ELEMENT)||4;const n=(a.count||0)*(a.itemSize||1);return a.isInterleavedBufferAttribute?0:n*bpe;}
function octG(g){let b=0;if(!g||!g.attributes)return 0;for(const k in g.attributes)b+=octA(g.attributes[k]);if(g.index)b+=octA(g.index);return b;}
function bilan(){const S=new Set(),N=new Set();let nv=0;sc.traverse(function(m){if(m.geometry)S.add(m.geometry);if(m.isInstancedMesh&&m.instanceMatrix)S.add({attributes:{im:m.instanceMatrix,ic:m.instanceColor||{}}});
  if(m.name==='nuages v8'){nv++;const u=m.userData;N.add(m.geometry);for(const c of m.children)N.add(c.geometry);if(u.lod){for(const g of u.lod.G)if(g){S.add(g);N.add(g);}for(const g of u.lod.P)if(g){S.add(g);N.add(g);}}}});
  let t=0,n=0;for(const g of S)t+=octG(g);for(const g of N)n+=octG(g);
  return {mem:JSON.parse(JSON.stringify(rd.info.memory)),geoScene:S.size,MoScene:+(t/1048576).toFixed(2),v8:nv,geoV8:N.size,MoV8:+(n/1048576).toFixed(2),cot:dbgCoton().nuages};}
const b0=bilan();
dbgAuto(1,0,{nit:0});dbgClassique('dunes','midi');const s0=dbgSaut();
for(let w=0;w<240;w++){const n=dbgRoute().niveau;if(n&&n.carte!=='nuages'&&n.id!=='nuages')break;await dort(500);}
await dort(15000);const b1=bilan();let heap=null;try{heap=Math.round(performance.memory.usedJSHeapSize/1048576);}catch(e){}
return {nuages:b0,apres:b1,carte:dbgRoute().niveau&&dbgRoute().niveau.carte,saut:String(s0).slice(0,60),tas:heap};})()
