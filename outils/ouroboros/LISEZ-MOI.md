# L'OUROBOROS DU CHARGEMENT

Demande de Sacha (03/11/2026) : « un mini Ouroboros pixel, mignon, noir et blanc, qui se mord la queue en boucle pendant le
chargement ; animation simple, pas de ressources, mais très belle ». Puis, après trois essais refusés : « son corps ne doit pas tourner :
c'est sa TÊTE qui avance autour de son corps en le mangeant ; le corps se nourrit de boules de matière qui passent et qu'il avale ;
le seul truc animé, c'est sa tête qui tourne autour de son corps ». Dessin et animation : Fable 5.1.

## Ce que fait l'animation (boucle de 2,4 s, 48 images à 20 images/s)
- LE CORPS NE TOURNE PAS : un anneau fixe, des écailles (carrés noirs) fixes à l'écran.
- LA TÊTE FAIT LE TOUR DU CORPS (un tour par boucle, sens horaire) en le mangeant : devant sa gueule la queue s'effile jusque dans ses dents, les écailles rapetissent
  et disparaissent (croquées) ; derrière elle le corps reprend son épaisseur et les écailles reviennent.
- LES BOULES DE MATIÈRE : des disques gris qui passent dans le corps, du cou jusqu'à la gueule ; elle les guette grande ouverte, CLAC (la mâchoire se referme,
  la tête plonge d'un pixel, des miettes jaillissent). Une boule avalée toutes les 0,6 s, deux visibles à la fois.
- Malicieux : œil rond mi-clos à paupière en pente et reflet, sourire en coin, joue rose, un sourcil qui se lève et un clignement par tour, et des DENTS : deux gros crocs en haut, une dent en bas (dessinés à la main pour chaque état de la gueule, `GUEULE`).
  Trois étincelles scintillent autour. 3 tons seulement (noir, blanc, gris). Aucun JS, aucune image externe : un bloc CSS de 9 Ko.

## Pourquoi cette forme (les essais refusés)
1. Tête fixe, matière qui file sur le corps : « on ne le voit pas tourner ». 2. Tout le serpent qui tourne comme une roue, écailles comprises : « son corps ne doit pas tourner ».
3. Retenu : le corps fixe, la tête qui orbite. Une tête dessinée à 8 orientations (45°) était illisible ; la tête est donc UNE silhouette dessinée à la main, tournée par
échantillonnage (4 × 4 sous-pixels par pixel), avec un visage fait de FORMES épaisses (≥ 1,3 px, `face()`) : les traits d'un pixel ne survivent pas à la rotation.

## Les fichiers
- `ouroboros.cjs` — LE GÉNÉRATEUR. `node outils/ouroboros/ouroboros.cjs` régénère tout le reste. La silhouette de la tête est dessinée à la main (`BASE`, `sprite()`),
  le visage (`face()`), le corps, la queue, les écailles, les boules et les étincelles sont calculés. Pour retoucher le dessin : modifier ce fichier, jamais le PNG.
- `ouroboros-64px-48img.png` — la bande : 48 images de 64 × 64 px côte à côte (3072 × 64, PNG à 2 bits par pixel, 6 Ko).
- `ouroboros.css` — le bloc CSS pur (`#spCharge`, la bande en data-URL, `steps(48)` sur un `transform` : le compositeur le joue même quand le script
  du jeu est occupé à construire la scène, comme l'ancien anneau de Léo). Affiché ×2 (128 px) : pixels nets sur iPhone (×3 d'écran = 6 px par pixel).
- `demo.html` — la démo seule sur fond noir (`?zoom=3` pour voir les pixels ; à servir depuis la racine du dépôt pour retrouver la police).
- `planche-16-images.png`, `tete-6-angles.png` — des aperçus pour l'œil humain. `png.cjs` — l'encodeur PNG (aucune dépendance).

## Où c'est branché dans le jeu
`code/page/ecrans-garage.html`, dans `<div id="splash">` : le `<style>` qui suit le commentaire « LE CHARGEMENT » = le contenu de `ouroboros.css`.
L'élément garde l'id `spCharge` : `chCl()` dans `code/moteur/intro-161.js` le fond en opacité puis le retire quand la boule de l'intro se dessine.
Pour mettre à jour après une retouche du dessin : régénérer, recoller le contenu de `ouroboros.css` à la place du `<style>`, `node code/assembler.cjs`,
incrémenter `cashcar-vNNN` dans `VERSION PRINCIPALE/sw.js`.
