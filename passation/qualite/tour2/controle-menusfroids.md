CONTRÔLE ADVERSE du lot « menusfroids » (qa/menusfroids, 6cf8a9c65). J'ai seulement lu le diff : pas de navigateur, rien de lancé.

Ce qui va
- Le lot touche les bons fichiers : `code/moteur/cadence.js` et `code/css/interface-opti.css` §5, plus un outil de banc et le rapport. Aucun fichier interdit. index.html et sw.js ne sont pas committés.
- La règle CHAÎNE PERDUE est respectée : seulement `animation-play-state:paused`, jamais `animation:none`.
- L'ordinateur et les téléphones hors profil ne passent pas dans ce code. `couvTick` et `veilleTick` sortent tout de suite si `!PRF.on`, `COUV.ok` et `VEIL.ok` exigent `TEL_NATIF`, et `hcSaute` n'est appelé que si `CAD.ok||PFR_ON` (boucle-1.js:8).
- La veille est bien prévue par le plan (lot 3 b). Sortir CONFIDENTIALITÉ de la scène couverte est justifié : son fond est à 0,97.

DÉFAUTS
Sérieux
1. cadence.js:319. Le MutationObserver surveille `class` et `style` sur tout `document.body` (`subtree:true`). Il est créé une fois et ne se débranche plus jamais, même en course. Or le HUD écrit des styles à chaque image (boucle-6-hud.js : 20 écritures `.style.`, plus hud-figures, bouton-nitro-gains, sensations-flow). Chaque écriture crée un enregistrement et un rappel. `veilleMut` sort aussitôt, mais les allocations et le passage de JSC restent, sur le profil iPhone, pendant toute la course. C'est une perte en jeu qu'aucune mesure du banc n'a vue (le banc ne regarde que les menus).
   Correctif : `observe()` dans `veilleEntre`, `disconnect()` dans `veilleReveil`.

Mineurs
2. cadence.js:187 et 280. `couvTick` tourne à chaque image en course aussi. Il construit la clé `couvCle` : plusieurs className mis bout à bout et 5 `getElementById`. En plus, `couvLit` passe toutes les 200 ms. Il vaudrait mieux le restreindre au menu et à la pause (`!started||garageOn||paused`).
3. cadence.js:313-316 et 280. `veilleEntre` peut poser `.ccVeilleP` sur un élément dont la classe fait partie de la clé (body, `gEl`, #plq, #prof). Si l'un d'eux porte lui-même une boucle infinie, la clé change, la veille se réveille aussitôt, puis se rendort 20 s plus tard, sans fin : elle ne servirait plus à rien. Le garage n'est pas touché (ses éléments sont restés gelés à 23 s au banc). Pour PLAQUE et PROFIL, ce n'est pas prouvé. Il faudrait exclure ces éléments ou retirer `ccVeilleP` de la clé.
4. cadence.js:319 et 307. Pas de réveil quand une classe de `<html>` change (`data-palier` posé par le gouverneur, `gvFixe`…) : `veilleMut` ignore `documentElement` et l'observateur est posé sur body. Pas de réveil non plus sur un pivot ni sur un media query. Une nouvelle animation qui démarre alors sur un élément gelé démarre en pause, à cause du `!important`. Si c'est une entrée qui part d'une opacité 0, l'élément peut rester invisible jusqu'au prochain toucher. Peu probable, mais rien ne le prouve.
5. cadence.js:290. Pour #overlay, le test de couverture lit l'opacité de `::before`, pas la transparence de son fond. Un fond rgba à 0,9 passerait pour couvrant. C'est prouvé par photo pour set, modes et shop depuis l'accueil. Ce n'est pas prouvé pour RÉGLAGES depuis la pause, ni depuis la feuille du garage au ciel, ni pour les sous-états de la boutique de la coque.

Affirmé sans preuve
- Le gain réel : rien sur l'iPhone, et le temps libre de RÉGLAGES est « trop bruité » pour conclure.
- RÉGLAGES ouverts depuis la pause : l'agent le reconnaît.
- La veille dans la boutique 3D et l'inventaire, vue seulement par la règle.
- Aucune mesure du coût en course de l'observateur ni de `couvTick` (voir 1 et 2).
- Le verrou de banc a été rendu sans relire qui le tenait : à signaler à l'orchestrateur, au cas où le verrou d'une autre session aurait été effacé.

Doutes
- Une boucle CSS qui pilote du JS par `animationiteration` s'arrête pendant la veille. Je n'en ai pas cherché.
- À la sortie de la scène couverte, la 1re image est redessinée à l'image suivante, ce qui est correct. Mais si `cadSaute` saute une image avant `hcSaute`, la clé n'est relue qu'à l'image d'après. Écart d'une image au plus.

VERDICT : fusionnable après correction. Le défaut 1 est à corriger avant fusion (observateur branché seulement pendant la veille). Les défauts 2 et 3 sont conseillés et faciles. Pour 4 et 5, une vérification au banc suffit.