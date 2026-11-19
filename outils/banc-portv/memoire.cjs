/* LA ROUTE EN TRANCHES ET LA MÉMOIRE DES ROUTES, en Node sans Chrome (2026-11-17, lot portv, 2e tour).
   node outils/banc-portv/memoire.cjs [graines=1-6]
   A) genCtrlG mené une pause à CHAQUE occasion (JF.lim = −1) contre genCtrl d'un trait : ville, crypto, nuages, espace × paliers 0/10/20 (contextes neufs, mêmes suites).
   B) la grotte : genGrotte + pisteTordPropreG en tranches (PORTV_ON) contre d'un trait (le code d'avant), paliers 0/10/20.
   C) LA CAUSE : une grotte (graine 2) tirée après une grotte installée (graine 1) — directement, après un pré-bâti FANTÔME (graine 50, annulé après k pauses)
      sans remettre la mémoire, puis avec rmPrend/rmRemet (route-memoire.js). Pareil pour l'orbite (pré-bâti fantôme fini puis jeté). */
const fs = require('fs'), vm = require('vm'), path = require('path'), crypto = require('crypto');
const RAC = path.resolve(__dirname, '..', '..'), M = require(path.join(RAC, 'outils/banc-routes/charge.cjs'));
const a = process.argv.find(x => x.startsWith('graines=')); const [g0, g1] = (a ? a.slice(8) : '1-6').split('-').map(Number);
const CUR = { ville: { id: 'ville', carte: 'ville', sansFin: 1, __al: 1 }, crypto: { id: 'ville', crypto: 1, carte: 'crypto', sansFin: 1, __al: 1.15 }, nuages: { id: 'nuages', carte: 'nuages', sansFin: 1 }, espace: { id: 'espace', espace: 1, carte: 'espace', sansFin: 1 } };
const mene = (g) => { let n = 0, r = g.next(); while (!r.done) { n++; r = g.next(); } return [r.value, n]; };
const hache = (h, A) => { for (const v of A) h.update(Buffer.from(Float64Array.of(v.x, v.y, v.z).buffer)); };
const memoire = (ctx) => vm.runInContext(fs.readFileSync(path.join(RAC, 'code/moteur/route-memoire.js'), 'utf8'), ctx, { filename: 'route-memoire.js' });
let tot = 0, ok = 0;
/* A */
for (const c of Object.keys(CUR)) for (const pal of [0, 10, 20]) {
  const suite = (tr) => { const B = M.creer(''), ctx = B.ctx; vm.runInContext('var JF={lim:' + (tr ? -1 : 'Infinity') + '};', ctx); const o = [];
    for (let g = g0; g <= g1; g++) { ctx.__setPalier(pal, B.VW[pal] || 78); ctx.LVL.cur = CUR[c]; ctx.window.dbgEspOff = false; ctx.MODMARK.length = 0; ctx.FILETMARK.length = 0;
      const h = crypto.createHash('md5'); let ny = 0, ctrl, n; const rnd = ctx.mulberry32(g);
      if (tr) { [ctrl, n] = mene(ctx.genCtrlG(rnd, new ctx.THREE.Vector3(0, 0, 0), 0)); ny += n; } else ctrl = ctx.genCtrl(rnd, new ctx.THREE.Vector3(0, 0, 0), 0);
      hache(h, ctrl);
      if (ctx.hautOn() || (typeof ctx.espTordOn === 'function' && ctx.espTordOn())) { let r; if (tr) { [r, n] = mene(ctx.pisteTordPropreG(ctrl, g)); ny += n; } else r = ctx.pisteTordPropre(ctrl, g); hache(h, r.ctrl); if (r.N) hache(h, r.N); }
      h.update(JSON.stringify(ctx.MODMARK.map(m => [m.i0, m.i1, m.fig || null]))); o.push([h.digest('hex'), ny]); }
    return o; };
  const A = suite(false), Bt = suite(true); let k = 0;
  for (let i = 0; i < A.length; i++) { tot++; if (A[i][0] === Bt[i][0]) { ok++; k++; } else console.log('ÉCART', c, 'p' + pal, 'g' + (g0 + i)); }
  console.log('A', c.padEnd(6), 'p' + pal, 'identiques', k + '/' + A.length, 'pauses (g' + g0 + ')', Bt[0][1]);
}
/* B et C : la grotte */
const grotteCtx = (tr) => { const B = M.creer(''), ctx = B.ctx;
  vm.runInContext(`var THICK=2.6, TEL_NATIF=false, ALLEGE=false, started=true;function longueurCible(){return 0;}` + (tr ? 'var PORTV_ON=true;' : '') + 'var JF={lim:' + (tr ? -1 : 'Infinity') + '};', ctx); ctx.__FL = {};
  vm.runInContext(fs.readFileSync(path.join(RAC, 'code/maps/grottes-1.js'), 'utf8'), ctx, { filename: 'grottes-1.js' }); memoire(ctx); return { B, ctx }; };
