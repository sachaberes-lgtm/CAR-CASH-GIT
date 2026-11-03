/* ===== L'OUROBOROS DU CHARGEMENT (2026-11-03, Sacha : « un mini Ouroboros pixel, mignon, malicieux, qui se mord la queue ; il faut qu'on le voit TOURNER en se mangeant lui-même, en boucle ») =====
   Dessiné par Fable 5.1. `node outils/ouroboros/ouroboros.cjs` régénère tout dans ce dossier :
   - ouroboros-64px-48img.png : la bande de 48 images de 64 × 64 px (3 tons : noir, blanc, gris)
   - ouroboros.css : le bloc CSS pur à coller dans la page (data-URL de la bande, steps(48) à 20 images/s = 2,4 s par tour, affiché ×2)
   - demo.html : la page de démo (?zoom=3 pour voir les pixels) ; planche-16-images.png, tete-6-angles.png : des aperçus pour l'œil humain
   LE DESSIN : TOUT LE SERPENT TOURNE comme une roue, tête comprise : un tour complet par boucle (7,5° par image), la tête en avant, qui rattrape sa propre queue.
   Le corps est UN anneau dont la queue s'effile jusque dans la gueule ; la tête est dessinée à la main (`BASE`, `sprite()`) avec un visage fait de formes épaisses (`face()`) qui
   restent lisibles à tous les angles : œil rond mi-clos à paupière lourde, sourire en coin, petite dent, joue rose, un sourcil qui se lève une fois par tour, un clignement.
   IL SE MANGE : des bosses de corps (une toutes les 1,2 s) voyagent du cou à la gueule, qui les guette grande ouverte, puis CLAC (mâchoire, plongeon de la tête, miettes) ;
   les écailles tournent avec le corps et glissent vers la gueule, en rapetissant sur la queue amincie, comme digérées ; les tirets gris du ventre filent aussi.
   Trois étincelles scintillent autour (fixes à l'écran). Boucle parfaite : 48 images = 360°, 3 pas de 7 px de glissement, jeu de mâchoire sur 24 images (2 bouchées par tour). */
const fs=require('fs'),{pngIndexed,pngRGB}=require('./png.cjs');
const N=64,F=48,FPS=20,SS=4,CX=32,CY=32,R=16,TH=6.2,TIP=2.0,TAPER=40,PER=7,FLOW=3;
const DEG=Math.PI/180,TAU=Math.PI*2,smooth=k=>k*k*(3-2*k),clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const PAL=[[0,0,0],[255,255,255],[150,150,150]];
const MARGIN=[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,1]; /* la gueule sur 24 images : grande ouverte… CLAC (images 21-22) */
const HEAD=[21.5,13.5]; /* le centre de la tête, dans le repère du serpent (avant rotation) */
const BASE=[
'......#######.........',
'....###########.......',
'...###############....',
'..#################...',
'..##################..',
'.###################..',
'.####################.',
'.####################.',
'.####################.',
'.#####################',
'.#####################',
'.#####################',
'.#####################',
'..####################',
'..###################.',
'...#################..',
'.....##############...'];
/* la silhouette de la tête (1 blanc, 3 fente de la gueule) ; le visage est peint à part, au pixel */
function sprite(m){
  const S=BASE.map(r=>[...r].map(c=>c==='#'?1:0));const set=(c,r,v)=>{if(r>=0&&r<S.length&&c>=0&&c<S[0].length)S[r][c]=v;};
  for(let x=11;x<=21;x++){
    if(x<=12){set(x,11,3);set(x,12,3);continue;}
    const h=Math.min(m,Math.floor((x-11)/2));
    for(let r=11-h;r<=10;r++)if(S[r][x]||x===21)set(x,r,3);
    for(let r=13;r<=12+h;r++)if(S[r][x]||x===21)set(x,r,3);
    set(x,11,1);set(x,12,1);
  }
  return S;
}
/* le corps : l'anneau lui-même, de la gueule (s = 0, la queue) jusqu'au cou */
const A0=[HEAD[0]+13.5,HEAD[1]+3.5];
const P=[];{const add=(x,y)=>{P.push({x,y,s:P.length?P[P.length-1].s+Math.hypot(x-P[P.length-1].x,y-P[P.length-1].y):0});};
  const a0=Math.atan2(A0[0]-CX,-(A0[1]-CY));add(A0[0],A0[1]);for(let a=a0+.25/R;a<=TAU-30*DEG;a+=.25/R)add(CX+R*Math.sin(a),CY-R*Math.cos(a));}
