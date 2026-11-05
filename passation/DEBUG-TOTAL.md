# DEBUG-TOTAL — passe de débogage ultra approfondie (2026-11-05, Fable/Opus, à la demande de Sacha)

Mission : « une session de debugging ultra approfondi qui servira pour la version mobile, PC et tout, qu'on puisse faire ce qu'on veut
du code sans jamais avoir de problème » — puis : « concentre-toi particulièrement sur le son et les musiques, on a souvent des soucis ».

- Branche `debug-total` (worktree `/Users/sachaberes/cash-car/debug-total`), partie d'`origin/main` ac6cc6cb (v1152).
- Serveur local : `.claude/launch.json` → `cashcar-debug-total` (port 8830, `VERSION PRINCIPALE/`).
- **Fumée du son en une commande** : `node outils/banc-son/fumee-son.mjs [--fois 5] [--course 30] [--url "&colonne=portrait"] [--w 390 --h 844] [--mobile]`
  (Chrome sans fenêtre, son muet mais contexte VIVANT, sauvegarde MUSIQUE+EFFETS+VOIX allumés ; sonde `outils/banc-son/sonde.js`).
  Accueil → JOUER → course → arrière-plan 3 s → retour → mort → REJOUER → course → mort → accueil ; VERT = un seul AudioContext,
  au plus une musique (jamais deux fois le même morceau), liaisons audio stables d'une course à l'autre, 0 erreur console, 0 promesse rejetée.

## Tableau des bugs

| id | zone | symptôme | cause racine | correctif | commit | preuve | plateformes | vrai iPhone ? |
|---|---|---|---|---|---|---|---|---|
| S1 | son / boucle | (possible) caisse figée sans mourir, HUD et caméra arrêtés | `setTargetAtTime` lève sur NaN/Infinity ; les ~50 `stt` par image étaient dans le try de la simulation : une valeur non finie sautait à chaque image HUD, caméra, test de bord, mort. `duckT` empoisonné par un NaN ne revenait jamais (NaN>0 faux) | `stt` refuse le non-fini (une fois en console `[SON]`, `sonPanne`, `dbgSonPannes()`), sons continus dans leur try, `duckT` réparé, `sfx()` sans id inoffensif | c0226d69 | `node passation/preuves/preuve-son-nonfini.cjs <corrigé> <ancien>` → OK (ancien : 2 exceptions / 4) | toutes | non |
| S2 | musique / mort | après une FRÉNÉSIE puis la mort : l'ancien morceau du lobby (`nuit-de-velours/p1.m4a`) joue à volume 1 SOUS le lobby de Pouce bleu, jusqu'au JOUER | pendant que le lobby lié SE CHARGE (phase `charge`), la garde de `musicTick` (`!lobbyActif()`, vraie seulement en phase `lobby`) le croyait absent ; l'`<audio>` gardait l'adresse de la triade → « changement de lieu » → `playMusic(p1)` | garde sur `!lobbyPeut()` (le lobby lié a la main ; le fichier du lieu ne sert que s'il est KO) | voir git log | banc `fumee-son.mjs --frenesie` : ROUGE avant (2 musiques, p1 vol 1), VERT après | toutes (iPhone sans MUS_WA : volume verrouillé, à plein) | non |
| S3 | musique / seconde chance | CONTINUER relance un AUTRE morceau que celui de la course (et le dit « le même ») | le lobby de l'écran de mort (1,4 s après la mort, donc avant la plupart des CONTINUER) tire le morceau suivant et écrase `PB.dernier` ; `PB.depart({meme:true})` prenait `PB.dernier` | `PB.enCourse` posé quand un morceau passe en course (course, transforme, bascule) ; `meme` le reprend ; `pouce-bleu-jeu.js?v=12` | voir git log | trace du lecteur au banc `--chance` (AURA → lobby TONNERRE → reprise TONNERRE) ; `node passation/preuves/preuve-chance-musique.cjs <corrigé> <ancien>` → OK (ancien DEUX → TROIS) | toutes | non |
| S4 | son / déverrouillage | iPhone : après un appel, Siri ou un retour d'arrière-plan, le 1er clic de bouton reste muet et rien ne réarme le réveil | `uiClic` appelait `AC.resume()` en avalant le refus (`.catch` vide), hors du réveil commun `acReveil` (qui compte le refus et réessaie au toucher suivant) | `acReveil(AC).then(ok→clic)` | f28ba83c (index : 66076bfc) | lecture (le banc ne simule pas un refus d'iOS) | iPhone | OUI |
| S5 | son / pause | pause pendant un slide : la voix du slide chante sous la feuille et repart ~0,3 s au REPRENDRE sur l'image gelée ; idem le moteur vivant (`?moteurvivant=1`) ; un NaN vers le worklet du moteur vivant tuait tout le son jusqu'au rechargement | `sldSynth` et `MV` absents de la liste des boucles coupées par `togglePause` ; `MV.drive` sans contrôle des entrées | `sonSlideStop(.02)` + `MV.mute(false)` à la pause ; `MV.drive` assainit | 041c0671 | lecture | toutes | non |
| S6 | musique / frénésie | réseau lent ou `play()` refusé : silence total au déclenchement de la frénésie (Pouce bleu coupé, la triade pas encore là) | `FRENM.sw` vrai dès le changement de source ; Pouce bleu s'effaçait sur ce drapeau, pas sur la lecture réelle | Pouce bleu ne s'efface que quand la triade JOUE (`musicOn`, événement `playing`) | voir git log | lecture + banc `--frenesie` (la triade joue, puis Pouce bleu revient) | toutes, surtout réseau mobile | non |
| G1 | portails | 404 `assets/portail/grotte-glace.webp` à chaque portail vers la grotte glacée (console rouge, pas de carte postale) | la météo GLACE (8f0f2ceb, v939) a inscrit sa carte postale dans `PCUBE_CP` sans que l'image soit jamais tirée | retirée de la liste : `pcubeCle` prend la grotte à une autre heure (à tirer un jour : `carte-postale.py`) | voir git log | vu au banc (404 en console) | toutes | non |

