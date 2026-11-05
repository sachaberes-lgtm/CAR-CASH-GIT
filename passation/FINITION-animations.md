# AUDIT DES ANIMATIONS ET TRANSITIONS DE L'INTERFACE (lecture du code, aucun navigateur)

Branche `finition-interface` (base main v1147). Périmètre : menus (accueil, mort, modes, réglages, boutique « premium »), garage (hub, inventaire,
boutique 3D, peintures, missions, profil/plaque), pause, fenêtres/modales, toast, final spin, révélation des missions. Hors périmètre : course, HUD, gameplay, maps.

Méthode : un parseur CSS maison (scratchpad, hors dépôt) a relevé les 35 feuilles `code/css/*.css` + les styles inline de `code/page/ecrans-*.html`
(1 009 règles avec `transition`/`animation`, 415 `@keyframes`), rangées dans l'ordre de `code/ORDRE.txt`. La « règle gagnante » est
déduite à la main de la spécificité et de l'ordre (les `!important` sont signalés). Aucune de ces valeurs n'a été mesurée dans un navigateur.

---------------------------------------------------------------------------------------------------------------------------------------

## 0. TROIS FAITS QUI CHANGENT LA LECTURE

1. **Les jetons de la charte n'existent pas dans cette branche.** `--c6-vite`, `--c6-pose`, `--c6-courbe` : 0 définition dans `code/`
   (grep sur tout `code/`). Le BRIEF-INTERFACE §2 règle 8 et `passation/accord.md` décrivent la « charte 6 » (branche interface, non fusionnée ici).
   Le mouvement réellement en vigueur est « charte 4 + section 21 » : `:root{--ease:cubic-bezier(.32,.72,0,1);--t-fast:140ms;--t-slow:420ms}`
   (`socle-4-aura.css:266`) et `:root{--t-in:400ms;--t-out:150ms;--t-press:70ms;--stag:34ms;--pousse:30px}` (`charte-7-details.css:15`).
   **Ces mêmes `--t-fast` / `--t-slow` / `--ease` servent aussi au HUD de course** (`#avCh`, `#coach`, `#campChip`, `#touchCtl`, `#nitroR`, `#pwrChip`…) :
   les changer sur `:root` toucherait la course. Les corrections ci-dessous les redéfinissent donc **seulement sur les racines des menus**.
2. **La classe `.c6` n'est posée nulle part** (ni JS, ni `<html lang="fr">`). Donc tous les sélecteurs `html:not(.c6) …` de `ux8.css` sont
   TOUJOURS actifs, et ils battent la section 21 (`charte-7`) par la spécificité : voir défaut 2 (fenêtre et pause).
3. `html[data-reduced-motion="1"]` n'est pas un réglage du jeu : c'est le miroir exact de `prefers-reduced-motion` (`palier-appareil.js:100-108`,
   mis à jour par un écouteur `change`). Une règle qui ne couvre que l'un des deux est donc équivalente ; ce qui compte, c'est qu'AUCUN des deux ne la couvre.

---------------------------------------------------------------------------------------------------------------------------------------

## 1. LE TABLEAU, PAR RÔLE

Charte visée (règle 8) : touche 90 ms ; écran 200 ms ; une courbe ; entrée = blocs +8 px en fondu, cascade 30 ms (5 blocs max) ; sortie = fondu sec 100 ms ;
`transform`/`opacity` seulement ; reduced-motion respecté. « EN VIGUEUR » = règle gagnante. `--ease` = `cubic-bezier(.32,.72,0,1)`.

### 1.1 Appui d'une touche

