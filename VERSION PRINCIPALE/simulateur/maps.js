/* LES MAPS DU SIMULATEUR — les VRAIES maps du jeu (Léo, 12/10 : « il faut que ce soit les bonnes maps et la bonne physique »).
   Le simulateur ne refait rien : il lance le jeu lui-même (index.html, tel que sur le main) directement sur le niveau choisi.
   · Une MAP = un décor du jeu, avec ses niveaux (les mêmes que la page des Niveaux, maps-ciel.html, et leurs photos).
   · `lance` : comment le jeu part sur ce niveau — { monde, n } = la CARRIÈRE (dbgCampagne(n, monde)) ; { sansFin } = la partie sans fin
     (le JOUER de l'accueil).
   · `musique` : la page de musique en direct de la map (musiques/*.html, comme le French Touch), ou null. Le choix fait sur la page des
     maps passe devant (gardé dans ce navigateur). La musique du JEU est coupée dans le simulateur : on n'entend que celle-ci.
   Chemins relatifs au dossier simulateur/. */
const IMG = '../maps-ciel/img/';
const MAPS = [
  { id: 'ville', nom: 'VILLE', musique: 'musiques/french-touch.html', niveaux: [
    { id: 'v1', nom: 'COUCHER DE SOLEIL', photo: IMG + 'v1-volant.jpg', lance: { monde: 1, n: 1 } },
    { id: 'v2', nom: 'SOIRÉE', photo: IMG + 'v2-volant.jpg', lance: { monde: 1, n: 2 } },
    { id: 'v3', nom: 'PLUIE NÉON', photo: IMG + 'v3-volant.jpg', lance: { monde: 1, n: 3 } },
    { id: 'v4', nom: 'MINUIT', photo: IMG + 'v4-volant.jpg', lance: { monde: 1, n: 4 } },
    { id: 'v5', nom: 'ORAGE', photo: IMG + 'v5-volant.jpg', lance: { monde: 1, n: 5 } },
  ] },
  { id: 'ciel', nom: 'SKY HIGH', musique: null, niveaux: [
    { id: 'sh1', nom: 'AURORE', photo: IMG + 'sh1-volant.jpg', lance: { monde: 0, n: 1 } },
    { id: 'sh2', nom: 'PREMIÈRES LUEURS', photo: IMG + 'sh2-volant.jpg', lance: { monde: 0, n: 2 } },
    { id: 'sh3', nom: 'LEVER DU SOLEIL', photo: IMG + 'sh3-volant.jpg', lance: { monde: 0, n: 3 } },
    { id: 'sh4', nom: 'MATIN FRAIS', photo: IMG + 'sh4-volant.jpg', lance: { monde: 0, n: 4 } },
    { id: 'sh5', nom: 'MATIN', photo: IMG + 'sh5-volant.jpg', lance: { monde: 0, n: 5 } },
  ] },
  { id: 'mer', nom: 'MER DE NUAGES', musique: null, niveaux: [
    { id: 'mer', nom: 'PARTIE SANS FIN', photo: IMG + 'mer-matin-volant.jpg', lance: { sansFin: true } },
  ] },
];

/* LES MUSIQUES qu'on peut associer à une map. Une nouvelle musique = son fichier dans musiques/ + une ligne ici.
   Elle doit garder les trois repères du French Touch : le bouton #play, la jauge #speed (0-100) et l'affichage #bpm. */
const MUSIQUES = [
  { fichier: 'musiques/french-touch.html', nom: 'French Touch' },
];

function niveauDe(id) {
  for (const m of MAPS) for (const n of m.niveaux) if (n.id === id) return { map: m, niv: n };
  return null;
}
/* La musique d'une map : le choix de la page des maps, sinon celle par défaut. '' = aucune. */
function musiqueDe(map) {
  try {
    const choix = JSON.parse(localStorage.getItem('simu.musiques') || '{}');
    if (typeof choix[map.id] === 'string' && (choix[map.id] === '' || MUSIQUES.some(m => m.fichier === choix[map.id]))) return choix[map.id];
  } catch (e) {}
  return map.musique || '';
}
function musiqueChoisir(map, fichier) {
  try {
    const choix = JSON.parse(localStorage.getItem('simu.musiques') || '{}');
    choix[map.id] = fichier;
    localStorage.setItem('simu.musiques', JSON.stringify(choix));
  } catch (e) {}
}
