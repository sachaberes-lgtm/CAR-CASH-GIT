/* PREUVE PG-01 : le verdict de pose (PARFAIT si |vN| < 4,5 ; LOURD si >= 10) dépend de la cadence.
   Intégration copiée de boucle-3-physique.js (vol) : fallVel += g*dtF (gravité AVANT), fallPos += fallVel*dtF*SPD,
   puis tryLand (demi-tour.js:404) déclare la pose à la 1re image où 0 > hOff-3 ... (hOff<3, fallT>.35), impact = |vN| de CETTE image.
   Constantes : FALL_G = 33*GRAV_K(1.45) (son/curseurs.js:219), SPD = .48 (gravite-orbite.js:21). Route = plan incliné (descente θ). */
const FALL_G=33*1.45,SPD=.48;
function rnd(s){return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function vol(dt,ph,o){ // o : vx, vy0, H0 (hauteur de départ au-dessus du plan), th (pente), k (gravité : 1, ou .4 au réacteur)
  const n=[Math.sin(o.th),Math.cos(o.th)]; // normale du plan qui descend vers +x
  let x=0,y=o.H0/Math.cos(o.th),vx=o.vx,vy=o.vy0,t=0,first=true;
  for(let i=0;i<20000;i++){const d=first?dt*ph:dt;first=false;if(d<=0)continue;
    vy-=FALL_G*o.k*d;x+=vx*d*SPD;y+=vy*d*SPD;t+=d;
    const h=x*n[0]+y*n[1],vN=vx*n[0]+vy*n[1];
    if(t>.0&&h<3&&h>-1.2&&vN<4.5)return Math.abs(vN);
    if(h<-50)return null;}
  return null;}
for(const k of [1,.4]){
  const R=rnd(12345),N=40000,res={};
  for(const f of [120,60,30,20])res[f]={par:0,lourd:0,n:0,m:0};
  for(let j=0;j<N;j++){const th=R()*.45,vx=60+R()*160,vN0=-6+R()*9,o={vx,vy0:(vN0-vx*Math.sin(th))/Math.cos(th),H0:3.3+R()*4,th,k},ph=R(); /* une approche presque tangente à la route (le seul cas où PARFAIT est jouable) */
    for(const f of [120,60,30,20]){const v=vol(1/f,ph,o);if(v==null)continue;const r=res[f];r.n++;r.m+=v;if(v<4.5)r.par++;if(v>=10)r.lourd++;}}
  console.log(k===1?'\n== vol SANS nitro (gravité pleine)':'\n== vol AU RÉACTEUR (gravité ×0,4)');
  for(const f of [120,60,30,20]){const r=res[f];console.log(`${String(f).padStart(3)} i/s : PARFAIT ${(100*r.par/r.n).toFixed(1)} %   LOURD ${(100*r.lourd/r.n).toFixed(1)} %   |vN| moyen ${(r.m/r.n).toFixed(2)}`);}
}
/* un cas précis : la même approche, |vN| = 4,0 au passage exact des 3 m */
console.log('\n== approche fixe : |vN| = 4,0 au passage du plan des 3 m (sans nitro)');
for(const f of [120,60,30]){const dt=1/f;let ok=0;const M=10000;for(let i=0;i<M;i++){const tau=dt*(i+.5)/M;if(4+FALL_G*tau<4.5)ok++;}console.log(`${f} i/s : PARFAIT dans ${(100*ok/M).toFixed(0)} % des phases`);}
/* le correctif proposé : ramener le temps écoulé depuis le passage à la loi de 60 i/s */
console.log('\n== avec le correctif (τ ramené à τ·(1/60)/dtF au-delà de 60 i/s)');
{const R=rnd(999),res={};for(const f of [60,30,20])res[f]={par:0,n:0};
 for(let j=0;j<40000;j++){const vC=2+R()*6,ph=R();for(const f of [60,30,20]){const dt=1/f,tau=ph*dt,tc=tau*Math.min(1,(1/60)/dt);const v=vC+FALL_G*tc;res[f].n++;if(v<4.5)res[f].par++;}}
 for(const f of [60,30,20])console.log(`${f} i/s : PARFAIT ${(100*res[f].par/res[f].n).toFixed(1)} %`);
 const R2=rnd(999),r0={};for(const f of [60,30,20])r0[f]={par:0,n:0};
 for(let j=0;j<40000;j++){const vC=2+R2()*6,ph=R2();for(const f of [60,30,20]){const v=vC+FALL_G*ph/f;r0[f].n++;if(v<4.5)r0[f].par++;}}
 console.log('(sans correctif, même tirage : '+[60,30,20].map(f=>f+' i/s '+(100*r0[f].par/r0[f].n).toFixed(1)+' %').join(' · ')+')');}