const grotte = (E, pal, g, pas) => { const { B, ctx } = E; ctx.__setPalier(pal, B.VW[pal] || 78); vm.runInContext(`LVL.cur={id:'grotte',piste:'grotte',carte:'grotte'};`, ctx); ctx.MODMARK.length = 0; ctx.FILETMARK.length = 0;
  const gen = ctx.genGrotte(ctx.mulberry32(g)); let st = gen.next(), ny = 0; while (!st.done) { ny++; if (pas != null && ny >= pas) { gen.return(); return null; } st = gen.next(); }
  const h = crypto.createHash('md5'); hache(h, st.value);
  try { const opts = vm.runInContext('grtTordOpts()', ctx); const [t] = mene(ctx.pisteTordPropreG(st.value, g, opts)); hache(h, t.ctrl); if (t.N) hache(h, t.N); } catch (e) { h.update('err ' + e.message); }
  h.update(JSON.stringify(ctx.MODMARK.map(m => [m.i0, m.i1, m.fig || null, m.nom || null]))); return h.digest('hex').slice(0, 12); };
{ const A = grotteCtx(false), Bt = grotteCtx(true); for (const pal of [0, 10, 20]) { let k = 0, n = 0;
    for (let g = g0; g <= g1; g++) { n++; tot++; const x = grotte(A, pal, g), y = grotte(Bt, pal, g); if (x === y) { ok++; k++; } else console.log('ÉCART grotte p' + pal + ' g' + g); }
    console.log('B grotte p' + pal, 'identiques', k + '/' + n); } }
/* C */
const C = [];
for (const pal of [0, 10]) for (const pas of [1, 3, 8]) {
  const d = grotteCtx(true); grotte(d, pal, 1); const direct = grotte(d, pal, 2);
  const f = grotteCtx(true); grotte(f, pal, 1); const perso0 = vm.runInContext('GRT_LIB_MEM.perso', f.ctx); grotte(f, pal, 50, pas); const persoF = vm.runInContext('GRT_LIB_MEM.perso', f.ctx); const fantome = grotte(f, pal, 2);
  const r = grotteCtx(true); grotte(r, pal, 1); const S = r.ctx.rmPrend(); grotte(r, pal, 50, pas); r.ctx.rmRemet(S); const remis = grotte(r, pal, 2);
  C.push({ pal, pas, direct, fantome, remis, perso0, persoF });
  console.log('C grotte p' + pal, 'fantôme annulé après', pas, 'pauses : perso', JSON.stringify(perso0), '→', JSON.stringify(persoF), '| directe', direct, '| après le fantôme', fantome, fantome === direct ? 'ÉGALE' : 'DIFFÉRENTE', '| mémoire remise', remis, remis === direct ? 'ÉGALE' : 'DIFFÉRENTE');
  tot++; if (remis === direct) ok++; }
{ const orb = (fant, remet) => { const B = M.creer(''), ctx = B.ctx; memoire(ctx); vm.runInContext('var JF={lim:Infinity};', ctx);
    const un = (g) => { ctx.__setPalier(0, 78); ctx.LVL.cur = CUR.espace; ctx.window.dbgEspOff = false; ctx.MODMARK.length = 0; ctx.FILETMARK.length = 0; const h = crypto.createHash('md5'); hache(h, ctx.genCtrl(ctx.mulberry32(g), new ctx.THREE.Vector3(0, 0, 0), 0)); return h.digest('hex').slice(0, 12); };
    un(1); let S = remet ? ctx.rmPrend() : null; if (fant) un(50); if (S) ctx.rmRemet(S); return un(2); };
  const d = orb(false), f = orb(true, false), r = orb(true, true);
  console.log('C orbite p0 | directe', d, '| après un fantôme', f, f === d ? 'ÉGALE' : 'DIFFÉRENTE', '| mémoire remise', r, r === d ? 'ÉGALE' : 'DIFFÉRENTE'); tot++; if (r === d) ok++; }
console.log('TOTAL identiques', ok + '/' + tot);
