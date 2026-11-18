/* LE BILAN DU BANC DES NAPPES (2026-11-18, finition des maps) — node outils/banc-nappes/bilan.cjs <fichiers de sortie de grotte-nappes.cjs detail=1 …>
   Une ligne par palier : graines lues, grottes avec lave / eau, et pour AVANT puis APRÈS le nombre de graines touchées par chaque défaut (et le total) :
   cote (cases de nappe peintes avec de l'air sous le niveau à côté : le mur dans le vide), flotte (air dessous : la nappe vue d'en dessous), paroi / dessous (m², maillé),
   contact (lave contre eau), route (dalle dans une nappe), noyes (route sous le niveau). Empreinte de la route : identique avant / après sur chaque graine ? */
const fs = require('fs'), L = {};
for (const f of process.argv.slice(2)) for (const l of fs.readFileSync(f, 'utf8').split('\n')) { if (!l.startsWith('{"mode"')) continue; const o = JSON.parse(l); (L[o.pal + ':' + o.g] = L[o.pal + ':' + o.g] || {})[o.mode] = o; }
const P = {}, K = ['cote', 'flotte', 'paroi', 'dessous', 'contact', 'route', 'noyes']; let routeDiff = 0;
for (const k in L) { const e = L[k]; if (!e.avant || !e.apres) continue; const p = k.split(':')[0], t = P[p] = P[p] || { n: 0, lave: 0, eau: 0, avant: {}, apres: {} };
  t.n++; if (e.avant.lac != null) t.lave++; if (e.avant.eau != null) t.eau++; if (e.avant.h !== e.apres.h) routeDiff++;
  for (const m of ['avant', 'apres']) for (const q of K) { const v = e[m][q] || 0, s = t[m][q] = t[m][q] || { g: 0, tot: 0 }; s.tot += v; if (v > (q === 'paroi' || q === 'dessous' ? 20 : q === 'cote' || q === 'flotte' ? 2 : 0)) s.g++; } }
for (const p of Object.keys(P).sort((a, b) => a - b)) { const t = P[p]; console.log('palier ' + p + ' : ' + t.n + ' graines (lave ' + t.lave + ', eau ' + t.eau + ')');
  for (const m of ['avant', 'apres']) console.log('  ' + m.padEnd(6) + K.filter(q => t[m][q]).map(q => q + ' ' + t[m][q].g + ' gr. / ' + t[m][q].tot).join(' · ')); }
console.log('empreinte de la route différente avant/après :', routeDiff, 'graine(s)');
