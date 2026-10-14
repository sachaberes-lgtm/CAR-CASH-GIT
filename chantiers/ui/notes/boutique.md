# boutique — refonte de l interface, charte 6 (2026-10-14)

## Journal

## RETIRE / DEPLACE

## POUR LE SOCLE

## POUR LES AUTRES

## RESTE / QUESTIONS

---
## PASSE P1 — navigation et état de la boutique (2026-10-14, agent boutique, branche ui/boutique)
Mission : défauts de NAVIGATION et d'ÉTAT, pas de refonte visuelle. La scène 3D, `burn*`, `DON*`, `sw.js`, les achats en € ne sont pas touchés.

### Ce qui change (sélecteurs, fonctions, pourquoi)
- **Cadeau de l'accueil -> boutique, onglet OFFRES** (`mTap`, `a==='shop'` : une ligne ajoutée AU-DESSUS de l'ancienne, gardée telle quelle pour `?ui=5` et POKI).
  Nouvelle fonction `bqVaOffres()` : sous le voile, `GBQ.ong='off'`, puis `garMode('boutique')` + `gModeVa('shop')` (le garage est déjà là à l'accueil) ou `openGarage()` + `gModeVa('shop')`. Plus aucun accès à `#mShop` sous c6.
  Autres chemins vers l'ancien écran, tous redirigés sous c6 : la LÉGENDAIRE du garage-menu (`$('gBuy')`, branche `bout==='1'`, qui faisait `__mGo('shop')`), la porte des offres du bandeau (`gOffresPage`). La ligne OFFRES de l'écran de fin est masquée sous c6 (déjà, `#mDead>.mRow`). `?ui=5` : tout est comme avant (`bqC6()` = faux).
- **Le bouton d'action suit l'onglet** (`bqEtat` : une ligne en tête qui appelle `bqEtatC6`). Sur OFFRES, si la caisse regardée n'est pas une des 4 offres : état `choix`, « CHOISIS UNE OFFRE », inactif. Et à l'ouverture de l'onglet la 1re offre est posée sur le plateau (`bqOffreAuto`, via `bqEssaie`) : l'aperçu 3D ne reste plus sur la dernière caisse touchée, le bouton dit « ACHETER 4,20 € ».
- **Pas assez d'argent** : état `manque` (caisse / habillage / figure payés en pièces, banque < prix) : « IL TE MANQUE $ 49,6 k » + mini-jauge (`<i class="bqJ" style="--v:banque/prix">`), plaque grise inactive. `bqAction` : secousse + son de refus, pas de toast, pas d'achat. Les anciens toasts « IL TE MANQUE » (`$('gBuy')`, `figAchete`) restent pour `?ui=5`.
- **◀** : `#gBqRet` (créé par `bqRetourC6`, appelé dans `garBqUI`), `.pbtn.pbCarre.c6Ret` 48 × 48, en haut à gauche (zones sûres), fait ce que faisait RETOUR (`gModeVa('shop')`). `#gShopBas` (RETOUR large) est masqué en boutique, `#gBqBtn` prend toute la largeur du bas. L'en-tête BOUTIQUE se décale d'une touche et se centre sur le ◀.
- **Colonne « CETTE SEMAINE »** : plus de défilé (le marquee coupait les cartes) ; liste simple (non doublée sous c6), feuilletée au doigt avec accroche, et `bqColonneCale` cale sa hauteur sur n cartes ENTIÈRES (appelée à chaque calcul de mise en page `GBQ.lay`).
- **Textes** : tout ≥ 11 px dans la boutique, en police système (noms sur 2 lignes sans « … », prix `nowrap`, onglets 14 px, bouton 15 px). Onglets et touches de 48 px.
- I18N : `CHOISIS UNE OFFRE` (EN seulement ; le chinois retombe sur le français).

### POUR LES AUTRES (Léo, session DETAIL)
- Léo : lignes touchées dans son code (une instruction chacune) : `bqEtat` (1 ligne en tête), `bqAction` (1 ligne), `bqBoutonMaj` (clé + 1 ajout dans le HTML), `garBqPanneau` (appel `bqOffreAuto`), `garBqUI` (appel `bqRetourC6`), `bqSemaine` (`h` au lieu de `h+h` sous c6), le bloc `GBQ.lay` (appel `bqColonneCale`), `gOffresPage`, `$('gBuy')`. Rien de supprimé. Le CSS est tout dans `<style id="c6-boutique">`.
- DETAIL : traduire `CHOISIS UNE OFFRE` en chinois ; relire « IL TE MANQUE » dans le bouton.

### RESTE / À TRANCHER
- La fenêtre d'achat en € (`shopPop`) répond encore « BIENTÔT DISPONIBLE » au toucher d'ACHETER : c'est le chemin du paiement (pas encore branché), non touché ici. À trancher par Sacha / Léo avant l'App Store.
- ◀ depuis la boutique ouverte par le cadeau ramène au garage replié (comme RETOUR avant), pas à l'accueil : deux ◀ pour revenir. À trancher : un ◀ qui revient direct à l'accueil quand on vient du cadeau.
- « CETTE SEMAINE » est devenue une colonne feuilletée (plus de défilé automatique) : à valider par Léo.
- Les listes de caisses sont des défilements : l'audit `s.boutons()` signale les vignettes sorties du cadre comme HORS ÉCRAN / MASQUÉ, c'est un artefact de l'outil.

### ÉTAT DE LA VÉRIFICATION (P1) — À LIRE
- NON VÉRIFIÉ À L'ÉCRAN APRÈS correctifs : la machine a saturé (load 56 → 196 → 641) pendant toute la passe ; règle de PILOTAGE : on ne lance pas de navigateur. Seul le passage « AVANT » en 375×667 debout a eu lieu (`ui/shots/boutique/p1/avant-i7debout-*.png` + `.log`). Le code passe `syntaxe.cjs` (0 erreur) et `garde-burnout.sh` (OK).
- À faire au prochain créneau : `cd ui/banc/boutique && node p1.cjs apres i7debout,debout,maxdebout,couche,i7couche,maxcouche` (profil pauvre, bank 418 ; le script prend les captures 0-accueil, 1-cadeau, 2-voitures, 3-manque, 4-offres, 5-offre-choisie et l'audit) puis `PORT=8590` + un serveur sur l'ancien index (`git show 4007550:"VERSION PRINCIPALE/index.html"`) pour les « avant » des autres formats.
- Points à regarder en premier : (1) le cadeau mène bien à OFFRES sans erreur JS (`bqVaOffres`, `garMode('boutique')` + `gModeVa('shop')` sous le voile) ; (2) `#gBqRet` visible en haut à gauche, jamais sous l'encoche, en couché aussi ; (3) la colonne « CETTE SEMAINE » : n cartes entières (`bqColonneCale`), pas de carte vide ; (4) le bouton « IL TE MANQUE $ … » et sa jauge ; (5) la 1re rangée d'OFFRES coupée en haut (vue sur l'avant : les cartes démarrent 12 px au-dessus du rail, non corrigé) ; (6) `?ui=5` : cadeau -> ancien écran, inchangé.
