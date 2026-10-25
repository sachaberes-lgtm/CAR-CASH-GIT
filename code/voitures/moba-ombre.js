/* ===== L'OMBRE DE LA CAISSE EN UN MINIMUM DE DESSINS (2026-10-25, passe perf mobile : « réduire les appels de dessin ») =====
   MESURÉ (iPhone 13 Pro, niveau 9, dbgAppels) : 12 appels « MeshDepthMaterial <carrosserie> » — la passe d'ombre dessine À PART chaque
   maillage de la caisse (chaque lot soudé, chaque pièce d'essieu), alors qu'elle les dessine tous avec la MÊME matière de profondeur.
   three r128 (getDepthMaterial) ne lit, de la matière d'une pièce, que : visible, wireframe, side / shadowSide et les plans de coupe —
   ni couleur, ni carte, ni transparence, ni onBeforeCompile. Deux pièces d'un même repère et d'un même côté d'ombre laissent donc la
   même carte de profondeur, dessinées en un appel ou en deux (le test de profondeur garde le plus proche : l'ordre ne compte pas).
   · À la construction (fin de buildCar) : dans chaque groupe RIGIDE de la caisse (carrosserie, essieux, pivots d'ailes…), les pièces
     qui portent leur ombre sont cuites en UNE géométrie « positions seules » par côté d'ombre : un MANDATAIRE d'ombre, caché.
   · À chaque passe d'ombre (`renderer.shadowMap.render`, enveloppée) : si chaque pièce est toujours là, visible, au même repère, avec
     la même matière, le mandataire s'allume et ses pièces ne portent plus leur ombre LE TEMPS DE LA PASSE ; tout est rendu juste après.
     La passe de couleur ne voit rien : sa liste est faite AVANT la passe d'ombre (mandataire caché), et `castShadow` ne la concerne pas.
   · Une pièce qui bouge, change de matière ou s'éteint SEULE sort du mandataire (recuit sans elle) : elle reprend son propre appel.
     La caisse entière éteinte (explosion, menus…) : cette passe-là prend l'ancien chemin.
   Sommets en float32, posés par la matrice de la pièce dans son groupe (identité pour les lots soudés : copie exacte des sommets) ;
   miroir (déterminant négatif) : triangles retournés, comme three retourne la face avant. Le mandataire a sa propre matière, jamais
   compilée (colorWrite, depthWrite, depthTest coupés) : s'il était un jour dessiné en couleur, il ne laisserait aucun pixel.
   `?moba_ombre=0` : l'ancien chemin. `dbgMobaOmbre()` : les mandataires et leurs pièces ; `dbgMobaOmbre(false|true)` : bascule. */
const MOBA_Q=(function(){try{return new URLSearchParams(location.search);}catch(e){return null;}})();
function MOBA_param(k,d){const v=MOBA_Q?MOBA_Q.get('moba_'+k):null;return v==null?d:v!=='0';}
const MOBA_OMBRE={on:MOBA_param('ombre',true),L:[],pris:[],replis:0,recuits:0,passes:0};
const MOBA_V=new THREE.Vector3(),MOBA_COTE=[1,0,2]; /* side → côté d'ombre par défaut de three (FrontSide → BackSide, BackSide → FrontSide, DoubleSide) */
function MOBA_elig(o){ /* une pièce que la passe d'ombre dessine avec la matière de profondeur commune, sans rien de particulier */
  if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||!o.castShadow||!o.visible||(o.userData&&(o.userData.noShadow||o.userData.mobaOmbre)))return false;
  const m=o.material;if(!m||Array.isArray(m)||!m.visible||m.wireframe)return false;
  if(o.customDepthMaterial!==undefined||o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender)return false;
  if(m.clippingPlanes&&m.clippingPlanes.length)return false;
  const g=o.geometry,a=g&&g.isBufferGeometry?g.attributes.position:null;
  if(!a||a.isInterleavedBufferAttribute||a.normalized||a.itemSize!==3||g.drawRange.start!==0||g.drawRange.count!==Infinity)return false;
  if(g.morphAttributes&&g.morphAttributes.position&&g.morphAttributes.position.length)return false;
  return true;}
function MOBA_cote(m){return m.shadowSide!=null?m.shadowSide:MOBA_COTE[m.side];}
function MOBA_cuit(o,L){ /* les triangles de la pièce, posés dans le repère de son groupe */
  const g=o.geometry,a=g.attributes.position,ix=g.index?g.index.array:null,n0=ix?ix.length:a.count,n=n0-n0%3,out=new Float32Array(n*3);
  const flip=L.determinant()<0,id=L.equals(MOBA_ID);
  for(let i=0;i<n;i++){const r=i%3,j=flip?(r===1?i+1:r===2?i-1:i):i,v=ix?ix[j]:j;
    if(id){out[i*3]=a.getX(v);out[i*3+1]=a.getY(v);out[i*3+2]=a.getZ(v);}
    else{MOBA_V.fromBufferAttribute(a,v).applyMatrix4(L);out[i*3]=MOBA_V.x;out[i*3+1]=MOBA_V.y;out[i*3+2]=MOBA_V.z;}}
  return out;}
