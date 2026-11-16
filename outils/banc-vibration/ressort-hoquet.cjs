// LE HOQUET DE LA CARROSSERIE, REJOUÉ À LA MAIN (Node seul, aucune dépendance) : l'intégrateur recopié tel quel de code/gameplay/pouvoirs-grisants.js:365-367
//   const d=Math.min(dt,1/30);CGOR.gv+=(-CGOR.gy*1600-CGOR.gv*34)*d;CGOR.gy+=CGOR.gv*d;   y=clamp(gy,-.04,.07) ; carBody.scale.set(1+y*.7,1+y,1+y*.4)
// lancé par UNE pièce (cgorBat : gv += 1,2 au moins, 2,6 au plus). On compte les images où l'échelle de la carrosserie bouge encore et dans quel sens.
// Critère d'instabilité de ce schéma (Euler semi-implicite) : K·d² + 2·C·d > 4, soit ici d > 33,08 ms. Le jeu borne d à 33,33 ms : à 30 i/s on est AU-DESSUS.
//   node outils/banc-vibration/ressort-hoquet.cjs
const K = 1600, C = 34;
function alea(g) { let a = g >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function suite(nom, n) { const r = alea(1000), o = []; for (let i = 0; i < n; i++) { const u = r(); o.push(nom === 'tel' ? (u < .82 ? 28 + 6.5 * (.5 + (r() + r() + r() - 1.5) / 3 * 1.2) + 2.2 : u < .96 ? 35 + 11 * r() : u < .98 ? 22 + 4 * r() : 51 + 49 * r() * r()) : nom === 'alt' ? (i % 2 ? 1000 / 30 : 1000 / 60) : +nom); } return o; }
function vp(d) { const tr = (1 - K * d * d) + (1 - C * d), det = 1 - C * d, D = tr * tr - 4 * det; return D >= 0 ? [(tr + Math.sqrt(D)) / 2, (tr - Math.sqrt(D)) / 2] : [Math.sqrt(det), Math.sqrt(det)]; }
console.log('critère K·d²+2·C·d > 4 : pas critique', (((-2 * C + Math.sqrt(4 * C * C + 16 * K)) / (2 * K)) * 1000).toFixed(2), 'ms (le jeu borne le pas à 33,33 ms)');
for (const ms of [16.667, 25, 30, 32, 33, 33.333, 41.667, 50]) { const d = Math.min(ms / 1000, 1 / 30), l = vp(d), m = Math.max(Math.abs(l[0]), Math.abs(l[1])); console.log(`dt ${ms.toFixed(2).padStart(6)} ms : |valeur propre| ${m.toFixed(4)} ${l[1] < 0 && Math.abs(l[1]) === m ? '(négative : le signe s\'inverse à chaque image)' : ''} → ${m > 1 ? 'INSTABLE, ×' + m.toFixed(3) + ' par image' : 'amorti'}`); }
console.log('\nune pièce (gv += 1,2) puis rien ; échelle Y de la carrosserie = 1 + clamp(gy, −0,04, 0,07)');
for (const nom of ['16.667', '33.333', '41.667', 'alt', 'tel']) {
  const dts = suite(nom, 9000); let gy = 0, gv = 1.2, zz = 0, dern = -1, yp = 0, ypp = 0, amp300 = 0, amp3000 = 0, amp9000 = 0, arret = -1;
  for (let i = 0; i < dts.length; i++) { const d = Math.min(Math.min(dts[i] / 1000, .05), 1 / 30); gv += (-gy * K - gv * C) * d; gy += gv * d;
    if (Math.abs(gy) < 4e-4 && Math.abs(gv) < .02) { gy = gv = 0; if (arret < 0) arret = i; }
    const y = Math.max(-.04, Math.min(.07, gy));
    if (i >= 2 && (y - yp) * (yp - ypp) < 0 && Math.abs(y - yp) > .005) { zz++; dern = i; } /* l'échelle change de sens d'une image à l'autre, de plus de 0,5 % */
    if (i >= 290 && i < 300) amp300 = Math.max(amp300, Math.abs(y - yp)); if (i >= 2990 && i < 3000) amp3000 = Math.max(amp3000, Math.abs(y - yp)); if (i >= 8990) amp9000 = Math.max(amp9000, Math.abs(y - yp));
    ypp = yp; yp = y; }
  console.log(`dt ${nom.padEnd(7)} : arrêt du ressort à l'image ${arret < 0 ? 'JAMAIS (9000 images)' : arret} · images en zigzag > 0,5 % : ${zz} (dernière ${dern}) · saut d'échelle d'une image à l'autre vers l'image 300 : ${(amp300 * 100).toFixed(1)} %, 3000 : ${(amp3000 * 100).toFixed(1)} %, 9000 : ${(amp9000 * 100).toFixed(1)} % · |gy| final ${Math.abs(gy).toExponential(2)}`);
}
/* UNE LIGNE DE PIÈCES : une prise toutes les 150 ms pendant 3 s, puis 3 s sans rien, 10 fois (60 s). dt = 33,33 ms ± un écart au hasard (gaussien, σ) — on ne connaît pas
   l'écart exact du téléphone image par image (la boîte de vol range 82 % des images entre 26 et 34,5 ms, 14 % entre 34,5 et 51). Part des images où l'échelle saute de plus de 2 % en changeant de sens. */
console.log('\nune ligne de pièces (une prise / 150 ms pendant 3 s, puis 3 s de repos) × 10 ; image à 33,33 ms ± σ ; + 14 % d\'images longues (35-46 ms) comme sur le 13 Pro');
for (const [sig, longues] of [[0, 0], [.3, 0], [1, 0], [2, 0], [1, .14], [2, .14], [3, .14]]) {
  const r = alea(7); let gy = 0, gv = 0, t = 0, tb = 1, acc = 0, prochaine = 0, zz = 0, n = 0, yp = 0, ypp = 0, zzRepos = 0, nRepos = 0, pire = 0;
  while (t < 60) { const g = Math.sqrt(-2 * Math.log(Math.max(1e-9, r()))) * Math.cos(6.2832 * r()); let dt = (r() < longues ? 35 + 11 * r() : 100 / 3 + sig * g) / 1000; dt = Math.min(.05, Math.max(.02, dt)); t += dt;
    const ph = t % 6; if (ph < 3 && t >= prochaine) { acc++; prochaine = t + .15; }
    tb += dt; if (acc > 0 && tb >= .075) { gv = Math.min(2.6, gv + Math.min(2.2, 1.2 + .3 * acc)); acc = 0; tb = 0; } /* cgorTick + cgorBat, série = 0 */
    if (gy !== 0 || gv !== 0) { const d = Math.min(dt, 1 / 30); gv += (-gy * K - gv * C) * d; gy += gv * d; if (Math.abs(gy) < 4e-4 && Math.abs(gv) < .02) gy = gv = 0; }
    const y = Math.max(-.04, Math.min(.07, gy)), z = (y - yp) * (yp - ypp) < 0 && Math.abs(y - yp) > .02 && Math.abs(yp - ypp) > .02;
    n++; if (z) { zz++; pire = Math.max(pire, Math.abs(y - yp)); } if (ph >= 3.5) { nRepos++; if (z) zzRepos++; }
    ypp = yp; yp = y; }
  console.log(`σ ${String(sig).padEnd(3)} ms, ${Math.round(longues * 100)} % longues : ${(zz / n * 100).toFixed(0)} % des images en zigzag > 2 % d'échelle (pire saut ${(pire * 100).toFixed(1)} %) · pendant les repos (0,5 s après la dernière pièce) : ${(zzRepos / Math.max(1, nRepos) * 100).toFixed(0)} %`);
}
