# PASSATION — SESSION SON (14/10/2026, 13 h 25, du Mac vers le PC de Sacha)

Mission (Sacha, 5 h 30) : « tu obéis à PILOTAGE ; ta mission est que Cash Car devienne le jeu avec la meilleure ambiance sonore du monde ;
améliore tous les sons en essayant de les rendre addictifs ». Puis le cap de 6 h 10 : « les DÉTAILS, le jeu le plus propre possible, chaque
chose compatible et magnifique avec les autres ; pas de grande refonte ». Protocole de la nouvelle machine : `PROTOCOLE-PC.md` (branche
`origin/pilotage-notes`).

## 1. OÙ EN EST LA BRANCHE
- `son-integration` = assemblage T6 (`242da07`) + 38 correctifs SON (tous intégrés : aucune branche `son/*` ne porte de travail en plus).
- Vérifié à 13 h 22 : syntaxe 0 erreur (14 scripts), garde du burn-out OK, chinois / Poki = 0, FUMÉE OK couché + debout
  (accueil → JOUER → course → mort → REJOUER → mort → accueil, 0 erreur JS).
- ⚠ RIEN N'A ÉTÉ ÉCOUTÉ : aucun agent n'a eu de navigateur sonore ni d'iPhone. Tout est prouvé par le code, des calculs hors ligne et les
  fumées. Le guide d'écoute : `passation/SON-ECOUTE.md` (chaque changement + son interrupteur de comparaison).

## 2. CE QUI EST FAIT (repères dans `VERSION PRINCIPALE/index.html`, chercher par nom)
- **`MUS_WA`** — la musique passe par WebAudio sur iPhone iOS 17+ (`navigator.audioSession` présent, session 'playback') : curseur MUSIQUE
  vivant, ciel du titre léger (`MUS_CIEL`), fondus, sonie égale, compresseur doux des creux. Chien de garde (`musWaGarde`) : silence exact
  2,5 s → `localStorage.cc_muswa_ko='1'`, retour DÉFINITIF à l'<audio>. Forçages : `?muswa=0|1`, `localStorage.cc_muswa='0'|'1'`.
  Console : `dbgMusWa()` / `dbgMusWa('raz')`. Protocole d'essai en 12 points : `passation/SON-muswa.md`. iOS < 17, ordi, Android : inchangés.
- **`SON_VOL_VERROU` / `sfxVol`** — sur iPhone (volume <audio> verrouillé) les effets ne reculent plus de 3 dB sous une musique déjà à plein
  (rendu à −3 dB une fois MUS_WA branchée).
- **`MUS_SONIE` / `musTrim`** — sonie égale entre morceaux (mesurée BS.1770 : `passation/SON-sonie-fichiers.tsv`, outil `SON-sonie.cjs`),
  ±3 dB, sur le volume de l'élément (ordi, Android) et le gain WebAudio (iPhone 17+). Les fichiers de Léo ne sont PAS réencodés.
- **`SON_DUCK`** — neuf grands moments de plus creusent le moteur/vent (aura.x5/x8, snake, essoreuse, dauphin royal, pwr.double,
  frenesie.record, verdict.1, argent.gros).
- **Échelles** : pièces sans plafond (`SON_P_AR`, quinte toutes les 10), gammes du vol/frôlé en aller-retour (`sonPdAR`, `SON_ECH_AR`),
  frôlé panoramique, fruits 0-2-4-7 (`sonFruitSt`), appuis de menu rapprochés qui chantent (`sonUiSt`).
- **Le vol qui monte et se résout** (`SVOL`) : vent + régime avec la durée du vol et les figures, résolution à la pose ; décollage sans
  trou ; jet sans grésillement (`JETN`) ; pops de flamme allégés sur téléphone.
- **Moteur** : paliers 17-30 comprimés au-dessus de 420 Hz (palier 30 : 2 203 → 691 Hz ; 1-12 au bit près) ; plus de sifflet à 9 kHz ;
  respiration ±0,7 % ; rapports du départ en petits tics. Comparer : `?genou=0` ou `dbgGenou(0|1)`.
- **Glisse / eau** : crissement +5 dB, charge du drift dans la tonalité, rase-bord à 520 Hz sur iPhone, plongeon du jade proportionné
  (le plouf de Léo gardé, doublons retirés).
- **Pluie** : boucle discrète ≈ −50 dBFS (`PLUIE_SON`, `PLUIE_NIV` .035).
- **Cohérence** : hiérarchie des niveaux recalée après le +4 dB de la pièce ; un geste = un son sur tous les écrans (`toast(h,muet)`,
  `GSON9`) ; transitions sans coupure (GLISSE en fondu, REJOUER coupe la queue de la mort : `finSonsCoupe`, la radio cède à GLISSE : `MUSJ`).
