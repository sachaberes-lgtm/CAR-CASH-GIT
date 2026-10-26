/* banc (non livré) : la marge route − sable au bord de la route et un peu au-delà (le test de mort lit le sable jusqu'à 1,4 m autour de la caisse) */
const CODE=`(function(){const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},R={};
const LT={c:0,m:.5,e8:.8,b:1,b1:1.0,o1:1.4,o2:2.4};const nom=Object.keys(LT);
for(const k of nom)R[k]={min:1e9,n05:0,n0:0,n:0,at:[]};
for(let q=0;q<L;q+=4){frameAt(q,F9);for(const k of nom){const lt=k==='o1'||k==='o2'?ROAD_HALF+LT[k]:ROAD_HALF*LT[k];
for(const sg of [-1,1]){const x=F9.p.x+F9.b.x*lt*sg,z=F9.p.z+F9.b.z*lt*sg,y=F9.p.y+F9.b.y*lt*sg,m=y-dnHauteur(x,z),r=R[k];r.n++;if(m<r.min)r.min=m;
if(m<.5){r.n05++;if(r.at.length<8)r.at.push(Math.round(q)+(sg>0?'d':'g')+'('+m.toFixed(1)+')');}if(m<0)r.n0++;}}}
for(const k of nom)R[k].min=+R[k].min.toFixed(2);return {RH:ROAD_HALF,L:Math.round(L),R:R};})()`;
export default async function(H){
  await H.jouer();await H.sleep(2500);
  console.log(await H.ev(`JSON.stringify(__ev(${JSON.stringify(CODE)}))`));
}
