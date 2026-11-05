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

## À vérifier sur un vrai iPhone

## Pièges pour les prochaines modifs

## Journal de session
- 17 h 00 — worktree, banc `outils/banc-son/`. Trois lectures de code (musique/transitions · contexte/volumes · sons continus) rendues.
- Parcours complet au banc : la musique suit accueil (lobby lié de Pouce bleu) → course → arrière-plan (contexte suspendu, pause) → REPRENDRE
  → mort (un autre lobby) → REJOUER → accueil ; un seul AudioContext ; 0 promesse rejetée ; 0 erreur JS.
- FUITE AUDIO : NON. 10 courses enchaînées (`--courses 10`) : nœuds audio vivants après ramasse-miettes 293 → 345-625 selon le morceau, pente
  −1,3 nœud/course ; tas JS +0,8 Mo/course. (Le simple compte de liaisons d'une course à l'autre trompe : il suit le morceau tiré.)
- Hors son, vu au banc : `assets/portail/grotte-glace.webp` en 404 (le portail de la grotte de glace).
