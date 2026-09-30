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

**Porté** : la route-ruban dans le ciel qui plonge (motifs du niveau NUAGES : virages qui plongent, esses,
épingles, chicanes, LACETS, montagnes russes, plongeons), les deux faces de la dalle (on roule dessous !),
la conduite v6, le moment, la nitro-réservoir, NITROOO, les pads turbo en train, le vol (vrilles, piqué /
cabré qui fait tourner la trajectoire, coup de nitro, portance), les atterrissages notés (PARFAIT + hit-stop,
POSÉ LOURD, DE TRAVERS, AU CHEVEU), les BUMPS sur la tranche, le DAUPHIN, le RACCOURCI, les figures et la
chaîne ×2/×3/×4,5/×6, les 30 paliers de MOTEUR, l'argent, l'aura, les 4 pouvoirs (nitro infinie, airtime
infini, speed ×2, aimant), le portail et les zones qui s'enchaînent, la mort (6 s en l'air, le vide, roule ou
crève), l'écran de mort, le classement (record à vie sauvegardé), le multijoueur (on voit les caisses des
autres sur la même route).

**Pas encore** : les 68 caisses du garage (une seule caisse, couleur par joueur), le menu CHUTE, les autres
niveaux (ville, Paris, espace…), la frénésie / FLOW, la meute de police, les missions, la boutique, l'annonceur,
le drift et la fronde, les plots / flaques / épaves. Le module FILET est écrit mais retiré (voir `Piste.luau`).

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
- Vérifié hors de Roblox : les 10 scripts compilent avec le compilateur officiel Luau, l'analyseur est propre,
  et la génération de piste tourne au banc (4 zones à la suite : 0 croisement, raccords exacts, ~20 % des
  sorties de route « à l'aveugle » se reposent, 25 % dans les LACETS). **Pas encore joué dans Roblox Studio.**
