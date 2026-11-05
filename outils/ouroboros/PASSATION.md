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
Dernière version : tête dessinée à la main 18 × 18 (`BASE` dans `ouroboros.cjs`), gueule en 4 états (`GUEULE`), crâne et mâchoire gris.
Défaut connu : la tête est tournée au pixel autour de l'anneau, les détails se brouillent quand elle est de côté ou à l'envers.

## Fichiers
- `ouroboros.cjs` — le générateur (`node outils/ouroboros/ouroboros.cjs`) : écrit la bande PNG, `ouroboros.css`, `demo.html`, les planches. Retoucher ici, jamais le PNG.
- `png.cjs` — l'encodeur PNG sans dépendance. `demo.html` — la démo animée.
- Branché dans le jeu : `code/page/ecrans-garage.html`, ligne `<style>#spCharge{…}` = contenu de `ouroboros.css` ; puis `node code/assembler.cjs`.
- Pour publier : fusionner `origin/main`, passer `cashcar-vNNN` au numéro suivant dans `VERSION PRINCIPALE/sw.js`, tester, pousser sur main. Seulement sur le feu vert de Sacha.

## Habitudes de Sacha
- À chaque retouche, donner le lien http animé (`http://localhost:<port>/outils/ouroboros/demo.html?v=<n>`), pas un fichier.
- Regarder les images soi-même avant d'envoyer (planche + gros plan) : il voit tout de suite quand rien n'a changé.
