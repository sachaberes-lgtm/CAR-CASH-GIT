# iPhone 13 Pro, app CASH CAR build 3 (version complète b97e6819, mises à jour en direct neutralisées) — boîte noire `cashcarErr`, lue par câble le 6/11 (`outils/banc-perf/boite-noire.sh`)
Palier lu dans `cashcarPalier` (même localStorage). 7 entrées « gel » (l'app note une image de plus de 1 s), aucune erreur JS, aucune ligne `serpent` (pas encore de sonde). Heure locale.

| Heure | Gel | Écran (classes du body) | Version | Lecture |
|---|---|---|---|---|
| 01:31:34 (×2) | 1,7 s | inGarage garMenuH | 817f34a | ancienne version (rétrogradée par Capgo) au 1er lancement après installation : chauffe du menu |
| 01:31:38 | 3,3 s | inGarage garMenuH figGlisse | b97e681 | la version embarquée prend le relais ; la chauffe recommence |
| 01:31:55 | 6,1 s | inGarage garMenuH figGlisse titreCiel | b97e681 | le PIRE gel : le ciel du titre (1er dessin des programmes) |
| 01:38:50 (×2) | 1,5 s | inGarage garMenuH | b97e681 | menu/garage 7 min plus tard : photos de caisses ou chauffe tardive |
| 01:38:53 | 2,4 s | inGarage garMenuH | 817f34a | la vieille version est REVENUE (mise à jour Capgo du build 2 encore active) |
| 01:42:46 (×2) | 1,3 s | inGarage garMenuH titreCiel | b97e681 | retour au titre : le ciel du titre se redessine |
| 01:42:47 | 1,0 s | inGarage dead | b97e681 | écran de fin de partie : 1 s, à la limite du seuil |

Conclusions : (1) tous les gels sont au MENU/GARAGE (`garMenuH`), aucun en course ; (2) le va-et-vient 817f34a ↔ b97e681 confirme la rétrogradation Capgo du build 2 (corrigée par le build 3) ; (3) les 3 plus longs (6,1 / 3,3 / 2,4 s) tombent dans les 25 s qui suivent le titre = chauffe des programmes, cible d'A1/A2 ; (4) les gels de 1-1,7 s plus tard = photos de caisses ou ciel du titre. À rejouer sur build 3 pur pour séparer.
