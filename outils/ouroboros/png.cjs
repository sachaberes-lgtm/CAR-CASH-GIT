/* png.cjs — encodeur PNG minimal (zlib natif) : indexé (palette + transparence) ou RVB. */
const zlib=require('zlib');
const TBL=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(buf){let c=0xFFFFFFFF;for(let i=0;i<buf.length;i++)c=TBL[(c^buf[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type,'ascii'),data]);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(td));return Buffer.concat([len,td,crc]);}
function ihdr(w,h,depth,ctype){const b=Buffer.alloc(13);b.writeUInt32BE(w,0);b.writeUInt32BE(h,4);b[8]=depth;b[9]=ctype;b[10]=0;b[11]=0;b[12]=0;return chunk('IHDR',b);}
const SIG=Buffer.from([137,80,78,71,13,10,26,10]);
/* idx : Uint8Array w*h d'indices ; palette : [[r,g,b],...] ; alpha : [a0,a1,...] (optionnel) */
function pngIndexed(w,h,idx,palette,alpha){
  /* palette de 4 couleurs au plus : 2 bits par pixel (4 pixels par octet), sinon 8 bits */
  const bits=palette.length<=4?2:8,per=8/bits,rb=Math.ceil(w/per),raw=Buffer.alloc((rb+1)*h);
  for(let y=0;y<h;y++){raw[y*(rb+1)]=0;for(let x=0;x<w;x++){const v=idx[y*w+x],bi=Math.floor(x/per),sh=8-bits-(x%per)*bits;raw[y*(rb+1)+1+bi]|=v<<sh;}}
  const plte=Buffer.from(palette.flat());const parts=[SIG,ihdr(w,h,bits,3),chunk('PLTE',plte)];
  if(alpha)parts.push(chunk('tRNS',Buffer.from(alpha)));
  parts.push(chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0)));return Buffer.concat(parts);}
/* rgb : Uint8Array w*h*3 */
function pngRGB(w,h,rgb){
  const raw=Buffer.alloc((w*3+1)*h);for(let y=0;y<h;y++){raw[y*(w*3+1)]=0;rgb.subarray(y*w*3,(y+1)*w*3).forEach((v,i)=>{raw[y*(w*3+1)+1+i]=v;});}
  return Buffer.concat([SIG,ihdr(w,h,8,2),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);}
module.exports={pngIndexed,pngRGB};
