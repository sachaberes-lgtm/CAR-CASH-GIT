# CAHIER DES CHARGES — L'ESTHÉTIQUE DES VOITURES (état au 21/10/2026)

Rassemblé le 21/10 à la demande de Léo : « tous les changements concernant l'esthétique des voitures, que tu arrives à retrouver, en cahier
des charges, à garder pour plus tard ». Sources : le code (`code/voitures/`, `code/interface/`), le JOURNAL.md, les notes de travail des
discussions (retouche, relief, rouges, feux, vitre, action spéciale, nouvelles voitures). Ce qui n'a pas pu être revérifié est marqué **(à vérifier)**.

---

## 1. LES GOÛTS DE LÉO (la loi de ce chantier)

- **Il juge en regardant, en essayant.** Toujours une planche AVANT | APRÈS (garage ET course), jamais « c'est fait » sans image. Son « oui » → main ; « c bof » → on revient à avant et on attend.
- **Des volumes, jamais aplatir** en dessin. Une tôle en UNE dalle s'allume ou s'éteint d'un bloc quand on tourne : « jouet ». Il veut des PANS d'angles différents, des creux, des arêtes franches, « propre » (rien qui traverse).
- **Brillant ET poly** : « une manière plus moderne, plus stylée, plus polie — brillante et poly, sans te limiter au poly ».
- **Il veut la couleur ET le métal.** Les deux à la fois : une teinte qui reste franche (jamais pâle ni lavée) ET des reflets nets qui claquent quand la caisse tourne. Les verdicts successifs du 21/10 en course : « on dirait le phare sur la lunette arrière » → « ça scintille plus du tout » → « la voiture perd sa couleur » → « où est le brillant et métallique ? ».
- **Cohérence avec la map** : les reflets doivent suivre le soleil / la lumière de la map, pas ressembler à un garage « très répétitif ».
- **Une voiture aussi belle en jeu qu'au garage / en boutique** — c'est l'objectif de fond.
- Un visage éclaté sur une carrosserie fait peur ; la tête entière intacte plaît (LE DOGE). Animer en déformant la peau, pas en coupant des blocs rigides.

## 2. LA LUMIÈRE ET LES REFLETS — « LA FINITION STUDIO »

Fichier : `code/voitures/finition.js` (+ appels dans `code/interface/passe-textes.js`, `habillages-accueil.js`, `chute-libre.js`, `buildcar.js`).
Interrupteur : **`?finition=ancien`** (ou `dbgFinition(0)`) = tout l'ancien rendu. `dbgFinition('etat')` donne l'état ; `dbgFinition('mire')` une mire pour lire les hauteurs reflétées.

Une caisse reflète un **cube de 6 canvas** (`envCvs` → `envTex`) ; sa laque lit ce cube. Trois ambiances le repeignent :

| Où | Fonction | Cube | Idée |
|---|---|---|---|
| **Garage / boutique** | `paintEnvStudio` | 256² | murs sombres + longues boîtes à lumière à hauteur de flanc / d'épaule / de toit + colonnes + panneau de plafond. Vernis profond (`finLaque(true)`) + « reflets qui éclatent » (`fstuHdr` : ce qui est presque blanc compte ×5,5). |
| **Menu ciel** (accueil dans le ciel, la chute) | `paintEnvMenu` | 256² | le ciel du menu assombri + trois bandes nettes (flancs, épaules, toits) + disque de soleil. Dosé par le jour (`FSTU.menuW`). |
| **En course** (21/10) | `paintEnvCiel` | 128² | **le ciel de la map peint PAR DIRECTION du monde** (voir §2.3). |

### 2.1 Le vernis profond (`finLaque`)
La laque montre plus sa couleur de face (`FSTU_LAQUE` : p `[1.35, 3.6, 1.8, .2, 0]`, k `[1.3, 3.2, 1.8, 1, .02]` = [de face, en rasant, dureté, métal, plancher lumineux]) et devient miroir en rasant ; le plancher lumineux baisse (ombres franches). `FSTU.uHdr` (0…1) dose l'éclat des presque-blancs. **REQUIN** (`FSTU_SANS`) garde l'ancien rendu partout (Léo : « juste le requin était mieux »).

