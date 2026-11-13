# LA PASSE DES DÉTAILS (13/11/2026, session Opus « details-ultimes »)

Sacha : « repasse derrière le travail de la session optimisation et apporte des petites améliorations globales au jeu […] surtout du
debugging, de la recherche de petits bugs, du redimensionnement léger du HUD […] tu cherches tous les petits détails qui nous empêchent
d'avoir le jeu ultime, et tu les règles ». La session « Optimisation iOS CASH CAR » tient l'app (branche `ios-fond`) : cette passe ne touche
pas à l'optimisation, elle part d'`origin/main` et publie sur main ; la session d'optimisation reprend main dans ses builds.

- Chantier : worktree `~/cash-car/details-ultimes`, branche `details-ultimes` (poussée), serveur de volet `cashcar-details` (port 8950, no-store).
- Bancs employés : `outils/banc-routes/toutes.mjs` (toutes les maps), `outils/banc-ecrans/photos.cjs` (chaque écran, 4 formats d'iPhone),
  `outils/banc-hud/leger.cjs` (le HUD de course), les gardes (`garde-*.sh`, `garde-demarrage.cjs`, `garde-texte-nu.cjs`).

## Trouvé et corrigé

| # | Où | Le défaut | La cause | Le correctif | Preuve |
|---|----|-----------|----------|--------------|--------|
| D-01 | Page ACHAT (accueil), couché | La moitié gauche de la page vide, les légendaires serrées à droite deux par rangée | Le CHAT POP-TART (seule offre « à la une ») n'est plus en vente depuis v1554 : la colonne de l'offre restait vide | `shopRender` pose `.sansUne` sur `#mShop` ; couché sans offre : une seule colonne, quatre boîtes par rangée (`finition-ecrans.css` § 13) | volet 740 × 360 : 4 × 161 px sur toute la largeur |
| D-02 | Toasts (tous) | « PEINTURE GAGNEE / · VERT BILLET » : la 2e ligne commençait par le point | césure libre avant le « · » | `toast()` colle le « · » au mot d'avant (espace insécable) | banc des écrans, boutique-peintures debout |
| D-04 | Garage debout, compte ≥ 1 M € | L'œil (vue seule) posé sur les derniers chiffres du compteur — la règle v1550 « l'œil s'efface en vertical dès 1 M » ne marchait jamais au garage ordinaire | `.oeilCache #gOeil{display:none!important}` (8 identifiants) battue par la règle qui range l'œil dans `#gRang1` (`boutons-flottants.css`, 12 identifiants, `display:flex!important`) | même règle à 15 identifiants (`garage-hub-barre.css`) | banc de scène 844 × 390 → 390 × 844, 12 675 678 € : œil `flex` [182-240] sur le compteur [18-224] → `none` |
| D-03 | Argent du HUD, debout | Gros total : le « € » mordait la barre de NITRO ; **téléphone tourné en pleine course (couché → debout) : l'argent passait de 71 px sur la barre** | `soldeFit` ne rétrécissait que les chiffres (le « € » gardait 16 px) et ne remesurait qu'au changement du nombre de chiffres, jamais au changement d'écran | `cashFit` : le « € » suit les chiffres (même proportion) ; `cashEcrit` remesure aussi quand l'écran change de taille | banc A/B (`argent.cjs`) : 1 px → 0 px (12 345 678), 71 px → 0 px (rotation), 0 erreur |

## Vu, laissé (avec la raison)

## État de départ
- `toutes.mjs paliers=0,20 graines=1-2` : 40 routes, 0 erreur.
- Gardes : allègement, charte, burn-out, texte nu, démarrage : OK.
- Banc des écrans (debout, couché, i7debout, i7couche) : 0 erreur console sur tous les écrans.
