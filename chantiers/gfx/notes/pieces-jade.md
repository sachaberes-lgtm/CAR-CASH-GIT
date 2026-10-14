# pieces-jade — notes (2026-10-14)
## Fait (commit 81d97d1, branche gfx/pieces-jade)
- Le VERT venait de la palette 'Y' de `coinPeint` (champ #6ff0ae) : ni couleur d'instance, ni teinte de niveau.
- `SAPEQUE` + `sapequePeint(c)` (juste avant `coinPeint`) : la MÊME toile `COIN_CV` 16×16 repeinte en sapèque de laiton (liseré d'encre,
  listel biseauté, champ, 4 marques en relief, listel du trou, trou carré 4 px en encre). `coinPeint('Y')` y renvoie ; `coinSymbole` et
  l'appel de `buildJade` ne bougent pas. Coût puce : zéro (même texture, même taille, même géométrie 336 triangles, même matière).
- Effets de ramassage : déjà en or (`sparkGold`), rien n'était teinté jade. HUD : garde « $ » (pas touché, zone INTERFACE).
## Vérifié (1 ouverture, banc/pieces-jade/sapeque.cjs) — 0 erreur JS
- shots/pieces-jade/jade-midi-jeu.png (vue de jeu : pièce dorée, carré sombre lisible), jade-midi-gros-plan.png, jade-nuit-gros-plan.png,
  nuages-midi-gros-plan.png (après portail jade → nuages : toujours le $).
- NON vérifié : jade pluie/orage, Soleil de Jade (?play=jade), debout, crypto ; jade-nuit-jeu / nuages-midi-jeu capturés mais non regardés.
## Doutes
- Dans mes gros plans la caméra est PILE dans l'axe du reflet spéculaire de la face plate : tout est délavé et le trou sort CLAIR. En vue de
  jeu il est sombre. À revoir de trois-quarts ; si le trou reste trop clair, foncer `SAPEQUE.t` ne suffira pas (la matière ÉMET sa texture
  ×1,05 : même l'encre du « $ » sort orange) — le contraste se joue en éclaircissant champ/listel autour.
- Teinte à l'écran plus jaune-or que le laiton patiné visé (#C8922E) : baisser `g`/`h` si Sacha la veut plus bronze.
## PROPOSITION (hors périmètre de la nuit) — le vrai trou percé
Patch complet gardé : notes/pieces-jade-proposition-trou-perce.patch — géométrie `pickGeoY` (disque 16 pans à trou carré, listels en relief,
304 triangles contre 336), texture 32×32, bascule `coinIM.geometry` dans `coinSymbole`, hook `dbgSapeque`. Syntaxe OK, jamais passé au banc.
## POUR LES AUTRES
- INTERFACE : le compteur d'argent du HUD est vert/« $ » sur jade aussi — rien de propre à la map.
- `?route=pieces` (route en pièces, hors défaut) : une sapèque dorée s'y lira moins bien que l'ancienne verte.
