# LOT qa/defispossibles — ce qui se gagne encore (2026-11-21)

Demande de Sacha (21/11) : « Aussi, dans la boutique, il y a plein de trucs qu'il faut changer maintenant depuis qu'on a. Faut que tu regardes tous les défis, notamment les missions. Par exemple, le blanc de neige, il faut que tu le remettes payant parce qu'il n'y a plus de niveau sur les glaciers. Donc, tu peux plus la gagner en jouant sur les glaciers. Tu captes ? Voilà, à régler. »

Lecture prise : tout ce qui se débloque, se gagne ou se demande a été relevé PAR PROGRAMME et jugé « encore atteignable au téléphone ? » ; chaque impossible est corrigé au plus simple (un objet → payant en argent du jeu ; une mission → hors de la liste ; un texte faux → corrigé FR/EN). Rien de ce qui reste atteignable, même difficile, n'a bougé. Branche `qa/defispossibles` (depuis `origin/qualite-appareil`), rien sur main, rien sur le téléphone.

## Ce qui est tiré aujourd'hui (relevé du vrai jeu)
- **Téléphone** (`?tel=1&appareil=iPhone14,2`) : MER DE NUAGES (6 temps), CRYPTO CITY la nuit (`ville`, orage), PICS DE JADE (6 temps), EN ORBITE (3 moments), LES PROFONDEURS (5 lumières, dont la GLACE), CANYON (matin, soir, nuit ; pluie et orage à poids 0) — 6 maps.
- **Ordinateur** : la même chose + CRYPTO CITY de jour (`crypto`, matin, midi, soir), dans la même map CRYPTO CITY.
- Hors du tirage partout : LE GLACIER (`banquise`, SF_HORS depuis le 30/10), LES DUNES (09/11). LA FORÊT n'est plus dans le code (10/11). La mer de Jade est retirée (12/11).
- Crypto City de jour (décision du 19/11 : elle reviendra au téléphone) : aucun défi ne dépend d'elle seule (`sc:ville` compte aussi la ville de nuit) — rien ne change quand elle reviendra.

## Comment c'est mesuré (rejouable)
1. `outils/defis-possibles/releve.cjs --sortie <dossier>` : Chrome sans fenêtre et muet charge le jeu assemblé (téléphone puis ordinateur) et écrit `dbgDefisPossibles()` (nouveau crochet, `code/missions/defis-possibles.js`) : les tables TELLES QUE LE JEU LES A CONSTRUITES (CAR_UNLOCK après les patchs des missions, M2 avec `m2Dispo`, COSM après les livrées et la vitrine), et les maps / météos tirées ici.
2. `outils/defis-possibles/juge.cjs releve-tel.json releve-pc.json` : Node seul. Pour chaque mesure qu'une condition lit, il cherche dans `code/` l'endroit où le jeu l'ÉCRIT, puis lit les conditions qui l'entourent (bloc `if(...)` englobant, gardes `if(c!=='x')return`, puis les appels de la fonction) → les cartes / météos qui l'alimentent. Un compteur que rien n'écrit = impossible ; un compteur écrit seulement sur une map hors du tirage = impossible ici. Les collections « toutes » ne sont atteignables que si chaque objet de leur lot l'est. Il vérifie aussi, sans lire `DEF_SOURCES`, que chaque peinture mise à prix l'a été À RAISON (son ancien défi doit être impossible). Essais du juge : glacier remis au tirage → BLANC NEIGE et MONTE-CARLO sont signalées « mises à prix à tort » ; cinq maps retirées → 28 impossibles signalés (COMBI, COMÈTE, abysse, lave, JADE IMPÉRIAL…).
3. `outils/defis-possibles/banc.cjs` : le banc dans le vrai jeu (voir Preuves).

## Ce qui a changé
| Objet | Condition avant | Atteignable ? | Ce que j'ai fait | Prix et modèle |
|---|---|---|---|---|
| BLANC NEIGE (peinture commune) | `sc:glacier` ≥ 10 : « Joue 10 niveaux sur le glacier » | NON : le compteur n'est écrit que sur `banquise` | payante en argent du jeu | 60 000 · le SALTO AVANT (figure commune) |
| MONTE-CARLO (peinture épique) | `sc:neige` ≥ 20 : « Joue 20 niveaux sous la neige » | NON : les temps NEIGE / BLIZZARD n'existent que sur `banquise` (la GLACE des Profondeurs n'en est pas) | payante | 180 000 · L'HÉLICO (figure épique, le milieu de 140 / 180 / 220 000) |
| CAMOUFLAGE (peinture épique) | `sc:foret` ≥ 10 | NON : plus rien n'écrit ce compteur (la forêt a quitté le code) | payante | 180 000 · même modèle |
| BLOC D'HERBE (peinture épique) | `sc:foret` ≥ 25 | NON : idem | payante | 180 000 · même modèle |
| mission `verglas100` « ROULE 200 KM SUR LE VERGLAS (GLACIER) », 30 000 | `c.verglasKm` | NON : écrit seulement sur `banquise` | hors de la liste, du compte, du pass et de l'écran de mort tant que le glacier est hors du tirage ; réussie avant : elle reste, sa récompense attend | — |
| mission secrète `lac10` « GLISSE 20 S SUR UN LAC GELÉ », 15 000 | `r.lac` | NON : écrit seulement sur `banquise` | même règle | — |
| mission `colall` « COLLECTE TOUTES LES COULEURS » | les 54 peintures du lot | NON (les 4 peintures ci-dessus) | redevient atteignable, rien à toucher | — |
| mission `toutall` « COLLECTE TOUS LES OBJETS DU JEU » | les 111 objets du lot | NON (idem) | redevient atteignable | — |
| GRANDE VAGUE (peinture épique) | `prof` : « Descends au fond de la mer de Jade. » | oui (la descente dans les pics de Jade, 400 m, comme la mission `abysse`) | texte corrigé : « Descends 400 m dans les pics de Jade. » / « Drop 400 m in the Jade Peaks. » | — |

