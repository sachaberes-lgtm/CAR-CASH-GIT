# MAPS PRO — l'intégration (2026-11-15, cache v1597)

Six branches réunies sur `origin/main` v1596 (545a4722), dans cet ordre : canyon, grotte, nuages, jade, ville, espace
(`pro/<map>-2026-11-14`), puis une seule montée de cache (v1597). Sacha a arrêté la boucle d'amélioration le 15/11
(« ça suffit, finis proprement et push ») : ce qui est ici est l'état de la passe 2 de chaque map (plus un tour pour le canyon).
Le détail de chaque map est dans `passation/MAPS-PRO-<MAP>.md`.

## Conflits
Un seul dans `code/` : `moteur/piste-prebati.js` (ville + espace), résolu en gardant les deux
(`pisteMoysOn` réunit `VILLE_MOYS` et `ORB_LODS.moys&&pisteOrbOn()`). `ville-entree.js` et `route-sans-haut.js`
(touchés par ville et espace) se sont fusionnés seuls ; chaque ligne ajoutée par les deux branches s'y retrouve.

## Contrôles (huit agents indépendants, 15/11)
- Fusions : six têtes ancêtres de HEAD, remerge-diff relu, aucun marqueur, `sw.js` ne change que de numéro, aucun fichier
  réservé à la session « qualité par appareil » touché, ni NUL ni CRLF.
- Gardes de `vercel-build.sh` (burnout, charte, allege, demarrage, essai iOS) : vertes, comme sur main. Analyseur des
  non-déclarés : rien de nouveau. Chargement de l'accueil : 0 exception.
- Par map (canyon, ville + crypto, grotte, nuages, espace, jade) : routes identiques à l'octet à celles de la branche seule
  (3 graines, paliers 0/10/20), course headless ordinateur et `?tel=1` sans exception, photos regardées.

## Interrupteurs d'URL (pour comparer)
- Canyon : `?sans=cytex`, `?sans=cylod`, `?sans=cylame`, `?sans=cybornes`, `?sans=cyvoualb`, `?cygrille=N`, `?cyr0=N`.
- Ville : `?sans=villecalme`, `?sans=villeportails`, `?sans=villeraisplus`, `?sans=villemoys`.
- Grotte : `?sans=moinstunnels`, `?sans=budgettube`, `?sans=lueurgagnee`.
- Nuages : `?sans=nupeaupres`, `?sans=nubrume`, `?sans=nuvoileded`.
- Espace : `?orbvir=0`, `?orbsret=0`, `?orbsretg=0`, `?orbrac=0`, `?orbvol=0`, `?orbidx=0`, `?satidx=0`, `?espaces=0`.
- Jade : `?sans=jadeformes`, `?sans=jadejumelles`, `?sans=jadeechelle`, `?jadeb1=verre`.

## Pas vérifié
- Aucun vrai iPhone, aucun vrai Mac. Les gels et les millisecondes (machine de banc chargée) ne sont pas fiables.
- Les courses de contrôle : une graine et une météo par map, pas toujours jusqu'au portail.
- Défauts connus laissés : nuages, fines lignes sombres entre les carreaux à l'approche d'une nappe ; canyon, paroi proche
  en gros carrés au téléphone ; espace, R5 du juge aux paliers 0 et 20.
- Choix visibles que Sacha n'a pas encore jugés en jouant : S retourné de l'espace, tube brun-rouge du canyon,
  lueurs des salles rouvertes de la grotte, voile blanc du dedans des nuages.
- Le travail inachevé de la boucle (non contrôlé, non intégré) est gardé en patchs hors dépôt, sur l'ordinateur Windows.
