#!/usr/bin/env node
/* CASH CAR — ROBLOX : CUIT les 30 MOTEURS du jeu web (mkEngine, bloc <<<MOTEURS>>> de VERSION PRINCIPALE/index.html)
   en maillages pour Roblox. Comme les caisses : on exécute le VRAI constructeur avec three r128 et on enregistre la
   géométrie finale, par MATIÈRE (m mat : fonte, alu, noir · c chrome : inox, pièces polies · l lumière : ce qui s'allume).
   Sorties, dans src/ReplicatedStorage/CashCar/Moteurs/ :
     Liste.luau        les 30 fiches (nom, couleur, cylindres, flamme, étendue, sortie d'échappement)
     Mxx.luau          un moteur = ses maillages par matière
   Même format que les caisses : v = sommets (x,y,z int16 au demi-millimètre + r,g,b + masque 0), t = triangles (uint16), base64.
   Repère cuit : celui de ROBLOX (x,y,z) → (−x, y, −z), en MÈTRES (le moteur du jeu web fait ~2 m de long, vilebrequin le long de X).
   node ROBLOX/outils/cuire-moteurs.js            (à relancer quand les moteurs du jeu web changent) */
const fs = require('fs'), path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const JEU = path.join(RACINE, 'VERSION PRINCIPALE');
const SORTIE = path.join(__dirname, '..', 'src', 'ReplicatedStorage', 'CashCar', 'Moteurs');
const THREE = require(path.join(JEU, 'vendor', 'three.min.js'));
const SRC = fs.readFileSync(path.join(JEU, 'index.html'), 'utf8');
const L = SRC.split('\n');
// le nom anglais : relevé dans les dictionnaires I18N du jeu (clé = le texte français exact)
function en(fr) {
  const esc = fr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "(?:\\\\'|')");
  const re = new RegExp('["\']' + esc + '["\']\\s*:\\s*("((?:[^"\\\\]|\\\\.)*)"|\'((?:[^\'\\\\]|\\\\.)*)\')', 'g');
  let m;
  while ((m = re.exec(SRC))) { const v = (m[2] != null ? m[2] : m[3]).replace(/\\'/g, "'"); if (/^[\x20-\x7e]+$/.test(v)) return v; }
  return null;
}

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
  'const IS_MOBILE=false,IS_LOW_END=false;',
  bloc('const fgSph=', 'for(const g9 of', true),                 // les géométries partagées de l'étal (les moteurs s'en servent)
  bloc('const ENGINE_TIERS=[', '];', true),
  bloc('/* <<<MOTEURS>>>', '/* <<<FIN MOTEURS>>>', false),
  'return {ENGINE_TIERS,mkEngine};',
];
// ce que le bloc attend du reste du jeu : on le lui prête, vide
// (les textures peintes des moteurs ne servent à rien ici : un faux contexte 2D qui avale tout)
const image = (w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w | 0) * Math.max(1, h | 0) * 4), width: w, height: h });
const ctx2d = () => new Proxy({}, { get: (t, k) => k === 'createImageData' || k === 'getImageData' ? ((a, b, c, d) => image(c || a, d || b)) : (() => ({ addColorStop() {}, data: [], width: 0 })), set: () => true });
const stubs = {
  envTex: null, lampTex: null, puffTex: null, sparkTex: null, document: { createElement: () => ({ getContext: () => ctx2d(), width: 0, height: 0, style: {} }) },
  renderer: { capabilities: { getMaxAnisotropy: () => 1 } }, scene: new THREE.Scene(), I18N: {}, LANG: 'fr', TR: s => s,
  rimify: () => {}, vMat: m => m, MATV: { get(k) { const t = new THREE.Texture(); t.name = k; return t; } }, RIM_U: {}, ENV_VERNIS: '', RIM_GLSL: () => '',
};
let G;
function essai(plus) {
  const s = Object.assign({}, stubs, plus);
  return new Function('THREE', ...Object.keys(s), blocs.join('\n'))(THREE, ...Object.values(s));
}
// les noms qui manquent se découvrent à l'essai : on les prête un par un (fonctions vides), et on le DIT
const prets = {};
for (let tour = 0; tour < 40; tour++) {
  try { G = essai(prets); break; } catch (e) {
    const m = /^(\w+) is not defined/.exec(e.message);
    if (!m) {
      console.error('Le code du jeu ne s\'évalue plus tel quel : ' + e.message);
      const ou = /<anonymous>:(\d+):(\d+)/.exec(e.stack || '');
      if (ou) console.error('  → ' + (blocs.join('\n').split('\n')[ou[1] - 3] || '').slice(Math.max(0, ou[2] - 120), +ou[2] + 200));
      process.exit(1);
    }
    prets[m[1]] = () => {};
  }
}
if (!G) { console.error('trop de noms manquants : ' + Object.keys(prets).join(', ')); process.exit(1); }
if (Object.keys(prets).length) console.log('prêtés (vides) : ' + Object.keys(prets).join(', '));

