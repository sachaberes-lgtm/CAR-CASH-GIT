#!/usr/bin/env node
/* ================================================================================================
   xp-bruit-banc.js — COMBIEN VAUT LE BRUIT DU BANC D'ÉVALUATION ?
   ------------------------------------------------------------------------------------------------
   CONTEXTE : on compare des configurations dont les notes diffèrent de quelques centaines de
   points, sans savoir si le banc lui-même varie de plus que ça. Une mesure sans son bruit ne
   veut rien dire. Ce script mesure ce bruit : le MÊME cerveau (figé, inchangé) est évalué 20 fois
   sur 20 circuits tirés au hasard, et on rapporte la dispersion des notes obtenues.

   PROTOCOLE (aucun poids de fitness n'est touché — on ne fait que LIRE T.fitness) :
     1. Charger le MEILLEUR champion réel depuis results/champions/gen*.json : celui dont le champ
        `note` est le plus élevé (record affiché aussi à titre informatif). results/champion.json
        est EXPLICITEMENT exclu (faux témoin connu : gen 1234, note 99999, poids sin(i*0.7)*0.5).
        Schéma PLAT des vrais champions : w à la racine, clés v,in,hid,out,size,gen,note,record,
        date ; w.length === 276.
     2. Charger le jeu : loadGame('?train=1&sim=1') puis T = __TRAIN.
     3. Évaluer ce MÊME cerveau (frozen, jamais muté) sur 20 circuits aléatoires (graines fixes
        choisies et affichées ci-dessous), un circuit à la fois, une voiture seule, 45 s simulées
        à dt = 1/60. Note = T.fitness(bot).
     4. Rapporter moyenne, écart-type (n-1), médiane, min, max, étendue — n=20.
     5. Conclure : un écart de N points entre deux configurations est-il distinguable du bruit.

   ADAPTATIONS PAR RAPPORT À LA CONSIGNE (vérifiées en lisant train.html et sim-env.js AVANT
   d'écrire — aucune n'a nécessité de contournement, même schéma que xp-vitesse.js qui a déjà
   validé cette API) :
     - T.reseed, T.startEval, T.botStep, T.fitness, T.makeBot, T.matchDuration existent tels quels.
     - T.startEval() ne prend PAS de graine : elle tire son circuit via T.rnd() (déterministe si on
       vient de reseed). On appelle donc T.reseed(graine) juste AVANT T.startEval().
     - T.startEval() réinitialise TOUS les bots : on remplace T.bots par [un seul bot] avant chaque
       appel, pour n'évaluer que le champion, une voiture seule.
     - À la mort T.kill fige bot.fitness ; on utilise quand même T.fitness(bot) dans tous les cas
       pour rester cohérent avec le calcul de sélection réel.
   ================================================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const CHAMPIONS_DIR = path.join(__dirname, 'results', 'champions');
const CHAMPION_JSON_EXCLU = path.join(__dirname, 'results', 'champion.json');
const N = 20;                 // nombre de circuits aléatoires
const DT = 1 / 60;            // pas de temps identique à la boucle de rendu réelle
// 20 graines fixes, choisies explicitement et affichées : elles déterminent les 20 circuits.
const SEEDS = [101, 202, 303, 404, 505, 606, 707, 808, 909, 1010,
               1111, 1212, 1313, 1414, 1515, 1616, 1717, 1818, 1919, 2020];

// ---------- 1. Trouver le MEILLEUR champion réel (max du champ `note`) ----------
function findBestChampion() {
  if (!fs.existsSync(CHAMPIONS_DIR) || !fs.statSync(CHAMPIONS_DIR).isDirectory()) return null;
  const files = fs.readdirSync(CHAMPIONS_DIR)
    .filter(f => /^gen\d+-note\d+\.json$/.test(f));
  let best = null;
  for (const f of files) {
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(CHAMPIONS_DIR, f), 'utf8')); }
    catch (e) { console.error('  [ignoré] ' + f + ' : JSON invalide (' + e.message + ')'); continue; }
    const w = j && j.w;
    if (!Array.isArray(w) || w.length !== 276) {
      console.error('  [ignoré] ' + f + ' : w absent ou de longueur ' + (w && w.length) + ' (attendu 276)');
      continue;
    }
    const note = j.note, record = j.record;
    // Sélecteur : le champ `note` le plus élevé (record affiché à titre informatif).
    if (!best || note > best.note) best = { file: f, w, gen: j.gen, note, record };
  }
  return best;
}

const best = findBestChampion();
if (!best) {
  console.log('AUCUN champion réel trouvé dans ' + CHAMPIONS_DIR + ' — impossible de mesurer.');
  console.log('(Glob attendu : gen*-note*.json avec w.length === 276. ' + CHAMPION_JSON_EXCLU +
    ' est EXCLU : faux témoin gen 1234 / note 99999.)');
  process.exit(1);
}
console.log('MEILLEUR CHAMPION : ' + best.file);
console.log('  gen=' + best.gen + '  note=' + best.note + '  record=' + best.record +
  '  w.length=' + best.w.length);

// ---------- 2. Chargement du jeu headless ----------
const { loadGame } = require('./sim-env');
const g = loadGame('?train=1&sim=1');
const T = g.get('__TRAIN');
for (const req of ['reseed', 'startEval', 'botStep', 'fitness', 'makeBot']) {
  if (typeof T[req] !== 'function') {
    console.error('API manquante sur __TRAIN : T.' + req + ' n\'est pas une fonction.');
    console.error('Le script ne peut pas continuer sans inventer un contournement — abandon.');
    process.exit(1);
  }
}
if (!(T.matchDuration > 0)) {
  console.error('T.matchDuration manquant ou invalide — abandon.');
  process.exit(1);
}

// ---------- 3. Évaluer le MÊME cerveau figé sur une graine ----------
function evalOne(weights, seed) {
  T.reseed(seed);                 // RNG mulberry32 réinitialisé : circuit déterministe par graine
  const bot = T.makeBot(weights); // UNE voiture seule portant les poids figés du champion
  T.bots = [bot];                 // startEval() ne doit toucher QUE ce bot
  T.startEval();                  // tire le circuit via T.rnd() (déterministe après reseed)

  let t = 0;
  while (bot.alive && t < T.matchDuration) {
    T.botStep(bot, DT);
    t += DT;
  }
  return T.fitness(bot);          // cohérent avec le calcul de sélection réel
}

// ---------- 4. Boucle : 20 circuits, un cerveau inchangé ----------
console.log('\nÉvaluation du cerveau FROZEN sur ' + N + ' circuits (graines : ' + SEEDS.join(', ') + ')');
const notes = [];
for (let i = 0; i < N; i++) {
  const note = evalOne(best.w, SEEDS[i]);
  notes.push(note);
  console.log('  circuit ' + String(i + 1).padStart(2, '0') + ' (graine ' + SEEDS[i] + ') : note = ' + note.toFixed(1));
}

// ---------- 5. Statistiques ----------
function moyenne(a) { return a.reduce((s, x) => s + x, 0) / a.length; }
function ecartType(a) {
  const m = moyenne(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1));
}
function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
const moy = moyenne(notes);
const sd = ecartType(notes);
const med = median(notes);
const mn = Math.min(...notes);
const mx = Math.max(...notes);
const etendue = mx - mn;

console.log('\n=== BRUIT DU BANC (n=' + N + ', un seul cerveau figé) ===');
console.log('moyenne   : ' + moy.toFixed(1));
console.log('écart-type: ' + sd.toFixed(1));
console.log('médiane   : ' + med.toFixed(1));
console.log('min       : ' + mn.toFixed(1));
console.log('max       : ' + mx.toFixed(1));
console.log('étendue   : ' + etendue.toFixed(1));

// ---------- 6. Conclusion ----------
console.log('\n=== CONCLUSION ===');
// Le bruit de référence est l'écart-type des notes du MÊME cerveau sur circuits différents.
// Un écart de N points entre deux configurations n'est distinguable du bruit que s'il dépasse
// nettement cet écart-type (référence usuelle : ~2× écart-type pour une confiance raisonnable).
console.log('Écart-type de référence (bruit du banc) = ' + sd.toFixed(1) + ' points.');
console.log('Un écart de N points entre deux configurations est distinguable du bruit à partir de');
console.log('N ≈ 2 × écart-type = ' + (2 * sd).toFixed(1) + ' points (seuil de confiance raisonnable, ' +
  'l\'étendue complète du bruit étant de ' + etendue.toFixed(1) + ' points).');
console.log('En dessous de ce seuil, deux configurations dont les notes diffèrent de quelques');
console.log('centaines de points ne sont PAS séparables du hasard du tirage des circuits.');

// Le chargement du jeu installe des setInterval qui maintiennent le process en vie ;
// les résultats sont déjà complets ci-dessus : on force la sortie.
process.exit(0);
