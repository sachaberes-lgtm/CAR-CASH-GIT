// JB : la roche VISIBLE (rayon .60+.64*d du vertex shader d'orbite-roches.js, facettes entre sommets) contre l'ellipsoïde qui TUE (.86*S+.9).
// Pour des roches du BORD (rad 4-18, forme .75-1.35 par axe), le long de rayons pris au hasard : écart (m) entre la surface vue et la surface qui tue.
const T=require('/Users/sachaberes/cash-car/debug-gameplay/VERSION PRINCIPALE/vendor/three.min.js');
const fr=x=>x-Math.floor(x);
function h31(x,y,z){x=fr(x*.1031);y=fr(y*.1031);z=fr(z*.1031);const d=x*(z+31.32)+y*(y+31.32)+z*(x+31.32);x+=d;y+=d;z+=d;return fr((x+y)*z);}
function vn(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);let fx=x-ix,fy=y-iy,fz=z-iz;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);fz=fz*fz*(3-2*fz);
  const m=(a,b,t)=>a+(b-a)*t,H=(a,b,c)=>h31(ix+a,iy+b,iz+c);
  return m(m(m(H(0,0,0),H(1,0,0),fx),m(H(0,1,0),H(1,1,0),fx),fy),m(m(H(0,0,1),H(1,0,1),fx),m(H(0,1,1),H(1,1,1),fx),fy),fz);}
function rayon(n,s){return .60+.64*(vn(n.x*1.5+s,n.y*1.5+s,n.z*1.5+s)*.55+vn(n.x*3.6+s*1.7,n.y*3.6+s*1.7,n.z*3.6+s*1.7)*.30+vn(n.x*8.1+s*2.3,n.y*8.1+s*2.3,n.z*8.1+s*2.3)*.15);}
let rnd=(a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;})(7);
for(const det of [3,1]){
  const g0=new T.IcosahedronGeometry(1,det),g=g0.index?g0.toNonIndexed():g0,P=g.attributes.position,ray=new T.Ray(),A=new T.Vector3(),B=new T.Vector3(),C=new T.Vector3(),hit=new T.Vector3();
  let rmin=9,rmax=0,vide=[],dans=[],nv=0,nd=0,N=0;
  for(let k=0;k<400;k++){const s=rnd()*41,rad=4+Math.pow(rnd(),1.6)*14,S=[rad*(.75+rnd()*.6),rad*(.75+rnd()*.6),rad*(.75+rnd()*.6)],a=S.map(v=>v*.86+.9);
    const tri=[];for(let i=0;i<P.count;i+=3){const t=[];for(let j=0;j<3;j++){const v=new T.Vector3().fromBufferAttribute(P,i+j);const n=v.clone().normalize(),r=rayon(n,s);rmin=Math.min(rmin,r);rmax=Math.max(rmax,r);t.push(new T.Vector3(n.x*r*S[0],n.y*r*S[1],n.z*r*S[2]));}tri.push(t);}
    for(let q=0;q<60;q++){const d=new T.Vector3(rnd()-.5,rnd()-.5,rnd()-.5).normalize();ray.set(new T.Vector3(),d);let tv=-1;
      for(const t of tri){if(ray.intersectTriangle(t[0],t[1],t[2],false,hit)){tv=hit.length();break;}}if(tv<0)continue;
      const tk=1/Math.hypot(d.x/a[0],d.y/a[1],d.z/a[2]);N++; // le bord de l'ellipsoïde qui tue, le long du même rayon
      if(tk>tv){vide.push(tk-tv);nv++;}else{dans.push(tv-tk);nd++;}}}
  const q=(L,p)=>{L.sort((x,y)=>x-y);return L.length?+L[Math.min(L.length-1,Math.floor(L.length*p))].toFixed(2):0;};
  console.log('icosphère détail',det,(det===3?'(PC)':'(téléphone, ALLEGE)'),'· rayon local min',rmin.toFixed(3),'max',rmax.toFixed(3));
  console.log('  rayons',N,': mort DANS LE VIDE devant la roche',(100*nv/N).toFixed(0)+'%','(médiane',q(vide,.5),'m, 95e',q(vide,.95),'m, max',q(vide,1),'m)');
  console.log('  roche TRAVERSÉE avant de mourir',(100*nd/N).toFixed(0)+'%','(médiane',q(dans,.5),'m, 95e',q(dans,.95),'m, max',q(dans,1),'m)');}
