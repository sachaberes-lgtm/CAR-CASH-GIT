#!/usr/bin/env node
/* (2026-11-04, passe perf mobile 2, T0) COMPARER deux mesures du banc : node outils/banc-perf/compare.cjs base.json apres.json
   Une ligne par map : Δ % des compteurs (appels, triangles, programmes, textures, géométries, toiles). Les COMPTEURS du rendu sont déterministes
   (même graine, même map) : au palier 2, tout écart > 0 est affiché en ROUGE et la sortie vaut 1 (« la fusion est refusée »). Les temps (pire, longues,
   tas) dépendent de la charge : montrés, jamais fatals. Fichiers de démarrage (clé `mediane`) : tâches > 50 ms, ScriptDuration, menu. */
const fs=require('fs');const [,,A,B]=process.argv;if(!A||!B){console.error('usage : compare.cjs base.json apres.json');process.exit(2);}
const a=JSON.parse(fs.readFileSync(A,'utf8')),b=JSON.parse(fs.readFileSync(B,'utf8'));
const R=s=>'\x1b[31m'+s+'\x1b[0m',V=s=>'\x1b[32m'+s+'\x1b[0m';let rouge=0;const TA=+process.env.TOL_APPELS||2,TT=+process.env.TOL_TRI||2; /* tolérance du palier 2 (appels ±2, triangles ±2 %) : mesurée le 5/11, 3 maps sur 11 seulement la tiennent d'un banc à l'autre (nuages, ville, jade) — voir mesures/LISEZMOI */

const pct=(x,y)=>x==null||y==null?'  n/a':(x===0?(y===0?'   0%':' +inf'):((y-x)/x*100>=0?'+':'')+((y-x)/x*100).toFixed(1)+'%');
const fiable=a.tempsFiables!==false&&b.tempsFiables!==false;if(!fiable)console.log('ⓘ temps NON fiables (charge machine ≥ 8 : '+a.charge+' → '+b.charge+') : seuls les compteurs sont comparés');
if(a.mediane&&b.mediane){const m=a.mediane,n=b.mediane;
  for(const k of ['menu_s','taches_50','taches_ms','pire_tache','script_s','tas_mo','programmes','toiles'])console.log(k.padEnd(12),String(m[k]).padStart(8),'→',String(n[k]).padStart(8),pct(m[k],n[k]));
  console.log('menu10s     ',JSON.stringify(m.menu10s),'→',JSON.stringify(n.menu10s));process.exit(0);}
const CPT=['appels','triangles','programmes','textures','geometries','toiles'],TPS=['pire','longues','pireVol','longuesVol','tas'];
const idx={};for(const m of b.mesures)idx[m.map]=m;
console.log('palier',a.palier,'→',b.palier,'| charge',a.charge,'→',b.charge);
console.log('map'.padEnd(14)+CPT.map(k=>k.slice(0,9).padStart(18)).join('')+'   | pire/longues');
for(const m of a.mesures){const n=idx[m.map];if(!n){console.log(m.map,'absente de',B);continue;}
  let ligne=m.map.padEnd(14);
  for(const k of CPT){const tol=k==='appels'?TA:k==='triangles'?m[k]*TT/100:0;const bouge=Math.abs(m[k]-n[k])>tol;const s=(m[k]+'→'+n[k]+' '+pct(m[k],n[k])).padStart(18);
    if(bouge&&a.palier===2&&b.palier===2){rouge++;ligne+=R(s);}else ligne+=(bouge?(n[k]<m[k]?V(s):s):s);}
  console.log(ligne+'   | '+m.pire+'/'+m.longues+' → '+n.pire+'/'+n.longues+(fiable?'':' (temps non fiables)'));}
if(rouge){console.log(R('✘ '+rouge+' compteur(s) du palier 2 ont bougé : fusion refusée'));process.exit(1);}
console.log('✔ rien n\'a bougé au palier 2 (ou comparaison hors palier 2)');
