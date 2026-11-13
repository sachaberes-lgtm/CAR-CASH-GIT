# SON SOLIDE — le son de CASH CAR sur iPhone (13/11, branche `son-solide`)

Partie de `origin/ios-ultime` (v1535). Cache **v1536**. Rien sur `main`, rien fusionné dans `ios-ultime`, pas de build iOS.
Le caractère des sons (timbre, volume, mixage) n'a pas bougé : seuls l'ordonnancement et la robustesse changent.
Banc : volet intégré, 390×844, `?tel=1&palier=2&colonne=0&garde=1&intro=ancien&attente=0&chute=0`, MUET (sauvegarde `sfx`/`mus`/`vox` coupés,
puis pour faire tourner le graphe : curseurs à 0 et `AudioNode.connect` redirigé vers un gain 0 avant le premier geste).

| Interrupteur | Coupe |
|---|---|
| `?sans=suitehorloge` | les suites de notes sur l'horloge audio (écran de mort, lettres de bannière, cylindres) |
| `?sans=polycourse` | la polyphonie sous la chaleur limitée à la course |
| `?sans=sortiearret` | la sortie à l'arrêt excusée par le gouverneur (+ le plancher qui suit le démarrage) |
| `?sans=dortapres` | la pause qui attend la fin réelle de son fondu |

---

## 1. « Quand on meurt, le son de mort bug un peu » (build 75)

Tout ce qui joue à la mort et après a été relu : `boomDetone` (son de mort tiré au sort via `sampleWA`, explosion,
signature de cause), coupure des boucles (`boucle-5-sons` à l'image du crash, `endGame` 1,8 s plus tard : tout passe par
`setTargetAtTime`, sur l'horloge audio, sans clic), musique (`POUCE_JEU.fin(true)` : fondu sur l'horloge audio),
puis la voix de l'écran de mort (`mCompteSon`) et le morceau du menu qui se recharge 1,4 s après `endGame` (`musicMenu` → `pbjLobby`).

**Cause prouvée n° 1 : la voix de l'écran de mort partait de minuteurs.** Les ~15 sons (enseigne, 12 crans qui ralentissent
de 85 à 240 ms d'écart, la pose, le record) étaient chacun un `setTimeout` qui jouait « maintenant ». C'est le moment le plus
chargé du fil principal après la mort (l'écran se bâtit, la sauvegarde s'écrit, le morceau du menu se monte en plein compte).
Un minuteur retardé lâche ensemble tous les crans en attente.
Preuve (vrai `sfx.js` + vraie banque, contexte réel muet, heure audio de départ de chaque son relevée sur sa poignée) :

| mode | charge du fil principal | écart max au plan | écarts entre crans (ms) |
|---|---|---|---|
| minuteurs (avant) | aucune | 6 ms | 85 91 90 102 106 112 123 139 154 182 240 |
| minuteurs (avant) | tâche de 300 ms à 600 ms | **284 ms** | 85 91 **373 0 0** 43 122 134 154 187 240 |
| horloge (après) | aucune | 0 | 85 89 94 99 105 114 123 136 155 184 239 |
| horloge (après) | tâche de 300 ms à 600 ms | **0** | 85 89 94 99 105 114 123 136 155 184 239 |

Sur un iPhone, une tâche de 300 ms au chargement du morceau du menu est ordinaire (la boîte noire en montre bien plus).
**Correctif** : `sfxSuite(L, garde)` (`code/son/console-son.js`) programme toute la suite d'un coup (`o.t`, que le lecteur
sait jouer). La règle « seulement si l'écran de mort est encore là » est tenue par un guet de 100 ms qui éteint les sons pas
encore partis (vérifié : REJOUER pendant le compte éteint les crans à venir dès que `ici()` devient faux, comme avant).
La polyphonie (`ui.compte` : 4 voix) coupe une voix à l'heure de la note qui la remplace : même résultat qu'en direct.
Le creux du moteur et le recul de la musique d'un son programmé (`SON_DUCK`, `SIG_RECUL` : `ui.record`, `ui.debloque`,
`caisse.debloquee`) se font à son heure. Vérifié en jeu : mort → les 14 sons programmés aux bons délais, aucune panne ni erreur.

