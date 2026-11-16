/* LA PART DE TUNNEL DE LA GROTTE (2026-11-14, Sacha : « grotte doit avoir un peu moins de tunnels ») :
     node outils/banc-routes/grotte-tunnels.cjs palier graines(1-12) [suite=1] [detail=1] [json=fichier]
   Le VRAI genGrotte + pisteTordPropre + grtEchantillons (le creux réel : R.RH demi-largeur, R.UP voûte, R.TUF « dans un tube ») dans un vm Node — déterministe, sans navigateur.
   Par graine, sur la route finale (un échantillon tous les ~6 m, hors rallonges) :
     · TUBE    : R.TUF > 0,5 — l'échantillon est dans un passage fermé déclaré (GROTTE.boyaux : exigus, modules en tube, toboggan, colimaçon, retournement) ;
     · SERRÉ   : la paroi à moins de 40 m du bord de la dalle (RH − ROAD_HALF < 40) OU la voûte à moins de 60 m (UP < 60) — ce que l'œil lit comme un tunnel, mine comprise ;
     · SALLE 0 : l'entrée large + la galerie de mine (pour mémoire : la mine étroite ne fait que ~1 % de la route) ;
     · OUVERT  : RH ≥ 150 et UP ≥ 120 (une vraie salle) ;
   en part de la LONGUEUR et en secondes réelles (longueur / (vw × élan)). Puis la liste des passages (GROTTE.boyaux) avec leur source :
     exigu (les passages ajoutés le 13/11), module (gCouloir, gFaille, gGalerie, gGorge, gFente, gBoyau), descente (pToboggan, pColimacon), retournement (les tubes du plafond).
   env : G1=fichier (une copie d'essai de grottes-1.js) · SANS=exigu,… (simule ?sans=…) */
