# LA SÉANCE DE DÉBOGAGE DES MAPS — 2e vague (2026-10-22, session DEBUGGING de Sacha) — consigne commune

Sacha (propriétaire du jeu, pas développeur, écrit en français) a demandé : « lance une immense session de debugging surtout centré sur
les maps […] qu'il n'y ait aucun bug ». Une 1re vague (18-19/10) a déjà corrigé la ville, le volcan, la forêt, le canyon, les nuages,
Crypto City, le glacier. Tu es un agent de la 2e vague, avec UN périmètre. Ton travail : TROUVER les vrais bugs de ton périmètre, les
PROUVER, écrire un CORRECTIF minimal, le VÉRIFIER, le RENDRE. Tu ne publies rien : l'agent principal fusionne, vérifie et commit.

## Le jeu et la base
- CASH CAR : runner arcade 3D (three.js r128) pour téléphone. Le navigateur charge `VERSION PRINCIPALE/index.html`, qui est la
  CONCATÉNATION EXACTE des morceaux de `code/` listés dans `code/ORDRE.txt` (le JS est UNE IIFE ; les noms se voient d'un morceau à
  l'autre). Pour lire le code : `grep -n` dans `code/` (ORDRE.txt dit ce que contient chaque morceau) ou dans index.html.
- La BASE de tout ton travail : le commit `c7b96b44`, dans le worktree LECTURE SEULE `/Users/sachaberes/cash-car/debug-maps/`.
- À lire d'abord : `/Users/sachaberes/cash-car/debug-maps/CLAUDE.md` (court). `GUIDE-COMPLET.md` (racine) seulement pour un point
  précis (règles §4, pièges §7). Le journal des chantiers : `VERSION PRINCIPALE/JOURNAL.md` (énorme : `grep -n "^## " … | head -80`,
  puis lire SEULEMENT les sections de ton périmètre).

## Règles ABSOLUES
1. Tu n'écris RIEN dans `/Users/sachaberes/cash-car/` SAUF dans ton dossier `$W` = `/Users/sachaberes/cash-car/debug-maps/.banc-debug/agents/<ton-nom>/`.
   Pas de `git commit/checkout/stash/reset/push/merge/worktree/add`. Git en LECTURE seulement.
2. LE MAC EST PARTAGÉ et a déjà redémarré sous la charge : UN SEUL Chrome de banc à la fois sur TOUTE la machine. Tu ne lances JAMAIS
   Chrome, un serveur http ou un banc autrement que par `banc.mjs` (il prend le VERROU COMMUN, attend son tour, coupe à 9 min, tue tout
   en sortant). Pas de playwright, pas de puppeteer, pas de photos.py.
3. ÉCONOMIE (la séance a déjà épuisé la limite d'usage deux fois) : lis par extraits CIBLÉS (`grep -n`, puis `sed -n a,bp | cut -c1-300`),
   jamais des milliers de lignes ; vise ton rapport en ≤ 50 appels d'outils ; regroupe tes essais dans un MÊME fichier de scénarios
   (un appel de banc = plusieurs scénarios) : 3 à 5 appels de banc au total.
4. Ce qui N'EST PAS un bug (ne pas « corriger ») : les verdicts du §4 de GUIDE-COMPLET.md (zéro assistance de conduite : pouce lâché la caisse
   sort dans les virages ; maps hors tirage — Paris, ville vitrée ; etc.), un choix de design, une couleur, un équilibre. Pas de
   fonctionnalité neuve, pas de refonte, pas de nettoyage. Le BURN-OUT du garage est à Léo. Le logo et la police pixel non plus.
   En cas de doute : section « à trancher » du rapport.
5. Ce qui EST un bug : exception / `__loopErr` / `window.__xxxErr` posé, NaN, caisse bloquée, chute sans fin, route trouée ou qui se
   traverse, mur invisible (mort contre rien de visible), décor qui transperce la route ou la caméra, pièces inaccessibles, portail
   injoignable, état d'une map qui FUIT dans la suivante, fuite mémoire (géométries/textures qui montent sans redescendre au fil des
   portails), shader refusé, programme compilé EN COURSE (⚠ mesure-le APRÈS la chauffe du menu : scénario `"attente":1`, sinon c'est un
   faux positif), zone morte const/let avalée par un try/catch, `//` au milieu d'une ligne qui avale du code, hasard `rnd()` consommé de
   travers, condition toujours vraie/fausse, faute de frappe sur une propriété, `dispose` oublié, minuterie jamais arrêtée…
   Lis le CODE avec un œil de relecteur sévère : beaucoup de bugs ne se voient pas au banc.
