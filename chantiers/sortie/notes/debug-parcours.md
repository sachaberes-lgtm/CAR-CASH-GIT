# debug-parcours — passe de sortie (2026-10-13/14)

Zone : bugs de navigation, d'état et de robustesse hors gameplay de course. Branche `sortie2/debug-parcours`.

## Le robot explorateur (banc permanent : `$R/banc/debug-parcours/`)
- `robot.cjs` — outils : `sig()` (photo de l'état : écran, couches visibles, course, musique, tas, nœuds DOM), `cle()` (signature
  courte), `versAccueil()` (revenir comme un joueur : RETOUR / HOME / Échap, rend le chemin pris), `visib()` (arrière-plan simulé :
  `document.hidden` + `visibilitychange`), `meurt()` (une VRAIE mort par `dbgFacile('mort')`, repli `dbgQuitte`), `tapTxt()`, `scene()`.
- `carte.cjs [vp] [nom] [save] [q]` — la carte des écrans : touche CHAQUE bouton atteignable (vrai doigt), note l'état d'arrivée,
  les erreurs JS, les « RIEN ? » (bouton sans effet visible), les écrans sans bouton, HUD/musique au mauvais endroit, puis revient.
  `PROF=2` par défaut.
- `scenarios.cjs neuf,jouers,riche,retours,taps,rotation,langues,saves,reseau,i7,fuites` — les scénarios obligatoires, un seul
  navigateur, un contexte neuf par scénario.

## Bugs trouvés et corrigés
(au fil de l'eau)

## Constats sans correctif / à trancher

## POUR LES AUTRES
