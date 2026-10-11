/* LE SIMULATEUR LÉGER (2026-10-12, Léo : « un simulateur de course léger pour aucun bug ; une interface avec les maps, leurs noms,
   une photo, jouer sur la map ; chaque map n'a pas de musique pour l'instant, après il faudra associer un fichier à chaque »).
   Une voiture, une route qui boucle, un décor par map (maps/<id>.js) — rien d'autre : ni argent, ni figures, ni missions.
   · LA CONDUITE reprend la règle du jeu : gaz automatique, le volant fait TOURNER la caisse (lacet ≤ v/(40+0,3v), le rayon mini du
     jeu), pouce lâché elle garde son cap et SORT dans les virages ; ↓ freine, Espace = nitro (réserve qui se recharge), plaques d'or
     = coup de boost ; hors de la route, elle tombe et repart de sa dernière ligne sûre, au tiers de la vitesse.
   · LA MUSIQUE d'une map est une page de musique en direct (musiques/*.html, ex. French Touch) jouée TELLE QUELLE dans un cadre
     invisible du même site : on appuie sur son PLAY au départ (le geste du joueur réveille son contexte audio) et on pousse sa jauge
     « vitesse » (0-100 %) à chaque image = vitesse de la voiture ÷ la pointe en nitro. En croisière ~75 %, le haut = la nitro.
   Console : SIMU.etat, SIMU.musique(), SIMU.rayonMin(), SIMU.touche('nitro', true). */