// La matière d'une pièce de moteur, lue sur le matériau du jeu (M9, L22899) :
//   l = ce qui S'ALLUME (matière sans lumière, additif, émissif franc) · c = miroir (inox, collecteurs bleuis)
//   a = métal clair (alu, anodisé, carbone verni) · m = mat (fonte, noir, croûte)
function matiere(mat) {
  if (!mat) return 'm';
  if (mat.isMeshBasicMaterial || mat.blending === THREE.AdditiveBlending) return 'l';
  if (mat.emissive && !mat.emissiveMap && (mat.emissiveIntensity || 0) > 0.3 && (mat.emissive.r + mat.emissive.g + mat.emissive.b) > 0.3) return 'l';
  if (mat.combine === THREE.MixOperation) { const r = mat.reflectivity || 0; return r >= 0.5 ? 'c' : (r >= 0.24 ? 'a' : 'm'); }
  const sh = mat.shininess || 0;
  return sh >= 200 ? 'c' : (sh >= 100 ? 'a' : 'm');
}
// la couleur d'un matériau dont la teinte vient d'une TEXTURE peinte (perdue ici) : on la rend à la main
function teinte(mat, col) {
  col.copy(mat.color);
  if (mat.combine === THREE.MixOperation && mat.map && mat.color.getHex() === 0xffffff) {
    if (Math.abs((mat.shininess || 0) - 290) < 1) col.setHex(0x9a9fc4);      // chaud : l'inox bleui des collecteurs
    else if (Math.abs((mat.shininess || 0) - 250) < 1) col.setHex(0x23272e); // carbone
    else col.setHex(0xb9bec6);
  }
  return col;
}
// LE BUDGET DE ROBLOX : tous les maillages bâtis par code se partagent ~68 000 triangles (mesuré dans Studio). Un V16 en pèse
// 13 600 à lui seul. La carte moteur montre le moteur une seconde et demie, à l'échelle de la caisse : on retire ses plus PETITES
// pièces (boulons, colliers, ailettes) jusqu'à tenir sous PLAFOND triangles — la silhouette et les couleurs restent.
const PLAFOND = 4800;
function alleger(racine) {
  racine.updateMatrixWorld(true);
  const l = []; let total = 0;
  racine.traverse(o => {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position || o.visible === false) return;
    const mat = Array.isArray(o.material) ? o.material[0] : o.material;
    if (mat.transparent && mat.opacity < 0.35) return;
    const g = o.geometry, nt = (g.index ? g.index.count : g.attributes.position.count) / 3;
    if (!g.boundingBox) g.computeBoundingBox();
    const b = g.boundingBox.clone().applyMatrix4(o.matrixWorld), d = b.max.clone().sub(b.min);
    l.push({ o, nt, taille: Math.max(d.x, d.y, d.z), lumiere: matiere(mat) === 'l' }); total += nt;
  });
  if (total <= PLAFOND) return 0;
  // (ce qui s'ALLUME reste : c'est la signature du moteur)
  l.sort((x, y) => (x.lumiere - y.lumiere) || (x.taille - y.taille));
  let retire = 0;
  for (const e of l) { if (total <= PLAFOND || e.lumiere) break; e.o.visible = false; total -= e.nt; retire++; }
  return retire;
}
function cuire(racine) {
  const out = {}; racine.updateMatrixWorld(true);
  const va = new THREE.Vector3(), col = new THREE.Color();
  let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  racine.traverse(o => {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position || o.visible === false) return;
    const mat = Array.isArray(o.material) ? o.material[0] : o.material;
    if (mat.transparent && mat.opacity < 0.35) return;               // les halos et les voiles : pas de la matière
    const g = matiere(mat);
    const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry;
    const P = geo.attributes.position.array, C = (mat.vertexColors && geo.attributes.color) ? geo.attributes.color.array : null;
    const flip = o.matrixWorld.determinant() < 0;
    const B = out[g] || (out[g] = { v: new Map(), V: [], T: [] });
    for (let i = 0; i + 8 < P.length; i += 9) {
      const idx = [];
      for (let k = 0; k < 3; k++) {
        va.set(P[i + k * 3], P[i + k * 3 + 1], P[i + k * 3 + 2]).applyMatrix4(o.matrixWorld);
        if (C) col.setRGB(C[i + k * 3] * mat.color.r, C[i + k * 3 + 1] * mat.color.g, C[i + k * 3 + 2] * mat.color.b); else teinte(mat, col);
        if (g === 'l' && mat.emissive && !mat.isMeshBasicMaterial && mat.blending !== THREE.AdditiveBlending) col.copy(mat.emissive).lerp(mat.color, 0.25);
        const x = Math.round(-va.x * 2000), y = Math.round(va.y * 2000), z = Math.round(-va.z * 2000);
        const r = Math.max(0, Math.min(255, Math.round(col.r * 255))), gg = Math.max(0, Math.min(255, Math.round(col.g * 255))), b = Math.max(0, Math.min(255, Math.round(col.b * 255)));
        const cle = x + ',' + y + ',' + z + ',' + r + ',' + gg + ',' + b;
        let n = B.v.get(cle);
        if (n === undefined) { n = B.V.length / 6; B.v.set(cle, n); B.V.push(x, y, z, r, gg, b); }
        idx.push(n);
        [x, y, z].forEach((q, j) => { mn[j] = Math.min(mn[j], q / 2000); mx[j] = Math.max(mx[j], q / 2000); });
      }
      if (idx[0] === idx[1] || idx[1] === idx[2] || idx[0] === idx[2]) continue;
      if (flip) B.T.push(idx[0], idx[2], idx[1]); else B.T.push(idx[0], idx[1], idx[2]);
    }
  });
  return { out, mn, mx };
}
function encode(B) {
  const nv = B.V.length / 6;
  if (nv > 65535) throw new Error('trop de sommets : ' + nv);
  const v = Buffer.alloc(nv * 10);
  for (let i = 0; i < nv; i++) {
    for (let k = 0; k < 3; k++) { const q = B.V[i * 6 + k]; if (q < -32768 || q > 32767) throw new Error('sommet hors gabarit'); v.writeInt16LE(q, i * 10 + k * 2); }
    v[i * 10 + 6] = B.V[i * 6 + 3]; v[i * 10 + 7] = B.V[i * 6 + 4]; v[i * 10 + 8] = B.V[i * 6 + 5]; v[i * 10 + 9] = 0;
  }
  const t = Buffer.alloc(B.T.length * 2);
  for (let i = 0; i < B.T.length; i++) t.writeUInt16LE(B.T[i], i * 2);
  return { v: v.toString('base64'), t: t.toString('base64'), nt: B.T.length / 3 };
}
const q = s => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
const n3 = x => Math.round(x * 1000) / 1000;
const hex = c => '0x' + (c >>> 0).toString(16).padStart(6, '0');

