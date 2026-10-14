# CASH CAR — LA REFONTE DE L'INTERFACE (2026-10-14) — RÈGLES COMMUNES À TOUS LES AGENTS

Sacha (créateur du jeu, avec Léo) : « J'ai plein de problèmes d'interface. Des gens ont vu l'interface : **ça fait trop IA**. Refonte
totale : que tous les boutons soient mieux, que tous les écrans soient plus cohérents, qu'il n'y ait pas de boutons au mauvais endroit,
pas de boutons qui se répètent, pas de trucs inutiles. Inspire-toi de ce qu'on a déjà fait, mais que tout soit parfaitement fait :
des belles transitions, tout parfaitement logique, parfaitement agencé. Tu peux changer complètement des systèmes. Il faut juste que ce
soit le plus clair, le plus simple, le plus optimisé, le plus agréable. »

Tu fais partie d'une équipe d'agents qui refont l'interface EN MÊME TEMPS, chacun SA zone, chacun SA copie git. Le chef de chantier
(la session INTERFACE) a posé le SOCLE et fusionnera vos branches.

## 0. ⚠ LES RÈGLES DE LA NUIT (PILOTAGE, 14/10 — elles passent AVANT tout le reste de ce document)
Le Mac (16 Go) a REDÉMARRÉ à 2 h 05, saturé par cinq flottes d'agents ; aucun agent n'avait commité, tout a été perdu. La version App Store
sort DEMAIN. Une session « PILOTAGE » répartit désormais la machine et les tokens (`~/cash-car/pilotage/REGLES.md`). Pour toi :
- **Mission COURTE : 20 à 30 minutes, UN écran, UN livrable.** Ta mission est écrite dans ton message de lancement, avec les fonctions et
  les lignes : tu ne re-cartographies pas le fichier, tu ne lis ni `index.html` ni `CLAUDE.md` en entier.
- **UN COMMIT APRÈS CHAQUE CORRECTIF QUI MARCHE** (au moins un par écran amélioré). Un agent sans commit au bout de 20 min est un agent perdu.
- **UNE SEULE ouverture de navigateur à la fois pour TOUTE la session** (le verrou de `ui/banc/lib.cjs` y veille : tu attends ton tour ;
  3 créneaux pour toute la machine). Donc : travaille d'abord dans le CODE (les tailles se calculent : 844×390, 390×844, 667×375 ; la
  police fait 1 em par lettre), puis UNE ouverture qui fait TOUT ton relevé (plusieurs formats = plusieurs `B.ouvre` à la suite dans le
  même script, jamais en parallèle), `await s.ferme(); process.exit(0)`. Jamais Chrome autrement que par `ui/banc/lib.cjs`, jamais `CC_SLOTS`.
  Vise 2 à 4 ouvertures pour toute ta mission. Pas de boucle d'attente active.
- **Vérification allégée** (remplace le §8) : tes écrans en `couche` (844×390), `debout` (390×844) et `i7couche` (667×375), en français ;
  les libellés anglais vérifiés par le calcul (longueur × corps) ou une seule capture `lang:'en'`. 0 erreur JS. Syntaxe + garde du burn-out.
- **Le journal commun** : avant de toucher une fonction JS, `grep -n '<fonction>' ~/cash-car/debug/journal-correctifs.tsv` (quelqu'un y est
  peut-être) ; après chaque commit : `printf 'INTERFACE:<zone>\t<fonction ou sélecteur>\t<lignes>\t<titre>\n' >> ~/cash-car/debug/journal-correctifs.tsv`.
- **LA BOUTIQUE 3D EST GELÉE POUR TOUT LE MONDE** (Léo la refait en direct sur main cette nuit) : on ne touche à rien de `#gBq…`, `garBq…`,
  `GBQ`, `achatPop`, ni aux voitures. Si ta zone la frôle, tu t'arrêtes à sa porte et tu notes.
