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
