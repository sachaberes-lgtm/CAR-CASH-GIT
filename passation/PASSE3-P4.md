# Perf 3 — P4 : le script du jeu en fichier dans l'app (2026-11-07)

**Décision : on GARDE `--jeu-fichier` comme OPTION de build** (gain faible mais réel au relancement, aucun coût). Il n'est pas activé par défaut.

## Ce qui est dans le code (branche `perf3/P4`)
- `app-ios/preparer-www.js --jeu-fichier` : après l'allègement, appelle `outils/publie-script-externe.cjs` (l'outil du site) sur `www/` :
  le `<script>` en ligne devient `<script src="jeu.<sha1 10>.js">`, même ordre de chargement, `__CC_BUILD__` déjà gravé, en-tête de recalage des numéros de ligne.
  Refuse de continuer si le script reste en ligne. `index.html` ~6,1 → ~0,85 Mo, `jeu.*.js` ~5,3 Mo.
- `app-ios/natif/natif.js` §8 : relevé du chargement, écrit dans la boîte noire (`__ccNote('chargement', …)`, lisible par câble `outils/banc-perf/boite-noire.sh`) et, en DEBUG, console `[natif] CHARGEMENT`.

## Construire
```
node app-ios/preparer-www.js --jeu-fichier --maj http://127.0.0.1:1/     # essai/dev ; en production : sans --maj, avec --jeu-fichier
```
Vérifier : un `jeu.*.js` dans `www/` (et `public/` du .app) et la balise `<script src="jeu.…">` dans `index.html`.

## Lire la ligne « chargement »
`jeu fichier|en ligne · origine→DCL X ms · origine→prêt Y ms · DCL→prêt Z ms [· jeu.js transfert …]`
- origine = `performance.timeOrigin` ; DCL = `DOMContentLoaded` (après l'exécution du grand script) ; prêt = `window.__gameReady`.
- Le mode « fichier » se lit sur la balise `<script src="jeu.…">` : le schéma `capacitor://` ne remonte pas toujours le script dans `performance.getEntriesByType('resource')` (leçon du build 14 : étiquetée « en ligne » à tort, corrigé en `6f73d535`).

## Mesure sur le 13 Pro, base saine `serpent-fluide` 8e8c415a, 3 lancements à froid chacun
Brut : `~/cash-car/perf3/batterie/2026-11-07-iphone13pro-build17-brut.txt`

| Lancement | 15 en ligne (témoin) trou initial | 17 fichier : origine→DCL | origine→prêt | trou initial | pire trou |
|---|---|---|---|---|---|
| 1 | 447 ms | 935 ms | 801 ms | 688 ms | 842 ms |
| 2 | 695 ms | 660 ms | 651 ms | 607 ms | 777 ms |
| 3 | 749 ms | 694 ms | 594 ms | 547 ms | 1094 ms |

Serpent 15 : pire trou 924 / 695 / 754 ms, 4 / 1 / 4 trous. Serpent 17 : 4 / 4 / 3 trous, guet 3,1 / 2,8 / 2,4 s.
(Le build 15 n'a pas de ligne `chargement` : la sonde n'y était pas.)

## Lecture
- Le cache de bytecode du script externe fait gagner ~250 ms sur le DCL du 2e lancement (935 → 660/694 ms) ; c'est tout : le serpent est dans le bruit.
- Les trous restants ne sont pas l'analyse du script mais le premier dessin (loop + piste 500-1100 ms dont 120-145 ms de JS) et l'« étape rendu » (330-360 ms + image boucle = 780-840 ms).
- Le build 14 (base `perf3-main` avec régression, trous de 2-9 s) n'est pas jugeable : origine→prêt 529 / 3638 / 3636 ms.
- Simulateur : non mesuré (Mac saturé, charge 130-260, `simctl launch` bloqué).
- Le critère « ≥ 20 % sur origine→prêt au 2e lancement » n'a pas pu être tranché proprement (pas de ligne `chargement` côté témoin) ; la décision de garder en option est celle d'OPTI ULTIME.
