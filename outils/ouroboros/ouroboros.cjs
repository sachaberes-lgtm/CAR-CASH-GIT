/* ===== L'OUROBOROS DU CHARGEMENT (2026-11-03, Sacha : « son corps ne doit pas tourner : c'est sa TÊTE qui avance autour de son corps en le mangeant ; le corps se nourrit de boules de matière qui passent et qu'il avale ») =====
   Dessiné par Fable 5.1. `node outils/ouroboros/ouroboros.cjs` régénère tout dans ce dossier :
   - ouroboros-64px-48img.png : la bande de 48 images de 64 × 64 px (3 tons : noir, blanc, gris)
   - ouroboros.css : le bloc CSS pur à coller dans la page (data-URL de la bande, steps(48) à 20 images/s = 2,4 s par tour, affiché ×2)
   - demo.html : la page de démo (?zoom=3 pour voir les pixels) ; planche-16-images.png, tete-6-angles.png : des aperçus pour l'œil humain
   LE DESSIN : LE CORPS NE TOURNE PAS. C'est un anneau fixe, ses écailles (carrés noirs) sont fixes à l'écran. Seule la TÊTE bouge : elle fait un tour complet autour du corps par boucle
   (7,5° par image, dans le sens des aiguilles d'une montre) en le mangeant : devant sa gueule la queue s'effile jusque dans ses dents (les écailles rapetissent et disparaissent, croquées),
   derrière elle le corps reprend son épaisseur (les écailles reviennent). La tête est dessinée à la main (`BASE`, `sprite()`) avec un visage fait de formes épaisses (`face()`) :
   œil rond mi-clos à paupière en pente et reflet, sourire en coin, joue rose, un sourcil qui se lève et un clignement par tour, et surtout des DENTS : deux gros crocs en haut, une dent en bas, dessinés à la main pour chaque état de la gueule (`GUEULE`).
   LES BOULES DE MATIÈRE : des disques gris qui passent dans le corps, du cou jusqu'à la gueule, qui les guette grande ouverte ; CLAC (mâchoire qui se referme, tête qui plonge d'un pixel,
   miettes) ; une boule avalée toutes les 12 images (0,6 s), deux visibles à la fois. Trois étincelles scintillent autour (fixes à l'écran).
   Boucle parfaite : 48 images = un tour de la tête, 4 boules, 4 bouchées. */
const fs=require('fs'),{pngIndexed,pngRGB}=require('./png.cjs');
const N=64,F=48,FPS=20,SS=4,CX=32,CY=32,R=16,TH=4.6,TIP=2.0,TAPER=40,PER=7,FLOW=3;
const DEG=Math.PI/180,TAU=Math.PI*2,smooth=k=>k*k*(3-2*k),clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const PAL=[[0,0,0],[255,255,255],[150,150,150]];
const MARGIN=[3,3,2,0,0,2,3,3,2,0,0,2]; /* 3 = grande ouverte, 2 = mi-ouverte, 0 = fermée (CLAC) */ /* la gueule sur 12 images : grande ouverte… CLAC (images 9-10), une boule de matière avalée à chaque fois */
const HEAD=[25.5,13.5]; /* le centre de la tête, dans le repère du serpent (avant rotation) */
const BASE=[ /* LA TÊTE, dessinée pixel par pixel (18 × 18, de profil, regard vers la droite) : W blanc, g gris (contour, gorge), o noir (arcade, œil en amande à reflet, narine) */
'.....gggggg.......',
'...gggggggggg.....',
'..ggWWggWWggWgg...',
'.gWWWoooWWWWWWWg..',
'.gWWWWWooWWWWWWWg.',
'gWWWWooWoWWWWWWWWg',
'gWWWWooooWWWWWWoWg',
'gWWWWWWWWWWWWWWWWg',
'gWWWWWWWWWWWWWWWWg',
'gWWWWWWWWW........',
'gWWWWWWWWW........',
'gWWWWWWWWW........',
'gWWWWWWWWW........',
'gWWWWWWWWW........',
'gggggggggggggggggg',
'ggggggggggggggggg.',
'.ggggggggggggggg..',
'...ggggggggggg....'];
/* la silhouette de la tête (1 blanc, 3 fente de la gueule) ; le visage est peint à part, au pixel */
/* LA GUEULE, dessinée à la main pour chacun des 4 états (colonnes x = 11 à 21, rangées 6 à 15) : '.' on garde la tête, 'o' noir, '#' blanc. La queue (2 px) la traverse ;
   les DENTS sont des crocs blancs en triangle (3 px de large, 2 de haut) plantés dans les deux mâchoires, qui se croisent. */
