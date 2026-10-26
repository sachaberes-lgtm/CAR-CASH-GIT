// node mesure.cjs <index.html> <carte> [nGraines=40] [palier=0] [--json sortie.json]
// L'ÉCART DE FORME (la mesure de la session de contrôle, 19/10) : chaque piste rééchantillonnée en 64 points xz par fraction de longueur,
// départ à l'origine ; distance moyenne entre deux pistes (toutes les paires) / longueur moyenne. + la même APRÈS avoir ôté la rotation
// (Procrustes 2D autour du départ : la forme seule, sans l'axe), le cap global, les repères, rayons, conflits, temps.
const path=require('path'),fs=require('fs');
const [,,idx,carte,nG0,pal0]=process.argv;const nG=+(nG0||40),pal=+(pal0||0);
const jsonOut=(()=>{const i=process.argv.indexOf('--json');return i>0?process.argv[i+1]:null;})();
const B=require('./charge.cjs')(path.resolve(idx));
const reech=(c,n)=>{const L=[0];for(let i=1;i<c.length;i++)L.push(L[i-1]+Math.hypot(c[i][0]-c[i-1][0],c[i][2]-c[i-1][2]));const T=L[L.length-1],o=[];let j=0;
  for(let k=0;k<n;k++){const s=T*k/(n-1);while(j<c.length-2&&L[j+1]<s)j++;const u=(s-L[j])/Math.max(1e-9,L[j+1]-L[j]);o.push([c[j][0]+(c[j+1][0]-c[j][0])*u-c[0][0],c[j][2]+(c[j+1][2]-c[j][2])*u-c[0][2]]);}return {p:o,L:T};};
const pistes=[],rep=[];
for(let g=1;g<=nG;g++){const r=B.trace(carte,g,pal);const R=reech(r.ctrl,64);pistes.push(R);
  const c=r.ctrl,fin=c[c.length-1],cap=Math.atan2(fin[0]-c[0][0],fin[2]-c[0][2])*57.2958;
  // le rayon le plus serré (points de contrôle consécutifs, sur 3 points) et le dénivelé
  let rmin=1e9;for(let i=1;i<c.length-1;i++){const a=Math.atan2(c[i][0]-c[i-1][0],c[i][2]-c[i-1][2]),b=Math.atan2(c[i+1][0]-c[i][0],c[i+1][2]-c[i][2]);let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;
    const l=(Math.hypot(c[i][0]-c[i-1][0],c[i][2]-c[i-1][2])+Math.hypot(c[i+1][0]-c[i][0],c[i+1][2]-c[i][2]))/2;if(Math.abs(d)>.01)rmin=Math.min(rmin,l/Math.abs(d));}
  let y0=1e9,y1=-1e9;for(const p of c){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}
  const Q=r.Q||{},fr=k=>Q[k]&&Q[k].s!=null?+(Q[k].s/R.L).toFixed(3):null,e=r.etat;
  const o={g,L:Math.round(R.L),cap:Math.round(cap),axe:Q.hasard&&Q.hasard.axe!=null?Math.round(Q.hasard.axe*57.2958):null,rmin:Math.round(rmin),deniv:Math.round(y1-y0),conflits:e.conflits,croise:e.croise,ms:r.ms,mods:r.mods.length};
  if(carte==='volcan'){Object.assign(o,{arche:fr('arche'),vlc0:fr('vlc0'),vlc1:fr('vlc1'),ordre:Q.hasard?Q.hasard.ordre.join(','):null,hum:Q.hasard?Q.hasard.humeurs.join(','):null});}
  if(carte==='grotte'){const SL=e.salles||[];o.salles=SL.map(x=>x.k+'@'+(x.s/R.L).toFixed(2)).join(' ');o.puits=fr('puits0');o.puitsF=fr('puits1');o.tours=e.spi&&e.spi.tours;o.hum=Q.hasard?JSON.stringify(Q.hasard.humeurs)+' '+Q.hasard.parts+' coude '+Q.hasard.coude:null;}
  if(carte==='jade'){o.porte=Q.porte0&&Q.porte0.s!=null?fr('porte0'):null;}
  rep.push({o,ctrl:jsonOut?r.ctrl:null,Q:jsonOut?Q:null});}
let sd=0,sa=0,np=0;const Lm=pistes.reduce((a,b)=>a+b.L,0)/pistes.length;
for(let i=0;i<pistes.length;i++)for(let j=i+1;j<pistes.length;j++){const A=pistes[i].p,Bp=pistes[j].p;let d=0,sx=0,sy=0;
  for(let k=0;k<64;k++){d+=Math.hypot(A[k][0]-Bp[k][0],A[k][1]-Bp[k][1]);sx+=A[k][0]*Bp[k][0]+A[k][1]*Bp[k][1];sy+=A[k][0]*Bp[k][1]-A[k][1]*Bp[k][0];}
  const th=Math.atan2(sy,sx),c=Math.cos(th),s=Math.sin(th);let da=0;for(let k=0;k<64;k++){const x=A[k][0]*c-A[k][1]*s,y=A[k][0]*s+A[k][1]*c;da+=Math.hypot(x-Bp[k][0],y-Bp[k][1]);}
  sd+=d/64;sa+=da/64;np++;}
const res={carte,palier:pal,n:nG,ecart:+(sd/np/Lm).toFixed(3),ecartAligne:+(sa/np/Lm).toFixed(3),L:[Math.min(...rep.map(r=>r.o.L)),Math.max(...rep.map(r=>r.o.L))],
  cap:[Math.min(...rep.map(r=>r.o.cap)),Math.max(...rep.map(r=>r.o.cap))],conflitsMax:Math.max(...rep.map(r=>r.o.conflits||0)),rmin:Math.min(...rep.map(r=>r.o.rmin)),
  deniv:[Math.min(...rep.map(r=>r.o.deniv)),Math.max(...rep.map(r=>r.o.deniv))],msMax:Math.max(...rep.map(r=>r.o.ms))};
console.log(JSON.stringify(res));
if(process.argv.includes('-v'))for(const r of rep)console.log(JSON.stringify(r.o));
if(jsonOut)fs.writeFileSync(jsonOut,JSON.stringify({res,pistes:rep}));
