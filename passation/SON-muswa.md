# La musique iPhone par WebAudio (MUS_WA) — session SON, 2026-10-14

Branche `son/muswa` (worktree `son/wt/muswa`), fichier `VERSION PRINCIPALE/index.html`.

## Pourquoi
Sur iPhone, `HTMLAudioElement.volume` est en lecture seule (`VOL_LOCKED`). La musique (UN `<audio>`, `musicEl`) y sortait donc à 100 %
de son fichier partout : au ciel (Léo la veut à 15 %), au garage, en course, sous l'annonceur. Le curseur MUSIQUE, les fondus et la table
de sonie `MUS_SONIE` n'y faisaient rien. Brancher l'élément dans le graphe WebAudio (`createMediaElementSource` → un gain) rend tout ce
mixage à l'iPhone.

## Quand c'est allumé (décision du 14/10 au matin, Sacha via PILOTAGE : « le curseur MUSIQUE doit marcher sur iPhone »)
`MUS_WA.on` est vrai seulement si **les trois** :
1. le volume d'un `<audio>` est verrouillé (`SON_VOL_VERROU`, la même sonde que `VOL_LOCKED`) — donc iPhone/iPad ;
2. l'interrupteur est allumé : `MUS_WA_ON='auto'` dans le code = allumé **si `navigator.audioSession` existe** (iOS 17+ : `musicSession`
   y pose `type='playback'`, le bouton silencieux ne coupe plus le WebAudio). Forçages : `?muswa=1` / `?muswa=0` dans l'adresse, ou
   `localStorage.cc_muswa='1'` / `'0'` (prioritaire sur le code ; l'URL passe devant le localStorage). Le forçage ne passe jamais outre
   le volume verrouillé ;
3. pas condamné (`localStorage.cc_muswa_ko` absent) et l'analyseur sait lire des flottants (sinon pas de chien de garde → pas d'essai).

Partout ailleurs (ordi, Android, iOS < 17) : éteint, chemin `<audio>` d'avant au bit près (chaque ligne neuve est gardée par
`musWaTient()` = « branché », faux tant que rien n'est branché ; `sfxVol` aussi).

## Ce qui est fait, où (repères par nom)
- **Bloc `MUS_WA`** (juste après `let musicVoulue…`, en tête de « LA MUSIQUE v4 ») : `MUS_WA`, `musWaTient`, `musWaReveil`, `musWaSon`,
  `musWaBranche`, `musWaCondamne`, `musWaGarde`, `window.dbgMusWa`.
