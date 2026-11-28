# Le contrat des gènes v4 : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `contrat-des-genes-v4` (wf_a8860828-eec), lancée par la session principale (Claude Fable).
- Agents : 5, tous du modèle claude-opus-5-5.
- Durée : 42 min ; jetons consommés par les agents : 1 349 564 (1,35 millions) ; appels d'outils : 244.
- Message de fin du script : « 37 defauts releves ».
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. architecte : écrit le contrat du lot « gènes v4 », sans coder (phase « Contrat »)
2. relecteur « au bit près » : attaque le contrat sous cet angle et relève ses défauts (phase « Attaquer »)
3. relecteur « sémantique » : attaque le contrat sous cet angle et relève ses défauts (phase « Attaquer »)
4. relecteur « banc et sélection » : attaque le contrat sous cet angle et relève ses défauts (phase « Attaquer »)
5. architecte, second passage : corrige le contrat d'après les trois attaques (phase « Reprendre »)

## 1. architecte

*Rôle : architecte : écrit le contrat du lot « gènes v4 », sans coder. Phase : Contrat.*

### Résumé

J'ai écrit le contrat complet du lot dans C:\Users\sacha\code\CASH-CAR-genes-v4\ml\evolution\notes\genes-v4.md. Il compte dix sections : les mots simples pour Sacha, le génome v:4, les règles gène par gène, les compteurs, la map imposée, le banc v2, les époques, les tests, le découpage en trois lots et les questions ouvertes. Chaque endroit du code est cité par sa ligne au commit ddca156d8 et par la phrase de code qui s'y trouve aujourd'hui. Je n'ai écrit aucun code, joué aucune course et fait aucun commit. Toutes mes lectures sont faites dans la copie genes-v4. Seul calcul : un petit script de simulation dans le scratchpad, qui donne les constantes O'Brien-Fleming du banc.

Le génome v:4 a 8 gènes neufs en fin de BORNES (129 gènes, 91 réels, GARDES 33) : sortieOn, sortieT, sortieJauge, rienOn, rienEcart, loiFidele (un choix 0, 1 ou 2), secoursOn et chancePalierMin (un entier figé à 12). La migration v:1, v:2 et v:3 vers v:4 garde les identifiants : la règle de shaGenome descend d'un cran, et c0025 reste 19e3767cc346, c0101 reste f70ddcb5a565. La loi fidèle et les secours passent par RETOURS_DEMANDES, avec le tableau des places (4 au plus ; 1 seule loi de secours quand retourOn et coupOn sont allumés tous les deux). Les compteurs sortent par un champ d'ordre « declic » que l'enfant lit puis retire. Ils arrivent dans la ligne de course sous le nom « declenchements », avec 22 noms. La preuve qu'ils ne changent aucune décision repose sur une constante COMPTE=false dans le test.

La map imposée suit noter.js : la tâche porte une carte, la clé de cache gagne le suffixe |carte:X, et la clé sans carte ne change pas. Le banc v2 a ses graines en 4 000 000 + 37·(1 000·(n−1) + i), avec un reste de 4 modulo 37 que n'a aucune autre plage. Il applique Bonferroni avec la constante O'Brien-Fleming (2,65 pour 5 bras et 8 regards). Une vague de 5 bras au plafond coûte environ 6 h 25 de courses. Le seul fichier d'époque touché est modele.js par le lot (a), plus enfant.js par le lot (b) : il faut les fusionner ensemble. Le Ryzen recevra une seule coupure d'époque.

### Décisions

- sortieJauge est un gène neuf (0,2 à 1, naissance 0,5) au lieu de réutiliser bordJauge : bordJauge est gardé par bordOn dans GARDES, et le partager casserait reelsLus et genes-muets. Autre option : permettre plusieurs gardes par réel (GARDE_DE vers une liste).
- rienEcart naît à 0,2 rad. Autre option : 0,3, plus prudent.
- loiFidele est de type « choix » (comme dessousDecor) et non « entier » : avec un entier, 0 donnerait 1 seulement 2,5 fois sur 100 et jamais 2 d'un coup. Autre option : entier avec pFigMax.
- loiFidele utilise LOI_PILOTE fixe (ta décision), à l'indice R.retours.length, partagé avec la première loi du coup quand coupOn est allumé. Autre option : une loi faite des gènes du pilote (avance = volAvance, portee = volRetour), plus fidèle après mutation, mais elle prend une place de plus.
- En mode 2 (suivre), FACONS.versRoute est appelé quand même, pour tenir m.pv ; on lui écrase seulement le volant et le manche. Autre option : ne pas l'appeler (m.pv périmé au retour).
- Lois de secours : S1 = LOI_PILOTE avec nitro 3 et nitroHaut 5 m, S2 = LOI_PILOTE avec cabre à 0 m ; ce sont des constantes, pas des gènes. Autre option : deux gènes gardés par secoursOn.
- Le secours se déclenche seulement si toutes les façons candidates annoncent choc, air ou fond (« vide » n'est pas une issue de rayon). Un rayon « libre » l'empêche. Le choix entre les deux secours se fait sur vaut() seul, sans prime() (prime lit retourPrime, gardé par retourOn).
- Les figures sont interdites pendant un vol de secours (m.secoursVol). C'est un ajout prudent, hors du dossier. Autre option : les laisser.
- chancePalierMin : fige:true. muter ne fait aucun tirage pour lui, croiser prend la valeur du premier parent sans tirage. PROFIL passe sous la balise et lit REGLAGES.chancePalierMin ; genomeTemoin lit le palier dans le texte du témoin. Autre option : le laisser dans l'urne (je suis contre).
- Seuls les drapeaux nés à 0 ont un compteur ; ceux nés à 1 (dessousAveugle, portailVol, volDemiTour, raccCartes…) n'en ont pas, sinon il y aurait des declic dans chaque course de c0025. Autre option : les compter aussi.
- Les compteurs passent par le champ d'ordre « declic », que l'enveloppe de C.decide dans enfant.js lit puis supprime. piloter.js et doigts.js ne changent pas. Autre option : ajouter un appel __bac au bac pour lire la mémoire, mais cela touche piloter.js, un fichier d'époque des yeux.
- La ligne gagne aussi « cartes » (les maps traversées, donc la map de la mort) et « chancePrise ». Autre option : seulement declenchements et carte.
- La carte doit être dans cfg.cartesTirage et ne vaut que pour la première map. La clé reste celle d'aujourd'hui sans carte, et prend le suffixe |carte:X avec une carte. commun.js n'est pas modifié.
- Banc v2 : des graines neuves à chaque vague (bloc de 1 000 par numéro de vague), le témoin étant rejoué dans chaque vague. Autre option : une plage commune, avec le témoin joué une seule fois.
- Banc v2 : plan par défaut 24 / 24 / 192 (8 regards), alpha 5 % bilatéral avec Bonferroni par k bras, constante O'Brien-Fleming calculée par simulation déterministe. Arrêt « rare » si f̂ < 0,1 au premier regard. Futilité |z| < 0,5 seulement à partir du deuxième regard (le sacre l'applique dès le premier).
- Banc v2 : rien de chiffré dans resume.txt tant qu'un bras joue ; vague.json est figé par son sha1 dès la première course ; un changement d'époque pendant une vague donne un refus (code 4) au lieu de rejouer.

### Problèmes

- La map imposée n'impose que la première map de la course : code/maps/continuite.js l.201 vide SF.force après usage. Pour un gène de la grotte, f ne monte donc pas jusqu'à 1. Imposer toutes les maps toucherait le jeu ou jeu-reel.js (une époque des yeux), hors du lot.
- Le banc d'étude ml/ecurie/etude/banc-des-genes/ n'est pas dans git : il est non suivi dans bots-ecurie et absent de la copie genes-v4. Je n'ai donc pas relu jouer.js ni analyser.js, et le v2 ne s'appuie pas sur leur code.
- LOI_PILOTE n'est la loi exacte du pilote qu'aux valeurs de naissance de volAvance (0,25), volRetourOn (0) et volDemiTour (1). Après mutation de ces gènes, la loi « fidèle » ne l'est plus.
- Le dossier demande de rejouer d'abord les secours hors course sur des vols perdus enregistrés. Ces vols sont hors git, anciens et en double : rien ne prouve encore qu'un rayon de secours trouve des poses. Les paramètres 5 m et 0 m ne sont pas mesurés.
- Le test m6 de genes-muets.test.js compare le TEXTE du pilote à celui du genome.js d'avant : il devient faux par construction et doit passer à « mêmes décisions ». Le test p3 de portage.test.js doit comparer les ordres sans « declic ».
- Il faut fusionner les lots (a) et (b) ensemble avant de jouer toute course hors des tests, sinon on crée une époque intermédiaire. Il faut fusionner dans bots-ecurie seulement après la fin de la mesure du banc d'étude, sinon tout son cache est perdu.
- Le lot ne fournit aucun moyen pour Sacha de changer chancePalierMin sur une population. Je propose deux pistes (une option --chance N, ou une clé de config appliquée par reparer) : c'est à décider avec lui.
- alarmeDistance (0,011) : la distance divise maintenant par 129 gènes au lieu de 121. Elle est à remesurer si l'alarme sonne.

## 2. attaquer:bit-pres

*Rôle : relecteur « au bit près » : attaque le contrat sous cet angle et relève ses défauts. Phase : Attaquer.*

### Résumé

