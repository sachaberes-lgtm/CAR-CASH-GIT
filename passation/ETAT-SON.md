# ÉTAT — SON (14/10, ~20 h 30, PC de Sacha) — passation avant de vider le fil
Lire aussi `passation/SON.md` (passation du Mac : mission, règles, décisions de Léo, tests) — toujours valable.

## OÙ
- Worktree `C:\Users\sacha\Documents\GitHub\CCG-son-integration`, branche `son-integration` (= origin/main après chaque poussée SON).
- Chef : PILOTAGE (messages SEULEMENT « POUSSÉ <sha> » ou blocage). Sous-agents : 3 max, Sonnet/Haiku low-medium, jamais de banc dedans.
- Pousser : fumée AVANT le verrou (`CC_QUI=SON node C:\Users\sacha\cc-banc\fumee.cjs "<worktree>\VERSION PRINCIPALE"`) → `mkdir
  C:\Users\sacha\cc-push.lock` (+ owner.txt) → fetch + merge origin/main → `node passation/preuves/syntaxe.cjs "VERSION PRINCIPALE/index.html"`
  + `sh garde-burnout.sh` + `sh garde-charte.sh` → sw.js cache +1 → `git push origin son-integration:main` → `git archive HEAD | tar -x -C
  "/c/Users/sacha/Downloads/CAR-CASH-GIT-main/CAR-CASH-GIT-main"` → rendre le verrou → « POUSSÉ » à PILOTAGE.
- Banc : `cc-banc\lib.cjs` (file, 2 créneaux, Chrome muet). Crochets : `dbgMusAp()` (+ jade/jmus/jap), `dbgMusRetour(h)`, `dbgSonJoue(id,o)`.
  Mes bancs (scratchpad SON) : banc-musique-iphone, banc-jade-apercu, banc-son-figures(2). La file du banc attend 15 à 35 min le soir.

## FAIT LE 14/10 SUR LE PC (tout est sur main, étape 3 comprise)
- Curseur MUSIQUE : 1,4 s d'aperçu au relâcher (`musApercu`) — radio, ET au SOLEIL DE JADE par GLISSE V2 (`JMUS.ap` ouvre `jadeMusVeut`).
- LA MUSIQUE REVIENT : au lancement / retour d'arrière-plan, visite (`SAVE.d.vu`) à plus de `MUS_RETOUR_H`=24 h ET MUSIQUE coupée ou à 0
  → ON au volume d'usine, une fois par retour ; EFFETS/VOIX intacts ; `musBascule()` = le bouton. Test `?retour=1`, `dbgMusRetour(26)`.
- SON PAR FIGURE : `fig.signe` (12 figures du catalogue, `FIG_SIGNE`) · `fig.monde` (9 figures banquise/eau, `FIG_MONDE`) · combos de
  GENERAL : `sonCombo(cle,neuf)` = 3 `combo.frappe` (T verre, P bois, S tambour, M métal) + `combo.sceau` (pur, mélangé, PST GYROSCOPE,
  MMM CHAOS), figSnd tait le maillon des `fig_combo_*`, `ui.debloque` à t:.6 · `pose.divin` (tchak + chœur + cloches + or).
- ÉTAPE 3 : `fig.battement` (SHIMMY wik g/d par aller-retour, CHANDELLE au sommet ; tic dans figPose via `r.osc`, sans consommer ECH) ·
  `fig.explose` (petite/grosse, dans figCoup et le saut nitro ; le drift garde turbo.*) · `fig.gap` (GAP / DOUBLE GAP) · `pose.nette`
  (pose ordinaire, g===1, pas ratée, pas de gap, vol > 0,35 s). Banque ?v=23. Banc `banc-son-etape3.cjs` : pilote auto qui saute
  (`dbgAuto(true,0,{saut:1.4})`) + `dbgFig('lance',k)` en vol, `window.CCSON.play` enveloppé pour compter les sons joués.
- LE SLIDE (figure de GENERAL, slideTick) : `sonSlide(etat,k)` — 'debut' (fig.slide.debut + boucle fig.slide), 'tick' (gain −14→−3 dB,
  rate ×0,8→1,25 selon k), 'fin' (stop + fig.slide.fin), 'paye' (fig.slide.paye, n = aura). Chien de garde : sans tick 0,35 s, la boucle se
  coupe (pause, appli cachée) ; le tick suivant la relance. Banque ?v=24. Banc `banc-slide.cjs`. Le vrai chemin (dbgSlide('force',kmh)) se
  teste quand le code de GENERAL (boutique-pop) est sur main.
- Avant : sons cuits singe/atchoum/aura, matières de figures v2, banque sans le BOUCLIER, ciel iPhone sans MUS_WA muet, sourdine atelier.
- Bancs : musique iPhone 17/17, jade 7/7 (J7 « KO » = critère trop strict, curseur au pas de 5), sons des figures 7/7, toutes fumées OK.
- RIEN N'A ÉTÉ ÉCOUTÉ : tout est vérifié par cuisson, mesure LUFS et banc. L'oreille de Sacha au banc d'écoute `sons.html`.
- WebKit de Playwright absent du PC : non téléchargé sans l'accord de Sacha.

## À VÉRIFIER SUR UN VRAI IPHONE (rien de ceci ne se simule sur PC)
- Bouton Silencieux : MUSIQUE ON = session 'playback' → la musique joue malgré le Silencieux (règle de toujours) ; coupée = 'ambient'.
- Musique rallumée après 24 h : la session 'playback' coupe le Spotify/Apple Music que le joueur écoutait.
- Vrai verrouillage puis déverrouillage : la musique reprend-elle seule, ou au 1er toucher seulement (musicJoue réessaie) ?
- AudioContext « interrupted » (appel, Siri, alarme) : les effets reviennent-ils au 1er toucher (resume au touchend) ?
- Curseur MUSIQUE sans MUS_WA : volume <audio> verrouillé → curseur sans effet audible, aperçu volontairement muet (VOL_LOCKED).
- Curseur MUSIQUE avec MUS_WA, et au SOLEIL DE JADE : l'aperçu s'entend-il au bon volume, et 0 = silence ?
- Appli tuée en arrière-plan : `SAVE.d.vu` survit-il (miroir Preferences) → retour à 24 h+ = musique ON ?

## SUITE
1. Son par figure : FINI (3 étapes). Restent au maillon : les figures inventées par le joueur (pas de catalogue) — volontaire.
2. À l'oreille : niveau des matières de tour (vol −8 dans figPose) ; figJet et `echSt()` toutes les 0,28 s pendant le tenu.
3. Relire les sons des écrans d'INTERFACE à chaque SHA envoyé (un geste = un son). Idées à PROPOSER : habillages POP / DOGE muets.

## PIÈGES
- Merge en CONFLIT sur sons-banque.js (une autre session a cuit) : `checkout --theirs` puis recuire SES ids
  (`node atelier-son/cuire.js "^(fig\.signe|combo\.|pose\.divin|fig\.monde)"` : un id absent est recuit) ; ?v = celui de main + 1.
- Le banc sert le dossier EN DIRECT : préparer l'étape suivante dans un 2e worktree pendant qu'un banc tourne.
- `//` en milieu de ligne avale la suite → `/* */`. Sous Windows, python écrit en CRLF : `newline='\n'`.
- Banc coupé (timeout, TaskStop) : verrou ET ticket peuvent rester → owner.txt + processus mort vérifiés avant de les rendre.
- Faux verrouillage au banc : `new Event('visibilitychange',{bubbles:true})` — sans bulle, les gestionnaires posés sur window n'entendent rien.
