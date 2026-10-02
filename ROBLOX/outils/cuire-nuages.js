#!/usr/bin/env node
/* CASH CAR — ROBLOX : CUIT les NUAGES v8 du jeu web (VERSION PRINCIPALE/index.html) en maillages pour Roblox.
   On exécute les deux fonctions PURES du jeu : le SCULPTEUR de cumulus (cumulus8 : base plate, dôme, tours, tourelles, rouleaux,
   troupeaux, lambeaux, enclume) et la SURFACE (nuage8Calc : l'isosurface d'un champ de densité, maillée par surface nets, normales =
   gradient, modelé cuit dans les sommets) — avec le même hasard que cotonInit (mulberry32(0xC07070)) : ce sont les 25 gabarits du jeu.
   Sorties, dans src/ReplicatedStorage/CashCar/Nuages/ :
     Liste.luau   les 25 fiches (genre, base, sommet, étendue)
     Nxx.luau     un gabarit : v = 12 octets par sommet (x,y,z int16 en 1/8000 d'unité de nuage · normale int8 ×3 · r,g,b), t = triangles (uint16)
   Le modelé du jeu web (R = creux, G = l'ombre des bourgeons du dessus, B = la hauteur) ET sa lumière sont rendus en COULEUR (voir peint).
   Repère cuit : (x,y,z) → (−x, y, −z), comme tout le reste.
   node ROBLOX/outils/cuire-nuages.js [finesse]         (finesse 14 : 22 610 triangles, le tiers du budget de maillages ; à relancer quand les nuages du jeu web changent) */
const fs = require('fs'), path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const SORTIE = path.join(__dirname, '..', 'src', 'ReplicatedStorage', 'CashCar', 'Nuages');
const L = fs.readFileSync(path.join(RACINE, 'VERSION PRINCIPALE', 'index.html'), 'utf8').split('\n');
const FINESSE = parseInt(process.argv[2] || '12', 10);
const FINE = parseInt(process.argv[3] || '26', 10); // la finesse des nuages PROCHES

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
/* LA LUMIÈRE D'UN PEINTRE, CUITE (nuage8Mat du jeu web, L8127) : Roblox n'a pas de matière sur mesure — son éclairage (une frontière
   d'ombre dure, un reflet de plastique) faisait des ICEBERGS. On cuit donc dans les sommets la formule du jeu : une frontière d'ombre
   douce (smoothstep −0,25 → 0,5 sur N·L), le côté soleil CRÈME, le côté ombre pris par le CIEL (bleu-lavande, plus lavande sous le
   ventre), l'ombre portée des bourgeons du haut (tv), les creux (ao), le modelé du côté ombre (le ciel d'en face, la mer dessous).
   Côté Roblox, toutes les normales pointent vers le HAUT (voir Client/Nuages) : sa lumière devient la même partout (× K), et c'est
   cette couleur-ci qu'on voit. Le soleil est celui de Roblox (Lighting:GetSunDirection à 14 h 36, latitude 23) : les nuages ne
   tournent presque plus sur eux-mêmes (±0,4 rad), leur côté clair regarde le soleil du ciel. */
