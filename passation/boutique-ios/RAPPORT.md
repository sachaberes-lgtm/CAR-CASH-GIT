# LA BOUTIQUE SUR iPHONE — débogage et optimisation (14 → 15/11/2026)

Demande de Sacha (14/11, 23 h 25) : « améliore, débogue et optimise au max la boutique sur la version iOS ».
Branche `boutique-ios` (worktree `~/cash-car/boutique-ios`), partie de `origin/qualite-appareil` (75afffba5, = build 117) : elle contient donc
le lot boutique de la session qualité (`passation/qualite/boutique.md`) et va plus loin. Rien sur main.

## Méthode
- Banc : `outils/banc-boutique-a/banc.cjs` (Chrome sans fenêtre, iPhone tactile émulé 390 × 844, `TEL_NATIF` vrai, `?tel=1`), puce ×4 pour
  approcher le fil principal d'un iPhone (le Mac est un M4 : ×4 surestime un A15, à lire en tendance).
- Cinq relectures du code en parallèle (achats, gestes de la bande, travail par image, photos et rayons, CSS WebKit) : 52 trouvailles, chacune
  revérifiée ici ; celles qui n'ont pas tenu au banc sont listées plus bas.
- Nouvelles sondes : `perf/ouverture.mjs` (puce ralentie, images lentes et fonctions coûteuses de l'ouverture), `perf/fuite.mjs`
  (N allers-retours boutique ↔ garage : nœuds, écouteurs, tas, géométries, textures, programmes, photos, toiles, adresses blob).
- Le parcours (`parcours.cjs`) ne compte plus les flèches ◀ ▶ cachées exprès depuis le 13/11 (104 fausses alertes).

## Ce qui est corrigé (un commit chacun, dans l'ordre)
| # | Défaut | Preuve au banc | Interrupteur |
|---|---|---|---|
| 1 | La carte choisie DISPARAISSAIT ~0,4 s après chaque arrêt de la bande (le clac relançait l'animation d'entrée `bqK`) | opacité 0 de 1 084 à 1 501 ms → 1 de bout en bout | — |
| 2 | **ACHETER pendant l'échange de caisse achetait la caisse d'AVANT** (garageI ne change qu'au milieu de la bascule, 0,34 s) | A achetée en touchant B puis ACHETER à 90 ms → rien d'acheté, le bouton agit sur B ensuite | — |
| 3 | Deux cartes touchées à 120 ms : le plateau montrait la 2e puis REVENAIT à la 1re (deux caisses bâties) | une seule bascule, vers la dernière choisie | — |
| 4 | La gerbe de cubes vide renvoyait ses tampons (~32 Ko) au GPU à chaque image | cachée au repos, intacte pendant le geste (photo) | — |
| 5 | Liste du rayon + clé de la bande refaites à chaque image (~3 500 chaînes/image aux PEINTURES) | rayon changé visible à 50 ms, achat sans reconstruction | `?sans=rk250` |
| 6 | **Après une course, la boutique dessinait le niveau caché derrière sa sphère** (plan lointain 9 800 m, tri du menu éteint dès la 1re course) **et refaisait l'ombre du soleil à chaque image** | 144 appels / 229 k triangles → **114 / 96 k**, plus la passe d'ombre 1024² ; retour garage et JOUER : 9 800 m, ombre rendue | `?sans=bqferme` |
| 7 | ÉQUIPER (fenêtre d'achat) n'équipait pas : JOUER partait avec l'ancienne caisse ; depuis la boutique du garage il faisait sortir de la boutique | caisse 54 équipée | — |
| 8 | Le CHAT POP-TART (plus en vente) gardait « EN BOUTIQUE 4,20 € » → INDISPONIBLE (mauvais pour la revue d'Apple) | « 🔒 PLUS EN VENTE » | — |
| 9 | Achat en € répondu en course : fête plein écran en pleine course (caisse) ou caisse rebâtie + tampon (peinture) ; onRecu fêtait sur l'écran de mort ; une peinture accordée hors course ne repeignait pas la caisse | pont StoreKit simulé (réponse à 4 s) : rien en course ni sur l'écran de mort, fête / équipement + caisse repeinte au garage | — |
| 10 | Films des FIGURES gardés avec l'ancienne peinture (clé sans la peinture) | LAGON équipée : les 4 films la montrent | — |
| 11 | Rafale de photos avant l'échange quand la bande se pose sur une NOUVELLE caisse | pas de régression (476-524 ms clac → caisse, puce ×4) ; cas « boîtes sans photo » non reproduit | — |
| 12 | 2e doigt en plein glissé / départ vertical : bande entre deux cartes, `bqaTire` collée ; glisse qui survivait au changement de rayon / RETOUR | vrais touchers CDP : bande posée à 0 px du repère ; AILES ouvert comme le témoin | — |
| 13 | L'atelier caché animé en boutique (garBeaute, néons, baladeuse, poussière, affiches) ; poussière d'or animée hors boutique | profil repos 6 s : boucle 361 → 274 ms, rendu 211 → 156, garBqPanneau 37 → 23 | — |
| 14 | Photos manquantes cherchées dans toute la bande à chaque image | toutes les cartes en vue ont leur photo | — |
| 15 | Fond de la caisse (~1 300 points) tourné à chaque image pour une levée nulle | A/B : même hauteur caisse penchée (tangage 0,75) | — |
| 16 | Poses de ronde (page ACHAT, ~8 Mo/caisse) qui chassaient vitrines, ailes et films de la mémoire des photos | plafond 4 Mo : tenu, ronde qui tourne | — |
| 17 | Reflet `lgShine` invisible (100 × 0 px) en boucle sur 12 prix longs (couche GPU chacun sur iPhone) | plus aucun lgShine en parcourant la bande | — |

## Mesures d'ensemble
- Fuites : 3 allers-retours boutique ↔ garage → nœuds, écouteurs, tas, géométries, textures, programmes et photos STABLES, 0 erreur JS.
- Ouverture à froid (puce ×4, sans base de photos) : jusqu'à 15 images > 50 ms en 5 s, pire 717 ms — c'est la file des photos des vitrines
  (chaque photo bâtit la caisse photographiée puis rebâtit la caisse affichée). Dans l'app, la base IndexedDB (PHDB) les garde : ce coût ne
  revient qu'au 1er passage après une mise à jour qui change CC_PHOTOS. Sur le 13 Pro (boîte noire du 09/11) : « boutique ouverte 2,5 s · pire 303 ms ».

## Ce qui n'a PAS été fait (et pourquoi)
- **Code « cousin » dans l'app** : il ouvre aussi les 8 caisses et 29 peintures vendues en € (règle App Store 3.1.1). Décision de Sacha du
  11/11 (« tous les items débloqués avec le code cousin ») : À LUI DE TRANCHER pour l'app (correctif prêt : `cousinTout()` faux si `window.ccAchat`).
- Verrou du pont natif (`app-ios/natif/achats.js` `enCours`, `Achats.swift` `enVol`) sans délai : touche le Swift (nouvelle compilation native), cas rare.
- Reconstruction de la caisse affichée après chaque photo : pas de moyen SÛR sans instantané complet de l'état de buildCar (relecture des photos :
  ~45 états globaux, plus ceux des gabarits). À faire seulement derrière un drapeau avec un banc de comparaison sur toutes les caisses.
- Prise d'avance des photos de la page ACHAT au garage (paliers 0-1) : elle ne part jamais au banc — la file du garage garde 12 demandes pour
  des vignettes cachées et la bloque. Hors 13 Pro (palier 2) : laissé.
- Lectures de mise en page par image dans garBqPanneau (et ~12 reconstructions de la place pendant l'entrée du titre) : gain réel mais
  risque de décaler la colonne couchée ; à reprendre avec des photos avant/après aux 6 formats.
- Chevrons de JOUER (couleur animée sous 4 ombres) : 3 petits éléments, gain faible, risque visuel sur JOUER.
- Rejetées au banc : `.bcRay` qui tournerait hors champ (il est `display:none`) ; transition `--bqaRar` coûteuse (A/B : 276 contre 252 ms, bruit) ;
  tap tremblé qui choisirait la dernière carte (non reproduit).
- « MISSION » en 5,5 px sur les cartes d'ailes / traînées : lisible au banc, choix de mise en page.
