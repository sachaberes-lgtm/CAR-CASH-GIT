# PILOTAGE — RÈGLES COMMUNES À TOUTES LES SESSIONS CASH CAR (nuit du 14/10/2026)

Sacha (2 h 14) : « Dans cette discussion [PILOTAGE], gère les tâches entre toutes les discussions pour optimiser les tokens et la puissance de mon ordi ;
accorde-leur plus ou moins de puissance et de liberté pour créer leurs agents. » Cap de la nuit : **la version APP STORE (iPhone), qui sort demain.**

Pourquoi : entre 0 h 55 et 2 h 05, cinq flottes (~45 agents, ~15 Chrome) ont mis le Mac à une charge de 465 puis l'ont fait REDÉMARRER.
Bilan de cette heure : 41 % du quota de 5 h dépensé, **presque aucun commit d'agent** (perf 0, ui 0, debug 0, detail 0, gfx 1). On ne refait pas ça.

## 1. Les quotas (le fichier qui fait foi : `pilotage/BUDGET.md` — RELIS-LE avant CHAQUE vague, il change)
- Chaque session a un plafond d'AGENTS SIMULTANÉS et un droit NAVIGATEUR. Jamais plus, même « juste pour finir ».
- Une vague = au plus ton plafond. La vague suivante part quand la précédente est INTÉGRÉE (commits repris dans ta branche `*-integration`).
- Avant chaque vague : `uptime` (charge sur 1 min > 25 → tu attends 5 min) et `pilotage/BUDGET.md`.

## 2. Le navigateur de banc (Chrome sans fenêtre) : UN SEUL sémaphore pour toute la machine
- Tous les `*/banc/slots` pointent maintenant vers `pilotage/slots` (3 créneaux en tout). Les agents utilisent le `lib.cjs` de LEUR session
  (`B.ouvre`) — jamais une copie de lib.cjs ailleurs, jamais `chromium.launch` direct, jamais `CC_SLOTS` forcé.
- Une ouverture = beaucoup de vérifications (boucle de réglages, plusieurs captures), puis `await s.ferme(); process.exit(0)`.
- Les agents de LECTURE de code n'ont pas de navigateur. Syntaxe : `node <banc>/syntaxe.cjs` (5 s) ; garde : `sh garde-burnout.sh`.
- `xcodebuild` / simulateur iOS : session APP STORE seulement, et seulement dans un créneau annoncé dans BUDGET.md.

## 3. Les tokens
- Agents en `effort: 'high'` au plus (jamais xhigh/max). Chasseurs, relecteurs, éclaireurs, vérificateurs « réfute d'abord » : `model: 'sonnet'`,
  `effort: 'medium'`. Opus (hérité) seulement pour qui ÉCRIT un correctif délicat dans index.html.
- Missions COURTES : une zone, 20-30 min, un livrable. Le chef donne à l'agent les NOMS de fonctions et les lignes (cartes : `debug/carte/tranches.json`,
  `detail/CARTE.md`, `gfx/CARTE.md`) — un agent ne re-cartographie pas le fichier. Personne ne lit index.html (5,4 Mo) ni CLAUDE.md (800 Ko) en entier.
- **UN COMMIT APRÈS CHAQUE CORRECTIF.** Un agent sans commit au bout de 20 min est un agent perdu : découpe plus petit.
- Pas de message à PILOTAGE sauf blocage ou conflit : ton état va dans `pilotage/etat/<TA-SESSION>.md` (≤ 12 lignes, réécrit à chaque fin de vague :
  heure · agents en cours · commits intégrés depuis le dernier état · blocages · suite). PILOTAGE lit ces fichiers, pas vos fils.

## 4. Une seule base, un seul intégrateur
- PILOTAGE tient la branche locale **`assemblage`** (worktree `pilotage/integ`) = le « code final » de la version App Store :
  origin/main à jour (Léo pousse en direct) + le mode classique au hasard de Sacha (`classique-biomes`) + `opti-jade-perf`.
- Chaque session livre sur SA branche `*-integration`. Aux TRAINS (heures dans BUDGET.md), PILOTAGE fusionne les `*-integration` dans `assemblage`
  (syntaxe + garde du burn-out + test de fumée), publie le résultat dans `pilotage/ETAT.md`, puis chaque session refusionne `assemblage` chez elle.
- Personne ne pousse sur `main` (pousser = publier ; c'est Sacha qui décide). Personne ne fusionne la branche d'une autre session.
- Journal commun des correctifs : `debug/journal-correctifs.tsv` — grep avant de toucher une fonction, une ligne après chaque commit
  (`printf '<session>:<agent>\t<fonction>\t<lignes>\t<titre>\n' >> …`).

## 5. Les zones (détail et priorités dans BUDGET.md)
- Hors de ta zone : tu NOTES pour la session propriétaire (dans ton fichier d'état), tu ne corriges pas.
- ZONE GELÉE POUR TOUS : la BOUTIQUE 3D et les voitures — Léo y travaille EN DIRECT sur main cette nuit (3 commits depuis 1 h 54).
- Intouchables : le burn-out de Léo ; les choix tranchés du guide.
