/* ============================== LA PLUIE QUI ÉCLABOUSSE LA CAISSE (2026-10-21, Léo : « pour toutes les pluies, travaille une petite pluie qui splash un peu sur la voiture quand elle tombe dessus ») ==============================
   Sous toute pluie (LVL.pluie > .15 : la map nuages, la ville, la forêt, les pics de jade…), des gouttes touchent le TOIT, le CAPOT et le COFFRE de la caisse (points tirés sur le dessus de sa boîte,
   dans son repère) ; chacune éclate en 3-5 gouttelettes — une petite couronne : vers le haut et sur les côtés, portées aux 92 % de la vitesse de la caisse, qui retombent en 0,3-0,55 s.
   Une réserve à part (`gouttes`, additive, la matière de `spray` : zéro programme de plus), faible : une fine brume qui rebondit, pas une fontaine. */
const gouttes=makePool(260,.2,0xdff6ff,.85,true,{a:[0,.4,1,.6],etire:1,str:.03,v:.5});gouttes.mesh.material.blending=THREE.AdditiveBlending;
const PLC={box:null,uid:'',acc:0,lp:new THREE.Vector3(),has:false,v:new THREE.Vector3(),loc:new THREE.Vector3(),mi:new THREE.Matrix4(),b3:new THREE.Box3()};
function pluieCaisseTick(dt){
  const cp=carGroup.position;
  if(PLC.has&&dt>0){PLC.v.set((cp.x-PLC.lp.x)/dt,(cp.y-PLC.lp.y)/dt,(cp.z-PLC.lp.z)/dt);const l=PLC.v.length();if(l>140)PLC.v.multiplyScalar(140/l);}
  PLC.lp.copy(cp);PLC.has=true;
  const pl=LVL&&LVL.pluie||0;
  if(!(pl>.15)||!started||gameOver||mode==='boom'||!carGroup.visible||garageOn||paused||dt<=0)return;
  if(!carBody)return;
  if(PLC.uid!==carBody.uuid){carGroup.updateMatrixWorld(true);PLC.b3.setFromObject(carBody);PLC.mi.copy(carGroup.matrixWorld).invert();PLC.box=PLC.b3.clone().applyMatrix4(PLC.mi);PLC.uid=carBody.uuid;} // la boîte de la caisse dans SON repère, une fois par carrosserie
  const B=PLC.box;if(!B||B.isEmpty())return;
  PLC.acc+=dt*70*Math.min(1,pl+.2);let n=PLC.acc|0;PLC.acc-=n;if(n>6)n=6;
  const sx=B.max.x-B.min.x,sz=B.max.z-B.min.z,sy=B.max.y-B.min.y;
  while(n-->0){
    const lx=B.min.x+sx*(.14+.72*Math.random()),lz=B.min.z+sz*(.06+.88*Math.random()),cab=Math.abs(lz-(B.min.z+B.max.z)*.5)<sz*.2,ly=cab?B.max.y*.97:B.min.y+sy*.62; // le toit au milieu, le capot et le coffre plus bas
    PLC.loc.set(lx,ly,lz);carGroup.localToWorld(PLC.loc);
    const k=3+((Math.random()*3)|0);
    for(let q=0;q<k;q++){const a=Math.random()*6.283,sp=.8+Math.random()*2.2;
      spawnP(gouttes,PLC.loc.x,PLC.loc.y+.02,PLC.loc.z,PLC.v.x*.92+Math.cos(a)*sp,PLC.v.y*.92+1.2+Math.random()*2.2,PLC.v.z*.92+Math.sin(a)*sp,.3+Math.random()*.25);}
  }
}
