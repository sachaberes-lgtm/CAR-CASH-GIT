# textes — passe des libellés FR / EN / ZH (2026-10-14, branche ui/pages, SANS navigateur : rien n'a été vu à l'écran)

## Mécanisme (pour reprendre)
- Clé = la phrase française (souvent SANS accent : « REGLAGES »). `I18N` (EN) et `I18N_ZH` (ZH) sont remplies par ~100 `Object.assign` dispersés ; le dernier gagne. Mon bloc « LA PASSE DES TEXTES » est juste après la ligne `TOUS LES REGLAGES`.
- NOUVEAU : `I18N_FR` (var, hissée) = le français AFFICHÉ quand il diffère de la clé. `TR()` la lit en FR. Écrire avec les accents.
- `majPix` (retire l'accent des capitales, car pixel) travaille désormais PAR MOT : un mot tout en capitales perd son accent, un mot qui a des minuscules (« Ça », « Élue ») le garde, une capitale seule (« À ») aussi si la chaîne a des minuscules. Drapeau `PIX_ACC` (false).
- Outils : `ui/banc/textes/charge.cjs` (charge les tables sans navigateur), `manque.cjs` (clés ZH manquantes), `q.cjs <index> <regex>` (cherche une clé/valeur), `accents.cjs`, `restes-fr.cjs`, `cmap-woff2.cjs` / `glyphes-woff2.cjs` (lit les glyphes de la police pixel).

## Police pixel et capitales accentuées (DÉCISION À PRENDRE AU BANC)
`pressstart2p.woff2` contient 220 glyphes dont À Â Ä Ç È É Ê Ë Î Ï Ô Ù Û Ü Œ (identifiants distincts de é, è…). Décodé : « É » = un E aplati sur 5 rangées avec l'accent sur 2 rangées au-dessus (hauteur de capitale conservée, lettre plus petite). C'est lisible mais irrégulier à côté des capitales pleines. Je n'ai pas pu le juger à l'écran : `PIX_ACC=false` (comme avant). Pour tester : mettre `const PIX_ACC=true`, regarder CARRIÈRE / RÉGLAGES / DÉFIS à 16 px et à 8-10 px. Si bon : les clés sans accent (REGLAGES, CARRIERE…) devront recevoir un affichage accentué dans `I18N_FR` (la clé reste inchangée).

## Fait (compte de libellés)
- FR : 7 affichages changés via I18N_FR (GAME OVER→PERDU, RAPIDE→BASSE, NETTE→HAUTE, MONTE→MONTER, PLONGE→PLONGER, HOME→ACCUEIL) + le comportement de majPix (≈ 18 phrases retrouvent leurs capitales accentuées : « Ça roule », « À toi pour toujours »…).
- EN : 4 (RAPIDE→LOW, NETTE→HIGH, SAUVEGARDE→SAVE DATA, LOCALE→LOCAL) + VERSION.
- ZH : 52 clés ajoutées / corrigées, tous sûrs (réglages, boutons, codes, boutique) ; manquantes 495 → 445.
- VERSION LOCALE (pied des réglages) suit la langue, y compris au changement de langue.
- Examiné, JUSTE : « ENTER A CODE » traduit ENTRER UN CODE (ce n'est pas RESTORE A CODE) ; l'anglais n'a pas de reste français (script restes-fr.cjs) ; les phrases de description FR sont déjà accentuées dans les clés.

## Reste
- ~445 clés ZH manquantes (le chinois retombe sur l'anglais) : descriptions des 60 caisses, niveaux, ville, fourgon, textes d'événements. Pas ajoutées : je ne suis pas sûr du ton ni du sens des jeux de mots.
- « COMMUNE » affiché sur la seule caisse du joueur : logique d'affichage du garage, pas un texte.
- « MUS » (EN/FR) est une abréviation sans mot ; « drift », « TOP 10 », « BUMPS », « GAPS », « NORMAL » restent anglais en FR (vocabulaire du jeu, pas touché). « CAISSE » et « VOITURE » coexistent en FR.
- Les `.mBack` statiques (« RETOUR » dans le HTML) ne portent pas data-fr : je n'ai pas vérifié qu'ils se traduisent hors c6.

## Libellés à risque de débordement (à faire voir au banc)
- FR « ACCUEIL » (7 signes) à la place de « HOME » (4) : boutons maison du garage `gmHome`, `gClose`, `gHomeBas` (index.html ~8338, 8385, 8391) et le dock de la carrière (~20559). En c6 plusieurs sont masqués, à vérifier.
- FR « PLONGER » (7) à la place de « PLONGE » (6) et « MONTER » (6) pour « MONTE » (5) : ligne POUCE HAUT des réglages et de la pause (~8650, ~51614), la valeur est dans une pastille or.
- FR « PERDU » est plus court que « GAME OVER » : aucun risque. EN « SAVE DATA » (9) pour « SAVE » dans l'en-tête de section SAUVEGARDE : large, sans risque.
- EN « GRAPHICS / LOW / HIGH » : pareil que la ligne IMAGE actuelle. ZH : tous plus courts.
- « VERSION LOCAL » (EN) et « 版本 本地 » (ZH) : le pied des réglages, 8 px pixel, centré.
