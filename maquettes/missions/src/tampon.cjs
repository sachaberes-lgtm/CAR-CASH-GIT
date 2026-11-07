// le tampon « NOUVEAU PALIER » (.mcNeuf, sous le titre) : on l'injecte pour voir ce qu'il fait à la mise en page, debout et couché
const B = require('/Users/sachaberes/cash-car/ui/banc/lib.cjs'); const ETAT = require('./etat.cjs'); const path = require('path');
const dir = path.resolve(__dirname, '..', 'rendus-verif');
(async () => { let br = null, s0 = null;
  for (const fmt of ['debout', 'couche']) {
    const s = await B.ouvre({ port: 8731, vp: fmt, marges: true, dir, br, q: '?garde=1', save: ETAT }); if (!br) { br = s.br; s0 = s; }
    if (await s.tapSel('#mHome [data-m="garage"]', { attente: 4500, optionnel: true }) === false) await B.sleep(3500);
    for (let k = 0; k < 12; k++) { if (await s.tapSel('#gvMis', { attente: 3200, optionnel: true })) break; await B.sleep(2500); }
    await s.pg.evaluate(() => { const g = document.createElement('style'); g.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'; document.head.appendChild(g);
      const t = document.querySelector('#gmListe .mcTete'); const e = document.createElement('em'); e.className = 'mcNeuf'; e.textContent = 'NOUVEAU PALIER'; t.insertBefore(e, t.querySelector('.mcSqT')); });
    await B.sleep(400); await s.shot(`${fmt}-tampon`);
    console.log(fmt, JSON.stringify(await s.pg.evaluate(() => { const r = e => { const b = document.querySelector(e).getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; }; return { tete: r('#gmListe .mcTete'), tampon: r('.mcNeuf'), panneau: r('#gmListe .mcPan'), bas: r('#gmBas') }; })));
    if (s !== s0) await s.ferme(); else await Promise.race([s.ctx.close(), B.sleep(3000)]).catch(() => { }); }
  await s0.ferme(); process.exit(0); })().catch(e => { console.error('ÉCHEC', e); process.exit(1); });
