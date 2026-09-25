# CASH CAR — VERSION PRINCIPALE (la version mobile fusionnée Sacha × Léo)

> **Deux dossiers, un seul jeu.** `VERSION PRINCIPALE` = la version **téléphone**, c'est elle qu'on modifie —
> sur l'ordi aussi, elle s'ouvre directement en version téléphone. `AUTRE VERSION` = la version **PC** (menu
> desktop) : c'est une COPIE régénérée par `node synchro-versions.js` (racine du dépôt), à une ligne près
> (`const EDITION='pc'`). Ne jamais la modifier à la main.

Le jeu complet issu de la fusion des deux versions : celle de Sacha (branche `appstore-backlog`,
hors ligne, accessibilité, i18n) et celle de Léo (`version-leolei-2026/` : atelier, ville voxel,
garage, radio). Historique détaillé sur la branche `jeu-boucle-argent`.

## Jouer
- Mac / Linux : `python3 -m http.server 8000` dans ce dossier, puis http://localhost:8000
- Windows : double-clic sur `JOUER.bat`
- **Sur l'ordi, c'est directement la version téléphone** (volant = clic maintenu + glisser dans la moitié gauche,
  NITRO = bouton ou Espace, ← → au clavier). Le menu PC d'avant : dossier `AUTRE VERSION`, ou `index.html?pc=1`.
- Sur iPhone (même Wi-Fi) : `python3 -m http.server 8000 --bind 0.0.0.0`, puis l'adresse IP du Mac

## Ce qu'il y a de neuf
### 25 septembre : boucle de jeu, économie, conduite v3
- **Économie recalée** : ELDORADO 6 k, CAÏD 40 k, SA MAJESTÉ 250 k, ROSSO 40 1,5 M. **Défis** : 3 missions par
  carnet pour gagner LA BULLE, LE COMBI et LA DOLORÈS (nouveaux modèles low-poly), primes en banque.
- **Garage** : peintures, ailes et traînées essayées en 3D. **Boutique** premium (7 caisses, StoreKit à brancher).
- **Écran de fin** : AURA et MOTEUR en héros, barre d'objectif. Plus de faux « NOUVEAU RECORD ».
- **Conduite v3** : la caisse suit le virage, roulis, braquage immédiat ; drift mini-turbo (3 niveaux), RASE-BORD,
  et le **FLOW** : ×2 → ×5 FRÉNÉSIE, qui multiplie l'argent et la vitesse. Vitesse globale −20 %.
- **Route v2** : plus de droites, spirales raccourcies, crêtes adoucies. **Auto-école** (tutoriel 5 étapes, sans mort).
- **Charte v3** (boutons arrondis à lèvre 3D), accueil vitrine, rideau de transition, bouton NITRO à anneau.
- Collectibles : pièce pixel et fruits low-poly.

### 24 septembre : fusion Sacha × Léo, niveaux, charte pixel
- **Niveaux** en boucle : 1 AU-DESSUS DE LA VILLE (le village caché de la pluie, cyberpunk, sans nuages, ciel qui
  joue la musique) → 2 MER DE NUAGES (journée) → 3 EN ORBITE (au-dessus de la Terre, noir complet).
  Console : `dbgSaut()` passe au niveau suivant, `dbgNiveau()` dit où l'on est.
- **Carrière** : 30 niveaux (Nuages · Ville · Espace × 10), bouton CARRIÈRE au garage.
- **Musique qui suit le monde** (push de Léo) : Nocturnal Groove en ville, Noite de Velocidade dans les nuages.
- **Route** très large au niveau 1, qui se resserre à chaque niveau (pour les débutants).
- **Direction artistique** : tous les boutons, croix, flèches et textes en pixel, alignés sur le titre CASH CAR
  (icônes pixel maison, plus aucun emoji) ; nouvelle icône d'app ; image nette (résolution adaptative réparée).
- Mobile : le téléphone atterrit sur le menu ; téléphone couché = pause expliquée.
- « Réduire les animations » respecté (logo, jus de fruit, filés de vitesse).
- 100 % hors ligne : `vendor/` (three.js r128) et la police locale, aucun CDN.

## Sons en attente des droits (non inclus)
heymikey-in-da-back-2, lilb-bor, nettspend-nothinglikeuuu, minecraft, balrog, takemymoney, shutup.
La radio joue NÉON CASH CAR et CASH CAR VITESSE en attendant.
