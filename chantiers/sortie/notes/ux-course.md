# ux-course — passe de sortie (2026-10-13) — le HUD de course, la pause, l'écran de fin

Agent : ux-course · branche `sortie2/ux-course` · copie `$R/wt/ux-course` · bancs `$R/banc/ux-course/` · captures `$R/shots/ux-course/`.

## Méthode
- Banc `tour.cjs vp1,vp2… pfx [lang]` : UN navigateur (un créneau) pour tous les formats ; carte NUAGES midi imposée
  (`?carte=nuages&meteo=midi`), pilote auto (`dbgAuto`), boost au VRAI doigt (CDP), vol (`dbgTakeoff`), frénésie
  (`dbgFren('v',100)`+`'entre'`), VILLE nuit et ORBITE par `dbgClassique`+`dbgSaut`, gros nombres (`dbgHudGros`, crochet ajouté),
  pause au doigt, mort (`dbgFacile('mort')`), écran de fin. Audit des boutons (`s.boutons()`) + boîtes du HUD dans `<pfx>-<vp>.json`.

## Revue AVANT (en cours)
(voir plus bas, élément par élément)

## POUR LES AUTRES
