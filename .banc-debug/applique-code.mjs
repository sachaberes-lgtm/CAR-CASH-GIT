// applique-code.mjs <correctif.json> [--sec] — applique un correctif [{old,new,pourquoi}] aux MORCEAUX de code/ (ceux d'ORDRE.txt).
// Chaque "old" doit apparaître exactement UNE fois dans l'ensemble des morceaux ; sinon refus et rien n'est écrit.
// Après : node code/assembler.cjs --depuis-morceaux (index.html := morceaux).
import fs from 'node:fs'; import path from 'node:path';
const RACINE = '/Users/sachaberes/cash-car/debug-maps', CODE = path.join(RACINE, 'code');
const [cf, opt] = process.argv.slice(2);
const ORDRE = fs.readFileSync(path.join(CODE, 'ORDRE.txt'), 'utf8').split('\n').map(l => l.replace(/#.*/, '').trim()).filter(Boolean);
const M = new Map(ORDRE.map(f => [f, fs.readFileSync(path.join(CODE, f), 'utf8')]));
const L = JSON.parse(fs.readFileSync(cf, 'utf8')); let ko = 0; const touches = new Set();
for (const [i, r] of L.entries()) {
  const ou = []; for (const [f, s] of M) { const n = s.split(r.old).length - 1; for (let k = 0; k < n; k++) ou.push(f); }
  if (ou.length !== 1) { console.log(`#${i} : trouvé ${ou.length} fois${ou.length ? ' (' + [...new Set(ou)].join(', ') + ')' : ''} — ${(r.pourquoi || '').slice(0, 70)} | ${r.old.slice(0, 80).replace(/\n/g, '⏎')}`); ko++; continue; }
  M.set(ou[0], M.get(ou[0]).replace(r.old, () => r.new)); touches.add(ou[0]); console.log(`#${i} → ${ou[0]}`);
}
if (ko) { console.log(ko + ' refusé(s) : rien écrit'); process.exit(1); }
if (opt !== '--sec') for (const f of touches) fs.writeFileSync(path.join(CODE, f), M.get(f));
console.log(L.length + ' remplacement(s) ' + (opt === '--sec' ? 'vérifiés' : 'appliqués') + ' (' + [...touches].join(', ') + ')');
