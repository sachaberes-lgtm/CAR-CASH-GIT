# ios-ultime : agent POLICES — diagnostic (12/11/2026)

Diagnostic seulement : RIEN n'a été modifié dans le dépôt. Preuves et captures dans `~/cash-car/ios-ultime-mesures/polices/`
(`20-planche-symboles.png` = le défaut, `21-planche-avec-ccsymboles.png` = après correctif, `02-reglages.png` = faux gras visible sur « 100% » / « 62% »).
Banc : Playwright WebKit 390×844 ×3 sur `VERSION PRINCIPALE/index.html?app=1&tel=1`. C'est le WebKit du Mac, pas celui de l'iPhone : la liste des
glyphes absents est exacte (cmap), mais la police de secours choisie (Apple Symbols, Apple Color Emoji, Menlo…) est la même famille qu'en iOS, pas forcément le même dessin.

## 1. Inventaire des polices (tout est sain)

| famille | fichier | format | `font-display` | `unicode-range` | `fichier:ligne` |
|---|---|---|---|---|---|
| Press Start 2P | `assets/fonts/pressstart2p.woff2` (12 512 o, 220 glyphes) | woff2 | swap | aucun | `code/css/socle-1.css:33` |
| CC Silkscreen | `silkscreen.woff2` (215 gl.) | woff2 | swap | aucun | `socle-1.css:36` |
| CC Jersey | `jersey10.woff2` (206) | woff2 | swap | aucun | `socle-1.css:37` |
| CC Sixtyfour | `sixtyfour.woff2` (219) | woff2 | swap | aucun | `socle-1.css:38` |
| CC Jacquard | `jacquard12.woff2` (206) | woff2 | swap | aucun | `socle-1.css:39` |

- Un seul `<link rel=preload as=font type=font/woff2 crossorigin>` : Press Start 2P (`code/page/tete.html:32`). Les 4 polices de rareté sont chargées par JS à +2,5 s (`code/interface/hud-figures.js:47`).
- Les 5 fichiers existent dans `VERSION PRINCIPALE/assets/fonts/` ET `app-ios/www/assets/fonts/` ET `app-ios/ios/App/App/public/assets/fonts/` : octet pour octet identiques (`diff -rq` vide). `preparer-www.js:42` garde `assets/` en entier, `retraits-publies.cjs` / `publie-allege.cjs` ne touchent à aucune police.
- Chemins relatifs `./assets/fonts/...` : valables sous `capacitor://localhost`. Aucune adresse réseau, aucun Google Fonts. (`pages-app/assistance.html` et `confidentialite.html` ont leur propre pile système `-apple-system` : ce sont des pages web de site, pas l'app.) WebKit lit woff2.
- Dans WebKit, au bout de 9 s : les 5 faces sont `loaded`, `document.fonts.check('10px "Press Start 2P"')` = true, aucun `fillText` n'a été exécuté avant le chargement de la police (garde posée sur le prototype du contexte : liste vide).
- Les polices de rareté couvrent tout l'ASCII imprimable ; les noms de figures passent par `sansAcc` (`hud-figures.js:60`) donc ne contiennent que de l'ASCII : pas de défaut sur les `data-rp`.
- Le jeu est un seul `<script>` inline : l'ordre dans l'app est `natif.js`, `achats.js`, puis le filet canvas `UNE_POLICE` (`index.html` de www:1971) avant tout le reste, comme sur le web. Pas de différence d'ordre.

## 2. Caractères absents de Press Start 2P (cause n°1)

**Bonne nouvelle** : le français est complet. Press Start 2P contient À Â Æ Ç È É Ê Ë Î Ï Ô Œ Ù Û Ü Ÿ(non) … œ « » ‘ ’ “ ” … – — € × · ° ² ³ ½ ¼ ¾ ↑ ↓ • ™ et l'espace insécable U+00A0. Les chiffres « 1 234 » sont déjà normalisés (U+202F remplacé par une espace dans `passe-textes.js:101,151`, `eco-vague3.js:98`, `aura-chaine.js:40`, `defis-moteur.js:143`, `ecran-revelation.js:18`, `boutique-vitrine.js:43`). **Un seul oubli** : `code/gameplay/evenements-rares.js:229` (`nb=v=>…toLocaleString(LOC())` sans `.replace(/[  ]/g,' ')`) → U+202F en français, absent de la police (espace fine de secours, largeur d'une autre police).

