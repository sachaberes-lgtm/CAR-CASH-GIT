/* LE BANC NODE DE LA MESURE CORRIGÉE (2026-11-18, lot sondecalme) — sans Chrome. Les VRAIS morceaux de code/ (découpés dans le texte, rien de recopié à la main) :
   1. CAD.rN remis à zéro au départ de la course (enregistreur-perf.js, bvNeuve) : 8 min de menu puis une course, R[0] de la 1re seconde ;
   2. les étiquettes des readPixels (mouchard-gels.js, mgYPose + mgYQui) : piles V8 (Chrome) réelles, et une pile JSC (Safari/WKWebView) de synthèse ;
   3. les battements natifs horodatés (enregistreur-perf.js, BVSW / bvBat / l'accesseur de __ccSwN) et G[51] dans le vrai MG.apres ;
   4. ?sans=sondecalme : rien de tout cela.
   Usage : node outils/banc-sondecalme/test-mesure.cjs   (sort 1 au premier échec) */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAC = path.join(__dirname, '..', '..');
const MG_SRC = fs.readFileSync(path.join(RAC, 'code/moteur/mouchard-gels.js'), 'utf8');
const BV_SRC = fs.readFileSync(path.join(RAC, 'code/moteur/enregistreur-perf.js'), 'utf8');
let ok = 0, ko = 0;
const vrai = (c, m) => { if (c) { ok++; console.log('  ok   ' + m); } else { ko++; console.log('  ÉCHEC ' + m); } };
const coupe = (src, debut, fin) => { const i = src.indexOf(debut); if (i < 0) throw new Error('introuvable : ' + debut); const j = src.indexOf(fin, i); if (j < 0) throw new Error('fin introuvable : ' + fin); return src.slice(i, j + fin.length); };
const fonction = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) throw new Error('fonction introuvable : ' + nom);
  let j = src.indexOf('{', i), p = 0; for (; j < src.length; j++) { const ch = src[j]; if (ch === '{') p++; else if (ch === '}') { p--; if (!p) break; } } return src.slice(i, j + 1); };

/* ---------- 1. R[0] de la 1re seconde ---------- */
console.log('1. CAD.rN au départ de la course');
const ligneNeuve = BV_SRC.split('\n').find(l => /^\s*if\(SDCALME\)\{CAD\.rN=1;CAD\.rMin=99;\}/.test(l));
vrai(!!ligneNeuve, 'la remise à zéro est dans bvNeuve');
const ligneCad = /CAD\.rN=\(CAD\.rN\|0\)\+1;/.test(fs.readFileSync(path.join(RAC, 'code/moteur/cadence.js'), 'utf8'));
vrai(ligneCad, 'cadSaute compte toujours chaque image d\'écran (cadence.js inchangé)');
const R0 = function (sdc) {
  const ctx = { SDCALME: sdc, CAD: { rN: 0, rMin: 99 } }; vm.createContext(ctx);
  for (let i = 0; i < 8 * 60 * 30; i++) vm.runInContext('CAD.rN=(CAD.rN|0)+1;', ctx); /* 8 min de menu à 30 i/s */
  vm.runInContext('CAD.rN=(CAD.rN|0)+1;', ctx); /* la 1re image de course : cadSaute en tête de loop… */
  vm.runInContext(ligneNeuve, ctx); /* …puis bvImage → bvNeuve en fin de loop */
  for (let i = 1; i < 30; i++) vm.runInContext('CAD.rN=(CAD.rN|0)+1;', ctx); /* le reste de la 1re seconde */
  return ctx.CAD.rN;
};
const a1 = R0(true), a0 = R0(false);
console.log('     R[0] de la 1re seconde : avec le lot ' + a1 + ' · ?sans=sondecalme ' + a0);
vrai(a1 === 30, 'avec le lot : 30 images d\'écran dans la 1re seconde (pas les rAF du menu)');
vrai(a0 === 14430, '?sans=sondecalme : l\'ancien compte (14 430 : le menu compris)');

