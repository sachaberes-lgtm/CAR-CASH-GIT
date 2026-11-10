# LE PLAN DE FEU — passe lumière du 10/11/2026 (branche `lumiere-max`, PAS sur main)

Demande de Sacha : « light designer senior […] le jeu magnifique, même DA, encore mieux, qui marche bien sur téléphone, sans que ce soit plus lourd ».

## Ce qui est fait
- `code/rendu/lumiere-design.js` (après `equilibre-maps.js` dans ORDRE.txt) : la table `PLAN_FEU`, des retouches d'ambiance — que des valeurs
  (`rtK`, `rtT`, `kickI`, `rimS`, `sunC`), zéro programme, zéro texture, zéro lumière de plus. `?lumiere=0` = l'image d'avant. `dbgLumiere(nom,{…})` à chaud.
- L'idée : L'ÉCHELLE DES CLARTÉS. Sur l'iPhone la route de nuit sortait en dalle lavande claire (L* 47-67), plus claire que tout le reste ; elle recule
  (plus sombre, bleu nuit), le contre-jour rose et le liseré de la caisse montent. Touchés : canyon nuit et soir, orbite, les cinq temps de la grotte,
  soir de Jade ; à midi sur les nuages la route remonte (elle sortait presque noire) et la clé se réchauffe.
- `code/rendu/triptyque-bloom.js` : `ACES_VIF` — sur le vrai téléphone, l'ACES par canal (calculé à chaque pixel puis multiplié par 0, `uVivid` = 1 partout)
  sort du shader final. Même image, un peu moins de calcul. L'ordinateur garde le programme d'avant.
- Planches avant/après (chemin iPhone, portrait) : `passation/lumiere/avant-apres-1.jpg` et `-2.jpg` (les positions de route sont au hasard d'une photo à l'autre).

## Les outils (outils/banc-lumiere/)
- `photos.py` : le banc photo, `TEL=portrait` émule un VRAI téléphone (tactile + écran < 600 → `TEL_NATIF`, leviers d'image de l'iPhone ; `?tel=1` n'est PAS ce chemin).
- `studio.py <carte>:<meteo> essais.json` : fige UNE image du jeu et y pose plusieurs réglages côte à côte (planche + mesures L*/chroma). Entre deux essais
  il avance de 4 images (`dbgStep`) : la brume, la mer et le ciel sont posés par la boucle, pas par `bioApply`.
- `planche.py <dossier avant> <dossier après>`.

## Non fait / à savoir
- Rien n'est vérifié sur le 13 Pro : jugé sur Chrome en émulation téléphone. Le coût n'a pas été mesuré (il ne peut que baisser : des nombres + un calcul retiré).
- Le ciel des nuages à midi (voile gris-vert + bande jaune vers l'horizon, sur certaines vues) : les champs jZen/jHor/jSol/fog le bougent peu ; pas résolu.
- Non touchées (jugées bonnes) : ville, nuits et orages de Jade, pluies, nuages soir/nuit, crypto, matins.
- Le kick éclaire AUSSI la route : au-delà de ×1,5 le béton vire au violet.
