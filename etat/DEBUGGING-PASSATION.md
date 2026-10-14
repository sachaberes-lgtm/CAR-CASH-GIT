# DEBUGGING — PASSATION (de quoi reprendre dans une discussion neuve) — écrit à 2 h 45

## Où
- Chantier : `~/cash-car/debug`. Branche locale `debug-integration` (worktree `debug/integ`) = `assemblage` T0 `0c1ecee`, 0 commit à nous pour l'instant. Serveur : port 8800 (launch.json `cashcar-debug`).
- Règles des agents : `debug/BRIEF.md`. Ordres : `pilotage/REGLES.md`, `pilotage/BUDGET.md` (3 agents, chasseurs sonnet/medium, 1 seul Opus correcteur à la fois, 1 navigateur pour la fumée). État court : `pilotage/etat/DEBUGGING.md`.

## Comment tourne un lot
1. `uptime` (< 25) + relire BUDGET.md.
2. `node debug/banc/index-fonctions.cjs "debug/integ/VERSION PRINCIPALE/index.html" debug/banc/flotte-lots.js` → `debug/carte/reperes.json`.
3. `Workflow({scriptPath:'/Users/sachaberes/cash-car/debug/banc/flotte-lots.js', args:{lot, lim:3, ids:[…], reperes:<reperes.json>, tranches:[[id,de,a,repères]…]}})`.
   ids = thèmes du script (`THEMES`), `v:<id>` (vérifier `trouvailles/<id>.json`), ou ids de tranche (`debug/carte/tranches.json`).
4. À la notification de fin : `sh debug/banc/integre.sh $(ls debug/wt)` (cherry-pick + syntaxe + garde ; état dans `debug/integres.txt`, conflits dans `debug/integration.log`), puis `node debug/banc/fumee.cjs 8800 couche,debout`, `node debug/banc/bilan.cjs`, réécrire `pilotage/etat/DEBUGGING.md`, lancer le lot suivant. Pas de nouvelle vague 10 min avant un train (3 h 45, 5 h 15, 6 h 45).

## Lots
- lot1 (lancé 2 h 35, run `wf_6e1b6252-d55`) : `v:hier` (2e tour vide du Soleil de Jade, `jadeRedemarre`), `premier-lancement`, `impasses`, `arriere-plan`.
- lot2 : `mort-relance`, `pause`, `rotation` · lot3 : `classique-hasard`, `portails-niveaux`, `sauvegarde` · lot4 : `collisions-route`, `collisions-vol`, `pas-de-temps`
- lot5 : `tactile-course`, `tactile-menus`, `ramassages` · lot6 : `pouvoirs`, `piste-trafic`, `nombres` · lot7 : `audio-ios`, `langues`, `economie`, `missions-carriere`
  (dans missions-carriere : vérifier qu'aucune mission / défi / porte de carrière ne dépend des PLOTS, retirés par GRAPHISME `PLOTS_ON` ; ne pas « corriger » `sensHap`/`sensCoup`).
- en dernier : tranches JS de LOGIQUE seulement (js01, 17-19, 21, 32-35, 37, 38, 42, 44, 46, 47, 49-53, 55, 62, 65-70), pas de CSS, pas de 3D.

## Acquis
- Joueur neuf sur T0 (`debug/logs/neuf-T0.log`) : 0 erreur JS, aucune impasse. Mineur : mort lancée de CARRIÈRE / MISSIONS → HOME ramène à l'accueil.
- Recherche rapide : aucune mission ne cite explicitement un plot (à confirmer au lot 7).
- À signaler, pas à corriger : boutique couchée sous l'encoche (zone GELÉE, Léo).
- Rien n'est poussé sur main sans l'accord de Sacha.
