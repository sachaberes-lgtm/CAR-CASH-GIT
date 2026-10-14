# oeil-neuf — l'œil neuf de la passe graphismes (14/10, branche gfx/oeil-neuf, copie gfx/wt/oeil-neuf)

Méthode : `?palier=2`, cran de départ réel (SANS dbgQual/dbgDPR), DPR du jeu (plafond 1 en RAPIDE, toile 844×390 agrandie ×2), HUD visible,
couché 844×390 (marges iPhone), 22 couples par vrai tirage (`dbgClassique` + `dbgPortail(260)`, repli `dbgSaut`), pilote auto. Une capture A (+4,5 s après l'arrivée) et une B (+5 s).
Scripts : `gfx/banc/oeil-neuf/s1.cjs` `s1b.cjs` (couples), `s2.cjs` (garage, crypto, debout), `s3.cjs` (vérif avant/après + planche).
Captures : `gfx/shots/oeil-neuf/<carte>-<météo>-A|B.png`, planche `planche-tout.png`. (`shots/oeil-neuf-faux/` = 1re passe, pilote auto mort : à ignorer.)
⚠ BIAIS DU BANC : le pilote auto prend de la vitesse (240 km/h au 1er niveau → 1 800 km/h au 12e) : à partir de la VILLE, la plupart des images sont à 800-1 900 km/h
(flou radial, nitro violet, tunnel, vignette de vitesse au maximum). Les NUAGES et le jade midi/soir sont les images « calmes » (230-450 km/h). Un joueur réel est entre les deux.

## JUGEMENT À FROID (avant lecture de DIRECTION.md) — les 10 défauts les plus visibles, du pire au moins grave

1. **Le jus de fruit sur l'objectif (taches pixel géantes) + confettis** — sur plus de la moitié des captures, une tache pleine couleur (rose, rouge, violet, jaune, orange) de 150-400 px
   recouvre un coin entier, passe sous le HUD et recolore jusqu'à un quart de l'écran (`nuages-pluie-A` rose derrière le $, `ville-matin-A/B` rose et rouge, `nuages-soir-B` rouge, `espace-matin-A` violet,
   `jade-midi-A` sable). Casse la propreté, la charte « encre·blanc·or » et la lisibilité du HUD. Cause : `juiceScreen` / `JUS` (≈ l. 40040-40110 : rayon `R`, plafond 10 taches, liseré, coulure), une tache par fruit croqué ;
   les confettis sont les `?` de la fête (autre système). Correctif : plafond 10 → 3, rayon ×.45, opacité max .55, disparition ×2 plus vite, et JAMAIS sous la zone du HUD (`JUS_ZONE` existe déjà) ; effort S (valeurs JUS_*), zone Léo (ne pas toucher sans son accord).
2. **La vignette de vitesse prune (`#speedFx`)** — dès 280 km/h, un calque DOM radial `rgba(45,20,55,.55)` (l. 372) monte à opacité .95 et teinte les bords de TOUTES les maps de violet-prune
   (marron sale sur les nuits et orages : `nuages-nuit-A`, `jade-pluie-A`, `jade-orage-A` ; violet franc en ville : `ville-nuit-A`, `ville-midi-A`). Ni la brume ni l'ambiance ne la commandent : c'est une couche qui ne sait pas où elle est.
   **CORRIGÉ** (plafond .95 → .6, commit « la vignette de vitesse … »). Reste à faire (chantier) : la teinter par ambiance (`BIO.cur.vigC`) ou la passer dans l'ACES (déjà `uVigK/uVigC`) et supprimer le calque.
3. **Le nitro violet recolore tout l'écran** — `ville-midi-A` (1263 km/h) et `ville-matin-B` (1168 km/h) : jauge, flammes, éclair, filés et bords passent à l'ultraviolet : l'image entière devient « néon IA » (celui que Sacha a rejeté), la ville n'existe plus.
   Cause : teinte nitro (`nitroBlue`/violet) dans `acesPass` (lueur de nitro) + HUD ; Correctif : lueur du nitro à ≤ .4 en valeur et plus blanche (ou or) ; effort S-M (zone flou-vitesse/Léo).
4. **La mer de nuages de jour a des cumulus lourds, gris-lavande, à facettes plates** — `nuages-matin-A/B`, `nuages-midi-A/B` : un mur de nuage sombre bouche le ciel, il y a plus de gris que de blanc ;
   à midi le ciel ressemble à un ciel d'orage. Au soir (`nuages-soir-A/B`) les cumulus sont des galets mauve/or cernés d'un liseré (cel-shading), plastique. Cause : `volSun/volSky/volGnd` (bloc ÉTALONNAGE MER DE NUAGES, l. 19850-19853)
   + matière du cumulus (shader `cumulus`, ombrage plat par face). Correctif : `volGnd`/`volSky` ↑ de ~15 % et `hemiS` plus clair au midi ; adoucir l'ombre des faces (pas de liseré) ; effort M, à juger à l'image (non fait : pas de banc A/B dans le temps).
5. **La route du JADE SOIR est le béton le plus clair et le plus beige du jeu** — `jade-soir-A` : sable chaud L* ~60 quand les autres soirs sont à ~45 et gris-mauve (`nuages-soir`, `ville-soir`). Rompt « un béton gris minéral partout » (décision de Sacha).
   Cause : BIOMES.jade (soir de Léo) n'avait pas de `rtK` (=1). **CORRIGÉ** (rtK .72, commit « le soir du jade … »).
6. **Jade nuit / orage : rochers noir pur sur ciel noir** — `jade-nuit-A`, `jade-orage-A` : plus aucune silhouette, la route flotte ; les noirs sont bouchés (le pied de courbe manque, notes/chaine-couleur.md §3.3).
   Correctif : `POST_PIVOT`/pied de courbe ou ciel de nuit plus clair derrière les rochers (jdB/jdH du jade nuit) ; effort S-M (zone etal-jade).
7. **Les bandes de brume ont des bords nets** — `jade-midi-B` (banc de brume mint à gauche, bords verticaux et horizontaux droits, en rectangle), `jade-pluie-A` ; `nuages-matin-A` : la dalle de béton finit sur une ligne d'horizon droite
   et dure, sans fondu atmosphérique, alors que le ciel est doux. Cause : plans de brume/`coton` (planes alpha) et `fogN/fogF` trop courts pour la dalle ; Correctif : alpha en dégradé sur les bords des plans, `fogF` +15 % ; effort M.
8. **Le HUD de course reste en néon violet quand les écrans (mort, titre, menus) sont passés en encre/blanc/or** — `ville-midi-A` : jauge violette rayée, compteur AURA en dégradé rose-violet, liseré violet partout ; l'écran de mort (`jade-midi-A` de la 1re passe) est à plat encre+or.
   Deux langages dans le même jeu. Cause : la refonte charte 6 n'a pas encore traité le HUD de course (`#hud`, `#aura`, `#nitroBar`). Zone INTERFACE, non touchée.
9. **Titre : la voiture est brun-rouille (L* ~35) alors qu'elle est orange vif en course** — `titre.png` : la caisse est mate et sombre sur un ciel éclatant, sans le même rim/ombrage ; des filets blancs verticaux, très fins, traversent la mer de nuages (x ≈ 85, 510, 1 360 : plans de rayons ?).
   Cause : lumière de la scène du titre (VHD, `hemi/sun` de `MENU_BIO`), pas l'ambiance de course ; Correctif : `dbgAmb(MENU_BIO,{sunI↑, hemiI↑})` ; effort S.
10. **Les cumulus de la nuit des nuages et de la pluie restent des blocs plats blanc-lavande** — `nuages-nuit-A` (le grand cumulus au fond est un aplat bleu-gris sans lumière), `nuages-pluie-A` (voile gris laiteux, contraste le plus bas du jeu, pas de ciel lisible).
   Cause : `volSun/volSky` déjà baissés par les agents ; ce qui reste est la matière (pas de dégradé de densité). Correctif : propositions « matière des nuages » (coton-blanc) ; effort M.

## À signaler hors top 10
- Autopilot de banc : 3 morts dans le jade à partir du 13e niveau (rochers de bord) — pas un défaut d'image.
- La lune de l'orbite a un visage qui écarquille les yeux (gag voulu).
- `espace-*` : la route est un béton gris clair uniforme, sans marquage ; très propre, mais la plus plate des 4 maps (ni dalle ni joints visibles).

## CORRECTIFS FAITS (derrière `?sans=oeil`, `const OEIL_V1`)
- `50cccc0` vignette de vitesse #speedFx plafonnée à .6 (au lieu de .95).
- `6a124ae` jade soir : rtK .72.

(compléments : voir la fin de ce fichier une fois les captures de garage/crypto/debout et la vérif avant/après lues)

## LA PLANCHE ENTIÈRE (shots/oeil-neuf/planche-tout.png) — ce qu'on voit quand on les pose côte à côte
- Quatre familles : NUAGES (bleu/pêche, béton gris), VILLE (toute la ville est lavée de violet : ligne 2-3, c'est le cumul vitesse 800-1 900 km/h + #speedFx + nitro, donc 4 cartes sur 6 « se ressemblent » à tort), JADE (la plus cohérente : céladon, brume, béton gris-vert), ESPACE (noir, béton gris plus clair, un seul accent orange/planète).
- La carte en dessous des autres : la VILLE aux vitesses du banc ; à vitesse normale (crypto-A, 242 km/h, même ville) l'image est belle : le défaut est donc bien la couche de vitesse, pas l'étalonnage de la ville.
- CRYPTOCITY (242 km/h) : la plus propre et la plus claire du jeu (ivoire, bleu franc, aucun néon). Debout 390×844 : la caisse occupe plus de la moitié de la largeur et ~40 % de la hauteur (caméra serrée), la route à peine visible ; le HUD tient. Confettis denses (cf. défaut 1).
- GARAGE : néon bleu du disque + guirlande de couleurs + porte de lave : le seul lieu qui reste « néon » (hors charte 6) ; moitié droite de la salle en noir bouché (aucun détail dans l'ombre). TITRE : voir défaut 9.
- Vérif des 2 correctifs : `fix-jadesoir-avant/apres.png` (route sable L* ~60 → béton gris-brun mat ; reste un voile chaud de coucher de soleil sur toute l'image, voulu) ; `fix-speedfx-avant/apres.png` (opacité forcée .95 / .6 sur une nuit à 263 km/h : écart faible, il ne se voit qu'aux vitesses ≥ 600).

## CHANTIERS POUR LES AGENTS SUIVANTS (zone exacte → effet attendu)
1. `JUS_*` / `juiceScreen` (≈ l. 40040-40110) : max 3 taches, rayon ×.45, alpha .55, hors `JUS_ZONE` du HUD → écran lisible, plus de tache couvrant le coin du HUD.
2. `#speedFx` (CSS l. 372 + JS l. ~53270) : teinter par `BIO.cur.vigC` (ou remplacer par l'uniforme `uVigK/uVigC` de l'ACES) → plus de prune sur les nuits/orages/jade.
3. Lueur du nitro violette (`acesPass` lueur nitro + `nitroBlue`) ≤ .4 et blanc-or → la ville ne vire plus à l'ultraviolet à 1 000 km/h.
4. Nuages jour (bloc l. 19850-19853) : `volGnd/volSky` +15 %, adoucir l'ombrage des faces des cumulus (liseré sombre) → midi qui ressemble à midi.
5. Jade nuit/orage : ciel/brume derrière les rochers (jdB/jdH) un cran plus clair → silhouettes lisibles.
6. Brume : plans `coton`/brume du jade (bords rectilignes visibles `jade-midi-B`) → alpha dégradé sur les bords ; dalle des nuages : `fogF` +15 % pour fondre la ligne d'horizon.
7. Titre : `dbgAmb(MENU_BIO,{sunI,hemiI})` pour que la caisse retrouve l'orange du jeu ; chasser les filets blancs verticaux (plans de rayons).
8. Garage : un pied de courbe sur les noirs (POST_PIVOT .35 déjà en hook : `dbgGfx({pivot:.35})`) et un seul accent de couleur au lieu de trois.
9. HUD de course en charte 6 (zone interface).
