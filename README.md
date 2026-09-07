# CASH CAR

Runner arcade 3D en HTML/JS (Three.js). On conduit sur un ruban de route
suspendu dans le ciel, on saute, vrille, traverse les nuages, ramasse pièces et
nitro. Une seule vie. Objectif : sortie sur l'App Store iOS en novembre 2026.

Développé à deux (Sacha + un ami), dans un fichier source principal unique.

## Où sont les choses

```
.
├── index.html            ← LE JEU. Fichier unique (~12 000 lignes) : HTML, CSS,
│                            moteur three.js, physique, bots, interface — tout.
├── assets/               ← sons (annonceur, musique, mort) + police locale
├── vendor/               ← three.js et post-processing servis en LOCAL (aucun CDN)
├── dev/                  ← ateliers de prototypage (nuages, ombres, shaders, menu)
├── ios/                  ← chaîne de build iOS (build.sh, ROADMAP-MAC, BACKLOG) + projet Capacitor
├── demo/                 ← l'usine à démo (build.py) → vitrine publique (Vercel)
├── reference/            ← travail iOS fait sur le VPS, à réappliquer (sandbox + harness)
├── docs/                 ← ETAT.md consolidé + copies fidèles des docs VPS
├── pages/                ← privacy.html + support.html (App Store)
├── eparpille/            ← morceaux retrouvés hors du foyer (sons originaux SHAO KANH, survivant, vieilles versions)
└── archive/              ← snapshots historiques + sauvegardes (lecture seule)
```

`index.html` est la **source de vérité unique**. Les anciennes versions et
copies divergentes sont conservées dans `eparpille/` et `archive/` — on n'y
reprend jamais de code sans relecture explicite.

## Lancer le jeu en local

Le jeu charge ses sons en relatif ; il faut un petit serveur HTTP, pas une
ouverture directe du fichier :

```bash
cd game
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Vérifier la syntaxe du JS avant de committer :

```bash
cd game
sed -n '/<script>/,/<\/script>/p' index.html | sed '1d;$d' > /tmp/_check.js
node --check /tmp/_check.js
```

## Reconstruire la démo publique

```bash
cd game
python3 demo/build.py    # régénère demo/cash-car-demo/ (non versionné)
```

## Chantier en cours

1. fusionner les deux coques d'interface en une seule, mobile d'abord
   (aujourd'hui `#settings` et `#mSet` font la même chose deux fois)
2. drapeau `DEV` pour masquer l'outillage de développement
3. décider de l'économie du jeu (le cash gagné ne se dépense nulle part)
4. écran boutique
5. écran MODES transformé en vraie sélection au lieu de bascules ON/OFF
6. haptique iOS, tutoriel sans texte
7. conformité App Store et TestFlight

## À deux

- `git pull` avant de commencer, commit + push après. Ne jamais garder des
  modifications non poussées plus d'une journée.
- Se répartir par **zone du fichier** (ex. les nuages, le garage), pas par
  fonctionnalité, pour limiter les conflits sur `index.html`.
- Commits en français, une phrase qui dit ce qui change et pourquoi.