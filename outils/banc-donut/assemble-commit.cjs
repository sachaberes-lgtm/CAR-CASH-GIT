// LE DONUT (2026-11-18) : index.html d'un commit donné, recollé depuis SES morceaux (code/ORDRE.txt du commit), sans toucher au worktree.
//   node outils/banc-donut/assemble-commit.cjs <dossier de sortie> <commit> [<commit>…]  → <dossier>/index-<commit>.html
const cp = require('child_process'), fs = require('fs'), path = require('path');
const RAC = path.resolve(__dirname, '..', '..'), [out, ...cs] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const montre = (c, f) => cp.execFileSync('git', ['-C', RAC, 'show', c + ':' + f], { maxBuffer: 1 << 28 });
for (const c of cs) {
  const noms = montre(c, 'code/ORDRE.txt').toString().split(/\r?\n/).map(l => l.replace(/#.*$/, '').trim()).filter(Boolean);
  const b = Buffer.concat(noms.map(n => montre(c, 'code/' + n)));
  fs.writeFileSync(path.join(out, 'index-' + c + '.html'), b); console.log(c, noms.length, 'morceaux', b.length, 'octets');
}
