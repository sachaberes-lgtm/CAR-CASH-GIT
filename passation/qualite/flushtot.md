# Lot flushtot : l'image envoyée tôt à la puce (nuit du 18/11)

Branche `qa/flushtot`, partie de `origin/qualite-appareil` (a42e9ec50). Rien sur main. Le téléphone n'a pas été touché.

## Ce qui change
- Un `gl.flush()` juste après le rendu de l'image (`composer.render()`, ou le rendu direct de repli), dans `code/moteur/boucle-6-hud.js` (l. 313, une ligne : `flushTot();`).
- Le reste vit dans un morceau neuf, `code/moteur/flushtot.js` (inscrit dans `ORDRE.txt` juste avant `moteur/boucle-1.js`) : `FLUSHT`, `flushTot()`, `dbgFlushtot()`.
- Seulement sous `ALLEGE` (vrai téléphone, ou `?tel=1`). L'ordinateur ne change pas du tout.
- Chaque course de la boîte de vol porte un champ `flt` : 1 = avec le flush, 0 = sans.

## Écart avec la fiche
- La fiche demandait de « ranger après le flush » prebTick, la mesure, cadFin et bvImage. Dans le code, ils sont DÉJÀ après le rendu (l. 315-335). Je n'ai donc rien déplacé. Le flush est posé tout de suite après le rendu, avant les copies (intro, fenêtre, ciel du menu), `engVigRender`, `prebTick`, `bvImage`, le HUD et `cadFin`.
- Conséquence : l'ordre des opérations de la boucle est inchangé, à l'instruction près. Aucun état lu pendant l'image ne peut changer d'ordre. Le diff de la boucle fait une ligne.
- Les numéros de la fiche (307-330) sont justes à quelques lignes près : le rendu est l. 311-312.
- `engVigRender` (la vignette du moteur) dessine encore sur la toile APRÈS le flush. Ses commandes partent à la fin du rappel, comme avant. C'est voulu : le gros de l'image (le composer) part tôt, et la vignette est petite.
- La fiche dit « boucle-6-hud.js : vérifier que menuchaud n'y touche pas à la l. 136 ». Mon seul changement est à la l. 313. Il n'y a pas de conflit possible à la l. 136.

## Interrupteurs
- `?sans=flushtot` : exactement comme avant. Aucun flush, aucun champ `flt` noté (`FLUSHT.coupe`). Une liste marche aussi (`?sans=x,flushtot`).
- `?flushtot=ab` : une course sur deux avec, une sans. La 1re course de la séance est SANS. L'état bascule à la 1re image dessinée de chaque nouvelle course de la boîte de vol (la toute 1re image d'une course garde l'état de la course d'avant, car la course n'existe qu'après son 1er rendu).
- `dbgFlushtot()` : l'état `{on, ab, coupe, allege, n (flushs faits), fige}`. `dbgFlushtot({on:0|1})` bascule (sans effet sous `?sans`). `dbgFlushtot({fige:1})` fige la simulation (BANC_FIGE) pour le banc photo.

## Preuves sur le Mac
Tout tourne avec `?tel=1` (ALLEGE vrai : le chemin du téléphone), Chrome sans fenêtre, muet, déguisé en iPhone 13 Pro.

