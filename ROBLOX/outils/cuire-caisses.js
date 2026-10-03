#!/usr/bin/env node
/* CASH CAR — ROBLOX : CUIT les 68 caisses du jeu web en maillages pour Roblox.
   On n'imite pas les caisses : on exécute les VRAIS constructeurs du jeu (CARS, SHAPES, lpKit, lpWheel, lpOmbre,
   carProfile… lus dans VERSION PRINCIPALE/index.html) avec three r128, on assemble chaque caisse comme buildCar
   (aileron, bandes, propulseurs, roues, feux, pots, portières, lame), et on enregistre la géométrie FINALE :
   chaque triangle, à sa place, avec la couleur de ses sommets (ombre cuite comprise).
   Sorties, dans src/ReplicatedStorage/CashCar/Caisses/ :
     Catalogue.luau      les 68 fiches (noms FR/EN, rareté, prix / condition, couleurs, cotes, ancrages, signature de nitro)
     Formes/Fxx.luau     une caisse = ses maillages par MATIÈRE (p laque, c chrome, o or, s satiné, m mat, g verre, l lumière)
                         + sa roue (une seule, posée quatre fois, en miroir à gauche)
   Format d'un maillage : v = sommets uniques (x,y,z en int16 au demi-millimètre + r,g,b) · t = triangles (3 × uint16), en base64.
   Repère cuit : celui de ROBLOX — nez vers −Z, droite du pilote +X, y = 0 au sol, en MÈTRES (le jeu multiplie par Config.M).
   node ROBLOX/outils/cuire-caisses.js            (à relancer quand les caisses du jeu web changent) */
const fs = require('fs'), path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const JEU = path.join(RACINE, 'VERSION PRINCIPALE');
const SORTIE = path.join(__dirname, '..', 'src', 'ReplicatedStorage', 'CashCar', 'Caisses');
const THREE = require(path.join(JEU, 'vendor', 'three.min.js'));
const SRC = fs.readFileSync(path.join(JEU, 'index.html'), 'utf8');
const L = SRC.split('\n');

// ── retrouver les morceaux du jeu par leur DÉBUT (les numéros de ligne bougent à chaque commit) ──
function ligne(debut, apres) {
  for (let i = apres || 0; i < L.length; i++) if (L[i].startsWith(debut)) return i;
  throw new Error('introuvable dans index.html : ' + debut);
}
// un bloc qui commence à `debut` et finit à la première ligne qui commence par `fin` (comprise ou non)
function bloc(debut, fin, comprise, apres) {
  const a = ligne(debut, apres); let b = a + 1;
  while (b < L.length && !L[b].startsWith(fin)) b++;
  return L.slice(a, comprise ? b + 1 : b).join('\n');
}
// un bloc = de la 1re ligne qui commence par `debut` à la ligne AVANT celle qui commence par `fin`
const blocs = [
  'const IS_MOBILE=false,IS_LOW_END=false;const sphere9=g=>g.computeBoundingSphere();',
  bloc('const CLOUD_SPH=', '/* LE CIEL DE COTON', false),                       // la boule des nuages + mergeSpheres (la caisse-nuage)
  bloc('const CARS=[', '];', true),
  bloc('const CAR_UNLOCK=[', '/* ==========', false),
  bloc('const RARETES=[', 'function carOrdre', false),                          // RARETES + carRar
  bloc('const SPH9=', '/* ---- LE KIT LOW-POLY', false),                        // SPH9, loftBody, finShape, carProfile
  bloc('const LPU={', '/* ---- LES 6 SILHOUETTES', false),                      // LPU, LP_MAT, lpMat, lpKit, lpOmbre, lpWheel
  bloc('const SHAPES={', '/* ===== LA GAMME DES 50 — FIN', false),               // tous les gabarits
  bloc('const FACET_SHAPES=', 'function facetteCaisse', false),                 // les classiques de la boutique, taillés en facettes
  bloc('const NUAGE_BLOBS=', 'const GH=', false),                               // la caisse-nuage
  L[ligne('function lingotGeo(')],
  bloc('SHAPES.lingot=', '};', true),                                           // le lingot
  bloc('SHAPES.origami=', '};', true),                                          // L'ORIGAMI (2/10) : son gabarit vit APRÈS la gamme des 50
  `return {CARS,CAR_UNLOCK,carRar,SHAPES,lpKit,lpWheel,lpOmbre,carProfile,SPH9,FACET_SHAPES,geoFacette,
    monte:function(g){carGroup=g;}};`,
];
const code = blocs.join('\n');
const stubs = {
  envTex: null, carFins: [], rimify: () => {}, lpGrad: () => {}, nuageShader: () => {}, vMat: m => m, lampTex: null,
  MATV: { get(k) { const t = new THREE.Texture(); t.name = k; return t; } },
  LINGOT_MAT: (() => { const m = new THREE.MeshPhongMaterial({ color: 0xc08a1c }); m.userData.g = 'o'; return m; })(),
  LINGOT_PL: (() => { const m = new THREE.MeshPhongMaterial({ color: 0xd99a1c }); m.userData.g = 'o'; return m; })(),
  RIM_U: {}, ENV_VERNIS: '', LFB_CAISSE: '', RIM_GLSL: () => '', I18N: {}, LANG: 'fr',
};
let G;
try {
  G = new Function('THREE', ...Object.keys(stubs), 'let carGroup=null;\n' + code)(THREE, ...Object.values(stubs));
} catch (e) {
  console.error('Le code du jeu ne s\'évalue plus tel quel : ' + e.message);
  blocs.slice(0, -1).forEach((c, i) => {
    try { new Function(c); } catch (err) { console.error('  bloc ' + i + ' : ' + err.message + ' | début : ' + c.slice(0, 60).replace(/\n/g, ' ') + ' | fin : ' + JSON.stringify(c.slice(-120))); }
  });
  process.exit(1);
}
const { CARS, CAR_UNLOCK, SHAPES, lpKit, lpWheel, lpOmbre, carProfile, SPH9, FACET_SHAPES, geoFacette } = G;