6. Une mort au pilote automatique n'est un bug que si rien de visible ne la justifie (photo) ou si la route/le décor est fautif.
   Les FPS du banc ne valent rien.

## Les outils (dans `/Users/sachaberes/cash-car/debug-maps/.banc-debug/`, noté `$B`)
- `sh $B/copie.sh $W/jeu` : ta copie de test (index.html de c7b96b44 COPIÉ, à patcher ; le reste en liens symboliques, LECTURE SEULE :
  n'écris jamais à travers un lien). Tu peux y ajouter des crochets `window.dbgXxx` (hors correctif).
- `node $B/applique.mjs <index.html> <correctif.json> [--sec]` : applique `[{"old","new","pourquoi"}]` (chaque `old` UNIQUE, sinon refus).
- `node $B/chk.cjs <index.html>` : compile chaque <script> (syntaxe + doublons de const) — doit dire « 0 en erreur ».
- `node $B/banc.mjs --jeu $W/jeu --scen $W/scen.json --http <port> --cdp <port> --qui "<ton-nom>" [--out $W/r.json] [--shots $W/photos]`
  (timeout Bash 600000). scen.json = une LISTE de scénarios :
  `{"nom","carte","meteo","teinte","secs":20,"vue":"plein|tel|debout","attente":1,"auto":{"lat":0,"gl":false,"vol":false,"saut":0},
    "chaine":"ville:pluie:vert,espace:midi","params":"pistegraine=1234&x=1","eval":"<js>","evalFin":"<js>","sonde":"<js>","shotsAt":[5,15]}`
  Le vrai jeu, MUET, sauvegarde muette (auto-école passée), JOUER cliqué, pilote automatique `dbgAuto` ; un échantillon par seconde
  (mode, s/L, map, météo, programmes, géométries, `__loopErr`), alertes (arrêtée, chute sans fin, NaN), MORTS (texte de l'écran de fin),
  erreurs et avertissements de la console. `chaine` impose la map suivante (`dbgClassique`) puis amène la caisse au VRAI portail
  (`dbgPortail(320)`). `?pistegraine=n` = la MÊME piste à chaque chargement (comparer avant/après). Dans eval/evalFin/sonde, `G` = la
  fenêtre du jeu. Une photo nette d'un cadrage choisi : dans UN MÊME eval, poser la vue (ex. `G.dbgView(a,d,h)`) puis rendre
  `G.dbgScene().rdr.domElement.toDataURL('image/jpeg',.8)` (le banc écrit l'eval dans --out ; à toi d'en tirer le jpeg avec node).
  Regarde les photos avec l'outil Read.
- Crochets utiles : `dbgState()`, `dbgAuto(1,lat,{vol,nit,saut,gl})`, `dbgClassique(carte,meteo,teinte)`, `dbgSaut()`, `dbgPortail(d)`,
  `dbgTrace()`, `dbgDuree()`, `dbgMoteur()`, `dbgPrebati()`, `dbgProgs()`, `dbgScene()`, `dbgNiveau()`, `dbgEco()`, `dbgView(a,d,h)`.

## Le correctif que tu rends
- `$W/correctif.json`, qui s'applique PROPREMENT à l'index.html de c7b96b44 (`git -C /Users/sachaberes/cash-car/debug-maps show
  c7b96b44:"VERSION PRINCIPALE/index.html" > $W/ref.html && node $B/applique.mjs $W/ref.html $W/correctif.json --sec`).
- Des `old` COURTS mais uniques (une ligne ou un fragment), qui ne chevauchent pas une frontière de morceau.
- Le style : compact, commentaires en FRANÇAIS qui disent POURQUOI, datés et signés `(2026-10-22, DEBUGGING : …)` ; au MILIEU d'une
  ligne `/* … */`, jamais `//`. Rien d'alloué dans la boucle ; aucune lumière three neuve ; aucune matière neuve en course ; un tirage
  aléatoire neuf dans la génération prend son PROPRE flux.
- Ne touche ni `sw.js`, ni `JOURNAL.md`, ni les CLAUDE.md / GUIDE.
- Chaque correction est VÉRIFIÉE : syntaxe + banc AVANT (le bug se voit) / APRÈS (disparu, rien d'autre n'a bougé).

## Ton rapport final (ta dernière réponse, en français, CONCIS)
1. Ce que tu as couvert. 2. Les BUGS CORRIGÉS (gravité, où, symptôme, PREUVE chiffrée ou photo, cause par noms de fonctions, indices dans
correctif.json, avant → après). 3. Trouvés NON corrigés (+ correction proposée). 4. À TRANCHER par Sacha/Léo. 5. Le chemin de
correctif.json et le résultat de `applique.mjs --sec` sur la référence.
