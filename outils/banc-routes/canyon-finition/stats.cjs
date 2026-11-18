'use strict';const fs=require('fs'),zlib=require('zlib');
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
function st(I){let L=0,RB=0,C=0,nb=0;const n=I.w*I.h;for(let i=0;i<n;i++){const o=i*I.bpp,r=I.d[o],g=I.d[o+1],b=I.d[o+2];const l=.3*r+.59*g+.11*b;L+=l;RB+=r-b;C+=Math.max(r,g,b)-Math.min(r,g,b);if(Math.max(r,g,b)<20)nb++;}return {L:(L/n).toFixed(1),RmB:(RB/n).toFixed(1),chroma:(C/n).toFixed(1),noirs:(100*nb/n).toFixed(1)+'%'};}
function df(A,B){let s=0,k=0;const n=A.w*A.h;for(let i=0;i<n;i++){let m=0;for(let c=0;c<3;c++){const v=Math.abs(A.d[i*A.bpp+c]-B.d[i*B.bpp+c]);s+=v;if(v>m)m=v;}if(m>8)k++;}return {moy:(s/n/3).toFixed(2),p8:(100*k/n).toFixed(1)+'%'};}
const dir=process.argv[2];for(const f of fs.readdirSync(dir).filter(x=>/^avant-/.test(x)).sort()){const b=f.slice(6);const A=lit(dir+'/'+f),S=lit(dir+'/sans-'+b),Lt=lit(dir+'/lot-'+b);
console.log(b.padEnd(28),'sans~avant',JSON.stringify(df(A,S)),'lot~avant',JSON.stringify(df(A,Lt)),'| avant',JSON.stringify(st(A)),'lot',JSON.stringify(st(Lt)));}
