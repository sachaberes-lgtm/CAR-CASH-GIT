# LOT « HUDMORT » : les traits « soulignés à moitié » de l'écran de mort (18/11)

Sacha (dicté) : « Des fois, il y a des petits bugs avec le HUD, par exemple, quand on meurt, il y a des petits pixels comme si c'était souligné, mais à moitié, genre bizarrement. »

## Le défaut (trouvé, reproduit à la géométrie du 13 Pro)
Sur l'écran de mort, carte **AURA**, le petit graphe à trois bougies (PARTIE · MOY. · RECORD).
Une bougie dont la valeur est nulle ou petite devant le record faisait **3 px de haut** (`min-height:3px`, `--h` au moins 3 %).
Elle est posée sur la ligne de base, 28 px de large, sous son chiffre : **un trait clair sous le « 0 », comme un soulignement coupé**.
La bougie MOY. est creuse (cadre de 2 px) : à 3 px, c'est aussi un trait.
C'est presque toujours le cas : le record (3 000 dans le banc) écrase tout ; une partie à 0, 20, 40 ou 100 d'aura donne ces traits.
Et sans aucun record (toutes les valeurs à 0), le pointillé d'or du record (`.m6Ligne`) se couchait lui aussi sur la ligne de base.

- Avant / après, zoom ×4 des pixels de l'écran (deviceScaleFactor 3), en haut AVANT (`?sans=hudmort`), en bas APRÈS :
  `photos/hudmort/00-P1-vide-avant-apres.png` (couché, partie à 0 : trait sous le « 0 », trait sous « 100 »),
  `photos/hudmort/01-P1-nitro-avant-apres.png` (couché, partie à 40 / 60),
  `photos/hudmort/02-D1-vide-avant-apres.png` (debout).
  Chaque zoom seul : `*-zoom-avant.png`, `*-zoom-apres.png`. L'écran entier : `*-ecran-avant-apres.png`.
- ⚠ AVANT et APRÈS sont deux morts différentes (l'aura de la partie change : 40 / 60, 40 / 20). Ce qui compte : la forme des petites bougies.
- Mesuré dans la page (boîtes des bougies, `etat.json`) : AVANT, bougies 0 → 3 px, 40 → 3 px, 92-100 → 3 px. APRÈS : 0 → aucune bougie, 20-100 → 8 px, chiffre 5 px au-dessus.

**Pas nouveau** : le graphe et ces règles datent de l'écran de mort v6 (b37a65511, 03/11). Entre le build 120 (4324e2b91) et le build 121 (a42e9ec50), `code/css/` n'a pas changé et `mobile-tactile.js` seulement dans `reflow` (lot hudobs). Le build 120 a donc le même défaut (lu dans le code, pas rejoué au banc).

## La correction — `?sans=hudmort` = avant
- `code/moteur/mobile-tactile.js` (section « LES BOUGIES À ZÉRO NE SONT PLUS DES SOULIGNÉS », près de `M6_CPT`) : `HUDMORT` ; `<html>` reçoit `hudMort`. Une colonne de valeur nulle reçoit `.m6Nul`. Le pointillé du record n'est plus écrit quand le record vaut 0.
- `code/css/mort-flottante.css` (après les couleurs des bougies) : sous `html.hudMort`, `.m6Nul .m6Barre{display:none}` ; `.m6Barre{min-height:8px}` (une petite valeur est une vraie bougie, son cadre se lit) ; le chiffre reste au-dessus (`bottom:max(h% + 5px, 13px)`).
- Rien d'autre ne bouge : grandes bougies, animations (`m6Pousse`, `m6Apparait`), record, couleurs.

## Banc — `outils/banc-hudmort/`
- `morts.cjs` : le vrai jeu, Chrome sans fenêtre et muet, `?tel=1`, 844×390 à deviceScaleFactor 3 puis 390×844. Plan de morts (`--plan "P1:vide,choc,nitro,figure;P0:…;D1:…;D0:…"`, P/D = couché/debout, 1/0 = toile visible / HUD seul). Après chaque mort : TOUTES les images du compositeur (screencast) pendant `--duree`, ou `--rafale 1` = captures à la vraie résolution. `--fin 6000` : capture pleine résolution de l'écran de mort posé + boîtes des bougies.
- `passe.sh "<nom>" …` : sous le verrou commun (même protocole que `verrou-banc.sh`, regardé toutes les 2 s). `VARIANTES="defaut sans=hudmort" OUT=… sh passe.sh …` : avant et après dans la même prise.
- `traits.cjs <passe>` : cherche les traits horizontaux fins (1-6 px, ≥ 24 px de long, plus clairs ou plus sombres que dessus ET dessous) et les groupe par place ; vignettes ×4 des traits fugaces.
- `planche.cjs`, `avant-apres.cjs`, `png.cjs` (PNG sans dépendance).
- Rejouer : `VARIANTES="defaut sans=hudmort" OUT=/tmp/hm sh outils/banc-hudmort/passe.sh moi --plan "P1:vide,nitro;D1:vide" --rafale 1 --duree 2200 --fin 6000` puis `node outils/banc-hudmort/avant-apres.cjs /tmp/hm sortie/`.

## Ce qui a été regardé
- Passe 1 (screencast, chaque image du compositeur, 30-60 images/s) : 13 morts — couché toile visible (chute, choc, nitro, « figure »), couché HUD seul (chute, nitro, « figure », seconde chance), debout toile visible (chute, nitro), debout HUD seul (chute, nitro, « figure »). 3,2 s après chaque mort.
  Dans les 3 s de l'explosion, le HUD de course (jauge nitro, bande du flow, argent, pause) reste net puis s'efface en fondu : aucun trait parasite vu (planches du haut de l'écran, image par image), aucun trait fugace sur le HUD seul hors l'écran de mort qui se construit.
- Passe 2 (même prise, avant / après) : 3 morts × 2 variantes, captures pleine résolution, écran de mort posé à 6 s.
- Pistes écartées en lisant le code : les `<u>` du HUD et de l'écran de mort ont tous `text-decoration:none` ou `display:none` (compteur à rouleaux `.m6D>u`, `.mJour>u`, `#pwrChip .pl>u`, `.fG`, `.fhMore`, `.fhRec`) ; la seconde chance n'a plus d'écran (réanimation automatique) ; la loupe et la retaille du pivot n'interviennent pas dans l'écran de mort.

## NON vérifié
- **Rien sur le téléphone.** Chrome à deviceScaleFactor 3, pas WebKit.
- Le screencast de Chrome sans fenêtre rend à la taille CSS (844×390) : l'explosion n'a été vue image par image qu'à la résolution CSS ; à la vraie résolution, 3 captures par mort seulement (`captureScreenshot` est lent sur le Mac chargé). Un trait de moins d'un point pendant l'explosion aurait pu échapper.
- La mort « pendant une figure » : `dbgFigure` a refusé (le pilote saute mais la figure n'a pas pris) ; c'est une chute en vol, sans figure.
- Le build 120 n'a pas été rejoué au banc (code identique sur ce point).
- Si Sacha parlait d'autre chose qu'un trait sous un chiffre de l'écran de mort, ce lot ne l'a pas trouvé.
