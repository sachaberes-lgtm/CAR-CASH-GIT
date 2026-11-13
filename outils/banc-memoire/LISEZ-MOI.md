# Banc de la mémoire (ios-aide, 13/11)

Mesure ce que la page pèse VRAIMENT dans WebKit (le moteur de l'iPhone, sans fenêtre, muet) et ce qui la remplit.

- `node outils/banc-memoire/memoire.cjs [--pile 1] [--http 9891] [--cmd 9894]` : sert le jeu de CE dossier, pose `inventaire.js` avant le jeu.
  `--pile 1` note la fonction du jeu qui a créé chaque géométrie, toile ou tampon audio (plus lent, banc seulement).
- `curl -s 'localhost:9894/accueil?q=carte=nuages%26meteo=midi'` : (re)charge jusqu'à l'accueil (`?tel=1&palier=2` d'office).
- `curl -s 'localhost:9894/mem?gc=1&o=%7Btop:30%7D'` : empreinte des processus WebContent et GPU (`footprint` : phys_footprint, ce que
  jetsam compte sur iOS, avec ses catégories) + `__memInv()` : octets des tableaux JS des géométries vivantes (dans la scène ou non, par
  créateur), toiles 2D, tampons audio, ImageBitmap. `gc=1` lance d'abord l'alerte mémoire de WebKit (`notifyutil -p org.WebKit.lowMemory` :
  ramasse-miettes complet + caches vidés, comme iOS près de sa limite) : sans elle on compte aussi les déchets pas encore ramassés.
- `curl -s --data-binary 'expr' localhost:9894/ev` : évalue du JS (crochets `dbg*` du jeu) ; `/erreurs` ; `/fin` ferme tout.

Lecture : la page monte de ~880 Mo à 1,5 Go en 7 portails puis retombe à ~450-530 Mo vivants après ramasse-miettes (Mac). Le pic suit la taille
VIVANTE (le ramasse-miettes laisse grossir le tas jusqu'à ~2× avant de passer) : chaque Mo vivant en moins en retire ~2 au pic.
Une mesure de `footprint` varie de ±100 Mo d'un passage à l'autre (l'allocateur rend la mémoire quand il veut) : comparer les octets de
l'inventaire et les compteurs du jeu, pas une empreinte seule. Un seul navigateur de banc à la fois sur le Mac.
