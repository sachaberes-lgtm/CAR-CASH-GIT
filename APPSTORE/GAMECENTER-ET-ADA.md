# GAME CENTER, MISE EN AVANT APPLE ET GRILLE APPLE DESIGN AWARDS

Référence : `VERSION PRINCIPALE/index.html` (55 775 lignes, état du 2026-10-14). Les numéros de ligne sont ceux de ce fichier. Aucun code du jeu n'a été modifié.

## 0. Constat de départ (lucide)

- **Aucun Game Center, aucun iCloud, aucun GameController, aucun Sign in with Apple, aucun widget/Shortcut dans le code.** Les seuls plugins Capacitor touchés sont `Haptics` (l.38663) et `Preferences` (l.38479/38499/38501).
- Il n'existe **pas de classement en ligne** : le « Top 10 » local (`SAVE.d.leaders`, l.38308, filtré l.38345) a été masqué sur mobile (l.1031 « Le classement a disparu »). Le jeu a pourtant 100 % de la matière première : record, aura, chaîne, frénésie, vitesse.
- Les données « à vie » sont déjà propres et sérialisées : `SAVE.d.ex` (l.38320 : `eng, tricks, gaps, bumps, zones, chain, kmh, surv, runs`), `SAVE.d.aura`, `SAVE.d.auraMax`, `SAVE.d.frenRec`, `SAVE.d.best`, `SAVE.d.mis`. Brancher Game Center = un seul module de ~120 lignes + un plugin natif.

## 1. GAME CENTER

### 1.1 Succès (18, total 1000 points)

Règles Apple : max 100 succès, 1000 points au total, secrets autorisés. Ids au format `cc.ach.<nom>` (à créer dans App Store Connect). Les conditions s'appuient sur des compteurs EXISTANTS ; « à créer » indique un petit compteur manquant.

| # | id | Nom FR (≤30) | Nom EN (≤30) | Description (FR) | Pts | Secret | Source dans le jeu |
|---|----|--------------|--------------|------------------|-----|--------|--------------------|
| 1 | `cc.ach.premier_saut` | Premier décollage | First Takeoff | Quitte la route pour la première fois. | 10 | non | `runStats.gaps>0` / `SAVE.d.ex.gaps` |
| 2 | `cc.ach.tuto_fini` | Permis de voler | Flight License | Termine la première partie guidée. | 10 | non | `SAVE.d.tuto` (l.38328) |
| 3 | `cc.ach.premier_cash` | Premier billet | First Bill | Verse ton premier argent au compte. | 10 | non | `SAVE.d.bank>0` |
| 4 | `cc.ach.chaine_10` | Chaîne de 10 | 10-Trick Chain | Enchaîne 10 figures dans un seul vol. | 40 | non | `runStats.chainMax>=10` (l.39523) |
| 5 | `cc.ach.chaine_25` | Chaîne de 25 | 25-Trick Chain | 25 figures sans toucher le sol. | 80 | non | `runStats.chainMax>=25` |
| 6 | `cc.ach.kmh_500` | Mur du son | Sound Barrier | Atteins 500 km/h. | 40 | non | `runStats.vmax`, `SAVE.d.ex.kmh` |
| 7 | `cc.ach.kmh_2000` | Plus vite que l'ombre | Faster Than Shadow | Atteins 2 000 km/h. | 80 | non | idem |
| 8 | `cc.ach.zones_5` | Globe-trotter | Globe-Trotter | Traverse 5 zones dans une partie. | 50 | non | `runStats.zones>=5`, `SAVE.d.ex.zones` |
| 9 | `cc.ach.dauphin` | Le dauphin | The Dolphin | Nage au ras de la dalle 2,4 s cumulées (DAUPHIN ROYAL). | 50 | non | seuil `dolphT` (déjà tracé, `trkDolph` l.40856) |
| 10 | `cc.ach.frenesie_30` | Frénésie tenue | Frenzy Held | Tiens une frénésie 30 s. | 70 | non | `SAVE.d.frenRec>=30` (l.30927) |
| 11 | `cc.ach.survivant` | Dernier debout | Last One Standing | Gagne un Survivant. | 60 | non | `SAVE.d.ex.surv>=1` |
| 12 | `cc.ach.aura_remarque` | On parle de toi | They Talk About You | Atteins le rang « ON PARLE DE TOI ». | 40 | non | `SAVE.d.aura>=1500` (`AURA_RANKS` l.30156) |
| 13 | `cc.ach.aura_icone` | Icône | Icon | Atteins le rang « ICÔNE ». | 100 | non | `SAVE.d.aura>=500000` |
| 14 | `cc.ach.aura_ciel` | Le ciel t'appartient | The Sky Is Yours | Dernier rang d'aura. | 150 | oui | `SAVE.d.aura>=2500000` |
| 15 | `cc.ach.collection_10` | Garagiste | Garage Owner | Débloque 10 caisses. | 60 | non | boucle sur `carUnlockedVrai(i)` (l.30239), à compter à `carScan()` (l.32398) |
| 16 | `cc.ach.sept_mondes` | Tour du monde | World Tour | Joue les 7 niveaux (nuages → orbite). | 60 | non | `NIVEAUX` (l.20881) ; ensemble des niveaux joués = à créer (`SAVE.d.ex.temps` en tient déjà un par niveau, l.38320) |
| 17 | `cc.ach.contrats_3` | Contrat rempli | Contract Fulfilled | Remplis les 3 objectifs d'un carnet de missions. | 40 | non | `SAVE.d.mis.ok` = `[1,1,1]` (l.38395) |
| 18 | `cc.ach.mort_bete` | Quelle idée | What Were You Thinking | Explose dans les 3 premières secondes d'une partie. | 10 | oui | à créer (durée de run à la mort, `mortCause` existe) |

