# CASH CAR — Refonte graphique : audit & plan

> Document de travail pour la grosse passe shaders. Rédigé par Opus à partir d'une lecture ligne-à-ligne d'`index.html` (r128).
> Objectif : préparer le terrain SANS Fable (assets lourds), puis brancher Fable quand le crédit revient.

## 0. État du pipeline (ce qui existe déjà — NE PAS refaire)

| Brique | Où | Verdict |
|---|---|---|
| Ciel `skyDome` (ShaderMaterial, dégradé turquoise→or + halo soleil + voile + dither) | `index.html:355-388` | **Solide.** Point d'entrée idéal pour les ambiances. |
| Post : UnrealBloom (seuil 0.78) + ACES tonemap (ShaderPass) | `index.html:462-486` | **Solide.** L'ACES pilote déjà expo + saturation par uniforms. |
| MSAA desktop / RT simple mobile | `index.html:474-476` | OK |
| Éclairage : Hemisphere crème/mauve + soleil directionnel chaud + fill mauve | `index.html:449-451` | OK, statique (1 seule ambiance). |
| Fog chaud resserré en nuage | `index.html:389-390`, `760-763` | OK |
| envMap (CubeTexture procédural, ciel réfléchi) | `index.html:1210-1224` | OK, mais figé (ne suit pas l'ambiance). |
| Matériaux voiture (MeshPhong : body/acc/glass/chrome, envMap+reflectivity par niveau) | `index.html:1245-1249` | **Cible n°1 de la refonte.** |
| Piste (MeshPhong vertexColors + envMap, bandes blanches, ligne centrale) | `index.html:955-999` | Cible n°2. |
| Ombre de contact (blob dégradé) | `index.html:489-496` | OK |
| Speed lines / cam shake / FOV / vignette `#vig` | CSS + canvas | OK |

**Conclusion :** le jeu est déjà loin du « low-poly débutant ». Les vrais leviers sont : (a) faire **vivre** l'éclairage/ambiance, (b) donner de la **signature de surface** aux caisses (rim/fresnel), (c) unifier la **lisibilité** de la piste à grande vitesse.

## 1. Inventaire des matériaux (cibles de refonte, par priorité)

### P1 — Voitures (`buildCar`, `index.html:1237+`)
- `bodyM`, `accM` — MeshPhong, `emissive=color`, envMap, reflectivity montant par niveau.
- `glassM`, `chromeM` — MeshPhong très brillants.
- **Refonte visée :** rim light fresnel (silhouette contre les nuages), reflet anisotrope léger, teinte de reflet qui suit l'ambiance.

### P2 — Piste (`buildTrack` / `strip`, `index.html:955-999`)
- Dalle : MeshPhong `vertexColors` + envMap faible.
- **Refonte visée :** gradient de vitesse/hauteur, liseré émissif des bords (lisibilité + sensation de vitesse), damier animé subtil.

### P3 — Ciel & ambiance (`skyDome` + lights + fog + envTex)
- **Refonte visée :** presets d'heure du jour qui défilent avec les niveaux (uniforms + couleurs lights/fog + expo ACES). Coût quasi nul.

### P4 — Pickups / pouvoirs / plots
- Pièces `coinEdgeM` (`:1416`), pads `MeshBasicMaterial` (`:1013`), cônes `coneMat` (`:531`).
- **Refonte visée :** fresnel discret pour les faire « pop », halo qui bat.

## 2. Effets « gratuits » (pur code, zéro Fable) — par rapport effet/coût

1. **Rim light / fresnel sur les caisses** — `onBeforeCompile` sur `bodyM`/`accM`. ★ rapport max.
2. **Ambiances jour / coucher / néon** — table de presets, lerp sky+fog+lights+expo.
3. **Liseré émissif des bords de piste** — géométrie fine émissive OU teinte des bandes blanches existantes.
4. **Étalonnage dynamique par état** — nitro = pousse froide, fever = or, via `acesPass.uniforms.uSat/uExposure`.
5. **Gradient de vitesse sur la dalle** — mix de couleur des vertexColors selon `vA`.
6. **Fresnel sur pickups/pouvoirs** — même snippet que les caisses.

## 3. Plan de tâches (facile → difficile)

- [ ] **T1.** Banc d'essai shaders (`dev/atelier-shaders.html`). ✅ livré.
- [ ] **T2.** Prototyper le fresnel rim dans le banc (sliders live). ✅ livré.
- [ ] **T3.** Porter le fresnel dans `buildCar` (index.html) + brancher la teinte sur l'état (normal/nitro/fever).
- [ ] **T4.** Table d'ambiances (jour/coucher/néon) + lerp au passage de portail.
- [ ] **T5.** Liseré émissif des bords de piste.
- [ ] **T6.** Étalonnage dynamique par état (nitro/fever) via ACES.
- [ ] **T7.** Gradient de vitesse sur la dalle.
- [ ] **T8.** (Fable) Briefs assets : skybox néon nocturne HD, textures de carrosserie, décor lointain.

## 4. Pièges r128 à respecter (rappel)
- `onBeforeCompile` : injecter AVANT `#include <dithering_fragment>`. Utiliser les varyings `vViewPosition` / `vNormal` fournis par MeshPhong.
- Ne jamais reconnecter l'audio hors bus `MASTER`.
- Ne pas insérer/retirer d'appels `rnd()`/`rr()` dans `buildTrack`/`buildClouds` (décale toute la génération).
- Tout nouvel objet visuel doit être disposé au rebuild (`trackMeshes` / `disposeClouds`).
- Le try/catch de `loop()` masque les erreurs → toujours vérifier la console.

## 5. Briefs Fable (à dégainer quand le crédit revient)
- *(à compléter une fois les ambiances codées, pour que les codes couleur soient figés)*

## 6. GOLDEN HOUR RASANTE — plan lumière/ombres (2026-07-12)

> Constat : le pipeline EST déjà une golden hour (soleil à ~7,6° d'élévation, ACES, bloom,
> fog chaude, hemi crème/mauve). Ce qui manque pour le rendu « rasant cinéma » : de VRAIES
> ombres longues, le rim doré (T3 jamais porté), le contre-jour dynamique, et un split-tone doux.

### T2.5 — Ombres portées longues (LE gros gain) — ✅ LIVRÉ (2026-07-12)
- `renderer.shadowMap.enabled=true` + `PCFSoftShadowMap`, à l'init (jamais à chaud : recompilation).
- `sun.castShadow=true`, ortho serrée ±34 m qui SUIT la caisse (top 30 / bottom −64 pour attraper
  la dalle en PLEIN CIEL, near 40 / far 340, soleil posé à `car + SUN_DIR×160`),
  map 2048 desktop / 1024 mobile, `bias -0.0003`, `normalBias 0.08`.
- ⚠️ **PIÈGE trouvé au banc : `normalBias` est en UNITÉS MONDE** (mètres), pas en texels.
  À 2.0 l'échantillon d'ombre est poussé 2 m au-dessus de tout occulteur → ZÉRO ombre, sans erreur.
  0.08 m ≈ 2,5 texels : tue l'acné, garde l'ombre collée.
- Snap au texel dans le plan lumière (base `SUN_PERP` / `SUN_UP`) → zéro scintillement.
- Casters : `carGroup`, épaves, plots, meute police. Récepteurs : dalle + flancs.
  La dalle ne CASTE pas (règle « deux faces à pleine lumière » préservée ; en face -1 le blob
  de contact reste seul à .85, dessus il descend à .5 — pure occlusion de contact).
- Perf : `QUAL_LOW` → dispose la shadow map et redescend à 1024 (pas de recompile).
- Banc de validation : `dev/atelier-ombres.html` (mêmes réglages, touches 1/2/3 pour les vues).

### T3 — Rim doré (snippet atelier, masqué côté soleil)
- `rimify(bodyM); rimify(accM)` dans `buildCar` : fresnel `pow(1-|N·V|, 3.0)` × `smoothstep(-.25,.55, N·sunView)`
  × `uRimStr .55`, couleur `#ffd9a0`. Uniform `uSunV` mis à jour chaque frame
  (`SUN_DIR.transformDirection(camera.matrixWorldInverse)`).
- Teinte par état (plan existant) : blanc/or normal, cyan nitro, or fever.

### T4-mini — Contre-jour (l'air qui s'embrase)
- `cj = max(0, camDir·SUN_DIR)²` chaque frame : fog lerp `FOG_BASE → #ffe3ba` (×.5),
  `fog.near ×(1-cj×.18)`, `uExposure ×(1+cj×.07)`. À composer AVEC le lerp `cloudInS` existant.

### Post — split-tone naturel (anti-Instagram)
- Dans l'ACES pass : balance des blancs `×vec3(1.045,1,.955)` AVANT tonemap ;
  ombres relevées mauve `+vec3(.018,.012,.028)×(1-smoothstep(0,.30,l))` APRÈS (noirs jamais bouchés) ;
  `uSat 1.12 → 1.07` (la chaleur vient de la balance, plus besoin de pousser la sat).
- Bloom : seuil .78→.82, force .72→.58, rayon .7→.5 (discret, seuls soleil/or/nitro respirent).

### Bitume rasant (1 ligne)
- Dalle `:973` : `specular 0x50606e → 0x8a6f52`, `shininess 34 → 48` → traînée spéculaire
  chaude qui court sur la route vers le soleil (le Phong fait le rasant tout seul, soleil bas oblige).

### Palette golden hour (verrouillée sur le ciel existant)
| Rôle | Valeur |
|---|---|
| Soleil (key) | `#ffb87a` (existant, garder) |
| Hemi ciel / sol | `#ffd9c0` / `#7a6f8e` (existant) |
| Rim | `#ffd9a0` |
| Fog base / contre-jour | `#ffc9a0` / `#ffe3ba` |
| Ombres (split-tone) | lift mauve `≈#2f2a44`, jamais noir pur |
| Spéculaire bitume | `#8a6f52` |

### Ordre (chaque étape testable seule) : T2.5 → T3 → contre-jour → split-tone → bitume.

### ✅ TOUT LIVRÉ le 2026-07-12 — les 5 chantiers sont dans `index.html` :
ombres portées (T2.5), rim doré par état (T3, or / cyan nitro / or riche braquage),
contre-jour fog+expo, split-tone ACES (balance 1.045/1/.955, lift mauve, sat 1.12→1.07,
bloom .58/.5/.82), spéculaire chaud du bitume (`0x8a6f52`, shininess 48).
Validé au banc `dev/atelier-ombres.html` + partie complète sans erreur console.
