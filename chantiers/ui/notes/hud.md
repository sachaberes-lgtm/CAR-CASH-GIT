# hud — refonte de l interface, charte 6 (2026-10-14)

Mission courte (30 min, CSS seulement, veille de sortie) : on ne déplace rien, ni tailles ni ordre, pas de JS. Tout est dans
`<style id="c6-hud">` (≈ lignes 7514-7562 de `VERSION PRINCIPALE/index.html`), chaque règle commence par `html.c6`.
Banc : `ui/banc/hud/quatre.cjs` (un navigateur, couche + debout + i7couche ; mesures + captures dans `ui/shots/hud/apres/`).

## Journal

1. **LE ⏸ `#tGear`** (commit 46db9bc) — c'était une plaque de laque PENCHÉE (skew), bande cyan, lueur intérieure, icône en bandes
   cyan + filter drop-shadow. Désormais : face d'encre `--c6-e1`, DROITE, filet blanc 2 px (inset), épaisseur noire 4 px, icône blanche à
   plat ; à l'appui elle descend de 4 px. Même place (règle 5451 intacte : `right:--hudD+4px`, `top:--ccT+8px`), même 48 × 48, même clic.
   Les anciennes règles (2699-2705, 5318-5326) sont en `!important` : dominées par `html.c6 body #tGear` (aussi en `!important`).
