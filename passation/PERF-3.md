# PASSE 3 « au max » — branche `perf3-main` (base origin/main c9d9895d, cache v1237), état au 7/11/2026
Règle : sur vrai téléphone (TEL_NATIF) le palier 2 peut perdre de l'image ; l'ordinateur garde le maximum. Plan : `~/cash-car/perf3/2026-11-07-passe-3-max.md`.

## Fusionné (dans cet ordre)
1. `vitesse-fluide` 93352b50 (contient perf3/P2 : imgRegle et budgets) — gouverneur thermique à paliers par imgRegle (dose 60/100/140), remontée de l'image (`?mob_raise=0`), 30 calé dès le départ (`?mob_g30=0`), régime chaud à dose ≥ 100 (`?gouv=max` = avant), sonde « fluide » (dose) dans la boîte noire.
2. `perf3/P5` 11abb669 — menus froids : photos jamais pendant un défilement, vitrine plafonnée, 30 i/s au repos, banc `menus.py` (mesures non prouvées : la garde iPhone jugera).
3. `perf3/P4` e6933993 — outillage : `preparer-www.js --jeu-fichier` (script du jeu en fichier) + relevé `[natif] CHARGEMENT` ; sans effet tant que l'option n'est pas passée.
`sw.js` v1237 (commit à part). Incident : l'`index.html` de la fusion de P5 a été commité avec des marqueurs de conflit puis régénéré depuis les morceaux (`c18d0a2f`) — vérifier qu'aucun marqueur ne reste (`grep -c '^<<<<<<<' "VERSION PRINCIPALE/index.html"` = 0, fait).
4. `serpent-fluide` 6595747c (JS seul : piste en tranches de 8 ms sous le serpent, étape piste coupée en trois, textures une à une ; `?tranches=0`, `?textures=0`, `?chargement=0`) — fusion `7b30bf08`.
Pas encore fusionnés : P1 (mémoire : 1 commit banc `memoire.py` + traceur GPU/CPU), P3 (appels/programmes : aucun commit), P6 (gels en course : aucun commit), banc-iphone (c9652219).

## Compteurs (banc à instant fixe, machine CHARGÉE 40-190 : compteurs seulement, positions bruitées)
Palier 2 (avant c9d9895d → après) : nuages 140 → 121 appels, 558 k → 422 k triangles (−24 %) ; ville 52 → 47, 144 k → 116 k (−19 %) ; jade 78 → 77, 315 k → 314 k (≈ 0). Programmes 210 = 210. Le palier 2 BOUGE sur nuages/ville : attendu (image adaptée sur TEL_NATIF, règle de la passe 3) ; `?tel=0`/ordinateur NON vérifié identique au pixel. Palier 0 : voir `~/cash-car/perf3/mesures/` (avant-p0 / main-p0).

## À faire avant main
Garde iPhone (`outils/banc-perf/garde-iphone.cjs` sur la boîte noire du 13 Pro), capture A/B `?tel=0` identique, fumée couché/debout, fusion de P1/P3/P6 et serpent-fluide.

## Mesures réelles 13 Pro (app, 7/11, boîte noire, avant le débranchement ; relevé par OPTI ULTIME, 3 lancements à froid chacun)
| Build | Serpent (durée) | Trous > 120 ms | Pire | Gels |
|---|---|---|---|---|
| 9 (vitesse-fluide 93352b5) | 6 s | 4 | 2 315 ms (`photoTour` 2 291 ms sous le serpent) ; 1 228 ms (loop 677 + piste 666) ; 780 ; 715 (9 × `texImage2D`) | 1,2 s et 2,3 s au garage |
| 10 (serpent-fluide 6595747, lancements du 7/11 13:38:27, 13:39:17 + un 3e) | 3,7 s | 3-4 | 999 ms (image boucle 442) ; 1 055/990 ms au tout début (fil libre, contexte) ; 650 (piste 86 + loop 95) ; 255 (`photoTour` 237) | non relevés |
Lecture : le build 10 divise la durée du serpent par 1,6 et le pire trou par 2,3 ; reste le trou initial (~1 s, fil libre) et `photoTour` (photos du garage sous le serpent). Seuils de la garde iPhone non encore tenus (serpent : 0 trou > 120 ms hors initial).

