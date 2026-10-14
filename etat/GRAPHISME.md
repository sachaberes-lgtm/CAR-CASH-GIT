# GRAPHISME — état à 2 h 50
- Agents en cours : 1 (`etal-commun` : couche DA, vignette neutre, voiles de bonus). Ensuite 1 à la fois, sonnet : étalonnage NUAGES → VILLE → JADE → ORBITE.
- Intégré dans `gfx-integration` depuis le dernier état (syntaxe + garde OK à chaque fusion) : `sans-plots` (1 commit), `pieces-jade` (1), `route-beton` (4), + le bloc d'étalonnage vide.
- ROUTE EN BÉTON MAT (ordre de Sacha) : texture 256² existante repeinte, `ASPH_K` 1.7→.57, spéculaire/satiné/glacé à 0 à sec, aucune ligne de GLSL ni lecture en plus. ⚠ NON VU À L'IMAGE : le dernier réglage `ROUTE_JOUR` (nuages de jour), la route DEBOUT, le joint de dalle tous les 7 m à grande vitesse (risque de clignotement ; coupe : `JT`→0 dans `betonPeint`). Flancs de dalle encore violets.
- PLOTS RETIRÉS (`PLOTS_ON=false`) — pour GAMEPLAY/DEBUGGING : carrière NUAGES 4 sans portes (comptage coupé), frôlés seulement sur satellites, rien rééquilibré ; carrière 4 et auto-école non passées au navigateur.
- SAPÈQUES sur le jade : toile 16×16 repeinte, trou dessiné (vrai trou = proposition).
- Blocages : aucun. Passation : `etat/GRAPHISME-PASSATION.md`.

- 3 h : `etal-commun` intégré (DA sat 1.2→1.08, con 1.14→1.06, vignette neutre ×.6, BIO_ETAL0 sans dominante violette). ⚠ pour INTERFACE : il a touché UNE ligne de la boucle HUD (`--pf/--pf2`, voile de bonus `#pwrFx` ×0,4 via `PWR_BORD_K`) — aucun CSS. En cours : `etal-nuages` (1 agent, sonnet).

- 3 h 10 : `etal-nuages` intégré (6 météos, 3 commits ; soir et nuit adoucis en dernier NON revus à l image ; route de jour un peu trop claire L* 39-58 → à baisser côté `uLift`). En cours : `etal-ville` (1 agent, sonnet), fin visée 3 h 33 avant T1.

- 3 h 35 : `etal-ville` intégré (6 météos, vues à l image). Reçu les 2 décisions de Sacha (vrai trou percé des sapèques ; nuages de la Mer de nuages sur le jade) : elles passent devant le reste de l étalonnage, un agent à la fois, APRÈS T1 (pas de nouvelle vague avant le train). Prêt pour T1 : `gfx-integration`.

- `pieces-jade` : VRAI TROU PERCÉ intégré (919ed13 : géométrie `pickGeoY` 304 triangles au lieu de 336, bascule dans `coinSymbole`, texture 16×16 gardée, vu à l image). Reste devant : les nuages de la Mer de nuages sur le jade (après T1), puis étalonnage JADE, ORBITE.

- `nuages-jade` intégré (ordre de Sacha) : le coton de la Mer de nuages sur le jade, cubes coupés (`JADE_NUAGES_CUBES`, `?nucubes=1` les rend). Nuages par image, pire cas : palier 0 14 540 tri / 6 appels · 1 : 32 400 / 10 · 2 : 80 724 / 15 (budgets tenus). `PAL` absent de ma copie : `cotonPalier()` le lit s il arrive, sinon QUAL_LOW/MED. Pour OPTIMISATION : à mesurer ; `jadeChauffeNiveau` chauffe encore le programme des cubes (inutile). Suite : étalonnage JADE puis ORBITE.

- `etal-jade` intégré (6 météos vues à l image ; soir de Léo : seulement sat rendue + vignette neutre). Reste : étalonnage ORBITE + CRYPTO (1 agent), puis une relecture DEBOUT et la route de jour un peu claire.

- `etal-orbite` intégré (orbite ×3 + satellites + CRYPTOCITY ; derniers ajustements d expo non revus). Les 4 maps sont étalonnées. `gfx-integration` contient `assemblage` T1. Suite : UN agent de contrôle (planche APRÈS des 24 couples + debout, corrections de valeurs seulement).

