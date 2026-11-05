#!/usr/bin/env node
/* ===== LES RETRAITS DE LA COPIE PUBLIÉE (2026-11-05, Opus : jury IOS-11 / SON-01 « réutiliser les retraits de vercel-build.sh ») =====
   Les fichiers d'ATELIER du son que le jeu ne demande jamais (la bibliothèque, ses catalogues, le lobby du garage qu'il ne joue plus,
   les boucles sauf la frénésie, les départs, les petites musiques, les pages-sources des paliers) : une seule liste, appelée par
   vercel-build.sh (le site) ET par app-ios/preparer-www.js (l'app). Avant, l'app embarquait tout ce que le site ne publiait plus.
   Le détail de chaque ligne (qui, quand, pourquoi) est resté dans vercel-build.sh, en commentaire au-dessus de l'appel.
   usage : node outils/retraits-publies.cjs <dossier publié>   (le dossier qui contient index.html et assets/)
           require('./retraits-publies.cjs')(dossier) → nombre de fichiers retirés */
'use strict';
const fs = require('fs'), path = require('path');
const M = 'assets/audio/music/';
/* chemins retirés en entier (fichier ou dossier) */
const ENTIERS = [M + 'depart', M + 'petites-musiques', M + 'lobby/menu-donnees.js', M + 'lobby/chris-donnees.js',
  M + 'direct/french-touch.html', M + 'direct/gouts-mesures.json', M + 'direct/musique-glisse.js'];
/* motifs dans un dossier : [dossier, filtre du nom de fichier à RETIRER] */
const MOTIFS = [
  [M + 'paliers', n => /\.html$/i.test(n)],                    /* les pages-sources des paliers (le dossier lui-même reste) */
  [M + 'lobby', n => /^garage-.*\.m4a$/i.test(n)],             /* le lobby du garage que le jeu ne joue plus */
];
/* boucles/ : tout part SAUF dark-triad.m4a (la frénésie, MUSIC_FREN.f) — sous-dossiers compris, comme `find -type f` */
const BOUCLES = M + 'boucles', BOUCLES_GARDE = new Set(['dark-triad.m4a']);
function retire(dos) {
  let n = 0;
  const rm = p => { if (!fs.existsSync(p)) return; const s = fs.statSync(p); if (s.isDirectory()) { for (const f of fs.readdirSync(p)) rm(path.join(p, f)); fs.rmdirSync(p); } else { fs.unlinkSync(p); n++; } };
  for (const r of ENTIERS) rm(path.join(dos, r));
  for (const [d, f] of MOTIFS) { const D = path.join(dos, d); if (fs.existsSync(D)) for (const x of fs.readdirSync(D)) { const p = path.join(D, x); if (fs.statSync(p).isFile() && f(x)) { fs.unlinkSync(p); n++; } } }
  const fichiers = d => { if (!fs.existsSync(d)) return; for (const x of fs.readdirSync(d)) { const p = path.join(d, x); if (fs.statSync(p).isDirectory()) fichiers(p); else if (!BOUCLES_GARDE.has(x)) { fs.unlinkSync(p); n++; } } };
  fichiers(path.join(dos, BOUCLES));
  /* aucun script Python ne part */
  const py = d => { for (const x of fs.readdirSync(d)) { const p = path.join(d, x); if (fs.statSync(p).isDirectory()) py(p); else if (/\.py$/i.test(x)) { fs.unlinkSync(p); n++; } } };
  py(dos);
  return n;
}
module.exports = retire;
if (require.main === module) {
  const dos = process.argv[2];
  if (!dos || !fs.existsSync(path.join(dos, 'index.html'))) { console.error('retraits-publies : pas d\'index.html dans ' + dos); process.exit(2); }
  console.log('retraits-publies : ' + retire(dos) + ' fichiers d\'atelier retirés de ' + dos);
}
