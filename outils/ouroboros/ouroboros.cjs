/* ===== L'OUROBOROS DU CHARGEMENT (2026-11-03, Sacha : « un mini Ouroboros pixel, mignon, malicieux, qui se mord la queue ; qu'on le voie tourner et se manger son propre corps en boucle ») =====
   Dessiné par Fable 5.1. `node outils/ouroboros/ouroboros.cjs` régénère tout dans ce dossier :
   - ouroboros-56px-48img.png : la bande de 48 images de 56 × 56 px (3 tons : noir, blanc, gris), 3,9 Ko
   - ouroboros.css : le bloc CSS pur à coller dans la page (data-URL de la bande, steps(48) à 16 images/s = 3 s, affiché ×2)
   - demo.html : la page de démo (?zoom=4 pour voir les pixels) ; planche-16-images.png, tete-4-images.png : des aperçus
   LE DESSIN : la tête est dessinée À LA MAIN (`BASE` + `sprite()`, regard vers la droite) : œil rond à paupière lourde, sourcil en pente, sourire en coin, joue rose, petite dent.
   Le corps est UN anneau dont la queue s'effile jusque dans la gueule. Il TOURNE sans bouger : les écailles (carrés noirs, 1 pas de 7 px tous les 1/9 de boucle) et les tirets
   gris du ventre FILENT le long du corps vers la gueule, des BOSSES de corps (une toutes les 1,5 s) voyagent du cou à la gueule et se font croquer (CLAC : la mâchoire se
   referme, la tête plonge d'un pixel, des miettes jaillissent) ; les écailles rapetissent sur la queue amincie, comme digérées. Un clignement et un sourcil levé par tour,
   trois étincelles. La boucle est parfaite : 9 pas de 7 px par boucle, jeu de mâchoire sur 24 images (2 bouchées par boucle). */