## Batterie Mac AVANT (origin/main c9d9895d) / APRÈS (perf3-main 43269c45), 7/11 16:17-17:11 — machine CHARGÉE (40-200) : chiffres de temps et compteurs bruités
| Banc | Avant | Après | Gain / lecture |
|---|---|---|---|
| Démarrage à froid p0 ×4, médiane de 3 | menu 21,2 s · film lancé 10,5 s · script 15,3 s · tâches > 50 ms 15,0 s · tas 67 Mo · gel PRESENTS 149 ms | menu 18,1 s · film 6,3 s · script 12,9 s · tâches > 50 ms 11,3 s · tas 50 Mo · gel PRESENTS 400 ms | menu −15 %, film −40 %, script −16 %, tas −25 % ; le gel sous PRESENTS ×2,7 (à surveiller) |
| Menus (P2/P5, accueil p2 tel) | toile 585×1266, DPR 1,5, ombre 1024, 740 k px | toile 487×1055, DPR 1,25, ombre 768, 514 k px | −31 % de pixels, pire image 17 → 33 ms (bruit) ; gpu non chronométré |
| Mémoire, 5 parties enchaînées | tex 107 → 138, géo 546/906/597/473/410, progs 210 → 212, tas 269-345 Mo | tex 133 → 138, géo 544/404/601/598/460, progs 209 → 211, tas 255-322 Mo | équivalent ; les géométries varient de ±50 % d'une partie à l'autre dans les DEUX arbres (critère ±5 % non tenu ni avant ni après) |
| garde-perf p2 (2 passes moyennées, 11 maps) | — | — | NON CONCLUANT : triangles +16 %, appels +18 % en moyenne, mais bruit ±30 % (position de lecture sous charge) ; la passe calme du matin (3 maps) donnait nuages −24 %, ville −19 %, jade ≈ 0 |
| garde-perf p0 | — | — | incomplet (la 1re passe « avant » n'a pas écrit son JSON) |
| jouer.py (JOUER/REJOUER), p2tel/p2ordi (captures), serpent-film avant | — | — | PLANTÉS (JSONDecodeError / connexion refusée / erreur d'outil) : non faits ; `?tel=0` identique au pixel : NON vérifié |
| serpent-film après (Mac ×4) | — | passe 1 : 6 trous > 120 ms (pire 444) ; passe 2 : 3 trous dont 6 069 ms | charge machine : non interprétable |

## Mesures réelles 13 Pro, suite (7/11)
- Build 13 (perf3-main complet + banc) : un 1er cycle a subi l'ÉCRAN ÉTEINT à 2 min 13 (gels de 14 et 16,5 s = suspension) : **à refaire** ; p50 à 8 min = 54-83 ms ; géométries 1034 → 655 → 857 → 895.
- Cycle PROPRE du build 13 (écran allumé, 16:32-16:49, palier 16 atteint) : serpent 3 572 / 3 006 / 833 / 9 058 ms ; 15 gels > 1 s EN COURSE (2,1 · 3 · 9,1 · 8,8 · 3,8 · 2 · 2,4 · 1,7 · 1,4 · 1,3 · 2,2 · 4,1 · 2,9 · 2,5 · 1,2 s) ; p50 à 8 min 45-83 ms ; géométries 687 → 633 → 835 ; 1 plantage/rechargement. NETTEMENT PIRE que le build 6 (main seul : 0 gel > 1 s en course, serpent ≤ 1,3 s) et que le build 12 (serpent-fluide seule : ≤ 1 340 ms). Hypothèses : n°1 bascules d'imgRegle du gouverneur (réallocation setSize à chaud) ; n°2 P5 (HC 30 i/s, photos) ; n°3 écritures localStorage de 30 Ko. Bissection Mac et `bascules.py` en cours. **Aucune fusion dans main tant que ce n'est pas réglé.**

## Interrupteurs pour tout remettre comme avant
`?gouv=max` (gouverneur à paliers + régime chaud) · `?mob_raise=0` (pas de remontée) · `?mob_g30=0` (pas de 30 calé dès le départ) · `?img=max` (image de P2) · `?menu=max` (menus de P5) · `?tranches=0` / `?textures=0` / `?chargement=0` (serpent) · `?mob_gouv=0` (gouverneur éteint) · `?lierintro`/`?prebati=0` (A1/B1 de la vague 1, dans main). `--jeu-fichier` : option de build seulement.

## Mesures réelles 13 Pro — build 17 et téléphone bridé (7/11, relevé OPTI ULTIME)
- Build 17 = serpent-fluide 8e8c415a + P4 (`--jeu-fichier`) : origine → prêt 801/651/594 ms ; serpent : pire trou 842/777/1 094 ms, trou initial 688/607/547 ms, 4/4/3 trous > 120 ms. Le script en fichier ne change pas le serpent (témoin build 15 : pire 924/695/754). Brut : `~/cash-car/perf3/batterie/2026-11-07-iphone13pro-build17-brut.txt`.
- ⚠ **Le téléphone peut être BRIDÉ** : le build 17, parfait à 18:46 (DCL 0,7-0,9 s, pire trou ≤ 1,1 s), est devenu 5-10× plus lent à 18:53 et 19:01 (DCL 4,3-4,5 s, étape rendu 4,9 s, gels 8-9 s) SANS changer de build (chaleur après ~1 h en charge, ou économie d'énergie). Une partie de la « régression du build 13 » (16:32-16:56) est donc peut-être le TÉLÉPHONE chaud, pas le code. **Règle : avant toute mesure, lancer l'app et lire la ligne « chargement » (ou le 1er trou du serpent) ; refuser de mesurer si origine → DCL > 1,5 s ; noter la valeur en tête du rapport.**
- Outil : `preparer-www.js --qs "&gouv=max&img=max"` (3a41cf74) cuit des interrupteurs d'URL dans l'app de dev.

## Bissection Mac du chargement : SANS VERDICT (bruit)
7 variantes (avant, serpent-fluide seule, perf3-main de base, ?gouv=max, ?img=max, ?menu=max, les trois) puis rejeu à charge 38-55 : menu touchable « avant » 18,4/18,9 puis 21,9/21,6 s, perf3-main 22,2/22,5 s ; ScriptDuration 13,1-15,3 s partout. Les écarts sont dans le bruit de charge ; aucun levier désigné sur Mac. On tranche sur l'appareil avec les builds `--qs` (`preparer-www.js --qs "&gouv=max"`). Builds conservés pour réinstallation : `~/cash-car/perf3/builds/build<N>.app`.

## PUBLIÉ le 9/11 : 6c70ae92 (v1368)
Merge no-ff de `perf3-sur-main-6` dans `origin/main` (+ main f36577dd v1367 arrivé entre-temps), cache v1368, par OPTI ULTIME sur le « Oui, publie » de Sacha. 4 gardes + garde-démarrage OK, fumée `?tel=1` verte. Détail des fusions et des conflits résolus : `passation/FUSION-MAIN.md`.

### Interrupteurs de secours (URL ; chacun ramène le comportement d'AVANT son levier)
| Interrupteur | Levier coupé |
|---|---|
| `?intro=sous` | intro : tout prêt avant le film (INTRO_APRES) |
| `?grotteworker=0` | grotte creusée dans un travailleur (retour sur le fil principal) |
| `?repos=0` | menus : repos à 15 puis 10 i/s sans geste |
| `?shoppre=0` | boutique : photos des caisses prises d'avance (SHPRE) |
| `?boom=ancien` | écran de mort : fin de l'explosion à l'horloge réelle |
| `?img=max` | image téléphone : tout au maximum |
| `?gouv=max` | gouverneur thermique : plein régime (pas de dose) |
| `?mob_poly=0` | polyphonie des bruitages sous la chaleur |
| `?segments=0` | niveau bâti en segments (P3) |
| `?brumepoly=0` | brume en polygone circonscrit |
| `?imgsans=i` | levier image (i) |
| `?memoire=ancien` | mémoire : budgets d'avant |
| `?premfois=0` | première fois : chauffe des portails |
Autres déjà documentés : `?menu=max`, `?menucull=0`, `?cielprise=ancien`, `?feu=ancien`, `?mob_gouv=0`, `?mob_g30=0`, `?tranches=0`, `?imgplus=g|j` (à demander), `?prebati=0`.
