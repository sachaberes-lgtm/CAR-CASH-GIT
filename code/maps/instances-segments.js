/* ===== LES INSTANCES EN SEGMENTS (2026-11-07, passe perf 3, P3 : « le niveau en tranches ») =====
   MESURÉ (p2 émulé, `dbgChamp`, instant fixe) : un décor posé en UNE InstancedMesh sur toute la piste porte `frustumCulled=false` (three r128 ne sait pas
   calculer la sphère d'un InstancedMesh : celle de la géométrie de base ne dit rien de ses instances) — il est donc redessiné ENTIER à chaque image, derrière
   la caméra comprise : le canyon dessinait 164 000 triangles de peupliers et de cheminées pour 8 000 dans le champ (5 %).
   `instSegmente(im, o)` coupe une InstancedMesh STATIQUE en une InstancedMesh par cellule de ~400 m (grille 3D sur la position des instances) : même
   matière (même programme), mêmes instances (copie exacte des matrices et des couleurs), géométrie PROXY qui partage les tampons de la base mais porte
   SA sphère englobante (centres des instances + rayon de la géométrie × échelle + marge) : le tri par le champ de vision de three joue. Aucun pixel ne change :
   une cellule n'est jetée que si sa sphère (conservatrice) est entièrement hors du tronc de vue.
   `o` : {cell:400, marge:20}. Rend la liste des maillages à ajouter À LA PLACE de `im` (ou [im] tel quel : `?tranches=0`, une seule instance, ou instances animées).
   ⚠ À n'employer que sur des instances qui NE BOUGENT PAS (pas de `count` piloté, pas de matrices réécrites par image) et opaques (le tri des transparents
   se fait par objet). `dbgSegments(false)` = la sphère coupée (tout dessiné comme avant) pour comparer l'image dans la même tâche ; `dbgSegments()` = l'état. */
const SEG_ON=!/[?&]tranches=0\b/.test(location.search),SEG_L=[],SEG_CELL=+((/[?&]segcell=(\d+)/.exec(location.search)||[])[1])||0; /* `?segcell=800` : la taille des cellules (banc) */
function instSegmente(im,o){
  o=o||{};const cell=SEG_CELL||o.cell||400,marge=o.marge==null?20:o.marge,n=im.count,geo=im.geometry,A=im.instanceMatrix.array;
  if(!SEG_ON||n<2||!geo||!geo.attributes.position||im.isSkinnedMesh)return [im];
  if(!geo.boundingSphere)geo.computeBoundingSphere();
  const gc=geo.boundingSphere.center,gr=geo.boundingSphere.radius,M=new THREE.Matrix4(),v=new THREE.Vector3(),cel=new Map();
  for(let i=0;i<n;i++){M.fromArray(A,i*16);const x=A[i*16+12],y=A[i*16+13],z=A[i*16+14],k=Math.floor(x/cell)+','+Math.floor(y/cell)+','+Math.floor(z/cell);
    let L=cel.get(k);if(!L)cel.set(k,L=[]);L.push(i);}
  if(cel.size<2)return [im];
  const out=[],col=im.instanceColor?im.instanceColor.array:null;
  for(const L of cel.values()){
    const m=L.length,C=new Float32Array(m*3),R=new Float32Array(m);let cx=0,cy=0,cz=0;
    for(let j=0;j<m;j++){M.fromArray(A,L[j]*16);v.copy(gc).applyMatrix4(M);C[j*3]=v.x;C[j*3+1]=v.y;C[j*3+2]=v.z;R[j]=gr*M.getMaxScaleOnAxis();cx+=v.x;cy+=v.y;cz+=v.z;}
    cx/=m;cy/=m;cz/=m;let rad=0;for(let j=0;j<m;j++)rad=Math.max(rad,Math.hypot(C[j*3]-cx,C[j*3+1]-cy,C[j*3+2]-cz)+R[j]);
    const g=new THREE.BufferGeometry();for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);if(geo.index)g.setIndex(geo.index);
    g.groups=geo.groups.slice();g.drawRange.start=geo.drawRange.start;g.drawRange.count=geo.drawRange.count;
    g.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,cy,cz),rad+marge);g.userData.segment=1;
    const s=new THREE.InstancedMesh(g,im.material,m);
    for(let j=0;j<m;j++)s.instanceMatrix.array.set(A.subarray(L[j]*16,L[j]*16+16),j*16);
    if(col){s.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(m*3),3);for(let j=0;j<m;j++)s.instanceColor.array.set(col.subarray(L[j]*3,L[j]*3+3),j*3);}
    s.instanceMatrix.needsUpdate=true;
    s.name=im.name;s.renderOrder=im.renderOrder;s.castShadow=im.castShadow;s.receiveShadow=im.receiveShadow;s.visible=im.visible;s.userData=Object.assign({},im.userData,{segment:1});
    s.matrixAutoUpdate=im.matrixAutoUpdate;s.matrix.copy(im.matrix);s.frustumCulled=true;
    out.push(s);SEG_L.push(s);}
  im.dispose();return out;}
window.dbgSegments=function(on){if(on!=null)for(let i=SEG_L.length-1;i>=0;i--){const s=SEG_L[i];if(!s.parent&&!s.geometry){SEG_L.splice(i,1);continue;}s.frustumCulled=!!on;}
  let n=0,t=0;for(const s of SEG_L)if(s.parent){n++;t+=s.count;}return {segments:n,instances:t,coupe:SEG_L.length?SEG_L[0].frustumCulled:null,on:SEG_ON};};
