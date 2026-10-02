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

## Les commandes

| | PC | Manette | Téléphone |
|---|---|---|---|
| Volant | ← → (ou Q/A et D) | stick gauche | pouce gauche (le stick naît sous le doigt) |
| Nitro | ESPACE ou MAJ | R2 ou A | gros bouton NITRO (pouce droit) |
| En l'air : piquer / cabrer | ↑ / ↓ (ou Z/W, S) | stick gauche haut / bas | pouce gauche haut / bas |
| Freiner (au sol) | ↓ ou S | L2 ou B | pouce gauche tiré vers le bas |
| Pause | P | Start | bouton II en bas |

Le gaz est automatique partout. On sort par le **bord** de la route, on vole (vrilles, piqué, nitro), on se
pose plus bas : c'est là que le jeu se joue. 6 secondes en l'air maximum.

## Les sons (à faire une fois)

Roblox ne joue que les sons importés sur Roblox. Le dossier **`sons-a-importer/`** contient 20 bruitages du
jeu (tirés de notre banque de sons), un **moteur** et une **nitro** en boucle, et la **musique** du niveau 1.

1. Studio → **Fenêtre → Gestionnaire de ressources** (Window → Asset Manager) → **Importation groupée** (Bulk Import)
   → sélectionner les fichiers de `sons-a-importer/`.
2. Clic droit sur chaque son importé → **Copier l'ID**.
3. Dans Studio, ouvrir `ReplicatedStorage → CashCar → Config`, bloc `Config.SONS`, coller chaque numéro :
   `piece = "rbxassetid://123456789",`
4. Refaire **Publier**.

Sans ça le jeu marche quand même (quelques sons de secours livrés avec Roblox : explosion, saut, vent).
Roblox limite le nombre d'imports audio par mois : commence par `moteur`, `nitro`, `piece`, `explosion`,
`poseParfait`, `musique`.

## Ce qui est porté / ce qui ne l'est pas encore

Le portage suit le jeu web **du jour** (`VERSION PRINCIPALE/index.html`), sur **trois niveaux** qui s'enchaînent de portail
en portail : **NUAGES → VILLE → ORBITE**, puis on recommence (décision de Sacha, 2/10 : « fais la ville et l'espace, fais pas
Paris » ; ni Paris, ni les variantes orage / minuit / pluie de satellites, ni la carrière pour l'instant).
- **AU-DESSUS DE LA VILLE** (`Client/Ville`) : le canyon de tours à fenêtres chaudes ou froides, les enseignes de néon, la nuit
  violette, la pluie, les rails roses et leur lueur sur le bitume mouillé ; une entrée surélevée puis la grande rampe ; des pentes
  comprimées, de grands virages ; en vol, entrer dans une tour tue.
- **EN ORBITE** (`Client/Espace`) : le ciel noir, la Terre qui se lève au bout de la route, la lune qui regarde la caisse, les
  Starlink et les débris ; une autoroute large et douce ; la gravité divisée par deux et la jauge de vol allongée (×1,7).
- Le niveau d'une zone : `Config.niveau(zone)` ; son ambiance : `Client/Ambiance` (`pluie`, `espace`) ; l'habit de sa route
  (liseré, bitume, lueur) : `HABITS` dans `Client/Construction`.

**Porté** (tout a été vu tourner dans Roblox Studio) :
- la route-ruban qui plonge, ses deux faces, la conduite, le drift, la fronde, les pads, plots, flaques, épaves ;
- le vol, les figures, les poses notées, les bumps, le bord (sursis, lèvre, bascule), la loi du réservoir de nitro ;
- le score du web : FLOW, frénésie (DARK TRIAD), chaîne d'aura, argent, 30 paliers de moteur avec la carte moteur 3D ;
- les effets (étincelles, gerbes, explosion, billets, pluie de devises, taches de jus), les nuages 3D, la mer de nuages ;
- le dragon de papier de NITROOO, le banc de dauphins, le serpent du snake loop (noirs en dark triad) ;
- l'écran titre (la caisse qui tombe dans le ciel), le menu, le garage (68 caisses, peintures, ailes, traînées, tas de
  billets), les missions (carnets de défis), la boutique (vitrine), les réglages, l'auto-école, l'écran de fin ;
- l'interface aux proportions du web (plaques penchées, icônes pixel, jauges en bandes) ;
- le classement, la sauvegarde, le multijoueur (on voit les caisses des autres).

**Pas encore / à décider par Sacha** :
- la **boutique ne vend rien** (comme sur le web : « BIENTOT ») ; sur Roblox les prix seront en **Robux** : à fixer ;
- le bouton **CARRIERE** dit « BIENTOT » (il n'y a qu'une map) : le garder, le retirer, ou en faire autre chose ;
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
  "missions" | "menu" | "pause" | "frenesie" | "portail…" (en course : saute au pied du portail, pour voir le niveau suivant), `DbgLarge` = 1280 (l'interface d'un écran 16:9).
- `DbgHeure` = "matin" | "midi" | "aprem" | "titre" | "pluie" | "espace" impose une ambiance (`Client/Ambiance`) ; `nil` rend la main.
- `NIVEAU=ville sh outils/banc.sh` (ou `espace`) : la copie de test force ce niveau dès la zone 1 (`Config.NIVEAU_TEST`, jamais dans
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
