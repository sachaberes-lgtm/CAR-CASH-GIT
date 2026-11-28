# Le lot « gènes v4 », lot (a), premier temps : le génome v:4 et les règles (28/11/2026)

Contrat : `notes/genes-v4.md` (§ 2, § 3, § 8.1, § 9 lot (a)). Les choix laissés ouverts par l'architecte sont pris tels qu'il les a retenus
(décision de la session principale). Ce premier temps n'écrit **aucun compteur** : ni `COMPTE`, ni `DECL`, ni `tic`, ni le champ `declic`.
Rien dans `code/`, `VERSION PRINCIPALE/`, `ml/bot/`, `ml/reel/` ; ni `enfant.js`, ni `courses.js`, ni `commun.js`, ni `banc/`. Aucun commit.

## Ce qui est fait

**`genome.js`** (hors de l'époque)
- `GENES_V4` (les 8 gènes du § 2.1, dans cet ordre, en fin de `BORNES` après `PORTAGE`) ; `ORDRE_V4` ; `N_V3 = 121`, `CLES_V3`.
- `chancePalierMin` porte `fige:true` (le seul ; un contrôle au chargement le vérifie). `muter` le saute **avant tout tirage** ; `croiser` prend celui du
  premier parent **sans tirage** ; `reparer`, `valider`, `distance` le traitent en entier ordinaire.
- `GARDES` : `sortieOn → [sortieT, sortieJauge]`, `rienOn → [rienEcart]` (12 drapeaux, 33 réels ; contrôle à 33).
- `VERSION = 4` ; contrôles : 129 gènes, 91 réels.
- `migrer` : v:1, v:2 ou v:3 aux clés exactes → v:4 (les gestes si v:1, le portage si v:1 ou v:2, les gènes v4 toujours, à leur naissance), en place.
- `valider` : « attendu 4, ou 1 avec ses 86 gènes, ou 2 avec ses 107, ou 3 avec ses 121 ».
- `shaGenome` : `v4ANaissance` ; gènes v4 à la naissance → la forme d'avant (v:1 / v:2 si le portage est à sa naissance, sinon v:3 et ses 121 clés) ;
  sinon v:4 entier. **c0025 = `19e3767cc346`, c0101 = `f70ddcb5a565`** (vérifié).
- `genomeTemoin` : `chancePalierMin` lu dans le texte du témoin (`chance:{prend:1,palierMin:(\d+)}`), sinon il lève « … a change (chance:{prend:1,palierMin:N}
  introuvable) » ; les 7 autres naissent à leur naissance (branche `ou:'R'`).
- `bloc` : les 8 clés après le portage, avant `volNitro:0`.
- Exports : `GENES_V4, ORDRE_V4, CLES_V3, N_V3, DECLICS` (les 25 noms du § 4.2, dans l'ordre du tableau, figés).

**`modele.js`** (dans l'époque : l'époque des courses change)
- `PROFIL` **sous la balise**, `chance:{prend:1,palierMin:REGLAGES.chancePalierMin}` (mêmes clés, même ordre : à 12, même `profilSha`).
- `I_FIDELE`, `LOIS_SECOURS` (S1 `nitro:3,nitroHaut:5` ; S2 `cabre:0`), `RETOURS_AVANT`, `I_SECOURS`, `N_SECOURS`, `RETOURS_DEMANDES` (§ 3.3, § 3.4) :
  tout éteint, c'est `REGLAGES.retours` lui-même ; `coupOn` seul, `REGLAGES.retours.concat(COUP_LOIS)` comme avant. `REGLAGES.retours` n'est jamais touché.
- `sortieOn` au sol (après `bordOn`, avant `m.facon=null;m.nFigVol=0;`) et au décollage (après `m.choix=false;`, avant les gestes), avec `!m.sortie`,
  `m.planeBord` remis à `null` quand la règle est évaluée et fausse, `m.choix=true` au départ en `plane`.
- Au décollage, seulement gène allumé : `m.rienVu=null;m.rienFait=null;` (rienOn), `m.secoursVol=false` (secoursOn).
- `loiFidele` : `rFid` en tête de `if(Y){` ; le choix du départ et `rayonDe` lisent `rFid` pour `versRoute` ; 2 = juste après `FACONS[m.facon](v,m)`.
- `rienOn` puis `secoursOn`, dans cet ordre, après la bascule et avant le contact de `lacheOn` (§ 3.6).
- Les figures : `&&!(R.secoursOn>0&&m.secoursVol)` en fin de condition.
- 27 lignes de repère `/* COMPTEURS : ici (…) */` (liste plus bas).

**Tests** (`ml/evolution/tests/`)
- `genes-v4.test.js` (nouveau) : v1 (sans le sens « chaque nom a son tic »), v2, v3, v3 bis, v4 (chaque gène, et leurs croisements cités au contrat),
  v6. 18 tests, environ 75 s.
- `vues-genes-v4.js` (nouveau, un module, pas un test) : les vues partagées par `genes-v4.test.js` et `genes-muets.test.js` (les suites de
  portage.test.js recopiées, et 41 suites pour les gènes v4).
- `etat-v3-ddca156d8/` (nouveau) : un état en génome v:3 **écrit par le code de `ddca156d8`** (voir « Écarts »).
- Mis à jour : `genome.test.js` (comptes, ligne `REGLAGES` du témoin) ; `gestes.test.js` (v:4, 129 gènes ; **g2 épinglé à `e2ea8d2c9`**, il ne saute plus,
  et un git absent le fait échouer) ; `portage.test.js` (p1 : le portage aux index 107 à 120 ; p3/p4 : ordres comparés sans `declic` ; p4 : un SAUTE
  devient un échec ; `v===Gn.VERSION`) ; `genes-muets.test.js` (m1 : 12 et 33 ; m2-m3 : les suites v4, et « tout allumé » allume aussi `secoursOn` et
  `loiFidele` 2 ; m5 : 36 % ; **m6 récrit dans l'autre sens**, mutants de `ddca156d8` migrés) ; `generation.test.js` (`Gn.VERSION`, troisième état
  source en v:3, mêmes identifiants avant et après la migration, `pop.temoin = 19e3767cc346`, `dejaVus` gardé).
- `integration.test.js` : rien à changer (il lit déjà `Gn.VERSION` et `Gn.BORNES.length`) ; il passe.

## Les preuves

- « Éteint = au bit près » : (v3) le témoin v4, le pilote de `ddca156d8` écrit avec **son** `modele.js` et `pilote-voltige.js` : 806 décisions sur
  320 suites, identiques ; de même pour c0101 et `c0101-pilote.js` ; 200 mutants v:3 (31 600 décisions). (v2) 200 mutants de chacun des trois genome.js
  épinglés (`e2ea8d2c9`, `7f9543955`, `ddca156d8`) : migrés, mêmes identifiants, mêmes décisions que l'ancien pilote. (v3 bis) la même main
  (`profilSha`), `palierMin` entier 12. Le fichier écrit à la main n'a pas le contrôle des rayons : il est comparé sur les mêmes vues sans les rayons
  `retour<i>` (le pilote de `ddca156d8` l'est sur toutes, « YEUX CHANGES » compris).
- « Allumé = change, et seulement ce qu'il faut » : (v4) pour chaque gène, la suite qui le déclenche et celles qui ne doivent rien changer (§ 8.1 v4),
  dont : le raccourci engagé (ville), l'annonce contraire, la fenêtre de 0,35 s, `retourOn` et le choix du départ, le coup arrêté par `rien` et par le
  secours, les figures jugées sur `rien` ou sur le fidèle, le tableau des places sur 8 combinaisons, `retourPrime` jamais lu par un secours.
  `genes-muets` (m2, m3) : `sortieT`, `sortieJauge`, `rienEcart` muets gène éteint, actifs gène allumé.
- Une vraie course (une seule, 90 s, graine 910037 : grotte puis jade) : c0101 avec les 4 gènes v4 allumés (`loiFidele` 2) : 0 erreur du cerveau,
  0 « YEUX CHANGES », 0 panne.
- Les tests rapides, lancés un par un (commun, graines, note, genome, tableau, lanceurs, generation, robustesse, machine, machine-relecture, traces,
  relecture-traces, gestes, integration, portage, node-epoque, mesure-tau, validation-sequentielle, genes-muets, genes-v4) et
  `genome.js --essai-reparer 10000` : tous passent, aucun SAUTE, **sauf `traces.test.js`** : 86 contrôles sur 87, le contrôle « arbre : chaque gène
  du génome a un mot simple » nomme les 8 gènes v4. Ce sont les `MOTS` d'`arbre.js`, que le contrat (§ 9) donne à l'intégrateur : il passera quand
  l'intégrateur les aura écrits.

## Ce qui s'écarte du contrat (ou le précise)

1. **`etat-v3-ddca156d8`** : il n'a pas été écrit par de vraies courses. L'arbre de `ddca156d8` (`ml/`, `code/`, `VERSION PRINCIPALE/`) a été tiré par
   `git archive` dans un dossier temporaire hors du dépôt, et **son propre** `generation.test.js` y a été lancé (faux ordonnanceur, aucune course) :
   le cas `compat-c` (etat-e93ff5cb5 relu par ce code, puis une génération) est l'état copié ici (population.json, generations.jsonl, morts.jsonl,
   validations.jsonl, coffre.jsonl ; sans les courses fabriquées). C'est bien le code de `ddca156d8` qui l'a écrit (génomes v:3).
2. **v1, le sens « chaque nom de `DECLICS` a son `tic` »**, `RACC_CARTES_0` / `RACC_JUMEAU_0`, v5 et v5 bis : à l'agent des compteurs (rien n'est
   écrit). Le sens « chaque `tic` du texte est dans `DECLICS` » est en place (il passe à vide).
3. **« un rayon long absent est sauté »** : le contrat le teste avec « viser sans cible » ; un `retour<i>` absent au milieu n'existe pas (les yeux les
   rendent consécutifs depuis 0, `controleRayons` lève sinon). Le test passe par un **vol voulu** (raccourci engagé au sol, ville) sans cible : `viser`
   et `viserPlane` sont alors des façons longues permises, absentes ; le secours part quand même.
