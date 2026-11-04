/* ===== L'OUROBOROS DU CHARGEMENT, EN MODE SNAKE (2026-11-04, Sacha : « fais-le plus en mode Snake, Snake Google, les jeux vidéo, la culture populaire ; fais le plus beau ») =====
   Dessiné par Fable 5.1. `node outils/ouroboros/ouroboros.cjs` régénère tout dans ce dossier :
   - ouroboros-79px-48img.png : la bande de 48 images de 79 × 79 px (3 tons : noir, blanc, gris), 5 Ko
   - ouroboros.css : le bloc CSS pur à coller dans la page (data-URL de la bande, steps(48) à 16 images/s = 3 s par tour, affiché ×2)
   - demo.html : la démo (?zoom=3 pour voir les pixels) ; planche-16-images.png, tete-4-images.png : des aperçus pour l'œil humain
   LE DESSIN : un SNAKE. Un anneau de 24 segments carrés arrondis (7 × 7 cases de 10 px : segment de 9 px, joint noir d'un pixel, relief gris en bas et à droite), comme sur un Nokia.
   LE CORPS NE BOUGE PAS. Seule la TÊTE avance, d'un demi-segment par image, autour de l'anneau : elle croque les segments devant elle et ils repoussent derrière elle (la « fenêtre »
   `hidden()` : tout ce qui est à moins de 10 px de la tête est caché). Tête ronde à deux gros yeux noirs à reflet (Google Snake) ; la gueule s'ouvre une image sur deux (CLAC !) sur une grande
   bouche noire et deux rangées de dents en triangle ; des miettes jaillissent à chaque bouchée.
   LES BOULES DE MATIÈRE : des pommes avalées (renflement blanc, cœur gris) qui sortent de dessous la tête, font le tour du corps à contre-sens et se font avaler. Une pomme (l'icône de
   Google Snake) trône au centre de l'anneau et scintille. Boucle parfaite : 48 images = un tour de la tête (24 segments × 2), quatre pommes par tour. */
