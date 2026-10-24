# CASH CAR — la carte du code (à lire en premier)

CASH CAR est un runner arcade 3D (three.js) pour téléphone : on conduit une caisse sur une route suspendue dans le ciel, on vole, on ramasse de l'argent et on achète des voitures au garage.

## Quel fichier fait quoi
- `VERSION PRINCIPALE/index.html` : le jeu que le navigateur charge. **Fabriqué à partir de `code/` : on ne l'édite pas.**
- `code/ORDRE.txt` : les 206 morceaux, dans l'ordre, avec une ligne sur ce que contient chacun (la carte détaillée).
- `code/assembler.cjs` : `node code/assembler.cjs` recolle index.html après une modif (et l'inverse si quelqu'un a touché index.html).
- `code/page/` : le HTML (la tête, les écrans, les balises `<script src>`).
- `code/css/` : tout le CSS, balises `<style>` comprises.
- `code/rendu/` : scène three.js, ciel, lumière, bloom, qualité, traînées, effets.
- `code/maps/` : les maps (nuages, forêt, canyon, dunes, glacier, volcan, grottes, villes, Paris, Jade, orbite), biomes, niveaux.
- `code/voitures/` : `cars.js` (LA TABLE), `deblocage.js` (prix, conditions), les dessins (`shapes-*`, `gamme-*`, un fichier par voiture récente), `buildcar.js`.
- `code/economie/` : boutique (`SHOP`, `shopBuy`), achat (`carBuy`), contrats, argent de l'atelier, boutique du jour, final spin.
- `code/gameplay/` : flow, frénésie, pouvoirs, figures, impact, mort, caméra, aura, pose, seconde chance, ramassage.
- `code/missions/` : la table, le moteur, l'écran, la révélation, les missions de l'atelier.
- `code/son/` : musique, voix des moteurs, console et graphe audio, mute ; `moteur-vivant.js` = le second moteur (?moteurvivant=1, DSP dans `assets/audio/moteur-vivant/`, atelier d'écoute dans `atelier-son/moteur-vivant/`).
- `code/interface/` : traductions (`I18N`), menus, garage, boutique 3D, inventaire, HUD des figures, auto-école.
- `code/moteur/` : la boucle `loop()` (6 tranches `boucle-*`), cadence, init, `intro-161.js` (l'intro du studio : cinq « 1.61 » blanc sur noir au choix `?label=neon|or|poussiere|luxe|hype|demo`, noir, logo qui casse l'écran ; l'ancienne est dans `init.js`, `?intro=ancien`), mobile/tactile/PWA.
- `code/sauvegarde.js` : `SAVE`, la sauvegarde (localStorage `cashcarSave`).
- `VERSION PRINCIPALE/` autour d'index.html : `figures.js`, `sfx.js` + `sons-banque.js`, `sw.js` (cache), `assets/`, `vendor/`.
- `GUIDE-COMPLET.md` : l'ancien guide (livraison, Léo, tests, pièges, recettes). Ne l'ouvrir que pour un point précis.

## Ajouter une voiture (4 endroits)
1. `code/voitures/cars.js` : une fiche à la FIN de `CARS` : `{name, shape, color, accent, maxKmh, accel, turn, h, w, l, spoiler, rar, fx:{jet,core,trail,light}, desc}`.
2. `code/voitures/deblocage.js` : sa condition à la FIN de `CAR_UNLOCK`, même index : `{p:prix}`, `{k:'premium',eur:'x €',rar:'leg'}`…
3. Son dessin : un nouveau fichier `code/voitures/<nom>.js` avec `SHAPES.<shape>=function(K){…};`, inscrit dans `ORDRE.txt` juste avant `voitures/buildcar.js`.
4. Son nom traduit, dans ce même fichier : `Object.assign(I18N,{"LE NOM":"THE NAME","sa desc":"its desc"});`.
⚠ Jamais insérer ni retirer une ligne au milieu de `CARS` / `CAR_UNLOCK` : la sauvegarde désigne les voitures par leur index. Retirer = `{retire:1,name:'…'}`.

## Conventions
- Un morceau est une tranche BRUTE d'index.html, souvent pas du JS complet (une fonction peut commencer dans le précédent) : on n'y ajoute aucun en-tête.
- Après toute modif dans `code/` : `node code/assembler.cjs`, puis committer `code/` ET index.html ensemble. `--verifier` contrôle sans rien écrire.
- Nouveau morceau : couper un fichier entre deux instructions et l'inscrire à sa place dans `ORDRE.txt`.
- Tout le JS du jeu est UNE fonction `(function(){'use strict'; … })()`, ouverte dans `interface/icones-fenetre.js` et fermée dans `moteur/desktop-banc.js` : les noms se voient d'un morceau à l'autre, rien n'est global.
- Noms et commentaires en français. Une section s'ouvre par `/* ===== LE TITRE (date, qui : « la demande ») ===== */`. Jamais de `//` au milieu d'une ligne : `/* … */`.
- Crochets de test : `window.dbgXxx`. Variantes : paramètres d'URL `?x=`.
- Chaque changement du jeu : `cashcar-vNNN` +1 dans `VERSION PRINCIPALE/sw.js` (le hook pre-push l'exige).
- Livrer : partir d'`origin/main` à jour, fusionner (jamais de force), pousser sur `main` (Vercel publie https://car-cash-git.vercel.app/jouer/). Règles complètes : « SANS TOUT CASSER » dans `GUIDE-COMPLET.md`.
