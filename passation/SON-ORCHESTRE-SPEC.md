# SON — L'ORCHESTRE : spec de la refonte du son (20/10/2026, session SON, Sacha : « refonte totale du système de son […] que les sons du jeu se marient très bien avec la musique […] Là, je préfère couper le son parce qu'il n'est pas agréable avec la musique »)

Direction choisie par Sacha le 20/10 : **L'ORCHESTRE**, réglée d'abord pour les **écouteurs / AirPods** (le haut-parleur du téléphone ne doit
rien perdre). Livraison par étapes ; chaque étape est jugée à l'oreille sur une paire de WAV ancien / nouveau avant d'aller sur `main`.

## 1. Le constat (audit du 20/10, code lu ; les points marqués « à mesurer » seront chiffrés au banc de l'étape 0)

1. **Les effets jouent dans la mauvaise tonalité en course (bug).** `sonTonSuit` (`code/son/console-son.js:86-90`) lit la tonalité sur
   `musicEl.src`, le lecteur `<audio>` du MENU. En course il est en pause mais garde la musique du ciel : les ~138 sons accordés (`key:1`) restent
   en ré, si♭ ou fa, alors que Pouce bleu tire un morceau parmi 20, dans 12 tonalités (la mineur, do♯ mineur, fa dorien, si♭ dorien, mi mineur…),
   et module parfois d'un ou deux demi-tons entre les paliers 22 et 28. Selon le tirage : une fausse note sur cinq, ou le triton complet.
