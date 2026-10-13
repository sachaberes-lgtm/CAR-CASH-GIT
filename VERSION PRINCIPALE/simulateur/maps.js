/* LES MAPS DU SIMULATEUR — les VRAIES maps du jeu (Léo, 12/10 : « il faut que ce soit les bonnes maps et la bonne physique »).
   Le simulateur ne refait rien : il lance le jeu lui-même (index.html, tel que sur le main) directement sur le niveau choisi.
   · Une MAP = un décor du jeu, avec ses niveaux (les mêmes que la page des Niveaux, maps-ciel.html, et leurs photos).
   · `lance` : comment le jeu part sur ce niveau — { monde, n } = la CARRIÈRE (dbgCampagne(n, monde)) ; { sansFin } = la partie sans fin
     (le JOUER de l'accueil) ; { jade } = le niveau SOLEIL DE JADE (dbgNiveauJade()) ; { crypto } = CRYPTOCITY (dbgNiveauCrypto()).
   · `musique` : la musique PAR DÉFAUT des niveaux de la map, ou null.
   LA MUSIQUE DES NIVEAUX (Léo, 12/10 soir : « je dois pouvoir tester mes nouveaux sons dans les maps pour choisir où ils vont, et tester
   l'intensité de la musique proportionnelle au palier moteur ») :
   · la BIBLIOTHÈQUE = tout ce qui est dans musiques/ (lue par le serveur : musiques.json). Deux formats :
       - une PAGE .html à jauge (le French Touch) : bouton #play, jauge #speed (0-100), affichage #bpm ;
       - un MODULE .js (musique-glisse.js) : une fonction exportée qui rend { start, stop, setTier(palier, nbPaliers), setSpeed(0-1), bpm }.
     Une nouvelle musique = son fichier dans musiques/ (ou glissé sur la page des maps), rien d'autre ;
   · LE CHOIX niveau → musique = choix-musiques.json, sur le DISQUE (écrit par le serveur) : c'est la table que le jeu lira.
   L'ORGANISATEUR DU PLAY (Léo, 12/10 : « tu es mon organisateur de map aléatoire pour le bouton PLAY ; laisse renommer si jamais je veux,
   et ajoute la nouvelle map ») — play.json, sur le DISQUE (écrit par le serveur), à côté de choix-musiques.json :
   · `pool` { idNiveau: true|false } = le niveau est-il dans le TIRAGE du PLAY ? Sans réglage : `play` de sa map (ici : VILLE, SKY HIGH et
     PICS DE JADE dedans, la partie sans fin non — le mode classique tirait SKY HIGH 1-5 + VILLE 1-5) ;
   · `noms` { idNiveau | 'map:'+idMap: 'NOUVEAU NOM' } = les noms que Léo a donnés (sans réglage : `nom` ci-dessous).
   Chemins relatifs au dossier simulateur/. */
const IMG = '../maps-ciel/img/';
const MAPS = [
  { id: 'ville', nom: 'VILLE', musique: 'musiques/french-touch.html', play: true, niveaux: [
    { id: 'v1', nom: 'COUCHER DE SOLEIL', photo: IMG + 'v1-volant.jpg', lance: { monde: 1, n: 1 } },
    { id: 'v2', nom: 'SOIRÉE', photo: IMG + 'v2-volant.jpg', lance: { monde: 1, n: 2 } },
    { id: 'v3', nom: 'PLUIE NÉON', photo: IMG + 'v3-volant.jpg', lance: { monde: 1, n: 3 } },
    { id: 'v4', nom: 'MINUIT', photo: IMG + 'v4-volant.jpg', lance: { monde: 1, n: 4 } },
    { id: 'v5', nom: 'ORAGE', photo: IMG + 'v5-volant.jpg', lance: { monde: 1, n: 5 } },
  ] },
  { id: 'ciel', nom: 'SKY HIGH', musique: null, play: true, niveaux: [
    { id: 'sh1', nom: 'AURORE', photo: IMG + 'sh1-volant.jpg', lance: { monde: 0, n: 1 } },
    { id: 'sh2', nom: 'PREMIÈRES LUEURS', photo: IMG + 'sh2-volant.jpg', lance: { monde: 0, n: 2 } },
    { id: 'sh3', nom: 'LEVER DU SOLEIL', photo: IMG + 'sh3-volant.jpg', lance: { monde: 0, n: 3 } },
    { id: 'sh4', nom: 'MATIN FRAIS', photo: IMG + 'sh4-volant.jpg', lance: { monde: 0, n: 4 } },
    { id: 'sh5', nom: 'MATIN', photo: IMG + 'sh5-volant.jpg', lance: { monde: 0, n: 5 } },
  ] },
  { id: 'mer', nom: 'MER DE NUAGES', musique: null, play: false, niveaux: [
    { id: 'mer', nom: 'PARTIE SANS FIN', photo: IMG + 'mer-matin-volant.jpg', lance: { sansFin: true } },
  ] },
  // (2026-10-12, Léo : « un niveau complet — fruits custom, pièces ¥ — qu'on ajoute pour tester, référencé par un nom que tu choisis »)
  // la map des PICS DE JADE en vrai niveau : `lance: { jade }` = dbgNiveauJade() du jeu
  { id: 'jade', nom: 'PICS DE JADE', musique: null, play: true, niveaux: [
    { id: 'jade', nom: 'SOLEIL DE JADE', photo: IMG + 'jade-volant.jpg', lance: { jade: true } },
  ] },
  // (2026-10-13, Léo : « génère une ville avec le même système que les autres maps, mais en BULL RUN — CRYPTOCITY ») la ville générée,
  // en plein jour, en verre et en or : `lance: { crypto }` = dbgNiveauCrypto() du jeu. Pas dans le tirage du PLAY tant que Léo ne l'y met pas (pastille).
  { id: 'crypto', nom: 'CRYPTOCITY', musique: null, play: false, niveaux: [
    { id: 'crypto', nom: 'BULL RUN', photo: IMG + 'crypto-volant.jpg', lance: { crypto: true } },
  ] },
];

