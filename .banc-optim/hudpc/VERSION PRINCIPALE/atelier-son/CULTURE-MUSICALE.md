# La culture musicale du générateur (révision du 14/10)

Léo : « apprends les instruments de base… la technique de la retouche… comprends la base de la culture musicale humaine, du populaire
à l'underground ; l'idée, c'est un générateur HYBRIDE ». Cette fiche est ce que le générateur (`assets/audio/music/direct/musique-trente.js`,
v5.0, DA `hybride`) sait et applique. Elle sert aussi de point de départ pour toute nouvelle DA.

## 1. Les six couches d'une musique populaire

| Couche | Ce que c'est | Dans le code |
|---|---|---|
| **Rythme** | où tombent grosse caisse, caisse claire, charleys, percussions (16 pas par mesure) + le swing | `RYT` |
| **Harmonie** | le mode + les grilles typiques du genre | `prog` de chaque genre, `QUAL`, `GAMMES` |
| **Basse** | son rôle rythmique et harmonique | `BAS` |
| **Accompagnement** | comment on joue les accords | `COMP`, `cuiv`, `chop` |
| **Instruments** | qui joue quoi, dans quel univers | `keys`, `lead`, `pad`, `basse`, `contre`, `vrais`, `univers` |
| **Retouche** | la production : batterie, salle, écho, saturation, bande, pleurage, pompe | `prod`, `retoucheMet`, `ir()` |

## 2. Les rythmes fondateurs

- **Backbeat** (rock, pop, soul) : caisse claire sur 2 et 4. **Quatre au sol** (disco, house, techno, trance) : grosse caisse à chaque temps.
- **Demi-temps** (dubstep, trap, drill) : caisse claire sur le 3 seulement — tout paraît deux fois plus lent que le tempo.
- **Breakbeat** (jungle, drum & bass) : le break « Amen » — grosse caisse 1 et 1&, caisse claire syncopée.
- **Clave / tresillo** (salsa, son, afrobeats, reggaeton) : 3-3-2 — la cellule africaine passée par Cuba, partout depuis.
- **One drop** (reggae roots) : grosse caisse ET caisse claire sur le 3, rien sur le 1. **Steppers** (dub) : quatre au sol sous un one drop.
- **Swing** (jazz, neo-soul, boom bap) : les croches inégales ; « ivre » chez Dilla (doubles retardées, grosse caisse en avance).
- **Galop** (western), **oompah** (fanfare des Balkans), **train** (country : caisse claire en doubles, accents sur 2 et 4).

## 3. Les langages harmoniques

- **Pop** : I–V–vi–IV et ses rotations. **Années 50** : I–vi–IV–V. **Rock** : quintes à vide (accords « 5 »), I–♭VII–IV (mixolydien).
- **Blues/soul** : I–I7–IV–iv (le iv mineur emprunté = la nostalgie gospel). **Jazz** : ii–V–I, I–VI7–ii–V, accords de 7e/9e.
- **Funk, afrobeat, house** : le VAMP — un ou deux accords (dorien m7 / 9) pendant des minutes ; la tension vient du rythme.
- **Épique / trance** : i–♭VI–♭III–♭VII. **Andalouse** (flamenco, surf, western) : i–♭VII–♭VI–V. **Phrygien** (metal, drill) : la seconde
  mineure i–♭II. **Lydien** (rêve, ambient, cinéma) : la quarte augmentée qui flotte, I–II majeur.
- **Neo-soul, amapiano, city pop** : 7e et 9e partout, IVmaj7–iii7–ii7–Imaj7.

## 4. Les rôles de la basse

Tenue (ambient) · croches (rock, punk) · « chug » en doubles (metal) · walking (jazz) · tumbao anticipé (salsa : le « et » du 2 et le 4) ·
contretemps (house) · roulement en doubles (techno, trance) · octaves (disco) · one drop mélodique avec silences (reggae) · log drum
(amapiano : percussion accordée) · 808 qui glisse (trap, drill, footwork) · reese (jungle, drum & bass) · oompah (fanfare) · galop.

## 5. Les instruments de base (synthétisés, et vrais en CC0)