- 4 h 30 — reçu le retour de Sacha (« au cas par cas, la ville ensoleillée ne marche pas »). ⚠ Il jouait main SANS nos étalonnages : `villeMatin`/`villeMidi` ont DÉJÀ été refaits cette nuit (dans `assemblage` T1 : nuages + ville ; dans `gfx-integration` depuis : jade, orbite, crypto). Les deux ordres directs sont DÉJÀ FAITS et intégrés : vrai trou des pièces (919ed13, dans T1) et nuages du jade = coton de la Mer de nuages (5f2ce4a + dc6e28f). En cours : 1 agent `controle` (sonnet) — planche APRÈS des 23 couples, ville de jour jugée en premier, une image avant/après par couple (`gfx/shots/apres/aa-<carte>-<meteo>.png`) + un bloc par couple dans QUESTIONS.md, corrections par valeurs. Pas de 2e agent nécessaire pour l instant.

- `planetes` intégré en DÉMONSTRATION (idée de Sacha) : Mars sur ORBITE midi (`PLANETES_ON`, false = avant), toile 1024×512 existante repeinte au portail, 0 texture/géométrie/programme en plus. Proposition : matin Terre · midi Mars · soir Jupiter · satellites Saturne (anneau = +1 programme, à valider ; sinon Uranus). « Nuages dans l espace » = les volutes blanches PEINTES sur la Terre (aucun objet nuage en orbite) : interrupteur `TERRE_VOLUTES` (laissé à true). Question posée dans QUESTIONS.md, planche `gfx/shots/planetes/planche-proposition.png`. En cours : `controle` (1 agent).

- `controle` intégré (7 commits de valeurs) : béton de jour ramené vers L* 40-46 (nouveau champ d ambiance `rtK` lu par `routeTick`), soir de la ville dé-mauvé, orage de la ville plus ardoise, nuit des nuages remontée, orbite matin/soir. 24 images avant/après `gfx/shots/apres/aa-<carte>-<meteo>.png` + blocs Q dans QUESTIONS.md. Restent à trancher : jade soir de Léo (béton L* 59, non touché), jade nuit (rochers noirs sur ciel noir), cumulus beiges (matière du coton, hors valeurs). Agents en cours : 0. Prêt pour T2.

- `planetes` généralisé et intégré (Sacha a validé) : matin Terre sans volutes · midi Mars · soir Jupiter · satellites Saturne + anneau (1 disque, +1 appel, +144 triangles, aucun programme de plus relevé aux portails). Interrupteurs `PLANETES_ON`, `SATURNE_ANNEAU`, `TERRE_VOLUTES`. Réserve : Jupiter/Saturne très claires (teintes à baisser ~12 % si trop). Agents en cours : 0.

- 4 h 40 — ORDRE DIRECT de Sacha dans mon fil : « la génération au hasard marche mal, les éclairages sont bugués ou moches ; crée des sous-agents qui tirent des combinaisons map + météo au hasard et corrigent chaque résultat ». Lancés : 2 agents — `hasard-bugs` (Opus : fuites d état aux portails, code de transition) et `hasard-beaute` (sonnet : valeurs du bloc d étalonnage). 1 navigateur à la fois pour les deux.

- 5 h 10 — reçu : périmètre « gratuit » levé (surcoût réservé à `PAL.n` 2), 3 agents. En vol : `hasard-bugs` (Opus), `hasard-beaute` (sonnet), + lancé `chaine-couleur` (Opus : ce qu un iPhone exécute vraiment par palier/cran, espaces de couleur, ordre des passes, saturation cumulée ; captures aux crans téléphone).

- `hasard-beaute` intégré : les 22 couples vus par VRAI tirage + portail ; 7 corrigés (ville midi/matin/orage, nuages soir/nuit/orage, orbite soir), avant/après dans `gfx/shots/hasard-beaute/` + blocs Q. Reste : fenêtres des tours allumées en orange en plein jour (shader `villeMatTours`), jade nuit sans silhouettes, mer GLSL claire la nuit. En vol : `hasard-bugs`, `chaine-couleur`.

- `chaine-couleur` intégré. VERDICT : l étalonnage est le MÊME à tous les paliers (écart 1/255) ; pas d erreur d espace de couleur (r128, tout en valeurs d écran). Les vrais défauts : (1) NOIRS BOUCHÉS (pivot du contraste à .5 + écrêtage + grade −.024 : tout < ~28/255 sort noir), (2) split-toning après l écrêtage (noirs sarcelle), (3) saturation réelle = ambiance × DA × 1,12 figé (jusqu à 1,67). Corrigé : le halo garde sa largeur à l écran quel que soit le DPR (133836f). ⚠ POUR OPTIMISATION / PILOTAGE : le téléphone calcule en DPR 1 par défaut (réglage RAPIDE) = 1/9 des pixels de l écran — proposition : NETTE par défaut au palier 2 ; et un A15 peut être rangé au palier 1 pendant 7 jours (banc processeur ~7 ms pour un seuil 8,5 ms). En `dbgChaine()` dans la console Safari, Sacha voit son palier. Lancé : `courbe-noirs` (pied de courbe, ×1,12 replié dans DA, compensé).

