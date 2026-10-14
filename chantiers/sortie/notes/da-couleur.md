# da-couleur — LUMIÈRE & COULEUR (passe de sortie, 2026-10-13)

Agent : da-couleur · copie `$R/wt/da-couleur` · branche `sortie2/da-couleur` · serveur 8210.
Captures : `$R/shots/da-couleur/` · scripts : `$R/banc/da-couleur/`.

## État : en cours

## Le système (ce que j'ai lu)
- `BIOMES` (≈ ligne 18101) : chaque ambiance = ciel (skyMul/skyLift/sunTint/sunHalo/city/stars/moon, jour d'altitude jZen/jMid/jHor/jSol,
  rouleau de jade jd*), brume (fog/fogN/fogF), 4 lumières (hemi/sun/fill/kick), nuages (vol*), expo/sat, reflets (env/eS1/eS2),
  étalonnage (wb/sh/hi/con/bloom/vig/rim/fogIn/fogCj — `BIO_ETAL0` complète), dosage de la couche DA (daCon/daExpo/daWbN/daSh/daHi).
- `bioApply` = le SEUL écrivain des lumières/brume/étalonnage ; `daPose` = la couche `DA` globale (expo ×1,06, sat ×1,2, con ×1,14,
  split teal/orange) par-dessus chaque ambiance.
- Le MODE CLASSIQUE AU HASARD : `SF_CARTES` = 4 maps × météos → 22 couples jouables :
  nuages {matin, midi, soir=nuagesSoir, nuit=nuagesNuit, pluie=nuagesPluie, orage=niveau L'ORAGE/tempete} ·
  ville {matin=villeMatin, midi=villeMidi, soir=villeSoir, nuit=MINUIT/nuitNoire, pluie=AU-DESSUS DE LA VILLE/pluie, orage=villeOrage} ·
  jade {matin, midi, soir=jade (Léo), nuit, pluie, orage} · espace {matin=espaceMatin, midi=espace, soir=espaceSoir, satellites=espace hard}.
  + CRYPTOCITY (bullrun), SOLEIL DE JADE (?play=jade, BIOMES.jade), 6 heures du titre (titreMatin…titreNuit + TITRE_H + TITRE_CIEL),
  l'atelier (BIOMES.atelier + paintEnvAtelier), la boutique 3D.

## Planche AVANT
(à venir)

## LA CHARTE
(à venir)

## Ce que j'ai changé
(à venir)

## Planche APRÈS
(à venir)

## Questions à trancher (Sacha / Léo)

## POUR LES AUTRES