4. **La forme exacte du § 4.3** (`if(COMPTE&&R.sortieOn>0&&m.cSortie!=null){…}` « en tête de `auSol`, avant le bloc du départ ») : à cet endroit, `R`
   n'est **pas encore déclaré** (`const R=REGLAGES` vient après le départ, dans la même fonction) : `R.sortieOn` y lèverait une ReferenceError (zone
   morte temporelle), pour **tous** les pilotes. Il faut écrire `REGLAGES.sortieOn` là (le repère le dit).
5. `rienOn` : `ok` est forcé en booléen (`!!q`, `!!r0`) ; même sens.
6. `secoursOn` : quand deux lois de secours se posent avec le même `vaut`, la première (S1) est gardée (`>` strict) ; le contrat ne le dit pas.
7. `PROFIL` : la balise est passée juste après le commentaire de l'en-tête (l.47), `PROFIL` juste sous elle, avec un commentaire daté entre les deux.

## Pour l'agent des compteurs

Règles du contrat (§ 4.1) : tout dans `if(COMPTE){try{…}catch(e){}}`, n'écrire que `DECL` et `m.cSortie`, n'appeler que des fonctions pures (`vaut`,
`sauve`, `avecNitro`, `poseNette`, `estRetour`, `cl`, `rayonDe`) ; jamais `teteSol`, `versRoute`, `FACONS.*`, `controleRayons`, `teteRayon`, `raccourci`.
Chaque repère est **avant** la ligne qui change la valeur : lire l'ancienne valeur là. Les variables locales disponibles à chaque repère :

