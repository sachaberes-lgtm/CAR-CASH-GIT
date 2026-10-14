# PROTOCOLE — une session CASH CAR qui tourne sur UN AUTRE ORDINATEUR (le PC de Sacha), avec un autre compte Claude

Le chef d'orchestre (PILOTAGE) tourne sur le Mac. Le seul lien entre les deux machines est le dépôt GitHub **CAR-CASH-GIT** (remote `origin`).
Rien de ce protocole ne publie le jeu : on ne pousse JAMAIS sur `main` (pousser sur main = publier sur Vercel, c'est Sacha qui décide).

## Les trois branches d'échange
- `origin/assemblage` — la base commune (le travail de toutes les sessions + main de Léo), poussée par PILOTAGE à chaque train (~1 par heure).
- `origin/pilotage-notes` — les fichiers de coordination, poussés à chaque train : `REGLES.md`, `BUDGET.md` (plafonds, cap de Sacha),
  `ETAT.md` (trains), `QUESTIONS.md` (décisions de Sacha), `BACKLOG.md` (travail à prendre), `POUR-LEO.md`, ce protocole.
  Lecture sans rien extraire : `git fetch origin && git show origin/pilotage-notes:BUDGET.md | head -60`.
- `origin/<ta-branche>` (ex. `ui-integration` pour INTERFACE) — TON travail, que tu pousses ; PILOTAGE la fusionne à chaque train.

## La boucle de la session sur le PC
1. Avant chaque vague : `git fetch origin && git merge origin/assemblage` dans ta branche (syntaxe : chaque `<script>` d'index.html doit
   passer `node --check` ; la garde `sh garde-burnout.sh` doit dire OK). Relis la tête de `BUDGET.md` et ta section du `BACKLOG.md`.
2. Travaille sur TA zone seulement (voir `REGLES.md`) ; un commit par correctif.
3. Après chaque vague : `git push origin <ta-branche>` (jamais `--force`, jamais `main`), et mets ton état dans `passation/ETAT-<SESSION>.md`
   de ta branche (≤ 12 lignes : heure, fait, en cours, suite, questions pour Sacha) — PILOTAGE le lit à chaque train.
4. Une question pour Sacha : écris-la dans ton `passation/ETAT-<SESSION>.md` (rubrique « QUESTIONS ») ; PILOTAGE la lui transmet.

## Ce qui reste interdit partout
Le burn-out du garage, la boutique 3D, les voitures et les morceaux de musique de Léo ; réintroduire le chinois (`I18N_ZH`, `LANG==='zh'`),
l'édition Poki (`POKI`, `pk(`, `html.poki`) ou CRYPTOCITY (retirés sur ordre de Sacha) ; rebasculer un choix tranché par Sacha.
