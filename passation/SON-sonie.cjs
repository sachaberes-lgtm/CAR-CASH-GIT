// Sonie BS.1770-4 (LUFS intégrée, fenêtres 3 s, crête) d'un WAV PCM 16 bits — + la même mesure « haut-parleur » (passe-haut 200 Hz)
'use strict';
const fs=require('fs');
function lisWav(f){const b=fs.readFileSync(f);let o=12,fmt=null,data=null;
  while(o<b.length-8){const id=b.toString('ascii',o,o+4),n=b.readUInt32LE(o+4);if(id==='fmt ')fmt={ch:b.readUInt16LE(o+10),sr:b.readUInt32LE(o+12),bits:b.readUInt16LE(o+22)};if(id==='data'){data=b.subarray(o+8,o+8+n);break;}o+=8+n+(n&1);}
  const ch=fmt.ch,n=data.length/2/ch|0,C=[];for(let c=0;c<ch;c++)C.push(new Float64Array(n));
  for(let i=0;i<n;i++)for(let c=0;c<ch;c++)C[c][i]=data.readInt16LE((i*ch+c)*2)/32768;return {sr:fmt.sr,C};}
function biquad(x,b0,b1,b2,a1,a2){const y=new Float64Array(x.length);let x1=0,x2=0,y1=0,y2=0;for(let i=0;i<x.length;i++){const v=b0*x[i]+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=x[i];y2=y1;y1=v;y[i]=v;}return y;}
function kPoids(x,sr){ // pré-filtre (étagère haute +4 dB) + RLB (passe-haut 38 Hz), coefficients recalculés pour sr (comme pyloudnorm)
  let G=3.999843853973347,f0=1681.974450955533,Q=.7071752369554196,K=Math.tan(Math.PI*f0/sr),Vh=Math.pow(10,G/20),Vb=Math.pow(Vh,.4996667741545416),a0=1+K/Q+K*K;
  x=biquad(x,(Vh+Vb*K/Q+K*K)/a0,2*(K*K-Vh)/a0,(Vh-Vb*K/Q+K*K)/a0,2*(K*K-1)/a0,(1-K/Q+K*K)/a0);
  f0=38.13547087602444;Q=.5003270373238773;K=Math.tan(Math.PI*f0/sr);a0=1+K/Q+K*K;
  return biquad(x,1/a0,-2/a0,1/a0,2*(K*K-1)/a0,(1-K/Q+K*K)/a0);}
function passeHaut(x,sr,f){const w=2*Math.PI*f/sr,al=Math.sin(w)/(2*.7071),c=Math.cos(w),a0=1+al;return biquad(x,(1+c)/2/a0,-(1+c)/a0,(1+c)/2/a0,-2*c/a0,(1-al)/a0);}
function sonie(C,sr){ // intégrée (portes −70 absolue, −10 relative) ; fenêtres de 3 s (min / p10 / p95 / max hors silence)
  const n=C[0].length,blk=Math.round(.4*sr),pas=Math.round(.1*sr),ms=[];
  const P=C.map(c=>{const p=new Float64Array(n+1);for(let i=0;i<n;i++)p[i+1]=p[i]+c[i]*c[i];return p;});
  for(let o=0;o+blk<=n;o+=pas){let z=0;for(const p of P)z+=(p[o+blk]-p[o])/blk;ms.push(z);}
  const L=z=>-.691+10*Math.log10(z+1e-20);let g=ms.filter(z=>L(z)>-70);if(!g.length)return {I:-99};
  const rel=L(g.reduce((a,b)=>a+b,0)/g.length)-10;g=g.filter(z=>L(z)>rel);const I=L(g.reduce((a,b)=>a+b,0)/g.length);
  const b3=Math.min(n,Math.round(3*sr)),st=[];for(let o=0;o+b3<=n;o+=Math.round(sr)){let z=0;for(const p of P)z+=(p[o+b3]-p[o])/b3;const l=L(z);if(l>-60)st.push(l);}
  st.sort((a,b)=>a-b);const q=f=>st.length?st[Math.min(st.length-1,Math.floor(f*st.length))]:-99;
  return {I,stMin:st[0],st10:q(.1),st95:q(.95),stMax:st[st.length-1],LRA:q(.95)-q(.1)};}
const f=process.argv[2],w=lisWav(f);let pk=0;for(const c of w.C)for(const v of c){const a=Math.abs(v);if(a>pk)pk=a;}
const K=w.C.map(c=>kPoids(c,w.sr)),H=w.C.map(c=>kPoids(passeHaut(passeHaut(c,w.sr,200),w.sr,200),w.sr));
const a=sonie(K,w.sr),h=sonie(H,w.sr),r=x=>x==null?'-':x.toFixed(1);
console.log([process.argv[3]||f,(w.C[0].length/w.sr).toFixed(1)+'s','I '+r(a.I),'st3 min '+r(a.stMin)+' p10 '+r(a.st10)+' p95 '+r(a.st95)+' max '+r(a.stMax),'LRA '+r(a.LRA),'crete '+r(20*Math.log10(pk)),'HP200 I '+r(h.I)].join('\t'));
