# Le lot « gènes v4 » : le contrat (28/11/2026, l'architecte)

Source : `ml/ecurie/etude/prochaines-idees/LISEZ-MOI.md` (lu en entier, « Relecture » comprise) et `candidats.json` ; la décision de Fable (un seul lot,
une seule époque). Ce contrat est écrit **avant** tout code ; cette version intègre la relecture de trois relecteurs (dernière section). Les numéros de ligne sont ceux du commit `ddca156d8` (branche `genes-v4`). Ils vont bouger :
chaque endroit est donc donné aussi par **la phrase de code qui y est aujourd'hui**. Rien n'a été couru pour l'écrire.

Trois agents codent en même temps, sans se parler : (a) le génome et le pilote, (b) l'enfant et l'ordonnanceur, (c) le banc v2. Le § 9 dit qui touche quoi
et ce que chacun doit aux autres. Un intégrateur assemble, puis lance les tests lents (§ 8.5).

---

## § 1. En mots simples (pour Sacha)

1. On donne aux pilotes **quatre idées nouvelles**, chacune derrière un interrupteur éteint à la naissance. Éteintes, le pilote conduit comme c0025, au bit près.
2. **La sortie préparée** : à la grotte, au canyon, à la jade et en ville, quand la caisse va sortir par le bord et que seul le vol plané se pose, garder la nitro.
   **Remplacé le 28/11** (§ 3.1 bis) : la mesure des décollages a montré que ce cas n'arrive jamais ; l'idée devient **la nitro au décollage sur les maps
   à décor** (garder la nitro jusqu'au décollage, comme `bordOn` sur les maps sans décor), sans regarder les rayons du bord.
3. **Lâcher le volant pour mieux se poser** : en vol, si « ne rien faire » promet une pose bien plus droite, le pilote lâche le volant.
4. **La loi fidèle** : juger son vol (ou le piloter) sur le rayon que les yeux jouent exactement comme le pilote, au lieu d'un rayon un peu faux.
5. **Les secours en vol** : quand toutes les façons de rentrer annoncent une mort (les essais courts ne comptent pas), essayer deux façons de plus (planer bas, cabrer) et prendre celle qui se pose.
6. **La seconde chance** devient un réglage du génome (palier 12, comme aujourd'hui). Il est **figé** : la sélection n'y touche pas. Le changer reste ta décision.
7. Chaque course dira **combien de fois chaque interrupteur a vraiment agi**. Un gène qui ne se déclenche jamais se verra tout de suite.
8. On pourra jouer des courses **sur une map choisie** (la première map de la course seulement : le jeu tire les suivantes).
9. Un **banc des gènes v2** compare 3 à 5 idées à la fois au pilote de départ. Il annonce son critère avant de jouer, s'arrête tôt quand c'est clair et écrit un journal.
   Un « ça aide » du banc n'est qu'un **candidat** : il faut une seconde vague, sur des graines neuves, pour le croire (la leçon du coffre).
10. Tout cela fait **une seule nouvelle époque** : toutes les courses sont rejouées une fois, les pilotes et leurs noms restent. Le Ryzen la recevra d'un coup.
    La mise à jour est **à sens unique** : avant, copier l'état du Ryzen à part (§ 7).

---

## § 2. Le génome v:4

### 2.1 Les huit gènes nouveaux (en fin de `BORNES`, après `PORTAGE`)

Le tableau `GENES_V4` (nom à respecter) se place dans `genome.js` après `PORTAGE` (l.117-135) et entre dans `BORNES` après lui (l.184-188, aujourd'hui
`GESTES,PORTAGE).map(b=>Object.freeze(b)));`). Les 121 gènes de v:3 ne bougent pas. Index = place dans `BORNES` (0 = `marge`).

| index | clé | type | min | max | naissance | `ou` | garde (`GARDES`) | dans l'urne des mutations |
|---|---|---|---|---|---|---|---|---|
| 121 | `sortieOn` | drapeau | 0 | 1 | 0 | `'R'` | garde `sortieT`, `sortieJauge` | oui, comme tout drapeau (`pDrapeau` 0,03) |
| 122 | `sortieT` | réel | 0,3 | 1,2 | 0,7 | `'R'` | gardé par `sortieOn` | seulement si `sortieOn` = 1 chez le parent (`reelsLus`) |
| 123 | `sortieJauge` | réel | 0,2 | 1 | 0,5 | `'R'` | gardé par `sortieOn` | idem |
| 124 | `rienOn` | drapeau | 0 | 1 | 0 | `'R'` | garde `rienEcart` | oui (`pDrapeau`) |
| 125 | `rienEcart` | réel | 0,1 | 0,4 | 0,2 | `'R'` | gardé par `rienOn` | seulement si `rienOn` = 1 |
| 126 | `loiFidele` | choix | 0 | 2 | 0 | `'R'` | — | oui, comme `dessousDecor` (`pDrapeau`, puis l'une des deux autres valeurs) |
| 127 | `secoursOn` | drapeau | 0 | 1 | 0 | `'R'` | — (aucun réel) | oui (`pDrapeau`) |
| 128 | `chancePalierMin` | entier | 1 | 30 | 12 | `'profil'` | — | **non** : `fige:true` (§ 2.4) |

D'où viennent les nombres :
- `sortieT` : le dossier (n° 1, « réel 0,3..1,2 s (proposé 0,7) »). Même forme que `bordNitro` (genome.js l.122). La borne haute 1,2 reste sous 1,5 s :
  `vue.sorties.bord` n'existe que si `tenue` annonce le bord dans 1,5 s ou moins (`ml/bot/yeux.js` l.999 : `const dOff=r==='bord'&&G.k*H60<=1.5&&…`).
- `sortieJauge` : **écart à la décision** (le dossier dit « réutiliser `bordJauge` »). Impossible tel quel : `bordJauge` est gardé par `bordOn`
  (genome.js l.166, `bordOn:Object.freeze(['bordNitro','bordJauge'])`). Avec `sortieOn` = 1 et `bordOn` = 0, `bordJauge` serait lu sans être dans l'urne
  (`reelsLus`, l.362), et `tests/genes-muets.test.js` (m2) deviendrait faux. Variante la plus proche : un gène à lui, mêmes bornes et même naissance que
  `bordJauge` (l.123 : 0,2..1, naissance 0,5).
- `rienEcart` : le dossier donne 0,1..0,4 rad sans naissance. Je prends **0,2** : la pose promise par « rien » à la grotte est à 0,09 rad, celle du bot à 0,44
  (PROPOSITIONS.md l.109, cité par le dossier) ; 0,2 n'exige que la moitié de cet écart. Choix réversible, à faire valider (§ 10).
- `loiFidele` : 0 éteint, 1 = juger, 2 = juger et suivre (§ 3.3). Type `choix` et non `entier` : avec `entier`, `figMax` montre qu'un tirage −1 à 0 reste à 0
  (`cl(…,b.min,b.max)`, l.389), donc 0 → 1 n'arrive que 2,5 fois sur 100 et 0 → 2 jamais d'un coup. `choix` donne 1 et 2 à parts égales (l.388).
- `chancePalierMin` : 12 = `PROFIL.chance.palierMin` d'aujourd'hui (modele.js l.50). Bornes 1..30 = celles de la main (`ml/bot/doigts.js` l.97,
  `palierMin:['e',1,30]`).

Comptes après le lot (le contrôle de genome.js l.194 est à mettre à jour) : **129 gènes**, **91 réels** (`CONTINUS`, 88 + 3), 33 drapeaux, 2 choix
(`dessousDecor`, `loiFidele`), 3 entiers (`figMax`, `largeMax`, `chancePalierMin`).

### 2.2 `GARDES` (genome.js l.158-168)

Ajouter, dans l'ordre de `BORNES` :
```
sortieOn:Object.freeze(['sortieT','sortieJauge']),
rienOn:Object.freeze(['rienEcart'])
```
Le contrôle de l.200 (`if(Object.keys(GARDE_DE).length!==30)`) passe à **33**. `loiFidele`, `secoursOn` et `chancePalierMin` ne gardent aucun réel.

### 2.3 VERSION, migration, identifiant

- `VERSION` (l.193, `const VERSION=3;`) passe à **4**. Ajouter `const N_V3=121;` à côté de `N_V1`/`N_V2` (l.100-101) et
  `const CLES_V3=Object.freeze(BORNES.slice(0,N_V3).map(b=>b.cle));` à côté de `CLES_V1`/`CLES_V2` (l.195-196). `ORDRE_V4=GENES_V4.map(b=>b.cle)`.
- **`migrer`** (l.294-304). Aujourd'hui : `if(…(genome.v!==1&&genome.v!==2)…)return genome;` puis les clés exactes de v:1 ou v:2, puis `GESTES` (si v:1)
  et `PORTAGE` à leur naissance. Demain : accepter aussi `v:3` avec exactement `CLES_V3` dans l'ordre ; ajouter `GESTES` si v:1, `PORTAGE` si v:1 ou v:2,
  et `GENES_V4` dans tous les cas, à leur naissance ; `genome.v=4`. En place, rend le même objet. Un génome abîmé est rendu tel quel (`valider` dit son défaut).
- **`valider`** (l.263-264) : le message dit « attendu 4, ou 1 avec ses 86 gènes, ou 2 avec ses 107, ou 3 avec ses 121 ».
- **`shaGenome`** (l.420-428). **Ce qu'il fait aujourd'hui pour v:3**, exactement :
  1. un génome v:1 ou v:2 est d'abord migré sur une copie (l.423 : `genome0.v===1||genome0.v===2?migrer({…})`) ;
  2. si `genome.v===VERSION` et que les 14 gènes de `PORTAGE` sont **tous** à leur naissance (`portageANaissance`, l.421), il hache la forme d'avant :
     `cles = gestesANaissance(genome) ? CLES_V1 : CLES_V2`, puis `sha1(JSON.stringify({v:(1 ou 2), A:{ces clés, dans cet ordre}, WV, WS}))` (l.425-427) ;
  3. sinon `sha1(JSON.stringify({v:3, A:enOrdre(genome), WV, WS}))` (l.428).

  **Demain, la même règle un cran plus loin** :
  1. migrer sur une copie si `v` vaut 1, 2 **ou 3** ;
  2. si les 8 gènes de `GENES_V4` sont **tous** à leur naissance (`v4ANaissance`, nouvelle, même forme que l.421) :
     - si `PORTAGE` aussi est à sa naissance : exactement l'étape 2 d'aujourd'hui (forme v:1 ou v:2) ;
     - sinon `sha1(JSON.stringify({v:3, A:{les 121 clés de CLES_V3, dans cet ordre}, WV, WS}))` — l'octet près de ce que l.428 calcule aujourd'hui ;
  3. sinon `sha1(JSON.stringify({v:4, A:enOrdre(genome), WV, WS}))` (les 129 clés).

  Conséquence : tout génome d'aujourd'hui garde son identifiant. Le témoin c0025 reste **`19e3767cc346`**, c0101 **`f70ddcb5a565`** (notes/portage.md l.84-85,
  `graineReseaux` 161). `chancePalierMin` fait partie de `v4ANaissance` : un génome où Sacha aurait mis 8 change d'identifiant (c'est voulu : il conduit autrement).
- **Les têtes ne changent pas** : `TETES` (l.191) et `LONGUEUR` (l.192, `{WV:222,WS:90}`), les 36 entrées de la tête RAYON et les 12 de la tête SOL, `tirerReseaux`.
- **`bloc`** (l.444-463) : après `for(const k of ORDRE_PORTAGE)…` (l.454) et avant `r.push('volNitro:0');` (l.455), écrire les 8 clés :
  `for(const k of ORDRE_V4)r.push(k+':'+String(A[k]));`. `chancePalierMin` est donc lu `REGLAGES.chancePalierMin` par le pilote (§ 3.5).
- **`genomeTemoin`** (l.332-359). Les 7 gènes `ou:'R'` tombent sur la branche l.346 (`x=(b.cle in R)?R[b.cle]:b.naissance`) : aucun témoin écrit à la main
  n'a ces clés, ils naissent donc à leur naissance. `chancePalierMin` (`ou:'profil'`) : nouvelle branche, lire dans le **texte** du témoin la phrase
  `chance:{prend:1,palierMin:(\d+)}` (pilote-voltige.js l.28 et c0101-pilote.js l.30 la portent mot pour mot) ; absente → lever
  « <fichier> a change (chance:{prend:1,palierMin:N} introuvable) ». La valeur lue doit tomber dans ses bornes (le contrôle de l.354 le fait).
- **Exports** (l.474-481) : ajouter `GENES_V4`, `ORDRE_V4`, `CLES_V3`, `N_V3`, et `DECLICS` (la liste des noms de compteurs, § 4.2). `VERSION` vaut 4.
- **Le texte change pour tout génome**, c0025 compris : le bloc `REGLAGES` gagne 8 clés et modele.js gagne du code inerte. Le `shaPilote` de tous les pilotes
  change donc (le Ryzen compris). Ce n'est pas un défaut : l'époque change de toute façon (§ 7). Ce qui ne change pas : l'**identifiant** (`shaGenome`, ci-dessus),
  le **profil normalisé** (`profilSha` à 12, § 3.5) et les **décisions** (§ 8.1 v3).

### 2.4 `chancePalierMin` hors de l'urne : comment

Je suis d'accord avec Fable : **figé** tant que Sacha n'a pas décidé. Le palier noté est le sommet de la partie (`ml/bot/mesures.js` l.18) : une reprise ne peut
qu'ajouter. Une sélection qui pourrait le baisser le baisserait « par construction », sans mieux conduire (dossier, « La seconde chance prise plus tôt »).

Comment, sans toucher aux autres gènes :
- un champ **`fige:true`** dans sa `Borne` (nouveau, optionnel ; absent = faux). Seul `chancePalierMin` le porte ;
- **`muter`** (l.386-389, la boucle `for(const b of BORNES){if(b.type==='drapeau')…else if(b.type==='entier'){if(rng.suivant()<pF)…}}`) : `if(b.fige)continue;`
  **avant** tout tirage. Aucun `rng.suivant()` n'est consommé pour lui. C'est le dernier gène : la suite des tirages des autres gènes ne dépend pas de lui ;
- **`croiser`** (l.409, `for(const b of BORNES)A[b.cle]=rng.suivant()<.5?g1.A[b.cle]:g2.A[b.cle];`) : pour un gène figé, `A[b.cle]=g1.A[b.cle]` **sans tirage** ;
- `reparer`, `valider`, `distance` le traitent comme un entier ordinaire (bornes, arrondi). `reelsLus` ne le voit pas (ce n'est pas un réel) ;
- l'immigré et la génération 0 passent par `muter` : ils ne le changent pas non plus.

Pour le changer un jour (un outil à part, pas dans ce lot) : les textes changent, les courses sont rejouées, **mais pas l'époque** (`modele.js` ne change pas).
`chancePalierMin` est dans l'identifiant (`v4ANaissance`, § 2.3), et c'est voulu : sinon deux conduites se mêleraient sous le même id dans la même époque.
Donc **tous les identifiants changent, celui du témoin aussi**. `pop.temoin`, `pop.champion.id`, les parents et `dejaVus` ne désigneraient plus personne
(evoluer.js l.428 : le champion se rabat sur le témoin, introuvable ; l.527-531 : l'ATTENTION à chaque lancement ; l.579 : plus de mutés depuis le témoin).
L'outil futur doit donc **soit tout renommer** (pop.temoin, champion.id, parents, dejaVus, avec une ligne de journal), **soit repartir** par `--repartir-de`
avec une config qui fixe la valeur. Dans les deux cas, `genomeTemoin(cfg)` doit rendre la même valeur que les vivants (une clé de config lue par
`genomeTemoin`), sinon le contrôle d'identité et l'identifiant du témoin divergent. À savoir aussi : les tirages de `muter` et `croiser` changent de toute façon avec ce lot (4 drapeaux
et un choix de plus avant les têtes, l.391-399) : une reprise au milieu d'une génération, d'un code v:3 à ce code, ne refait pas les mêmes enfants. C'était déjà
le cas au portage. Ce n'est pas un défaut (nouvelle époque).

---

## § 3. Les règles, gène par gène

Règle commune (celle de notes/gestes.md « Les cinq gestes ») : **drapeau à 0, le code ne s'exécute pas, ses réglages ne sont pas lus, la mémoire ne reçoit
aucun champ, l'ordre ne reçoit aucun champ**. Chaque bloc commence par `R.<drapeau>>0&&…` (ou `R.loiFidele>0`). ⚠ Le pilote n'a pas toujours une clé
au nom du gène : `volRetourOn` s'écrit `volRetour:0` quand il est éteint (genome.js l.450), et sa garde est `R.volRetour>0` ; `retourOn` se lit
`R.retours.length>0`. La garde exacte de chaque gène est dans la colonne « garde » du § 4.2. Les champs de la vue cités ici ont été relus
dans `ml/bot/yeux.js` et `ml/bot/README.md` : `vue.carte` (README l.83), `vue.tenue` = `{tient:false, t, cote, s, mur, mortel, approx}` (yeux.js l.997,
README l.104), `vue.sorties.bord.rayons` = rayons `rien`, `versRoute`, `plane` dans cet ordre (yeux.js l.948 `LISTE_BORD`, l.1002 ; README l.190),
`vue.vol.radar.rayons` (README l.126-147), `vue.vol.retours[i]` = `{volant, manche, nitro}` (yeux.js l.785), `v.dessous`, `v.glisse`, `v.rebond`
(déjà lus l.240, l.254). Un rayon : `m`, `issue` ∈ `pose | levre | portail | choc | air | fond | libre | coupe`, `t`, `axe`, `propre`, `dessous` (README l.149-158).
« vide » (une cause de mort) n'est pas une issue de rayon : c'est `fond`.

### 3.1 `sortieOn` (+ `sortieT`, `sortieJauge`) : la sortie préparée sur les maps à décor — **remplacé** par le § 3.1 bis (amendement du 28/11 après la mesure des décollages)

> Ce § est gardé tel qu'il a été écrit et codé au commit `7f85efb38`. Il ne décrit plus le code : voir le § 3.1 bis.

**La règle.** Au sol, sur une map à décor (`DECOR[v.carte]`, l.141 : canyon, grotte, jade, ville), quand la route lâche dans moins de `sortieT` s, que la caisse
n'est ni dessous, ni en glisse, ni en rebond, que la jauge dépasse `sortieJauge`, et que le rayon `bord` dit : `rien` → choc, `versRoute` → choc, et `plane` →
une pose propre sur la dalle ou la lèvre : le pilote **garde la nitro** jusqu'au décollage et pose `m.planeBord = v.t`. Au décollage, si `m.planeBord` date
de moins de 0,35 s et qu'aucun raccourci n'est engagé, la façon du vol est **`plane`** au lieu de `versRoute`.

**Où.**
- Au sol, **juste après** l.254 (le bloc bordOn) :
  `if(R.bordOn>0&&!decor&&lache&&!v.dessous&&!v.glisse&&!v.rebond&&tn.t!=null&&tn.t<R.bordNitro&&jauge>R.bordJauge)m.nitro=true;`
  et **avant** l.255 `m.facon=null;m.nFigVol=0;`. Forme :
  `if(R.sortieOn>0){ let ok=false; if(decor&&!m.sortie&&lache&&!v.dessous&&!v.glisse&&!v.rebond&&tn.t!=null&&tn.t<R.sortieT&&jauge>R.sortieJauge){ const B=v.sorties&&v.sorties.bord, Y=B&&Array.isArray(B.rayons)?B.rayons:null; … ok = la condition ci-dessous } if(ok){…} else m.planeBord=null; }`
  avec `ri=Y.find(r=>r&&r.m==='rien')`, `vr=…'versRoute'`, `pl=…'plane'` ; condition : `Y&&ri&&ri.issue==='choc'&&vr&&vr.issue==='choc'&&pl&&(pl.issue==='levre'||(pl.issue==='pose'&&pl.propre!==false&&!pl.dessous))`.
  Alors : compteur `sortieOn` si `m.nitro` était faux ; `m.nitro=true;m.planeBord=v.t;`. **Sinon** (règle évaluée et fausse, à cette vue au sol) :
  `m.planeBord=null` : seule la dernière annonce compte. **`!m.sortie`** : pendant un raccourci engagé, l'ordre rendu à l.272 contient `||m.nitro` ; sans ce
  test, la règle allumerait la nitro au sol d'un raccourci sans réacteur (`versRoute`, `viser`, `rien`) et changerait le décollage d'un vol voulu.
  Le bloc est placé avant le raccourci (l.263) : quand `m.sortie` est engagé, il ne fait que remettre `m.planeBord` à `null`.
  `decor`, `lache`, `tn`, `jauge` existent déjà à cet endroit (l.186, l.203, l.184, l.207). `sauve` (l.355) n'est pas utilisé ici : la règle veut un choc net.
- En vol, dans le bloc du décollage, l.368 (`if(!m.facon){m.facon=m.sortie&&FACONS[m.sortie.facon]?m.sortie.facon:'versRoute';m.tFacon=v.t;m.voulu=!!m.sortie;…`),
  **après** `m.sortie=null;…m.choix=false;` et avant la remise à zéro des gestes (l.370) :
  `if(R.sortieOn>0){ if(!m.voulu&&m.planeBord!=null&&v.t-m.planeBord<.35){m.facon='plane';m.choix=true;<compteur sortieOn.vol ; m.cSortie=v.t (compteur)>} m.planeBord=null; }`.
  `< .35` : la même fenêtre que le relâché (l.373, et la remarque sur 12,4 − 12,1).
  **`m.choix=true`** : le choix du départ (l.379, `if(!m.choix&&R.retours.length&&estRetour(m.facon))`) est fait, c'est la sortie préparée. Sans cela, avec
  `retourOn` allumé, une bascule de `plane` vers `versRoute` ou `retour0` déclencherait le choix du départ en plein vol, sans attendre `tenirFacon`.

**Mémoire ajoutée** : `m.planeBord` (un temps ou `null`) ; pour le compteur seulement `m.cSortie` (§ 4.3).

**Ce qu'elle ne doit pas changer** (Relecture, relecteur code, n° 3) :
- **jamais `m.sortie`** : sinon `m.voulu` devient vrai (l.368), et les figures (l.445 `parentOk=!!m.voulu||…`, l.451 `figPlongeon`) et la bascule vers
  `viser` (l.414 `if(!m.voulu&&nom.indexOf('viser')===0)continue;`) changent aussi. `m.voulu` reste faux ;
- ni `m.vu`, ni `m.nRacc`, ni la ligne visée : seule `m.nitro` change au sol, et **jamais pendant un raccourci engagé** (`!m.sortie`) ;
- aucune map sans décor : `bordOn` (l.254, `!decor`) et `sortieOn` (`decor`) ne se recouvrent jamais.

**Avec les autres gènes** : voir le tableau du § 3.6. En bref : un raccourci engagé (`m.sortie`) passe avant (la façon du raccourci, pas `plane`) ;
la sortie du dessous (l.274-283) aussi (`!v.dessous`) ; le relâché (`relacheOn`) voit cette nitro comme demandée (`m.tNitroSol`, l.495) : sans effet, `plane`
tient déjà la nitro (l.434 exige `!o.nitro`) ; la bascule en vol (l.407-421) peut quitter `plane` si son rayon cesse de se poser.

**Cas limites.** `v.sorties` nul, `bord` nul ou sans `rayons` (sortie qui n'a pas lieu : `{issue}` seul, README l.203-204) → rien. `tn.t` nul → rien.
Pas de décollage (la route tient finalement) : la vue suivante où la règle est fausse remet `m.planeBord` à `null` ; s'il n'y en a pas, la fenêtre de 0,35 s
l'ignore. Une mort au sol : la mémoire est jetée à la course suivante.

### 3.1 bis Amendement du 28/11 après la mesure des décollages : `sortieOn` = la nitro au décollage sur les maps à décor (remplace le § 3.1)

**Pourquoi.** La règle du § 3.1 ne s'est déclenchée dans aucune vraie course (0 sur 13 au lot). L'étude `ml/ecurie/etude/sortie-preparee/LISEZ-MOI.md`
(40 courses à carte tenue, 180 décollages subis distincts, 24 morts ; relue par un second agent) dit pourquoi : la règle du contrat ne s'y déclenche
jamais (0 fois) ; les yeux ne voient **aucune** issue aux 24 décollages mortels ; le bord n'est annoncé que 0,28 s avant le décollage (médiane), quand
la main met 0,2 s ; « plane » au bord se serait crashé dans 57 vols qui se sont posés. Partir en « plane » est une impasse, voire nuisible. En revanche
**aucun décollage sur 253 ne part nitro allumée** sur ces maps, alors que le banc des gènes (`ml/ecurie/etude/banc-des-genes/`, branche `bots-ecurie`)
montre que la nitro au décollage est la seconde source d'écart aux joueurs (15 % des vols chez le pilote, 63 % chez les joueurs) et que `bordOn`, la
même chose sur les maps sans décor, rapproche sûrement des joueurs sans perdre de palier.

**La règle.** Au sol, à la même place (juste après `bordOn`, avant `m.facon=null;m.nFigVol=0;`) :
`if(R.sortieOn>0){ if(decor&&!m.sortie&&lache&&!v.dessous&&!v.glisse&&!v.rebond&&tn.t!=null&&tn.t<R.sortieT&&jauge>R.sortieJauge){ <compteur sortieOn si m.nitro était faux> m.nitro=true; m.planeBord=v.t; } else m.planeBord=null; }`.
**Aucune lecture des rayons du bord** (`v.sorties` n'est plus lu par cette règle). **Aucun changement de façon au décollage** : le bloc du décollage ne
garde que les compteurs et la remise à zéro, `if(R.sortieOn>0){ <compteur sortieOn.vol : !m.voulu&&m.planeBord!=null&&v.t-m.planeBord<.35, et m.cSortie=v.t> m.planeBord=null; }` ;
`m.facon='plane'` et `m.choix=true` sont retirés. `m.planeBord` n'est plus lu que par ce compteur (il garde son nom). Les gènes gardent leurs noms,
bornes et naissances (`sortieOn` 0, `sortieT` 0,7 [0,3 ; 1,2], `sortieJauge` 0,5 [0,2 ; 1]) : **aucun identifiant de génome ne change** (c0025
`19e3767cc346`, c0101 `f70ddcb5a565`) ; `genome.js` ne change que par un commentaire. Éteint, tout pilote décide exactement comme au commit
`7f85efb38` ; le texte du pilote change (`modele.js`), donc l'époque des courses aussi.

**Les compteurs** (les mêmes 25 noms de `DECLICS`, un sens ajusté) :
- `sortieOn` : la règle a allumé la nitro au sol (elle était éteinte). La route qui lâche recoupe `m.nitro` à chaque vue : comme `bordOn`, il compte
  **chaque vue** au sol où la règle agit, pas chaque décollage ;
- `sortieOn.vol` : un vol subi (`!m.voulu`) décollé moins de 0,35 s après une annonce (`m.planeBord`) : il part nitro allumée par la règle ;
- `sortieOn.pose` : la première vue au sol après un tel vol, sans trou (la forme du § 4.3, inchangée). `(vol − pose) / vol` reste la part de ces
  décollages qui finissent mal : mesure secondaire, jamais un critère ;
- `loiFidele.suit` (même mesure) : ne compte que si `|c.volant − o.volant| > 0,01` ou si le manche diffère. L'arrondi des yeux ne dépasse jamais 0,005 ;
  63 % des vues en « vers la route » deviennent 60 % ; l'écart des deux lois est réel (médiane 0,08). Code de compteur seulement.

**Ce qui ne change pas** : `rienOn` et `rienEcart` (« rien » est plus souvent plus tordu que plus droit ; la règle part 0,48 fois par course de 180 s :
c'est le banc qui dira).

**Avec les autres gènes** (remplace la colonne `sortieOn` du § 3.6) :
- `bordOn` : **exclusif** (`!decor` contre `decor`) ; `libreOn` : **exclusif** (`libre` exige `!decor`) ; `largeOn` : exclusif (maps sans décor) ;
- un **raccourci engagé** (`m.sortie`) passe avant : rien ne change, la règle ne fait que remettre `m.planeBord` à `null`. Un raccourci ne peut pas
  s'engager à la vue même où la règle agit (il exige `!lache`, la règle `lache`) ; la sortie du dessous non plus (`!lache`, et la règle exige `!v.dessous`) ;
- `dessousNitro` : **exclusif** (il n'agit que sous la dalle, par `tetu` ou `sortir`, donc avec `v.dessous` ; la règle exige `!v.dessous` et `!m.sortie`) ;
- `relacheOn` : la nitro gardée au bord compte comme demandée (`m.tNitroSol`, dans `decide`) : avec les deux, la nitro **reste tenue au début du vol**
  jusqu'à `relacheT` s (« vers la route » la coupe sinon dès la première vue). C'est l'effet voulu ; testé (`genes-v4.test`) ;
- `coupOn` : sans lien dans la décision (le vol est « vers la route » comme sans le gène ; `m.nitroAvant` n'est écrit qu'en vol ; sur décor, il faut
  `coupDecor` = 1). Dans le jeu, un décollage nitro allumée arme le coup, qui ne part qu'au ré-appui : un coup du pilote peut donc le trouver armé plus
  souvent. Non mesuré ;
- `retourOn` : le choix du départ n'est plus marqué fait : il se fait comme sans `sortieOn` (testé) ;
- `rienOn`, `secoursOn`, `loiFidele`, `fuirVite`, `volMieux`, `lacheOn`, `suitOn` : sans lien (la règle n'agit qu'au sol ; la façon du vol ne change pas).

**Tests** : `genes-v4.test` (v4 réécrits : la nitro gardée quels que soient les rayons du bord, et sans `v.sorties` ; aucune vue de vol des suites
« sortie » ne change ; dessous, glisse, rebond, carte sans décor, `t > sortieT`, jauge basse : rien ; avec `retourOn` : le choix du départ comme sans
le gène ; avec `relacheOn` : la nitro tenue au début du vol) ; `compteurs.test` (c7 : le sens des trois compteurs et le seuil de `loiFidele.suit`) ;
`genes-muets.test` (`sortieT` et `sortieJauge` lus gène allumé, muets éteint) ; `tests/vues-genes-v4.js` (six suites de plus). Le bras du banc
`sortie` dit « la nitro au décollage sur les maps à décor », `sortie-tot` « la même, gardée dès 1 s avant le bord » (mêmes gènes). Le § 8.1 (le test
`sortieOn` en « plane ») et le § 6.3 (les « dit ») décrivent l'ancienne règle : ils sont remplacés par ce paragraphe.

**Ce qu'on ne sait pas.** Aucun rayon ne joue la nitro tenue dès l'envol ; sur une map à décor, elle peut aussi **tuer plus vite** (la paroi est
proche). Seul le banc le dira.

**La piste notée pour plus tard** : le levier est au sol, avant le bord (la ligne, la marge, la vitesse sur les maps à décor) ; les raccourcis voulus
tuent en ville (5 morts sur 22).

### 3.2 `rienOn` (+ `rienEcart`) : la bascule peut aller vers « rien »

**La règle.** En vol, si la façon tenue est une loi de retour (`estRetour`, l.333), qu'elle est tenue depuis plus de `tenirFacon` s, que son rayon se pose
(`issue==='pose'`) et que le rayon `rien` se pose propre sur la dalle **plus droit d'au moins `rienEcart` rad**, le pilote prend la façon `rien` (volant lâché).

**Où.** Un bloc **à part**, après la fin de la bascule (l.421, `if(mieux&&sMieux>sMien+(fuit?4:R.bascule)){m.facon=mieux;…}}`) et avant l.424
(`if(R.lacheOn>0){const q=rayonDe(m.facon);…`) :
`if(R.rienOn>0&&m.facon!=='rien'&&estRetour(m.facon)&&v.t-m.tFacon>R.tenirFacon){const q=rayonDe(m.facon),r0=rayonDe('rien');
 const ok=!m.rienFait&&q&&q.issue==='pose'&&r0&&r0.issue==='pose'&&r0.propre!==false&&!r0.dessous&&Math.abs(+r0.axe||0)+R.rienEcart<=Math.abs(+q.axe||0);
 if(ok&&m.rienVu!=null&&v.t-m.rienVu<=.25){m.facon='rien';m.tFacon=v.t;m.cible=null;m.rienVu=null;m.rienFait=true;tenuPose=r0;if(R.coupOn>0)m.coupFin=null;<compteur rienOn>}
 else m.rienVu=ok?v.t:null;}}`.
`v.t-m.tFacon` est relu **après** la bascule (pas la constante `depuis` de l.385) : si la bascule vient de changer de façon, `rienOn` attend.
`q` est relu par `rayonDe(m.facon)` : la variable `mien` peut être périmée après une bascule.
- **Deux vues de suite** (`m.rienVu`, comme `m.vu` du raccourci l.288) : la promesse de « rien » ne tient que 4 % des vues (dossier l.59).
- **Une fois par vol** (`m.rienFait`) : après un retour de la bascule ordinaire vers une loi de retour, `rienOn` ne repart pas vers « rien ». Pas d'aller-retour,
  le zigzag que le commentaire de modele.js l.358-363 veut éviter.
- **`tenuPose=r0`** : les figures (l.452-454, seuil sur `tenuPose.t`), `largeOn` et `suitOn` (l.484) jugent sur la pose de « rien », la façon tenue.
  `tenuPose` est déjà un `let` de `enVol` (l.375, `let tenuPose=null;`). Ce code ne s'exécute que gène allumé : c0025 n'en voit rien.
- **`m.coupFin=null`** (si `coupOn`) : un coup de nitro lancé ne continue pas dans « rien ».

**Mémoire ajoutée** : `m.rienVu` (un temps ou `null`), `m.rienFait` (vrai ou absent), écrites seulement sous `R.rienOn>0`. `m.rienFait` et `m.rienVu` sont remis
à `null` au décollage, dans le bloc l.368, seulement si `R.rienOn>0`.

**Ce qu'elle ne doit pas changer** : `volMieux`, `pourMieux` (l.404) et la ligne l.418 (`if(pourMieux&&!estRetour(nom))continue;`) restent **tels quels** (le
dossier : « un test à part, pour ne pas toucher volMieux »).

**Cas limites.** Après le passage à `rien` : `rien` n'est pas `estRetour`, `pourMieux` ne peut plus revenir ; seule la bascule ordinaire (rayon `rien` qui ne
sauve plus, l.407) le fait repartir, et `rienOn` ne revient plus dans ce vol. `rien` sous la dalle : refusé (`!r0.dessous`). La façon tenue sous la dalle :
c'est `fuit` qui joue d'abord (l.402).

### 3.3 `loiFidele` (0, 1, 2) : la loi que les yeux jouent exactement

**Ce qui existe** : `LOI_PILOTE` (l.60, `const LOI_PILOTE={marge:28,cap:.6,porteeMin:40,gain:1.6,avance:.25,pique:10,rv:.2,rm:.2,rn:.2};`). Avec `marge` 28 et
une demi-largeur de 28 m, la ligne de la loi « retour » est l'axe (yeux.js l.623 : `bord=M.max(0,K.RH-P.marge)` = 0) : c'est la loi `versRoute` du pilote
(l.304-306), plus le retard de la main (0,2 s), sans zone morte et avec le demi-tour (yeux.js l.590-602). « Exactement » ne vaut qu'aux valeurs de naissance de
`volAvance` (0,25), `volRetourOn` (0) et `volDemiTour` (1) : un génome qui les a mutées a une loi `versRoute` qui s'écarte de `LOI_PILOTE` (§ 10).

**Le rayon fidèle.** `loiFidele>0` demande `LOI_PILOTE` aux yeux, **par `RETOURS_DEMANDES`** (pas par `REGLAGES.retours`), à l'indice
`I_FIDELE = REGLAGES.retours.length` (0 ou 1) :
- si `coupOn` est allumé, `COUP_LOIS[0]` (l.61) **est** déjà `LOI_PILOTE` à cet indice : on le partage, aucune place de plus ;
- sinon on ajoute une copie `Object.assign({},LOI_PILOTE)` à cet indice.
Son rayon est `'retour'+I_FIDELE` ; sa commande est `vue.vol.retours[I_FIDELE]`.

**1 = juger.** Partout où le pilote lit le rayon `versRoute` pour juger, il lit le rayon fidèle s'il existe (sinon le rayon `versRoute` du radar, comme avant) :
- en tête de `if(Y){` (l.376), calculer `rFid = R.loiFidele>0 ? Y.find(x=>x&&x.m==='retour'+I_FIDELE)||null : null` ;
- le choix du départ, l.383 (`const ry=Y.find(x=>x&&x.m===nom);if(!ry)continue;…`) : pour `nom==='versRoute'`, `ry = rFid || Y.find(…)` ;
- `rayonDe`, l.387 (`const rayonDe=nom=>Y.find(x=>x&&x.m===nom&&(…));`) devient `nom=>(rFid&&nom==='versRoute')?rFid:Y.find(…)`. Cela couvre `mien` (l.390,
  quand la façon tenue est `versRoute` : `loi` est vrai, donc `rayonDe(m.facon)`), le candidat `versRoute` de la bascule (l.416), `rienOn` (§ 3.2) et le contact
  de `lacheOn` (l.424).
Changent aussi, par `mien` et `tenuPose` (l.400, `if(mien&&mien.issue==='pose'&&mien.propre!==false)tenuPose=mien;`) : **les figures et leur moment**
(l.452-454, seuil sur `tenuPose.t`, y compris dans les vols subis hors décor par `parentOk`), `largeOn` (l.449) et `suitOn` ensuite (l.484). Le test v4
de `loiFidele` le prévoit.
Ne changent **pas** : la jumelle `versRoutePlane` de `largeOn` (l.448, `Y.find(x=>x&&x.m==='versRoutePlane')`), le coup (l.471, ses rayons `retour<b>` et
`retour<b+1>`), le raccourci au sol, `vaut`, `prime`, la tête RAYON (elle reçoit le rayon fidèle comme entrée, W2 = 0 à la naissance).

**2 = juger et suivre.** En plus de 1 : quand la façon tenue est `versRoute`, l'ordre de volant et de manche est celui de la loi fidèle. Juste après l.426
(`const o=FACONS[m.facon](v,m);`) : `if(R.loiFidele>1&&m.facon==='versRoute'){const c=Array.isArray(f.retours)?f.retours[I_FIDELE]:null;if(c){…o.volant=c.volant;o.manche=c.manche;}}`.
`FACONS.versRoute` est **appelé quand même** : il tient `m.pv`, l'état de `volAvance` (l.300-303) ; sans lui, un retour à `versRoute` sans rayon fidèle partirait
d'une mémoire périmée. La nitro reste celle de `versRoute` (faux). La façon garde son nom `versRoute` : `lacheOn`, `coupOn`, `largeOn`, `prime` la reconnaissent.

**Ce qu'elle ne doit pas changer** (Relecture, relecteur code, n° 4 et 5) : **jamais `REGLAGES.retours`**, ni `R.retours.length`. Sinon :
le test du réacteur des raccourcis (l.272 et l.290 : `R.retours.length?avecNitro(…):…==='plane'`), le choix du départ (l.379 `R.retours.length&&…`),
`prime` (l.336) et la ligne `retours:[…]` écrite par genome.js (l.456, seulement si `retourOn`) changeraient tous. Les rayons `retour<i>` avec
`i >= R.retours.length` restent sautés comme candidats (l.382, l.411) : le rayon fidèle n'est jamais une façon.

**Cas limites.** Première vue d'un vol : la demande part avec l'ordre d'avant (l.99-100) ; au sol l'ordre porte déjà `retours` (l.494), le rayon est donc là
dès la 1re vue en vol. S'il manque : repli sur le radar. `vue.vol.retours` absent ou plus court : repli. Les commandes de la loi sont arrondies à 0,01
(yeux.js l.785 `n2(PIL.cv)`) : en mode 2, le volant suivi est arrondi.

### 3.4 `secoursOn` : les secours en vol, avec les lois « retour » libres

**Les deux lois de secours** (constantes de modele.js, **pas** des gènes) :
- `S1` « plané bas puis vers la route » : `Object.assign({},LOI_PILOTE,{nitro:3,nitroHaut:5})` — nitro tenue tant que la caisse est à moins de 5 m au-dessus du
  plan de la route (yeux.js l.629, `P.nitro===3&&ht<P.nitroHaut`), la loi `versRoute` pour le cap ;
- `S2` « vers la route, cabré » : `Object.assign({},LOI_PILOTE,{cabre:0})` — cabrer quand la caisse est sous le plan de la route et à côté de la dalle
  (yeux.js l.628, `ht<P.cabre&&M.abs(lt)>K.RH`).
Le dossier les nomme (n° 5, « Plane puis versRoute (nitro 2 ou 3) et versRoute cabré ») sans nombres : **5 m et 0 m sont mes choix** (§ 10).

**Les places** (yeux : 4 lois au plus, `lireRetours` yeux.js l.610 `RET.length<4` ; piloter.js l.272 `ordre.retours.slice(0,4)`) :

| `retourOn` | `coupOn` | `loiFidele` | places prises avant les secours | lois de secours demandées |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | S1, S2 |
| 1 | 0 | 0 | 1 | S1, S2 |
| 0 | 0 | 1 ou 2 | 1 (fidèle) | S1, S2 |
| 1 | 0 | 1 ou 2 | 2 | S1, S2 |
| 0 | 1 | 0, 1 ou 2 | 2 (coup ; fidèle partagé) | S1, S2 |
| 1 | 1 | 0, 1 ou 2 | 3 | **S1 seule** |

Règle : `I_SECOURS` = longueur de la liste avant les secours ; `N_SECOURS = Math.min(2, 4 - I_SECOURS)` ; les secours sont pris **dans l'ordre (S1, puis S2)**.
Aujourd'hui il reste toujours au moins une place. **Quand il n'y en a plus** (un gène futur) : `N_SECOURS = 0`, `secoursOn` ne demande rien et ne fait rien ;
le code doit le permettre sans erreur (une boucle vide). Un gène futur qui demande une loi passe **avant** les secours et doit refaire ce tableau.

**`RETOURS_DEMANDES`** (l.62, aujourd'hui `const RETOURS_DEMANDES=REGLAGES.coupOn>0?REGLAGES.retours.concat(COUP_LOIS):REGLAGES.retours;`) devient :
`REGLAGES.retours`, puis `COUP_LOIS` si `coupOn`, sinon `[copie de LOI_PILOTE]` si `loiFidele>0`, puis `[S1,S2].slice(0,N_SECOURS)` si `secoursOn`.
**Quand rien n'est ajouté, c'est `REGLAGES.retours` lui-même** (le même tableau : commentaire l.59). Avec `coupOn` seul, c'est exactement
`REGLAGES.retours.concat(COUP_LOIS)` comme aujourd'hui. La liste est faite **une fois** au chargement : `controleRayons` (l.109,
`n>RETOURS_DEMANDES.length`) reste juste sans retouche.

**La règle.** En vol, après la bascule et après `rienOn` (donc après l.421), avant l.424 : si `R.secoursOn>0`, `N_SECOURS>0`, qu'on n'est pas en patience de
plongeon (`!(m.facon.indexOf('viser')===0&&m.mal<3)`), que le rayon de la façon tenue (`rayonDe(m.facon)`) n'est pas `sauve`, et que **les façons longues
annoncent toutes une mort** : on prend les noms de `LONGS` (l.330 : `rien, plane, versRoute, versRoutePlane, viser, viserPlane, retour0..3`), avec les mêmes
sauts que l.411 et l.414 (`retour<i>` pour `i >= R.retours.length` ; `viser*` si `!m.voulu`) ; pour chacun, `rayonDe(nom)` ; **un rayon absent est sauté**
(viser sans cible, loi pas encore jouée) ; il faut au moins un rayon long présent, et chaque rayon long présent a une issue `choc`, `air` ou `fond`
(ni `sauve`, ni `libre`, ni `coupe` : un rayon long `libre` finit jauge vide, mais on ne sait pas où ; prudent, il bloque). **Les façons courtes**
(`gauche`, `droite`, `cabre`, `pique`, `planeCabre` : horizon `min(2 s, air restant)`, yeux.js l.765-767) **sont ignorées** : un rayon court qui ne meurt pas
dans ses 2 s finit `libre`, sans rien dire de la suite. C'est justement l'instant de la toupie (dossier l.93) : les rayons longs meurent tous et la bascule
prend un rayon court `libre`, parce que `vaut(libre, court)` (jusqu'à `vCourt` = 34) dépasse le plafond 30 d'un rayon qui meurt (l.350-353).
La règle se lit **après** la bascule : si la bascule vient de prendre `droite`, `rayonDe('droite')` est `libre`, donc pas `sauve`, et le secours peut la remplacer.
Alors : parmi les rayons `'retour'+k`, `k` de `I_SECOURS` à `I_SECOURS+N_SECOURS-1`, différents de la façon tenue, qui se posent propres sur la dalle
(`issue==='pose'&&propre!==false&&!dessous`), prendre celui de plus grand `vaut(ry,true,v)` : `m.facon='retour'+k;m.tFacon=v.t;m.cible=null;m.secoursVol=true;`,
`tenuPose=ry` (même raison qu'au § 3.2), et `if(R.coupOn>0)m.coupFin=null;`. Compteur `secoursOn`.
La façon `retour<k>` se pilote déjà : `FACONS.retour0..3` (l.327, `retourDe(v,m,i)`) lit `vue.vol.retours[k]`. La bascule ordinaire peut ensuite la quitter.

**Les figures pendant un secours** : interdites. Dans la condition des figures (l.452-454), ajouter `&&!(R.secoursOn>0&&m.secoursVol)` ; `m.secoursVol` est remis à
`false` au décollage, dans le bloc l.368, seulement si `R.secoursOn>0`. Choix prudent (§ 10).

**Ce qu'elle ne doit pas changer** : pas `REGLAGES.retours` (mêmes raisons qu'au § 3.3) ; **pas `prime()`** pour une façon `retour<k>` avec `k >= R.retours.length` :
`prime` lit `REGLAGES.retourPrime` (l.336), réglage gardé par `retourOn` (`GARDES`, l.160) ; le lire avec `retourOn` = 0 casserait la table et
`tests/genes-muets.test.js`. Le choix se fait sur `vaut` seul. Pas `teteRayon` non plus dans ce choix (simplicité ; la tête reste muette à la naissance).

**Cas limites.** Aucun rayon de secours (première vue, radar nul) : rien. Les deux secours ne se posent pas : rien (la bascule ordinaire a déjà pris « ce qui
meurt le plus tard », l.353). La façon tenue est déjà un secours qui ne se pose plus : l'autre secours peut être pris.

### 3.5 `chancePalierMin` : le palier de la seconde chance

**Où.** `PROFIL` est aujourd'hui **avant** la balise (l.48-51, `const PROFIL={ modele:'clavier',graine:1, chance:{prend:1,palierMin:12} };`, balise l.52) :
`REGLAGES` n'y existe pas encore (`const` : une erreur au chargement). Le déplacer **juste sous la balise** (le commentaire de l.47 reste au-dessus de lui) et
écrire `chance:{prend:1,palierMin:REGLAGES.chancePalierMin}`. Les clés gardent leur ordre (`modele`, `graine`, `chance{prend, palierMin}`) : à 12, le profil
normalisé et son empreinte (`profilSha`, piloter.js l.141) sont ceux d'aujourd'hui, donc la même main.

**Ce que le gène ne fait pas** : il ne change rien au pilote (la décision de reprendre est celle de la main, `ml/bot/doigts.js` l.500,
`((vue&&vue.moteur)|0)+1>=P.chance.palierMin`). Changer sa valeur change le texte du pilote, pas `modele.js` : courses rejouées, **époque inchangée**.
Il n'a pas de compteur dans le pilote ; la ligne de course dit si la chance a été prise (`chancePrise`, § 4.4).

### 3.6 Qui passe avant qui (quand deux gènes sont allumés)

« Exclusif » = les deux conditions ne peuvent pas être vraies à la même décision. Ordre d'exécution dans `enVol` : choix du départ (l.379) → `mien`/bascule
(l.390-421) → `rienOn` → `secoursOn` → `lacheOn` contact (l.424) → ordre (l.426) → `loiFidele` 2 → `lacheOn` (l.430) → `relacheOn` (l.434) → figures (l.452)
→ `coupOn` (l.468) → `suitOn` ensuite (l.484). Au sol : … `libreOn` (l.246-250) → `bordOn` (l.254) → `sortieOn` → raccourci (l.263-290).

| | sortieOn (colonne **remplacée** : § 3.1 bis) | rienOn | loiFidele | secoursOn |
|---|---|---|---|---|
| **lacheOn** | sans lien (`plane` n'est pas `versRoute`, l.430) | rien passe avant ; ensuite la façon `rien` a déjà volant 0 | le contact (l.424) lit le rayon fidèle ; `lacheOn` met 0 par-dessus la loi suivie | sans lien (façon `retour<k>`) |
| **slalomOn** | sans lien (au sol, `lache` coupe le slalom l.229) | sans lien | sans lien | sans lien |
| **coupOn** | exclusif si `coupDecor` = 0 (`!DECOR` et `versRoute` exigés, l.470) ; `coupDecor` = 1 : un coup ne part qu'en `versRoute`, jamais en `plane` | après `rien`, plus de nouveau coup ; un coup lancé est arrêté (`m.coupFin=null`, § 3.2) | partagent `retour<b>` (même loi) ; le coup ajoute la nitro à la loi suivie | plus de nouveau coup (façon `retour<k>`) ; un coup lancé est arrêté (§ 3.4) |
| **relacheOn** | sans effet (`plane` tient la nitro) | peut tenir la nitro au début d'un vol `rien` si `relacheT > tenirFacon` (bornes 0,45 et 0,1) : non mesuré | sans lien | sans lien (S1 a sa nitro) |
| **suitOn** | `ensuite` suit la pose de `plane` | `ensuite` lit `tenuPose` = le rayon `rien` (§ 3.2) | `tenuPose` vient du rayon fidèle | `ensuite` suit la pose du secours |
| **fuirVite** | la bascule peut quitter `plane` | la bascule d'abord (fuit), rien attend | `mien` = rayon fidèle | la bascule d'abord |
| **bordOn** | exclusif (`decor` contre `!decor`) | sans lien | sans lien | sans lien |
| **largeOn** | exclusif (`!DECOR`, l.447) | exclusif (`versRoute` exigé) | `tenuPose` fidèle ; jumelle du radar | exclusif (`versRoute` exigé) |
| **libreOn** | exclusif (`!decor`, l.246) | sans lien | sans lien | sans lien |
| **retourOn** | le choix du départ est marqué fait (`m.choix=true`, § 3.1) : il ne part pas en plein vol après `plane` | la bascule `pourMieux` d'abord (si `volMieux`) | décale `I_FIDELE` à 1 ; le choix du départ lit le rayon fidèle pour `versRoute` | décale `I_SECOURS` (tableau § 3.4) |
| **volMieux** | `pourMieux` exige `estRetour` : pas pour `plane` | `pourMieux` d'abord (même bloc, avant) | `mien` fidèle | exclusif (`pourMieux` exige `sauve(mien)`) |
| **rienOn** | exclusif (`plane` n'est pas `estRetour`) | — | rien compare au rayon fidèle | exclusif (rien exige une pose, secours aucune) |
| **secoursOn** | peut quitter `plane` si tout meurt | exclusif | les secours suivent le fidèle dans la liste | — |
| **raccourci (m.sortie)** | le raccourci passe avant : au sol `!m.sortie`, au décollage `!m.voulu` | sans lien | sans lien | candidat `viser` seulement si voulu |

---

## § 4. Les compteurs de déclenchements

### 4.1 Comment ils sortent du pilote

Le contrat du pilote est `decide(vue, memoire)` (piloter.js l.9). La mémoire vit **dans le bac** (piloter.js l.84-90 : `let c=null,m={}`) : l'hôte ne la lit
jamais. Rien de ce que l'enfant rend aujourd'hui ne vient du pilote : `pannes`, `erreurs`, `yeuxTirages`, `cerveau_ms_moy` sont comptés par piloter.js
(l.222, l.242, l.301-303, sur l'objet cerveau et le jeu), `mesures` est calculé par l'hôte sur la partie enregistrée (enfant.js l.25,
`ressemblance.mesuresPartie(r.partie)`). Il faut donc un canal. Le seul qui ne touche ni piloter.js ni doigts.js : **l'ordre**.

- Le pilote ajoute à son ordre un champ **`declic`** : un tableau de noms (§ 4.2), chaque nom au plus une fois, **seulement à une décision où une règle a agi**.
  Rien n'a agi : pas de champ du tout (l'ordre est l'objet d'aujourd'hui, octet pour octet).
- Dans modele.js : une variable de module `let DECL=null;` et une fonction `tic(nom)` qui l'ajoute (sans doublon). `decide` (l.493) fait `DECL=null;` en
  premier, puis, juste avant `return o;` (l.496) : `if(DECL)o.declic=DECL;`.
- Une constante d'une ligne **`const COMPTE=true;`**, sous la balise. C'est ce qui permet la preuve du § 4.5.
- **Règle d'écriture, sans exception** : tout le code des compteurs (les `tic`, les calculs « et sans la règle ? », `m.cSortie`) est dans
  **`if(COMPTE){try{…}catch(e){}}`**. Il n'écrit **que** `DECL` et `m.cSortie`, même s'il lève au milieu. Pourquoi le `try` : si un calcul de compteur levait
  (un champ nul, un rayon absent), le bac attraperait l'erreur, `decide` rendrait une erreur, piloter.js compterait `erreurs++` et l'ordre deviendrait **vide**
  (piloter.js l.90, l.174, l.265) : la course changerait. Cela ne toucherait pas c0025 éteint, mais toucherait c0101 et les vivants du Ryzen qui ont des
  gènes v:2 allumés : leurs compteurs tournent à chaque décision.
- **Ce qu'un compteur n'appelle jamais** : ni `teteSol` (elle écrit le tampon partagé `OS`, que `auSol` relit juste après, l.208-210), ni `versRoute` (écrit
  `m.pv`, l.300-303), ni les `FACONS.*` (elles passent par `versRoute`), ni `controleRayons`, ni `teteRayon`, ni `raccourci`. Il ne lit que des valeurs
  déjà calculées et des fonctions pures : `vaut`, `sauve`, `avecNitro`, `poseNette`, `estRetour`, `cl`, `rayonDe`.
- L'enfant (lot b) **enveloppe** `C.decide` après `charger` et avant `course` (enfant.js l.40-42) : l'enveloppe appelle l'original (`d0.call(C,vue)`, pour
  `this.texte`, `this.pannes`…), lit `r.declic` s'il existe, ajoute 1 à chaque nom, puis **supprime** `r.declic` avant de rendre `r`. piloter.js ne voit donc
  jamais le champ. (S'il le voyait : `traduire`, doigts.js l.28, et `ordreV2`, l.351-374, ne copient que ce qu'ils lisent ; un champ inconnu ne change rien.
  Un pilote joué par `noter.js` ou `gestes.test.js --enfant`, sans l'enveloppe, reste donc juste.) piloter.js appelle `cerveau.decide(vue)` à l'instant
  (l.259) : l'enveloppe posée avant `course` est bien celle qui sert.
- Le coût : rien quand aucun gène n'est allumé (pas de champ, une comparaison par décision dans l'enveloppe). Gènes allumés : un petit tableau aux seules
  décisions où la règle agit, et les calculs « sans la règle » (de l'arithmétique). Le pilote ne peut pas savoir si quelqu'un lit : il ne paie qu'au déclenchement.
- ⚠ **Le prix futur** : les compteurs vivent dans `modele.js`, qui est dans l'époque (commun.js l.251-252). **Toute retouche future d'un compteur (un nom de
  plus, une règle corrigée) fait une nouvelle époque** et fait rejouer toutes les courses du Ryzen, sans qu'aucune décision change. La liste doit donc être
  **complète dès ce lot**. `DECLICS` vit dans genome.js (hors de l'époque) : le test v1 vérifie dans les deux sens qu'il colle au texte de modele.js.

### 4.2 Les noms (la liste `DECLICS`, exportée par genome.js)

« A vraiment agi » = la règle a changé une valeur de l'ordre (ou la façon) **à cette décision**, par rapport à ce qu'elle aurait été sans la règle. Une seule
exception, dite dans son nom : `loiFidele.desaccord` (ci-dessous).

**Qui a un compteur — tranché ici** : **tout drapeau (ou valeur) né à 0 qui agit quand il passe à 1**, sans exception. Cela comprend `coupDecor` et les sept
drapeaux de raccourcis nés à 0 : `raccCartes_jade`, `_grotte`, `_canyon` et `raccJumeau_nuages`, `_espace`, `_grotte`, `_canyon` (vérifié par `node -e` sur
`BORNES`). Ils ont un nom par **famille** (`raccCartes`, `raccJumeau`) : la carte est dans la ligne (`cartes`). **Pas de compteur** pour ceux nés à 1
(`dessousAveugle`, `dessousFuir`, `portailVol`, `volDemiTour`, `raccCartes_nuages/ville/espace`, `raccJumeau_ville/jade`) ni pour le choix `dessousDecor` (né
à 1) : ils agiraient dans chaque course de c0025. Un bras qui les éteint se mesure par sa part de courses changées (`f`, § 6.5). Les ajouter plus tard = une époque.

| nom | gène | garde exacte dans le pilote | où (aujourd'hui) | compte quand |
|---|---|---|---|---|
| `volRetourOn` | volRetourOn | `R.volRetour>0` (pas de clé `volRetourOn`) | `versRoute`, l.305 `const portee=R.volRetour>0?…:40;` | le volant calculé diffère de celui de la même expression (l.306) avec une portée de 40 m, en variables locales |
| `retourOn` | retourOn | `R.retours.length>0` | choix du départ, l.384 `if(b9&&b9!==m.facon)` | la façon change |
| `retourOn.reacteur` | retourOn | `R.retours.length>0` | l.272 et l.290, `R.retours.length?avecNitro(…):…==='plane'` | la nitro de l'ordre rendu diffère de celle avec `f==='plane'` (donc `m.nitro` et le terme `tetu` faux) |
| `volMieux` | volMieux | `R.volMieux>0` | l.421, bascule avec `pourMieux` vrai | la façon change et la condition sans `pourMieux` est fausse |
| `dessousNitro` | dessousNitro | `R.dessousNitro>0` | l.272 `(tetu&&R.dessousNitro>0)` et l.283 `m.nitro\|\|R.dessousNitro>0` | il rend la nitro vraie alors qu'elle était fausse |
| `lacheOn` | lacheOn | `R.lacheOn>0` | l.430 `…o.volant=0;` | `o.volant` n'était pas 0 |
| `slalomOn` | slalomOn | `R.slalomOn>0` | l.229 `const zActif=R.slalomOn>0&&…` | `zActif` est vrai (la loi de ligne change à cette vue) |
| `coupOn` | coupOn | `R.coupOn>0` | l.469 et l.478 | `o.nitro` passe de faux à vrai par le coup |
| `coupDecor` | coupDecor | `R.coupOn>0&&R.coupDecor>0` | l.470 `(R.coupDecor>0\|\|!DECOR[v.carte])` | un coup part (l.478) sur une map à décor |
| `relacheOn` | relacheOn | `R.relacheOn>0` | l.434 | le bloc s'exécute (il exige `!o.nitro`) |
| `suitOn` | suitOn | `R.suitOn>0` | l.218-219, au sol | la nouvelle `m.ligne` diffère de l'ancienne |
| `suitOn.ensuite` | suitOn | `R.suitOn>0` | l.484-485, en vol | `ensuite.ligne` n'est pas 0 |
| `fuirVite` | fuirVite | `R.fuirVite>0` | l.407 | la façon change et la condition sans `(R.fuirVite>0&&fuit)` était fausse |
| `bordOn` | bordOn | `R.bordOn>0` | l.254 | `m.nitro` était faux |
| `largeOn` | largeOn | `R.largeOn>0` | l.461 | une figure part avec `parentOk` faux |
| `libreOn` | libreOn | `R.libreOn>0` | l.246-250 | `m.nitro` diffère de celle calculée avec `libre` faux (`k`, `mTenir`, `sur` refaits en locales, avec l'ancienne `m.nitro` gardée avant l.250) |
| `raccCartes` | raccCartes_jade, _grotte, _canyon | `R.raccCartes[v.carte]!==0` (l.260) | l.289, l'engagement `m.sortie={…}` (pas la sortie du dessous, l.282) | un raccourci s'engage sur une carte dont le gène naît à 0. Les cartes : une constante `RACC_CARTES_0={jade:1,grotte:1,canyon:1}` de modele.js ; le test v1 la recalcule depuis `BORNES` |
| `raccJumeau` | raccJumeau_nuages, _espace, _grotte, _canyon | `R.raccJumeau[v.carte]` vrai (l.165) | dans `raccourci()`, l.165-167 | à cet appel, sur une carte où le gène naît à 0 (`RACC_JUMEAU_0={nuages:1,espace:1,grotte:1,canyon:1}`), la jumelle a écarté un rayon dont le score (l.168, en locales) dépasse celui du rayon retenu, ou rien n'est retenu. Le `tic` est dans `raccourci`, qui ne l'appelle pas lui-même |
| `sortieOn` | sortieOn | `R.sortieOn>0` | § 3.1, au sol | `m.nitro` était faux |
| `sortieOn.vol` | sortieOn | `R.sortieOn>0` | § 3.1, au décollage | le vol part en `plane` à cause de `m.planeBord` (**remplacé**, § 3.1 bis : un vol subi décollé moins de 0,35 s après l'annonce) |
| `sortieOn.pose` | sortieOn | `R.sortieOn>0` | § 4.3 | la première vue au sol après un tel vol, sans trou (pas de mort) |
| `rienOn` | rienOn | `R.rienOn>0` | § 3.2 | la façon passe à `rien` |
| `loiFidele.desaccord` | loiFidele | `R.loiFidele>0` | § 3.3, après l.390 | façon tenue `versRoute`, les deux rayons présents, `sauve(fidèle)` ≠ `sauve(radar)`. **Un désaccord, pas un ordre changé** : il borne par le haut. Refaire toute la décision « sans la loi fidèle » demanderait de rejouer la bascule, le départ et les figures : trop de code neuf dans une règle qui doit rester inerte. Le vrai effet se lit par `f` (§ 6.5) |
| `loiFidele.suit` | loiFidele | `R.loiFidele>1` | § 3.3, après l.426 | le volant ou le manche suivi diffère de celui de `versRoute` (**remplacé**, § 3.1 bis : le volant de plus de 0,01, ou le manche) |
| `secoursOn` | secoursOn | `R.secoursOn>0` | § 3.4 | la façon passe à un secours |

**25 noms.** `DECLICS` est la liste exacte, dans cet ordre. Le banc (lot c) refuse un critère sur un nom hors de `DECLICS`.

### 4.3 La mémoire des compteurs

Seul `sortieOn.pose` en a besoin : `m.cSortie` = le `v.t` de la dernière vue en vol d'un vol parti en `plane` par `m.planeBord` (depuis le § 3.1 bis : d'un vol subi décollé moins de 0,35 s après l'annonce). Écrit au décollage (§ 3.1) et à
chaque vue de vol tant qu'il n'est pas nul. En tête de `auSol`, avant le bloc du départ (modele.js l.181), **la forme exacte** :
`if(COMPTE&&R.sortieOn>0&&m.cSortie!=null){try{if(v.t-m.cSortie<=.25)tic('sortieOn.pose');}catch(e){}m.cSortie=null;}`.
Pour c0025 (`R.sortieOn` = 0), rien n'est lu. Une mort en vol, puis la reprise : le trou de 7 à 12 s (piloter.js l.196-199) fait que la pose n'est pas comptée.
**`sortieOn.vol − sortieOn.pose`** = les sorties préparées qui finissent mal : une **mesure secondaire** du banc (§ 6.4), jamais un critère.

### 4.4 Les champs de la ligne de course

Lot (b). `resultatCompact` (enfant.js l.22-32) et `CHAMPS` (courses.js l.102-103) gagnent :
- **`declenchements`** : `{nom: nombre}` des noms vus au moins une fois, **clés triées** ; `{}` si rien ; `null` sur les lignes écrites avant ce lot ;
- **`cartes`** : `r.bilan.cartes` (les maps traversées, dans l'ordre : `ml/bot/mesures.js` l.119). La dernière est celle de la fin de course : les lignes
  disent enfin la map de la mort (un trou du dossier) ;
- **`causesMorts`** : la cause de **chaque** mort de la partie, dans l'ordre, tirée des événements `'mort'` de `r.partie` (le champ que `mesures.js` l.94 lit
  déjà comme `mort:e[2]`) ; `[]` sans mort. Pourquoi : `cause` n'est que la dernière mort, et c0025 prend la seconde chance dès le palier 12 : la première
  mort disparaît de la ligne (mesures.js l.36, l.119) ;
- **`chancePrise`** : `!!r.bilan.chance.prise` si `r.bilan.chance` existe (main à profil, doigts.js l.534), sinon `null` ;
- **`carte`** : la carte imposée de la tâche (§ 5), écrite par `faireLigne` depuis la **tâche** (courses.js l.168, comme `graine` et `tmax`), `null` sinon.
Aucun de ces champs n'entre dans une empreinte ni dans la note.

Le poids : une ligne fait environ 970 octets (`tests/etat-e93ff5cb5/courses-2026-48.jsonl` : 38 lignes, 969,8 en moyenne). Pour c0025, `declenchements:{}`,
`cartes` (3 à 6 noms), `causesMorts`, `chancePrise`, `carte:null` ajoutent environ 120 octets (+12 %). Un génome qui allume beaucoup de gènes : jusqu'à
environ +50 %. La mesure de τ des pages s'arrête au-delà de 100 Mo de journaux (`etat.js`, `TAU_MAX_OCTETS`) : sur le Ryzen elle passera un peu plus tôt à
« pas mesuré ici ». C'est accepté (la mesure de τ par `mesure-tau.js` en ligne de commande n'a pas cette limite).

### 4.5 La preuve qu'ils ne changent aucune décision

1. Éteints : aucun `tic` ne s'exécute (tous sous une garde à 0), `DECL` reste nul, l'ordre est celui d'aujourd'hui (§ 8.1, v3).
2. Allumés : le texte du pilote où `const COMPTE=true;` est remplacé par `const COMPTE=false;` (une substitution dans le test) doit rendre **les mêmes ordres,
   champ `declic` retiré**, sur toutes les suites de vues, pour chaque gène allumé seul et tous ensemble, **et sur 3 000 suites de vues tirées au hasard**
   (graine fixe, tous les anciens et les nouveaux drapeaux allumés, comme le relecteur du portage) : ordres identiques, et **zéro erreur de plus** avec
   `COMPTE=true` qu'avec `COMPTE=false` (§ 8.1, v5).
3. En course : c0101 fabriqué (bordOn et fuirVite allumés, donc des `declic`) doit rester IDENTIQUE à `c0101-pilote.js` (identite.test.js, § 8.5) : mêmes
   empreintes de course, de vues et de touches. L'enveloppe ne change donc rien de ce que piloter.js voit.
4. La règle d'écriture du § 4.1 (`if(COMPTE){try{…}catch(e){}}`, rien d'appelé qui écrive la mémoire ou un tampon) rend 2 et 3 vrais par construction ;
   les tests le vérifient.

---

## § 5. Les courses à map imposée

Comment noter.js le fait : `--carte` (l.41) part dans le message de l'enfant (l.70), qui appelle `course(J,C,m.graine,{carte:m.carte,meteo:m.meteo,tmax:m.tmax})`
(l.33). piloter.js passe `o.carte` au jeu seulement s'il est vrai (l.214 : `J.lancer(graine,Object.assign(o.carte?{carte:o.carte,meteo:o.meteo}:{},…))`) ;
jeu-reel.js pose `SF.force={carte,meteo,teinte}` (l.201).

⚠ **Seule la première map est imposée.** Le jeu efface `SF.force` dès qu'il s'en sert (`code/maps/continuite.js` l.201, `const f=SF.force;SF.force=null;`) :
les maps suivantes sont tirées comme d'habitude. Une course « à la grotte » commence à la grotte, puis continue ailleurs. La météo est tirée dans la map
imposée (l.205). Une graine imposée et la même graine libre sont **deux courses différentes**, pas seulement par la première map : `sfImpose` tire moins de
nombres que `sfTire` (pas de tirage de map : `sfTire(null,c)`), et la map imposée entre dans `SF_HIST`. Toute la suite du hasard est donc décalée (objets,
modules de grotte, météo, maps suivantes). Pas de comparaison appariée entre une course imposée et une course libre.

⚠ **Le jeu remplace en silence une carte qu'il ne connaît pas** par une carte tirée (`continuite.js`, `sfImpose` :
`const c=f.carte&&SF_CARTES[f.carte]?f.carte:sfTire(prev).carte`). Le canyon n'est dans `SF_CARTES` que si `CANYON_OK` (WebGL2 du simulateur,
`code/maps/canyon-route.js` l.33). D'où la règle du point 5 ci-dessous : une course dont la première map n'est pas la carte demandée n'est **pas mesurée**.

Le chemin complet (lot b) :
1. **La tâche** gagne un champ optionnel `carte` (une chaîne). `ord.demander([{source, shaPilote, id, graine, tmax, usage, generation, carte}])`.
   `une(t)` (courses.js l.252-253) refuse une carte qui n'est pas dans `cfg.cartesTirage` (`nuages, ville, jade, espace, grotte, canyon`) :
   `'courses : carte inconnue « x » (cartesTirage : …)'`. Absente, `null` ou `''` = pas de carte. **Une seule mise en forme**, en tête de `une(t)` :
   `const carte=typeof t.carte==='string'&&t.carte!==''?t.carte:null;` ; cette valeur sert à la clé, à l'envoi et à `faireLigne`, nulle part ailleurs.
   `une(t)` refuse aussi **une tâche à carte quand le dossier d'état est celui de la sélection** (`C.chemin(cfg, cfg.dossierEtat)`) :
   `'courses : une course a carte imposee ne va pas dans l etat de la selection'`. Pourquoi : `mesure-tau.js` (l.117, `epoque|id|graine`) et `note.comparer`
   (une ligne par graine, la dernière gagne, note.js l.135) rangent les lignes par graine sans la carte ; une course à carte écrite dans `etat/` écraserait
   la course libre de la même graine. Le banc a son propre dossier (`banc/etat`).
2. **La clé** (courses.js l.51-54) : sans carte, **exactement** la chaîne d'aujourd'hui ; avec carte, `+'|carte:'+t.carte` à la fin. Aucun code ne découpe la
   clé (vérifié : aucun `cle.split`), le suffixe ne casse rien. Une course imposée et une course libre n'ont jamais la même clé.
3. **L'envoi** à l'enfant (courses.js l.229) : `c.send({…, carte})` (la valeur mise en forme au point 1).
4. **L'enfant** (enfant.js l.42 `course(J,C,m.graine,{tmax:m.tmax})`) : `course(J,C,m.graine,optionsCourse(m))`, avec `optionsCourse(m)` exportée :
   `{tmax:m.tmax}` plus `carte:m.carte` **seulement** si c'est une chaîne non vide (pas de `meteo` : la map tire la sienne). L'essai à la main :
   `node ml/evolution/enfant.js --essai <pilote.js> <graine> [tmax] [--carte grotte]`. Aujourd'hui `tmax=+(A[3]||45)` : demain `--carte` se lit **par son
   nom** (la valeur qui suit, refusée si vide ou si elle commence par `--`), et `tmax` vient de `A[3]` seulement si `A[3]` ne commence pas par `--`.
5. **La ligne** porte `carte` (depuis la tâche) et `cartes` (§ 4.4). **Une ligne à carte dont `cartes[0]` diffère de `carte` est non mesurée**
   (`mesuree:false`), raison `'carte imposee non appliquee (jouee sur x)'` ; elle reste en cache (rejouer ne changerait rien). Le banc s'arrête si une
   seule ligne de ce genre apparaît (code 2, § 6.8).

Les lignes d'avant : ce lot change l'époque (§ 7), le cache ne les sert plus de toute façon (courses.js l.123 ne garde que `l.epoque===ep.courses`). Relues
par les pages et les journaux, elles n'ont ni `carte` ni `declenchements` : un lecteur dit « absent », jamais une erreur. Vérifié : note.js, etat.js,
tableau.js, mesure-tau.js et histoire.js ignorent un champ inconnu ; le filtre de tableau.js cherche le texte `"pannes":`, qu'aucun champ neuf ne contient.
La sélection (`evoluer.js` l.312-315, `tache()`) ne met jamais de carte : ses clés gardent leur forme, et le refus du point 1 la protège d'un outil futur.

`commun.js` : **aucun changement**. `FICHIERS_EPOQUE` (l.251-252) contient déjà `enfant.js` et `modele.js`. Ne pas y toucher (le lot b l'a dans sa liste :
qu'il le laisse tel quel).

---

## § 6. Le banc des gènes v2 (`ml/evolution/banc/`, dossier neuf)

Le banc d'étude (`ml/ecurie/etude/banc-des-genes/`) reste tel quel. ⚠ Il n'est **pas dans git** (non suivi dans `bots-ecurie`, absent de cette copie) : je
n'ai pas pu relire son code (interdit d'aller lire dans la copie où la mesure tourne). Le v2 se fonde sur le dossier, `evoluer.js` (validation séquentielle,
l.595-716), `note.js` (`comparer`, l.136-158) et `courses.js`.

⚠ Ne pas confondre avec `cfg.banc` de config.json (`{"travailleurs":"auto","courses":20,"tmax":300}`) : c'est le banc **de la machine** (combien de courses à la
fois). Le banc v2 n'écrit rien dans config.json.

### 6.1 Les fichiers

| fichier | rôle |
|---|---|
| `banc/banc.js` | la ligne de commande et la boucle des regards ; exporte `principal(argv, {creer, REF, maintenant})` (les tests injectent un faux `creer`) |
| `banc/plan.js` | pur : `lirePlan`, `constanteOBF(alpha, regards)`, `borne(plan, m)`, `decision(...)`, `graine(numero, i)` |
| `banc/bras.js` | pur sauf la lecture : lire `bras.json` et `vague.json`, fabriquer le génome et le texte de chaque bras, les critères |
| `banc/criteres.js` | pur : la valeur d'une course pour un critère, la différence appariée, `z` |
| `banc/rapport.js` | pur : `resume.txt`, `journal.md`, `regards.json`, `resultat.json` |
| `banc/bras.json` | le catalogue des bras (à la main) |
| `banc/vagues/<nom>/vague.json` | une vague (à la main) ; le banc écrit à côté `plan.json`, `regards.json`, `resultat.json`, `resume.txt`, `journal.md` |
| `banc/vagues/INDEX.md` | refait à chaque fin de vague : une ligne par vague (date, nom, question, verdicts) |
| `banc/etat/` | le cache des courses (`courses-*.jsonl`) et `pilotes/` (via `courses.creer({dossierEtat})`), `verrou.json`, `STOP` |
| `banc/.gitignore` | `etat/` entier, `*.tmp` |
| `banc/tests/banc.test.js` | les tests sans course (§ 8.4) |

Les vagues se committent (légères : le portfolio) ; `etat/` jamais.

### 6.2 La ligne de commande

```
node ml/evolution/banc/banc.js --vague ml/evolution/banc/vagues/v001-maps-a-decor [--travailleurs 2] [--config ml/evolution/config.json] [--verifier] [--resume]
```
- `--vague` : le dossier de la vague (il contient `vague.json`) ;
- `--travailleurs` : courses à la fois (défaut **2**) ;
- `--config` : la config de la sélection (pour `cartesTirage`, `note`, `tmax`, `graineReseaux`, `regime`) ; défaut `ml/evolution/config.json` ;
- `--verifier` : lit tout, fabrique les pilotes, calcule le plan et sa constante, imprime, écrit `plan.json` s'il manque, **ne joue rien** ;
- `--resume` : réimprime `resume.txt` depuis `regards.json`, ne joue rien ;
- arrêt : créer `ml/evolution/banc/etat/STOP`, ou Ctrl+C (une fois : plus de lancement ; deux fois : `arreter({dur:true})`). Reprise : la même commande.

### 6.3 Le fichier de bras (`banc/bras.json`)

> (28/11) Les « dit » des bras `sortie` et `sortie-tot` ci-dessous sont **remplacés** (§ 3.1 bis) : « la nitro au décollage sur les maps à décor » et « la même, gardée dès 1 s avant le bord ».

```json
{ "format": "banc-bras-1",
  "bras": {
    "sortie":        { "dit": "la sortie préparée sur les maps à décor", "genes": { "sortieOn": 1 } },
    "sortie-tot":    { "dit": "la même, décidée 1 s avant le bord", "genes": { "sortieOn": 1, "sortieT": 1 } },
    "rien":          { "dit": "la bascule peut lâcher le volant", "genes": { "rienOn": 1 } },
    "fidele-juge":   { "dit": "juger le vol sur la loi fidèle", "genes": { "loiFidele": 1 } },
    "fidele-suit":   { "dit": "suivre la loi fidèle", "genes": { "loiFidele": 2 } },
    "secours":       { "dit": "les secours en vol", "genes": { "secoursOn": 1 } },
    "retour":        { "dit": "la loi retour seule (référence du n° 3)", "genes": { "retourOn": 1 } } } }
```
- `genes` : des **écarts au génome du témoin** de la vague. Une clé hors de `Gn.BORNES` → refus. Une clé `fige` (`chancePalierMin`) → refus
  (« la seconde chance n'est pas une idée du banc » ; elle se règle pour toute la vague, voir `fixes`).
- Le génome du bras = `Gn.genomeTemoin(cfg avec temoin)`, les écarts posés, puis `Gn.reparer`. Si `reparer` change une valeur demandée (hors borne, contrainte)
  → refus, avec la valeur rendue. Puis `Gn.valider` doit rendre `null`. Le texte = `Gn.ecrirePilote(g)`, `shaPilote = Gn.shaPilote(texte)`.
- Deux bras d'une vague qui donnent le même `shaPilote` → refus (un bras en double). Un bras dont le `shaPilote` est **celui du témoin** de la vague (par
  exemple `{"loiFidele":0}`) → refus. Un bras nommé `temoin` → refus. Tous code 1.
- Le témoin n'est pas un bras : il est toujours joué, sous le nom `temoin`.

### 6.4 Le fichier de vague (`vague.json`)

```json
{ "format": "banc-vague-1",
  "numero": 1,
  "nom": "v001-maps-a-decor",
  "question": "Les gènes A des maps à décor font-ils moins mourir à la grotte ?",
  "temoin": "c0025",
  "tmax": 900,
  "carte": "grotte",
  "fixes": {},
  "plan": { "premier": 24, "pas": 24, "plafond": 192, "alpha": 0.05, "futilite": 0.5, "fMin": 0.1 },
  "bras": [
    { "nom": "sortie",      "critere": { "type": "causes", "famille": ["roche", "paroi", "pic", "glace"], "sens": "bas" } },
    { "nom": "rien",        "critere": { "type": "mesure", "cle": "poseCentre", "sens": "haut" } },
    { "nom": "fidele-juge", "critere": { "type": "causes", "famille": ["air", "vide"], "sens": "bas" } },
    { "nom": "secours",     "critere": { "type": "causes", "famille": ["air", "vide"], "sens": "bas" } } ] }
```
- `numero` : entier de **1 à 50 000**, **unique**. L'unicité se lit dans **`vagues/INDEX.md`, commité**, qui tient la liste des numéros pris (pas
  seulement dans les dossiers présents : un dossier effacé ou une autre machine ne doit pas reprendre des graines). Le banc refuse (code 1) un numéro
  hors de 1..50 000 ou déjà inscrit, et inscrit le sien au départ de la vague. **Le numéro 0 est réservé à l'essai** (`v000-essai`, hors de git, jamais
  inscrit dans INDEX.md, jamais conclu : ses graines resservent d'un essai à l'autre). Il fixe les graines (§ 6.6).
- `temoin` : un nom de `Gn.TEMOINS` (c0025 par défaut). `tmax` : défaut `cfg.tmax` (900). `carte` : `null` (la graine tire) ou une carte de `cartesTirage`,
  la même pour le témoin et tous les bras (sinon pas d'appariement).
- `fixes` : des gènes posés **chez le témoin et chez tous les bras** (le seul endroit où `chancePalierMin` peut changer). `{}` par défaut.
- `bras` : **1 à 5** bras (refus au-delà de 5 ; un avertissement sous 3 : la correction est faite pour 3 à 5).
- `critere` (un par bras, **annoncé avant de jouer**) : `type` parmi
  - `palier`, `F`, `E` : par `note.comparer` (bootstrap apparié par graine ; `dPalier`, `dF`, `dE` et leurs erreurs-types) ;
  - `mesure` + `cle` : une des 15 clés de `ressemblance.MESURES` (`l.mesures[cle]`, nulle sous 60 s : la graine compte si les deux en ont une) ;
  - `causes` + `famille` : par course, le **nombre de morts** dont la cause est dans la famille, lu dans `l.causesMorts` (§ 4.4 : toutes les morts, la
    seconde chance comprise) ; une ligne sans `causesMorts` (écrite avant ce lot) n'est pas lue, la graine n'est pas mesurée pour ce bras ;
  - `survie` (`l.survie_s`), `vols` (`l.vols`).
  `sens` : `haut` (plus = mieux) ou `bas` ; il ne sert qu'aux mots (« aide », « nuit »). Le test est bilatéral.
- **Un compteur n'est jamais un critère principal** (refus, code 1) : chez le témoin, le gène est à 0, son compteur vaut 0 par construction ; la différence
  appariée serait toujours positive ou nulle et le bras « gagnerait » ou « perdrait » par construction (le piège de la seconde chance, dossier l.117).
  Les compteurs sont des **mesures secondaires** (§ 6.7) : la moyenne par course, la part des graines où le compteur du gène du bras dépasse 0, et pour
  `sortieOn` la part des sorties préparées qui finissent mal, `(vol − pose) / vol`. Jamais une décision.
- **Le fichier est figé dès la première course** : `plan.json` garde son sha1. Relancé avec un `vague.json` changé → refus, code 4.

### 6.5 La règle séquentielle, avec ses nombres

Les regards : après `premier` graines, puis tous les `pas`, jusqu'à `plafond` (défaut 24, 24, 192 : **8 regards**). À chaque regard, pour chaque bras encore
actif, sur les graines **mesurées chez le bras et chez le témoin** (`m` graines, au plus `n`). ⚠ Le regard `j` ne lit **que** les graines
`graine(numero, 0)` à `graine(numero, n_j − 1)` du plan : après un arrêt au milieu d'un paquet, le cache contient plus de courses que le regard en cours,
et un code qui lirait « toutes les lignes du pilote » referait d'autres décisions. Pour chaque regard :
- la statistique : pour `palier`, `F`, `E`, `note.comparer(LA, LT, {REF, cfg, rng: Gr.rngDe('banc|'+nom+'|'+bras+'|'+m)})` (comme la validation, evoluer.js
  l.644) → `d` et `se` ; pour les autres, la différence appariée par graine `d_g = x_bras − x_temoin`, `d` = sa moyenne, `se` = écart-type (n − 1) / √m ;
  `z = d / se` (`se` = 0 : `+inf`/`−inf` si `d` ≠ 0, sinon 0 ; comme `zDe`, evoluer.js l.621-624) ;
- **la borne** : `c · √(plafond / m)` (O'Brien-Fleming, même forme que `borneRegard`, evoluer.js l.627-631) ;
- **la décision**, dans cet ordre :
  1. `|z| ≥ borne` → **arrêt « net »** (« aide » si le signe va dans `sens`, sinon « nuit ») ;
  2. au **1er** regard seulement, `fMin > 0` et `f̂ < fMin` → **arrêt « rare »** (`f̂` = la part des graines où la course du bras n'est pas identique à celle du
     témoin). **Identique = mêmes `empreinte` et `empreinteTouches`** (la graine, la carte et les touches font la course). `empreinteVues` n'en fait pas
     partie : un bras qui demande des lois aux yeux (`loiFidele`, `secoursOn`, `coupOn`, `retourOn`) porte `retours` dans **chaque** ordre (modele.js l.494),
     les yeux ajoutent des rayons `retour<i>` à chaque vue (yeux.js l.778-780), et ses vues diffèrent toujours de celles du témoin, même sans un ordre changé.
     Avec `empreinteVues`, `f̂` vaudrait 1 pour ces bras. Elle reste écrite, pour information ;
  3. à partir du **2e** regard, `|z| < futilite` (0,5) → **arrêt « futilité »** ;
  4. `n ≥ plafond` → **arrêt « plafond »** (rien de net) ;
  5. sinon on continue.
  Un bras arrêté ne joue plus. Le témoin joue tant qu'un bras joue. La vague finit quand tous les bras sont arrêtés.

**La correction pour plusieurs bras** : Bonferroni, comme `analyser.js` du banc d'étude (dossier l.33) : `alpha_bras = alpha / k`, k = le nombre de bras
de la vague (le témoin non compris). **La constante `c`** est celle qui fait, sous l'hypothèse « aucun effet », franchir la borne à au moins un regard avec la
probabilité `alpha_bras` (bilatéral). Elle se calcule (plan.js, `constanteOBF`) par simulation de la marche aléatoire aux temps des regards : 200 000 chemins,
`mulberry32(20261128)`, une normale par **incrément** de regard (variance = graines ajoutées), dichotomie à 40 pas. Déterministe : même entrée → même `c`.
Je l'ai calculée ainsi (100 000 chemins, script de lecture, rien d'écrit dans le dépôt) :

| plan (premier / pas / plafond) | regards | k = 1 (5 %) | k = 3 | k = 4 | k = 5 |
|---|---|---|---|---|---|
| 24 / 24 / 96 | 4 | 2,035 | 2,447 | 2,538 | 2,620 |
| **24 / 24 / 192** | **8** | 2,079 | **2,486** | **2,581** | **2,645** |
| 24 / 24 / 288 | 12 | 2,104 | 2,503 | 2,601 | 2,678 |
| 24 / 12 / 96 | 7 | 2,083 | 2,485 | 2,583 | 2,659 |

Contrôle : la valeur classique d'O'Brien-Fleming pour 4 regards à 5 % bilatéral est 2,024 ; pour 8 regards, environ 2,07. La futilité est **non liante**
(elle ne fait que retirer des arrêts) : elle ne monte pas le taux de faux « net ». Le `z` est lu sur une loi normale : à 24 graines c'est un peu optimiste
(une loi de Student à 23 degrés) ; la borne du 1er regard (2,65 × √8 ≈ 7,5 à k = 5) rend ce biais sans effet.

**Ce que le banc peut voir** (plafond 192, k = 5 ; la formule `(c + 0,84) · σ / √192` donnerait 80 %, mais la futilité en retire : une simulation donne
**75 %** de « net » et 12 % d'arrêts par futilité à cette dérive, 80 % vers 1,05 fois) :
- le palier, toutes courses changées (σ ≈ 3,92, dossier l.29) : **75 % de chances à 1,0 palier** (80 % vers 1,05) ; pour un gène qui ne change qu'une part f
  des courses, σ ≈ 3,92·√f ;
- un nombre de morts d'une famille (σ de l'ordre de 0,6 à 0,7 par graine) : environ **17 morts pour 100 courses** ; c'est pourquoi le critère principal
  d'un gène rare est ciblé et la carte imposée.
Coût d'une vague de 5 bras au plafond : 6 × 192 = 1 152 courses. **Le débit du v2 est à mesurer** sur la vague d'essai (§ 8.5, point 7) : les 180 courses par heure
du dossier (l.31) viennent du banc d'étude, avec son propre nombre de courses à la fois ; le v2 en lance 2 par défaut. Grâce aux arrêts tôt, un bras
joue en moyenne 102 graines sous « aucun effet » et 139 à la dérive de 1 palier (simulation du relecteur).
⚠ **Pas de banc v2 sur le Ryzen pendant que la sélection y tourne** : la charge du PC fait des pannes, et ces courses sont rejouées.

**Ce qu'autorise un « net »** :
- un **« net-aide » n'est qu'un candidat**. Il ne compte qu'après une **vague de confirmation** : un seul bras (k = 1), un numéro neuf (donc des graines
  neuves), un nombre fixe de graines annoncé (`premier` = `pas` = `plafond`, un seul regard), le même critère. Seule une confirmation autorise à proposer
  d'allumer le gène chez le témoin ou à le dire dans le portfolio ; le banc **n'allume jamais rien lui-même** et ne touche pas à la sélection ;
- l'écart lu **au regard de l'arrêt** est gonflé quand l'arrêt est un « net » pris tôt (la chance du gagnant : notes/sacre.md, le dernier regard biaisé
  de −0,28 palier ; commit 00fb4cfad, le « +2 paliers » des graines rejouées). Le banc écrit donc aussi le `d` du **premier regard** (taille fixe), et
  marque le `d` final « biaisé par l'arrêt » ;
- le 5 % ne vaut que pour **une** vague. `vagues/INDEX.md` compte les vagues jouées et le nombre de faux « net » attendus (`0,05 ×` le nombre de vagues
  conclues) : sur 10 vagues, environ 0,5. C'est écrit en tête de l'INDEX.

### 6.6 Les graines (une plage à lui)

**`graine(numero, i) = 4 000 000 + 37 · (1 000 · (numero − 1) + i)`**, `i` de 0 à `plafond − 1` (`plafond` ≤ 1 000 : refusé au-delà). Une vague a donc ses
graines **neuves** : rien n'est repris d'une vague à l'autre (la leçon du coffre : un « +2 » sur des graines rejouées était la chance du gagnant).

La preuve, par le reste modulo 37 (toutes les plages avancent de 37) : 4 000 000 = 37 × 108 108 + **4**.

| plage | départ | reste mod 37 |
|---|---|---|
| entraînement (config `graines.entrainement`) | 910 000 | 22 |
| suite de l'entraînement (`suite`) | 1 000 021 | 22 (910 000 + 37 × 2 433) |
| validation | 1 000 000 | 1 |
| repli de validation | 950 000 | 25 |
| coffre | 990 000 | 28 |
| banc d'étude | 3 000 000 | 3 |
| les graines de `identite` (910 000, 910 037, 910 074) | 910 000 | 22 |
| les mesures du 27/11 (`out-pDiag-930000`…) | 930 000 | 5 |
| **banc v2** | **4 000 000** | **4** |

Deux graines de restes différents ne sont jamais égales : la plage du banc ne touche aucune autre, quelle que soit sa longueur (la suite d'entraînement va
jusqu'à 999 999 999). La plus grande graine possible (numéro 50 000, refusé au-delà, i = 999) vaut 1 853 999 963 < 2³¹ : le jeu sème avec `n|0`
(`ml/reel/sim-env-reel.js` l.16), et au-delà d'environ le numéro 58 000 la graine deviendrait négative. L'essai (numéro 0) prend 3 963 000 à 3 999 963,
reste 4 aussi, sous toutes les vagues. **Second argument, par la taille** (si un jour une plage n'avançait pas de 37) : toutes les plages à pas libre
(identite, mesures du 27/11, validation, repli, coffre, entraînement de départ) restent sous 4 000 000 − 37 000, et les seules qui montent au-delà
(la suite d'entraînement, reste 22 ; le banc d'étude, reste 3) avancent de 37. Le test (§ 8.4) **recalcule** les restes depuis config.json au lieu de
les recopier, et vérifie aussi ce second argument.

### 6.7 Les sorties

- `plan.json` (écrit au départ, une fois) : la vague lue, son sha1, le témoin (identifiant du génome et `shaPilote`), chaque bras (écarts, identifiant du
  génome, `shaPilote`), `k`, `alpha_bras`, `c`, la liste des regards, les graines (première et dernière), l'époque des courses (`ep.courses`), **l'époque de
  la note (`ep.note` : l'étalon des joueurs et `cfg.note`)**, **le nombre de tirages du bootstrap (`cfg.validation.bootstrap`)**, la date.
- `regards.json` (réécrit **en entier**, atomiquement, après chaque regard) :
  `{vague, epoque, regards:[{j, n, temoin:{mesurees}, bras:{<nom>:{m, identiques, f, d, se, z, borne, decision}}, nonMesurees, courses, minutes}]}`.
- `resultat.json` (à la fin) : par bras, le verdict (`net-aide | net-nuit | rare | futilite | plafond`), au regard et sur combien de graines, `d`, `se`, `z`
  (marqués `"biaiseParLArret": true` si l'arrêt est un « net » avant le plafond), **`dPremier`, `sePremier`** (le premier regard), `candidat: true` pour un
  « net-aide » (à confirmer, § 6.5), et **les mesures secondaires**, sous une clé `secondaires` marquée `"nonCorrigees": true` (« ne décident rien ») :
  `dPalier`, `dF`, `dE` (et leurs erreurs-types, par `comparer`), `f̂`, `empreinteVues` différentes (la part), la moyenne par course de chaque compteur et la
  part des graines où il dépasse 0, la part des sorties préparées qui finissent mal, les causes de toutes les morts, la survie, les cartes traversées,
  la part de chances prises.
- `resume.txt` (pour Sacha, lignes de 118 colonnes au plus, comme `etat.js`) : pendant la vague, **seulement** l'avancement (regard, graines, bras actifs,
  arrêts déjà décidés) ; **aucune différence chiffrée tant qu'un bras joue** (dossier l.33 : « aucune conclusion tirée d'une lecture en cours »). À la fin : une
  ligne par bras (critère annoncé, verdict, graines, part de courses changées), puis « ce qu'on peut dire » et « ce qu'on ne peut pas dire ».
- `journal.md` (le portfolio) : la date, la question, les bras et pourquoi (le champ `dit`), les critères annoncés, le plan et ses nombres, chaque regard (une
  ligne par bras), les verdicts, le coût (courses, heures), les courses non mesurées. Écrit par le banc, jamais à la main (une note libre va dans `notes.md`).
- `vagues/INDEX.md` : refait à chaque fin de vague. En tête : le nombre de vagues conclues et le nombre de faux « net » attendus ; puis les numéros pris
  (inscrits dès le départ d'une vague) ; puis une ligne par vague (date, numéro, nom, question, verdicts, « candidat » ou « confirmé »).

### 6.8 Les codes de sortie, la reprise, l'époque

| code | quand |
|---|---|
| 0 | la vague est finie (tous les bras arrêtés), ou `--verifier` / `--resume` sans défaut |
| 1 | une entrée mal écrite : fichier, bras, critère (dont un `compteur` en critère principal), plan, numéro hors de 1..50 000 ou déjà inscrit dans INDEX.md, carte inconnue, gène figé, bras égal au témoin ou nommé `temoin` |
| 2 | une course rend `YEUX CHANGES` ou une erreur du cerveau, ou une ligne « carte imposée non appliquée » (§ 5, point 5), ou plus de 10 % des courses d'un regard non mesurées : arrêt, rien de conclu |
| 3 | interrompue (STOP, Ctrl+C) : rien n'est écrit pour le regard en cours ; relancer la même commande |
| 4 | `vague.json` a changé depuis le départ ; ou l'époque des courses, l'époque de la note ou le nombre de tirages du bootstrap n'est plus celui de `plan.json` ; ou le génome ou le `shaPilote` du témoin ou d'un bras, refabriqué, n'est plus celui de `plan.json` (le message nomme le bras) |
| 5 | un autre banc tient `banc/etat/verrou.json` (pid vivant) |

**La reprise** (comme la validation, evoluer.js l.605-607) : à chaque lancement, le banc **refabrique** le témoin et chaque bras (génome, texte,
`shaPilote`) et l'époque, et les compare à `plan.json` (code 4 au moindre écart). Pourquoi : `bras.json` n'est pas figé, `genome.js` n'est pas dans l'époque
(un `genomeTemoin` ou un `bloc` changé change le texte sans couper l'époque), `pilote-voltige.js` peut changer, et `cfg.note`, l'étalon ou le bootstrap
ne sont pas dans `ep.courses`. Sans ce contrôle, une vague reprise mélangerait deux pilotes sans le voir. Puis tout se recalcule depuis les courses. Le cache de `banc/etat/` rend celles déjà jouées ; les
bootstraps ont leur propre graine (`Gr.rngDe('banc|…|'+m)`) ; les décisions sont donc les mêmes. `regards.json` est réécrit en entier : pas de doublon.
**L'époque** : si le code a changé entre deux lancements (une nouvelle époque), le cache ne rend plus rien et la vague se mélangerait. Le banc refuse (code 4)
et dit : « l'époque a changé : refaire la vague sous un autre numéro ». Il n'efface rien.

---

## § 7. Les époques

- `FICHIERS_EPOQUE` (commun.js l.251-252) : `ml/bot/yeux.js`, `doigts.js`, `piloter.js`, `ressemblance.js`, `mesures.js`, `voltige.js`, `ml/reel/jeu-reel.js`,
  `sim-env-reel.js`, `ml/evolution/modele.js`, `ml/evolution/enfant.js`. **Ce lot en change deux : `modele.js` (lot a) et `enfant.js` (lot b).**
  `genome.js` n'est pas dans l'époque (INTERFACES.md § 11.6, C7) ; `courses.js` non plus. Rien dans `ml/bot/` ni `ml/reel/` : les yeux ne changent pas.
- **Une seule époque** à condition que (a) et (b) arrivent **ensemble** : l'intégrateur fusionne les trois lots avant de jouer la moindre course hors des tests.
  Une course jouée entre les deux ferait une époque intermédiaire, jetée ensuite (du calcul perdu, pas une erreur).
- **Le Ryzen** tourne avec `e93ff5cb5` (génome v:2, sans le portage). Il n'a reçu ni `7b1df608e` (portage : `modele.js` change) ni `3b1bf15e5` (le sacre
  séquentiel, l'urne, la réserve de graines : aucune époque). Il recevra tout d'un coup : **une seule** coupure d'époque de son point de vue (de la sienne à
  celle de v4). Ses pilotes v:2 sont migrés en v:4 au chargement (`valider` appelle `migrer`), **leurs identifiants ne changent pas** (§ 2.3) ; les notes
  repartent de zéro, les courses sont rejouées ; le contrôle d'identité est refait (genome.js et modele.js ont changé). Sa config devient la nouvelle
  `config.json` (le sacre séquentiel arrive en même temps, voir notes/sacre.md « Compatibilité avec le Ryzen »). Aucun gène v4 n'est allumé chez lui : la
  sélection les allumera à 3 % par drapeau et par enfant.
- **À la reprise sur le Ryzen, dans l'ordre** : le contrôle d'identité (refait : genome.js et modele.js ont changé), puis **la revalidation du champion**
  (24 graines de validation, plan fixe : « La revalidation d'après une nouvelle époque garde son lot fixe », evoluer.js), puis la génération en cours. Une
  validation en cours reprend les mêmes graines et devient séquentielle (notes/sacre.md).
- ⚠ **La migration est à sens unique.** Au premier lancement du code v4, evoluer.js valide chaque vivant (`Gn.valider` migre en place, evoluer.js l.268),
  réécrit `population.json` à la nouvelle époque (l.541-542), puis écrit `morts.jsonl` et les champions en v:4. Le code d'avant (e93ff5cb5 sur le Ryzen,
  ddca156d8 ailleurs) refuse un génome v:4 (`valider` : « version 4 (attendu 2 » ou « attendu 3 … »). **Avant le premier lancement v4 : copier `etat\` et
  `champions\` à part** (le mode d'emploi du Ryzen le dit, et le maître le fait faire sur place, par la session du second PC). Revenir en arrière = remettre cette copie.
  Même règle pour tout dossier d'état local en v:3 : ne pas relancer l'ancien code sur un dossier qu'un code v4 a ouvert.
- **mesure-tau et l'arbre** lisent les états v:2 et v:3 sans changement : `mesure-tau.js` groupe les courses par (époque, id, graine) (l.117) et les
  identifiants sont gardés ; `arbre.js` migre ce qu'il lit (l.25, `G.migrer(g)`). La bascule d'époque **coupe** les enfants de la génération en cours
  (leur première moitié dans l'ancienne époque, la seconde dans la nouvelle : environ λ enfants non comptés, signalés « coupés », l.155-164). Le verdict
  n'est pas remis à zéro.
- **Le banc d'étude** (`ml/ecurie/etude/banc-des-genes/`, qui tourne dans `bots-ecurie`) : rien ne change pour lui tant que ce lot n'est pas fusionné dans
  `bots-ecurie`. Après : son cache est d'une autre époque, son bras « depart » et tous les autres seraient rejoués. **Fusionner après la fin de sa mesure.**
  Ses génomes v:3 se liront (migration) ; mais une fois ouverts par le code v4, l'ancien code ne les relira plus (ci-dessus).

---

## § 8. Les tests

Les vues enregistrées des tests existants : **`ml/ecurie/etude/selection-naturelle/inventaire/vue-exemple.json`** (`EX.sol.vue` : map espace, route tenue ;
`EX.vol.vue` : grotte, 12 rayons dont `viser`), utilisé par `tests/gestes.test.js` (l.168), `tests/portage.test.js` (l.63) et `tests/genes-muets.test.js` (l.46),
et les suites faites à partir d'elles dans `portage.test.js` (`suites()`, l.71-97 : bord, libre, dessous, large) et recopiées dans `genes-muets.test.js`.
Les pilotes de référence : `ml/ecurie/pilote-voltige.js` (c0025), `ml/labo/cerveaux/c0101-pilote.js`.

**Le code d'avant, épinglé par commit** (jamais `HEAD`, qui avance) :
- v:1 : `e2ea8d2c9` (son genome.js porte `if(BORNES.length!==86` : vérifié, la recherche donne 1 ; au commit `ddca156d8`, elle donne 0) ;
- v:2 : `7f9543955` (comme portage.test.js l.123, `AVANT`), et l'état `tests/etat-e93ff5cb5` écrit par le code exact du Ryzen ;
- v:3 : `ddca156d8`.
Pour chacun, `git show <commit>:ml/evolution/genome.js` **et** `…:ml/evolution/modele.js`, copiés dans `ml/evolution/essais/genes-v4/<commit>/` (hors git),
les `require('./commun')` et `require('./graines')` réécrits comme gestes.test.js l.112.
⚠ **L'ancien pilote s'écrit avec l'ancien modèle** : un genome.js copié lit `fs.readFileSync(MODELE)`, et `MODELE` = `C.DOSSIER/modele.js` (genome.js l.23),
donc le **nouveau** modele.js, sauf si l'on passe `o.modele` (l.467). La forme obligée :
`ancienGenome.ecrirePilote(g,{cfg, modele: <texte de git show <commit>:ml/evolution/modele.js>})`, comme portage.test.js l.124 et l.139
(`{cfg,modele:V2.modele}`). **Garde-fou** du test : le texte ancien ne contient pas `chancePalierMin` et contient `palierMin:12}` en dur.
⚠ **Un test qui SAUTE compte comme un ÉCHEC pour l'intégrateur** (le g2 de gestes.test.js saute aujourd'hui en silence : il lit `HEAD`, l.110-111, l.146).

### 8.1 Lot (a) : `tests/genes-v4.test.js` (nouveau, sans course, quelques secondes)

- **(v1) la table** : 8 gènes en fin de `BORNES` (index 121 à 128), types, bornes, naissances du § 2.1 ; 129 gènes, 91 réels ; `GARDES` : 12 drapeaux, 33 réels ;
  seul `chancePalierMin` a `fige` ; `DECLICS` = les 25 noms du § 4.2. **Dans les deux sens** : chaque nom de `DECLICS` a un `tic('<nom>')` dans le texte de
  modele.js (une recherche dans le texte), et chaque `tic('…')` du texte est dans `DECLICS`. `RACC_CARTES_0` et `RACC_JUMEAU_0` (§ 4.2) = les cartes dont le
  gène `raccCartes_*` / `raccJumeau_*` naît à 0 dans `BORNES` (recalculé, pas recopié).
- **(v2) la migration, la chaîne complète** : v:1 (200 mutants écrits par le genome.js de `e2ea8d2c9`), v:2 (200 mutants de `7f9543955`, plus
  `tests/etat-e93ff5cb5/population.json` et `tests/etat-v2-ancien`), v:3 (200 mutants de `ddca156d8`) → v:4 conformes, valeurs gardées, gènes v4 à leur
  naissance, **même `idDe`** que l'ancien genome.js de chaque commit, **et mêmes décisions** (comme v3 ci-dessous). Témoins : c0025 `19e3767cc346`, c0101
  `f70ddcb5a565`. Un v:3 abîmé (une clé en moins) n'est pas migré. Aucun cas ne peut sauter (règle du § 8).
- **(v3) éteint = au bit près** : sur toutes les suites (inventaire + `suites()` de portage.test.js + les suites nouvelles du § 8.1 v4), décision par décision
  et mémoire neuve à chaque suite, `JSON.stringify` des ordres égal entre : le pilote v4 du témoin, le pilote du code d'avant (`ddca156d8`, écrit avec
  **son** modele.js, § 8) et le fichier `pilote-voltige.js` ; de même pour c0101 (ordres comparés **sans le champ `declic`**) ; de même pour les 200 mutants v:3
  (pilote d'avant contre pilote v4 du génome migré, sans `declic`). Aucun ordre d'un génome aux gènes v4 éteints ne porte `declic` (sauf les anciens gènes
  allumés).
- **(v3 bis) la main** : `piloter.charger(texte).profilSha` égal à celui du fichier pour c0025 **et** c0101, et pour chacun des 200 mutants migrés égal à
  celui du pilote d'avant. Le texte v4 contient `PROFIL` sous la balise, et `charger(texte).profil.chance.palierMin` (ou `PROFIL.chance.palierMin` du module
  chargé) est un **nombre entier égal à 12** (pas `undefined`, pas une chaîne). Pourquoi ce test : la course de 45 s d'identite.js ne voit pas la seconde
  chance (elle ne joue qu'après une mort au palier 12 ou plus ; ni `bilan.main.sha` ni la chance ne sont dans la ligne compacte, piloter.js l.302).
- **(v4) allumé = change, et seulement ce qu'il faut** — pour chaque gène, une suite qui le déclenche et une qui ne doit rien changer :
  - `sortieOn` (**remplacé** par le § 3.1 bis : le vol ne part plus en `plane`) : vue sol `carte:'grotte'`, `tenue:{tient:false,t:.5,cote:1}`, jauge 0,8, `sorties.bord.rayons` = `rien` choc, `versRoute` choc, `plane` pose
    propre → `nitro:true` (au lieu de faux), puis une vue de vol 0,1 s après → l'ordre de `plane` (`nitro:true`), `declic` contient `sortieOn`, puis
    `sortieOn.vol` ; mêmes vues `carte:'espace'` → aucun changement ; `plane` choc → aucun changement ; `t:1.3` (> `sortieT`) → aucun ; `m.voulu` reste faux
    (vérifié par une vue de vol où `viser` se pose : pas de bascule vers `viser`) ; **un raccourci engagé** (`m.sortie` posé par deux vues de raccourci
    `versRoute` avant) → la nitro de l'ordre au sol reste celle d'aujourd'hui ; **l'annonce contraire** (règle vraie, puis une vue où `plane` dit choc, puis
    le décollage) → le vol part en `versRoute` ; avec `retourOn` : après un départ en `plane`, une bascule vers `versRoute` ne déclenche pas le choix du départ ;
  - `rienOn` : 5 vues de vol à 0,1 s, façon `versRoute` (axe 0,5, pose), `rien` pose propre axe 0,1 → passage à `rien` après `tenirFacon` **et deux vues de
    suite** (volant 0 ; une seule vue → rien) ; `rien` axe 0,35 (écart < 0,2) → rien ; `rien` dessous → rien ; après un retour de la bascule vers `versRoute`
    dans le même vol → pas de second passage à `rien` ; un coup de nitro en cours (`coupOn`) s'arrête au passage ; la figure suivante juge sur `rien`
    (`tenuPose`) ;
  - `loiFidele` 1 : rayon `versRoute` « air », `retour0` pose, `vol.retours=[{volant:.3,manche:0,nitro:false}]` → pas de bascule (la façon se pose) là où le
    témoin bascule ; **une figure** dont le seuil `tenuPose.t` diffère entre le rayon fidèle et le rayon du radar part ou ne part pas selon le fidèle ;
    2 : le volant de l'ordre vaut 0,3 ; avec `coupOn` : le même rayon `retour<b>` sert aux deux, `RETOURS_DEMANDES` a 2 lois, pas 3 ;
  - `secoursOn` : tous les rayons **longs** `choc`/`air`/`fond`, `retour0` (S1) pose → façon `retour0` ; **les rayons courts `libre` ne bloquent pas** (même
    cas, `gauche` et `droite` `libre`) ; **un rayon long `libre` bloque** ; un rayon long absent (`viser` sans cible) est sauté ; la bascule vient de prendre
    `droite` (`libre`) et les longs meurent → le secours la remplace ; un coup en cours s'arrête ; le tableau des places du § 3.4 vérifié sur les six
    combinaisons (`RETOURS_DEMANDES.length` et les lois) ; aucun ordre n'appelle `prime` sur `retour<k>` (genes-muets m2 le montre) ;
  - `chancePalierMin` : le `profil` du pilote à 12 = celui de `pilote-voltige.js` (même `profilSha` par `piloter.charger`) ; à 8 → `palierMin:8`.
- **(v5) les compteurs ne décident rien** : le § 4.5 point 2 (texte avec `COMPTE=false`) sur toutes les suites, chaque gène seul et tous ensemble, **et sur
  3 000 suites de vues tirées au hasard** (graine fixe, vues de l'inventaire perturbées : champs nuls, rayons absents, issues tirées ; tous les drapeaux nés
  à 0 allumés, `loiFidele` à 1 puis 2) : ordres identiques sans `declic`, et **zéro erreur de plus** avec `COMPTE=true` qu'avec `COMPTE=false`. Chaque `declic`
  ne contient que des noms de `DECLICS`, sans doublon.
- **(v5 bis) chaque compteur se déclenche** : une suite par nom, gène allumé, qui fait apparaître **chacun des 25 noms** au moins une fois (le piège :
  une garde mal écrite, `R.volRetourOn>0` au lieu de `R.volRetour>0`, ne se déclenche jamais et ne se voit pas autrement).
- **(v6) le gène figé** : 20 000 `muter` du témoin (phases A, B, C, `genes` et `sigma` forcés comme `essaiReparer`) : `chancePalierMin` ne change jamais ;
  `croiser` garde celui du premier parent ; `valider` refuse 0, 31, 12,5 ; `reparer` ramène.
- **Les tests existants à mettre à jour** (même lot) :
  - `genome.test.js` : comptes, ligne `REGLAGES` attendue du témoin avec les 8 clés ;
  - `gestes.test.js` : 129 gènes, v:4 ; **g2 épingle `e2ea8d2c9`** au lieu de `HEAD` (l.110) pour son genome.js v:1, et ne saute plus jamais ;
  - `integration.test.js` : 129 gènes, v:4 ;
  - `portage.test.js` : p3, ordres comparés sans `declic` ; comptes ;
  - `genes-muets.test.js` : m1 (12 drapeaux, 33 réels) ; m2-m3 avec `sortieT`, `sortieJauge`, `rienEcart` ; **m6 réécrit dans l'autre sens**, comme
    portage p4. Aujourd'hui il fait des mutants par le **nouveau** `Gn.muter` et les donne à l'**ancien** genome.js (`7b1df608e`, l.203-210) : avec un v:4,
    l'ancien `valider` rend « version 4 » et `ecrirePilote` lève ; et 3 % par drapeau allument des gènes que l'ancien code ne sait pas écrire. Demain :
    les mutants sont faits par l'**ancien** genome.js (`ddca156d8`, v:3), puis migrés ; on vérifie `idDe(ancien) == idDe(migré)`, décisions de l'ancien
    (écrit avec `modele:` l'ancien texte, § 8) == décisions du nouveau, et `FICHIERS_EPOQUE` sans genome.js ;
  - **`generation.test.js`** : `v===3` (l.123, l.127) devient `v===Gn.VERSION` ; `casCompat` vérifie en plus : mêmes ensembles d'id avant et après,
    `pop.temoin === idDe(genomeTemoin)` (`19e3767cc346`), `dejaVus` gardé ; et un **troisième état source, en v:3**, écrit par `ddca156d8` (le banc d'étude et
    les états locaux de bots-ecurie sont en v:3). C'est la preuve qu'un état du Ryzen se relit et fait une génération avec le code neuf.

### 8.2 Lot (b) : `tests/compteurs-carte.test.js` (nouveau, sans course)

- l'enveloppe sur un faux cerveau (un objet `{decide(vue){…}, pannes, erreurs, texte}` qui rend des ordres avec et sans `declic`) : les comptes sont justes,
  `declic` n'est plus dans l'ordre rendu, `this` est bien le cerveau (`texte` écrit par l'original) ;
- `resultatCompact` avec un faux `r` : `declenchements` (clés triées, `{}` sans rien), `cartes`, `causesMorts` (deux morts et une seconde chance : les deux
  causes ; `[]` sans mort), `chancePrise` (`null` sans `bilan.chance`) ;
- `optionsCourse` : `{tmax}` sans carte (pas de clé `carte`), `{tmax, carte:'grotte'}` avec ; `''` et `null` = sans carte ;
- la ligne de commande `--essai p.js 4000000 --carte grotte` : `tmax` = 45 (pas `NaN`), carte `grotte` ; `--carte` sans valeur → usage, code 1 ;
- `K.cle` : sans carte, **égale** à la chaîne construite à la main comme aujourd'hui ; avec carte, le suffixe `|carte:grotte` ; deux clés différentes ;
- `creer(...).demander` avec une carte inconnue → rejet avec le message ; une carte avec le dossier d'état de la sélection → rejet ; `CHAMPS` contient
  `declenchements`, `cartes`, `causesMorts`, `chancePrise` ; `faireLigne` écrit `carte` depuis la tâche (`null` sans carte), et une ligne dont `cartes[0]`
  n'est pas la carte demandée sort non mesurée avec sa raison — par une tâche dont l'enfant est remplacé (comme `courses.test.js` le fait pour les erreurs
  de chargement).

### 8.3 La preuve « éteint » en vraie course

Elle reste à `tests/identite.test.js` (§ 8.5) : le témoin v4 IDENTIQUE à `pilote-voltige.js`, c0101 v4 IDENTIQUE à `c0101-pilote.js`. Elle ne voit pas
la seconde chance (courses de 45 s) : c'est le test v3 bis, sans course, qui la couvre.

### 8.4 Lot (c) : `banc/tests/banc.test.js` (nouveau, sans course, un faux `creer` injecté comme `tests/validation-sequentielle.test.js` remplace `K.creer`)

- **(b1) la constante** : `constanteOBF` redonne le tableau du § 6.5 à ±0,03 ; même entrée → même nombre.
- **(b2) les décisions** : net (les deux signes), rare (seulement au 1er regard), futilité (pas au 1er), plafond, continuer ; `se` = 0.
- **(b3) les graines** : reste 4 ; restes des plages **recalculés depuis config.json** et du banc d'étude (3 000 000) : tous différents de 4 ; le second
  argument (par la taille) recalculé ; deux numéros de vague n'ont aucune graine commune ; `plafond` > 1 000 refusé ; numéro 50 001 refusé, 0 accepté
  seulement pour `v000-essai` ; un numéro inscrit dans INDEX.md (dossier absent) refusé ; la plus grande graine < 2³¹.
- **(b4) les bras** : écarts appliqués ; gène inconnu, gène figé, valeur que `reparer` déplace, bras en double, **bras égal au témoin**, **bras nommé
  `temoin`** → refus (code 1) ; `fixes` appliqué au témoin et aux bras ; un critère `compteur` → refus (code 1).
- **(b5) les critères** : chaque type sur des lignes fabriquées (mesure nulle, `causesMorts` absent, deux morts d'une famille dans une course) ;
  **« identique »** : un bras `loiFidele` dont les `empreinte` et `empreinteTouches` sont celles du témoin mais l'`empreinteVues` diffère compte identique.
- **(b6) le taux d'erreur** : 2 000 vagues simulées de 5 bras **sans effet** (lignes tirées d'un même modèle pour bras et témoin) → la part de vagues avec un
  « net » a un point **≤ 5,5 %** et une borne basse de l'intervalle à 95 % **sous 5 %** (la valeur nominale vaut 1 − 0,99⁵ = 4,9 %, l'erreur de 2 000 vagues
  environ 0,5 point) ; **la puissance** : un effet de δ = (c + 0,84)/√192 σ ≈ 0,25 σ par graine sur un bras est trouvé **75 % ± 3** des fois (pas 0,5 σ, qui
  passe toujours et ne contrôle rien).
- **(b7) la reprise** : STOP pendant le 3e regard → code 3, `regards.json` à 2 regards ; relance → le même `resultat.json` qu'une vague sans arrêt (date à part),
  aucune clé jouée deux fois ; un cache qui contient **plus** de graines que le regard en cours (arrêt au milieu d'un paquet) → mêmes décisions (le regard
  ne lit que ses `n_j` graines).
- **(b8) les refus** : `vague.json` modifié après le départ, époque des courses changée, `ep.note` changée, bootstrap changé, `bras.json` changé pour un
  bras de la vague (autre `shaPilote`), verrou pris → codes 4, 4, 4, 4, 4, 5 ; une ligne « carte imposée non appliquée » → code 2.
- **(b9) les textes** : `resume.txt` en cours ne porte aucun `d` ni `z` ; toutes les lignes ≤ 118 colonnes ; `journal.md` contient la question et chaque regard ;
  `resultat.json` porte `dPremier`, `biaiseParLArret`, `candidat`, `secondaires.nonCorrigees` ; INDEX.md porte le nombre de faux « net » attendus.

### 8.5 Les tests lents (l'intégrateur, **2 courses à la fois au plus**, rien d'autre en même temps)

1. Tous les rapides : commun, graines, note, genome, tableau, lanceurs, generation, robustesse, machine, machine-relecture, traces, relecture-traces,
   gestes, integration, portage, genes-muets, node-epoque, validation-sequentielle, mesure-tau, les deux nouveaux de `tests/`, `banc/tests/banc.test.js`,
   et `node ml/evolution/genome.js --essai-reparer 10000`.
2. `node ml/evolution/tests/identite.test.js --travailleurs 2` : c0025 et c0101 IDENTIQUES sur 910000, 910037, 910074 (les empreintes de notes/portage.md
   l.112-113 : c0025 `8d34b0578072, c4b906ba0a4f, 59db7c95e6f3` ; c0101 `8d34b0578072, 700c9e35dfbb, 302b83fef550`) ; W2 et retourOn changent toujours la course.
3. Chaque gène v4 allumé, et chaque ancien drapeau né à 0 : 2 courses de 120 s sur des graines qui passent par la grotte (910037 : grotte puis jade,
   notes/gestes.md l.107 ; 910148 : grotte, modele.js l.413) **et** 2 avec `carte:'grotte'` : zéro erreur du cerveau, zéro `YEUX CHANGES`, le compteur du gène
   > 0 sur au moins une. **L'outil** : l'intégrateur l'écrit dans ses essais (hors git, `ml/evolution/essais/genes-v4/`), par `K.creer` et `ord.demander` avec
   `carte` (le lot b le permet) ; `gestes.test.js --courses` ne sait pas imposer une carte et n'est pas modifié pour cela.
4. `node ml/evolution/enfant.js --essai <témoin v4> 3963000 20 --carte grotte` : `cartes[0]` vaut `grotte`. Puis **une course de 20 s sur chacune des 6
   cartes de `cartesTirage`** (nuages, ville, jade, espace, grotte, canyon) : `cartes[0]` vaut la carte demandée ; sinon (le canyon si `CANYON_OK` est faux
   dans le simulateur), la carte est retirée des cartes permises du banc et le § 5 le dit.
5. `node ml/evolution/tests/evoluer.test.js a e t --travailleurs 2` (config-essai.json) : le contrôle d'identité du maître passe, le témoin garde
   `19e3767cc346`. Puis `courses.test.js` (jamais relancé depuis le portage).
6. `generation.test.js` (dans les rapides, point 1) avec ses trois états sources : v:2 ancien, e93ff5cb5, v:3 de `ddca156d8`.
7. Une vague d'essai du banc : `banc/vagues/v000-essai/` (numéro 0, 2 bras, `premier` 2, `pas` 2, `plafond` 4, `tmax` 60, `carte` grotte) : 12 courses,
   code 0, les cinq fichiers écrits ; puis la même interrompue par STOP et reprise. **Le débit mesuré ici** (courses par heure à 2 à la fois) remplace
   l'estimation du § 6.5 dans la note de l'intégrateur.
8. **Un SAUTE compte comme un échec** (§ 8).

---

## § 9. Le découpage en trois lots

| lot | fichiers (et seulement eux) |
|---|---|
| **(a)** génome et pilote | `ml/evolution/genome.js`, `ml/evolution/modele.js`, `tests/genes-v4.test.js` (nouveau), `tests/genome.test.js`, `tests/gestes.test.js`, `tests/portage.test.js`, `tests/genes-muets.test.js`, `tests/integration.test.js`, `tests/generation.test.js` |
| **(b)** l'enfant, l'ordonnanceur | `ml/evolution/enfant.js`, `ml/evolution/courses.js`, `tests/compteurs-carte.test.js` (nouveau) ; `commun.js` **n'est pas modifié** (§ 5) |
| **(c)** le banc v2 | tout `ml/evolution/banc/` (code, `bras.json`, `.gitignore`, `banc/tests/`) |
| l'intégrateur | `INTERFACES.md` (un § 12 qui l'emporte sur § 2.1, § 2.3, § 3.2, § 3.3, § 4.1, § 5.1), `README.md` (le texte pour Sacha : le § 1), `arbre.js` (les mots simples `MOTS` des 8 gènes), `notes/` (sa note), `alarmeDistance` si besoin |

Personne ne touche `evoluer.js`, `identite.js`, `note.js`, `graines.js`, `config.json`, `ml/bot/`, `ml/reel/`, `code/`, `VERSION PRINCIPALE/`.

**Ce que (a) doit aux autres** (les noms exacts, figés par ce contrat) :
- à (b) : le champ d'ordre **`declic`** (tableau de chaînes, sans doublon, absent quand rien n'a agi) ;
- à (c) : `Gn.VERSION` (4), `Gn.BORNES` (avec `fige` sur `chancePalierMin`), `Gn.GENES_V4`, `Gn.ORDRE_V4`, `Gn.DECLICS` (les 25 noms), `Gn.TEMOINS`,
  `Gn.genomeTemoin(cfg)` (avec `cfg.temoin`), `Gn.reparer`, `Gn.valider`, `Gn.ecrirePilote`, `Gn.shaPilote`, `Gn.idDe` (signatures inchangées).

**Ce que (b) doit à (c)** : `task.carte` (chaîne de `cartesTirage`, ou absente) ; `K.cle(t,ep)` avec le suffixe `|carte:<carte>` ; les champs de ligne
`carte`, `cartes`, `declenchements`, `causesMorts`, `chancePrise` ; la ligne non mesurée « carte imposée non appliquée » ; `K.creer({cfg, epoque, dossierEtat, travailleurs, journal, doitArreter, enPause})` et `ord.demander`
**inchangés** ; le refus d'une carte inconnue, et d'une carte dans le dossier d'état de la sélection (des promesses rejetées).

**(c) ne doit rien aux autres.** Pour coder en même temps : (c) écrit ses tests sur un faux `creer` et des lignes fabriquées (qui portent déjà `declenchements`,
`cartes` et `causesMorts`) ; ses bras de test utilisent d'abord des gènes de v:3 (`lacheOn`, `bordOn`) ; les bras v4 de `bras.json` ne se fabriquent qu'une fois (a)
fusionné (le test (b4) le dit et se saute tant que `Gn.VERSION < 4`). (b) teste sans pilote v4 (un faux cerveau). (a) teste sans enfant (les suites de vues).

---

## § 10. Ce que je n'ai pas pu trancher (à faire valider par Fable)

1. **`sortieJauge`** est un gène neuf au lieu de `bordJauge` (le partage casserait `GARDES`). Autre voie : permettre plusieurs gardes par réel (`GARDE_DE` vers
   une liste) ; plus de code, et `reelsLus` change pour tous.
2. **`rienEcart` naît à 0,2 rad** (choix). Autre : 0,3 (plus prudent : ne lâcher que pour un gros gain).
3. **Les lois de secours** : `nitroHaut` 5 m (S1) et `cabre` 0 m (S2) sont mes choix, non mesurés. Le dossier demande d'abord un essai hors course sur des vols
   perdus enregistrés : ces vols sont hors git, anciens, avec des doublons (dossier « Les trous »). Autre : en faire deux gènes (`secoursHaut`, `secoursCabre`)
   gardés par `secoursOn`.
4. **`LOI_PILOTE` fixe** (la décision) plutôt qu'une loi faite des gènes du pilote (`avance:R.volAvance`, `portee:R.volRetour`). Avec la loi fixe, un génome
   qui a muté `volAvance` ou `volRetour` juge son vol sur une loi qui n'est plus la sienne. L'autre voie empêche le partage avec le coup (une place de plus).
5. **Les figures interdites pendant un secours** : un ajout prudent, hors du dossier. Autre : les laisser (le banc dira).
6. **Les compteurs, tranché ici** (§ 4.2) : tout drapeau né à 0 en a un, `coupDecor` et les sept drapeaux de raccourcis nés à 0 compris (25 noms). Ceux nés
   à 1 (`dessousAveugle`, `dessousFuir`, `portailVol`, `volDemiTour`, cinq `raccCartes_*` / `raccJumeau_*`, le choix `dessousDecor`) n'en ont pas : ils
   agiraient dans chaque course de c0025. Autre : leur donner un compteur maintenant (un `declic` presque à chaque vol, des lignes plus lourdes), pour ne
   pas payer une époque le jour où un bras voudra les éteindre.
7. **`loiFidele.desaccord`** compte un désaccord entre deux rayons, pas un ordre changé (la seule exception à la définition du § 4.2). Autre : refaire toute
   la décision « sans la loi fidèle » (beaucoup de code neuf dans une règle qui doit rester inerte). Le vrai effet se lit par `f`.
8. **La map imposée n'impose que la première map** (`continuite.js` l.201). Pour un gène de la grotte, f ne monte pas jusqu'à 1 : il monte à la part de
   course jouée à la grotte. Voie future, moins chère qu'on ne croirait : le jeu a déjà `dbgBancCarte(c,m)` (`code/economie/aura-banque-contrats.js`
   l.94-101), qui repose `SF.force` à chaque portail. L'utiliser ne touche pas au jeu, seulement à `piloter.js` ou `jeu-reel.js` : une époque des yeux. Hors lot.
9. **Le banc v2 : des graines neuves à chaque vague** (le témoin est rejoué à chaque vague). Autre : une plage commune à toutes les vagues, le témoin joué une
   seule fois (moins cher, mais des vagues corrélées). Et la futilité seulement à partir du 2e regard (le sacre l'applique dès le 1er).
10. **Le banc d'étude n'est pas dans git** : je n'ai pas relu `jouer.js` ni `analyser.js`. Le v2 ne réutilise rien de lui. « Identique » y est défini par
    `empreinte` et `empreinteTouches` (§ 6.5) ; le dossier cite coupOn identique 37 fois sur 59, ce qui laisse penser que le banc d'étude ne comptait pas
    non plus `empreinteVues`. L'intégrateur le vérifiera quand la mesure en cours sera finie.
11. **Comment Sacha changera `chancePalierMin`** : pas d'outil dans ce lot (§ 2.4). L'outil devra tout renommer (témoin compris) ou repartir par
    `--repartir-de`, et `genomeTemoin` devra rendre la même valeur. Proposition : une option `--chance N` d'`evoluer.js`, maître arrêté, qui réécrit les
    vivants, renomme et le dit dans le journal ; ou une clé de config lue par `genomeTemoin` et `reparer`, avec un départ neuf. À décider avec lui.
12. `alarmeDistance` (0,011) : la distance divise par 129 gènes au lieu de 121 (−6 %). À remesurer si l'alarme sonne, comme au portage.
13. Avec `relacheOn` et `rienOn` ensemble, la nitro du relâché peut tenir au début d'un vol passé à `rien` (bornes : `relacheT` jusqu'à 0,45, `tenirFacon` dès
    0,1). Non mesuré, laissé tel quel.
14. **`rienOn` une fois par vol, après deux vues de suite** : mon choix contre le zigzag. Autre : deux vues de suite seulement (plusieurs passages par vol).
15. **La famille « décor »** du bras `sortie` (`roche`, `paroi`, `pic`, `glace`) vient des causes citées au dossier (l.37) ; l'auteur de la vague v001 doit
    relire la liste des causes de la grotte dans `code/gameplay/mort.js` avant de la figer. Autre critère : la mesure `poseCentre`.
16. **Le « net-aide » à confirmer** par une seconde vague (§ 6.5) : coûte une vague de plus par idée retenue. Autre : se contenter du premier « net » et de
    l'avertissement « biaisé par l'arrêt ».
17. **Les tâches à carte refusées dans l'état de la sélection** (§ 5) : une protection par le dossier. Autre : mettre la carte dans la clé de tous les
    lecteurs (mesure-tau, note), ce qui touche à `note.js`, hors lot.

---

## Relecture du contrat (28/11/2026)

Trois relecteurs ont attaqué la première version : « éteint = c0025 au bit près » et la migration, « chaque gène fait-il ce qu'il dit », « le banc et
la sélection ». Pour chaque défaut, j'ai relu la preuve dans le code (`ddca156d8`), puis corrigé le contrat ou dit pourquoi le défaut ne tient pas.
Vérifié par des lectures : la recherche `BORNES.length!==86` (0 à `ddca156d8`, 1 à `e2ea8d2c9`), les naissances de tous les drapeaux de `BORNES`
(`node -e`), `o.modele` présent dans les trois genome.js épinglés, `tenuPose` déclaré `let` (l.375), `LONGS` (l.330), `vaut` (l.341-353), l'engagement du
raccourci (l.263-290), `resultatCompact` et l'essai d'enfant.js, `generation.test.js` l.123, `dbgBancCarte`. Aucune course, aucun code écrit.

### Angle « au bit près » et migration

| # | défaut | gravité | ce qui a changé |
|---|---|---|---|
| 1 | la preuve v:1 de gestes.test.js g2 saute en silence (elle lit `HEAD`) | sérieux | § 8 : le code d'avant **épinglé** (`e2ea8d2c9` v:1, `7f9543955` v:2, `ddca156d8` v:3) ; un SAUTE = un échec ; g2 épingle `e2ea8d2c9` (§ 8.1) ; v2 = la chaîne complète, même `idDe` et mêmes décisions |
| 2 | un genome.js copié écrit son pilote avec le **nouveau** modele.js | sérieux | § 8 : la forme obligée `ecrirePilote(g,{cfg, modele:<ancien texte>})` et le garde-fou (pas de `chancePalierMin`, `palierMin:12}` en dur) |
| 3 | m6 de genes-muets va du nouveau vers l'ancien : impossible avec un v:4 | sérieux | § 8.1 : m6 réécrit dans l'autre sens (mutants de l'ancien, migrés ; même `idDe`, mêmes décisions) |
| 4 | `generation.test.js` fige `v===3` et n'est dans aucun lot | sérieux | § 9 : dans le lot (a) ; `Gn.VERSION`, id gardés, `pop.temoin`, `dejaVus`, un 3e état source en v:3 (§ 8.1, § 8.5 point 6) |
| 5 | `R.volRetourOn` n'existe pas : un compteur gardé ainsi ne part jamais | sérieux | § 3 (règle commune) et § 4.2 : colonne « garde exacte » (`R.volRetour>0`, `R.retours.length>0`…) ; test v5 bis : chacun des 25 noms se déclenche |
| 6 | un compteur qui lève rend l'ordre vide (piloter.js) : la course change | sérieux | § 4.1 : tout compteur dans `if(COMPTE){try{…}catch(e){}}` ; v5 : 3 000 suites tirées au hasard, zéro erreur de plus |
| 7 | la migration est sans retour pour le Ryzen | sérieux | § 7 : copier `etat\` et `champions\` avant le premier lancement ; revenir = remettre la copie ; § 1 point 10 |
| 8 | la règle ne parle que de `m` ; `teteSol` écrit le tampon `OS` | mineur | § 4.1 : la liste de ce qu'un compteur n'appelle jamais, et des fonctions pures permises |
| 9 | rien sur mesure-tau et l'arbre | mineur | § 7 : ils lisent v:2 et v:3 ; la bascule coupe environ λ enfants ; le verdict n'est pas remis à zéro |
| 10 | changer `chancePalierMin` change aussi l'id du témoin | mineur | § 2.4 et § 10.11 : tout renommer ou repartir, et `genomeTemoin` doit suivre |
| 11 | une retouche future d'un compteur = une époque ; `DECLICS` peut dériver | mineur | § 4.1 (le prix futur), § 4.2 (la liste tranchée, complète), test v1 dans les deux sens |
| 12 | la course de 45 s ne voit pas la seconde chance | mineur | § 8.1 v3 bis : `profilSha` de c0025, c0101 et des 200 mutants ; `palierMin` entier égal à 12 ; § 8.3 le dit |
| 13 | le bout de code de `auSol` n'était pas gardé | mineur | § 4.3 : la forme exacte `if(COMPTE&&R.sortieOn>0&&m.cSortie!=null){…}` |

### Angle « chaque gène fait-il ce qu'il dit »

| # | défaut | gravité | ce qui a changé |
|---|---|---|---|
| 14 | `secoursOn` presque muet : les rayons courts `libre` bloquaient, et c'est l'instant de la toupie | sérieux | § 3.4 : seules les façons de `LONGS` comptent, rayons absents sautés, long `libre` bloque ; la règle se lit après la bascule ; § 1 point 5 ; tests v4 |
| 15 | `sortieOn` allumait la nitro au sol d'un raccourci engagé | sérieux | § 3.1 : `&&!m.sortie` ; § 3.6 ligne raccourci ; test v4 |
| 16 | le choix du départ pouvait partir en plein vol après `plane` | mineur | § 3.1 : `m.choix=true` au départ en `plane` ; § 3.6 ligne retourOn ; test v4 |
| 17 | `tenuPose` laissée périmée alors que c'est du code neuf | mineur | § 3.2 et § 3.4 : `tenuPose` = le rayon de la façon prise (inerte pour c0025) ; ce n'est plus un point ouvert du § 10 |
| 18 | `m.planeBord` survivait à une annonce contraire | mineur | § 3.1 : remis à `null` à chaque vue au sol où la règle est fausse ; test v4 |
| 19 | `rienOn` sans hystérésis : allers-retours possibles | mineur | § 3.2 : deux vues de suite (`m.rienVu`) et une fois par vol (`m.rienFait`) ; § 10.14 |
| 20 | un coup de nitro lancé continuait dans « rien » ou un secours | mineur | § 3.2 et § 3.4 : `m.coupFin=null` ; § 3.6 corrigé |
| 21 | `loiFidele` 1 change aussi les figures | mineur | § 3.3 : ajouté à ce qui change ; test v4 |
| 22 | `coupDecor` classé à tort parmi les nés à 1 ; `loiFidele.juge` compte un désaccord | mineur | § 4.2 : compteur `coupDecor` ; le nom devient `loiFidele.desaccord` et le dit (§ 10.7) |

### Angle « le banc et la sélection »

| # | défaut | gravité | ce qui a changé |
|---|---|---|---|
| 23 | un critère « compteur » vaut 0 chez le témoin par construction | bloquant | § 6.4 : interdit en critère principal (code 1), gardé en mesure secondaire ; le bras `sortie` passe sur les causes de décor |
| 24 | « identique » avec `empreinteVues` donne f ≈ 1 aux bras qui demandent des lois | sérieux | § 6.5 : identique = `empreinte` et `empreinteTouches` ; test b5 |
| 25 | huit drapeaux nés à 0 sans compteur | sérieux | § 4.2 : `coupDecor`, `raccCartes`, `raccJumeau` ; 25 noms partout |
| 26 | la reprise ne revérifie ni les pilotes ni la note | sérieux | § 6.7 `plan.json` et § 6.8 : tout refabriqué et comparé à chaque lancement (code 4) ; test b8 |
| 27 | ce qu'autorise un « net » ; l'écart gonflé par l'arrêt ; le cumul des vagues | sérieux | § 6.5 « Ce qu'autorise un net » : candidat, vague de confirmation, `dPremier`, « biaisé par l'arrêt », secondaires « non corrigées », compte des faux « net » dans INDEX.md |
| 28 | le jeu remplace en silence une carte inconnue | sérieux | § 5 : pourquoi (et le hasard décalé) ; ligne non mesurée ; banc code 2 ; § 8.5 point 4 : les 6 cartes |
| 29 | `generation.test.js` et l'outil des courses à carte laissés à personne | mineur | § 9 lot (a) ; § 8.5 point 3 : l'intégrateur écrit l'outil, par `ord.demander` avec `carte` |
| 30 | puissance surestimée ; b6 trop facile ou fragile | mineur | § 6.5 : 75 % à 1,0 palier ; b6 : δ ≈ 0,25 σ et 75 % ± 3, faux « net » ≤ 5,5 % avec borne basse sous 5 % |
| 31 | numéro sans borne haute ; unicité locale ; preuve modulo seule | mineur | § 6.4 et § 6.6 : 1..50 000, INDEX.md commité, numéro 0 pour l'essai, second argument par la taille ; test b3 |
| 32 | `l.cause` efface la première mort (seconde chance) | mineur | § 4.4 : `causesMorts` (lot b) ; le critère `causes` le lit (§ 6.4) |
| 33 | bras égal au témoin accepté ; un regard qui lirait trop de lignes | mineur | § 6.3 : refus ; § 6.5 : le regard `j` ne lit que ses `n_j` graines ; tests b4, b7 |
| 34 | la sélection n'est protégée des courses à carte que par habitude | mineur | § 5 point 1 : `une(t)` refuse une carte dans l'état de la sélection ; § 10.17 |
| 35 | poids des lignes ; ordre de la reprise sur le Ryzen ; banc et sélection ensemble | mineur | § 4.4 (le poids et τ), § 7 (identité, revalidation, génération), § 6.5 (pas de banc sur le Ryzen pendant la sélection). Les noms courts des compteurs : **ne tient pas tout à fait** ; c0025 n'écrit que `{}`, et des noms lisibles valent mieux pour le portfolio ; je garde les noms |
| 36 | débit non mesuré ; `dbgBancCarte` oublié | mineur | § 6.5 : débit à mesurer à la vague d'essai (§ 8.5 point 7) ; § 10.8 : `dbgBancCarte` comme voie future |
| 37 | `--carte` et `tmax` mal lus ; « pas de carte » sous trois formes | mineur | § 5 points 1 et 4 : une seule mise en forme ; `--carte` lu par son nom ; test du lot (b) |

Rien n'a été écarté en entier. Une seule réserve : le n° 35, sur les noms courts.
