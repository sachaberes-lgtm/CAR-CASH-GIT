// LA PREUVE DE CALCUL de CAM_VOL_PAS (16/11) : les lignes du suivi de la caméra de vol (boucle-3-physique.js), recopiées, l'ancienne et la nouvelle,
// menées côte à côte sur la même trajectoire de caisse (vitesse, cible, raideur qui bougent au hasard semé).
//   node outils/banc-vibration/preuve-camvol.cjs
//   1. à 60 i/s réguliers : l'écart maximal entre les deux caméras (doit être au niveau de l'arrondi des flottants) ;
//   2. à 30 i/s, au motif téléphone et à 60/30 alternés : la place de la caméra par rapport à la caisse, son résidu d'une image à l'autre (zigzag), pour les deux.
function lisse60(k, dt) { return 1 - Math.pow(Math.max(0, 1 - k / 60), dt * 60); }
const SPD = .5, AIR = 1.6;
function course(dts, neuf, graine = 7) {
  let a = graine; const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  let p = 0, c = -9, airT = 0, t = 0; const out = [];
  for (const dt of dts) {
    t += dt; const v = 260 + 60 * Math.sin(t * .7), dtF = dt * AIR; /* la vitesse monde (≈ 900 km/h), lisse dans le temps : la caisse ne vibre pas */
    const k = (3 + 4.5 * (.5 + .5 * Math.sin(t * .3))) * (1 + .3 * Math.max(0, Math.sin(t * 1.1))), T = -9 - 2 * Math.sin(t * .5);
    p += v * SPD * dtF; airT += dt; const r = Math.min(1, airT / .6);
    let o;
    if (!neuf) { o = (c - p) + v * SPD * dtF * (1 - r); o += (T - o) * Math.min(1, dt * k); }
    else { const a9 = Math.min(1, k / 60); o = (c - p) + v * SPD * dtF; let T9 = T; if (a9 < 1) T9 -= v * SPD * (dtF / dt) * r * (1 - a9) / (a9 * 60); o += (T9 - o) * lisse60(k, dt); }
    c = p + o; out.push({ t, o });
    void rnd;
  }
  return out;
}
function motif(nom, n) { let a = 99; const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  return Array.from({ length: n }, (_, i) => nom === 'r60' ? 1 / 60 : nom === 'r30' ? 1 / 30 : nom === 'alt' ? (i % 2 ? 1 / 30 : 1 / 60) : (r => r < .8 ? 1 / 30 : r < .95 ? .05 : .05)(rnd())); }
function residu(o) { let mx = 0, zz = 0; for (let i = 1; i < o.length - 1; i++) { const a = (o[i].t - o[i - 1].t) / (o[i + 1].t - o[i - 1].t), r = o[i].o - (o[i - 1].o + (o[i + 1].o - o[i - 1].o) * a); if (i > 60) { mx = Math.max(mx, Math.abs(r)); if (Math.abs(r) > .05) zz++; } } return [mx, zz]; }
const A = course(motif('r60', 1200), false), B = course(motif('r60', 1200), true);
let d = 0; for (let i = 0; i < A.length; i++) d = Math.max(d, Math.abs(A[i].o - B[i].o));
console.log(`60 i/s réguliers, 1200 images : écart maximal ancienne / nouvelle caméra = ${d.toExponential(2)} m`);
for (const m of ['r30', 'tph', 'alt']) {
  const a = course(motif(m, 600), false), b = course(motif(m, 600), true), [ma, za] = residu(a), [mb, zb] = residu(b);
  const ref = course(motif('r60', 1200), true); /* l'écart de régime à 60 i/s, au même instant */
  const lagA = a[a.length - 1].o, lagB = b[b.length - 1].o, t9 = b[b.length - 1].t, r60 = ref.reduce((x, y) => Math.abs(y.t - t9) < Math.abs(x.t - t9) ? y : x).o;
  console.log(`${m.padEnd(4)} : résidu d'une image à l'autre (écart caisse→caméra, m) ancien max ${ma.toFixed(3)} (${za} images > 5 cm) · nouveau max ${mb.toFixed(3)} (${zb} images) | écart en fin : ancien ${lagA.toFixed(2)} · nouveau ${lagB.toFixed(2)} · 60 i/s ${r60.toFixed(2)}`);
}
