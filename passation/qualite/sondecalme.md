# Lot sondecalme : la sonde native ne tient plus le fil de l'app (18/11, nuit)

Branche `qa/sondecalme`, partie de `origin/qualite-appareil` a42e9ec50. Fiche : lot « sondecalme » de `CHALEUR-PLAN-18-11.md`.

## Ce qui change
1. **Natif** (`app-ios/ios/App/App/JeuViewController.swift`, `SondeNatif`). Le nouveau message `go:fond` est envoyé par défaut.
   - La minuterie d'1 s et la pression mémoire tournent sur une file à elles (série, qos userInitiated). Leur travail dure quelques µs.
   - La sentinelle (200 × 1024 additions) passe sur une autre file (série, qos utility). Elle ne tourne plus qu'**un battement sur 5** et ne retient jamais la minuterie. On la mesure en **temps processeur** du fil, et aussi à l'horloge.
   - Le fil principal ne reçoit plus qu'un petit bloc par seconde. Ce bloc mesure son **attente** (de l'envoi à l'exécution sur .main, en µs) : c'est le nouveau témoin « fil de l'app pris », puis il passe les valeurs à la page.
   - La page reçoit `__ccSw = [pression, sentinelle µs processeur (-1), retard ms ×10, attente du fil app µs, sentinelle µs horloge (-1)]`.
   - Le message `go` refait EXACTEMENT l'ancien battement sur .main (le code d'avant n'a pas bougé).
