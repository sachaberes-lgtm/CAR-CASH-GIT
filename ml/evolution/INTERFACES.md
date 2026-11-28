# ml/evolution — LE CONTRAT DES MODULES (27/11/2026)

> Ce fichier **fait foi** pour les signatures, les formats et les écrivains de fichiers. Il précise `ml/ecurie/agents/tmp-voltige/evolution-etude/SPECIFICATION.md`
> (ci-dessous « la spec ») et applique ses amendements du 27/11 (loi « retour » dans le génome dès la v1, contrôle des rayons d'après yeux.js).
> Un module qui doit s'en écarter **corrige d'abord ce fichier** et le dit dans son compte rendu.
> Rien ici n'a tourné. Node pur (v24), sans dépendance, sans Internet. Noms et commentaires en français, commentaires `/* … */` seulement.

## 0. Règles communes à tous les modules

- **Chemins** : toujours `path.join` ; la racine du dépôt est `path.join(__dirname,'..','..')`, le jeu `path.join(RACINE,'VERSION PRINCIPALE')` (une espace).
  Les chemins de config.json sont relatifs à `ml/evolution/` (`commun.chemin(cfg, rel)`).
- **Fichiers écrits** : en **LF**, en UTF-8. JSON entier : écriture **atomique** (`.tmp` + `rename`, `commun.ecrireAtomique`). JSONL : une ligne JSON + `\n`
  ajoutée par `fs.appendFileSync` (`commun.ajouterLigne`) ; une ligne tronquée en fin de fichier est **ignorée** à la lecture (`commun.lireJsonl`).
- **Processus** : `child_process.fork` uniquement (pas de `spawn('node')`, pas de shell) ; `os.setPriority(pid, os.constants.priority.PRIORITY_BELOW_NORMAL)` sur
  chaque enfant quand `cfg.prioriteBasse`.
- **Hasard** : jamais `Math.random` dans `ml/evolution/` (hors bac, il marcherait mais casserait la reprise). Tout tirage passe par un `Rng` (§ 2.5).
- **Horloge** : `Date` seulement pour les dates des journaux, les durées et le battement ; jamais dans une décision de sélection.
- **Erreurs** : une fonction lève `Error` avec un message en français qui commence par le nom du module (`'genome : borne inconnue « x »'`).
  Une ligne de commande qui échoue écrit le message sur stderr et sort avec le code 1 (2 = refus de partir : verrou, labo, boucle.js).
- **Ne jamais** modifier `ml/bot/*`, `ml/ecurie/*`, `ml/labo/*` (seule exception future : l'étape 9, une ligne de `labo.js`, faite à la main par Sacha) ;
  ne jamais lancer `ml/ecurie/boucle.js`, `chaine.js`, `ml/bot/verifier.js`.
- **Bruit normal** au chargement du jeu, à ne pas traiter comme une erreur : `preambule: Unexpected token`, `hub : accueil TypeError`.

### Le module ajouté : `commun.js` (écart à la spec § 3, voulu)
Les onze modules ont tous besoin des mêmes six fonctions ; les recopier, c'est six façons d'écrire un fichier à moitié. Il est **pur outillage**, sans état.

```js
const C=require('./commun');
C.RACINE                         /* chemin absolu du depot */
C.DOSSIER                        /* chemin absolu de ml/evolution */
C.lireConfig(fichier?)           /* -> cfg : config.json, puis `fichier` (relatif au cwd, sinon a ml/evolution) fusionne par-dessus
                                    (objets en profondeur, tableaux et scalaires remplaces) ; cfg._fichier = le chemin du second fichier ou null.
                                    Leve si un fichier est illisible ou si `format` n'est pas 'evolution-config-1'. */
C.chemin(cfg, rel)               /* -> chemin absolu de rel (relatif a ml/evolution) */
C.ecrireAtomique(fichier, texte) /* mkdir -p, ecrit fichier+'.'+pid+'.tmp', rename. texte : string (LF exige : leve si '\r' present) */
C.ajouterLigne(fichier, objet)   /* mkdir -p, appendFileSync(JSON.stringify(objet)+'\n') */
C.lireJsonl(fichier)             /* -> tableau d'objets ; [] si absent ; ignore une derniere ligne illisible, LEVE sur une ligne illisible au milieu */
C.lireJson(fichier, defaut?)     /* -> objet ; defaut (ou leve) si absent */
C.sha1(texteOuBuffer)            /* -> 40 hex */
C.semaineIso(date)               /* -> 'AAAA-SS' (semaine ISO 8601, ex. '2026-48') */
C.vivant(pid)                    /* -> bool (process.kill(pid,0) ; EPERM = vivant) */
```

---

## 1. Qui écrit quel fichier (un seul écrivain par fichier)

| Fichier (dans `cfg.dossierEtat`, par défaut `ml/evolution/etat/`) | Écrivain unique | Lecteurs |
|---|---|---|
| `population.json` | `evoluer.js` | tableau.js, etat.js, inscrire-champion.js |
| `courses-AAAA-SS.jsonl` (l'ensemble = « courses.jsonl ») | `courses.js` (le module, dans le processus de evoluer.js ; ou sa ligne de commande dans SON `--etat`) | evoluer.js, note.js (par données), tableau.js, etat.js |
| `pilotes/<shaPilote12>.js` | `courses.js` (avant la première course d'un pilote, s'il manque) | humains, inscrire-champion.js |
| `generations.jsonl`, `validations.jsonl`, `morts.jsonl`, `coffre.jsonl` | `evoluer.js` | tableau.js, etat.js |
| `verrou.json` | `evoluer.js` | evoluer.js (second lancement), etat.js |
| `tableau.html`, `resume.txt` | `tableau.js` (appelé par evoluer.js en fin de génération, ou en ligne de commande ; écriture atomique, contenu dérivé) | humains, etat.js (resume.txt) |
| `STOP`, `PAUSE` | Sacha / `arreter.cmd` (création) ; `evoluer.js` efface `STOP` à sa sortie propre, jamais `PAUSE` ; `lancer.cmd` lancé à la main efface un `STOP` qui traîne (on veut que ça tourne) | evoluer.js, etat.js |
| `ARRETE` (ajout, dév. 5) | `arreter.cmd` le crée ; `lancer.cmd` lancé à la main l'efface. evoluer.js ne le lit pas | `lancer.cmd auto` (la tâche planifiée) : présent → ne lance rien ; etat.js |
| `sortie.log` | `lancer.cmd` (redirection) | humains |
| `cfg.dossierChampions/gNNNN-<shaPilote8>.js` + `.json` | `evoluer.js` | noter.js (à la main), inscrire-champion.js |
| `config.json` | à la main, **seulement** (27/11 au soir : ~~`evoluer.js --banc` y réécrit `travailleurs`~~ ; le banc écrit `machine.json`, § 9.1) | tous |
| `machine.json` (§ 9.1) | `evoluer.js` (le banc : au premier lancement sur un PC, ou `--banc`) | `commun.lireConfig` (résout `travailleurs:"auto"`), etat.js (ligne 3) |
| `arbre.html`, `histoire.md` (§ 9.2) | `arbre.js`, `histoire.js`, appelés par `tableau.ecrire` (donc par evoluer.js en fin de génération) ou en ligne de commande ; contenu dérivé, atomique | humains |
| `traces.log`, `traces.log.ancien` (§ 9.2) | `sauver-traces.cmd` (redirection ; au-delà de ~1 Mo, l'ancien est mis de côté) | humains |
| `PAS-D-ENVOI` (§ 9.2) | Sacha (création) ; personne ne l'efface | `sauver-traces.cmd` : présent → commit local, pas d'envoi |

Une seule évolution par dossier d'état : c'est le verrou (§ 3.9). `identite.js` n'écrit **rien** dans l'état (ni cache, ni pilotes).
`ml/labo/` : seul `inscrire-champion.js` y écrit, par l'API de `labo.js`, à la main.

---

## 2. Les modules

### 2.1 `enfant.js` — une course, un processus neuf

Copie du bloc `--enfant` de `ml/bot/noter.js` (lignes 27-37). N'est **jamais** requis par le maître : il est forké.

**Message reçu** (un seul, par `process.on('message')`) :
```js
{ source:'<texte du pilote, LF>', fichier:'evolution.js', graine:910037, tmax:900, regime:'allege', complet:false }
```
**Ce qu'il fait** : `J=ouvrir({regime})`, `C=charger(fichier,{source})`, `r=course(J,C,graine,{tmax})` (ni `carte` ni `meteo` : la graine tire la map),
puis `process.send(resultat, ()=>process.exit(0))`.

**Message rendu** (≈ 1 Ko) — le RÉSULTAT COMPACT :
```js
{ graine:910037, palier:7, pieces:445, survie_s:147.8, cause:'roche', morts:1, vols:10,
  pannes:0, erreurs:0, derniereErreur:null, cerveau_ms_moy:0.41, yeuxTirages:0,
  mesures:{nitro:.29,nitroSol:.32,…15 cles de ressemblance.MESURES…} | null,
  jeu:'cashcar-v512', jeu_sha:'1a2b3c4d5e6f', simulateur:'relief-canyon', node:'v24.22.3',
  empreinte:'5bfbea965d13', empreinteVues:'65c11298fa1a', empreinteTouches:'<sha1(JSON.stringify(r.touches)) 12 hex>',
  nom:'evolution', ms:63000,
  complet: undefined | { bilan, partie, touches } }      /* seulement si complet:true (inscrire-champion.js) : lourd */
```
Correspondances : `palier,pieces,cause,vols,pannes,erreurs,derniereErreur,cerveau_ms_moy,yeuxTirages,empreinte,empreinteVues,ms` = mêmes clés de `r.bilan` ;
`survie_s = r.bilan.duree_s` ; `morts = r.bilan.morts_en_vol` ; `mesures = ressemblance.mesuresPartie(r.partie)` (null sous 60 s, ou si elle lève : alors
`mesures:null` et `derniereErreur` inchangée) ; `jeu=J.version`, `jeu_sha=J.sha`, `simulateur=J.simulateur`, `node=process.version`.

**Erreur de chargement** (`charger` lève : texte invalide, profil refusé…) : envoie `{graine, erreurFatale:'<message>'}` puis `process.exit(2)`.
Aucune autre sortie sur stdout (le maître forke avec `silent:true` et ne garde que les 600 derniers octets de stderr).

**Ligne de commande** (essai manuel seulement) : `node ml/evolution/enfant.js --essai <pilote.js> <graine> [tmax=45]` → joue une course dans CE processus et
écrit le résultat compact sur stdout (une ligne JSON). Exporte `{resultatCompact(r,J,C,graine)}` pour les tests.

### 2.2 `courses.js` — l'ordonnanceur, le cache, l'époque

```js
const K=require('./courses');
K.epoque(cfg)                       /* -> Epoque (§ 3.10). Lit les fichiers, aucun ecrit. Leve si un fichier manque. */
K.cle({shaPilote,graine,tmax},ep)   /* -> 'shaPilote40|graine|tmax|jeu_sha|simulateur|node|ep.courses' (la cle du cache, § 3.3) */
K.lireCourses(dossierEtat)          /* -> toutes les lignes de courses-*.jsonl, fichiers tries par nom, ordre d'ecriture garde */
K.creer({cfg, epoque, dossierEtat, cache:true, ecrire:true, travailleurs, journal:fn(texte), doitArreter:fn()->bool, enPause:fn()->bool})
  /* -> Ordonnanceur ; dossierEtat par defaut C.chemin(cfg,cfg.dossierEtat) ; cache:false = rejouer meme ce qui est connu (identite.js) ;
        ecrire:false = n'ecrire ni ligne ni pilote (identite.js). Lit le cache UNE fois a la creation (Map cle -> lignes). */
ord.demander(taches)                /* taches : [{source, shaPilote, id, graine, tmax, usage, generation}] -> Promise<Ligne[]> dans l'ordre des taches */
ord.arreter({dur:false})            /* plus aucun lancement ; attend les enfants en cours (dur:true : les tue, SIGKILL) -> Promise */
ord.enCours()                       /* -> nombre d'enfants vivants */
ord.stats()                         /* -> {jouees, cache, nonMesurees, relancees, tuees, ms} depuis la creation */
```
Règles de `demander` :
1. Pour chaque tâche : si le cache a une ligne `mesuree:true` de même clé → elle est rendue telle quelle (pas de course).
   Sinon, si le cache a déjà **2** lignes `mesuree:false` de même clé → la dernière est rendue (pas de troisième essai, la reprise reste déterministe).
   (27/11, le correcteur, § 8 : un échec d'environnement — chien de garde, enfant mort, pannes, autres fichiers — ne compte que dans le lancement qui l'a écrit.)
2. Sinon la tâche entre dans la file ; au plus `travailleurs` enfants à la fois ; l'ordre de lancement est l'ordre des tâches.
3. Avant le premier lancement d'un `shaPilote`, écrit `pilotes/<shaPilote12>.js` s'il manque (si `ecrire`).
4. Un enfant sans message depuis `cfg.chienDeGarde_s` (1 200 s) est tué : ligne `mesuree:false, raison:'chien de garde'`.
   Un enfant qui sort sans message : `raison:'processus fini sans resultat (code …) <fin de stderr>'`. `erreurFatale` : `raison:'chargement : …'`.
5. Le résultat passe `note.pourquoiEcartee(res, epoque)` ; non nul → `mesuree:false, raison`.
6. Une tâche non mesurée est **relancée une fois** (deuxième ligne, `essai:2`) ; le résultat rendu est la dernière ligne.
7. Chaque ligne est ajoutée à `courses-<semaineIso(maintenant)>.jsonl` **dès** la fin de sa course (si `ecrire`), puis gardée dans le cache mémoire.
8. `doitArreter()` vrai : plus de lancement, les tâches non lancées sont rendues `null` ; `enPause()` vrai : pas de lancement tant qu'il l'est.
9. Un résultat dont `derniereErreur` contient `'YEUX CHANGES'` est rendu normalement ; c'est evoluer.js qui arrête tout (§ 2.10).

**Ligne de commande** : `node ml/evolution/courses.js <pilote.js> [--graines 12] [--depart 910000] [--tmax 300] [--travailleurs 4] [--etat essais/etat-courses] [--config f.json]`
→ graines `depart + 37·i`, usage `'essai'`, `id` = `'fichier:'+basename` ; écrit dans `--etat` (défaut `essais/etat-courses`, jamais `etat/`), imprime une ligne
par course (graine, palier, survie, cause, mesurée/raison, « cache » si rendue du cache) et le résumé (palier moyen, survie moyenne). Code 0 si toutes mesurées.

**Précisions du développeur 1 (27/11, écrites après coup, ce qui est codé et testé)** :
- `K.epoque(cfg, o?)` : `o.tolererManquants` (défaut faux) compte `'absent'` pour un fichier de l'époque qui manque au lieu de lever. Seuls la ligne de commande
  et les tests de l'étape 1 le passent (ils tournent avant que modele.js n'existe) ; evoluer.js et identite.js ne le passent jamais.
- Ligne de commande, options en plus : `--chien N` (remplace `cfg.chienDeGarde_s`), `--epoque f.json` (une époque figée lue d'un fichier : les tests, pour qu'un
  modele.js retouché pendant le test ne change pas la clé), `--bavard` (tout le journal). Elle imprime aussi `course : lancee graine G pid P essai E` à chaque lancement.
  Ctrl+C : plus de lancement ; second Ctrl+C : `arreter({dur:true})`, code 1.
- **Reprise** : à `creer` (si `ecrire`), une ligne tronquée en fin d'un `courses-*.jsonl` est mise de côté dans `<fichier>.fragment-<date>` puis **coupée** du
  fichier (sinon la ligne suivante s'y collerait et deviendrait une ligne illisible au milieu, qui fait lever `lireJsonl`). `.gitignore` : `etat/*.fragment-*`.
- Une clé demandée deux fois (même `demander` ou deux appels en même temps) ne se joue qu'une fois : les deux tâches reçoivent le même objet `Ligne`.
- Une relance (`essai:2`) passe en tête de file. L'essai d'une clé qui a déjà **une** ligne `mesuree:false` dans le cache part à `essai:2` (et n'est pas relancé après).
- `arreter({dur:true})` : les enfants tués ne laissent **aucune** ligne (leur tâche rend `null`), comme les tâches non lancées.
- Une ligne rendue du cache porte `_cache:true` **non énumérable** (absent de tout JSON). Une ligne non mesurée porte toujours `graine` et `tmax` (les autres champs du
  résultat `null` s'il n'y en a pas).
- `pilotes/<shaPilote12>.js` est écrit octet pour octet (le texte exact, CR compris s'il en a : `ecrireAtomique` refuserait un `\r`), par `.tmp` + `rename`.
- Le tri : `require('./note').pourquoiEcartee(res, epoque.composants)` ; si note.js manque, une recopie de secours (`K.pourquoiEcarteeSecours`, mêmes règles).
  `ord.trieur` dit lequel (`'note.js'` ou `'secours'`), `ord.epoque` rend l'époque utilisée.
- Exporte en plus : `reparerFins(dossierEtat, journal?)`, `pourquoiEcarteeSecours`, `FICHIERS_EPOQUE`.
- enfant.js sort (code 3) sur `disconnect` : un enfant dont le maître a été tué ne survit pas à sa course.

### 2.3 `genome.js` — le génome

```js
const Gn=require('./genome');
Gn.BORNES                     /* Borne[] (§ 4.1), dans l'ordre d'ecriture ; fige (Object.freeze) */
Gn.CONTINUS                   /* les cles des genes de type 'reel' (64 ; 79 depuis les gestes, § 9.3), dans l'ordre de BORNES : l'urne des mutations */
Gn.TETES                      /* {rayon:{cle:'WV',nIn:36,nH:6,nOut:1,nW1:216,nW2:6}, sol:{cle:'WS',nIn:12,nH:6,nOut:3,nW1:72,nW2:18}} */
Gn.genomeTemoin(cfg)          /* -> Genome : lit REGLAGES dans ml/ecurie/pilote-voltige.js (regex /const REGLAGES=\{[\s\S]*?\r?\n\};/, evalue par vm dans
                                 un contexte vide), les 14 constantes promues aux valeurs du § 4.1 (verifiees : leve « pilote-voltige.js a change » si un des
                                 extraits litteraux du § 5.3 manque), les genes « retour » a leur naissance, les tetes de tirerReseaux(cfg.graineReseaux).
                                 Leve si une valeur du temoin sort de sa borne ou si REGLAGES a une cle absente de BORNES (ou l'inverse). */
Gn.tirerReseaux(graine)       /* -> {WV:number[222], WS:number[90]} : W1 ~ N(0, 1/sqrt(nIn)), W2 = 0 (§ 4.3) */
Gn.muter(genome, rng, o)      /* o : {phase:'A'|'B'|'C', cfg, genes?:entier, sigma?:nombre} (genes/sigma : l'immigre, 8 et .30 ; la generation 0 : 3..6 et .15)
                                 -> {genome:Genome neuf, mutes:[{cle, avant, apres}]} ; l'entree n'est pas touchee (§ 6.2) */
Gn.croiser(g1, g2, rng)       /* -> Genome neuf (§ 6.2) */
Gn.reparer(genome)            /* -> le MEME objet, repare en place (bornes, types, 3 contraintes, arrondis, -0 -> 0) ; idempotent */
Gn.shaGenome(genome)          /* -> 40 hex : sha1 de JSON.stringify({v,A:(cles dans l'ordre de BORNES),WV,WS}) */
Gn.idDe(genome)               /* -> shaGenome(genome).slice(0,12) : l'identifiant d'un individu */
Gn.ecrirePilote(genome, o?)   /* o : {modele?: texte de modele.js (defaut : lu), controleRayons?:true}
                                 -> texte du pilote, LF, pret pour charger() (§ 5). Leve si la balise manque ou est en double. */
Gn.shaPilote(texte)           /* -> 40 hex, sha1 du texte EXACT envoye a l'enfant */
Gn.distance(g1, g2)           /* -> [0,1] : moyenne sur les genes de BORNES de |a-b|/(max-min) (drapeaux et choix : 0 ou 1), tetes non comprises */
Gn.distanceW2(g1, g2)         /* -> moyenne des |dW2| des deux tetes (le tableau, phase B) */
Gn.valider(genome)            /* -> null si conforme, sinon le texte du premier defaut (cle manquante, hors borne, longueur des tetes)
                                 (27/11 au soir, § 9.3) appelle d'abord migrer : un v:1 conforme est migre EN PLACE en v:2 */
Gn.migrer(genome)             /* (§ 9.3) v:1 aux 86 cles de CLES_V1 dans leur ordre -> v:2 en place (les 21 genes des gestes a leur naissance) ;
                                 tout autre genome est rendu tel quel (valider dit son defaut) */
Gn.VERSION, Gn.GESTES, Gn.CLES_V1   /* (§ 9.3) 2 ; les 21 Borne des gestes (fin de BORNES) ; les 86 cles de v:1 */
```
**Ligne de commande** : `node ml/evolution/genome.js --temoin [--ecrire sortie.js]` (imprime le génome témoin en JSON, ou écrit son pilote) ;
`node ml/evolution/genome.js --essai-reparer 10000` (10 000 mutations au hasard, vérifie bornes et contraintes ; code 0/1).

Précisions de l'implémentation (27/11, dév. 2) :
- `BORNES` est construit au chargement avec `cartesTirage` de **config.json** (le fichier de base) ; une fonction qui reçoit un `cfg` dont `cartesTirage`
  diffère lève (les gènes `raccCartes_*`/`raccJumeau_*` ne correspondraient plus).
- `reparer(genome, cfg?)` et `valider(genome, cfg?)` : `cfg` optionnel (pour `bornePoids` ; défaut config.json). `reparer` reconstruit `genome.A` (même
  `genome`, nouvel objet `A` aux clés dans l'ordre de BORNES, clés en trop retirées, clé manquante ou non finie → sa `naissance`) et convertit les têtes en
  tableaux ordinaires ; une tête de mauvaise longueur **lève** (génome incompatible). Contrainte 1 comparée avec une tolérance de 1e-9 (`0.15+0.1` n'est pas
  `0.25` en double). `ecrirePilote` accepte aussi `o.cfg` (pour `retourFige`) et **lève** si `valider` trouve un défaut.
- `muter` : ordre des tirages = le nombre de réels (`poisson`), puis pour chacun `entier` (dans l'urne restante) et `normal` ; puis un `suivant()` par gène
  non réel dans l'ordre de BORNES (`dessousDecor` : un `entier(2)` de plus parmi les deux autres valeurs ; `figMax` : un `suivant()<.5` → −1, sinon +1) ;
  puis la tête de phase B (`suivant()<pTete`, `suivant()<.5` → rayon, sinon sol, les indices par `entier`, puis un `normal` par indice) ; puis celle de
  phase C (même forme, sur W1). `mutes` = la différence complète avant/après `reparer` (une contrainte qui déplace un gène non tiré y figure) ; une tête
  changée y est `{cle:'WV'|'WS', avant:null, apres:null}`. `croiser` passe aussi par `reparer` (un mélange peut violer une contrainte).
- Exporte en plus (outillage des tests) : `CARTES`, `ORDRE_VOLTIGE` (l'ordre des clés de REGLAGES dans pilote-voltige.js), `EXTRAITS` (§ 5.3), `MODELE`,
  `VOLTIGE` (chemins absolus).

### 2.4 `modele.js` — le pilote à trous (texte, jamais requis)

C'est un **fichier pilote**, pas un module Node : il est lu comme texte par `genome.ecrirePilote` et chargé par `piloter.charger` dans le bac.
Contenu : `ml/ecurie/pilote-voltige.js` recopié, avec les retouches de `faire-pR.js` (loi « retour ») **gardées par `REGLAGES.retours.length>0`**,
les 14 constantes branchées sur `G.*`, les deux têtes, le contrôle des rayons, et le bloc `const REGLAGES={…};` remplacé par la ligne seule
`/*@GENOME@*/`. Le détail ligne à ligne est au § 5. `module.exports={nom:'evolution',profil:PROFIL,REGLAGES:REGLAGES,decide:…}`.
Pas de ligne de commande. Pas de `require`, `Date`, `Math.random`, `eval`, `Function` (le bac les refuse).

### 2.5 `graines.js` — le hasard et les graines

```js
const Gr=require('./graines');
Gr.mulberry32(etat)                 /* -> Rng (etat : entier 32 bits non signe). Formule EXACTE :
                                       a=etat|0 ; suivant(): a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a);
                                       t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296 */
/* Rng : { suivant()->[0,1) ; entier(n)->0..n-1 = Math.floor(suivant()*n) ; normal()->N(0,1) = sqrt(-2*ln(1-u1))*cos(2*PI*u2), u1 puis u2, sans cache ;
           poisson(l)-> Knuth (L=exp(-l), k=0, p=1 ; repeter k++, p*=suivant() tant que p>L ; rendre k-1) ; choisir(tableau)->un element ;
           melanger(tableau)->le meme tableau, Fisher-Yates de la fin vers le debut ; etat()->entier non signe a sauver } */
Gr.rngDe(texte)                     /* -> mulberry32(parseInt(sha1(texte).slice(0,8),16)) : les bootstraps (n'usent JAMAIS l'etat du maitre) */
Gr.etatInitial(cfg)                 /* -> EtatGraines : {reserve:[0..n-1], recentes:[], validationK:0, validationRepli:false, validationFinie:false} */
Gr.grainesEntrainement(eg, rng, n, cfg) /* -> {graines:number[n], eg:EtatGraines neuf} : n indices tires SANS remise dans eg.reserve (rng.entier puis splice) ;
                                       reserve vide : retirage avec remise parmi les 1 081, en excluant les graines de eg.recentes (5 dernieres generations) ;
                                       (28/11/2026, lot « regles », M6 ; relu) depuis : reserve vide -> le BLOC suivant de 1 081 indices de
                                       cfg.graines.entrainement.suite (1000021 + 37*j, j < 27 000 000), eg.blocs +1 (absent = 0) ; plus rien :
                                       erreur code GRAINES_EPUISEES (auBout "arret") ; le retirage d'avant seulement si auBout = "rejouer" ;
                                       eg.recentes garde les cfg.graines.exclureRecentes derniers lots. graine = depart + pas*i. */
Gr.grainesValidation(eg, n, cfg)    /* -> {graines, eg, alerte:null|texte} : 1 000 000 + 37*k, k = eg.validationK..+n-1 ; repli (eg.validationRepli) :
                                       950000+37*k, k < 1 081 ; au-dela : graines:[] et alerte, eg.validationFinie=true */
Gr.grainesCoffre(cfg)               /* -> [990000+37*j, j=0..n-1] (n = cfg.graines.coffre.n) */
```
Pas de ligne de commande (sauf `node graines.js --essai` : imprime 3 tirages de démonstration).
Précisions de l'implémentation (27/11, dév. 3) : un lot n'a jamais deux fois la même graine (le retirage avec remise exclut aussi celles déjà prises
dans le lot) ; en repli, une demande qui dépasserait k = 1 080 ne rend **rien** (graines:[], alerte, validationFinie) plutôt qu'un lot incomplet ;
les entrées (`eg`) ne sont jamais modifiées en place.

### 2.6 `note.js` — la note (sans effet de bord)

Entrée commune : des **lignes de course** (§ 4.3) ; seules comptent `mesuree:true`. Toutes les fonctions sont pures ; aucune ne lit ni n'écrit de fichier,
sauf `referenceEpoque()` qui lit l'étalon par `ressemblance.joueurs('clavier')`.
```js
const N=require('./note');
N.pourquoiEcartee(res, ep)       /* -> null | texte. res : resultat compact ; ep : {jeu_sha, version, simulateur, node} (Epoque.composants).
                                    Recopie de noter.js (pannes>0, cause 'panne', jeu_sha nul, autre simulateur, autre jeu_sha, autre version)
                                    + yeuxTirages !== 0 (null compris : « hasard des yeux non mesure ») + node different + erreurFatale. */
N.referenceEpoque()              /* -> REF = ressemblance.reference(ressemblance.joueurs('clavier')) */
N.ajuster(lignes, o)             /* o : {passes:10, retrecir:12, exclure:Set<graine>} ; lignes : entrainement d'une epoque
                                    -> {a:{id:a_p}, ahat:{id:â_p}, b:{graine:b_g}, n:{id:n_p}, se:{id:se_a}, abar, sigmaRes,
                                        survie:{a:{id},b:{graine}}}  (moindres carres alternes § 6.1 : a d'abord, b ensuite, b centre a chaque passe) */
N.ecartFoule(mesures, REF, cfgNote, rng?)
                                 /* mesures : objets de mesuresPartie (null retires) -> {E, seE, ecartClassique, z:{cle:z}, parties}
                                    E = Σ w_k max(0,min(8,|z_k|)-1) / Σ w_k ; moins de partiesMin parties : E = ePire, seE = 0 ;
                                    seE : bootstrap des parties (cfgNote.bootstrapE tirages, rng fourni, sinon rngDe('E')) ; ecartClassique = ressemblance.ecart(…).ecart */
N.noter(lignes, o)               /* o : {REF, cfg (cfg.note), exclure:Set<graine>, ids?:string[]} -> {par:{id:Note}, b, sigmaRes, abar}
                                    Note = {id, n, a, ahat, se_a, survie, E, se_E, F, se_F, ecartClassique, parties} ; F = ahat - poidsEcart*E ;
                                    se_F = sqrt(se_a² + poidsEcart²·se_E²) ; le rng du bootstrap de chaque id : rngDe(id+'|'+nombre de lignes de l'id) */
N.comparer(lignesA, lignesB, o)  /* validation appariee par graine. o : {REF, cfg, tirages:400, rng}
                                    -> {graines:n, dF, se_dF, dPalier, se_dPalier, dE, se_dE, criteres:{a,b,c}, sacre:bool}
                                    sur les graines mesurees CHEZ LES DEUX : dPalier = moyenne(palierA-palierB) ; dE = E_A - E_B (ecartFoule sur les 24 parties
                                    de chacun) ; dF = dPalier - poidsEcart*dE ; se_* = ecart-type sur les tirages (graines tirees avec remise, memes pour A et B) ;
                                    a: dF > seuilSacre*se_dF (cfg.validation.seuilSacre, 2 par defaut ; o.seuilSacre le remplace — § 8, ecart a la spec § 7.6) ;
                                    b: dPalier > -1*se_dPalier ; c: dE < +1*se_dE ; sacre = a && b && c
                                    (28/11/2026, lot « sacre », § 11.1) b et c : -seuilB*se_dPalier et +seuilC*se_dE, o.seuilB/o.seuilC puis
                                    cfg.validation.seuilB/seuilC, 1 par defaut (au bit pres la regle d'avant) */
N.depuisEtude(tableau)           /* courses-0.json de l'etude du bruit -> lignes (§ 4.3) : id = sha du pilote, graine, palier, survie_s = duree_s,
                                    mesures = m, mesuree:true, usage:'entrainement' (pour l'etape 3) */
```
**Ligne de commande** : `node ml/evolution/note.js --etude <courses-0.json>` → les trois contrôles de l'étape 3 (b du lot 930000, fiabilité de â, écart classique) ;
`node ml/evolution/note.js [--config f]` → la note de l'époque en cours sur l'état (lecture seule), un tableau trié par F.

Précisions de l'implémentation (27/11, dév. 3) :
- `ajuster` : au centrage de b, la constante retirée aux b est **ajoutée aux a** (l'ajustement a+b ne change pas ; sans cela les a de la dernière passe
  seraient décalés de la moyenne des b). `sigmaRes = sqrt(Σ résidus² / max(1, N − P − G + 1))` (degrés de liberté du modèle additif, comme l'analyse de
  variance de l'étude : 3,21 sur les 34 × 24 courses). Rend aussi `ahat`, `se`, `n` par id (`se` = se_a).
- `noter`, `comparer`, `ecartFoule` acceptent `cfg` complet ou `cfg.note`. `comparer` : `tirages` par défaut `cfg.validation.bootstrap` (si cfg complet),
  sinon 400 ; `rng` par défaut `rngDe('comparer|'+n)`. Plusieurs lignes mesurées d'un pilote sur une graine : la dernière compte. Aucune graine commune :
  `{graines:0, d*:null, se_*:null, criteres tous faux, sacre:false}`. ΔE et son bootstrap : `ecartFoule` sans bootstrap interne (E seul) ; moins de
  `partiesMin` parties : E = ePire.
- `noter` avec `ids` : un id sans ligne rend `n:0, a:null, ahat:abar, se_a:null, survie:null, E:ePire, se_E:0, se_F:null`.
- **(27/11, le correcteur, § 8)** `ids` = les VIVANTS : `ā` (le centre du rétrécissement, rendu `abar`) est la moyenne des `a` des ids de `ids` qui ont au moins une
  ligne ; sans `ids` (ou si aucun n'en a), la moyenne de tous les pilotes des lignes, comme avant. `ajuster(lignes, {ids})` fait de même.
- **(27/11, le correcteur, § 8)** `ecartFoule` / E : une mesure que `REF` connaît (non nulle) mais qu'aucune partie ne donne compte au pire, `w_k·(borneZ − zoneMorte)`,
  dans Σw ; elle est rendue dans `z` avec la valeur `null`.
- **(27/11, le correcteur, § 8)** `referenceEpoque({recharger:true})` retire ressemblance.js du cache de `require` avant de relire l'étalon (evoluer.js le passe quand
  l'époque des notes change). `pourquoiEcartee` : si `res.fichiers_sha` et `ep.fichiers_sha` existent et diffèrent → `jouee avec d'autres fichiers du bot (…)`.
- `depuisEtude` : `pilote` = sha complet, `id` = 12 premiers caractères, plus `tmax`, `fichier`, `lot` (départ du lot) pour les contrôles.
- Exporte en plus `controlesEtude(tableau, cfgNote, REF, shaVoltige)` → `{pilotes, courses, a, b, c, ok}` (les trois contrôles de l'étape 3 ; la grande
  note de pilote-voltige est reconnue par le sha de `ml/ecurie/pilote-voltige.js`, sinon par le nom `note-voltige4-t900.json`).

### 2.7 `identite.js` — le contrôle d'avant-nuit

```js
const I=require('./identite');
I.verifier({cfg, graines?, tmax?, travailleurs?}) /* -> Promise<{ok:bool, lignes:[{graine, temoin:{empreinte,empreinteVues,empreinteTouches,palier,survie_s},
                                                    voltige:{…memes cles}, identique:bool}]}>
                                                    joue ecrirePilote(genomeTemoin(cfg)) ET le texte de ml/ecurie/pilote-voltige.js, chacun dans un processus neuf,
                                                    par courses.creer({cache:false, ecrire:false}) ; identique = les trois empreintes egales. */
I.verifierW2({cfg})                               /* -> Promise<{ok}> : un genome temoin avec W2 de la tete rayon a 0,5 partout donne une empreinte DIFFERENTE
                                                    sur au moins une des graines (les tetes sont branchees) */
```
**Ligne de commande** : `node ml/evolution/identite.js [--graines 910000,910037,910074] [--tmax 45] [--travailleurs 3] [--w2]` → une ligne par graine, `IDENTIQUE` /
`DIFFERENT (…)`, code 0 si tout est identique. evoluer.js l'appelle (module) au démarrage de chaque époque neuve avant la première génération ; un échec arrête tout.

Précisions de l'implémentation (27/11, dév. 2) :
- Les résumés `temoin`/`voltige`/`w2` portent aussi `vols, erreurs, derniereErreur, mesuree, raison` (une course qui n'a pas volé n'exerce ni la tête RAYON
  ni le contrôle des rayons : 910000 ne vole pas en 45 s). Une ligne non mesurée garde ses empreintes et se compare quand même.
- `verifier`/`verifierW2` acceptent `{graines, tmax, travailleurs, journal}` ; défauts `cfg.identite` puis `min(4, courses)` travailleurs.
  `verifierW2.ok` exige aussi que la course W2 n'ait aucune erreur du cerveau.
- Exporte en plus `jouerTextes({cfg, textes:[{nom, source, fichier?}], graines, tmax, travailleurs?})` → `Promise<{nom:[Ligne|null par graine]}>`
  (courses.creer, cache coupé, rien d'écrit) et `genomeW2(cfg, 'rayon'|'sol', valeur=.5)` (le témoin, W2 de cette tête à `valeur`) : les tests s'en servent.
- `--config f.json` en ligne de commande.

### 2.8 `tableau.js`

```js
require('./tableau').ecrire(cfg)   /* -> {html:chemin, resume:chemin} : relit population.json et les journaux, reecrit tableau.html (SVG en ligne, aucune
                                       ressource externe, s'ouvre en file://) et resume.txt (les 10 lignes de etat.js ; (28/11, § 11.7) puis une ligne
                                       vide et la ligne « Mutations comptent-elles ? ») ; atomique */
```
Sections du tableau : celles de la spec § 8 (coffre ; F/palier/E du meneur et du témoin par génération ; 15 z du champion ; population ; malédiction du gagnant ;
distance génétique et alarme `cfg.alarmeDistance` ; débit, pannes, non mesurées, époque, phase).
**Ligne de commande** : `node ml/evolution/tableau.js [--config f]`.
Ajouts (dév. 5) : `page(cfg, o?)` → le texte HTML sans rien écrire (tests) ; `o.maintenant` (ms) fixe l'heure affichée. Lecture **tolérante** : une ligne illisible
d'un journal est sautée et signalée en alerte (là où `commun.lireJsonl` lève), un population.json tronqué n'arrête rien. Des courses-*.jsonl, seules les lignes du
champion (ses 15 z, par `ressemblance.ecart` sur ses courses d'entraînement mesurées de l'époque) et celles qui portent des pannes sont décodées (filtre sur le texte).
La page porte `<meta http-equiv="refresh" content="300">` (elle se recharge seule) et aucun script.
(27/11 au soir, § 9.2) `ecrire` refait aussi `arbre.html` puis `histoire.md` (chacun dans un `try/catch` : un échec des traces ne fait jamais échouer le
tableau) et rend en plus `traces:{arbre, histoire, erreurs:[…]}` ; l'en-tête porte les liens vers les deux pages et dit que seul `sauver-traces.cmd` envoie
la page (branche `evolution-…`, jamais main).

### 2.9 `etat.js`

```js
require('./etat').resume(cfg)   /* -> string[] (au plus 10 lignes) : generation, phase, epoque ; vivant ou arrete (verrou, battement) ; debit (courses/h sur la
                                    derniere generation) ; champion (id, F, palier, E) ; meneur ; temoin ; dernier coffre (diff palier, E, ecart classique) ;
                                    derniere validation ; non mesurees et pannes de la derniere generation ; alertes */
```
**Ligne de commande** : `node ml/evolution/etat.js [--config f]` → imprime les lignes. Lecture seule.
(28/11/2026, l'intégrateur, § 11.7) `resume` garde ses 10 lignes (la ligne de commande aussi) ; `resumeComplet(cfg, o?)` = ces lignes, une ligne vide,
puis `tauLigne(mesureTau(cfg, o))` : c'est ce qu'écrit resume.txt. `mesureTau(cfg, o?)` (ne lève jamais ; `o.tau` = une mesure déjà faite) et `tauLigne(x)`.
Ajouts (dév. 5) : `resume(cfg, o?)` accepte `o.maintenant` (ms) et `o.donnees` (le rendu de `lire`) ; `lire(cfg, {morts?})` → les données lues (population,
journaux, verrou, STOP/PAUSE/ARRETE, liste des courses-*.jsonl, alertes de lecture) ; `lireConfig`, `chemin`, `args`, `lireJsonlTolerant`, `fichiersCourses`.
Les lignes sont **sans accents** et de 118 caractères au plus (console Windows en page de code 850, et resume.txt). « En marche » = verrou dont le pid vit et dont
le battement a moins de `verrouPerime_s` ; un verrou sans processus = « ARRETE SANS PREVENIR » (alerte). Les pannes de la ligne 9 sont lues dans les deux
derniers courses-*.jsonl (lignes de la dernière génération, filtre sur le texte).
(27/11 au soir, § 9.1) Ligne 3 (Débit) : `… ; 9 a la fois (banc du 27/11)` ; les autres fins possibles : `ecrit dans la config`, `banc a faire`, `sans banc`.

### 2.9 bis Les lanceurs (`lancer.cmd`, `arreter.cmd`, `installer-tache.cmd`) — dév. 5
- Chemins relatifs au fichier (`%~dp0`) ; fins de ligne **CRLF** (`ml/evolution/.gitattributes` : `*.cmd text eol=crlf`), ASCII seulement.
- `lancer.cmd [auto] [options de evoluer.js]` : `cd` à la racine du dépôt, `node ml\evolution\evoluer.js <options> >> etat\sortie.log 2>&1`, rend le code de evoluer.js.
  À la main (sans `auto`) : efface `etat\ARRETE` et `etat\STOP` avant de lancer, puis `pause` à la fin. `auto` (la tâche planifiée) : si `etat\ARRETE` existe,
  écrit une ligne dans sortie.log et sort en 0 sans rien lancer ; `auto` n'est jamais passé à evoluer.js. L'état visé est toujours `etat\` (la config par défaut).
- `arreter.cmd` : crée `etat\ARRETE` puis `etat\STOP` ; attend (au plus 20 min, toutes les 5 s) que `verrou.json` disparaisse ou que son pid ne vive plus ;
  dans ce second cas (arrêt sans prévenir), ou s'il n'y avait pas de verrou, efface `STOP` lui-même (sinon le prochain lancement s'arrêterait aussitôt).
- `installer-tache.cmd [enlever]` : **écart à la spec § 8** (`/sc onstart`) : une tâche au démarrage tourne hors session (compte SYSTEM ou mot de passe stocké).
  Ici : `schtasks /create /tn CashCarEvolution /sc onlogon /delay 0005:00 /tr "\"…\lancer.cmd\" auto" /it` (peut demander les droits d'administrateur),
  `schtasks /create /tn CashCarEvolution-relance /sc hourly /mo 1 /tr "… auto" /it`, `powercfg /change standby-timeout-ac 0` ; tout est expliqué et demandé (O/N) avant.
  Limite connue : Windows coupe une tâche au bout de 72 h (réglage par défaut de schtasks) ; la relance horaire la fait repartir (la reprise ne perd que les courses en cours).
- (27/11 au soir, § 9) `lancer.cmd` : seul le **premier** mot peut être `auto` ; un argument vide `""` est sauté ; `"%ICI%"` entre guillemets (un chemin à
  parenthèses, `CASH CAR (2)`, marche) ; sans `etat\machine.json`, une ligne dit que les premières minutes mesurent le PC ; le message du code 2 cite aussi
  « une option est mal ecrite ». `installer-tache.cmd` pose une **troisième** tâche, `CashCarEvolution-traces` (`/sc hourly /mo 1 /tr "\"…\sauver-traces.cmd\" auto" /it`),
  la retire avec `enlever`, et dit avant le O / N ce qui part sur Internet, l'adresse de `origin` (sans identifiant ni jeton) et la branche ; il avertit si le
  dossier n'est pas sur une branche `evolution-`. `sauver-traces.cmd` : § 9.2.

### 2.10 `evoluer.js` — le maître

```js
/* en module, pour les tests seulement : */
const E=require('./evoluer');
E.generation(ctx)        /* -> Promise<RapportGeneration> : une generation complete (§ 6) a partir de l'etat charge dans ctx */
E.charger(cfg)           /* -> ctx {cfg, pop:Population, epoque, ord:Ordonnanceur, REF, dossier} : lit ou cree population.json (generation 0) */
E.verrouiller(cfg)       /* -> {ok:true, lacher:fn} | {ok:false, raison} */
E.refusDePartir()        /* -> null | texte : un marqueur d'inscription du labo vivant (fichiers ml/labo/tampon/inscription-<pid>.en-cours au pid vivant)
                                         ou un processus node dont la ligne de commande contient ecurie/boucle.js (PowerShell : Get-CimInstance Win32_Process) */
```
**Ligne de commande** : `node ml/evolution/evoluer.js [--config f.json] [--travailleurs N] [--une-generation] [--arret-apres N] [--banc] [--valider-maintenant]`
- sans option : boucle de générations jusqu'à `STOP`, Ctrl+C ou une erreur fatale ;
- `--une-generation` = `--arret-apres 1` ; `--travailleurs` remplace `cfg.travailleurs` pour ce lancement ;
- `--banc` : ~~écrit dans **config.json**~~ **(27/11 au soir, § 9.1)** refait le banc et écrit `<etat>/machine.json`, puis sort ; le banc se fait aussi tout
  seul au premier lancement sur un PC (pas de machine.json valable, pas de nombre forcé) ;
- `--valider-maintenant` : une validation meneur contre champion tout de suite (sans les conditions de la règle 6), puis sortie.

Codes de sortie : 0 arrêt propre ; 1 erreur fatale (dont « YEUX CHANGES », identité ratée) ; 2 refus de partir (verrou vivant, labo, boucle.js) **ou option
mal écrite** (§ 9.1 : toute la ligne est contrôlée avant la config, le verrou et toute course ; `--aide`/`--help`/`-h` → l'usage, code 0).
Ctrl+C : comme `STOP` ; un second Ctrl+C : `ord.arreter({dur:true})` et sortie 1 (la reprise ne perd que les courses en cours).
Toute la console va sur stdout, une ligne par événement, préfixée de l'heure `HH:MM:SS`.

**Précisions de l'intégrateur (27/11, dév. 4 — ce qui est codé et testé, `tests/evoluer.test.js`)** :
- Options en plus : `--etat dossier` (relatif à `ml/evolution/`, ou absolu) remplace `cfg.dossierEtat` **et** met les champions dans `<etat>/champions`
  (un essai ne touche jamais `champions/`) ; `--bavard` (le journal entier de l'ordonnanceur, dont chaque lancement). Une ligne par course finie
  (`course <usage> graine G <id> : palier …` ou `NON MESUREE (raison)`) ; les courses rendues par le cache ne s'impriment pas.
- `E.charger(cfg, o?)` est **synchrone** (`o.dire`, `o.bavard`) : il lit population.json (ou `null`), refuse un génome que `genome.valider` rejette, crée
  l'ordonnanceur, lit la référence des joueurs et les lignes d'entraînement mesurées de l'époque des courses. Il crée les quatre journaux vides s'ils manquent.
  L'étape 1 de § 6.1 (époque, identité, génération 0) est dans `E.preparer(ctx)` (async), appelé par `E.generation(ctx)` et par `--valider-maintenant`.
- Exporte en plus : `preparer`, `validerMaintenant(ctx)`, `banc(cfg, dire)`, `chemins(cfg)`, `ecrireChampion(ctx, vivant, G, o?)` (les tests s'en servent
  pour fabriquer un fichier de champion quand la validation ne sacre personne).
- `refusDePartir()` lit `ml/labo/tampon/inscription-<pid>.en-cours` **sans** passer par `labo.inscriptionsEnCours` (qui efface les marqueurs morts : une écriture
  dans ml/labo) ; boucle.js est reconnu par `ecurie[\/]boucle.js` ou `node boucle.js` dans la ligne de commande d'un `node.exe` (PowerShell `Get-CimInstance`,
  ~0,5 s ; s'il échoue, rien n'est refusé).
- L'**identité** est vérifiée au premier lancement (pas de population.json : c'est une époque neuve) et à chaque nouvelle époque des courses, avant la génération.
  Le **coffre** court au premier lancement et à chaque nouvelle époque (`raison:'epoque'`), même quand le champion est le témoin (une seule série de courses).
- ~~`pannesGeneration` = somme des `pannes` des lignes rendues (la dernière tentative seulement)~~ **(27/11, le correcteur)** : somme des `pannesEssais` des lignes
  rendues (les pannes de **tous** les essais de chaque course ; `pannes` pour une vieille ligne sans `pannesEssais`). Voir § 8.
- Un enfant abandonné pour doublon n'est écrit que comme événement (pas de ligne `morts.jsonl` : son id est déjà celui d'un pilote vu). `raison:'doublon'`
  n'est donc jamais écrit.
- Le tableau est réécrit en fin de génération, à l'interruption, et une dernière fois après le retrait du verrou (son résumé dit alors « ARRETE »).
- `config-essai.json` : ~~`travailleurs` 4 (la mission de test)~~ `travailleurs "auto"` et `banc.travailleurs [1, 2]` (§ 9.1 : un essai ne dépasse jamais
  2 courses à la fois ; les tests passent `--travailleurs N`) et ~~`protectionCourses` 6~~ (retiré le 28/11 : la protection par l'âge, § 11.3) (deux générations de 3 graines, comme 24 = deux de 12 : sinon un
  nouveau-né de l'essai pouvait être viré à sa première génération).

### 2.11 `inscrire-champion.js` — à la main seulement (étape 9)

```js
require('./inscrire-champion').inscrire(fichierJson, {essai:false, cfg})
  /* -> Promise<ligne du labo> : relit champions/gNNNN-<sha8>.json et son .js ; refuse (leve) si labo.sansCout('evolution') est faux (la ligne de labo.js
     manque), si boucle.js tourne, si une inscription du labo est en cours ; rejoue le champion sur ses graines de validation par enfant.js avec complet:true ;
     L.inscrire({nom:'evo-g'+NNNN, source, etape:'N1', generation:NNNN, modele:'evolution', raison:<§ 4.8 raison>, parents:[id labo du champion precedent
     inscrit, s'il y en a], lot:'entrainement', jeu, graines, tmax, note:mesures.barre(parties), courses}) puis L.valider(id,{role:'candidat',…}) et
     L.clore('N1', NNNN). essai:true : tout sauf les ecritures du labo (imprime ce qui serait inscrit). */
```
**Ligne de commande** : `node ml/evolution/inscrire-champion.js <champions/gNNNN-xxxxxxxx.json> [--essai] [--config f]`.
Écrit par l'intégrateur (27/11), **jamais exécuté**. Il forke enfant.js lui-même (l'ordonnanceur n'envoie jamais `complet:true`), au plus 4 à la fois ;
`parents` = l'id labo dont le `sha` est celui du pilote du champion précédent (ou de pilote-voltige.js si le précédent est le témoin), sinon `[]` ;
`graines` = `{n, depart, pas:37}` (les graines d'une validation se suivent de 37). La ligne à ajouter **à la main** dans `ml/labo/labo.js` (ligne 98) :
`function sansCout(modele){return modele==='main'||/abonnement$/.test(String(modele||''))||/^evolution/.test(String(modele||''));}`

---

## 3. Les formats

### 3.1 config.json
Le fichier `ml/evolution/config.json` donne **toutes** les clés et leurs valeurs par défaut ; `config-essai.json` en est une surcouche (μ 4, λ 2, 3 graines, tmax 60,
état à part dans `essais/`). Sens des clés qui ne sont pas évidentes :

| Clé | Sens |
|---|---|
| `grainesParGeneration`, `grainesEconomie`, `seuilEconomie_s` | 12 graines ; 8 si les **courses d'entraînement** d'une génération, hors PAUSE, ramenées à 12 graines, ont duré plus de 5 400 s ; retour à 12 sous 90 % du seuil (§ 8 ; écrit dans generations.jsonl) |
| `validation.seuilSacre` | critère (a) du sacre : ΔF > seuilSacre × se(ΔF) ; 2 (§ 8 ; la spec § 7.6 disait 1) |
| `nonMesureesVire` | (absent de config.json : 2 par défaut) courses non mesurées d'un pilote dans une génération qui le virent d'office (`raison:'non-mesuree'`), jamais le témoin |
| ~~`protectionCourses`~~ `protectionGenerations` | (28/11/2026, lot « règles », A4) ~~un vivant ne peut être viré ni être parent qu'avec au moins ce nombre de courses mesurées d'entraînement dans l'époque (24)~~ protection par l'âge (`v.ne`) : renvoyable à G si `ne ≤ G − p`, parent des naissances de G si `ne ≤ G − 1 − p` (p = 1) ; `protectionCourses` n'est plus lu |
| `immigres` | enfants immigrés par génération (1 sur λ = 6) |
| `greffes` | (28/11/2026) liste facultative d'ensembles gène → valeur (interrupteurs, choix, entiers ; jamais un réel, une tête ni un gène figé). La place de l'immigré suit un cycle de longueur n + 1 : rang = ((G − 1) · immigres + k) mod (n + 1) ; rang < n : une **greffe** (le champion recopié, ces gènes forcés, aucun tirage) ; rang = n : l'immigré ordinaire. Absente ou vide : rien ne change, au bit près. Règle complète : `notes/greffes.md` |
| `essaisDoublon` | remutations au plus quand un enfant a un `id` déjà vu ; au-delà il est abandonné (λ − 1 enfants, écrit) |
| `pannesVire` | pannes de cerveau (décisions coupées, somme sur ses lignes de la génération) qui virent d'office |
| `bornePoids` | tout poids des têtes est borné à [−4, 4] après mutation |
| `phases.passage` | `sansSacre` générations de suite sans sacre, ou `generations` générations depuis l'entrée dans la phase (A : depuis la génération 0) |
| `validation.revalidationPerte` | après une nouvelle époque, le champion recourt contre le témoin ; il perd son titre si `dF < -1 × se_dF` (§ 6.5) |
| `identite` | les graines et la durée du contrôle d'identité |
| `reseaux` | tailles et gains des deux têtes (§ 5.4, 5.5) ; les changer change le génome : nouvelle époque et génomes incompatibles (refus de charger) |
| `retourFige` | rv, rm, rn de la loi « retour » (figés, hors génome) |
| `travailleurs`, `banc.travailleurs` | (§ 9.1) `"auto"` : le nombre de courses à la fois vient de `machine.json` (le banc de CE PC), sinon le repli `max(1, L−2)` ; un nombre écrit l'emporte sur tous les PC ; `banc.travailleurs "auto"` = essayer {⌈L/2⌉, L−4, L−2, L−1} ; une liste reste acceptée |
| `ordreCourses` | (28/11, § 11.4) `"longues"` (défaut) : les courses d'entraînement demandées de la plus longue attendue à la plus courte ; `"origine"` : l'ordre des tâches |
| `graines.entrainement.suite`, `graines.auBout` | (28/11, § 11.5) la suite des graines d'entraînement après la réserve de 1 081 (`{depart:1000021, pas:37, fin:999999999}`) ; au bout : `"arret"` (défaut quand une suite existe) ou `"rejouer"` (l'ancien retirage) |
| `validation.plan`, `pas`, `plafond`, `borneOBF`, `futilite`, `seuilB`, `seuilC` | (28/11, § 11.1) la validation séquentielle ; `plan` absent ou `"fixe"` = la règle d'avant ; `seuilB`/`seuilC` 1 |
| `validation.maledictionSeuil` | (28/11, § 11.2) `null` : l'alarme « malédiction » est coupée (la mesure reste écrite) ; un nombre remet l'alarme d'avant |
| `alarmeDistance` | (28/11, lot « règles ») **0,011** (121 gènes : 0,0221 à la naissance). Avant : l'alarme « population trop semblable » ; 0,012 (la moitié de la distance d'une vraie population de 20 à la naissance : 0,028 sur 86 gènes, 0,0225 sur 107 ; à 0,04 l'alerte était levée dès la génération 0) ; hors de toute époque |

### 3.2 Le génome (`Genome`)
```json
{ "v": 1,
  "A": { "marge": 10, "bandeDecor": 99, "…": "…", "raccCartes_grotte": 0, "…": "…", "retourOn": 0, "axePoids": 20, "…": "…" },
  "WV": [0.0731, -0.2215, "… 216 poids W1 puis 6 poids W2 (= 0 a la naissance) …"],
  "WS": [0.1402, "… 72 poids W1 puis 18 poids W2 …"] }
```
- **(27/11 au soir, § 9.3) `"v": 2`** : `A` porte en plus, à la fin, les 21 gènes des gestes (107 clés). Un `"v": 1` aux 86 clés est migré à la lecture
  (`migrer`) ; son identifiant ne change pas tant que les 21 gènes sont à leur naissance.
- `A` porte **toutes** les clés de `BORNES`, dans son ordre, et rien d'autre. Valeurs : `reel` arrondi à 4 décimales (`+x.toFixed(4)`), `entier`/`choix` entiers,
  `drapeau` 0 ou 1 ; jamais −0.
- Têtes : `WV.length===222`, `WS.length===90`, chaque poids arrondi à 6 décimales, borné à `±cfg.bornePoids`, jamais −0. Disposition :
  `WV[j*36+i]` = W1 (caché j ∈ 0..5, entrée i ∈ 0..35), `WV[216+j]` = W2 ; `WS[j*12+i]` = W1, `WS[72+j*3+k]` = W2 (sortie k ∈ 0..2).
- Tirage de `tirerReseaux(g)` : `rng=mulberry32(g)` ; WV W1 dans l'ordre des indices (j puis i), `normal()/6` ; puis WS W1, `normal()/Math.sqrt(12)` ; W2 = 0.

### 3.3 Une ligne de `etat/courses-AAAA-SS.jsonl` (`Ligne`)
```json
{"cle":"<shaPilote40>|910037|900|1a2b3c4d5e6f|relief-canyon|v24.22.3|<epoque.courses>","pilote":"<shaPilote40>","id":"3f9a0c1d2e4b","usage":"entrainement",
 "generation":17,"epoque":"<epoque.courses 12 hex>","essai":1,"mesuree":true,"raison":null,"date":"2026-11-27T22:14:03.120Z",
 "graine":910037,"tmax":900,"palier":7,"pieces":445,"survie_s":147.8,"cause":"roche","morts":1,"vols":10,"pannes":0,"erreurs":0,"derniereErreur":null,
 "cerveau_ms_moy":0.41,"yeuxTirages":0,"mesures":{"nitro":0.29,"…":"…"},"jeu":"cashcar-v512","jeu_sha":"1a2b3c4d5e6f","simulateur":"relief-canyon","node":"v24.22.3",
 "empreinte":"5bfbea965d13","empreinteVues":"65c11298fa1a","empreinteTouches":"9c0d…","ms":63000}
```
`usage` ∈ `entrainement | validation | coffre | revalidation | essai`. Une course non mesurée a `mesuree:false`, `raison`, et les champs du résultat quand il y en a un
(`null` sinon). Le cache ne rend que `mesuree:true` (règle 1 de § 2.2). La clé contient l'époque des courses (écart à la spec § 5.3, qui ne listait pas les fichiers
des yeux : un yeux.js changé ne doit pas rendre une vieille course).

### 3.4 `etat/population.json` (`Population`)
Écrit **une fois par génération**, au début, après les naissances et le tirage des graines (atomique).
```json
{ "format": "evolution-population-1",
  "generation": 17,
  "phase": "A", "phaseDepuis": 0, "sansSacre": 5,
  "epoque": { "courses": "0b1c2d3e4f50", "note": "a1b2c3d4e5f6", "depuis": 3 },
  "rng": 2918734561,
  "graines": { "reserve": [0, 4, 5, "…"], "recentes": [[910074, "…"], "…"], "validationK": 24, "validationRepli": false, "validationFinie": false, "blocs": 0 },
  "grainesGeneration": [910407, 911183, "… 12 …"],
  "nGraines": 12,
  "grainesRetirees": [],
  "regle6": 2,
  "temoin": "3f9a0c1d2e4b",
  "champion": { "id": "3f9a0c1d2e4b", "depuis": 0, "fichier": null, "revalider": false },
  "derniereValidation": -99, "dernierCoffre": "2026-11-27T21:00:00.000Z", "nSacres": 0,
  "vivants": [
    { "id": "3f9a0c1d2e4b", "genome": { "v": 1, "A": {}, "WV": [], "WS": [] }, "shaPilote": "<40 hex>", "ne": 0,
      "parents": [], "origine": "temoin", "mutes": [], "pannesGeneration": 0 },
    { "id": "77ab…", "genome": {}, "shaPilote": "…", "ne": 17, "parents": ["3f9a0c1d2e4b", "c0ffee123456"], "origine": "croisement",
      "mutes": [{ "cle": "braqueNitro", "avant": 0.7, "apres": 0.8213 }] }
  ],
  "dejaVus": ["3f9a0c1d2e4b", "…ids de tous les genomes nes depuis le debut (vivants et morts)…"] }
```
**Écart de l'intégrateur (27/11)** : population.json est écrit au début de la génération (après les naissances, `"etape":"courses"`) **et à sa fin**
(`"etape":"fin"`, après generations.jsonl). Une reprise sur `courses` refait la génération (courses du cache) ; sur `fin`, elle passe aux naissances de G+1.
Sans l'écriture de fin, une reprise refaisait la génération finie avec des décisions qui dépendent de l'horloge (économie des graines, coffre de 24 h) et
recopiait ses journaux. Champs en plus : `etape`, `naissancesGeneration` ([{id, parents, origine, mutes:[clés]}] : la ligne de generations.jsonl les reprend
même quand les naissances ont été faites par un processus tué), `abandonsGeneration`, `coffreEpoque` (un coffre « époque » reste dû), `epoque.composants`
(pour dire **ce qui** a changé à la nouvelle époque : `nouvelle epoque : yeux.js, …`). Les journaux d'une génération refaite ne sont jamais écrits deux fois
(morts par id, validations par génération + usage + meneur + champion + première graine, coffre par génération + raison, generations par génération).
(28/11/2026, § 11.5) `graines.blocs` : combien de blocs de la suite ont rechargé la réserve (absent = 0, un état d'avant). Les indices ≥ 1 081 de `reserve`
désignent la suite (`suite.depart + 37·(i − 1081)`).
`origine` ∈ `temoin | g0 | mutation | croisement | immigre`. `epoque.depuis` = la génération où l'époque a commencé. `rng` = l'état du générateur du maître
**après** les naissances et les graines de cette génération. `grainesRetirees` : graines retirées pour l'époque (§ 6.3, règle 3). `shaPilote` est recalculé
pour tous les vivants au changement d'époque (modele.js en fait partie).

### 3.5 Une ligne de `generations.jsonl`
(Intégrateur, 27/11 : `courses.demandees` compte **toutes** les tâches de la génération — entraînement, validation, coffre ; `cache`, `jouees`, `nonMesurees`,
`relancees`, `tuees` sont la différence des `ord.stats()` ; `debit_h = jouees·3600/duree_s`.)
```json
{"generation":17,"date":"…","duree_s":2310,"epoque":"0b1c2d3e4f50","epoqueNote":"a1b2c3d4e5f6","phase":"A","nGraines":12,"graines":[910407,"…"],
 "courses":{"demandees":312,"cache":260,"jouees":52,"nonMesurees":1,"relancees":1,"tuees":0,"grainesRetirees":[]},"debit_h":81.0,
 "naissances":[{"id":"77ab…","parents":["…","…"],"origine":"croisement","mutes":["braqueNitro","figTemps"]}],
 "morts":[{"id":"…","raison":"renvoi"}],
 "meneur":{"id":"…","n":96,"a":7.9,"ahat":7.6,"E":1.10,"F":3.2,"se_F":0.6,"ecartClassique":1.71},"temoin":{"…":"…"},"champion":{"…":"…"},
 "population":[{"id":"…","ne":3,"n":168,"ahat":7.4,"E":1.2,"F":2.6,"se_F":0.5}],
 "distance":0.11,"distanceW2":0,"sigmaRes":3.3,"validation":null,"coffre":null,
 "evenements":["nouvelle epoque : yeux.js","phase B","graines 12 -> 8","regle 6 : 2 -> 3","identite verifiee"]}
```

### 3.6 Une ligne de `validations.jsonl`
```json
{"generation":20,"date":"…","usage":"validation","meneur":"77ab…","champion":"3f9a…","graines":[1000000,"… 24 …"],
 "entrainement":{"dF":1.4,"se_dF":0.6},"validation":{"graines":24,"dF":0.5,"se_dF":0.42,"dPalier":0.9,"se_dPalier":0.8,"dE":0.1,"se_dE":0.07},
 "criteres":{"a":true,"b":true,"c":false},"sacre":false,"malediction":0.9,"maledictionMoyenne":0.7,"fichier":null}
```
`usage:'revalidation'` pour la revalidation d'après une nouvelle époque (meneur = champion, champion = témoin ; `sacre` y veut dire « garde son titre »).
(28/11/2026, lot « sacre ») Une validation porte en plus `plan`, `regards[]`, `arret`, `courses` : format au § 11.1. Une ligne sans `regards` (d'avant) se lit
comme un seul lot. Dans `generations.jsonl`, la clé `validation` d'une validation séquentielle porte en plus `graines` (jouées), `regards` (leur nombre), `arret`.

### 3.7 Une ligne de `morts.jsonl`
```json
{"id":"…","genome":{"v":1,"A":{},"WV":[],"WS":[]},"parents":["…"],"origine":"mutation","ne":12,"mort":17,"raison":"renvoi",
 "n":60,"a":6.1,"ahat":6.4,"E":1.6,"F":0.0,"se_F":0.7,"ecartClassique":2.1,"epoque":"0b1c2d3e4f50"}
```
`raison` ∈ `renvoi | pannes | non-mesuree` (`doublon` n'est jamais écrit, § 2.10). Les lignes d'une génération ne s'écrivent qu'à sa fin (§ 8).

### 3.8 Une ligne de `coffre.jsonl`
```json
{"date":"…","generation":20,"epoque":"0b1c2d3e4f50","raison":"sacre","graines":40,
 "champion":{"id":"…","n":40,"palierMoyen":8.1,"E":1.05,"ecartClassique":1.62},"temoin":{"id":"…","n":40,"palierMoyen":7.6,"E":1.20,"ecartClassique":1.70},
 "diff":{"palier":0.5,"E":-0.15,"ecartClassique":-0.08}}
```
`raison` ∈ `sacre | 24h | epoque`. Quand le champion est le témoin, `champion` = `temoin` et `diff` = 0.

### 3.9 `etat/verrou.json`
```json
{"pid":12345,"debut":"2026-11-27T21:00:00.000Z","battement":"2026-11-27T21:30:30.000Z","config":"config.json"}
```
Réécrit (atomique) toutes les `battement_s` secondes. Un second lancement s'arrête (code 2) si `vivant(pid)` et battement de moins de `verrouPerime_s` ; sinon
il reprend le verrou (écrit dans la console). Effacé à la sortie propre.
**(27/11, le correcteur, § 8)** Un pid vivant au battement vieux n'est repris que s'il n'est pas un processus `node.exe` ; la reprise passe par `verrou.json.reprise`
(création exclusive), déplace le mort vers `verrou.json.mort-<pid>` et recrée `verrou.json` en `'wx'`. Le battement relit le fichier : un autre pid → il n'écrit plus
et le maître s'arrête comme sur STOP (« VERROU PERDU »). `verrouiller(cfg, {surPerte})` ne lève jamais.

### 3.10 L'époque (`Epoque`, rendue par `courses.epoque(cfg)`)
```json
{"courses":"0b1c2d3e4f50","note":"a1b2c3d4e5f6",
 "composants":{"jeu_sha":"1a2b3c4d5e6f","version":"cashcar-v512","simulateur":"relief-canyon","node":"v24.22.3","regime":"allege","fichiers_sha":"<12 hex>",
   "fichiers":{"ml/bot/yeux.js":"<sha1>","ml/bot/doigts.js":"…","ml/bot/piloter.js":"…","ml/bot/ressemblance.js":"…","ml/bot/mesures.js":"…","ml/bot/voltige.js":"…",
               "ml/reel/jeu-reel.js":"…","ml/reel/sim-env-reel.js":"…","ml/evolution/modele.js":"…","ml/evolution/enfant.js":"…"},
   "etalon":"<sha1 des noms tries + contenus de ml/bot/etalon/*.json>","reseaux":"<sha1 de JSON(cfg.reseaux)+JSON(cfg.retourFige)>",
   "noteCfg":"<sha1 de JSON(cfg.note)>"}}
```
- `courses` = sha1(JSON de jeu_sha, version, simulateur, node, regime, fichiers, reseaux).slice(0,12) : ce qui change une course (`regime` = `cfg.regime||'allege'`,
  ajouté le 27/11 par le correcteur ; `fichiers_sha` = `commun.shaDesFichiers(fichiers)`, que l'enfant recalcule au moment de son fork). Changé → **nouvelle époque** :
  notes à zéro, courses à rejouer (la clé du cache change).
- `note` = sha1(courses + etalon + noteCfg).slice(0,12) : ce qui change une note sans changer une course (étalon, poids de l'écart). Changé → nouvelle époque
  de notes, **les courses de la même `courses` restent valables** (le cache les rend).
- Les fichiers sont lus en octets (CRLF compris : un fichier ré-extrait en CRLF change d'époque, c'est voulu). `version` vient de `VERSION PRINCIPALE/sw.js`,
  `jeu_sha` de `piloter.shaJeu()`, `simulateur` de `require('../reel/jeu-reel').SIMULATEUR`. Écart à la spec § 7.1 : mesures.js, voltige.js, jeu-reel.js,
  sim-env-reel.js, modele.js, enfant.js et `cfg.reseaux` en plus (ils changent les 15 mesures ou la course).

### 3.11 Le champion : `champions/gNNNN-<shaPilote8>.js` et `.json`
`.js` = le texte exact du pilote (celui des `pilotes/`), que `node ml/bot/noter.js champions/g0020-1a2b3c4d.js --graines 1 --depart <g> --tmax 900 --regime allege`
note comme n'importe quel cerveau. `NNNN` = la génération du sacre sur 4 chiffres. `.json` :
```json
{"format":"evolution-champion-1","generation":20,"id":"77ab…","shaPilote":"<40 hex>","epoque":"0b1c2d3e4f50","phase":"A","date":"…",
 "genome":{"v":1,"A":{},"WV":[],"WS":[]},"parents":["…"],"ne":14,"precedent":"3f9a…",
 "mutesDepuisTemoin":[{"cle":"braqueNitro","temoin":0.7,"valeur":0.82}],
 "raison":"generation 20 : 4 reglages mutes : braqueNitro .70→.82, figTemps 1.5→1.9, … ; phase A",
 "entrainement":{"n":120,"a":8.0,"ahat":7.8,"E":1.05,"F":3.6,"se_F":0.5,"ecartClassique":1.6},
 "validation":{"graines":[1000024,"…"],"dF":1.1,"se_dF":0.4,"dPalier":1.3,"se_dPalier":0.7,"dE":0.05,"se_dE":0.06},
 "coffre":null}
```
`mutesDepuisTemoin` : les gènes de `A` qui diffèrent du témoin, et « têtes modifiées » si W2 ou W1 diffèrent. Le témoin, champion de départ, n'a **pas** de fichier.

### 3.12 `RapportGeneration` (rendu par `E.generation`, et c'est la ligne de generations.jsonl)
Même objet que § 3.5.

---

## 4. Le génome en détail

### 4.1 Les gènes du bloc A (`BORNES`)
`Borne = {cle, type:'reel'|'entier'|'drapeau'|'choix', min, max, naissance, ou}` ; `ou` dit où le gène s'écrit dans le pilote :
`'R'` = une clé de `REGLAGES` du même nom ; `'G'` = une clé de `G` ; `'raccCartes'`/`'raccJumeau'` = une entrée de l'objet ; `'volRetour'`, `'retours'` = règle du § 5.2.
Le témoin prend la valeur de `pilote-voltige.js` (colonne « témoin ») ; la colonne « naissance » ne sert qu'aux gènes absents de pilote-voltige.
Les bornes sont des propositions (la table de l'inventaire « faits (3) » n'a pas été retrouvée dans l'étude : seules les onze bornes citées par la spec en viennent,
marquées ★) ; un développeur qui en trouve une mauvaise la corrige ici.

**Les 45 réels de REGLAGES** (`ou:'R'`)

| cle | min | max | témoin | | cle | min | max | témoin |
|---|---|---|---|---|---|---|---|---|
| marge ★ | 3 | 20 | 10 | | raccTmin | 0.3 | 1.5 | 0.7 |
| bandeDecor ★ | 10 | 99 | 99 | | raccChute | 30 | 300 | 120 |
| nitroDecor ★ | 0 | 1.5 | 1 | | raccTmax ★ | 2 | 5.5 | 3.6 |
| margeCouloir | 5 | 25 | 15 | | raccAir | 0.3 | 3 | 1.2 |
| avance | 0.1 | 0.8 | 0.3 | | raccBord | 1 | 12 | 5 |
| glisse | 0.04 | 0.3 | 0.12 | | raccAttente | 0.6 | 3 | 1.6 |
| glisseUrgence | 0.1 | 0.6 | 0.3 | | raccRepos | 0.3 | 4 | 1.5 |
| ligneLoin | 100 | 500 | 320 | | figPlongeon | 1.4 | 3.5 | 2.2 |
| piecesLoin | 60 | 350 | 180 | | figTemps ★ | 1.4 | 3 | 1.5 |
| capLigne | 0.1 | 0.5 | 0.3 | | figJauge ★ | 0.35 | 1 | 0.4 |
| avanceCap | 0 | 0.6 | 0.25 | | figEcart ★ | 0.5 | 2 | 0.55 |
| capAvance | 0 | 0.5 | 0.25 | | dessousMax | 0.2 | 3 | 0.8 |
| braqueDoux | 0 | 0.5 | 0.15 | | dessousPose | 0 | 60 | 25 |
| braqueFort | 0.2 | 1 | 0.5 | | departMin | 0 | 4 | 1.5 |
| braqueNitro ★ | 0.2 | 1.2 | 0.7 | | departMax | 1 | 8 | 5.5 |
| margeAllumer | -0.1 | 0.5 | 0.05 | | volRetour (valeur) | 0.2 | 1.5 | naissance 0.8 (témoin : drapeau à 0) |
| margeTenir | -0.2 | 0.3 | 0 | | volAvance | 0 | 0.4 | 0.25 |
| jaugeAllume | 0.2 | 1.2 | 0.45 | | figDepuis | 0.1 | 1.2 | 0.4 |
| jaugeCoupe | 0 | 0.8 | 0.25 | | figHaut | 0 | 60 | 15 |
| capMax ★ | 0.1 | 0.8 | 0.35 | | raccGain | 40 | 300 | 80 |
| bascule ★ | 0 | 40 | 10 | | raccAxe | 0.3 | 0.95 | 0.75 |
| tenirFacon ★ | 0.1 | 1.5 | 0.35 | | raccVirage | 0 | 0.6 | 0.2 |
| derive | 0 | 0.6 | 0.3 | | | | | |

**Les 5 réels de la loi « retour »** (amendement 2 ; `ou:'R'`, et `retours` les reprend, § 5.2)

| cle | min | max | naissance (= témoin) |
|---|---|---|---|
| retMarge | 4 | 14 | 8 |
| retCap | 0.45 | 0.9 | 0.8 |
| retGain | 0.7 | 1.4 | 0.8 |
| retAvance | 0.10 | 0.25 | 0.15 |
| retourPrime | 0 | 15 | 4 |

**Les 14 constantes promues** (`ou:'G'`, `type:'reel'` ; écrites en dur dans pilote-voltige.js, lues `G.<cle>` dans modele.js, § 5.3)

| cle | où dans pilote-voltige.js | min | max | témoin |
|---|---|---|---|---|
| axePoids | `vaut()`, pose : `100-20*Math.abs(axe)` (c'est l'`axePoids` de faire-pR.js) | 5 | 60 | 20 |
| vTemps | `vaut()`, pose : `-3*t` | 0 | 10 | 3 |
| vPortail | `vaut()` : `return 94` | 60 | 100 | 94 |
| vLevre | `vaut()` : `80-3*t` (le 80 ; le 3 reste figé) | 40 | 95 | 80 |
| vLibreBase | `vaut()`, rayon long libre : `12+2*t` (le 12) | 0 | 30 | 12 |
| vLibrePente | idem (le 2) | 0 | 6 | 2 |
| vCourt | `vaut()`, rayon court : `34-Math.min(20,…)` (le 34) | 10 | 60 | 34 |
| rAxe | `raccourci()`, ligne `const s=Math.min(gain,600)-250*axe-25*t-…` (le 250) | 50 | 500 | 250 |
| rTemps | idem (le 25 de cette ligne seulement ; ceux du portail et du dessous restent figés) | 0 | 80 | 25 |
| rPlane | idem `(r.m==='plane'?40:0)` | 0 | 100 | 40 |
| rLourde | idem `(r.note==='lourde'?40:0)` | 0 | 100 | 40 |
| bVersRoute | `enVol()`, bonus `nom==='versRoute'?3` | 0 | 10 | 3 |
| bVersRoutePlane | `nom==='versRoutePlane'?2` | 0 | 10 | 2 |
| bRien | `nom==='rien'?1` | 0 | 10 | 1 |

**Les drapeaux, choix et entiers**

| cle | type | valeurs | témoin / naissance | ou |
|---|---|---|---|---|
| dessousAveugle, dessousNitro, dessousFuir, portailVol, volDemiTour | drapeau | 0/1 | 1, 0, 1, 1, 1 | R |
| volRetourOn | drapeau | 0/1 | 0 (pilote-voltige : `volRetour:0`) | volRetour |
| dessousDecor | choix | 0, 1, 2 | 1 | R |
| figMax | entier | 0..5 | 2 | R |
| raccCartes_<map> (une par map de `cfg.cartesTirage`, dans cet ordre) | drapeau | 1 = permis, 0 = jamais | 0 pour grotte, canyon, jade ; 1 sinon | raccCartes |
| raccJumeau_<map> (idem) | drapeau | 1 = exiger les deux rayons | 1 pour jade, ville ; 0 sinon | raccJumeau |
| retourOn | drapeau | 0/1 | **0** | retours |
| volMieux | drapeau | 0/1 | **0** | R |

Ordre de `BORNES` : les 45 réels dans l'ordre de leur apparition dans `REGLAGES` de pilote-voltige.js (`volRetour` à sa place), puis les drapeaux/choix/entiers
de REGLAGES à leur place d'apparition (`raccCartes_*`, `raccJumeau_*` à la place de leur objet, `volRetourOn` juste avant `volRetour`), puis `retourOn, retMarge,
retCap, retGain, retAvance, retourPrime, volMieux`, puis les 14 de `G` dans l'ordre du tableau. Total : 64 réels (`CONTINUS`) + 5 drapeaux de REGLAGES +
`volRetourOn` + 12 `racc*_<map>` + `retourOn` + `volMieux` + `dessousDecor` + `figMax` = **86 gènes**.
**(27/11 au soir, § 9.3)** puis les 21 gènes des gestes (`GESTES`, tableau au § 9.3) : **107 gènes** = 79 réels + 26 drapeaux + `dessousDecor` + `figMax`.
**Figés, jamais dans le génome** : `PROFIL`, le garage (aucun), `DECOR`, `FACONS`, `LONGS`, la structure ; `volNitro` = 0 (clé de faire-pR.js gardée à 0 : elle
n'est pas dans la liste de l'amendement) ; `rv`, `rm`, `rn` de `cfg.retourFige`.

### 4.2 Les contraintes (`reparer`)
Dans cet ordre, après le bornage de chaque gène (réel : `min(max(x,min),max)` puis 4 décimales ; entier/choix : arrondi puis borné ; drapeau : `x?1:0`) :
1. `braqueFort ≥ braqueDoux + 0.1` : sinon `braqueFort = braqueDoux + 0.1` ; si cela dépasse sa borne, `braqueFort = max(braqueFort)` et `braqueDoux = braqueFort − 0.1`.
2. `jaugeCoupe ≤ jaugeAllume` : sinon `jaugeCoupe = jaugeAllume`.
3. `departMax ≥ departMin` : sinon `departMax = departMin`.
Puis les poids : borne `±bornePoids`, 6 décimales, −0 → 0.

---

## 5. Le pilote fabriqué (`modele.js` → `ecrirePilote`)

### 5.1 La balise
`modele.js` contient **une seule** ligne égale à `/*@GENOME@*/` (rien d'autre sur la ligne), à l'endroit où pilote-voltige.js a `const REGLAGES={…};`
(juste après `PROFIL`). `ecrirePilote` remplace cette ligne par le bloc suivant (et rien d'autre dans le fichier ; il remplace aussi les fins de ligne par `\n`) :
```js
/*@GENOME@ debut : ecrit par ml/evolution/genome.js (ecrirePilote), genome 3f9a0c1d2e4b — ne pas editer */
const REGLAGES={marge:10,bandeDecor:99,nitroDecor:1,margeCouloir:15,avance:0.3,glisse:0.12,glisseUrgence:0.3,ligneLoin:320,piecesLoin:180,capLigne:0.3,avanceCap:0.25,capAvance:0.25,braqueDoux:0.15,braqueFort:0.5,braqueNitro:0.7,margeAllumer:0.05,margeTenir:0,jaugeAllume:0.45,jaugeCoupe:0.25,capMax:0.35,bascule:10,tenirFacon:0.35,derive:0.3,raccVirage:0.2,raccGain:80,raccAxe:0.75,raccTmin:0.7,raccChute:120,raccTmax:3.6,raccAir:1.2,raccBord:5,raccAttente:1.6,raccCartes:{jade:0,grotte:0,canyon:0},raccJumeau:{ville:1,jade:1},raccRepos:1.5,figPlongeon:2.2,figTemps:1.5,figJauge:0.4,figEcart:0.55,dessousMax:0.8,dessousAveugle:1,dessousDecor:1,dessousNitro:0,dessousFuir:1,dessousPose:25,departMin:1.5,departMax:5.5,portailVol:1,volDemiTour:1,volRetour:0,volAvance:0.25,figMax:2,figDepuis:0.4,figHaut:15,retourOn:0,retMarge:8,retCap:0.8,retGain:0.8,retAvance:0.15,retourPrime:4,volMieux:0,volNitro:0,retours:[]};
const G={axePoids:20,vTemps:3,vPortail:94,vLevre:80,vLibreBase:12,vLibrePente:2,vCourt:34,rAxe:250,rTemps:25,rPlane:40,rLourde:40,bVersRoute:3,bVersRoutePlane:2,bRien:1};
const WV=new Float64Array([0.0731,-0.2215,…222 nombres…]),WS=new Float64Array([0.1402,…90 nombres…]);
const CONTROLE_RAYONS=true;
/*@GENOME@ fin*/
```
- Nombres écrits par `String(x)` (la plus courte écriture qui relit le même double). Clés de `REGLAGES` dans l'ordre de **pilote-voltige.js**
  (`genome.ORDRE_VOLTIGE`, comme l'exemple ci-dessus ; correction du 27/11, dév. 2 : « l'ordre de BORNES » contredisait l'exemple, qui fait foi — l'ordre
  des clés ne change rien à la course), puis `retourOn, retMarge, retCap, retGain, retAvance, retourPrime, volMieux`, **(§ 9.3) puis les 21 clés des gestes**
  (`…,volMieux:0,lacheOn:0,lacheAvant:0.35,slalomOn:0,…,suitMarge:0.25,`), puis `volNitro:0` et `retours` en dernier.
- `raccCartes` : les seules maps de drapeau **0**, dans l'ordre de `cfg.cartesTirage` ; `raccJumeau` : les seules maps de drapeau **1**, même ordre
  (le code lit `R.raccCartes[v.carte]!==0` et `R.raccJumeau[v.carte]` : une map absente vaut « permis » / « non exigé », comme aujourd'hui).
- `volRetour` : `volRetourOn ? A.volRetour : 0`.
- `CONTROLE_RAYONS` : `o.controleRayons !== false`.

### 5.2 La loi « retour » (amendement 2)
- `retours` : `[]` si `retourOn === 0` ; sinon **une** loi :
  `[{marge:A.retMarge, cap:A.retCap, gain:A.retGain, avance:A.retAvance, rv:0.2, rm:0.24, rn:0.18}]` (rv/rm/rn de `cfg.retourFige` ; ni `nitro`, ni `coup`, ni
  `sol` : les défauts de yeux.js, `lireRetours`). Ces clés sont celles que lit `yeux.js` (`lireRetours` : marge, cap, gain, avance, rv, rm, rn).
- modele.js applique **toutes** les retouches de `ml/ecurie/agents/tmp-voltige/faire-pR.js`, avec ces gardes qui font l'identité au bit près quand `retours` est vide :
  1. `decide` n'ajoute `o.retours=REGLAGES.retours` que si `REGLAGES.retours.length>0` (déjà ainsi dans faire-pR.js).
  2. **Au sol**, les deux `nitro:` d'une sortie engagée (`m.sortie.facon` et `rc.facon`) gardent l'expression de pilote-voltige (`facon==='plane'`) quand
     `REGLAGES.retours.length===0`, et prennent `avecNitro(facon)` sinon. (Sans cette garde, une sortie `viserPlane` allumerait la nitro au sol : course différente.)
  3. Dans la boucle des candidats de `enVol` (`for(const nom in FACONS)`), une façon `retour<i>` avec `i >= REGLAGES.retours.length` est **sautée** (`continue`).
     (Sans cette garde, `retour0` sans rayon vaut `-1 + prime = 3` et peut gagner : course différente.)
  4. Le choix du départ (`m.choix`) et « pour mieux » (`volMieux`) restent tels que faire-pR.js les écrit (`R.retours.length` et `R.volMieux>0` les gardent).
  5. `prime(nom)` lit `G.bVersRoute`, `G.bVersRoutePlane`, `G.bRien`, `REGLAGES.retourPrime`, `REGLAGES.volNitro` ; `vaut()` lit `G.axePoids` (au lieu de
     `REGLAGES.axePoids`).

### 5.3 Les 14 constantes
Chaque littéral du tableau du § 4.1 est remplacé par `G.<cle>` dans modele.js, à l'endroit dit, et nulle part ailleurs. `genomeTemoin` vérifie que pilote-voltige.js
contient encore ces extraits exacts (sinon il lève) :
`100-20*Math.abs(axe)-3*t-` · `if(r.issue==='portail')return 94;` · `return 80-3*t;` · `return 12+2*t;` · `return 34-Math.min(20,` ·
`const s=Math.min(gain,600)-250*axe-25*t-(r.m==='plane'?40:0)-(r.note==='lourde'?40:0);` · `(nom==='versRoute'?3:nom==='versRoutePlane'?2:nom==='rien'?1:0)`.

### 5.4 La fonction des têtes
```js
/* une tete : nIn entrees -> nH tanh -> nOut sorties. W : Float64Array, x : Float64Array(nIn) deja borne, out : Float64Array(nOut) */
function reseau(W,x,nIn,nH,nOut,out){
  for(let k=0;k<nOut;k++)out[k]=0;
  const b=nIn*nH;
  for(let j=0;j<nH;j++){let s=0;for(let i=0;i<nIn;i++)s+=W[j*nIn+i]*x[i];const h=Math.tanh(s);for(let k=0;k<nOut;k++)out[k]+=W[b+j*nOut+k]*h;}
  return out;}
const borne3=v=>(typeof v==='number'&&v-v===0)?(v<-3?-3:v>3?3:v):0;   /* NaN, ±Infinity, undefined, non-nombre -> 0 ; puis [-3,3] */
```
Avec W2 = 0 : chaque `out[k]` vaut ±0, `Math.tanh(±0)=±0`, `x+(±0)===x`, `x*Math.exp(±0)===x` : le pilote joue au bit près comme pilote-voltige.
Les tampons `x` et `out` sont des `Float64Array` créés une fois en tête du fichier (pas d'allocation par décision).

### 5.5 Tête RAYON (`WV`, 36 entrées, 1 sortie) — l'ordre exact des entrées
Appelée par `R(ry, nom, v, m)` ; **si `ry` est absent (null/undefined), `R` rend 0 sans appeler le réseau.** Sinon `R = 15*Math.tanh(out[0])`.
Dans modele.js la fonction s'appelle **`teteRayon`** (27/11, dév. 2) : `R` y est déjà le nom local de `REGLAGES` dans `auSol` et `enVol`.
Notations : `f=v.vol`, `p=f.proche||{}`, `demi=Math.max(1,+v.demi||28)` ; `b(x)=borne3(x)` appliqué à **chaque** entrée.

| i | entrée | formule |
|---|---|---|
| 0 | issue = pose | `ry.issue==='pose'?1:0` |
| 1 | issue = levre | `ry.issue==='levre'?1:0` |
| 2 | issue = portail | `ry.issue==='portail'?1:0` |
| 3 | issue = choc | `ry.issue==='choc'?1:0` |
| 4 | issue = air | `ry.issue==='air'?1:0` |
| 5 | issue = fond | `ry.issue==='fond'?1:0` |
| 6 | issue = libre | `ry.issue==='libre'?1:0` |
| 7 | issue = coupe | `ry.issue==='coupe'?1:0` |
| 8 | durée | `(+ry.t||0)/6` |
| 9 | angle d'arrivée | `Math.abs(+ry.axe||0)/1.4` |
| 10 | écart latéral | `(+ry.lat||0)/demi` |
| 11 | propre | `ry.propre===true?1:0` |
| 12 | dessous | `ry.dessous?1:0` |
| 13 | piste gagnée | `(+ry.gain||0)/200` |
| 14 | façon = retour (retour0…retour3) | `nom.indexOf('retour')===0?1:0` |
| 15 | façon = rien | `nom==='rien'?1:0` |
| 16 | façon = gauche | idem `'gauche'` |
| 17 | façon = droite | `'droite'` |
| 18 | façon = cabre | `'cabre'` |
| 19 | façon = pique | `'pique'` |
| 20 | façon = plane | `'plane'` |
| 21 | façon = planeCabre | `'planeCabre'` |
| 22 | façon = versRoute | `'versRoute'` |
| 23 | façon = versRoutePlane | `'versRoutePlane'` |
| 24 | façon = viser | `'viser'` |
| 25 | façon = viserPlane | `'viserPlane'` |
| 26 | air restant | `(f.air&&f.air.reste!=null?+f.air.reste:+f.reste)/6` |
| 27 | jauge | `((+v.nitro||0)+(+v.reserve||0))/2` |
| 28 | hauteur sur la route | `(+p.haut||0)/100` |
| 29 | écart à la route | `(+p.lat||0)/demi` |
| 30 | angle à la route | `+p.axe||0` |
| 31 | c'est la façon tenue | `nom===m.facon?1:0` |
| 32 | depuis la façon | `(v.t-m.tFacon)/1` |
| 33 | durée du vol | `(+f.t||0)/6` |
| 34 | map à décor | `DECOR[v.carte]?1:0` |
| 35 | biais | `1` |

Écart à la spec § 4.2 : la case de façon n° 0 était « tenu », qui n'est **jamais** un nom de façon (FACONS n'a pas de `tenu` : le rayon `tenu` sert de `mien`
sous le nom `m.facon`) ; elle sert ici aux lois `retour<i>` (amendement 2). 36 entrées, 222 poids : inchangé.
Le rayon passé à `R` est celui qui sert à la comparaison (`mien` pour `sMien`, `ry=rayonDe(nom)` pour un candidat).

**Branchements** (les seuls) :
- `sMien = vaut(mien,true,v) + R(mien, m.facon, v, m)` (là où pilote-voltige calcule `sMien`, après l'échange éventuel de `viser`) ;
- dans la boucle des candidats : `s = vaut(ry,!!LONGS[nom],v) + prime(nom) + R(ry, nom, v, m)` ;
- dans le choix du départ de faire-pR.js : `s = vaut(ry,true,v) + prime(nom) + R(ry, nom, v, m)`.
Patience, fuite du dessous, `tenirFacon`, `bascule` : inchangés.

### 5.6 Tête SOL (`WS`, 12 entrées, 3 sorties) — l'ordre exact des entrées
Évaluée **une fois par décision au sol**, sauf pendant le départ (le `return` du départ vient avant), **juste avant** `cible=cl(cible,-max,max);`
(après le calcul de `lache`). `margeV` et `jauge` sont alors calculés à cet endroit (mêmes expressions que plus bas dans pilote-voltige, déplacées sans changement :
`const proche=!!(vg&&vg.d<vit*3),margeV=proche?vg.marge/vit:9;` et `const jauge=(v.nitro||0)+(v.reserve||0);`).

| i | entrée | formule |
|---|---|---|
| 0 | écart latéral | `v.lat/Math.max(1,+v.demi||28)` |
| 1 | cap | `(+v.cap||0)/0.5` |
| 2 | force du virage | `force` (déjà calculée dans auSol) |
| 3 | marge du virage | `margeV/3` |
| 4 | jauge | `jauge/2` |
| 5 | vitesse | `v.vitesse/150` |
| 6 | palier | `(v.palier&&+v.palier.n||0)/30` |
| 7 | map à décor | `decor?1:0` |
| 8 | couloir | `couloir?1:0` |
| 9 | la route lâche | `lache?1:0` |
| 10 | la route à 400 m | `tourne(v,400)` |
| 11 | biais | `1` |

Sorties (`o=out`) et branchements :
- `cible = cible + 5*Math.tanh(o[1])` juste avant `cible=cl(cible,-max,max);` (la même borne qu'aujourd'hui) — écrit `if(dc!==0)cible=cible+dc`
  (27/11, dév. 2) : `-0 + 0` vaut `+0`, et le signe d'un zéro ressort dans l'ordre (le bac garde `-0`) ; la garde rend l'identité exacte même là ;
- `seuil = (m.nitro?R.braqueNitro:R.braqueNitro-.1)*k*Math.exp(0.3*o[0])` ;
- `raccourci(v,sortir,kGain)` avec `kGain=Math.exp(0.5*o[2])` et, dans `raccourci`, `gain<R.raccGain*kGain` (seul usage de `raccGain`).
Les gains 5, 0,3, 0,5 et 15 sont ceux de `cfg.reseaux` ; ils sont écrits en dur dans modele.js (changer cfg.reseaux = changer modele.js : nouvelle époque).

### 5.7 Le contrôle des rayons (amendement 3, d'après `yeux.js`, `radarVol`)
À **chaque** décision en vol dont `v.vol.radar` est un objet et `v.vol.radar.rayons` un tableau (le radar est `null` quand la caisse est tenue au portail, et
`rayons` est `null` si l'éventail a levé), et si `CONTROLE_RAYONS` :
```js
const ORDRE10=['tenu','rien','gauche','droite','cabre','pique','plane','planeCabre','versRoute','versRoutePlane'];
/* noms = rayons.map(r=>r&&r.m) */
1. noms.length >= 10 et noms[i]===ORDRE10[i] pour i = 0..9 ;
2. reste = noms.slice(10) ; s'il commence par 'viser', il commence par 'viser','viserPlane' (les deux ensemble), et v.vol.cible est un objet ;
   s'il ne commence pas par 'viser', v.vol.cible est null ou absent (yeux.js le pose a null par defaut, ligne ~977, et ne le remplit qu'avec les deux rayons) ;
3. apres eux : 'retour0','retour1',… consecutifs, au plus REGLAGES.retours.length (0 si la loi est coupee) — et rien d'autre.
   (27/11 au soir, § 9.3) : au plus RETOURS_DEMANDES.length = R.retours, plus les deux lois du coup de nitro quand coupOn.
```
Échec → `throw new Error('YEUX CHANGES : rayons '+noms.join(','))`. L'erreur sort par le bac dans `bilan.derniereErreur` (et `erreurs`) ; le maître, qui la lit
dans `derniereErreur`, arrête tout (code 1). Un contrôle qui passe ne change rien à la course (aucune écriture dans `m`, aucune vue).
Le nombre de rayons `retour<i>` peut être **inférieur** à `REGLAGES.retours.length` à la toute première vue d'un vol (la demande part avec l'ordre d'avant) :
c'est permis (« au plus »).

---

## 6. L'algorithme (evoluer.js), là où la spec laisse un choix

### 6.1 Déroulé d'une génération G
1. **Époque** : `ep=courses.epoque(cfg)`. Si `ep.courses` ≠ `pop.epoque.courses` : nouvelle époque (événement écrit), `identite.verifier` (échec → arrêt, code 1),
   `shaPilote` recalculés, `grainesRetirees=[]`, `nGraines=cfg.grainesParGeneration`, `champion.revalider=true` (si champion ≠ témoin), validation et coffre « époque ».
   Si seul `ep.note` change : nouvelle époque de notes (événement), rien d'autre. Au premier lancement (pas de population.json) : génération 0 (§ 6.4).
2. **Naissances** (G ≥ 1), avec le générateur du maître `rng=mulberry32(pop.rng)`, dans cet ordre : pour k = 0..λ−1 : si k < `immigres` → immigré ; sinon
   `p1=tournoi()`, `u=rng.suivant()`, si `u<pCroisement` : `p2=tournoi()` (autre que p1 s'il y a au moins 2 éligibles), `croiser(p1,p2)`, puis `muter` ; sinon `muter(p1)`.
   Doublon (`id` dans `dejaVus`) → `muter` encore, `essaisDoublon` fois au plus. Puis **graines** : `grainesEntrainement(pop.graines, rng, nGraines)`.
   Puis `pop.rng=rng.etat()` et **écriture de population.json**.
3. **Courses** : tous les vivants × `grainesGeneration`, ordre des tâches : graine par graine, puis vivant par vivant (dans l'ordre de `vivants`), usage `entrainement`.
   (28/11/2026, lot « règles », A6, § 11.4) Les tâches gardent cet ordre, mais elles sont **demandées** à l'ordonnanceur de la plus longue attendue à la
   plus courte (`cfg.ordreCourses` `"longues"` ; `"origine"` = l'ordre ci-dessus) ; chaque résultat revient à sa place.
4. **Retraits** (corrigés le 27/11, § 8) : une graine non mesurée chez **deux pilotes ou plus** (ou chez le témoin) entre dans `grainesRetirees` (pour toute l'époque :
   elle sort de la note de tous) ; ratée par un seul pilote, elle reste pour les autres (événement). Un vivant dont la somme des `pannesEssais` de ses lignes de la
   génération atteint `pannesVire` → mort `pannes` (même le champion ; jamais le témoin : arrêt, code 1). Puis un vivant (hors témoin) qui a `nonMesureesVire` (2)
   courses non mesurées dans la génération → mort `non-mesuree`.
5. **Note** de tous : `note.noter(lignes d'entrainement de l'époque des courses, {REF, exclure:grainesRetirees})`. (28/11/2026, lot « règles », § 11.4) Les lignes
   sont d'abord **rangées** (génération, graine, pilote, clé : `E.ordreLignes`) : la note ne dépend plus de l'ordre où les courses ont fini.
6. **Renvoi** : éligibles = vivants hors témoin et champion avec ~~`n ≥ protectionCourses`~~ `ne ≤ G − protectionGenerations` (28/11, lot « règles », A4) ; on en vire `min(éligibles, vivants − μ)`, les F les plus bas (égalité : la
   survie `a` la plus basse, puis l'`id`). Chaque mort → morts.jsonl, **à la fin de la génération seulement** (avec generations.jsonl et population.json `fin`, § 8).
7. **Validation**, **coffre**, **phase**, **économie** (§ 6.5 à 6.7).
8. generations.jsonl, `tableau.ecrire(cfg)`, lecture de `STOP` / `PAUSE`.
~~La population.json n'est pas réécrite en fin de génération~~ (elle l'est, avec `etape:'fin'` : écart de l'intégrateur, § 3.4) : une reprise relit le début de G, refait les courses (toutes en cache), la note, le renvoi et la validation
(déterministes : les bootstraps ont leur propre générateur `rngDe`), puis passe à G+1.

### 6.2 Mutation, croisement, tournoi
- **Tournoi** : 3 tirés sans remise (`rng.entier`) parmi les éligibles (vivants, témoin compris, avec ~~`n ≥ protectionCourses`~~ `ne ≤ G − 1 − protectionGenerations`, 28/11, lot « règles », A4) ; le meilleur F gagne (égalité : `id`).
  Moins de 3 éligibles : les éligibles sont les vivants qui ont le plus de courses (tous ceux qui ont le `n` maximal) — c'est le cas de la génération 1.
- **Mutation** (`muter`, phase A et suivantes) : `m = genes ?? 1+rng.poisson(poissonMutations)` réels **distincts** tirés dans ~~`CONTINUS`~~ `reelsLus(parent)` (28/11, lot « règles », C2 : `CONTINUS` moins les réels dont le drapeau de garde, table `genome.GARDES`, vaut 0 chez le parent ; m borné à cette urne) ; chacun reçoit
  `x + rng.normal()·sigma·(max−min)` (sigma = `o.sigma ?? sigmaMutation`), réflexion aux bornes (`x>max → 2max−x`, `x<min → 2min−x`, puis bornage) ;
  puis chaque drapeau bascule avec `pDrapeau` (un `rng.suivant()` par drapeau, dans l'ordre de BORNES) ; `dessousDecor` prend une autre de ses 3 valeurs avec
  `pDrapeau` ; `figMax` ±1 (moitié-moitié) avec `pFigMax`.
  Phase B en plus : avec `phases.B.pTete`, une tête tirée au sort (moitié-moitié) reçoit `N(0, phases.B.sigma)` sur `max(1, round(part·nW2))` de ses W2 distincts
  (rayon : 2 sur 6 ; sol : 5 sur 18). Phase C en plus : avec `phases.C.pTete`, une tête reçoit `N(0, phases.C.sigma)` sur `max(1, round(part·nW1))` W1 (22 ; 7).
  Puis `reparer`. `mutes` liste les gènes réellement changés (et `'WV'`/`'WS'` pour une tête).
- **Immigré** : `muter(champion, {genes:immigreGenes, sigma:immigreSigma})` (les têtes suivent la règle de la phase).
- **Greffe** (28/11/2026, config `greffes`, `greffes.js`) : à la place de l'immigré quand le cycle le dit : `forcer(champion, ensemble)`, sans tirage ; si le champion porte déjà ces valeurs ou si l'enfant est déjà vu : une mutation ordinaire du génome greffé, valeurs reforcées (aussi après chaque remutation de doublon). L'enfant garde `origine:'immigre'` et porte `greffe:{…}` (vivants et `naissancesGeneration`) ; un événement « greffe … » est écrit, et redit à la reprise d'une génération interrompue.
- **Croisement** : chaque gène de BORNES pris chez g1 ou g2 (`rng.suivant()<.5` → g1) ; `WV` entier chez l'un (un tirage), `WS` entier chez l'un (un tirage).
- **Génération 0** : le témoin (`origine:'temoin'`), puis μ−1 mutants du témoin, `muter(temoin, {genes: genesMin + rng.entier(genesMax−genesMin+1), sigma:.15})`,
  `origine:'g0'`. Le témoin est le champion (`champion.id = temoin`, sans validation, sans fichier). `pop.rng` part de `cfg.graineMaitre`.

### 6.3 Les courses de validation et de coffre
- Toutes par le même ordonnanceur, `usage:'validation'|'revalidation'|'coffre'`, `tmax = cfg.tmax`. Le cache rend celles déjà jouées.
- Elles **n'entrent pas** dans la note d'entraînement (§ 6.1-5 ne lit que `usage==='entrainement'`) : la malédiction du gagnant se mesure sur des courses neuves.

### 6.4 La note du meneur et la règle 6
Meneur = vivant au plus haut F avec `n ≥ validation.nMin` (48), hors champion. Condition : `G − derniereValidation ≥ validation.intervalle` et
`F_meneur − F_champion > regle6 · sqrt(se_F_meneur² + se_F_champion²)`. Alors ~~24 graines `grainesValidation`, 48 courses, `note.comparer(meneur, champion)`~~
**(28/11/2026, lot « sacre », § 11.1)** la validation séquentielle : 24 graines, puis des paquets de 12 jusqu'à 96, un regard (`note.comparer`) après chaque lot.
`malediction = dF_entrainement − dF_validation` (le dF du **premier** regard, § 11.2) ; ~~si les `maledictionFenetre` dernières validations ont une moyenne > `maledictionSeuil` : `regle6 = regle6Haute`
(une fois, événement)~~ l'alarme ne sonne que si `maledictionSeuil` est un nombre ; `null` (config.json) ou absent : jamais (§ 11.2). Sacré → fichier champion, `champion = {id, depuis:G, fichier}`, `sansSacre = 0`, coffre « sacre ». Sinon `sansSacre` continue de compter.
`--valider-maintenant` : le meneur (ou, à défaut de n ≥ 48, le plus haut F) contre le champion, sans condition. Sa ligne porte `forcee:true` et n'entre **pas**
dans la malédiction du gagnant (27/11, le correcteur).

### 6.5 La revalidation (le flou de « doit être revalidé », spec § 7.1)
Après une nouvelle époque des courses, si le champion n'est pas le témoin : à la première génération de l'époque, champion contre témoin sur 24 graines de validation
neuves (`usage:'revalidation'`, `note.comparer(champion, temoin)`). Le champion **garde** son titre sauf si `dF < −revalidationPerte · se_dF` ; sinon le témoin
redevient champion (événement). `revalider=false` ensuite. Une nouvelle époque de notes seule ne demande pas de revalidation.

### 6.6 Le coffre
Après chaque sacre, après chaque revalidation, et si `dernierCoffre` a plus de `coffre.intervalle_h` heures : champion et témoin × les 40 graines du coffre ;
note : palier moyen (simple moyenne, pas de modèle), `ecartFoule` pour E et l'écart classique ; une ligne coffre.jsonl ; `dernierCoffre = maintenant`.

### 6.7 Phases et économie
- Passage A→B, B→C : `sansSacre ≥ phases.passage.sansSacre` **ou** `G − phaseDepuis ≥ phases.passage.generations` (A : `phaseDepuis = 0`). Au passage :
  `phase` change, `phaseDepuis = G`, `sansSacre = 0`, événement. Les génomes ne changent pas.
- ~~Une génération de plus de `seuilEconomie_s` : `nGraines = grainesEconomie` jusqu'à la fin de l'époque.~~ (27/11, le correcteur) `pleine_s` = durée des courses
  d'entraînement hors PAUSE × (tâches / courses jouées) × grainesParGeneration / graines de la génération ; `pleine_s > seuilEconomie_s` → `grainesEconomie` à partir
  de la suivante ; `pleine_s ≤ 0,9·seuilEconomie_s` → retour à `grainesParGeneration`. Une génération dont moins de la moitié des courses a été jouée ne décide rien.

### 6.8 STOP, PAUSE, verrou, refus de partir
- `STOP` lu avant chaque lancement de course (`doitArreter`) et en fin de génération : plus aucune course, attente des enfants, journaux écrits pour ce qui est
  fini, `tableau.ecrire`, verrou retiré, `STOP` effacé, code 0. La génération interrompue sera reprise (§ 6.1, dernière phrase).
- `PAUSE` : `enPause` ; on attend sa disparition (vérification toutes les 5 s), le battement continue.
- Refus de partir (code 2) : verrou vivant, `refusDePartir()` non nul.

---

## 7. Répartition proposée (cinq développeurs, sans se parler)

| Dév. | Modules | Dépend de (seulement par ce contrat) |
|---|---|---|
| 1 | `commun.js`, `enfant.js`, `courses.js` | note.pourquoiEcartee (§ 2.6) |
| 2 | `genome.js`, `modele.js`, `identite.js` | commun, graines (mulberry32), courses |
| 3 | `graines.js`, `note.js` | commun |
| 4 | `evoluer.js` | tous |
| 5 | `tableau.js`, `etat.js`, `inscrire-champion.js`, `lancer.cmd`, `arreter.cmd`, `installer-tache.cmd`, `README.md`, `.gitignore` | commun, formats § 3 |

`.gitignore` de `ml/evolution/` : `etat/courses*.jsonl`, `etat/pilotes/`, `etat/sortie.log`, `etat/verrou.json`, `etat/STOP`, `etat/PAUSE`, `etat/ARRETE`,
`*.tmp` (partout : champions/ aussi), `essais/` ; (27/11 au soir) `etat/verrou.json.*`, `etat/*.fragment-*`, `etat/traces.log*`, `etat/PAS-D-ENVOI`. L'état d'exemple des tests (`tests/etat-exemple/`, fabriqué par `tests/fabriquer-etat-exemple.js`) se committe.
Tests : chaque développeur range ses tests dans `ml/evolution/tests/<module>.test.js` (Node pur, `node tests/x.test.js`, code 0/1) ; au plus 4 courses à la fois,
45 à 60 s de jeu, sauf si le test de la spec en demande plus.

---

## 8. Les corrections d'après les trois relectures (27/11/2026, le correcteur)

Ce paragraphe fait foi là où il contredit ce qui précède (les endroits touchés renvoient ici). Tests : `tests/robustesse.test.js` et `tests/generation.test.js`
(sans course), `tests/courses.test.js f g h`, et les cas ajoutés à `tests/note.test.js` et `tests/commun.test.js`.

**Règles (écarts à SPECIFICATION.md, à reporter dans la spec par qui la tient) :**
- Sacre : critère (a) `ΔF > seuilSacre·se(ΔF)`, `cfg.validation.seuilSacre = 2` (spec § 7.6 : 1). Mesure (`tests/relecture-statistique/d-sacre-nul.js 300`) :
  faux sacres 18,3 % → 3,7 % quand le meneur ne vaut pas mieux ; mais la puissance baisse : +1 palier sacré 12 % du temps (37,7 % avant), +2 paliers 34 % (65,7 %).
- `ā` du rétrécissement : la moyenne des `a` des **vivants** (`noter(…, {ids})`), plus de tous les pilotes de l'époque, morts compris.
- E : une mesure de la référence absente de toutes les parties compte au pire (`borneZ − zoneMorte`, avec son poids).
- Retraits : une graine n'est retirée pour l'époque que si elle manque à deux pilotes ou plus, ou au témoin. Un pilote (hors témoin) à 2 courses non mesurées dans
  une génération est viré d'office (`raison:'non-mesuree'`). Les pannes se comptent sur tous les essais (`Ligne.pannesEssais`).
- Économie de graines : sur la durée des seules courses d'entraînement, hors PAUSE, avec retour à 12 sous 90 % du seuil (§ 6.7).
- `--valider-maintenant` : `forcee:true`, hors malédiction du gagnant.

**Formats :**
- `Ligne` (§ 3.3) : + `pannesEssais` (somme des `pannes` de tous les essais de la tâche jusqu'à celle-ci), + `fichiers_sha` (l'empreinte des fichiers de l'époque que
  l'enfant a lus juste avant son `require('../bot/piloter')`), + `env:true` sur un échec d'**environnement** : `chien de garde`, `processus fini sans resultat…`,
  `… decision(s) coupee(s) par la limite de temps…`, `jouee avec d'autres fichiers du bot…` (`K.estEnv(l)` le reconnaît aussi sur une vieille ligne, par sa raison).
- Résultat compact de l'enfant (§ 2.1) : + `fichiers_sha`. L'enfant ignore SIGINT (seul le maître décide ; il le tue au second Ctrl+C).
- `Epoque.composants` (§ 3.10) : + `regime`, + `fichiers_sha` ; `courses` hashe aussi `regime`.
- `Population` (§ 3.4) : + `identite` (12 hex : sha1 de genome.js et de pilote-voltige.js tels que chargés, et du texte du témoin). Si elle change sans nouvelle
  époque des courses, le contrôle d'identité est refait (événement), puis elle est réécrite. Une population d'avant ce champ refait donc le contrôle une fois.
  Si `pilote-voltige.js` ne donne plus le génome du témoin, un événement « ATTENTION » le dit ; le témoin reste celui de la naissance de la population.
- `generations.jsonl` (§ 3.5) : + `dureeEntrainement_s` (hors PAUSE), + `pleine_s` (la durée ramenée qui décide l'économie, `null` si rien n'est décidé).
- `validations.jsonl` (§ 3.6) : + `forcee:true` pour `--valider-maintenant`.
- `morts.jsonl` (§ 3.7) : `raison` + `non-mesuree` ; écrit seulement à la fin de la génération.
- Restes : `verrou.json.mort-<pid>` (le verrou mort repris), `verrou.json.reprise` (la garde de la reprise, effacée aussitôt), `<journal>.fragment-<date>`.

**Le cache et l'ordonnanceur (§ 2.2) :**
- Règle 1 : une clé est finie avec 2 lignes `mesuree:false` dont les échecs d'environnement **de lancements précédents ne comptent pas** (seuls ceux du lancement
  en cours) : un chien de garde trop court ou un PC chargé ne perd plus une graine pour toujours. Les échecs déterministes (chargement, yeuxTirages, autre jeu,
  autre simulateur, autre node) restent définitifs.
- Un échec pendant un arrêt (`doitArreter()` vrai, ou `arreter()`) n'est pas un verdict : la ligne est gardée au cache, la tâche rend `null` (génération interrompue).
- Seules les lignes de l'époque des courses en cours sont gardées en mémoire.
- Une erreur de l'ordonnanceur lui-même (écriture impossible…) : plus aucun lancement, `demander()` rejette, l'erreur remonte au maître (code 1, verrou rendu).
- Le tri rejette une course jouée avec d'autres fichiers du bot ; le maître coupe alors la génération (`ctx.arret.epoque`), relit l'état du disque et la reprend
  dans la nouvelle époque (3 fois au plus par lancement).

**commun.js :** `ecrireAtomique(f, texte, {total_ms})` réessaie le `rename` sur EPERM / EACCES / EBUSY jusqu'à ~10 s et efface son `.tmp` en cas d'échec final ;
`ecrireAtomiqueOctets` (sans contrôle LF : pilotes/) ; `renommerSur`, `dormir` ; `reparerFin(fichier, journal?)` (la réparation de `reparerFins`, pour tout journal) ;
`FICHIERS_EPOQUE`, `shaFichiersEpoque({tolererManquants})`, `shaDesFichiers` (déplacés de courses.js, qui les réexporte) ; `nettoyerTmp(dossier)` (les `*.<pid>.tmp`
d'un pid mort, un niveau de sous-dossiers).

**evoluer.js :** `charger` répare la fin des 4 journaux, efface les `.tmp` morts et **lève** sur une ligne illisible au milieu (« journal illisible ») au lieu de
l'avaler. `verrouiller(cfg, {surPerte})` (§ 3.9). `preparer` relit la référence des joueurs quand l'époque des notes change.

**.gitattributes :** `*.js`, `*.json`, `*.jsonl`, `*.md`, `*.html`, `*.txt`, `champions/**` en `-text` (core.autocrlf=true sur ce PC : sinon les sha de modele.js,
enfant.js et des champions changeraient à l'extraction) ; `*.cmd` garde `text eol=crlf`.

**Non corrigé :** la rotation des `courses-*.jsonl` des époques closes (ils restent sur le disque et sont relus — mais plus gardés en mémoire — à chaque lancement).

---

## 9. Les finitions du 27/11 au soir (trois lots, puis l'intégrateur)

Trois lots faits et relus le soir du 27/11 : « machine », « traces », « gestes ». Leurs notes complètes (formats, essais, relectures) : `notes/machine.md`,
`notes/traces.md`, `notes/gestes.md`. Ce paragraphe fait foi là où il contredit ce qui précède (les endroits touchés y renvoient). L'état de la livraison et
les commandes à taper sur le PC de nuit : `notes/LIVRAISON.md`.

### 9.1 Le même dépôt sur n'importe quel PC : `machine.json` et le banc automatique (lot « machine »)

- **La ligne de commande** de evoluer.js est contrôlée en entier par `lireOptions(argv, {existe})` **avant** la config, le verrou et toute course :
  ```
  node ml/evolution/evoluer.js [--config f.json] [--etat dossier] [--travailleurs N] [--une-generation | --arret-apres N]
                               [--banc] [--valider-maintenant] [--bavard] [--aide | --help | -h]
  ```
  Option inconnue, mot en trop, valeur manquante ou absurde, option répétée, options incompatibles (`--banc` avec `--valider-maintenant`, `--une-generation`,
  `--arret-apres` ou `--travailleurs` ; `--valider-maintenant` avec `--une-generation` ou `--arret-apres` ; `--une-generation` avec `--arret-apres`), `--config`
  introuvable → l'erreur et l'usage sur stderr, **code 2**. `--option=valeur` est accepté. `--travailleurs` de 1 à 256.
- **D'où vient le nombre de courses à la fois**, dans l'ordre : (1) `--travailleurs N`, pour ce lancement, rien n'est écrit ; (2) un nombre écrit dans la config ;
  (3) `<etat>/machine.json` s'il est de CE PC (même empreinte du nom du PC — `commun.empreintePc()`, `pc-` + 8 caractères : le nom lui-même n'est pas écrit, le fichier part sur un dépôt public —, même nombre de cœurs logiques L, format `evolution-machine-1`, nombre dans [1, L] — ou
  dans `banc.liste` si la liste a été écrite à la main) ; (4) le repli `max(1, L−2)`, borné par le plus grand nombre d'une liste `banc.travailleurs` écrite.
  `commun.lireConfig` résout `"auto"` : `cfg.travailleurs` est **toujours un entier** ; en plus `_travailleursConfig`, `_travailleursSource`
  (`'ligne de commande'|'config'|'banc'|'auto'`), `_bancAFaire`, `_machine`, `_machinePourquoi`.
- **Le banc** (`banc(cfg, dire, {dossierEtat, doitArreter, surOrd, ecrire})` → `{travailleurs, retenu, interrompu, raison, resultats, machine}`) : liste « auto »
  `{⌈L/2⌉, L−4, L−2, L−1}` bornée à [1, L] ; pour chaque n, le témoin joue `n × max(2, ⌈courses/n⌉)` courses de `banc.tmax` s (vagues pleines, graines
  d'entraînement depuis 910000, sans cache, rien dans courses.jsonl) ; un n est écarté s'il a une panne, une course non mesurée ou relancée ; on garde le
  meilleur débit, et à moins de 5 % de lui le plus PETIT n. Fait au premier lancement sur un PC, **après la prise du verrou** et avant la génération 0
  (pas pour `--valider-maintenant`, qui prend le repli) ; refait au lancement suivant s'il a été interrompu (STOP, PAUSE, Ctrl+C), et au plus 3 fois
  (`C.ECHECS_BANC_MAX`) s'il finit sans nombre valable. Un banc raté n'écrase jamais un machine.json réussi. Une écriture impossible de machine.json est dite
  et n'arrête rien (le nombre vaut pour ce lancement). Durée estimée : vraie config sur 16 cœurs, 11 à 46 min ; essai (liste [1, 2]), 1 à 5 min.
- **Le nombre de travailleurs n'entre ni dans `K.epoque`, ni dans `K.cle`, ni dans `shaIdentite`** : changer de PC ne change pas d'époque.
- `refusDePartir({dire, timeout_ms, commande})` : PowerShell a 5 s au plus ; absent, lent ou illisible → on part, et une ligne le dit.
- La console : `process.stdout`/`stderr` ont un écouteur `error` ; si elle meurt (EPIPE), la suite du journal va à la fin de `<etat>/sortie.log`.
- Exports nouveaux : commun.js `FORMAT_MACHINE`, `TRAVAILLEURS_MAX`, `ECHECS_BANC_MAX`, `coeursLogiques`, `listeBancAuto`, `listeBanc`, `repliTravailleurs`,
  `choisirTravailleurs`, `controlerTravailleurs`, `descriptionMachine`, `cheminMachine`, `lireMachine(d)` → `{machine, pourquoi}`, `ecrireMachine`, `bancAFaire`,
  `resoudreTravailleurs` ; evoluer.js `lireOptions`, `USAGE`, `planBanc`, `processusNode`.

**Format `<etat>/machine.json`** (un par PC ; atomique, LF ; il se committe sur la branche `evolution-…` de ce PC, jamais sur bots-ecurie) :
```json
{ "format": "evolution-machine-1", "ordinateur": "NOM-DU-PC", "cpus": 8, "modeleCpu": "Intel(R) Xeon(R) CPU E3-1245 v5 @ 3.50GHz",
  "memoireGo": 15.9, "node": "v24.22.3", "travailleurs": 2, "source": "banc", "date": "2026-11-27T19:02:29.156Z",
  "banc": { "date": "2026-11-27T19:02:29.151Z", "liste": [1, 2], "tmax": 45, "retenu": 2,
            "resultats": [ {"travailleurs": 1, "coursesParHeure": 103.6, "pannes": 0, "nonMesurees": 0, "relancees": 0, "courses": 4, "duree_s": 139},
                           {"travailleurs": 2, "coursesParHeure": 180.9, "pannes": 0, "nonMesurees": 0, "relancees": 0, "courses": 4, "duree_s": 80} ] } }
```
`source` : `'banc'` ou `'auto'` (le repli). Après un banc raté, `banc` porte aussi `raison`, `interrompu`, `echecs`, et `retenu` vaut `null`.

### 9.2 L'histoire : l'arbre, le récit, la mise à l'abri (lot « traces »)

- **`arbre.js`** → `<etat>/arbre.html` : une page seule (HTML + SVG dessiné par un petit programme inclus ; aucune ressource extérieure ; `file://`), clair et
  sombre, lisible de 380 à 1 300 px. Un pilote = un point à sa naissance et un trait jusqu'à son renvoi, rangé sur une « voie » (la hauteur reste fixe, ~32 voies) ;
  un fil vers chaque parent ; forme et couleur = l'origine ; la lignée du champion en titre en vert épais ; les 60 dernières générations en détail, les
  anciennes resserrées. La fiche d'un pilote (clic, clavier, recherche, `arbre.html#p=<id>`) dit sa naissance, ses parents, **ce qui a changé gène par gène,
  recalculé à partir des génomes** (avec un mot simple : `MOTS`), ses notes, son renvoi, ses sacres, ses enfants.
  API : `ecrire(cfg, o?)`, `page`, `modele(cfg, {donnees?})`, `donneesPage(M, o)`, `programme`, `motDe`, `lireLigne`, `MOTS` ; ligne de commande
  `node ml/evolution/arbre.js [--config f] [--etat dossier]`. `modele` ne garde qu'une ligne par génération (la dernière écrite : une génération refaite après
  une coupure n'est comptée qu'une fois). Le format des données de la page : `notes/traces.md` § 2.
- **`histoire.js`** → `<etat>/histoire.md` : le récit, réécrit en entier (Markdown simple, sans HTML) : une phrase, « Les mots », « Où on en est » en dix lignes,
  puis une entrée par génération et la génération en cours. « La sélection apprend-elle vraiment ? » compte **une mesure du coffre par champion** et ne conclut
  qu'au-delà du bruit (1,5 palier sur 40 courses, estimation tirée de `ml/ecurie/etude/selection-naturelle/bruit/resultats.txt` § 1). Les événements inconnus
  sont recopiés tels quels. API : `ecrire`, `texte`, `message` (la ligne du commit, ASCII), `nomPc`, `evenementClair`, `phraseValidation`, `phraseCoffre` ;
  ligne de commande `node ml/evolution/histoire.js [--config f] [--etat dossier] [--message | --pc]`.
- `tableau.ecrire` appelle les deux (§ 2.8) : ils sont donc refaits à chaque génération, sans toucher à evoluer.js (mesuré : 0,9 s pour 5 054 pilotes).
- **`sauver-traces.cmd [auto]`** (CRLF, ASCII), dans le dossier de la sélection :
  1. refuse (code 2) hors d'un dépôt git, sur `main`, sur `bots-ecurie`, sur toute branche qui ne commence pas par `evolution-`, sur une HEAD détachée, et
     pendant une fusion, un cherry-pick, un revert pas finis ou un fichier en conflit ;
  2. `node ml\evolution\tableau.js` (repli : arbre.js puis histoire.js) ;
  3. `git add` des journaux légers qui existent (`population.json`, `generations.jsonl`, `validations.jsonl`, `morts.jsonl`, `coffre.jsonl`, `machine.json`,
     `champions` s'il porte un `.js` ou un `.json`) ; **du nouveau se juge sur les journaux seuls** (les pages portent l'heure) ; une page jamais sauvée compte ;
  4. s'il y a du nouveau : `git commit --only -m "BOTS-ML evolution <pc> : <histoire.js --message>" -- <ces fichiers et les pages>` (identité de repli
     `selection CASH CAR (<pc>)` / `selection@<pc>.invalid` pour ce seul commit si git n'en a pas), puis `git -c gc.auto=500 gc --auto --quiet` ;
  5. sauf si `etat\PAS-D-ENVOI` existe : `git -c http.lowSpeedLimit=1 -c http.lowSpeedTime=120 push origin HEAD:refs/heads/<la branche courante>`, même sans
     nouveau commit ; jamais `--force`, jamais vers main. Un envoi raté n'est pas une erreur (code 0).
  En `auto` : rien à l'écran, aucune question (`GIT_TERMINAL_PROMPT=0`, `GCM_INTERACTIVE=never`, `GIT_SSH_COMMAND=ssh -o BatchMode=yes -o ConnectTimeout=30` s'il
  n'y en a pas déjà un). Le détail va dans `etat\traces.log` (mis de côté en `traces.log.ancien` au-delà de ~1 Mo) ; la ligne de bilan dans traces.log
  (réessayée 5 fois : un enfant de git peut tenir le fichier un instant) et, si personne ne le tient, dans sortie.log. `<pc>` dans le message des commits = la fin du nom de la branche (`evolution-ryzen` → `ryzen` ; relecture de Fable, 27/11 : le nom Windows du PC ne part pas sur GitHub) ;
  `histoire.js --pc` (le nom du PC en minuscules, ou `EVOLUTION_PC`) ne sert plus qu'à l'affichage local de l'installateur. Vercel ne publie que `main` : une branche `evolution-…` ne déclenche rien.
- `installer-tache.cmd` pose la tâche horaire `CashCarEvolution-traces` (§ 2.9 bis).

### 9.3 Les gestes des joueurs (lot « gestes ») : 21 gènes, le génome v:2

Cinq gestes des joueurs (`ml/ecurie/etude/selection-naturelle/PROPOSITIONS.md`, remarques des vérificateurs comprises), chacun gardé par un drapeau **éteint
à la naissance** : drapeau à 0, son code ne s'exécute pas, ses réglages ne sont pas lus, la mémoire du pilote ne reçoit aucun champ (vérifié au bit près :
`identite.test.js`, et 6 graines longues avec les réglages poussés à leurs bornes, `notes/gestes.md`).

| geste | drapeau | réglages : [min ; max] naissance |
|---|---|---|
| 1. lâcher le volant juste avant la pose sur la dalle (`versRoute`/`versRoutePlane`) | `lacheOn` | `lacheAvant` [0,15 ; 0,5] 0,35 s |
| 2. slalom : cap alterné, horizon allongé (même bloc que capZ, virage doux u<0,5) | `slalomOn` | `slalomCap` [0,2 ; 0,5] 0,35 rad ; `slalomDemi` [0,38 ; 0,65] 0,45 s ; `slalomH` [0,9 ; 3,5] 3 s |
| 3. coup de nitro vu, version serrée (au plus 3 par vol) | `coupOn` | `coupDepuis` [0,35 ; 1,2] 0,6 ; `coupEcart` [0,5 ; 1,5] 0,7 ; `coupDuree` [0,1 ; 0,3] 0,15 ; `coupPoseMin` [0,5 ; 1,5] 0,8 ; `coupAxe` [0,2 ; 0,5] 0,35 ; `coupAir` [0,4 ; 1,5] 0,8 ; `coupJauge` [0,2 ; 0,6] 0,35 ; `coupPerte` [0 ; 60] 10 m ; `coupDecor` (drapeau) 0 |
| 4. garder la nitro après un décollage nitro tenue (pas pour `plane`/`viserPlane`) | `relacheOn` | `relacheT` [0,12 ; 0,45] 0,25 s |
| 5. au sol après la pose, la ligne suit la glisse | `suitOn` | `suitDerive` [0,1 ; 0,6] 0,3 s ; `suitMarge` [0 ; 0,5] 0,25 s |

- `BORNES` : les 21 en **fin** (6 drapeaux, 15 réels) → 107 gènes, `CONTINUS` 79. Les drapeaux suivent la règle commune (`pDrapeau` 0,03 : chaque geste est essayé
  par ~3 % des enfants, ~une génération sur cinq) ; le croisement les mélange gène par gène.
- **Génome v:2** (§ 3.2) ; `migrer` (§ 2.3) ; `valider` migre en place, donc `evoluer.charger` (qui valide chaque vivant lu) passe toute la population en v:2 en
  mémoire, et population.json est réécrit en v:2 au prochain `ecrirePop`. `copier`, `croiser`, `reparer` écrivent v:2.
- **L'identifiant ne change pas** : `shaGenome` d'un génome dont les 21 gènes sont à leur naissance = le sha1 de sa forme v:1 (`{v:1, A:(les 86 premiers), WV, WS}`).
  Le témoin garde `19e3767cc346` ; `dejaVus`, `champion.id`, `temoin` et les journaux restent justes. Dès qu'un gène de geste s'écarte : sha1 du v:2 entier.
- `ecrirePilote` écrit les 21 clés dans `REGLAGES` après `volMieux` (§ 5.1). `modele.js` : `RETOURS_DEMANDES` (= `R.retours`, plus les deux lois du coup si
  `coupOn`) est envoyé aux yeux et compté par le contrôle des rayons (§ 5.7).
- **`modele.js` fait partie de l'époque** : au premier lancement avec ce code, une population existante change d'époque (les notes repartent de
  zéro, les courses sont rejouées, les pilotes restent) et refait le contrôle d'identité. Voulu.
  **(28/11/2026, lot « règles » — correction : la phrase disait « `modele.js` et `genome.js` ».)** `genome.js` n'est **pas** dans l'époque des courses :
  `commun.FICHIERS_EPOQUE` ne le contient pas (§ 3.10), et une course ne dépend de lui que par le **texte** du pilote, dont le sha (`shaPilote`) est
  déjà dans la clé du cache. Changer `genome.js` sans changer `ecrirePilote` (par exemple `muter`) ne change aucune course ni aucune note : seulement
  la suite des naissances. Il entre en revanche dans l'**empreinte d'identité** (`evoluer.shaIdentite`, population.json `identite`) : à son premier
  lancement avec un `genome.js` changé, le maître refait le contrôle d'identité (3 courses du témoin), sans changer d'époque. Ce qui changeait
  l'époque avec les gestes, c'était `modele.js`.
- `distance` divise par 107 et non plus 86 : la diversité affichée baisse d'environ 20 % ; `alarmeDistance` passe à 0,04, puis à 0,012 après la mesure d'une vraie population (§ 3.1) ; 0,011 sur 121 gènes (28/11, § 11.3).

### 9.4 Ce que l'intégrateur a ajouté ou corrigé (27/11 au soir)

- `arbre.js` : un génome v:1 relu des journaux (morts.jsonl, ou population.json d'avant les gestes) est **migré** (`Gn.migrer`, sur l'objet lu, jamais réécrit) :
  l'enfant v:2 d'un parent mort v:1 montrait 21 changements « undefined → naissance ». Les 21 gènes des gestes ont leur mot simple dans `MOTS`
  (`tests/traces.test.js` l'exige : il échouait).
- `tableau.js` : l'en-tête ne dit plus « Rien n'est publié » (faux depuis sauver-traces.cmd).
- `sauver-traces.cmd` : la ligne de bilan dans traces.log est réessayée (elle s'y perdait parfois après un envoi SSH raté : `tests/relecture-traces.test.js` échouait).
- `config.json` : `alarmeDistance` 0,04, ramenée à 0,012 par Fable le soir même (+ une note dans `_notes`).
- `installer-tache.cmd` : la troisième tâche ; le texte d'avant le O / N dit exactement ce qui part, vers quelle adresse et quelle branche (§ 2.9 bis).
- `tests/evoluer.test.js` : `--travailleurs N` (4 par défaut, comme avant) ; la copie temporaire d'un relecteur (`tests/zz-relecteur-evoluer.tmp.test.js`) est effacée.
- `.gitignore` : le commentaire de fin dit où et par qui les journaux se committent.
- README : « INSTALLER SUR UN NOUVEAU PC » et « METTRE À JOUR » (vérifiés dans un clone jetable : `git worktree add -b evolution-ryzen …`, `git merge --no-edit`,
  et l'identité git qu'exige une fusion sur un PC qui n'en a pas).
- Test : `tests/integration.test.js` (aucune course, ~15 s).

### 9.5 Ce qui n'est pas fait (connu)

- Le tableau (section « 7. La machine ») ne montre pas encore machine.json (etat.js le montre, ligne 3).
- ~~Les tâches planifiées s'ouvrent dans une fenêtre noire (`/it`) : une fois par heure, quelques secondes (il faudrait un lanceur caché, `.vbs`).~~
  (28/11, l'intégrateur) Fait : `cache.vbs` et les tâches XML, § 10.5.
- `valider` migre encore en place (le conseil du lot « gestes » : `Gn.migrer` en clair dans `evoluer.charger`, puis `valider` pur) : pas fait, le comportement
  est juste et testé.
- Un enfant dont seuls des réglages de gestes éteints ont muté conduit comme son parent mais est rejoué (~4 % des enfants) : coût de calcul accepté.
- `morts.jsonl` grossit d'~1 Mo par jour : vers 100 Mo (refus de GitHub) dans 2 à 3 mois, il faudra le découper (evoluer.js).
- `machine.json` se committe sur la branche `evolution-<pc>` de chaque PC : deux PC ne doivent pas partager la même branche.
- `lancer.cmd` ne dit « Premier lancement sur ce PC » que si `etat\machine.json` manque (pas s'il vient d'un autre PC : le banc a quand même lieu, dit dans sortie.log).
- `tests/evoluer.test.js` (étapes bd, c, f, g) et `tests/courses.test.js` n'ont pas été relancés avec ce code.

## 10. Le portage de la boucle payante (28/11/2026, tâche « portage » — « le génome doit savoir écrire c0101 comme il écrit c0025 »)

Ce paragraphe complète les § 2.3, 2.7, 2.10, 3.1, 3.2, 3.4, 3.11 et 4.1 ; en cas de doute, il l'emporte sur eux. Le détail et les mesures : `notes/portage.md`.

### 10.1 Le génome v:3 (121 gènes)

- `BORNES` = les 107 gènes de v:2, puis les **14 gènes du portage** (`Gn.PORTAGE`), dans cet ordre :
  `fuirVite` (drapeau, c0026), `bordOn` (drapeau, c0064), `bordNitro` [0,3 ; 1,2] 0,7, `bordJauge` [0,2 ; 1] 0,5,
  `largeOn` (drapeau, c0072), `largeHaut` [2 ; 15] 4, `largeT1` [1,6 ; 3] 2,2, `largeT2` [1,2 ; 3] 1,8, `largeAxe` [0,25 ; 0,8] 0,5, `largeAir` [0,5 ; 3] 1,5,
  `largeMax` (entier) [1 ; 5] 3, `libreOn` (drapeau, c0087), `nitroLibreK` [1 ; 1,6] 1,25, `tenirLibre` [0 ; 0,15] 0,05.
  Tous `ou:'R'` (lus `R.<clé>` dans `modele.js`, écrits dans REGLAGES après les gestes). 88 réels, 30 drapeaux, 1 choix, 2 entiers (`largeMax` mute comme `figMax`, `pFigMax`).
- Naissance : drapeaux à 0 (la conduite de c0025, au bit près), réglages à la valeur de c0101 (inertes tant que le drapeau est éteint).
- `Gn.migrer` : v:1 (86 gènes) → v:3 (gestes et portage à leur naissance) ; v:2 (107 gènes, `Gn.CLES_V2` dans l'ordre) → v:3 (portage à sa naissance). En place.
- `Gn.shaGenome` : portage tout à sa naissance → le sha du génome v:2 d'avant (lui-même ramené au v:1 si les gestes sont aussi à leur naissance) ; sinon le
  sha du v:3 entier. **Un pilote né avant le portage garde son identifiant** (`tests/portage.test.js` p4 : 200 mutants écrits par le genome.js du commit 7f9543955).
- `modele.js` porte les quatre blocs, chacun gardé par son drapeau (`R.fuirVite`, `R.bordOn`, `R.largeOn`, `R.libreOn`) ; `poseNette` est une constante de plus.
  `modele.js` est dans l'époque : une population existante change d'époque au premier lancement avec ce code (§ 9.3, même règle).

### 10.2 Le témoin choisi

- `config.json` `"temoin"` : `c0025` (défaut, `ml/ecurie/pilote-voltige.js`), `c0026`, `c0064`, `c0072`, `c0087`, `c0101` (`ml/labo/cerveaux/cNNNN-pilote.js`). Hors de l'époque.
- `Gn.nomTemoin(cfg)` (lève sur un nom inconnu), `Gn.sourceTemoin(cfg)` (le chemin absolu du fichier écrit à la main), `Gn.TEMOINS`, `Gn.TEMOIN_DEFAUT`.
- `Gn.genomeTemoin(cfg)` lit REGLAGES dans le fichier du témoin ; les drapeaux du portage sont lus dans son **code** (`Gn.BLOCS` : les extraits de chaque bloc) et
  recoupés avec ses clés de REGLAGES (code sans clés, clés sans code, bloc à moitié : refus).
- `I.verifier({cfg})` compare le pilote fabriqué au fichier de **ce** témoin ; il rend aussi `temoin` (le nom) et `fichier` (chemin relatif à la racine).
  Les résumés gardent le nom `voltige` pour le fichier écrit à la main (compatibilité). `node ml/evolution/identite.js --temoin c0101`.
- `node ml/evolution/genome.js --temoin --nom c0101 [--ecrire f.js]`.

### 10.3 Un état garde son témoin ; `--repartir-de`

- `population.json` : `+ "temoinNom": "c0025"` (absent = c0025). `evoluer.charger` met `cfg.temoin` au témoin de la population ; si `config.json` en demande un
  autre, il le dit (une ligne) et garde celui de la population. `cfg._temoinDemande` garde la demande de la config.
- `champions/gNNNN-….json` : `+ "temoin"` (le nom). `inscrire-champion.js` en tire le parent au labo quand le précédent est le témoin.
- `node ml/evolution/evoluer.js --repartir-de NOM [--config …] [--etat …] [--travailleurs N] [--une-generation | --arret-apres N]` (incompatible avec `--banc`
  et `--valider-maintenant`) : 1. contrôle d'identité du nouveau témoin (raté : refus, code 1, rien ne bouge) ; 2. tout le dossier d'état va dans
  `<etat>/archives/<date UTC>-<ancien témoin>/` sauf machine.json, verrou*, sortie.log, STOP, PAUSE, ARRETE, PAS-D-ENVOI, traces.log*, le Node du PC (node.txt*,
  NODE-REFUSE.txt, node-choix-*, CHANGER-DE-NODE) et `archives/` ; les champions (`dossierChampions`, s'il est hors de l'état) vont dans `<archive>/champions/` ;
  `ARCHIVE.json` (`format: evolution-archive-1`) dit ce qui a bougé ; **rien n'est effacé** ; un déplacement raté remet les autres en place ; 3. la marche continue
  comme un premier lancement (génération 0 du nouveau témoin, sans refaire le contrôle qui vient de passer). Exports : `E.repartir(cfg, nom, dire, {doitArreter})`, `E.archiverEtat(cfg, neuf, dire)`.
  (28/11, le relecteur) Un STOP / PAUSE / Ctrl+C pendant le contrôle : refus **avant** l'archivage. Après l'archivage, la génération 0 naît (population.json
  écrit, `temoinNom`) avant tout test d'arrêt : un état n'est jamais laissé vide entre deux témoins (`tests/portage.test.js` p7).
- Pages : `etat.temoinNom(pop)`, `etat.temoinClair(pop)` ; le résumé, le tableau, l'arbre et l'histoire nomment le témoin de la population au lieu de « pilote-voltige ».
- Tests : `tests/portage.test.js` (sans course, ~20 s) ; `tests/identite.test.js` contrôle c0025 ET c0101 (21 courses de 45 s, 2 à la fois par défaut).
- (28/11, l'intégrateur) `histoire.md`, « Où on en est » : quand `<etat>/archives/*/ARCHIVE.json` existe (`format: evolution-archive-1`), une ligne de plus dit que
  la population est née d'un changement de témoin, combien de populations sont rangées et de quel témoin était née la dernière (`histoire.archivesAnciennes`).
  L'arbre et le tableau nomment le témoin de la population (`temoinClair`) ; ils ne parlent pas des archives.

### 10.4 Le Node fixe par PC (28/11/2026, lot « lanceurs » — « il faudrait que lancer.cmd utilise un chemin de Node fixe »)

La version de Node est dans l'époque des courses (§ 3.10, `composants.node`) : une autre version = une époque neuve, notes à zéro. Le détail : `notes/lanceurs.md`.

- **`etat/node.txt`** : une ligne, le chemin complet de `node.exe` (CRLF ; lu avec ou sans BOM, en UTF-8 ou UTF-16, avec ou sans guillemets). **Propre au PC, jamais
  committé** (`.gitignore` ; il contient le nom du compte Windows et le dépôt est public). Gardé en place par `--repartir-de` (§ 10.3).
- **`node node-fixe.js choisir --etat <etat> [--sans-ecrire] [--garder-marqueur]`** : la version attendue est `population.json` → `epoque.composants.node`
  (absente : aucune). `node.txt` présent : son Node doit exister et avoir cette version, sinon code 2. Absent : recherche (PATH dans l'ordre, le Node courant,
  Program Files, `%LOCALAPPDATA%\Programs\nodejs`, nvm-windows, fnm, Volta, Scoop, dossiers `nodejs` / `node-v*` près du dépôt et dans le profil), le premier de la
  bonne version est écrit dans `node.txt`. Sortie : ligne 1 = le chemin, la suite = l'explication. Code 2 = refus (le texte dit attendue, trouvées, comment corriger).
- **`etat/NODE-REFUSE.txt`** : le texte du dernier refus de `lancer.cmd` (effacé au premier lancement qui passe). **`etat/node-choix-*.tmp`** : la sortie de
  `node-fixe.js`, le temps d'un lancement.
- **`etat/CHANGER-DE-NODE`** (vide) : accepte **une fois** un Node d'une autre version (nouvelle époque voulue). Effacé par `node-fixe.js choisir` (sauf
  `--garder-marqueur`, que passe `installer-tache.cmd`), ou par `evoluer.js` quand c'est lui qui s'en sert (ci-dessous).
- **`lancer.cmd`** : Node d'amorce (`node.txt`, sinon `where node.exe`, sinon les deux dossiers usuels) → `node-fixe.js choisir` → `"%NODE%" evoluer.js …`, avec
  **`CASHCAR_NODE_FIXE=<chemin>`** dans l'environnement (28/11, l'intégrateur). `arreter.cmd`, `sauver-traces.cmd` : le Node de `node.txt` s'il existe, sans
  contrôle de version (ils ne jouent aucune course).
- **`evoluer.js` se garde seul** (28/11, l'intégrateur ; la demande n° 1 de `notes/lanceurs.md`) : `E.refusNode(cfg, op, {env, version, dire})` avant le verrou et
  le banc. Si `population.json` a `epoque.composants.node` ≠ `process.version` : **refus, code 2** (« REFUS DE PARTIR : la population … court sous Node … »), sauf
  `CASHCAR_NODE_FIXE` (lancer.cmd a déjà choisi, marqueur compris), `--nouveau-node`, `--banc`, ou `etat/CHANGER-DE-NODE` (accepté une fois, effacé, dit).
  Nouvelle option : **`--nouveau-node`**. Test : `tests/node-epoque.test.js` (sans course, quelques secondes).
  Ce qui reste : avec `--etat` / `--config` à part, `lancer.cmd` (`node-fixe.js`) ne regarde que l'époque de `etat/` ; `evoluer.js` regarde celle de l'état demandé.

### 10.5 Les tâches planifiées sans limite de durée (28/11/2026, lot « lanceurs »)

- `installer-tache.cmd` pose les trois tâches par **`schtasks /create /tn NOM /xml FICHIER /f`** (le `/f` remplace des tâches de mêmes noms, posées à la main
  comme sur le Ryzen). XML écrits par **`node node-fixe.js taches --ici <ml\evolution> --sortie <dossier> --node <node.exe> [--utilisateur D\nom] [--debut AAAA-MM-JJ]`**
  (UTF-16 avec BOM, plus `commandes.txt`).
- Communs : `ExecutionTimeLimit PT0S` (aucune limite ; `schtasks /sc` mettait 72 h), `MultipleInstancesPolicy IgnoreNew`, départ et marche sur batterie,
  `StartWhenAvailable`, `InteractiveToken` + `LeastPrivilege` (compte de la session, aucun mot de passe), priorité 7 ; action
  `wscript.exe //B //Nologo "<ici>\cache.vbs" "<ici>\lancer.cmd" auto` (ou `sauver-traces.cmd auto`), dossier de travail `ml\evolution`.
- `CashCarEvolution` : `LogonTrigger` + 5 min. `CashCarEvolution-relance` : chaque heure (00:05). `CashCarEvolution-traces` : chaque heure (00:35).
- **`cache.vbs`** : `wscript //B cache.vbs "<x>.cmd" args…` lance le .cmd dans une fenêtre cachée, attend, rend son code. Plus de fenêtre noire (§ 9.5 corrigé).
- **`installer-tache.cmd essai DOSSIER`** : le même texte, les XML et `commandes.txt` dans DOSSIER, rien de posé (ni `choice`, ni `schtasks`, ni `powercfg`,
  ni `node.txt`). `installer-tache.cmd enlever` : inchangé.
- Vérifié sans rien poser : les trois XML acceptés par le Planificateur en validation seule (COM, `TASK_VALIDATE_ONLY`). Non vérifié : le droit de poser le
  `LogonTrigger` sans administrateur, une stratégie qui couperait `wscript`.

### 10.6 Où ces formats sont décrits

| Format | Écrit par | Décrit dans |
|---|---|---|
| génome v:3, `Gn.PORTAGE`, `Gn.BLOCS`, `Gn.TEMOINS` | `genome.js` | § 10.1-10.2, `notes/portage.md`, commentaires de `genome.js` (`PORTAGE`) |
| `config.json` `"temoin"` | à la main | § 10.2, `config.json` `_notes` |
| `population.json` `temoinNom`, champion `.json` `temoin` | `evoluer.js` | § 10.3 |
| `<etat>/archives/<date>-<témoin>/`, `ARCHIVE.json` (`evolution-archive-1`) | `evoluer.js --repartir-de` | § 10.3, `notes/portage.md` |
| `etat/node.txt`, `NODE-REFUSE.txt`, `CHANGER-DE-NODE`, `node-choix-*` | `node-fixe.js`, `lancer.cmd`, à la main | § 10.4, `notes/lanceurs.md`, en-tête de `node-fixe.js` |
| `CASHCAR_NODE_FIXE`, `--nouveau-node` | `lancer.cmd`, `evoluer.js` | § 10.4 |
| les trois tâches (XML), `commandes.txt` | `node-fixe.js taches`, `installer-tache.cmd` | § 10.5, `notes/lanceurs.md` |
| l'état de la livraison, les gestes sur le Ryzen | — | `notes/LIVRAISON-C0101.md` |

## 11. Le réglage de la sélection (28/11/2026, trois lots « sacre », « règles », « tau », puis l'intégrateur)

La source : `ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md` (la synthèse, § 2 et § 4) et ses cinq études, relectures comprises. Ce paragraphe
complète les § 2.3, 2.5, 2.6, 2.8, 2.9, 2.10, 3.1, 3.4, 3.5, 3.6, 6.1, 6.2 et 6.4 ; en cas de doute, il l'emporte sur eux. Le détail et les mesures :
`notes/sacre.md`, `notes/regles.md`, `notes/tau.md` ; l'état de la livraison : `notes/LIVRAISON-REGLAGE.md`.

**Aucun de ces changements n'entre dans une époque** : ni `modele.js`, ni `enfant.js`, ni `cfg.reseaux`, ni `cfg.note` n'ont bougé ; `cfg.validation`,
`cfg.graines`, `protectionGenerations`, `ordreCourses` sont hors de l'époque. `genome.js` (C2) entre seulement dans l'empreinte d'identité (§ 11.6).

### 11.1 La validation séquentielle (A5, lot « sacre »)

- `cfg.validation.plan` : `"sequentiel"` (config.json) ou `"fixe"` / absent (la règle d'avant : un lot de `graines`, critère (a) à `seuilSacre`).
  Séquentiel : un premier lot de `graines` (24) graines neuves, puis des paquets de `pas` (12) jusqu'à `plafond` (96). Après chaque lot, un **regard** :
  `note.comparer` sur **toutes** les graines jouées jusque-là, le critère (a) à la borne `borneOBF × √(plafond / m)` (`borneOBF` 2,2 ; m = graines mesurées
  chez les deux pilotes, au plus n : 4,4 à 24, 3,1 à 48, 2,2 à 96).
  Décision (`E.decisionRegard`, pure) : **sacre** si (a), (b) et (c) passent ; sinon **futilite** si z = dF / se_dF < `futilite` (0,5) ; sinon **plafond** si
  n = plafond ; sinon **continuer**. Plus de graines de validation au milieu : **epuisees** (arrêt sans sacre) ; dès le premier lot : pas de validation (`null`).
- (b) et (c) : `dPalier > −seuilB·se_dPalier`, `dE < seuilC·se_dE` ; `seuilB`, `seuilC` 1 (absents = 1 : au bit près la règle d'avant). Passer à 2 est la
  décision D1 de Sacha (synthèse § 2 D) : non prise.
- Un plan mal écrit (entier attendu, nombre attendu, plan inconnu) est refusé au chargement (`E.planValidation`), avant toute course.
- La **revalidation** (§ 6.5) est inchangée : 24 graines, `revalidationPerte`, ni `plan` ni `regards`.
- **Reprise** : une validation interrompue (STOP, Ctrl+C, kill, coupure) n'écrit rien ; `population.json` (donc `graines.validationK`) n'est réécrit qu'à la
  fin de la génération ; la reprise retire les mêmes graines, le cache rend les courses jouées, `comparer` a son propre générateur (`rngDe('comparer|'+n)`) :
  mêmes regards, même ligne (`tests/validation-sequentielle.test.js` V5 ; un kill dur en vraies courses, `notes/sacre.md`).
- **Mesuré avec ce code** sur les vraies courses du 27/11 (`tests/mesure-sacre.js`, relu par un second chemin) : faux sacres 1,8 % (règle d'avant 3,0 %) ;
  un vrai +1 palier reconnu 31 à 33 fois sur 100 (avant 15) ; un +2, 80 à 84 fois (avant 44 ; 86 seulement à `seuilB` = `seuilC` = 2) ; un −0,5 : 0,1 %.
  Coût : environ 37 graines (74 courses) par validation quand le meneur ne vaut pas mieux, 60 quand il vaut +1, au lieu de 24.
- **Une ligne de `validations.jsonl`** (usage `validation`), exemple réel (essai, 3 puis 3 par 3 jusqu'à 9) :

```json
{"generation":0,"date":"2026-11-28T01:21:39.831Z","usage":"validation","forcee":true,"meneur":"6c66b73cb5e2","champion":"19e3767cc346",
 "graines":[1000000,1000037,1000074,1000111,1000148,1000185,1000222,1000259,1000296],"entrainement":{"dF":-0.2,"se_dF":0},
 "validation":{"graines":9,"dF":1.8,"se_dF":0.8041,"dPalier":0.2,"se_dPalier":0.8041,"dE":-0.4,"se_dE":0},"criteres":{"a":true,"b":true,"c":true},
 "sacre":true,"malediction":-1,"maledictionMoyenne":null,"fichier":"essais/sacre/A/champions/g0000-d936e49f.js",
 "plan":{"nom":"sequentiel","premier":3,"pas":3,"plafond":9,"borneOBF":2.2,"futilite":0.5,"seuilB":1,"seuilC":1},
 "regards":[{"n":3,"mesurees":3,"borne":3.8105,"z":0.5917,"dF":0.8,"se_dF":1.352,"dPalier":-0.8,"se_dPalier":1.352,"dE":-0.4,"se_dE":0,
             "criteres":{"a":false,"b":true,"c":true},"decision":"continuer"},
            {"n":6,"…":"…","decision":"continuer"},{"n":9,"mesurees":9,"borne":2.2,"z":2.2384,"…":"…","decision":"sacre"}],
 "arret":"sacre","courses":18}
```
  `graines` : toutes les graines jouées ; `validation` et `criteres` : ceux du **dernier** regard ; `regards[k]` : `n` (graines jouées), `mesurees`
  (communes aux deux), `borne`, `z` (`"+inf"` / `"-inf"` si `se_dF` = 0, `null` sans graine commune), les six nombres de `comparer`, ses critères, `decision`
  ∈ `sacre | continuer | futilite | plafond | epuisees` ; `arret` = la décision du dernier regard ; `courses` = 2 × graines ; `plan` = les réglages utilisés
  (plan fixe : `{nom:'fixe', premier, seuilSacre, seuilB, seuilC}`, un seul regard). La clé de reprise (génération, usage, meneur, champion, première graine)
  ne change pas. **Une ligne d'avant** (sans `regards`) se lit partout comme un seul lot : « pas sacre sur 24 graines (un seul lot) ».
- `generations.jsonl` : la clé `validation` d'une validation séquentielle porte en plus `graines` (combien), `regards` (combien), `arret`.
- Les pages : `etat.regardsClair(v, {accents})` → « SACRE au 3e regard, sur 48 graines », « arrete au 1er regard, sur 24 graines (z 0.31 sous 0.50) »,
  « pas sacre au plafond (7e regard, 96 graines) » ; `histoire.js`, `tableau.js` (section 5), `arbre.js` (la fiche d'un sacré) le reprennent.

### 11.2 La malédiction du gagnant : mesurée, plus d'alarme (A1, lot « sacre »)

- `malediction` = dF d'entraînement − dF du **premier** regard (24 graines, une taille fixe : le dernier regard d'un plan qui s'arrête selon ce qu'il voit
  est biaisé). Toujours écrite dans `validations.jsonl`, `maledictionMoyenne` aussi.
- `cfg.validation.maledictionSeuil` : `null` (config.json) ou absent → l'alarme ne sonne jamais (`regle6` ne passe plus seule à `regle6Haute`) ; un nombre
  → l'alarme d'avant. Raison : pour un meneur jeune, la malédiction attendue quand tout marche vaut 1,1 à 1,8 palier ; l'alarme à 1 sonnait par construction.
- Une population où `regle6` est **déjà** passée à 3 y reste (rien ne la redescend) : à regarder dans `population.json` (`regle6`).

### 11.3 La protection par l'âge (A4, lot « règles »)

- `cfg.protectionGenerations` (p, 1 ; absent = 1) remplace `protectionCourses` (plus lu ; une config qui l'a encore n'est pas refusée).
  À la génération G : **renvoyable** si `ne ≤ G − p` (témoin et champion toujours exclus) ; **parent** des naissances de G si `ne ≤ G − 1 − p`
  (`v.ne` absent = 0). Moins de 3 parents possibles : comme avant, les vivants qui ont le plus de courses.
- Un enfant né en G joue donc les graines de G puis celles de G+1 avant de pouvoir être renvoyé (à la fin de G+1) : c'est ce que demande la mesure de τ (§ 11.7).
- Changements de comportement, voulus : à 8 graines (économie), une graine retirée ou une course non mesurée, la protection ne dure plus qu'une génération ;
  à la **première génération d'une époque neuve**, les pilotes assez âgés sont renvoyables (la règle des 24 courses n'en renvoyait aucun).
- `alarmeDistance` 0,011 (121 gènes ; mesuré : 0,0221 à la naissance d'une population de 20, `tests/mesure-distance.js`).

### 11.4 L'ordre des courses et l'ordre des lignes de la note (A6, lot « règles »)

- `cfg.ordreCourses` `"longues"` (défaut) : `E.ordreLongues(ctx, taches)` range les courses d'entraînement d'une génération par durée attendue décroissante
  (la survie moyenne du pilote dans l'époque ; un enfant sans course : celle de son premier parent ; sinon la moyenne de tous ; égalité : l'ordre d'origine).
  `courir(ctx, taches, {ordre})` demande dans cet ordre et remet chaque résultat à son indice. La validation et le coffre gardent leur ordre. `"origine"` :
  l'ordre d'avant.
- `E.ordreLignes` : `noterTous` range les lignes (génération, graine, pilote, clé) avant `note.noter`, dont le bootstrap de E tire des **positions** : la note
  dépendait de l'ordre où les courses finissaient (et changeait déjà d'une reprise à l'autre). Conséquence : à la première génération avec ce code, les `se_F`
  d'une population existante peuvent bouger un peu, une fois.

### 11.5 La réserve de graines d'entraînement (M6, lot « règles »)

- Avant : 1 081 graines (910000 + 37·i) ; la réserve vide (génération 90 à 12 graines), un retirage **avec remise** parmi elles, sans alerte.
- `cfg.graines.entrainement.suite` `{depart:1000021, pas:37, fin:999999999}` : quand la réserve est vide, elle reçoit le **bloc** suivant de 1 081 indices
  (indice i ≥ 1 081 → `1000021 + 37·(i − 1081)`), `pop.graines.blocs` +1 (absent = 0). 27 000 000 graines de plus : 2 250 090 générations à 12 graines.
  Les 90 premiers lots sont ceux de l'ancien code au bit près (même hasard) : une sélection commencée continue sans rejouer ni sauter de graine.
- Les plages : 910000-949960 (l'entraînement d'avant), 950000-989999 (repli de la validation, validation de la boucle payante), 990000-991443 (coffre),
  1 000 000 + 37·k (la validation de la sélection, reste 1 modulo 37), 1000021-999999984 (la suite, reste 22 modulo 37) : la suite ne touche jamais la validation.
- `cfg.graines.auBout` : `"arret"` (défaut quand une suite existe) → au bout, `naissances` lève **avant** toute naissance (erreur `GRAINES_EPUISEES`,
  « evoluer : generation G non commencee : les graines d'entrainement sont epuisees … ») : code 1, rien n'est écrit ; à moins de 20 générations de la fin,
  un événement le dit à chaque génération. `"rejouer"` (ou une config sans suite) : l'ancien retirage.
- `Gr.grainesRestantes(eg, cfg)`, `Gr.graineDe(E, i)` : exportés.
- Risque connu, non mesuré (relecture du lot) : le hasard du jeu (mulberry32) ajoute 0x6D2B79F5 à chaque tirage ; deux graines dont l'écart vaut k·0x6D2B79F5
  (mod 2³²) jouent le même ruban de nombres décalé de k tirages. Dans la suite, les plus petits décalages entre graines réellement atteintes sont de quelques
  milliers de tirages après 1 000 à 10 000 générations. Ce n'est pas une même course ; l'écarter tout à fait (hacher la graine dans `enfant.js`) serait une époque.

### 11.6 L'urne des mutations : seulement les réglages lus (C2, lot « règles ») ; genome.js hors de l'époque (C7)

- `genome.GARDES` : la seule table drapeau → réels qu'il garde (10 drapeaux, 30 réels), relue dans `modele.js` ; `GARDE_DE` (réel → drapeau) ;
  `reelsLus(genome)` = `CONTINUS` moins les réels dont le drapeau vaut 0. `muter` tire ses m réels dans `reelsLus(parent)` (m borné à cette urne) ;
  `o.urneComplete` = l'ancienne urne (mesures seulement). Le nombre de réels tirés, les drapeaux, les entiers et les têtes sont ceux de l'ancienne urne à la
  même graine. Part des mutations perdues sur le témoin : 34 % (v:3) et 27 % (v:2, le Ryzen) avant, 0 après (`tests/genes-muets.test.js`).
- **C7** : `genome.js` n'est **pas** dans `commun.FICHIERS_EPOQUE` ; une course n'en dépend que par le texte du pilote, dont le sha est dans la clé du cache.
  Changer `genome.js` sans changer `ecrirePilote` ne change aucune course ni aucune note ; il entre dans l'**empreinte d'identité** (`evoluer.shaIdentite`) :
  le premier lancement avec ce code refait le contrôle d'identité (3 courses du témoin), sans changer d'époque (§ 9.3 corrigé).

### 11.7 La mesure de τ : les mutations comptent-elles ? (M1 et M4, lot « tau », branchée par l'intégrateur)

- `mesure-tau.js` (lecture seule ; `mesurer()` ne lève jamais) : pour chaque enfant, son niveau (moyenne de palier − b_g, b_g de `note.ajuster` sur les seuls
  pilotes **établis** : le témoin et les pilotes dans leur 3e génération ou plus) sur les graines de sa génération de naissance, puis sur celles de la suivante,
  chaque moitié **centrée** sur les enfants nés la même génération ; τ² = la covariance groupée des deux moitiés, r leur corrélation, un intervalle par
  re-échantillonnage des enfants et des graines de chaque génération. **Verdict** `trop-tot` tant que les enfants mesurés ou les degrés de liberté sont sous le
  requis (191 enfants à λ = 6 et 12 graines ; le hasard d'une course compté à 3,26 au moins), puis `comptent` (r au-dessus de tanh(1,96/√(ddl − 2))) ou
  `ne-comptent-pas`. **M4** : les courses d'un enfant de même `empreinte` que celle d'un parent sur la même graine (« pour rien »), en nombre et en temps.
- Ligne de commande : `node ml/evolution/mesure-tau.js [--config f] [--etat dossier] [--json] [--tirages N]` (code 0 toujours).
- Format rendu (`--json`), exemple réel (le 27/11, abrégé) :

```json
{"format":"evolution-mesure-tau-1","verdict":"trop-tot","phrase":"trop tôt pour le dire (19 enfants mesurés sur 191)",
 "enfants":{"mesures":19,"requis":191,"ddl":18,"ddlRequis":159,"parGeneration":6,"tauVise":0.5,"grainesParMoitie":[12,12],"sigma":3.2599,
   "sigmaRequis":3.26,"sourceSigma":"epoque 6fa41a143ead (503 degres de liberte)","coupesParEpoque":0,"sansGeneration":0,"renvoyesAvantSecondeMoitie":0},
 "r":-0.1287,"seuilR":0.4542,"icR":[-0.5628,0.4992],"tau":0,"tau2":-0.1563,"icTau":[0,0.9443],"tirages":1000,"significatif":false,
 "clones":{"comparees":528,"identiques":62,"part":0.1174,"partTempsEntrainement":0.0511,"nulsExacts":["9627905cd5bb"],"…":"…"},"defauts":[]}
```
- **Les pages** (l'intégrateur, 28/11) : `etat.mesureTau(cfg, o?)` appelle `mesurer(dossierEtat, optionsDe(cfg, {tirages:400}))` dans un `try` (toute
  erreur : `{verdict:'trop-tot', phrase:'trop tôt pour le dire', defauts:['mesure impossible : …']}`) ; au-delà de `etat.TAU_MAX_OCTETS` (100 Mo) de
  `courses-*.jsonl`, elle ne lit rien et sa phrase dit de lancer la mesure à part (le tableau est refait dans le processus de la sélection : un état de
  plusieurs mois ne doit pas lui coûter la mémoire). `tableau.ecrire` la fait **une fois** et la passe (`o.tau`) à la page, à resume.txt et au récit :
  - `resume.txt` : les 10 lignes de `etat.resume`, une ligne vide, puis `etat.tauLigne(x)`, sans accents, 118 colonnes au plus :
    `Mutations comptent-elles ? trop tot pour le dire (19 enfants mesures sur 191) ; r -0.13, tau 0.00 [0.00 ; 0.94] ; courses pour rien 12 %` ;
    `node etat.js` imprime toujours les 10 lignes seules ;
  - `tableau.html` : la section « 1 bis. Les mutations comptent-elles ? » (après le coffre) : la phrase en gras, une barre « enfants mesurés / requis »,
    r et τ avec leurs intervalles, les courses pour rien, puis le détail de `MT.lignes` en petit ; une erreur rend la section avec « Trop tôt pour le dire » ;
  - `histoire.md` : le paragraphe « ## Les mutations comptent-elles ? » après « Où on en est » ; il dit que le **premier** verdict sorti de « trop tôt »
    est celui qui compte (le verdict est recalculé à chaque génération : regardé tous les jours, il crie à tort environ deux fois plus qu'un seul regard,
    5,8 % contre 2,5 % à τ = 0, relecture du lot).
- Rien dans `evoluer.js` ni dans les journaux : la mesure se refait depuis les journaux. `sauver-traces.cmd` n'a rien à changer (il envoie déjà les trois pages
  et resume.txt).
- Ne pas faire C5 (`grainesAnciens`) : la seconde moitié d'un enfant tomberait à 4 graines.

### 11.8 Où ces formats sont décrits

| Format | Écrit par | Décrit dans |
|---|---|---|
| `cfg.validation.plan`, `pas`, `plafond`, `borneOBF`, `futilite`, `seuilB`, `seuilC`, `maledictionSeuil: null` | à la main | § 11.1-11.2, `config.json` `_notes`, `notes/sacre.md` |
| `validations.jsonl` `plan`, `regards[]`, `arret`, `courses` ; `generations.jsonl` `validation.graines/regards/arret` | `evoluer.js` | § 11.1 |
| `cfg.protectionGenerations`, `cfg.ordreCourses` | à la main | § 11.3-11.4, `notes/regles.md` |
| `cfg.graines.entrainement.suite`, `cfg.graines.auBout`, `population.json` `graines.blocs`, erreur `GRAINES_EPUISEES` | à la main, `graines.js`, `evoluer.js` | § 11.5, `notes/regles.md` |
| `genome.GARDES`, `reelsLus` | `genome.js` | § 11.6, `notes/regles.md` |
| `evolution-mesure-tau-1`, la ligne « Mutations comptent-elles ? » de resume.txt, la section 1 bis, le paragraphe du récit | `mesure-tau.js`, `etat.js`, `tableau.js`, `histoire.js` | § 11.7, `notes/tau.md`, `notes/integrateur-reglage.md` |
| l'état de la livraison, les gestes sur le Ryzen | — | `notes/LIVRAISON-REGLAGE.md` |
