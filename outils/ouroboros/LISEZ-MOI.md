# L'OUROBOROS DU CHARGEMENT — EN MODE SNAKE

Demande de Sacha (03/11 puis 04/11/2026) : un mini Ouroboros pixel noir et blanc pour le chargement, dont « la tête avance autour du corps en le mangeant, le corps se nourrit de boules
de matière qui passent et qu'il avale », avec des dents. Puis, devant la version « serpent vivant » : « bizarre, mon gars : fais-le plus en mode Snake, Snake Google, les jeux vidéo,
la culture populaire ; fais le plus beau ». Dessin et animation : Fable 5.1.

## Ce que fait l'animation (boucle de 3 s, 48 images à 16 images/s)
- Un SNAKE : un anneau de 24 segments carrés arrondis (comme sur un Nokia), relief gris en bas et à droite, joints noirs. LE CORPS NE BOUGE PAS.
- La TÊTE avance autour de l'anneau (un demi-segment par image) : elle croque les segments devant elle, ils repoussent derrière elle. Tête ronde à deux gros yeux noirs à reflet
  (Google Snake). La gueule s'ouvre une image sur deux (CLAC) sur une grande bouche noire et deux rangées de dents en triangle ; des miettes jaillissent à chaque bouchée.
- Les BOULES DE MATIÈRE sont des pommes avalées (renflement blanc, cœur gris) : elles sortent de dessous la tête, font le tour du corps à contre-sens et se font avaler.
  Une pomme (l'icône de Google Snake) trône au centre de l'anneau et scintille.
- 3 tons (noir, blanc, gris). Aucun JS, aucune image externe : un bloc CSS de 7 Ko, affiché ×2 (158 px, pixels nets sur iPhone).

## Pourquoi cette forme (les essais refusés)
1. Serpent « vivant » (anneau lisse, tête de reptile) : d'abord tête fixe (« on ne le voit pas tourner »), puis tout qui tourne comme une roue (« son corps ne doit pas tourner »),
   puis tête qui orbite avec visage fin : « bizarre ». Une tête de reptile en rotation au pixel est illisible. 2. Retenu : le vocabulaire visuel de Snake, où la tête avance par
   quarts de tour EXACTS (aucun pixel déformé), le corps est une chaîne de carrés, et ce qui est mangé est une pomme.

## Les fichiers
- `ouroboros.cjs` — LE GÉNÉRATEUR. `node outils/ouroboros/ouroboros.cjs` régénère tout le reste. Réglages en tête de fichier (`N`, `P` pas des segments, `STEP`, `WIN` fenêtre de la tête) ;
  `headMatrix()` dessine la tête, `render(t)` une image. Pour retoucher le dessin : modifier ce fichier, jamais le PNG.
- `ouroboros-79px-48img.png` — la bande : 48 images de 79 × 79 px côte à côte (PNG à 2 bits par pixel, 5 Ko).
- `ouroboros.css` — le bloc CSS pur (`#spCharge`, la bande en data-URL, `steps(48)` sur un `transform` : le compositeur le joue même quand le script du jeu est occupé à construire la scène).
- `demo.html` — la démo seule sur fond noir (`?zoom=3` pour voir les pixels ; à servir depuis la racine du dépôt pour retrouver la police).
- `planche-16-images.png`, `tete-4-images.png` — des aperçus pour l'œil humain. `png.cjs` — l'encodeur PNG (aucune dépendance).

## Où c'est branché dans le jeu
`code/page/ecrans-garage.html`, dans `<div id="splash">` : le `<style>` qui suit le commentaire « LE CHARGEMENT » = le contenu de `ouroboros.css`.
L'élément garde l'id `spCharge` : `chCl()` dans `code/moteur/intro-161.js` le fond en opacité puis le retire quand la boule de l'intro se dessine.
Pour mettre à jour après une retouche : régénérer, recoller le contenu de `ouroboros.css` à la place du `<style>`, `node code/assembler.cjs`, incrémenter `cashcar-vNNN` dans `VERSION PRINCIPALE/sw.js`.
