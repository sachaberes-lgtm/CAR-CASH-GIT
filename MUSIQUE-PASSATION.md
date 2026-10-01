# CASH CAR — LA MUSIQUE : cahier des charges et passation

> **À donner tel quel à une autre discussion Claude** : ce fichier dit ce qui existe, où, comment le régénérer, et ce qui
> reste à intégrer. Écrit le 2026-10-01 (branche locale `musique-2026-10`). Auteur des demandes : Léo.
> Le détail technique vit aussi dans `CLAUDE.md` (sections « LE GÉNÉRATEUR DE MUSIQUE », « GLASSY PLUCKS », « LES BOUCLES MAISON »).

---

## 1. Ce que Léo a demandé (dans l'ordre)

1. « Générateur musique CASH CAR » → une musique **procédurale en jeu** qui réagit à la course.
2. Une boucle tirée de son morceau Suno **Glassy Plucks** (la partie de 1:04 à ~2:10) pour le **lobby**, et une boucle pour les
   **missions** avec une musique par-dessus.
3. Des **pistes audio en boucle** utilisables en jeu, inspirées + idées libres, avec **une page où cliquer pour les écouter**.
4. Des boucles de **8 secondes** : plusieurs inspirations pour le lobby, puis des propositions pour les niveaux.
5. Une boucle lobby **rock « bonhomme »**, puis une **rock ambiance Splatoon**.
6. **Le système « la musique suit la vitesse »** : à l'arrêt quelques notes, mélodieuses et harmonieuses ; la musique
   s'enrichit **en parallèle de la vitesse** de la voiture. Méthode voulue : Léo choisit une boucle pour un niveau → on la
   livre en couches → le jeu les ouvre selon la vitesse.
7. Sauvegarder proprement + ce document. **« Pour l'instant, garde ça sur le côté »**.
8. « NÉON DRIVE est pas mal, ajoute-la, on joue sur la map 1 NUAGES pour tester l'effet vitesse » → fait (§5 bis).
9. « Qu'elle évolue encore plus, ni trop vite ni trop lentement, bien rythmée, vitesse ET moteur » → v2 (§5 ter).
10. « Au début laisse vraiment la base, évolue aussi avec le temps ; un peu trop brut, bonifie » → v2.1 (§5 quater).
11. « Plus actif, ça doit suivre, rupture harmonieuse » + « détails selon la nitro d'affilée / l'accélération » + « pas casser,
    une belle transition, un nouveau son par inspi » → v2.2-2.3 (§5 quinquies).
12. « Pareil avec la musique de la VILLE, en samplant et en réorganisant, avec ta touche » → v3 (§5 sexies).
13. « Mal réparti, prends des libertés, parallèle musique / moteur » + « trop superposé » → v3.1 (§5 septies).
14. « Pas totalement ça : le choix des instruments, la profondeur — encore de la superposition » → v3.2 (§5 octies).
15. « Creuse une musique adaptée sans qu'on s'en rende compte, virages, évolution ; recompose en synthèse, dépasse tes limites ; il manque l'énergie » → v4 LE CHEF D'ORCHESTRE (§5 nonies).

## 2. Les fichiers

| Fichier | Rôle |
|---|---|
| `boucles.html` | **Le banc d'écoute** (clic = écoute). À ouvrir SERVI : `python3 -m http.server 8765` → http://localhost:8765/boucles.html |
| `musique-vitesse.js` | **Le module « la musique suit la vitesse »**, autonome (aucune globale du jeu), utilisé par la page, prêt pour le jeu |
| `atelier-son/boucles.py` | Synthèse des boucles longues (16 mesures) + rendu des **couches** (`COUCHES`, `rendre_couches`) |
| `atelier-son/boucles8.py` | Synthèse des boucles de 8 s (lobby, niveaux) |
| `assets/audio/music/boucles/*.m4a` | Les boucles rendues (AAC 192 k) ; `*--cN.m4a` = la couche N d'une boucle à couches |
| `assets/audio/music/boucles/boucles-donnees.js` | `window.BOUCLES` : titre, BPM, clé, `ton`, durée, forme d'onde, `couches` |
| `assets/audio/music/glassy-plucks-boucle.m4a` | La boucle Glassy Plucks (lobby actuel) |
| `index.html` | Le jeu : bloc `<<<GENERATEUR>>>` (juste après `musicPause`), `MUSIC.menu` = Glassy |

**Régénérer** : il faut Python 3 + `numpy` + `scipy` (un venv suffit) et `afconvert` (macOS).
`python atelier-son/boucles.py` (tout) · `… boucles.py neon` (les ids qui contiennent « neon ») · `… lobby` · `… niv`.
Tout est déterministe (graines fixes) : même code = mêmes fichiers.

## 3. Le catalogue

Toutes : synthèse maison (aucun échantillon, aucune mélodie empruntée → **droits à nous**), sans couture (la queue de
réverbe est repliée sur le début), −15 dB RMS, crête ≤ −1 dBFS. `ton` = l'échelle de `SON_TON` du jeu (la pentatonique de MI
décalée de `ton` demi-tons) pour que les récompenses sonores jouent dans la gamme.

