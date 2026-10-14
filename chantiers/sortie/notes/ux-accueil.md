# ux-accueil — passe de sortie (2026-10-13, 2e lancement)

Zone : l'accueil (#mHome, JOUER, tuiles CARRIÈRE/MISSIONS/GARAGE/OFFRES/⚙, logo), le splash, « CASH CAR a calé », la page OFFRES de
l'accueil, ⚙ RÉGLAGES (#mSet), le choix FACILE/NORMAL, les fenêtres (#modale), les transitions (ecranWipe, fondus) et l'appui des boutons.
Copie : `$R/wt/ux-accueil` · branche `sortie2/ux-accueil` · bancs `$R/banc/ux-accueil/` · captures `$R/shots/ux-accueil/{avant,apres}/`.

## Bancs
- `ecrans.cjs <vp> <lang> <tag> [marges] [neuf]` : splash → accueil → réglages (haut, bas, 3 fenêtres) → RETOUR → OFFRES (haut, bas) →
  RETOUR → « a calé ». Audit `s.boutons()` de chaque écran en JSON, log des états.
- `sonde-splash.cjs` : le tap qui ferme le splash traverse-t-il vers l'accueil ?

## Journal (au fil de l'eau)
- 23:4x — captures AVANT lancées (couché / debout FR).