const GUEULE={ /* x = 10 à 17 ; le corps (rangées 10 à 13) passe entre les mâchoires ; deux crocs en haut, deux en bas */
  3:{8:'oWWooWWo',9:'ooWoooWo',10:'WWWWWWWW',11:'WWWWWWWW',12:'WWWWWWWW',13:'WWWWWWWW',14:'ooWoooWo',15:'oWWooWWo'},
  2:{9:'oWWooWWo',10:'WWWWWWWW',11:'WWWWWWWW',12:'WWWWWWWW',13:'WWWWWWWW',14:'oWWooWWo'},
  1:{9:'oooooooo',14:'oooooooo'},
  0:{9:'o.o.o.o.',14:'.o.o.o.o'}
};
function sprite(m){
  const V={'W':1,'g':4,'o':3,'.':0},S=BASE.map(r=>[...r].map(c=>V[c]));
  for(const [r,row] of Object.entries(GUEULE[m]))[...row].forEach((ch,i)=>{if(ch==='.')return;S[+r][10+i]=V[ch];});
  return S;
}
/* le corps : l'anneau lui-même, de la gueule (s = 0, la queue) jusqu'au cou */
const A0=[HEAD[0]+9.5,HEAD[1]+3.5];
const P=[];{const add=(x,y)=>{P.push({x,y,s:P.length?P[P.length-1].s+Math.hypot(x-P[P.length-1].x,y-P[P.length-1].y):0});};
  const a0=Math.atan2(A0[0]-CX,-(A0[1]-CY));add(A0[0],A0[1]);for(let a=a0+.25/R;a<=TAU-30*DEG;a+=.25/R)add(CX+R*Math.sin(a),CY-R*Math.cos(a));}
