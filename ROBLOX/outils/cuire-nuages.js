#!/usr/bin/env node
/* CASH CAR — ROBLOX : CUIT les NUAGES v8 du jeu web (VERSION PRINCIPALE/index.html) en maillages pour Roblox.
   On exécute les deux fonctions PURES du jeu : le SCULPTEUR de cumulus (cumulus8 : base plate, dôme, tours, tourelles, rouleaux,
   troupeaux, lambeaux, enclume) et la SURFACE (nuage8Calc : l'isosurface d'un champ de densité, maillée par surface nets, normales =
   gradient, modelé cuit dans les sommets) — avec le même hasard que cotonInit (mulberry32(0xC07070)) : ce sont les 25 gabarits du jeu.
   Sorties, dans src/ReplicatedStorage/CashCar/Nuages/ :
     Liste.luau   les 25 fiches (genre, base, sommet, étendue)
     Nxx.luau     un gabarit : v = 12 octets par sommet (x,y,z int16 en 1/8000 d'unité de nuage · normale int8 ×3 · r,g,b), t = triangles (uint16)
   Le modelé du jeu web (R = creux, G = l'ombre des bourgeons du dessus, B = la hauteur) est rendu en COULEUR : ventre bleu-lavande,
   sommets blancs, creux assombris — la lumière de Roblox fait le reste (elle éclaire par la normale lissée).
   Repère cuit : (x,y,z) → (−x, y, −z), comme tout le reste.
   node ROBLOX/outils/cuire-nuages.js [finesse]         (à relancer quand les nuages du jeu web changent) */
const fs = require('fs'), path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const SORTIE = path.join(__dirname, '..', 'src', 'ReplicatedStorage', 'CashCar', 'Nuages');
const L = fs.readFileSync(path.join(RACINE, 'VERSION PRINCIPALE', 'index.html'), 'utf8').split('\n');
const FINESSE = parseInt(process.argv[2] || '20', 10);

function ligne(debut) { for (let i = 0; i < L.length; i++) if (L[i].startsWith(debut)) return i; throw new Error('introuvable dans index.html : ' + debut); }
function bloc(debut, fin) { const a = ligne(debut); let b = a + 1; while (b < L.length && !L[b].startsWith(fin)) b++; return L.slice(a, b).join('\n'); }
const code = [
  L[ligne('function mulberry32(')],
  L[ligne('const N8_GENRE6=')], L[ligne('const N8_GENRE_V=')], L[ligne('const N8_OPT=')],
  bloc('const COTON_GENRES=', 'function cotonGenre'),
  bloc('function nuage8Calc(', '/* LE SCULPTEUR DE CUMULUS v8'),
  bloc('function cumulus8(', 'function cotonBuf'),
  'return {mulberry32,N8_GENRE6,N8_GENRE_V,N8_OPT,COTON_GENRES,nuage8Calc,cumulus8};',
].join('\n');
const G = new Function(code)();

