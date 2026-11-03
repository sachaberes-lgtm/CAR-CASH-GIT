/* ===== L'OUROBOROS DU CHARGEMENT (2026-11-03, Sacha : « un mini Ouroboros pixel, mignon, noir et blanc, qui se mord la queue en boucle pendant le chargement ») =====
   Dessiné par Fable 5.1. `node outils/ouroboros/ouroboros.cjs` régénère tout dans ce dossier :
   - ouroboros-44px-48img.png : la bande de 48 images de 44 × 44 px (palette : transparent, blanc, gris, noir)
   - ouroboros.css : le bloc CSS pur à coller dans la page (data-URL de la bande, steps(48) à 12 images/s, pixels nets)
   - demo.html : la page de démo (?zoom=4 pour voir les pixels)
   - planche-16-images.png / images-cles.png : des aperçus pour l'œil humain
   Le corps est un anneau calculé (cercle puis courbe de Bézier qui entre à l'horizontale dans la bouche), la tête est dessinée à la main (HEAD),
   les écailles sont des carrés 2 × 2 tamponnés tous les 6 px d'arc qui AVANCENT vers la tête (sens horaire) : 48 × 0,75 = 36 px = 6 pas → la boucle
   est parfaite. Scénario des 4 s : la queue frétille (images 7 et 9), la tête fait « gloups » (descend d'un pixel, images 11-15), l'œil cligne (35-36). */
