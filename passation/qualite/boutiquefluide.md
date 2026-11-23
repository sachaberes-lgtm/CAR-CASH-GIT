# Lot « boutiquefluide » — la boutique qui galère encore un peu (21/11)

Mots de Sacha (21/11) : « bon bah ca devient pas mal en vrai refait un truc d'optimisation de la boutique qui galère toujour un peu et après je crois qu'on a finis ».
Branche `qa/boutiquefluide` (partie d'origin/qualite-appareil f986821ae). Rien sur main, rien sur le téléphone, rien fusionné. `?sans=boutiquefluide` = l'avant.
Banc : `outils/banc-boutiquefluide/` (voir son LISEZ-MOI) — Chrome sans fenêtre et muet, iPhone 13 Pro émulé (`?tel=1&appareil=iPhone14,2`), processeur ×4,
index « gravé » pour que les photos soient GARDÉES d'un lancement à l'autre comme dans l'app (sans ça, la copie locale refait toutes les photos à chaque chargement).

## 1. La mesure d'avant : tout le parcours, rangé par temps perdu

Parcours : menu au repos → BOUTIQUE → les six rayons → 4 lancers aller + 4 retour de la bande (VOITURES, puis PEINTURES) → trois articles → un achat en pièces
→ ÉQUIPER → retour au menu → 2e ouverture. « Temps perdu » = somme, sur l'étape, de ce que chaque image dépasse 16,7 ms. Les temps sont ceux du banc
(Chrome + SwiftShader, processeur ×4), pas ceux de l'iPhone : ce sont les écarts avant / après qui comptent.

**Photos gardées (le cas de tous les jours)** — 4 essais d'avant (médianes) :

| étape | temps perdu | pire image | > 50 ms | > 100 ms | ce qui remplit la pire image |
|---|---|---|---|---|---|
| défilement VOITURES (8 lancers) | 2 558 ms | 225 ms | 21 | 5 | la caisse posée au repère est rebâtie à chaque arrêt de la bande : garageShow → buildCar ~136 ms, programmes ~30 ms |
| rayon PEINTURES (1re visite du lancement) | 1 634 ms | **850 ms** | 11 | 2 | les 39 pastilles à motif dessinées d'un bloc (motToile + toDataURL : canvas ~290 ms, JS ~415 ms) |
| 2e ouverture | 1 009 ms | 317 ms | 7 | 5 | la bande refaite (garBqPanneau ~320 ms : HTML, photos reposées, styles et mises en page forcés) |
| 1re ouverture | 942 ms | 358 ms | 6,5 | 3,5 | la bande bâtie (garBqPanneau ~255 ms, dont mise en page forcée ~96 ms), programmes ~39 ms |
| 3e article | 517 ms | 133 ms | 4 | 1 | buildCar ~80 ms, programmes ~28 ms |
| retour au rayon VOITURES | 326 ms | 217 ms | 2,5 | 1 | la bande refaite ~148 ms (dont mise en page forcée ~92 ms) |
| rayons FIGURES / AILES / TRAÎNÉES | 259 / 251 / 193 ms | 150 / 175 / 125 ms | 2-2,5 | 1 | la bande refaite (~50 à 90 ms), programmes ~30 ms |
| retour au menu | 234 ms | 125 ms | 2,5 | 1 | |
| achat | 210 ms | 125 ms | 2 | 1 | bqAction ~99 ms (la caisse achetée rebâtie), la vitre qui éclate (hors du fil principal) |
| articles 1 et 2 | 159 / 151 ms | 125 / 108 ms | 1 | 0,5-1 | buildCar ~51 à 63 ms |
| menu au repos, ACHAT, défilement PEINTURES, ÉQUIPER | ≤ 159 ms | ≤ 67 ms | ≤ 1 | 0 | |

**La trace (styles et mises en page, `trace.cjs`)** a montré ce que le profileur JS ne dit pas : pendant les ~0,5 s qui suivent l'ouverture, un changement de rayon ou
un changement de famille en faisant défiler, CHAQUE image recalcule le style de toute la boutique (30 à 60 ms par image, forcé à la 1re lecture de la page :
`pan.offsetTop` dans garBqPanneau, `#gCompteur` dans gHomePlace, `bords` au défilement). Cause : `--bqaRar`, la couleur de la rareté qui passe, est une propriété
enregistrée, HÉRITÉE, et c'est la racine de la boutique (#gBq) qui la fait glisser (.45 s).

**Le 1er lancement après une mise à jour (photos à refaire)** — 1 essai : ce sont les PHOTOS qui dominent (ouverture 3 965 ms perdus, rayon VOITURES une image
de 966 ms, défilement 3 964 ms : vitrinePhoto → buildCar, 200 à 900 ms par photo). Pas touché ici (voir 5).

## 2. Ce qui change (rien n'est retiré, rien n'est allégé)

1. **LES MOTIFS PRÉPARÉS EN DOUCE** (`economie/boutique.js`, `interface/boutique-peinture.js`). Les 39 pastilles à motif du rayon PEINTURES sont préparées au garage
   (menu ou boutique hors PEINTURES), au calme (`photoCalme` : ni geste, ni défilement, ni volet, la chauffe finie, rien en course), UNE toutes les 200 ms, dans l'ordre
   de la palette : la même toile (`motToile`, même tirage, 192 px), encodée par `toBlob` (même encodeur JPEG, même qualité .86) et rangée en `blob:` au lieu de `data:`.
   MESURÉ : **les 39 motifs donnent exactement les mêmes octets** que la data: d'avant (`dbgMotEgal()` : 39/39 égaux). 2 à 20 ms par pastille au banc ×4.
   Ce qui n'est pas prêt passe par `motUrl` comme avant. À l'ouverture du rayon, les pastilles EN VUE sont posées tout de suite, les autres par tranches de ~8 ms
   aux images suivantes (toutes les positions lues avant la 1re écriture). Profite aussi à l'inventaire et aux autres listes qui montrent un motif (`motFond`).
2. **LA TEINTE QUI GLISSE SEULE** (`css/boutique-a-iphone.css`, classe `html.bqFluide` posée par boutique.js). #gBq reçoit `--bqaRar` sans glisser ; #gBqPan, seul à
   peindre cette couleur (fond, liseré, ses bords ::before / ::after), fait glisser une copie NON héritée `--bqaRarT` (même durée .45 s, même courbe, même départ) :
   les cartes ne sont plus restylées à chaque image du glissé. Les barres des familles gardent `var(--rc, var(--bqaRar))` (elles ont toujours leur `--rc`).
3. **LES POTS ENCASTRÉS SE SOUVIENNENT** (`voitures/echappements.js`). L'encastrement des pots (`echEncastre` : des dizaines de rayons sur toute la carrosserie à chaque
   buildCar) est gardé sous une clé de TOUT ce que les rayons voient (les pièces du pot ; pour chaque maillage : nombre de sommets, somme pondérée de toutes les positions
   et des indices, matrice dans le repère de la caisse, face de la matière). Même clé → même résultat (une copie), sans rayon ; 60 caisses au plus. Une caisse revue
   (on revient sur une carte, on ressort de la boutique) ne paie plus ses rayons ; la 1re fois, rien ne change.
