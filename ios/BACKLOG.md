# CASH CAR — BACKLOG

File d'attente consommée par la tâche planifiée. Une tâche par exécution.

## Objectif

Une version installable et jouable sur iPhone, complète sur le plan
fonctionnel, où il ne reste à produire que **la direction artistique** :
l'icône, les visuels, la typographie, les textes définitifs, les captures
et la vidéo de l'App Store.

Tout ce qui est structure — systèmes, écrans, logique, plomberie — se fait
ici, avec des contenus provisoires clairement marqués `[PLACEHOLDER-DA]`.

## Protocole

1. Prendre la première ligne `TODO` dont les dépendances sont `DONE`.
2. La passer en `DOING`, l'exécuter, vérifier le critère, commiter,
   passer en `DONE`. Puis s'arrêter.
3. Critère échoué deux fois → `BLOCKED` + notification Telegram avec
   l'erreur brute. Passer à la tâche suivante.
4. Ne jamais inventer un flag ou une option. Vérifier par `--help`.
5. Un garde-fou qui se déclenche n'est jamais un faux positif : s'arrêter,
   expliquer, attendre. Ne jamais reformuler pour passer outre.
6. Tout contenu visuel ou textuel provisoire est marqué `[PLACEHOLDER-DA]`
   dans le code et listé dans `DA-TODO.md` à la racine du projet.
7. Travailler dans `~/projets/sandbox/`. Jamais dans `~/projets/car-crash/`.
8. Notifications : silence sur succès. Récap unique chaque soir à 21h.

---

## T0 — Le jeu tourne-t-il encore ? `TODO`

Rien n'a validé que le jeu démarre depuis les ~200 remplacements de chaînes
de la phase 1. C'est la première chose à savoir.

Lancer le jeu dans Chromium headless, relever toute erreur console.

**Critère** : zéro erreur console au chargement et après 10 secondes de
simulation d'entrées.
**Si échec** : `BLOCKED` immédiat, notification avec les erreurs brutes.
Ne rien tenter d'autre tant que ce n'est pas réglé.

## T1 — Harnais de validation `TODO` (dép. T0)

Construire `~/projets/harness/check.sh <chemin>` :
(a) démarrage sans erreur console, (b) aucune URL externe, (c) tous les mp3
dans `CORE`, (d) reduce-motion coupe bloom/grain/FX, (e) tout élément
cliquable a un label, (f) aucune clé i18n brute affichée en fr ni en en.

PASS/FAIL par ligne, sortie non nulle si un échec.

**Critère** : échoue sur `~/projets/car-crash/` (b,c,d,e), passe sur
`~/projets/sandbox/`. Un harnais qui passe sur la version d'origine est
cassé.

## T2 — Le harnais tourne à chaque tâche `TODO` (dép. T1)

Intégrer `check.sh` au protocole : toute tâche modifiant le jeu le lance
avant de commiter. Régression détectée = la tâche n'est pas terminée.

**Critère** : une modification volontairement cassée est bien rejetée.

## T3 — Orientation iPad `TODO`

Le build remonte « All interface orientations must be supported ». Apple
exige les 4 orientations pour l'iPad. Le jeu est en portrait.

Déclarer l'app **iPhone uniquement** (`TARGETED_DEVICE_FAMILY = 1`) plutôt
que de forcer l'orientation sur iPad.

**Critère** : le build ne remonte plus ce warning.

## T4 — Système de tutoriel `TODO` (dép. T2)

Construire la **mécanique**, pas le contenu.

- Un moteur de tutoriel : séquence d'étapes, chacune avec une consigne
  affichée, une condition de réussite, et un surlignage de la zone à
  toucher
- Déclenché à la première partie, rejouable depuis les réglages
- Sauvegarde de l'état « tutoriel vu »
- Trois étapes provisoires `[PLACEHOLDER-DA]` : accélérer, tourner,
  déclencher une figure

**Critère** : le tutoriel se déclenche au premier lancement, les trois
étapes s'enchaînent, il ne réapparaît pas ensuite, et il est relançable.

