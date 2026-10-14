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
- 2026-10-03 — LOBBY retenu par Léo (« garde ce que j'ai sélectionné, push sur le main ») : VAPEUR · SALON, ASCENSEUR DORÉ, VIEILLE
  FORTUNE, TEMPLE DE JADE → commit c399421 prêt sur `origin/main` (branche locale `lobby-leo-main`, dossier ../CAR-push) ; le push sur le
  main de Sacha est lancé par Léo.
- 2026-10-03 — LA MUSIQUE DU CIEL (`atelier-son/ciel.py`) : la NAPPE VAPEUR qui s'étoffe en 5 NIVEAUX de 8 mesures (88 BPM, mi♭),
  structure inspirée de l'album EXPONENTIAL GENERATOR (Frollen Music Library : library music soul / hip-hop, Rhodes, percussions,
  synthé monophonique sur une basse ARP) : 1 nappe seule · 2 Rhodes · 3 beat hip-hop + basse ARP · 4 mélodie au synthé mono ·
  5 cordes et congas. Le morceau entier + chaque niveau en boucle (Niveaux → Nuages). En attente de l'écoute de Léo.
- 2026-10-03 — CIEL : la mélodie du niveau 4 plus forte (+3 dB dans les médiums) ; un GESTE DE TRANSITION différent à chaque passage
  (1→2 Rhodes qui monte + souffle inversé · 2→3 la demi-mesure qui se vide puis le beat qui tombe avec une cymbale · 3→4 la basse qui
  glisse vers le grave + charley ouvert + souffle · 4→5 relance + cymbale + Rhodes). Les boucles par niveau restent sans transition.
- 2026-10-03 — CIEL, LE FINAL (niveau 5, « encore plus spectaculaire ») : le morceau MONTE D'UN TON (mi♭ → fa, mesuré), une
  demi-mesure de SILENCE à la fin du niveau 4 (−22 dB) puis l'IMPACT (sous-basse qui gronde, cymbale, accord de cuivres) ; dans le
  niveau 5 : cuivres soul qui claquent, chœur « ooh », cordes qui doublent la mélodie, charleys en doubles croches.