Total : 10+10+10+40+80+40+80+50+50+70+60+40+100+150+60+60+40+10 = **1000**.

Où brancher : un seul appel `gcCheck()` dans `endGame()` juste après `commitExploits()` (l.42596, appelé depuis l.42654) et un second dans `carScan()` (l.32398) pour les caisses. Les succès « en vol » (4, 5, 9) peuvent se poser à la mort ou au pop de figure ; ne pas appeler le natif à chaque image.

### 1.2 Classements (5)

| id | Nom | Ce qu'on envoie | Donnée du jeu | Où brancher |
|----|-----|-----------------|---------------|-------------|
| `cc.lb.best_run` | Meilleure partie (argent) | entier, décroissant | `SAVE.d.best` (l.42654 : `SAVE.d.best=best`) / `sc=Math.round(money)` | `endGame()` après `lbQualifies(sc)` |
| `cc.lb.aura_run` | Aura d'une partie | entier | `SAVE.d.auraMax` (maj l.38463) ; valeur de la partie = `auraRun` (l.40095) | à la mort, après versement d'aura (l.38463) |
| `cc.lb.aura_total` | Aura à vie | entier | `SAVE.d.aura` | même endroit ; hebdo non nécessaire |
| `cc.lb.chain` | Plus longue chaîne | entier | `runStats.chainMax` / `SAVE.d.ex.chain` | `endGame()` |
| `cc.lb.speed` | Vitesse max (km/h) | entier | `runStats.vmax` / `SAVE.d.ex.kmh` | `endGame()` |

Option : `cc.lb.frenzy` (secondes) alimenté par `SAVE.d.frenRec` (l.30977, `frenFin`).

