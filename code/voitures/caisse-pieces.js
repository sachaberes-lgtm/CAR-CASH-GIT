/* ===== LA CAISSE EN UN MINIMUM DE DESSINS (2026-09-27, passe perf iPhone) =====
   MESURÉ (banc iPhone, caisse de départ LA HONTE) : la caisse du joueur coûtait 80 appels de dessin dans la scène + 70 dans l'ombre,
   150 des ~236 de l'image — des dizaines de boîtes et de cylindres IMMOBILES dans leur groupe, et 4 roues de 8 pièces chacune. Safari
   (ANGLE → Metal) paie chaque appel. À la construction, on SOUDE donc ce qui ne bouge jamais : même matière, mêmes drapeaux → un dessin.
   · CARROSSERIE : les enfants directs de `carBody` (maillages simples, visibles, sans enfants) sont regroupés par matière + drapeaux
     (ombre, ordre, attributs) ; chaque lot d'au moins deux devient UN maillage (sommets posés dans le repère de la carrosserie).
   · ESSIEUX : les quatre roues tournent du MÊME angle autour de l'axe x (voir carVit) — les deux roues d'un essieu partagent donc une
     rotation autour de leur axe commun (0, y, z) : elles se soudent par matière dans un groupe `ESSIEUX` que la boucle fait tourner.
     `wheels` garde les roues D'ORIGINE, détachées (hors scène, zéro dessin) : leur position, leur rayon, leur largeur et leur rotation
     restent lues comme avant (empreinte au sol, traces de gomme, vitesse de rotation).
   · Restent à part : tout ce qui bouge (ailes, dérive, hélices), les halos, les tuyères, le flou de jante, les flaques, les
     multi-matières (le gâteau du pop-tart) et tout ce qui est masqué à la construction.
   `CAR_PIECES` garde les pièces TELLES QUE CONSTRUITES, avec leur parent d'origine : l'explosion arrache toujours les vraies pièces
   (une roue, un capot, une plaque de rouille), pas un lot soudé. Les matières restent les MÊMES objets : aucun programme nouveau.
   Les géométries soudées sont neuves (libérées à la construction suivante, comme le reste) ; les partagées (SPH9, jetGeo) ne sont que
   LUES. Sommets en float32 posés une fois : l'écart avec la matrice du GPU est sous le micron — aucune différence à l'image. */
const CAR_PIECES=[],ESSIEUX=[],CAISSE_SOUDE={on:true};
const FUS={v:new THREE.Vector3(),n:new THREE.Matrix3(),i:new THREE.Matrix4()};
function fusSoudable(o){ // une pièce qu'on peut souder : maillage simple, visible, sans enfant, une seule matière, rien de particulier
  if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||!o.visible||o.children.length||Array.isArray(o.material)||!o.material)return false;
  const g=o.geometry;if(!g||!g.isBufferGeometry||!g.attributes.position||g.drawRange.count!==Infinity||g.drawRange.start!==0)return false;
  if(g.morphAttributes&&Object.keys(g.morphAttributes).length)return false;
  if(o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender)return false;
  for(const k in g.attributes){const a=g.attributes[k];if(a.isInterleavedBufferAttribute||a.normalized)return false;}
  return true;}
function fusCle(o){ // le lot : même matière, mêmes drapeaux, mêmes attributs
  const g=o.geometry,at=Object.keys(g.attributes).sort().map(k=>k+g.attributes[k].itemSize).join(',');
  return o.material.uuid+'|'+(o.castShadow?1:0)+(o.receiveShadow?1:0)+(o.frustumCulled?1:0)+'|'+o.renderOrder+'|'+(o.userData.lp?1:0)+'|'+at;}
