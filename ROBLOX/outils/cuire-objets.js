#!/usr/bin/env node
/* CASH CAR — ROBLOX : CUIT les objets de la route du jeu web en maillages pour Roblox.
   Comme pour les caisses (cuire-caisses.js), on n'imite rien : on exécute les VRAIES recettes du jeu
   (FRUIT_DEFS coulées par lpKit, le cristal de pouvoir pwrGeo / pwrCoreGeo / pwrRingGeo — lus dans
   VERSION PRINCIPALE/index.html) avec three r128 et on enregistre la géométrie finale, facette par facette.
   Sortie : src/ReplicatedStorage/CashCar/Objets.luau
     fruits[1..6]   un maillage par fruit (dans l'ordre de l'étal : pêche plate, banane, grenade, orange, myrtille, pastèque),
                    déjà à l'échelle du jeu (×2,7), centré sur l'origine de la recette
     cristal        verre (l'icosaèdre à facettes), coeur (l'octaèdre), anneaux (le gyroscope : deux tores croisés) — en BLANC :
                    la pièce Roblox porte la couleur du pouvoir
     dauphin        le dauphin low-poly néon de la figure LE DAUPHIN (une couleur par facette), nez vers −Z
   Même format que les caisses : v = sommets (x,y,z int16 au demi-millimètre + r,g,b + masque), t = triangles (uint16), en base64.
   Repère cuit : celui de ROBLOX (x,y,z) → (−x, y, −z), en MÈTRES.
   node ROBLOX/outils/cuire-objets.js            (à relancer quand les fruits du jeu web changent) */
const fs = require('fs'), path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const JEU = path.join(RACINE, 'VERSION PRINCIPALE');
const SORTIE = path.join(__dirname, '..', 'src', 'ReplicatedStorage', 'CashCar', 'Objets.luau');
const THREE = require(path.join(JEU, 'vendor', 'three.min.js'));
const L = fs.readFileSync(path.join(JEU, 'index.html'), 'utf8').split('\n');

function ligne(debut, apres) {
  for (let i = apres || 0; i < L.length; i++) if (L[i].startsWith(debut)) return i;
  throw new Error('introuvable dans index.html : ' + debut);
}
function bloc(debut, fin, comprise, apres) {
  const a = ligne(debut, apres); let b = a + 1;
  while (b < L.length && !L[b].startsWith(fin)) b++;
  return L.slice(a, comprise ? b + 1 : b).join('\n');
}
const blocs = [
  'const IS_MOBILE=false,IS_LOW_END=false;const sphere9=g=>g.computeBoundingSphere();',
  bloc('const SPH9=', '/* ---- LE KIT LOW-POLY', false),
  bloc('const LPU={', '/* ---- LES 6 SILHOUETTES', false),      // lpKit
  bloc('const FRUIT_PAL=', '// UNE GÉOMÉTRIE PAR FRUIT', false), // FRUIT_PAL, SPH, FRUIT_DEFS
  L[ligne('const pwrGeo=')], L[ligne('const pwrGeo=') + 1],     // le cristal : pwrGeo, pwrCoreGeo, pwrRingGeo
  bloc('const DOL_L=', 'const DOL_GEO=', true),                 // le DAUPHIN : profil, robe, mkDolphinGeo, DOL_GEO
  'return {FRUIT_DEFS,FRUIT_PAL,lpKit,pwrGeo,pwrCoreGeo,pwrRingGeo,DOL_GEO,DOL_L};',
];
const stubs = {
  envTex: null, carFins: [], rimify: () => {}, lpGrad: () => {}, nuageShader: () => {}, vMat: m => m, lampTex: null,
  MATV: { get(k) { const t = new THREE.Texture(); t.name = k; return t; } }, RIM_U: {}, ENV_VERNIS: '', LFB_CAISSE: '', RIM_GLSL: () => '', I18N: {}, LANG: 'fr',
};
let G;
try {
  G = new Function('THREE', ...Object.keys(stubs), 'let carGroup=null;\n' + blocs.join('\n'))(THREE, ...Object.values(stubs));
} catch (e) {
  console.error('Le code du jeu ne s\'évalue plus tel quel : ' + e.message);
  blocs.slice(0, -1).forEach((c, i) => { try { new Function(c); } catch (err) { console.error('  bloc ' + i + ' : ' + err.message + ' | début : ' + c.slice(0, 70).replace(/\n/g, ' ')); } });
  process.exit(1);
}

