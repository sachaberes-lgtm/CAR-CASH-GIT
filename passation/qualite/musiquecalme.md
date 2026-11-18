# Lot MUSIQUECALME — la musique en segments ne décode plus en rafale à chaud (nuit du 18/11)

Branche `qa/musiquecalme`, bâtie sur `origin/qualite-appareil` (a42e9ec50). Auteur : l'agent « auteur-musiquecalme ».
Fiche : lot « musiquecalme » de `CHALEUR-PLAN-18-11.md`.

## Ce qui change
Un seul fichier de jeu : `VERSION PRINCIPALE/assets/audio/pouce-bleu-jeu.js` (le lecteur en segments `joueurSegments`, celui de NÉNUPHARS VELOURS).
Plus `code/page/bibliotheques.html` : `pouce-bleu-jeu.js?v=18` passe à `?v=19`. index.html est réassemblé en local mais pas commité (règle de la nuit).
L'app iOS : `app-ios/preparer-www.js` copie `assets/` en entier. `pouce-bleu-jeu.js` figure dans `CHARGEURS`. `outils/publie-audio.cjs` relit la ligne `const PERSO = {…}` par une expression régulière : cette ligne n'est pas touchée.

À CHAUD seulement, c'est-à-dire si `window.__ccThermique` ≥ 2 (serious ou critical, posé par l'app), ou si `__ccAllege` est vrai avec `__ccEco` = 1 (téléphone en économie) :
1. **Un seul décodage à la fois**, jamais deux en parallèle. Avant, il y en avait jusqu'à 8 en même temps.
2. **En régime : un décodage par segment de 10 s au plus.** C'est le segment suivant du palier visé à cet instant. Il part dans les 5 dernières secondes du segment. Il ne part pas dans la seconde qui suit un gel, ni pendant un gel en cours (aucune image depuis plus de 80 ms). Il part de toute façon avant les 2,25 dernières secondes. Plus aucun palier voisin n'est décodé en course.
3. **Un changement de moteur ne bascule qu'au début d'un segment déjà décodé.** Au début d'un segment, on prend le palier décodé le plus proche du palier visé. Le fondu de 8 ms et l'enchaînement à l'échantillon près sont ceux d'avant.
4. **Au départ** (`prepare`), le lecteur décode d'avance, un fichier à la fois, sur une fenêtre de 4 s qui suit le palier visé :
   - au JOUER (`PB.transforme`) et à `PB.depart`, donc sous le piqué : le segment en cours et le suivant du palier visé et de ses deux voisins ;
   - au début de la course (`PB.course`, appelé par musicStartRun) : le segment en cours et le suivant du palier visé, sans les voisins.
5. **Secours :** à 1 s du bord d'un segment, si aucun palier n'est prêt (un décodage raté), un décodage part. La reprise à la mesure suivante existait déjà.

Au frais, rien ne change.

**Interrupteur :** `?sans=musiquecalme` rend exactement le lecteur d'avant, prouvé au bit près (voir plus bas). `?musiquecalme=1` force le régime chaud même au frais (banc).
**État :** `POUCE_JEU.etat().seg.calme` donne `{on, prep, suivant, force, secours, journal:[[heure audio, raison, n° de fichier]…]}`.

## Écarts avec la fiche (j'ai suivi le code)
- **Le gain est plus petit que ne le dit le diagnostic.** Dans le vol `vol-1118-0416.json`, 3 courses sur 16 seulement ont joué NÉNUPHARS (02:53:04, 03:12:56, 03:15:04). Elles font 33 décodages en tout, sur 872 s de course. Les 13 autres courses n'ont aucun décodage et gèlent quand même. Durée médiane des décodages : 15-18 ms dans les deux premières courses ; 150-406 ms seulement dans la ville de 03:15. Le décodage ne peut donc pas expliquer seul la casse du 16/11 : ce morceau ne joue qu'une course sur dix environ. Les « gels dans la seconde » (12/16, 7/7, 9/10) sont aussi peu probants : à 75 gels par minute, presque toute seconde contient un gel. Le lot garde son sens pour ces courses-là et pour le menu, mais ce n'est pas LA cause.
- **Les « 6 décodages du départ en 0,3 s » ne tombent pas sous le volet.** Ils arrivent à 0,1-1,8 s DANS la course. Cause : le palier de départ (le cran choisi au garage, `engTier`) n'est connu qu'au départ de la course. Au JOUER, `transforme` vise encore le moteur 1. Ces décodages partaient en parallèle (149 → 221 → 313 → 356 → 406 ms en file à 03:15). Le lot les met en série, et seulement pour le palier visé au départ de la course (voir le point 4).
- **« Moins de 2 décodages par minute de course » est impossible sans mémoire en plus.** Un palier tenu joue un fichier neuf toutes les 10 s : 6 décodages par minute au minimum. Les tenir tous (8 × 3,84 Mo ≈ 31 Mo par palier) va contre la garde mémoire du lot MUSIQUE3. Le seuil réaliste est d'environ 6 par minute, contre 21 à 54 avant.
- **Retard de bascule :** jusqu'à environ 11 s dans le banc (médiane 2-5 s). La fiche dit « jusqu'à 10 s ». Le pire cas théorique est d'environ 15 s : un moteur qui change juste après le lancement du décodage attend le segment d'après.
- La fiche propose de lire `MOB_S.thermo` « par une petite fonction exposée côté code/son/ si besoin ». Ce n'était pas nécessaire. `window.__ccThermique`, `__ccEco` et `__ccAllege` sont déjà globaux, et le gel se mesure entre deux appels de `PB.niveau`, qui part à chaque image. Rien n'a été ajouté dans `code/son/`.

