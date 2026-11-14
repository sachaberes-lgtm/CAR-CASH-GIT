# LOT MENUS — corrections des menus, du tactile et du HUD (14/11)

Branche `qa/menus` (worktree `~/cash-car/qualite-menus`), partie de `qualite-appareil`. Trouvailles traitées : INTERFACE-AUDIT.json, clé `confirmes`,
n° 11, 12, 13, 16, 17, 18, 19, 21, 24 (numérotées à partir de 0) + le balayage des photos de l'audit (`passation/qualite/photos/interface/`).

L'ORDINATEUR ne change pas : tout ce qui touche l'image passe par des classes de `<html>` posées sur `TEL_NATIF` seulement
(`moteur/mobile-tactile.js`, section « MENUS ET HUD SANS REPEINTE SUR UN VRAI TÉLÉPHONE ») ; les correctifs de logique (11, 13, 24) sont des
corrections de bugs listés, sans effet visible sur l'ordinateur (le 11 ne concerne que la page CONFIDENTIALITÉ, ouverte depuis les réglages de l'app).

Banc : `outils/banc-menus/menus.cjs` (UN Chrome sans fenêtre, muet, iPhone émulé tactile + UA iPhone, `?tel=1`, sauvegarde sans son ;
`--pages index-avant-menus.html,index.html` photographie la même scène avant / après) et ses scénarios `s-*.cjs` (combinés par `c-*.cjs`).
Photos avant | après : `passation/qualite/photos/menus/` (à gauche AVANT, à droite APRÈS).

## Interrupteurs
| `?sans=` | ce qu'il rend comme avant |
|---|---|
| `serierayons` | 16 : rayons de la série sur le grand calque |
| `halofren` | 19 : halo de la frénésie en box-shadow animé |
| `volantfiltre` | 21 : drop-shadow de l'arc et du chevron du volant |
| `inv8` | balayage : INVENTAIRE / MISSIONS à 9 px sur 375 pt |
| `figlache` | 24 : figures tenues non relâchées à l'arrière-plan |

## Par trouvaille