Points d'attention :
- **Échelle de l'argent** : `eco`/`gamme` (l.38329) changent l'échelle de l'argent entre versions. Un classement mondial sur `best` serait pollué par toute re-balance : préférer l'**aura** (stable, bornée à 1e12 par `san`, l.38406) comme classement phare, et ne pas publier `best` brut sans bornes anti-triche.
- **Triche** : tout est côté client (localStorage + code importable via `SAVE.import`). Classement mondial = triche triviale. Soit on l'accepte (jeu solo), soit on borne (valeurs max plausibles par partie), soit on ne publie que les classements entre amis (section 1.3).
- Les valeurs `Infinity`/gigantesques ont déjà été neutralisées dans `san` (l.38337) : réutiliser ces bornes avant envoi.

### 1.3 Amis, défis, rejouabilité

- **Classements entre amis par défaut** (Game Center filtre « Amis ») : coût nul une fois les classements créés ; c'est le vrai moteur de rejouabilité sans serveur.
- **Défi (Challenges)** : GKChallenge sur `cc.lb.best_run` ou `cc.lb.aura_run` : « Bats mon aura de 12 480 ». Prérequis : classement + 1 écran de fin qui propose « DÉFIER UN AMI » (un bouton `.pb-cyan`, jamais à côté de REJOUER, charte règle 3).
- **Graines partagées** : la piste est générée par `mulberry32` seedé (`genCtrl`/`buildTrack`, voir CLAUDE.md). Un « défi du jour » à graine fixe est donc FAISABLE sans serveur (date → graine) : même piste pour tous, classement du jour. Effort M, très gros gain de rétention.
- **Fantôme** : mentionné dans le backlog du CLAUDE.md (« contre-la-montre + fantôme »), non fait.
- **Écran de succès** : Game Center affiche ses propres bannières ; garder les pop internes (`#popTxt`, `#verdHud`) pour ne pas doubler.

## 2. CE QU'APPLE MET EN AVANT

