/* ===== CE QUE LA BRUME A MANGÉ N'EST PLUS ENVOYÉ (2026-11-19, astuces-chauffe — Sacha : « fais tout ce qu'il a dit […] Tant que ça ne dommage pas le jeu sérieusement ») =====
   MESURÉ (outils/banc-astuces/loin.cjs, édition téléphone, en course) : chaque map envoie encore à la puce des objets plus loin que sa brume (canyon : la façade
   du tunnel à 7,5-9,4 km, le bouchon, la route maigre jusqu'à 10 km, pour une brume qui finit à 6,5 km ; jade, grotte : des quartiers et des rochers au-delà
   d'une brume de 0,9-1,2 km). Au-delà de `fog.far`, la brume linéaire de three vaut 1 : un tel objet est peint de la couleur EXACTE de la brume, rien d'autre.
   Au TÉLÉPHONE (`ALLEGE`), pendant le rendu de la caméra du jeu, un objet dont la matière suit la brume (`material.fog`) et dont le point le plus proche est
   au-delà de `fog.far × BRUME.k` n'est plus envoyé (le tri du champ de vision de three le jette, comme un objet hors du champ). Ce qui ne suit pas la brume
   (ciel, étoiles, néons sans brume) ne bouge pas. Ce qui peut se voir : une silhouette couleur de brume sur un ciel d'une autre teinte, au fond.
   `?sans=brume` = comme avant ; `?brume=0.8` = coupe dès 80 % de la brume (banc) ; `dbgBrume(on, k)` = bascule en direct, rend le nombre d'objets jetés. */
const BRUME={on:ALLEGE&&!/[?&]sans=[^&]*\bbrume\b/.test(location.search),k:+((/[?&]brume=([\d.]+)/.exec(location.search)||[])[1])||1,cam:null,lim:0,
  P:new THREE.Vector3(),S:new THREE.Sphere(),n:0};
{const io=THREE.Frustum.prototype.intersectsObject;
  THREE.Frustum.prototype.intersectsObject=function(o){
    if(!io.call(this,o))return false;
    if(BRUME.cam===null)return true;
    const m=o.material;if(!m||m.fog!==true)return true; /* un tableau de matières : `fog` indéfini, gardé */
    BRUME.S.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); /* io vient de la calculer si elle manquait */
    if(BRUME.P.distanceTo(BRUME.S.center)-BRUME.S.radius>BRUME.lim){BRUME.n++;return false;}
    return true;};}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);
  BRUME.cam=null;if(BRUME.on&&cam===camera&&scene.fog&&scene.fog.isFog){BRUME.n=0;BRUME.P.setFromMatrixPosition(cam.matrixWorld);BRUME.lim=scene.fog.far*BRUME.k;BRUME.cam=cam;}};} /* CHAÎNÉ, en dernier : rien ne rend plus après */
{const oa9=scene.onAfterRender;scene.onAfterRender=function(r9,s9,cam){BRUME.cam=null;oa9.call(this,r9,s9,cam);};}
window.dbgBrume=function(on,k){if(on!=null&&ALLEGE)BRUME.on=!!on;if(k!=null)BRUME.k=+k||1;return {on:BRUME.on,k:BRUME.k,jetes:BRUME.n,lim:Math.round(BRUME.lim)};};
