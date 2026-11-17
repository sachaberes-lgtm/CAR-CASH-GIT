// LE BANC DE L'HORLOGE DU CALAGE (2026-11-17, qualité · lot lenteur) — sans navigateur, déterministe.
// La VRAIE fonction cadSaute est lue dans code/moteur/cadence.js et rejouée sur des suites d'horodatages d'écran simulées (graine fixe),
// avant (?sans=cadhorloge) et après. On compte les images CALCULÉES par seconde, l'écart-type de leurs intervalles, les intervalles courts (< 25 ms : un rattrapage)
// et la plus longue image. Usage : node outils/banc-lenteur/horloge.cjs [--json]
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../../code/moteur/cadence.js'), 'utf8');
const i0 = src.indexOf('function cadSaute(now){'), i1 = src.indexOf('\n/* ===== L\'HORLOGE DU CALAGE');
if (i0 < 0 || i1 < 0) throw new Error('cadSaute introuvable');
const corps = src.slice(i0, i1);
function fabrique(horloge, per) {
  const f = new Function('CAD_HORLOGE', 'PER', `
    const MOB_GOUV=false,MOB_ECRAN=true,MOB_EA=new Float32Array(90),CAD_E30=true,CAD_ECO_F=false,GVL={ok:false,on:false};let MOB_EN=0;
    const window={};function mobGouvTick(){} function mobChaud(){return false;}
    const CAD={on:true,gel:false,per:1000/30,ecran:1000/60,tol:1000/120,der:0,clk:0,derP:0,em:0,rp:0,eMin:99,eN:0};
    function cadPer(){return PER||CAD.per;}
    ${corps}
    return {CAD,cadSaute,MOB_EN:()=>MOB_EN};`);
  return f(horloge, per);
}
function alea(g) { let a = g >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/* les écrans : une fonction (r, i) → intervalle (ms) jusqu'au rAF suivant ; arrondi à 1 ms comme Safari si `ms1` */
const ECRANS = {
  '60 Hz régulier': { d: () => 1000 / 60, ms1: true },
  '60 Hz, une image d\'écran perdue sur 20': { d: (r, i) => i % 20 === 7 ? 2000 / 60 : 1000 / 60, ms1: true },
  '120 Hz régulier': { d: () => 1000 / 120, ms1: true },
  '30 Hz régulier (économie)': { d: () => 1000 / 30, ms1: true },
  '30 Hz irrégulier 22-33 ms, ~32/s (build 52)': { d: r => r() < .75 ? 1000 / 30 : 22 + 8 * r(), ms1: true },
  '36 Hz irrégulier 22-33 ms (hypothèse dure)': { d: r => 22 + 11 * r(), ms1: true },
  '30 Hz tremblé 25-41 ms (moyenne 33,3)': { d: r => 25 + 16.67 * r(), ms1: true },
  '60 Hz irrégulier 10-24 ms (économie, build 120)': { d: r => 10 + 14 * r(), ms1: true },
  '60 Hz + images en retard 26-30 ms (la fuite)': { d: (r, i) => (i % 2 ? 26 + 4 * r() : 1000 / 60), ms1: true },
};
function joue(nom, horloge, per, secondes = 60) {
  const E = ECRANS[nom], r = alea(77), M = fabrique(horloge, per); let t = 1000, i = 0;
  const calc = []; const fin = t + secondes * 1000;
  // les 90 premières images d'écran règlent la période d'écran et la tolérance (comme en jeu) : on les joue d'abord, calage éteint
  M.CAD.on = false;
  while (t < fin) { const ts = E.ms1 ? Math.round(t) : t; if (i === 200) { M.CAD.on = true; M.CAD.der = ts; M.CAD.clk = ts; } const saute = M.cadSaute(ts); if (i > 200 && !saute) calc.push(ts); t += E.d(r, i); i++; }
  const iv = []; for (let k = 1; k < calc.length; k++) iv.push(calc[k] - calc[k - 1]);
  const moy = iv.reduce((a, b) => a + b, 0) / iv.length, et = Math.sqrt(iv.reduce((a, b) => a + (b - moy) ** 2, 0) / iv.length);
  const dur = (calc[calc.length - 1] - calc[0]) / 1000;
  // images calculées par seconde, seconde par seconde : le pire
  const parS = {}; for (const c of calc) { const s = Math.floor(c / 1000); parS[s] = (parS[s] || 0) + 1; } const ks = Object.keys(parS).map(Number).sort((a, b) => a - b).slice(1, -1); const pireS = Math.max(...ks.map(k => parS[k]));
  return { ips: +(calc.length / dur).toFixed(2), pireSeconde: pireS, ecartType: +et.toFixed(2), moy: +moy.toFixed(2), courts: iv.filter(x => x < 25).length, pct_courts: +(100 * iv.filter(x => x < 25).length / iv.length).toFixed(1), max: Math.max(...iv), trousParMin: +(iv.filter(x => x > (per || 1000 / 30) * 1.75).length / dur * 60).toFixed(1), tol: +M.CAD.tol.toFixed(1), ecran: +M.CAD.ecran.toFixed(1) };
}
const R = {};
for (const per of [0, 50]) for (const nom of Object.keys(ECRANS)) {
  const k = (per ? '20 i/s · ' : '30 i/s · ') + nom; R[k] = { avant: joue(nom, false, per), apres: joue(nom, true, per) };
}
if (process.argv.includes('--json')) console.log(JSON.stringify(R, null, 1));
else for (const k in R) { const a = R[k].avant, b = R[k].apres;
  console.log(k.padEnd(62), '| i/s', String(a.ips).padStart(6), '→', String(b.ips).padStart(6), '| pire s', String(a.pireSeconde).padStart(3), '→', String(b.pireSeconde).padStart(3), '| σ', String(a.ecartType).padStart(5), '→', String(b.ecartType).padStart(5), '| <25 ms', (a.pct_courts + '%').padStart(6), '→', (b.pct_courts + '%').padStart(6), '| max', a.max, '→', b.max, '| trous/min', a.trousParMin, '→', b.trousParMin); }
