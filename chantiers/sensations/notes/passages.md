# Notes de l'agent `passages` (passe SENSATIONS, 2026-10-14)

⚠ RIEN n'a été essayé en jeu (aucun navigateur) : relu, `verifie.sh passages` = VERIF OK après chaque détail, c'est tout. Les doses sont
à juger au téléphone. Diff = 34 lignes AJOUTÉES, 0 réécrite, 5 commits sur la copie `wt/passages` (base 2baba3c).
Une fonction neuve, `sensPassages(dt)` (juste avant le bloc « LE RAMASSAGE — pickupsTick »), état `SENS_PA` (objet de script, aucune
allocation par image), appelée une fois par image dans la boucle, juste après `sensNitro` (`if(SENS)try{…}catch(e){}`). Elle ne fait
que LIRE `runStats`, `mode`, `hopY`, `started`, `gameOver`, `introD`. ⚠ Cet endroit de la boucle ne tourne que si
`running&&!paused&&!gameOver` (vu : le `try{ if(running&&!paused&&!gameOver&&!BANC_FIGE){` au-dessus).

## Inventaire (ce qui EXISTE déjà — laissé tel quel)
- PIÈCE (`pickupsTick`) : gerbe d'or (8, 14 en frénésie), note de la gamme du combo (`blip` → `piece`, `piece.recolte` toutes les 5),
  `hap(5)` bridé à 70 ms, RÉCOLTE ×n en aura toutes les 5, `coinSerie` (texte + `piece.serie`), « ×3 » en frénésie. Rien dans la tôle ;
  la 5e pièce ne se distinguait pas dans la main. → détail 2.
- FRUIT (= le plein de nitro bleue ; il n'y a pas de « bidon ») : `hap(11)` (pastèque `[20,40,30]`), `fruitCroque` (gerbe de jus, jus sur
  l'objectif, son du fruit, secousse .25 → .55, RAFALE), étincelles, `nitro.plein`, la barre qui prend (`volgNitro` / `nbPrend`). Rien
  dans la tôle. → détail 1.
- CRISTAL DE POUVOIR (`pwrPrend`) : nom, `slam`, son signé, secousse .35, flash, `hap([14,40,24])`, 14 étincelles. Complet : rien ajouté.
- BILLETS (`flyCash`) : visuel de HUD qui vole au compteur + `billet.vole`. Pas un ramassage. Rien ajouté.
- NUAGE (`updateClouds`) : `nuage.entre` / `nuage.sort` / `nuage.defonce`, `shatterCloud`, voile, brouillard, exposition, caméra qui
  tremble à peine (.07-.1 × k), style +3 / +7. Aucune vibration. → détail 5 (la main seulement).
- PORTAIL (`portailPasse`) : flash rose, son `portail`, `shake=.5`, prime, billets volants, phrase, plein de nitro + `nitro.plein`, voile
  `#portV` (0,28 s + 0,5 s), annonce du niveau. Aucune vibration, rien dans la tôle. → détail 3.
- REPLACEMENT (`respawn`) : `sandRevive` / `parkRespawn` / les repêchages lâchent la caisse de 2,2 m (`hopY=2.2`) + flash blanc + son
  `respawn`, et l'intégrateur a déjà donné sa retombée au petit saut (`SCOUP.hop` : nez, poussière, tic). MAIS la touche R et le bouton
  « replacer » du menu de pause appellent `respawn()` nu : la caisse apparaît à plat, figée. → détail 4.
- PREMIER DÉPART (`resetGame` → `fireLaunchBoost`) : logo + halo, 3 s d'ÉLAN — Léo (08/10) l'a voulu « sans flamme, ni son, ni
  traînée ». Laissé (voir Écarté).

## Détails (dans l'ordre des commits)
### 1. Le fruit donne un coup de reins — a958744
- Le joueur roule sur un fruit : la nitro rentre, la caisse S'ASSOIT d'un coup sur son train arrière puis se repose
  (`sensCoup(0, -(.45+.6·pw), -(.3+.35·pw))`, pw = dose du fruit 0 → 1 : nez levé ≈ 1,2° → 2,7°, ≈ 1 → 2,5 cm).
- Où : `pickupsTick`, branche `p.nitro`, juste après le `hap` existant. Pas de vibration ni de son en plus (ils existent).
- Provoquer : rouler sur un fruit au sol (la file de LA LIGNE PARFAITE en aligne un toutes les ~2,4 s). En vol : rien (sensCoup dort).
- Risque : sur la file de fruits le coup revient toutes les 2,4 s — s'il lasse, baisser `.45+.6*pw`. S'additionne à l'accroupi de la
  nitro si elle brûle au même instant (`SCOUP.pv` borné ±4). Coupé sous « Réduire les animations ».
### 2. La récolte se sent dans la main — e5fa9d2
- 5e, 10e, 15e… pièce d'affilée (là où la salve d'aura tombe et où `piece.recolte` sonne) : un tic NET (`sensHap(14,2)`, moyen), DOUBLE
  à partir de la 15e (`[10,28,14]`), et la caisse se soulève d'un rien (`pompe` +.22 → +.43 ≈ 1 → 2 cm, plafonné à la 20e).
