# LOT « VOILES » : les voiles plein écran du HUD (17/11)

Suite de `hudcouches.md` (« ce que j'ai appris », point 1). En course, WebKit garde des couches DOM **plein écran visibles** qui ne contiennent qu'un dégradé :
la vignette de vitesse `#speedFx` (toujours là en course, opacité 0,2-0,6), le voile d'encre du haut `#hud::before`, la lueur du flow `#flowGlow`, les bords
des pouvoirs `#pwrFx`, le coup de couleur de l'annonce `#flash9`, le voile du nuage `#cloudFx`. Sur l'iPhone, chacune est peinte à l'échelle ×3
(1170×2532 ≈ 3 M px, 11,3 Mo), six fois la toile du jeu. Le compositeur relit cette image à chaque image.
Objectif : moins de pixels à relire, **sans perte d'image visible**.

Branche `qa/voiles` (partie d'`origin/qualite-appareil`), worktree clairsemé `~/cash-car/qualite-voiles`.

## Les pistes, une par une

### a) Les voiles au tiers — POSÉ par défaut (`html.voiles`, vrai téléphone, `?sans=voiles` = comme avant)
Chaque voile en dégradé est posé dans une boîte au **tiers** de sa taille, agrandie ×3 par `transform` (`css/interface-opti.css` §7, `moteur/cadence.js`).
WebKit peint la couche à la taille **avant** transformation ; le GPU l'agrandit en filtrage linéaire. Un dégradé linéaire ou radial agrandi reste le même dégradé.
- Posé sur : `#speedFx`, `#cloudFx`, `#flash9`, `#hud::before`.
- `scale(3.001)` et pas `scale(3)` pour les trois premiers : 844/3 n'est pas un compte rond, la dernière ligne d'écran restait à moitié couverte (écart 4/255 sur
  la ligne du bord). 0,03 % de dégradé en plus : écart 1.
- `#hud::before` : hauteur = l'ancienne formule ÷ 3, `scale(3.001)` aussi (couché, 844/3 : la dernière colonne sous le voile restait à moitié couverte, écart 3).
- Aucun autre `transform` sur ces éléments, pas d'enfants : rien de fixe n'est capturé. Opacité, animations, transitions restent sur l'élément.

### a') Les lueurs en ombre interne au tiers — ÉTEINT (`?plus=voilesombres`, décision de Sacha)
`#flowGlow` et `#pwrFx` sont des `box-shadow: inset` floues. Au tiers (flous et étalements ÷ 3), WebKit ne floute pas pareil : **écart jusqu'à 8-9/255** (flow)
et **6/255** (pouvoirs) à pleine opacité, sur la bande floue. Essayé : ×2 (7 et 5), flou corrigé ×0,9 / ×1,1 / ×1,2 (pire). Gain si accepté : 2 × 11,3 Mo → 2 × 1,26 Mo
quand le flow et un pouvoir sont là.

### b) Fusionner `#hud::before` et la vignette — NON FAIT (raisonné)
Leurs opacités vivent séparément (vignette : vitesse, 0,01 par pas ; voile du haut : HUD calme, mort, `coOn`, avec transition). Une seule couche obligerait à
REPEINDRE le dégradé fusionné à chaque changement de vitesse (une peinture de couche entière au lieu d'un changement d'opacité au compositeur). Après a), les deux
couches pèsent 1,26 + 0,28 Mo : il n'y a plus rien à gagner en mémoire.

### c) Retirer de l'arbre les voiles à 0 — DÉJÀ COUVERT par hudcouches
`#speedFx #cloudFx #flash9 #flowGlow #pwrFx` sont dans la liste du voile de `hudcouches` (`visibility:hidden` à opacité 0) ; `#pwrFx` passe en plus en
`display:none` hors pouvoir. Mesuré : au HUD calme, aucun voile ne reste visible (11,3 Mo = la racine seule, avec ou sans le lot). Rien d'autre à faire ici.

### d) La vignette de vitesse dans la passe de sortie WebGL — ÉTEINT (`?plus=voilesgl`)
`rendu/triptyque-bloom.js` : uniforme `uSfx`, une ligne après la vignette du niveau (même dessin que le CSS : ellipse « coin le plus loin » centrée,
transparente jusqu'à 42 %, puis `rgba(45,20,55,.55)` linéaire). `moteur/boucle-6-hud.js` : `uSfx` = l'opacité que la boucle donnait à `#speedFx` (0 hors course,
à la mort, au garage, en « réduire les animations »), et `html.voilesGl` cache `#speedFx` seulement si la passe de sortie tourne (`POST_ON && acesPass`).
**Pourquoi éteint** : l'ordre change. La vignette passe SOUS les traits de vitesse (`#slCv`), le jus, le voile du nuage et la trame `#scan`, qu'elle assombrissait
aussi. Elle est aussi calculée à la résolution de la toile (DPR 1,25), puis agrandie. Gain par rapport à a) : une couche plein écran de moins à mélanger (la relecture
de 1,26 Mo et 3 M de fragments par image).
Le voile du haut `#hud::before` n'a pas été mis dans le shader (il est au-dessus de tout sauf du HUD : même problème d'ordre, et il ne pèse plus que 0,28 Mo).

