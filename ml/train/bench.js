#!/usr/bin/env node
/* ================================================================================================
   BENCH.JS — LE HARNESS D'ÉVALUATION FIGÉE DES CHAMPIONS
   ------------------------------------------------------------------------------------------------
   Ce qu'on mesure, et POURQUOI tel que décidé (audit externe) :
     · métrique = t_arrivée si le bot FRANCHIT la ligne (b.finished), sinon s_dernier_contact(T) —
       qui est exactement b.totD (l'abscisse curviligne s, gelée en vol, créditée à l'atterrissage).
     · N=90 pistes à GRAINES FIXES (déterministes, affichées), une voiture seule, 45 s max à dt=1/60.
     · bruit du banc mesuré : σ≈907 (entre-pistes, intra-piste=0) ; appariement INUTILE (corr≈0 entre
       champions). On réduit donc le bruit en MOYENNANT sur beaucoup de pistes : σ_moy = σ/√N.
     · JAMAIS un max seul : toujours dispersion + n.

   Ce que ce script FAIT :
     1. Charger le jeu (headless) : loadGame('?train=1&sim=1'), T = __TRAIN.
     2. Lire results/champions/gen*.json (schéma plat, w à la racine) et N'ACCEPTER que ceux dont
        w.length === taille réseau COURANTE (MLP.SIZE, lu en constante ; 324 depuis le passage à
        BRAIN_IN=15). Les anciens champions (276 poids) sont écartés avec un message clair, sans crash.
     3. Évaluer K champions (arg positionnel ou autodétecté : tous compatibles, plafonné à 12) sur
        N pistes (--tracks, défaut 90), graines fixes 1..N × sel stable.
     4. Rapporter PAR CHAMPION : médiane et moyenne tronquée à 10 % de totD, écart-type, min/max,
        nombre de finishes et temps d'arrivée médian (si ≥1 finish). Un finisher est TOUJOURS classé
        devant tout non-finisher.
     5. Si K≥2 : comparaison APPARIÉE (mêmes graines pour tous) — différence de totD par piste,
        médiane de la différence, écart-type de la différence (n=N) — et le seuil de lisibilité
        D > ~2×σ_diff/√N.
   ================================================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const CHAMPIONS_DIR = path.join(__dirname, 'results', 'champions');
const DT = 1 / 60;              // pas de temps identique à la boucle de rendu réelle
const SEL = 7919;               // sel STABLE multipliant l'indice de piste : graines 1×SEL..N×SEL
const MAX_CHAMPIONS = 12;       // plafond de sécurité

// ---------- 1. Arguments ----------
function argNum(flag, def) {
  const i = process.argv.indexOf(flag);
  if (i > 0 && process.argv[i + 1] !== undefined) {
    const v = parseInt(process.argv[i + 1], 10);
    if (!isNaN(v) && v > 0) return v;
  }
  return def;
}
const N = argNum('--tracks', 90);                       // nombre de pistes fixes
let K = null;                                           // nombre de champions (défaut : tous compatibles)
for (let a = 2; a < process.argv.length; a++) {
  const v = parseInt(process.argv[a], 10);
  if (!isNaN(v) && v > 0 && process.argv[a] !== String(N) && !process.argv[a - 1].startsWith('--')) { K = v; break; }
}
const SEEDS = [];
for (let i = 1; i <= N; i++) SEEDS.push(i * SEL);
if (SEEDS[SEEDS.length - 1] > 0xffffffff) { console.error('Sel × N dépasse uint32 — choisir un sel plus petit.'); process.exit(1); }

// ---------- 2. Statistiques ----------
function moy(a) { const n = a.length; if (!n) return NaN; return a.reduce((s, x) => s + x, 0) / n; }
function ecartType(a) {
  const n = a.length; if (n < 2) return NaN;
  const m = moy(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (n - 1));
}
function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  const n = s.length; if (!n) return NaN;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
// Moyenne tronquée à 10 % (5 % retiré de chaque queue = 10 % au total).
function trimmedMean(a, pct) {
  const s = a.slice().sort((x, y) => x - y);
  const n = s.length;
  const k = Math.floor(n * (pct / 100) / 2);
  if (n - 2 * k <= 0) return moy(a);
  return moy(s.slice(k, n - k));
}
const fmt = (x) => (isNaN(x) ? 'n/a' : x.toFixed(1));

// ---------- 3. Chargement du jeu ----------
console.log('— chargement du jeu (headless)…');
const { loadGame } = require('./sim-env');
const g = loadGame('?train=1&sim=1');
const T = g.get('__TRAIN');
if (typeof T !== 'object' || !T.bots || !T.makeBot) {
  console.error('__TRAIN non initialisé (ou API absente) — abandon.');
  process.exit(1);
}

// Taille réseau COURANTE : ni `MLP` ni `BRAIN_IN` ne sont des globaux (le script de train.html est
// dans une IIFE, seul `__TRAIN` est exposé) et `T.bots` est vide au chargement (boot différé via
// microtâche). Lecture robuste de la CONSTANTE : un bot sonde `makeBot(null)` → MLP.random() porte
// exactement MLP.SIZE poids. (IN=15 → (15+1)*16 + (16+1)*4 = 324.)
let netSize = null;
try {
  const probe = T.makeBot(null);
  netSize = probe.brain.w.length;
} catch (e) { netSize = null; }
if (typeof netSize !== 'number' || netSize <= 0) {
  console.error('Impossible de lire la taille réseau courante (makeBot(null) a échoué) — abandon.');
  process.exit(1);
}
for (const req of ['reseed', 'startEval', 'botStep', 'makeBot']) {
  if (typeof T[req] !== 'function') {
    console.error('API manquante sur __TRAIN : T.' + req + " n'est pas une fonction — abandon.");
    process.exit(1);
  }
}
if (!(T.matchDuration > 0)) { console.error('T.matchDuration invalide — abandon.'); process.exit(1); }
console.log('  réseau courant : ' + netSize + ' poids (MLP.SIZE, lu via makeBot(null).brain.w.length)');

// ---------- 4. Lecture des champions (filtrage strict sur la taille réseau) ----------
function loadChampions() {
  if (!fs.existsSync(CHAMPIONS_DIR) || !fs.statSync(CHAMPIONS_DIR).isDirectory()) return [];
  const files = fs.readdirSync(CHAMPIONS_DIR).filter((f) => /^gen\d+-note\d+\.json$/.test(f)).sort();
  const champ = [], ecartes = [];
  for (const f of files) {
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(CHAMPIONS_DIR, f), 'utf8')); }
    catch (e) { console.error('  [IGNORÉ] ' + f + ' : JSON invalide (' + e.message + ')'); continue; }
    const w = j && j.w;
    if (!Array.isArray(w)) { ecartes.push(f + ' (w absent)'); continue; }
    if (w.length !== netSize) {
      ecartes.push(f + ' (w.length=' + w.length + ', attendu ' + netSize + ')');
      continue;
    }
    champ.push({ file: f, w, gen: j.gen, note: j.note, record: j.record, size: j.size });
  }
  return { champ, ecartes };
}
const { champ, ecartes } = loadChampions();
if (ecartes.length) {
  console.log('  ' + ecartes.length + ' champion(s) ÉCARTÉ(S) (tailles incompatibles — réseau passé de 276 à ' + netSize + ' poids) :');
  for (const e of ecartes) console.log('    · ' + e);
}
if (!champ.length) {
  console.log('\nAUCUN CHAMPION COMPATIBLE dans ' + CHAMPIONS_DIR + '.');
  console.log('Les ' + (ecartes.length || 0) + ' champions présents sont à ' +
    (ecartes.length ? '(voir liste ci-dessus : surtout 276 poids)' : '0') + ', alors que le réseau courant fait ' +
    netSize + ' poids. Rien à évaluer — sortie propre, aucune donnée inventée.');
  process.exit(0);
}
champ.sort((a, b) => (b.note - a.note) || (b.gen - a.gen));   // meilleurs d'abord (champ `note`)
const nbCompatibles = champ.length;
const kEval = Math.min(K !== null ? K : nbCompatibles, MAX_CHAMPIONS, nbCompatibles);
if (K !== null && K > kEval) console.log('  K=' + K + ' demandé mais ' + nbCompatibles + ' compatible(s) (plafond ' + MAX_CHAMPIONS + ') → évalués : ' + kEval);
const selected = champ.slice(0, kEval);
console.log('\nRéseau ' + netSize + ' poids · ' + nbCompatibles + ' champion(s) compatible(s) · évalués : ' + kEval +
  ' · pistes : N=' + N + ' · sel=' + SEL + ' (graines ' + SEEDS[0] + '…' + SEEDS[SEEDS.length - 1] + ')');

// ---------- 5. Évaluation d'un seul cerveau figé sur une graine ----------
// PROTOCOLE (identique à xp-bruit-banc.js, API validée) : startEval() ne prend PAS de graine —
// elle tire son circuit via T.rnd(), déterministe juste après T.reseed(). On remplace T.bots par
// [un seul bot] avant startEval (qui réinitialise TOUS les bots via resetBot).
function evalOne(weights, seed) {
  T.reseed(seed);
  const bot = T.makeBot(weights);
  T.bots = [bot];
  T.startEval();
  let t = 0;
  while (bot.alive && t < T.matchDuration) { T.botStep(bot, DT); t += DT; }
  return { totD: bot.totD, finished: !!bot.finished, finishT: bot.finishT };
}

// ---------- 6. Boucle d'évaluation ----------
console.log('\nÉvaluation de chaque champion sur ' + N + ' pistes aux graines fixes…');
const results = [];   // un objet par champion
for (let c = 0; c < selected.length; c++) {
  const ch = selected[c];
  const totDs = new Array(N), finishTs = [];
  let nFin = 0;
  const perTrack = new Array(N);
  for (let i = 0; i < N; i++) {
    const r = evalOne(ch.w, SEEDS[i]);
    perTrack[i] = r;
    totDs[i] = r.totD;
    if (r.finished) { nFin++; finishTs.push(r.finishT); }
  }
  results.push({ file: ch.file, gen: ch.gen, note: ch.note, record: ch.record, totDs, perTrack, nFin, finishTs });
  const med = median(totDs), tm = trimmedMean(totDs, 10), sd = ecartType(totDs);
  const mn = Math.min(...totDs), mx = Math.max(...totDs);
  console.log('\n=== CHAMP ' + results.length + '/' + kEval + ' : ' + ch.file + ' ===');
  console.log('  gen=' + ch.gen + '  note(stockée)=' + ch.note + '  record=' + ch.record + '  w.length=' + ch.w.length);
  console.log('  totD sur N=' + N + ' pistes :');
  console.log('    médiane            : ' + fmt(med) +
    '    moyenne tronquée 10 % : ' + fmt(tm));
  console.log('    écart-type (n-1)   : ' + fmt(sd) +
    '    min : ' + fmt(mn) + '    max : ' + fmt(mx) + '    étendue : ' + fmt(mx - mn));
  console.log('    finishes           : ' + nFin + '/' + N +
    (nFin ? ('    t_arrivée médian : ' + fmt(median(finishTs)) + ' s') : '    (aucune arrivée : totD seul parle)'));
  console.log('    σ_moy = σ/√N = ' + fmt(sd / Math.sqrt(N)) + '  (bruit du banc divisé par la racine du nombre de pistes)');
}

// ---------- 7. Comparaison appariée (mêmes graines pour tous) ----------
if (kEval >= 2) {
  console.log('\n════════════════════ COMPARAISON APPARIÉE ════════════════════');
  console.log('(mêmes graines pour tous les champions — différence de totD PISTE PAR PISTE)');
  for (let a = 0; a < kEval; a++) {
    for (let b = a + 1; b < kEval; b++) {
      const A = results[a], B = results[b];
      const diffs = new Array(N);
      let Awin = 0, Bwin = 0, tie = 0;
      for (let i = 0; i < N; i++) {
        // règle d'ordre TOTALE par piste : un finisher bat TOUJOURS un non-finisher ;
        // entre deux finishers, le plus rapide gagne ; entre deux non-finishers, le totD le plus grand gagne.
        const pa = A.perTrack[i], pb = B.perTrack[i];
        diffs[i] = pa.totD - pb.totD;
        let cmp;
        if (pa.finished !== pb.finished) cmp = pa.finished ? 1 : -1;      // finisher > non-finisher
        else if (pa.finished) cmp = (pb.finishT - pa.finishT);            // plus petit t_arrivée gagne
        else cmp = diffs[i];                                              // plus grand totD gagne
        if (cmp > 0) Awin++; else if (cmp < 0) Bwin++; else tie++;
      }
      const dMed = median(diffs), dSd = ecartType(diffs);
      const seuil = 2 * dSd / Math.sqrt(N);
      const nomA = A.file.replace(/\.json$/, ''), nomB = B.file.replace(/\.json$/, '');
      console.log('\n' + nomA + '  vs  ' + nomB);
      console.log('  ΔtotD par piste (A−B), n=' + N + ' :');
      console.log('    médiane Δ : ' + fmt(dMed) + '    écart-type Δ : ' + fmt(dSd));
      console.log('  verdict par piste : ' + nomA + ' gagne ' + Awin + ', ' + nomB + ' gagne ' + Bwin + ', égalité ' + tie);
      console.log('  lisibilité : un écart de D points est lisible si D > ~2×σ_Δ/√N = ' + fmt(seuil) +
        '. Ici Δ médian=' + fmt(dMed) + ' → ' + (Math.abs(dMed) > seuil ? 'DISTINGUABLE' : 'NON distinguable du bruit'));
    }
  }
} else {
  console.log('\n(K=' + kEval + ' < 2 : pas de comparaison appariée possible.)');
}

console.log('\nBENCH TERMINÉ');
process.exit(0);