// les 25 gabarits, dans l'ordre et avec le hasard de cotonInit
const rg = G.mulberry32(0xC07070), gabarits = [];
for (let k = 0; k < 25; k++) {
  const genre = k === 24 ? 'cumulonimbus' : k < 6 ? G.N8_GENRE6[k] : (G.N8_GENRE_V[G.COTON_GENRES[k - 6]] || G.COTON_GENRES[k - 6]);
  const S = G.cumulus8(genre, rg); S.seed = k * 7 + 1; S.genre = k < 6 ? 'classique' : G.COTON_GENRES[k - 6]; S.vrai = genre;
  if (k === 24) S.genre = 'cumulonimbus';
  gabarits.push(S);
}
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const n3 = x => Math.round(x * 1000) / 1000;
fs.mkdirSync(SORTIE, { recursive: true });
for (const f of fs.readdirSync(SORTIE)) fs.unlinkSync(path.join(SORTIE, f));
const fiches = []; let total = 0, ko = 0;
gabarits.forEach((S, k) => {
  const r = G.nuage8Calc(S.B, S.base, S.top, k === 24 ? FINESSE + 6 : FINESSE, Object.assign({ seed: S.seed }, G.N8_OPT));
  const nv = r.pos.length / 3;
  if (nv > 65535) throw new Error('gabarit ' + k + ' : trop de sommets (' + nv + ')');
  const v = Buffer.alloc(nv * 12);
  let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (let i = 0; i < nv; i++) {
    const x = -r.pos[i * 3], y = r.pos[i * 3 + 1], z = -r.pos[i * 3 + 2];
    [x, y, z].forEach((q, j) => { mn[j] = Math.min(mn[j], q); mx[j] = Math.max(mx[j], q); const e = Math.round(q * 8000); if (e < -32768 || e > 32767) throw new Error('gabarit ' + k + ' hors gabarit'); v.writeInt16LE(e, i * 12 + j * 2); });
    v.writeInt8(Math.round(-r.nor[i * 3] * 127), i * 12 + 6); v.writeInt8(Math.round(r.nor[i * 3 + 1] * 127), i * 12 + 7); v.writeInt8(Math.round(-r.nor[i * 3 + 2] * 127), i * 12 + 8);
    // le modelé : R = le creux, G = l'ombre portée des bourgeons du dessus, B = la hauteur
    const ao = r.col[i * 3], tv = r.col[i * 3 + 1], hh = ss(0, 1, r.col[i * 3 + 2]);
    const o = (0.66 + 0.34 * ao) * (0.72 + 0.28 * tv);
    const c = [(0.80 + 0.20 * hh) * o, (0.845 + 0.155 * hh) * o, (0.97 + 0.03 * hh) * o];
    for (let j = 0; j < 3; j++) v[i * 12 + 9 + j] = Math.max(0, Math.min(255, Math.round(c[j] * 255)));
  }
  // (x,z) → (−x,−z) est une rotation : le sens des faces est gardé
  const t = Buffer.alloc(r.idx.length * 2);
  for (let i = 0; i < r.idx.length; i++) t.writeUInt16LE(r.idx[i], i * 2);
  const src = '-- CASH CAR — nuage ' + k + ' (' + S.vrai + ') — CUIT par outils/cuire-nuages.js, ne pas éditer.\nreturn { v = "' + v.toString('base64') + '", t = "' + t.toString('base64') + '" }\n';
  if (src.length > 195000) throw new Error('gabarit ' + k + ' : module trop gros (' + src.length + ')');
  fs.writeFileSync(path.join(SORTIE, 'N' + String(k).padStart(2, '0') + '.luau'), src);
  const nt = r.idx.length / 3; total += nt; ko += src.length;
  fiches.push('\t[' + k + '] = { genre = "' + S.genre + '", forme = "' + S.vrai + '", base = ' + n3(S.base) + ', sommet = ' + n3(S.top) + ', triangles = ' + nt +
    ', mn = { ' + mn.map(n3).join(', ') + ' }, mx = { ' + mx.map(n3).join(', ') + ' } },');
  console.log('  ' + String(k).padStart(2) + ' ' + S.vrai.padEnd(14) + String(S.B.length).padStart(3) + ' lobes ' + String(nt).padStart(6) + ' triangles ' + (src.length / 1024).toFixed(0).padStart(4) + ' Ko   ' +
    [0, 1, 2].map(j => n3(mx[j] - mn[j])).join(' × '));
});
fs.writeFileSync(path.join(SORTIE, 'Liste.luau'), '-- CASH CAR — LES 25 GABARITS DE NUAGES v8 — CUIT par outils/cuire-nuages.js depuis VERSION PRINCIPALE/index.html, ne pas éditer.\n' +
  '-- En unités de nuage (un nuage de rayon r se pose à l\'échelle r) ; base = le plancher de condensation, sommet = le plus haut bourgeon.\n' +
  '-- genre = la famille du tirage (COTON_GENRES ; « classique » pour les six premiers), forme = ce que le sculpteur a bâti.\nreturn {\n' + fiches.join('\n') + '\n}\n');
console.log('25 gabarits cuits (finesse ' + FINESSE + ') : ' + total + ' triangles, ' + (ko / 1024).toFixed(0) + ' Ko');
