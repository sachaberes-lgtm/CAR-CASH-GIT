# NOTES — garage-lumiere (passe graphismes, 14/10) — le GARAGE sort du néon

Branche `gfx/garage-lumiere` (7 commits, tous derrière `GARAGE_V`, `?sans=garage` = le garage d'avant). Planche : `shots/garage-lumiere/planche.png` (AVANT | APRÈS, couché 844×390 et debout 390×844, LA HONTE et LA SILENCIEUSE, `?palier=2`, DPR 2, interface visible). Bancs : `banc/garage-lumiere/` (`duo.cjs` avant/après en UNE ouverture, `p1-p3.json` préréglages à chaud, `commits.py`).
Coût : 0 texture, 0 lumière, 0 appel de dessin de plus (valeurs de couleurs/intensités ; les canvas repeints gardent leur taille). Boutique de Léo : capture avant/après identique (`bqBio` hérite désormais de `ATELIER_V0`, l'atelier d'avant).

## Éléments et auteurs (git log -S)
| Élément | Où | Auteur / origine | Traitement |
|---|---|---|---|
| Plateau, anneau fin (`GAR.ring`), fanions, murs, sol, tubes | `buildGarageRoom` | commit 6541278 (compte sachaberes-lgtm, 25/09, atelier de Sacha/Léo) | anneau cyan → or pâle ; fanions → or/crème/blanc ; murs et sol éclaircis |
| Anneau de LED, halos plateau/sol, bandes LED, balayage du scanner | `buildGarageRoom`, `garBeaute` (0c9603f « atelier v2 », 30/09, demande de Sacha, atelier « sobre » de Léo) | idem | LED blanc chaud ×.6, halos crème/acier, balayage chaud |
| Porte (liseré rose, bandeau rose, gyrophares) | LA PORTE v2 (Léo, 04/10) | Léo | forme intacte ; rose → ambre (liseré, bandeau) |
| RIDEAU DE FLAMMES (la « lave ») + flammes en cubes + nappes de lueur | `garFeu`, `garFeuCubes`, `garBeaute` (6ab584b et e1fcaf2, compte « Claude » = session de Léo) | **LÉO** | forme et idée intactes ; matière −16 %, nappes d'orange ×.7 (« bavure ») |
| Enseignes CASH CAR / $, affiches | `buildGarageRoom` | atelier v1 | enseignes or/crème |
| Distributeur à losanges de couleurs (`vendTex`) | `buildGarageRoom` | atelier v1 | laissé : un objet, pas un éclairage |
| Lampes `stallKey`/`stallRim`, biome `atelier` | `garageRender`, `BIOMES.atelier` (94d62d6, vague 2) | atelier | contre-jour bleu-nuit doux (avant cyan), gains clé 1,3 / contre-jour 1,5 (`GAR.V`), ambiance relevée |

## Ce qui a changé (par cible, verdict à l'image)
- (a) Lisibilité : `BIOMES.atelier` hemiI .32→.97 (ciel bleu-gris neutre, sol encre), sunI .5→.92 (clé chaude), fillI .14→.26 (bleu-ardoise, plus de cobalt), kick magenta .08 → ambre .05, expo .82→1.04, sat 1.35→1.15, con 1.20→1.12, vignette violette (#1c0430-ish) → encre bleu-nuit `[.02,.03,.075]` ×.26 ; émissifs murs/plafond/sol remontés (0x1b212f, 0x0a0f1a, 0x0a1020) ; ombres sous la caisse et au pied des murs `#1c0430`/`#06030e` → bleu-nuit `#0a1226`/`#050a18`. Verdict : murs, étagère, établi, pneus se lisent ; plus de violet. 
- (b) Disque : anneau fin 0x5ff0ff → 0xf2deb4 (or pâle), anneau de LED → blanc chaud, halo sous la caisse → crème, halo au sol → acier clair. Liseré fin, discret. OK.
- (c) Guirlande : or/crème/blanc/ocre au lieu de rose/cyan/jaune/vert (tranché : on la garde, désaturée — elle fait « fête d'atelier » sans néon).
- (d) Caisse : clé ×1,3, contre-jour ×1,5 (bleu-nuit côté salle, braise face au feu). Elle est l'objet le plus net ; la caisse blanche ne brûle pas.
- (e) Lave : −16 % de matière, nappes ×.7 : elle reste le point chaud mais ne mange plus la caisse.
- Retiré (règle 9) : aucun essai gardé qui ne se voyait pas ; le préréglage « murs 0x26304a + hemi 1,0 » a été écarté (murs lavande).

## ⚠ CAUSE RÉELLE DU « NOIR BOUCHÉ » À DROITE : le CSS de l'interface (POUR LES AUTRES)
Couché, `html #garage::after` (≈ l.3555, média `orientation:landscape and max-height:540px`) pose un dégradé `rgba(7,5,15,.96→.86→0)` sur 52 % de la largeur (≤ 460 px), à droite — derrière les boutons. Mesuré : le pixel du mur de droite reste (13,12,26) quel que soit l'éclairage 3D. Même sans lui, la salle 3D est lisible (capture `apres3-f2-blanche.png` = scrim masqué au banc : mur de droite, pneus, anneau jaune se lisent). Je n'y touche pas (zone INTERFACE). Proposition : alpha .96/.86 → ≈ .55/.35 et teinte encre bleu-nuit `rgba(8,12,24,…)` (aujourd'hui violet-noir 7,5,15) ; idem `::before` du haut et `::after` du bas en portrait.
Autres résidus d'interface vus : puces bleu-violet de l'étoile (« ★ 0 »).

## Autres remarques
- `nitroLight.setHex(0xff4fb0)` (~l.43934, remonté par neon-residuel) est dans le chemin du TITRE/chute (`menuVitrine`, MENUV), pas dans l'atelier : le garage utilise `atelierLampes` ; aucune dominante magenta sur la caisse ou le sol au garage (captures). À traiter par le titre.
- Le pavé violet fin au-dessus du rideau de feu = le dessous de la porte relevée (laque indigo de Léo) : bandeau rose passé à l'ambre, laque indigo laissée (proposition : `#2f2a4d`/`#1d1a31` → acier `#2c3340`/`#1c212b`).
- Banc : `dbgGarObj()` (une ligne) expose `GAR` ; `GAR.V={cle,rim}` règle les gains à chaud. `dbgEquipe(i)` change la caisse sans rafraîchir l'étiquette DOM (« LA HONTE » reste affiché sur la planche pour la caisse blanche).