2. **LA PLAQUETTE DU POUVOIR `#pwrChip .pw`** (commit 4f76a18) — c'était une laque à coin coupé (`--coupeHP`), bande de couleur à gauche,
   lueur intérieure qui BATTAIT (`k5PwBat` = animation de `box-shadow`, interdite en course). Désormais : encre pleine, filet blanc 2 px,
   à plat ; le nom et le temps en BLANC plein (plus de texte découpé en bandes, plus de `filter` de contour : 2-3 filtres de moins par
   plaquette) ; l'icône et la barre gardent la couleur du pouvoir (`--pc` : c'est du sens). Entrée : `c6PwIn` (opacité + translateX,
   200 ms, sans `filter:brightness` comme l'ancienne `hmPwIn`). `.fin` clignote toujours (opacité). `.cumul` : la barre passe au BLANC
   (elle « brillait plus fort » par une lueur). Ni la place, ni le padding, ni le min-width ne changent.
3. **LES BANDEAUX D'ANNONCE `#engBig .ebTit` / `.ebRuban`** (commit 6cfd03e) — l'étiquette au-dessus du grand mot (« NOUVEAU SOMMET »,
   « NOUVEAU MOTEUR », « + CAPACITE ») était un octogone à pointes (`clip-path:var(--oct)`) ; le ruban du record un bandeau penché de 4°
   en dégradé. Désormais : rectangle d'OR à plat, encre dessus, sans chasse. Le grand mot dessous n'est pas touché.
4. **LA CONSIGNE `#tSteerHint`** (commit 0b82363) — couché elle était contrainte à 100 px (règle 5466 : `width:calc(50% - 46px - hudG - 12px)`,
   `white-space:normal`) → trois lignes. Sans chasse elle fait 19 × 8 = 152 px : UNE ligne, posée au-dessus de l'anneau (`bottom:--ccB+136px`,
   l'anneau monte à `--sB+126` + 4 px quand il respire), départ à `--hudG` (encoche + 14 px). Debout : une ligne, inchangée, sans chasse.
   Blanche (`--tc:#fff`) au lieu de lilas.

## RETIRE / DEPLACE

- Rien n'est retiré. Seul déplacement : la consigne du volant, COUCHÉ, monte de 9 px (bottom 127 → 136 px) et s'étend vers la droite sur une
  ligne (elle occupait trois lignes de 100 px).
- CHANGEMENT DE COULEUR À CONNAÎTRE : l'étiquette de la carte MOTEUR (« NOUVEAU MOTEUR », « + CAPACITE ») était à la couleur du moteur ;
  elle est OR pour toutes (mission : « une étiquette d'or »). Le temps du pouvoir (« 10.3s ») était à la couleur du pouvoir, il est blanc.

## POUR LE SOCLE

- Rien à remonter. (Si le socle veut une « plaquette de HUD » commune : encre `--c6-e1` + `inset 0 0 0 2px var(--c6-b0)`, c'est ce que
  portent maintenant `#tGear` et `#pwrChip .pw`.)

## POUR LES AUTRES

- L'audit `s.boutons()` signale `#tSteer` « DANS LA MARGE » : FAUX POSITIF. `#tSteer` est la ZONE TACTILE du volant (left 0, 54 % de
  l'écran, toute la hauteur, invisible) : elle doit couvrir l'encoche pour que le pouce y soit pris. Ce qui se VOIT (consigne à `--hudG`,
  anneau-fantôme au milieu de la zone, stick qui naît sous le pouce) est hors de l'encoche.
- Session PERF / course : `c6-hud` RETIRE une animation de `box-shadow` (k5PwBat sur chaque plaquette) et plusieurs `filter` (contour du
  temps et du nom des pouvoirs, drop-shadow de leur icône et de l'icône ⏸). Aucun `:has()`, aucun `filter` ajouté.

## VERIFIE (banc quatre.cjs, 2 ouvertures)

- couche 844×390, debout 390×844, i7couche 667×375, marges iPhone, français. 0 erreur JS (seul bruit : une musique du lobby
  abandonnée au JOUER, `net::ERR_ABORTED`). Le ⏸ tapé ouvre toujours le panneau PAUSE et met en pause (3 formats).
- Mesures : ⏸ 48 × 48 à [731,8] couché / [324,55] debout (inchangé), `transform:none`, aucun dégradé, aucun filter ; plaquette de
  pouvoir 112 × 40 (inchangée), fond `rgb(19,22,29)`, filet blanc inset 2 px, `clip-path:none`, animation `c6PwIn` ; étiquette
  « NOUVEAU SOMMET » or `rgb(255,198,43)`, encre dessus, `clip-path:none` ; consigne [61,225 152×8] couché (une ligne, à 10 px
  au-dessus de l'anneau qui commence à y 243 ; x 61 = encoche 47 + 14), [14,776 152] debout, [61,210 152×8] i7couche.
- Syntaxe : 13 scripts, 0 erreur. `git status` propre. Burn-out non touché (CSS seul, dans `c6-hud`).
- NON vérifié : l'anglais en capture (calcul : « SWIPE TO STEER » 14 × 8 = 112 px < 152 ; les étiquettes sont plus courtes ou
  égales), le ruban `.ebRuban` (pas de crochet de banc trouvé pour le déclencher — CSS écrit d'après le code), `.pw.cumul`, `.pw.fin`.

## RESTE / QUESTIONS

Vu sur les captures, PAS traité (hors mission) :
- L'ANNEAU-FANTÔME du volant (`#tSteer::after`, 3820) et le STICK / PATIN (`#tStick`, `#tKnob`, 3823-3828) : tirets cyan
  `rgba(159,232,255,.62)`, dégradés radiaux, lueur cyan floue sur le patin (`0 0 18px rgba(0,234,255,.5)`). Néon + flou + rond.
- La carte « DÉFI RÉUSSI » / ASTUCE (`#misBan`) : coin coupé, bande verte à gauche, case verte à coin coupé, prime en plaquette verte.
- Les cartes de l'AUTO-ÉCOLE (`#coach`) et l'objectif de campagne (`#campChip`) : même plaque à coin coupé (non capturées ici).
- L'étoile de la jauge d'aura et le « ≈ » du flow sont CYAN (icônes pixel : à trancher, c'est du pixel-art de jauge).
- Le « +33 » / « +16 KM/H » qui jaillit de la caisse et le grand mot de la carte moteur (« BICYLINDRE ») : dégradé cyan en bandes
  (mission : « le grand mot ne change pas »).
- La plaquette de pouvoir passe à 45 % d'opacité après 3 s (`hudDiscret`, voulu par Léo) et à 8 % sous une annonce : « encre pleine »
  n'est donc vrai que les 3 premières secondes. Le texte a un contour d'encre dur pour rester lisible. À trancher : la laisser pleine ?
- i7couche (667×375) : avec deux lignes dans la liste d'aura, la consigne du volant passe à ~2 px sous la liste (elle disparaît au
  premier braquage ; avant, ses trois lignes la chevauchaient déjà). Si ça gêne : la masquer tant que `#avList` a des lignes (JS).
- La consigne garde son contour d'encre par `filter:var(--contourP)` (règle 4913, commune à tous les libellés du HUD) : non touché.

## P1 · AUTO-ÉCOLE, LA PREMIÈRE MINUTE (14/10, ticket « première image ») — commit c973a68 sur ui/hud

**Avant** (mesuré au banc, sauvegarde neuve, `ui/shots/hud/p1/avant-*`) : la carte `#coach` faisait 340 × 172 px = 20,4 % de la hauteur debout (390×844),
25,8 % en 375×667, **44 % couché** (844×390 : elle cachait le haut de la caisse et la route devant elle). Textes en pixel 10 px (en-tête, PASSER),
titre 14 px pixel, phrase 14 px système, jauge, pouce de 30 px : cinq blocs empilés.

**Après** : `<style id="c6-hud">` §5, règles `html.c6 body #coach…` (le DOM n'a pas bougé : `.coTop/.coRow/.coTx` en `display:contents`, enfants placés
dans une grille). Encre `--c6-e1`, filet blanc 2 px + épaisseur noire 4 px (comme ⏸ et la plaquette de pouvoir), droite, sans dégradé ni coin coupé.
- Debout : 358 × 76 px = **9,0 %** (390×844), **11,4 %** (375×667). Ligne 1 : icône 18 px · TITRE (système 15 px / 800) · pouce de démo (52 × 18) · PASSER
  (système 12 px / 800, cible 68 × 44 conservée). Ligne 2 : la phrase, système **13 px / 600**. Pied : la jauge des 5 étapes (4 px) + « AUTO-ECOLE · 1/5 » (11 px).
  Même place : `top = marge haute + 62 px`, donc le HUD (jauge, vitesse, ⏸) n'a pas bougé et reste libre ; la route (horizon ≈ y 350) aussi.
- Couché (NON REVU À L'ÉCRAN après le dernier ajustement : la machine était à charge 450-600) : 600 px de large, centrée sous le HUD (x 122-722, y 62 → ~108, avant l'horizon vers y 200) : 12,3 % au 1er jet, ramené à ~46 px
  (rembourrage 4/6, ligne de titre 17 px). La jauge devient un filet de 3 px au bas de la carte. Tout le texte ≥ 11 px (mesuré : minTexte 11).
- Le raté (`.rate`) prend la place du titre en ligne 1, rouge `#ff6b7d` 13 px / 800 ; `.bravo` = vert uni `#1c6b37` ; `.passe`/`.sur` gardent l'or / le rouge.
- Pouce de démo : mêmes pixels, mais trois keyframes réduites (`c6CoGlisse`, `c6CoBord`, `c6CoAppui`) pour tenir dans 52 px.

**JS (court, hors `html.c6` — c'est de la logique d'affichage de la leçon, pas de la physique)** : `tutoTick` (≈ 29893) pose `TUTO.touche=1` dès que `steer`
ou `nitroOn` bouge (remis à 0 dans `tutoDebut`). La sortie de route aux étapes 1-2 replace la caisse comme avant (`sandRevive`), mais le message
« SORTI ! SUIS LA ROUTE » n'est dit que si `TUTO.touche` ET `TUTO.t > 3` (3 s dans l'étape). Sinon : replacement silencieux, la consigne reste la
consigne neutre de l'étape. La vitesse de départ, la courbe et la physique ne sont PAS touchées.

## À TRANCHER (auto-école)
- **Départ lent** : le ticket note 256 km/h au départ dans une courbe. Au banc, sans toucher l'écran, la caisse a roulé 6,5 s sans sortir (mode `drive`
  partout, vitesse affichée 103-149 km/h à t+2 s) : je n'ai pas reproduit la sortie de route de l'éclaireur. Non touché ; si la sortie réapparaît chez
  un vrai joueur, c'est à la session SENSATIONS (vitesse de départ de la leçon 1, ou courbe plus douce).
- Le message d'échec n'a pas pu être provoqué au banc (pas de crochet : les fonctions du jeu sont dans une IIFE). La garde est vérifiée par lecture du code
  et par le fait que l'étape se valide toujours (geste gauche-droite : 1/5 → 2/5, `dbgTuto`).
- `#pwrChip` descend encore de `--hudH + 236 px` (5361, 3830) tant que `body.coOn` : avec la nouvelle carte (≈ 76 px) il y a un trou entre elle et la plaquette.
  Hors mission (« ne change pas le reste du HUD ») ; à remonter si on veut.
- Les libellés viennent du JS en capitales sans accent (« AUTO-ECOLE ») : la police système les accepterait (P2 Accents du backlog).

## NON VÉRIFIÉ À L'ÉCRAN (charge machine 450-640 à partir de 7 h, passes 2 et suivantes annulées)
- Le dernier ajustement couché (rembourrage 4/6 px, `grid-area:auto` sur la jauge-filet, commit c973a68) : la 1re passe (même commit moins ces deux lignes) mesurait 600×48 = 12,3 % avec la jauge mal posée (filet tronqué à 92 px) ; calculé : ~44-46 px (≈ 11,5-11,8 %).
- Les états rares (raté rouge, bravo vert, « VRAIMENT ? », phrase la plus longue sur 2 lignes) et i7couche (667×375) ; la planche `ecole-avant-apres.png` n'est pas faite (elle exige un navigateur). Captures utilisables : `ui/shots/hud/p1/avant-*` et `apres-*` (debout, couché, 375×667 à t = 0,5 / 2 / 4 s). Pour finir : `node ui/banc/hud/ecole.cjs apres couche,debout,i7couche 1 1` (états forcés + geste) quand `uptime` < 40.
