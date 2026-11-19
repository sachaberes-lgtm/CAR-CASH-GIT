// LA FLAMME À L'OCTET (2026-11-16, lot jsimage) — une vraie course (pilote auto, nitro tenue par à-coups), iPhone 13 Pro émulé, processeur ×CPU ;
// dbgNxfDouble(1) : chaque dessin de la flamme du pouce est fait deux fois sur le même état (avant / lot) et comparé (toile, grille, rectangle, Lc, putImageData).
//   node outils/banc-jsimage/flamme.cjs [--carte nuages] [--paysage 1] [--cpu 6] [--s 20] [--nit 2]
const path = require('path');
const { ouvre, dormir } = require('./commun.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RAC = path.resolve(__dirname, '..', '..');
const JEU = path.resolve(A.jeu || path.join(RAC, 'VERSION PRINCIPALE'));
const REPLI = path.resolve(A.repli || path.join(process.env.HOME, 'cash-car', 'qualite', 'VERSION PRINCIPALE'));
const pay = A.paysage === '1', S = +(A.s || 20), CPU = +(A.cpu || 6);
(async () => {
  const { c } = await ouvre({ dirs: [JEU, REPLI], http: +(A.http || 9881), cdp: +(A.cdp || 9882), carte: A.carte || 'nuages', w: pay ? 844 : 390, h: pay ? 390 : 844, graine: A.graine || 7 });
  let R;
  try {
    await c.ev(`dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:${+(A.nit || 2)}});1`);
    await c.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    await dormir(3000);
    await c.ev('dbgNxfDouble(1);1');
    await dormir(S * 1000);
    R = await c.ev('dbgNxfDouble(0)');
    R.carte = A.carte || 'nuages'; R.paysage = pay; R.cpu = CPU; R.exc = c.exc.slice(0, 3); R.charge = require('os').loadavg()[0].toFixed(1);
  } finally { c.fin(); }
  console.log(JSON.stringify(R));
  process.exit(R && R.n > 0 && R.diff === 0 ? 0 : 2);
})().catch(e => { console.error(e); process.exit(1); });
