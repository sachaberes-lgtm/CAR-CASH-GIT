// Preuve sans navigateur (débogage sortie iOS, 24/10) : le LISSAGE de l'assiette du vol équilibré (VEQ.pose, VEQ.qb, VEQ.ext) et de l'AIMANT À
// PIÈCES (attraction, pièce accrochée) avance du même chemin par seconde à 30, 60 et 120 images/s.
// On extrait d'index.html les VRAIES lignes et la vraie lisse60, on les exécute avec des bouchons (cible fixe, caisse immobile) pendant 0,5 s
// à chaque cadence, et on compare au chemin de 60 i/s (la référence réglée). « AVANT » = les mêmes lignes avec l'ancien Math.min(1,dt*k).
// Usage : node preuve-lisse60.cjs "<index.html>"   Sort 0 si APRÈS est identique à 60 i/s (< 1e-9) et AVANT ne l'est pas.
const fs=require('fs');const src=fs.readFileSync(process.argv[2],'utf8');
const ligne=t=>{const i=src.indexOf(t);if(i<0)throw new Error('introuvable : '+t);return src.slice(i,src.indexOf(';',i)+1);};
const L60=src.match(/function lisse60\(k,dt\)\{[^\n]*\}/)[0];
const RAM_K=+src.match(/\bRAM_K\s*=\s*([\d.]+)/)[1],RAM_A=+src.match(/\bRAM_A\s*=\s*([\d.]+)/)[1];
const L={pose:ligne('VEQ.pose+=(a-VEQ.pose)*'),qb:ligne('VEQ.qb.slerp(qTmp,'),ext:ligne('VEQ.ext+=(K.ext-VEQ.ext)*'),
  aim:ligne('p.mesh.position.lerp(carGroup.position,lisse60('),acc:ligne('const f9=lisse60(RAM_K+RAM_A*p.hk,dt)')};
const ANCIEN='function lisse60(k,dt){return Math.min(1,dt*k);}';
function joue(hz,fn){ // 0,5 s : l'état à 0,1 / 0,2 / … / 0,5 s
  const f=new Function('dt','S','RAM_K','RAM_A',fn+';const VEQ=S.VEQ,K={ext:.3},a=1,qTmp=null,p=S.p,carGroup={position:null},mag=2;'+
    'VEQ.qb.slerp=function(q,k){VEQ.qb.th*=(1-k);};p.mesh.position.lerp=function(c,k){p.mesh.position.d*=(1-k);};'+
    L.pose+L.qb+L.ext+L.aim+L.acc+'S.f9=f9;');
  const S={VEQ:{pose:0,ext:0,qb:{th:1}},p:{hk:.05,mesh:{position:{d:10}}}},out=[];const n=Math.round(hz*.5),dt=1/hz;
  for(let i=1;i<=n;i++){f(dt,S,RAM_K,RAM_A);if(i%(hz/10)===0)out.push([S.VEQ.pose,S.VEQ.qb.th,S.VEQ.ext,S.p.mesh.position.d]);}
  return out;}
function ecart(fn){const r=joue(60,fn);let m=[0,0];[30,120].forEach((hz,j)=>{const x=joue(hz,fn);for(let i=0;i<r.length;i++)for(let c=0;c<4;c++)m[j]=Math.max(m[j],Math.abs(x[i][c]-r[i][c])/Math.max(1e-9,Math.abs(r[i][c])));});return m;}
const av=ecart(ANCIEN),ap=ecart(L60);
const pc=x=>(x*100).toFixed(1)+' %';
console.log('lignes lues :',Object.values(L).map(s=>s.slice(0,48)).join(' | '));
console.log('AVANT (Math.min(1,dt*k)) : écart max au chemin de 60 i/s — à 30 i/s',pc(av[0]),'· à 120 Hz',pc(av[1]));
console.log('APRÈS (lisse60)          : écart max au chemin de 60 i/s — à 30 i/s',av[0]&&ap[0].toExponential(1),'· à 120 Hz',ap[1].toExponential(1));
const ok=ap[0]<1e-9&&ap[1]<1e-9&&av[0]>.01;console.log(ok?'OK : même lissage à 30, 60 et 120 i/s':'KO');process.exit(ok?0:1);
