# NOTES — neon-residuel (passe graphismes, 14/10)
Branche `gfx/neon-residuel`. Interrupteur : `const NEON_V=!/[?&]sans=([^&]*,)?neon(,|&|$)/.test(location.search);` (déclaré juste avant `skyU`). `?sans=neon` = l'image d'avant.
Banc : `gfx/banc/neon-residuel/ab.cjs` (une ouverture, avant puis après, scénarios orage/pluie/nuit/vmidi/nmidi/debout, HUD masqué, mesures), `ciel.cjs`, `diff.cjs`, `planche.cjs`.
Captures : `gfx/shots/neon-residuel/r1..r3/`, planche AVANT | APRÈS : `gfx/shots/neon-residuel/planche.png`.

## A. Nitro (commit 1fa1a8c)
Ce que le banc a montré : le violet de l'image à 1 000 km/h+ vient de la NITRO INFINIE (pouvoir, `pwrNitroT>0`) : bords et onde en `NINF.jet` #9d4dff, lumière `NINF.lum` #a050ff qui baigne la caisse et la route. La nitro orange ordinaire et la réserve bleue ne virent pas au violet dans le monde.
Changé (tout derrière NEON_V) :
- `NFX_C` (nouveau) : or #ffcf8a, réserve bleue froide désaturée #aebfd8 (teinte 215°), nitro infinie blanc-or #ffe3bd (la plume `NINF.jet` n'est PAS touchée), pad #ffd98a. Sert aux bords, à l'onde (`NFX.col`), à `nitroAllume`.
- `eT` (force des bords) .30/.36 -> .28/.26 (pad .14 -> .12) ; coup d'allumage `uNitF` .7 -> .4.
- ACES, lueur de bord : `smoothstep(.36,.74,r)` -> `(.46,.80,r)` : part de l'image recolorée (écart ≥ 6/255) calculée sur le shader : 42 % -> 16 % (≥ 14/255 : 30 % -> 9 %). Une constante de shader, zéro lecture.
- filés : `spr.b` (178,196,255) -> (176,190,212), `spr.c` (255,208,160) -> (255,226,184).
- `nitroLight` : réserve bleue #5b7dff -> #aebfd8 ; nitro infinie #a050ff -> blanc-or ; liseré de caisse `RIM_U` de la réserve #a9b8ff -> #b9c5dc ; racine du brûleur `uRac` #c9b8ff -> #c6d0e6.
- Intacts : NYAN.on (arc-en-ciel), NINF.jet/core/rac/trail (plume, ruban, braises), HUD, jauge, #speedFx, flashEcran DOM.
Vu à l'image (planche) : ville midi nitro infinie (debout et couché) : la caisse redevient orange, la route neutre ; plus de reflet violet. Réserve bleue : onde blanc-froid, bords sans couleur. Nitro orange : à peine différent (le monde ne virait pas).
Coût : zéro texture, zéro passe, zéro échantillon, aucune uniforme.

## B. Ciel de la ville orage / pluie (commit 2)
- Plafond `villeLisse` : `vec3(.06,.02,.06)*nuit` -> `vec3(.045,.03,.03)*nuit` (mêmes luminance : L 43) : chroma 14 -> 9, teinte 281 -> 245 (ardoise) en calcul pré-tonemap. Éclair de grosse caisse `(.5,.45,.75)` (Lab C 25 teinte 299) -> `(.62,.62,.72)` (C 7,5). Éclair d'orage `ECL` (.92,.86,1.35) -> (.95,.97,1.18) (le boulon n'est plus violet).
- `cielMusical` : laissé. Depuis bords-route l'accent de la ville est ambre #ffb04a et sa bascule bleu glace #6ac6ff (relevé par dbgLvl) : plus de magenta ; et le plafond ne s'allume qu'à la nuit/orage (facteur `nuit`). La vie musicale de la nuit est intacte (vue : nuit avant/après identique).
- La PLUIE : ciel médian C* 15-16 teinte 272 avant ET après = la cible #6E7F96 de la charte (h 267, C 14), brume claire donc `nuit` = 0 : la constante n'y joue pas. Rien à régler.
- HONNÊTETÉ : au banc le plafond de l'orage est un bleu-nuit presque noir (L* 15-25) ; le médian du ciel est indistinct avant/après (C 5-15, teinte 257-276, bruit des nuages et des éclairs). Le gain B est PROUVÉ PAR LE CALCUL et visible seulement aux éclairs et aux grosses frappes de la musique (non reproduisibles sans le son : aucun hook). Règle 9 : gardé car sans effet de bord, retirable par `?sans=neon`.

## RESTE / POUR LES AUTRES (hors zone)
- Les VRAIS lavis violets de l'image à grande vitesse sont des calques DOM : `#pwrFx` (bords du pouvoir, `PWR_DEFS.n.fx/fx2`, déjà ÷ 2,5), `#speedFx` (plafonné .6), taches `juiceScreen`/JUS (violet, rose, orange : 150-400 px, passent sous le HUD), jauge et AURA du HUD en dégradé violet. À traiter par INTERFACE (et JUS : Léo).
- Plume de la nitro infinie `NINF.jet` #9d4dff et flammes de la réserve bleue #5b7dff (cobalt) : effets de voiture/pouvoir, non touchés ; proposition : #5b7dff -> #8fa4c8 si Sacha veut la réserve vraiment désaturée.
- Garage : `nitroLight.setHex(0xff4fb0)` (magenta, l. ~43934) dans la scène du garage.
- Néons de façades de la ville (cyan/ambre) et enseignes magenta : zone facades/ville, non touchés.