### 2.2 Menu ciel — réglages du 21/10
- `FSTU.menuW = .55 + .45 × jour` (avant .3 : la nuit la caisse s'éteignait).
- Lampe de vitrine par plan (`MENU_PLANS` dans `habillages-accueil.js`) : affiche 3,4 → **4,4**, arrière 2,2 → **2,9**, profil .45 → **.7**.
- Demande restée ouverte : « mettre la voiture vraiment en avant sans qu'elle perde sa couleur, sans abuser ». **(à vérifier à l'œil à plusieurs heures du jour — l'heure du menu change)**.

### 2.3 En course — `paintEnvCiel` (livré le 21/10, cache v760)
Appelée depuis `paintEnv` (fin de la fonction) à chaque changement de biome/niveau, puis `finLaque('menu')`. Hors garage seulement, jamais pour REQUIN.
- **Les 6 faces d'un seul tenant** : la direction du monde de chaque pixel est calculée une fois (`fstuDirs`) ; three lit le cube en `(−x, y, z)` (`flipEnvMap`) et les faces à la convention OpenGL — c'est ce qui place le soleil à sa vraie place (`SUN_DIR`).
- **Dégradé du biome** selon la hauteur (stops du biome), **assombri** : `sombre = .3 + .14 × jour` (le fond sombre garde la couleur profonde — la recette du garage).
- **Soleil** : halo resserré + disque net (`cs` = cosinus à `SUN_DIR`). Le halo large faisait une tache sur la lunette arrière : il est resserré. Sans soleil (nuit, ville, orbite : `sunHalo === 0` ou jour < .3) : la même lumière au néon du biome.
- **Brume d'horizon irrégulière** (nuages), plus allumée côté soleil.
- **Les éclats = le scintillement et le métal** (`FSTU_ECL`) : 5 tronçons de lumière à bords francs à des hauteurs de flanc / épaule / toit, de longueur irrégulière (deux fréquences incommensurables : rien ne se répète), plus vifs côté soleil ; ils glissent d'un pan à l'autre quand la caisse tourne. Finaux : épaisseur ×0,6 (fins), plafond 1, pas de grand voile (`ci` ≈ .015-.035).
- Dosage final : `FSTU.menuW = 1`, éclat HDR à 100 % (comme le garage).
- **Coût** : 128² ≈ 15 ms au changement de niveau, une fois ; en 256² ce serait ~60 ms (hoquet au portail). Le disque reste net.
- **Pas testé** (ne l'ont été que : auto-école, canyon, une map de nuit, ville) : neige, jour très clair, grotte, dunes, glacier, orbite. **Risque connu : une map très claire peut encore pâlir la caisse.**

### 2.4 Essais écartés (ne pas refaire sans raison)
- Des **bandes identiques sur chaque mur** en course (1re version de la finition en course) : « reflet de garage, très répétitif ».
- Un **grand voile de ciel clair** pour faire briller le coffre : il lavait la couleur (caisse pêche pâle). Remplacé par des éclats fins.
- **Filet de lumière sur chaque arête** par barycentres (`?aretes=1`) : dents de scie autour des roues sur les facettes fines.
- « Le monde dans la laque » (décor réfléchi) : invisible depuis la caméra de poursuite.
- Baisser l'éclat HDR à .55-.7 pour sauver la couleur : on perd le métal. La couleur se sauve par le **fond sombre**, pas en éteignant les éclats.

## 3. LES COULEURS — LAQUES QUI BRÛLENT

Leçon : **mesurer la part de tôle à 255 DE JOUR**, pas seulement à l'œil au garage ; l'albédo doit tomber bien plus bas qu'on ne croit (saturation 1,4 du grade + lumière du garage ≈ 4× l'albédo).
- **Rouges** (SUR LE MAIN v706) : VETTE, ROSSO 40, CERISE, HOT ROD, RAIE, PUCE — palette `p` du gabarit : `c → c×0,55 + (8, 15, 18)`.
- **Oranges** (SUR LE MAIN v707 puis v714 « plus fort ») : TAURINE `471802`, ZED `4e2208`, TRÔNE CENTRAL `4e2707` (×0,42 de la v707). Orange reste orange, chaque pan se lit.
- **Restent proposés, non appliqués** : LE DÉFIEUR (jaune, k .78), POSTER 84.
- `CARS[i].color` n'est PAS touché (c'est la peinture d'usine de la vignette d'inventaire).

## 4. LE RELIEF QUAND ON TOURNE

- Principes : des **pans** pas une dalle ; le **creux** entre deux bosses ; une **arête franche** (dessus qui rentre = clair, dessous = sombre) ; **propre** (traits peints SEULEMENT sur du vrai volume). Une porte « en creux » reste UN pan plat : l'incliner ou la plier.
- Mesure : caisse EN GRIS (« argile ») + normales → pans du flanc par 10° ; score = écart entre pans + nombre de pans − part du plus grand pan.
- Faits : LE CAÏD (pilote, v710) ; SAMOURAÏ (2→30), BAROUDEUR (3→17), PIZZA EXPRESS (4→22), LA HONTE (5→8), ACIDE (6→25).
- Étude de toute la gamme : classement et planches dans `photos-gameplay/relief-gamme-*.png` ; ORIGAMI = Cybertruck, plat voulu.

## 5. LES VITRES, LES FEUX, LES DÉTAILS DE TÔLE