// ── une géométrie three (avec ou sans couleurs aux sommets) → sommets uniques + triangles, dans le repère Roblox ──
function cuire(geos) { // geos = [{ g, m?: Matrix4, c?: [r,g,b] }]
  const V = [], T = [], vus = new Map();
  const va = new THREE.Vector3();
  let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (const e of geos) {
    const geo = e.g.index ? e.g.toNonIndexed() : e.g;
    const P = geo.attributes.position.array, C = geo.attributes.color ? geo.attributes.color.array : null;
    const flip = e.m ? e.m.determinant() < 0 : false;
    for (let i = 0; i + 8 < P.length; i += 9) {
      const idx = [];
      for (let k = 0; k < 3; k++) {
        va.set(P[i + k * 3], P[i + k * 3 + 1], P[i + k * 3 + 2]);
        if (e.m) va.applyMatrix4(e.m);
        const x = Math.round(-va.x * 2000), y = Math.round(va.y * 2000), z = Math.round(-va.z * 2000);
        const col = C ? [C[i + k * 3], C[i + k * 3 + 1], C[i + k * 3 + 2]] : (e.c || [1, 1, 1]);
        const r = Math.max(0, Math.min(255, Math.round(col[0] * 255))), g = Math.max(0, Math.min(255, Math.round(col[1] * 255))), b = Math.max(0, Math.min(255, Math.round(col[2] * 255)));
        const cle = x + ',' + y + ',' + z + ',' + r + ',' + g + ',' + b;
        let n = vus.get(cle);
        if (n === undefined) { n = V.length / 6; vus.set(cle, n); V.push(x, y, z, r, g, b); }
        idx.push(n);
        [x, y, z].forEach((q, j) => { mn[j] = Math.min(mn[j], q / 2000); mx[j] = Math.max(mx[j], q / 2000); });
      }
      if (idx[0] === idx[1] || idx[1] === idx[2] || idx[0] === idx[2]) continue;
      if (flip) T.push(idx[0], idx[2], idx[1]); else T.push(idx[0], idx[1], idx[2]);
    }
  }
  const nv = V.length / 6;
  if (nv > 65535) throw new Error('trop de sommets : ' + nv);
  const v = Buffer.alloc(nv * 10);
  for (let i = 0; i < nv; i++) {
    for (let k = 0; k < 3; k++) { const q = V[i * 6 + k]; if (q < -32768 || q > 32767) throw new Error('sommet hors gabarit'); v.writeInt16LE(q, i * 10 + k * 2); }
    v[i * 10 + 6] = V[i * 6 + 3]; v[i * 10 + 7] = V[i * 6 + 4]; v[i * 10 + 8] = V[i * 6 + 5]; v[i * 10 + 9] = 0;
  }
  const t = Buffer.alloc(T.length * 2);
  for (let i = 0; i < T.length; i++) t.writeUInt16LE(T[i], i * 2);
  return { v: v.toString('base64'), t: t.toString('base64'), nt: T.length / 3, mn, mx };
}
const n3 = x => Math.round(x * 1000) / 1000;
const lua = (e, plus) => '{ v = "' + e.v + '", t = "' + e.t + '", bas = ' + n3(e.mn[1]) + ', haut = ' + n3(e.mx[1]) + ', large = ' + n3(Math.max(e.mx[0] - e.mn[0], e.mx[2] - e.mn[2])) + (plus || '') + ' }';

let out = '-- CASH CAR — LES OBJETS DE LA ROUTE — CUIT par outils/cuire-objets.js depuis VERSION PRINCIPALE/index.html, ne pas éditer.\n' +
  '-- fruits : dans l\'ordre de Config.FRUITS, à l\'échelle du jeu (×2,7), en mètres ; bas / haut = l\'étendue en y autour de l\'origine.\n' +
  '-- cristal : verre, coeur, anneaux — en blanc (la pièce porte la couleur du pouvoir).\n' +
  'return {\n\tfruits = {\n';
const echelle = new THREE.Matrix4().makeScale(2.7, 2.7, 2.7);
let total = 0;
G.FRUIT_DEFS.forEach((f, i) => {
  const K = G.lpKit(G.FRUIT_PAL); f.lp(K);
  const e = cuire([{ g: K.done().f, m: echelle }]);
  total += e.nt;
  console.log('  ' + f.n.padEnd(14) + e.nt + ' triangles, y ' + n3(e.mn[1]) + ' → ' + n3(e.mx[1]) + ', large ' + n3(Math.max(e.mx[0] - e.mn[0], e.mx[2] - e.mn[2])));
  out += '\t\t' + lua(e, ', nom = ' + JSON.stringify(f.n) + ', jus = 0x' + f.jus.toString(16).padStart(6, '0')) + ',\n';
});
out += '\t},\n\tcristal = {\n';
// le cristal (mkPower) : le cœur ×1,3, deux anneaux croisés (le second ×0,84, tourné de 0,9 rad)
const coeur = new THREE.Matrix4().makeScale(1.3, 1.3, 1.3);
const a1 = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
const a2 = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2, 0.9, 0)).multiply(new THREE.Matrix4().makeScale(0.84, 0.84, 0.84));
const verre = cuire([{ g: G.pwrGeo }]), cr = cuire([{ g: G.pwrCoreGeo, m: coeur }]), an = cuire([{ g: G.pwrRingGeo, m: a1 }, { g: G.pwrRingGeo, m: a2 }]);
out += '\t\tverre = ' + lua(verre) + ',\n\t\tcoeur = ' + lua(cr) + ',\n\t\tanneaux = ' + lua(an) + ',\n\t},\n';
total += verre.nt + cr.nt + an.nt;
// le DAUPHIN (mkDolphinGeo : corps, dorsale, pectorales, caudale et yeux fusionnés, une couleur par facette). Sur le web son nez est
// en +x ; cuit, il regarde vers −Z de Roblox (l'avant d'une pièce) : un quart de tour autour de la verticale avant le changement de repère.
const dauphin = cuire([{ g: G.DOL_GEO, m: new THREE.Matrix4().makeRotationY(-Math.PI / 2) }]);
out += '\tdauphin = ' + lua(dauphin, ', long = ' + G.DOL_L) + ',\n}\n';
total += dauphin.nt;
console.log('  dauphin       ' + dauphin.nt + ' triangles, long ' + n3(dauphin.mx[2] - dauphin.mn[2]) + ' m');
fs.writeFileSync(SORTIE, out);
console.log(G.FRUIT_DEFS.length + ' fruits et le cristal cuits : ' + total + ' triangles, ' + (out.length / 1024).toFixed(0) + ' Ko → ' + SORTIE);
