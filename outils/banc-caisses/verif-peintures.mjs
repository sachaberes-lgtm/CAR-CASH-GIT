/* vérif des compteurs de peintures secrètes ET de leur survie au rechargement. env PORT */
import { lance, prepare, charge, passeSplash, sleep } from './cdp.mjs';
const PORT = process.env.PORT;
const c = await lance({ port: 9486 });
try {
  await prepare(c);
  const URL = `http://127.0.0.1:${PORT}/index.html?colonne=0&simu=1&garde=1&carte=nuages&meteo=midi&pistegraine=12345`;
  await charge(c, URL, { attente: 120000 }); await passeSplash(c); await sleep(2000);
  const E = x => c.ev(`__ev(${JSON.stringify(x)})`);
  console.log('masque', await E(`JSON.stringify(COSM.peinture.filter(function(d){return ['bolide','menthe','guerrier','banana'].indexOf(d.id)>=0;}).map(function(d){return [d.id,d.n,!!d.sec,d.eur||'',d.ind||''];}))`));
  console.log('save', await E(`JSON.stringify({tuto:SAVE.d.tuto,permis:SAVE.d.permis,raw:(localStorage.cashcarSave||'').slice(0,160)})`));
  console.log('pack', await E(`PALETTE_PACK.ids.length`));
  await c.ev(`document.querySelector('[data-m="play"]')&&document.querySelector('[data-m="play"]').click()`); await sleep(2500);
  console.log('etat', await E(`JSON.stringify({started:started,mode:mode,go:gameOver})`));
  await c.ev(`dbgAuto(true,0)`);
  for (let i = 0; i < 120; i++) await c.ev(`dbgStep(1,16)`);
  await E(`m2Fruit('CERISE');m2Fruit('CERISE');m2Pu('v');m2Pu('a')`);
  await E(`m2Cpt('envers',99.5,100,'envers')`);
  console.log('etat2', await E(`JSON.stringify({started:started,mode:mode,go:gameOver,balade:BALADE,sand:SANDBOX,park:PARK.on,tuto:TUTO.on,c:SAVE.d.m2.c})`));
  console.log('avant', await E(`JSON.stringify({sc:SAVE.d.m2.c.sc,pu:SAVE.d.m2.c.pu,met:SAVE.d.m2.c.met,own:SAVE.d.shop.own.filter(function(x){return x.indexOf('peinture:')===0;})})`));
  await E(`SAVE.flush()`);
  console.log('raw apres flush', await E(`(function(){var r=localStorage.cashcarSave||'';var i=r.indexOf('"m2"');return r.length+' '+r.slice(i,i+420);})()`));
  await charge(c, URL, { attente: 120000 }); await passeSplash(c); await sleep(1500);
  console.log('apres rechargement', await E(`JSON.stringify({sc:SAVE.d.m2.c.sc,pu:SAVE.d.m2.c.pu,kmTot:SAVE.d.m2.c.kmTot,nitS:SAVE.d.m2.c.nitS,met:SAVE.d.m2.c.met,own:SAVE.d.shop.own.filter(function(x){return x.indexOf('peinture:')===0;})})`));
  console.log('erreurs', c.erreurs.slice(0, 5));
} finally { await c.fin(); }