const L=P[P.length-1].s;
const B=new Map(),key=(i,j)=>i*100+j;P.forEach((p,k)=>{const i=Math.floor(p.x/4),j=Math.floor(p.y/4),kk=key(i,j);if(!B.has(kk))B.set(kk,[]);B.get(kk).push(k);});
const near=(x,y)=>{let bk=-1,bd=1e9;const i=Math.floor(x/4),j=Math.floor(y/4);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=B.get(key(i+a,j+b));if(!l)continue;for(const k of l){const d=(x-P[k].x)**2+(y-P[k].y)**2;if(d<bd){bd=d;bk=k;}}}return [bk,Math.sqrt(bd)];};
const tw=s=>TIP+(TH-TIP)*smooth(clamp(s/TAPER,0,1));
function dseg(x,y,a,b,c,d){const px=x-a,py=y-b,dx=c-a,dy=d-b,t=clamp((px*dx+py*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(px-t*dx,py-t*dy);}
/* LE VISAGE : des formes dans le repère du dessin de la tête (u vers l'avant, v vers le bas), épaisseur ≥ 1,3 px ; rend 1 encre, 2 blanc, 3 gris, 0 rien */
function face(u,v,blink,brow,m){
  if(blink){if(dseg(u,v,10,7.8,15.2,7.8)<=.8)return 1;}
  else{
    if(Math.hypot(u-13.7,v-7.9)<=.85)return 2; /* le reflet */
    if(Math.hypot(u-12.4,v-7.9)<=2.75&&v>=5.7+.28*(u-12.4))return 1; /* l'œil rond, coupé en haut par une paupière en pente : mi-clos, malin */
    if(dseg(u,v,9.3,5.5,16.2,6.5)<=.85)return 1; /* la paupière lourde, qui déborde */
  }
  if(brow&&dseg(u,v,9.0,2.7+brow,14.6,3.9+brow)<=.75)return 1; /* le sourcil se lève (« hmm ? ») une fois par tour */
  if(dseg(u,v,10.8,11.5,9.5,10.2)<=.75||dseg(u,v,9.5,10.2,9.2,8.7)<=.75)return 1; /* le sourire en coin */
  if(m>=2&&Math.hypot(u-16.6,v-9.4)<=.9)return 2; /* la petite dent */
  if(Math.hypot(u-6.6,v-11.5)<=1.55)return 3; /* la joue */
  return 0;
}
const SPR={};for(const m of [0,1,2])SPR[m]=sprite(m);
function render(t){
  const c=t%24,m=MARGIN[c],ph=TAU*t/F,cp=Math.cos(ph),sp=Math.sin(ph);
  const Ph=[HEAD[0],HEAD[1]+((c===21||c===22)?1:0)]; /* la tête plonge d'un pixel au CLAC */
  const S=SPR[m];
  const toSnake=(x,y)=>{const dx=x-CX,dy=y-CY;return [CX+dx*cp+dy*sp,CY-dx*sp+dy*cp];}; /* de l'écran vers le serpent (rotation inverse) */
  const toScreen=(x,y)=>{const dx=x-CX,dy=y-CY;return [CX+dx*cp-dy*sp,CY+dx*sp+dy*cp];}; /* du serpent vers l'écran */
  const spr=(u,v)=>toScreen(Ph[0]+u-8.5,Ph[1]+v-8.5); /* un point du dessin de la tête, à l'écran */
  const lumpS=c<=21.5?(L-(L-10)*(c/21.5)):null;
  const SHIFT=FLOW*PER*t/F;
  const blink=t>=34&&t<=36,brow=(t>=6&&t<=13)?-.9:0;
  const g=new Uint8Array(N*N),own=new Uint8Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){let nF=0,nG=0,nK=0,nB=0,nW=0,nY=0;
    for(let sy=0;sy<SS;sy++)for(let sx=0;sx<SS;sx=sx+1){
      const [x,y]=toSnake(i+(sx+.5)/SS,j+(sy+.5)/SS);
      let body=false,belly=false;const [k,d]=near(x,y);
      if(k>=0){const p=P[k],w=tw(p.s)/2,rx=x-p.x,ry=y-p.y,outer=(rx*(p.x-CX)+ry*(p.y-CY))>0;
        const bump=(lumpS!==null&&outer)?2.1*Math.exp(-Math.pow((p.s-lumpS)/9,2)):0;
        if(d<=w+bump){body=true;if(!outer&&w>2.2&&d>w-1.2&&(((p.s+SHIFT+3.5)%PER)<PER*.62))belly=true;}}
      const u=Math.floor(x-Ph[0]+8.5),v=Math.floor(y-Ph[1]+8.5),cl=(u>=0&&u<22&&v>=0&&v<17)?S[v][u]:0;
      if(cl===1){nF++;}else if(cl===3){nK++;}else if(body){nF++;nB++;if(belly)nG++;}
      if(u>=0&&u<22&&v>=0&&v<17){const fu=x-Ph[0]+8.5,fv=y-Ph[1]+8.5,f=face(fu,fv,blink,brow,m);if(f===1)nK++;else if(f===2)nW++;else if(f===3)nY++;}
    }
    const q=j*N+i,T=SS*SS;if(nF/T>=.4){g[q]=(nG/nF>.5||nY/nF>.45)?2:1;if(nB>nF/2)own[q]=1;}if(nK/T>=.4)g[q]=0;if(nW/T>=.4)g[q]=1;
  }
  /* les écailles : carrés noirs posés sur le dos, qui tournent AVEC le corps et glissent doucement vers la gueule ; elles rapetissent sur la queue amincie (digérées) */
  const LL=PER*Math.ceil(L/PER);
  for(let q=-1;q*PER<L+PER;q++){
    const ss=(((q*PER+PER/2-SHIFT)%LL)+LL)%LL;if(ss>L)continue;let k=0;while(k<P.length-1&&P[k].s<ss)k++;
    const p=P[k],w=tw(p.s);if(w<3.6)continue;
    const nx=p.x-CX,ny=p.y-CY,nl=Math.hypot(nx,ny)||1,[ox,oy]=toScreen(p.x+nx/nl*.9,p.y+ny/nl*.9),cx=Math.round(ox),cy=Math.round(oy);
    const big=w>=5.6,x0=big?cx-1:cx,y0=big?cy-1:cy,sz=big?2:1;
    let ok=true;for(let y=y0;y<y0+sz;y++)for(let x=x0;x<x0+sz;x++){const z=y*N+x;if(!(g[z]===1&&own[z]))ok=false;}
    if(ok)for(let y=y0;y<y0+sz;y++)for(let x=x0;x<x0+sz;x++)g[y*N+x]=0;
  }
    /* étincelles (fixes à l'écran) et miettes (au CLAC, qui tournent avec le serpent) */
  const px=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<N&&y<N&&g[y*N+x]===0&&!own[y*N+x])g[y*N+x]=1;};
  for(const [x,y,t0] of [[7,9,4],[57,56,20],[58,12,35]]){const k=(t-t0+F)%F;if(k>4)continue;
    px(x,y);if(k===1||k===3){px(x-1,y);px(x+1,y);px(x,y-1);px(x,y+1);}if(k===2){for(let d=1;d<=2;d++){px(x-d,y);px(x+d,y);px(x,y-d);px(x,y+d);}}}
  const cr=c>=21&&c<=23?c-21:-1;if(cr>=0)for(const [dx,dy] of [[[1,-3],[4,-1]],[[2,-5],[6,-3]],[[3,-8],[8,-5]]][cr]){const [x,y]=toScreen(A0[0]+dx,A0[1]+dy-1);px(x,y);}
  return {g,Ph};
}
function sheet(frames,scale,cols,file){const rows=Math.ceil(frames.length/cols),W=cols*(N*scale+2),H=rows*(N*scale+2),rgb=new Uint8Array(W*H*3).fill(40);
  frames.forEach((g,k)=>{const ox=(k%cols)*(N*scale+2)+1,oy=Math.floor(k/cols)*(N*scale+2)+1;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const col=PAL[g[y*N+x]];for(let sy=0;sy<scale;sy++)for(let sx=0;sx<scale;sx++){const p=((oy+y*scale+sy)*W+ox+x*scale+sx)*3;rgb[p]=col[0];rgb[p+1]=col[1];rgb[p+2]=col[2];}}});
  fs.writeFileSync(file,pngRGB(W,H,rgb));}