const MOBA_ID=new THREE.Matrix4();
function MOBA_meme(a,b){const x=a.elements,y=b.elements;for(let i=0;i<16;i++)if(Math.abs(x[i]-y[i])>1e-7)return false;return true;}
function MOBA_recuit(E){ /* (re)fait le mandataire avec les pièces qui restent ; moins de deux : plus de mandataire, chacune son appel */
  if(E.mesh){if(E.mesh.parent)E.mesh.parent.remove(E.mesh);E.mesh.geometry.dispose();E.mesh=null;}
  if(E.ps.length<2)return;
  let n=0;for(const p of E.ps)n+=p.pos.length;
  const arr=new Float32Array(n);n=0;for(const p of E.ps){arr.set(p.pos,n);n+=p.pos.length;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(arr,3));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,E.mt);m.name='moba ombre';m.userData.mobaOmbre=1;m.castShadow=true;m.receiveShadow=false;m.visible=false;
  m.frustumCulled=false;m.matrixAutoUpdate=false;E.C.add(m);m.updateMatrixWorld(true);E.mesh=m;}
function MOBA_ombreDefait(){
  for(const E of MOBA_OMBRE.L){if(E.mesh){if(E.mesh.parent)E.mesh.parent.remove(E.mesh);E.mesh.geometry.dispose();E.mesh=null;}E.mt.dispose();}
  MOBA_OMBRE.L.length=0;}
function MOBA_ombreBatit(){ /* fin de buildCar : un mandataire par groupe rigide et par côté d'ombre, s'il remplace au moins deux pièces */
  MOBA_ombreDefait();if(!MOBA_OMBRE.on)return;
  const vus=new Map();
  carGroup.traverse(function(o){if(o.parent&&MOBA_elig(o)){let P=vus.get(o.parent);if(!P)vus.set(o.parent,P=[]);P.push(o);}});
  for(const ent of vus){const C=ent[0],lots=new Map();
    for(const o of ent[1]){const k=MOBA_cote(o.material);let P=lots.get(k);if(!P)lots.set(k,P=[]);P.push(o);}
    for(const lot of lots){const P=lot[1];if(P.length<2)continue;
      const mt=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,depthTest:false});mt.shadowSide=lot[0];
      const E={C:C,mt:mt,mesh:null,ps:P.map(function(o){if(o.matrixAutoUpdate)o.updateMatrix();const L=o.matrix.clone();return {o:o,m:o.material,L:L,pos:MOBA_cuit(o,L),x:0};})};
      MOBA_recuit(E);if(E.mesh)MOBA_OMBRE.L.push(E);else mt.dispose();}}
}
function MOBA_pret(E){ /* vrai : pour cette passe, le mandataire remplace exactement ses pièces */
  if(!E.mesh||E.mesh.parent!==E.C)return false;
  let mou=0,dur=0;
  for(const p of E.ps){const o=p.o;
    if(o.parent!==E.C||o.material!==p.m||!MOBA_meme(o.matrix,p.L)){p.x=1;dur++;}
    else if(!o.visible||!o.castShadow||!p.m.visible){p.x=2;mou++;}
    else p.x=0;}
  if(mou&&!dur&&mou*2>=E.ps.length){MOBA_OMBRE.replis++;return false;} /* la caisse (presque) toute éteinte : l'ancien chemin, cette fois */
  if(dur||mou){E.ps=E.ps.filter(function(p){return p.x===0;});MOBA_OMBRE.recuits++;MOBA_recuit(E);if(!E.mesh)return false;}
  return true;}
(function(){const sm=renderer.shadowMap,f0=sm.render;
  sm.render=function(lights,sc,cam){
    const L=MOBA_OMBRE.L;
    if(!MOBA_OMBRE.on||!L.length||!sm.enabled||(sm.autoUpdate===false&&sm.needsUpdate===false)||!lights||!lights.length)return f0.apply(this,arguments);
    const pris=MOBA_OMBRE.pris;pris.length=0;
    for(let i=0;i<L.length;i++){const E=L[i];
      if(MOBA_pret(E)){E.mesh.visible=true;E.mesh.castShadow=true;E.mesh.matrixWorld.copy(E.C.matrixWorld); /* (repère identité dans son groupe : sa matrice monde EST celle du groupe) */for(const p of E.ps)p.o.castShadow=false;pris.push(E);}}
    try{return f0.apply(this,arguments);}
    finally{for(let i=0;i<pris.length;i++){const E=pris[i];E.mesh.visible=false;for(const p of E.ps)p.o.castShadow=true;}pris.length=0;MOBA_OMBRE.passes++;}};
})();
window.dbgMobaOmbre=function(on){
  if(on!=null){MOBA_OMBRE.on=!!on;if(MOBA_OMBRE.on&&!MOBA_OMBRE.L.length)MOBA_ombreBatit();}
  return {on:MOBA_OMBRE.on,mandataires:MOBA_OMBRE.L.filter(function(E){return E.mesh;}).map(function(E){
    return {groupe:E.C.name||E.C.type,cote:E.mt.shadowSide,pieces:E.ps.length,tri:E.mesh.geometry.attributes.position.count/3};}),
    replis:MOBA_OMBRE.replis,recuits:MOBA_OMBRE.recuits,passes:MOBA_OMBRE.passes};};
/* L'OMBRE À 15 I/S QUAND LA CADENCE EST CALÉE SUR 30 (2026-10-25, passe perf mobile) — INACTIVE par défaut (`?moba_ombre15=1`) : la
   carte d'ombre n'est refaite qu'une image sur deux quand CAD.on (téléphone) ; l'ombre de la caisse a alors une image de retard une fois
   sur deux. CHANGE l'image : à trancher par Sacha. Voir boucle-1.js (ÉTAGE 1). */
const MOBA_OMBRE15=MOBA_param('ombre15',false);
