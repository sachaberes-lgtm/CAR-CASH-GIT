/* la sauvegarde garde-t-elle les compteurs à vie ? (on POSE une sauvegarde avec compteurs, on lit ce que le jeu en retient). env PORT */
import { lance, prepare, charge, passeSplash, sleep } from './cdp.mjs';
const c = await lance({ port: 9487 });
try {
  await prepare(c, { m2: { v: 1, vc: 1, vr: 1, ok: [], pr: [], su: [], vu: {}, nv: [], fl: [], r: {}, c: { morts: 0, gagne: 0, jours: 1, jd: '2026-10-22', cartes: [], cartesP: [], rejoue: 0, pu: 7, figs: 12, kmTot: 123.5, nitS: 40.5, nmaxS: 3, airS: 9, verglasKm: 2.5, sc: { cerise: 3, envers: 55.5 }, met: { nuages: ['midi', 'soir'] } } } });
  await charge(c, `http://127.0.0.1:${process.env.PORT}/index.html?colonne=0&simu=1&garde=1`, { attente: 120000 });
  await passeSplash(c); await sleep(1500);
  console.log('c', await c.ev(`__ev('JSON.stringify(SAVE.d.m2.c)')`));
  console.log('erreurs', c.erreurs.slice(0, 3));
} finally { await c.fin(); }
