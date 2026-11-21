# Lot qa/musiquegarage — « plus la musique du lobby dans le garage » (21/11)

Sacha, après le build 126 : « Dans mon build, j'ai plus la musique dans le garage. La musique version lobby, elle est plus là. »

## Verdict : PAS reproduit au banc, aucune correction

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
