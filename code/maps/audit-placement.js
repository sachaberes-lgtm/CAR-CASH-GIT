/* ===== L'AUDIT DES PLACEMENTS (2026-10-23, Sacha : « retravaille le système de génération de map, des pics de glace mal imbriqués dans le sol, pareil dans les dunes ») =====
   `dbgAudit('dunes')` : pour chaque décor posé, la hauteur du sol sous son pied comparée à l'endroit où il s'arrête.
   · flotte = le sol est PLUS BAS que le pied (on voit dessous : le pic « pend », le décor « dépasse » du relief)
   · Rend le compte, les pires cas et leurs coordonnées. `dbgAudit('vue',{p,c,fov})` : la caméra libre, en pause. */
window.dbgAudit=function(k,o){
  o=o||{};
  if(k==='vue'){if(started&&!gameOver&&!paused)togglePause();camera.position.fromArray(o.p);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3().fromArray(o.c));camera.fov=o.fov||60;camera.updateProjectionMatrix();camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'ok';}
  if(k==='aller'){SF.force={carte:o.carte,meteo:o.meteo||null,teinte:o.teinte||null};return classiqueJouer();} /* le JOUER sur la map demandée (banc) */
  if(k==='fins'){ /* les maillages hauts et fins (colonnes, aiguilles) : nom, boîte, matière — pour traquer ce qui dépasse */
    const out=[],bx=new THREE.Box3(),sz=new THREE.Vector3(),ce=new THREE.Vector3();scene.updateMatrixWorld(true);
    scene.traverse(function(m){try{if(!m.isMesh||!m.geometry||!m.visible)return;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();bx.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);bx.getSize(sz);bx.getCenter(ce);
      const w=Math.max(sz.x,sz.z);if(sz.y>(o.h||150)&&sz.y>w*(o.r||2))out.push({nom:m.name||m.type,mat:m.material&&(m.material.type+(m.material.name?':'+m.material.name:'')),h:Math.round(sz.y),w:Math.round(w),c:[ce.x,ce.y,ce.z].map(Math.round),n:m.geometry.attributes.position?m.geometry.attributes.position.count:0});}catch(e){}});
    return out.slice(0,60);}
  if(k==='dunes'){ /* chaque instance de décor : le pied contre le sol sous son emprise (anneau de 8 points à 0,5 r et à r) */
    if(!DN.on||!DN.grp)return 'pas de dunes';const mt=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),R={};
    for(const im of DN.grp.children){if(!im.isInstancedMesh)continue;if(!im.geometry.boundingBox)im.geometry.computeBoundingBox();const bb=im.geometry.boundingBox,pa=im.geometry.attributes.position,y9=bb.min.y+(bb.max.y-bb.min.y)*.08;let rl=0;
      for(let v=0;v<pa.count;v++)if(pa.getY(v)<=y9)rl=Math.max(rl,Math.abs(pa.getX(v)),Math.abs(pa.getZ(v))); /* l'emprise du PIED seulement (pas les branches ni les palmes) */
      const E={n:im.count,flotte:0,flotteMax:0,enterreMax:0,ex:[]};
      for(let i=0;i<im.count;i++){im.getMatrixAt(i,mt);mt.decompose(p,q,sc);const r=rl*Math.max(sc.x,sc.z),yb=p.y+bb.min.y*sc.y;let lo=1e9,hi=-1e9;
        for(const f of [0,.5,1])for(let a=0;a<(f?8:1);a++){const th=a/8*6.2832,g=dnHauteur(p.x+Math.cos(th)*r*f,p.z+Math.sin(th)*r*f);if(g<lo)lo=g;if(g>hi)hi=g;}
        const fl=yb-lo,en=hi-yb;if(fl>.5){E.flotte++;if(ex(E,fl))E.ex.push({x:Math.round(p.x),z:Math.round(p.z),fl:+fl.toFixed(1),r:Math.round(r),h:Math.round(sc.y)});}if(fl>E.flotteMax)E.flotteMax=fl;if(en>E.enterreMax)E.enterreMax=en;}
      E.flotteMax=+E.flotteMax.toFixed(1);E.enterreMax=+E.enterreMax.toFixed(1);E.ex=E.ex.slice(0,4);R[im.name]=E;}
    {const mes=function(x,y,z,r){let lo=1e9,hi=-1e9;for(const f of [0,.5,1])for(let a=0;a<(f?16:1);a++){const th=a/16*6.2832,g=dnHauteur(x+Math.cos(th)*r*f,z+Math.sin(th)*r*f);if(g<lo)lo=g;if(g>hi)hi=g;}return {y:Math.round(y),lo:Math.round(lo),hi:Math.round(hi),flotte:+(y-lo).toFixed(1)};};
     R._obs=(DN.ob||[]).map(function(b){return Object.assign({r:Math.round(b.r),h:Math.round(b.h)},mes(b.x,b.y,b.z,b.r*1.42));});
     R._pyrM=DN.pyr?Object.assign({hw:Math.round(DN.pyr.hw),h:Math.round(DN.pyr.h)},mes(DN.pyr.x,DN.pyr.y,DN.pyr.z,DN.pyr.hw*1.4142)):null;}
    R._ob=DN.ob?DN.ob.length:-1;R._pyr=DN.pyr?[Math.round(DN.pyr.x),Math.round(DN.pyr.z),Math.round(DN.pyr.hw),Math.round(DN.pyr.h)]:null;
    return R;function ex(E){return E.ex.length<4;}}
  return 'dunes | vue';
};
