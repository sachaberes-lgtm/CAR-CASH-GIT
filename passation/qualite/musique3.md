# LOT MUSIQUE3 — les 3 morceaux encore en direct dans l'app (15/11/2026, branche `qa/musique3`)

Demande de Sacha : « on les retire pas du tirage, cherche des solutions », sans rien changer à ce que le joueur entend.

## 1. Les faits (lus dans le code)

Le tirage de l'app est `assets/audio/music/favoris.json` (les ★ de Léo, v1390). Il contient 5 morceaux :

| Morceau | Id | Comment il joue sur le téléphone avant ce lot |
|---|---|---|
| AURA · 30 PALIERS | `pal-aura-30` | figé (fichiers) |
| ENSEIGNE DE JADE | `bleu-7299` | figé (fichiers) |
| **NÉNUPHARS VELOURS** | `bleu-9551` | **direct** : page « tout » `direct/nenuphars-velours.html` dans une iframe cachée |
| **LUNE DE JADE** | `bleu-6167` | **direct** : le générateur `musique-trente-v3-7.js` (graine 6167 + retouche) |
| **FIRE PRIME · TROMPETTE** | `avant:bleu-8154` | **direct** : la version d'AVANT, celle du générateur (graine 8154 + retouche), pas la page `fire-prime.html` |

Oui, les trois étaient bien en direct. `pouce-bleu-jeu.js` (`PB.charge`) ne remplace par du figé que les pages (`type 'html'`) qui ont une fiche dans `course/index.js`. NÉNUPHARS n'en avait pas, et les deux générateurs ne sont jamais remplacés.

**Pourquoi ils n'avaient pas été rendus** :
- Le 9/11, Fable a choisi 10 morceaux AVANT que Léo fixe ses favoris (v1390). NÉNUPHARS a été écarté par choix : il était rendable.
- Les deux générateurs étaient notés « non rendables en l'état » (`passation/MUSIQUE-FIGEE-INVENTAIRE.md`). Ils improvisent en continu : hasard non fixé, sections renouvelées, et un **enchaînement musical à chaque changement de moteur** (roulement, montée, entrée sur la mesure).
- Le 12/11 (Q1 de `PLAN-ULTIME.md`), Sacha a répondu « non » au rendu des 3. La question parlait de « ≈ +10 Mo, 30 min de machine » ; aucune autre raison n'est écrite.
- ⚠ **Le rendu de NÉNUPHARS fait dans ce lot va contre ce « non » du 12/11.** Il est derrière `?sans=musique3` et ne part sur main que si Sacha dit oui.

## 2. Ce que coûte chaque façon de jouer (mesuré)

Outil : `outils/banc-son/cout-musique.mjs` (Chrome sans fenêtre, muet, tout est rendu hors ligne, aucun son). Les mesures sont faites au palier 16, sur 40 s, Mac.

L'unité est **ms de calcul audio par seconde de musique**. Ces chiffres valent pour COMPARER entre eux. Ce ne sont pas des watts d'iPhone.

| Façon de jouer | ms/s | Nœuds créés en 40 s | Sources vivantes (moy./pic) |
|---|---|---|---|
| Figé : un fichier en boucle, derrière le bus du jeu | **5,0–5,4** | 11 | 1 / 1 |
| Page NÉNUPHARS en direct (p16) | **147–151** | 3 785 (1 187 oscillateurs) | 30 / 47 |
| Page NÉNUPHARS en direct (p30) | **189** | 6 063 (2 135 oscillateurs) | 53 / 78 |
| Page ENSEIGNE DE JADE en direct (p16, déjà figée) | 97 | 5 734 | 31 / 50 |
| Générateur LUNE DE JADE (p16) | **81** | 2 614 (0 oscillateur, 1 226 sources) | 10,6 / 18 |
| Générateur FIRE PRIME · TROMPETTE (p16) | **56** | 1 699 | 8,5 / 13 |

**Ce qu'on en tire** :
- **Le JS d'ordonnancement ne pèse rien** : ~1 ms par seconde pour la page comme pour les générateurs. La minuterie de la page tourne à 60 ms, celle du générateur à 50 ms ; le figé n'en a aucune.
- **Pour un générateur, presque tout le coût vient de la chaîne fixe, pas des notes.** Sans aucune note, LUNE DE JADE coûte encore 80 ms/s, et FIRE PRIME 48 ms/s.
- **Prix d'un nœud seul** (bruit stéréo, ms/s) :

  | Nœud | ms/s |
  |---|---|
  | Réverbe à convolution de 2,6 s | 61 |
  | Réverbe à convolution de 1 s | 32 |
  | Saturation suréchantillonnée ×2 | 7,4 |
  | 10 filtres | 10 |
  | Compresseur | 4 |
  | Écho avec retour | 1,1 |

