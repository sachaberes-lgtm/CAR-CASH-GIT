/* ===== LES ICÔNES DU BOUTON BOOST (2026-11-01, Léo : « change l'éclair par un truc intelligent ou stylé, genre une bouteille nitro, on peut tester plusieurs trucs ») ===== ?boost=bouteille|chevrons|anneau (SVG) ou flamme (en pixels, voir plus bas) : un SVG en verre dans #tNitro à la place de l'éclair en pixels (le style vit dans charte-7-details.css) ; rien dans l'URL = l'éclair, comme avant. */
const BV_ICO={"bouteille": "<svg class=\"bvIco bv-bouteille\" viewBox=\"0 0 40 66\" aria-hidden=\"true\"><defs><clipPath id=\"bvCb\"><path d=\"M14 9h12v6q8 2 8 12v27q0 8-8 8H14q-8 0-8-8V27q0-10 8-12z\"/></clipPath></defs><g clip-path=\"url(#bvCb)\"><rect class=\"bvLx\" x=\"0\" y=\"15\" width=\"40\" height=\"52\"/><rect class=\"bvLq\" x=\"0\" y=\"15\" width=\"40\" height=\"52\"/></g><path class=\"bvLn\" d=\"M14 9h12v6q8 2 8 12v27q0 8-8 8H14q-8 0-8-8V27q0-10 8-12z\"/><path class=\"bvLn\" d=\"M11 4h18v5H11z\"/><path class=\"bvBr\" d=\"M10 31h20M10 36h20\"/><path class=\"bvSh\" d=\"M11 22q-2 4-2 10\"/></svg>", "chevrons": "<svg class=\"bvIco bv-chevrons\" viewBox=\"0 0 48 52\" aria-hidden=\"true\"><path class=\"bvCh c3\" d=\"M8 46l16-14 16 14\"/><path class=\"bvCh c2\" d=\"M8 31l16-14 16 14\"/><path class=\"bvCh c1\" d=\"M8 16l16-14 16 14\"/></svg>", "anneau": "<svg class=\"bvIco bv-anneau\" viewBox=\"0 0 64 64\" aria-hidden=\"true\"><circle class=\"bvPi\" cx=\"32\" cy=\"32\" r=\"27\"/><circle class=\"bvRx\" cx=\"32\" cy=\"32\" r=\"27\" pathLength=\"100\"/><circle class=\"bvRq\" cx=\"32\" cy=\"32\" r=\"27\" pathLength=\"100\"/><path class=\"bvCh d2\" d=\"M21 38l11-10 11 10\"/><path class=\"bvCh d1\" d=\"M21 29l11-10 11 10\"/></svg>"};
{const bv=(/[?&]boost=([a-z]+)/.exec(location.search)||[])[1],bt=document.getElementById('tNitro');
 if(bv==='flamme')NX3.flame=true;
 else if(bv&&BV_ICO[bv]&&bt){bt.insertAdjacentHTML('beforeend',BV_ICO[bv]);document.body.classList.add('bv','bv-'+bv);}}
/* ===== LA FLAMME EN PIXELS (2026-11-01, Léo : « flamme mais plus stylé, qui autour du doigt s'enflamme de plus en plus (couleurs et intensité) quand on maintient, même style que l'éclair actuel mais flamme ») =====
   Même pipeline que l'éclair (grille de cases, contour d'encre, épaisseur dessous, lueur en cases, enfoncement) — seule la FORME change : une flamme qui vacille (tête qui se balance,
   flancs qui bougent), dessinée du bord vers le cœur (bord foncé → plein → clair → cœur blanc). NX3.heat (0 → 1 en 2,2 s de doigt posé, retombe en 0,7 s) la fait GRANDIR, lui donne
   deux langues de chaque côté (> 30 % et > 55 %), des étincelles (> 50 %), un cœur blanc-bleu (> 70 %) et la fait passer de la braise (f0) au blanc brûlant (f3) ; la réserve bleue,
   la nitro infinie (violet) et le « à sec » (gris) gardent leurs palettes. Redessinée 7 à 16 fois par seconde, pas à chaque image. */