Relecture sous l'angle « éteint = c0025 au bit près » et la migration. Le fond tient. Gestes et portage ont obtenu l'identité avec du code PRÉSENT mais INERTE, derrière R.<drapeau>>0. Le texte du pilote change donc pour tout génome : le bloc REGLAGES gagne des clés et modele.js gagne du code. Le shaPilote de TOUS les pilotes change, y compris c0025 et toute la population du Ryzen. Ce n'est pas un défaut : modele.js et enfant.js sont dans FICHIERS_EPOQUE, l'époque change de toute façon, et le cache ne sert plus.

Ce que compare identite.js : les trois empreintes de course (bilan.empreinte sur six champs de base des vues, empreinteVues, empreinteTouches ; identite.js l.16). Il ne compare ni le texte, ni le profil, ni les ordres.

Les identifiants viennent de shaGenome, pas du texte. La règle du § 2.3 (v4ANaissance, puis la forme v:3, v:2 ou v:1) redonne bien c0025 19e3767cc346 et c0101 f70ddcb5a565, et pop.temoin reste valable (evoluer.js l.527).

Le déplacement de PROFIL sous la balise change le texte, pas le profil normalisé : profilSha est le même à 12.

Les compteurs passent par l'ordre, puis sont retirés par l'enveloppe de l'enfant. Vérifié dans le code : course() appelle cerveau.decide(vue) au moment de l'appel (piloter.js l.259), et traduire / ordreV2 ignorent un champ inconnu (doigts.js l.28, l.351-374).

mesure-tau.js et arbre.js survivent au changement de version. mesure-tau groupe les courses par (époque, id, graine) (l.117) et les identifiants sont gardés ; arbre.js migre ce qu'il lit (l.25).

Les défauts trouvés sont surtout dans les PREUVES et dans la migration en exploitation :
- un test de migration v:1 qui ne tourne déjà plus (SAUTE en silence) ;
- une comparaison au code d'avant qui lirait le NOUVEAU modele.js ;
- m6 impossible tel quel, l'ancien genome.js refuse un v:4 ;
- generation.test.js, qui fige v:3 et n'est dans aucun lot ;
- un compteur volRetourOn qui ne peut pas se déclencher, R.volRetourOn n'existe pas dans le pilote ;
- du code de compteur qui, s'il lève, change la décision ;
- une migration sans retour arrière pour le Ryzen.

Rien n'a été écrit, aucune course jouée. Seuls deux petits scripts de lecture ont tourné : la clé volRetourOn absente de REGLAGES, et le g2 de gestes.test.js qui saute.

### Défauts relevés

- Où : § 8.1 (v2) « la migration : un v:1 (l'exemple de gestes.test.js g2) » (contrat l.642) et § 8.5 point 1 (gestes)  
  Défaut : La preuve v:1 avec le VRAI genome.js d'avant les gestes ne tourne déjà plus. gestes.test.js lit `git show HEAD:ml/evolution/genome.js` et saute si HEAD a déjà les gestes. HEAD (ddca156d8) est en v:3 : les « 200 mutants v:1 » passent SAUTE en silence. Ce qui reste du g2 n'utilise que l'exemple fabriqué, et l'identifiant v:1 → v:4 n'est prouvé par aucun ancien code.  
  Preuve : ml/evolution/tests/gestes.test.js l.110-111 (`git show HEAD:…` puis `if(t.indexOf("if(BORNES.length!==86")<0)return null;`) et l.146 (`return 'SAUTE …'`). Vérifié : `git show HEAD:ml/evolution/genome.js | grep -c 'BORNES.length!==86'` = 0. Le v:1 réel est au commit e2ea8d2c9 (genome.js l.71 : `if(BORNES.length!==86…`, la commande donne 1).  
  Gravité : serieux  
  Correction proposée : Dans genes-v4.test.js (v2), et aussi dans gestes.test.js g2, épingler le commit e2ea8d2c9 pour le v:1, comme portage.test.js épingle 7f9543955 pour le v:2. Pour le v:3, épingler ddca156d8. Dire au contrat qu'un test qui SAUTE compte comme un ÉCHEC pour l'intégrateur. Écrire la chaîne complète : v:1 (e2ea8d2c9), v:2 (7f9543955 et l'état e93ff5cb5), v:3 (ddca156d8) → v:4, même idDe que l'ancien genome.js, et mêmes décisions.
- Où : § 8 (« Le code d'avant : git show ddca156d8:… copiés dans essais/genes-v4/ … comme gestes.test.js (g2) et portage.test.js le font », l.635-636) et § 8.1 (v3) « le pilote du code d'avant (genome.js + modele.js de ddca156d8) »  
  Défaut : Un genome.js copié de git écrit son pilote avec `fs.readFileSync(MODELE)` : MODELE = C.DOSSIER/modele.js, donc le NOUVEAU modele.js, sauf si l'on passe `o.modele`. Sans cela, le « pilote d'avant » = l'ancien bloc + le nouveau modele.js. Ce bloc n'a ni chancePalierMin (PROFIL lit REGLAGES.chancePalierMin = undefined) ni les 7 drapeaux v4 (R.sortieOn>0 vaut faux par hasard). La comparaison serait fausse, ou passerait pour une mauvaise raison.  
  Preuve : genome.js l.23 (`const MODELE=path.join(C.DOSSIER,'modele.js')`), l.467 (`o.modele!=null?String(o.modele):fs.readFileSync(MODELE,'utf8')`). portage.test.js l.124 et l.139 passent bien `{cfg,modele:V2.modele}` ; le contrat ne le dit pas.  
  Gravité : serieux  
  Correction proposée : Écrire en clair, au § 8 : « l'ancien pilote = ancienGenome.ecrirePilote(g,{cfg, modele: git show ddca156d8:ml/evolution/modele.js}) ». Ajouter un garde-fou au test : le texte ancien ne contient pas `chancePalierMin` et contient `palierMin:12}` en dur.
- Où : § 8.1, dernier point : « genes-muets.test.js … m6 … devient « mêmes décisions », le texte change forcément » (l.668-669)  
  Défaut : m6 va du nouveau vers l'ancien : des mutants faits par Gn.muter (v:4) sont donnés à `G0.ecrirePilote(copie(g))`, l'ancien genome.js de 7b1df608e (v:3). L'ancien valider ne migre que v:1 et v:2 : il rend « version 4 » et ecrirePilote LÈVE. De plus, 3 % par drapeau v4 et par mutant allument sortieOn, rienOn ou secoursOn, ou passent loiFidele à 1 ou 2, ce que l'ancien code ne sait pas écrire. Et G0.idDe(copie(g)) d'un v:4 n'a pas de sens. « Mêmes décisions » ne se code donc pas en gardant m6 tel quel.  
  Preuve : genes-muets.test.js l.203 (`git show 7b1df608e:ml/evolution/genome.js`), l.209-210 (`Gn.muter(...)` puis `G0.ecrirePilote(copie(g),{cfg})`, `G0.idDe(copie(g))`). Ancien genome.js : `migrer` n'accepte que `genome.v!==1&&genome.v!==2` (l.295 aujourd'hui), et valider rend « version … (attendu 3 …) » (l.264).  
  Gravité : serieux  
  Correction proposée : Réécrire m6 dans l'autre sens, comme portage p4. Les mutants sont faits par l'ANCIEN genome.js (ddca156d8, v:3), puis migrés. On vérifie trois choses : idDe(ancien) == idDe(migré), décisions de l'ancien (avec `modele:` l'ancien texte) == décisions du nouveau, et FICHIERS_EPOQUE sans genome.js. Le dire au contrat, pour que l'agent (a) ne cherche pas à garder le sens actuel.
- Où : § 9, lot (a) : la liste des fichiers (l.722) ; § 8.5 point 1 : « generation » dans les tests rapides  
  Défaut : tests/generation.test.js fige `v.genome.v===3` dans casCompat. C'est LA preuve qu'un état du Ryzen (etat-e93ff5cb5, v:2) se relit et fait une génération avec le code neuf. Ce fichier n'est dans aucun lot : avec VERSION=4 le test échoue chez l'intégrateur. Et s'il le « répare » à la main, rien ne vérifie que les identifiants survivent : casCompat ne compare pas les id, ni pop.temoin.  
  Preuve : ml/evolution/tests/generation.test.js l.123 (`p1.vivants.every(v=>v.genome.v===3)`) et l.127 (« -> v:3 ») ; l.110 (`['etat-v2-ancien','ab'],['etat-e93ff5cb5','cd']`).  
  Gravité : serieux  
  Correction proposée : Mettre generation.test.js dans le lot (a). Remplacer le 3 par Gn.VERSION. Ajouter à casCompat : mêmes ensembles d'id avant et après, pop.temoin === idDe(genomeTemoin) (19e3767cc346), dejaVus gardé. Ajouter un troisième état source en v:3, écrit par ddca156d8 (le banc d'étude et tout état local de bots-ecurie sont en v:3).
