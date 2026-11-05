# Passation — l'Ouroboros du chargement de CASH CAR (05/11/2026)

**Où :** dépôt CAR-CASH-GIT, branche `ouroboros-chargement` (worktree `~/cash-car/ouroboros`), dossier `outils/ouroboros/`.
`main` sert encore l'ancienne version « Snake » (refusée) : rien n'est publié de cette version-ci.

## Ce que veut Sacha (validé : « on a la base »)
- Un mini serpent ouroboros en pixel, noir / blanc / gris, pour l'écran de chargement.
- LE CORPS NE BOUGE PAS : un anneau épais, complet, sans partie amincie, sans bout de queue visible.
- C'est la TÊTE qui fait le tour du corps (un tour par boucle) en le rongeant en permanence : le corps entre épais entre ses deux mâchoires, comme aspiré.
- La gueule claque en boucle, des dents visibles qui mordent le corps ; des boules de matière (gris) traversent le corps et sont avalées.
- Refusé : le look Snake/Nokia/Google (« horrible »), une queue fine, le corps qui tourne, le corps qui disparaît dans un trou noir.

## En cours (dernier retour de Sacha)
« La tête est moche, trop grosse, pas assez détaillée, trop blanche ; inspiration ouroboros. »
Version précédente (18 × 18 blanche, `BASE` + `GUEULE`) : remplacée le 05/11 après-midi, non committée au moment de cette note.
**Version actuelle** (06/11, à faire juger par Sacha) : style « cartoon Undertale » demandé par Sacha — pixels nets, 6 gris tranchés, gros œil à pupille en fente, contour clair d'1 px autour de la tête ET du corps (demandé par Sacha le 06/11).
Tête reptile de petit dragon sobre (~15 × 12 px avec les pics ; échelle `HS`) : écailles en losanges, 4 pics dorsaux, pointe de joue, arcade, dents, narine ; PEINTE à 8 cellules/px dans le repère courbe de l'anneau puis votée au pixel.
Corps en relief (tube éclairé de l'extérieur), écailles en losanges, 14 pics couchés, 3 reflets qui le parcourent. Animation : mâchoire (2 bouchées / 12 images), coup de tête au CLAC, clignement, pics qui oscillent, boules de matière.
Passe « améliore l'ensemble » (06/11) : dents plus grosses, sourcil expressif, écrasement-étirement au CLAC (`SQUASH`), pupille qui suit la boule, fumée de narine.
**Tête et corps RACCORD, la tête un cran plus foncée** (Sacha, 06/11 : « tête plus foncée que le corps » puis « pas de la même couleur, pas raccord ») : un seul modèle de lumière (`tube(q)`, tube éclairé par l'extérieur) pour les deux ; la tête le reprend à `HK` = 0,58 (remplissage ~100/255 contre ~126 pour le corps, rapport 0,79 — mesuré) ;
le corps s'assombrit en approchant du crâne (le cou, ~10 px de dégradé) pour qu'il n'y ait pas de rupture. Ne pas repasser à une tête 2 fois plus sombre (rapport 0,57, essayé : rupture) ni la ramener au même gris (rapport 0,96).
Réglages : `HS` (taille de la tête), `SPIKES`, `JAW`, `LUNGE`, `LV` (les gris). Détail dans l'en-tête de `ouroboros.cjs`.
Essais écartés : rendu en gris lissé (anneau fin et flou, détails perdus à 1×), tête de 12 px (trop petite pour qu'on lise l'œil), épines fines en barre (on dirait une antenne), 3-4 tons plats (bouillie).
Lien de test : serveur statique à lancer soi-même depuis la racine du worktree (`python3 -m http.server <port>`), puis `/outils/ouroboros/demo.html?v=<n>&zoom=3`.

## Fichiers
- `ouroboros.cjs` — le générateur (`node outils/ouroboros/ouroboros.cjs`) : écrit la bande PNG, `ouroboros.css`, `demo.html`, les planches. Retoucher ici, jamais le PNG.
- `png.cjs` — l'encodeur PNG sans dépendance. `demo.html` — la démo animée.
- Branché dans le jeu : `code/page/ecrans-garage.html`, ligne `<style>#spCharge{…}` = contenu de `ouroboros.css` ; puis `node code/assembler.cjs`.
- Pour publier : fusionner `origin/main`, passer `cashcar-vNNN` au numéro suivant dans `VERSION PRINCIPALE/sw.js`, tester, pousser sur main. Seulement sur le feu vert de Sacha.

## Habitudes de Sacha
- À chaque retouche, donner le lien http animé (`http://localhost:<port>/outils/ouroboros/demo.html?v=<n>`), pas un fichier.
- Regarder les images soi-même avant d'envoyer (planche + gros plan) : il voit tout de suite quand rien n'a changé.
