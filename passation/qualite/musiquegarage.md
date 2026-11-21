# Lot qa/musiquegarage — « plus la musique du lobby dans le garage » (21/11)

Sacha, après le build 126 : « Dans mon build, j'ai plus la musique dans le garage. La musique version lobby, elle est plus là. »

## 2e manche (21/11 soir) : le trou PROVOQUÉ au banc, et corrigé

### Le défaut, provoqué sur le paquet de l'app
Le banc fait rater UN départ du lobby lié (`--rate charge:1` : le premier fetch de `musique-moteur.json` échoue, comme une lecture refusée sur un téléphone chaud). Sur le www de l'app
construit avec `app-ios/preparer-www.js --essai --sortie` depuis le dépôt AVANT le lot : le garage est muet À CHAQUE retour jusqu'à la fin de la séance (garage froid, 60 s, boutique 3D,
après la boutique, avant JOUER, après une vraie mort, mort + 20 s : tous à −200 dB, phase « erreur » puis « repos »). La console dit pourquoi :
« Lobby lié : … » puis « musique : fichier illisible …/paliers/rendus/nuit-de-velours/p1.m4a » : le repli (`musicMenuAncien`, `MENU_MUS`) vise un fichier que l'app n'embarque pas.
La musique de course, elle, part normalement au JOUER (−20 dB) : c'est exactement « plus la musique du lobby dans le garage ».

### La correction (`code/son/musique.js`, `code/son/musique-frenesie.js`, interrupteur `?sans=musiquegarage` = l'ancien à l'identique)
- (a) Un départ raté n'est plus une condamnation : `LOBBY_KO` reste le signe « en attente », et le lobby lié est RETENTÉ (`lobbyRelance`) à chaque retour vers un lieu où la musique
  s'entend (le garage depuis le ciel, la boutique 3D, l'écran de mort : la bascule `MUS_TAIT` vrai → faux, ou `garageOn` faux → vrai, dans `musicTick`) et à chaque `musicMenu` (après une
  mort, MUSIQUE rallumée). Borné : 4 s au moins entre deux essais, 8 essais par séance, jamais pendant qu'un départ charge (phase « charge » : `PB.lobby` n'en charge qu'un, rien d'autre ne
  décode au menu, le garde « un seul décodage » du régime calme est donc respecté), jamais si le lobby joue déjà.
