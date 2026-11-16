// LE VOLANT À L'IDENTIQUE (2026-11-16, lot jsimage) — la même suite de touchmove (CDP) sur le volant, avec et sans ?sans=jsimage : après chaque événement on relève
// la transformation du bouton (#tKnob) et --sl/--sr/--su/--sd de #tStick, plus le nombre de setProperty faits pendant les touchmove (la transformation, propriété nommée, ne se compte pas ici).
//   node outils/banc-jsimage/volant.cjs [--paysage 1] [--n 240]
const path = require('path');
const { ouvre, dormir } = require('./commun.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RAC = path.resolve(__dirname, '..', '..');
const JEU = path.resolve(A.jeu || path.join(RAC, 'VERSION PRINCIPALE'));
const REPLI = path.resolve(A.repli || path.join(process.env.HOME, 'cash-car', 'qualite', 'VERSION PRINCIPALE'));
const pay = A.paysage === '1', N = +(A.n || 240);
const RELEVE = `(function(){const k=document.getElementById('tKnob'),s=document.getElementById('tStick');return [k.style.transform,s.style.getPropertyValue('--sl'),s.style.getPropertyValue('--sr'),s.style.getPropertyValue('--su'),s.style.getPropertyValue('--sd'),s.style.left,s.style.top].join('|');})()`;
const COMPTE = `(function(){if(window.__ecrV)return 1;const E=window.__ecrV={on:false,n:0};const P=CSSStyleDeclaration.prototype,sp=P.setProperty;P.setProperty=function(a,b,c){if(E.on)E.n++;return sp.call(this,a,b,c);};
  return 1;})()`;
async function passe(qs, port) {
  const { c } = await ouvre({ dirs: [JEU, REPLI], http: port, cdp: port + 1, carte: 'nuages', w: pay ? 844 : 390, h: pay ? 390 : 844, graine: 7, qs });
  const out = [];
  try {
    await c.ev('dbgImmortel(true);1'); await c.ev(COMPTE);
    const r = await c.ev("(function(){const r=document.getElementById('tSteer').getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()");
    const x0 = r[0] + r[2] * .5, y0 = r[1] + r[3] * .55;
    const tp = (x, y) => [{ x, y, id: 1, radiusX: 8, radiusY: 8, force: 1 }];
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(x0, y0) });
    out.push(await c.ev(RELEVE));
    await c.ev('window.__ecrV.n=0;window.__ecrV.on=true;1');
    for (let i = 0; i < N; i++) { /* un pouce qui balaie, tire vers le bas, revient ; des pas parfois nuls (le doigt immobile qui tremble d'un sous-pixel) */
      const t = i / N, x = x0 + 70 * Math.sin(t * 6.283 * 3) * (i % 7 === 0 ? 1 : 1), y = y0 + 40 * Math.max(0, Math.sin(t * 6.283 * 2)) - (i % 11 === 0 ? 0 : 0);
      await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(Math.round(x * 4) / 4, Math.round(y * 4) / 4) });
      out.push(await c.ev(RELEVE));
    }
    const n = await c.ev('window.__ecrV.on=false;window.__ecrV.n');
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    out.push(await c.ev(RELEVE));
    return { out, ecritures: n, exc: c.exc.slice(0, 3) };
  } finally { c.fin(); }
}
(async () => {
  const avant = await passe('sans=jsimage', 9891), lot = await passe('', 9893);
  let diff = 0, prem = null; for (let i = 0; i < Math.max(avant.out.length, lot.out.length); i++) if (avant.out[i] !== lot.out[i]) { diff++; if (!prem) prem = [i, avant.out[i], lot.out[i]]; }
  const R = { paysage: pay, evenements: avant.out.length, differents: diff, premier: prem, ecrituresAvant: avant.ecritures, ecrituresLot: lot.ecritures, exc: avant.exc.concat(lot.exc), exemple: lot.out[Math.floor(N / 3)] };
  console.log(JSON.stringify(R));
  process.exit(diff === 0 ? 0 : 2);
})().catch(e => { console.error(e); process.exit(1); });