/* ---------- 2. les étiquettes des readPixels ---------- */
console.log('2. qui appelle readPixels');
const MGR_LIGNE = coupe(MG_SRC, 'const MGR={', '}; /* (lot SENTINELLE)');
const PIECES = [MGR_LIGNE.replace(/; \/\* \(lot SENTINELLE\)$/, ';'), fonction(MG_SRC, 'mgYId'), fonction(MG_SRC, 'mgY'), fonction(MG_SRC, 'mgYPose'), fonction(MG_SRC, 'mgYQui'), fonction(MG_SRC, 'mgYParQui')].join('\n');
const monde = function (sdc, ErrorFausse) {
  class GL2 { readPixels() { let s = 0; for (let i = 0; i < 2e5; i++) s += i; return s; } getError() { return 0; } drawElements() {} }
  const ctx = { SDCALME: sdc, MG: { dansBoucle: true }, location: { search: sdc ? '' : '?sans=sondecalme' }, performance, WebGL2RenderingContext: GL2, Float64Array, Uint32Array, console };
  ctx.window = ctx; if (ErrorFausse) ctx.Error = ErrorFausse; vm.createContext(ctx);
  vm.runInContext(PIECES + '\nmgYPose();this.MGR=MGR;', ctx, { filename: 'capacitor://localhost/index.html' });
  /* three.js : readRenderTargetPixels, dans vendor/ (son cadre doit être sauté) */
  vm.runInContext('var THREE_RRTP=function readRenderTargetPixels(gl){return gl.readPixels();};', ctx, { filename: 'capacitor://localhost/vendor/three.min.js' });
  /* le jeu : un appelant NOMMÉ qui passe par three, un appelant nommé direct, un rappel anonyme direct */
  vm.runInContext('function qlSonde(gl){return THREE_RRTP(gl);}\nfunction vignetteLis(gl){return gl.readPixels();}\nvar anonyme=function(gl){return gl.readPixels();};', ctx, { filename: 'capacitor://localhost/index.html' });
  return ctx;
};
{
  const ctx = monde(true), gl = new ctx.WebGL2RenderingContext();
  for (let i = 0; i < 3; i++) ctx.qlSonde(gl);
  ctx.vignetteLis(gl); ctx.vignetteLis(gl); ctx.anonyme(gl);
  const R = ctx.MGR, Y = {};
  for (let i = 0; i < R.yN.length; i++) if (R.yC[i]) Y[['gl ', '2d ', 'envoi '][R.yF[i]] + R.yN[i]] = [R.yC[i], +R.yMs[i].toFixed(2)];
  console.log('     c.Y : ' + JSON.stringify(Y));
  vrai(Y['gl readPixels'] && Y['gl readPixels'][0] === 6, '« gl readPixels » garde le TOTAL (6 appels) : les analyses d\'avant lisent toujours la même clé');
  vrai(Y['gl readPixels ← qlSonde l.1'] && Y['gl readPixels ← qlSonde l.1'][0] === 3, 'appelant à travers three.js : « qlSonde » (le cadre vendor/ sauté)');
  vrai(Y['gl readPixels ← vignetteLis l.2'] && Y['gl readPixels ← vignetteLis l.2'][0] === 2, 'appelant direct nommé : « vignetteLis »');
  vrai(Object.keys(Y).some(k => /^gl readPixels ← (anonyme )?l\.3$/.test(k)), 'rappel anonyme : sa ligne d\'index.html');
  const somme = Object.keys(Y).filter(k => k.startsWith('gl readPixels ← ')).reduce((s, k) => s + Y[k][1], 0);
  vrai(Math.abs(somme - Y['gl readPixels'][1]) < 1e-6, 'les étiquettes se partagent exactement les ms du total (' + somme.toFixed(2) + ' ms)');
  vrai(R.im[0] > 0 && R.imN[0] === 6, 'la famille « WebGL synchrones » n\'est comptée qu\'une fois (6 appels, pas 12)');
  /* 12 étiquettes au plus */
  const ctx2 = monde(true), gl2 = new ctx2.WebGL2RenderingContext();
  let src = ''; for (let i = 0; i < 20; i++) src += 'function appelant' + i + '(gl){return gl.readPixels();}\n';
  vm.runInContext(src + 'for(let i=0;i<20;i++)this["appelant"+i](G);', Object.assign(ctx2, { G: gl2 }), { filename: 'capacitor://localhost/index.html' });
  const n2 = ctx2.MGR.yN.filter(n => n.startsWith('readPixels ← ')).length;
  vrai(n2 === 13 && ctx2.MGR.yN.includes('readPixels ← autre'), '20 appelants : 12 étiquettes + « autre » (' + n2 + ' lignes)');
}
{ /* une pile JSC (WKWebView) : « nom@url:ligne:colonne », les cadres natifs « apply@[native code] » */
  const PILE = ['mgYQui@capacitor://localhost/index.html:40123:52', 'mgYParQui@capacitor://localhost/index.html:40130:20', '@capacitor://localhost/index.html:40118:160',
    'apply@[native code]', 'readRenderTargetPixels@capacitor://localhost/vendor/three.min.js:6:70031', 'qlSondeLis@capacitor://localhost/index.html:51234:88', 'loop@capacitor://localhost/index.html:60001:3'].join('\n');
  const EF = function () { this.stack = PILE; };
  const ctx = monde(true, EF);
  vrai(vm.runInContext('mgYQui()', ctx) === 'qlSondeLis l.51234', 'pile JSC : « qlSondeLis l.51234 » (enveloppe anonyme, cadre natif et three.js sautés)');
  const PILE2 = ['mgYQui@capacitor://localhost/index.html:1:1', 'mgYParQui@capacitor://localhost/index.html:2:1', '@capacitor://localhost/index.html:3:1', '@capacitor://localhost/index.html:777:9'].join('\n');
  const ctx3 = monde(true, function () { this.stack = PILE2; });
  vrai(vm.runInContext('mgYQui()', ctx3) === 'l.777', 'pile JSC, appelant anonyme : « l.777 »');
}
{
  const ctx = monde(false), gl = new ctx.WebGL2RenderingContext();
  ctx.qlSonde(gl); ctx.vignetteLis(gl);
  vrai(!ctx.MGR.yN.some(n => n.includes('←')), '?sans=sondecalme : aucune étiquette, l\'enveloppe d\'avant');
}

