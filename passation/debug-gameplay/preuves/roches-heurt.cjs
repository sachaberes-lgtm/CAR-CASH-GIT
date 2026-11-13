// Preuve du test « dans une roche » : la rotation par le quaternion inverse et l'ellipsoïde (formule recopiée de code/maps/orbite-roches.js, rochesHeurt).
const T=require('/Users/sachaberes/cash-car/debug-gameplay/VERSION PRINCIPALE/vendor/three.min.js');
function dans(P,Q,S,p){const d=[P.x,P.y,P.z,-Q.x,-Q.y,-Q.z,Q.w,S.x*.86+.9,S.y*.86+.9,S.z*.86+.9],o=0;
  const x=p.x-d[o],y=p.y-d[o+1],z=p.z-d[o+2],qx=d[o+3],qy=d[o+4],qz=d[o+5],qw=d[o+6];
  const tx=2*(qy*z-qz*y),ty=2*(qz*x-qx*z),tz=2*(qx*y-qy*x);
  const lx=(x+qw*tx+(qy*tz-qz*ty))/d[o+7],ly=(y+qw*ty+(qz*tx-qx*tz))/d[o+8],lz=(z+qw*tz+(qx*ty-qy*tx))/d[o+9];return lx*lx+ly*ly+lz*lz<1;}
let ko=0,n=0;for(let k=0;k<20000;k++){const P=new T.Vector3(Math.random()*500,Math.random()*500,Math.random()*500),Q=new T.Quaternion().setFromEuler(new T.Euler(Math.random()*6.28,Math.random()*6.28,Math.random()*6.28)),S=new T.Vector3(3+Math.random()*40,3+Math.random()*40,3+Math.random()*40);
  const p=new T.Vector3((Math.random()-.5)*120,(Math.random()-.5)*120,(Math.random()-.5)*120).add(P);
  const l=p.clone().sub(P).applyQuaternion(Q.clone().invert?Q.clone().invert():Q.clone().inverse());const ref=(l.x/(S.x*.86+.9))**2+(l.y/(S.y*.86+.9))**2+(l.z/(S.z*.86+.9))**2<1;n+=ref;if(ref!==dans(P,Q,S,p))ko++;}
console.log('20000 points,',n,'dedans, désaccords avec three :',ko);
