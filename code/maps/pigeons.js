// ---------- PIGEONS RAMIERS : rares traversées d'oiseaux — un peu de vie dans le ciel ----------
const PIGEONS=[];let pigeonT=12+Math.random()*14;
const pgBodyM=new THREE.MeshLambertMaterial({color:0x97a2b6});
const pgBreastM=new THREE.MeshLambertMaterial({color:0xc9a9b4});
const pgWingM=new THREE.MeshLambertMaterial({color:0x76839b,side:THREE.DoubleSide});
const pgBarM=new THREE.MeshBasicMaterial({color:0xf4f6fa,side:THREE.DoubleSide});
// (2026-09-26, passe fuites) les géométries des pigeons sont PARTAGÉES : chaque oiseau en créait 10 neuves, jamais libérées
const PG_G={body:new THREE.SphereGeometry(.5,9,7),breast:new THREE.SphereGeometry(.24,8,6),head:new THREE.SphereGeometry(.16,8,6),nk:new THREE.SphereGeometry(.06,6,5),
  tail:new THREE.BoxGeometry(.26,.04,.5),wing:new THREE.PlaneGeometry(1.0,.42),bar:new THREE.PlaneGeometry(.9,.11)};
function mkPigeon(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(PG_G.body,pgBodyM);
  body.scale.set(.52,.46,1.15);g.add(body);
  const breast=new THREE.Mesh(PG_G.breast,pgBreastM); // poitrail rosé
  breast.position.set(0,-.06,.3);g.add(breast);
  const head=new THREE.Mesh(PG_G.head,pgBodyM);
  head.position.set(0,.18,.56);g.add(head);
  for(const sd of [-1,1]){ // tache blanche du cou — la signature du ramier
    const nk=new THREE.Mesh(PG_G.nk,pgBarM);
    nk.position.set(sd*.12,.14,.44);g.add(nk);
  }
  const tail=new THREE.Mesh(PG_G.tail,pgWingM);
  tail.position.set(0,.02,-.66);g.add(tail);
  for(const sd of [-1,1]){ // ailes battantes avec barre alaire blanche
    const wg=new THREE.Group();wg.position.set(sd*.16,.1,.06);
    const wing=new THREE.Mesh(PG_G.wing,pgWingM);
    wing.rotation.x=-Math.PI/2;wing.position.x=sd*.5;wg.add(wing);
    const bar=new THREE.Mesh(PG_G.bar,pgBarM);
    bar.rotation.x=-Math.PI/2;bar.position.set(sd*.5,.01,.02);wg.add(bar);
    g.add(wg);
    if(sd<0)g.userData.wl=wg;else g.userData.wr=wg;
  }
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
