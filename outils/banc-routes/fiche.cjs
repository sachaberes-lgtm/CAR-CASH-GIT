/* LA FICHE DE RYTHME (2026-11-05, LE DIRECTEUR DE RYTHME) : résume les JSON de toutes.mjs par map × palier (moyennes, pires) et dessine le plan de chaque route
   (vue de dessus, un PNG par route : la route à plat en gris, les virages comptés en vert (serrés en orange, infranchissables en rouge), les droites > 5 s en bleu,
   les figures en violet, les coudes en croix blanches ; le départ = disque blanc).
   node fiche.cjs DOSSIER [--png] [--carte=x] */
const fs=require('fs'),path=require('path'),P=require('./png.cjs');
const dir=process.argv[2]||process.env.OUT,PNG=process.argv.includes('--png'),only=(process.argv.find(a=>a.startsWith('--carte='))||'').slice(8);
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&(!only||f.startsWith(only+'-')));
const agg={};const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,max=a=>a.length?Math.max.apply(null,a):0;
for(const f of files){const o=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));if(o.erreur){console.log(f,'ERREUR',o.erreur.split('\n')[0]);continue;}
  const k=o.carte+' p'+o.palier;let A=agg[k];if(!A)A=agg[k]={carte:o.carte,pal:o.palier,n:0,note:[],L:[],s:[],virKm:[],serreKm:[],infr:[],droiteS:[],droites5:[],enchKm:[],spirMax:[],spirales:[],coudes:[],cretes:[],penteP95:[],montee:[],descente:[],rMinRP:[],ms:[],douilles:[],zigzags:[],droitesFPart:[],horsEndroit:[]};
  A.n++;A.note.push(o.note);for(const key of Object.keys(A))if(Array.isArray(A[key])&&key!=='note'&&key!=='ms')A[key].push(o.fiche[key]);A.ms.push(o.ms);
  if(PNG)dessine(o,path.join(dir,f.replace(/\.json$/,'.png')));}
console.log('map      pal  n  note   L     s   vir/km serré infr droite(s) >5s ench/km spir°/max spir coudes crêtes p95   montée desc  rMin/rP  ms   douilles zigz dF%   hors');
for(const k of Object.keys(agg).sort()){const A=agg[k];
  console.log(`${A.carte.padEnd(8)} ${String(A.pal).padStart(2)} ${String(A.n).padStart(2)}  ${mean(A.note).toFixed(1).padStart(5)} ${mean(A.L).toFixed(0).padStart(5)} ${mean(A.s).toFixed(0).padStart(4)}  ${mean(A.virKm).toFixed(1).padStart(5)} ${mean(A.serreKm).toFixed(2).padStart(5)} ${mean(A.infr).toFixed(0).padStart(4)} ${mean(A.droiteS).toFixed(1).padStart(5)}/${max(A.droiteS).toFixed(0).padStart(3)} ${mean(A.droites5).toFixed(1).padStart(3)} ${mean(A.enchKm).toFixed(2).padStart(6)} ${mean(A.spirMax).toFixed(0).padStart(4)}/${max(A.spirMax).toFixed(0).padStart(3)} ${mean(A.spirales).toFixed(1).padStart(4)} ${mean(A.coudes).toFixed(1).padStart(5)}  ${mean(A.cretes).toFixed(1).padStart(5)} ${mean(A.penteP95).toFixed(2).padStart(5)} ${mean(A.montee).toFixed(2).padStart(5)} ${mean(A.descente).toFixed(3).padStart(5)} ${mean(A.rMinRP).toFixed(2).padStart(5)}  ${mean(A.ms).toFixed(0).padStart(4)} ${mean(A.douilles).toFixed(1).padStart(5)} ${mean(A.zigzags).toFixed(1).padStart(4)} ${mean(A.droitesFPart).toFixed(2).padStart(5)} ${mean(A.horsEndroit).toFixed(2).padStart(5)}`);}