const fs=require('fs'),{pngIndexed,pngRGB}=require('./png.cjs');
const N=56,F=48,FPS=16,SS=4,CX=28,CY=32,R=16,TH=6.2,TIP=2.0,TAPER=40;
const DEG=Math.PI/180,TAU=Math.PI*2;
const smooth=k=>k*k*(3-2*k),clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const PAL=[[0,0,0],[255,255,255],[150,150,150]];
const MARGIN=[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,1]; /* la gueule sur 24 images : grande ouverte… CLAC (images 21-22) */
/* ---------- LA TÊTE, dessinée à la main (regard vers la droite, l'œil au-dessus) ---------- */
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
function sprite(m,blink,brow){
  const S=BASE.map(r=>[...r].map(c=>c==='#'?1:0));
  const set=(c,r,v)=>{if(r>=0&&r<S.length&&c>=0&&c<S[0].length)S[r][c]=v;};
  /* la gueule : une fente noire, la queue (2 px, blanche) la traverse ; le coin remonte en sourire en coin */
  for(let x=11;x<=21;x++){
    if(x<=12){set(x,11,3);set(x,12,3);continue;}
    const h=Math.min(m,Math.floor((x-11)/2));
    for(let r=11-h;r<=10;r++)if(S[r][x]||x===21)set(x,r,3);
    for(let r=13;r<=12+h;r++)if(S[r][x]||x===21)set(x,r,3);
    set(x,11,1);set(x,12,1);
  }
  if(m>=2)set(16,9,1); /* la petite dent, qui pend de la mâchoire du haut */
  set(10,11,3);set(9,10,3);set(9,9,3); /* le sourire en coin, qui remonte sur la joue */
  for(const [c,r] of [[6,10],[7,10],[6,11],[7,11]])set(c,r,2); /* la joue rose */
  set(18,7,3); /* la narine */
  /* le sourcil : une seule ligne, qui descend vers le museau (un seul sourcil qui se lève : « hmm ? ») ; l'œil rond à paupière lourde, deux reflets */
  const bu=brow?-1:0;
  for(const [c,r] of [[8,2],[9,2],[10,2],[11,3],[12,3],[13,3]])set(c,r+bu,3);
  if(!blink){
    for(const c of [9,10,11,12,13,14,15])set(c,5,3);
    for(const r of [6,7,8])for(const c of [10,11,12,13,14])set(c,r,3);
    for(const c of [11,12,13])set(c,9,3);
    set(12,6,1);set(13,6,1);
  }else{for(const c of [9,10,11,12,13,14,15])set(c,7,3);}
  return S;
}
/* ---------- le corps : l'anneau lui-même, de la gueule (s = 0, la queue) jusqu'au cou ---------- */
const HEAD=[17.5,12.5]; /* la tête : fixe, posée AU-DESSUS de l'anneau (le milieu de sa gueule est SUR l'anneau), regard vers la droite */
function spine(A){ /* la queue = l'anneau lui-même, de la gueule jusqu'au cou, dans le sens des aiguilles d'une montre */
  const P=[];const add=(x,y)=>{P.push({x,y,s:P.length?P[P.length-1].s+Math.hypot(x-P[P.length-1].x,y-P[P.length-1].y):0});};
  const a0=Math.atan2(A[0]-CX,-(A[1]-CY));add(A[0],A[1]);
  for(let a=a0+.25/R;a<=TAU-30*DEG;a+=.25/R)add(CX+R*Math.sin(a),CY-R*Math.cos(a));
  return P;
}
/* ---------- une image ---------- */
function render(t){
  const PER=7,SHIFT=9*PER*t/F; /* la matière file vers la gueule : 9 pas de 7 px par boucle */
  const c=t%24,m=MARGIN[c],Ph=[HEAD[0],HEAD[1]+((c===21||c===22)?1:0)]; /* la tête plonge d'un pixel au CLAC */
  const A=[Ph[0]+13.5,Ph[1]+3.5]; /* le fond de la gueule : là où la queue entre */
  const P=spine(A),L=P[P.length-1].s;
  /* seau spatial pour la recherche du point le plus proche */
  const B=new Map(),key=(i,j)=>i*100+j;P.forEach((p,k)=>{const i=Math.floor(p.x/4),j=Math.floor(p.y/4),kk=key(i,j);if(!B.has(kk))B.set(kk,[]);B.get(kk).push(k);});
  const near=(x,y)=>{let bk=-1,bd=1e9;const i=Math.floor(x/4),j=Math.floor(y/4);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=B.get(key(i+a,j+b));if(!l)continue;for(const k of l){const d=(x-P[k].x)**2+(y-P[k].y)**2;if(d<bd){bd=d;bk=k;}}}return [bk,Math.sqrt(bd)];};
  const lumpS=c<=21.5?(L-(L-10)*(c/21.5)):null; /* la bosse : un morceau de corps qui va du cou à la gueule */
  const tw=s=>TIP+(TH-TIP)*smooth(clamp(s/TAPER,0,1));
  const g=new Uint8Array(N*N),cnt=new Uint8Array(N*N*2);
  const own=new Uint8Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){let nF=0,nG=0;
    for(let sy=0;sy<SS;sy++)for(let sx=0;sx<SS;sx++){
      const x=i+(sx+.5)/SS,y=j+(sy+.5)/SS,[k,d]=near(x,y);if(k<0)continue;
      const p=P[k],w=tw(p.s)/2,rx=x-p.x,ry=y-p.y,outer=(rx*(p.x-CX)+ry*(p.y-CY))>0;
      const bump=(lumpS!==null&&outer)?2.1*Math.exp(-Math.pow((p.s-lumpS)/9,2)):0;
      if(d<=w+bump){nF++;if(!outer&&w>2.2&&d>w-1.2&&(((p.s+SHIFT+3.5)%PER)<PER*.62))nG++;} /* le ventre : des tirets gris qui filent eux aussi vers la gueule */
    }
    const q=j*N+i;if(nF/SS/SS>=.4){g[q]=(nG/nF>.5)?2:1;own[q]=1;}
  }
  /* les écailles : des carrés noirs posés sur le dos, qui FILENT le long du corps vers la gueule (un tour de 63 px par boucle) ; elles rapetissent sur la queue amincie, comme digérées */
  for(let q=-1;q*PER<L+PER;q++){
    const sT=q*PER+PER/2-SHIFT+9*PER*0,ss=((sT%(PER*Math.ceil(L/PER)))+PER*Math.ceil(L/PER))%(PER*Math.ceil(L/PER));
    if(ss>L)continue;let k=0;while(k<P.length-1&&P[k].s<ss)k++;
    const p=P[k],w=tw(p.s);if(w<3.6)continue;
    const nx=(p.x-CX),ny=(p.y-CY),nl=Math.hypot(nx,ny)||1,ox=p.x+nx/nl*.9,oy=p.y+ny/nl*.9,cx=Math.round(ox),cy=Math.round(oy);
    const big=w>=5.6,x0=big?cx-1:cx,y0=big?cy-1:cy,sz=big?2:1;
    let ok=true;for(let y=y0;y<y0+sz;y++)for(let x=x0;x<x0+sz;x++){const z=y*N+x;if(!(g[z]===1&&own[z]))ok=false;}
    if(ok)for(let y=y0;y<y0+sz;y++)for(let x=x0;x<x0+sz;x++)g[y*N+x]=0;
  }
  /* la tête : le sprite dessiné à la main, tourné par pas de 45° (vote sur 4×4 sous-pixels, exact aux multiples de 90°) */
  const S=sprite(m,t>=34&&t<=36,(t>=6&&t<=13));
  for(let j=Math.floor(Ph[1]-16);j<=Math.floor(Ph[1]+16);j++)for(let i=Math.floor(Ph[0]-16);i<=Math.floor(Ph[0]+16);i++){
    if(i<0||j<0||i>=N||j>=N)continue;let nT=0,nW=0,nG=0,nK=0;
    for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++){
      const dx=i+(sx+.5)/4-Ph[0],dy=j+(sy+.5)/4-Ph[1],u=dx+8.5,v=dy+8.5,cc=Math.floor(u),rr=Math.floor(v);
      const k=(rr>=0&&rr<S.length&&cc>=0&&cc<S[0].length)?S[rr][cc]:0;if(k===0)nT++;else if(k===1)nW++;else if(k===2)nG++;else nK++;}
    if(16-nT<7)continue;
    g[j*N+i]=(nK>=5)?0:(nG>=6)?2:1;
  }
  /* les petits plus : trois étincelles qui scintillent autour (un point, une croix, une grande croix, une croix, un point) ; et des miettes qui jaillissent de la gueule au CLAC */
  const px=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<N&&y<N&&g[y*N+x]===0&&!own[y*N+x])g[y*N+x]=1;};
  for(const [x,y,t0] of [[46,10,4],[6,49,20],[50,47,35]]){const k=(t-t0+F)%F;if(k>4)continue;
    px(x,y);if(k===1||k===3){px(x-1,y);px(x+1,y);px(x,y-1);px(x,y+1);}if(k===2){for(let d=1;d<=2;d++){px(x-d,y);px(x+d,y);px(x,y-d);px(x,y+d);}}}
  const cr=c>=21&&c<=23?c-21:-1;if(cr>=0){const [ax,ay]=A;for(const [dx,dy] of [[[1,-3],[4,-1]],[[2,-5],[6,-3]],[[3,-8],[8,-5]]][cr])px(ax+dx,ay+dy-1);}
  return {g,Ph};
}
function sheet(frames,scale,cols,file){const rows=Math.ceil(frames.length/cols),W=cols*(N*scale+2),H=rows*(N*scale+2),rgb=new Uint8Array(W*H*3).fill(40);
  frames.forEach((g,k)=>{const ox=(k%cols)*(N*scale+2)+1,oy=Math.floor(k/cols)*(N*scale+2)+1;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const col=PAL[g[y*N+x]];for(let sy=0;sy<scale;sy++)for(let sx=0;sx<scale;sx++){const p=((oy+y*scale+sy)*W+ox+x*scale+sx)*3;rgb[p]=col[0];rgb[p+1]=col[1];rgb[p+2]=col[2];}}});
  fs.writeFileSync(file,pngRGB(W,H,rgb));}
