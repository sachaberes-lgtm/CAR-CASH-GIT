/* mini rasteriseur PNG (sans dépendance) : lignes épaisses + texte non géré */
const zlib=require('zlib');
function Img(w,h,bg){const d=Buffer.alloc(w*h*4);for(let i=0;i<w*h;i++){d[i*4]=bg[0];d[i*4+1]=bg[1];d[i*4+2]=bg[2];d[i*4+3]=255;}return {w,h,d};}
function px(im,x,y,c,a){x|=0;y|=0;if(x<0||y<0||x>=im.w||y>=im.h)return;const o=(y*im.w+x)*4;a=a==null?1:a;im.d[o]=im.d[o]*(1-a)+c[0]*a;im.d[o+1]=im.d[o+1]*(1-a)+c[1]*a;im.d[o+2]=im.d[o+2]*(1-a)+c[2]*a;}
function disc(im,x,y,r,c,a){for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r+r)px(im,x+i,y+j,c,a);}
function line(im,x0,y0,x1,y1,c,r){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));for(let k=0;k<=n;k++)disc(im,x0+(x1-x0)*k/n,y0+(y1-y0)*k/n,r||1,c);}
function crc(buf){let c,crc=0xffffffff;for(let n=0;n<buf.length;n++){c=(crc^buf[n])&0xff;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;crc=(crc>>>8)^c;}return (crc^0xffffffff)>>>0;}
function chunk(t,data){const l=Buffer.alloc(4);l.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(t),data]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);}
function png(im){const raw=Buffer.alloc((im.w*4+1)*im.h);for(let y=0;y<im.h;y++){raw[y*(im.w*4+1)]=0;im.d.copy(raw,y*(im.w*4+1)+1,y*im.w*4,(y+1)*im.w*4);}
  const ih=Buffer.alloc(13);ih.writeUInt32BE(im.w,0);ih.writeUInt32BE(im.h,4);ih[8]=8;ih[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
module.exports={Img,px,disc,line,png};
