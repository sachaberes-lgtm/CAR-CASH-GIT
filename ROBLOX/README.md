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

## Le mettre en ligne sur Roblox — la check-list (dans l'ordre)

Le jeu est PRÊT À PUBLIER (4/10) : réglages de test coupés, aucun prix en euros, aucune marque déposée dans les noms, les chances
de la roue affichées, l'argent de fin de partie borné par le serveur (anti-triche), la sauvegarde sûre. Ce qui reste, c'est TON
compte Roblox qui le fait — Claude ne publie pas à ta place :

1. **Ton compte** : vérifié par pièce d'identité (13 ans ou plus) — Roblox l'exige pour les formes 3D que le jeu fabrique par code.
2. **Studio → Fichier → Publier sur Roblox** (File → Publish to Roblox) → « Créer une nouvelle expérience », nom `CASH CAR`,
   genre Course.
3. **Studio → Paramètres du jeu → Sécurité** : cocher **« Activer l'accès de Studio aux services API »** (sauvegarde,
   classement) et **« Autoriser les API de maillage et d'image »** (Allow Mesh & Image APIs — sans ça, ni caisses ni nuages).
   Sauvegarder.
4. **create.roblox.com → ton expérience** :
   - **Questionnaire** (Audience → « Questionnaire sur la maturité ») : le jeu n'a ni violence réaliste, ni sang, ni texte libre
     entre joueurs ; il a des achats en Robux (si tu en crées) et une ROUE avec des lots au hasard — répondre honnêtement ;
   - **Paramètres de base** : la description — prête dans **`publication/description.txt`** (français + anglais) ;
   - **Places → Icône et vignettes** : glisser **`publication/icone-512.png`** et les cinq vignettes `vignette-*.png` ;
   - **Appareils** : ordinateur, téléphone, tablette, console (tout est jouable : clavier, tactile, manette) ;
   - **Places → Nombre de joueurs max** : 12 conseillé (chacun voit les caisses des autres sur sa route) ;
   - **Localisation** : langue source Français, ajouter Anglais (le jeu suit la langue du joueur tout seul).
5. (Optionnel, pour gagner des Robux) créer les passes, produits et badges — voir « Gagner de l'argent avec le jeu » plus bas —
   et recopier leurs numéros dans `Config.REVENUS`, puis `node ROBLOX/construire.js` et republier.
6. **Rendre l'expérience Publique** (Paramètres de base → Public) quand tu es prêt.

À chaque nouvelle version : `node ROBLOX/construire.js`, ouvrir `CashCar.rbxlx` dans Studio, **Fichier → Publier sur Roblox**.

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

## Les sons — FAIT le 5/10

