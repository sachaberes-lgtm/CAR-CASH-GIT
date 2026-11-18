# LE DONUT DU GARAGE : rapport (nuit du 18/11)

Demande de Sacha (build 121, 13 Pro) : « On peut plus faire des donuts dans le garage en maintenant la voiture appuyée, c'est pas normal. »
Branche `qa/donut` (partie de `qualite-appareil` a42e9ec50). **Rien n'est corrigé dans le jeu : la régression n'a pas été reproduite.**

## Ce qui a été cherché
- Suspect n° 1 : le lot « sansmoteur » (200478029). Il touche `burnSon` (burn-out-2.js) et `burnCoupe` (burn-out-1.js). Relu ligne à ligne :
  sans moteur, `burnSon` continue (crissement), `engSetTier` ne fait que l'état de la boîte, `engApplique` est gardé par `gainN`.
  Toute erreur de `burnSon` est attrapée dans `burnTick` (`burnTick._w`) ; le dérapage et le donut (`burnDerape`, `burnTours`) passent AVANT lui.
  Aucune ligne du geste (pointerdown / pointermove / pointerup, `burnDebut`, `burnPart`, `burnGeste`, `BURN_TENU`) n'a changé.
- Entre le build 120 (4324e2b91) et le build 121 (a42e9ec50), aucun autre fichier du garage, du burn-out ni du CSS n'a changé.
  Relus aussi : lenteur (`cadSauteH` = `cadSaute` par défaut, amorce muette de `moteur.palier`), hudobs (`hcoTick` sort au garage),
  retaille1 (`retailleFait`), portv (`PVE.ph` seulement au passage d'un portail), mesure des rafales (sous-tranches sous `MG.on`), FAIS PLEUVOIR (`vitreReleve`).

## Preuves (banc `outils/banc-donut/donut.cjs`, Chrome sans fenêtre et muet, ?tel=1, 390×844, toucher émulé, UA iPhone)
Geste : doigt posé au centre de la caisse, tenu 1,6 s, puis 60 pas en arc (1,5 tour) en 3-5 s, puis levé. « DONUT » = burn-out parti ET au moins un tour compté.
`TEL_NATIF`, `ALLEGE` et `RETAILLE1` sont vrais au banc (les chemins du vrai téléphone).

| page | son | doigt | caisse 0 | résultat |
|---|---|---|---|---|
| a42e9ec50 (build 121) | coupé | toucher / souris | burn-out à 0,65 s, 1 tour, cap 2,5 rad | DONUT |
| 4324e2b91 (build 120) | coupé | toucher / souris | idem | DONUT |
| a42e9ec50 `?plus=moteurson` | coupé | toucher / souris | idem | DONUT |
| a42e9ec50, 4324e2b91, 04c74064d, 6eec0be53, `?plus=moteurson` | ALLUMÉ (`SND.sfx` en mémoire, Chrome muet) | toucher / souris | `BURN.son` vrai, 1 tour | DONUT partout |
| a42e9ec50 et 4324e2b91, FAIS PLEUVOIR porté, étage 30 | allumé | toucher | caisse 0 (les autres essais sont restés sur la caisse 0, sauf la 6, pas acquise : « PAS ENCORE À TOI », normal) | DONUT partout |

Mêmes chiffres au centième près entre les builds. 0 erreur nouvelle (`garageRender._bw`, `burnTick._w`, `burnTick._k` à 0). Seule erreur : `stNote` (« reading 'length' »), déjà dans le build 120.

## Hypothèse (non vérifiée)
Le burn-out se déclenche après 0,95 s de maintien ; pendant les ¾ de cette attente, le MOTEUR MONTAIT (la charge, `BURN.chg`, voix au rupteur). Depuis le lot sansmoteur
il ne reste que des tics de vibration, un tremblement et un peu de fumée : sans ce son, le doigt peut se lever avant le départ (« ça ne marche plus »).
À vérifier sur le téléphone : un build avec `?plus=moteurson` (le son du moteur rendu), ou demander à Sacha de tenir 1 s pleine.
Si c'est ça : un signe sonore de charge qui ne soit pas la voix du moteur (le crissement qui monte pendant la charge) serait la correction, à trancher par Sacha.

## Rejouer
```
node outils/banc-donut/assemble-commit.cjs <dossier> a42e9ec50 4324e2b91     # index-<commit>.html recollé depuis les morceaux du commit
sh outils/banc-donut/passe.sh <sortie.json> --jeu <dossier> --son 1 --var 'a42e9ec50,4324e2b91,a42e9ec50|plus=moteurson' --caisses 0
```
`passe.sh` prend le verrou commun (regardé chaque seconde), lance le banc, ne rend que SON verrou. Options : `--doigts toucher,souris`, `--floor n`, `--hab 'trainee:billets'`.

## Non vérifié
- Le téléphone (rien touché) : WKWebView, vrai doigt, état thermique, sauvegarde de Sacha, caisse qu'il avait au garage.
- Plusieurs caisses : `garageShow` du banc n'a pas changé de caisse (garageListe), seule la caisse 0 a vraiment été essayée.
- Le bouton NITRO / MARCHE ARRIÈRE du burn-out (#gBurnBtns) pendant le donut.
