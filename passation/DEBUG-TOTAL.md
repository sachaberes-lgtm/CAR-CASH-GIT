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

| G2 | sauvegarde / import | site, deux onglets : « RESTAURÉ — RECHARGE… » s'affiche, la page recharge… et l'ancienne sauvegarde revient | `SAVE.import` passait par `flush()`, neutralisé dans un onglet devenu passif (`ONGLET.passif`) ou pendant la restauration du miroir natif | l'import écrit lui-même (localStorage + miroir natif) et ne rend vrai que s'il a écrit | voir git log | `node passation/preuves/preuve-import-onglet.cjs code <ancien code/>` → OK (ancien : dit vrai, banque restée à 5) | web | non |
| G3 | sauvegarde / habillages | un id « constructor » / « toString » (code importé trafiqué, stockage rongé) devenait une FONCTION dans la boutique | `PEINT_FUSION[x]` lisait le prototype d'objet | lecture par `hasOwnProperty` | voir git log | même preuve (cas 2) | toutes | non |
| G4 | preuves | `preuve-sauvegarde`, `preuve-miroir-illisible`, `preuve-import-pause` plantaient (« PEINT_FUSION / ALLEGE is not defined ») : plus aucun filet sur SAVE | le bloc SAVE lit `PEINT_FUSION` et `ALLEGE` depuis le nuancier v3 ; la section H testait la règle d'avant le jury (D6) | extraits / bouchonnés ; section H à la règle du 05/11 (`?demo=1`) | voir git log | les trois → PREUVE OK | — | — |
| G5 | rendu / contexte 3D | iPhone à mémoire graphique saturée : contexte perdu puis rendu à chaque relance = rechargement sans fin | les chemins « contexte rendu » et « retour d'arrière-plan » rechargeaient sans lire le compteur `ccCtxPerdu` (seul le filet des 5 s le lisait) | `ctxRecharge()` pour les trois chemins : 4e perte de la session → écran RELANCER ; et `resize`/`reflow` ignorent une fenêtre de 0 px | 81c6ca20 | lecture (une perte GPU répétée ne se simule pas au banc) | iPhone surtout | OUI |
| S7 | son / sons à la demande | (arrivé de main v1176-1177) le SLIDE ou les rouleaux du FINAL SPIN, joués avant que leur son soit décodé, partaient ~100 ms plus tard SANS poignée : la boucle tournait jusqu'à ce qu'un autre son du même nom la remplace | `play()` mettait la boucle en attente et la jouait en retard ; l'appelant avait déjà reçu `null` | pas de départ en retard pour une boucle (le décodage est lancé ; le tick suivant la trouve prête, avec sa poignée) ; `sfx.js?v=10` | voir git log | `node passation/preuves/preuve-boucle-tardive.cjs <sfx.js> <ancien>` → OK (ancien : 1 boucle orpheline) | toutes | non |

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
### Son et musique
- **Qui joue la musique ?** En course ET au menu : `POUCE_JEU` (assets/audio/pouce-bleu-jeu.js, WebAudio pur ; au menu = le « lobby lié »).
  L'`<audio>` `musicEl` ne sert plus qu'à la TRIADE de la frénésie et aux replis (lobby KO, `?lecon=musique`, `?lobby=ancien`). Tout nouveau
  `playMusic(…)`/`musicJoue()` doit d'abord demander `lobbyPeut()` (menu) ou `pbjRegne()` (course) — sinon deux musiques (S2).
- **`lobbyActif()` ≠ `lobbyPeut()`** : le premier n'est vrai qu'une fois le morceau du lobby LANCÉ (phase `lobby`) ; pendant son chargement
  (phase `charge`, 1 à 3 s), seul `lobbyPeut()` dit que le lobby a la main.
