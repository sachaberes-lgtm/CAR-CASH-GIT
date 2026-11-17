// LE BANC DES RAFALES (2026-11-17, qualité · lot lenteur) — le gouverneur de lenteur (?plus=gouvlent) sur une vraie course, iPhone 13 Pro émulé (?tel=1), pilote automatique immortel.
// Rafales SIMULÉES par dbgRafale({ms,k}) : une image calculée sur k fait `ms` de travail de plus, DANS l'image (la forme du vol : une image sur 3-4 à ~115 ms).
// Programme de 5 min : calme / rafale de 3 à 34 s, en alternance. On relève, seconde par seconde, les images calculées, l'état du gouverneur, la rafale ;
// puis : l'entrée (ms après le début de chaque rafale), la sortie (s après la fin), le pompage (entrées en trop), les images par seconde pendant les rafales.
//   node outils/banc-lenteur/rafale.cjs --qs "plus=gouvlent" --tag apres [--min 5] [--ms 100] [--k 3]
const fs = require('fs'), path = require('path');
const { ouvre, dormir } = require('../banc-jsimage/commun.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RAC = path.resolve(__dirname, '..', '..');
const JEU = path.resolve(path.join(RAC, 'VERSION PRINCIPALE')), REPLI = path.resolve(A.repli || path.join(process.env.HOME, 'cash-car', 'qualite', 'VERSION PRINCIPALE'));
const OUT = path.join(__dirname, 'mesures'); fs.mkdirSync(OUT, { recursive: true });
const TAG = A.tag || 'rafale', MS = +(A.ms || 100), K = +(A.k || 3), MIN = +(A.min || 5), CPU = +(A.cpu || 0); /* --cpu N : la rafale = le processeur bridé ×N (CDP) au lieu du travail injecté — pour la sentinelle */
/* le programme : [calme s, rafale s] … (3 à 34 s de rafale, comme le vol), répété jusqu'à MIN minutes */
const PROG = [[15, 6], [20, 20], [25, 3], [20, 34], [25, 10], [15, 4], [30, 15], [20, 8]];
(async () => {
  const { c, url } = await ouvre({ dirs: [JEU, REPLI], http: +(A.http || 8791), cdp: +(A.cdp || 9341), carte: A.carte || 'nuages', graine: 7, qs: A.qs || '' });
  const R = { url, qs: A.qs || '', ms: MS, k: K, sec: [], rafales: [], exc: [] };
  try {
    await c.ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1");
    await dormir(4000);
    /* le relevé, dans la page : une ligne par seconde */
    await c.ev(`(function(){window.__rl=[];let f0=dbgJsImage().fr;window.__rlI=setInterval(function(){const f=dbgJsImage().fr,L=(typeof dbgLenteur==='function')?dbgLenteur():{};const r=dbgRafale();
      window.__rl.push({t:Math.round(performance.now()),f:f-f0,on:L.on?1:0,raf:(r.ms>0||window.__rafOn)?1:0,w:0});f0=f;},1000);return 1;})()`);
    const t0 = Date.now(); let p = 0;
    while (Date.now() - t0 < MIN * 60000) {
      const [ca, ra] = PROG[p % PROG.length]; p++;
      await dormir(ca * 1000); if (Date.now() - t0 >= MIN * 60000) break;
      let deb; if (CPU) { deb = await c.ev('window.__rafOn=1;Math.round(performance.now())'); await c.send('Emulation.setCPUThrottlingRate', { rate: CPU }); } else deb = await c.ev(`dbgRafale({ms:${MS},k:${K}}).t`);
      await dormir(ra * 1000);
      if (CPU) { await c.send('Emulation.setCPUThrottlingRate', { rate: 1 }); await c.ev('window.__rafOn=0;1'); } else await c.ev('dbgRafale({ms:0});1'); const fin = await c.ev('Math.round(performance.now())');
      R.rafales.push({ deb, fin, s: ra });
      await c.ev("(function(){const s=dbgState();if(s.gameOver||!s.running)dbgJouer();return 1})()");
    }
    await dormir(12000);
    R.sec = await c.ev('window.__rl');
    R.lent = await c.ev("typeof dbgLenteur==='function'?dbgLenteur():null");
    R.erreurs = await c.ev("(window.dbgErreurs?dbgErreurs():[]).filter(function(e){return /erreur|exception|panne/i.test(e.g)}).map(function(e){return e.g+' '+e.m})");
  } finally { R.exc = c.exc.slice(); c.fin(); }
  /* le bilan */
  const H = (R.lent && R.lent.hist) || [], B = { rafales: R.rafales.length, entrees: H.filter(h => h.e).length, sorties: H.filter(h => !h.e).length, detail: [] };
  for (const r of R.rafales) {
    const e = H.find(h => h.e && h.t >= r.deb - 50 && h.t <= r.fin), x = H.find(h => !h.e && h.t > r.fin);
    const ent = H.filter(h => h.e && h.t >= r.deb && h.t <= r.fin + 12000).length;
    const sec = R.sec.filter(s => s.t > r.deb + 1500 && s.t <= r.fin), ips = sec.length ? sec.reduce((a, s) => a + s.f, 0) / sec.length : null;
    B.detail.push({ s: r.s, entreeMs: e ? e.t - r.deb : null, sortieS: x ? +((x.t - r.fin) / 1000).toFixed(1) : null, entreesDansLaFenetre: ent, ipsPendant: ips == null ? null : +ips.toFixed(1) });
  }
  const calme = R.sec.filter(s => !s.raf && !s.on); B.ipsCalme = calme.length ? +(calme.reduce((a, s) => a + s.f, 0) / calme.length).toFixed(1) : null;
  const pend = R.sec.filter(s => s.raf); B.ipsRafale = pend.length ? +(pend.reduce((a, s) => a + s.f, 0) / pend.length).toFixed(1) : null;
  B.pompage = B.entrees - B.detail.filter(d => d.entreeMs != null).length; B.exceptions = R.exc.length; B.erreurs = (R.erreurs || []).length;
  B.sentinelle = R.lent && R.lent.sentinelle; B.signes = R.lent && R.lent.signes;
  R.bilan = B; fs.writeFileSync(path.join(OUT, TAG + '.json'), JSON.stringify(R, null, 1));
  console.log(JSON.stringify(B, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
