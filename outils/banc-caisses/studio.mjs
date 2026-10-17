// LE STUDIO D'UNE CAISSE (2026-10-17, session ELDORADO) — photographie un gabarit avec `dbgEssaiCaisse` du jeu (720 × 440, et le
// nombre de FACETTES : carrosserie + roues visibles). Le gabarit est soit un nom de SHAPES (« eldorado » : l'AVANT), soit un fichier
// qui contient `function(K){…}` (l'APRÈS, essayé sans toucher au jeu : on itère sans recharger index.html).
//
//   node outils/banc-caisses/studio.mjs <sortie-préfixe> <gabarit|fichier.js> [vues en radians, séparées par des virgules]
//   env : PORT (le jeu servi, défaut 9377) · FICHE (JSON : couleur, cotes… de la caisse ; défaut = l'ELDORADO)
// Vues : la caméra est fixe, c'est la caisse qui tourne ; 0,72 = de face, 3,86 = de dos, 0 et 1,57 = trois-quarts / profil.
import fs from 'node:fs';
import { lance, prepare, charge, passeSplash, sleep } from './cdp.mjs';

const [, , sortie, src = 'eldorado', vuesTxt = '0.72,3.86,1.5708,4.7124,0,3.1416'] = process.argv;
const FICHE = process.env.FICHE ? JSON.parse(process.env.FICHE)
  : { name: 'ELDORADO', color: 0xff6fae, accent: 0xe8ebef, maxKmh: 232, accel: 26, turn: 2.6, h: 1.30, w: 2.02, l: 5.70, spoiler: 0, rar: 'rare' };
const code = fs.existsSync(src) ? fs.readFileSync(src, 'utf8') : src;
const vues = vuesTxt.split(',').map(Number);

const c = await lance({ port: 9477 });
try {
  await prepare(c);
  const ms = await charge(c, `http://127.0.0.1:${process.env.PORT || 9377}/index.html?colonne=0`);
  await passeSplash(c);
  await sleep(1500);
  const r = await c.ev(`dbgEssaiCaisse(${JSON.stringify(code)},${JSON.stringify(FICHE)},${JSON.stringify(vues)})`);
  if (r.err) { console.log('ERREUR', r.err); process.exitCode = 1; }
  else {
    r.photos.forEach((d, i) => fs.writeFileSync(`${sortie}-${i}.png`, Buffer.from(d.split(',')[1], 'base64')));
    console.log(JSON.stringify({ chargement: ms, facettes: r.facettes, horsTout: r.horsTout, avert: r.avert, photos: r.photos.length }));
  }
  if (c.erreurs.length) console.log('ERREURS PAGE', c.erreurs.slice(0, 10));
} finally { await c.fin(); }