- 5 h 50 — reçu : textures dans le périmètre, 5 agents à 6 h, « plus aucun changement global sans planche validée ». `courbe-noirs` passe derrière `COURBE_V2` ÉTEINT par défaut (`?courbe=2` pour la voir). Lancé : `directeur-artistique` (Opus) — la direction écrite par map, puis relecture de cohérence avant chaque train.

- 5 h 45 — `DIRECTION.md` + `PLAN-6H.md` écrits (directeur artistique). 3 questions posées dans QUESTIONS.md. Lancé : `facades-jour` (3e agent, avec `hasard-bugs` et `courbe-noirs`). À 6 h (plafond 5) : `mer-nuit`, `jade-nuit` — charge actuelle 75, je les lance quand elle redescend sous 40.

- `courbe-noirs` intégré, ÉTEINT par défaut (`?courbe=2` pour la voir) : pied de courbe doux au lieu du noir écrêté, ×1,12 replié dans DA.sat, noirs neutres. Mi-tons/lumières < 1/255 de différence ; ville nuit : noir pur 17,5 % → 5,9 %. Question posée (allumer en 2,5 / en 3 / laisser éteint).

- 6 h 05 — quota remis à zéro : les 3 agents coupés par la limite d usage (facades-jour 3 commits, hasard-bugs 5, mer-nuit 0) sont repris ; lancés `jade-nuit` et `bords-route`. = 5 agents.

- `hasard-bugs` intégré : banc aléatoire (graine 4401, 12 couples par portail vs départ direct) → AUCUNE fuite d éclairage ; ses 2 correctifs d orbite infirmés et retirés ; seuls des hooks de banc restent. « Ombre sans caisse » non reproduit (caméra dans la caisse sous les confettis du portail ?). Lancé : `coton-blanc`.

- 6 h 15 — reçu le cap « détails, propreté, tout compatible ». La courbe des noirs reste ÉTEINTE (`?courbe=2`) : je l ai regardée (planche sans dégât, ombres de la ville la nuit ouvertes) mais je ne l allume pas sans un oui de Sacha. Constat sur toutes les planches : le FLOU DE VITESSE radial domine l image (décor illisible) → prochain chantier de finition dès qu un agent rend. En vol (5) : facades-jour, mer-nuit, jade-nuit, bords-route, coton-blanc.

- `facades-jour` intégré (allumé, `?sans=facades` / `?sans=neonville` l éteignent) : de jour les tours sont du verre gris-bleu qui renvoie le ciel, plus de fenêtres orange ; nuit inchangée (seules les enseignes passent ambre). 0 programme en plus. Lancé : `flou-vitesse`.

- 7 h 05 — CHARGE 370-450 (pas de mon fait : au plus 1 Chrome GRAPHISME). `coton-blanc` et `jade-nuit` ont rendu du CODE commité mais JAMAIS VU (le navigateur n a jamais eu de créneau calme) : je ne les fusionne PAS ; scripts de vérification prêts (`banc/coton-blanc/lance.sh`, `banc/jade-nuit/planche.cjs`). Je ne lance plus rien tant que la charge > 40 ; en vol : `bords-route`, `mer-nuit`, `flou-vitesse`.

- `flou-vitesse` : code commité (a32fcf4), JAMAIS VU (charge 400-670) — non fusionné ; vérification prête (`banc/flou-vitesse/ab.cjs`, 1 ouverture). En attente de calme : coton-blanc, jade-nuit, flou-vitesse. En vol : bords-route, mer-nuit.

- `mer-nuit` intégré (vu à l image, allumé ; `?sans=mernuit`) : la mer et les cumulus s éteignent la nuit (bleu nuit) et à l orage (ardoise) ; autres ambiances identiques par construction. Fondu portail nuit→matin pas vu.

