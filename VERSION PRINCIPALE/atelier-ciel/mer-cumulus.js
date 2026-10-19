// LA MER DE CUMULUS — la carte de relief (tuilable) de la mer de nuages du fond, cuite UNE fois (2026-10-19, Léo : « le ciel d'ARC Raiders
// est hyper bien fait… un fond plus réaliste »). node atelier-ciel/mer-cumulus.js → assets/ciel/mer-cumulus.png (512 × 512, RGBA) :
//   R = la hauteur (des dômes de cumulus de trois tailles, soudés en chou-fleur, sur une houle douce)
//   G, B = sa pente (x, z), en 0,5 ± ; A = le creux (l'ombre des plis, 1 = à l'air libre)
// Le ciel la relit à deux échelles tournées l'une par rapport à l'autre : la tuile ne se voit pas, les mips filtrent le lointain.
const fs=require('fs'),zlib=require('zlib'),path=require('path');
const N=512;
let s=0x9e3779b9;function rnd(){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;}
const H=new Float32Array(N*N);
function domes(cells,r0,r1,amp,surDe){ // une grille tirée au hasard : un dôme (calotte) par case, soudés par un max doux
  const P=[];for(let j=0;j<cells;j++)for(let i=0;i<cells;i++){if(rnd()<.12)continue;P.push([(i+rnd())/cells,(j+rnd())/cells,r0+(r1-r0)*rnd(),.65+.35*rnd()]);}
  const L=new Float32Array(N*N);
  for(const [px,py,r,a] of P){const R=Math.ceil(r*N)+1,cx=px*N,cy=py*N;
    for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const x=Math.floor(cx)+dx,y=Math.floor(cy)+dy,ux=(x+.5-cx)/N,uy=(y+.5-cy)/N,d2=(ux*ux+uy*uy)/(r*r);if(d2>=1)continue;
      const v=Math.pow(1-d2,1.6)*a,k=((y%N+N)%N)*N+((x%N+N)%N);L[k]+=v;}} // un dôme au bord DOUX (pente nulle au bord) ; additionnés, ils se soudent
  for(let k=0;k<N*N;k++){const l=L[k];H[k]+=(surDe?surDe(k):1)*(l/(1+.35*l))*amp;} // la somme, tassée : les grappes ne montent pas en tours
  return L;}
const B=domes(6,.09,.16,.55);                           // les gros dômes (les massifs)
domes(14,.03,.06,.30,k=>Math.min(1,B[k]*1.6+.1));    // les bourgeons, surtout SUR les massifs
domes(34,.011,.022,.12,k=>Math.min(1,B[k]*1.8+.2));      // le chou-fleur fin
// une houle douce (sinus tuilables) : le pont de nuages n'est jamais plat entre les dômes
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=x/N*6.2832,v=y/N*6.2832;H[y*N+x]+=.06*(Math.sin(u*2+1.3*Math.sin(v*1))+Math.sin(v*3+.7*Math.cos(u*2)))+.05;}
{const W=new Float32Array(N*N);const sm=(x,y)=>{const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,a=(i,j)=>H[((j%N+N)%N)*N+((i%N+N)%N)];return (a(x0,y0)*(1-fx)+a(x0+1,y0)*fx)*(1-fy)+(a(x0,y0+1)*(1-fx)+a(x0+1,y0+1)*fx)*fy;};
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=x/N*6.2832,v=y/N*6.2832;
    const wx=14*Math.sin(v*2+1.1)+7*Math.sin(u*3+v*2+.4)+3.5*Math.sin(u*7-v*5+2.2),wy=14*Math.sin(u*2+2.3)+7*Math.sin(v*3-u*2+1.7)+3.5*Math.sin(v*7+u*4+.9);
    W[y*N+x]=sm(x+wx,y+wy);}
  H.set(W);} // LA DÉFORMATION : des sinus tuilables tordent le champ — les dômes ronds deviennent des grappes irrégulières
let mn=1e9,mx=-1e9;for(const v of H){mn=Math.min(mn,v);mx=Math.max(mx,v);}
for(let k=0;k<N*N;k++)H[k]=(H[k]-mn)/(mx-mn);
const at=(x,y)=>H[((y%N+N)%N)*N+((x%N+N)%N)];
// le creux : la hauteur moyenne alentour (rayon 6 px) au-dessus de soi = un pli à l'ombre
const M=new Float32Array(N*N),T=new Float32Array(N*N),Rb=6;
for(let y=0;y<N;y++){let a=0;for(let x=-Rb;x<=Rb;x++)a+=at(x,y);for(let x=0;x<N;x++){T[y*N+x]=a/(2*Rb+1);a+=at(x+Rb+1,y)-at(x-Rb,y);}}
for(let x=0;x<N;x++){let a=0;for(let y=-Rb;y<=Rb;y++)a+=T[((y%N+N)%N)*N+x];for(let y=0;y<N;y++){M[y*N+x]=a/(2*Rb+1);a+=T[(((y+Rb+1)%N+N)%N)*N+x]-T[(((y-Rb)%N+N)%N)*N+x];}}
const raw=Buffer.alloc((N*4+1)*N);let gmx=0;
const G=new Float32Array(N*N*2);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const gx=(at(x+1,y)-at(x-1,y))*N/2,gz=(at(x,y+1)-at(x,y-1))*N/2;G[(y*N+x)*2]=gx;G[(y*N+x)*2+1]=gz;gmx=Math.max(gmx,Math.abs(gx),Math.abs(gz));}
const GK=Math.min(gmx,40);
for(let y=0;y<N;y++){raw[y*(N*4+1)]=0;for(let x=0;x<N;x++){const k=y*N+x,o=y*(N*4+1)+1+x*4;
  raw[o]=Math.round(H[k]*255);raw[o+1]=Math.round(Math.max(0,Math.min(1,.5+.5*G[k*2]/GK))*255);raw[o+2]=Math.round(Math.max(0,Math.min(1,.5+.5*G[k*2+1]/GK))*255);
  raw[o+3]=Math.round(Math.max(0,Math.min(1,1-(M[k]-H[k])*3.2))*255);}}
const crcT=new Int32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;crcT[n]=c;}
function crc(b){let c=-1;for(const v of b)c=crcT[(c^v)&255]^(c>>>8);return (c^-1)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);}
const ih=Buffer.alloc(13);ih.writeUInt32BE(N,0);ih.writeUInt32BE(N,4);ih[8]=8;ih[9]=6;ih[10]=0;ih[11]=0;ih[12]=0;
if(process.env.APERCU){for(let y=0;y<N;y++)for(let x=0;x<N;x++){const o=y*(N*4+1)+1+x*4,h=raw[o],ao=raw[o+3]/255,gx=(raw[o+1]-128)/128;const l=Math.max(0,Math.min(255,(h*.6+ (60+120*gx))*ao));raw[o]=raw[o+1]=raw[o+2]=l;raw[o+3]=255;}}
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
const out=process.env.APERCU||path.join(__dirname,'..','assets','ciel','mer-cumulus.png');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,png);
console.log('mer-cumulus.png',png.length,'octets · pente max',gmx.toFixed(1),'→ échelle',GK.toFixed(1));