**Cause prouvée n° 2 (suspect d) : `__ccPoly` encore allumé sur l'écran de mort.** Le gouverneur thermique ne relit `__ccPoly.on`
qu'une fois par seconde, avec `!gameOver` ; pendant les 1,8 s de l'explosion il reste vrai, et `endGame` → `mFill` programme
la voix de l'écran dans la même seconde. Au palier ≥ 2 (téléphone chaud), `ui.compte` tombait à 2 voix au lieu de 4.
Preuve (banc, même suite de 12 crans) : lecteur en course → 3 voix coupées ; hors course → 0.
**Correctif** (`sfx.js`) : la polyphonie sous la chaleur ne vaut que pendant la course du lecteur (`S.enCourse`, rendu faux par
`finCourse` au début d'`endGame`). Comme la voix est désormais programmée d'un coup, sans ce correctif TOUS les crans seraient passés à 2 voix.

**Écartés**
- (a) `HC_FROID` (30 puis 15 i/s) : part 3,5 s après `endGame` (`HC.goT`), le compte est fini à 2,4 s ; aucun son de cet écran
  n'est piloté par l'image (l'ascenseur du montant, `mCount`, est un `setInterval` à l'heure de la page). La pause à 10 i/s :
  contexte endormi. Les niveaux de musique posés à chaque image (`PB.niveau`, tc 80 ms) restent lisses à 15 i/s.
- (b) HUD endormi : il ne gèle que des animations CSS ; aucun son n'attend une fin d'animation.
- (c) `__ccSonCharge` 1/2 (11/8 voix) : les crans et l'enseigne sont sur le bus `ui`, hors du plafond ; le son de mort
  (`sampleWA`) n'est pas une voix du lecteur ; le plafond prend la voix qui finit la première : jamais la queue de l'explosion.
- Le son de mort lui-même : enveloppe sur l'horloge audio (`sampleWA`), décodé d'avance (`waPrecharge`), coupé à la nouvelle
  partie et à la pause seulement. Reste un repli `HTMLAudio` (fichier pas décodé ou contexte pas « running ») dont le fondu est
  un `setInterval` et qui, sur iPhone (volume verrouillé), se coupe sec à `max` : cas rare, non touché (voir « suites »).

**À l'oreille sur le téléphone** : le compte de l'écran de mort doit égrener régulièrement, même téléphone chaud ; dire si
quelque chose « bug » encore pendant l'explosion elle-même (avant l'écran) — ce serait alors le fil audio étouffé par la
chaleur (les 300 particules, débris et matériaux créés à la détonation sur une puce bridée), pas l'ordonnancement.

## 2. Les décrochages au démarrage (`cran 1 · 502 ms` puis `cran 2 · 504 ms`)