### 11 — CONFIDENTIALITÉ ne défile pas hors garage (FERMER inaccessible couché) — FAIT, VÉRIFIÉ
- `moteur/mobile-tactile.js` : `#confFen` ajouté à la liste du `closest()` du garde-fou `touchmove`.
- Vérifié : écran de MORT après une vraie course (garageOn faux), 844×390, glissé du doigt de bas en haut :
  AVANT `scrollTop 0`, FERMER à y = 417 (écran 390 : hors d'atteinte) ; APRÈS `scrollTop 97`, FERMER visible à y = 320.
  Photo `11-confidentialite-mort-couche-avant-apres.jpg`. Debout (390×844) la page tient sans défiler : rien ne change.
- NON fait (fichier du lot boutique, `economie/achats-store.js`) : fermeture au tap sur le fond / au pivot. Le défilement suffit à atteindre FERMER.
- À juger sur l'iPhone : le défilement à l'inertie dans la WebView (le CSS a déjà `-webkit-overflow-scrolling:touch`, `touch-action:pan-y`).

### 12 — #confFen sous l'encoche en paysage — FAIT, VÉRIFIÉ
- `css/charte-7-details.css` : padding latéral `calc(var(--sL,0px) + 24px)` / `calc(var(--sR,0px) + 24px)`, comme `#serieW`.
- Vérifié : encoche simulée (`--ccL/--ccR = 47px`, les valeurs de `html.telCadre`) : padding 24 px → 71 px, le titre commence à x = 71
  (au lieu de 24, sous l'encoche). Debout : 24 px inchangé. Photo `12-confidentialite-encoche47-avant-apres.jpg`.
- À juger sur l'iPhone : `env(safe-area-inset-left)` réel en paysage (le banc simule par `--ccL`).

### 13 — JOUER d'un joueur neuf depuis l'inventaire / la boutique ignorait l'attente — FAIT, VÉRIFIÉ
- `interface/garage-cadrage.js` : la micro-attente (Promise) est gardée, puis `att9` est respecté comme pour les autres joueurs.
- Vérifié (`s-jouer.cjs`, 390×844, temps entre le toucher de JOUER et `GAR.go`) :
  joueur NEUF depuis la BOUTIQUE : AVANT 247 ms (départ immédiat, porte encore en fermeture) → APRÈS 1 105 ms ;
  joueur normal (témoin) : 863 ms avant, 834 ms après (inchangé). Le neuf part maintenant comme tout le monde (le Mac est chargé : +200-450 ms sur les 650 ms).
- Depuis l'accueil (att9 = 0) : rien ne change. L'inventaire n'a pas été mesuré pour le joueur neuf (même code, att9 = 450).

### 16 — Écran de série : calque de rayons de 240vmax — FAIT, VÉRIFIÉ (html.qmRayons)
- `css/palier-leger.css` §1 : 40vmax au lieu de 240vmax, masque à 54 % au lieu de 9 %. ⚠ La correction proposée par l'audit (40 %) était FAUSSE :
  le masque `circle` va jusqu'au coin le plus loin (169,7vmax → 28,3vmax), il faut 54 % pour garder le même rayon visible (15,27vmax).
- Vérifié : calque 2 026 × 2 026 px → 338 × 338 px (390×844) ; photos rayons figés avant / après identiques à l'œil
  (`16-serie-rayons-avant-apres.jpg` ; les écarts mesurés viennent des cartes animées, pas des rayons).

### 17 — Textes de 6-7 px de la boutique — NON TOUCHÉ (mesuré)
- Les fichiers sont ceux du lot boutique ; j'ai d'abord MESURÉ (`s-petits-textes.cjs` : chaque rayon, 4 formats, feuille d'essai à 8 px posée puis retirée).
- Sur iPhone la boutique est en version A (`html.bqA`) : `.pNav em`, la loupe de peinture (`.pLt i`, `.pLe`, `.pLd`, `.pLj b`), `.bqKdir b` et `.baDesc`
  n'y sont JAMAIS affichés (aucun élément visible, 4 formats) : les remonter ne change rien sur le téléphone.
- Visibles : `.bcK .bcN.n7` (ailes à nom long, 7 px) : à 8 px « PLUMES D'ANGE », « CHAUVE-SOURIS », « BARON ROUGE », « AVION EN PAPIER » DÉBORDENT
  (390 et 375 debout, 667 couché) → la mise en page ne le permet pas. `#bqFigSel .fsNom` (7,5 px, debout) : 8 px tient pour les noms photographiés
  (VIDE, TONNEAU) mais la case fait 58-63 px pour une ligne : un nom de 8 lettres et plus déborderait (TAIL WHIP = 72 px) → laissé.
- Conclusion : rien à remonter sans casser la mise en page ; à reprendre par le lot boutique si on raccourcit les libellés.

### 18 — Réglages en 812×375 : #setCard sous l'encoche — NON TOUCHÉ (faux sur iPhone)
- `#settings` est le panneau de l'ORDINATEUR : il ne s'ouvre que par `#setBtn`, dans `#saveRow` de l'ancien menu, et `body.touch #overlay>*{display:none}`
  (charte-2-ecrans.css:5) le cache sur tout tactile. Sur iPhone les réglages sont `#mSet` (la coque), qui respecte déjà l'encoche.
- Appliquer la correction changerait la largeur de la carte sur un ordinateur en fenêtre étroite (≤ 820 px : `94vw` → `100% - 24px`) : interdit.

### 19 — Halo plein écran de la frénésie repeint à chaque image — FAIT, VÉRIFIÉ (html.qmHalo)
- `css/palier-leger.css` §2 : les DEUX états extrêmes du box-shadow (creux et pic) sont peints une fois, chacun sur un pseudo-élément, et seules leurs
  opacités se croisent au même rythme (.85 s frénésie, 1.15 s armé). Aux extrêmes l'image est exactement celle d'avant ; entre les deux, un fondu.
  (La version des paliers 0-1, plus haut dans le fichier, est gardée pour eux : elle change le creux.)
- Mesuré (trace Chrome de 2 s, 390×844, peintures du nœud #feverGlow et de ses pseudo-éléments) :
  frénésie AVANT 121 peintures (une par image) → APRÈS 0 ; armé 120 → 0.
- Visuel : halo figé à 0, ¼, ½, ¾, 1 du battement sur fond fixe : écart max 2/255 aux extrêmes, 10/255 au milieu (moyenne 1,4/255).
  Photos `19-halo-*.jpg`.
- Coût : deux calques plein écran (au lieu d'un repeint) pendant la frénésie seulement (display:none sinon).
- À juger sur le 13 Pro : la frénésie et la jauge armée en course (l'œil, et la fluidité au pic de vitesse).

### 21 — Filtres des pseudo-éléments du volant sous l'écriture allégée — FAIT EN PARTIE (html.qmVolant), VÉRIFIÉ
- `css/palier-leger.css` §3. L'ARC (`#tKnob::before`, ~80 px, celui qui coûte) : son drop-shadow ne se VOIT PAS — le masque s'applique après le filtre
  et ne garde que l'anneau. Il est simplement retiré. Vérifié : galet copié, agrandi ×4 sur fond fixe, --su = 0 / ½ / 1 : écart moyen 0,14 / 0,34 / 0,57 sur 255, au plus 21/255 sur quelques pixels du bord de l'anneau (anticrénelage) — identique à l'œil (`21-volant-x4-su0-05-1-avant-apres.jpg`).
- LE CHEVRON (`#tKnob::after`, 10 × 10 px, sans masque) GARDE son filtre : sa lueur ronde se voit. Essayé : une ombre de boîte (box-shadow) à la place
  donnait une lueur plus serrée et un coin carré visible à l'agrandi (écart moyen 10/255 dans sa zone) → pas « identique à l'œil », abandonné.
  Son coût est celui d'une vignette de ~16 px.
- Les calques / repeintes du glissé ne se mesurent pas au banc (Chrome ≠ WebKit pour les filtres, et le volant n'existe qu'en course) :
  à juger sur le 13 Pro (glissé du volant en course).
- `#tNitro::before` (backdrop-filter) n'est pas touché : il ne s'affiche qu'avec une icône `?boost=…`, pas la flamme par défaut.
- Autres filtres de pseudo-éléments du HUD repérés, non touchés (statiques, pas dans la trouvaille) : `#nitroBar.inf::before`, `#nitroBar.boost::before`.

### 24 — Bouton de figure tenu jamais relâché à l'arrière-plan — FAIT, VÉRIFIÉ
- `interface/hud-figures.js` : `figRelacheTout()` (tenus = faux, ptr = null, ce que fait lâcher le doigt), appelée au `visibilitychange` caché ;
  `moteur/mobile-tactile.js` : appelée aussi par `iosPose` (pause Capacitor, ccInactif, sortie son). `dbgFig().tenus` ajouté pour le banc.
- Vérifié : touches 1 et 3 tenues → `[true,false,true]` ; événement `pause` → `[false,false,false]` ; retenues puis page cachée → `[false,false,false]`.
- À juger sur l'iPhone : verrouiller le téléphone en tenant une figure, déverrouiller, REPRENDRE : la caisse ne doit plus tourner seule.

## Balayage des photos de l'audit (menus hors boutique)
- Regardé : accueil, réglages, achat, garage, inventaire (4 onglets), missions, profil, plaque, pause, mort (et récompense, série), FR / EN,
  390×844, 844×390, 375×667, 430×932. Puis un passage avec l'ENCOCHE simulée (`s-encoche.cjs`, 4 formats) : aucun texte ni bouton FIXE sous l'encoche
  ou la barre d'accueil (les seuls relevés sont des contenus de listes qui défilent sous la barre du bas, voulu).
- CORRIGÉ : **INVENTAIRE dépasse de son bouton sur les iPhone de 375 pt** (SE, 8) : 10 lettres à 9 px = 90 px dans un bouton de 89 px (debout, collé au
  cadre) ou 82 px (couché : 4 px de chaque côté HORS du bouton). `css/boutons-flottants.css` : sur ces largeurs (≤ 385 px, ou couché ≤ 720 px),
  INVENTAIRE et MISSIONS passent à 8 px (la grille de la police) et le bouton rend ses marges intérieures (`html.qmInv`, `?sans=inv8`).
  Vérifié : 375 debout marge 0 → 5 px, 667 couché −4 → 1 px ; EN « INVENTORY » 9 → 5 px ; 390 et 844 inchangés (9 px).
  Photos `inventaire-*-avant-apres.jpg`.
- Vus, non corrigés : le bouton ACCUEIL du garage est à 6 px (« ACCUEIL » à 8 px = 56 px pour un bouton de 44-58 px : ne tient pas).
  Dans les missions, la récompense « voiture » (LE SCARABÉE, LE COMBI) apparaît vide sur les photos : c'est la photo de caisse prise à la demande,
  que Chrome sans fenêtre ne rend pas (pas un défaut du jeu).
- Les photos « pause » et « pause-réglages » de l'audit montrent l'écran de mort (la course du banc était déjà finie) : la pause n'a pas été revue.

## Ce qui reste à juger sur le vrai iPhone
1. CONFIDENTIALITÉ depuis la pause ou la mort, couché : le doigt fait défiler, FERMER atteignable, rien sous l'encoche.
2. Frénésie et jauge armée en course : le halo bat comme avant, sans saccade.
3. Le volant glissé vers le haut : l'arc s'allume comme avant, le chevron garde sa lueur.
4. Verrouiller en tenant une figure → REPRENDRE : plus de rotation fantôme.
5. Premier JOUER d'un compte neuf depuis la BOUTIQUE : la caisse part après la remontée de la porte.
6. Sur un iPhone SE (375 pt) : INVENTAIRE dans son cadre, debout et couché.
