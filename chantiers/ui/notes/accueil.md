# accueil — refonte de l interface, charte 6 (2026-10-14)

## Journal
- Commit 1848766 puis le suivant sur `ui/accueil`. Tout le CSS est dans `<style id="c6-accueil">` ; un seul point de JS (les pastilles, dans le
  remplissage de l'accueil, là où `bdGar` / `bdShop` sont écrits).
- `#mHome.acc2` (édition normale, HUB) : la grille de uxPasse est gardée (mêmes places), ses mesures refaites : colonnes
  `1fr 1fr 48 48 48`, écart 8 ; rangées `logo · 1fr · 48 · 16 · 64` ; bord = 16 px + zones sûres. Couché : `96 96 48 48 48` = 368 px
  (le logo fait 374 px : même bloc), `logo · 24 · 48 · 16 · 64`, centré en hauteur.
- Les cinq touches : encre `--c6-e1`, filet blanc 2 px, tranche noire 4 px, icône blanche `--pxs:2` ; à l'appui elles descendent de 4 px.
  Les règles de hubGarage (dégradé, reflet, couleur par tuile, lueur d'icône — toutes en `!important`) sont dominées par
  `html.c6.hub:not(.poki) body #mHome.acc2 :is(.mOutils>.mAccB,.mOutils>.mGear,.mAccP>.mMisBarre)`.
- CARRIÈRE · MISSIONS : icône au-dessus, mot en 8 px sans chasse (64 px), `overflow:visible`. Mesuré : mot 64 px dans 96 (couché),
  91 (390), 84 (375). Sous 350 px de large : carrés de 44 et écart de 4 (les mots gardent 64 px) — calculé, pas capturé.
- Pastilles (`.mBadge`) : carré d'or 8 × 8, cerne noir 2 px, au coin (−4 px), sans texte ; le script n'écrit plus ni le nombre ni « NEW »
  quand `html.c6` (avec `?ui=5` l'ancien texte revient). Allumée si quelque chose est achetable (garage) / offres pas encore vues.
- `.mMisPips` : trois carrés de 4 px en haut à droite de MISSIONS ; vide = `--c6-e4`, réussi = blanc.
- JOUER : mêmes lettres d'or en cubes ; halo flou retiré (le `drop-shadow` flou de la plaque ET l'ombre floue de `.lg::before`),
  remplacé par un cerne dur de 2 px + ombre dure de 4 px (`drop-shadow` sans flou). Corps 40 px debout, 32 px couché (était 44 / 38).
- Édition Poki (`?poki=1`, GARAGE · ⚙ · JOUER) : même peau, 48 px, écart 8, même ombre de JOUER.

## RETIRE / DEPLACE
- La livrée tricolore sous le logo (`#mHome .mTitle::after`).
- Le chiffre de la pastille du garage (« 39 ») et le mot « NEW » des offres : une pastille muette.
- Les couleurs par tuile (violet, vert, cyan, magenta), dégradés, reflets, lueurs des icônes ; le halo de JOUER.
- Rien n'est déplacé : mêmes cinq touches, même ordre (CARRIÈRE · MISSIONS · GARAGE · OFFRES · RÉGLAGES), JOUER dessous.

## POUR LE SOCLE
- `html.c6 .mBadge` du socle (carré 20 px à chiffre) est dominé à l'accueil ; si la pastille muette de 8 px devient la règle partout
  (ex. `#bdGar2` au garage, qui porte encore un nombre), la remonter dans `charte6`.
- Le LOGO garde son halo doré (`filter:drop-shadow` flou sur `.mTitle` et `.lg`) : « intouché » par consigne — à trancher.

## POUR LES AUTRES
- garage : `#bdGar2` (ligne ~52418) écrit encore le nombre.

## RESTE / QUESTIONS
- Pas vérifié : l'anglais / le chinois en capture (calcul : CAREER 48 px, MISSIONS 64 px ; le chinois change de police), `?menu=leo`
  (ancien accueil sans `acc2`, non stylé ici), le ciel CLAIR (les captures sont de nuit — le cerne noir est fait pour, mais pas vu),
  le parcours JOUER → course → REJOUER, le splash / la fenêtre / le toast / la panne / le cadre de l'ordi (hors mission).
- Poki : la rangée est à 24 px des bords debout (l'ancienne marge de la coque), pas 16 ; les erreurs de console en `?poki=1` viennent du
  SDK Poki en bac à sable (serviceWorker / COOP), pas de l'accueil.
- Le reflet animé du mot JOUER et du logo (`.lg::after`, lgShine) est resté : il fait partie « des lettres ».

---
# v2 — règles de 6 h (2026-10-14, 6 h 06 → 7 h 05) — commits a0751e8, 10ada15, fefcee0 sur `ui/accueil`
⚠ NON VÉRIFIÉ À L'ÉCRAN : charge machine 45 → 112 → 195 → 311 → 600 (limite 40) ; aucun passage de banc. Le relevé est PRÊT :
`node /Users/sachaberes/cash-car/ui/banc/accueil/releve3.cjs tout en` (avant = copie figée du commit 4007550 servie par
`python3 -m http.server 8593` depuis le scratchpad — à recréer : `git show 4007550:"VERSION PRINCIPALE/index.html"` + liens vers les
autres fichiers ; après = port 8501) → `shots/accueil/p1/` (6 formats iPhone, marges 59/34 et 59/21, joueur neuf : splash + choix).

## Ce qui change
- ACCUEIL (`<style id="c6-accueil">`, section v2 réécrite ; la v1 cinq touches est remplacée) :
  · grille debout `1fr 1fr`, rangées `44 · 8 · logo · 1fr (la caisse) · 64 · 8 · 64 · 12 · 72` ; couché : `1fr 184 184`, bloc à droite
    (logo, cartes 56 px, JOUER 64 px), RÉGLAGES en haut à gauche ;
  · 4 CARTES de même forme (icône 28 px à gauche, MOT système 800 15 px, SOUS-LIGNE système 600 13 px, gris ; or = à signaler) :
    CARRIÈRE → `carrPlayNom()` (« SKY HIGH 3 ») · MISSIONS → « 1 / 3 DÉFIS » (`misEtat`) · GARAGE → nom de la caisse (`CARS[level]`)
    · OFFRES → « NOUVEAU » (or) si jamais vues, sinon « DÈS 1,61 € » (la moins chère des légendaires non possédées). Écrites par
    `accC6()` (juste avant `mFill`, appelée par la branche `home` de mFill sous html.c6) dans des `<b class="c6aT">` / `<small class="c6aS">`
    (sans data-fr : applyLangDOM n'y touche pas ; FR avec accents, EN / ZH en dur dans accC6) ;
  · RÉGLAGES : icône + mot, 44 px, en haut à gauche ;
  · JOUER : plaque or pleine (matière .pb-gold), pleine largeur, 72 px debout / 64 couché, lettres .lg en encre 32 px (24 px ≤ 350 px),
    plus d'extrusion ni de reflet sur ce mot ; à l'appui −4 px ;
  · `menuCadre` (fefcee0) : sous html.c6, la carte CARRIÈRE ferme la bande de la caisse par le bas (.mOutils est en display:contents,
    sa boîte valait 0 → la caisse retombait à 74 % de la hauteur, sur les cartes).
- PASTILLES : retirées (`html.c6 body #mHome .mBadge{display:none}`, Poki compris) ; l'info des OFFRES passe dans la sous-ligne
  (NOUVEAU en or). Celle du GARAGE (« quelque chose est achetable ») n'a plus de signal à l'accueil — à trancher.
- CHOIX FACILE / NORMAL (`facChoix`, sous html.c6) : `modale` accepte `cartes:true` (→ `#modale.facC6`) et `k.sous` (une promesse en
  `<small>`) ; deux cartes égales en 2 colonnes, 128 px : FACILE (cœur, « Virages aidés, 3 vies ») en OR = la conseillée, NORMAL
  (éclair, « Sans aide, une seule vie ») en encre à filet blanc ; texte réduit à « Tu pourras changer dans les réglages. » ;
  plus de vert. ?ui=5 = l'ancienne fenêtre. Traductions EN / ZH ajoutées (Object.assign après « TOUS LES REGLAGES »).
- SPLASH : `<p id="spInvite" hidden>` dans #splash ; montré par le minuteur de 900 ms (là où l'ancien #spNote s'allumait) sous html.c6
  seulement, effacé au toucher (launch) ; pixel 16 px blanc cassé, respire en opacité ; « TAP TO PLAY » / « 点击开始 ».
  CAR : dégradé blanc (deux tons : CASH or, CAR blanc) au splash ET à l'accueil, plus de rose.

## RETIRÉ / DÉPLACÉ
- La rangée de cinq touches ; les trois icônes seules (GARAGE, OFFRES, RÉGLAGES) ; les trois carrés des missions (`.mMisPips`
  masqués : la sous-ligne dit « n / 3 ») ; les pastilles ; le JOUER en mot flottant ; le paragraphe du choix de mode.

## POUR LE SOCLE
- Le CAR blanc n'est posé que sur `#spTitle` et `#mHome .mTitle` : les autres logos (garage, volet, #launchLogo) gardent leur dégradé
  rose — à remonter dans `charte6` si Sacha valide les deux tons.
- La carte « icône + mot + sous-ligne » (`.c6aT` / `.c6aS`) pourrait devenir un composant du socle.

## RESTE / À TRANCHER
- TOUT est à voir à l'écran (3 tailles × 2 orientations, FR / EN, joueur neuf) : la hauteur du logo couché à 375 px (calcul : 316 px
  de contenu pour 343 dispo), la caisse au-dessus des cartes, la sous-ligne la plus longue (nom de caisse ≈ 12 lettres ≈ 104 px pour
  111 px de place à 375 : ellipsis en garde-fou).
- Pastille du garage : la remettre en mot (« 3 À ACHETER » en or à la place du nom de la caisse ?) ou la laisser partie.
- `?menu=leo` et Poki non vus (Poki : seules les pastilles changent).
