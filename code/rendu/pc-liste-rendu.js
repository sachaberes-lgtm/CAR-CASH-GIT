/* ===== LES DESSINS VIDES SORTENT DE LA LISTE DE RENDU (2026-10-24, passe perf PC : « le coût processeur du rendu three.js en course, à image identique ») =====
   Trace du chef (Mac M4, course aux nuages, 784 images, 16,7 s) : `renderBufferDirect` 1 956 ms, dont `setProgram` 1 005 (uniformes envoyés
   506) et `bindingStates.setup` 476 — le « setup » de la trace, c'est la liaison des TAMPONS, pas les lumières (`setupLights` : 22 ms ; toute la
   passe d'ombre : 171 ms). Or three r128 fait tout ce travail AVANT de savoir qu'il n'y a rien à dessiner :
   · une InstancedMesh à 0 instance : programme, uniformes, tampons re-liés (forcés pour toute InstancedMesh), puis `renderInstances` sort sur 0
     — sans même compter l'appel dans renderer.info (les ~150 appels de `dbgCout()` ne les montrent pas) ;
   · une géométrie à 0 sommet, un drawRange ou un groupe vide : même chose, `renderBufferDirect` sort APRÈS `setProgram` ;
   · un objet transparent à opacité 0 (les fondus), matière de série, mélange normal ou additif, sans écriture de profondeur ni de stencil :
     alpha 0 → le pixel reste ce qu'il était, au bit près — et seulement une matière déjà dessinée VISIBLE une fois (un fondu à 0 peut servir de
     chauffe : le premier vrai dessin fabrique l'état de pipeline de la puce, on ne le déplace pas).
   Déjà vu aux Pics de Jade : 92 des 316 appels d'une image étaient des peaux de nuages à zéro instance (corrigé à la main dans `cotonTick`).
   Ici, POUR TOUTES LES MAPS : juste après la projection (`finish` de la liste de rendu, avant le tri), ces éléments sont retirés de la liste —
   ni programme, ni uniformes, ni tampons, ni tri. MÊME IMAGE : ce qui sort ne dessinait aucun pixel ; l'ordre du reste est inchangé.
   Gardes : un objet qui porte un rappel (onBeforeRender/onAfterRender) reste ; une matière pas encore compilée, ou à recompiler, reste (la
   compilation n'est jamais déplacée) ; sous `overrideMaterial`, seuls les vides de géométrie sortent. La passe d'ombre a son propre parcours :
   inchangée. ORDI seulement (TEL_NATIF : le téléphone ne change pas ; `?pcthree=1` pour l'y essayer) ; `?pcthree=0` = avant.
   Banc : `dbgPctListe()` = ce qui est sorti de la liste de la scène à la dernière image (et des exemples) ; `dbgPctListe(0|1)` coupe/remet à chaud. */
const PCT_ON=/[?&]pcthree=1\b/.test(location.search)||(!TEL_NATIF&&!/[?&]pcthree=0\b/.test(location.search));
const PCT={on:PCT_ON,n:[0,0,0,0],op:0,tr:0,ex:null,vus:new WeakSet(),
  mats:new Set(['MeshBasicMaterial','MeshLambertMaterial','MeshPhongMaterial','MeshStandardMaterial','MeshToonMaterial','MeshMatcapMaterial','PointsMaterial','SpriteMaterial','LineBasicMaterial']),
  obr:THREE.Object3D.prototype.onBeforeRender,oar:THREE.Object3D.prototype.onAfterRender,obc:THREE.Material.prototype.onBeforeCompile};
function pctVide(it,ov,tr){ /* 0 = se dessine · 1 = zéro instance · 2 = zéro sommet à tracer · 3 = transparent à opacité 0 */
  const o=it.object,g=it.geometry;if(!g)return 0;let k=0;
  if(o.isInstancedMesh===true&&o.count===0)k=1;
  else if(g.isInstancedBufferGeometry===true&&g.instanceCount===0)k=1;
  else{const ix=g.index,po=g.attributes.position,c=ix!==null?ix.count:(po!==undefined?po.count:0),gr=it.group,dr=g.drawRange;
    if((ov||it.material).wireframe!==true){const a=Math.max(dr.start,gr!==null?gr.start:0),b=Math.min(c,dr.start+dr.count,gr!==null?gr.start+gr.count:Infinity);if(b<=a)k=2;} /* le calcul de renderBufferDirect : drawCount = 0 */
    if(k===0&&tr&&ov===null){const m=it.material;
      if(m.opacity===0&&m.transparent===true&&m.depthWrite===false&&m.stencilWrite!==true&&(m.blending===THREE.NormalBlending||m.blending===THREE.AdditiveBlending)&&m.onBeforeCompile===PCT.obc&&PCT.mats.has(m.type)&&PCT.vus.has(m))k=3;}} /* vus : déjà dessinée visible une fois (l'état de pipeline de la puce existe, voir cielChauffe) */
  if(k===0||o.onBeforeRender!==PCT.obr||o.onAfterRender!==PCT.oar)return 0;
  const m=ov||it.material,p=renderer.properties.get(m);if(p.currentProgram===undefined||p.__version!==m.version)return 0;
  return k;}
function pctFiltre(A,ov,tr,pr){let j=0;
  for(let i=0;i<A.length;i++){const it=A[i],k=PCT.on?pctVide(it,ov,tr):0;
    if(k!==0){if(pr){PCT.n[k]++;if(PCT.ex&&PCT.ex.length<16)PCT.ex.push(k+' '+(it.object.name||it.object.type)+' · '+it.material.type+(it.material.name?':'+it.material.name:''));}continue;}
    if(tr&&it.material.opacity!==0)PCT.vus.add(it.material);if(j!==i)A[j]=it;j++;}
  A.length=j;}
function pctTasse(L,sc){const ov=sc.overrideMaterial||null,pr=sc===scene;if(pr){PCT.n[1]=PCT.n[2]=PCT.n[3]=0;}
  pctFiltre(L.opaque,ov,false,pr);pctFiltre(L.transparent,ov,true,pr);if(pr){PCT.op=L.opaque.length;PCT.tr=L.transparent.length;}}
if(PCT_ON&&renderer.renderLists&&typeof renderer.renderLists.get==='function'){const get0=renderer.renderLists.get;
  renderer.renderLists.get=function(sc,d){const L=get0.call(this,sc,d); /* une liste par scène et par profondeur d'appel : on la garnit une fois */
    if(L&&!L.pctOk&&typeof L.finish==='function'&&L.opaque&&L.transparent){L.pctOk=true;const fin0=L.finish;L.finish=function(){fin0.call(L);pctTasse(L,sc);};}
    return L;};}
window.dbgPctListe=function(on){if(on!=null)PCT.on=!!on&&PCT_ON;const r={actif:PCT.on,installe:PCT_ON,zeroInstance:PCT.n[1],zeroSommet:PCT.n[2],transparentZero:PCT.n[3],
  restent:{opaques:PCT.op,transparents:PCT.tr},exemples:PCT.ex};PCT.ex=[];return r;};