function fusGeo(lot){ // lot : [[géométrie, matrice, pièce]] → une géométrie non indexée, sommets posés, normales tournées
  const g0=lot[0][0],noms=Object.keys(g0.attributes);let n=0;
  for(const e of lot)n+=e[0].index?e[0].index.count:e[0].attributes.position.count;
  const arr={};for(const k of noms)arr[k]=new Float32Array(n*g0.attributes[k].itemSize);
  let o=0;const V=FUS.v,N=FUS.n;
  for(const e of lot){const g=e[0],m=e[1];
    const ix=g.index?g.index.array:null,cnt=ix?ix.length:g.attributes.position.count,flip=m.determinant()<0; // MIROIR (roues de gauche
    N.getNormalMatrix(m);                                                                                      // du kit) : l'ordre des sommets se
    for(const k of noms){const a=g.attributes[k],s=a.itemSize,d9=arr[k];                                    // retourne, comme three le fait pour
      for(let i=0;i<cnt;i++){const r=i%3,j=flip?(r===1?i+1:r===2?i-1:i):i,v=ix?ix[j]:j,d=(o+i)*s;           // un maillage d'échelle négative
        if(k==='position'){V.fromBufferAttribute(a,v).applyMatrix4(m);d9[d]=V.x;d9[d+1]=V.y;d9[d+2]=V.z;}
        else if(k==='normal'){V.fromBufferAttribute(a,v).applyMatrix3(N).normalize();d9[d]=V.x;d9[d+1]=V.y;d9[d+2]=V.z;}
        else{d9[d]=a.getX(v);if(s>1)d9[d+1]=a.getY(v);if(s>2)d9[d+2]=a.getZ(v);if(s>3)d9[d+3]=a.getW(v);}}}
    o+=cnt;}
  const out=new THREE.BufferGeometry();
  for(const k of noms)out.setAttribute(k,new THREE.BufferAttribute(arr[k],g0.attributes[k].itemSize));
  out.computeBoundingSphere();return out;}
function fusMaillage(L){ // un lot → UN maillage, repère identité dans son parent, gelé (il ne bouge jamais dans son groupe)
  const o0=L[0][2],m=new THREE.Mesh(fusGeo(L),o0.material);
  m.castShadow=o0.castShadow;m.receiveShadow=o0.receiveShadow;m.frustumCulled=o0.frustumCulled;m.renderOrder=o0.renderOrder;
  if(o0.userData.lp)m.userData.lp=1;m.userData.soude=L.length;m.matrixAutoUpdate=false;return m;}