/* ---------- 3. les battements natifs horodatés ---------- */
console.log('3. battements natifs horodatés, G[51]');
const BAT = coupe(BV_SRC, 'const BVSW={t:-1,n:0};', 'set:function(x){v9=x;try{bvBat();}catch(e){}}});}catch(e){}');
const APRES = coupe(BV_SRC, 'MG.apres=function(t1){', '  c.G.push(r);};');
const bat = function (sdc) {
  let horloge = 0;
  const ctx = { SDCALME: sdc, MG: { on: true }, BV: { c: { M: [], G: [], GN: [], t0: 1000 } }, performance: { now: () => horloge } };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(BAT, ctx);
  Object.assign(ctx.MG, { cTopF: null, mqT: 0, dw: 0, mqW: 0, lAv: 0, lDur: 0, cGap: 0, cS: 0, cN: 0, cTop: 0, trAv: new Float64Array(8), tr: new Float64Array(8), mqPb: 0, nTO: 0, nIV: 0,
    bgT: 0, pivT: 0, cSaut: 0, mqD: 0, sen: false, mgt: false, pMax: -1, l0: 0 });
  Object.assign(ctx, { mgIdx: () => -1, mgNom: () => '', mgAc: () => 0, mgTas: () => -1, mgToile: () => [0, 0, 0, 0, 100], MGR: { on: false } });
  vm.runInContext(APRES, ctx);
  /* l'ancien script natif (« go ») puis le nouveau (« go:fond ») : la page les exécute à 2 100 et 3 100 ms */
  horloge = 2100; vm.runInContext('window.__ccSw=[0,51057,22];window.__ccSwN=1;', ctx);
  horloge = 3100; vm.runInContext('window.__ccSw=[0,-1,3,17,-1];window.__ccSwN=2;', ctx);
  const lu = vm.runInContext('window.__ccSwN|0', ctx); /* ce que lit mgRSec */
  /* un gel de 120 ms qui CONTIENT le 2e battement (de 3 020 à 3 140, loop finie à 3 150), puis un gel sans battement (4 400 → 4 520) */
  Object.assign(ctx.MG, { l0: 3140, dw: 120, mqT: 2.14 }); vm.runInContext('MG.apres(3150)', ctx);
  Object.assign(ctx.MG, { l0: 4520, dw: 120, mqT: 3.52 }); vm.runInContext('MG.apres(4530)', ctx);
  return { SW: ctx.BV.c.SW, lu, G: ctx.BV.c.G };
};
{
  const o = bat(true);
  console.log('     c.SW : ' + JSON.stringify(o.SW) + ' · G[51] : ' + o.G.map(g => g[51]).join(', ') + ' · largeur de G : ' + o.G[0].length);
  vrai(o.lu === 2, 'mgRSec lit toujours __ccSwN (2) à travers l\'accesseur');
  vrai(JSON.stringify(o.SW) === JSON.stringify([1100, 51057, 22, -1, -1, 2100, -1, 3, 17, -1]), 'c.SW : [ms depuis le départ, sentinelle, retard, attente du fil app, horloge] — l\'ancien battement sans attente (-1)');
  vrai(o.G[0].length === 52 && o.G[0][51] === 80, 'G[51] = 80 : le battement est arrivé 80 ms après le début du trou');
  vrai(o.G[1][51] === -1, 'G[51] = -1 : aucun battement dans le 2e trou');
  const s = bat(false);
  vrai(!s.SW && s.G[0].length === 51, '?sans=sondecalme : ni c.SW, ni G[51] (G garde ses 51 colonnes)');
}
console.log((ko ? 'ÉCHEC' : 'TOUT BON') + ' : ' + ok + ' ok, ' + ko + ' échec(s)');
process.exit(ko ? 1 : 0);