| repère (texte du commentaire) | fonction | variables disponibles |
|---|---|---|
| sous la balise (`const COMPTE`, `DECL`, `tic`) | module | `REGLAGES`, `G`, `WV`, `WS`, `PROFIL` ; aussi `I_FIDELE`, `I_SECOURS`, `N_SECOURS` plus bas |
| raccJumeau | `raccourci(v,sortir,kGain)` | `R`, `S`, `mieux`, `nom`, `X`, `r` (le rayon examiné), `gain`, `axe`, `t` ; le score `s` vient **après** (l.168) : le refaire en locales |
| sortieOn.pose (en tête de `auSol`) | `auSol(v,m)` | `v`, `m` seulement : **`R` n'existe pas encore**, lire `REGLAGES.sortieOn` |
| suitOn | `auSol` | `R`, `m.ligne` (l'ancienne), `v`, `vit`, `max`, `m.tPose` |
| slalomOn | `auSol` | `zActif`, `lache`, `couloir`, `u` |
| libreOn | `auSol` | `libre`, `k`, `seuil`, `mTenir`, `sur`, `m.nitro` (l'ancienne, avant la ligne), `decor`, `kSeuil`, `force`, `lIci`, `lmax`, `margeV`, `lache`, `pose` |
| bordOn | `auSol` | `m.nitro` (avant la ligne), `decor`, `lache`, `tn`, `jauge` |
| sortieOn (au sol) | `auSol`, dans `if(ok){` | `m.nitro` (avant `m.nitro=true`), `ok`, `decor`, `tn`, `jauge` ; `B`, `Y`, `ri`, `vr`, `pl` sont dans le bloc d'au-dessus (hors de portée) |
| retourOn.reacteur et dessousNitro (raccourci engagé) | `auSol`, dans `if(m.sortie){` | `tient`, `tetu`, `m.sortie.facon`, `m.nitro`, `permis`, `recuperable` ; l'ordre est rendu par le `else return` qui suit |
| dessousNitro (dessous, au bord) | `auSol` | `S`, `dec`, `g9`, `d9`, `c9`, `q9`, `m.nitro` |
| raccCartes (et retourOn.reacteur) | `auSol` | `rc` (le raccourci), `m.vu`, `sortir`, `kGain` ; l'engagement est dans le `else if(rc){` suivant |
| volRetourOn | `versRoute(v,nitro,m)` | `R`, `p`, `lat`, `axe`, `portee` (la valeur voulue ; refaire avec 40) ; `o.volant` est écrit à la ligne suivante |
| sortieOn.vol (et `m.cSortie=v.t`) | `enVol(v,m)`, bloc du décollage | `m.facon` (vaut `'plane'`), `m.planeBord` (pas encore remis à null), `v.t` |
| sortieOn.pose (chaque vue de vol) | `enVol` | `m.cSortie`, `v.t`, `R` ; avant `if(Y){` |
| retourOn (choix du départ) | `enVol`, dans `if(!m.choix&&R.retours.length&&…)` | `b9`, `s9`, `m.facon` (avant le changement) |
| loiFidele.desaccord | `enVol` | `rFid`, `Y` (le rayon `versRoute` du radar : `Y.find(x=>x&&x.m==='versRoute')`), `mien`, `m.facon`, `loi`, `tenu`, `depuis` |
| fuirVite et volMieux | `enVol` | `mien`, `patience`, `sMien`, `fuit`, `pourMieux`, `depuis`, `m.facon` (avant la bascule) ; compter après la bascule si `m.facon` a changé |
| rienOn | `enVol`, dans le `if(ok&&m.rienVu…)` | `q`, `r0`, `ok`, `m.facon` (vaut déjà `'rien'`) |
| secoursOn | `enVol`, dans `if(pris){` | `pris`, `ryPris`, `sPris`, `longs`, `meurent` |
| loiFidele.suit | `enVol`, dans `if(c){` | `c` (la commande fidèle), `o.volant`, `o.manche` (ceux de versRoute, avant la ligne) |
| lacheOn | `enVol` | `o` (avant `o.volant=0`), `m.tContactAbs`, `m.facon` |
| relacheOn | `enVol` | `o.nitro` (avant), `m.nitroDecol`, `f.t` |
| largeOn | `enVol`, dans le bloc de la figure | `parentOk`, `large`, `tenuPose`, `nMax`, `tSeuil` |
| coupOn (coup en cours) | `enVol`, dans `if(R.coupOn>0){` | `m.coupFin`, `o.nitro` (avant) |
| coupOn et coupDecor (le coup part) | `enVol`, dans le `if(bonne(r0)&&…){` | `r0`, `r1`, `b`, `air`, `t1`, `o.nitro` (encore faux), `v.carte` (`DECOR[v.carte]`) |
| suitOn.ensuite | `enVol`, dans `if(R.suitOn>0&&tenuPose&&…){` | `bord`, `tenuPose` ; `o.ensuite` est écrit à la ligne suivante |
| decide | `module.exports.decide` | `vue`, `m`, `o` |

Pièges vus en codant :
- `R.volRetour>0` (pas `R.volRetourOn`), `R.retours.length>0` (pas `R.retourOn`) : le tableau du § 4.2 a la bonne garde.
- Au repère `sortieOn` au sol, la condition `ok` est calculée une ligne plus haut : le compteur ne compte que si `m.nitro` était faux.
- `rienOn` et `secoursOn` remettent `m.coupFin=null` si `coupOn` : un coup en cours s'arrête là (le compteur `coupOn` du coup en cours ne part donc pas).
- Les suites de `tests/vues-genes-v4.js` déclenchent déjà `sortieOn`, `sortieOn.vol`, `rienOn`, `loiFidele.suit`, `secoursOn` : elles peuvent servir à v5 bis.

## Les compteurs (lot (a), second temps, 28/11/2026)

Contrat : § 4 (les noms, les gardes, la règle d'écriture) et § 8.1 (v1 dans les deux sens, v5, v5 bis). Aucune règle n'a changé : les compteurs sont
des lignes ajoutées sous les repères `/* COMPTEURS : ici (…) */` (gardés, 27), jamais une ligne de règle réécrite. Aucun commit.

**`modele.js`**
- Sous la balise (après `PROFIL`) : `const COMPTE=true;`, `let DECL=null,AV=null,JUM=null;`, `function tic(nom)` (ajoute sans doublon),
  `RACC_CARTES_0={jade,grotte,canyon}`, `RACC_JUMEAU_0={nuages,espace,grotte,canyon}`.
- `decide` : `DECL=null;` en premier ; `if(DECL)o.declic=DECL;` juste avant `return o;`. Rien n'a agi : pas de champ.
- 28 blocs `if(COMPTE){try{…}catch(e){}}` (un seul a une autre tête, celui du § 4.3 :
  `if(COMPTE&&REGLAGES.sortieOn>0&&m.cSortie!=null){try{…}catch(e){}m.cSortie=null;}`), 28 `tic('…')` pour les 25 noms. Chaque garde est celle de la
  colonne « garde exacte » du § 4.2 (`R.volRetour>0`, `R.retours.length>0`, `R.raccCartes[v.carte]!==0`, `R.raccJumeau[v.carte]`…), écrite dans le `try`.
- Ce qu'un compteur écrit : `DECL`, `m.cSortie` et deux brouillons de module, `AV` et `JUM` (voir « Écarts »). Ce qu'il appelle : `sauve`, `avecNitro`,
  `cl`, `Y.find`, `X.rayons.find`, `Math.*`. Jamais `teteSol`, `versRoute`, `FACONS`, `controleRayons`, `teteRayon`, `raccourci`, `retourDe`.

| nom | « a vraiment agi », tel qu'il est calculé |
|---|---|
| `volRetourOn` | dans `versRoute`, le volant avec `portee` diffère du même calcul à 40 m |
| `retourOn` | choix du départ : `b9` existe et diffère de `m.facon` |
| `retourOn.reacteur` | raccourci engagé (ordre rendu) ou engagement : `!m.nitro`, terme `tetu` faux, `avecNitro(f)` ≠ `f==='plane'` |
| `volMieux`, `fuirVite` | la bascule a changé la façon, et la condition de la bascule sans leur terme était fausse (calculée avant elle, dans `AV`) |
| `dessousNitro` | raccourci engagé : `tetu`, `!m.nitro`, nitro de la façon fausse ; dessous au bord : `c9&&q9.att<=4&&!m.nitro` |
| `lacheOn` | la condition de la règle est vraie et `o.volant!==0` |
| `slalomOn` | `zActif` |
| `coupOn` | un coup en cours rend `o.nitro` vraie (elle était fausse) ; ou un coup part |
| `coupDecor` | un coup part sur une map à décor (`R.coupDecor>0`) |
| `relacheOn` | la condition de la règle est vraie |
| `suitOn` | la règle s'applique et la nouvelle `m.ligne` diffère de l'ancienne |
| `suitOn.ensuite` | `ensuite.ligne` calculée n'est pas 0 |
| `bordOn` | la condition de la règle est vraie et `m.nitro` était faux |
| `largeOn` | une figure part avec `parentOk` faux |
| `libreOn` | `m.nitro` calculée avec `libre` diffère de celle calculée avec `libre` faux (`k`, `mTenir`, `sur` refaits) |
| `raccCartes` | un raccourci s'engage sur jade, grotte ou canyon, gène allumé, **hors sortie du dessous** (`!sortir`) |
| `raccJumeau` | sur nuages, espace, grotte ou canyon : un rayon écarté par la jumelle avait un score plus haut que le rayon retenu (ou rien n'est retenu) |
| `sortieOn`, `sortieOn.vol`, `sortieOn.pose` | la nitro allumée par la règle (elle était fausse) ; le vol parti en `plane` ; la 1re vue au sol à 0,25 s au plus de la dernière vue de ce vol |
| `rienOn`, `secoursOn` | la façon vient de passer à `rien` / à un secours |
| `loiFidele.desaccord` | façon `versRoute`, rayon fidèle et rayon du radar présents, `sauve` différent |
| `loiFidele.suit` | la commande fidèle diffère du volant ou du manche de `versRoute` |

**`genome.js`** : la liste `DECLICS` ne change pas (25 noms, dans l'ordre du § 4.2) ; seul son commentaire est mis à jour.

**`tests/compteurs.test.js`** (nouveau, sans course, environ 4 min 40 : chaque décision passe par le bac, trois fois). Trois textes du même pilote :
le vrai, le même avec `const COMPTE=false;` (substitution), le même où `tic` **lève** (un compteur dont le calcul casse). Ils doivent rendre, décision par
décision, les mêmes ordres (`declic` retiré) et les mêmes erreurs.
- (c1) `DECLICS` et les `tic('…')` du texte, dans les deux sens ; `tic(` n'est appelé qu'avec une chaîne ; `RACC_CARTES_0` / `RACC_JUMEAU_0` recalculés
  depuis `BORNES`.
- (c2) la règle d'écriture, lue dans le texte (commentaires ôtés) : chaque `tic` est dans un bloc `if(COMPTE…){try{…}catch(e){}}` ; aucun appel interdit
  dans un bloc ; un bloc n'écrit que `DECL`, `AV`, `JUM`, `m.cSortie` ou ses propres constantes ; ni `++` ni `--` ; hors des blocs, aucune règle ne lit
  `DECL`, `AV`, `JUM`, `cSortie`, `RACC_*_0`.
- (c3) v5 bis : une suite par nom (25), gène allumé : chaque nom se déclenche ; sur les mêmes suites, le génome de naissance n'émet rien.
- (c4) v5 sur les suites fixes (portage, gènes v4, celles de c3) : les 26 gènes nés à 0 seuls (`loiFidele` 1 et 2, `coupDecor` avec `coupOn`), tout allumé
  (`loiFidele` 1, puis 2), c0101 + tout, c0101, c0025 : 30 938 décisions, 504 erreurs (les mêmes dans les trois textes), 4 042 avec `declic` ; c0025 : 0.
- (c5) v5 sur 3 000 suites tirées au hasard (graine 20261128 ; vues de l'inventaire et des suites perturbées : champs supprimés ou nuls, rayons nuls ou
  absents, issues tirées, cibles, lois en trop qui font « YEUX CHANGES ») pour c0025, c0101, tout allumé (`loiFidele` 1 et 2) ; 1 000 pour c0101 + tout ;
  100 par gène seul : ordres identiques, mêmes erreurs ; c0025 n'émet jamais `declic` ; chaque `declic` est un tableau non vide de noms de `DECLICS`,
  sans doublon. Au hasard, 22 noms sur 25 se déclenchent d'eux-mêmes (c3 couvre les 25).
- Une vraie course (une seule, 90 s, graine 910037, grotte) : c0101 avec tous les drapeaux nés à 0 allumés et `loiFidele` 2, par `enfant.js --essai`
  (l'enveloppe du lot b) : erreurs 0, pannes 0 ; `declenchements` = lacheOn 10, loiFidele.suit 6, raccCartes 5, retourOn 7, slalomOn 274, suitOn 48,
  suitOn.ensuite 128, volMieux 1, volRetourOn 31.

### Écarts au contrat (et pourquoi)

1. **Deux brouillons de module, `AV` et `JUM`**, en plus de `DECL` et `m.cSortie`. `volMieux` et `fuirVite` comptent « si la façon change » : il faut la
   façon d'avant la bascule et la condition sans leur terme, calculées avant elle et lues après ; une variable déclarée dans un `try` n'est pas visible
   au bloc suivant. `raccJumeau` compare le meilleur rayon écarté au rayon **retenu**, connu seulement à la fin de la boucle de `raccourci`. Les deux
   sont remis à `null` à chaque usage, écrits et lus seulement dans les blocs (c2 le vérifie) : aucune règle ne les lit.
2. **`retourOn.reacteur` et `dessousNitro` (raccourci engagé)** : le repère était entre le `}` du `if` d'abandon et son `else return` : rien ne peut s'y
   écrire. Le bloc est placé **avant** ce `if`, et la condition d'abandon y est refaite en locales (fausse : l'ordre du raccourci est rendu). Le repère
   y a été déplacé.
3. **`raccCartes` exige `!sortir`** : en sortie du dessous, `permis` est vrai sans le gène ; le raccourci se serait engagé quand même. C'est la définition
   du § 4.2 (« a vraiment agi »), plus stricte que la colonne « compte quand ».
4. Le repère sous la balise citait mot pour mot `const COMPTE=true;` : il est reformulé, pour que la substitution du test ne trouve la phrase qu'une fois.
5. Le sens « chaque nom de `DECLICS` a son `tic` » et `RACC_CARTES_0` / `RACC_JUMEAU_0` (§ 8.1 v1) sont dans `compteurs.test.js`, pas dans
   `genes-v4.test.js` (dont le v1 garde le sens « chaque `tic` est dans `DECLICS` » et le compte des repères).
7. `genes-v4.test.js` (v3) exigeait « aucun `declic` » aussi pour c0101 ; avec les compteurs, c0101 en porte (bordOn, fuirVite, largeOn, libreOn : le
   § 8.1 v3 dit « sauf les anciens gènes allumés »). Une ligne retouchée : le contrôle ne vaut plus que pour c0025 ; les ordres de c0101 restent comparés
   sans le champ, ses noms sont contrôlés par `compteurs.test.js`. 18/18 ensuite.
6. Le texte où `tic` lève n'est pas joué pour c0025 (aucun `tic` n'y est appelé) ni pour les 100 suites par gène seul (le temps) ; il l'est partout ailleurs.

### Ce qui reste à l'intégrateur

- `identite.test.js` (c0101 v4 IDENTIQUE à `c0101-pilote.js`, avec l'enveloppe et les `declic`), `evoluer.test.js`, `courses.test.js` : non lancés (consigne).
- Les noms se lisent dans les lignes de course par `declenchements` (lot b) ; `sortieOn.vol − sortieOn.pose` = les sorties préparées qui finissent mal.

## Relecture « sémantique » (28/11/2026, le relecteur « chaque gène fait ce que dit le contrat, et rien d'autre »)

Relu ligne par ligne dans `modele.js`, contre le § 3 et la « Relecture du contrat » : `sortieOn` (sol et décollage), `rienOn`, `loiFidele` 1 et 2,
`secoursOn`, `RETOURS_DEMANDES`, la garde des figures. Les pièges listés sont évités : `m.sortie` et `m.voulu` intouchés, `!m.sortie`, `m.planeBord`
remis à `null` (règle fausse au sol, et au décollage), `m.choix=true` au départ en `plane`, `tenuPose` posé par `rien` et par le secours, le coup
arrêté (`m.coupFin=null`), les seules façons longues comptées (absent sauté, long `libre` bloque), `R.retours.length` jamais touché, au plus 4 lois
(les 10 combinaisons vérifiées), pas de figure en secours, pas de `prime()` sur un `retour<k>` de secours (un `retourPrime` NaN ne change rien).

**Une correction** (marquée `(28/11, le relecteur « semantique »)` dans `modele.js`) : `rienOn` « deux vues de suite » ne l'était pas toujours.
`m.rienVu` survivait à une vue où la règle n'est pas évaluée. Suite finie qui le montre (tenirFacon 0,1) : `rienVu` posé sur `versRoute` à 30,1 ; à 30,2
la bascule prend `versRoutePlane` (la règle attend tenirFacon) ; à 30,3 « rien » partait, sur **une seule** vue de la façon tenue. Désormais, gène
allumé, une vue où la règle n'est pas évaluée (façon `rien`, pas une loi de retour, tenirFacon pas passé) ou une vue de vol sans radar remet
`m.rienVu` à `null`. Éteint : rien n'est lu ni écrit (c0025 inchangé ; genes-v4, compteurs et les autres tests rapides repassent).

**Les vues finies du relecteur** (`ml/evolution/essais/relecture-v4-sem/vues.js`, hors git, 68 contrôles, mémoire du pilote visible) : pour chaque
gène, le cas qui le déclenche, au moins trois voisins qui ne doivent rien changer (ordres égaux au témoin), et les paires du tableau du § 3.6
(sortie+rien, sortie+secours, sortie+retourOn, sortie+bordOn, sortie+relacheOn, rien+secours, rien+loiFidele, rien+coupOn, rien+lacheOn,
rien+suitOn, rien+volMieux, loiFidele+coupOn, loiFidele+secours, secours+coupOn, secours+largeOn, secours+fuirVite, les quatre ensemble).

**Les vraies courses** (une à la fois, 120 s, `--carte grotte --tenue`, pilote = c0025 + le gène) : toutes sans erreur du cerveau, 0 panne,
0 « YEUX CHANGES ».

| gène | courses | déclenchements |
|---|---|---|
| `loiFidele` 1 | 910037 | desaccord 6 |
| `loiFidele` 2 | 910037 | desaccord 5, suit 61 |
| `secoursOn` | 910037 | 3 |
| `rienOn` | 910037 (deux fois), 4000037 | 0, 0, **1** |
| `sortieOn` | 910037, 910148, 4000037 à la grotte ; 4000074 à la jade et au canyon | **0 dans les cinq** |

- **`sortieOn` ne se déclenche jamais en course.** Un pilote de diagnostic (le même, plus des `tic` qui comptent chaque étage de la règle) montre
  que tout passe (map à décor, bord à moins de 0,7 s, jauge, rayon du bord présent : 26 à 42 vues par course) sauf la combinaison demandée :
  sur 117 vues du bord (les cinq courses), **`rien` au choc, `versRoute` au choc et `plane` qui se pose n'apparaît pas une fois**. Quand `versRoute` meurt,
  `plane` meurt aussi (choc, air) ; quand `plane` se pose, `versRoute` se pose en général aussi. Ce n'est pas une faute de code (la règle est celle du
  § 3.1) : c'est la règle qui est presque vide. À trancher par Fable avant une vague du banc (par exemple « `plane` se pose et `versRoute` ne se pose
  pas proprement », ou le seul `rien` au choc) ; changer la règle = une époque, donc avant la fusion.
- **`rienOn` est rare à sa naissance** : sur 58 vues où `rien` se pose propre (deux courses de diagnostic), l'écart d'axe à la façon tenue dépasse 0,2 rad 2 fois, entre 0,1 et 0,2
  une fois ; le plus souvent `rien` est **plus** de travers (44 sur 58). Il agit (1 course sur 3), mais un bras `rien` du banc aura un `f` faible.
- `loiFidele.suit` compte presque chaque vue en `versRoute` (61) : la commande des yeux est arrondie à 0,01, celle de `versRoute` non ; c'est la
  définition du § 4.2, mais le compteur ne dit presque rien. `loiFidele.desaccord` dit, lui, quelque chose (5 et 6).
- À savoir (conforme au contrat, non corrigé) : une façon de secours `retour<k>` est `estRetour` ; `rienOn` et `volMieux` peuvent donc la quitter
  plus tard dans le vol (jamais à la même décision), et `m.secoursVol` reste vrai : plus de figure jusqu'à la fin du vol.

## Relecture « bit-près » (28/11/2026, le relecteur « éteint = comme avant » et la migration)

Les tests des auteurs n'ont pas été crus : la preuve est refaite par un autre chemin, dans `ml/evolution/essais/relecture-v4-bit/` (hors git :
`preuve.js`, `enregistrer.js`, `fabriquer.js`). Les vues ne sont **pas fabriquées** : ce sont les vues de **quatre vraies courses** (une à la fois),
gardées telles que piloter.js les donne au cerveau (le texte `C.texte`, NaN, -0 et `undefined` compris), puis rejouées dans l'ordre, mémoire neuve, à
l'ancien pilote (le `genome.js` de `ddca156d8` **avec son** `modele.js` ; de même `e2ea8d2c9`, `e93ff5cb5`) et au pilote d'aujourd'hui. Les courses :
c0025 v4 à 910037 (45 s, 450 vues), c0101 v4 à 910148 (120 s, grotte puis jade, 1 200 vues), c0101 + les quatre gènes v4 à 910148 carte grotte (120 s,
grotte puis espace, 1 200 vues, rayons `retour0..2`), c0025 + les quatre gènes v4 à 910074 (120 s, nuages puis jade, 1 200 vues). Ordres comparés au
caractère près (texte JSON du bac), erreurs aussi.

**Résultat : 36 contrôles, 0 échec** (relancé sur le `modele.js` corrigé par le relecteur « sémantique » : même résultat).
- **Au bit près** : c0025 v4 = c0025 de `ddca156d8` = `pilote-voltige.js` (1 650 décisions sans rayon de loi ; 4 050 avec, les « YEUX CHANGES » aux
  mêmes vues) ; c0101 v4 = c0101 de `ddca156d8` = `c0101-pilote.js` ; **200 mutants v:3 faits par l'ancien `muter`/`croiser`** (drapeaux tirés à 12 %
  pour en allumer : 4,2 drapeaux nés à 0 allumés en moyenne, 9 au plus) : 202 500 décisions par pilote, toutes égales, `profilSha` égaux ; les 20
  premiers sur les 4 050 vues ; 30 mutants v:1 (`e2ea8d2c9`) et 30 mutants du code du Ryzen (`e93ff5cb5`), chacun avec son modèle : égaux.
- **Les identifiants** : c0025 `19e3767cc346`, c0101 `f70ddcb5a565`, et les six témoins de `TEMOINS` (c0026 à c0087 aussi) ont le même id avec l'ancien
  et le nouveau code ; 60 mutants v:1, 60 v:2 (`7f9543955`), 60 v:2 (`e93ff5cb5`), 200 v:3 : même id avant et après la migration (et sans migrer),
  valeurs et têtes gardées, gènes v4 à leur naissance. Un gène v4 hors de sa naissance (chacun des 8, `loiFidele` 1 et 2, chez c0025 et c0101) donne
  18 ids tous différents. c0101 (portage allumé) se hache bien sous la forme `{v:3, 121 clés}`.
- **Les états** : `tests/etat-v2-ancien`, `tests/etat-e93ff5cb5`, `tests/etat-v3-ddca156d8` et **le dernier état du Ryzen**
  (`origin/evolution-ryzen`, 26 vivants v:2) : chaque vivant migre en v:4 sous l'id que lui donne l'ancien code, le témoin reste `19e3767cc346` ; les 26
  vivants du Ryzen décident comme le code `e93ff5cb5` (26 700 décisions). `generation.test.js` (trois états sources, une génération chacun) : 16/16.
- **`chancePalierMin`** : 20 000 `muter` (phases A, B, C ; drapeaux et entiers tirés à coup sûr ; `genes` 100 et `sigma` 1) ne le touchent jamais, et la
  suite des tirages est la même qu'il vaille 12 ou 8 (aucun tirage pour lui) ; `croiser` prend celui du premier parent et consomme exactement 128 + 2
  tirages ; `valider` refuse 0, 31, 12,5 et `reparer` rend 1, 30, 13 ; le pilote de naissance a `profil.chance.palierMin` = **12, un nombre entier**, et
  le même `profilSha` que `pilote-voltige.js` et `c0101-pilote.js` ; à 8, la main reçoit 8 (autre `profilSha`). L'urne des réels de c0025 est celle de
  `ddca156d8` (58 réels, même ordre).
- **Les compteurs** : `const COMPTE=false;` substitué une fois dans le texte : mêmes ordres (sans `declic`) et mêmes erreurs pour c0025, c0101, les
  quatre gènes v4 (loiFidele 1 et 2), tous les drapeaux nés à 0, et 40 mutants v:4 du nouveau `muter` ; c0025 n'émet jamais `declic` ; chaque `declic`
  vu est sans doublon et dans `DECLICS`.
- **Les vraies courses** (une à la fois) : le témoin v4 de naissance contre `pilote-voltige.js`, 910037, 45 s : les trois empreintes égales
  (`c4b906ba0a4f`, `ce4f5618595e`, `1c50ca469a55`), avant et après la correction « sémantique » ; c0101 v4 **avec l'enveloppe et un `declic`**
  (`fuirVite` 1) contre `c0101-pilote.js`, 910148, 120 s : les trois égales (`ba8347603eb4`, `5556167b98dc`, `4ca26b117f92`).

**Corrigé** : une seule ligne, l'en-tête de `genome.js` disait encore « { v:3, A:{121 gènes…} } ». Aucun défaut de code trouvé dans `genome.js` ni dans
les tests de migration. **Vu en passant** (pour l'intégrateur, déjà relevé par le relecteur « sémantique ») : dans les deux courses à gènes v4 allumés,
`sortieOn` ne s'est pas déclenché une fois. Les tests rapides, relancés un par un : tous à 0, sauf `traces.test.js` (86/87, les `MOTS` d'`arbre.js`
pour les 8 gènes v4, à l'intégrateur).

## Amendement du 28/11 : `sortieOn` réécrit après la mesure des décollages (l'auteur de l'amendement)

La décision de la session principale, appliquée telle quelle (contrat `notes/genes-v4.md` § 3.1 bis, qui remplace le § 3.1 ; l'étude :
`ml/ecurie/etude/sortie-preparee/LISEZ-MOI.md`, parties 8 et 9).

- **L'impasse** : la sortie préparée par les rayons du bord est muette par construction. La règle du § 3.1 ne s'est jamais déclenchée (0 fois en
  40 courses à carte tenue) ; les yeux ne voient aucune issue aux 24 décollages mortels ; le bord est annoncé 0,28 s avant le décollage (médiane), la
  main met 0,2 s ; « plane » au bord se serait crashé dans 57 vols posés.
- **`modele.js`** : `sortieOn` devient la nitro au décollage sur les maps à décor, le pendant de `bordOn` : au sol, même garde qu'avant (décor, pas de
  raccourci engagé, route qui lâche, ni dessous, ni glisse, ni rebond, `tn.t < sortieT`, jauge > `sortieJauge`), **sans lire les rayons du bord** ;
  au décollage, plus de `m.facon='plane'` ni de `m.choix=true` : seulement le compteur `sortieOn.vol` et `m.planeBord=null`. Le compteur
  `loiFidele.suit` a un seuil de 0,01 sur le volant (le manche reste exact). `genome.js` : un commentaire ; `DECLICS` inchangé (25 noms).
- **Le tableau des compteurs plus haut** (`sortieOn.vol` « le vol parti en `plane` » ; `loiFidele.suit` « la commande fidèle diffère ») est remplacé :
  `sortieOn` = la nitro allumée au sol par la règle, **à chaque vue** où elle agit (comme `bordOn` : la route qui lâche recoupe `m.nitro` à chaque vue) ;
  `sortieOn.vol` = un vol subi décollé moins de 0,35 s après l'annonce ; `sortieOn.pose` = la première vue au sol après ce vol, sans trou ;
  `loiFidele.suit` = le volant suivi à plus de 0,01 de celui de « vers la route », ou un manche autre. `(vol − pose) / vol` = la part de ces
  décollages qui finissent mal (mesure secondaire, jamais un critère).
- **Les interactions** (§ 3.6) : `bordOn`, `libreOn`, `largeOn` et `dessousNitro` exclusifs ; un raccourci engagé passe avant (rien ne change) ;
  `relacheOn` tient la nitro au début du vol (l'effet voulu, testé) ; `retourOn` fait son choix du départ comme sans le gène (testé) ; `coupOn` sans
  lien dans la décision (dans le jeu, le coup est armé par un décollage nitro allumée : non mesuré).
- **Éteint = comme `7f85efb38`** : même décision au bit près (voir `notes/LIVRAISON-GENES-V4.md`, § 2 quater) ; le texte du pilote change (nouvelle
  époque, de toute façon due à ce lot). `rienOn` et `rienEcart` ne changent pas.
