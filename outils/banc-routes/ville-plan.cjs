/* ville-plan.cjs (2026-11-14, MAPS PRO — la ville) : LA PLANCHE DES PLANS — chaque route vue de DESSUS (même échelle pour toutes), colorée par le dévers de la dalle :
   vert = à plat (< 30°) · jaune = 30-60° · orange = sur le mur (60-90°) · rouge = tête en bas (> 90°). Les boucles et les torsades se lisent d'un coup d'œil.
   node ville-plan.cjs sortie.png [carte=ville] [palier=0] [graines=1-12] [racine=<worktree>]   (SEARCH='?…' : une variante) */
const path=require('path'),fs=require('fs'),vm=require('vm');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const RAC=path.resolve(arg('racine',path.join(__dirname,'../..'))),SORTIE=process.argv[2];
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||''),ctx=B.ctx,P=require('./png.cjs');
const carte=arg('carte','ville'),pal=+arg('palier','0'),[g0,g1]=arg('graines','1-12').split('-').map(Number);
const R=[];let ext=0;
for(let g=g0;g<=g1;g++){vm.runInContext('VILLE_BANK.graine='+g+';if(typeof VILLE_ENTREE!=="undefined")VILLE_ENTREE=null;',ctx);
  const r=B.piste(carte,g,pal),C=r.ctrl,n=C.length,NB=vm.runInContext('VILLE_BANK.N',ctx),b=new Float64Array(n);
  if(NB&&NB.length===n)for(let i=0;i<n;i++)b[i]=Math.acos(Math.max(-1,Math.min(1,NB[i].y)))*57.29578;
  const cv=new ctx.THREE.CatmullRomCurve3(C,false,'centripetal'),m=Math.max(100,n*8),Q=[];
  for(let k=0;k<=m;k++){const t=k/m,p=cv.getPoint(t),f=t*(n-1),a=Math.min(n-2,Math.floor(f));Q.push({x:p.x,z:p.z,b:b[a]+(b[a+1]-b[a])*(f-a)});}
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const q of Q){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);z0=Math.min(z0,q.z);z1=Math.max(z1,q.z);}
  ext=Math.max(ext,x1-x0,z1-z0);R.push({g,Q,x0,x1,z0,z1,mods:r.marks.map(function(k){return k.fig||'?';})});}
const NC=Math.min(4,R.length),NL=Math.ceil(R.length/NC),W=420,im=P.Img(NC*W,NL*W,[14,16,26]),sc=(W-40)/ext;
R.forEach(function(r,k){const ox=(k%NC)*W,oy=Math.floor(k/NC)*W,cx=(r.x0+r.x1)/2,cz=(r.z0+r.z1)/2;
  for(let x=0;x<W;x++){P.px(im,ox+x,oy,[50,54,70]);P.px(im,ox,oy+x,[50,54,70]);}
  const X=q=>ox+W/2+(q.x-cx)*sc,Y=q=>oy+W/2-(q.z-cz)*sc;
  for(let i=1;i<r.Q.length;i++){const q=r.Q[i],c=q.b>90?[255,60,60]:q.b>60?[255,150,40]:q.b>30?[245,220,70]:[80,215,120];P.line(im,X(r.Q[i-1]),Y(r.Q[i-1]),X(q),Y(q),c,Math.max(1,Math.round(28*sc)));}
  P.disc(im,X(r.Q[0]),Y(r.Q[0]),5,[255,255,255]);
  /* l'échelle : 500 m */for(let x=0;x<500*sc;x++)P.px(im,ox+12+x,oy+W-12,[200,200,210]);
  console.log('g'+r.g,r.mods.join(','));});
fs.writeFileSync(SORTIE,P.png(im));console.log('→',SORTIE,'· trait blanc en bas de case = 500 m · point blanc = départ');
