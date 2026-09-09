#!/usr/bin/env node
/* ================================================================================================
   xp-vitesse.js — LA NOTE SÉLECTIONNE-T-ELLE LES VOITURES LES PLUS RAPIDES ?
   ------------------------------------------------------------------------------------------------
   CONTEXTE (voir train.html, TRAIN.fitness, ligne ~12912) :
     note = totD + W_CUT*cutGain + W_CTRL*ctrl - W_OUT*outs (+ bonus d'arrivée, jamais atteint en
            pratique aujourd'hui). Personne n'a vérifié que cette note va dans le même sens que la
            VITESSE, alors que l'objectif réel du projet est « le bot le plus rapide possible ».
     Ce script NE CHANGE AUCUN poids de la fonction de fitness. Il se contente de la LIRE
     (T.fitness(bot)) et de mesurer, à côté, des grandeurs de vitesse indépendantes.

   PROTOCOLE :
     1. Charge jusqu'à 12 champions DISTINCTS depuis ml/train/results/champions/gen*.json
        (schéma PLAT : clés v,in,hid,out,size,gen,note,record,date,w — les poids sont à la racine
        `w`, PAS sous `j.champion.w`). results/champion.json est EXPLICITEMENT exclu : c'est un faux
        cerveau de test connu (gen 1234, note 99999, poids sin(i*0.7)*0.5) — pas un vrai champion.
        S'il n'y a AUCUN fichier gen*.json exploitable (w.length===276), le script le dit clairement
        et s'arrête (pas d'invention de repli).
     2. Pour chaque champion, sur les 5 MÊMES graines fixes (mêmes circuits pour tout le monde) :
          T.reseed(graine) ; on remplace T.bots par UN SEUL bot portant les poids du champion ;
          T.startEval() (tire le circuit via T.rnd() — déterministe puisqu'on vient de reseed) ;
          on boucle T.botStep(bot, 1/60) jusqu'à mort du bot ou 45 s simulées (T.matchDuration).
        On mesure : note (T.fitness), distance seule (bot.totD), vitesse moyenne sur l'épisode
        (totD / temps écoulé), temps pour atteindre 1500 m (ou "jamais atteint"), centrage
        accumulé (bot.ctrl) et sa part en % dans la note.
     3. Sortie : tableau 12 (ou moins) champions × mesures, moyenne + dispersion (écart-type et
        étendue) sur les 5 circuits ; corrélation de rang de Spearman (implémentée à la main, sans
        dépendance) entre la note et chacune des 3 mesures de vitesse ; part médiane du centrage
        dans la note ; une conclusion oui/non/insuffisant pour conclure.

   ADAPTATIONS PAR RAPPORT AUX HYPOTHÈSES DE DÉPART DE LA CONSIGNE (vérifiées en lisant train.html
   et sim-env.js AVANT d'écrire ce script — aucune n'a nécessité de contournement) :
     - T.reseed, T.startEval, T.botStep, T.fitness, bot.totD, bot.ctrl, T.W_CTRL, T.matchDuration
       existent tels quels (train.html lignes 12542, 12974, 12654, 12912, 12690, 12696, 12908,
       12509).
     - T.startEval() ne prend PAS de graine en paramètre : elle tire son propre TRAIN.seed via
       TRAIN.rnd() puis buildTrack(seed). Pour obtenir un circuit reproductible et IDENTIQUE entre
       champions, on appelle T.reseed(graine) juste AVANT T.startEval() (même schéma que
       sim-train.js ligne 50). Comme reseed() réinitialise le générateur mulberry32, le premier
       tirage de TRAIN.rnd() dans startEval() — donc le circuit — est le même pour tout le monde.
     - T.startEval() réinitialise TOUS les bots de TRAIN.bots (boucle interne resetBot). On ne veut
       évaluer qu'UN champion à la fois : on remplace donc TRAIN.bots par un tableau à un seul
       élément (T.makeBot(poids)) avant chaque appel à startEval(), au lieu de laisser la population
       de 24 bots aléatoires s'y mélanger.
     - MLP.SIZE = (BRAIN_IN+1)*16 + (16+1)*4 = 13*16 + 17*4 = 276 (BRAIN_IN=12, ligne 9259) :
       confirme les 276 poids annoncés dans la consigne — on n'accepte que w.length===276.
     - Le bonus d'arrivée n'a jamais été observé dans les runs connus ; le script ne le suppose pas
       atteint et se contente de rapporter "jamais atteint" quand c'est le cas.
   ================================================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const CHAMPIONS_DIR = path.join(__dirname, 'results', 'champions');
const FAUX_TEMOIN = path.join(__dirname, 'results', 'champion.json');
// Pas de plafond de champions : on charge TOUS les gen*.json valides afin que la corrélation
// note↔vitesse couvre la PLAGE COMPLÈTE des notes (gen10 -10..4484 ET gen20 ..6630), et non les
// seuls 12 premiers fichiers du glob (qui, triés alphabétiquement, étaient tous des gen00010).
const SEEDS = [1001, 2002, 3003, 4004, 5005]; // 5 graines fixes, identiques pour tous les champions
const DT = 1 / 60;
const DIST_CIBLE = 1500; // mètres, pour le "temps pour parcourir 1500 m"
const W_EXPECTED = 276; // MLP.SIZE — on n'accepte que des cerveaux à 276 poids (vrai champion)

// ---------- 1. Recherche des fichiers de champions ----------
function findChampionFiles() {
  if (!fs.existsSync(CHAMPIONS_DIR) || !fs.statSync(CHAMPIONS_DIR).isDirectory()) return [];
  const files = fs.readdirSync(CHAMPIONS_DIR)
    .filter(f => /^gen.*\.json$/.test(f))
    .sort();
  return files.map(f => path.join(CHAMPIONS_DIR, f));
}

function loadChampions() {
  const files = findChampionFiles();
  const champions = [];
  const seenWeightKeys = new Set();
  for (const f of files) {
    // Le faux témoin results/champion.json (gen 1234, note 99999, poids sin(i*0.7)*0.5) vit dans
    // results/ (pas results/champions/), donc le glob gen*.json ne le ramasse jamais. On l'écarte
    // quand même explicitement par sécurité au cas où il serait déplacé ici.
    if (path.resolve(f) === path.resolve(FAUX_TEMOIN)) continue;
    let j;
    try { j = JSON.parse(fs.readFileSync(f, 'utf8')); }
    catch (e) { console.error('  [ignoré] ' + f + ' : JSON invalide (' + e.message + ')'); continue; }
    // SCHÉMA PLAT : les poids sont à la racine `w`, PAS sous `j.champion.w`.
    const w = j && j.w;
    if (!Array.isArray(w) || w.length !== W_EXPECTED) {
      console.error('  [ignoré] ' + f + ' : w absent ou longueur != ' + W_EXPECTED +
        ' (' + (Array.isArray(w) ? w.length : 'n/a') + ')');
      continue;
    }
    // Déduplication par empreinte des poids (mêmes 276 nombres = même champion, même si le
    // checkpoint a été réécrit deux fois).
    const key = w.length + ':' + w.slice(0, 8).map(x => (+x).toFixed(6)).join(',');
    if (seenWeightKeys.has(key)) continue;
    seenWeightKeys.add(key);
    champions.push({
      file: f, w: w,
      gen: (j.gen !== undefined) ? j.gen : null,
      note: (j.note !== undefined) ? j.note : null,
      record: (j.record !== undefined) ? j.record : null,
    });
  }
  // Tri par note DÉCROISSANTE pour un affichage lisible du meilleur au moins bon ; les notes
  // manquantes (null) partent en fin de liste, elles ne sont de toute façon pas observées ici.
  champions.sort((a, b) => (b.note === null ? -Infinity : b.note) - (a.note === null ? -Infinity : a.note));
  return champions;
}

const champions = loadChampions();

if (champions.length === 0) {
  console.log('AUCUN champion exploitable trouvé dans ml/train/results/champions/ — impossible de mesurer.');
  console.log('Dossier recherché : ' + CHAMPIONS_DIR + ' (glob attendu : gen*.json, schéma plat avec w à la racine, w.length=' + W_EXPECTED + ').');
  console.log('Note pour mémoire : ' + FAUX_TEMOIN + ' existe peut-être mais est EXCLU de cette');
  console.log('recherche — c\'est un faux cerveau de test connu (gen 1234, note 99999, poids');
  console.log('sin(i*0.7)*0.5), pas un champion entraîné. Il ne remplace pas un vrai gen*.json.');
  process.exit(1);
}

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

// ---------- 3. Évaluation d'un champion sur une graine ----------
// Retourne les mesures d'un seul épisode (un champion, un circuit).
function evalOne(weights, seed) {
  T.reseed(seed);                 // réinitialise le RNG mulberry32 : premier tirage déterministe
  const bot = T.makeBot(weights); // un seul bot pour cette mesure
  T.bots = [bot];                 // startEval() ne doit toucher QUE ce bot, pas 24 aléatoires
  T.startEval();                  // tire le circuit via T.rnd() (déterministe car on vient de reseed)

  let t = 0;
  let tempsAtteint1500 = null;
  while (bot.alive && t < T.matchDuration) {
    T.botStep(bot, DT);
    t += DT;
    if (tempsAtteint1500 === null && bot.totD >= DIST_CIBLE) tempsAtteint1500 = t;
  }
  // T.kill() fige déjà bot.fitness à la mort ; s'il a survécu au temps imparti sans mourir,
  // bot.fitness n'a pas été figé par T.kill — on utilise T.fitness(bot) directement dans tous
  // les cas pour rester cohérent avec le calcul de sélection réel.
  const note = T.fitness(bot);
  const distance = bot.totD;
  const vitesseMoyenne = t > 0 ? distance / t : 0; // m/s, moyenne sur tout l'épisode (arrêts inclus)
  const ctrl = bot.ctrl || 0;
  const partCtrlPct = note !== 0 ? (100 * (T.W_CTRL * ctrl) / note) : null;

  return { note, distance, vitesseMoyenne, tempsAtteint1500, ctrl, partCtrlPct, dureeEpisode: t };
}

// ---------- 4. Boucle championne × graine ----------
console.log('Graines utilisées (identiques pour tous les champions) : ' + SEEDS.join(', '));
console.log(champions.length + ' champion(s) trouvé(s) dans ' + CHAMPIONS_DIR + '.\n');

const parChampion = []; // { file, gen, note, record, episodes:[...], agg:{...} }
for (const champ of champions) {
  const episodes = [];
  for (const seed of SEEDS) {
    try {
      episodes.push(evalOne(champ.w, seed));
    } catch (e) {
      console.error('ERREUR pendant l\'évaluation de ' + champ.file + ' (graine ' + seed + ') : ' + e.message);
      console.error(e.stack);
      process.exit(1);
    }
  }
  parChampion.push({ file: champ.file, gen: champ.gen, note: champ.note, record: champ.record, episodes });
}

// ---------- 5. Statistiques : moyenne, écart-type, étendue ----------
function moyenne(a) { return a.reduce((s, x) => s + x, 0) / a.length; }
function ecartType(a) {
  if (a.length < 2) return null;
  const m = moyenne(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1));
}
function etendue(a) { return [Math.min(...a), Math.max(...a)]; }
function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  const n = s.length;
  if (n === 0) return null;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

for (const c of parChampion) {
  const note = c.episodes.map(e => e.note);
  const dist = c.episodes.map(e => e.distance);
  const vit = c.episodes.map(e => e.vitesseMoyenne);
  const ctrl = c.episodes.map(e => e.ctrl);
  const partCtrl = c.episodes.map(e => e.partCtrlPct).filter(x => x !== null);
  const t1500Vals = c.episodes.map(e => e.tempsAtteint1500).filter(x => x !== null);
  c.agg = {
    note: { moy: moyenne(note), sd: ecartType(note), etendue: etendue(note), n: note.length },
    distance: { moy: moyenne(dist), sd: ecartType(dist), etendue: etendue(dist), n: dist.length },
    vitesseMoyenne: { moy: moyenne(vit), sd: ecartType(vit), etendue: etendue(vit), n: vit.length },
    ctrl: { moy: moyenne(ctrl), sd: ecartType(ctrl), etendue: etendue(ctrl), n: ctrl.length },
    partCtrlPct: partCtrl.length ? { moy: moyenne(partCtrl), sd: ecartType(partCtrl), etendue: etendue(partCtrl), n: partCtrl.length } : null,
    t1500: {
      nAtteint: t1500Vals.length,
      nTotal: c.episodes.length,
      moy: t1500Vals.length ? moyenne(t1500Vals) : null,
      sd: t1500Vals.length >= 2 ? ecartType(t1500Vals) : null,
      etendue: t1500Vals.length ? etendue(t1500Vals) : null,
    },
  };
}

// ---------- 6. Tableau texte ----------
function fmt(x, d) { return x === null || x === undefined || !isFinite(x) ? 'n/a' : x.toFixed(d === undefined ? 1 : d); }
function fmtDisp(agg, d) {
  if (agg.n < 2) return '(n=' + agg.n + ', dispersion non calculable)';
  return '±' + fmt(agg.sd, d) + ' [' + fmt(agg.etendue[0], d) + '..' + fmt(agg.etendue[1], d) + '] n=' + agg.n;
}

console.log('=== TABLEAU PAR CHAMPION (moyenne sur ' + SEEDS.length + ' circuits, dispersion = écart-type et étendue) ===\n');
const header = ['champion', 'note', 'distance(m)', 'vitesse_moy(m/s)', 'temps@1500m(s)', 'ctrl', 'part_ctrl_%'];
console.log(header.join(' | '));
for (const c of parChampion) {
  const nom = path.basename(c.file) + (c.gen !== null ? ' (gen ' + c.gen + ')' : '');
  const a = c.agg;
  const t1500Txt = a.t1500.nAtteint === 0
    ? 'jamais atteint (0/' + a.t1500.nTotal + ')'
    : fmt(a.t1500.moy, 2) + (a.t1500.sd !== null ? '±' + fmt(a.t1500.sd, 2) : '') + ' (' + a.t1500.nAtteint + '/' + a.t1500.nTotal + ')';
  console.log(
    nom + '\n  note=' + fmt(a.note.moy, 1) + ' ' + fmtDisp(a.note, 1) +
    '\n  distance=' + fmt(a.distance.moy, 1) + ' ' + fmtDisp(a.distance, 1) +
    '\n  vitesse_moy=' + fmt(a.vitesseMoyenne.moy, 2) + ' ' + fmtDisp(a.vitesseMoyenne, 2) +
    '\n  temps@1500m=' + t1500Txt +
    '\n  ctrl=' + fmt(a.ctrl.moy, 1) + ' ' + fmtDisp(a.ctrl, 1) +
    '\n  part_ctrl_%=' + (a.partCtrlPct ? fmt(a.partCtrlPct.moy, 1) + ' ' + fmtDisp(a.partCtrlPct, 1) : 'insuffisant pour conclure (note nulle sur tous les épisodes)')
  );
}

// ---------- 7. Corrélation de rang de Spearman (implémentation manuelle) ----------
function rangs(a) {
  // Rangs avec moyenne des rangs pour les ex-aequo (méthode standard de Spearman).
  const idx = a.map((v, i) => i).sort((i, j) => a[i] - a[j]);
  const r = new Array(a.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && a[idx[j + 1]] === a[idx[i]]) j++;
    const rangMoyen = (i + j) / 2 + 1; // rangs 1-based
    for (let k = i; k <= j; k++) r[idx[k]] = rangMoyen;
    i = j + 1;
  }
  return r;
}
function spearman(x, y) {
  if (x.length !== y.length || x.length < 3) return null; // trop peu de points pour être interprétable
  const rx = rangs(x), ry = rangs(y);
  const n = x.length;
  const mx = moyenne(rx), my = moyenne(ry);
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = rx[i] - mx, dy = ry[i] - my;
    num += dx * dy; dx2 += dx * dx; dy2 += dy * dy;
  }
  if (dx2 === 0 || dy2 === 0) return null; // valeurs constantes : corrélation non définie
  return num / Math.sqrt(dx2 * dy2);
}

const notesParChampion = parChampion.map(c => c.agg.note.moy);
const distanceParChampion = parChampion.map(c => c.agg.distance.moy);
const vitesseParChampion = parChampion.map(c => c.agg.vitesseMoyenne.moy);
// Temps@1500m : seulement les champions où TOUS les épisodes ont atteint 1500 m, sinon la
// moyenne mélangerait des "jamais atteint" avec des temps réels — on l'exclut explicitement.
const champsAvec1500Complet = parChampion.filter(c => c.agg.t1500.nAtteint === c.agg.t1500.nTotal && c.agg.t1500.nTotal > 0);
const notesAvec1500 = champsAvec1500Complet.map(c => c.agg.note.moy);
const t1500ParChampion = champsAvec1500Complet.map(c => c.agg.t1500.moy);

console.log('\n=== CORRÉLATION DE RANG DE SPEARMAN (note vs mesures de vitesse, un point = un champion) ===\n');
const nChamp = parChampion.length;
if (nChamp < 3) {
  console.log('n=' + nChamp + ' champion(s) : insuffisant pour conclure (il en faut au moins 3 pour une corrélation de rang interprétable).');
} else {
  const rNoteDist = spearman(notesParChampion, distanceParChampion);
  const rNoteVit = spearman(notesParChampion, vitesseParChampion);
  console.log('note vs distance totale        : rho = ' + (rNoteDist === null ? 'insuffisant pour conclure (valeurs constantes ou n<3)' : rNoteDist.toFixed(3)) + '  (n=' + nChamp + ')');
  console.log('note vs vitesse moyenne         : rho = ' + (rNoteVit === null ? 'insuffisant pour conclure (valeurs constantes ou n<3)' : rNoteVit.toFixed(3)) + '  (n=' + nChamp + ')');
  if (champsAvec1500Complet.length >= 3) {
    const rNoteT1500 = spearman(notesAvec1500, t1500ParChampion);
    // temps plus COURT = plus rapide : une corrélation NÉGATIVE entre note et temps@1500m signifie
    // donc que note plus haute va avec plus rapide (on l'explicite pour ne pas piéger la lecture).
    console.log('note vs temps pour 1500 m       : rho = ' + (rNoteT1500 === null ? 'insuffisant pour conclure (valeurs constantes)' : rNoteT1500.toFixed(3)) + '  (n=' + champsAvec1500Complet.length + '/' + nChamp + ' — champions ayant atteint 1500 m sur les ' + SEEDS.length + ' circuits ; note NÉGATIVEMENT corrélée au temps = cohérent avec "plus rapide")');
  } else {
    console.log('note vs temps pour 1500 m       : insuffisant pour conclure (seulement ' + champsAvec1500Complet.length + '/' + nChamp + ' champion(s) atteignent 1500 m sur les ' + SEEDS.length + ' circuits — trop peu de données comparables).');
  }
}

// ---------- 8. Part médiane du centrage dans la note ----------
console.log('\n=== PART DU CENTRAGE (ctrl) DANS LA NOTE ===\n');
const toutesPartsCtrl = [];
for (const c of parChampion) for (const e of c.episodes) if (e.partCtrlPct !== null) toutesPartsCtrl.push(e.partCtrlPct);
if (toutesPartsCtrl.length === 0) {
  console.log('insuffisant pour conclure (aucune note non nulle observée pour calculer une part).');
} else {
  console.log('Part médiane du centrage dans la note (tous champions × tous circuits, n=' + toutesPartsCtrl.length + ') : ' + median(toutesPartsCtrl).toFixed(1) + ' %');
}

// ---------- 9. Conclusion ----------
console.log('\n=== CONCLUSION ===\n');
if (nChamp < 3) {
  console.log('Insuffisant pour conclure : moins de 3 champions distincts mesurés (n=' + nChamp + '). ' +
    'Il faut au moins 3 fichiers gen*.json exploitables dans ml/train/results/champions/ pour qu\'une corrélation de rang ait un sens.');
} else {
  const rNoteDist = spearman(notesParChampion, distanceParChampion);
  const rNoteVit = spearman(notesParChampion, vitesseParChampion);
  const seuilFort = 0.6; // seuil qualitatif documenté ici, pas de calibration cachée
  const dispo = [rNoteDist, rNoteVit].filter(r => r !== null);
  if (dispo.length === 0) {
    console.log('Insuffisant pour conclure : les corrélations calculables sont toutes indéfinies (valeurs constantes).');
  } else {
    const toutesFortes = dispo.every(r => r >= seuilFort);
    const uneFaibleOuNegative = dispo.some(r => r < seuilFort);
    if (toutesFortes) {
      console.log('OUI (sous réserve, n=' + nChamp + ' champions × ' + SEEDS.length + ' circuits) : sélectionner sur la note revient, ici, à sélectionner sur la vitesse — les corrélations de rang note↔distance/vitesse sont toutes ≥ ' + seuilFort + '.');
    } else if (uneFaibleOuNegative) {
      console.log('NON (sous réserve, n=' + nChamp + ' champions × ' + SEEDS.length + ' circuits) : au moins une des corrélations note↔mesure de vitesse est faible ou négative (< ' + seuilFort + ') — sélectionner sur la note ne garantit PAS de sélectionner sur la vitesse.');
    } else {
      console.log('Insuffisant pour conclure nettement : les corrélations sont mitigées (ni toutes fortes, ni clairement faibles/négatives) avec n=' + nChamp + ' champions — il faudrait plus de checkpoints distincts pour trancher.');
    }
  }
}

// Sortie propre : loadGame laisse des timers/RAF (init différé du mode entraînement) qui, sans
// cela, maintiendraient la boucle d'événements en vie et feraient pendre le process après la
// conclusion (constaté le 2026-09-09). Le travail est terminé : on force la sortie.
process.exit(0);