(function () {
'use strict';
const T = THREE;
const Q = new URLSearchParams(location.search);
const MAP = MAPS.find(m => m.id === Q.get('map')) || MAPS[0];
const PHOTO = Q.has('photo'), DEBUG = Q.has('debug');
window.DECORS = window.DECORS || {};

// ——— les réglages de la conduite (m/s) ———
const VC = 100;          // croisière, gaz automatique : 360 km/h
const VN = 135;          // pointe en nitro : 486 km/h = le HAUT de la jauge de la musique
const ACC = 45, ACC_N = 60, FREIN = 55;
const NIT_USE = .12, NIT_GAIN = .1;   // la nitro : ~8 s pleine, se recharge en ~10 s
const GRAV = 26;

const $ = id => document.getElementById(id);

// ——— une erreur se VOIT (sinon une boucle qui casse ressemble à un jeu figé) ———
function erreur(msg) { const e = $('err'); if (!e) return; e.textContent = String(msg).slice(0, 400); e.hidden = false; }
window.addEventListener('error', ev => erreur((ev.message || 'erreur') + (ev.lineno ? ' (ligne ' + ev.lineno + ')' : '')));

// ——— le hasard réglé par une graine : la même map à chaque partie ———
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

/* ================= LA PISTE ================= */
// boucle en ÉTOILE : l'angle ne fait que monter, la route ne se croise jamais
function traceEtoile(o, r) {
  const N = o.points || 16, R = [];
  for (let i = 0; i < N; i++) R.push(o.rayon[0] + r() * (o.rayon[1] - o.rayon[0]));
  for (let k = 0; k < (o.lisse ?? 2); k++) { const c = R.slice(); for (let i = 0; i < N; i++) R[i] = (c[(i + N - 1) % N] + 2 * c[i] + c[(i + 1) % N]) / 4; }
  const ctrl = [];
  for (let i = 0; i < N; i++) { const a = (i + (r() - .5) * .5) / N * Math.PI * 2; ctrl.push(new T.Vector3(Math.cos(a) * R[i], 0, Math.sin(a) * R[i])); }
  const pts = new T.CatmullRomCurve3(ctrl, true, 'centripetal').getPoints(N * 60);
  pts.pop();   // fermée : le dernier point est le premier
  return pts.map(p => [p.x, p.z]);
}
// des RUES : un polygone à angles droits (une silhouette en escaliers dessus et dessous), coins arrondis — droites et virages à 90°
function traceRues(o, r) {
  const B = o.bloc || 320, Rc = o.coin || 140, C = o.colonnes || 5;
  const xs = [0], bas = [], haut = [];
  for (let c = 0; c < C; c++) xs.push(xs[c] + B * (1 + Math.floor(r() * 2)));
  for (let c = 0; c < C; c++) {
    let b = Math.floor(r() * 2), h = 2 + Math.floor(r() * 3);
    if (c > 0) {   // chaque colonne touche sa voisine sur au moins un bloc
      b = Math.min(b, haut[c - 1] - 1); h = Math.max(h, bas[c - 1] + 1, b + 2);
    }
    bas.push(b); haut.push(h);
  }
  const v = [[xs[0], bas[0] * B]];
  for (let c = 0; c < C; c++) { v.push([xs[c + 1], bas[c] * B]); if (c < C - 1) v.push([xs[c + 1], bas[c + 1] * B]); }
  v.push([xs[C], haut[C - 1] * B]);
  for (let c = C - 1; c >= 0; c--) { v.push([xs[c], haut[c] * B]); if (c > 0) v.push([xs[c], haut[c - 1] * B]); }
  // ménage : points en double et points alignés
  const p = [];
  for (const q of v) { const l = p[p.length - 1]; if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) > 1) p.push(q); }
  if (Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) < 1) p.pop();
  const s = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[(i + p.length - 1) % p.length], b = p[i], c = p[(i + 1) % p.length];
    const cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    if (Math.abs(cr) > 1e-6) s.push(b);
  }
  // les coins arrondis (rayon Rc) ; une arête fait toujours au moins un bloc, donc ≥ 2 × Rc
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const a = s[(i + s.length - 1) % s.length], b = s[i], c = s[(i + 1) % s.length];
    let ax = b[0] - a[0], ay = b[1] - a[1], la = Math.hypot(ax, ay); ax /= la; ay /= la;
    let bx = c[0] - b[0], by = c[1] - b[1], lb = Math.hypot(bx, by); bx /= lb; by /= lb;
    const S = [b[0] - ax * Rc, b[1] - ay * Rc], E = [b[0] + bx * Rc, b[1] + by * Rc];
    const ctr = [S[0] + bx * Rc, S[1] + by * Rc];
    let a0 = Math.atan2(S[1] - ctr[1], S[0] - ctr[0]), a1 = Math.atan2(E[1] - ctr[1], E[0] - ctr[0]);
    let da = a1 - a0; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
    const k = Math.ceil(Math.abs(da) * Rc / 4);
    for (let j = 0; j <= k; j++) { const t = a0 + da * j / k; out.push([ctr[0] + Math.cos(t) * Rc, ctr[1] + Math.sin(t) * Rc]); }
  }
  const cx = xs[C] / 2, cz = (Math.min(...bas) + Math.max(...haut)) * B / 2;
  return out.map(q => [q[0] - cx, q[1] - cz]);
}
// une boucle fermée → un point tous les ~2 m
function reechantillonne(pts, pas) {
  const m = pts.length, cum = [0];
  for (let i = 0; i < m; i++) { const a = pts[i], b = pts[(i + 1) % m]; cum.push(cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const L = cum[m], n = Math.round(L / pas), p = L / n, xz = new Float32Array(n * 2);
  let j = 0;
  for (let k = 0; k < n; k++) {
    const s = k * p;
    while (j < m - 1 && cum[j + 1] < s) j++;
    const a = pts[j], b = pts[(j + 1) % m], t = (s - cum[j]) / ((cum[j + 1] - cum[j]) || 1);
    xz[k * 2] = a[0] + (b[0] - a[0]) * t; xz[k * 2 + 1] = a[1] + (b[1] - a[1]) * t;
  }
  return { n, pas: p, L, xz };
}
function faisPiste(o) {
  const r = rng(o.graine || 1);
  const R = reechantillonne(o.forme === 'rues' ? traceRues(o, r) : traceEtoile(o, r), 2);
  const n = R.n, P = { n, pas: R.pas, L: R.L, W: o.largeur || 30 };
  for (const k of ['x', 'y', 'z', 'tx', 'tz', 'dx', 'dz']) P[k] = new Float32Array(n);
  const A = o.relief || 0, K = o.vagues || 2, ph1 = r() * 6.283, ph2 = r() * 6.283;
  for (let i = 0; i < n; i++) {
    P.x[i] = R.xz[i * 2]; P.z[i] = R.xz[i * 2 + 1];
    const u = i / n * Math.PI * 2;
    P.y[i] = A * (Math.sin(K * u + ph1) + .35 * Math.sin((2 * K + 1) * u + ph2));
  }
  let mx = 1e9, Mx = -1e9, mz = 1e9, Mz = -1e9;
  for (let i = 0; i < n; i++) {
    const a = (i + n - 1) % n, b = (i + 1) % n;
    let tx = P.x[b] - P.x[a], tz = P.z[b] - P.z[a]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    P.tx[i] = tx; P.tz[i] = tz; P.dx[i] = -tz; P.dz[i] = tx;   // d = la DROITE de la route (vue de derrière la caisse)
    mx = Math.min(mx, P.x[i]); Mx = Math.max(Mx, P.x[i]); mz = Math.min(mz, P.z[i]); Mz = Math.max(Mz, P.z[i]);
  }
  P.boite = { mx, Mx, mz, Mz };
  // grille de 60 m pour savoir vite à quelle distance de la route est un point du décor
  const G = 60, grille = new Map();
  for (let i = 0; i < n; i += 2) {
    const key = (Math.floor(P.x[i] / G) + 5000) * 10000 + Math.floor(P.z[i] / G) + 5000;
    let c = grille.get(key); if (!c) grille.set(key, c = []); c.push(i);
  }
  P.dist = (x, z, rmax = 240) => {   // → { d, i } : distance horizontale à l'axe de la route, et le point le plus proche
    const R = Math.ceil(rmax / G), gx = Math.floor(x / G), gz = Math.floor(z / G);
    let d2 = Infinity, bi = -1;
    for (let a = -R; a <= R; a++) for (let b = -R; b <= R; b++) {
      const c = grille.get((gx + a + 5000) * 10000 + gz + b + 5000); if (!c) continue;
      for (const i of c) { const dx = P.x[i] - x, dz = P.z[i] - z, q = dx * dx + dz * dz; if (q < d2) { d2 = q; bi = i; } }
    }
    return { d: Math.sqrt(d2), i: bi };
  };
  P.pente = i => (P.y[(i + 1) % n] - P.y[(i + n - 1) % n]) / (2 * P.pas);
  // le DÉPART : au début de la plus longue ligne droite (jamais dans un virage, la caisse y partirait à l'arrêt)
  const droit = i => { const j = (i + 5) % n; let a = Math.atan2(P.tx[j], P.tz[j]) - Math.atan2(P.tx[i], P.tz[i]); a = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))); return a < 5 * P.pas / 1500; };
  let i0 = 0; while (i0 < n && droit(i0)) i0++;   // on part d'un point qui n'est PAS droit, pour ne pas couper une droite en deux
  let best = 0, bestI = 0, run = 0;
  for (let k = 1; k <= n; k++) { const i = (i0 + k) % n; if (droit(i)) { run++; if (run > best) { best = run; bestI = (i - run + 1 + n) % n; } } else run = 0; }
  P.depart = (bestI + Math.min(25, best >> 3)) % n;
  return P;
}
// le virage le plus serré (mètres) — sur 10 m pour lisser
function rayonMin(P) {
  let r = Infinity;
  for (let i = 0; i < P.n; i++) {
    const j = (i + 5) % P.n;
    let da = Math.atan2(P.tx[j], P.tz[j]) - Math.atan2(P.tx[i], P.tz[i]);
    while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
    if (Math.abs(da) > 1e-6) r = Math.min(r, 5 * P.pas / Math.abs(da));
  }
  return r;
}

