/* LA TABLE DES MISSIONS, CONTRÔLÉE SANS NAVIGATEUR (2026-11-08, session « sortie du jeu », agent C).
   Lit code/missions/table.js tel quel (le tableau M2 est évalué dans un bac vm) et vérifie :
     · ids uniques, lisibles par san() (/^[a-z0-9]{2,12}$/ : sinon la mission réussie « saute » au rechargement et sa récompense se re-verse) ;
     · assez de place dans les listes bornées de la sauvegarde (ok/pr/mq/nv : 200 ; fl : 60) ;
     · chaque mission a un texte FR et EN, une famille connue, une récompense (cash|car|cat), un seuil > 0 ;
     · aucune caisse donnée deux fois (deux missions pour la MÊME caisse), aucune caisse inconnue de CARS ;
     · les missions de même mesure (k) ET même seuil : listées (deux récompenses d'un coup).
   node outils/banc-sauvegarde/table-missions.cjs        → dernière ligne TABLE OK / TABLE KO */
const fs = require('fs'), path = require('path'), vm = require('vm');
const RACINE = path.join(__dirname, '..', '..');
const lit = f => fs.readFileSync(path.join(RACINE, f), 'utf8');
const table = lit('code/missions/table.js');
const i0 = table.indexOf('const M2=['); if (i0 < 0) throw new Error('const M2=[ introuvable');
let d = 0, i = table.indexOf('[', i0), j = i;
for (; j < table.length; j++) { const ch = table[j];
  if (ch === '"' || ch === "'" || ch === '`') { for (j++; j < table.length && table[j] !== ch; j++) if (table[j] === '\\') j++; continue; }
  if (ch === '/' && table[j + 1] === '*') { j = table.indexOf('*/', j + 2) + 1; continue; }
  if (ch === '/' && table[j + 1] === '/') { j = table.indexOf('\n', j); continue; }
  if (ch === '[') d++; else if (ch === ']') { d--; if (!d) break; } }
const M2 = vm.runInNewContext('(' + table.slice(i, j + 1) + ')');
/* les noms de caisses */
const cars = lit('code/voitures/cars.js'); const NOMS = new Set([...cars.matchAll(/name:'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'")));
const KO = []; const ko = m => { KO.push(m); console.log('  KO  ' + m); }; const ok = m => console.log('  ok  ' + m);
const FAM = new Set(['exploit', 'collection', 'exploration', 'secret', 'argent', 'aura', 'moteur']);
const ids = new Map(); const car = new Map(); const mesure = new Map();
for (const m of M2) {
  if (ids.has(m.id)) ko('id en double : ' + m.id); ids.set(m.id, 1);
  if (!/^[a-z0-9]{2,12}$/.test(m.id)) ko('id refusé par san() : ' + m.id);
  if (!FAM.has(m.f)) ko(m.id + ' : famille inconnue ' + m.f);
  if (!m.t || !m.en) ko(m.id + ' : texte FR ou EN manquant');
  if (m.v !== 'tot' && m.v !== 'prof' && !(m.v > 0)) ko(m.id + ' : seuil ' + m.v);
  const r = m.r || {}; if (!(r.cash > 0 || r.car || r.cat || r.vide)) ko(m.id + ' : pas de récompense');
  if (r.car) { if (!NOMS.has(r.car)) ko(m.id + ' : caisse inconnue de CARS : ' + r.car); if (car.has(r.car)) ko('la caisse ' + r.car + ' est donnée par ' + car.get(r.car) + ' ET ' + m.id); car.set(r.car, m.id); }
  if (r.vide) ko(m.id + ' : récompense vide (jamais disponible)');
  const cle = m.k + '|' + m.v; (mesure.get(cle) || mesure.set(cle, []).get(cle)).push(m.id);
}
ok(M2.length + ' missions lues ; ids : ' + [...ids.keys()].length + ' uniques');
if (M2.length > 200) ko('plus de 200 missions : ok/pr/mq/nv (L9(…,200)) tronqueraient la sauvegarde'); else ok('place dans les listes de san() : ' + M2.length + ' ≤ 200');
if (M2.filter(m => m.f === 'secret' && m.k === 'flag').length > 60) ko('plus de 60 drapeaux (fl : L9(…,60))'); else ok('drapeaux ≤ 60');
for (const [k, L] of mesure) if (L.length > 1 && !/flag/.test(k)) console.log('  note  même mesure et même seuil : ' + k + ' → ' + L.join(' + ') + ' (réussies d\'un coup, deux récompenses)');
console.log(KO.length ? 'TABLE KO — ' + KO.length + ' défaut(s)' : 'TABLE OK');
process.exit(KO.length ? 1 : 0);