## T5 — Garage et progression `TODO` (dép. T4)

Les 24 voitures existent déjà mais ne se débloquent qu'en cours de partie.
Construire la méta-progression.

- Écran garage : liste des voitures, verrouillées/déverrouillées, sélection
- Monnaie persistante gagnée en partie
- Coût de déblocage par voiture — barème provisoire `[PLACEHOLDER-DA]`,
  progression linéaire simple
- Sauvegarde locale

**Critère** : gagner de l'argent, acheter une voiture, la sélectionner, la
retrouver après redémarrage de l'app.

## T6 — Succès `TODO` (dép. T5)

- Un système de succès générique : identifiant, condition, état débloqué
- Écran de consultation
- Dix succès provisoires `[PLACEHOLDER-DA]` basés sur des métriques
  existantes (distance, figures, argent, voitures débloquées)

**Critère** : un succès se débloque en jeu et persiste après redémarrage.

## T7 — Game Center `TODO` (dép. T6)

- Plugin Capacitor Game Center, authentification au lancement
- Un classement (meilleur score) et le branchement des succès de T6
- Dégradation propre si l'utilisateur refuse Game Center

**Critère** : l'app compile avec le plugin, et se lance sans erreur quand
Game Center est indisponible.

## T8 — Audio iOS `TODO`

- Interruption propre sur appel entrant, reprise après
- Respect du commutateur silence
- Ne pas couper la musique de l'utilisateur : mixage plutôt qu'exclusivité

**Critère** : la catégorie audio est correctement déclarée, le jeu se met
en pause et reprend sur interruption simulée.

## T9 — Sauvegarde iCloud `TODO` (dép. T5)

Synchroniser la progression via iCloud Key-Value Store, avec repli local.

**Critère** : la progression survit à une désinstallation-réinstallation.

## T10 — Localisation `TODO` (dép. T4, T5, T6)

Les chaînes des nouveaux systèmes doivent rejoindre `fr.json` / `en.json`.
Aucune chaîne en dur.

**Critère** : `check.sh` test (f) passe sur les nouveaux écrans.

## T11 — Écrans App Store `TODO`

- Écran de réglages : langue, son, contrôles, relancer le tutoriel,
  lien vers la politique de confidentialité
- Page de politique de confidentialité, rédigée d'après ce que le jeu
  stocke réellement (auditer le code, ne rien inventer)
- Mentions légales

**Critère** : tous les écrans sont accessibles et navigables.

## T12 — Icône et écran de lancement provisoires `TODO`

Générer un jeu d'icônes et un launch screen **volontairement neutres** —
aplat de couleur, texte simple — marqués `[PLACEHOLDER-DA]`, aux formats
et dimensions exacts exigés par Apple.

Le but n'est pas de faire joli : c'est que la structure soit complète et
que Sacha n'ait qu'à remplacer des fichiers aux bonnes dimensions.

**Critère** : toutes les tailles requises présentes, PNG sans canal alpha,
le build les accepte.

## T13 — Sauvegarde distante `TODO`

Le VPS est l'unique exemplaire du code. Pousser sur le dépôt
`sachaberes-lgtm/projet_161` via la deploy key déjà en place.

**Critère** : `git push` réussit, le dépôt distant contient les commits.

## T14 — Rapport final `TODO` (dép. tout le reste)

Produire `DA-TODO.md` à la racine : la liste exhaustive de tous les
`[PLACEHOLDER-DA]` du projet, avec pour chacun le fichier, ce qu'il faut
produire, et les contraintes techniques (dimensions, format, longueur
maximale du texte).

**Critère** : chaque `[PLACEHOLDER-DA]` du code apparaît dans le fichier.

---

## Hors périmètre — Sacha uniquement

- L'icône définitive et toute la direction artistique
- Les textes définitifs du tutoriel et des succès
- L'équilibrage de l'économie du garage
- Les captures d'écran et la vidéo de preview
- Le compte Apple Developer, les certificats, la soumission
