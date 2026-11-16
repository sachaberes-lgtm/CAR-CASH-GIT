// LE MODÈLE DU SUIVI DE CAMÉRA (hors navigateur, Node seul) — ce n'est PAS le jeu : les lois de suivi de la caméra de route recopiées de
// code/moteur/boucle-3-physique.js (lignes 176-236 : _camLat τ 0,22 s exact, off.lerp(dt×7), visée lerp(dt×9), camUp lerp(dt×4), lookAt), posées sur une
// route analytique (cercle, crête, changement de ligne) à vitesse constante. Sert à ESTIMER ce que l'irrégularité de dt seule fait à la caisse à l'écran,
// en attendant ou en complément du vrai banc (cadence.cjs). Sorties : le même résidu que analyse-cadence.cjs (px CSS, écran 844×390).
//   node outils/banc-vibration/modele-suivi.cjs [--v 125 (m/s monde)] [--fov 85]
const path = require('path'), THREE = require(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE', 'vendor', 'three.min.js'));
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const V = +(A.v || 125), FOV = +(A.fov || 85), W = 844, H = 390;
function alea(g) { let a = g >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function suite(nom, n) { const r = alea(1000), o = []; for (let i = 0; i < n; i++) { const u = r(); o.push(nom === 'r30' ? 1000 / 30 : nom === 'r60' ? 1000 / 60 : nom === 'alt' ? (i % 2 ? 1000 / 30 : 1000 / 60) : (u < .82 ? 28 + 6.5 * (.5 + (r() + r() + r() - 1.5) / 3 * 1.2) + 2.2 : u < .96 ? 35 + 11 * r() : u < .98 ? 22 + 4 * r() : 51 + 49 * r() * r())); } return o; }
/* la route : s → repère (p, t, n, b). cercle horizontal de rayon R ; crête = cercle vertical de rayon R */
function route(type, R) { return (s, F) => { const a = s / R;
  if (type === 'virage') { F.p.set(R * Math.sin(a), 0, R * (1 - Math.cos(a))); F.t.set(Math.cos(a), 0, Math.sin(a)); F.n.set(0, 1, 0); }
  else if (type === 'crete') { F.p.set(R * Math.sin(a), R * (Math.cos(a) - 1), 0); F.t.set(Math.cos(a), -Math.sin(a), 0); F.n.set(Math.sin(a), Math.cos(a), 0); }
  else { F.p.set(s, 0, 0); F.t.set(1, 0, 0); F.n.set(0, 1, 0); }
  F.b.crossVectors(F.n, F.t); }; }
function joue(nomSuite, type, R, latV) {
  const fr = route(type, R), F = { p: new THREE.Vector3(), t: new THREE.Vector3(), n: new THREE.Vector3(), b: new THREE.Vector3() }, FV = { p: new THREE.Vector3(), t: new THREE.Vector3(), n: new THREE.Vector3(), b: new THREE.Vector3() };
  const cam = new THREE.PerspectiveCamera(FOV, W / H, .1, 5000), car = new THREE.Vector3(), camD = new THREE.Vector3(), off = new THREE.Vector3(), cible = new THREE.Vector3(), vise = new THREE.Vector3(), tmp2 = new THREE.Vector3(), tmp3 = new THREE.Vector3(), camUp = new THREE.Vector3(0, 1, 0), pr = new THREE.Vector3();
  const camBack = 4.6, camH = 2.4; let s = 0, lat = 0, camLat = 0, t = 0, init = false; const rows = [];
  const dts = suite(nomSuite, 700);
  for (let i = 0; i < dts.length; i++) { const dtms = dts[i], dt = Math.min(dtms / 1000, .05); t += dt; s += V * dt;
    if (latV) lat += latV * Math.sign(Math.sin(t * 2.1)) * dt * (Math.abs(lat) < 9 || Math.sign(Math.sin(t * 2.1)) !== Math.sign(lat) ? 1 : 0); /* un changement de ligne à latV m/s, aller-retour toutes les 1,5 s */
    fr(s, F); car.copy(F.p).addScaledVector(F.b, lat);
    camD.copy(F.t); /* psi = 0 : le nez dans l'axe de la route */
    camLat += (lat - camLat) * (1 - Math.exp(-dt / .22));
    const cLag = THREE.MathUtils.clamp(camLat - lat, -camBack * .3, camBack * .3);
    cible.set(0, 0, 0).addScaledVector(camD, -camBack).addScaledVector(F.n, camH).addScaledVector(F.b, cLag);
    if (!init) { off.copy(cible); }
    off.lerp(cible, Math.min(1, dt * 7));
    cam.position.copy(car).add(off);
    camUp.lerp(F.n, Math.min(1, dt * 4)).normalize(); cam.up.copy(camUp);
    tmp2.copy(car).addScaledVector(F.t, 8.5).addScaledVector(F.n, 1.05 - 1.0).addScaledVector(F.b, cLag * .5);
    const dR = THREE.MathUtils.clamp(V * .45, 35, 90); fr(s + dR, FV); tmp3.copy(FV.p).addScaledVector(FV.b, lat).addScaledVector(FV.n, 1.2);
    const dd = tmp3.distanceTo(tmp2), kV = .35 * (35 / dR) * THREE.MathUtils.clamp(1 - (dd - dR * 8 / 7) / (dR * 12 / 7), 0, 1);
    tmp2.lerp(tmp3, kV).sub(car);
    if (!init) { vise.copy(tmp2); init = true; } else vise.lerp(tmp2, Math.min(1, dt * 9));
    tmp2.copy(vise).add(car); cam.lookAt(tmp2); cam.updateMatrixWorld(true); cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
    pr.copy(car).addScaledVector(F.n, .6).project(cam);
    if (i > 150) rows.push({ dt: dtms, x: (pr.x * .5 + .5) * W, y: (-pr.y * .5 + .5) * H }); }
  const o = {};
  for (const k of ['x', 'y']) { let s2 = 0, mx = 0, zz = 0, n = 0, pe = 0;
    for (let i = 1; i < rows.length - 1; i++) { const a = rows[i - 1][k], b = rows[i][k], c = rows[i + 1][k], d1 = rows[i].dt, d2 = rows[i + 1].dt, e = b - (a + (c - a) * d1 / (d1 + d2));
      s2 += e * e; mx = Math.max(mx, Math.abs(e)); if (e * pe < 0 && Math.abs(e) > 1 && Math.abs(pe) > 1) zz++; pe = e; n++; }
    o[k] = `${Math.sqrt(s2 / n).toFixed(2)}/${mx.toFixed(2)} zz${(zz / n * 100).toFixed(1)}`; }
  return o;
}
console.log(`modèle du suivi · ${V} m/s monde (${Math.round(V * 3.6)} km/h affichés) · champ ${FOV}° · résidu efficace/max en px CSS, zz = zigzags > 1 px pour 100 images`);
for (const [nom, type, R, lv] of [['ligne droite', 'droite', 0, 0], ['virage R 300 m', 'virage', 300, 0], ['virage R 150 m', 'virage', 150, 0], ['crête R 200 m', 'crete', 200, 0], ['crête R 80 m', 'crete', 80, 0], ['changement de ligne 25 m/s', 'droite', 0, 25], ['virage R 200 + ligne 25 m/s', 'virage', 200, 25]])
  for (const su of ['r60', 'r30', 'alt', 'tel']) { const r = joue(su, type, R, lv); console.log(nom.padEnd(30), su.padEnd(4), 'x', r.x.padEnd(20), 'y', r.y); }
