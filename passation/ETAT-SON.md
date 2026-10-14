# ÉTAT — SON (14/10, ~18 h 30, PC de Sacha) — passation avant de vider le fil
Lire aussi `passation/SON.md` (passation du Mac : mission, règles, décisions de Léo, tests) — toujours valable.

## OÙ
- Worktree `C:\Users\sacha\Documents\GitHub\CCG-son-integration`, branche `son-integration` (= origin/main après chaque poussée SON).
- Chef : PILOTAGE (messages SEULEMENT « POUSSÉ <sha> » ou blocage). Sous-agents : 3 max, Sonnet/Haiku low-medium, jamais de banc dedans.
- Pousser : fumée AVANT le verrou (`CC_QUI=SON node C:\Users\sacha\cc-banc\fumee.cjs "<worktree>\VERSION PRINCIPALE"`) → `mkdir
  C:\Users\sacha\cc-push.lock` (+ owner.txt) → fetch + merge origin/main → `node passation/preuves/syntaxe.cjs "VERSION PRINCIPALE/index.html"`
  + `sh garde-burnout.sh` + `sh garde-charte.sh` → sw.js cache +1 → `git push origin son-integration:main` → `git archive HEAD | tar -x -C
  "/c/Users/sacha/Downloads/CAR-CASH-GIT-main/CAR-CASH-GIT-main"` → rendre le verrou → « POUSSÉ » à PILOTAGE.
- Banc : `C:\Users\sacha\cc-banc\lib.cjs` (file, 2 créneaux, Chrome muet). Crochets : `dbgMusAp()` (+ jade/jmus), `dbgMusRetour(h)`.

## FAIT LE 14/10 SUR LE PC (sur main)
- Curseur MUSIQUE : 1,4 s d'aperçu au relâcher (`musApercu`, bloc `MUSAP`). Sons cuits singe/atchoum/aura + matières de figures v2.
  Banque sans le BOUCLIER. POSE DIVINE une quinte plus haut. Ciel iPhone sans MUS_WA muet ; sourdine de l'atelier (`bqAtelierSourdine`).
- LA MUSIQUE REVIENT (Sacha, 17 h 30) : au lancement et au retour d'arrière-plan, visite (`SAVE.d.vu`, posée au départ en arrière-plan)
  à plus de `MUS_RETOUR_H`=24 h ET MUSIQUE coupée ou à 0 → ON au volume d'usine (`SAVE.def().vol.mus`), une fois par retour. EFFETS et
  VOIX intacts. Bouton MUSIQUE = `musBascule()` (même chemin). Test : `?retour=1` (25 h au lancement) ; `dbgMusRetour(26)` (retour).

## BANC MUSIQUE « iPHONE » (Chromium, UA iPhone, sortie muette, vrai play()) — `banc-musique-iphone.cjs` (scratchpad SON)
- 17/17 OK (14/10 18 h) : lancement après 30 h → MUSIQUE ON à 62 %, EFFETS/VOIX intacts · moteur audio null → running au 1er toucher ·
  verrouillage simulé au menu : la musique se tait, contexte suspendu, déverrouillage : reprise seule + running · MUSIQUE coupée, caché → visible
  quelques s : rien · retour 26 h : rallumée, le menu rejoue sans toucher · curseur 20 % suit, 0 % = silence, EFFETS 80 % inchangés ·
  en course (radio) : verrouillage = pause + musique arrêtée, déverrouillage = reste en pause · curseur en PAUSE : aperçu ~1,4 s puis se
  rendort, à 0 rien · REPRENDRE : la radio repart, running · 0 erreur JS. Carte JADE non tirée ce passage-là (JOUER = carte au hasard).
- WebKit de Playwright : absent du PC, non téléchargé sans l'accord de Sacha (il ne simulerait ni le Silencieux ni le volume verrouillé).
- Trou connu : au SOLEIL DE JADE (musique JMUS), le curseur MUSIQUE en PAUSE ne donne pas d'aperçu (musApercu ne connaît que la radio).

## À VÉRIFIER SUR UN VRAI IPHONE (rien de ceci ne se simule sur PC)
- Bouton Silencieux : MUSIQUE ON = session 'playback' → la musique joue malgré le Silencieux (règle de toujours) ; coupée = 'ambient'.
- Musique rallumée après 24 h : la session 'playback' coupe le Spotify/Apple Music que le joueur écoutait.
- Vrai verrouillage puis déverrouillage : la musique reprend-elle seule, ou au 1er toucher seulement (musicJoue réessaie) ?
- AudioContext « interrupted » (appel, Siri, alarme) : les effets reviennent-ils au 1er toucher (resume au touchend) ?
- Curseur MUSIQUE sans MUS_WA : volume <audio> verrouillé → curseur sans effet audible, aperçu volontairement muet (VOL_LOCKED).
- Curseur MUSIQUE avec MUS_WA : l'aperçu s'entend-il au bon volume, et 0 = silence ?
- Appli tuée en arrière-plan : `SAVE.d.vu` survit-il (miroir Preferences) → retour à 24 h+ = musique ON ?

## SUITE
1. Plus de test demandé à Sacha (14/10 : « fais-le toi-même ») : ce qui exige un iPhone attend un iPhone, liste ci-dessus.
2. À l'oreille : niveau des matières de tour (vol −8 dans figPose) ; figJet et `echSt()` toutes les 0,28 s pendant le tenu.
3. Relire les sons des écrans d'INTERFACE à chaque SHA envoyé (un geste = un son). Idées à PROPOSER : habillages POP / DOGE muets.

## PIÈGES
- `//` en milieu de ligne avale la suite → `/* */`. Sous Windows, python écrit en CRLF : `newline='\n'`.
- Banc coupé (timeout, TaskStop) : verrou ET ticket peuvent rester → owner.txt + processus mort vérifiés avant de les rendre.
- Faux verrouillage au banc : `new Event('visibilitychange',{bubbles:true})` — sans bulle, les gestionnaires posés sur window (pause, flush) n'entendent rien.
