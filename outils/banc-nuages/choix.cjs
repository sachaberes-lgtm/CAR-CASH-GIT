/* (2026-11-15) choisit dans un ou plusieurs films (vol-film.cjs) l'image la plus proche de chaque abscisse demandée, en rangées alternées : liste pour grille.ps1
   node outils/banc-nuages/choix.cjs <sortie.txt> <s1,s2,...> <film1.json> [film2.json ...]   (les abscisses relatives au nuage visé si elles commencent par r : r-80,r-40,r0,...) */
const fs=require('fs'),path=require('path');const [OUT,SS,...FI]=process.argv.slice(2);const L=[];
const films=FI.map(f=>({d:path.dirname(path.resolve(f)),J:JSON.parse(fs.readFileSync(f,'utf8'))}));
for(const F of films){for(const s0 of SS.split(',')){const rel=s0[0]==='r',v=+(rel?s0.slice(1):s0),s=rel?F.J.cible.s+v:v;let b=null;
  for(const e of F.J.images)if(e.f&&(!b||Math.abs(e.s-s)<Math.abs(b.s-s)))b=e;if(b)L.push(path.join(F.d,b.f).split(path.sep).join('/'));}}
fs.writeFileSync(OUT,L.join('\n'));console.log(L.length,'images');
