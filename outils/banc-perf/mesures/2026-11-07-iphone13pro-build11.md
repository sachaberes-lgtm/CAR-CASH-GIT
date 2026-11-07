# iPhone 13 Pro — build 11 — banc automatique du 2026-11-07

Lancé à 07/11 14:07 par `outils/banc-perf/iphone-auto.sh 11` (l'app se joue seule : banc-iphone.js ; brut : `2026-11-07-iphone13pro-build11-brut.txt`).

## Le scénario
✔ étapes en échec : 0
✔ plantage / rechargement détecté par le banc : 0
✘ scénario : PAS FINI — dernière ligne : 07/11 14:08:08 x1 banc | banc: wakeLock refusé : Permission was denied |  | v d57b7fc

## Les seuils P7 (garde-iphone.cjs)
```
✔ gels > 1 s : 0
✔ plantages : 0
✘ serpent : 2 trou(s) > 120 ms hors le trou initial : 709 ms @1.3 s, 237 ms @2 s
✘ fluide : aucune ligne à ≥ 8 min (470 s) — partie trop courte, seuil NON vérifié
✘ mémoire : moins de 2 parties relevées — seuil NON vérifié
✘ GARDE IPHONE : 3 seuil(s) franchi(s) — la vague ne part pas
```

## Les étapes (pire image depuis l'étape d'avant)
```
07/11 14:08:08 début · run 1 · scénario p7 · partie 300 s · v d57b7fc · app native · 390×844 @3 · wakeLock oui
07/11 14:08:08 début · run 1 · scénario p7 · partie 300 s · v d57b7fc · app native · 390×844 @3 · wakeLock oui
07/11 14:08:08 wakeLock refusé : Permission was denied
```

## Les gels, erreurs et sondes de la boîte noire
```
06/11 16:20:12 x1 memoire | fin 183.5 s · post figDir bvF touch play · tas - · textures 102 géométries 311 programmes 195 · partie n°1 |  | v b97e681
06/11 16:32:18 x1 memoire | fin 909.5 s · post figDir bvF touch play · tas - · textures 121 géométries 632 programmes 195 · partie n°2 |  | v b97e681
06/11 16:48:31 x1 gel | 5.8 s | post figDir bvF touch play | v 027c1b7
06/11 16:56:30 x1 gel | 1.6 s | post figDir bvF touch play hPwr figVol hAirPie | v 027c1b7
06/11 17:02:39 x1 gel | 2.5 s | post figDir bvF touch inGarage garMenuH | v 817f34a
06/11 17:02:41 x1 gel | 1.1 s | post figDir bvF touch inGarage garMenuH titreCiel | v 817f34a
07/11 13:16:40 x1 gel | 1.2 s | post figDir bvF touch inGarage garMenuH | v 93352b5
07/11 13:16:44 x1 gel | 2.3 s | post figDir bvF touch inGarage garMenuH | v 93352b5
```