function nxfMasque(fh,fr){
  const gw=15,gh=20,m=NX3.fm||(NX3.fm=new Uint8Array(gw*gh));m.fill(0);
  const fl=function(cx,haut,w,ph,sw){const bas=gh-1;
    for(let y=bas;y>=Math.max(0,bas-haut);y--){const v=(bas-y)/haut,hw=w*Math.pow(1-v,.7)*(.55+.45*Math.sin(Math.min(1,v*3)*1.5708)),
      c=cx+sw*Math.pow(v,1.5)*Math.sin(fr*.9+ph+v*3),j=.35*Math.sin(fr*1.3+ph*2+y*1.1);
      for(let x=0;x<gw;x++)if(Math.abs(x-c)<=hw+j+.35)m[y*gw+x]=1;}};
  fl(7,Math.round(11+8*fh+1.2*Math.sin(fr*.7)),4+.8*fh,0,1.6+fh);
  if(fh>.3)fl(2,Math.round(5+7*fh+1.2*Math.sin(fr+1)),2,2,1);
  if(fh>.55)fl(12,Math.round(5+7*fh+1.2*Math.sin(fr*1.1+4)),2,4,1);
  return m;
}
function nxfDessine(d,pal,a,clig){
  const W=NX3.W,H=NX3.H,u=NX3.u32,gw=15,gh=20,M=NX3_M,T=NX3_T,P=NX3_PAL[pal],fh=NX3.fh||0,fr=NX3.ft||0,m=nxfMasque(fh,fr);u.fill(0);
  const y0=M+d,ep=T-d,B=NX3.B||(NX3.B=new Uint8Array(W*H));
  const forme=function(x,y){x-=M;y-=y0;return x>=0&&y>=0&&x<gw&&y<gh&&m[y*gw+x]===1;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let b=forme(x,y)?1:0;if(!b)for(let k=1;k<=ep;k++)if(forme(x,y-k)){b=2;break;}B[y*W+x]=b;}
  const pres=function(x,y,r){for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const X=x+i,Y=y+j;if(X>=0&&Y>=0&&X<W&&Y<H&&B[Y*W+X])return true;}return false;};
  const cE=nx3Rgb(clig?'#ff5a6e':P[7]),g0=nx3Rgb(P[6])&0x00ffffff,cG1=(g0|Math.round(a*.78*255)<<24)>>>0,cG2=(g0|Math.round(a*.36*255)<<24)>>>0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const b=B[y*W+x],i=y*W+x;
    if(b===1){let dp=1;while(dp<6&&forme(x-dp,y)&&forme(x+dp,y)&&forme(x,y-dp)&&forme(x,y+dp))dp++;
      let c=dp===1?P[3]:dp===2?P[1]:dp<5?P[2]:P[0];
      if(fh>.7&&dp>=3&&y>=y0+gh-5&&Math.abs(x-M-7)<=2)c='#9cc4ff'; // le pied du cœur vire au bleu quand la flamme est blanche
      u[i]=nx3Rgb(c);}
    else if(b===2)u[i]=nx3Rgb(forme(x,y-1)?P[4]:P[5]);
    else if(pres(x,y,1))u[i]=cE;
    else if(a>.02){if(pres(x,y,2))u[i]=cG1;else if(pres(x,y,3))u[i]=cG2;}
  }
  if(fh>.5){const n=Math.round(fh*6),cs=nx3Rgb(P[2]);for(let q=0;q<n;q++){const sx=(q*53+fr*5)%W,sy=(fr*2+q*37)%(H-T-2);if(!B[sy*W+sx])u[sy*W+sx]=cs;}} // les étincelles
  NX3.cx.putImageData(NX3.img,0,0);
}
