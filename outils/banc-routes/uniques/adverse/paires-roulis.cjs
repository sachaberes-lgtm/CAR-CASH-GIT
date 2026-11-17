/* pour les paires proches de ana.cjs : l'écart de roulis (RMS, °) sur les 3 premiers km, et l'écart de cap/pente — deux routes au même tracé ont-elles au moins une dalle différente ? */
const fs=require('fs'),path=require('path');const [carte,p,...prs]=process.argv.slice(2);
const R=JSON.parse(fs.readFileSync(path.join(__dirname,'data',carte+'-apres-p'+p+'.json'))).routes,by={};for(const r of R)by[r.g]=r;
for(const s of prs){const [a,b,m]=s.split(':'),A=by[a],B=by[b],sg=m?-1:1,K=Math.min(121,A.X.length,B.X.length);let q=0,n=0,qc=0,qp=0,mx=0;
  for(let k=0;k<K;k++){if(A.ROL&&A.ROL[k]!=null&&B.ROL[k]!=null){let d=A.ROL[k]-sg*B.ROL[k];while(d>180)d-=360;while(d<-180)d+=360;q+=d*d;n++;mx=Math.max(mx,Math.abs(d));}qc+=(A.CAP[k]-A.CAP[0]-sg*(B.CAP[k]-B.CAP[0]))**2;qp+=(A.PEN[k]-B.PEN[k])**2;}
  console.log(carte,'p'+p,'g'+a,'~ g'+b,(m?'(miroir) ':'')+'roulis RMS '+Math.round(Math.sqrt(q/Math.max(1,n)))+'° (max '+Math.round(mx)+'°) · cap RMS '+Math.round(Math.sqrt(qc/K))+'° · pente RMS '+(Math.sqrt(qp/K)).toFixed(1)+'° · 1ers modules à '+A.mods.slice(0,2).map(x=>x.nom+'@'+x.s).join(',')+' / '+B.mods.slice(0,2).map(x=>x.nom+'@'+x.s).join(','));}