- **Branchement** (une fois, DANS UN GESTE) : à la fin du bus de `initAudio` (le geste qui crée le contexte, avant que le morceau ne
  s'entende) et, à défaut, dans `musicDeverrouille` (chaque toucher). `musicSession()` est posé AVANT (playback). Graphe :
  `src → MUS_WA.g (gain) → MUS_WA.cmp (compresseur doux) → MUS_WA.e (.937) → MASTER._lim (limiteur −1 dBFS)` ; `src → MUS_WA.an`
  (analyseur, sans sortie). ⚠ Elle rejoint le limiteur **à côté** de `MASTER._limIn` (même compensation .937) : c'est `_limIn` que le
  bouton SON ferme. Jamais `MASTER._vol` (le curseur EFFETS).
- **Compresseur doux** (`MUS_WA.cmpOn`, allumé) : −24 dB, 2,5:1, genou 10, 20 ms / 0,4 s, rattrapage automatique gardé (+6,9 dB) : sous
  −24 dBFS (les creux) +6,9 dB, enveloppe pleine (~−8 dBFS) à l'unité, crêtes −2 à −4,6 dB ; sortie jamais au-dessus de −4,6 dBFS en régime.
  Calcul : `son/banc/muswa/compresseur.cjs` (le noyau Chrome/WebKit recopié).
- **Volume** : `musicTick` → `stt(MUS_WA.g.gain, musicVolCour borné 0-1,41)` au lieu de `el.volume`. 1,41 = +3 dB, le haut de la table de
  sonie (à l'ordi `el.volume` plafonne à 1 et l'écrête : une limite de l'élément, pas une intention). `musicJoue` pose le gain AVANT de jouer
  (un fondu d'entrée part de 0) ; le tape-stop de `musicStop` passe aussi par le gain ; ciel (`MUS_CIEL`), garage, course, DEPMUS, ducking
  de l'annonceur suivent tout seuls (ils passent par `musicVolCour`). Boutique (`tait9`) : comme à l'ordi, un fondu puis la pause.
- **Effets** : `sfxVol` reprend le −3 dB de `SFX_SOUS_MUS` quand la musique est branchée (le plein sur iPhone n'existait que parce que la
  musique ne pouvait pas baisser) ; `volApply()` le repose au branchement et à la condamnation.
- **Bouton SON** (`sndRefresh`) : branché, il ne suspend plus le contexte, `musWaSon` ferme `MASTER._limIn` (effets + voix du graphe, comme
  le faisait la suspension). Pause, arrière-plan, pubs : la musique est déjà en pause (élément), la suspension reste ; la REPRISE réveille le
  contexte même SON coupé (`togglePause`, `visibilitychange`, `audioKick`, `pkMuet`, `pkSilence`, le g9 des portails : `(SND.sfx||musWaTient())`)
  et `musicJoue` réveille le contexte avant `play()`.
- **Contexte « interrupted » / « suspended » alors que la musique est voulue** (appel, Siri, alarme) : relancé au prochain toucher par
  `musicDeverrouille` → `musWaReveil` (avant de relancer l'élément) et par `audioKick` (touchstart/touchend). Le chien de garde ne compte
  pas ce temps-là (il exige un contexte `running`) : il attend la relance, il ne condamne pas.
- **Chien de garde** (`musWaGarde`, depuis `musicTick`, 2×/s au plus, tampon `Float32Array` créé une fois) : élément qui joue (ni pause ni
  muet, `currentTime` qui avance), page visible, contexte `running`, volume voulu > .05, et un zéro EXACT (rms < 1e-7) dans l'analyseur
  pendant 2,5 s — remis à zéro à chaque vrai son (les silences de tête ne s'additionnent pas) → `localStorage.cc_muswa_ko='1'`, tout est
  débranché, `_limIn` rouvert (et le contexte re-suspendu si SON est coupé), l'élément capturé quitte la page, un neuf le remplace au même
  endroit du morceau (`src`, `currentTime`, `loop`) : il repart tout de suite si iOS veut bien, sinon au prochain toucher. L'analyseur est
  posé AVANT le gain (on juge l'élément, pas le curseur — pas de fausse alerte quand le gain monte depuis 0).
- **Bonus — le décor bat sur la musique** : `musicAna` = l'analyseur de MUS_WA (`MUS_WA.rythme`), là où iPhone n'a pas `captureStream`.
  Condamnée, la musique rend la main au métronome.
- **Console** : `dbgMusWa()` (on, forcé, session, ko + raison, branché, gain, voulu, rms, muet, entendu, contexte, limIn, élément, rythme) ;
  `dbgMusWa('raz')` efface la condamnation (au prochain lancement).
- **Bancs** : `son/banc/muswa/compresseur.cjs`, `son/banc/muswa/garde.cjs` (le bloc du jeu exécuté avec des bouchons : ordi, iOS < 17,
  forcé, iOS 17, `cc_muswa=0`, déjà condamné, muet, SON coupé — vérifié).

## LE PROTOCOLE D'ESSAI (Sacha / session APP STORE)
Sur iOS 17+ c'est allumé d'office. Pour l'éteindre ou le forcer dans l'appli sans recompiler : console Safari (Mac → Développement →
iPhone → la WebView) `localStorage.cc_muswa='0'` (éteint) ou `'1'` (forcé), puis relancer l'appli. Dans Safari : `…/jouer/?muswa=0|1`.
Vérifier d'abord : `dbgMusWa()` → `on:true`, `branche:true` après le 1er toucher, `entendu:true` une fois la musique lancée, `ctx:'running'`.

À vérifier, dans l'ordre (noter OK / KO + `dbgMusWa()` si KO) :
1. Musique audible, **bouton silencieux ACTIVÉ** puis **désactivé** (accueil, garage, course).
2. **Curseur MUSIQUE** : il baisse/monte vraiment (0 = silence) ; EFFETS indépendant.
3. **Ciel** (écran titre) : musique très légère (~15 % du garage), qui respire avec le vent ; garage → elle remonte en fondu.
4. **Boutique** : la musique s'efface en fondu puis s'arrête ; retour garage → elle revient en fondu.
5. **SON coupé, MUSIQUE allumée** : plus aucun effet ni voix, la musique continue (menu ET course). Rallumer SON : les effets reviennent.
6. **Pause / reprise** : musique en pause dans le panneau, repart au 3-2-1 (avec SON coupé aussi).
7. **Appel ou Siri** qui interrompt : au retour, un toucher → musique et effets reviennent.
8. **Arrière-plan / retour** (accueil, puis en course) : rien ne joue écran verrouillé ; au retour la musique reprend (menu) / la pause s'ouvre (course).
9. **Écouteurs Bluetooth** : branchés/débranchés en cours de musique (iOS met la lecture en pause au débranchement : un toucher la relance).
10. **Frénésie** : la musique s'emballe (ou le morceau de la triade tombe) et revient.
11. **Fin de partie** : tape-stop (la bande ralentit ET baisse) ; **REJOUER** : la musique repart en fondu, pas au niveau d'avant.
12. Le niveau d'ensemble : musique sous les effets comme à l'ordi (les effets ont repris leur −3 dB) ; pas de saturation.

**Revenir en arrière** : `localStorage.cc_muswa='0'` puis relancer (ou `?muswa=0`). Si le chien de garde a condamné : `cc_muswa_ko='1'`
est posé, plus jamais d'essai sur cet appareil → `dbgMusWa('raz')` (ou `delete localStorage.cc_muswa_ko`) pour réessayer.
Pour couper pour tout le monde : `MUS_WA_ON=false` dans le code.

## Risques restants (non mesurables ici : pas de navigateur, pas d'iPhone)
- Le chien de garde voit un graphe MUET (contexte qui ne reçoit rien : élément capturé qui ne sort rien, source refusée), pas une coupure
  du système APRÈS le graphe (catégorie audio) — c'est pour ça que l'auto-allumage exige `navigator.audioSession` (iOS 17+).
- `navigator.audioSession.type` revient à 'ambient' quand MUSIQUE est coupée : les effets suivent alors le bouton silencieux (comme avant).
- Au branchement en cours de lecture (cas où le contexte naît après le début du morceau), un saut de niveau unique : du plein fichier au mixage.
- Plus de calcul SON coupé (le contexte tourne pour la musique, les effets sont fermés en sortie, pas arrêtés).
- Le compresseur rend les creux plus présents (+ jusqu'à 6,9 dB) : à juger à l'oreille (`MUS_WA.cmpOn=false` pour comparer en console avant
  le 1er toucher).
