#!/usr/bin/env node
/* PREUVE — UNE VALEUR NON FINIE DANS LE SON NE FAIT PLUS TOMBER LA BOUCLE (2026-11-05, DEBUG-TOTAL)
   usage : node passation/preuves/preuve-son-nonfini.cjs <index.html corrigé> [index.html ancien]
   Le VRAI `stt` est lu dans le fichier et exécuté avec un AudioParam factice qui fait comme les navigateurs : `setTargetAtTime`
   LÈVE une TypeError sur NaN / ±Infinity. On vérifie aussi que les sons continus de la boucle ont LEUR try (boucle-5-sons)
   et que `duckT` empoisonné par un NaN se répare tout seul. Dernière ligne : PREUVE OK / PREUVE KO. */
'use strict';
const fs = require('fs');
function essai(chemin) {
  const src = fs.readFileSync(chemin, 'utf8'), r = {};
  const m = /function stt\(p,v,t,tc\)\{[\s\S]*?\n\}/.exec(src);
  if (!m) return { err: 'stt introuvable' };
  const pannes = [];
  const f = new Function('AC', 'sonPanne', m[0] + '\nreturn stt;')({ state: 'running', currentTime: 1 }, function (n) { pannes.push(n); });
  const param = { value: 0, setTargetAtTime(v, t, tc) { if (!isFinite(v) || !isFinite(t) || !isFinite(tc)) throw new TypeError("Failed to execute 'setTargetAtTime' on 'AudioParam': The provided float value is non-finite."); this.value = v; } };
  r.lance = 0;
  for (const v of [NaN, Infinity, -Infinity]) { try { f(param, v, 1, .05); } catch (e) { r.lance++; } }
  try { f(param, .5, 1, .05); r.normal = param.value === .5; } catch (e) { r.normal = false; }
  try { f(param, .7, NaN, .05); } catch (e) { r.lance++; }
  r.pannes = pannes.length;
  r.boucleTry = /try\{if\(AC\)\{[^\n]*\n[\s\S]{0,400}const spd3=speedKmh;/.test(src) && /\}\}catch\(e\)\{sonPanne\('sons continus \(boucle\)',e\);\}/.test(src);
  const d = /\n *(if\(duckT>0\)duckT=[^\n;]*;[^\n]*?)(?= *\/\/|\n)/.exec(src);
  if (d) { let duckT = NaN; const dt = .016; try { new Function('duckT', 'dt', d[1].replace(/\/\*[\s\S]*?\*\//g, '') + ';return duckT;'); duckT = new Function('duckT', 'dt', d[1].replace(/\/\*[\s\S]*?\*\//g, '') + ';return duckT;')(NaN, dt); } catch (e) { duckT = 'err ' + e.message; } r.duckRepare = duckT === 0; }
  return r;
}
const [neuf, vieux] = process.argv.slice(2);
if (!neuf) { console.log('usage : node preuve-son-nonfini.cjs <index.html corrigé> [ancien]'); process.exit(2); }
const N = essai(neuf); console.log('corrigé :', JSON.stringify(N));
if (vieux) console.log('ancien  :', JSON.stringify(essai(vieux)));
const ok = N.lance === 0 && N.normal && N.boucleTry && N.duckRepare;
console.log(ok ? 'PREUVE OK' : 'PREUVE KO'); process.exit(ok ? 0 : 1);
