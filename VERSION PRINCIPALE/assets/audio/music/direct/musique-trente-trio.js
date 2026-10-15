// musique-trente-trio.js — LES TROIS NOUVEAUX (2026-10-15, pôle SON › trois nouveaux sons ; Léo : « rajoute-moi trois nouveaux sons qui ont
// tout autant la qualité de tous les sons que j'ai déjà likés dans les pouces bleus, mais juste une autre idée originale » → « les trois, vas-y »).
// Ce fichier = le générateur v6-0 (celui de ses derniers 👍) FIGÉ, plus trois morceaux ÉCRITS, chacun son univers, loin de ce que ses 👍 ont
// en commun (17 sur 21 en mineur, la moitié en néon ou lo-fi, piano ou harpe + 808, 110-123 BPM) :
//   · ZEPPELIN D'OR (`zeppelin`) — l'électro swing : les années folles × la house. Clarinette, trompette bouchée, contrebasse qui marche,
//     piano en pompe, accords mineurs « sixte » (le manouche) ; LE GRAMOPHONE : tout passe d'abord par le pavillon d'un 78-tours (bande
//     étroite, craquements), la house tombe dessous, puis le pavillon S'OUVRE (1925 → aujourd'hui) ; le bouchon de champagne qui saute.
//   · CARNAVAL D'OR (`carnaval`) — la batucada électronique : l'école de samba entre rang par rang (agogô, ganzá, surdos, tamborins,
//     cavaquinho, caixa, trompettes, la foule), la cloche AGOGÔ accordée tonique-quinte mène tout, la CUÍCA rit, les appels du repinique.
//   · LE CASSE (`casse`) — le trip-hop de braquage : le breakbeat lent sur un vieux disque, le clavecin en ostinato (Teardrop), le Rhodes
//     sur bande, la contrebasse, la ligne « espion » (mi m → mi m maj7 → mi m7 → mi m6 : la voix qui descend d'un demi-ton par mesure),
//     le thérémine ; LA MOLETTE DU COFFRE-FORT puis le verrou qui cède sur la fondamentale ; au 19e moteur LA POURSUITE : la batterie
//     passe en double tempo (drum & bass), la sirène au loin.
// Ce qui change du v6-0 (rien d'autre) : leurs styles (`TRIO`, `C.fige` = l'ordre des 30 moteurs écrit à la main, `C.sig`/`C.sig2`),
// les accords m6 et mM7, quatre signatures (champagne, agogô, cuíca, coffre-fort), leurs sons (surdo, caixa, ganzá, tamborim, scratch,
// clic, bouchon ; voix agogô, cuíca, bulle, verrou), le swing de croches (`swing8`), le gramophone (`gramo` : un coupe-bas sur toute la
// musique, ouvert avec la clarté ou la nitro), la batterie de la poursuite (`kickD`/`snareD`), deux transitions (l'appel du repinique,
// le scratch), les réglages de piste par style (`dB`). O.style = 'zeppelin' | 'carnaval' | 'casse' choisit le morceau (bibliotheque.html ›
// Nouveaux) ; sans O, la DA 'trio' en tire un des trois.
//
// (ce qui suit est l'en-tête du générateur v6-0, gardé tel quel)
// musique-trente.js — TRENTE MOTEURS v3 : la musique générative du jeu CASH CAR, jouée en direct (Web Audio, aucun fichier audio).
//
// L'HISTOIRE : v1 (2026-10-13) un monde (la mineur, 110 BPM), un élément de plus à chaque moteur — « c'était cool » ; v2 (14/10) douze
// styles et leurs mélanges — « c'était mieux avant : tout est un peu générique et en vrac ». v3 (14/10, Léo : « solidifie tes connaissances
// en musique et en composition, et en parallèle suis la philosophie d'intensité du jeu, vas-y à fond, puise les ressources là-dedans,
// il faut que le jeu soit phénoménal »). Puis (14/10) « le générateur doit être UNIQUE : supprime les erreurs, solidifie le code pour que le
// jeu ait les meilleures musiques générées automatiquement, à l'infini » — v1 et v2 retirées (copies hors du projet, scratchpad de la session).
// À L'INFINI : toutes les `renouvelle` phrases (12 par défaut, ~3-4 min) une musique NEUVE se prépare en coulisse et prend le relais sur une
// fin de phrase (même moteur, mémoire des parties) ; un son qui ne se fabrique pas est sauté (la musique joue avec les autres) ; une note
// ratée n'arrête jamais l'horloge ; rien ne s'accumule (journaux et caches bornés, banque de l'ancienne musique libérée).
//
// UNE IDENTITÉ, TROIS COULEURS (celles de ses 👍 : NÉON DRIVE / NÉON NOIR, NUIT DE VELOURS / AURA, PENTHOUSE / Ateyaba / BOR) :
//   NÉON (synthwave qui file : arpège, supersaw, basse qui roule, caisse claire énorme) · VELOURS (french touch : Rhodes, accords hachés,
//   basse funk, la pompe, le filtre qui balaie) · LUXE (trap de luxe nonchalante : boucles d'un ou deux accords, 808 qui glisse,
//   charleys qui roulent, demi-tempo). Chaque partie tire sa couleur, sa tonalité, son tempo, ses grilles, son THÈME, l'ordre exact
//   de ses 30 éléments et ses petites couleurs de son : jamais deux fois la même, toujours le même monde.
// LE MÉTIER :
//   · les accords sont MENÉS : chaque accord prend le renversement le plus proche du précédent (les voix bougent d'un ou deux demi-tons,
//     comme un pianiste — fini les blocs qui sautent) ;
//   · la mélodie est une PHRASE : question (4 mesures, finit en suspens sur une note de l'accord qui n'est pas la fondamentale) puis
//     réponse (4 mesures, un sommet en 7e mesure, finit SUR la fondamentale) ; le motif est redit en marche ; la partie B a son motif à elle ;
//   · le CONTRE-CHANT suit les notes-guides (tierces et septièmes des accords, menées au plus court) ;
//   · la basse se cale sur la grosse caisse et AMÈNE l'accord suivant (une note de passage sur le dernier temps) ;
//   · la main : chaque coup a son retard (±4 ms) et sa force (±8 %), la caisse a ses fantômes, les tambours ont trois variantes ;
//   · le son : nappes et claviers en STÉRÉO (voix désaccordées gauche / droite), cordes pincées (Karplus-Strong), un coupe-bas sur tout
//     ce qui n'est pas grave, la pompe sous la grosse caisse, saturation douce + colle + limiteur.
// v3.1 (14/10, Léo : « l'effet de transition est un peu répétitif, sinon c'est top ; un peu plus de variété ; et si c'est trop dur
//  d'accumuler trop d'instruments, fais juste évoluer la musique dans son INTENSITÉ ») : l'échelle des 30 moteurs mêle désormais une
//  quinzaine d'instruments et des MARCHES D'INTENSITÉ (le son s'ouvre, la basse s'anime, la batterie frappe plus fort, les charleys
//  doublent, l'espace s'élargit, le son se durcit, la mélodie monte d'une octave…) ; les TRANSITIONS viennent d'un répertoire (roulement,
//  toms, charleys, souffle à l'envers, trou, filtre qui plonge, glissé de basse, bégaiement — ou rien) tiré sans jamais redonner les deux
//  derniers ; l'arrivée n'a plus de coup sourd à chaque fois ; cinq FORMES de morceau, plus de grilles et de rythmes, une partie B qui
//  change de voix, des fins de phrase variées.
// LA SIGNATURE (14/10, Léo : « inspire-toi à chaque fois de l'état d'esprit plein d'originalité et d'identité, comme pour les boucles du
//  lobby quand je t'ai dit que c'était trop la même chose ») : chaque musique a UNE IDÉE, un son du monde CASH CAR qui revient comme un
//  gimmick, ACCORDÉ dans sa tonalité — le moteur qui chante (vroum : fondamentale, quinte, octave), le turbo qui souffle, la caisse
//  enregistreuse, la pluie de pièces, le néon qui grésille, les klaxons, les gouttes de verre, les accords à l'envers (vaporwave), la sirène
//  au loin. Elle entre tôt (5e-8e moteur), parfois une 2e plus tard ; le titre et « l'idée » en découlent.
// v3.2 (14/10, Léo : « pas trop de fois le même instrument sur plusieurs parties consécutives ») : LA MÉMOIRE DES PARTIES — clavier,
//  mélodie, basse, nappe, signature et couleur des deux dernières musiques deviennent très improbables (×0,1 la dernière, ×0,35
//  l'avant-dernière ; `historique` en option, gardé par la page) ; la palette s'élargit (piano électrique FM, cuivre synthétique, flûte,
//  basses acid, reese, slap, 808 saturée, sous-basse qui glisse, nappe douce) pour qu'il y ait de quoi changer.
// v3.3 (14/10, Léo : « ayons au moins 8 instruments phares intéressants, là tu bloques sur deux-trois ; même plus s'il faut ») :
//  TREIZE INSTRUMENTS PHARES (la voix de la mélodie) — synthé scie, synthé de verre, talkbox, cuivre, sifflet, flûte, carré, et les
//  nouveaux : SAXOPHONE de minuit, THÉRÉMINE (qui glisse d'une note à l'autre), GUITARE claire et GUITARE SATURÉE (cordes pincées),
//  STEEL DRUM, KALIMBA, PUCE 8 BITS — chaque couleur en tire 7 ou 8 avec ses affinités ; la mémoire écarte le phare des TROIS dernières parties.
// v3.4 (14/10, Léo : « l'évolution entre le 15 et le 28 encore un peu molle, ça pourrait être plus intense · arrête d'utiliser un
//  instrument commun entre chaque génération, ça s'entendrait dans le jeu » puis « c'est encore un peu toujours la même, mais ne perds pas
//  tes compétences : tu fais vraiment de belles musiques qui donnent envie d'aller plus vite ») :
//  · CINQ COULEURS : NÉON · VELOURS · LUXE + DRIFT (phonk de drift : la cloche de vache qui chante le riff, la 808 saturée, le phrygien,
//    des accords de trois sons, les pneus qui crissent) et TOUGE (eurobeat de col de montagne, 148-156 BPM : la basse en octaves, les
//    cuivres sur les contretemps, le supersaw) ; les goûts penchent sans enfermer (la racine de leurs poids) ;
//  · CINQ FORMES DE PHRASE (classique · riff · appel · envol · longues) et un couplet qui prend une autre forme que le thème ;
//    des OUVERTURES tirées (les trois premiers moteurs ne sont plus toujours les mêmes) ;
//  · LA RAMPE DU 15 AU 30 : E = (moteur − 14) / 16 monte en continu (fantômes, fins de phrase plus souvent, cymbale toutes les 4 mesures,
//    charleys et caisse plus présents, pompe plus profonde, son plus dense et plus fort, arpège en doubles, tempo +2 %) ; l'échelle y
//    place des marches qui POUSSENT : la batterie qui double (≈ 21e), la basse doublée à l'octave, la batterie qui s'emballe (toms,
//    cymbales), la pulsation des contretemps, chaque fin de 4 mesures qui monte (souffle, roulement ou toms, à tour de rôle) ;
//  · PLUS AUCUN INSTRUMENT COMMUN : arpège (corde de verre, scie, FM, puce, bois), contre-chant (flûte, violon, voix, orgue), nappe (scie,
//    douce, verre, voix), cordes (ensemble, synthé), chœur (oh, ah, ou), caisse claire (grosse, clap, rimshot), montée (souffle, ton),
//    grosse caisse (ronde, sèche, boum), charleys et cymbale accordés autrement — tirés par musique, avec la mémoire des parties.
// v3.5 (14/10, Léo : « c'est toujours un peu la même, toujours un aigu : trouve un moyen d'être original à chaque génération, sinon ça
//  casse les oreilles » · « à chaque fois ça me donne une structure qui crée le même style de musique : il faut UN STYLE À CHAQUE PARTIE »
//  · Die Antwoord « Age of Illusion » : « ressource-toi ») :
//  · QUATORZE STYLES, chacun son monde entier — tempo, groove, langage d'accords, instruments, ordre d'entrée, registre : NÉON (synthwave),
//    VELOURS (french touch), LUXE (trap), DRIFT (phonk), TOUGE (eurobeat), HYPERVITESSE (drum & bass liquide, 170-176), BOULE À FACETTES
//    (disco funk, dorien/mixolydien, basse en octaves, cuivres), 2-STEP (UK garage, grosse caisse qui saute, orgue, chœur haché),
//    NUIT LO-FI (84-90, balancé, vinyle), TURBINE (big beat : accords de QUINTE à la guitare saturée, breakbeat), PIXEL (chiptune :
//    basse triangle, accords 8 bits, parfois en MAJEUR), GRAND PRIX (épique : cordes, cuivres, toms, chœur, la dominante), MALECÓN
//    (dembow 3-3-2, steel drum, kalimba), ZEF (rave-rap sombre mesuré sur Die Antwoord : 80-86 BPM, deux accords, la basse énorme,
//    les accords de rave, des ponts sans basse) ; la mémoire écarte les QUATRE derniers styles joués ;
//  · L'AIGU SE REPOSE : un PLAFOND par style (80-86 en MIDI : toute voix plus haute redescend d'une octave, même note), cordes et accords
//    hachés à l'octave du milieu, l'arpège et la cloche se taisent dans le couplet, la rampe pousse le grave (grosse caisse, basse) et
//    plus les charleys, une seule cymbale par phrase (le final : toutes les 4 mesures), le souffle des montées moins brillant.
// v3.6 (14/10, Léo : « techniquement, si j'appuie sur changer de musique, il n'y aura pas un air de ressemblance entre chaque son ? »
//  → « 1, 2, 3, et trouve une solution, essaie de comprendre ce que je cherche ») : ce qu'il cherche = qu'une partie sonne comme un
//  AUTRE ARTISTE. L'air de famille venait surtout de la PRODUCTION (la même grosse caisse, les mêmes charleys, la même salle) :
//  · LA PRODUCTION DE CHAQUE STYLE (`PROD`) : sa grosse caisse (ronde · 909 · 808 · acoustique · lo-fi étouffée · 8 bits · tambour grave),
//    ses charleys (métal · bruit · FM de verre · shaker · 8 bits), sa caisse claire (+ acoustique), sa SALLE (de la pièce sèche de 0,7 s
//    à la cathédrale de 4,2 s, sombre ou brillante — une réverbe neuve en fondu à chaque musique), son écho (croche, croche pointée, noire,
//    noire pointée), sa saturation ;
//  · PLUS DE LUMIÈRE : le majeur et le lydien (le rêve de C418) entrent dans NÉON, VELOURS, LO-FI, HYPERVITESSE, DISCO, 2-STEP, GRAND PRIX ;
//    les goûts (« mineur ») penchent moins fort, et le mode d'avant devient moins probable ;
//  · LA COURBE : les grands moments ne tombent plus aux mêmes moteurs — la mélodie tôt ou en « drop » vers le 10e, la grosse caisse
//    parfois retenue jusqu'au 9e-12e, la clarté entre le 10e et le 18e, la batterie qui double entre le 16e et le 24e, la montée d'un ton
//    entre le 23e et le 28e — ou aucune.
//  · STADE (Stuck in the Sound « Let's Go », « tu peux copier ces techniques aussi » — mesuré : 89 BPM, ré majeur, I ↔ vi, 66 mesures
//    d'énergie pleine, un son brillant) : l'indie rock en MAJEUR, les TOMS EN RYTHME (élément `tribu`), la guitare grattée, la basse en
//    croches, et LE CHŒUR DE STADE (élément `foule` : huit voix d'hommes qui chantent le thème sur « oh », une octave sous la mélodie, et
//    des « HÉ ! » tous les deux mesures) — le chœur passe aussi dans TURBINE et TOUGE.
// v3.7 — LES VRAIS INSTRUMENTS (14/10, Léo : « bien essayé mais c'est toujours générique · toujours les mêmes sons · toujours la même
//  erreur » → « vrais instruments libres » ; « tu vas pouvoir les retoucher et imiter des sons qu'on a déjà écoutés ») : la source des sons
//  était le problème (la même vingtaine de recettes d'oscillateurs pour tous les styles). Désormais de VRAIS enregistrements — VSCO-2
//  Community Edition, licence CC0 (assets/audio/music/direct/vrais/, 207 échantillons, 4 Mo, atelier-son/vrais_instruments.py : hauteur
//  mesurée, attaque recalée) : piano, harpe, violons, violon solo, violoncelles (tenus, pincés), contrebasse, trompette (+ bouchée), cor,
//  trombone, tuba, flûte, clarinette, hautbois, basson, glockenspiel, marimba, xylophone ; et 34 percussions (grosse caisse de concert,
//  caisses claires, tambours ténor, congas, bongos, claves, vraie cloche de vache, shakers, grelots, triangles, cymbales, gong, timbales).
//  Chaque style tire les siens (`VRAIS_STYLE` : clavier, mélodie, arpège, contre-chant, nappe, cordes, cuivres, basse, et le kit réel) —
//  « @piano » dans un tirage = le vrai ; et une RETOUCHE par musique (lo-fi, sombre, radio, saturé) passe sur les vrais instruments.
//  Chargés à la demande, gardés en cache (seulement ceux des musiques en cours), volume calé sur leur énergie.
// v3.8 — LE MORCEAU COMPLET (14/10, Léo : « travaille encore un peu la compo en t'inspirant de l'aspect finalisé des sons que j'ai aimés
//  — aussi ceux que tu as gardés dans le juke-box — même si aucun ne suivait aussi bien l'intensité des moteurs que tu l'as fait ; tu as
//  juste à harmoniser le reste » ; et « apprends encore plus d'instruments, d'effets, de transformeurs de sons gratuits ») :
//  · LE SOCLE : dès le 1er moteur, un vrai morceau — l'ouverture du style, l'harmonie, la basse (et sa sous-basse), la batterie, la
//    mélodie — retenu derrière le filtre et plus doux ; il s'ouvre et frappe de plus en plus jusqu'au 8e moteur ; les autres éléments et
//    les marches d'intensité s'étalent du 2e au 30e (une grosse caisse ou une mélodie gardées pour un « drop » restent possibles) ;
//  · LA FINITION : la pompe toujours là (plus profonde avec son élément), un grave plein (+2,5 dB à 90 Hz) et un haut adouci (−1,5 dB à
//    9 kHz), la largeur stéréo (nappe, clavier, cordes, chœur), et un NIVEAU HARMONISÉ d'une musique à l'autre (un régleur lent vise
//    −11 → −8 dB efficaces du 1er au 30e moteur ; figé pendant le vol, la respiration et le crash) ;
//  · LA 2e BANQUE (VCSL, CC0) : saxophone ténor, harmonica, ocarina, flûte à bec, piano à queue, clavecin, pianos FM, vibraphone, kalimba,
//    mbira, balafon, cloches tubulaires, carillon à main, verres chantants, strumstick, et une VRAIE batterie (charleys, claps, caisses
//    claires, grosse caisse de kit, cajón, darbouka, tambourin…).
// v3.9 — LES UNIVERS SONORES (14/10, Léo : « il y a des instruments qui parfois ne vont pas ensemble, tu arrives à voir ? ») : deux causes,
//  mesurées — (1) chaque rôle tirait son timbre SEUL (un violon classique sur de la synthwave avec un piano FM et un cor ; un harmonica en
//  french touch avec une harpe et des congas) ; (2) les vrais sons pas tout à fait justes (kalimba, mbira jusqu'à ±50 cents — accordage
//  traditionnel —, xylophone +15, tuba −43). Désormais : chaque note de la banque porte son écart MESURÉ (vrais-index.json) et le lecteur
//  la rattrape ; et chaque musique tire d'abord SON UNIVERS — ÉLECTRONIQUE (que des synthés), HYBRIDE (UN héros vrai, mélodie ou
//  clavier, sur un lit de synthés), ACOUSTIQUE (les vrais d'une même FAMILLE : orchestre · jazz · folk · rétro) — puis chaque rôle ne
//  choisit que dans cet univers. Les percussions réelles (charleys, claps, caisses) vont partout, comme dans les vrais studios.
// v3.10 — CE QUE LA SALLE DE RÉPÉTITION A MONTRÉ (14/10, Léo : « c'est moins bien qu'avant ») : ses 16 musiques 👍 montent de +19 dB du
//  début à la fin (léger au départ, énorme à la fin — c'était CE qu'il aimait), la v3.9 seulement de +3,6 dB (le socle complet dès le 1er
//  moteur et le niveau harmonisé l'avaient aplatie), et elle était plus sourde (centre 270 Hz contre 490) et trop chargée en sous-grave
//  (21 % contre 16 %). → Retirés : le socle (on revient à UN élément de plus par moteur), le régleur de niveau, le grave +2,5 dB et
//  la sous-basse ajoutée partout, le haut −1,5 dB, le filtre de départ, la pompe permanente. Gardés : les vrais instruments (et leur
//  justesse), les univers cohérents, les effets (plus rares : une touche), la largeur stéréo.
// v3.11 (14/10, Léo : « la flûte et les leads aigus, ça suffit pour le générateur ») : plus aucune flûte (synthé, vraie, à bec, ocarina),
//  ni sifflet, ni verre, ni verres chantants en mélodie ou en contre-chant ; la mélodie descend d'une quarte (reg −5, plafond ≤ 82) et ne
//  monte plus à l'octave (la marche « la mélodie monte d'une octave » remplacée par « l'espace s'élargit », plus d'octave en nitro, plus
//  de couplet « haut » ni de cloche en mélodie).
// v6.0 — LE CALME COMPLET, L'INTENSITÉ QUI A UN SENS (14/10, Léo, aux cinq questions : « un début plutôt calme mais complet, et
//  travailler surtout ce que signifie l'évolution d'intensité, pas juste ambiance, jusqu'au 30 — ça doit être le point fort ») :
//  au 1er moteur TOUT LE GROUPE joue déjà, en version CALME (`CALME`, `M.calme`) : la grosse caisse bat comme un cœur (le 1er temps),
//  les charleys marquent les temps tout doux, la basse tient ses notes, les accords sont posés, la mélodie se devine (deux mesures sur
//  quatre) — étouffé (le filtre s'ouvre sur 8 moteurs), plus bas (−10 dB, qui remonte jusqu'au 18e). L'entrée d'un élément du cœur ne
//  l'AJOUTE plus : elle le fait PASSER du calme au plein — « le beat tombe », « la basse se met à groover », « les charleys prennent le
//  rythme »… Chaque moteur est une marche d'intensité, plus une couche d'ambiance. (La grande montée, cœur de ce qu'il aime, reste :
//  ⚠ la v3.8 avait un socle complet ET un régleur de niveau → montée aplatie à +3,6 dB ; ici le niveau monte, mesuré en salle.)
// v4.0 — LES DA (directions artistiques) ET LA DA DUBSTEP (14/10, Léo : « fais un générateur dubstep qui va pareil de 1 à 30, palier
//  moteur identique ; garde tout ce qu'il y a dans la bibliothèque ; tu peux le placer par-dessus l'ancien — de toute manière je vais
//  te changer de DA ») : le moteur ne change pas (30 moteurs, une marche par moteur, la grande montée, transitions, jeu) ; une DA = une
//  famille de styles (`DA_STYLES`, option `da` : 'cashcar' · 'dubstep'). LA DA DUBSTEP — six styles : MÉLODIQUE (Seven Lions, Illenium :
//  piano, supersaw, accords qui émeuvent), RIDDIM (les wubs en triolets, un accord, sombre), BROSTEP (growls, drops lourds), DUB DE
//  LONDRES (Skream, Benga : sub profond, skank, échos), CHILLSTEP (atmosphère, piano, vinyle), COLOR BASS (accords pincés brillants,
//  growls accordés) — 140-150 BPM en DEMI-TEMPS (caisse claire sur le 3), et ce qui fait le dubstep :
//  · LA BASSE QUI WOBBLE (`wob`) : un son épais (scies désaccordées + carré à l'octave du dessous) passé dans un coupe-bas RÉSONANT dont la
//    fréquence est écrite PAR MESURE (setValueCurveAtTime, calée au tempo) : chaque temps a sa vitesse — noire, croche, TRIOLET,
//    double, fermé, montée — tirée parmi les motifs du style (`dub.wubs`), plus durs avec « les wubs se durcissent » (`i_riddim`) ;
//  · LE GROWL (`growl`) : modulation de fréquence + formants qui glissent (« yoi », « wah », « zap »), joué en riffs accordés ;
//  · LE DROP : la wob et le growl sont des GRANDS moments → la montée dubstep (`build 'dub'`) : roulement de caisse qui ACCÉLÈRE (noires,
//    croches, doubles), souffle, puis UN TEMPS DE SILENCE, et tout tombe sur le 1er temps ;
//  · les triolets de charleys (`i_triolet`), le skank (accords sur les contretemps, DUB DE LONDRES), les chœurs hachés.
// LES GOÛTS MESURÉS (14/10, atelier-son/gouts_mesures.py : ses 12 sons aimés contre ses 38 supprimés, mesurés) : W.clarte (< 1 = plus sombre :
//  « jamais clinquant », aucun son aimé au-dessus de 2 800 Hz de brillance) adoucit le haut (clarté ouverte plus basse, charleys et cymbales
//  plus discrets) ; W.basse_db alourdit la basse ; W.bpm tire le tempo de chaque couleur vers son tempo préféré.
// LA PHILOSOPHIE D'INTENSITÉ DU JEU (CLAUDE.md : le flow, la frénésie DARK TRIAD, la nitro façon Asphalt, le vol, la pose, la mort) :
//   · MOTEUR (1 → 30) : un élément de plus par moteur, le tempo qui monte, les grands moments sur une mesure de montée ;
//   · FLOW (0 → 1) : la densité — fantômes, roulements, ornements de la mélodie, arpège en doubles croches ;
//   · NITRO (tenue) : charleys doublés, tout s'éclaire, un souffle qui monte, la mélodie à l'octave ; lâchée : la cymbale ;
//   · VOL : à la croche, la batterie et la basse se retirent, le grave se coupe, la réverbe s'ouvre (on flotte) ;
//     POSE : tout retombe SUR le temps avec un coup sourd (PARFAIT : + cymbale et une gerbe de notes qui monte) ;
//   · FRÉNÉSIE (DARK TRIAD) : à la mesure, l'harmonie bascule dans le SOMBRE (la seconde mineure), demi-tempo trap, 808, roulements,
//     tempo +4 % ; à la sortie, la cymbale et le monde revient ;
//   · CRASH : la musique s'effondre (le filtre se ferme, le son tombe) puis se tait.
//
// Utilisation :
//   const music = createTrenteMusic({ audioContext, destination, gouts });
//   music.start();  music.start(4821);         // une musique neuve ; ou celle-là
//   music.setTier(moteur, 30);                  // à chaque moteur
//   music.regle({ nitro, vol, flow, frenesie }) // à chaque image, depuis l'état du jeu
//   music.evenement('pose', 'parfait'|'normal'|'lourd') · music.evenement('crash')
//   music.nouvelle() · music.tirage · music.stop()
// LES VRAIS INSTRUMENTS : l'index, les tampons décodés (cache partagé), l'amorce de l'AAC retirée, le niveau calé sur l'énergie
const VRAIS_BASE = new URL('./vrais/', import.meta.url).href; let VRAIS_IDX = null; const VRAIS_BUF = new Map();
function vraisIndex() { return VRAIS_IDX || (VRAIS_IDX = fetch(VRAIS_BASE + 'vrais-index.json').then(r => r.json()).catch(() => ({}))); }
function vraiRecale(b, note) { let i0 = b.length, pk = 0; for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > pk) pk = Math.abs(d[i]); }
  for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > pk * .02) { if (i < i0) i0 = i; break; } }
  i0 = Math.max(0, i0 - Math.round(b.sampleRate * .002));
  const y = new AudioBuffer({ length: Math.max(1, b.length - i0), numberOfChannels: b.numberOfChannels, sampleRate: b.sampleRate });
  let e = 0, n = 0; const W = Math.min(y.length, Math.round(b.sampleRate * .6));
  for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c).subarray(i0); y.copyToChannel(d, c); for (let i = 0; i < W; i++) { e += d[i] * d[i]; n++; } }
  if (note) { const g = Math.min(3, Math.max(.5, .2 / Math.sqrt(e / Math.max(1, n) + 1e-9)), .98 / Math.max(1e-6, pk)); for (let c = 0; c < y.numberOfChannels; c++) { const d = y.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= g; } }
  return y; }
function vraiBuf(ac, f, note) { if (!VRAIS_BUF.has(f)) VRAIS_BUF.set(f, fetch(VRAIS_BASE + f).then(r => { if (!r.ok) throw new Error('vrai ' + f); return r.arrayBuffer(); }).then(a => ac.decodeAudioData(a)).then(b => vraiRecale(b, note)));
  return VRAIS_BUF.get(f); }
async function vraiNotes(ac, nom) { const I = await vraisIndex(), e = I[nom]; if (!e) return [];
  const L = await Promise.all(e.notes.map(([m, f, d, ct]) => vraiBuf(ac, f, e.type === 'note').then(buf => ({ m: m == null ? 60 : m + (ct || 0) / 100, buf, f })).catch(() => null)));   // (ct : l'écart mesuré, en cents — la note jouée tombe juste)
  return L.filter(Boolean).sort((a, b) => a.m - b.m); }
function vraisMenage(garder) { for (const f of [...VRAIS_BUF.keys()]) if (!garder.has(f)) VRAIS_BUF.delete(f); }

// LA VERSION : notée avec chaque 👍 (bibliotheque.html › Pouce bleu) ; AVANT de changer ce fichier, le copier en musique-trente-<VERSION>.js
// (ex. musique-trente-v3-9.js) et monter VERSION — une musique aimée se rejoue toujours par la version qui l'a faite
export const VERSION = 'trio';

export function createTrenteMusic({ volume = 1, audioContext = null, destination = null, gouts = null, historique = null, renouvelle = 12, da = 'cashcar' } = {}) {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const pc = m => ((m % 12) + 12) % 12;
  const R = Math.random;
  function graine(n) { let a = (Math.imul(n | 0, 2654435761) ^ 0x5bd1e995) >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  let T = graine(1);
  const tp = a => a[Math.floor(T() * a.length)], tr = (a, b) => a + (b - a) * T(), rp = a => a[Math.floor(R() * a.length)];
  let GOUTS = gouts;   // les goûts appris (page : ses 👍 / 👎) — des poids sur la couleur, le mode, les timbres, les boucles, ses thèmes aimés
  const tpw = (a, tab, cle) => { if (!tab) return tp(a); const w = a.map(x => { const v = tab[cle ? cle(x) : x]; return v == null ? 1 : v; }), s0 = w.reduce((p, q) => p + q, 0);
    let r = T() * s0; for (let i = 0; i < a.length; i++) { r -= w[i]; if (r <= 0) return a[i]; } return a[a.length - 1]; };

  // ================================================================ L'HARMONIE
  const QUAL = { 5: [0, 7, 12], m9: [0, 3, 7, 10, 14], m7: [0, 3, 7, 10], m: [0, 3, 7], maj9: [0, 4, 7, 11, 14], maj7: [0, 4, 7, 11], M: [0, 4, 7], 6: [0, 4, 7, 9], 7: [0, 4, 7, 10],
    9: [0, 4, 7, 10, 14], '7sus': [0, 5, 7, 10], add9: [0, 4, 7, 14],
    m6: [0, 3, 7, 9], mM7: [0, 3, 7, 11] };   // (trio) le mineur sixte du manouche (ZEPPELIN) ; le mineur à 7e majeure de l'espion (LE CASSE)
  const NOTES_EN = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'], NOTES_FR = ['do', 'do♯', 'ré', 'mi♭', 'mi', 'fa', 'fa♯', 'sol', 'la♭', 'la', 'si♭', 'si'];
  const GAMMES = { mineur: [0, 2, 3, 5, 7, 8, 10], dorien: [0, 2, 3, 5, 7, 9, 10], sombre: [0, 1, 3, 5, 7, 8, 10], majeur: [0, 2, 4, 5, 7, 9, 11], mixolydien: [0, 2, 4, 5, 7, 9, 10], lydien: [0, 2, 4, 6, 7, 9, 11] };
  const NOM_MODE = { mineur: 'mineur', dorien: 'dorien', sombre: 'mineur sombre', majeur: 'majeur', mixolydien: 'mixolydien', lydien: 'lydien' };
  const FREN_GRILLES = ['0:m 1:M 0:m 1:M', '0:m9 8:maj7 1:maj7 0:m9', '0:m 0:m 1:M 7:M'];   // la FRÉNÉSIE : la seconde mineure (phrygien), le sombre
  function accord(spec, Mx, modeN) {
    const [d, q] = spec.split(':'), r = (Mx.ton + +d) % 12, iv = QUAL[q], pcs = iv.map(x => (r + x) % 12);
    let gamme = GAMMES[modeN || Mx.modeN].map(x => (Mx.ton + x) % 12);
    const ext = pcs.filter(p => !gamme.includes(p));   // une note de l'accord hors du mode remplace ses voisines (jamais une note de l'accord)
    gamme = gamme.filter(g => pcs.includes(g) || !ext.some(p => Math.min((g - p + 12) % 12, (p - g + 12) % 12) === 1)).concat(ext);
    const sept = iv.includes(10) ? (r + 10) % 12 : iv.includes(11) ? (r + 11) % 12 : iv.includes(9) ? (r + 9) % 12 : (r + 7) % 12;
    return { cle: spec, nom: NOTES_EN[r] + (q === 'M' ? '' : q), r, pcs, basse: 38 + ((r - 38 % 12 + 12) % 12), tierce: iv[1], guides: [(r + iv[1]) % 12, sept], gamme };
  }
  // LES ACCORDS MENÉS : pour chaque accord, le renversement (3-4 notes, sol2 → ré5) le plus proche du précédent ; deux tours de la grille
  // pour que le 1er accord soit mené depuis le dernier (la boucle se referme sans saut)
  function menes(specs, Mx, modeN) {
    const As = specs.map(s => accord(s, Mx, modeN));
    // (les renversements serrés ET leurs « drop 2 » — la 2e voix du haut descendue d'une octave, la façon des pianistes d'ouvrir un accord ;
    //  jamais deux voix voisines à un demi-ton : la neuvième collée sous la tierce d'un m9 frottait)
    const cands = A => { const iv = QUAL[A.cle.split(':')[1]], ps = (iv.length > 4 ? A.pcs.slice(1) : A.pcs).slice().sort((a, b) => a - b), out = [];
      for (let k = 0; k < ps.length; k++) { const rot = ps.slice(k).concat(ps.slice(0, k)); for (const b0 of [43, 55]) { let m = b0 + ((rot[0] - b0 % 12 + 12) % 12), v = [m];
        for (let j = 1; j < rot.length; j++) { m = m + ((rot[j] - m % 12 + 12) % 12 || 12); v.push(m); }
        if (v[0] >= 52 && v[v.length - 1] <= 76) out.push(v);
        if (v.length >= 4) { const d2 = v.slice(); d2[d2.length - 2] -= 12; d2.sort((x, y) => x - y); if (d2[0] >= 48 && d2[d2.length - 1] <= 76) out.push(d2); } } }
      const net = out.filter(v => v.every((x, j) => j === 0 || x - v[j - 1] >= 2) && (v[0] >= 55 || v[1] - v[0] >= 3));   // pas de seconde mineure, pas de boue dans le grave
      return net.length ? net : out; };
    let prev = null; const res = [];
    for (let tour = 0; tour < 2; tour++) As.forEach((A, k) => { const cs = cands(A); let best = cs[0], bs = 1e9;
      for (const v of cs) { const moy = v.reduce((p, q) => p + q, 0) / v.length; let sc = Math.abs(moy - 63) * .35;
        if (prev) { const n = Math.min(v.length, prev.length); for (let j = 0; j < n; j++) sc += Math.abs(v[j] - prev[j]); }
        if (sc < bs) { bs = sc; best = v; } }
      prev = best; if (tour === 1) res[k] = Object.assign({}, A, { v: best, cle: A.cle + '@' + best.join('.') }); });
    return res;
  }

  // ================================================================ LES ÉLÉMENTS
  const NOMS = { nw: 'la basse new wave', pad: 'la nappe s’ouvre', keys: 'les accords prennent le rythme', basse: 'la basse se met à groover', kick: 'le beat tombe', hat: 'les charleys prennent le rythme', snare: 'la caisse claire claque', lead: 'la mélodie en entier',
    arp: 'l’arpège', perc: 'les percussions', pompe: 'la pompe', contre: 'le contre-chant', basse2: 'la basse qui amène les accords', hatO: 'le charley ouvert',
    cordes: 'les cordes', clarte: 'la clarté (le filtre s’ouvre)', cloche: 'la cloche', stab: 'les accords hachés', fant: 'les fantômes de caisse', octave: 'la mélodie doublée',
    choeur: 'le chœur', sub: 'la sous-basse', roll: 'les roulements', echo: 'les échos', harmo: 'les tierces', ride: 'la ride', toms: 'les toms', cuivres: 'les cuivres',
    vinyl: 'le vinyle', wob: 'la basse qui wobble (le drop)', growl: 'le growl', i_riddim: 'les wubs se durcissent', i_triolet: 'les triolets de charleys', tribu: 'les toms en rythme', foule: 'le chœur de stade', double: 'la batterie qui double', modul: 'le morceau monte d’un ton', final: 'le final',
    // LES MARCHES D'INTENSITÉ (pas un instrument de plus : la musique qui monte)
    i_filtre: 'le son s’ouvre un peu', i_basse: 'la basse s’anime', i_frappe: 'la batterie frappe plus fort', i_dense: 'les charleys en doubles',
    sig: 'la signature', sig2: 'la 2e signature', i_basseOct: 'la basse doublée à l’octave', i_tambours: 'la batterie s’emballe', i_pulse: 'la pulsation des contretemps',
    i_monte: 'chaque fin de 4 mesures monte', i_large: 'l’espace s’élargit', i_relance: 'les relances de grosse caisse', i_sature: 'le son se durcit', i_sommet: 'la mélodie monte d’une octave', i_keys: 'le clavier s’anime' };
  const CATALOGUE = Object.keys(NOMS);
  const CALME = ['kick', 'hat', 'basse', 'keys', 'pad', 'lead'];   // (v6.0) le cœur du groupe, présent en version calme avant sa marche
  const GRANDS = new Set(['kick', 'clarte', 'double', 'modul', 'final', 'wob', 'growl']);
  const GROOVE = new Set(['nw', 'kick', 'snare', 'fant', 'hat', 'roll', 'hatO', 'perc', 'ride', 'toms', 'tribu', 'wob', 'growl', 'basse', 'basse2', 'sub']);   // ce que le VOL retire
  const VOL = { nw: .36, pad: .3, keys: .34, basse: .5, kick: .95, hat: .22, snare: .6, lead: .4, arp: .2, perc: .22, contre: .2, basse2: .5, hatO: .14, cordes: .2, cloche: .2,
    stab: .24, fant: .22, octave: .17, choeur: .17, sub: .3, roll: .15, harmo: .17, ride: .09, toms: .34, cuivres: .2, vinyl: .1, tribu: .3, foule: .3, wob: .34, growl: .3, sig: .32, sig2: .28, fx: .55 };
  const PAN = { tribu: .12, foule: -.08, sig2: .2, hat: -.25, hatO: .25, perc: .3, cloche: -.3, contre: -.22, harmo: .22, ride: -.18, toms: .1, arp: .12 };
  const REV = { tribu: .14, foule: .38, sig: .3, sig2: .32, pad: .32, keys: .2, lead: .28, contre: .32, cordes: .42, choeur: .5, cloche: .45, arp: .18, snare: .14, harmo: .3, octave: .25, cuivres: .22, toms: .14, perc: .12, fx: .3 };
  const HP = { basse2: 150, foule: 140, pad: 150, keys: 140, lead: 180, arp: 200, contre: 180, cordes: 160, cloche: 300, stab: 160, octave: 180, choeur: 160, harmo: 160, cuivres: 140, fx: 60, wob: 160, growl: 140 };   // le coupe-bas : le grave à la basse
  const POMPE = ['pad', 'keys', 'cordes', 'choeur', 'stab', 'arp', 'basse', 'wob', 'growl', 'nw'];

  // ================================================================ LES STYLES (un par partie)
  // pat : 16 pas par mesure (X fort · x · o léger · H/L conga aiguë/grave) — plusieurs variantes, changées en route
  // basse : [pas, intervalle (0 · 7 · 12 · 't' = la tierce), durée, force] · keys/stab : [pas, durée]
  const COULEURS = {
    neon: { nom: 'NÉON', dit: 'synthwave qui file', bpm: [104, 112], monte: [10, 14], modes: ['mineur'], swing: 0, reg: 69, cap: 84, pompe: .45, ferme: 3800,
      grilles: { mineur: ['0:m9 8:maj9 3:maj9 10:6', '0:m9 8:maj9 5:m9 7:7sus', '8:maj9 10:6 0:m9 0:m9', '0:m9 10:6 8:maj9 10:6', '5:m9 8:maj9 10:6 0:m9', '0:m9 3:maj9 10:6 8:maj9',
        '0:m9 5:m9 8:maj9 7:7sus', '3:maj9 10:6 0:m9 8:maj9'] },
      keysT: ['piano', 'harpe', 'dx'], leadT: { scie: 3, saxo: 2.5, guitareSat: 2, cuivre: 1.5, chip: 1.2, theremine: 1, verre: 1, carre: .8 }, trans: { run: 1, roll: 2, toms: 2, souffle: 2, trou: 1, filtre: 1.5, begaie: .8, rien: 3 }, basseT: ['roule', 'acid', 'reese'], cells: [2, 2, 3, 4, 4, 6], fill: ['toms', 'roll'],
      phrases: { classique: 2, envol: 2, riff: 1.5, longues: 1, appel: .8 },
      kit: { f0: [150, 180], f1: [46, 52], dec: [.32, .45], clic: [.12, .2], drive: [1.1, 1.6], snare: ['grosse', 'clap', 'rim'] },
      pat: { kick: ['X...X...X...X...', 'X.....x.X...X...', 'X...X...X..xX...'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.', 'x.xox.x.x.xox.x.'], hatD: 'xoxoxoxoxoxoxoxo', hatO: ['......x.......x.', '..x...x...x...x.'],
        fant: ['..........o....o'], perc: ['oxoxoxoxoxoxoxox'],
        basse: [[[0, 0, 2], [2, 0, 2], [4, 12, 2], [6, 0, 2], [8, 0, 2], [10, 0, 2], [12, 12, 2], [14, 0, 2]], [[0, 0, 1], [1, 0, 1], [2, 12, 1], [3, 0, 1], [4, 0, 1], [5, 0, 1], [6, 12, 1], [7, 0, 1], [8, 0, 1], [9, 0, 1], [10, 12, 1], [11, 0, 1], [12, 0, 1], [13, 0, 1], [14, 12, 1], [15, 0, 1]]],
        keys: [[[0, 8], [8, 8]], [[0, 6], [6, 2], [8, 6], [14, 2]], [[0, 3], [3, 3], [6, 2], [8, 3], [11, 3], [14, 2]]], stab: [[[0, 2], [6, 2], [12, 2]]], arp: ['updown16', 'up16'] },
      ouv: [['arp', 'pad', 'kick'], ['pad', 'lead', 'arp'], ['basse', 'arp', 'kick'], ['keys', 'arp', 'pad']],
      ordre: ['arp!', 'pad', 'kick', 'basse', 'snare', 'hat', 'lead', 'i_filtre', 'keys', 'pompe', 'contre', 'i_basse', 'hatO', 'cordes', 'clarte', 'i_frappe', 'fant', 'i_dense', 'octave',
        'i_relance', 'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    velours: { nom: 'VELOURS', dit: 'french touch', bpm: [116, 122], monte: [8, 12], modes: ['dorien', 'mineur'], swing: .06, reg: 67, cap: 84, pompe: .32, ferme: 3400, balaye: true,
      grilles: { dorien: ['0:m9 5:9 0:m9 5:9', '0:m9 3:maj9 5:9 0:m9', '0:m9 0:m9 5:9 5:9', '3:maj9 5:9 0:m9 10:maj9', '0:m9 10:maj9 5:9 0:m9', '0:m9 2:m7 3:maj9 5:9'],
        mineur: ['0:m9 8:maj9 0:m9 8:maj9', '0:m9 3:maj9 8:maj9 10:6', '5:m9 0:m9 8:maj9 7:7', '0:m9 0:m9 8:maj9 8:maj9'] },
      keysT: ['rhodes', 'clav', 'dx'], leadT: { talkbox: 2.5, saxo: 2, guitare: 2, carre: 1.5, cuivre: 1.5, sifflet: 1, steel: .9, chip: .7 }, trans: { run: 1.5, roll: 2, filtre: 2.5, souffle: 1.5, trou: 1.5, begaie: .5, rien: 3 }, basseT: ['funk', 'slap', 'roule'], cells: [1, 2, 2, 3, 4], fill: ['roll', 'run'],
      phrases: { riff: 2, appel: 2, classique: 1.5, envol: .8, longues: .6 },
      kit: { f0: [140, 170], f1: [48, 54], dec: [.3, .4], clic: [.1, .18], drive: [1, 1.4], snare: ['clap', 'grosse', 'rim'] },
      pat: { kick: ['X...X...X...X...', 'X...X...X...X..x'], snare: ['....X.......X...', '....X.......X..o'], hat: ['o.x.o.x.o.x.o.x.', 'xoxoxoxoxoxoxoxo'], hatD: 'xoxoXoxoxoxoXoxo', hatO: ['..X...X...X...X.'],
        fant: ['.......o.......o'], perc: ['oxoxoxoxoxoxoxox', '...H..L....H.L..'],
        basse: [[[2, 0, 2], [6, 0, 2], [10, 0, 2], [14, 0, 2]], [[0, 0, 2], [3, 12, 1], [6, 0, 2], [8, 0, 2], [11, 12, 1], [14, 7, 2]], [[2, 0, 1], [3, 12, 1], [6, 0, 2], [10, 0, 1], [11, 12, 1], [14, 't', 2]]],
        keys: [[[2, 2], [6, 2], [10, 2], [14, 2]], [[0, 3], [3, 2], [6, 2], [10, 3], [14, 2]], [[0, 2], [3, 1], [6, 2], [8, 1], [10, 2], [13, 1], [14, 2]]], stab: [[[3, 1], [6, 1], [11, 1], [14, 1]], [[0, 1], [3, 1], [8, 1], [11, 1]]], arp: ['up8', 'updown16'] },
      ouv: [['keys', 'kick', 'hat'], ['basse', 'keys', 'hat'], ['pad', 'keys', 'lead'], ['stab', 'kick', 'basse']],
      ordre: ['keys!', 'kick', 'hat', 'basse', 'snare', 'pad', 'lead', 'pompe', 'i_filtre', 'stab', 'hatO', 'contre', 'perc', 'i_basse', 'clarte', 'i_keys', 'i_frappe', 'fant', 'cordes',
        'i_dense', 'double', 'octave', 'i_basseOct', 'i_tambours', 'choeur', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    luxe: { nom: 'LUXE', dit: 'trap de luxe nonchalante', bpm: [130, 140], monte: [6, 10], modes: ['mineur', 'dorien'], swing: .05, reg: 70, cap: 86, pompe: .65, ferme: 4200, demi: true,
      grilles: { mineur: ['0:m9 0:m9 5:m9 5:m9', '0:m9 0:m9 8:maj9 8:maj9', '0:m9 8:maj9 0:m9 8:maj9', '5:m9 5:m9 0:m9 0:m9', '0:m9 0:m9 0:m9 7:7sus', '0:m9 8:maj9 3:maj9 10:6',
        '0:m9 0:m9 3:maj9 3:maj9', '8:maj9 8:maj9 0:m9 0:m9'],
        dorien: ['0:m9 0:m9 5:9 5:9', '0:m9 5:9 0:m9 5:9', '0:m9 0:m9 10:maj9 10:maj9'] },
      keysT: ['rhodes', 'piano', 'harpe', 'dx'], leadT: { verre: 2.5, flute: 2, kalimba: 2, theremine: 2, sifflet: 1.5, guitare: 1.5, saxo: 1.5, steel: 1 }, basseT: ['808', '808dur', 'sub808'], trans: { hats: 2.5, glisse: 2, souffle: 2, trou: 2, begaie: 1, filtre: 1, rien: 3 }, cells: [2, 2, 3, 4, 6, 8], fill: ['hats'],
      phrases: { appel: 2.5, longues: 2, classique: 1, riff: 1.2 },
      kit: { f0: [130, 160], f1: [40, 46], dec: [.55, .85], clic: [.05, .12], drive: [1.4, 2.2], snare: ['clap', 'rim', 'grosse'] },
      pat: { kick: ['X.........x.....', 'X......x..x.....', 'X.....x...X..x..'], snare: ['........X.......'], hat: ['x.x.x.x.x.x.x.x.', 'xxx.x.x.xxx.x.x.'], hatD: 'xxxxxxxxxxxxxxxx',
        hatO: ['......x.........'], fant: ['.............o..'], perc: ['........x.......', '..H...L...H.....'],
        basse: [[[0, 0, 10], [10, 0, 6]], [[0, 0, 6], [7, 0, 3], [10, 12, 3], [13, 0, 3]], [[0, 0, 3], [3, 0, 3], [6, 7, 4], [10, 0, 6]]],
        keys: [[[0, 8], [8, 8]], [[0, 6], [10, 6]], [[0, 6], [7, 3], [10, 6]]], stab: [[[0, 2], [3, 2], [8, 2]]], arp: ['rand8', 'up8'] },
      ouv: [['keys', 'hat', 'basse'], ['pad', 'keys', 'lead'], ['basse', 'hat', 'keys'], ['lead', 'keys', 'hat']],
      ordre: ['keys!', 'hat', 'basse', 'kick', 'snare', 'pad', 'lead', 'roll', 'i_filtre', 'contre', 'vinyl', 'i_basse', 'cloche', 'hatO', 'clarte', 'i_frappe', 'fant', 'cordes', 'i_dense',
        'i_relance', 'double', 'octave', 'i_basseOct', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // DRIFT : le phonk de drift — la cloche de vache chante le riff dès le 1er moteur, la 808 saturée, le phrygien (la seconde mineure),
    // des accords de TROIS sons (le monde des m9 laissé aux autres), les pneus qui crissent accordés
    drift: { nom: 'DRIFT', dit: 'phonk de drift', bpm: [124, 134], monte: [8, 12], modes: ['sombre', 'mineur'], swing: .03, reg: 69, cap: 82, pompe: .5, ferme: 3600, voixB: ['haut', 'haut', 'pluck'],
      grilles: { sombre: ['0:m 1:M 0:m 1:M', '0:m 0:m 8:M 1:M', '0:m 5:m 1:M 0:m', '0:m 10:m 8:M 1:M', '0:m 3:M 8:M 1:M', '0:m 0:m 1:M 1:M'],
        mineur: ['0:m 8:M 10:M 0:m', '0:m 0:m 8:M 7:m', '0:m 5:m 8:M 7:m', '0:m 3:M 10:M 8:M'] },
      keysT: ['piano', 'orgue', 'dx'], leadT: { cowbell: 4, carre: 1, theremine: 1, verre: .8, chip: .8, sifflet: .6 }, trans: { hats: 2, begaie: 2, glisse: 2, trou: 2, souffle: 1.5, toms: 1, rien: 2.5 },
      basseT: ['808dur', '808', 'sub808'], cells: [1, 1, 2, 2, 3, 4], fill: ['hats', 'toms'], phrases: { riff: 4, appel: 1.5, envol: 1 },
      kit: { f0: [165, 195], f1: [44, 50], dec: [.4, .55], clic: [.15, .25], drive: [2, 3], snare: ['clap', 'rim'] },
      pat: { kick: ['X.....X...X.....', 'X.......X.X.....', 'X..X......X..X..'], snare: ['....X.......X...', '....X.......X..x'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.xxx.x.'], hatD: 'xxxxxxxxxxxxxxxx',
        hatO: ['..x...x...x...x.'], fant: ['...........o..o.'], perc: ['...H..L....H.L..', '..H...L...H..L..'],
        basse: [[[0, 0, 6], [6, 0, 4], [10, 12, 6]], [[0, 0, 4], [4, 7, 2], [6, 0, 4], [10, 0, 2], [12, 12, 4]], [[0, 0, 3], [3, 0, 3], [6, 0, 2], [8, 12, 4], [12, 0, 4]]],
        keys: [[[0, 16]], [[0, 8], [8, 8]], [[0, 6], [6, 6], [12, 4]]], stab: [[[0, 1], [3, 1], [6, 1], [10, 1]]], arp: ['up16', 'rand8'] },
      ouv: [['lead', 'basse', 'kick'], ['basse', 'lead', 'hat'], ['keys', 'lead', 'basse']],
      ordre: ['lead!', 'basse', 'kick', 'snare', 'hat', 'pad', 'roll', 'i_filtre', 'keys', 'fant', 'pompe', 'i_basse', 'hatO', 'contre', 'perc', 'clarte', 'i_frappe', 'choeur', 'i_dense', 'octave',
        'i_relance', 'double', 'i_basseOct', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // TOUGE : l'eurobeat des cols de montagne — 148-156 BPM, la basse qui rebondit en octaves, les cuivres sur les contretemps, le supersaw,
    // les grilles qui montent (VI · VII · i)
    touge: { nom: 'TOUGE', dit: 'eurobeat de col de montagne', bpm: [148, 156], monte: [5, 8], modes: ['mineur'], swing: 0, reg: 71, cap: 84, pompe: .5, ferme: 4400,
      grilles: { mineur: ['0:m 8:M 10:M 0:m', '8:M 10:M 0:m 0:m', '0:m 10:M 8:M 10:M', '5:m 10:M 3:M 8:M', '8:M 10:M 7:m 0:m', '0:m 8:M 3:M 10:M', '0:m7 5:m7 10:M 3:maj7', '8:maj7 10:M 0:m 0:m'] },
      keysT: ['piano', 'dx', 'orgue'], leadT: { scie: 3, cuivre: 2.5, guitareSat: 2, carre: 1.5, chip: 1.2, saxo: 1, verre: 1 }, trans: { run: 2, roll: 2.5, toms: 2, souffle: 1.5, filtre: 1, begaie: .8, rien: 2.5 },
      basseT: ['roule', 'acid', 'funk'], cells: [1, 2, 2, 3, 4], fill: ['roll', 'toms'], phrases: { envol: 2.5, classique: 2, riff: 1.5, longues: 1 },
      kit: { f0: [155, 185], f1: [46, 52], dec: [.28, .38], clic: [.15, .22], drive: [1.3, 1.8], snare: ['grosse', 'clap'] },
      pat: { kick: ['X...X...X...X...'], snare: ['....X.......X...', '....X.......X.x.'], hat: ['..x...x...x...x.', 'x.x.x.x.x.x.x.x.'], hatD: 'xoxoxoxoxoxoxoxo', hatO: ['..x...x...x...x.'],
        fant: ['......o.......o.'], perc: ['oxoxoxoxoxoxoxox'],
        basse: [[[0, 0, 1], [2, 12, 1], [4, 0, 1], [6, 12, 1], [8, 0, 1], [10, 12, 1], [12, 0, 1], [14, 12, 1]],
          [[0, 0, 1], [1, 12, 1], [2, 0, 1], [3, 12, 1], [4, 0, 1], [5, 12, 1], [6, 0, 1], [7, 12, 1], [8, 0, 1], [9, 12, 1], [10, 0, 1], [11, 12, 1], [12, 0, 1], [13, 12, 1], [14, 0, 1], [15, 12, 1]]],
        keys: [[[0, 2], [3, 2], [6, 2], [10, 2], [12, 2]], [[0, 4], [6, 2], [8, 4], [14, 2]]], stab: [[[2, 1], [6, 1], [10, 1], [14, 1]]], arp: ['up16', 'updown16'],
        cuiv: [[[0, 4], [6, 2], [10, 4]], [[0, 2], [3, 2], [6, 2], [10, 2], [14, 1]]] },
      ouv: [['arp', 'basse', 'kick'], ['lead', 'arp', 'kick'], ['pad', 'arp', 'basse']],
      ordre: ['arp!', 'basse', 'kick', 'hat', 'snare', 'lead', 'cuivres', 'pad', 'i_filtre', 'keys', 'pompe', 'contre', 'i_basse', 'hatO', 'clarte', 'i_frappe', 'cordes', 'fant', 'i_dense', 'octave',
        'i_relance', 'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'final!'] },
    // HYPERVITESSE : la drum & bass liquide — 170-176, la grosse caisse sur le 1 et le « et » du 2, la reese, le Rhodes, des notes tenues
    dnb: { nom: 'HYPERVITESSE', dit: 'drum & bass liquide', bpm: [170, 176], monte: [2, 4], modes: ['mineur', 'dorien'], swing: 0, reg: 70, cap: 84, pompe: .6, ferme: 3800,
      grilles: { mineur: ['0:m9 8:maj9 3:maj9 10:6', '0:m9 0:m9 8:maj9 10:6', '5:m9 8:maj9 0:m9 0:m9', '0:m9 3:maj9 8:maj9 7:7sus'], dorien: ['0:m9 5:9 0:m9 5:9', '0:m9 3:maj9 5:9 10:maj9'] },
      keysT: ['rhodes', 'dx', 'piano'], leadT: { verre: 2, flute: 1.5, sifflet: 1.2, theremine: 1, saxo: 1, kalimba: 1 }, trans: { roll: 2, souffle: 2, trou: 2, filtre: 2, begaie: 1, rien: 2.5 },
      basseT: ['reese', 'sub808', 'roule'], cells: [2, 3, 4, 4, 6, 8], fill: ['roll'], phrases: { longues: 2.5, appel: 2, envol: 1, classique: 1 },
      kit: { f0: [150, 175], f1: [48, 54], dec: [.25, .35], clic: [.12, .2], drive: [1.1, 1.5], snare: ['grosse', 'clap'] },
      pat: { kick: ['X.........X.....', 'X.........X..x..', 'X.X.......X.....'], snare: ['....X.......X...', '....X..o....X..o'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.xxx.x.'], hatD: 'xoxoxoxoxoxoxoxo',
        hatO: ['......x.......x.'], fant: ['.......o.o.....o'], perc: ['oxoxoxoxoxoxoxox'], basse: [[[0, 0, 12], [12, 0, 4]], [[0, 0, 6], [6, 0, 4], [10, 7, 6]], [[0, 0, 3], [3, 12, 3], [6, 0, 4], [10, 0, 6]]],
        keys: [[[0, 16]], [[0, 6], [6, 10]], [[0, 3], [6, 3], [10, 6]]], stab: [[[0, 2], [6, 2], [10, 2]]], arp: ['up8', 'rand8'] },
      ouv: [['pad', 'keys', 'hat'], ['keys', 'pad', 'basse'], ['pad', 'lead', 'keys']],
      ordre: ['pad!', 'keys', 'hat', 'basse', 'kick', 'snare', 'lead', 'i_filtre', 'fant', 'sub', 'contre', 'i_basse', 'hatO', 'clarte', 'i_frappe', 'cordes', 'perc', 'i_dense', 'octave', 'i_relance',
        'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // BOULE À FACETTES : le disco funk — dorien ou mixolydien (des accords de septième de dominante), la basse en octaves, le clavinet
    // en doubles croches, les charleys ouverts sur les contretemps, les congas, les cuivres
    disco: { nom: 'BOULE À FACETTES', dit: 'disco funk', bpm: [114, 122], monte: [8, 12], modes: ['dorien', 'mixolydien'], swing: .04, reg: 69, cap: 84, pompe: .4, ferme: 3600,
      grilles: { dorien: ['0:m7 5:9 0:m7 5:9', '0:m9 5:9 3:maj7 5:9', '0:m7 0:m7 5:9 7:m7'], mixolydien: ['0:9 10:M 5:M 0:9', '0:7 5:M 10:M 5:M', '0:9 0:9 10:6 5:maj7'] },
      keysT: ['clav', 'piano', 'rhodes'], leadT: { cuivre: 2.5, saxo: 2, talkbox: 2, guitare: 2, sifflet: 1 }, trans: { run: 2, roll: 1.5, toms: 1.5, filtre: 1.5, souffle: 1, rien: 2.5 },
      basseT: ['slap', 'funk', 'roule'], cells: [1, 2, 2, 3, 4], fill: ['toms', 'roll'], phrases: { riff: 2, classique: 1.5, appel: 1.5, envol: 1 },
      kit: { f0: [140, 165], f1: [48, 54], dec: [.3, .4], clic: [.1, .18], drive: [1, 1.3], snare: ['clap', 'grosse'] },
      pat: { kick: ['X...X...X...X...'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.', 'xxxxxxxxxxxxxxxx'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..x...x...x...x.'],
        fant: ['.......o.......o'], perc: ['..H...L...H.H.L.', 'oxoxoxoxoxoxoxox'],
        basse: [[[0, 0, 1], [2, 12, 1], [4, 0, 1], [6, 12, 1], [8, 0, 1], [10, 12, 1], [12, 0, 1], [14, 12, 1]], [[0, 0, 2], [3, 12, 1], [6, 0, 1], [7, 12, 1], [10, 0, 2], [12, 7, 1], [14, 12, 2]]],
        keys: [[[0, 1], [3, 1], [6, 1], [8, 1], [11, 1], [14, 1]], [[0, 2], [4, 1], [6, 2], [10, 1], [12, 2]], [[0, 1], [2, 1], [3, 1], [6, 1], [8, 1], [10, 1], [11, 1], [14, 1]]],
        stab: [[[2, 1], [6, 1], [10, 1], [14, 1]]], arp: ['up8'], cuiv: [[[0, 2], [3, 2], [12, 4]], [[6, 2], [10, 2], [14, 2]]] },
      ouv: [['basse', 'kick', 'hat'], ['keys', 'basse', 'hatO'], ['cordes', 'kick', 'basse']],
      ordre: ['basse!', 'kick', 'hat', 'keys', 'snare', 'hatO', 'lead', 'cuivres', 'i_filtre', 'perc', 'pompe', 'cordes', 'i_basse', 'contre', 'clarte', 'i_keys', 'i_frappe', 'fant', 'choeur', 'i_dense',
        'double', 'octave', 'i_basseOct', 'i_tambours', 'harmo', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // 2-STEP : le UK garage — la grosse caisse qui saute des temps, la balance lourde, l'orgue en accords hachés, le chœur découpé
    garage: { nom: '2-STEP', dit: 'UK garage', bpm: [130, 134], monte: [4, 7], modes: ['mineur', 'dorien'], swing: .12, reg: 68, cap: 84, pompe: .45, ferme: 3500,
      grilles: { mineur: ['0:m9 5:m9 8:maj9 7:7sus', '0:m9 8:maj9 5:m9 5:m9', '3:maj9 5:m9 0:m9 0:m9'], dorien: ['0:m9 5:9 3:maj9 5:9', '0:m7 5:9 0:m7 2:m7'] },
      keysT: ['orgue', 'rhodes', 'dx'], leadT: { talkbox: 2, verre: 2, sifflet: 1.5, carre: 1, kalimba: 1, theremine: .8 }, trans: { begaie: 2.5, trou: 2, filtre: 2, glisse: 1.5, hats: 1.5, rien: 2.5 },
      basseT: ['sub808', 'reese', 'funk'], cells: [1, 2, 2, 3], fill: ['hats'], phrases: { appel: 2.5, riff: 2, classique: 1 },
      kit: { f0: [150, 175], f1: [46, 52], dec: [.3, .42], clic: [.12, .2], drive: [1.2, 1.6], snare: ['rim', 'clap'] },
      pat: { kick: ['X.........X.....', 'X......X..X.....', 'X.........X..x..'], snare: ['....X.......X...'], hat: ['..x...x...x...x.', 'x.xox.xox.xox.xo'], hatD: 'xoxoxoxoxoxoxoxo', hatO: ['......x.......x.'],
        fant: ['...o.....o......'], perc: ['...H......L.....'], basse: [[[0, 0, 3], [6, 0, 2], [10, 12, 2], [13, 0, 3]], [[0, 0, 2], [3, 0, 1], [6, 7, 2], [10, 0, 3], [14, 12, 2]]],
        keys: [[[0, 2], [6, 2], [11, 2]], [[0, 1], [3, 1], [6, 2], [11, 1], [14, 2]]], stab: [[[3, 1], [6, 1], [11, 1], [14, 1]]], arp: ['rand8'],
        chop: [[[0, 1], [3, 1], [6, 2]], [[8, 1], [10, 1], [14, 2]]] },
      ouv: [['keys', 'hat', 'basse'], ['choeur', 'keys', 'hat'], ['basse', 'hat', 'kick']],
      ordre: ['keys!', 'hat', 'basse', 'kick', 'snare', 'choeur', 'lead', 'i_filtre', 'fant', 'stab', 'pompe', 'perc', 'i_basse', 'hatO', 'contre', 'clarte', 'i_frappe', 'pad', 'i_keys', 'i_dense',
        'double', 'octave', 'i_basseOct', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // NUIT LO-FI : 84-90 qui monte vers 100, la balance d'un batteur fatigué, le vinyle, le Rhodes, la mélodie posée
    lofi: { nom: 'NUIT LO-FI', dit: 'lo-fi hip-hop', bpm: [84, 90], monte: [14, 18], modes: ['dorien', 'mineur'], swing: .18, reg: 66, cap: 81, pompe: .5, ferme: 2600,
      grilles: { dorien: ['0:m9 5:9 0:m9 5:9', '0:m9 3:maj9 2:m7 5:9', '3:maj9 2:m7 0:m9 0:m9'], mineur: ['0:m9 8:maj9 3:maj9 7:7sus', '5:m9 7:7sus 0:m9 8:maj9'] },
      keysT: ['rhodes', 'piano', 'harpe'], leadT: { kalimba: 2, flute: 2, guitare: 2, sifflet: 1.2, verre: 1, steel: .8 }, trans: { filtre: 2.5, trou: 1.5, souffle: 1.5, glisse: 1, rien: 3 },
      basseT: ['sub808', 'funk', '808'], cells: [2, 3, 4, 6, 8], fill: ['roll'], phrases: { longues: 2, appel: 2, classique: 1.5 },
      kit: { f0: [120, 145], f1: [44, 50], dec: [.35, .5], clic: [.04, .1], drive: [1.2, 1.8], snare: ['rim', 'clap'] },
      pat: { kick: ['X......xX.x.....', 'X.....x...X.....', 'X......x..X..x..'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.x.xxx.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..............x.'],
        fant: ['.......o...o....'], perc: ['oxoxoxoxoxoxoxox'], basse: [[[0, 0, 6], [8, 0, 3], [11, 7, 5]], [[0, 0, 3], [3, 0, 3], [8, 12, 3], [11, 0, 5]]],
        keys: [[[0, 8], [8, 8]], [[0, 3], [3, 5], [10, 6]], [[0, 2], [3, 3], [7, 2], [10, 3], [14, 2]]], arp: ['up8'] },
      ouv: [['keys', 'vinyl', 'hat'], ['vinyl', 'keys', 'basse'], ['keys', 'lead', 'vinyl']],
      ordre: ['keys!', 'vinyl', 'hat', 'basse', 'kick', 'snare', 'lead', 'i_filtre', 'fant', 'pad', 'contre', 'i_basse', 'perc', 'clarte', 'i_keys', 'i_frappe', 'cordes', 'hatO', 'i_dense', 'octave',
        'i_relance', 'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // TURBINE : le big beat — des accords de QUINTE à la guitare saturée en croches, le breakbeat, la ride, les toms, la guitare qui chante
    rock: { nom: 'TURBINE', dit: 'big beat à guitares', bpm: [132, 140], monte: [5, 8], modes: ['mineur', 'sombre'], swing: 0, reg: 66, cap: 82, pompe: .7, ferme: 4000,
      grilles: { mineur: ['0:5 8:5 10:5 0:5', '0:5 0:5 3:5 10:5', '0:5 10:5 8:5 7:5', '5:5 8:5 0:5 0:5'], sombre: ['0:5 1:5 0:5 1:5', '0:5 3:5 1:5 0:5'] },
      keysT: ['guitare'], leadT: { guitareSat: 3, scie: 1.5, cuivre: 1, theremine: .6 }, trans: { toms: 2.5, roll: 2, trou: 2, souffle: 1, rien: 2 },
      basseT: ['roule', 'funk', 'acid'], cells: [1, 2, 2, 3, 4], fill: ['toms'], phrases: { riff: 3, classique: 1.5, envol: 1 },
      kit: { f0: [140, 165], f1: [50, 56], dec: [.3, .4], clic: [.18, .26], drive: [1.6, 2.4], snare: ['grosse', 'clap'] },
      pat: { kick: ['X.X.......X.....', 'X.....X.X.X.....', 'X.X.....X.X..X..'], snare: ['....X.......X...', '....X.......X.X.'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['x.......x.......'],
        fant: ['.......o......o.'], basse: [[[0, 0, 1], [2, 0, 1], [4, 0, 1], [6, 0, 1], [8, 0, 1], [10, 0, 1], [12, 0, 1], [14, 0, 1]], [[0, 0, 2], [3, 0, 1], [4, 12, 1], [6, 0, 2], [8, 0, 1], [10, 7, 2], [12, 12, 1], [14, 0, 2]]],
        keys: [[[0, 1], [2, 1], [4, 1], [6, 1], [8, 1], [10, 1], [12, 1], [14, 1]], [[0, 3], [3, 3], [6, 2], [8, 3], [11, 3], [14, 2]]], arp: ['up8'] },
      ouv: [['keys', 'kick', 'basse'], ['keys', 'basse', 'hat'], ['lead', 'keys', 'kick']],
      ordre: ['keys!', 'kick', 'basse', 'snare', 'hat', 'lead', 'toms', 'i_filtre', 'ride', 'pompe', 'i_basse', 'contre', 'clarte', 'i_frappe', 'fant', 'cordes', 'hatO', 'i_dense', 'octave', 'i_relance',
        'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // PIXEL : la chiptune d'arcade — la basse triangle, les accords 8 bits, la puce, des arpèges rapides ; parfois en MAJEUR (la joie)
    pixel: { nom: 'PIXEL', dit: 'chiptune d’arcade', bpm: [148, 158], monte: [4, 7], modes: ['mineur', 'majeur'], modeW: { majeur: 1.6 }, swing: 0, reg: 70, cap: 84, pompe: .3, ferme: 5000,
      grilles: { mineur: ['0:m 8:M 10:M 0:m', '0:m 3:M 10:M 8:M', '5:m 0:m 8:M 10:M', '0:m 8:M 5:m 7:m'], majeur: ['0:M 9:m 5:M 7:M', '0:M 7:M 9:m 5:M', '5:M 7:M 0:M 0:M'] },
      keysT: ['puce'], leadT: { chip: 4, carre: 2, sifflet: .6 }, pluckT: ['puce', 'fm'], contreT: ['orgue', 'flute'], trans: { run: 2.5, begaie: 2.5, hats: 1.5, trou: 1, rien: 2 },
      basseT: ['tri', 'acid'], cells: [1, 1, 2, 2, 3, 4], fill: ['hats'], phrases: { riff: 2, envol: 2, classique: 2 },
      kit: { f0: [180, 220], f1: [60, 70], dec: [.12, .18], clic: [.2, .3], drive: [1.5, 2.5], snare: ['puce'] },
      pat: { kick: ['X...X...X...X...', 'X.....X.X...X...'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..x...x...x...x.'], fant: ['...........o.o..'],
        basse: [[[0, 0, 2], [2, 12, 2], [4, 0, 2], [6, 12, 2], [8, 0, 2], [10, 12, 2], [12, 0, 2], [14, 12, 2]],
          [[0, 0, 1], [1, 12, 1], [2, 0, 1], [3, 12, 1], [4, 0, 1], [5, 12, 1], [6, 0, 1], [7, 12, 1], [8, 0, 1], [9, 12, 1], [10, 0, 1], [11, 12, 1], [12, 0, 1], [13, 12, 1], [14, 0, 1], [15, 12, 1]]],
        keys: [[[0, 2], [4, 2], [8, 2], [12, 2]], [[0, 1], [2, 1], [4, 1], [6, 1], [8, 1], [10, 1], [12, 1], [14, 1]]], arp: ['up16', 'updown16'] },
      ouv: [['arp', 'basse', 'kick'], ['lead', 'arp', 'basse'], ['basse', 'arp', 'hat']],
      ordre: ['arp!', 'basse', 'kick', 'lead', 'snare', 'hat', 'keys', 'i_filtre', 'contre', 'fant', 'i_basse', 'hatO', 'clarte', 'i_frappe', 'cloche', 'harmo', 'i_dense', 'octave', 'i_relance', 'roll',
        'double', 'i_basseOct', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'pompe', 'final!'] },
    // GRAND PRIX : l'épique — les cordes ouvrent, l'ostinato de bois, les toms, les cuivres, le chœur, la dominante (V7) qui tire vers le i
    epique: { nom: 'GRAND PRIX', dit: 'épique orchestral', bpm: [136, 144], monte: [5, 8], modes: ['mineur'], swing: 0, reg: 67, cap: 83, pompe: .5, ferme: 4200,
      grilles: { mineur: ['0:m 8:M 5:m 7:7', '0:m 8:M 3:M 10:M', '0:m 5:m 8:M 7:7sus', '8:M 10:M 0:m 0:m', '0:m 3:M 8:M 7:7'] },
      keysT: ['piano', 'harpe'], leadT: { cuivre: 3, flute: 1.5, theremine: .8, verre: 1, sifflet: .7 }, pluckT: ['bois', 'verre'], contreT: ['violon', 'voix'], padT: ['voix', 'doux'],
      trans: { toms: 3, roll: 2, souffle: 2, trou: 1, rien: 2 }, basseT: ['roule', 'sub808', 'reese'], cells: [2, 2, 3, 4, 6], fill: ['toms'], phrases: { envol: 2.5, longues: 2, classique: 1.5 },
      kit: { f0: [120, 140], f1: [40, 46], dec: [.5, .7], clic: [.05, .1], drive: [1.2, 1.6], snare: ['grosse', 'clap'] },
      pat: { kick: ['X.......X.......', 'X.....X.X.......'], snare: ['....X.......X...'], hat: ['x...x...x...x...', 'x.x.x.x.x.x.x.x.'], hatD: 'x.x.x.x.x.x.x.x.', hatO: ['........x.......'],
        fant: ['..............oo'], perc: ['..H...H...H.L.L.'], basse: [[[0, 0, 4], [4, 0, 4], [8, 0, 4], [12, 0, 4]], [[0, 0, 2], [2, 0, 2], [4, 12, 2], [6, 0, 2], [8, 0, 2], [10, 0, 2], [12, 12, 2], [14, 7, 2]]],
        keys: [[[0, 8], [8, 8]], [[0, 4], [4, 4], [8, 4], [12, 4]]], arp: ['up16', 'updown16'], cuiv: [[[0, 6], [8, 6]], [[0, 3], [4, 3], [8, 8]]] },
      ouv: [['cordes', 'arp', 'toms'], ['arp', 'cordes', 'basse'], ['choeur', 'cordes', 'arp']],
      ordre: ['cordes!', 'arp', 'toms', 'basse', 'kick', 'snare', 'cuivres', 'lead', 'i_filtre', 'perc', 'choeur', 'i_basse', 'hat', 'clarte', 'i_frappe', 'contre', 'pad', 'i_dense', 'octave', 'i_relance',
        'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // MALECÓN : le dembow (la caisse en 3-3-2), le steel drum, la kalimba, le marimba, la 808 — le bord de mer la nuit
    dembow: { nom: 'MALECÓN', dit: 'dembow tropical', bpm: [94, 100], monte: [10, 14], modes: ['mineur', 'dorien'], swing: .02, reg: 69, cap: 84, pompe: .5, ferme: 3800,
      grilles: { mineur: ['0:m 8:M 10:M 0:m', '0:m 3:M 8:M 10:M', '5:m 0:m 8:M 10:M', '0:m7 8:maj7 3:maj7 10:M'], dorien: ['0:m7 5:M 0:m7 5:M', '0:m 5:M 3:M 5:M'] },
      keysT: ['piano', 'harpe', 'dx'], leadT: { steel: 3, kalimba: 2.5, sifflet: 1.5, verre: 1, flute: 1, saxo: .8 }, pluckT: ['bois', 'verre', 'fm'], trans: { glisse: 2, begaie: 2, hats: 1.5, trou: 1.5, filtre: 1, rien: 2.5 },
      basseT: ['808', 'sub808'], cells: [1, 2, 2, 3, 4], fill: ['hats'], phrases: { riff: 2.5, appel: 2, classique: 1 },
      kit: { f0: [140, 165], f1: [44, 50], dec: [.4, .55], clic: [.1, .18], drive: [1.4, 2], snare: ['rim', 'clap'] },
      pat: { kick: ['X...X...X...X...'], snare: ['...x..x....x..x.'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.xxx.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['......x.......x.'],
        fant: ['...o..o....o..o.'], perc: ['..H..L....H..L..', 'oxoxoxoxoxoxoxox'], basse: [[[0, 0, 3], [3, 0, 3], [6, 0, 2], [8, 0, 3], [11, 0, 3], [14, 0, 2]], [[0, 0, 3], [3, 7, 3], [6, 12, 2], [8, 0, 3], [11, 7, 3], [14, 12, 2]]],
        keys: [[[3, 2], [6, 2], [11, 2], [14, 2]], [[0, 2], [3, 2], [6, 2], [8, 2], [11, 2], [14, 2]]], stab: [[[3, 1], [6, 1], [11, 1], [14, 1]]], arp: ['rand8', 'up8'] },
      ouv: [['lead', 'perc', 'basse'], ['keys', 'perc', 'kick'], ['perc', 'basse', 'lead']],
      ordre: ['perc!', 'basse', 'kick', 'snare', 'lead', 'keys', 'hat', 'i_filtre', 'arp', 'pompe', 'fant', 'i_basse', 'contre', 'clarte', 'i_frappe', 'hatO', 'pad', 'i_keys', 'i_dense', 'octave',
        'double', 'i_basseOct', 'i_tambours', 'harmo', 'choeur', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // ZEF : le rave-rap sombre (mesuré sur Die Antwoord, « Age of Illusion » : 83 BPM, la mineur, deux accords do ↔ la m, la basse
    // +24 dB, le haut sombre, 13 dB de contraste — des ponts sans basse puis le drop) : demi-temps, la 808 saturée, les accords de rave
    zef: { nom: 'ZEF', dit: 'rave-rap sombre', bpm: [80, 86], monte: [14, 20], modes: ['mineur'], swing: .04, reg: 64, cap: 80, pompe: .55, ferme: 2400, basseDb: 3, respP: .95,
      grilles: { mineur: ['3:M 3:M 0:m 3:M', '0:m 0:m 3:M 3:M', '3:M 0:m 3:M 0:m', '0:m 3:M 0:m 7:m'] },
      keysT: ['piano', 'orgue'], leadT: { scie: 2.5, theremine: 2, chip: 1.5, carre: 1.5, sifflet: 1 }, pluckT: ['scie', 'puce'], padT: ['voix', 'scie'], contreT: ['voix', 'orgue'],
      trans: { trou: 3, begaie: 2, glisse: 2, souffle: 1.5, rien: 2 }, basseT: ['808dur', 'sub808', '808'], cells: [1, 2, 2, 3, 4], fill: ['hats'], phrases: { riff: 3, appel: 2, longues: 1 },
      kit: { f0: [150, 180], f1: [40, 46], dec: [.5, .7], clic: [.15, .25], drive: [2, 3], snare: ['clap', 'grosse'] },
      pat: { kick: ['X.........X.....', 'X......X..X.....', 'X.....X...X..X..'], snare: ['........X.......'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.xxx.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..............x.'],
        fant: ['.............o..'], perc: ['........x.......'], basse: [[[0, 0, 10], [10, 0, 6]], [[0, 0, 6], [6, 0, 4], [10, 12, 6]], [[0, 0, 3], [3, 0, 3], [6, 0, 4], [10, 7, 6]]],
        keys: [[[0, 16]], [[0, 2], [3, 2], [6, 2], [10, 6]]], stab: [[[0, 2], [3, 2], [6, 2], [10, 2], [12, 2]], [[0, 1], [2, 1], [4, 1], [6, 1], [8, 1], [10, 1], [12, 1], [14, 1]]], arp: ['up16', 'rand8'] },
      ouv: [['pad', 'stab', 'basse'], ['keys', 'pad', 'lead'], ['stab', 'basse', 'hat']],
      ordre: ['pad!', 'stab', 'basse', 'kick', 'snare', 'hat', 'lead', 'i_filtre', 'fant', 'sub', 'choeur', 'i_basse', 'hatO', 'clarte', 'i_frappe', 'arp', 'keys', 'i_dense', 'octave', 'i_relance',
        'double', 'i_basseOct', 'i_tambours', 'roll', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // STADE : l'indie rock en majeur (techniques de Stuck in the Sound, « Let's Go ») — les toms qui martèlent dès le 1er moteur, la guitare
    // grattée, la basse en croches, le chœur de stade sur le thème, les « HÉ ! », une énergie tenue longtemps
    stade: { nom: 'STADE', dit: 'indie rock de stade', bpm: [88, 92], monte: [16, 22], modes: ['majeur', 'mineur'], modeW: { majeur: 3 }, swing: 0, reg: 67, cap: 84, pompe: .4, ferme: 4600,
      grilles: { majeur: ['0:M 0:M 0:M 9:m', '0:M 9:m 5:M 7:M', '0:M 7:M 9:m 5:M', '5:M 0:M 7:M 9:m'], mineur: ['0:m 8:M 3:M 10:M', '0:m 0:m 8:M 10:M'] },
      keysT: ['guitareC', 'guitare'], leadT: { guitare: 2.5, sifflet: 1.5, carre: 1.5, scie: 1, cuivre: .8 }, trans: { toms: 3, roll: 2, trou: 2, souffle: 1, rien: 2 },
      basseT: ['roule', 'funk', 'slap'], cells: [1, 2, 2, 3, 4], fill: ['toms'], phrases: { riff: 2, classique: 2, envol: 1.5, appel: 1 },
      kit: { f0: [140, 165], f1: [50, 56], dec: [.3, .4], clic: [.15, .22], drive: [1.4, 2], snare: ['acoustique', 'clap'] },
      pat: { kick: ['X.....X.X.......', 'X.....X.X...X...', 'X.X...X.X.X.....'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['x...............'],
        fant: ['.......o.......o'], perc: ['oxoxoxoxoxoxoxox'], tribu: ['L.L.LL.L.L.LL.L.', 'L..L..L.L..L.LHH', 'LL.LL.L.LL.LL.HH'],
        basse: [[[0, 0, 1], [2, 0, 1], [4, 0, 1], [6, 0, 1], [8, 0, 1], [10, 0, 1], [12, 0, 1], [14, 0, 1]],
          [[0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 1], [4, 0, 1], [5, 0, 1], [6, 0, 1], [7, 0, 1], [8, 0, 1], [9, 0, 1], [10, 0, 1], [11, 0, 1], [12, 0, 1], [13, 0, 1], [14, 12, 1], [15, 0, 1]]],
        keys: [[[0, 2], [2, 2], [4, 2], [6, 2], [8, 2], [10, 2], [12, 2], [14, 2]], [[0, 3], [3, 3], [6, 2], [8, 3], [11, 3], [14, 2]]], arp: ['up8'] },
      ouv: [['tribu', 'keys', 'basse'], ['keys', 'tribu', 'kick'], ['tribu', 'basse', 'lead']],
      ordre: ['tribu!', 'keys', 'basse', 'kick', 'snare', 'hat', 'lead', 'i_filtre', 'foule', 'fant', 'i_basse', 'pompe', 'clarte', 'i_frappe', 'contre', 'hatO', 'cordes', 'i_dense', 'octave', 'i_relance',
        'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
  };
  ['rock', 'touge'].forEach(k => { COULEURS[k].ordre = COULEURS[k].ordre.map(x => x === 'harmo' ? 'foule' : x); });
  // ================================================================ LA DA DUBSTEP (v4.0) : demi-temps, la wob, le growl, le drop
  const DUB_PAT = { kick: ['X.........X.....', 'X.......X.X.....', 'X......X..X.....', 'X.........X..x..'], snare: ['........X.......', '........X.....x.'], hat: ['x.x.x.x.x.x.x.x.', 'x...x...x...x...', 'x.xxx.x.x.xxx.x.'],
    hatD: 'xxxxxxxxxxxxxxxx', hatO: ['......x.......x.'], fant: ['.....o......o...'], perc: ['....x.......x...'], keys: [[[0, 16]], [[0, 8], [8, 8]], [[0, 6], [6, 4], [10, 6]]],
    stab: [[[2, 1], [6, 1], [10, 1], [14, 1]]], arp: ['up16', 'updown16'], chop: [[[0, 1], [3, 1], [6, 2]], [[8, 1], [11, 1], [14, 2]]], basse: [[[0, 0, 8], [8, 0, 8]]] };
  const DUB = (o, plus) => Object.assign({ swing: 0, reg: 68, cap: 86, pompe: .55, monte: [2, 4], trans: { roll: 2, trou: 2.5, souffle: 2, filtre: 1.5, begaie: 1.5, rien: 2 }, fill: ['roll'], cells: [1, 2, 2, 3, 4],
    basseT: ['sub808'], keysT: ['piano', 'dx'], kit: { f0: [150, 175], f1: [44, 50], dec: [.35, .5], clic: [.15, .25], drive: [1.6, 2.4], snare: ['grosse', 'clap'] }, pat: Object.assign({}, DUB_PAT, plus || {}) }, o);
  Object.assign(COULEURS, {
    dubmelo: DUB({ nom: 'MÉLODIQUE', dit: 'dubstep mélodique', bpm: [140, 146], modes: ['mineur'], ferme: 4200, phrases: { envol: 2.5, longues: 2, classique: 1.5 },
      grilles: { mineur: ['0:m 8:M 3:M 10:M', '8:M 10:M 0:m 0:m', '0:m 10:M 8:M 10:M', '5:m 8:M 0:m 10:M', '0:m9 8:maj9 3:maj9 10:6'] },
      leadT: { scie: 2.5, talkbox: 1.2, cuivre: 1 }, padT: ['scie', 'voix'], dub: { wubs: [[1, 1, 1, 1], [2, 2, 1, 1], [1, 2, 1, 2], [2, 2, 2, 'S']], dur: [[2, 4, 2, 4], [3, 3, 2, 2], [4, 4, 4, 'S']], lo: 140, hi: 2400, gate: null, growl: [[0, 2, 0], [4, 2, 0], [8, 3, 12], [12, 2, 7]] },
      ouv: [['keys', 'pad', 'choeur'], ['pad', 'keys', 'lead']],
      ordre: ['keys!', 'pad', 'choeur', 'hat', 'lead', 'snare', 'i_filtre', 'kick', 'wob', 'sub', 'pompe', 'fant', 'clarte', 'i_frappe', 'cordes', 'arp', 'contre', 'i_dense', 'roll', 'growl',
        'octave', 'i_relance', 'double', 'i_triolet', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'final!'] }),
    riddim: DUB({ nom: 'RIDDIM', dit: 'riddim', bpm: [140, 150], modes: ['sombre', 'mineur'], ferme: 3200, phrases: { riff: 3, appel: 2 },
      grilles: { sombre: ['0:m 0:m 0:m 0:m', '0:m 0:m 1:M 0:m'], mineur: ['0:m 0:m 0:m 8:M', '0:m 0:m 0:m 0:m'] }, leadT: { carre: 1.5, scie: 1 }, keysT: ['dx'],
      dub: { wubs: [[3, 3, 3, 3], [2, 3, 2, 3], [3, 0, 3, 0]], dur: [[4, 4, 3, 3], [3, 3, 4, 'S'], [6, 6, 3, 3]], lo: 110, hi: 2000, gate: [[0, 3], [3, 3], [6, 2], [8, 3], [11, 3], [14, 2]],
        growl: [[0, 2, 0], [3, 1, 0], [6, 2, 12], [10, 2, 0], [12, 1, 7], [14, 2, 0]] },
      ouv: [['pad', 'hat', 'snare'], ['hat', 'pad', 'kick']],
      ordre: ['pad!', 'hat', 'snare', 'kick', 'sub', 'wob', 'fant', 'i_filtre', 'roll', 'growl', 'pompe', 'clarte', 'i_frappe', 'i_riddim', 'choeur', 'perc', 'i_dense', 'i_triolet', 'lead', 'i_relance',
        'double', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'keys', 'octave', 'modul', 'stab', 'final!'] }),
    brostep: DUB({ nom: 'BROSTEP', dit: 'brostep', bpm: [140, 150], modes: ['mineur', 'sombre'], ferme: 4000, phrases: { riff: 2.5, classique: 1.5, appel: 1 },
      grilles: { mineur: ['0:m 0:m 8:M 10:M', '0:m 8:M 3:M 10:M', '0:m 0:m 5:m 5:m'], sombre: ['0:m 1:M 0:m 1:M', '0:m 0:m 1:M 0:m'] }, leadT: { scie: 2, carre: 1.5, cuivre: 1 },
      dub: { wubs: [[2, 4, 2, 'S'], [4, 4, 4, 4], [3, 3, 4, 4], [2, 2, 4, 4]], dur: [[4, 6, 4, 6], [6, 6, 6, 'S'], [4, 3, 6, 4]], lo: 120, hi: 3200, gate: [[0, 4], [4, 2], [6, 2], [8, 4], [12, 2], [14, 2]],
        growl: [[0, 3, 0], [4, 2, 12], [6, 1, 0], [8, 4, 7], [12, 2, 0], [14, 2, 12]], growlTot: true },
      ouv: [['keys', 'pad', 'hat'], ['pad', 'lead', 'hat']],
      ordre: ['keys!', 'pad', 'hat', 'snare', 'lead', 'kick', 'i_filtre', 'wob', 'sub', 'growl', 'fant', 'pompe', 'clarte', 'i_frappe', 'choeur', 'roll', 'i_riddim', 'i_dense', 'cordes', 'i_triolet',
        'i_relance', 'double', 'octave', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'stab', 'final!'] }),
    dubuk: DUB({ nom: 'DUB DE LONDRES', dit: 'dubstep de Londres (2005)', bpm: [138, 142], modes: ['mineur', 'dorien'], ferme: 3000, swing: .04, phrases: { appel: 2.5, longues: 2 },
      grilles: { mineur: ['0:m 0:m 5:m 5:m', '0:m 0:m 0:m 8:M'], dorien: ['0:m7 0:m7 5:9 5:9', '0:m7 3:maj7 5:m7 0:m7'] }, keysT: ['rhodes', 'orgue', 'dx'], leadT: { cuivre: 1.5, saxo: 1.5, carre: .8 },
      dub: { wubs: [[1, 1, 1, 1], [.5, .5, 1, 1], [2, 1, 2, 1]], dur: [[2, 2, 1, 1], [2, 2, 2, 2]], lo: 170, hi: 1900, gate: null, growl: [[0, 4, 0], [8, 4, 7]] },
      ouv: [['pad', 'hat', 'stab'], ['pad', 'stab', 'perc']],   // (le sous-grave arrive au drop, avec la wob : la montée)
      ordre: ['pad!', 'sub', 'hat', 'kick', 'snare', 'wob', 'stab', 'perc', 'i_filtre', 'fant', 'lead', 'pompe', 'clarte', 'echo', 'i_frappe', 'keys', 'hatO', 'roll', 'i_dense', 'contre',
        'i_relance', 'double', 'growl', 'i_triolet', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'final!'] }),
    chillstep: DUB({ nom: 'CHILLSTEP', dit: 'chillstep', bpm: [138, 142], modes: ['mineur'], ferme: 2800, phrases: { longues: 3, envol: 1.5, appel: 1 },
      grilles: { mineur: ['0:m9 8:maj9 3:maj9 10:6', '5:m9 8:maj9 0:m9 0:m9', '0:m9 3:maj9 8:maj9 7:7sus'] }, keysT: ['piano', 'harpe'], leadT: { talkbox: 1.2, cuivre: .8, scie: .6 },
      dub: { wubs: [[1, 1, 1, 1], [.5, .5, .5, .5], [1, 1, 2, 2]], dur: [[2, 2, 2, 2], [1, 2, 1, 2]], lo: 120, hi: 1600, gate: null, growl: [[0, 6, 0], [8, 6, 7]] },
      ouv: [['pad', 'keys', 'vinyl'], ['keys', 'pad', 'choeur']],
      ordre: ['pad!', 'keys', 'vinyl', 'hat', 'choeur', 'snare', 'lead', 'kick', 'i_filtre', 'sub', 'wob', 'cordes', 'arp', 'pompe', 'fant', 'clarte', 'contre', 'i_frappe', 'i_dense', 'octave',
        'i_relance', 'double', 'i_triolet', 'i_tambours', 'harmo', 'i_pulse', 'i_monte', 'modul', 'i_large', 'final!'] }),
    colorbass: DUB({ nom: 'COLOR BASS', dit: 'color bass', bpm: [145, 150], modes: ['majeur', 'mineur'], ferme: 4400, phrases: { riff: 2, envol: 2, classique: 1.5 },
      grilles: { majeur: ['0:M 7:M 9:m 5:M', '5:maj7 7:7sus 0:M 9:m'], mineur: ['0:m 8:M 3:M 10:M', '8:M 10:M 0:m 0:m'] }, keysT: ['puce', 'dx'], leadT: { carre: 2, scie: 1.5, chip: 1 },
      dub: { wubs: [[2, 2, 2, 2], [4, 2, 4, 2], [3, 3, 2, 2]], dur: [[4, 4, 4, 4], [3, 3, 4, 'S']], lo: 160, hi: 3000, gate: [[0, 2], [2, 2], [6, 2], [8, 3], [12, 2], [14, 2]],
        growl: [[0, 2, 0], [2, 2, 7], [6, 2, 12], [8, 3, 0], [12, 2, 7], [14, 2, 12]] },
      ouv: [['stab', 'arp', 'hat'], ['arp', 'stab', 'pad']],
      ordre: ['stab!', 'arp', 'hat', 'snare', 'kick', 'pad', 'lead', 'i_filtre', 'wob', 'sub', 'fant', 'pompe', 'growl', 'clarte', 'i_frappe', 'choeur', 'i_riddim', 'roll', 'i_dense', 'keys',
        'i_triolet', 'i_relance', 'double', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'perc', 'final!'] }),
  });
  ['dubmelo', 'riddim', 'brostep', 'dubuk', 'chillstep', 'colorbass'].forEach(k => { COULEURS[k].ferme = Math.max(5200, COULEURS[k].ferme * 1.5); });   // (salle : la présence et l'air manquaient)
  const DA_STYLES = { cashcar: ['neon', 'velours', 'luxe', 'drift', 'touge', 'dnb', 'disco', 'garage', 'lofi', 'rock', 'pixel', 'epique', 'dembow', 'zef', 'stade'], dubstep: ['dubmelo', 'riddim', 'brostep', 'dubuk', 'chillstep', 'colorbass'] };   // le chœur de stade chez TURBINE et TOUGE
  // v3.11 : sans flûte ni lead aigu
  const SANS_AIGU = ['flute', 'sifflet', 'verre'];
  for (const k in COULEURS) { const C9 = COULEURS[k]; C9.reg -= 5; C9.cap = Math.min(C9.cap || 86, 82); SANS_AIGU.forEach(x => delete C9.leadT[x]);
    if (C9.contreT) C9.contreT = C9.contreT.filter(x => x !== 'flute'); if (C9.voixB) C9.voixB = C9.voixB.filter(x => x !== 'haut'); if (!C9.voixB || !C9.voixB.length) C9.voixB = ['pluck', 'lead'];
    C9.ordre = C9.ordre.map(x => x === 'i_sommet' ? 'i_large' : x); }
  const COUL_IDS = Object.keys(COULEURS);
  const SIG = {
    moteur: { nom: 'le moteur qui chante', idee: 'le moteur qui chante à chaque phrase — vroum : fondamentale, quinte, octave', mots: ['V12', 'MOTEUR', 'RUGISSEMENT', 'PISTON'], besoin: ['v:moteur'] },
    turbo: { nom: 'le turbo', idee: 'le turbo qui souffle avant la mesure, un sifflet qui monte sur la note', mots: ['TURBO', 'SOUFFLE', 'BOOST', 'COMPRESSEUR'], besoin: ['s:turbo', 'v:siffle'] },
    caisse: { nom: 'la caisse enregistreuse', idee: 'la caisse enregistreuse qui sonne la tonique au début des phrases', mots: ['CAISSE', 'TICKET', 'RECETTE', 'TIROIR-CAISSE'], besoin: ['v:ching', 's:ka'] },
    pieces: { nom: 'la pluie de pièces', idee: 'des pièces accordées qui tintent sur les contretemps, une cascade en fin de phrase', mots: ['PLUIE D’OR', 'JACKPOT', 'PIÈCES', 'MONNAIE'], besoin: ['v:piece'] },
    neon: { nom: 'le néon', idee: 'une enseigne au néon qui grésille sur la fondamentale', mots: ['NÉON', 'ENSEIGNE', 'COURT-CIRCUIT', 'GRÉSIL'], besoin: ['v:neon', 's:hat'] },
    klaxon: { nom: 'les klaxons', idee: 'des coups de klaxon accordés à la fin des phrases', mots: ['KLAXON', 'BOULEVARD', 'BOUCHON', 'PÉRIPH'], besoin: ['v:klaxon'] },
    gouttes: { nom: 'les gouttes de verre', idee: 'des gouttes de verre qui tombent sur les notes de l’accord', mots: ['GOUTTES', 'AVERSE', 'CRISTAL', 'ROSÉE'], besoin: ['v:pluck'] },
    vapeur: { nom: 'les accords à l’envers', idee: 'des accords à l’envers qui aspirent la mesure suivante (vaporwave)', mots: ['VAPEUR', 'MIRAGE', 'CASSETTE', 'REFLET'], besoin: ['a:pad'] },
    sirene: { nom: 'la sirène au loin', idee: 'une sirène au loin, accordée sur l’accord, toutes les huit mesures', mots: ['SIRÈNE', 'POURSUITE', 'GYROPHARE', 'CAVALE'], besoin: ['v:sirene'] },
    drift: { nom: 'les pneus qui crissent', idee: 'les pneus qui crissent en glissade, accordés sur la quinte, une mesure sur deux', mots: ['DRIFT', 'GLISSADE', 'GOMME', 'TOKYO'], besoin: ['v:crisse'] },
    // (trio) les signatures des trois nouveaux
    champagne: { nom: 'le champagne', idee: 'le bouchon qui saute sur le 1er temps toutes les huit mesures, les bulles sur les notes de l’accord, les coupes qui trinquent à mi-phrase', mots: ['CHAMPAGNE'], besoin: ['s:bouchon', 'v:bulle', 'v:ching'] },
    agogo: { nom: 'l’agogô', idee: 'la cloche agogô à deux tons, accordée sur la tonique et la quinte, qui mène l’école', mots: ['AGOGÔ'], besoin: ['v:agogo'] },
    cuica: { nom: 'la cuíca', idee: 'la cuíca qui rit, ses glissés posés sur l’accord', mots: ['CUÍCA'], besoin: ['v:cuica'] },
    coffre: { nom: 'le coffre-fort', idee: 'la molette du coffre qui tourne, puis le verrou qui cède sur la fondamentale, toutes les huit mesures', mots: ['COFFRE'], besoin: ['s:clic', 'v:verrou'] },
  };
  // LA PRODUCTION DE CHAQUE STYLE (v3.6) : grosse caisse, charleys, salle [durée, brillance], réverbe, écho (en doubles croches), retour, saturation
  const PROD = {
    neon: { kickT: ['sine', '909'], hatT: ['metal', 'bruit'], salle: [2.2, 1.1], revB: .36, dly: 3, fb: .38, sat: 1.25 },
    velours: { kickT: ['909', 'sine'], hatT: ['bruit', 'metal'], salle: [1.4, .85], revB: .3, dly: 4, fb: .3, sat: 1.35 },
    luxe: { kickT: ['808', 'sine'], hatT: ['metal', 'fm'], salle: [3, .7], revB: .36, dly: 3, fb: .36, sat: 1.3 },
    drift: { kickT: ['808', '909'], hatT: ['metal', 'chip'], salle: [1, .6], revB: .26, dly: 2, fb: .3, sat: 1.7 },
    touge: { kickT: ['909', 'sine'], hatT: ['bruit', 'metal'], salle: [1.8, 1.1], revB: .32, dly: 3, fb: .32, sat: 1.4 },
    dnb: { kickT: ['acoustique', '909'], hatT: ['bruit', 'fm'], salle: [3.2, .8], revB: .38, dly: 6, fb: .35, sat: 1.2 },
    disco: { kickT: ['909', 'acoustique'], hatT: ['bruit', 'shaker'], salle: [1.2, 1], revB: .3, dly: 2, fb: .28, sat: 1.3 },
    garage: { kickT: ['909', 'sine'], hatT: ['fm', 'bruit'], salle: [1.6, .9], revB: .32, dly: 3, fb: .36, sat: 1.3 },
    lofi: { kickT: ['lofi', 'acoustique'], hatT: ['shaker', 'bruit'], salle: [.9, .5], revB: .28, dly: 4, fb: .3, sat: 1.6 },
    rock: { kickT: ['acoustique', '909'], hatT: ['bruit', 'metal'], salle: [1.3, .9], revB: .3, dly: 2, fb: .25, sat: 1.9 },
    pixel: { kickT: ['chip'], hatT: ['chip'], salle: [.7, 1.2], revB: .16, dly: 2, fb: .3, sat: 1.35 },
    epique: { kickT: ['grave', 'acoustique'], hatT: ['bruit', 'shaker'], salle: [4.2, .7], revB: .44, dly: 4, fb: .3, sat: 1.15 },
    dembow: { kickT: ['808', '909'], hatT: ['metal', 'shaker'], salle: [1.1, .9], revB: .3, dly: 3, fb: .32, sat: 1.4 },
    zef: { kickT: ['808', 'lofi'], hatT: ['metal', 'chip'], salle: [2.8, .5], revB: .3, dly: 4, fb: .4, sat: 1.75 },
    stade: { kickT: ['acoustique', '909'], hatT: ['bruit', 'shaker'], salle: [1.6, 1.1], revB: .32, dly: 2, fb: .25, sat: 1.6 },
    dubmelo: { kickT: ['909', 'sine'], hatT: ['bruit', 'metal'], salle: [2.6, .9], revB: .36, dly: 3, fb: .36, sat: 1.5 }, riddim: { kickT: ['909'], hatT: ['metal', 'bruit'], salle: [1.6, .7], revB: .28, dly: 2, fb: .3, sat: 1.9 },
    brostep: { kickT: ['909'], hatT: ['bruit', 'metal'], salle: [2, .8], revB: .3, dly: 2, fb: .3, sat: 2 }, dubuk: { kickT: ['808', 'sine'], hatT: ['metal', 'shaker'], salle: [2.8, .6], revB: .34, dly: 6, fb: .45, sat: 1.3 },
    chillstep: { kickT: ['sine', 'lofi'], hatT: ['shaker', 'bruit'], salle: [3.2, .7], revB: .4, dly: 4, fb: .4, sat: 1.25 }, colorbass: { kickT: ['909'], hatT: ['bruit', 'fm'], salle: [1.8, 1.1], revB: .3, dly: 3, fb: .32, sat: 1.7 },
  };
  for (const k in PROD) Object.assign(COULEURS[k], PROD[k]);
  COULEURS.rock.kit.snare = ['acoustique', 'grosse']; COULEURS.dnb.kit.snare = ['acoustique', 'clap']; COULEURS.epique.kit.snare = ['grosse', 'acoustique'];
  COULEURS.lofi.kit.snare = ['rim', 'acoustique', 'clap']; COULEURS.disco.kit.snare = ['clap', 'acoustique'];
  // PLUS DE LUMIÈRE (v3.6) : le majeur et le lydien
  const LUMIERE = {
    neon: { majeur: ['0:maj9 7:6 9:m9 5:maj9', '5:maj9 7:6 0:maj9 9:m9', '0:maj9 4:m7 5:maj9 7:6', '9:m9 5:maj9 0:maj9 7:6'] },
    velours: { majeur: ['0:maj9 9:m9 2:m9 7:9', '5:maj9 4:m7 2:m9 0:maj9', '0:maj9 0:maj9 5:maj9 5:maj9'] },
    lofi: { majeur: ['0:maj9 9:m9 5:maj9 7:7sus', '5:maj9 7:7sus 4:m7 9:m9'], lydien: ['0:maj9 2:9 0:maj9 2:9', '0:maj9 2:9 7:maj9 7:maj9'] },
    dnb: { majeur: ['0:maj9 4:m7 5:maj9 7:6', '5:maj9 7:6 9:m9 9:m9'], lydien: ['0:maj9 2:9 0:maj9 2:9'] },
    disco: { majeur: ['0:maj7 9:m7 2:m7 7:9', '0:maj9 5:maj9 2:m9 7:9'] },
    garage: { majeur: ['5:maj9 4:m7 2:m9 0:maj9', '0:maj9 9:m9 5:maj9 7:6'] },
    epique: { majeur: ['0:M 7:M 9:m 5:M', '5:M 7:M 0:M 0:M', '0:M 4:m 5:M 7:M', '9:m 5:M 0:M 7:M'] },
  };
  for (const k in LUMIERE) for (const md in LUMIERE[k]) { COULEURS[k].grilles[md] = LUMIERE[k][md]; if (!COULEURS[k].modes.includes(md)) COULEURS[k].modes.push(md); }
  // LES VRAIS INSTRUMENTS DE CHAQUE STYLE (poids ajoutés aux timbres du style ; kit : probabilité qu'une partie prenne le vrai)
  const VRAIS_STYLE = {
    neon: { keys: { '@piano': 1.5, '@harpe': 1 }, lead: { '@violonSolo': 1, '@trompette': .8 }, pluck: { '@harpe': 1.2, '@glock': 1, '@marimba': .6 }, contre: { '@violonSolo': .8, '@cor': 1 }, pad: { '@violons': 1.2 }, cordes: { '@cordes': 1.5 }, kit: { crash: .5, riser: .4 } },
    velours: { keys: { '@piano': 2 }, lead: { '@trompetteSourd': 1.5, '@clarinette': 1, '@flute': .8 }, pluck: { '@violonsPizz': 1, '@harpe': 1 }, contre: { '@flute': 1.5, '@clarinette': 1 }, cordes: { '@cordes': 1.5 }, kit: { perc: .6, crash: .3 }, retouche: { lofi: 1, aucune: 2 } },
    luxe: { keys: { '@piano': 2, '@harpe': 2 }, lead: { '@flute': 3, '@violonSolo': 1.5 }, pluck: { '@glock': 2, '@harpe': 1, '@xylo': 1 }, contre: { '@violonSolo': 1.2, '@flute': 1 }, pad: { '@violons': 1 }, cordes: { '@cordes': 2 }, kit: { hat: .2, riser: .3 } },
    drift: { keys: { '@piano': 1.5 }, pluck: { '@celliPizz': .8 }, contre: { '@violonSolo': .6 }, kit: { snare: .2 }, retouche: { sombre: 1, sature: 1, aucune: 1 } },
    touge: { keys: { '@piano': 2 }, lead: { '@trompette': 1, '@violonSolo': 1 }, cuivres: { '@cuivres': 2 }, cordes: { '@cordes': 1.5 }, kit: { crash: .4 } },
    dnb: { keys: { '@piano': 2, '@harpe': 1 }, lead: { '@flute': 2, '@violonSolo': 1.5, '@clarinette': 1 }, contre: { '@violonSolo': 1.2, '@cor': .8 }, pad: { '@violons': 1.5 }, cordes: { '@cordes': 2 }, kit: { snare: .55, crash: .4, riser: .3 } },
    disco: { keys: { '@piano': 1.5 }, lead: { '@trompette': 1.5, '@flute': 1 }, cordes: { '@cordes': 3 }, cuivres: { '@cuivres': 3 }, contre: { '@flute': 1 }, kit: { perc: .8, hat: .2, crash: .4 } },
    garage: { keys: { '@piano': 1, '@marimba': 1 }, lead: { '@flute': 1, '@clarinette': .8 }, pluck: { '@marimba': 1.5 }, kit: { perc: .4 }, retouche: { lofi: 1, aucune: 2 } },
    lofi: { keys: { '@piano': 3, '@harpe': 1 }, lead: { '@clarinette': 2, '@flute': 2, '@trompetteSourd': 2 }, basse: { '@contrebasse': 2 }, contre: { '@flute': 1, '@cor': 1 }, kit: { snare: .5, kick: .3, hat: .5, perc: .3 }, retouche: { lofi: 3, aucune: 1 } },
    rock: { lead: { '@trompette': .5 }, kit: { snare: .7, toms: .7, crash: .7 } },
    pixel: { pluck: { '@xylo': .5 } },
    epique: { keys: { '@piano': 2, '@harpe': 3 }, lead: { '@trompette': 3, '@cor': 2, '@violonSolo': 2, '@flute': 1 }, pluck: { '@violonsPizz': 2, '@celliPizz': 1.5, '@marimba': 1, '@harpe': 1 }, contre: { '@cor': 2, '@violonSolo': 1.5, '@hautbois': 1 },
      pad: { '@violons': 2, '@cor': 1.5 }, cordes: { '@cordes': 4 }, cuivres: { '@cuivres': 4 }, basse: { '@celliPizz': 1, '@contrebasse': 1, '@tuba': .8 }, kit: { kick: .5, snare: .7, toms: .9, crash: .8, riser: .7 } },
    dembow: { keys: { '@piano': 1, '@marimba': 1.5 }, lead: { '@marimba': 2, '@flute': 1 }, pluck: { '@marimba': 1.5, '@xylo': 1 }, kit: { perc: .8 } },
    zef: { keys: { '@piano': 1 }, lead: { '@violonSolo': .8 }, pad: { '@violons': 1 }, retouche: { radio: 1, sature: 1, aucune: 1 } },
    stade: { lead: { '@trompette': 1.5 }, pluck: { '@xylo': 1, '@glock': .6 }, kit: { snare: .7, toms: .8, crash: .7 } },
    dubmelo: { keys: { '@pianoQueue': 2, '@piano': 1 }, cordes: { '@cordes': 1.5 }, pad: { '@violons': .8 }, kit: { snare: .3, clap: .4, hat: .3, crash: .5, riser: .4 } },
    riddim: { kit: { clap: .4, hat: .3 } }, brostep: { keys: { '@pianoQueue': 1 }, kit: { snare: .3, clap: .3, crash: .5 } },
    dubuk: { keys: { '@pianoFM': 1, '@vibraphone': .8 }, lead: { '@saxo': 1, '@trompetteSourd': .8 }, kit: { perc: .4, hat: .4 } },
    chillstep: { keys: { '@pianoQueue': 2.5, '@harpe': 1 }, cordes: { '@cordes': 1.5 }, pad: { '@violons': 1 }, lead: { '@violonSolo': .6 }, kit: { hat: .5, snare: .3, riser: .4 } },
    colorbass: { pluck: { '@marimba': .6, '@kalimba': .6 }, kit: { clap: .5, hat: .3 } },
  };
  // LA 2e BANQUE (VCSL, v3.8) : ce que chaque style y prend en plus (et la vraie batterie : charleys, claps, caisses claires…)
  const VRAIS_PLUS = {
    neon: { keys: { '@pianoFM': 1.5, '@clavisynth': .8 }, lead: { '@saxo': 1 }, pluck: { '@vibraphone': .6 }, kit: { hat: .3, clap: .3 } },
    velours: { keys: { '@pianoFM': 1.5, '@vibraphone': 1 }, lead: { '@saxo': 1.5, '@harmonica': .6 }, kit: { perc: .6, clap: .5, hat: .5 } },
    luxe: { keys: { '@pianoQueue': 1.5, '@vibraphone': 1 }, lead: { '@saxo': 1.5, '@verres': 1, '@ocarina': 1 }, pluck: { '@kalimba': 1.5, '@carillonMain': 1 }, kit: { clap: .6, hat: .3 } },
    drift: { keys: { '@pianoQueue': 1 }, pluck: { '@kalimba': .5 }, kit: { clap: .4 } },
    touge: { keys: { '@pianoFM': 1.5, '@pianoQueue': 1 }, lead: { '@saxo': 1.5 }, kit: { hat: .4, clap: .3 } },
    dnb: { keys: { '@pianoQueue': 1.5, '@vibraphone': 1.5, '@pianoFM': 1 }, lead: { '@saxo': 1, '@ocarina': .8 }, pluck: { '@vibraphone': 1, '@kalimba': .8 }, kit: { hat: .4 } },
    disco: { keys: { '@pianoQueue': 1, '@clavisynth': 1.5, '@pianoFM': 1 }, lead: { '@saxo': 2 }, kit: { hat: .5, clap: .6 } },
    garage: { keys: { '@pianoFM': 1.5, '@vibraphone': 1 }, lead: { '@saxo': .8 }, pluck: { '@vibraphone': 1, '@kalimba': 1 }, kit: { clap: .7, hat: .5 } },
    lofi: { keys: { '@pianoQueue': 2, '@vibraphone': 1.5, '@pianoFM': 1.5 }, lead: { '@saxo': 2, '@harmonica': 1, '@ocarina': 1 }, pluck: { '@kalimba': 1.5, '@vibraphone': 1 }, kit: { hat: .6, clap: .3 } },
    rock: { lead: { '@harmonica': .8 }, kit: { hat: .7, kick: .4 } },
    epique: { keys: { '@clavecin': 1.5, '@pianoQueue': 1 }, lead: { '@ocarina': 1, '@flutebec': .6 }, pluck: { '@clavecin': 1 } },
    dembow: { keys: { '@pianoQueue': .6 }, lead: { '@ocarina': 1, '@flutebec': .8, '@kalimba': 1.5 }, pluck: { '@balafon': 2, '@kalimba': 2, '@mbira': 1.5 }, kit: { clap: .6 } },
    zef: { keys: { '@clavecin': 1, '@pianoQueue': .8 }, lead: { '@flutebec': .8 }, kit: { clap: .6 } },
    stade: { keys: { '@pianoQueue': .8 }, lead: { '@harmonica': 1.5, '@saxo': .8 }, pluck: { '@strumstick': 2 }, kit: { hat: .6, clap: .6 } },
  };
  for (const k in VRAIS_PLUS) for (const r in VRAIS_PLUS[k]) VRAIS_STYLE[k][r] = Object.assign({}, VRAIS_STYLE[k][r] || {}, VRAIS_PLUS[k][r]);
  for (const k in VRAIS_STYLE) for (const r of ['lead', 'contre']) if (VRAIS_STYLE[k][r]) ['@flute', '@flutebec', '@ocarina', '@verres'].forEach(x => delete VRAIS_STYLE[k][r][x]);   // (v3.11 : sans flûte ni aigu)
  // LES TRANSFORMEURS (v3.8) : ce que chaque style passe sur son clavier, sa nappe, sa mélodie (« aucun » reste possible)
  const TRANSF_STYLE = {
    neon: { keys: { chorus: 2, phaser: 1 }, lead: { chorus: 1, octave: .5 }, pad: { chorus: 1.5, phaser: 1 } }, velours: { keys: { phaser: 2, trem: 1.5, chorus: 1 }, pad: { reverse: 1, phaser: 1 }, lead: { tape: .8 } },
    luxe: { keys: { trem: 1.5, chorus: 1 }, lead: { tape: 1 }, pad: { chorus: 1 } }, drift: { lead: { crush: 1, tape: 1 }, keys: { tape: 1 } }, touge: { lead: { chorus: 1, octave: 1 }, keys: { chorus: 1 } },
    dnb: { keys: { chorus: 1.5, phaser: 1 }, pad: { chorus: 1, reverse: .6 } }, disco: { keys: { phaser: 2, chorus: 1 }, lead: { chorus: 1 } }, garage: { keys: { trem: 1.5, phaser: 1 }, pad: { reverse: 1 } },
    lofi: { keys: { tape: 2.5, trem: 1, chorus: 1 }, lead: { tape: 2 }, pad: { reverse: 1.5, tape: 1 } }, rock: { lead: { octave: 1, chorus: .5 } }, pixel: { lead: { crush: 1.5 }, keys: { crush: 1.5 } },
    epique: { lead: { octave: .6 }, pad: { chorus: 1 } }, dembow: { keys: { chorus: 1 }, lead: { tape: .8 } }, zef: { lead: { crush: 1, tape: 1 }, keys: { crush: 1, tape: 1 }, pad: { reverse: 1.5 } },
    stade: { keys: { chorus: 1 }, lead: { octave: .6 } }, dubmelo: { pad: { chorus: 1, reverse: 1.2 }, keys: { chorus: 1 } }, riddim: { lead: { crush: 1 } }, brostep: { lead: { crush: .6, octave: .8 } },
    dubuk: { keys: { phaser: 1.5, tape: 1 }, pad: { reverse: .8 } }, chillstep: { keys: { tape: 1.5, chorus: 1 }, pad: { reverse: 1.5 } }, colorbass: { keys: { chorus: 1.2 } } };
  const NOM_TRANSF = { chorus: 'chorus', phaser: 'phaser', trem: 'trémolo', tape: 'bande magnétique', crush: '8 bits', octave: 'octaveur', reverse: 'à l’envers' };
  // LES UNIVERS SONORES (v3.9) : les familles de vrais instruments qui vont ensemble, et ce que chaque style tire
  const FAMILLES = {
    orchestre: ['violons', 'violonSolo', 'celli', 'celliPizz', 'violonsPizz', 'contrebasse', 'trompette', 'cor', 'trombone', 'tuba', 'flute', 'clarinette', 'hautbois', 'basson', 'harpe', 'piano', 'pianoQueue',
      'glock', 'xylo', 'marimba', 'clavecin', 'cordes', 'cuivres', 'verres', 'carillonMain', 'flutebec'],
    jazz: ['saxo', 'trompetteSourd', 'trompette', 'vibraphone', 'contrebasse', 'piano', 'pianoQueue', 'pianoFM', 'clarinette', 'flute', 'cordes', 'cuivres', 'violonsPizz'],
    folk: ['harmonica', 'strumstick', 'ocarina', 'flutebec', 'kalimba', 'mbira', 'balafon', 'marimba', 'xylo', 'harpe', 'piano', 'flute', 'contrebasse', 'glock', 'violonSolo', 'carillonMain'],
    retro: ['pianoFM', 'clavisynth', 'vibraphone', 'saxo', 'trompette', 'cordes', 'cuivres', 'glock', 'piano', 'violonsPizz'] };
  const UNIVERS = {
    neon: { u: { electro: 3, hybride: 2, acoustique: .3 }, f: { retro: 2, orchestre: 1 } }, velours: { u: { hybride: 2.5, electro: 1.5, acoustique: 1 }, f: { jazz: 2, retro: 1.5 } },
    luxe: { u: { hybride: 2.5, acoustique: 1.5, electro: 1 }, f: { orchestre: 1.5, jazz: 1.5 } }, drift: { u: { electro: 3, hybride: 1.5 }, f: { orchestre: 1, retro: 1 } },
    touge: { u: { electro: 2, hybride: 2 }, f: { orchestre: 1, retro: 1.5 } }, dnb: { u: { hybride: 2, acoustique: 1.5, electro: 1.5 }, f: { jazz: 2, orchestre: 1 } },
    disco: { u: { hybride: 2, acoustique: 2 }, f: { jazz: 1.5, retro: 1.5, orchestre: 1 } }, garage: { u: { electro: 2, hybride: 2 }, f: { retro: 2, jazz: 1 } },
    lofi: { u: { acoustique: 2.5, hybride: 2 }, f: { jazz: 2.5, folk: 1.5 } }, rock: { u: { electro: 2.5, hybride: 1 }, f: { folk: 1 } }, pixel: { u: { electro: 1 }, f: { retro: 1 } },
    epique: { u: { acoustique: 3, hybride: 1 }, f: { orchestre: 1 } }, dembow: { u: { hybride: 2, acoustique: 1.5, electro: 1 }, f: { folk: 1 } },
    zef: { u: { electro: 2, hybride: 1.5 }, f: { orchestre: 1 } }, stade: { u: { hybride: 2, electro: 2, acoustique: 1 }, f: { folk: 2, jazz: 1 } },
    dubmelo: { u: { hybride: 2.5, electro: 1.5 }, f: { orchestre: 2, retro: 1 } }, riddim: { u: { electro: 1 }, f: { retro: 1 } }, brostep: { u: { electro: 2.5, hybride: 1 }, f: { orchestre: 1 } },
    dubuk: { u: { electro: 2, hybride: 1.5 }, f: { jazz: 1.5, retro: 1 } }, chillstep: { u: { hybride: 2.5, electro: 1, acoustique: .8 }, f: { orchestre: 2, jazz: 1 } }, colorbass: { u: { electro: 2, hybride: 1 }, f: { folk: 1, retro: 1 } } };
  const NOM_UNIVERS = { electro: 'électronique', hybride: 'hybride', acoustique: 'acoustique' };
  const NOM_VRAI = { saxo: 'le saxophone ténor', harmonica: 'l’harmonica', ocarina: 'l’ocarina', flutebec: 'la flûte à bec', pianoQueue: 'le piano à queue', clavecin: 'le clavecin', pianoFM: 'le piano électrique FM',
    clavisynth: 'le clavisynth', vibraphone: 'le vibraphone', kalimba: 'la vraie kalimba', mbira: 'la mbira', balafon: 'le balafon', carillonMain: 'le carillon à main', verres: 'les verres chantants', strumstick: 'le strumstick', piano: 'le vrai piano', harpe: 'la vraie harpe', violons: 'les violons', violonSolo: 'le violon', celli: 'les violoncelles', celliPizz: 'les violoncelles pincés', violonsPizz: 'les violons pincés',
    contrebasse: 'la contrebasse', trompette: 'la trompette', trompetteSourd: 'la trompette bouchée', cor: 'le cor', trombone: 'le trombone', tuba: 'le tuba', flute: 'la vraie flûte', clarinette: 'la clarinette',
    hautbois: 'le hautbois', basson: 'le basson', glock: 'le glockenspiel', marimba: 'le marimba', xylo: 'le xylophone', cordes: 'les vraies cordes', cuivres: 'les vrais cuivres' };
  const nomV = (x, T9) => typeof x === 'string' && x[0] === '@' ? NOM_VRAI[x.slice(1)] || x.slice(1) : T9[x];
  const NOM_KICK = { sine: 'grosse caisse ronde', 909: 'grosse caisse 909', 808: 'grosse caisse 808', acoustique: 'batterie acoustique', lofi: 'grosse caisse étouffée', chip: 'batterie 8 bits', grave: 'tambour grave', surdo: 'surdos' };
  const NOM_HAT = { metal: 'charleys de métal', bruit: 'charleys de souffle', fm: 'charleys de verre', shaker: 'shaker', chip: 'charleys 8 bits', ganza: 'ganzá' };
  const nomSalle = S => S[0] < 1.1 ? 'salle sèche' : S[0] < 1.7 ? 'petite salle' : S[0] < 2.5 ? 'plaque' : S[0] < 3.6 ? 'grand hall' : 'cathédrale';
  const SIG_POIDS = { neon: { moteur: 3, turbo: 2.5, neon: 2, klaxon: 1, sirene: 1, drift: .8 }, velours: { caisse: 3, pieces: 2, vapeur: 2, klaxon: 1.5, neon: 1 },
    luxe: { pieces: 2.5, caisse: 2, gouttes: 2, sirene: 1.5, vapeur: 1.5, moteur: 1 }, drift: { drift: 3, sirene: 2, moteur: 2, turbo: 1.5, klaxon: 1 },
    touge: { turbo: 3, moteur: 2.5, drift: 2, klaxon: 1.5, sirene: 1 }, dnb: { turbo: 2, gouttes: 2, sirene: 1.5, neon: 1, moteur: 1 },
    disco: { caisse: 3, pieces: 2.5, klaxon: 1.5, vapeur: 1 }, garage: { vapeur: 2.5, gouttes: 2, caisse: 1.5, neon: 1.5 }, lofi: { gouttes: 3, vapeur: 2.5, caisse: 1, pieces: 1 },
    rock: { moteur: 3, turbo: 2, drift: 2, klaxon: 1, sirene: 1 }, pixel: { pieces: 3, caisse: 2, klaxon: 1.5, turbo: 1 }, epique: { sirene: 2.5, moteur: 2, turbo: 1.5, caisse: 1 },
    dembow: { pieces: 2.5, klaxon: 2, caisse: 1.5, gouttes: 1.5, sirene: 1 }, zef: { sirene: 2.5, neon: 2, moteur: 1.5, klaxon: 1, drift: 1 }, stade: { klaxon: 2, moteur: 2, turbo: 1.5, sirene: 1, caisse: 1 },
    dubmelo: { gouttes: 2, vapeur: 2, sirene: 1, neon: 1 }, riddim: { moteur: 2.5, turbo: 2, sirene: 2, neon: 1.5 }, brostep: { moteur: 3, turbo: 2.5, sirene: 1.5, drift: 1.5 },
    dubuk: { sirene: 2.5, neon: 2, vapeur: 1.5, klaxon: 1 }, chillstep: { gouttes: 3, vapeur: 2, neon: 1 }, colorbass: { pieces: 2.5, caisse: 2, turbo: 1.5, neon: 1 } };
  // ================================================================ v5.0 — LE GÉNÉRATEUR HYBRIDE : L'ATLAS DE LA MUSIQUE (du populaire au souterrain)
  // Léo (14/10) : « apprends les instruments de base… et la technique de la retouche ; révise pour pouvoir tout fabriquer, tout style ;
  // comprends la base de la culture musicale humaine, du populaire à l'underground ; l'idée : un générateur HYBRIDE ».
  // Une musique populaire se décompose en six couches qu'on sait nommer et mesurer — c'est ce que l'atlas écrit pour chaque genre :
  //   1. LE RYTHME (RYT) : où tombent grosse caisse, caisse claire, charleys, percussions sur 16 pas (backbeat, quatre au sol, demi-temps,
  //      breakbeat, clave, tresillo, one drop, galop…) + le swing (les doubles croches paires retardées) ;
  //   2. L'HARMONIE : le mode (majeur, mineur, dorien, mixolydien, phrygien = « sombre », lydien) et les grilles typiques du genre
  //      (I–V–vi–IV de la pop, ii–V–I du jazz, cadence andalouse, quinte à vide du rock, vamp d'un accord du funk et de l'afrobeat…) ;
  //   3. LA BASSE (BAS) : son rôle — tenue, croches, walking, tumbao anticipé, octaves disco, contretemps house, log drum, 808 qui glisse ;
  //   4. L'ACCOMPAGNEMENT (COMP) : comment les accords sont joués — skank sur 2 et 4, montuno, bossa, charleston, accords plaqués, hachés ;
  //   5. LES INSTRUMENTS : clavier, mélodie, nappe, basse, contre-chant, vrais instruments (VSCO-2, VCSL) et leur univers (électro, hybride,
  //      acoustique : une famille) ;
  //   6. LA RETOUCHE (la production) : la grosse caisse et le charley (kickT, hatT), la SALLE (pièce, hall, plaque, RESSORT du dub et du surf,
  //      RÉVERBE COUPÉE des années 80), l'écho (en doubles croches, retour), la saturation, la BANDE (l'écho qui sature et pleure), le
  //      PLEURAGE lo-fi, la pompe (sidechain).
  // L'HYBRIDE : une musique = le CORPS d'un genre (son rythme, son tempo, sa basse, sa forme, l'ordre où les choses entrent) × l'ÂME d'un
  // autre (ses accords, ses instruments, ses mélodies) ; la retouche vient de l'un OU de l'autre (jamais un mélange : un disque a UNE
  // production). L'histoire de la musique est faite de ces croisements (le dub × le hip-hop = le trip-hop, la house × le kwaito × le jazz
  // = l'amapiano, le reggae × le breakbeat = la jungle…). Une partie sur cinq reste un genre PUR.
  const RYT = {
    backbeat: { kick: ['X.......X.X.....', 'X.....x.X.......', 'X.......X...x...'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.xxx.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..............x.'], fant: ['.......o......o.'] },
    rock: { kick: ['X.......X.......', 'X.....X.X.......', 'X.X.....X.X.....'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['x...............'], fant: ['...........o....'], tribu: ['........L.L.HHLL'] },
    punk: { kick: ['X...X...X...X...', 'X.X.X.X.X.X.X.X.'], snare: ['....X.......X...', '..X...X...X...X.'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['x.......x.......'] },
    metal: { kick: ['X.x.X.x.X.x.X.x.', 'XxXxXxXxXxXxXxXx', 'X.X.....X.X.X...'], snare: ['....X.......X...', '........X.......'], hat: ['x...x...x...x...', 'x.x.x.x.x.x.x.x.'], hatD: 'x.x.x.x.x.x.x.x.', hatO: ['x...............'] },
    reve: { kick: ['X.......X.......', 'X.....x...X.....'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.', 'x...x...x...x...'], hatD: 'x.x.x.x.x.x.x.x.', hatO: ['..x...x...x...x.'] },
    surf: { kick: ['X.......X.......', 'X...X...X...X...'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', tribu: ['L.L.LL.LL.L.LL.L'] },
    funk: { kick: ['X.........X..x..', 'X..x......X.....', 'X.....x...X..x..'], snare: ['....X.......X...', '....X..o....X.o.'], hat: ['xoxoxoxoxoxoxoxo', 'xxxxxxxxxxxxxxxx'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['......x.........', '......x.......x.'], fant: ['.......o.o.....o'] },
    motown: { kick: ['X...X...X...X...', 'X.......X.x.....'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', perc: ['....x.......x...', '....x..x....x..x'], fant: ['...........o....'] },
    dilla: { kick: ['X.....x...X..x..', 'X......x..X.....', 'X.........X.x...'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.', 'x.xx..x.x.xx..x.'], hatD: 'x.xxx.xxx.xxx.xx', hatO: ['..............x.'], fant: ['...o.......o....'] },
    bossa: { kick: ['X..xX...X..xX...'], snare: ['X..X..X...X..X..', '..X..X...X..X...'], hat: ['xxxxxxxxxxxxxxxx'], hatD: 'xxxxxxxxxxxxxxxx', perc: ['oxoxoxoxoxoxoxox'], hatO: ['................'] },
    swing: { kick: ['o...o...o...o...'], snare: ['................', '......o.......o.'], hat: ['x...x..xx...x..x'], hatD: 'x..xx..xx..xx..x', hatO: ['....x.......x...'], fant: ['..o.......o.....', '......o....o....'] },
    salsa: { kick: ['o.......o.......'], snare: ['X..X..X.....X.X.'], hat: ['x.xx.x.xx.x.x.xx'], hatD: 'xxxxxxxxxxxxxxxx', perc: ['....H.....LL....', '..H.H.L.L.H.LL..'] },
    cumbia: { kick: ['X.......X.......'], snare: ['......x.......x.'], hat: ['x.x.x.x.x.x.x.x.'], perc: ['x.xxx.xxx.xxx.xx'], hatD: 'xxxxxxxxxxxxxxxx' },
    habanera: { kick: ['X...X...X...X...', 'X..xX...X..xX...'], snare: ['....X.......X...', '....X.......X..x'], hat: ['..x...x...x...x.'], hatD: 'xxxxxxxxxxxxxxxx', perc: ['x..x....x..x....'] },
    onedrop: { kick: ['........X.......'], snare: ['........X.......'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.xxx.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..............x.'], fant: ['...........o..o.'] },
    steppers: { kick: ['X...X...X...X...'], snare: ['........X.......'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..x...x...x...x.'] },
    afrobeat: { kick: ['X.....x...X.x...', 'X..x....X.....x.'], snare: ['....x..x....x...', '....X.......X..x'], hat: ['xxxxxxxxxxxxxxxx', 'xoxoxoxoxoxoxoxo'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..x...x...x...x.'], perc: ['x.xxx.xxx.xxx.xx'] },
    afropop: { kick: ['X..x..x.X..x..x.', 'X..x..x.X.......'], snare: ['....X.......X...', '...x..x....x..x.'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', perc: ['xxxxxxxxxxxxxxxx', 'x.xxx.xxx.xxx.xx'], hatO: ['..............x.'] },
    amapiano: { kick: ['X...X...X...X...', 'X.......X.......'], snare: ['..x...x...x..x..', '....x.......x...'], hat: ['..x...x...x...x.'], hatD: 'xxxxxxxxxxxxxxxx', perc: ['xxxxxxxxxxxxxxxx'], hatO: ['..x...x...x...x.'] },
    quatre: { kick: ['X...X...X...X...'], snare: ['....X.......X...'], hat: ['..x...x...x...x.', 'x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..x...x...x...x.'], perc: ['oxoxoxoxoxoxoxox'] },
    techno: { kick: ['X...X...X...X...'], snare: ['....x.......x...', '............X...'], hat: ['xoxoxoxoxoxoxoxo', 'x.xxx.xxx.xxx.xx'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..x...x...x...x.'], perc: ['..o...o...o..o..'] },
    trance: { kick: ['X...X...X...X...'], snare: ['....X.......X...'], hat: ['..x...x...x...x.', 'xxxxxxxxxxxxxxxx'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..x...x...x...x.'] },
    breakbeat: { kick: ['X.X.......XX....', 'X.X.......X.....', 'X.........X.....'], snare: ['....X..x.x..X..x', '....X......xX...', '....X.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..............x.'], fant: ['.......o.o.....o'] },
    footwork: { kick: ['X..X..X...X..X..', 'X..X..X.X..X..X.'], snare: ['....x.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'x.xxx.xxx.xxx.xx', perc: ['..x..x....x..x..'] },
    jersey: { kick: ['X..X..X.X..X..X.', 'X...X.X...X.XX..'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx' },
    boombap: { kick: ['X.........X..x..', 'X......x..X.....', 'X..x......X.....'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'x.xxx.xxx.xxx.xx', hatO: ['..............x.'], fant: ['...........o....'] },
    drill: { kick: ['X.........x.....', 'X......x...x....'], snare: ['........X.......', '........X......x'], hat: ['x.x.xx.x.x.x.xx.', 'x.x.x.x.x.xxx.x.'], hatD: 'xxxxxxxxxxxxxxxx' },
    lent: { kick: ['X.......X.......', 'X.........X.....'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'x.xxx.xxx.xxx.xx', hatO: ['......x.......x.'] },
    ambiant: { kick: ['X...............', 'X.......X.......'], snare: ['............x...'], hat: ['x...x...x...x...'], hatD: 'x.x.x.x.x.x.x.x.', perc: ['o.o.o.o.o.o.o.o.'] },
    train: { kick: ['X.......X.......'], snare: ['o.o.X.o.o.o.X.o.'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx' },
    rumba: { kick: ['X..x....X..x....'], snare: ['...x..x....x..x.'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', perc: ['H..L..H.H..L..H.'] },
    oompah: { kick: ['X.......X.......'], snare: ['....X.......X...', '..X...X...X...X.'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx' },
    galop: { kick: ['X.......X.......'], snare: ['............X...'], hat: ['x.xxx.xxx.xxx.xx'], hatD: 'xxxxxxxxxxxxxxxx', tribu: ['L.LLL.LLL.LLL.LL'] } };
  // la basse : [pas, intervalle (0 · 7 · 12 · 't' = la tierce), durée] — deux variantes, la 2e (la plus active) attend sa marche (i_basse)
  const BAS = {
    tenue: [[[0, 0, 16]], [[0, 0, 8], [8, 7, 8]]],
    pop: [[[0, 0, 6], [6, 0, 2], [8, 0, 4], [12, 7, 2], [14, 0, 2]], [[0, 0, 3], [3, 0, 3], [6, 0, 2], [8, 0, 3], [11, 0, 3], [14, 7, 2]]],
    croches: [[[0, 0, 2], [2, 0, 2], [4, 0, 2], [6, 0, 2], [8, 0, 2], [10, 0, 2], [12, 0, 2], [14, 0, 2]], [[0, 0, 2], [2, 0, 2], [4, 0, 2], [6, 12, 2], [8, 0, 2], [10, 0, 2], [12, 7, 2], [14, 12, 2]]],
    chug: [[[0, 0, 1], [1, 0, 1], [2, 0, 1], [4, 0, 1], [5, 0, 1], [6, 0, 1], [8, 0, 1], [9, 0, 1], [10, 0, 1], [12, 0, 2], [14, 0, 2]], Array.from({ length: 16 }, (_, k) => [k, 0, 1])],
    funk: [[[0, 0, 1], [3, 12, 1], [4, 0, 1], [7, 0, 1], [10, 7, 1], [11, 12, 1], [14, 0, 1]], [[0, 0, 1], [2, 12, 1], [3, 0, 1], [6, 0, 1], [7, 12, 1], [10, 7, 1], [11, 0, 1], [13, 12, 1], [14, 0, 1]]],
    motown: [[[0, 0, 3], [3, 0, 1], [4, 7, 2], [6, 12, 2], [8, 0, 3], [11, 0, 1], [12, 7, 2], [14, 't', 2]], [[0, 0, 2], [2, 12, 1], [3, 0, 1], [4, 7, 2], [6, 12, 2], [8, 0, 2], [10, 't', 1], [11, 7, 1], [12, 12, 2], [14, 7, 2]]],
    walking: [[[0, 0, 4], [4, 't', 4], [8, 7, 4], [12, 12, 4]], [[0, 0, 4], [4, 7, 4], [8, 12, 4], [12, 't', 4]]],
    bossa: [[[0, 0, 6], [6, 7, 2], [8, 7, 6], [14, 0, 2]], [[0, 0, 3], [3, 7, 1], [6, 7, 2], [8, 7, 3], [11, 0, 1], [14, 0, 2]]],
    tumbao: [[[6, 0, 6], [12, 7, 4]], [[3, 7, 3], [6, 0, 6], [12, 7, 2], [14, 12, 2]]],
    cumbia: [[[0, 0, 3], [6, 7, 2], [8, 0, 3], [14, 7, 2]], [[0, 0, 2], [4, 7, 2], [6, 12, 2], [8, 0, 2], [12, 7, 2], [14, 12, 2]]],
    habanera: [[[0, 0, 3], [3, 0, 1], [4, 7, 2], [6, 12, 2], [8, 0, 3], [11, 0, 1], [12, 7, 2], [14, 12, 2]], [[0, 0, 3], [3, 0, 1], [4, 7, 2], [6, 12, 1], [7, 7, 1], [8, 0, 3], [11, 0, 1], [12, 7, 2], [14, 't', 2]]],
    reggae: [[[0, 0, 3], [4, 0, 1], [6, 7, 2], [10, 12, 2], [12, 7, 2], [14, 0, 2]], [[0, 0, 2], [3, 0, 1], [4, 't', 2], [6, 7, 2], [8, 12, 2], [10, 7, 1], [11, 't', 1], [12, 0, 3]]],
    dub: [[[0, 0, 6], [8, 7, 3], [12, 0, 4]], [[0, 0, 4], [6, 0, 2], [8, 7, 3], [11, 12, 1], [12, 0, 4]]],
    afrobeat: [[[0, 0, 2], [3, 0, 1], [6, 12, 2], [8, 7, 2], [11, 0, 1], [14, 't', 2]], [[0, 0, 1], [2, 12, 1], [3, 0, 1], [6, 12, 2], [8, 7, 1], [10, 0, 1], [11, 12, 1], [13, 7, 1], [14, 't', 2]]],
    tresillo: [[[0, 0, 3], [3, 0, 3], [6, 0, 2], [8, 0, 3], [11, 0, 3], [14, 0, 2]], [[0, 0, 3], [3, 7, 3], [6, 12, 2], [8, 0, 3], [11, 7, 3], [14, 12, 2]]],
    log: [[[0, 0, 2], [6, 0, 2], [7, 12, 1], [10, 0, 2], [14, 7, 2]], [[0, 0, 2], [3, 12, 1], [6, 0, 2], [7, 12, 1], [10, 0, 2], [12, 7, 1], [14, 12, 2]]],
    contretemps: [[[2, 0, 2], [6, 0, 2], [10, 0, 2], [14, 0, 2]], [[2, 0, 2], [6, 12, 2], [10, 0, 2], [13, 7, 1], [14, 12, 2]]],
    roule: [[[2, 0, 1], [3, 0, 1], [6, 0, 1], [7, 0, 1], [10, 0, 1], [11, 0, 1], [14, 0, 1], [15, 0, 1]], [[1, 0, 1], [2, 0, 1], [3, 0, 1], [5, 0, 1], [6, 0, 1], [7, 0, 1], [9, 0, 1], [10, 0, 1], [11, 0, 1], [13, 0, 1], [14, 0, 1], [15, 0, 1]]],
    trance: [[[2, 0, 2], [6, 0, 2], [10, 0, 2], [14, 0, 2]], [[1, 0, 1], [2, 0, 1], [3, 0, 1], [5, 0, 1], [6, 0, 1], [7, 0, 1], [9, 0, 1], [10, 0, 1], [11, 0, 1], [13, 0, 1], [14, 0, 1], [15, 0, 1]]],
    reese: [[[0, 0, 8], [10, 0, 6]], [[0, 0, 6], [6, 7, 2], [10, 0, 4], [14, 12, 2]]],
    glisse: [[[0, 0, 6], [10, 0, 4], [14, 7, 2]], [[0, 0, 4], [6, 0, 2], [10, 7, 4], [14, 12, 2]]],
    oompah: [[[0, 0, 2], [8, 7, 2]], [[0, 0, 2], [4, 7, 2], [8, 0, 2], [12, 7, 2]]],
    boom: [[[0, 0, 4], [8, 7, 4]], [[0, 0, 3], [4, 7, 2], [8, 0, 3], [12, 7, 2], [14, 't', 2]]],
    galop: [[[0, 0, 2], [3, 0, 1], [4, 0, 2], [7, 0, 1], [8, 7, 2], [11, 7, 1], [12, 0, 2], [15, 0, 1]], [[0, 0, 2], [3, 0, 1], [4, 7, 2], [7, 7, 1], [8, 12, 2], [11, 7, 1], [12, 0, 2], [15, 7, 1]]] };
  // l'accompagnement : [pas, durée] — la dernière variante est la plus active (i_keys)
  const COMP = {
    tenue: [[[0, 16]], [[0, 8], [8, 8]]],
    blanches: [[[0, 8], [8, 8]], [[0, 6], [6, 2], [8, 6], [14, 2]]],
    croches: [[[0, 2], [2, 2], [4, 2], [6, 2], [8, 2], [10, 2], [12, 2], [14, 2]], [[0, 1], [2, 1], [3, 1], [4, 2], [6, 1], [8, 1], [10, 1], [11, 1], [12, 2], [14, 1]]],
    power: [[[0, 6], [6, 2], [8, 6], [14, 2]], [[0, 2], [2, 2], [4, 2], [6, 2], [8, 2], [10, 2], [12, 2], [14, 2]]],
    skank: [[[4, 1], [12, 1]], [[2, 1], [6, 1], [10, 1], [14, 1]]],
    bossa: [[[0, 2], [3, 2], [6, 2], [10, 2], [12, 2]], [[0, 1], [3, 1], [6, 2], [8, 1], [10, 1], [13, 2]]],
    montuno: [[[0, 1], [2, 1], [3, 1], [5, 1], [6, 1], [8, 1], [10, 1], [11, 1], [13, 1], [14, 1]], [[0, 1], [2, 1], [3, 1], [5, 1], [6, 1], [7, 1], [8, 1], [10, 1], [11, 1], [13, 1], [14, 1], [15, 1]]],
    funk: [[[0, 1], [3, 1], [6, 1], [7, 1], [10, 1], [12, 1], [14, 1]], [[0, 1], [2, 1], [3, 1], [5, 1], [6, 1], [7, 1], [10, 1], [11, 1], [12, 1], [14, 1], [15, 1]]],
    charleston: [[[0, 2], [6, 2]], [[2, 1], [8, 2], [14, 1]], [[0, 2], [6, 2], [10, 1], [14, 2]]],
    offbeat: [[[2, 1], [6, 1], [10, 1], [14, 1]], [[2, 1], [5, 1], [6, 1], [10, 1], [13, 1], [14, 1]]],
    ama: [[[0, 4], [6, 2], [10, 4]], [[0, 3], [3, 2], [6, 2], [10, 3], [14, 2]]],
    ballade: [[[0, 6], [6, 2], [8, 6], [14, 2]], [[0, 3], [3, 3], [6, 2], [8, 3], [11, 3], [14, 2]]],
    rumba: [[[0, 1], [2, 1], [3, 1], [6, 1], [8, 1], [10, 1], [11, 1], [14, 1]], [[0, 1], [1, 1], [2, 1], [3, 1], [6, 1], [8, 1], [9, 1], [10, 1], [11, 1], [14, 1]]],
    oompah: [[[4, 2], [12, 2]], [[2, 1], [6, 1], [10, 1], [14, 1]]],
    hache: [[[0, 1], [3, 1], [6, 1], [8, 1], [11, 1], [14, 1]], [[0, 1], [2, 1], [3, 1], [6, 1], [8, 1], [10, 1], [11, 1], [14, 1]]] };
  // la batterie synthétisée (la grosse caisse : attaque, chute, durée, clic, drive ; les caisses claires du genre)
  const KITS = {
    acoustique: { f0: [110, 140], f1: [52, 60], dec: [.28, .38], clic: [.2, .3], drive: [1.1, 1.5], snare: ['acoustique', 'grosse'] },
    rock: { f0: [120, 150], f1: [50, 56], dec: [.3, .4], clic: [.22, .32], drive: [1.4, 2], snare: ['acoustique', 'grosse'] },
    club: { f0: [150, 175], f1: [44, 50], dec: [.35, .5], clic: [.12, .2], drive: [1.3, 1.8], snare: ['clap', 'grosse'] },
    hiphop: { f0: [130, 160], f1: [42, 48], dec: [.45, .7], clic: [.08, .15], drive: [1.4, 2], snare: ['grosse', 'clap', 'rim'] },
    doux: { f0: [110, 140], f1: [52, 60], dec: [.2, .3], clic: [.1, .18], drive: [1, 1.2], snare: ['rim', 'acoustique'] },
    latin: { f0: [120, 150], f1: [50, 56], dec: [.22, .32], clic: [.12, .2], drive: [1, 1.3], snare: ['rim', 'clap'] } };
  const TRANS_D = { roll: 2, toms: 1.5, souffle: 1.5, trou: 1, filtre: 1.5, begaie: .8, rien: 2.5, run: 1 };
  // L'ÉCHELLE d'un genre de l'atlas : l'ouverture, le cœur (batterie, basse, mélodie, accords), puis ses couleurs à lui entre les marches
  // d'intensité — la grande montée (les grands moments sont posés ensuite par ordreDe : grosse caisse, clarté, double, modulation, final)
  const ECH_T = ['E', 'i_filtre', 'E', 'clarte', 'E', 'i_frappe', 'E', 'i_dense', 'E', 'i_relance', 'double', 'E', 'i_basse', 'i_tambours', 'E', 'i_sature', 'i_pulse', 'E', 'i_monte', 'modul', 'E', 'i_large'];
  const ECH_REMPL = ['fant', 'hatO', 'perc', 'contre', 'octave', 'harmo', 'cordes', 'arp', 'i_basseOct', 'ride', 'choeur', 'echo', 'i_keys', 'roll'];
  function echelle(o) {
    const L = [], ajoute = id => { if (id && !L.includes(id) && L.length < 29) { L.push(id); return true; } return false; };
    o.ouv[0].forEach(ajoute);
    const file = (o.coeur || ['hat', 'snare', 'kick', 'basse', 'lead', 'keys', 'pad']).concat(o.el || [], ECH_REMPL).filter(x => !L.includes(x));
    const tire = () => { while (file.length) { const x = file.shift(); if (!L.includes(x)) return x; } return null; };
    for (let k = 0; k < 5; k++) ajoute(tire());
    ECH_T.forEach(x => { if (x === 'E') { ajoute(tire()); } else ajoute(x); });
    while (L.length < 29) { const x = tire(); if (!x) break; ajoute(x); }
    return [L[0] + '!'].concat(L.slice(1)).concat(['final!']); }
  const FAMG = { neon: 'retro', velours: 'club', luxe: 'hiphop', drift: 'hiphop', touge: 'club', dnb: 'bass', disco: 'soul', garage: 'club', lofi: 'hiphop', rock: 'rock', pixel: 'retro',
    epique: 'cinema', dembow: 'caraibes', zef: 'hiphop', stade: 'rock', dubmelo: 'bass', riddim: 'bass', brostep: 'bass', dubuk: 'bass', chillstep: 'bass', colorbass: 'bass' };
  const OUVRE = ['keys', 'pad', 'arp', 'lead', 'choeur', 'stab', 'cordes', 'hat', 'perc', 'tribu', 'snare', 'contre', 'toms'];
  function ouvSain(t3, pool) {   // (salle : TECHNO × AMAPIANO ouvrait sur la grosse caisse → +8 dB de montée ; VAPEUR × LO-FI sur le vinyle seul → +51 dB)
    let v = t3.map(x => ['kick', 'basse', 'sub', 'wob', 'growl'].includes(x) ? null : x); const libres = pool.filter(x => OUVRE.includes(x) && !v.includes(x)); v = v.map(x => x || libres.shift());
    const k = v.findIndex(x => OUVRE.includes(x)); if (k > 0) { const [y] = v.splice(k, 1); v.unshift(y); }
    return v.every(Boolean) && new Set(v).size === 3 ? v : t3; }
  function genre(id, o) {   // un genre de l'atlas → une couleur du générateur (le même format que les styles écrits à la main)
    o.ouv = o.ouv.map(t3 => ouvSain(t3, (o.el || []).concat(['hat', 'perc', 'keys', 'pad', 'arp', 'snare'])));
    const P = Object.assign({}, RYT[o.ryt], o.pat || {}); P.basse = BAS[o.bas]; P.keys = COMP[o.comp]; if (o.stab) P.stab = COMP[o.stab]; if (o.arp) P.arp = o.arp; if (o.cuiv) P.cuiv = o.cuiv; if (o.chop) P.chop = o.chop;
    const pr = o.prod, grilles = {}; o.modes.forEach(md => grilles[md] = o.prog[md]);
    COULEURS[id] = { nom: o.nom, dit: o.dit, fam: o.fam, bpm: o.bpm, monte: o.monte || [5, 9], modes: o.modes.slice(), swing: o.swing || 0, reg: (o.reg || 69) - 5, cap: Math.min(o.cap || 84, 82), pompe: o.pompe || .2, ferme: o.ferme || 3600,
      grilles, keysT: o.keys, leadT: o.lead, padT: o.pad, basseT: o.basse, contreT: o.contre, pluckT: o.pluck, trans: o.trans || TRANS_D, cells: o.cells || [2, 2, 3, 4, 4, 6], fill: o.fill || ['roll', 'toms'],
      phrases: o.phrases || { classique: 2, appel: 1.5, riff: 1, longues: 1 }, kit: KITS[o.kit], pat: P, ouv: o.ouv, ordre: echelle(o),
      kickT: pr.kickT, hatT: pr.hatT, salle: pr.salle, revB: pr.revB, dly: pr.dly, fb: pr.fb, sat: pr.sat, lofi: pr.lofi || 0, bande: pr.bande || 0, gate: pr.gate || 0 };
    VRAIS_STYLE[id] = o.vrais || {}; UNIVERS[id] = o.univers || { u: { electro: 1 }, f: { retro: 1 } }; TRANSF_STYLE[id] = o.transf || {}; SIG_POIDS[id] = o.sig || { moteur: 1, neon: 1, turbo: 1 }; FAMG[id] = o.fam; }
  const ATLAS = {
    // ---- POP / ROCK
    pop: { nom: 'POP', dit: 'pop moderne', fam: 'pop', bpm: [100, 116], modes: ['majeur', 'mineur'], ryt: 'backbeat', bas: 'pop', comp: 'ballade', kit: 'club',
      prog: { majeur: ['0:M 7:M 9:m 5:M', '9:m 5:M 0:M 7:M', '0:M 9:m 5:M 7:M', '5:M 0:M 7:M 9:m'], mineur: ['0:m 8:M 3:M 10:M', '8:M 3:M 10:M 0:m', '0:m 5:m 8:M 10:M'] },
      keys: ['piano', 'guitareC', 'wurli'], lead: { carre: 1, cuivre: 1, guitare: 1.5, saxo: .8, steel: .6 }, pad: ['doux', 'scie'], basse: ['doigts', 'roule'], contre: ['voix', 'violon'], pluck: ['fm', 'scie', 'bois'],
      prod: { kickT: ['909', 'acoustique'], hatT: ['bruit', 'shaker'], salle: [1.8, 1.1, 'plaque'], revB: .28, dly: 3, fb: .3, sat: 1.3 },
      ouv: [['keys', 'hat', 'pad'], ['keys', 'lead', 'pad'], ['pad', 'keys', 'perc']], el: ['perc', 'cordes', 'choeur', 'arp', 'contre', 'hatO'],
      vrais: { keys: { '@piano': 1.5 }, cordes: { '@cordes': 1 }, kit: { snare: .4, clap: .4, hat: .3, crash: .4 } }, univers: { u: { hybride: 2, electro: 1.5, acoustique: 1 }, f: { orchestre: 1.5, folk: 1 } }, sig: { klaxon: 1, neon: 1, pieces: 1.5 } },
    synthpop: { nom: 'SYNTHPOP', dit: 'synthpop des années 80 (réverbe coupée)', fam: 'pop', bpm: [112, 124], modes: ['mineur', 'majeur'], ryt: 'backbeat', bas: 'croches', comp: 'blanches', kit: 'club', arp: ['up16', 'updown16'],
      prog: { mineur: ['0:m 8:M 10:M 0:m', '0:m 3:M 10:M 8:M', '8:M 10:M 0:m 7:M'], majeur: ['0:M 7:M 9:m 5:M', '5:M 7:M 0:M 0:M'] },
      keys: ['dx', 'puce'], lead: { carre: 2, scie: 2, cuivre: 1, saxo: .8 }, pad: ['scie', 'voix'], basse: ['roule', 'acid'], contre: ['voix'],
      prod: { kickT: ['909'], hatT: ['metal', 'fm'], salle: [1.4, 1.2, 'plaque'], revB: .22, dly: 3, fb: .32, sat: 1.4, gate: .9 },
      ouv: [['arp', 'pad', 'kick'], ['kick', 'snare', 'arp'], ['pad', 'arp', 'basse']], el: ['arp', 'toms', 'stab', 'choeur', 'hatO', 'cuivres'],
      univers: { u: { electro: 3, hybride: .8 }, f: { retro: 2 } }, sig: { neon: 3, turbo: 1.5, moteur: 1 } },
    rock70: { nom: 'ROCK', dit: 'rock des années 70', fam: 'rock', bpm: [118, 136], modes: ['mixolydien', 'majeur', 'mineur'], ryt: 'rock', bas: 'croches', comp: 'power', kit: 'rock',
      prog: { mixolydien: ['0:5 10:5 5:5 0:5', '0:5 0:5 10:5 5:5'], majeur: ['0:5 5:5 7:5 5:5', '0:5 7:5 9:5 5:5'], mineur: ['0:5 8:5 10:5 0:5', '0:5 3:5 5:5 3:5'] },
      keys: ['guitare'], lead: { guitareSat: 3, guitare: 1, cuivre: .5 }, pad: ['scie', 'doux'], basse: ['doigts'], contre: ['orgue'],
      prod: { kickT: ['acoustique'], hatT: ['metal', 'bruit'], salle: [1.4, 1.1], revB: .22, dly: 3, fb: .25, sat: 1.9 },
      ouv: [['keys', 'hat', 'kick'], ['toms', 'keys', 'snare'], ['basse', 'hat', 'keys']], el: ['toms', 'hatO', 'contre', 'octave', 'foule', 'ride'],
      vrais: { kit: { snare: .7, kick: .5, toms: .6, crash: .6, hat: .4 } }, univers: { u: { electro: 2, hybride: 1 }, f: { folk: 1 } }, sig: { moteur: 2.5, turbo: 1.5, klaxon: 1 } },
    punk: { nom: 'PUNK', dit: 'punk qui cogne', fam: 'rock', bpm: [160, 178], modes: ['majeur', 'mineur'], ryt: 'punk', bas: 'croches', comp: 'power', kit: 'rock', monte: [3, 5],
      prog: { majeur: ['0:5 5:5 7:5 0:5', '0:5 9:5 5:5 7:5', '0:5 7:5 5:5 5:5'], mineur: ['0:5 8:5 3:5 10:5', '0:5 0:5 8:5 10:5'] },
      keys: ['guitare'], lead: { guitareSat: 2.5, carre: 1, cuivre: .6 }, pad: ['scie'], basse: ['doigts', 'roule'], contre: ['voix'],
      prod: { kickT: ['acoustique'], hatT: ['bruit'], salle: [1, 1.2], revB: .16, dly: 2, fb: .2, sat: 2.2 }, trans: { roll: 3, toms: 2.5, trou: 1.5, rien: 1.5, begaie: 1 },
      ouv: [['keys', 'hat', 'snare'], ['snare', 'kick', 'keys'], ['keys', 'basse', 'hat']], el: ['foule', 'toms', 'hatO', 'octave', 'ride'],
      vrais: { kit: { snare: .6, kick: .4, toms: .5, crash: .7 } }, univers: { u: { electro: 1 }, f: { folk: 1 } }, sig: { moteur: 2, klaxon: 2, sirene: 1 } },
    metal: { nom: 'MÉTAL', dit: 'heavy metal', fam: 'rock', bpm: [100, 130], modes: ['sombre', 'mineur'], ryt: 'metal', bas: 'chug', comp: 'power', kit: 'rock',
      prog: { sombre: ['0:5 1:5 0:5 3:5', '0:5 0:5 1:5 0:5', '0:5 3:5 1:5 0:5'], mineur: ['0:5 8:5 10:5 7:5', '0:5 10:5 8:5 7:5'] },
      keys: ['guitare'], lead: { guitareSat: 3, cuivre: .5 }, pad: ['scie', 'voix'], basse: ['doigts', 'reese'], contre: ['violon', 'voix'],
      prod: { kickT: ['acoustique', 'grave'], hatT: ['metal'], salle: [1.6, 1, 'plaque'], revB: .2, dly: 2, fb: .2, sat: 2.3 },
      ouv: [['pad', 'keys', 'toms'], ['keys', 'pad', 'hat'], ['toms', 'pad', 'keys']], el: ['toms', 'cordes', 'choeur', 'ride', 'octave'],
      vrais: { cordes: { '@cordes': 1.5 }, pad: { '@violons': 1 }, kit: { snare: .7, kick: .6, toms: .7, crash: .7 } }, univers: { u: { electro: 2, hybride: 1.5 }, f: { orchestre: 2 } }, sig: { moteur: 3, sirene: 1.5, turbo: 1.5 } },
    reve: { nom: 'RÊVE', dit: 'dream pop / shoegaze', fam: 'rock', bpm: [92, 110], modes: ['lydien', 'majeur'], ryt: 'reve', bas: 'pop', comp: 'croches', kit: 'acoustique',
      prog: { lydien: ['0:maj7 2:M 0:maj7 2:M', '0:add9 2:M 9:m 7:M'], majeur: ['0:add9 7:add9 9:m 5:maj7', '0:maj9 5:maj9 0:maj9 5:maj9'] },
      keys: ['guitareC'], lead: { guitare: 2, cuivre: .6, carre: .6 }, pad: ['voix', 'scie', 'doux'], basse: ['doigts'], contre: ['voix', 'violon'],
      prod: { kickT: ['acoustique', 'sine'], hatT: ['bruit'], salle: [3.4, .8], revB: .45, dly: 4, fb: .42, sat: 1.5, bande: .4 }, transf: { keys: { chorus: 2, reverse: 1 }, pad: { reverse: 1.5, chorus: 1 } },
      ouv: [['pad', 'keys', 'hat'], ['keys', 'pad', 'choeur'], ['keys', 'echo', 'pad']], el: ['choeur', 'cordes', 'echo', 'arp', 'contre', 'hatO'],
      univers: { u: { electro: 2, hybride: 1 }, f: { retro: 1 } }, sig: { vapeur: 2, gouttes: 2, neon: 1 } },
    surf: { nom: 'SURF', dit: 'surf rock (réverbe à ressort)', fam: 'rock', bpm: [150, 168], modes: ['mineur', 'majeur'], ryt: 'surf', bas: 'croches', comp: 'croches', kit: 'rock', monte: [3, 6],
      prog: { mineur: ['0:m 10:M 8:M 7:M', '0:m 8:M 10:M 0:m', '0:m 5:m 7:M 0:m'], majeur: ['0:M 5:M 0:M 7:M', '0:M 9:m 5:M 7:M'] },
      keys: ['guitareC'], lead: { guitare: 3, cuivre: .8, saxo: .8 }, pad: ['doux'], basse: ['doigts'], contre: ['orgue'],
      prod: { kickT: ['acoustique'], hatT: ['bruit', 'metal'], salle: [2.2, .9, 'ressort'], revB: .4, dly: 2, fb: .3, sat: 1.5 },
      ouv: [['lead', 'tribu', 'hat'], ['tribu', 'keys', 'hat'], ['keys', 'basse', 'tribu']], el: ['tribu', 'hatO', 'contre', 'cuivres', 'octave', 'echo'],
      vrais: { lead: { '@trompette': .6 }, kit: { snare: .6, toms: .7, crash: .5 } }, univers: { u: { electro: 2, hybride: 1 }, f: { retro: 1, jazz: 1 } }, sig: { moteur: 2, klaxon: 1.5, drift: 1.5 } },
    // ---- SOUL / FUNK / JAZZ
    funk: { nom: 'FUNK', dit: 'funk des années 70', fam: 'soul', bpm: [100, 114], swing: .04, modes: ['dorien', 'mixolydien'], ryt: 'funk', bas: 'funk', comp: 'funk', kit: 'acoustique',
      prog: { dorien: ['0:m7 0:m7 0:m7 5:9', '0:m7 5:9 0:m7 5:9', '0:m9 0:m9 3:maj7 5:9'], mixolydien: ['0:9 0:9 5:9 0:9', '0:7 5:9 0:7 10:9'] },
      keys: ['clav', 'guitareC', 'rhodes'], lead: { cuivre: 2, saxo: 2, talkbox: 1.5, guitare: 1 }, pad: ['doux'], basse: ['slap', 'funk', 'doigts'], contre: ['orgue', 'voix'],
      cuiv: [[[0, 2], [3, 1], [6, 2]], [[8, 1], [10, 2], [14, 2]]],
      prod: { kickT: ['acoustique', '909'], hatT: ['bruit', 'metal'], salle: [1.2, 1.1], revB: .2, dly: 3, fb: .25, sat: 1.5 },
      ouv: [['keys', 'hat', 'kick'], ['basse', 'keys', 'hat'], ['hat', 'keys', 'perc']], el: ['cuivres', 'perc', 'hatO', 'contre', 'fant', 'toms'],
      vrais: { lead: { '@saxo': 1.5, '@trompette': 1 }, cuivres: { '@cuivres': 2 }, kit: { snare: .6, kick: .4, hat: .5, perc: .5 } }, univers: { u: { hybride: 2, acoustique: 1.5, electro: 1 }, f: { jazz: 2, retro: 1.5 } }, sig: { klaxon: 2, caisse: 1.5, moteur: 1 } },
    motown: { nom: 'SOUL', dit: 'soul de Detroit (Motown)', fam: 'soul', bpm: [104, 120], modes: ['majeur', 'mineur'], ryt: 'motown', bas: 'motown', comp: 'croches', kit: 'acoustique',
      prog: { majeur: ['0:M 9:m 5:M 7:M', '0:maj7 4:m7 5:maj7 7:7', '0:M 0:7 5:M 5:m', '5:M 7:M 0:M 9:m'], mineur: ['0:m7 5:m7 10:9 3:maj7', '0:m 5:m 7:7 0:m'] },
      keys: ['piano', 'orgue', 'wurli'], lead: { saxo: 2, cuivre: 1.5, guitare: 1, talkbox: .6 }, pad: ['doux', 'voix'], basse: ['doigts'], contre: ['violon', 'voix'], cuiv: [[[0, 4]], [[8, 2], [12, 4]]],
      prod: { kickT: ['acoustique'], hatT: ['bruit', 'shaker'], salle: [1.6, .9, 'plaque'], revB: .3, dly: 3, fb: .25, sat: 1.4, bande: .3 },
      ouv: [['keys', 'perc', 'hat'], ['basse', 'perc', 'keys'], ['keys', 'cordes', 'perc']], el: ['perc', 'cuivres', 'cordes', 'choeur', 'contre', 'hatO'],
      vrais: { keys: { '@piano': 1.5 }, lead: { '@saxo': 1.5 }, cordes: { '@cordes': 2 }, cuivres: { '@cuivres': 2 }, kit: { snare: .6, kick: .4, hat: .4, perc: .6 } }, univers: { u: { hybride: 2.5, acoustique: 1.5 }, f: { jazz: 1.5, orchestre: 1.5 } }, sig: { caisse: 2, klaxon: 1.5, pieces: 1 } },
    neosoul: { nom: 'NEO-SOUL', dit: 'neo-soul (le groove ivre de Dilla)', fam: 'soul', bpm: [76, 92], swing: .2, modes: ['majeur', 'dorien', 'mineur'], ryt: 'dilla', bas: 'pop', comp: 'ballade', kit: 'hiphop',
      prog: { majeur: ['0:maj9 9:m9 2:m9 7:9', '5:maj9 4:m7 2:m9 0:maj9', '0:maj9 4:m7 9:m9 7:7sus'], dorien: ['0:m9 5:9 0:m9 5:9', '0:m9 3:maj9 5:9 0:m9'], mineur: ['0:m9 5:m9 10:9 3:maj9'] },
      keys: ['rhodes', 'wurli', 'piano'], lead: { saxo: 2, talkbox: 1.5, cuivre: 1, guitare: 1 }, pad: ['doux', 'voix'], basse: ['doigts', 'roule'], contre: ['voix', 'violon'],
      prod: { kickT: ['lofi', 'acoustique'], hatT: ['shaker', 'bruit'], salle: [1.8, .8, 'plaque'], revB: .3, dly: 3, fb: .3, sat: 1.3, lofi: .25 },
      ouv: [['keys', 'hat', 'pad'], ['keys', 'basse', 'hat'], ['pad', 'keys', 'vinyl']], el: ['vinyl', 'contre', 'choeur', 'fant', 'perc', 'cordes'],
      vrais: { keys: { '@pianoFM': 1.5, '@vibraphone': 1 }, lead: { '@saxo': 1.5, '@trompetteSourd': 1 }, basse: { '@contrebasse': 1 }, kit: { snare: .5, hat: .5 } }, univers: { u: { hybride: 2, acoustique: 1.5, electro: 1 }, f: { jazz: 3 } }, sig: { gouttes: 2, vapeur: 1.5, caisse: 1 } },
    jazz: { nom: 'SWING', dit: 'jazz swing', fam: 'jazz', bpm: [132, 160], swing: .15, modes: ['majeur', 'mineur'], ryt: 'swing', bas: 'walking', comp: 'charleston', kit: 'doux', monte: [3, 6],
      prog: { majeur: ['2:m7 7:7 0:maj7 9:7', '0:maj7 9:7 2:m7 7:7', '4:m7 9:7 2:m7 7:7'], mineur: ['0:m7 5:m7 7:7 0:m7', '2:m7 7:7 0:m7 0:m7'] },
      keys: ['piano', 'rhodes'], lead: { saxo: 3, cuivre: 1.5 }, pad: ['doux'], basse: ['doigts'], contre: ['voix'], cuiv: [[[0, 2], [6, 2]], [[2, 1], [10, 4]]], fill: ['roll'], phrases: { appel: 2.5, longues: 1.5, classique: 1 },
      prod: { kickT: ['acoustique'], hatT: ['metal'], salle: [1.6, .8], revB: .22, dly: 3, fb: .2, sat: 1.1 },
      ouv: [['hat', 'basse', 'keys'], ['keys', 'basse', 'hat'], ['basse', 'hat', 'fant']], el: ['fant', 'cuivres', 'ride', 'contre', 'cordes'],
      vrais: { keys: { '@piano': 2.5, '@pianoQueue': 1 }, lead: { '@saxo': 3, '@trompetteSourd': 2, '@clarinette': 1 }, basse: { '@contrebasse': 4 }, cuivres: { '@cuivres': 2 }, kit: { snare: .7, hat: .6, kick: .3, crash: .4 } }, univers: { u: { acoustique: 3, hybride: 1.5 }, f: { jazz: 1 } }, sig: { caisse: 2, gouttes: 1, klaxon: 1 } },
    // ---- LATINE / CARAÏBES / AFRIQUE
    bossa: { nom: 'BOSSA', dit: 'bossa nova', fam: 'latin', bpm: [126, 142], modes: ['majeur', 'mineur'], ryt: 'bossa', bas: 'bossa', comp: 'bossa', kit: 'doux', monte: [3, 6], fill: ['roll'],
      prog: { majeur: ['2:m7 7:7 0:maj7 0:6', '0:maj7 9:m7 2:m7 7:7', '0:maj7 5:maj7 4:m7 9:7'], mineur: ['0:m7 5:m7 7:7 0:m7', '0:m7 2:m7 7:7 0:m7'] },
      keys: ['guitareC', 'piano', 'rhodes'], lead: { saxo: 2, cuivre: 1, guitare: 1, steel: .5 }, pad: ['doux'], basse: ['doigts', 'tri'], contre: ['violon', 'voix'],
      prod: { kickT: ['acoustique', 'sine'], hatT: ['shaker'], salle: [1.8, .8, 'plaque'], revB: .28, dly: 3, fb: .25, sat: 1.15 },
      ouv: [['keys', 'perc', 'basse'], ['keys', 'snare', 'perc'], ['perc', 'keys', 'pad']], el: ['perc', 'contre', 'cordes', 'ride', 'echo'],
      vrais: { keys: { '@piano': 1, '@harpe': .5 }, lead: { '@saxo': 2, '@clarinette': 1, '@trompetteSourd': 1 }, basse: { '@contrebasse': 2.5 }, cordes: { '@cordes': 1.5 }, kit: { snare: .5, perc: .7, hat: .6 } }, univers: { u: { acoustique: 2.5, hybride: 2 }, f: { jazz: 2.5, folk: 1 } }, sig: { gouttes: 2, caisse: 1.5, vapeur: 1 } },
    salsa: { nom: 'SALSA', dit: 'salsa (clave, montuno, tumbao)', fam: 'latin', bpm: [92, 104], modes: ['mineur', 'majeur'], ryt: 'salsa', bas: 'tumbao', comp: 'montuno', kit: 'latin',
      prog: { mineur: ['0:m 7:7 7:7 0:m', '0:m 5:m 7:7 0:m', '0:m 3:M 8:M 7:7'], majeur: ['0:M 5:M 7:7 5:M', '0:M 7:7 7:7 0:M'] },
      keys: ['piano'], lead: { cuivre: 2.5, saxo: 1.5 }, pad: ['doux'], basse: ['doigts'], contre: ['voix', 'violon'], cuiv: [[[0, 2], [3, 1], [6, 2], [10, 2]], [[12, 2], [14, 2]]],
      prod: { kickT: ['acoustique'], hatT: ['metal'], salle: [1.4, 1.1, 'plaque'], revB: .24, dly: 3, fb: .2, sat: 1.3 },
      ouv: [['perc', 'snare', 'keys'], ['keys', 'perc', 'basse'], ['snare', 'perc', 'hat']], el: ['perc', 'cuivres', 'cloche', 'tribu', 'contre', 'choeur'],
      vrais: { keys: { '@piano': 3 }, lead: { '@trompette': 2.5, '@saxo': 1 }, cuivres: { '@cuivres': 3 }, basse: { '@contrebasse': 1 }, kit: { perc: .9, snare: .4, hat: .5, crash: .4 } }, univers: { u: { acoustique: 2.5, hybride: 2 }, f: { jazz: 2 } }, sig: { klaxon: 2, caisse: 1.5, pieces: 1.5 } },
    cumbia: { nom: 'CUMBIA', dit: 'cumbia (güiro, accordéon)', fam: 'latin', bpm: [88, 100], modes: ['mineur', 'majeur'], ryt: 'cumbia', bas: 'cumbia', comp: 'offbeat', kit: 'latin',
      prog: { mineur: ['0:m 5:m 7:7 0:m', '0:m 0:m 7:7 7:7', '0:m 10:M 8:M 7:7'], majeur: ['0:M 7:7 7:7 0:M', '0:M 5:M 7:7 0:M'] },
      keys: ['piano', 'orgue', 'guitareC'], lead: { accordeon: 3, cuivre: 1, saxo: .8 }, pad: ['doux'], basse: ['doigts', 'tri'], contre: ['orgue', 'voix'],
      prod: { kickT: ['acoustique', '808'], hatT: ['shaker', 'bruit'], salle: [1.3, 1], revB: .22, dly: 3, fb: .28, sat: 1.4 },
      ouv: [['perc', 'basse', 'lead'], ['perc', 'keys', 'kick'], ['lead', 'perc', 'basse']], el: ['perc', 'cloche', 'tribu', 'contre', 'echo'],
      vrais: { lead: { '@harmonica': .5 }, kit: { perc: .9, hat: .5, snare: .3 } }, univers: { u: { electro: 1.5, hybride: 2, acoustique: 1 }, f: { folk: 2 } }, sig: { klaxon: 2, pieces: 1.5, caisse: 1 } },
    tango: { nom: 'TANGO', dit: 'tango électronique', fam: 'latin', bpm: [112, 124], modes: ['mineur'], ryt: 'habanera', bas: 'habanera', comp: 'hache', kit: 'club',
      prog: { mineur: ['0:m 0:m 7:7 7:7', '0:m 5:m 7:7 0:m', '0:m 8:M 7:7 0:m', '5:m 0:m 7:7 0:m'] },
      keys: ['piano'], lead: { accordeon: 3, saxo: .5 }, pad: ['doux', 'scie'], basse: ['doigts', 'roule'], contre: ['violon'],
      prod: { kickT: ['909', 'acoustique'], hatT: ['metal'], salle: [2, .9, 'plaque'], revB: .3, dly: 3, fb: .3, sat: 1.3 },
      ouv: [['lead', 'keys', 'pad'], ['keys', 'perc', 'lead'], ['pad', 'lead', 'basse']], el: ['cordes', 'perc', 'contre', 'echo', 'pompe'],
      vrais: { keys: { '@piano': 2 }, cordes: { '@cordes': 2 }, contre: { '@violonSolo': 2 }, basse: { '@contrebasse': 1 }, kit: { perc: .4 } }, univers: { u: { hybride: 2.5, electro: 1 }, f: { orchestre: 2 } }, sig: { vapeur: 1.5, neon: 1.5, caisse: 1 } },
    reggae: { nom: 'ROOTS', dit: 'reggae roots (one drop)', fam: 'caraibes', bpm: [68, 80], swing: .12, modes: ['majeur', 'mineur', 'dorien'], ryt: 'onedrop', bas: 'reggae', comp: 'skank', kit: 'acoustique', monte: [3, 6],
      prog: { majeur: ['0:M 5:M 0:M 5:M', '0:M 7:M 9:m 5:M', '0:M 5:M 7:M 5:M'], mineur: ['0:m 5:m 0:m 5:m', '0:m 10:M 8:M 10:M'], dorien: ['0:m7 5:9 0:m7 5:9'] },
      keys: ['guitareC', 'orgue'], lead: { cuivre: 2, saxo: 1.5, carre: .6 }, pad: ['doux'], basse: ['doigts', 'roule'], contre: ['orgue', 'voix'], cuiv: [[[0, 4]], [[8, 2], [12, 2]]],
      prod: { kickT: ['acoustique'], hatT: ['metal'], salle: [1.8, .8, 'ressort'], revB: .32, dly: 6, fb: .45, sat: 1.4, bande: .5 },
      ouv: [['keys', 'hat', 'basse'], ['basse', 'snare', 'keys'], ['keys', 'basse', 'echo']], el: ['echo', 'cuivres', 'perc', 'contre', 'fant', 'choeur'],
      vrais: { lead: { '@trompette': 1.5, '@saxo': 1 }, cuivres: { '@cuivres': 1.5 }, kit: { snare: .6, hat: .5, perc: .4 } }, univers: { u: { hybride: 2, electro: 1.5, acoustique: 1 }, f: { jazz: 1, folk: 1 } }, sig: { sirene: 2.5, klaxon: 1.5, vapeur: 1 } },
    dubroots: { nom: 'DUB', dit: 'dub jamaïcain (King Tubby, Scientist)', fam: 'caraibes', bpm: [68, 78], swing: .08, modes: ['mineur', 'dorien'], ryt: 'steppers', bas: 'dub', comp: 'skank', kit: 'acoustique', monte: [3, 6],
      prog: { mineur: ['0:m 0:m 5:m 5:m', '0:m 10:M 0:m 10:M', '0:m 8:M 10:M 0:m'], dorien: ['0:m7 0:m7 5:9 5:9'] },
      keys: ['orgue', 'guitareC'], lead: { cuivre: 1.5, saxo: 1, carre: .8 }, pad: ['doux'], basse: ['doigts', 'roule'], contre: ['orgue'],
      prod: { kickT: ['acoustique', 'sine'], hatT: ['metal'], salle: [2.4, .7, 'ressort'], revB: .42, dly: 6, fb: .58, sat: 1.5, bande: .8 },
      ouv: [['basse', 'snare', 'echo'], ['keys', 'echo', 'basse'], ['basse', 'keys', 'hat']], el: ['echo', 'sub', 'perc', 'choeur', 'i_basseOct', 'cuivres'],
      vrais: { lead: { '@trompette': 1, '@trompetteSourd': 1 }, kit: { snare: .6, hat: .4 } }, univers: { u: { electro: 2, hybride: 1.5 }, f: { jazz: 1 } }, sig: { sirene: 3, vapeur: 1.5, gouttes: 1 } },
    afrobeat: { nom: 'AFROBEAT', dit: 'afrobeat de Lagos (Fela, Tony Allen)', fam: 'afro', bpm: [104, 116], modes: ['dorien', 'mineur'], ryt: 'afrobeat', bas: 'afrobeat', comp: 'funk', kit: 'acoustique',
      prog: { dorien: ['0:m7 0:m7 0:m7 0:m7', '0:m7 5:9 0:m7 5:9', '0:m7 0:m7 3:maj7 5:9'], mineur: ['0:m7 0:m7 8:maj7 10:9'] },
      keys: ['orgue', 'guitareC', 'clav'], lead: { cuivre: 2.5, saxo: 2.5, guitare: 1 }, pad: ['doux'], basse: ['doigts', 'funk'], contre: ['orgue', 'voix'], cuiv: [[[0, 2], [3, 2], [6, 1]], [[8, 2], [11, 1], [12, 3]]],
      prod: { kickT: ['acoustique'], hatT: ['metal', 'shaker'], salle: [1.4, 1, 'plaque'], revB: .24, dly: 3, fb: .25, sat: 1.5, bande: .3 },
      ouv: [['hat', 'kick', 'perc'], ['keys', 'perc', 'hat'], ['perc', 'basse', 'keys']], el: ['perc', 'cuivres', 'tribu', 'hatO', 'cloche', 'contre', 'choeur'],
      vrais: { lead: { '@saxo': 2.5, '@trompette': 1.5 }, cuivres: { '@cuivres': 2.5 }, kit: { snare: .6, perc: .8, hat: .5 } }, univers: { u: { hybride: 2.5, acoustique: 1.5, electro: 1 }, f: { jazz: 2, folk: 1 } }, sig: { klaxon: 2.5, caisse: 1, moteur: 1 } },
    afropop: { nom: 'AFROBEATS', dit: 'afrobeats (Lagos, aujourd’hui)', fam: 'afro', bpm: [100, 112], modes: ['majeur', 'mineur'], ryt: 'afropop', bas: 'tresillo', comp: 'offbeat', kit: 'hiphop',
      prog: { majeur: ['0:M 9:m 5:M 7:M', '5:maj7 7:M 0:M 0:M', '0:M 5:M 9:m 7:M'], mineur: ['0:m 8:M 3:M 10:M', '0:m7 5:m7 8:maj7 10:9'] },
      keys: ['guitareC', 'rhodes', 'piano'], lead: { steel: 1.5, saxo: 1, kalimba: 1.5, carre: 1 }, pad: ['doux', 'voix'], basse: ['808', 'doigts', 'sub808'], contre: ['voix'], pluck: ['bois', 'fm'],
      prod: { kickT: ['808', '909'], hatT: ['shaker'], salle: [1.6, 1, 'plaque'], revB: .26, dly: 3, fb: .3, sat: 1.3 },
      ouv: [['perc', 'keys', 'kick'], ['keys', 'perc', 'hat'], ['lead', 'perc', 'kick']], el: ['perc', 'arp', 'choeur', 'tribu', 'hatO', 'cloche'],
      vrais: { lead: { '@kalimba': 1.5, '@marimba': 1 }, kit: { perc: .8, hat: .5, clap: .4 } }, univers: { u: { electro: 2, hybride: 2 }, f: { folk: 2 } }, sig: { pieces: 2, caisse: 1.5, klaxon: 1 } },
    amapiano: { nom: 'AMAPIANO', dit: 'amapiano (log drum, Johannesburg)', fam: 'afro', bpm: [108, 114], modes: ['majeur', 'mineur', 'dorien'], ryt: 'amapiano', bas: 'log', comp: 'ama', kit: 'club',
      prog: { majeur: ['0:maj9 9:m9 2:m9 7:7sus', '5:maj9 4:m7 9:m9 0:maj9'], mineur: ['0:m9 5:m9 3:maj9 8:maj9', '0:m9 8:maj9 10:6 0:m9'], dorien: ['0:m9 5:9 0:m9 5:9'] },
      keys: ['piano', 'rhodes'], lead: { saxo: 2, kalimba: 1, carre: 1, talkbox: .8 }, pad: ['doux', 'voix'], basse: ['logdrum'], contre: ['voix'], pluck: ['fm', 'bois'],
      prod: { kickT: ['909', 'sine'], hatT: ['shaker'], salle: [2.4, .8], revB: .34, dly: 3, fb: .32, sat: 1.25 },
      ouv: [['perc', 'keys', 'pad'], ['keys', 'perc', 'hatO'], ['pad', 'perc', 'keys']], el: ['perc', 'hatO', 'arp', 'choeur', 'contre', 'echo'],
      vrais: { keys: { '@piano': 2.5, '@pianoQueue': 1 }, lead: { '@saxo': 2 }, kit: { perc: .6, hat: .7, clap: .3 } }, univers: { u: { hybride: 2.5, electro: 1.5 }, f: { jazz: 3 } }, sig: { pieces: 2, gouttes: 1.5, caisse: 1 } },
    // ---- CLUB / BASS MUSIC / HIP-HOP
    house: { nom: 'HOUSE', dit: 'house de Chicago', fam: 'club', bpm: [120, 126], modes: ['mineur', 'dorien', 'majeur'], ryt: 'quatre', bas: 'contretemps', comp: 'offbeat', stab: 'offbeat', kit: 'club', pompe: .5,
      prog: { mineur: ['0:m7 5:m7 0:m7 5:m7', '0:m7 8:maj7 0:m7 8:maj7'], dorien: ['0:m9 5:9 0:m9 5:9', '0:m9 3:maj9 5:9 0:m9'], majeur: ['9:m7 5:maj7 0:maj7 7:7sus'] },
      keys: ['orgue', 'piano', 'rhodes'], lead: { carre: 1.5, saxo: 1, talkbox: 1, scie: 1 }, pad: ['doux', 'voix'], basse: ['roule', 'acid', 'doigts'], contre: ['voix', 'orgue'],
      prod: { kickT: ['909'], hatT: ['metal', 'bruit'], salle: [1.6, 1, 'plaque'], revB: .26, dly: 3, fb: .32, sat: 1.4 },
      ouv: [['kick', 'hat', 'perc'], ['keys', 'kick', 'hatO'], ['perc', 'kick', 'stab']], el: ['pompe', 'hatO', 'perc', 'stab', 'choeur', 'arp'],
      vrais: { keys: { '@piano': 2 }, kit: { clap: .5, hat: .3, perc: .4 } }, univers: { u: { electro: 2.5, hybride: 1.5 }, f: { jazz: 1.5, retro: 1.5 } }, sig: { neon: 2, caisse: 1.5, pieces: 1 } },
    techno: { nom: 'TECHNO', dit: 'techno de Detroit à Berlin', fam: 'club', bpm: [128, 136], modes: ['sombre', 'mineur'], ryt: 'techno', bas: 'roule', comp: 'hache', stab: 'offbeat', kit: 'club', pompe: .55, ferme: 2600,
      prog: { sombre: ['0:m 0:m 0:m 0:m', '0:m 0:m 1:M 0:m'], mineur: ['0:m 0:m 8:M 0:m', '0:m7 0:m7 0:m7 3:maj7'] },
      keys: ['dx', 'puce'], lead: { carre: 1.5, scie: 1.5, chip: .5 }, pad: ['scie', 'doux'], basse: ['acid', 'roule', 'reese'], contre: ['orgue'], pluck: ['fm', 'scie'],
      prod: { kickT: ['909', 'grave'], hatT: ['metal', 'fm'], salle: [2.6, .9], revB: .28, dly: 3, fb: .45, sat: 1.7 },
      ouv: [['kick', 'hat', 'perc'], ['kick', 'basse', 'hat'], ['perc', 'kick', 'arp']], el: ['pompe', 'arp', 'perc', 'hatO', 'stab', 'echo', 'sub'],
      vrais: { kit: { hat: .2, perc: .3 } }, univers: { u: { electro: 1 }, f: { retro: 1 } }, sig: { moteur: 2.5, neon: 2, turbo: 1.5, sirene: 1 } },
    trance: { nom: 'TRANCE', dit: 'trance (supersaw, les mains en l’air)', fam: 'club', bpm: [136, 140], modes: ['mineur'], ryt: 'trance', bas: 'trance', comp: 'offbeat', kit: 'club', pompe: .6, arp: ['up16', 'updown16'],
      prog: { mineur: ['0:m 8:M 3:M 10:M', '8:M 10:M 0:m 0:m', '0:m 5:m 8:M 10:M', '0:m 10:M 8:M 7:M'] },
      keys: ['dx', 'piano'], lead: { scie: 3, carre: 1 }, pad: ['scie', 'voix'], basse: ['roule', 'reese'], contre: ['voix', 'violon'], pluck: ['scie', 'fm'],
      prod: { kickT: ['909'], hatT: ['metal', 'bruit'], salle: [3, 1.1, 'plaque'], revB: .34, dly: 3, fb: .4, sat: 1.5 },
      ouv: [['arp', 'pad', 'kick'], ['pad', 'arp', 'hat'], ['kick', 'arp', 'basse']], el: ['arp', 'pompe', 'hatO', 'choeur', 'cordes', 'octave'],
      vrais: { cordes: { '@cordes': 1 }, pad: { '@violons': .6 }, kit: { clap: .3 } }, univers: { u: { electro: 3, hybride: 1 }, f: { orchestre: 1 } }, sig: { neon: 2.5, turbo: 2, moteur: 1 } },
    jungle: { nom: 'JUNGLE', dit: 'jungle (breakbeat, basse ragga)', fam: 'bass', bpm: [164, 174], modes: ['mineur', 'dorien'], ryt: 'breakbeat', bas: 'reese', comp: 'tenue', kit: 'acoustique', monte: [2, 4],
      prog: { mineur: ['0:m9 8:maj9 0:m9 8:maj9', '0:m 10:M 8:M 10:M', '0:m 0:m 5:m 5:m'], dorien: ['0:m9 5:9 0:m9 5:9'] },
      keys: ['rhodes', 'piano', 'dx'], lead: { saxo: 1, cuivre: 1, carre: 1 }, pad: ['doux', 'voix'], basse: ['reese', 'sub808', 'roule'], contre: ['voix'],
      prod: { kickT: ['acoustique', '909'], hatT: ['metal'], salle: [2, .9, 'ressort'], revB: .3, dly: 3, fb: .45, sat: 1.6, bande: .4 },
      ouv: [['pad', 'keys', 'hat'], ['hat', 'snare', 'pad'], ['keys', 'pad', 'echo']], el: ['echo', 'sub', 'ride', 'fant', 'choeur', 'perc'],
      vrais: { keys: { '@pianoFM': 1 }, kit: { snare: .7, kick: .5, hat: .5 } }, univers: { u: { electro: 2, hybride: 1.5 }, f: { jazz: 1.5, retro: 1 } }, sig: { sirene: 2.5, moteur: 1.5, neon: 1 } },
    footwork: { nom: 'FOOTWORK', dit: 'footwork / juke de Chicago', fam: 'bass', bpm: [156, 162], modes: ['mineur', 'sombre'], ryt: 'footwork', bas: 'glisse', comp: 'hache', kit: 'hiphop', monte: [2, 4],
      prog: { mineur: ['0:m 0:m 8:M 7:M', '0:m7 8:maj7 3:maj7 10:9'], sombre: ['0:m 1:M 0:m 1:M'] },
      keys: ['rhodes', 'dx'], lead: { carre: 1, talkbox: 1.5, saxo: .6 }, pad: ['voix', 'doux'], basse: ['808', 'sub808'], contre: ['voix'], chop: [[[0, 1], [3, 1], [6, 1], [10, 1]], [[0, 1], [2, 1], [3, 1], [8, 1], [11, 1], [14, 1]]],
      prod: { kickT: ['808'], hatT: ['metal', 'bruit'], salle: [1.4, 1], revB: .2, dly: 3, fb: .3, sat: 1.6 },
      ouv: [['choeur', 'kick', 'hat'], ['kick', 'choeur', 'perc'], ['pad', 'kick', 'choeur']], el: ['choeur', 'perc', 'i_triolet', 'fant', 'echo'],
      univers: { u: { electro: 2, hybride: 1 }, f: { jazz: 1, retro: 1 } }, sig: { turbo: 2, moteur: 1.5, caisse: 1 } },
    jersey: { nom: 'JERSEY CLUB', dit: 'jersey club', fam: 'bass', bpm: [138, 144], modes: ['mineur', 'majeur'], ryt: 'jersey', bas: 'glisse', comp: 'hache', kit: 'hiphop', monte: [2, 4],
      prog: { mineur: ['0:m 8:M 3:M 10:M', '0:m 5:m 8:M 7:M'], majeur: ['0:M 7:M 9:m 5:M'] },
      keys: ['dx', 'puce', 'rhodes'], lead: { carre: 1.5, chip: 1, talkbox: 1 }, pad: ['voix', 'scie'], basse: ['808', 'sub808'], contre: ['voix'], chop: [[[0, 1], [6, 1], [12, 1]], [[0, 1], [3, 1], [4, 1], [10, 1], [12, 1]]],
      prod: { kickT: ['808', '909'], hatT: ['bruit'], salle: [1.2, 1.1], revB: .18, dly: 2, fb: .25, sat: 1.7 },
      ouv: [['kick', 'choeur', 'hat'], ['choeur', 'kick', 'snare'], ['kick', 'pad', 'choeur']], el: ['choeur', 'perc', 'i_triolet', 'cloche', 'fant'],
      univers: { u: { electro: 1 }, f: { retro: 1 } }, sig: { klaxon: 2, turbo: 1.5, caisse: 1.5, sirene: 1 } },
    boombap: { nom: 'BOOM BAP', dit: 'rap new-yorkais des années 90', fam: 'hiphop', bpm: [86, 96], swing: .16, modes: ['dorien', 'mineur'], ryt: 'boombap', bas: 'pop', comp: 'charleston', kit: 'hiphop', monte: [3, 6],
      prog: { dorien: ['0:m9 5:9 0:m9 5:9', '0:m7 3:maj7 5:9 0:m7'], mineur: ['0:m7 8:maj7 5:m7 7:7', '0:m9 0:m9 8:maj7 7:7'] },
      keys: ['rhodes', 'piano', 'dx'], lead: { saxo: 2, cuivre: 1.5, guitare: 1 }, pad: ['doux'], basse: ['doigts', 'roule'], contre: ['voix', 'violon'],
      prod: { kickT: ['lofi', 'acoustique'], hatT: ['bruit', 'shaker'], salle: [1.2, .8], revB: .2, dly: 3, fb: .3, sat: 1.7, lofi: .35 },
      ouv: [['vinyl', 'keys', 'kick'], ['keys', 'vinyl', 'hat'], ['vinyl', 'kick', 'snare']], el: ['vinyl', 'fant', 'cuivres', 'cordes', 'contre', 'echo'],
      vrais: { keys: { '@piano': 2, '@vibraphone': 1 }, lead: { '@saxo': 2, '@trompetteSourd': 1.5 }, cordes: { '@cordes': 1 }, basse: { '@contrebasse': 1.5 }, kit: { snare: .6, kick: .5, hat: .5 } }, univers: { u: { hybride: 2.5, acoustique: 2 }, f: { jazz: 3 } }, sig: { caisse: 2, vapeur: 1.5, sirene: 1 } },
    drill: { nom: 'DRILL', dit: 'drill de Londres', fam: 'hiphop', bpm: [140, 146], modes: ['sombre', 'mineur'], ryt: 'drill', bas: 'glisse', comp: 'tenue', kit: 'hiphop', monte: [2, 4],
      prog: { sombre: ['0:m 1:M 0:m 8:M', '0:m 0:m 1:M 0:m'], mineur: ['0:m 8:M 7:M 0:m', '0:m 3:M 7:M 0:m'] },
      keys: ['piano', 'dx'], lead: { carre: 1, cuivre: 1, saxo: .6 }, pad: ['voix', 'scie'], basse: ['808', 'sub808', '808dur'], contre: ['violon', 'voix'],
      prod: { kickT: ['808'], hatT: ['bruit', 'metal'], salle: [1.8, .9], revB: .26, dly: 3, fb: .3, sat: 1.7 },
      ouv: [['keys', 'pad', 'hat'], ['pad', 'keys', 'choeur'], ['keys', 'hat', 'snare']], el: ['choeur', 'cordes', 'perc', 'i_triolet', 'roll'],
      vrais: { keys: { '@piano': 2, '@pianoQueue': 1 }, cordes: { '@cordes': 1.5 }, contre: { '@violonSolo': 1.5 } }, univers: { u: { hybride: 2.5, electro: 1.5 }, f: { orchestre: 2.5 } }, sig: { sirene: 2.5, moteur: 1.5, drift: 1 } },
    // ---- RÉTRO / AMBIANT / FOLK / CINÉMA
    vapor: { nom: 'VAPEUR', dit: 'vaporwave (city pop ralentie)', fam: 'retro', bpm: [76, 90], modes: ['majeur', 'lydien'], ryt: 'lent', bas: 'pop', comp: 'ballade', kit: 'club', monte: [3, 6],
      prog: { majeur: ['5:maj7 4:m7 2:m7 0:maj7', '0:maj9 5:maj9 4:m7 9:m7', '2:m9 7:9 0:maj9 9:m9'], lydien: ['0:maj7 2:M 0:maj7 2:M'] },
      keys: ['dx', 'rhodes', 'wurli'], lead: { saxo: 2.5, carre: 1, talkbox: 1 }, pad: ['doux', 'voix'], basse: ['doigts', 'roule'], contre: ['voix'],
      prod: { kickT: ['lofi', '909'], hatT: ['bruit'], salle: [3.2, .6], revB: .48, dly: 4, fb: .4, sat: 1.3, lofi: .7, bande: .4 }, transf: { keys: { chorus: 2, tape: 2 }, pad: { chorus: 1 } },
      ouv: [['keys', 'pad', 'echo'], ['pad', 'keys', 'hat'], ['keys', 'echo', 'basse']], el: ['echo', 'contre', 'choeur', 'cordes', 'arp'],
      vrais: { lead: { '@saxo': 2 }, keys: { '@pianoFM': 1.5 } }, univers: { u: { electro: 2, hybride: 1.5 }, f: { retro: 3 } }, sig: { vapeur: 2.5, gouttes: 2, neon: 1.5 } },
    ambient: { nom: 'AMBIANT', dit: 'ambient (Eno, la musique qui flotte)', fam: 'cinema', bpm: [80, 96], modes: ['lydien', 'majeur'], ryt: 'ambiant', bas: 'tenue', comp: 'tenue', kit: 'doux', monte: [2, 4],
      prog: { lydien: ['0:maj7 2:M 0:maj7 7:M', '0:maj9 2:add9 0:maj9 2:add9'], majeur: ['0:add9 5:add9 9:m 7:add9', '0:maj9 9:m9 5:maj9 7:add9'] },
      keys: ['piano', 'harpe', 'rhodes'], lead: { steel: 1, kalimba: 1.5, cuivre: .5 }, pad: ['doux', 'voix'], basse: ['tri', 'roule'], contre: ['violon', 'voix'], pluck: ['fm', 'bois'],
      prod: { kickT: ['sine'], hatT: ['shaker'], salle: [4.2, .7], revB: .52, dly: 4, fb: .48, sat: 1.1 }, transf: { pad: { reverse: 2 }, keys: { tape: 1 } },
      ouv: [['pad', 'keys', 'echo'], ['keys', 'pad', 'arp'], ['pad', 'arp', 'cordes']], el: ['echo', 'arp', 'cordes', 'choeur', 'contre', 'perc'],
      vrais: { keys: { '@pianoQueue': 2, '@harpe': 1.5 }, cordes: { '@cordes': 2 }, pad: { '@violons': 1.5 }, lead: { '@kalimba': 1 } }, univers: { u: { hybride: 2, acoustique: 2, electro: 1 }, f: { orchestre: 2, folk: 1 } }, sig: { gouttes: 3, vapeur: 2 } },
    country: { nom: 'COUNTRY', dit: 'country / bluegrass', fam: 'folk', bpm: [104, 124], modes: ['majeur', 'mixolydien'], ryt: 'train', bas: 'boom', comp: 'croches', kit: 'acoustique',
      prog: { majeur: ['0:M 5:M 7:M 0:M', '0:M 0:M 5:M 7:7', '0:M 9:m 5:M 7:M'], mixolydien: ['0:M 10:M 5:M 0:M'] },
      keys: ['guitareC', 'piano'], lead: { guitare: 2.5, steel: .4, accordeon: .6 }, pad: ['doux'], basse: ['doigts'], contre: ['violon'],
      prod: { kickT: ['acoustique'], hatT: ['bruit', 'shaker'], salle: [1.4, 1], revB: .22, dly: 3, fb: .2, sat: 1.2 },
      ouv: [['keys', 'snare', 'basse'], ['lead', 'keys', 'snare'], ['keys', 'basse', 'hat']], el: ['contre', 'perc', 'toms', 'echo'],
      vrais: { lead: { '@harmonica': 2, '@strumstick': 2.5, '@violonSolo': 1 }, keys: { '@piano': 1 }, basse: { '@contrebasse': 2 }, contre: { '@violonSolo': 2 }, kit: { snare: .6, kick: .4 } }, univers: { u: { acoustique: 2.5, hybride: 2 }, f: { folk: 3 } }, sig: { klaxon: 2.5, moteur: 2, drift: 1 } },
    flamenco: { nom: 'RUMBA', dit: 'rumba flamenca', fam: 'folk', bpm: [100, 118], modes: ['sombre', 'mineur'], ryt: 'rumba', bas: 'tresillo', comp: 'rumba', kit: 'latin',
      prog: { sombre: ['0:M 1:M 3:M 1:M', '0:M 1:M 0:M 1:M'], mineur: ['0:m 10:M 8:M 7:M', '5:m 0:m 10:M 7:M'] },
      keys: ['guitareC'], lead: { guitare: 3, saxo: .5, accordeon: .5 }, pad: ['doux'], basse: ['doigts'], contre: ['voix', 'violon'],
      prod: { kickT: ['acoustique'], hatT: ['shaker'], salle: [1.6, 1, 'plaque'], revB: .26, dly: 3, fb: .2, sat: 1.2 },
      ouv: [['keys', 'perc', 'snare'], ['snare', 'keys', 'perc'], ['keys', 'lead', 'perc']], el: ['perc', 'contre', 'cuivres', 'tribu', 'choeur'],
      vrais: { contre: { '@violonSolo': 1.5 }, basse: { '@contrebasse': 1 }, kit: { perc: .9, clap: .8, snare: .3 } }, univers: { u: { acoustique: 2, hybride: 2 }, f: { folk: 2, orchestre: 1 } }, sig: { caisse: 2, klaxon: 1.5, drift: 1 } },
    balkan: { nom: 'BALKAN', dit: 'fanfare des Balkans', fam: 'folk', bpm: [128, 148], modes: ['mineur', 'sombre'], ryt: 'oompah', bas: 'oompah', comp: 'oompah', kit: 'acoustique', monte: [4, 8],
      prog: { mineur: ['0:m 7:7 0:m 7:7', '0:m 5:m 7:7 0:m', '0:m 8:M 7:7 0:m'], sombre: ['0:M 1:M 0:M 10:m', '0:M 1:M 1:M 0:M'] },
      keys: ['orgue', 'piano'], lead: { cuivre: 2, accordeon: 2, saxo: 1.5 }, pad: ['doux'], basse: ['tri', 'doigts'], contre: ['violon'], cuiv: [[[4, 2], [12, 2]], [[2, 1], [6, 1], [10, 1], [14, 1]]],
      prod: { kickT: ['acoustique'], hatT: ['metal'], salle: [1.2, 1.1], revB: .18, dly: 2, fb: .2, sat: 1.4 },
      ouv: [['basse', 'keys', 'snare'], ['lead', 'basse', 'kick'], ['kick', 'basse', 'cuivres']], el: ['cuivres', 'tribu', 'contre', 'foule', 'perc', 'cloche'],
      vrais: { lead: { '@clarinette': 2.5, '@trompette': 2, '@saxo': 1 }, basse: { '@tuba': 3 }, cuivres: { '@cuivres': 3 }, contre: { '@violonSolo': 1.5 }, kit: { snare: .6, kick: .6, toms: .4, crash: .5 } }, univers: { u: { acoustique: 2.5, hybride: 2 }, f: { orchestre: 2.5, jazz: 1 } }, sig: { klaxon: 3, caisse: 1.5, pieces: 1 } },
    western: { nom: 'WESTERN', dit: 'western spaghetti (Morricone)', fam: 'cinema', bpm: [88, 104], modes: ['mineur', 'dorien'], ryt: 'galop', bas: 'galop', comp: 'tenue', kit: 'acoustique',
      prog: { mineur: ['0:m 8:M 10:M 0:m', '0:m 3:M 10:M 0:m', '0:m 5:m 7:M 0:m'], dorien: ['0:m 10:M 0:m 10:M'] },
      keys: ['guitareC', 'harpe'], lead: { guitare: 3, cuivre: 1.5 }, pad: ['voix', 'doux'], basse: ['doigts'], contre: ['voix', 'violon'],
      prod: { kickT: ['acoustique'], hatT: ['metal'], salle: [3, .8, 'ressort'], revB: .4, dly: 4, fb: .4, sat: 1.3, bande: .3 },
      ouv: [['lead', 'tribu', 'pad'], ['tribu', 'lead', 'choeur'], ['pad', 'tribu', 'keys']], el: ['tribu', 'choeur', 'cloche', 'cuivres', 'cordes', 'echo'],
      vrais: { lead: { '@trompette': 2, '@harmonica': 1.5 }, cuivres: { '@cuivres': 1.5 }, cordes: { '@cordes': 2 }, kit: { toms: .7, snare: .5 } }, univers: { u: { hybride: 2.5, acoustique: 1.5 }, f: { orchestre: 2, folk: 1.5 } }, sig: { sirene: 1, drift: 2, moteur: 1.5 } } };
  for (const id in ATLAS) genre(id, ATLAS[id]);
  DA_STYLES.atlas = Object.keys(ATLAS); DA_STYLES.hybride = DA_STYLES.cashcar.concat(DA_STYLES.dubstep, DA_STYLES.atlas);
  // ================================================================ (trio) LES TROIS NOUVEAUX — des morceaux ÉCRITS, pas tirés
  // `fige` : l'ordre des 30 moteurs est celui écrit ici (pas d'ouverture tirée, pas de courbe au hasard) ; `sig`/`sig2` : leurs signatures ;
  // le numéro (la graine) ne choisit plus que la tonalité, le tempo exact, les grilles, les phrases de la mélodie et la main du batteur.
  // L'univers ACOUSTIQUE avec UNE famille par morceau : chaque rôle n'a qu'un timbre écrit (le vrai quand il existe, le synthé sinon).
  // LE GRAVE AGRÉABLE (Léo, 15/10) : des basses qui claquent puis s'éteignent (contrebasse, basse aux doigts), des grosses caisses courtes,
  // aucune sous-basse (`sub`) — le punch, pas le sous-grave tenu qui fatigue dans les écouteurs.
  Object.assign(FAMILLES, {
    swing: ['clarinette', 'trompetteSourd', 'trompette', 'trombone', 'saxo', 'contrebasse', 'piano', 'pianoQueue', 'vibraphone', 'cuivres', 'cordes', 'violonsPizz'],
    carnaval: ['trompette', 'trombone', 'cuivres', 'saxo', 'contrebasse'],
    casse: ['clavecin', 'celliPizz', 'violonsPizz', 'cordes', 'celli', 'violons', 'contrebasse', 'trompetteSourd', 'vibraphone', 'pianoQueue', 'harpe'] });
  const TRIO = {
    // ZEPPELIN D'OR — l'électro swing (Caravan Palace, Parov Stelar) : le manouche mineur (i6 · iv6 · V7), la contrebasse qui fait oom-pah
    // puis MARCHE, le piano en pompe (accords sur 2 et 4) puis en stride, la clarinette, la trompette bouchée, les cuivres hachés, les
    // voix hachées (le scat), la house dessous (quatre au sol, mains sur 2 et 4) ; le swing des croches. LE GRAMOPHONE : du 1er au 11e
    // moteur tout sort d'un pavillon (coupe-bas 420 Hz, coupe-haut 2,6 kHz, craquements) ; au 9e la house tombe DEDANS ; au 12e il s'ouvre.
    zeppelin: { nom: 'ZEPPELIN D’OR', dit: 'électro swing (les années folles × la house)', titre: 'ZEPPELIN D’OR', fige: true, sig: 'champagne', sig2: 'klaxon',
      bpm: [122, 126], monte: [3, 5], modes: ['mineur'], swing: .05, swing8: .55, reg: 64, cap: 82, pompe: .45, ferme: 2600, gramo: 260, gainDb: 6, voixB: ['pluck', 'lead'],
      grilles: { mineur: ['0:m6 5:m6 7:7 0:m6', '0:m6 0:m6 7:7 7:7', '0:m6 8:7 7:7 0:m6', '5:m6 0:m6 7:7 0:m6', '0:m6 3:maj7 8:7 7:7'] },
      keysT: [], leadT: {}, basseT: [], padT: ['doux'], pluckT: [], contreT: [], cordesT: [], cuivresT: [],   // (un seul timbre par rôle : le vrai)
      trans: { run: 2, begaie: 2.5, trou: 2, filtre: 1.5, roll: 1, rien: 2 }, cells: [1, 2, 2, 3, 4], fill: ['roll'], phrases: { riff: 2.5, appel: 2, classique: 1.5 },
      kit: { f0: [150, 170], f1: [48, 54], dec: [.26, .34], clic: [.12, .2], drive: [1.2, 1.5], snare: ['clap'] }, kitV: { hat: ['charley', 'charley2'], hatO: ['charleyOuvert'] },
      kickT: ['909'], hatT: ['metal'], salle: [1.5, .9, 'plaque'], revB: .26, dly: 3, fb: .3, sat: 1.3, lofi: .1, bande: .2, dB: { hat: -3, hatO: -5, snare: -3, contre: -3, choeur: -3, cuivres: -2, lead: -1.5, keys: -1.5, basse: 2.5, kick: -1, vinyl: 10 },   // (salle : sans eux, 1 200 Hz de centre au 30e — tes 👍 : 130-520)
      pat: { kick: ['X...X...X...X...'], snare: ['....X.......X...', '....X.......X..x'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.xxx.x.'], hatD: 'x.xxx.xxx.xxx.xx', hatO: ['..x...x...x...x.'],
        fant: ['.......o.......o'], perc: ['oxoxoxoxoxoxoxox'],
        basse: [[[0, 0, 3], [8, 7, 3]], [[0, 0, 3], [4, 't', 3], [8, 7, 3], [12, 12, 3]]],   // l'oom-pah, puis la contrebasse qui MARCHE (i_basse)
        keys: [[[4, 2], [12, 2]], [[0, 1], [4, 2], [8, 1], [12, 2]], [[0, 1], [3, 1], [4, 2], [8, 1], [11, 1], [12, 2], [14, 1]]],   // la pompe · le stride · le stride qui s'emballe (i_keys)
        stab: [[[2, 1], [6, 1], [10, 1], [14, 1]]], arp: ['up8'],
        cuiv: [[[0, 2], [3, 1], [6, 2]], [[8, 1], [10, 2], [14, 2]]], chop: [[[0, 1], [3, 1], [6, 1]], [[8, 1], [10, 1], [11, 1], [14, 2]]] },
      noms: { vinyl: 'le gramophone (un 78-tours qui craque)', keys: 'le piano en pompe', basse: 'la contrebasse (oom-pah)', lead: 'la clarinette en entier', kick: 'la house tombe dans le gramophone', snare: 'les mains sur 2 et 4',
        clarte: 'LE PAVILLON S’OUVRE : 1925 → aujourd’hui', i_basse: 'la contrebasse se met à marcher', contre: 'la trompette bouchée', choeur: 'les voix hachées (le scat)', i_keys: 'le piano passe au stride', sig2: 'les klaxons des années 20', harmo: 'les clarinettes en tierces' },
      ordre: ['vinyl!', 'keys', 'basse', 'lead', 'hat', 'sig', 'i_filtre', 'snare', 'kick', 'pompe', 'cuivres', 'clarte', 'hatO', 'i_basse', 'contre', 'choeur', 'i_keys', 'i_frappe', 'fant', 'sig2',
        'double', 'cordes', 'i_dense', 'harmo', 'i_relance', 'modul', 'i_tambours', 'i_pulse', 'i_monte', 'final!'],
      vrais: { keys: { '@piano': 3, '@pianoQueue': 1 }, lead: { '@clarinette': 1 }, basse: { '@contrebasse': 1 }, contre: { '@trompetteSourd': 1 }, cuivres: { '@cuivres': 1 }, cordes: { '@cordes': 1 }, pluck: { '@vibraphone': 1 }, kit: { clap: 1 } } },
    // CARNAVAL D'OR — la batucada électronique (une école de samba qui entre rang par rang, sur une basse et des trompettes) : les surdos
    // (le grave sur le 2e temps, la réponse sur le 1er), la caixa en doubles croches, le ganzá, les tamborins (« teleco-teco »), les
    // repiniques (toms en rythme), le cavaquinho (partido alto), la basse de samba (la note qui ANTICIPE), les trompettes en tierces,
    // la fanfare, le trombone, LA FOULE qui chante le thème (« oh » et « HÉ ! ») ; l'agogô accordé tonique-quinte dès le 1er moteur, la
    // cuíca qui rit au 14e, l'appel du repinique avant les arrivées.
    carnaval: { nom: 'CARNAVAL D’OR', dit: 'batucada électronique (une école de samba)', titre: 'CARNAVAL D’OR', fige: true, sig: 'agogo', sig2: 'cuica',
      bpm: [100, 104], monte: [4, 6], modes: ['dorien', 'majeur'], swing: .07, reg: 66, cap: 84, pompe: .4, ferme: 3400, gainDb: 3, voixB: ['lead'],
      grilles: { dorien: ['0:m7 5:9 0:m7 5:9', '0:m7 0:m7 5:9 5:9', '0:m9 3:maj7 5:9 0:m9', '0:m7 10:6 5:9 0:m7'], majeur: ['0:maj7 9:m7 2:m7 7:7', '0:6 9:7 2:m7 7:7', '5:maj7 7:7 0:6 9:m7', '0:6 0:6 7:7 7:7'] },
      keysT: ['guitareC'], leadT: {}, basseT: ['doigts'], padT: ['doux'], pluckT: ['bois'], contreT: [], cordesT: ['ensemble'], cuivresT: [],
      trans: { appel: 3, toms: 1.5, trou: 1.5, roll: 1, rien: 2 }, cells: [1, 2, 2, 3, 4], fill: ['toms'], phrases: { classique: 2, envol: 2, appel: 1.5 },
      kit: { f0: [100, 110], f1: [58, 64], dec: [.38, .46], clic: [.1, .16], drive: [1, 1.2], snare: ['caixa'] }, percT: 'tamborim', kitV: { tomH: ['tenorH'], tomL: ['tenorB'] },
      kickT: ['surdo'], hatT: ['ganza'], salle: [1.3, .9, 'plaque'], revB: .24, dly: 3, fb: .25, sat: 1.25, dB: { snare: -6, hat: -2, perc: -1 },
      pat: { kick: ['o...X...o...X...', 'o...X...o..xX...'], snare: ['oxoXoxoXoxoXoxoX', 'oxoXoxoXoxoXoxXX'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xoxXxoxXxoxXxoxX', hatO: ['..x...x...x...x.'],
        fant: ['...o.......o....'], perc: ['H.H.H..H.H.H..H.', 'H.HLH..H.HLH..H.'], tribu: ['......L.L.....L.', '...L..L....L..LL', '......L.L..H.HLL'],
        basse: [[[0, 0, 3], [3, 7, 1], [4, 0, 4], [8, 0, 3], [11, 7, 1], [12, 0, 4]], [[0, 0, 2], [3, 7, 1], [4, 0, 2], [6, 12, 2], [8, 0, 2], [11, 7, 1], [12, 0, 2], [14, 12, 2]]],   // la note qui anticipe le surdo
        keys: [[[0, 2], [6, 2], [8, 2], [14, 2]], [[0, 1], [3, 1], [6, 2], [8, 1], [10, 1], [13, 2]], [[0, 1], [2, 1], [3, 1], [5, 1], [6, 1], [8, 1], [10, 1], [11, 1], [13, 1], [14, 1]]],   // le cavaquinho : posé · partido alto · plein
        stab: [[[2, 1], [6, 1], [10, 1], [14, 1]]], arp: ['up8'], cuiv: [[[0, 1], [3, 1], [6, 2], [10, 2]], [[0, 2], [6, 1], [8, 1], [14, 2]]] },
      noms: { hat: 'le ganzá', kick: 'LES SURDOS', perc: 'les tamborins (teleco-teco)', keys: 'le cavaquinho', basse: 'la basse de samba', snare: 'la caixa', lead: 'les trompettes', tribu: 'les repiniques',
        cuivres: 'la fanfare', harmo: 'les trompettes en tierces', contre: 'le trombone', foule: 'LA FOULE chante le thème', double: 'toute l’école à fond' },
      ordre: ['sig!', 'hat', 'kick', 'perc', 'keys', 'basse', 'snare', 'lead', 'i_filtre', 'tribu', 'clarte', 'cuivres', 'i_basse', 'sig2', 'i_frappe', 'harmo', 'fant', 'i_keys', 'contre', 'foule',
        'double', 'i_relance', 'roll', 'i_tambours', 'modul', 'i_large', 'i_pulse', 'i_monte', 'echo', 'final!'],
      vrais: { lead: { '@trompette': 1 }, contre: { '@trombone': 1 }, cuivres: { '@cuivres': 1 }, kit: {} } },
    // LE CASSE — le trip-hop de braquage (Massive Attack, Portishead, les films d'espions) : le breakbeat lent d'un vieux disque (vraie
    // grosse caisse, vieille caisse claire, vrais charleys), le clavecin en ostinato de croches, le Rhodes sur bande, la contrebasse,
    // la LIGNE ESPION (la voix intérieure qui descend d'un demi-ton par mesure : m · mM7 · m7 · m6), le thérémine qui glisse, les cordes de
    // cinéma, la trompette bouchée sur les notes-guides, les échos en noire pointée, le scratch en fin de phrase ; le coffre-fort ; au 19e
    // moteur LA POURSUITE (la batterie en double tempo, drum & bass), la sirène au loin.
    casse: { nom: 'LE CASSE', dit: 'trip-hop de braquage (qui finit en poursuite)', titre: 'LE CASSE', fige: true, sig: 'coffre', sig2: 'sirene',
      bpm: [86, 90], monte: [2, 3], modes: ['mineur', 'sombre'], modeW: { mineur: 3 }, swing: .1, reg: 68, cap: 81, pompe: .5, ferme: 2400, gainDb: 3, voixB: ['pluck', 'lead'],
      grilles: { mineur: ['0:m 0:mM7 0:m7 0:m6', '8:maj7 7:7 0:m 0:mM7', '0:m 0:mM7 0:m7 8:maj7', '5:m6 5:m6 0:m 0:mM7'], sombre: ['0:m 1:maj7 0:m 1:maj7', '0:m 0:mM7 1:maj7 0:m'] },
      keysT: ['rhodes'], leadT: { theremine: 1 }, basseT: [], padT: ['doux'], pluckT: [], contreT: [], cordesT: [],
      trans: { scratch: 3, trou: 2, filtre: 2, souffle: 1.5, rien: 2 }, cells: [2, 3, 4, 4, 6, 8], fill: ['roll'], phrases: { longues: 2, appel: 2, classique: 1 },
      kit: { f0: [110, 135], f1: [46, 52], dec: [.35, .45], clic: [.08, .14], drive: [1.3, 1.7], snare: ['acoustique'] },
      kitV: { snare: ['caisseVieille'], kick: ['grosseCaisseKit'], hat: ['charley', 'charley2'], hatO: ['charleyOuvert'] }, besoins: ['s:scratch'],
      kickT: ['acoustique'], hatT: ['bruit'], salle: [2.6, .7], revB: .34, dly: 6, fb: .4, sat: 1.5, lofi: .3, bande: .4, dB: { hat: -2, lead: -3, vinyl: 6 },
      pat: { kick: ['X......X..X.....', 'X.....x...X..x..'], snare: ['....X.......X...', '....X.......X..o'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.x.xxx.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..............x.'],
        kickD: 'X....X..X....X..', snareD: '..X...X...X...X.',   // LA POURSUITE : une mesure de 88 = deux mesures de drum & bass à 176
        fant: ['.......o.o.....o'], perc: ['oxoxoxoxoxoxoxox'],
        basse: [[[0, 0, 6], [7, 0, 1], [10, 7, 4], [14, 0, 2]], [[0, 0, 3], [3, 0, 1], [6, 7, 2], [8, 0, 3], [11, 't', 1], [14, 7, 2]]],
        keys: [[[0, 16]], [[0, 6], [8, 8]], [[0, 3], [6, 2], [8, 3], [14, 2]]], stab: [[[0, 2], [6, 2], [10, 2]]], arp: ['up8'] },
      noms: { vinyl: 'le vieux disque', arp: 'le clavecin (l’ostinato)', keys: 'le Rhodes sur bande', basse: 'la contrebasse', kick: 'LE BREAKBEAT tombe', snare: 'la vieille caisse claire', lead: 'le thérémine',
        cordes: 'les cordes de cinéma', contre: 'la trompette bouchée', echo: 'les échos', double: 'LA POURSUITE : la batterie en double tempo', toms: 'les toms de la poursuite' },
      ordre: ['vinyl!', 'arp', 'keys', 'basse', 'kick', 'snare', 'sig', 'lead', 'hat', 'i_filtre', 'cordes', 'clarte', 'contre', 'i_basse', 'fant', 'echo', 'i_frappe', 'i_keys', 'double', 'sig2',
        'roll', 'toms', 'i_relance', 'hatO', 'i_tambours', 'modul', 'i_pulse', 'i_large', 'i_monte', 'final!'],
      vrais: { pluck: { '@clavecin': 1 }, basse: { '@contrebasse': 1 }, contre: { '@trompetteSourd': 1 }, cordes: { '@cordes': 1 }, kit: {} }, transf: { keys: { tape: 20 } } } };
  // ZEPPELIN D'OR II et III (2026-10-15, Léo : « garde juste Zeppelin d'Or, j'aime beaucoup, ça fait un peu parisien, donc garde la structure ;
  // à partir de 10, que ça commence à aller un peu plus vite, mais pas juste le tempo — c'est nul quand ça devient juste plus aigu et plus
  // rapide : un truc d'intensité · mélanger le côté old school avec un ou deux instruments new wave : new wave, future, raw · laisse Zeppelin
  // d'Or et fais aussi un troisième où tu respectes juste le truc de rapidité, sur ce style-là, une musique qui évolue mieux »).
  // Les deux gardent TOUT du premier jusqu'au 9e moteur (même numéro : même mélodie, mêmes grilles, même gramophone) ; puis :
  //   · le tempo ne monte plus (`tempoFixe`, `monte` 0) et la tonalité non plus (plus de `modul` : « plus aigu ») ;
  //   · la VITESSE QU'ON SENT vient des motifs qui se resserrent, une étape par moteur choisi (`etapes`, lues par regleElements → M.etP) ;
  //   · le 10e moteur est un GRAND moment (la montée avant, `grands`).
  const Z1 = TRIO.zeppelin, Z_KD = 'X...X..xX...X..x', Z_SD = '....X..o....X.xo', Z_HD = 'xoxXxoxXxoxXxoxX';
  const Z_PAT = Object.assign({}, Z1.pat, { hatD: Z_HD, kickD: Z_KD, snareD: Z_SD });
  const Z_STRIDE = { keys: [[0, 1], [4, 2], [8, 1], [12, 2]], kick: 'X...X..xX...X..x' };   // le piano en stride, la grosse caisse qui galope
  // III — rien que l'orchestre des années folles : la contrebasse marche, puis passe en croches ; le piano en stride, puis en pompe de croches ;
  // les cuivres et les voix en rafales ; la batterie qui pousse
  TRIO.zeppelin3 = Object.assign({}, Z1, { nom: 'ZEPPELIN D’OR III', titre: 'ZEPPELIN D’OR III', dit: 'électro swing (les années folles × la house) — l’intensité dès le 10e moteur', monte: [0, 0], tempoFixe: true, grands: ['m_vite'], pat: Z_PAT,
    ordre: ['vinyl!', 'keys', 'basse', 'lead', 'hat', 'sig', 'i_filtre', 'snare', 'kick', 'm_vite', 'cuivres', 'clarte', 'hatO', 'm_stride', 'contre', 'choeur', 'm_boogie', 'i_frappe', 'fant', 'sig2',
      'double', 'cordes', 'm_pompe8', 'harmo', 'm_rafales', 'i_relance', 'i_tambours', 'i_pulse', 'i_monte', 'final!'],
    etapes: { m_vite: { hat: 'xoxoxoxoxoxoxoxo', basse: [[0, 0, 3], [4, 't', 3], [8, 7, 3], [12, 12, 3]] }, m_stride: Z_STRIDE,
      m_boogie: { basse: [[0, 0, 2], [2, 't', 2], [4, 7, 2], [6, 12, 2], [8, 7, 2], [10, 't', 2], [12, 0, 2], [14, 7, 2]] },
      m_pompe8: { keys: [[0, 1], [2, 1], [4, 1], [6, 1], [8, 1], [10, 1], [12, 1], [14, 1]] },
      m_rafales: { cuiv: [[[0, 1], [2, 1], [3, 1], [6, 2], [10, 1], [11, 1]], [[0, 1], [3, 1], [6, 1], [8, 1], [10, 1], [12, 1], [14, 2]]], chop: [[[0, 1], [2, 1], [3, 1], [6, 1]], [[8, 1], [10, 1], [11, 1], [13, 1], [14, 1]]] } },
    noms: Object.assign({}, Z1.noms, { m_vite: 'ÇA ACCÉLÈRE : la contrebasse marche, les charleys en doubles croches', m_stride: 'le piano passe au stride, la grosse caisse galope',
      m_boogie: 'la contrebasse en croches (boogie)', double: 'la batterie pousse (contretemps, roulements)', m_pompe8: 'le piano en pompe de croches (manouche)', m_rafales: 'les cuivres et les voix en rafales' }) });
  // II — le même orchestre, et DEUX instruments new wave en contraste (1983 sous 1925 : « new wave, future, raw ») : la BASSE NEW WAVE (10e) et
  // l'ARPÈGE ANALOGIQUE en doubles croches (14e) ; la caisse claire en réverbe coupée des années 80, le son qui se durcit au 25e (raw).
  // (2026-10-15, 2e jet — Léo : « le rythme 1 2 1 2 est un peu relou et pas adapté pour la new wave, retente, fais mieux » → « les deux » : la
  // basse new wave qui alternait grave-aigu en croches balancées ET le boum-tchak de fond, contrebasse sur 1 et 3, piano et mains sur 2 et 4)
  // AU 10e, LA MACHINE DE 1983 PREND LA MAIN : tout devient DROIT (plus de balancement : `swing`/`swing8` à 0 par l'étape), la batterie se
  // SYNCOPE (grosse caisse sur 1, le « et » de 2, 3, le « et » de 3 — jamais le boum-tchak), la basse new wave martèle la fondamentale en croches
  // droites (la poussée de The Cure, de Joy Division) et ne remonte à l'octave qu'en fin de mesure, la contrebasse se tait, le piano plaque ses
  // accords en 3-3-2 (la syncope des années 80) ; au 17e la contrebasse revient en contre-chant pincé sur les contretemps (1925 répond à 1983) ;
  // au 21e la batterie s'emballe (roulements de grosse caisse en fin de mesure, « Blue Monday ») ; au 23e la basse devient un riff de doubles
  // croches qui bouge (fondamentale, octave, quinte : un motif, pas une alternance).
  TRIO.zeppelin2 = Object.assign({}, Z1, { nom: 'ZEPPELIN D’OR II', titre: 'ZEPPELIN D’OR II', dit: 'électro swing × new wave (1925 sur un moteur de 1983)', monte: [0, 0], tempoFixe: true, grands: ['nw'], gateDe: 'nw',
    pluckT: ['scie'], voixB: ['lead'], vrais: Object.assign({}, Z1.vrais, { pluck: {} }), pat: Object.assign({}, Z_PAT, { arp: ['up16'], kickD: 'X.....X.X.X...xx', snareD: '....X.......X.xo', hatD: 'xoxoXoxoxoxoXoxo' }),
    ordre: ['vinyl!', 'keys', 'basse', 'lead', 'hat', 'sig', 'i_filtre', 'snare', 'kick', 'nw', 'cuivres', 'clarte', 'hatO', 'arp', 'contre', 'choeur', 'm_retour', 'i_frappe', 'fant', 'sig2',
      'double', 'cordes', 'm_nw2', 'harmo', 'i_sature', 'i_relance', 'i_tambours', 'i_pulse', 'i_monte', 'final!'],
    etapes: {
      nw: { swing: 0, swing8: 0, kick: 'X.....X.X.X.....', snare: '....X.......X..o', hat: 'xoxoxoxoxoxoxoxo', hatO: '..............x.', fant: '..o.......o.....', basse: [],
        keys: [[0, 2], [3, 2], [6, 2], [8, 2], [11, 2], [14, 2]], nw: [[0, 0], [2, 0], [4, 0], [6, 0], [8, 0], [10, 0], [12, 0], [14, 12]], nwLen: 1.7 },
      m_retour: { basse: [[3, 12, 2], [6, 7, 2], [11, 12, 2], [14, 7, 1]] },
      m_nw2: { nw: [[0, 0], [2, 0], [3, 0], [4, 12], [6, 0], [7, 0], [8, 0], [10, 0], [11, 7], [12, 0], [14, 12], [15, 7]], nwLen: .9 } },
    noms: Object.assign({}, Z1.noms, { nw: 'LA MACHINE DE 1983 PREND LA MAIN : la basse new wave en croches droites, la batterie syncopée, le piano en 3-3-2 (plus de balancement)',
      arp: 'l’arpège analogique en doubles croches (new wave)', m_retour: 'la contrebasse revient en contre-chant pincé (1925 répond à 1983)', double: 'la batterie s’emballe (roulements de grosse caisse)',
      m_nw2: 'la basse new wave devient un riff de doubles croches (future)', i_sature: 'le son se durcit (raw)' }) });
  for (const id in TRIO) { const o = TRIO[id]; COULEURS[id] = o; VRAIS_STYLE[id] = o.vrais || {}; UNIVERS[id] = { u: { acoustique: 1 }, f: { [/^zeppelin/.test(id) ? 'swing' : id]: 1 } };
    TRANSF_STYLE[id] = o.transf || {}; SIG_POIDS[id] = { [o.sig]: 1 }; FAMG[id] = id; }
  DA_STYLES.trio = Object.keys(TRIO);
  // L'HYBRIDE : le CORPS de A (rythme, tempo, basse, forme, l'ordre où les choses entrent), l'ÂME de B (accords, instruments, mélodies),
  // la retouche de l'un des deux (pp). Les éléments de couleur de A (clavier, nappe, mélodie, cordes, cuivres…) prennent, place pour
  // place, ceux de B : la courbe de A, la palette de B. `w` : B est du dubstep et A non → la wob de B fait le drop de A.
  const COUL9 = new Set(['keys', 'pad', 'lead', 'arp', 'contre', 'cordes', 'choeur', 'cuivres', 'stab', 'cloche', 'vinyl', 'harmo', 'octave', 'echo', 'foule', 'i_keys']);
  function hybrideDe(a, b, pp, w) {
    const id = 'hyb:' + a + '+' + b + '+' + pp + (w ? '+w' : ''); if (COULEURS[id]) return id;
    const A = COULEURS[a], B = COULEURS[b], Pp = pp === 'a' ? A : B, nu = e => e.replace('!', '');
    const colA = A.ordre.map(nu).filter(x => COUL9.has(x)), colB = B.ordre.map(nu).filter(x => COUL9.has(x)), map = {}, setA = new Set(A.ordre.map(nu)), setB = new Set(B.ordre.map(nu));
    const extraB = colB.filter(x => !setA.has(x)); let k9 = 0; colA.forEach(x => { if (!setB.has(x) && k9 < extraB.length) map[x] = extraB[k9++]; });   // (le clavier reste le clavier : seules les couleurs que B n'a pas prennent celles de B)
    const pris = new Set(), ordre = [], reserve = extraB.slice(k9).concat(colA, ECH_REMPL, ['i_filtre', 'i_frappe', 'i_dense', 'i_relance', 'i_tambours', 'i_pulse', 'i_monte', 'i_large']);
    A.ordre.forEach(e => { if (e === 'final!') return; const pin = e.endsWith('!'); let y = map[nu(e)] || nu(e);
      if (w && y === 'basse') y = 'wob';
      if (pris.has(y)) y = reserve.find(x => !pris.has(x));
      if (!y) return; pris.add(y); ordre.push(y + (pin ? '!' : '')); });
    while (ordre.length < 29) { const x = reserve.find(z => !pris.has(z)); if (!x) break; pris.add(x); ordre.push(x); }
    if (w && !pris.has('sub')) { const k = ordre.findIndex(x => /^i_(basseOct|large|keys)$/.test(x)); if (k >= 0) ordre[k] = 'sub'; else ordre.splice(ordre.length - 1, 0, 'sub'); }
    while (ordre.length > 29) ordre.splice(ordre.length - 2, 1); ordre.push('final!');
    const ouv = (A.ouv || [[nu(A.ordre[0]), nu(A.ordre[1]), nu(A.ordre[2])]]).map(t3 => { let v = t3.map(x => (w && x === 'basse') ? 'wob' : map[x] || x); if (new Set(v).size !== 3) v = t3.slice();
      const k = v.findIndex(x => OUVRE.includes(x)); if (k > 0) { const [y] = v.splice(k, 1); v.unshift(y); } return v; });
    COULEURS[id] = Object.assign({}, A, {
      nom: a === b ? A.nom : A.nom + ' × ' + B.nom, dit: a === b ? A.dit : 'le rythme ' + A.dit + ', les couleurs ' + B.dit, hyb: [a, b, pp],
      modes: B.modes.slice(), grilles: B.grilles, modeW: B.modeW, keysT: B.keysT, leadT: B.leadT, padT: B.padT, pluckT: B.pluckT, contreT: B.contreT, cordesT: B.cordesT, voixB: B.voixB,
      basseT: A.dub ? A.basseT : B.basseT, reg: B.reg, cap: B.cap, phrases: B.phrases, balaye: B.balaye, basseDb: B.basseDb,
      pat: Object.assign({}, A.pat, { arp: B.pat.arp || A.pat.arp, chop: B.pat.chop || A.pat.chop, cuiv: B.pat.cuiv || A.pat.cuiv }),
      ordre, ouv, dub: A.dub || (w ? B.dub : null),
      kit: Pp.kit, kickT: Pp.kickT, hatT: Pp.hatT, salle: Pp.salle, revB: Pp.revB, dly: Pp.dly, fb: Pp.fb, sat: Pp.sat, lofi: Pp.lofi || 0, bande: Pp.bande || 0, gate: Pp.gate || 0, ferme: Pp.ferme });
    UNIVERS[id] = UNIVERS[b]; VRAIS_STYLE[id] = Object.assign({}, VRAIS_STYLE[b] || {}, { kit: (VRAIS_STYLE[a] || {}).kit || {} }); TRANSF_STYLE[id] = TRANSF_STYLE[b] || {};
    const sa = SIG_POIDS[a] || {}, sb = SIG_POIDS[b] || {}, sg = {}; for (const k in Object.assign({}, sa, sb)) sg[k] = ((sa[k] || 0) + (sb[k] || 0)) / 2; SIG_POIDS[id] = sg;
    return id; }
  // L'ÉNERGIE de chaque genre (0 = flotte · 1 = tranquille · 2 = danse · 3 = à fond) : un croisement garde une énergie voisine, et un tempo
  // compatible (le même, son double ou sa moitié, à 25 % près) — sinon il devient rare : le rythme de l'un doit pouvoir porter l'âme de l'autre
  const ENER = { ambient: 0, vapor: 0, neosoul: 1, bossa: 1, lofi: 1, jazz: 1, reggae: 1, dubroots: 1, boombap: 1, country: 1, chillstep: 1, pop: 1, motown: 1, afropop: 1, amapiano: 1,
    tango: 1, cumbia: 1, flamenco: 1, western: 1, reve: 1, luxe: 1, dubmelo: 2, funk: 2, house: 2, disco: 2, afrobeat: 2, salsa: 2, synthpop: 2, neon: 2, velours: 2, garage: 2, dembow: 2,
    drift: 2, zef: 2, techno: 2, drill: 2, dubuk: 2, rock70: 2, stade: 2, epique: 2, pixel: 2, trance: 3, touge: 3, dnb: 3, jungle: 3, footwork: 3, jersey: 3, riddim: 3, brostep: 3,
    colorbass: 3, punk: 3, metal: 3, surf: 3, rock: 3, balkan: 3 };
  const accord9 = (a, b) => { const ea = ENER[a] == null ? 2 : ENER[a], eb = ENER[b] == null ? 2 : ENER[b], de = Math.abs(ea - eb), ba = (COULEURS[a].bpm[0] + COULEURS[a].bpm[1]) / 2, bb = (COULEURS[b].bpm[0] + COULEURS[b].bpm[1]) / 2;
    const d = Math.min(...[.5, 1, 2].map(k => Math.abs(Math.log2(ba * k / bb)))); return [1, .6, .2, .05][de] * (d < .25 ? 1 : d < .45 ? .45 : .15); };
  function choixHybride(W, n9) {
    // (2026-10-15, pôle SON) LA COULEUR ENREGISTRÉE : l'hybride dépend de la mémoire des parties (HISTO) — rejouée sans elle, une musique 👍 en devenait
    // une AUTRE (CRISTAL D'ARGENT sortait MOTEUR DE PLATINE). O.style rend celle de l'avis, en tirant les mêmes nombres que le tirage d'origine.
    const F9 = OPT && OPT.n === n9 && typeof OPT.style === 'string' && /^hyb:([a-z0-9]+)\+([a-z0-9]+)\+([ab])(\+w)?$/.exec(OPT.style);
    if (F9 && COULEURS[F9[1]] && COULEURS[F9[2]]) { const a = F9[1], b = F9[2]; T(); if (a === b) { T(); return hybrideDe(a, a, 'a', false); }
      T(); T(); T(); if (!COULEURS[a].dub && !!COULEURS[b].dub) T(); return hybrideDe(a, b, F9[3], !!F9[4]); }   // (v5.0) le CORPS et l'ÂME : jamais un parent des trois dernières musiques, deux familles différentes (presque toujours)
    const ids = DA_STYLES.hybride, recents = (HISTO.couleur || []).slice(0, 3).flatMap(x => String(x).startsWith('hyb:') ? x.slice(4).split('+').slice(0, 2) : [x]);
    const wc = W.couleur ? adoucit(W.couleur) : {}, poids = (k, ex) => (recents.includes(k) || k === ex ? 0 : 1) * (wc[k] != null ? wc[k] : 1);
    const wA = {}; ids.forEach(k => wA[k] = poids(k)); const a = tpw(ids, wA);
    if (T() < .2) return hybrideDe(a, a, 'a', false);   // un genre PUR, une partie sur cinq
    const wB = {}; ids.forEach(k => wB[k] = poids(k, a) * (FAMG[k] === FAMG[a] ? .15 : 1) * accord9(a, k)); const b = tpw(ids, wB);
    return hybrideDe(a, b, T() < .55 ? 'a' : 'b', !COULEURS[a].dub && !!COULEURS[b].dub && T() < .45); }
  const DEF = { tribu: ['L.L.LL.L.L.LL.L.'], fant: ['.......o.......o'], perc: ['oxoxoxoxoxoxoxox'], hatO: ['..x...x...x...x.'], stab: [[[3, 1], [6, 1], [11, 1], [14, 1]]], arp: ['updown16'] };
  const NOM_KEYS = { rhodes: 'le Rhodes', piano: 'le piano', clav: 'le clavinet', harpe: 'la harpe de verre', dx: 'le piano électrique FM', orgue: 'l’orgue', guitare: 'la guitare rythmique saturée', guitareC: 'la guitare grattée', puce: 'les accords 8 bits', wurli: 'le Wurlitzer' };
  const NOM_LEAD = { scie: 'synthé scie', carre: 'synthé carré', talkbox: 'talkbox', verre: 'synthé de verre', sifflet: 'sifflet', cuivre: 'cuivre synthétique', flute: 'flûte',
    saxo: 'saxophone de minuit', theremine: 'thérémine', guitare: 'guitare claire', guitareSat: 'guitare saturée', steel: 'steel drum', kalimba: 'kalimba', chip: 'puce 8 bits', cowbell: 'cloche de vache (phonk)', accordeon: 'accordéon' };
  const NOM_BASSE = { tri: 'la basse triangle (8 bits)', roule: 'la basse qui roule', funk: 'la basse funk', 808: 'la 808 qui glisse', acid: 'la basse acid', reese: 'la reese', slap: 'la basse slap', '808dur': 'la 808 saturée', sub808: 'la sous-basse qui glisse', doigts: 'la basse électrique aux doigts', logdrum: 'le log drum (amapiano)' };
  const est808 = b => b === '808' || b === '808dur' || b === 'sub808';
  const MOTS1 = ['NUIT', 'COMÈTE', 'MIRAGE', 'VELOURS', 'CHROME', 'ORBITE', 'PLUIE', 'FEU', 'LUNE', 'JACKPOT', 'DIAMANT', 'TURBO', 'NÉON', 'RUBIS', 'PANTHÈRE', 'TONNERRE',
    'ÉCLIPSE', 'SAPHIR', 'VERTIGE', 'FLAMME', 'COBRA', 'RIVIERA', 'PALACE', 'FRISSON', 'PULSAR', 'TEMPÊTE', 'MINUIT', 'BOULEVARD', 'ASPHALTE', 'SILLAGE'];
  const MOTS2 = ['CHROME', 'VELOURS', 'NÉON', 'MINUIT', 'SATIN', 'CRISTAL', 'FEU', 'SOIE', 'LUXE', 'VITESSE', 'PLATINE', 'JADE', 'TONNERRE', 'OR', 'ARGENT', 'OPALE', 'NACRE', 'ÉMERAUDE'];
  const titreDe = () => { const a = tp(MOTS1); if (T() < .25) return a + ' ' + tp(['3000', 'ULTRA', 'DELUXE', 'GT', 'NOVA', 'PRIME', 'INFINI']); const b = tp(MOTS2); return a + (/^[AEIOUÉ]/.test(b) ? ' D’' : ' DE ') + b; };

  // ================================================================ LA COMPOSITION D'UNE MUSIQUE (depuis son numéro)
  // LA PHRASE : question (mesures 1-4) / réponse (5-8). Chaque note : [pas 0-127, degré, durée, rôle] — rôle 'o' cadence OUVERTE (une note
  // de l'accord qui n'est pas la fondamentale), 'f' cadence FERMÉE (la fondamentale), 's' le SOMMET.
  // LES FORMES DE PHRASE (v3.4 : « c'est encore un peu toujours la même ») — la grammaire reste (la question en suspens, la réponse qui se
  // pose sur la fondamentale), la silhouette change : classique (motif, marche, sommet en 7e mesure) · riff (un crochet de deux temps redit,
  // la boucle du phonk et de l'eurobeat) · appel (un appel, un silence qui répond) · envol (le motif grimpe d'une marche par mesure, puis
  // redescend) · longues (un hymne en notes tenues)
  const NOM_PHRASE = { classique: 'motif, marche et sommet', riff: 'un riff redit', appel: 'appel et silence', envol: 'le motif qui grimpe', longues: 'un hymne en notes tenues' };
  function phrase(rnd, cells, forme) {
    const brefs = cells.filter(x => x <= 3), ph = [];
    const motif = (lim, d0) => { const mot = []; let st = rnd() < .6 ? 0 : 2, d = d0 != null ? d0 : Math.floor(rnd() * 3); const n = 2 + Math.floor(rnd() * 3);
      for (let k = 0; k < n && st < lim; k++) { const len = Math.min(brefs[Math.floor(rnd() * brefs.length)] || 2, lim - st); mot.push([st, d, len]); st += len; d = clamp(d + [-1, 1, 1, 2, -1, -2][Math.floor(rnd() * 6)], -1, 4); }
      return mot; };
    const pose = (m, mt, dd, off) => mt.forEach(([s0, d0, l]) => ph.push([m * 16 + (off || 0) + s0, clamp(d0 + dd, -2, 5), l, '']));
    if (forme === 'riff') { const mot = motif(8), v = rnd() < .5 ? 1 : -1;   // deux temps, redits ; la 3e mesure répond un cran à côté
      for (let m = 0; m < 3; m++) { pose(m, mot, 0, 0); pose(m, mot, m === 2 ? v : 0, 8); }
      pose(3, mot, 0, 0); ph.push([56, rnd() < .5 ? 2 : 1, 8, 'o']);
      for (let m = 4; m < 6; m++) { pose(m, mot, 0, 0); pose(m, mot, m === 5 ? v : 0, 8); }
      pose(6, mot, 2, 0); ph.push([104, 5, 4, 's']); ph.push([108, 3, 4, '']); ph.push([112, 0, 8, 'f']); return ph; }
    if (forme === 'appel') { const mot = motif(8), r9 = rnd() < .5 ? 1 : 2;   // l'appel… et le silence qui répond
      pose(0, mot, 0, 0); pose(0, mot, r9, 8); ph.push([16, rnd() < .5 ? 2 : 1, 8, 'o']);
      pose(2, mot, r9, 0); pose(2, mot, r9 + 1, 8); ph.push([48, 3, 4, '']); ph.push([52, 1, 8, 'o']);
      pose(4, mot, 0, 0); pose(4, mot, r9, 8); ph.push([80, 4, 8, '']);
      ph.push([96, 5, 6, 's']); ph.push([102, 4, 2, '']); ph.push([104, 2, 8, '']); ph.push([112, 0, 8, 'f']); return ph; }
    if (forme === 'envol') { const mot = motif(12, 0);   // une marche de plus à chaque mesure, le sommet, puis la descente
      pose(0, mot, 0); pose(1, mot, 1); pose(2, mot, 2); ph.push([48, rnd() < .5 ? 4 : 3, 12, 'o']);
      pose(4, mot, 3); pose(5, mot, 2); ph.push([96, 5, 4, 's']); ph.push([100, 3, 4, '']); ph.push([104, 2, 4, '']); ph.push([108, 1, 4, '']); ph.push([112, 0, 8, 'f']); return ph; }
    if (forme === 'longues') { const d0 = Math.floor(rnd() * 2), j = () => (rnd() < .3 ? (rnd() < .5 ? 1 : -1) : 0), a9 = rnd() < .5 ? 6 : 8;   // l'hymne : deux notes par mesure
      const P2 = (m, x, y) => { ph.push([m * 16, clamp(x, -2, 5), a9, '']); ph.push([m * 16 + a9, clamp(y, -2, 5), 16 - a9, '']); };
      P2(0, d0, d0 + 1); P2(1, d0 + 2, d0 + 1 + j()); P2(2, d0 + 3, d0 + 2 + j()); ph.push([48, rnd() < .5 ? 2 : 1, 16, 'o']);
      P2(4, d0 + 1, d0 + 2); P2(5, d0 + 3, d0 + 4 + j()); ph.push([96, 5, 8, 's']); ph.push([104, 3, 8, '']); ph.push([112, 0, 16, 'f']); return ph; }
    const mot = []; let st = rnd() < .6 ? 0 : 2, d = Math.floor(rnd() * 3); const n = 2 + Math.floor(rnd() * 3);   // classique
    for (let k = 0; k < n && st < 8; k++) { const len = Math.min(brefs[Math.floor(rnd() * brefs.length)] || 2, 8 - st); mot.push([st, d, len]); st += len; d = clamp(d + [-1, 1, 1, 2, -1, -2][Math.floor(rnd() * 6)], -1, 4); }
    const marche = rnd() < .5 ? 1 : -1;
    pose(0, mot, 0); pose(1, mot, marche);                                          // le motif, puis sa marche
    if (rnd() < .5) pose(2, mot, 2 * marche); else pose(2, mot.slice(0, Math.max(1, mot.length - 1)), -marche);
    ph.push([3 * 16, rnd() < .5 ? 2 : 1, rnd() < .5 ? 8 : 6, 'o']);                 // la QUESTION reste en suspens
    pose(4, mot, 0); pose(5, mot, rnd() < .5 ? marche : 0);
    ph.push([6 * 16, 5, 4, 's']); ph.push([6 * 16 + 4, 4, 2, '']); ph.push([6 * 16 + 8, 3, 4, '']); ph.push([6 * 16 + 12, 1, 4, '']);   // le SOMMET, puis la descente
    ph.push([7 * 16, 0, 8, 'f']);                                                   // la RÉPONSE se pose sur la fondamentale
    return ph;
  }
  function phraseDeveloppee(ph, rnd) {   // un thème aimé, repris : transposé, renversé ou à rebours (le rythme et les cadences restent)
    const k = Math.floor(rnd() * 3), d0 = ph[0][1], degs = ph.map(x => x[1]);
    return ph.map(([st, d, l, r], i) => [st, r ? d : clamp(k === 0 ? d + (rnd() < .5 ? 1 : -1) : k === 1 ? 2 * d0 - d : degs[degs.length - 1 - i], -2, 5), l, r]);
  }
  function ordreDe(C, Mx) {
    if (C.fige) return C.ordre.map(e => e.replace('!', '')).slice(0, 30);   // (trio) l'ordre ÉCRIT : chaque moteur est une marche choisie
    const pris = new Set(), o = [];
    const ouv = C.ouv ? tp(C.ouv) : null;   // L'OUVERTURE : les trois premiers moteurs tirés (v3.4) — le reste de l'échelle suit
    (ouv ? ouv.map((x, k) => k ? x : x + '!').concat(C.ordre.map(e => e === 'final!' ? e : e.replace('!', ''))) : C.ordre)
      .forEach(e => { const pin = e.endsWith('!'), id = e.replace('!', ''); if (pris.has(id)) return; pris.add(id); o.push({ id, pin }); });
    // LA SIGNATURE entre tôt (5e-8e), la 2e plus tard (17e-22e) ; elles prennent la place d'éléments discrets
    const ote = ids => { for (const id of ids) { const k = o.findIndex(x => x.id === id && !x.pin); if (k >= 0) { o.splice(k, 1); return; } } };
    ote(['cloche', 'perc', 'stab', 'harmo', 'hatO', 'cordes']); o.splice(4 + Math.floor(T() * 4), 0, { id: 'sig', pin: true });
    if (Mx.sig2) { ote(['cloche', 'perc', 'harmo', 'stab', 'roll', 'choeur', 'cordes']); o.splice(16 + Math.floor(T() * 6), 0, { id: 'sig2', pin: true }); }
    for (let k = 1; k < o.length - 2; k++) if (!o[k].pin && !o[k + 1].pin && T() < .3) { const x = o[k]; o[k] = o[k + 1]; o[k + 1] = x; k++; }
    const deplace = (id, ok, ou) => { const k = o.findIndex(x => x.id === id); if (k < 0 || ok(k)) return; const [x] = o.splice(k, 1); o.splice(ou, 0, x); };
    // LA COURBE (v3.6) : les grands moments tirés (voir l'en-tête)
    const place = (id, a9, b9) => { const k = o.findIndex(x => x.id === id); if (k < 0) return; const [x] = o.splice(k, 1); o.splice(Math.min(o.length, a9 + Math.floor(T() * (b9 - a9 + 1))), 0, x); };
    const lt = T(), kt9 = T(), kl = o.findIndex(x => x.id === 'lead'), kk = o.findIndex(x => x.id === 'kick');
    if (lt < .25 && kl > 0) place('lead', 8, 11); else deplace('lead', k => k <= 7, 4 + Math.floor(T() * 4));
    if (kt9 < .25 && kk > 0 && kk < 8 && !C.dub) place('kick', 8, 11);
    place('clarte', 9, 17); place('double', 15, 23);
    if (C.dub) { place('wob', 7, 10); const ki = o.findIndex(x => x.id === 'kick'); let kw = o.findIndex(x => x.id === 'wob'); if (ki > kw) { const [x] = o.splice(ki, 1); o.splice(kw, 0, x); kw++; }   // le beat d'abord, PUIS le drop
      const ks = o.findIndex(x => x.id === 'sub'); if (ks > kw + 1) { const [x] = o.splice(ks, 1); o.splice(kw + 1, 0, x); }   // le sous-grave arrive avec la wob (au drop)
      if (!C.dub.growlTot) place('growl', 16, 21); }   // LE DROP (dubstep) : la wob vers le 8e-11e moteur, le growl au 2e drop
    if (T() < .3) { const k = o.findIndex(x => x.id === 'modul'), alt = ['i_large', 'ride', 'perc', 'sub', 'harmo'].find(id => !o.some(x => x.id === id)); if (k >= 0 && alt) o[k] = { id: alt, pin: false }; }
    else place('modul', 22, 27);
    deplace('final', k => k === o.length - 1, o.length - 1);
    return o.slice(0, 30).map(x => x.id);
  }
  const estVamp = spec => new Set(spec.split(' ')).size <= 2;
  const FORMES = [['A', 'A2', 'B', 'C'], ['A', 'B', 'A2', 'C'], ['A', 'A2', 'B', 'B2'], ['A', 'B', 'C', 'A2'], ['A', 'A2', 'C', 'B']];
  const pese = (o, e) => { const r = {}; for (const k in o) r[k] = o[k] > 1 ? Math.pow(o[k], e) : o[k]; return r; };   // (le mode : les goûts penchent encore moins)
  const adoucit = o => { const r = {}; for (const k in o) r[k] = o[k] > 1 ? Math.sqrt(o[k]) : o[k]; return r; };   // les goûts penchent, ils n'enferment pas
  function compose(n, W) {
    W = W || GOUTS || {}; T = graine(n);
    const forc9 = OPT && OPT.n === n && typeof OPT.style === 'string' && !/^hyb:/.test(OPT.style) && COULEURS[OPT.style] ? OPT.style : null;   // (trio) O.style choisit le morceau
    const ids9 = DA_STYLES[da] || COUL_IDS, cid = forc9 || (da === 'hybride' ? choixHybride(W, n) : tpw(ids9, W.couleur ? adoucit(W.couleur) : null)), C = COULEURS[cid], modeN = tpw(C.modes, (o9 => { if (C.modeW) for (const k in C.modeW) o9[k] = (o9[k] == null ? 1 : o9[k]) * C.modeW[k]; return o9; })(W.mode ? pese(W.mode, .35) : {})), ton = Math.floor(T() * 12);
    const Mx = { n, cid, C, modeN, ton, W, phr: 0, sec: 'A', swing: C.swing };
    const src = C.grilles[modeN].slice(), wv = W.vamp != null ? W.vamp : 1; const g3 = [];
    for (let k = 0; k < 3 && src.length; k++) { const x = tpw(src, { v: wv }, x9 => estVamp(x9) ? 'v' : 'n'); src.splice(src.indexOf(x), 1); g3.push(x); }
    Mx.grillesSpec = g3; Mx.grilles = g3.map(s => menes(s.split(' '), Mx)); Mx.grilleF = menes(tp(FREN_GRILLES).split(' '), Mx, 'sombre');
    Mx.vamp = g3.some(estVamp);
    const aimes = (W.themes || []).filter(x => Array.isArray(x) && x.length > 3 && Array.isArray(x[0]) && x[0].length >= 4);
    Mx.themeAime = aimes.length > 0 && T() < .3;
    const pf = C.phrases || { classique: 1 }, pk9 = Object.keys(pf), pw = {}; pk9.forEach(k => pw[k] = pf[k] * (W.phrase && W.phrase[k] != null ? W.phrase[k] : 1));
    Mx.phF = tpw(pk9, pw); const pk2 = pk9.filter(k => k !== Mx.phF); Mx.phFB = pk2.length ? tpw(pk2, pw) : Mx.phF;   // le couplet prend une AUTRE forme
    Mx.motifs = [Mx.themeAime ? phraseDeveloppee(tp(aimes), T) : phrase(T, C.cells, Mx.phF), phrase(T, C.cells, Mx.phFB), phrase(T, C.cells, Mx.phF)];
    Mx.bpm0 = Math.round(tr(C.bpm[0], C.bpm[1]));
    if (W.bpm > 40) { let b9 = W.bpm, mil = (C.bpm[0] + C.bpm[1]) / 2; while (b9 < mil * .75) b9 *= 2; while (b9 > mil * 1.5) b9 /= 2; Mx.bpm0 = Math.round(Mx.bpm0 + (clamp(b9, C.bpm[0] - 4, C.bpm[1] + 4) - Mx.bpm0) * .3); } Mx.bpm1 = Math.round(Mx.bpm0 * (1 + tr(C.monte[0], C.monte[1]) / 100));
    Mx.patL = {}; Mx.pat = {};
    for (const k of ['kick', 'snare', 'hat', 'hatD', 'hatO', 'fant', 'perc', 'tribu', 'basse', 'keys', 'stab', 'arp']) { const L = C.pat[k] || DEF[k]; Mx.patL[k] = L;
      Mx.pat[k] = typeof L === 'string' ? L : (k === 'basse' || k === 'keys') && L.length > 1 ? tp(L.slice(0, -1)) : tp(L); }   // la variante la plus active attend sa marche (i_basse, i_keys)
    Mx.forme = tp(FORMES); Mx.voixB = tp(C.voixB || ['pluck', 'pluck', 'lead']);
    const K = C.kit;
    Mx.kit = { f0: tr(...K.f0), f1: tr(...K.f1), dec: tr(...K.dec), clic: tr(...K.clic), drive: tr(...K.drive), snare: tpw(K.snare, W.snare), riser: tpw(['souffle', 'ton'], W.riser),
      cm: tr(1.1, 1.55), hm: tr(1.45, 2.1), kt: tpw(['rond', 'sec', 'boum'], W.kick), kickT: tpw(C.kickT || ['sine'], W.kickT), hatT: tpw(C.hatT || ['metal'], W.hatT), sf: tr(170, 220), bp: tr(1300, 2400), sdec: tr(.14, .24),
      hp: tr(7000, 9000), odec: tr(.22, .32), pf: tr(200, 250) };
    if (Mx.kit.kt === 'sec') { Mx.kit.dec *= .75; Mx.kit.clic *= 1.6; } else if (Mx.kit.kt === 'boum') { Mx.kit.dec *= 1.3; Mx.kit.clic *= .6; Mx.kit.f1 *= .92; }   // la grosse caisse : ronde · sèche · boum
    if (C.fige && Mx.kit.kt === 'boum') { Mx.kit.dec /= 1.3; Mx.kit.f1 /= .92; }   // (trio) jamais de « boum » : le grave court (la règle des basses du 15/10)
    Mx.kit.percT = C.percT || null;   // (trio) les tamborins du CARNAVAL
    // L'UNIVERS (v3.9) : électronique · hybride (un héros vrai) · acoustique (une famille de vrais) — puis chaque rôle choisit DANS cet univers
    const UV = UNIVERS[cid] || { u: { electro: 1 }, f: { orchestre: 1 } }; Mx.univers = tpw(Object.keys(UV.u), Object.fromEntries(Object.keys(UV.u).map(k => [k, UV.u[k] * (W.univers && W.univers[k] != null ? W.univers[k] : 1)])));
    Mx.famille = tpw(Object.keys(UV.f), UV.f); const FAM = new Set(FAMILLES[Mx.famille] || []); Mx.heros = Mx.univers === 'hybride' ? tp(['lead', 'lead', 'keys']) : null;
    const VS = VRAIS_STYLE[cid] || {}, role = (base, add, Wr, nomRole) => { const w = {}; (Array.isArray(base) ? base : Object.keys(base)).forEach(k => w[k] = Array.isArray(base) ? 1 : base[k]);
      for (const k in (add || {})) w[k] = add[k]; const ks9 = Object.keys(w); ks9.forEach(k => { if (Wr && Wr[k] != null) w[k] *= Wr[k]; });
      const vrai = k => k[0] === '@', dans = k => FAM.has(k.slice(1));
      const w2 = Object.assign({}, w);
      ks9.forEach(k => { if (Mx.univers === 'electro') { if (vrai(k)) w2[k] = 0; }
        else if (Mx.univers === 'acoustique') { if (vrai(k)) { if (!dans(k)) w2[k] = 0; } else w2[k] *= .06; }
        else { if (vrai(k) && (nomRole !== Mx.heros || !dans(k))) w2[k] = 0; if (!vrai(k) && nomRole === Mx.heros) w2[k] *= .05; } });
      return ks9.some(k => w2[k] > 0) ? tpw(ks9, w2) : tpw(ks9.filter(k => !vrai(k)).length ? ks9.filter(k => !vrai(k)) : ks9, w); };
    const fois = (o, k9) => { if (!o) return o; const r = {}; for (const k in o) r[k] = o[k] * k9; return r; };   // la mélodie et le clavier : les vrais d'abord
    Mx.tim = { keys: role(C.keysT, fois(VS.keys, 2), W.keys, 'keys'), lead: role(C.leadT, fois(VS.lead, 3), W.lead, 'lead'), basse: role(C.basseT, VS.basse, W.basse, 'basse'), pad: role(C.padT || ['scie', 'doux', 'verre', 'voix'], VS.pad, W.pad, 'pad'),
      pluck: role(C.pluckT || ['verre', 'scie', 'fm', 'puce', 'bois'], VS.pluck, W.pluck, 'pluck'), contre: role(C.contreT || ['violon', 'voix', 'orgue'], VS.contre, W.contre, 'contre'),
      cordes: role(C.cordesT || ['ensemble', 'synth'], VS.cordes, W.cordes, 'cordes'), cuivres: role(C.cuivresT || ['synth'], VS.cuivres, W.cuivres, 'cuivres'), voyC: tp(['oh', 'ah', 'ou']), chAtt: C.pat.chop ? .015 : .55, padFc: tr(1300, 2400), padAtt: tr(.2, .5), padLarge: tr(9, 16), ksEclat: tr(.45, .62),
      cr: tp([2.76, 3.5, 4.2]), d808: tr(1, 1.4), sfc: tr(2200, 3400) };
    { const TS = TRANSF_STYLE[cid] || {}; Mx.transf = {}; for (const r of ['keys', 'pad', 'lead']) { const w = Object.assign({ aucun: 3.5 }, TS[r] || {}), x = tpw(Object.keys(w), w); if (x !== 'aucun') Mx.transf[r] = x; } }
    { const KV = VS.kit || {}; Mx.kitV = {}; Mx.vraisF = [];   // LE KIT RÉEL (une partie sur …) et LA RETOUCHE des vrais instruments
      if (T() < (KV.snare || 0)) Mx.kitV.snare = tp([['caisseMod1'], ['caisseMod2'], ['caisse1'], ['caisse2'], ['caisseVieille'], ['caisseMod1', 'caisseMod2']]);
      else if (Mx.kit.snare === 'clap' && T() < (KV.clap || 0)) Mx.kitV.snare = tp([['clap1', 'clap2'], ['clapSeul'], ['clap1', 'clap2', 'clapSeul']]);   // les vraies mains
      if (T() < (KV.kick || 0)) Mx.kitV.kick = tp([['grosseCaisse', 'grosseCaisse2'], ['grosseCaisseKit']]);
      if (T() < (KV.toms || 0)) { const ti = cid === 'epique' && Mx.famille === 'orchestre' && T() < .6; Mx.kitV.tomH = [ti ? 'timbale3' : 'tenorH']; Mx.kitV.tomL = [ti ? 'timbale1' : 'tenorB']; }
      if (T() < (KV.perc || 0)) { Mx.kitV.percH = tp([['conga', 'quinto'], ['bongoH'], ['claves'], ['boisH'], ['cajonH'], ['darbukaH'], ['woodblock']]); Mx.kitV.percL = tp([['congaTape'], ['bongoB'], ['boisB'], ['cajonB'], ['darbukaB'], ['tambourCadre']]);
        Mx.kitV.shaker = tp([['shaker1', 'shaker2'], ['tambourinSec'], ['cabasa']]); }
      if (T() < (KV.hat || 0)) { Mx.kitV.hat = tp([['charley', 'charley2'], ['charley', 'charley2'], ['shaker1', 'shaker2'], ['cabasa'], ['tambourinSec'], ['grelots']]); if (Mx.kitV.hat[0] === 'charley') Mx.kitV.hatO = ['charleyOuvert']; }
      if (T() < (KV.crash || 0)) Mx.kitV.crash = ['crash'];
      if (T() < (KV.riser || 0)) Mx.kitV.riser = tp([['cymbaleMontee'], ['cymbaleMontee2'], ['cymbaleMontee4']]);
      const RT = VS.retouche || { aucune: 1 }; Mx.retouche = tpw(Object.keys(RT), Object.assign({}, RT, W.retouche ? Object.fromEntries(Object.keys(RT).map(k => [k, RT[k] * (W.retouche[k] != null ? W.retouche[k] : 1)])) : {}));
      if (Mx.retouche === 'aucune') Mx.retouche = null;
      if (C.kitV) Object.assign(Mx.kitV, C.kitV); }   // (trio) les vrais tambours écrits (la vieille caisse claire du CASSE, les repiniques du CARNAVAL…)
    Mx.cap = C.cap || 86; Mx.up = Mx.cap >= 85 ? 12 : 0;
    if (C.dub) { Mx.tim.growlV = tp(['yoi', 'wah', 'zap']); Mx.tim.wobDet = tr(8, 16); }   // (dubstep : la couleur du growl, l'épaisseur de la wob)   // L'AIGU SE REPOSE : le plafond du style ; cordes et accords hachés à l'octave du milieu sous 85
    Mx.fill = tp(C.fill); Mx.transDer = []; Mx.arrDer = ''; Mx.modul = tp([2, 2, 1]);
    const sp = SIG_POIDS[cid], sk = Object.keys(sp), sw = {}; sk.forEach(k => sw[k] = sp[k] * (W.sig && W.sig[k] != null ? W.sig[k] : 1));
    Mx.sig = tpw(sk, sw); Mx.sig2 = T() < .4 ? tpw(sk.filter(k => k !== Mx.sig), sw) : null;
    if (C.fige) { Mx.sig = C.sig; Mx.sig2 = C.sig2 || null; }   // (trio) les signatures écrites
    Mx.idee = SIG[Mx.sig].idee + (Mx.sig2 ? ' ; plus tard, ' + SIG[Mx.sig2].idee.split(/[,—]/)[0].trim() : '');
    Mx.titre = T() < .55 ? tp(SIG[Mx.sig].mots) + (T() < .3 ? ' ' + tp(['3000', 'ULTRA', 'DELUXE', 'GT', 'NOVA']) : (b9 => (/^[AEIOUÉ]/.test(b9) ? ' D’' : ' DE ') + b9)(tp(MOTS2))) : titreDe();
    if (C.titre) Mx.titre = C.titre;
    Mx.ordre = ordreDe(C, Mx);
    Mx.rang = {}; CATALOGUE.forEach(id => Mx.rang[id] = 0); Mx.ordre.forEach((id, k) => Mx.rang[id] = k + 1); Mx.socle = Mx.ordre.slice(0, 3);
    Mx.calme = {}; CALME.forEach(id => { if (Mx.rang[id] > 1) Mx.calme[id] = true; }); if (!(Mx.rang.basse > 0) && Mx.rang.sub > 1) Mx.calme.sub = true;   // (v6.0) le cœur joue calme dès le 1er moteur   // (v3.10 : plus de socle — un élément de plus par moteur)
    Mx.tonNom = NOTES_FR[ton] + ' ' + NOM_MODE[modeN];
    Mx.accords = []; const vu = new Set(); [...Mx.grilles, Mx.grilleF].forEach(g => g.forEach(A => { if (!vu.has(A.cle)) { vu.add(A.cle); Mx.accords.push(A); } }));
    return Mx;
  }
  const NOM_PLUCK = { verre: 'corde de verre', scie: 'scie pincée', fm: 'cloche FM', puce: 'puce', bois: 'bois' }, NOM_CONTRE = { flute: 'flûte', violon: 'violon', voix: 'voix', orgue: 'orgue' };
  const NOM_PAD = { scie: 'scie', doux: 'douce', verre: 'de verre', voix: 'de voix' };
  const nomEl = (Mx, id) => (Mx.C.noms && Mx.C.noms[id]) || nomEl0(Mx, id);   // (trio) les étapes nommées par leur morceau
  const nomEl0 = (Mx, id) => id === 'arp' ? 'l’arpège (' + nomV(Mx.tim.pluck, NOM_PLUCK) + ')' : id === 'contre' ? 'le contre-chant (' + nomV(Mx.tim.contre, NOM_CONTRE) + ')' : id === 'pad' ? (Mx.tim.pad[0] === '@' ? 'la nappe (' + nomV(Mx.tim.pad) + ')' : 'la nappe ' + NOM_PAD[Mx.tim.pad])
    : id === 'cordes' && Mx.tim.cordes[0] === '@' ? 'les vraies cordes' : id === 'cuivres' && Mx.tim.cuivres[0] === '@' ? 'les vrais cuivres'
    : id === 'cordes' && Mx.tim.cordes === 'synth' ? 'les cordes synthé' : id === 'snare' && Mx.kit.snare === 'rim' ? 'le rimshot' : id === 'sig' ? 'la signature : ' + SIG[Mx.sig].nom : id === 'sig2' ? 'la signature : ' + SIG[Mx.sig2].nom : id === 'keys' ? nomV(Mx.tim.keys, NOM_KEYS) : id === 'basse' ? nomV(Mx.tim.basse, NOM_BASSE) : id === 'snare' ? (Mx.kit.snare === 'clap' ? 'le clap' : 'la caisse claire')
    : id === 'lead' ? 'la mélodie (' + nomV(Mx.tim.lead, NOM_LEAD) + ')' : NOMS[id];

  // ================================================================ LES SONS (rendus une fois par musique, hors temps réel)
  const OUT = c => c.destination;
  async function rend(dur, fn, sr, cible, ch) { sr = sr || 44100; const c = new OfflineAudioContext(ch || 1, Math.ceil(dur * sr), sr); fn(c); const b = await c.startRendering(); return norme(b, cible); }
  function norme(b, cible) { let pk = 0; for (let k = 0; k < b.numberOfChannels; k++) { const d = b.getChannelData(k); for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > pk) pk = a; } }
    if (pk > 1e-5) { const g = (cible || .8) / pk; for (let k = 0; k < b.numberOfChannels; k++) { const d = b.getChannelData(k); for (let i = 0; i < d.length; i++) d[i] *= g; } } return b; }
  function nzBuf(c, sec) { const b = c.createBuffer(1, Math.ceil(c.sampleRate * sec), c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; return b; }
  function bruit(c, t, type, f, q, v, dur, att, dest) { const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = nzBuf(c, dur + .05);
    fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (att || .001)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(dest || OUT(c)); s.start(t); }
  function metal(c, t, mult, hp, v, dur) { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = hp; fl.Q.value = .9;
    [263, 400, 421, 474, 587, 845].forEach(f => { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = f * mult * (1 + (R() - .5) * .01); o.connect(fl); o.start(t); o.stop(t + dur + .02); });
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .001); g.gain.exponentialRampToValueAtTime(.0001, t + dur); fl.connect(g); g.connect(OUT(c)); }
  function envG(c, a, h, r, v, dest) { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.linearRampToValueAtTime(v, a); g.gain.setValueAtTime(v, h); g.gain.linearRampToValueAtTime(.0001, h + r); g.connect(dest || OUT(c)); return g; }
  const osc = (c, type, f, dt) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; if (dt) o.detune.value = dt; return o; };
  const panne = (c, x, dest) => { const p = c.createStereoPanner(); p.pan.value = x; p.connect(dest); return p; };
  function courbe(k) { const a = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; a[i] = Math.tanh(k * x) / Math.tanh(k); } return a; }
  function chute(c, type, f0, f1, td, v, dec, dest) { const o = osc(c, type, f0), g = c.createGain(); o.frequency.setValueAtTime(f0, 0); o.frequency.exponentialRampToValueAtTime(f1, td);
    g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(v, .002); g.gain.exponentialRampToValueAtTime(.0001, dec); o.connect(g); g.connect(dest || OUT(c)); o.start(0); o.stop(dec + .03); }
  function vib(c, f0, prof, dep) { const vb = osc(c, 'sine', f0), vg = c.createGain(); vg.gain.setValueAtTime(0, 0); vg.gain.setValueAtTime(0, dep); vg.gain.linearRampToValueAtTime(prof, dep + .35); vb.connect(vg); vb.start(0); return vg; }
  // LES CORDES PINCÉES (Karplus-Strong, calculées en JS : une boucle de bruit adouci qui se filtre à chaque tour) — stéréo : deux cordes
  // à peine désaccordées ; `notes` = [midi…] grattées de 9 ms (un accord de harpe) ou une seule
  function ks(notes, dur, eclat, sr) { sr = sr || 44100; const n = Math.ceil(dur * sr), b = new AudioBuffer({ length: n, numberOfChannels: 2, sampleRate: sr });
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch);
      notes.forEach((m, j) => { const f = mtof(m) * (ch ? 1.0016 : .9984), N = Math.max(2, Math.round(sr / f)), q = new Float32Array(N); let y = 0;
        for (let k = 0; k < N; k++) { y = y * .55 + (R() * 2 - 1) * .45; q[k] = y; }
        const o = Math.round(j * .009 * sr); let idx = 0;
        for (let k = o; k < n; k++) { const a = q[idx], nx = q[(idx + 1) % N]; q[idx] = (a * eclat + nx * (1 - eclat)) * .9985; d[k] += a; idx = (idx + 1) % N; } });
      const fo = Math.round(.05 * sr); for (let k = 0; k < fo; k++) d[n - 1 - k] *= k / fo; }
    return norme(b, .8); }
  function ampli(b) {   // l'ampli de la guitare saturée : saturation (tanh ×5), coupe-haut d'un haut-parleur (~3,4 kHz), la note tient plus longtemps
    const a = Math.exp(-2 * Math.PI * 3400 / b.sampleRate);
    for (let ch = 0; ch < b.numberOfChannels; ch++) { const d = b.getChannelData(ch); let y = 0; for (let i = 0; i < d.length; i++) { y = (1 - a) * Math.tanh(d[i] * 5) + a * y; d[i] = y; } }
    return norme(b, .8); }
  // LES TRANSFORMEURS (v3.8) : un son déjà rendu repasse dans une petite chaîne (hors temps réel) — chorus, phaser, trémolo calé sur le tempo,
  // bande magnétique (pleurage, souffle de saturation), 8 bits (marches + coupe-haut), octaveur (l'octave du dessous mêlée), à l'envers
  // (pour la nappe : son attaque retournée, une mesure, qui ASPIRE vers le temps suivant)
  function transforme(buf, ty, Mx) {
    if (ty === 'reverse') { const L = Math.min(buf.length, Math.round(buf.sampleRate * 240 / (Mx.bpm0 || 120))), y = new AudioBuffer({ length: L, numberOfChannels: buf.numberOfChannels, sampleRate: buf.sampleRate });
      for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c).slice(0, L).reverse(); y.copyToChannel(d, c); } return Promise.resolve(y); }
    return rend(buf.duration + .06, c => { const s9 = c.createBufferSource(); s9.buffer = buf; const o = OUT(c), lfo = (f, prof, dest) => { const l = osc(c, 'sine', f), g = c.createGain(); g.gain.value = prof; l.connect(g); g.connect(dest); l.start(0); };
      if (ty === 'chorus') { s9.connect(o); [[.018, .45, .003, -.7], [.025, .6, .004, .7]].forEach(([d0, f, pr, x]) => { const d = c.createDelay(.1), g = c.createGain(); d.delayTime.value = d0; lfo(f, pr, d.delayTime); g.gain.value = .45; s9.connect(d); d.connect(g); g.connect(panne(c, x, o)); }); }
      else if (ty === 'phaser') { let n = s9; const a9 = []; for (let i = 0; i < 4; i++) { const ap = c.createBiquadFilter(); ap.type = 'allpass'; ap.frequency.value = 1100; ap.Q.value = .7; lfo(.35, 900, ap.frequency); n.connect(ap); n = ap; a9.push(ap); }
        const g = c.createGain(); g.gain.value = .7; n.connect(g); g.connect(o); s9.connect(o); }
      else if (ty === 'trem') { const g = c.createGain(); g.gain.value = .6; lfo((Mx.bpm0 || 120) / 60 * 2, .4, g.gain); s9.connect(g); g.connect(o); }
      else if (ty === 'tape') { const d = c.createDelay(.05), lp = c.createBiquadFilter(), ws = c.createWaveShaper(); d.delayTime.value = .006; lfo(.7, .0015, d.delayTime); lp.type = 'lowpass'; lp.frequency.value = 6500; ws.curve = courbe(1.4);
        s9.connect(d); d.connect(lp); lp.connect(ws); ws.connect(o); }
      else if (ty === 'crush') { const ws = c.createWaveShaper(), lp = c.createBiquadFilter(), N = 24, cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; cv[i] = Math.round(x * N) / N; }
        ws.curve = cv; lp.type = 'lowpass'; lp.frequency.value = 5500; s9.connect(ws); ws.connect(lp); lp.connect(o); }
      else if (ty === 'octave') { s9.connect(o); const s2 = c.createBufferSource(), g = c.createGain(); s2.buffer = buf; s2.playbackRate.value = .5; g.gain.value = .35; s2.connect(g); g.connect(o); s2.start(0); }
      else s9.connect(o);
      s9.start(0); }, buf.sampleRate, .8, 2); }
  // LES RETOUCHES des vrais instruments (v3.7) : lo-fi (bande étroite, saturé) · sombre · radio · saturé
  function retoucheChaine(c, R9) { if (!R9) return OUT(c); const n = []; const bq = (ty, f, q) => { const x = c.createBiquadFilter(); x.type = ty; x.frequency.value = f; x.Q.value = q || .7; return x; }, ws = k => { const x = c.createWaveShaper(); x.curve = courbe(k); return x; };
    if (R9 === 'lofi') n.push(bq('highpass', 140), bq('lowpass', 3200, .5), ws(1.8)); else if (R9 === 'sombre') n.push(bq('lowpass', 2200, .5)); else if (R9 === 'radio') n.push(bq('bandpass', 1300, .8), ws(2.6)); else if (R9 === 'sature') n.push(ws(3), bq('lowpass', 5200, .5));
    if (!n.length) return OUT(c); for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); n[n.length - 1].connect(OUT(c)); return n[0]; }
  // LES CHARLEYS (v3.6) : métal (six carrés) · bruit (souffle, la 909, l'acoustique) · FM de verre · shaker · 8 bits (bruit tenu par paliers)
  function hatSon(K, d, nb) { const ouv = d > .1, T9 = K.hatT;
    if (T9 === 'bruit') return [d + .05, c => { bruit(c, 0, 'highpass', K.hp - (ouv ? 800 : 0), .9, .9, d); bruit(c, 0, 'bandpass', 10500, 1.2, .35, d * .7); }, nb];
    if (T9 === 'fm') return [d + .05, c => { const g = c.createGain(), hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000; g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .001); g.gain.exponentialRampToValueAtTime(.0001, d + .005);
      hp.connect(g); g.connect(OUT(c)); const car = osc(c, 'sine', 6400), mod = osc(c, 'sine', 9180), mg = c.createGain(); mg.gain.value = 7000; mod.connect(mg); mg.connect(car.frequency); car.connect(hp); car.start(0); mod.start(0); }, nb];
    if (T9 === 'shaker') return [d + .06, c => bruit(c, 0, 'bandpass', ouv ? 6500 : 7200, 1.3, .8, d + .02, .01), nb];
    // (trio) LE GANZÁ (le CARNAVAL) : un tube de graines — le grain qui roule (attaque lente), plus sombre qu'un shaker (jamais clinquant)
    if (T9 === 'ganza') return [d + .08, c => { bruit(c, 0, 'bandpass', ouv ? 4300 : 5000, 1.1, .75, d + .04, .014); bruit(c, .005, 'bandpass', 2900, 1.6, .22, d * .7, .006); }, nb];
    if (T9 === 'chip') return [d * .7 + .03, c => { const b = c.createBuffer(1, Math.ceil(c.sampleRate * (d * .7 + .03)), c.sampleRate), x = b.getChannelData(0); let v = 0; for (let i = 0; i < x.length; i++) { if (i % 3 === 0) v = R() * 2 - 1; x[i] = v; }
      const s9 = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain(); s9.buffer = b; hp.type = 'highpass'; hp.frequency.value = 5000; g.gain.setValueAtTime(.8, 0); g.gain.exponentialRampToValueAtTime(.0001, d * .7);
      s9.connect(hp); hp.connect(g); g.connect(OUT(c)); s9.start(0); }, nb];
    return [d + .04, c => { metal(c, 0, K.hm || 1.7, K.hp - (ouv ? 600 : 0), ouv ? .6 : .7, d); bruit(c, 0, 'highpass', K.hp + (ouv ? 1000 : 1500), .8, .25, d * (ouv ? .85 : .78)); }, nb]; }
  // LE KIT (rendu par variantes : deux ou trois coups un peu différents, tirés au hasard — la main, pas la machine)
  const SONS = {
    kick: K => K.kickT === '909' ? [K.dec * .8 + .15, c => { const o = osc(c, 'sine', K.f0 * 1.15), g = c.createGain(), ws = c.createWaveShaper(); ws.curve = courbe(K.drive * 1.2);   // la 909 : sèche, son clic
        o.frequency.setValueAtTime(K.f0 * 1.15, 0); o.frequency.exponentialRampToValueAtTime(K.f1, .04); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.95, .001); g.gain.exponentialRampToValueAtTime(.0001, K.dec * .8);
        o.connect(g); g.connect(ws); ws.connect(OUT(c)); o.start(0); o.stop(K.dec * .8 + .05); bruit(c, 0, 'highpass', 2500, .7, K.clic * 2.2, .018); bruit(c, 0, 'lowpass', 1400, .6, .25, .03); }, 2]
      : K.kickT === '808' ? [K.dec * 1.6 + .15, c => { const o = osc(c, 'sine', K.f1 * 2.2), g = c.createGain(), ws = c.createWaveShaper(); ws.curve = courbe(1 + K.drive * .4);   // la 808 : longue, qui glisse
        o.frequency.setValueAtTime(K.f1 * 2.2, 0); o.frequency.exponentialRampToValueAtTime(K.f1, .09); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.95, .002); g.gain.setValueAtTime(.9, .08); g.gain.exponentialRampToValueAtTime(.0001, K.dec * 1.6);
        o.connect(g); g.connect(ws); ws.connect(OUT(c)); o.start(0); o.stop(K.dec * 1.6 + .05); bruit(c, 0, 'highpass', 3000, .7, K.clic * .6, .005); }, 2]
      : K.kickT === 'acoustique' ? [.5, c => { chute(c, 'sine', K.f0 * .7, 52, .08, .95, .32); chute(c, 'triangle', K.f0 * .9, 70, .03, .3, .1); bruit(c, 0, 'bandpass', 3200, 1, K.clic * 2.5, .012); bruit(c, .002, 'lowpass', 700, .5, .35, .09); }, 3]   // la peau, le batteur
      : K.kickT === 'lofi' ? [K.dec + .15, c => { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(OUT(c)); chute(c, 'sine', K.f0, K.f1, .06, .95, K.dec, lp); bruit(c, 0, 'lowpass', 1200, .5, .3, .03, .001, lp); }, 2]   // étouffée
      : K.kickT === 'chip' ? [.16, c => { chute(c, 'square', K.f0 * 1.2, 45, .06, .6, .13); bruit(c, 0, 'lowpass', 3000, .5, .3, .02); }, 2]   // 8 bits
      : K.kickT === 'surdo' ? [K.dec + .2, c => { chute(c, 'sine', K.f0, K.f1, .07, .95, K.dec); chute(c, 'triangle', K.f0 * 1.7, K.f1 * 1.6, .03, .22, .1);   // (trio) LE SURDO : la peau de buffle, le maillet feutré — court (le grave agréable)
        bruit(c, 0, 'lowpass', 900, .7, .32, .05); bruit(c, .001, 'bandpass', 1500, 1, .1, .025); }, 3]
      : K.kickT === 'grave' ? [1.1, c => { chute(c, 'sine', 95, 42, .25, .95, 1); chute(c, 'triangle', 140, 70, .1, .3, .25); bruit(c, 0, 'lowpass', 500, .6, .6, .18); bruit(c, 0, 'bandpass', 220, 1.5, .4, .3); }, 2]   // le tambour de l'épique
      : [K.dec + .12, c => { const o = osc(c, 'sine', K.f0), g = c.createGain(); o.frequency.setValueAtTime(K.f0, 0); o.frequency.exponentialRampToValueAtTime(K.f1, .055);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.95, .0015); g.gain.setValueAtTime(.95, .02); g.gain.exponentialRampToValueAtTime(.0001, K.dec);
      const ws = c.createWaveShaper(); ws.curve = courbe(K.drive); o.connect(g); g.connect(ws); ws.connect(OUT(c)); o.start(0); o.stop(K.dec + .05);
      chute(c, 'sine', 70, 42, .2, .5, K.dec * 1.1); bruit(c, 0, 'highpass', 3500, .7, K.clic, .006); }, 2],
    snare: K => K.snare === 'acoustique' ? [.45, c => { chute(c, 'triangle', 230, 185, .04, .75, .14); bruit(c, 0, 'bandpass', 3800, .6, 1.3, .2); bruit(c, 0, 'highpass', 6500, .7, .45, .11); bruit(c, .01, 'lowpass', 1600, .5, .3, .3); }, 3]   // la caisse claire acoustique (le timbre, le corps, la salle)
      : K.snare === 'caixa' ? [.24, c => { bruit(c, 0, 'bandpass', 2300, .8, 1.1, .08); bruit(c, 0, 'bandpass', 4000, 1.3, .3, .045); chute(c, 'triangle', 330, 270, .02, .35, .05); }, 4]   // (trio) LA CAIXA : le timbre serré, sombre, sans salle (une texture en doubles croches)
      : K.snare === 'puce' ? [.2, c => { bruit(c, 0, 'highpass', 1800, .5, 1.1, .14); chute(c, 'square', 420, 180, .05, .35, .09); }, 3]   // la caisse 8 bits : du bruit et un carré qui tombe
      : K.snare === 'rim' ? [.3, c => { chute(c, 'triangle', 900, 780, .02, .7, .06); chute(c, 'sine', K.sf * 1.4, K.sf, .02, .5, .1); bruit(c, 0, 'bandpass', 3200, 1.6, 1.2, .07);   // le rimshot sec
        bruit(c, .015, 'lowpass', 2800, .6, .2, .22); }, 3]
      : K.snare === 'clap' ? [.45, c => { [0, .01, .022].forEach(d => bruit(c, d, 'bandpass', K.bp, .6, 2.2, .02)); bruit(c, .03, 'bandpass', K.bp * .9, .5, 1.8, K.sdec);
        bruit(c, .03, 'lowpass', 3000, .5, .25, K.sdec * 2.2); }, 3]
      : [.5, c => { chute(c, 'triangle', K.sf * 1.5, K.sf, .03, .8, .16); chute(c, 'sine', K.sf * 2, K.sf * 1.6, .02, .3, .08);
        bruit(c, 0, 'bandpass', K.bp + 900, .7, 1.4, K.sdec); bruit(c, 0, 'highpass', 5500, .7, .5, K.sdec * .7); bruit(c, .02, 'lowpass', 2500, .6, .3, .38); }, 3],   // la caisse claire de la synthwave et sa salle
    hat: K => hatSon(K, .045, 3), hatO: K => hatSon(K, K.odec, 2),
    percH: K => K.percT === 'tamborim' ? [.16, c => { chute(c, 'sine', 820, 600, .014, .7, .085); bruit(c, 0, 'bandpass', 2500, 1.4, .5, .028); bruit(c, 0, 'bandpass', 4200, 2, .1, .012); }, 3]   // (trio) le TAMBORIM : la baguette sur la petite peau tendue
      : [.3, c => { chute(c, 'sine', K.pf * 1.5, K.pf, .02, .9, .25); bruit(c, 0, 'bandpass', K.pf * 4, 1.5, .25, .02); }, 2],
    percL: K => K.percT === 'tamborim' ? [.1, c => { chute(c, 'sine', 600, 470, .01, .45, .045); bruit(c, 0, 'bandpass', 1900, 1.4, .3, .018); }, 2]   // … étouffé du doigt
      : [.35, c => { chute(c, 'sine', K.pf, K.pf * .68, .02, .9, .3); bruit(c, 0, 'bandpass', K.pf * 3, 1.5, .25, .02); }, 2],
    // (trio) LE SCRATCH (LE CASSE) : un « ah » sur le disque qu'on tire et qu'on relâche — la voyelle qui monte puis retombe, le fader qui coupe
    scratch: () => [.34, c => { const g = c.createGain(), som = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .01); g.gain.setValueAtTime(.8, .12);
      g.gain.linearRampToValueAtTime(.05, .14); g.gain.linearRampToValueAtTime(.7, .17); g.gain.exponentialRampToValueAtTime(.0001, .32); g.connect(OUT(c));
      [[750, 1, 5], [1150, .5, 6], [2600, .1, 5]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
      const o = osc(c, 'sawtooth', 170); o.frequency.setValueAtTime(170, 0); o.frequency.exponentialRampToValueAtTime(520, .12); o.frequency.exponentialRampToValueAtTime(140, .3); o.connect(som); o.start(0);
      bruit(c, 0, 'bandpass', 1400, 1.2, .25, .3, .01, g); }, 2],
    // (trio) LE COFFRE-FORT : un cran de la molette (bref, métallique, pas aigu) ; le bouchon de CHAMPAGNE (le « pop », puis la mousse qui s'échappe)
    clic: () => [.05, c => { bruit(c, 0, 'bandpass', 2900, 7, .9, .018, .0005); chute(c, 'sine', 1900, 1500, .005, .25, .02); }, 3],
    bouchon: () => [.5, c => { bruit(c, 0, 'bandpass', 650, 1.4, 1, .045, .001); chute(c, 'sine', 950, 360, .03, .55, .08); bruit(c, .03, 'bandpass', 4200, .8, .07, .4, .03); }, 1],
    shaker: () => [.12, c => bruit(c, 0, 'bandpass', 6200, 1.2, .6, .09, .012), 3],
    ride: () => [1.3, c => { metal(c, 0, 2.4, 5000, .35, 1.2); bruit(c, 0, 'bandpass', 9000, 1.5, .1, .5); }, 1],
    crash: K => [2.4, c => { metal(c, 0, K.cm || 1.3, 4000, .5, 2.3); bruit(c, 0, 'highpass', 5000, .6, .45, 2.2); }, 1],
    tomH: () => [.45, c => { chute(c, 'sine', 230, 150, .25, .85, .38); bruit(c, 0, 'bandpass', 2500, 1, .15, .04); }, 1],
    tomL: () => [.5, c => { chute(c, 'sine', 150, 92, .3, .9, .45); bruit(c, 0, 'bandpass', 2000, 1, .15, .04); }, 1],
    hey: () => [.35, c => { const g = c.createGain(), som = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.9, .012); g.gain.exponentialRampToValueAtTime(.0001, .3); g.connect(OUT(c));   // « HÉ ! » : six gorges
      [[530, 1, 5], [1850, .6, 7], [2500, .25, 6]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
      for (let j = 0; j < 6; j++) { const f9 = 160 + R() * 70, o = osc(c, 'sawtooth', f9), m = c.createGain(); o.frequency.setValueAtTime(f9, 0); o.frequency.exponentialRampToValueAtTime(f9 * .7, .28); m.gain.value = .3; o.connect(m); m.connect(panne(c, (j / 5) * 1.2 - .6, som)); o.start(R() * .015); }
      bruit(c, 0, 'bandpass', 2200, .7, .3, .2, .005, g); }, 2],
    impact: () => [1.6, c => { chute(c, 'sine', 95, 30, 1, .95, 1.5); bruit(c, 0, 'lowpass', 400, .7, .5, .3); }, 1],
    riser: K => K.riser === 'ton' ? [2.4, c => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 3; fl.frequency.setValueAtTime(500, 0); fl.frequency.exponentialRampToValueAtTime(6000, 2.3);   // la montée EN TON : trois scies (fondamentale, quinte, octave) qui grimpent
        g.gain.setValueAtTime(.02, 0); g.gain.linearRampToValueAtTime(.6, 2.3); g.gain.linearRampToValueAtTime(.0001, 2.4); fl.connect(g); g.connect(OUT(c));
        [1, 1.5, 2.003].forEach(r => { const o = osc(c, 'sawtooth', 110 * r); o.frequency.setValueAtTime(110 * r, 0); o.frequency.exponentialRampToValueAtTime(440 * r, 2.35); o.connect(fl); o.start(0); });
        bruit(c, 0, 'highpass', 4000, .7, .15, 2.35, 2, g); }, 1]
      : [2.4, c => { const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = nzBuf(c, 2.45); fl.type = 'bandpass'; fl.Q.value = 2.5;
      fl.frequency.setValueAtTime(350, 0); fl.frequency.exponentialRampToValueAtTime(5200, 2.35); g.gain.setValueAtTime(.02, 0); g.gain.linearRampToValueAtTime(.9, 2.3); g.gain.linearRampToValueAtTime(.0001, 2.4);
      s.connect(fl); fl.connect(g); g.connect(OUT(c)); s.start(0); }, 1],
    ka: () => [.3, c => { bruit(c, 0, 'bandpass', 1500, 2, 1, .05); chute(c, 'sine', 160, 90, .08, .6, .14); bruit(c, .03, 'highpass', 3000, .8, .3, .08); }, 1],   // le tiroir-caisse
    turbo: () => [.6, c => { const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = nzBuf(c, .6); fl.type = 'bandpass'; fl.Q.value = 1.4;   // la soupape : pschhh
      fl.frequency.setValueAtTime(4200, 0); fl.frequency.exponentialRampToValueAtTime(700, .45); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .015); g.gain.exponentialRampToValueAtTime(.0001, .55);
      s.connect(fl); fl.connect(g); g.connect(OUT(c)); s.start(0); }, 2],
    vinyl: () => [3, c => { const b = c.createBuffer(1, c.sampleRate * 3, c.sampleRate), d = b.getChannelData(0); let y = 0;
      for (let i = 0; i < d.length; i++) { y = .97 * y + .03 * (R() * 2 - 1); d[i] = y * .5 + (R() < .0005 ? (R() * 2 - 1) * 1.5 : 0); }
      const s = c.createBufferSource(), fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 2500; fl.Q.value = .5; s.buffer = b; s.connect(fl); fl.connect(OUT(c)); s.start(0); }, 1],
  };
  // LES BASSES (mono, le grave reste au centre)
  const BASSES = {
    // (v5.0) la BASSE ÉLECTRIQUE aux doigts (la Precision des disques) : scie + triangle sous un coupe-haut qui se referme, le corps en sinus, le doigt sur la corde
    doigts: [1.3, (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 1.2; fl.frequency.setValueAtTime(Math.min(2400, f * 14), 0); fl.frequency.exponentialRampToValueAtTime(Math.max(300, f * 4), .35);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.6, .004); g.gain.exponentialRampToValueAtTime(.2, .3); g.gain.exponentialRampToValueAtTime(.0001, 1.0); fl.connect(g); g.connect(OUT(c));   // (salle : pincée, sinon elle couvrait la grosse caisse de 10 dB)
      const o = osc(c, 'sawtooth', f), om = c.createGain(); om.gain.value = .45; o.connect(om); om.connect(fl); const t9 = osc(c, 'triangle', f), tm = c.createGain(); tm.gain.value = .55; t9.connect(tm); tm.connect(fl);
      const s9 = osc(c, 'sine', f), sm = c.createGain(); sm.gain.value = .28; s9.connect(sm); sm.connect(g);
      const nb = c.createBufferSource(), nf = c.createBiquadFilter(), ng = c.createGain(); nb.buffer = nzBuf(c, .03); nf.type = 'bandpass'; nf.frequency.value = 1200; ng.gain.setValueAtTime(.25, 0); ng.gain.exponentialRampToValueAtTime(.001, .025); nb.connect(nf); nf.connect(ng); ng.connect(g);
      [o, t9, s9, nb].forEach(z => z.start(0)); }],
    // (v5.0) le LOG DRUM (amapiano) : un sinus qui tombe sur sa note en 35 ms, le « toc » du bois, un peu saturé
    logdrum: [.7, (c, f) => { const g = c.createGain(), ws = c.createWaveShaper(); ws.curve = courbe(1.8); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.75, .003); g.gain.exponentialRampToValueAtTime(.15, .12); g.gain.exponentialRampToValueAtTime(.0001, .55); ws.connect(g); g.connect(OUT(c));
      const o = osc(c, 'sine', f * 1.9); o.frequency.exponentialRampToValueAtTime(f, .035); o.connect(ws);
      const o2 = osc(c, 'triangle', f * 2.01), g2 = c.createGain(); g2.gain.setValueAtTime(.35, 0); g2.gain.exponentialRampToValueAtTime(.001, .09); o2.connect(g2); g2.connect(ws); [o, o2].forEach(z => z.start(0)); }],
    roule: [.5, (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 4; fl.frequency.setValueAtTime(1800, 0); fl.frequency.exponentialRampToValueAtTime(380, .14);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.6, .003); g.gain.setValueAtTime(.6, .3); g.gain.exponentialRampToValueAtTime(.0001, .48); fl.connect(g); g.connect(OUT(c));
      [osc(c, 'sawtooth', f, -6), osc(c, 'sawtooth', f, 6)].forEach(o => { const m = c.createGain(); m.gain.value = .45; o.connect(m); m.connect(fl); o.start(0); });
      const s = osc(c, 'sine', f), sg = c.createGain(); sg.gain.value = .6; s.connect(sg); sg.connect(g); s.start(0); }],
    funk: [.6, (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(), ws = c.createWaveShaper(); ws.curve = courbe(1.6); fl.type = 'lowpass'; fl.Q.value = 5; fl.frequency.setValueAtTime(2400, 0); fl.frequency.exponentialRampToValueAtTime(340, .12);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .003); g.gain.exponentialRampToValueAtTime(.32, .3); g.gain.exponentialRampToValueAtTime(.0001, .56); fl.connect(ws); ws.connect(g); g.connect(OUT(c));
      [osc(c, 'square', f), osc(c, 'sawtooth', f, -5)].forEach(o => { o.connect(fl); o.start(0); }); const s = osc(c, 'sine', f), sg = c.createGain(); sg.gain.value = .6; s.connect(sg); sg.connect(g); s.start(0); }],
    acid: [.5, (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(), ws = c.createWaveShaper(); ws.curve = courbe(2); fl.type = 'lowpass'; fl.Q.value = 12;   // le 303 : la résonance qui crie
      fl.frequency.setValueAtTime(2800, 0); fl.frequency.exponentialRampToValueAtTime(360, .18); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.6, .003); g.gain.exponentialRampToValueAtTime(.0001, .45);
      const o = osc(c, 'sawtooth', f); o.connect(fl); fl.connect(ws); ws.connect(g); g.connect(OUT(c)); o.start(0); const s9 = osc(c, 'sine', f), sg = c.createGain(); sg.gain.value = .5; s9.connect(sg); sg.connect(g); s9.start(0); }],
    reese: [.7, (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 650; fl.Q.value = 1.5; fl.connect(g);   // deux scies qui battent
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .01); g.gain.setValueAtTime(.7, .5); g.gain.exponentialRampToValueAtTime(.0001, .68); g.connect(OUT(c));
      [-15, 15].forEach(dt => { const o = osc(c, 'sawtooth', f, dt); o.connect(fl); o.start(0); }); const s9 = osc(c, 'sine', f), sg = c.createGain(); sg.gain.value = .8; s9.connect(sg); sg.connect(g); s9.start(0); }],
    slap: [.5, (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 3; fl.frequency.setValueAtTime(5000, 0); fl.frequency.exponentialRampToValueAtTime(600, .06);   // le pouce qui claque
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .002); g.gain.exponentialRampToValueAtTime(.25, .12); g.gain.exponentialRampToValueAtTime(.0001, .46); fl.connect(g); g.connect(OUT(c));
      [osc(c, 'sawtooth', f), osc(c, 'triangle', f * 2)].forEach((o, k) => { const m = c.createGain(); m.gain.value = k ? .3 : .8; o.connect(m); m.connect(fl); o.start(0); }); bruit(c, 0, 'bandpass', 2500, 1.5, .3, .02); }],
    tri: [.45, (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .003); g.gain.setValueAtTime(.8, .25); g.gain.exponentialRampToValueAtTime(.0001, .42); g.connect(OUT(c));   // la basse triangle de la console
      const o = osc(c, 'triangle', f); o.connect(g); o.start(0); const s9 = osc(c, 'sine', f), sg = c.createGain(); sg.gain.value = .4; s9.connect(sg); sg.connect(g); s9.start(0); }],
    sub: [.9, (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .01); g.gain.setValueAtTime(.8, .6); g.gain.exponentialRampToValueAtTime(.0001, .88);
      const o = osc(c, 'sine', f); o.connect(g); g.connect(OUT(c)); o.start(0); }],
  };
  // LES MÉLODIES (stéréo : voix désaccordées gauche / droite)
  const LEADS = {
    // (v5.0) l'ACCORDÉON : deux anches désaccordées (le « musette » qui bat) + une à l'octave, la caisse (bosse vers 1,3 kHz), le soufflet qui tremble — tango, cumbia, musette, balkan
    accordeon: [1.9, (c, f) => { const g = envG(c, .035, 1.5, .3, .32), bp = c.createBiquadFilter(), hp = c.createBiquadFilter(), trm = c.createGain(), lfo = osc(c, 'sine', 5.6), lg = c.createGain();
      bp.type = 'peaking'; bp.frequency.value = 1300; bp.Q.value = 1.2; bp.gain.value = 6; hp.type = 'highpass'; hp.frequency.value = 180; lg.gain.value = .12; trm.gain.value = .88; lfo.connect(lg); lg.connect(trm.gain); lfo.start(0);
      hp.connect(bp); bp.connect(trm); trm.connect(g);
      const N = 32, re = new Float32Array(N), im = new Float32Array(N); for (let j = 1; j < N; j++) im[j] = 2 / (j * Math.PI) * Math.sin(j * Math.PI * .3); const pw = c.createPeriodicWave(re, im);
      [[-7, -.5, 1, 1], [7, .5, 1, 1], [0, 0, .35, 2]].forEach(([dt, x, v, r]) => { const o = c.createOscillator(), m = c.createGain(); o.setPeriodicWave(pw); o.frequency.value = f * r; o.detune.value = dt; m.gain.value = v; o.connect(m); m.connect(panne(c, x, hp)); o.start(0); }); }],
    scie: [1.9, (c, f) => { const g = envG(c, .025, 1.45, .4, .36), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = .8; fl.frequency.setValueAtTime(4200, 0); fl.frequency.exponentialRampToValueAtTime(2600, .35); fl.connect(g);
      const vg = vib(c, 5.4, 11, .28); [[-10, -.55], [0, 0], [10, .55]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); vg.connect(o.detune); o.connect(panne(c, x, fl)); o.start(0); });
      const t9 = osc(c, 'triangle', f * 2), tg = c.createGain(); tg.gain.value = .18; t9.connect(tg); tg.connect(fl); t9.start(0); }],
    carre: [1.9, (c, f) => { const g = envG(c, .02, 1.4, .4, .32), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 2400; fl.connect(g); const vg = vib(c, 5.6, 12, .3);
      [[-7, -.4], [7, .4]].forEach(([dt, x]) => { const o = osc(c, 'square', f, dt); vg.connect(o.detune); o.connect(panne(c, x, fl)); o.start(0); }); }],
    talkbox: [1.9, (c, f) => { const g = envG(c, .02, 1.4, .35, .5), vg = vib(c, 5.5, 10, .3), som = c.createGain();
      [[300, 750, 1, 6], [870, 1200, .55, 7], [2250, 2600, .15, 6]].forEach(([f0, f1, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.Q.value = q;
        bp.frequency.setValueAtTime(f0, 0); bp.frequency.linearRampToValueAtTime(f1, .18); m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
      [['sawtooth', 1, -.3], ['square', .6, .3]].forEach(([ty, v, x]) => { const o = osc(c, ty, f), m = c.createGain(); m.gain.value = v; vg.connect(o.detune); o.connect(m); m.connect(panne(c, x, som)); o.start(0); }); }],
    verre: [2, (c, f) => { const g = envG(c, .006, 1.4, .55, .42);
      [[-4, -.45], [4, .45]].forEach(([dt, x]) => { const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f * 2, dt), mg = c.createGain(); mg.gain.setValueAtTime(f * 1.5, 0); mg.gain.exponentialRampToValueAtTime(f * .25, .6);
        mod.connect(mg); mg.connect(car.frequency); car.connect(panne(c, x, g)); car.start(0); mod.start(0); });
      const s = osc(c, 'sine', f * 2), sg = c.createGain(); sg.gain.setValueAtTime(.12, 0); sg.gain.exponentialRampToValueAtTime(.0001, .8); s.connect(sg); sg.connect(g); s.start(0); }],
    cuivre: [1.9, (c, f) => { const g = envG(c, .04, 1.4, .35, .38), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 1.4; fl.frequency.setValueAtTime(700, 0); fl.frequency.exponentialRampToValueAtTime(3200, .08); fl.frequency.exponentialRampToValueAtTime(1700, .5); fl.connect(g);   // le cuivre qui gonfle
      const vg = vib(c, 5.2, 9, .35); [[-8, -.4], [8, .4]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); vg.connect(o.detune); o.connect(panne(c, x, fl)); o.start(0); }); }],
    // LE SAXOPHONE DE MINUIT : scie + carré dans les résonances d'un sax (600 · 1 400 · 2 800 Hz), le souffle, l'attaque qui « remonte » à la note, le vibrato qui arrive
    saxo: [2, (c, f) => { const g = envG(c, .045, 1.5, .35, .42), som = c.createGain(), vg = vib(c, 5, 16, .3), sc = c.createGain(); sc.gain.value = 1;
      [[620, 1, 4], [1400, .7, 5], [2800, .3, 6], [300, .5, 1]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
      [['sawtooth', 1, -.25], ['square', .45, .25]].forEach(([ty, v, x]) => { const o = osc(c, ty, f), m = c.createGain(); m.gain.value = v; o.detune.setValueAtTime(-45, 0); o.detune.linearRampToValueAtTime(0, .09); vg.connect(o.detune); o.connect(m); m.connect(panne(c, x, som)); o.start(0); });
      bruit(c, 0, 'bandpass', Math.min(6000, f * 3), 1.2, .05, 1.5, .05, g); }],
    // LE THÉRÉMINE : une sinusoïde qui chante, un grand vibrato (et, dans le jeu, il GLISSE d'une note à l'autre)
    theremine: [2, (c, f) => { const g = envG(c, .08, 1.5, .4, .45), vg = vib(c, 5.8, 28, .15); [['sine', 1, -.2], ['triangle', .12, .2]].forEach(([ty, v, x]) => { const o = osc(c, ty, f), m = c.createGain(); m.gain.value = v; vg.connect(o.detune); o.connect(m); m.connect(panne(c, x, g)); o.start(0); }); }],
    // LE STEEL DRUM : des partiels presque harmoniques qui s'éteignent vite, un petit coup de baguette
    steel: [1.4, (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.5, .004); g.gain.exponentialRampToValueAtTime(.0001, 1.3); g.connect(OUT(c));
      [[1, 1, 1.3, -.3], [2, .45, .5, .3], [3.01, .25, .25, 0], [4.2, .1, .1, 0]].forEach(([r, v, d, x]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.setValueAtTime(v, 0); m.gain.exponentialRampToValueAtTime(.0001, d); o.connect(m); m.connect(panne(c, x, g)); o.start(0); });
      bruit(c, 0, 'bandpass', 3000, 2, .08, .02, .001, g); }],
    // LA KALIMBA : la lame (une sinusoïde) et son cliquetis aigu qui meurt aussitôt
    kalimba: [1.2, (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.55, .002); g.gain.exponentialRampToValueAtTime(.0001, 1.1); g.connect(OUT(c));
      [[1, 1, 1.1, -.25], [5.4, .3, .06, .25], [2, .12, .3, 0]].forEach(([r, v, d, x]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.setValueAtTime(v, 0); m.gain.exponentialRampToValueAtTime(.0001, d); o.connect(m); m.connect(panne(c, x, g)); o.start(0); }); }],
    // LA PUCE 8 BITS : une impulsion à 25 % (la console), le vibrato qui arrive
    chip: [1.6, (c, f) => { const g = envG(c, .005, 1.2, .25, .3), vg = vib(c, 6, 14, .25), N = 24, re = new Float32Array(N), im = new Float32Array(N);
      for (let k = 1; k < N; k++) im[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * .25); const pw = c.createPeriodicWave(re, im);
      [[-4, -.3], [4, .3]].forEach(([dt, x]) => { const o = c.createOscillator(); o.setPeriodicWave(pw); o.frequency.value = f; o.detune.value = dt; vg.connect(o.detune); o.connect(panne(c, x, g)); o.start(0); }); }],
    sifflet: [1.9, (c, f) => { const g = envG(c, .04, 1.4, .35, .4); const vg = vib(c, 6, 18, .2);
      [[0, -.2], [5, .2]].forEach(([dt, x]) => { const o = osc(c, 'sine', f, dt); vg.connect(o.detune); o.connect(panne(c, x, g)); o.start(0); }); bruit(c, 0, 'bandpass', f * 2, 3, .015, 1.2, .05, g); }],
    // LA CLOCHE DE VACHE (le phonk) : deux carrés à la QUINTE (la vraie 808 frotte à 1,48 : ici elle reste juste) dans une bande, un coup sec
    cowbell: [.7, (c, f) => { const g = c.createGain(), bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = Math.min(5000, f * 1.6); bp.Q.value = .9;
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.55, .002); g.gain.exponentialRampToValueAtTime(.18, .07); g.gain.exponentialRampToValueAtTime(.0001, .65); bp.connect(g); g.connect(OUT(c));
      [[1, 1, -.25], [1.5, .7, .25]].forEach(([r, v, x]) => { const o = osc(c, 'square', f * r), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(panne(c, x, bp)); o.start(0); }); }],
    flute: [2.2, (c, f) => { const g = envG(c, .12, 1.8, .35, .35); const vg = vib(c, 4.6, 9, 0);
      [['sine', 1, f, -.25], ['triangle', .25, f * 2, .25]].forEach(([ty, v, ff, x]) => { const o = osc(c, ty, ff), m = c.createGain(); m.gain.value = v; vg.connect(o.detune); o.connect(m); m.connect(panne(c, x, g)); o.start(0); });
      bruit(c, 0, 'bandpass', f * 3, 2, .02, 1.6, .1, g); }],
  };
  function voixDe(nom, Tm) {
    if (OPT && OPT.voix && OPT.voix[nom]) { const v9 = OPT.voix[nom](OUTILS(), Tm); if (v9) return v9; }   // (15/10) une V2 remplace la voix   // [durée, hauteurs de référence, fabrique(c, f), canaux] — ou { ks: true, … } pour les cordes pincées — ou { vrai } (un vrai instrument)
    const vr = x => typeof x === 'string' && x[0] === '@' ? { vrai: x.slice(1) } : null;
    if (nom === 'basse' && vr(Tm.basse)) return vr(Tm.basse); if (nom === 'lead' && vr(Tm.lead)) return vr(Tm.lead);
    if (nom === 'contre' && vr(Tm.contre)) return vr(Tm.contre); if (nom === 'pluck' && vr(Tm.pluck)) return vr(Tm.pluck);
    if (nom === 'basse') return est808(Tm.basse) ? voixDe('b808', Tm) : [BASSES[Tm.basse][0], [36, 48, 60], BASSES[Tm.basse][1], 1];
    if (nom === 'sub') return [BASSES.sub[0], [36, 48], BASSES.sub[1], 1];
    if (nom === 'b808') { const dr = Tm.basse === '808dur' ? 4 : Tm.basse === 'sub808' ? 1.05 : 2.2, d9 = Tm.basse === '808dur' ? Tm.d808 * .7 : Tm.basse === 'sub808' ? Tm.d808 * 1.25 : Tm.d808;   // la 808 · saturée · ronde
      return [d9 + .25, [36, 48], (c, f) => { const o = osc(c, 'sine', f), g = c.createGain(), ws = c.createWaveShaper(); ws.curve = courbe(dr);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .006); g.gain.setValueAtTime(.8, d9 * .75); g.gain.exponentialRampToValueAtTime(.0001, d9); o.connect(g); g.connect(ws); ws.connect(OUT(c)); o.start(0);
      if (Tm.basse === '808dur') { const o2 = osc(c, 'sine', f * 2), g2 = c.createGain(); g2.gain.setValueAtTime(.25, 0); g2.gain.exponentialRampToValueAtTime(.0001, .15); o2.connect(g2); g2.connect(ws); o2.start(0); } }, 1]; }
    if (nom === 'lead' && (Tm.lead === 'guitare' || Tm.lead === 'guitareSat')) return { ks: true, dur: Tm.lead === 'guitareSat' ? 2.2 : 1.6, refs: [48, 60, 72, 84], eclat: Tm.lead === 'guitareSat' ? .62 : .52, sat: Tm.lead === 'guitareSat' };
    if (nom === 'lead') return [LEADS[Tm.lead][0], [48, 60, 72], LEADS[Tm.lead][1], 2];
    if (nom === 'contre') { const k = Tm.contre;   // LE CONTRE-CHANT : flûte · violon · voix · orgue
      if (k === 'violon') return [2.4, [60, 72], (c, f) => { const g = envG(c, .28, 1.9, .4, .3), fl = c.createBiquadFilter(), vg = vib(c, 5.6, 14, .35); fl.type = 'lowpass'; fl.frequency.value = 2600; fl.Q.value = .8; fl.connect(g);
        [[-6, -.35], [6, .35]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); vg.connect(o.detune); o.connect(panne(c, x, fl)); o.start(0); }); }, 2];
      if (k === 'voix') return [2.4, [60, 72], (c, f) => { const g = envG(c, .3, 1.9, .4, .5), som = c.createGain(), vg = vib(c, 5, 10, .3);
        [[325, 1, 7], [700, .45, 8], [2700, .08, 6]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
        [[-6, -.4], [6, .4]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); vg.connect(o.detune); o.connect(panne(c, x, som)); o.start(0); }); }, 2];
      if (k === 'orgue') return [2.2, [60, 72], (c, f) => { const g = envG(c, .03, 1.8, .3, .3), vg = vib(c, 6.4, 8, 0);
        [[1, 1, -.3], [2, .55, .3], [3, .3, 0], [4, .15, 0]].forEach(([r, v, x]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.value = v; vg.connect(o.detune); o.connect(m); m.connect(panne(c, x, g)); o.start(0); }); }, 2];
      return [LEADS.flute[0], [60, 72], LEADS.flute[1], 2]; }
    if (nom === 'pluck') { const k = Tm.pluck;   // L'ARPÈGE (et les fills, la gerbe de la pose) : corde de verre · scie pincée · cloche FM · puce · bois
      if (k === 'scie') return [.9, [48, 60, 72, 84], (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 3; fl.frequency.setValueAtTime(3600, 0); fl.frequency.exponentialRampToValueAtTime(600, .2);
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.5, .003); g.gain.exponentialRampToValueAtTime(.0001, .8); fl.connect(g); g.connect(OUT(c));
        [[-6, -.4], [6, .4]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, fl)); o.start(0); }); }, 2];
      if (k === 'fm') return [.9, [48, 60, 72, 84], (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.5, .002); g.gain.exponentialRampToValueAtTime(.0001, .8); g.connect(OUT(c));
        [[-3, -.4], [3, .4]].forEach(([dt, x]) => { const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f * 2, dt), mg = c.createGain(); mg.gain.setValueAtTime(f * 1.6, 0); mg.gain.exponentialRampToValueAtTime(f * .05, .18);
          mod.connect(mg); mg.connect(car.frequency); car.connect(panne(c, x, g)); car.start(0); mod.start(0); }); }, 2];
      if (k === 'puce') return [.6, [48, 60, 72, 84], (c, f) => { const g = c.createGain(), N = 24, re = new Float32Array(N), im = new Float32Array(N); for (let j = 1; j < N; j++) im[j] = 2 / (j * Math.PI) * Math.sin(j * Math.PI * .125);
        const pw = c.createPeriodicWave(re, im); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .002); g.gain.exponentialRampToValueAtTime(.0001, .45); g.connect(OUT(c));
        [[-4, -.3], [4, .3]].forEach(([dt, x]) => { const o = c.createOscillator(); o.setPeriodicWave(pw); o.frequency.value = f; o.detune.value = dt; o.connect(panne(c, x, g)); o.start(0); }); }, 2];
      if (k === 'bois') return [.8, [48, 60, 72, 84], (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.55, .002); g.gain.exponentialRampToValueAtTime(.0001, .7); g.connect(OUT(c));   // le marimba
        [[1, 1, .7, -.2], [4, .3, .06, .2], [10, .08, .02, 0]].forEach(([r, v, d, x]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.setValueAtTime(v, 0); m.gain.exponentialRampToValueAtTime(.0001, d); o.connect(m); m.connect(panne(c, x, g)); o.start(0); }); }, 2];
      return { ks: true, dur: 1.1, refs: [48, 60, 72, 84] }; }
    if (nom === 'foule') return [1.6, [48, 60], (c, f) => { const g = envG(c, .04, 1.2, .3, .5), som = c.createGain();   // le chœur de stade : huit voix d'hommes sur « oh », pas tout à fait ensemble
      [[400, 1, 6], [800, .5, 7], [2600, .08, 6]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
      for (let j = 0; j < 8; j++) { const o = osc(c, 'sawtooth', f, (R() - .5) * 28), m = c.createGain(); m.gain.setValueAtTime(0, 0); m.gain.linearRampToValueAtTime(.3, .02 + R() * .05); o.connect(m); m.connect(panne(c, (j / 7) * 1.4 - .7, som)); o.start(0); }
      bruit(c, 0, 'bandpass', 1500, .8, .04, 1.2, .05, g); }, 2];
    if (nom === 'wob') return [2.9, [24, 30, 36, 42, 48], (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .008); g.gain.setValueAtTime(.7, 2.7); g.gain.exponentialRampToValueAtTime(.0001, 2.88); g.connect(OUT(c));   // LA WOB : épaisse, non filtrée (le filtre est vivant, calé au tempo)
      const d = Tm.wobDet || 12; [[-d, -.5], [0, 0], [d, .5]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, g)); o.start(0); });
      const q = osc(c, 'square', f), qg = c.createGain(); qg.gain.value = .2; q.connect(qg); qg.connect(g); q.start(0); }, 2];   // (le sous-grave, c'est 'sub' : la wob est la couche du médium — mesuré en salle)
    if (nom === 'growl') return [.7, [36, 48], (c, f) => { const g = c.createGain(), ws = c.createWaveShaper(), som = c.createGain(); ws.curve = courbe(3.5);   // LE GROWL : FM + formants qui glissent
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .006); g.gain.setValueAtTime(.8, .55); g.gain.exponentialRampToValueAtTime(.0001, .68); som.connect(ws); ws.connect(g); g.connect(OUT(c));
      const V = Tm.growlV || 'yoi', F = { yoi: [[420, 800], [300, 2300]], wah: [[320, 700], [750, 1150]], zap: [[1200, 2600], [300, 700]] }[V];
      F[0].forEach((f0, j) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.Q.value = 5; bp.frequency.setValueAtTime(f0, 0); bp.frequency.exponentialRampToValueAtTime(F[1][j], V === 'zap' ? .12 : .4); m.gain.value = j ? .7 : 1;
        const car = osc(c, 'sawtooth', f), mod = osc(c, 'sine', f * (V === 'zap' ? 2 : 1)), mg = c.createGain(); mg.gain.setValueAtTime(f * 3, 0); mg.gain.exponentialRampToValueAtTime(f * .6, .5); mod.connect(mg); mg.connect(car.frequency);
        car.connect(bp); bp.connect(m); m.connect(som); car.start(0); mod.start(0); });
    }, 2];
    if (nom === 'crisse') return [1.1, [72, 84], (c, f) => { const g = envG(c, .03, .8, .25, .5), s9 = c.createBufferSource(), b1 = c.createBiquadFilter(), b2 = c.createBiquadFilter();   // les pneus qui crissent : un bruit pincé sur la note, qui tremble
      s9.buffer = nzBuf(c, 1.15); b1.type = b2.type = 'bandpass'; b1.Q.value = 28; b2.Q.value = 18; b1.frequency.value = f; b2.frequency.value = f * 2;
      const lfo = osc(c, 'sine', 9), lg = c.createGain(); lg.gain.value = f * .012; lfo.connect(lg); lg.connect(b1.frequency); lfo.start(0);
      const m2 = c.createGain(); m2.gain.value = .5; s9.connect(b1); s9.connect(b2); b1.connect(g); b2.connect(m2); m2.connect(g); s9.start(0);
      const o = osc(c, 'triangle', f), og = c.createGain(); og.gain.value = .05; o.connect(og); og.connect(g); o.start(0); }, 1];
    if (nom === 'piece') return [.5, [84, 96], (c, f) => { const g = c.createGain(), car = osc(c, 'sine', f), mod = osc(c, 'sine', f * 3.5), mg = c.createGain();   // la pièce : un FM bref et brillant
      mg.gain.setValueAtTime(f * 2, 0); mg.gain.exponentialRampToValueAtTime(f * .1, .06); mod.connect(mg); mg.connect(car.frequency);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.6, .001); g.gain.exponentialRampToValueAtTime(.0001, .45); car.connect(g); g.connect(OUT(c)); car.start(0); mod.start(0);
      const p2 = osc(c, 'sine', f * 2.76), g2 = c.createGain(); g2.gain.setValueAtTime(.2, 0); g2.gain.exponentialRampToValueAtTime(.0001, .12); p2.connect(g2); g2.connect(OUT(c)); p2.start(0); }, 1];
    if (nom === 'ching') return [1.6, [72, 84], (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.5, .002); g.gain.exponentialRampToValueAtTime(.0001, 1.5); g.connect(OUT(c));
      [[1, 1], [2.76, .5], [5.4, .25], [8.9, .1]].forEach(([r, v]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(g); o.start(0); }); }, 1];
    if (nom === 'siffle') return [.5, [84, 96], (c, f) => { const g = envG(c, .02, .3, .15, .4); const o = osc(c, 'sine', f); o.connect(g); o.start(0); bruit(c, 0, 'bandpass', f, 4, .05, .4, .02, g); }, 1];
    if (nom === 'neon') return [1.6, [48, 60], (c, f) => { const g = envG(c, .3, 1.1, .4, .3), fl = c.createBiquadFilter(), am = c.createGain(), lfo = osc(c, 'square', 50), lg = c.createGain();   // le grésillement : modulé à 50 Hz
      fl.type = 'bandpass'; fl.frequency.value = 1800; fl.Q.value = .9; lg.gain.value = .35; am.gain.value = .65; lfo.connect(lg); lg.connect(am.gain); lfo.start(0); fl.connect(am); am.connect(g);
      [[f, 1], [f * 2, .5], [f * 3, .25]].forEach(([ff, v]) => { const o = osc(c, 'sawtooth', ff), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(fl); o.start(0); }); }, 1];
    if (nom === 'moteur') return [1.2, [36, 48], (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(), ws = c.createWaveShaper(); ws.curve = courbe(2.5); fl.type = 'lowpass'; fl.frequency.value = 900; fl.Q.value = 4;   // le moteur : scie + carré saturés
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .01); g.gain.setValueAtTime(.7, .9); g.gain.exponentialRampToValueAtTime(.0001, 1.15); fl.connect(ws); ws.connect(g); g.connect(OUT(c));
      [osc(c, 'sawtooth', f), osc(c, 'square', f * 1.005), osc(c, 'sawtooth', f * 2.003)].forEach((o, k) => { const m = c.createGain(); m.gain.value = [1, .6, .3][k]; o.connect(m); m.connect(fl); o.start(0); }); }, 1];
    if (nom === 'klaxon') return [.35, [60, 72], (c, f) => { const g = c.createGain(), bp = c.createBiquadFilter(), lp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1000; bp.Q.value = .8; lp.type = 'lowpass'; lp.frequency.value = 2800;
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .006); g.gain.setValueAtTime(.7, .25); g.gain.exponentialRampToValueAtTime(.0001, .32); bp.connect(lp); lp.connect(g); g.connect(OUT(c));
      [osc(c, 'square', f), osc(c, 'square', f * 1.004)].forEach(o => { o.connect(bp); o.start(0); }); }, 1];
    if (nom === 'sirene') return [2.2, [72], (c, f) => { const g = envG(c, .25, 1.8, .35, .4); [['sine', 1, f], ['triangle', .2, f * 2]].forEach(([ty, v, ff]) => { const o = osc(c, ty, ff), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(g); o.start(0); }); }, 1];
    if (nom === 'cloche') return [2.2, [72, 84], (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .002); g.gain.exponentialRampToValueAtTime(.0001, 2.1); g.connect(OUT(c));
      [[1, 1, -.3], [Tm.cr, .35, .3], [Tm.cr * 1.96, .1, 0]].forEach(([r, v, x]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(panne(c, x, g)); o.start(0); }); }, 2];
    // (ZEPPELIN II) LA BASSE NEW WAVE (1983 : Depeche Mode, New Order) : deux scies et un carré, le filtre qui claque et se referme, sèche et
    // courte, un grain saturé (le « raw ») — jamais d'octave du dessous (le grave agréable)
    if (nom === 'nwb') return [.45, [36, 48, 60], (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(), ws = c.createWaveShaper(); ws.curve = courbe(2.2); fl.type = 'lowpass'; fl.Q.value = 6;
      fl.frequency.setValueAtTime(Math.min(4200, f * 22), 0); fl.frequency.exponentialRampToValueAtTime(Math.max(260, f * 3), .13);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .003); g.gain.exponentialRampToValueAtTime(.25, .16); g.gain.exponentialRampToValueAtTime(.0001, .4); fl.connect(ws); ws.connect(g); g.connect(OUT(c));
      [[osc(c, 'sawtooth', f, -7), .5], [osc(c, 'sawtooth', f, 7), .5], [osc(c, 'square', f), .3]].forEach(([o, v]) => { const m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(fl); o.start(0); }); }, 1];
    // (trio) L'AGOGÔ : une cloche de fer forgé frappée — la note, ses partiels de cloche (2,4 · 3,9), qui s'éteignent vite, le coup de baguette
    if (nom === 'agogo') return [.6, [64, 76], (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.55, .0015); g.gain.exponentialRampToValueAtTime(.0001, .55); g.connect(OUT(c));
      [[1, 1, .5, -.15], [2.4, .32, .16, .15], [3.9, .1, .06, 0]].forEach(([r, v, d, x]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.setValueAtTime(v, 0); m.gain.exponentialRampToValueAtTime(.0001, d); o.connect(m); m.connect(panne(c, x, g)); o.start(0); });
      bruit(c, 0, 'bandpass', 2400, 2, .12, .015, .0008, g); }, 2];
    // (trio) LA CUÍCA : le tambour à friction — un son creux et nasal (triangle + 2e harmonique dans une bosse), qui GLISSE (la note le fait glisser)
    if (nom === 'cuica') return [.9, [60, 72], (c, f) => { const g = envG(c, .025, .55, .2, .5), bp = c.createBiquadFilter(), lp = c.createBiquadFilter(); bp.type = 'peaking'; bp.frequency.value = Math.min(2400, f * 1.6); bp.Q.value = 2; bp.gain.value = 7;
      lp.type = 'lowpass'; lp.frequency.value = 2600; bp.connect(lp); lp.connect(g); [['triangle', 1, -.15], ['sine', .35, .15]].forEach(([ty, v, x], k) => { const o = osc(c, ty, f * (k ? 2 : 1)), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(panne(c, x, bp)); o.start(0); });
      bruit(c, 0, 'bandpass', f * 3, 3, .04, .5, .02, g); }, 1];
    // (trio) LES BULLES du champagne : un petit « plic » qui remonte sur sa note
    if (nom === 'bulle') return [.22, [76, 88], (c, f) => { const g = c.createGain(), o = osc(c, 'sine', f * .88); o.frequency.setValueAtTime(f * .88, 0); o.frequency.exponentialRampToValueAtTime(f, .02);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.5, .002); g.gain.exponentialRampToValueAtTime(.0001, .14); o.connect(g); g.connect(OUT(c)); o.start(0); }, 1];
    // (trio) LE VERROU du coffre : le pêne d'acier qui cède — un coup sourd accordé (la note et ses partiels de métal épais), la porte qui résonne
    if (nom === 'verrou') return [.9, [48, 60], (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .003); g.gain.exponentialRampToValueAtTime(.0001, .85); g.connect(OUT(c));
      [[1, 1, .8], [2.7, .3, .25], [4.1, .14, .1]].forEach(([r, v, d]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.setValueAtTime(v, 0); m.gain.exponentialRampToValueAtTime(.0001, d); o.connect(m); m.connect(g); o.start(0); });
      bruit(c, 0, 'lowpass', 700, .8, .5, .06, .001, g); bruit(c, .002, 'bandpass', 2200, 2, .15, .03, .001, g); }, 1];
    return null;
  }
  // LES ACCORDS (l'accord entier, MENÉ, rendu d'un coup — stéréo)
  const KEYS = {
    // (v5.0) le WURLITZER : triangle + harmonique 2 qui « aboie » à l'attaque (saturé), trémolo — soul, pop 70, neo-soul
    wurli: [1.8, (c, f, dest) => { [[-3, -.45], [3, .45]].forEach(([dt, x]) => { const o = osc(c, 'triangle', f, dt), o2 = osc(c, 'sine', f * 2, dt), g2 = c.createGain(), ws = c.createWaveShaper(), g = c.createGain(), fl = c.createBiquadFilter();
        ws.curve = courbe(2.5); g2.gain.setValueAtTime(.5, 0); g2.gain.exponentialRampToValueAtTime(.05, .25); fl.type = 'lowpass'; fl.frequency.setValueAtTime(4200, 0); fl.frequency.exponentialRampToValueAtTime(1400, .8);
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.42, .004); g.gain.exponentialRampToValueAtTime(.14, .45); g.gain.exponentialRampToValueAtTime(.0001, 1.75);
        const tr9 = c.createGain(), lfo = osc(c, 'sine', 5.2), lg = c.createGain(); lg.gain.value = .18; tr9.gain.value = .82; lfo.connect(lg); lg.connect(tr9.gain);
        o.connect(ws); o2.connect(g2); g2.connect(ws); ws.connect(fl); fl.connect(g); g.connect(tr9); tr9.connect(panne(c, x, dest)); [o, o2, lfo].forEach(z => z.start(0)); }); }],
    rhodes: [1.9, (c, f, dest) => { [[-4, -.5, 0], [4, .5, .5]].forEach(([dt, x, ph]) => { const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f, dt), tine = osc(c, 'sine', Math.min(f * 14, 20000)), mg = c.createGain(), tg = c.createGain(), g = c.createGain();
        mg.gain.setValueAtTime(f * 2, 0); mg.gain.exponentialRampToValueAtTime(f * .3, .6); tg.gain.setValueAtTime(f * .45, 0); tg.gain.exponentialRampToValueAtTime(1, .06);
        mod.connect(mg); mg.connect(car.frequency); tine.connect(tg); tg.connect(car.frequency);
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .004); g.gain.exponentialRampToValueAtTime(.15, .5); g.gain.exponentialRampToValueAtTime(.0001, 1.85);
        const tr9 = c.createGain(), lfo = osc(c, 'sine', 4.6), lg = c.createGain(); lg.gain.value = .25; tr9.gain.value = .75; lfo.connect(lg); lg.connect(tr9.gain);   // le trémolo qui passe de gauche à droite
        car.connect(g); g.connect(tr9); tr9.connect(panne(c, x, dest)); [car, mod, tine].forEach(o => o.start(0)); lfo.start(ph / 4.6); }); }],
    piano: [2.4, (c, f, dest) => { [[-3, -.4], [3, .4]].forEach(([dt, x]) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(3600, 0); fl.frequency.exponentialRampToValueAtTime(900, 1.2);
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.45, .003); g.gain.exponentialRampToValueAtTime(.12, .6); g.gain.exponentialRampToValueAtTime(.0001, 2.3); fl.connect(g); g.connect(panne(c, x, dest));
        [['triangle', 1, dt], ['sawtooth', .28, dt + 5], ['sine', .18, 1200]].forEach(([ty, v, d9]) => { const o = osc(c, ty, f, d9), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(fl); o.start(0); }); });
      bruit(c, 0, 'bandpass', Math.min(5000, f * 8), 1, .04, .03, .001, dest); }],
    dx: [1.8, (c, f, dest) => { [[-5, -.5], [5, .5]].forEach(([dt, x]) => { const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f * 14, dt), mg = c.createGain(), mod2 = osc(c, 'sine', f, dt), mg2 = c.createGain(), g = c.createGain();   // la cloche de verre du DX7
        mg.gain.setValueAtTime(f * 3, 0); mg.gain.exponentialRampToValueAtTime(f * .05, .12); mg2.gain.setValueAtTime(f * 1.2, 0); mg2.gain.exponentialRampToValueAtTime(f * .2, .8); mod.connect(mg); mg.connect(car.frequency); mod2.connect(mg2); mg2.connect(car.frequency);
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .003); g.gain.exponentialRampToValueAtTime(.13, .6); g.gain.exponentialRampToValueAtTime(.0001, 1.75); car.connect(g); g.connect(panne(c, x, dest)); [car, mod, mod2].forEach(o => o.start(0)); }); }],
    orgue: [1.9, (c, f, dest) => { [[-.45, 0], [.45, .5]].forEach(([x, ph]) => { const g = c.createGain(), tr9 = c.createGain(), lfo = osc(c, 'sine', 5.8), lg = c.createGain();   // l'orgue à tirettes, sa cabine qui tourne
        g.gain.setValueAtTime(.0001, 0); g.gain.linearRampToValueAtTime(.22, .015); g.gain.setValueAtTime(.22, 1.5); g.gain.linearRampToValueAtTime(.0001, 1.85);
        lg.gain.value = .3; tr9.gain.value = .7; lfo.connect(lg); lg.connect(tr9.gain); lfo.start(ph / 5.8);
        [[1, 1], [2, .6], [3, .35], [4, .2], [.5, .3]].forEach(([r, v]) => { const o = osc(c, 'sine', f * r, x * 6), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(g); o.start(0); });
        g.connect(tr9); tr9.connect(panne(c, x, dest)); }); }],
    puce: [.9, (c, f, dest) => { const N = 24, re = new Float32Array(N), im = new Float32Array(N); for (let j = 1; j < N; j++) im[j] = 2 / (j * Math.PI) * Math.sin(j * Math.PI * .5);   // les accords 8 bits (carré)
      const pw = c.createPeriodicWave(re, im); [[-4, -.4], [4, .4]].forEach(([dt, x]) => { const o = c.createOscillator(), g = c.createGain(); o.setPeriodicWave(pw); o.frequency.value = f; o.detune.value = dt;
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.25, .003); g.gain.setValueAtTime(.2, .12); g.gain.exponentialRampToValueAtTime(.0001, .85); o.connect(g); g.connect(panne(c, x, dest)); o.start(0); }); }],
    clav: [.7, (c, f, dest) => { [[-3, -.35], [3, .35]].forEach(([dt, x]) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = Math.min(4000, f * 6); fl.Q.value = 1.4;
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.6, .002); g.gain.exponentialRampToValueAtTime(.0001, .55); fl.connect(g); g.connect(panne(c, x, dest));
        [osc(c, 'square', f, dt), osc(c, 'sawtooth', f, dt + 3)].forEach(o => { o.connect(fl); o.start(0); }); }); }],
  };
  function accordDe(inst, Tm) {
    if (OPT && OPT.acc && OPT.acc[inst]) { const a9 = OPT.acc[inst](OUTILS(), Tm); if (a9) return a9; }   // (15/10) une V2 remplace l'accord   // [durée, fréquence d'échantillonnage, fabrique(c, f, sortie)] — ou 'ks' (la harpe de verre) — ou { vrai } (de vrais instruments)
    const va = x => typeof x === 'string' && x[0] === '@' ? x.slice(1) : null;
    if (inst === 'keys' && va(Tm.keys)) return { vrai: [va(Tm.keys)], strum: va(Tm.keys) === 'harpe' ? .014 : .006, dur: 2.4 };
    if (inst === 'pad' && va(Tm.pad)) return { vrai: [va(Tm.pad)], strum: 0, dur: 2.6 };
    if (inst === 'cordes' && va(Tm.cordes)) return { vrai: ['celli', 'violons'], split: 58, strum: 0, dur: 2.6 };
    if (inst === 'cuivres' && va(Tm.cuivres)) return { vrai: ['tromboneStac', 'trompetteStac'], split: 56, strum: 0, dur: 1.2 };
    if (inst === 'keys' && Tm.keys === 'guitare') return 'ksSat'; if (inst === 'keys' && Tm.keys === 'guitareC') return 'ksClair';   // la guitare rythmique : les cordes pincées, grattées, dans l'ampli
    if (inst === 'keys') return Tm.keys === 'harpe' ? 'ks' : [KEYS[Tm.keys][0], 44100, KEYS[Tm.keys][1]];
    if (inst === 'pad') return [3.4, 24000, (c, f, dest) => { const g = envG(c, Tm.padAtt, 2.7, .6, .2, dest), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = Tm.padFc; fl.Q.value = .5; fl.connect(g);
      if (Tm.pad === 'verre') { [[-5, -.7], [5, .7]].forEach(([dt, x]) => { const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f * 3, dt), mg = c.createGain(); mg.gain.value = f * .35; mod.connect(mg); mg.connect(car.frequency); car.connect(panne(c, x, fl)); car.start(0); mod.start(0); }); return; }   // la nappe de verre (FM douce)
      if (Tm.pad === 'voix') { const som = c.createGain(); [[800, 1, 6], [1150, .5, 7], [2900, .1, 6]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(fl); });   // la nappe de voix (« aah »)
        [[-9, -.7], [9, .7]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, som)); o.start(0); }); return; }
      [[-Tm.padLarge, -.8], [-Tm.padLarge / 3, -.3], [Tm.padLarge / 3, .3], [Tm.padLarge, .8]].forEach(([dt, x]) => { const o = osc(c, Tm.pad === 'doux' ? 'triangle' : 'sawtooth', f, dt); o.connect(panne(c, x, fl)); o.start(0); });
      const s = osc(c, 'triangle', f / 2), sg = c.createGain(); sg.gain.value = .4; s.connect(sg); sg.connect(fl); s.start(0); }];
    if (inst === 'stab') return [.5, 44100, (c, f, dest) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 2.5; fl.frequency.setValueAtTime(Tm.sfc, 0); fl.frequency.exponentialRampToValueAtTime(1100, .14);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .003); g.gain.exponentialRampToValueAtTime(.0001, .45); fl.connect(g); g.connect(dest);
      [[-10, -.5], [10, .5]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, fl)); o.start(0); }); }];
    if (inst === 'cordes' && Tm.cordes === 'synth') return [3.4, 24000, (c, f, dest) => { const g = envG(c, .18, 2.6, .6, .16, dest), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 3600; fl.connect(g);   // les cordes synthé (plus vives)
      [['sawtooth', -9, -.7], ['square', 0, 0], ['sawtooth', 9, .7]].forEach(([ty, dt, x]) => { const o = osc(c, ty, f, dt), m = c.createGain(); m.gain.value = ty === 'square' ? .5 : 1; o.connect(m); m.connect(panne(c, x, fl)); o.start(0); }); }];
    if (inst === 'cordes') return [3.4, 24000, (c, f, dest) => { const g = envG(c, .6, 2.6, .7, .16, dest), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 2600; fl.connect(g);
      [[-12, -.7], [0, 0], [12, .7]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, fl)); o.start(0); }); }];
    if (inst === 'choeur') return [3.4, 24000, (c, f, dest) => { const g = envG(c, Tm.chAtt || .55, 2.6, .7, .5, dest), som = c.createGain();
      ({ oh: [[420, 1, 6], [820, .45, 7], [2600, .06, 6]], ah: [[780, 1, 6], [1150, .5, 7], [2800, .08, 6]], ou: [[320, 1, 7], [720, .4, 8], [2600, .05, 6]] })[Tm.voyC || 'oh'].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
      [[-7, -.6], [7, .6]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, som)); o.start(0); }); }];
    if (inst === 'cuivres') return [.9, 44100, (c, f, dest) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 1.2; fl.frequency.setValueAtTime(800, 0); fl.frequency.exponentialRampToValueAtTime(2800, .05); fl.frequency.exponentialRampToValueAtTime(1500, .4);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .03); g.gain.setValueAtTime(.4, .45); g.gain.exponentialRampToValueAtTime(.0001, .85); fl.connect(g); g.connect(dest);
      [[-6, -.4], [6, .4]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, fl)); o.start(0); }); }];
    return null;
  }
  const notesAcc = (inst, A, Mx) => { const up = Mx ? Mx.up : 12; return inst === 'cordes' ? A.v.slice(1).map(m => m + up) : inst === 'stab' ? A.v.map(m => m + up) : inst === 'cuivres' ? A.v.slice(1) : A.v; };
  const BESOIN = { nw: ['v:nwb'], kick: ['s:kick'], snare: ['s:snare'], fant: ['s:snare'], hat: ['s:hat'], roll: ['s:hat'], hatO: ['s:hatO'], tribu: ['s:tomH', 's:tomL'], foule: ['v:foule', 's:hey'], wob: ['v:wob'], growl: ['v:growl'], perc: ['s:shaker', 's:percH', 's:percL'], ride: ['s:ride'],
    toms: ['s:tomH', 's:tomL'], vinyl: ['s:vinyl'], basse: ['v:basse'], basse2: ['v:basse'], sub: ['v:sub'], lead: ['v:lead', 'v:pluck', 'v:cloche'], octave: ['v:lead'], harmo: ['v:lead'],
    contre: ['v:contre'], arp: ['v:pluck'], cloche: ['v:cloche'], pad: ['a:pad'], keys: ['a:keys'], stab: ['a:stab'], cordes: ['a:cordes'], choeur: ['a:choeur'], cuivres: ['a:cuivres'],
    _base: ['s:crash', 's:impact', 's:riser', 's:snare', 's:hat', 's:tomH', 's:tomL', 's:percH', 's:percL', 'v:pluck', 'v:b808'] };
  function inverse(x) { const y = new AudioBuffer({ length: x.length, numberOfChannels: x.numberOfChannels, sampleRate: x.sampleRate });
    for (let c = 0; c < x.numberOfChannels; c++) y.copyToChannel(x.getChannelData(c).slice().reverse(), c); return y; }
  async function fabriqueBanque(Mx) {
    const t0 = performance.now(), b = { sons: {}, voix: {}, acc: {}, rates: 0 }, fait = new Set();
    const sur = f => () => Promise.resolve().then(f).catch(() => { b.rates++; });   // un son qui ne se fabrique pas est SAUTÉ
    const jobs = id => (id === 'sig' ? SIG[Mx.sig].besoin : id === 'sig2' ? SIG[Mx.sig2].besoin : id === '_style' ? (Mx.C.besoins || []) : BESOIN[id] || []).flatMap(cle => {   // (trio) '_style' : les sons propres d'un morceau (le scratch)
      if (fait.has(cle)) return []; fait.add(cle); const [k, nom] = cle.split(':');
      if (k === 's' && Mx.kitV && Mx.kitV[nom]) { b.sons[nom] = []; const kv = Mx.kitV[nom];   // le kit réel
        return [() => vraisIndex().then(I => Promise.all(kv.map(x => I[x] && I[x].notes[0] ? vraiBuf(ctx, I[x].notes[0][1], false).then(buf => { Mx.vraisF.push(I[x].notes[0][1]); return buf; }) : null)))
          .then(L => { L = L.filter(Boolean); b.sons[nom] = L; if (nom === 'crash' && L[0]) b.sons.revcrash = [inverse(L[0])]; })]; }
      if (k === 's') { const [dur, fn, nb] = SONS[nom](Mx.kit); b.sons[nom] = [];
        return Array.from({ length: nb }, () => () => rend(dur, fn, 44100, nom === 'vinyl' ? .4 : .8).then(x => { b.sons[nom].push(x); if (nom === 'crash') b.sons.revcrash = [inverse(x)]; })); }
      if (k === 'v') { const V = voixDe(nom, Mx.tim); b.voix[nom] = []; const tfV = x => nom === 'lead' && Mx.transf && Mx.transf.lead ? transforme(x, Mx.transf.lead, Mx) : Promise.resolve(x);
        if (V && V.vrai) return [async () => { const L = await vraiNotes(ctx, V.vrai); Mx.vraisF.push(...L.map(r => r.f)); const out = [];   // un vrai instrument (et sa retouche)
          for (const r of L) { const x = Mx.retouche ? await rend(r.buf.duration, c => { const s9 = c.createBufferSource(); s9.buffer = r.buf; s9.connect(retoucheChaine(c, Mx.retouche)); s9.start(0); }, 44100, .8, r.buf.numberOfChannels) : r.buf; out.push({ m: r.m, buf: await tfV(x) }); }
          b.voix[nom] = out; }];
        const range = x => tfV(x.buf).then(bf => { b.voix[nom].push({ m: x.m, buf: bf }); b.voix[nom].sort((p, q) => p.m - q.m); });
        if (V.ks) return V.refs.map(m => () => Promise.resolve().then(() => range({ m, buf: V.sat ? ampli(ks([m], V.dur, V.eclat)) : ks([m], V.dur, V.eclat || Mx.tim.ksEclat) })));
        const [dur, refs, fab, ch] = V; return refs.map(m => () => rend(dur, c => fab(c, mtof(m)), 44100, .8, ch).then(x => range({ m, buf: x }))); }
      const D = accordDe(nom, Mx.tim); b.acc[nom] = {}; const tfA = x => Mx.transf && Mx.transf[nom] && nom !== 'cordes' ? transforme(x, Mx.transf[nom], Mx) : Promise.resolve(x);
      if (D && D.vrai) return [async () => { const sets = await Promise.all(D.vrai.map(x => vraiNotes(ctx, x))); sets.forEach(L => Mx.vraisF.push(...L.map(r => r.f)));   // l'accord joué par de vrais instruments
        const pres = (L, m) => { let r = L[0]; for (const q of L) if (Math.abs(q.m - m) < Math.abs(r.m - m)) r = q; return r; };
        for (const A of Mx.accords) b.acc[nom][A.cle] = await tfA(await rend(D.dur, c => { const ent = retoucheChaine(c, Mx.retouche); notesAcc(nom, A, Mx).forEach((m, j) => { const L = sets.length > 1 && D.split ? (m < D.split ? sets[0] : sets[1]) : sets[0];
          if (!L || !L.length) return; const r = pres(L, m), s9 = c.createBufferSource(); s9.buffer = r.buf; s9.playbackRate.value = Math.pow(2, (m - r.m) / 12); s9.connect(ent); s9.start(j * D.strum); }); }, 44100, .7, 2)); }];
      if (D === 'ksClair') return Mx.accords.map(A => () => tfA(ks(A.v, 1.4, .5)).then(x => { b.acc[nom][A.cle] = x; }));   // la guitare grattée, claire
      if (D === 'ksSat') return Mx.accords.map(A => () => tfA(ampli(ks(A.v, 1.6, .6))).then(x => { b.acc[nom][A.cle] = x; }));
      if (D === 'ks') return Mx.accords.map(A => () => tfA(ks(A.v.map(m => m + 12), 2.2, Mx.tim.ksEclat)).then(x => { b.acc[nom][A.cle] = x; }));
      const [dur, sr, fab] = D;
      return Mx.accords.map(A => () => rend(dur, c => notesAcc(nom, A, Mx).forEach(m => fab(c, mtof(m), OUT(c))), sr, .7, 2).then(tfA).then(x => { b.acc[nom][A.cle] = x; }));
    });
    const prem = Mx.socle || Mx.ordre.slice(0, 3);   // le socle d'abord (on l'entend dès le 1er moteur)
    await Promise.all(prem.flatMap(jobs).map(f => sur(f)()));
    b.ms = Math.round(performance.now() - t0);
    const reste = ['_base', '_style', ...Mx.ordre.filter(id => prem.indexOf(id) < 0)].flatMap(jobs);
    b.suite = (async () => { for (let k = 0; k < reste.length; k += 6) await Promise.all(reste.slice(k, k + 6).map(f => sur(f)())); b.suiteMs = Math.round(performance.now() - t0); })();
    return b;
  }

  // ================================================================ LA CHAÎNE : bus (coupe-bas, panoramique, pompe) → coupe-bas maître (le VOL) →
  // clarté → saturation douce → colle → limiteur. La réverbe revient APRÈS le coupe-bas (en vol, elle reste entière : on flotte).
  let ctx = audioContext, sortie = destination;
  let master, hpM, clair, sat, comp, lim, revIn, revOut, dIn, dlyL, dlyR, pompeBus, bus = {}, sol = {}, gIn = {}, chaineOk = false, wobIn = null, wobF = null, wowD, wowG, flutG, dSat, dWow, gateG = null, boueF = {};
  let gramoF = null, rHpG = null, revC = null, revCle = '', dFb = null, agc = null, agcA = null, agcEma = null, agcN = 0; const IRS = {}, agcBuf = new Float32Array(2048);
  const LARGES = new Set(['pad', 'keys', 'cordes', 'choeur']), BOUE = { nw: -2.5, pad: -3.5, keys: -3.5, cordes: -3.5, choeur: -3.5, stab: -3.5, cuivres: -3.5, basse2: -5, contre: -3.5, octave: -4, harmo: -3, basse: -2, lead: -1.5, wob: -5, growl: -3.5 };
  const AGC_ON = false;   // (v3.10 : éteint — il aplatissait la montée des moteurs, ce que Léo aimait le plus)
  function agcTick() {   // LE NIVEAU HARMONISÉ : lent, figé pendant le vol, la respiration, le crash
    if (!AGC_ON || !agc || !M || !playing || JEU.vol || JEU.volPas >= 0 || JEU.crashEnCours || M.resp) return; agcA.getFloatTimeDomainData(agcBuf);
    let e = 0; for (let i = 0; i < agcBuf.length; i++) e += agcBuf[i] * agcBuf[i]; const db = 10 * Math.log10(e / agcBuf.length + 1e-12); if (db < -45) return;
    agcEma = agcEma == null ? db : agcEma + (db - agcEma) * .08; const vise = -11 + 3 * (tier - 1) / 29, cur = 20 * Math.log10(Math.max(1e-4, agc.gain.value));
    const nv = clamp(cur + clamp((vise - agcEma) * .15, -.4, .4), -7, 5); agc.gain.setTargetAtTime(Math.pow(10, nv / 20), ctx.currentTime, .3); }
  function ir(sec, br, forme) { br = br || 1; const sr = ctx.sampleRate, n = Math.floor(sr * sec), b = ctx.createBuffer(2, n, sr);
    // (v5.0) LES SALLES : la pièce/le hall (par défaut) · la PLAQUE (dense tout de suite, brillante) · le RESSORT (dub, surf : échos métalliques
    //  qui flottent, 29 et 37 ms, la bande étroite d'un ressort) · la RÉVERBE COUPÉE (gated, années 80 : un mur dense et plat, coupé net)
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let y = 0; for (let i = 0; i < n; i++) { const t = i / sr, a = Math.exp(-2 * Math.PI * Math.min(16000, (1400 + 5000 * Math.exp(-t / .4)) * br) / sr);
      y = (1 - a) * (R() * 2 - 1) + a * y;
      const env = forme === 'gate' ? (t < sec * .82 ? 1 : Math.max(0, 1 - (t - sec * .82) / (sec * .18))) * .55 : Math.exp(-6.9 * t / sec);
      d[i] = y * env * (t < (forme === 'plaque' || forme === 'gate' ? .002 : .012) ? 0 : 1); }
      if (forme === 'ressort') { const P1 = Math.round(.029 * sr), P2 = Math.round(.037 * sr); for (let i = P2; i < n; i++) d[i] += .5 * d[i - P1] + .32 * d[i - P2];
        let lo = 0, hi = 0; const al = Math.exp(-2 * Math.PI * 3800 / sr), ah = Math.exp(-2 * Math.PI * 350 / sr); for (let i = 0; i < n; i++) { lo = (1 - al) * d[i] + al * lo; hi = (1 - ah) * lo + ah * hi; d[i] = lo - hi; } } }
    return norme9(b); }
  function norme9(b) { let pk = 0; for (let c = 0; c < b.numberOfChannels; c++) for (const x of b.getChannelData(c)) pk = Math.max(pk, Math.abs(x)); if (pk > 1) for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] /= pk; } return b; }
  function chaine() {
    master = ctx.createGain(); master.gain.value = .62 * volume;
    hpM = ctx.createBiquadFilter(); hpM.type = 'highpass'; hpM.frequency.value = 20; hpM.Q.value = .7;
    clair = ctx.createBiquadFilter(); clair.type = 'lowpass'; clair.frequency.value = 5000; clair.Q.value = .6;
    sat = ctx.createWaveShaper(); sat.curve = courbe(1.25); sat.oversample = '2x';
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 2.2; comp.attack.value = .015; comp.release.value = .2;
    lim = ctx.createDynamicsCompressor(); lim.threshold.value = -3.5; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .1; lim.knee.value = 0;
    const grave = ctx.createBiquadFilter(), aigu = ctx.createBiquadFilter(); grave.type = 'lowshelf'; grave.frequency.value = 90; grave.gain.value = 0; aigu.type = 'highshelf'; aigu.frequency.value = 9000; aigu.gain.value = 0;   // (v3.10 : neutres)
    agc = ctx.createGain(); agcA = ctx.createAnalyser(); agcA.fftSize = 2048;   // le niveau harmonisé (v3.8)
    wowD = ctx.createDelay(.1); wowD.delayTime.value = .02; master.connect(wowD); wowD.connect(hpM); hpM.connect(clair);
    gramoF = ctx.createBiquadFilter(); gramoF.type = 'highpass'; gramoF.frequency.value = 20; gramoF.Q.value = .9;   // (trio) LE GRAMOPHONE (ZEPPELIN) : le pavillon d'un 78-tours, ouvert à 20 Hz pour les autres   // (v5.0) le pleurage lo-fi : un retard qui ondule
    { const l1 = osc(ctx, 'sine', .55), l2 = osc(ctx, 'sine', 6.3); wowG = ctx.createGain(); wowG.gain.value = 0; flutG = ctx.createGain(); flutG.gain.value = 0; l1.connect(wowG); l2.connect(flutG); wowG.connect(wowD.delayTime); flutG.connect(wowD.delayTime); l1.start(); l2.start(); } clair.connect(gramoF); gramoF.connect(grave); grave.connect(aigu); aigu.connect(sat); sat.connect(comp); comp.connect(agc); agc.connect(lim); lim.connect(sortie || ctx.destination); lim.connect(agcA);
    revIn = ctx.createGain(); revOut = ctx.createGain(); revOut.gain.value = .34;   // (la salle elle-même : salleMet, à chaque musique)
    const rHp = ctx.createBiquadFilter(); rHp.type = 'highpass'; rHp.frequency.value = 260; rHpG = rHp; rHp.connect(revOut); revOut.connect(clair);
    dIn = ctx.createGain(); dlyL = ctx.createDelay(2); dlyR = ctx.createDelay(2); const fbL = ctx.createGain(), fbR = ctx.createGain(), dLp = ctx.createBiquadFilter(), mg = ctx.createChannelMerger(2), dOut = ctx.createGain();
    dLp.type = 'lowpass'; dLp.frequency.value = 3400; fbL.gain.value = fbR.gain.value = .34; dOut.gain.value = .3; dFb = [fbL, fbR];
    dSat = ctx.createWaveShaper(); dIn.connect(dLp); dLp.connect(dlyL); dlyL.connect(fbL); fbL.connect(dlyR); dlyR.connect(fbR); fbR.connect(dSat); dSat.connect(dlyL);   // le ping-pong (v5.0 : la bande sature à chaque tour si le style le veut)
    { const l3 = osc(ctx, 'sine', .7); dWow = ctx.createGain(); dWow.gain.value = 0; l3.connect(dWow); dWow.connect(dlyL.delayTime); dWow.connect(dlyR.delayTime); l3.start(); }
    dlyL.connect(mg, 0, 0); dlyR.connect(mg, 0, 1); mg.connect(dOut); dOut.connect(master); const dr = ctx.createGain(); dr.gain.value = .25; dOut.connect(dr); dr.connect(revIn);
    pompeBus = ctx.createGain(); pompeBus.connect(master);
    for (const id of Object.keys(VOL)) {
      const g = ctx.createGain(); g.gain.value = id === 'fx' ? VOL.fx : 0; let o = g;
      if (GROOVE.has(id)) { const s = ctx.createGain(); g.connect(s); o = s; sol[id] = s; }                       // le VOL coupe ici
      if (HP[id]) { const h = ctx.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = HP[id]; h.Q.value = .6; o.connect(h); o = h; }
      if (PAN[id]) { const p = ctx.createStereoPanner(); p.pan.value = PAN[id]; o.connect(p); o = p; }
      if (BOUE[id]) { const pk = ctx.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 330; pk.Q.value = .9; pk.gain.value = BOUE[id]; o.connect(pk); o = pk; boueF[id] = pk; }   // (v3.10 : la BOUE 250-500 Hz creusée piste par piste — mesurée en salle, solo par solo)
      if (LARGES.has(id)) { g.channelCount = 2; g.channelCountMode = 'explicit'; const sp = ctx.createChannelSplitter(2), mg = ctx.createChannelMerger(2), dl = ctx.createDelay(.05); dl.delayTime.value = .011;   // la largeur (Haas)
        o.connect(sp); sp.connect(mg, 0, 0); sp.connect(dl, 1); dl.connect(mg, 0, 1); o = mg; }
      o.connect(POMPE.includes(id) ? pompeBus : master);
      if (REV[id]) { const s = ctx.createGain(); s.gain.value = REV[id]; o.connect(s); s.connect(revIn); }
      bus[id] = g; }
    { wobIn = ctx.createGain(); wobF = ctx.createBiquadFilter(); wobF.type = 'lowpass'; wobF.Q.value = 7; wobF.frequency.value = 300; const ws = ctx.createWaveShaper(); ws.curve = courbe(4); ws.oversample = '2x'; const lp9 = ctx.createBiquadFilter(); lp9.type = 'lowpass'; lp9.frequency.value = 7500;   // LA WOB : coupe-bas résonant vivant, puis saturée (le mordant du médium), adoucie au-dessus de 7,5 kHz
      wobIn.connect(wobF); wobF.connect(ws); ws.connect(lp9); lp9.connect(bus.wob); }
    ['lead', 'arp', 'cloche', 'contre'].forEach(id => { const s = ctx.createGain(); s.gain.value = 0; bus[id].connect(s); s.connect(dIn); gIn[id] = s; });
    { const cv = ctx.createConvolver(); cv.buffer = ir(.42, 1.3, 'gate'); gateG = ctx.createGain(); gateG.gain.value = 0; bus.snare.connect(cv); bus.toms.connect(cv); cv.connect(gateG); gateG.connect(clair); }   // (v5.0) la réverbe coupée des années 80
    chaineOk = true;
  }

  // ================================================================ JOUER (une source + un gain ; la main : un peu de retard, un peu de force)
  let M = null, banque = null, suivant = null, prepa = null, demande = null;
  let BPM = 110, SD = 60 / BPM / 4, MES = 16 * SD, MOD = 0;
  let playing = false, timer = 0, step = 0, nextTime = 0, tier = 1, cible = 1, activation = -1, grand = false, grille = [], meloPas = {}, guides = [], last808 = null, vinylSrc = null;
  const VERIF = { on: false, n: 0, hors: 0, ex: [] }; let RENOUV = renouvelle;
  const rampeE = () => clamp((tier - 14) / 16, 0, 1), gainBase = () => .62 * volume * (1 + .25 * rampeE()) * (M && M.C.gainDb ? Math.pow(10, M.C.gainDb / 20) : 1);   // (trio) gainDb : le niveau de chaque morceau calé sur ses 👍 (mesuré en salle)   // LA RAMPE du 15 au 30 (v3.4)
  const VOIX_MAX = 64, TEXTURES = new Set(['tribu', 'hat', 'roll', 'fant', 'perc', 'ride', 'arp', 'octave', 'harmo', 'hatO', 'cloche']);
  let actives = 0, sautes = 0, picVoix = 0, erreurs = 0, derniere = '';
  const texture = dest => { for (const id of TEXTURES) if (bus[id] === dest) return true; return false; };
  const libre = dest => { if (actives >= VOIX_MAX && texture(dest)) { sautes++; return false; } return true; };
  let attaques = 0;   // (banc) les notes et les coups joués : la densité, la vitesse qu'on sent
  const suit = s => { actives++; attaques++; if (actives > picVoix) picVoix = actives; s.onended = () => { actives--; }; };
  function son(nom, t, v, dest, dur, buf, rate) { let b = buf || (banque && banque.sons[nom]); if (Array.isArray(b)) b = b.length ? b[Math.floor(R() * b.length)] : null;
    if (!b || !dest || !libre(dest)) return; const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = b; suit(s);
    const bd = b.duration / (rate || 1); if (rate) s.playbackRate.value = rate;
    g.gain.setValueAtTime(v, t); const fin = dur ? Math.min(dur, bd) : bd;
    if (dur && dur < bd) { g.gain.setValueAtTime(v, t + Math.max(.02, fin - .08)); g.gain.linearRampToValueAtTime(0, t + fin); }
    s.connect(g); g.connect(dest); s.start(t); s.stop(t + fin + .02); }
  function sonFin(nom, tFin, dur, v, dest) {   // la FIN d'un son, calée pour finir pile sur tFin (la cymbale à l'envers aspire vers le 1er temps)
    let b = banque && banque.sons[nom]; b = Array.isArray(b) ? b[0] : b; if (!b) return; const d = Math.min(dur, b.duration), s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = b; g.gain.value = v; s.connect(g); g.connect(dest); suit(s); s.start(Math.max(ctx.currentTime, tFin - d), b.duration - d); s.stop(tFin + .02); }
  const accordJoue = (inst, A, t, dur, v, dest) => { const tab = banque.acc[inst], buf = tab && tab[A.cle]; if (buf) son(inst, t, v * (.92 + R() * .16), dest, dur, buf, MOD ? Math.pow(2, MOD / 12) : 0); };
  function note(inst, m, t, dur, v, dest, glisse, A, gdur) {
    if (!isFinite(m)) return;
    if (M && M.cap && dest !== bus.basse && dest !== bus.basse2 && dest !== bus.sub) while (m + MOD > M.cap) { m -= 12; if (glisse != null) glisse -= 12; }   // L'AIGU SE REPOSE : même note, une octave plus bas
    if (VERIF.on && A) { VERIF.n++; if (!A.gamme.includes(pc(m))) { VERIF.hors++; if (VERIF.ex.length < 20) VERIF.ex.push(inst + ' ' + m + ' sur ' + A.nom); } }
    m += MOD; if (glisse != null) glisse += MOD;
    const refs = banque.voix[inst]; if (!refs || !refs.length || !libre(dest)) return; let ref = refs[0]; for (const r of refs) if (Math.abs(r.m - m) < Math.abs(ref.m - m)) ref = r;
    const s = ctx.createBufferSource(), g = ctx.createGain(), rate = Math.pow(2, (m - ref.m) / 12); s.buffer = ref.buf;
    if (glisse != null && glisse !== m) { s.playbackRate.setValueAtTime(Math.pow(2, (glisse - ref.m) / 12), t); s.playbackRate.exponentialRampToValueAtTime(rate, t + (gdur || .09)); } else s.playbackRate.value = rate;
    const fin = Math.min(dur, ref.buf.duration / rate - .02); if (fin <= .01) return; suit(s); v *= .92 + R() * .16;
    g.gain.setValueAtTime(v, t); g.gain.setValueAtTime(v, t + Math.max(.02, fin - .06)); g.gain.linearRampToValueAtTime(0, t + fin);
    s.connect(g); g.connect(dest); s.start(t); s.stop(t + fin + .02);
  }

  // ================================================================ LA FORME (A · A′ · B · C), LA MÉLODIE et LE CONTRE-CHANT
  function grilleDe(sec) { return JEU.fren ? M.grilleF : M.grilles[(sec === 'B' || sec === 'B2' ? 1 : sec === 'C' ? 2 : 0) % M.grilles.length]; }
  function nouvellePhrase() {
    const sec = M.forme[M.phr % 4]; M.phr++; M.sec = sec; grille = grilleDe(sec);
    if (sec === 'A' && M.phr > 1 && R() < .5) M.motifs[1] = phrase(R, M.C.cells, M.phFB);   // la partie B se renouvelle en route
    for (const k of ['kick', 'hat', 'basse', 'keys', 'perc', 'tribu']) { const L = M.patL[k]; if (Array.isArray(L) && L.length > 1 && R() < .3) M.pat[k] = rp(L); }
    M.resp = sec === 'C' && tier >= 10 && !M.C.balaye && R() < (M.C.respP || .6);
    M.repos = tier >= 8 ? (sec === 'B' ? new Set(['arp', 'cloche', 'hatO']) : sec === 'A2' && R() < .5 ? new Set(['arp']) : null) : null;   // l'aigu se repose dans le couplet
    M.balaye = sec === 'C' && M.C.balaye && tier >= 8 && R() < .7;
    M.trim = sec === 'B' ? { basse: -2.5, hat: -4, hatO: -6, ride: -6, kick: -1.5, perc: -3, snare: -1.5 } : {};   // le couplet respire (mesuré sur ses inspirations) ; B2 repart à pleine force
    M.choc = sec === 'C' && !M.resp;
    M.voixMel = sec === 'B' || sec === 'B2' ? M.voixB : 'lead';
    poseMelodie(sec);
  }
  // LA MÉLODIE de la phrase, posée sur la grille EN COURS (rappelée quand la frénésie bascule au milieu d'une phrase : sinon la mélodie
  // calculée pour les accords sombres restait sur les accords revenus — un si♭ sur un la mineur, vu au banc d'endurance)
  function poseMelodie(sec) {
    // A : le thème · A′ : le thème, la réponse un cran plus haut · B : son motif à elle · C : la question du thème, la réponse d'une 3e phrase
    const th = M.motifs[0], ph = sec === 'B' ? M.motifs[1] : sec === 'B2' ? M.motifs[1].map(([st, d, l, r]) => st >= 80 && !r ? [st, clamp(d + 2, -2, 5), l, r] : [st, d, l, r]) : sec === 'A2' ? th.map(([st, d, l, r]) => st >= 96 && !r ? [st, clamp(d + 1, -2, 5), l, r] : [st, d, l, r])
      : sec === 'C' ? th.filter(x => x[0] < 64).concat(M.motifs[2].filter(x => x[0] >= 64)) : th;
    const c0 = M.C.reg + (sec === 'B' || sec === 'B2' ? 2 : 0); meloPas = {}; let prev = c0;
    ph.forEach(([st, deg, len, role]) => { const bar = Math.floor(st / 16), A = grille[bar % 4], fort = st % 4 === 0;
      const ok = role === 'f' ? [A.r] : role === 'o' ? A.pcs.filter(p => p !== A.r) : fort ? A.pcs : A.gamme;
      const visee = c0 + deg * 2; let best = null, bs = 1e9;
      for (let m = c0 - 7; m <= c0 + 12; m++) { if (!ok.includes(pc(m))) continue; const sc = Math.abs(m - visee) + Math.abs(m - prev) * .35 + (Math.abs(m - prev) > 7 ? 3 : 0); if (sc < bs) { bs = sc; best = m; } }
      if (best == null) return; prev = best; (meloPas[st] = meloPas[st] || []).push([best, Math.min(len, 16 - st % 16), bar, role]); });
    calculeGuides();
  }
  function calculeGuides() {   // LE CONTRE-CHANT : les notes-guides (tierce, septième) de chaque accord, menées au plus court, entre mi4 et fa5
    guides = []; let g0 = 70;
    for (let b = 0; b < 8; b++) { const A = grille[b % 4]; let best = g0, bs = 1e9; for (let m = 64; m <= 77; m++) if (A.guides.includes(pc(m)) && Math.abs(m - g0) < bs) { bs = Math.abs(m - g0); best = m; } guides.push(best); g0 = best; }
  }
  function regleElements(t) {
    if (!M) return;
    const a = id => M.rang[id] > 0 && tier >= M.rang[id], frappe = a('i_frappe') ? { kick: 1.6, snare: 2.2, hat: 1.5, fant: 1.5 } : {};   // dB
    const E = rampeE(); frappe.hat = (frappe.hat || 0) + .5 * E; frappe.snare = (frappe.snare || 0) + 1.2 * E; frappe.kick = (frappe.kick || 0) + 1.4 * E; frappe.fant = (frappe.fant || 0) + 1 * E;
    frappe.basse = (frappe.basse || 0) + 1 * E + (M.C.basseDb || 0);
    if (M.C.dB) for (const k in M.C.dB) frappe[k] = (frappe[k] || 0) + M.C.dB[k];   // (trio) le mix écrit de chaque morceau (la caixa en texture, le ganzá discret)
    // (ZEPPELIN II / III) LES ÉTAPES (Léo : « à partir de 10, que ça aille un peu plus vite, mais pas juste le tempo — c'est nul quand ça devient
    // juste plus aigu et plus rapide : un truc d'intensité ») : la vitesse qu'on SENT vient des motifs qui se resserrent (la basse en croches,
    // les charleys en doubles, le piano en stride puis en pompe de croches, les cuivres en rafales), le tempo et la tonalité ne bougent plus
    if (M.C.etapes) { const E9 = Object.assign({}, M.pat); M.ordre.forEach(id => { if (M.C.etapes[id] && a(id)) Object.assign(E9, M.C.etapes[id]); }); M.etP = E9; }
    if (M.C.gateDe && gateG) gateG.gain.setTargetAtTime(a(M.C.gateDe) ? .7 : (M.C.gate || 0) * .9, t, .3);   // (ZEPPELIN II) la caisse claire des années 80 (réverbe coupée)
    if (M.C.dub) { const P9 = { hat: 3.5, hatO: 3, snare: 3, roll: 2, fant: 2, sub: -3, kick: -1 }; for (const k in P9) frappe[k] = (frappe[k] || 0) + P9[k]; }   // (salle, dubstep : la caisse claire qui claque, le sous-grave qui ne noie pas)
    { const D9 = -10 * (1 - clamp((tier - 1) / 17, 0, 1)); for (const id in VOL) if (id !== 'fx') frappe[id] = (frappe[id] || 0) + D9; }   // (v3.10 : le début un peu plus loin — la montée, mesurée en salle) frappe.sub = (frappe.sub || 0) + (M.C.basseDb || 0);   // la rampe pousse le GRAVE
    const gb = gainBase(); if (!JEU.crashEnCours && Math.abs(gb - (M._gb || 0)) > 1e-4) { M._gb = gb; master.gain.setTargetAtTime(gb, t + .01, .4); }
    const W9 = M.W || {}, cl = W9.clarte > 0 ? 40 * Math.log10(W9.clarte) : 0, bd = +W9.basse_db || 0;   // les goûts mesurés : le haut plus discret, la basse plus lourde
    for (const id of ['hat', 'hatO', 'ride', 'roll']) frappe[id] = (frappe[id] || 0) + cl; for (const id of ['basse', 'sub', 'basse2']) frappe[id] = (frappe[id] || 0) + bd;
    for (const id in VOL) { if (id === 'fx') continue; const g = bus[id].gain, on = a(id) || (M.calme && M.calme[id] && tier < M.rang[id]) || (id === 'basse2' && (a('i_basse') || a('i_basseOct'))), tr9 = ((M.trim && M.trim[id]) || 0) + (frappe[id] || 0);
      g.cancelScheduledValues(t); g.setTargetAtTime(on ? VOL[id] * Math.pow(10, tr9 / 20) : 0, t, on ? SD : .08); }
    if (!(JEU.volPas >= 0)) { revOut.gain.cancelScheduledValues(t); revOut.gain.setTargetAtTime((M.C.revB || .34) + (a('i_large') || a('i_sature') ? .1 : 0), t, .6); }
    const dur9 = +((M.C.sat || 1.25) + (a('i_sature') ? .65 : 0) + .45 * E).toFixed(2); if (sat._k !== dur9) { sat.curve = courbe(dur9); sat._k = dur9; }
    clairRegle(t);
    const e = a('lead') || a('echo') ? .6 + .4 * E : 0; for (const id in gIn) gIn[id].gain.setTargetAtTime(e * (id === 'lead' ? .4 : .22), t, .3);
    if (!(M.rang.modul > 0 && tier >= M.rang.modul)) MOD = 0;
    const vOn = M.rang.vinyl > 0 && tier >= M.rang.vinyl, vb = banque.sons.vinyl && banque.sons.vinyl[0];
    if (vOn && !vinylSrc && vb) { vinylSrc = ctx.createBufferSource(); vinylSrc.buffer = vb; vinylSrc.loop = true; vinylSrc.connect(bus.vinyl); vinylSrc.start(t); }
  }
  const clairOuvert = () => (M.rang.clarte > 0 && tier >= M.rang.clarte) || JEU.nitro || JEU.fren;
  const clairCible = () => clairOuvert() ? 16000 * Math.pow(Math.min(1, (M.W && M.W.clarte) || 1), 4.5) : (M.rang.i_filtre > 0 && tier >= M.rang.i_filtre ? M.C.ferme * 1.9 : M.C.ferme * (.45 + .55 * clamp((tier - 1) / 7, 0, 1)));   // (v6.0 : étouffé au 1er moteur)   // i_filtre : le son s'ouvre un peu
  const gramoCible = () => M.C.gramo && !clairOuvert() ? (M.rang.i_filtre > 0 && tier >= M.rang.i_filtre ? M.C.gramo * .55 : M.C.gramo) : 20;   // (trio) le pavillon : fermé → un peu ouvert (i_filtre) → grand ouvert (la clarté)
  function clairRegle(t, tau) { if (gramoF) { gramoF.frequency.cancelScheduledValues(t); gramoF.frequency.setTargetAtTime(gramoCible(), t, tau || .5); } if (M.balaye) return; clair.frequency.cancelScheduledValues(t); clair.frequency.setTargetAtTime(clairCible(), t, tau || .5); }
  function vinylStop() { if (vinylSrc) { try { vinylSrc.stop(); } catch (e) {} vinylSrc = null; } }

  // ================================================================ L'ÉTAT DU JEU (la philosophie d'intensité)
  const JEU = { nitro: false, vol: false, flow: .5, fren: false, frenDemande: null, volPas: -1, posePas: -1, poseGrade: null, nitroDepuis: 0, crashNitro: false };
  function regle(e) {
    if (!e) return; const now = ctx ? ctx.currentTime : 0;
    if (e.flow != null) JEU.flow = clamp(+e.flow || 0, 0, 1);
    if (e.nitro != null && !!e.nitro !== JEU.nitro) { JEU.nitro = !!e.nitro;
      if (ctx && M && playing) { if (JEU.nitro) { JEU.nitroDepuis = now; clairRegle(now, .08); son('riser', now + .02, .45, bus.fx, MES * 2, null, 2.4 / (MES * 2)); }
        else { clairRegle(now, .4); if (now - JEU.nitroDepuis > 1) JEU.crashNitro = true; } } }
    if (e.vol != null && !!e.vol !== JEU.vol) { JEU.vol = !!e.vol;
      if (JEU.vol) { JEU.volPas = step + (step % 2); JEU.posePas = -1;
        if (ctx && M && playing) { for (const id in sol) { sol[id].gain.cancelScheduledValues(now); sol[id].gain.setTargetAtTime(.04, now, .03); }   // tout de suite (pas après l'avance de l'horloge)
          hpM.frequency.cancelScheduledValues(now); hpM.frequency.setTargetAtTime(420, now, .25); revOut.gain.cancelScheduledValues(now); revOut.gain.setTargetAtTime((M.C.revB || .34) + .26, now, .4); } } else if (JEU.volPas >= 0) { JEU.posePas = Math.ceil(step / 4) * 4; if (JEU.posePas - step < 1) JEU.posePas += 4; } }
    if (e.frenesie != null && !!e.frenesie !== JEU.fren) JEU.frenDemande = !!e.frenesie;
  }
  function evenement(nom, x) {
    if (!ctx || !M || !playing) return; const t = ctx.currentTime + .02;
    if (nom === 'pose') { JEU.poseGrade = x || 'normal'; if (JEU.vol) { regle({ vol: false }); return; } son('impact', t, x === 'lourd' ? .7 : .4, bus.fx); if (x === 'parfait' || x === 'divin') { son('crash', t, .5, bus.fx, 2); gerbe(t); } }
    if (nom === 'crash') { JEU.crashEnCours = true; const g = master.gain; g.cancelScheduledValues(t); g.setTargetAtTime(0, t + .05, .25);
      clair.frequency.cancelScheduledValues(t); clair.frequency.setValueAtTime(Math.max(200, clair.frequency.value), t); clair.frequency.exponentialRampToValueAtTime(180, t + .6); son('impact', t, 1, bus.fx);
      setTimeout(() => { api.stop(); JEU.crashEnCours = false; if (master) master.gain.setTargetAtTime(gainBase(), ctx.currentTime + .3, .05); }, 1400); }
  }
  function gerbe(t) { const A = grille[0]; if (!A) return; const ns = A.v.concat(A.v.map(m => m + 12)); ns.forEach((m, k) => note('pluck', m + 12, t + k * SD / 2, SD * 1.2, .55, bus.fx, null, A)); }

  // ================================================================ LES TRANSITIONS — un RÉPERTOIRE (v3.1 : « l'effet de transition est un peu répétitif »)
  // tiré selon la couleur (C.trans), jamais les deux derniers ; une marche d'intensité appelle une transition plus légère ; avant la batterie,
  // pas de trou. k = 0 … 3 : les quatre doubles croches avant le 1er temps (tAct).
  function choisitTrans(leger) {
    const W9 = Object.assign({}, M.C.trans), a = id => M.rang[id] > 0 && tier >= M.rang[id];
    if (leger) { W9.rien = (W9.rien || 1) * 2; W9.filtre = (W9.filtre || .5) + 1; W9.souffle = (W9.souffle || .5) + .5; }
    if (!a('kick')) { W9.trou = 0; if (W9.toms) W9.toms *= .3; if (W9.hats) W9.hats *= .5; }
    if (!a('basse')) W9.glisse = 0;
    M.transDer.forEach(x => { if (x !== 'rien') W9[x] = 0; }); if (M.transDer[0] === 'rien' && M.transDer[1] === 'rien') W9.rien = 0;
    const ks = Object.keys(W9).filter(k => W9[k] > 0); let r = R() * ks.reduce((p, k) => p + W9[k], 0), ch = ks[ks.length - 1] || 'rien';
    for (const k of ks) { r -= W9[k]; if (r <= 0) { ch = k; break; } }
    M.transDer.unshift(ch); M.transDer.length = Math.min(M.transDer.length, 2); (M.journal = M.journal || []).push(ch); if (M.journal.length > 40) M.journal.shift(); return ch;
  }
  function trou(t, tAct) { const g = master.gain, v = gainBase(); g.cancelScheduledValues(t); g.setValueAtTime(v, t); g.linearRampToValueAtTime(v * .08, t + .03); g.setValueAtTime(v * .08, tAct - .012); g.linearRampToValueAtTime(v, tAct + .004); }
  function execFill(f, k, t, B, tAct) {
    if (f === 'rien') return;
    if (f === 'roll') { son('snare', t, .2 + .14 * k, bus.fx); son('snare', t + SD / 2, .16 + .14 * k, bus.fx); }
    else if (f === 'toms') son(k < 2 ? 'tomH' : 'tomL', t, .65 + .1 * k, bus.fx);
    else if (f === 'hats') { son('hat', t, .3 + .15 * k, bus.fx); son('hat', t + SD / 2, .25 + .15 * k, bus.fx); if (k === 3) son('hat', t + SD * .75, .5, bus.fx); }
    else if (f === 'run') note('pluck', B.v[Math.min(k, B.v.length - 1)] + 12, t, SD * 1.5, .6, bus.fx, null, B);
    else if (f === 'souffle') { if (k === 0) sonFin('revcrash', tAct, 4 * SD, .55, bus.fx); }                                     // la cymbale à l'envers
    else if (f === 'trou') { if (k === 2) trou(t, tAct); }                                                                          // un trou d'une croche, puis tout retombe
    else if (f === 'filtre') { if (k === 0 && !M.balaye) { clair.frequency.cancelScheduledValues(t); clair.frequency.setTargetAtTime(520, t, SD * .9); clair.frequency.setTargetAtTime(clairCible(), tAct, .03); } }
    else if (f === 'glisse') { if (k === 2) { const m = est808(M.tim.basse) ? (B.basse - 12 < 30 ? B.basse : B.basse - 12) : B.basse; note('basse', m, t, SD * 2.2, .8, bus.fx, m - 7, B); } }   // la basse glisse vers l'accord
    else if (f === 'appel') { son('tomH', t, .5 + .1 * k, bus.fx); if (k % 2 === 1) son('tomH', t + SD / 2, .45 + .1 * k, bus.fx); if (k === 3) son('snare', t + SD / 2, .8, bus.fx); }   // (trio) l'APPEL du repinique (CARNAVAL)
    else if (f === 'scratch') { if (k === 0) son('scratch', t, .5, bus.fx); else if (k === 2) son('scratch', t, .42, bus.fx, null, null, 1.12); }   // (trio) le SCRATCH (LE CASSE)
    else if (f === 'begaie') { const ns = B.v.concat(B.v.map(x => x + 12)); for (let j = 0; j < 2; j++) { note('pluck', ns[(k * 2 + j) % ns.length] + 12, t + j * SD / 2, SD * .45, .5 + .1 * k, bus.fx, null, B); son('hat', t + j * SD / 2, .4, bus.fx); } }
  }
  function arrivee(t, ancien) {
    if (M.rang.modul > ancien && M.rang.modul <= tier) MOD = M.modul;
    if (tier <= ancien) return;
    if (grand) { son('crash', t, .7, bus.fx, 2.2); if (M.build !== 'filtre') son('impact', t, .7, bus.fx); else clairRegle(t, .03); return; }
    if (M.trans === 'filtre') clairRegle(t, .03);
    const a9 = rp(['rien', 'rien', 'rien', 'impact', 'cymbale'].filter(x => x === 'rien' || x !== M.arrDer)); M.arrDer = a9;   // plus de coup sourd à chaque moteur
    if (a9 === 'impact') son('impact', t, .22, bus.fx); else if (a9 === 'cymbale') son('crash', t, .22, bus.fx, 1.6);
  }

  // ================================================================ UNE DOUBLE CROCHE
  const vel = (pat, bar, i) => { const c = pat[((bar % (pat.length / 16)) | 0) * 16 + i]; return c === 'X' ? 1 : c === 'x' ? .75 : c === 'o' ? .4 : c === 'H' || c === 'L' ? 1 : 0; };
  function arpNote(mode, A, i) { const ns = A.v.concat(A.v.map(m => m + 12)), n = ns.length;
    if (mode === 'up16') return ns[i % n];
    if (mode === 'up8') return i % 2 ? null : ns[(i >> 1) % n];
    if (mode === 'rand8') return i % 2 ? null : ns[Math.floor(R() * n)];
    return i < 8 ? ns[i % n] : ns[n - 1 - (i % n)]; }
  // LA SIGNATURE, jouée (toujours sur les notes de l'accord : fondamentale, quinte, octave, tierce)
  const revPad = {};
  function signature(k, dest, s, i, b8, t, tt, A, B, fl) {
    const r0 = A.basse, ph = b8 === 0 || b8 === 4;   // la fondamentale (ré2 → do#3) ; les débuts de demi-phrase
    if (k === 'moteur') { if (ph && i === 0) note('moteur', r0, t, SD * 3, .85, dest, r0 - 7, A, SD * 2.5);   // vroum : il monte sur la fondamentale…
      if (ph && i === 4) note('moteur', r0 + 7, t, SD * 1.8, .8, dest, r0, A, SD * .6);                      // … la quinte…
      if (ph && i === 6) note('moteur', r0 + 12, t, SD * 2, .8, dest, r0 + 7, A, SD * .5); }                // … l'octave
    else if (k === 'turbo') { if (b8 % 2 === 1 && i === 14) { const m = r0 + 48 > 98 ? r0 + 36 : r0 + 48; son('turbo', t, .7, dest); note('siffle', m, t + SD * .5, SD * 2, .5, dest, m - 5, A, SD * 1.2); } }
    else if (k === 'caisse') { if (b8 % 4 === 0 && i === 0) { son('ka', t, .6, dest); note('ching', 72 + pc(A.r), t + .05, 1.5, .7, dest, null, A); }   // ka-ching sur la tonique, toutes les 4 mesures…
      else if (b8 % 2 === 1 && i === 12 && R() < .55 + fl * .3) note('ching', 72 + pc(A.v[A.v.length - 1]), t, 1, .45, dest, null, A); }                  // … et un petit « ching » sur le dernier temps
    else if (k === 'pieces') { if (i % 4 === 2 && R() < .3 + fl * .35) note('piece', A.v[Math.floor(R() * A.v.length)] + 24, tt, .45, .55 + R() * .25, dest, null, A);
      if (b8 === 7 && i >= 12) { const ns = A.v.slice().reverse(); for (let j = 0; j < 2; j++) note('piece', ns[((i - 12) * 2 + j) % ns.length] + 24, t + j * SD / 2, .4, .6, dest, null, A); } }
    else if (k === 'neon') { if (b8 % 2 === 0 && i === 0) note('neon', r0 + 12, t, MES * 1.5, .7, dest, null, A); if (R() < .04) son('hat', t + R() * SD, .12, dest); }
    else if (k === 'klaxon') { if ((b8 === 3 || b8 === 7) && (i === 12 || i === 14)) { const v = i === 12 ? .42 : .55, d9 = SD * (i === 12 ? 1.2 : 1.8);
      note('klaxon', r0 + 24, t, d9, v, dest, null, A); note('klaxon', r0 + 24 + A.tierce, t, d9, v * .8, dest, null, A); } }
    else if (k === 'gouttes') { if (R() < .06 + fl * .08) note('pluck', A.v[Math.floor(R() * A.v.length)] + 24, tt + R() * SD * .3, SD * 3, .45 + R() * .2, dest, null, A); }
    else if (k === 'vapeur') { if (b8 % 2 === 1 && i === 0) { const src = banque.acc.pad && banque.acc.pad[B.cle]; if (src) { const rv = revPad[B.cle] || (revPad[B.cle] = inverse(src));
      const sv = ctx.createBufferSource(), g = ctx.createGain(), d = Math.min(MES * .95, rv.duration); sv.buffer = rv; g.gain.value = .5; sv.connect(g); g.connect(dest); suit(sv); sv.start(t + MES - d, rv.duration - d); sv.stop(t + MES + .02); } } }
    else if (k === 'drift') { if (b8 % 2 === 1 && i === 8) { const m = r0 + 31; note('crisse', m, t, SD * 7, .42 + fl * .2, dest, m - 1, A, SD * 2); } }   // les pneus qui crissent, sur la quinte, en glissade
    else if (k === 'sirene') { if (b8 === 4 && i === 0) { const refs = banque.voix.sirene; if (refs && refs.length) { const ref = refs[0], m1 = r0 + 31, m2 = r0 + 36, sv = ctx.createBufferSource(), g = ctx.createGain();   // la quinte ↔ l'octave
      sv.buffer = ref.buf; const rt = m => Math.pow(2, (m + MOD - ref.m) / 12); sv.playbackRate.setValueAtTime(rt(m1), t); for (let j = 1; j <= 4; j++) sv.playbackRate.linearRampToValueAtTime(rt(j % 2 ? m2 : m1), t + j * MES / 4);
      g.gain.setValueAtTime(.35, t); g.gain.linearRampToValueAtTime(0, t + MES); sv.connect(g); g.connect(dest); suit(sv); sv.start(t); sv.stop(t + MES + .02);
      if (VERIF.on) { VERIF.n += 2; if (!A.gamme.includes(pc(m1)) || !A.gamme.includes(pc(m2))) VERIF.hors++; } } } }
    // (trio) LE CHAMPAGNE (ZEPPELIN) : le bouchon saute sur le 1er temps toutes les huit mesures, les bulles remontent sur les notes de l'accord
    // pendant cette mesure ; à mi-phrase, deux coupes qui trinquent (la fondamentale et la tierce de l'accord)
    else if (k === 'champagne') { if (b8 === 0 && i === 0) son('bouchon', t, .75, dest);
      if (b8 === 0 && i >= 3 && i % 2 === 1 && R() < .6) note('bulle', A.v[Math.floor(R() * A.v.length)] + 24, tt + R() * SD * .4, .16, .3 + R() * .15, dest, null, A);
      if (b8 === 4 && i === 0) { note('ching', 72 + pc(A.r), t, 1.2, .38, dest, null, A); note('ching', 72 + pc(A.r + A.tierce), t + .035, 1.2, .3, dest, null, A); } }
    // (trio) L'AGOGÔ (CARNAVAL) : deux cloches, la tonique (la grave) et la quinte (l'aiguë) DE LA TONALITÉ — elles ne suivent pas les accords,
    // comme les vraies ; deux motifs qui se répondent d'une mesure à l'autre
    else if (k === 'agogo') { const P9 = ['H.L.H.LLH.L.HL..', 'H.L.H.L.L.H.L.L.'][Math.floor(s / 16) % 2], c9 = P9[i];
      if (c9 === 'H' || c9 === 'L') { const L9 = 64 + pc(M.ton - 64), m = c9 === 'H' ? L9 + 7 : L9;   /* la tonique entre mi4 et ré♯5 */ note('agogo', m, tt + (R() - .5) * .006, .5, c9 === 'H' ? .62 : .55, dest, null, A); } }
    // (trio) LA CUÍCA (CARNAVAL) : elle rit — « u-í » qui monte, « í-u » qui retombe — sur la fondamentale, la tierce et la quinte de l'accord, au médium
    else if (k === 'cuica') { const r9 = 62 + pc(A.r - 62), tz = r9 + A.tierce;   // (la fondamentale entre ré4 et do♯5)
      const C9 = b8 % 2 ? [[2, r9, r9 - 5, 1.6], [6, tz, tz + 5, 1.2], [10, r9, r9 - 5, 1.2], [12, r9 + 7, r9, 2.4]] : b8 % 4 === 2 ? [[10, tz, tz - 4, 1.4], [14, r9, r9 + 5, 1.6]] : [];
      C9.forEach(([st, m, de, d9]) => { if (st === i) note('cuica', m, tt, SD * d9, .7, dest, de, A, SD * .45); }); }
    // (trio) LE COFFRE-FORT (LE CASSE) : à la 7e mesure la molette tourne (un cran par croche, puis par double croche), à la 8e elle ralentit
    // et s'arrête ; au 1er temps de la phrase suivante, le VERROU cède sur la fondamentale (avec la grosse caisse)
    else if (k === 'coffre') { if (b8 === 6 && (i >= 8 || i % 2 === 0)) son('clic', tt, .45 + .2 * R(), dest);
      if (b8 === 7 && (i < 4 || (i < 9 && i % 2 === 0) || i === 11)) son('clic', tt, .55, dest);
      if (b8 === 0 && i === 0 && s > 16) note('verrou', A.basse + 12 > 61 ? A.basse : A.basse + 12, t, .9, .85, dest, null, A); }
  }
  const FREN_PAT = { kick: 'X......x..x..x..', snare: '........X.......', hat: 'xxx.x.xxxxx.x.xx' };
  function pas(s, t) {
    const i = s % 16, bar = Math.floor(s / 16), b8 = bar % 8, P = M.etP || M.pat, rg = M.rang, C = M.C, fl = JEU.flow;
    const sw9 = P.swing != null ? P.swing : M.swing, s89 = P.swing8 != null ? P.swing8 : C.swing8;   // (ZEPPELIN II : une étape peut redresser le balancement)
    const h = () => (R() - .5) * .008, tt = t + (i % 2 ? sw9 * SD : 0) + (s89 ? s89 * SD * [0, .33, .67, .33][i % 4] : 0), E = rampeE();   // (trio) swing8 : les croches balancées (ZEPPELIN)   // E : la rampe du 15 au 30
    // LE VOL : à la croche la batterie et la basse se retirent, le grave se coupe, la réverbe s'ouvre ; LA POSE : tout retombe sur le temps
    if (s === JEU.volPas) { for (const id in sol) { sol[id].gain.cancelScheduledValues(t); sol[id].gain.setTargetAtTime(.04, t, .03); }
      hpM.frequency.cancelScheduledValues(t); hpM.frequency.setTargetAtTime(420, t, .25); revOut.gain.cancelScheduledValues(t); revOut.gain.setTargetAtTime((M.C.revB || .34) + .26, t, .4); }
    if (s === JEU.posePas) { for (const id in sol) { sol[id].gain.cancelScheduledValues(t); sol[id].gain.setValueAtTime(1, t); }
      hpM.frequency.cancelScheduledValues(t); hpM.frequency.setTargetAtTime(20, t, .02); revOut.gain.cancelScheduledValues(t); revOut.gain.setTargetAtTime(M.C.revB || .34, t, .3);
      son('impact', t, JEU.poseGrade === 'lourd' ? .75 : .5, bus.fx); if (JEU.poseGrade === 'parfait' || JEU.poseGrade === 'divin') { son('crash', t, .55, bus.fx, 2); gerbe(t); }
      JEU.poseGrade = null; JEU.volPas = -1; JEU.posePas = -1; }
    const enVol = JEU.volPas >= 0 && s >= JEU.volPas;
    // LA NITRO LÂCHÉE (tenue plus d'une seconde) : la cymbale sur le temps
    if (JEU.crashNitro && i % 4 === 0) { JEU.crashNitro = false; son('crash', t, .5, bus.fx, 2); }
    // LA FRÉNÉSIE : elle entre et sort à la mesure
    if (i === 0 && JEU.frenDemande != null) { if (JEU.frenDemande !== JEU.fren) { JEU.fren = JEU.frenDemande; grille = grilleDe(M.sec); poseMelodie(M.sec); son('crash', t, .6, bus.fx, 2.2); son('impact', t, .7, bus.fx); clairRegle(t, .1); } JEU.frenDemande = null; }
    const fren = JEU.fren, A = grille[b8 % 4], B = b8 === 7 ? grilleDe(M.forme[M.phr % 4])[0] : grille[(b8 + 1) % 4];   // B = l'accord qui vient (même de la phrase suivante)
    // LA RESPIRATION (section C) · LE FILTRE QUI BALAIE (VELOURS) · LE RETOUR (cymbale)
    const resp = M.resp && b8 < 2;
    if (M.resp && b8 === 1) { if (i === 0) son('riser', t, .45, bus.fx, MES, null, 2.4 / MES); if (i >= 8) son('snare', t, .1 + (i - 8) * .06, bus.fx); }
    if (M.resp && b8 === 2 && i === 0) { son('crash', t, .6, bus.fx, 2); son('impact', t, .6, bus.fx); }
    if (M.choc && b8 === 0 && i === 0 && rg.kick > 0 && tier >= rg.kick && s !== activation) { son('crash', t, .5, bus.fx, 2); son('impact', t, .32, bus.fx); }
    if (M.balaye && i === 0) { const fo = clairCible(), f = 380 * Math.pow(fo / 380, b8 / 7);
      clair.frequency.cancelScheduledValues(t); clair.frequency.setTargetAtTime(f, t, b8 === 0 ? .04 : MES * .35); if (b8 === 6) son('riser', t, .4, bus.fx, MES * 2, null, 2.4 / (MES * 2)); }
    const has = id => rg[id] > 0 && tier >= rg[id] && !(resp && GROOVE.has(id)) && !(enVol && GROOVE.has(id)) && !(M.repos && M.repos.has(id));
    // LES TRANSITIONS
    let coupe = false;
    if (activation >= 0 && s < activation) { const k = activation - s, tAct = t + k * SD, bt = M.build;
      if (grand && bt === 'filtre') {   // la mesure qui se ferme (filtre vers 420 Hz), la cymbale à l'envers, et tout se rouvre sur le 1er temps
        if (k === 16 && !M.balaye) { clair.frequency.cancelScheduledValues(t); clair.frequency.setTargetAtTime(420, t, MES * .3); }
        if (k === 8) sonFin('revcrash', tAct, 8 * SD, .6, bus.fx); if (k <= 4) son('snare', t, .15 + (4 - k) * .1, bus.fx); coupe = k <= 2; }
      else if (grand && bt === 'dub') {   // LA MONTÉE DUBSTEP : le roulement de caisse accélère (noires, croches, doubles), le souffle, UN TEMPS DE SILENCE, et le drop
        if (k === 16) { son('riser', t, .55, bus.fx, MES, null, 2.4 / MES); if (!M.balaye) { clair.frequency.cancelScheduledValues(t); clair.frequency.setValueAtTime(Math.max(400, clair.frequency.value * .3), t); clair.frequency.exponentialRampToValueAtTime(14000, t + MES * .75); } }
        const pas9 = k > 12 ? 4 : k > 8 ? 2 : 1; if (k > 4 && (16 - k) % pas9 === 0) { son('snare', t, .14 + (16 - k) * .045, bus.fx); if (k <= 8) son('snare', t + SD / 2, .14 + (16 - k) * .045, bus.fx); }
        if (k === 4) trou(t, tAct); coupe = k <= 4; }
      else if (grand) { if (k === 16) son('riser', t, .5, bus.fx, MES, null, 2.4 / MES);   // la montée : souffle, roulement — ou le TROU d'une croche avant l'arrivée
        if (k <= 8 && !(bt === 'trou' && k <= 2)) { son('snare', t, .12 + (8 - k) * .07, bus.fx); if (k <= 4) son('snare', t + SD / 2, .12 + (8 - k) * .07, bus.fx); }
        if (bt === 'trou' && k === 2) trou(t, tAct); coupe = k <= 4; }
      else if (k <= 4) execFill(M.trans, 4 - k, t, B, tAct); }
    if (s === activation) { const ancien = tier; tier = cible; activation = -1; regleElements(t); arrivee(t, ancien); }
    // LES FINS DE PHRASE (passé le 6e moteur, une fois sur deux) : une transition du répertoire vers la phrase suivante
    if (b8 === 7 && i === 12) M.ff = tier >= 6 && !M.resp && !(activation >= 0 && activation - s <= 20) && !(rg.i_monte > 0 && tier >= rg.i_monte) && R() < .5 + .45 * E ? choisitTrans(false) : null;
    if (M.ff && b8 === 7 && i >= 12) execFill(M.ff, i - 12, t, B, t + (16 - i) * SD);
    if (M.ff && b8 === 0 && i === 0) { if (M.ff === 'filtre') clairRegle(t, .03); M.ff = null; }
    const souffle = b8 === 7 && i >= 12 && !has('final');
    // LA BATTERIE
    const dbl9 = has('double') && C.pat.kickD, pk = fren ? FREN_PAT.kick : dbl9 ? C.pat.kickD : P.kick, ps = fren ? FREN_PAT.snare : dbl9 ? C.pat.snareD : P.snare,   /* (trio) LA POURSUITE (LE CASSE) : la batterie en double tempo */ ph = fren ? FREN_PAT.hat : (has('double') || has('i_dense') || JEU.nitro) && P.hatD ? P.hatD : P.hat;
    if (has('kick') && !coupe && !souffle) { const x = vel(pk, bar, i); if (x) { son('kick', t, x, bus.kick); if (has('pompe') || C.pompe > .5) { const g = pompeBus.gain; g.cancelScheduledValues(t); g.setValueAtTime(has('pompe') ? Math.max(.2, C.pompe - .12 * E - (has('i_pulse') ? .1 : 0)) : .8, t); g.linearRampToValueAtTime(1, t + SD * 3.4); } } }
    if (has('kick') && fl > .65 && i === 14 && b8 % 2 === 1 && !coupe && !fren && R() < fl - .4) son('kick', t, .55, bus.kick);   // le flow : une grosse caisse qui relance
    if (has('final') && i === 14 && b8 % 2 === 1 && !coupe) son('kick', t, .6, bus.kick);
    if (has('i_relance') && !coupe && !souffle && !fren && b8 % 2 === 1 && (i === 14 || (i === 11 && R() < .4)) && !vel(pk, bar, i)) son('kick', t, .62, bus.kick);   // les relances
    if (has('snare') && !coupe) { const x = vel(ps, bar, i); if (x) son('snare', tt + h(), x, bus.snare); }
    // (v6.0) LE CALME : avant sa marche, la grosse caisse bat comme un cœur, les charleys marquent les temps tout doux
    const cal = id => M.calme && M.calme[id] && !(rg[id] > 0 && tier >= rg[id]) && !fren && !(enVol && GROOVE.has(id)) && !(resp && GROOVE.has(id)) && !(M.repos && M.repos.has(id));
    if (cal('kick') && !coupe && !souffle && (i === 0 || (i === 8 && b8 % 2 === 1))) son('kick', t, i ? .3 : .45, bus.kick);
    if (cal('hat')) { if (M.hatQ == null) { let q = 2; for (let j = 0; j < 16; j += 4) if (vel(P.hat, 0, j)) q = 0; M.hatQ = q; } if (i % 4 === M.hatQ) { const x = vel(P.hat, bar, i) || .6; son('hat', tt + h(), x * .7, bus.hat); } }   // (salle : à .4 ils étaient 25 dB sous la basse, inaudibles)
    if (has('fant')) { const x = vel(P.fant, bar, i); if (x || (i % 2 === 1 && R() < fl * .12 + E * .16)) son('snare', tt + h(), .28 + R() * .1, bus.fant); }   // les fantômes, plus nombreux quand le flow monte
    if (has('hat')) { const x = vel(ph, bar, i); if (x) son('hat', tt + h(), x * (.82 + R() * .3), bus.hat); }
    if ((has('roll') || (fren && has('hat'))) && i >= 12 && (b8 % 2 === 1 || R() < .1 + fl * .3)) { son('hat', t, .3 + .1 * (i - 12), bus.roll); son('hat', t + SD / 2, .26 + .1 * (i - 12), bus.roll); if (fren && i === 15) son('hat', t + SD * .75, .5, bus.roll); }
    if (has('hatO')) { const x = vel(P.hatO, bar, i); if (x) son('hatO', tt + h(), x, bus.hatO); }
    if (has('perc')) { const c = P.perc[((bar % (P.perc.length / 16)) | 0) * 16 + i]; if (c === 'H' || c === 'L') son(c === 'H' ? 'percH' : 'percL', tt + h(), .8 + R() * .2, bus.perc); else if (c === 'x' || c === 'o') son('shaker', tt + h(), (c === 'x' ? 1 : .6) * (.85 + R() * .3), bus.perc); }
    if (has('ride') && (has('double') ? i % 2 === 0 : i % 4 === 0)) son('ride', t, .8, bus.ride, .7);
    if (has('toms') && (b8 === 3 || b8 === 7) && i >= 12) son(i < 14 ? 'tomH' : 'tomL', t, .9, bus.toms);
    // LES MARCHES DU 15 AU 28 (v3.4) : chaque fin de 4 mesures monte (souffle · roulement · toms, à tour de rôle) ; la batterie s'emballe
    // (toms toutes les 2 mesures, cymbale toutes les 4) ; et, passé la moitié de la rampe, la cymbale toutes les 4 mesures de toute façon
    const libreFin = !(activation >= 0 && activation - s <= 16) && !resp && !enVol, monte = has('i_monte'); let cymb = false;
    if (monte && libreFin && b8 === 3 && i >= 12) son('snare', t, .14 + (i - 12) * .06, bus.fx);   // à mi-phrase : un petit roulement seulement
    if (monte && libreFin && b8 === 7) { const k9 = (M.monteK || 0) % 3;
      if (k9 === 0) { if (i === 0) son('riser', t, .2 + .15 * E, bus.fx, MES, null, 2.4 / MES); if (i >= 12) son('snare', t, .2 + (i - 12) * .08, bus.fx); }
      else if (k9 === 1) { if (i >= 8) { son('snare', t, .14 + (i - 8) * .05, bus.fx); if (i >= 12) son('snare', t + SD / 2, .16 + (i - 8) * .05, bus.fx); } }
      else if (i >= 8 && i % 2 === 0) son(i < 12 ? 'tomH' : 'tomL', t, .6 + .05 * (i - 8), bus.fx);
      if (i === 15) M.monteK = (M.monteK || 0) + 1; }
    if (monte && b8 === 0 && i === 0 && s !== activation && !resp && !enVol) { son('crash', t, .24 + .16 * E, bus.fx, 1.8); cymb = true; }
    if (has('i_tambours') && libreFin && b8 % 2 === 1 && i >= 12 && !(monte && b8 % 4 === 3) && !(M.ff && b8 === 7)) { son(i < 14 ? 'tomH' : 'tomL', t, .5 + .08 * (i - 12), bus.fx); if (i % 2) son('snare', t + SD / 2, .22 + .06 * (i - 12), bus.fx); }
    if (has('i_tambours') && !cymb && b8 === 0 && i === 0 && s !== activation && !resp && !enVol) { son('crash', t, .22 + .12 * E, bus.fx, 1.6); cymb = true; }
    if (E > .45 && !cymb && b8 === 0 && i === 0 && has('kick') && s !== activation && !has('final') && !resp) son('crash', t, .12 + .12 * E, bus.fx, 1.5);
    if (has('final') && b8 % 4 === 0 && i === 0 && s !== activation && !cymb) son('crash', t, .3, bus.fx, 1.8);
    // LES BASSES : calées sur la grosse caisse, et sur le dernier temps une note qui AMÈNE l'accord suivant (basse2)
    const ivDe = (iv, Ax) => iv === 't' ? Ax.tierce : iv, b808 = est808(M.tim.basse);
    if (has('basse')) { const bp = fren && !b808 ? [[0, 0, 6], [7, 0, 3], [10, 12, 6]] : has('i_basse') ? M.patL.basse[M.patL.basse.length - 1] : P.basse;   // i_basse : la variante la plus active
      bp.forEach(([st, iv, len, vv]) => { if (st !== i) return; let m = A.basse + ivDe(iv, A);
        if (b808) { m -= 12; if (m < 30) m += 12; note('basse', m, t, SD * len * .95, .9, bus.basse, last808, A); last808 = m; }
        else note('basse', m, tt, SD * len * .9, vv || .85, bus.basse, null, A);
        if (has('i_basseOct')) note('basse', m + 12, tt, SD * len * .85, .42, bus.basse2, null, A); }); }   // la basse doublée à l'octave
    if ((has('basse2') || has('i_basse')) && i === 14 && B.r !== A.r) { const cb = B.basse; let best = null, bs = 99;   // la note de passage : un pas de la gamme vers la fondamentale suivante
      for (let m = cb - 2; m <= cb + 2; m++) if (m !== cb && A.gamme.includes(pc(m)) && Math.abs(m - cb) < bs) { bs = Math.abs(m - cb); best = m; }
      if (best != null) note('basse', b808 && best - 12 >= 30 ? best - 12 : best, tt, SD * 1.8, .7, bus.basse2, null, A); }
    if ((has('basse2') || has('i_basseOct')) && (i === 7 || i === 15) && !b808 && B.r === A.r) note('basse', A.basse + 12, tt, SD * .9, .55, bus.basse2, null, A);
    if (has('nw') && P.nw && !fren) P.nw.forEach(([st, iv]) => { if (st === i) note('nwb', A.basse + ivDe(iv, A), tt, SD * (P.nwLen || 1.6), .85, bus.nw, null, A); });   // (ZEPPELIN II) la basse new wave
    if (cal('basse') && (i === 0 || i === 8)) { let m = A.basse; if (b808) { m -= 12; if (m < 30) m += 12; } note('basse', m, tt, SD * 7.4, .55, bus.basse, null, A); }   // (v6.0) la basse tient ses notes
    if (cal('sub') && i === 0) note('sub', A.basse - 12 >= 28 ? A.basse - 12 : A.basse, t, MES * .95, .5, bus.sub, null, A);
    if (has('sub') && i === 0 && (!b808 || b8 % 4 === 0)) note('sub', A.basse - 12 >= 28 ? A.basse - 12 : A.basse, t, MES * (b808 ? 1.9 : .95), .8, bus.sub, null, A);
    // LES ACCORDS (menés)
    if (has('pad') && i === 0) accordJoue('pad', M.transf && M.transf.pad === 'reverse' ? B : A, t, MES * .98, .8, bus.pad);   // (à l'envers : l'accord QUI VIENT, aspiré)
    const kp = has('i_keys') && M.patL.keys.length > 1 ? M.patL.keys[M.patL.keys.length - 1] : P.keys;
    if (has('keys')) kp.forEach(([st, len]) => { if (st === i) accordJoue('keys', A, tt + h(), SD * len, st === 0 ? .85 : .68, bus.keys); });
    if (cal('keys') && (i === 0 || i === 8)) accordJoue('keys', A, tt + h(), SD * 7.5, i ? .4 : .5, bus.keys);   // (v6.0) les accords posés, deux par mesure
    if (cal('pad') && i === 0) accordJoue('pad', A, t, MES * .98, .5, bus.pad);
    if (has('i_pulse') && i % 4 === 2) { const sb = has('stab') ? 'stab' : 'keys'; accordJoue(sb, A, tt, SD * 1.1, .38 + .15 * E, bus[sb]); }   // la pulsation des contretemps
    if (has('stab')) P.stab.forEach(([st, len]) => { if (st === i) accordJoue('stab', A, tt + h(), SD * len * 1.4, .7, bus.stab); });
    if (has('cordes') && i === 0) accordJoue('cordes', A, t, MES * .98, .8, bus.cordes);
    const chop9 = P.chop || C.pat.chop, cuiv9 = P.cuiv || C.pat.cuiv;   // (les étapes peuvent les resserrer)
    if (has('choeur')) { if (chop9) chop9[bar % chop9.length].forEach(([st, len]) => { if (st === i) accordJoue('choeur', A, tt + h(), SD * len * 1.3, .75, bus.choeur); });   // le chœur haché (2-step)
      else if (i === 0) accordJoue('choeur', A, t, MES * .98, .8, bus.choeur); }
    if (has('cuivres') && cuiv9) cuiv9[bar % cuiv9.length].forEach(([st, len]) => { if (st === i) accordJoue('cuivres', A, tt + h(), SD * len, st === 0 ? .8 : .66, bus.cuivres); });   // les cuivres de l'eurobeat
    else if (has('cuivres') && ((i === 0 && (bar % 2 === 0 || has('final'))) || (i === 10 && has('final')))) accordJoue('cuivres', A, t, SD * (i === 0 ? 4 : 2), .75, bus.cuivres);
    // LA MÉLODIE (la phrase ; la partie B la confie à la corde pincée ; le flow l'orne d'une appoggiature ; la nitro la monte d'une octave)
    const mp = !fren ? meloPas[b8 * 16 + i] : null, vx = M.voixMel === 'haut' ? 'lead' : M.voixMel, vm = vx !== 'lead' && banque.voix[vx] && banque.voix[vx].length ? vx : 'lead';
    const secB = M.sec === 'B' || M.sec === 'B2', oB = (has('i_sommet') && !secB) || (M.voixMel === 'haut' && secB) ? 12 : 0;   // i_sommet : la mélodie une octave plus haut
    if (has('lead') && mp) mp.forEach(([m, len, , role]) => { let o = oB; if (m + o > 84) o -= 12;   // (v3.11 : plus d'octave en nitro)
      if (fl > .65 && len >= 3 && R() < fl - .45) { let g9 = null; for (const d of [1, 2]) if (A.gamme.includes(pc(m + d))) { g9 = m + d; break; } if (g9 != null) note(vm, g9 + o, tt - SD * .25, SD * .25, .5, bus.lead, null, A); }
      const gl = vm === 'lead' && M.tim.lead === 'theremine' && M.precL != null && Math.abs(M.precL - (m + o)) <= 12 ? M.precL : null;   // le thérémine glisse
      note(vm, m + o, tt, SD * len, vm === 'pluck' ? .95 : .8, bus.lead, gl, A, SD * .7); M.precL = m + o;
      if (has('octave')) note('lead', m - 12, tt, SD * len, .6, bus.octave, null, A);
      if (has('harmo')) { let h3 = null; for (const d of [3, 4]) if (A.gamme.includes(pc(m - d))) { h3 = m - d; break; } if (h3 != null) note(vm, h3, tt, SD * len, .6, bus.harmo, null, A); } });
    if (cal('lead') && mp && b8 % 4 < 2) mp.forEach(([m, len]) => note(vm, m, tt, SD * len, .5, bus.lead, null, A));   // (v6.0) la mélodie se devine
    if (has('foule') && mp && M.sec !== 'B' && M.sec !== 'B2') mp.forEach(([m, len]) => note('foule', m - 12, tt, SD * len, .7, bus.foule, null, A));   // le chœur de stade chante le thème
    if (has('foule') && !fren && b8 % 2 === 1 && i === 12 && !enVol) son('hey', tt, .55, bus.foule);   // « HÉ ! »
    if (has('tribu')) { const c9 = P.tribu[((bar % (P.tribu.length / 16)) | 0) * 16 + i]; if (c9 === 'L' || c9 === 'H') son(c9 === 'H' ? 'tomH' : 'tomL', tt + h(), (c9 === 'H' ? .8 : .9) * (.85 + R() * .25), bus.tribu); }   // les toms en rythme
    if (fren && has('lead') && i % 4 === 0 && R() < .5) note('lead', A.v[Math.floor(R() * A.v.length)] + 12, tt, SD * 2, .6, bus.lead, null, A);   // en frénésie : des coups de mélodie sur l'accord sombre
    if (has('contre') && i === 0) note('contre', guides[b8], t, MES * .95, .7, bus.contre, null, A);
    if (has('arp')) { const md = (fl > .75 || E > .5) && (P.arp === 'up8' || P.arp === 'rand8') ? 'updown16' : P.arp, m = arpNote(md, A, i); if (m != null) note('pluck', m + (md.endsWith('8') ? 12 : 0), tt + h(), SD * (md.endsWith('8') ? 2.2 : 1.3), .7, bus.arp, null, A); }
    if (has('sig')) signature(M.sig, bus.sig, s, i, b8, t, tt, A, B, fl);
    if (has('sig2')) signature(M.sig2, bus.sig2, s, i, b8, t, tt, A, B, fl);
    // LA WOB (dubstep) : la note tenue (ou hachée par la porte du style), le filtre écrit pour la mesure, calé au tempo
    if (has('wob') && C.dub && !fren) { const m0 = A.basse, D9 = C.dub, gate = D9.gate;
      if (i === 0) { const L9 = has('i_riddim') && D9.dur ? D9.dur : D9.wubs, w9 = L9[(bar + (M.wubDec || 0)) % L9.length], N9 = 128, cv = new Float32Array(N9), lo = D9.lo, hi = D9.hi * (has('i_sature') ? 1.2 : 1);
        for (let j = 0; j < N9; j++) { const u = j / N9, bt9 = Math.min(3, Math.floor(u * 4)), r = w9[bt9], ph = (u * 4 - bt9); let x;
          if (r === 'S') x = ph; else if (!r) x = .05; else { const q = (ph * r) % 1; x = .5 - .5 * Math.cos(2 * Math.PI * q); }
          cv[j] = lo * Math.pow(hi / lo, x); }
        try { wobF.frequency.cancelScheduledValues(t); wobF.frequency.setValueCurveAtTime(cv, t, MES * .995); } catch (e) {}
        if (!gate) note('wob', m0, t, MES * .97, .9, wobIn, null, A); }
      if (gate) gate.forEach(([st, len]) => { if (st === i) note('wob', m0, t, SD * len * .95, .9, wobIn, null, A); }); }
    if (i === 0 && bar % 4 === 0 && M.C.dub) M.wubDec = Math.floor(R() * 4);   // (les motifs de wub tournent, tirés toutes les 4 mesures)
    if (has('growl') && C.dub && !fren) { const pat9 = C.dub.growl || []; pat9.forEach(([st, len, iv]) => { if (st !== i) return; const m = A.basse + (iv === 7 ? (A.pcs.includes((A.r + 7) % 12) ? 7 : 0) : iv || 0);
      note('growl', m, tt, SD * len * .95, .85, bus.growl, null, A); }); }
    if (has('i_triolet') && has('hat') && i === 12 && (b8 % 2 === 1 || R() < .3)) for (let j = 0; j < 6; j++) son('hat', t + j * SD * 4 / 6, .35 + j * .07, bus.roll);   // les triolets de charleys
    if (has('cloche') && ((i === 0 && b8 % 4 === 0) || (i === 8 && R() < .25 + fl * .2))) note('cloche', A.v[A.v.length - 1] + 12, t, 2, .7, bus.cloche, null, A);
  }

  // ================================================================ L'HORLOGE
  function tempo() { const c = (M.bpm0 + (M.bpm1 - M.bpm0) * (tier - 1) / 29) * (JEU.fren ? 1.04 : 1) * (1 + (M.C.tempoFixe ? 0 : .02) * rampeE()); if (Math.abs(c - BPM) < .01) return;   // (ZEPPELIN II / III : tempoFixe)
    BPM += clamp(c - BPM, -1.5, 1.5); SD = 60 / BPM / 4; MES = 16 * SD; dlyL.delayTime.setTargetAtTime(SD * (M.C.dly || 3), nextTime, .1); dlyR.delayTime.setTargetAtTime(SD * (M.C.dly || 3), nextTime, .1); }
  const entrants = (a, b) => M ? M.ordre.filter(id => M.rang[id] > a && M.rang[id] <= b) : [];   // ce qui entre entre les moteurs a (exclu) et b
  const nomMoteur = k => !M ? '' : entrants(k - 1, k).map(id => nomEl(M, id)).join(' + ') || 'la musique s’intensifie';
  function planifie() { let a = (Math.floor(step / 16) + 1) * 16; if (a - step < 4) a += 16;
    grand = cible > tier && entrants(tier, cible).some(id => GRANDS.has(id) || (M.C.grands && M.C.grands.includes(id)));   /* (ZEPPELIN II / III : `grands`) */ if (grand && a - step < 16) a += 16; activation = a;
    if (grand && M.C.dub && entrants(tier, cible).some(id => id === 'wob' || id === 'growl')) { M.build = 'dub'; (M.journal = M.journal || []).push('GRAND:drop'); }   // LE DROP
    else if (grand) { M.build = rp(['montee', 'trou', 'filtre'].filter(x => x !== M.buildDer && x !== M.transDer[0])); M.buildDer = M.build; (M.journal = M.journal || []).push('GRAND:' + M.build); }   // trois façons de monter, jamais deux fois la même
    else { const nx = entrants(tier, tier + 1)[0]; M.trans = choisitTrans(cible < tier || (nx && nx.startsWith('i_'))); } }
  // LA SALLE DU STYLE (v3.6) : une réverbe neuve, en fondu (l'ancienne s'éteint puis se débranche) ; ses réponses gardées en cache
  function salleMet() { const S = M.C.salle || [2.6, 1], cle = S.join(','), t = ctx.currentTime; if (dFb) dFb.forEach(g => g.gain.setTargetAtTime(M.C.fb || .34, t, .3));
    try { retoucheMet(t); } catch (e) { erreurs++; }
    if (cle === revCle) return; revCle = cle;
    const cv = ctx.createConvolver(), g = ctx.createGain(); cv.buffer = IRS[cle] || (IRS[cle] = ir(S[0], S[1], S[2])); g.gain.value = revC ? 0 : 1; revIn.connect(cv); cv.connect(g); g.connect(rHpG);
    if (revC) { g.gain.setTargetAtTime(1, t, .3); const o = revC; o.g.gain.setTargetAtTime(0, t, .3); setTimeout(() => { try { revIn.disconnect(o.cv); o.cv.disconnect(); o.g.disconnect(); } catch (e) {} }, 2500 + S[0] * 1000); }
    revC = { cv, g }; }
  function retoucheMet(t) {   // (v5.0) LA RETOUCHE de la musique : pleurage lo-fi, bande qui sature et pleure dans l'écho, réverbe coupée
    const C = M.C, lo = C.lofi || 0; wowG.gain.setTargetAtTime(lo * .0022, t, .3); flutG.gain.setTargetAtTime(lo * .00028, t, .3);
    dSat.curve = C.bande ? courbe(1 + C.bande * 1.6) : null; dWow.gain.setTargetAtTime((C.bande || 0) * .0025, t, .3); gateG.gain.setTargetAtTime((C.gate || 0) * .9, t, .3);
    // LA BOUE, musique par musique (salle, v5.0 : des accords plaqués en croches au milieu du clavier, un orgue, une wob qui descend bas
    //  remplissaient 250-500 Hz jusqu'à 26 % de l'énergie, contre ~9 % chez les musiques aimées) : le creux de chaque piste s'adapte
    const dens = ((M.pat && M.pat.keys) || []).length, X = { keys: (dens >= 6 ? -3 : dens >= 4 ? -1.5 : 0) + (M.tim.keys === 'orgue' ? -2 : 0), pad: M.tim.pad === 'scie' ? -1.5 : 0,
      wob: C.dub && C.dub.lo < 150 ? -2 : 0, stab: C.hyb ? -1.5 : 0, cuivres: C.hyb ? -1.5 : 0, contre: M.tim.contre === 'orgue' ? -2 : 0,
      lead: ['cuivre', 'carre', 'saxo', 'accordeon', 'scie', 'talkbox', '@saxo', '@trompette', '@clarinette'].includes(M.tim.lead) ? -3 : -1.5, octave: -1.5 };   // (la mélodie vit dans 250-500 Hz depuis v3.11 : 12 dB au-dessus des autres là)
    for (const id in boueF) boueF[id].gain.setTargetAtTime(BOUE[id] + (X[id] || 0), t, .3); }
  function installe(r) { M = r.M; banque = r.b; try { vraisMenage(new Set([...(M.vraisF || []), ...((prepa && prepa.M && prepa.M.vraisF) || [])])); } catch (e) {} MOD = 0; vinylStop(); last808 = null; retient(M); for (const k in revPad) delete revPad[k]; try { salleMet(); } catch (e) { erreurs++; }
    BPM = M.bpm0 + (M.bpm1 - M.bpm0) * (tier - 1) / 29; SD = 60 / BPM / 4; MES = 16 * SD; }
  function bascule() { installe(suivant); suivant = null; prepa = null; const d = Math.ceil(step / 128) * 128 - step; step += d; if (activation >= 0) activation += d;
    if (JEU.volPas >= 0) JEU.volPas += d; if (JEU.posePas >= 0) JEU.posePas += d;
    dlyL.delayTime.setTargetAtTime(SD * (M.C.dly || 3), nextTime, .05); dlyR.delayTime.setTargetAtTime(SD * (M.C.dly || 3), nextTime, .05); regleElements(nextTime); }
  function horloge() {
    const now = ctx.currentTime;
    if (nextTime < now - .02) { const k = Math.ceil((now - nextTime) / SD); step += k; nextTime += k * SD; }
    while (nextTime < now + .35) {
      if (step % 16 === 0) { if (suivant) bascule(); tempo(); }
      if (step % 128 === 0) { nouvellePhrase(); regleElements(nextTime);   // l'énergie de la nouvelle partie
        if (RENOUV > 0 && M.phr >= RENOUV && !prepa && !suivant) api.nouvelle(); }   // À L'INFINI : une musique neuve se prépare et prendra le relais
      if (cible !== tier && activation < 0) planifie();
      if (step % 6 === 0) try { agcTick(); } catch (e) {}
      try { pas(step, nextTime); } catch (e) { erreurs++; if (!derniere) derniere = String(e && e.message || e); }   // une note ratée n'arrête JAMAIS la musique
      nextTime += SD; step++;
    }
  }
  // LA MÉMOIRE DES PARTIES : ce que les deux dernières musiques ont joué devient très improbable (une musique NEUVE seulement ; la musique
  // tirée garde ces poids dans ses goûts → son numéro la rejoue à l'identique)
  const MEMO_CATS = ['couleur', 'keys', 'lead', 'basse', 'pad', 'sig', 'pluck', 'contre', 'cordes', 'snare', 'riser', 'phrase', 'kick', 'kickT', 'hatT', 'mode', 'cuivres', 'retouche', 'univers'];
  let HISTO = {}; MEMO_CATS.forEach(k => HISTO[k] = []);
  if (historique) MEMO_CATS.forEach(k => { if (Array.isArray(historique[k])) HISTO[k] = historique[k].slice(0, 5); });
  function oublie(W) { const W2 = Object.assign({}, W); MEMO_CATS.forEach(k => { const h = HISTO[k]; if (!h.length) return; const tab = Object.assign({}, W2[k]);
      const f9 = k === 'couleur' ? (da === 'cashcar' ? [0, 0, 0, 0, .4] : [0, 0, .4]) : k === 'mode' || k === 'univers' ? [.45] : k === 'lead' ? [0, .15, .45] : [0, .35]; h.slice(0, f9.length).forEach((x, j) => { if (x != null) tab[x] = (tab[x] == null ? 1 : tab[x]) * f9[j]; }); W2[k] = tab; }); return W2; }   // v3.4 : la DERNIÈRE musique est EXCLUE (zéro), rôle par rôle
  function retient(Mx) { const v = { couleur: Mx.cid, keys: Mx.tim.keys, lead: Mx.tim.lead, basse: Mx.tim.basse, pad: Mx.tim.pad, sig: Mx.sig, pluck: Mx.tim.pluck, contre: Mx.tim.contre,
      cordes: Mx.tim.cordes, snare: Mx.kit.snare, riser: Mx.kit.riser, phrase: Mx.phF, kick: Mx.kit.kt, kickT: Mx.kit.kickT, hatT: Mx.kit.hatT, mode: Mx.modeN, cuivres: Mx.tim.cuivres, retouche: Mx.retouche || 'aucune', univers: Mx.univers };
    MEMO_CATS.forEach(k => { HISTO[k] = [v[k]].concat(HISTO[k].filter((x, j) => j < (k === 'couleur' ? 4 : 2))); }); }
  function prepare(n, W) {
    if (n == null) { n = 1000 + Math.floor(R() * 9000); W = oublie(W || GOUTS || {}); }
    const Mx = compose(n, W); retoucheMx(Mx); const p = fabriqueBanque(Mx).then(b => ({ M: Mx, b })); prepa = { M: Mx, p }; return p; }
  async function demarre(n, W) {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (!chaineOk) chaine();
    let p = null, pr = null;
    try { p = prepare(n, W); demande = p; pr = await p; } catch (e) { erreurs++; derniere = String(e && e.message || e); p = prepare(null); demande = p; try { pr = await p; } catch (e2) { playing = false; return; } }   // une 2e chance, une autre musique
    if (demande !== p) return;
    try { await ctx.resume(); } catch (e) {}
    if (!playing) return;
    prepa = null; step = 0; activation = -1; tier = cible; installe(pr); dlyL.delayTime.value = dlyR.delayTime.value = SD * (M.C.dly || 3);
    Object.assign(JEU, { volPas: -1, posePas: -1, fren: false, frenDemande: null, crashNitro: false, poseGrade: null, crashEnCours: false });
    for (const id in sol) sol[id].gain.value = 1; hpM.frequency.value = 20; revOut.gain.value = M.C.revB || .34; master.gain.cancelScheduledValues(ctx.currentTime); master.gain.value = gainBase(); M._gb = master.gain.value;
    regleElements(ctx.currentTime + .05);
    nextTime = ctx.currentTime + .08; clearInterval(timer); timer = setInterval(horloge, 50); horloge();
  }

  // (2026-10-15, pôle SON) LES RETOUCHES (bibliothèque › Pouce bleu, les V2 des notes de Léo) : start(n, W, O) — O.retouche(Mx, outils) après compose,
  // O.voix[nom](outils, Tm) / O.acc[nom](outils, Tm) remplacent une voix ou un accord ; O.style force la couleur enregistrée (v6). Sans O : rien ne change.
  let OPT = null;
  const OUTILS = Mx9 => ({ rng: graine(((Mx9 && Mx9.n) | 0) * 31 + 7), tp, tpw, tr, R, graine, CATALOGUE, osc, envG, vib, bruit, OUT, courbe, metal, panne, ks, mtof, GAMMES,
    phrase: typeof phrase === 'function' ? phrase : null, menes: typeof menes === 'function' ? menes : null,
    NOM_LEAD: typeof NOM_LEAD !== 'undefined' ? NOM_LEAD : null, NOM_KEYS: typeof NOM_KEYS !== 'undefined' ? NOM_KEYS : null, NOM_PLUCK: typeof NOM_PLUCK !== 'undefined' ? NOM_PLUCK : null });
  function retoucheMx(Mx) { if (!OPT || OPT.n !== Mx.n || typeof OPT.retouche !== 'function') return;
    try { OPT.retouche(Mx, OUTILS(Mx)); Mx.rang = {}; CATALOGUE.forEach(id => Mx.rang[id] = 0); Mx.ordre.forEach((id, k) => Mx.rang[id] = k + 1); }
    catch (e) { erreurs++; derniere = 'retouche : ' + String(e && e.message || e); } }
  const api = {
    start(n, W, O) { if (playing) return; playing = true; OPT = O ? Object.assign({}, O, { n }) : null; demarre(n, W); },
    stop() { playing = false; demande = null; suivant = null; prepa = null; clearInterval(timer); timer = 0; vinylStop();
      if (master) { const t = ctx.currentTime; for (const id in bus) if (id !== 'fx') { bus[id].gain.cancelScheduledValues(t); bus[id].gain.setTargetAtTime(0, t, .05); } } },
    nouvelle(n, W) { if (!playing || !M) return; let p; try { p = prepare(n, W); } catch (e) { erreurs++; derniere = String(e && e.message || e); prepa = null; return; } p.then(r => { if (playing && prepa && prepa.p === p) suivant = r; }).catch(e => { erreurs++; derniere = String(e && e.message || e); if (prepa && prepa.p === p) prepa = null; }); },
    setRenouvelle(k) { RENOUV = Math.max(0, k | 0); },   // 0 : la même musique pour toujours
    setTier(p, nb) { const n = nb && nb !== 30 ? Math.round(1 + (clamp(p, 1, nb) - 1) * 29 / Math.max(1, nb - 1)) : p; cible = clamp(Math.round(n), 1, 30); },
    setSpeed(x) { cible = clamp(1 + Math.round(clamp(x, 0, 1) * 29), 1, 30); },
    setVolume(v) { volume = v; if (master) { master.gain.setTargetAtTime(gainBase(), ctx.currentTime, .1); if (M) M._gb = gainBase(); } },
    setGouts(W) { GOUTS = W || null; },
    regle, evenement,
    nomElement: k => nomMoteur(clamp(k, 1, 30)),
    get elements() { return M ? Array.from({ length: 30 }, (_, k) => nomMoteur(k + 1)) : []; },
    get tier() { return tier; }, get bpm() { return BPM; }, get playing() { return playing; },
    get historique() { const h = {}; MEMO_CATS.forEach(k => h[k] = HISTO[k].slice()); return h; },   // (à garder d'une séance à l'autre)
    get jeu() { return { nitro: JEU.nitro, vol: JEU.vol, flow: JEU.flow, frenesie: JEU.fren }; },
    get tirage() { if (!M) return null; return { version: VERSION, da, n: M.n, titre: M.titre, style: M.C.nom + ' · ' + M.C.dit, styleId: M.cid, couleur: M.C.nom, idee: M.idee, signature: M.sig, signature2: M.sig2, transitions: (M.journal || []).slice(),
      ton: JEU.fren ? NOTES_FR[(M.ton + MOD) % 12] + ' sombre (frénésie)' : MOD ? NOTES_FR[(M.ton + MOD) % 12] + ' ' + NOM_MODE[M.modeN] + ' (un ton plus haut)' : M.tonNom,
      bpm: Math.round(BPM), bpm0: M.bpm0, bpm1: M.bpm1, grilles: M.grilles.map(g => g.map(A => A.nom).join(' · ')), ordre: M.ordre.slice(),
      section: { A: 'A (le thème)', A2: 'A′ (le thème varié)', B: 'B (le couplet)', C: 'C (le retour)' }[M.sec] + (M.resp ? ' · respiration' : '') + (M.balaye ? ' · filtre qui balaie' : '') + (JEU.fren ? ' · FRÉNÉSIE' : ''),
      clavier: nomV(M.tim.keys, NOM_KEYS), melodie: nomV(M.tim.lead, NOM_LEAD), basse: nomV(M.tim.basse, NOM_BASSE), arpege: nomV(M.tim.pluck, NOM_PLUCK), contreChant: nomV(M.tim.contre, NOM_CONTRE), nappe: nomV(M.tim.pad, NOM_PAD),
      vrais: Object.values(M.tim).filter(x => typeof x === 'string' && x[0] === '@').map(x => NOM_VRAI[x.slice(1)]).concat(Object.keys(M.kitV || {}).length ? ['percussions réelles (' + Object.keys(M.kitV).join(', ') + ')'] : []), retouche: M.retouche, univers: NOM_UNIVERS[M.univers] + (M.univers !== 'electro' ? ' (' + M.famille + (M.heros ? ', héros : ' + (M.heros === 'lead' ? 'la mélodie' : 'le clavier') : '') + ')' : ''), effets: Object.entries(M.transf || {}).map(([r, x]) => ({ keys: 'clavier', pad: 'nappe', lead: 'mélodie' })[r] + ' en ' + NOM_TRANSF[x]),
      caisse: M.kit.snare, prod: NOM_KICK[M.kit.kickT] + ' · ' + NOM_HAT[M.kit.hatT] + ' · ' + nomSalle(M.C.salle || [2.6]), courbe: { melodie: M.rang.lead, grosseCaisse: M.rang.kick, double: M.rang.double, modul: M.rang.modul }, phrase: NOM_PHRASE[M.phF] + (M.phFB !== M.phF ? ' · couplet : ' + NOM_PHRASE[M.phFB] : ''), prepare: !!prepa, themeAime: M.themeAime,
      traits: { style: M.cid, couleur: M.cid, sig: M.sig, de: null, genes: [], mode: M.modeN, keys: M.tim.keys, lead: M.tim.lead, basse: M.tim.basse, vamp: M.vamp, phrase: M.phF, theme: M.motifs[0].map(x => x.slice()) },
      gouts: M.W }; },
    get banqueMs() { return banque ? banque.ms : null; }, get banqueToutMs() { return banque ? banque.suiteMs || null : null; },
    get _bus() { return bus; }, get _banque() { return banque; }, get _verif() { return VERIF; }, get _chaine() { return { sol, hpM, clair, master, revOut, lim, step }; }, get _voix() { return { actives, pic: picVoix, sautes, erreurs, derniere, attaques }; },
    _compose: (n, W, O) => { if (O) OPT = Object.assign({}, O, { n }); const Mx = compose(n, W); retoucheMx(Mx); return { socle: Mx.socle, rang: Mx.rang, sig: Mx.sig, sig2: Mx.sig2, idee: Mx.idee, style: Mx.cid, ton: Mx.tonNom, ordre: Mx.ordre, titre: Mx.titre, bpm: [Mx.bpm0, Mx.bpm1], keys: Mx.tim.keys, lead: Mx.tim.lead, basse: Mx.tim.basse, pad: Mx.tim.pad, pluck: Mx.tim.pluck, contre: Mx.tim.contre,
      cordes: Mx.tim.cordes, snare: Mx.kit.snare, riser: Mx.kit.riser, kt: Mx.kit.kt, kickT: Mx.kit.kickT, hatT: Mx.kit.hatT, pluck: Mx.tim.pluck, cuivres: Mx.tim.cuivres, retouche: Mx.retouche, transf: Mx.transf, kitV: Mx.kitV, univers: Mx.univers, famille: Mx.famille, heros: Mx.heros, rangs: { lead: Mx.rang.lead, kick: Mx.rang.kick, clarte: Mx.rang.clarte, double: Mx.rang.double, modul: Mx.rang.modul }, phrase: [Mx.phF, Mx.phFB], forme: Mx.forme, modeN: Mx.modeN,
      grilles: Mx.grilles.map(g => g.map(A => A.nom + ' ' + A.v.join('.'))), theme: Mx.motifs[0] }; },
    _suite: (k, W) => { const h0 = JSON.stringify(HISTO), out = [];   // (banc) k musiques neuves d'affilée, avec la mémoire, sans les jouer
      for (let j = 0; j < k; j++) { const Mx = compose(1000 + Math.floor(R() * 9000), oublie(W || GOUTS || {})); retient(Mx);
        out.push({ n: Mx.n, couleur: Mx.cid, keys: Mx.tim.keys, lead: Mx.tim.lead, basse: Mx.tim.basse, pad: Mx.tim.pad, sig: Mx.sig, pluck: Mx.tim.pluck, contre: Mx.tim.contre, cordes: Mx.tim.cordes,
          snare: Mx.kit.snare, riser: Mx.kit.riser, phrase: Mx.phF, kick: Mx.kit.kt, kickT: Mx.kit.kickT, hatT: Mx.kit.hatT, mode: Mx.modeN }); }
      HISTO = JSON.parse(h0); return out; },
    wake() { if (ctx && playing && ctx.state !== 'running') ctx.resume(); },
  };
  return api;
}