- 2026-10-03 — EN COURSE, LE TEMPO SUIT LA VITESSE (jeu de référence, branche `lobby-leo-main`, à pousser avec le lobby) : la musique
  s'étire de −6 % (lent) à +4 % (pointe) +2 % en nitro, HAUTEUR CONSERVÉE (preservesPitch), changements lents et petits ; la profondeur
  (volume qui recule à l'arrêt) existait déjà. Règle du plaisir auditif retenue : ±6 % max, hauteur fixe, transitions ≥ 2 s.
- 2026-10-03 — LE CIEL EN JEU (jeu de référence, commit 7f1e9f7 sur `lobby-leo-main`, à pousser) : carrière NUAGES niveau n → CIEL · NIVEAU n
  (n = 1…5 ; le 5 = le final), niveaux 6-10 = NOITE ; partie sans fin aux NUAGES = le morceau entier. Fichiers : boucles répétées ~110 s.
- 2026-10-03 — LOBBY : TEMPLE DE JADE retiré. Tirage = VAPEUR · SALON, ASCENSEUR DORÉ, VIEILLE FORTUNE (commit 4dd978b, à pousser).
- 2026-10-03 — Le TEMPO qui suivait la vitesse est RETIRÉ (Léo : « ça fait bizarre, ça coupe »). À la place, LA DISTORSION DU BOOST
  (commit 0bebfa4, à pousser) : une copie saturée « à lampe » de la musique monte par-dessus en nitro (plein), en plaque turbo (60 %),
  et légèrement à la vitesse du boost (≤ 35 %) ; la musique d'origine recule de −2 dB. Jamais via Web Audio sur la musique elle-même
  (règle « musique v4 » : iPhone). Pas d'effet là où captureStream manque (iPhone/Safari). RÈGLE : ne plus toucher au tempo/playbackRate.
- 2026-10-03 — LE BOOST JOUE UN INSTRUMENT (Léo : « j'entends pas trop la différence quand je booste ») : la distorsion restait sous le
  morceau (copie saturée à 50 %, musique −2 dB) et n'existe pas sur iPhone (captureStream absent) → montée à 85 %, musique −3 dB. Et
  surtout : chaque appui sur la nitro JOUE LA NOTE SUIVANTE d'une phrase (synthé : deux scies + une carrée grave, filtre qui claque, écho),
  TOUJOURS dans la gamme du morceau en cours (`SON_TON`) → spammer = une mélodie ; tenir = la note tient, s'ouvre, vibrato ; lâcher = elle
  s'éteint. Marche aussi sur iPhone (bus des effets). Tonalités corrigées : CIEL −1, CIEL N5 +1, VAPEUR −1, ASCENSEUR −4, VIEILLE FORTUNE +3.
  Console : `dbgInstru(0|1)`, `dbgInstru('essai')`.
- 2026-10-03 — L'instrument du boost « mille fois plus discret » : −16 dB, attaque douce (plus de claquement), timbre sombre, vibrato et écho réduits. Il reste un reflet sous la musique.
- 2026-10-03 — Le boost joue désormais un ARPÈGE (Léo : « pas cool comme instrument, bien filtré, vise plutôt un arpège et une harmonie ») :
  piano électrique doux (FM qui s'éteint, filtré sous 1,8 kHz, écho), accords de neuvième de la tonalité du morceau, grille I · vi · IV · V
  (l'harmonie de VAPEUR). Appui = l'accord suivant (spammer = la grille défile) ; tenu = l'arpège monte et redescend en doubles croches et
  change d'accord toutes les 2 boucles ; lâché = les notes s'éteignent seules. Discret.
- 2026-10-03 — Les voix (MONSTRE, DOUBLE…) ne cachent plus la musique : elle reculait à 34 % (−9 dB) pendant chaque voix — c'était le « la musique s'arrête quand je me pose » ; désormais 88 % (−1 dB) et la voix −3 dB. Arpège du boost plus fort, 6 notes max, jamais collées au spam.
- 2026-10-03 — RÈGLE (Léo : « ça vaut pour tous les effets sonores ») : AUCUN son ne cache la musique — tous les effets −3 dB sous elle (`SFX_SOUS_MUS` .7, par-dessus le curseur EFFETS, samples et intro compris), voix −3 dB, la musique ne recule plus que de −1 dB sous une voix. Fusionné avec le main de Sacha (11 commits), sw v65.
- 2026-10-03 — L'arpège TENU (Léo : « pas de pause entre chaque boucle, ça doit suivre le son, se répéter sans se répéter, accordé, effet d'évolution — sinon parfaitement filtré ») : le trou venait du plafond de 6 voix (0,9 s comptées par note). Désormais la double croche = le TEMPO du morceau (CIEL 88, VAPEUR 100, ASCENSEUR 120, VIEILLE FORTUNE 100, sinon le métronome du décor), notes posées sur la GRILLE du morceau ; tenu : un des 5 motifs par boucle, l'accord avance à chaque mesure, mesures 3-4 à l'octave, basse douce sur les temps dès la 3e mesure ; jamais au-dessus de ~do5. Banc muet `dbgInstru('tenu')`.
- 2026-10-03 — LA PHRASE DU BOOST v3 (Léo : « toujours un blanc entre les arpèges ; complexifie pour qu'on puisse appuyer longtemps, une mélodie accordée ; si on lâche ça ne doit pas tout casser »). Le blanc = le réservoir qui se vide : la nitro s'éteignait/se rallumait sous le doigt → la phrase suit désormais le DOIGT. Trois couches sur le tempo et la grille du morceau : arpège doux (5 dessins, accord par mesure I·vi·IV·V), MÉLODIE au-dessus (6 rythmes, notes de l'accord sur les temps forts, pas de pentatonique entre, contour de 4 mesures, sol3-do5), basse dès la 3e mesure. Lâcher : la phrase finit le temps + un temps en s'éteignant ; réappuyer dans les 2,5 s la REPREND où elle était. Spam : chaque appui = un accent de mélodie qui bouge toujours.
- 2026-10-03 — Le boost en RENDU PREMIUM (Léo : « on n'entend pas assez, pas parfait parfait ») : +5 dB ; touche de Rhodes à deux porteuses ±4 cents ouvertes en stéréo, l'indice FM suit la force de frappe, corps d'octave bref, jeu humanisé (±4 ms, ±8 %) ; bus : compression douce → filtre 2 kHz → salle (convolution 1,8 s sombre) + écho ping-pong en croche pointée calé sur le tempo du morceau.
- 2026-10-03 — La phrase du boost ne part qu'au VRAI appui du joueur (Léo : « pas provoquée par le boost du début que le joueur n'actionne pas ») : elle lit les touches NITRO (clavier et bouton tactile), plus `startBoostT` ni le pilote auto.
- 2026-10-03 — LA DISSONANCE des 3e/4e mesures (Léo : « le 3e et le 4e son gâchent un peu la musique ») : la phrase part à l'appui, pas sur la grille du morceau ; ses accords IV maj9 et V9 (et les 7es de I/vi) portaient la 4te et la 7e majeure, qui frottaient sur l'accord du morceau. Accords refaits en PENTATONIQUE SEULE (I 6/9 · vi · ii sus · V sus), basse sur la tonique, mesures 3-4 à −2 dB. Mesuré : 89 notes, seulement les degrés 0 2 4 7 9. RÈGLE : un son joué à l'appui du joueur ne quitte jamais la pentatonique.
- 2026-10-03 — LOBBY : VIEILLE FORTUNE retirée (Léo). Tirage au lancement entre VAPEUR · SALON et ASCENSEUR DORÉ (commit 873c0f8, fichier supprimé du jeu).
- 2026-10-03 — Le BOOST AUTOMATIQUE DU DÉPART ne fait plus de musique (Léo) : c'était la DISTORSION, qui lisait `nitroOn` (le départ allume la nitro tout seul) ; désormais coupée pendant `startBoostT` et 1,2 s après (l'élan retombe), et la phrase du boost refusée pendant le départ (un doigt déjà posé la lance à la fin).
- 2026-10-03 — Phrase du boost : à la 4e MESURE l'arpège monte d'une octave (Léo : « plus aigu l'arpège au niveau 4 ») — jusqu'à ~ré5, toujours en pentatonique ; la phrase s'éclaire avant de reboucler.
- 2026-10-03 — Phrase du boost « plus fondue et effacée » (Léo) : son direct −3,5 dB, salle .55 → .85, écho .32 → .38, filtre 2 → 1,6 kHz, attaque 10 → 25 ms et FM moins brillante (moins de « tine »), arpège de la 4e mesure (l'octave) −2,5 dB. Le niveau qu'on entend vient davantage de l'espace que de la note.
- 2026-10-03 — L'arpège AIGU de la 4e mesure (l'octave) : .75 → 1,45 (≈ +5,7 dB sur la version effacée, +3 dB sur celle d'avant) — Léo : « on ne l'entend pas assez ».
- 2026-10-03 — Chaque note de la phrase a son CONTOUR (Léo : « un peu plus d'individualité, fais-les ressortir du fondu ») : un « tine » d'attaque (harmonique ×7, 40 ms) qui passe à côté du filtre sombre, de la salle et de l'écho (passe-bande 2,6 kHz), et un PRÉ-DÉLAI de 35 ms sur la salle (l'attaque est entendue avant le halo). Le fondu reste.
- 2026-10-03 — L'ÉTINCELLE (Léo : « à partir du niveau 4, remplace juste le son du boost par un truc plus étincelle, plus discret, même mélodie et arpège ») : dès la 4e MESURE tenue, mélodie et arpège passent en célesta de verre (sinus + FM rapport 3,5 qui s'éteint vite, scintillement ×4, déclin .22 s, −6 dB), sur un bus clair (350 Hz – 7 kHz) avec un peu de salle ; la basse reste le Rhodes. Mêmes notes.
- 2026-10-03 — LA PHRASE LIT LE MORCEAU (Léo : « encore plus harmonieux et accordé à CHAQUE musique de la liste — ça va au début mais c'est pire à la fin »). Causes : la phrase inventait sa grille (ASCENSEUR finit sur La7♭9 : do#, si♭) et le tempo n'était calé qu'à l'appui (dérive). `atelier-son/harmonie.py` analyse les 14 morceaux du jeu (spectre blanchi, sommets seulement) → `assets/audio/music/harmonie.js` : tempo, position des temps, notes qui sonnent TEMPS PAR TEMPS (vérifié : VAPEUR Mi♭maj9 → La♭maj9 → Fa m9 → Si♭7sus, ASCENSEUR Ré m9 → Sol13 → Domaj9, CIEL n5 en fa). Le jeu lit la position de lecture du morceau et ne joue QUE ces notes ; recalé à chaque note. Nouveau morceau = le relancer (`<venv>/python atelier-son/harmonie.py "VERSION PRINCIPALE"`).
- 2026-10-03 — (Léo : « l'arpège crée une résonance grave à la fin, c'est dérangeant ; un peu plus en mode TING, l'instrument n'est peut-être pas le bon ») : la BASSE de la phrase est retirée (le morceau a la sienne), la salle et l'écho ne prennent plus rien sous ~300 Hz, le bus sous 160 Hz. L'ARPÈGE devient un TING : petite cloche de verre (FM rapport 3,5 qui s'éteint en ~60 ms, scintillement ×4, déclin .35 s) sur le bus clair, de ré4 à ~ré6. La mélodie garde le Rhodes (puis l'étincelle dès la 4e mesure).
- 2026-10-03 — (Léo : « le début de l'effet, le 1er son flou quand on appuie, est trop fort, presque dérangeant ; quand ça s'étend en notes harmonieuses qui varient c'est vraiment cool ; ça doit s'activer quand le joueur APPUIE ET MAINTIENT ; la transition floue de fin est très bien ») : la phrase ne part qu'après 0,22 s de doigt tenu (un tap ne joue plus rien), plus d'accent de mélodie au départ (le son flou : une note de Rhodes appuyée dans la salle), entrée en fondu (8 notes de 30 % à pleine voix). Fin inchangée.
- 2026-10-03 — CIEL niveaux 3-5 (Léo : « les percussions font vieillot, un peu hors contexte ; les mélodies et le lead un peu étouffés, fais ressortir ») : batterie MODERNE (grosse caisse serrée à clic, clap doublé d'une caisse claire, charleys fins et presque droits, roulements en triolets dans le final, claquements de doigts à la place des congas, nappe/Rhodes/basse qui respirent sur la grosse caisse) ; le lead s'ouvre (filtre 1,9-5,5 kHz), +2 dB, présence ajoutée (lead, cordes, cuivres), réverbe .8 → .45, plus de bande qui pleure sur la mélodie, filtre maître 7,8 → 12 kHz. Boucles retilées à 109 s, harmonie.js recalculée. Fusionné avec le dernier main de Sacha (le dragon de NITROOO), sw v82.
- 2026-10-03 — LA DISTORSION DU BOOST COUPÉE (Léo : « il reste une partie du son très dérangeante, forte, floue, qui monte ; n'efface pas les bonnes rythmiques ») : la copie saturée de la musique qui gonflait à l'appui (avec un éclat à l'allumage). `DIST.on=false`, `dbgDisto(1)` pour comparer. La phrase du boost reste.
- 2026-10-03 — LE SON QUI MONTE TROP FORT (Léo : « quand j'appuie sur le boost avec la barre très remplie, ça monte trop fort ; quand ça s'égalise en notes douces c'est agréable ») = NITROOO : nitro tenue 2 s → voix + `vitesse.pure`, puis un `nitrooo.palier` par seconde qui GRIMPAIT la gamme jusqu'au 7e degré. Paliers −11 dB, alternés tonique/tierce (plus de montée), déclenchement −8 dB.
- 2026-10-03 — À LA RECHERCHE DE LA COUCHE QUI GÊNE (Léo : « ça doit accompagner, pas passer par-dessus ; il y a une partie qui gêne, trouvons-la ») : versions d'écoute par l'adresse — ?boost=sans · arpege · melodie · feu0 (flamme du nitro muette) · nitrooo0 (NITROOO muet). Trouvé et corrigé en passant : le 2e son de NITROOO (`vitesse.pure` toutes les 2 s) grimpait la gamme à PLEIN volume → −10 dB, tonique/tierce.
- 2026-10-03 — Phrase du boost : il ne reste QUE LE TING (Léo : « j'aime que la partie qui fait ding ding ding ; l'autre est assourdissante et ne colle pas à la musique, retire-la ») — la MÉLODIE (Rhodes dans la salle, puis étincelle) est retirée (`INSTRU_MEL=false`). La flamme du nitro n'est pas touchée.
- 2026-10-03 — Le TING du boost (Léo : « c'est parfait ; un peu plus fort, que je le remarque ; dès qu'on appuie sur ESPACE et que ça boost, et en maintenant sur iPhone ») : +2 dB, départ dès l'appui (plus d'attente de 0,22 s ; l'entrée en fondu reste). iPhone : le bouton NITRO tenu pose la même touche (keys.Space).
- 2026-10-03 — (Léo : « au début, avec le nitro automatique, la mélodie ne commence pas ; si la personne appuie même quand le nitro est déjà activé, il faut que ça active ; quelques notes un peu mélodiques dès qu'on appuie, sans déranger la musique ») : un VRAI appui pendant le boost de départ lance la phrase (le départ seul ne la lance toujours pas) ; à chaque départ de phrase, L'APPEL : 3 notes de mélodie en ting (notes du morceau, contour qui chante) par-dessus l'arpège qui entre en fondu.
- 2026-10-04 — CIEL NIVEAU 5 PREMIUM (un testeur : « le 5 n'est pas ouf, le 4 a l'air plus abouti ») : retirés les cuivres et le chœur en scies (le côté synthé bon marché, aussi à l'impact du final) ; ajoutés une CLOCHE qui double la mélodie à l'octave, un ARPÈGE DE VERRE en doubles croches (accord en cours, ping-pong, écho), une sous-basse tenue, des charleys ouverts en contretemps, une cymbale tous les 4 mesures, des cordes plus amples et plus claires. + Le TING du boost RÉGULÉ (Léo : « cool au début, ça fait un petit effet, mais trop fort ») : entrée en fondu, plein ~1 mesure, puis se pose à 55 % sous la musique ; ting −1 dB, salle .85 → .55, écho .38 → .26. Fusionné avec 18 commits de Sacha (Roblox + c36872a : tempo coupé, plus de rechargement à chaque push), sw v90.
- 2026-10-04 — QUATRE BOUCLES INSPI (Léo : « rajoute quelques sons boucle inspi, redoutable, créatif, cohérent, original ») : `atelier-son/inspi.py` → onglet Lobby, marquées « INSPI » — COFFRE-FORT (jazz de film, trompette bouchée, contrebasse, vibraphone, 84) · CHROME LIQUIDE (city pop 80, basse slappée, Rhodes en contretemps, cloches de verre, 108) · VOL DE NUIT (synthwave lente, arpège de verre du boost, caisse claire en cathédrale, 92) · POUSSIÈRE D'OR (trap-soul, 808 qui glisse, guitare claire, Rhodes de VAPEUR, 70). Dans les règles du lobby (8 mesures, 2e moitié qui répond, registre grave-médium, −15 dB RMS). En attente de l'écoute.
- 2026-10-04 — GLASSY PLUCKS = la musique des niveaux VILLE (Léo : « push main, seulement ce détail ») : `MUSIC_LIEU.ville` (avant NOCTURNAL GROOVE), SON_TON −2 (gamme relevée : ré majeur pentatonique), harmonie relevée (150,335 BPM). Fait dans une copie PROPRE du main (../CAR-ville, branche ville-glassy, commit d177551) pour ne pousser QUE ça — les 9 commits en attente de ../CAR-push (CIEL 5 premium, ting régulé…) n'y sont pas.
- 2026-10-04 — CIEL 5 accéléré (Léo : « accélère légèrement la musique du CIEL 5, pour voir ; intensifie si tu vois comment ») : la boucle du niveau 5 rendue à 95 BPM (88 avant, +8 %, rendu tel quel : pas de playbackRate, aucune distorsion) ; intensité : respiration plus profonde (cordes comprises), grosse caisse plus franche + une double toutes les 2 mesures, clap fantôme. Le morceau entier reste à 88. harmonie.js recalée (95). Fusionné dans ../CAR-push : le main de Sacha (départ en musique, l'intrus du nitro corrigé — un `//` au milieu d'une ligne de instruNote) + la branche ville-glassy.
- 2026-10-04 — CIEL 5, LE LEAD DU FINAL (Léo : « change la trajectoire du lead aigu : beaucoup plus PROFOND, mais dynamique, beaucoup plus moderne — un vrai contraste, l'ambiance du niveau final ; seulement le niveau 5 ») : sa propre mélodie MEL5 (une octave et demie plus bas que celle du 4, syncopes, notes qui rebondissent, une force par note) jouée par `lead5` (deux scies ±9 cents + carrée à l'octave dessous, glissade, filtre qui claque selon la force, saturation douce, écho ping-pong) ; la cloche aiguë et la doublure de cordes retirées du final. + RÈGLE (Léo) : les effets du boost musical se DESSINENT par map et par musique → la phrase du boost n'existe QUE sur CIEL · NIVEAU 1 à 5 (`instruMusiqueOk`), et se termine si la musique change de map. Fusionné avec le main (garage, GLASSY pour toutes les villes), sw v99.
- 2026-10-04 — Le lead du CIEL 5 réécrit en SOLO IMPROVISÉ (Léo : « par profond je parle de CHANGE : fais évoluer le lead encore plus, aie recours au talent d'impro ») : 8 mesures qui racontent — exposé d'un motif de 4 notes · motif déplacé d'une croche et monté · cascade en doubles croches avec passage chromatique (si ♮ → do) · saut d'octave qui relance · riff syncopé sur une note répétée · SOMMET (appoggiature puis note tenue chantée) · résolution qui redescend. `lead5` : les notes longues arrivent par en dessous (scoop de 45 cents) puis vibrent.
- 2026-10-04 — Le SOLO du CIEL 5 (Léo : « rapproche la tonalité de la deuxième version, le lead est trop cool, mais moins fort ») : joué une octave plus bas (`LEAD5_OCT` −12, le registre du lead profond), gain .34 → .26 (−2,3 dB).
- 2026-10-04 — (Léo, précisé : « le deuxième » = la 2e version du lead du 5, la grave) : le SOLO du 5 reste une octave plus bas, et il est PLUS FORT (« il s'entend moins que le lead du 4 ») : gain .44 (+5 dB sur la version d'avant), avec la présence ajoutée comme le lead du 4. Le niveau 2 (monté de 2 dB sur un malentendu) est revenu tel quel.
- 2026-10-04 — SKY HIGH (Léo : « enlève les 5 autres niveaux CIEL avec la musique intru, et renomme CLOUDS par SKY HIGH ») : le monde NUAGES s'appelle SKY HIGH (FR et EN) et n'a plus que ses 5 niveaux (ceux du CIEL ; 6-10 jouaient NOITE). Il finit au portail du 5 (campFinale, « SKY HIGH TERMINÉ »), la caisse-nuage se gagne en le terminant (carrN 5). Plus de « 9 »/« 10 » en dur dans la carrière (lvlChoisir, carte du monde, jauge, compteur, carrFait, dbgCampagne). Vérifié : 2 → 3 → 4 → 5 → fin enregistrée 5/5.
- 2026-10-05 — VILLE NIVEAU 1 = NÉON (Léo apporte studio-musique.md : « musique pour niveau 1 ville ») : `atelier-son/neon_ville.py` recrée la boucle de son Studio depuis le JSON (120 BPM, basse moteur, sub, Juno qui dérive 1,2-3,2 kHz + chorus large, Rhodes, cuivre CS-80, souffle d'accord) ; 12 tours de 4 mesures dont les variantes sont tirées selon les poids (« evolve ») → 96 s sans couture ; crépitement et souffle de bande omis. Branché : carrière VILLE niveau 1 (`MUSIC_VILLE1`), SON_TON +5 (la majeur pentatonique), harmonie.js. Bibliothèque : onglet Niveaux → Ville.
- 2026-10-05 — SKY HIGH 5 : le lead « aussi éclairé que le 4 » (Léo) — `lead5` : filtre qui part de 1,9 kHz comme celui du 4 (650 Hz avant), carrée grave .35 → .2, présence .45 → .75 ; il reste à l'octave grave et au même volume.
- 2026-10-05 — VILLE NIVEAUX 1 À 5 = NÉON COMPLÈTE 1 à 5 (Léo apporte neon-complete-1-a-5.md) : `atelier-son/neon_ville.py` devient un moteur qui lit les 5 JSON du Studio (instruments synthbass, sub, juno, rhodes, cs80, bell, swell, boomkick, cello, ploc, pop, bubble, gong ; len/variantes pondérées/vol/rev/prob/active/human/late/pump/drift/drive ; hiss omis) → ville-n1…n5, 96 s chacune. Mixage mesuré : 1re passe noyée dans le grave (−45 dB d'aigus) → rééquilibrée (−37 à −42, sans batterie aiguë c'est voulu), −15 dB RMS comme les autres. Branché : carrière VILLE 1-5 (`MUSIC_VILLE`), SON_TON 'ville-n' +5, harmonie.js. Bibliothèque : Niveaux → Ville.
- 2026-10-05 — VILLE 1-5 : « tu as oublié un LEAD important qui donnait de la vie » (Léo) = le cuivre CS-80, ENTERRÉ (mesuré par piste : −10 dB aux 1-2, −22 aux 3-5 — les −11/−12 dB du Studio appliqués à la lettre). Son vol ne compte plus qu'à 15 %, base .34 → .56 ; sous-basse .28 → .17. Résultat mesuré : lead à −6 dB (1-2) et ~−8 (3-5) du mix, aigus −34/−36 dB.
- 2026-10-05 — VILLE NIVEAUX 6 À 10 composés (Léo : « fais les 4 prochains niveaux en t'inspirant de la base, prends des libertés, fais évoluer ; à la cinq on doit ressentir EXPLOSION, ARGENT, BOOMIN, LUXURY ») : `atelier-son/ville_suite.py` (le moteur de neon_ville + bass808, clap, hat x/o/r, strings, harp, brass, coins, kaching ; définitions en JSON dans ville-6-10.json) — 6 PLUIE D'OR (base NÉON 5 + charleys + pièces) · 7 SOUS-SOL (fa# m · ré · mi · do# m, demi-tempo trap, 808, violoncelle) · 8 PENTHOUSE (si m9 · mi9 · la maj9 · fa# m9, harpe, cordes, Rhodes) · 9 CHAMBRE FORTE (cordes staccato façon Metro Boomin, gong) · 10 CASH EXPLOSION (fanfare de cuivres qui double le lead, caisse enregistreuse au 1er temps, pluie de pièces, 808, gong). Tous en la majeur, 120 BPM, −15 dB RMS ; équilibre mesuré par piste. Carrière VILLE 1-10 : `MUSIC_VILLE` (GLASSY reste en VILLE sans fin).
- 2026-10-05 — VILLE à 5 niveaux (Léo : « enlève les 5 autres niveaux ») : COUCHER · SOIRÉE · PLUIE NÉON · MINUIT · ORAGE, chacun sa NÉON COMPLÈTE 1-5 (version recréée — les exports exacts de Studio-Neon.html restent à faire si Léo les envoie) ; fin au portail du 5 (villeFinale : « VILLE TERMINÉE », REJOUER ouvre l'ESPACE), le lingot se gagne en la terminant (carrV 5). Vérifié : VILLE 5 → portail → 5/5, CITY COMPLETE. Les morceaux 6-10 composés restent dans la bibliothèque, hors du jeu.
- 2026-10-06 — RIEN AVANT LE CIEL (Léo : « l'intro CASH CAR qui explose : la musique commence même avant ça — enlève complètement toute musique qui arrive avant le ciel ») : la composition de l'intro (introSound : accords « nombre d'or », compteuse à billets qui monte, battements de cœur, sub) ne joue plus (`INTRO_SON=false`) ; l'intro est muette, la musique du lobby part au ciel (hide, 420 ms). Vérifié : l'intro se déroule jusqu'au menu sans erreur.
- 2026-10-06 — (annulé le jour même : Léo « sur le main c'est bon je crois » — le son de l'intro reste comme avant, commit c135414 annulé)
- 2026-10-06 — Finalement (Léo : « le main est bien ; si c'était Sacha, laisse ; ce que tu dois retirer, ce sont les musiques d'intro parasites qui s'introduisent avant le ciel home ») : les heures de l'accueil de Sacha restent (ciel au MIDI forcé annulé), l'intro reste MUETTE (`INTRO_SON=false` remis). Vérifié : l'intro va jusqu'au menu sans erreur.

## 2026-10-06 — la transition lobby → niveau, adoucie
Léo : « essaie de smooth la transition musique lobby → musique niveau ». Avant, au JOUER : le lobby baissait en ligne droite sur
1,5 s alors que le piqué dure 1,75 s (un trou de 0,25 s), puis le niveau entrait en courbe en S de 0,6 s (départ trop lent, creux
audible). Maintenant : le lobby s'efface en COSINUS sur toute la durée du piqué et touche zéro pile quand la course part ; le niveau
entre en SINUS sur 1,3 s (fondus à puissance constante : même énergie de part et d'autre). REJOUER : même cosinus sous le voile
noir. Les portails gardent leur entrée de 0,6 s. ⚠ iPhone : le volume d'un <audio> y est verrouillé par le système, les fondus ne
s'y entendent pas (coupure franche) — sur ordinateur et Android, oui.

## 2026-10-06 — les cuts de boucle (lobby et niveaux)
Léo : « sur le main, les musiques ne tournent pas bien en boucle, ça fait des cuts » (et le lobby). Les fichiers sont propres (aucun
blanc au début ni à la fin, aucun trou ; le creux de 0,3 s à la fin de VAPEUR · SALON revient à chaque tour : c'est la musique). Le
cut vient du lecteur : MESURÉ dans Chrome, un <audio loop> glisse 53 ms (CIEL 1) à 85 ms (VILLE 1) de silence à chaque rebouclage.
Correctif : LE RELAIS DE BOUCLE — deux lecteurs <audio> libérés au premier toucher ; à 6 s de la fin, le second se cale au début du
même fichier, à 30 ms de la fin il part et prend la place (`musicEl`) ; le premier finit sans reboucler. Boucle native en filet.
Vérifié au banc : 3 relais sur le lobby, 0 raté, chevauchement ~20 ms. `dbgRelais()` en console, `dbgRelais(0)` = comme avant.

## 2026-10-12 — LA MUSIQUE SUIT LE MOTEUR (essai validé : « exactement »)
Léo : « ça ne doit pas être tout calme, déjà bien, et s'intensifier ». Un morceau = 5 PALIERS de 8 mesures, même tempo, même longueur
au sample près ; le moteur choisit le palier (moteurs 1-5 · 6-10 · 11-15 · 16-20 · 21-30), le passage tombe sur la MESURE SUIVANTE, à la
même place dans la phrase (fondu de 8 ms). Essai sur OG GINOBILI (`musique-moteur.html`) : P1 = le morceau tel quel ; P2-P5 = des
passages de plus en plus intenses du morceau + un SURPLUS de ses propres pistes séparées (batterie, charleys, basse, mélodie), sonie
+0,7 dB par palier. Rien de synthétisé. Pas encore dans le jeu ; le répit au crash pas encore essayé.

## 2026-10-12 — NUIT DE VELOURS : le 2e morceau à paliers, et L'INTRO
Léo : « une musique dans le même système de vitesse évolutive… ça commence INTRO, puis palier 1… ; french touch mais version nuit,
plus night, dark mais pas trop grave ni trop aigu, harmonieux, plus vaporwave ». Fichier : `assets/audio/music/paliers/nuit-de-velours.html`
(format de CONSIGNE-MUSIQUE-PALIERS.md), écoute dans `musique-moteur.html` (premier de la liste).
- 110 BPM, fa mineur, grille « Just the two of us » de nuit : Réb maj9 · Do7(b9) · Fa m9 · Mib m9|Lab13 / … · Sib m11|Do7(b9) ; voicings
  serrés mib3 → sol4 (ni grave ni aigu) ; quatre temps qui POMPENT (side-chain), accord haché filtré 3·3·4 (la signature french touch),
  basse funky sur les contretemps, nappe à chorus, bande qui pleure (±7 cents), mélodie en TRIANGLE (celle de VAPEUR) réb4 → mib5.
- Paliers : P1 groove complet, mélodie en retrait · P2 charleys doubles, basse bavarde, filtre qui s'ouvre · P3 arpège en écho, shaker ·
  P4 mélodie devant, caisse claire, cymbale, accord à l'envers · P5 chœur « ooh », basse ronde, mélodie doublée en bas, accords grands ouverts.
- L'INTRO (`intro: 4`, `jouer(p = 0)`) : la boucle « derrière la porte » (filtre 320 Hz → ouvert sur 4 mesures), grosse caisse à la 2e,
  claps/charleys à la 3e, deux temps de vide + la montée de la mélodie, puis le palier voulu par le moteur pile sur la mesure 1.
  `musique-paliers.js` : l'intro rendue entière avec sa queue, jouée une fois ; si le moteur monte pendant l'intro, c'est le palier
  d'arrivée qui change. « Nouvelle partie » sur la page d'essai repart de l'intro.
- Mesuré : équilibre par instrument (pics à 50 ms vs grosse caisse) et bandes comparées à VAPEUR / FILTRE D'OR / CIEL 3 ; coutures
  réparées dans le rendu commun (fondu de 6 ms : une phrase n'est pas un nombre entier d'échantillons) ; ondulations calées sur la phrase.
  Rendu ~90 s pour les 6 morceaux sur le Mac chargé (P1 + intro prêts en ~15 s). Pas encore jugé à l'oreille par Léo.

- 2026-10-12 (soir) — v2, Léo : « encore plus de variations, de contraste, d'évolution, mais super !!! ». La v1 reste écoutable
  (`nuit-de-velours-v1.html`, « VELOURS v1 » dans la page). v2 : P1 = LA NUIT (motif seul + la montée de la mesure 8, basse de 3 notes,
  claquements de doigts, accords à 950 Hz, tout le morceau derrière un filtre à 6,5 kHz, étroit) · P2 le filtre s'ouvre, vrais claps,
  basse funky, toute la mélodie · P3 arpège, shaker, notes fantômes, fin de phrase martelée · P4 LE DROP (tout ouvert, mélodie devant
  et doublée en bas, caisse claire, cymbale, basse ronde, relance de 3 claps) · P5 chœur, mélodie à DEUX voix (tierce prise dans
  l'accord), pompage profond, chorus pleine largeur. Volume : +1,1 dB par palier (`pas`, nouveau champ du format) au lieu de 0,7.
- 2026-10-12 (nuit) — v3 : DIX PALIERS, un tous les 3 moteurs (Léo : « chaque trois moteurs devrait changer la musique » puis « fais
  évoluer, varie comme tu veux, tant que ça s'intensifie et devient magnifique à la fin »). Table `QUAND` (le palier où chaque élément
  entre) : P1 la nuit · P2 basse funky · P3 vrais claps, charleys doubles · P4 toute la mélodie · P5 arpège, shaker · P6 notes fantômes,
  fin de phrase martelée, accord à l'envers · P7 LE DROP · P8 mélodie à deux voix · P9 chœur + GLISSANDO DE HARPE en tête de phrase ·
  P10 cordes + CONTRE-CHANT qui descend sous la mélodie (do4 → sib3 → lab3 → solb3…), harpe deux fois par phrase, relance de claps.
  Filtre de tout le morceau 6 → 20 kHz, largeur et pompage qui montent à chaque cran, +0,5 dB par palier (−17 → −12,5). 270 sources
  par mesure au P10. Système : `musique-paliers.js` accepte N paliers (`paliers.length`) et rend 2 mesures d'élan + la boucle (10
  mesures au lieu de 16 : 10 paliers en ~2 min sur le Mac chargé) ; `musique-moteur.html` : un palier tous les 3 moteurs pour tous
  les morceaux (ceux à 5 paliers plafonnent au 13e moteur).
- 2026-10-12 (nuit) — v4 : DOUZE PALIERS. Léo, sur MOTEUR GLISSE découpé « 1-3 · 4-6 · 7-9 · 10-12 · 13-30 » : « 1, 2, 3, 4 : environ
  2 moteurs ; le 5, trouver une manière mathématiquement correcte ; couper de 13 à 30 de manière égale — trop de moteurs avec une même
  intensité, ça suit pas ; aller encore plus dans la complexité et l'intensité ; appliquer au nouveau son ». → NUIT DE VELOURS déclare
  `moteurs: [2,2,2,2,2,2,3,3,3,3,3,3]` (2 moteurs par palier jusqu'au 12e, puis 3 jusqu'au 30e : les moteurs arrivent plus lentement en
  fin de partie). Le drop tombe au moteur 13. Nouveaux crans : P8 RHODES À TRÉMOLO (FM, 87 battements par phrase) + CONGAS (fa3/do4) ·
  P9 deux voix + basse qui glisse d'un demi-ton vers chaque accord + arpège qui redescend en 2e moitié · P10 chœur + harpe · P11 cordes
  + contre-chant, mélodie ORNÉE (note d'appui d'en haut qui glisse), grosse caisse qui rebondit, Rhodes syncopé, harpe 2×/phrase ·
  P12 VIBRAPHONE sur le motif, harpe toutes les 2 mesures, basse en octaves. +0,45 dB par palier. Système : `palDecoupe(n, moteurs)` /
  `palDe(debuts, moteur)` dans musique-paliers.js (sans `moteurs` : paliers qui s'allongent doucement, ×1,5 du premier au dernier ;
  5 paliers → 5·5·6·7·7). La v3 à 10 paliers est gardée dans le scratchpad de la session.
- 2026-10-13 — la page d'essai : « laisse supprimer et changer les noms » → bouton MODIFIER (renommer chaque morceau, rond rouge =
  le retirer de la liste, RÉTABLIR = tout revient ; le fichier du morceau n'est jamais effacé). Enregistré dans `musique-moteur.json`
  (racine) par `atelier-son/serveur-moteur.py` (qui sert aussi la page SANS CACHE : `python3 atelier-son/serveur-moteur.py 9141`).
- 2026-10-13 — v5 : « ça doit être de plus en plus dynamique, la vibe c'est pas ça » → « plus énergique pour la fin, french touch, Justice,
  Daft Punk, et vaporwave » ; « les paliers c'est bien si on change à chaque 4 moteurs ». HUIT PALIERS (`moteurs: [4,4,4,4,4,4,4,2]` :
  1-4 · 5-8 · 9-12 · 13-16 · 17-20 · 21-24 · 25-28 · 29-30). Retirés : congas, vibraphone, harpe, Rhodes, cordes et contre-chant (le côté
  « lounge »). P1 la nuit vaporwave · P2 ça roule · P3 la ville s'allume · P4 LE DROP (moteur 13) · P5 LE PHASER (Daft Punk : accords
  hachés en croches dans 6 passe-tout qui balaient 200-1 600 Hz) · P6 LA BASSE JUSTICE (octaves sur les contretemps, propre + saturée
  par UN façonneur de bus), tierces, roulements de caisse claire · P7 LES ACCORDS SATURÉS (un accord tenu derrière une PORTE à
  contretemps : 1 accord au lieu de 8 notes) + mélodie qui mord, ornée · P8 LE FINAL (porte en doubles croches 3·3·2, chœur « aah »).
  +0,6 dB par palier. La v4 à 12 paliers est dans le scratchpad de la session.
- 2026-10-13 — page : « changer de morceau bloque » (les rendus du morceau d'avant continuaient et s'empilaient) → ils s'arrêtent, ce qui
  est fait reste en mémoire (revenir sur un morceau : 0,3 s), la musique repart toute seule si elle jouait ; `?m=nuit` ouvre un morceau
  directement. « Je parle des sons jaugés » → MODIFIER renomme et RETIRE aussi les PALIERS (un palier retiré donne ses moteurs à celui
  d'avant ; − / + pour remettre), par morceau, dans `musique-moteur.json`.
- 2026-10-13 — v6, Léo : « okay super, mais un instrument énergétique, et rends chaque instrument plus net, sci-fi ». L'INSTRUMENT
  ÉNERGIQUE = LE SYNTHÉ TRON (Daft Punk, « Derezzed ») : carré + scie, filtre résonant qui claque à chaque double croche, la note de
  l'accord puis la pédale à l'octave ; il s'annonce en croches au P3, doubles croches au drop, plus haut et plus résonant à chaque
  palier (1,1 → 3,8 kHz, Q 6 → 11), saute l'octave en fin de phrase au P7+ ; au niveau des accords et de la mélodie (−10 dB sous la
  grosse caisse). Il remplace l'arpège en écho. PLUS NET : grosse caisse qui claque (180 → 52 Hz en 50 ms, corps 0,28 s), claps plus
  courts, charleys en MÉTAL (6 carrés de la 808 ×1,9, calculés une fois), basse et accords plus secs, nappe passée au passe-haut,
  réverbe 3,2 → 2,2 s avec 35 ms de pré-délai, échos plus clairs, plafond 10,5 → 16 kHz, moins de saturation de bande. La bande qui
  pleure (flou vaporwave) s'efface avec le moteur (7 cents au P1 → presque rien au drop). Un LASER qui plonge à chaque fin de phrase (P5+).
- 2026-10-13 — v7, Léo : « okay mais plus dark city ». Lab13 (lumineux) → Lab7(b9) (diminué) à la mesure 4 ; la nappe devient des
  CUIVRES façon Blade Runner (filtre qui s'ouvre lentement sur chaque accord, ombre à l'octave grave) ; accords hachés sans la note
  doublée en haut et filtres un cran plus bas ; mélodie plus sombre et doublée en bas dès le P2 ; synthé Tron plus sombre, pédale en
  bas jusqu'au P5 ; réverbe de RUE 2,8 s plus noire ; métal des charleys plus grave (×1,5) ; grosse caisse un peu plus lourde ;
  aigus du master −3 dB, plafond 13 kHz. La batterie reste nette. v6 gardée dans le scratchpad de la session.
- 2026-10-13 — « c'est pas super dark city… pars du premier son French touch et fais un truc un peu music aura, dark triad » (le
  « premier son French touch » = SON Moteur French Touch, `~/Downloads/french-touch.html`, la map VILLE du simulateur) → nouveau morceau
  **AURA** (`assets/audio/music/paliers/aura.html`, 1er de la page ; NUIT DE VELOURS inchangé). On garde SES instruments et SA
  mécanique (basse disco, accords hachés [2,6,10,13], guitare funk wah, voix robot à formants, voix qui parle en charabia, thérémine,
  bips en anneau, lasers, shuffle, UN filtre résonant sur la boucle puis la pompe, flanger en haut, filtre qui plonge en fin de phrase et
  se rouvre d'un coup ; pas son souffle qui monte). Ré majeur disco → MI MINEUR (Em9 · Cmaj9 · Am9 · B7(b9)), 122 BPM fixes, thérémine
  et bips plus bas. AURA / DARK TRIAD : la CLOCHE phonk (2 carrés 1:1,48, saturée, calée sur les notes de l'accord) + la 808 qui glisse
  (P5), le chœur sombre « ouh » + la réponse robot (P6). 8 paliers (un tous les 4 moteurs), le filtre de la boucle 700 Hz → grand ouvert
  au drop (P4). Limiteur serré (−8 dB) pour que le volume monte régulièrement (−17 → −12,8 dB). Léo doit envoyer une inspiration.

## 2026-10-13 — LA BIBLIOTHÈQUE DES SONS CASH CAR (`bibliotheque.html`)
Léo : « ça bug beaucoup, je veux qu'on refasse bien et efficace, c'est lent ; récupère les anciennes musiques — ça doit être la librairie
entière des sons cash ; comme sur l'orga des maps : on joue la musique et les niveaux moteur montent petit à petit jusqu'au dernier ;
affiche combien de paliers moteur différents a chaque son qui suit ce système ».
- **Plus rien ne se calcule dans la page** : les morceaux à paliers sont FIGÉS une fois en M4A (`assets/audio/music/paliers/rendus/<id>/`
  intro + p1…pN, fiche dans `rendus/index.js`), par `palFige(M, id)` (musique-paliers.js) + `atelier-son/serveur-moteur.py` (POST /fige :
  WAV → afconvert AAC 192 k, relu à l'échantillon près par Chrome ; POST /fige-index). AURA 29 s, NUIT 44 s, V1 29 s, GLISSE 12 s — une fois.
  Un morceau change → le refiger (console de la bibliothèque : `palFige(await palLitMorceau('assets/audio/music/paliers/x.html'), 'x')`).
- **92 sons** : SUIVENT LE MOTEUR (16, en cartes, badge = nombre de paliers) — 5 à paliers figés (AURA 8, NUIT DE VELOURS 8, V1 5, MOTEUR
  GLISSE 5, OG GINOBILI 5), le Moteur French Touch en direct (jauge continue, recopié du simulateur dans `assets/audio/music/direct/`),
  GLISSE et GLISSE v2 (5, setTier), les 2 séquenceurs de phrases (NOITE, ADDICTIVE : 6), les 6 boucles à couches (NÉON DRIVE 6, PLUIE NÉON 3,
  ALTITUDE 4, NÉON NOIR 4, GRAVITÉ ZÉRO 4, NÉON DRIVE · MOTEUR 7) ; puis NIVEAUX 25, LOBBY 17, ANCIENS 22, PETITS SONS 12 (les catalogues
  de boucles.html).
- ▶ d'un son moteur = le moteur part du 1er et monte tout seul (un cran toutes les 4 s, après l'intro) jusqu'au 30e, puis y reste ; la
  barre du bas : moteur, nom du moteur, palier, − / +, toucher un palier pour y sauter. Une lecture à la fois (jeton) : 5 clics en 1 s →
  seul le dernier joue. Mesuré : chaque son démarre en 0,1-0,3 s. MODIFIER : renommer / retirer / remettre (musique-moteur.json).
  `?muet=1` pour les bancs. `musique-moteur.html` reste l'atelier (charger un morceau de Claude chat, le rendre en direct).
- 2026-10-13 — « laisse-moi supprimer » : une CORBEILLE sur chaque son de la bibliothèque (toujours visible) ; le son part tout de suite,
  « Annuler » pendant 6 s, puis il reste dans « Sons supprimés — les remettre » en bas (le fichier n'est jamais effacé du disque).
  « Modifier » devient « Renommer ».
- 2026-10-13 — **GLISSE FUSION** (`assets/audio/music/paliers/glisse-fusion.html`, figée dans rendus/glisse-fusion/), Léo : « une fusion
  exacte de Glisse (l'originale) et qui se finit en Glisse v2 à partir du milieu des paliers, 8 paliers moteur ». Les deux moteurs
  (musique-glisse.js, musique-glisse-v2.js) recopiés TELS QUELS dans un seul morceau (deux chaînes de son) ; P1-P4 = GLISSE figée aux
  vitesses 0,22 · 0,32 · 0,45 · 0,56, P5-P8 = GLISSE v2 à 0,64 · 0,76 · 0,88 · 1 (la v2 commence au-dessus de là où l'originale s'arrête :
  ça monte toujours). Tempo FIXE 104 (les originaux glissaient de 98 à 110/112 avec la vitesse), hasard → alea, ondulations calées sur la
  phrase, transitions de la v2 (roulement / plongée) non reprises. Un palier tous les 4 moteurs : la v2 arrive au moteur 17. −17 → −12,8 dB.
- 2026-10-13 — **NÉON NOIR en 8 paliers** (« rends le clap moins violent… c'est trop fort ; 8 paliers moteur comme les nouveaux ») :
  `atelier-son/neon-noir-paliers.js` remixe SES 4 pistes d'origine (nappe · basse · caisse · batterie) en 8 paliers (gain + filtre par
  piste, limiteur, deux tours rendus) et les fige. MESURÉ avant : la caisse (le « clap » énorme) à −20,5 dB contre −35,6 pour la nappe →
  elle n'entre qu'au palier 4, 14 dB plus bas, adoucie (passe-bas 2,6-4,2 kHz), et finit 5 dB sous l'original. La basse s'ouvre de 380 Hz
  à grand ouvert. L'ancienne carte à couches s'efface (`remplace` dans la fiche).
- ⚠ 2026-10-13 — BUG trouvé et réparé : le mode `?muet=1` coupait aussi les rendus hors temps réel (il patchait BaseAudioContext) →
  GLISSE FUSION et NÉON NOIR avaient été FIGÉS MUETS. Refigés ; `palFige` et `neonNoirFige` refusent désormais un rendu silencieux.
- 2026-10-13 — « ajoute une option pouce en l'air » : 👍 sur chaque son (bleu quand il est levé), bouton « 👍 Mes pouces (n) » qui
  n'affiche qu'eux ; enregistré dans musique-moteur.json (`pouces`).

## 2026-10-13 — TRENTE MOTEURS : la musique générative à 30 paliers (`assets/audio/music/direct/musique-trente.js`)
Léo : « un nouveau système de musique générative, testé en direct, qui enrichit l'expérience sans alourdir le jeu ni nuire à sa fluidité ;
un nouvel élément sonore à chaque moteur — jusqu'à 30 paliers, ~30 instruments, effets ou matières ; de petites transitions ; agréable,
toujours clairement audible ; chaque ajout assez léger » + « conserver la bibliothèque, ne pas modifier les sons likés ».
- Module en direct, même contrat que Glisse (`createTrenteMusic({audioContext, destination})` → start / stop / setTier(moteur, 30) /
  setSpeed / setVolume / nomElement(k)). Dans la bibliothèque : 1re carte « TRENTE MOTEURS », 30 paliers (un par moteur), la barre du bas
  dit l'élément qui vient d'entrer (« + le Rhodes »).
- Les 30 éléments, dans l'ordre : nappe · pluck · grosse caisse · charley · basse · clap · Rhodes · mélodie · shaker · charley ouvert ·
  arpège · pompe · contre-chant · cloche · basse qui s'anime · rim · chœur · clarté (le filtre s'ouvre) · cordes · 808 qui glisse · caisse
  fantôme (+ roulement) · mélodie doublée en bas · accords hachés · ride · échos · tierces · toms · cuivres · étincelles · final.
- GÉNÉRATIF : la mineur, 110 BPM ; 4 grilles (une tirée à chaque phrase de 8 mesures) ; mélodie inventée à chaque phrase (motif de 2
  mesures, répété, varié, réponse qui se pose sur l'accord) ; arpèges, étincelles, roulements au hasard, toujours dans la gamme.
- TRANSITIONS : l'élément entre au début de la mesure suivante (au moins un temps plus tard), en fondu sur un temps, annoncé par une petite
  montée de pluck sur l'accord qui vient ; un léger crash tous les 5 moteurs.
- LÉGER (mesuré, ordinateur) : chaque instrument rendu UNE fois en échantillon au démarrage (OfflineAudioContext, en parallèle) ; une note
  = 1 source + 1 gain ; les accords (nappe, chœur, cordes, Rhodes, accords hachés, cuivres) = l'accord ENTIER pré-rendu, 1 source ; aucun
  filtre par note ; réverbe et écho partagés. Prêt en 0,32 s (la nappe d'abord, le reste fini à 0,74 s en arrière-plan) ; au palier 30 :
  36 sons en même temps (pic 50 — c'était 100 / 154 avant les accords pré-rendus) ; l'horloge : 0,12 ms par appel (pire 2,2 ms).
- AUDIBLE : chaque élément réglé au banc au palier 30 (crête 50 ms vs grosse caisse) : entre 0 et −23 dB — mélodie et clap −10,5,
  808 −8, basse −6, textures (étincelles, ride, rim, shaker) ≈ −22.
- Aussi : GLISSE FUSION ne commence plus avec la basse (« celle qui mélange 1 avec un autre ») — palier 1 sans 808, elle entre au palier 2
  (ancienne version gardée dans le scratchpad). Favoris et suppressions de Léo respectés (musique-moteur.json).

## 2026-10-14 — LE GÉNÉRATEUR « COMME EN JEU » + CIEL et PENTHOUSE en 8 paliers + les INSPIRATIONS
Léo : « transforme CIEL en musique 8 paliers moteurs, et PENTHOUSE pareil ; pour le nouveau système jeu, la page doit insérer un
générateur où on peut choisir le palier et entendre une musique générée sur le champ, comme si le joueur appuie PLAY et se met à gagner
des moteurs à mes contrôles » · « garde la liste des musiques pour que je puisse toujours te rajouter des sons inspi qui te donnent une
idée pour créer un générateur de musique complet » · « que ce soit toujours random mais toujours harmonieux ».
- **LE GÉNÉRATEUR** (en tête de `bibliotheque.html`) : PLAY / STOP, « +1 MOTEUR » (comme le joueur qui gagne un moteur ; il lance aussi
  la lecture), « −1 », les 30 cases (on saute à n'importe quel moteur ; rayées = l'élément attend la mesure suivante), « 🎲 Autre
  musique » (une autre musique tirée EN JOUANT, à la mesure, sur une phrase neuve), « Nouvelle partie » (moteur 1 + musique neuve),
  « Monter tout seul » (décoché par défaut : c'est LUI qui gagne les moteurs), clavier ← → / − +. Moteur = TRENTE MOTEURS en direct.
  La bibliothèque et le générateur se coupent l'un l'autre (un seul son à la fois).
- **LE TIRAGE** (`musique-trente.js`, `tirage()` à chaque PLAY, `nouvelle()`) : tonalité (la mineur transposée de −3 à +3 : fa♯ … do
  mineur — les accords entiers par playbackRate, les notes par note()), tempo 100-120, 3 grilles parmi 9 (toutes dans la même gamme),
  2 motifs de mélodie INVENTÉS (cellules de rythme, contour au hasard, puis calés sur l'accord aux temps forts et sur la gamme ailleurs),
  la basse (contretemps · funk · octaves — fondamentale, quinte, octave : justes sur tous les accords), le Rhodes, l'arpège. « Le hasard
  choisit, la gamme décide. » La page affiche la musique tirée (tonalité, BPM, accords dans la tonalité). Mesuré au moteur 30 : pic de
  47-51 sons simultanés (inchangé), changement de musique en jouant sans erreur.
- **CIEL et PENTHOUSE en 8 paliers** (`atelier-son/paliers_figes.py`, figés dans `rendus/ciel/`, `rendus/penthouse/`, moteurs
  [4,4,4,4,4,4,4,2]) : LEUR vraie composition (ciel.py, ville_suite.py), seulement ce qui joue change.
  · CIEL (88 BPM, mi♭ ; le final reste à 88 — le lecteur cale ses mesures sur une seule longueur de boucle) : nappe + sous-basse ·
    + Rhodes · + rim et shaker · grosse caisse et charleys · + clap et basse ARP · + la mélodie mono · le final un ton plus haut (solo,
    snaps) · + cordes et arpège de verre.
  · PENTHOUSE (120 BPM, si m9 · mi9 · la maj9 · fa♯ m9) : Juno, sous-basse, cloches · + Rhodes et harpe · + 808 et charleys feutrés ·
    + grosse caisse trap et clap · + cordes · + le lead · + les pièces · le luxe total (cuivres doux sur les accords, plus de pièces).
  · Sonie −17 → −12,8 dB (+0,6/palier) atteinte grâce à un LIMITEUR à anticipation (`limite`) : sans lui, CIEL restait à −15,8 dB du
    palier 4 au 8 (la grosse caisse bloquait la crête). Boucles vérifiées : longueur exacte à l'échantillon après décodage.
  · ⚠ Python : numpy/scipy ne sont plus sur le Mac — venv du scratchpad (`python3 -m venv venv && pip install numpy scipy`).
- **LES INSPIRATIONS** (section sous le générateur) : on glisse un son (ou « choisis un fichier ») → `POST /inspi` du serveur
  (`serveur-moteur.py`, relancé) → `assets/audio/music/inspi-generateur/` + `liste.json` (titre, date, NOTE « ce qui te plaît dedans »,
  `POST /inspi-note`). Elles se jouent, se suppriment et prennent un 👍 comme les autres sons. C'est là qu'il me donne des idées pour le
  générateur : les écouter + lire ses notes avant de le faire évoluer. (Testé avec un fichier de banc, effacé ensuite.)

## 2026-10-14 (suite) — TRENTE MOTEURS v2 : « travaille la VARIÉTÉ » + le tempo qui monte
Léo : « l'évolution vers les paliers pourrait apporter un peu de vitesse, de tempo · c'était cool le premier son, puis ça a commencé à
ressembler à la même chose : aucune partie ne doit être la même, mais chaque partie doit donner autant envie d'en refaire une autre ».
Inspirations données : C418 « Cat » (« pas mal dans les variations »), C418 « Blocks », Ateyaba « Rock With You » (introuvable en ligne :
style fait d'après l'ambiance, à recaler sur le fichier s'il le dépose dans les Inspirations).
- 11 STYLES (house, outrun, trap luxe, lo-fi, drum & bass, tropical, disco funk, aurore → trance, ludique façon « Cat », électro façon
  « Blocks », nonchalant façon Ateyaba) : chacun son tempo, ses rythmes, sa basse, ses accords, son PREMIER SON, son ordre d'entrée des
  30 éléments (mélangé à chaque tirage) et ses timbres (5 claviers, 5 mélodies, 5 basses). Au hasard : jamais le style des 3 dernières.
- UN NUMÉRO = UNE MUSIQUE (graine) : la page affiche « TITRE » · n° ; « Rejouer » la refait à l'identique → il peut me dire « la 4821 ».
- LA FORME (Cat/Blocks) : A · A′ · B (autres accords, mélodie au pluck) · C (thème qui revient, parfois demi-tempo, respiration de
  2 mesures passé le moteur 10). THÈMES inventés = une cellule redite + une réponse (ce qu'on retient). Élément « bégaiement » (glitch).
- LE TEMPO MONTE avec les moteurs (+6 à +14 % du 1er au 30e). Chaque moteur : un roulement propre au style puis un coup sourd sur le
  1er temps ; les GRANDS (grosse caisse, clarté, batterie qui double, ton qui monte, final) : une mesure de montée.
- Mesuré (muet) : 0 note hors gamme sur les 11 styles ; prêt en 0,1-0,16 s, banque complète 0,24-0,34 s ; plafond de voix 64 (les
  textures sautent un coup au-delà ; la DnB montait à 101) ; chaque moteur entre ~2,3 s après (à la mesure), un grand ~4,6 s.
- v1 gardée dans le scratchpad (musique-trente-v1.js).

## 2026-10-14 — LE LOBBY « CHRIS » : cinq versions dans l'esprit de Chris (C418)
Léo : « Chris C418 ; inspi nouvelle musique lobby, plusieurs versions qui peuvent faire tenir mon jeu pendant 10 ans » puis « vrm celle
de Chris elle est magnifique ». CHRIS = la piste 15 de Minecraft – Volume Alpha, la suite de CLARK : la même tendresse (piano doux, nappe
chaude, 7e et 9e majeures) mais un beat percussif doux y entre et finit par groover. Rien n'est repris (ni mélodie, ni grille, ni son).
- `atelier-son/lobby_chris.py` → `assets/audio/music/lobby-chris/` (chris-*.m4a + chris-donnees.js, window.CHRIS) ; section À PART
  « Lobby Chris » de `bibliotheque.html`, au-dessus du Lobby (Léo : « ne mets pas ça dans le même dossier que l'autre, fais ça
  séparément »). Pas encore dans le jeu.
- Pour TENIR : des morceaux LONGS (1 min 38 → 2 min 10, 40 mesures) au lieu de 8 mesures ; la forme de Chris (intro nue · la percussion
  entre en bois et shaker · le groove + la basse · presque funky · la respiration · tout revient · la dernière mesure retombe dans la
  1re, queue de réverbe repliée : aucune couture, vérifié décodé à l'échantillon) ; la mélodie « pousse » au 2e passage et s'orne au 3e.
- Nouveau : le PIANO FEUTRÉ synthétisé (partiels inharmoniques, deux cordes qui battent, déclin en deux temps, feutre, étouffoir).
- PREMIER MATIN (ré majeur, 90) · DIMANCHE (fa, 98, Rhodes + basse slappée, le plus funky) · GARAGE DE NUIT (do mineur, 82, nappe
  sombre, vibraphone) · POLAROÏD (sol, 86, petit synthé façon Moog, piano qui marche, vinyle) · GRAND CIEL (mi♭, 74, le plus calme,
  piano en octaves). Sonie −15 dB RMS comme les autres lobbys. En attente de l'écoute de Léo.
- 2026-10-14 — « j'arrive pas à me retrouver, rends ça plus lisible » : `bibliotheque.html` a des ONGLETS sous le titre (une section à
  la fois : Générateur · Inspirations · Suivent le moteur · Niveaux · Lobby Chris · Lobby · Anciens · Petits sons, avec leur nombre),
  bâtis depuis les `<section>` de la page (bloc à part en fin de fichier) ; l'onglet est retenu et s'ouvre par l'adresse
  (`bibliotheque.html#lobby-chris`) ; « 👍 Mes pouces » montre les aimés de toutes les sections.

## 2026-10-14 (nuit) — LES INSPIRATIONS MESURÉES + LE MÉLANGE DES GÈNES (TRENTE MOTEURS v2.1)
Léo dépose 4 MP3 (Ateyaba « Vision » et « Rock With You », Daft Punk « One More Time », Nirvana « Smells Like Teen Spirit ») : « vole
les instruments, mélange tout intelligemment pour avoir un générateur entraîné et original ».
- ⚠ AUCUN son de ces enregistrements dans le jeu (App Store) : les fichiers restent dans assets/audio/music/inspi-generateur/ (exclu de
  git par .git/info/exclude), on les MESURE et on refait leurs instruments par SYNTHÈSE.
- `atelier-son/analyse_inspi.py` (numpy/scipy, venv du scratchpad) → `analyse` dans liste.json, affichée sous chaque inspiration :
  Vision 127,6 BPM (mi♭m ↔ si♭, intro calme, refrain/couplet) · Rock With You 136 BPM (mi mineur, un seul accord qui tourne, passages de
  8 mesures plus doux) · One More Time 123 BPM (un long passage sans basse au milieu) · Teen Spirit 117,4 BPM (quintes fa · la♭,
  19 dB entre calme et fort ; la tonalité détectée « do majeur » est fausse — fa mineur : la saturation trompe le chroma).
- Appliqué : house à 120-124 + boucles d'un/deux accords + FILTRE QUI BALAIE (section C : tout se ferme à 380 Hz et se rouvre en
  8 mesures) + TALKBOX (formants « ou → a ») ; nonchalant recalé (128-136, demi-tempo, boucles d'accords) ; 12e style ROCK calme / fort
  (GUITARE SATURÉE : l'accord entier dans un seul « ampli », quintes à vide i · iv · III · VI, le couplet coupe la guitare de 12 dB) ;
  L'ÉNERGIE PAR PARTIE (couplet B : basse −3, charleys −4 dB ; le retour C : cymbale + coup sourd).
- LE MÉLANGE : une musique sur deux emprunte 1-2 gènes (rythme · harmonie · timbres · basse) à un autre style ; le tempo suit le
  rythme ; le rock ne prête pas ses quintes à vide. Nom affiché « trap luxe × lo-fi (timbres) ».
- Bug corrigé : sur une quinte à vide (2 notes) le contre-chant visait une 3e note (NaN) et l'erreur BLOQUAIT l'horloge → `pas` sous
  try/catch (une note ratée n'arrête jamais la musique), notes non finies ignorées.
- Mesuré (muet) : 12 styles + mélanges, 0 note hors gamme, 0 erreur, pic 35-65 voix ; le couplet baisse bien basse/charleys, le retour
  balaie le filtre.
- 2026-10-14 — v2, Léo : « on s'endort un peu ; transforme-les tous en mieux, même si parfois c'est bien, c'est juste trop régulier »
  + « tu arrives à atteindre une belle mélodie qui repose, joue sur ça » (+ « oublie IN DA BACK »). Les MÉLODIES et les accords sont
  GARDÉS tels quels (v1 dans le scratchpad) ; tout ce qui les entoure cesse d'être régulier : tempo +4 BPM ; BREAK suspendu à la fin du
  1er passage (mesure de 5 temps, tout s'arrête sur le 3e temps, le piano relance en 4 doubles croches) ; piano À L'ENVERS qui aspire
  vers A2 et A3 ; ralenti à la fin de la respiration puis le DERNIER PASSAGE UN TON PLUS HAUT, et 2 mesures (ii · V) pour rentrer à la
  maison avant la boucle ; APPEL ET RÉPONSE (un 2e instrument répond pendant que la mélodie tient sa note, jamais à moins d'une tierce) ;
  le piano change de façon de jouer à chaque mesure (roulé, en avance, charleston, relancé) ; batterie qui ne joue jamais deux fois la
  même mesure (kick qui change toutes les 2 mesures, 4e mesure qui tourne, fantômes, demi-temps au début de la 2e partie, roulements
  variés) ; basse avec note d'approche chromatique. Un crochet par version : MATIN = petit synthé en 2e partie · DIMANCHE = guitare funk
  étouffée · NUIT = chœur sombre · POLAROÏD = ARRÊT DE BANDE au break · GRAND CIEL = cordes.

## 2026-10-14 (nuit, suite) — LES GOÛTS + TRENTE MOTEURS v3 (« c'était mieux avant… solidifie la composition, suis l'intensité du jeu »)
- **LES GOÛTS** (« tous les sons pouce en l'air doivent solidifier le générateur ») : 👍 / 👎 sur chaque musique générée (traits exacts +
  les goûts qui l'ont faite, dans `musique-moteur.json` › `gen`) + ses 👍 de la bibliothèque (table `TRAITS` de la page : AURA, NÉON NOIR,
  GLISSE FUSION, NUIT DE VELOURS, NÉON DRIVE, ALTITUDE, PENTHOUSE ; IN DA BACK et BOR mesurés : 99 et 136 BPM, mineur, un seul accord) →
  des POIDS (couleur, mode, clavier, mélodie, boucles d'accords, thèmes aimés que le générateur redéveloppe) figés dans
  `assets/audio/music/direct/gouts-trente.json` (POST /gouts) — c'est ce fichier que le JEU chargera. « Mes musiques aimées » : les rejoue
  à l'identique (n° + goûts de l'époque). Un son liké compte une fois par couleur (sinon LUXE/NÉON ×4 étouffaient VELOURS).
- Verdict sur la v2 (12 styles) : « c'était mieux avant ; tout est un peu générique et en vrac ». → **v3** (`musique-trente.js`) ; v1 et v2
  gardées (`musique-trente-v1.js`, `-v2.js`), en cartes dans la bibliothèque et au sélecteur du générateur pour comparer.
- **v3 = une identité, trois couleurs** (celles de ses 👍) : NÉON (synthwave 104-112), VELOURS (french touch 116-122, filtre qui balaie),
  LUXE (trap de luxe 130-140, boucles d'accords, 808). **Le métier** : accords MENÉS (renversement le plus proche + « drop 2 », aucune
  seconde mineure collée : 0 sur 4 800 accords, 0,66 demi-ton de mouvement par voix) ; mélodie en PHRASE question / réponse (cadence
  ouverte mesure 4, sommet mesure 7, fondamentale mesure 8) ; contre-chant sur les notes-guides (tierce / septième) ; basse calée sur la
  grosse caisse + note de passage vers l'accord suivant ; la main (±4 ms, ±8 %, 2-3 variantes par tambour) ; stéréo (nappes, claviers,
  mélodies), cordes pincées Karplus-Strong (« harpe de verre », arpèges, partie B), coupe-bas par bus, pompe, saturation + colle.
- **L'intensité du jeu** (`music.regle({nitro, vol, flow, frenesie})`, `music.evenement('pose'|'crash')`) : VOL = batterie et basse coupées
  tout de suite, grave coupé (420 Hz), réverbe ouverte ; POSE = retour sur le temps + coup sourd (PARFAIT : cymbale + gerbe) ; NITRO =
  charleys doublés, filtre grand ouvert, souffle, mélodie à l'octave, cymbale au lâcher ; FLOW = fantômes, relances, appoggiatures,
  arpège en doubles ; FRÉNÉSIE = à la mesure, grille sombre (seconde mineure), demi-tempo trap, roulements, +4 % ; CRASH = tout s'effondre.
  Page : NITRO (N), VOL (espace, relâcher = pose), POSE PARFAITE, FRÉNÉSIE (F), FLOW, CRASH, « Simuler la course ».
- Mesuré (muet) : prêt 0,16-0,22 s, banque complète 0,4-0,5 s, 0 note hors gamme (frénésie comprise), 0 erreur, pic 38-55 voix ;
  vol : batterie à 4 % en 0,3 s, 22 → 9 sons/s ; nitro : filtre 3,8 → 16 kHz ; crash : volume à 5 % en 0,7 s puis arrêt.
- ⚠ Une autre session a ajouté des ONGLETS à bibliotheque.html le même soir (#generateur, #lobby-chris…) : on édite le même fichier, attention aux écrasements.
- 2026-10-14 — v3, Léo : « mais c'est vraiment les mêmes, c'est fou ça, change ça » → les cinq avaient le même piano, la même nappe,
  la même batterie, la même forme. Chacune a désormais SON monde (moteur `comp` / `kit` / instruments par version dans lobby_chris.py) :
  PREMIER MATIN = piano feutré + groove doux (94) · DIMANCHE = BOSSA, guitare nylon, flûte, contrebasse, clave (104, pas de break) ·
  GARAGE DE NUIT = LO-FI hip-hop, Rhodes, trompette bouchée, 808, vinyle, swing lourd, arrêt de bande au break (74, sans +1 ton) ·
  POLAROÏD = tout en SYNTHÉS, arpège en doubles croches, basse carrée en octaves, petit Moog, beat électro (108) · GRAND CIEL = AMBIANT
  sans batterie, nappes immenses, cordes, piano en octaves, un battement de cœur au sommet (64). Mélodies gardées.

## 2026-10-14 (nuit, fin) — v3.1 : TRANSITIONS VARIÉES, L'INTENSITÉ PLUTÔT QUE L'ACCUMULATION, LA SIGNATURE
Léo sur la v3 : « c'est top », mais « l'effet de transition est un peu répétitif » · « un peu plus de variété » · « si c'est trop dur
d'accumuler trop d'instruments, fais juste évoluer la musique dans son intensité » · « inspire-toi à chaque fois de l'état d'esprit plein
d'originalité et d'identité, comme pour les boucles du lobby quand je t'ai dit que c'était trop la même chose ».
- **Transitions** : un RÉPERTOIRE par couleur (roulement, toms, charleys, souffle = cymbale à l'envers calée sur le 1er temps, TROU d'une
  croche, filtre qui plonge, glissé de basse vers l'accord, bégaiement, rien), jamais les deux derniers ; trois montées pour les grands
  moments (souffle + roulement · trou · filtre qui se ferme puis se rouvre) ; l'arrivée n'a plus de coup sourd systématique ; fins de
  phrase variées (une fois sur deux passé le 6e moteur, vers l'accord de la phrase SUIVANTE). Mesuré sur une montée 1 → 30 : filtre, trou,
  souffle, toms, pickup, roulement, rien… jamais deux fois le même d'affilée.
- **L'intensité** : l'échelle des 30 moteurs = ~15 instruments + des MARCHES (le son s'ouvre un peu, la basse s'anime = sa variante la plus
  active, la batterie frappe plus fort +1,5-2 dB, les charleys en doubles, l'espace s'élargit = réverbe, les relances de grosse caisse,
  le son se durcit = saturation, la mélodie monte d'une octave, le clavier s'anime).
- **Variété** : 5 formes (A A′ B C · A B A′ C · A A′ B B′ · A B C A′ · A A′ C B), plus de grilles et de motifs de batterie / clavier, la
  partie B jouée par la corde pincée, la cloche ou la mélodie à l'octave.
- **LA SIGNATURE** (l'esprit des boucles du lobby) : chaque musique a une IDÉE, un son du monde CASH CAR accordé dans sa tonalité qui
  revient comme un gimmick : le moteur qui chante (vroum fondamentale-quinte-octave), le turbo (soupape + sifflet), la caisse enregistreuse
  (ka-ching sur la tonique), la pluie de pièces, le néon qui grésille (50 Hz), les klaxons (fondamentale + tierce), les gouttes de verre,
  les accords à l'envers (vaporwave), la sirène au loin ; 1re signature au 5e-8e moteur, une 2e (40 %) au 17e-22e ; le titre et « l'idée »
  (affichée dans la page) en découlent. Mesuré : 0 note hors gamme sur les 9, aucune erreur, chacune audible (crête −9 à −22 dB).

## 2026-10-14 (aube) — UN SEUL GÉNÉRATEUR, À L'INFINI · 14 INSTRUMENTS PHARES · LA MÉMOIRE DES PARTIES
Léo : « pas trop de fois le même instrument sur plusieurs parties consécutives » · « au moins 8 instruments phares intéressants, là tu bloques
sur deux-trois » · « pourquoi v1, v2 ? le générateur doit être UNIQUE ; supprime les erreurs, solidifie le code pour que le jeu ait les
meilleures musiques générées automatiquement, à l'infini ».
- **Unique** : v1 et v2 retirées de la page et du dossier (copies dans le scratchpad de la session, `anciennes-versions/`). Une seule carte
  TRENTE MOTEURS, un seul générateur.
- **14 instruments phares** (la voix de la mélodie) : synthé scie, synthé de verre, talkbox, cuivre synthétique, sifflet, flûte, carré + NOUVEAUX
  saxophone de minuit (formants de sax, souffle, attaque qui remonte), thérémine (glisse d'une note à l'autre), guitare claire et guitare
  saturée (cordes pincées Karplus-Strong ; la saturée passe dans un « ampli » tanh + haut-parleur), steel drum, kalimba, puce 8 bits
  (impulsion à 25 %). Chaque couleur en tire 8 avec ses affinités. Niveaux mesurés : −11,4 à −13,9 dB (homogènes).
- **Palette élargie** : claviers + piano électrique FM (DX7) ; basses + acid, reese, slap, 808 saturée, sous-basse qui glisse ; nappe scie ou douce.
- **La mémoire des parties** (`historique`, gardé par la page en localStorage `trenteHisto`) : couleur, clavier, basse, nappe, signature
  des 2 dernières musiques ×0,1 / ×0,35 ; l'instrument phare des 3 dernières ×0,04 / ×0,15 / ×0,45. Mesuré : 12 parties d'affilée, 0 répétition
  consécutive (couleur, clavier, mélodie, basse, signature). Un numéro rejoué reste identique (les poids sont gardés avec la musique).
- **À l'infini** (`renouvelle`, 12 phrases ≈ 3-4 min par défaut) : une musique neuve se prépare en coulisse et prend le relais sur une fin de
  phrase, même moteur. Robustesse : un son qui ne se fabrique pas est sauté, composition et démarrage sous garde (2e chance), une note ratée
  n'arrête jamais l'horloge, caches remis à zéro à chaque musique.
- **Bug trouvé à l'endurance et corrigé** : sortir de la FRÉNÉSIE au milieu d'une phrase laissait la mélodie calculée pour les accords sombres
  (un si♭ sur un la mineur) → la mélodie est recalculée à chaque bascule (`poseMelodie`).
- Mesuré (muet, renouvellement accéléré à 2 phrases, course simulée) : 84 s, 6 musiques à la suite, 6 phares différents, 0 fausse note / 850,
  0 erreur, pic 44 voix, mémoire qui monte puis redescend (≈40-70 Mo : les anciennes banques sont libérées). 3 000 compositions : 0 panne.

## 2026-10-14 — LES PETITES MUSIQUES (`atelier-son/petites_musiques.py` → `assets/audio/music/petites-musiques/`)
Léo : « faisons d'autres petites musiques ; sois toujours original, ne fais pas les mêmes choses ». Cinq mondes jamais faits, ~1 min
chacun, chacun sa mesure, ses instruments et sa forme (rien du déroulé des lobbys Chris : ni break, ni piano à l'envers, ni +1 ton) ;
une mélodie calme dans chacun. Moteur neuf `Partition` (n'importe quelle mesure : 3/4, 4/4, 12/8 en triolets). Onglet « Petites
musiques » de bibliotheque.html (`window.PETITES_MUS`). Vérification d'harmonie intégrée (frottements d'un demi-ton : 0-2, voulus).
- VALSE LENTE (3/4, ré m → fa, 84) : accordéon musette (3 anches désaccordées), harpe « poum-tchak-tchak », contrebasse qui descend
  ré · do · si♭ · la, glockenspiel au dernier passage.
- REFLETS (si♭ lydien, 116) : minimalisme, deux marimbas sur la même cellule, la 2e décalée d'1 puis 2 puis 3 doubles croches ;
  clarinette en notes longues.
- SOLEIL BAS (sol m, 72) : dub, one drop, guitare en contretemps, orgue qui bulle, basse qui chante, mélodica ; section dub au milieu.
- PIXEL DOUX (fa, 96) : berceuse 8 bits, carré + son écho de cartouche, triangle 4 bits, bruit, arpèges éclair, tierce à la fin.
- SIFFLEUR (12/8, mi♭, 58) : ballade soul, orgue à tirettes en cabine Leslie, Rhodes sur le dernier triolet, balais, sifflement.
- 2026-10-14 — TRI DE LÉO : « REFLETS intéressant, à ajouter dans INSPI pour sons générateurs » → déposé dans les Inspirations du
  générateur (POST /inspi, avec une note qui décrit le déphasage) ; « SIFFLEUR top pour lobby Chris » → rangé dans Lobby Chris
  (fichier dans `lobby-chris/`, `rangement='chris'` dans petites_musiques.py). Il a retiré VALSE LENTE, SOLEIL BAS, PIXEL DOUX et
  l'ancien Lobby. 👍 : PREMIER MATIN, GARAGE DE NUIT, SIFFLEUR.

## 2026-10-14 (matin) — LES GOÛTS MESURÉS : ses sons aimés contre ses sons supprimés
Léo : « les musiques aimées, il ne faut pas les enregistrer en tant que son mais en soutirer toutes les données intéressantes pour nourrir ;
les petits sons effacés et les sons complets, compare et comprends pourquoi je ne les ai pas aimés, sinon supprime ; supprime "petites
musiques" et "lobby", il n'y a rien dedans ».
- `atelier-son/gouts_mesures.py` mesure (analyse_inspi.py, `analyse_x`) 12 sons AIMÉS (AURA, NÉON NOIR, GLISSE FUSION, NÉON DRIVE · MOTEUR,
  ALTITUDE, NUIT DE VELOURS, PENTHOUSE, IN DA BACK, BOR, et du Lobby Chris PREMIER MATIN, GARAGE DE NUIT, SIFFLEUR) et 38 SUPPRIMÉS (les
  boucles de lobby, les « petits sons », les anciennes musiques Suno, les aperçus du chef d'orchestre, les petites musiques…) ; morceaux à
  couches = couches additionnées ; à paliers = le dernier palier → `assets/audio/music/direct/gouts-mesures.json` (mesures, comparaison,
  leçons, poids).
- **Les leçons** : JAMAIS CLINQUANT — 0 des 12 aimés au-dessus de 2 800 Hz de brillance (max 2 615), contre 13 des 38 supprimés (les vieilles
  musiques Suno ~3 000-3 300 Hz, les aperçus du chef ~3 000+, les lobbies les plus brillants) ; plus sombre en moyenne (1 836 contre
  2 186 Hz) ; basse plus lourde (+3,1 dB) ; tempo pareil (~118-120). (Tonalité/mode : la détection se trompe sur les morceaux saturés —
  NÉON NOIR sort « do majeur » — à ne pas surinterpréter.)
- **Branché** : la page fond les poids mesurés dans gouts-trente.json (W.clarte .88, W.basse_db +1,6, W.bpm 119, mode/boucles) et montre
  « Ce que tes goûts disent » ; le générateur adoucit le haut (clarté ouverte ×clarte^4,5 ≈ 9 kHz, charleys/cymbales −2,2 dB), alourdit la basse,
  tire le tempo vers 119. MESURÉ sur la sortie du générateur (moteur 30) : 1 950-2 330 Hz sans → 1 180-2 170 Hz avec (dans sa plage).
- **Retirés de la page** : sections « Petites musiques » et « Lobby » (vides), la corbeille « Sons supprimés » (mesurés puis retirés pour de
  bon de la bibliothèque — les FICHIERS restent : ADDICTIVE LOOP, NOITE… jouent encore dans le jeu), la liste « Mes musiques aimées » (ses
  👍/👎 restent en DONNÉES dans musique-moteur.json › gen et nourrissent les goûts). Ses avis générés : 👍 NÉON piano/carré ×2, 👍 LUXE
  harpe/verre/808/sirène, 👎 VELOURS Rhodes/sifflet/funk.
- 2026-10-14 — **LE LOBBY « CHRIS » SUR LE MAIN** (« applique les lobby Chris dans la musique lobby du main ») : `MUSIC_LOBBY` = les six
  (PREMIER MATIN, DIMANCHE, GARAGE DE NUIT, POLAROÏD, GRAND CIEL, SIFFLEUR), une au hasard à chaque lancement ; `SON_TON` accordé ;
  sw v357 (main a22e6d3). Fichiers RECOUSUS pour boucler sans couture (`atelier-son/boucle_aac.py` : débord + liste d'édition `elst`,
  iTunSMPB retiré ; `atelier-son/lobby_main.py` les refait) — mesuré dans Chrome : durée exacte, aucun creux à la reprise (l'AAC brut
  d'afconvert durait 54 ms de trop). VAPEUR · SALON et ASCENSEUR DORÉ ne sont plus tirés (fichiers gardés).

## 2026-10-14 — TRENTE v3.4 : deux nouveaux styles, cinq formes de mélodie, le 15 → 28 qui pousse, plus aucun instrument commun
Léo : « l'évolution entre le niv 15 et 28 encore un peu molle, ça pourrait être plus intense ; arrête d'utiliser un instrument commun entre
chaque génération, ça s'entendrait dans le jeu » puis « c'est encore un peu toujours la même, mais ne perds pas tes compétences : tu fais
vraiment de belles musiques qui donnent envie d'aller plus vite ».
- **Cinq couleurs** : NÉON · VELOURS · LUXE + **DRIFT** (phonk de drift, 124-134 BPM : la cloche de vache — accordée à la QUINTE, pas
  à 1,48 comme la 808 — qui chante le riff dès le 1er moteur, la 808 saturée, le phrygien, des accords de trois sons, les pneus qui
  crissent accordés) et **TOUGE** (eurobeat de col, 148-156 BPM : la basse qui rebondit en octaves, les cuivres sur les contretemps,
  supersaw, grilles VI · VII · i). Les goûts penchent sans enfermer : la racine de leurs poids (couleur, mode).
- **Cinq formes de phrase** (classique · riff · appel · envol · longues), le couplet en prend une autre ; **l'ouverture** (3 premiers
  moteurs) est tirée parmi 3-4 par couleur.
- **Le 15 → 28** : une rampe continue (fantômes, fins de phrase, cymbale toutes les 4 mesures, son plus dense et plus fort, tempo +2 %)
  + des marches qui poussent : la batterie qui double vers le 21e, la basse doublée à l'octave, la batterie qui s'emballe (toms,
  cymbales), la pulsation des contretemps, chaque fin de 4 mesures qui monte (souffle · roulement · toms, à tour de rôle). Échos de la
  mélodie toujours là (l'élément « échos » et « la basse qui amène » ont rendu leur place aux marches).
- **Plus aucun instrument commun** : chaque rôle a plusieurs timbres (arpège ×5, contre-chant ×4, nappe ×4, cordes ×2, chœur ×3 voyelles,
  caisse claire ×3, montée ×2, grosse caisse ×3, charleys/cymbale accordés) et la mémoire EXCLUT ceux de la musique d'avant (×0, rôle par
  rôle, couleur et signature comprises ; ×0,35 l'avant-dernière).
- **Mesuré au banc muet** (5 couleurs, moteur 1 → 30, nitro/vol/pose/frénésie) : 0 note hors gamme sur 4 138, 0 erreur, 55 voix au pic
  (64 max), sonie du 14 au 28 : NÉON +5,4 dB, TOUGE +5,4, DRIFT +3,9, VELOURS +3,5, LUXE +3,1 ; 40 générations d'affilée : 0 rôle
  partagé avec la précédente ; 2 000 compositions, 0 échelle cassée. ⚠ Les anciens numéros ne rejouent plus la même musique (tirages changés).
- Page : la ligne « La mélodie : forme · arpège · contre-chant · nappe » ; le générateur toujours chargé frais (`?v=`).

## 2026-10-14 — TRENTE v3.5 : UN STYLE À CHAQUE PARTIE (14 styles) · l'aigu qui se repose · ZEF (Die Antwoord)
Léo : « c'est toujours un peu la même, toujours un aigu : trouve un moyen d'être original à chaque génération, sinon ça casse les oreilles »
· « à chaque fois ça me donne une structure qui crée le même style de musique, il faut un style à chaque partie » · Die Antwoord
« Age of Illusion » : « ressource-toi » (déposé dans Inspirations, mesuré : 83 BPM, la mineur, do ↔ la m, basse +24 dB, brillance
1 311 Hz, 13 dB de contraste — ponts sans basse puis le drop).
- **14 styles**, chacun un monde entier (tempo, groove, langage d'accords, instruments, ordre d'entrée, registre) : NÉON · VELOURS · LUXE ·
  DRIFT · TOUGE + HYPERVITESSE (drum & bass liquide 170-176) · BOULE À FACETTES (disco funk, dorien/mixolydien, basse en octaves, clavinet,
  cuivres, congas) · 2-STEP (UK garage, grosse caisse qui saute, balance .12, orgue, chœur haché) · NUIT LO-FI (84-90 → ~100, balance .18,
  vinyle) · TURBINE (big beat : accords de QUINTE à la guitare saturée — nouvelle qualité « 5 » — breakbeat, ride, toms) · PIXEL (chiptune :
  basse triangle, accords 8 bits, caisse 8 bits, parfois en MAJEUR) · GRAND PRIX (épique : cordes, ostinato de bois, toms, cuivres, chœur, la
  dominante V7) · MALECÓN (dembow 3-3-2, steel drum, kalimba, marimba, 808) · ZEF (rave-rap sombre : 80-86 → ~98, deux accords, 808
  saturée +3 dB, accords de rave, ponts sans basse presque à chaque fin de forme). La mémoire écarte les QUATRE derniers styles.
- **L'aigu se repose** : un plafond par style (80-86 en MIDI, toute voix plus haute redescend d'une octave, même note — sifflet du turbo,
  pièces, cloche, arpège…), cordes/accords hachés à l'octave du milieu sous 85, arpège + cloche + charley ouvert muets dans le couplet
  (moteur ≥ 8), la rampe du 15-30 pousse grosse caisse et basse (charleys +0,5 dB au lieu de +2), UNE cymbale par phrase (le final :
  toutes les 4 mesures, plus toutes les 2), le souffle des montées plafonné à 5,2 kHz, la cloche de vache plus ronde.
- **Mesuré au banc muet** (les 14, moteur 1 → 30) : 0 note hors gamme sur ~7 300, 0 erreur, ≤ 55 voix ; 3 000 compositions, 0 échelle
  cassée ; 60 générations d'affilée : jamais un style des 4 derniers, aucun timbre partagé avec la précédente.

## 2026-10-14 — TRENTE v3.6 : chaque partie sonne comme un AUTRE ARTISTE · STADE (techniques de Stuck in the Sound)
Léo : « si j'appuie sur changer de musique, il n'y aura pas un air de ressemblance ? » → « 1, 2, 3, et trouve une solution, essaie de
comprendre ce que je cherche » ; puis Stuck in the Sound « Let's Go » : « tu peux copier ces techniques aussi ».
- Le diagnostic : l'air de famille venait surtout de la PRODUCTION (même grosse caisse sinus, mêmes charleys de métal, même réverbe de
  2,6 s, même écho) et de la courbe (les grands moments aux mêmes moteurs), plus que des notes.
- **La production par style** (`PROD`) : grosse caisse (ronde · 909 · 808 · acoustique · étouffée lo-fi · 8 bits · tambour grave),
  charleys (métal · souffle · FM de verre · shaker · 8 bits), caisse claire acoustique, SALLE propre (pièce sèche 0,7 s → cathédrale
  4,2 s, sombre ou brillante ; une réverbe neuve en fondu à chaque musique), écho (croche, croche pointée, noire, noire pointée), retour,
  saturation. Chaque style a au moins deux kits, la mémoire écarte celui de la musique d'avant.
- **Plus de lumière** : majeur et lydien ajoutés à NÉON, VELOURS, LO-FI, HYPERVITESSE, DISCO, 2-STEP, GRAND PRIX ; les goûts « mineur »
  pèsent moins (puissance .35) et le mode d'avant ×0,45. Mesuré sur 3 000 : mineur 58 %, majeur 19 %, dorien 13 %, sombre 5 %, lydien 3 %.
- **La courbe** : mélodie du 1er au 13e moteur (un quart des musiques la gardent pour un « drop » vers le 10e), grosse caisse du 2e au
  13e (un quart la retiennent jusqu'au 9e-12e), batterie qui double du 16e au 25e, montée d'un ton du 23e au 28e — ou aucune (29 %).
- **STADE** (Let's Go mesuré : 89 BPM, ré majeur, I ↔ vi, 66 mesures d'énergie pleine, brillance 2 548 Hz, toms qui martèlent) :
  indie rock en majeur, toms en rythme dès le 1er moteur (élément `tribu`), guitare grattée (cordes pincées claires), basse en
  croches, et le CHŒUR DE STADE (élément `foule` : huit voix sur « oh » qui chantent le thème une octave sous la mélodie, + « HÉ ! »
  toutes les deux mesures) — aussi dans TURBINE et TOUGE. 15 styles en tout.
- Page : la ligne « Le son : grosse caisse · charleys · salle · mélodie au Xe moteur, grosse caisse au Ye, montée d'un ton au Ze ».
- 2026-10-14 — **LE CIEL SE TAIT, LE GARAGE JOUE** (main 25b96b4, sw v363), Léo : « la musique se lance seulement quand j'appuie sur le mode
  garage (léger filtre adapté) ; quand on est et qu'on revient dans le menu ciel, un bruit de chute libre doux ». Au ciel : le lobby en
  pause (`MUS_TAIT`), une CHUTE LIBRE DOUCE (`chuteDoux` : deux souffles qui respirent) ; au garage : le lobby repart en fondu ; filtre de
  l'atelier CUIT dans les six fichiers du main (aigus −4,4 dB > 3,5 kHz + petite pièce 0,7 s à 15 %, `garage()` de lobby_main.py).
- 2026-10-14 — **RÉGLAGES DU SOIR** (main 4e64b94, sw v366) : « le vent est fort ; la musique derrière le vent, moins fort qu'au garage » →
  vent −8 dB (CHDOUX_VOL .06), musique au ciel ; « la boutique a son propre son ambiant » → `bqSon` (nappe de verre E 6/9 ↔ C#m7(11)
  accordée sur les petits sons, air de la salle, notes cristallines) ; « la musique vraiment très légère au ciel, comme si on l'entendait en
  tombant » → MUS_CIEL .15, elle plonge sous les rafales du vent (CHDOUX.h). Ciel .03-.055 · garage .31 · boutique : son ambiant seul.

## 2026-10-14 — TRENTE v3.7 : LES VRAIS INSTRUMENTS (VSCO-2 CE, CC0)
Léo : « bien essayé mais c'est toujours générique · toujours les mêmes sons · toujours la même erreur » → choisi : « vrais instruments
libres » ; « tu vas pouvoir les retoucher et imiter des sons qu'on a déjà écoutés ».
- Le diagnostic : la SOURCE des sons — 15 styles, mais la même vingtaine de recettes d'oscillateurs ; varier les réglages ne change pas
  leur nature.
- **La banque** : VSCO-2 Community Edition (github.com/sgossner/VSCO-2-CE, licence CC0 = domaine public, OK App Store). 212 WAV choisis
  (~240 Mo téléchargés HORS du projet, scratchpad), traités par `atelier-son/vrais_instruments.py` → `assets/audio/music/direct/vrais/`
  : 207 échantillons, **4 Mo** (AAC), `vrais-index.json`, `LISEZMOI.txt` (crédit). Hauteur MESURÉE (YIN + décalage d'octave par
  instrument ; les lames vérifiées au pic du spectre : le nom de VSCO est une octave sous le son), silence de tête retiré, durée bornée,
  fondu, crête −1 dBFS. Piano, harpe, violons, violon solo, violoncelles (tenus/pincés), contrebasse, trompette (+ bouchée), cor,
  trombone, tuba, flûte, clarinette, hautbois, basson, glockenspiel, marimba, xylophone + 34 percussions.
- **Dans le générateur** : chargeur partagé (cache des seules musiques en cours, l'amorce AAC retirée au décodage, niveau calé sur
  l'énergie), `VRAIS_STYLE` (quels vrais par style : clavier, mélodie, arpège, contre-chant, nappe, cordes = violoncelles + violons,
  cuivres = trombone + trompette piqués, basse, kit réel), « @piano » dans un tirage = le vrai ; RETOUCHES (lo-fi, sombre, radio,
  saturé) passées sur les vrais instruments selon le style. La mélodie et le clavier préfèrent les vrais.
- **Mesuré** : 87 % des musiques ont de vrais instruments ; banc muet des 15 styles : 0 note hors gamme, 0 erreur, 0 son raté, démarrage
  0,2-1,6 s, banque complète 0,9-3,3 s, ≤ 51 voix.
- 2026-10-14 — **LE BRUIT LOUCHE DE LA BOUTIQUE** (main ecea378, sw v367), trouvé par mesure au banc muet : en boutique, l'atelier sonnait
  encore (le néon qui grésille + la porte en feu, au niveau de la nappe, sous le glitch). Ils plongent à −45 dB en boutique et reviennent à
  l'atelier ; la nappe attend la fin du glitch.

## 2026-10-14 — LE JUKE-BOX ADAPTATIF (la musique adaptative : de vrais morceaux en couches, re-séquencés, pilotés par la course)
Léo : « y a-t-il un autre mot ou un autre concept plus réalisable qui suit mon idée ? » → la MUSIQUE ADAPTATIVE (couches + re-séquençage,
celle des gros jeux : DOOM 2016, No Man's Sky) → « ouais bonne idée ».
- `assets/audio/music/direct/jukebox.js` (module autonome, MÊME interface que musique-trente.js : start/stop/nouvelle/setTier/regle/
  evenement/tirage/historique — le jeu pourra changer de moteur sans rien changer d'autre). Lit ses morceaux validés : PALIERS figés
  (AURA, NUIT DE VELOURS, GLISSE FUSION, NÉON NOIR, CIEL, PENTHOUSE) et COUCHES aimées (NÉON DRIVE · MOTEUR, ALTITUDE) — les supprimés et
  les trop courts écartés. Un morceau par partie, jamais un des 3 derniers ; la relève au bout de ~3 min 20 sur un début de cycle
  (cymbale) ; 🎲 = la relève à la mesure suivante.
- Le palier suit le moteur (découpage de musique-paliers.js), à la mesure ; les couches entrent à leur seuil ; leurs VARIANTES (a/b)
  changent de cycle en cycle. Sections : respiration (1-2 paliers plus bas, ou la batterie qui se tait, un cycle), et une fin de cycle
  tirée sans redite (bégaiement du dernier temps · coupure · filtre qui plonge · relance par la vraie cymbale qui monte).
- Pilote : NITRO (le son s'ouvre et sature + souffle ; lâchée > 1 s = vraie cymbale sur le temps) · VOL (coupe-bas 420 Hz, réverbe) ·
  POSE (sur le temps, coup sourd ; PARFAIT + cymbale) · FRÉNÉSIE (les derniers paliers, saturé) · CRASH (la bande qui ralentit).
- L'amorce AAC (~48 ms) coupée au décodage : la boucle dure exactement sa durée.
- Page : Source JUKE-BOX (par défaut) / GÉNÉRATEUR dans le panneau ; la ligne dit le palier, ce qu'on entend, les sections jouées, le
  morceau suivant. Banc muet : paliers 1 → 8 suivis, couches et variantes a → b, vol, frénésie, relève NÉON NOIR → CIEL, 🎲 → PENTHOUSE,
  crash, 0 erreur.
- LA SUITE : le générateur devient l'USINE — ce que Léo 👍 dans le générateur sera FIGÉ en morceau à paliers et entrera au juke-box.
- (même soir) Léo : « non, reviens sur le générateur, à la fin c'était mieux » → le panneau rejoue le GÉNÉRATEUR (v3.7, vrais
  instruments) ; le sélecteur est retiré ; jukebox.js reste sur le disque, inutilisé.

## 2026-10-14 — TRENTE v3.8 : LE MORCEAU COMPLET · la finition · la 2e banque (VCSL) · les transformeurs
Léo : « travaille encore un peu la compo en t'inspirant de l'aspect finalisé des sons que j'ai bien aimés (aussi ceux gardés dans le
juke-box) … même si aucun ne suivait aussi bien l'intensité des moteurs que tu l'as fait là ; t'as juste à harmoniser le reste » ;
« permets-toi d'apprendre encore plus d'instruments, d'effets et de transformeurs de sons gratuits ».
- **Le socle** : dès le 1er moteur, un vrai morceau (l'ouverture du style, l'harmonie, la basse + sous-basse, la batterie, la mélodie),
  retenu (filtre ×0,45 → ouvert au 8e, charleys −6 dB, caisse −4, grosse caisse −3, mélodie −2,5) ; le reste et les marches
  d'intensité s'étalent du 2e au 30e. Une grosse caisse ou une mélodie gardées pour un drop restent possibles (socle de 3 à 7 éléments).
- **La finition** : pompe toujours là, grave +2,5 dB à 90 Hz, haut −1,5 dB à 9 kHz, largeur stéréo (Haas 11 ms : nappe, clavier,
  cordes, chœur), sous-basse sous toute basse non-808, et le NIVEAU HARMONISÉ (régleur lent : −11 → −8 dB efficaces du 1er au 30e,
  figé pendant le vol, la respiration, le crash).
- **La 2e banque** : VCSL (github.com/sgossner/VCSL, CC0) — 173 WAV (~290 Mo hors du projet) : saxophone ténor, harmonica, ocarina, flûte
  à bec, piano à queue, clavecin, piano FM et clavisynth (TX81Z), vibraphone, kalimba, mbira, balafon, carillon à main, verres chantants,
  strumstick ; vraie batterie (charleys fermés/ouvert, claps, caisses claires modernes, grosse caisse de kit, cajón, darbouka, tambourin,
  cabasa, woodblock, vibraslap, arbre à cloches, ocean drum, sirène, didgeridoo, cymbales qui montent). Banque totale : 387 sons, 7,3 Mo
  (`atelier-son/vrais_instruments.py` fond les deux bibliothèques ; le clavisynth sonne deux octaves au-dessus de son nom — vérifié au
  spectre ; les cloches tubulaires, trop inharmoniques, ne sont pas employées).
- **Les transformeurs** (`transforme`, hors temps réel, sur clavier/nappe/mélodie selon le style) : chorus, phaser, trémolo calé sur le
  tempo, bande magnétique (pleurage + saturation), 8 bits, octaveur, nappe à l'envers (l'accord qui vient, aspiré).

## 2026-10-14 — TRENTE v3.9 : LES UNIVERS SONORES et la justesse des vrais sons
Léo : « il y a des instruments qui parfois ne vont pas ensemble, tu arrives à voir ? » — deux causes trouvées :
- **Les mondes mélangés** : chaque rôle tirait son timbre seul (violon classique + piano FM + cor sur de la synthwave ; harmonica en
  french touch avec harpe et congas). → Chaque musique tire d'abord son UNIVERS : ÉLECTRONIQUE (synthés seuls) · HYBRIDE (UN héros vrai,
  la mélodie ou le clavier, sur un lit de synthés) · ACOUSTIQUE (les vrais d'une même FAMILLE : orchestre · jazz · folk · rétro), selon le
  style (`UNIVERS`, `FAMILLES`) ; les percussions réelles vont partout ; la mémoire rend l'univers d'avant moins probable. Mesuré sur
  2 000 compositions : 0 vrai instrument en électronique, 0 deuxième héros en hybride, 0 hors famille ; hybride 42 %, électronique 36 %,
  acoustique 21 %. Exemples au banc : LO-FI jazz (piano, trompette bouchée, contrebasse, vibraphone, flûte), GRAND PRIX orchestre (harpe,
  trompette, tuba, cor, violons pincés, hautbois, cordes, cuivres), MALECÓN folk (piano, flûte à bec, balafon).
- **Les vrais sons pas tout à fait justes** : la justesse de chaque note mesurée (pic du spectre affiné, `justesse` dans
  vrais_instruments.py) et rangée dans l'index ; le lecteur la rattrape au cent près. Écarts trouvés : kalimba et mbira jusqu'à ±50 cents
  (accordage traditionnel), xylophone +15 partout, tuba −43, piccolo/clarinette piquée −31…

## 2026-10-14 — POUCE BLEU (ses 👍 du générateur) · les VERSIONS gardées · la SALLE DE RÉPÉTITION
- Léo : « récupère tous ceux que j'ai bien aimés, mets-les dans une nouvelle catégorie (pouce bleu) » → « seulement les musiques pouce
  bleu du générateur ». Onglet **Pouce bleu** (bibliotheque.html, après Générateur) : ses 16 musiques 👍, chacune REJOUÉE PAR LA VERSION
  QUI L'A FAITE (numéro + goûts du moment gardés avec l'avis). Les versions sont gardées dans assets/audio/music/direct/ :
  musique-trente-v3-1.js, v3-3, v3-4, v3-7, v3-9 ; les anciens avis ont leur version déduite de l'heure (UTC) ; chaque nouvel avis note
  `T.version` (`export const VERSION` dans musique-trente.js). ⚠ RÈGLE : avant de modifier musique-trente.js, le copier en
  musique-trente-<VERSION>.js et monter VERSION. Vérifié : les 16 se recomposent à l'identique (même titre tiré). Retirer le pouce dans
  Pouce bleu = avis 0 (neutre pour les goûts).
- Léo : « là c'est moins bien qu'avant le générateur, prends le temps d'apprendre tes nouveaux instruments et effets, révise dans une
  salle de musique avec un public imaginaire réaliste » → `atelier-son/salle-repetition.js` : joue des musiques muettes et les MESURE
  (sonie et sa montée 1 → 30, crête/RMS, 6 bandes dont la BOUE 250-500 Hz, brillance, RUGOSITÉ de Plomp-Levelt sur les pics, densité,
  mouvement) ; mesure aussi les fichiers de référence ; un PUBLIC IMAGINAIRE note sur 10 : LÉO (proche du profil de ses 👍), LE JOUEUR
  (ça monte, ça ne fatigue pas), LE MUSICIEN (rugosité, boue, densité), L'INGÉ SON (équilibre de ses morceaux figés, dynamique).
- **1re répétition** (12 références figées, ses 16 👍 rejouées par leur version, 15 musiques v3.9) : ses 👍 MONTENT de +18,9 dB du
  moteur 1-4 au moteur 25-30 (début léger, fin énorme — c'est ce qu'il aimait), la v3.9 seulement de +3,6 dB (le socle complet dès le
  1er moteur + le niveau harmonisé avaient aplati la montée) ; v3.9 plus sourde (centre 270 Hz contre 490) et trop de sous-grave (21 %
  contre 16 %, le grave +2,5 dB et la sous-basse partout). Note du public « Léo » : 👍 3,5 · v3.9 0,2.
- **v3.10** (`VERSION`) : socle, régleur de niveau, grave +2,5 / haut −1,5, sous-basse partout, filtre de départ et pompe permanente
  RETIRÉS ; gardés : vrais instruments + justesse, univers cohérents, largeur stéréo ; effets plus rares (« aucun » ×3,5).
  ⚠ LEÇON : « complet / finalisé » ne voulait pas dire « tout dès le 1er moteur » — la grande montée est le cœur de ce qu'il aime.
- **Répétitions suivantes** (15 styles à chaque fois, mêmes graines) :
  · v3.10 : montée +16,6 dB, sous-grave 14 %, mais BOUE 250-500 Hz 11,9 % (ses 👍 : 8,6) ;
  · début un peu plus loin (−3 dB au 1er moteur, plein au 10e) → montée +20 dB ; creux sur les accords seuls : boue 11,6 % → pas eux ;
  · SOLOS (chaque piste seule au 22e moteur) : la boue venait de la BASSE DOUBLÉE À L'OCTAVE (jusqu'à 29 %), du CONTRE-CHANT, de la
    MÉLODIE DOUBLÉE EN DESSOUS et de la basse (le tuba de GRAND PRIX : 60 %) → creux à 330 Hz piste par piste (`BOUE` : basse2 −5,
    octave −4, accords/contre −3,5, tierces −3, basse −2, mélodie −1,5) + coupe-bas : boue 9 %, centre 444 Hz, montée +19,7 dB.
  · Public (moyenne) : ses 👍 6,9 · v3.9 5,0 · **v3.10 6,5** (musicien 8,1, joueur 9,7). Restent « ça frotte » : GRAND PRIX, DISCO,
    TURBINE (orchestre plein, guitares saturées) — à écouter avec lui.
- Version gardée : musique-trente-v3-10.js.
- **v3.11** (Léo : « la flûte et les leads aigus, ça suffit pour le générateur ») : plus aucune flûte (synthé, vraie, à bec, ocarina),
  ni sifflet, ni verre, ni verres chantants en mélodie/contre-chant ; mélodie une quarte plus bas (reg −5, plafond ≤ 82), plus d'octave
  au-dessus (marche « sommet » → « l'espace s'élargit », plus d'octave en nitro, couplet sans « haut » ni cloche). Mélodies tirées sur
  2 000 : saxo (vrai et synthé), scie, carré, thérémine, violon, trompette, harmonica, cuivre, clarinette, steel drum, trompette bouchée,
  cloche de vache, puce, talkbox, kalimba, guitares, marimba, cor. Banc : 15 styles, 0 fausse note, 0 erreur. Version gardée : v3-11.
- Pouce bleu : le moteur se monte À LA MAIN (− / + du lecteur, flèches du clavier) — elles restaient au moteur 1 avant.

## v4.0 — LES DA ET LE GÉNÉRATEUR DUBSTEP (14/10)
- Léo : « fais un générateur dubstep qui va pareil de 1 à 30, palier moteur identique ; garde tout ce qu'il y a dans la bibliothèque ;
  place-le par-dessus l'ancien — je vais te changer de DA ». → `createTrenteMusic({ da })` : une DA = une famille de styles sur le MÊME
  moteur (30 moteurs, transitions, jeu, mémoire). `DA_STYLES.cashcar` = les 15 d'avant (inchangés), `DA_STYLES.dubstep` = six styles :
  MÉLODIQUE · RIDDIM · BROSTEP · DUB DE LONDRES · CHILLSTEP · COLOR BASS (138-150 BPM, demi-temps, caisse claire sur le 3).
- Le dubstep : la WOB (scies + carré, coupe-bas résonant écrit PAR MESURE au tempo : noire, croche, triolet, double, fermé, montée —
  motifs tirés toutes les 4 mesures ; « les wubs se durcissent » = `i_riddim`), le GROWL (FM + formants yoi/wah/zap, riffs accordés),
  le DROP (la wob arrive au 8e-11e moteur, le sous-grave avec elle ; montée = roulement qui accélère + souffle + UN TEMPS DE SILENCE),
  les triolets de charleys, le skank (DUB DE LONDRES), piano/cordes vrais dans MÉLODIQUE et CHILLSTEP (univers hybride).
- Salle : 1er jet = 45 % de sous-grave (la wob portait son grave) → la wob devient la couche du MÉDIUM (coupe-bas 160 Hz, saturée,
  adoucie à 7,5 kHz), le sous-grave à `sub` seul, caisse claire/charleys +3 dB, boue creusée sur la wob (−5) et le growl (−3,5) ;
  la boue de DUB DE LONDRES (34 %) venait de la MÉLODIE (thérémine, quasi sinus, posée à si 3) → mélodie remontée, plus de thérémine,
  grosse caisse 909 seule en RIDDIM/BROSTEP. Résultat : sous-grave 4-15 %, boue 12-21 %, montée +22 à +34 dB, 0 fausse note, 0 erreur.
  La grosse caisse arrive TOUJOURS avant le drop (le beat, puis la basse) ; le sous-grave arrive avec la wob. Version gardée : v4-0.
- Le panneau joue la DA dubstep (`GEN_DA`) ; les 👍 gardent leur `da` et leur version (Pouce bleu les rejoue à l'identique).
- Bibliothèque : on GLISSE un son sur un onglet pour le ranger ailleurs ; « + Catégorie » en crée une (nommée dans son titre,
  « Retirer la catégorie » renvoie ses sons) — `PREF.place` / `PREF.cats` dans musique-moteur.json.

## v5.0 — LE GÉNÉRATEUR HYBRIDE (14/10, soir)
- Léo : « apprends les instruments de base ; casse ce que tu as appris si ça te freine ; la technique de la retouche et tout ; révise
  pour tout fabriquer, tout style ; comprends la culture musicale humaine, du populaire à l'underground ; un générateur HYBRIDE ».
- Ce qui a cassé : les styles n'étaient que des listes écrites à la main, une DA à la fois. Désormais un **ATLAS** : 34 genres nouveaux
  décrits par leurs fondamentaux (rythme `RYT`, harmonie `prog`, basse `BAS`, accompagnement `COMP`, instruments, retouche `prod`) et
  fabriqués en styles par `genre()` (échelle de 30 construite par `echelle()`), + les 21 d'avant = 55 genres (DA `hybride`).
- **L'HYBRIDE** (`choixHybride`, `hybrideDe`) : le CORPS d'un genre (rythme, tempo, basse, forme, ordre d'entrée) × l'ÂME d'un autre
  (accords, instruments, mélodies), la retouche de l'un des deux ; chaque rôle reste un rôle (le clavier de l'un devient le clavier de
  l'autre). Garde-fous : jamais un parent des 3 dernières musiques, familles différentes (×0,15 sinon), énergie voisine et tempo
  compatible (`ENER`, `accord9`) ; 1 partie sur 5 pure ; la wob d'un dubstep peut faire le drop d'un autre corps.
- **Lutherie** : Wurlitzer, accordéon, basse électrique aux doigts, log drum. **Retouche** : salles plaque / RESSORT / RÉVERBE COUPÉE
  (années 80, caisse claire et toms), écho à BANDE (sature et pleure), PLEURAGE lo-fi du morceau entier, creux de boue adaptés à
  chaque musique. Fiche de révision : `atelier-son/CULTURE-MUSICALE.md`.
- Salle (9 hybrides, son coupé) : 0 erreur ; 1er jet = basse aux doigts 10 dB au-dessus de la grosse caisse, ouvertures sur la grosse
  caisse (+8 dB de montée) ou le vinyle seul (+51 dB), boue jusqu'à 26 % → basse pincée, ouvertures assainies (`ouvSain`), rôles gardés,
  boue adaptative. Après : montée +17 à +30 dB.

## v6.0 — LE CALME COMPLET, L'INTENSITÉ QUI A UN SENS (14/10, soir)
- Les cinq questions (réponses de Léo) : 1B pour l'instant (des morceaux figés en fichiers pour le jeu) · 2A le hasard choisit le style ·
  3A une radio de tous les genres (« mais je sais pas ») · 4B+C chœurs/voix hachées ET vraies voix · 5 « A ou B, ce qui est le mieux pour
  un début plutôt calme mais complet ; travailler surtout ce que signifie l'évolution d'intensité, pas juste ambiance, jusqu'au 30 — le
  point fort de la musique ».
- Choix : les 30 moteurs restent (chaque moteur s'entend), les grands moments tous les ~4. Au 1er moteur le CŒUR du groupe joue déjà en
  version CALME (`CALME`, `M.calme`) : grosse caisse en battement de cœur, charleys sur les temps, basse tenue, accords posés, mélodie qui
  se devine ; étouffé (filtre qui s'ouvre sur 8 moteurs), −10 dB qui remontent jusqu'au 18e. L'entrée d'un élément du cœur le fait
  PASSER du calme au plein (« le beat tombe », « la basse se met à groover »…) au lieu de l'ajouter.
- Salle (6 hybrides) : au 1er moteur les six instruments du cœur sonnent ; montée +16,6 à +20,5 dB (ses 👍 : ~+19), boue 6-17 %, 0 erreur.
- À venir : figer les morceaux en fichiers pour le jeu (1B), voix hachées partout (4B), vraies voix (4C : il faudra ses comptes).

## 2026-10-14 (soir) — LA BIBLIOTHÈQUE SUR LE MAIN, LES NOTES, POUCE BLEU (pôle SON)
- Le cahier, l'atelier et la bibliothèque vivent désormais dans `VERSION PRINCIPALE/` (branche `son-bibliotheque`, à pousser par le patron) ;
  la copie de CAR CAHS V3 (branche locale `musique-2026-10`) n'est plus la référence. En ligne : `/jouer/bibliotheque.html` (sans serveur,
  rien n'est envoyé) ; en local : `python3 atelier-son/serveur-moteur.py 9200` depuis VERSION PRINCIPALE.
- Léo : « permets-moi d'ajouter des notes permanentes sur les sons » → un crayon ✎ par son, la note dans musique-moteur.json (`notes`).
- Léo : « ajoute AURA dans les pouces bleus, et néon noir, nuit de velours, penthouse, glisse fusion » → rangés dans Pouce bleu (`place`).
- Léo : « transforme-les tous sans changer la forme, en 30 paliers comme les autres ; si ça risque d'être moins bien, arrête-toi » →
  dans Pouce bleu ils se pilotent à la main, moteur 1 à 30, le son INTACT ; les 30 étapes musicales différentes : NON faites (risque).
- Jamais sur le main (public) : les sons d'artistes réels (inspirations, IN DA BACK, BOR, NOTHING LIKE U, OG GINOBILI).

