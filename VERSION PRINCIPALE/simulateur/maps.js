/* LES MAPS DU SIMULATEUR — une ligne par map (lue par la page des maps ET par la course).
   · id      : le décor, dans maps/<id>.js
   · nom     : ce que la page affiche
   · photo   : prise dans le simulateur (course.html?map=<id>&photo=1, enregistrée par serveur.py)
   · musique : la page de musique jouée sur cette map (une musique en direct, comme musiques/french-touch.html), ou null.
               Sa jauge « vitesse » (0-100 %) suit la vitesse de la voiture. Le choix fait sur la page des maps passe devant
               (enregistré dans ce navigateur) ; ici, c'est la musique par défaut.
   Chemins relatifs au dossier simulateur/. */
const MAPS = [
  { id: 'ville',  nom: 'VILLE',  photo: 'photos/ville.jpg',  musique: 'musiques/french-touch.html' },
  { id: 'nuages', nom: 'NUAGES', photo: 'photos/nuages.jpg', musique: null },
  { id: 'orbite', nom: 'ORBITE', photo: 'photos/orbite.jpg', musique: null },
];

/* LES MUSIQUES qu'on peut associer à une map. Une nouvelle musique = son fichier dans musiques/ + une ligne ici. */
const MUSIQUES = [
  { fichier: 'musiques/french-touch.html', nom: 'French Touch' },
];

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
