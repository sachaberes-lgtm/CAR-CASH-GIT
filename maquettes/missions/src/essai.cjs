// essai : ouvre le vrai jeu avec l'état de maquette, va à l'écran MISSIONS, photographie la base.
const B = require('/Users/sachaberes/cash-car/ui/banc/lib.cjs');
const ETAT = require('./etat.cjs');
const fmt = process.argv[2] || 'debout';
(async () => {
  const s = await B.ouvre({ port: 8731, vp: fmt, marges: true, dir: '/private/tmp/claude-501/-Users-sachaberes-cash-car/39fbcb0d-b3dd-4dbd-b950-263f0ac3d5e6/scratchpad/essai', q: '?garde=1', save: ETAT });
  await s.tapSel('#mHome [data-m="garage"]', { attente: 4500 });
  await s.tapSel('#gvMis', { attente: 3000 });
  await s.shot('base-' + fmt);
  const info = await s.pg.evaluate(() => ({ lignes: [...document.querySelectorAll('#gmListe .mcL')].map(e => e.className + ' | ' + e.innerText.replace(/\n/g, ' / ').slice(0, 90)), sous: (document.querySelector('.mcSous') || {}).innerText }));
  console.log(JSON.stringify(info, null, 1)); console.log('ERREURS', s.errs.join(' | ') || 0);
  await s.ferme(); process.exit(0);
})().catch(e => { console.error('ÉCHEC', e); process.exit(1); });