// ── noms et textes anglais : relevés dans les dictionnaires I18N du jeu (clé = texte français exact) ──
function en(fr) {
  if (!fr) return null;
  const esc = fr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "(?:\\\\'|')");
  const re = new RegExp('["\']' + esc + '["\']\\s*:\\s*("((?:[^"\\\\]|\\\\.)*)"|\'((?:[^\'\\\\]|\\\\.)*)\')', 'g');
  let m;
  while ((m = re.exec(SRC))) { const v = (m[2] != null ? m[2] : m[3]).replace(/\\'/g, "'"); if (/^[\x20-\x7e]+$/.test(v)) return v; }
  return null;
}

// ── assembler une caisse comme buildCar, et rendre { corps: Group, roue: Group, roues: [...], A, pots } ──
// masque = true : la LAQUE (clé 'p' de la palette, carrosserie des gabarits classiques) est coulée en BLANC. La différence
// avec la vraie caisse dit, sommet par sommet, ce que la PEINTURE de la boutique recouvre, et de combien l'ombre le fonce.
function assemble(i, masque) {
  const spec = CARS[i], wreck = i === 0;
  const blanc = pal => { if (!masque || !pal || !pal.p) return pal; const o = Object.assign({}, pal); o.p = Object.assign({}, pal.p, { c: 0xffffff }); return o; };
  const grp = new THREE.Group(); G.monte(grp);
  const tag = (m, g) => { m.userData.g = g; return m; };
  const bodyM = tag(new THREE.MeshPhongMaterial({ color: masque ? 0xffffff : spec.color }), 'p'), accM = tag(new THREE.MeshPhongMaterial({ color: spec.accent }), 'p'),
    glassM = tag(new THREE.MeshPhongMaterial({ color: 0x0d1620 }), 'g'), chromeM = tag(new THREE.MeshPhongMaterial({ color: 0xe8ecf0 }), 'c'),
    darkM = tag(new THREE.MeshPhongMaterial({ color: 0x14161a }), 'm'), rustM = tag(new THREE.MeshPhongMaterial({ color: 0x5a3a20 }), 'm');
  const y0 = .35, W9 = spec.w, H9 = spec.h, L9 = spec.l;
  const add = m => { grp.add(m); return m; };
  const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x || 0, y || 0, z || 0); return add(m); };
  const prof = (pts, w, mat, yy) => { const m = new THREE.Mesh(carProfile(pts, w), mat); m.position.y = (yy === undefined ? y0 : yy); return add(m); };
  const cyl = (rt, rb, hh, mat, x, y, z, sg) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, hh, sg || 12), mat); m.position.set(x || 0, y || 0, z || 0); return add(m); };
  const sph = (sx, sy, sz, mat, x, y, z) => { const m = new THREE.Mesh(SPH9, mat); m.scale.set(sx, sy, sz); m.position.set(x || 0, y || 0, z || 0); return add(m); };
  const con = (r, hh, mat, x, y, z, sg) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, hh, sg || 12), mat); m.position.set(x || 0, y || 0, z || 0); return add(m); };
  const prims = []; let lpZmin = 1e9;
  const lpM = {}, lpMatC = g => lpM[g] || (lpM[g] = Object.assign(tag(new THREE.MeshBasicMaterial({ vertexColors: true }), g), { })), kitM = m => { m.userData.kit = 1; return m; };
  const commit = kt => {
    const gs = kt.done();
    for (const g in gs) {
      gs[g].computeBoundingBox(); lpZmin = Math.min(lpZmin, gs[g].boundingBox.min.z);
      if (g !== 'l') lpOmbre(gs[g], H9);                      // l'ombre cuite du jeu (les feux n'en prennent pas)
      add(new THREE.Mesh(gs[g], kitM(lpMatC(g))));
    }
    if (kt.prims) for (const p of kt.prims) prims.push(p);
  };
  const K = { W: W9, H: H9, L: L9, y0, spec, wreck, add, box, prof, cyl, sph, con, kit: pal => lpKit(blanc(pal)), commit,
    body: bodyM, acc: accM, glass: glassM, chrome: chromeM, dark: darkM, rust: rustM };
  const A = Object.assign({ hl: [W9 * .32, y0 + H9 * .50, L9 / 2 + .16], tl: [W9 * .30, y0 + H9 * .55, -L9 / 2 - .10], wr: 1, wx: W9 / 2, wz: L9 / 2 - .75, wy: 0,
    glowX: W9 / 2 + .02, glowY: y0 + H9 * .42, glowL: L9 * .82, glowF: 1, sp: 1, skirt: 1, split: 1, doors: 0, slats: 0, wings: 'panel' }, SHAPES[spec.shape](K) || {});
  if (A.lpw) Object.assign(A, { lamps: 0, pipes: 0, sp: 0, split: 0, doors: 0, slats: 0 });
  // aileron générique, bandes lumineuses, propulseurs d'appoint
  if (spec.spoiler && A.sp) { box(W9 * .98, .09, .5, accM, 0, y0 + H9 + .42, -L9 / 2 + .12); for (const sd of [-1, 1]) box(.09, .34, .12, darkM, sd * W9 * .36, y0 + H9 + .22, -L9 / 2 + .12); }
  if (spec.glow) { const gm = tag(new THREE.MeshBasicMaterial({ color: spec.glow }), 'l');
    for (const sd of [-1, 1]) box(.05, .06, A.glowL, gm, sd * A.glowX, A.glowY, 0); if (A.glowF) box(W9 * .7, .06, .05, gm, 0, y0 + H9 * .5, L9 / 2 + .02); }
  if (spec.rocket) { const bm = tag(new THREE.MeshPhongMaterial({ color: 0x3a3f48 }), 'c'), nm = tag(new THREE.MeshBasicMaterial({ color: spec.glow || 0x66c8ff }), 'l');
    for (const sd of [-1, 1]) { cyl(.24, .3, .9, bm, sd * W9 * .26, y0 + H9 * .55, -L9 / 2 - .32, 10).rotation.x = Math.PI / 2; cyl(.16, .2, .1, nm, sd * W9 * .26, y0 + H9 * .55, -L9 / 2 - .82, 10).rotation.x = Math.PI / 2; } }
  // la ROUE (une seule géométrie, dans son repère : l'essieu est X) et ses quatre places
  const roue = new THREE.Group(), roues = [];
  if (A.lpw) {
    const gs = lpWheel(A.lpw);
    for (const g in gs) roue.add(new THREE.Mesh(gs[g], kitM(lpMatC(g))));
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]])
      roues.push({ x: sx * A.wx, y: A.lpw.R + A.wy, z: sz > 0 ? (A.wzF != null ? A.wzF : A.wz) : -(A.wzR != null ? A.wzR : A.wz), miroir: sx < 0, R: A.lpw.R });
  } else {
    const R9 = .40 * A.wr, w = new THREE.Group();
    w.add(new THREE.Mesh(new THREE.CylinderGeometry(R9, R9, .32 * A.wr, 14), darkM));
    w.add(new THREE.Mesh(new THREE.CylinderGeometry(R9 * .6, R9 * .6, .34 * A.wr, 10), wreck ? darkM : chromeM));
    for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(R9 * 1.05, R9 * .9, .05), wreck ? darkM : chromeM); s.rotation.y = k * Math.PI * 2 / 5; w.add(s); }
    w.add(new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .37 * A.wr, 8), wreck ? rustM : chromeM));
    w.rotation.z = Math.PI / 2; roue.add(w);
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) roues.push({ x: sx * A.wx, y: R9 + A.wy, z: sz * A.wz, miroir: false, R: R9 });
  }
  // phares, feux, pots canoniques
  const hlM = tag(new THREE.MeshBasicMaterial({ color: 0xfff6c8 }), 'l'), tlM = tag(new THREE.MeshBasicMaterial({ color: 0xff2a2a }), 'l');
  for (const sd of [-1, 1]) {
    if (A.lamps !== 0) { box(.30, .13, .06, (wreck && sd > 0) ? darkM : hlM, sd * A.hl[0], A.hl[1], A.hl[2]); box(.34, .10, .05, tlM, sd * A.tl[0], A.tl[1], A.tl[2]); }
    if (A.pipes !== 0) cyl(.09, .11, .34, wreck ? rustM : chromeM, sd * W9 * .22, y0 + .08, -L9 / 2 - .14, 10).rotation.x = Math.PI / 2;
  }
  // les POTS : où sortent vraiment les gaz (fiche, propulseurs, relevé dans les pièces du kit, ou sous le pare-chocs)
  const zPoupe = lpZmin < 1e8 ? lpZmin : -L9 / 2 - (A.pipes !== 0 ? .31 : 0); let pots = [];
  if (A.pots) pots = A.pots.map(p => p.slice());
  else if (spec.rocket) for (const sd of [-1, 1]) pots.push([sd * W9 * .26, y0 + H9 * .55, -L9 / 2 - .87]);
  else if (prims.length) {
    const cand = [];
    for (const p of prims) {
      if (p.g === 'l' || p.g === 'g' || p.g === 'p') continue;
      if ((p.t === 'cyl' || p.t === 'lathe') && p.ax === 'z' && p.r <= .2 && p.z0 <= zPoupe + .7 && p.y > .08 && p.y <= .6) cand.push([p.x, p.y, p.z0, p.r]);
      else if (p.t === 'box' && !p.rot && p.g === 'c' && p.w <= .4 && p.h <= .25 && p.z - p.d / 2 <= zPoupe + .15 && p.y <= .6 &&
        ((p.w >= p.h && p.h >= .07) || (p.w <= .12 && p.h <= .12 && p.w >= .04 && p.h >= .04 && p.d >= .08))) cand.push([p.x, p.y, p.z - p.d / 2, Math.min(p.w, p.h) / 2]);
    }
    for (const c of cand) { let o = null; for (const q of pots) if (Math.abs(q[0] - c[0]) < .1 && Math.abs(q[1] - c[1]) < .14) { o = q; break; } if (o) { if (c[2] < o[2]) o[2] = c[2]; } else pots.push([c[0], c[1], c[2]]); }
    if (pots.length > 6) { pots.sort((a, b) => a[2] - b[2]); pots.length = 6; }
  }
  if (!pots.length) for (const sd of [-1, 1]) pots.push([sd * W9 * .22, y0 + .08, A.pipes !== 0 && !(lpZmin < 1e8) ? -L9 / 2 - .31 : zPoupe - .02]);
  // portières, lame et diffuseur, lames de calandre
  if (A.doors) { const sm = tag(new THREE.MeshBasicMaterial({ color: 0x0a0c10 }), 'm');
    for (const sd of [-1, 1]) { for (const zz of [L9 * .07, -L9 * .17]) box(.012, H9 * .5, .03, sm, sd * (W9 / 2 + .005), y0 + H9 * .45, zz); box(.03, .035, .16, wreck ? rustM : chromeM, sd * (W9 / 2 + .02), y0 + H9 * .66, L9 * .01); } }
  if (A.split) { box(W9 * .96, .05, .3, darkM, 0, y0 + H9 * .04, L9 / 2 + .12); box(W9 * .86, .09, .26, darkM, 0, y0 + H9 * .06, -L9 / 2 - .10); for (const fx of [-1, 0, 1]) box(.03, .13, .24, darkM, fx * W9 * .26, y0 + H9 * .10, -L9 / 2 - .10); }
  if (A.slats) for (const gy of [-1, 1]) box(W9 * .5, .02, .02, chromeM, 0, y0 + H9 * .42 + gy * .045, L9 / 2 + .145);
  // les CLASSIQUES de la boutique sont taillés en facettes (FACET_SHAPES / geoFacette du jeu) : peu de segments, pas de rondeur
  if (FACET_SHAPES[spec.shape]) for (const racine of [grp, roue]) racine.traverse(o => {
    if (!o.isMesh || !o.geometry || (o.material.userData && o.material.userData.kit)) return;
    const f = geoFacette(o.geometry); if (f) o.geometry = f;
  });
  return { grp, roue, roues, A, pots, spec };
}

