'use strict';/* LA MESURE DES COULEURS (2026-11-19, finition des maps : « des fois c'est trop rouge, des fois c'est trop éblouissant, terne la nuit ou quand il pleut »)
   Par tiers d'image (haut, milieu, bas) et sur le cadre entier, sur des PNG du vrai jeu :
     L     = luminance moyenne (0-255, .3R+.59G+.11B)            → terne si bas
     C     = chroma moyen en Lab (C*ab)                           → terne / délavé si bas
     RmB   = R−B moyen                                            → chaleur
     ov    = part de pixels R>200 et B<90 (la mesure des contrôles : compte aussi l'or)
     rouge = part de pixels ROUGE-ORANGE vifs : teinte 0-30°, saturation > .5, valeur > .55 (la braise)
     or    = part de pixels OR vifs : teinte 30-55°, mêmes seuils (le grès doré)
     brule = part de pixels dont les trois canaux passent 245 (éblouissement)
   node mesure-couleurs.cjs <dossier> [référence=avant]  (compare chaque <jeu>-<cas>.png au <référence>-<cas>.png) */
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
const LIN=new Float64Array(256);for(let i=0;i<256;i++){const c=i/255;LIN[i]=c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);}
const fl=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;
function chroma(r,g,b){const R=LIN[r],G=LIN[g],B=LIN[b];const X=(.4124*R+.3576*G+.1805*B)/.95047,Y=.2126*R+.7152*G+.0722*B,Z=(.0193*R+.1192*G+.9505*B)/1.08883;
  const fx=fl(X),fy=fl(Y),fz=fl(Z),a=500*(fx-fy),bb=200*(fy-fz);return Math.sqrt(a*a+bb*bb);}
function bande(I,y0,y1){let n=0,ov=0,ro=0,or=0,br=0,RB=0,L=0,C=0;
  for(let y=Math.floor(I.h*y0);y<Math.floor(I.h*y1);y++)for(let x=0;x<I.w;x++){const o=(y*I.w+x)*I.bpp,r=I.d[o],g=I.d[o+1],b=I.d[o+2];n++;
    if(r>200&&b<90)ov++;if(r>245&&g>245&&b>245)br++;RB+=r-b;L+=.3*r+.59*g+.11*b;C+=chroma(r,g,b);
    const mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(mx===r&&mx>140&&(mx-mn)/mx>.5){const hue=60*(g-b)/(mx-mn);if(hue>=0&&hue<30)ro++;else if(hue>=30&&hue<55)or++;}}
  const p=v=>+(100*v/n).toFixed(1);return {L:+(L/n).toFixed(1),C:+(C/n).toFixed(1),RmB:Math.round(RB/n),ov:p(ov),rouge:p(ro),or:p(or),brule:p(br)};}
const TIERS={haut:[0,1/3],milieu:[1/3,2/3],bas:[2/3,1],tout:[0,1]};
module.exports={lit,bande,TIERS};
if(require.main===module){const dir=process.argv[2],ref=process.argv[3]||'avant',f2=fs.readdirSync(dir).filter(x=>x.endsWith('.png')),
  cas=[...new Set(f2.filter(x=>x.startsWith(ref+'-')).map(x=>x.slice(ref.length+1)))].sort();
  for(const c of cas){console.log('== '+c);for(const f of f2.filter(x=>x.endsWith('-'+c)&&x.indexOf('-'+c)===x.indexOf('-'))){const I=lit(dir+'/'+f),j=f.slice(0,f.length-c.length-1);
    for(const t in TIERS){const m=bande(I,...TIERS[t]);console.log('  '+j.padEnd(6)+' '+t.padEnd(6)+' L '+m.L+'  C '+m.C+'  R-B '+m.RmB+'  ov '+m.ov+'%  rouge '+m.rouge+'%  or '+m.or+'%  brule '+m.brule+'%');}}}}