/* ================= LES TEXTURES PEINTES ================= */
function toile(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; }
function texRoute(C) {
  const c = toile(128, 512, (g, w, h) => {
    g.fillStyle = C.route; g.fillRect(0, 0, w, h);
    const r = rng(77);
    for (let i = 0; i < 2600; i++) { g.fillStyle = r() < .5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.12)'; g.fillRect(r() * w | 0, r() * h | 0, 1 + (r() * 2 | 0), 1 + (r() * 2 | 0)); }
    g.fillStyle = C.ligne;
    g.fillRect(4, 0, 3, h); g.fillRect(w - 7, 0, 3, h);                       // les bords
    for (const u of [.25, .5, .75]) g.fillRect(Math.round(u * w) - 1, 0, 2, h * .3);   // les voies : un trait de 12 m tous les 40 m
  });
  const t = new T.CanvasTexture(c);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  return t;
}
function texChevrons(col) {
  const c = toile(64, 128, (g, w, h) => {
    g.fillStyle = 'rgba(20,12,0,.55)'; g.fillRect(0, 0, w, h);
    g.strokeStyle = col; g.lineWidth = 9; g.lineJoin = 'miter';
    for (let k = 0; k < 3; k++) { const y = 28 + k * 38; g.beginPath(); g.moveTo(10, y + 18); g.lineTo(w / 2, y); g.lineTo(w - 10, y + 18); g.stroke(); }
    g.strokeRect(2, 2, w - 4, h - 4);
  });
  return new T.CanvasTexture(c);
}
function texRond(dur) {   // une tache ronde (lueur sous la caisse, ombre)
  const c = toile(64, 64, (g, w) => {
    const d = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    d.addColorStop(0, 'rgba(255,255,255,1)'); d.addColorStop(dur, 'rgba(255,255,255,.5)'); d.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = d; g.fillRect(0, 0, w, w);
  });
  return new T.CanvasTexture(c);
}

