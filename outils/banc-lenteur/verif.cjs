// LA VÉRIFICATION DU LOT LENTEUR (2026-11-17) — une course par variante d'URL, iPhone 13 Pro émulé : images calculées par seconde, l'amorce du son de la carte moteur,
// l'état du gouverneur de lenteur et de la loupe ; pour ?plus=loupechaud, la bascule « économie + fair + branché » vue à la pause (moment caché). 0 exception attendue.
//   node outils/banc-lenteur/verif.cjs
const fs = require('fs'), path = require('path');
const { ouvre, dormir } = require('../banc-jsimage/commun.cjs');
const RAC = path.resolve(__dirname, '..', '..'), JEU = path.join(RAC, 'VERSION PRINCIPALE'), REPLI = path.join(process.env.HOME, 'cash-car', 'qualite', 'VERSION PRINCIPALE');
const VAR = process.argv[2] ? process.argv.slice(2) : ['', 'sans=cadhorloge', 'sans=swapchaud', 'plus=gouvlent', 'plus=loupechaud', 'plus=loupechaud&sans=loupechaud'];
(async () => {
  const T = {};
  for (const qs of VAR) {
    const { c } = await ouvre({ dirs: [JEU, REPLI], http: 8793, cdp: 9343, carte: 'nuages', graine: 7, qs });
    const R = {};
    try {
      await c.ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1"); await dormir(3000);
      R.ips = await c.ev("(async function(){const f0=dbgJsImage().fr,t0=performance.now();await new Promise(r=>setTimeout(r,15000));return +((dbgJsImage().fr-f0)/((performance.now()-t0)/1000)).toFixed(2)})()", 60000);
      R.cad = await c.ev("(function(){const d=dbgCadence();return {on:d.on,per:d.per,tol:d.tol,ecran:d.ecran}})()").catch(e => String(e));
      R.lent = await c.ev("typeof dbgLenteur==='function'?(function(){const L=dbgLenteur();return {ok:L.ok,on:L.on,entrees:L.entrees,emiK:L.emiK,ventK:L.ventK,lent:L.lent}})():null");
      R.son = await c.ev("(function(){try{const e=CCSON.etat();return {amorces:e.amorces,ok:e.ok}}catch(x){return String(x)}})()");
      R.loupe = await c.ev("(function(){const L=dbgLoupe();return {ok:L.ok,on:L.on,chaud:L.chaud,lch:L.lch}})()");
      if (/loupechaud/.test(qs)) {
        await c.ev("window.__ccEco=1;window.__ccBranche=2;dbgThermique(1);1"); await dormir(2500);
        R.loupeEnCourse = await c.ev("(function(){const L=dbgLoupe();return {on:L.on,chaud:L.chaud,lch:L.lch}})()");
        await c.ev("dbgCalmeSuivi('pause');1"); await dormir(1500);
        R.loupePause = await c.ev("(function(){const L=dbgLoupe();return {on:L.on,chaud:L.chaud,lch:L.lch}})()");
        await c.ev("dbgCalmeSuivi('pause');1"); await dormir(5000);
        R.loupeApres = await c.ev("(function(){const L=dbgLoupe();return {on:L.on,chaud:L.chaud,lch:L.lch}})()");
        R.notes = await c.ev("dbgErreurs().filter(function(e){return e.g==='lenteur'}).map(function(e){return e.m})");
      }
      R.erreurs = await c.ev("dbgErreurs().filter(function(e){return /erreur|exception|panne/i.test(e.g)}).map(function(e){return e.g+' '+e.m})");
    } finally { R.exceptions = c.exc.slice(); c.fin(); }
    T[qs || '(défaut)'] = R; console.log(qs || '(défaut)', JSON.stringify(R));
  }
  fs.mkdirSync(path.join(__dirname, 'mesures'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'mesures', 'verif.json'), JSON.stringify(T, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
