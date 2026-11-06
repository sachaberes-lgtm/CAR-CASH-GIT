#!/usr/bin/env node
/* PREUVE — UNE RESTAURATION PAR CODE ÉCRIT VRAIMENT LA SAUVEGARDE (2026-11-05, DEBUG-TOTAL)
   usage : node passation/preuves/preuve-import-onglet.cjs <dossier code/ corrigé> [dossier code/ ancien]
   Le VRAI bloc SAVE de code/sauvegarde.js (avec les vraies tables CARS, CAR_UNLOCK, HAB_RETIRES, PEINT_FUSION, m2Vierge, gagneAjoute) tourne dans un vm.
   Cas 1 : l'onglet est devenu PASSIF (un autre onglet du site a la main : SAVE.flush neutralisé, garage-menu-inventaire) — on importe un code :
   si import() dit vrai, le stockage DOIT contenir la sauvegarde importée. Cas 2 : un id d'habillage du prototype (« constructor ») ne devient
   jamais une fonction. Dernière ligne : PREUVE OK / PREUVE KO. */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
function grab(t, start, o, c) { const i = t.indexOf(start); if (i < 0) throw new Error('introuvable : ' + start); let d = 0;
  for (let p = i + start.length - 1; p < t.length; p++) { const ch = t[p];
    if (ch === '/' && t[p + 1] === '/') { p = t.indexOf('\n', p); continue; }
    if (ch === '/' && t[p + 1] === '*') { p = t.indexOf('*/', p) + 1; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { p++; while (t[p] !== ch) { if (t[p] === '\\') p++; p++; } continue; }
    if (ch === o) d++; else if (ch === c) { d--; if (d === 0) return t.slice(i, p + 1); } } }
function essai(dir) {
  const rd = f => fs.readFileSync(path.join(dir, f), 'utf8');
  const sv = rd('sauvegarde.js'), bloc = sv.slice(sv.indexOf('const SAVE={'), sv.indexOf('\nSAVE.load();') + 1);
  const cars = rd('voitures/cars.js'), dbl = rd('voitures/deblocage.js'), bt = rd('economie/boutique.js'), dm = rd('missions/defis-moteur.js');
  const pre = [grab(cars, 'const CARS=[', '[', ']'), grab(dbl, 'const CAR_UNLOCK=[', '[', ']'), grab(bt, 'const HAB_RETIRES={', '{', '}'), grab(bt, 'const PEINT_FUSION={', '{', '}'),
    grab(dm, 'function m2Vierge(){', '{', '}'), grab(dm, 'function gagneAjoute(x){', '{', '}')].join(';\n');
  const stubs = 'const THREE={MathUtils:{clamp:(x,a,b)=>Math.min(b,Math.max(a,x))}};const PAL={b:(k,d)=>d||0};const ALLEGE=true;const ECO3={gain:.25};const ENGINE_TIERS=new Array(30).fill(0);' +
    'function carRetiree(i){const c=CARS[i];return !!(c&&c.retire);}function carOwned(i){return !!(SAVE.d.owned&&SAVE.d.owned.indexOf(i)>=0);}function m2Etat(){}\n';
  const ls = {};
  const sb = { localStorage: ls, location: { search: '' }, Date, Math, JSON, console: { warn() {}, log() {} }, isFinite, unescape, escape, encodeURIComponent, decodeURIComponent,
    btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary') };
  sb.window = sb; vm.createContext(sb); vm.runInContext(stubs + pre + ';\n' + bloc + ';this.SAVE=SAVE;', sb);
  const SAVE = sb.SAVE; SAVE.load();
  ls.cashcarSave = JSON.stringify(Object.assign({}, SAVE.d, { bank: 5 }));
  SAVE.flush = function () {}; SAVE.mark = function () {};                       // l'onglet passif (garage-menu-inventaire : ONGLET.passif)
  const code = Buffer.from(JSON.stringify({ v: 2, bank: 777777, owned: [0] }), 'binary').toString('base64');
  const dit = SAVE.import(code); let ecrit = null; try { ecrit = JSON.parse(ls.cashcarSave).bank; } catch (e) {}
  const r = { importDit: dit, banqueEcrite: ecrit, cas1: dit === (ecrit === 777777) };
  const c2 = SAVE.san({ v: 2, shop: { own: ['peinture:constructor', 'peinture:toString'], eq: { peinture: 'constructor' } } });
  r.cas2 = c2.shop.own.every(k => !/function|\[native/.test(k)) && typeof c2.shop.eq.peinture === 'string';
  r.ok = r.cas1 && r.cas2; return r;
}
const [neuf, vieux] = process.argv.slice(2);
if (!neuf) { console.log('usage : node preuve-import-onglet.cjs <dossier code/ corrigé> [dossier code/ ancien]'); process.exit(2); }
const N = essai(neuf); console.log('corrigé :', JSON.stringify(N));
if (vieux) { try { console.log('ancien  :', JSON.stringify(essai(vieux))); } catch (e) { console.log('ancien  : ERREUR', e.message); } }
console.log(N.ok ? 'PREUVE OK' : 'PREUVE KO'); process.exit(N.ok ? 0 : 1);
