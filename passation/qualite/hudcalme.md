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
- **Sortie du calme** (le nitro revient) : *(tour 2)* un objet arrivé pendant le calme **grandit en 0,4 s** au lieu de surgir. Seul le TRÈS proche ne vient plus (`p.cgo`) : moins de 0,5 s de route à la vitesse du moment, borné entre 60 et 150 m (`CALG_PRES`). Plus de demi-portée vide.
- Une route neuve posée hors calme (nouvelle partie) remet la garde à zéro (`calgRaz` dans `resetGame` et `start`).

## Tour 2 (après le contrôle adverse, 15/11)
- **Le calme de la garde (`CALG.on`)** est séparé du HUD calme. Il tombe avec le HUD calme. Il ne se lève qu'au **nitro repris en course** (ou au vol critique qui rallume le HUD). Une pause, l'écran de mort, une réanimation, le 3-2-1 et les 0,9 s sans nitro après la reprise ne le lèvent pas : **rien n'est jeté, on retrouve l'état d'avant la pause**.
- **Retours cohérents** : un pouvoir pris au calme (parce qu'il était déjà là) montre son retour comme un fruit (secousse, éclat, gerbe ; `pwrPrend`). `?sans=calmegarde` le rend muet comme avant. Le jeton du final spin n'avait déjà rien de caché (son toast passe toujours, `economie/` non touché).
- **Portail au calme** : la zone neuve reste cachée jusqu'au nitro, puis se remplit (seul le très proche est perdu).
- Fichiers en plus : `code/gameplay/seconde-chance.js` (`calgRaz`). Compteurs de banc `CALG.ret` (fruit/pouvoir pris au calme, muet ou montré).

Fichiers : `code/moteur/cadence.js` (état `CALG`, `calmeCache`, crochets `dbgCalmeGarde()` et `dbgCalmeSuivi()`), `code/moteur/boucle-4-effets.js` (photo d'entrée, décision de sortie, apparition qui grandit), `code/gameplay/ramassage.js` (prise), `code/gameplay/pouvoirs-grisants.js` (remise à zéro dans spawnPickups).

## Vérifié (tour 2)
Banc `outils/banc-hud/calme-garde.cjs` refait : course `?tel=1`, sans son, image par image (`dbgStep`). Cinq étapes : nitro, calme, **pause en plein calme**, **portail franchi au calme**, sortie. Trois passages, tous « TOUT EST BON » :
- **Debout 390×844** : fruits et pouvoirs déjà là pris au calme avec leur retour (`ret` f1=2, p1=1, f0=0, p0=0). Pause de 2 s puis 1,5 s sans nitro : la garde reste calme, même photo (id 1→1), **perdus 0**, G (posé au calme à 380 m) jamais montré ni jeté, le HUD calme revient seul. Portail : route neuve, Z (posé à 600 m) roule jusqu'à 236 m **sans jamais se montrer**, 0 objet neuf visible. Sortie à 188 u/s : seuil du très proche **94 m** ; P1 (21 m) perdu ; P2 (196 m) et P3 (446 m) **grandissent** (échelle 0,78 à 6 images, 1 à 12 images) ; plus rien de caché au-delà du très proche (`cachesLoin` 0).
- **Couché 844×390** : mêmes résultats (seuil 85 m à 171 u/s, P3 0,68 → 1,1 en 12 images).
- **`?sans=calmegarde`** : B s'efface et n'est pas pris, aucun retour compté : l'ancien comportement.
- Assemblage `--depuis-morceaux` OK. Syntaxe : seul le script n° 5 signalé, comme sur HEAD (faux positif connu).

Photos du tour 2 : `passation/qualite/photos/hudcalme/t2-hc-*` (3a pause, 4 zone neuve, 5 sortie). Les objets sont petits : les chiffres font foi.

## Non vérifié
- Rien n'a été testé sur un vrai iPhone ni dans l'app.
- La mort en plein calme puis une réanimation : même chemin que la pause d'après le code (hors course), pas filmé.
- Le retour du pouvoir au calme se lit dans les compteurs ; à l'image, l'éclat d'écran reste coupé au calme pour tous (`flashEcran`), et la gerbe peut être retirée par le rendu net (PNET).
- Les objets perdus à la sortie (très proche) le restent pour la partie.

## À trancher par Sacha
1. Faut-il que les **pièces** cessent elles aussi d'apparaître au calme ? Aujourd'hui elles continuent.
2. *(tranché au tour 2 : tout grandit sauf le très proche)*
3. Le fruit pris au calme montre de nouveau son croc et son jus. Le lot « particules » de la même demande peut les retirer.
