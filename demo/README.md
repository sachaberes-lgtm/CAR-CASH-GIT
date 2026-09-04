# CASH CAR — démo publique

Version réduite du jeu, faite pour être **envoyée par lien** : mode Survivant + garage,
en anglais, sans classement. Le jeu complet (`../game/`) n'est jamais modifié.

## Fabriquer

```bash
python3 build.py /chemin/vers/game
```

Ce dossier fabrique la démo **à partir du jeu complet** ; il ne le contient pas. À côté
du jeu (`~/cash-car/demo/`), le chemin par défaut `../game` suffit et l'argument est
inutile. Depuis un clone isolé, il faut le donner — ou poser `CASHCAR_GAME`.

Le script applique ~85 patchs **vérifiés** à une copie de `game/index.html`. Si un motif
ne se trouve plus, le build **s'arrête** en nommant le patch en défaut, au lieu de
produire un fichier à moitié converti. Les patchs purement cosmétiques sont marqués
facultatifs (`opt=True`) : leur disparition est signalée (`⊘`) sans casser le build.

> Le jeu évolue vite. Le 03/09, l'amont a bundlé three.js en local, remplacé Google
> Fonts par une police locale, supprimé l'écran « tourne ton téléphone » et réécrit
> l'enregistrement du service worker — quatre patchs sont tombés d'un coup. C'est le
> comportement voulu : mieux vaut un build qui s'arrête qu'une démo à moitié anglaise.

## Ce qui sort

| Sortie | À quoi ça sert | Poids |
|---|---|---|
| `cash-car-demo/` | le dossier à **déployer** — c'est ce qu'on met derrière un lien | 838 Ko + 17 fichiers |
| `index.html` | **un seul fichier**, tout embarqué : à envoyer par mail, à ouvrir en double-clic | 2,4 Mo |
| `cash-car-demo.artifact.html` | le même, sans squelette `<html>/<head>/<body>` : pour publier en Artifact claude.ai *(non versionné)* | 2,4 Mo |

### Pourquoi deux emballages du même jeu

Mesuré sur la page publiée en monofichier : **4,9 s** avant le `load`, et pendant tout
ce temps un écran blanc. Quelqu'un qui reçoit un lien dans un canal ne regarde pas une
page blanche pendant cinq secondes — il referme.

- La version **hébergée** garde three.js, la police et les voix en **fichiers à côté**.
  Le HTML tombe à 838 Ko (≈180 Ko sur le réseau une fois compressé), le navigateur peint
  presque tout de suite, tire three.js en parallèle et les voix seulement au premier
  geste. Les fichiers sont copiés depuis le jeu **à chaque build** : pas de dérive
  possible entre le moteur du jeu et celui de la démo.
- La version **un fichier** embarque tout en data-URI. Plus lente à ouvrir, mais
  rigoureusement autonome : elle marche en `file://`, derrière un pare-feu, et l'Artifact
  n'a de toute façon droit qu'à une seule page.

Les deux sortent du **même jeu patché à l'identique** : la bifurcation ne porte que sur
l'emballage. Et les deux ouvrent sur un **écran de démarrage** posé tout en haut du
document — avant la feuille de style du jeu, avant le moindre octet de three.js — pour
que le navigateur ait quelque chose à peindre dès les premiers kilo-octets.

**Aucune des deux ne dépend d'un hôte externe** : ni CDN, ni Google Fonts, ni requête
tierce. Rien à négocier avec un pare-feu d'entreprise ou une politique de sécurité.

## Déployer

Le dépôt porte un `vercel.json` à sa racine : c'est lui qui dit à Vercel de servir
`demo/cash-car-demo` et non la racine (qui n'a pas d'`index.html` — d'où le 404 du
premier essai). On le décrit **dans le dépôt** plutôt que par le réglage « Root
Directory » du tableau de bord : le déploiement se relit, et il survit à un ré-import
du projet. Il pose aussi les en-têtes de cache — un an sur `vendor/` et `assets/`, qui
ne changent qu'avec le moteur du jeu ; jamais sur la page. C'est ce qui rend la
deuxième visite instantanée.

