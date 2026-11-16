# Lot SONDEOC — le film d'intro dans un Worker (15/11)

Branche `qa/sondeoc`, worktree `~/cash-car/qualite-sondeoc`, partie de `qualite-appareil` (8d5ff4168).
Tout est ÉTEINT par défaut. Rien ne change sans `?sondeoc=1` ou `?plus=filmworker`, et seulement sur vrai téléphone (`TEL_NATIF`).

## En une phrase

La sonde et le prototype marchent au banc (Chrome et WebKit de bureau). Le Worker continue de DESSINER quand le fil principal est bloqué.
Ce qui reste à prouver, et que seul l'iPhone peut dire : ces images sont-elles AFFICHÉES pendant le blocage.

## 1. La sonde `?sondeoc=1` (code/moteur/sonde-oc.js)

- Au menu, 4 s après son ouverture, coin haut gauche.
- Un carré noir de 96 px dessiné par un Worker : un trait blanc, un tour par seconde, et le numéro de l'image dessous.
- À droite, un petit carré or qui tourne en CSS : le TÉMOIN (animation hors du fil principal).
- Le fil principal se bloque exprès 1 s, trois fois (1,5 s d'écart). Pendant chaque blocage, le fond du carré passe au ROUGE.
- La sonde se retire 12 s après la fin (« FINI » dans le carré). `dbgSondeOC()` rend les chiffres.
- Une course qui démarre ANNULE la sonde : plus aucun blocage, la boîte s'en va, la boîte noire dit `annulée`. Ne rien toucher pendant 15 s.
- Le Worker date les blocages sur SA propre horloge (voir « CORRECTIONS DU CONTRÔLE », point 1).

Boîte noire, genre `sondeoc`, trois lignes :
- `support : OffscreenCanvas · transfert · Worker · rAF de Worker · 2d · FontFace · police appliquée · ImageBitmap clonée` (1 ou 0) ;
- `blocages 3 × 1000 ms : images DESSINÉES par le Worker a / b / c · dont peintes en rouge … · intervalle maxi … ms · message reçu après … ms` ;
- `hors blocage : n images, moyenne, maxi · écart des horloges (Worker − fil principal) … ms` (l'écart est une information, la sonde ne s'en sert pas).

⚠ « DESSINÉ » N'EST PAS « AFFICHÉ ». La ligne compte les images que le Worker a dessinées. Elle ne sait pas si l'écran les a montrées.
Sacha doit REGARDER le coin (ou filmer l'écran) : pendant le fond ROUGE, le trait continue-t-il de tourner ?
- Le trait tourne pendant le rouge : le film dans un Worker tiendra pendant le chargement. On continue.
- Le trait se fige 1 s (et le carré or du témoin tourne, lui) : le Worker dessine mais l'écran attend le fil principal. Le Worker ne sert à rien sur iOS, on s'arrête là.
- On ne voit jamais de rouge : même verdict (les images rouges n'ont jamais été montrées).

Chiffres du banc (ordinateur, pas l'iPhone) :

| moteur | support | images dessinées par blocage de 1 s | intervalle maxi | hors blocage |
|---|---|---|---|---|
| Chrome sans fenêtre, CPU ×4 | tout à 1 | 60 / 60 / 60 | 17 / 17 / 17 ms | 16,7 ms, maxi 17 |
| WebKit de Playwright (Safari 27.2, Mac) | tout à 1 | 56 / 55 / 56 | 19 / 19 / 19 ms | 18 ms, maxi 19 |

## 2. L'étude : ce que demande le film dans un Worker

Le film par défaut (BOULE, intro-161.js l.880 `rendu0`) ne dessine que : le noir, la boule (`dBoule` l.289), « TOUCHE » (`dToucheBoule` l.418),
« 1.61 PRESENTS » (`dPresente` l.457), trois carrés d'attente (`dAttenteJeu` l.450). La casse en tuiles (`dEclats` l.519, logo l.342, photo du jeu l.574)
n'est PAS jouée par le film actuel : après l'appui, le voile fond en CSS (`fonduDoux` l.795). Elle ne sert qu'au banc `dbgIntro.voir`.

Dépendances au DOM, une par une :

| quoi | où (intro-161.js) | dans le Worker |
|---|---|---|
| la toile `#fxCv` et son contexte | l.35-37 (`getContext` dès la 1re ligne) | INTRANSFÉRABLE : une toile qui a déjà un contexte ne se transfère pas, et une toile transférée ne se reprend jamais. → une toile À PART, posée au-dessus. Le repli = la retirer. |
| 660 vignettes de chiffres (`createElement('canvas')` + `fillText` Press Start) | `geoLabSphere` l.218-239 | faites sur le fil principal (elles le sont déjà, sous le serpent), envoyées en ImageBitmap (déjà des ImageBitmap : `bouleInit` l.274). 48 × 64 px, 8 Mo en tout, clonées une fois. |
| 4 lueurs (`lueur` l.115, canvases 128 px) | `faitRessources` l.120, `dBoule` l.299 | 4 ImageBitmap transférées. |
| `fillText` en Press Start 2P à l'image | « TOUCHE » l.418, « PRESENTS » l.457 | la police est rechargée DANS le Worker (`FontFace` + `self.fonts`). Sans elle : pas de Worker (repli). Le filet des polices de debut-corps.html (l.52) n'existe pas dans le Worker : sans effet ici, ces textes n'ont que des signes de Press Start. |
| le serpent qui fond (`chCl` l.265 : DOM + plugin natif) | appelé par `rendu0` | reste sur le fil principal. |
| les touchers (pointerdown/move/up, clic) | `boulePointeur` l.244, l.982 | restent sur le fil principal. L'angle de la boule part au Worker. |
| le son (WebAudio) : nappe, cloche toutes les 0,9 s (l.305), accord « prêt » (l.902), coup de l'appui (l.802) | sur l'horloge audio | reste sur le fil principal (WebAudio n'existe pas dans un Worker). |
| « prêt » (`pretT`, lit `document.readyState`, polices, `__ccCharge`) | `boucle` l.902 | fil principal, envoyé au Worker. |
| la taille (`mesure` l.106, pivot l.937-973) | resize, ResizeObserver | fil principal, envoyée au Worker. |
| la photo du jeu pour les loupes (`__introPrise` l.574) | casse seulement | hors du film actuel : non portée. La casse reste au fil principal. |

Le protocole (film-worker.js) :
- fil principal → Worker : `init` (toile, police, vignettes, lueurs) · `geo` (les tableaux de la boule, à chaque nouvelle taille) · `etat` (20 nombres : horloge du film, latence du son, prêt, appui, fin de PRESENTS, angle et vitesse de la boule, doigt posé, taille, lancé/fini, et `bTP` l'heure de l'élan), envoyé seulement s'il a changé · `ping`/`horloge` (recalage des horloges) · `fige` (banc) · `bilan` · `fin` (le film est fini) · `suivi` (banc).
- Worker → fil principal : `pret` · `vu` (1re image dessinée) · `vie` (toutes les 30 images) · `err` · `bilan` (images, pire intervalle, pire rendu, retailles) · `fin` (bilan final, images fermées).
- L'heure du film : `t = (heure du Worker − heure de départ du film) − latence du son`, la même formule que `boucle`. Le Worker n'attend aucun message pour dessiner une image.

Le repli : pas de support · pas de `FontFace` dans le Worker · police non appliquée · vignettes pas en ImageBitmap · erreur dans le Worker · Worker muet 2,5 s · casse · banc `voir`.
Dans tous les cas la toile du Worker est retirée et le fil principal redessine dans `#fxCv` à l'image suivante. La boîte noire dit pourquoi (`filmworker | repli : …`).

Taille du chantier : PETITE, et déjà faite pour le prototype. 135 lignes (film-worker.js) + 2 lignes dans intro-161.js.
Aucune fonction de dessin n'est recopiée : le Worker reçoit le TEXTE des vraies fonctions (`Function.toString`) et les fait tourner sur ses variables.
Une retouche du film dans intro-161.js arrive seule dans le Worker. Si elle y appelle un nom inconnu, le Worker plante et le repli se fait.
Ce qui resterait pour en faire le chemin par défaut : une demi-journée (pivot, doigt, 120 Hz à vérifier sur l'appareil), APRÈS le verdict de la sonde.

Les limites, à savoir avant de compter dessus :
- Le Worker ne libère QUE le dessin. Le toucher, « prêt », le son restent au fil principal : un blocage de 500 ms retarde l'appui et une cloche de 500 ms, comme aujourd'hui.
- Seul, le prototype ne fait gagner AUCUN temps de lancement : aujourd'hui rien ne charge pendant le film (`__introPause`, l.925). Le gain n'existe qu'avec la proposition 1 du lot lancement2 (charger pendant la boule). Le Worker sert à ce que ce chargement ne se voie pas.
- Mémoire : + 8 Mo (vignettes clonées) et une toile plein écran de plus pendant le film. Rendues à la fin du film.

## 3. Le prototype `?plus=filmworker` (code/moteur/film-worker.js)

- La toile `#fxCvW` est posée au-dessus de `#fxCv` dans le voile. Le Worker la dessine avec son propre `requestAnimationFrame`.
- Le fil principal garde l'état : `dBoule` y tourne sur un contexte factice (aucun dessin) pour l'inertie du doigt et les cloches.
- Le Worker se prépare sous le serpent, après la chauffe de l'intro (il ne lui prend rien). Il prend le film dès sa 1re image dessinée.
- À l'ouverture du menu : `intro | filmworker · … n images du Worker, pire … ms, images > 20 ms : …`. À comparer à la ligne `intro | mode 1 · à l'ouverture du menu` (les images du fil principal).
- `dbgFilmW` : `etat()`, `bilan()`, `fige(t)`, `cache(vrai)`, `panne()`, `suivi(vrai/faux)` (banc).

Points d'accroche dans intro-161.js (2 lignes AJOUTÉES, aucune ligne existante modifiée) :
1. l.881, 1re ligne de `rendu0` : `if(FILMW.on&&FILMW.image(t))return;`
2. l.1085, après `window.__ccIntroAuto=…` : `if(FILMW.on)try{FILMW.accroche({…});}catch(e){}` (donne la toile, l'état, et le texte des fonctions de dessin).
`code/ORDRE.txt` : `moteur/film-worker.js` AVANT `moteur/intro-161.js` (FILMW doit exister), `moteur/sonde-oc.js` après.
Éteint (`FILMW.on` faux) : un test de booléen par image, rien d'autre.

### Prouvé au banc (outils/banc-demarrage/filmworker.cjs, 390 × 844 ×2, `?tel=1&introapres=1`)

| mesure | Chrome | WebKit de Playwright |
|---|---|---|
| le Worker prend le film | à t = 0,03-0,04 s | à t = 0,04-0,05 s |
| fil principal bloqué 3 × 800 ms pendant la boule : pire intervalle du Worker | 17 ms, 0 image > 20 ms | 28 ms |
| pendant ce temps, pire intervalle du fil principal (ligne `intro`) | 783 ms | 834 ms |
| pire rendu d'une image dans le Worker | 1,1-1,7 ms | 2,0 ms |
| film entier jusqu'au menu (CPU ×4 sur Chrome) | 703 images, pire 33 ms, 1 image > 20 ms | 618 images, pire 32 ms |
| repli sur panne provoquée | toile retirée, photo identique au fil principal (0 pixel) | non fait |

Même image ? Photos au même instant figé, Worker puis fil principal, 1 316 640 pixels :

| instant | Chrome, même tracé (canevas 2D non accéléré) | Chrome par défaut | WebKit |
|---|---|---|---|
| 1,5 s (la boule naît) | 0 pixel différent | 22 896, écart maxi 51/255 | non fait |
| 2,6 s | 0 | 69 433, écart 70 | 6 473, écart maxi 7/255 |
| 4 s (boule entière) | 0 | 104 120, écart 64 | 10 918, écart 10 |
| 6 s, prête à 3 s (« TOUCHE ») | 0 | 106 700, écart 54 | 11 056, écart 7 |
| appui + 0,3 s (explosion) | 0 | 12 101, écart 34 | non fait |
| appui + 1,6 s (« 1.61 ») | 0 | 0 | 0 |
| appui + 3,2 s (« PRESENTS ») | 0 | 0 | non fait |

Lecture : même géométrie, mêmes chiffres, mêmes couleurs, mêmes textes au pixel. L'écart de Chrome par défaut est sur le BORD des chiffres réduits :
la toile de la page y est tracée par la carte graphique, celle du Worker non (filtre de réduction différent). Avec le même tracé des deux côtés : 0 pixel.
Sur WebKit l'écart est de 10/255 au plus sur 0,8 % des pixels : invisible. Sur l'iPhone : NON MESURÉ.

Lancement par défaut (sans interrupteur), `lancement.cjs` : prêt 3,9 s, film 770 images, pire 17 ms, 0 erreur, aucune ligne `filmworker` ni `sondeoc`.
Gardes : assemblage d'accord, garde-demarrage OK, garde-allege OK, garde-charte OK, `node --check` du gros script OK.

### NON prouvé

- L'AFFICHAGE sur iPhone pendant un blocage du fil principal. C'est toute la question. Le banc ne photographie qu'à l'arrêt.
- Le support dans la WKWebView du 13 Pro (OffscreenCanvas 2D, rAF de Worker, FontFace de Worker, clonage d'ImageBitmap, Worker en `blob:` qui lit la police de l'app). Le WebKit de bureau dit oui à tout ; l'app, on ne sait pas.
- Le pivot et la boule lancée au doigt : essayés au banc depuis (voir « CORRECTIONS DU CONTRÔLE »), PAS sur l'iPhone.
- L'écran 120 Hz (`pciSaute` tourne dans le Worker ; jamais vu sauter au banc).
- Le son : inchangé par construction, pas écouté (banc muet).
- Le coût réel du Worker sur le téléphone (chaleur, mémoire).
- La cohabitation avec le lot lancement2 (il modifie introPoll, introPartir, lancer, chauffe : mes 2 lignes sont ailleurs, la fusion n'est pas essayée).

## À faire sur le 13 Pro (dans l'ordre)

1. `?sondeoc=1` : aller au menu, NE RIEN TOUCHER pendant 15 s (une course lancée annule la sonde), regarder le coin haut gauche. Le trait tourne-t-il pendant le fond rouge ?
   Puis lire la boîte noire (`sondeoc`), et D'ABORD « message reçu après … ms » :
   - proche de 0 (quelques ms) : le rouge était à l'heure. Le verdict se lit sur le rouge, comme écrit plus haut ;
   - proche de 1000, ou « dont peintes en rouge 0 » : le message n'est arrivé au Worker qu'à la FIN du blocage. Le rouge ne s'est pas allumé à temps : « je n'ai pas vu de rouge » ne veut alors RIEN dire.
     On juge seulement le trait et le numéro : se figent-ils une seconde, trois fois, pendant que le carré or tourne ?
   - `annulée` : une course est partie. Recommencer sans toucher.
   « écart des horloges » : une information (si ce n'est pas 0, l'ancienne sonde aurait menti ; la nouvelle ne s'en sert pas).
2. Si oui : `?plus=filmworker`. Le film doit être le même à l'œil. Lire `filmworker | le Worker dessine le film depuis t = …` (sinon `repli : …` dit pourquoi)
   et comparer les deux lignes `intro` à l'ouverture du menu (fil principal contre Worker).
3. A/B : sans `?plus=filmworker` = le film d'aujourd'hui. Le vrai essai est avec le chargement pendant la boule (lot lancement2) : avec et sans `plus=filmworker`,
   compter les images > 20 ms de la ligne `intro | filmworker` et regarder la boule.

## Fichiers

- `code/moteur/sonde-oc.js` (nouveau) · `code/moteur/film-worker.js` (nouveau) · `code/ORDRE.txt` (2 lignes) · `code/moteur/intro-161.js` (2 lignes ajoutées)
- `outils/banc-demarrage/filmworker.cjs` (nouveau) : `--mode photos` (blocages, photos, repli) · `--mode menu` (appui, menu, fin du Worker, sonde) · `--mode doigt` · `--mode pivot` · `--cpu 4` · `--decale 7000` · `--sans-accel 1` · `--course 1` · code de sortie 1 si échec
- `outils/banc-demarrage/chrome-sans-accel.sh` (le Chrome du « 0 pixel ») · `outils/banc-demarrage/filmworker-webkit.cjs` (les essais WebKit de Playwright : `photos`, `menu`, `sonde`)
- `VERSION PRINCIPALE/index.html` et `sw.js` : NON commités (à réassembler à l'intégration, `node code/assembler.cjs --depuis-morceaux`).

## Après la fusion de main du 16/11 (la Terre de Fibonacci, « 1.61 INTERACTIVE »)

- La boule de main naît au pôle du haut et glisse (tableaux `th`, `ca`, `sa`, `t0`, constante `FIB_GLISSE`). Le Worker ne les recevait pas : il aurait dessiné l'ANCIENNE boule, sans erreur.
- Corrigé : `envoieGeo` envoie la boule ENTIÈRE (tout nombre et tout tableau, sauf vignettes et tampons) ; `FIB_GLISSE`, `BOULE_ANCIEN`, `BOULE_PRET_T` passent dans `K`.
- Contrôle statique des noms libres du texte du Worker (eslint `no-undef`) : même liste avant et après la fusion (13 noms, tous dans des branches de `rendu0` que le Worker ne prend pas : démo, labels, casse).
- Banc `--mode photos --sans-accel 1` : 7 instants figés, Worker contre fil principal, 0 pixel différent (dont t = 1,5 s, chiffres en pleine glissade).
