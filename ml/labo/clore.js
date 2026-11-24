#!/usr/bin/env node
/* ===== CLORE UNE GENERATION (2026-11-24, etape 1 bis BOTS-ML) =====
   Quand tous les candidats d'une generation sont inscrits : le champion est designe, les courses a garder passent du tampon a git
   (rejeux/ + trajectoires/), la trace fine de TOUTES les courses est ecrite (les cartes), une ligne va au journal des generations,
   et le tampon de la generation se vide.
   usage : node clore.js --etape 3 --generation 0 [--critere argent_min]
     --critere   le chiffre de la note qui designe le champion (argent_min, survie_mediane_s, figures_min, air_pct, raccourcis_min…)
   Ce qui est garde : la meilleure course du champion et sa plus courte, la pire course de la generation, le plus long vol pose,
   le plus de figures en un vol, le plus gros raccourci. Une « mort absurde » ne se repere pas toute seule : garder.js, a la main,
   AVANT de clore (apres, garder.js rejoue la course a partir du code). */
const L=require('./labo');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
if(opt('etape',null)==null||opt('generation',null)==null){console.log('usage : node clore.js --etape N --generation G [--critere argent_min]');process.exit(1);}
if(!/^\d+$/.test(String(opt('generation'))))stop9('--generation : un entier (0, 1, 2…)');
function stop9(m){console.log(m);process.exit(1);}
/* (2026-11-24) une inscription en cours dans cette generation (inscrire.js pose un marqueur au tampon le temps de sa note) : labo.clore refuse */
let g;try{g=L.clore(opt('etape'),parseInt(opt('generation'),10),{critere:opt('critere',null)});}catch(e){console.log(String(e.message||e));process.exit(1);}
console.log(`generation close : etape ${g.etape}, generation ${g.generation} · ${g.candidats} candidat(s), ${g.courses} course(s)`);
console.log(`champion : ${g.champion} (${g.critere} = ${g.note_champion[g.critere]})`);
for(const x of g.gardes)console.log('  garde '+x.course+' — '+x.pourquoi.join(' ; '));
if(g.traces)console.log('traces fines de toutes les courses : '+g.traces);
if(g.sans_tampon.length)console.log('⚠ sans courses au tampon (rien a garder pour eux) : '+g.sans_tampon.join(', '));
console.log('a faire : committer ml/labo/ (journal, cerveaux, rejeux, trajectoires), puis `node arbre.js`');