// ── d'un groupe three à des triangles par matière, dans le repère ROBLOX (x,y,z) → (−x, y, −z) ──
function mailles(racine) {
  const l = []; racine.updateMatrixWorld(true);
  racine.traverse(o => { if (o.isMesh && o.geometry && o.geometry.attributes.position) l.push(o); });
  return l;
}
function triangles(racine, racineB) {
  const out = {}; // g → { v: Map clé→index, V: [x,y,z,r,g,b,m…], T: [i…] }
  const A = mailles(racine), Bm = racineB ? mailles(racineB) : null;
  if (Bm && Bm.length !== A.length) throw new Error('masque : ' + Bm.length + ' maillages au lieu de ' + A.length);
  const va = new THREE.Vector3(), col = new THREE.Color(), colB = new THREE.Color();
  A.forEach((o, n9) => {
    const mat = Array.isArray(o.material) ? o.material[0] : o.material;
    let g = mat.userData && mat.userData.g;
    if (!g) g = mat.isMeshBasicMaterial ? 'l' : 's';
    if (!'pcosmgl'.includes(g)) g = 's';
    const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry;
    const P = geo.attributes.position.array, C = (mat.vertexColors && geo.attributes.color) ? geo.attributes.color.array : null;
    // le même maillage dans la caisse « laque blanche »
    let CB = null, matB = null;
    if (Bm) {
      const ob = Bm[n9]; matB = Array.isArray(ob.material) ? ob.material[0] : ob.material;
      const gb = ob.geometry.index ? ob.geometry.toNonIndexed() : ob.geometry;
      if (gb.attributes.position.array.length !== P.length) throw new Error('masque : maillage ' + n9 + ' de taille différente');
      CB = (matB.vertexColors && gb.attributes.color) ? gb.attributes.color.array : null;
    }
    const flip = o.matrixWorld.determinant() < 0;
    const B = out[g] || (out[g] = { v: new Map(), V: [], T: [] });
    for (let i = 0; i + 8 < P.length; i += 9) {
      const idx = [];
      for (let k = 0; k < 3; k++) {
        va.set(P[i + k * 3], P[i + k * 3 + 1], P[i + k * 3 + 2]).applyMatrix4(o.matrixWorld);
        if (C) col.setRGB(C[i + k * 3] * mat.color.r, C[i + k * 3 + 1] * mat.color.g, C[i + k * 3 + 2] * mat.color.b); else col.copy(mat.color);
        const x = Math.round(-va.x * 2000), y = Math.round(va.y * 2000), z = Math.round(-va.z * 2000);
        const r = Math.max(0, Math.min(255, Math.round(col.r * 255))), gg = Math.max(0, Math.min(255, Math.round(col.g * 255))), b = Math.max(0, Math.min(255, Math.round(col.b * 255)));
        // m = 0 : ce sommet n'est pas de la laque ; 1-255 : la part de lumière que l'ombre cuite lui laisse (255 = pleine teinte)
        let m = 0;
        if (matB) {
          if (CB) colB.setRGB(CB[i + k * 3] * matB.color.r, CB[i + k * 3 + 1] * matB.color.g, CB[i + k * 3 + 2] * matB.color.b); else colB.copy(matB.color);
          const rb = Math.round(colB.r * 255), gb2 = Math.round(colB.g * 255), bb = Math.round(colB.b * 255);
          if (rb !== r || gb2 !== gg || bb !== b) m = Math.max(1, Math.min(255, Math.max(rb, gb2, bb)));
        }
        const cle = x + ',' + y + ',' + z + ',' + r + ',' + gg + ',' + b + ',' + m;
        let n = B.v.get(cle);
        if (n === undefined) { n = B.V.length / 7; B.v.set(cle, n); B.V.push(x, y, z, r, gg, b, m); }
        idx.push(n);
      }
      if (idx[0] === idx[1] || idx[1] === idx[2] || idx[0] === idx[2]) continue; // facette dégénérée
      // (x,z) → (−x,−z) est une ROTATION : le sens des faces est gardé ; seul un miroir du jeu l'inverse
      if (flip) B.T.push(idx[0], idx[2], idx[1]); else B.T.push(idx[0], idx[1], idx[2]);
    }
  });
  return out;
}
// 10 octets par sommet : x, y, z (int16, demi-millimètres), r, g, b, m (le masque de la peinture)
function encode(B) {
  const nv = B.V.length / 7;
  if (nv > 65535) throw new Error('trop de sommets : ' + nv);
  const v = Buffer.alloc(nv * 10);
  let peints = 0;
  for (let i = 0; i < nv; i++) {
    for (let k = 0; k < 3; k++) { const q = B.V[i * 7 + k]; if (q < -32768 || q > 32767) throw new Error('sommet hors gabarit'); v.writeInt16LE(q, i * 10 + k * 2); }
    v[i * 10 + 6] = B.V[i * 7 + 3]; v[i * 10 + 7] = B.V[i * 7 + 4]; v[i * 10 + 8] = B.V[i * 7 + 5]; v[i * 10 + 9] = B.V[i * 7 + 6];
    if (B.V[i * 7 + 6]) peints++;
  }
  const t = Buffer.alloc(B.T.length * 2);
  for (let i = 0; i < B.T.length; i++) t.writeUInt16LE(B.T[i], i * 2);
  return { v: v.toString('base64'), t: t.toString('base64'), nv, nt: B.T.length / 3, peints };
}