2. **natif.js**. Il envoie `go:fond` au lieu de `go`. Le POULS Debug (un rAF permanent et un elementFromPoint toutes les 4 s, l. 439-444) se tait par défaut.
3. **Mesure de la page** (`code/moteur/enregistreur-perf.js`, `code/moteur/mouchard-gels.js`) :
   - `CAD.rN` est remis à 1 dans `bvNeuve` : R[0] de la 1re seconde ne compte plus les rAF du menu (jusqu'à 12 256 au vol 0416).
   - Chaque battement natif est horodaté côté page, par un accesseur sur `__ccSwN` (ça marche aussi avec l'ancien battement). Par course, `c.SW` reçoit 5 nombres par battement : [ms depuis le départ, sentinelle processeur µs, retard ms ×10, attente du fil app µs, sentinelle horloge µs]. Au plus 1200 battements, et `c.SWp` compte les perdus.
   - `G[51]` (nouvelle colonne, à la fin, les indices d'avant ne bougent pas) dit si un battement est arrivé dans le trou du gel : ms depuis le début du trou, ou -1.
   - `gl readPixels` est aussi compté **par appelant** dans `c.Y` : « gl readPixels ← nom l.LIGNE » (la ligne d'index.html ; les cadres de three.js sont sautés). On garde au plus 12 étiquettes, puis « autre ». La clé « gl readPixels » reste le total, donc les analyses d'avant lisent la même chose.

## Interrupteurs
- `?sans=sondecalme` : tout comme avant. Le natif reçoit `go`, le pouls revient, et la page n'a ni remise à zéro de rN, ni c.SW, ni G[51], ni étiquette (G garde ses 51 colonnes).
- `?sondemain=1` : **le contrôle A/B du vol**. Seul le coût natif d'avant revient (battement sur .main et pouls) ; la mesure corrigée reste (c.SW, G[51]). Avec cet interrupteur, G[51] doit sortir bien au-dessus du hasard. Sans lui, il doit retomber au hasard.
- `?pouls=1` : le pouls Debug seul.
- `?sans=sondenatif` (déjà là) : aucune sonde native.

## Écarts avec la fiche
- La fiche place la remise à zéro de rN dans `code/moteur/cadence.js`. Elle est dans `bvNeuve` (enregistreur-perf.js), là où la course commence. cadence.js n'est pas touché, donc pas de conflit avec le pilote ni avec menuchaud. On remet à **1**, pas à 0 : cadSaute a déjà compté l'image de cette loop.
- La fiche propose `DispatchQueue.global(qos:.utility)`. J'ai pris deux files **série** à elles, pour éviter toute course de données sur `tas`, `pression` et `dernier`. Au banc, une sentinelle sur la même file que la minuterie, en utility, prenait 1,3 à 1,7 s à l'horloge sur le Mac saturé. Elle retardait le battement suivant de 347 ms. D'où la séparation : minuterie en userInitiated, sentinelle en utility, un battement sur 5.
- **M[25] change de sens** avec le lot. Ce n'est plus l'horloge sur .main (49-67 ms au vol 0416), mais le temps processeur sur une file basse, une seconde sur 5 (-1 les autres). Il ne faut pas le comparer tel quel au vol 0416. Le thermomètre comparable entre vols, c'est la course avec `?sondemain=1`.
- « POULS » dans les analyses (G[37], le guet du mouchard) n'est pas le POULS de natif.js. Le lot ne touche qu'à celui de natif.js. Le guet G[37] reste.
- `app-ios/www/natif.js` (suivi, généré) n'est **pas** régénéré : c'est `cd app-ios && npm run sync` à l'intégration. Si on l'oublie, l'app envoie `go`, et on retombe exactement sur l'ancien comportement : rien ne casse.

## Preuves sur le Mac
- Syntaxe Swift : `xcrun swiftc -frontend -parse JeuViewController.swift` passe. **Vérification de types** de la classe SondeNatif seule, avec le SDK iOS : `xcrun --sdk iphonesimulator swiftc -typecheck -swift-version 5 -target arm64-apple-ios16.4-simulator` passe (Swift 5 et iOS 16.4, comme le projet).
- **Banc du fil principal** (`outils/banc-sondecalme/banc-fil.sh 30 3`). C'est la VRAIE classe, compilée en -Onone comme l'app Debug, avec un top à 33 ms sur .main pendant 30 s. Trois tours, Mac saturé (une dizaine d'agents) :

  | mode | tops ratés (> 33 ms de retard) | q99 du retard | pire |
  |---|---|---|---|
  | rien (aucune sonde) | 4 · 6 · 0 | 25,6 · 21,0 · 10,3 ms | 126 · 63 · 24 ms |
  | main (ancien, `go`) | **26 · 28 · 25** | 71,7 · 64,5 · 52,4 ms | 452 · 243 · 177 ms |
  | fond (le lot) | **7 · 2 · 0** | 27,3 · 17,1 · 10,8 ms | 61 · 39 · 14 ms |

  En -Onone, la sentinelle sur .main dure **49-75 ms** sur le Mac (jusqu'à 324 ms quand il est chargé), soit le même ordre que le téléphone (49-84 ms). Avec le lot, le fil principal reste au niveau du bruit de fond. L'attente du petit bloc sur .main vaut 12 à 355 µs. La sentinelle sur sa file : 52 ms de processeur pour 840 ms à l'horloge (une file utility est affamée sur un Mac saturé, d'où le temps processeur).
- **Banc Node de la mesure** (`node outils/banc-sondecalme/test-mesure.cjs`, 19 contrôles, tous bons). Il prend les vrais morceaux de code/, découpés dans le texte :
  - après 8 min de menu, R[0] de la 1re seconde vaut 30 avec le lot, et 14 430 avec `?sans=sondecalme` ;
  - c.Y avec 6 readPixels : total 6, puis « ← qlSonde » 3 (à travers three.js), « ← vignetteLis » 2, « ← anonyme l.3 » 1. La somme des ms des étiquettes égale le total, et la famille n'est comptée qu'une fois ;
  - une pile JSC (WKWebView) de synthèse donne « qlSondeLis l.51234 » ;
  - 20 appelants donnent 12 étiquettes plus « autre » ;
  - c.SW et G[51] sont justes (80 ms dans le trou, -1 hors du trou) ;
  - `?sans=sondecalme` : rien de tout cela.
  - Une pile coûte ≈ 19 µs dans V8, pour 16 à 64 readPixels par course.
- `node code/assembler.cjs --depuis-morceaux` puis `--verifier` passent. Les gardes passent : garde-demarrage (21 scripts), garde-allege, garde-charte.
- Référence (`outils/banc-sondecalme/juger-vol.py`) :
  - vol 1118-0416 (build 121, serious 851 s) : **69,6 gels hors boucle/min**, dont **88 %** à un entier de seconde d'un gel précédent ; M[25] q50 56,5 ms ; R[0] de la 1re s q50 262, pire 12 256 ;
  - vol 1117-1448 (build 120) : 6,0 gels hors boucle/min, 43 % à un entier de seconde.

## Ce qu'il faudra lire dans la boîte de vol (vol suivant, branché + économie + chaud)
`python3 outils/banc-sondecalme/juger-vol.py vol-AVEC.json [vol-sondemain.json]`. Mieux encore : dans la même séance chaude, une course avec `?sondemain=1` et une course sans (le QS se pose au lancement : CC_QS ou --qs).
- **Gels hors boucle / min** (G, hors boucle). Le lot a marché si on passe nettement sous 69,6/min à serious ; le but est d'approcher le build 120 (≈ 6-25/min selon la course). Si ça ne bouge pas, la cause est ailleurs.
- **« à un entier de seconde »**. Avec le lot, ce chiffre doit tomber **vers 40-45 %** (le niveau du build 120 : 43 %). S'il reste vers 80-90 %, un battement à 1 Hz existe encore.
- **« battement natif DANS le trou »** (G[51]) comparé au **hasard**. Sans le lot (`?sondemain=1`), il doit être loin au-dessus du hasard : c'est la preuve directe qui manquait. Avec le lot, il doit être ≈ au hasard.
- **Attente du fil principal de l'app** (c.SW[3]). En temps normal, q50 de quelques dizaines de µs. Un q90 au-delà de 30 000 µs (30 ms, un top) veut dire que le fil de l'app est pris par autre chose (Capacitor, journaux Debug) : piste suivante.
- **Retard du battement** (c.SW[2], ms ×10, sur une file userInitiated) : q90 sous 5 ms attendu. Au-delà de 30 ms, c'est tout le téléphone qui sature.
- **Sentinelle** (c.SW[1] temps processeur, c.SW[4] horloge, M[25]) : un thermomètre, une seconde sur 5. Il se compare entre courses d'un même vol, pas avec le 0416.
- **R[0] de la 1re seconde** : ≈ 30, plus jamais des centaines ni des milliers.
- **c.Y « gl readPixels ← … »** : qui fait les 16-64 readPixels synchrones par course. Le numéro de ligne se retrouve dans le morceau avec `node code/assembler.cjs`.

## Non vérifié
- Rien n'a tourné sur le téléphone, et rien n'a été installé.
- La compilation complète de l'app (xcodebuild, avec Capacitor) n'a pas été faite : seulement la syntaxe du fichier et les types de la classe seule. Elle se fera à l'intégration.
- Le gain sur les gels n'est pas prouvé : le lien battement → gel reste PROBABLE tant que le vol suivant n'a pas montré G[51].
- Le coût réel de la sentinelle sur une file utility d'un iPhone chaud (cœur E ?) est inconnu : ce sera c.SW[1] et c.SW[4].
- Je n'ai pas lancé de banc Chrome de la page entière : la mesure de la page n'est prouvée qu'en Node, sur les vrais morceaux. L'accesseur de `__ccSwN` n'a pas été essayé dans WKWebView.
- `app-ios/www/` n'est pas régénéré (`npm run sync` à l'intégration).
- Le pouls coupé : l'effet du seul rAF en moins n'est pas mesuré (« rAF par image d'écran » doit passer de 3 à 2, à lire dans M[12]).