- **Vitre V2** (`vitreV2(P,K,o)`, `code/voitures/caid.js`, v705) : une vitre = une PIÈCE (cadre chanfreiné laqué + verre bombé transparent, sérigraphie en couleurs de sommets). **À étendre à toute la gamme** (Léo le veut) : la déplacer dans `code/voitures/vitre-v2.js`, retirer la vitre peinte, prévoir un fond d'habitacle derrière le verre transparent.
- **Feux en LED** (`code/voitures/feux-led.js`, v711) : plus de halo/boule ; la lampe s'allume via des coques additives à sa forme ; faisceau dans l'air la nuit. `?feux=0` = avant. Exclus : `FEUX_SAUF` (CHAT POP-TART, LE DOGE, LA FOURNAISE, L'ICEBERG). Reste : la meute (`pcHeadM` 0xffe2a8) a encore des halos crème.
- **Feux arrière sans boule** (v758) et **LA HONTE : taches de rouille sur le toit** (v759) — ajouts de Sacha/autres pôles ; voir JOURNAL.md.
- **Action spéciale d'une caisse** (v747+) : `CAR_ACTION` / `caisseAction()` — le tap sur la caisse (garage, menu ciel) ; LA CERISE et LE TOFU lèvent leurs phares, LA SQUALE sort ses crocs (12 cm, CLAC, retour lent, chaque croc dans SA direction). La pièce qui bouge doit être un kit à part.
- **Nouvelles voitures** (index 79-88, rondes / japonaises / boîtes) : LE SCARABÉE, LA CERISE, LA DOLCE VITA, LE BAROUDEUR, LA CABOSSÉE, LE ROUGE-GORGE, LA LAME, LE TOFU, LA FIDÈLE, LA QUEUE DE CANARD, LA GRANDE ANGLAISE, LE CAÏD (Hummer EV puis SUV puis pick-up toit ouvert), LA BÊTE (87). Prix et raretés : JOURNAL.md. Planches vraie voiture | nous : `photos-gameplay/*-vraie-et-nous.png`.
- **Concepts retouchés** : LA MERCURE (mercure liquide), LE DOGE (tête de shiba sur roues), LA PERLE (Taycan blanche, refaite au plan), LE BLINDÉ NOIR (porc-épic). LA POUPÉE retirée (ne pas la remettre sans Léo).
- **Cartes postales / affinement** : relevés d'affinement des 15 caisses japonaises, rondes et boîtes (`photos-gameplay/affinement-*.png`) — rien corrigé à ce jour : liste de retouches possibles.

## 6. PIÈGES TECHNIQUES RETENUS

- Un shader n'est compilé qu'une fois : tout ce qui change la finition passe par des **uniformes** (`uV`, `uG`, `uVr`, `uHdr`), jamais par un `#define` — 0 compilation en course.
- Les matières de caisse ont leur clé de programme (`customProgramCacheKey`) pour ne pas déteindre sur les meubles de l'atelier.
- `buildCar` est refait au départ d'une course : tout réglage à chaud se pose APRÈS le départ ; `finLaque(FSTU.garage)` y est rappelé (`buildcar.js`).
- Les caisses RETIRÉES `{retire:1}` n'ont pas de cotes : un banc qui balaie la gamme doit les sauter (`carFicheOk`).
- Profondeur 16 bits : décalcomanies en `polygonOffset`.
- En édition : on modifie `code/`, puis `node code/assembler.cjs` (Node dans `~/.local/node/bin`), puis cache `sw.js` +1.

## 7. OÙ EST QUOI

- Finition : `code/voitures/finition.js` · reflet de course : fin de `paintEnv` dans `code/interface/passe-textes.js` · menu : `habillages-accueil.js` (MENU_PLANS) + `chute-libre.js`.
- Hooks console : `dbgFinition('etat'|'mire'|0|1)`, `dbgMenuPlan('affiche'|'arriere'|'profil')`, `dbgAuto(true)` (pilote auto pour regarder la caisse en course), `dbgEquipe(i)`.
- Banc : navigateur intégré sur `http://localhost:9400/?colonne=0&tel=1` ; comparer avec `?finition=ancien`. Au clic de l'écran titre, la fenêtre peut changer de taille : reprendre une capture avant de cliquer.

## 8. CE QUI RESTE À FAIRE / À DÉCIDER

1. Revérifier la finition en course sur **toutes les maps** (surtout claires : neige, glacier, dunes, jour) ; si la caisse y pâlit, doser `sombre` par biome ou baisser les éclats à la carte.
2. Menu ciel : valider « mise en avant » à plusieurs heures (jour, couchant, nuit).
3. Étendre la **vitre V2** à la gamme ; régler LE DÉFIEUR et POSTER 84 (couleurs) ; halos crème de la meute.
4. Rendre `paintEnvCiel` plus fin sans hoquet (256² amorti sur plusieurs images) si Léo trouve le disque de soleil flou.
5. Rejouer le balayage de gamme (garage + course) après chaque changement de finition : planche AVANT | APRÈS.
