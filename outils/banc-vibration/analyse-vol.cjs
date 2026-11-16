// L'ANALYSE DES VIBRATIONS (2026-11-15) : lit un relevé de vol.cjs et cherche la HAUTE FRÉQUENCE image par image.
// Pour chaque signal x(t) : le RÉSIDU r[i] = x[i] − (x[i−1] interpolé vers x[i+1] au temps t[i]). Une vibration = le résidu change de signe d'une image à
// l'autre, au moins 3 fois de suite, avec |r| au-dessus du seuil (0,5 px ou 0,1° : crête à crête ≥ 1 px / 0,2°).
// Signaux : la caisse à l'écran (centre, nez, toit, en px), la rotation de la carrosserie DANS le repère de la caméra (°), la rotation de la caméra dans le monde (°),
// la distance caisse-caméra (taille à l'écran, en %).
//   node outils/banc-vibration/analyse.cjs <relevé.json> [--mode vol|sol|tout] [--detail N (les N pires moments, 20 images autour)] [--seuilPx .5] [--seuilDeg .1]
const fs = require('fs');
const F = process.argv[2], A = {}; for (let i = 3; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const { meta, rec: REC } = JSON.parse(fs.readFileSync(F, 'utf8')), C = {}; meta.cols.forEach((n, i) => C[n] = i);
const rec = REC.filter(r => typeof r[0] === 'number'), n = rec.length, MODE = A.mode || 'tout', SPX = +(A.seuilPx || .5), SDEG = +(A.seuilDeg || .1), DET = +(A.detail || 3);
const T = [0]; for (let i = 1; i < n; i++) T[i] = T[i - 1] + Math.min(50, rec[i][C.ms]); /* (16/11) le temps du JEU : dt borné à 50 ms (une image de 100 ms n’avance que de 50) */
const col = k => rec.map(r => r[C[k]]);
/* rotation entre deux quaternions, en degrés autour des axes locaux (x tangage, y lacet, z roulis) */
function qmul(a, b) { return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]]; }
function qinv(a) { return [-a[0], -a[1], -a[2], a[3]]; }
function rotvec(q) { let [x, y, z, w] = q; if (w < 0) { x = -x; y = -y; z = -z; w = -w; } const s = Math.hypot(x, y, z); if (s < 1e-9) return [0, 0, 0]; const a = 2 * Math.atan2(s, w) * 57.29578 / s; return [x * a, y * a, z * a]; }
/* un signal d'angle cumulé à partir des quaternions (pas d'Euler : pas de saut à ±180°) */
function cumul(keys) { const o = [[0], [0], [0]]; for (let i = 1; i < n; i++) { const a = keys.map(k => rec[i - 1][C[k]]), b = keys.map(k => rec[i][C[k]]), d = rotvec(qmul(qinv(a), b)); for (let j = 0; j < 3; j++) o[j][i] = o[j][i - 1] + d[j]; } return o; }
const rel = cumul(['rx', 'ry', 'rz', 'rw']), camW = cumul(['cqx', 'cqy', 'cqz', 'cqw']), carW = cumul(['bx', 'by', 'bz', 'bw']);
const dist = rec.map(r => Math.hypot(r[C.vx], r[C.vy_], r[C.vz])), taille = dist.map((d, i) => 100 * Math.log(Math.max(.01, d) * Math.tan(rec[i][C.fov] * Math.PI / 360))); /* % (log) de taille à l'écran */
const SIG = [['centre x px', col('ex'), SPX], ['centre y px', col('ey'), SPX], ['nez x px', col('nx'), SPX], ['nez y px', col('ny'), SPX], ['toit x px', col('tx'), SPX], ['toit y px', col('ty'), SPX],
  ['caisse/cam tangage °', rel[0], SDEG], ['caisse/cam lacet °', rel[1], SDEG], ['caisse/cam roulis °', rel[2], SDEG],
  ['caméra monde tangage °', camW[0], SDEG], ['caméra monde lacet °', camW[1], SDEG], ['caméra monde roulis °', camW[2], SDEG],
  ['caisse monde tangage °', carW[0], SDEG], ['caisse monde lacet °', carW[1], SDEG], ['caisse monde roulis °', carW[2], SDEG],
  ['taille écran %', taille, .5]];