✅ Les 122 sons sont importés sur ton compte et leurs numéros sont dans `src/ReplicatedStorage/CashCar/SonsIds.luau` (vérifiés au
banc : tous se chargent). Rien à refaire — sauf si tu ajoutes un son : la marche à suivre ci-dessous reste valable.

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
- la **boutique** : le KIT DU PILOTE, les **offres en Robux** (×2 ARGENT, NITRO INFINIE, CŒURS), les **packs d'argent** et les **13
  caisses légendaires** se vendent dès que tu as créé leurs numéros (voir « Gagner de l'argent avec le jeu ») — avant, leur carte dit
  « BIENTOT » ;
- **LA ROUE** (accueil) : un tour gratuit toutes les 4 h, un tour offert toutes les 3 parties ; on y gagne de l'argent, un skin, ou
  l'une des 9 caisses EXCLUSIVES (à garder ou à revendre 7 500 $, au choix). Les cases et leurs chances : `Config.ROUE` ;
  « 3 TOURS » en Robux : `REVENUS.produits.tours3` (à créer, comme le cœur) ;
- les **sons** : les 122 sont importés (5/10) — bruitages, boucles moteur/nitro/drift et les six musiques ;
- le **TOP 10 mondial** est « SANS AIDE » : seule une partie jouée sans cœur, sans nitro infinie et sans mode facile y monte (le
  record de l'écran de fin, lui, compte tout) ;
- le mode FACILE existe dans le code mais il est éteint (`Config.FACILE_ACTIF`).

## Pourquoi le compte vérifié et les « API de maillage » (étapes 1 et 3)

Le jeu fabrique ses formes 3D par code (caisses, nuages, moteurs, dauphins…). Roblox l'autorise seulement si :
1. **Paramètres du jeu → Sécurité → « Autoriser les API de maillage et d'image »** (Allow Mesh & Image APIs) est activé ;
2. le compte qui publie est **vérifié** (pièce d'identité, 13 ans ou plus) — c'est une règle de Roblox pour ces API.

Sans ça, en ligne, les formes cuites ne s'afficheraient pas. Autre limite de Roblox : tout ce qui est bâti par code se partage
environ 68 000 triangles ; le jeu tient dedans (il compte ce qu'il utilise et rend ce qu'il détruit), mais certaines vignettes
du garage restent en pastille de couleur quand la place manque. La solution définitive serait d'importer les maillages comme
ressources Roblox (ton compte) : à voir plus tard.

## Gagner de l'argent avec le jeu

Tout est déjà codé et **éteint** : chaque objet payant attend son NUMÉRO dans `src/ReplicatedStorage/CashCar/Config.luau`,
bloc `Config.REVENUS`. À 0, il ne se vend pas (dans la boutique, sa carte dit « BIENTOT »). Le **prix**, c'est sur Roblox que tu le
fixes : le jeu le lit tout seul (le prix de CHAQUE joueur : prix régional, remise Roblox Plus) et l'écrit sur les cartes (« R$ 500 »).

**Ce qui se vend (Sacha, 5/10 : « fais de ce jeu une usine à fric »)** — tout est dans la **BOUTIQUE** (bouton BOUTIQUE de l'accueil
et de l'écran de fin, et la tuile **BOUTIQUE ROBUX** en bas à gauche de l'accueil), de haut en bas :
- **LE KIT DU PILOTE** (produit, **99 R$**, une fois par compte) : la carte dorée « OFFRE DE BIENVENUE » en tête de la boutique —
  50 000 $, 3 cœurs et la traînée POUDRE D'OR (rangée au garage). Acheté, la carte disparaît ;
- **×2 ARGENT** (passe, **500 R$**) : tout l'argent de chaque partie compte double, pour toujours — aussi proposé sur l'écran de fin ;
- **NITRO INFINIE** (passe, **700 R$**) : la jauge de nitro ne se vide jamais (violette). Celui qui l'a peut la **couper** et la
  rallumer : RÉGLAGES → colonne JEU → « NITRO INFINIE » (la ligne n'apparaît qu'à qui possède le passe ; allumée au départ) ;
- **LES CŒURS** (produits, s'achètent autant de fois qu'on veut) : **1 cœur (50 R$)**, **5 cœurs (199 R$)**, **15 cœurs (499 R$)**.
  Un cœur = une vie : quand la caisse explose, une carte propose **« UTILISER UN COEUR »** (gratuit, un appui — la caisse repart là où
  elle a explosé, avec son argent, son moteur et sa zone) ou **TERMINER** ; c'est le joueur qui choisit, rien ne part tout seul. Sans
  cœur, la même carte propose d'en acheter un (après 20 s de course) : acheté, il sert aussitôt. Les cœurs se gardent d'une partie
  à l'autre (« ♥ 3 » en haut à droite pendant la course) et ne s'effacent pas avec la progression ;
- **VIP** (passe) et **3 TOURS DE ROUE** (produit) : leurs cartes n'apparaissent que quand leurs numéros existent. La carte 3 TOURS
  mène à LA ROUE (qui montre ses chances avant l'achat, règle de Roblox) et se cache là où Roblox interdit de vendre du hasard ;
- **L'ARGENT** (5 produits, achat répété) : 25 000 $, 70 000 $, 150 000 $, 325 000 $, 900 000 $ versés au compte (les montants se
  règlent dans `Config.REVENUS.argent`). Le badge « BONUS +x % » n'apparaît que s'il est vrai (calculé sur les vrais prix) ;
- **LES 13 CAISSES LÉGENDAIRES** (13 produits, achat UNIQUE) : la vitrine de la boutique — ACHETER ouvre la fenêtre de Roblox ;
  achetée, la caisse dit « A TOI ! », elle est au garage (à équiper) et ne se rachète pas. Purement cosmétique : la vitesse vient du
  moteur, jamais de la caisse. Ce qui a été payé en Robux (cœurs, kit, caisses légendaires) survit à « EFFACER MA PROGRESSION ».

**Un achat n'est accordé qu'une fois SAUVÉ** : le serveur écrit la sauvegarde du joueur AVANT de dire « accordé » à Roblox ; si
l'écriture rate, Roblox représente le reçu plus tard — et un reçu déjà servi ne crédite jamais deux fois.

Ce que le jeu fait déjà, gratuit, pour faire REVENIR les joueurs :
- **le cadeau du jour** : une fenêtre à l'accueil, 7 jours qui montent (500 $ → 5 000 $) ; rater un jour = retour au jour 1 ;
- **les cadeaux de temps de jeu** : 5, 15, 30, 60 minutes dans la session, puis chaque heure (tuile en bas à gauche) ;
- **inviter des amis** : la fenêtre d'invitation de Roblox ; un ami qui arrive par ton lien = 1 000 $ pour lui et pour toi ;
- **le TOP 10 MONDE** : les meilleurs records de tous les serveurs (il a besoin des API de données, voir plus bas) ;
- **les joueurs Premium** gagnent +10 % (et Roblox te paie au temps qu'ils passent dans le jeu, sans rien vendre).

Ce que TU dois créer sur **create.roblox.com → ton expérience** (le prix se règle là-bas, au moment de la création ou après) —
chaque numéro se recopie dans `src/ReplicatedStorage/CashCar/Config.luau`, bloc `Config.REVENUS`, **à la place du `0`** de la
ligne indiquée. « Passe » = Monétisation → **Passes** ; « Produit » = Monétisation → **Produits de développeur**.

| # | Nom à lui donner | Type | Prix conseillé | Où recopier son numéro (`Config.REVENUS`) |
|---|---|---|---|---|
| 1 | « x2 ARGENT » | Passe | **500 R$** (l'étude conseille 399) | `passes = { argent2 = … }` |
| 2 | « NITRO INFINIE » | Passe | **700 R$** (ou 699) | `passes = { nitroInfini = … }` |
| 3 | « VIP » (cadeaux doublés, nom doré) | Passe | 449 R$ | `passes = { vip = … }` |
| 4 | « COEUR » (une vie) | Produit | **50 R$** (ou 49) | `produits = { coeur = … }` |
| 5 | « 5 COEURS » | Produit | **199 R$** | `produits = { coeur5 = … }` |
| 6 | « 15 COEURS » | Produit | **499 R$** | `produits = { coeur15 = … }` |
| 7 | « KIT DU PILOTE » (50 000 $, 3 cœurs, traînée POUDRE D'OR) | Produit | **99 R$** | `produits = { kit = … }` |
| 8 | « 3 TOURS DE ROUE » | Produit | 99 R$ | `produits = { tours3 = … }` |
| 9 | « 25 000 $ » | Produit | **99 R$** | `argent = { { id = … , v = 25000 }` (1re ligne) |
| 10 | « 70 000 $ » | Produit | **249 R$** | `argent` → 2e ligne (`v = 70000`), `id = …` |
| 11 | « 150 000 $ » | Produit | **499 R$** | `argent` → 3e ligne (`v = 150000`), `id = …` |
| 12 | « 325 000 $ » | Produit | **999 R$** | `argent` → 4e ligne (`v = 325000`), `id = …` |
| 13 | « 900 000 $ » | Produit | **2 499 R$** | `argent` → 5e ligne (`v = 900000`), `id = …` |
| 14 | « CHAT ARC-EN-CIEL » | Produit | **399 R$** | `caisses = { [9] = … }` |
| 15 | « REQUIN » | Produit | **799 R$** | `caisses` → `[10] = …` |
| 16 | « COMETE » | Produit | **399 R$** | `caisses` → `[11] = …` |
| 17 | « FORMULE OR » | Produit | **399 R$** | `caisses` → `[12] = …` |
| 18 | « ENDURANCE 24 » | Produit | **249 R$** | `caisses` → `[13] = …` |
| 19 | « EL PATRON » | Produit | **249 R$** | `caisses` → `[14] = …` |
| 20 | « ACIDE » | Produit | **149 R$** | `caisses` → `[15] = …` |
| 21 | « L'ETERNELLE » | Produit | **799 R$** | `caisses` → `[56] = …` |
| 22 | « LE TRONE CENTRAL » | Produit | **599 R$** | `caisses` → `[57] = …` |
| 23 | « LE SPECTRE » | Produit | **599 R$** | `caisses` → `[58] = …` |
| 24 | « LE CHEVALIER NOIR » | Produit | **799 R$** | `caisses` → `[59] = …` |
| 25 | « LE MUR DU SON » | Produit | **549 R$** | `caisses` → `[60] = …` |
| 26 | « LE DRAGON D'OR » | Produit | **799 R$** | `caisses` → `[61] = …` |
| — | Bienvenue, Permis, Zone 6, Moteur palier 10, 1 000 d'aura, Millionnaire, 7 jours d'affilée | Engagement → **Badges** (chaque badge coûte un peu de Robux à créer) | — | `badges = { bienvenue = …, permis = …, zone6 = …, moteur10 = …, aura1000 = …, millionnaire = …, serie7 = … }` |

(Les caisses sont des **produits**, pas des passes : le jeu garde lui-même qui les possède, et n'en propose pas le rachat à qui les a.
Une caisse = son numéro de catalogue entre crochets, déjà écrit dans le fichier avec son nom en commentaire : tu remplaces juste le
`0`.)

Le numéro d'un passe ou d'un produit : son ID, affiché sur sa page du site (ou « Copier l'ID » dans le menu ⋯ de sa vignette) — un
nombre, à coller à la place du `0`. Pour l'image d'un passe, une capture du jeu suffit.
- **(optionnel) un groupe Roblox** pour le jeu → son numéro dans `groupe = …` : le rejoindre donne 2 000 $ (une fois) ;
- **Paramètres → Sécurité → « Activer l'accès Studio aux API »** et la publication : sans ça, ni sauvegarde ni classement.

Puis `node ROBLOX/construire.js` et republier. Les sommes (cadeaux, bonus) se règlent dans le même bloc.
⚠ Le questionnaire de maturité (Audience) doit dire que le jeu a des achats en Robux.

## Lire les statistiques (une fois le jeu en ligne)

Creator Hub → ton expérience → **Analytics**. Le jeu y envoie lui-même (rien à régler) :
- **Funnels → Onboarding** : sur 100 NOUVEAUX joueurs, combien 1. arrivent, 2. lancent une course, 3. la finissent, 4. en
  relancent une, 5. tiennent une minute, 6. achètent une caisse. La marche où la courbe chute, c'est là qu'il faut travailler.
- **Economy** : les dollars du jeu qui entrent (course, cadeaux, roue, packs payés) et qui sortent (caisses, habillages).
- **Custom events** : `ZoneAtteinte`, `MontantCourse`, `DureeCourse`, `CoeurUtilise`, `Robux_<produit>`.
Les chiffres apparaissent après quelques heures, et seulement pour le jeu publié (Studio n'envoie rien).

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
- **Les achats en Robux au banc** (posés CÔTÉ SERVEUR, Studio seulement) : `DbgPasse` = "nitroInfini" | "argent2" | "vip" (ou plusieurs :
  "nitroInfini,argent2") fait comme si le joueur possédait ces passes (nil rend la main) ; `DbgCoeurs` = 3 pose le stock de cœurs.
  **Un reçu simulé** (5/10) : `DbgAchat` = "coeur" | "coeur5" | "coeur15" | "kit" | "argent1"…"argent5" | "caisse9"…"caisse61" |
  "tours3" — accordé par la MÊME porte que les vrais achats (`recevoir` dans `ServerScriptService/Revenus`), la Sortie écrit la
  décision et le compte / les cœurs / le kit / les caisses avant → après ; un mot de plus pour rejouer le même produit
  (« coeur5 2 ») ; "rejouer" représente le DERNIER reçu simulé (rien ne doit être crédité deux fois) ; `DbgSauveKO` = true fait
  « rater » l'écriture (la décision devient NotProcessedYet).
  La carte du cœur à la mort : avec des cœurs (`DbgCoeurs` = 2), elle propose UTILISER UN COEUR à chaque explosion ; sans cœur,
  `DbgSeconde` = "oui" l'ouvre même sans numéro, après 20 s de course ; puis `DbgRevenu` = "continuer…" (le cœur sert, on repart) ou
  "refuser…". La boutique : `DbgOuvre` = "boutique", puis "achat:offres" (l'état de chaque carte — kit, offres, argent, caisses —
  dans la Sortie), "achat:offre:coeur5", "achat:kit", "achat:argent:2" (presse ACHETER — dans Studio, un achat de TEST, rien n'est
  débité), "achat:3" puis "achat:oui" (la fenêtre d'une caisse de la grille, et son ACHETER).
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
  une session `horsLigne` qui n'écrit jamais (elle n'écrase pas la vraie progression). Les ACHATS EN ROBUX passent par
  `Profils.sauverMaintenant` (écrit tout de suite, rend vrai si c'est fait) : `ProcessReceipt` ne répond « accordé » qu'après.
  Le profil n'est LU qu'une fois à la fois (`Profils.pret`) : un reçu en attente qui arrive avec le joueur attend la lecture.
- Ajouter un produit en Robux : son numéro dans `Config.REVENUS`, son nom dans `nomProduit` et ce qu'il donne dans `octroyer`
  (`ServerScriptService/Revenus`), sa carte dans `Client/Boutique`, son bandeau dans `annonce` (`Client/Revenus`).
