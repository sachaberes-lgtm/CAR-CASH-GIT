# NOTES — orbite-finitions (passe graphismes, 14/10) — SESSION COUPÉE (migration de machine) : constat AVANT seulement, AUCUN changement de code, AUCUN commit
Branche `gfx/orbite-finitions` (wt/orbite-finitions) : `git status` propre, 0 commit à moi. `ORBITE2_V` jamais posé.
Banc : `banc/orbite-finitions/capture.cjs <tag> [query]` (4 couples + debout midi en UNE ouverture, `?palier=2`, HUD visible, 8 s après le départ). Captures AVANT : `shots/orbite-finitions/avant-{midi,matin,soir,satellites,midi-debout}.png`. 0 erreur JS.

## Constat AVANT (mesuré : uniformes réels + L* de la route sur le tiers bas, lstar.py ; DPR 2)
| couple | ambiance lue | sat réelle | con réel | expo | hemiG | L* route G / D (moy ; 5e centile) |
|---|---|---|---|---|---|---|
| matin (Terre) | espaceMatin | 1,123 | 1,251 | .763 | .22,.32,.55 | 36,2 / 40,9 (25,9 / 26,7) |
| midi (Mars) | espace | 1,123 | 1,251 | .731 | .22,.32,.55 | 41,3 / 44,0 (30,1 / 26,7) |
| soir (Jupiter) | espaceSoir | 1,102 | 1,251 | .739 | .20,.28,.50 | 38,1 / 35,4 (14,7 / 24,4 ; le 117 de bleu à G est le liseré/ombre) |
| satellites (Saturne) | espace (même que midi) | 1,123 | 1,251 | .730 | .22,.32,.55 | 39,5 / 43,2 (28,9 / 26,7) |
Ciel haut L* 18-24 (vide non noir pur : la couche de nuit/ombre ne lave pas, mais le haut n'est pas noir profond).

### Jugement à l'image (midi Mars, satellites Saturne vus)
- (a) REBOND : `hemiG` bleu de Terre [.22,.32,.55] et `fillC` bleu sur TOUS les couples, y compris sous Mars (rouille) et Saturne (or pâle). Incohérent : le flanc des caisses/satellites rebondit en bleu sous une planète orange/or. À corriger : par planète.
- (b) ROUTE : béton gris clair presque uniforme, l'écart gauche/droite n'est que de 2-5 L* (la clé rasante vient de la gauche de l'image) ; seule l'ombre noire de la caisse modèle la chaussée. La route étant un plan, N·L est constant : le modelé ne viendra que de la baisse de `hemiI`/`fillI` (ombre plus noire) et de la hausse de `sunI` (clé plus dure), pas du shader (interdit).
- (c) Caisse orange : plus saturée que Mars (Mars est un orange rouille assez vif au midi, demi-disque large, à surveiller : le grade le rallume) — pas de régression vue.
- (d) Plafond charte atteint côté con (1,25 < 1,32) mais SAT 1,12 > 1,15 charte « satellites » ? non : 1,123 < 1,15, OK ; soir 1,10 OK.
- (e) Étoiles/noir : OK, noir teinté propre, pas de brume. Ciel haut non bouché.

## FAIT / PAS FAIT
- Fait : constat AVANT par couple, banc, mesures.
- PAS fait : toute correction de valeurs, la planche AVANT|APRÈS, les 4 commits, l'interrupteur `ORBITE2_V`.

## Valeurs envisagées (non testées — à vérifier à l'image avant de les poser)
1. Découpler Saturne de Mars : les deux lisent `espace`. Créer `BIOMES.espaceSat` (copie de `espace`) et `SF_CARTES.espace.m.satellites.bio='espaceSat'`, posés APRÈS la ligne `SF_CARTES.espace.m.satellites.astre=…` (SF_CARTES est une const déclarée après le bloc ÉTALONNAGE · EN ORBITE : TDZ si on l'écrit plus haut). `sfNiveau` lit `M.bio||B.bio[0]`, aucun code ne teste le nom `'espace'` de BIO.
2. Rebond par planète (hemiG / fillC / env bande .58 + eS2) : Terre (matin) bleu-gris plus gris [.20,.28,.42] ; Mars (midi, `espace`) rouille sombre [.30,.15,.10] (fillC [.55,.28,.18]) ; Jupiter (soir) ambre [.30,.20,.10] (fillC [.6,.4,.2]) ; Saturne (`espaceSat`) or pâle [.30,.26,.16] (fillC [.6,.52,.32]). La caisse orange doit rester plus saturée que Mars/Jupiter : ne pas monter `sat`.
3. Modelé de la route : `sunI` +10 % (2,05 → ~2,25 midi), `hemiI` .50 → ~.38 et `fillI` .40 → ~.30 (ombres plus noires, bleutées), `rtK` en dernier recours ; objectif écart L* clair/ombre ≥ 8-10 sans descendre sous L* 32 côté lumière. Vérifier que le 5e centile de L* reste > 6.
4. Tout derrière `const ORBITE2_V=!/[?&]sans=([^&]*,)?orbite2(,|&|$)/.test(location.search);` (une ligne `if(ORBITE2_V)Object.assign(BIOMES.xxx,{…})` après chaque ligne existante).

## POUR LES AUTRES
- Aucun changement ; la répartition des planètes (Terre/Mars/Jupiter/Saturne) est inchangée.
