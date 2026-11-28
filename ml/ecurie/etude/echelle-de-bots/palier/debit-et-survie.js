/* lit les 1 250 courses du banc : le debit selon la duree, le risque de mort par minute, les minutes qu'il faudrait pour chaque palier.
   Aucune course jouee. Sortie : console. */
const fs=require('fs');
const L=fs.readFileSync('ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl','utf8').trim().split('\n').map(JSON.parse);
const SEUILS=require('../../../../bot/mesures.js').SEUILS;
const D=L.filter(c=>c.id==='depart');
function bins(C,nom){console.log('--',nom,': pieces selon la survie (tranches de 60 s)');
  for(let a=0;a<480;a+=60){const B=C.filter(c=>c.survie_s>=a&&c.survie_s<a+60);if(!B.length)continue;
    const pm=B.reduce((x,c)=>x+c.pieces,0)/B.reduce((x,c)=>x+c.survie_s/60,0),pcs=B.reduce((x,c)=>x+c.pieces,0)/B.length,t=B.reduce((x,c)=>x+c.survie_s,0)/B.length;
    console.log(`${a}-${a+60} s : n ${B.length}, survie moy ${t.toFixed(0)} s, pieces moy ${pcs.toFixed(0)}, pieces/min ${pm.toFixed(0)}`);}}
bins(D,'c0025');bins(L,'les 1 250');
/* pente : moindres carres pieces = a + b * survie_min, sur les courses de plus de 60 s (le debit d'une minute de plus) */
function pente(C){const X=C.map(c=>c.survie_s/60),Y=C.map(c=>c.pieces),n=X.length,mx=X.reduce((a,b)=>a+b)/n,my=Y.reduce((a,b)=>a+b)/n;
  let sxy=0,sxx=0;for(let i=0;i<n;i++){sxy+=(X[i]-mx)*(Y[i]-my);sxx+=(X[i]-mx)**2;}const b=sxy/sxx;return {n,b:+b.toFixed(1),a:+(my-b*mx).toFixed(1)};}
console.log('pente c0025 (>60 s)',pente(D.filter(c=>c.survie_s>60)));
console.log('pente 1 250 (>60 s)',pente(L.filter(c=>c.survie_s>60)));
console.log('pente 1 250 (>180 s)',pente(L.filter(c=>c.survie_s>180)));
/* risque de mort par minute (mort dans la minute k sachant vivant au debut) */
function risque(C,nom){const o=[];for(let k=0;k<8;k++){const v=C.filter(c=>c.survie_s>=k*60),m=v.filter(c=>c.survie_s<(k+1)*60);if(!v.length)break;o.push(`min ${k+1} : ${v.length} vivants, ${(m.length/v.length*100).toFixed(0)} % meurent`);}console.log('--',nom,'risque par minute\n'+o.join('\n'));}
risque(D,'c0025');risque(L,'les 1 250');
/* pieces/min pour atteindre les paliers 10, 20, 30 en 5, 10, 15, 30 min */
for(const p of [10,20,30])console.log('palier',p,'seuil',SEUILS[p-1],'->',[5,10,15,30].map(m=>`${m} min : ${(SEUILS[p-1]/m).toFixed(0)}/min`).join(' · '));
/* au debit de c0025 (226,6/min), minutes par palier */
console.log('a 226,6/min :',[10,15,20,25,30].map(p=>`P${p} ${(SEUILS[p-1]/226.6).toFixed(1)} min`).join(' · '));
console.log('a 436/min (joueurs) :',[10,15,20,25,30].map(p=>`P${p} ${(SEUILS[p-1]/436).toFixed(1)} min`).join(' · '));
/* palier contre survie : courses de c0025 qui depassent chaque palier */
for(const p of [10,12,14])console.log('c0025 palier >=',p,':',D.filter(c=>c.palier>=p).length,'/ 96');
console.log('seconde chance (morts>1) c0025 :',D.filter(c=>c.morts>1).length,'· 1 250 :',L.filter(c=>c.morts>1).length);
