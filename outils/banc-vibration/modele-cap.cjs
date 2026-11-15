// LE MODÈLE DU CAP EN RETARD D'UNE IMAGE (node seul, sans Chrome) — banc des vibrations du 2026-11-15.
// Rejoue, avec le VRAI three.js du jeu et la VRAIE fonction frameAt (lue dans code/gameplay/ligne-parfaite.js), l'ordre exact des lignes de la conduite :
//   boucle-2-conduite.js : frameAt(s,F) À L'ANCIEN s → dyaw (virage de la route depuis l'image d'avant) → psi −= dyaw → le lacet du pouce → s avance ;
//   boucle-3-physique.js : frameAt(s,F) AU NOUVEAU s → fwdW = F.t·cos(psi) + F.b·sin(psi) → la caisse, puis la caméra (écart lissé dt×7, visée lissée dt×9).
// Le cap MONDE de la caisse vaut donc : cap de la route(s nouveau) + psi, où psi n'a retiré que le virage jusqu'à l'ANCIEN s. Il traîne d'UN PAS de virage :
// lacet de la route × dt. À dt constant c'est un décalage fixe (invisible) ; quand dt change d'une image à l'autre (33 → 50 → 33 ms sur le téléphone), le nez saute.
//   node outils/banc-vibration/modele-cap.cjs [--v 150 (m/s monde)] [--R 120 (rayon du virage, m)] [--motif tel|r30|r60|alt|alt3050|bascule] [--corrige 0|1] [--n 400]
const fs = require('fs'), path = require('path');
const RAC = path.join(__dirname, '..', '..');
const THREE = require(path.join(RAC, 'VERSION PRINCIPALE', 'vendor', 'three.min.js'));
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const V = +(A.v || 150), RAY = +(A.R || 120), N = +(A.n || 400), MOTIF = A.motif || 'tel', CORR = A.corrige === '1';
/* la route : droite 300 m, virage de 90° de rayon RAY, droite 300 m — une CatmullRom comme genCtrl, rééchantillonnée au mètre comme le jeu (getPointAt) */
const ctrl = []; for (let x = -300; x < 0; x += 60) ctrl.push(new THREE.Vector3(x, 0, 0));
for (let a = 0; a <= 90; a += 10) ctrl.push(new THREE.Vector3(RAY * Math.sin(a * Math.PI / 180), 0, RAY * (1 - Math.cos(a * Math.PI / 180))));
for (let z = 60; z <= 300; z += 60) ctrl.push(new THREE.Vector3(RAY, 0, RAY + z));
const curve = new THREE.CatmullRomCurve3(ctrl); curve.arcLengthDivisions = Math.max(200, ctrl.length * 16);
let L = curve.getLength(); const NN = Math.max(300, Math.round(L)); let pts = [], T = [], Nn = [];
for (let i = 0; i <= NN; i++) { pts.push(curve.getPointAt(i / NN)); T.push(curve.getTangentAt(i / NN)); Nn.push(new THREE.Vector3(0, 1, 0)); } let NP = pts.length;
/* la vraie frameAt du jeu */
const src = fs.readFileSync(path.join(RAC, 'code', 'gameplay', 'ligne-parfaite.js'), 'utf8'), m = /function frameAt\(s,out\)\{[\s\S]*?\n\}/.exec(src); if (!m) throw new Error('frameAt introuvable');
const frameAt = eval('(' + m[0] + ')');
const neuf = () => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), n: new THREE.Vector3(), b: new THREE.Vector3() });
function motif(nom, n) { let a = 7 * 7919 + 13; const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const E = 1000 / 60, o = []; for (let i = 0; i < n; i++) { if (nom === 'r60') o.push(E); else if (nom === 'r30') o.push(2 * E); else if (nom === 'alt') o.push(i % 2 ? 2 * E : E); else if (nom === 'alt3050') o.push(i % 2 ? 3 * E : 2 * E);
    else if (nom === 'bascule') o.push(((i / 60) | 0) % 2 ? 2 * E : E); else { const r = rnd(); o.push(r < .80 ? 2 * E : r < .95 ? 3 * E : r < .985 ? 4 * E : 6 * E); } } return o; }
