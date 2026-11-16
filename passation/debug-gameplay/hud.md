# DEBUG HUD — chevauchements, coupes, débordements du HUD de course (10/11/2026)

Sacha : « insiste vraiment sur le HUD, y a plein de problèmes de superposition et tout, genre quand la dark triad apparaît ».
Suite de `passation/CHASSE-HUD.md` (le chrono de DARK TRIAD sous la plaque, corrigé le matin dans `hudColMesure`).

## Le banc : `outils/banc-hud/chevauche.cjs` + `outils/banc-hud/mesure-hud.js`

    node outils/banc-hud/chevauche.cjs --out DIR [--gab 13p,13p-c,se,se-c,max,max-c,393] [--lang fr,en] [--etats a,b] [--prof /chemin]

- Un seul Chrome sans fenêtre (ports 9771/9772), le vrai jeu en `?tel=1&app=1&garde=1&intro=ancien`, son coupé dans la sauvegarde avant le chargement,
  banque à 1 234 567 €, langue par `localStorage.ccLang`, pilote de mesure `dbgAuto(true,0,{vol:true})`. Une course neuve par langue × gabarit, et une
  nouvelle quand la caisse meurt en route.
- MARGES SÛRES SIMULÉES : `--ccT/B/L/R` posés en ligne sur `<html>` (le jeu les lit partout à la place de `env(safe-area-inset-*)`, cf. `html.telCadre`) :
  debout 59 en haut / 34 en bas ; couché 59 à gauche et à droite / 21 en bas. ⚠ Sur 667 × 375 / 375 × 667 (SE, 6, 7, 8) c'est PLUS que le vrai :
  ces iPhone n'ont pas d'encoche (0 de côté couché, 20 en haut debout). Un défaut qui n'existe QUE là est noté « artefact SE ».
