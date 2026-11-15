/* Compare deux captures PNG pixel à pixel (2026-11-14, v7.2) : node outils/banc-routes/png-diff.cjs a.png b.png [x0,y0,x1,y1]
   Rend le nombre de pixels différents, l'écart max par canal et la part de l'image touchée. Lit les PNG 8 bits RGB/RGBA non entrelacés (ceux de Chrome). */
'use strict';
const fs=require('fs'),zlib=require('zlib');
function lit(f){const b=fs.readFileSync(f);let o=8,w,h,ct,id=[];
  while(o<b.length){const l=b.readUInt32BE(o),t=b.toString('ascii',o+4,o+8),d=b.subarray(o+8,o+8+l);
    if(t==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);ct=d[9];if(d[8]!==8||d[12])throw new Error('PNG non géré');}else if(t==='IDAT')id.push(d);o+=12+l;}
  const bpp=ct===6?4:ct===2?3:0;if(!bpp)throw new Error('type de couleur non géré '+ct);
  const raw=zlib.inflateSync(Buffer.concat(id)),st=w*bpp,out=Buffer.alloc(h*st);
  for(let y=0;y<h;y++){const f9=raw[y*(st+1)],src=raw.subarray(y*(st+1)+1,(y+1)*(st+1)),cur=out.subarray(y*st,(y+1)*st),prv=y?out.subarray((y-1)*st,y*st):null;
    for(let x=0;x<st;x++){const a=x>=bpp?cur[x-bpp]:0,up=prv?prv[x]:0,c=prv&&x>=bpp?prv[x-bpp]:0;let v=src[x];
      if(f9===1)v+=a;else if(f9===2)v+=up;else if(f9===3)v+=(a+up)>>1;else if(f9===4){const p=a+up-c,pa=Math.abs(p-a),pb=Math.abs(p-up),pc=Math.abs(p-c);v+=pa<=pb&&pa<=pc?a:pb<=pc?up:c;}
      cur[x]=v&255;}}
  return {w,h,bpp,d:out};}
const A=lit(process.argv[2]),B=lit(process.argv[3]);
if(A.w!==B.w||A.h!==B.h)throw new Error('tailles différentes');
const Z=(process.argv[4]||'0,0,'+A.w+','+A.h).split(',').map(Number);let n=0,mx=0,tot=0;for(let i=0;i<A.w*A.h;i++){const X=i%A.w,Y=(i/A.w)|0;if(X<Z[0]||Y<Z[1]||X>=Z[2]||Y>=Z[3])continue;tot++;let dd=0;for(let c=0;c<3;c++)dd=Math.max(dd,Math.abs(A.d[i*A.bpp+c]-B.d[i*B.bpp+c]));if(dd){n++;mx=Math.max(mx,dd);}}
console.log(JSON.stringify({w:A.w,h:A.h,pixelsDifferents:n,zone:Z.join(','),part:+(n/tot*100).toFixed(4)+'%',ecartMax:mx}));
