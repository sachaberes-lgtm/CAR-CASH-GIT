/* LES CROISEMENTS DE LA ROUTE AVEC ELLE-MÊME (2026-11-09, Sacha : « dans la map city des fois ça fait une boucle trop serrée et il y a presque pas
   d'espace pour la voiture de passer en dessous »). Banc Node : génère les routes de VILLE / CRYPTO CITY (la vitrée a ses PONTS : vitreAplanir, VIT_SEP 46 m)
   et mesure, pour chaque route, la HAUTEUR LIBRE du croisement le plus bas : deux morceaux séparés de plus de 150 m de route qui passent à moins de 60 m
   l'un de l'autre EN PLAN ; l'écart d'altitude entre les deux est l'espace où passe la voiture. Sort en erreur (code 1) si une route descend sous `min`.
   node croise.cjs [graines=1-60] [paliers=0,10,20] [carte=ville|crypto] [min=46] [detail=1] */
const path = require('path');
const B = require('./charge.cjs');
const ctx = B.ctx;
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(k + '=')); return a ? a.slice(k.length + 1) : d; };
const [g0, g1] = arg('graines', '1-60').split('-').map(Number);
const PAL = arg('paliers', '0,10,20').split(',').map(Number);
const CARTES = arg('carte', 'ville,crypto').split(',');
const MIN = +arg('min', 46);
const detail = arg('detail', '0') === '1';

function piste(carte, graine, palier) {
  const vw = B.VW[palier] || 78;
  ctx.__setPalier(palier, vw);
  ctx.LVL.cur = carte === 'crypto' ? { id: 'ville', crypto: 1, carte: 'ville', sansFin: 1 } : { id: 'ville', carte: 'ville', sansFin: 1 };
  ctx.window.dbgEspOff = false;
  ctx.MODMARK.length = 0; ctx.FILETMARK.length = 0;
  const ctrl = ctx.genCtrl(ctx.mulberry32(graine), new ctx.THREE.Vector3(0, 0, 0), 0);
  return { ctrl, marks: ctx.MODMARK.map(m => Object.assign({}, m)), vw };
}

function echant(ctrl) {
  const P = [{ x: ctrl[0].x, y: ctrl[0].y, z: ctrl[0].z, s: 0, i: 0 }]; let s = 0;
  for (let i = 1; i < ctrl.length; i++) {
    const a = ctrl[i - 1], b = ctrl[i], d = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z), n = Math.max(1, Math.ceil(d / 8));
    for (let k = 1; k <= n; k++) { s += d / n; P.push({ x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n, z: a.z + (b.z - a.z) * k / n, s, i }); }
  }
  return P;
}

/* tous les croisements : pour chaque point, le plus proche en hauteur parmi les morceaux lointains qui le recoupent en plan ; regroupés par tranche de 200 m */
function croisements(ctrl, H = 60, dsMin = 150) {
  const P = echant(ctrl), G = new Map();
  P.forEach((p, k) => { const key = Math.floor(p.x / H) * 100003 + Math.floor(p.z / H); let l = G.get(key); if (!l) G.set(key, l = []); l.push(k); });
  const evt = new Map();
  for (let a = 0; a < P.length; a++) {
    const p = P[a], cx = Math.floor(p.x / H), cz = Math.floor(p.z / H);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const l = G.get((cx + dx) * 100003 + cz + dz); if (!l) continue;
      for (const b of l) {
        if (b <= a) continue; const q = P[b]; if (q.s - p.s < dsMin) continue;
        if (Math.hypot(q.x - p.x, q.z - p.z) > H) continue;
        const g = Math.abs(q.y - p.y), k = Math.floor(p.s / 200) + '/' + Math.floor(q.s / 200), e = evt.get(k);
        if (!e || g < e.dy) evt.set(k, { dy: g, sA: p.s, sB: q.s, iA: p.i, iB: q.i });
      }
    }
  }
  return [...evt.values()].sort((a, b) => a.dy - b.dy);
}

const moduleDe = (marks, i) => { const m = marks.find(m => i >= m.i0 && i <= m.i1); return m ? (m.fig || 'module') : '-'; };
let faux = 0;
for (const carte of CARTES) for (const pal of PAL) {
  const bas = []; let nb = 0, nRoutes = 0, pire = 1e9; const parMod = {};
  for (let g = g0; g <= g1; g++) {
    const r = piste(carte, g, pal); nRoutes++;
    const ev = croisements(r.ctrl);
    if (ev.length) pire = Math.min(pire, ev[0].dy);
    const mauvais = ev.filter(e => e.dy < MIN);
    if (mauvais.length) nb++;
    for (const e of mauvais) { const k = moduleDe(r.marks, e.iA) + ' / ' + moduleDe(r.marks, e.iB); parMod[k] = (parMod[k] || 0) + 1; bas.push({ g, ...e, k }); }
  }
  faux += nb;
  console.log(`${carte.padEnd(7)} palier ${String(pal).padStart(2)} : ${nRoutes} routes, ${nb} avec un croisement sous ${MIN} m de hauteur libre (le plus bas : ${pire > 1e8 ? '—' : Math.round(pire) + ' m'})  ${nb ? JSON.stringify(parMod) : ''}`);
  if (detail) for (const b of bas.slice(0, 8)) console.log(`    g${b.g} dy ${Math.round(b.dy)} sA ${Math.round(b.sA)} sB ${Math.round(b.sB)} ${b.k}`);
}
process.exit(faux ? 1 : 0);
