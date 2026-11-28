/* ===== LE BRUIT DU PALIER SELON LE NIVEAU, ET LA PUISSANCE (28/11/2026, lecteur de la selection) =====
   Lecture seule. Par pilote (au moins 12 courses mesurees de 900 s) : palier moyen et ecart-type entre graines. Puis, avec sigma = 3,0
   (generations.jsonl du Ryzen, sigmaRes des gen. 1 a 17), l'erreur-type et l'ecart reconnaissable entre deux niveaux selon les courses.
   Usage : node <ce fichier> <courses.jsonl> [...] */
'use strict';
const fs=require('fs');
const par=new Map();
for(const f of process.argv.slice(2))for(const x of fs.readFileSync(f,'utf8').split('\n'))if(x){let l;try{l=JSON.parse(x);}catch(e){continue;}
  if(l.mesuree!==true||l.tmax!==900)continue;const k=f+'|'+l.pilote;if(!par.has(k))par.set(k,new Map());par.get(k).set(l.graine,l.palier);}
const R=[];for(const [k,m] of par){const v=[...m.values()];if(v.length<12)continue;const mu=v.reduce((s,x)=>s+x,0)/v.length;
  const sd=Math.sqrt(v.reduce((s,x)=>s+(x-mu)**2,0)/(v.length-1));R.push({mu,sd,n:v.length});}
R.sort((a,b)=>a.mu-b.mu);
console.log('pilotes (>= 12 courses) : '+R.length);
const t=[[0,6],[6,7],[7,8],[8,99]];
for(const [a,b] of t){const S=R.filter(r=>r.mu>=a&&r.mu<b);if(!S.length)continue;
  console.log('palier moyen ['+a+' ; '+b+'[ : '+S.length+' pilotes, ecart-type entre graines moyen '+(S.reduce((s,r)=>s+r.sd,0)/S.length).toFixed(2)+', cv '+(S.reduce((s,r)=>s+r.sd/r.mu,0)/S.length).toFixed(2));}
console.log('\nsigma 3,0 : n courses | se du palier moyen | ecart reconnaissable entre deux pilotes (2 x racine(2) x se) | niveaux tenables sur 1-30 | pilotes notes par jour a 420 courses/h');
for(const n of [12,24,48,96,192]){const se=3/Math.sqrt(n),d=2*Math.SQRT2*se;console.log(n+' | '+se.toFixed(2)+' | '+d.toFixed(2)+' | '+Math.floor(29/d+1)+' | '+Math.floor(420*24/n));}
/* le bruit grandit avec le niveau (cv ~0,5 mesure plus haut, sur des pilotes de palier moyen 5 a 9 seulement) : en relatif, l'erreur-type vaut
   0,5/racine(n) ; deux niveaux se distinguent si leur rapport depasse exp(2 x racine(2) x 0,5/racine(n)) ; niveaux tenables de 1 a 30 :
   ln(30)/ln(rapport) + 1 (une echelle geometrique). Extrapolation : aucun pilote mesure au-dessus du palier moyen 9. */
console.log('\ncv 0,5 : n courses | rapport reconnaissable entre deux niveaux | niveaux tenables sur 1-30 (echelle geometrique)');
for(const n of [12,24,48,96]){const r=Math.exp(2*Math.SQRT2*0.5/Math.sqrt(n));console.log(n+' | '+r.toFixed(2)+' | '+Math.floor(Math.log(30)/Math.log(r)+1));}