function caisseSoude(){
  CAR_PIECES.length=0;ESSIEUX.length=0;
  for(const ch of carGroup.children)if(ch!==carBody)CAR_PIECES.push([ch,carGroup]); // l'ordre d'avant : c'est celui de l'explosion
  for(const ch of carBody.children)CAR_PIECES.push([ch,carBody]);
  if(!CAISSE_SOUDE.on)return; // (banc) `dbgSoude(false)` : la caisse d'avant, pièce par pièce, pour comparer au pixel
  // 1. LA CARROSSERIE
  const lots=new Map();
  for(const ch of carBody.children){if(!fusSoudable(ch))continue;ch.updateMatrix();
    const k=fusCle(ch);let L=lots.get(k);if(!L)lots.set(k,L=[]);L.push([ch.geometry,ch.matrix.clone(),ch]);}
  for(const L of lots.values()){if(L.length<2)continue;for(const e of L)carBody.remove(e[2]);carBody.add(fusMaillage(L));}
  // 2. LES ESSIEUX — deux roues au même (y, z), toutes leurs pièces soudables
  const ax=new Map();
  for(const w of (wheels.every(w=>w.parent===carGroup&&w.rotation.x===0)?wheels:[])){
    const k=w.position.y.toFixed(5)+'|'+w.position.z.toFixed(5);let W=ax.get(k);if(!W)ax.set(k,W=[]);W.push(w);}
  for(const W of ax.values()){
    if(W.length<2||W.some(w=>!w.children.length||w.children.some(c=>!fusSoudable(c))))continue;
    const E=new THREE.Group();E.position.set(0,W[0].position.y,W[0].position.z);E.updateMatrix();FUS.i.copy(E.matrix).invert();
    const L2=new Map();
    for(const w of W){w.updateMatrix();for(const c of w.children){c.updateMatrix();
      const m=new THREE.Matrix4().multiplyMatrices(FUS.i,w.matrix).multiply(c.matrix),k=fusCle(c);
      let L=L2.get(k);if(!L)L2.set(k,L=[]);L.push([c.geometry,m,c]);}}
    for(const L of L2.values())E.add(fusMaillage(L)); // (une pièce seule y passe aussi : elle doit tourner avec l'essieu)
    E.userData.essieu=1;for(const w of W)carGroup.remove(w);carGroup.add(E);ESSIEUX.push(E);
  }
  // 3. LES AILES ET LA DÉRIVE : elles bougent EN BLOC (le pivot s'ouvre, se tourne, s'étire) — dedans, rien ne bouge. On soude dans
  //    le repère du pivot (plumes : 13 dessins → 2 par aile). Les PALES du requin tournent chacune sur son moyeu, mais les deux pales
  //    d'un même moyeu tournent du même angle (`propSpin`) : elles se soudent en croix, un dessin par hélice (voir carProps).
  const pales=new Set(carProps.map(p=>p.m));
  for(const piv of [carWingL,carWingR].concat(carFins))if(piv)fusGroupe(piv,pales);
  if(carProps.length>1){
    const moy=new Map();
    for(const p of carProps){const o=p.m;if(!o.parent||!fusSoudable(o))continue;
      const k=o.parent.uuid+'|'+o.position.x.toFixed(5)+'|'+o.position.y.toFixed(5)+'|'+o.position.z.toFixed(5)+'|'+fusCle(o);
      let L=moy.get(k);if(!L)moy.set(k,L=[]);L.push(p);}
    for(const L of moy.values()){if(L.length<2)continue;
      const o0=L[0].m,par=o0.parent;o0.updateMatrix();FUS.i.copy(o0.matrix).invert();
      const lot=L.map(p=>{p.m.updateMatrix();return [p.m.geometry,new THREE.Matrix4().multiplyMatrices(FUS.i,p.m.matrix),p.m];});
      const m=fusMaillage(lot);m.matrixAutoUpdate=true;m.position.copy(o0.position);m.quaternion.copy(o0.quaternion);m.scale.copy(o0.scale);
      for(const p of L)par.remove(p.m);par.add(m);
      const b0=L[0].b;for(let i=carProps.length-1;i>=0;i--)if(L.indexOf(carProps[i])>=0)carProps.splice(i,1);
      carProps.push({m:m,b:b0});}
  }
}
function fusGroupe(root,exclus){ // soude par matière les pièces d'un groupe, dans SON repère (sous-groupes immobiles compris)
  const lots=new Map(),vus=[];
  const va=(nd,M)=>{for(const c of nd.children){if(exclus.has(c))continue;
    if(c.userData.bouge){if(c.isGroup)fusGroupe(c,exclus);continue;} /* (2026-10-16, LES AILES VIVANTES) CE QUI BOUGE garde ses pièces : un groupe animé (ailes en X, bras du dragon…) se soude dans SON repère, une pièce animée reste seule — avant, ses pièces partaient dans le pivot et le geste animait un groupe vide */
    c.updateMatrix();const m=new THREE.Matrix4().multiplyMatrices(M,c.matrix);
    if(c.isMesh){if(!fusSoudable(c))continue;const k=fusCle(c);let L=lots.get(k);if(!L)lots.set(k,L=[]);L.push([c.geometry,m,c]);}
    else if(c.isGroup&&c.visible&&c.type==='Group'){vus.push(c);va(c,m);}}};
  va(root,new THREE.Matrix4());
  for(const L of lots.values()){if(L.length<2)continue;for(const e of L)e[2].parent.remove(e[2]);root.add(fusMaillage(L));}
  for(let i=vus.length-1;i>=0;i--){const g=vus[i];if(!g.children.length&&g.parent)g.parent.remove(g);} // les sous-groupes vidés s'en vont
}
// l'explosion : la pose MONDE d'une pièce d'origine, qu'elle soit encore en place ou soudée (détachée : son parent d'origine fait foi)
const CPOSE_M=new THREE.Matrix4(),CPOSE_S=new THREE.Vector3();
function caissePose(pc,p,q){const o=pc[0];
  if(o.parent){o.getWorldPosition(p);o.getWorldQuaternion(q);return;}
  pc[1].updateWorldMatrix(true,false);o.updateMatrix();CPOSE_M.multiplyMatrices(pc[1].matrixWorld,o.matrix).decompose(p,q,CPOSE_S);}