- (b) Plus de repli sur un fichier quand le lobby lié attend : c'est le choix le plus sûr. Dans l'app le fichier n'existe pas ; et un fichier qui jouerait pendant qu'un nouvel essai part
  ferait deux musiques à la fois (le défaut de l'écran de mort du 5/11). Le bloc « musique du lieu » de `musicTick` ne relance plus `MENU_MUS` tant que le lobby attend (`lobbyAttend()`).
  `?lobby=ancien` (pas de lobby lié) garde le fichier fixe, inchangé.
- Boîte noire (RÉGLAGES › VERSION › COPIER), genre `musique` : « lobby lié raté : <raison> » à chaque départ raté (« (plus d'essai) » au 8e), « lobby lié relancé (garage|menu) » à chaque
  nouvel essai. Si Sacha revoit un garage muet, ces deux lignes (ou leur absence) disent si c'est ce chemin.

### Les mesures (iPhone 13 Pro émulé, www de l'app, sauvegarde riche, sortie lue par AnalyserNode, rien ne sort du Mac)
dB = RMS max de la sortie ; « −200 » = rien ne sort. AVANT = www de l'app fait depuis le dépôt sans le lot ; APRÈS = avec le lot. Vraie course (`--course 1`) sauf la dernière colonne.

| étape | AVANT, 1 départ raté | APRÈS, 1 départ raté | `?sans=musiquegarage`, 1 raté | AVANT, sans échec | APRÈS, sans échec | parcours court, avant / après |
|---|---|---|---|---|---|---|
| ciel / accueil / boutique de l'accueil (silence voulu) | −200 | −200 | −200 | −200 | −200 | −200 / −200 |
| garage froid | **−200 (erreur)** | lobby −26,5 | **−200** | lobby −27,5 | lobby −26,5 | −30 / −25 |
| garage 60 s, boutique 3D, retour, après la boutique, avant JOUER | **−200** | lobby −26 à −27 | **−200** | lobby −23 à −27 | lobby −25 à −27 | −23 à −30 / −25 à −37 |
| JOUER → 9 s (relevé 0,6 s) | intro puis course, −21 à −41 | course, −16 à −30 | intro puis course, −19 à −36 | course, −16 à −28 | course, −16 à −28 | — |
| course 15 s | −20 | −14 | −22 | −15 | −15 | (raccourci) −200 / −200 |
| écran de mort (relevé 0,6 s) | −200 | −200 | −200 | −200 | −200 | −200 / −200 |
| GARAGE depuis la mort → 9 s | **−200 (repos)** | lobby, −52 → −29 (fondu) | **−200** | lobby, −72 → −24 | lobby, −50 → −26 | — |
| garage après la mort, +20 s | **−200** | lobby −28 / −23 | **−200** | lobby −36 / −25 | lobby −25 / −25 | −22 −25 / −26 −27 |
| boîte noire | rien | « lobby lié raté : banc : fetch raté musique-moteur.json » ×1, « lobby lié relancé (garage) » ×1 | rien | rien | rien | rien |

- 0 exception de page sur les 9 passes. Aucun « fichier illisible » après le lot (avant : celui de `nuit-de-velours/p1.m4a` à chaque fois).
- `?sans=musiquegarage` redonne l'ancien au décibel près (muet partout au garage, même console).
- Sans échec, les niveaux du lobby et de la course sont les mêmes qu'avant (écarts de ±5 dB d'un morceau tiré à l'autre, comme entre deux passes d'avant).
- `outils/banc-musiquecalme/sim.cjs` par défaut et avec `FAILT=60000 FAILN=2` : sorties identiques octet pour octet avant et après (le lecteur `pouce-bleu-jeu.js` n'est pas touché).
- Gardes : `garde-demarrage`, `garde-allege`, `garde-charte` OK ; `assembler --verifier` OK.
- Un essai `--rate musique:1 --armer mort` (un fichier de musique refusé juste avant JOUER) n'a PAS fait rater le lobby : le fichier refusé était celui de la course (`piano-31`, `pal-aura-30/p1`),
  que le lecteur rattrape tout seul. Le chemin « relance au `musicMenu` après la mort » n'est donc pas montré au banc (seul celui du retour au garage l'est).
- Résultats bruts : `/private/tmp/claude-501/-Users-sachaberes-cash-car-qualite/f73d43a5-a4c1-4f2f-92ad-78d3cc403908/scratchpad/m2/r3/` (temporaire).

### Non vérifié (2e manche)
- Rien sur le téléphone : on ne sait toujours pas si c'est CE chemin que Sacha a entendu. La boîte noire du prochain build le dira (« lobby lié raté » présent ou non).
- Le départ raté est provoqué par un fetch refusé, pas par un vrai `decodeAudioData` qui échoue ou un délai dépassé sur WebKit ; le code les traite de la même façon (phase « erreur »).
- L'écran de mort est muet avant comme après (la musique de course s'arrête, le lobby repart au GARAGE) : pas touché.
- La piste `__ccAutreSon` (une autre app a pris le son) n'est pas traitée : ce n'est pas un défaut du jeu.

### Le banc étendu (outils/banc-musiquegarage/garage.cjs)
- `--rate charge:N|musique:N` : les N premiers fetch de la liste (ou des fichiers de musique) échouent ; `--armer mort` : armé juste avant le JOUER au lieu du chargement.
- `--course 1` : la VRAIE course. JOUER touché au garage (`#gJouer`), niveau et phase relevés toutes les 0,6 s pendant 9 s (lobby → course), 15 s d'auto-pilote, puis mains libres jusqu'à
  la vraie mort (la caisse tombe), l'offre de seconde chance refusée, GARAGE touché sur l'écran de mort (réessayé, au clic au besoin), relevé toutes les 0,6 s (course → lobby).
- Le relevé des pannes lit `cashcarErr` (les crochets `dbg*` n'existent pas dans le paquet de l'app) ; `R.boite` = les lignes `musique` du lobby.
- `passe.sh` : `QUI` réglable. ⚠ Sous zsh, des options mises dans UNE variable ne se coupent pas en mots : passer les options en clair ou par un tableau bash.

## 1re manche : PAS reproduit au banc, aucune correction

Le lobby lié joue dans le garage, et il y revient, dans tous les cas essayés. C'est vrai pour le 126 comme pour le 122, et pour le code du dépôt comme pour les VRAIS paquets web des apps installées
(`~/cash-car/ios-ultime-mesures/builds/build126.app/public` et `build122.app/public`). Je n'ai pas fabriqué de correction au hasard : rien n'est changé dans le jeu.

## Le banc (outils/banc-musiquegarage/)

- `garage.cjs` : le vrai jeu dans Chrome sans fenêtre, lancé avec `--mute-audio`, donc rien ne sort du Mac. La sauvegarde a `mus` à vrai, `sfx` et `vox` à faux. L'iPhone 13 Pro est émulé
  (844×390, DPR 3, tactile, UA iPhone, `?tel=1&appareil=iPhone14,2`).
  - `--verrou 1` : le volume des `<audio>` est en lecture seule, comme VOL_LOCKED sur iOS.
  - `--natif chaud|eco|critique` : pose `__ccThermique`/`__ccEco` avant le jeu, comme le fait l'app. Le régime calme de la musique est alors actif.
  - Chaque AudioContext est noté. Tout ce qui va vers la sortie passe aussi dans un AnalyserNode : on lit le niveau RMS réellement envoyé, en plus de `POUCE_JEU.phase` et du gain du lobby (`PB.ch.g`).
- Le parcours : intro, ciel, GARAGE (on réessaie jusqu'à `body.inGarage` sans `titreCiel`), 20 ou 60 s au repos, boutique 3D puis retour, accueil, BOUTIQUE (l'écran des caisses), accueil,
  GARAGE, une course (auto-pilote), la mort, GARAGE depuis l'écran de mort, puis +20 s.
- `passe.sh` lance la passe sous `verrou-banc.sh` et nettoie les profils.

## Le tableau (« JOUE » = phase lobby et niveau de sortie entre −20 et −38 dB RMS ; « muet » = −200 dB)

| cas | 126 (dépôt) | 122 (dépôt) | 126 app | 122 app |
|---|---|---|---|---|
| ciel / accueil (silence voulu depuis le 11/11) | muet | muet | muet | muet |
| garage au lancement à froid | JOUE (−25) | — ¹ | JOUE (−26) | JOUE (−27) |
| garage, 20 s au repos | JOUE | — ¹ | JOUE | JOUE |
| garage, 60 s au repos (éco, sauvegarde d'avant le tri) | — | — | JOUE (−26) | — |
| boutique 3D (la musique y joue depuis le 16/10) | JOUE | JOUE | JOUE | JOUE |
| garage après la boutique 3D | JOUE | — ¹ | JOUE | JOUE |
| garage après la BOUTIQUE de l'accueil | JOUE (−38/−25) | JOUE (−25) | JOUE (−24) | JOUE (−28) |
| garage après une mort | JOUE (−28/−36) | JOUE (−28) | JOUE (−24) | JOUE (−38) |
| garage, mort + 20 s | JOUE | JOUE | JOUE | JOUE |
| 126 dépôt, verrou + serious (`__ccThermique=2`) | JOUE partout au garage | | | |
| 126 dépôt, verrou + économie (`__ccEco=1`, régime calme) | JOUE partout au garage | | | |
| 126 app, sauvegarde d'AVANT le tri (parf10 et lave réussies, non prises) + éco | | | JOUE partout au garage | |
| sauvegarde NEUVE (leçon pas faite) | | | muet partout | muet partout |

¹ Au premier passage (passe p2, sans verrou), le toucher sur GARAGE est tombé pendant l'intro : l'écran est resté au ciel, et la passe ne compte pas. Les passes suivantes réessaient le toucher
(colonnes « app » et lignes verrou/chaud/éco).
Sauvegarde neuve : silence dans les DEUX builds, voulu (la leçon et son menu n'ont pas de musique, `leconSilence`).
Sur les 10 passes : 0 exception de page, aucune panne de genre son ou musique dans `dbgErreurs` (seulement « lancement : pas de lecture native », normal hors de l'app).
Les morceaux tirés : AURA (figé), NÉNUPHARS VELOURS (en segments : le chemin de musiquesecours), bleu-7299, bleu-6167, bleu-8154 et LUNE DE JADE.

Résultats bruts : `/private/tmp/claude-501/-Users-sachaberes-cash-car-qualite/f73d43a5-a4c1-4f2f-92ad-78d3cc403908/scratchpad/res/p2…p6/*.txt` (dossier temporaire, il sera vidé).

## Ce qui diffère vraiment entre le 122 et le 126 sur le téléphone

- Paquets web des apps (`diff -rq build122.app/public build126.app/public`) : `index.html`, `jeu.<hash>.js`, `pouce-bleu-jeu.js`, `maj.json`, et `chris-matin.m4a`. Ce dernier est réencodé par afconvert
  à chaque build (c'est la musique de la leçon, sans lien avec le lobby). `natif.js` et `qs.json` (`&perfrec=2`) sont identiques. Côté natif (Swift), rien n'a changé dans git entre les deux commits.
- `code/son/` : AUCUNE ligne changée. Dans tout le diff du 122 au 126, aucune ligne ajoutée n'écrit SND.music, mus, VOL.mus, musicMode, ni n'appelle musicStop, stopMusic ou POUCE_JEU.fin.
- `pouce-bleu-jeu.js` (musiquesecours) : trois lignes de `gardeCalme`. Elles ne jouent que pour un morceau EN SEGMENTS (seul NÉNUPHARS VELOURS, bleu-9551) et sous le régime calme. Au banc, en
  économie, NÉNUPHARS joue au garage.
- voitures-tri (`voitTriMigre`) ne touche ni au son ni aux réglages. boutiquegel (photos, chaîne de la caisse) et transitions (volet) ne touchent pas au son. La boutique ne fait plus taire le
  lobby depuis le 16/10 (`BQ_MUSIQUE`) : c'est pareil dans les deux builds.

## Les chemins propres à l'iPhone qui peuvent rendre le garage muet (lus, jamais vus au banc)

1. **Une autre app a le son** (`natif.js` §4, `autreParInterruption`). Une vidéo ou une musique lancée par-dessus fait passer le contexte en « interrupted ». L'app pose `__ccAutreSon=1` et le jeu entier
   se tait, la musique de course aussi, jusqu'à ce que Swift dise que plus personne ne joue. La boîte noire écrit alors : « contexte interrompu, page visible : une autre app a pris le son → jeu muet ».
2. **`LOBBY_KO` collé pour toute la séance** (`code/son/musique.js` l. 572). Il suffit d'un départ du lobby en phase « erreur » ou « vide » une seule fois : fichier figé illisible, décodage refusé
   par la mémoire, repli en direct impossible. Rien ne le remet à zéro, et le repli (`musicMenuAncien`) joue le fichier fixe de `MENU_MUS` : `paliers/rendus/nuit-de-velours/p1.m4a`. Or ce
   dossier est ABSENT des apps 122 et 126 : `preparer-www.js` le retire (l. 300, `RETIRE=['nuit-de-velours','neon-noir']`), et `rendus/` ne contient que `ciel-30`. Le garage serait donc muet
   jusqu'à la fin de la séance. Côté console : « Lobby lié : … ».
3. **Le lobby en attente pour toujours** (`pbjLobby`, `fixes`). Un départ pendant « PRESENTS » qui tire un morceau du générateur le met en attente (`PB.phase='repos'`, `PB.attente`). Personne ne le relance
   avant le prochain `musicMenu` (après une course). Mais `reveler` pose `INTROSON.t0` avant d'appeler `musicMenu`, donc ce chemin ne devrait pas servir.
4. **Le contexte du jeu endormi** (`initAudio` : SON et MUSIQUE coupés, ou SON coupé sans MUS_WA ni graphe) ou une horloge arrêtée au retour d'arrière-plan : c'est le veilleur de `natif.js` qui le
   rattrape, et il l'écrit dans la boîte noire.

Les points 2 et 3 existent tels quels dans le 122. Seul un changement de conditions (téléphone plus chaud, mémoire, morceau tiré) pourrait les faire apparaître sur le 126.

## La mesure qui trancherait (sur le 13 Pro, build 126)

Juste après un garage muet, sans relancer l'app : RÉGLAGES › toucher la ligne « VERSION … » › COPIER la boîte noire. Ce qu'on y lit :
- une ligne `son` « une autre app a pris le son » → point 1 : pas un défaut du jeu ;
- les lignes `musique` du départ (« figée <id> », « live (repli : …) ») et l'absence d'un « figée » au garage → points 2 et 3 ;
- les lignes `son` du veilleur (« contexte … relancé », « horloge arrêtée ») → point 4.

Si la boîte noire ne suffit pas, il faut une app de MESURE (`COMPLET=1`, crochets `dbg*` gardés) avec le pont CC BANC (mémoire « Banc dans l'app iPhone »). On y lit au garage `dbgLobby()`
(ko, peut, phase, morceau), `POUCE_JEU.err`, l'état de chaque AudioContext et `__ccAutreSon`. Cinq valeurs suffisent à nommer la cause. Un fichier fixe pour le repli du lobby dans l'app (point 2),
ou la remise à zéro de `LOBBY_KO` au retour au garage, seraient les corrections candidates. Elles ne sont à écrire qu'une fois la cause vue.

## Non vérifié

- Rien n'a été mesuré sur le téléphone : WebKit, session audio iOS, interruptions, décodage lent à chaud, mémoire.
- Le cas « après un donut » (burn-out au garage) n'a pas été joué. Son code (`interface/burn-out-*.js`) ne touche pas à la musique.
- Le cas « au chaud » est simulé seulement par les drapeaux de l'app, pas par un vrai processeur bridé.
- Pas de rejeu de `outils/banc-musiquecalme/sim.cjs` : aucune ligne de la musique n'a changé.
