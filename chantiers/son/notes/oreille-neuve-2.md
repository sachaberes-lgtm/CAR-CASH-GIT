# L'oreille neuve n°2 — audit son (lecture seule, 2026-10-14) — VERSION PARTIELLE, en cours

Base : `son/integ/VERSION PRINCIPALE/index.html` (n° de ligne = index.html, ils bougent). Rien écouté : tout vient du code.
Déjà lu : boucle moteur/vent/sifflet/crisse/nitro (l. 50540-50700), `stt` (34766), PORTES (34835), pause/visibilité (51340-51383, 33556), chute libre (45154-45384).
Pas encore audité : portail, retour au garage, écran de fin, boutique/carrière/réglages, coût des nœuds hors nitro.

## Défauts (classés, provisoires)

### 1. Le vol est plat : rien ne monte pendant l'air time, donc rien ne se résout à la pose
- PREUVE : l. 50611-50618, branche `mode==='fall'` : `engRpm` tend vers une constante `.9`, gain moteur fixe `.013*vol*dk`, LFO fixe 9 Hz. Vent (l. 50624) : `+.018` fixe et `windF +260` fixe en 'fall'. Aucune de ces valeurs ne lit la DURÉE du vol. Le sifflet ne dépend que de `spd3`.
- POURQUOI : un saut de 3 s sonne pareil à 0,2 s et à 3 s ; la pose (`pose.choc`, `pose.parfait`) arrive sans que rien ait été tendu avant. C'est le moment le plus « cinéma » du jeu.
- CORRECTIF : avec `k=min(1,tVol/2.5)` (tVol = le chrono d'air existant, à retrouver : `grep -n "airT\|tAir\|fallT"`) : vent `+.018+.02*k`, `windF +260+380*k`, gain moteur `.013*(1+.6*k)`, `engRpm` cible `.8+.2*k`. Toutes via `stt` (rampe tc ≥ .15). À la pose les formules du sol reprennent déjà par rampe : la résolution est gratuite. Sans toucher aux gains du gameplay.

### 2. Le moteur « tombe » d'un coup au décollage
- PREUVE : en 'fall' `stt(gainN.gain,.013*...,.08)` ; et `pinkG/transG/diffG/ovrG/engTickG` à 0 en tc .12 (l. 50619-50621). Le gain moteur au sol est bien plus haut que .013 : chute en ~0,25 s. Au retour, `engRpm` remonte à tc ≈ 1/8 s.
- POURQUOI : le « trou » du décollage s'entend comme un décrochage du moteur, pas comme un envol ; il manque le crescendo avant la pose.
- CORRECTIF : tc `.08` → `.18` à la sortie du sol et plancher `.013` → `.02` (⚠ valeurs à régler à l'oreille).

### 3. Jet : gains tirés au hasard à CHAQUE image, contournant la garde de `stt`
- PREUVE : l. 50672 `jb*(...)*(.84+.32*Math.random())` et `jetLowG` `(.7+.6*Math.random())` : l'écart relatif dépasse toujours 0,2 % donc `setTargetAtTime` repart à chaque image (2 appels/img de plus, via le wrapper de porte).
- POURQUOI : coût sur iPhone, pour une « turbulence » qu'un seul LFO lent ferait gratuitement.
- CORRECTIF : tirer le hasard tous les 90 ms (`if(t-loop._nT>.09){loop._nT=t;loop._nR=.84+.32*Math.random();}`) et utiliser `loop._nR`.

### 4. Pops de flamme : 4 nœuds neufs par pop, 10 à 25 par seconde
- PREUVE : `flamePop` l. ~34816 (source+filtre+gain, plus la tranche) appelé `dt*(air9?9:(TEL_NATIF?10:25))` fois/s (l. 50682). Libérés par la fin de la source, mais ils arrivent en rafale sous nitro prolongée.
- CORRECTIF : sur `TEL_NATIF` : 6/s au sol, 4/s en l'air ; ou une seule source en boucle modulée par un LFO.

## Constats positifs vérifiés
- Pause : chaînes coupées en rampe 12 ms, sortie `BUSOUT` en fondu avant `AC.suspend()`, voix/mort (HTMLAudio) arrêtées à la main, musique en pause.
- Arrière-plan : `togglePause` automatique, `AC.suspend()`, retour : `AC.resume()` seulement si SND.sfx et pas en pause.
- Mort : vent, sifflet, moteur coupés en 50-80 ms (pas de clic), ralenti remis pour que la reprise ne parte pas d'un régime aigu.

## Déjà au niveau
- `stt` + PORTES : zéro zipper, chaînes débranchées au repos.
- Pause et arrière-plan : proprement fondus.
- Boîte de vitesses virtuelle avec cérémonie par rapport et hystérésis.

## Idées addictives
1. Riser de vol (voir défaut 1) résolu par `pose.parfait`.
2. Au décollage, une montée de filtre du vent (`windF`) en 0,3 s : « l'envol ».
3. À la pose réussie, un très court creux de 80 ms des chaînes (`dk` à .6) puis retour : le « coup de poing » avant le verdict.
4. Gamme des cylindres (`moteur.cylindre`) reprise à la pose parfaite.
5. Tape-stop du vent à la mort (descente de `windF`) plutôt que coupure.

## Ajout (fin de passe) — couverture
- Tape-stop de fin (l. 33690-33698, endGame l. 39560) : 11 pas de 55 ms (~0,6 s) puis `musicMenu()` à 1,4 s : ~0,8 s sans musique sous l'explosion, volontaire probablement. Sur iPhone `el.volume` est verrouillé : seule la chute de hauteur s'entend, pas le fondu. Pas de défaut franc.
- `chute.vent` : démarrée/arrêtée proprement (l. 45200, 45384), `musicStop._iv` et `INSTRU.iv` gardés contre le doublon : pas de setInterval orphelin trouvé.
- NON audités faute de temps : portail (sons `portail.proche/ouvre`, `monde.fin` trouvés, enchaînement non lu), boutique/carrière/réglages, REJOUER, coût hors nitro. Les 4 défauts ci-dessus sont les seuls établis ; je n'invente pas les 6 autres.