### Lobby · 8 secondes
| id | Titre | Style | BPM | Clé | ton |
|---|---|---|---|---|---|
| lobby-coucher | COUCHER DE SOLEIL | outrun, caisse claire « gated » | 116 | mi min | +1 |
| lobby-ascenseur | ASCENSEUR DORÉ | bossa lounge de casino | 120 | do maj | −4 |
| lobby-arcade | PIÈCE D'OR | 8 bits, écran titre d'arcade | 120 | do maj | −4 |
| lobby-luxe | LUXE | trap de palace | 120 | fa# min | +5 |
| lobby-vapeur | VAPEUR | vaporwave | 112 | mi♭ maj | −1 |
| lobby-filtre | FILTRE D'OR | french house filtrée | 124 | sol dorien | −2 |
| lobby-rock | BONHOMME | rock qui roule des mécaniques (2 guitares) | 120 | mi min | +1 |
| lobby-splat | ENCRE FRAÎCHE | rock punk façon Splatoon (splats, bulles, « OH ! ») — 6 mesures | 180 | la maj | +5 |

### Niveaux · 8 secondes
| id | Titre | Pour | BPM | Couches |
|---|---|---|---|---|
| niv-altitude | ALTITUDE | NUAGES | 128 | ✅ |
| niv-neon-noir | NÉON NOIR | VILLE | 120 | ✅ |
| niv-metro | MÉTRO | VILLE (2-step) | 132 | — |
| niv-gravite | GRAVITÉ ZÉRO | ORBITE | 120 | ✅ |
| niv-satellite | SATELLITE | ORBITE (techno minimale) | 126 | — |
| niv-monstre | TRIPLE MONSTRE | FRÉNÉSIE (drift phonk) | 120 | — |

### Longues · 16 mesures
NÉON DRIVE (course/nuages, ✅ couches) · PLUIE NÉON (ville, ✅ couches) · APESANTEUR (orbite) · DARK TRIAD (phonk, frénésie) ·
CAISSE ENREGISTREUSE (boutique/missions) · GARAGE (lo-fi) · HYPERVITESSE (DnB, nitro).

### Lobby actuel
GLASSY PLUCKS : section 1:04,13 → 2:14,37 du morceau Suno de Léo, 44 mesures exactes à 150,335 BPM, do# dorien (ton 0).
⚠ **Droits** : Suno n'accorde l'usage commercial qu'aux générations faites avec un abonnement payant — garder la preuve.

## 4. LE SYSTÈME « LA MUSIQUE SUIT LA VITESSE » (le cœur de la demande 6)

**Principe (remix vertical)** : une boucle est livrée en COUCHES qui s'additionnent exactement pour redonner le morceau.
Elles jouent toutes en même temps, calées à l'échantillon ; chacune a un **seuil de vitesse**.

- **Couche 1 = toujours harmonique** (nappe, accords, cloches, Rhodes) : à l'arrêt, quelques notes, jamais un tambour seul.
- Puis, dans l'ordre : mouvement mélodique (arpège, cloches) → basse → rythme léger (charley, clap, caisse) → **grosse
  caisse** → lead. La vitesse de croisière (100 %) ouvre tout.