## Prouvé (bancs du 17/11, Mac chargé : compteurs et photos, aucun chrono)
### Identité au pixel, voile seul (WebKit ×3, `voiles-ident.cjs`, fond rayé, opacité max du jeu)
| voile | debout | couché |
|---|---|---|
| `#speedFx` (op .6) | max **1** | max **1** |
| `#cloudFx` (op 1) | max **1** | max **1** |
| `#flash9` (op 1) | max **1** | max **1** |
| `#hud::before` | max **1** | max **1** |
| `#flowGlow` (ombres, op 1) | max 8 (68 157 px > 2) | max 9 |
| `#pwrFx` (ombres, op 1) | max 6 (406 276 px > 2) | max 6 |

### Le jeu dans WebKit (`voiles-webkit.cjs`, ×3, A/B dans la même page)
Photos : animations en pause, boucle du jeu arrêtée ; paire témoin (sans/sans) = 0 px sauf mention.
| état | debout : écart max (px ≠) | couché : écart max (px ≠) |
|---|---|---|
| course | **2** (35 593) | **2** (48 028) |
| HUD calme | **0** | **0** |
| annonce | **2** (57 493) | **2** (46 550) |
| nitro + flow + pouvoir | **2** (79 104) | **2** (63 948) (témoin bruité, la paire avec→sans est nette) |
| pause | **1** (5 334) | **1** (3 483) |
| mort | aucun voile visible (mêmes couches avec/sans) ; photos inexploitables : l'écran de série de connexion se construit par minuteries pendant les photos (témoin 250) |

