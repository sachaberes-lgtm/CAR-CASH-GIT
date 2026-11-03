# L'OUROBOROS DU CHARGEMENT

Demande de Sacha (03/11/2026) : « un mini Ouroboros pixel, mignon, noir et blanc, qui se mord la queue en boucle pendant le
chargement ; animation simple, pas de ressources, mais très belle », puis : « un air plus malicieux », puis, deux fois : « il faut qu'on le
voie TOURNER en se mangeant lui-même ». Dessin et animation : Fable 5.1.

## Ce que fait l'animation (boucle de 2,4 s, 48 images à 20 images/s)
- TOUT LE SERPENT TOURNE comme une roue, tête comprise : un tour complet par boucle (7,5° par image), la tête en avant, qui rattrape sa propre queue.
  C'est un spinner de chargement : il tourne d'abord, et le reste (le visage, les bouchées) vit dessus.
- Il SE MANGE : une bosse de corps voyage du cou à la gueule toutes les 1,2 s, la gueule grande ouverte la guette, CLAC (la mâchoire se referme, la tête plonge
  d'un pixel, des miettes jaillissent). Les écailles (carrés noirs) tournent avec le corps et glissent vers la gueule en rapetissant sur la queue amincie,
  comme digérées ; les tirets gris du ventre filent aussi.
- Malicieux : œil rond mi-clos à paupière lourde et reflet, sourire en coin, petite dent, joue rose, un sourcil qui se lève une fois par tour, un clignement.
  Trois étincelles scintillent autour (fixes à l'écran, pour que la rotation se voie).
- 3 tons seulement (noir, blanc, gris). Aucun JS, aucune image externe : un bloc CSS de 10 Ko.

## Pourquoi tout tourne (et pas seulement la matière)
Une première version gardait la tête fixe et faisait seulement filer les écailles : Sacha l'a refusée (« on ne le voit pas tourner »). Une autre essayait des têtes
dessinées à 8 orientations : au pixel, le visage devenait illisible. Retenu : une seule tête dessinée à la main, tournée par échantillonnage (4 × 4 sous-pixels par pixel),
avec un visage fait de FORMES épaisses (≥ 1,3 px, voir `face()`) qui restent lisibles à tous les angles. Les traits fins d'un pixel ne survivent pas à la rotation.

## Les fichiers
- `ouroboros.cjs` — LE GÉNÉRATEUR. `node outils/ouroboros/ouroboros.cjs` régénère tout le reste. La silhouette de la tête est dessinée à la main (`BASE`, `sprite()`),
  le visage (`face()`), le corps, la queue, les écailles, les bosses et les étincelles sont calculés. Pour retoucher le dessin : modifier ce fichier, jamais le PNG.
- `ouroboros-64px-48img.png` — la bande : 48 images de 64 × 64 px côte à côte (3072 × 64, PNG à 2 bits par pixel, 7 Ko).
- `ouroboros.css` — le bloc CSS pur (`#spCharge`, la bande en data-URL, `steps(48)` sur un `transform` : le compositeur le joue même quand le script
  du jeu est occupé à construire la scène, comme l'ancien anneau de Léo). Affiché ×2 (128 px) : pixels nets sur iPhone (×3 d'écran = 6 px par pixel).
- `demo.html` — la démo seule sur fond noir (`?zoom=3` pour voir les pixels ; à servir depuis la racine du dépôt pour retrouver la police).
- `planche-16-images.png`, `tete-6-angles.png` — des aperçus pour l'œil humain. `png.cjs` — l'encodeur PNG (aucune dépendance).

## Où c'est branché dans le jeu
`code/page/ecrans-garage.html`, dans `<div id="splash">` : le `<style>` qui suit le commentaire « LE CHARGEMENT » = le contenu de `ouroboros.css`.
L'élément garde l'id `spCharge` : `chCl()` dans `code/moteur/intro-161.js` le fond en opacité puis le retire quand la boule de l'intro se dessine.
Pour mettre à jour après une retouche du dessin : régénérer, recoller le contenu de `ouroboros.css` à la place du `<style>`, `node code/assembler.cjs`,
incrémenter `cashcar-vNNN` dans `VERSION PRINCIPALE/sw.js`.