const okMode = i => MODE === 'tout' || (MODE === 'vol' ? rec[i][C.vol] === 1 : rec[i][C.vol] === 0);
function residu(x) { const r = new Array(n).fill(0); for (let i = 1; i < n - 1; i++) { const a = (T[i] - T[i - 1]) / (T[i + 1] - T[i - 1]); r[i] = x[i] - (x[i - 1] + (x[i + 1] - x[i - 1]) * a); } return r; }
console.log(`# ${meta.tag} — ${n} images (${rec.filter(r => r[C.vol] === 1).length} en vol), dt ${meta.dt}, carte ${meta.carte}, noShake ${meta.noShake}, mode ${MODE}`);
const bilan = [];
for (const [nom, x, seuil] of SIG) {
  const r = residu(x); let suites = [], deb = -1, pire = 0, pireI = -1, nb = 0;
  for (let i = 2; i < n - 1; i++) {
    const zig = okMode(i) && okMode(i - 1) && Math.abs(r[i]) > seuil && Math.abs(r[i - 1]) > seuil && r[i] * r[i - 1] < 0;
    if (zig) { if (deb < 0) deb = i - 1; } else if (deb >= 0) { if (i - deb >= 3) suites.push([deb, i - 1]); deb = -1; }
  }
  for (const [a, b] of suites) for (let i = a; i <= b; i++) { nb++; if (Math.abs(r[i]) > pire) { pire = Math.abs(r[i]); pireI = i; } }
  /* les à-coups isolés aussi : le pire résidu seul (un saut d'une image) */
  let coup = 0, coupI = -1; for (let i = 1; i < n - 1; i++) if (okMode(i) && Math.abs(r[i]) > coup) { coup = Math.abs(r[i]); coupI = i; }
  bilan.push({ nom, suites, nb, pire, pireI, coup, coupI, r, x });
  console.log(`${nom.padEnd(26)} zigzags : ${String(suites.length).padStart(3)} suites, ${String(nb).padStart(4)} images, pire résidu ${pire.toFixed(2)} (image ${pireI}) | pire à-coup isolé ${coup.toFixed(2)} (image ${coupI}, ${rec[coupI] ? ['sol', 'vol', '?'][rec[coupI][C.vol]] : ''})`);
}
/* le détail des pires moments */
const vus = new Set(); let d = 0;
for (const b of bilan.filter(b => b.suites.length).sort((a, b) => b.pire / (b.nom.includes('px') ? SPX : SDEG) - a.pire / (a.nom.includes('px') ? SPX : SDEG))) {
  if (d >= DET) break; const i0 = b.pireI, cle = Math.round(i0 / 20); if (vus.has(cle)) continue; vus.add(cle); d++;
  console.log(`\n## ${b.nom} — autour de l'image ${i0} (s ${rec[i0][C.s]}, ${Math.round(rec[i0][C.vH] * 3.6 * .48)} km/h)`);
  console.log(' i   ms  mode fallT  valeur   résidu | relR°  relT°  relL° | camR°  | pose  si    sh     sl    eta  | tang roul lac');
  for (let i = Math.max(1, i0 - 10); i <= Math.min(n - 2, i0 + 10); i++) { const r = rec[i];
    console.log(`${String(i).padStart(4)} ${String(Math.round(r[C.ms])).padStart(3)} ${['sol', 'VOL', '?'][r[C.vol]]} ${String(r[C.fallT]).padStart(5)} ${b.x[i].toFixed(2).padStart(8)} ${b.r[i].toFixed(2).padStart(7)} | ${residu(rel[2])[i].toFixed(2).padStart(5)} ${residu(rel[0])[i].toFixed(2).padStart(6)} ${residu(rel[1])[i].toFixed(2).padStart(6)} | ${residu(camW[2])[i].toFixed(2).padStart(6)} | ${r[C.pose]} ${String(r[C.si]).padStart(5)} ${String(r[C.sh]).padStart(6)} ${String(r[C.sl]).padStart(6)} ${String(r[C.eta]).padStart(5)} | ${r[C.tang]} ${r[C.roul]} ${r[C.lac]}`); }
}
/* les transitions sol↔vol : combien, et les allers-retours rapprochés */
let tr = [], der = rec[0][C.vol]; for (let i = 1; i < n; i++) if (rec[i][C.vol] !== der) { tr.push([i, der, rec[i][C.vol], T[i]]); der = rec[i][C.vol]; }
let rap = 0; for (let i = 1; i < tr.length; i++) if (tr[i][3] - tr[i - 1][3] < 200) rap++;
console.log(`\ntransitions sol↔vol : ${tr.length}, dont ${rap} à moins de 200 ms de la précédente`, tr.filter((t, i) => i && t[3] - tr[i - 1][3] < 200).slice(0, 8).map(t => 'image ' + t[0]).join(', '));
if (A.json) fs.writeFileSync(A.json, JSON.stringify(bilan.map(b => ({ nom: b.nom, suites: b.suites.length, images: b.nb, pire: +b.pire.toFixed(3), pireI: b.pireI, coup: +b.coup.toFixed(3), coupI: b.coupI }))));
