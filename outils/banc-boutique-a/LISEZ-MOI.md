# Banc de la boutique version A (`html.bqA`)

Un Chrome headless, piloté par HTTP, qui change de format à la volée. Écrit le 2026-11-11 (voir `passation/BOUTIQUE-A-IPHONE.md`).

```
node outils/banc-boutique-a/banc.cjs "VERSION PRINCIPALE" 9811 9812 9813      # le banc (port de contrôle : le 3e)
node outils/banc-boutique-a/parcours.cjs 9813 pc                                # le PARCOURS exhaustif : rayons, cartes, flèches, glissé, boutons, hexagones, focus, rotation
bash outils/banc-boutique-a/audit.sh 9813 sortie "i15d:393:852:59:34:0:0:1"    # photos + mesures (touches ≥ 44 px, marges, textes coupés)
```

- **Formats du parcours** : `pc` (cadre de l'ordinateur 844×390, souris), `portrait` (iPhone 15), `iphone-couche`, `se`, `grand` (1920×1080).
- **Invariants** (`inv.js`, contrôlés après CHAQUE geste) : la bande n'est jamais vide sans message, au moins une carte en vue, la sélection est marquée, le bouton d'état et les flèches existent et tiennent à l'écran, le nom n'est pas vide, aucune erreur JS.
- **Données** : `PREP="dbgSolde({banque:800})" node parcours.cjs 9813 pc` (joueur pauvre), `PREP="dbgBqCousin(1)"` (code cousin : toutes les caisses « à toi »), `dbgBqVide(1)` (« toutes les caisses sont à toi » pour de vrai).
- **Sons** : `SON=1 node banc.cjs …` allume les bruitages dans la page (Chrome est muet : `--mute-audio`) ; envelopper `CCSON.play` pour les compter. **CPU** : `/cpu?x=4`.
- Ne pas appuyer sur un bouton « VOIR LA MISSION » dans un parcours : il quitte la boutique (c'est voulu).
- Un parcours démarre sur une page rechargée (`/load`) : un état resté d'un parcours précédent (rayon, focus) fausse tout.