| Surface | EN VIGUEUR | Fichier:ligne | Écart avec la charte |
|---|---|---|---|
| `.pbtn` (toutes les touches penchées), `:active` souris | `transform:translateY(5px)` (or : 6 px), transition `transform, box-shadow, filter, opacity` **140 ms** `--ease` | `charte-1-touches.css:95,107,123` | 140 ≠ 90 ; 5/6 px ; anime `box-shadow` et `filter` |
| `.pbtn.appui` (doigt, classe posée par JS, tenue ≥ 90 ms) | même profondeur, `transition-duration:70ms` à l'enfoncement, **140 ms** au relâcher (la classe part, la durée revient à 140) | `charte-7-details.css:102` ; JS `aura-banque-contrats.js:~219-231` | 70 vers le bas, 140 vers le haut : asymétrique, aucune des deux n'est 90 |
| Accueil `#mHome .pbtn` | 6 px (or 7 px) | `charte-6-signatures.css:146,157` | 6/7 ≠ 5 |
| Accueil « hub » (`.mAccB .mOffres .mGear .mHubPorte`) | `translate:0 2px`, **`transform:none!important`** ; `translate` n'est PAS dans la liste de transition de `.pbtn` : l'enfoncement est instantané, le relâcher aussi | `boutons-flottants.css:141-143` + `charte-1:95` | 2 px, sans transition |
| Hub garage `#gvCof #gvMis #gShopBas` | `translate:0 2px`, idem sans transition | `garage-hub-bas.css:168` | idem |
| `.gT` (vignette de la bande du garage) | `translate:0 3px` ; transition `transform, box-shadow` seulement | `charte-3-garage.css:84,97` | `translate` non transitionné → saute |
| `#ivFerme` | `translate:0 1px`, `transform:none` | `garage-hub-bas.css:136-140` | 1 px, sans transition |
| `.ghT` (barre du hub), `#gEquip`, `#gHomeBas`, `#gOeil`, `#gCache`, `#gRappel`, `.fnC`, `.fnPorte` | `translateY(2px)` (transition de `.pbtn`, donc 140/70 ms) | `garage-hub-barre.css:29,169,229,272` ; `garage-hub-bas.css:30` | 2 px |
| `#gBqCats button`, `#gBqPan .bqK`, `#gFigSel .fsHex`, `#bqFigSel .fsHex` | `translate:0 2px` ; transition `translate` 140 ms (`.bqK` : **150 ms** + `box-shadow`) | `garage-hub-rayons.css:53,64,166,197` | 140/150 |
| `.m2L`, `.mcL`, `.m2DebV` (missions) | `translateY(2px)`, transition 140 ms | `missions.css:11-14,133,228` | 2 px |
| `.ivT` (tuile d'inventaire) | `translate:0 2px; scale:.97` | `garage-accueil.css:322,333` | combine 2 propriétés |
| `.mObj[data-m]`, `.mMode` | `translate:0 2px` + `brightness(1.22)` (le `brightness` est neutralisé ailleurs) | `charte-7-details.css:103-105` | 2 px |
| `.gR` | `translate:0 3px; brightness(1.25)` | `charte-7-details.css:106-107` | 3 px |
| `.mAccP>.mPlay` (JOUER d'accueil) | `translateY(3px) scale(.97)` **`!important`** | `ux-nitro-aura.css:47` | 3 px + échelle |
| `#plq .plMod`, `#gVdep button`, `.shUne .shBtn`, `.modCoche` | 2 px, 140/70/200 ms (`#gVdep button` : **70 ms** translate + 200 ms fond/ombre) | `plaque.css:37,44` ; `ecrans-garage.html:11,22` ; `finition-ecrans.css:28` | durées propres |
| Tout le reste qui se touche (APPUI_TOUT : lignes, puces, hexagones…) | JS : `scale .94`, **70 ms** vers le bas, **140 ms** au retour, `cubic-bezier(.32,.72,0,1)` (tenue 90 ms) | `aura-banque-contrats.js:~246-276` | 3e mécanisme (propriété `scale`) ; s'empile avec le `translate:0 2px` CSS sur `.bqK`, `.fsHex`, `#gBqCats button` |
| Anciens boutons (`#playBtn`, `.saveBtn`, `#tGear`) | **50 ms** `!important` à l'appui, 140 ms au retour | `socle-4-aura.css:268-270,284-285` | 50 ms |

→ 6 profondeurs (1, 2, 3, 5, 6, 7 px) + `scale .94/.97/.9`, 4 durées (50, 70, 140, 150), 3 mécanismes (`transform`, `translate`, `scale` WAAPI).

### 1.2 Entrée d'écran (coque `#mob .mscr`)

| Élément | EN VIGUEUR | Fichier:ligne | Écart |
|---|---|---|---|
| Voile `#overlay` (1re apparition) | `k4Voile` **420 ms** `--ease` ; fond `::before/::after` `opacity` 420 ms | `charte-2-ecrans.css:2,8,10` | 420 ≠ 200 |
| Cadre `.mscr.on` | `k6Fond` **150 ms**, retard 40 ms, `both` | `charte-7-details.css:27` (bat `charte-4:31`) | — |
| Blocs `.mscr.on>*` | `k6Monte` **400 ms**, **+16 px**, fondu, retard `i×34 ms + 70 ms`, `--i` plafonné à **9** ; en `avant`/`retour` : glissé latéral **30 px** (`--pousse`) | `charte-7:29-31,12` ; plafond `mobile-tactile.js:592` | 400 ≠ 200 ; 16 ≠ 8 ; 30 px ; 34 ≠ 30 ; 10 blocs au lieu de 5 → le dernier se pose à 70+306+400 = **776 ms** |
| Sous-conteneur `.mSet>*`, pause `#tpIn>*` | même, `--j` ≤ 7 / ≤ 6, retard 110 ms / 40 ms | `charte-7:44-47,88-90` | idem |
| Accueil : logo / JOUER | `k6Tombe` −18 px, `k6Surgit` +26 px (retard 8×34+90 = 362 ms) | `charte-7:53-60` | 18 / 26 px |
| Mort `#mDead.m5` | titre `m6File` 850 ms (translate −60vw + flou + brightness) ; cartes `k6Carte` (+20 px, `scale .96`) à 250/480/710 ms ; 🡒 REJOUER `k6Surgit` à **1 080 ms** (+400) | `mort-flottante.css:153-163` | écran stable à 1 480 ms |
| Mort (ancienne v3, `#mDead` sans `.m5`) | retards 220 → 660 ms | `charte-7:65-78` | — |
| Missions (liste) | panneau `gmIn` 450 ms (retard 150) ; lignes `gmIn` 400 ms, retard `140+i×60` ou `220+i×45 ms`, `--i` ≤ 12 | `charte-3-garage.css:229,252` ; `missions.css:11,130` | `gmIn` anime `filter` et `clip-path` ; fin à ≈ 1,16 s |
| Hub garage `#gHub` | `hubMonte` **420 ms**, +14 px | `garage-hub-barre.css:10,14` | 420 / 14 px |
| Inventaire `#gInv` | `ivMonte` **440 ms**, +60 px (couché : `ivGlisse` 60 px latéral) ; tuiles `ivTuile` 400 ms, +12 px, `scale .94`, 26 ms ×14 | `garage-accueil.css:287-289,351-353,357` | tiroir : 60 px |
| Boutique 3D | tête `bqTete` 500 ms (retard 120), panneau `bqPan` 500 ms (retard 200/300, +18 px), rubriques `bqSec` 380 ms, cartes `bqK` **380 ms `cubic-bezier(.2,1.3,.4,1)` (dépasse)**, +12 px, retard `250+i×45 ms` (≤ 8) | `garage-hub-rayons.css:31,52,124,161,166` | rebond ; 12 px ; fin ≈ 1 s |
| Retour d'atelier / grille inventaire | `atRet` 320 ms (−24 px latéral), `atGrille` 400 ms (+14 px) | `garage-hub-boutique.css:131-135,134,152` | 320/400 |
| Missions de l'atelier, vitrine, `gDeplie` | `gDeplie` 340 ms (+24 px), `gvMonte` 520 ms (+22 px) | `garage-accueil.css:226,203` | 340/520 |
| Plaque / profil `#plq #prof` | `plqEntre` **420 ms**, +16 px (`transform`) | `plaque.css:10,12` | 420 / 16 |
| Plaque, 1er lancement (`.premier`) | 1,1 s de fondu, tuiles 550 ms **avec dépassement** (`.2,.9,.25,1.2`), retards 1,45 → 2,2 s | `plaque.css:77-100` | long ; dépasse (onboarding : à arbitrer) |
| Départ de course depuis la boutique / atelier | verrou de toucher 650-850 ms | `garage-cadrage.js:196-201` | mécanique, voulu |

Distances d'entrée différentes pour le même rôle : 8 (`vdIn`), 12 (`bqK`, `ivTuile`), 14 (`hubMonte`, `atGrille`), 16 (`k6Monte`, `plqEntre`), 18 (`bqPan`, `k6Tombe`),
20 (`k6Carte`), 22 (`gvMonte`), 24 (`ux8Plaque`, `atRet`, `gDeplie`), 26 (`k6Surgit`), 30 (`--pousse`), 60 (`ivMonte`). Durées : 320, 340, 380, 400, 420, 440, 450, 500, 520 ms.
Une seule entrée est à 8 px : `#gVdep.vu` (`ecrans-garage.html:8`, 320 ms).

### 1.3 Sortie d'écran

| Élément | EN VIGUEUR | Fichier:ligne | Écart |
|---|---|---|---|
| Écran de la coque `.mscr.sort` | **150 ms** (`--t-out`), `opacity` + glissé **30 px** dans le sens (ou `scale .985`) ; le JS retire la classe à **220 ms** | `charte-7:18-22` ; `mobile-tactile.js:590` | 150 ≠ 100 ; glissé au lieu d'un fondu sec |
| Fenêtre / pause (`#modale`, `#tPanel`) | voile `k4VoileOut` **140 ms** ; plaque `ux8PlaqueOut` 140 ms, +14 px ; JS 170 ms | `charte-2:217,281` ; `ux8.css:287,289,294` ; `icones-fenetre.js:113` | 140 ≠ 100 |
| Plaque / profil | `plqSort` **140 ms**, +10 px (`.premier` : 900 ms) | `plaque.css:11,13,79` | 140 |
| Inventaire | `ivDescend` **170 ms `ease-in`** (+40 px) | `garage-accueil.css:288,290` | autre courbe, autre durée |
| Fiche d'achat `#shPop` | voile 420 ms + carte `spRentre` 420 ms (retour vers la source) ; enfants 140 ms ; minuteur JS = `--t-slow` de `:root` | `hud-da.css:12,22,27` ; `boutique.js:18,115` | 420 |
| Rideau (`#wipe`, changement de décor) | canvas pixel : couvre en **150 ms**, découvre en **280 ms** ; bascule à 160 ms ; verrou de toucher 520 ms ; classe vidée à 460 ms | `aura-banque-contrats.js:156,188,207` | 150 / 280 |
| Rideau, repli CSS (`prefers-reduced-motion`) | **coupe sèche** (voir défaut 8) | `charte-4-mouvement.css:81-82` | défaut |
| Toast | opacité 140 ms ; **transform 420 ms** (−26 px, `scale .96`) | `charte-2:293` ; `charte-7:112-113` | 140 vs 420 |

### 1.4 Ouverture / fermeture de fenêtre et de feuille

| Fenêtre | OUVERTURE (en vigueur) | FERMETURE | Fichier:ligne |
|---|---|---|---|
| Modale `#modale` | voile 420 ms ; **plaque `ux8Plaque` 420 ms +24 px** ; boutons 420 ms, retards 80/120 ms. (La feuille qui monte du bas `k6Feuille` 400 ms de la section 21 est **du code mort**, battue par `ux8.css`.) | 140 ms (voile) / 140 ms (plaque, +14 px) | `ux8.css:288-291` bat `charte-7:81-84` |
| Pause `#tPanel` | voile 420 ms ; **`#tpIn` entier `ux8Plaque` 420 ms +24 px ET chacun de ses enfants `k6Monte` 400 ms +16 px en cascade** (cumul des deux) ; bouton REPRENDRE `k6Surgit` retard 230 | 140 ms | `ux8.css:293-294` + `charte-7:89-91` |
| Plaque / profil | 420 ms, +16 px | 140 ms | `plaque.css:10-13` |
| Fiche d'achat `#shPop` | voile 420 ms, carte `spSort` 420 ms (part de la case), contenu 420 ms retard 210 ms | 420 ms | `hud-da.css:11-28` |
| Final spin `#spinM` | `opacity` 420 ms, boîte `transform` 420 ms | — | `final-spin.css:1,12` |
| Pub récompense `#pubR` | `opacity` 140 ms | idem | `ux8.css:258` |
| Révélation `#m2Rev`, série `#serieW`, `#mvW` | 0,3 → 1,4 s (transitions de célébration) | 0,45-0,5 s (`.fin`) | `missions.css:262-380,385-471` |

### 1.5 Cascade des blocs

| Où | Pas | Plafond | Départ | Fichier |
|---|---|---|---|---|
| Écrans de la coque | **34 ms** | `--i` ≤ 9 | 70 ms | `charte-7:29` |
| `.mSet`, pause `#tpIn` | 34 ms | ≤ 7 / ≤ 6 | 110 / 40 ms | `charte-7:45,89` |
| Bande du garage `#gStrip>.gT` | **26 ms** | ≤ 6 | 0 | `charte-7:95` |
| Inventaire `.ivT` | **26 ms** | ≤ 14 | 90 ms | `garage-accueil.css:351` |
| Boutique `.bqK` | **45 ms** | ≤ 8 | 250 ms | `garage-hub-rayons.css:166` |
| Missions `.m2L` / `.mcL` | **45 ms** / **60 ms** | ≤ 12 | 220 / 140 ms | `missions.css:11,130` |
| Plaque `.plMod` | 70 ms | 9 | 1,45 s | `plaque.css:96-98` |
| Mort | retards à la main 40 → 1 080 ms | — | — | `mort-flottante.css:153-163` |

Charte : 30 ms, 5 blocs.

### 1.6 Onglets, états on/off, pastilles, compteurs

| Rôle | EN VIGUEUR | Fichier:ligne |
|---|---|---|
| Onglets (`.gTab`, `.ivTab`, `#gBqCats button`, `.ghT`) | `background`+`color` **140 ms** `--ease` (`.ghT::before` : opacité 140 ms mais `transform` **420 ms**) | `charte-3:59` ; `garage-accueil.css:297` ; `garage-hub-rayons.css:53` ; `garage-hub-barre.css:15-21` |
| Interrupteurs (`b.bascule::before`, `.mMode .mmS::before`) | `transform`+`background` 140 ms | `charte-1:208` ; `charte-4:168` |
| Lignes (`.mLigne`, `.tp.ligne`) | `background` 140 ms | `charte-1:192` ; `pause-v2.css:53` |
| Case à cocher de la fenêtre | **120 ms** (`.mcBox`) / **160 ms** `cubic-bezier(.32,.72,0,1)` (coche) | `figures.css:10-11` |
| Pastille `.mBadge.on` | boucle infinie 2,4 s (saut de −3 px) | `charte-1:160` |
| Pastilles de missions prêtes | `m2Brille` / `m2Pouls` (box-shadow), `mcPouls` (filter), `k4Ticket` (filter) : boucles infinies 1,2-2,2 s | `missions.css:48,119,164` ; `charte-2:108` |
| Compteur du garage | JS 900 ms, sortie cubique ; + `k4Bouge` 420 ms (`filter`) ; `-12 000` flottant 1,4 s | `atelier-ferme.js:585-602` ; `charte-3:19-20` |
| Compteur de mort (`mCount`) | v6 : **2 000 ms** quadratique ; ancien : 750 ms cubique ; chiffre qui roule : **170 ms `cubic-bezier(.2,.8,.2,1)`** | `mobile-tactile.js:641-657` |
| `countUp` (aura) | 900 ms cubique | `aura-banque-contrats.js:286` |
| Jauges (largeur) | `.obBar i` **1,1 s** ; `.ivProg i::before` **0,4 s** ; `#gAuraC u em` 420 ms ; `.m2L u em` `--m2T` ; `.mcJ i` 1 s | `charte-2:124` ; `garage-accueil.css:310` ; `garage-hub-barre.css:142` ; `missions.css:24,140` |

Courbes en jeu dans les menus : `--ease` (`.32,.72,0,1`, dominante), `.2,.8,.2,1` (`socle-1:299`, `mobile-tactile.js:643`), `ease`, `ease-in` (`ivDescend`), `ease-out`, `ease-in-out`, `linear`, `steps()`, et des dépassements
`.36,1.4,.4,1` (`socle-1:107`, logo JOUER), `.2,1.3,.4,1` (cartes de la boutique), `.3,1.4,.4,1` (`plaque.css:103`), `.2,.9,.25,1.2` (`plaque.css:94`), `.34,1.56,.64,1` (mort), `.22,1.15,.36,1`.

---------------------------------------------------------------------------------------------------------------------------------------

## 2. LES DÉFAUTS, NUMÉROTÉS

Gravité : **visible** = un joueur le voit/le sent ; **mineure** = incohérence ou coût, peu perceptible.
Les blocs sont à poser dans `code/css/finition-ecrans.css` (après `ecrans-iphone`, `mort-flottante` ; avant `peintures.css`), puis `node code/assembler.cjs`, cache +1.
Rien n'a été testé : à regarder au banc avant de pousser.

### D1. L'écran met 400-776 ms à entrer, avec 16-30 px de course, au lieu de 200 ms / 8 px (visible)
`charte-7-details.css:15,27-31` (`--t-in:400ms`, `--stag:34ms`, `--pousse:30px`, `k6Monte` 16 px) ; plafond `--i` à 9 : `mobile-tactile.js:592` ; sortie 150 ms + glissé 30 px : `charte-7:18-22`.
Cause : les jetons de la charte (200/100/90/30/8) ne sont pas posés. Correction : les poser **sur les racines des menus seulement** (la course garde les siens) et redéfinir les `@keyframes` à 8 px
(le dernier `@keyframes` de même nom gagne ; la feuille est après toutes les autres). `#shPop` est volontairement exclu (son minuteur JS lit `--t-slow` sur `:root`, `boutique.js:18`).

```css
/* D1 — le mouvement de la charte, sur les menus uniquement (la course garde --t-fast/--t-slow/--ease de :root) */
#overlay,#mob,#garage,#gHub,#gInv,#gMis,#gBq,#tPanel,#modale,#plq,#prof,#toast,#spinM,#m2Rev,#serieW,#mvW,#pubR{
  --t-in:200ms;--t-out:100ms;--t-press:90ms;--t-fast:90ms;--t-slow:200ms;--stag:30ms;--pousse:8px}
@keyframes k6Monte{from{opacity:0;translate:0 8px}}
@keyframes k6Surgit{from{opacity:0;translate:0 8px}}
@keyframes k6Tombe{from{opacity:0;translate:0 -8px}}
@keyframes k6Carte{from{opacity:0;translate:0 8px}}
@keyframes k6SortRacine{to{opacity:0}}
@keyframes k6SortAvant{to{opacity:0}}
@keyframes k6SortRetour{to{opacity:0}}
@keyframes k6FeuilleOut{to{opacity:0}}
/* 5 blocs au plus dans la cascade */
.mscr.on>*{animation-delay:calc(min(var(--i,0),4) * var(--stag) + 70ms)}
.mscr.on>.mSet>*{animation-delay:calc(min(var(--j,0),4) * var(--stag) + 110ms)}
#tPanel.open #tpIn>*{animation-delay:calc(min(var(--j,0),4) * var(--stag) + 40ms)}
```
Réserves : (a) `--t-fast` à 90 ms raccourcit aussi les fondus de sortie (140 → 90, voulu), les `k4Pop`/`k4Bouge`, les lueurs des onglets et le fondu du toast ;
(b) `#gBq` est créé en JS (`boutique-scene-1.js`) : si c'est un enfant de `#garage` la ligne est redondante, sinon elle est nécessaire ; (c) `min()` dans `calc()` est déjà utilisé dans la base
(`garage-accueil.css:351`), donc accepté par la cible iOS ; (d) `#shPop`, `#coach`, `#wipe` et le HUD sont exclus exprès.

### D2. La fenêtre et la pause ne jouent pas la section 21 : `ux8.css` la bat, et la pause anime deux fois (visible)
`ux8.css:288-294` (`html:not(.c6) #modale.on .modIn` spécificité (1,3,1) contre `charte-7:81` (1,2,0)) : la fenêtre monte de **24 px en 420 ms** (`ux8Plaque`), pas en feuille de 400 ms depuis le bas ;
`k6Feuille`/`k6FeuilleOut` sont du code mort pour `#modale`. Pour `#tPanel`, `html:not(.c6) #tPanel.open #tpIn` (2,2,1) bat `charte-7:88` `#tPanel.open #tpIn{animation:none}` : le bloc
entier monte de 24 px/420 ms **pendant que** chaque enfant monte aussi (`charte-7:89`, `k6Monte` 16 px, retards 40 + 34×j) — deux mouvements imbriqués, ≈ 40 px cumulés, 650 ms.
Correction (même spécificité, posée après) : la pause ne garde que la cascade de ses enfants, la fenêtre prend la montée de 8 px.

```css
/* D2 — pause : un seul mouvement (la cascade des enfants) ; le voile #tPanel fait déjà le fondu d'entrée et de sortie */
html:not(.c6) #tPanel.open #tpIn{animation:none}
html:not(.c6) #tPanel.sortant #tpIn{animation:none}
/* D2 — fenêtre : +8 px en fondu (les durées viennent des jetons de D1) */
@keyframes ux8Plaque{from{opacity:0;translate:0 8px}to{opacity:1;translate:0 0}}
@keyframes ux8PlaqueOut{to{opacity:0}}
```
Sous `prefers-reduced-motion` `ux8.css:297-299` reste maître (`k4Voile` linéaire) : sans changement.

### D3. L'enfoncement saute au lieu de se jouer sur les touches à `translate` (visible)
`translate` n'est pas dans la transition de `.pbtn` (`charte-1:95`, elle liste `transform`) ni de `.gT` (`charte-3:84`). Les touches qui s'enfoncent avec la propriété `translate` s'abaissent et
remontent **en un seul état** : `.mAccB/.mOffres/.mGear/.mHubPorte` (`boutons-flottants.css:141`, avec `transform:none!important`), `#gvCof #gvMis #gShopBas` (`garage-hub-bas.css:168`), `.gT` (`charte-3:97`),
`#ivFerme` (`garage-hub-bas.css:140`). Les ombres, elles, se transitionnent : la face bouge d'un coup et la tranche glisse.
```css
/* D3 — le translate s'anime comme le transform (touches d'accueil, hub, bande, fermer) */
.pbtn,.gT{transition:transform var(--t-fast) var(--ease),translate var(--t-fast) var(--ease),box-shadow var(--t-fast) var(--ease),filter var(--t-fast) var(--ease),opacity var(--t-fast) var(--ease)}
```
(`.pbtn.appui{transition-duration:var(--t-press)}`, spécificité (0,2,0), garde la main sur la durée. Avec D1 : 90 ms dans les deux sens.)

### D4. Quatre profondeurs et trois mécanismes d'appui pour la même chose (visible, à arbitrer)
Voir 1.1 : 1/2/3/5/6/7 px, `scale .94/.97/.9`, 50/70/140/150 ms. Pas de correctif minimal sûr sans choisir une valeur de référence (le brief ne donne pas la profondeur).
Proposition : garder 5 px (`.pbtn`, charte-1:107) comme référence, ramener 6/7 px d'accueil (`charte-6-signatures.css:146,157`) à 5/6, et les 2/3 px des surfaces plates sont acceptables (volontaires :
la tranche est plus petite). À décider avec Sacha ; je ne mets pas de bloc.
Cas cumulatif réel : `#gBqPan .bqK`, `#gFigSel .fsHex`, `#gBqCats button` ne sont pas dans `APPUI_SEL`, donc reçoivent à la fois le `translate:0 2px` CSS et le `scale .94` WAAPI
(`aura-banque-contrats.js:~246-276`) : la case s'enfonce de 2 px ET rétrécit de 6 %.

### D5. Des rebonds hors célébration (mineure à visible)
`#gBqPan .bqK` : `cubic-bezier(.2,1.3,.4,1)` (`garage-hub-rayons.css:166`) à chaque ouverture de la boutique ; `#plq.premier .plMod` : `.2,.9,.25,1.2` (`plaque.css:94`, onboarding) ;
logo JOUER `pxScale` : `.36,1.4,.4,1` (`socle-1.css:107`, `garage-accueil.css:113`). La règle 8 : « jamais de rebond hors célébration ».
```css
/* D5 — pas de rebond sur l'entrée des cartes de la boutique */
#gBqPan .bqK{animation-timing-function:var(--ease)}
```
(Le logo et la plaque du 1er lancement sont des moments d'accueil : à ne pas changer sans accord.)

### D6. « Réduire les animations » ne coupe pas tout l'écran de mort ni la boutique (visible pour ces utilisateurs)
Non couverts par aucun des deux mécanismes, vérifiés un par un :
- `.m6Mot`, `.m6Aura` (enfants de `#mHero`, donc pas des `.mscr.on>*`) et `.mDuo>.pbtn` : `mort-flottante.css:157,158,161,162` (`k6Carte`/`k6Monte`, retards 250, 480, 890, 960 ms). Le RM de `mort-flottante.css:292` ne liste pas ces trois sélecteurs et celui de `charte-7:130` vise `#mDead.on>.mHero>.hCard` (classes de l'ancienne v3), `.mRow>.pbtn`, `.mFin>*`. Résultat : sous RM, les deux cartes de résultat glissent encore de 20 px avec `scale .96` et les touches GARAGE/RÉGLAGES n'apparaissent qu'à ~1 s. Pas de contenu coincé (le fondu finit visible), mais le mouvement et le retard restent.
- Boutique : `#gBq.pan #gBqCats` (`garage-hub-rayons.css:52`, 500 ms, retard 300 ms, +18 px) et `.bqSec` (`:124`) ne figurent pas dans le RM de `:198`.
- Garage : `#gvMis` et ses boucles `gvCourant`/`gvFlux` (`garage-accueil.css:203-211`), `#gInvAide` et `.ivDoigt::after` (`:230,263`), `#gName.entre`, `#gCard.tampon::after` (`charte-3:34,43`) : aucune règle RM.
```css
/* D6 — reduced-motion : ce qui restait animé (mêmes cibles pour l'attribut miroir) */
@media (prefers-reduced-motion:reduce){
  html body #mob #mDead.m5.on :is(.m6Mot,.m6Aura,.mDuo>.pbtn){animation:none}
  #gBq.pan #gBqCats,#gBqPan .bqRail .bqSec,#gvMis,#gvMis::before,#gvMis::after,#gvMis .gvFx,#gInvAide,#gInvAide .ivDoigt::after,#gName.entre{animation:none}
}
html[data-reduced-motion="1"] body #mob #mDead.m5.on :is(.m6Mot,.m6Aura,.mDuo>.pbtn){animation:none}
html[data-reduced-motion="1"] :is(#gBq.pan #gBqCats,#gBqPan .bqRail .bqSec,#gvMis,#gvMis::before,#gvMis::after,#gvMis .gvFx,#gInvAide,#gInvAide .ivDoigt::after,#gName.entre){animation:none}
```
Réserve : `#gInvAide{animation:gvAide 9s both}` s'éteint de lui-même en opacité 0 à 100 % ; la couper le laisserait visible (c'est une bulle d'aide). À vérifier : si oui, remplacer par `#gInvAide{display:none}` sous RM.

### D7. Le rideau « réduire les animations » est une coupe noire, pas un fondu (visible pour ces utilisateurs)
`charte-4-mouvement.css:81-82` : `#wipe::before{display:none}` + `#wipe.in{background:#07050f;transition:opacity 120ms linear}`. Or `#wipe` n'a aucune opacité de départ (seul `visibility:hidden`) : la transition d'opacité
ne s'exécute jamais. À `.in` l'écran devient noir d'un coup ; à `.out` (qui n'a plus de fond) il redevient clair d'un coup (`aura-banque-contrats.js:156-207`, RM : bascule à 120 ms, classe vidée à 160 ms).
```css
@media (prefers-reduced-motion:reduce){
  #wipe{opacity:0}
  #wipe.in{opacity:1;background:#07050f;transition:opacity 100ms linear}
  #wipe.out{opacity:0;background:#07050f;transition:opacity 100ms linear}
}
```
(le volet reste `pointer-events:auto` en `.in`, `none` en `.out` : inchangé.)

### D8. Entrée de la liste des missions : `filter` + `clip-path`, jusqu'à 1,16 s (mineure)
`@keyframes gmIn` (`charte-3-garage.css:252`) : `filter:brightness(3→1.6→1)` et `clip-path:inset(...)` sur le panneau et sur chaque ligne (`missions.css:11,130`, retards `220+i×45` et `140+i×60`, `--i` ≤ 12).
Interdits par la charte hors célébration (repeinture à chaque image, iPhone 7).
```css
/* D8 — la liste des missions entre comme les autres écrans : opacité + translate, 5 lignes de cascade */
@keyframes gmIn{from{opacity:0;translate:0 8px}to{opacity:1;translate:0 0}}
.m2L:not(.pret){animation-delay:calc(min(var(--i,0),4) * var(--stag) + 120ms)}
.mcL{animation-delay:calc(min(var(--i,0),4) * var(--stag) + 120ms)}
```
(Les lignes `.pret` ont deux animations avec deux retards : volontairement laissées.) Réserve : `gmFlash` (`filter:brightness(2.2)`, `charte-3:253`), `ivFlash` et `k4Bouge` restent des flashs de retour d'action (autorisables).

### D9. REJOUER n'apparaît qu'à 1,08 s sur l'écran de mort (visible)
`mort-flottante.css:163` : `k6Surgit … 1080ms backwards` (le lingot est invisible mais touchable dès la fin du verrou de 320 ms, `uiGarde`, `aura-banque-contrats.js:284`). Les cartes finissent à ~1,1 s, l'argent compte jusqu'à 2,16 s.
C'est la mise en scène voulue (2026-11-04) ; mais le geste le plus répété du jeu attend 1,5 s avant d'être lisible. **À arbitrer** : un bloc qui le sort juste après la 3e carte.
```css
html body #mob #mDead.m5.on .mFin>.pb-gold{animation-delay:700ms,2.6s}
html body #mob #mDead.m5.on .mFin>.mMenu{animation-delay:620ms}
html body #mob #mDead.m5.on .mDuo>.pbtn{animation-delay:640ms}
html body #mob #mDead.m5.on .mDuo>.pbtn+.pbtn{animation-delay:670ms}
```

### D10. Sortie : glissé de 30 px et 150 ms au lieu d'un fondu sec de 100 ms (visible, couvert par D1)
`charte-7:18-22` ; les fenêtres sortent en 140 ms avec +14 px (`ux8.css:287`), la plaque en 140 ms +10 px (`plaque.css:13`), l'inventaire en 170 ms `ease-in` +40 px (`garage-accueil.css:290`).
D1 donne 100 ms et un fondu pur pour la coque et la fenêtre. Reste la plaque et l'inventaire :
```css
@keyframes plqEntre{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes plqSort{to{opacity:0}}
@keyframes ivDescend{to{opacity:0}}
#gInv.sortant{animation-timing-function:var(--ease)}
```
(le minuteur JS de l'inventaire et des feuilles est de 170 ms : au-dessus des 100 ms, donc l'élément reste 70 ms « sortant, `pointer-events:none` » après la fin visible : sans conséquence.)

### D11. Toast : le fondu dure 140 ms mais le mouvement 420 ms (mineure)
`charte-2-ecrans.css:293` : `transition:opacity var(--t-fast), transform var(--t-slow)` ; `charte-7:112-113` le fait tomber de −26 px avec `scale(.96)`. À la sortie il est invisible à 140 ms
mais son `transform` revient encore 280 ms. Couvert par D1 (les deux passent à 90/200 ms) ; pour la distance :
```css
#toast{transform:translate(-50%,-8px)}
#toast.on{transform:translate(-50%,0)}
```

### D12. Des animations qui reposent sur des propriétés interdites dans les menus (mineure, perf iPhone 7)
Hors célébrations, en boucle infinie ou à chaque ouverture :
- `background-position` : `k4Lingot` sur chaque `.pb-gold` (4,2 s, `charte-1:114`), `k4LingotV4` sur JOUER (`charte-7:60`), `lgShine` sur le logo (`socle-2:45`, `garage-hub-bas:124`), `gHomeCiel` 14 s sur 7 couches et `!important` sur `#gHomeBas` (`garage-hub-boutique.css:67`), `k4Or` sur `.shUne` (`charte-2:167`), `gvCourant/gvFlux` (`garage-accueil.css:207-211`), `gmTrame` (`charte-3:214`), `pLDefile/pLGlisse/pLChute` (peintures animées, `peintures.css:29-41`).
- `filter` en boucle : `k4Ticket` sur `.mObj.pret/.rec` (`charte-2:108`), `mcPouls`, `fsBat` (`garage-hub-boutique.css:235`), `pLScint/pLRespire/pLTeinte` (`peintures.css:33-35`), `plqPouls` (`plaque.css:100`).
- `box-shadow` en boucle : `m2Brille`/`m2Pouls` sur chaque mission prête (`missions.css:48,164`), `pLueur` (`peintures.css:44`).
- `ivRespire` : une animation d'opacité infinie PAR tuile d'inventaire (`garage-accueil.css:328,352`, déphasée de −0,41 s × n) — pas une propriété interdite, mais N couches animées dans une grille qui défile.
- Transitions de `width`/`height` : `.obBar i` 1,1 s (`charte-2:124`, `charte-6:212`), `.ivProg i::before` (`garage-accueil.css:310`), `#gAuraC u em` (`garage-hub-barre.css:142`), `.m2L u em`, `.mcJ i` (`missions.css:24,140`), `#gTourne .gtPouce` (`garage-hub-barre.css:122`).
- `box-shadow`/`filter` dans la transition d'appui de `.pbtn` (`charte-1:95`) : volontaire (la tranche), je ne propose pas de retrait.
Les peintures « qui vivent » sont voulues par Sacha (11-05) et coupées par RM (`peintures.css:48`) ; les jauges de largeur sont des éléments uniques (coût faible). Aucune correction minimale sûre en CSS seul ; si une
priorité perf est décidée, le plus rentable est `ivRespire` + `gHomeCiel` + `m2Brille` sous `html[data-palier="0"],html[data-palier="1"]` (feuille `palier-leger.css`), pas dans `finition-ecrans.css`.

### D13. Tampon du toucher : 320 ms de verrou silencieux contre 200 ms d'écran (mineure)
`uiGarde` (`aura-banque-contrats.js:284`) avale tout vrai toucher pendant **320 ms** après chaque `mGo` (`mobile-tactile.js:585`), chaque ouverture de feuille (`icones-fenetre.js:108`), **520 ms** après un rideau (`:188`), 350 ms / 300 ms
sur certains onglets (`atelier.js:123`, `boutique-du-jour.js:116`), et la touche rouge d'une fenêtre s'arme 420 ms (`icones-fenetre.js:128-129`). Aucun feedback visuel pendant ce temps : le joueur qui retape pense que le bouton est mort.
Volontaire (audit de sortie du 29/09 : double-tap) ; je n'ai pas de correctif CSS. À garder, mais à savoir : avec D1 l'écran est lisible à ~100 ms, le verrou court jusqu'à 320 ms.
Quand le verrou tombe pendant l'entrée, le toucher est pris par l'élément **sous** la cascade (invisible si son `animation-delay` n'est pas écoulé, par exemple JOUER d'accueil à 362 ms) : pas de blocage, mais un toucher fantôme possible.

### D14. Fiche d'achat `#shPop` : 420 ms codés dans le JS (mineure)
`boutique.js:18` lit `--t-slow` sur `:root` (420 ms) pour fermer ; `hud-da.css:11-28` anime en `--t-slow`. Si D1 était posé sur `:root`, le minuteur et l'animation resteraient alignés mais la course changerait aussi.
J'ai donc exclu `#shPop` de D1 : il reste à 420 ms (≠ 200). Correction propre (hors CSS) : `spDuree()` lit `getComputedStyle(el)` de `#shPop` au lieu de `documentElement`, puis `#shPop` rejoint la liste de D1.

### D15. Courbes et durées hors système dans les transitions de fond (mineure)
`.setRow` `.15s` (`socle-1:156`), `.lbRow` `.15s`, `#gBurnBtns` `.16s/.28s`, `#gVdep button` `.07s/.2s` linéaire par défaut (`ecrans-garage.html:11`), `#gBqCats`… `.bqK` 150 ms, `.mcBox` 120/160 ms
(`figures.css:10-11`), `.fnCarr .fpDots u` 300 ms, `#gBqVoile` (voile de la boutique : 250/260/500/620 ms, courbes propres, `garage-hub-rayons.css:11-20`, voulu comme volet de scène).
Aucune n'est un bug ; c'est la liste des écarts à harmoniser si on veut une « courbe unique » stricte. Pas de bloc.

---------------------------------------------------------------------------------------------------------------------------------------

## 3. COINCÉ, INVISIBLE, FANTÔME : ce qui a été cherché

- `opacity:0` + `forwards`/`both` sans fin : parcourues les 105 règles à `opacity:0` de menus. Aucun état coincé trouvé. Les fins `forwards` à opacité 0 (`.mscr.sort`, `#modale.sortant`, `#tPanel.sortant`, `#plq.sortant`, `#shPop.sortant`, `#gInv.sortant`)
  sont toutes suivies d'un retrait de classe par JS (220 / 170 / 170 / 170 / `spDuree()` / 170 ms, ≥ la durée CSS).
- `backwards` + RM : toutes les entrées en `backwards` testées ont un état de base visible, donc `animation:none` ne laisse rien invisible. Les éléments à base `opacity:0` (`.m2RvNom`, `.m2RvRar`, `.swBloc`, `#gBurnTxt`…) sont rendus visibles par un
  sélecteur d'état (`#m2Rev.nom`, `#m2Rev.rar`, `.calme` posé par `burn-out-1.js:282` quand RM), pas par l'animation. `#gBurnTxt` (base `opacity:0`) n'a pas de règle RM en CSS : c'est `burn-out-1.js:282` qui pose `.calme` (fondu linéaire) quand RM, donc pas coincé.
- Cachés par `opacity:0` sans `pointer-events:none` : `#pubR` (plein écran, `ux8.css:258`) n'est masqué que par l'attribut `hidden` (`seconde-chance.js:43`) → bon. `#toast`, `#gVig`, `#gBurnBtns`, `#gHub.cache`, `.m2RvBt`, `.swBt`, `.mvBt`, `#serieW.fin`, `#mvW.fin` ont `pointer-events:none`. `#gBqPan` est `pointer-events:none` avec `.bqRail` réactivé : correct.
- `display` transitionné : aucun (`visibility 0s linear Ns` bien formé aux deux endroits qui l'emploient).
- `pointer-events:none` posé pendant une entrée : seulement `#tPanel.sortant`, `#modale.sortant`, `#shPop.sortant`, `.mscr.sort` (sorties). `#wipe.in` prend le toucher 150-160 ms puis `.out` le rend (voulu).
- Coupures par `overflow:hidden` : la bande `#gStrip` rogne les 30 px latéraux de `k6Avant` (voulu) ; la correction du 15/10 pour `.bqK`/aimant est en place (`bqAimant`, `boutique-scene-1.js:307-312`).

---------------------------------------------------------------------------------------------------------------------------------------

## 4. CE QUE JE N'AI PAS PU VÉRIFIER

- Aucune valeur n'est mesurée : tout est lu dans le code (règle gagnante par spécificité et ordre de `ORDRE.txt`). Les `!important` en conflit (`boutons-flottants.css`, 5 `#garage` empilés ; `garage-hub-*` `!important`) ont été suivis pour les touches d'accueil/hub mais pas pour chaque état du garage (`.menu`, `.vitrine`, `.shopRet`, `.atelierInv`, `.quiet`).
- Je n'ai pas confirmé quels écrans passent par `html.hub` / `#mHome.acc2` en pratique (les sélecteurs `:not(.poki):not(.zz):not(.zy)` suggèrent que c'est la norme) ; si l'accueil « hub » n'est pas actif, les lignes 1.1 de l'accueil (`#mHome .pbtn` 6/7 px, cascade des tuiles) changent.
- Les propriétés `translate`/`scale` individuelles sont déjà employées partout dans la base ; je n'ai pas revérifié leur support sur l'iPhone 7 cible (iOS 14.5+ requis).
- `calc(min(…))` : même remarque (employé déjà en base).
- L'appli iOS (`app-ios/`) et `VERSION PRINCIPALE/index.html` n'ont pas été lus : seul `code/` l'a été.
- Les minuteurs JS ont été relevés (liste en D13), pas ceux des écrans de course ni de la boutique 3D hors mouvement d'écran.
- La charte 6 (`passation/accord.md`) décrit des classes (`c6Avant`, `c6Entre`, `.c6Carte`…) absentes de cette branche : je n'ai pas cherché si elle est sur une autre branche.

---------------------------------------------------------------------------------------------------------------------------------------

## 5. LE BLOC CONSOLIDÉ (pour `code/css/finition-ecrans.css`, en fin de feuille avant `</style>`)

```css
/* ===== LE MOUVEMENT DE LA CHARTE (audit du 05/11) : touche 90 ms, écran 200 ms, sortie 100 ms, +8 px, cascade 30 ms sur 5 blocs ===== */
#overlay,#mob,#garage,#gHub,#gInv,#gMis,#gBq,#tPanel,#modale,#plq,#prof,#toast,#spinM,#m2Rev,#serieW,#mvW,#pubR{
  --t-in:200ms;--t-out:100ms;--t-press:90ms;--t-fast:90ms;--t-slow:200ms;--stag:30ms;--pousse:8px}
@keyframes k6Monte{from{opacity:0;translate:0 8px}}
@keyframes k6Surgit{from{opacity:0;translate:0 8px}}
@keyframes k6Tombe{from{opacity:0;translate:0 -8px}}
@keyframes k6Carte{from{opacity:0;translate:0 8px}}
@keyframes k6SortRacine{to{opacity:0}}
@keyframes k6SortAvant{to{opacity:0}}
@keyframes k6SortRetour{to{opacity:0}}
@keyframes k6FeuilleOut{to{opacity:0}}
@keyframes ux8Plaque{from{opacity:0;translate:0 8px}to{opacity:1;translate:0 0}}
@keyframes ux8PlaqueOut{to{opacity:0}}
@keyframes plqEntre{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes plqSort{to{opacity:0}}
@keyframes ivDescend{to{opacity:0}}
@keyframes gmIn{from{opacity:0;translate:0 8px}to{opacity:1;translate:0 0}}
.mscr.on>*{animation-delay:calc(min(var(--i,0),4) * var(--stag) + 70ms)}
.mscr.on>.mSet>*{animation-delay:calc(min(var(--j,0),4) * var(--stag) + 110ms)}
#tPanel.open #tpIn>*{animation-delay:calc(min(var(--j,0),4) * var(--stag) + 40ms)}
.m2L:not(.pret){animation-delay:calc(min(var(--i,0),4) * var(--stag) + 120ms)}
.mcL{animation-delay:calc(min(var(--i,0),4) * var(--stag) + 120ms)}
html:not(.c6) #tPanel.open #tpIn{animation:none}
html:not(.c6) #tPanel.sortant #tpIn{animation:none}
.pbtn,.gT{transition:transform var(--t-fast) var(--ease),translate var(--t-fast) var(--ease),box-shadow var(--t-fast) var(--ease),filter var(--t-fast) var(--ease),opacity var(--t-fast) var(--ease)}
#gBqPan .bqK{animation-timing-function:var(--ease)}
#gInv.sortant{animation-timing-function:var(--ease)}
#toast{transform:translate(-50%,-8px)}
#toast.on{transform:translate(-50%,0)}
@media (prefers-reduced-motion:reduce){
  #wipe{opacity:0}
  #wipe.in{opacity:1;background:#07050f;transition:opacity 100ms linear}
  #wipe.out{opacity:0;background:#07050f;transition:opacity 100ms linear}
  html body #mob #mDead.m5.on :is(.m6Mot,.m6Aura,.mDuo>.pbtn){animation:none}
  #gBq.pan #gBqCats,#gBqPan .bqRail .bqSec,#gvMis,#gvMis::before,#gvMis::after,#gvMis .gvFx,#gName.entre{animation:none}
}
html[data-reduced-motion="1"] body #mob #mDead.m5.on :is(.m6Mot,.m6Aura,.mDuo>.pbtn){animation:none}
html[data-reduced-motion="1"] :is(#gBq.pan #gBqCats,#gBqPan .bqRail .bqSec,#gvMis,#gvMis::before,#gvMis::after,#gvMis .gvFx,#gName.entre){animation:none}
```
Non inclus exprès : D4 (profondeur d'appui, à choisir), D9 (REJOUER plus tôt, à arbitrer), `#gInvAide` sous RM (réserve de D6), D14 (JS).
À tester au banc avant de pousser : la pause (cascade seule), la fenêtre (8 px), l'ouverture de la boutique 3D (`.bqK` sans rebond, `bqAimant` : ses minuteurs fixes supposent des durées de 380-610 ms, inchangées ici), l'écran de mort sous RM, le rideau RM.
