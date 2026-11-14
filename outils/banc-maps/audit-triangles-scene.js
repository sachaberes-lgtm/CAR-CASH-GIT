(function(){try{const S=dbgScene(),r=S.rdr.info;let tri=0,mesh=0,inst=0;
S.scene.traverse(function(o){if(!o.isMesh||!o.visible||!o.geometry)return;let v=true,p=o;while(p){if(p.visible===false){v=false;break;}p=p.parent;}if(!v)return;
const g=o.geometry,n=g.index?g.index.count:(g.attributes.position?g.attributes.position.count:0);const k=o.isInstancedMesh?o.count:1;tri+=n/3*k;mesh++;if(o.isInstancedMesh)inst++;});
return {calls:r.render.calls,tri:r.render.triangles,geo:r.memory.geometries,tex:r.memory.textures,sceneTri:Math.round(tri),mesh:mesh,inst:inst};}catch(e){return String(e);}})()