function headSheet(ts,half,sc,file,cols){const w=half*2,cl=cols||ts.length,rows=Math.ceil(ts.length/cl),cw=w*sc+3,W=cl*cw,H=rows*cw,rgb=new Uint8Array(W*H*3).fill(45);
  ts.forEach((t,k)=>{const {g,Ph}=render(t),x0=Math.floor(Ph[0]-half),y0=Math.floor(Ph[1]-half),ox=(k%cl)*cw,oy=Math.floor(k/cl)*cw;
    for(let y=0;y<w;y++)for(let x=0;x<w;x++){const gx=x0+x,gy=y0+y,c=(gx<0||gy<0||gx>=N||gy>=N)?PAL[0]:PAL[g[gy*N+gx]];
      for(let a=0;a<sc;a++)for(let b=0;b<sc;b++){const p=((oy+1+y*sc+a)*W+ox+1+x*sc+b)*3,e=(a===0||b===0);rgb[p]=e?58:c[0];rgb[p+1]=e?58:c[1];rgb[p+2]=e?58:c[2];}}});
  fs.writeFileSync(file,pngRGB(W,H,rgb));}
function strip(frames,file){const W=N*frames.length,idx=new Uint8Array(W*N);frames.forEach((g,k)=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)idx[y*W+k*N+x]=g[y*N+x];});const png=pngIndexed(W,N,idx,PAL);fs.writeFileSync(file,png);return png;}
module.exports={render,sheet,headSheet,strip,sprite,N,F,FPS,PAL};
if(require.main===module){
  process.chdir(__dirname);
  const fr=[];for(let t=0;t<F;t++)fr.push(render(t).g);
  sheet(fr.filter((_,k)=>k%3===0),4,8,'planche-16-images.png');
  headSheet([0,12,21,35],14,9,'tete-4-images.png',4);
  const png=strip(fr,'ouroboros-56px-48img.png'),b64=png.toString('base64');
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
<div id="leg">OUROBOROS · ${N} PX · ${F} IMAGES · ${FPS} IM/S · CSS PUR · ${(b64.length/1024).toFixed(1)} KO<br><b>?zoom=4</b> POUR VOIR LES PIXELS</div>
<script>const z=+new URLSearchParams(location.search).get('zoom');if(z>0)document.getElementById('spCharge').style.setProperty('--z',z);</script>
</body></html>`;
  fs.writeFileSync('demo.html',html);
  console.log('bande',png.length,'octets · css',css.length,'octets');
}
