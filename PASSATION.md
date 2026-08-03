# CASH CAR — passation de session (2026-08-02)

## Le projet
- **Un seul fichier** : `index.html` (~7 400 lignes, HTML+CSS+JS mélangés — c'est voulu, ne pas découper).
- **Three.js r128** via CDN. **Aucun build**, aucune dépendance.
- Dossier : `/Users/mulei/Downloads/CAR CAHS V3`
- Tester : `python3 -m http.server 8000` puis `localhost:8000` (nécessaire pour les mp3).
- **Git initialisé, 26 commits.** `git log --oneline` pour l'historique, `git checkout <id> -- index.html` pour revenir.
- Copie de secours dans `versions/`.
- `CLAUDE.md` contient la doc technique d'origine du jeu (architecture piste, nuages, biomes, audio…).

## LES 3 DÉCISIONS DE DESIGN À NE PAS REFAIRE
1. **Les PIÈCES font monter le MOTEUR** (pas les fruits). Les **fruits servent au boost** uniquement.
2. **La VOITURE est purement COSMÉTIQUE.** Elle ne donne ni vitesse ni valeur de pièces, et **ne change plus en pleine partie** (le déblocage est enregistré, le modèle se choisit au garage). C'est le **moteur** qui porte toute la progression.
3. **On démarre TOUJOURS sur LA HONTE** (la cabossée), avec **1,61 €**. Chaque partie repart en bas de l'échelle.

## Ce qui a été construit cette session
- **Créatures** : 2 dauphins qui se croisent (figure LE DAUPHIN), 1 serpent néon (SNAKE LOOP). Aperçus autonomes : `dauphins.html`, `serpent.html`.
- **Radio 1.61** : bande-son réactive (le ciel pulse au beat, le son s'ouvre avec la vitesse, tape-stop en fin de partie). `MUSIC.run` est **VIDE** — aucun morceau fourni. `MUSIC.byLevel` prêt pour un morceau par niveau.
- **Décollage** : double-tap NITRO = la caisse s'arrache au ciel + 2 s de ralenti + tout ×2. La jauge rose se remplit en **tenant le boost**.
- **Effets de vitesse** réservés au boost (warp du monde, aberration, tunnel, FOV).
- **Nuages** jouables (plus de white-out), brillants, répartition stratifiée, destructibles au contact.
- **Planète Terre** (~62 % de l'écran, Europe/Afrique, Sahara, halo cyan).
- **Garage** (24 caisses, on ÉQUIPE — actuellement ignoré au démarrage), **Étal** et **Atelier moteurs** retirés du menu (accessibles en console : `openStall('fruit')` / `openStall('moteur')`).
- **6 fruits** : banane, pêche plate, orange, myrtille (très fréquente), grenade, **PASTÈQUE** (le graal : boost 2.0, fréquence 1). Splash de jus coloré + son. **Grappes suspendues dans le ciel**, attrapables **en vol uniquement**.
- **10 moteurs** : du **moteur rouillé** à la **COMÈTE** (caisse en feu), avec H16 F1, plasma, réacteur nucléaire. Poussée ×1,00 → ×4,20.
- **Les figures rapportent des pièces** (2 à 18) → elles font monter le moteur.
- **Explosion cartoon** (volutes en chou-fleur + dards), **menu arcade néon**, **réglages** (audio, commandes, sauvegarde, **langue FR/EN** avec devise €/$).
- **Mobile** : commandes adaptées, menu qui tient en paysage.
- « **Roule ou crève** » : 6 s d'immobilité = explosion.

## BUGS CONNUS NON RÉSOLUS
1. ~~**Le 1,61 € ne s'affiche pas AU MENU**~~ — **CORRIGÉ (2026-08-02)**. Cause : la SEULE repeinte du compteur vivait
   dans `loop()`, sous le gate de simulation — au menu elle ne tournait jamais et le HUD gardait le
   `$00000000` écrit en dur dans le HTML. Le correctif précédent avait été posé dans `commitName()`,
   qui ne s'exécute qu'à l'enregistrement d'un score au TOP 10 : d'où l'impression qu'il « ne prenait pas ».
   Désormais un seul écrivain, `paintMoney()`, appelé à l'INIT (le point qui manquait), dans `start()`,
   au changement de langue et dans `commitName()`. Vérifié en jeu : le menu affiche `€ 00000001,61`.
2. ~~**Le nom de la caisse dans le HUD** n'est pas rafraîchi**~~ — **CORRIGÉ (2026-08-02)**. Cause : le cache
   de la fiche (`loop._lvlHud`) n'avait pour clé que `level`. Or depuis que la voiture est COSMÉTIQUE,
   `level` ne bouge plus, alors que la ligne affiche « pièces de X » qui suit `denom()` → donc `engTier`.
   La fiche était figée sur la valeur du palier moteur 0 pour toute la partie. Remplacé par
   `paintCarHud()`, clé `level+'|'+engTier`, appelé aussi à l'init (fiche juste dès l'écran d'accueil).
3. **Vignette 3D du moteur en jeu** : demandée, désactivée car la première version détournait le viewport et déformait l'image. À refaire via un RenderTarget dédié (jamais en touchant au viewport de la passe finale).

## EN ATTENTE DE DÉCISION
- **Nombre de paliers moteur** : l'utilisateur en veut « beaucoup, 30 ou 50 », en **une seule longue liste**. La courbe des coûts doit suivre des principes de récompense (paliers rapprochés au début, ratio ~1,5× constant, irrégularité volontaire).
- **Règles de déblocage des voitures** (par niveaux/challenges) — non tranché. En attendant, `equipped` est **ignoré** au démarrage.
- **Capacités moteur** : 4 sont codées (réserve de nitro, billets, aimant à pièces calmé, comète en feu). Restent à faire : double flamme, traînée de feu, plots qui explosent, onde de choc.
- **Silhouettes des voitures** : « certaines se ressemblent trop » — refonte non commencée.
- **Traduction anglaise** : la mécanique existe (sélecteur + devise), **les textes sont tous en français**.
- **Sons de mort/fin** : l'utilisateur doit les fournir.
- **Contrastes visuels et sonores entre moteurs** : à enrichir.

## Hooks console utiles
`dbgState()` `dbgPerf()` `dbgCar(i)` `dbgBoom()` `dbgTakeoff()` `dbgDrift()` `dbgFx()` `dbgPlanet()` `dbgMusic()` `playMusic(url)` `dbgStep(n,ms)` (avance la boucle à la main : indispensable si l'onglet est en arrière-plan).

## Conseils de méthode (retour d'expérience)
- **Deux ou trois objectifs à la fois**, pas de longues listes : les effets de bord se multiplient sinon.
- **Relire le code concerné avant de modifier** — plusieurs bugs de cette session étaient des effets de bord (menu masqué, voiture imposée, tirelire à 320 000).
- Le jeu **se met en pause quand l'onglet est masqué** : en test automatisé, forcer la reprise.
- **Exiger une capture ou un retour visuel** avant de toucher à un problème d'apparence — les mesures ne disent pas si c'est beau.
