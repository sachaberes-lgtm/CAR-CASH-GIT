/* png.cjs — encodeur PNG minimal (zlib natif) : indexé (palette + transparence) ou RVB. */
const zlib=require('zlib');
const TBL=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(buf){let c=0xFFFFFFFF;for(let i=0;i<buf.length;i++)c=TBL[(c^buf[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type,'ascii'),data]);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(td));return Buffer.concat([len,td,crc]);}
function ihdr(w,h,depth,ctype){const b=Buffer.alloc(13);b.writeUInt32BE(w,0);b.writeUInt32BE(h,4);b[8]=depth;b[9]=ctype;b[10]=0;b[11]=0;b[12]=0;return chunk('IHDR',b);}
const SIG=Buffer.from([137,80,78,71,13,10,26,10]);
/* idx : Uint8Array w*h d'indices ; palette : [[r,g,b],...] ; alpha : [a0,a1,...] (optionnel) */
function pngIndexed(w,h,idx,palette,alpha){
  /* palette de 4 couleurs au plus : 2 bits par pixel ; de 16 au plus : 4 bits ; sinon 8 bits */
  const bits=palette.length<=4?2:palette.length<=16?4:8,per=8/bits,rb=Math.ceil(w/per);
  const rows=[];
  for(let y=0;y<h;y++){const r=new Uint8Array(rb);for(let x=0;x<w;x++){const v=idx[y*w+x],bi=Math.floor(x/per),sh=8-bits-(x%per)*bits;r[bi]|=v<<sh;}rows.push(r);}
  /* on essaie « sans filtre » et les filtres adaptatifs PNG (0 aucun, 1 gauche, 2 haut, 3 moyenne, 4 Paeth, choisis par rangée à la plus faible somme des |octets|), avec plusieurs stratégies de zlib : on garde le plus petit
     (sur une image à palette le plus souvent « sans filtre », mais on ne le suppose pas) */
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  const zero=new Uint8Array(rb),rawNone=Buffer.alloc((rb+1)*h),rawAdapt=Buffer.alloc((rb+1)*h);
  for(let y=0;y<h;y++){const cur=rows[y],up=y?rows[y-1]:zero;rawNone.set(cur,y*(rb+1)+1);let best=null,bs=1e18,bt=0;
    for(let t=0;t<5;t++){const o=new Uint8Array(rb);let sc=0;
      for(let i=0;i<rb;i++){const a=i?cur[i-1]:0,b=up[i],c=i?up[i-1]:0;const p=t===0?0:t===1?a:t===2?b:t===3?((a+b)>>1):paeth(a,b,c);const v=(cur[i]-p)&255;o[i]=v;sc+=v>127?256-v:v;}
      if(sc<bs){bs=sc;best=o;bt=t;}}
    rawAdapt[y*(rb+1)]=bt;rawAdapt.set(best,y*(rb+1)+1);}
  let idat=null;for(const r of [rawNone,rawAdapt])for(const strategy of [zlib.constants.Z_DEFAULT_STRATEGY,zlib.constants.Z_FILTERED,zlib.constants.Z_RLE]){const z=zlib.deflateSync(r,{level:9,memLevel:9,strategy});if(!idat||z.length<idat.length)idat=z;}
  const plte=Buffer.from(palette.flat());const parts=[SIG,ihdr(w,h,bits,3),chunk('PLTE',plte)];
  if(alpha)parts.push(chunk('tRNS',Buffer.from(alpha)));
  parts.push(chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0)));return Buffer.concat(parts);}
/* rgb : Uint8Array w*h*3 */
function pngRGB(w,h,rgb){
  const raw=Buffer.alloc((w*3+1)*h);for(let y=0;y<h;y++){raw[y*(w*3+1)]=0;rgb.subarray(y*w*3,(y+1)*w*3).forEach((v,i)=>{raw[y*(w*3+1)+1+i]=v;});}
  return Buffer.concat([SIG,ihdr(w,h,8,2),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);}
module.exports={pngIndexed,pngRGB};
