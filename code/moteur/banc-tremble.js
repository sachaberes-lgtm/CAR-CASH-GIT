/* ===== LE BANC DU TREMBLEMENT (2026-11-16, Sacha : « la voiture tremble beaucoup quand on roule… règle ça pour de bon ») =====
   `dbgTremble()` : ce que l'œil voit de la caisse à cette image — sa place à l'écran (NDC), son assiette VUE PAR LA CAMÉRA (lacet, tangage,
   roulis en degrés), un point de la route 40 m devant (le monde à l'écran), le champ, et les ressorts qui la posent (volant, lacet, roulis,
   tangage, débattement, chasse, penche de l'horizon). Le banc outils/banc-camera/tremble.cjs l'appelle après chaque image (dbgStep) et
   mesure la part HAUTE FRÉQUENCE de chaque série : ce qui tremble se voit là, ce qui ondule lentement n'y est pas. Rien ne tourne sans appel. */
const BTR={q:new THREE.Quaternion(),qc:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YXZ'),v:new THREE.Vector3(),F:{p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}};
/* LE POUCE SIMULÉ (banc) : le braquage voulu par le pilote de mesure redevient une place de pouce en pixels (la courbe du volant à l'envers,
   46 px = plein braquage), qui grésille de ±`doigt` px (un vrai capteur tactile : ±1-2 px), puis repasse par le vrai calcul du volant
   (volDoigt, mobile-tactile.js) — zone morte comprise. Le lissage du jeu est celui du pouce (TCTL.doigt). */
function btrDoigt(t){if(DBG_AUTO.fixe!=null)t=DBG_AUTO.fixe;const a=Math.pow(Math.min(1,Math.abs(t)),1/1.15)*(t<0?1:-1),px=a*46+(Math.random()+Math.random()+Math.random()-1.5)*1.15*DBG_AUTO.doigt;
  TCTL.doigt=true;return volDoigt(px/46);}
window.dbgTremble=function(o){try{
  if(o&&o.doigt!=null){DBG_AUTO.doigt=+o.doigt||0;DBG_AUTO.fixe=o.fixe==null?null:+o.fixe;if(!DBG_AUTO.doigt)TCTL.doigt=false;return {doigt:DBG_AUTO.doigt};}
  if(o&&o.tier!=null){engTier=Math.max(0,Math.min(ENGINE_TIERS.length-1,o.tier|0));coinsGot=ENGINE_TIERS[engTier].coins|0;return {tier:engTier};} /* (banc) le palier moteur de la partie : la vitesse des fins de course */
  const r=x=>Math.round(x*1e4)/1e4;camera.updateMatrixWorld();carGroup.updateMatrixWorld(true);
  const c=BTR.v.copy(carGroup.position).project(camera),cx=c.x,cy=c.y;
  carBody.getWorldQuaternion(BTR.q);BTR.qc.copy(camera.quaternion).invert().multiply(BTR.q);BTR.e.setFromQuaternion(BTR.qc,'YXZ');
  frameAt(THREE.MathUtils.clamp(s+driveDir*40,0,L-.01),BTR.F);const w=BTR.v.copy(BTR.F.p).project(camera);
  return {mode:mode,s:r(s),lat:r(lat),kmh:Math.round(Math.abs(vA)*3.6*SPD),cx:r(cx),cy:r(cy),wx:r(w.x),wy:r(w.y),
    lac:r(BTR.e.y*57.2958),tan:r(BTR.e.x*57.2958),rou:r(BTR.e.z*57.2958),fov:r(camera.fov),
    steer:r(steer),yawR:r(yawR),psi:r(psi),roll:r(carRoll9*57.2958),pitch:r(pitch9*57.2958),scoup:r(SCOUP.p*57.2958),sus:r(susY*100),drift:r(driftYaw*57.2958),lean:r(camLean*57.2958),phi:r(CAM_ROUTE.phi*57.2958),
    cam:[r(camera.position.x),r(camera.position.y),r(camera.position.z)],car:[r(carGroup.position.x),r(carGroup.position.y),r(carGroup.position.z)],nitro:!!nitroOn,cyaw:(function(){frameAt(s,BTR.F);if(side<0){BTR.F.n.multiplyScalar(-1);BTR.F.b.multiplyScalar(-1);}const d=BTR.v.set(0,0,-1).applyQuaternion(camera.quaternion);return r(Math.atan2(d.dot(BTR.F.b),d.dot(BTR.F.t))*57.2958);})(),kyaw:(function(){const d=BTR.v.set(0,0,1).applyQuaternion(carGroup.quaternion);return r(Math.atan2(d.dot(BTR.F.b),d.dot(BTR.F.t))*57.2958);})(),off:(function(){const o=BTR.v.subVectors(camera.position,carGroup.position);return [r(o.dot(BTR.F.t)),r(o.dot(BTR.F.b)),r(o.dot(BTR.F.n))];})(),vis:loop._vise?[r(loop._vise.dot(BTR.F.t)),r(loop._vise.dot(BTR.F.b)),r(loop._vise.dot(BTR.F.n))]:null,camLat:r(loop._camLat||0),fr:loop._fr|0};
}catch(e){return {err:String(e)};}};