/* ================= LE RUBAN DE LA ROUTE ================= */
// une bande le long de la piste : à chaque point, de (latéral a0, hauteur y0) à (a1, y1)
function bande(P, idx, a0, a1, y0, y1, col, sortie) {
  const { pos, uv, cl, ix } = sortie, base = pos.length / 3;
  for (let k = 0; k < idx.length; k++) {
    const i = idx[k];
    pos.push(P.x[i] + P.dx[i] * a0, P.y[i] + y0, P.z[i] + P.dz[i] * a0, P.x[i] + P.dx[i] * a1, P.y[i] + y1, P.z[i] + P.dz[i] * a1);
    const v = sortie.v[k];
    uv.push(0, v, 1, v);
    const c0 = col[0], c1 = col[1] || col[0];
    cl.push(c0.r, c0.g, c0.b, c1.r, c1.g, c1.b);
    if (k > 0) { const a = base + (k - 1) * 2; ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
}
function geo(s) {
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(s.pos, 3));
  g.setAttribute('uv', new T.Float32BufferAttribute(s.uv, 2));
  g.setAttribute('color', new T.Float32BufferAttribute(s.cl, 3));
  g.setIndex(s.ix); g.computeVertexNormals(); g.computeBoundingSphere();
  return g;
}
function faisRoute(P, C, scene) {
  const pas = 2, idx = [], vv = [];
  const tuile = P.L / Math.max(1, Math.round(P.L / 40));   // la texture tombe juste à la fermeture de la boucle
  for (let i = 0; i < P.n; i += pas) { idx.push(i); vv.push(i * P.pas / tuile); }
  idx.push(0); vv.push(P.L / tuile);
  const nv = () => ({ pos: [], uv: [], cl: [], ix: [], v: vv });
  const hw = P.W / 2, bd = .9, ep = 2.4;
  const blanc = [new T.Color(1, 1, 1)];
  const dessus = nv(); bande(P, idx, -hw, hw, 0, 0, blanc, dessus);
  const flanc = nv();
  bande(P, idx, -hw - bd, -hw - bd, .02, -ep, blanc, flanc); bande(P, idx, hw + bd, hw + bd, .02, -ep, blanc, flanc);
  bande(P, idx, -hw - bd, hw + bd, -ep, -ep, blanc, flanc);
  const n1 = new T.Color(C.bord[0]), n2 = new T.Color(C.bord[1] || C.bord[0]), neon = nv();
  bande(P, idx, -hw - bd, -hw, .03, .03, [n1], neon); bande(P, idx, hw, hw + bd, .03, .03, [n2], neon);
  bande(P, idx, -hw - bd - .02, -hw - bd - .02, -ep * .72, -ep * .86, [n1], neon); bande(P, idx, hw + bd + .02, hw + bd + .02, -ep * .72, -ep * .86, [n2], neon);
  const tex = texRoute(C);
  const mD = new T.Mesh(geo(dessus), new T.MeshLambertMaterial({ map: tex }));
  const mF = new T.Mesh(geo(flanc), new T.MeshLambertMaterial({ color: C.flanc || '#14121c', side: T.DoubleSide }));
  const mN = new T.Mesh(geo(neon), new T.MeshBasicMaterial({ vertexColors: true, side: T.DoubleSide }));
  scene.add(mD, mF, mN);
  return tex;
}

/* ================= LES PLAQUES DE BOOST ================= */
function faisPlaques(P, C, r, scene) {
  const plaques = [], pos = [], uv = [], ix = [];
  let i = 220;
  while (i < P.n - 200) {
    const lat = (r() * 2 - 1) * (P.W / 2 - 5);
    plaques.push({ i, lat, t: -9 });
    const a = (i + P.n - 1) % P.n, b = (i + 1) % P.n;
    let tx = P.x[b] - P.x[a], ty = P.y[b] - P.y[a], tz = P.z[b] - P.z[a]; const l = Math.hypot(tx, ty, tz); tx /= l; ty /= l; tz /= l;
    const cx = P.x[i] + P.dx[i] * lat, cy = P.y[i] + .07, cz = P.z[i] + P.dz[i] * lat, base = pos.length / 3;
    for (const [s, f] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      pos.push(cx + P.dx[i] * 3.2 * s + tx * 5 * f, cy + ty * 5 * f, cz + P.dz[i] * 3.2 * s + tz * 5 * f);
      uv.push((s + 1) / 2, (f + 1) / 2);
    }
    ix.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    i += Math.round((600 + r() * 300) / P.pas);
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(ix);
  scene.add(new T.Mesh(g, new T.MeshBasicMaterial({ map: texChevrons(C.plaque || '#ffcf4a'), transparent: true, side: T.DoubleSide, depthWrite: false })));
  return plaques;
}

/* ================= LA VOITURE (en blocs) ================= */
function faisVoiture(C) {
  const g = new T.Group(), corps = new T.Group(); g.add(corps); g.rotation.order = 'YXZ';
  const caisse = new T.MeshLambertMaterial({ color: C.caisse || '#f1eefa' });
  const noir = new T.MeshLambertMaterial({ color: '#16141d' });
  const vitre = new T.MeshLambertMaterial({ color: '#23304a', emissive: '#0c1424' });
  const bande_ = new T.MeshBasicMaterial({ color: C.bande || '#ff3ec8' });
  const phare = new T.MeshBasicMaterial({ color: '#fff6dc' }), feu = new T.MeshBasicMaterial({ color: '#ff2a3d' });
  const bloc = (par, w, h, l, x, y, z, m) => { const o = new T.Mesh(new T.BoxGeometry(w, h, l), m); o.position.set(x, y, z); par.add(o); return o; };
  bloc(corps, 2.2, .26, 4.5, 0, .32, 0, noir);
  bloc(corps, 2.1, .56, 4.4, 0, .68, 0, caisse);
  bloc(corps, 1.72, .52, 2.0, 0, 1.2, -.35, vitre);
  bloc(corps, 1.62, .1, 1.7, 0, 1.5, -.4, caisse);
  bloc(corps, .46, .03, 2.0, 0, .97, 1.15, bande_);
  bloc(corps, 2.24, .08, 4.46, 0, .5, 0, bande_);
  bloc(corps, 2.05, .1, .45, 0, 1.24, -2.12, caisse);
  bloc(corps, .12, .3, .2, .7, 1.05, -2.05, noir); bloc(corps, .12, .3, .2, -.7, 1.05, -2.05, noir);
  bloc(corps, .5, .16, .05, .66, .74, 2.21, phare); bloc(corps, .5, .16, .05, -.66, .74, 2.21, phare);
  bloc(corps, .62, .14, .05, .7, .76, -2.21, feu); bloc(corps, .62, .14, .05, -.7, .76, -2.21, feu);
  for (const x of [-1.07, 1.07]) for (const z of [-1.45, 1.45]) bloc(g, .44, .78, .78, x, .39, z, noir);
  const ombre = new T.Mesh(new T.PlaneGeometry(2.9, 5.3), new T.MeshBasicMaterial({ map: texRond(.4), color: '#000', transparent: true, opacity: .55, depthWrite: false }));
  ombre.rotation.x = -Math.PI / 2; ombre.position.y = .04; g.add(ombre);
  const lueur = new T.Mesh(new T.PlaneGeometry(4.2, 6.6), new T.MeshBasicMaterial({ map: texRond(.15), color: C.lueur || '#ff3ec8', transparent: true, opacity: .55, blending: T.AdditiveBlending, depthWrite: false }));
  lueur.rotation.x = -Math.PI / 2; lueur.position.y = .05; g.add(lueur);
  // les flammes de la nitro : deux cônes par pot, la pointe vers l'arrière
  const flammes = [], fgeo = new T.ConeGeometry(.26, 1.6, 10, 1, true); fgeo.rotateX(-Math.PI / 2); fgeo.translate(0, 0, -.8);
  const fext = new T.MeshBasicMaterial({ color: '#ff7a24', transparent: true, opacity: .85, blending: T.AdditiveBlending, depthWrite: false });
  const fint = new T.MeshBasicMaterial({ color: '#fff0b0', transparent: true, opacity: .9, blending: T.AdditiveBlending, depthWrite: false });
  const lueurPot = new T.SpriteMaterial({ map: texRond(.2), color: '#ff8a2a', transparent: true, blending: T.AdditiveBlending, depthWrite: false });
  for (const x of [-.55, .55]) {
    const a = new T.Mesh(fgeo, fext), b = new T.Mesh(fgeo, fint), s = new T.Sprite(lueurPot);
    a.position.set(x, .5, -2.25); b.position.set(x, .5, -2.25); b.scale.set(.5, .5, .6);
    s.position.set(x, .5, -2.4); s.scale.set(1.6, 1.6, 1);
    corps.add(a, b, s); flammes.push(a, b, s);
  }
  return { g, corps, flammes, fext, lueur, lueurPot };
}

/* ================= LE CIEL ================= */
function faisCiel(c) {
  const mat = new T.ShaderMaterial({
    uniforms: {
      haut: { value: new T.Color(c.haut) }, horizon: { value: new T.Color(c.horizon) }, bas: { value: new T.Color(c.bas) },
      sol: { value: new T.Vector3(...(c.soleilDir || [0, 1, 0])).normalize() }, solC: { value: new T.Color(c.soleil || '#000') },
    },
    vertexShader: 'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform vec3 haut,horizon,bas,sol,solC;varying vec3 vD;
      void main(){vec3 d=normalize(vD);float h=d.y;
        vec3 c=h>0.?mix(horizon,haut,pow(h,.55)):mix(horizon,bas,pow(-h,.45));
        float s=max(dot(d,sol),0.);c+=solC*(pow(s,900.)*1.5+pow(s,30.)*.3+pow(s,5.)*.12);
        gl_FragColor=vec4(c,1.);}`,
    side: T.BackSide, depthWrite: false, depthTest: false, fog: false,
  });
  const m = new T.Mesh(new T.SphereGeometry(5000, 32, 16), mat);
  m.renderOrder = -10; m.frustumCulled = false;
  return m;
}

/* ================= LA MUSIQUE DE LA MAP ================= */
const MUS = { cadre: null, pret: false, veut: false, jauge: '', bpm: null };
function musCharge(fichier) {
  const f = document.createElement('iframe');
  f.src = fichier; f.title = 'musique'; f.tabIndex = -1; f.setAttribute('aria-hidden', 'true'); f.setAttribute('allow', 'autoplay');
  // visible pour le navigateur (sinon sa boucle d'images s'arrête et la jauge ne bouge plus), invisible pour nous
  f.style.cssText = 'position:fixed;left:0;bottom:0;width:8px;height:8px;opacity:0;pointer-events:none;border:0;z-index:-1';
  f.onload = () => {
    try {
      const d = f.contentDocument;
      MUS.jaugeEl = d.getElementById('speed'); MUS.bouton = d.getElementById('play'); MUS.bpm = d.getElementById('bpm');
      if (MUS.jaugeEl) MUS.jaugeEl.step = 'any';
      MUS.pret = !!(MUS.jaugeEl && MUS.bouton);
      if (MUS.pret && MUS.veut) musJoue(true);
    } catch (e) { erreur('Musique illisible : ' + e.message); }
  };
  document.body.appendChild(f); MUS.cadre = f;
}
const musJoueDeja = () => MUS.bouton && /stop/i.test(MUS.bouton.textContent);
function musJoue(on) {
  MUS.veut = on;
  if (!MUS.pret || on === musJoueDeja()) return;
  MUS.bouton.click();
}
function musVitesse(x) {
  if (!MUS.pret) return;
  const v = (x * 100).toFixed(1);
  if (v === MUS.jauge) return;
  MUS.jauge = v; MUS.jaugeEl.value = v;
  MUS.jaugeEl.dispatchEvent(new MUS.cadre.contentWindow.Event('input'));
}

/* ================= LA COURSE ================= */
let D, PISTE, scene, cam, rendu, ciel, auto, plaques, texs = [];
const etat = { mode: 'attente', i: 0, x: 0, y: 0, z: 0, yr: 0, lat: 0, th: 0, v: 0, yawR: 0, st: 0, n: 1, nOn: false, chute: 0, vx: 0, vy: 0, vz: 0, sauve: 0, boostT: 0, roll: 0, jauge: 0, t: 0, fx: 0 };
const touches = { g: false, d: false, frein: false, nitro: false };
const tactile = { volant: null, x0: 0, st: 0, nitro: new Set() };
let enPause = false;
const camOff = new T.Vector3(), vise = new T.Vector3(), viseL = new T.Vector3(), tmp = new T.Vector3();

function init() {
  D = DECORS[MAP.id];
  if (!D) throw new Error('décor absent : ' + MAP.id);
  document.title = MAP.nom + ' · simulateur';
  PISTE = faisPiste(D.piste);
  rendu = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: PHOTO });
  rendu.setPixelRatio(Math.min(window.devicePixelRatio || 1, PHOTO ? 1 : 1.75));
  rendu.setSize(innerWidth, innerHeight);
  document.body.prepend(rendu.domElement);
  scene = new T.Scene();
  const B = D.brouillard; scene.fog = new T.Fog(B.couleur, B.pres, B.loin);
  scene.background = new T.Color(B.couleur);
  cam = new T.PerspectiveCamera(60, innerWidth / innerHeight, .3, 12000);
  ciel = faisCiel(D.ciel); scene.add(ciel);
  const L = D.lumiere;
  scene.add(new T.HemisphereLight(L.ciel, L.sol, L.force));
  const sol = new T.DirectionalLight(L.soleil, L.soleilForce); sol.position.set(...L.dir); scene.add(sol);
  texs.push(faisRoute(PISTE, D.couleurs, scene));
  const r = rng((D.piste.graine || 1) * 31 + 7);
  plaques = faisPlaques(PISTE, D.couleurs, r, scene);
  D.construire({ T, scene, piste: PISTE, r, rng, toile, cam });
  auto = faisVoiture(D.couleurs); scene.add(auto.g);
  const aniso = rendu.capabilities.getMaxAnisotropy();
  for (const t of texs) { t.anisotropy = aniso; t.needsUpdate = true; }
  place(PISTE.depart, 0);
  if (PHOTO) return photo();
  const fichier = musiqueDe(MAP);
  if (fichier) musCharge(fichier);
  $('nomMap').textContent = MAP.nom;
  $('depart').hidden = false;
  if (!fichier) $('bpmL').hidden = true;
  if (matchMedia('(pointer:coarse)').matches) { $('partir').textContent = 'Touche pour partir'; $('aide').textContent = 'gauche : volant · droite : nitro'; }
  camVue(true);
  addEventListener('resize', taille); taille();
  requestAnimationFrame(boucle);
}

// pose la caisse sur la route (index i, décalage latéral lat), cap dans l'axe
function place(i, lat) {
  const P = PISTE; i = ((i % P.n) + P.n) % P.n;
  etat.i = i; etat.sauve = i;
  etat.x = P.x[i] + P.dx[i] * lat; etat.z = P.z[i] + P.dz[i] * lat; etat.y = etat.yr = P.y[i]; etat.lat = lat;
  etat.th = Math.atan2(P.tx[i], P.tz[i]); etat.yawR = 0; etat.st = 0; etat.roll = 0;
}
function replace() {
  place(etat.sauve, 0);
  etat.v = VC * .35; etat.mode = 'route'; etat.chute = 0; etat.boostT = 0;
  camVue(true);
}

// recale l'index de piste sur la position (marche le long de la route, jamais de recherche globale)
function suis() {
  const P = PISTE; let i = etat.i, al = 0;
  for (let it = 0; it < 400; it++) {
    al = (etat.x - P.x[i]) * P.tx[i] + (etat.z - P.z[i]) * P.tz[i];
    if (al > P.pas * .5) i = (i + 1) % P.n; else if (al < -P.pas * .5) i = (i - 1 + P.n) % P.n; else break;
  }
  etat.i = i;
  etat.lat = (etat.x - P.x[i]) * P.dx[i] + (etat.z - P.z[i]) * P.dz[i];
  const j = al >= 0 ? (i + 1) % P.n : (i - 1 + P.n) % P.n;
  etat.yr = P.y[i] + (P.y[j] - P.y[i]) * Math.min(1, Math.abs(al) / P.pas);
}

function physique(dt) {
  const e = etat, P = PISTE;
  const cible = tactile.volant != null ? tactile.st : (touches.d ? 1 : 0) - (touches.g ? 1 : 0);
  e.st += (cible - e.st) * Math.min(1, dt * 12);
  if (e.mode === 'route') {
    const lmax = e.v / (40 + .3 * e.v);
    e.yawR += (e.st * lmax - e.yawR) * Math.min(1, dt / .1);
    e.th -= e.yawR * dt;
    const veut = (touches.nitro || tactile.nitro.size > 0) && e.n > .01;
    e.nOn = veut;
    e.n = veut ? Math.max(0, e.n - NIT_USE * dt) : Math.min(1, e.n + NIT_GAIN * dt);
    let a = touches.frein ? -FREIN : veut ? ACC_N * (1 - e.v / VN) : ACC * (1 - e.v / VC);
    a -= Math.abs(e.yawR) * e.v * .07;          // braquer frotte
    a -= 9.81 * .6 * P.pente(e.i);             // la pente
    e.v = Math.max(0, e.v + a * dt);
    e.boostT = Math.max(0, e.boostT - dt);
    e.x += Math.sin(e.th) * e.v * dt; e.z += Math.cos(e.th) * e.v * dt;
    suis(); e.y = e.yr;
    for (const p of plaques) {
      let di = e.i - p.i; if (di > P.n / 2) di -= P.n; if (di < -P.n / 2) di += P.n;
      if (Math.abs(di) * P.pas < 5.5 && Math.abs(e.lat - p.lat) < 3.8 && e.t - p.t > 1.5) { p.t = e.t; e.v = Math.min(VN * 1.06, e.v + 22); e.boostT = .9; }
    }
    if (Math.abs(e.lat) > P.W / 2 + .3) {      // hors de la route : elle tombe
      e.mode = 'chute'; e.chute = 0; e.nOn = false;
      e.vx = Math.sin(e.th) * e.v; e.vz = Math.cos(e.th) * e.v; e.vy = 2;
    } else if (Math.abs(e.lat) < P.W / 2 - 3) e.sauve = e.i;
  } else if (e.mode === 'chute') {
    e.chute += dt; e.vy -= GRAV * dt;
    e.x += e.vx * dt; e.y += e.vy * dt; e.z += e.vz * dt;
    e.v *= Math.exp(-1.4 * dt);
    if (e.chute > 1.5) replace();
  }
  e.jauge = Math.min(1, e.v / VN);
}

// la caméra : l'ÉCART à la caisse est lissé (pas la position monde, qui traînerait de v ÷ k derrière elle)
function camVue(net, dt = 0) {
  const e = etat, P = PISTE, i = e.i;
  let ax = Math.sin(e.th) * .55 + P.tx[i] * .45, az = Math.cos(e.th) * .55 + P.tz[i] * .45;
  const l = Math.hypot(ax, az) || 1; ax /= l; az /= l;
  const g = e.jauge, dist = 7.8 + g * 2.2, h = 3 + g * .5;
  tmp.set(-ax * dist, h, -az * dist);
  vise.set(e.x + ax * 9, e.y + 1.3, e.z + az * 9);
  if (net) { camOff.copy(tmp); viseL.copy(vise); }
  if (e.mode !== 'chute') {
    camOff.lerp(tmp, net ? 1 : 1 - Math.exp(-dt * 6));
    cam.position.set(e.x, e.y, e.z).add(camOff);
    viseL.lerp(vise, net ? 1 : 1 - Math.exp(-dt * 14));
  } else viseL.lerp(tmp.set(e.x, e.y + 1, e.z), 1 - Math.exp(-dt * 10));
  if (g > .6 && e.mode === 'route') cam.position.y += Math.sin(e.t * 41) * .025 * (g - .6) * 2.5;
  cam.lookAt(viseL);
  const fov = (cam.aspect < 1 ? 74 : 58) + 13 * g + 7 * e.fx;
  if (net) cam.fov = fov; else cam.fov += (fov - cam.fov) * Math.min(1, dt * 4);
  cam.updateProjectionMatrix();
}

function visuels(dt) {
  const e = etat, a = auto;
  a.g.position.set(e.x, e.y, e.z);
  a.g.rotation.y = e.th;
  a.g.rotation.x = e.mode === 'chute' ? Math.min(.9, e.chute * .6) : -Math.atan(PISTE.pente(e.i));
  const rc = e.mode === 'route' ? Math.max(-.16, Math.min(.16, -e.yawR * e.v * .0035)) : 0;
  e.roll += (rc - e.roll) * Math.min(1, dt * 6);
  a.corps.rotation.z = e.roll;
  const fx = e.nOn ? 1 : e.boostT > 0 ? .7 : 0;
  e.fx += (fx - e.fx) * Math.min(1, dt * 10);
  const vis = e.fx > .03;
  for (let k = 0; k < a.flammes.length; k++) {
    const f = a.flammes[k]; f.visible = vis;
    if (!vis) continue;
    const vif = e.fx * (.85 + .3 * Math.random());
    if (f.isSprite) f.scale.set(1.2 + vif, 1.2 + vif, 1);
    else f.scale.z = (k % 3 ? .55 : .8) * vif * (1 + .5 * e.jauge);
  }
  a.fext.color.set(e.nOn ? '#ff7a24' : '#ffc040'); a.lueurPot.color.copy(a.fext.color);
  a.lueur.material.opacity = .45 + .25 * e.jauge;
}

const H = {};
function hud() {
  const e = etat, kmh = Math.round(e.v * 3.6), pct = Math.round(e.jauge * 100);
  if (H.kmh !== kmh) $('kmh').textContent = H.kmh = kmh;
  if (H.pct !== pct) { H.pct = pct; $('jauge').style.width = pct + '%'; $('pct').textContent = pct + ' %'; }
  const ni = Math.round(e.n * 100);
  if (H.ni !== ni) { H.ni = ni; $('nit').style.width = ni + '%'; }
  if (MUS.bpm) { const b = MUS.bpm.textContent; if (H.bpm !== b) $('bpm').textContent = H.bpm = b; }
}

let dernier = performance.now(), fpsT = 0, fpsN = 0;
function boucle(now) {
  requestAnimationFrame(boucle);
  const dt = Math.min(.05, (now - dernier) / 1000); dernier = now;
  if (enPause) return;
  try {
    if (etat.mode !== 'attente') {
      etat.t += dt;
      const n = dt > .02 ? 2 : 1;
      for (let k = 0; k < n; k++) physique(dt / n);
    }
    visuels(dt); camVue(false, dt);
    ciel.position.copy(cam.position);
    if (D.tick) D.tick(dt, etat.t, cam, etat);
    hud(); musVitesse(etat.jauge);
    rendu.render(scene, cam);
    if (DEBUG) { fpsN++; fpsT += dt; if (fpsT > .5) { $('dbg').textContent = Math.round(fpsN / fpsT) + ' i/s · ' + rendu.info.render.calls + ' dessins · ' + Math.round(rendu.info.render.triangles / 1000) + ' k tri'; fpsN = 0; fpsT = 0; } }
  } catch (err) { erreur(err && err.stack || err); enPause = true; }
}

function taille() {
  rendu.setSize(innerWidth, innerHeight);
  cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
}

function partir() {
  if (etat.mode !== 'attente') return;
  $('depart').hidden = true; etat.mode = 'route';
  musJoue(true);
}
function pause(on) {
  if (etat.mode === 'attente' || on === enPause) return;
  enPause = on; $('pause').hidden = !on;
  musJoue(!on);
  if (!on) dernier = performance.now();
}

// ——— les commandes ———
const KEYS = { ArrowLeft: 'g', KeyA: 'g', ArrowRight: 'd', KeyD: 'd', ArrowDown: 'frein', KeyS: 'frein',
  Space: 'nitro', ShiftLeft: 'nitro', ShiftRight: 'nitro', ArrowUp: 'nitro', KeyW: 'nitro' };
addEventListener('keydown', ev => {
  if (ev.code === 'Escape' || ev.code === 'KeyP') { pause(!enPause); ev.preventDefault(); return; }
  const k = KEYS[ev.code];
  if (k) ev.preventDefault();
  if (ev.repeat) return;
  if (enPause) { if (ev.code === 'Space' || ev.code === 'Enter') pause(false); return; }
  if (etat.mode === 'attente') { if (k || ev.code === 'Enter') partir(); }
  if (ev.code === 'KeyR' && etat.mode === 'route') replace();
  if (k) touches[k] = true;
});
addEventListener('keyup', ev => { const k = KEYS[ev.code]; if (k) touches[k] = false; });
addEventListener('blur', () => { for (const k in touches) touches[k] = false; tactile.nitro.clear(); tactile.volant = null; });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
// tactile : moitié gauche = le volant (le pouce glisse de côté), moitié droite = la nitro
addEventListener('pointerdown', ev => {
  if (ev.target.closest('a,button')) return;
  if (enPause) return;
  if (etat.mode === 'attente') { partir(); if (ev.pointerType === 'mouse') return; }
  if (ev.pointerType === 'mouse') return;
  if (ev.clientX < innerWidth / 2) { tactile.volant = ev.pointerId; tactile.x0 = ev.clientX; tactile.st = 0; }
  else tactile.nitro.add(ev.pointerId);
});
addEventListener('pointermove', ev => {
  if (ev.pointerId !== tactile.volant) return;
  const n = Math.max(-1, Math.min(1, (ev.clientX - tactile.x0) / 70));
  tactile.st = Math.sign(n) * Math.pow(Math.abs(n), 1.15);
});
const lache = ev => { if (ev.pointerId === tactile.volant) { tactile.volant = null; tactile.st = 0; } tactile.nitro.delete(ev.pointerId); };
addEventListener('pointerup', lache); addEventListener('pointercancel', lache);
document.addEventListener('touchmove', ev => ev.preventDefault(), { passive: false });

/* ——— LA PHOTO DE LA MAP (course.html?map=<id>&photo=1) : une image posée, envoyée à serveur.py ——— */
function photo() {
  const p = D.photo || {}, P = PISTE;
  place(P.depart + Math.round((p.m || 0) / P.pas), p.lat || 0);
  etat.v = VC * .8; etat.jauge = .6;
  visuels(0);
  const th = etat.th, f = [Math.sin(th), 0, Math.cos(th)], dr = [-Math.cos(th), 0, Math.sin(th)];
  const at = (o, v) => v.set(etat.x + dr[0] * o[0] + f[0] * o[2], etat.y + o[1], etat.z + dr[2] * o[0] + f[2] * o[2]);
  at(p.cam || [-6, 2.2, 9], cam.position); at(p.vise || [0, 1, -4], tmp); cam.lookAt(tmp);
  cam.fov = p.fov || 50; cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
  rendu.setSize(innerWidth, innerHeight);
  ciel.position.copy(cam.position);
  if (D.tick) D.tick(0, 0, cam, etat);
  rendu.render(scene, cam);
  const url = rendu.domElement.toDataURL('image/jpeg', .9);
  window.__photo = 'envoi';
  fetch('photo?id=' + MAP.id, { method: 'POST', body: url })
    .then(r => { window.__photo = r.ok ? 'ok' : 'echec ' + r.status; document.title = 'PHOTO ' + window.__photo; })
    .catch(e => { window.__photo = 'echec ' + e.message; });
}

window.SIMU = {
  etat, touches, MUS,
  piste: () => PISTE,
  rayonMin: () => Math.round(rayonMin(PISTE)),
  reprendre: () => pause(false),
  volant: x => { tactile.volant = x == null ? null : -1; tactile.st = x || 0; },
  touche: (nom, on) => { if (etat.mode === 'attente') partir(); touches[nom] = on; },
  musique: () => { try { const w = MUS.cadre && MUS.cadre.contentWindow; return { pret: MUS.pret, joue: musJoueDeja(), bpm: MUS.bpm && MUS.bpm.textContent, jauge: MUS.jauge, vitesseMusique: w ? w.eval('speed') : null }; } catch (e) { return { err: e.message }; } },
};

// le décor de la map, puis la course
const sc = document.createElement('script');
sc.src = 'maps/' + MAP.id + '.js';
sc.onload = () => { try { init(); } catch (e) { erreur(e && e.stack || e); } };
sc.onerror = () => erreur('Map introuvable : ' + MAP.id);
document.head.appendChild(sc);
})();