const fs=require('fs'),{pngIndexed,pngRGB}=require('./png.cjs');
const N=79,P=10,OFF=5,S=7,F=48,FPS=16,STEP=5,WIN=10; /* grille 79 px ; anneau de 7 × 7 cases de 10 px (segment de 9 px + 1 px de joint) ; la tête avance de 5 px par image (2 images par case) ; fenêtre de la tête : ± 10 px */
const PAL=[[0,0,0],[255,255,255],[150,150,150]],BEVEL=true;
const PATH=[];for(let i=0;i<S;i++)PATH.push([i,0]);for(let j=1;j<S;j++)PATH.push([S-1,j]);for(let i=S-2;i>=0;i--)PATH.push([i,S-1]);for(let j=S-2;j>=1;j--)PATH.push([0,j]);
const L=PATH.length,LT=L*P; /* 24 cases, 192 px de chemin */
const md=(a,m)=>((a%m)+m)%m;
const cc=k=>{const c=PATH[md(k,L)];return [OFF+P*c[0]+4,OFF+P*c[1]+4];};
const dOut=k=>{const a=PATH[md(k,L)],b=PATH[md(k+1,L)];return [Math.sign(b[0]-a[0]),Math.sign(b[1]-a[1])];};
const dIn=k=>dOut(k-1);
const arcIn=(k,x,y)=>{const [cx,cy]=cc(k),di=dIn(k),dO=dOut(k),rx=x-cx,ry=y-cy,du=rx*di[0]+ry*di[1],dv=rx*dO[0]+ry*dO[1];return P*k+Math.min(0,du)+Math.max(0,dv);}; /* l'abscisse d'un pixel le long du chemin */
const pathPoint=s=>{s=md(s,LT);const k=Math.floor(s/P),f=s-P*k,[cx,cy]=cc(k),d=dOut(k);return [cx+d[0]*f,cy+d[1]*f];};
const nearCell=(x,y)=>{let bk=0,bd=1e9;for(let k=0;k<L;k++){const [cx,cy]=cc(k),d=Math.max(Math.abs(x-cx),Math.abs(y-cy));if(d<bd){bd=d;bk=k;}}return bk;};
/* LA TÊTE (19 × 19, regard vers la droite) : tête ronde, deux gros yeux noirs à reflet, gueule qui s'ouvre sur DEUX RANGÉES DE DENTS ; fermée, un trait. */
function headMatrix(open){
  const M=[];for(let y=0;y<19;y++){M.push([]);for(let x=0;x<19;x++){const dx=Math.abs(x-9),dy=Math.abs(y-9);let v=(dx<=9&&dy<=9)?1:0;if(dx>5&&dy>5&&(dx-5)**2+(dy-5)**2>17)v=0;M[y].push(v);}}
  const set=(x,y,v)=>{if(M[y][x]!==0||v!==0)M[y][x]=v;},put=(x,y,v)=>{M[y][x]=v;};
  for(const cy of [5,13]){for(let y=cy-3;y<=cy+3;y++)for(let x=4;x<=10;x++)if(Math.hypot(x-7,y-cy)<=3.4)put(x,y,3);put(5,cy-2,1);put(6,cy-2,1);put(5,cy-1,1);put(6,cy-1,1);} /* les yeux : 7 × 7, le reflet 2 × 2 en haut à gauche */
  if(open){
    /* LA GUEULE OUVERTE : une grande bouche noire à coins arrondis, deux grosses dents en triangle (▼▼) en haut et deux (▲▲) en bas, qui se font face */
    for(let y=4;y<=14;y++)for(let x=12;x<=18;x++){if(x===12&&(y===4||y===14))continue;put(x,y,3);}
    for(const [x0,x1] of [[12,14],[16,18]]){const xm=(x0+x1)>>1;
      for(let x=x0;x<=x1;x++){put(x,4,1);put(x,14,1);}  /* la base : 3 px de large, collée à la mâchoire */
      put(xm,5,1);put(xm,13,1);}                         /* la pointe : 1 px */
  }else{for(let x=11;x<=18;x++)put(x,9,3);}
  return M;
}
function render(t){
  const g=new Uint8Array(N*N),put=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<N&&y<N)g[y*N+x]=c;};
  const sH=STEP*t,hidden=a=>{const d=Math.abs(md(a-sH+LT/2,LT)-LT/2);return d<WIN;}; /* la fenêtre de la tête : tout ce qui est dans ± 8 px d'elle est mangé (devant) ou pas encore repoussé (derrière) */
  /* le corps : des segments de 7 px arrondis, un joint noir d'un pixel, FIXES ; la tête les mange devant elle, ils repoussent derrière */
  for(let k=0;k<L;k++){const [cx,cy]=cc(k);
    for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){if(Math.abs(dx)===4&&Math.abs(dy)===4)continue;const x=cx+dx,y=cy+dy;if(!hidden(arcIn(k,x,y)))put(x,y,BEVEL&&(dx===4||dy===4)?2:1);}}
  /* les boules de matière : un renflement avec un cœur gris, qui sort de dessous la tête, fait le tour du corps à contre-sens et se fait avaler */
  for(const ts of [0,12,24,36]){const age=md(t-ts,F);if(age>23)continue;const a=STEP*ts-14-STEP*age,[bx,by]=pathPoint(a);
    for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){if(Math.hypot(dx,dy)>5.4)continue;const x=Math.round(bx)+dx,y=Math.round(by)+dy;
      const k=nearCell(x,y);if(hidden(arcIn(k,x,y)))continue;put(x,y,Math.abs(dx)<=2&&Math.abs(dy)<=2&&Math.hypot(dx,dy)<=2.6?2:1);}}
  /* la pomme au centre : l'icône de Google Snake (les boules qui traversent le corps sont des pommes avalées) */
  {const AP=['.....g.....','.....g.gg..','..###.###..','.#########.','###########','###########','###########','###########','.#########.','..#######..','...#####...'],ax=Math.round(N/2)-5,ay=Math.round(N/2)-5;
    for(let y=0;y<11;y++)for(let x=0;x<11;x++){const ch=AP[y][x];if(ch==='.')continue;const edge=ch==='#'&&(x>=9||y>=9||(y>=7&&x>=8)); /* le relief : le bord droit et le bas en gris */put(ax+x,ay+y,ch==='g'||edge?2:1);}
    const tw=t%24;if(tw<4){const sx=ax+1,sy=ay+3;put(sx,sy,1);if(tw===1||tw===2){put(sx-1,sy,2);put(sx+1,sy,2);put(sx,sy-1,2);put(sx,sy+1,2);}}}
  /* la tête : le sprite 19 × 19, tourné par quarts de tour exacts, avec la bouche ouverte une image sur deux */
  const [hx,hy]=pathPoint(sH),k0=Math.floor(md(sH,LT)/P),hd=dOut(k0),open=t%2===0,M=headMatrix(open),rot=hd[0]===1?0:hd[1]===1?1:hd[0]===-1?2:3;
  const rotp=(a,b)=>{let dx=a,dy=b;for(let r=0;r<rot;r++){const nx=-dy,ny=dx;dx=nx;dy=ny;}return [dx,dy];};
  for(let y=0;y<19;y++)for(let x=0;x<19;x++){const v=M[y][x];if(v===0)continue;const [dx,dy]=rotp(x-9,y-9);put(hx+dx,hy+dy,v===3?0:v);}
  /* miettes à chaque bouchée */
  if(!open){const A=t%4===1?[[12,-6],[15,4]]:[[13,6],[16,-4]];for(const [a,b] of A){const [dx,dy]=rotp(a,b);put(hx+dx,hy+dy,1);}}
  return g;
}
function sheet(frames,scale,cols,file){const rows=Math.ceil(frames.length/cols),W=cols*(N*scale+2),H=rows*(N*scale+2),rgb=new Uint8Array(W*H*3).fill(40);
  frames.forEach((g,k)=>{const ox=(k%cols)*(N*scale+2)+1,oy=Math.floor(k/cols)*(N*scale+2)+1;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const col=PAL[g[y*N+x]];for(let sy=0;sy<scale;sy++)for(let sx=0;sx<scale;sx++){const p=((oy+y*scale+sy)*W+ox+x*scale+sx)*3;rgb[p]=col[0];rgb[p+1]=col[1];rgb[p+2]=col[2];}}});
  fs.writeFileSync(file,pngRGB(W,H,rgb));}