- Où : § 4.2, ligne `volRetourOn` du tableau (l.339), et la règle du § 3 « Chaque bloc commence par R.<drapeau>>0 » (l.125-126)  
  Défaut : Le pilote n'a PAS de clé R.volRetourOn. bloc() n'écrit que `volRetour:0` quand le gène est éteint : volRetourOn n'est ni dans ORDRE_VOLTIGE ni dans ORDRE_RETOUR. Un agent qui suit la règle écrit `if(COMPTE&&R.volRetourOn>0)` : undefined>0 vaut faux, et le compteur ne se déclenche jamais, même gène allumé. Aucun test ne le voit, car le v5 compare COMPTE vrai contre faux et le v4 ne vise pas ce nom. C'est sans danger pour l'identité, mais le compteur est faux sans bruit.  
  Preuve : genome.js l.48 (`volRetourOn … ou:'volRetour'`), l.203-208 (ORDRE_VOLTIGE sans volRetourOn, ORDRE_RETOUR = retourOn…volMieux), l.450 (`volRetour:'+(A.volRetourOn?String(A.volRetour):'0')`). Vérifié par un script de lecture : le REGLAGES écrit du témoin contient `volRetour:0` et `retourOn:`, pas `volRetourOn`. Dans le pilote, la garde est `R.volRetour>0` (modele.js l.305).  
  Gravité : serieux  
  Correction proposée : Dans le tableau du § 4.2, donner la GARDE exacte de chaque compteur (une colonne « garde dans le pilote ») : `R.volRetour>0` pour volRetourOn, `R.retours.length>0` pour retourOn et retourOn.reacteur, `R.<cle>>0` pour les autres. Ajouter au test v4 une suite qui déclenche CHACUN des 22 noms au moins une fois, gène allumé.
- Où : § 4.5 point 4, « Règle d'écriture pour (a) » (l.388-389), et § 4.1 (le coût)  
  Défaut : La preuve « les compteurs ne décident rien » oublie l'exception. Si un calcul « sans la règle » LÈVE (un champ nul, un rayon absent), le bac l'attrape : decide rend une erreur, piloter.js compte erreurs++ et la décision devient un ordre VIDE. La course change. Cela ne touche pas c0025 éteint. Mais cela touche c0101 et une bonne part des vivants du Ryzen, chez qui des drapeaux v:2 sont allumés (gestes) : avec ce lot, leurs compteurs tournent à chaque décision. Le test v5 ne voit que les suites écrites à la main.  
  Preuve : piloter.js l.90 (`appel:…try{const r=c.decide(…)…}catch(e){… return 'E'+s;}`), l.174 (`if(r[0]==='E'){this.erreurs++;…return null;}`), l.265 (`if(!ordre||typeof ordre!=='object'){ordre={};vide++;}`).  
  Gravité : serieux  
  Correction proposée : Règle de plus pour (a) : tout le code des compteurs est dans `if(COMPTE){try{…}catch(e){}}` et n'écrit que DECL ou m.cSortie, même en cas d'erreur. Au test v5, ajouter une passe sur des vues tirées au hasard, comme le relecteur du portage (3 000 suites, graine fixe), tous les anciens et les nouveaux drapeaux allumés : ordres identiques sans `declic`, et zéro erreur de plus avec COMPTE=true qu'avec COMPTE=false.
- Où : § 7, « Le Ryzen … Ses pilotes v:2 sont migrés en v:4 au chargement … » (l.618-623)  
  Défaut : La migration est sans retour, et le contrat ne le dit pas. Au premier lancement du code v4, evoluer.js valide (donc migre en place) chaque vivant, puis réécrit population.json, puis écrit morts.jsonl et les champions en v:4. Le code d'avant refuse un génome v:4, que ce soit e93ff5cb5 sur le Ryzen ou ddca156d8 pour le banc d'étude. Un retour en arrière après le premier lancement casse l'état, sans archive.  
  Preuve : evoluer.js l.268 (`Gn.valider(v.genome,cfg)` : migre en place, genome.js l.263) puis l.541-542 (`ecrirePop(ctx)` à la nouvelle époque) ; genome.js l.264 (`return 'version '+genome.v+' (attendu '+VERSION…`), qui dans l'ancien code donne « attendu 2 » ou « attendu 3 ».  
  Gravité : serieux  
  Correction proposée : Ajouter au § 7 et au mode d'emploi du Ryzen : « avant le premier lancement v4, copier etat\ et champions\ à part (ou le faire faire par le maître) ; la migration v:2 ou v:3 → v:4 est à sens unique ; revenir en arrière = remettre cette copie ». Pour le banc d'étude : « ne pas relancer l'ancien code sur un dossier qu'un code v4 a ouvert ».
- Où : § 4.5 point 4 (« un calcul sans la règle … sans appeler une fonction qui écrit la mémoire »)  
  Défaut : La règle ne parle que de la mémoire m. Or teteSol() écrit le tampon partagé OS, et auSol relit oS juste après : un appel de plus avant l.210 changerait kSeuil et kGain. Les FACONS.* et versRoute écrivent m.pv. teteRayon écrit XV et OV mais les relit tout de suite : sans danger.  
  Preuve : modele.js l.68 (`const XV=…,OV=…,XS=…,OS=…` faits une fois), l.96 (`return reseau(WS,x,12,6,3,OS)`), l.208-210 (`const oS=teteSol(…)` puis `oS[1]`, `oS[0]`, `oS[2]`) ; l.300-303 (versRoute écrit m.pv), l.320-321.  
  Gravité : mineur  
  Correction proposée : Étendre la règle : un compteur n'appelle ni teteSol, ni versRoute, ni FACONS.*, ni controleRayons. Il ne lit que des valeurs déjà calculées ou des fonctions pures (vaut, sauve, avecNitro, poseNette, rayonDe).
- Où : § 7 (les époques) : ce que deviennent mesure-tau et l'arbre  
  Défaut : Le contrat ne dit rien de la mesure « les mutations comptent-elles ? ». Elle survit : elle lit les courses par (époque, id, graine), les identifiants sont gardés, et elle met en commun les enfants de toutes les époques. Mais les enfants nés à la dernière génération avant la bascule ont leur 1re moitié dans l'ancienne époque et la 2e dans la nouvelle : ils sont comptés « coupés » et perdus pour τ. L'arbre survit, car il migre ce qu'il lit.  
  Preuve : mesure-tau.js l.117 (`parCle.set(l.epoque+'|'+l.id+'|'+l.graine,l)`), l.155-156 (moitiés par génération dans UNE époque), l.164 (`if(!v.complet&&v.h1&&v.h2)coupes++`) ; arbre.js l.25 (`G.migrer(g)`).  
  Gravité : mineur  
  Correction proposée : Une phrase au § 7 : « mesure-tau et arbre lisent les états v:2 et v:3 sans changement. La bascule d'époque coupe les enfants de la génération en cours (environ λ enfants non comptés, signalés « coupés »). Le verdict n'est pas remis à zéro. »
- Où : § 2.4 « Pour le changer un jour : réécrire la valeur chez tous les vivants … mais pas l'époque » (l.116-117) et § 10.11  
  Défaut : chancePalierMin fait partie de l'identifiant (v4ANaissance), et c'est juste : sinon les lignes de deux conduites se mêleraient sous le même id, dans la même époque. Mais réécrire la valeur chez tous les vivants change l'id du TÉMOIN aussi. pop.temoin, pop.champion.id, les parents et dejaVus ne désignent alors plus personne : le champion se rabat sur le témoin introuvable, l'ATTENTION revient à chaque lancement, mutesDepuisTemoin devient vide. Le contrat dit seulement « leurs identifiants changent ».  
  Preuve : evoluer.js l.428 (`vivantDe(ctx,pop.champion.id)||vivantDe(ctx,pop.temoin)`), l.527-531 (`temoinNeuf!==pop.temoin` : ATTENTION), l.579 (`const T=vivantDe(ctx,pop.temoin)`).  
  Gravité : mineur  
  Correction proposée : Au § 10.11, écrire que l'outil futur doit soit tout renommer (pop.temoin, champion.id, parents, dejaVus, avec une ligne de journal), soit passer par `--repartir-de` avec une config qui fixe la valeur. Et que genomeTemoin(cfg) doit alors rendre la même valeur, sinon le contrôle d'identité et l'empreinte du témoin divergent.
