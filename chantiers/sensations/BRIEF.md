# CASH CAR — LA PASSE SENSATIONS (2026-10-14) — LES LOIS COMMUNES À TOUS LES AGENTS

Sacha (créateur du jeu, avec Léo), cette nuit : « Change des petits détails **sans changer radicalement le gameplay**. En se
focalisant sur **le fun et les sensations**, rajoute des petits détails : de conduite, de vol, d'animation, des bumps, des
collisions, des explosions, quand tu vas dans l'eau, que tu ressors, la flottaison… que toutes les petites sensations trouvent des
petits détails pour les améliorer. Un jeu parfait, agréable à conduire, à piloter, **vraiment jouissif sur mobile**. »

Tu es UN agent de cette passe, sur UNE zone. `S=/Users/sachaberes/cash-car/sensations` (dossier permanent).

## 0. Le jeu, et comment le lire
- Un seul fichier : `VERSION PRINCIPALE/index.html` — 5,4 Mo, ~52 300 lignes, three.js r128, tout le jeu dans UN grand `<script>`
  (une seule portée : toutes les fonctions se voient). La référence de la passe : `$S/integ/VERSION PRINCIPALE/index.html`
  (**personne ne la modifie**, sauf l'intégrateur).
- ⚠ Ne JAMAIS `cat` le fichier (des lignes font plus de 5 000 caractères). Lire avec l'outil Read (`offset`/`limit`, ≤ 300 lignes à
  la fois) ; chercher avec `grep -n 'motif' "<fichier>" | cut -c1-260`. Cherche par NOM : les numéros de ligne bougent.
- Le guide du jeu `$S/integ/VERSION PRINCIPALE/CLAUDE.md` (800 Ko : toutes les décisions de Sacha et Léo, datées) est déjà dans ton
  contexte au démarrage — sinon `grep -n 'mot-clé' …/CLAUDE.md | cut -c1-300`. **Avant de proposer un détail, cherche-y les mots de
  ta zone** : un commentaire daté qui cite Sacha ou Léo est une DÉCISION, et beaucoup d'idées « évidentes » ont déjà été essayées
  puis REJETÉES (voir §3).
- Où tourne le jeu : **iPhone** (Safari et l'app Capacitor), téléphone COUCHÉ 844×390 et DEBOUT 390×844, au DOIGT (volant analogique
  à gauche, bouton NITRO à droite, gaz automatique). 30, 60 et 120 images/s. C'est ça qu'on soigne ; l'ordi n'est pas la priorité.

## 1. LA LOI N°1 — LE GAMEPLAY EST VERROUILLÉ (depuis le 09/10)
Tu ajoutes du RESSENTI. Tu ne changes RIEN de ce que le jeu calcule :
- INTERDIT de modifier : la trajectoire et la physique (`s`, `lat`, `vA`, `vL`, `psi`, `yawR`, `slipB`, `hopY`, `hopV`, `fallVel`,
  `fallPos`, `side`, `steer`, la position / l'orientation de `carGroup`), les constantes de conduite et de vol (`lacetMax`, `VOL_TAU`,
  `FALL_G`, `SPD`, poussées, traînée, plafonds), les collisions et leurs marges, les règles (mort, pose, bump, drift, pouvoirs),
  les gains (argent, aura, flow, nitro : `nitroGain`, `flowAdd`, `chaineAura`, `money`…), les durées de règle, la génération de piste
  (aucun appel `rnd()` ajouté ou retiré), la caméra (cadrage, recul, champ, caméra de vol, plan de la mort), le HUD et les menus.
