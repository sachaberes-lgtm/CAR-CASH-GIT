# NOTES — etal-ville (passe graphismes, 14/10) — l'étalonnage de LA VILLE à ses 6 météos
Branche `gfx/etal-ville` : 3 commits, UNIQUEMENT des valeurs dans le bloc `ÉTALONNAGE · LA VILLE` (6 lignes `Object.assign(BIOMES.<nom>,{…})`). 2 ouvertures navigateur (essais + contrôle), 0 erreur JS. Banc : `banc/etal-ville/` (ville.cjs, variantes-ville.json, bloc.txt). Planche : `shots/etal-ville/planche.png`.
Couples → ambiances lues (vérifié à l'image : `niveau.ciel`) : matin villeMatin · midi villeMidi · soir villeSoir · nuit nuitNoire (niveau MINUIT) · pluie `pluie` (niveau VILLE, pluie 1) · orage villeOrage (orage).
## Produits mesurés à l'image (uniformes) : sat / con / expo final
matin 1,19 / 1,19 / ~1,0 · midi 1,21 / 1,25 / ~1,0 · soir 1,25 / 1,25 / 1,02 · nuit 1,12 / 1,14 / 1,05 · pluie 1,04 / 1,15 / .85 · orage 1,08 / 1,16 / 1,02 — tous sous les plafonds.
## Ce qui a changé
- Jour (matin/midi/soir) : valeurs des Nuages reprises (clé, ombres, brume de la couleur de l'horizon, vignette neutre), ciel un cran plus gris-bleu (zénith azur moins vif ; au 1er essai il restait cobalt). Expo .96/.95/.90 → .91/.92/.96.
- Nuit : `jour` 0 → 1 (le dégradé « Vice City » à horizon rose est remplacé par le ciel linéaire de la charte #0B1230 → #1E2A52), expo .62 → .85, hemiI .16 → .4, lune .14 → .55 ; kick magenta, env/eS rose-cyan retirés. Vu : béton bleu-nuit lisible (plus de trou noir), ciel plus noir que la route, étoiles et tours lisibles.
- Pluie : `jour` 1, ciel et brume gris-bleu (plus de violet), kick/fill sans magenta/teal, expo .72 → .8, sat 1,38 → .96. Vu : gris-bleu, route mouillée, enseignes seules en couleur.
- Orage : ardoise comme la tempête des Nuages (`jour` 1, hemi/fill/kick/fog/vigC sans violet), expo .86. Vu : ardoise-indigo ; reste un peu bleu nuit.
## Doutes
- Le soir garde un haut de ciel mauve assez présent (mauve « doux » de la charte, mais plus saturé que le mien visé) ; béton un peu clair de jour (route-beton).
- Les halos/blobs violets au premier plan (soir, midi) sont des particules/bonus, pas l'étalonnage.
- L'orage est plus bleu que gris : si on veut plus ardoise, baisser le bleu de jZen/jMid ; non revu après le dernier ajustement des ciels.