const VOL_R0 = 40, VOL_RK = .3, VOL_TAU = .1, VOL_LIS = 21.4, lacetMax = vw => Math.max(8, vw) / (VOL_R0 + VOL_RK * Math.max(8, vw));
const F = neuf(), FV = neuf(), prevTv = new THREE.Vector3(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), tmp3 = new THREE.Vector3(), fwdW = new THREE.Vector3(), car = new THREE.Vector3(), camD = new THREE.Vector3(),
  off = new THREE.Vector3(), cible = new THREE.Vector3(), cam = new THREE.PerspectiveCamera(100, 844 / 390, .1, 5000), camUp = new THREE.Vector3(0, 1, 0), mi = new THREE.Matrix4(), pr = new THREE.Vector3();
let s = 150, lat = 0, psi = 0, steer = 0, yawR = 0, routeLacet = 0, prevTvalid = false, vise = null, camLat = 0, premier = true;
const D = motif(MOTIF, N), out = [], camBack = 6.2, camH = camBack * Math.tan(26 * Math.PI / 180);
for (let k = 0; k < N && s < L - 60; k++) { const dt = Math.min(D[k] / 1000, .05);
  /* --- boucle-2-conduite.js --- */
  frameAt(s, F);
  if (!CORR) { if (prevTvalid) { tmp.crossVectors(prevTv, F.t); const dyaw = Math.atan2(tmp.dot(F.n), prevTv.dot(F.t)); psi = THREE.MathUtils.clamp(psi - dyaw, -1.4, 1.4); routeLacet = dt > 0 ? dyaw / dt : 0; } prevTv.copy(F.t); prevTvalid = true; }
  const target = THREE.MathUtils.clamp((routeLacet + (THREE.MathUtils.clamp((0 - lat) / (Math.max(6, V) * .9), -.4, .4) - psi) * 3) / lacetMax(V), -1, 1); /* le pilote de mesure (dbgAuto) */
  steer += (target - steer) * (1 - Math.exp(-dt * VOL_LIS));
  yawR += (steer * lacetMax(V) - yawR) * (1 - Math.exp(-dt / VOL_TAU)); psi += yawR * dt;
  lat += V * Math.sin(psi) * dt; s += V * Math.cos(psi) * dt;
  /* --- LE CORRECTIF À L'ESSAI (--corrige 1) : le virage de la route se retire APRÈS l'avance, sur le repère où la caisse est posée --- */
  if (CORR) { frameAt(s, F); if (prevTvalid) { tmp.crossVectors(prevTv, F.t); const dyaw = Math.atan2(tmp.dot(F.n), prevTv.dot(F.t)); psi = THREE.MathUtils.clamp(psi - dyaw, -1.4, 1.4); routeLacet = dt > 0 ? dyaw / dt : 0; } prevTv.copy(F.t); prevTvalid = true; }
  /* --- boucle-3-physique.js --- */
  frameAt(s, F); car.copy(F.p).addScaledVector(F.b, lat);
  fwdW.copy(F.t).multiplyScalar(Math.cos(psi)).addScaledVector(F.b, Math.sin(psi)).normalize();
  camD.copy(F.t).lerp(fwdW, .55).normalize(); camLat += (lat - camLat) * (1 - Math.exp(-dt / .22));
  const cLag = THREE.MathUtils.clamp(camLat - lat, -camBack * .3, camBack * .3);
  cible.copy(camD).multiplyScalar(-camBack).addScaledVector(F.n, camH).addScaledVector(F.b, cLag);
  if (premier) off.copy(cible); else off.lerp(cible, Math.min(1, dt * 7)); cam.position.copy(car).add(off);
  camUp.lerp(F.n, Math.min(1, dt * 4)).normalize(); cam.up.copy(camUp);
  tmp2.copy(car).addScaledVector(fwdW, 8.5).addScaledVector(F.n, .05).addScaledVector(F.b, cLag * .5);
  frameAt(Math.min(L - 1, s + 35), FV); tmp3.copy(FV.p).addScaledVector(FV.b, lat).addScaledVector(FV.n, 1.2);
  const dd = tmp3.distanceTo(tmp2), kV = .35 * THREE.MathUtils.clamp(1 - (dd - 40) / 60, 0, 1); tmp2.lerp(tmp3, kV).sub(car);
  if (!vise) vise = tmp2.clone(); else vise.lerp(tmp2, Math.min(1, dt * 9)); tmp2.copy(vise).add(car); cam.lookAt(tmp2); cam.updateMatrixWorld(true); premier = false;
  /* --- le relevé : le cap de la caisse dans le repère de la caméra, et son nez à l'écran --- */
  mi.copy(cam.matrixWorld).invert(); tmp.copy(fwdW).transformDirection(mi); const lacet = Math.atan2(tmp.x, -tmp.z) * 57.2958;
  pr.copy(car).addScaledVector(fwdW, 2).applyMatrix4(mi).applyMatrix4(cam.projectionMatrix); const nez = (pr.x * .5 + .5) * 844;
  pr.copy(car).applyMatrix4(mi).applyMatrix4(cam.projectionMatrix); const ax = (pr.x * .5 + .5) * 844;
  const capM = Math.atan2(fwdW.z, fwdW.x) * 57.2958, capR = Math.atan2(F.t.z, F.t.x) * 57.2958;
  out.push({ k, ms: D[k], s, lat, psi: psi * 57.2958, lacet, nez: nez - ax, ax, capM, capR, rl: routeLacet * 57.2958 }); }