- **En vol**, les couches marquées `sol` (la grosse caisse, `*` sur la page) se taisent ; elles **retombent à la pose**.
- **Fondus** : montée rapide (τ 0,3 s), descente lente (τ 1,1 s) — un freinage ne coupe pas la musique, une accélération se sent.
- **Rattrapage** : quand peu de couches jouent, le tout est remonté (jusqu'à +14 dB) vers 45 % de l'énergie du morceau
  complet — sinon la nappe, enfouie sous la batterie au mixage, ne s'entendrait pas à l'arrêt.
- **Nitro** : +4 dB d'aigus par-dessus.
- Tous ces réglages : `MV_REGLES` dans `musique-vitesse.js`. Les seuils : `COUCHES` dans `atelier-son/boucles.py`.

**Comment les couches sont fabriquées** (`rendre_couches`) : la boucle est rendue une fois par couche, les bus des couches
suivantes rendus MUETS (le son est fabriqué quand même : le hasard avance à l'identique, les réverbes ne reçoivent que ce qui
joue) ; couche n = mélange(1..n) − mélange(1..n−1). Un seul gain pour toutes, pas de limiteur (il casserait l'addition).
Vérifié (ALTITUDE) : la somme des couches redonne le morceau à la précision du calcul (écart −289 dB sous le signal), avant l’encodage AAC.

**Boucles déjà livrées en couches** :
| Boucle | Couches (seuil en % de la croisière) |
|---|---|
| NÉON DRIVE | NAPPE 0 · ARPÈGE 30 · BASSE 50 · RYTHME 70 · GROSSE CAISSE* 82 · LEAD 97 |
| PLUIE NÉON | RHODES+pluie 0 · BASSE 45 · BATTERIE* 72 |
| ALTITUDE | ACCORDS 0 · BASSE 40 · RYTHME 65 · GROSSE CAISSE* 85 |
| NÉON NOIR | NAPPE 0 · BASSE 40 · CAISSE 62 · BATTERIE* 82 |
| GRAVITÉ ZÉRO | NAPPE 0 · CLOCHES 35 · POULS 60 · SOUFFLE 85 |

**Ajouter une boucle au système** : dans `COUCHES` (boucles.py), une ligne `'id': [('NOM', ['bus', …], seuil[, 'sol']), …]`
— les noms de bus sont ceux des `M.piste('…')` / `M.patron('…')` de sa fonction (la grosse caisse doit avoir SON bus,
`'kick'`, pour pouvoir se taire en vol). Puis `python atelier-son/boucles.py <id>`. La page la prend toute seule.

**Tester** : `boucles.html` → curseur **VITESSE** (0-130 %) ou **SIMULER UNE COURSE** (44 s : arrêt → accélération →
croisière → vol → pose → nitro → virage serré → relance → crash). Les barres de chaque couche et le rattrapage s'affichent
sur la carte. Mesuré au banc : arrêt = accords seuls (+13,7 dB de rattrapage) ; 78 % = accords+basse+rythme ; 100 % = tout ;
en vol la grosse caisse tombe à 0,16 ; à la pose elle revient à 0,99 en ~1 s.

## 5. Le générateur procédural déjà dans le jeu (demandes 1-2)

Bloc `<<<GENERATEUR>>>` de `index.html` (juste après `musicPause`). RÉGLAGES › SOURCE (FICHIERS · GÉNÉRÉE), `SAVE.d.musGen`,
`?musgen=1`. Son propre AudioContext (`GEN.ac`). Recettes `GEN_REC` (menu, nuages, ville, orbite, fren, lobby, missions) ;
vol = batterie retirée + filtre ouvert, pose = « drop », nitro = charley en doubles + souffle, frénésie = recette `fren`.
L'écran MISSIONS joue toujours Glassy + une couche composée (`genMissions`, appelé dans `mGo`). Console : `dbgMusGen()`.
Testé (muet) : accueil → missions → course → vol → frénésie → pause → mort → retour, zéro erreur.

## 5 bis. DANS LE JEU DEPUIS LE 2026-10-01 : NÉON DRIVE sur la map 1 (NUAGES)

Léo : « NÉON DRIVE est pas mal, ajoute-la, on joue sur la map 1 NUAGES pour tester l'effet vitesse ». Bloc `<<<COUCHES>>>` de
`index.html` (juste après `<<<FIN GENERATEUR>>>`), `musique-vitesse.js` chargé dans le `<head>`.
- `MUSIC_COUCHES = { nuages: NÉON DRIVE (6 couches) }` : sur un lieu qui y figure, la musique à couches passe DEVANT la radio,
  le morceau du lieu (NOITE DE VELOCIDADE) et le générateur. Ville, orbite, menu, garage, mort : inchangés (Glassy au lobby).
- Vitesse = `flowVitN()` ; en vol (`mode==='fall'`) la grosse caisse se tait ; nitro = brillance ; FRÉNÉSIE = tout ouvert.
- Contexte `GEN.ac` créé au 1er toucher (la boucle se charge déjà pendant le menu), limiteur partagé, volume `musicVolCour`.
- Pause : arrêt, reprise du début de la boucle ; arrière-plan : idem ; mort : fondu.
- Repli : page en file:// ou fichier absent → l'ancienne musique. Console : `dbgCouches()` (avec `pourquoiPas`), `dbgCouches(0|1)`.
- Testé (muet, Chrome) : départ → couches qui montent avec la vitesse, vol (grosse caisse 0), pose (elle revient), frénésie
  (tout à 0,99), pause/reprise, mort → musique du menu. Zéro erreur. **Pas encore entendu sur iPhone.**
- Ajouter la VILLE / l'ORBITE : une entrée dans `MUSIC_COUCHES` (copier `couches` depuis `boucles-donnees.js`).

## 5 ter. v2 — VITESSE + MOTEUR, BIEN RYTHMÉE (2026-10-01)

Léo : « qu'elle évolue encore plus — ni trop vite ni trop lentement, pas casse-tête, bien rythmée, en fonction de la vitesse ET
du moteur, un mélange des deux pour une expérience fluide ». Sur NUAGES, le jeu joue désormais **NÉON DRIVE · MOTEUR**
(`neon-drive-2`, `neon2()` dans boucles8.py) : 8 mesures (16,3 s), chaque partie a des VARIANTES :

| Couche | Seuil | Variantes (moteur minimum) |
|---|---|---|
| NAPPE | 0 | A accord · B ouverte, 9e, filtre qui s'ouvre (≥ 0,35) |
| ARPÈGE | 30 % | A croches · C accords syncopés · B doubles-croches à l'octave (≥ 0,25) |
| BASSE | 50 % | A octaves · B galop (≥ 0,2) |
| RYTHME | 68 % | A clap + charley · B + fantômes, shaker, roulement (≥ 0,3) |
| GROSSE CAISSE* | 80 % | — (se tait en vol) |
| LEAD | 95 % | A · B (deux mélodies) · C haute et tenue (≥ 0,5) |
| ÉNERGIE | 90 % | ride + stabs + montée — débloquée à moteur ≥ 0,45 |

+ `neon-drive-2--transition.m4a` : une mesure de montée puis crash, joué à chaque palier pour tomber SUR la mesure.

Règles (`MV_REGLES` de `musique-vitesse.js` v2) :
- **Moteur** = `engTier / 12` (0 → 1 vers le 12e palier) : avance les seuils jusqu'à −20 %, débloque variantes et ÉNERGIE.
- **Sur les temps** : une couche n'entre/ne sort qu'au prochain temps ; hystérésis ±0,04 ; 2 temps minimum entre deux
  changements ; entrer = net, sortir = en douceur ; en vol la grosse caisse sort à la croche, revient sur le temps.
- **Anti-lassitude** : à chaque tour (16 s), chaque partie à variantes change une fois sur deux (au moins une change) ;
  le LEAD joue un tour sur deux tant que le moteur < 0,7 (tout le temps en frénésie).
- **Palier gagné** : la transition tombe sur la mesure, les variantes les plus riches débloquées entrent sur cette mesure.
- Mesuré (page + jeu, muet) : arrêt = nappe seule (+11,6 dB de rattrapage) ; 60 % = + arpège + basse ; 100 % = tout sauf
  ÉNERGIE ; vol = grosse caisse coupée ; palier à moteur 0,5-0,68 = NAPPE B, BASSE B, LEAD B/C, ÉNERGIE ; les variantes
  tournent au tour suivant et le lead se repose un tour sur deux.
- ⚠ Mémoire : 15 pistes de 16 s décodées ≈ 85 Mo (float32, 44,1-48 kHz). À surveiller sur iPhone ; si trop lourd : passer
  basse et grosse caisse en mono, ou réduire le nombre de variantes.
- Page : `boucles.html`, groupe MUSIQUE DE JEU — curseurs VITESSE et MOTEUR, bouton PALIER +1, SIMULER UNE COURSE (le
  moteur y monte d'un palier toutes les 7 s).
- Données du jeu : `assets/audio/music/boucles/couches-jeu.js` (`window.COUCHES_JEU`, écrit par boucles.py).

## 5 quater. v2.1 — LE TEMPS + LE SON BONIFIÉ (2026-10-01)

Léo : « au début laisse vraiment la base, et évolue aussi avec le temps ; c'est original mais un peu trop brut, bonifie ».
- **Troisième axe, le TEMPS** (secondes de musique jouée dans la partie, à l'horloge audio, remis à 0 à chaque partie) :
  chaque couche a son heure — NAPPE et BASSE (la BASE) dès 0 s · GROSSE CAISSE 15 s · ARPÈGE 30 s · RYTHME 45 s · LEAD 70 s ·
  ÉNERGIE 90 s (+ moteur ≥ 0,45). Le moteur avance ces heures (jusqu'à −50 %). Avant son heure une couche reste fermée
  quelle que soit la vitesse ; après, la vitesse l'ouvre/la ferme (seuils : 0 · 30 · 60 · 45 · 70 · 90 · 85 %).
- **Entrées sur la MESURE**, sorties sur le temps ; la grosse caisse qui retombe après un vol : sur le temps.
- **Son bonifié** (`neon2`) : grosse caisse −5 dB et moins de clic (elle dominait de 10-15 dB), pompe .75 → .45, nappe en
  chorus + sous-octave, basse sinus + scie douce, arpèges triangle (moins de carré), lead scie + triangle avec portamento,
  aigus adoucis par bus, réverbe 3,4 s plus sombre avec pré-délai. Équilibre : NAPPE −21 dB, GROSSE CAISSE −18, BASSE −26.
- Filet : si la musique DEVRAIT jouer et que la boucle est prête, `mcvTick` la lance (le départ par le garage la ratait).
- Mesuré : page (VITESSE 100 %, +15 S) → base seule à 0:06, grosse caisse 0:24, arpège 0:42, rythme 1:00, ÉNERGIE au palier ;
  jeu → base seule 13 s à 94 % de vitesse, grosse caisse à 15 s. Zéro erreur.
- Page : TEMPS affiché, bouton **+15 S**, SIMULER UNE COURSE dure 2 min (2 vols, 2 nitros, virages, un palier / 10 s).

## 5 quinquies. v2.2-2.3 — PLUS ACTIF, ÇA SUIT LA VOITURE, L'ÉLAN, L'ACCALMIE (2026-10-01)

Léo : « c'était bien avant, plus actif, plus harmonieux ; le temps peut être moins ; il faut que ça SUIVE — si la voiture
s'arrête, la musique en même temps, une rupture harmonieuse » · « plus de détails selon comment on accélère en nitro d'affilée,
l'accélération normale pareil avec moins d'intensité » · « la musique ne doit pas se casser, plutôt une belle transition —
construire un nouveau son à partir de chaque inspi ».
- **Plus actif** : heures ÷ 3 (GROSSE CAISSE 5 s · ARPÈGE 10 · RYTHME 16 · LEAD 25 · ÉNERGIE 35), entrées sur le TEMPS,
  grosse caisse .62 → .78, pompe .55. **Plus harmonieux** : la nappe enchaîne ses accords au plus court (`voix_menee`).
- **Ça suit** : un FILTRE sur la musique ← vitesse (1,3 kHz à l'arrêt → 19 kHz lancé), en continu.
- **L'ÉLAN** (0-1, `etat().elan`) : nitro = .35 d'emblée +.18/s tenue, relâchée < 1,5 s puis reprise = ENCHAÎNÉE (l'élan
  continue) ; accélération normale = élan plafonné à .45. Effets : aigus jusqu'à +6 dB, un SOUFFLE synthétisé qui grimpe (nitro),
  ÉNERGIE ouverte > .55, le lead ne se repose plus > .5, variantes chargées du RYTHME et de l'ARPÈGE si > .75 tenu 1 s (rendues
  quand il retombe), nitro LÂCHÉE après 1,5 s = crash sur le temps.
- **L'ACCALMIE** (pas une coupure) : vitesse qui s'effondre (chute > .32 sous .55 — plot, choc) ou arrêt progressif → sur le
  TEMPS suivant le groove se retire en fondu, le son se ferme doucement (900 Hz), une FLORAISON (`neon-drive-2--rupture.m4a`,
  la mineur add9, attaque .35 s) fait le pont et la partie ACCALMIE (`neon-drive-2--accalmie.m4a` : cloches de verre + guitare
  pincée, `neon2_calme`, calée sur la boucle) prend le relais sur la nappe. RELANCE (vitesse > .45) : la montée part, son crash
  tombe sur la mesure, le groove revient SUR cette mesure, l'accalmie s'efface.
- Réglages : `MV_REGLES` (musique-vitesse.js). Mesuré (page, muet) : croisière = tout ; plot → ACCALMIE, filtre 2 kHz → 900 Hz ;
  relance → groove revenu, élan .23 (accélération) ; nitro tenue → élan .98, ÉNERGIE + LEAD + variantes chargées ; arrêt
  progressif → ACCALMIE. Jeu : couches à leur heure, élan .21 à l'accélération, zéro erreur.
- Page : bouton **FREIN** (maintenu), NITRO maintenu fait accélérer, SIMULER UNE COURSE (100 s : plot, nitro tenue, nitro
  enchaînée, arrêt, relances), la carte affiche ÉLAN et ACCALMIE. La logique de la page tourne sur une minuterie (pas sur
  l'affichage) : elle suit même onglet caché, comme le son.

## 5 sexies. v3 — LA VILLE : ADDICTIVE LOOP ÉCHANTILLONNÉ ET RÉORGANISÉ (2026-10-01)

Léo : « fais pareil avec la musique de la VILLE sur la map — produis en samplant et en réorganisant, tu as plus de matière ;
ajoute ta touche, même avec des sons d'avant que tu as générés ». Script : `atelier-son/ville.py` (→ `ville--*.m4a`, met à jour
`couches-jeu.js` et `boucles-donnees.js`, entrée `ville-addictive`). Jeu : `MUSIC_COUCHES.ville='ville-addictive'`.
- **Mesuré sur ADDICTIVE LOOP** : 129,92 BPM, mesure 1,847 s (1re mesure à 0,681 s), cycle d'accords de 4 mesures FA · RÉ m ·
  LA m · LA m (la mineur), sections qui changent sur les multiples de 4 mesures : intro calme 0-7 · groove 8-23 · plein 24-35 ·
  coupure 36-39 · gros 40-53 · coupure 54-55 · lourd sur SOL 56-71 · montée 64-79 · sommet 80-92 · fin.
- **Découpé** en 12 PHRASES de 4 mesures (+ 0,3 s de queue), début recalé sur l'attaque (±40 ms) : CALME (0, 4) · GROOVE (8, 16)
  · PLEIN (24, 28) · GROS (40, 44) · SOMMET (80, 84) · MONTÉE (64, 68 — le passage tendu sur SOL). `ville--phrases.m4a` (89 s).
- **Le SÉQUENCEUR** (musique-vitesse.js, `sequence` dans les données) : une phrase démarre toujours sur le temps fort de la
  grille ; toutes les 2 mesures il peut changer de section EN GARDANT LA POSITION (CALME/GROOVE/PLEIN/GROS partagent la grille :
  l'harmonie continue) ; MONTÉE et SOMMET (autre harmonie) ne s'ouvrent/ne se quittent qu'en fin de phrase. Niveau voulu =
  .1 + .5·vitesse + .2·temps(40 s) + .15·moteur + .4·élan → CALME < .35 < GROOVE < .55 < PLEIN < .72 < GROS < .88 < SOMMET ;
  nitro tenue (élan > .7) = MONTÉE ; nitro LÂCHÉE après la montée = la phrase suivante en SOMMET (le drop). ACCALMIE = saut
  immédiat à l'intro, à la même place, fondu d'un temps (+ floraison + accalmie) ; RELANCE = retour sur la mesure, au moins PLEIN.
- **Ma touche** (4 mesures, même grille) : PLUIE + vinyle (toujours) · NAPPE de Rhodes enchaînée (sections CALME/GROOVE) ·
  ARPÈGE triangle en écho (élan ≥ .4, jusqu'à GROS) · CHARLEY TRAP en rafales (élan ≥ .6, partout). ACCALMIE de la ville :
  Rhodes tenus + cloche + pluie. FLORAISON : la m add9 en Rhodes égrené + pluie. TRANSITION à 130 BPM.
- Nouvelles règles de couche : `elanMin`, `niveauMax` (section maximale). Pas de rattrapage en mode séquence (le morceau porte le volume).
- Changement de LIEU en pleine partie (nuages → ville) : l'ancienne boucle s'arrête, la nouvelle se charge et démarre.
- Mesuré (page, muet) : arrêt = CALME + pluie + nappe ; croisière = GROS ; nitro 5 s = MONTÉE + charley trap ; nitro lâchée =
  SOMMET ; plot = ACCALMIE (CALME, filtre 960 → 900 Hz) ; relance = GROS. Jeu : NUAGES (neon-drive-2) → `dbgSaut()` → VILLE
  (ville-addictive) qui démarre en CALME avec pluie + nappe. Zéro erreur.
- ⚠ Droits : ADDICTIVE LOOP est un morceau de Léo (Suno ?) — même règle que Glassy : garder la preuve d'abonnement payant.

## 5 septies. v3.1 — LA VILLE SUIT LA BOÎTE DE VITESSES, LE MORCEAU PORTE SEUL (2026-10-01)

Léo : « sur la ville c'était un peu mal réparti ; permets-toi de changer les règles du son et de prendre des libertés pour offrir
une expérience son parallèle entre musique et moteur » · « la musique c'était un peu bof, trop superposé ».
- **La BOÎTE mène** (`boite` = (rapport−1)/(rapports−1), `regime` = engRpm, passés par `mcvTick`) : 1er rapport = GROOVE,
  milieu de boîte = PLEIN, haut de boîte = GROS ; dernier rapport tenu, régime > .7, deux phrases de GROS = SOMMET. Arrêt
  (< .12) = CALME. Nitro tenue = MONTÉE, lâchée = SOMMET (le drop). Accalmie / relance : inchangées.
- **Pas à pas** : on MONTE d'une marche au plus toutes les 2 mesures ; on ne REDESCEND que d'une marche, en fin de phrase, et
  seulement si on le veut depuis une phrase entière. Pas de yo-yo.
- **Le passage de marche s'entend** : un SOUFFLE qui monte (`ville--monte.m4a`, une demi-mesure, fini pile sur la marche) ou qui
  descend (`ville--descend.m4a`).
- **Le moteur respire avec la musique** : `mv.pompeMoteur()` (le volume du moteur se creuse de 28 % sur chaque temps, revient
  en ~0,1 s), posé sur `engPost` dans la boucle du son moteur (`window.MUS_POMPE_MOT`) — sur NUAGES comme en VILLE.
- **Le morceau porte seul** : retirés la nappe de Rhodes et l'arpège (toujours par-dessus). Restent, à LEUR moment : la PLUIE
  (seulement en CALME, donc à l'arrêt et pendant l'accalmie), les rafales de CHARLEY TRAP (seulement en MONTÉE, élan > .75),
  l'ACCALMIE Rhodes, la FLORAISON, les souffles. Règle `niveauMin` ajoutée ; en mode morceau la 1re couche obéit à ses règles.
- Les phrases d'une marche sautée au milieu ou d'un saut immédiat sont TOUTES fondues (liste `noeuds`) ; la position d'un saut
  se lit sur la grille (multiples de 4 mesures depuis le départ).
- Page : boîte SIMULÉE (5 rapports, affichée BOITE R1…R5). Mesuré (muet) : arrêt = CALME + pluie ; R1 GROOVE · R2-R3 PLEIN ·
  R4-R5 GROS ; 30 s au dernier rapport = SOMMET ; nitro 9 s = MONTÉE + charley ; lâchée = SOMMET ; ralenti à 60 % = PLEIN
  (une marche à la fois) ; arrêt brusque = ACCALMIE + pluie. Jeu : CALME → GROOVE au démarrage, pompe active, zéro erreur.

## 5 octies. v3.2 — DE VRAIS INSTRUMENTS, LA PROFONDEUR EN EFFET (2026-10-01)

Léo : « la musique c'était pas totalement ça — le choix des instruments ; et la profondeur de la musique, c'est encore un peu un
effet de superposition ».
- **Les NUAGES jouent un vrai morceau** : NOITE DE VELOCIDADE (leur musique d'origine), mesuré 132,25 BPM (le détecteur lisait
  165 : les débuts de section tombent tous sur des multiples de 1,8147 s), cycle MI · SI · SOL# m · SOL# m (sol# mineur), intro
  calme sur RÉ# 0-15. Phrases : CALME (4, 8) · GROOVE (16, 20) · PLEIN (24, 28) · GROS (48, 52) · SOMMET (64, 68) · MONTÉE
  (40, 44 — les coupures rythmées). Entrée `nuages-noite`. NÉON DRIVE reste : `dbgCouches('nuages','neon-drive-2')`.
- **`atelier-son/ville.py` devient un échantillonneur à réglages** (`CONFIGS` : ville, nuages) : `python atelier-son/ville.py
  [ville|nuages]`.
- **Rien d'ajouté par-dessus le morceau** pendant la course : retirés les rafales de charley et l'accalmie en Rhodes de la ville
  (les nuages n'ont aucune couche). Reste la pluie de la ville, seulement à l'arrêt.
- **La PROFONDEUR est un effet** (musique-vitesse.js) : une réverbe (2,8 s, calculée) en parallèle du son direct ; lancée = tout
  près (sec), ralentir = elle s'ÉLOIGNE (réverbe jusqu'à .42, direct −40 %, + le filtre de la vitesse qui assombrit), arrêt et
  accalmie = au loin. Vaut aussi pour NÉON DRIVE.
- **La FLORAISON est taillée dans le morceau** : un demi-seconde de son intro, ÉTIRÉE en 4 s (grains de 140 ms, recouvrement ×4),
  épanouie puis éteinte, réverbe — les mêmes instruments, suspendus (`figer` dans ville.py).
- Mesuré (page, muet) : NUAGES arrêt = CALME, profondeur .42, filtre 1,3 kHz ; 50 % = GROOVE, .19 ; 100 % = GROS, 0 ; arrêt brusque
  = ACCALMIE, .42, 915 Hz. Jeu : `nuages-noite` démarre en CALME, monte en GROOVE, zéro erreur.

## 5 nonies. v4 — LE CHEF D'ORCHESTRE (2026-10-01) — LA VERSION EN JEU

Léo : « au début c'était mieux… creuse comment créer une musique adaptée au jeu sans que la personne s'en rende compte, qui
tienne compte des virages, qui évolue ; chaque niveau a sa musique ; la 1re idée me plaisait, la 2e trop superposée ; les
musiques encore faibles » → questionnaire : SOURCE = « je recompose en synthèse, mais dépasse tes limites » · FAIBLESSE = « l'ÉNERGIE ».

**Le principe change** : plus de boucles pré-mixées découpées en couches. Chaque niveau a une BANQUE DE SONS rendue hors ligne et
une PARTITION ; le jeu JOUE la partition note à note (comme les musiques adaptatives des jeux pro).
- `atelier-son/compo.py` : instruments (grosse caisse en 3 couches saturée, clap large, caisse de roulement, charleys, ride,
  crash, basse roulante / 808 / reese, accords supersaw 7 voix, nappe en chorus, Rhodes FM, pluck, cloches, lead supersaw avec
  vibrato, montées 1 et 4 mesures, descente, impact, crash inversé, sub-drop) · les 3 COMPOSITIONS · la PLANCHE (tous les sons
  dans un fichier, chacun à son adresse) · le CALIBRAGE (chaque piste du DROP rendue seule, gain réglé vers sa cible `CIBLES`)
  · un APERÇU (la chanson INTRO → GROOVE → MONTÉE → DROP ×2 → BREAK). → `assets/audio/music/compo/<niveau>-sons.m4a`,
  `<niveau>-apercu.m4a`, `compo-donnees.js` (`window.COMPO`).
- Les 3 musiques :
  | Niveau | Titre | Style | BPM | Clé | Grille |
  |---|---|---|---|---|---|
  | NUAGES | ASCENSION | progressive euphorique | 128 | la m | la m · fa · do · sol |
  | VILLE | NUIT ÉLECTRIQUE | trap sombre demi-temps, 808 qui glisse | 140 | fa m | fa m · ré♭ · la♭ · mi♭ |
  | ORBITE (`espace`) | ATTRACTION | drum'n'bass, reese | 174 | ré m | ré m · si♭ · fa · do |
  Chacune : un hook A, un hook B (la fin qui grimpe), le lead doublé à l'octave au 3e acte.
- `musique-chef.js` (`MusiqueChef`, même API que MusiqueVitesse) — la FORME suit la course, toujours sur la grille :
  INTRO (1re phrase) → GROOVE → DROP selon l'INTENSITÉ (vitesse + élan + moteur, montée τ 1 s / descente τ 3,5 s, densité des
  pistes réglée par `minI` en GROOVE/INTRO) ; MONTÉE tant que la nitro est tenue (élan > .7, sur la barre suivante, montée de 4
  mesures), DROP au LÂCHER avec IMPACT ; la mesure avant un DROP devient un ROULEMENT ; après 4 phrases de DROP, un BREAK (le
  hook rejoué en pincé) puis le DROP revient à l'ACTE suivant ; 3e acte = le morceau MONTE D'UN TON ; VOL = grosse caisse / clap
  / basse coupés à la croche + passe-haut, POSE = impact sur le temps ; ACCALMIE = BREAK au temps suivant + son qui se ferme,
  RELANCE = montée (même entamée) puis le groove SUR la barre (~1,4 s mesuré) ; palier moteur = montée + crash, actes plus vite.
  En continu : VOLANT → l'arpège (±.38) et le lead (±.22) glissent du côté du virage, l'arpège s'éclaircit ; DRIFT → roulements
  de charley ; vitesse → filtre ; lenteur → réverbe ; élan → aigus ; POMPE de la basse/accords sous chaque grosse caisse ;
  colle (compresseur) + écrêteur doux ; le moteur respire sur le temps (`pompeMoteur`). Réglages : `CH_REGLES`.
- Jeu : `MUSIC_COUCHES = {nuages:'compo-nuages', ville:'compo-ville', espace:'compo-orbite'}` ; `mcvDonnees(id)` lit COUCHES_JEU ou
  COMPO ; une instance par type (chef / couches) ; le chef REPREND sa chanson après une pause ; volume ×.85 (il sort plus dense).
  Anciennes versions : `dbgCouches('nuages','neon-drive-2')`, `('ville','ville-addictive')`, `('nuages','nuages-noite')`.
- Page `boucles.html`, groupe LE CHEF D'ORCHESTRE : une carte par niveau (section · acte · intensité · élan · vol · accalmie ·
  drift · virage en direct), bouton APERÇU (la chanson entière), curseurs VITESSE / MOTEUR / VIRAGE, boutons NITRO / FREIN / DRIFT /
  PALIER +1, SIMULER UNE COURSE (avec virages et drifts).
- Mesuré (muet) : aperçus DROP ≈ −11 dB RMS (−15 avant), INTRO/BREAK ≈ −20 ; page : arrêt INTRO → 50 % GROOVE → 100 % DROP →
  nitro MONTÉE → lâcher DROP ; vol −13,5 dB (batterie/basse coupées) → pose −10,9 ; plot → BREAK ; relance → DROP en 1,4 s ;
  actes 1 → 2 → 3 (+2 demi-tons) ; VILLE et ORBITE jouent ; jeu : NUAGES joue (INTRO → …), changement de lieu en direct OK, zéro erreur.
- ⚠ Mémoire : planches 93-119 s décodées ≈ 35-45 Mo par niveau (un seul niveau chargé à la fois). Pas encore écouté par Léo,
  ni testé sur iPhone.

## 5 decies. v4.1 — L'ASPIRATION RÉPARÉE + LE STUDIO (2026-10-01)

**Le défaut** (Léo : « un effet style vent inversé, coupé en plein de morceaux, qui prend le dessus quand tu boostes non-stop, effet
aspiration — c'est en trop »). Quatre causes, toutes dans `musique-chef.js` / `compo.py` :
1. `regle()` est appelée à chaque image ; tant que la MONTÉE attendait sa barre (jusqu'à une mesure ≈ 1,9 s), CHAQUE appel replantait
   un `planEtat('MONTEE')` → des dizaines de `montee4` empilées au même instant (le souffle énorme qui « aspire »).
2. Nitro tenue = MONTÉE sans fin : `choisir()` rendait MONTEE à chaque phrase, et la frénésie passe `nitro:true` en permanence.
3. La recharge de nitro qui clignote (vide → 0,1 s de jus → vide) relançait une montée à chaque reprise.
4. Le souffle lui-même avait un TRÉMOLO qui accélérait (2 → 16 Hz) : « coupé en morceaux ». + la montée commençait sur n'importe quelle
   mesure de la phrase : le roulement de caisse repartait de zéro au milieu.
**Réparé** : UNE section en attente à la fois (`vise`), UNE montée sonne à la fois (`riser`, coupée net au lâcher ou à l'accalmie),
une montée PAR APPUI (`monteeFaite`, nitro lissée sur `nitroTrou` 0,35 s), la montée dure son souffle (`monteeMes` 4 mesures) puis tombe
SEULE sur le DROP même nitro tenue, la phrase repart de sa barre (`ancre`) ; souffle sans trémolo, moins de bruit, `gMontee` .6.
Mesuré (moteur muet, 14 s de nitro tenue puis 20 à-coups) : 2 montées en tout, chacune résolue en 4 mesures — avant : une par image.

**LE STUDIO** (`studio.html`, servi par `python3 atelier-son/studio-serveur.py` → http://localhost:8767/studio.html) :
- BIBLIOTHÈQUE rangée : compositions v4 + leurs **tiges** (chaque morceau découpé en couches de 4 mesures sans couture : BATTERIE,
  BATTERIE GROOVE, BASSE, ACCORDS, RHODES, ARPÈGE, LEAD, PLUCK — `TIGES`/`tiges()` dans compo.py → `compo/<niv>-tige-*.m4a`,
  `COMPO[n].tiges`), boucles de niveau 8 s, longues 16 mesures, lobby, leurs couches, morceaux du jeu. Filtres par RÔLE et par niveau.
- LA TABLE : 8 pistes calées sur un tempo (vitesse de lecture, ×2/÷2 pour rester proche de 1), chacune « s'ouvre à » une vitesse
  (toujours, 25, 50, 75, 100 %, nitro) ; curseur VITESSE / NITRO / SIMULER = la course. Pastille de tonalité (vert = même gamme,
  jaune = voisine, orange/rouge = ça frotte).
- LE DÉ (générateur, différent de l'ancien GEN) : une piste par rôle, tirée parmi tiges/couches, en gardant les pistes 🔒 ; la 1re
  piste tonale fixe la gamme, les suivantes doivent être à ≤ 1 quinte et peu déformées par le calage ; préfère le niveau, va chercher
  dans d'autres morceaux (mélange). Seuils posés comme en course (harmonie toujours, basse 25 %, rythme 50 %, mélodie 75 %).
- LES NIVEAUX (NUAGES, VILLE, ORBITE, FRÉNÉSIE, LOBBY, MISSIONS, GARAGE) : note libre, épingles ★, versions de mix enregistrées,
  **MP3 de référence** glissés dans le niveau (→ `atelier-son/studio/references/<niveau>/`, hors git).
- Tout s'écrit dans **`atelier-son/studio/studio.json`** + **`atelier-son/studio/BRIEF.md`** (lisible) : « regarde le brief » suffit
  pour que Claude retrouve les notes, épingles, versions et MP3. Sans le serveur : navigateur seulement + COPIER/TÉLÉCHARGER LE BRIEF.
- Prochaine marche (pas faite) : jouer une VERSION du studio en jeu (un mix de tiges qui s'ouvrent à la vitesse = ce que faisait
  musique-vitesse.js avec des couches).

## 6. CE QUI RESTE À FAIRE (intégration au jeu)

1. **Léo choisit** une boucle par niveau (et pour le lobby). Si elle n'est pas encore en couches : l'ajouter à `COUCHES`.
2. **Brancher `musique-vitesse.js` dans `index.html`** (proposition, à valider) :
   - charger le script ; créer `mv = MusiqueVitesse(ac, sortie)` sur le contexte du générateur (`GEN.ac` — il est
     indépendant de l'interrupteur SON ; ⚠ sur iPhone, WebAudio suit le bouton silencieux) ;
   - une table `MUSIC_COUCHES = { nuages:'niv-altitude', ville:'niv-neon-noir', orbite:'niv-gravite' }` (à la place de
     `MUSIC_LIEU` quand la boucle a des couches) ; `musicSuitLieu` charge la boucle du lieu ;
   - à chaque image dans `musicTick` : `mv.regle({ vitesse: flowVitN(), enVol: mode==='fall', nitro: nitroOn })` —
     `flowVitN()` vaut ≈ 1 en croisière (km/h ÷ `vmaxShow()`×`FLOW_VREF`), 1,25-1,4 en nitro, ~0,5 au départ ;
   - volume : multiplier la sortie par `musicVolCour` (curseur MUSIQUE + ducking de l'annonceur) ; pause/arrière-plan/mort
     comme le générateur (`genPause`, `genStop`) ; analyseur → `musicAna` (le ciel qui bat).
   - le `<audio>` et la radio restent le repli (page en file://, pas de WebAudio).
3. Frénésie : proposer DARK TRIAD ou TRIPLE MONSTRE comme `MUSIC_FREN.f` (le jeu l'attend, le fichier n'a jamais été livré).
4. Écouter sur iPhone : volume relatif musique/effets, et le rattrapage à l'arrêt (+14 dB max).
5. Avant la sortie : `sw.js` doit mettre en cache les nouveaux fichiers si on veut le hors-ligne (aujourd'hui `cashcar-v31`).

## 7. Règles du projet à respecter (rappel)

- Tests **muets** (son/musique/voix à false, ou volumes à 0) : le panneau de test joue le son chez Léo.
- Git : commits locaux OK ; **push seulement quand Léo le dit**, sur une branche, jamais sur `main` de Sacha
  (dépôt `sachaberes-lgtm/CAR-CASH-GIT`).
- La police pixel n'a pas de capitales accentuées : libellés pixel SANS accent.
- Un son d'effet nouveau passe par `sfx('famille.nom')` (console de son), jamais un oscillateur bricolé sur place.