- **`PB.dernier` ≠ `PB.enCourse`** : `dernier` = le dernier tiré (le lobby le change) ; `enCourse` = le morceau de la course en cours.
- **`pouce-bleu-jeu.js`, `musique-bus.js`, `sfx.js`… sont HORS d'index.html** : après une modif, monter leur `?v=` dans `code/page/bibliotheques.html`
  (sinon le navigateur garde l'ancien), en plus de `sw.js`.
- **`setTargetAtTime`/`setValueAtTime` LÈVENT sur NaN** : passer par `stt()` (qui refuse le non-fini) ; une panne de son se dit par `sonPanne(nom,e)`,
  jamais par un `try{}catch(e){}` muet. Les sons continus de la boucle ont leur propre try (boucle-5-sons) : ne pas le retirer.
- **Une boucle continue nouvelle** (un gain qui suit la vitesse) : l'ajouter à la liste coupée par `togglePause` (init.js) ET par `endGame`.
- **Le contexte audio** : un seul `AC` (graphe-audio.js) + celui de l'intro, fermé 4,2 s après la casse. Le réveiller par `acReveil(AC)`, jamais
  `AC.resume()` nu (un refus d'iOS doit réarmer le réveil au toucher suivant).
- **`?simu=1`** (la page du simulateur) n'a pas d'écran titre : le contexte y reste endormi jusqu'au 1er bouton. Ce n'est pas le jeu des joueurs :
  les bancs du son passent par défaut par le vrai écran titre.
### Outils et livraison
- **`sw.js` : UNE seule ligne `const CACHE`** — on la REMPLACE (numéro +1, note courte), on n'empile pas les anciennes notes.
- **Assembleur** : ne jamais remettre un morceau à l'état de HEAD (git checkout code/…) quand index.html a déjà été réassemblé avec lui : l'assembleur
  voit « les deux modifiés » et fusionne à trois — le changement repasse dans index.html. Pour séparer deux correctifs en deux commits, les faire l'un
  après l'autre (modifier → assembler → committer → suivant).
- **Le banc sert `VERSION PRINCIPALE/` en direct** : ne pas réassembler pendant qu'un banc tourne.
- **Machine chargée** : au-delà d'une charge ~100, les fenêtres courtes du jeu (offre de seconde chance 5,5 s) se ferment entre deux allers-retours du
  banc ; piloter ces scénarios DANS la page (voir `--chance`).

## Journal de session
- 17 h 00 — worktree, banc `outils/banc-son/`. Trois lectures de code (musique/transitions · contexte/volumes · sons continus) rendues.
- Parcours complet au banc : la musique suit accueil (lobby lié de Pouce bleu) → course → arrière-plan (contexte suspendu, pause) → REPRENDRE
  → mort (un autre lobby) → REJOUER → accueil ; un seul AudioContext ; 0 promesse rejetée ; 0 erreur JS.
- FUITE AUDIO : NON. 10 courses enchaînées (`--courses 10`) : nœuds audio vivants après ramasse-miettes 293 → 345-625 selon le morceau, pente
  −1,3 nœud/course ; tas JS +0,8 Mo/course. (Le simple compte de liaisons d'une course à l'autre trompe : il suit le morceau tiré.)
- Hors son, vu au banc : `assets/portail/grotte-glace.webp` en 404 (le portail de la grotte de glace) → G1.
- 19 h 40 — **FUMÉE DU SON 5/5 VERTES** d'affilée (vrai écran titre, couché 844×390, `--frenesie --chance`), sur dd128731.
- Debout (`--colonne portrait --w 390 --h 844 --mobile`) et version téléphone (`--url "&tel=1" --mobile`) : musique, mort, REJOUER, accueil,
  0 erreur JS. (Le `play()` de déverrouillage refusé au `pointerdown` d'un doigt est rattrapé au `touchend` : voulu, rangé à part par la sonde.)
- Trois lectures « reste du jeu » (sauvegarde · cycle de vie/PWA · pièges) : aucun bloquant ; corrigés G2-G5 ; le reste est listé ci-dessous.

## Reste, non corrigé (mineur ou décision), par zone
- **Sauvegarde** : l'import n'est pas signé (banque 1e30, `ex.floor`, `owned` libres ; remboursement des caisses retirées rejouable par import) —
  décision (signer l'export ou corriger le commentaire de `san`) ; quota plein = échec silencieux (le filet de 30 s réessaie, rien n'avertit) ;
  JSON illisible écrasé sans copie sur le web (l'app a le miroir) ; « Dupliquer l'onglet » copie le jeton d'onglet ; `bankMax` calculé avant les
  remboursements ; `carBuy` ne regarde pas `ex.floor` (bouton normalement caché).
- **Service worker** : `assets/` et `vendor/` sont servis `immutable` un an (vercel.json) → un fichier REMPLACÉ SOUS LE MÊME NOM reste l'ancien
  chez les joueurs qui l'avaient, même après `cashcar-vNNN` +1 (le SW refait son fetch… depuis le cache HTTP). Règle : renommer (ou `?v=`) tout
  asset remplacé. Correction possible (décision : coût en données à chaque version) : `fetch(req,{cache:'reload'})` pour `assets/`.
- **Ordinateur `?pc=1`/`colonne=0`** : la partie se met en pause au changement d'onglet mais sans le panneau REPRENDRE (seul « PAUSE ») — le cadre
  de Vercel (`colonne=1`) n'est pas concerné.
- **Faux « la boucle plante à chaque image »** possible si deux erreurs d'écouteurs tombent autour de la 8e seconde (`debut-corps.html`, `__loopErr`
  alimenté par toute erreur globale) — rare.
- **natif.js** : `StatusBar.hide()` / `SplashScreen.hide()` sans `.catch` (un rejet avant `__gameReady` poserait l'écran « a calé ») — faible.
- **Code** : `function dnGeos2` déclarée deux fois (`maps/dunes-2.js:358` et `maps/dunes-embellie.js:9` : la 2e gagne, le corps de la 1re est mort)
  — zone de la session Arrakis, non touché.
