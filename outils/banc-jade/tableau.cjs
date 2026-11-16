/* (2026-11-14, optimiseur de Jade) LE TABLEAU « référence / après » d'une ou plusieurs sorties de mesure.cjs : par cas, appels de dessin (moyenne / pire),
   triangles et sommets calculés (milliers, moyenne des 6 abscisses), part de Jade dans les appels, ms de tirage (bruitée), mémoire de la vallée (inj-memoire.js).
   node outils/banc-jade/tableau.cjs <sortie.json>… */
const fs = require('fs');
const L = [];
for (const f of process.argv.slice(2)) for (const l of JSON.parse(fs.readFileSync(f, 'utf8'))) L.push(l);
const jade = a => { const g = a.moy.g || {}; return (g.jO ? g.jO.n : 0) + (g.jM ? g.jM.n * 3 : 0); };
const mem = a => { const m = a.memJ || {}; return m.gab != null ? (m.grille + m.geo + m.fin + m.famOct + m.racineOct).toFixed(1) + ' Mo (grilles ' + m.grille + ', géométries ' + m.geo + ', fins ' + m.fin + ', instances ' + m.famOct + ')' : '?'; };
console.log('| cas | appels moy. réf → après | pire | dont Jade | triangles (k) | sommets (k) | ms de tirage | mémoire de la vallée réf → après | géom./tex. GPU réf → après |');
console.log('|---|---|---|---|---|---|---|---|---|');
const S = { n: 0 };
for (const l of L) {
  const r = l.ref && l.ref.audit, b = l.br && l.br.audit;
  if (!r || !r.moy || !b || !b.moy) { console.log('| ' + l.cas + ' | (échec) |'); continue; }
  console.log('| ' + l.cas.replace(/&poste=max/, '').replace(/pistegraine=/, 'g') + ' | ' + r.moy.appels + ' → **' + b.moy.appels + '** | ' + r.moy.appelsMax + ' → ' + b.moy.appelsMax + ' | ' + jade(r).toFixed(0) + ' → ' + jade(b).toFixed(0) + ' | ' + Math.round(r.moy.tri) + ' → ' + Math.round(b.moy.tri) + ' | ' + Math.round(r.moy.som) + ' → ' + Math.round(b.moy.som) + ' | ' + r.moy.ms + ' → ' + b.moy.ms + ' | ' + mem(r) + ' → ' + mem(b) + ' | ' + (r.memJ ? r.memJ.gpuGeo + '/' + r.memJ.gpuTex : '?') + ' → ' + (b.memJ ? b.memJ.gpuGeo + '/' + b.memJ.gpuTex : '?') + ' |');
}
