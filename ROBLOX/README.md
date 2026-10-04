# CASH CAR sur ROBLOX

Roblox ne lit pas le HTML/JavaScript du jeu web : ce dossier est une **réécriture en Luau** (le langage de
Roblox), faite à partir des vrais chiffres du jeu (`VERSION PRINCIPALE/index.html`, numéros de ligne cités dans
le code). Même conduite, même vol, mêmes atterrissages, même moteur qui monte avec les pièces.

## Jouer tout de suite (2 minutes)

1. Double-clic sur **`CashCar.rbxlx`** → il s'ouvre dans **Roblox Studio** (déjà installé sur ce PC).
2. Bouton **Play** (ou touche **F5**) → le jeu démarre dans Studio : écran de chargement, puis le menu.
3. Pour arrêter : bouton **Stop** (ou Maj+F5).

Si quelque chose casse : menu **Affichage → Output** (View → Output). Les erreurs y sont écrites en rouge,
avec le nom du script et la ligne. Copie-les à Claude.

## Le mettre en ligne sur Roblox (que tes potes y jouent)

1. Dans Studio : **Fichier → Publier sur Roblox** (File → Publish to Roblox) → « Créer une nouvelle expérience »,
   nom `CASH CAR`, genre Course.
2. **Paramètres du jeu → Sécurité → « Activer l'accès de Studio aux services API »** : sans ça les records
   ne sont pas sauvegardés.
3. Sur create.roblox.com → ton expérience → la rendre **Publique** quand tu es prêt.

C'est toi qui publies (c'est ton compte Roblox) : Claude ne le fait pas à ta place.