⚠ Pas de commentaires dans ce fichier : le schéma Vercel refuse les clés `//`, y
compris à l'intérieur d'un bloc `headers` (premier build en erreur pour ça).

### À la main, sans git

Le domaine de production est **`https://car-cash-git.vercel.app`** — c'est ce que vise
la constante `BASE` en haut de `build.py`. Le projet répond aussi sur
`car-cash-git-scar1.vercel.app`. En cas de doute, `get_project` liste les domaines réels
dans son champ `domains` : ne pas les deviner à partir du nom du dépôt.

```bash
cd demo/cash-car-demo
npx vercel@latest login
npx vercel@latest deploy --prod --yes
```

⚠ Si le domaine change, change `BASE` en haut de `build.py`, relance le build et
redéploie — sinon l'aperçu Slack cherche son image à une adresse qui n'existe pas. Slackbot ne lit que les 32 premiers Ko d'une page et n'exécute
aucun JavaScript : c'est pour ça que les balises sont tout en haut du fichier et que
l'image est un vrai fichier à côté, pas un data-URI.

### Mesurer, pas déduire

Quatre diagnostics tirés de la seule lecture du code se sont révélés faux (turbine de
la nitro, sifflement d'air, intro studio, niveau maître). Ce qui a tranché, c'est un
**banc d'essai** : un spectrogramme de la sortie réelle, une prise d'écoute sur chaque
nœud de gain, et de quoi couper les chaînes une par une.

⚠ Deux pièges du banc, à ne pas réapprendre :
- **Le panneau de navigateur masqué fausse tout.** `visibilityState` passe à `hidden`,
  le jeu s'auto-mets en pause et le navigateur bride l'animation : vitesse 0, audio
  nul. Le banc force `visibilityState` à `visible`.
- **Chrome headless ne rend pas l'audio de façon fiable** (1 échantillon sur 260).
  Les mesures valables viennent du navigateur réel.

### Deux pièges rencontrés côté Vercel

**L'identité git.** Cette machine n'avait ni `user.name` ni `user.email` : git
fabriquait `sachaberes@MacBook-Air-di-Sacha.local`, que Vercel refuse — il ne peut pas
rattacher le commit à un compte, et bloque le déploiement. Les déploiements ressortaient
`BLOCKED` **sans un seul log de build**, ce qui ressemble beaucoup à un projet en pause :
`get_project` renvoyait bien `live: false`. La vraie cause était trois lignes plus haut.

```bash
git config --global user.name  "Sacha Beres"
git config --global user.email "sachaberes@gmail.com"
```

**Le `302` vers `vercel.com/sso-api`.** Tant qu'aucun déploiement de production n'a
abouti, le domaine renvoie vers une page de connexion Vercel — on croit à une protection
de déploiement à désactiver. Elle s'est levée toute seule au premier déploiement réussi.
Si elle revient un jour : *Settings → Deployment Protection → Vercel Authentication →
Disabled* (à faire à la main, le connecteur de l'agent est en lecture seule sur les
projets — 403 sur `update_project`).

**Le domaine court n'existe pas d'avance.** `car-cash-git.vercel.app` n'apparaît dans
les `domains` du projet qu'une fois la première production en ligne. Avant ça, le nom
court renvoie un 404 qui appartient à quelqu'un d'autre — et on cherche longtemps une
erreur de configuration qui n'existe pas.

## L'image d'aperçu

```bash
./capture-og.sh
```

À relancer **dès que l'écran d'accueil change**. Le harnais (`capture-og.html` +
`capture-og.mjs`) ouvre la démo dans Chrome headless, franchit l'intro « 1.61 », laisse
l'accueil se poser, puis capture par le protocole DevTools.

Trois pièges, tous contournés dans le script — ne pas les réintroduire :
`chrome --screenshot` ne rend jamais la main (le plateau de l'atelier tourne sans fin,
le budget de temps virtuel ne s'épuise pas) ; `setDeviceMetricsOverride` change le cadre
de capture sans relayouter la page (bandes noires) ; et la fenêtre demandée n'est pas le
viewport obtenu, donc on lit la taille réelle et on y découpe le format 1200×630 centré.

## Ce que la démo change

- **Écran d'accueil** : c'est le GARAGE. La caisse tourne sur son plateau, le menu flotte
  par-dessus — titre, sceau « Demo edition for Public AI », et trois boutons : *Play
  survivor mode*, *Change car*, *Settings*. Le bouton Garage a disparu : on y est déjà.
  *Change car* déplie la fiche de sélection sur la même scène 3D. La fin de partie
  ramène au même endroit.
  - l'overlay ne capte plus le clic (`pointer-events:none`, sauf ses enfants) pour que
    le glisser-tourner du garage passe à travers ;
  - le « clique n'importe où pour jouer » est retiré : il partait en course au moindre
    geste de rotation ;
  - `leaveStage()` **respawn** la caisse. Sans ça on lançait la partie avec une voiture
    en chute libre à 1500 m — elle tournoyait dans le vide, compteur à zéro.
- **Piste** : le **tremplin** (« gap catapulte ») est retiré — il posait une rampe, une lèvre,
  puis un TROU dans la dalle. `gapRun` pose désormais du bitume continu de portée équivalente :
  on ne peut pas juste supprimer l'appel, l'archétype ALPIN clôt sa zone dessus et le module
  aléatoire n°10 compte sur sa longueur. Chaîne vérifiée : `GAPMARK` → `HOLES` → `RAMPS`, les
  trois restent vides, donc plus de trou, plus de lèvre, plus de catapulte.
- **Garage** : c'était la seule surface du jeu écrite en Segoe UI au lieu de la police
  pixel — fiche, titre, description et légende repassent en `Press Start 2P` (tailles
  redescendues et interligne ouvert, la police est large ; les flèches ◀ ▶ gardent une
  pile sans-serif, ces glyphes n'existent pas en 8 bits).
- **Clavier** : mort tant que la scène d'accueil est à l'écran. Espace (= nitro) lançait
  une partie depuis la vitrine. Un écouteur en phase de **capture** coupe tout avant les
  handlers du jeu, plutôt que de les patcher un par un et d'en oublier un au prochain
  raccourci ajouté. Conséquence assumée : Échap ne referme plus la fiche, c'est le ✕.
- **Garage** : le bouton ÉQUIPER était peint en `opacity .5/.7` pour dire « verrouillée » /
  « déjà à toi ». Tout étant débloqué dans la démo, cette grisaille ne disait plus rien et
  rendait le bouton illisible : plaque dorée pleine largeur quand il y a un geste à faire,
  plaque verte quand c'est déjà ta caisse.
- **Modes** : Survivant armé d'office. Course solo, parc freestyle et bac à sable retirés.
- **Roster** : les 15 caisses ouvertes (une vitrine dont 14/15 sont verrouillées ne montre rien).
- **Classement** : le TOP 10 et la saisie de nom sont retirés ; le record personnel reste.
- **Langue** : anglais par défaut. La démo complète au passage la traduction du jeu — le
  HUD Survivant (`TOI`, `EN TÊTE`, l'alarme de dernière place) et la coque mobile étaient
  écrits en dur, hors du dictionnaire, et « Restaurer un code » n'avait aucune entrée EN.
- **Audio — l'intro studio retirée** : c'était la vraie cause du « son strident puis
  plus rien ». Mesuré : analyse spectrale de l'enregistrement fourni (saturation à
  **pleine échelle**, RMS 32 400/32 767, pics à 316 et 1000 Hz — donc un grave écrêté,
  pas un aigu) + instrumentation de la page (deux contextes audio ; le premier atteint
  0,808 de pic puis passe à `closed`). Ce premier contexte, c'est l'intro « 1.61 » :
  `master.gain = 1` derrière un simple compresseur, **aucun limiteur**, là où la chaîne
  du jeu a `MASTER → compresseur → WaveShaper limiteur`. Elle saturait, puis
  `iAC.close()` coupait tout le son d'un coup. Le bloc `#splash` est supprimé : la
  séquence se désarme d'elle-même, le contexte n'est jamais créé, et on gagne six
  secondes avant de jouer. Vérifié après coup : **1 seul contexte audio, 0 valeur non
  finie, 0 erreur JS** sur une partie avec nitro.
- **Audio — le son de nitro, refait à neuf** : après huit correctifs chirurgicaux
  ratés, l'ancien réacteur a été **débranché en entier** puis reconstruit. Ce que le
  nouveau n'a pas, par décision, et pourquoi :

  | absent | ce que ça faisait |
  |---|---|
  | WaveShaper | l'ancien souffle sortait un signal quasi **carré** (facteur de crête 1,5 = écrêtage, pas timbre) |
  | filtre en peigne rebouclé | résonance qui s'emballe |
  | dent de scie + Q élevé | l'ancienne turbine : **43 %** de son énergie au-dessus de 4 kHz |
  | fréquence suivant la vitesse | c'est ce qui transforme un souffle en sifflet quand on pousse |
  | nœuds créés par frame | la fuite qui saturait le thread audio |

  Ce qu'il est : du bruit brown sous deux passe-bas (520 Hz pour le corps, 95 Hz pour
  la poitrine) et une respiration lente de ±90 Hz sur la coupure. Trois nœuds créés
  une fois, deux gains modulés en douceur.

  **Mesuré hors ligne AVANT livraison** (`OfflineAudioContext`, déterministe) :
  pic **0,339** · RMS 0,079 · **facteur de crête 4,3** · énergie >4 kHz : **0,008**.
  Le facteur de crête est le juge : 4,3 = du bruit sain ; l'ancien souffle était à 1,5.

  ⚠ Toute modification de ces cinq valeurs doit repasser par le banc
  (`OfflineAudioContext` — voir l'historique git pour le harnais).

- **Audio — LA FUITE DE NŒUDS** : isolée par bissection avec le user
  — voix de l'annonceur seule = aucun problème, donc le coupable était dans la chaîne
  SFX, et aucun de mes correctifs précédents ne pouvait marcher.

  `flamePop` et `noiseBurst` construisent trois nœuds (source, filtre, gain), les
  câblent sur `MASTER`… et ne les arrêtent **jamais** :

  | | `stop()` | `disconnect()` |
  |---|---|---|
  | `crackle` | ✅ | — |
  | `subBoom` | ✅ | — |
  | **`flamePop`** | ❌ | ❌ |
  | **`noiseBurst`** | ❌ | ❌ |

  Or `flamePop` tourne à **25 appels/seconde** pendant la nitro, et chaque appel
  allouait en plus un buffer de bruit neuf (`brownBuf` : deux passes sur ~3000
  échantillons, aucun cache). Le graphe audio grossit sans fin, le thread ne tient
  plus la cadence : ça grésille — le « strident » — puis il lâche — le « son coupé ».
  Les deux moitiés du symptôme, une seule cause.

  Corrigé : `stop()` + `disconnect()` sur `onended`, et buffers mis en cache (durée
  quantifiée au 1/100 s). Mesuré sur 30 s de nitro maintenue : **8 buffers** alloués
  au lieu d'un par pop, et **45 débranchements pour 56 branchements** — le graphe
  reste borné.

- **Audio — le « limiteur » de sortie était une distorsion** : la vraie cause, trouvée
  en construisant un banc d'essai (spectrogramme de la sortie + coupure sélective des
  chaînes) au lieu de lire le code.

  `lim` n'est pas un limiteur. Sa courbe vaut `tanh(x*k)/tanh(k)`, normalisée pour que
  ±1 sorte à ±1. Sa **pente à l'origine** vaut donc `k/tanh(k)` = **×1,51** : elle
  *ré-amplifie* tout signal faible. C'est exactement pourquoi baisser `MASTER`
  (1 → .72 → .34) n'a **jamais rien changé** — la courbe le remontait à chaque fois. Et
  sur les forts signaux elle sature en fabriquant la série harmonique complète.

  Corrigé par `tanh(x*k)/k` : pente 1 à l'origine (les signaux faibles passent
  inchangés), plafond `tanh(k)/k` = 0,66. Elle limite au lieu d'amplifier. Passage en
  `oversample='4x'`, 2x laissait replier de l'aliasing dans l'aigu.

  | mesuré, nitro maintenue | avant | après |
  |---|---|---|
  | pic de sortie | **1,14** *(au-dessus du maximum)* | 0,431 |
  | frames ≥ 0,9 | — | **0** |
  | dureté (énergie > 5 kHz) | **0,23** | **0,0012** |
  | spectre | traîne harmonique jusqu'à **12 kHz** | rien au-dessus de 480 Hz |

  ⚠ Ne pas rebrancher `engCurve` sur le bus maître, et ne pas remonter `MASTER.gain`
  (.62) sans refaire la mesure. `engShaper` et `jetDist` gardent `engCurve` : leur
  distorsion est voulue, sur leur propre chaîne.

  ⚠ **Débrancher `lim` coupe tout le son** (vérifié : pic 0,000). Le câblage
  `MASTER → compresseur → lim → destination` doit rester tel quel.


- **Audio — les sifflets** : quatre fréquences pilotées par la vitesse n'avaient
  **aucun plafond**, et trois alimentaient des passe-bande à Q élevé. Un passe-bande à
  Q=14 n'est plus une couleur, c'est un sinus — et il montait avec la vitesse droit
  dans les 3-4 kHz, le pic de sensibilité de l'oreille.

  | filtre | Q | fréquence | rôle |
  |---|---|---|---|
  | `whF` | **14 → 5** | `2000 + v*1,2` → plafond 2600 | le sifflement d'air, **le coupable** : il s'allume à 560 km/h, ce qu'un booster fait franchir d'un coup |
  | `skF2` | 10 → 6 | `sq*1,56` → plafond 2730 | crissement de drift |
  | `skF1` | 8 → 5 | `sq` → plafond 1750 | crissement de drift |
  | `jetOsc` | (Q=6 en aval) | `900 + v*3,5` → plafond 2400 | turbine de la nitro |

  Baisser Q ne coupe pas le son : ça élargit la cloche, donc on entend du **vent** au
  lieu d'un sifflet. C'est ce que le jeu voulait — son propre commentaire dit « la
  signature des vitesses folles », pas une alarme. `windF` et `jrF` sont bornés par
  cohérence : plus aucune fréquence pilotée par la vitesse n'est libre dans le fichier.
  **Ces bugs sont dans le jeu complet**, pas dans la démo.
- **Audio — le silence définitif qui suivait** : un `NaN` écrit dans un `AudioParam`
  éteint le nœud pour toute la session (le fichier le dit déjà noir sur blanc à propos
  de `drv`). `spd3` alimente les 26 écritures du bloc moteur : une seule frame de
  vitesse non finie suffisait à tout tuer. Assaini à la source.
- **Audio** : voix de l'annonceur embarquées. Musique et sons de mort ne sont pas
  distribués dans ce dépôt → désarmés, zéro 404.
- **Console** : `MeshLambertMaterial` n'accepte pas `flatShading` en three r128 — la
  propriété était ignorée (aucun effet visuel perdu) mais criait 18 fois à l'ouverture
  du garage. Retirée du helper ET de la surcharge du sol, qui la réinjectait.
- **Mobile** : le panneau de pause était resté en français. Il ne passe pas par
  `applyLangDOM` et ses libellés sont réécrits en dur par `panSync` — il fallait
  traduire le gabarit ET le réécrivain.
- **Sauvegarde** : clé `cashcarDemoSave` — jouer à la démo n'écrase pas la progression du jeu complet.

## Connu, non corrigé

Le jeu se met en pause quand l'onglet passe en arrière-plan (`visibilitychange`, ligne
~12459 de `game/index.html`) et **ne reprend pas** au retour : le message « PAUSE »
s'efface au bout de 2,2 s, et sur ordinateur seule la touche `P` relance. Quelqu'un qui
change d'onglet revient sur un jeu figé sans rien pour le lui dire. C'est un comportement
du jeu complet, pas de la démo — non touché ici, mais à surveiller pour une démo publique.