- **Divers** : morts égalisées (`DEATH_LIB`), frénésie sans trou (`FRENM.ok===true`), sons absents rebranchés (singes, atchoum, moyenne
  battue), ligne de néon manquée = `aura.perdue`, `uiClic` : une seule attente de clic en pause (danger plus doublé).

## 3. LA SUITE, PAR PRIORITÉ
1. **ÉCOUTER sur un vrai iPhone** (iOS 17+) : `MUS_WA` d'abord (bouton silencieux on/off, appel, arrière-plan, SON coupé, Bluetooth,
   curseur MUSIQUE, ciel, boutique). Si un problème : `localStorage.cc_muswa='0'` et le dire à PILOTAGE.
2. Écouter le reste avec `SON-ECOUTE.md` ; régler les niveaux signalés « à l'oreille » (vent +340 Hz en vol, crissement .30, pluie .035,
   tôle de la poursuite 7×/s, timbres des moteurs 17/24/30).
3. BACKLOG (section SON) restant : P3 « mots du son hors jeu » — les réglages disent « SON » en FR et « SFX » en EN ; extrait du lobby au
   relâcher du curseur MUSIQUE (utile surtout là où MUS_WA est éteint).
4. Mineurs de l'audit final : `passation/SON-oreille-neuve-4.md` (sons de bouclier morts, substituts empruntés à d'autres familles,
   `pose.parfait` sans variation, chevauchement de 5 sons à l'écran de fin…).
5. Sons à CUIRE un jour (banque) : `singe.troupe`, `caisse.atchoum`, `aura.moyenne` (substituts en place). ⚠ La recuisson
   (`node atelier-son/cuire.js`) exige ffmpeg (absent du Mac) ; garder retirés les 5 ids nettoyés à T2 et incrémenter le `?v=` de la balise.
6. Hors SON, signalé à DEBUGGING : `eauPTick` — `let n=0;const M9=…,dr=…,cp=…;` avalé par un `//` (gouttes de la mer du jade en erreur).

## 4. DÉCISIONS DE SACHA QUI ME CONCERNENT
- 6 h 10 : plus de grandes questions ; les 4 choix d'oreille Q-SON ont été tranchés PAR DÉFAUT (QUESTIONS.md, « Q-SON ») et restent
  ouverts à l'oreille de Sacha : Q-SON-1 musique iPhone par WebAudio (fait, iOS 17+ seulement) · Q-SON-2 son de mort (les trois gardés,
  égalisés ; une signature unique reste possible) · Q-SON-3 vent en orbite (silence gardé) · Q-SON-4 frénésie sans `dark-triad.mp3`
  (repli surmultiplié ; le morceau est à Léo).
- Plus de chinois, plus de POKI, plus de CRYPTOCITY (retirés).

## 5. MES RÈGLES
- Intouchables : le BURN-OUT du garage (`burn*`, `BURN`, `DON`), la boutique 3D, les voitures, et les MORCEAUX DE MUSIQUE de Léo
  (gains en code seulement, jamais de réencodage) ; le gameplay (physique, gains, règles, caméra) est verrouillé depuis le 09/10.
- Décisions datées de Léo à respecter (CLAUDE.md du jeu, sections son) : `vitesse.pure` muet, `depart.envol` retiré, pas de son ni de délai
  entre le départ et la musique, la note du moteur ne monte pas en « moustique », le grondement de la nitro reste baissé, `nitroWhoomp` gardé,
  `nuages.ambiance` coupée (« son parasite »).
- Jamais `main` ; un commit par correctif ; commentaires en français datés ; zéro allocation par image ; réglages audio par `stt`.

## 6. TESTER SANS MES BANCS
- `cd "VERSION PRINCIPALE" && python3 -m http.server 8000` puis http://localhost:8000/index.html (couché, le cadre de l'ordi) et
  `index.html?colonne=portrait` (debout). Son : cliquer d'abord (le contexte audio naît au premier geste).
- Paramètres : `?muswa=0|1` · `?genou=0` · (ancien jeu sans détails de sensations : `?sens=0`).
- Console : `dbgMusWa()`, `dbgGenou(0|1)`, `dbgSon('id',{st:4})` (joue un son de la banque), `dbgVu()` (dB de chaque chaîne continue),
  `dbgPortes()`, `dbgFren()`, `dbgVol()`.
- Syntaxe : chaque `<script>` d'index.html doit passer `node --check` ; garde : `sh garde-burnout.sh`.
