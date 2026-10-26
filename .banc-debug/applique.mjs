// applique.mjs <index.html> <correctif.json> [--sec] — [{"old","new","pourquoi"}] ; chaque "old" UNIQUE dans le fichier, sinon refus (rien écrit). --sec : vérifie sans écrire.
import fs from 'node:fs';
const [f, c, opt] = process.argv.slice(2);
let s = fs.readFileSync(f, 'utf8'); const L = JSON.parse(fs.readFileSync(c, 'utf8')); let ko = 0;
for (const [i, r] of L.entries()) { const n = s.split(r.old).length - 1;
  if (n !== 1) { console.log(`#${i} : "old" trouvé ${n} fois (il faut 1) — ${r.old.slice(0, 90).replace(/\n/g, '⏎')}`); ko++; continue; }
  s = s.replace(r.old, () => r.new); }
if (ko) { console.log(ko + ' refusé(s) : rien écrit'); process.exit(1); }
if (opt !== '--sec') { const t = f + '.tmp' + process.pid; fs.writeFileSync(t, s); fs.renameSync(t, f); }
console.log(L.length + ' remplacement(s) ' + (opt === '--sec' ? 'vérifiés' : 'appliqués') + ' à ' + f);
