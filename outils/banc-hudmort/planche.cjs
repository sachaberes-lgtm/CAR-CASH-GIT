// Planche d'une mort (lot « hudmort ») : une image sur --pas, réduite --k fois (ou un morceau --zone x,y,w,h agrandi --z fois).
//   node outils/banc-hudmort/planche.cjs dossier-de-mort sortie.png [--pas 10] [--k 3] [--cols 4] [--zone x,y,w,h --z 4] [--de 0 --a 999]
const fs = require('fs'), path = require('path');
const { lit, ecrit, coupe, reduit, planche } = require('./png.cjs');
const [, , DOS, SORT] = process.argv; const A = {}; for (let i = 4; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const PAS = +(A.pas || 10), K = +(A.k || 3), COLS = +(A.cols || 4), Z = +(A.z || 4), DE = +(A.de || 0), JUSQUA = +(A.a || 9999);
const ZONE = A.zone ? A.zone.split(',').map(Number) : null;
const f = fs.readdirSync(DOS).filter(x => /^\d{3}\.png$/.test(x)).sort().filter((x, i) => i >= DE && i <= JUSQUA && (i - DE) % PAS === 0);
const imgs = f.map(x => { const im = lit(path.join(DOS, x)); return ZONE ? coupe(im, ZONE[0], ZONE[1], ZONE[2], ZONE[3], Z) : reduit(im, K); });
ecrit(SORT, planche(imgs, COLS)); console.log(f.join(' '));
