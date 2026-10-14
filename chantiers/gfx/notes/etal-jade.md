# NOTES — etal-jade (passe graphismes, 14/10) — l'étalonnage des PICS DE JADE à leurs 6 météos

Branche `gfx/etal-jade` : UNIQUEMENT des valeurs, dans le bloc `// ---- ÉTALONNAGE · PICS DE JADE …` (6 lignes `Object.assign(BIOMES.<nom>,{…})`).
Couples lus (vérifié à l'image, `niveau.ciel`) : matin jadeMatin · midi jadeMidi · soir `jade` (aussi le SOLEIL DE JADE) · nuit jadeNuit (nuit:1) · pluie jadePluie (.75) · orage jadeOrage (orage).
Banc : `banc/etal-jade/` (jade.cjs, variantes-jade.json, bloc.txt = les 6 lignes, pose.py = les verse dans le fichier, releve.txt). Captures : `shots/etal-jade/` (planche.png = les 6 météos).

## Méthode
Les `jd*` (rouleau peint), `fog` sont dans le même espace que `jZen/jMid/jHor` (sortie directe du shader du ciel, avant ACES) : cibles de la charte converties en linéaire (≈ x^2,2).
`bioMet` copie au chargement : les lignes sont posées après toutes les définitions, donc chaque ligne ne change QUE son ambiance (jadeOrage est fille de jadePluie : redéfinie en entier).

## Produits mesurés (uniformes à l'image) sat / con / expo
matin 1,19 / 1,10 / 1,01 · midi 1,21 / 1,10 / 1,06 · soir 1,30 / 1,10 / .95 · nuit 1,15 / 1,16 / 1,05 · pluie 1,03 / 1,08 / 1,0 · orage 1,10 / 1,13 / 1,03 — sous les plafonds (matin avant retouche).

## Ce qui a changé
- MATIN : ciel azur pâle → céladon → brume blanc de brume → pêche clair à l'horizon (plus de turquoise saturé après le 2e essai), ombres bleu-vert (`sh`, `fillC`, `hemiG` verdi), `wb` neutre, vignette neutre (violet [.18,.08,.2] → [.04,.05,.06]), `volGnd` des cumulus sans violet, expo .9 → .95.
- MIDI : plus de cobalt : azur → céladon pâle → blanc de brume, clé blanche, ombres bleu-vert, vignette neutre, expo 1,0.
- SOIR (Léo) : seulement `sat` 1,08 → 1,2 (produit 1,30 = celui d'avant la couche commune) et `vigC` violet → prune sombre neutre. Rien d'autre.
- NUIT : bleu-vert sombre sans violet (ciel, brume, lune argent-bleuté [.6,.76,.92], fill/kick teal, env, vignette), béton lisible, `sunI` .62 → .5 et `hemiS`/`volSky` plus sombres pour que la ouate ne ressorte pas ; sat 1,1 → 1,06.
- PLUIE : ciel, brume et lumières du même gris à peine vert (perle), plus de lavande, sat .98 → .95.
- ORAGE : ardoise verdie : kick violet [.55,.46,1] retiré, ciel/brume/hemi/fill/env gris-vert sombres, vignette neutre, sat 1,12 → 1,02.

## Doutes
- Sapèques : jamais avalées vues à l'image (le décor jade est gris-vert/bleu, l'or reste le plus chaud) ; le matin garde un horizon pêche, pas ocre.
- Le béton (route-beton) prend la couleur de l'ambiance : brun-rose au soir (Léo), gris-vert ailleurs ; pas touché.
- Nuit : ciel encore très noir au zénith (étoiles éteintes dans le jade) ; la ouate proche reste gris-bleu clair par moments.
- Les taches roses/orange (particules, bonus) ne sont pas l'étalonnage.