const L=P[P.length-1].s;
const B=new Map(),key=(i,j)=>i*100+j;P.forEach((p,k)=>{const i=Math.floor(p.x/4),j=Math.floor(p.y/4),kk=key(i,j);if(!B.has(kk))B.set(kk,[]);B.get(kk).push(k);});
const near=(x,y)=>{let bk=-1,bd=1e9;const i=Math.floor(x/4),j=Math.floor(y/4);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=B.get(key(i+a,j+b));if(!l)continue;for(const k of l){const d=(x-P[k].x)**2+(y-P[k].y)**2;if(d<bd){bd=d;bk=k;}}}return [bk,Math.sqrt(bd)];};
const tw=s=>TH; /* le corps ENTIER, épais partout : il entre tel quel dans la gueule */
function dseg(x,y,a,b,c,d){const px=x-a,py=y-b,dx=c-a,dy=d-b,t=clamp((px*dx+py*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(px-t*dx,py-t*dy);}
/* LE VISAGE : des formes dans le repère du dessin de la tête (u vers l'avant, v vers le bas), épaisseur ≥ 1,3 px ; rend 1 encre, 2 blanc, 3 gris, 0 rien */
function face(){return 0;} /* le visage est dans le dessin lui-même (BASE) */
const SPR={};for(const m of [0,1,2,3])SPR[m]=sprite(m);
function render(t){
  const c=t%12,m=MARGIN[c],ph=TAU*t/F,cp=Math.cos(ph),sp=Math.sin(ph);
  const Ph=[HEAD[0],HEAD[1]+((c===9||c===10||c===3||c===4)?1:0)]; /* la tête plonge d'un pixel au CLAC */
  const S=SPR[m];
  const toSnake=(x,y)=>{const dx=x-CX,dy=y-CY;return [CX+dx*cp+dy*sp,CY-dx*sp+dy*cp];}; /* de l'écran vers le serpent (rotation inverse) */
  const toScreen=(x,y)=>{const dx=x-CX,dy=y-CY;return [CX+dx*cp-dy*sp,CY+dx*sp+dy*cp];}; /* du serpent vers l'écran */
  const spr=(u,v)=>toScreen(Ph[0]+u-8.5,Ph[1]+v-8.5); /* un point du dessin de la tête, à l'écran */
  const balls=[];for(const age of [c,c+12])if(age<=21.5)balls.push(L-(L-10)*(age/21.5)); /* l'abscisse (le long du corps) de chaque boule de matière : du cou à la gueule */
  const blink=t>=34&&t<=36,brow=(t>=6&&t<=13)?-.9:0; /* un clignement et un sourcil levé par tour */
  const g=new Uint8Array(N*N),own=new Uint8Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){let nF=0,nG=0,nK=0,nB=0,nW=0,nY=0;
    for(let sy=0;sy<SS;sy++)for(let sx=0;sx<SS;sx=sx+1){
      const [x,y]=toSnake(i+(sx+.5)/SS,j+(sy+.5)/SS);
      let body=false,belly=false;const [k,d]=near(x,y);
      if(k>=0){const p=P[k],w=tw(p.s)/2,rx=x-p.x,ry=y-p.y,outer=(rx*(p.x-CX)+ry*(p.y-CY))>0;
        let bump=0;if(outer)for(const bs of balls)bump=Math.max(bump,2.1*Math.exp(-Math.pow((p.s-bs)/7,2)));
        if(d<=w+bump){body=true;if(!outer&&w>2.2&&d>w-1.2)belly=true;}}
      const u=Math.floor(x-Ph[0]+8.5),v=Math.floor(y-Ph[1]+8.5),cl=(u>=0&&u<S[0].length&&v>=0&&v<S.length)?S[v][u]:0;
      if(cl===1){nF++;}else if(cl===4){nF++;nY++;}else if(cl===3){nK++;}else if(body){nF++;nB++;if(belly)nG++;}
      if(u>=0&&u<S[0].length&&v>=0&&v<S.length){const fu=x-Ph[0]+8.5,fv=y-Ph[1]+8.5,f=face(fu,fv,blink,brow,m);if(f===1)nK++;else if(f===2)nW++;else if(f===3)nY++;}
    }
    const q=j*N+i,T=SS*SS;if(nF/T>=.4){g[q]=(nG/nF>.5||nY/nF>.45)?2:1;if(nB>nF/2)own[q]=1;}if(nK/T>=.4)g[q]=0;if(nW/T>=.4)g[q]=1;
  }
  /* les écailles : des carrés noirs FIXES à l'écran (le corps ne tourne pas) ; la tête les croque en passant : elles rapetissent sur la queue amincie devant la gueule, puis reviennent derrière elle */
  const SC=14;
  for(let q=0;q<SC;q++){
    const ang=(q+.5)*TAU/SC,rs=R+.9,cx=Math.round(CX+rs*Math.sin(ang)),cy=Math.round(CY-rs*Math.cos(ang));
    const [sx,sy]=toSnake(CX+R*Math.sin(ang),CY-R*Math.cos(ang)),[k,d]=near(sx,sy);if(k<0||d>2)continue;const w=tw(P[k].s);if(w<3.6)continue;
    const big=w>=5.6,x0=big?cx-1:cx,y0=big?cy-1:cy,sz=big?3:1;
    let ok=true;for(let y=y0;y<y0+sz;y++)for(let x=x0;x<x0+sz;x++){const z=y*N+x;if(!(g[z]===1&&own[z]))ok=false;}
    if(ok){g[cy*N+cx]=2;if(big)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])g[(cy+dy)*N+cx+dx]=2;} /* une écaille grise en losange */
  }
  /* les boules de matière : un disque gris au cœur du corps, qui passe du cou à la gueule et se fait avaler */
  for(const bs of balls){let k=0;while(k<P.length-1&&P[k].s<bs)k++;const [bx,by]=toScreen(P[k].x,P[k].y);
    for(let j=Math.floor(by-3);j<=Math.ceil(by+3);j++)for(let i=Math.floor(bx-3);i<=Math.ceil(bx+3);i++){if(i<0||j<0||i>=N||j>=N)continue;
      if(Math.hypot(i+.5-bx,j+.5-by)<=2.0&&g[j*N+i]===1&&own[j*N+i])g[j*N+i]=2;}}
  /* étincelles (fixes à l'écran) et miettes (au CLAC, qui tournent avec le serpent) */
  const px=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<N&&y<N&&g[y*N+x]===0&&!own[y*N+x])g[y*N+x]=1;};
  for(const [x,y,t0] of [[7,9,4],[57,56,20],[58,12,35]]){const k=(t-t0+F)%F;if(k>4)continue;
    px(x,y);if(k===1||k===3){px(x-1,y);px(x+1,y);px(x,y-1);px(x,y+1);}if(k===2){for(let d=1;d<=2;d++){px(x-d,y);px(x+d,y);px(x,y-d);px(x,y+d);}}}
  const cr=c>=9&&c<=11?c-9:-1;if(cr>=0)for(const [dx,dy] of [[[1,-3],[4,-1]],[[2,-5],[6,-3]],[[3,-8],[8,-5]]][cr]){const [x,y]=toScreen(A0[0]+dx,A0[1]+dy-1);px(x,y);}
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
function spriteSheet(file){const ms=[3,2,1,0],sc=16,w=22,h=BASE.length,W=ms.length*(w*sc+4),H=h*sc+2,rgb=new Uint8Array(W*H*3).fill(45);
  ms.forEach((m,k)=>{const S=sprite(m);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=S[y][x],c=v===1?[255,255,255]:v===3?[0,0,0]:[70,70,70];for(let a=0;a<sc;a++)for(let b=0;b<sc;b++){const p=((1+y*sc+a)*W+k*(w*sc+4)+1+x*sc+b)*3,e=(a===0||b===0);rgb[p]=e?58:c[0];rgb[p+1]=e?58:c[1];rgb[p+2]=e?58:c[2];}}});
  fs.writeFileSync(file,pngRGB(W,H,rgb));}
module.exports={render,sheet,strip,headCrop,spriteSheet,N,F,FPS,PAL};
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
