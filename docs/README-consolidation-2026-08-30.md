# CASH CAR — projet consolidé

Runner arcade 3D WebGL (Three.js). Objectif : sortie sur l'App Store iOS.

> **Ce dépôt `~/cash-car/` est désormais LA source unique du projet.** Il réunit
> tout ce qui était éparpillé entre le VPS (dev autonome + agent cron) et le Mac
> (chaîne de build iOS). Le VPS n'est plus nécessaire pour y travailler.

## Structure

```
~/cash-car/
├── game/            ← LE JEU. Version la plus avancée (fusion 30/08 : garage, 15 caisses, nuages maillage, i18n, etc.)
│                       repo git → github.com:sachaberes-lgtm/car-crash  (branche fusion-atelier-mobile active)
│   ├── index.html        TOUT le jeu (HTML+CSS+JS monolithique, ~11 700 lignes)
│   ├── assets/audio/announcer/*.mp3
│   ├── dev/              ateliers de prototypage (nuages, ombres, shaders)
│   └── CLAUDE.md         guide projet (architecture détaillée)
├── ios/             ← CHAÎNE DE BUILD iOS (sur Mac uniquement, Xcode requis)
│   ├── build.sh          harnais : synchronise le web, compile, installe sur l'iPhone
│   ├── ROADMAP-MAC.md    feuille de route iOS (mandats A→G)
│   ├── BACKLOG.md        backlog complet T0→T14 (le document source, sans perte)
│   ├── probe/            projet Capacitor jetable de validation de la chaîne
│   └── cashcar/          copie Capacitor du jeu (bundle com.cashcar.game)
├── reference/       ← LE TRAVAIL iOS FAIT SUR LE VPS (à RE-APPLIQUER sur game/)
│   ├── sandbox/          ancienne version du jeu + préparation App Store (7 commits)
│   │   └── (bundling three.js local, i18n fr.json/en.json, reduce-motion,
│   │        VoiceOver/aria, scaffolding Capacitor — voir git log)
│   └── harness/          harnais de validation Playwright + Chromium (check.sh, 6 contrôles a-f)
├── docs/            ← DOCUMENTATION SOURCE
│   ├── vps-source/       ETAT.md, BACKLOG.md (tronqué), ROADMAP.md tels qu'ils étaient sur le VPS
│   └── ETAT.md           ← l'état consolidé (à jour, lire en premier après ce README)
└── archive/         ← SNAPSHOTS HISTORIQUES (à ne pas modifier)
    ├── car-crash-vps/    le tout premier snapshot (1 commit initial)
    └── backups/          bundles git + tarballs du 27/08 (sauvegarde de secours)
```

## ⚠️ Point critique — deux branches ont divergé

La préparation App Store (mandats 1-5) a été faite **sur le VPS**, sur une
**ancienne** version du jeu (`reference/sandbox/`). Pendant ce temps, le jeu a
beaucoup avancé **sur le Mac** (`game/`), mais **sans** cette préparation.

Conséquence : `game/index.html` charge encore three.js depuis le CDN, n'a pas
d'i18n en fichiers, pas de reduce-motion, pas de VoiceOver. Il faut **réappliquer**
le travail iOS (reference/sandbox) sur la version actuelle (game), en reprenant
chaque mandat un par un — pas de fusion à l'aveugle : les deux fichiers ont trop
divergé (390 Ko vs 844 Ko, structure interne différente).

Voir `docs/ETAT.md` pour le détail exact de ce qui manque.

## Ça marche comment

- **Jouer** : `cd game && python3 -m http.server 8000` puis http://localhost:8000
- **Vérifier le JS** : extraire le bloc `<script>` de `game/index.html` et le passer à `node --check`
- **Build iOS** : `ios/build.sh <chemin-du-www>` (nécessite Xcode + iPhone branché + Apple ID)
- **Harnais de validation** : `reference/harness/check.sh <chemin>` (6 contrôles PASS/FAIL)

## Documents de pilotage

| Fichier | Rôle |
|---|---|
| `game/CLAUDE.md` | architecture du jeu, repères dans index.html, histoire des nuages |
| `ios/ROADMAP-MAC.md` | chaîne de build iOS, mandats A→G |
| `ios/BACKLOG.md` | backlog **complet** T0→T14 (tâches restantes pour la sortie App Store) |
| `docs/ETAT.md` | état consolidé du projet entier |
| `docs/vps-source/` | copies fidèles des docs VPS (ETAT, BACKLOG tronqué, ROADMAP) |