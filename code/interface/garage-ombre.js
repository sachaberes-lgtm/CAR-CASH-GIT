/* ===== L'OMBRE DE LA CAISSE QUI SAUTE (2026-10-23, Léo : « il y a une ombre plate qui suit la voiture pendant que ça saute, ce qui n'est pas réaliste ») =====
   Au GARAGE, l'ombre de contact (`contactShadow`, rendu/triptyque-bloom.js) était posée SOUS la caisse (sa position + sa normale) : pendant une
   figure elle montait avec elle, à plat, et basculait avec son assiette — une feuille noire collée au ventre (MESURÉ au banc : elle suivait
   l'origine de la caisse à 1,8 m, même taille, même noirceur). En BOUTIQUE, `GBQ.omb` restait au sol, mais aussi noire et aussi large à 1,7 m
   de haut. Désormais l'empreinte reste SUR LE PLATEAU, sous le centre de la caisse, tournée au CAP (jamais à l'assiette), et elle suit la HAUTEUR
   du point le plus bas : plus la caisse monte, plus l'ombre s'étale et s'éclaircit ; son emprise est celle de la boîte de la caisse vue d'en haut
   (un salto la raccourcit, un tonneau l'étrécit) ; les quatre appuis des roues disparaissent dès qu'elles décollent (texture « air »). Au
   repos, rien ne change : c'est exactement l'ancienne ombre. `figOmbre()` tourne à chaque image du garage (garFigTick), après la pose de la
   caisse ; `figOmbre.O` garde le résultat (lu par updateContactShadow). Banc : `dbgFigOmbre()`. */
function figBoite(){ // la boîte des pièces pleines de la caisse (repère caisse), relevée UNE fois par caisse (`userData.gen`, posé par buildCar)
  const g=carGroup.userData.gen||0,B=figBoite._b||(figBoite._b={g:-1,t:0,ok:false,min:new THREE.Vector3(),max:new THREE.Vector3()});
  if(B.g===g&&(B.ok||performance.now()-B.t<400))return B.ok?B:null; // une caisse encore vide : on ne réessaie pas à chaque image
  B.g=g;B.t=performance.now();B.ok=false;
  const inv=figBoite._i||(figBoite._i=new THREE.Matrix4()),M=figBoite._m||(figBoite._m=new THREE.Matrix4()),bb=figBoite._bb||(figBoite._bb=new THREE.Box3()),b9=figBoite._b9||(figBoite._b9=new THREE.Box3());
  carGroup.updateMatrixWorld(true);inv.copy(carGroup.matrixWorld).invert();bb.makeEmpty();
  carGroup.traverse(function(o){if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const mt=Array.isArray(o.material)?o.material[0]:o.material;
    if((mt&&(mt.transparent||mt.blending===THREE.AdditiveBlending))||(o.userData&&o.userData.sol))return; // ni halos, ni flaques, ni flammes : la tôle et les roues
    for(let q=o;q&&q!==carGroup;q=q.parent)if(!q.visible)return;
    if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();M.multiplyMatrices(inv,o.matrixWorld);b9.copy(o.geometry.boundingBox).applyMatrix4(M);bb.union(b9);});
  if(bb.isEmpty())return null;
  B.min.copy(bb.min);B.max.copy(bb.max);B.ok=true;return B;}