**ABSENTS** (ce que le jeu écrit vraiment, texte / `textContent` / chaînes `TR` ; commentaires exclus ; relevé par script sur `code/`) :

| caractère(s) | où (3 exemples) | police de secours iOS |
|---|---|---|
| **émojis** 💸 🏆 🔒 🔑 🪂 🚀 🧃 🍇 🍉 🍈 🐬 🐷 🛡 🪦 🎯 💥 🏁 🛝 📋 🛸 🤑 🤯 ⚡ | `traductions.js:18` (`'🔒 VERROUILLÉE'`), `:39` (`'🏆 TOP 10'`), `:26` (`'📋 Copier ma sauvegarde'`), `:44` (`'🏁 Survivant'`), `:64` (`'💸 TU COMPTES EN '`), `jus-echelle.js:250-257` (messages 💸/🏆), `gameplay/pouvoirs-orbes.js:25-26` (`msg:'🪂…'`, `'⚡…'`), `seconde-chance.js:627,629` (`'🔑 DÉBLOQUÉ'`, `'🏆 RECORD'`), `passe-textes.js:139,144` (unités `QUINTILLIONS 🛸`) | Apple Color Emoji (couleur, style Apple : le contraire du pixel) |
| ✓ ★ ✦ ↻ ⚠ | `traductions.js:18` (`'✓ ÉQUIPÉE'`), `:22` (`'★ NOUVEAU RECORD — TON NOM'`), `:56` + `jus-echelle.js:349` (`'↻ ON REPART'`), `boucle-2-conduite.js:146` (`'✦ NOUVEAU SECTEUR'`), `traductions.js:60,63` (`'⚠ ATTENTION !'`) | Apple Symbols / Zapf / Apple Color Emoji (⚠ peut sortir en émoji) |
| ← → | `auto-ecole.js:21` + `traductions.js:146` (`'Flèches [←] puis [→]'`) | Apple Symbols |
| ◀ ▶ ◄ ► ▲ ▼ (triangles) | `garage-cadrage.js:120` (`'   ◀ LE TIEN'`), `hud-figures.js:170` + `figures-physique.js:139` (`◄► … ▲ ▼`), `mobile-tactile.js:792` (`'▲ +'`, `'▼ '`) | Apple Symbols |
| ∞ | `traductions.js:33-34` (`'NITRO ∞'`, `'AIR ∞'`), `pouvoirs-orbes.js` | Apple Symbols |
| ⚙ | `economie/achat-carte-moteur.js:246` (`'⚙ '+nom du moteur`) | Apple Color Emoji / Symbols |
| ♥ ♣ ☠ ♦ | `init.js:43` (`SYMS`, avec `︎`), `menu-logo.js:27-31` | Apple Symbols |
| − (U+2212) | `boutique-scene-1.js:638` (`'− '`) | Apple Symbols |
| ⏱ | `traductions.js:147`, `demi-tour.js:514` (`'⏱ AU CHEVEU —'`) | Apple Color Emoji |
| U+202F | `evenements-rares.js:229` (voir plus haut) | autre police |
| outils / atelier seulement (hors parcours joueur normal) | ▾ ▸ (`chute-libre.js:361,374`), ⟲ (`ecrans-garage.html:219`, `#resetBtn` caché), ♭ ♯ (`console-son.js`), ≈ ≤ (`grotte-travailleur.js:45`) | — |

