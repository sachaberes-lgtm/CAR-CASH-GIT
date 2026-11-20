# CONTRÔLE ADVERSE DU LOT J (Crypto City de jour)

## Tour 1 (2026-11-18, vers 11 h 10)

**Verdict : REFUSÉ.** Deux défauts bloquants : le coût monte, et le jour n'est pas au niveau de la nuit. Le reste tient : l'enquête, l'interrupteur, les routes, les gardes et la console.

Bancs et sorties : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-j/controle/`
- `banc-c.cjs` : copie du banc de l'auteur, sur d'autres ports et un autre profil Chrome, avec une capture PNG en plus ;
- `tirage-c.js` ;
- `jobs-c1.json` et `jobs-c2.json` ;
- `p1/`, `p2/`, `planche-c1.jpg` (paysage), `planche-c2.jpg` (portrait).

Deux prises sous verrou (`ville-cyber-j`) : 10:30:11 → 10:31:39, puis 11:03:12 → 11:07:08. Chrome muet (`--mute-audio`, sfx, mus et vox coupés), profil supprimé, verrou rendu les deux fois. Mes graines : 11, 4 et 6, et un hasard de tirage à graine 4242. L'auteur avait utilisé 3, 5, 7, 8 et 12345.

### Ce qui est JUSTE (vérifié)

- **L'enquête.** J'ai relu les commits :
  - 045144987 (24/10, v883) : `crypto:IS_MOBILE&&…`, avec la citation de Sacha « supprime la map crypto city de téléphone » ;
  - d60dc3baf (25/10) : passage à ALLEGE ;
  - bb0572eb1 (13/11) : garde de `cryptoChauffe` ;
  - 17def0103, 71f57f577, f96118036, 1e61f80ca : dates et titres conformes.

  `SF_CARTES.crypto`, avant la fusion 1e61f80ca et aujourd'hui, a les mêmes trois météos et les mêmes poids. Le jour n'a pas été perdu : c'est un **retrait voulu** par Sacha, sur téléphone seulement. Sa raison n'est écrite nulle part, ce n'est pas levé.
- **La map `ville` reste la nuit.** `SF_CARTES.ville` est inchangé : `orage` seul, p 3,5. Le hachage de `SF_CARTES` est identique dans les deux arbres (−69475444).
- **Tirage, 200 tirages, `?tel=1`, hasard à graine 4242** (`tirage-c.js`) :

  | | SF_HORS.crypto | crypto (jour) | ville:orage (nuit) | empreinte de la suite | hachage BIOMES |
  |---|---|---|---|---|---|
  | référence | true | 0 | 34 | 1418009421 | 1747857425 |
  | référence, 2e passage | true | 0 | 34 | 1418009421 | 1747857425 |
  | lot J | **false** | **18** (matin 6, midi 5, soir 7) | 12 | −791274418 | 875216302 |
  | lot J `?sans=cryptojour` | true | 0 | 34 | **1418009421** | **1747857425** |

  Le jour sort bien. `?sans=cryptojour` rend au bit près le tirage ET toutes les valeurs d'ambiance (`BIOMES` entier sérialisé, 204 993 caractères). C'est la seule chose que touche `cryptocity-jour.js`.
- **Rendu au pixel.** Le rendu n'est pas déterministe, même entre deux passages de la même référence : 54,4 % de pixels différents, écart maximal 204 (`png-diff.cjs`, `av-midi-g11` contre `av2-midi-g11`). `?sans=cryptojour` contre la référence donne 57,6 % et 59,7 % : c'est dans ce bruit. La preuve du bit près repose donc sur le hachage des BIOMES et de SF_HORS, pas sur l'image.
- **Empreintes** (`empreinte.cjs graines=1-12`) : ville d63b36e2af8b / fb378a8c6756, crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351. Intactes. La vitrée casse aussi dans la référence (`VIT_SOL`).
- **Le diff.**
  - `index.html` contre la référence assemblée ne diffère que de la ligne `SF_HORS` et du nouveau morceau (48 lignes de diff).
  - Pas de `sw.js`, pas de génération de route, aucune autre map touchée.
  - Un seul `const CRYPTO_JOUR`, aucun IS_MOBILE.
  - Gardes vertes : garde-demarrage OK (21 scripts), garde-allege ✔, garde-charte OK, `assembler --verifier` ✔ (348 morceaux).
- **Courses dans le vrai jeu.** La carte est imposée par `SF.force` APRÈS le menu, sans `?carte=` : `SF_HORS` et la chauffe au menu sont donc ceux du vrai téléphone.
  - crypto:midi, graine 11 : jusqu'au portail, puis jade:pluie.
  - crypto:matin, graine 6 : jusqu'au portail, puis espace:soir.

  0 erreur console dans les deux. `programs.length` = 164 à chaque relevé (39 relevés par course) : **aucun programme compilé en course**. Les 12 chargements photo : 0 erreur.

### DÉFAUTS

1. **BLOQUANT : le coût monte sur téléphone, et pas seulement en jour.**
   - Comme Crypto City n'est plus hors du tirage, `cryptoChauffe` recompile au menu. **Toute** partie sur téléphone porte alors les matières du jour, même sur la nuit ou une autre map.

     | même scène : ville:orage violet, graine 11, `?tel=1`, 844×390 | programmes | textures | géométries | appels s30 / s60 |
     |---|---|---|---|---|
     | référence | 154 | 123 | 549 | 88 / 75 |
     | lot J | **164** | **128** | **563** | 88 / 75 |

   - **Jour contre nuit** (graine 11) : appels 97 / 81 (midi), 97 / 81 (matin), 94 / 89 (soir), contre 88 / 75 la nuit. Triangles 247-249 k / 208-211 k contre 229 k / 208 k. L'auteur mesure lui-même +10 à +50 appels (graines 3 et 8).
   - La règle « comptes ≤ ceux de la nuit / d'avant » est violée. Le rapport de l'auteur compare le jour à la nuit, mais ne dit pas que la nuit elle-même passe de 154 à 164 programmes.
   - Le retrait du 24/10 date de la semaine des mesures de chauffe de l'iPhone. Rien n'a été mesuré sur un iPhone.
2. **BLOQUANT : le jour n'est pas au niveau de la nuit**, et l'auteur l'écrit lui-même pour le midi. Planches regardées : `planche-c1.jpg`, `planche-c2.jpg`.
   - **Midi.** Les tours du premier plan restent crème et blanc délavé, surtout en portrait où elles se fondent dans le ciel. La route est un aplat ardoise sombre, sans reflet ni lumière, sur 50 à 55 % de l'écran.
   - **Soir.** La brume orange écrase les tours proches en aplats orange uniformes, sans détail : la tour de gauche en s30 et toute la ville en portrait. Les pièces et billets orange se lisent mal sur ce fond orange.
   - **Matin.** C'est le plus réussi, mais la route reste un aplat violet sombre.
   - **La nuit**, elle, a des néons qui bordent la route, des reflets mouillés et des milliers de fenêtres : le jour n'a rien d'équivalent. Sacha a déjà abandonné une ville de jour parce que « ça marche pas ». Le jour remis ici est plus coloré que l'ancien, mais pas « au même niveau que la nuit ».
3. **Mineur : la part de la nuit s'effondre.** Sur mes 200 tirages, `ville:orage` passe de 34 à 12, et Crypto City sort à 60 % en jour (18 contre 12). L'auteur annonce 50 / 50 (54 / 50 sur 600). C'est conforme à la règle de l'ordinateur, mais la nuit, la meilleure des deux, devient rare sur téléphone. À trancher par Sacha.
4. **Mineur : les missions météo (`m2Meteo`) comptent maintenant 3 météos de jour de plus** pour le groupe cryptoville sur téléphone. La progression affichée des défis « toutes les météos » change. Non testé en jeu, ni par l'auteur ni par moi.
5. **Mineur : l'ordinateur change d'image sans être photographié.** `cryptocity-jour.js` n'est pas gardé par ALLEGE, donc le jour de l'ordinateur change aussi. C'est voulu, mais non photographié en `?tel=0`, ni par l'auteur ni par moi.

### Ce que je n'ai PAS pu vérifier

- Aucun vrai iPhone : ni chauffe, ni i/s, ni temps de démarrage avec les 10 programmes de plus au menu.
- Le rendu au pixel près de `?sans=cryptojour` : impossible, à cause du bruit propre du rendu (54 % entre deux passages identiques). L'identité est prouvée par les hachages d'état, pas par l'image.
- Le passage par un portail du jour vers la nuit de Crypto City.
- Le rendu en `?tel=0` (ordinateur).
- La vraie raison du retrait du 24/10.
- Le tirage pris au vrai bouton JOUER au fil de plusieurs parties. J'ai appelé `sfTire`, que JOUER, le portail et le départ d'avance utilisent, et la carte a été imposée par `SF.force` pour les courses.

### Pour un tour 2

- Ramener le coût sous la nuit et la référence : alléger le jour sur ALLEGE, ou ne chauffer les matières du jour qu'au moment où Crypto City de jour est tirée d'avance (`SF.prochain`), sans compiler en course.
- Rendre le jour digne de la nuit sur la route (lumière, reflets) et sur les tours proches (brume trop forte au soir, crème délavé au midi), en portrait d'abord.

## Tour 2 (2026-11-19, vers 14 h 50)

**Verdict : REFUSÉ.** Trois défauts bloquants :

1. un programme se compile en course, au portail, dans toute partie de jour ;
2. le jour coûte plus cher que la nuit sur téléphone, qui jusqu'ici ne le montrait jamais ;
3. le jour n'est toujours pas au niveau de la nuit.

Le reste tient : l'enquête, l'interrupteur `?sans=cryptojour` (au bit près), les routes, le diff, les gardes, l'absence d'erreur console, et le fait que la map `ville` reste la nuit.

Bancs : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-j/controle/t2/`. On y trouve `banc-c2.cjs` (le banc du tour 1, avec d'autres ports, le profil `profil-chrome-jc2` et le prébâti au choix), `mk.py` (qui fabrique les jobs), `jobs1` à `jobs3`, `p1` à `p3` (JSON et JPEG) et les planches `pl1.jpg`, `pl2.jpg`, `pl3.jpg` et `cmp-s50.jpg`.

Trois prises sous verrou (`ville-cyber-j`) : 14:28:22 → 14:30:48, 14:33:47 → 14:36:58 et 14:44:06 → 14:48:18. Chrome était muet (`--mute-audio`, sfx, mus et vox coupés), son profil a été supprimé et le verrou rendu à chaque prise. L'attente du verrou a été d'environ 40 min.

Mes graines : pistes 9, 2 et 10 ; hasard du tirage 9001. Le tour 1 et l'auteur avaient pris 3 à 8, 11, 12 et 4242.

### Ce qui est JUSTE (vérifié en exécutant)

**L'enquête.** J'ai relu les commits cités, avec leur date et leur titre :

- 045144987 (24/10, v883) : `crypto:IS_MOBILE&&…`, avec la citation « supprime la map crypto city de téléphone » ;
- d60dc3baf (25/10) : passage à ALLEGE / TEL_NATIF ;
- bb0572eb1 (13/11) : plus de chauffe quand Crypto City est hors du tirage ;
- 17def0103, 71f57f577 / f96118036 et 1e61f80ca : conformes.

Le jour est un **retrait voulu**, pas une perte. Les branches non fusionnées (`embellir-crypto` du 27/10, `fusion-ville-crypto` 8bdd74635 du 31/10, `maps/crypto-city`, `crypto-reflet`) portent des retouches plus anciennes ou de nuit. L'auteur n'en parle pas, mais rien n'indique que Sacha regrette l'une d'elles plutôt que la carte `crypto` actuelle. `SF_CARTES.ville` reste `orage` seul : la ville reste la nuit.

**Le diff.** La référence (b88e577a) et le lot (2b184da4) ont un `code/` identique : seuls des `.md` diffèrent entre les deux commits. `index.html` du lot contre celui de la référence ne diffère que des trois lignes `sfTire` → `sfTireDepart` (JOUER, tirage d'avance, zone 0), de `CRYPTO_JOUR` et du nouveau morceau.

- Aucun changement à `sw.js`, à la génération des routes ni aux autres maps.
- `CJ`, `CJ_ROUTE`, `CJ_LEGER`, `CRYPTO_JOUR`, `cjChauffe` et `sfTireDepart` ne sont déclarés qu'une fois chacun.
- `IS_MOBILE` est absent, et l'allègement est gardé par `ALLEGE`.
- `routeTick`, `cryptoTick` et `plaTick` sont bien des `function` qu'on peut réassigner.

**Les gardes** : garde-demarrage OK (21 scripts), garde-allege ✔, garde-charte OK, `assembler --verifier` ✔ (348 morceaux, 13 151 815 octets). Le `vm.Script` sur les `<script>` en ligne n'échoue que sur le faux positif du 5e (un `<script>` cité dans un commentaire), identique dans la référence.

**Les empreintes** (`empreinte.cjs graines=1-12`) : ville d63b36e2af8b / fb378a8c6756, crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351. Elles sont intactes. La vitrée casse comme dans la référence (`VIT_SOL`).

**Le tirage**, simulé dans le vrai jeu en `?tel=1`. Une partie, c'est un départ (`sfTire` dans la référence, `sfTireDepart` dans le lot) puis deux portails (`sfTire`). J'en ai joué 200, avec `SF_HIST` simulé et un hasard à graine 9001.

| | SF_HORS.crypto | départs : jour (matin / midi / soir) | départs : nuit `ville:orage` | portails : jour / nuit | empreinte de la suite | hachage BIOMES | m2Cartes | programmes au menu |
|---|---|---|---|---|---|---|---|---|
| référence | true | 0 | 36 | 0 / 80 | −2124556106 | 1747857425 | 1178376582 | 0 → 0 |
| lot J | true | **15 (3 / 6 / 6)** | 21 | **0** / 75 | 89294677 | −2051857135 | 1178376582 | 0 → **14** (cjChauffe) |
| lot J `?sans=cryptojour` | true | 0 | 36 | 0 / 80 | **−2124556106** | **1747857425** | 1178376582 | 0 → 0 |

- Le jour sort bien au départ, et jamais aux portails.
- `?sans=cryptojour` rend au bit près le tirage, les ambiances (`BIOMES` entier, 204 993 caractères) et les missions.
- Le rendu de la nuit est aussi identique en comptes : nuit graine 9, lot `?sans` contre lot = 94 / 57 / 53 appels, 154 programmes, des deux côtés.
- Au pixel, ce n'est pas comparable : le bruit propre du rendu atteint 54 % (tour 1).

**Le vrai chemin du JOUER, prébâti actif.** Le jour est tiré par `sfTireDepart` dans `SF.prochain` dès `__gameReady`, puis `dbgJouer()` lance la partie. Ensuite :

- `dbgClassique().niveau` = `crypto:midi` (`bullrun`) et `crypto:soir`. Le jour annoncé est bien celui qu'on joue.
- 3 courses complètes jusqu'au portail : midi graine 9 (deux fois) et soir graine 2. 0 mort, **0 erreur console**.
- Les photos (9 chargements jour, nuit, portrait et paysage) n'ont donné aucune erreur.

### DÉFAUTS

**1. BLOQUANT : un programme se compile en course, au portail, dans toute partie de jour. Reproduit 3 fois sur 3.**

| course, `?tel=1`, prébâti actif | programmes sur la piste | après le portail |
|---|---|---|
| lot, crypto:midi g9 → grotte:matin | 171 (38 relevés) | **172** |
| lot, crypto:soir g2 → jade:orage | 171 (38 relevés) | **172** |
| lot, crypto:midi g9 → grotte:matin (portail imposé par `dbgClassique`) | 171 | **172** |
| référence, crypto:midi g9 (`?carte=crypto`) → grotte:matin | 164 | 164 |
| référence, ville:orage g9 → grotte:matin | 154 | 154 |

- La référence ne compile rien au même portail, ni de jour ni de nuit. C'est donc le lot.
- Une partie de jour porte aussi **171 programmes** au départ, contre 164 pour le jour de la référence : 7 de plus.
- Hypothèse : `cjChauffe` compile au moment du tirage, avant la scène et les lumières du menu. Les clés de programme ne sont donc plus les bonnes.
- Mon tirage est fait à `__gameReady`, donc tôt. C'est le moment où la chauffe dense de l'intro appelle `prebDepCible` (`intro-161.js`). L'auteur, qui tirait plus tard depuis un `setTimeout`, ne l'a pas vu. **Doute non levé = défaut** : le chemin réel du premier JOUER d'une session n'est pas couvert.

**2. BLOQUANT : le jour coûte plus que la nuit sur téléphone**, alors qu'aujourd'hui le téléphone ne le montre jamais. Comptes d'une image du composer, `?tel=1`, 844×390, s = 20 / 50 / 80 % :

| graine | jour du lot : appels | tri (k) | nuit : appels | tri (k) |
|---|---|---|---|---|
| 9 (midi) | 79 / **131** / 63 | 239 / **410** / 208 | 94 / 57 / 53 | 274 / 125 / 86 |
| 2 (soir) | 71 / 64 / 62 | 191 / 160 / 157 | 93 / 67 / 45 | 259 / 208 / 76 |
| 10 (matin) | 100 / 83 / 61 | 319 / 264 / 159 | 104 / 65 / 55 | 266 / 181 / 100 |
| moyenne des 9 vues | **79** | **235** | 70 | 175 |

- **Programmes : 171 contre 154 (+17).** Textures 124 à 126 contre 120 à 122. Géométries 531 à 596 contre 512 à 565.
- **Maximum : 131 appels et 410 k triangles**, contre 104 et 274 k la nuit.
- Le jour du lot est un peu plus léger que le jour de la référence : 79 / 131 / 63 contre 83 / 134 / 67, grâce à `CJ_LEGER`. Mais la consigne était « ≤ ceux de la nuit / d'avant » sur téléphone, où le jour n'existait pas.
- Crypto City avait été retirée du téléphone le 24/10, la semaine des mesures de chauffe. Rien n'a été mesuré sur un vrai iPhone. L'auteur l'écrit lui-même : NON résolu.

**3. BLOQUANT : le jour n'est pas au niveau de la nuit.** J'ai regardé `pl1.jpg` (référence jour, lot midi et nuit, graine 9), `pl2.jpg` (soir g2, matin g10 et leurs nuits), `pl3.jpg` (portrait 390×844) et `cmp-s50.jpg`.

- **Midi.** Contre le jour d'avant à la même vue (`cmp-s50`), la retouche se voit à peine : une route un peu plus bleue et plus sombre, un ciel un peu plus bleu. Il reste un mur crème délavé qui occupe un cinquième de l'image.
- **Midi en portrait (g9 s30).** Un mur crème presque blanc remplit toute la moitié haute. Le reste est un béton gris-bleu uni. C'est la plus faible des images.
- **Soir.** Les tours sont des aplats rose et orange sans fenêtres ni détail, en paysage comme en portrait. La route est un aplat violet. Les pièces orange se lisent mal.
- **Matin.** Il est lavande et crème, sans contraste.
- **La route renvoie le ciel ?** Je n'ai vu de reflet net dans aucune de mes vues.
- **La nuit** garde ses fenêtres, ses néons de bord de route et ses flaques colorées.

Le jour reste « une ville pâle ». L'auteur l'écrit aussi : le soir en portrait, le midi près des tours. Sacha a déjà abandonné une ville de jour parce que « ça marche pas ».

**4. Mineur : la nuit recule au départ.** Elle passe de 36 à 21 départs sur 200. Sur toutes les zones, la nuit reste la plus fréquente : 96 contre 15. C'est acceptable, et c'est à Sacha de choisir `CJ.part`.

**5. Mineur : le banc ne sait pas faire l'ordinateur.** Avec `?tel=0` dans ce Chrome sans fenêtre, en émulation mobile, `ALLEGE` reste vrai. Mes jobs « pc » sont donc des copies du téléphone. Le chemin du PC (`SF_HORS.crypto` faux, donc `sfTireDepart` = `sfTire`) n'est vérifié qu'en lisant le code.

### Ce que je n'ai PAS pu vérifier

- Aucun vrai iPhone : ni chauffe, ni i/s, ni temps de `cjChauffe`.
- La cause exacte du programme compilé au portail (je n'ai pas lu sa clé), et si un tirage plus tardif (au menu, à l'écran de fin) l'évite.
- Le premier JOUER d'une session tiré **naturellement** au jour, sans que je force `SF.prochain`.
- L'ordinateur en vrai `?tel=0`.
- Le rendu au pixel de `?sans=cryptojour` : le bruit est trop fort. L'identité repose sur les hachages et les comptes.

### Pour un tour 3

- Chauffer le jour une fois la scène du menu prête (dans `chauffeDivers` ou juste avant le JOUER), et prouver 0 programme de plus sur toute la course **et** au portail, au premier JOUER d'une session.
- Ramener les appels, triangles et programmes du jour sous la nuit sur ALLEGE, ou faire trancher Sacha explicitement sur ce surcoût avant toute fusion.
- Retravailler le midi et le soir, en portrait d'abord : murs crème, aplats orange et rose.

## Tour 3 (2026-11-19, vers 16 h 45)

**Verdict : REFUSÉ.** Deux défauts bloquants restent : **le jour coûte toujours plus que la nuit sur téléphone**, ce que l'auteur reconnaît et renvoie à Sacha, et **le matin, ainsi que le soir en portrait, ne sont pas au niveau de la nuit**. Le défaut du tour 2, un programme compilé au portail, est corrigé : vérifié deux fois sur deux. L'enquête, `?sans=cryptojour`, les routes, le diff, les gardes et la console tiennent.

Les bancs sont dans `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-j/controle/t3/` :
- `banc-c3.cjs` : le banc du tour 2, sur les ports 8311 et 9511, avec le profil `profil-chrome-jc3` ;
- `mk3.py`, `jobsA.json` et `jobsBC.json` ;
- `pA/` et `pB/`, qui contiennent les JSON et les JPEG ;
- les planches `plA.jpg`, `plB.jpg` et `plP.jpg`.

Deux prises sous verrou (`ville-cyber-j`) : 16:24:16 → 16:26:30, puis 16:32:33 → 16:37:31. Chrome était muet (`--mute-audio`, sfx, mus et vox coupés), son profil a été supprimé et le verrou rendu à chaque fois. Mes graines : pistes 13, 14 et 1 ; hasard du tirage 777. Les tours précédents avaient pris 2 à 12 et 4242 / 9001.

**⚠ La référence a bougé.** `/Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59` n'est plus au même commit que le lot :
- elle est à 94cb49647 (lots A et C) ;
- son `index.html` porte en plus le lot E, non commité ;
- le lot J, lui, est bâti sur 2b184da4.

Je n'ai donc pas comparé contre elle. J'ai assemblé une référence propre à partir des `code/` de HEAD 2b184da4 (`git archive`, puis `assembler --depuis-morceaux`, 347 morceaux), dans `t3/ref/`.

### Ce qui est JUSTE (vérifié en exécutant)

- **L'enquête.** Les sept commits cités ont la date et le titre annoncés : 045144987 (24/10, « Crypto City hors du tirage sur téléphone »), d60dc3baf, bb0572eb1, 17def0103, 71f57f577, f96118036 et 1e61f80ca. Il s'agit d'un retrait voulu, et sur téléphone seulement. `SF_CARTES.ville` est inchangé : `orage` seul. La map `ville` reste la nuit.
- **Le diff.**
  - L'`index.html` du lot contre la référence propre : seules les 3 lignes `sfTire` → `sfTireDepart`, `CRYPTO_JOUR` et le nouveau morceau diffèrent.
  - Le code touché : `niveaux.js`, `continuite.js`, `depart-avance.js`, `zones-caisses.js`, `ORDRE.txt` et `cryptocity-jour.js`.
  - Rien dans `sw.js`, dans la génération des routes (`ville-scenes`, `ville-entree`, `jade-balade`), dans les autres maps ni dans les fichiers de rendu réservés.
  - Chaque nom est déclaré une seule fois : `CJ`, `CJ_ROUTE`, `CJ_U`, `CJ_LEGER`, `CRYPTO_JOUR`, `cjChauffe` et `sfTireDepart`.
  - Pas d'`IS_MOBILE`. L'allègement est gardé par `ALLEGE`.
  - `PLA.mB.geometry.instanceCount` vaut `PLA.N` hors Crypto City, comme le pose `plaInit` : la pluie des autres maps ne change pas.
- **Les gardes.** garde-demarrage OK (21 scripts), garde-allege ✔, garde-charte OK, `assembler --verifier` ✔ (348 morceaux, 13 157 036 octets).
- **Les empreintes** (`empreinte.cjs graines=1-12`) sont intactes : ville d63b36e2af8b / fb378a8c6756, crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351. La vitrée casse aussi dans la référence (`VIT_SOL`).
- **Le tirage**, simulé dans le vrai jeu en `?tel=1` : 200 parties, chacune avec un départ et deux portails, `SF_HIST` simulé, hasard à graine 777.

  | | empreinte de la suite | BIOMES | m2Cartes | départs : jour (matin / midi / soir) | départs : `ville:orage` | portails : jour / nuit |
  |---|---|---|---|---|---|---|
  | référence propre | 1342868912 | 1747857425 | 1178376582 | 0 | 35 | 0 / 63 |
  | lot | 1852799898 | −580591462 | 1178376582 | **19 (8 / 2 / 9)** | 16 | 0 / 68 |
  | lot `?sans=cryptojour` | **1342868912** | **1747857425** | 1178376582 | 0 | 35 | 0 / 63 |

  Le jour sort. `?sans=cryptojour` rend au bit près le tirage, toutes les ambiances et les missions. À noter : le midi ne sort que 2 fois sur 19.
- **Les nuits en comptes.** Le lot, `?sans` et la référence donnent les mêmes appels et triangles à ±2 appels et ±3 k près. Programmes 154 et textures 121 partout. Les géométries varient d'un chargement à l'autre (504 / 512 / 504 à la graine 14 ; 544 contre 508 à la graine 13), dans les deux sens. Une partie de nuit ne coûte donc rien de plus.
- **Aucun programme compilé en course : le défaut 1 du tour 2 est CORRIGÉ.** Le jour est tiré à `__gameReady`, avec le prébâti actif :
  - **C-midi-g13** → grotte:matin : 164 programmes sur 38 relevés, et 164 après le portail ;
  - **C-soir-g14** → jade:nuit : 164 sur 40 relevés, et 164 après le portail.

  Au tirage, `CJ.chaud` est faux et 0 programme est compilé.
- **Console.** 0 erreur sur les 16 chargements et les 3 courses, dont une de 60 s sur nuages:orage.

### DÉFAUTS

**1. BLOQUANT : le jour coûte plus que la nuit sur téléphone (`?tel=1`).** La consigne demandait des comptes ≤ ceux de la nuit ou d'avant. Sur téléphone, le jour n'existait pas avant.

| même graine, vues de la piste en 844×390 | appels | triangles | programmes | textures | géométries |
|---|---|---|---|---|---|
| midi g13 (s25 / s55 / s85) | 67 / 88 / 82 | 164 / 242 / 255 k | **164** | **125** | 576-578 |
| nuit g13 | 71 / 131 / 53 | 163 / 294 / 89 k | 154 | 121 | 544 (réf. 508) |
| soir g14 | 94 / 79 / 46 | 306 / 221 / 91 k | **164** | **125** | 540 |
| matin g14 | 93 / 78 / 45 | 306 / 218 / 91 k | **164** | **125** | 546 |
| nuit g14 | 85 / 48 / 61 | 268 / 81 / 190 k | 154 | 121 | 504 (réf. 512) |
| portrait : midi g13 / soir g14 / matin g1 contre nuit g13 | 58·52 / 50·56 / 54·60 contre 51·75 | 165·125 / 129·147 / 164·143 k contre 111·222 k | 164 contre 154 | 123 contre 119 | |

- **En moyenne, en paysage**, les appels sont égaux : 75 de jour contre 75 de nuit. Mais les triangles montent de 16 % (210 k contre 181 k), et il y a **+10 programmes, +4 textures et environ +40 géométries**.
- Ces chiffres rejoignent ceux de l'auteur (+16 appels et +50 k triangles sur ses graines). L'auteur l'écrit lui-même : « RÉDUIT, PAS SOUS LA NUIT. Décision pour Sacha ».
- Rien n'a été mesuré sur un iPhone. Le retrait du 24/10 date de la semaine de la chauffe.

Un surcoût que l'auteur reconnaît et laisse à trancher reste un défaut tant que Sacha n'a pas tranché.

**2. BLOQUANT : le jour n'est pas au niveau de la nuit partout.** J'ai regardé `plA.jpg` (midi et nuit g13), `plB.jpg` (soir, matin et nuit g14) et `plP.jpg` (portraits midi, soir, matin et nuit).

- **Midi en paysage (g13) : RÉUSSI.** Un azur franc, une bande d'or, des tours de verre bleues à fenêtres, une route ardoise lisible, et des pièces et billets bien visibles. Il reste une tour blanche ou crème au premier plan à s85, sans gravité.
- **Midi en portrait (g13 s30)** : un grand pan bleu-gris pâle en haut à gauche, une route ardoise qui remplit les deux tiers de l'écran. C'est correct, sans plus.
- **Soir (g14)** : il tient en paysage (violet et or, cohérent). Mais les tours du fond sont des **blocs violets unis, sans fenêtres**. La route vire au mauve rosé à s85. En portrait, la route est rose et les blocs violets plats. Le portrait de l'auteur (tour 3) montre la même chose.
- **Matin (g14 et g1) : NON.**
  - Lavande délavée, peu de contraste.
  - En paysage, il est presque identique au soir, en plus pâle.
  - En portrait (g1 s60), une route brun-gris sous un ciel lavande, et des tours lavande uniformes.
  - L'auteur l'écrit : « le matin reste lavande et gris, sans changement ce tour ».
- **Le jour n'a aucun équivalent aux flaques de néon de la nuit** : la route du jour est un aplat sans reflet visible dans toutes mes vues. **La nuit** a ses fenêtres, ses liserés roses et ses flaques colorées, à toutes les vues.

Le midi est maintenant digne du jeu. Le matin ne l'est pas : c'est « la ville pâle » que Sacha a déjà refusée.

**3. Mineur : le lot est bâti sur 2b184da4, en retard sur la référence (94cb49647, lots A et C).** Les modules route-ville du lot A n'ont pas été croisés avec le jour : le tirage `sfTireDepart` et la chauffe au moment de la piste (`lvlChoisir` enveloppé) n'ont pas été essayés sur ces modules. Il faut rebâtir, puis re-vérifier, avant de fusionner.

**4. Mineur : la nuit de Crypto City recule au départ**, de 35 à 16 sur 200 (tour 2 : de 36 à 21). Cela dépend de `CJ.part`, c'est à Sacha de choisir.

**5. Mineur : le midi est rare.** Il sort 2 fois sur 19 jours ici, alors que son poids est de 1,3 contre 1 et 1,2. C'est peut-être le hasard de la graine, mais non levé : c'est pourtant la plus belle des trois heures.

### Ce que je n'ai PAS pu vérifier

- Aucun vrai iPhone : ni chauffe, ni images par seconde, ni durée de `cjChauffe` au menu ou à l'écran de fin.
- Le premier JOUER d'une session qui tire **naturellement** le jour. Ma course « sans forçage » (`CJ.part` = 1, graine 1) a tiré nuages:orage. Le jour n'a été obtenu qu'en forçant `SF.prochain` à `__gameReady`.
- Le chemin de l'écran de fin (REJOUER vers le jour) : il n'a été mesuré que par l'auteur.
- L'ordinateur en vrai `?tel=0` : le banc garde `ALLEGE` en émulation mobile. Le PC prend lui aussi le verre et les couleurs retouchés, et ce n'est photographié par personne.
- Le rendu au pixel près de `?sans=cryptojour` : le bruit propre au rendu atteint 54 %. L'identité repose sur les hachages (tirage, BIOMES, missions) et sur les comptes des nuits.
- L'interaction avec les lots A, C et E de la référence actuelle.

### Pour lever le refus

1. Faire trancher Sacha sur le surcoût du jour sur téléphone (+10 programmes, +4 textures, environ +16 % de triangles), ou le ramener sous la nuit sur ALLEGE.
2. Retravailler le matin (contraste, couleur franche) et les tours lointaines du soir et du matin (fenêtres ou dégradé, plutôt que des blocs unis), en portrait d'abord.
3. Rebâtir sur 94cb49647 ou sur `origin/main`, puis refaire le tirage, la course et le portail.

---

## Reprise, tour 1 (2026-11-19, vers 19 h 55) — « le jour = la carte de la nuit sous un autre soleil »

**Verdict : REFUSÉ.** La mécanique est juste et prouvée : même map, même coût, `?sans=cryptojour` au bit près, tirage conforme, 0 erreur, 0 programme en course. Le refus tient à **l'image** (preuve C) : un défaut bloquant, en deux volets, pour les tours lointaines et la route du jour.

Bancs : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-j2/controle/`.
- `banc-c.cjs` est une copie du banc de l'auteur. Il tourne sur d'autres ports (8347 / 9547) et un autre profil (`profil-chrome-ctrlj`). Il mesure deux fois chaque vue, pour écarter « l'image double ».
- On y trouve aussi `mkjobs.py`, `jobs1-3.json`, `out-jobs*/res-*.json`, `emp-jn.cjs` et `lance.sh`.

Trois prises sous verrou (`ville-cyber-j-ctrl`) : 19:29:42 → 19:33:20, 19:39:13 → 19:42:25, 19:42:25 → 19:49:59. Chrome tournait muet (`--mute-audio`, avec sfx, mus et vox coupés). Son profil a été supprimé et le verrou rendu à chaque prise. La référence propre (HEAD assemblé) a été supprimée à la fin.

Mes graines : **13, 14, 5, 21**, plus 8 pour la course depuis les nuages. Hasard du tirage : graine 4243.

### 1. Interrupteur, routes, diff, gardes : JUSTE

- **Référence propre.** `git archive HEAD code "VERSION PRINCIPALE/index.html" outils/banc-routes outils/garde-texte-nu.cjs`, puis `node code/assembler.cjs --depuis-morceaux`.
  - ⚠ L'`index.html` **commité** à HEAD (e34d40c4a) n'est pas assemblé : 12 818 552 octets contre 13 185 999 pour ses morceaux. Il lui manque les morceaux du 17/11 (pause sûre, voiles…). Ce n'est pas le fait du lot, mais ce commit ne doit pas servir de référence.
  - `diff` de l'index assemblé de la référence contre celui du lot : **76 lignes, toutes du lot**. Ce sont `CRYPTO_JOUR`, la ligne `SF_HORS` et le morceau `cryptocity-jour.js`.
- **`git diff` du lot** : `code/ORDRE.txt` (+1), `code/maps/niveaux.js` (+8 −1), `code/maps/cryptocity-jour.js` (nouveau, 67 lignes) et `index.html`.
  - Rien hors du périmètre : ni route, ni autre map, ni rendu réservé, ni `sw.js`.
  - `CJ`, `CJ_BIO`, `CJ_ROUTE`, `cjPoids` et `CRYPTO_JOUR` ne sont déclarés qu'une fois.
  - Aucun `IS_MOBILE`, aucun `//` dans le morceau.
- **Gardes** : garde-demarrage (21 scripts), garde-allege, garde-charte et `assembler --verifier` (349 morceaux, 13 194 499 octets) sont vertes.
- **Empreintes `graines=1-12`** : ville 17b89297a6b8 / 9dc6766ea34f, crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351. **Toutes intactes.** La vitrée casse avec `VIT_SOL is not defined`, comme dans la référence.
- **Tirage de 200 parties** (1 départ et 2 portails, soit 600 tirages ; hasard 4243 ; `SF_HIST` vidé ; `?tel=1`) :

  | | empreinte du tirage | BIOMES | SF_CARTES | programmes au tirage | météos de Crypto City (missions) |
  |---|---|---|---|---|---|
  | référence | 2101787703 | 1747857425 | −69475444 | 0 → 0 | ville:orage |
  | lot | 2118100537 | −1806722818 | −526369708 | 0 → 0 | ville:orage, matin, midi, soir |
  | lot `?sans=cryptojour` | **2101787703** | **1747857425** | **−69475444** | 0 → 0 | ville:orage |

  La nuit g13, sur trois arbres :

  | | appels, deux mesures (s25 / s55 / s85) | programmes | textures | ville (route, matrices des tours) |
  |---|---|---|---|---|
  | référence | 70-71 / 120 / 49-50 | 154 | 121 | même hachage |
  | `?sans` | 70-71 / 119 / 49 | 154 | 121 | même hachage |
  | lot | 70-71 / 119-120 / 49 | 154 | 121 | même hachage |

  **`?sans=cryptojour` = le jeu d'avant.**

### 2. Même map (preuve A) et coût (preuve B) : JUSTE

- **En Node** (`emp-jn.cjs` : le vrai `genCtrl`, graines 13, 14, 21, 33, 47, 58, 99 et 123). Nuit, matin, midi et soir donnent les mêmes points de contrôle et les mêmes modules : p0 fee53d0523a2 (2 499 points), p10 d6a0603d88d7 (1 989 points). Réserve : les niveaux y sont écrits à la main. La preuve en jeu ci-dessous lit, elle, le vrai `sfNiveau`.
- **Dans le jeu** (`?tel=1`, état lu après la construction) :
  - le hachage des points de la route est identique jour et nuit à chaque graine : g13 94268732 (6 389 points), g14 −983360515, g5 1471525041, g21 161410640 ;
  - les **matrices de départ de TOUTES les tours** (`CITY.fam[*].M`) sont identiques ×4, en paysage comme en portrait ;
  - le nombre de tours est le même : 1 082, 2 057, 1 964 et 1 713.
- **Une seule différence de construction** : les **couleurs d'instance de la famille des néons**. Par exemple g13 : 790,4 la nuit contre 985,1 le jour. La nuit est teintée `violet` (`vtRgb`), le jour n'a pas de teinte. Les places, tailles et nombres sont les mêmes. C'est « l'éclat des néons », donc permis.
- **Recensement de la scène** (type, nom, sommets, matière de chaque objet) : les seuls écarts sont 1 à 4 `MeshPhong` mobiles. Ils diffèrent aussi entre la référence et `?sans` : c'est le trafic et les objets en jeu, du bruit. Il n'y a **aucune différence de décor, de densité ou de scène**.
- **Coût en 844×390**, deux mesures par vue :

  | graine | appels nuit | appels jour (matin / midi / soir) | triangles |
  |---|---|---|---|
  | g13 | 70 / 119 / 49 | 69 / 125 / 50-53 | égaux à ±3 k |
  | g14 | 64 / 73 / 60 | 63-64 / 72-73 / 60-63 | égaux |
  | g5 | 93 / 85 / 59 | 94-107 / 88-98 / 58 | égaux |
  | g21 | 99 / 113 / 51 | 90-98 / 111 / 50 | égaux |

  - Partout : **154 programmes, 121-122 textures, géométries 522 à 568** d'un chargement à l'autre.
  - En portrait (g13 et g21, s30 / s60) : appels égaux ±5, triangles égaux.
  - L'écart le plus fort est g5 midi, à +5 à +13 appels. L'audit appel par appel (g5 s25 et s55) n'y trouve que **+2 à +4 sprites (le soleil et ses halos, 0 triangle)**, −1 `LineSegments` (l'éclair) et ±1 shader. Le reste, c'est le bruit d'une mesure à l'autre.
  - Le coût est donc **celui de la nuit, plus le soleil.**
- **Courses** (`?tel=1`, prébâti coupé) :
  - **ville:midi g21** : course complète, de 253 m à 6 057 m, puis portail vers nuages:nuit. **154 programmes du début à la fin, 0 clé nouvelle, 0 erreur console.**
  - **nuages:midi g8** : le portail a mené de lui-même à **ville:soir**. C'est donc **l'entrée au jour par un portail**, sur téléphone. 154 programmes, 0 clé nouvelle, 0 erreur. Le relevé n'a duré que 3 s après le portail.
  - Les 38 chargements photo : 0 erreur console.

### 3. Image (preuve C) : BLOQUANT

Planches regardées : paysage g13, g14, g5 et g21 (nuit, matin, midi, soir × s25 / s55 / s85) ; portrait g13 et g21 (× s30 / s60). Copies réduites dans `planches/controle-reprise1-{g13,g14,g21}-844x390.jpg` et `planches/controle-reprise1-g21-390x844.jpg`.

**Ce qui est réussi.**
- C'est **visiblement la même ville** : mêmes tours, passerelles, réclames et spirales aux mêmes places.
- Les **trois heures ont une identité** :
  - midi : azur, verre bleu et or ;
  - matin : pêche et or ;
  - soir : couchant violet et orange.
- **Midi g5 et g14 s55** sont francs et beaux.
- Les pièces se lisent sur la route (g5 s85, aux trois heures).
- En portrait, g21 est propre et les heures s'y distinguent.

**BLOQUANT — les tours lointaines et la route du jour, aux vues ouvertes.**

- **a. Blocs unis sans fenêtres au lointain.**
  - À s85 (g13 et g21), aux trois heures, toute la ligne d'horizon est faite de **silhouettes plates fondues dans la brume** : pêche au matin, bleu pâle à midi, rose au soir. Aucune fenêtre.
  - La nuit, aux mêmes vues, ces mêmes tours ont leurs fenêtres.
  - Le **matin à s85 (g13, g21) et à s25 (g13)** est en plus **délavé** : une brume pêche, peu de contraste, des tours aux pieds fondus qui flottent dans le pâle.
  - La consigne demandait « fenêtres visibles sur les tours lointaines » et « pas de délavé ».
- **b. La route n'a pas de reflet, et le soir la brûle en aplat orange.**
  - Dans **aucune** de mes 32 vues de jour, le reflet du ciel (`uGlace`, `uSheen`) ne se voit sur la route.
  - Le soir, la route devient un **aplat orange saturé**, sans détail : g14 s85, g21 s25, g13 s55. Le midi g21 s25 et g14 s85 donne un aplat sable.
  - Une pièce orange sur cet orange n'a pas été vue : le doute n'est pas levé.
  - L'auteur l'écrit lui-même (« trop saturé à certaines vues »). Cela reste un défaut tant que ce n'est pas corrigé.

**Mineurs (goût).**
- À s25 dans les rues serrées (g14), les trois heures se ressemblent beaucoup : tours sombres en contre-jour, seule la teinte change.
- Le haut du ciel du matin reste lavande en portrait (g21).
- Le jour n'a pas d'équivalent aux liserés néon roses de la route de nuit : le bord est un filet blanc ou or.
- Les « tours pendues » de la ville du 3/11 montrent en plein jour leurs pieds fondus dans le ciel (g13 et g5 s25). C'est voulu par la map, mais plus étrange de jour que de nuit.

### 4. Tirage (preuve E), map VILLE, ordinateur

- **Tirage sur 600** (`?tel=1`) :

  | | Crypto City | nuit | matin | midi | soir | nuages / grotte / espace / jade / canyon |
  |---|---|---|---|---|---|---|
  | référence | 113 | 113 | 0 | 0 | 0 | 116 / 110 / 110 / 105 / 46 |
  | lot | 113 | 61 (54 %) | 16 | 21 | 15 | 113 / 111 / 105 / 110 / 48 |

  - Au départ : 15 nuits pour 16 jours. Aux portails : 46 nuits pour 36 jours.
  - Les autres maps restent dans le bruit du hasard.
  - Le jour sort sous le nom **CRYPTO CITY** (`nm` de `SF_CARTES.ville`) et avec la mention « MIDI ».
  - La carte `crypto` est hors du tirage partout. Elle reste joignable par `?carte=crypto`.
- **La map VILLE** : `SF_CARTES.ville` est la nuit de Crypto City (`nm` 'CRYPTO CITY'). C'est elle qui reçoit les trois météos de jour, ce qui est voulu par la lecture retenue. La nuit `orage` est inchangée (poids 3,5, mêmes hachages). Il n'existe pas d'autre map « ville » au tirage.
- **L'ordinateur.**
  - Lecture du code : rien n'est retiré sous `ALLEGE`. La seule condition est `SF_HORS.crypto = (ALLEGE || CRYPTO_JOUR) && …`, qui ôte l'ancien jour `crypto` **aussi au PC**. C'est voulu (« même map »), mais c'est une **décision pour Sacha** : le PC perd la ville d'or, de verre et de pièces ₿.
  - **Non vu en vrai** : mes deux chargements `pc:1 tel=0` sont restés « pas prêt » à 150 s, comme chez l'auteur. En émulation mobile, `?tel=0` garde `ALLEGE` vrai (relevé `allege: true`), donc le chemin du PC n'est prouvé qu'en lisant le code.

### Mineurs (code et jeu)

- **Missions « toutes les météos »** (`m2Meteo`, `M2_METEO_MIN` 3) :
  - sur téléphone, Crypto City passe de 1 météo (hors mission) à 4, et elle entre dans la mission ;
  - sur PC, la progression faite sur `crypto:matin/midi/soir` ne compte plus ;
  - non testé en jeu.
- `?carte=ville` sans `&meteo=` donne maintenant le jour une fois sur deux : les liens de test qui attendaient la nuit changent.
- `routeTick` enveloppé rend `uGlace` et `uSheen` au béton sec, contre la règle écrite dans `routeTick` (« le béton sec ne renvoie pas le ciel »). C'est voulu par le lot, et sans effet visible dans mes vues (voir 3b).
- `sfNiveau(…,null)` appelle encore `vtBio('cjMidi','violet')` : une ambiance teintée est créée et jamais servie. C'est sans effet.
- La musique du jour est celle de la nuit (banc muet, non écouté).

### Ce que je n'ai PAS pu vérifier

- Aucun vrai iPhone : ni chauffe, ni images par seconde.
- Le vrai PC (`?tel=0` en bureau) ne démarre pas dans ce Chrome sans fenêtre.
- Le premier JOUER qui tire naturellement le jour (au vrai bouton). Le tirage n'est vérifié que par `sfTire` simulé et par le portail naturel nuages → ville:soir.
- Après l'entrée au jour par le portail, seules 3 s ont été suivies.
- La lisibilité d'une pièce sur la route orange du soir (aucune capturée).
- Le portrait de g14 et g5.

### Pour lever le refus

1. **Tours lointaines du jour** : rendre leurs fenêtres lisibles à s85, et sortir le matin du voile pêche (brume, fogN, contraste), sans programme de plus. Ce sont des valeurs d'ambiance ou des uniformes déjà compilés.
2. **Route du jour** : un reflet du ciel qui se voie à la hauteur de caméra du jeu, et un soir sans aplat orange (route moins saturée que le ciel), en vérifiant qu'une pièce s'y lit.
3. Faire trancher Sacha sur la perte de l'ancien jour `crypto` au PC et sur les missions météo.

---

## Reprise, tour 2 (2026-11-20, vers 16 h 10) — après la passe 2 (brume plus sombre que le ciel, courant ×1,8, dalle polie)

**Verdict : FUSIONNABLE.** Aucun défaut bloquant trouvé. Les deux bloquants du tour 1 sont levés à l'image : fenêtres au lointain, plus de matin délavé en pêche, reflet visible sur la route, plus d'aplat orange le soir. Il reste des mineurs (goût) et des décisions pour Sacha.

Code jugé : `cryptocity-jour.js` du 20/11 14:49 et `index.html` assemblé à la même heure. `niveaux.js` est celui du 19/11. Toutes les mesures ci-dessous sont postérieures.

Bancs : `<scratchpad>/lot-j2/controle/t2/`, avec `banc-c2.cjs` (ports 8349 / 9549, profil `profil-chrome-ctrlj2`), `banc-c4.cjs` (photos à la caméra du jeu), `mk.py`, `jobs1/2/3/5/6.json`, `out-jobs*/res-*.json` et `p1`, `p2`, `p5`, `p6.log`.

Quatre prises sous verrou (`ville-cyber-j-ctrl2`) :
- 15:21:50 → 15:25:26
- 15:34:08 → 15:38:19
- 16:01:08 → 16:03:20
- 16:03:29 → 16:05:28

Chrome tournait muet (`--mute-audio`, sfx, mus et vox coupés). Le groupe de processus a été tué, le profil supprimé et le verrou rendu à chaque prise. La référence propre (`controle/ref`, HEAD assemblé `--depuis-morceaux`, 13 185 999 octets) a été supprimée à la fin.

Mes graines : **13, 14, 33, 62** (photos et comptes), 9 (portail vers le jour), 62 (course de matin). Hasard du tirage : 4243.

### 1. Interrupteur, routes, diff, gardes : JUSTE

- **Gardes** : vertes.
  - garde-demarrage : OK (21 scripts) ;
  - garde-allege : ✔ ;
  - garde-charte : OK ;
  - `assembler --verifier` : 349 morceaux, 13 196 713 octets.
- **Empreintes `graines=1-12`** : toutes intactes.
  - ville 17b89297a6b8 / 9dc6766ea34f ;
  - crypto 5447610bd8f2 / eae97981f833 ;
  - nuages 469d52aff855 / 2e1661d8fe93 ;
  - espace 9c99fae61d38 / ea2d9e750351.

  La vitrée casse avec `VIT_SOL`, déjà avant le lot.
- **Diff**
  - `diff -rq` de la référence `code/` contre le lot : seulement `ORDRE.txt`, `niveaux.js` et le nouveau `cryptocity-jour.js`.
  - `index.html` de la référence contre le lot : 90 lignes, toutes du lot.
  - Ni route, ni autre map, ni rendu réservé, ni `sw.js`.
  - `CJ`, `CJ_BIO`, `CJ_ROUTE`, `cjPoids` et `CRYPTO_JOUR` ne sont déclarés qu'une fois dans `index.html`.
  - Aucun `IS_MOBILE`, aucun `ALLEGE`, aucun `//` dans le morceau.
- **Tirage de 200 parties** (1 départ et 2 portails, soit 600 tirages ; `?tel=1` ; programmes au tirage 0 → 0 partout) :

  | | empreinte du tirage | BIOMES | SF_CARTES | m2Cartes |
  |---|---|---|---|---|
  | référence (HEAD) | 2101787703 | 1747857425 | −69475444 | nuages,cryptoville,jade,espace,grotte,canyon |
  | lot | 2118100537 | 184114904 | −526369708 | identique |
  | lot `?sans=cryptojour` | **2101787703** | **1747857425** | **−69475444** | identique |

  Les comptes par carte et météo de `?sans` sont égaux à ceux de la référence, case par case.
- **Nuit g33**, avec un état de ville complet (route, `F.M`, `F.C`, géométries de `CITY.root`) :
  - référence, `?sans` et lot donnent les mêmes hachages : route 115647719, famM 787707963, cityH −1774614892, famC égales ;
  - appels 88-89 / 83-84 / 54-55, triangles 246-248 k / 237-240 k / 100-103 k ;
  - 154 programmes, 122 textures.
- **Le code** : `uC` est reposé à chaque image par `villeApres` avant le ×1,8 de l'enveloppe, donc rien ne s'accumule d'une image à l'autre. `uJf` est remis à null hors du jour.

### 2. Même map (preuve A) et coût (preuve B) : JUSTE

**A.** État lu dans le jeu (`?tel=1`) après la construction, nuit / matin / midi / soir :

| graine | route (hachage, points) | tours | famM | cityH | couleurs `F.C` |
|---|---|---|---|---|---|
| 13 | 94268732, 6389 | 1082 | 1080977477 ×4 | −210372394 ×4 | égales ×4 sauf la 4e famille (néons : 790,45 la nuit, 985,11 le jour) |
| 14 | −983360515, 6911 | 2057 | −1047191885 ×4 | −173690613 ×4 | idem (2906,11 contre 3451,48) |
| 33 | 115647719, 6671 | 2260 | 787707963 ×4 | −1774614892 ×4 | idem |
| 62 | −1298871485, 7066 | 1387 | 1287587044 ×4 | −1408384315 ×4 | idem |

- Portrait g14 et g33 : mêmes hachages.
- Aucune différence de géométrie, de densité ni de décor. La seule différence est la teinte de nuit des néons, de la lumière donc, ce qui est permis.
- Sur les planches, ce sont les mêmes tours, passerelles et enseignes aux mêmes places.

**B. Coût**, `?tel=1` 844×390, appels / triangles (k), s25 / s55 / s85 :

| graine | nuit | matin | midi | soir |
|---|---|---|---|---|
| 13 | 78/166 · 119/272 · 50/84 | 77/166 · 133/273 · 50/81 | 69/165 · 125/272 · 50/81 | 69/164 · 125/272 · 50/81 |
| 14 | 66/173 · 74/192 · 61/193 | 64/171 · 73/192 · 61/190 | 72/172 · 73/192 · 61/190 | 63/171 · 72/191 · 60/190 |
| 33 | 88/245 · 83/237 · 55/102 | 87/245 · 82/241 · 53/100 | 87/245 · 82/241 · 53/100 | 87/245 · 82/241 · 53/100 |
| 62 | 76/224 · 69/170 · 82/260 | 74/222 · 68/170 · 80/258 | 74/222 · 68/170 · 80/258 | 74/222 · 68/170 · 80/257 |
| portrait g14 s30 / s60 | 65/164 · 64/156 | 59/163 · 55/152 | 58/164 · 54/152 | 58/164 · 54/153 |
| portrait g33 s30 / s60 | 62/162 · 69/191 | 61/162 · 68/191 | 61/162 · 68/191 | 69/163 · 68/191 |

(La valeur basse des deux mesures ; la haute est l'image « double » du banc, ×2, de jour comme de nuit.)

- **Programmes : 154 partout. Textures : 121 (g13, g14) et 122 (g33, g62), égales à la nuit.**
- L'écart le plus fort est g13 matin s55, à 133 contre 119 la nuit. **Je l'ai remesuré** (prise 3, audit appel par appel à g13 s55) :
  - appels : nuit 120, matin 125, midi 126 ;
  - lignes qui diffèrent : Sprite 1 → 8 (le soleil et ses halos, 0 triangle), −1 `LineSegments` (l'éclair), Mesh Shader 7 → 6, et +1 « étincelles » au midi.
  - Le 133 était du bruit de mesure. **Le coût est celui de la nuit, plus le soleil.**
  - Sur g33, l'audit est **identique ligne pour ligne** à la nuit aux trois vues.
- **Courses** (prébâti coupé, clés des programmes comparées) :
  - **`ville:matin` g62** : de 262 m à 6 952 m, puis portail vers `jade:pluie`. 154 programmes à chacun des 38 relevés, **0 programme nouveau, 0 erreur console**, 0 mort.
  - **Portail VERS le jour** : `nuages:soir` g9, avec le tirage du portail imposé à `ville:midi` (`SF.force` et `SF.tirage.length=1`, juste après le départ).
    - Course complète des nuages, puis portail, puis **`ville:midi` suivie 24 s** (de 843 à 3 474 m).
    - `dbgCryptoJour()` y donne : jour vrai, `cjMidi`, uJ 0,3, pied 0, glace 2,4, sheen 0,5.
    - **154 programmes, 0 nouveau, 0 erreur.**
    - (Un premier essai, en baissant les poids, n'avait pas mené au jour : le portail est allé à `jade:matin`. Le tirage du portail était déjà fait.)
- **0 erreur console** sur les 40 chargements, les deux courses et les 6 chargements en caméra de jeu.

### 3. Image (preuve C) : PAS DE BLOQUANT

Je les ai toutes regardées : paysage g13, g14, g33 et g62 × nuit, matin, midi, soir × s25 / s55 / s85 ; portrait g14 et g33 × s30 / s60 ; et, pour la première fois, **à la caméra du jeu** (voiture, HUD, en roulant) : g14 en paysage et g13 en portrait, aux trois heures. Copies dans `planches/controle-reprise2-{g13,g14,g62}-844x390.jpg`, `controle-reprise2-g14-g33-390x844.jpg` et `controle-reprise2-camera-jeu-g14.jpg`.

**Mesures des photos** (hors HUD) :
- **0,0 % de pixels brûlés** (≥ 235 sur les trois canaux) sur les 72 photos de jour. Au plus 0,4 % au-dessus de 215.
- Contraste (écart-type de la luminance) de 37 à 67 le jour, contre 27 à 45 la nuit.

**Les bloquants du tour 1 sont levés.**
- **a. Les tours lointaines ont leurs fenêtres.** À s85 (g13, g33, g62), la ligne d'horizon n'est plus faite d'aplats pâles :
  - midi : silhouettes bleu profond, avec des grilles de fenêtres fines mais visibles ;
  - matin : brunes sur une brume chaude ;
  - soir : sombres sur l'orange.
  - Les tours moyennes sont pleines de fenêtres et de néons.
- **Le matin n'est plus un voile pêche** : 0 aplat, contraste 40 à 65.
- **b. La route a un reflet** : une bande claire du ciel en rasant, à toutes les vues s55 / s85 et à la caméra du jeu.
  - Le soir, la route est violet et corail, **plus un aplat orange** (g14 s85, g62 s85, g33).
  - À midi, elle est ardoise et bleue.
  - Les marquages se lisent partout.
- **Les heures ont leur identité** au premier coup d'œil :
  - midi : azur dur, bande d'or, ville bleue ;
  - matin : soleil bas doré, brume chaude ;
  - soir : couchant violet et orange.
- **Les néons et les enseignes se lisent en plein jour.** Les pads de boost orange se lisent sur la route aux trois heures (portrait g13).

**Mineurs (goût), aucun bloquant.**
- **Matin g13 s25** (vue plongeante sur les tours pendues) : la moitié basse est une brume ocre, avec des tours orange qui y flottent. C'est chaud, pas délavé (contraste 65), mais c'est la vue la plus voilée.
- **À la caméra du jeu**, la moitié haute de la route est une grande nappe claire : rose-blanc le matin, blanc bleuté à midi (luminance ~200, non brûlée), corail le soir. C'est le reflet en rasant. Il est lisible, mais à midi en portrait (g14 s60), le haut de la route frôle le blanc.
- Dans les rues serrées (g14 s25), les trois heures se ressemblent : façades orange, seule la teinte du ciel change.
- Le jour n'a pas les flaques et les liserés néon roses de la route de nuit (choix du lot : `uWet` laissé à la nuit).
- Les **pièces** elles-mêmes ne sont vues que petites, sur la caméra du jeu en portrait. Le matin, sur la route rose-orangée, le contraste est faible. Les pads et les objets se lisent, mais une pièce isolée n'a pas été cadrée de près.

### 4. Tirage (preuve E), map VILLE, ordinateur

- **Sur 600 tirages** (`?tel=1`) :

  | | Crypto City | nuit | matin | midi | soir | nuages / grotte / espace / jade / canyon |
  |---|---|---|---|---|---|---|
  | référence | 113 | 113 | 0 | 0 | 0 | 116 / 110 / 110 / 105 / 46 |
  | lot | 113 | 61 | 16 | 21 | 15 | 113 / 111 / 105 / 110 / 48 |

  - Au départ : 15 nuits pour 16 jours. Aux portails : 46 nuits pour 36 jours.
  - Jamais deux fois la même carte de suite.
  - Les noms affichés sont `CRYPTO CITY|MATIN|MIDI|SOIR`. `dbgCryptoJour()` donne les poids orage 3,5, matin 1, midi 1,3, soir 1,2 (`CJ.part` 0,5).
  - Les autres maps restent dans le bruit du hasard.
- **La map VILLE** : au tirage, la seule carte « ville » est la nuit de Crypto City (`nm` CRYPTO CITY). Sa nuit `orage` est inchangée (mêmes hachages et mêmes comptes que la référence). `?carte=ville` sans météo garde la nuit : c'est l'enveloppe de `sfImpose`, lue dans le code (le lot dit 3 sur 3, je ne l'ai pas rejoué).
- **L'ordinateur** (lecture du code) : rien n'est retiré sous `ALLEGE`, et le morceau n'en contient aucun. Le seul effet sur le PC est `SF_HORS.crypto = (ALLEGE || CRYPTO_JOUR) && …` : **le PC perd l'ancienne carte `crypto`** (tours d'or, pièces ₿ géantes, dirigeables, fusées, pluie d'argent, couronne d'horizon) au profit du jour de la vraie ville. C'est une **décision pour Sacha**, pas un défaut. La carte reste jouable par `?carte=crypto`. Le PC ne précompile plus ses matières au menu (`vignette-moteur.js:761`), ce qui est un gain.

### Mineurs (code et jeu)

- **`CITY.uPied` est mis à 0 à chaque image du jour** et n'est remis à 1 qu'à la construction d'une ville (`jade-balade.js:82`). Comme une même carte ne sort jamais deux fois de suite, la nuit suivante est reconstruite et l'effet n'est pas visible. Un « rejouer » sans reconstruction n'a pas été essayé.
- **Missions météo (`m2Meteo`)** :
  - sur téléphone, Crypto City passe de 1 à 4 météos ;
  - sur PC, la progression faite sur `crypto:matin/midi/soir` ne compte plus.
  - Non testé en jeu : décision pour Sacha.
- **La musique du jour** est celle de la nuit (banc muet, non écoutée).
- `sfNiveau(…,null)` appelle encore `vtBio` pour une ambiance teintée jamais servie. C'est sans effet.

### Ce que je n'ai PAS pu vérifier

- Aucun vrai iPhone : ni chauffe, ni i/s.
- Le vrai PC (`?tel=0` en mode bureau) : non lancé. Les essais du tour 1 restaient « pas prêt » dans ce Chrome sans fenêtre. Le chemin PC n'est prouvé que par la lecture du code.
- Le premier JOUER réel qui tire le jour : seuls le `sfTire` simulé et le portail imposé l'ont été.
- Une pièce isolée cadrée de près sur la route du matin.
- Le rendu de `?sans=cryptojour` au pixel près : il n'est prouvé que par les hachages, les comptes et les tirages.
- Le portrait de g13 aux abscisses fixes (vu seulement à la caméra du jeu) et le portrait de g62.

### Décisions pour Sacha (avant de fusionner)

1. **Le PC perd l'ancienne carte `crypto`** au tirage : la ville d'or et de verre, avec ses pièces ₿.
2. **La part jour / nuit** dans Crypto City : 0,5 (`CJ.part`).
3. **La progression des missions météo** faite sur `crypto:*` (PC).
4. **Le courant ×1,8 et la nappe claire de la route** à midi : à garder ou à baisser à l'œil.