function figOmbre(){ // chaque image du garage, après la pose de la caisse : où est son empreinte sur le plateau, et à quelle hauteur elle flotte
  const O=figOmbre.O||(figOmbre.O={on:false,t:0,x:0,z:0,h:0,hAir:0,kx:1,kz:1,psi:0,solY:0,v:new THREE.Vector3(),a:new THREE.Vector3(),b:new THREE.Vector3(),c:new THREE.Vector3()});
  O.on=false;if(!garageOn||!carGroup||!carGroup.visible)return O;
  const B=figBoite();if(!B)return O;
  const q=carGroup.quaternion,s=carGroup.scale,p=carGroup.position,ax=O.a.set(1,0,0).applyQuaternion(q),ay=O.b.set(0,1,0).applyQuaternion(q),az=O.c.set(0,0,1).applyQuaternion(q), /* x = sa gauche · y = son toit · z = son nez */
    hx=(B.max.x-B.min.x)*.5*Math.abs(s.x),hy=(B.max.y-B.min.y)*.5*Math.abs(s.y),hz=(B.max.z-B.min.z)*.5*Math.abs(s.z),
    v=O.v.set((B.min.x+B.max.x)*.5*s.x,(B.min.y+B.max.y)*.5*s.y,(B.min.z+B.max.z)*.5*s.z).applyQuaternion(q), /* le centre de la boîte, dans la salle */
    cx=p.x+v.x,cy=p.y+v.y,cz=p.z+v.z,
    bas=cy-(hx*Math.abs(ax.y)+hy*Math.abs(ay.y)+hz*Math.abs(az.y)), /* son point le plus bas (fonction d'appui de la boîte) */
    sol0=GARAGE_Y+GAR.POD+B.min.y*Math.abs(s.y); /* le dessous de la caisse AU REPOS, sur le plateau */
  O.solY=GARAGE_Y+GAR.POD;O.hBas=bas-sol0;O.h=Math.max(0,cy-(sol0+hy)); /* la hauteur de son CENTRE au-dessus de sa place de repos : en plein salto le point le plus bas dépasse sous le plateau, l'ombre, elle, doit rester au sol et s'éclaircir avec l'altitude */
  const fh=Math.hypot(az.x,az.z),lh=Math.hypot(ax.x,ax.z);O.psi=fh>=lh?Math.atan2(az.x,az.z):Math.atan2(-ax.z,ax.x); /* le cap : l'axe du nez, ou celui du côté quand le nez pointe en l'air (l'empreinte est la même à 180° près) */
  const sn=Math.sin(O.psi),cs=Math.cos(O.psi), /* le nez (sn,cs) et le côté (cs,−sn), sur le plateau */
    ex=hx*Math.abs(ax.x*cs-ax.z*sn)+hy*Math.abs(ay.x*cs-ay.z*sn)+hz*Math.abs(az.x*cs-az.z*sn), /* la demi-largeur de la boîte vue d'en haut… */
    ez=hx*Math.abs(ax.x*sn+ax.z*cs)+hy*Math.abs(ay.x*sn+ay.z*cs)+hz*Math.abs(az.x*sn+az.z*cs); /* …et sa demi-longueur */
  O.kx=THREE.MathUtils.clamp(ex/Math.max(.1,hx),.35,1.25);O.kz=THREE.MathUtils.clamp(ez/Math.max(.1,hz),.35,1.25);
  O.x=cx;O.z=cz;O.t=performance.now();O.on=true;
  if(typeof GBQ!=='undefined'&&GBQ.on&&GBQ.omb&&GBQ.grp&&GBQ.grp.visible){ // BOUTIQUE : le disque d'ombre au sol (GBQ.omb) suit la hauteur de ce qui monte AU-DESSUS de sa lévitation (la sienne, c'est `fl`, voir garBqIndus)
    const o=GBQ.omb,air=Math.max(0,O.h-((GBQ.lev||0)+(GBQ.levB||0)+(GBQ.leve||0)));O.hAir=air;
    if(air>.02){const fl=Math.max(0,Math.min(1,(GBQ.lev||0)/.95)),th=GBQ.grp.rotation.y,dx=cx-GBQ.grp.position.x,dz=cz-GBQ.grp.position.z,sc=(4.2-.9*fl)*Math.sqrt(O.kx*O.kz)*(1+.1*Math.min(air,2));
      o.position.x=dx*Math.cos(th)-dz*Math.sin(th);o.position.z=dx*Math.sin(th)+dz*Math.cos(th);o.scale.set(sc,sc,1);o.material.opacity=(.42-.12*fl)/(1+1.5*air);}
    else{o.position.x=0;o.position.z=0;}}
  else O.hAir=O.h;
  return O;}
window.dbgFigOmbre=function(){const O=figOmbre.O;return O&&{on:O.on,h:+O.h.toFixed(3),bas:+O.hBas.toFixed(3),hAir:+O.hAir.toFixed(3),kx:+O.kx.toFixed(2),kz:+O.kz.toFixed(2),psi:+O.psi.toFixed(2),x:+O.x.toFixed(2),z:+O.z.toFixed(2),solY:+O.solY.toFixed(3)};}; // (banc) où l'ombre de la caisse se pose
