// LE TABLEAU AVANT / APRÈS des relevés de vol.cjs (16/11, lot « vibration », les restes).
//   node outils/banc-vibration/ab-vol.cjs <avant.json> <après.json> [--egal 1 (compare image par image : à 60 i/s réguliers les deux courses doivent coller)]
// Par fichier, EN VOL : les zigzags (analyse-vol.cjs) de la caméra dans le monde et de la caisse dans la caméra ;
// LA MARCHE DE POSE : aux images où la préparation brute (VEQ.aBrut) saute de < 0,05 à > 0,5, le saut de rotation de la caisse (pas de cette image − pas d'avant, °) ;
// la montée la plus rapide de la préparation hors marche (/s) et le nombre d'images où le plafond de montée a joué (poseM < poseBrut).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const A = process.argv.slice(2).filter(x => !x.startsWith('--')), EGAL = process.argv.includes('--egal');
function qmul(a, b) { return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]]; }
function rv(a, b) { let [x, y, z, w] = qmul([-a[0], -a[1], -a[2], a[3]], b); if (w < 0) { x = -x; y = -y; z = -z; w = -w; } const s = Math.hypot(x, y, z); if (s < 1e-9) return [0, 0, 0]; const k = 2 * Math.atan2(s, w) * 57.29578 / s; return [x * k, y * k, z * k]; }
function lit(f) { const J = JSON.parse(fs.readFileSync(f, 'utf8')), C = {}; J.meta.cols.forEach((c, i) => C[c] = i); return { J, C, R: J.rec.filter(r => typeof r[0] === 'number') }; }
for (const f of A) {
  const { J, C, R } = lit(f), n = R.length, nv = R.filter(r => r[C.vol] === 1).length;
  const js = path.join(require('os').tmpdir(), 'abvol-' + process.pid + '.json');
  execFileSync('node', [path.join(__dirname, 'analyse-vol.cjs'), f, '--mode', 'vol', '--detail', '0', '--json', js], { stdio: ['ignore', 'ignore', 'inherit'] });
  const B = JSON.parse(fs.readFileSync(js, 'utf8')), g = nom => { const b = B.find(x => x.nom === nom); return `${b.images}/${b.pire.toFixed(2)}`; };
  /* la marche de pose */
  const q = i => ['qx', 'qy', 'qz', 'qw'].map(c => R[i][C[c]]); const ang = []; for (let i = 1; i < n; i++) ang[i] = rv(q(i - 1), q(i));
  const dtj = i => Math.min(50, R[i][C.ms]) / 1000; /* le saut de rotation d'une image = (vitesse de rotation de cette image − celle d'avant) × dt : à dt alterné, une rotation régulière ne compte pas */
  const exc = k => Math.hypot(...[0, 1, 2].map(j => (ang[k][j] / dtj(k) - ang[k - 1][j] / dtj(k - 1)) * dtj(k)));
  const sauts = []; let monteMax = 0, plaf = 0, depart = 0;
  for (let i = 2; i < n - 2; i++) { if (R[i][C.vol] !== 1 || R[i - 1][C.vol] !== 1) continue;
    const b0 = R[i - 1][C.poseBrut], b1 = R[i][C.poseBrut], dt = R[i][C.ms] / 1000;
    if (b1 != null && R[i][C.poseM] < b1 - 1e-3) plaf++;
    if (b0 < .05 && b1 > .5) { let m = 0; for (const k of [i, i + 1]) { if (!ang[k] || !ang[k - 1] || R[k][C.vol] !== 1) continue; m = Math.max(m, exc(k)); } sauts.push(m); }
    else if (b0 < .05 && b1 > b0) depart = Math.max(depart, b1 - b0);
    else if (b0 > .001 && b1 > b0) monteMax = Math.max(monteMax, (b1 - b0) / Math.min(dt, .05)); }
  /* le saut de rotation d'une image à l'autre, toutes images de vol */
  let gros = 0, pire = 0; for (let i = 2; i < n; i++) if (R[i][C.vol] === 1 && R[i - 1][C.vol] === 1 && R[i - 2][C.vol] === 1) { const d = exc(i); if (d > 2) gros++; pire = Math.max(pire, d); }
  sauts.sort((a, b) => a - b);
  console.log(`${J.meta.tag.padEnd(42)} ${n} img, vol ${nv} | zigzags (images/pire) cam monde tangage ${g('caméra monde tangage °')}° lacet ${g('caméra monde lacet °')}° · caisse/cam tangage ${g('caisse/cam tangage °')}° · taille ${g('taille écran %')} % · centre y ${g('centre y px')} px`
    + ` | marches de pose ${sauts.length} (saut de rotation méd ${(sauts[sauts.length >> 1] || 0).toFixed(2)}° pire ${(sauts[sauts.length - 1] || 0).toFixed(2)}°) · montée la plus vive ${monteMax.toFixed(1)} /s · départ continu le plus haut ${depart.toFixed(2)} · plafond actif ${plaf} img · sauts de rotation > 2° : ${gros}, pire ${pire.toFixed(2)}°`);
  fs.unlinkSync(js);
}
if (EGAL && A.length === 2) { /* 60 i/s : les deux courses image par image */
  const a = lit(A[0]), b = lit(A[1]), n = Math.min(a.R.length, b.R.length); let dp = 0, dc = 0, dq = 0, i9 = -1;
  for (let i = 0; i < n; i++) { const r = a.R[i], s = b.R[i];
    const p = Math.hypot(r[a.C.px] - s[b.C.px], r[a.C.py] - s[b.C.py], r[a.C.pz] - s[b.C.pz]), c = Math.hypot(r[a.C.cx] - s[b.C.cx], r[a.C.cy] - s[b.C.cy], r[a.C.cz] - s[b.C.cz]);
    const d = rv(['rx', 'ry', 'rz', 'rw'].map(k => r[a.C[k]]), ['rx', 'ry', 'rz', 'rw'].map(k => s[b.C[k]])), qd = Math.hypot(...d);
    if (p > dp) { dp = p; i9 = i; } dc = Math.max(dc, c); dq = Math.max(dq, qd); }
  console.log(`ÉGALITÉ (${n} images) : caisse ≤ ${dp.toFixed(4)} m (image ${i9}) · caméra ≤ ${dc.toFixed(4)} m · caisse dans la caméra ≤ ${dq.toFixed(4)}°`);
}