const fs=require('fs'),{pngIndexed,pngRGB}=require('./png.cjs');
const N=44;            /* grille 44 × 44 */
const F=48;            /* images de la boucle (12 im/s → 4 s) */
const P=6, K=6, V=K*P/F; /* pas des losanges (px d'arc), K pas parcourus par boucle → boucle parfaite */
/* 0 = rien, 1 = blanc, 2 = gris, 3 = noir opaque */
const PAL=[[0,0,0],[255,255,255],[150,150,150],[0,0,0]],ALPHA=[0,255,255,255];
const cfg={cx:22,cy:25,rOut:16,rIn:8,phi0:0,phi1:270,tipTh:2,headX:9,headY:2,mouth:[19,12.5],belly:true,blush:false,diamond:true,stamp:'sq',stampCol:3,eye:'4x4i',smile:'diag',wiggle:0};
/* LA TÊTE (regarde à gauche) : '#' blanc, 'o' noir, 'x' gris, '.' ne touche pas */
const HEAD=[
/*          1 */
/*0123456789012345678 */
'.......#######.....',  /* 0 */
'.....###########...',  /* 1 */
'....#############..',  /* 2 */
'...###############.',  /* 3 */
'..################.',  /* 4 */
'..#################',  /* 5 */
'.##################',  /* 6 */
'.##################',  /* 7 */
'..#################',  /* 8 */
'..ooooooooo########',  /* 9 lèvre du haut */
'...........o#######',  /* 10 la queue passe ici ; gorge en x=11 */
'...........o#######',  /* 11 */
'....ooooooo########',  /* 12 lèvre du bas */
'.....#############.',  /* 13 menton */
'.......##########..',  /* 14 */
'.........######....'   /* 15 */
];
const EYE={x:4,y:3};
function head(g,blink,dy){
  const put=(x,y,c)=>{if(x>=0&&y>=0&&x<N&&y<N)g[y*N+x]=c;};
  for(let j=0;j<HEAD.length;j++)for(let i=0;i<HEAD[j].length;i++){const ch=HEAD[j][i];if(ch==='.')continue;
    put(cfg.headX+i,cfg.headY+j+dy,ch==='#'?1:ch==='o'?3:2);}
  const ex=cfg.headX+EYE.x,ey=cfg.headY+EYE.y+dy;
  const m=/^(\d)x(\d)(.*)$/.exec(cfg.eye),ew=+m[1],eh=+m[2],hl=m[3]; /* ex. '3x4', '3x4c' (reflet au coin), '3x4i' (reflet intérieur) */
  if(blink){for(let i=0;i<ew;i++)for(let j=0;j<eh;j++)put(ex+i,ey+j,1);for(let i=0;i<ew;i++)put(ex+i,ey+eh-1,3);}
  else{for(let i=0;i<ew;i++)for(let j=0;j<eh;j++)put(ex+i,ey+j,3);if(hl==='c')put(ex,ey,1);if(hl==='i')put(ex+1,ey+1,1);}
  if(cfg.smile==='diag'){put(cfg.headX+12,cfg.headY+9+dy,3);put(cfg.headX+13,cfg.headY+8+dy,3);} /* le sourire : le coin de la bouche remonte en diagonale */
  else if(cfg.smile==='tick'){put(cfg.headX+12,cfg.headY+9+dy,3);}
  if(cfg.blush==='dither'){put(cfg.headX+3,cfg.headY+8+dy,2);put(cfg.headX+5,cfg.headY+8+dy,2);}
  else if(cfg.blush==='one'){put(cfg.headX+2,cfg.headY+7+dy,2);}
  else if(cfg.blush==='under'){put(cfg.headX+4,cfg.headY+7+dy,2);put(cfg.headX+5,cfg.headY+7+dy,2);}
  else if(cfg.blush==='snout'){put(cfg.headX+2,cfg.headY+7+dy,2);put(cfg.headX+3,cfg.headY+7+dy,2);}
}
/* LA COLONNE : le cercle de phi0 à phi1 (sens horaire depuis midi), puis une Bézier qui remonte le flanc gauche et entre à l'horizontale dans la bouche */
function spine(){
  const {cx,cy,rOut,rIn}=cfg,rMid=(rOut+rIn)/2,TH=rOut-rIn,S=[];let s=0,px=null,py=null;
  const add=(x,y,th,nx,ny)=>{if(px!==null)s+=Math.hypot(x-px,y-py);S.push({x,y,s,th,nx,ny});px=x;py=y;};
  for(let a=cfg.phi0;a<=cfg.phi1;a+=.5){const r=a*Math.PI/180,x=cx+rMid*Math.sin(r),y=cy-rMid*Math.cos(r);add(x,y,TH,Math.sin(r),-Math.cos(r));}
  const A=[cx-rMid,cy],M=[cfg.mouth[0],cfg.mouth[1]+cfg.wiggle],B=[[A[0],A[1]],[A[0],A[1]-9],[M[0]-7,M[1]],[M[0],M[1]]];
  const bz=(t,i)=>{const u=1-t;return u*u*u*B[0][i]+3*u*u*t*B[1][i]+3*u*t*t*B[2][i]+t*t*t*B[3][i];};
  const s0=s;let L=0;{let qx=A[0],qy=A[1];for(let t=.01;t<=1.0001;t+=.01){const x=bz(t,0),y=bz(t,1);L+=Math.hypot(x-qx,y-qy);qx=x;qy=y;}}
  for(let t=.005;t<=1.0001;t+=.005){const x=bz(t,0),y=bz(t,1),dx=bz(Math.min(1,t+.001),0)-bz(t-.001,0),dy=bz(Math.min(1,t+.001),1)-bz(t-.001,1),l=Math.hypot(dx,dy)||1;
    let nx=dy/l,ny=-dx/l;if((x-cx)*nx+(y-cy)*ny<0){nx=-nx;ny=-ny;} /* la normale pointe vers l'extérieur de l'anneau */
    const k=Math.min(1,(s-s0)/L),e=k*k*(3-2*k);add(x,y,TH+(cfg.tipTh-TH)*e,nx,ny);}
  return S;
}
let SP=spine();
function body(g,t){
  const {cx,cy}=cfg;
  const near=new Int32Array(N*N),sd=new Float32Array(N*N);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const qx=x+.5,qy=y+.5;let bi=-1,bd=1e9;
    for(let i=0;i<SP.length;i++){const d=(qx-SP[i].x)**2+(qy-SP[i].y)**2;if(d<bd){bd=d;bi=i;}}
    const p=SP[bi],d=Math.sqrt(bd),u=((qx-p.x)*p.nx+(qy-p.y)*p.ny)>=0?d:-d;near[y*N+x]=bi;sd[y*N+x]=u;
    if(Math.abs(u)>p.th/2)continue;
    g[y*N+x]=(cfg.belly&&u<-p.th/2+1.0)?2:1;}
  if(!cfg.diamond)return;
  /* LES LOSANGES DU DOS : tamponnés aux abscisses k·P + V·t, sur le dos (1,5 px vers l'extérieur), seulement là où le corps est assez large */
  const L=SP[SP.length-1].s;
  for(let k=-2;k*P<L+P;k++){const s=k*P+V*t;if(s<0||s>L)continue;
    let i=0;while(i<SP.length-1&&SP[i+1].s<s)i++;const p=SP[i];if(p.th<5)continue;
    const mx=Math.floor(p.x+p.nx*1.5),my=Math.floor(p.y+p.ny*1.5);
    const SH=cfg.stamp==='plus'?[[0,0],[1,0],[-1,0],[0,1],[0,-1]]:cfg.stamp==='sq'?[[0,0],[1,0],[0,1],[1,1]]:cfg.stamp==='dot'?[[0,0]]:[[0,0],[p.ny>Math.abs(p.nx)||-p.ny>Math.abs(p.nx)?1:0,p.ny>Math.abs(p.nx)||-p.ny>Math.abs(p.nx)?0:1]];
    for(const [ox,oy] of SH){const x=mx+ox,y=my+oy;if(x<0||y<0||x>=N||y>=N)continue;if(g[y*N+x]===1)g[y*N+x]=cfg.stampCol;}}
}
/* LE SCÉNARIO DE LA BOUCLE (48 images) : un « gloups » (la tête descend d'un pixel) vers l'image 12, un clignement vers l'image 36 */
function frame(t){
  const g=new Uint8Array(N*N);
  const w=(t===7||t===9)?-1:0;if(w!==cfg.wiggle){cfg.wiggle=w;SP=spine();} /* la queue frétille deux fois juste avant le gloups */
  body(g,t);
  const NOD=(t>=11&&t<=15)?1:0,blink=t>=35&&t<=36;
  head(g,blink,NOD);return g;
}
function preview(frames,scale,cols,file){
  const rows=Math.ceil(frames.length/cols),W=cols*(N*scale+2),Hh=rows*(N*scale+2),rgb=new Uint8Array(W*Hh*3).fill(30);
  frames.forEach((g,k)=>{const ox=(k%cols)*(N*scale+2)+1,oy=Math.floor(k/cols)*(N*scale+2)+1;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const c=g[y*N+x],col=PAL[c];for(let sy=0;sy<scale;sy++)for(let sx=0;sx<scale;sx++){const p=((oy+y*scale+sy)*W+ox+x*scale+sx)*3;rgb[p]=col[0];rgb[p+1]=col[1];rgb[p+2]=col[2];}}});
  fs.writeFileSync(file,pngRGB(W,Hh,rgb));
}
function strip(frames,file){const W=N*frames.length,idx=new Uint8Array(W*N);frames.forEach((g,k)=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)idx[y*W+k*N+x]=g[y*N+x];});const png=pngIndexed(W,N,idx,PAL,ALPHA);fs.writeFileSync(file,png);return png;}
const frames=[];for(let t=0;t<F;t++)frames.push(frame(t));
process.chdir(__dirname);
preview(frames.slice(0,16),5,8,'planche-16-images.png');
preview([frames[0],frames[7],frames[13],frames[35]],12,4,'images-cles.png');
const png=strip(frames,'ouroboros-44px-48img.png'),b64=png.toString('base64');
/* LE CSS PUR (aucun JS) : la bande défile par pas, 12 images/s ; ×2 → 88 px ; chaque pixel reste net */
const SC=2,W=N*SC,TOT=N*F*SC;
const css=`#spCharge{position:absolute;left:50%;top:46%;width:${W}px;height:${W}px;margin:-${W/2}px 0 0 -${W/2}px;z-index:5;pointer-events:none;background:url("data:image/png;base64,${b64}") 0 0/${TOT}px ${W}px no-repeat;image-rendering:pixelated;image-rendering:crisp-edges;animation:spOuro ${F/12}s steps(${F}) infinite}@keyframes spOuro{to{background-position:-${TOT}px 0}}@media(prefers-reduced-motion:reduce){#spCharge{animation:none}}`;
fs.writeFileSync('ouroboros.css',css);
const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Ouroboros — chargement CASH CAR</title>
<style>@font-face{font-family:'Press Start 2P';src:url('../../VERSION%20PRINCIPALE/assets/fonts/pressstart2p.woff2') format('woff2')}
html,body{margin:0;height:100%;background:#000;overflow:hidden;font-family:'Press Start 2P',monospace;color:#fff}
#splash{position:fixed;inset:0;background:#000}
${css}
#spCharge{transform:scale(var(--z,1));transform-origin:50% 50%}
#leg{position:fixed;left:0;right:0;bottom:max(18px,env(safe-area-inset-bottom));text-align:center;font-size:8px;line-height:2;letter-spacing:1px;color:rgba(255,255,255,.38)}
#leg b{color:#fff;font-weight:normal}
</style></head><body><div id="splash"><div id="spCharge"></div></div>
<div id="leg">OUROBOROS · 44 px · 48 IMAGES · 12 IM/S · CSS PUR · ${(b64.length/1024).toFixed(1)} KO<br><b>?zoom=4</b> POUR VOIR LES PIXELS</div>
<script>const z=+new URLSearchParams(location.search).get('zoom');if(z>0)document.getElementById('spCharge').style.setProperty('--z',z);</script>
</body></html>`;
fs.writeFileSync('demo.html',html);
console.log('bande',png.length,'octets, base64',b64.length,'V=',V,'css',css.length);
