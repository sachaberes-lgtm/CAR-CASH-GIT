# L'OUROBOROS DU CHARGEMENT — notice d'intégration

Demande de Sacha (2026-11-03) : « pendant le temps de chargement, un mini Ouroboros pixel, mignon, noir et blanc, qui se mord la
queue en boucle ; animation simple, pas de ressources, mais très belle ». Le dessin et l'animation sont de Fable 5.1 (ce dossier) ;
l'intégration dans le jeu est à faire par un autre modèle en suivant cette notice.

## Ce qu'il y a ici
- `ouroboros-44px-48img.png` — la bande : 48 images de 44 × 44 px côte à côte (2112 × 44), palette transparent / blanc / gris / noir, 1,3 Ko.
- `ouroboros.css` — LE BLOC À COLLER : `#spCharge` avec la bande en data-URL, `steps(48)` sur 4 s (12 images/s), `image-rendering:pixelated`,
  affiché ×2 (88 px), `prefers-reduced-motion` → image fixe. Aucun JS : visible dès la première image, avant tout script.
- `demo.html` — la démo seule sur fond noir (`?zoom=4` pour voir les pixels).
- `ouroboros.cjs` + `png.cjs` — le générateur (`node outils/ouroboros/ouroboros.cjs` régénère tout). Ne pas changer l'échelle ×2 :
  à ×1,5 les pixels deviennent inégaux sur iPhone (DPR 3).

## Intégration (dans `code/`, jamais dans index.html à la main)
1. `code/page/ecrans-garage.html`, dans `<div id="splash">` : remplacer la ligne `<style>#spCharge{…}</style>` (l'anneau CSS de Léo du 02/11)
   par `<style>` + le contenu de `ouroboros.css` + `</style>`. GARDER `<div id="spCharge"></div>` et son id : `chCl()` dans
   `code/moteur/intro-161.js` le fond en opacité puis le retire quand la boule de l'intro se dessine — rien à changer côté JS.
   Mettre à jour le commentaire HTML au-dessus (c'est l'Ouroboros, plus l'anneau).
2. `node code/assembler.cjs` (puis `node code/assembler.cjs --verifier`) : index.html est refabriqué.
3. `VERSION PRINCIPALE/sw.js` : remplacer la ligne `const CACHE = 'cashcar-v1103'` par v1104 avec une note courte
   (« l'Ouroboros pixel remplace l'anneau du chargement »), sans garder l'ancienne ligne.
4. Vérifier dans un navigateur en servant `VERSION PRINCIPALE/` (entrée `.claude/launch.json`, `--bind 0.0.0.0`) :
   `index.html` (téléphone couché) et `index.html?colonne=portrait` (debout) — l'Ouroboros apparaît tout de suite sur le noir, au centre
   (haut 46 %), il s'anime (les écailles avancent, la tête fait « gloups » à 1 s, l'œil cligne à 3 s), puis il s'efface quand la boule
   se dessine. Capture d'écran en preuve. Vérifier aussi que menu → JOUER démarre une course (rien d'autre ne doit avoir changé).
5. Commit `code/` + `VERSION PRINCIPALE/index.html` + `sw.js` ENSEMBLE (message en français), sur la branche `ouroboros-chargement`,
   `git push origin ouroboros-chargement`. NE PAS fusionner dans `main` : Sacha décide après avoir vu. `app-ios/www` est généré : ne pas y toucher.