## À vérifier sur un vrai iPhone
(ce que le banc ne simule pas : la session audio d'iOS, le bouton Silencieux, le verrouillage, les interruptions, les écouteurs)
1. **Bouton Silencieux, MUSIQUE allumée** (app ET Safari) : la musique et les effets doivent jouer (session `playback`). Couper MUSIQUE
   dans les réglages, Silencieux toujours enclenché : aujourd'hui (choix d'avant, « rendre la main à la musique du joueur ») la session passe en
   `ambient` → **plus aucun son, effets compris**. À trancher par Sacha (voir « Décisions »).
2. **Appel entrant / Siri / alarme pendant une course** : la partie se met en pause ; au REPRENDRE, effets + musique reviennent (sinon : au 1er
   toucher — c'est S4). Noter si le 1er bouton touché après l'appel est muet.
3. **Verrouiller l'écran en course, déverrouiller** : pause, contexte réveillé au retour, une seule musique ; sur l'accueil, le lobby reprend seul.
4. **Écouteurs filaires / Bluetooth débranchés en course** : iOS met la lecture en pause côté système ; vérifier que la musique revient au toucher.
5. **App tuée en arrière-plan puis relancée** : une seule musique au menu (le lobby), pas de doublon.
6. **Frénésie sur réseau mobile (4G)** : la musique ne doit plus se couper au déclenchement (S6) ; la triade arrive, puis Pouce bleu revient.
7. **Mourir après une frénésie** : une seule musique sur l'écran de mort (S2).
8. **Mourir, attendre 2 s, CONTINUER** : le morceau de la course reprend (S3).
9. **Spotify/Apple Music du joueur** : MUSIQUE allumée → le jeu le coupe (session playback, voulu) ; MUSIQUE coupée → il continue.
Marche à suivre : http://<IP du Mac>:8830/index.html en Wi-Fi (le Mac sert `VERSION PRINCIPALE/` : entrée `cashcar-debug-total`), ou l'app.
En cas de souci : `dbgAudio()` (état du contexte, refus de réveil), `dbgSonPannes()` (pannes de son dites une fois), `dbgPouce()`, `dbgMusique()`.

## Décisions pour Sacha (non changées : ce sont des choix, pas des bugs)
- D-SON-1 : MUSIQUE coupée + Silencieux = tout le jeu muet (session `ambient`). Garder (le jeu se comporte comme un jeu « discret ») ou passer
  en `playback` dès que les EFFETS sont allumés (le jeu sonne toujours, mais coupe le Spotify du joueur) ?
- D-SON-2 : « la musique revient après 24 h » rallume MUSIQUE même si le joueur l'avait coupée exprès (voulu le 14/10) — à chaque absence de 24 h.

## Pièges pour les prochaines modifs

## Journal de session
- 17 h 00 — worktree, banc `outils/banc-son/`. Trois lectures de code (musique/transitions · contexte/volumes · sons continus) rendues.
- Parcours complet au banc : la musique suit accueil (lobby lié de Pouce bleu) → course → arrière-plan (contexte suspendu, pause) → REPRENDRE
  → mort (un autre lobby) → REJOUER → accueil ; un seul AudioContext ; 0 promesse rejetée ; 0 erreur JS.
- FUITE AUDIO : NON. 10 courses enchaînées (`--courses 10`) : nœuds audio vivants après ramasse-miettes 293 → 345-625 selon le morceau, pente
  −1,3 nœud/course ; tas JS +0,8 Mo/course. (Le simple compte de liaisons d'une course à l'autre trompe : il suit le morceau tiré.)
- Hors son, vu au banc : `assets/portail/grotte-glace.webp` en 404 (le portail de la grotte de glace).
