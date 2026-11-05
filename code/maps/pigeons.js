// ---------- PIGEONS RAMIERS : rares traversées d'oiseaux — un peu de vie dans le ciel ----------
const PIGEONS=[];let pigeonT=12+Math.random()*14;
/* (2026-11-03, maps cohérentes) UN PIGEON = TROIS APPELS DE DESSIN (dix avant : corps, poitrail, tête, deux taches, queue, deux ailes, deux barres) et
   UN programme (trois avant : Lambert recto, Lambert recto-verso, Basic). Les morceaux qui bougent ensemble sont FUSIONNÉS une fois pour toutes,
   chacun avec SA couleur (couleur par sommet) : le corps entier d'un côté, chaque aile avec sa barre blanche de l'autre (elles battent). Mêmes
   formes, mêmes couleurs, mêmes battements ; la barre et les taches du cou prennent maintenant la lumière comme le reste (elles étaient « Basic »). */
const pgM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
function pgFusion(parts){ // [[géométrie, position, rotation x, échelle, couleur], …] → une géométrie non indexée, la couleur dans ses sommets
  const P=[],N=[],C=[],c=new THREE.Color(),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),V=new THREE.Vector3(),S=new THREE.Vector3();
  for(const q of parts){Q.setFromEuler(E.set(q[2]||0,0,0));V.fromArray(q[1]);S.fromArray(q[3]||[1,1,1]);M.compose(V,Q,S);
    const g=q[0].clone().applyMatrix4(M),h=g.index?g.toNonIndexed():g,pa=h.attributes.position.array,na=h.attributes.normal.array;c.setHex(q[4]);
    for(let i=0;i<pa.length;i++){P.push(pa[i]);N.push(na[i]);}for(let i=0;i<pa.length/3;i++)C.push(c.r,c.g,c.b);g.dispose();if(h!==g)h.dispose();}
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(P,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  o.setAttribute('color',new THREE.Float32BufferAttribute(C,3));o.computeBoundingSphere();return o;}
// (2026-09-26, passe fuites) les géométries des pigeons sont PARTAGÉES : chaque oiseau en créait 10 neuves, jamais libérées
const PG_G=(function(){const s=[new THREE.SphereGeometry(.5,9,7),new THREE.SphereGeometry(.24,8,6),new THREE.SphereGeometry(.16,8,6),new THREE.SphereGeometry(.06,6,5),
  new THREE.BoxGeometry(.26,.04,.5),new THREE.PlaneGeometry(1.0,.42),new THREE.PlaneGeometry(.9,.11)],GRIS=0x97a2b6,ROSE=0xc9a9b4,AILE=0x76839b,BLANC=0xf4f6fa,r=-Math.PI/2;
  const o={corps:pgFusion([[s[0],[0,0,0],0,[.52,.46,1.15],GRIS],[s[1],[0,-.06,.3],0,0,ROSE],[s[2],[0,.18,.56],0,0,GRIS], // le corps, le poitrail rosé, la tête
      [s[3],[-.12,.14,.44],0,0,BLANC],[s[3],[.12,.14,.44],0,0,BLANC],[s[4],[0,.02,-.66],0,0,AILE]]), // les taches blanches du cou (la signature du ramier), la queue
    aile:[-1,1].map(function(sd){return pgFusion([[s[5],[sd*.5,0,0],r,0,AILE],[s[6],[sd*.5,.01,.02],r,0,BLANC]]);})}; // chaque aile et sa barre alaire blanche
  for(const g of s)g.dispose();return o;})();
function mkPigeon(){
  const g=new THREE.Group();
  g.add(new THREE.Mesh(PG_G.corps,pgM));
  for(let i=0;i<2;i++){const sd=i?1:-1,wg=new THREE.Group();wg.position.set(sd*.16,.1,.06); // ailes battantes (pivot à l'épaule)
    wg.add(new THREE.Mesh(PG_G.aile[i],pgM));g.add(wg);
    if(sd<0)g.userData.wl=wg;else g.userData.wr=wg;}
  g.scale.setScalar(1.7);
  return g;
}
function spawnPigeonFlock(){
  const n=2+Math.floor(Math.random()*4);
  const fwd9=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.quaternion);
  const sd9=Math.random()<.5?-1:1;
  const base=new THREE.Vector3().copy(carGroup.position).addScaledVector(fwd9,150+Math.random()*160);
  base.x+=sd9*(60+Math.random()*90);base.y+=22+Math.random()*46;
  const dir9=new THREE.Vector3(-sd9*(.7+Math.random()*.5),(Math.random()-.35)*.12,(Math.random()-.5)*.7).normalize();
  const sp9=9+Math.random()*5;
  for(let k=0;k<n;k++){
    const p=mkPigeon();
    p.position.copy(base).addScaledVector(dir9,-k*3.4);
    p.position.x+=(Math.random()-.5)*5;p.position.y+=(Math.random()-.5)*3+k*.7;p.position.z+=(Math.random()-.5)*5;
    p.lookAt(new THREE.Vector3().copy(p.position).add(dir9));
    scene.add(p);
    PIGEONS.push({g:p,v:dir9.clone().multiplyScalar(sp9*(.9+Math.random()*.2)),ph:Math.random()*6,ph2:Math.random()*6,life:26});
  }
}
/* (2026-09-30, revue PISTE) PAS DE PIGEON EN ORBITE NI DANS L'ORAGE : une volée de ramiers passait devant la Terre vue du vide (les deux
   niveaux ESPACE) ou en plein déluge sous les éclairs. Là, pas d'apparition — et la volée d'avant le portail s'efface. */
const PGBAN={c:undefined,v:false}; // mémo par niveau : le test ne se refait qu'au portail
function pigeonsInterdits(){const c=LVL.cur;if(c===PGBAN.c)return PGBAN.v;PGBAN.c=c;
  return PGBAN.v=!!c&&(c.id==='espace'||c.id==='orage'||!!c.orage||/orage|tempete/i.test(String(c.bio&&c.bio[0]||'')));} // (la campagne : le niveau 9 « orage doré », le 15 « orage »)
function updatePigeons(dt,t){
  pigeonT-=dt;
  const ban9=pigeonsInterdits();
  if(pigeonT<=0&&PIGEONS.length===0&&mode!=='boom'&&!(LVL.cur&&LVL.cur.id==='jade')){if(!ban9)spawnPigeonFlock();pigeonT=24+Math.random()*32;} // RARE, exprès
  for(let i9=PIGEONS.length-1;i9>=0;i9--){
    const b9=PIGEONS[i9];b9.life-=dt;if(ban9)b9.life=0; // (la volée n'a rien à faire là : elle s'en va avec le portail)
    b9.g.position.addScaledVector(b9.v,dt);
    b9.g.position.y+=Math.sin(t*1.2+b9.ph)*.5*dt;
    const amp=.25+.6*Math.max(0,Math.sin(t*.8+b9.ph2)); // battements… puis vol plané
    const w9=Math.sin(t*10+b9.ph)*amp;
    b9.g.userData.wl.rotation.z=w9;
    b9.g.userData.wr.rotation.z=-w9;
    if(b9.life<=0){scene.remove(b9.g);PIGEONS.splice(i9,1);}
  }
}