- `bords-route` intégré (allumé, `?sans=bords`) : chanfrein béton de jour, rail blanc doux + catadioptres ambre la nuit, flancs béton, accents ambre/or/blanc par map, ligne centrale ivoire. ⚠ Lignes hors zone : un appel dans `musicTick`, deux valeurs dans `jadeRouteStyle`. ⚠ Bord du vide LA NUIT moins voyant que l ancien rail cyan : à juger sur iPhone (`dbgBords({kNuit:.8})` le renforce). Lancé : 1 agent `verif` qui attend le calme pour vérifier flou-vitesse, coton-blanc, jade-nuit (1 ouverture chacun).

- `flou-vitesse` intégré (vu à l image, allumé ; `?sans=flou`) : croisière nette (bords 63 %→100 % de netteté), centre et route nets à toutes vitesses, boost/nitro sentis par les bords seulement. 0 erreur GLSL/JS. En attente : coton-blanc (en file au navigateur), jade-nuit (à relancer).

- `coton-blanc` intégré (compile, vu ; `?sans=coton`) : blancs neutres par nuage (tous paliers, fin du sable/lavande), vapeur effilochée au palier 2 seulement (1 lecture de texture 256² + discard sur les pixels de nuage). ⚠ POUR OPTIMISATION : coût GPU au palier 2 NON concluant au banc (mesure prise sous charge) — à mesurer au calme ; `?sans=coton` l éteint. Relancé : vérification `jade-nuit`.

# GRAPHISME — reprise 11 h 25
- Tout s était arrêté vers 8 h 15. Intégré depuis le dernier état : `flou-vitesse` (vu), `coton-blanc` (vu ; coût palier 2 à mesurer par OPTIMISATION), `mer-nuit`, `bords-route`. En vol (3) : `jade-nuit` (planche en cours), `oeil-neuf` (sonnet : les 22 couples comme l iPhone, HUD visible, les 10 défauts les plus visibles), `leo-accord` (sonnet : le DOGE et la boutique de Léo accordés au jeu — matière/lumière seulement, forme intouchée).

- `jade-nuit` intégré (vu ; `?sans=jadenuit`) : silhouettes d estampe sur ciel vert-teal, orage ardoise verdie. ⚠ POUR INTERFACE : le JUS SUR L OBJECTIF (taches pixel roses/jaunes/violettes, CSS ≈ L381) et les CONFETTIS des annonces salissent presque toutes les images de course (constat de 4 agents GRAPHISME) — c est votre zone (CSS/DOM) : à doser (4 taches au plus, plus petites, désaturées ; confettis or/ivoire/vert). Lancé à la place : `titre-heures` (la lumière des 6 heures de l écran titre accordée aux maps et à la charte).

### 11:31 — assemblage T5 fusionné
- `gfx-integration` avance en avance rapide sur `92741da` (T5 contenait déjà toute la passe graphismes, jade-nuit compris). Syntaxe 0 erreur, 8 interrupteurs gfx présents.
- En vol (3) : oeil-neuf (8323), leo-accord (8324), titre-heures (8325). Charge machine 61 → je n'en lance pas d'autre avant un retour.

### 11:38 — titre-heures en attente de charge
- L'agent n'a pris aucune image : la charge machine est restée entre 45 et 97 pendant toute sa fenêtre (89 à 11:37, surtout des Chrome).
- Livré : un hook de banc `dbgTitre`, sans effet sur l'image (commit acf60e2, pas intégré), et un script de capture prêt (banc/titre-heures/cap.cjs).
- Piège noté : nuagesSoir et nuagesNuit copient titreGolden et titreNuit au chargement. Les surcharges du titre se posent après la ligne ~19803.
- Reprise quand la charge sera sous 40. Je ne lance pas de 3e agent tant que la machine sature.

