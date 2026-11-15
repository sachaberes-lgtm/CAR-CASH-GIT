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
