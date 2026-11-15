// L'ANALYSE DU BANC DES VIBRATIONS (cadence.cjs) : pour chaque passe et chaque mode (sol / vol), la part HAUTE FRÉQUENCE de la caisse dans le repère de la caméra.
// Le résidu d'une image i, pour un signal p : e_i = p_i − [p_{i−1} + (p_{i+1} − p_{i−1}) · dt_i / (dt_i + dt_{i+1})] — l'écart à la droite tirée entre l'image
// d'avant et celle d'après, AU TEMPS PRÈS (un mouvement lisse échantillonné à des dt irréguliers donne ~0 : on ne compte pas l'irrégularité elle-même).
// « zigzag » = e_i et e_{i+1} de signes opposés, tous deux au-dessus du seuil : la dérivée seconde qui change de signe d'une image à l'autre.
//   node outils/banc-vibration/analyse.cjs <fichier.json> [--pires 5] [--signal cy] [--autour 10]
const fs = require('fs');
const f = process.argv[2], A = {}; for (let i = 3; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const D = JSON.parse(fs.readFileSync(f, 'utf8')), R = D.rows;
const SIG = { /* nom : [lecture, seuil, unité] */
  cx: [r => r.c[0], 1, 'px'], cy: [r => r.c[1], 1, 'px'], bx: [r => r.b[0], 1, 'px'], by: [r => r.b[1], 1, 'px'],
  ech: [r => (r.ech || 1) * 100, .5, '%'], /* l'échelle Y de la carrosserie (carBody.scale.y), en % */
  ty: [r => r.t ? r.t[1] : r.b[1], 1, 'px'], /* le toit de la carrosserie (point local 0, 1,2, 0) à l'écran */
  nez: [r => Math.hypot(r.n[0] - r.c[0], r.n[1] - r.c[1]), 1, 'px'], /* la longueur à l'écran du segment centre→nez : la TAILLE apparente */
  toit: [r => Math.atan2(r.h[0] - r.c[0], -(r.h[1] - r.c[1])) * 57.29578, .2, '°'], /* l'inclinaison à l'écran de l'axe centre→toit */
  cap: [r => r.r[0], .2, '°'], tang: [r => r.r[1], .2, '°'], roul: [r => r.r[2], .2, '°'],
  capB: [r => r.rb[0], .2, '°'], tangB: [r => r.rb[1], .2, '°'], roulB: [r => r.rb[2], .2, '°'],
  dist: [r => Math.hypot(r.cam[0], r.cam[1], r.cam[2]), .05, 'm'], fov: [r => r.fov, .2, '°'],
};
for (let i = 1; i < R.length; i++) if (R[i].p === R[i - 1].p) R[i].k = Math.round(Math.hypot(R[i].w[0] - R[i - 1].w[0], R[i].w[1] - R[i - 1].w[1], R[i].w[2] - R[i - 1].w[2]) / (Math.min(R[i].dt, 50) / 1000) * 3.6); /* km/h = le déplacement monde de l'image (le compteur du jeu affiche la même chose) */
const dAng = (a, b) => { let d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return d; };
function residus(rows, lis, ang) {
  const e = new Array(rows.length).fill(0);
  for (let i = 1; i < rows.length - 1; i++) {
    if (rows[i - 1].m !== rows[i].m || rows[i + 1].m !== rows[i].m) continue; /* pas à cheval sur un décollage ou une pose */
    const a = lis(rows[i - 1]), b = lis(rows[i]), c = lis(rows[i + 1]), d1 = rows[i].dt, d2 = rows[i + 1].dt;
    e[i] = ang ? dAng(b, a) - dAng(c, a) * d1 / (d1 + d2) : b - (a + (c - a) * d1 / (d1 + d2));
  }
  return e;
}
const passes = [...new Set(R.map(r => r.p.split('#')[0]))];
const table = {};
for (const pn of passes) for (const m of [0, 1]) {
  const blocs = [...new Set(R.filter(r => r.p.split('#')[0] === pn).map(r => r.p))];
  const acc = {}; let n = 0, kmh = 0;
  for (const bl of blocs) {
    const rows = R.filter(r => r.p === bl);
    for (const [nom, [lis, seuil]] of Object.entries(SIG)) {
      const e = residus(rows, lis, /cap|tang|roul|toit/.test(nom));
      const o = acc[nom] || (acc[nom] = { n: 0, s2: 0, abs: [], zz: 0 });
      for (let i = 1; i < rows.length - 1; i++) { if (rows[i].m !== m) continue; o.n++; o.s2 += e[i] * e[i]; o.abs.push(Math.abs(e[i]));
        if (i + 1 < rows.length - 1 && rows[i + 1].m === m && e[i] * e[i + 1] < 0 && Math.abs(e[i]) > seuil && Math.abs(e[i + 1]) > seuil) o.zz++; }
    }
    for (const r of rows) if (r.m === m) { n++; kmh += r.k; }
  }
  if (n < 20) continue;
  const lig = { n, kmh: Math.round(kmh / n) };
  for (const [nom, o] of Object.entries(acc)) { o.abs.sort((a, b) => a - b); lig[nom] = { eff: +Math.sqrt(o.s2 / Math.max(1, o.n)).toFixed(3), p95: +(o.abs[Math.floor(o.abs.length * .95)] || 0).toFixed(3), max: +(o.abs[o.abs.length - 1] || 0).toFixed(2), zz100: +(o.zz / Math.max(1, o.n) * 100).toFixed(2) }; }
  table[pn + (m ? ' VOL' : ' SOL')] = lig;
}
console.log(D.tag, '·', D.carte, D.fmt, 'moteur', D.moteur, 'nitro', D.nit, 'saut', D.saut, 'zig', D.zig, D.q || '', D.patch ? 'CORRECTIF D\'ESSAI ' + D.patch : '');
const noms = (A.signaux || 'cx,cy,ech,ty,nez,toit,cap,tang,roul,roulB,dist').split(',');
console.log('efficace / p95 / max du résidu ; zz = zigzags au-dessus du seuil pour 100 images');
console.log(['passe'.padEnd(13), 'n'.padStart(5), 'km/h'.padStart(5), ...noms.map(s => (s + ' ' + SIG[s][2]).padStart(24))].join(' '));
for (const [k, l] of Object.entries(table)) console.log([k.padEnd(13), String(l.n).padStart(5), String(l.kmh).padStart(5), ...noms.map(s => (`${l[s].eff}/${l[s].p95}/${l[s].max} zz${l[s].zz100}`).padStart(24))].join(' '));
/* les pires moments d'un signal : --pires n --signal cy [--passe tel] : les 2×autour images autour */
if (A.pires) {
  const nom = A.signal || 'cy', [lis, seuil, u] = SIG[nom], aut = +(A.autour || 10);
  const tous = [];
  for (const bl of [...new Set(R.map(r => r.p))]) { if (A.passe && bl.split('#')[0] !== A.passe) continue; const rows = R.filter(r => r.p === bl), e = residus(rows, lis, /cap|tang|roul|toit/.test(nom));
    for (let i = 1; i < rows.length - 2; i++) if (e[i] * e[i + 1] < 0) tous.push({ bl, i, a: Math.min(Math.abs(e[i]), Math.abs(e[i + 1])), rows, e }); }
  tous.sort((a, b) => b.a - a.a); const vus = [];
  for (const t of tous) { if (vus.some(v => v.bl === t.bl && Math.abs(v.i - t.i) < 2 * aut)) continue; vus.push(t); if (vus.length >= +A.pires) break; }
  for (const t of vus) { const r0 = t.rows[t.i];
    console.log(`\n== ${nom} : zigzag de ${t.a.toFixed(2)} ${u} · passe ${t.bl} image ${t.i} · ${r0.m ? 'VOL' : 'SOL'} · s=${r0.s} · ${r0.k} km/h · lat ${r0.lat} · volant ${r0.st}`);
    console.log('  i   dt    mode s        km/h  ' + nom.padEnd(8) + ' résidu   | cx      cy      cap    tang   roul   roulB  dist   corpsY roulis volant échelle% toitY');
    for (let j = Math.max(0, t.i - aut); j < Math.min(t.rows.length, t.i + aut + 1); j++) { const r = t.rows[j];
      console.log(`  ${String(j).padStart(3)} ${r.dt.toFixed(1).padStart(5)} ${r.m ? 'vol ' : 'sol '} ${String(r.s).padStart(8)} ${String(r.k).padStart(5)} ${lis(r).toFixed(2).padStart(8)} ${t.e[j].toFixed(2).padStart(7)}  | ${r.c[0].toFixed(1).padStart(6)} ${r.c[1].toFixed(1).padStart(6)} ${r.r[0].toFixed(2).padStart(6)} ${r.r[1].toFixed(2).padStart(6)} ${r.r[2].toFixed(2).padStart(6)} ${r.rb[2].toFixed(2).padStart(6)} ${Math.hypot(...r.cam).toFixed(2).padStart(6)} ${r.by.toFixed(3).padStart(6)} ${r.rl.toFixed(1).padStart(6)} ${r.st.toFixed(2).padStart(6)} ${((r.ech || 1) * 100).toFixed(1).padStart(7)} ${(r.t ? r.t[1] : 0).toFixed(1).padStart(7)}`); } }
}
