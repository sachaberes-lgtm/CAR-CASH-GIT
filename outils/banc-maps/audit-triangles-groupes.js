(function(){try{const S=dbgScene(),r=S.rdr.info;const G={};let tot=0;
S.scene.children.forEach(function(c,ci){c.traverse(function(o){if(!o.isMesh||!o.geometry)return;let v=true,p=o;while(p){if(p.visible===false){v=false;break;}p=p.parent;}if(!v)return;
const g=o.geometry,n=g.index?g.index.count:(g.attributes.position?g.attributes.position.count:0);const k=o.isInstancedMesh?o.count:1;const t=n/3*k;tot+=t;
const key=(c.name||c.type)+'|'+(o.name||'')+'|'+(o.material&&o.material.type||'')+(o.isInstancedMesh?'|inst':'');G[key]=(G[key]||0)+t;});});
const top=Object.keys(G).sort(function(a,b){return G[b]-G[a];}).slice(0,14).map(function(k){return k+'='+Math.round(G[k]/1000)+'k';});
return {sceneTri:Math.round(tot),top:top,geo:r.memory.geometries};}catch(e){return String(e);}})()
