# L'OUROBOROS DU CHARGEMENT

Demande de Sacha (03/11/2026) : « un mini Ouroboros pixel, mignon, noir et blanc, qui se mord la queue en boucle pendant le
chargement ; animation simple, pas de ressources, mais très belle », puis : « un air plus malicieux, et qu'on le voie tourner
et se manger son propre corps en boucle ». Dessin et animation : Fable 5.1.

## Ce que fait l'animation (boucle de 3 s, 48 images à 16 images/s)
- Un serpent blanc à grosse tête, posé en anneau, la tête au-dessus qui mord sa propre queue ; la queue s'effile jusque dans la gueule.
- Il TOURNE sans bouger : les écailles (carrés noirs) et les tirets gris du ventre filent le long du corps vers la gueule ; ils rapetissent
  sur la queue amincie, comme digérés.
- Il SE MANGE : toutes les 1,5 s une bosse de corps voyage du cou à la gueule, la mâchoire grande ouverte la guette, CLAC (la tête plonge
  d'un pixel, des miettes jaillissent).
- Malicieux : œil rond à paupière lourde et reflet, sourcil en pente (qui se lève une fois par tour), sourire en coin, petite dent,
  joue rose, un clignement par tour, trois étincelles qui scintillent autour.
- 3 tons seulement (noir, blanc, gris). Aucun JS, aucune image externe : un bloc CSS de 5,7 Ko.

## Les fichiers
- `ouroboros.cjs` — LE GÉNÉRATEUR. `node outils/ouroboros/ouroboros.cjs` régénère tout le reste. La tête est dessinée à la main (`BASE`, `sprite()`),
  le corps, la queue, les écailles, les bosses et les étincelles sont calculés. Pour retoucher le dessin : modifier ce fichier, jamais le PNG.
- `ouroboros-56px-48img.png` — la bande : 48 images de 56 × 56 px côte à côte (2688 × 56).
- `ouroboros.css` — le bloc CSS pur (`#spCharge`, la bande en data-URL, `steps(48)` sur un `transform` : le compositeur le joue même quand le script
  du jeu est occupé à construire la scène, comme l'ancien anneau de Léo). Affiché ×2 (112 px) : pixels nets sur iPhone (×3 d'écran = 6 px par pixel).
- `demo.html` — la démo seule sur fond noir (`?zoom=4` pour voir les pixels ; à servir depuis la racine du dépôt pour retrouver la police).
- `planche-16-images.png`, `tete-4-images.png` — des aperçus pour l'œil humain. `png.cjs` — l'encodeur PNG (aucune dépendance).

## Où c'est branché dans le jeu
`code/page/ecrans-garage.html`, dans `<div id="splash">` : le `<style>` qui suit le commentaire « LE CHARGEMENT » = le contenu de `ouroboros.css`.
L'élément garde l'id `spCharge` : `chCl()` dans `code/moteur/intro-161.js` le fond en opacité puis le retire quand la boule de l'intro se dessine.
Pour mettre à jour après une retouche du dessin : régénérer, recoller le contenu de `ouroboros.css` à la place du `<style>`, `node code/assembler.cjs`,
incrémenter `cashcar-vNNN` dans `VERSION PRINCIPALE/sw.js`.