Mémoire des couches visibles plein écran + voiles (Mo), avec → sans `html.voiles` :
| état | debout | couché |
|---|---|---|
| course | **38,0** ← 49,0 | **25,7** ← 40,4 |
| annonce | **25,4** ← 37,7 | **25,7** ← 40,4 |
| nitro + flow | **25,4** ← 37,7 | **25,7** ← 40,4 |
| pause | **36,7** ← 49,0 | **37,0** ← 51,7 |
| calme / mort | inchangé (11,3 / 33,9) | inchangé |
Par couche : `#speedFx` 11,30 → **1,26 Mo** ; `#flash9` 11,30 → **1,26** ; `#hud::before` 2,55 → **0,28** (couché 0,58). La racine (11,3) et `#tPanel` (pause, 11,3) ne bougent pas.
Le **nombre** de couches ne change pas (les voiles restent des couches, et leur surface À L'ÉCRAN aussi : le mélange touche les mêmes pixels). Ce qui baisse,
c'est l'image que le compositeur relit pour les peindre : 9 fois moins d'octets par voile. Sur une puce à tuiles (iPhone), le mélange se fait dans la tuile ;
la lecture de la texture, elle, passe par la mémoire : c'est ce qui baisse.

### Avec `?plus=voilesombres` (lueurs au tiers, éteint)
Course debout : **14,1 Mo** ← 60,3 ; annonce et nitro + flow 16,6 ← 49,0. Photos : écart max **5** (course, annonce), **6** (nitro + flow), 1 (pause).

### Avec `?plus=voilesgl` (vignette dans le shader, éteint)
Course debout : la vignette DOM n'est plus une couche (12,8 Mo ← 37,7 au même instant). Photos : écart max **16** (course), 24 (annonce), 26 (nitro + flow),
2 (pause) : la vignette n'assombrit plus les traits de vitesse et le reste posé au-dessus de la toile. HUD calme : 0 (corrigé : la vignette du shader suit
`body.hudCalme`, d'un coup au lieu de la transition de 0,45 s).

### Le code
Assemblage `--depuis-morceaux` OK ; `node --check` du gros script OK ; `garde-demarrage`, `garde-allege`, `garde-charte` OK.
Photos avant/après (non commitées, > 300 Ko) : `passation/qualite/photos/voiles/` (`vo-<format>[-ombres|-gl]-<état>-avec|sans.png`), toutes dans
`~/cash-car/qualite-voiles-banc/jeu/`.

## NON prouvé
- **Rien sur le téléphone.** Pas d'images par seconde, pas de chaleur.
- WebKit du Mac ≠ WebKit de l'iPhone : que iOS peigne lui aussi la couche à la taille avant transformation (pas de « contents scale » relevé par la
  transformation) n'est vu que sur le Mac. À vérifier dans l'onglet Couches de Safari (voir plus bas). Si iOS repeint à ×3, le lot ne gagne rien mais ne perd rien.
- Le gain en chaleur : la relecture de 3 × 10 Mo par image en moins est un ordre de grandeur, pas une mesure.
- L'écran de mort : non photographié proprement (minuteries), mais aucun voile n'y est visible.

## À regarder sur le 13 Pro
1. Safari → Développement → l'app → onglet **Couches**, en course : `#speedFx` doit peser ~1,3 Mo (et non 11,3), `#hud::before` ~0,3 Mo. Avec `?sans=voiles` : 11,3 / 2,5.
2. À l'œil, en course, nitro, annonce (BOOST, CHAÎNE), dans un nuage, en pause : la vignette, le voile du haut, le coup de couleur, le voile blanc du nuage
   identiques ; pas de liseré au bord droit ou en bas de l'écran, debout et couché.
3. Banc de chaleur `outils/banc-chaleur` : deux séries, `?sans=voiles` puis par défaut, même condition (branché, économie, chaud) ; comparer le budget
   thermique (`pymobiledevice3 syslog live`, nfcd) et les images par seconde au palier tenu.
4. Pour décision de Sacha : `?plus=voilesombres` (lueurs du flow et des pouvoirs un peu moins douces sur leur bord flou) et `?plus=voilesgl` (vignette sous
   les traits de vitesse). Voir les photos.

## Bancs
- `outils/banc-hud/voiles-ident.cjs` : WebKit ×3, chaque voile plein puis au tiers, sur un fond rayé chargé, opacité maximale du jeu, debout et couché.
  `F=2 SC=2.001 K=flowGlow,pwrFx BK=1.1` pour les essais sur les ombres.
- `outils/banc-hud/voiles-webkit.cjs` : le jeu dans WebKit (parcours de `couches-webkit.cjs`). À chaque état : couches plein écran / voiles visibles et leur
  mémoire AVEC et SANS `html.voiles` dans la même page ; photos animations en pause (`document.getAnimations().pause()`, banc seulement) et jeu à l'arrêt
  (`dbgStep`), avec une paire témoin pour le bruit. `--ombres 1` ajoute `voilesOmbres`. `--photos 1` écrit les photos.