function strip(frames,file){const W=N*frames.length,idx=new Uint8Array(W*N);frames.forEach((g,k)=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)idx[y*W+k*N+x]=g[y*N+x];});const png=pngIndexed(W,N,idx,PAL);fs.writeFileSync(file,png);return png;}
function headCrop(ts,half,sc,file){const w=half*2,cw=w*sc+3,W=ts.length*cw,H=cw,rgb=new Uint8Array(W*H*3).fill(45);
  ts.forEach((t,k)=>{const {g}=render(t),ph=TAU*t/F,dx=HEAD[0]-CX,dy=HEAD[1]-CY,cx=CX+dx*Math.cos(ph)-dy*Math.sin(ph),cy=CY+dx*Math.sin(ph)+dy*Math.cos(ph),x0=Math.round(cx-half),y0=Math.round(cy-half);
    for(let y=0;y<w;y++)for(let x=0;x<w;x++){const gx=x0+x,gy=y0+y,c=(gx<0||gy<0||gx>=N||gy>=N)?PAL[0]:PAL[g[gy*N+gx]];
      for(let a=0;a<sc;a++)for(let b=0;b<sc;b++){const p=((1+y*sc+a)*W+k*cw+1+x*sc+b)*3,e=(a===0||b===0);rgb[p]=e?58:c[0];rgb[p+1]=e?58:c[1];rgb[p+2]=e?58:c[2];}}});
  fs.writeFileSync(file,pngRGB(W,H,rgb));}
