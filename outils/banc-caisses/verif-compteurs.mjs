/* vérif des compteurs des missions de caisse (power-ups, nitro, nitro max, figures, air, revives, glace) — copie servie avec __ev. env PORT */
import { lance, prepare, charge, passeSplash, sleep } from './cdp.mjs';
const PORT = process.env.PORT || 9382;
const c = await lance({ port: 9483 });
try {
  await prepare(c);
  await charge(c, `http://127.0.0.1:${PORT}/index.html?colonne=0&simu=1&garde=1&carte=nuages&meteo=midi&pistegraine=12345`, { attente: 120000 });
  await passeSplash(c); await sleep(2000);
  const E = x => c.ev(`__ev(${JSON.stringify(x)})`);
  console.log('missions', await c.ev(`JSON.stringify(dbgMissions().filter(function(x){return ['pu100','nmax100','figs500','nit1000','air1000','verglas100','km100k','meteo','silence','nit2000','mis10','rares'].indexOf(x.id)>=0;}).map(function(x){return [x.id,x.texte,x.valeur,x.seuil,x.famille];}))`));
  await c.ev(`document.querySelector('[data-m="play"]')&&document.querySelector('[data-m="play"]').click()`); await sleep(2500);
  console.log('etat', await E(`JSON.stringify({started:started,mode:mode})`));
  await c.ev(`dbgAuto(true,0)`);
  for (let i = 0; i < 40; i++) await c.ev(`dbgStep(1,16)`);
  await E(`pwrPrend('n',carGroup.position)`); await E(`pwrPrend('a',carGroup.position)`);
  await E(`keys.Space=true`);
  for (let i = 0; i < 300; i++) await c.ev(`dbgStep(1,16)`);
  await E(`keys.Space=false`);
  await E(`m2Fig('fig_test1');m2Fig('fig_test2');m2Fig('fig_combo_x')`);
  console.log('meteo', await E(`JSON.stringify(m2Meteo())`));
  console.log('compteurs', await E(`JSON.stringify(SAVE.d.m2.c)`));
  console.log('pwr', await E(`JSON.stringify({n:pwrNitroT,a:pwrAirT,nitroOn:nitroOn,mode:mode})`));
  console.log('erreurs', c.erreurs.slice(0, 5));
} finally { await c.fin(); }