### 12:00 — leo-accord rendu (aucun correctif) · titre relancé
- LE DOGE (caisse 76) et la boutique blanche : accordés, rien à changer. Matière/lumière cohérentes, la boutique est à ~232 (blanc perle), comme avant la passe.
- Pour Léo/Sacha (pas touché, ce sont ses créations) :
  - A. Les phrases du doge utilisent la triade magenta/cyan/violet rejetée (#ff3ec8 #5ee6ff #c07bff, 1,5 s) → proposer des teintes de la palette (or, crème, orange, vert, blanc).
  - B. Le doge reste « allumé » de nuit (MeshBasic) → `material.color` ×0,85 selon la nuit.
  Détail dans gfx/notes/leo-accord.md.
- Titre : 6 images AVANT prises à 11:55. Au jugement : le soir est violet-magenta (interdit par la charte), le golden a des nuages lavande, la nuit est outremer saturé avec des nuages derrière JOUER, et le matin est identique au midi. Nouvel agent lancé (valeurs seules, `?sans=titre`, preuve que la course est inchangée).
- 12:00 : etal-ville2 lancé (port 8326). Finitions de la ville sur ses 6 météos : lignes empilées fusionnées, face ombrée du matin, mesure des sat/con réels. Réversible par `?sans=ville2`. En vol (3) : oeil-neuf, titre-heures (2e agent), etal-ville2.

### 12:05 — oeil-neuf fusionné (5f8ca01) · nuages-jour lancé
- 2 correctifs vus à l'image, tous deux coupés par `?sans=oeil` :
  - la vignette de vitesse prune est plafonnée à .6 au lieu de .95 ;
  - le béton du jade soir passe du sable L*~60 au gris mat (rtK .72).
- Top 10 de l'œil neuf : gfx/notes/oeil-neuf.md. Hors zone graphisme, POUR INTERFACE :
  - n°1, le jus de fruit géant et les confettis (zone Léo, à faire avec son accord) ;
  - n°8, le HUD de course resté en néon violet, alors que les écrans sont en encre, blanc et or ;
  - le garage, resté néon, avec sa moitié droite en noir bouché.
- Pris en charge par graphisme : n°9 (caisse brun-rouille au titre) est confié à titre-heures, n°4 et n°7 (cumulus gris de jour, horizon dur) à nuages-jour (port 8327, `?sans=nujour`). Restent n°3 (le nitro violet dans l'ACES) et n°10 (les cumulus nuit et pluie).
- Le premier agent titre est arrêté (il chevauchait le second). En vol (3) : titre-heures, etal-ville2, nuages-jour.

### 12:45 — etal-ville2 fusionné (e4ccd3b) · neon-residuel lancé
- Ville, 6 météos, une ligne finale par ambiance, `?sans=ville2`. Planche : gfx/shots/etal-ville2/planche.png.
  - Soir : béton mauve-beige L*38 → charbon chaud L*23 (le plus net).
  - Matin et midi : béton gris neutre identique (L*42/43), faces à l'ombre lisibles.
  - Orage : sol et tours en ardoise.
  - Nuit et pluie : saturation ramenée sous la charte, quasi invisible.
- neon-residuel (port 8328, `?sans=neon`) :
  - le nitro violet devient blanc-or (oeil-neuf n°3) ;
  - le ciel de la ville à l'orage et à la pluie, encore lilas (constante du shader villeLisse et néons musicaux), passe en ardoise.
- En vol (3) : titre-heures, nuages-jour, neon-residuel.

### 13:00 — titre-heures fusionné (77dfafc) · garage-lumiere lancé
- Écran titre, 6 heures, `?sans=titre`. Planche : gfx/shots/titre-heures/planche.png.
  - Soir : magenta fluo → mauve doux et pêche.
  - Golden et après-midi : plus de mer lavande.
  - Nuit : outremer → navy calme.
  - Midi : sans cobalt. Matin : distinct du midi.
  - Caisse orange vif à toutes les heures (c'était un manque de lumière).
  - Course vérifiée identique : dump des ambiances octet pour octet.
- Relayé à nuages-jour : aligner la course au soir (nuagesSoir) sur le nouveau titre.
- garage-lumiere (port 8329, `?sans=garage`) : le garage 3D, dernier lieu néon (disque cyan, moitié droite noire), à accorder à la charte 6. Valeurs seules, créations de Léo intactes.
- En vol (3) : nuages-jour, neon-residuel, garage-lumiere.

### 13:40 — neon-residuel fusionné (c0988e7) · orbite-finitions lancé
- Nitro : la nitro infinie (pouvoir) ne baigne plus la caisse et la route de violet (lumière et bords blanc-or), la réserve bleue est désaturée et la lueur de bord recolore 16 % de l'image au lieu de 42 %. La plume NINF.jet est intacte. Plafond de la ville à l'orage : ardoise (prouvé par le calcul, peu visible au banc). `?sans=neon`.
- POUR INTERFACE / LÉO : les lavis violets restants sont DOM (`#pwrFx`, `#speedFx`, les taches JUS, la jauge et l'AURA du HUD). Les taches de jus DOMINENT encore toutes les captures (question 266 de QUESTIONS.md).
- orbite-finitions (port 8330, `?sans=orbite2`) : rebond de lumière qui suit la planète, béton modelé par une clé rasante, noir profond.
- En vol (3) : nuages-jour, garage-lumiere, orbite-finitions.