4. Crochets de banc : `dbgMotPre()`, `dbgMotEgal()`, `dbgEchMemo()`, `dbgCaisseEmpreinte()`.

Essayé puis retiré : **la bande gardée** (garder les éléments de la bande quand son HTML est identique, à la 2e ouverture et au retour sur un rayon). Mesuré : la pire
image de la 2e ouverture ne bouge pas (317 → 317 ms) — ce n'est pas le HTML qui coûte, c'est le style et la mise en page de la bande quand elle réapparaît
(et `html.bqA` reposé à l'ouverture : toute la page restylée). Retiré pour ne rien garder d'inutile.

## 3. Avant / après, même Chrome, entrelacé

4 passes, chacune dans UN Chrome (avec / sans alternés, le 1er essai de chaque passe écarté : il remplit la base des photos) : **5 essais avec, 5 sans**.
Médianes [min-max], banc ×4. « Au-delà de 50 ms » = somme de ce que chaque image dépasse 50 ms (ne dépend pas de la cadence 30 / 60 du menu, qui a varié d'une passe à
l'autre dans les DEUX cas). Tableau complet : `outils/banc-boutiquefluide/mesures-21-11.md`.

| étape | pire image avec / sans | images > 50 ms avec / sans | au-delà de 50 ms avec / sans |
|---|---|---|---|
| **rayon PEINTURES** | **267 [233-267] / 967 [933-1317]** | **4 / 10** | **359 [333-383] / 1450 [1333-1833]** |
| **défilement VOITURES** | 267 [233-267] / 233 [233-333] | **14 [13-19] / 27 [23-32]** | **833 [783-1017] / 1225 [934-1716]** |
| **3e article** | 133 / 167 | **1 [1-3] / 8 [6-9]** | **92 [83-167] / 334 [167-400]** |
| 2e ouverture | 333 / 333 | 6 / 8 | 625 [550-667] / 767 [617-1450] |
| 1re ouverture | 367 / 367 | 7 / 6 | 692 [683-1117] / 742 [700-983] |
| retour VOITURES | 267 / 267 | 4 / 2 | 300 [217-400] / 250 [200-267] |
| rayon AILES | 200 / 233 | 3 [1-14] / 2 [2-5] | 400 [150-867] / 184 [133-517] |
| achat, ÉQUIPER, retour, articles 1-2, autres rayons, menu au repos | égaux à une image près | | |

- **Ce qui bouge** : le rayon PEINTURES (la pire image ÷ 3,6 ; tous les motifs étaient prêts avant la visite dans les 5 essais : `dbgMotPre` 39/39) ;
  le défilement des VOITURES et le 3e article (moitié moins d'images > 50 ms : les pots gardés — 13 à 99 caisses resservies par essai — et la teinte).
- **La trace** (un essai chacun, mêmes gestes) : les gros recalculs de style (> 4 ms, les 12 plus gros) passent de 457 à 293 ms à l'ouverture, de 368 à 201 ms
  pendant 3 lancers de la bande, de 316 à 221 ms à la 2e ouverture ; les recalculs de 35-40 ms qui ouvraient CHAQUE image du défilement
  (`garBqPanneau` / `bords`) ont disparu. Style total : ouverture 797 → 645 ms, défilement 1 101 → 915 ms, 2e ouverture 672 → 567 ms.
- **Ce qui ne bouge pas** : la PIRE image des deux ouvertures (333-367 ms des deux côtés) et du retour au rayon VOITURES. Le rayon AILES a une médiane plus haute
  « avec » mais des étendues qui se recouvrent largement (une passe à 14 images > 50 ms) : bruit du Mac, rien dans le lot ne touche ce rayon (à surveiller au contrôle).

## 4. Rien ne casse, l'image ne change pas

- **14 parcours complets** (les 6 rayons, défilements, 3 articles, un ACHAT en pièces → « ÉQUIPÉE », ÉQUIPER, retour, 2e ouverture), avec et sans :
  **0 exception, `__loopErr` nul** partout ; les « pannes » listées par le jeu (`pilote … retaille`) sont les mêmes avec et sans.
- **Une course et une mort** après le dernier parcours « avec » (ab5) : course lancée (`dbgJouer`), mort (`dbgDauphin('boom')`), 0 exception.
- **Les motifs** : `dbgMotEgal()` → **39 / 39 motifs aux octets identiques** (toBlob contre toDataURL).
- **Les pots gardés** : la même caisse bâtie SANS le lot (rayons tirés) et AVEC (pot resservi) : **même géométrie au flottant près** (47 maillages, 29 424 sommets,
  somme pondérée des positions −75 733,786763403 des deux côtés), dans 4 passes.
- **La planche** `passation/qualite/photos/boutiquefluide/planche-avant-apres.png` (même écran : VOITURES, PEINTURES, AILES, FIGURES) : écart avant / après
  1,56 · 1,41 · 1,44 · 0,62 sur 255, pour un écart avant / avant (le bruit : la caisse qui vit, le nom qui suit la caisse, les chevrons de JOUER) de
  2,09 · 1,32 · 1,44 · 1,32. Les bandes, les cartes, les pastilles, la teinte du fond : identiques ; seuls bougent la caisse et ce qui l'accompagne.

## 5. Ce qui ne bouge pas, ce qui n'est pas vérifié

**Ce qui ne bouge pas (honnêtement)** :
- **La 1re ouverture et la 2e** : la pire image reste celle où la bande est bâtie et où `html.bqA` est reposé (toute la page restylée, puis la bande mise en page :
  ~250 à 400 ms au banc ×4). Le lot n'allège que les images d'APRÈS (la teinte). Aller plus bas demanderait de ne bâtir que les cartes en vue (le recentrage sur la
  caisse portée, `bqaCentre`, a besoin de sa carte) ou de mettre les cartes lointaines en sommeil (`content-visibility`) : pas fait, le risque visuel n'était pas
  vérifiable sans le téléphone (clipping des cartes, recentrage).
- **Le défilement des VOITURES** : à chaque arrêt de la bande, la caisse posée au repère est REBÂTIE (buildCar, 50 à 140 ms au banc). Les pots gardés en retirent
  une part quand la caisse a déjà été vue ; le reste du bâti (le gabarit, les finitions) n'est pas touché (« la netteté de la voiture en dernier » : on n'y touche pas).
- **Les programmes de la caisse** (`lierScene` → `renderer.compile` sur TOUTE la scène du garage, ~30 ms au banc à chaque caisse) : piste notée, pas faite — sur
  l'iPhone, ce chemin n'existe que si WebKit a `KHR_parallel_shader_compile` (`dbgLier().ext`), non vérifié.
- **Le 1er lancement après une mise à jour** : les photos des vitrines (vitrinePhoto → buildCar, 200 à 900 ms par photo) dominent encore tout le parcours.
  Elles sont gardées ensuite (PHDB) ; le lot n'y touche pas.
- **L'achat** : l'image la plus longue de l'achat est la vitre qui éclate (éclats en `clip-path`), hors du fil principal au banc (SwiftShader) : non jugeable ici.
- Le rayon TRAÎNÉES n'est pas touché (une autre session le retire).

**Non vérifié** :
- Rien n'a été mesuré sur le vrai iPhone (consigne). Le banc est Chrome + SwiftShader à ×4, pas WebKit.
- WebKit et la teinte : que Safari ne restyle PAS les cartes quand une propriété enregistrée non héritée glisse sur #gBqPan, et qu'il fait bien suivre `--bqaRarT:inherit`
  aux bords ::before / ::after, n'est pas vérifié sur l'appareil (Chrome : vérifié par la trace).
- WebKit et `toBlob` : Chrome encode hors du fil ; WebKit peut encoder sur le fil (ce ne serait pas pire qu'avant : la même toile, le même encodage, au calme).
- La mémoire : celle des pots (60 caisses) et les 39 motifs en `blob:` restent en mémoire pour la session (quelques Mo au plus), pas mesuré sur l'appareil.
- La langue anglaise, le mode « mouvement réduit », le format debout (portrait) : pas parcourus par ce banc (couché seulement).