/* LES CLASSIQUES DE LA BOUTIQUE EN POLY (2026-09-29, Sacha : « enlève toutes les parties arrondies dans les voitures du shop, ça ne
   colle pas avec la DA poly »). Les six légendaires de la gamme des 50 sont déjà modelées au kit low-poly (facettes planes) ; les
   SEPT classiques vendues à côté (chat pop-tart, requin, comète, formule or, le mans 24, el patron, acide) sortaient du vieux kit :
   boules lisses de 16 × 12, cylindres de 12 à 16 côtés, loft du requin en 52 × 24, tout en normales lissées — des caisses en
   plastique moulé au milieu d'une gamme taillée au couteau.
   `facetteCaisse()` repasse sur la caisse montée, JUSTE AVANT qu'elle rejoigne la carrosserie (roues, aile, propulseurs compris) :
   chaque pièce ronde est refaite avec PEU de segments (boule 8 × 6, cylindre et cône ≤ 8 côtés, tore 4 × 10), et TOUTES ses faces
   reçoivent une normale PLATE (géométrie non indexée + normales recalculées) — la lumière tombe par facettes, comme sur la gamme.
   ⚠ Aucune matière n'est touchée (le `flatShading` d'une matière est un #define : un programme de plus à compiler en pleine partie) :
   seules les géométries changent. Les pièces déjà plates (boîtes, plans), le kit low-poly (`lp`), ce qui épouse le sol (`sol`) et les
   plumes de réacteur (jetGeo) ne bougent pas. Hook : `dbgFacette(false)` rend les caisses d'avant (comparaison au banc). */
const FACET_SHAPES={poptart:1,requin:1,proto:1,tuner:1};
const FACETTE={on:true};
function geoFacette(g){ // la même pièce, taillée : peu de segments, une normale par face — null = déjà plate, on n'y touche pas
  const P=g.parameters||{};let n;
  switch(g.type){
    case 'BoxGeometry':case 'BoxBufferGeometry':case 'PlaneGeometry':case 'PlaneBufferGeometry':return null;
    case 'SphereGeometry':case 'SphereBufferGeometry':
      n=new THREE.SphereGeometry(P.radius,Math.min(8,P.widthSegments),Math.min(6,P.heightSegments),P.phiStart,P.phiLength,P.thetaStart,P.thetaLength);break;
    case 'CylinderGeometry':case 'CylinderBufferGeometry':
      n=new THREE.CylinderGeometry(P.radiusTop,P.radiusBottom,P.height,Math.max(3,Math.min(8,P.radialSegments)),1,P.openEnded,P.thetaStart,P.thetaLength);break;
    case 'ConeGeometry':case 'ConeBufferGeometry':
      n=new THREE.ConeGeometry(P.radius,P.height,Math.max(3,Math.min(8,P.radialSegments)),1,P.openEnded,P.thetaStart,P.thetaLength);break;
    case 'TorusGeometry':case 'TorusBufferGeometry':
      n=new THREE.TorusGeometry(P.radius,P.tube,Math.min(4,P.radialSegments),Math.min(10,P.tubularSegments),P.arc);break;
    case 'CircleGeometry':case 'CircleBufferGeometry':
      n=new THREE.CircleGeometry(P.radius,Math.max(3,Math.min(8,P.segments)),P.thetaStart,P.thetaLength);break;
    case 'LatheGeometry':case 'LatheBufferGeometry':
      n=new THREE.LatheGeometry(P.points,Math.max(3,Math.min(8,P.segments)),P.phiStart,P.phiLength);break;
    default:n=g.clone(); // extrusions (carProfile), lofts : la forme reste, le LISSAGE s'en va
  }
  const f=n.index?n.toNonIndexed():n;if(f!==n)n.dispose();
  f.computeVertexNormals(); // sans index, chaque triangle a ses trois sommets : la normale calculée est celle de la FACE
  return f;
}
function facetteCaisse(){
  const neuf=new Map(),vieux=new Set();
  carGroup.traverse(function(o){
    if(!o.isMesh||(o.userData&&(o.userData.lp||o.userData.sol)))return;
    const g=o.geometry,m=o.material;
    if(!g||g===jetGeo||m===jetShellM||m===jetCoreM||m===jetGlowM)return;
    let f=neuf.get(g);if(f===undefined){f=geoFacette(g);neuf.set(g,f);}
    if(f){o.geometry=f;if(g!==SPH9)vieux.add(g);}
  });
  for(const g of vieux)g.dispose(); // créées pour cette caisse et jamais dessinées : on les rend tout de suite
}
window.dbgFacette=function(on){if(on!=null){FACETTE.on=!!on;try{buildCar(CARS[level]);}catch(e){return e.message;}}return FACETTE.on;};