- PERMIS (c'est ton terrain) : l'animation VISUELLE de la carrosserie (`carBody`, les roues — par `sensCoup`, voir §2), des
  particules tirées des RÉSERVES EXISTANTES, des sons de la BANQUE EXISTANTE, des vibrations, une petite secousse de caméra par
  l'outil commun. Un détail doit pouvoir être retiré sans que la partie change d'un millimètre.
- Le BURN-OUT du garage est à LÉO (`BURN`, `DON`, `burn*`) : on n'y touche pas. On ne supprime AUCUNE fonctionnalité existante.

## 2. LES OUTILS COMMUNS (déjà dans la référence — sers-t'en, ne les réinvente pas)
- `SENS` (booléen global, `?sens=0` = le jeu d'avant) : **tout ce que tu ajoutes est gardé par `if(SENS)`**. Avec `?sens=0`, pas une
  ligne de ton travail ne doit s'exécuter.
- `sensCoup(versLat, nez, pompe)` : un COUP dans la carrosserie (impulsions sur ses ressorts, au sol seulement). `versLat` en rad/s
  (> 0 = elle penche vers le côté où `lat` est positif ; 1 ≈ 2,5°), `nez` en rad/s (> 0 = le nez plonge, < 0 = il se lève ; 1 ≈ 2,6°),
  `pompe` en m/s (< 0 = elle s'écrase, > 0 = elle se soulève ; −1 ≈ 4 cm). Doses raisonnables : 0,3 à 2,5. Elle encaisse, dépasse à
  peine, se repose toute seule.
- `sensHap(p, force)` : la vibration (motif en ms comme `navigator.vibrate` : `8`, `[10,20,14]`…), force 1 léger · 2 moyen · 3 lourd.
  Un LIMITEUR commun évite le bourdonnement : n'appelle JAMAIS `hap()` en direct pour un détail neuf. Dans l'app, ≤ 12 ms = tap
  léger, ≤ 40 = moyen, au-delà = lourd. Pas de vibration continue ; jamais plus d'une par événement.
- `sensSecoue(k)` : petite secousse de caméra, plafonnée à .4, moitié en vol, coupée sous « Réduire les animations ». Repères : .08
  = un frémissement, .2 = un choc net, .35 = un gros choc. N'écris pas `shake=` toi-même.
- Particules : `spawnP(reserve,x,y,z,vx,vy,vz,vie)` et `sparkBurst(reserve,pos,n,vitesse)` sur les réserves existantes —
  `dust` (poussière), `sparkGold` / `sparkBlue` / `sparkPink` (étincelles), `spray` (eau fine), `foam` (écume), `embers` / `flames` /
  `flameCore` (feu), `smokePool` (fumée charbon), `cloudBits` (ouate), `juicePool`, `ventN` (filets de vent), `boom*` (réservées à
  l'explosion). Une réserve est un ANNEAU de taille fixe (70 à 240) : sur-émettre vole les particules des autres effets — reste
  sobre (quelques-unes par événement, émission continue comptée À LA SECONDE par `emiN('clé',dt)`, jamais « par image »).
- Sons : `sfx('id',{st,vol,t})` — le catalogue des 201 sons existants est dans `$S/SONS.md` (lis-le : famille, description, délai).
  On ne fabrique AUCUN son neuf (pas de `chimeNote` / `noiseBurst` / oscillateur bricolé, pas de recette, pas de cuisson : la session
  DÉTAIL tient l'atelier). Si aucun son ne convient : pas de son, et tu le notes (« son à faire : … ») dans tes notes.
- Déjà fait par l'intégrateur, ne pas refaire : la sensibilité du volant tactile (`VOLANT_PX`, `LOCKU`, `VOL_LIS_D`).

## 3. CE QUI A DÉJÀ ÉTÉ REJETÉ (ne pas y revenir — c'est écrit dans le guide)
- PLUS AUCUN RALENTI ni gel d'image (sauf celui de la frénésie, qui existe) ; pas de hit-stop.
- Aucune lumière ajoutée (`new THREE.PointLight` en course = tout recompile) ; aucune lumière qui peint la route (les « taches rondes »).
- La CAMÉRA DE VOL ne change pas (« la caméra en air time déconne, trop dur de viser ») ; rien ne cache le viseur ni l'endroit où
  l'on se pose ; en vol on VISE : pas de voile, pas de flou en plus, pas d'effet plein écran.
- Rien ne se pose sur la ZONE DE LA ROUTE à l'écran (le jus de fruit v7 l'a dégagée) ; pas de texte au milieu de l'écran (Sacha en a
  fait retirer) ; pas d'emoji ; pas de nouvelle plaque de HUD.
- Pas de fumée ni de gros sprite mou laissé DERRIÈRE la caisse que la caméra de poursuite traverse (voile blanc, « dôme gris »,
  « ballons blancs ») : ce qui naît contre la caisse doit être petit, bref, et filer avec elle ou sur les côtés.
- À très haute vitesse le jeu se CALME (« plané supersonique » : les vibrations fondent passé 350-900 km/h) : n'ajoute pas de
  tremblement qui grandit sans fin avec la vitesse.
- Les nuages ne font QUE bloquer la vue (aucun effet de jeu). Les tremblements tirés au hasard à chaque image grésillent (et vont
  deux fois plus vite à 120 Hz) : du bruit LISSE (sinus), jamais `Math.random()` par image sur une position.

## 4. LA PERFORMANCE (l'iPhone est à la limite — une passe entière a servi à le soulager)
- ZÉRO programme de shader compilé en course : pas de matière ni de géométrie neuve créée pendant la partie. Tu réemploies les
  réserves, les matières et les maillages qui existent. (Une matière neuve devrait être compilée au menu par `chauffeDivers` : évite.)
- ZÉRO allocation dans la boucle : pas de `new THREE.Vector3()`, pas de tableau ni d'objet littéral par image. Les vecteurs de
  travail `tmp`, `tmp2`, `tmp3`, `DRIFT_V`… sont PARTAGÉS : `set`/`copy` avant usage, et ne compte pas sur leur valeur après un
  appel. Au besoin, déclare UN vecteur de travail à toi, au niveau du script, avec un nom unique (`const SENS_V_<zone>=new THREE.Vector3();`).
- Rien dans le DOM à chaque image (ni style, ni classe, ni texte) ; jamais `innerWidth`/`innerHeight` dans la boucle (`VP.w`/`VP.h`) ;
  jamais de `body:has(…)`.
- MÊME JEU À 30, 60 ET 120 IMAGES/S : tout ce qui évolue dans le temps passe par `dt` (lissage `1-Math.exp(-dt*k)`, ressort intégré
  avec `Math.min(dt,1/30)`, émission par `emiN`). Un `x*=.9` par image ou un `if(Math.random()<.3)` par image est une faute.
- Un détail coûte au plus quelques opérations par image quand il dort, et se termine tout seul (pas de minuteur oublié, pas d'état
  qui survit à la mort, au replacement, au portail, à la pause : regarde `resetGame`, `respawn`, `startFall`, `newTrack`).

## 5. LA SÛRETÉ (personne ne lancera de navigateur pour toi)
La boucle du jeu tourne dans un `try/catch` qui AVALE les erreurs : une variable mal nommée coupe l'image en silence, à chaque image.
- **Chaque identifiant que tu utilises, tu l'as VU déclaré** (`grep -n 'let nom\|const nom\|function nom\|,nom='`) et tu sais
  qu'il existe à l'instant où ton code tourne. `sh $S/banc/verifie.sh <ton-id>` détecte les noms non déclarés nouveaux — pas les
  propriétés inexistantes ni les valeurs nulles : protège (`if(x&&x.y)`).
- Ton code ne doit jamais pouvoir lever d'exception ; pour un appel placé DANS la boucle ou dans une fonction de règle (`tryLand`,
  `explode`, `startFall`…), enveloppe : `if(SENS)try{monDetail(…);}catch(e){}` — un détail de sensation ne doit JAMAIS pouvoir
  casser une pose, une mort ou une image.
- Tu INSÈRES des lignes neuves ; tu ne réécris pas les lignes existantes (cinq autres équipes modifient le même fichier cette nuit :
  plus ton diff est petit et « en ajout », moins la fusion cassera). Pas de reformatage, de renommage, de déplacement de bloc.
- Commentaires en FRANÇAIS, datés, qui disent POURQUOI : `// (2026-10-14, sensations) …` — dans la voix du fichier (imagée, précise).

## 6. CE QU'ON ATTEND DE TOI
1. **L'inventaire d'abord** : lis le code de ta zone et note ce qui EXISTE déjà (le jeu a déjà énormément d'effets — ne double rien,
   ne « renforce » pas ce que Sacha a déjà réglé). Cherche les TROUS : le moment où il se passe quelque chose pour le joueur et où
   ni la caisse, ni la main, ni l'œil ne le sentent.
2. **4 à 8 petits détails**, les plus sentis sur un téléphone d'abord. Petit = 5 à 30 lignes chacun. Un détail = un geste précis du
   joueur → une réponse immédiate, proportionnée (dosée par l'intensité réelle : vitesse du choc, angle, durée), brève, qui ne gêne
   jamais la lecture de la route. Mieux vaut 4 détails justes que 8 qui se marchent dessus ou qui fatiguent.
3. **Un commit par détail**, tout de suite, dans TA copie privée (voir §7), après `verifie.sh`.
4. **Tes notes au fil de l'eau** dans `$S/notes/<ton-id>.md` (écris dès le premier détail, complète ensuite — deux passes ont tout
   perdu à une coupure) : pour chaque détail — ce que le joueur fait, ce qu'il sent en plus, où c'est dans le code (fonction), les
   doses, comment le provoquer en jeu, le risque que tu y vois. Plus : ce que tu as VU et laissé (idées hors zone, sons à faire).

## 7. TA COPIE PRIVÉE
- `sh $S/banc/copie.sh <ton-id>` → affiche `COPIE=` et `JEU=` : un mini-dépôt git ISOLÉ qui ne contient que
  `VERSION PRINCIPALE/index.html` (la référence à cet instant, tag `base`). Tu ne modifies QUE ce fichier-là, avec l'outil Edit.
- Après CHAQUE détail : `sh $S/banc/verifie.sh <ton-id>` → doit finir par « VERIF OK » (syntaxe, noms non déclarés, burn-out de Léo),
  puis : `git -C "<COPIE>" commit -qam "Sensations · <zone> : <le détail, côté joueur>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`
  puis une ligne au journal commun : `printf '%s\t%s\t%s\n' "<ton-id>" "<fonction touchée>" "<titre court>" >> $S/journal.tsv`.
- AUCUNE commande git ailleurs que dans ta copie. Jamais de `git push`, jamais de `git stash`.
- ⚠ LA MACHINE A SURCHARGÉ CETTE NUIT (elle a redémarré) : **aucun navigateur, aucun serveur, aucune commande lourde**. Des `grep`
  ciblés, l'outil Read, `verifie.sh`, un petit script `node` si tu veux éprouver une formule (dans `$S/wt/<ton-id>/` seulement) — rien d'autre.
