/* ===== LE RYZEN, GENERATION PAR GENERATION (28/11/2026, lecteur de la selection) =====
   Lecture seule. Entree : une copie de ml/evolution/etat/generations.jsonl de la branche evolution-ryzen
   (git show origin/evolution-ryzen:ml/evolution/etat/generations.jsonl > gen.jsonl). Usage : node <ce fichier> gen.jsonl */
'use strict';
const fs=require('fs');
const L=fs.readFileSync(process.argv[2],'utf8').split('\n').filter(Boolean).map(x=>JSON.parse(x));
console.log('G | epoque | debit_h | jouees | duree_s | sigmaRes | pop : ahat min/med/max | se_F med | F champion');
for(const g of L){const P=(g.population||[]).filter(p=>p.ahat!=null),a=P.map(p=>p.ahat).sort((x,y)=>x-y),s=P.map(p=>p.se_F).filter(x=>x!=null).sort((x,y)=>x-y);
  console.log([g.generation,g.epoque,g.debit_h,g.courses&&g.courses.jouees,g.duree_s,g.sigmaRes,a.length?a[0]+'/'+a[a.length>>1]+'/'+a[a.length-1]:'-',s.length?s[s.length>>1]:'-',g.champion&&g.champion.F].join(' | '));}