- **La salle (réverbe) du générateur pèse à elle seule 27 ms/s sur LUNE DE JADE et 16 sur FIRE PRIME** : mesuré en la débranchant, pour l'attribution seulement. Le reste vient du bus du jeu (sa propre convolution), de la saturation, des compresseurs et des filtres des pistes actives.
- La banque de sons d'un générateur se fabrique à chaque départ : 116–152 ms avant la première note, puis 330–440 ms de complément en arrière-plan.

## 3. La solution choisie

### NÉNUPHARS VELOURS : rendu figé, fidèle au direct (fait)

Il passe de ~150–190 ms/s à **~5 ms/s, soit environ 30 à 35 fois moins**. Trois choix le rendent plus fidèle que les 10 premiers rendus :
1. **30 fichiers, un par palier.** Les 10 autres sont regroupés par 3 moteurs, donc un élément peut entrer 1 à 2 moteurs en retard. Ici le jeu demande le palier m et entend le palier m, exactement comme la page en direct.
2. **Le même hasard que le direct.** Le rendu reprend le LCG du lecteur de la page (graine 95510, lue dans la page). La salle, le ressort et les bruits sont donc ceux que le joueur entend. Les 10 autres sont rendus avec un autre hasard : leur salle est « une autre salle de même taille ». Mode `direct: true` dans `outils/musique/rendre-paliers.mjs`, fonction `rendDirect` de `outils/musique/rendu.html`.
3. **Le même déroulé que dans le jeu.** La page est jouée une mesure à la fois depuis la mesure 0, la première à +0,7 s (l'avance réelle du jeu). La boucle gardée est son premier passage sur la phrase qui suit l'élan.

**Rendu vérifié.** Le rendu hors ligne de Chrome n'est pas toujours le même. La cause est prouvée : la boucle de l'écho (retard + retour) est calculée de deux façons possibles d'un rendu à l'autre. Sans le retour de l'écho, le rendu est stable 2 fois sur 2. Chaque palier est donc rendu jusqu'à obtenir deux rendus égaux (2 ou 3 essais par palier, noté dans `rapport.json`). Aucun fichier douteux ne peut être écrit.

**Poids de l'app : +7,1 Mo** (30 fichiers AAC 96 kbps, 7 277 Ko). Le même morceau en 10 fichiers ferait ~2,4 Mo, mais regrouperait les paliers par 3. La mise à jour en direct grossit d'autant. Le site ne change pas : `course/` en est retiré par `retraits-publies.cjs`, et `preparer-www.js` remet dans l'app les morceaux du tirage qui ont un rendu.

**Interrupteur : `?sans=musique3`** : NÉNUPHARS reste en direct (A/B). `?musique=live` garde son effet : tout en direct.

### LUNE DE JADE et FIRE PRIME · TROMPETTE : laissés en direct (pas de solution sans perte trouvée)

- **Les figer changerait ce qu'on entend.** On perdrait les enchaînements joués à chaque changement de moteur, qui arrivent tout au long d'une course, et l'improvisation sans fin. Un figé ne fait qu'un fondu de 8 ms sur la mesure.
- **Rendre « en avance » pendant la course** (OfflineAudioContext par tranches, même code, même hasard) donnerait le même son, mais **le même calcul** : aucun gain de chaleur.
- **Les alléger à l'identique** : il n'y a rien d'inaudible à couper.
  - Les pistes muettes sont déjà « silencieuses » pour le moteur audio : gain 0, donc sautées.
  - Ce qui coûte (salle, saturation ×2, compresseurs) s'entend.
- **Piste sérieuse, non faite : la salle pré-calculée par note.** La réverbe est linéaire. On pourrait fabriquer une fois, pour chaque son de la banque, sa queue de réverbe, et la jouer avec la note au lieu de faire tourner la convolution en continu.
  - Gain attendu : environ 27 ms/s sur LUNE DE JADE et 16 sur FIRE PRIME, sur 81 et 56.
  - Le résultat est exact quand le niveau d'une piste ne bouge pas. Il diffère légèrement pendant les fondus de niveau, aux changements de moteur, ainsi que pour l'écho envoyé dans la salle.
  - Il faut toucher au cœur du générateur (192 Ko) et à sa mémoire : c'est un lot à part.
- **Petite économie possible, non faite** : garder la banque de sons d'un générateur d'une course à l'autre. On gagne ~0,4–0,6 s de calcul à chaque départ. Le son est le même (la même graine) ; seul le bruit de la banque est celui de la première course.

## 4. Vérifié, et comment

| Vérification | Résultat |
|---|---|
| Rendu des 30 paliers | longueur exacte à l'échantillon pour afinfo, le décodeur d'Apple et Chrome (N = 882 000) ; niveau qui monte avec le palier (−24,8 → −10,9 dB) ; écart AAC/original 19,7 dB au pire (comme les 10 autres : 15,6–23 dB) |
| Index | `course/index.js` : seul `bleu-9551` est ajouté, les 10 autres fiches sont identiques octet pour octet |
| Identité « d'un coup » contre « pas à pas » (horloge de la page, avance de 1 s) | quand les deux tombent sur la même façon de calculer l'écho, **112 à 132 dB d'écart** : les arrondis, donc le même signal |
| Équivalence figé ↔ direct par octave et par mesure (le direct comparé à lui-même d'un tour à l'autre entre parenthèses) | p16 : **0,07 dB** (1,48) ; p30 : **0,22 dB** (1,44) ; p1 : 2,2 dB (0,02) |
| Le vrai lecteur (`integration` dans `cout-musique.html`, téléphone simulé) | NÉNUPHARS = `paliers`, figé, boîte noire « figée bleu-9551 », 0 oscillateur, 3,7 ms/s ; avec `&sans=musique3` = page en direct, 552 oscillateurs en 20 s, 134 ms/s |
| Fumée son dans le vrai jeu | voir § 6 |

**À p1**, NÉNUPHARS ne joue presque que la nappe et l'écho, et le direct se répète à l'identique. L'écart de 2,2 dB vient de la façon de calculer l'écho, le seul point où le rendu peut différer du direct. Sur le téléphone, WebKit ne calcule pas ce bouclage comme Chrome : aucun rendu fait sur le Mac ne peut garantir l'échantillon près pour cette boucle.

## 5. Pas vérifié

- **L'écoute** : jamais de son au banc.
- **Le gain réel en watts et en chaleur** sur le 13 Pro.
- Que WebKit décode les 30 fichiers aussi exactement que le décodeur d'Apple sur le Mac (même décodeur, très probable).
- **Les 10 premiers rendus n'ont jamais été vérifiés « deux rendus égaux ».** Deux d'entre eux, `pal-asphalte` et `bleu-1275`, différaient déjà de 4 à 7 % au contrôle de déterminisme. Les refaire avec `--force` et la vérification : à décider.

## 6. Fumée son

`node outils/banc-son/fumee-son.mjs --courses 1 --mobile --w 390 --h 844 --colonne portrait --url "&tel=1&pouce=bleu-9551"` (Chrome muet), sans erreur :

| Cas | Verdict | Course 1 : oscillateurs vivants | Nœuds branchés |
|---|---|---|---|
| Figé | **VERT** | 14 (ceux du jeu : moteur, vent ; aucun pour la musique) | 243 |
| `&sans=musique3` | **VERT** | 40 | 371 |
| Ordinateur, sans paramètre | **VERT** | inchangé | — |

Le morceau joue en `paliers` au menu (lobby), en course, à la reprise après l'arrière-plan et à la 2e course.

⚠ Avec `--url "&tel=1"` en paysage 844×390, la fumée reste ROUGE avant même l'écran titre : elle demande « PORTRAIT / PC » et ne trouve pas JOUER. Ce n'est pas un défaut du jeu : il faut `--mobile --w 390 --h 844 --colonne portrait`.

## 7. À écouter / mesurer sur le 13 Pro

1. `?pouce=bleu-9551` dans l'app (build de mesure) : la ligne `musique` de la boîte noire doit dire `figée bleu-9551`.
2. **Écouter NÉNUPHARS d'un bout à l'autre d'une course**, puis la même avec `?sans=musique3`. Ce qui peut s'entendre :
   - la boucle de 8 mesures qui se répète à l'identique (le direct variait de 1,4 à 2,5 dB par octave d'un tour à l'autre) ;
   - la queue de l'écho et de la salle coupée en 8 ms à chaque changement de moteur.
3. Chaleur : 10 min de courses sur NÉNUPHARS, figé contre `?sans=musique3`, à état thermique égal (budget ≥ 380 au départ). Comparer le budget thermique et la ligne `fluide`.
4. Décider pour les deux générateurs : les laisser en direct (aujourd'hui), ou ouvrir le lot « salle pré-calculée par note ».

---

# TOUR 2 (15/11/2026, soir) — NÉNUPHARS figé EN ENTIER : 32 mesures, en segments

Décision de Sacha : « fige le ». Le défaut du tour 1 est corrigé : le figé ne gardait que 8 mesures (le thème B en boucle). Le vrai cycle de la page fait 32 mesures : 4 phrases de 8 mesures (saxo A, B, A orné, B à l'octave ; la basse, l'arpège d'eau et les congas changent aussi par phrase).

⚠ Ce tour a été repris après une panne réseau. Le premier agent avait écrit le lecteur, l'encodeur et les bancs ; le second a tout relu, corrigé deux points (§ T2.6), fait le rendu complet et les mesures.

## T2.1 Ce qui est livré

- **30 paliers × 32 mesures (80 s), rendus comme la page les joue** : même hasard (graine 95510), élan d'un cycle entier, la boucle gardée = le 2e cycle. La couture du cycle porte donc la bonne traîne d'écho : celle de la phrase 4 vers la phrase 1.
- **Chaque palier validé par deux rendus égaux** (écart ≤ 1e-3). 14 paliers sur 30 ont demandé un 3e rendu. Aucun fichier douteux écrit.
- **Rendu à 48 000 Hz**, la cadence du contexte du jeu (`graphe-audio.js`) : aucun rééchantillonnage au décodage, et c'est la cadence à laquelle la page jouait en direct.
- **Chaque palier est coupé en 8 fichiers de 4 mesures (10 s)**, coupés dans UN rendu continu : 240 fichiers `course/bleu-9551/p<k>-<j>.m4a`, AAC 96 kbps (le même débit qu'avant).
- **Un lecteur en segments** (`joueurSegments` dans `pouce-bleu-jeu.js`) : il enchaîne les segments sur l'horloge audio, change de palier sur la mesure suivante à la même place dans le cycle, et ne garde décodé que le nécessaire.
- Interrupteurs gardés : `?sans=musique3` (NÉNUPHARS en direct), `?musique=live` (tout en direct). Nouveau : `?sans=cadence` (voir § T2.6).
- Le site (ordinateur) ne change pas. LUNE DE JADE et FIRE PRIME restent en direct. Les 10 autres FICHES de `course/index.js` sont identiques.
- `pouce-bleu-jeu.js?v=17` dans `code/page/bibliotheques.html` (le morceau, pas index.html).

## T2.2 L'enchaînement à l'échantillon près (prouvé)

**Comment bouclent les 10 autres** : un seul tampon par palier, `loop = true`. Le codeur AAC ajoute une amorce (priming) ; elle est retirée par le marqueur iTunSMPB, que le décodeur d'Apple et Chrome respectent. Le tampon décodé fait pile la longueur de la boucle.

**Ici, même principe, par segment** :
- Chaque segment est encodé AVEC son contexte : 8 128 échantillons de la musique d'avant et d'après (en cycle). Le codeur voit la musique continue. Puis iTunSMPB est réécrit : amorce = 2 112 + 8 128 = 10 240, durée = 480 000 pile.
- Les 240 fichiers décodés font **480 000 échantillons pile**, pour le décodeur d'Apple (afconvert, celui du téléphone) et pour Chrome. Les deux décodeurs donnent le même SNR à 0,0 dB près sur les 240 fichiers.
- Chaque segment est une source posée à `T0 + k × 2,5 s`. `T0` est pris sur une grille de 1/4 s. À 48 000 Hz ces heures tombent toutes sur un échantillon entier : aucun arrondi possible.
- **Preuve au banc** (`outils/banc-son/segments.mjs`, essai `chaine`) : le vrai lecteur, mené dans un contexte hors ligne, est comparé échantillon par échantillon aux fichiers décodés mis bout à bout. Résultat en § T2.5 : **0 échantillon différent** sur 5 essais de 96 à 99 s.
- **Qualité aux coutures entre fichiers** : le SNR des 4 096 échantillons de bord vaut celui du milieu d'un fichier à ~1 dB près. Le pire bord (10,9 dB, palier 30, fin de la phrase 2) est la montée de souffle de la mesure 7 : la même fenêtre encodée au milieu d'un fichier donne 12,0 dB. C'est la musique, pas la couture.

## T2.3 Fidélité note par note (paliers 3, 5, 8, 16, 30 ; les 32 mesures)

Outil : `outils/musique/fidelite-notes.mjs` (sans Chrome, sans son).
1. **Le journal** : le script de la page tourne dans un faux contexte audio qui note chaque note planifiée (heure, hauteur, instrument).
2. **L'écoute** : DIRECT = le cycle brut rendu comme la page. FIGÉ = les fichiers .m4a décodés par le décodeur d'Apple, bout à bout. Chaque instrument est isolé par soustraction (le mélange moins le même rendu SANS cet instrument, 14 rendus de plus).
3. À l'heure de chaque note du journal : la hauteur entendue, et le niveau à la hauteur du journal.

**Les motifs du journal par phrase** (les mêmes à tous les paliers) : saxo A B C D ; basse A B C A (les phrases 1 et 4 ont la même basse : c'est écrit ainsi dans la page) ; eau A B C D ; congas A B C D.

**Test du zéro** : figé(phrase q) − direct(phrase h), en dB sous le direct. Sur la diagonale il ne reste que le bruit du codeur ; ailleurs, tout ce qui change entre deux phrases.

| Palier | Figé q − direct q (phrases 1·2·3·4) | Figé q − direct d'une AUTRE phrase |
|---|---|---|
| 3 | −23,0 · −23,1 · −22,8 · −23,0 dB | −3,8 à −4,1 dB (1↔4 : −23, la même musique à ce palier : la basse seule change, et elle est la même en 1 et 4) |
| 5 | −22,3 · −22,3 · −22,0 · −22,3 | −3,4 à −3,8 (1↔4 : −12,4) |
| 8 | −22,9 · −22,7 · −23,0 · −22,7 | −4,1 à −4,6 (1↔4 : −10,7) |
| 16 | −20,9 · −21,0 · −20,9 · −21,0 | −3,0 à −3,2 (1↔4 : −5,7) |
| 30 | −20,2 · −20,1 · −20,3 · −20,2 | −3,6 à −3,9 (1↔4 : −5,0) |

Chaque phrase du figé est donc bien SA phrase du direct, et pas une autre.

**Note par note, phrase par phrase.** « Figé = direct » : la même hauteur entendue / le niveau de la note égal à ±3 dB (écart médian). « Direct = journal » dit ce que vaut le détecteur lui-même.

| Palier | Instrument | Phrase 1 | Phrase 2 | Phrase 3 | Phrase 4 |
|---|---|---|---|---|---|
| 3 | basse (40 notes) | 40/40 · 40/40 (0,10 dB) | 40/40 · 40/40 (0,10) | 40/40 · 40/40 (0,09) | 40/40 · 40/40 (0,12) |
| 5 | basse | 40/40 · 40/40 (0,15) | 40/40 · 40/40 (0,11) | 40/40 · 40/40 (0,09) | 40/40 · 40/40 (0,10) |
| 5 | congas (128 pas) | 0 pas différent | 0 | 2 | 0 |
| 8 | saxo (25·26·47·26 notes) | 25/25 · 25/25 (0,11) | 26/26 · 26/26 (0,19) | 47/47 · 47/47 (0,16) | 26/26 · 26/26 (0,23) |
| 8 | basse | 40/40 · 40/40 (0,09) | 40/40 · 40/40 (0,11) | 40/40 · 40/40 (0,12) | 40/40 · 40/40 (0,11) |
| 8 | congas | 0 | 0 | 4 | 3 |
| 16 | saxo | 25/25 · 25/25 (0,18) | 26/26 · 26/26 (0,22) | 47/47 · 47/47 (0,28) | 26/26 · 26/26 (0,17) |
| 16 | basse | 40/40 · 40/40 (0,19) | 40/40 · 40/40 (0,16) | 40/40 · 40/40 (0,17) | 40/40 · 40/40 (0,19) |
| 16 | eau (64 notes) | 64/64 · 64/64 (0,15) | 64/64 · 64/64 (0,17) | 64/64 · 64/64 (0,14) | 64/64 · 64/64 (0,15) |
| 16 | congas | 1 | 1 | 2 | 3 |
| 30 | saxo | 24/25 · 25/25 (0,17) | 23/26 · 26/26 (0,17) | 46/47 · 47/47 (0,21) | 25/26 · 26/26 (0,20) |
| 30 | basse | 40/40 · 40/40 (0,23) | 40/40 · 40/40 (0,16) | 40/40 · 40/40 (0,21) | 40/40 · 40/40 (0,15) |
| 30 | eau (192 notes) | 190/192 · 192/192 (0,15) | 186/192 · 192/192 (0,13) | 187/192 · 192/192 (0,14) | 183/192 · 192/192 (0,12) |
| 30 | congas | 1 | 2 | 3 | 2 |

- **Le niveau de chaque note est le même dans le figé et dans le direct : 100 % des notes à ±3 dB, écart médian 0,1 à 0,3 dB, pire écart 1,4 dB.** Sur 5 paliers × 4 phrases, toutes les notes du saxo, de la basse et de l'eau.
- La basse : hauteur juste contre le journal 40/40 partout (39/40 au palier 30, la même note ratée dans le direct).
- Le saxo : contre le journal, 25/25 · 26/26 · 46/47 · 26/26 aux paliers 8 et 16, dans le direct comme dans le figé.
- **Limites du détecteur, dites franchement** :
  - Au palier 30 le saxo est doublé à l'octave et l'eau joue deux octaves à la fois. « La hauteur la plus forte » n'en rend qu'une : contre le journal, 19/25 pour le saxo et ~110/192 pour l'eau, DANS LE DIRECT AUSSI. La colonne « figé = direct » reste valable.
  - Les congas sont lues par un seuil d'énergie ; la soustraction laisse des restes des autres percussions (la chaîne finale n'est pas linéaire). Phrase 3 : 4 à 14 pas faux contre le journal dans le direct lui-même. Ce qui compte : 0 à 4 pas d'écart entre figé et direct sur 128, et 52 à 83 pas d'écart contre le motif d'une autre phrase.
  - Le bruit du codeur vaut −4 à −19 dB de l'instrument isolé (le saxo est peu fort dans le mélange). Rien n'a été écouté.

## T2.4 Poids et mémoire

**Poids (exact)** :
- `course/bleu-9551/` : **240 fichiers, 30 173 761 octets = 28,8 Mo** (tour 1 : 30 fichiers, 7,1 Mo ; rien sur main).
- `course/` entier : 25,2 Mo sur main → 54,0 Mo. Le site n'en publie rien (`retraits-publies.cjs`).
- **L'app** (`node preparer-www.js --essai`) : 482 fichiers, **56,7 Mo**, dont 34,4 Mo de musique figée (ENSEIGNE DE JADE, NÉNUPHARS, AURA). Sans NÉNUPHARS figé : 27,9 Mo. **+28,8 Mo.**
- **La mise à jour en direct** : +28,8 Mo à télécharger une fois (240 fichiers neufs) ; ensuite ils ne changent plus.

**Gains sans perte cherchés** :

| Piste | Résultat |
|---|---|
| Deux paliers identiques à l'échantillon près | **aucun**. Écart max entre paliers voisins : 0,026 (p1/p2) à 0,5 |
| Deux segments identiques (240 empreintes sur 16 bits) | **aucun** |
| Phrases identiques | les paliers 1 et 2 se répètent toutes les 8 mesures à **−87 dB près** (2,4e-4, soit 8 pas de 16 bits : l'écho qui tremble). Pas « à l'échantillon près » : non fusionné. Fusionner gagnerait 1,5 Mo (5 %) |
| Mono | **non** : aucun des 30 paliers n'est mono (écart gauche/droite ≥ 0,10) |
| Débit | non touché (96 kbps), paliers non regroupés |

Il n'y a donc pas de gain sans perte : **28,8 Mo est le poids du morceau entier, 30 paliers × 80 s à 96 kbps**. Pistes qui changeraient quelque chose, NON faites, à décider par Sacha :
- 10 fichiers au lieu de 30 paliers (comme les 10 autres) : ~9,6 Mo, mais un élément entre 1 à 2 moteurs en retard.
- Fusionner les phrases des paliers 1 et 2 (−87 dB) : −1,5 Mo.
- Débit variable à qualité constante : les paliers calmes pèseraient moins. C'est un débit plus bas sur ces fichiers : écarté.

**Mémoire décodée** (somme des AudioBuffer vivants, comptée dans le vrai lecteur : `PB.etat().seg`) :
- Un segment décodé = 480 000 × 2 voies × 4 octets = **3,66 Mo**.
- Le lecteur garde : le segment joué, le suivant, et pour les deux paliers voisins le segment de la mesure qui vient et de la suivante.
- **Régime : 14,6 Mo** (4 segments). Deux dernières mesures d'un segment : 22 Mo (6). **Pire cas vu : 29,3 Mo** (8 segments, pendant un saut de 4 paliers, quelques secondes).
- Pour comparer : un palier de 80 s d'un bloc ferait 30,7 Mo, et il en faut 2 ou 3. Les 10 autres morceaux tiennent ~23 Mo (3 boucles de 20 s à 48 000 Hz).

**Coût d'un décodage** (Mac, Chrome) : 13 à 25 ms par segment de 10 s, hors du fil principal. En régime 3 décodages par 10 s (le suivant + les 2 voisins), soit ~6 ms par seconde de musique en plus des ~5 ms/s de lecture. Le direct coûte 150 à 190 ms/s.

**Jamais au dernier moment** : le segment suivant se décode dès qu'un segment commence (10 s d'avance). Les voisins se décodent dès qu'ils deviennent voisins (2,5 à 5 s d'avance sur un bord de segment). Un saut de plusieurs paliers attend son décodage, puis bascule sur la mesure suivante : comme le lecteur des 10 autres.

## T2.5 Le vrai lecteur au banc (`outils/banc-son/segments.mjs`, Chrome muet)

Le vrai lecteur (`POUCE_JEU._joueurSegments`), les vrais fichiers. Ce qu'il rend est comparé échantillon par échantillon à ce qu'on attend : les fichiers décodés bout à bout, palier par palier, fondu de 8 ms aux bascules.

| Essai | Durée | Échantillons différents | Écart max dans les fondus | Trous | Pic mémoire |
|---|---|---|---|---|---|
| Palier 3 tenu (hors ligne) : les 8 segments puis le retour au 1er | 98,75 s (40 mesures) | **0** | 6e-9 | 0 | 22,0 Mo |
| Palier 16 tenu | 98,75 s | **0** | 1e-8 | 0 | 22,0 Mo |
| Palier 30 tenu | 98,75 s | **0** | 3e-8 | 0 | 18,3 Mo |
| 11 demandes de bascule (voisin, saut de 3, à 20 ms d'une mesure, sur un bord de segment, annulée, remplacée, sur le retour du cycle), départ à 97,5 s | 96,8 s | **0** | 2e-8 | 0 | 25,6 Mo |
| **Temps réel** (vrai AudioContext 48 000 Hz, enregistré, jamais branché à la sortie), 13 bascules, une suspension de 3 s | 95,9 s | **0** | 1,5e-8 | 0 | **29,3 Mo** |

- **Les 4 phrases dans l'ordre, puis le retour** : `11111111 22222222 33333333 44444444 111111` (une lettre par mesure, relevé en temps réel).
- **Les bascules tombent sur la mesure suivante, à la même place dans le cycle** : demandée à 47,0 s (palier 6 → 10, pas préchargé), faite à 47,5 s, mesure 19 du cycle. Demandée à 78,9 s, faite à 80,0 s = la mesure 0 du cycle suivant.
- **La suspension** (contexte suspendu 3 s en pleine lecture, comme un retour d'arrière-plan) : aucun échantillon perdu, aucun trou.
- **Mémoire en temps réel** : 14,6 Mo le plus souvent, 18 à 22 Mo autour des bords de segment, 29,3 Mo une fois (le saut 6 → 10). 8 tampons au plus, 4 voix au plus.
- **Décodages** : 60 relevés, 15 à 25 ms chacun. Plus long gel du fil principal pendant l'essai : 18 ms.
- **Par `POUCE_JEU.depart`, en téléphone** : NÉNUPHARS = lecteur en segments, boîte noire « figée bleu-9551 », niveau −17,9 dB au palier 16. Avec `&sans=musique3` ou `&musique=live` : la page en direct, −17,9 / −18,0 dB (le même niveau). ENSEIGNE DE JADE : lecteur à paliers, inchangé.

**Fumée son dans le vrai jeu** (`fumee-son.mjs --courses 1 --mobile --w 390 --h 844 --colonne portrait`, Chrome muet) :

| Cas | Verdict | Course 1 | Création de nœuds sur la fumée |
|---|---|---|---|
| `&tel=1&pouce=bleu-9551` (figé en segments) | **VERT** | lecteur `paliers`, 14 oscillateurs (ceux du jeu), 245 nœuds | 127 oscillateurs |
| `&tel=1&pouce=bleu-9551&sans=musique3` | **VERT** | lecteur `html` (direct), 40 oscillateurs, 371 nœuds | 616 oscillateurs |
| `&tel=1&pouce=bleu-7299` (un des 10 autres, avec le correctif `cadence`) | **VERT** | lecteur `paliers`, 14 oscillateurs | 127 oscillateurs |

Les trois passent l'accueil, la course, l'arrière-plan (contexte suspendu) et la reprise, la mort, la 2e course, le 2e accueil.

Aussi : `node outils/garde-demarrage.cjs` OK (21 scripts) ; `node code/assembler.cjs --depuis-morceaux` d'accord avec les 331 morceaux ; `cd app-ios && node preparer-www.js --essai` réussi, les 240 fichiers sont embarqués (« musique de course figée : bleu-7299, bleu-9551, pal-aura-30 (34,4 Mo) »).

Pas relancé à ce tour : la fumée ORDINATEUR (le lecteur en segments et le correctif ne servent qu'en figé).

## T2.6 Deux défauts trouvés en route

**1. Les 10 morceaux figés perdent la fin de leur boucle sur un contexte à 48 000 Hz (présent sur main depuis le 9/11).**
- Le jeu ouvre son contexte à 48 000 Hz. `decodeAudioData` rééchantillonne : une boucle de N = 882 000 échantillons à 44 100 Hz en fait 960 000.
- Le lecteur comparait à N tel quel : « trop long », donc COUPÉ à 882 000. La boucle durait 18,4 s au lieu de 20 : les 8 % de la fin (0,65 mesure) sautaient à chaque tour.
- Preuve (essai `cadence`) : ENSEIGNE DE JADE, boucle vraie 15,484 s. Avant : la musique se répète à 14,226 s (corrélation 1,00) et pas à 15,484 s (−0,10). Après : elle se répète à 15,484 s (0,99).
- Corrigé dans `joueurPaliers` : la longueur attendue se compte à la cadence du contexte. `?sans=cadence` remet la coupe d'avant (A/B).
- ⚠ Ce correctif touche le SON des 10 autres sur téléphone (leurs fiches sont inchangées). Il dépasse le lot : à valider à l'oreille. Après rééchantillonnage, la couture de leur boucle n'est plus garantie à l'échantillon près (non mesuré sur WebKit).
- Si WebKit rend une longueur un peu plus courte, elle est acceptée jusqu'à 1 % : sinon les 10 morceaux retomberaient en direct (la chaleur).

**2. Bascule de palier pile sur un bord de segment** : l'ancien palier était coupé net au lieu de sortir en 8 ms (écart 0,2 dans le fondu au banc). Corrigé : la voix du segment suivant de l'ancien palier fait le fondu de sortie.

## T2.7 Pas vérifié

- **Rien n'est écouté.**
- **WebKit** : que `decodeAudioData` de l'iPhone rende 480 000 échantillons pile par segment (très probable : même décodeur qu'afconvert). Sinon la boîte noire note « segment trop court » ou « grille inexacte ».
- Que le contexte du 13 Pro soit bien à 48 000 Hz. S'il ne l'est pas, les segments sont rééchantillonnés : enchaînement approché, noté « grille inexacte » dans la boîte noire.
- La mémoire réelle sur WKWebView : le banc compte les tampons vivants, pas le moment où le ramasse-miettes les rend (3 tampons de 3,66 Mo sont lâchés toutes les 10 s).
- Le temps de décodage sur le téléphone, et le gain en chaleur.
- Le correctif `cadence` sur le téléphone.

## T2.8 À écouter et mesurer sur le 13 Pro

1. `?pouce=bleu-9551` : la boîte noire doit dire `figée bleu-9551`, sans « grille inexacte », sans « reprise à la mesure », sans « segment trop court ».
2. **Écouter 2 cycles entiers (160 s) à moteur constant** : les 4 phrases dans l'ordre (saxo A, B, A orné, B qui monte à l'octave à la fin), puis le retour à A. Aucun clic toutes les 10 s (les coutures de segments), aucun à 80 s (la couture du cycle).
3. **Monter et descendre les moteurs** : la bascule tombe sur la mesure, sans trou, sans saut de place dans la phrase.
4. Même course avec `?sans=musique3` : le même morceau, en direct.
5. Mettre l'app en arrière-plan 10 s en pleine course, revenir : la musique reprend.
6. **Mémoire** : `POUCE_JEU.etat().seg` → `memoireMo`, `picMo`, `decodagesMs`, `trous`. Attendu : ~15 Mo en régime, pic < 30 Mo, `trous` = 0.
7. **Les 10 autres** (`?pouce=bleu-7299`) : la boucle doit tourner rond (avant : un saut à la fin de chaque boucle). Comparer avec `?sans=cadence`.
8. Chaleur : 10 min sur NÉNUPHARS, figé contre `?sans=musique3`, budget ≥ 380 au départ.

## T2.9 Refaire le rendu

- `node outils/musique/rendre-paliers.mjs --ids bleu-9551 --force --travail <dossier>` : ~3 h 15 de machine sous le verrou du banc (30 cycles, chacun rendu 2 ou 3 fois ; 3 paliers à la fois). Le dossier de travail garde les cycles bruts (30 × 30,7 Mo) : l'outil reprend où il s'est arrêté.
- `--sans "8:sax 8:basse …"` : les rendus sans un instrument, pour `fidelite-notes.mjs`.
- `node outils/musique/fidelite-notes.mjs --paliers 3,5,8,16,30 --travail <dossier>` ; `node outils/banc-son/segments.mjs` (sous le verrou).