function strip(frames,file){const W=N*frames.length,idx=new Uint8Array(W*N);frames.forEach((g,k)=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)idx[y*W+k*N+x]=g[y*N+x];});const png=pngIndexed(W,N,idx,PAL);fs.writeFileSync(file,png);return png;}
module.exports={render,sheet,strip,N,F,FPS,PAL,headMatrix};
if(require.main===module){
  process.chdir(__dirname);
  const fr=[];for(let t=0;t<F;t++)fr.push(render(t));
  sheet(fr.filter((_,k)=>k%3===0),3,4,'planche-16-images.png');sheet([fr[0],fr[1],fr[22],fr[27]],6,2,'tete-4-images.png');
  const png=strip(fr,'ouroboros-79px-48img.png'),b64=png.toString('base64');
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
<div id="leg">OUROBOROS SNAKE · ${N} PX · ${F} IMAGES · ${FPS} IM/S · CSS PUR · ${(b64.length/1024).toFixed(1)} KO<br><b>?zoom=3</b> POUR VOIR LES PIXELS</div>
<script>const z=+new URLSearchParams(location.search).get('zoom');if(z>0)document.getElementById('spCharge').style.setProperty('--z',z);</script>
</body></html>`;
  fs.writeFileSync('demo.html',html);
  console.log('bande',png.length,'octets · css',css.length,'octets');
}
