# Graphismes de l'ordi à coût nul — passation (2026-11-12)

Demande de Sacha : « lance une grosse session pour améliorer les graphismes au global pour la version Vercel sans que ça coûte en performance ».
Branche `claude/graphismes-ordi-cout-nul-89230f` (worktree `.claude/worktrees/bold-bardeen-1e4a65`), repartie d'`origin/main`, fusionnée avec `origin/main` v1501, cache **v1502**.
**Rien n'est poussé** : la publication attend l'accord explicite de Sacha.

## Ce que l'audit a montré
- Le jeu porte déjà trois couches de couleur calées sur des mesures (`rendu/etalonnage-da.js`, `rendu/equilibre-maps.js`, `rendu/lumiere-design.js`) et une passe « embellie » par map.
  Empiler une quatrième couche de couleur globale défait ce travail : cette session ne corrige que des DÉFAUTS VISIBLES, map par map.
- Les maps du ciel (nuages, Crypto City jour et nuit, Jade, orbite, canyon) sont propres sur les photos du banc. Deux défauts nets, corrigés ci-dessous.

## Fait (committé)
1. **La route sans écailles au loin** — `code/rendu/bitume-beton.js` (`ROUTE_MIP`, `asphMips`, `betonPeint(N, plat)`).
   La dalle de béton (tuile 256², 7 m) porte de larges plages claires et sombres ; au loin elles revenaient tous les 7 m en quadrillage d'écailles, sur toutes les maps sèches.
   La texture reçoit ses propres mipmaps, peints une fois au chargement : niveau 0 identique au bit près, plages effacées par niveau (1 · 1 · ,6 · ,3 · ,12 · ,04 · 0),
   clarté moyenne conservée. Shader, lecture, filtrage, mémoire : inchangés. Chargement : ~3 ms de plus sur l'ordi. `?routemip=0` (ou `?joints=1`) = avant.
