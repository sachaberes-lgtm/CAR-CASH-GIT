// LE TABLEAU AVANT / APRÈS des relevés de vib.cjs (16/11, lot « vibration », les restes) : par motif (segment du programme),
//   - hoquet : images où la hauteur de la carrosserie (carBody.scale.y) change de plus de 0,4 % d'une image à l'autre (et la plage) ;
//   - tics de lacet : images AU SOL où l'écart haute fréquence du lacet caisse/caméra dépasse 0,5° (même résidu qu'analyse-sol.cjs) ;
//   - |CGOR.gy| à la fin du motif.
//   node outils/banc-vibration/ab.cjs <relevé.json> [<relevé.json> …]
const fs = require('fs');
for (const f of process.argv.slice(2)) {
  const J = JSON.parse(fs.readFileSync(f, 'utf8')), C = {}; J.cols.forEach((c, i) => C[c] = i);
  for (const sg of (J.segs || [{ nom: J.motif, i0: 0, n: J.R.length }])) {
    const R = J.R.slice(sg.i0, sg.i0 + sg.n), N = R.length; if (N < 10) continue;
    const ms = R.map(r => Math.min(r[C.ms], 50)), lac = R.map(r => r[C.lacet]);
    let hq = 0, mn = 9, mx = 0, nSol = 0, nVol = 0, tics = 0, tmx = 0, sq = 0, nb = 0;
    for (let i = 1; i < N; i++) { const a = R[i][C.scaleY], d = a - R[i - 1][C.scaleY]; mn = Math.min(mn, a); mx = Math.max(mx, a); if (Math.abs(d) > .004) hq++; }
    for (let i = 0; i < N; i++) R[i][C.mode] === 0 ? nSol++ : R[i][C.mode] === 1 ? nVol++ : 0;
    for (let i = 3; i < N - 3; i++) {
      if (![-2, -1, 0, 1, 2].every(k => R[i + k][C.mode] === 0 && R[i + k][C.calc] === 1)) continue;
      const a = ms[i], b = ms[i + 1]; let d0 = lac[i] - lac[i - 1], d1 = lac[i + 1] - lac[i];
      if (Math.abs(d0) > 180) d0 -= 360 * Math.sign(d0); if (Math.abs(d1) > 180) d1 -= 360 * Math.sign(d1);
      const z = Math.abs((d0 * b - d1 * a) / (a + b)); nb++; sq += z * z; if (z > .5) tics++; tmx = Math.max(tmx, z);
    }
    console.log(`${f.split('/').pop().padEnd(22)} ${sg.nom.padEnd(5)} ${String(N).padStart(4)} img (sol ${nSol}, vol ${nVol}) | hoquet >0,4 % : ${String(hq).padStart(4)} (${mn.toFixed(3)}-${mx.toFixed(3)}) | tics lacet >0,5° : ${String(tics).padStart(3)} / ${nb}, eff ${Math.sqrt(sq / Math.max(1, nb)).toFixed(3)}°, max ${tmx.toFixed(2)}° | |gy| fin ${Math.abs(R[N - 1][C.cgorGy]).toExponential(1)} | pièces ${R[N - 1][C.cgorN]}`);
  }
}