1. **Logique des interrupteurs, en Node** (`node outils/banc-flushtot/ab-node.cjs`, le vrai morceau dans un faux décor, 12 courses simulées) : TOUT BON.
   - défaut : 300 flushs pour 300 images par course, `flt = 1` partout ;
   - `?sans=flushtot` (et `?sans=x,flushtot`) : 0 flush, aucun `flt` noté ;
   - ordinateur (ALLEGE faux) : 0 flush, rien de noté ;
   - `?flushtot=ab` : `flt` = 0,1,0,1,0,1 ; flushs par course 1, 299, 1, 299… (la 1re image d'une course garde l'état d'avant) ;
   - un flush qui lève une erreur : le lot s'éteint, l'image continue.
2. **Compilation** : `node code/assembler.cjs --depuis-morceaux` puis `node outils/garde-demarrage.cjs` (les 21 `<script>` d'index.html compilés par vm.Script) : OK. `garde-allege.sh` et `garde-charte.sh` : OK.
3. **Ordre des opérations** : diff de la boucle = UNE ligne insérée (`flushTot();` l. 313), juste après le rendu, dans le même bloc. Aucune instruction déplacée. `flushTot()` ne lit ni n'écrit aucun état du jeu : seulement `FLUSHT` et, avec la boîte de vol, le champ `flt` de la course. Donc rien de ce qui est lu pendant l'image ne change.
4. **Banc Chrome** (`outils/banc-flushtot/banc.py`, passe de 08:06, 74 s sous le verrou, 0 exception). Toile 1170×2532 en course (nuages), 487×1055 après la mort.
   - **Le flush est bien fait, au bon endroit** : motif 0 0 1 1 0 1 0 1 1 0 sur dix images de la vraie boucle, flushs du lot comptés 0 0 1 1 0 1 0 1 1 0 en course ; après la mort, 1 seulement sur les images dessinées (les autres sont sautées par la cadence : pas de rendu, pas de flush). ✔
   - **Mêmes comptes renderer.info avec et sans** (vraie boucle, cumul de toute l'image) : en course, SANS {(190 appels, 548 969 triangles, 380 points, 600 lignes), (191, 551 561, 380, 600)} = AVEC, les mêmes deux jeux (un effet tourne une image sur deux). Après la mort : SANS {(67, 316 942)}, AVEC {(67, 316 942), (68, 319 534)} : même alternance, l'échantillon SANS n'a tiré qu'une image dessinée. ✔
   - **`?sans=flushtot`** sur un vrai chargement : `coupe` vrai, `on` faux, 0 flush. ✔
   - **Boîte de vol** : la course du banc porte bien `flt: 1`. ✔
   - **Pixels : NON PROUVÉS au pixel près sur la vraie boucle.** Deux images de suite ne sont jamais identiques, même simulation figée (BANC_FIGE) : des nuanciers animés et un effet une image sur deux. 1re passe : dix empreintes pour dix images, flush ou pas. J'ai alors rendu LA MÊME image plusieurs fois dans un même rappel, horloge et hasard gelés. Rendu A, rendu + flush B, rendu C : le témoin A/C diffère encore de 0 à 89 pixels (un reste animé que je n'ai pas trouvé), et A/B de ~256 000 pixels en course. Mais B est le 2e rendu, A et C les 1er et 3e : c'est l'effet d'une image sur deux (les comptes alternent 190/191 de la même façon), pas le flush. Au menu, où l'écart de parité est petit, A/B = 88-176 pixels contre A/C = 0-138 : même ordre que le témoin. J'ai réécrit le test à parité égale (8 rendus, flush 0 0 1 1 0 0 1 1 ; flushés contre témoins de même parité). **Il n'a pas pu tourner** : le disque est passé sous 2 Go (1,7 Go libres à 08:30) pendant l'attente du verrou, je me suis arrêté comme demandé. À relancer : `sh outils/banc-flushtot/passe.sh` (≈ 75 s sous le verrou). Critère : à parité égale, les rendus flushés ne s'écartent pas plus de leur témoin que les rendus sans flush, et les comptes sont identiques.
   - Le reste vaut par la norme : `glFlush` ne fait qu'envoyer les commandes ; il ne change ni le résultat ni l'ordre des commandes, et la toile n'est présentée qu'à la fin du rappel.

## Ce qu'il faudra lire dans la boîte de vol du téléphone
Le build doit être cuit avec `--qs "&perfrec=2&flushtot=ab"` (A/B une course sur deux dans la même séance, même chaleur). Sans `flushtot=ab`, toutes les courses sont avec le flush : il faut alors comparer à la séance du 18/11.

Commande : `python3 outils/banc-flushtot/lire-ab.py vol-XXXX.json --th 2`. Elle range les courses par `flt` et ne garde que celles passées à ≥ 80 % dans l'état thermique demandé (2 = serious, comme Sacha ; `--th -1` = toutes).

Référence, la séance du 18/11 (vol-1118-0416, 16 courses, 851 s, tout à serious, toutes sans flush) :
`22,9 i/s calculées · vrai coût R[2] médiane 23,0 ms · p90 35,0 ms (168 mesures) · images > 34,5 ms : 44,9 % · gels 77,2/min · hors boucle 71,3/min` (7 courses au plafond de G, donc gels sous-comptés).

Colonnes et seuils pour juger « avec » contre « sans », à état égal :
- **Vrai coût R[2]** (barrière de la puce, du début de loop à la fin du dessin) : c'est LA colonne du lot. Gagné si la médiane baisse d'au moins 1 ms ET le p90 d'au moins 1,5 ms (attendu : 23 → 21-22, p90 35-36 → ~34). Moins de 0,5 ms d'écart : le flush ne sert à rien (WebKit ou ANGLE vidaient déjà au fil de l'eau) ; on peut le garder, il ne coûte rien, mais il ne faut plus compter dessus.
- **Images > 34,5 ms** (histogrammes B, cases h[4]+h[5]+h[6]) : gagné si la part baisse d'au moins 3 points (44,9 % → ≤ 42 %).
- **i/s calculées** : au moins +0,5 i/s attendu si les deux premières bougent.
- **Gels hors boucle par minute** : ne doit PAS monter (tolérance +5/min, c'est bruité). S'il monte nettement avec `flt=1`, le flush coûte sur WebKit (un envoi de plus au fil du GPU) : couper par `?sans=flushtot`.
- Attention : R[2] n'est mesuré que 5 images toutes les 5 s (la sonde armée). Il faut au moins ~60 mesures par groupe (≈ 5 min de course chacun) avant de conclure. Le lot sondecalme change aussi les gels hors boucle : si les deux lots partent dans le même build, seul l'A/B `flushtot=ab` dans la même séance départage.

## Non vérifié
- Le gain lui-même : impossible à mesurer sur le Mac (Chrome vide déjà ses commandes à sa façon, et le Mac n'est pas bridé comme le téléphone à serious).
- Le coût d'un `gl.flush()` dans WKWebView (WebGL dans le processus GPU de WebKit, ANGLE sur Metal) : supposé faible (un envoi), pas mesuré.
- Que WebKit ne vide PAS déjà le tampon au fil de l'eau : si c'est le cas, le gain sera nul.
- Le banc photo tourne sous Chrome (ANGLE du Mac), pas sous WebKit. Mais un flush ne peut changer aucun pixel selon la norme WebGL/GL : la preuve au pixel vaut pour la logique, pas pour un pilote de puce bogué.
- xcodebuild : rien de natif n'a changé, rien à compiler.

## Fichiers
- `code/moteur/flushtot.js` (neuf), `code/moteur/boucle-6-hud.js` (une ligne), `code/ORDRE.txt` (une ligne).
- `outils/banc-flushtot/ab-node.cjs` : le vrai morceau exécuté dans un faux décor, tous les interrupteurs (sortie 0 = tout bon).
- `outils/banc-flushtot/banc.py` : le banc Chrome (empreintes au pixel, comptes renderer.info, `?sans=flushtot`). Sous le verrou.
- `outils/banc-flushtot/lire-ab.py` : le juge de la boîte de vol du téléphone.
- `outils/banc-flushtot/mesures/banc.json` : la sortie du banc (petite).
