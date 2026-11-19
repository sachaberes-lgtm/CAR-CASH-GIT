// LE BANC DE L'ÉCHELLE, EN NODE (2026-11-18, lot « voituredabord »). Aucune fenêtre, aucun Chrome : les VRAIES fonctions du jeu (qlBornes, qlDpr, vdaTient, vdaDecor,
// qlOmbN1, loupeChaud) sont découpées dans code/rendu/*.js et rejouées dans un bac à sable avec l'état du 13 Pro de Sacha cette nuit (profil N1 BASSE, DPR 1,25,
// gouverneur doux, capteur, MOB_LONG). Pour chaque état (nominal, serious, critical) et chaque cran de l'échelle 0..kMax : résolution, ombre, halo, décor, loupe —
// avec le lot et avec ?sans=voituredabord. L'effondrement est posé pour tout cran au-delà de kNet (c'est la seule façon d'y descendre).
//   node outils/banc-voituredabord/echelle.cjs [--json]
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.join(__dirname, '..', '..', 'code', 'rendu');
const src = fs.readFileSync(path.join(R, 'nettete-qualite.js'), 'utf8') + '\n' + fs.readFileSync(path.join(R, 'loupe-caisse.js'), 'utf8');
function coupe(nom) { const i = src.indexOf('function ' + nom + '('); if (i < 0) throw new Error('absent : ' + nom); let j = src.indexOf('{', i), n = 0;
  for (let k = j; k < src.length; k++) { const c = src[k]; if (c === '{') n++; else if (c === '}') { n--; if (!n) return src.slice(i, k + 1); } } throw new Error('fin ? ' + nom); }
function ligne(debut) { const i = src.indexOf(debut); if (i < 0) throw new Error('absent : ' + debut); return src.slice(i, src.indexOf('\n', i)); }
const FN = ['qlBornes', 'qlBornesPrf', 'qlDpr', 'vdaTient', 'vdaDecor', 'qlOmbN1', 'prfDoux', 'prfGouv', 'loupeChaud', 'qlNet', 'qlDoux'].map(coupe).join('\n');
const CONST = [ligne('const VDA_DECOR='), ligne('const VDA={'), ligne('const QL_DOUX=')].join('\n');
function bac(q, th, t) {
  const H = { t: 1e6 }; const S = { H, location: { search: q }, performance: { now: () => H.t }, Math, VHD: { on: false }, curDPR: 1.25, started: true, gameOver: false,
    QL: { k: 0, N_EFF: 5, effondre: false, ombre0: 768 }, IMG_DYN: { vdaCiel: 0, vdaMips: 0 }, DPR_CAP: 1.25, DPR_MIN: .5, POSTE: { auto: false }, PC_PX: 0,
    PRF: { on: true, n: 1, T: { n: [] } }, PAL: { b: (k, d) => ({ dprNet: 1.25, dprNetBas: 1 })[k] ?? d }, SAVE: { d: { q: 'fast' } },
    MOB_S: { thermo: th }, MOB_P: { t }, gdxOn: () => true, gdxCrit: () => 4, gdxLourd: () => false, LOUPE: { chaudT: -1e9 } };
  vm.createContext(S); vm.runInContext('const VDA_ON=!/[?&]sans=[^&]*\\bvoituredabord\\b/.test(location.search);\n' + CONST + '\n' + FN + '\nthis.f={qlBornes,qlDpr,vdaDecor,qlOmbN1,loupeChaud,qlDoux,VDA};', S);
  return S; }
const ETATS = [['nominal', 0, 0], ['serious', 2, 2], ['critical', 3, 4]], out = [];
for (const [nom, th, t] of ETATS) for (const q of ['', '?sans=voituredabord']) {
  const S = bac(q, th, t), b = S.f.qlBornes(), rangs = [];
  for (let k = 0; k <= b.kMax; k++) {
    S.QL.k = k; S.QL.effondre = k > b.kNet; S.LOUPE.chaudT = -1e9;
    const d = S.f.vdaDecor(k, b), dpr = S.f.qlDpr(k, b), loupeOte = S.f.loupeChaud();
    rangs.push({ k, dpr: +dpr.toFixed(3), ombre: S.f.qlOmbN1(k), halo: k < b.kMax ? (k >= 3 ? '¾' : 'plein') : 'coupé', flouRadial: k < 5, effondre: S.QL.effondre,
      decor: d, ciel8: S.IMG_DYN.vdaCiel === 8, haloEtageMoins: S.IMG_DYN.vdaMips, loupe: loupeOte ? 'RETIRÉE' : 'posée' }); }
  /* LE FREIN : la règle (boucle-1) demande un cran de plus toutes les 1,1 s, de 5 à kMax ; qlDoux décide. Secondes pour atteindre chaque cran. */
  const F = bac(q, th, t), bf = F.f.qlBornes(), frein = {}; F.QL.k = bf.kNet; F.QL.effondre = true; F.QL.dT = -1e9; F.PRF.T.n9 = 0;
  for (let s9 = 0; s9 <= 120 && F.QL.k < bf.kMax; s9 += 1.1) { F.H.t = 1e6 + s9 * 1000; const k2 = F.f.qlDoux(Math.min(bf.kMax, F.QL.k + 1), bf);
    if (k2 !== F.QL.k) { if (Math.abs(F.f.qlDpr(k2, bf) - F.f.qlDpr(F.QL.k, bf)) > .001) F.QL.dT = F.H.t; F.QL.k = k2; frein[k2] = +s9.toFixed(1); } }
  out.push({ etat: nom, lot: q ? 'sans (avant)' : 'avec', frein, bornes: { kNet: b.kNet, kBas: b.kBas, kMax: b.kMax, cap: b.cap, pl: b.pl, bas: b.bas }, rangs }); }
if (process.argv.includes('--json')) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }
for (const o of out) { console.log(`\n== ${o.etat} · lot ${o.lot} · kNet ${o.bornes.kNet} kMax ${o.bornes.kMax} (plafond ${o.bornes.cap}, planchers ${o.bornes.pl} / ${o.bornes.bas})`);
  console.log('frein (seconde où le cran est atteint, demande toutes les 1,1 s depuis kNet) : ' + JSON.stringify(o.frein));
  console.log('cran | DPR   | ombre | halo  | flou | effondré | décor retiré                       | loupe');
  for (const r of o.rangs) { const dec = [r.ciel8 ? 'ciel 1/8' : '', r.haloEtageMoins ? 'halo −1 étage' : ''].filter(Boolean).join(' + ') || '—';
    console.log(`${String(r.k).padStart(4)} | ${r.dpr.toFixed(3)} | ${String(r.ombre).padStart(5)} | ${r.halo.padEnd(5)} | ${r.flouRadial ? 'oui ' : 'non '} | ${r.effondre ? 'oui     ' : 'non     '} | ${dec.padEnd(34)} | ${r.loupe}`); } }
