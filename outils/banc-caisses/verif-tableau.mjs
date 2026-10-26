/* vérif du lot « tableau des voitures » : le jeu charge sans erreur, les missions nouvelles mesurent, les caisses retirées sont retirées. env PORT */
import { lance, prepare, charge, passeSplash, sleep } from './cdp.mjs';
const PORT = process.env.PORT || 9380;
const c = await lance({ port: 9481 });
try {
  await prepare(c);
  await charge(c, `http://127.0.0.1:${PORT}/index.html?colonne=0&carte=nuages&meteo=midi`, { attente: 120000 });
  await passeSplash(c); await sleep(2500);
  const m = await c.ev(`JSON.stringify(dbgMissions().filter(function(x){return ['palier10','rares'].indexOf(x.id)>=0;}))`);
  console.log(m);
  console.log(await c.ev(`JSON.stringify(dbgMissionsLots().voiture)`));
  console.log('erreurs', c.erreurs.slice(0, 5));
} finally { await c.fin(); }
