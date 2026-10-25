/* COPIE de repertoire-maps/maps.js (branche repertoire-maps de CAR-repertoire, mise à jour du 19/10 : LA VILLE = ville + vitrée fusionnées, CRYPTO CITY, sans PARIS) pour que la page unique
   maps-voitures.html n'ait besoin d'aucun autre serveur. Une map ajoutée = la même ligne ici ET dans repertoire-maps/maps.js. */
/* LE RÉPERTOIRE DES MAPS (2026-10-15, Léo : « on va ensuite créer plein d'autres maps ; crée-moi un répertoire avec toutes les maps
   déjà aléatoires qu'on a, avec les titres et une photo représentative »).
   (16/10 : « juste une liste… pour appuyer dessus, aller voir dedans » → index.html = la liste, voir.html = le jeu parti sur la map)
   = les maps que le JOUER tire au hasard (SF_CARTES d'index.html, « LE MODE CLASSIQUE AU HASARD ») : une MAP × une MÉTÉO par portail.
   · `id`        = la clé de SF_CARTES (c'est elle qu'on passe au jeu : index.html?carte=<id>&meteo=<météo>)
   · `nom`       = le nom que le jeu affiche (SF_CARTES[id].nm)
   · `couverture`= la météo de la photo de la liste (et celle où l'on entre en touchant la map)
   · `meteos`    = [clé de météo, ce qu'on écrit sous la vignette] — dans l'ordre de SF_CARTES[id].m (EN ORBITE : la planète de chaque heure)
   Photos : img/<id>-<météo>.jpg, prises dans le VRAI jeu (1120 × 630, caméra de course, HUD masqué) par banc/photos.py.
   AJOUTER UNE MAP : l'ajouter à SF_CARTES dans le jeu, puis une ligne ici, puis `python3 banc/photos.py <id>` (voir banc/photos.py). */
window.REPERTOIRE = [
  { id: 'nuages',   nom: 'MER DE NUAGES',     couverture: 'matin',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['pluie', 'PLUIE'], ['orage', 'ORAGE']] },
  // (2026-10-16, Sacha : « la map ville sera toujours la nuit […] on abandonne toutes les maps ville-jour ») : quatre temps (la teinte de base, violette) puis
  // les trois autres TEINTES sous la pluie — une clé « météo-teinte » = index.html?carte=ville&meteo=<météo>&teinte=<teinte> (banc/photos.py la comprend)
  { id: 'ville',    nom: 'LA VILLE',          couverture: 'pluie',
    meteos: [['pluie', 'PLUIE'], ['nuit', 'NUIT'], ['brouillard', 'BROUILLARD'], ['orage', 'ORAGE'], ['pluie-vert', 'NÉONS VERTS'], ['pluie-jaune', 'NÉONS JAUNES'], ['pluie-bleu', 'BLEU ÉLECTRIQUE']] },
  // (2026-10-19) LA VILLE VITRÉE n'est plus une map à part : Sacha l'a FONDUE dans LA VILLE le 18/10 (les géantes de verre dans le skyline néon ;
  // `SF_HORS.vitree`, hors du tirage du JOUER) — et PARIS est sortie du jeu le 18/10 au soir. Leurs photos restent dans img/ ; pour les remettre ici :
  // une entrée « vitree » (couverture midi, cinq temps : matin, midi, soir, nuit, pluie ; le lien ?carte=vitree marche encore) ; Paris n'a plus de lien.
  { id: 'jade',     nom: 'PICS DE JADE',      couverture: 'matin',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['pluie', 'PLUIE'], ['orage', 'ORAGE']] },
  { id: 'foret',    nom: 'LA FORÊT NOIRE',    couverture: 'soir',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['pluie', 'PLUIE'], ['orage', 'ORAGE']] },
  { id: 'banquise', nom: 'LE GLACIER',        couverture: 'nuit',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['neige', 'NEIGE'], ['blizzard', 'BLIZZARD']] },
  { id: 'volcan',   nom: 'LE ROYAUME DE FEU', couverture: 'soir',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['pluie', 'CENDRES'], ['orage', 'ORAGE']] },
  // (2026-10-15, Sacha) CRYPTO CITY : la ville imaginaire en pleine BULL RUN (verre, or, taureaux, bougies) — quatre temps, jamais de pluie ni d'orage
  { id: 'crypto',   nom: 'CRYPTO CITY',       couverture: 'midi',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI · BULL RUN'], ['soir', 'SOIR'], ['nuit', 'NUIT']] },
  { id: 'espace',   nom: 'EN ORBITE',         couverture: 'matin',
    meteos: [['matin', 'TERRE'], ['midi', 'MARS'], ['soir', 'JUPITER']] },
  { id: 'canyon',   nom: 'CANYON DES GÉANTS', couverture: 'matin',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['pluie', 'PLUIE'], ['orage', 'ORAGE']] },
  // (2026-10-18, Sacha : « une nouvelle map dans les grottes, en mode Minecraft mais bien ») LES PROFONDEURS : la descente en blocs, de la mine aux
  // abysses — sous la terre, ses « temps » sont des lumières
  { id: 'grotte',   nom: 'LES PROFONDEURS',   couverture: 'matin',
    meteos: [['matin', 'TORCHES'], ['midi', 'CRISTAUX'], ['soir', 'MAGMA'], ['nuit', 'NOIR COMPLET']] },
  // (2026-10-18, Sacha : « fais les dunes d'or de manière parfaite ») LES DUNES D'OR : l'erg qu'on dévale de crête en crête, la vallée morte, l'allée des
  // obélisques, l'oasis — le temps « pluie » est un vent de sable, l'« orage » une tempête de sable
  { id: 'dunes',    nom: "LES DUNES D'OR",    couverture: 'soir',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['pluie', 'VENT DE SABLE'], ['orage', 'TEMPÊTE DE SABLE']] },
];
