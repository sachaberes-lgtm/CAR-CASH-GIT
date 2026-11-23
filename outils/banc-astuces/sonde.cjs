// LA SONDE DU TRAVAIL INVISIBLE (2026-11-19) : une course par map (pilote auto, immortel), 15 s de comptes par image (voir sonde-page.js).
//   node outils/banc-astuces/sonde.cjs --cartes nuages,ville --s 15 [--qs "sans=x"] [--tag t] [--out dossier]
const fs = require('fs'), path = require('path');
const { ouvre, dormir } = require('../banc-jsimage/commun.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RAC = path.resolve(__dirname, '..', '..'), JEU = path.join(RAC, 'VERSION PRINCIPALE');
const OUT = path.resolve(A.out || path.join(__dirname, 'mesures')); fs.mkdirSync(OUT, { recursive: true });
const PAGE = fs.readFileSync(path.join(__dirname, 'sonde-page.js'), 'utf8');
(async () => {
  for (const carte of (A.cartes || 'nuages').split(',')) {
    let c; const R = { carte, qs: A.qs || '', charge0: require('os').loadavg()[0].toFixed(1) };
    try {
      ({ c } = await ouvre({ dirs: [JEU], http: +(A.http || 9781), cdp: +(A.cdp || 9782), carte, meteo: A.meteo, qs: 'perfrec=2' + (A.qs ? '&' + A.qs : ''), graine: 7 }));
      await c.ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1");
      if (A.cpu) await c.send('Emulation.setCPUThrottlingRate', { rate: +A.cpu });
      await dormir(+(A.attente || 5000));
      await c.ev(PAGE);
      if (A.etats) { /* (lot 2) --etats "tout:dbgBrume(true,1)|sans:dbgBrume(false)" --cliches K : la même image dans chaque état, photos aux clichés 2, 6, 10 */
        const E = A.etats.split('|').map(x => { const i = x.indexOf(':'); return JSON.stringify(x.slice(0, i)) + ':function(){' + x.slice(i + 1) + '}'; }).join(',');
        R.fige = await c.ev('__sd.fige(' + (+(A.cliches || 10)) + ',' + (+(A.pas || 20)) + ',{' + E + '},2,[2,6,10])', 900000);
        const ph = await c.ev('__sd.photos.map(function(p){return [p[0],p[1],p[2]]})', 120000);
        const dir = path.join(OUT, 'photos'); fs.mkdirSync(dir, { recursive: true });
        for (const [k, e, d] of ph) fs.writeFileSync(path.join(dir, (A.tag || 'sonde') + '-' + carte + '-' + k + '-' + e + '.jpg'), Buffer.from(d.split(',')[1], 'base64'));
        console.log(carte, 'etats', JSON.stringify(R.fige)); }
      else if (A.horizon) {
        R.fige = await c.ev('__sd.fige(' + (+A.horizon) + ',' + (+(A.pas || 20)) + ',{tout:function(){dbgHorizon(false)},h1500:function(){dbgHorizon(true,1500)},h1000:function(){dbgHorizon(true,1000)}},2,[2,6,10])', 600000);
        const ph = await c.ev('__sd.photos.map(function(p){return [p[0],p[1],p[2]]})', 120000);
        const dir = path.join(OUT, 'photos'); fs.mkdirSync(dir, { recursive: true });
        for (const [k, e, d] of ph) fs.writeFileSync(path.join(dir, carte + '-' + k + '-' + e + '.jpg'), Buffer.from(d.split(',')[1], 'base64'));
        console.log(carte, 'horizon', JSON.stringify(R.fige)); }
      else       if (A.fige) { const B = "function(d,j,m){try{dbgDerriere(d)}catch(e){}try{dbgJumeaux(j)}catch(e){}try{dbgDessinsLoin(m)}catch(e){}}";
        R.fige = await c.ev('(function(){var b=' + B + ';return __sd.fige(' + (+A.fige) + ',' + (+(A.pas || 30)) + ',{tout:function(){b(1,1,1)},sansDerriere:function(){b(0,1,1)},sansJumeaux:function(){b(1,0,1)},sansDessinsLoin:function(){b(1,1,0)},rien:function(){b(0,0,0)}},2)})()', 600000);
        console.log(carte, 'fige', JSON.stringify(R.fige)); }
      else       if (A.alt) { R.alt = {}; for (const b of A.alt.split(',')) { const f = { derriere: 'dbgDerriere', jumeaux: 'dbgJumeaux', dessinsloin: 'dbgDessinsLoin' }[b] || b;
          R.alt[b] = await c.ev('__sd.alt(' + (+(A.s || 15) * 1000) + ',function(on){try{' + f + '(on)}catch(e){}},' + (+(A.k || 20)) + ')', 180000); console.log(carte, b, JSON.stringify(R.alt[b])); } }
      else Object.assign(R, await c.ev('__sd.go(' + (+(A.s || 15) * 1000) + ')', 120000));
      R.etat = await c.ev('(function(){var s=dbgState();return {s:Math.round(s.s||0),zone:dbgClassique().niveau}})()').catch(e => String(e));
      R.exc = c.exc.slice(0, 5);
    } catch (e) { R.erreur = String(e && e.stack || e); }
    finally { if (c) c.fin(); }
    R.charge1 = require('os').loadavg()[0].toFixed(1);
    fs.writeFileSync(path.join(OUT, (A.tag || 'sonde') + '-' + carte + '.json'), JSON.stringify(R, null, 1));
    console.log(carte, JSON.stringify({ img: R.images, ms: R.ms, cat: R.cat, tr: R.tranches, T: R.parImage, G: R.graphe, err: R.err || R.erreur, exc: R.exc && R.exc.length }));
  }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
