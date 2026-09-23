# CASH CAR — version fusionnée Sacha × Léo (septembre 2026)

Le jeu complet issu de la fusion des deux versions : celle de Sacha (branche `appstore-backlog`,
hors ligne, accessibilité, i18n) et celle de Léo (`version-leolei-2026/` : atelier, ville voxel,
garage, radio). Historique détaillé sur la branche `fusion-2026-09`.

## Jouer
- Mac / Linux : `python3 -m http.server 8000` dans ce dossier, puis http://localhost:8000
- Windows : double-clic sur `JOUER.bat`
- **Version téléphone sur l'écran d'ordi** : http://localhost:8000/index.html?tel=1
  (volant = clic maintenu + glisser dans la moitié gauche, NITRO = bouton ou Espace, ← → au clavier)
- Sur iPhone (même Wi-Fi) : `python3 -m http.server 8000 --bind 0.0.0.0`, puis l'adresse IP du Mac

## Ce qu'il y a de neuf
- **Niveaux** en boucle : 1 MER DE NUAGES (journée, ciel calme) → 2 AU-DESSUS DE LA VILLE (le village
  caché de la pluie, cyberpunk, ciel qui joue la musique) → 3 EN ORBITE (au-dessus de la Terre, noir complet).
  Console : `dbgSaut()` passe au niveau suivant, `dbgNiveau()` dit où l'on est.
- **Route** très large au niveau 1, qui se resserre à chaque niveau (pour les débutants).
- **Conduite** : la caméra et les sensations de la version de Sacha.
- Mobile : garage, menu et splash corrigés en portrait ; téléphone couché = pause expliquée.
- « Réduire les animations » respecté (logo, jus de fruit, filés de vitesse).
- 100 % hors ligne : `vendor/` (three.js r128) et la police locale, aucun CDN.

## Sons en attente des droits (non inclus)
heymikey-in-da-back-2, lilb-bor, nettspend-nothinglikeuuu, minecraft, balrog, takemymoney, shutup.
La radio joue NÉON CASH CAR et CASH CAR VITESSE en attendant.
