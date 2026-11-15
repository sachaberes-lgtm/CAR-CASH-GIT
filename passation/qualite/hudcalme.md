# LOT « HUD CALME » : la garde du calme (15/11)

Demande de Sacha : « Le mode HUD calme fait disparaître les fruits devant. On veut pas qu'ils disparaissent. Il faut que les fruits ARRÊTENT D'APPARAÎTRE : ils arrêtent d'apparaître, mais ceux qui sont déjà là, tu les ramasses. »

## Ce que « fruits » voulait dire
Ce sont **les vrais fruits du jeu** : les fruits de nitro (`p.nitro`, la myrtille, la pomme, le melon… et ceux de la file de la ligne parfaite).
Avant ce lot, le HUD calme cachait trois sortes d'objets **et** les rendait impossibles à prendre (boucle-4-effets.js et ramassage.js, depuis le 13/11) :
- les fruits de nitro,
- les pouvoirs (`p.pow`, les cristaux),
- les jetons du final spin (`p.spin`).

Les pièces n'étaient plus concernées depuis le 14/11 : elles restent visibles et se ramassent au calme. **Je n'y ai pas touché** : elles continuent d'apparaître au calme. Autre lecture possible : « fruits » = tout ce qui se ramasse, pièces comprises. Je ne l'ai pas codée (à trancher, voir plus bas).

## Ce qui change (interrupteur `?sans=calmegarde` = comme avant)
- **Entrée du calme** : tout fruit, pouvoir ou jeton déjà dans le couloir de vue (620 m + la vitesse) est « photographié » (`p.cok`). Il **reste** à l'écran et **se ramasse normalement**. Le fruit garde son croc, son jus et son coup de reins (avant, au calme, il était pris sans rien montrer).
- **Pendant le calme** : plus rien de nouveau n'apparaît. Ni ce qui arrive de l'horizon, ni ce qu'un portail ou la ligne parfaite pose pendant le calme. Ces objets sont cachés et ne se prennent pas.
- **Sortie du calme** (le nitro revient) : un objet arrivé pendant le calme et encore loin devant (au-delà de la moitié du couloir) **grandit en 0,5 s** au lieu de surgir. Un objet arrivé trop près ne vient plus (`p.cgo`). Donc pas de paquet qui apparaît d'un coup sous le nez. La contrepartie : juste après la sortie, la route est vide sur une demi-portée de vue (environ 1 s à grande vitesse), puis le flux normal reprend.
- Une route neuve posée hors calme (nouvelle partie) remet la garde à zéro.

Fichiers : `code/moteur/cadence.js` (état `CALG`, `calmeCache`, crochets `dbgCalmeGarde()` et `dbgCalmeSuivi()`), `code/moteur/boucle-4-effets.js` (photo d'entrée, décision de sortie, apparition qui grandit), `code/gameplay/ramassage.js` (prise), `code/gameplay/pouvoirs-grisants.js` (remise à zéro dans spawnPickups).

## Vérifié
Banc `outils/banc-hud/calme-garde.cjs` : course `?tel=1`, sans son, filmée image par image avec `dbgStep`. Trois passages, tous « TOUT EST BON » :
- **Debout 390×844** : A (pouvoir à 90 m), B (à 260 m) et le fruit F de la route sont présents à l'entrée du calme. Ils restent visibles et **sont pris pendant le calme**. C, posé pendant le calme à 120 m, n'est **jamais visible ni pris** (la caisse passe dessus). D, posé pendant le calme à 1 250 m, reste caché. À la sortie, D grandit (échelle 0,63 → 0,92 → 1 en 12 images), puis vit normalement. C ne surgit pas. Aucune exception.
- **Couché 844×390** : mêmes résultats.
- **`?sans=calmegarde`** : B s'efface au calme et n'est pas pris. C'est bien l'ancien comportement.
- Assemblage `--depuis-morceaux` OK. Syntaxe du grand script OK (le seul script signalé, n° 5, l'était déjà sur HEAD : un faux positif dans un commentaire).

Photos : `passation/qualite/photos/hudcalme/` (`hc-debout-*`, `hc-couche-*`, `hc-ancien-debout-*` ; 1 nitro, 2a entrée du calme, 2b pendant le calme, 3 sortie). Les objets sont petits à l'image : les chiffres du banc font foi.

## Non vérifié
- Rien n'a été testé sur un vrai iPhone ni dans l'app.
- Un portail franchi pendant le calme n'a pas été filmé. D'après le code, la nouvelle zone reste sans fruits jusqu'à la sortie du calme.
- Pris au calme, le pouvoir garde son armement silencieux de `pwrPrend` : pas de nom, pas d'éclat, pas de gerbe. Je n'y ai pas touché, c'est de l'affichage du HUD.

## À trancher par Sacha
1. Faut-il que les **pièces** cessent elles aussi d'apparaître au calme ? Aujourd'hui elles continuent.
2. À la sortie du calme, faut-il garder la demi-portée vide (rien ne surgit) ou faire grandir aussi les objets proches ?
3. Le fruit pris au calme montre de nouveau son croc et son jus. Le lot « particules » de la même demande peut les retirer.
