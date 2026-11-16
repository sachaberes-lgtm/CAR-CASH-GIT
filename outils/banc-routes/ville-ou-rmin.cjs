/* où est le rayon minimal d'une route de ville (même mesure que ville-torsades.cjs) : node outils/banc-routes/ville-ou-rmin.cjs carte graine palier */
const path=require('path'),vm=require('vm');
const B=require(path.join(__dirname,'charge.cjs')).creer(process.env.SEARCH||''),ctx=B.ctx;
const [carte,g,pal]=[process.argv[2]||'ville',+(process.argv[3]||3),+(process.argv[4]||20)];
vm.runInContext('VILLE_BANK.graine='+g+';if(typeof VILLE_ENTREE!=="undefined")VILLE_ENTREE=null;',ctx);
const r=B.piste(carte,g,pal),ctrl=r.ctrl,n=ctrl.length,rP=40+.3*r.vw;
const T=ctx.THREE,cv=new T.CatmullRomCurve3(ctrl,false,'centripetal');cv.arcLengthDivisions=Math.max(200,n*16);
const Lc=cv.getLength(),Nc=Math.max(50,Math.round(Lc/5)),P=cv.getSpacedPoints(Nc),ds=Lc/Nc,H=new Float64Array(Nc+1);
for(let i=0;i<=Nc;i++){const a=P[Math.max(0,i-1)],c=P[Math.min(Nc,i+1)];H[i]=Math.atan2(c.x-a.x,c.z-a.z);}
for(let i=1;i<=Nc;i++){let d=H[i]-H[i-1];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;H[i]=H[i-1]+d;}
const Wn=Math.max(1,Math.round(10/ds));const rad=[];for(let i=Wn;i<=Nc-Wn;i++){const k=Math.abs(H[i+Wn]-H[i-Wn])/(2*Wn*ds);rad.push([i*ds,k>1e-9?1/k/rP:1e9]);}
rad.sort((a,b)=>a[1]-b[1]);
/* le point de contrôle le plus proche de chaque abscisse */
const sc=[0];for(let i=1;i<n;i++)sc.push(sc[i-1]+Math.hypot(ctrl[i].x-ctrl[i-1].x,ctrl[i].y-ctrl[i-1].y,ctrl[i].z-ctrl[i-1].z));
const ixDe=s=>{let k=0;while(k<n-1&&sc[k+1]<s)k++;return k;};
console.log(carte,'p'+pal,'g'+g,'rP',rP.toFixed(0),'m');
for(const [s,v] of rad.slice(0,6))console.log('  s',Math.round(s),'R',v.toFixed(2),'rP  ctrl',ixDe(s));
for(const m of r.marks)if(m.fig==='saut'||m.fig==='grandsaut'||m.fig==='passerelle'||m.rac)console.log('  marque',m.fig||m.nom,JSON.stringify({ia:m.ia,i0:m.i0,i1:m.i1,i2:m.i2,zero:m.zero,nul:m.nul}));
const i=ixDe(rad[0][0]);for(let k=Math.max(1,i-4);k<=Math.min(n-2,i+4);k++){const a=ctrl[k-1],b=ctrl[k],c=ctrl[k+1];const h1=Math.atan2(b.x-a.x,b.z-a.z),h2=Math.atan2(c.x-b.x,c.z-b.z);let d=h2-h1;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;console.log('   ctrl',k,'pas',Math.hypot(c.x-b.x,c.z-b.z).toFixed(0),'m tourne',(d*57.3).toFixed(1),'°');}
