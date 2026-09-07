/* ---------------------------------------------------------------------------
 *  BANC D'ESSAI SURVIVANT — three.js minimal
 *  Seul le calcul VECTORIEL est réel (le cerveau de la meute s'en sert :
 *  courbure, rétroaction de lacet, repère de piste). Tout ce qui est matériau,
 *  géométrie, mesh, sprite ou lumière est un objet inerte : le banc ne rend rien.
 * ------------------------------------------------------------------------- */
'use strict';

class V3{
  constructor(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}
  clone(){return new V3(this.x,this.y,this.z);}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}
  addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;}
  subVectors(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;return this;}
  addVectors(a,b){this.x=a.x+b.x;this.y=a.y+b.y;this.z=a.z+b.z;return this;}
  multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;}
  negate(){this.x=-this.x;this.y=-this.y;this.z=-this.z;return this;}
  dot(v){return this.x*v.x+this.y*v.y+this.z*v.z;}
  crossVectors(a,b){const ax=a.x,ay=a.y,az=a.z,bx=b.x,by=b.y,bz=b.z;
    this.x=ay*bz-az*by;this.y=az*bx-ax*bz;this.z=ax*by-ay*bx;return this;}
  lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z;}
  length(){return Math.sqrt(this.lengthSq());}
  normalize(){const l=this.length()||1;return this.multiplyScalar(1/l);}
  lerpVectors(a,b,u){this.x=a.x+(b.x-a.x)*u;this.y=a.y+(b.y-a.y)*u;this.z=a.z+(b.z-a.z)*u;return this;}
  applyQuaternion(){return this;}
  distanceTo(v){const dx=this.x-v.x,dy=this.y-v.y,dz=this.z-v.z;return Math.sqrt(dx*dx+dy*dy+dz*dz);}
}

const inert=()=>({});
class Obj3{
  constructor(){this.position=new V3();this.quaternion={setFromRotationMatrix(){return this;},copy(){return this;}};
    this.rotation={x:0,y:0,z:0};this.scale={x:1,y:1,z:1,set(){return this;},setScalar(){return this;}};
    this.children=[];this.visible=true;this.userData={};this.material=null;}
  add(o){this.children.push(o);return this;}
  remove(){return this;}
  traverse(fn){fn(this);for(const c of this.children)c.traverse&&c.traverse(fn);}
  rotateY(){return this;} rotateZ(){return this;} lookAt(){return this;}
  copy(v){this.position.copy(v);return this;}
}
class Mat{constructor(o){Object.assign(this,o||{});this.opacity=(o&&o.opacity)!=null?o.opacity:1;
  this.color={setHex(){return this;},set(){return this;},copy(){return this;}};}
  dispose(){}}
class Mesh extends Obj3{constructor(g,m){super();this.geometry=g;this.material=m||new Mat();this.isMesh=true;this.castShadow=false;this.renderOrder=0;}}
class Sprite extends Obj3{constructor(m){super();this.material=m||new Mat();this.isSprite=true;}}
class Light extends Obj3{constructor(c,i,d){super();this.intensity=i||0;this.distance=d;
  this.color={setHex(){return this;}};}}

const THREE={
  Vector3:V3, Object3D:Obj3, Group:Obj3, Mesh, Sprite,
  MeshPhongMaterial:Mat, MeshBasicMaterial:Mat, SpriteMaterial:Mat, MeshStandardMaterial:Mat,
  BoxGeometry:function(){return inert();}, CylinderGeometry:function(){return inert();},
  PlaneGeometry:function(){return inert();}, CircleGeometry:function(){return inert();},
  TorusGeometry:function(){return inert();}, BufferGeometry:function(){return inert();},
  CanvasTexture:function(){return inert();}, Texture:function(){return inert();},
  PointLight:Light, DirectionalLight:Light, AmbientLight:Light,
  Color:function(){return {setHex(){return this;},set(){return this;}};},
  Matrix4:function(){return {makeBasis(){return this;},identity(){return this;}};},
  Quaternion:function(){return {setFromUnitVectors(){return this;},setFromAxisAngle(){return this;},
    setFromRotationMatrix(){return this;},premultiply(){return this;},slerp(){return this;},copy(){return this;}};},
  AdditiveBlending:2, DoubleSide:2, NearestFilter:1003,
  MathUtils:{
    clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
    smoothstep:(x,a,b)=>{if(x<=a)return 0;if(x>=b)return 1;const t=(x-a)/(b-a);return t*t*(3-2*t);},
    lerp:(a,b,t)=>a+(b-a)*t
  }
};
if(typeof module!=='undefined')module.exports={THREE};
