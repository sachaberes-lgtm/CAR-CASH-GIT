# CASH CAR — passation de session (mise à jour 2026-08-03)

## Le projet
- **Un seul fichier** : `index.html` (~7 400 lignes, HTML+CSS+JS mélangés — c'est voulu, ne pas découper).
- **Three.js r128** via CDN. **Aucun build**, aucune dépendance.
- Dossier : `/Users/mulei/Downloads/CAR CAHS V3`
- Tester : `python3 -m http.server 8000` puis `localhost:8000` (nécessaire pour les mp3).
- **Git initialisé, 30 commits.** `git log --oneline` pour l'historique, `git checkout <id> -- index.html` pour revenir.
- Copie de secours dans `versions/`.
- `CLAUDE.md` contient la doc technique d'origine du jeu (architecture piste, nuages, biomes, audio…).

## LES 3 DÉCISIONS DE DESIGN À NE PAS REFAIRE
1. **Les PIÈCES font monter le MOTEUR** (pas les fruits). Les **fruits servent au boost** uniquement.
2. **La VOITURE est purement COSMÉTIQUE.** Elle ne donne ni vitesse ni valeur de pièces, et **ne change plus en pleine partie** (le déblocage est enregistré, le modèle se choisit au garage). C'est le **moteur** qui porte toute la progression.
   *(2026-08-03 : trois fuites qui la rendaient NON cosmétique ont été bouchées — l'overdrive de vitesse
   suivait le niveau de caisse, `spec.turn` donnait un meilleur braquage aux caisses tardives, et les
   bots de Survivant roulaient avec la fiche de la caisse équipée.)*
3. **On démarre TOUJOURS en bas de l'échelle**, avec **1,61 €** et le **moteur rouillé**.
   *(2026-08-03, arbitré avec l'utilisateur : la CARROSSERIE, elle, est celle choisie au garage —
   le bouton ÉQUIPER sert enfin. Ce qui repart de zéro, c'est le moteur et l'argent, pas le skin.)*

## Ce qui a été construit cette session
- **Créatures** : 2 dauphins qui se croisent (figure LE DAUPHIN), 1 serpent néon (SNAKE LOOP). Aperçus autonomes : `dauphins.html`, `serpent.html`.
- **Radio 1.61** : bande-son réactive (le ciel pulse au beat, le son s'ouvre avec la vitesse, tape-stop en fin de partie). `MUSIC.run` est **VIDE** — aucun morceau fourni. `MUSIC.byLevel` prêt pour un morceau par niveau.
- **Décollage** : double-tap NITRO = la caisse s'arrache au ciel + 2 s de ralenti + tout ×2. La jauge rose se remplit en **tenant le boost**.
- **Effets de vitesse** réservés au boost (warp du monde, aberration, tunnel, FOV).
- **Nuages** jouables (plus de white-out), brillants, répartition stratifiée, destructibles au contact.
- **Planète Terre** (~62 % de l'écran, Europe/Afrique, Sahara, halo cyan).
- **Garage** (24 caisses, on ÉQUIPE — appliqué au démarrage depuis le 2026-08-03), **Étal** et **Atelier moteurs** retirés du menu (accessibles en console : `openStall('fruit')` / `openStall('moteur')`).
- **6 fruits** : banane, pêche plate, orange, myrtille (très fréquente), grenade, **PASTÈQUE** (le graal : boost 2.0, fréquence 1). Splash de jus coloré + son. **Grappes suspendues dans le ciel**, attrapables **en vol uniquement**.
- **30 moteurs** (10 à l'origine) : du **moteur rouillé** au **TROU NOIR**, en passant par H16 F1, rotatif
  triple, statoréacteur, réacteur nucléaire, antimatière et la COMÈTE. Poussée ×1,00 → ×4,20.
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
3. ~~**Vignette 3D du moteur en jeu**~~ — **FAITE (2026-08-03)**. Elle est REVENUE et montre le MOTEUR
   (plus la caisse : c'est lui qui porte la progression). Rendu dans un `WebGLRenderTarget` dédié, puis
   recollé APRÈS le composer comme un quad en caméra orthographique — le viewport de la passe finale
   n'est jamais touché, c'était ça la déformation. Sa POSITION vient du DOM (`#engVig`) : le CSS décide
   seul, responsive et mobile compris. Cadrage automatique : chaque moteur est mis à l'échelle pour
   remplir le cadre (mesuré : 10 des 30 paliers débordaient sinon).

## CE QUI A ÉTÉ TRANCHÉ LE 2026-08-03
- **30 paliers moteur** (au lieu de 10). ⚠ Un ratio 1,5× CONSTANT est impossible sur 30 marches
  (1,5^29 ≈ 100 000) : l'intention est tenue avec un écart qui part à ×1,40 et se détend vers ×1,10,
  plus des **paliers-cadeaux** volontaires (V16, QUADRITURBO, RÉACTEUR NUCLÉAIRE, COMÈTE, TROU NOIR
  tombent juste après une marche chère). `DENOMS` a été recalée sur 30 entrées : vérifié qu'à nombre de
  pièces égal la valeur d'une pièce reste à ±3 % de l'ancienne — **l'économie n'a pas bougé**.
- **Déblocage des voitures : les TROIS familles mélangées**, une condition par caisse (`CAR_UNLOCK`) —
  7 au record de partie, 8 au palier moteur atteint, 8 en défis nommés. Tout sur des compteurs
  PERSISTANTS (`SAVE.d.ex`). ⚠ Les caisses ne se gagnent plus dans l'ordre : toujours passer par
  `carUnlocked(i)`, jamais par une comparaison à `bestCar`.
- **La caisse équipée s'applique au départ.** Ce qui repart de zéro à chaque partie, c'est le MOTEUR et
  les 1,61 € — la carrosserie est un choix cosmétique. Clause de grand-père : les caisses gagnées sous
  les anciennes règles restent acquises (`ex.floor`).
- **Traduction anglaise faite** : dictionnaire `I18N` clé=phrase française, fonction `TR()` (⚠ pas `T`,
  déjà pris par le tableau des tangentes de la piste), `applyLangDOM()` pour le HTML statique.

## EN ATTENTE DE DÉCISION
- **Capacités moteur** : 4 sont codées (réserve de nitro — elle ne marchait PAS, aucun palier ne
  définissait `res`, c'est réparé —, billets, aimant à pièces calmé, comète en feu). Restent à faire :
  double flamme, traînée de feu, plots qui explosent, onde de choc. Les seuils sont nommés dans `ENG_CAP`.
- **Silhouettes des voitures** : « certaines se ressemblent trop » — refonte non commencée.
- **Le panneau `#carInfo` est masqué** (`display:none!important`, ligne ~29, choix « HUD épuré ») : le nom
  de la caisse conduite n'apparaît donc NULLE PART en jeu. Son contenu est juste, mais il faut décider
  si on le rallume — la vignette moteur est aujourd'hui la seule fiche visible.
- **Équilibrage à jouer pour de vrai** : les seuils `cash` de `CAR_UNLOCK` (2 500 → 250 M) sont posés à
  l'estime. Une vraie session dira s'ils tombent trop vite ou trop lentement.
- **Sons de mort/fin** : l'utilisateur doit les fournir.
- **Contrastes visuels et sonores entre moteurs** : à enrichir (30 paliers pour 24 timbres, la palette
  sonore est étalée mais deux paliers voisins peuvent partager une voix).

## Hooks console utiles
`dbgState()` `dbgPerf()` `dbgCar(i)` `dbgEngine(i)` (prévisualiser un palier moteur dans la vignette ; `dbgEngine(null)` pour revenir au tien) `dbgHudCar()` (la vignette dessine-t-elle vraiment ? lit le RenderTarget) `dbgBoom()` `dbgTakeoff()` `dbgDrift()` `dbgFx()` `dbgPlanet()` `dbgMusic()` `playMusic(url)` `dbgStep(n,ms)` (avance la boucle à la main : indispensable si l'onglet est en arrière-plan).

## Conseils de méthode (retour d'expérience)
- **Deux ou trois objectifs à la fois**, pas de longues listes : les effets de bord se multiplient sinon.
- **Relire le code concerné avant de modifier** — plusieurs bugs de cette session étaient des effets de bord (menu masqué, voiture imposée, tirelire à 320 000).
- Le jeu **se met en pause quand l'onglet est masqué** : en test automatisé, forcer la reprise.
- **Exiger une capture ou un retour visuel** avant de toucher à un problème d'apparence — les mesures ne disent pas si c'est beau.