2. **Le tapis continu couvre la mélodie (1-5 kHz)** — à mesurer. En course tournent ensemble : le sifflet `whG` (passe-bande Q 14 à 2-3 kHz),
   le gémissement `engWhine` (dent de scie jusqu'à 9 kHz), la boîte `transG` (2,6 kHz) et le différentiel `diffG`, le vent en bruit BLANC
   jusqu'à 16 kHz, et sous le FEU QUI RUGIT quatre couches de l'ancien nitro restées branchées (`jrG`, `jetG` peigne + saturation, `jetLowG`,
   `jetOscG` dent de scie à 2,4 kHz Q 6).
3. **Le bus des effets est dur.** `MASTER → compresseur (−16 dB, 4:1) → saturation tanh → limiteur` : attaques écrasées, harmoniques aigres.
   La musique ne rejoint les effets qu'au limiteur final (−1 dBFS, 20:1, attaque 1 ms) : chaque gros effet y fait reculer la musique (pompage).
4. **Aucun rythme commun.** Les effets tombent hors de la grille du morceau ; le générateur a pourtant une horloge (pas exposée au jeu).
5. **L'empilement.** Une mort = 3 sons (`explosion` + `mort.*` + `deathSound()` en fichier) ; pas de plafond global de voix.
6. Petits défauts vus en passant : `VOL.mus` .70 du 20/10 écrasé par la sauvegarde (.62) ; `singe.saut`/`singe.coucou` absents de la banque ;
   `assets/audio/fx/*.mp3` préchargés mais jamais joués ; `dark-triad.mp3` en 404 (la frénésie n'a pas sa musique — à Léo, on n'y touche pas).

## 2. Les principes

- **HARMONIE** — tout son qui a une note la prend dans la gamme du morceau qui joue, à l'instant (modulation comprise).
- **PLACE** — la bande 1-5 kHz appartient à la musique (mélodie, voix des instruments) ; les sons continus vivent dessous (corps 80-800 Hz,
  souffle doux au-dessus) ; seuls les sons COURTS (une pièce, un choc) passent dans la présence, et repartent vite.
- **DOUCEUR** — plus de saturation sur le bus ; une seule colle douce pour musique ET effets ; un limiteur qui ne travaille qu'aux accidents.
- **RYTHME** — les récompenses tombent sur la grille du morceau ; leurs échos battent son tempo. Le retour immédiat (pièce, choc, nitro) reste immédiat.
- **ÉCONOMIE** — moins de couches, mieux choisies ; un plafond de voix ; chaque événement a UN son.
- **LE CASQUE D'ABORD** — grave rond, stéréo large mais stable, aigus jamais piquants ; le haut-parleur garde son corps (150-500 Hz).

## 3. Ce qui ne bouge pas (décisions déjà prises à l'oreille)

- **LA GOMME DOUCE** (crissement, validée par Sacha le 17/10) : gardée telle quelle (elle peut seulement suivre le nouveau bus).
- **LE FEU QUI RUGIT** (nitro validé le 16/10, retouché en v728 le 20/10) : son CŒUR est gardé (gorge, PSSHT, pétarade) ; on retire ce qui
  traîne autour et on l'affine (§4.6).
- **Léo** : ses morceaux (jamais réencodés, jamais retouchés ; `musique-moteur.json` intouché), LA GRANDE MONTÉE, pas de tempo qui suit la
  voiture, pas de nitro qui colore la musique, pas d'instrument au boost, `depart.envol` retiré et la musique qui part PENDANT le boost,
  `vitesse.pure` muet, ambiance des nuages coupée, pas de moteur « moustique », grondement du nitro bas, pas de notes avant le ciel.
- **Sacha** : plus aucune voix, la musique suit en boutique, l'intro garde ses bruitages. Le BURN-OUT du garage est intouchable.
- ⚠ **Un choix ancien est rouvert** : le tanh `lim` du bus (« le son validé : on le garde », 29/09). Il part dans le nouveau mixage, gardé
  derrière `?mix=ancien` ; c'est Sacha qui tranche sur la paire A/B de l'étape 2.

## 4. L'architecture visée

### 4.1 La tonalité — une seule source, `sonTon()`
- **Course (Pouce bleu)** : le générateur → `PB.J.inst.tirage.ton` (nom français + mode ; il porte déjà la modulation `MOD`), lu à chaque
  changement de palier ; PALIERS (NÉON NOIR do mineur, NUIT DE VELOURS fa mineur) et pages HTML (AURA·30 mi mineur, RUBIS DE NÉON fa mineur,
  ASPHALTE D'ÉMERAUDE mi mineur) → une petite table `PB_TON` par id.
- **Menu, auto-école** : `SON_TON` comme aujourd'hui. Frénésie : +1 comme aujourd'hui.
- `sonTon()` rend `{t: demi-tons depuis MI (gamme majeure relative), mode, tonique Hz}` ; `CCSON.ton(t)` reçoit `t` ; le moteur et le nitro
  lisent la tonique et la gamme (§4.4, §4.6).

### 4.2 L'horloge — `musHorloge()`
- **Générateur** : le chargeur de Pouce bleu réécrit déjà le texte du module (l'avance de 1 s) ; il y ajoute un accès en LECTURE
  `horloge → {step, nextTime, SD}`. Les fichiers de Léo ne changent pas.
- **Paliers** : le départ et le tempo du `PalLecteur`. **Pages HTML** : pas d'horloge → `null` (les sons y restent immédiats).
- `sfxQ(id, o, grain)` : pose une récompense sur la prochaine croche (ou double croche) si l'attente est ≤ 90 ms, sinon tout de suite.
  Concernés : `combo.sceau`, `verdict.*`, `aura.x*`, `flow.1-3`, `frenesie.entre`, `pose.parfait/divin`, paliers. Pas les pièces ni les chocs.
- **Écho au tempo** : un départ d'écho stéréo (croche pointée, 2-3 répétitions, filtré 300 Hz-4 kHz) pour ces récompenses.

### 4.3 Le mixage
```
effets (banque + chaînes continues) → MASTER → BUSOUT → compresseur doux (≈ −20 dB, 2:1, genou 18, 8 ms / 220 ms), SANS tanh → niveau effets ┐
Pouce bleu / menu → MUSBUS (inchangé, celui de Léo) → niveau musique ───────────────────────────────────────────────────────────────────────┼→ SOMME
SOMME → colle (≈ −14 dB, 1,5:1, 30 ms / 300 ms) → limiteur (−1 dBFS, ne doit agir qu'aux accidents) → sortie
```
- **Niveaux visés en croisière** (sonie K, relatifs à la musique, réglables) : tapis moteur + vent ≈ −10 LU ; pièces ≈ −5 LU en crête courte ;
  figures, poses, récompenses ≈ −1 LU ; nitro ≈ −4 LU ; mort ≈ +2 LU.
- **Le tapis écoute la musique** : un analyseur sur le bus musique ; quand le morceau est dense, moteur et vent reculent jusqu'à −3 dB
  (constante 0,5 s, pas de pompage au rythme de la grosse caisse) ; dans un creux, ils reviennent.
- La musique ne recule (−2 dB, 250 ms) que sous les grands moments (mort, frénésie, verdicts) — jamais sous les pièces (décision du 15/10).
- **Plafond de voix** : 10 sons courts en même temps en course ; au-delà, le moins prioritaire s'efface en 20 ms (échelle de priorités).
- **La mort** : un seul son conçu (l'`explosion` de la banque + le cri de la cause) ; `deathSound()` (fichiers `death/`) ne joue plus.
- `VOL.mus` : le défaut voulu le 20/10 (.70) pris en compte pour une sauvegarde qui n'a jamais touché au curseur.

### 4.4 Le moteur — « il ronronne dans la tonalité »
- On garde les 30 caractères (`ENG_SND` : harmoniques, sub, lope, crk, formants) et la boîte de vitesses.
- **L'aimant** : quand le régime est stable (croisière, la majeure partie d'une course), la fondamentale glisse doucement vers la note la plus
  proche de la pentatonique du morceau (correction ≤ ±1,5 demi-ton, constante ≈ 0,4 s) ; pendant une accélération, un passage de rapport, un
  vol, elle est libre (glissando). Le moteur devient une note tenue SOUS la musique.
- **Le nitro sur le moteur** : la poussée de +4 % (+0,7 demi-ton, toujours faux) devient un pas de gamme (la note suivante de la pentatonique).
- **Hygiène des harmoniques** : la 5e et la 7e harmonique (tierce majeure et septième basse sur la fondamentale, qui frottent contre un
  morceau mineur) baissées ; octaves et quintes gardées.
- **Partent** : le sifflet `whG`, le gémissement `engWhine`, le sifflement de boîte `transG` ; le différentiel `diffG` adouci et descendu.
- **Plafond** du corps vers 2,2 kHz en course (le plancher de 700 Hz du téléphone reste) ; **largeur** : les deux oscillateurs légèrement
  écartés en stéréo (±0,3) pour le casque ; le sub (fondamentale / 2) gardé pour le casque.
- La respiration ±0,7 % descend à ±0,3 % (elle désaccordait la note tenue).

### 4.5 Le vent
- Bruit ROSE au lieu de blanc, passe-bas plus bas (le haut du spectre adouci au-dessus de 4 kHz), niveau ≈ −6 dB ; rafales et vol qui monte gardés.

### 4.6 Le nitro — « jouissif à cramer »
- Cœur v728 du FEU QUI RUGIT gardé. Retirés : `jetG` (peigne + saturation), `jetOscG` (dent de scie 2,4 kHz). `jrG` (le grondement grave) et
  `jetLowG` : gardés ou fondus dans la gorge selon la mesure au banc.
- **Gorge accordée** : deux résonances douces (Q ≈ 4) sur la tonique, à l'octave et deux octaves (110-440 Hz), ≈ −12 dB sous le souffle :
  la flamme garde son bruit mais « chante » dans la tonalité.
- **Crépitement ASMR** : grains fins, placés au hasard dans la stéréo, adoucis au-dessus de 7 kHz ; densité qui suit la tenue.

### 4.7 Les timbres
- Une palette commune, proche des instruments de Pouce bleu (cloches douces, Rhodes, pluck, maillet), à la place des bips carrés.
- Recuits, mêmes ids (aucun appel à changer) : `piece`, `piece.recolte`, `pose.choc`, `pose.nette`, `pose.parfait`, `fig.salto`,
  `fig.toupie`, `fig.tonneau`, `fig.maillon`, `ui.tap`, `ui.nav`, `ui.retour` (liste finale fixée à l'étape 5 d'après la mesure).
- Cuisson sans ffmpeg (Mac de Sacha) : `PCM=1` pour quelques sons, sinon le remplaçant lamejs avec l'en-tête Xing/Lavc (sinon 34,5 ms de retard).

### 4.8 Comparer
- `?son=ancien` = tout l'ancien système. Par partie : `?ton=ancien`, `?mix=ancien`, `?moteurson=ancien`, `?nitroson=v728`, `?timbres=ancien`,
  `?rythme=0`. Crochets : `dbgSonTon()`, `dbgHorloge()`, `dbgMix()`.

## 5. La preuve (étape 0, avant tout changement)

- **Banc de capture** : Chrome sans fenêtre et muet (`--mute-audio --disable-audio-output`), une course pilotée (`dbgAuto`), morceau imposé
  (`?pouce=`), deux prises en temps réel par AudioWorklet : le bus MUSIQUE et le bus EFFETS, séparés → WAV.
- **Mesures** (Python, numpy/scipy) : sonie K de chaque bus ; **masquage** = énergie des effets dans les bandes 1-5 kHz où la musique a de
  l'énergie ; **justesse** = part de l'énergie tonale des effets hors de la gamme du morceau (chroma) ; bande haut-parleur (passe-haut 200 Hz).
- **Scénarios** : S1 croisière 30 s avec pièces · S2 trois nitros · S3 vol + figures + pose · S4 mort. Trois morceaux témoins : un synthwave
  (do♯ mineur), un lo-fi (la♭ mineur), NÉON NOIR (do mineur).
- Chaque étape : la paire `ancien / NOUVEAU` mixée (musique + effets, même graine, même morceau) envoyée à Sacha, avec les chiffres.

## 6. Les étapes

0. Banc de capture et mesures de l'existant (le constat chiffré).
1. **Harmonie** : `sonTon()` (§4.1). Petit, sûr, le plus gros effet.
2. **Mixage** : §4.3 (+ mort unique, plafond de voix, `VOL.mus`).
3. **Moteur et vent** : §4.4, §4.5.
4. **Nitro** : §4.6.
5. **Timbres** : §4.7.
6. **Rythme** : §4.2.

Chaque étape : son interrupteur `?…=ancien`, la paire A/B, le « on garde » de Sacha, puis livraison sur `main` (fusion d'`origin/main`,
`node code/assembler.cjs`, `cashcar-vNNN` +1, JOURNAL).

## 7. Risques

- **iPhone (CPU)** : la refonte doit RETIRER plus de nœuds qu'elle n'en ajoute (sifflets, anciennes couches du nitro) ; l'analyseur du bus
  musique lit 30 fois par seconde au plus.
- **Latence de la grille** : plafonnée à 90 ms, et jamais sur le retour immédiat.
- **Le texte du générateur change** (une nouvelle version de Léo) : l'accès à l'horloge est cherché comme l'avance de 1 s ; introuvable → pas
  d'horloge, sons immédiats, rien ne casse.
- **Capture en temps réel sous charge** (autres sessions) : compter les trous dans la prise ; refaire si > 0.
