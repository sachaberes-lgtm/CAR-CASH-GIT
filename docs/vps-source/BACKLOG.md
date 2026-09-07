# BACKLOG — CASH CAR

File ordonnée T0→T14. Une ligne = une tâche.
Format : `[STATUT] ID — description — Dépôt — Critère : … — Deps : …`
STATUT ∈ {TODO, DOING, DONE, BLOCKED}

## Protocole (agent cron, toutes les 2 h)
1. Verrou `/tmp/backlog.lock` (mkdir atomique + péremption 3 h) : jamais deux exécutions concurrentes.
2. Lire ce fichier. Prendre la PREMIÈRE ligne `[TODO]` dont toutes les `Deps` sont `DONE` (ou sans Deps).
3. La passer à `[DOING]`, exécuter, vérifier le `Critère` PAR COMMANDE, committer, la passer à `[DONE]`.
4. UNE seule tâche par exécution, puis s'arrêter.
5. Silence sur succès (`[SILENT]`). Message uniquement si : critère échoué 2× de suite, tâche ⏸, ou panne infra.
6. Les tâches de « mécanique » (T4, T5, T6) se construisent avec des contenus provisoires `[PLACEHOLDER-DA]` tant que Sacha n'a pas tranché.

## Tâches

[DONE] T0 — Harnais de validation (Playwright + Chromium headless) — Dépôt : ~/projets/harness — Critère : `check.sh ~/projets/car-crash` FAIL sur (b)(c)(d)(e) + PASS (a)(f) ; `check.sh ~/projets/sandbox` 6/6 — Deps : —

[DONE] T13 — Sauvegarde git (le code n'existe qu'en un exemplaire) — Dépôt : ~/projets (sandbox, car-crash, harness) — Critère : `git bundle --all` complet + `git bundle verify` OK + restauration testée par clone-from-bundle + tarball des fichiers hors-git (BACKLOG, ETAT) — Deps : —

[TODO] T3 — Correction orientation (warning Xcode « All interface orientations must be supported ») — Dépôt : ~/projets/sandbox — Critère : ⚠ à récupérer depuis la source — Deps : —

[TODO] T4 — Mécanique [PLACEHOLDER-DA] : tutoriel (3 gestes, ordre, durée) — Dépôt : ~/projets/sandbox — Critère : ⚠ à récupérer depuis la source — Deps : —

[TODO] T5 — Mécanique [PLACEHOLDER-DA] : économie du garage (déblocages, prix, ordre) — Dépôt : ~/projets/sandbox — Critère : ⚠ à récupérer depuis la source — Deps : —

[TODO] T6 — Mécanique [PLACEHOLDER-DA] : succès (lesquels, cachés) — Dépôt : ~/projets/sandbox — Critère : ⚠ à récupérer depuis la source — Deps : —

[BLOCKED] T7 — Game Center — Dépôt : ~/projets/sandbox — Critère : ⚠ à récupérer depuis la source — Deps : compte Apple Developer (Sacha) ⏸

[TODO] T8 — ⚠ description à récupérer depuis la source — Dépôt : ~/projets/sandbox — Critère : ⚠ à récupérer depuis la source — Deps : —

[BLOCKED] T12 — Icône 1024×1024 — Dépôt : ~/projets/sandbox — Critère : dessinée par Sacha ⏸ (non délégable) — Deps : Sacha

## ⚠ SOURCE MANQUANTE — à recoller depuis la session Mac
Les lignes T1, T2, T9, T10, T11, T14 (descriptions + critères) ne sont pas disponibles sur le VPS.
Le document complet T0→T14 est resté sur le Mac : `~/ios-build/BACKLOG.md`.
Tant que le texte complet n'est pas recollé ici, le worker est en pause (aucune tâche sans critère ne doit être exécutée).
