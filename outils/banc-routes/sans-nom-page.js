/* LES OBJETS SANS NOM DE LA SCÈNE (2026-11-15, passe d'optimisation de l'orbite) : cout-page.js range ~60-70 objets et 70-95 k triangles / 195-260 k sommets
   sous « (sans nom) ». Ce banc les détaille : par objet dessinable visible (et non visible), son type, sa géométrie (classe, indexée ou non, sommets, triangles,
   instances), son matériau (type, transparent, shader), sa position, sa distance à la caméra, son ancêtre le plus proche. Groupé par signature.
   node outils/banc-maps/banc.cjs gen --carte=espace --meteo=soir --graines=5 --auditfile=outils/banc-routes/sans-nom-page.js   (résultat dans `perso`) */
(function(){try{
  const sc=dbgScene(),scene=sc.scene,cam=sc.cam||sc.camera;const G={};let tous=0,invis=0;
  const vis=new Set();scene.traverseVisible(function(o){vis.add(o);});
  scene.traverse(function(o){if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite))return;const g=o.geometry;if(!g||!g.attributes||!g.attributes.position)return;tous++;
    let a=o,k='';while(a&&a!==scene){if(a.name){k=a.name;break;}a=a.parent;}
    const v=vis.has(o);if(!v)invis++;
    const ni=o.isInstancedMesh?o.count:(g.isInstancedBufferGeometry&&g.instanceCount<Infinity?g.instanceCount:1);
    const nb=g.index?g.index.count:g.attributes.position.count,tri=o.isMesh?Math.round(nb/3*ni):0,som=g.attributes.position.count*ni;
    const m=Array.isArray(o.material)?o.material[0]:o.material;
    const wp=new THREE.Vector3();o.getWorldPosition(wp);const dc=cam?Math.round(wp.distanceTo(cam.position)):null;
    const sig=[k||'(sans nom)',o.type,g.type,g.index?'idx':'NON-idx',g.attributes.position.count,m?m.type:'?',m&&m.transparent?'transp':'',m&&m.userData&&m.userData.nom||''].join('|');
    const e=G[sig]||(G[sig]={n:0,vis:0,tri:0,som:0,ex:[]});e.n++;if(v){e.vis++;e.tri+=tri;e.som+=som;}
    const ch=[];let b=o.parent;while(b&&b!==scene&&ch.length<5){ch.push((b.name||b.type)+'['+b.children.length+']'+(Object.keys(b.userData||{}).length?'{'+Object.keys(b.userData).join(',')+'}':''));b=b.parent;}
    if(e.ex.length<2)e.ex.push({chaine:ch.join(' < '),uni:m&&m.uniforms?Object.keys(m.uniforms).slice(0,8).join(','):'',vc:m&&m.vertexColors,ud:Object.keys(o.userData||{}).join(','),pos:[Math.round(wp.x),Math.round(wp.y),Math.round(wp.z)],dc:dc,ni:ni,par:o.parent&&(o.parent.name||o.parent.type),uuid:o.uuid.slice(0,6),attr:Object.keys(g.attributes).join(',')});});
  const L=Object.keys(G).map(function(s){return Object.assign({sig:s},G[s]);}).sort(function(a,b){return b.som-a.som;});
  return JSON.stringify({tous:tous,invisibles:invis,groupes:L.slice(0,80)});
}catch(e){return 'ERREUR '+e.message+' '+e.stack;}})()