const z = (x, i) => { const a = out[i].ms, b = out[i + 1].ms; return ((x[i] - x[i - 1]) * b - (x[i + 1] - x[i]) * a) / (a + b); };
const st = (nom, seuil) => { const x = out.map(o => o[nom]); let mx = 0, n = 0, im = 0, sq = 0; for (let i = 2; i < out.length - 2; i++) { const a = Math.abs(z(x, i)); sq += a * a; if (a > seuil) n++; if (a > mx) { mx = a; im = i; } } return { n, mx, im, eff: Math.sqrt(sq / out.length) }; };
const a = st('lacet', .2), b = st('nez', 1), c = st('capM', .2), d = st('ax', 1);
console.log(`modèle · v ${V} m/s (${(V * 3.6).toFixed(0)} km/h monde) · rayon ${RAY} m → lacet de la route ${(V / RAY * 57.3).toFixed(0)} °/s · motif ${MOTIF} · ${CORR ? 'CORRIGÉ' : 'code actuel'} · ${out.length} images`);
console.log(`  cap MONDE de la caisse   : ${c.n} images > 0,2° · max ${c.mx.toFixed(2)}° · eff ${c.eff.toFixed(3)}°`);
console.log(`  lacet caisse / caméra    : ${a.n} images > 0,2° · max ${a.mx.toFixed(2)}° (image ${a.im}) · eff ${a.eff.toFixed(3)}°`);
console.log(`  nez de la caisse (2 m)   : ${b.n} images > 1 px · max ${b.mx.toFixed(2)} px CSS (×3 sur l'écran du 13 Pro) · eff ${b.eff.toFixed(3)}`);
console.log(`  centre de la caisse (x)  : ${d.n} images > 1 px · max ${d.mx.toFixed(2)} px CSS`);
if (A.detail !== '0') { const i0 = a.im; console.log('     k   ms       s    psi°  capMonde° capRoute°  lacet/cam°  nez px   z(lacet)');
  for (let i = Math.max(1, i0 - 10); i <= Math.min(out.length - 2, i0 + 10); i++) { const o = out[i]; console.log(`${i === i0 ? '>' : ' '} ${String(o.k).padStart(4)} ${o.ms.toFixed(0).padStart(4)} ${o.s.toFixed(1).padStart(7)} ${o.psi.toFixed(2).padStart(7)} ${o.capM.toFixed(2).padStart(9)} ${o.capR.toFixed(2).padStart(9)} ${o.lacet.toFixed(2).padStart(10)} ${o.nez.toFixed(1).padStart(7)} ${z(out.map(q => q.lacet), i).toFixed(2).padStart(8)}`); } }
