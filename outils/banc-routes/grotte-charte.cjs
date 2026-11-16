/* LA CHARTE DES ROUTES, MESURÉE SUR LA GROTTE (2026-11-13, passation CHARTE-ROUTES.md de la session « Supervision génération de routes ») : node grotte-charte.cjs [graines 1-8] [paliers 0,10,20] [detail=1]
   Sur la route FINALE (après pisteTordPropre), rééchantillonnée tous les 6 m, avec les définitions de la charte :
   · R1 la même direction : la plus longue tenue où la tangente 3D reste dans un cône de 30° autour de sa direction d'entrée (s) — pire cas ≤ 10 s, moyenne des maxima ≤ 7 s
   · R2 le tout droit : la même chose dans un cône de 8° — pire cas ≤ 5 s, moyenne ≤ 3 s
   · R3 la torsade : la vitesse de roulis de la dalle lissée sur 0,5 s (°/s) — pire cas ≤ 60, 95e centile ≤ 35
   · R4 le temps fort : le plus long temps sans MODMARK (s) ≤ 15 ; au moins 4 modules par route
   · R5 la variété : le même module deux fois d'affilée, plus de 2 fois le même, la part commune entre deux graines voisines (≤ 50 %), les modules différents sur 8 graines (≥ 12)
   · R6 les raccourcis : les MODMARK `rac:1` (≥ 2 au palier 0)
   · R8 l'envers : la part de route à plus de 90° de roulis (≤ 25 %), la plus longue tenue tête en bas (≤ 9,5 s)
   Les secondes se comptent à DEUX vitesses : la croisière du palier (vw, « la vitesse du palier ») et la vitesse réelle (EL × vw : l'élan, 1,8 × au palier 0, 1 × passé le palier 25). */
