# CAHIER DES CHARGES — LA MUSIQUE DE CASH CAR

> Nouveau départ le 2026-10-02. Léo : « je repars sur des petits samples vraiment simples, on construit petit à petit,
> on leur donnera une fonctionnalité ; écris le cahier des charges pour le transférer sur la nouvelle version ».
> Ce document est LA référence à transférer. Il se met à jour à chaque étape validée.

## 1. La méthode
- Un élément à la fois : **son de départ → motif → rythme → 2e son → … → fonction en jeu**.
- À chaque étape, 4 à 8 propositions courtes ; Léo choisit ; rien n'avance sans validation.
- La matière : de préférence de vrais sons (samples envoyés par Léo via la boîte, enregistrements) ; la synthèse maison
  seulement pour de petits éléments.
- Où écouter : http://localhost:8765/boucles.html · où envoyer : bouton « Envoyer à Claude » (→ `atelier-son/boite/`).

## 2. Ce qui est gardé
| Étape | Élément | Fichier | Pourquoi (les mots de Léo) | Validé le |
|---|---|---|---|---|
| — | VAPEUR (boucle de référence) | `assets/audio/music/boucles/lobby-vapeur.m4a` | « sa structure, sa différence, c'est beau » | 2026-10-01 |
| — | LE LOBBY : VAPEUR · SALON, ASCENSEUR DORÉ, FILTRE D'OR, MÉTRO | `assets/audio/music/lobby/*.m4a` (branche main) | « les 4, au hasard à la connexion ; ça reste le même ; quand je rallume l'appli ça change » | 2026-10-02 |
| — | GLASSY PLUCKS (lobby actuel) | `assets/audio/music/glassy-plucks-boucle.m4a` | morceau Suno de Léo, section 1:04 → 2:14 | 2026-10-01 |

## 3. Ce qui est rejeté (ne pas y revenir)
- Compositions entières synthétisées par Claude (v1 à v4 « chef d'orchestre »).
- Une musique qui évolue PISTE PAR PISTE (batterie, basse qui entrent et sortent) : « bizarre, disharmonieux ».
- Le studio / générateur à dés : interface trop dense.
- Des instruments synthétisés ajoutés sur un vrai morceau : « robot, très fade ».
- Les souffles de montée en nitro (« l'aspiration »).

## 4. Les règles du jeu pour la musique (pistes, à confirmer)
- Le morceau ne change jamais : la course l'**embellit** (lent, vol, après un crash) ou l'**intensifie** (vitesse, nitro,
  frénésie) — règle à l'essai dans `musique-lumiere.js` (copie de test `jeu-lumiere.html`), pas encore jugée à l'oreille.
- Chaque niveau a sa couleur : Nuages · Ville · Orbite · Frénésie.

## 5. Le journal des étapes
- 2026-10-02 — nouveau départ ; étape 1 à venir : trouver le SON DE DÉPART.
- 2026-10-02 — ÉTAPE 1 proposée : 8 sons de départ, tous en mi♭ (`atelier-son/depart.py` → `assets/audio/music/depart/`),
  onglet « Étape 1 » de boucles.html : PIANO DOUX, GUITARE NYLON, KALIMBA, CLOCHE DE VERRE, NAPPE VAPEUR, BOÎTE À MUSIQUE,
  BASSE RONDE, SYNTHÉ CHAUD. Les ♥ de Léo → `rangement.json` (`gardes`). En attente de son choix.
- 2026-10-02 — LE LOBBY appliqué sur `main` (local, commit aba79d2) : un des 4 tiré au hasard à chaque lancement, gardé toute la
  session (accueil, garage, écran de fin) ; fichiers = la boucle répétée sans couture sur ~100 s. Pas poussé.
- 2026-10-03 — LOBBY : la musique part quand le ciel s'ouvre (du début du morceau) ; VAPEUR · SALON sans grésillement (carillon de verre
  à la place des craquements) ; FILTRE D'OR et MÉTRO refaits « dans le moule » de VAPEUR / ASCENSEUR DORÉ, puis plus premium, puis
  SIMPLIFIÉS au niveau de VAPEUR (Léo : « trop complexe à l'oreille ; les nouveaux instruments sont cool »).
  RÈGLE APPRISE : la bonne densité = celle de VAPEUR (~4 attaques/s, 4 accords tenus en mouvement conjoint, une basse par mesure,
  mélodie rare) ; les instruments qui plaisent : Rhodes à trémolo, contrebasse, vibraphone, cordes douces, glissando de harpe.
- 2026-10-03 — CORRECTION de compréhension : « même type de boucle que VAPEUR » voulait dire la DURÉE (8 mesures, 2e moitié qui
  répond), PAS le style. FILTRE D'OR (house filtrée) et MÉTRO (2-step) refaits dans LEUR style, en 8 mesures, et TOUTES les musiques
  du lobby suivent UNE ambiance (bande qui pleure, grande réverbe douce, aigus adoucis, même sonie). Les versions « salon » sont retirées.
  VAPEUR · SALON revenue à l'identique d'avant (sans le carillon, sans grésillement).
- 2026-10-03 — MÉTRO et FILTRE D'OR ABANDONNÉS (retirés du lobby du jeu). CINQ NOUVEAUX LOBBYS proposés (`atelier-son/lobby5.py`, onglet
  Lobby) dans la règle du lobby (8 mesures, ambiance commune) : VIEILLE FORTUNE (rock américain cyberpunk, old money / new gear),
  TEMPLE DE JADE (DJ tech bouddhiste), MARGARITA BOSS (beach club), PARIS PUNK CASH (punk parisien, musette), SAVANE ROBOTIQUE
  (savane × ville des robots). En attente du verdict de Léo.
- 2026-10-03 — Les 5 lobbys refaits « moins de détails, plus jeu vidéo » : une mélodie de synthé qu'on retient, batterie simple,
  basse claire, accords courts, UN instrument signature par thème ; la 2e moitié reprend le thème une octave plus haut. L'AMBIANCE
  est gardée (Léo : « mais l'ambiance pas mal ») : bande, réverbe douce, aigus adoucis. RÈGLE : ambiance du lobby = à garder.
- 2026-10-03 — Les 5 lobbys : « encore la même vibe, trop aigu, enfantin, plus stylé » → mélodies une octave plus bas, un timbre
  PROPRE à chacun (guitare saturée · pluck deep house · pluck chaud · accordéon grave · synthé grave), la 2e moitié s'épaissit vers
  le BAS (plus jamais une octave plus haut), accords en scies sombres, basse plus lourde. RÈGLE : éviter le registre aigu et l'onde
  carrée nue (= « enfantin »).
