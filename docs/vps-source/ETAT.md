# ÉTAT — CASH CAR (point de départ)

Dernière mise à jour : 2026-08-27 (VPS, session unique)

## Vue d'ensemble
- **Projet** : CASH CAR — runner arcade 3D WebGL (un index.html monolithique + PWA → objectif App Store iOS).
- **Deux machines** :
  - **VPS** (Linux, ce serveur) = dev du jeu + agent Hermes autonome (cron 2 h + Telegram).
  - **Mac** (M4 16 Go, macOS) = chaîne de build iOS (Xcode). Uniquement build/déploiement.

## Repos sur le VPS
| Chemin | Rôle | État |
|---|---|---|
| `~/projets/sandbox` | dépôt de travail (jamais car-crash) | 7 commits, mandats 1–5 faits |
| `~/projets/car-crash` | ancien snapshot initial (ne plus toucher) | 1 commit |
| `~/projets/harness` | harnais de validation (Playwright + Chromium) | T0 fait |

## Roadmap du jeu (sandbox/ROADMAP.md)
Phase 1 — Mécanique (autonome) : **terminée**
- [DONE] Mandat 1 — Bundling local (three.js r128 + post-proc + police woff2 + mp3 dans CORE)
- [DONE] Mandat 2 — Reduce Motion (bloom/grain/FX coupés sous prefers-reduced-motion)
- [DONE] Mandat 3 — Externalisation i18n (fr/en, 194 clés)
- [DONE] Mandat 4 — VoiceOver (aria-label + role sur tous les éléments interactifs)
- [DONE] Mandat 5 — Scaffolding Capacitor (cap doctor sans erreur bloquante)

Phase 2 — Cohérence (supervisée) :
- [BLOCKED ⏸] Mandat 6 — Migration three.js r128 → récent. Dépend d'un build TestFlight qui démarre sur iPhone.

Phase 3 — Décisions de Sacha ⏸ (une question à la fois, attendre) :
1. Tutoriel (3 gestes, ordre, durée)
2. Économie du garage (déblocages, prix, ordre)
3. Succès Game Center (lesquels, cachés ?)
4. Icône 1024×1024 (à dessiner par Sacha)

Phase 4 — Non délégable (Mac) : compte Apple, certificats, screenshots, soumission.

## Côté Mac — chaîne de build iOS (ROADMAP-MAC.md)
| Mandat | État |
|---|---|
| A — Inventaire | DONE (M4 16 Go, disque nettoyé +6 Go caches) |
| B — Outils CLI | DONE (ios-deploy 1.12.2 ; CocoaPods inutile, SPM) |
| C — Projet probe | DONE (cap doctor OK, build device réussi) |
| D — Signature | BLOCKED ⏸ (Apple ID + iPhone branché — Sacha) |
| E — Premier déploiement | BLOCKED (dépend D) |
| F — build.sh | DONE (écrit + testé) |
| G — Récupérer le jeu | prêt (copié VPS→~/ios-build/cashcar, compile com.cashcar.game) |

## Infrastructure VPS (vérifiée)
- Node v26.7.0 — symlink `/usr/local/bin/node` → `~/.hermes/node/bin/node` (dispo dans tout PATH minimal).
- Chromium headless — `~/.cache/ms-playwright/chromium-1234`, WebGL OK.
- Playwright 1.62.1 — local `~/projets/harness/node_modules`.
- Hermes gateway : actif, cron prêt.

## Protocole backlog autonome
- `~/projets/BACKLOG.md` : file ordonnée, une tâche/ligne, critère vérifiable + statut TODO/DOING/DONE/BLOCKED.
- Cron toutes les 2 h : 1re ligne TODO dont Deps sont DONE → DOING → exécuter → vérifier → commit → DONE, puis stop.
- Verrou `/tmp/backlog.lock` (flock) : jamais deux exécutions concurrentes.
- Notifications : silence sur succès. Message uniquement si critère échoué 2× de suite, tâche ⏸, ou panne infra.
- Récap 21 h : une ligne (nb tâches finies aujourd'hui + prochaine en file).

## Règles (ROADMAP.md)
1. Un mandat à la fois, dans l'ordre.
2. Succès = une commande, pas une opinion.
3. Jamais inventer un flag/option — vérifier (--help) avant usage.
4. Après 2 échecs sur la même étape → stop + notifier Telegram (erreur brute).
5. Checkpoint humain ⏸ → question précise, attendre.
6. Secrets : jamais afficher la valeur, seulement le nom.
7. Ne pas toucher : firewall Hetzner, logique de jeu (physique/collisions/IA).

## Notes d'environnement
- Installateur Hermes : pas de `--non-interactive`.
- `libatomic1` requis pour Node sur Ubuntu 24.04.
- Ubuntu 24.04 : SSH par socket, `systemctl restart ssh` ne recharge pas toujours.
- Pas de GITHUB_TOKEN. Le dépôt git local fait foi.
