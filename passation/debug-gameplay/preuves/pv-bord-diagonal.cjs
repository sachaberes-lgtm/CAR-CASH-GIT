// PV-01 : pose en diagonale près du bord — même trajectoire, 60 i/s contre 30 i/s (copie du test de tryLand, demi-tour.js:331-433)
const SPD=.48,RH=14,THICK=5.2,W=2.0,LEVRE_POSE=.45;
function run(fps,lc,vB,vN,ph,fix){const dt=1/fps;
  // la trajectoire passe par (lc, 0) ; on part 40 images avant, décalé d'une fraction d'image
  let l=lc-vB*SPD*dt*(40+ph),h=0-vN*SPD*dt*(40+ph);
  const cl=(h,l,prevH,prevL,dtE)=>{const mrg=W*.5+Math.max(.2,Math.abs(vB)*SPD*dtE*1.5);
    const bumpIn=Math.abs(l)>=RH&&Math.abs(l)<RH+mrg&&vB*Math.sign(l)<-3;
    const bumpThru=Math.abs(prevL)>=RH&&Math.abs(l)<RH&&Math.sign(prevL)*vB<-3;
    const tr=h>-THICK-.12&&h<.12&&(bumpIn||bumpThru),lev=tr&&h>-LEVRE_POSE&&vN<4.5;
    if(tr&&!lev)return 'BUMP';if(lev)return 'LEVRE';
    let side=0;if(h>-1.2&&h<3&&vN<4.5)side=1;else if(prevH>-1.2&&h<=-1.2)side=1;
    if(side){const dh=prevH-h,f=Math.abs(dh)>1e-4?Math.min(1,Math.max(0,prevH/dh)):1,lx=prevL+(l-prevL)*f;if(Math.abs(lx)<RH)return 'POSE';}
    if(h<-12)return 'VIDE';return null;};
  for(let k=0;k<200;k++){l+=vB*dt*SPD;h+=vN*dt*SPD;
    const prevH=h-vN*dt*SPD,prevL=l-vB*dt*SPD;
    if(fix===2){const n=Math.max(1,Math.ceil(dt*60-1e-6));let ph=prevH,pl=prevL;for(let j=1;j<n;j++){const hj=prevH+(h-prevH)*j/n,lj=prevL+(l-prevL)*j/n,o=cl(hj,lj,ph,pl,dt/n);if(o&&o!=='VIDE')return o;ph=hj;pl=lj;}
      const o=cl(h,l,ph,pl,dt/n);if(o)return o;continue;}
    const o=cl(h,l,prevH,prevL,dt);if(o)return o;
    if(fix===1){}
  }
  return '?';}
for(const vN of (process.argv[2]?JSON.parse(process.argv[2]):[-10,-20,-35,-50,-70]))for(const vB of [-8,-20,-40]){
  const R={60:{},30:{},c:{}};let n=0;
  for(let i=0;i<400;i++){const lc=(process.argv[3]?+process.argv[3]:RH-2)+(process.argv[4]?+process.argv[4]:2)*i/400; // la caisse traverse le plan du bitume DANS la route, entre 2 m et 0 m du bord
    for(let j=0;j<10;j++){const ph=j/10;n++;for(const f of [60,30]){const o=run(f,lc,vB,vN,ph);R[f][o]=(R[f][o]||0)+1;}{const o=run(30,lc,vB,vN,ph,2);R.c[o]=(R.c[o]||0)+1;}}}
  const p=(f,k)=>((R[f][k]||0)/n*100).toFixed(1).padStart(5);
  console.log(`vN ${String(vN).padStart(4)} vB ${String(vB).padStart(4)} | BUMP 60: ${p(60,'BUMP')}% 30: ${p(30,'BUMP')}% | 30 + sous-pas (correctif): ${p('c','BUMP')}%`);}