// le dossier simulateur/, d'où que la page soit servie (la page des maps est un cran au-dessus)
const SIMU_DIR = new URL('.', document.currentScript.src).href;
let MUSIQUES = [];   // [{ fichier: 'musiques/x', nom }]
let CHOIX = {};      // { idNiveau: 'musiques/x' | '' (aucune) }
let PLAY = { pool: {}, noms: {} };   // l'organisateur du PLAY (play.json)

async function musiquesCharge() {
  const lit = async (f, defaut) => { try { const r = await fetch(SIMU_DIR + f, { cache: 'no-store' }); return r.ok ? await r.json() : defaut; } catch (e) { return defaut; } };
  let pl;
  [MUSIQUES, CHOIX, pl] = await Promise.all([lit('musiques.json', []), lit('choix-musiques.json', {}), lit('play.json', {})]);
  if (!Array.isArray(MUSIQUES)) MUSIQUES = [];
  if (!CHOIX || typeof CHOIX !== 'object') CHOIX = {};
  pl = pl && typeof pl === 'object' ? pl : {};
  PLAY = { pool: pl.pool && typeof pl.pool === 'object' ? pl.pool : {}, noms: pl.noms && typeof pl.noms === 'object' ? pl.noms : {} };
}
function niveauDe(id) {
  for (const m of MAPS) for (const n of m.niveaux) if (n.id === id) return { map: m, niv: n };
  return null;
}
const nomMusique = f => (MUSIQUES.find(m => m.fichier === f) || {}).nom || '';
/* La musique d'un niveau : le choix enregistré, sinon celle de sa map. '' = aucune. */
function musiqueDe(niv) {
  const c = CHOIX[niv.id];
  if (typeof c === 'string' && (c === '' || MUSIQUES.some(m => m.fichier === c))) return c;
  const T = niveauDe(niv.id);
  return (T && T.map.musique) || '';
}
/* Choisir une musique pour un ou plusieurs niveaux : écrit tout de suite sur le disque. Rend true si c'est enregistré. */
async function musiqueChoisir(ids, fichier) {
  for (const id of ids) CHOIX[id] = fichier;
  try {
    const r = await fetch(SIMU_DIR + 'choix-musiques.json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(CHOIX) });
    return r.ok;
  } catch (e) { return false; }
}

/* L'ORGANISATEUR DU PLAY : les noms (renommés ou d'origine), qui est dans le tirage, l'écriture sur le disque. */
const nomNiv = niv => PLAY.noms[niv.id] || niv.nom;
const nomMap = map => PLAY.noms['map:' + map.id] || map.nom;
function dansPlay(niv) {
  const v = PLAY.pool[niv.id];
  if (typeof v === 'boolean') return v;
  const T = niveauDe(niv.id);
  return !!(T && T.map.play);
}
const poolPlay = () => MAPS.flatMap(m => m.niveaux.filter(dansPlay));
async function playEnregistre() {
  try {
    const r = await fetch(SIMU_DIR + 'play.json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(PLAY) });
    return r.ok;
  } catch (e) { return false; }
}