| Sujet | État actuel (preuve) | Effort | Gain |
|-------|----------------------|--------|------|
| **Haptique** | `hap(p)` (l.38655) : centralisé, 3 classes LIGHT/MEDIUM/HEAVY via `Haptics.impact` (l.38663-38669), repli `navigator.vibrate` (l.38670), respecte l'interrupteur `SND.vib`. Chaque bouton répond par `uiClic`→`hap(8)` (l.38690). Très bon travail d'ossature. **Limite** : seulement `impact` (3 niveaux), pas de motifs continus ; pas de `notification()` (succès/échec) ni `selectionChanged()`. | Capacitor : S. Core Haptics natif (plugin maison, AHAP, intensité/nettete continues liées à `nitroOn`, au drift, à la vitesse) : L | M à L. Le moteur est le « feel » : une texture continue de turbo/frottement est ce qui fait citer un jeu par Apple. **Recommandation** : Capacitor S maintenant (ajouter `notification` sur PARFAIT/mort), Core Haptics L plus tard. |
| **120 Hz ProMotion** | Boucle `requestAnimationFrame` ; cadence mesurée par `CAD` (l.52488-52492 : détecte 144/120/90/75/60 Hz). Le mode 30 i/s est derrière `PAL.b('cadence30',0)` (palier par appareil) : jamais forcé sur les bons téléphones. Mais **dans Capacitor/WKWebView, iOS plafonne à 60 Hz** si `CADisableMinimumFrameDurationOnPhone` n'est pas posé dans `Info.plist` (côté projet iOS, non versionné ici : à vérifier dans `ios/`). Et le commentaire l.52464 montre que le code a été pensé 60/120. | S pour le flag Info.plist ; coût réel = GPU (ombres, nuages, bloom : à 120 Hz les mêmes passes deux fois par seconde) → M pour tenir 120 stable ; un cadran « 60 / 120 » dans RÉGLAGES | M. Seul 120 Hz fluide est visible (jeu de vitesse). Risque : chauffe/batterie, donc option plafonnée par `PAL`. |
| **Sauvegarde iCloud** | `SAVE` (l.38308+) : localStorage + miroir `Preferences` (NSUserDefaults, l.38477-38501) restauré si le localStorage est purgé. **Pas de iCloud** : une réinstallation = OK (UserDefaults non sauvegardés seulement si l'app est supprimée avec « supprimer les données » ; mais un NOUVEL iPhone ne récupère rien sans sauvegarde iCloud de l'appareil). Export manuel par code base64 (`SAVE.export`). | M (plugin `NSUbiquitousKeyValueStore` : ~60 lignes Swift ; limite 1 Mo/1024 clés, le JSON de `SAVE` est petit) ; fusion = `max()` par champ (le code `san` le permet) | M. Évite les pertes à la migration d'iPhone. Alternative sans plugin : la sauvegarde d'appareil iCloud inclut déjà les Preferences si l'utilisateur la garde active. **Préférer KVS à Preferences uniquement pour le multi-appareils.** |
| **Widgets** | Rien. | L (WidgetKit en Swift, app group, lecture de `aura`/`best`/rang/contrat du jour) | S à M : visuel, mais le jeu n'a pas de besoin de retour quotidien tant qu'il n'y a pas de défi du jour. À faire APRÈS le défi du jour. |
| **App Clips** | Rien. | L | S. Un runner en 1 touche s'y prêterait (démo 15 s) mais la taille du jeu (55 k lignes, three.js, audio) dépasse largement les 15 Mo d'un clip. À écarter. |
| **Live Activities** | Rien. | L | Quasi nul : une partie dure 1-2 min. À écarter. |
| **Shortcuts / App Intents** | Rien. | M | S. « Ouvre CASH CAR » suffit ; un intent « mon aura » n'apporte rien sans widget. |
| **VoiceOver** | 241 attributs `aria-*` dans `index.html` (grep), `role="button"` + `aria-label` sur splash/boutons de l'accueil (l.8849-8888) ; mais le jeu en vol est du WebGL sans équivalent texte, et beaucoup de `div` sans rôle. | M (parcours accueil/garage/réglages/mort complets : S ; la course : impossible honnêtement) | M. Apple valorise l'effort ; le menu doit être 100 % navigable, la course annoncera seulement le score à la mort (`aria-live` sur `#verdHud`/écran de fin). |
| **Dynamic Type** | Aucune trace (aucun `font: -apple-system-body`, pas de `text-size-adjust`). La charte impose des corps en variables `:root` et la police pixel Press Start 2P (l.CLAUDE charte). | M (échelle `--k-texte` pilotée par `UIContentSizeCategory` via Capacitor ou `matchMedia`) | M. Mais la police pixel est un choix d'identité ; le faire UNIQUEMENT sur les paragraphes en police système (descriptions). |
| **Daltonisme** | Aucune option. Les grades de pose (PARFAIT or / blanc / rouge) et la réserve nitro (orange/bleu/or) reposent sur la couleur ; les pop portent aussi du TEXTE (« PARFAIT »), ce qui sauve beaucoup. | S/M : palette alternative (`prefers-contrast`/option) sur or/rouge/vert ; ajouter une forme (icône) sur les états nitro | M. Inclusivité = catégorie ADA. |
| **Réduire les animations** | Bien fait : `REDUCED_MOTION` (l.10661) coupe bloom, grain, effets de vitesse (l.235, 49902…) ; ~100 `@media (prefers-reduced-motion)` CSS ; 102 occurrences du flag. Rare dans un jeu 3D. | fait | Point fort à mettre en avant. |
| **Contraste** | Aucun `prefers-contrast` ni `forced-colors`. Neon sur fond sombre = ratio souvent bon, mais textes en `#6b7a8c`/`#8f84c8` (atténués) sont limites. | S | S/M. |
| **Sous-titres** | Voix d'annonceur : le projet est passé en `SANS_VOIX` (plus aucune voix, mémoire du 7/10). Les messages sont déjà textuels. Les sons importants (sirène, nitro vide) n'ont pas d'équivalent visuel garanti. | S | S. Sujet quasi réglé par l'absence de voix. |
| **Commandes** | Volant analogique flottant 2 axes, mode flèches (`SAVE.d.tctl`), sensibilité, mode FACILE coupé par défaut (l.73 `SANS_FACILE`), `volH` poussée haut/bas réglable. Pas de remappage, pas de mode « une main », pas d'AssistiveTouch spécifique. | M | M. Un mode « une main » (nitro auto) serait un vrai plus accessibilité ; FACILE existe déjà et est mis de côté. |
| **Game Controller** | Seule trace : `allow="… gamepad"` sur l'iframe (l.106). Aucun `navigator.getGamepads`. | S/M (API Gamepad dans WKWebView fonctionne sur iOS 14+ ; mapper stick → `TCTL.st`/`TCTL.sv`, A → nitro, ≈ 60 lignes) | M. Très bien vu par Apple sur Apple TV/iPad ; coût faible car tout passe par `keys`/`TCTL`. |
| **Sign in with Apple** | Rien, et inutile : le jeu n'a pas de compte. **Obligatoire seulement** si on ajoute un login tiers. Game Center remplace l'identité. | — | À NE PAS faire. |