module.exports={render,sheet,strip,headCrop,N,F,FPS,PAL};
if(require.main===module){
  process.chdir(__dirname);
  const fr=[];for(let t=0;t<F;t++)fr.push(render(t).g);
  sheet(fr.filter((_,k)=>k%3===0),4,8,'planche-16-images.png');headCrop([0,6,12,18,24,30],15,10,'tete-6-angles.png');
  let clip=0;for(const g of fr)for(let i=0;i<N;i++)if(g[i]||g[(N-1)*N+i]||g[i*N]||g[i*N+N-1])clip++;
  const png=strip(fr,'ouroboros-64px-48img.png'),b64=png.toString('base64');
  /* LE CSS PUR : aucun JS, visible dès la première image. La bande défile par pas (steps) sur un transform : le compositeur la joue même quand le script du jeu est occupé à construire la scène. */
  const SCALE=2,D=N*SCALE,TOT=D*F;
  const css=`#spCharge{position:absolute;left:50%;top:46%;width:${D}px;height:${D}px;margin:-${D/2}px 0 0 -${D/2}px;z-index:5;pointer-events:none;overflow:hidden;contain:strict}#spCharge::before{content:"";position:absolute;left:0;top:0;width:${TOT}px;height:${D}px;background:url("data:image/png;base64,${b64}") 0 0/100% 100% no-repeat;image-rendering:pixelated;image-rendering:crisp-edges;animation:spOuro ${F/FPS}s steps(${F}) infinite;will-change:transform}@keyframes spOuro{to{transform:translate3d(-100%,0,0)}}@media(prefers-reduced-motion:reduce){#spCharge::before{animation:none}}`;
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
<div id="leg">OUROBOROS · ${N} PX · ${F} IMAGES · ${FPS} IM/S · CSS PUR · ${(b64.length/1024).toFixed(1)} KO<br><b>?zoom=3</b> POUR VOIR LES PIXELS</div>
<script>const z=+new URLSearchParams(location.search).get('zoom');if(z>0)document.getElementById('spCharge').style.setProperty('--z',z);</script>
</body></html>`;
  fs.writeFileSync('demo.html',html);
  console.log('bande',png.length,'octets · css',css.length,'octets · pixels allumés sur le bord :',clip);
}
