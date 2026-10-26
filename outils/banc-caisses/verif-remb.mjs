/* le remboursement des caisses retirées : ne rend que ce qui s'achetait (une mission réussie = pas de remboursement). env PORT, OK (ids de missions réussies, séparés par une virgule) */
import { lance, prepare, charge, passeSplash, sleep } from './cdp.mjs';
const c = await lance({ port: 9488 });
try {
  const ok = (process.env.OK || '').split(',').filter(Boolean);
  await prepare(c, { bank: 0, owned: [53, 65, 86, 66, 71, 73], m2: { v: 1, vc: 1, vr: 1, ok, pr: [], su: [], vu: {}, nv: [], fl: [], r: {}, c: { morts: 0, gagne: 0, jours: 1, jd: '2026-10-22', cartes: [], cartesP: [], rejoue: 0 } } });
  await charge(c, `http://127.0.0.1:${process.env.PORT}/index.html?colonne=0&simu=1&garde=1`, { attente: 120000 });
  await passeSplash(c); await sleep(1500);
  console.log('ok=', ok.join(','), await c.ev(`__ev('JSON.stringify({bank:SAVE.d.bank,owned:SAVE.d.owned,remb:SAVE.remb})')`));
  console.log('erreurs', c.erreurs.slice(0, 3));
} finally { await c.fin(); }