- Jamais deux vibrations pour la même pièce : si le tic net a passé le limiteur, le petit `hap(5)` existant de la ligne suivante est
  sauté (on avance son propre horodatage `hap._pc` — c'est le bridage existant, pas une ligne réécrite). Sinon il joue comme avant.
- Provoquer : enfiler une ligne de pièces sans laisser 3 s entre deux ; écouter `piece.recolte`, sentir le pouce.
- Risque : HYPOTHÈSE — toucher `hap._pc` (variable du bridage d'en dessous) est le seul endroit où j'écris un état qui n'est pas à moi ;
  effet : au pire un tic de pièce sauté dans les 70 ms. Sous Capacitor, 14 ms = impact MOYEN : si c'est trop pour une pièce, passer à 12.
### 3. Le portail claque, et on DÉBARQUE — 5d1421a
- À l'instant du passage : `sensHap([22,36,12],3)` (un coup lourd et son écho) — le plus gros passage du jeu n'avait aucune vibration.
  Puis, ½ s de jeu après (le voile s'ouvre), la caisse s'assoit sur ses ressorts (`sensCoup(0,-.8,-.7)` : nez levé ≈ 2°, ≈ 3 cm).
- Où : une ligne dans `portailPasse` après `portalSnd()` (donc APRÈS les sorties des finales et de l'auto-école : rien pour elles) ;
  le coup d'arrivée dans `sensPassages` (voit `runStats.zones` monter). Portail franchi en VOL : la main seule (sensCoup dort).
- Provoquer : franchir un portail au sol ; regarder la caisse quand le voile se lève.
- Risque : HYPOTHÈSE NON VÉRIFIÉE — que le coup d'arrivée soit VISIBLE : le voile (.94) tient 0,28 s réel après la construction puis
  fond en 0,5 s ; la ½ s est comptée en temps de JEU (dt borné pendant le gel de construction), le coup tombe donc en principe pendant
  le fondu, mais sur un téléphone lent il peut partir encore sous le voile (invisible, sans dégât). À régler : `SENS_PA.tp=.5`.
### 4. Au replacement, la caisse se POSE — bd641c9
- Touche R ou bouton « replacer » : au lieu d'apparaître collée à plat, elle s'écrase sur ses ressorts (`sensCoup(0,.5,-1.2)` ≈ 5 cm, nez
  ≈ 1,3°), deux bouffées de poussière aux roues arrière (2 + 2 de la réserve `dust`), `sensHap(10,1)`.
- Où : `respawn` lève un drapeau (`SENS_PA.rs`, rien d'autre) ; `sensPassages` le lit à l'image suivante et ne joue que si : course
  vivante depuis > 1 s (`tr`), au sol, pas de petit saut en cours (`hopY<=0` : les replacements qui LÂCHENT la caisse ont déjà la
  retombée de l'intégrateur), pas le largage d'intro. Une partie neuve (nouvel objet `runStats`) remet `tr` à zéro : ni chargement,
  ni départ, ni rejeu.
- Provoquer : en course, ouvrir le menu de pause → « replacer » (ou R au clavier).
- Risque : HYPOTHÈSE — `start()` (tout premier départ par le garage) appelle `respawn()` sans passer par `resetGame` : `tr` y vaut 0
  parce que la boucle n'a encore jamais tourné en course ; si `start()` pouvait être rappelée après une partie sans `resetGame`, la
  caisse se poserait une fois au départ (sans gravité). Non vérifié.
### 5. La ouate dans la main — ccf4145
- Entrer dans un nuage : un « pouf » léger (`sensHap(9,1)`) ; DÉFONCER un banc au sol : un coup plus rond (`[14,22,10]`, force 2).
  Une fois, à l'entrée ; rien à la sortie ; rien au menu ni en pause.
- Où : `updateClouds`, bloc `if(!c.wasIn)`, après la ligne de la défonce (`c.brokenT===4.5` = il vient d'éclater).
- Provoquer : niveau des nuages, traverser un banc en vol ; au sol, foncer dans un banc posé sur la route.
- Risque : DÉCISION DE SACHA À RESPECTER (30/09 : « les nuages doivent juste bloquer la vue, rien d'autre ») — j'ai lu « rien d'autre »
  comme « aucun effet de JEU », et le son d'entrée a été gardé ; une vibration est du même ordre, mais c'est à lui de trancher : la
  ligne s'enlève seule. Dans une mer de nuages traversée en vol, le limiteur (70 / 220 ms) évite le bourdon.

## Écarté
- Faire frémir / « respirer » la CARROSSERIE dans un nuage : c'est exactement ce que Sacha a fait retirer (« au sol plus de tangage »).
- Un tic qui monte à CHAQUE pièce : le `hap(5)` bridé existe et a été réglé pour ne pas bourdonner ; seule la récolte est marquée.
- Quoi que ce soit de plus sur le cristal de pouvoir : il a déjà tout (son, flash, secousse, vibration, étincelles).
- Le tout premier départ : l'élan de Léo est voulu nu, et le lâcher du garage est à lui — aucune cérémonie ajoutée.
- Particules au portail ou à l'arrivée : flash, voile et billets volants occupent déjà l'écran ; loi « pas de voile ».
- Un coup de tôle AU passage du portail : invisible sous le voile ; déplacé à l'arrivée (détail 3).
- Une vibration à la SÉRIE COMPLÈTE (`coinSerie`) : elle tombe sur une pièce, souvent sur une récolte — une de trop.

## Sons à faire
- Aucun : chaque passage a déjà le sien (`portail`, `respawn`, `nuage.*`, `piece.recolte`, `nitro.plein`).