## Preuves du Mac (Node, sans son, sans Chrome)
Banc : `node outils/banc-musiquecalme/sim.cjs [--json] [--graine N] [--duree S] [--pas S] [--source f.js] [--qs '?…']`. Résultats : `outils/banc-musiquecalme/resultats.json`.

Comment il marche :
- Le VRAI fichier est chargé dans un contexte vm, sur une horloge virtuelle.
- Le faux AudioContext suit les sources posées et arrêtées et les gains. Le faux `decodeAudioData` compte les décodages et note s'ils se chevauchent.
- À chaud simulé : un décodage dure 150-400 ms. Chaque fin de décodage bloque le fil 100-250 ms. Il y a en plus 50 gels par minute au hasard (90-200 ms).
- Une image toutes les 33 ms appelle `PB.niveau` puis `PB.moteur`.

Il vérifie :
- chaque mesure : une seule voix audible, le bon fichier, une heure de départ exacte sur la grille (à l'échantillon près) ;
- la mémoire et le retard des bascules.

Les flux « pb » passent par le vrai chemin du jeu : `PB.lobby` 30 s, puis `PB.transforme`, 2 s de piqué, puis `PB.course`. Durée : 180 s par essai.

| scénario | régime | décodages en course | /min | /segment | en parallèle (max) | lancés < 1 s après un gel | mesures sans voix / à 2 voix / mauvais fichier / départs inexacts | pic mémoire |
|---|---|---|---|---|---|---|---|---|
| scie +1 / 5 s | froid (avant) | 99 | 33,8 | 5,6 | 4 | — | 0/0/0/0 | 25,6 Mo |
| scie +1 / 5 s | chaud, `?sans=musiquecalme` | 92 | 31,4 | 5,2 | 4 | 76 | 0/0/0/0 | 22 Mo |
| scie +1 / 5 s | **chaud, le lot** | **17** | **5,8** | **0,97** | **1** | 1 (forcé) | 0/0/0/0 | **14,6 Mo** |
| boosts | chaud, `?sans` | 115 | 39,2 | 6,5 | 8 | 100 | 0/0/0/0 | 29,3 Mo |
| boosts | **chaud, le lot** | **17** | 5,8 | 0,97 | 1 | 1 (forcé) | 0/0/0/0 | 14,6 Mo |
| pb (lobby→course) scie | chaud, `?sans` | 120 (lobby : 8 en 30 s) | 40,9 | 6,8 | 2 | 90 | 0/0/0/0 | 22 Mo |
| pb scie | **chaud, le lot** | **17** (lobby : 4 en 30 s) | 5,8 | 0,97 | 1 | 1 (forcé) | 0/0/0/0 | 14,6 Mo |
| pb départ au cran 15 | chaud, `?sans` | 63 ; départ : 7, dont 3 en parallèle | 21,5 | 3,6 | 3 | 40 | 0/0/0/0 | 22 Mo |
| pb départ au cran 15 | **chaud, le lot** | **18** ; départ : 5, en série | 6,1 | 1,02 | 1 | 1 (forcé) | 0/0/0/0 | 14,6 Mo |
| froid, le lot | (thermique 1) | identique à l'avant, au bit près | | | | | | |

- **Retard des bascules du lot :** médiane 1,8-5 s, p90 6-9,4 s, pire 9,7 s. Sur 5 graines × 300 s, le pire est 10,9 s. Avant : 2,5-3 s. Au départ au cran 15, la musique atteint le palier 15 en 2,5 s, comme avant.
- **Sur 5 graines × 300 s, moteur +1 toutes les 3 s, les 4 scénarios :** 0 mesure sans voix, 0 à deux voix, 0 mauvais fichier, 0 départ inexact, 0 trou, 0 secours. Chaque fois 0,98 à 1,01 décodage par segment. Aucun décodage « suivant » lancé dans la seconde qui suit un gel. Seuls les « forcés » (1 à 5 par 300 s, quand le gel ne laisse aucune seconde calme dans la fenêtre) passent outre.
- **`?sans=musiquecalme` = l'avant, au bit près :** les 16 essais (dont les 3 flux « pb ») donnent une sortie IDENTIQUE avec le fichier d'origine (`git show a42e9ec50:…`, `--source`) et avec le nouveau sous `?sans=musiquecalme`. Commande : `diff` des deux sorties de `sim.cjs --qs '?sans=musiquecalme'`.
- **Gardes :** `node outils/garde-demarrage.cjs && sh garde-allege.sh && sh garde-charte.sh` → OK. `node --check` du fichier → OK. `node code/assembler.cjs --depuis-morceaux` → index et 347 morceaux d'accord.
- **Banc Chrome (vrais décodages, rendu comparé à l'échantillon près) :** `outils/banc-musiquecalme/chrome.mjs`, sous le verrou. Il lance l'essai `reel` de `outils/banc-son/segments.html` avec `?musiquecalme=1` puis `?sans=musiquecalme`. Résultat : voir la section « Chrome » en fin de fiche.

## Ce qu'il faudra lire dans la boîte de vol du téléphone
Build de mesure (`?perfrec=2` / `ccPerfRecOn`=2). Mêmes conditions : branché, économie, chaud. Il faut au moins 3 courses NÉNUPHARS. Pour en forcer une, `?pouce=bleu-9551` dans la QS du build, si possible.
- **`c.D`** (triplets [t ×10 s, durée ms, Ko]), par course NÉNUPHARS. `outils/banc-perf/analyse-vol.py` imprime « décodages de musique : N … suivis d'un gel dans la seconde : n ».
  - Attendu à chaud : environ 1 décodage par 10 s de course, soit 6 à 7 par minute ou moins, au lieu de 21-54 par minute cette nuit.
  - Au départ de la course : au plus 2 décodages, en série. Les heures doivent être espacées d'au moins une durée de décodage, pas 6 dans la même 0,3 s.
  - Pas de durées qui s'empilent (149 → 221 → 313 → 406 en file) : chaque durée doit rester proche de la médiane de la course.
  - Seuil d'échec : plus de 2 décodages dans une même seconde, ou plus de 10 par minute de course à serious.
- **La part des décodages suivis d'un gel dans la seconde.** C'est peu probant à 75 gels par minute (le hasard en donne déjà 60-70 %). Il vaut mieux comparer **les gels par minute des courses NÉNUPHARS, lot contre `?sans=musiquecalme`**, une course sur deux. Attendu : moins de gels au départ de la course (les 1,5-2 premières secondes) et pas pire ailleurs.
- **`th` de la course** (secondes par état thermique) : vérifier que la course s'est jouée à serious. Au frais, le lot ne fait rien et `c.D` doit ressembler à l'avant.
- **À l'oreille (Sacha) :** la musique suit le moteur avec du retard à chaud (jusqu'à environ 10 s). Aucun trou ni double à l'enchaînement. Il faut aussi juger la musique du menu.

## Non vérifié
- **WebKit / iPhone réel :** rien n'a été installé (règle). La longueur décodée par WebKit (`juste`), la vraie durée d'un décodage à chaud et l'effet réel sur les gels sont inconnus.
- **L'écoute :** aucun son au banc. Que le retard de bascule (médiane 2-5 s, jusqu'à environ 11 s) soit acceptable, c'est à Sacha d'en juger. C'est la question déjà posée dans le plan.
- **Les autres morceaux figés** (`joueurPaliers` : boucles entières, 10 paliers) décodent eux aussi en course, au changement de palier. La boîte n'en mesure aucun (`__ccDecode` n'est que dans `joueurSegments`) et ils ne sont pas touchés.
- **Le lobby en économie au frais** (`__ccAllege` + `__ccEco` sans chaleur) passe aussi en régime calme. C'est voulu par la fiche, mais ce n'est pas mesuré sur le téléphone.
- **Si `PB.niveau` n'est pas appelé** dans un écran du menu, `calmeOk` reste faux. Les décodages partent alors à l'échéance, à 2,25 s du bord : c'est sûr, mais toujours « forcé ».
