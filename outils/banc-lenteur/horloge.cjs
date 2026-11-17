// LE BANC DE L'HORLOGE DU CALAGE (2026-11-17, qualité · lot lenteur, 2e tour) — sans navigateur, déterministe (graines fixes).
// Les VRAIES fonctions cadSaute et cadSauteH sont lues dans code/moteur/cadence.js et rejouées sur des suites d'horodatages d'écran :
//  · écrans simulés (vsync de période V, gigue, images en retard, travail de l'image : l'image d'écran suivante est la 1re vsync après la fin du travail) ;
//  · LES VRAIES SECONDES DE FUITE du vol ~/cash-car/ios-ultime-mesures/vol/vol-1117-1448.json (calé, ≥ 34 images calculées : pour chaque seconde, le nombre d'images
//    d'écran R[0] et le plus court intervalle R[1], reconstruits en intervalles irréguliers de somme 1 s).
// Avant = cadSaute seul (défaut) ; après = cadSauteH sous ?plus=cadhorloge. Pour chaque cas : images calculées par seconde, σ et max des intervalles calculés,
// intervalles > 50 ms par minute, temps de jeu perdu (le jeu plafonne dt à 50 ms, boucle-1.js : la part au-delà est perdue), et l'EXIGENCE :
//  jamais plus d'intervalles > 50 ms qu'avant ; jamais moins de 30 (ou 20) i/s là où avant les tenait ; ≤ 31 i/s à 60/120 Hz propres.
// Usage : [GRAINE=n] node outils/banc-lenteur/horloge.cjs [--json]   (sortie 1 si l'exigence casse)
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../../code/moteur/cadence.js'), 'utf8');
function tranche(debut, fin) { const i0 = src.indexOf(debut), i1 = src.indexOf(fin, i0); if (i0 < 0 || i1 < 0) throw new Error('introuvable : ' + debut); return src.slice(i0, i1); }
const CORPS = tranche('function cadSaute(now){', '\n/* ===== LA CADENCE DE SURCHAUFFE') + '\n' + tranche('const CAD_HORLOGE=', '\nwindow.dbgHorloge');
function fabrique(horloge, PER) {
  const f = new Function('location', 'PER', `
    const MOB_GOUV=false,MOB_ECRAN=true,MOB_EA=new Float32Array(90),CAD_E30=true,CAD_ECO_F=false,PIL_ON=false;let MOB_EN=0;
    const window={};function mobGouvTick(){} function mobChaud(){return false;} function pilRaf(){} function pilImg(){}
    const CAD={on:false,gel:false,per:1000/30,ecran:1000/60,tol:1000/120,der:0,rp:0,eMin:99,eN:0};
    function cadPer(){return PER.v||CAD.per;}
    ${CORPS}
    return {CAD,CADH,cadSaute,cadSauteH};`);
  return f({ search: horloge ? '?plus=cadhorloge' : '' }, PER);
}
function alea(g) { let a = g >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/* LES VRAIES SECONDES DE FUITE DU VOL */
const VOL = path.join(process.env.HOME, 'cash-car/ios-ultime-mesures/vol/vol-1117-1448.json');
function secondesVol() {
  if (!fs.existsSync(VOL)) return null; const V = JSON.parse(fs.readFileSync(VOL, 'utf8')), out = [];
  for (const c of V) { const S = c.S || [], R = c.R || []; for (let k = 0; k * 8 + 7 < S.length && 3 * k + 2 < R.length; k++) if ((S[k * 8 + 7] & 1) && S[k * 8 + 1] >= 34) out.push([R[3 * k], R[3 * k + 1] / 10]); }
  return out;
}
const FUITE = secondesVol();
function suiteVol(r) { /* n intervalles irréguliers par seconde, le plus court = R[1], somme 1000 ms */
  const L = []; for (const [n, mn] of FUITE) { const moy = 1000 / n, haut = Math.max(mn + 1, 2 * moy - mn); let v = []; for (let i = 0; i < n; i++) v.push(mn + (haut - mn) * r()); v[0] = mn; const s = v.reduce((a, b) => a + b, 0), k = (1000 - n * mn) / (s - n * mn); v = v.map(x => mn + (x - mn) * k); L.push(...v); }
  return L;
}
/* simulation : vsync V, horodatage = vsync + gigue (+ retard) arrondi à 1 ms (Safari) ; travail w de l'image calculée (0,3 ms pour une sautée) ;
   l'image d'écran suivante = la 1re vsync après la fin du travail. Ou une suite d'intervalles imposée (suite). */
function joue(o, horloge) {
  const G0 = +process.env.GRAINE || 77, r = alea(o.g || G0), PER = { v: o.per || 0 }, M = fabrique(horloge, PER); const calc = []; const fin = (o.sec || 60) * 1000 + 3000;
  let v = 0, ni = 0; const suite = o.suite ? o.suite(alea(o.g || G0)) : null; let si = 0, ts0 = 0;
  while (true) {
    let ts; if (suite) { if (si >= suite.length) break; ts0 += suite[si++]; ts = Math.round(ts0); } else { if (v >= fin) break; ts = v + (o.J ? o.J * r() : 0); if (o.late && r() < o.late.p) ts += o.late.ms; ts = Math.round(ts); }
    if (ni === 200) { M.CAD.on = true; M.CAD.der = ts; }
    const s = M.cadSauteH(ts); ni++;
    if (!s && ni > 200) calc.push(ts);
    if (!suite) { const w = s ? .3 : (o.w ? o.w(r) : 5); v = Math.ceil((ts + w + .01) / o.V) * o.V; if (v <= ts) v += o.V; }
  }
  const iv = []; for (let k = 1; k < calc.length; k++) iv.push(calc[k] - calc[k - 1]);
  const n = iv.length, dur = (calc[calc.length - 1] - calc[0]) / 1000, m = iv.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(iv.reduce((a, b) => a + (b - m) ** 2, 0) / n);
  return { ips: +(n / dur).toFixed(2), sd: +sd.toFixed(1), max: Math.max(...iv), gt50: +(iv.filter(x => x > 50).length / dur * 60).toFixed(1), perte: +(iv.reduce((a, b) => a + Math.max(0, b - 50), 0) / dur * 60).toFixed(0), sauts: M.CADH.sauts, refus: M.CADH.refus };
}
const CAS = {
  '60 Hz propre': { V: 1000 / 60, J: 1, propre: 1 },
  '60 Hz, la moitié des images en retard de 12 ms': { V: 1000 / 60, J: 1, late: { p: .5, ms: 12 } },
  '60 Hz, 30 % des images en retard de 9 ms': { V: 1000 / 60, J: 1, late: { p: .3, ms: 9 } },
  '60 Hz, gigue 10 ms': { V: 1000 / 60, J: 10 },
  '60 Hz, gigue 5 ms': { V: 1000 / 60, J: 5 },
  '60 Hz, une vsync manquée sur 20': { V: 1000 / 60, J: 1, w: r => r() < .05 ? 20 : 5 },
  '90 Hz, gigue 3 ms': { V: 1000 / 90, J: 3 },
  '120 Hz propre': { V: 1000 / 120, J: 1, propre: 1 },
  '120 Hz, 30 % en retard de 6 ms': { V: 1000 / 120, J: 1, late: { p: .3, ms: 6 } },
  '30 Hz (économie)': { V: 1000 / 30, J: 3 },
  '34-44 Hz irréguliers (synthétique)': { suite: r => { const L = []; for (let i = 0; i < 2600; i++) L.push(1000 / (34 + 10 * r()) * (.6 + .8 * r())); return L; } },
  '60 Hz, travail 22-30 ms': { V: 1000 / 60, J: 1, w: r => 22 + 8 * r() },
  '60 Hz, travail 12-20 ms': { V: 1000 / 60, J: 1, w: r => 12 + 8 * r() },
};
if (FUITE) CAS['LE VOL : ' + FUITE.length + ' secondes de fuite rejouées'] = { suite: suiteVol };
const R = {}; let casse = [];
for (const per of [0, 50]) for (const nom in CAS) {
  const o = Object.assign({}, CAS[nom], { per }), k = (per ? '20 i/s · ' : '30 i/s · ') + nom, cible = per ? 20 : 30;
  const a = joue(o, false), b = joue(o, true); R[k] = { avant: a, apres: b };
  if (b.gt50 > a.gt50) casse.push(k + ' : plus de trous > 50 ms');
  if (b.perte > a.perte) casse.push(k + ' : plus de temps perdu');
  if (a.ips >= cible - .05 && b.ips < cible - .05) casse.push(k + ' : passe sous ' + cible + ' i/s');
  if (o.propre && !per && b.ips > 31) casse.push(k + ' : plus de 31 i/s');
}
if (process.argv.includes('--json')) console.log(JSON.stringify({ R, casse }, null, 1));
else {
  for (const k in R) { const a = R[k].avant, b = R[k].apres; const f = (x, y) => (x === y ? String(x) : x + ' → ' + y);
    console.log(k.padEnd(66), '| i/s', f(a.ips, b.ips).padEnd(15), '| σ', f(a.sd, b.sd).padEnd(12), '| max', f(a.max, b.max).padEnd(9), '| >50/min', f(a.gt50, b.gt50).padEnd(12), '| perdu ms/min', f(a.perte, b.perte).padEnd(10), '| sauts', b.sauts, 'refus', b.refus); }
  console.log(casse.length ? 'EXIGENCE CASSÉE :\n  ' + casse.join('\n  ') : 'EXIGENCE TENUE dans tous les cas.');
}
process.exit(casse.length ? 1 : 0);
