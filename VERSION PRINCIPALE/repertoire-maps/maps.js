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
  // (2026-10-17, Léo) LA VILLE VITRÉE : les tours de verre et leur reflet qui pend du ciel — quatre heures et la pluie
  { id: 'vitree',   nom: 'VILLE VITRÉE',      couverture: 'midi',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'COUCHER'], ['nuit', 'NUIT'], ['pluie', 'PLUIE']] },
  // (2026-10-18, Sacha : « remet la map paris dans le mode classique ») PARIS AU SOL, de la Concorde au Sacré-Cœur : un seul temps — la course
  // fait tourner l'heure elle-même, de l'or à la nuit
  { id: 'paris',    nom: 'PARIS',             couverture: 'soir',
    meteos: [['soir', 'HEURE DORÉE']] },
  { id: 'jade',     nom: 'PICS DE JADE',      couverture: 'matin',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['pluie', 'PLUIE'], ['orage', 'ORAGE']] },
  { id: 'foret',    nom: 'LA FORÊT NOIRE',    couverture: 'soir',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['pluie', 'PLUIE'], ['orage', 'ORAGE']] },
  { id: 'banquise', nom: 'LE GLACIER',        couverture: 'nuit',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['neige', 'NEIGE'], ['blizzard', 'BLIZZARD']] },
  { id: 'volcan',   nom: 'LE ROYAUME DE FEU', couverture: 'soir',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['pluie', 'CENDRES'], ['orage', 'ORAGE']] },
  { id: 'espace',   nom: 'EN ORBITE',         couverture: 'matin',
    meteos: [['matin', 'TERRE'], ['midi', 'MARS'], ['soir', 'JUPITER']] },
  { id: 'canyon',   nom: 'CANYON DES GÉANTS', couverture: 'matin',
    meteos: [['matin', 'MATIN'], ['midi', 'MIDI'], ['soir', 'SOIR'], ['nuit', 'NUIT'], ['pluie', 'PLUIE'], ['orage', 'ORAGE']] },
  // (2026-10-18, Sacha : « une nouvelle map dans les grottes, en mode Minecraft mais bien ») LES PROFONDEURS : la descente en blocs, de la mine aux
  // abysses — sous la terre, ses « temps » sont des lumières
  { id: 'grotte',   nom: 'LES PROFONDEURS',   couverture: 'matin',
    meteos: [['matin', 'TORCHES'], ['midi', 'CRISTAUX'], ['soir', 'MAGMA'], ['nuit', 'NOIR COMPLET']] },
];
