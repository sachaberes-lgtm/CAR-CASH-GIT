/* LE BILAN DU RYTHME DE LA GROTTE (2026-11-13, Sacha : « qu'on s'amuse, qu'il n'y ait pas trop de lignes droites — des lignes droites parfois, des slaloms parfois, des virages parfois,
   des torsades parfois, mais jamais trop d'une seule chose ») : node grotte-rythme.cjs palier graines(1-12) [suite=1] [detail=1]
   Sur la route FINALE (après pisteTordPropre), tous les 6 m, ce que vit la caisse — dans le repère de la dalle :
   · TORSION : la dalle couchée de plus de 45° (N.y < 0,7 : le dévers d'un virage, 38° au plus, n'en est pas) ou qui roule (> 20°/s de croisière)
   · VIRAGE  : la tangente tourne (≥ 1 / (5 rMin) rad/m, sur ±20 m) — en plan ou en pente, peu importe : sur une paroi, un virage de la dalle est une montée
   · RELIEF  : la pente change vite (bosse, creux, marche : ≥ 0,0016 rad/m)
   · DROITE  : rien de tout ça.
   Rend la part de chaque genre, la plus longue droite (s de croisière et s réelles), le nombre de droites de plus de 3 s réelles, l'alternance (les changements de genre par minute),
   la part couchée de plus de 60° et à l'envers, la liste des modules et leurs FAMILLES (deux de la même famille à la suite = une redite). suite=1 : la mémoire des grottes d'une graine à l'autre. */
const G = require('./grotte.cjs'), vm = require('vm'), V3 = G.ctx.THREE.Vector3;
const [pal, gr] = process.argv.slice(2), suite = process.argv.includes('suite=1'), detail = process.argv.includes('detail=1');
const [g0, g1] = (gr || '1-12').split('-').map(Number);
{const p9 = +(pal || 0), k9 = Math.min(1, p9 / 25), vw9 = require('./charge.cjs').VW[p9] || 78; G.ctx.__LC = process.env.LC === '0' ? 0 : (45 - 25 * k9) * vw9 * (1.8 - .8 * k9) * .85; vm.runInContext('longueurCible=function(){return __LC;}', G.ctx);}
const FAM = s => { if (!s) return '?'; const t = {
  gSlalom: 'S', gChicane: 'S', gEsses: 'S', gSerpent: 'S', gCouloir: 'S', gFaille: 'S', gFente: 'T', gStalagmites: 'S', gColonnes: 'S', gPortes: 'S',
  gCorde: 'V', gEntonnoir: 'V', gBalcon: 'V', gReleve: 'T', gVelodrome: 'T', gGorge: 'T', gGrandVirage: 'V', gEpingleLarge: 'V',
  gHoule: 'A', gRusses: 'A', gTremplin: 'A', gDoubleTremplin: 'A', gOndes: 'A', gPlongeon: 'A', gGalerie: 'A', gBosses: 'A',
  gSurf: 'T', gFlanc: 'T', gParoi: 'T', gTorsade: 'T', gTonneau: 'T', gEnvers: 'T', gVague: 'T', gVrilleTube: 'T', gTireBouchon: 'T',
  gBoyau: 'D', gPasserelle: 'D',
  pToboggan: 'P', pCascade: 'P', pSpirale: 'P', pNoeud: 'P', pSaut: 'P', pGouffre: 'P', pMurMort: 'P', pPlongeeEnvers: 'P', pVrille: 'P', pColimacon: 'P', pRebord: 'P', gGrandVirage: 'V',
  vMurs: 'T', vPlafond: 'T', seuil: 'D' }[s]; return t || '?'; };