const fs = require('fs'), vm = require('vm');
if (process.env.SANS) { /* avant le chargement : location.search du vm */
  const C = require('./charge.cjs'); try { vm.runInContext('location.search=' + JSON.stringify('?sans=' + process.env.SANS), C.ctx); } catch (e) { console.log('SANS ignoré :', e.message); }
}
const G = require('./grotte.cjs'), ctx = G.ctx, THREE = ctx.THREE;
vm.runInContext('var pts=[],T=[],Nn=[],NP=0,L=0;', ctx);
const arg = n => { const a = process.argv.find(x => x.startsWith(n + '=')); return a ? a.slice(n.length + 1) : null; };
const [pal, gr] = process.argv.slice(2), suite = process.argv.includes('suite=1'), detail = process.argv.includes('detail=1');
const [g0, g1] = (gr || '1-12').split('-').map(Number);
{ const p9 = +(pal || 0), k9 = Math.min(1, p9 / 25), vw9 = require('./charge.cjs').VW[p9] || 78; ctx.__LC = process.env.LC === '0' ? 0 : (45 - 25 * k9) * vw9 * (1.8 - .8 * k9) * .85; vm.runInContext('longueurCible=function(){return __LC;}', ctx); }
function echant(r) {
  const ctrl = r.ctrl, N = r.N || ctrl.map(() => new THREE.Vector3(0, 1, 0));
  const cv = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal'); cv.arcLengthDivisions = Math.max(200, ctrl.length * 16);
  const Lc = cv.getLength(), np = Math.ceil(Lc / 3) + 1, P = cv.getSpacedPoints(np - 1);
  ctx.pts = P; ctx.NP = np; ctx.L = Lc; ctx.T = P.map((p, i) => new THREE.Vector3().subVectors(P[Math.min(np - 1, i + 1)], P[Math.max(0, i - 1)]).normalize());
  ctx.Nn = P.map((p, i) => N[Math.round(i / (np - 1) * (N.length - 1))]);
  return ctx.grtEchantillons();
}
const RH0 = vm.runInContext('ROAD_HALF', ctx);
const SRC = nm => /^x/.test(nm) ? 'exigu' : /^p(Toboggan|Colimacon)/.test(nm) ? 'descente' : /^g(Couloir|Faille|Galerie|Gorge|Fente|Boyau)/.test(nm) ? 'module' : 'retournement';
const TOT = [], SOM = { exigu: 0, module: 0, descente: 0, retournement: 0 }, NB = { exigu: 0, module: 0, descente: 0, retournement: 0 };
for (let g = g0; g <= (g1 || g0); g++) {
  if (!suite) try { vm.runInContext('GRT_VUS.length=0', ctx); } catch (e) {}
  let r; try { r = G.piste(g, pal || 0); } catch (e) { console.log('graine', g, 'ERREUR', e.stack.split('\n').slice(0, 3).join(' | ')); continue; }
  if (r.tordErr) { console.log('graine', g, 'TORD', r.tordErr); continue; }
  let R; try { R = echant(r); } catch (e) { console.log('graine', g, 'ECHANT', e.message.slice(0, 200)); continue; }
  const vw = r.vw, EL = 1.8 - .8 * Math.min(1, Math.max(0, (vw - 78) / 330)), sec = m => m / vw / EL;
  let nT = 0, nS = 0, nM = 0, nO = 0, n = 0, runS = 0, longS = 0, passS = 0; const Lr = R.S[R.n - 21] - R.S[R.i0];
  for (let q = R.i0; q < R.n - 20; q++) { n++; const tube = R.TUF[q] > .5, serre = R.RH[q] - RH0 < 40 || R.UP[q] < 60, mine = R.SAL[q] === 0 && R.S[q] > 0;
    if (tube) nT++; if (serre) { nS++; runS++; } else { if (sec(runS * Lr / (R.n - 40)) >= .8) passS++; longS = Math.max(longS, runS); runS = 0; } if (mine) nM++; if (R.RH[q] >= 150 && R.UP[q] >= 120) nO++; }
  /* les passages déclarés, leur source (la marque qui les recouvre le mieux) */
  const B = vm.runInContext('GROTTE.boyaux', ctx) || [], sTot = r.sTot, C0 = r.ctrl0, SC = [0]; for (let i = 1; i < C0.length; i++) SC.push(SC[i - 1] + Math.hypot(C0[i].x - C0[i - 1].x, C0[i].z - C0[i - 1].z));
  const kSC = sTot / SC[SC.length - 1], sI = i => SC[Math.max(0, Math.min(SC.length - 1, i))] * kSC;
  const MK = r.marks.filter(m => m.nom).map(m => ({ a: sI(m.i0), b: sI(m.i1), nom: m.nom, x: !!m.exigu, t: !!m.tunnel }));
  const pas = []; const parSrc = { exigu: 0, module: 0, descente: 0, retournement: 0 };
  for (const b of B) { let best = null, bo = 0; for (const m of MK) { if (!(m.x || m.t)) continue; const o = Math.min(b.s1, m.b) - Math.max(b.s0, m.a); if (o > bo) { bo = o; best = m; } }
    const nm = best ? best.nom : (b.f ? 'tube' : 'gBoyau'), src = best ? SRC(nm) : (b.f ? 'retournement' : 'module'), d = sec(b.s1 - b.s0);
    pas.push(nm + ':' + Math.round(b.s0) + '-' + Math.round(b.s1) + ':' + d.toFixed(1) + 's' + (b.f ? ':rh' + Math.round(b.f.rh) + '/up' + Math.round(b.f.up) : '')); parSrc[src] += d; SOM[src] += d; NB[src]++; }
  const dur = sec(Lr), o = { g, L: Math.round(Lr), dur, tube: nT / n, serre: nS / n, mine: nM / n, ouvert: nO / n, nPass: B.length, passS, longS: sec(longS * Lr / n), perso: (vm.runInContext('GROTTE.Q&&GROTTE.Q.hasard', ctx) || {}).perso, parSrc };
  TOT.push(o);
  console.log('graine', g, 'L', o.L, 'm', dur.toFixed(1) + ' s', '| TUBE', (o.tube * 100).toFixed(1) + '%', (o.tube * dur).toFixed(1) + 's', '| SERRÉ', (o.serre * 100).toFixed(1) + '%', (o.serre * dur).toFixed(1) + 's', '(salle 0 : ' + (o.mine * 100).toFixed(1) + '%)', '| OUVERT', (o.ouvert * 100).toFixed(1) + '%', '| passages', o.nPass, 'serrés vus', passS, 'le plus long', o.longS.toFixed(1) + 's', '|', o.perso || '');
  if (detail) console.log('   ', pas.join('  '));
}
const moy = k => TOT.reduce((a, o) => a + o[k], 0) / Math.max(1, TOT.length), N = Math.max(1, TOT.length);
const sT = TOT.reduce((a, o) => a + o.tube * o.dur, 0), sS = TOT.reduce((a, o) => a + o.serre * o.dur, 0), sD = TOT.reduce((a, o) => a + o.dur, 0), sMi = TOT.reduce((a, o) => a + o.mine * o.dur, 0);
console.log('MOYENNE palier', pal || 0, 'graines', TOT.length, '| TUBE', (sT / sD * 100).toFixed(1) + '% (' + (sT / N).toFixed(1) + ' s/grotte)', '| SERRÉ', (sS / sD * 100).toFixed(1) + '% (' + (sS / N).toFixed(1) + ' s/grotte)', '| salle 0 (entrée + mine)', (sMi / sD * 100).toFixed(1) + '%', '| OUVERT', (moy('ouvert') * 100).toFixed(1) + '%', '| passages/grotte', moy('nPass').toFixed(2), '| le plus long serré (moy)', moy('longS').toFixed(1) + ' s', 'pire', Math.max(...TOT.map(o => o.longS)).toFixed(1) + ' s');
console.log('PAR SOURCE (s réelles par grotte ; nombre par grotte) :', Object.keys(SOM).map(k => k + ' ' + (SOM[k] / N).toFixed(1) + ' s ; ' + (NB[k] / N).toFixed(2)).join(' | '));
if (arg('json')) fs.writeFileSync(arg('json'), JSON.stringify({ palier: +(pal || 0), graines: TOT, source: SOM, nb: NB }, null, 1));
