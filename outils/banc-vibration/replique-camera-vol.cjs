// LA RÉPLIQUE DE LA CAMÉRA DE VOL (2026-11-15) — Node seul, sans navigateur. Recopie le suivi de boucle-3-physique.js (lignes 468-484 : l'écart caisse→caméra
// moins l'avance de la caisse, lerp(min(1,dt·k)), puis LE BRAS) pour un vol droit à vitesse constante, et compare à un suivi intégré exactement (indépendant de dt).
// Sortie : l'angle de la caméra autour de la caisse (°) et la distance (m), le zigzag d'une image à l'autre, par suite de dt.
//   node outils/banc-vibration/replique-camera-vol.cjs [kmh=740] [bras=20] [k=7.5]
const KMH = +(process.argv[2] || 740), BRAS = +(process.argv[3] || 20), K = +(process.argv[4] || 7.5), V = KMH / 3.6, AIR = 1.2, T = [-6.4, 5.9];
function suite(nom, n) { const o = []; let g = 12345; const rnd = () => (g = (g * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < n; i++) o.push(nom === 'r60' ? 1 / 60 : nom === 'r30' ? 1 / 30 : nom === 'alt' ? (i % 2 ? 1 / 30 : 1 / 60) : (() => { const r = rnd(); return r < .10 ? .05 : r < .22 ? .05 : r < .30 ? .022 : 1 / 30; })()); return o; }
function joue(L, exact) { let o = [-BRAS * .95, 3]; const out = [];
  for (const dt of L) { const dtF = dt * AIR;
    if (!exact) { o = [o[0] - V * dtF, o[1]]; const a = Math.min(1, dt * K); o = [o[0] + (T[0] - o[0]) * a, o[1] + (T[1] - o[1]) * a]; }           /* le jeu : Euler, la traîne dépend de dt */
    else { const E = Math.exp(-K * dt), Ti = [T[0] - V * AIR * (1 / K - 1 / 60), T[1]]; o = [Ti[0] + (o[0] - Ti[0]) * E, Ti[1] + (o[1] - Ti[1]) * E]; }   /* intégré : même régime établi qu'à 60 i/s, quel que soit dt */
    const d = Math.hypot(o[0], o[1]); if (d > BRAS) o = [o[0] * BRAS / d, o[1] * BRAS / d];                                                       /* LE BRAS */
    out.push([Math.atan2(o[1], -o[0]) * 57.29578, Math.hypot(o[0], o[1])]); }
  return out; }
function zig(x, L) { const t = [0]; for (let i = 1; i < L.length; i++) t[i] = t[i - 1] + L[i]; let m = 0, n = 0;
  for (let i = 200; i < x.length - 1; i++) { const a = (t[i] - t[i - 1]) / (t[i + 1] - t[i - 1]), r = x[i] - (x[i - 1] + (x[i + 1] - x[i - 1]) * a); m = Math.max(m, Math.abs(r)); if (Math.abs(r) > .1) n++; } return [m, n]; }
console.log(`vol droit à ${KMH} km/h, bras ${BRAS} m, raideur ${K}/s — résidu d'une image (angle de la caméra autour de la caisse, °) : pire, et nombre d'images > 0,1° sur 400`);
for (const nom of ['r60', 'r30', 'alt', 'tel']) { const L = suite(nom, 600), a = joue(L, false), b = joue(L, true);
  const za = zig(a.map(x => x[0]), L), zb = zig(b.map(x => x[0]), L), da = zig(a.map(x => x[1]), L), db = zig(b.map(x => x[1]), L);
  console.log(nom.padEnd(4), '| le jeu : angle', a[599][0].toFixed(2) + '°', 'zigzag', za[0].toFixed(2) + '°', '(' + za[1] + ' images) distance ±' + da[0].toFixed(2), 'm | intégré : angle', b[599][0].toFixed(2) + '°', 'zigzag', zb[0].toFixed(3) + '°', '(' + zb[1] + ' images) distance ±' + db[0].toFixed(3), 'm'); }