// (3e retour de Sacha : « c'est toujours moche ») Le soleil du jeu web est RASANT (SUN_DIR, 5,9° au-dessus de l'horizon) : vus de
// la route, les nuages ont un grand flanc crème-pêche et un flanc lavande. Cuits avec le soleil HAUT de Roblox (51°), on ne voyait
// de la route que leurs flancs à l'ombre : un ciel de nuages violets. Le soleil cuit est donc rasant, dans l'azimut du soleil de
// Roblox ; le côté soleil est crème-pêche (la brume de contre-jour du web, fogCj), l'ombre un lavande clair.
const SOL = (() => { const v = [-0.95, 0.3, -0.014], l = Math.hypot(v[0], v[1], v[2]); return v.map(x => x / l); })(), K = 1.3;
const SOLEIL = [292, 262, 222], OMBRE_H = [196, 202, 240], OMBRE_B = [176, 180, 230];
const FD = (() => { const f = [-SOL[0], 0.55, -SOL[2]], l = Math.hypot(f[0], f[1], f[2]); return f.map(x => x / l); })();
function peint(N, ao, tv, hh) {
  const l = Math.hypot(N[0], N[1], N[2]) || 1, n = [N[0] / l, N[1] / l, N[2] / l];
  const nl = n[0] * SOL[0] + n[1] * SOL[1] + n[2] * SOL[2];
  // (le jeu web passe ensuite par son étalonnage — contraste 1,28, ACES — qui remonte les clairs : ici on ouvre la lumière d'autant,
  // sinon tout le nuage sortait GRIS-BEIGE, la crème ne touchait que les crêtes)
  const lit = Math.pow(ss(-0.3, 0.5, nl) * (1 - 0.45 * (1 - tv)) * (0.5 + 0.5 * ao), 0.75);
  const ciel = ss(-0.35, 0.8, n[1]);
  const fl = (0.72 + 0.38 * Math.max(0, n[0] * FD[0] + n[1] * FD[1] + n[2] * FD[2]) + 0.12 * Math.max(0, -n[1])) / 0.98;
  const om = Math.min(1.2, fl) * (0.74 + 0.26 * ao) * (0.92 + 0.08 * hh) * 1.04;
  return [0, 1, 2].map(j => {
    const o = (OMBRE_B[j] + (OMBRE_H[j] - OMBRE_B[j]) * ciel) * om;
    return Math.max(0, Math.min(255, Math.round((o + (SOLEIL[j] - o) * lit) / K)));
  });
}
fs.mkdirSync(SORTIE, { recursive: true });
for (const f of fs.readdirSync(SORTIE)) fs.unlinkSync(path.join(SORTIE, f));
// UN gabarit à une finesse : le module Luau (prefixe N = l'ébauche de tous les nuages, F = la version FINE des nuages proches)
function cuire(S, k, fin, prefixe) {
  const r = G.nuage8Calc(S.B, S.base, S.top, fin, Object.assign({ seed: S.seed }, G.N8_OPT));
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
    v.set(peint([-r.nor[i * 3], r.nor[i * 3 + 1], -r.nor[i * 3 + 2]], ao, tv, hh), i * 12 + 9);
  }
  // (x,z) → (−x,−z) est une rotation : le sens des faces est gardé
  const t = Buffer.alloc(r.idx.length * 2);
  for (let i = 0; i < r.idx.length; i++) t.writeUInt16LE(r.idx[i], i * 2);
  const src = '-- CASH CAR — nuage ' + k + ' (' + S.vrai + ', finesse ' + fin + ') — CUIT par outils/cuire-nuages.js, ne pas éditer.\nreturn { v = "' + v.toString('base64') + '", t = "' + t.toString('base64') + '" }\n';
  if (src.length > 195000) throw new Error('gabarit ' + prefixe + k + ' : module trop gros (' + src.length + ')');
  fs.writeFileSync(path.join(SORTIE, prefixe + String(k).padStart(2, '0') + '.luau'), src);
  return { nt: r.idx.length / 3, ko: src.length, mn, mx };
}
const fiches = []; let total = 0, ko = 0, totalF = 0, koF = 0;
gabarits.forEach((S, k) => {
  const e = cuire(S, k, k === 24 ? FINESSE + 6 : FINESSE, 'N');
  total += e.nt; ko += e.ko;
  // LA FINESSE DU TOUT PRÈS (N8_FIN du web : 12 / 18 / 26 / 48 selon la distance) : ici une seule, chargée pour les nuages proches
  // (Client/Nuages, finesseTick). Le cumulonimbus des titans n'est jamais près de la route : pas de version fine.
  let nf = 0;
  if (k !== 24) { const f = cuire(S, k, FINE, 'F'); nf = f.nt; totalF += f.nt; koF += f.ko; }
  fiches.push('	[' + k + '] = { genre = "' + S.genre + '", forme = "' + S.vrai + '", base = ' + n3(S.base) + ', sommet = ' + n3(S.top) + ', triangles = ' + e.nt + ', fin = ' + nf +
    ', mn = { ' + e.mn.map(n3).join(', ') + ' }, mx = { ' + e.mx.map(n3).join(', ') + ' } },');
  console.log('  ' + String(k).padStart(2) + ' ' + S.vrai.padEnd(14) + String(S.B.length).padStart(3) + ' lobes ' + String(e.nt).padStart(6) + ' triangles (fins : ' + String(nf).padStart(5) + ') ' + (e.ko / 1024).toFixed(0).padStart(4) + ' Ko   ' +
    [0, 1, 2].map(j => n3(e.mx[j] - e.mn[j])).join(' × '));
});
fs.writeFileSync(path.join(SORTIE, 'Liste.luau'), '-- CASH CAR — LES 25 GABARITS DE NUAGES v8 — CUIT par outils/cuire-nuages.js depuis VERSION PRINCIPALE/index.html, ne pas éditer.\n' +
  '-- En unités de nuage (un nuage de rayon r se pose à l\'échelle r) ; base = le plancher de condensation, sommet = le plus haut bourgeon.\n' +
  '-- genre = la famille du tirage (COTON_GENRES ; « classique » pour les six premiers), forme = ce que le sculpteur a bâti.\nreturn {\n' + fiches.join('\n') + '\n}\n');
console.log('25 gabarits cuits (finesse ' + FINESSE + ') : ' + total + ' triangles, ' + (ko / 1024).toFixed(0) + ' Ko ; fins (finesse ' + FINE + ') : ' + totalF + ' triangles, ' + (koF / 1024).toFixed(0) + ' Ko');
