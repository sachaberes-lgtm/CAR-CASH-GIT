# NOTES — jade-nuit (A4, passe graphismes, 14/10) — branche gfx/jade-nuit, commit b0f315c

## Ce qui est posé (VALEURS seulement, derrière `JADENUIT_V2`, éteint par `?sans=jadenuit`)
- `const JADENUIT_V2` + `if(JADENUIT_V2){Object.assign(BIOMES.jadeNuit,…);Object.assign(BIOMES.jadeOrage,…);}` juste avant `// (fin PICS DE JADE)`.
- `cotonJade` : teinte de nuit ×(.56,.58,.68) → ×(.28,.34,.38) ; orage ×(.8,.8,.86) → ×(.62,.66,.70) (ancienne valeur si `?sans=jadenuit`).
- Rien d'autre (ni `JADE_U`, ni `BIOMES.jade`, ni jour/soir/pluie/matin, ni DA/ACES).

## Le piège qui explique « rochers noirs sur ciel noir » (calculé, PAS encore vu à l'image)
Les cibles de la charte (#0D1A1E, #1C3036) converties en « linéaire » (x^2,2) tombent à 0 : la chaîne (ACES par canal → contraste pivot .5 → saturation × grade
du téléphone) écrase en noir pur tout ce qui sort du shader du ciel sous ~.09. Modèle de la chaîne : `banc/jade-nuit/modele.cjs`, inversion : `inverse.cjs`
(`node inverse.cjs "#1C3036" "{expo:1.05,k:1.16,sat:1.15,sh:[0,.012,.024]}"`). Valeurs posées (sortie visée, par le modèle) :
- nuit : jdZ [.100,.113,.116] → #0D1A1E ; jdH [.130,.155,.160] → #1B3036 ; `fog` = [.13,.155,.16] (les pics lointains se fondent dans l'horizon, les proches restent noirs) ; jdB [.15,.19,.20] ; jdS [.55,.78,.74] (halo de lune et trait sur le fleuve) ; jdK [.9,.12,.32,1].
- orage : zénith ≈ #1C282B (jdZ [.125,.14,.141]) → horizon ≈ #4D6468 (jdH [.23,.27,.28]), `fog` [.23,.265,.275].
- Les uniformes réels (expo/sat/con) de la nuit viennent des notes etal-jade (1,05 / 1,15 / 1,16) : le modèle les suppose, À VÉRIFIER à l'image (le banc d'exploration lit `O.unif`).

## PAS FAIT / à faire (la machine est tombée à une charge de 660 ; aucune ouverture de navigateur, 0 capture)
- `node banc/jade-nuit/explore.cjs e1 nuit` (une ouverture : jeu + vue lointaine, variantes à chaud en 3e argument) puis `planche.cjs` (3 pages : AVANT `?sans=jadenuit` | APRÈS | APRÈS + `?courbe=2`, + vue debout) → `shots/jade-nuit/planche-iphone.png`. Scripts écrits, jamais lancés jusqu'au bout.
- Doute n°1 : `jLointain` (GLSL du ciel) a des teintes de crêtes lointaines CODÉES EN DUR de jour (.60,.70,.79 → .20,.31,.31) : si elles sortent pâles la nuit, c'est un défaut de shader (hors zone / hors périmètre « aucun shader ») → proposition : multiplier par une luminance de nuit.
- Doute n°2 : la lune du ciel est argent-BLEU en dur (.80,.86,.98) ; « argent-vert » demande le shader ; seul `jdS` (halo, éclat sur l'eau) est réglable.
- Doute n°3 : le béton nuit (L* 14-20) n'a pas été mesuré.

## MISE À JOUR 14/10 (11 h 25) — VU À L'IMAGE (palier 2, DPR 1, cran réel ; planche : shots/jade-nuit/planche-iphone.png)
- Commits : b0f315c (valeurs calculées) + d8adcd2 (vu à l'image : jdK.y 0 = kasumi dorés/sable éteints, coton de nuit ×(.14,.17,.19), jdK orage [0,0,.62,0]). 0 erreur JS sur les 4 passes.
- Modèle vérifié : uniformes réels de la nuit expo 1,053 / sat 1,145 / con 1,16 (= ceux supposés). Nuit : pics lisibles en silhouettes sur ciel vert-teal, lune (disque bleu-lavande plat, peint en dur), béton lisible, plans pâlis par la brume.
- Orage : horizon ardoise plus clair que le zénith, pics noirs découpés. Midi et soir : même palette qu'avant (pas de code qui les touche) ; les images diffèrent seulement par la position dans la course.
- Réserves : coton de nuit encore un peu clair à droite sur la planche (réglable : tableau t de cotonJade) ; lune argent-bleu en dur ; crêtes lointaines GLSL de jour en dur (non gênantes vues) ; jus de fruit rose sur plusieurs vignettes (hors zone) ; en midi/soir le cran adaptatif est descendu (DPR .85) sous la charge.