Les émojis et symboles de la ligne « jeu » sont **les plus vus** : `✓ ÉQUIPÉE` / `🔒 VERROUILLÉE` (fiche du garage), `🏆` (classement, écran de fin), les messages `⚡ 🪂 💸 🚀 ✦ ↻` au centre de l'écran en course, `★ NOUVEAU RECORD`.
Déjà protégés : le HUD « LE FIL » sur téléphone enlève tous les symboles (`code/interface/fil.js:42`, `gameplay/pose-verdict.js:24` : `/[←-⯿\uD83C-\uDBFF…]/`), et les icônes de boutons passent par les masques `pxi()` (`icones-fenetre.js:32+`). Restent exposés : `showMsg` (`boost-depart.js:398` : `elMsg.textContent=TR(t)`), les chaînes `TR` de l'interface, `trickMsg` quand `LEFIL.on` est faux (pas de `.fil` : ordi, ou option), l'écran de fin.
Je n'ai pas pu amener la course complète jusqu'au HUD dans Playwright (le voile noir d'ouroboros reste, rendu logiciel) : les écrans de menu, réglages, garage, boutique, missions, scannés en WebKit (texte visible, glyphes hors cmap) : **0 défaut** ; les défauts ci-dessus sont démontrés par la planche `20-planche-symboles.png` (même pile `--pix`) et par le relevé statique.

Pour la rareté (`data-rp`) : rien d'absent (voir §1).

## 3. Échappées à la règle « une seule police »

- Un seul `font-family` hors `var(--pix)` dans le code : `accueil-boutique.css:121` (`var(--rpf),'Press Start 2P',monospace`, voulu). `figures.css:21-22` (`var(--sans)`) et `missions.css:570,575` (`var(--pix,inherit)`) se résolvent sur le pixel : `--sans` = `'Press Start 2P',monospace` (`charte-1-touches.css:59`).
- Filet : `*,*::before,*::after{font-family:var(--pix)!important}` + `::placeholder` (`accueil-boutique.css:104-105`) couvre `input` / `textarea` / `button` / `select` / `::marker` / `::placeholder`. Mesuré en WebKit : tous les nœuds texte visibles ont `Press Start 2P` (ou `CC …`) calculé.
- Pas de `<text>` SVG (le SVG de `ecrans-garage.html:205` est `<path>` seulement), pas de shadow DOM. Un `iframe` : `tete.html:124` = la colonne d'ordi (`html.colonne`), absent de l'app.
- Exception nommée : le `φ` du logo (`#spPhi`) : absent de la police, voulu.
- `<noscript>` et page d'erreur (`debut-corps.html:3`) : `font:14px/1.8 monospace` : écran qui n'apparaît qu'en cas de crash JS, sans importance.
- La police de **secours** de `--pix` est `monospace` (Menlo/Courier sur iOS) : ne sert qu'avant chargement ou si un glyphe manque.

## 4. Texte dessiné sur canvas

- 91 écritures de `.font` / `font:` dans `code/`. Le filet `UNE_POLICE` (`debut-corps.html:51-55`, premier script, avant tout le jeu) réécrit en `"Press Start 2P",monospace` à 62 % du corps toute police canvas qui n'est pas Press Start 2P (Arial Black, Impact, Georgia, monospace, `bold … Arial Narrow` : `boutique.js:475-536`, `livrees.js:31`, `matieres-forme.js:480`, `garage-salle.js:52-57`, `richesse-2.js`) : **aucune texture ne grave une police système**. Les textures qui écrivent déjà `Press Start 2P` passent telles quelles.
- Attente de la police : `apresPolice(f)` (dessine puis redessine au `document.fonts.load('16px "Press Start 2P"')`) : `intro-161.js:865`, `billets-devises.js:114`, `plaque.js:168`, `musique-frenesie.js:547` ; redessin sur `document.fonts.load(...)` : `garage-salle.js:157`, `final-spin.js:200`, `pouvoirs-orbes.js:69`, `zones-caisses.js:393` ; `document.fonts.ready` : `soleil-planete.js:43`, `evenements-rares.js:225`. Banc : zéro `fillText` avant chargement. **Risque résiduel** (théorique, non reproduit) : tout canvas peint une seule fois à l'init sans ces gardes (le filet n'attend pas). Dans l'app la police est un fichier local : le risque est quasi nul.
- **Trou réel** : le filet ne fait rien aux `ctx.font` qui contiennent déjà « Press Start 2P » (`if(!/Press Start 2P/i.test(s))`) : leurs symboles (★ ₿ Ξ ▲ ✓ …) tombent donc dans `monospace`. C'est corrigé par le correctif P-01 (pile ajoutée dans le filet).

## 5. Réglages WebKit