- 22 ÉTATS forcés par les crochets : départ · course · flow 50/80/100 · ENTRÉE en frénésie (0, 100, 250, 500, 1000, 1800 ms, animations CSS gelées le temps
  de la mesure et de la photo) · frénésie + chrono (1 234 567 €) · + vol · + AIR MAX · + NITRO MAX · + chaîne et record · + verdict et palier de vitesse ·
  ×10 · sortie de frénésie · pouvoirs · mission gagnée · portail · pause · reprise 3-2-1 · LE PIRE (tout en même temps) · le pire en vol · seconde chance.
  La frénésie est TENUE (sans style les trois traits se vident en ~2 s : un minuteur les nourrit tant qu'on la photographie).
- La MESURE (`window.__hudMesure`) : un bloc = un élément `position:fixed` visible (ou un enfant de #hud posé en absolu) ; son ENCRE = les lignes de
  texte (Range.getClientRects), les fonds, les bords, les canvas/img/svg, la boîte entière des touches ⏸ et NITRO — jamais une boîte vide. Rend :
  (a) les paires dont l'encre se recouvre de plus de 4 px² (hors parent/enfant) ; (b) ce qui sort de l'écran ; (c) ce qui entre dans l'encoche /
  l'indicateur d'accueil ; (d) le texte coupé (scrollWidth > clientWidth, ellipse) ; (e) une police autre que Press Start 2P.
  NON COMPTÉS, avec la raison : les étincelles `.pxBurst` (décor de 0,3 s) ; `canvas.nx3Ecl` (l'éclat transparent de la boule de feu) ; les calques
  plein écran sans texte ; un bloc ESTOMPÉ exprès (opacité effective, `filter:opacity()` compris, < 0,2 : les pouvoirs sous une grande annonce,
  le fil sous une ligne de mission — décision de Sacha du 05/11) ; le nom d'une figure dans la police de sa rareté (#fh/#fhLeg [data-rp], exception
  nommée par Sacha le 18/10).
- Résumé d'un relevé : les lignes PAIRE / ZONE / HORS / COUPE / POLICE par état (script de lecture dans le scratchpad, rien à installer).

## Inventaire des blocs de course (téléphone, debout 390 × 844 ; z-index ; qui les place)

| Bloc | Où | z | Qui le place |
|---|---|---|---|
| `#nitroWrap` (jauge NITRO + vitesse KM/H) | haut gauche → avant le ⏸ | auto | `socle-2-menu.css` l.334 (top ccT+18) |
| `#flowHud` (barre de flow, zone rouge, « €×3 ») | sous la nitro | 6 | `socle-4-aura.css` l.395 (top hudH+52) |
| `#tGear` ⏸ | haut droite | 8 | `hud-da.css` l.512 |
| `#auraV2` (AURA, `#avPlus` « +N », `#avCh` chaîne ×N + barre, `#avRec`, `#avList`) | gauche sous les barres | 6 | `socle-4-aura.css` l.3, zoom `--hudK` (`hud-da.css` hudTaille) |
| `#cashHud` (€ de la partie) | colonne de droite, 1er | 6 | `hud-da.css` l.268 puis `hudColMesure` |
| `#triade` (DARK TRIAD) + `#frenChrono` + `#frenTraits` | debout : colonne de droite, 2e ; couché : en haut, à droite des barres | 6 | `charte-5-frenesie.css` l.116, `hud-da.css` l.291/295/337, `hudColMesure` (`passe-textes.js`) |
| `#airHud` (chrono de vol, AIR MAX) | colonne de droite | — | `hud-fini.css` l.27, `hudColMesure` |
| `#pwrChip` (plaques NITRO MAX, AIR MAX, VITESSE ×2, AIMANT, AURA ×2) | colonne de droite | 6 | `hud-fini.css` l.28, `hud-da.css` l.515-520, `hudColMesure` |
| `#campChip` (objectif) | colonne de droite | — | `hudColMesure` |
| `#frenTitre` « TRIPLE MONSTER » | centre du couloir (`--laneA`) | 42 | `hud-maitrise.css` l.192 ; pendant `body.ftOn` il tait #slam9, #verdHud, #lvlBan, le chrono et les traits |
| `#slam9` (grande annonce : RECORD BATTU, CHAÎNE PERDUE…) | centre | 41 | `socle-4-aura.css` / `hud-maitrise.css` |
| `#engBig` (carte MOTEUR / record, suit la caisse) | sur la caisse | 40 | `socle-4-aura.css` l.323 |
| `#lvlBan` (NIVEAU, NOUVEAU SECTEUR) | centre | 7 | `socle-3-hud.css` |
| `#fil` (la ligne qui dit tout : gestes, paliers, « +21 KM/H ») | bas centre | 6 | `fil.css`, `fil.js` |
| `#m2Ligne` (MISSION RÉUSSIE, PEINTURE GAGNÉE) | bas gauche (debout), bas centre (couché) | 8 | `missions.css` l.229-243 ; le fil s'estompe dessous (`body.m2Lon`) |
| `#toast` | haut centre (ccT+72) | 270 | `charte-2-ecrans.css` l.291, `politesses.css` l.16 |
| `#touchCtl` (boule de feu NITRO `#tNitro`, volant/joystick) | bas | 4 | `hud-da.css` l.522, `charte-7-details.css` |
| `#fh` / `#fhLeg` (figures en vol, rappel des gestes) | bas | — | `figures.css` |
| `#tPanel` (pause), `#overlay` (mort, seconde chance `#mChance`) | plein écran | 9 / 5 | écrans |

## Défauts (mesurés au banc ; « avant » = relevé ch2 du 10/11 17 h 50, « après » = relevé ch4 de 18 h 15, mêmes états)

Les correctifs sont tous dans `code/css/hud-fini.css` (sections 9 à 18, la dernière feuille du HUD) sauf mention ; commentaires `(2026-11-10, debug HUD H-xx)`.

| id | état · gabarit | blocs | avant | correctif | après |
|---|---|---|---|---|---|
| H-01 | un toast en course (« JETON SPIN ×1 ») · debout | `#toast` (haut, centre, 88 vw) sur `#auraV2` et `#cashHud` | 1 480 + 664 px² (13p) | `code/interface/icones-fenetre.js` `toast()` : en course sur téléphone (`body.touch.play`), le texte passe par le FIL (niveau 2) ; menus, garage, ordinateur : inchangés | vérifié au pilote (jeton réel posé par `dbgJeton(8)` et ramassé) : « JETON SPIN ×1 » s'écrit dans le fil, `#toast` ne s'allume plus. ⚠ Le fil le garde 650 ms avant qu'un autre événement (« BICYLINDRE ») le remplace : le message est plus bref qu'avant |
| H-02 | plaque VITESSE ×2 · debout | `#pwrChip .pw span` : « VITESSE ×: » coupé | 110 > 103 px (393, 13p) | §9 : l'étiquette perd son espace entre les lettres (10 signes × 10 px = 100) | plus de COUPE |
| H-03 | **ENTRÉE EN FRÉNÉSIE** (le titre TRIPLE MONSTER) · debout, tous gabarits | `#frenTitre` sur `#pwrChip` (NITRO MAX, AIR MAX, VITESSE ×2 : la colonne de droite passe sous MONSTER) | 9 724 (13p) · 8 960 (SE) · 13 620 (Pro Max) · 12 556 (393) px² | §10 : `body.ftOn` efface les plaques (.08, glissées de 16 px) comme le fait déjà la grande annonce (« UNE voix au centre », charte-6 (j)) ; `!important` contre la plaque « discrète » (.45 !important) | 0 sur 13p / 393 / Pro Max hors les 200 premières ms (le fondu de .2 s) |
| H-04 | frénésie + record battu · couché | `#engBig` (carte RECORD BATTU · AURA, sur la caisse) dans MONSTER | 8 576 px² (844 × 390) | §11 : `body.ftOn` tait la carte, comme la grande annonce, le verdict et la bannière de niveau | 0 |
| H-05 | seconde chance / écran de mort · tous | `#slam9` (« CHAÎNE PERDUE −N AURA ») sur la carte AURA et l'offre | 2 744 à 4 544 px² | §12 : `body.dead` le masque (comme l'emblème et l'argent) | 0 |
| H-06 | gros nombres (aura 5 chiffres, argent 7) · debout 393 / 430 | `#avPlus` (« +17 217 » à droite du compteur d'aura) dans `#cashHud` | 176 px² (393), visible sur la photo | `code/gameplay/pose-verdict.js` `avPlusCourt` : « +17 k » au-delà de 10 000 (téléphone seulement) ; §14 : le temps du « +N » (1,4 s), il prend la place du mot AURA (classe `.plus`) | reste 16-88 px² de boîtes de ligne (3 px de haut) avec un « +9 891 » < 10 000 sur une prise gelée : voir « ouvert » |
| H-07 | frénésie · debout | les trois traits sous l'emblème touchaient la plaque suivante | 124-204 px² (1 px) | `code/interface/passe-textes.js` `hudColMesure` : la colonne compte le plus bas du chrono ET des traits | 0 |
| H-08 | grande annonce + plaque présente depuis > 3 s · debout | `#slam9` sur une plaque `#pwrChip.discret` restée à .45 | lu sur photo | §13 : la plaque discrète s'efface aussi (.08 !important) sous slamOn / verdOn / ebOn | voir « ouvert » (un RECORD BATTU sans slamOn sur une prise) |
| H-09 | fil long (« SÉRIE COMPLÈTE ×18 ») · debout | `#fil` (bas centre) touche la boule de feu `#tNitro` | 140-216 px² (13p) | §16 : debout, le fil se centre dans la place à gauche de la touche NITRO | 0 (ch4, ch5 : plus aucune paire #fil × #tNitro debout) |
| H-10 | portail / niveau avec 4 plaques · debout | `#lvlBan` (« CRYPTO CITY — ORAGE ») sur la 4e plaque | 864 px² (13p) | §15 : avec des plaques (`body.hPwr`), la bannière se range à gauche de la colonne (même règle que l'astuce, hudDA §6) | 0 debout (ch5) |
| H-11 | **ENTRÉE EN FRÉNÉSIE** (l'emblème qui se pose) · debout | `#triade` (claquement ×1,2 autour de son centre) mord sur `#cashHud` | 784 px² à 250 ms (13p) | §17 : debout, l'emblème grossit depuis son bord haut (le surplus tombe dans la place gardée du chrono) | 0 à 0/100/250/500/1000/1800 ms (13p, 393, Pro Max, ch5) |
| H-12 | 4 pouvoirs, ou 3 + vol · couché | `#pwrChip` (4e plaque AURA ×2) sur la boule de feu `#tNitro` | 2 652 px² (844 × 390), 2 340 (667 × 375) | `hudColMesure` borne la hauteur de la colonne jusqu'au haut de la touche NITRO (jamais moins que la moitié des plaques : 2 colonnes au plus) ; §18 : ce qui ne tient pas passe dans une 2e colonne à gauche, rangée EN BAS (`wrap-reverse` + `justify-content:flex-end`). 1er essai (2e colonne en haut) : elle tombait sur DARK TRIAD (300 px²) et la bannière de niveau (1 176 px²) — corrigé dans la foulée | voir le relevé ch6 ci-dessous |
| H-13 | **ROTATION pendant une frénésie** (debout → couché) · 13p, Pro Max | `#triade` reste au milieu de l'écran couché (y 145 au lieu de 51) : le `top` en ligne !important écrit debout par `hudColMesure` l'emportait sur la place « couché » de la feuille | photo | `hudColMesure` : couché, il efface le `top` en ligne de l'emblème | y 51-95 (en haut au milieu), relevé `rot` en-13p / en-max |
| H-14 | **LE POUCE SUR NITRO** (joystick de main, v1427) · debout et couché | les repères des figures (`#tJoy .tjRep`) : celui du BAS dans l'indicateur d'accueil (y 797-821 en 390 × 844, 355-379 en 844 × 390), celui de DROITE dans l'encoche couchée (jusqu'à x 833) et SUR les plaques NITRO MAX / AIR MAX (1 584 + 1 392 px²) | voir colonne | `code/gameplay/figures-joystick.js` `tjPlace` : le rangement des repères lit les marges sûres du jeu (sonde `tjMarges`, `--ccX` sinon `env()`) et prend l'argent, les plaques, le chrono de vol et l'objectif comme obstacles (comme NITRO) | relevé po3 ci-dessous |
| H-15 | **l'ARGENT 28 px de Léo** (v1429) · debout, tous | `#cashHud` (s'étend jusqu'à 34 % de l'écran) SUR le nombre d'aura, même ligne | 352 à 1 424 px² (13p, 393, Pro Max, SE ; relevé A-avant) | `code/interface/passe-textes.js` `cashX0` + `hudColMesure` : debout, l'argent s'arrête 64 px après le nombre d'aura (place du mot AURA ou du « +N ») ; relevé à 10 Hz après la mise en page, l'argent se remesure (soldeFit) quand ce bord bouge — il garde ses 28 px tant qu'il y a la place | V5 / V3 / V4 : 0 (13p, 393, Pro Max, FR et EN) |
| H-16 | l'argent 28 px · couché | `#cashHud` sur DARK TRIAD (en haut au milieu, à droite des barres) | 1 456 px² (844 × 390, 932 × 430) | même endroit : couché, il s'arrête après la PLACE de l'emblème (marge + 14 + barres + 18 + 86 px), affiché ou non (sa taille ne saute pas en frénésie) ; re-mesuré : marge portée à 98 px (le « € » dépassait de 2 px) | V3 : 0 en 844 × 390 et 932 × 430 ; rotation R2 propre |
| H-17 | pouce · couché avec plaques de pouvoir, en vol | les repères retombaient SUR NITRO (144 + 912 px²) et dans l'encoche : la colonne ne laissait aucun rangement, le repli « au plus près » ignorait tout | 13p-c | `tjPlace` : sans rangement possible, on recommence sans la colonne (au pire un repère touche une plaque, jamais NITRO) ; le repli respecte la zone sûre | V1 : plus aucun repère sur NITRO ni dans l'encoche ; reste le compromis colonne (voir ouvert) |
| H-18 | pouce · debout et couché | les repères sur le FIL (« BOOST », « TONNEAU +45 »), sur « MISSION RÉUSSIE », sur la bannière de niveau (667 de haut), couché sur ⏸ et DARK TRIAD | 13p, 393, Pro Max, SE, se-c (relevé C-avant) | `tjPlace` : obstacles en plus — ⏸, emblème, fil, ligne de mission, bannière (ces trois-là gardent leur place même éteints) | V1 / V5 : 0 debout |
| H-19 | en vol, les deux pouces · debout 390 / 430 | le repère de GAUCHE de NITRO sur le volant et son anneau de vol (Léo) | 816 px² (relevé A2) | `tjPlace` : le volant affiché est un obstacle, agrandi de 32 px en vol (l'anneau déborde du bouton) | relevé C2 : 312 px² restants entre la pointe du repère et le bout du volant (voir ouvert) → suite : la place du volant compte d'office en vol (il se montre après le rangement) | V5 : 0 |
| H-20 | **main gauche** (`body.gaucher`) · debout | `#m2Ligne` (en bas à gauche) sur la boule de feu et le socle (NITRO passe à gauche) | relevé D2 | `hud-fini.css` §19 : main gauche debout, la ligne de mission va en bas à droite | V2 : 0 debout |
| H-21 | main gauche · debout | `#fil` (H-09 : centré à gauche de NITRO) sur NITRO | relevé D2 | `hud-fini.css` §20 : main gauche debout, le fil se centre à droite de NITRO | V2 : 0 debout |
| H-22 | main gauche · couché | le repère du HAUT sur le compteur d'aura (en haut à gauche) | relevé D2 | `tjPlace` : `#auraV2` puis (re-mesuré) les barres NITRO et flow sont des obstacles | V6 : 0 en frénésie / vol / titre ; au sol un repère frôle encore l'aura (compromis) |

Photos avant (`passation/debug-gameplay/hud/`) : `H01-avant-13p.png` (le toast sur l'aura et l'argent), `H02-avant-393.png`, `H03-avant-13p.png`
(TRIPLE MONSTER sur NITRO MAX · AIR MAX · VITESSE ×2), `H04-avant-13p-couche.png` (RECORD BATTU dans le titre), `H05-avant-13p-couche.png`
(CHAÎNE PERDUE sur l'écran de mort), `H06-avant-393.png` (« +17 217 » dans « € 1 240 306 »), `H09-avant-13p.png`, `H10-avant-13p-detail.png`,
`entree-dark-triad-0ms-13p.png` (l'instant où l'emblème apparaît), `H13-avant-rotation-13p-couche.png` / `H13-apres-rotation-13p-couche.png`.
Photos de la seconde passe : `H14-apres-13p.png`, `H15-apres-13p.png`, `H16-apres-13p-couche.png`, `H18-apres-13p.png` (après) ; `H14-avant-13p.png`, `H14-avant-13p-couche.png` (TAIL WHIP sur AIR MAX), `H15-avant-13p.png` (« € 1 235 520 » sur « 471 AURA »), `H16-avant-13p-couche.png` (l'argent sur DARK TRIAD), `H17-avant-13p-couche.png`, `H18-avant-13p.png` (SALTO AVANT sur le fil « BOOST »).
Photos après : `H03-apres-13p.png` (TRIPLE MONSTER, les plaques effacées dessous),
`H04-apres-13p-couche.png`, `H05-apres-13p-couche.png` (écran de mort sans l'annonce), `H06-apres-393.png`, `H09-apres-13p.png`,
`H11-apres-entree-250ms-13p.png` (l'emblème posé sous l'argent), `H12-apres-13p-couche.png`. Toutes à ½ résolution puis ≤ 600 px.

## SECONDE PASSE (10/11 au soir → 11/11) : le joystick NITRO de main (v1427), puis le HUD de Léo (v1429)

État à la reprise (11/11, 4 h 15, après une coupure réseau) :
- Les 13 correctifs H-01 à H-13 sont dans le code après les deux fusions de main (vérifié : « debug HUD H- » dans hud-fini.css, passe-textes.js,
  icones-fenetre.js, pose-verdict.js). La fusion v1429 (Léo : argent 28 px, chrono de vol en anneau autour du pouce, `HUDV`) a été résolue par le
  coordinateur dans `hudColMesure` : le chrono de vol sort de la colonne quand `HUDV==='d'` et que le volant a servi, H-13 est gardé — relu, c'est juste
  (le `top` en ligne restant sur #airHud ne gêne pas : il est `display:none!important` dans ce cas, hud-refonte.css l.16).
- Banc : `--pouce 1` (le pouce posé sur NITRO, poussé au bout dans les 4 directions, au repos, pendant une frénésie à 4 plaques, pendant TRIPLE MONSTER,
  en vol, et en vol avec les DEUX pouces : volant tenu + NITRO) ; `--gaucher 1` (commandes inversées) ; la mesure compte l'anneau de vol (`.skAir`, sa
  boîte entière) ; le volant est touché une fois au départ de chaque course (`#tSteer.used`, sans quoi l'anneau n'existe pas).
- Mesuré AVANT la fusion v1429 (relevé po1, 13p et 13p-c, FR) : **H-14** — voir le tableau. Le banc pouce de 10/11 au soir n'a pas pu se relancer
  (verrou tenu par le banc des gabarits jusqu'à la coupure) : tout est re-mesuré ci-dessous sur l'état v1430.

## Matrices de la SECONDE PASSE (11/11, 4 h 50 → 6 h 15, état v1430 + H-14 à H-22)

Mêmes conventions que plus bas. Séries : A2 (FR, 7 gabarits, 22 états) et B2 (EN) — mesurées après H-15 à H-18 ; C2 / D2 (le pouce, FR, et main
gauche FR + EN) ; R2 (rotation) ; puis les re-mesures après H-15 suite, H-19, H-20 à H-22 : V1 (pouce), V2 (pouce main gauche), V3 / V5 (FR, 22 états),
V4 (EN), V6 (pouce main gauche couché). Les blocs `b.tjRep` = les repères du pouce, `i.tjPion` = le pion, `touchCtl` = NITRO et le volant (avec l'anneau).

**État final, debout, FR (V5, 6 h 07)** — propre partout sauf l'artefact connu du banc (« RECORD BATTU » gelé au-delà de sa minuterie) :

| état | fr 13p | fr 393 |
|---|---|---|
| depart | · | · |
| course | · | · |
| flow50 | · | · |
| flow80 | · | · |
| flow100 | · | · |
| entree | · | · |
| fren-chrono | · | · |
| fren-vol | · | · |
| fren-airmax | · | · |
| fren-nitromax | · | · |
| fren-chaine | · | · |
| fren-annonce | · | · |
| fren-x10 | · | · |
| fren-sortie | · | · |
| entree-vol | · | · |
| pouvoirs | · | · |
| mission | · | · |
| portail | · | · |
| pause | · | · |
| reprise | · | · |
| pire | pwrChip×slam9 | · |
| pire-vol | pwrChip×slam9 | · |
| chance | · | · |

**État final, couché + debout, FR (V3, 5 h 42, avant H-19 suite)** :

| état | fr 13p | fr 13p-c | fr max-c |
|---|---|---|---|
| depart | · | · | · |
| course | · | · | · |
| flow50 | · | · | · |
| flow80 | · | · | · |
| flow100 | · | · | · |
| entree | · | nitroWrap×triade | frenTitre×triade, fil×m2Ligne |
| fren-chrono | · | · | · |
| fren-vol | touchCtl×b.tjRep | · | zone touchCtl |
| fren-airmax | · | · | · |
| fren-nitromax | · | · | · |
| fren-chaine | · | · | · |
| fren-annonce | · | · | · |
| fren-x10 | · | · | · |
| fren-sortie | · | · | · |
| entree-vol | touchCtl×b.tjRep | zone touchCtl | zone touchCtl |
| pouvoirs | · | pwrChip×triade | · |
| mission | · | pwrChip×triade | · |
| portail | · | pwrChip×triade, lvlBan×pwrChip | · |
| pause | · | · | · |
| reprise | · | · | · |
| pire | coupe m2Ligne | pwrChip×slam9 | · |
| pire-vol | m2Ligne×touchCtl, coupe m2Ligne | pwrChip×slam9 | · |
| chance | · | · | · |

**État final, EN (V4, 5 h 46)** :

| état | en 13p | en 393 | en max |
|---|---|---|---|
| depart | · | · | · |
| course | · | · | · |
| flow50 | · | · | · |
| flow80 | · | · | · |
| flow100 | · | · | · |
| entree | · | · | cashHud×triade |
| fren-chrono | · | · | · |
| fren-vol | touchCtl×b.tjRep | · | · |
| fren-airmax | · | · | · |
| fren-nitromax | · | · | · |
| fren-chaine | · | · | · |
| fren-annonce | · | · | · |
| fren-x10 | · | · | · |
| fren-sortie | · | · | · |
| entree-vol | touchCtl×b.tjRep | touchCtl×b.tjRep | · |
| pouvoirs | · | · | · |
| mission | · | · | · |
| portail | · | · | · |
| pause | · | · | · |
| reprise | · | · | · |
| pire | · | pwrChip×slam9 | engBig×slam9 |
| pire-vol | touchCtl×b.tjRep | touchCtl×b.tjRep, pwrChip×slam9 | · |
| chance | · | · | · |

**Le pouce, FR (V1, 5 h 37, avant H-19 suite / H-22 suite)** :

| état | fr 13p | fr 13p-c | fr max-c |
|---|---|---|---|
| p-course-repos | · | · | · |
| p-course-u | · | · | · |
| p-course-r | · | zone i.tjPion | zone i.tjPion |
| p-course-d | · | · | zone pwrChip |
| p-course-l | · | · | · |
| p-fren4-repos | · | pwrChip×triade, pwrChip×b.tjRep | pwrChip×b.tjRep |
| p-fren4-u | · | pwrChip×triade, pwrChip×b.tjRep.vise, pwrChip×b.tjRep | pwrChip×b.tjRep.vise, pwrChip×b.tjRep |
| p-fren4-r | · | pwrChip×triade, pwrChip×b.tjRep, pwrChip×b.tjRep.vise, zone i.tjPion | pwrChip×b.tjRep, pwrChip×b.tjRep.vise, zone i.tjPion |
| p-fren4-d | · | · | pwrChip×b.tjRep |
| p-fren4-l | · | pwrChip×triade, pwrChip×b.tjRep | pwrChip×b.tjRep |
| p-titre-u | · | pwrChip×b.tjRep.vise, pwrChip×b.tjRep | · |
| p-titre-r | · | pwrChip×b.tjRep, pwrChip×b.tjRep.vise, zone i.tjPion | zone i.tjPion |
| p-titre-l | · | pwrChip×b.tjRep | · |
| p-titre-d | · | pwrChip×b.tjRep | · |
| p-vol-leve | touchCtl×b.tjRep | pwrChip×b.tjRep.vide, pwrChip×b.tjRep, zone touchCtl | zone touchCtl |
| p-vol-repos | · | · | zone touchCtl |
| p-vol-u | · | pwrChip×b.tjRep.vise, pwrChip×b.tjRep | zone touchCtl |
| p-vol-r | · | pwrChip×b.tjRep, pwrChip×b.tjRep.vise, zone i.tjPion | zone i.tjPion |
| p-vol-d | m2Ligne×b.tjRep.vise | pwrChip×b.tjRep | · |
| p-vol-l | fil×b.tjRep | slam9×b.tjRep | · |
| p-vol-volant | touchCtl×b.tjRep | pwrChip×b.tjRep.vide, pwrChip×b.tjRep, zone touchCtl | zone touchCtl |
| p-vol-volant-nitro | m2Ligne×b.tjRep, touchCtl×b.tjRep | pwrChip×b.tjRep, zone touchCtl | zone touchCtl |
| p-vol-volant-u | m2Ligne×touchCtl, m2Ligne×b.tjRep, touchCtl×b.tjRep, coupe m2Ligne | pwrChip×triade, pwrChip×b.tjRep.vise, pwrChip×b.tjRep, zone touchCtl | zone touchCtl |
| p-vol-volant-l | m2Ligne×touchCtl, m2Ligne×b.tjRep, touchCtl×b.tjRep.vise, coupe m2Ligne | pwrChip×b.tjRep, zone touchCtl | zone touchCtl |

**Le pouce, main gauche, couché (V6, 6 h 10, état final)** :

| état | fr 13p-c |
|---|---|
| p-course-repos | · |
| p-course-u | · |
| p-course-r | auraV2×b.tjRep |
| p-course-d | auraV2×b.tjRep |
| p-course-l | auraV2×b.tjRep.vise, zone i.tjPion |
| p-fren4-repos | · |
| p-fren4-u | pwrChip×triade |
| p-fren4-r | pwrChip×triade |
| p-fren4-d | pwrChip×triade |
| p-fren4-l | zone i.tjPion |
| p-titre-u | · |
| p-titre-r | · |
| p-titre-l | zone i.tjPion |
| p-titre-d | · |
| p-vol-leve | · |
| p-vol-repos | · |
| p-vol-u | · |
| p-vol-r | · |
| p-vol-d | · |
| p-vol-l | zone i.tjPion |
| p-vol-volant | · |
| p-vol-volant-nitro | · |
| p-vol-volant-u | · |
| p-vol-volant-l | · |

**Le pouce, main gauche, FR et EN (D2, 5 h 05, AVANT H-20/21/22)** :

| état | fr 13p | fr 13p-c | en 13p | en 13p-c |
|---|---|---|---|---|
| p-course-repos | m2Ligne×touchCtl, m2Ligne×i.tjSocle | · | m2Ligne×touchCtl, m2Ligne×i.tjSocle | · |
| p-course-u | m2Ligne×touchCtl, m2Ligne×i.tjSocle | · | m2Ligne×touchCtl, m2Ligne×i.tjSocle | · |
| p-course-r | m2Ligne×touchCtl, m2Ligne×i.tjSocle | slam9×b.tjRep | m2Ligne×touchCtl, m2Ligne×i.tjSocle | · |
| p-course-d | fil×touchCtl, fil×i.tjPion | · | fil×touchCtl, fil×i.tjPion | · |
| p-course-l | · | zone i.tjPion | · | zone i.tjPion |
| p-fren4-repos | fil×touchCtl | auraV2×b.tjRep, pwrChip×triade | · | pwrChip×triade |
| p-fren4-u | · | auraV2×b.tjRep, pwrChip×triade | fil×touchCtl | pwrChip×triade |
| p-fren4-r | fil×touchCtl | auraV2×b.tjRep, pwrChip×triade | fil×touchCtl | pwrChip×triade |
| p-fren4-d | fil×touchCtl, fil×i.tjPion | auraV2×b.tjRep, pwrChip×triade | · | pwrChip×triade |
| p-fren4-l | fil×touchCtl | auraV2×b.tjRep.vise, zone i.tjPion | fil×touchCtl | pwrChip×triade, zone i.tjPion |
| p-titre-u | fil×touchCtl | auraV2×b.tjRep | · | · |
| p-titre-r | · | auraV2×b.tjRep | fil×touchCtl | · |
| p-titre-l | fil×touchCtl | auraV2×b.tjRep.vise, zone i.tjPion | fil×touchCtl | zone i.tjPion |
| p-titre-d | fil×touchCtl, fil×i.tjPion | auraV2×b.tjRep | fil×touchCtl, fil×i.tjPion | · |
| p-vol-leve | · | · | fil×touchCtl | · |
| p-vol-repos | fil×touchCtl | auraV2×b.tjRep | · | · |
| p-vol-u | · | auraV2×b.tjRep | fil×touchCtl | · |
| p-vol-r | fil×touchCtl | auraV2×b.tjRep | fil×touchCtl | · |
| p-vol-d | m2Ligne×touchCtl, m2Ligne×i.tjSocle, m2Ligne×i.tjPion | auraV2×b.tjRep | m2Ligne×touchCtl, m2Ligne×i.tjSocle, m2Ligne×i.tjPion | · |
| p-vol-l | fil×touchCtl | engBig×triade, zone i.tjPion | · | zone i.tjPion |
| p-vol-volant | · | · | · | · |
| p-vol-volant-nitro | fil×touchCtl | · | fil×touchCtl | · |
| p-vol-volant-u | · | · | · | · |
| p-vol-volant-l | · | · | m2Ligne×touchCtl, m2Ligne×i.tjSocle, m2Ligne×b.tjRep.vide | fil×m2Ligne |

**Rotation (R2, 5 h 17)** : FR et EN, 13 Pro et Pro Max — rien hors de place ; l'argent se remesure en tournant (débout 616-771, couché 629-771, à droite
de DARK TRIAD 513-591). Seule ZONE : les mots MONTER / PLONGER du volant sous le pouce couché (dans l'indicateur d'accueil quand le pouce est au bas
de l'écran — ils suivent le doigt).

| état | fr 13p | fr max | en 13p | en max |
|---|---|---|---|---|
| rot-fren-debout | · | · | · | · |
| rot-fren-couche | · | · | · | · |
| rot-fren-debout2 | · | · | · | · |
| rot-pause-debout | · | · | · | · |
| rot-pause-couche | · | · | · | · |
| rot-pause-debout2 | · | · | · | · |
| rot-pouce-debout | · | · | · | · |
| rot-pouce-couche | zone touchCtl | zone touchCtl | zone touchCtl | zone touchCtl |
| rot-pouce-debout2 | · | · | · | · |

**Matrices complètes intermédiaires** (A2 FR / B2 EN, 7 gabarits, après H-15 à H-18 — les cases `auraV2×cashHud` restantes en anglais sont le « +N » à 4 px
près, corrigé ensuite par H-15 suite et vérifié par V4) :

| état | fr 13p | fr 393 | fr max | fr se | fr 13p-c | fr max-c | fr se-c |
|---|---|---|---|---|---|---|---|
| depart | · | · | · | · | · | · | · |
| course | · | · | · | · | · | · | · |
| flow50 | · | · | · | · | · | · | · |
| flow80 | · | · | · | · | · | · | · |
| flow100 | · | · | · | · | · | · | · |
| entree | · | · | · | frenTitre×touchCtl | nitroWrap×triade | frenTitre×triade | m2Ligne×touchCtl, nitroWrap×triade, fil×m2Ligne |
| fren-chrono | · | · | · | · | · | · | cashHud×triade |
| fren-vol | touchCtl×b.tjRep | · | touchCtl×b.tjRep | touchCtl×b.tjRep | · | zone touchCtl | cashHud×triade |
| fren-airmax | · | · | · | touchCtl×b.tjRep | · | zone touchCtl | cashHud×triade, pwrChip×triade |
| fren-nitromax | · | · | · | · | cashHud×triade | pwrChip×b.tjRep.vide, pwrChip×b.tjRep, zone touchCtl | cashHud×triade, pwrChip×triade |
| fren-chaine | · | · | · | · | cashHud×triade | · | cashHud×triade |
| fren-annonce | · | · | · | · | · | · | cashHud×triade, pwrChip×triade |
| fren-x10 | · | · | · | · | · | · | cashHud×triade |
| fren-sortie | · | · | · | auraV2×cashHud | · | zone pwrChip | cashHud×triade, pwrChip×triade |
| entree-vol | touchCtl×b.tjRep | · | touchCtl×b.tjRep | touchCtl×b.tjRep | nitroWrap×triade, flowHud×triade, frenTitre×triade, zone touchCtl | zone touchCtl | cashHud×triade, pwrChip×triade, pwrChip×b.tjRep.vide, pwrChip×b.tjRep, zone touchCtl |
| pouvoirs | · | · | · | · | · | · | cashHud×triade, pwrChip×triade |
| mission | · | · | · | · | cashHud×triade, pwrChip×triade | · | cashHud×triade, pwrChip×triade, m2Ligne×touchCtl |
| portail | · | · | · | · | cashHud×triade, pwrChip×triade, lvlBan×pwrChip | · | cashHud×triade, pwrChip×triade, lvlBan×pwrChip |
| pause | · | · | · | · | · | · | · |
| reprise | coupe m2Ligne | · | · | · | · | · | cashHud×triade |
| pire | coupe m2Ligne | · | · | · | pwrChip×slam9 | · | cashHud×triade, engBig×triade, pwrChip×triade, pwrChip×slam9, engBig×pwrChip, engBig×slam9 |
| pire-vol | touchCtl×b.tjRep | touchCtl×b.tjRep | touchCtl×b.tjRep | · | cashHud×triade, pwrChip×slam9 | pwrChip×b.tjRep.vide, pwrChip×b.tjRep, zone touchCtl | cashHud×triade, pwrChip×triade, pwrChip×slam9, pwrChip×b.tjRep.vide, pwrChip×b.tjRep, zone touchCtl |
| chance | · | · | · | · | · | · | · |

| état | en 13p | en 393 | en max | en se | en 13p-c | en max-c | en se-c |
|---|---|---|---|---|---|---|---|
| depart | · | · | · | · | · | · | · |
| course | · | · | · | · | · | · | · |
| flow50 | · | · | · | · | · | · | · |
| flow80 | · | · | · | · | · | · | · |
| flow100 | · | · | · | · | · | · | · |
| entree | · | cashHud×triade | cashHud×triade | frenTitre×touchCtl | nitroWrap×triade, flowHud×triade, frenTitre×triade | frenTitre×triade | · |
| fren-chrono | · | · | · | · | · | · | cashHud×triade |
| fren-vol | · | · | · | touchCtl×b.tjRep | zone touchCtl | · | cashHud×triade, zone touchCtl |
| fren-airmax | · | · | · | · | · | · | cashHud×triade |
| fren-nitromax | · | · | · | · | · | · | cashHud×triade, pwrChip×triade |
| fren-chaine | · | · | · | · | · | · | cashHud×triade, pwrChip×triade |
| fren-annonce | · | · | · | · | · | · | cashHud×triade, pwrChip×triade |
| fren-x10 | · | · | · | · | · | · | cashHud×triade, pwrChip×triade |
| fren-sortie | · | auraV2×cashHud | · | · | · | · | cashHud×triade, pwrChip×triade |
| entree-vol | auraV2×cashHud | touchCtl×b.tjRep | · | touchCtl×b.tjRep | zone touchCtl | zone touchCtl | cashHud×triade, pwrChip×triade, zone touchCtl, auraV2×slam9, pwrChip×slam9 |
| pouvoirs | auraV2×cashHud | · | · | · | pwrChip×triade | · | cashHud×triade, pwrChip×triade |
| mission | · | · | · | · | pwrChip×triade | · | cashHud×triade, pwrChip×triade, m2Ligne×touchCtl |
| portail | · | · | · | · | pwrChip×triade, lvlBan×pwrChip | · | cashHud×triade, pwrChip×triade, lvlBan×pwrChip, m2Ligne×touchCtl |
| pause | · | · | · | · | · | · | · |
| reprise | · | · | · | · | · | · | cashHud×triade, pwrChip×triade, pwrChip×slam9 |
| pire | auraV2×cashHud | pwrChip×slam9 | auraV2×cashHud | pwrChip×touchCtl, pwrChip×slam9, auraV2×cashHud | pwrChip×triade, engBig×pwrChip, pwrChip×slam9 | · | cashHud×triade, pwrChip×triade, pwrChip×slam9, engBig×slam9 |
| pire-vol | · | touchCtl×b.tjRep | · | · | pwrChip×triade, pwrChip×b.tjRep.vide, pwrChip×b.tjRep, zone touchCtl | · | cashHud×triade, pwrChip×triade, pwrChip×slam9, pwrChip×b.tjRep.vide, pwrChip×b.tjRep, zone touchCtl |
| chance | · | · | · | · | · | · | · |

### Reste ouvert après la seconde passe
- **Couché, NITRO + 4 plaques + emblème** (844 × 390, 932 × 430) : la place manque ; quand aucun rangement des 4 repères n'évite la colonne de droite,
  ils la touchent (H-17 : plutôt la colonne que NITRO ou l'encoche). Idem main gauche couchée : un repère frôle alors le compteur d'aura (V6, sol).
  La 2e colonne de plaques (H-12) touche les traits de l'emblème. Une plaque plus basse ou des repères plus courts couché : affaire de maquette.
- **Le pion suit le pouce** : poussé au bout vers le bord (droite pour un droitier, gauche pour un gaucher, couché), il entre dans l'encoche — c'est le doigt.
- **Les deux pouces debout** : la ligne de mission (en bas à gauche) passe sous le volant quand le pouce gauche est au bas de l'écran ; le volant flotte
  sous le doigt, rien à ranger.
- **Le flou du gel** (pwrChip × slam9 dans « le pire ») : artefact du banc, vérifié en temps réel le 10/11.
- L'ancien HUD (`?hud=ancien`) n'a pas été re-mesuré.

## Matrice état × gabarit APRÈS correctifs (« · » = propre ; sinon les paires de blocs qui se touchent encore)

Lire avec « Reste ouvert » : `nitroWrap/flowHud/frenTitre × triade` à l'entrée couchée = le vol de naissance voulu ; tout ce qui est en `se-c` / `se` =
artefact SE (encoche simulée sur un écran qui n'en a pas) ; `pwrChip × slam9` = artefact du gel du banc (vérifié en temps réel, voir plus bas) ;
`coupe m2Ligne` = la ligne de mission tronquée à 3 lignes exprès.

Debout, FR (relevé ch5, 18 h 40, code de la branche après la fusion de main v1424) :

| état | fr 13p | fr 393 | fr max | fr se |
|---|---|---|---|---|
| depart | · | · | · | · |
| course | · | · | · | · |
| flow50 | · | · | · | · |
| flow80 | · | · | · | · |
| flow100 | · | · | · | · |
| entree | · | · | · | frenTitre×touchCtl, cashHud×triade |
| fren-chrono | · | · | · | · |
| fren-vol | · | · | · | · |
| fren-airmax | · | · | · | · |
| fren-nitromax | · | · | · | · |
| fren-chaine | · | · | · | · |
| fren-annonce | · | · | · | · |
| fren-x10 | · | · | · | · |
| fren-sortie | · | · | · | · |
| entree-vol | · | · | auraV2×cashHud | cashHud×triade, frenTitre×touchCtl, fhLeg×frenTitre, airHud×frenTitre |
| pouvoirs | · | · | · | · |
| mission | · | · | · | · |
| portail | · | coupe m2Ligne | · | · |
| pause | · | coupe m2Ligne | · | · |
| reprise | · | coupe m2Ligne, auraV2×cashHud | · | · |
| pire | · | · | pwrChip×slam9 | pwrChip×slam9 |
| pire-vol | · | · | pwrChip×slam9 | pwrChip×slam9 |
| chance | · | · | · | · |

Couché, FR (relevé ch6, 18 h 50, avec H-12 dans sa version finale) :

| état | fr 13p-c | fr max-c | fr se-c |
|---|---|---|---|
| depart | · | · | · |
| course | · | · | · |
| flow50 | · | · | fil×m2Ligne |
| flow80 | · | · | auraV2×slam9 |
| flow100 | · | · | · |
| entree | nitroWrap×triade | frenTitre×triade, nitroWrap×triade, flowHud×triade | m2Ligne×touchCtl |
| fren-chrono | · | · | cashHud×triade |
| fren-vol | · | · | cashHud×triade |
| fren-airmax | · | · | cashHud×triade, pwrChip×triade |
| fren-nitromax | · | · | cashHud×triade, pwrChip×triade |
| fren-chaine | · | · | cashHud×triade |
| fren-annonce | · | · | cashHud×triade, pwrChip×triade, pwrChip×slam9 |
| fren-x10 | · | · | cashHud×triade |
| fren-sortie | · | · | cashHud×triade, pwrChip×triade |
| entree-vol | · | · | cashHud×triade, pwrChip×triade |
| pouvoirs | pwrChip×triade | · | cashHud×triade, pwrChip×triade |
| mission | pwrChip×triade | · | cashHud×triade, m2Ligne×touchCtl, pwrChip×triade |
| portail | pwrChip×triade, lvlBan×pwrChip | · | cashHud×triade, pwrChip×triade, lvlBan×pwrChip |
| pause | · | · | · |
| reprise | · | · | cashHud×triade, pwrChip×triade |
| pire | pwrChip×triade, pwrChip×slam9 | · | cashHud×triade, pwrChip×triade, pwrChip×slam9 |
| pire-vol | pwrChip×touchCtl | · | cashHud×triade, airHud×slam9, pwrChip×touchCtl, pwrChip×slam9 |
| chance | · | · | · |

Anglais, 7 gabarits (relevé ch4, 18 h 15-18 h 45 — ⚠ la fusion de main est tombée au milieu de cette série : les gabarits du début sont sans H-11/H-12).
Mêmes constats que le français : les mots anglais (SPEED ×2, NEW SECTOR, FRENZY, MISSION DONE) sont plus courts, rien de coupé de plus.

| état | en 13p | en 393 | en max | en se | en 13p-c | en max-c | en se-c |
|---|---|---|---|---|---|---|---|
| depart | · | · | · | · | · | · | · |
| course | · | · | · | · | · | · | · |
| flow50 | · | · | · | · | · | · | · |
| flow80 | · | · | · | · | · | · | · |
| flow100 | · | · | · | · | · | · | · |
| entree | · | · | cashHud×triade | frenTitre×touchCtl, cashHud×triade | nitroWrap×triade | frenTitre×triade, nitroWrap×triade, flowHud×triade | nitroWrap×triade, flowHud×triade, frenTitre×triade |
| fren-chrono | · | · | · | · | · | · | cashHud×triade |
| fren-vol | · | · | · | · | · | · | cashHud×triade |
| fren-airmax | · | · | · | · | · | · | cashHud×triade, pwrChip×triade |
| fren-nitromax | · | · | · | · | · | · | cashHud×triade, pwrChip×triade |
| fren-chaine | · | · | · | · | · | · | cashHud×triade |
| fren-annonce | · | · | · | · | · | pwrChip×slam9 | cashHud×triade, pwrChip×triade |
| fren-x10 | · | · | · | · | · | · | cashHud×triade, pwrChip×triade |
| fren-sortie | · | · | · | · | · | · | cashHud×triade, pwrChip×triade |
| entree-vol | · | · | · | airHud×frenTitre, frenTitre×touchCtl, fhLeg×frenTitre | · | flowHud×triade, fil×m2Ligne, frenTitre×triade | cashHud×triade, nitroWrap×triade, flowHud×triade, frenTitre×triade, pwrChip×triade |
| pouvoirs | · | · | · | · | pwrChip×touchCtl | · | cashHud×triade, pwrChip×triade |
| mission | · | · | · | · | pwrChip×touchCtl | · | cashHud×triade, m2Ligne×touchCtl, fhLeg×m2Ligne, zone pwrChip |
| portail | · | · | · | · | pwrChip×touchCtl | · | lvlBan×pwrChip |
| pause | · | · | · | · | · | · | · |
| reprise | · | · | · | · | · | · | · |
| pire | cashHud×triade | · | · | cashHud×triade, frenTitre×touchCtl | · | · | cashHud×triade, flowHud×triade, frenTitre×triade, frenTitre×pwrChip, flowHud×frenTitre |
| pire-vol | · | · | pwrChip×slam9 | · | · | · | cashHud×triade, pwrChip×triade, pwrChip×slam9 |
| chance | · | · | · | · | · | · | · |

## Rotation en pleine course (`chevauche.cjs --rot 1`, 13 Pro et Pro Max, FR et EN)

Debout → couché → debout pendant une frénésie (NITRO MAX, AIR MAX, VITESSE ×2, chaîne, 1 234 567 €), puis pendant une PAUSE, puis le POUCE posé sur le
volant (touchStart tenu pendant les deux quarts de tour). Après chaque quart de tour (300 ms et 1,2 s) : mesure + photo + la place des touches.
- Frénésie : H-13 (l'emblème restait au milieu de l'écran couché) — corrigé, re-mesuré en EN (y 51). Les autres `top` en ligne (argent 137 → 78,
  plaques 296 → 136) sont réécrits dans les 100 ms : aucune paire, rien hors de l'écran, rien dans l'encoche.
- Pause : `hudColMesure` ne tourne pas en pause (les `top` restent ceux d'avant la rotation) mais tout le HUD est caché (`body.hTp`) ; ils sont réécrits
  au premier dixième de seconde de la reprise. Le panneau de pause, le ⏸ et la boule de feu sont à leur place dans les deux sens.
- Pouce sur le volant : le volant (`#tStick`) suit le doigt, la boule de feu (`#tNitro` 693-771 × 228-353 couché, 277-376 × 636-794 debout) et sa zone
  (`#tNitroZone`) changent de place avec l'écran ; le doigt n'est pas lâché par la rotation. Seul relevé : le disque du volant déborde de 8 px du bord
  gauche quand le pouce est à 90 px du bord (il est centré sur le doigt) — normal.
- Vu au passage, non corrigé : l'argent « € 1 235 006 » en tout petit sur ces deux prises : le banc pose 1 234 567 € dans la 1re seconde de course,
  pendant l'entrée en scène du compteur ; `soldeFit` le mesure à ce moment-là (décalé par l'animation), le juge trop large, et ne remesure qu'au
  prochain changement de longueur du nombre. En jeu, l'argent grandit pas à pas : il se remesure à chaque chiffre de plus. Pas reproduit hors banc.

## Reste ouvert, et pourquoi

- **« RECORD BATTU » (#slam9) sur la 4e plaque, sans `body.slamOn`** (393, Pro Max, SE, 13p couché, états « le pire ») : ARTEFACT DU BANC, vérifié en temps
  réel au pilote (échantillon toutes les 100 ms, sans photo) : l'annonce vit 1,3 s, `slamOn` aussi, les plaques restent à .08 tout ce temps. Sur le
  banc, le gel des animations pendant les photos laisse l'annonce traîner après la fin de sa minuterie.
- **H-12, un compromis** : couché sur 844 × 390, la place entre l'argent et la boule de feu ne tient que DEUX plaques. Avec quatre, la 2e colonne
  (à gauche) touche encore les trois traits sous DARK TRIAD (300 px², 11 px de haut) et la bannière de niveau passe dessus au portail ; avant, la
  4e plaque recouvrait la boule de feu (la commande). Le mieux serait une plaque plus basse couché (maquettes du HUD de Sacha) : pas fait ici.
- **Couché, l'emblème qui naît vole par-dessus les barres** (nitroWrap / flowHud, 100-700 px² pendant 0,56 s) : c'est la naissance voulue
  (`trNait` : il part du centre de la zone rouge et file à sa place). De même `#slam9` sort de l'écran dans les 150 premières ms (il entre à ×3,2).
- **Couché, le haut du titre TRIPLE MONSTER effleure l'emblème** (Pro Max couché, 72-380 px² de BOÎTE de svg, pas de lettres) : non corrigé, rien
  de visible sur les photos.
- **La ligne de mission (#m2Ligne) est coupée à 3 lignes** (« ATTEINS 20 000 D'AURA EN UNE… ») : `-webkit-line-clamp:3` voulu (missions.css l.243).
- **Écran de fin : « MISSIONS11 / 54 »** (le compteur collé au titre de la carte) et « CONTINUER GRATUIT » 5 px plus large que sa boîte couché
  (pas visible) : écran de mort, hors du HUD de course — signalés, pas touchés.
- **Artefacts SE (667 × 375 et 375 × 667 avec 59 px d'encoche simulés)** — aucun iPhone de cette largeur n'a d'encoche ni d'indicateur d'accueil :
  couché, l'emblème DARK TRIAD tombe sur l'argent (976 px²) et la bannière de niveau sur les plaques ; debout, TRIPLE MONSTER descend jusqu'à la
  boule de feu et au rappel des gestes ; l'offre de seconde chance entre dans la « zone d'accueil ». Calculé avec les vraies marges (0 de côté couché,
  20 en haut / 0 en bas debout), rien ne se touche. Photo : `hud/ouvert-se-couche-triade-argent.png`.
- **Le banc ne voit pas** : les textes dessinés en canvas (le compteur de la boule de feu), les lueurs et `drop-shadow` (hors boîte), les pseudo-éléments
  (::before/::after) sauf ceux des touches (boîte entière comptée).
