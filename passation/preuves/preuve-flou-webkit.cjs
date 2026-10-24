// Preuve sans navigateur (flou-webkit) : `ctx.filter='blur(Npx)'` n'existe dans AUCUN Safari (iOS 15 → 18, réglage « Canvas Filters » éteint) ;
// l'affectation y crée une simple propriété, sans erreur, et rien n'est flouté. Deux textures du jeu comptent dessus : les RAYONS du soleil
// (RAYS, blur 5 px) et les FAISCEAUX des phares de toutes les caisses (beamTex, blur 7 px). Scénario : un iPhone (app WKWebView ou Safari)
// charge le jeu ; les faisceaux posés sur la route devant la caisse ont des bords tranchés au couteau au lieu de fondre.
// On extrait le VRAI code de index.html (les deux fabriques de texture, et le repli `flou2dRepli` s'il existe), on l'exécute sur une toile
// logicielle (polygones sur-échantillonnés 4×4, dégradés linéaires, source-over prémultiplié, getImageData/putImageData) :
//   · « WebKit » : `filter` absent du prototype → la texture doit sortir floutée comme dans Chrome (référence : chaque forme floutée par une
//     VRAIE gaussienne d'écart-type N, puis composée — ce que fait le filtre natif) : écart moyen ≤ 3/255, écart max ≤ 16/255 sur l'alpha ;
//   · « Chrome » : `filter` présent → le repli ne touche à rien (aucune lecture de pixels).
// Usage : node preuve-flou-webkit.cjs "<index.html>"   Sort 0 si OK, 1 sinon.
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(process.argv[2],'utf8');
function bloc(debut){const i=html.indexOf(debut);if(i<0)return null;let d=0,j=html.indexOf('{',i);for(;j<html.length;j++){const c=html[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)break;}}
  let k=j+1;if(html.startsWith(')();',k))k+=4;return html.slice(i,k);}
const SRC={rays:bloc('const RAYS=(function(){'),beam:bloc('const beamTex=(function(){')};
const REPLI=[bloc('function flou2dNatif('),bloc('function flou2dRepli(')].filter(Boolean).join('\n');
if(!SRC.rays||!SRC.beam){console.log('SANS OBJET : RAYS / beamTex introuvables');process.exit(0);}
function couleur(s){const m=/rgba?\(([^)]+)\)/.exec(s);const v=m[1].split(',').map(Number);return [v[0],v[1],v[2],v.length>3?v[3]:1];}
/* --- une toile logicielle : tampon prémultiplié en flottants (0..1) --- */
function Toile(){this.width=300;this.height=150;this.lectures=0;}
function Ctx2D(cv,natif){this.canvas=cv;this._natif=natif;this._path=[];this._cur=null;this.fillStyle='#000';if(natif)this._filtre='none';}
function fabrique(natif){
  const P={createLinearGradient(x0,y0,x1,y1){const st=[];return {x0,y0,x1,y1,st,addColorStop(o,c){st.push([o,couleur(c)]);st.sort((a,b)=>a[0]-b[0]);}};},
    beginPath(){this._path=[];this._cur=null;},moveTo(x,y){this._cur=[[x,y]];this._path.push(this._cur);},lineTo(x,y){this._cur.push([x,y]);},closePath(){},
    fill(){const cv=this.canvas,W=cv.width,H=cv.height,g=this.fillStyle,poly=this._path;
      const L=new Float32Array(W*H*4);
      const dedans=(x,y)=>{let w=0;for(const p of poly)for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if((a[1]<=y)!==(b[1]<=y)){const xi=a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]);if(xi>x)w+=(b[1]>a[1])?1:-1;}}return w!==0;};
      const coul=(x,y)=>{const dx=g.x1-g.x0,dy=g.y1-g.y0;let t=((x-g.x0)*dx+(y-g.y0)*dy)/(dx*dx+dy*dy);t=Math.max(0,Math.min(1,t));const s=g.st;
        if(t<=s[0][0])return s[0][1];for(let i=1;i<s.length;i++)if(t<=s[i][0]){const u=(t-s[i-1][0])/(s[i][0]-s[i-1][0]||1);return s[i-1][1].map((v,k)=>v+(s[i][1][k]-v)*u);}return s[s.length-1][1];};
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){let n=0;for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++)if(dedans(x+(sx+.5)/4,y+(sy+.5)/4))n++;if(!n)continue;
        const c=coul(x+.5,y+.5),a=c[3]*n/16,o=(y*W+x)*4;L[o]=c[0]/255*a;L[o+1]=c[1]/255*a;L[o+2]=c[2]/255*a;L[o+3]=a;}
      const m=/blur\(([\d.]+)px\)/.exec(this._natif?this._filtre:'');if(m)gauss(L,W,H,+m[1]); /* le filtre NATIF : la forme seule, floutée, puis composée */
      const B=cv._buf();for(let i=0;i<W*H;i++){const o=i*4,k=1-L[o+3];for(let c=0;c<4;c++)B[o+c]=L[o+c]+B[o+c]*k;}},
    getImageData(x,y,w,h){this.canvas.lectures++;const B=this.canvas._buf(),d=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++){const o=i*4,a=B[o+3];d[o+3]=Math.round(a*255);if(a>0)for(let c=0;c<3;c++)d[o+c]=Math.round(B[o+c]/a*255);}return {data:d,width:w,height:h};},
    putImageData(im){const B=this.canvas._buf(),d=im.data;for(let i=0;i<d.length/4;i++){const o=i*4,a=d[o+3]/255;B[o+3]=a;for(let c=0;c<3;c++)B[o+c]=d[o+c]/255*a;}}};
  function K(){}Object.assign(K.prototype,P);
  if(natif)Object.defineProperty(K.prototype,'filter',{get(){return this._filtre;},set(v){this._filtre=String(v);},configurable:true});
  return K;}