- **Claviers** : piano, Rhodes (FM + trémolo), **Wurlitzer** (v5.0 : triangle qui « aboie »), orgue, clavinet, DX7, accords 8 bits, harpe.
- **Guitares** : rythmique grattée (cordes pincées Karplus-Strong), saturée (l'ampli : tanh + haut-parleur), lead claire / saturée.
- **Basses** : **électrique aux doigts** (v5.0), slap, funk, acid (303), reese, 808, sous-basse, **log drum** (v5.0), contrebasse vraie, tuba vrai.
- **Mélodies** : saxophone, trompette, cuivres, talkbox, steel drum, kalimba, harmonica, **accordéon** (v5.0, anches qui battent) —
  JAMAIS de flûte ni de lead aigu (refusés par Léo).
- **Vrais instruments** (VSCO-2 CE, VCSL, CC0) : cordes, cuivres, piano, vibraphone, contrebasse, percussions (congas, cajón, darbuka…).

## 6. La retouche (la production)

- **Batterie** : grosse caisse acoustique / 909 / 808 / lo-fi / grave ; charleys en bruit, métal, FM, shaker. Kits : acoustique, rock,
  club, hip-hop, doux, latin (attaque, chute, drive de la grosse caisse ; type de caisse claire).
- **Salles** : pièce/hall (par défaut) · **plaque** (dense tout de suite, années 60-70) · **ressort** (dub, surf, western : échos métalliques
  à 29 et 37 ms, bande étroite) · **réverbe coupée** des années 80 (gated : un mur plat coupé net, sur la caisse claire et les toms).
- **Écho** : ping-pong calé en doubles croches ; **bande** (dub) : l'écho sature à chaque tour et pleure (la vitesse du ruban qui ondule).
- **Pleurage lo-fi** (vaporwave, boom bap, neo-soul) : tout le morceau ondule doucement (retard modulé à 0,55 Hz + scintillement à 6 Hz).
- **Pompe** (sidechain) : la nappe et la basse respirent sous la grosse caisse (house, techno, trance).
- **Mixage** : coupe-bas partout sauf basse/sous-basse, creux de boue à 330 Hz par piste, un seul instrument dans le sous-grave.

## 7. L'hybride

Une musique = **le CORPS d'un genre** (rythme, tempo, basse, forme, ordre d'entrée des éléments) **× l'ÂME d'un autre** (accords,
instruments, mélodies) ; la **retouche** vient de l'un ou de l'autre, jamais un mélange. Garde-fous : jamais deux familles identiques
(sauf 15 %), une énergie voisine (`ENER` : 0 flotte → 3 à fond), un tempo compatible (le même, le double ou la moitié à 25 % près).
Une partie sur cinq reste un genre pur. Quand l'âme est du dubstep, la wob peut faire le drop du corps.
L'histoire le fait déjà : dub × hip-hop = trip-hop ; reggae × breakbeat = jungle ; house × kwaito × jazz = amapiano ; Memphis × drift = phonk.

## 8. L'atlas (55 genres)

- **Pop / rock** : POP, SYNTHPOP, ROCK, PUNK, MÉTAL, RÊVE (shoegaze), SURF, STADE, TURBINE (big beat).
- **Soul / funk / jazz** : FUNK, SOUL (Motown), NEO-SOUL, SWING, BOULE À FACETTES (disco).
- **Latine / Caraïbes / Afrique** : BOSSA, SALSA, CUMBIA, TANGO, MALECÓN (dembow), ROOTS (reggae), DUB, AFROBEAT, AFROBEATS, AMAPIANO.
- **Club** : HOUSE, TECHNO, TRANCE, VELOURS (french touch), 2-STEP, TOUGE (eurobeat), NÉON (synthwave).
- **Bass music** : JUNGLE, HYPERVITESSE (dnb), FOOTWORK, JERSEY CLUB, et les six dubsteps (MÉLODIQUE, RIDDIM, BROSTEP, DUB DE LONDRES,
  CHILLSTEP, COLOR BASS).
- **Hip-hop** : BOOM BAP, DRILL, LUXE (trap), DRIFT (phonk), NUIT LO-FI, ZEF.
- **Rétro / ambiant / folk / cinéma** : VAPEUR, PIXEL (chiptune), AMBIANT, COUNTRY, RUMBA (flamenca), BALKAN, WESTERN, GRAND PRIX (épique).

## 9. Les bases de la qualité (toujours)

La grande montée (~+19 dB du 1er au 30e moteur) · un style = un autre artiste (production comprise) · univers cohérent · vrais
instruments accordés · mixage mesuré en salle (`atelier-son/salle-repetition.js`) · jamais deux fois la même · versions figées
(`musique-trente-<VERSION>.js`).