- `-webkit-text-size-adjust:100%` : posé deux fois (`charte-7-details.css:233`, `natif.js:33`) : OK, pas de grossissement en paysage.
- Taille dynamique iOS / « Texte plus grand » : le jeu n'utilise aucune unité `-apple-system-body` / `font: -apple-system-*` ; `textZoom` est une option Android de Capacitor, sans effet sur iOS ; le texte ne suit donc PAS le réglage d'accessibilité (voulu pour un HUD de jeu). Pas de défaut.
- **`font-synthesis` : jamais posé.** Press Start 2P n'a que la graisse 400. Tout `<b>`, `<strong>`, `font-weight:600+`, `<i>`/`font-style:italic` est donc SYNTHÉTISÉ par WebKit (gras par épaississement, italique par penchage : bave sur une police pixel). Relevé WebKit : **16 éléments en graisse ≥ 600** sur les seuls écrans menu/réglages (`B#spGam`, `#stBoostV`, `#stFreqV`, `#avPts`, `#profT`, `#plqT`, `H2#ovSub`, `#mBest`, `#mBest2`, `.volV` = « 100% », `#tgLang`, `#tgCur`, `#tgSnd`, `#tgMus`) — voir `02-reglages.png`, « 100% » et « 62% » plus épais et flous que le reste. CSS qui demande 600-800 : `socle-1.css:152`, `figures.css:21-22`, `boites-blister.css:131` (`font:800 9px`) …
- **Tailles non multiples de 8** : Press Start 2P est dessinée sur une grille de 8 px ; à ×3 les pixels de la police ne tombent juste que pour 8 / 16 / 24 / 32 / 40 px (un pixel de police = 3 px écran entier). Sur les 269 éléments de texte relevés dans WebKit : 83 à un multiple de 8, **175 à un entier non multiple de 8** (9, 10, 12, 14, 7, 11, 13…), **11 fractionnaires** (`26.52px`, `48.36px`). Les échelles `--f0:8 --f1:10 --f2:10 --f3:12 --f4:14 --f5:16 --f6:20 --f7:28 --f8:40` (`charte-1-touches.css:61`) font la majorité : à 10 px un pixel de police = 3,75 px écran, des traits de 3 puis 4 px : le texte « tremble ». Visible dans la planche (`9px / 11px` vs `8px / 16px`). Ce n'est pas un bug mais un choix de DA à trancher : voir P-05.
- `letter-spacing` : 471 règles ; sans effet sur le choix de police. `text-rendering`, `font-variant-ligatures`, `font-smooth` : jamais posés ; sans effet utile (iOS lisse toujours en niveaux de gris ; Press Start 2P n'a pas de ligatures : GSUB seulement pour la locale).

## 6. Défauts, classés par visibilité

### P-01 — Émojis et symboles hors police (ÉLEVÉ, vu partout)
Faits : §2. Sur iPhone, `🏆 🔒 ⚡ 🪂 💸 🚀 …` sortent en Apple Color Emoji (couleur, taille et chasse non pixel), `★ ✓ ✦ ↻ ← → ◀ ▶ ▲ ▼ ∞ ⚙ ⚠ − ♥ ♣ ♦ ☠` en Apple Symbols / émoji, avec une ligne plus haute (le texte « saute »).
Correctif le plus propre (aucun texte à réécrire, une seule police à l'œil, FR + EN d'un coup, DOM + canvas) : une **police de secours pixel** « CC Symboles » **dessinée sur la grille de Press Start 2P** et glissée en 2e dans `--pix`. Elle (a) dessine les symboles d'interface en pixel, (b) mappe tous les émojis (U+1F000-1FAFF, U+2600-27BF, U+2300-23FF, U+2B00-2BFF, FE0E/FE0F/200D) sur un glyphe VIDE d'avance nulle : l'émoji disparaît au lieu de s'afficher en couleur. Il n'existe AUCUNE police pixel dans le dépôt qui couvre ces symboles (cmap des 5 polices lue : ni → ← ★ ✓ ▲ ▶ ⚙ ∞) : j'ai donc dessiné celle-ci avec fontTools (dessin original, pas de licence tierce). Testée dans WebKit, DOM et canvas : `21-planche-avec-ccsymboles.png` (émojis disparus, symboles en pixel ; ⚡️ ❤️ 🏎 avec sélecteur FE0F aussi).
⚠ Ce sont des GLYPHES DE BROUILLON (✦, ⚙, ◀/▶, ≤/≥ à reprendre à l'œil de Sacha ; la grille 7×7 est dans `fabrique-ccsymboles.py`). Effet de bord assumé : « 🏆 TOP 10 » devient « ␣TOP 10 » (une espace en tête : négligeable, ou `.trim()` dans `showMsg`). Les **messages** perdent leur émoji (voulu, c'est déjà le comportement du Fil).

Fichiers livrés (hors dépôt, à copier) : `~/cash-car/ios-ultime-mesures/polices/fix/ccsymboles.woff2` (9,3 Ko) et `fabrique-ccsymboles.py` (régénère le woff2).

Diff (4 morceaux de `code/`, puis `node code/assembler.cjs`, puis `cd app-ios && npm run sync`) :
```diff
# 0. copier la police
cp ~/cash-car/ios-ultime-mesures/polices/fix/ccsymboles.woff2  "VERSION PRINCIPALE/assets/fonts/ccsymboles.woff2"

# 1. code/css/socle-1.css (ligne 33 puis ligne 40)
 @font-face{font-family:'Press Start 2P';font-style:normal;font-weight:400;font-display:swap;src:url('./assets/fonts/pressstart2p.woff2') format('woff2');}
+/* (ios-ultime, POLICES) LES SYMBOLES ET LA PURGE DES ÉMOJIS : Press Start 2P n'a ni → ← ★ ✓ ▲ ▶ ⚙ ∞ ⚠… ni émojis ; ils tombaient dans Apple Symbols / Apple Color Emoji. CC Symboles les dessine sur la même grille et vide les émojis. Fabrique : passation/ios-ultime (fabrique-ccsymboles.py). */
+@font-face{font-family:'CC Symboles';font-style:normal;font-weight:400;font-display:swap;src:url('./assets/fonts/ccsymboles.woff2') format('woff2');}
...
-:root{--pix:'Press Start 2P',monospace}
+:root{--pix:'Press Start 2P','CC Symboles',monospace}

# 2. code/css/charte-1-touches.css:59
-  --sans:'Press Start 2P',monospace;
+  --sans:'Press Start 2P','CC Symboles',monospace;

# 3. code/css/accueil-boutique.css:121 (les polices de rareté : les mêmes symboles)
-:is(#fh,#fhLeg) [data-rp],:is(#fh,#fhLeg) [data-rp] b,:is(#fh,#fhLeg) [data-rp] b::after{font-family:var(--rpf),'Press Start 2P',monospace!important}
+:is(#fh,#fhLeg) [data-rp],:is(#fh,#fhLeg) [data-rp] b,:is(#fh,#fhLeg) [data-rp] b::after{font-family:var(--rpf),'Press Start 2P','CC Symboles',monospace!important}

# 4. code/page/debut-corps.html (UNE_POLICE, le filet des canvas) : la pile des canvas reçoit CC Symboles, y compris quand le code écrit déjà « Press Start 2P »
-    if(r===undefined){const s=String(v);r=s;if(!/Press Start 2P/i.test(s)){const m=/(\d+(?:\.\d+)?)px/.exec(s);if(m)r=Math.max(6,Math.round(+m[1]*.62))+'px "Press Start 2P",monospace';}C.set(v,r);}
+    if(r===undefined){const s=String(v);r=s;if(!/Press Start 2P/i.test(s)){const m=/(\d+(?:\.\d+)?)px/.exec(s);if(m)r=Math.max(6,Math.round(+m[1]*.62))+'px "Press Start 2P","CC Symboles",monospace';}else if(!/CC Symboles/.test(s))r=s.replace(/(["']Press Start 2P["'])/i,'$1,"CC Symboles"');C.set(v,r);}
```
(l'ligne exacte de `UNE_POLICE` : `code/page/debut-corps.html` ~ ligne 53-54 ; `garde-charte.sh:39-50` cherche `--pix:'Press Start 2P'` (le préfixe est conservé), `font-family:'Press Start 2P'`, `function UNE_POLICE(` : le correctif ne casse pas la garde. La règle `*,*::before,*::after{font-family:var(--pix)!important}` n'est pas modifiée.)
Optionnel : `<link rel="preload" href="assets/fonts/ccsymboles.woff2" as="font" type="font/woff2" crossorigin>` à côté de la ligne 32 de `code/page/tete.html` ; et une ligne `ccsymboles` dans la liste de précache de `sw.js` s'il en a une (le sw ne cite aucune police : rien à faire). `app-ios/preparer-www.js` copie `assets/` en entier : rien à changer.
Alternative plus modeste (si Sacha refuse la police de brouillon) : appliquer `String(t).replace(/[←-⯿\u{1F000}-\u{1FAFF}️]/gu,'').trim()` à la sortie de `showMsg` (`boost-depart.js:398`) et de `trickMsg` (`jus-echelle.js:230`) et remplacer à la main `✓ ÉQUIPÉE`, `🔒 VERROUILLÉE`, `★ …` dans `traductions.js` (≈ 40 chaînes FR/EN) : plus long, ne couvre pas les futures chaînes.

### P-02 — Faux gras sur une police pixel (MOYEN, visible sur les compteurs et bascules)
16 éléments en graisse ≥ 600 sur 2 écrans (§5). WebKit épaissit le glyphe (smear). Correctif : interdire la synthèse partout (une règle, séparée pour ne pas toucher le filet vérifié par `garde-charte.sh`), à ajouter dans `<style id="policeUnique">` juste sous la règle `*` :
```diff
 *,*::before,*::after{font-family:var(--pix)!important}
+*,*::before,*::after{font-synthesis:none!important}
```
(`code/css/accueil-boutique.css`, ligne 105). Après : `100%`, `ON`, titres `<b>` s'affichent en 400 net. Les canvas n'ont pas ce risque pour les polices non pixel (le filet enlève le gras) ; vérifier `grep -nE "bold [0-9.]+px[^'\"]*Press Start" code` (aucun trouvé).

### P-03 — Le filet canvas ignore la police déjà « Press Start 2P » (MOYEN, voir P-01 diff 4)
Les 53 `ctx.font='…"Press Start 2P"…'` ne reçoivent pas le secours : leurs `★ ₿ ▲ ✓` iront en `monospace`. Corrigé par le diff 4 ci-dessus.

### P-04 — U+202F oublié (FAIBLE, nombres français)
```diff
# code/gameplay/evenements-rares.js:229
-nb=v=>Math.round(v||0).toLocaleString(LOC())
+nb=v=>Math.round(v||0).toLocaleString(LOC()).replace(/[  ]/g,' ')
```

### P-05 — Tailles non multiples de 8 : texte qui « tremble » à ×3 (DA, à trancher)
175/269 éléments à un entier non multiple de 8, 11 fractionnaires (`26.52px`, `48.36px` : calculs `vw`/`clamp`). Correctif possible sans changer la mise en page globale : poser `--f0:8px; --f1:8px; --f2:16px …`, ou, sans toucher aux règles, un **arrondi à la grille** par `font-size:round(nearest, <valeur>, 8px)` (CSS `round()`, pris en charge par Safari 15.4+ / iOS 15.4+ ; ne marche que si la valeur est écrite en CSS, pas dans les `style=` JS). C'est un chantier visuel (tout se décale), pas un correctif d'une ligne : je le liste mais je ne propose pas de diff, il faut l'accord de Sacha sur la hiérarchie 8/16/24.

### P-06 — `font-display:swap` sur Press Start 2P (FAIBLE)
Avant l'arrivée du fichier (cache froid), swap montre une fraction de seconde en `monospace` (Menlo) puis bascule. Dans l'app le fichier est local et préchargé, donc quasi invisible. Si l'on veut zéro flash : `font-display:block` sur la ligne 33 de `socle-1.css` (période invisible de 3 s au plus) — recommandé pour Press Start 2P seule.

## À ne PAS faire / constats rassurants
- Pas de défaut d'accents (É È Ê À Ç Œ « » ’ … – — € × · ° sont dans Press Start 2P).
- Rien n'est retiré des polices par `preparer-www.js` ; pas de réseau ; pas de format illisible ; `capacitor://localhost` sert bien le woff2 (testé en http ici, mais le chemin est relatif et identique).
- `-webkit-text-size-adjust` déjà à 100 % ; l'app ne suit pas la taille de texte système (voulu).
- Non vérifié (hors portée du banc) : la course complète en HUD dans WebKit (voile noir), l'écran de fin, le rendu exact sur le 13 Pro. Le défaut P-01 y est prévisible d'après le code, à confirmer à l'œil sur l'iPhone une fois P-01/P-02 appliqués.