const A = [], F = {}; let prec = null;
for (let g = g0; g <= (g1 || g0); g++) {
  if (!suite) try { vm.runInContext('GRT_VUS.length=0', G.ctx); } catch (e) {}
  let r; try { r = G.piste(g, pal || 0); } catch (e) { console.log('graine', g, 'ERREUR', e.stack.split('\n').slice(0, 3).join(' | ')); continue; }
  if (r.tordErr) { console.log('graine', g, 'TORD', r.tordErr); continue; }
  const Q = r.ctrl, N = r.N, n = Q.length, vw = r.vw, rMin = 40 + .3 * vw, EL = 1.8 - .8 * Math.min(1, Math.max(0, (vw - 78) / 330));
  /* rééchantillonnage tous les 6 m : position, tangente, normale */
  const S = [0]; for (let i = 1; i < n; i++) S.push(S[i - 1] + Q[i].distanceTo(Q[i - 1]));
  const L = S[n - 1], ds = 6, m = Math.floor(L / ds), P = [], T = [], NN = [];
  let j = 0; for (let k = 0; k <= m; k++) { const sk = k * ds; while (j < n - 2 && S[j + 1] < sk) j++; const u = (sk - S[j]) / Math.max(1e-6, S[j + 1] - S[j]);
    P.push(new V3().lerpVectors(Q[j], Q[j + 1], u)); NN.push(new V3().lerpVectors(N[j], N[j + 1], u).normalize()); }
  for (let k = 0; k <= m; k++) T.push(new V3().subVectors(P[Math.min(m, k + 1)], P[Math.max(0, k - 1)]).normalize());
  const w = 4; /* ±24 m */
  const typ = new Array(m + 1).fill('D');
  let tors = 0, c60 = 0, env = 0;
  for (let k = 0; k <= m; k++) {
    const a = T[Math.max(0, k - w)], b = T[Math.min(m, k + w)], ang = Math.acos(Math.max(-1, Math.min(1, a.dot(b)))) / (2 * w * ds);
    const na = NN[Math.max(0, k - 2)], nb = NN[Math.min(m, k + 2)], t = T[k];
    const pa = new V3().copy(na).addScaledVector(t, -na.dot(t)).normalize(), pb = new V3().copy(nb).addScaledVector(t, -nb.dot(t)).normalize();
    const roul = Math.abs(Math.atan2(new V3().crossVectors(pa, pb).dot(t), pa.dot(pb))) / (4 * ds) * vw * 57.3; /* °/s de croisière */
    const pz = Math.asin(Math.max(-1, Math.min(1, T[Math.max(0, k - w)].y))), pzb = Math.asin(Math.max(-1, Math.min(1, T[Math.min(m, k + w)].y))), bos = Math.abs(pzb - pz) / (2 * w * ds);
    const ny = NN[k].y; if (ny < .5) c60++; if (ny < -.2) env++;
    if (ny < .7 || roul > 20) { typ[k] = 'T'; tors++; } else if (ang >= 1 / (5 * rMin)) typ[k] = 'V'; else if (bos >= .0016) typ[k] = 'R';
  }
  /* les droites : les suites de D (une suite de moins de 30 m entre deux genres n'en est pas une) */
  let longD = 0, nD3 = 0, cur = 0, chg = 0, nD = 0, momT = 0, curT = 0; const runs = [];
  for (let k = 0; k <= m; k++) { if (typ[k] === 'D') cur++; else { if (cur) runs.push(cur); cur = 0; } if (k && typ[k] !== typ[k - 1]) chg++; if (typ[k] === 'T') curT++; else { if (curT * ds / vw / EL >= 1) momT++; curT = 0; } }
  if (cur) runs.push(cur);
  const secR = c => c * ds / vw / EL; /* s réelles */
  for (const c of runs) { nD += c; longD = Math.max(longD, c); if (secR(c) > 3) nD3++; }
  if (process.argv.includes('droites=1')) { /* (diagnostic) les droites de plus de 1,2 s réelles et le module qui les porte */
    const MK = vm.runInContext('MODMARK.map(function(m){return [m.nom||m.fig||"?",m.i0,m.i1];})', G.ctx), sDe = i => S[Math.max(0, Math.min(n - 1, i))];
    let k0 = -1; const out = []; for (let k = 0; k <= m + 1; k++) { const isD = k <= m && typ[k] === 'D'; if (isD && k0 < 0) k0 = k; if (!isD && k0 >= 0) { const len = (k - k0) * ds; if (len / vw / EL >= 1.2) { const sm = (k0 + k) / 2 * ds; const mk = MK.filter(x => sDe(x[1]) - 40 <= sm && sDe(x[2]) + 40 >= sm).map(x => x[0]).join('/') || 'liaison'; out.push(Math.round(k0 * ds) + ':' + (len / vw / EL).toFixed(1) + 's:' + mk); } k0 = -1; } }
    console.log('  droites', g, out.join(' ')); }
  /* LA MÊME DIRECTION : le cap de fond (la corde sur ±200 m, vue de dessus) ; le plus long temps (s réelles) pendant lequel il reste à moins de 40° de sa valeur de départ */
  let dirMax = 0, dirOu = ''; {const w2 = Math.round(200 / ds), H = []; for (let k = 0; k <= m; k++) { const a = P[Math.max(0, k - w2)], b = P[Math.min(m, k + w2)]; H.push(Math.atan2(b.x - a.x, b.z - a.z)); }
    for (let k = 0; k <= m; k += 3) { let j = k; while (j < m) { let d = H[j + 1] - H[k]; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; if (Math.abs(d) > 40 / 57.3) break; j++; } const du = (j - k) * ds / vw / EL; if (du > dirMax) { dirMax = du; dirOu = Math.round(k * ds) + '-' + Math.round(j * ds); } } }
  if (process.argv.includes('dir=1')) { const MK = vm.runInContext('MODMARK.map(function(m){return [m.nom||m.fig||"?",m.i0,m.i1];})', G.ctx), sDe = i => S[Math.max(0, Math.min(n - 1, i))], a9 = +dirOu.split('-')[0], b9 = +dirOu.split('-')[1];
    console.log('  même direction', g, dirMax.toFixed(1) + ' s', dirOu, MK.filter(x => sDe(x[2]) >= a9 && sDe(x[1]) <= b9).map(x => x[0] + ':' + Math.round(sDe(x[1])) + '-' + Math.round(sDe(x[2]))).join(' ')); }
  const noms = (vm.runInContext('GROTTE.noms', G.ctx) || r.marks.map(x => x.nom || x.fig || '?')).slice();
  for (const x of noms) F[x] = (F[x] || 0) + 1;
  const fams = noms.map(FAM).join(''); let redites = 0; for (let q = 1; q < fams.length; q++) if (fams[q] === fams[q - 1] && fams[q] !== 'P') redites++;
  const hz = vm.runInContext('GROTTE.Q&&GROTTE.Q.hasard', G.ctx) || {};
  const part = c => +(typ.filter(x => x === c).length / (m + 1)).toFixed(2);
  const o = { g, sReel: Math.round(L / vw / EL), D: part('D'), V: part('V'), R: part('R'), T: part('T'), droiteMax: +secR(longD).toFixed(1), memeDir: +dirMax.toFixed(1), droites3s: nD3, alternance: +(chg / (L / vw / EL) * 60 / 10).toFixed(1),
    c60: +(c60 / (m + 1)).toFixed(2), moments: momT, envers: +(env / (m + 1)).toFixed(2), redites, fams, mods: noms.join(','), perso: hz.perso || '-', descente: hz.descente || '-', conflits: r.conflits, contacts: r.info && r.info.contacts };
  A.push(o); console.log(JSON.stringify(detail ? o : Object.assign({}, o, { mods: undefined })));
}
const moy = k => (A.reduce((a, x) => a + (+x[k] || 0), 0) / Math.max(1, A.length)).toFixed(2);
console.log('MOYENNE · droite', moy('D'), '· virage', moy('V'), '· relief', moy('R'), '· torsion', moy('T'), '· plus longue droite (s réelles)', moy('droiteMax'), '· même direction max (s réelles)', moy('memeDir'), '(pire', Math.max(...A.map(x => x.memeDir)) + ')', '· droites > 3 s', moy('droites3s'),
  '· changements /10 s', moy('alternance'), '· couchée > 60°', moy('c60'), '· moments de torsion', moy('moments'), '· envers', moy('envers'), '· redites de famille', moy('redites'), '· conflits', moy('conflits'), '· durée (s réelles)', moy('sReel'));
console.log('MODULES (' + Object.keys(F).length + ' différents sur ' + A.length + ' grottes) :', Object.entries(F).sort((a, b) => b[1] - a[1]).map(e => e[0] + ' ' + e[1]).join(' · '));
