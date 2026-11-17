// LE TABLEAU S3 (2026-11-17, 3e tour du pilote) : les leviers posés au départ, pilote contre ?sans=pilote, dans les 16 conditions B×E×T.
//   node outils/banc-pilote/borne-table.cjs <pilote.jsonl> <base.jsonl>   (les sorties de pilote.cjs --mode borne, une ligne JSON par essai)
// Une case est « PLUS LOURDE » quand le pilote pose plus que la base : DPR, plafond, halo (taille), étages, ombre, traits, vent/émission plus hauts ; ciel, cran QL, plancher QL plus bas.
// La condition libre (débranché, sans éco, nominal) n'est pas bornée : elle est montrée, pas jugée.
const fs = require('fs');
const lit = f => { const m = {}; for (const l of fs.readFileSync(f, 'utf8').split('\n')) { if (!l.trim().startsWith('{')) continue; try { const o = JSON.parse(l); if (o.lev) m[o.essai.tag] = o.lev; } catch (e) {} } return m; };
const P = lit(process.argv[2]), B = lit(process.argv[3]);
const L = [['n', 1], ['dpr', 1], ['cap', 1], ['halo', 1], ['mips', 1], ['ombre', 1], ['stries', 1], ['ventK', 1], ['emiK', 1], ['ciel', -1], ['ql', -1], ['qlMin', -1]];
const v = (o, k) => k === 'stries' ? (o[k] == null ? 1 : o[k]) : (o[k] == null ? 0 : o[k]);
const f = x => x == null ? '·' : typeof x === 'number' ? String(+x.toFixed(2)).replace('.', ',') : String(x);
let lourdes = 0, cases = 0;
console.log('| condition | ' + L.map(x => x[0]).join(' | ') + ' | verdict |');
console.log('|' + '---|'.repeat(L.length + 2));
for (const tag of Object.keys(P).sort()) {
  const p = P[tag], b = B[tag]; if (!b) { console.log('| ' + tag + ' | (pas de base) |'); continue; }
  const libre = /^B0E0T0$/.test(tag); let lourd = [];
  const cel = L.map(([k, s]) => { const a = v(p, k), c = v(b, k), pire = s > 0 ? a > c + 1e-3 : a < c - 1e-3; if (!libre) cases++; if (pire && !libre) lourd.push(k); return (pire && !libre ? '**' : '') + f(p[k]) + ' / ' + f(b[k]) + (pire && !libre ? '**' : ''); });
  if (lourd.length) lourdes += lourd.length;
  console.log('| ' + tag + ' K' + p.K + ' | ' + cel.join(' | ') + ' | ' + (libre ? 'libre (non borné)' : lourd.length ? 'PLUS LOURD : ' + lourd.join(', ') : 'ok') + ' |');
}
console.log('\ncases jugées ' + cases + ' · plus lourdes ' + lourdes + '  (pilote / base ; halo = la taille du halo posée, 0 = coupé ; stries · = le régime des budgets)');