## 3. NOTE « APPLE DESIGN AWARDS »

Grille : Innovation, Ingéniosité (technique), Interaction, Plaisir (Delight), Inclusivité, Impact visuel et graphique. Notes honnêtes, plafonnées par ce qu'un juge verrait en 15 minutes.

| Catégorie | Note | Justification |
|-----------|------|---------------|
| **Innovation** | 5/10 | Le concept (runner où l'on roule SUR et SOUS une route suspendue, 2 faces, boucles, figures qui se cashent à l'atterrissage, bank-or-bust) est original. Mais c'est un runner arcade classique dans la boucle de jeu : pas de mécanique inédite côté plateforme (pas de caméra, pas d'IA générative, pas de multi-joueur). |
| **Ingéniosité** | 8/10 | Très solide : tout-en-un `index.html` pour un jeu 3D (three.js r128), nuages maillés, paliers de perf `PAL`, cadence adaptative `CAD` (l.52488), `SAVE` versionnée avec `san()`, miroir natif anti-perte (l.38470-38501), `hap()` unifié, pistes proceduraux seedés, IA de poursuite à armes égales (CLAUDE.md). Point faible : 55 k lignes monolithiques, donc fragilité ; et rien d'exploitant les capacités Apple (pas de Core Haptics, pas de MetalFX, pas d'iCloud). |
| **Interaction** | 6/10 | Charte tactile rigoureuse (tiers inférieur, 44 px, safe areas, haptique+son+visuel sur chaque appui), volant flottant 2 axes, pad, `hap()`. Retranche : pas de manette, pas de AssistiveTouch, haptique limitée à 3 impacts, réglages éclatés. |
| **Plaisir** | 7/10 | Beaucoup de jus : hit-stop, billets volants, échelle de multiplicateurs, dauphin, frénésie, annonceur (aujourd'hui coupé), clics d'interface mélodiques (l.38675 `SON_UI`). Frein : pas de boucle de rétention sociale (pas de défis/Game Center), carrière et mode facile coupés le 14/10 (l.66/73). |
| **Inclusivité** | 4/10 | `prefers-reduced-motion` très bien traité ; langue FR/EN auto (l.19518-19529) ; ~240 aria. Mais : pas de Dynamic Type, pas de daltonisme, pas de contraste élevé, pas de mode une main, pas de VoiceOver sur la course, police pixel sans capitales accentuées (`REGLAGES`), pas de sous-titres normalisés. C'est la catégorie la plus faible et la plus rattrapable. |
| **Impact visuel et graphique** | 8/10 | Direction artistique forte et cohérente (pixel d'arcade + ciel Vice City, biomes, caisses à silhouette unique, garage 3D). Risque : saturation visuelle en pleine vitesse et ADN « néon rose » déjà tranché par Sacha (mémoire : à ne pas décolorer). |

**Moyenne ≈ 6,3/10.** Ce n'est pas un finaliste en l'état ; c'est un très bon jeu mobile indépendant. Les ADA aiment : les capacités de la plateforme poussées (haptique, manette, accessibilité), et un moment signature. Le jeu en a une seule (la route à deux faces).

## 4. LES 10 MANQUES LES PLUS RENTABLES (gain ÷ effort)

1. **Game Center : succès + classements amis (section 1)** — effort M, gain très fort. Brancher un module `GC` (plugin Capacitor `@capacitor-community/game-center` ou plugin maison de 80 lignes Swift) ; appels uniquement dans `endGame()` et `carScan()`. Seul vrai « social » possible sans serveur.
2. **Manette (GameController / API Gamepad)** — effort S/M, gain M à fort. `navigator.getGamepads()` dans `loop` : stick gauche → `TCTL.st`, stick droit Y → `TCTL.sv`, A/RT → nitro, Start → pause. Tout le pilotage passe déjà par `keys`/`TCTL`.
3. **Défi du jour à graine fixe** — effort M, gain fort. Graine = date ; même piste pour tous ; classement `cc.lb.daily`. Le moteur seedé (`mulberry32`) est déjà là. Ne casse pas la génération (`rnd()` séquentiel).
4. **Flag 120 Hz et réglage 60/120** — effort S côté projet iOS (`CADisableMinimumFrameDurationOnPhone`), M pour tenir la perf. Vérifier d'abord dans `ios/` ; `CAD` détecte déjà la cadence.
5. **Accessibilité visuelle : daltonisme + contraste élevé** — effort S/M. Un réglage « Couleurs » dans RÉGLAGES (une seule source, règle charte), icônes/formes en doublon sur nitro orange/bleu/or et verdicts PARFAIT/LOURD ; relever les `#6b7a8c`.
6. **VoiceOver complet du menu et de l'écran de mort** — effort M. `role`/`aria-label` partout, `aria-live` sur le verdict final ; garder la course muette (annoncer le montant à la fin).
7. **Core Haptics (ou au moins `notification()` Capacitor)** — effort S (Capacitor) puis L (natif). Étape 1 : `H.notification({type:'SUCCESS'})` sur PARFAIT/DIVIN et `ERROR` sur la mort ; étape 2 : texture continue nitro/frottement. Le plus gros gain « Interaction ».
8. **Sauvegarde iCloud (NSUbiquitousKeyValueStore)** — effort M, gain M (surtout en cas de nouvel iPhone). Fusion par `max()` ; `san()` garantit la forme. Après Game Center, si le temps manque, repousser.
9. **Dynamic Type sur les textes en police système** — effort M. Un `--k-texte` piloté par la taille système ; ne pas toucher la police pixel (identité). Risque faible, gain d'image.
10. **Mode « une main » / nitro auto** — effort M, gain M (Inclusivité + public jeune). Réutiliser `SANS_FACILE` (l.73) comme base ; c'est déjà codé et coupé : à reformuler en réglage d'accessibilité plutôt qu'en « mode facile ».

À NE PAS faire : Sign in with Apple, App Clip, Live Activity (coût élevé, gain nul pour une partie de 1-2 min).

## 5. Prérequis hors code

- App Store Connect : créer les succès/classements (localisés FR/EN), image 512×512 par succès, ids stables (un id ne se renomme jamais).
- Projet iOS : capability **Game Center**, entitlement iCloud KVS si besoin, clé `CADisableMinimumFrameDurationOnPhone`.
- Respecter la charte : aucun nouveau `backdrop-filter`, un seul bouton primaire par écran, tactile dans le tiers bas, valeurs en variables `:root`, un réglage = un seul endroit (donc un seul interrupteur « Game Center » dans RÉGLAGES, jamais dupliqué dans le panneau de pause).
