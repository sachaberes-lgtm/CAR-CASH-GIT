// LE HOQUET DE LA CARROSSERIE À 30 IMAGES PAR SECONDE (node seul) — banc des vibrations du 2026-11-15.
// Rejoue la ligne exacte de cgorTick (code/gameplay/pouvoirs-grisants.js) : le ressort du « hoquet » que chaque pièce ramassée lance sur carBody.scale.
//   d=min(dt,1/30); gv+=(-gy*1600-gv*34)*d; gy+=gv*d;  y=clamp(gy,-.04,.07);  carBody.scale=(1+.7y, 1+y, 1+.4y)
// Schéma d'Euler semi-implicite : stable seulement si 1600·d² + 68·d < 4, soit d < 33,08 ms. Or le téléphone tourne calé à 30 i/s : d = 33,33 ms (les images longues sont bornées à 33,33).
// À 60 i/s (l'ordinateur, là où il a été réglé) il s'éteint en 0,15 s. À 30 i/s il ne s'éteint JAMAIS : il grandit de 3,9 % par image, signe alterné à chaque image.
//   node outils/banc-vibration/modele-hoquet.cjs
const src = require('fs').readFileSync(require('path').join(__dirname, '..', '..', 'code', 'gameplay', 'pouvoirs-grisants.js'), 'utf8');
const ligne = /const d=Math\.min\(dt,1\/30\);CGOR\.gv\+=\(-CGOR\.gy\*1600-CGOR\.gv\*34\)\*d;CGOR\.gy\+=CGOR\.gv\*d;/.test(src);
console.log('la ligne du jeu est bien celle du modèle :', ligne ? 'oui' : 'NON (le code a changé : relire cgorTick)');
function vp(d) { const k = 1600, c = 34, tr = 2 - c * d - k * d * d, det = 1 - c * d, D = tr * tr - 4 * det; return D >= 0 ? Math.max(Math.abs((tr + Math.sqrt(D)) / 2), Math.abs((tr - Math.sqrt(D)) / 2)) * ((tr - Math.sqrt(D)) / 2 < -Math.abs((tr + Math.sqrt(D)) / 2) ? -1 : 1) : Math.sqrt(det); }
console.log('\nfacteur par image (|…| > 1 = le hoquet grandit ; négatif = le signe alterne à chaque image) :');
for (const ms of [8.33, 16.67, 25, 30, 32, 33, 33.08, 33.33, 34, 50]) { const d = Math.min(ms / 1000, 1 / 30); console.log(`  dt ${String(ms).padStart(5)} ms → d ${(d * 1000).toFixed(2)} ms : ${vp(d).toFixed(4)}`); }
function joue(nom, dts, nImg, piece) { let gy = 0, gv = 0, n = 0, alt = 0, yPrev = 0, fin = -1; const lig = [];
  for (let i = 0; i < nImg; i++) { const dt = dts(i) / 1000; if (piece(i)) gv = Math.min(2.6, gv + 1.2); /* cgorBat : une pièce */
    if (gy !== 0 || gv !== 0) { const d = Math.min(dt, 1 / 30); gv += (-gy * 1600 - gv * 34) * d; gy += gv * d; if (Math.abs(gy) < 4e-4 && Math.abs(gv) < .02) { gy = gv = 0; if (fin < 0) fin = i; } }
    const y = Math.max(-.04, Math.min(.07, gy)); if (Math.abs(y - yPrev) > .004) { n++; if (i > 0) alt++; } yPrev = y; if (i < 14 || (i % 30 === 0 && i <= 300)) lig.push(`${i}:${(100 * y).toFixed(1)}`); }
  console.log(`\n${nom}\n  hauteur de la carrosserie (%, image:valeur) : ${lig.join('  ')}\n  images où elle change de plus de 0,4 % : ${n} sur ${nImg} · ${fin >= 0 ? 'éteint à l\'image ' + fin : 'JAMAIS éteint'} · gy final ${gy.toExponential(2)}`); }
let a = 99; const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
joue('UNE pièce, 60 i/s réguliers (16,67 ms)', () => 1000 / 60, 600, i => i === 0);
joue('UNE pièce, 30 i/s réguliers (33,33 ms) — le téléphone calé', () => 1000 / 30, 600, i => i === 0);
joue('UNE pièce, téléphone : 80 % 33,33 · 15 % 50 · 5 % 66 ms', () => { const r = rnd(); return r < .8 ? 33.333 : r < .95 ? 50 : 66.7; }, 600, i => i === 0);
joue('UNE pièce, horloge de WebKit arrondie à la milliseconde : 33, 33, 34 ms en boucle', i => i % 3 === 2 ? 34 : 33, 600, i => i === 0);
joue('UNE pièce, 33 ms pile (sous le seuil de 33,08)', () => 33, 600, i => i === 0);
joue('UNE pièce, 30 i/s pendant 3 s puis 60 i/s (le 60 revient)', i => i < 90 ? 1000 / 30 : 1000 / 60, 300, i => i === 0);