Les images de la page du jeu sont prêtes dans **`publication/`** : `icone-512.png` (l'icône) et cinq vignettes 1920×1080
(`vignette-1-nuages.png` … `vignette-5-vol.png`), tirées du vrai jeu. Sur create.roblox.com → ton expérience → Places / Icône
et Vignettes : les glisser. (Les refaire : `sh outils/vitrine.sh nuages` [ville, nuit, espace] puis `python outils/vitrine.py`.)

## Les commandes

| | PC | Manette | Téléphone |
|---|---|---|---|
| Volant | ← → (ou Q/A et D) | stick gauche | pouce gauche (le stick naît sous le doigt) |
| Nitro | ESPACE ou MAJ | R2 ou A | gros bouton NITRO (pouce droit) |
| En l'air : piquer / cabrer | ↑ / ↓ (ou Z/W, S) | stick gauche haut / bas | pouce gauche haut / bas |
| Freiner (au sol) | ↓ ou S | L2 ou B | pouce gauche tiré vers le bas |
| Pause | P | Start | bouton II en bas |
| Menus | souris | A = JOUER / REJOUER · garage : gâchettes = caisse voisine, A = acheter/équiper, B = retour | doigt |
| Accueil | clic sur la caisse = un petit coup | — | toucher la caisse = un petit coup |

Le gaz est automatique partout. On sort par le **bord** de la route, on vole (vrilles, piqué, nitro), on se
pose plus bas : c'est là que le jeu se joue. 6 secondes en l'air maximum.

## Les sons (à faire une fois)

Roblox ne joue que les sons importés sur Roblox. Le dossier **`sons-a-importer/`** contient cent dix bruitages du
jeu (tirés de notre banque de sons), cinq boucles (**moteur**, **nitro**, crissement, drift, rase-bord), et **six musiques** : `musique` (la radio,
jouée en orbite et partout où un morceau de lieu manque), `musiqueNuages` (CIEL · LES 5 NIVEAUX), `musiqueVille`, `musiqueOrage`,
et les deux morceaux de l'accueil `musiqueLobby1` / `musiqueLobby2` (un des deux tiré à chaque lancement, aussi au garage et à
l'écran de fin) — la musique suit le lieu, comme sur le web.
Les sons des niveaux : `eclair`, `tonnerre` (l'orage), `orbiteEntre`, `orbiteSort`, `espaceAmbiance`, `explosionLoin`, `esquive`,
`touche`, `abri` (l'orbite et ses débris), `mortSat` (la pluie de satellites).

1. Studio → **Fenêtre → Gestionnaire de ressources** (Window → Asset Manager) → **Importation groupée** (Bulk Import)
   → sélectionner les fichiers de `sons-a-importer/`.
2. Dans le Gestionnaire de ressources, dossier **Audio** : tout sélectionner → clic droit → **Insérer** (les sons arrivent dans
   le Workspace, chacun avec le nom de son fichier).
3. **Affichage → Barre de commande** (View → Command Bar) : coller TOUT le fichier `outils/remplir-sons.luau`, Entrée. Il range
   chaque numéro dans `ReplicatedStorage → CashCar → SonsIds`, retire les sons insérés, et écrit dans la Sortie ce qui manque —
   plus de numéros à copier un par un. (Envoie à Claude la liste qu'il écrit dans la Sortie : elle entrera dans le dépôt.)
4. Refaire **Publier**.

Sans ça le jeu marche quand même (quelques sons de secours livrés avec Roblox : explosion, saut, vent).
Depuis le 3/10, CHAQUE événement du jeu web a son son (le chrono de vol qui tique, la nitro vide, chaque pouvoir, la frénésie,
les verdicts, les fruits, le drift, les nuages, les morts…) : tant qu'un son n'est pas importé, le jeu joue celui d'avant à sa
place (ou rien) — l'importer suffit à l'allumer, rien d'autre à toucher.
Roblox limite le nombre d'imports audio par mois : commence par `moteur`, `nitro`, `piece`, `explosion`,
`poseParfait`, `musique` ; puis `tonnerre`, `eclair`, `musiqueVille`, `musiqueNuages`.
⚠ Les musiques : ne les importe que si tu en as les droits (Roblox vérifie les droits des sons importés).

## Ce qui est porté / ce qui ne l'est pas encore

Le portage suit le jeu web **du jour** (`VERSION PRINCIPALE/index.html`) : **six niveaux** qui s'enchaînent de portail en
portail, le cycle du web sans Paris — **NUAGES → VILLE → ORBITE → L'ORAGE → MINUIT EN VILLE → PLUIE DE SATELLITES**, puis on
recommence (décision de Sacha, 2/10 : « fais la ville et l'espace, fais pas Paris » ; la carrière : pas pour l'instant).
- **AU-DESSUS DE LA VILLE** (`Client/Ville`) : le canyon de tours à fenêtres chaudes ou froides, les enseignes de néon, la nuit
  violette, la pluie, les rails roses et leur lueur sur le bitume mouillé ; une entrée surélevée puis la grande rampe ; des pentes
  comprimées, de grands virages ; en vol, entrer dans une tour tue.
- **EN ORBITE** (`Client/Espace`) : le ciel noir, la Terre qui se lève au bout de la route, la lune qui regarde la caisse, les
  Starlink et les débris ; une autoroute large et douce ; la gravité divisée par deux et la jauge de vol allongée (×1,7).
- **L'ORAGE** (les nuages, variante `orage` — `Client/Orage`) : le ciel de tempête, la pluie, des murs et un plafond de nuages,
  un banc sur la route tous les 300-600 m ; l'ÉCLAIR tombe devant la caisse, allume le ciel et fait reculer la brume ; le tonnerre suit.
- **MINUIT EN VILLE** (la ville, variante `nuit`) : trois fenêtres sur quatre éteintes, les néons baissés, la nuit noire — et
  les PHARES : ceux de la caisse au maximum, deux faisceaux, une lampe qui court devant.
- **PLUIE DE SATELLITES** (l'orbite, variante `hard`) : des Starlink et des étages de fusée SUR la route, seuls ou en rideau de
  deux avec une trouée ; les percuter tue (« PERCUTE PAR UN SATELLITE »), les frôler paie.
- **La pluie de débris** (`Client/Debris`, toute l'orbite) : un cercle rouge se pose là où la caisse SERA dans 1,5 s, un débris
  en feu y tombe — touché : −40 % de vitesse ; esquivé de près : aura, nitro, série.
- **Les portes de l'orbite** : un tunnel de distorsion à l'entrée (1,9 s), une rentrée atmosphérique en feu à la sortie (2,6 s).
- **Le viseur d'atterrissage** (`Client/Viseur`) : en vol, un anneau se pose où la caisse va retomber — or qui bat = la fenêtre du
  PARFAIT, blanc = pose normale, rouge = posé lourd.
- **Le virage à filet** (module des NUAGES, un seul dans l'orage) : la bretelle du web, calculée sur la vraie chute — au banc, 20
  sorties de virage sur 20 retombent dans le filet. Il paie VIRAGE À FOND (pris sans quitter la route) ou RATTRAPÉ (posé dans le filet).
- **La pause** : la reprise compte 3-2-1 ; QUITTER et RECOMMENCER se confirment (deux appuis) ; QUITTER est une vraie fin de partie
  (les gains sont VERSÉS — avant le 2/10 ils étaient perdus), RECOMMENCER ne verse rien.
- **Le portail** est l'OVULE du web : une sphère de 55 m (membrane translucide, noyau qui bat), qu'on franchit en y entrant d'où
  qu'on vienne ; couper la route en vol pour l'atteindre paie un RACCOURCI.
- **MIRACULÉ** (une chute perdue d'avance rattrapée), les **cris de vitesse** (« 400 KM/H ! », « RECORD DE VITESSE »), **COMÈTE**
  (la caisse brûle à partir du palier 27), les **bords de l'écran** qui battent à la couleur du pouvoir actif.
- **L'ADN de piste** : chaque zone tire un archétype (FLOW, TECH, ALPIN, VOLTIGE, GRAND8 — poids des motifs, échelle des rayons,
  humeur verticale), une humeur (les poids secoués), une latéralité (elle penche à gauche, à droite ou pas) et sa signature de fin.
  ⚠ La zone fait 9 km ici contre 14,4 km sur le web : la route en maillage se paie sur le budget de maillages (4 zones tenues).
- **L'attitude de la caisse** : le power-slide (l'arrière chasse dans les virages, jusqu'à ~18°), le tangage (elle plonge au frein,
  s'accroupit à la poussée), les **traces de pneus** (`Client/Traces`), la fumée sur toute vraie glisse, les étincelles du plancher
  qui racle le bord, des éclats rouges sur un plot percuté, la gerbe d'or de la fronde, la poussière du décollage.
- **Le départ** : CASH CAR claque en or avec son halo quand la caisse touche la route, puis le nom du niveau prend le relais ;
  3 s de nitro offerte (arc-en-ciel).
- **Le coup d'allumage** de la nitro : une onde de choc à l'échappement, le champ qui s'ouvre, la caisse qui se cabre, une
  vibration ; quand on lâche après une vraie tenue, une dernière bouffée sort des pots. Au-delà de 280 km/h, les bords de l'image
  plongent dans le violet (la vignette de vitesse).
- **Le verdict de la pose** : toute pose qui encaisse une figure a son mot, à la taille de son rang — MONSTRE, DOUBLE MONSTRE,
  TRIPLE MONSTRE, MÉTÉORE, SNAKE LOOP, MEGA MÉTÉORE — et « PARFAIT ! ».
- **Les vibrations** (manette, téléphone) : chaque geste se sent — pad, fruit, cristal, plot, flaque, drift, pose, fronde, mort.
  Réglage VIBRATIONS.
- **Les astuces** se lisent UNE fois dans la vie du compte (notées dans le profil) ; le drift a la sienne (1,2 s de braquage à
  fond sans jamais avoir drifté) ; celle du vol dit le sens réglé (POUCE HAUT = PLONGE ou MONTE).
- **Les cristaux s'adaptent au joueur** : le débutant tombe sur l'AIMANT et l'AIR MAX, le vétéran sur l'AURA ×2 ; le tout premier
  cristal d'un débutant est un AIMANT posé près de l'axe.
- **Les pigeons ramiers** (`Client/Pigeons`) : de rares volées en travers du ciel (jamais en orbite ni dans l'orage).
- **Les signatures de caisse** à la nitro : l'arc-en-ciel du CHAT POP-TART, la gerbe d'eau du REQUIN.
- **La mort** : ce sont les vraies pièces de LA caisse qui volent ; un tap passe l'explosion après 0,8 s ; « NOUVEAU RECORD ! »
  s'allume pour l'argent, l'AURA ou un palier de MOTEUR jamais atteint. La pause dit où en est la partie (AURA · MOTEUR · NIVEAU).
- **Le ciel musical** de la ville (`Client/CielMusical`) : seize quartiers de lumière et vingt-six piliers d'égaliseur autour de
  l'horizon, qui battent avec le morceau qui joue (ou à 120 à la minute sans musique importée) ; en sourdine à minuit.
- **Le bitume mouillé** de la ville : les reflets de néon sont PEINTS dans l'image de la dalle (96 m qui se répètent).
- **L'intro du studio** : au lancement, CASH CAR bat trois fois, explose en dollars, cœurs, trèfles, crânes… et la signature
  **1.61 GAMES** se lève avant l'accueil (~4 s).
- **Les écrans** (audit du 3/10) : l'écran de fin du web (GAME OVER ou NOUVEAU RECORD !, le montant qui s'égrène, l'aura qui
  monte, le moteur atteint, le « presque » du palier suivant) ; EFFACER SA PROGRESSION dans les réglages ; l'aperçu des traînées
  au garage ; l'affiche RECORD PERSO de l'atelier (meilleure partie, aura max, palier, vitesse max) ; un tap sur la caisse du
  garage lui donne un petit coup ; le HUD DISCRET (une plaque qui dure pâlit, un geste neuf la rallume) ; la jauge du record
  d'aura ; NOUVEAU SOMMET sur la carte moteur.
- **L'auto-école** comme sur le web : la démo du geste sous chaque consigne, l'anneau d'or qui bat autour du bouton NITRO, la
  carte qui flashe en vert à chaque réussite, PASSER qui demande « VRAIMENT ? » tant que le permis n'est pas payé ; QUITTER
  pendant la leçon ouvre « AUTO-ÉCOLE INTERROMPUE » (seul l'argent gagné est versé, REPRENDRE relance la leçon).
- Le niveau d'une zone : `Config.niveau(zone)` ; son ambiance : `Client/Ambiance` (`pluie`, `espace`) ; l'habit de sa route
  (liseré, bitume, lueur) : `HABITS` dans `Client/Construction`.

**Nouveau le 3/10** (à essayer en premier) : l'intro « 1.61 GAMES » au lancement ; l'accueil avec ses cumulus et sa mer de nuages
(ils étaient effacés), le regard à niveau du web et la caisse qu'on TAPOTE ; la fenêtre d'achat de la boutique ; les filets de vent
de la nitro ; à plusieurs, le pseudo des autres au-dessus de leur caisse (posée sur TA route) ; la manette dans les menus ; quitter
l'auto-école proprement ; le jeu complet en anglais ; et sous le capot : la mémoire qui ne grimpe plus de zone en zone, une
sauvegarde qui ne peut plus effacer une progression.

**Porté** (tout a été vu tourner dans Roblox Studio) :
- la route-ruban qui plonge, ses deux faces, la conduite, le drift, la fronde, les pads, plots, flaques, épaves ;
- le vol, les figures, les poses notées, les bumps, le bord (sursis, lèvre, bascule), la loi du réservoir de nitro ;
- le score du web : FLOW, frénésie (DARK TRIAD), chaîne d'aura, argent, 30 paliers de moteur avec la carte moteur 3D ;
- les effets (étincelles, gerbes, explosion, billets, pluie de devises, taches de jus), les nuages 3D, la mer de nuages ;
- le dragon de papier de NITROOO, le banc de dauphins, le serpent du snake loop (noirs en dark triad) ;
- l'écran titre (la caisse qui tombe dans le ciel), le menu, le garage (68 caisses, peintures, ailes, traînées, tas de
  billets), LA ROUE (à la place des missions et de la carrière, retirées le 4/10), la boutique (vitrine), les réglages,
  l'auto-école, l'écran de fin ;
- l'interface aux proportions du web (plaques penchées, icônes pixel, jauges en bandes) ;
- le classement, la sauvegarde, le multijoueur (on voit les caisses des autres).

**Pas encore / à décider par Sacha** :
- la **boutique ne vend rien** (comme sur le web : « BIENTOT ») ; sur Roblox les prix seront en **Robux** : à fixer ;
- **LA ROUE** (accueil) : un tour gratuit toutes les 4 h, un tour offert toutes les 3 parties ; on y gagne de l'argent, un skin, ou
  l'une des 9 caisses EXCLUSIVES (à garder ou à revendre 7 500 $, au choix). Les cases et leurs chances : `Config.ROUE` ;
  « 3 TOURS » en Robux : `REVENUS.produits.tours3` (à créer, comme la seconde chance) ;
- les **sons** : tant qu'ils ne sont pas importés (voir plus haut), on n'entend que les sons de secours ;
- le mode FACILE existe dans le code mais il est éteint (`Config.FACILE_ACTIF`).

## ⚠ Avant de publier : deux réglages Roblox indispensables

Le jeu fabrique ses formes 3D par code (caisses, nuages, moteurs, dauphins…). Roblox l'autorise seulement si :
1. **Paramètres du jeu → Sécurité → « Autoriser les API de maillage et d'image »** (Allow Mesh & Image APIs) est activé ;
2. le compte qui publie est **vérifié** (pièce d'identité, 13 ans ou plus) — c'est une règle de Roblox pour ces API.

Sans ça, en ligne, les formes cuites ne s'afficheraient pas. Autre limite de Roblox : tout ce qui est bâti par code se partage
environ 68 000 triangles ; le jeu tient dedans (il compte ce qu'il utilise et rend ce qu'il détruit), mais certaines vignettes
du garage restent en pastille de couleur quand la place manque. La solution définitive serait d'importer les maillages comme
ressources Roblox (ton compte) : à voir plus tard.

## Gagner de l'argent avec le jeu (hors boutique)

Tout est déjà codé et **éteint** : chaque objet payant attend son NUMÉRO dans `src/ReplicatedStorage/CashCar/Config.luau`,
bloc `Config.REVENUS`. À 0, il ne s'affiche pas. Ce que le jeu fait déjà, gratuit, pour faire REVENIR les joueurs :
- **le cadeau du jour** : une fenêtre à l'accueil, 7 jours qui montent (500 $ → 5 000 $) ; rater un jour = retour au jour 1 ;
- **les cadeaux de temps de jeu** : 5, 15, 30, 60 minutes dans la session, puis chaque heure (tuile en bas à gauche) ;
- **inviter des amis** : la fenêtre d'invitation de Roblox ; un ami qui arrive par ton lien = 1 000 $ pour lui et pour toi ;
- **le TOP 10 MONDE** : les meilleurs records de tous les serveurs (il a besoin des API de données, voir plus bas) ;
- **les joueurs Premium** gagnent +10 % (et Roblox te paie au temps qu'ils passent dans le jeu, sans rien vendre).

Ce que TU dois créer sur **create.roblox.com → ton expérience** (les prix en Robux, c'est toi qui décides là-bas) :
1. **Monétisation → Passes** : « x2 ARGENT » (tout l'argent d'une partie compte double ; il est proposé sur l'écran de fin) et
   « VIP » (cadeaux doublés, nom doré au-dessus de la caisse) → recopie leurs numéros dans `passes = { argent2 = …, vip = … }` ;
2. **Monétisation → Produits de développeur** : « Seconde chance » (repartir là où l'on a explosé, proposé 6 s après la mort,
   une fois par partie, après 20 s de course) → son numéro dans `produits = { secondeChance = … }` ;
3. **Engagement → Badges** (chaque badge coûte un peu de Robux à créer) : Bienvenue, Permis, Zone 6, Moteur palier 10,
   1 000 d'aura, Millionnaire, 7 jours d'affilée → leurs numéros dans `badges = { … }` ;
4. **(optionnel) un groupe Roblox** pour le jeu → son numéro dans `groupe = …` : le rejoindre donne 2 000 $ (une fois) ;
5. **Paramètres → Sécurité → « Activer l'accès Studio aux API »** et la publication : sans ça, ni sauvegarde ni classement.

Puis `node ROBLOX/construire.js` et republier. Les sommes (cadeaux, bonus) se règlent dans le même bloc.

## Pour le développeur (Claude ou autre)

- **Les sources sont dans `src/`**, le `.rbxlx` se RECONSTRUIT : `node ROBLOX/construire.js` (ne pas éditer le
  `.rbxlx` à la main, ni le code dans Studio sans le recopier ici). Structure compatible **Rojo**
  (`default.project.json`) si on veut un jour synchroniser Studio en direct.
- `src/ReplicatedStorage/CashCar/` : `Config` (tous les réglages), `Piste` (la route, calculée d'une graine —
  même route chez tous les joueurs, rien sur le réseau), `Caisse` (le modèle), `Ciel` (la lumière du niveau 1),
  `Client/` (`Construction` la route en pièces, `Hud` l'interface, `Controles`, `Sons`).
- `src/ServerScriptService/Serveur.server.luau` : graine, ciel, une caisse par joueur (le joueur en est
  propriétaire réseau : c'est lui qui la déplace), classement + DataStore.
- `src/StarterPlayer/StarterPlayerScripts/Pilote.client.luau` : toute la partie (physique, vol, figures,
  caméra, écrans).
- `outils/preparer-sons.js` : régénère `sons-a-importer/` depuis la banque du jeu web (ffmpeg requis).
- Échelle : 1 m du jeu web = `Config.M` = 2,5 studs. La physique reste en mètres et en unités `vA`.
- `outils/cuire-*.js` : cuisent les formes du jeu web (caisses, objets et dauphin, moteurs, nuages, icônes) en modules Luau.
- `outils/verifier.sh <luau-compile>` : compile tous les scripts comme Studio (`-O1 -g2` : la limite des 200 variables
  locales ne se voit qu'ainsi). `outils/banc.sh` + `outils/studio.ps1` : la copie de banc et son ouverture dans Studio.
- **Le banc à distance** (on teste sans prendre la souris ni l'écran à personne) : `outils/banc.sh` construit la copie de test AVEC
  `outils/distant/` (jamais dans `CashCar.rbxlx`) ; `python outils/distant.py serveur` tient le relais, `outils/studio-relance.ps1`
  rouvre la copie derrière les autres fenêtres et lance la partie (F5), `distant.py envoie|fichier` exécute du Luau côté serveur
  (`client("prop", "monde", nom, propriété, valeur)` pour ce qui n'existe que chez le joueur), `distant.py journal` lit les
  réponses, `outils/vue.sh <png>` photographie la vue 3D (PrintWindow : la fenêtre peut être cachée). `DbgJouer` lance une partie.
- Mise au point dans Studio (barre de commande) : `workspace:SetAttribute("DbgAuto", true)` (pilote automatique), `DbgNitro`,
  `DbgInf`, `DbgPlein`, `DbgDauphins`, `DbgSerpent`, `DbgArgent` (un compte), `DbgBudget` (le budget de triangles),
  `DbgFx` = "mort" | "moteur7" | "pluie" | "cratere" | "jus3", `DbgOuvre` = "jouer" | "garage" | "boutique" | "reglages" |
  "roue" | "menu" | "pause" | "frenesie" | "portail…" (en course : saute au pied du portail, pour voir le niveau suivant) |
  "saut22…" (un saut forcé, la poussée sur deux chiffres), `DbgLarge` = 1280 (l'interface d'un écran 16:9).
- **La roue au banc** : `DbgRoue` = "ouvrir…" | "tourner…" | "garder…" | "vendre…" | "ok…" | "fermer…", `DbgRoueCase` = 1-8
  (force la case, Studio seulement) ; les cadeaux : `DbgRevenu` = "prendre…" | "temps…" | "classement…" | "fermer…".
- **La longue partie** : `sh outils/longue.sh [minutes] [nitro]` — sur rails (`DbgAuto` = "rail"), immortelle (`DbgImmortel`), les
  portails franchis pour de vrai ; rend les zones traversées, les morts évitées par cause et les erreurs de la Sortie. À lancer
  avant de livrer un changement de jeu : c'est le seul banc qui joue des niveaux ENTIERS.
- `outils/verifier.sh` compile tout ET liste les noms jamais déclarés (luau-analyze, s'il est à côté de luau-compile).
- `DbgEclair` = true : dans l'orage, un éclair toutes les 2 s qui tient 1,2 s (le temps d'une photo).
- `DbgHeure` = "matin" | "midi" | "aprem" | "titre" | "pluie" | "espace" | "tempete" | "minuit" impose une ambiance (`Client/Ambiance`) ; `nil` rend la main.
- `NIVEAU=ville sh outils/banc.sh` (ou `espace`, `orage`, `nuit`, `hard`) : la copie de test force ce niveau dès la zone 1 (`Config.NIVEAU_TEST`, jamais dans
  le fichier livré).
- ⚠ LE BUDGET DE MAILLAGES : la ville se prépare PENDANT le niveau d'avant ; si le budget est plein, Roblox refuse ses gabarits
  (tours sans fenêtres, route à facettes). Tout maillage de plus sur la route se paie quatre fois (les zones 1 et 2 restent en
  réserve, plus la zone en cours et la suivante) : la lueur des rails est une IMAGE, pas des triangles. `DbgBudget` mesure.
- ⚠ Hors de « la main », Studio bride la partie de test à 15 images par seconde (le pilote automatique sort de la route) :
  `outils/studio-actif.ps1` lui fait croire qu'elle l'a, sans la mettre devant. `outils/vue.py` cherche seul le cadre de la vue 3D.
- ⚠ Roblox Studio ne rend plus une seule image quand l'écran du PC s'est mis en veille (la partie de test se fige, les photos
  sortent blanches) : `outils/ecran-allume.ps1 [minutes]` réveille l'écran et le garde allumé le temps du banc, sans rien régler.
- Les nuages : `outils/cuire-nuages.js [ébauche] [fine]` (12 et 26 par défaut) cuit les 25 gabarits en deux finesses ; la fine
  n'est chargée que pour les nuages proches (`Nuages.finesseTick`).
- Budget de triangles : détruire une pièce ne rend rien, c'est son maillage d'origine qu'il faut détruire — `Client/Maillage`
  le fait pour toute pièce bâtie par lui (`Maillage.libre()` donne ce qu'il reste).
- ⚠ LA MÉMOIRE DES PIÈCES : une pièce posée dans le monde laisse ~1,25 Ko derrière elle à sa destruction (mesuré au banc, même une
  Part toute simple). Les décors de zone passent donc par `Client/Recyclage` : `Recyclage.part()` / `Recyclage.copie(gabarit)` pour
  bâtir, et la zone oubliée rend ses pièces marquées (attribut `Rec`) à la réserve au lieu de les détruire.
- ⚠ LA DISTANCE D'AFFICHAGE : Roblox démarre en qualité graphique basse et n'affiche pas le lointain (sur un téléphone en qualité
  basse : jamais). Un décor qui doit se voir tient à ~1 000 studs — le titre est une maquette (`Config.CIEL.titreK`).
- Bancs : `LANGUE=en sh outils/banc.sh` (tout le jeu en anglais), `TACTILE=1` (l'interface du téléphone) ; côté joueur,
  `client("stats")` (triangles, appels de dessin, mémoire par catégorie), `client("arbre", "monde" | "w:Zone3")` (ce qui vit dans le
  monde, pièce par pièce), `client("ecran", racine, nom)` (où tombent des pièces à l'écran). `DbgOuvre` = "achat:N" | "achat:oui" |
  "quitter". Le banc attend `MenuPret` (posé après l'intro du studio) ; `DbgSansIntro` saute l'intro.
- Les numéros des sons : `outils/remplir-sons.luau` (barre de commande de Studio) remplit `CashCar/SonsIds` ; recopier la liste qu'il
  écrit dans la Sortie dans `src/ReplicatedStorage/CashCar/SonsIds.luau` pour qu'elle survive à la reconstruction du `.rbxlx`.
- La sauvegarde : `Profils.sauverBientot` (une écriture au plus toutes les 7 s par joueur) ; une lecture ratée à l'arrivée donne
  une session `horsLigne` qui n'écrit jamais (elle n'écrase pas la vraie progression).
