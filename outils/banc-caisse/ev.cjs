// LE BANC DE LA CAISSE — un coup de pinceau sur l'hôte (hote.cjs, qui garde la seule session CDP) : évalue une expression (ou un fichier .js), photographie, recharge.
//   node outils/banc-caisse/ev.cjs "expr"   · --f script.js   · --shot out.png [--clip x,y,w,h] (pixels d'ÉCRAN : ×3)   · --nav "index.html?…" ['{"save":…}'] [--fmt debout] [--pc] [--graine n]
const fs = require('fs'), path = require('path');
const H = JSON.parse(fs.readFileSync(path.join(__dirname, '.hote.json'), 'utf8'));
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const a = process.argv.slice(2); let q;
if (a[0] === '--nav') { const j = a.indexOf('--fmt'); q = { op: 'nav', url: a[1], save: Object.assign({}, SAVE, a[2] && a[2][0] === '{' ? JSON.parse(a[2]) : {}), fmt: j > 0 ? a[j + 1] : null, pc: a.indexOf('--pc') > 0, graine: a.indexOf('--graine') > 0 ? +a[a.indexOf('--graine') + 1] : 0 }; }
else if (a[0] === '--shot') { const i = a.indexOf('--clip'); q = { op: 'shot', file: path.resolve(a[1]), clip: i > 0 ? a[i + 1].split(',').map(Number) : null }; }
else q = { op: 'ev', expr: a[0] === '--f' ? fs.readFileSync(a[1], 'utf8') : a[0] };
fetch(`http://127.0.0.1:${H.http}/__cmd`, { method: 'POST', body: JSON.stringify(q) }).then(r => r.text()).then(t => { console.log(t); process.exit(0); })
  .catch(e => { console.error(String(e).slice(0, 300)); process.exit(1); });