- **La base** = la branche `assemblage` (main du 14/10 2 h 13 + le mode classique au hasard + l'optimisation du jade). La « passe mobile » de
  Léo (commit `9522ba6`) a remplacé les `:has()` du HUD par des CLASSES pour la fluidité : ne remets JAMAIS de `:has()` sur un élément qui
  vit pendant la course, ni d'animation de `background`/`box-shadow`/`filter`.
- Si ton serveur ne répond plus : `sh /Users/sachaberes/cash-car/ui/banc/serveurs.sh`.

## 1. LE DIAGNOSTIC (40 captures, dans `$R/shots/avant/` — REGARDE celles de ta zone avant de commencer)
- CINQ langages visuels dans le même jeu : la laque néon des menus (accueil, réglages, offres, carrière, pause, fin), la console du
  garage (dégradés bleus, lingot, œil orange à trame), les missions « sci-fi » (crochets cyan), la boutique blanche de Léo, le HUD.
- La laque néon = le cliché « généré par IA » : noir violet, magenta + cyan + or, plaques penchées à coins coupés, lueurs, reflets
  animés, dégradés partout, trame de points, livrée tricolore sous chaque titre, une couleur différente par bouton.
- Du travail pas fini : libellés coupés (« ARRIERE », « ISSIONS »), boutons qui se chevauchent, contenus cachés sous le dock RETOUR,
  cibles de 30 px, un tiers de l'écran couché perdu pour un seul bouton RETOUR.
- Des doublons : HOME ×4, MISSIONS à l'accueil ET au garage, OFFRES à l'accueil ET au garage ET à la fin, RÉGLAGES à la fin, etc.
- Le seul écran qui ne « fait pas IA » : **la BOUTIQUE de Léo** (encre et blanc, à plat, droit, pixel net). C'est la référence.

## 2. LA CHARTE 6 — ENCRE · BLANC · OR
Le socle est dans `<style id="charte6">` (le DERNIER `<style>` de la page ; LIS-LE EN ENTIER, ~150 lignes : `grep -n 'id="charte6"' index.html`).
Toutes les règles commencent par `html.c6` (classe posée dans le `<head>` ; `?ui=5` l'enlève = l'ancienne interface, pour comparer).
1. **Trois matières, à plat.** L'ENCRE `--c6-e0…e4` (plaques, fonds), le BLANC `--c6-b0` + gris `--c6-g1/g2` (texte, filets), l'OR
   `--c6-or` (LA décision de l'écran). Sens : vert `--c6-cash` = l'argent, violet `--c6-aura` = l'aura, rouge `--c6-rouge` = danger —
   sur des CHIFFRES ou des états, jamais en décor. Les couleurs de RARETÉ restent (c'est du sens) : une barre de 4 px ou une puce, pas un halo.
2. **INTERDIT** : dégradé (sauf photo/3D), lueur (`box-shadow` flou, `drop-shadow`, `text-shadow` flou), reflet animé, trame, coin coupé
   (`clip-path` décoratif), `skew`/italique, `backdrop-filter`, néon magenta/cyan, texte en dégradé (sauf le LOGO, qui ne change pas),
   bordure de 1 px (c'est 2 px ou rien), rayon arrondi, emoji/caractère Unicode en guise d'icône (les icônes = le jeu `.pxi`).
3. **UNE touche** : `.pbtn` (face `--c6-f`, filet 2 px `--c6-l`, épaisseur 4 px `--c6-tr`, texte `--c6-x`) ; à l'appui elle descend de 4 px.
   `.pb-gold` = la décision (UNE SEULE par écran) · `.off` · `.pb-red` (confirmation destructrice seulement) · tailles : 48 px (défaut),
   `.big` 64 px, `.pbCarre` 48 × 48 (icône seule). Sur une scène CLAIRE (la boutique), le conteneur porte `.c6Clair` : touches blanches à
   filet d'encre. Toute chose touchable de l'interface est une `.pbtn`, une ligne de liste, un onglet ou une carte — rien d'autre.
4. **Le pixel, droit.** Press Start 2P (`var(--pix)`), jamais penché, `letter-spacing:0`. Corps : **8 · 10 · 12 · 16 · 24 · 32** px, pas
   d'autre. Cette police est très LARGE (1 em par lettre) : compte la largeur (`n lettres × corps`) avant de poser un mot ; un libellé
   ne se coupe JAMAIS, ne passe jamais à la ligne dans une touche. Un paragraphe (> 6 mots) se lit en `var(--sans)` 13 px, 2 lignes max
   — et la plupart des paragraphes doivent disparaître (« pas besoin de mettre autant de texte », Sacha).
5. **La grille de 8.** Marges, écarts, hauteurs : multiples de 4, de préférence de 8. Bord d'écran = 16 px + zone sûre (`--sT --sB --sL
   --sR`, TOUJOURS). Écart entre deux touches = 8 px. Sur une même rangée : même hauteur, mêmes lignes de base.
6. **Un rôle = une place, sur tous les écrans, couché ET debout :**
   - **RETOUR = en haut à gauche**, la touche `.c6Ret` (48 × 48, icône ◀ `pxi-gauche`, sans mot) dans l'en-tête `.c6Tete`, au même pixel
     partout. Plus de dock « RETOUR » en bas, plus de bouton « HOME » en mot. (Seule exception : l'écran de FIN, qui a une touche maison
     48 × 48 à gauche de REJOUER.)
   - **Le TITRE** de l'écran à droite du retour (`.c6Titre`, 16 px). **Les COMPTES** (argent, aura) en haut à droite (`.c6Comptes` >
     `.c6Sou.cash` / `.c6Sou.aura`) sur les écrans où ils servent (garage, inventaire, boutique, offres, missions).
   - **LA DÉCISION** (l'or) en bas à droite couché, en bas sur toute la largeur debout.
   - Le contenu défile SOUS l'en-tête ; rien n'est jamais caché sous une touche fixe.
7. **Rien en double, rien d'inutile** (voir §4 les décisions par écran). Si deux touches mènent au même endroit depuis le même écran, une
   des deux part. Si un texte explique ce que l'écran montre déjà, il part.
8. **Le mouvement** : une touche = 90 ms à l'appui (`--c6-vite`), un écran = 200 ms (`--c6-pose`, `--c6-courbe`). Un écran qui entre :
   ses blocs montent de 8 px en fondu, en cascade de 30 ms (5 blocs max) ; il sort en fondu sec de 100 ms. Avancer = de droite à gauche,
   revenir = de gauche à droite. Jamais de rebond hors célébration (achat, record). `transform` et `opacity` seulement (iPhone 7).
   `prefers-reduced-motion` respecté.
9. **Cibles ≥ 44 px**, toujours. 0 chevauchement, 0 débordement, 0 texte coupé, dans les 4 formats (§5).

## 3. LES COMPOSANTS DU SOCLE (dans `<style id="charte6">` — utilise-les, n'en réinvente pas)
```html
<!-- l'en-tête d'un sous-écran -->
<div class="c6Tete [plein]">                      <!-- .plein = fond d'encre (pages) ; sans = transparent (posé sur une scène 3D) -->
  <div class="pbtn pbCarre c6Ret" role="button" tabindex="0" aria-label="Retour"><i class="pxi pxi-gauche" aria-hidden="true"></i></div>
  <b class="c6Titre">REGLAGES</b>
  <div class="c6Comptes">
    <span class="c6Sou cash"><i class="pxi pxi-piece" aria-hidden="true"></i><b>$ 8,9 M</b></span>
    <span class="c6Sou aura"><i class="pxi pxi-etoile" aria-hidden="true"></i><b>120 000</b></span>
  </div>
</div>
<!-- onglets -->      <div class="c6Onglets"><button class="c6Onglet on">VOITURES</button><button class="c6Onglet">PEINTURE</button></div>
<!-- carte d'objet --> <div class="c6Carte [on] [acquis]" style="--rc:#4aa8ff"><i class="c6Img"></i><b class="c6Nom">LE CAID</b><span class="c6Prix">$ 50 k</span></div>
<!-- chiffre + légende --> <div class="c6Stat"><b>539</b><small>KM/H MAX</small></div>
<!-- jauge -->        <i class="c6Jauge" style="--v:.4"></i>
```
Si un composant du socle ne suffit pas, étends-le DANS TON bloc (`<style id="c6-<zone>">`) et note-le dans tes notes, section « POUR
LE SOCLE » : le chef de chantier le remontera.

## 4. LES DÉCISIONS, ÉCRAN PAR ÉCRAN (tranchées par le chef de chantier ; améliore, ne trahis pas)
- **ACCUEIL** (structure voulue par Sacha le 12/10, gardée) : le LOGO (intouché, mais la livrée tricolore dessous DISPARAÎT), JOUER =
  le mot d'or flottant (sans plaque), et UNE rangée de cinq touches de même hauteur : CARRIÈRE · MISSIONS (à mot) puis GARAGE · OFFRES ·
  RÉGLAGES (icônes). Même peau pour les cinq (encre, filet blanc), mots ENTIERS. La pastille « 39 » du garage : un chiffre qui ne
  dit rien → une pastille sans chiffre si quelque chose est achetable, rien sinon.
- **RÉGLAGES · OFFRES · CARRIÈRE · MODES** : l'en-tête commun, plus de dock ; le contenu prend toute la hauteur. Réglages : aucune ligne
  sur deux lignes (« POUCE HAUT EN VOL » se raccourcit — ⚠ et dans les autres langues de `TR`). Offres : la même carte que la boutique.
  Carrière : la carte entière est la cible (les « 0 / 5 ▸ » de 30 px ne sont plus des boutons).
- **GARAGE** : en-tête (◀ = retour à l'accueil ; comptes à droite) ; sous l'en-tête à gauche le NOM de la caisse, sa rareté, « 1 / 51 »,
  et l'ŒIL en petite touche 44 px à côté du nom (Sacha, 13/10 : « l'œil prend beaucoup trop de place, mets-le en petit flottant sous
  le nom ») ; en bas à droite (en bas debout) : INVENTAIRE · BOUTIQUE (deux touches jumelles) au-dessus de JOUER (l'or). MISSIONS quitte
  le garage (elle est à l'accueil). La barre « OFFRES ÉPHÉMÈRES » quitte le garage (les OFFRES sont à l'accueil — Sacha, 13/10 :
  « enlève ce bouton dans le shop, il existe déjà sur l'écran d'accueil en mieux »). La jauge qui tourne le garage (Léo) reste, épurée.
- **INVENTAIRE** (l'atelier fermé de Léo : porte, lampe, pinces — la SCÈNE ne change pas) : en-tête (◀ = retour au garage), onglets
  `.c6Onglets`, grille de `.c6Carte`, la décision en or (ÉQUIPER / ACHETER) seulement quand il y a un choix.
- **BOUTIQUE** — ⚠ GELÉE (voir §0) : ce qui suit est noté pour plus tard, PERSONNE n'y travaille cette nuit. (la rotonde blanche de Léo — LA RÉFÉRENCE) : `.c6Clair`, en-tête (◀ en haut à gauche
  à la place du RETOUR du milieu), plus d'onglet OFFRES (Sacha, 13/10), ACHETER en or, ÉQUIPÉE = état d'encre coché.
- **MISSIONS** (l'idée de Léo — le garage vu de face, les défis reliés par des fils — reste) : la peau de la charte (plus de crochets
  cyan ni de bleu « sci-fi » : cartes d'encre, fils blancs), en-tête, UNE phrase d'aide au lieu de trois lignes, JOUER en or en bas à droite.
- **HUD DE COURSE** (la veille de la sortie : on ne DÉPLACE rien, on ne change ni les tailles ni l'ordre — validés par Sacha) : ses
  chiffres en pixels à bandes dures (clair / plein / ombre, contour d'encre) sont du vrai pixel-art, ils RESTENT, avec leurs couleurs
  d'ambiance. On aligne ce qui détonne sur la charte : le ⏸ = touche d'encre 48 × 48 droite à filet blanc ; la plaquette du pouvoir actif,
  les cartes de l'auto-école et les bandeaux d'annonce = encre + filet, à plat ; rien de penché, aucune lueur floue, aucun dégradé fondu ;
  les zones sûres respectées. Le bouton NITRO (l'éclair en pixels de Léo) ne change pas.
- **PAUSE** : REPRENDRE en or ; RECOMMENCER · QUITTER en touches ; le résumé ; les réglages en liste. Deux colonnes couché.
- **FIN DE PARTIE** : une HIÉRARCHIE au lieu de sept boîtes du même poids. 1) le verdict (titre) ; 2) le HÉROS = l'argent gagné, en
  grand, vert (Sacha : « l'argent doit être mis plus en avant »), le compte dessous ; 3) AURA et MOTEUR (deux cartes moyennes) ;
  4) UNE bande de petits chiffres ; 5) le défi. En bas : la maison (48 × 48) + REJOUER (l'or). OFFRES et RÉGLAGES quittent cet écran.
- **TRANSITIONS** : voir règle 8 ; le volet `#wipe` devient un rideau d'encre plein (plus de liserés or/magenta, plus de « CASH CAR »).

## 5. TA COPIE, TON SERVEUR, TON BANC
- `R=/Users/sachaberes/cash-car/ui` (permanent). Ta copie git : `$R/wt/<zone>` (branche `ui/<zone>`), le jeu : `VERSION PRINCIPALE/index.html`
  (5 Mo, ~52 000 lignes, Three.js, tout dans une IIFE). ⚠ des lignes font > 5 000 caractères : ne JAMAIS `cat` le fichier ni le lire en
  entier ; `grep -n … | cut -c1-300`, `sed -n 'A,Bp' | cut -c1-400`, ou Read avec offset/limit.
- Le guide du jeu : `VERSION PRINCIPALE/CLAUDE.md` (800 Ko — NE PAS le lire en entier : `grep -n '^## ' CLAUDE.md | grep -i <ta zone>`,
  puis lis les sections de ta zone : elles disent ce que Sacha et Léo ont DEMANDÉ, mot pour mot. Tu peux améliorer, pas trahir).
- Ton serveur : `http://localhost:<port>/index.html` (voir `$R/ports.txt`). S'il est tombé :
  `cd "$R/wt/<zone>/VERSION PRINCIPALE" && python3 -m http.server <port> --bind 0.0.0.0` (Bash, `run_in_background`).
- Le banc (Chrome sans fenêtre, vrais doigts) : `$R/banc/lib.cjs` — LIS-LE (140 lignes). `$R/banc/tour.cjs` et `tour2.cjs` = le tour
  de tous les écrans (modèles à copier dans `$R/banc/<zone>/`). Exemple :
  ```js
  const B=require('/Users/sachaberes/cash-car/ui/banc/lib.cjs');
  (async()=>{ const s=await B.ouvre({port:85xx, vp:'couche', marges:true, dir:'/Users/sachaberes/cash-car/ui/shots/<zone>/apres', save:{bank:5000000,aura:120000,owned:[0,1,2,3,4,5]}});
    await s.shot('accueil'); const a=await s.boutons(); console.log(a.problemes.join('\n')||'0 problème');
    await s.tapSel('#mHome [data-m="set"]'); await s.shot('reglages');
    console.log(s.errs.join('\n')||'0 erreur'); await s.ferme(); process.exit(0); })();
  ```
  - Formats : `couche` 844×390 (LA référence), `debout` 390×844, `i7couche` 667×375, `i7debout` 375×667 (iPhone 7/8/SE : le plus petit).
    `marges:true` = les zones sûres de l'iPhone (encoche 47 px couché, barre 21/34 px). `lang:'en'` pour l'anglais.
  - `save:{…}` (fusionné avec `{tuto:1,permis:1,ast:3,shopVu:1,facile:0}`) ; `save:null` = joueur NEUF. `q:'?ui=5'` = l'ancienne interface.
  - `s.boutons()` = audit de tout ce qui se touche (PETIT < 44, HORS ÉCRAN, DANS LA MARGE, MASQUÉ, TEXTE COUPÉ, CHEVAUCHE). Un outil,
    pas une vérité : **REGARDE tes captures (Read sur le .png). C'est l'œil qui juge** — alignements, marges, tailles, hiérarchie.
  - La machine est TRÈS chargée (cinq sessions tournent) : un chargement prend 30-90 s, 2 navigateurs au plus à la fois (sémaphore).
    ⇒ UN navigateur pour BEAUCOUP de vérifications ; scripts longs en `run_in_background` avec un log ; toujours `s.ferme(); process.exit(0)`.
  - `B.planche([{f:'a.png',t:'légende'},…],'planche.png',{cols:3})` = planche contact.
- Les fonctions du jeu sont privées (IIFE) ; seules les `window.dbg*` sont visibles du banc (`grep -o 'window\.dbg[A-Za-z0-9_]*' index.html | sort -u`).
  Tu peux en AJOUTER (une ligne, préfixe dbg, commentaire « banc »).
- Syntaxe après CHAQUE modif : `node $R/banc/syntaxe.cjs "$R/wt/<zone>/VERSION PRINCIPALE/index.html"` → 0 erreur.

## 6. COMMENT ÉCRIRE DANS LE FICHIER (on est 8 dessus, plus 4 autres sessions et Léo)
- **Ton CSS** : dans TON bloc `<style id="c6-<zone>">` — il EXISTE DÉJÀ, vide, juste après `charte6` (`grep -n 'id="c6-' index.html`).
  N'écris QUE dans le tien (jamais dans `charte6` ni dans celui d'un autre : c'est ce qui permet de fusionner sans conflit), et ne
  touche pas à ses lignes `<style …>` / `</style>`. Chaque règle commence par `html.c6`. C'est là que tu NEUTRALISES l'ancienne matière de tes écrans (dégradés, lueurs, penchés,
  coins coupés, animations de reflet posés par charte4, garageV6/V7, garageVitrine, hubGarage, carriereV2, uxPasse, hudDA…) et que tu
  poses la nouvelle mise en place. N'efface PAS les anciennes feuilles (d'autres sessions les fusionnent) : tu les domines.
  Évite `!important` (la spécificité `html.c6 #id` suffit presque toujours ; si l'ancienne règle a `!important`, alors oui).
- **Ton HTML** : tu peux restructurer le DOM de TES écrans (ajouter l'en-tête, retirer une touche en double, regrouper). Garde les `id`
  que le script lit (`grep -n "'<id>'\|#<id>" index.html`) ; une touche retirée : vérifie que plus rien ne l'attend (`$('x')` → null = plantage).
- **Ton JS** : chirurgical, dans les fonctions de ta zone. Pas de reformatage, pas de renommage global, pas de déplacement de gros blocs.
- **Libellés** : si tu changes un mot français, mets à jour `TR` (les autres langues : `grep -n "TR=\|const TR" index.html`) — la session
  DETAIL traduit, elle ne renomme pas. Les mots restent en CAPITALES SANS ACCENT (la police du jeu).
- Commentaires en français, datés « (2026-10-14, charte 6) », qui disent POURQUOI.
- **INTOUCHABLE** : le BURN-OUT du garage (tout ce qui commence par `burn`/`BURN`/`DON` — à Léo ; `sh garde-burnout.sh` à la racine de
  ta copie doit dire OK) ; les SCÈNES 3D (garage, boutique-rotonde, atelier, ciel du titre — tu refais l'interface POSÉE dessus, pas la 3D) ;
  le LOGO ; `sw.js`, les `CLAUDE.md`, `ROBLOX/`, `AUTRE VERSION/`, `app-ios/`, `simulateur*`, `maps-ciel*`, `salle-blanche*`, `boite-*`.
  Ne supprime aucune FONCTION du jeu (un écran, un mode, un objet) : tu changes où et comment on y accède. (14/10, T5) L'édition POKI,
  le chinois et CRYPTOCITY ont été RETIRÉS par Sacha : n'écris plus jamais `html.poki`, `html.c6.poki`, `POKI`, `I18N_ZH`, `LANG==='zh'`
  ni de 3e argument chinois ; `grep -c "I18N_ZH\|LANG==='zh'\|html.c6.poki\|html\.poki"` sur index.html doit rester à 0.
- **Hors de ta zone** : tu n'y touches pas. Tu notes dans `$R/notes/<zone>.md`, section « POUR LES AUTRES ».

## 7. GIT (ABSOLU)
- Tu travailles UNIQUEMENT dans `$R/wt/<zone>`. **Un commit après CHAQUE correctif qui marche** (au pire toutes les 20 min, « (en cours) ») :
  la limite d'usage peut couper l'équipe à tout moment, et ce qui n'est pas commité est perdu. Message en français, style du dépôt :
  « Interface · <zone> : ce qui change (charte 6) », terminé par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- JAMAIS : push, merge, rebase, reset --hard, `git stash`, toucher à `main`, supprimer une branche, écrire dans une autre copie.

## 8. QUALITÉ EXIGÉE (avant de rendre)
- 0 erreur JS au banc sur chaque parcours de ta zone ; `s.boutons()` : 0 PETIT / CHEVAUCHE / MASQUÉ / TEXTE COUPÉ / HORS ÉCRAN sur tes écrans.
- Tes écrans dans les **4 formats** (couche, debout, i7couche, i7debout), en FRANÇAIS et en ANGLAIS (`lang:'en'` : les mots anglais
  ont d'autres longueurs), joueur riche ET joueur pauvre/neuf si ton écran en dépend.
- menu → JOUER → course → mort → REJOUER marche encore, couché et debout.
- Captures APRÈS dans `$R/shots/<zone>/apres/` + une planche `$R/shots/<zone>/planche-apres.png` (et `planche-avant.png` depuis `$R/shots/avant/`).
- Relis tes captures une dernière fois avec la liste « INTERDIT » de la règle 2 : s'il reste un dégradé, une lueur, un penché, un
  cyan/magenta, une bordure de 1 px, un mot coupé — ce n'est pas fini.

## 9. À RENDRE
1. Des commits sur `ui/<zone>` (`git status` propre).
2. `$R/notes/<zone>.md`, tenu AU FIL DE L'EAU : ce que tu as changé (sélecteurs, fonctions, pourquoi), ce qui a été RETIRÉ ou DÉPLACÉ
   (pour que Sacha et Léo le sachent), « POUR LE SOCLE », « POUR LES AUTRES », ce qui reste, les questions à trancher.
3. Ton dernier message : un rapport court (≤ 30 lignes) : fait / retiré-déplacé / vérifié (formats, langues, erreurs) / reste /
   zones du fichier touchées (pour la fusion).

## §0 bis — RÈGLES DE 6 H (14/10) : elles PRIMENT sur la charte 6 ci-dessus là où elles la contredisent
Sacha (4 h 50-4 h 58) : « très loin d'un niveau professionnel », « l'interface est AFFREUSE SUR IPHONE ». Le critique (`notes/oeil-neuf-iphone.md`,
note 4,5/10) : texte pixel à 8-10 pt illisible, debout = couché empilé avec 40-50 % de vide, quatre langages visuels, JOUER pas un bouton.
Une direction artistique complète est en attente du choix de Sacha (`maquettes/DIRECTIONS.md`) ; d'ici là on corrige ce qui restera vrai
quelle que soit la direction :
1. LISIBILITÉ : AUCUN texte sous 11 px. Press Start 2P seulement pour les titres (≥ 16 px) et les gros chiffres ; tout texte courant,
   légende, sous-ligne, aide, libellé de ligne → police système `-apple-system, system-ui, "Segoe UI", Roboto, sans-serif`, 13 px min,
   graisse 600-800, capitales autorisées. (Ex. : 16 textes à 8 px sur la fin → 13 px système.)
2. LE DEBOUT SE COMPOSE pour lui-même : pas plus de ~15 % de hauteur vide sans raison ; cartes pleine largeur, action sous le pouce.
3. ICÔNE SEULE INTERDITE pour une navigation (sauf ⏸ et ◀) : icône + mot.
4. JOUER / REJOUER / ACHETER = une vraie plaque pleine, la même partout.
5. RETOUR = ◀ carré en haut à gauche PARTOUT (y compris boutique et offres).
6. Jugé SUR IPHONE : captures en 375×667, 390×844 et 430×932, debout ET couché (dpr 3, marges iPhone simulées : îlot 59 / barre 34
   debout, 59 g-d / 21 bas couché ; SE sans encoche). Dis ce que tu n'as pas pu voir.
7. Un banc d'image = UN navigateur à la fois pour toute la session (verrou de `banc/lib.cjs`) : 5 agents le partagent, attendre est normal.
   Prépare tout en statique, ouvre peu, au plus 4 passages.
8. (6 h 10, cap de Sacha) La direction artistique (maquettes `dir-*`) est EN PAUSE : aucune refonte. On PEAUFINE la charte 6 existante et
   on ACCORDE tout avec tout : même bouton, même marge, mêmes tailles de texte, même retour au toucher, même transition sur chaque écran,
   l'interface accordée aux décors 3D (garage, boutique blanche), du SE au Pro Max, debout et couché. Les règles 1-7 ci-dessus restent ;
   une passe d'harmonisation les étendra à TOUS les écrans pour qu'il n'y ait pas deux régimes.
