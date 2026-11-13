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
| D-05 | Plaque (depuis le profil), couché étroit | VALIDER débordait de son lingot : la coche sortait à gauche, le R touchait le bord droit | le § 2 de la finition remonte VALIDER à 20 px couché ; sous ~765 px de large la colonne ne donne que 175 px pour 225 de contenu | sous 780 px de large : 16 px, lettres à 1 px, marges serrées (`finition-ecrans.css` § 14) | volet 667 × 375 : 171 px de contenu dans 175 ; 736 × 414 : 171 dans 210 ; 812 × 375 inchangé (225 dans 249) |
| D-06 | Textes des missions (MISSIONS, écran de mort, ligne du bas) | « TIENS LA FRENESIE 15 / S » : l'unité seule à la ligne | espace ordinaire entre le nombre et son unité | `m2Txt` colle S, MIN, M, KM, KM/H, % à leur nombre (espace insécable, présente dans Press Start) | volet 667 × 375 : « 15⍽S », « 1 800⍽KM/H », « 12⍽MIN » ; « 5 SALTOS », « 10 MISSIONS » intacts |
| D-07 | Textes : cause de mort (lacs des grottes) et promesse de la grotte (midi) | « AU FOND DE L EAU », « LES CRISTAUX T ECLAIRENT » : l'apostrophe manquait (à côté de « AU FOND DE L'OASIS ») | fautes de frappe | apostrophe ajoutée au texte ET à sa clé de traduction (`TR` cherche le texte exact) | balayage des élisions de tous les textes : 2 affichées corrigées ; 3 orphelines (« HORS DE L EAU », « S EMBRASENT », « D EN DESSOUS ») jamais affichées ; contrôle des traductions : 0 trou |
| D-08 | Toast en course, debout | « JETON SPIN ×N » et « DÉPART BOOSTÉ » se posaient sur la colonne des pouvoirs (banc du HUD : 53 × 37 px) | le toast est centré en haut, partout | en course debout (`body.touch.play:not(.dead)`), il se range à gauche sous les barres, borné avant la colonne des pouvoirs (`finition-ecrans.css` § 15) | banc de scène A/B, « JETON SPIN ×3 » posé en pleine course : main [92-298] sur les pouvoirs [244-376] (54 px) → branche [14-221] (debout), [14-221] contre [229-361] (375 × 667), couché inchangé (centré, rien touché) |
| D-09 | Le site sur téléphone (Safari, Chrome) | Appui long sur un bouton ou un nom : loupe de sélection / menu Copier ; flash gris au toucher | `user-select:none` sans le préfixe `-webkit-` que lit WebKit, rien pour l'appui long (`-webkit-touch-callout`) ni le flash ; l'app, elle, les pose dans `natif.js` | les mêmes règles que l'app sur `html,body`, les champs de saisie restent sélectionnables (`finition-ecrans.css` § 16) | lecture du CSS de l'app (`app-ios/natif/natif.js` § 1) |
| D-10 | FINAL SPIN (la machine à sous), le SAC D'ARGENT vert | Le sac portait un « $ » en pixels, seul reste de l'avant « tout en euros » | sprites refaits le 05/11, le jour du passage aux euros : le symbole n'a pas suivi | « € » dessiné à la même place, mêmes couleurs (`final-spin.js`, SPIN_SPR) | `passation/details-sac-euro-avant-apres.png` |
| D-11 | Le site sur téléphone (Safari, Chrome), barre d'adresse visible | Le bas des listes de l'inventaire et des modèles de plaque, et la machine à sous couchée, se calaient sur `100vh` : avec la barre d'outils visible, la partie basse passait sous l'écran | `100vh` = la hauteur barre REPLIÉE ; la page ne défile pas, la barre reste dépliée | `100dvh` (la hauteur vraiment visible) après chaque `100vh` de hauteur maximale ; pour la variable de la machine à sous, sous `@supports` (une variable n'a pas de repli) | identique dans l'app (pas de barre : dvh = vh) et sur l'ordi ; non vérifiable ici sur un vrai Safari |
| D-12 | Garage, langue changée dans les RÉGLAGES | Le compte du garage restait écrit à la française en anglais (« € 12 675 678 » à côté de l'aura « 1,200 ») jusqu'au prochain mouvement d'argent | `gCompteur` ne réécrivait que si le montant changeait | même montant, autre langue : réécrit (`soldeTxt` garde la langue de sa dernière écriture) | volet 390 × 844 : FR « € 12 675 678 » → EN « €12,675,678 » sans rechargement |
| D-13 | RÉGLAGES, panneau JEU | FIGURES, MAIN et COMMANDES portaient la même icône (la flèche qui tourne), trois fois de suite | lignes ajoutées par copier-coller (27-28/10) | MAIN : les flèches ◀ ▶ (le côté des commandes) ; COMMANDES : le volant (volant · flèches · inclinaison) ; FIGURES garde la sienne | volet 390 × 844, panneau JEU |
| D-14 | Garage : la jauge « tourner » et « TOUT VOIR » de la bande | Après un toucher, la jauge restait allumée à 100 % (au lieu de retomber à 70 %) et le bouton restait surligné, jusqu'au toucher suivant ailleurs | sur téléphone, `:hover` reste posé après le toucher | leur `:hover` réservé aux appareils à souris (`@media (hover:hover)`), l'état « tenu » (`.tient`, `:active`) inchangé | relevé : 14 `:hover` sans garde dans le CSS, 12 sur d'anciens éléments masqués (0 × 0) |
| D-03 | Argent du HUD, debout | Gros total : le « € » mordait la barre de NITRO ; **téléphone tourné en pleine course (couché → debout) : l'argent passait de 71 px sur la barre** | `soldeFit` ne rétrécissait que les chiffres (le « € » gardait 16 px) et ne remesurait qu'au changement du nombre de chiffres, jamais au changement d'écran | `cashFit` : le « € » suit les chiffres (même proportion) ; `cashEcrit` remesure aussi quand l'écran change de taille | banc A/B (`argent.cjs`) : 1 px → 0 px (12 345 678), 71 px → 0 px (rotation), 0 erreur |

## Vu, laissé (avec la raison)
- Carte MOTEUR (montée de palier) : la colonne des pouvoirs passe à 8 % d'opacité pendant ~1,5 s (`charte-6-signatures.css`, « une voix au centre »).
  La règle date de la carte à texte (« 3 CYLINDRES ») ; la carte n'a plus de texte depuis le 05/11 et ne touche plus la colonne. Choix de mise
  en scène : à trancher par Sacha (retirer `.ebOn` de la règle rendrait les minuteurs des pouvoirs lisibles à chaque palier).
- Écriture allégée (téléphone) : l'argent du HUD n'a plus de contour d'encre ; sur une éclaboussure verte ou un ciel clair il se lit mal.
  Choix explicite de Sacha (fluidité, 12/11) — pas touché.
- Moteur « lapin » au palier 1 (Léo, 30/10) et mise de départ « 1,61 € » (clin d'œil au studio) : voulus.
- LA PIZZA EXPRESS à 161,00 € dans la page ACHAT : prix posé tel quel dans `deblocage.js` — décision commerciale, pas un défaut d'affichage.
- Audit « texte coupé » sur `#gName` (garage) et « MISSIONS » (écran de mort, 667 × 375) : faux positifs (l'espacement des lettres
  après la dernière lettre compte dans la mesure ; à l'image, rien n'est rogné).
- Le « É » majuscule de Press Start est un E aplati sous son accent : en début de phrase (« toi. Élue plus belle… », fiche de LA FÉLINE) il se lit
  presque comme un « é ». Choix documenté dans `passe-textes.js` (les capitales gardent leur accent dans les phrases à minuscules) — pas touché.
- La police « CC Symboles » (émojis et symboles redessinés en pixel, session iOS du 12/11) n'existe que dans l'app (`ios-fond`), pas sur main :
  sur le site, un émoji tombe dans la police du système. Peu visible (les messages à émojis sont cachés sur téléphone) ; à porter sur main
  le jour où `ios-fond` y revient.
- Le toast qui passe sur la colonne des pouvoirs au banc du HUD : déclenché par le banc (`dbgFig('equipe')`) ; en vraie course aucun toast ne part.

## État de départ
- `toutes.mjs paliers=0,20 graines=1-2` : 40 routes, 0 erreur.
- Gardes : allègement, charte, burn-out, texte nu, démarrage : OK.
- Banc des écrans (debout, couché, i7debout, i7couche) : 0 erreur console sur tous les écrans ; en anglais (debout, i7couche) : tout traduit, rien ne déborde.
- Banc du HUD (`leger.cjs`, 6 formats d'iPhone) : 2 défauts (D-03, D-08), les autres « passagers » (< 0,35 s, entrées d'animation).
- Banc de rotation (debout → couché → debout sur chaque écran, `scratchpad/outils/rotation.cjs`) : la mise en page revient au pixel près partout
  (accueil, réglages, achat, garage, inventaire, boutique, missions, profil, course, pause, mort) — une fois D-03 et D-04 corrigés.
- Fumée de course (`outils/banc-course/course.cjs`) sur nuages, ville, canyon, grotte, jade, espace, crypto, banquise : 0 exception, 0 requête
  en échec ; console = seulement les avertissements connus (relecture du moteur de l'écran de mort, vibration bloquée sans geste au banc).
- Boutique avec 61 M € (i7debout, i7couche) : 42 caisses, 8 offres, 15 ailes, 13 traînées, 4 figures, les pastilles de peinture — aucun nom ni prix rogné.
- Premier lancement (sauvegarde vierge) : chargement (ouroboros) puis l'écran-titre « TOUCHE » ; HUD calme (debout, couché) : seul ⏸ reste.
- Contrôles statiques : traductions des `TR('…')` (0 trou), `@keyframes` appelées (toutes définies), variables CSS (toutes posées),
  identifiants en double (seulement le panneau de réglage des fruits, réservé au développement), propriétés CSS mal écrites (une `skew:none` inerte).