function gauss(L,W,H,s){const r=Math.ceil(3*s),k=[];let S=0;for(let i=-r;i<=r;i++){const v=Math.exp(-i*i/(2*s*s));k.push(v);S+=v;}for(let i=0;i<k.length;i++)k[i]/=S;
  const T=new Float32Array(L.length);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(let c=0;c<4;c++){let a=0;for(let i=-r;i<=r;i++){const xx=x+i;if(xx>=0&&xx<W)a+=L[(y*W+xx)*4+c]*k[i+r];}T[(y*W+x)*4+c]=a;}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(let c=0;c<4;c++){let a=0;for(let i=-r;i<=r;i++){const yy=y+i;if(yy>=0&&yy<H)a+=T[(yy*W+x)*4+c]*k[i+r];}L[(y*W+x)*4+c]=a;}}
function lance(nom,natif){
  const K=fabrique(natif),toiles=[];
  const doc={createElement(t){const cv=new Toile();cv._b=null;cv._buf=function(){if(!this._b||this._b.length!==this.width*this.height*4)this._b=new Float32Array(this.width*this.height*4);return this._b;};
    cv.getContext=function(){const c=new K();Ctx2D.call(c,cv,natif);return c;};toiles.push(cv);return cv;}};
  const THREE={CanvasTexture:function(cv){this.image=cv;},Sprite:function(m){this.material=m;this.scale={set(){}};},SpriteMaterial:function(o){Object.assign(this,o);},AdditiveBlending:2};
  const ctx=vm.createContext({document:doc,THREE,CanvasRenderingContext2D:K,RAY_ANGLES:[0],RAY_OPACITY:.12,Math,Float32Array,Uint8ClampedArray,console});
  const out=vm.runInContext(REPLI+'\n'+SRC[nom].replace(/^const (RAYS|beamTex)=/,'var __T=')+'\n;__T',ctx);
  const tex=Array.isArray(out)?out[0].material.map:out;return tex.image;}
function alpha(cv){const B=cv._buf(),a=new Float32Array(cv.width*cv.height);for(let i=0;i<a.length;i++)a[i]=B[i*4+3]*255;return a;}
let ok=true;
for(const nom of ['rays','beam']){
  const ref=alpha(lance(nom,true)),wkT=lance(nom,false),wk=alpha(wkT);
  let som=0,max=0;for(let i=0;i<ref.length;i++){const d=Math.abs(ref[i]-wk[i]);som+=d;if(d>max)max=d;}
  const moy=som/ref.length,bon=moy<=3&&max<=16;
  /* Chrome : le repli ne doit RIEN lire (la toile reste celle du filtre natif) */
  const ch=lance(nom,true),rien=ch.lectures===0;
  console.log((nom==='rays'?'RAYONS du soleil (blur 5)':'FAISCEAUX des phares (blur 7)')+' · WebKit vs Chrome : écart alpha moyen '+moy.toFixed(2)+'/255, max '+max.toFixed(1)+'/255 → '+(bon?'pareil':'DIFFÉRENT (bords nets sous Safari)')+' · Chrome : '+(rien?'repli inerte':'le repli a lu la toile !'));
  ok=ok&&bon&&rien;}
if(/x\.filter='blur\(/.test(html))console.log('(signalé, hors périmètre : le mur flou du « 1.61 » de la boutique 3D, interface/boutique-scene-1.js, garde le même défaut sous Safari)');
console.log(ok?'PREUVE OK — sans ctx.filter (Safari), les rayons et les faisceaux sortent floutés comme dans Chrome':'PREUVE KO — sous Safari, les rayons du soleil et les faisceaux des phares ont des bords nets');
process.exit(ok?0:1);
