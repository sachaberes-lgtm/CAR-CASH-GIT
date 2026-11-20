'use strict';/* TOUR 3 (2026-11-18) : la mesure du contrôle adverse sur le haut de l'image (lignes 12-50 %, parois et ciel) : part de pixels orange vif (R>200 et B<90), R−B, luminance ; plus l'image entière.
   node stats3.cjs <dossier> [référence=avant]   (compare chaque <jeu>-<cas>.png au <référence>-<cas>.png) */
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
function bande(I,y0,y1){let n=0,ov=0,RB=0,L=0,C=0;for(let y=Math.floor(I.h*y0);y<Math.floor(I.h*y1);y++)for(let x=0;x<I.w;x++){const o=(y*I.w+x)*I.bpp,r=I.d[o],g=I.d[o+1],b=I.d[o+2];n++;if(r>200&&b<90)ov++;RB+=r-b;L+=.3*r+.59*g+.11*b;C+=Math.max(r,g,b)-Math.min(r,g,b);}
  return {ov:(100*ov/n).toFixed(0)+'%',RmB:(RB/n).toFixed(0),L:(L/n).toFixed(1),C:(C/n).toFixed(0)};}
function bas(I){return bande(I,.55,1);}
const dir=process.argv[2],ref=process.argv[3]||'avant',fs2=fs.readdirSync(dir).filter(x=>x.endsWith('.png')),cas=[...new Set(fs2.filter(x=>x.startsWith(ref+'-')).map(x=>x.slice(ref.length+1)))].sort();
for(const c of cas){console.log('== '+c);for(const f of fs2.filter(x=>x.endsWith('-'+c)&&x.indexOf('-'+c)===x.indexOf('-'))){const I=lit(dir+'/'+f),j=f.slice(0,f.length-c.length-1);
  console.log('  '+j.padEnd(6),'haut',JSON.stringify(bande(I,.12,.5)),'bas',JSON.stringify(bas(I)),'tout',JSON.stringify(bande(I,0,1)));}}
