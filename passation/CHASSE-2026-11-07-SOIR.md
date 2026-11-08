# CHASSE AUX BUGS du 2026-11-07 (soir) — « balade-toi dans tout le code et cherche un maximum de petits détails »

Huit agents de lecture (interface, économie/sauvegarde, gameplay/boucle, HTML/CSS/moteur, son, rendu/maps, traductions, banc headless) ont relu
le code morceau par morceau ; chaque trouvaille a été VÉRIFIÉE dans le code avant correction. Corrections appliquées par script de remplacement
exact (pas l'outil Edit : CRLF), réassemblage `--depuis-morceaux`, `node --check` du script, gardes (allègement, charte, démarrage), banc des
écrans et banc de course en Chrome headless. Cache `cashcar-v1176`.

## Corrigé (dans ce commit)

### Économie, sauvegarde, missions
- **COLLECTE TOUTES LES COULEURS réussie d'office** (50 k$ offerts à tout nouveau joueur) : toutes les peintures sont en € depuis le nuancier v3, le lot « toutes » se réduisait à D'ORIGINE. Les peintures à DÉFI entrent dans le lot (`missions/defis-moteur.js`, m2Col).
- **Peintures GAGNÉES effacées à chaque rechargement** : `m2.c.pg`, `pgv` et `pv` n'étaient pas recopiés par `san` (`sauvegarde.js`). Les lignes « RÉUSSIE » et le compte de l'écran MISSIONS tiennent maintenant.
- **TOUTES LES TRAÎNÉES / TOUS LES OBJETS impossibles** (l'ARC-EN-CIEL du pack chat comptait dans le lot) : un objet de pack est hors du lot (m2HabReco).
- **LA SILENCIEUSE retirée sans remboursement** : une retirée devenue récompense de mission garde son prix dans `.av` ; `san` le lit.
- **Bon / jeton gagné au plafond perdu en silence** : la machine ne tire plus un tiroir plein (3 bons, 9 jetons) ; plus de jeton posé sur la route à 9.
- **Gros lot fêté pour un simple bon** : `gros=R.i===2` (le GROS SAC seul).
- **Relèvement ×1,5 du début éteint par une caisse GAGNÉE** : seule une caisse à vendre (`u.p>0`) compte comme achat (ecoDebutAchat).
- **Code importé bidon = 33 M$ de remboursements** : `import()` filtre les retirées de `owned`.
- **FORTUNE MAX sous le solde après remboursement** : bankMax suit.
- **Caisse en € au garage : cadenas sans texte** : « EN BOUTIQUE — 1,61 € ».
- **figAchete sans garde `p>0`** (banque à NaN possible).

### Interface
- **La fiche de la caisse (#gCard) répondait DEUX fois** (deux clics, deux vibrations, la note de la pentatonique qui saute) : l'ancien écouteur ne vit plus que sous `?gcard=ancien`.
- **Rayon AILES au clavier : une flèche avançait de deux ailes** (molette ≠ fiche) : `garageGo` ne feuillette plus quand la salle blanche est ouverte.
- **L'ŒIL jouait le son à l'envers** (« on » en éteignant).
- **La puce ANNULER des figures survivait au changement d'écran** (flottait sur le départ de course) : `fsCache()` dans closeGarage et garMode ; `fsAnnule` refuse hors atelier.
- **ACHETER refusé = trois vibrations** : le relais de la console ne secoue plus deux fois.
- **Rayon TRAÎNÉES : le filtre de famille restait d'une visite à l'autre** : repart de TOUT.
- **COPIER MA SAUVEGARDE : deux clics rapides figeaient « COPIE ! »** (btnFlash).
- **Ligne « Devise · $ » des réglages PC** : bouton mort, cachée.
- **Pastilles de geste de l'inventaire à 31 px** : ≈ 44 × 36 px.
- **100vh → 100dvh** (Safari sur le site : barre d'adresse) sur l'inventaire couché, la plaque, l'écran de mort (@supports).
- **Ids dupliqués** `gTop/gCard/gBottom` de l'étal des fruits (#stall, jamais ouvert) → `stTop/stCard/stBottom`.

### Gameplay
- **Pendant l'explosion** : PLEINE ne fait plus « ding », la nitro ne se consomme plus (pouce resté posé), les POUVOIRS meurent avec la caisse (plus de tic-tac « bientôt fini » ni de plaque qui décompte sur l'écran de mort).
- **Seconde chance : un PLEIN de nitro** au lieu de « de quoi voler » (startBoostT forçait 100 %).
- **SANS FAUTE survivait à la mort** (seconde chance).
- **−PSYCHO après un replacement par le bouclier**.
- **resetGame oubliait comboT, padCd, chipT** (la plaque du départ bloquée 1,5 s).
- **Pluie sur la caisse : rafale à 140 m/s à chaque téléportation**.
- **Aimant : la pièce sautait d'un coup à 30 i/s** (lisse60).
- **L'averse de la pluie d'argent continuait sur l'écran de mort** (priorité des opérateurs).
- **ROULE OU CRÈVE réécrivait le DOM 60 fois par seconde** (au dixième seulement).
- **Éclairs de turbo / pose qui coupaient l'éclair de la mort**.
- **Pomme dorée : 4 ShaderMaterial neufs par pomme, jamais libérés** (cache par genre × couche).

### Moteur, HTML, CSS
- **L'intro « boule » ne pouvait pas être passée tant que `load` n'arrivait pas** (réseau lent : planète qui tourne, pas de TOUCHE, taps ignorés) : plafond à 9 s.
- **En PAUSE, la scène 3D était redessinée à pleine cadence** derrière la feuille (téléphone qui chauffe) : le saut d'images de l'écran de mort couvre la pause.
- **Le `touchmove` global empêchait de faire défiler** la fiche d'achat (#shPop), la BOÎTE NOIRE (#ccBoite), l'écran de crash et la pub.
- **sw.js téléchargeait la page deux fois** à chaque version (`./` + `./index.html`).
- **finir() de l'intro retirait un écouteur jamais posé** (remesureGroupee restait branchée).

### Rendu
- **Traînée POP prise au garage bâtie à la 1re NITRO en course** (planche 1 024², 2 programmes, 3 800 cubes) : préparée hors course comme la WOW (buildcar.js).
- **HALO.hM / HALO.tM (phares, feux) libérées sous les sprites de la caisse neuve** dès la 3e reconstruction : marquées partagées.
- **padGeo / oilGeo partagées libérées à chaque portail** (piste-prebati).
- **Traces de pneus : 900 quads dégénérés dessinés à chaque image** une fois vides : mesh invisible quand vide.
- **Planche des traînées POP (4 Mo) jamais rendue sur téléphone** : texLibere.
- **resize effaçait le jus et le voile** sans changement de taille (clavier iOS).
- **bioLerp : clé absente → NaN (ciel noir)** : garde.

### Son
- **En PAUSE, chaque clic du panneau relançait la musique de course par rafales de 0,5 s** (Pouce bleu hors de BUSOUT) : niveau 0 tant que `paused`.
- **Ordinateur : QUITTER / RECOMMENCER passaient par togglePause** (« GO ! », musique relancée puis étranglée) : même recette que le mobile (14/10).
- **Seconde chance : « le même morceau » était celui du LOBBY** lancé 1,4 s après la mort (pouce-bleu-jeu.js : `course9`).
- **Effets −4,7 dB « sous la musique » même MUSIQUE coupée** ; la bascule MUSIQUE ré-applique le volume.
- **playMusic : la remise au début accrochée au `else` du bus** (le même morceau ne revenait plus au début avec le graphe).
- **musicAnalyse rebranchait un flux de capture sur l'analyseur du graphe** à chaque `playing` (spectre doublé).
- **deathPreload téléchargeait une 2e fois les sons de mort** déjà décodés.

### Textes
- **Bannière de niveau en anglais** : LES PROFONDEURS, TORCHES, CRISTAUX, NOIR COMPLET, GLACE, les promesses de la grotte, du glacier et des dunes restaient en français ; messages AIMANT / AURA ×2 ; causes de mort des dunes.
- **« : » et « ! » à la française dans l'anglais** (CAISSE : , COMPTE : , SE DÉBLOQUE : , OU GAGNE-LA : , QUITTE LE GARAGE : , MELON !).
- **`fmt()` écrivait « $ 12,500 »** en anglais (record, −$ du garage) : même règle que fmtSolde.
- **« MEGA BUMP x4 » → « × »**.

### Banc headless (exceptions réelles, 27 chargements, 10 maps, tel + PC)
- **« Cannot access M2_METEO_MIN before initialization » à CHAQUE chargement** (console.warn « missions v2 : migration ») : la constante vivait dans `missions/defis-moteur.js` (morceau 209) et la migration lancée par `sauvegarde.js` (morceau 200) la lisait avant sa déclaration → la migration des missions s'arrêtait à la 35e mission (`meteo`) et se marquait faite. Déclarée dans `missions/table.js` à côté de `M2_RECO` (même piège que M2_COLK le 16/10).
- **404 `assets/portail/grotte-glace.webp`** : la carte postale n'existe pas (grotte-matin/midi/nuit/soir seulement) ; retirée de `PCUBE_CP` (`rendu/portails.js`) : la fenêtre du portail prend le repli sans 404. À tirer un jour avec l'outil carte-postale.
- **JADE : erreurs WebGL à chaque goutte d'eau** (`bufferSubData: srcOffset + length too large` ×400 par course, puis `Vertex buffer is not big enough`) : la teinte des gouttes (`maps/jade-eau.js`, eauPIm) était allouée par `setColorAt` APRÈS `count=0` — three r128 alloue `3 × count`, donc un tampon VIDE ; les gouttes n'ont jamais eu leurs teintes. Alloué à la capacité (EAUP.max × 3) ; `imEnvoi` (`jade-3.js`) refuse un tampon de teinte trop court.
- **Canvas2D « willReadFrequently »** : la gomme du burn-out (`interface/burn-out-1.js`, burnGommeInit) relit son canvas à chaque image.
- Aucune exception JS non capturée, aucune promesse rejetée : accueil / réglages / achat / garage / inventaire / boutique / missions / profil / plaque, une course + REJOUER sur les 10 maps du tirage, pause / réglages / mort en pause / visibilité. Mémoire : géométries et programmes stables de course en course (pas de fuite), textures +1 par map nouvelle (cartes postales), tas JS 300-460 Mo (Jade jusqu'à 760 Mo sur PC).

### Garde
- `garde-allege.sh` : quota de 2 `IS_MOBILE` pour `code/interface/garage-menu-inventaire.js` (deux lignes de RÉGLAGES cachées selon le cadre — de l'interface, pas de l'image ; la garde refusait la publication de l'arbre du jour).

## Relevé, PAS corrigé (à trancher avec Sacha, ou plus gros qu'un détail)
- **Avertissement ANGLE en rafale à l'écran de mort** (`READ-usage buffer was written, then fenced…`, `engLit` de `interface/vignette-moteur.js`, 20-30 fois/s) : probablement propre au GPU logiciel, mais il épuise le quota de 256 messages WebGL de Chrome et cache les erreurs suivantes. À regarder sur vrai iPhone.
- **sw.js `skipWaiting` + purge du cache** sous une partie en cours : un joueur en course peut perdre un ciel / une texture renommée par la nouvelle version (404 en pleine course). Décision : ne plus `skipWaiting`, ou garder l'ancien cache tant qu'un client ancien vit.
- **Manifeste sans icône `maskable`** (Android : icône rétrécie dans un disque blanc) — il faut un PNG 512 avec 20 % de marge.
- **AIR MAX qui expire en vol remet `fallT` à 0** (fenêtre de pose fermée 0,35 s, verdict faussé) — changement de sensation, à jouer avant.
- **Le double-tap pendant une figure de route est refusé en silence** (pas de « tchk ») — choix de design.
- **Trois sons de gain dans la même image sur une pose-raccourci** ; **un slide payé joue deux sons** (si `sonSlide('paye')` existe dans la banque).
- **Lissages encore « par image »** (crabe du power-slide, tangage, rails du départ) : à passer en `lisse60` si Sacha veut la même sensation à 30 i/s.
- **« La tonalité suit la musique » ne suit pas Pouce bleu** en course : il faut une table des tonalités des 19 morceaux.
- **Le contexte audio ne s'endort plus jamais** (SON et MUSIQUE coupés) : batterie, modeste.
- **3-2-1 de REPRENDRE** : Pouce bleu joue pendant le compte, la musique <audio> non — à trancher (avec la correction « niveau 0 en pause », Pouce bleu attend lui aussi la fin de la pause).
- **Débris de tôle** : une géométrie + une matière neuves par éclat à chaque impact (réserve à faire).
- **`.mChev` anime `color`** (non composité) sur tous les JOUER des menus ; **`IS_MOBILE` dans palier-appareil.js** (équivalent à TEL_NATIF, toléré par quota).
- **Textes morts** : panneau RÉGLAGES de l'ancien overlay (#settings) à moitié en français ; fenêtre « PREMIERE FOIS ICI ? » (désactivée) ; ~296 clés I18N jamais citées (liste dans le scratchpad de la session, section « CLÉS MORTES »).
- **Boutique du jour à minuit UTC**, série et défi du jour à minuit local : deux « jours » dans le même jeu (documenté comme volontaire).
- **Mission cash qui nourrit « ACCUMULE 100 000 $ »** ; **COLLECTE 5 VOITURES démarre à 1 / 5** (LA HONTE comptée) ; **LE LOUP à 50 M$** (prix provisoire).
- Rapports complets des huit agents : scratchpad de la session (`rapports/*.md`) — à recopier ici si Sacha le veut.
