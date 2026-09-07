# Passation — CASH CAR v1.0 (pour continuer le dev avec Claude)

**À Claude : lis ce fichier, puis `index.html` (LE jeu — un seul fichier HTML/CSS/JS + Three.js r128 via CDN, sans build). Continue selon les demandes de l'utilisateur. Après CHAQUE modif : extraire le `<script>` et `node --check`. Travaille sur une copie locale puis republie (le fichier ouvert dans un navigateur peut être verrouillé).**

---

## Le jeu en bref
Runner arcade 3D de voltige, **mode survie** : une vie, amasser un max d'argent. Chute dans le vide ou > 6 s en l'air (`AIR_MAX`) → **explosion** → game over. Route-dalle épaisse (roulable dessus ET dessous) générée aléatoirement, plongeant à ~45° dans un ciel bleu nuageux. Top 10 en localStorage (`rrLeaders5`), saisie du nom sur record. Titre : **CASH CAR** (favicon 💰, meta description en place).

## Écrans (v1.0, modernisés)
Accueil/game over sur le même overlay : fond verre dépoli (radial + blur), titre dégradé or→rose, tagline, **puce RECORD**, Top 10 en carte arrondie, **touches en pastilles** (`.kc`), bouton **JOUER/REJOUER** pill doré avec hover. `ovSub` = "GAME OVER" (masqué à l'accueil), `tagline` masquée à la mort. `setBestChip()` met à jour la puce record.

## HUD in-game (épuré)
Vitesse, argent façon GTA, niveau/pièces, barre prochaine voiture, jauge nitro (regen orange + réserve bleue), jauge de style/FEVER, minimap, camembert de vol, viseur vert, flèches de virage. **Plus de lueur de bords d'écran** (retirée), **plus de spam de textes** : seuls restent « NOUVELLE ZONE », « NOUVELLE VOITURE », et le verdict de figure.

## Figures = MONSTRE
À l'atterrissage (`tryLand`), les bonus (PERFECT/vrilles/BIG AIR/face cachée ×2/streak) se cumulent **silencieusement** dans `mult`, puis UN verdict s'affiche : `mult≥3.2` → **TRIPLE MONSTRE** (classe `.m3`, 40px rose, 1.5 s), `≥2` → **DOUBLE MONSTRE** (`.m2`), sinon **MONSTRE** (`.m1`), toujours suivi du gain. `trickMsg(txt,tier)` avec tier 1/2/3 (ou `true` = style `big`).

## Route & obstacles
- **Pads turbo** : chevrons blancs qui **défilent** (canvas partagé `updatePadTex(t)` appelé chaque frame) ; **une couleur aléatoire par pad** (tint du matériau, faces assorties).
- **Dos d'âne** (`BUMPS`) : petit saut `hopY/hopV`.
- **Plots orange** (`CONES`) : slaloms en quinconce + lignes de bord ; percutés → ils **valdinguent** (`FLYCONES`), étincelles, -1.5 % vitesse, +2 style.
- **Flaques d'huile** (`OILS`) : **rares** (pas ~620-1380 m + 40 % d'annulation), placées **uniquement en ligne droite** (`T[i-40]·T[i+40] > .995`) **et jamais en montée** (`T.y ≤ .04`) pour rester visibles. Disque sombre glacé (Phong shininess 320) + halo irisé violet. Rouler dessus → `slipT=.75` : direction ×0.18 + embardées aléatoires de `psi`, long crissement, cooldown `oilCd=1.2`.
- **Rebond de flanc** : en vol, percuter la TRANCHE de la dalle ne traverse plus — réflexion amortie (×.72), 2-6 morceaux (`dropChip`), thud+froissement, la caisse repart dans le vide (pas d'explosion). Cooldown `sideCd`.

## Feu (design v1.0)
Trois couches, particules **rondes** (texture disque flou `puffTex` sur tous les pools) : `flames` (corps), `flameCore` (cœur clair), **`embers`** (braises fines qui montent, `updatePool(embers,dt,4.5)`), origine/poussée/durée aléatoires. Jet aérien = panache conique 5 part./frame + braises + étincelles bleues. Backfire au lâcher >140. Couleurs bleu si réserve nitro.

## Voitures (14) & économie
`CARS` 0-13 : Épave → Lambo → **Formule Dorée 🏎️ → Proto Néon → Fusée de route 🚀 → COMÈTE 👑** (657 km/h). Lvl 10+ : `glow` = bandes lumineuses, `rocket` = double booster à tuyère. `DENOMS`/`THRESH` sur 13 paliers (jusqu'à 1e14/6e15). `ENGINES` : 14 sonorités. Verrous : `level<13`, `Math.min(level,12)`, HUD `/ '+CARS.length`.
Gains : pièces ×5, figures ×6·fallT·mult, zone ×50 (valeurs « d'origine » validées).

## Pluie de devises
`money ≥ nextRainAt` (départ 1e4, ×10 ensuite) → `startMoneyRain()` : 3 s de sprites $ € ¥ £ ₹ ₩ ₽ ฿ ₺ ₪ ₫ ₴ ₦ ₱ ¢ (glow coloré, sarabande sinusoïdale, rotation, fondu). **Sans texte à l'écran** (fanfare seulement). Reset dans `resetGame`.

## Ciel & nuages
Fond dégradé bleu ; **nuages = sprites duveteux** (3 textures peintes par superposition de bouffées radiales, base plate + bourgeons + sommets), ~42/zone, surtout **sous** la route (Nn -170..+80), opacité .75-.95, fondu par la brume.

## Audio
Moteur par voiture, vent, crissement, **réacteur 3 couches** (souffle bandpass + grave 150 Hz + turbine sifflante) avec **allumage** (pop+montée à l'enclenchement en vol) et crépitement d'afterburner. SFX : blip combo montant, subBoom+thud, fanfare, portail, explosion en couches, jet.

## Nettoyages faits en v1.0 (ne pas réintroduire)
memeTexs/MEMES, nitroTex, CSS `#timer` + `elTimer`, `timeLeft`, `accelT`, lueur `edgeGlow`, bloc visuel grind + `grindOn/grindRoll/grindPay`. Scanlines adoucies (.22). `dropChip` crée ses propres matériaux (dispose sûr).

## Constantes de réglage
`ROAD_HALF=14, THICK=2.6` · `GRAV, FALL_G=33, AIR_MAX=6` · `SPD=0.5` · `TURN_HS` · `AIR_ASSIST` · `CAM_SHAKE_V` · densité plots (`sp+=170+rnd()*260`) · densité huile (`620+rnd()*760`, `rnd()<.4 continue`) · glissade (`slipT=.75`, direction `.18`) · seuils MONSTRE (`2`, `3.2`) · pluie (`nextRainAt=1e4`).

## Préférences utilisateur
Voiture lourde, caméra sobre, jeu exigeant mais vol lisible ; adore le juice (explosion riche, billets, braises), l'argent **démesuré**, les célébrations aux paliers ; déteste le spam de texte et le surchargé — préférer UN gros verdict. Tout réglable en une constante. Itère beaucoup sur le feeling : proposer des valeurs.
