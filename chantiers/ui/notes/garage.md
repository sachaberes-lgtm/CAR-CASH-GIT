# garage — refonte de l interface, charte 6 (2026-10-14)

## Journal
- Mission de nuit (30 min) : LE HUB seulement (l'état `#garage.consoleCachee`, ni menu, ni vitrine, ni `shopRet`, ni `atelierInv`, ni `modeShop`).
  Branche `ui/garage`, 2 commits (b7dbb6a + le suivant). Un fichier : `VERSION PRINCIPALE/index.html`.
- CSS : tout dans `<style id="c6-garage">` (~86 lignes). Sélecteur du hub = `html.c6 body #garage:not(.menu):not(.vitrine):not(.shopRet):not(.atelierInv):not(.modeShop)` :
  il domine le bloc « LE BAS DU GARAGE, REFONDU » de `hubGarage` (mêmes :not + la classe c6), `!important` là où l'ancien en a.
- HTML : `#gC6Tete` (`.c6Tete.flotte`, attribut `hidden` → n'existe pas en `?ui=5`) juste avant le `#gTop` du garage : `#gC6Ret` (◀), titre GARAGE,
  `.c6Comptes` (`#gC6Cash`, `#gC6Aura`).
- JS (bloc « L'EN-TÊTE DU HUB », juste après l'écouteur de l'œil, gardé par `html.c6`) : (1) `#gOeil` est DÉPLACÉ de `#gRang1` vers `#gCard` (même nœud,
  mêmes écouteurs) ; (2) `#gC6Ret` fait le geste de HOME (`#gClose.click()`, Entrée/Espace aussi) ; (3) deux MutationObserver recopient le texte de
  `#gCompteur b` et `#gAuraC b` dans l'en-tête (aucune fonction du jeu touchée, le défilement du compteur suit). + `#gC6Tete` ajouté aux deux listes
  d'exclusion du glissé de la vue (`pointerdown`).
- Mise en place : en-tête 64 px (◀ 48 × 48 · GARAGE 16 px · cash vert / aura violette à droite ; debout les deux comptes s'empilent à droite) ;
  fiche dessous à gauche : NOM 16 px (passe à la ligne entre deux mots, jamais coupé) · ŒIL 48 × 48 · « 1 / 51 » 8 px ; la famille dessous (8 px, barre
  de 4 px à sa couleur) ; en bas à droite (toute la largeur debout) : INVENTAIRE | BOUTIQUE (48 px, encre, filet blanc 2 px, tranche 4 px, 8 px d'écart)
  puis LA décision 64 px en or : JOUER, ou ACHETER + prix quand la caisse montrée est à vendre. Couché, le bloc fait 328 px (296 sur 667) : plus étroit
  que l'ancien (≈ 390), la caisse a plus de place.
- Vérifié au banc (`ui/banc/garage/hub.cjs`, 2 passages, marges iPhone, français) : couche 844×390, debout 390×844, i7couche 667×375 — captures dans
  `ui/shots/garage/apres/` (`*-hub`, `*-acheter`, `couche-oeil`, `couche-inventaire`). 0 erreur JS ; `s.boutons()` : seul « PETIT gTourne » (la jauge de Léo, 30 px).

## RETIRE / DEPLACE
- HOME (`#gHomeBas`) : masqué dans le hub → le ◀ de l'en-tête (même geste).
- MISSIONS (`#gvMis`) et OFFRES ÉPHÉMÈRES (`#gRappel`) : masquées dans le hub (nœuds gardés) — elles sont à l'accueil.
- L'ŒIL : de la rangée du bas (carré orange 62 px) à une touche d'encre 48 × 48 à côté du nom ; allumé (vue seule) = face blanche.
- Le compteur GTA (`#gCompteur`) et la jauge d'aura (`#gAuraC`) : masqués dans le hub, remplacés par les deux `.c6Sou` de l'en-tête.
  ⚠ PERDU dans le hub : le RANG d'aura écrit (« DIVINITE DU CIEL ») et sa jauge vers le rang suivant ; le « −$ » rouge qui tombe sous le compteur à une dépense.
- Les chevrons ▶▶▶ de JOUER ; le prix d'ACHETER passe du vert à l'encre (il est posé sur l'or).

## POUR LE SOCLE
- `.c6Tete.flotte` ne sait pas tenir titre + deux comptes sur 390 px : ici `.c6Comptes` passe en colonne (debout). À remonter si d'autres écrans ont deux comptes.
- Une `.c6Tete` posée dans le HTML a besoin d'un moyen de ne pas exister en `?ui=5` : ici l'attribut `hidden` + `display:none` par défaut sous c6, `display:flex` dans l'état voulu.
- Aucun composant « étiquette de rareté » (mot 8 px + barre de 4 px) : fait à la main sur `#gRarPill`.

## POUR LES AUTRES
- INVENTAIRE (`#garage.atelierInv`) n'est PAS refait : il garde l'ancienne peau (plaques néon du compteur et de l'aura, nom penché, onglets 28 px, RETOUR en bas)
  — voir `shots/garage/apres/couche-inventaire.png`. Le hub et l'inventaire ne se ressemblent donc pas encore.
- BOUTIQUE : pas touchée (gelée). L'œil, déplacé dans `#gCard`, y est masqué comme avant (`shopRet`/`modeShop`).
- Édition POKI : non vérifiée (l'œil y est aussi déplacé ; INVENTAIRE/BOUTIQUE gardent 1 colonne chacun).

## RESTE / QUESTIONS
- NON VÉRIFIÉ À L'ÉCRAN : anglais (calcul : INVENTORY 9 × 10 = 90 px + icône dans 144 px mini → tient ; PLAY, BUY tiennent) ; i7debout 375×667 ; un nom long sur
  deux lignes ; une caisse verrouillée/à défi (`#gDesc`/`#gMeta` visibles : seulement remis droits, corps non normalisés) ; `?ui=5` (calcul : `hidden` + JS gardé par c6) ;
  la pastille `#bdGar2` (aucun nœud de cet id dans le fichier aujourd'hui : la règle est posée pour le jour où il revient) ; l'appui (descente de 4 px) ; `?play=carriere` (`.playNiv`).
- À TRANCHER : (1) le rang d'aura et sa jauge ont quitté le hub — les remettre (où ?) ou les laisser à l'accueil/fin ; (2) le « −$ » de la dépense ;
  (3) la jauge `#gTourne` de Léo fait 30 px de haut (< 44) : seul son patin a été mis à plat ; (4) refaire l'INVENTAIRE dans la même peau (mission suivante).

## INVENTAIRE (atelier fermé, `#garage.atelierInv`) — mission du 14/10, 3 h (commits af7c9e7, b1aa551)
⚠ TOUT CE QUI SUIT EST **NON VÉRIFIÉ À L'ÉCRAN** : charge 1 min = 77 puis 126 aux deux contrôles `uptime` → aucun navigateur, travail statique
(syntaxe 0 erreur, lint c6-garage 0 alerte, garde burn-out OK). Premier passage de banc à faire : `banc/garage/hub.cjs` (il ouvre déjà l'inventaire en couché ;
⚠ son « retour inventaire » tape `#gvCof`, désormais masqué → taper `#gC6Ret`).
- CSS : à la suite dans `<style id="c6-garage">`, préfixe `html.c6 body #garage.atelierInv:not(.menu):not(.vitrine)`. Les règles du hub ne sont pas touchées.
- EN-TÊTE : le même `#gC6Tete` (affiché aussi en atelierInv) ; un 2e titre `#gC6TitreInv` (data-fr="INVENTAIRE", traduit par la boucle des data-fr) remplace GARAGE
  par CSS ; debout il passe à 12 px (10 lettres × 16 touchaient les comptes empilés). JS (1 ligne, bloc « L'EN-TÊTE DU HUB », gardé par c6) : en atelierInv le ◀
  clique `#gvCof` (RETOUR → hub) au lieu de `#gClose` (accueil).
- RETIRÉ de l'inventaire : la touche RETOUR du bas (tout `#gAct` masqué), le bandeau « INVENTAIRE · n » (`#gRar.gModeBar`, doublon du titre ; ⚠ le COMPTE d'objets disparaît),
  les plaques néon compteur / aura (`#gTopRow`, `#gAuraC`), les icônes des onglets (le mot seul, 8 px ; 10 px en couché ≥ 800).
- FICHE : comme au hub (nom 16 px, rang 8 px, famille + barre 4 px), sans l'œil ; 1re rangée de 48 px pour que le nom soit au même pixel qu'au hub.
- PLAQUE (`#gBottom`) : encre à plat rgba(11,13,18,.8), filet 2 px `--c6-e3`, marge intérieure 8. Couché (même requête média que l'ancienne console) : absolue, à droite,
  de l'en-tête au bas, largeur min(48 %, 400). Ailleurs (debout, tablette) : DANS LE FLUX en bas, hauteur min(40vh, 360), de marge à marge — pour que la jauge
  `#gTourne` (rangée dans `#garage` par gtPlace) reste posée au-dessus.
- ONGLETS (`#gTabs .gTab`) : 48 px, posés sur un filet blanc 2 px ; actif = face blanche, texte d'encre (écart voulu avec `.c6Onglet.on` du socle, demandé par la mission).
- GRILLE (`#gStrip`) : 3 colonnes, seule zone qui défile (flex 1). CARTE (`.gT`, caisse ou pièce) : encre `--c6-e1`, filet blanc 2 px, tranche noire 4 px, 16/10, min 48 px.
  `.on` = filet blanc 4 px ; `.eq` (équipée) = face blanche ; à toi = coche blanche ; `.lock` = cadenas blanc + prix vert (ou condition/€ en blanc) ; plus de cyan, de lueur, de penché.
- AUCUN OR dans l'inventaire : toucher une carte l'équipe (Léo, 11/10), `#gEquip` y était déjà masqué par l'ancienne feuille.
- ORDRE DE SACHA (via le coordinateur) : plus de nom de rang d'aura ni sa jauge — `#gAuraC small/u` et `#gVJ .gvU .gvR` masqués sous `html.c6` dans tout `#garage`
  (nœuds gardés). La question « remettre le rang » du § RESTE est donc TRANCHÉE : non.
- RESTE / À TRANCHER : (1) tout à voir à l'écran (3 formats, onglets PEINTURE/AILES/TRAÎNÉES, nom d'aile sur 2 lignes sous la coche, logo de rareté, `?ui=5`) ;
  (2) les échantillons de peinture / traînée gardent leur dégradé (c'est la matière vendue, posée en style en ligne) ; (3) pas de marque écrite « ÉQUIPÉ » (face blanche seule) ;
  (4) si un objet non possédé peut apparaître dans l'inventaire, il n'a pas de touche ACHETER en or (masquée par l'ancienne feuille) ; (5) le compte d'objets retiré.

## INVENTAIRE VU AU BANC + NOMS DE RANG + BADGES RECORD — 14/10, 3 h 10-3 h 20 (commits d5abe46, 0a97886, c1ef72c, 0ec1984)
3 passages de banc (`banc/garage/inv.cjs`, `inv2.cjs`, `inv3.cjs`), charge 14 à 19. Captures `shots/garage/apres/inv-*`, `rang-*`, `fin-*`.
- INVENTAIRE, VU en 844×390, 390×844, 667×375 : en-tête identique au hub (◀ 48×48, titre, comptes), ◀ → hub puis ◀ → accueil, les 4 onglets (VOITURES / PEINTURE / AILES / TRAÎNÉES,
  aucun libellé coupé : 10 px à 844, 8 px ailleurs), cartes de même peau, page sans défilement, 0 erreur JS.
- CORRIGÉ 1 (d5abe46) : en couché `#gTop` passait SOUS la plaque (24 px à 844, 36 px à 667) → il s'arrête 8 px avant ; sous 700 px de large le nom passe à 12 px / lignes de 16.
- CORRIGÉ 2 (0ec1984) : dès que la grille déborde, les rangées retombaient à 48 px et les cartes (16/10) se CHEVAUCHAIENT → `grid-auto-rows:max-content`. Revu : 0 chevauchement, pas vertical 89 / 80 / 72.
- ⚠ SIMULÉ, pas réel : la sauvegarde du banc n'a que 2 caisses et 1 objet par onglet. Le nom long (« LE TOUT-TERRAIN SOVIETIQUE »), la grille de 14 cartes, la carte `.lock` et la 2e `.on`
  ont été posés à la main dans le DOM (clones). Jamais vus en vrai : une vraie carte verrouillée avec son prix, un nom d'aile sur 2 lignes, un vrai changement d'équipement au doigt.
- NOMS DE RANG (0a97886) : table `AURA_RANKS` (~29021). Nouvelle aide `auraSansNom()` (= classe c6). Sous c6 : condition de caisse « AURA 55 000 (la tienne : …) » au lieu de « RANG D'AURA « MYTHE » »,
  puce `#bestChip` et relevé `#runStats` sans nom (les deux sont de toute façon display:none), infobulle de la jauge du garage, `#gpRang` masqué. Rien à ajouter dans c6-accueil / c6-hud /
  c6-carriere-missions / c6-pause-fin : la chasse au texte (tous les nœuds + title) ne trouve AUCUN nom visible à l'accueil, au hub, à l'inventaire, en course et à la fin (couché + debout).
  Non vus : la pause, la carrière, le toast d'une caisse verrouillée par l'aura (garde écrite, pas déclenchée).
- BADGES RECORD ! (c1ef72c, fin de c6-pause-fin) : étiquette d'or 72×12, encre 8 px, hors flux. Argent : centrée au-dessus du montant ; cartes : à cheval sur le bord haut, à droite.
  Vu dans les 3 formats, mise en page inchangée au pixel, rien de recouvert. Argent = badge RÉEL (couché, 667) ; aura et moteur = badges SIMULÉS (nœud `<em>` inséré à la main).
  À TRANCHER : en couché le badge d'argent est serré (5 px sous le titre, 4 px au-dessus du chiffre).

## PEAUFINAGE p2 (hub + inventaire d'un joueur neuf) — 14/10, 7 h 15-8 h (commit 105860e + suivants)
Un fichier : `VERSION PRINCIPALE/index.html`. Banc : `banc/garage/p2.cjs <avant|apres> [formats] [lang]` (joueur NEUF : `owned:[]`, bank 418, aura 100 ; 6 formats ; `PORT=8514` = la copie « avant » servie par `wt/garage-avant-site`). Captures `shots/garage/p2/`.
- AVANT (vu, 6 formats) : fiche (nom, « 1 / 49 », COMMUNE) posée à même le décor 3D (lampe, confettis, étagère) ; comptes de largeurs différentes (87 / 67 px) ; œil entre le nom et « 1 / 49 » ; inventaire = plaque de 281 px (couché) / 40 % de l'écran (debout) pour UNE carte ; onglets qui se TOUCHENT (« VOITURESPEINTURE », « TRAINEESFIGURES » : 5 onglets depuis FIGURES, dans 384 px en pixel 10 px) ; `petits` : 10 textes sous 11 px par écran.
- COMPTES (`#gC6Tete .c6Comptes`, grille à colonnes égales, `.c6Sou` 12 px, min 112 px, icône à gauche / chiffre à droite) : même largeur, bord aligné ; côte à côte couché, empilés debout (la requête portrait ne change plus que `grid-auto-flow:row`).
- FICHE = UNE PLAQUE (`#gCard`, hub ET inventaire) : encre rgba(11,13,18,.8) + filet 2 px `--c6-e3` (la peau de la plaque de l'inventaire), padding 8. Grille `max-content 1fr 48px` : NOM (16 px pixel) sur 2 colonnes ; dessous COMMUNE (police système 13/800, barre de 4 px à sa couleur) puis « 1 / 49 » (système 13/700) ; l'ŒIL 48 × 48 au bord droit de la plaque, sur les deux lignes (≥ 12 px du nom : colonne de 12 px). Inventaire : même plaque sans la colonne de l'œil.
- INVENTAIRE NEUF : `#gBottom.c6Peu` (≤ 3 cartes, classe posée par un MutationObserver dans le bloc « L'EN-TÊTE DU HUB ») = hauteur du contenu, 200 px mini (la même sur tous les onglets : la rangée d'onglets ne saute pas), 40 vh / 360 px maxi ; couché ancrée en haut (plus de `bottom`). `#gBottom.c6VideV` (peu de cartes ET onglet VOITURES) montre `#gC6Vide` : « Tes caisses apparaîtront ici » (blanc) / « Gagne-les en course ou à la boutique » (gris), police système 13/700, `data-fr` + entrées `I18N` (anglais ; le chinois retombe sur l'anglais). `?ui=5` : `#gC6Vide{display:none}` hors c6. `.gVide` (« RIEN ICI ») en système 13 px.
- ONGLETS de l'inventaire : police système 800 12 px (11 px sous 400 px de large et en couché ≤ 700), `flex:1 1 auto` (chaque onglet = son mot + sa part).
- CARTES de l'inventaire : nom d'objet 12 px système, prix 12 px système (étaient du pixel 8 px) — NON VU (un joueur neuf n'a ni nom ni prix à l'écran).
- INVENTAIRE · BOUTIQUE (hub) : 10 → 12 px (la taille d'une touche du socle) ; l'icône est retirée couché (10 lettres × 12 = 120 px dans 144-160 px) — debout elle reste.
- `#gTourne` (Léo) : sa zone de toucher faisait DÉJÀ 48 px (`.gtZone`, vu au banc : `elementFromPoint` = gtZone en haut / milieu / bas) mais son conteneur n'en mesurait que 30 (audit « PETIT »). Bordure transparente de 9 px (`box-sizing:content-box`) + marge négative −9 px : le conteneur mesure 48, le trait et le patin ne bougent pas ; debout (dans le flux, `gtConsole`) marge basse 10 → 1 px : 9 px de plus au total. Comportement intact (aucune ligne de JS de la jauge).
- (11 h 20-12 h, reprise) VU au banc après le correctif de la plaque : `#gCard` avait hérité `container-type:inline-size` de l'ancienne feuille (`html body #garage:not(.menu) #gCard`, ~l.5491) → largeur intrinsèque 0 → plaque de 88 px ; corrigé par `container-type:normal` (commit 583f3a2). Onglet AILES à 43 px sur 667 → `min-width:44px`.
- RELEVÉ FINAL (joueur neuf, `p2.cjs`, fr, 6 formats couche/debout/i7couche/i7debout/maxcouche/maxdebout) : 0 erreur JS, `boutons()` 0 problème (hub et inventaire), aucun texte sous 11 px dans #garage (avant : 6 à 9 par écran), plaque de la fiche 207×64 (hub) / 147×60 (inventaire), œil à 15 px du nom, comptes 112 + 112 px, panneau d'inventaire 200-211 px de haut (281 couché / 40 % debout avant). Anglais (debout) : hint « Your crates will show up here / Win them in a race or at the shop », onglets 11 px sans débordement. `?ui=5` (couche) : c6=false, `#gC6Vide` et `#gC6Tete` en display:none. Captures `shots/garage/p2/` (`avant-*`, `apres-*`, `p1/` = le 1er passage avant correctif, planche `garage-avant-apres.png`).
- Fusion de `ui-integration` (92741da, T5) faite dans ui/garage (1d9d783) : `grep -c "I18N_ZH|LANG==='zh'|html.c6.poki|html.poki"` = 0 ; syntaxe 0 erreur, garde burn-out OK. ⚠ la fusion est postérieure aux captures (non revérifiée à l'écran).
- NON VU : une caisse verrouillée / à défi (`#gDesc`, `#gMeta`) dans la nouvelle plaque ; un nom long sur 2 lignes dans la plaque ; cartes d'inventaire avec nom/prix (12 px système) ; ACHETER ; l'appui de l'œil ; `?ui=5` seulement vérifié par ses propriétés (pas regardé). Vignettes éclairées rose/violet (ticket P2 inventaire) : non traitées.
- À TRANCHER : la jauge `#gTourne` n'a toujours pas de libellé (le ticket disait « libellé ou invisible ») ; INVENTAIRE · BOUTIQUE n'ont plus d'icône couché (mot seul).