Pourquoi payantes et pas un nouveau défi : la règle du lot (« un objet qui ne peut plus se gagner devient payant en argent du jeu »). Pourquoi ces prix : AUCUNE peinture ne se vend en dollars du jeu (les peintures sans défi sont en euros, 1 € / 2 € / 3 €, par l'App Store) ; un prix en euros voudrait dire un NOUVEAU produit App Store (interdit par le lot). Le modèle le plus proche est la boutique des FIGURES, les seuls habillages vendus en dollars du jeu qui restent tous en vitrine (les traînées vont partir, les ailes communes / épiques valent 300 000 et 4 000 000 : une aile n'est pas une couleur). 60 000 reste au-dessus de la plus petite chose à vendre (LE TAXI JAUNE, 2 500) : le relèvement du début de partie (`ecoDebutPrix`, 2 500 avant et après) ne bouge pas.

### Comment c'est fait dans le code
- `economie/boutique-vitrine.js` : `DEF_SOURCES` (les cartes / météos qui écrivent chaque compteur `sc:` — le miroir de `m2Niveau`), `sourceJouable`, `defJouable`, `PEINT_PRIX_JEU` ({commun:60000, epique:180000}). À la construction de COSM.peinture : un défi `sc:` injouable ICI → `exDef` (l'ancien défi), plus de `def`, `p` au prix de la rareté, pas d'`eur`. `ind` (la phrase) reste : l'écran des missions raconte toujours une peinture déjà gagnée. L'achat passe par `shopBuy` (la porte des ailes), le bouton dit ACHETER / IL TE MANQUE comme pour une aile.
- `missions/table.js` : `M2_CARTES` = {verglas100, lac10 : `banquise`} (à côté de M2K, avant l'appel de m2Etat du démarrage). `missions/defis-moteur.js` : `m2Jouable(m)` ; `m2Dispo` renvoie faux pour une mission injouable ici et pas encore réussie.
- Tout est DYNAMIQUE : `?carte=banquise` (ou le glacier remis au tirage, branche `maj`) rend les défis et les missions. `?sans=defispossibles` = comme avant.
- `economie/boutique.js` : la phrase de GRANDE VAGUE (FR et EN).
- `missions/defis-possibles.js` (nouveau morceau, après defis-moteur.js) : le crochet `dbgDefisPossibles()`.
- La sauvegarde : rien n'est écrit, rien n'est repris. Qui possède une peinture la garde (`shop.own`) ; un compteur commencé (`m2.c.sc.glacier`, `verglasKm`, `r.lac`) reste dans la sauvegarde ; une mission réussie reste réussie.

## Ce que j'ai laissé, et pourquoi
- **Les traînées** (missions `tr5`, `tr10`, `trall`, la FOUDRE DIVINE de `eng30`, la traînée du 5e jour de la série) : la branche `claude/sans-trainees-fed5f1` (pas encore fusionnée) les traite ; je n'y ai pas touché. Aucune de mes lignes ne touche les leurs (table.js : M2K, pas les lignes 41 et 68-70 ; pass-table.js : rien).
- **LA SILENCIEUSE** (mission `silence`) : la caisse est RETIRÉE, la mission est déjà cachée (`m2Dispo`, récompense absente). Fiche mise à jour.
- **Le pass** (`?pass=1` seulement, inerte) : `verglas100` est dans son réservoir ; le moteur du pass lit `m2Dispo`, elle n'y sortira donc pas.
- **Le défi du jour** (`?defijour=1` seulement) : éteint depuis le 22/10.
- **La MENTHE** (`m2Cpt('neige', …, 'menthe')`) : peinture retirée (HAB_RETIRES), l'appel ne donne rien. Inerte.
- **Encore atteignables, même difficiles** : `abysse` et GRANDE VAGUE (400 m de descente dans les pics de Jade : la mesure est écrite sur `jade`, tiré ; la distance n'a pas été mesurée au banc), MONDE À L'ENVERS (100 km sous la route), CAMÉLÉON (4 maps dans une partie : 6 maps au tirage), LE HOT ROD (palier 10 sur chaque morceau : la liste des musiques ne dépend pas des maps), LA STRATOS (une map sous tous ses temps : jade et nuages en ont 6), les fruits et les pouvoirs (citron, raisin, dragon, cerise, orange, myrtille : écrits par le ramassage).
- **Le CHAT POP-TART et l'ARC-EN-CIEL** : hors vente depuis le 13/11 par décision ; gardés par qui les a.
- **Les montants déjà notés ouverts** (fig5 15 000, parf10 25 000, rares 150 000, verglas100 30 000, lave 20 000, km100k 100 000) : pas touchés.

## Preuves
- Juge AVANT (origin/qualite-appareil + le crochet seul) : 8 impossibles affichés au joueur, téléphone ET ordinateur (les 4 peintures, verglas100, lac10, colall, toutall).
- Juge APRÈS : `JUGE OK` — 0 impossible affiché, téléphone ET ordinateur ; 2 « hors liste » (verglas100, lac10) ; 4 « payantes » dont l'ancien défi est bien impossible.
- Juge sur le jeu DE L'APP (le www que fabrique `app-ios/preparer-www.js --essai --sortie <dossier>` depuis cette branche, avec ses coupes ; le crochet du relevé y est remis à la main dans la copie, car l'app retire les `dbg`) : `JUGE OK` ; il trouve EN PLUS ce que la coupe de l'app fait aux traînées — l'ARC-EN-CIEL devient `sec` (rien ne la donne), donc `trall` et `toutall` impossibles DANS L'APP. C'est le B2 / B3 de `INCOHERENCES-21-11.md` : la fusion de sans-trainees le règle (l'arc-en-ciel sort de COSM), je n'y ai pas touché ; le juge le montre à part (« traînées »).
- Recoupement avec `passation/qualite/INCOHERENCES-21-11.md` (chasse du 21/11, arrivée sur qualite-appareil pendant ce lot) : B4 (les quatre peintures), B5 (verglas100, lac10) et la GRANDE VAGUE sont ceux de ce lot ; B4 y proposait de les passer en EUROS (1 € / 2 € + nouveaux produits App Store) — ce lot les met en argent du jeu (règle : aucun nouvel achat en argent réel) : voir la question 1. Le point (4) de leurs doutes (« le total de meteoMap / m2Cartes exclut-il les maps hors tirage ? ») : oui, m2Cartes et m2Meteo sautent SF_HORS (vérifié par le relevé : 6 maps).
- `outils/defis-possibles/banc.cjs` (Chrome sans fenêtre, muet, `?tel=1&appareil=iPhone14,2`, sous le verrou), `BANC OK` deux fois de suite, 40 contrôles :
  - compte neuf : BLANC NEIGE à 60 000, les trois épiques à 180 000, aucun produit App Store ; vraie boutique (GARAGE → BOUTIQUE → PEINTURES → la pastille) : IL TE MANQUE à banque vide, ACHETER 60 000 avec 100 000, l'achat débite 60 000, la peinture est à toi et équipée, le bouton dit DÉSÉQUIPER ; JOUER : la course part, BLANC NEIGE toujours équipée ;
  - sauvegarde qui la possède déjà (équipée, compteur du glacier à 7, verglas100 réussie non prise, lac10 à 7 s) : toujours à toi et équipée, banque inchangée, compteurs intacts, verglas100 toujours là à récupérer, lac10 hors de la liste ;
  - écran MISSIONS de l'atelier ouvert (vrai toucher) : ni GLACIER, ni VERGLAS, ni LAC GELÉ, ni FORÊT, ni MER DE JADE ; les défis de peinture listés n'ont plus les quatre ;
  - 0 exception, 0 erreur console dans chaque page.
- Gardes : `node outils/garde-demarrage.cjs` OK, `sh garde-allege.sh` OK, `sh garde-charte.sh` OK ; `node code/assembler.cjs --verifier` d'accord.
- Piège de banc noté : `dbgJouer()` APPUIE sur JOUER (il appelle classiqueJouer) — l'interroger en boucle lance une course ; le banc lit `#garage.on` et `dbgState()`.

## Non vérifié
- Sur le vrai iPhone (rien installé) ; l'app Capacitor n'est pas recompilée.
- Les 400 m de l'abysse / GRANDE VAGUE n'ont pas été roulés au banc (le juge dit seulement que la mesure est écrite sur une map tirée).
- La version anglaise des écrans (les phrases EN sont dans I18N, pas regardées à l'écran).
- `?sans=defispossibles` n'a pas été passé au banc.
- Avec la branche sans-trainees fusionnée : le juge n'a pas été rejoué sur l'assemblage des deux.

## Questions pour Sacha
1. BLANC NEIGE à 60 000 et MONTE-CARLO, CAMOUFLAGE, BLOC D'HERBE à 180 000 en argent du jeu : ça te va ? (Modèle : les figures.) L'autre choix : les mettre en euros comme les autres peintures (1 € et 2 €), mais il faut alors créer quatre nouveaux produits sur l'App Store.
2. Les trois épiques (neige et forêt) : payantes comme BLANC NEIGE, ou tu préfères un nouveau défi sur une map qui existe (par exemple MONTE-CARLO : « 20 niveaux dans la grotte gelée ») ?
3. Les missions du glacier (rouler sur le verglas, glisser sur un lac gelé) sont cachées tant que le glacier est hors du jeu. Tu veux un remplaçant (une mission dans la grotte gelée), ou c'est bien comme ça ?
4. La fiche TABLEAU-VOITURES a des prix d'avant le « ×10 » du 25/10 et quelques lignes différentes du jeu (STRATOS, ORIGAMI, KELLY CHERRY…) : je l'aligne sur le jeu, ou c'est le jeu qui doit suivre la fiche ?

## Le tableau complet (téléphone ; l'ordinateur donne le même verdict) — 240 objets
Colonnes : objet · condition avant · atteignable avant ce lot ? · ce que j'ai fait · prix et modèle. « hors liste » = déjà caché au joueur (sa récompense n'est plus au garage).

| Type | Objet | Condition avant | Atteignable ? | Fait | Prix et modèle |
|---|---|---|---|---|---|
| voiture | #0 LA HONTE | départ | oui | — |  |
| voiture | #1 ELDORADO | {"p":500000} | oui | — |  |
| voiture | #2 LE CAÏD | {"p":600000} | oui | — |  |
| voiture | #4 LÉONIE | {"p":4000000} | oui | — |  |
| voiture | #5 POSTER 84 | {"p":13200000} | oui | — |  |
| voiture | #7 LE COMBI | {"mis":"nuages10"} | oui | — |  |
| voiture | #8 LA DOLORÈS | {"mis":"mois1"} | oui | — |  |
| voiture | #9 CHAT POP-TART | {"k":"premium","eur":"4,20 €"} | oui | — |  |
| voiture | #11 COMÈTE | {"mis":"terre"} | oui | — |  |
| voiture | #15 ACIDE | {"p":2000000} | oui | — |  |
| voiture | #18 LE TAXI JAUNE | {"p":2500} | oui | — |  |
| voiture | #19 LA PIZZA EXPRESS | {"k":"premium","eur":"161,00 €"} | oui | — |  |
| voiture | #26 LE CORBILLARD | {"mis":"morts100"} | oui | — |  |
| voiture | #31 LE CHARGEUR | {"mis":"mis10"} | oui | — |  |
| voiture | #32 LE DÉFIEUR | {"mis":"pu100"} | oui | — |  |
| voiture | #33 LA BAVAROISE | {"p":1000000} | oui | — |  |
| voiture | #39 LE SAMOURAÏ | {"mis":"nmax100"} | oui | — |  |
| voiture | #40 LA VETTE | {"p":900000} | oui | — |  |
| voiture | #42 LA GRANDE ANGLAISE | {"p":1300000} | oui | — |  |
| voiture | #43 LE CHARGEUR 69 | {"p":700000} | oui | — |  |
| voiture | #47 LA TAURINE | {"mis":"nit2000"} | oui | — |  |
| voiture | #48 LA STRATOS | {"mis":"meteo"} | oui | — |  |
| voiture | #49 LA NOCTAMBULE | {"mis":"nuit3h"} | oui | — |  |
| voiture | #52 L'AIGLE DE FEU | {"k":"premium","eur":"1,61 €"} | oui | — |  |
| voiture | #54 LA FÉLINE | {"k":"premium","eur":"1,61 €"} | oui | — |  |
| voiture | #55 LA RAIE | {"p":2600000} | oui | — |  |
| voiture | #56 L'ÉTERNELLE | {"k":"premium","eur":"1,61 €"} | oui | — |  |
| voiture | #57 LE TRÔNE CENTRAL | {"mis":"carall"} | oui | — |  |
| voiture | #58 LE SPECTRE | {"p":4200000} | oui | — |  |
| voiture | #59 LE BLINDÉ NOIR | {"k":"premium","eur":"1,61 €"} | oui | — |  |
| voiture | #60 LE MUR DU SON | {"k":"premium","eur":"1,61 €"} | oui | — |  |
| voiture | #61 LE DRAGON D'OR | {"k":"premium","eur":"1,61 €"} | oui | — |  |
| voiture | #62 LE MASTODONTE | {"mis":"air1000"} | oui | — |  |
| voiture | #64 LE HOT ROD | {"mis":"palier10"} | oui | — |  |
| voiture | #68 L'ORIGAMI | {"p":2800000} | oui | — |  |
| voiture | #69 ATCHOUM | {"mis":"figs500"} | oui | — |  |
| voiture | #70 SQUALE | {"k":"premium","eur":"1,61 €"} | oui | — |  |
| voiture | #72 L'ICEBERG | {"k":"premium","eur":"0,80 €"} | oui | — |  |
| voiture | #76 LE SHIBA | {"mis":"rejoue10"} | oui | — |  |
| voiture | #80 LA DOLCE VITA | {"p":30000} | oui | — |  |
| voiture | #82 LE BAROUDEUR | {"p":80000} | oui | — |  |
| voiture | #83 KELLY CHERRY | {"k":"premium","eur":"1,61 €"} | oui | — |  |
| voiture | #84 LE ROUGE-GORGE | {"mis":"maps2"} | oui | — |  |
| voiture | #85 LA LAME | {"p":800000} | oui | — |  |
| voiture | #87 LA BÊTE | {"p":2200000} | oui | — |  |
| voiture | #88 LA ZAGAIE | {"p":3500000} | oui | — |  |
| voiture | #89 LE LOUP | {"p":50000000} | oui | — |  |
| mission | fig2 · FAIS … FIGURES DANS UN SEUL SAUT | fig ≥ 6 | oui | — |  |
| mission | fig5 · FAIS … FIGURES DANS UN SEUL SAUT | fig ≥ 12 | oui | — |  |
| mission | air5 · RESTE … S EN L'AIR, PUIS POSE-TOI EN PARFAIT | airP ≥ 12 | oui | — |  |
| mission | parf10 · FAIS … POSES PARFAITES D'AFFILÉE | parf ≥ 25 | oui | — |  |
| mission | fren · TIENS LA FRÉNÉSIE … S | frenT ≥ 15 | oui | — |  |
| mission | fren30 · TIENS LA FRÉNÉSIE … S | frenT ≥ 60 | oui | — |  |
| mission | kmh1000 · DÉPASSE … KM/H | kmh ≥ 1800 | oui | — |  |
| mission | vie5min · TIENS 12 MIN SANS MOURIR | vie ≥ 720 | oui | — |  |
| mission | tours5 · FRÔLE … TOURS EN UN SAUT (LA VILLE) | tours ≥ 12 | oui | — |  |
| mission | parfmaps · POSE-TOI EN PARFAIT SUR CHAQUE MAP | cartesP ≥ 6 | oui | — |  |
| mission | aura10k · ATTEINS … D'AURA EN UNE PARTIE | aura ≥ 40000 | oui | — |  |
| mission | aura20k · ATTEINS … D'AURA EN UNE PARTIE | aura ≥ 80000 | oui | — |  |
| mission | aura50k · ATTEINS … D'AURA EN UNE PARTIE | aura ≥ 120000 | oui | — |  |
| mission | cash100k · ACCUMULE … | gagne ≥ 250000 | oui | — |  |
| mission | cash500k · ACCUMULE … | gagne ≥ 1000000 | oui | — |  |
| mission | cash1m · ACCUMULE … | gagne ≥ 2500000 | oui | — |  |
| mission | cash2m · ACCUMULE … | gagne ≥ 5000000 | oui | — |  |
| mission | eng10 · MONTE AU PALIER … DU MOTEUR | eng ≥ 18 | oui | — |  |
| mission | eng20 · MONTE AU PALIER … DU MOTEUR | eng ≥ 28 | oui | — |  |
| mission | eng30 · MONTE AU PALIER … DU MOTEUR | eng ≥ 30 | oui | — |  |
| mission | car5 · COLLECTE … VOITURES | cars ≥ 8 | oui | — |  |
| mission | car10 · COLLECTE … VOITURES | cars ≥ 15 | oui | — |  |
| mission | car20 · COLLECTE … VOITURES | cars ≥ 20 | oui | — |  |
| mission | carall · COLLECTE TOUTES LES VOITURES | carsT ≥ 20 | oui | — |  |
| mission | rares · DÉBLOQUE TOUTES LES VOITURES RARES | raresT ≥ 7 | oui | — |  |
| mission | pu100 · RAMASSE … POWER-UPS | pu ≥ 250 | oui | — |  |
| mission | nmax100 · BRÛLE … S DE NITRO EN MODE NITRO MAX | nmaxS ≥ 200 | oui | — |  |
| mission | figs500 · FAIS … FIGURES | figs ≥ 1000 | oui | — |  |
| mission | nit2000 · BRÛLE … S DE NITRO | nitS ≥ 4000 | oui | — |  |
| mission | air1000 · PASSE … S EN L'AIR | airS ≥ 2000 | oui | — |  |
| mission | verglas100 · ROULE … KM SUR LE VERGLAS (GLACIER) | verglasKm ≥ 200 | NON — écrit seulement sur banquise (hors du tirage ici) | retirée de la liste tant que le glacier est hors du tirage (déjà réussie : reste à récupérer) |  |
| mission | km100k · ROULE … KM | kmTot ≥ 20000 | oui | — |  |
| mission | meteo · JOUE UNE MAP SOUS TOUTES SES MÉTÉOS | meteoMap ≥ 6 | oui | — |  |
| mission | silence · FAIS UNE PARTIE SANS SON NI MUSIQUE | flag ≥ 1 | oui (hors liste : récompense absente) | — |  |
| mission | palier10 · ATTEINS LE PALIER 10 SUR CHAQUE MUSIQUE DU JEU | musP10 ≥ 9999 | oui | — |  |
| mission | mis10 · RÉUSSIS … MISSIONS | misok ≥ 15 | oui | — |  |
| mission | col5 · COLLECTE … COULEURS | peint ≥ 8 | oui | — |  |
| mission | col10 · COLLECTE … COULEURS | peint ≥ 15 | oui | — |  |
| mission | colall · COLLECTE TOUTES LES COULEURS | peintT ≥ 54 | NON — objets impossibles dans le lot : neige, montecarlo, bloc, camo | redevient atteignable (ses 4 peintures impossibles sont à prix) |  |
| mission | tr5 · COLLECTE … TRAÎNÉES | trainee ≥ 8 | oui | — |  |
| mission | tr10 · COLLECTE … TRAÎNÉES | trainee ≥ 10 | oui | — |  |
| mission | trall · COLLECTE TOUTES LES TRAÎNÉES | traineeT ≥ 11 | oui | — |  |
| mission | ai5 · COLLECTE … AILES | aile ≥ 8 | oui | — |  |
| mission | ai10 · COLLECTE … AILES | aile ≥ 12 | oui | — |  |
| mission | aiall · COLLECTE TOUTES LES AILES | aileT ≥ 14 | oui | — |  |
| mission | fig3 · COLLECTE … FIGURES | figure ≥ 5 | oui | — |  |
| mission | fig8 · COLLECTE … FIGURES | figure ≥ 12 | oui | — |  |
| mission | figall · COLLECTE TOUTES LES FIGURES | figureT ≥ 12 | oui | — |  |
| mission | toutall · COLLECTE TOUS LES OBJETS DU JEU | toutT ≥ 111 | NON — objets impossibles dans le lot : peinture:neige, peinture:montecarlo, peinture:bloc, peinture:camo | redevient atteignable (même raison) |  |
| mission | maps · JOUE SUR CHAQUE MAP AU MOINS UNE FOIS | cartes ≥ 6 | oui | — |  |
| mission | maps2 · AVOIR EXPLORÉ CHAQUE MAP | cartes ≥ 6 | oui | — |  |
| mission | morts100 · MEURS … FOIS | morts ≥ 200 | oui | — |  |
| mission | mort3s · MEURS DANS LES 3 PREMIÈRES SECONDES | flag ≥ 1 | oui | — |  |
| mission | arret · RESTE À L'ARRÊT JUSQU'À EXPLOSER | flag ≥ 1 | oui | — |  |
| mission | nitplein · MEURS LA JAUGE DE NITRO PLEINE | flag ≥ 1 | oui | — |  |
| mission | air0 · MEURS PILE À 0 S DE VOL RESTANT | flag ≥ 1 | oui | — |  |
| mission | kmh2000 · DÉPASSE … KM/H | kmh ≥ 2000 | oui | — |  |
| mission | lave · ROULE DANS LA LAVE | flag ≥ 1 | oui | — |  |
| mission | abysse · DESCENDS 400 M DANS LES PICS DE JADE | prof ≥ 400 | oui | — |  |
| mission | nuage30 · RESTE … S EN L'AIR AU-DESSUS DES NUAGES | vol ≥ 45 | oui | — |  |
| mission | terre · FAIS UN SALTO DEVANT LA TERRE | flag ≥ 1 | oui | — |  |
| mission | lac10 · GLISSE … S SUR UN LAC GELÉ | lac ≥ 20 | NON — écrit seulement sur banquise (hors du tirage ici) | retirée de la liste (même règle) |  |
| mission | sansnit · FAIS UNE PARTIE ENTIÈRE SANS TOUCHER NITRO | flag ≥ 1 | oui | — |  |
| mission | sanspiece · FAIS UNE PARTIE SANS RAMASSER UNE SEULE PIÈCE | flag ≥ 1 | oui | — |  |
| mission | rejoue10 · REJOUE … FOIS DE SUITE SANS REVENIR AU MENU | rejoue ≥ 15 | oui | — |  |
| mission | nuit3h · JOUE À 3 H DU MATIN | flag ≥ 1 | oui | — |  |
| mission | jours7 · JOUE … JOURS DIFFÉRENTS | jours ≥ 10 | oui | — |  |
| mission | jours30 · JOUE … JOURS DIFFÉRENTS | jours ≥ 30 | oui | — |  |
| mission | nuages10 · PASSE … NIVEAUX DANS LES NUAGES | nuagesPasse ≥ 10 | oui | — |  |
| mission | mois1 · GARDE LE JEU … JOURS | installJ ≥ 30 | oui | — |  |
| peinture | D'ORIGINE | offerte | oui | — |  |
| peinture | ROUGE BOLIDE | défi : Croque 50 cerises. | oui | — |  |
| peinture | ORANGE ÉMEUTE | défi : Croque 50 oranges. | oui | — |  |
| peinture | JAUNE TAXI | défi : Ramasse 50 citrons. | oui | — |  |
| peinture | VERT BILLET | défi : Gagne 100 000 € au total. | oui | — |  |
| peinture | LAGON | euros : 1 € | oui | — |  |
| peinture | AZUR | défi : Croque 50 myrtilles. | oui | — |  |
| peinture | BLEU MINUIT | défi : Joue 10 niveaux de nuit. | oui | — |  |
| peinture | VIOLET ROYAL | défi : Ramasse 50 raisins. | oui | — |  |
| peinture | FUCHSIA | défi : Ramasse 50 fruits du dragon. | oui | — |  |
| peinture | ROSE POUPÉE | euros : 1 € | oui | — |  |
| peinture | BLANC NEIGE | défi : Joue 10 niveaux sur le glacier. | NON — écrit seulement sur banquise (hors du tirage ici) | rendue PAYANTE (argent du jeu) | 60 000 · modèle : SALTO AVANT (figure commune) |
| peinture | GRIS NARDO | euros : 1 € | oui | — |  |
| peinture | NOIR MAT | euros : 1 € | oui | — |  |
| peinture | ROSE DRAGÉE | défi : Joue 10 niveaux le matin. | oui | — |  |
| peinture | LILAS | euros : 1 € | oui | — |  |
| peinture | BLEU PISCINE | défi : Joue 10 niveaux en plein jour. | oui | — |  |
| peinture | PISTACHE | euros : 1 € | oui | — |  |
| peinture | LAVE | euros : 1 € | oui | — |  |
| peinture | BRAISE FIDÈLE | défi : Le 7e jour d'une série de 7 jours. | oui | — |  |
| peinture | COUCHER DE SOLEIL | euros : 1 € | oui | — |  |
| peinture | MONDE À L'ENVERS | défi : Roule 100 km sous la route. | oui | — |  |
| peinture | LAGON INTERDIT | défi : Le 7e jour d'une série de 7 jours. | oui | — |  |
| peinture | ÉCLAIR | défi : Dépasse 1 500 km/h. | oui | — |  |
| peinture | AURORE BORÉALE | défi : Le 7e jour d'une série de 7 jours. | oui | — |  |
| peinture | JADE IMPÉRIAL | défi : Roule 8 km sur les pics de jade en une partie. | oui | — |  |
| peinture | VAPORWAVE | euros : 1 € | oui | — |  |
| peinture | NUIT ÉTOILÉE | défi : Le 7e jour d'une série de 7 jours. | oui | — |  |
| peinture | PRISME | défi : Enchaîne 6 figures dans un seul saut. | oui | — |  |
| peinture | CAMÉLÉON | défi : Traverse 4 maps dans la même partie. | oui | — |  |
| peinture | CHROME MIROIR | défi : Joue 5 niveaux dans les nuages. | oui | — |  |
| peinture | OR ROSE | défi : Pose-toi en DIVIN à plus de 900 km/h. | oui | — |  |
| peinture | SUPER GUERRIER | défi : Atteins le palier 24 du moteur. | oui | — |  |
| peinture | CUIVRE | euros : 1 € | oui | — |  |
| peinture | HOLOGRAMME | euros : 1 € | oui | — |  |
| peinture | NACRE | défi : Fais 5 poses parfaites d'affilée. | oui | — |  |
| peinture | FANTÔME | défi : Roule 2 minutes sans toucher un bord. | oui | — |  |
| peinture | NUIT DE GOTHAM | défi : Joue 10 niveaux dans la ville. | oui | — |  |
| peinture | CIEL D'ORAGE | défi : Joue 10 niveaux sous la pluie. | oui | — |  |
| peinture | LUNAIRE | défi : Joue 10 niveaux en orbite. | oui | — |  |
| peinture | LAMPADAIRE | défi : Fais 25 figures dans la ville en une partie. | oui | — |  |
| peinture | BANANA | euros : 1 € | oui | — |  |
| peinture | SORBET | euros : 1 € | oui | — |  |
| peinture | TOXIQUE | euros : 1 € | oui | — |  |
| peinture | GROUPE B | défi : Tiens la frénésie 40 secondes. | oui | — |  |
| peinture | MONTE-CARLO | défi : Joue 20 niveaux sous la neige. | NON — écrit seulement sur */neige/blizzard (hors du tirage ici) | rendue PAYANTE (argent du jeu) | 180 000 · modèle : L'HÉLICO (figure épique, milieu de 140 / 180 / 220 k) |
| peinture | SAFARI | défi : Gagne 500 000 € au total. | oui | — |  |
| peinture | DAKAR | défi : Joue 25 niveaux en plein jour. | oui | — |  |
| peinture | BLEU POUDRE | défi : Joue 14 jours différents. | oui | — |  |
| peinture | L'APÉRITIF | euros : 2 € | oui | — |  |
| peinture | NOIR ET OR | défi : Gagne 5 000 000 € au total. | oui | — |  |
| peinture | FLÈCHE D'ARGENT | défi : Dépasse 2 000 km/h. | oui | — |  |
| peinture | PIT STOP | défi : Fais 3 poses parfaites d'affilée. | oui | — |  |
| peinture | LIGNE D'ARRIVÉE | défi : Atteins le palier 12 du moteur. | oui | — |  |
| peinture | PANDA 86 | défi : Joue 20 niveaux sous la pluie. | oui | — |  |
| peinture | CAPTURE | défi : Enchaîne 8 figures dans un seul saut. | oui | — |  |
| peinture | BLOC D'HERBE | défi : Joue 25 niveaux dans la forêt. | NON — rien ne l'écrit dans le code | rendue PAYANTE (argent du jeu) | 180 000 · même modèle |
| peinture | CONSOLE GRISE | défi : Joue 7 jours différents. | oui | — |  |
| peinture | ÉCLAIR 95 | défi : Dépasse 1 000 km/h. | oui | — |  |
| peinture | ECTO | défi : Joue 25 niveaux de nuit. | oui | — |  |
| peinture | ITASHA | défi : Joue 25 niveaux le matin. | oui | — |  |
| peinture | TOKYO DRIFT | défi : Joue 25 niveaux dans la ville. | oui | — |  |
| peinture | STICKER BOMB | euros : 2 € | oui | — |  |
| peinture | FLAMMES | défi : Tiens la frénésie 20 secondes. | oui | — |  |
| peinture | CARBONE | défi : Atteins 20 000 d'aura en une partie. | oui | — |  |
| peinture | GRAFFITI | défi : Frôle 5 tours dans un seul saut. | oui | — |  |
| peinture | POP ART | euros : 2 € | oui | — |  |
| peinture | GRANDE VAGUE | défi : Descends au fond de la mer de Jade. | oui | phrase du défi corrigée FR/EN (plus de mer de Jade) |  |
| peinture | PLEIN AUX AS | défi : Gagne 1 000 000 € au total. | oui | — |  |
| peinture | TIGRE | euros : 2 € | oui | — |  |
| peinture | LÉOPARD | euros : 2 € | oui | — |  |
| peinture | ZÈBRE | euros : 2 € | oui | — |  |
| peinture | VACHE | euros : 2 € | oui | — |  |
| peinture | COCCINELLE | euros : 2 € | oui | — |  |
| peinture | FLOWER POWER | euros : 2 € | oui | — |  |
| peinture | CAMOUFLAGE | défi : Joue 10 niveaux dans la forêt. | NON — rien ne l'écrit dans le code | rendue PAYANTE (argent du jeu) | 180 000 · même modèle |
| peinture | MOUSSE | euros : 2 € | oui | — |  |
| peinture | GALAXIE | défi : Joue 30 jours différents. | oui | — |  |
| peinture | NÉON TOKYO | euros : 3 € | oui | — |  |
| peinture | SAKURA.EXE | euros : 3 € | oui | — |  |
| peinture | MAGMA | euros : 3 € | oui | — |  |
| peinture | ABYSSES | euros : 3 € | oui | — |  |
| peinture | RGB | euros : 3 € | oui | — |  |
| aile | PANNEAUX | offerte | oui | — |  |
| aile | HÉLICES | dollars : 300000 $ | oui | — |  |
| aile | PLUMES D'ANGE | dollars : 1200000 $ | oui | — |  |
| aile | CHAUVE-SOURIS | dollars : 2500000 $ | oui | — |  |
| aile | PIGEON | dollars : 600000 $ | oui | — |  |
| aile | AVION EN PAPIER | dollars : 900000 $ | oui | — |  |
| aile | MONARQUE | dollars : 1200000 $ | oui | — |  |
| aile | 8-BIT | dollars : 2500000 $ | oui | — |  |
| aile | BARON ROUGE | dollars : 3800000 $ | oui | — |  |
| aile | ENGRENAGES | dollars : 4000000 $ | oui | — |  |
| aile | AILES EN X | dollars : 4200000 $ | oui | — |  |
| aile | FÉE | dollars : 4500000 $ | oui | — |  |
| aile | DRAGON | dollars : 4800000 $ | oui | — |  |
| aile | SANS AILES | dollars : 5000000 $ | oui | — |  |
| aile | PHÉNIX | mission : aura50k | oui | — |  |
| traînée | NITRO | offerte | oui | — |  |
| traînée | ROSE NÉON | dollars : 40000 $ | oui | — |  |
| traînée | POUDRE D'OR | dollars : 150000 $ | oui | — |  |
| traînée | ARC-EN-CIEL | pack : avec le CHAT POP-TART | oui | — |  |
| traînée | WOW | dollars : 300000 $ | oui | — |  |
| traînée | SAKURA | dollars : 80000 $ | oui | — |  |
| traînée | MATRICE | dollars : 110000 $ | oui | — |  |
| traînée | ANNEAUX D'OR | dollars : 220000 $ | oui | — |  |
| traînée | GLOUTON | dollars : 400000 $ | oui | — |  |
| traînée | HYPERESPACE | dollars : 900000 $ | oui | — |  |
| traînée | LA GRILLE | dollars : 2000000 $ | oui | — |  |
| traînée | FAIS PLEUVOIR | dollars : 5000000 $ | oui | — |  |
| traînée | FOUDRE DIVINE | mission : eng30 | oui | — |  |
| figure | TAIL WHIP | offerte | oui | — |  |
| figure | TONNEAU | dollars : 15000 $ | oui | — |  |
| figure | TOUPIE 360 | dollars : 25000 $ | oui | — |  |
| figure | SHIMMY | dollars : 20000 $ | oui | — |  |
| figure | CHANDELLE | dollars : 35000 $ | oui | — |  |
| figure | SALTO | dollars : 60000 $ | oui | — |  |
| figure | DOUBLE TONNEAU | dollars : 90000 $ | oui | — |  |
| figure | TIRE-BOUCHON | dollars : 140000 $ | oui | — |  |
| figure | HELICO 720 | dollars : 180000 $ | oui | — |  |
| figure | VRILLE PENCHEE | dollars : 220000 $ | oui | — |  |
| figure | RODEO | dollars : 300000 $ | oui | — |  |
| figure | SALTO COSMIQUE | dollars : 500000 $ | oui | — |  |