fs.mkdirSync(SORTIE, { recursive: true });
for (const f of fs.readdirSync(SORTIE)) fs.unlinkSync(path.join(SORTIE, f));
const fiches = []; let total = 0, ko = 0; const erreurs = [];
G.ENGINE_TIERS.forEach((E, i) => {
  let c;
  let retire = 0;
  try { const m9 = G.mkEngine(i); retire = alleger(m9); c = cuire(m9); } catch (e) { erreurs.push(i + ' ' + E.n + ' : ' + e.message); return; }
  const tete = '-- CASH CAR — ' + E.n + ' (moteur ' + i + ') — CUIT par outils/cuire-moteurs.js, ne pas éditer.\n';
  let src = tete + 'return {\n';
  let nt = 0; const parts = {};
  for (const g of Object.keys(c.out)) { const e = encode(c.out[g]); nt += e.nt; parts[g] = '{ v = "' + e.v + '", t = "' + e.t + '" }'; src += '\t' + g + ' = ' + parts[g] + ',\n'; }
  src += '}\n';
  const nom = 'M' + String(i).padStart(2, '0');
  let eclate = false;
  if (src.length > 190000) {
    // un script Roblox ne dépasse pas 200 000 caractères : les gros moteurs s'écrivent une MATIÈRE par module (M15m, M15c, M15l)
    eclate = true;
    for (const g of Object.keys(parts)) {
      const un = tete + 'return ' + parts[g] + '\n';
      if (un.length > 195000) erreurs.push(i + ' ' + E.n + ' : matière ' + g + ' trop grosse (' + un.length + ' caractères)');
      fs.writeFileSync(path.join(SORTIE, nom + g + '.luau'), un);
    }
  } else fs.writeFileSync(path.join(SORTIE, nom + '.luau'), src);
  total += nt; ko += src.length;
  fiches.push('\t[' + i + '] = { nom = ' + q(E.n) + ', en = ' + q(en(E.n) || E.n) + ', couleur = ' + hex(E.col) + ', flamme = ' + hex(E.flam) + ', cyl = ' + E.cyl + ', triangles = ' + nt + (eclate ? ', eclate = { ' + Object.keys(parts).map(q).join(', ') + ' }' : '') +
    ', mn = { ' + [-c.mx[0], c.mn[1], -c.mx[2]].map(n3).join(', ') + ' }, mx = { ' + [-c.mn[0], c.mx[1], -c.mn[2]].map(n3).join(', ') + ' } },');
  const res = Object.keys(c.out).map(g => g + ':' + (c.out[g].T.length / 3)).join(' ');
  console.log('  ' + String(i).padStart(2) + ' ' + E.n.padEnd(22) + String(nt).padStart(6) + ' triangles  ' + (src.length / 1024).toFixed(0).padStart(4) + ' Ko   ' +
    [0, 1, 2].map(j => n3(c.mx[j] - c.mn[j])).join(' × ') + ' m   ' + res + (retire ? '   (' + retire + ' petites pièces retirées)' : ''));
});
fs.writeFileSync(path.join(SORTIE, 'Liste.luau'), '-- CASH CAR — LES 30 MOTEURS — CUIT par outils/cuire-moteurs.js depuis VERSION PRINCIPALE/index.html, ne pas éditer.\n' +
  '-- Indices du jeu web (0 = MOTEUR ROUILLÉ). mn / mx = la boîte du moteur, en mètres, repère Roblox.\nreturn {\n' + fiches.join('\n') + '\n}\n');
console.log(G.ENGINE_TIERS.length + ' moteurs cuits : ' + total + ' triangles, ' + (ko / 1024).toFixed(0) + ' Ko');
if (erreurs.length) { console.log('ERREURS :\n  ' + erreurs.join('\n  ')); process.exit(1); }
