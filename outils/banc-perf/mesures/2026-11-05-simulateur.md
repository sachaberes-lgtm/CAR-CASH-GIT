# App iOS dans le SIMULATEUR (iPhone 17 Pro 1C6222E1…, bundle .banc, build Debug depuis main 37a9e595, 5/11 23:18-23:28)
⚠ **MESURE NON REPRÉSENTATIVE : charge du Mac 160-216 pendant toute la séance** (simulateur = CPU de l'ordinateur). Les i/s et les gels ci-dessous sont ceux d'un Mac saturé, pas d'un iPhone.
⚠ Au lancement l'app TÉLÉCHARGE une mise à jour Capgo (« maj : téléchargement 817f34a7… », `downloadManifest`, prête pour le lancement suivant) : un démarrage « à froid » réel est faussé ; couper le réseau ou pointer `--maj` ailleurs pour le vrai iPhone. 7 × `reportWebViewError` dans le journal (cause non investiguée).

Séquence (touchers par l'outil simulateur) : serpent de chargement → écran titre « TOUCHE » ≈ 23:20:25 (≈ 2 min après le lancement) → 1er toucher 23:21:00 → boule → 2e toucher → menu ≈ 23:24:00 (JOUER/GARAGE/RÉGLAGES visibles) → JOUER 23:24:18 → course (auto-école « TOURNE », 71 km/h) laissée ≈ 60 s, puis jusqu'à 23:28.
Pas de portail : la course est restée dans l'auto-école (sauvegarde neuve).

`[natif] POULS` (toutes les 4 s) en course : 1 à 9 i/s (dominante 4-6), mode drive, passages 'fall' ; `BILAN RÉSEAU 60 s` : 0 adresse hors de l'app, 9 chargements locaux.
`cashcarErr` (boîte noire, localStorage du conteneur) : 26 entrées « gel » de 1,1 s à 17,6 s — en menu/garage (`garMenuH`, 2,5 à 17,6 s, répétées) et en course (`play coOn`, 1,1-1,2 s, 8 et 12 occurrences). Aucune exception JS.
Conclusion : seul le DÉROULEMENT (chaîne de lancement → titre → boule → menu → JOUER sans erreur) est établi ; les chiffres de fluidité attendent le vrai iPhone, réseau coupé, machine calme.
