# Les transitions sonores de la partie — session SON, branche `son/transitions` (2026-10-14)

Base : worktree `son/wt/transitions`. Rien n'a été écouté (aucun navigateur) : tout est lu dans le code ; durées des échantillons mesurées
au banc `son/banc/transitions/durees.cjs` (parse des MP3 de `sons-banque.js`), logique du fondu de GLISSE éprouvée par
`son/banc/transitions/jade-fondu.cjs` (les vraies fonctions `jadeMusOn/Veut/Tick` extraites du jeu, horloge simulée). Lignes : chercher par NOM.

## 1. Le départ — JOUER → piqué → course
Ce qui sonne, dans l'ordre : `garage.lacher` (rec, 1,94 s, au lâcher, `garLacherSon`) · le feu du garage monte (`garage.feu`, gain suivi par `GAR.porte`) ·
depuis le CIEL (`chuteLance`) `chute.vent` + vent doux montent avec le piqué, `nuage.entre` à u > ,74 · le lobby s'efface (musicTick mode menu : ×(1 − `GAR.go.t`/1,5), `DEPMUS`)
· `closeGarage`/`chuteSort(ferme)` : `garage.ambiance`, `garage.feu`, `chute.vent` s'éteignent (`stop(.35/.5)`, rampe) et `windG/whG` → 0 (tc ,25) · `start()`/`resetGame()` →
`musicStartRun(true)` : la musique de course entre TOUT DE SUITE en S de 0,6 s (`DEPMUS.f0`) · `fireLaunchBoost` : `depart.logo` (rec, 1,4 s) ; l'élan (`startBoostT`) est sans flamme ni son.
Coupé : tout en rampe (stop avec tc), rien de net. Décision de Léo respectée : aucun son ni délai entre le boost et la musique (rien touché).
Défaut trouvé : aucun nouveau. Seule queue à signaler : `chute.vent` (tc ,5) finit de s'éteindre ~1 s sur le logo — voulu (« le nuage se déchire sur la piste »).

## 2. Le portail
Dans l'ordre : `portail.proche` (amb, 2,12 s) ~2 s avant l'ovule, UNE fois par portail → à l'entrée : `portailPasse` → flash + `portail` (rec, +5 dB, 1,94 s) + `nitro.plein` (t = +0,45 s, après
l'aspiration) → voile `#portV` → 2 rAF plus tard `newTrack` → `musicSuitLieu` : le morceau du lieu entre en fondu 0,6 s (`DEPMUS.f0`). En orbite : `orbite.entre` / `orbite.sort` à l'image du `newTrack`.
Ce qui s'éteint : `espace.ambiance` (`stop(.5)` quand LVL.espace < ,5) et entre à −24 dB, remontée tc ,8 ; vent/sifflet suivent `LVL.espace` ; moteur et nitro continuent (aucune coupure).
Défauts :
- **A. (corrigé)** Entrée au SOLEIL DE JADE : `musicSuitLieu` faisait `stopMusic()` (`pause()` net de la radio) sous le passage, alors que GLISSE entre en fondu — coupure sèche d'un morceau à plein volume
  (masquée par `portail` mais audible comme un « claq » de bande). → la radio cède en 0,3 s (`MUSJ`, dans `musicTick`), GLISSE monte en même temps (tc ,1 s) = un vrai fondu enchaîné.
  iPhone sans musique branchée (volume verrouillé) : coupure comme avant, rien à ramper.
- **B. (corrigé)** Sortie de la jade par un portail : `jadeMusTick` appelait `JMUS.inst.stop()` = `ctx.suspend()` du module, qui GÈLE le contexte sur le son en cours (claquement) pendant que la radio
  du niveau suivant entre en fondu → GLISSE fond maintenant en 0,48 s (voir 3).
- Laissé : en changeant de morceau de radio (nuages → ville), `playMusic` change `el.src` : l'ancien s'arrête net à plein volume, le nouveau monte en 0,6 s depuis le silence. Il n'y a qu'UN
  `<audio>` (règle iOS, voir CLAUDE.md « MÊME lecteur ») donc pas de fondu enchaîné possible ; le `portail` (+5 dB, 1,94 s) et le voile le couvrent. Pas touché.

