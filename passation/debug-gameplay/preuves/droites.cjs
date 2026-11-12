/* liste les droites (cap < 8° sur la durée) d'une route JSON : node droites.cjs fichier.json [seuilSecondes=4] */
const o=JSON.parse(require('fs').readFileSync(process.argv[2],'utf8'));const C=o.ctrl0,vP=o.vP,SEUIL=+(process.argv[3]||4);
const P=[];let s=0;for(let i=0;i<C.length;i++){if(i){const a=C[i-1],b=C[i],d=Math.hypot(b[0]-a[0],b[2]-a[2]),n=Math.max(1,Math.ceil(d/5));for(let k=1;k<=n;k++){s+=d/n;P.push({x:a[0]+(b[0]-a[0])*k/n,z:a[2]+(b[2]-a[2])*k/n,s});}}else P.push({x:C[0][0],z:C[0][2],s:0});}
const hd=i=>Math.atan2(P[Math.min(P.length-1,i+4)].x-P[i].x,P[Math.min(P.length-1,i+4)].z-P[i].z);
let st=0,ref=hd(0);const out=[];
for(let i=1;i<P.length;i++){let d=hd(i)-ref;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;
 if(Math.abs(d)*57.3>8){if(P[i].s-P[st].s>=SEUIL*vP)out.push([Math.round(P[st].s),Math.round(P[i].s-P[st].s),((P[i].s-P[st].s)/vP).toFixed(1)]);st=i;ref=hd(i);}}
if(P[P.length-1].s-P[st].s>=SEUIL*vP)out.push([Math.round(P[st].s),Math.round(P[P.length-1].s-P[st].s),((P[P.length-1].s-P[st].s)/vP).toFixed(1)+'(fin)']);
console.log(process.argv[2].split('/').pop(),'vP',vP,'L',Math.round(s),'droites >'+SEUIL+'s [s0,m,s]:',JSON.stringify(out));
