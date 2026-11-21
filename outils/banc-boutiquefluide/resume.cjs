// LE RÉSUMÉ DU BANC DU PARCOURS (2026-11-21, lot « boutiquefluide »)
//   node outils/banc-boutiquefluide/resume.cjs <dossier>... [--sauf 1]      (--sauf : numéros d'essais à écarter, ex. le 1er qui remplit la base des photos)
// Par étape et par essai (avec / sans) : médiane [min-max] de la pire image, des images > 50 ms et > 100 ms, du temps perdu (somme des dépassements de 16,7 ms) ;
// puis, pour « sans » (l'avant), le temps perdu par étape rangé, et ce qui remplit les pires images (fonctions suivies, causes), sommé sur tous les essais.
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), dirs = [], sauf = new Set();
for (let i = 0; i < args.length; i++) { if (args[i] === '--sauf') { String(args[++i]).split(',').forEach(x => sauf.add(x)); } else dirs.push(args[i]); }
const E = [];
for (const d of dirs) for (const f of fs.readdirSync(d).filter(f => /^\d+-(avec|sans)\.json$/.test(f))) { const R = JSON.parse(fs.readFileSync(path.join(d, f))); R._src = path.basename(d) + '/' + f; if (sauf.has(String(R.n)) || sauf.has(path.basename(d) + ':' + R.n)) continue; E.push(R); }
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; };
const f0 = x => Math.round(x);
const etapes = []; for (const R of E) for (const k of Object.keys(R.etapes || {})) if (etapes.indexOf(k) < 0) etapes.push(k);
console.log('essais : ' + E.map(R => R._src + (R.erreur ? ' ERREUR ' + R.erreur : '') + (R.exc && R.exc.length ? ' EXC ' + R.exc.length : '') + (R.loopErr ? ' loopErr' : '')).join(' · '));
console.log('\n| étape | mesure | avec (après) | sans (avant) |\n|---|---|---|---|');
for (const k of etapes) {
  for (const [m, lib] of [['pire', 'pire image (ms)'], ['plus50', 'images > 50 ms'], ['plus100', 'images > 100 ms'], ['perdu50', 'perdu au-delà de 50 ms (ms)'], ['perduMs', 'temps perdu (ms)']]) {
    const c = e => { const v = E.filter(R => R.essai === e && R.etapes && R.etapes[k] && R.etapes[k][m] != null).map(R => R.etapes[k][m]); return v.length ? f0(med(v)) + ' [' + f0(Math.min(...v)) + '-' + f0(Math.max(...v)) + '] n=' + v.length : '—'; };
    console.log('| ' + k + ' | ' + lib + ' | ' + c('avec') + ' | ' + c('sans') + ' |');
  }
}
for (const e of ['sans', 'avec']) {
  const S = E.filter(R => R.essai === e); if (!S.length) continue;
  console.log('\n## ' + e + ' : temps perdu par étape (médiane), et ce qui remplit les pires images (somme sur ' + S.length + ' essais)');
  const L = etapes.map(k => [k, med(S.filter(R => R.etapes[k]).map(R => R.etapes[k].perduMs))]).sort((a, b) => b[1] - a[1]);
  console.log(L.map(x => x[0] + ' ' + f0(x[1])).join(' · '));
  const suiv = {}, causes = {}, tout = {};
  for (const R of S) for (const k of etapes) { const P = R.etapes[k]; if (!P) continue; const pi = P.pireImage; if (pi) { for (const [n, v] of Object.entries(pi.suivies || {})) suiv[n] = (suiv[n] || 0) + v; for (const [n, v] of Object.entries(pi.causes || {})) causes[n] = (causes[n] || 0) + v; }
    for (const [n, v] of Object.entries(P.suivies || {})) tout[n] = (tout[n] || 0) + v; }
  const tri = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([n, v]) => n + ' ' + f0(v / S.length)).join(' · ');
  console.log('pires images, fonctions (ms par essai) : ' + tri(suiv));
  console.log('pires images, causes (ms par essai) : ' + tri(causes));
  console.log('tout le parcours, fonctions (ms par essai) : ' + tri(tout));
}