function dessine(o,sortie){
  const Q=o.ctrl0,n=Q.length,F=o.fiche;if(n<3)return;
  const T=new (require('./charge.cjs').ctx.THREE.CatmullRomCurve3)(Q.map(a=>new (require('./charge.cjs').ctx.THREE.Vector3)(a[0],a[1],a[2])),false,'centripetal');T.arcLengthDivisions=Math.max(200,n*16);
  const L=T.getLength(),N=Math.max(50,Math.round(L/5)),S=T.getSpacedPoints(N),ds=L/N;
  let mn=[1e9,1e9],mx=[-1e9,-1e9];for(const q of S){mn[0]=Math.min(mn[0],q.x);mx[0]=Math.max(mx[0],q.x);mn[1]=Math.min(mn[1],q.z);mx[1]=Math.max(mx[1],q.z);}
  const W=900,H=900,im=P.Img(W,H,[16,18,28]),sc=Math.min((W-40)/Math.max(mx[0]-mn[0],1),(H-40)/Math.max(mx[1]-mn[1],1));
  const X=q=>20+(q.x-mn[0])*sc,Y=q=>H-20-(q.z-mn[1])*sc;
  const col=new Array(N+1).fill(null);
  const vP=o.vP,rP=o.rP;const kV=1/(4*rP),kS=1/(1.5*rP),kI=1/rP;const Wn=Math.max(1,Math.round(10/ds));
  for(let i=Wn;i<=N-Wn;i++){const a=S[i-Wn],b=S[i],c=S[i+Wn];const h1=Math.atan2(b.x-a.x,b.z-a.z),h2=Math.atan2(c.x-b.x,c.z-b.z);let d=h2-h1;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;
    const l=(Math.hypot(b.x-a.x,b.z-a.z)+Math.hypot(c.x-b.x,c.z-b.z))/2,k=l>.5?Math.abs(d)/l:0;col[i]=k>=kI?[255,60,60]:k>=kS?[255,160,40]:k>=kV?[90,220,120]:null;}
  /* les droites > 5 s en bleu : entre deux virages comptés (fiche.virages) */
  const V=F.virages||[];let last=0;const bleu=[];for(const v of V){if(v[0]-last>5*vP)bleu.push([last,v[0]]);last=v[1];}if(L-last>5*vP)bleu.push([last,L]);
  for(const [a,b] of bleu)for(let i=Math.round(a/ds);i<=Math.min(N,Math.round(b/ds));i++)col[i]=[80,140,255];
  /* les figures (marks g/fig) en violet */
  if(o.marks)for(const m of o.marks)if(m.g||m.fig){const a=Math.round(m.i0/(n-1)*N),b=Math.round(m.i1/(n-1)*N);for(let i=a;i<=b&&i<=N;i++)col[i]=[220,120,255];}
  /* (LA RÈGLE v2) les douilles en jaune */
  if(F.douillesS)for(const d of F.douillesS)for(let i=Math.round(d[0]/ds);i<=Math.min(N,Math.round(d[1]/ds));i++)col[i]=[255,230,60];
  for(let i=1;i<=N;i++)P.line(im,X(S[i-1]),Y(S[i-1]),X(S[i]),Y(S[i]),col[i]||[150,150,160],col[i]?2:1);
  /* les coudes : croix blanches */
  for(let i=1;i<n-1;i++){const a=Math.atan2(Q[i][0]-Q[i-1][0],Q[i][2]-Q[i-1][2]),b=Math.atan2(Q[i+1][0]-Q[i][0],Q[i+1][2]-Q[i][2]);let d=Math.abs(b-a);if(d>Math.PI)d=2*Math.PI-d;
    const l1=Math.hypot(Q[i][0]-Q[i-1][0],Q[i][2]-Q[i-1][2]),l2=Math.hypot(Q[i+1][0]-Q[i][0],Q[i+1][2]-Q[i][2]);
    if((d>14*Math.PI/180&&Math.min(l1,l2)>8)||(i<n-2&&l2<10&&l1>40)){const x=20+(Q[i][0]-mn[0])*sc,y=H-20-(Q[i][2]-mn[1])*sc;P.line(im,x-5,y-5,x+5,y+5,[255,255,255],1);P.line(im,x-5,y+5,x+5,y-5,[255,255,255],1);}}
  P.disc(im,X(S[0]),Y(S[0]),5,[255,255,255]);
  fs.writeFileSync(sortie,P.png(im));}