**Cause prouvée** : une horloge audio ARRÊTÉE alors que le contexte dit « running » (la sortie d'iOS qui n'a pas encore
démarré — le veilleur qui lit le gain de sortie à 0,00 alors qu'une rampe vers 1 était posée dit la même chose : l'horloge
n'avançait pas). `sonGouverne` relève l'écart toutes les 500 ms : une horloge immobile donne d = 500 ms à chaque relevé,
deux relevés = un cran. Banc `node outils/banc-son/gouverneur-sim.mjs` (la fonction telle quelle, horloges simulées) :
horloge arrêtée 2,2 s juste après le plancher → **exactement la ligne de la boîte noire** (`cran 1 · 517 ms`, `cran 2 · 500 ms`).
Second défaut au même banc : le plancher des 3 premières secondes prenait le MINIMUM, donc la valeur d'avant un démarrage
lent (une sortie qui met 0,6 s à démarrer = un décrochage de 0,6 s compté).

**Correctif** (`code/son/graphe-audio.js`) : horloge audio immobile ≥ 250 ms pendant que la page dessine = « sortie à l'arrêt » :
rien n'est compté, une ligne `son | sortie audio à l'arrêt N ms …` (3 par session), un repère neuf quand elle repart.
Pendant le plancher, un saut au-dessus du seuil est le démarrage : le plancher le suit. Deux arrêts à moins de 15 s
l'un de l'autre comptent (un fil qui rend par à-coups). `dbgSonGouv()` donne `arrets` et `arretMs`.

| scénario (banc) | avant | après |
|---|---|---|
| sain, 2 min | 0 | 0 |
| démarrage : horloge arrêtée 0,6 s | 1 décrochage | 0 (1 arrêt) |
| horloge arrêtée 2,2 s après 3,2 s (boîte noire) | **cran 2** | **0** (1 arrêt) |
| page gelée 6,5 s puis horloge arrêtée 2 s | 1 | 0 |
| course : 2 vrais décrochages de 80 ms en 10 s | cran 1 | cran 1 |
| course : fil étouffé (60 % des blocs, 4 s) | cran 2 | cran 2 |
| course : fil par à-coups (100 ms rendues / 300 ms rien) | — | cran 2 (arrêts répétés) |
| course : horloge arrêtée 0,5 s une fois (route, appel) | cran 1 | 0 (assumé : alléger n'y peut rien) |

Au volet, course réelle : 0 décrochage, 0 arrêt. La chaleur garde son levier propre (`SON_CHAUD`).
**À lire sur le téléphone** : la boîte noire d'un lancement à chaud doit montrer `sortie audio à l'arrêt …` au lieu des deux
décrochages, et la session rester au cran 0 (sauf téléphone chaud : `téléphone chaud : charge du son au cran …`).

## 3. Robustesse

- **Les autres suites de notes** sur minuteurs, aux moments les plus chargés de la course : les lettres de la bannière de niveau
  (`maps/continuite.js`, la map suivante se bâtit) et les cylindres de la carte moteur (`economie/achat-carte-moteur.js`) passent
  par `sfxSuite`. Vérifié : `dbgMoteur()` → cylindres programmés à 200 / 250 ms. La crainte écrite dans `continuite.js`
  (« dix notes programmées d'un coup se couperaient ») ne tient pas : la coupe de polyphonie tombe à l'heure de la note suivante.
- **La pause qui s'endort avant la fin de son fondu** : le fondu de sortie est sur l'horloge audio, l'endormissement sur un
  minuteur ; si le fil audio décroche pendant ces 0,5 s, `suspend()` figeait la sortie à mi-fondu (clic, queue qui ressort au
  réveil). `acDortApres` (console-son.js) n'endort que quand l'horloge audio a passé la fin du fondu (relu toutes les 30 ms, 0,6 s
  au plus), pour la pause (`init.js`) et le clic dans la pause (`pauseSonFin`). Vérifié au volet : pause normale → endormi à
  501 ms audio (comme avant) ; horloge lue en retard de 250 ms pendant le fondu → endormi à 741 ms, après le fondu.
- Relus, sains : coupure des boucles à la mort, à la pause (`togglePause` : coupe nette en 12 ms + `stopJeu` + `annuleFutur`)
  et en arrière-plan (pause automatique, contexte endormi, réveil par le veilleur) ; `stt` refuse les valeurs non finies ;
  les portes du graphe ne ferment qu'après 7 constantes de temps.

**Suites possibles (non faites)** : le repli `HTMLAudio` du son de mort (fondu par `setInterval`, coupure sèche sur iPhone) ;
`bqSonCoupe` / `chuteDouxCoupe` (fondu sur l'horloge audio, `stop()` sur un minuteur : un contexte endormi entre les deux
couperait au réveil) — touchent l'ambiance de la boutique et du ciel, à faire avec la session qui les tient.

## Gardes
`node code/assembler.cjs --depuis-morceaux` d'accord · `garde-demarrage` OK · `garde-charte` OK · `garde-allege` OK · `garde-burnout` OK.
