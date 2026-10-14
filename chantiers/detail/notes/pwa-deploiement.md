# pwa-deploiement — notes de la passe DÉTAIL (2026-10-14)

Copie : `detail/wt/pwa-deploiement` (branche `detail/pwa-deploiement`). Scripts : `detail/banc/pwa-deploiement/`.
(Notes écrites au fil de l'eau — la fin du fichier est la plus récente.)

## 0. Coordination
- Journal commun DEBUGGING (`/Users/sachaberes/cash-car/debug/journal-correctifs.tsv`) : vide à 1 h 50, aucun verdict dans `debug/verdicts/`
  (relu avant chaque retouche du grand script — voir § « LA MISE À JOUR TOUTE SEULE »).

## 1. INVENTAIRE (ce que la zone contient)
| # | Élément | Où |
|---|---|---|
| 1 | `<head>` : charset, title, description, favicon 32, viewport, theme-color, (apple-)mobile-web-app-capable, barre d'état, titre iOS, manifest, apple-touch-icon 180 | `index.html` l. 1-17 |
| 2 | `manifest.webmanifest` (name, short_name, description, lang, start_url, scope, display, display_override, orientation, couleurs, 3 icônes) | `VERSION PRINCIPALE/` |
| 3 | `sw.js` (CACHE, CORE, install, activate, fetch : version.json / navigation / statique) | `VERSION PRINCIPALE/` |
| 4 | `assets/icons/icon-32/180/192/512.png`, `icon.svg` | `VERSION PRINCIPALE/` |
| 5 | `vercel.json` (build, sortie, 3 redirections, 3 familles d'en-têtes) | racine |
| 6 | `vercel-build.sh` (garde burn-out, copie, retraits, empreinte, jeton, version.json) | racine |
| 7 | `garde-burnout.sh` (à Léo, lecture seule) | racine |
| 8 | `synchro-versions.js`, `.gitignore`, `JOUER.bat`, `README.md` | racine / jeu |
| 9 | Enregistrement du service worker (`navigator.serviceWorker.register`) | `index.html` ~l. 51990 |
| 10 | LA MISE À JOUR TOUTE SEULE (`CC_BUILD`, `CC_VER`, IIFE `sur/recharge/verifie`, `dbgMaj`) | `index.html` l. 75-76 et ~l. 51991-52026 |