## 3. La mort
Dans l'ordre, à l'image du crash (`explode`) : `musicStop(true)` (tape-stop ~0,6 s : bande −0,08/55 ms, volume ×,84) · `explosion` (fx, +13 dB, 3,35 s ; `duckT=1` creuse les chaînes continues,
retombée 2,6/s) · `deathSound` (tirage, `deathStop()` d'abord, fondu de 450 ms en fin, `sampleWA` ou `<audio>`) · `mort.<cause>` (0,65-1,22 s) · le moteur → 0 (tc ,05), vent/sifflet → 0 (tc ,08), jet/nitro
(`nOn9` exclut `boom`), `driftChargeSnd`/`raseSnd`/skid : tous gardés par `mode==='drive'` → rampes courtes. +1,8 s `endGame` : sirène, `jrG/jetG/…` → 0 (tc ,12), le reste tc ,2, `DRS/RSN` tc ,05, `nitroooVide`.
`musicStop(true)` redemandé : le premier tape-stop continue (garde `_iv`). +1,4 s `musicMenu` : lobby en montée depuis 0 (≈ 0,4 s). Écran de fin : `mort.enseigne` +80 ms, `ui.debloque` +250,
neuf `ui.compte` (0,22 s) de +360 à +1110 ms, `mort.compteFin` +1110, `ui.record` +810 (1,87 s), `caisse.debloquee` +1750 — tous gardés par `ici()` (écran visible + partie finie).
Défaut trouvé :
- **C. (corrigé)** SOLEIL DE JADE : GLISSE (son propre contexte) ne connaît pas `musicStop` ; `jadeMusVeut` n'était faux qu'à `gameOver`, donc la musique jouait ~1,8 s PAR-DESSUS toute la boule de feu
  puis se coupait net à `endGame` (suspend). → `jadeMusVeut` est faux dès `mode==='boom'` (sauf bac à sable / auto-école, comme la radio) et l'arrêt passe par un fondu.
- Vérifié sans défaut : aucun son continu du monde de la course ne traîne sous l'écran de fin (liste de `endGame` + garde `mode` de la boucle) ; le tape-stop de fin est VOULU (conservé).
- Laissé : les trois sons de la mort (explosion, mort au hasard, `mort.<cause>`) partent dans la même milliseconde — c'est la hiérarchie des niveaux déjà égalisée (autres agents).

## 4. REJOUER / RECOMMENCER / QUITTER
REJOUER : `ecranWipe` (volet `ui.volet`, 0,35 s, le lobby s'efface `DEPMUS.sort`) → `resetGame` : `annStop/deathStop/fxStop`, `busPlein`, `nitroooVide`, `hautVide`, `engBigCoupe`, `musicStartRun(true)`, `fireLaunchBoost`.
RECOMMENCER / QUITTER depuis la pause : `togglePause` a déjà fait `annuleFutur(d9)` + `stopJeu()` avant de suspendre ; `endGame` coupe les chaînes.
Défaut :
- **D. (corrigé)** Les sons CCSON (banque) ne sont pas des `<audio>` : `deathStop()` ne les connaît pas. L'explosion (3,35 s), la fanfare du record (1,87 s), `mort.compteFin`/`caisse.debloquee` (~1 s) finissaient
  PAR-DESSUS le logo / le réacteur du départ si l'on rejouait vite (le volet ne dure que 0,35 s). → `finSonsCoupe()` au début de `resetGame`, UNIQUEMENT si `gameOver` (un REJOUER) :
  `CCSON.annuleFutur(0)` + `CCSON.stop(id)` sur la liste `FIN_SONS` (rampe de 10 ms, jamais net). Les sons du départ qui précèdent `resetGame` (JOUER depuis le garage) ne sont jamais touchés, ni les sons `ui`.
- Les setTimeout de l'écran de fin sont déjà gardés par `ici()` (faux dès que `gameOver` retombe) ; `mCompteSon._k` empêche de rejouer le compte d'une mort sur la suivante.

## 5. La pause et l'arrière-plan
`togglePause` : boucles → 0 (tc ,012, cache `_s9` vidé), `annuleFutur(,42)` + `stopJeu()` (les queues longues ne repartent pas pendant le 3-2-1), `BUSOUT` → 0 en 12 ms de constante après 0,42 s (les clics ⏸ finissent),
`AC.suspend()` à +70 ms+d9, `annStop/fxStop/deathStop`, `musicPause(true)`. Reprise : `busPlein` + `AC.resume()` ; `repriseCompte` (3-2-1, bips `ui.bip`, `ui.go`) puis `togglePause`. Arrière-plan :
`visibilitychange` → pause auto, `AC.suspend()` ; retour : `AC.resume()` si `SND.sfx || musWaTient()`. Musique branchée (`MUS_WA`) ou non : mes correctifs ne touchent que GLISSE et la radio-vers-jade,
jamais le bloc `MUS_WA` / `musWa*` ; le fondu `MUSJ` écrit `musicVolCour` comme le fait déjà `DEPMUS`, que le gain du graphe lit — donc juste dans les deux cas.
Défaut :
- **B bis. (corrigé)** La pause (et l'arrière-plan) sur le SOLEIL DE JADE : même `ctx.suspend()` net de GLISSE → fondu 0,48 s ; une reprise < 0,48 s annule l'arrêt (le volume remonte, pas de redémarrage).
- Laissé : une pause > 0,5 s sur la jade redémarre GLISSE du début à la reprise (l'API du module n'a pas de position ; `start()` remet `step=0`) — le module est à Léo, dans un fichier à lui.

## Récapitulatif des commits (branche `son/transitions`)
1. GLISSE s'éteint en fondu (mort / pause / portail / appli cachée) et dès l'explosion — `jadeMusVeut`, `jadeMusTick`, `JMUS.tS`.
2. REJOUER éteint la queue de la mort d'avant — `finSonsCoupe`, `FIN_SONS`, `resetGame`.
3. Entrée au SOLEIL DE JADE : la radio cède en 0,3 s — `musicSuitLieu`, `musicTick`, `musicStartRun`, `musicStop`, `MUSJ`.