2. **L'entrée de la grotte se lit** — `code/maps/grottes-1.js` (`GRT_ENTREE`, `GRV.amb0` = 2,2), `code/maps/grottes-2.js` (`S.mine.fog` = ,135 · ,075 · ,047).
   Les 500 premiers mètres (torches, cristaux, magma) sortaient en vide noir : l'air de la mine était resté à × 1 quand les autres salles sont à × 2, et sa brume ambre
   était écrasée en noir par le contraste. Deux valeurs (l'une cuite aux sommets au chargement). Le NOIR COMPLET reste noir. `?sans=grtentree` = avant.
3. **Le banc** — `outils/banc-graphismes/banc.cjs` (photos jeu / caisse / decorA / decorB + mesures par couple map:météo, graine fixe, `?poste=max`, cran figé) et
   `planche.cjs` (planches-contact, paires AVANT / APRÈS, `--recadre`). Mode d'emploi en tête de chaque fichier.

Planches : `passation/graphismes-ordi/route-avant-apres.png` (vue de haut, Crypto City, orbite, nuages au soir) et `grotte-avant-apres.png` (torches, cristaux).

## Mesures (ordi, 1600×900, image figée re-rendue 120 fois, médiane)
Avant / après ALTERNÉS, trois tours (route seule) : orbite 5,5-5,7 → 5,2-6,2 ms ; nuages soir 6,1-7,4 → 6,6-7,0 ms ; Jade midi 10,7-13,7 → 10,5-11,9 ms. Écart dans le bruit.
Grotte après les deux lots : 5,8-7,2 ms contre 5,6-7,8 ms avant (même fourchette). Appels de dessin, triangles, textures, programmes : identiques (aucun objet, aucune passe, aucun programme en plus).
Le bruit d'une passe à l'autre va de ±0,1 à ±1 ms selon la charge de la machine (d'autres sessions tournent) : toujours alterner.

## Vérifié / pas vérifié
- Vérifié : `assembler --verifier`, `garde-allege.sh`, `garde-charte.sh`, `outils/garde-demarrage.cjs`, analyseur `non-declares.cjs` (même liste qu'origin/main, 0 doublon),
  photos avant/après de la route sur 4 maps et de la grotte sur ses 5 temps, `?tel=1` sur les nuages (la route) sans erreur.
- Dernière vérification, sur la base fusionnée v1500 (7 couples avant/après, 2 en `?tel=1`) : appels de dessin, triangles, textures, programmes identiques ; image figée dans le bruit
  (avant 4,5-14 ms, après 4,2-9,5 ms, la machine était chargée par d'autres sessions). `?tel=1` : nuages et grotte sans erreur ; une photo des nuages au matin sortait
  dorée « après » : refaite, identique à l'avant (le ciel du titre était encore en train de passer au matin au moment de la photo, ce n'est pas la retouche).
- Deux courses complètes `course.cjs` (grotte au matin, nuages au soir) : 0 exception, 0 requête en échec. Les avertissements de la console (WebGL « too many errors »,
  readback, vibrate) sont les mêmes sur origin/main (même banc, 275 contre 278 lignes).
- PAS vérifié : la paire avant/après des 27 couples sur la base fusionnée (la passe « avant » complète date d'avant la fusion : les nuages ont changé de route en v1500) ;
  l'accueil, le garage et la boutique (aucune retouche ne les vise, aucune photo prise) ; un vrai téléphone ; un Mac.

## Reste à faire (pour un autre modèle, rien de difficile)
1. Passe « après » complète : `node outils/banc-maps/serveur.cjs 8231` puis `node outils/banc-graphismes/banc.cjs --out=<dossier> --cartes=toutes`, et la même sur un worktree
   d'`origin/main` (port 8232) pour les paires ; planches par `planche.cjs --contre=`.
2. Photos des écrans : `node outils/banc-ecrans/photos.cjs --formats pc1080 --ecrans accueil,garage,inventaire,boutique --save riche --q "intro=ancien&attente=0&poste=max"`.
3. Si Sacha dit oui : `git fetch`, fusionner `origin/main` (pour `sw.js` : `git checkout --theirs` puis +1), `assembler --depuis-morceaux`, gardes, pousser À PART, vérifier `/jouer/sw.js` en ligne.

## Points relevés, non traités
- **Canyon de nuit** : au banc, les falaises sortent orange et lavande, claires comme en plein jour sous un ciel bleu nuit (la palette prévue, `CONTI.nuits.canyonNuit`, est bleu sombre).
  Cause non établie : l'équilibre des maps (expo × 1,25, lumières × 1,15) ou les feux de route du 11/11 (`?sans=route` pour comparer). À regarder avant de toucher.
- **Trait d'horizon des nuages** : 2 px clairs entre la mer et le ciel (la mer rend la couleur de la brume sur la ligne d'horizon, le ciel juste au-dessus est plus sombre). Mineur.
- **Jade** : la route sort bleu-violet saturé le matin et à midi (elle est à l'ombre des pics) ; goût, pas défaut.
- Le piqué de la passe finale (`uSharp`) vaut 0 à pleine résolution par principe : un écran d'ordi à 1 pixel par point n'a donc aucune accentuation. Essai possible par `dbgGfx({pique:.15})`.

## Idées payantes, mises de côté (non faites)
- Anticrénelage multi-échantillons de la toile sur l'ordi : retiré le 05/11 pour ~100 Mo de mémoire ; le remettre coûte cette mémoire et un « resolve » par image.
- Anisotropie 16 sur la route et les lignes : plus de lectures de texture par pixel rasant ; gain faible depuis que le lointain de la route est lissé.
- Casser la répétition de la dalle DE PRÈS (deux lectures décalées ou une rotation par dalle) : une lecture de texture de plus par pixel de route, la moitié de l'écran.
- Ombre du soleil en 1536 ou 2048 au lieu de 1280 : passe d'ombre ~30 à 150 % plus chère.
