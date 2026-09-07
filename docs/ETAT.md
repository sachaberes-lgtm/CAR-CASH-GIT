# ÉTAT — CASH CAR (consolidé)

Dernière mise à jour : 2026-08-30 (consolidation Mac, le VPS n'est plus requis)

## Ce qui a changé

Le projet a été **réuni sous `~/cash-car/`**. Auparavant il était éclaté :
- **VPS** (`hetzner`) : `~/projets/sandbox` (prépa iOS), `~/projets/harness` (validation),
  `~/projets/car-crash` (snapshot initial), docs + backups.
- **Mac** : `~/car-crash` (le jeu avancé) et `~/ios-build` (chaîne iOS).

Tout a été rapatrié sur le Mac, sans rien détruire sur le VPS. La structure finale
est décrite dans `README.md` (à la racine de `~/cash-car/`).

## Les deux versions du jeu

| Version | Où | État | Taille index.html |
|---|---|---|---|
| **Jeu actuel (avancé)** | `game/` | 34 commits, garage, 15 caisses, nuages maillage, i18n, fruits, parc… | 844 Ko |
| **Prépa iOS (ancienne)** | `reference/sandbox/` | 7 commits : bundling, i18n fichiers, reduce-motion, VoiceOver, Capacitor | 390 Ko |

Ces deux branches **ne partagent pas de commit commun** (le Mac part de `8bb654e`,
le VPS de `12d8fee`). Elles ont divergé.

## Ce qui reste à faire pour la sortie App Store

### 1. Réappliquer la préparation iOS sur `game/` (le gros morceau)

Le travail fait sur le VPS doit être refait sur la version actuelle :
- **Bundling local** — game/ charge encore 8 URLs CDN (three.js r128, police, etc.).
  → télécharger three.js r128 + post-processing + woff2 + mp3 en local (`vendor/`, `assets/fonts/`).
- **i18n en fichiers** — externaliser les chaînes vers `assets/i18n/fr.json` / `en.json`.
- **Reduce motion** — couper bloom/grain/FX sous `prefers-reduced-motion`.
- **VoiceOver** — `aria-label`/`role` sur tous les éléments interactifs.
- **Capacitor** — le scaffolding existe déjà côté `ios/cashcar/` et `reference/sandbox/`.

La bonne méthode : reprendre `reference/sandbox/` comme **recette** (commit par commit),
et appliquer chaque mandat à `game/index.html`.

### 2. Backlog T3→T14 (voir `ios/BACKLOG.md`, le document complet)

T0 (harnais ✅), T1/T2 (intégration aux tâches), T3 à T14 : tutoriel, garage/progression,
succès, Game Center, audio iOS, iCloud, localisation, écrans App Store, icône, sauvegarde,
rapport final `DA-TODO.md`.

### 3. Bloquages humains (Sacha uniquement — règles 6 & 8)

- **Apple ID** (Xcode → Settings → Accounts) + iPhone branché → débloque les mandats D/E.
- **Décisions de design** (Phase 3 de `ROADMAP.md`) : tutoriel, économie du garage, succès, icône.

## Infra

| Élément | État |
|---|---|
| VPS `hetzner` | **plus nécessaire** pour le dev. Le gateway Telegram (`hermes-gateway.service`) y tourne encore (`active`). Cron agent : non vérifié (binaire `hermes` absent du PATH). |
| Mac | source unique du projet désormais. Xcode toujours requis pour le build iOS. |

## Règles (inchangées)

1. Un mandat à la fois, dans l'ordre.
2. Succès = commande, pas opinion.
3. Jamais inventer un flag — vérifier `--help`.
4. 2 échecs → stop + remonter l'erreur brute.
5. Checkpoint humain ⏸ → une question précise, attendre.
6. **Ne jamais demander un mot de passe / Apple ID à Sacha.**
7. Ne pas toucher : logique de jeu (physique/collisions/IA) sans mandat explicite.
8. **Un garde-fou qui se déclenche n'est jamais un faux positif** : s'arrêter, expliquer, attendre.