const G = require('./grotte.cjs'), vm = require('vm'), V3 = G.ctx.THREE.Vector3;
const args = process.argv.slice(2).filter(a => !a.includes('='));const detail = process.argv.includes('detail=1');
const [g0, g1] = (args[0] || '1-8').split('-').map(Number), PAL = (args[1] || '0,10,20').split(',').map(Number);
const res = [], parPal = {};
for (const pal of PAL) {
  {const k9 = Math.min(1, pal / 25), vw9 = require('./charge.cjs').VW[pal] || 78; G.ctx.__LC = (45 - 25 * k9) * vw9 * (1.8 - .8 * k9) * .85; vm.runInContext('longueurCible=function(){return __LC;}', G.ctx);}
  try { vm.runInContext('GRT_VUS.length=0', G.ctx); } catch (e) {}
  let prec = null;
  for (let g = g0; g <= (g1 || g0); g++) {
    let r; try { r = G.piste(g, pal); } catch (e) { console.log('graine', g, 'palier', pal, 'ERREUR', e.message); continue; }
    if (r.tordErr) { console.log('graine', g, 'palier', pal, 'TORD', r.tordErr); continue; }
    const Q = r.ctrl, N = r.N, n = Q.length, vw = r.vw, EL = 1.8 - .8 * Math.min(1, Math.max(0, (vw - 78) / 330));
    const S = [0]; for (let i = 1; i < n; i++) S.push(S[i - 1] + Q[i].distanceTo(Q[i - 1]));
    const L = S[n - 1], ds = 6, m = Math.floor(L / ds), P = [], NN = [];
    let j = 0; for (let k = 0; k <= m; k++) { const sk = k * ds; while (j < n - 2 && S[j + 1] < sk) j++; const u = (sk - S[j]) / Math.max(1e-6, S[j + 1] - S[j]); P.push(new V3().lerpVectors(Q[j], Q[j + 1], u)); NN.push(new V3().lerpVectors(N[j], N[j + 1], u).normalize()); }
    const T = []; for (let k = 0; k <= m; k++) T.push(new V3().subVectors(P[Math.min(m, k + 1)], P[Math.max(0, k - 1)]).normalize());
    const cone = (deg) => { const c = Math.cos(deg / 57.2958); let best = 0, ou = 0; for (let k = 0; k <= m; k += 2) { let q = k; while (q < m && T[q + 1].dot(T[k]) >= c) q++; if (q - k > best) { best = q - k; ou = k; } } return { m: best * ds, ou: ou * ds }; };
    const r1 = cone(30), r2 = cone(8);
    /* R3 : le roulis autour de la tangente, par pas, lissé sur 0,5 s (à la vitesse réelle) */
    const rol = []; for (let k = 0; k < m; k++) { const t = T[k], a = new V3().copy(NN[k]).addScaledVector(t, -NN[k].dot(t)).normalize(), b = new V3().copy(NN[k + 1]).addScaledVector(t, -NN[k + 1].dot(t)).normalize(); rol.push(Math.atan2(new V3().crossVectors(a, b).dot(t), a.dot(b))); }
    const vit = (v) => { const w = Math.max(1, Math.round(.5 * v / ds)), out = []; let kM = 0, vM = 0; for (let k = 0; k + w < rol.length; k++) { let s9 = 0; for (let q = k; q < k + w; q++) s9 += rol[q]; const x9 = Math.abs(s9) / (w * ds / v) * 57.2958; out.push(x9); if (x9 > vM) { vM = x9; kM = k; } } out.sort((a, b) => a - b); return { max: out[out.length - 1] || 0, p95: out[Math.floor(out.length * .95)] || 0, ou: kM * ds }; };
    const r3c = vit(vw), r3r = vit(EL * vw);
    /* R8 : la part à plus de 90° de roulis (la dalle regarde vers le bas : N.y < 0), la plus longue tenue tête en bas */
    let env = 0, envL = 0, cur = 0; for (let k = 0; k <= m; k++) { if (NN[k].y < 0) { env++; cur++; envL = Math.max(envL, cur); } else cur = 0; }
    /* R4, R5, R6 : les MODMARK de la route finale (indices de ctrl, relus par pisteTord) */
    const MK = vm.runInContext('MODMARK.map(function(m){return {nom:m.nom||m.fig||"?",i0:m.i0,i1:m.i1,rac:m.rac?1:0,climax:m.climax?1:0};})', G.ctx).map(x => Object.assign(x, { s0: S[Math.max(0, Math.min(n - 1, x.i0))], s1: S[Math.max(0, Math.min(n - 1, x.i1))] })).sort((a, b) => a.s0 - b.s0);
    let gap = 0, fin = 0, ouG = 0; for (const x of MK) { if (x.s0 - fin > gap) { gap = x.s0 - fin; ouG = fin; } fin = Math.max(fin, x.s1); } if (L - fin > gap) { gap = L - fin; ouG = fin; }
    const noms = MK.filter(x => !x.rac).map(x => x.nom), cnt = {}; /* (les raccourcis sont des annotations, pas des modules) */ let bis = 0; for (let q = 0; q < noms.length; q++) { cnt[noms[q]] = (cnt[noms[q]] | 0) + 1; if (q && noms[q] === noms[q - 1]) bis++; }
    const plus2 = Object.values(cnt).filter(c => c > 2).length, communs = prec ? noms.filter(x => prec.indexOf(x) >= 0).length / Math.max(1, noms.length) : 0; prec = noms;
    const o = { g, pal, sCroisiere: Math.round(L / vw), R1: [+(r1.m / vw).toFixed(1), +(r1.m / vw / EL).toFixed(1)], R1ou: Math.round(r1.ou), R2: [+(r2.m / vw).toFixed(1), +(r2.m / vw / EL).toFixed(1)], R3: [Math.round(r3c.max), Math.round(r3r.max), Math.round(r3c.p95), Math.round(r3r.p95)],
      R4: [+(gap / vw).toFixed(1), +(gap / vw / EL).toFixed(1), MK.length], R4ou: Math.round(ouG), R5: [bis, plus2, +communs.toFixed(2)], R6: MK.filter(x => x.rac).length, R8: [+(env / (m + 1)).toFixed(2), +(envL * ds / vw).toFixed(1), +(envL * ds / vw / EL).toFixed(1)], climax: MK.filter(x => x.climax).length, conflits: r.conflits, contacts: r.info && r.info.contacts };
    const ouM = s9 => MK.filter(x => x.s0 - 30 <= s9 && x.s1 + 30 >= s9).map(x => x.nom).join("/") || "liaison";
    if (process.argv.includes("ou=1")) o.ou = { R1: Math.round(r1.ou) + ":" + ouM(r1.ou + r1.m / 2), R2: Math.round(r2.ou) + ":" + ouM(r2.ou + r2.m / 2), R3: Math.round(r3r.ou) + ":" + ouM(r3r.ou), L: Math.round(L) };
    if (detail) o.mods = MK.map(x => x.nom + ':' + Math.round(x.s0) + '-' + Math.round(x.s1) + (x.rac ? '(rac)' : '')).join(' ');
    res.push(Object.assign(o, { noms })); (parPal[pal] = parPal[pal] || []).push(o);
    console.log(JSON.stringify(Object.assign({}, o, { noms: undefined })));
  }
}
const mx = (L, f) => Math.max(...L.map(f)), mo = (L, f) => (L.reduce((a, x) => a + f(x), 0) / Math.max(1, L.length));
for (const pal in parPal) { const L = parPal[pal];
  console.log('PALIER', pal, '· R1 croisière pire', mx(L, x => x.R1[0]), 'moy', mo(L, x => x.R1[0]).toFixed(1), '| réel pire', mx(L, x => x.R1[1]), 'moy', mo(L, x => x.R1[1]).toFixed(1),
    '· R2 croisière pire', mx(L, x => x.R2[0]), '| réel pire', mx(L, x => x.R2[1]), '· R3 réel pire', mx(L, x => x.R3[1]), 'p95', mx(L, x => x.R3[3]), '· R4 réel pire', mx(L, x => x.R4[1]), 'croisière', mx(L, x => x.R4[0]), 'modules min', Math.min(...L.map(x => x.R4[2])),
    '· R5 bis', mx(L, x => x.R5[0]), '>2', mx(L, x => x.R5[1]), 'communs', mx(L, x => x.R5[2]), '· R6 min', Math.min(...L.map(x => x.R6)), '· R8 part', mx(L, x => x.R8[0]), 'tenue réel', mx(L, x => x.R8[2]), '· conflits', mx(L, x => x.conflits || 0), 'contacts', mx(L, x => x.contacts || 0)); }
{const s = new Set(); for (const x of res.filter(x => x.pal === PAL[0])) for (const nm of x.noms) s.add(nm); console.log('R5 modules différents au palier', PAL[0], ':', s.size);}