- Où : § 4.1 (« Une constante const COMPTE=true; … ») et § 4.2 (les 22 noms)  
  Défaut : Les compteurs vivent dans modele.js, qui fait partie de l'époque. Corriger ou ajouter un nom plus tard (un drapeau né à 1, une règle oubliée) change modele.js : nouvelle époque, toutes les courses du Ryzen rejouées, alors qu'aucune décision ne change. De plus, DECLICS vit dans genome.js, hors de l'époque : il peut dériver des noms écrits dans modele.js. Le contrat présente les compteurs comme gratuits sans dire ce prix futur.  
  Preuve : commun.js l.251-252 (FICHIERS_EPOQUE contient ml/evolution/modele.js) ; INTERFACES.md § 11.6 C7 (genome.js hors de l'époque).  
  Gravité : mineur  
  Correction proposée : Dire au § 4.1 : « toute retouche future d'un compteur = une époque ; la liste doit être complète dès ce lot ». Trancher ici le § 10.6 (les drapeaux nés à 1) plutôt que plus tard. Garder le test v5 qui exige que chaque `declic` émis appartienne à DECLICS, et ajouter l'inverse : chaque nom de DECLICS a un `tic('…')` dans modele.js (une recherche dans le texte).
- Où : § 3.5 (PROFIL sous la balise) et § 8.3 (« la preuve éteint en vraie course reste à identite.test.js »)  
  Défaut : La preuve en course ne peut pas voir le seuil de la seconde chance. identite.js compare trois empreintes (vues de base, vues, touches) sur 45 s. La chance ne joue qu'après une mort au palier 12 ou plus, et ni bilan.main.sha ni la chance ne sont dans le résultat compact. Si PROFIL était mal recâblé (palierMin undefined ou en texte), les trois courses de 45 s resteraient IDENTIQUES. Seul le test v4 sans course (profilSha) le verrait, et le contrat ne le demande que pour le témoin.  
  Preuve : identite.js l.16 (`EMPREINTES=['empreinte','empreinteVues','empreinteTouches']`) ; enfant.js l.26-31 (pas de main.sha) ; piloter.js l.141 (`profilSha=shaProfil(profil)`), l.302 (`main:{sha:cerveau.profilSha…}` dans le bilan seulement).  
  Gravité : mineur  
  Correction proposée : Au test v4 (ou v3) : `charger(texte).profilSha` égal à celui du fichier pour c0025 ET c0101, et pour chacun des 200 mutants migrés comparés au pilote d'avant. Ajouter dans le test que `PROFIL.chance.palierMin` est un nombre entier égal à 12.
- Où : § 4.3 (« en tête de auSol (avant l.181) : if(m.cSortie!=null)… » puis « Tout cela est sous R.sortieOn>0 et COMPTE », l.367-369)  
  Défaut : Le bout de code donné en tête de auSol n'est pas gardé par `R.sortieOn>0&&COMPTE`, alors que la phrase suivante dit qu'il l'est. C'est inerte pour c0025 (m.cSortie est undefined, donc `!=null` est faux). Mais c'est une lecture de mémoire de plus sur toutes les décisions de tous les pilotes, et une contradiction que l'agent (a) résoudra au hasard.  
  Preuve : Contrat l.367 : `if(m.cSortie!=null){if(v.t-m.cSortie<=.25)tic('sortieOn.pose');m.cSortie=null;}`, puis l.369 « Tout cela est sous R.sortieOn>0 et COMPTE ».  
  Gravité : mineur  
  Correction proposée : Écrire la forme exacte : `if(COMPTE&&R.sortieOn>0&&m.cSortie!=null){…}`, placée avant le bloc du départ (modele.js l.181).

## 3. attaquer:semantique

*Rôle : relecteur « sémantique » : attaque le contrat sous cet angle et relève ses défauts. Phase : Attaquer.*

### Résumé

Relecture du contrat genes-v4.md, sous l'angle « chaque gène fait-il ce qu'il dit ». Je l'ai confronté à modele.js (ddca156d8), à yeux.js (l.590-630, 760-790, 856-900, 948-1010) et à genome.js. Aucun fichier écrit, aucune course jouée.

Ce qui tient, vérifié dans le code :
- les champs de vue cités existent (sorties.bord.rayons, tenue.t, vol.retours[i]) ;
- la loi LOI_PILOTE vise bien l'axe (K.RH = ROAD_HALF = 28 hors parc) ;
- les places de lois ne dépassent jamais 4 : 3 au plus avant les secours, puis S1 seule ;
- les indices I_FIDELE et I_SECOURS sont toujours au moins égaux à R.retours.length : ils sont sautés comme candidats et prime() n'est jamais appelé dessus ;
- PROFIL peut passer sous la balise, et genomeTemoin trouve « palierMin:12 » chez c0025 et c0101 ;
- les drapeaux sortieOn et bordOn ne se recouvrent jamais (décor contre sans décor).

Défauts trouvés :
- **Un sérieux** : la règle de secoursOn est presque muette. Elle exige que tous les rayons, courts compris, meurent. Or un rayon court (2 s) qui ne meurt pas finit « libre », et ce cas est justement l'instant de la toupie.
- **Un sérieux** : sortieOn change la nitro d'un raccourci déjà engagé, ce qui contredit le contrat.
- **Plusieurs mineurs** :
  - un choix du départ qui part en plein vol après « plane » ;
  - tenuPose laissée périmée alors qu'on peut la corriger sans rien changer pour c0025 ;
  - un m.planeBord qui survit à une annonce contraire ;
  - un aller-retour possible avec rienOn ;
  - un coup de nitro en cours qui continue dans « rien » ou un secours ;
  - le cas du rayon absent dans la règle des secours ;
  - coupDecor classé à tort parmi les drapeaux nés à 1 ;
  - un compteur loiFidele.juge qui compte un désaccord et non un changement d'ordre ;
  - les figures oubliées dans la liste des effets de loiFidele 1.

chancePalierMin : pas de défaut sous cet angle. Le figer par `fige:true`, sauté dans muter et croiser sans tirage, est juste, et c'est le dernier gène de BORNES.

### Défauts relevés

- Où : § 3.4, « La règle » (la condition « tous les rayons des façons candidates ont une issue choc, air ou fond ») et § 8.1 v4 (« un rayon libre parmi eux → rien »)  
  Défaut : La condition prend tous les noms de FACONS, y compris les façons courtes : gauche, droite, cabre, pique, planeCabre. Leurs rayons durent court = min(2 s, air restant). S'ils ne meurent pas dans ce délai, ils finissent « libre ». La condition n'est donc vraie que dans les 2 dernières secondes d'un vol, ou quand tout heurte le décor dans les 2 s. Il reste alors trop peu de temps aux lois de secours pour se poser. Pire, elle exclut exactement le cas visé par le dossier : la toupie. Celle-ci naît quand les rayons longs meurent tous et que la bascule prend un rayon court « libre ». Elle le prend parce que vaut(libre, court) = vCourt − … vaut jusqu'à 34, plus que le plafond de 30 d'un rayon qui meurt. Le gène sera presque muet, et il ne fait pas ce que dit le § 1 (« quand tout annonce une mort »).  
  Preuve : ml/bot/yeux.js l.765-767 : liste du radar, court pour gauche, droite, cabre, pique et planeCabre ; l.695 R.issue='libre' par défaut à la fin de l'horizon. modele.js l.330 (LONGS) ; l.350-353 (vaut : libre court = G.vCourt − …, choc/air/fond = min(30, 5t)). genome.js l.61 : vCourt naît à 34. Dossier LISEZ-MOI l.93 : « Le déclencheur est l'instant même où naît la toupie ». PROPOSITIONS.md l.109, cas 910111 : bascule de versRoute vers « droite » sur une seule vue « choc ».  
  Gravité : serieux  
  Correction proposée : Ne tester que les façons longues (celles de LONGS, avec les mêmes sauts que l.411 et l.414) : aucune ne doit être sauve, et toutes doivent finir choc, air, fond ou coupe. Ignorer les rayons courts. Dire qu'un rayon absent (viser sans cible, retour pas encore joué) est sauté, au lieu de bloquer la règle. Garder la règle après la bascule : si la bascule vient de prendre « droite », rayonDe('droite') est libre, donc pas sauve, et le secours peut la remplacer. Changer le test § 8.1 en conséquence : un rayon court « libre » ne doit plus bloquer, un rayon long « libre » oui.
- Où : § 3.1, « Où » (bloc au sol après l.254) et « Ce qu'elle ne doit pas changer » / « un raccourci engagé passe avant »  
  Défaut : Le bloc au sol pose m.nitro=true sans tester m.sortie. Or, quand un raccourci est engagé, l'ordre rendu à l.272 contient `||m.nitro`. Pendant un raccourci, la route peut lâcher pour la loi 0 de la tenue, et les rayons du bord peuvent dire rien choc, versRoute choc, plane pose. Le gène allume alors la nitro au sol d'un raccourci sans réacteur (versRoute, viser, rien), donc change le décollage d'un vol voulu. Le contrat dit le contraire (« seule m.nitro change », « le raccourci passe avant »). Le compteur sortieOn compterait aussi ces cas.  
  Preuve : modele.js l.263-272 : `if(m.sortie){… else return {volant:m.sortie.cote,nitro:(R.retours.length?avecNitro(m.sortie.facon):m.sortie.facon==='plane')||m.nitro||…}` ; `permis` (l.260) ne contient pas `lache`. yeux.js l.996-999 : la tenue est jouée avec la loi 0, pas avec le volant du raccourci.  
  Gravité : serieux  
  Correction proposée : Ajouter `&&!m.sortie` à la condition au sol de sortieOn (et donc au compteur). Option : remettre m.planeBord à null quand m.sortie est engagé.
- Où : § 3.1, bloc du décollage, et § 3.6 ligne retourOn × sortieOn (« le choix du départ ne touche pas plane »)  
  Défaut : Quand sortieOn impose « plane » au décollage, m.choix reste faux, et « plane » n'est pas estRetour. Avec retourOn allumé, si la bascule passe ensuite à versRoute ou retour0, le choix du départ se déclenche en plein vol à la vue suivante. Il peut alors changer de façon sans attendre tenirFacon. Le tableau dit « sans lien ». C'est le même travers qu'un raccourci « plane » aujourd'hui, mais sortieOn l'étend aux vols subis.  
  Preuve : modele.js l.368 : `m.choix=false` au décollage ; l.379 : `if(!m.choix&&R.retours.length&&estRetour(m.facon)){m.choix=true;…}` ; l.333 : estRetour('plane') est faux.  
  Gravité : mineur  
  Correction proposée : Dans le bloc du décollage de sortieOn, quand la façon devient « plane », poser aussi m.choix=true : le choix du départ est fait, et c'est la sortie préparée. Ou, à défaut, l'écrire dans le tableau du § 3.6 comme un effet voulu.
- Où : § 3.1, « Cas limites » (m.planeBord « vieillit »)  
  Défaut : m.planeBord n'est jamais effacé au sol quand la règle cesse d'être vraie. Supposons que la règle tienne à t, puis qu'à t+0,1 le rayon plane du bord dise choc (nitro de nouveau coupée), et que le décollage arrive à t+0,2. Le vol part quand même en « plane », contre la dernière annonce, et sans la nitro tenue que le rayon supposait.  
  Preuve : Contrat § 3.1 : seul le bloc du décollage remet `m.planeBord=null`. yeux.js l.861 : les rayons du bord partent avec `nit=!!nitroOn`, l'état réel de la nitro au décollage.  
  Gravité : mineur  
  Correction proposée : Sous R.sortieOn>0, à chaque vue au sol où la règle est évaluée et fausse : m.planeBord=null. Ainsi seule la dernière annonce compte.
- Où : § 3.2 et § 3.4 (« tenuPose n'est pas recalculée »), § 10.7  
  Défaut : Le contrat garde tenuPose périmée « pour ne rien changer d'autre ». Mais ces deux blocs sont du code neuf, qui ne s'exécute que gène allumé : corriger tenuPose dedans ne change rien pour c0025. Après un passage à « rien », les figures (l.452-454 : seuil tSeuil sur tenuPose.t), largeOn et suitOn (ensuite.ligne) restent jugés sur la pose de versRoute, en travers. Une figure peut partir à la même vue sur une pose qui n'est plus la façon tenue.  
  Preuve : modele.js l.400 (tenuPose calculée avant la bascule), l.452-461 (figures), l.484-485 (suitOn ensuite).  
  Gravité : mineur  
  Correction proposée : Dans le bloc rienOn, après le changement de façon : tenuPose=r0 (le rayon rien, qui se pose propre). Dans le bloc secoursOn : tenuPose = le rayon de secours choisi. La règle « éteint = au bit près » reste vraie.
- Où : § 3.2, « La règle » et « Cas limites »  
  Défaut : Aucune hystérésis. Après le passage à « rien », si le rayon rien cesse de se poser pendant une vue, la bascule ordinaire revient à une loi de retour une fois tenirFacon passé (0,35 s). Puis rienOn peut repartir vers « rien » 0,35 s plus tard. Le pilote peut ainsi faire des allers-retours, le zigzag que le commentaire de modele.js l.358-363 veut éviter. Le dossier rappelle que la promesse de « rien » ne tient que 4 % des vues.  
  Preuve : modele.js l.390 et l.407 (la bascule quitte « rien » dès que son rayon n'est plus sauve et que depuis>tenirFacon) ; LISEZ-MOI.md l.59.  
  Gravité : mineur  
  Correction proposée : Exiger la promesse deux vues de suite, comme m.vu pour le raccourci (l.288) : une mémoire m.rienVu={t}, écrite seulement sous R.rienOn>0. Ou interdire un second passage à « rien » dans le même vol.
- Où : § 3.6, lignes coupOn × rienOn (« après rien, plus de coup ») et coupOn × secoursOn (« exclusif »)  
  Défaut : C'est inexact : un coup déjà lancé continue. La ligne l.469 tient o.nitro=true jusqu'à m.coupFin, quelle que soit la façon. Un passage à « rien » ou à un secours sans nitro (S2) pendant un coup garde donc la nitro jusqu'à 0,2 s de plus.  
  Preuve : modele.js l.468-469 : `if(R.coupOn>0){if(m.coupFin!=null&&v.t<m.coupFin)o.nitro=true;…`  
  Gravité : mineur  
  Correction proposée : Soit corriger le tableau (« un coup lancé finit sa durée »), soit remettre m.coupFin à null dans les blocs rienOn et secoursOn quand R.coupOn>0.
- Où : § 3.3, « Ne changent pas » (et § 1 point 4)  
  Défaut : La liste oublie que loiFidele 1 change aussi les figures et le choix de leur moment. tenuPose vient du rayon fidèle (l.400), et le seuil des figures (l.452-454) lit tenuPose.t, y compris dans les vols subis hors décor (parentOk par figHaut). Pour la loi « 1 = juger », le contrat dit seulement que la bascule, le départ et lacheOn changent.  
  Preuve : modele.js l.390 (mien = rayonDe), l.400 (tenuPose = mien), l.445 et l.452-454 (figures).  
  Gravité : mineur  
  Correction proposée : Ajouter « les figures (tenuPose) » à la liste de ce que la loi 1 change. Le test v4 de loiFidele doit le prévoir.
- Où : § 4.2 (compteurs) et § 10.6  
  Défaut : coupDecor est rangé parmi les drapeaux « nés à 1 », sans compteur. Il naît à 0 (« pas de coup en grotte, canyon, jade, ville »). Allumé, il change des ordres comme les autres. La liste DECLICS en oublie donc un. Second point : loiFidele.juge compte un désaccord entre deux rayons, pas un ordre changé, contrairement à la définition de la même section.  
  Preuve : genome.js l.91 : `{cle:'coupDecor',type:'drapeau',min:0,max:1,naissance:0,ou:'R'}` ; modele.js l.470 `(R.coupDecor>0||!DECOR[v.carte])`.  
  Gravité : mineur  
  Correction proposée : Ajouter un compteur coupDecor : le coup part sur une map à décor. Le nombre de noms passe alors à 23, à corriger aussi au § 2.3 et dans les tests v1. Pour loiFidele.juge, compter seulement quand la façon choisie, à la bascule ou au départ, diffère de celle qu'aurait donnée le rayon du radar. Sinon, renommer le compteur « désaccord » et le dire.

## 4. attaquer:banc-et-selection

*Rôle : relecteur « banc et sélection » : attaque le contrat sous cet angle et relève ses défauts. Phase : Attaquer.*

### Résumé

J'ai relu le contrat ml/evolution/notes/genes-v4.md sous l'angle demandé : le banc v2, la map imposée, les compteurs, la sélection. Je n'ai écrit aucun fichier. Je n'ai joué aucune course. J'ai lancé deux petits calculs node sans fichier.

Ce qui tient :
- **Les bornes du banc.** J'ai refait la constante d'O'Brien-Fleming : 2,025 et 2,077 à k = 1 ; 2,434 et 2,484 à k = 3 ; 2,617 et 2,654 à k = 5. Le tableau du § 6.5 est juste à ±0,03 près.
- **Le taux de faux positifs.** Bonferroni par bras tient le taux de faux « net » d'une vague, même quand on regarde plusieurs fois. La futilité et l'arrêt « rare » ne font que retirer des arrêts. Un seul critère principal par bras suffit, à condition que les mesures secondaires ne décident jamais. Avec des courses rarement changées (f = 0,15), la règle reste prudente (0,2 à 0,5 % pour 1 % visé).
- **Les graines.** Les restes modulo 37 sont justes : 4, 22, 1, 25, 28, 3, 5. La plage du banc ne touche aucune autre.
- **La clé de cache.** Une course sans carte garde exactement sa clé d'aujourd'hui. Une course à carte reçoit un morceau de plus. Elles ne peuvent pas se confondre. Aucun code ne découpe la clé (aucun `cle.split`).
- **Les lecteurs des lignes.** note.js, etat.js, tableau.js, mesure-tau.js et histoire.js ignorent les champs qu'ils ne connaissent pas. Le filtre de tableau.js cherche le texte `"pannes":` : un champ nouveau ne le déclenche pas.
- **L'enveloppe de decide.** piloter.js appelle `cerveau.decide(vue)` et lit `cerveau.texte` juste après : un `d0.call(C,vue)` suffit.
- **Les fichiers des trois lots.** Aucun fichier n'est écrit par deux lots.

Ce qui cloche (détail plus bas), par gravité :
1. **Bloquant.** Le critère « compteur » comparé au témoin n'a pas de sens : chez le témoin, il vaut 0 par construction.
2. **Sérieux.** La définition de « identique » (les trois empreintes) compte comme changées toutes les courses d'un bras qui demande des lois aux yeux. Leur part f mesurée vaut alors 1.
3. **Sérieux.** La liste des compteurs oublie huit drapeaux nés à 0 : coupDecor et sept raccCartes_ / raccJumeau_.
4. **Sérieux.** La reprise ne revérifie ni bras.json, ni genome.js, ni le pilote témoin, ni la note : une vague reprise peut mélanger deux pilotes sans le voir.
5. **Sérieux.** Le contrat ne dit pas ce qu'autorise un « net-aide ». L'écart lu au moment de l'arrêt est gonflé par la chance. Rien ne compte les faux positifs d'une vague à l'autre.
6. **Sérieux.** Le jeu remplace en silence une carte qu'il ne connaît pas par une map tirée au hasard. Rien ne le détecte ensuite.
7. **Mineurs.** Un test laissé à personne (generation.test.js : `v===3`), la puissance surestimée (la futilité coûte environ 5 points), le numéro de vague non borné, la cause de la mort effacée par la seconde chance, d'autres détails.

Une map imposée change plus que la map. Le jeu tire moins de nombres pour la choisir, donc toute la suite du hasard est décalée : objets, modules de grotte, météo, maps suivantes. Le contrat le reconnaît (« deux courses différentes ») sans dire pourquoi.

À la mise à jour, la sélection du Ryzen fait ce que le contrat annonce :
- une seule coupure d'époque ;
- les identifiants des pilotes sont gardés et l'identité est refaite ;
- une validation en cours retire les mêmes graines et devient séquentielle.

Ce que le contrat oublie : juste après la coupure, la revalidation du champion consomme 24 graines de validation.

Je n'ai pas pu lire jouer.js ni analyser.js du banc d'étude : ils ne sont pas dans C:\Users\sacha\code\CASH-CAR-genes-v4, et la consigne m'interdit C:\Users\sacha\code\CASH-CAR-bots-ecurie.

Pistes : C:\Users\sacha\code\CASH-CAR-genes-v4\ml\evolution\notes\genes-v4.md, C:\Users\sacha\code\CASH-CAR-genes-v4\ml\evolution\courses.js, C:\Users\sacha\code\CASH-CAR-genes-v4\ml\evolution\enfant.js, C:\Users\sacha\code\CASH-CAR-genes-v4\code\maps\continuite.js.

### Défauts relevés

- Où : § 6.4 (le type de critère « compteur ») et l'exemple de vague.json (bras « sortie » : compteur sortieOn.vol moins sortieOn.pose, sens bas)  
  Défaut : Un compteur ne s'allume que si la règle a agi (§ 4.2). Or le témoin a le gène à 0 : « drapeau à 0, le code ne s'exécute pas » (§ 3). Ses `declenchements` valent donc toujours {}. La différence appariée d_g = x_bras − 0 est toujours positive ou nulle, par construction. Avec « moins », sortieOn.vol − sortieOn.pose est aussi positif ou nul. Le bras « sortie » finira en « net-nuit » dès que quelques sorties préparées tournent mal, et jamais en « aide ». C'est le piège « gagne par construction » que le dossier relevait pour la seconde chance.  
  Preuve : genes-v4.md l.333 (« a vraiment agi = la règle a changé une valeur ») et l.125 (drapeau à 0 : aucun code) ; l.496 de l'exemple ; l.510 (`l.declenchements[nom]`, 0 si absent) ; l.519-521 (d_g = x_bras − x_témoin). prochaines-idees/LISEZ-MOI.md l.117 : le même raisonnement qui a sorti la seconde chance du banc.  
  Gravité : bloquant  
  Correction proposée : Interdire `compteur` comme critère principal (le banc refuse, code 1). Le garder en mesure secondaire, et comme mesure directe de f (la part des courses avec au moins un déclenchement du gène). Pour le bras « sortie », annoncer un critère qui existe chez les deux : `causes` (par exemple roche, paroi, pic sur la carte grotte) ou une `mesure`. La part des sorties préparées qui finissent mal ((vol − pose) / vol) peut s'écrire dans resultat.json, en description, jamais en décision.
- Où : § 6.5, décision 2 (arrêt « rare ») et § 6.7 (f̂ dans resultat.json) : « identique = mêmes empreinte, empreinteVues, empreinteTouches »  
  Défaut : Les bras qui demandent des lois aux yeux (loiFidele, secoursOn, et aussi coupOn, retourOn) ont toujours des vues différentes de celles du témoin, même quand la règle ne change aucun ordre. L'ordre porte `retours` à chaque décision, au sol comme en vol. Les yeux ajoutent alors des rayons retour<i> et `vol.retours` à la vue. L'empreinte des vues est le sha1 du texte de toutes les vues. Pour ces bras, f̂ vaudra environ 1 : l'arrêt « rare » ne joue jamais, et le f écrit dans le résultat et le journal est faux. Le dossier cite pourtant coupOn identique 37 fois sur 59 : le banc d'étude ne comptait donc sans doute pas empreinteVues.  
  Preuve : modele.js l.494 (`if(RETOURS_DEMANDES.length&&(vue.mode==='sol'||vue.mode==='vol'))o.retours=RETOURS_DEMANDES;`) ; ml/bot/yeux.js l.778-780 (`rayonsRetour(...,o.rayons,...)` et `f.retours=[]...`) ; ml/bot/piloter.js, course() (`hv.update(tv)` sur le texte de chaque vue) ; prochaines-idees/LISEZ-MOI.md l.37 (« coupOn 37 »).  
  Gravité : serieux  
  Correction proposée : Définir « identique » par `empreinte` et `empreinteTouches` seulement : la graine, la carte et les touches font la course. Garder empreinteVues comme information. Mesurer f d'abord par les compteurs : la part des graines où le compteur du gène du bras dépasse 0. Le test b5 ou b4 doit couvrir un bras loiFidele dont les ordres sont identiques et les vues différentes.
- Où : § 4.2 (« Seuls les drapeaux nés à 0 ont un compteur ; ceux nés à 1 : … les raccCartes_* et raccJumeau_*, coupDecor… ») et § 10.6  
  Défaut : C'est faux pour huit drapeaux. coupDecor naît à 0. Sept drapeaux de raccourcis naissent aussi à 0 : raccCartes_jade, raccCartes_grotte, raccCartes_canyon, raccJumeau_nuages, raccJumeau_espace, raccJumeau_grotte, raccJumeau_canyon. Ce sont des interrupteurs nés éteints, sans compteur. Les cartes grotte, canyon et jade sont justement les maps à décor visées par la vague v001. La liste DECLICS (« 22 noms ») est donc incomplète, et la règle du contrat contredit sa propre liste.  
  Preuve : node -e sur require('./genome').BORNES : coupDecor:drapeau:0, raccCartes_jade:0, raccCartes_grotte:0, raccCartes_canyon:0, raccJumeau_nuages:0, raccJumeau_espace:0, raccJumeau_grotte:0, raccJumeau_canyon:0. Le § 3.6 du contrat dit lui-même « coupDecor 0 » (table, ligne coupOn).  
  Gravité : serieux  
  Correction proposée : Ajouter un compteur `coupDecor` (le coup part sur une map à décor, ce que la valeur 0 interdit) et des compteurs `raccCartes` et `raccJumeau` (un raccourci engagé ou une jumelle prise sur une carte que la naissance interdit, un nom par famille ou par carte). Mettre à jour DECLICS, le test v1 et la phrase du § 4.2. Si on les écarte, dire pourquoi, dans le § 10.
- Où : § 6.3 (bras.json lu à chaque lancement), § 6.4 (« le fichier est figé : plan.json garde son sha1 ») et § 6.8 (code 4 : vague.json ou époque des courses seulement)  
  Défaut : À la reprise, rien ne revérifie que le témoin et les bras sont les mêmes pilotes. bras.json n'est pas figé. genome.js n'est pas dans l'époque : un `genomeTemoin` ou un `bloc` changé change le texte sans couper l'époque. Le pilote témoin (pilote-voltige.js) peut changer aussi. Un bras peut donc reprendre sous un autre shaPilote et mélanger deux pilotes dans la même vague, ou rejouer le témoin à neuf. De plus, `ep.courses` ne contient ni la config de la note (cfg.note, poidsEcart) ni l'étalon des joueurs : ils sont dans `ep.note`. Le nombre de tirages du bootstrap (cfg.validation.bootstrap) n'est dans aucune des deux. Un changement de l'un d'eux en cours de vague refait les décisions F et E d'un regard à l'autre avec une autre règle.  
  Preuve : courses.js, epoque() : `courses=sha1({jeu_sha,version,simulateur,node,regime,fichiers,reseaux})`, `note=sha1(courses+etalon+noteCfg)` ; genes-v4.md l.615 (« genome.js n'est pas dans l'époque ») ; note.js comparer : T vient de cfg.validation.bootstrap ; genes-v4.md l.601 (code 4) et l.513.  
  Gravité : serieux  
  Correction proposée : plan.json garde, pour le témoin et chaque bras, l'identifiant du génome et le shaPilote, plus `ep.note` et le nombre de tirages du bootstrap. À chaque lancement, le banc refabrique tout et compare. Au moindre écart : code 4, avec le nom du bras changé. Ajouter le cas au test b8.
- Où : § 6.5 (correction pour plusieurs bras), § 6.7 (resultat.json, resume.txt « ce qu'on peut dire »), § 10.9  
  Défaut : Le taux de 5 % ne vaut que pour une vague. Rien ne dit ce qu'un « net-aide » autorise : allumer le gène chez le témoin ? le sacrer ? Rien ne contrôle le cumul : sur 10 vagues, on attend environ 0,5 faux « net ». Surtout, le `d` du regard où l'on s'arrête est gonflé quand l'arrêt est un « net » pris tôt. C'est la chance du gagnant, la leçon du coffre et du sacre. Les mesures secondaires (dPalier, dF, dE avec leurs erreurs-types) arrivent sans correction et sans cet avertissement.  
  Preuve : notes/sacre.md : « la malédiction se mesure sur le PREMIER regard… la relecture a montré que le dernier regard est biaisé de −0,28 palier » ; commit 00fb4cfad (le « +2 paliers » des graines rejouées était la chance du gagnant) ; genes-v4.md l.583-588.  
  Gravité : serieux  
  Correction proposée : Dans resultat.json, écrire aussi le d du premier regard, de taille fixe, et marquer le d final « biaisé par l'arrêt ». Marquer les mesures secondaires « non corrigées, ne décident rien ». Écrire la règle : un « net-aide » n'est qu'un candidat. Il ne compte qu'après une vague de confirmation : un seul bras, k = 1, un numéro neuf, un nombre fixe de graines annoncé. INDEX.md compte les vagues jouées et le nombre de faux « net » attendus.
- Où : § 5 (la map imposée) et § 8.5.4 (un seul essai, sur la grotte)  
  Défaut : Le jeu remplace en silence une carte qu'il ne connaît pas par une carte tirée au hasard. Le canyon n'existe que si CANYON_OK, qui dépend de WebGL2 dans le simulateur. Une course notée `carte:'canyon'` pourrait donc se jouer ailleurs sans erreur. Rien ne compare `cartes[0]` à `carte`, sauf un test unique sur la grotte. Une précision aussi : la map imposée décale tout le hasard de la course (objets, modules de grotte, météo, maps suivantes). sfImpose tire moins de nombres que sfTire, et la map imposée entre dans SF_HIST. Le contrat le dit (« deux courses différentes ») sans dire pourquoi.  
  Preuve : code/maps/continuite.js, sfImpose : `const c=f.carte&&SF_CARTES[f.carte]?f.carte:sfTire(prev).carte` ; code/maps/niveaux.js, SF_CARTES : `...(CANYON_OK?{canyon:...}:{})` ; code/maps/canyon-route.js l.33 (`CANYON_OK=!!(renderer.capabilities&&renderer.capabilities.isWebGL2)`) ; sfTire : un tirage de map, un de météo, une teinte ; sfTire(null,c) : pas de tirage de map.  
  Gravité : serieux  
  Correction proposée : Côté lot (b) : une ligne à carte dont `cartes[0]` diffère de `carte` est non mesurée, avec la raison « carte imposée non appliquée (jouée sur x) ». Côté banc : plus de 0 ligne de ce genre → code 2. Au § 8.5, jouer une course courte sur chacune des 6 cartes de cartesTirage. Au § 5, écrire pourquoi la course diffère de la course libre (le hasard est décalé).
- Où : § 9 (le découpage) et § 8.5.1 (« tous les rapides », generation compris)  
  Défaut : tests/generation.test.js exige que les génomes soient en v:3. Il échouera après le lot (a). Il n'est dans la liste d'aucun lot. Même chose pour l'outil du § 8.5.3 (chaque gène allumé, 2 courses de 120 s, avec carte:'grotte') : gestes.test.js --courses ne sait pas imposer une carte, et personne n'est chargé de l'outil.  
  Preuve : tests/generation.test.js l.123 (`p1.vivants.every(v=>v.genome.v===3)`) et l.127 (« -> v:3 ») ; genes-v4.md l.722 (liste du lot a) et l.708-709.  
  Gravité : mineur  
  Correction proposée : Mettre generation.test.js dans le lot (a), en écrivant `v===Gn.VERSION`. Dire qui écrit l'outil du § 8.5.3 (l'intégrateur, par `ord.demander` avec `carte`, ou une option `--carte` de gestes.test.js).
- Où : § 6.5 (« ce que le banc peut voir » : 80 % à environ 1,0 palier) et § 8.4 b6  
  Défaut : Le chiffre de puissance oublie la futilité. Avec la futilité à |z| < 0,5 dès le 2e regard, une simulation donne 75 % de « net » (12 % d'arrêts par futilité) pour la dérive visée par la formule. La partie « puissance » de b6 est trop facile : un effet de 0,5 σ par graine fait une dérive de 6,9 au plafond, pour une borne de 2,65. Il passe toujours et ne contrôle rien. La partie « au plus 5 % de faux net sur 2 000 vagues » est fragile : la valeur nominale vaut 1 − 0,99⁵ = 4,9 %, et l'erreur d'une simulation de 2 000 vagues est d'environ 0,5 point.  
  Preuve : Simulation node (sans fichier) : regards 24 à 192 par 24, c = 2,645, dérive 3,485 → net 0,752, futilité 0,122, 138,7 graines en moyenne ; sous l'absence d'effet, 102 graines en moyenne. genes-v4.md l.549-550 et l.694-695.  
  Gravité : mineur  
  Correction proposée : Écrire « environ 75 % à 1,0 palier (80 % vers 1,05) ». Dans b6, tester la puissance à δ = (c + 0,84) / √192 σ ≈ 0,25 σ, en attendant 75 % ± 3. Pour les faux net, exiger un point ≤ 5,5 % et une borne basse de l'intervalle sous 5 %, et non « au plus 5 % ».
- Où : § 6.6 (graine(numero, i)) et § 6.4 (numéro unique)  
  Défaut : Trois trous. (1) Le numéro n'a pas de borne haute : la phrase « plus grande graine possible (numéro 50 000) » n'est appliquée nulle part. Le jeu sème avec `n|0` : au-delà d'environ 58 000, la graine dépasse 2³¹ et devient négative. (2) L'unicité du numéro ne se vérifie que dans les dossiers présents. v000-essai (numéro 999) et deux machines peuvent reprendre des graines déjà jouées. (3) La preuve par le reste modulo 37 suppose que toutes les plages avancent de 37. Une plage ad hoc à pas de 1 échapperait à l'argument.  
  Preuve : ml/reel/sim-env-reel.js l.16 (`SEED_CODE=n=>'…})('+(n|0)+')'`) ; genes-v4.md l.501, l.574, l.713.  
  Gravité : mineur  
  Correction proposée : Refuser numero > 50 000 (code 1). Tenir la liste des numéros pris dans vagues/INDEX.md, commité, et y lire l'unicité. Réserver une plage d'essai : numéro 0, ou v000-essai hors de git. Doubler la preuve par l'argument de taille : toutes les plages à pas libre restent sous 4 000 000, et les seules plages qui montent au-delà (la suite, le banc d'étude) ont des restes 22 et 3.
- Où : § 6.4, critère `causes` (« la part des courses finies par une de ces causes (l.cause) »)  
  Défaut : `l.cause` n'est que la cause de la dernière mort. c0025 prend la seconde chance à partir du palier 12 : la cause de la première mort disparaît de la ligne. Les deux côtés y sont soumis, donc pas de biais, mais on perd de l'information sur ce que le dossier veut mesurer (les morts air et vide).  
  Preuve : ml/bot/mesures.js l.119 (`cause:fin.cause||'?'`, sur la partie recollée) ; ml/bot/piloter.js (recolle : « fin = le dernier morceau ») ; ml/ecurie/pilote-voltige.js l.28 (`chance:{prend:1,palierMin:12}`).  
  Gravité : mineur  
  Correction proposée : Lot (b) : ajouter à la ligne `causesMorts` (la cause de chaque mort, tirée des événements 'mort' de la partie), et faire compter le critère sur ces morts. Ou poser `fixes:{chancePalierMin:30}` dans les vagues qui mesurent des causes.
- Où : § 6.3 (refus des bras) et § 6.5 (la reprise)  
  Défaut : Deux points ouverts. (1) Un bras dont le pilote est identique au témoin, comme {"loiFidele":0}, n'est pas refusé : seuls deux bras identiques entre eux le sont. Un bras nommé « temoin » non plus. (2) Le contrat ne dit pas qu'un regard j ne prend que les n_j premières graines du plan. Après un arrêt au milieu d'un paquet, le cache contient plus de courses que le regard en cours. Un code qui lirait « toutes les lignes du pilote » referait d'autres décisions.  
  Preuve : genes-v4.md l.480-481 et l.604-605.  
  Gravité : mineur  
  Correction proposée : Refuser un bras dont le shaPilote est celui du témoin, et le nom « temoin » (code 1). Écrire que chaque regard j ne lit que les graines graine(numero, 0..n_j − 1), et l'ajouter au test b7.
- Où : § 5, fin (« la sélection ne met jamais de carte ») et § 9 (evoluer.js et note.js intouchables)  
  Défaut : Ce qui protège la sélection des courses à carte n'est qu'une habitude. Plusieurs lecteurs rangent les lignes par graine, sans la carte : mesure-tau.js (epoque|id|graine) et note.comparer (une ligne par graine, la dernière gagne). Une course à carte écrite un jour dans etat/ par un outil écraserait la course libre de la même graine.  
  Preuve : mesure-tau.js l.117 (`parCle.set(l.epoque+'|'+l.id+'|'+l.graine,l)`) ; note.js l.135 (parGraine : « la dernière compte »).  
  Gravité : mineur  
  Correction proposée : Dans courses.creer (lot b) : refuser une tâche à carte quand le dossier d'état est celui de la sélection (C.chemin(cfg, cfg.dossierEtat)), avec un message clair. Le banc garde son propre dossier banc/etat.
- Où : § 4.4 (les champs de la ligne) et § 7 (le Ryzen)  
  Défaut : Deux omissions. (1) Une ligne fait environ 970 octets aujourd'hui. declenchements (jusqu'à 22 noms) et cartes l'alourdissent de 10 à 50 %. La mesure de tau dans les pages s'arrête au-delà de 100 Mo de journaux : sur le Ryzen, elle passera plus tôt à « pas mesuré ici ». (2) Le § 7 ne dit pas qu'après la coupure d'époque, le Ryzen revalide d'abord son champion (24 graines de validation, plan fixe) et refait l'identité, avant toute naissance.  
  Preuve : tests/etat-e93ff5cb5/courses-2026-48.jsonl : 38 lignes, 969,8 octets en moyenne ; etat.js (`TAU_MAX_OCTETS=100*1024*1024`) ; evoluer.js (« La revalidation d'après une nouvelle époque garde son lot fixe »).  
  Gravité : mineur  
  Correction proposée : Au § 4.4, des noms de compteurs courts, et la croissance dite. Au § 7, une ligne : « à la reprise : identité, puis revalidation du champion (24 graines), puis la génération ». Dire aussi de ne pas faire tourner un banc v2 sur le Ryzen en même temps que la sélection (la charge du PC fait des pannes, et ces courses sont rejouées).
- Où : § 6.5 (coût : « environ 6 h 25 à 180 courses par heure ») et § 10.8 (« imposer toutes les maps demanderait de toucher au jeu »)  
  Défaut : (1) Les 180 courses par heure viennent du banc d'étude, avec son propre nombre de courses à la fois. Le v2 en lance 2 par défaut : son coût n'est pas mesuré. (2) Le jeu a déjà un crochet qui impose la même carte à chaque portail (dbgBancCarte). Il ne faudrait pas toucher au jeu : seulement à piloter.js et jeu-reel.js, ce qui change l'époque des yeux. C'est hors du lot, mais l'option est moins chère que ce qu'écrit le contrat.  
  Preuve : prochaines-idees/LISEZ-MOI.md l.31 ; code/economie/aura-banque-contrats.js l.98-101 (`window.dbgBancCarte=function(c,m){…Object.defineProperty(SF,'force',…)`).  
  Gravité : mineur  
  Correction proposée : Écrire « débit du v2 à mesurer sur la vague d'essai (§ 8.5.6) ». Au § 10.8, citer dbgBancCarte comme voie future (un changement de piloter.js ou jeu-reel.js, donc une époque des yeux, sans toucher au jeu).
- Où : § 5, point 4 (`node ml/evolution/enfant.js --essai <pilote.js> <graine> [tmax] [--carte grotte]`)  
  Défaut : Aujourd'hui, enfant.js lit tmax en A[3]. Si on tape `--essai p.js 4000000 --carte grotte`, tmax devient NaN. Rien n'interdit non plus une carte vide. La valeur « pas de carte » (absente, null ou '') n'est pas mise sous une forme unique avant la clé, l'envoi et la ligne.  
  Preuve : enfant.js : `const fichier=path.resolve(A[1]||''),graine=+A[2],tmax=+(A[3]||45);`  
  Gravité : mineur  
  Correction proposée : Lire --carte par son nom, et tmax seulement si A[3] ne commence pas par « -- ». Dans une(t), ramener la carte à une forme unique une seule fois (carte = chaîne non vide, sinon null), et utiliser cette valeur pour la clé, l'envoi et faireLigne.

## 5. reprendre

*Rôle : architecte, second passage : corrige le contrat d'après les trois attaques. Phase : Reprendre.*

### Résumé

Le contrat C:\Users\sacha\code\CASH-CAR-genes-v4\ml\evolution\notes\genes-v4.md est corrigé : 1 037 lignes, toujours non commité, aucun code écrit, aucune course jouée. J'ai relu chaque preuve dans le code de ddca156d8, par lecture et par node -e. Les 37 défauts (1 bloquant, 14 sérieux, 22 mineurs) sont tous corrigés dans le texte. Un seul est retenu en partie : les noms courts des compteurs. La section finale « Relecture du contrat » les reprend un par un.

Ce qui a changé sur le fond :

- **Les preuves du code d'avant.** Chaque version est épinglée par commit : v:1 à e2ea8d2c9, v:2 à 7f9543955, v:3 à ddca156d8. Le pilote d'avant s'écrit avec SON modele.js, par l'option o.modele, avec un garde-fou dans le test. Un test qui saute compte comme un échec. gestes.test.js (g2) épingle e2ea8d2c9. Le test m6 de genes-muets part de l'ancien code vers le nouveau. generation.test.js entre dans le lot (a), avec un troisième état source en v:3. Un nouveau test v3 bis vérifie le profilSha et palierMin, un entier qui vaut 12.
- **sortieOn.** Ajout de !m.sortie : la règle n'allume plus la nitro d'un raccourci engagé. m.planeBord est remis à zéro dès que l'annonce change. m.choix=true quand le vol part en plane.
- **rienOn.** La promesse doit tenir deux vues de suite, et le passage à « rien » n'arrive qu'une fois par vol. tenuPose prend le rayon « rien ». Un coup de nitro en cours s'arrête.
- **loiFidele 1.** Le contrat dit maintenant qu'elle change aussi les figures.
- **secoursOn.** Seules les façons longues (LONGS) comptent. Un rayon absent est sauté, un rayon long « libre » bloque, les façons courtes sont ignorées. La règle se lit après la bascule. C'est le défaut sérieux du relecteur : la règle ratait l'instant de la toupie.
- **Les compteurs.** Il y en a 25. La garde exacte est donnée pour chacun (volRetourOn se garde par R.volRetour>0). Ajouts : coupDecor, raccCartes, raccJumeau. loiFidele.juge devient loiFidele.desaccord.
- **La règle d'écriture des compteurs.** Tout leur code est dans if(COMPTE){try{…}catch(e){}}. La liste de ce qu'un compteur n'appelle jamais est écrite (teteSol, versRoute, FACONS…). Les tests : 3 000 suites de vues tirées au hasard, chacun des 25 noms déclenché au moins une fois, DECLICS contrôlé dans les deux sens. Le contrat dit aussi le prix futur : retoucher un compteur fera une nouvelle époque.
- **La ligne de course.** Nouveau champ causesMorts : la cause de chaque mort, seconde chance comprise.
- **Les maps imposées.** Le contrat explique pourquoi le hasard de toute la course est décalé. Une carte non appliquée par le jeu donne une course non mesurée. Une course à carte est refusée dans l'état de la sélection. « Pas de carte » n'a plus qu'une seule forme, et --carte se lit par son nom.
- **Le banc v2.** Un compteur ne peut plus être le critère principal : c'était le défaut bloquant, car il vaut 0 chez le témoin par construction. « Identique » veut dire mêmes empreinte et empreinteTouches. À chaque reprise, les pilotes, l'époque, la note et le bootstrap sont recomparés à plan.json (code 4 au moindre écart). Un « net-aide » n'est qu'un candidat, confirmé par une seconde vague. L'écart du premier regard est écrit, l'écart final est marqué « biaisé par l'arrêt », et INDEX.md compte les faux « net » attendus. Les numéros de vague vont de 1 à 50 000, inscrits dans INDEX.md ; le numéro 0 sert à l'essai. La puissance est ramenée à 75 % à 1 palier. Le test b6 est durci, et le débit sera mesuré sur la vague d'essai.
- **Le Ryzen (§ 7).** La migration est à sens unique : copier etat\ et champions\ avant le premier lancement. L'ordre à la reprise : identité, puis revalidation du champion (24 graines), puis la génération. mesure-tau perd environ λ enfants « coupés » à la bascule. Pas de banc v2 en même temps que la sélection.

### Décisions

- Compteurs : seuls les drapeaux nés à 0 en ont un ; ceux nés à 1 et dessousDecor n'en ont pas. Autre option : leur en donner un dès maintenant, pour ne pas payer une nouvelle époque le jour où un bras voudra les éteindre (au prix d'un declic presque à chaque vol).
- loiFidele.desaccord compte un désaccord entre deux rayons, pas un ordre changé ; c'est la seule exception à la définition. Autre option : refaire toute la décision « sans la loi fidèle » dans le pilote (beaucoup de code neuf dans une règle qui doit rester inerte).
- rienOn : deux vues de suite et une seule fois par vol. Autre option : deux vues de suite seulement, plusieurs passages possibles dans un même vol.
- secoursOn : un rayon long « libre » bloque le secours (on ne sait pas où il finit). Autre option : le traiter comme une mort (jauge vide), ce qui rend le secours plus fréquent.
- Banc : un « net-aide » n'est qu'un candidat, à confirmer par une vague de plus (un bras, graines neuves, taille fixe). Autre option : se contenter du premier « net » avec l'avertissement « biaisé par l'arrêt ».
- Banc : « identique » = mêmes empreinte et empreinteTouches, sans empreinteVues. Autre option : f mesuré d'abord par les compteurs (part des graines où le compteur du gène dépasse 0).
- Le critère du bras sortie de la vague v001 : les morts de décor (roche, paroi, pic, glace, causes citées au dossier, à relire dans code/gameplay/mort.js). Autre option : la mesure poseCentre.
- Les causes des morts passent par un champ causesMorts ajouté par le lot (b). Autre option : poser fixes {chancePalierMin:30} dans les vagues qui mesurent des causes, sans toucher à la ligne.
- Les tâches à carte sont refusées dans le dossier d'état de la sélection. Autre option : mettre la carte dans la clé de mesure-tau et de note.js (hors lot, note.js est intouchable).
- chancePalierMin reste figé (fige:true, sauté sans tirage dans muter et croiser) ; changer sa valeur un jour exigera de renommer tous les vivants, témoin compris, ou de repartir par --repartir-de. Autre option : un gène mutable, que je déconseille.
- Les noms des compteurs restent lisibles (sortieOn.vol, loiFidele.desaccord…) plutôt que courts : c0025 n'écrit que {}, et la ligne grossit d'environ 12 %. Autre option : des noms de 2 ou 3 lettres.
- Le numéro 0 est réservé à la vague d'essai (graines réutilisables, jamais conclue, hors de git). Autre option : un numéro réel pris dans INDEX.md.

### Problèmes

- Le banc d'étude (ml/ecurie/etude/banc-des-genes/) n'est pas dans git : je n'ai pu relire ni jouer.js ni analyser.js. Sa façon de compter les « identiques » reste à comparer à la nouvelle quand la mesure en cours sera finie.
- Non vérifié dans le simulateur : CANYON_OK, donc le canyon peut ne pas s'imposer. Le test lent du § 8.5, point 4, le dira (une course sur chacune des 6 cartes).
- Non vérifié : les noms exacts des causes de mort de la grotte (pour la famille « décor ») et que e[2] de l'événement 'mort' est bien la cause. mesures.js le lit ainsi (mort:e[2]) et enregistreur-jeu.js écrit ['mort', mortCause, …].
- Les chiffres de puissance (75 %, 102 et 139 graines) viennent de la simulation d'un relecteur, pas refaite ici ; le test b6 les contrôlera.
- Le contrat est non commité dans C:\Users\sacha\code\CASH-CAR-genes-v4 (consigne : aucun commit).
