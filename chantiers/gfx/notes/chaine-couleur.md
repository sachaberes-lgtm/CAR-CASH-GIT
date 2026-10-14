# NOTES — chaine-couleur (passe graphismes, 14/10, 5 h) — ce que voit chaque téléphone, et la chaîne de couleur de bout en bout

Branche `gfx/chaine-couleur`. Banc : `gfx/banc/chaine-couleur/crans.cjs` (une ouverture, 6 pages, image figée, mesures de couleur).
Hook ajouté : `dbgChaine()` — dit ce que CET appareil exécute (palier, cran, DPR, cible 16 f ou 8 bits, halo, piqué, uniformes d'étalonnage).

## VERDICT COURT
- **A (l'iPhone ne voit pas l'image qu'on règle) : VRAI pour la FINESSE et le HALO, FAUX pour l'ÉTALONNAGE.** Les uniformes d'étalonnage
  (exposition, saturation, contraste, balance, split, vignette) sont posés par `bioApply`/`daPose` sans aucune condition de palier ni de
  cran : mêmes valeurs partout. Mais l'iPhone ne calcule pas l'image du banc : 1/4 des pixels (DPR 1 en RAPIDE — le réglage PAR DÉFAUT —
  contre DPR 2 au banc), un piqué de .40 que le banc ne déclenche jamais, et un halo DEUX FOIS plus large à l'écran (corrigé).
- **B (la chaîne est fausse) : pas d'erreur de conversion (ni double gamma, ni conversion manquante) — la chaîne est cohérente mais
  entièrement « en valeurs d'écran »** (three r128, aucune gestion des couleurs). Les vrais défauts sont dans l'ÉTALONNAGE : un contraste
  linéaire à pivot .5 écrêté à 0 SANS pied de courbe (tout ce qui est sous ~25-35/255 dans la scène sort NOIR PUR), puis un plancher coloré
  ajouté par le split-toning, et trois couches de saturation/contraste empilées.

## 1. CE QUE VOIT CHAQUE TÉLÉPHONE
Détection (`const PAL=`) : `?palier=N` > appris en course (`localStorage.cashcarPalier`) > iOS ≤ 15 → 0 > petit banc processeur
(≥ 12,5 ms → 0, ≥ 8,5 → 1, sinon 2) > iOS 16 → ≤ 1. `IS_MOBILE` = tactile sans survol ; `IS_LOW_END` = mobile ou ≤ 4 cœurs.
Résolution : `DPR_CAP = min(devicePixelRatio, RAPIDE ? 1 : 1,5)` (`applyQ`) ; **le réglage par défaut d'une sauvegarde est RAPIDE**
(`c.q=(d.q==='net')?'net':'fast'`) → un iPhone 15 (écran ×3) calcule la course en **844×390**, agrandie ×3 par le navigateur.

| Appareil | Palier | Cran de départ | DPR 3D (course) | Passes | Halo | Ombre | Piqué `uSharp` | Étalonnage |
|---|---|---|---|---|---|---|---|---|
| LE BANC de l'équipe (`dbgQual(0);dbgDPR(2)`) | 2 | 0 figé | **2** (1688×780) | scène → halo (11) → ACES | 5 étages, base 709 px | 1024 douce | **0** | oui |
| iPhone récent (12+), RAPIDE (défaut) | 2 | 0 | **1** (844×390) ; QL peut descendre à .85 puis .7 | idem | 5 étages, base 354 px → 2× plus large à l'écran (AVANT) | 1024 douce | **.40** | oui, identique |
| iPhone récent, NETTE | 2 | 0 | **1,5** (1266×585) ; plancher 1,25 / 1,0 | idem | base 532 px → 1,33× plus large (AVANT) | 1024 douce | .40 | oui |
| iPhone moyen (XR/11) | 1 | 2 | 1 (RAPIDE) | idem, halo 9 passes | 4 étages | 768, simple (PCF) | .40 | oui |
| iPhone 7/8/X | 0 | 5 (ne remonte pas sous 4) | 1 | idem, halo 7 passes, **plus de flou radial** | 3 étages, résolution ¾ | 512, simple | .40 | oui |
| dernier cran (`kMax`, effondrement) | tous | — | .7 (RAPIDE) / 1,0 (NETTE) | scène → ACES | **éteint** (`uBa`=0) : les clairs perdent leur halo | 512 | .45 | oui |
| « Réduire les animations » (iOS) | tous | — | — | scène → ACES | **éteint** | — | — | oui |
| ACCUEIL (VHD) | 2 | 0 | jusqu'à 3 (3,2 M px) ; 1,3 au palier 0 | idem | plein | 2048 | 0 | oui |
| post KO (`composer=null`) | — | — | — | `renderer.render` direct | aucun | — | — | **NON** : scène brute + filtre CSS + calque `#vig` violet .52 — une AUTRE image |
| cible 8 bits (`f16ok` faux) | — | — | — | idem | idem | — | — | oui, mais les clairs sont écrêtés à 1 AVANT l'exposition et l'ACES (blancs plafonnés à ~.80, teintes des clairs faussées) |

FXAA : partout au téléphone (`FXAA_ON`). Tramage `uTrame` 1/255 : actif partout (pas de condition). Grade « téléphone » `GRADE_ACES`
(sat ×1,12, contraste ×1,0185 −.024) : **ce n'est PAS un écart téléphone/ordi** — l'ordi a le MÊME grade par le filtre CSS
`body>canvas{filter:saturate(1.12) contrast(1.05) brightness(.97)}` (l. 369), le téléphone l'a dans le shader. C'est une 3e couche
commune à tout le monde, que le banc (contexte mobile) voit aussi. Les plafonds de la charte doivent la compter (sat réelle = produit × 1,12).

Ce qui n'a PAS pu être établi sans l'appareil : si l'iPhone de Sacha passe bien en demi-flottant (`f16ok`) et à quel palier le banc
processeur le range. → `dbgChaine()` dans la console Safari le dit en une ligne (`cible`, `palier`, `dpr`, `qualite`).
⚠ Le banc de l'équipe lance aussi le petit banc processeur de `PAL` : Mac surchargé (charge 40-60 cette nuit) ⇒ une capture a pu
tourner au palier 1 ou 0 (ombre simple, halo 3-4 étages) sans que personne le sache. Forcer `?palier=2` dans les scripts.

## 2. LA CHAÎNE DE COULEUR, ÉTAPE PAR ÉTAPE (three r128, `outputEncoding`/`toneMapping` jamais posés : 0 occurrence)
| # | Étape | Espace |
|---|---|---|
| 1 | Couleurs (`THREE.Color(0x…)`, `setRGB` des ambiances), textures de toile (`CanvasTexture`, encodage linéaire = lues telles quelles) | valeurs d'ÉCRAN (sRGB) prises pour du linéaire — partout pareil, donc cohérent |
| 2 | Éclairage (Lambert/Phong/Standard), brume, mélanges additifs | calculés SUR ces valeurs d'écran (« gamma naïf ») : sommes de lumières > 1 fréquentes |
| 3 | Cible du composer : RGBA demi-flottant (8 bits en repli) | même espace, non borné |
| 4 | ACES : FXAA/piqué (ou flou radial) → + halo → × exposition × balance | idem, HDR |
| 5 | Tone mapping (ACES sur la luminance, `uVivid`=1 : chroma gardée) | la courbe ACES est appliquée à des valeurs d'écran et sa sortie n'est PAS ré-encodée : elle sert de courbe en S (.18 → .27, .5 → .62, 1 → .80, 2 → .92) |
| 6 | Contraste (pivot .5, écrêté à 0) → saturation → split ombres/lumières (additif) → tunnel/nitro → grade fixe (sat 1,12, con 1,0185) → `roule` (épaule > .86) → vignette → tramage | valeurs d'écran, APRÈS le tone mapping |
| 7 | Sortie : `gl_FragColor=c`, aucune conversion | l'écran reçoit ces valeurs comme du sRGB |
Conclusion : la conversion linéaire→sRGB n'est faite NULLE PART et n'est pas due (rien n'est en linéaire). Pas de double gamma. Passer
à une vraie chaîne linéaire changerait toutes les matières, lumières et ambiances : hors de portée de la nuit, et pas nécessaire.

## 3. LES DÉFAUTS, PAR GRAVITÉ
1. **(A) Le halo dépendait de la résolution** — ses flous se comptent en texels de sa cible, qui suit `curDPR × BLOOM_RES`. iPhone RAPIDE :
   2× plus large qu'au banc ; cran ¾ + DPR .7 : 3,8× ; accueil VHD : plus serré. Effet : un voile laiteux autour des clairs, différent à
   chaque cran. **CORRIGÉ** (commit 133836f, poids des étages redistribués, uniformes seuls).
2. **(A) La résolution par défaut : RAPIDE = DPR 1 sur un écran ×3.** L'image jugée par Sacha a 1/9 des pixels de son écran (1/4 de ceux
   du banc). Ce n'est pas de la couleur, mais c'est la première cause d'une image « pas belle » : crénelage, textures bouillies, piqué
   .40 par-dessus. NON modifié (réglage du joueur + zone OPTIMISATION) — PROPOSITION : NETTE par défaut au palier 2 (`PAL.n===2`), voire
   plafond 2 au palier 2. Essai immédiat pour Sacha : Réglages → IMAGE : NETTE.
3. **(B) Les noirs bouchés** : `c=max(c*uKC.x+uKC.y,0.)` puis le grade fixe `−.02425`. Seuil de noir pur, en valeur de scène :
   midi (con 1,38) **28/255** · nuages soir 27 · ville nuit 25 · ville pluie 29 · orbite 35 · jade midi 17. Tout ce qui est plus sombre
   (dessous de caisse, pneus, ombres portées sur le béton sombre, façades à contre-jour) sort à 0, sans dégradé. Sur un OLED (iPhone) un
   noir pur est un trou. PROPOSITION (non faite : une exponentielle par pixel de plus = surcoût aux paliers 0-1, et ça rouvre les ombres
   des 22 ambiances) : un pied de courbe `c<t ? t·exp((c−t)/t) : c` (t ≈ .06) à la place de l'écrêtage ; ou, GRATUIT (uniforme `uKC`
   calculé en JS) : descendre le pivot du contraste de .5 à ~.35 (seuil de noir 28 → 19/255, mais +.05 sur les clairs : à ré-exposer).
4. **(B) Le plancher coloré** : `c+=uSh*(1−smoothstep(0,.5,l2))` s'ajoute APRÈS l'écrêtage : un noir pur devient `uSh` (midi :
   (−.019,+.030,+.027) → après le grade : (0,.006,.003)). Faible depuis etal-commun (split divisé par 2) ; c'est un voile sarcelle dans
   les noirs, pas un gris. Tenable.
5. **(B) Trois couches multipliées** : saturation = `c.sat × DA.sat × 1,12` (midi 1,40 · soirs 1,65 · ville pluie 1,67 · orbite 1,57) ;
   contraste = `c.con × (1+.06·daCon) × 1,0185` par-dessus la courbe en S de l'ACES. Le 1,12 est figé dans le GLSL et le CSS.
   PROPOSITION : le replier dans `DA` (DA.sat 1.08 → 1.21 à image égale, puis retirer la ligne GLSL et le filtre CSS) pour que les
   plafonds de la charte se lisent sur UN produit.
6. **(A) Le piqué natif .40** (`applyDPR`, `PIQUE_NAT`) : appliqué AVANT le tone mapping, jamais vu au banc (DPR 2 sur écran ×2 → 0).
   Voir les captures `…-dpr1-sansPique` / `…-reel` : à juger à l'œil.
7. **(A) Dernier cran / « Réduire les animations » : halo éteint** → les clairs ne rayonnent plus (écart de luminosité locale).
   Rare (effondrement). Non corrigé.
8. **(A) Repli 8 bits** (`f16ok` faux) : écrêtage avant l'ACES. Impossible à vérifier sans appareil ; `dbgChaine().cible` le dit.
9. Bandes : tramage actif partout ; cible 16 f. Rien à corriger. Halo : seuil .95 (valeurs de scène AVANT exposition), force .46×.815 :
   alpha du halo composé = min(1, 3×force) = 1 → la somme écrêtée à 1 s'ajoute en plein ; pas un voile global tant que le seuil reste ≥ .9.

10. **(A) Un iPhone récent peut être rangé au palier 1.** Le petit banc processeur de `PAL` annonce « ~7 ms sur A15 » pour un seuil à
   8,5 ms, et son verdict est RETENU 7 jours (`cashcarPalier`, src `banc`). Mode économie d'énergie, téléphone chaud ou app qui démarre
   chargée ⇒ un iPhone 13/14 passe au palier 1 pour une semaine : ombre simple (PCF), halo 4 étages, départ au cran 2 (ombre 768),
   accueil à 1,6 M px. À vérifier sur l'iPhone de Sacha : `dbgChaine().palier` / `.palierSrc`. Zone OPTIMISATION — non modifié.

## 3 bis. CE QUI EST DANS LE CODE (2 commits)
- `133836f` — le halo à largeur d'écran constante : dans `UnrealBloomPass.prototype.render` (chemin fusionné), les poids `w0…w4` sont
  redistribués selon `d = log2(HALO_REF / (curDPR × BLOOM_RES))` (`HALO_REF` = 2 = le banc). Poids pour force .375, rayon .44 :
  banc `.243 .234 .225 .216 .207` · NETTE `.299 .241 .228 .217 .140` · RAPIDE `.378 .251 .232 .218 .046` · plancher `.535 .250 .231 .110 0`
  · accueil VHD ×3 `.161 .224 .221 .215 .305`. Somme inchangée (alpha et force identiques). ALLUMÉ (`bloomPass.norme`).
  + `dbgChaine()` et `dbgGfx({haloNorme:0|1})`.
- `c59e71b` — `POST_PIVOT` (.5 = image au bit près) : le pivot du contraste, calculé en JS dans `acesPass.render` (`uKC`). ÉTEINT.
  `dbgGfx({pivot:.35})` pour essayer : seuil de noir pur à midi 28 → ~19/255, toute l'image +(con−1)·.15 (midi : +.057) → à
  compenser par l'exposition de l'ambiance. C'est un essai pour l'équipe d'étalonnage, pas une décision.

## 4. MESURES (banc `crans.cjs`, voir `shots/chaine-couleur/planche-crans.png`)
Une ouverture (6 pages, 0 erreur JS), image FIGÉE par page, écart moyen |Δ| sur 0-255 à l'image de référence (a) = cran FULL DPR 2, réduites à 211×98 :
| couple | palier 2 RÉEL, halo d'avant | palier 2 RÉEL, halo normé | état réel lu par `dbgChaine()` |
|---|---|---|---|
| ville midi | 1,54 | **1,32** | DPR 1 (plafond 1, `qualite:"fast"`), cran 0, cible demi-flottant, halo base 355×164, piqué .40, sat 1,21 · con 1,25 · expo 1,04 |
| jade midi | 2,57 | **1,11** | idem |
| nuages midi | 5,46 | 12,29 ⚠ | idem — ⚠ l'état du jeu a CHANGÉ entre ces deux captures (la jauge du HUD pâlit en même temps, teinte sarcelle générale) : écart non imputable au halo (un halo n'ajoute que du blanc). À refaire. |
⇒ **Même couleur** : l'iPhone récent reçoit l'étalonnage réglé à ±1-2,5/255 en moyenne ; ce qui change, c'est la finesse (DPR 1 + piqué) et le halo — que la normalisation rapproche de la référence (ville −14 %, jade −57 % d'écart).
Palier 0 (c) : ce sont d'AUTRES images (une page par palier, autre instant de course : écarts 13-33 non significatifs) ; à l'œil, même
famille de couleurs (ciel, béton, caisse) ; différence = flou radial absent, ombre dure, halo ¾. Pas d'écart d'étalonnage dans le code.
`ville midi DPR 1 SANS piqué` : sat .366 contre .351 avec piqué (le piqué ne recolore pas). `DPR 1,5 (NETTE)` : identique en couleur.
Pivot .35 (essai, éteint) : +5 à +7/255 sur toute l'image (`planche-pivot-noirs.png`) — la midi n'avait pas de noir pur à cet instant ; l'essai vaut pour les nuits.
Défaut du banc : le masquage du HUD (`body > *` sauf la toile) n'a pas pris — le HUD reste sur les captures (sans effet sur la comparaison).

## POUR LES AUTRES
- Équipes d'ambiance : le halo que vous avez réglé au banc est désormais celui du téléphone ; ne recompensez pas un « voile » en
  baissant `bloomS`. Comptez ×1,12 de saturation en plus de vos produits. Forcez `?palier=2` dans vos scripts.
- OPTIMISATION : `UnrealBloomPass.prototype.render` touché (5 lignes après le calcul des poids `w0…w4`, uniformes seuls, aucune passe).
- Pour revenir en arrière : `bloomPass.norme=false` ou `?halo=large`.
