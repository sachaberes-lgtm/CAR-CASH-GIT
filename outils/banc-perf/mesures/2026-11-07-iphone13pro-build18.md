# iPhone 13 Pro — build 18 (serpent-fluide 040a780e + P4, --jeu-fichier) — 2026-11-07, session BANC-IPHONE

## Sentinelles (protocole : app tuée ≥ 3 min, lancement, 45 s, lecture)

| heure | build | origine→DCL | trou initial | verdict |
|---|---|---|---|---|
| 20:05:38 | 17 (v 8e8c415) | 912 ms | 691 ms | SAIN (après 45 min d'app tuée depuis 19:20, sans intervention de Sacha) |
| 20:05:46 | 17 | 564 ms | 520 ms | second chargement spontané 8 s après le premier (non demandé) |
| 20:10:30 | 18 (v 040a780) | 548 ms | 509 ms | SAIN (app tuée 20:07:16, installée 20:07:22, lancée 20:10:22) |
| 20:12:53 | 18 | 4655 ms | 3724 ms | BRIDÉ — 2 min après la sentinelle saine |
| 20:13:58 | 18 | 4376 ms | 3505 ms | BRIDÉ |
| 20:15:18 | 18 | 4339 ms | 3446 ms | BRIDÉ |

**Verdict T2 : PAS DE MESURE.** Un seul lancement sain du build 18 (la sentinelle) ; les 3 lancements à froid espacés de 50 s qui ont suivi sont bridés. La sentinelle saine ne garantit pas les minutes suivantes : le téléphone se rebride en ~2 min d'app à l'écran (écran d'accueil, planète, personne ne joue). Comparer 17 et 18 exige 3 lancements sains, ce qui n'a pas été obtenu.

## Tableau 17 vs 18 — lancements SAINS seulement (un lancement = un chiffre)

| | 17 @18:46 | 17 @18:47:02 | 17 @18:47:58 | 17 @20:05:38 | 17 @20:05:46 | **18 @20:10:30** |
|---|---|---|---|---|---|---|
| origine→DCL | 935 | 660 | 694 | 912 | 564 | **548** |
| origine→prêt | 801 | 651 | 594 | 664 | 556 | **539** |
| trou initial (ms) | 688 | 607 | 547 | 691 | 520 | **509** |
| pire trou (ms) | 842 | 777 | 1094 | 759 | 718 | **1151** |
| trous > 120 ms | 4 | 4 | 3 | 4 | 4 | **5** |
| guet (s) | 3,1 | 2,8 | 2,4 | 2,9 | 2,9 | **3,2** |
| « étape rendu » + boucle (ms) | 363+363 = 842 | 331+331 = 777 | — (trou 550 « JS - ») | 348+348 = 759 | 301+301 = 718 | **407+408 = 1151** |
| « loop + piste » (ms) | 592 | 513 | 1094 | 468 | 471 | **615** (+141 à 3,1 s) |
| création renderer | 27 ms | 5 | 7 | 23 | 5 | **absente de la boîte noire** |
| création « clear-1er » | — | — | — | — | — | **absente de la boîte noire** |
| création prepare | 40 | 43 | 46 | 34 | 33 | **45** |
| création son | 89 | 57 | 67 | 60 | 58 | **92** |

Lecture (sur UN lancement, donc à confirmer) :
- le trou « étape rendu » n'a PAS baissé : 815 ms sur le 18 contre 718-842 sur le 17 ;
- « loop + piste » 615 ms, dans la fourchette du 17 (468-1094) ;
- trou initial 509 ms et DCL 548 ms : bas de fourchette du 17, pas de rupture ;
- les créations « renderer » et « clear-1er » ne sont pas écrites dans la boîte noire du build 18 (sur le 17, « renderer » y est) ; les photos après l'intro n'ont laissé aucun trou photoTour (il n'y en avait déjà pas sur le 17 sain).

## Les 3 lancements bridés du 18 (pour mémoire, même profil que le 17 bridé de 19:01)

| | 18 @20:12:53 | 18 @20:13:58 | 18 @20:15:18 | 17 bridé @19:01 |
|---|---|---|---|---|
| origine→DCL | 4655 | 4376 | 4339 | 4268 |
| trou initial (texImage2D) | 3724 | 3505 | 3446 | 3305 |
| pire trou (étape rendu + boucle) | 8899 | 9840 | 9593 | 9222 |
| guet | 17,6 s | 17,5 s | 18,1 s | 16,8 s |
| renderer / prepare / son | 33 / 216 / 329 | 29 / 204 / 279 | 31 / 212 / 395 | 29 / 231 / 177 |
| gels > 1 s | 3,7 · 3,2 · 8,9 | 3,5 · 9,8 · 1,6 | 3,1 · 9,6 · 2,6 | 9,2 · 1,4 · 8,1 · 1,5 |

## LECTURE THERMIQUE PAR LE CÂBLE — ça marche (à garder)

```
~/Library/Python/3.9/bin/pymobiledevice3 syslog live --udid 00008110-000621041468401E 2>/dev/null | grep --line-buffered -E 'thermal budget|Thermal pressure|thermalStateChanged'
```
(UDID USB du 13 Pro = `00008110-000621041468401E`, donné par `pymobiledevice3 usbmux list` ; ce n'est pas le CoreDevice FE6F8B40-…). Le syslog passe sans tunnel ni sudo sur iOS 26.6.1.
Ce que ça donne : `nfcd … processNewThermalBudget: New thermal budget: A -> B` toutes les 1-10 s, et `NFThermalMonitor thermalStateChanged: New state : 2` / « Thermal pressure is now moderate » en permanence ce soir (même quand le téléphone est sain : l'état seul ne discrimine pas, le BUDGET oui).

Budget thermique relevé :
- 20:08:45-20:10:45 (app tuée puis sentinelle 18 saine à 20:10:22) : 336-395 → SAIN
- 20:10:55 → 178 à 20:11:06, 63 à 20:12:37 (app à l'écran d'accueil) → BRIDÉ aux lancements de 20:12-20:15
- 20:13:42 134 · 20:14:42 255 · 20:15:52 315 · 20:16:28 247 (toujours bridé à 20:15:14 avec ~255-300)
Hypothèse de seuil, à confirmer : budget ≥ ~330 = sain, ≤ ~300 = bridé.

Sacha n'a pas été interrogé (pas bloqué au moment du protocole) ; question posée à 20:19 : téléphone chaud ? batterie jaune ? Réponse à reporter ici.

## Non mesuré et pourquoi
- Tableau 17 vs 18 sur 3 lancements sains : impossible ce soir avant repos (bridage en 2 min). Protocole proposé : repos app tuée jusqu'à budget ≥ 380 lu au syslog, puis la sentinelle COMPTE comme lancement 1, lancements 2 et 3 à 50 s, et c'est tout (pas de 4e lancement « sentinelle » qui gaspille la fraîcheur).
- Création « clear-1er » : jamais apparue dans la boîte noire du 18 (bridé ou sain).

## Complément 20:30 (réponse de la session serpent-fluide)
- La sonde `__ccSondeCrea` n'écrit une création que si elle dure ≥ 5 ms : « renderer » et « clear-1er » absents sur le lancement sain du 18 = « < 5 ms », pas « n'a pas tourné ». Le build suivant (v1205) les écrira toujours (`#renderer`, `#clear-1er`, `#toile`).
- Verdict d'OPTI ULTIME : 17 vs 18 (serpent) ABANDONNÉ ce soir ; le lancement sain unique suffit (« étape rendu » 815 ms, pas de gain).
- Le « second chargement » de 20:05:46 était un lancement d'OPTI ULTIME (devicectl à 20:05:44), pas un bug.
- Règle sentinelle désormais : budget thermique ≥ 380 au syslog avant chaque série ; budget noté au début et à la fin de chaque mesure.

## Arrêt 20:45
Sacha a repris le téléphone à 20:45. Mesure « menu thermique » (18 vs 16) et bissection --qs (gouvmax, imgmax, menumax, tout-max) NON FAITES, à reprendre quand le téléphone sera rendu (branché, déverrouillé, écran allumé, budget ≥ 380). Courbe du budget de toute la soirée : 2026-11-07-iphone13pro-budget-thermique-soiree.txt.
