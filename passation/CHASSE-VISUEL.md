# CHASSE AUX BUGS VISUELS — téléphone (10/11/2026, session Fable)

Partage : la session Opus `chasse-bugs-mobile` (journal `passation/CHASSE-MOBILE.md`) tient la console, le tactile, le cycle de vie et les bancs ;
ici, ce qui se juge à l'image. Méthode : `outils/banc-ecrans/photos.cjs` (390 × 844, 844 × 390, puis 667 × 375 et 1280 × 720), chaque photo regardée.

## Corrigé
1. **Le « 1.61 » du mur de la boutique, coupé (couché)** — `code/interface/boutique-scene-1.js`, `bq161Vue()`. Sur 844 × 390, aux rayons AILES et FIGURES,
   le 1.61 en relief tombait à moitié derrière la plaque de l'argent (une tranche de chiffres pâles, lue comme un défaut d'affichage) ; au rayon TRAÎNÉES
   il collait au nom de l'objet ; sur 1280 × 720 (AILES) il était coupé par le haut de la fenêtre. Chaque image, sa boîte est projetée : il se retire s'il mord
   sur la tête (BOUTIQUE + l'argent), s'il est à moins de 14 px du nom, ou s'il sort par le haut ; dégagé, il reste (la signature voulue par Léo). Debout : inchangé (retiré).
   Vérifié à l'image, six rayons × trois tailles.
2. **Le toast « PEINTURE GAGNÉE · NOM », debout** — `code/economie/boutique-vitrine.js`. La ligne se coupait avant le point : la 2e ligne commençait par « · ».
   Espace insécable avant le point. Non rephotographié (le toast ne tombe qu'une fois par sauvegarde).

## Vu, jugé propre (rien à faire)
Accueil, garage, inventaire (4 onglets), boutique debout (6 rayons), achat, réglages, missions, profil, plaque, écran de mort — debout et couché.

## Pas jugé
- La course et la pause : au banc, la caisse meurt avant la photo (les prises « course » et « pause » montrent l'explosion ou l'écran de mort). HUD et animations de course à juger en direct.
- Les animations et transitions (le banc ne prend que des images fixes).

## Pour Opus (pas visuel, ou hors téléphone)
- Banc des écrans : les étapes `course` → `pause` → `pause-reglages` dérivent (`tap:introuvable : #tPanel [data-a="tous"]`, `#mvW .mvBt`, `#serieW .swBt`).
- Ordinateur 1920 × 1080, boutique : la liste des objets reste une étroite colonne au milieu de l'écran (photo `pc1080-boutique`). À regarder côté ordinateur.
- Ordinateur 1280 × 720, rayon PEINTURES : les cases restent blanches à la photo (photos paresseuses ou banc trop rapide ?).
