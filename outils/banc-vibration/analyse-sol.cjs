// L'ANALYSE DU BANC DES VIBRATIONS : lit un relevé de vib.cjs et cherche la composante HAUTE FRÉQUENCE de la caisse DANS L'IMAGE (repère de la caméra).
// Pour chaque série x (pixels de la caisse à l'écran, lacet/tangage/roulis relatifs à la caméra), l'écart d'une image à la droite tirée entre ses deux voisines
// (pondérée par les durées : un dt irrégulier seul ne fabrique pas d'écart) : z[i] = x[i] − interp(x[i−1], x[i+1]). Une image qui « tique » = |z| au-dessus du seuil.
//   node outils/banc-vibration/analyse.cjs <relevé.json> [--top 8] [--autour 10] [--mode 0|1 (sol|vol)] [--serie lacet] [--csv fichier] [--seg tel] [--hoquet i0 (24 images de carBody.scale.y à partir de i0)]
const fs = require('fs');
const f = process.argv[2], A = {}; for (let i = 3; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const J0 = JSON.parse(fs.readFileSync(f, 'utf8'));
/* --seg nom : un seul motif du programme */
const SG = A.seg && J0.segs ? J0.segs.find(x => x.nom === A.seg) : null; if (A.seg && !SG) { console.error('segments :', (J0.segs || []).map(x => x.nom).join(' ')); process.exit(1); }
const J = SG ? Object.assign({}, J0, { R: J0.R.slice(SG.i0, SG.i0 + SG.n), motif: SG.nom }) : J0, R = J.R, C = {}; J.cols.forEach((c, i) => C[c] = i);
const col = n => R.map(r => r[C[n]]), msVrai = col('ms'), ms = msVrai.map(x => Math.min(x, 50)) /* le temps du JEU : dt est borné à 50 ms (au-delà, l'image est un gel, pas une vibration) */, mode = col('mode'), N = R.length;
const SPD = 0.5, kmh = R.map(r => Math.abs(r[C.vA]) * 3.6 * SPD);
/* séries dérivées : la caisse dans l'image. px = pixels CSS (×3 = pixels de l'écran du 13 Pro) */
const S = {
  ax: { v: col('ax'), seuil: 1, u: 'px' }, ay: { v: col('ay'), seuil: 1, u: 'px' },
  toitx: { v: R.map(r => r[C.bx] - r[C.ax]), seuil: .7, u: 'px' }, toity: { v: R.map(r => r[C.by] - r[C.ay]), seuil: .7, u: 'px' },
  nezx: { v: R.map(r => r[C.cx] - r[C.ax]), seuil: 1, u: 'px' },
  lacet: { v: col('lacet'), seuil: .2, u: '°' }, tangage: { v: col('tangage'), seuil: .2, u: '°' }, roulis: { v: col('roulis'), seuil: .2, u: '°' },
  routex: { v: R.map(r => r[C.rx] - r[C.ax]), seuil: 2, u: 'px' }, routey: { v: R.map(r => r[C.ry] - r[C.ay]), seuil: 2, u: 'px' },
  fov: { v: col('fov'), seuil: .5, u: '°' }, distCam: { v: R.map(r => Math.hypot(r[C.vx], r[C.vy], r[C.vz])), seuil: .05, u: 'm' },
};
function zde(x) { const z = new Float64Array(N); for (let i = 1; i < N - 1; i++) { const a = ms[i], b = ms[i + 1]; /* x[i-1] à −a, x[i+1] à +b */
  let d0 = x[i] - x[i - 1], d1 = x[i + 1] - x[i]; if (Math.abs(d0) > 180) d0 -= 360 * Math.sign(d0); if (Math.abs(d1) > 180) d1 -= 360 * Math.sign(d1);
  z[i] = (d0 * b - d1 * a) / (a + b); } return z; }
const ok = i => i > 2 && i < N - 3 && [-2, -1, 0, 1, 2].every(k => R[i + k][C.mode] === R[i][C.mode] && R[i + k][C.L] === R[i][C.L] && R[i + k][C.calc] === 1) && (A.mode == null || R[i][C.mode] === +A.mode);
const duree = msVrai.reduce((a, b) => a + b, 0) / 1000, nSol = mode.filter(m => m === 0).length, nVol = mode.filter(m => m === 1).length;
console.log(`${f.split('/').pop()} · ${J.carte} · motif ${J.motif} · moteur ${J.moteur} · ${N} images, ${duree.toFixed(0)} s · sol ${nSol} vol ${nVol} · pas de route ${J.meta.pas.toFixed(2)} m · ${J.meta.W}×${J.meta.H} · km/h médian ${kmh.slice().sort((a, b) => a - b)[N >> 1].toFixed(0)}`);
const res = {};
for (const [nom, s] of Object.entries(S)) { if (A.serie && A.serie !== nom) continue;
  const z = zde(s.v); let n = 0, nSolT = 0, nVolT = 0, mx = 0, im = -1, sq = 0, nb = 0; const ev = [];
  for (let i = 0; i < N; i++) { if (!ok(i)) continue; const a = Math.abs(z[i]); nb++; sq += a * a; if (a > s.seuil) { n++; if (mode[i] === 0) nSolT++; else nVolT++; ev.push([a, i]); } if (a > mx) { mx = a; im = i; } }
  res[nom] = { z, ev };
  console.log(`  ${nom.padEnd(8)} seuil ${s.seuil} ${s.u} : ${String(n).padStart(4)} images au-dessus (sol ${nSolT}, vol ${nVolT}) sur ${nb} · eff ${Math.sqrt(sq / Math.max(1, nb)).toFixed(3)} · max ${mx.toFixed(2)} ${s.u} à l'image ${im}`);
}
/* les pires moments, regroupés (±12 images), sur la série demandée ou le lacet + ax + ay */
const top = +(A.top || 5), aut = +(A.autour || 10);
for (const nom of (A.serie ? [A.serie] : ['lacet', 'ax', 'ay', 'roulis', 'tangage'])) { const { z, ev } = res[nom]; ev.sort((a, b) => b[0] - a[0]); const pris = [];
  for (const [a, i] of ev) { if (pris.some(j => Math.abs(j - i) < 25)) continue; pris.push(i); if (pris.length >= top) break; }
  for (const i of pris) { console.log(`\n== ${nom} : image ${i}, écart ${z[i].toFixed(2)} ${S[nom].u} · ${mode[i] ? 'VOL' : 'SOL'} · s ${R[i][C.s].toFixed(0)} m / ${R[i][C.L].toFixed(0)} · zone ${R[i][C.zone]} · ${kmh[i].toFixed(0)} km/h · lacet de la route ${(R[i][C.routeLacet] * 57.3).toFixed(1)} °/s`);
    console.log('   i     ms mode      s    lat    psi  steer | ax     ay    | lacet  tang  roul  | z      | routeLac°/s shake hop   fov  nit viseR');
    for (let k = Math.max(0, i - aut); k <= Math.min(N - 1, i + aut); k++) { const r = R[k];
      console.log(`${k === i ? '>' : ' '} ${String(k).padStart(5)} ${r[C.ms].toFixed(0).padStart(4)} ${r[C.mode]}${r[C.calc] ? ' ' : '!'} ${r[C.s].toFixed(1).padStart(8)} ${r[C.lat].toFixed(2).padStart(6)} ${r[C.psi].toFixed(3).padStart(6)} ${r[C.steer].toFixed(2).padStart(5)} | ${r[C.ax].toFixed(1).padStart(6)} ${r[C.ay].toFixed(1).padStart(6)} | ${r[C.lacet].toFixed(2).padStart(6)} ${r[C.tangage].toFixed(2).padStart(6)} ${r[C.roulis].toFixed(2).padStart(6)} | ${z[k].toFixed(2).padStart(6)} | ${(r[C.routeLacet] * 57.3).toFixed(1).padStart(6)} ${r[C.shake].toFixed(2)} ${r[C.hopY].toFixed(2)} ${r[C.fov].toFixed(1)} ${r[C.nitro]} ${(+r[C.viseR]).toFixed(2)}`); } } }
/* L'HYPOTHÈSE DU CAP EN RETARD D'UNE IMAGE : à l'image i, la caisse est posée sur le repère de la route en s(i) mais psi n'a retiré le virage de la route que jusqu'à s(i−1).
   Le retard = le virage de la route sur le pas de CETTE image = routeLacet(i+1) × ms(i+1) (c'est l'image suivante qui le mesure). On compare son écart haute fréquence à celui du lacet mesuré. */
{ const zl = res.lacet ? res.lacet.z : zde(S.lacet.v), ret = R.map((r, i) => i + 1 < N ? R[i + 1][C.routeLacet] * 57.2958 * R[i + 1][C.ms] / 1000 : 0), zp = zde(ret); let sxy = 0, sxx = 0, syy = 0, n = 0, n2 = 0, d2 = 0, gros = 0, grosOk = 0;
  for (let i = 0; i < N - 2; i++) if (ok(i) && mode[i] === 0) { sxy += zl[i] * zp[i]; sxx += zp[i] * zp[i]; syy += zl[i] * zl[i]; n++; if (Math.abs(zl[i]) > .5) { gros++; if (zl[i] * zp[i] > 0 && Math.abs(zp[i]) > .25) grosOk++; } }
  const pente = sxy / sxx; for (let i = 0; i < N - 2; i++) if (ok(i) && mode[i] === 0) { const e = zl[i] - pente * zp[i]; d2 += e * e; n2++; }
  if (n > 10 && sxx > 0) console.log(`\nCAP EN RETARD (sol) · écart de lacet mesuré contre « virage de la route sur le pas de l'image » : corrélation ${(sxy / Math.sqrt(sxx * syy)).toFixed(3)}, pente ${pente.toFixed(2)} · eff prévu ${Math.sqrt(sxx / n).toFixed(3)}° · eff mesuré ${Math.sqrt(syy / n).toFixed(3)}° · reste une fois le retard retiré ${Math.sqrt(d2 / n2).toFixed(3)}° · des ${gros} tics de plus de 0,5°, ${grosOk} sont prévus (même image, > 0,25°)`); }
/* LE HOQUET DE LA CARROSSERIE (carBody.scale, cgorTick) : combien d'images où la hauteur de la carrosserie change de plus de 0,4 % d'une image à l'autre */
if (C.scaleY != null && R[0][C.scaleY] != null) { let n = 0, alt = 0, mn = 9, mx = 0, prem = -1, suite = 0, pire = 0; for (let i = 1; i < N; i++) { const a = R[i][C.scaleY], b = R[i - 1][C.scaleY], d = a - b; mn = Math.min(mn, a); mx = Math.max(mx, a);
    if (Math.abs(d) > .004) { n++; if (prem < 0) prem = i; suite++; pire = Math.max(pire, suite); if (i > 1 && d * (b - R[i - 2][C.scaleY]) < 0) alt++; } else suite = 0; }
  const f = Math.round(390 / 2 / Math.tan(R[N >> 1][C.fov] * Math.PI / 360)), dist = Math.abs(R[N >> 1][C.vz]);
  console.log(`\nHOQUET · hauteur de la carrosserie (carBody.scale.y) : de ${mn.toFixed(3)} à ${mx.toFixed(3)} · ${n} images sur ${N} où elle change de plus de 0,4 % (dont ${alt} en va-et-vient d'une image à l'autre) · plus longue suite ${pire} images (${(pire * ms[N >> 1] / 1000).toFixed(1)} s) · 1re à l'image ${prem} · battements de pièces ${R[N - 1][C.cgorN]} · |gy| final ${Math.abs(R[N - 1][C.cgorGy]).toExponential(1)}`);
  console.log(`         à l'écran : le toit (1,2 m) bouge de ${((mx - mn) * 1.2 * f / dist).toFixed(1)} px CSS = ${((mx - mn) * 1.2 * f / dist * 3).toFixed(0)} px du 13 Pro (caméra à ${dist.toFixed(1)} m)`);
  if (A.hoquet) { const i0 = +A.hoquet; console.log('   i   ms  mode  scaleY   gy        pièces'); for (let i = i0; i < Math.min(N, i0 + 24); i++) console.log(`  ${String(i).padStart(4)} ${R[i][C.ms].toFixed(0).padStart(3)}  ${R[i][C.mode]}   ${R[i][C.scaleY].toFixed(4)}  ${R[i][C.cgorGy].toExponential(2).padStart(9)}  ${R[i][C.cgorN]}`); } }
if (A.csv) fs.writeFileSync(A.csv, J.cols.join(',') + '\n' + R.map(r => r.map(x => typeof x === 'number' ? +x.toFixed(4) : x).join(',')).join('\n'));
