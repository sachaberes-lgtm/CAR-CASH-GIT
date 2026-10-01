// CASH CAR → ROBLOX : LES ICÔNES PIXEL du web (PXI_G, grilles 9 × 9 dessinées à la main), recopiées telles quelles.
// Usage : node ROBLOX/outils/cuire-icones.js   → src/ReplicatedStorage/CashCar/Icones.luau
// Le HUD les dessine en petits cadres (une barrette par suite de pixels) : aucune image, aucun fichier, nettes à toutes les tailles.
const fs = require('fs'), path = require('path');
const racine = path.join(__dirname, '..', '..');
const html = fs.readFileSync(path.join(racine, 'VERSION PRINCIPALE', 'index.html'), 'utf8');
const G = {};
// const PXI_G={nom:'…|…',…};  puis des ajouts PXI_G.nom='…';
const m = html.match(/const PXI_G=\{([^}]*)\};/);
if (!m) throw new Error('PXI_G introuvable');
for (const q of m[1].matchAll(/([A-Za-z0-9_]+):'([.#|]+)'/g)) G[q[1]] = q[2];
for (const q of html.matchAll(/PXI_G\.([A-Za-z0-9_]+)='([.#|]+)'/g)) G[q[1]] = q[2];
const noms = Object.keys(G).sort();
for (const k of noms) {
  const r = G[k].split('|');
  if (r.length !== 9 || r.some(l => l.length !== 9)) throw new Error('grille ' + k + ' pas 9 × 9');
}
let out = '-- CASH CAR — LES ICÔNES PIXEL (cuit par outils/cuire-icones.js depuis PXI_G du jeu web — ne pas retoucher à la main).\n';
out += '-- Chaque icône : 9 lignes de 9 cases, « # » = un pixel plein.\nreturn {\n';
for (const k of noms) out += '\t' + k + ' = "' + G[k] + '",\n';
out += '}\n';
const dest = path.join(racine, 'ROBLOX', 'src', 'ReplicatedStorage', 'CashCar', 'Icones.luau');
fs.writeFileSync(dest, out);
console.log(noms.length + ' icônes → ' + dest);