// ── écrire ──
const q = s => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
const n4 = x => Math.round(x * 1e4) / 1e4;
const rox = p => '{ ' + [-p[0], p[1], -p[2]].map(n4).join(', ') + ' }'; // repère du jeu → repère Roblox
const hex = c => '0x' + (c >>> 0).toString(16).padStart(6, '0');
fs.mkdirSync(path.join(SORTIE, 'Formes'), { recursive: true });
for (const f of fs.readdirSync(path.join(SORTIE, 'Formes'))) fs.unlinkSync(path.join(SORTIE, 'Formes', f));
const fiches = []; let totalT = 0, totalK = 0, totalP = 0; const erreurs = [];
for (let i = 0; i < CARS.length; i++) {
  let a, corps, roue;
  try {
    a = assemble(i);
    const am = assemble(i, true); // la même, laque en blanc : le masque de la peinture
    corps = triangles(a.grp, am.grp); roue = triangles(a.roue, am.roue);
  } catch (e) { erreurs.push(i + ' ' + CARS[i].name + ' : ' + e.message); continue; }
  let src = '-- CASH CAR — ' + a.spec.name + ' (caisse ' + i + ', gabarit ' + a.spec.shape + ') — CUIT par outils/cuire-caisses.js, ne pas éditer.\nreturn {\n\tcorps = {\n';
  let nt = 0, peints = 0;
  for (const g of Object.keys(corps)) { const e = encode(corps[g]); nt += e.nt; peints += e.peints; src += '\t\t' + g + ' = { v = "' + e.v + '", t = "' + e.t + '" },\n'; }
  src += '\t},\n\troue = {\n';
  for (const g of Object.keys(roue)) { const e = encode(roue[g]); nt += e.nt * 4; src += '\t\t' + g + ' = { v = "' + e.v + '", t = "' + e.t + '" },\n'; }
  src += '\t},\n}\n';
  if (src.length > 195000) erreurs.push(i + ' ' + a.spec.name + ' : module trop gros (' + src.length + ' caractères)');
  fs.writeFileSync(path.join(SORTIE, 'Formes', 'F' + String(i).padStart(2, '0') + '.luau'), src);
  totalT += nt; totalK += src.length; totalP += peints ? 1 : 0;
  // la fiche
  const s = a.spec, u = CAR_UNLOCK[i] || null, gL = a.pots.filter(p => p[0] < -.05), dR = a.pots.filter(p => p[0] > .05);
  const moy = l => { const zm = Math.min(...l.map(p => p[2])); const k = l.filter(p => p[2] < zm + .25); return [0, 1, 2].map(j => k.reduce((t, p) => t + p[j], 0) / k.length); };
  const centre = [0, 1, 2].map(j => a.pots.reduce((t, p) => t + p[j], 0) / a.pots.length);
  let cond = '{ k = "depart" }';
  if (u) cond = u.p != null ? '{ k = "prix", v = ' + u.p + ' }' : '{ k = ' + q(u.k) + (u.v != null ? ', v = ' + u.v : '') + (u.eur ? ', eur = ' + q(u.eur) : '') + ' }';
  const rar = G.carRar ? G.carRar(i) : 'commun';
  const fx = s.fx ? '{ ' + ['jet', 'core', 'light'].filter(k => s.fx[k] != null).map(k => k + ' = ' + hex(s.fx[k])).concat(s.fx.trail ? ['trainee = { ' + s.fx.trail.join(', ') + ' }'] : [], s.fx.rainbow ? ['arcenciel = true'] : []).join(', ') + ' }' : 'nil';
  fiches.push('\t[' + i + '] = { nom = ' + q(s.name) + ', en = ' + q(en(s.name) || s.name) + ', rar = ' + q(rar) + ', gabarit = ' + q(s.shape) + (s.retire ? ', retire = true' : '') + ', cond = ' + cond +
    ',\n\t\tlaque = ' + hex(s.color) + ', accent = ' + hex(s.accent) + ', w = ' + s.w + ', h = ' + s.h + ', l = ' + s.l + ', kmh = ' + s.maxKmh + ', triangles = ' + nt +
    ',\n\t\tphare = ' + rox([a.A.hl[0], a.A.hl[1], a.A.hl[2]]) + ', feu = ' + rox([a.A.tl[0], a.A.tl[1], a.A.tl[2]]) +
    ', pots = { ' + a.pots.map(rox).join(', ') + ' }' +
    ',\n\t\ttrainees = { ' + ((gL.length && dR.length) ? [moy(dR), moy(gL)] : [centre]).map(rox).join(', ') + ' }, capot = ' + rox([0, y0c(s), s.l * .28]) +
    ',\n\t\troues = { ' + a.roues.map(r => '{ ' + [-r.x, r.y, -r.z].map(n4).join(', ') + ', ' + (r.miroir ? 'true' : 'false') + ', ' + n4(r.R) + ' }').join(', ') + ' }' +
    (s.glow != null ? ', neon = ' + hex(s.glow) : '') + ', ailes = ' + q(a.A.wings === 'none' ? 'none' : (a.A.wings === 'props' ? 'helices' : 'panneaux')) + ', fx = ' + fx +
    ',\n\t\tdesc = ' + q(s.desc || '') + ', descEN = ' + q(en(s.desc) || s.desc || '') + ' },');
}
function y0c(s) { return .35 + s.h * .78; }
const cat = '-- CASH CAR — LE CATALOGUE DES ' + CARS.length + ' CAISSES — CUIT par outils/cuire-caisses.js depuis VERSION PRINCIPALE/index.html, ne pas éditer.\n' +
  '-- Indices du jeu web (0 = LA HONTE) : ce sont ceux des sauvegardes, ils ne bougent jamais.\n' +
  '-- Repère : nez vers −Z, droite du pilote +X, mètres. cond.k : depart · prix (v = $) · aura (rang) · carnet (n°) · premium (argent réel) · carrN / carrV (campagne).\n' +
  '-- roues = { x, y, z, miroir, rayon } · trainees = un point par ruban de nitro · ailes = panneaux | helices | none (ce que le gabarit déploie en vol).\n' +
  'return {\n' + fiches.join('\n') + '\n}\n';
fs.writeFileSync(path.join(SORTIE, 'Catalogue.luau'), cat);
console.log(totalP + ' caisses ont une laque à peindre');
console.log(CARS.length + ' caisses cuites : ' + totalT + ' triangles, ' + (totalK / 1024).toFixed(0) + ' Ko de formes, catalogue ' + (cat.length / 1024).toFixed(0) + ' Ko');
if (erreurs.length) { console.log('ERREURS :\n  ' + erreurs.join('\n  ')); process.exit(1); }
