# sortieOn réécrit après la mesure : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `sortie-on-reecrite` (wf_a86ae302-f88), lancée par la session principale (Claude Fable).
- Agents : 2, tous du modèle claude-opus-5-5.
- Durée : 1 h 44 ; jetons consommés par les agents : 495 749 (0,50 millions) ; appels d'outils : 165.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. auteur : réécrit sortieOn dans le pilote, le contrat, les tests, les notes et l'étude (phase « Ecriture »)
2. relecteur et intégrateur : vérifie l'identité, joue de vraies courses, relance les tests lents, fait le commit (phase « Relecture »)

## 1. auteur

*Rôle : auteur : réécrit sortieOn dans le pilote, le contrat, les tests, les notes et l'étude. Phase : Ecriture.*

AMENDEMENT sortieOn APPLIQUE (copie C:\Users\sacha\code\CASH-CAR-genes-v4, branche genes-v4, rien de commite).

FICHIERS MODIFIES (ml/evolution/ sauf mention)
- modele.js : le bloc « GENE V4 — LA NITRO AU DECOLLAGE SUR LES MAPS A DECOR (28/11/2026, reecrit apres la mesure des decollages : ml/ecurie/etude/sortie-preparee …) » applique la regle telle que decidee : if(R.sortieOn>0){ if(decor&&!m.sortie&&lache&&!v.dessous&&!v.glisse&&!v.rebond&&tn.t!=null&&tn.t<R.sortieT&&jauge>R.sortieJauge){ compteur sortieOn si !m.nitro ; m.nitro=true; m.planeBord=v.t; } else m.planeBord=null; }. La regle ne lit plus aucun rayon du bord.
  - Au decollage, il ne reste que le compteur et la remise a zero : if(R.sortieOn>0){ if(COMPTE){try{if(!m.voulu&&m.planeBord!=null&&v.t-m.planeBord<.35){tic('sortieOn.vol');m.cSortie=v.t;}}catch(e){}} m.planeBord=null; }. m.facon='plane' et m.choix=true sont retires.
  - Le compteur loiFidele.suit devient Math.abs(c.volant-o.volant)>.01||c.manche!==o.manche (dans son if(COMPTE){try…}).
  - L'en-tete du fichier est mis a jour.
- genome.js : un commentaire seulement. BORNES, DECLICS (25 noms) et GARDES ne changent pas. Les identifiants sont gardes : c0025 19e3767cc346, c0101 f70ddcb5a565, et le bras sortieOn reste 117f2cd8619a.
- arbre.js : les MOTS de sortieOn, sortieT et sortieJauge.
- banc/bras.json : les « dit » changent, les genes non (« la nitro au decollage sur les maps a decor » ; « la meme, gardee des 1 s avant le bord »). Le « dit » n'entre pas dans le controle de reprise. banc/exemples/v000-essai.json n'a pas de « dit » : je ne l'ai pas touche.
- tests/genes-v4.test.js : les tests (v4) sortieOn sont reecrits :
  - la nitro est gardee quels que soient les rayons du bord, et aussi sans v.sorties ;
  - aucune des 84 vues de vol des suites « sortie » ne change par rapport au temoin ;
  - rien ne change sans decor, avec t > sortieT, avec une jauge basse, ni en dessous, glisse ou rebond ;
  - avec retourOn, le choix du depart se fait comme sans le gene ;
  - un test nouveau sortieOn+relacheOn : la nitro reste tenue au debut du vol.
- tests/vues-genes-v4.js : six suites de plus (annonce effacee, decollage tardif, dessous, glisse, rebond, sans rayons) et les commentaires.
- tests/compteurs.test.js : un test nouveau (c7) sur le sens des trois compteurs sortieOn et sur le seuil 0,01 de loiFidele.suit (0,004 et -0,009 non ; 0,02, -0,05 et un manche autre oui).
- tests/genes-muets.test.js : un commentaire.
- INTERFACES.md § 12.2 et § 12.3, README.md (l'idee v4 decrite en mots simples).
- notes/genes-v4.md : un nouveau « § 3.1 bis Amendement du 28/11 apres la mesure des decollages ». Il dit pourquoi, la regle, les compteurs, les interactions, les tests, ce qu'on ne sait pas et la piste. Les anciens textes sont gardes et marques « remplace » : § 3.1, la colonne sortieOn du § 3.6, les lignes sortieOn.vol et loiFidele.suit du § 4.2, le § 4.3, le § 6.3 et le § 8.1.
- notes/LIVRAISON-GENES-V4.md : nouveau § 2 quater (chiffres ci-dessous), § 1 point 1, et la decision § 5 n° 1 marquee tranchee.
- notes/genes-v4-lot-a.md : une section « Amendement du 28/11 ».
- ml/ecurie/etude/sortie-preparee/LISEZ-MOI.md (hors git) : nouvelle partie « 9. Ce que l'on en fait ». Elle donne la regle reecrite et pourquoi. Elle dit ce qu'on ne sait pas : la nitro en grotte ou au canyon peut tuer plus vite, et seul le banc le dira. Elle note la piste pour plus tard : le levier est au sol avant le bord, et les raccourcis voulus tuent en ville (5 morts sur 22).

INTERACTIONS (§ 3.6)
- bordOn et sortieOn ne se recouvrent toujours pas (!decor contre decor).
- Pendant un raccourci engage (m.sortie), rien ne change : la regle ne fait que remettre m.planeBord a null. Un raccourci ne peut pas s'engager a la vue meme ou la regle agit (il exige !lache), ni la sortie du dessous (!lache, et la regle exige !v.dessous).
- libreOn est exclusif avec sortieOn (libre exige !decor).
- dessousNitro est exclusif avec sortieOn : il n'agit que sous la dalle (tetu ou sortir, donc v.dessous), et la regle exige !v.dessous et !m.sortie.
- coupOn ne change rien dans la decision : le vol reste « vers la route » et m.nitroAvant n'est ecrit qu'en vol ; sur decor il faut coupDecor = 1. Dans le jeu, un decollage nitro allumee arme le coup : un coup du pilote peut le trouver arme plus souvent. Non mesure.
- relacheOn garde la nitro tenue en debut de vol jusqu'a relacheT. C'est l'effet voulu, et il est teste.
- retourOn fait son choix du depart comme sans le gene.

TESTS (lances un par un, tous passent ; journaux dans ml/evolution/essais/sortie-reecrite/)
- genes-v4 19/19, relance apres les dernieres retouches.
- compteurs 6/6, c7 compris.
- genes-muets 6/6 : sortieT et sortieJauge sont muets eteints et lus allumes (m3 : « bord grotte t 0.5 jauge 0.6 » et « bord grotte t 0.2 jauge 0.3 »).
- portage 11/11, gestes 10/10, genome 14/14, traces 87/87, carte-et-declic 33/33, banc 49/49.
- genome.js --essai-reparer 10000 : 0 genome hors bornes.

ETEINT = COMME 7f85efb38
- Methode : essais/sortie-reecrite/preuve-eteint.js, avec le modele.js de 7f85efb38 relu par git show dans le dossier d'essai.
- 104 pilotes a sortieOn 0 : c0025, c0101, « tout allume sauf sortieOn » (loiFidele 2), c0101 + tout, et 100 mutants.
- Sur 326 suites, 85 176 decisions sont identiques (ordres sans declic, erreurs). Les declic sont aussi identiques sur ces suites.
- Le TEXTE du pilote change : c0025 87695d9b9cc7 -> 74b588baf052, c0101 a36d87d6b985 -> 76a234d9a8d5. L'epoque des courses change donc (sur ce PC, c8999deeb421 -> bb3e37855092), comme prevu avec ce lot.
- Non relances apres l'amendement (tests lents) : identite.test, evoluer.test, courses.test.

LES 4 COURSES (c0025 + sortieOn, 120 s, carte tenue, graines 3963000+37i pour i = 300 a 303, 2 a la fois ; le temoin rejoue sur les memes graines pour comparer)
Aucune course n'a eu d'erreur, de panne, de « YEUX CHANGES » ni de seconde chance.

| map (graine) | sortieOn | sortieOn.vol | sortieOn.pose | gene : palier / survie | temoin : palier / survie | nitro au decollage (gene / temoin) |
|---|---|---|---|---|---|---|
| grotte (3974100) | 5 | 1 | 0 | 4 / 94,6 s, mort roche | 4 / 94,7 s, mort roche | 1 seul vol : non mesure |
| ville (3974137) | 20 | 5 | 5 | 7 / 120 s | 8 / 120 s | 0,45 / 0,27 |
| jade (3974174) | 14 | 3 | 3 | 7 / 120 s | 4 / 55,4 s, mort air | 0,57 / non mesure |
| canyon (3974211) | 14 | 5 | 5 | 6 / 120 s | 3 / 32 s, mort paroi | 0,50 / non mesure |

Total : sortieOn 53, sortieOn.vol 14, sortieOn.pose 13. Ce sont des controles de fonctionnement, pas une mesure du palier.

ECARTS A LA DECISION
- Aucun ecart dans le code.
- Une precision de sens, ecrite dans le contrat § 3.1 bis : le compteur sortieOn compte chaque VUE au sol ou la regle agit, pas chaque decollage. Comme pour bordOn, la route qui lache recoupe m.nitro a chaque vue et la regle la rallume.
- banc/exemples n'est pas modifie : il ne decrit aucune regle, il nomme seulement le bras « sortie » avec un critere sur les morts contre le decor, qui reste sense.

## 2. relecteur-integrateur

*Rôle : relecteur et intégrateur : vérifie l'identité, joue de vraies courses, relance les tests lents, fait le commit. Phase : Relecture.*

L'amendement sortieOn est relu, corrigé et commité sur genes-v4 : commit d30db9519 (parent 7f85efb38). Rien n'est poussé ni fusionné. Je n'ai rien touché dans code/, VERSION PRINCIPALE/ ni CASH-CAR-bots-ecurie.

DÉFAUTS TROUVÉS ET CORRIGÉS (aucun dans le code, tous dans les textes)
- Dans ml/evolution/notes/genes-v4.md, le § 1 « En mots simples » point 2 décrivait encore « la sortie préparée ». Il est maintenant marqué « Remplacé le 28/11 (§ 3.1 bis) » avec la nouvelle idée.
- L'étude ml/ecurie/etude/sortie-preparee/LISEZ-MOI.md, partie 9, ne disait pas que la décision s'écarte de la proposition de son relecteur (§ 8.5 : laisser éteint, ou passer en versRoutePlane). J'ai ajouté :
  - pourquoi la décision diffère : c'est la règle R5. Elle touche 115 décollages distincts, 5,2 par course de 180 s, dont 17 des 24 mortels. On le retrouve dans sorties/relecture.txt, ligne « R5 (distincts) ».
  - d'où vient le chiffre « 0 sur 253 » : le champ S.nitro de sorties/relecture.json (253 décollages avec une vue au sol, 0 nitro vraie).
  - un paragraphe « Ce qui a été contrôlé ».
- ml/evolution/notes/LIVRAISON-GENES-V4.md :
  - l'en-tête disait « un seul commit » : il dit maintenant deux commits ;
  - l'époque est passée à bb3e37855092, que j'ai vérifiée moi-même par courses.epoque ;
  - le titre du § 2 quater disait « pas encore commité » ;
  - la ligne « pas vérifié » disait « sortieOn jamais déclenché » ;
  - la phrase « identite et evoluer non relancés » ;
  - un bloc « relecture adverse et intégration » a été ajouté avec mes chiffres.
- Je n'ai trouvé aucun reste de l'ancienne règle (« part en plane », « rien au choc ») dans README, INTERFACES, banc/README, bras.json ni arbre.js. Il en reste seulement dans des passages d'histoire marqués « remplacé ».
- Un point que j'ai laissé tel quel : l'exemple de vague de banc/README.md et banc/exemples/v000-essai.json juge le bras « sortie » sur les morts contre le décor. C'est cohérent avec « la nitro peut tuer plus vite », mais une vraie vague voudra peut-être aussi juger sur la mesure nitroDecol ou sur E.

1. LE CODE, RELU DANS LE DIFF
- La règle au sol est celle de la décision, caractère pour caractère, avec `else m.planeBord=null`.
- sortieOn ne lit plus du tout v.sorties.
- Il n'y a plus de `m.facon='plane'` ni de `m.choix=true`.
- Au décollage, il ne reste que le compteur `if(COMPTE){try{if(!m.voulu&&m.planeBord!=null&&v.t-m.planeBord<.35){tic('sortieOn.vol');m.cSortie=v.t;}}catch(e){}}` puis `m.planeBord=null`.
- m.planeBord n'est lu que par ce compteur. Il est remis à null à chaque vue au sol où la règle est fausse et à chaque décollage.
- La seule vue au sol qui le saute est le départ de course (le `return` anticipé de auSol, ligne 220). C'est sans effet, puisque le compteur exige moins de 0,35 s.
- Quand le gène est éteint, rien n'est lu ni écrit : tout est sous R.sortieOn>0, ou sous COMPTE pour m.cSortie.
- Le compteur loiFidele.suit est bien `Math.abs(c.volant-o.volant)>.01||c.manche!==o.manche`.

2. ÉTEINT = COMME 7f85efb38, PAR UN AUTRE CHEMIN QUE L'AUTEUR
- Script : ml/evolution/essais/sortie-reecrite/relecteur/preuve-vues.js ; résultat dans preuve-vues.txt. Commande : `node ml/evolution/essais/sortie-reecrite/relecteur/preuve-vues.js 120`, code 0, 19 min 35 s.
- Les vues : les 4 050 vues de vraies courses de essais/relecture-v4-bit/vues/ (t25 450, t25tout 1200, t101 1200, t101tout-grotte 1200).
- Les pilotes : 126, tous à sortieOn 0 :
  - c0025 et c0101 ;
  - « tout allumé sauf sortieOn » sur chacun des deux ;
  - c0101 + loiFidele 2 ;
  - c0025 + loiFidele 2 + rienOn + secoursOn ;
  - 120 mutants v:4 tirés par le muter d'aujourd'hui, avec loiFidele 2 forcé une fois sur 0,4.
- Chaque pilote est écrit deux fois, avec le modele.js de 7f85efb38 (relu par git show) et avec celui d'aujourd'hui.
- Résultat : 510 300 décisions, 0 écart d'ordre (texte JSON du bac, NaN et -0 compris) et 0 écart d'erreur. Les 18 850 erreurs sont les mêmes des deux côtés.
- Le champ declic diffère 126 fois, toujours par le seul retrait de loiFidele.suit (2 528 avant, 2 402 après).
- Une troisième copie instrumentée du nouveau modèle montre que ces 126 vues sont exactement celles où 0 < |écart de volant| ≤ 0,01 avec le même manche. Il n'y a aucune autre vue de ce genre et aucun autre écart de declic.
- Les identifiants ne changent pas : c0025 19e3767cc346, c0101 f70ddcb5a565, et le bras sortieOn reste 117f2cd8619a.

3. ALLUMÉ : 4 VRAIES COURSES DE MON CÔTÉ
- c0025 + sortieOn, 120 s, carte tenue, i = 310 à 313, une course à la fois, puis le témoin sur les mêmes graines. Script relecteur/courses.sh ; pilotes refaits par relecteur/fabriquer.js, identiques à ceux de l'auteur.
- Dans les 8 courses, tout est au code 0 : 0 erreur, 0 panne, pas de « YEUX CHANGES », aucune seconde chance prise.

| map (graine) | sortieOn / .vol / .pose | gène : palier, survie | témoin : palier, survie | nitroDecol (gène / témoin) |
|---|---|---|---|---|
| grotte 3974470 | 13 / 2 / 2 | 4, 66,5 s (roche) | 7, 120 s | 0,50 / 0 |
| ville 3974507 | 0 / 0 / 0 | 3, 27,3 s (tour) | course identique (même empreinte) | non mesuré (course de moins de 60 s) |
| jade 3974544 | 31 / 6 / 6 | 6, 120 s | 7, 113,5 s (pic) | 0,625 / 0,167 |
| canyon 3974581 | 9 / 1 / 0 | 6, 57,1 s (paroi) | 3, 43,7 s (paroi) | non mesuré (course de moins de 60 s) |

- Le compteur sortieOn est > 0 dans 3 courses sur 4. En ville, la course meurt à 27 s après un seul vol, sans que la règle agisse.
- Ce sont des contrôles de fonctionnement, pas une mesure du palier.

4. LES TESTS, UN PAR UN (journaux dans relecteur/tests/)
- Tous passent : genes-v4 19/19, compteurs 6/6, genes-muets 6/6, portage 11/11, gestes 10/10, genome 14/14, generation 16/16, traces 87/87, relecture-traces 95/95, carte-et-declic 33/33, integration 29/29, commun 16/16, graines 13, note 16, tableau 72/72, lanceurs 76/76, robustesse 8/8, machine 45/45, machine-relecture 19/19, node-epoque (passe), validation-sequentielle 25/25, mesure-tau 75/75, banc 49/49.
- genome.js --essai-reparer 10000 : 0 génome hors bornes.
- identite.test.js --travailleurs 2 : 9/9 en 326 s, c0025 et c0101 IDENTIQUES sur les graines 910000, 910037 et 910074.
- evoluer.test.js --travailleurs 2 : TOUT PASSE, 78 contrôles OK, 2 262 s.

5. LE COMMIT
- Hash : d30db9519.
- 111 fichiers : les 13 fichiers du lot et tout ml/ecurie/etude/sortie-preparee/ (98 fichiers, 2,9 Mo en tout, sorties/lignes 2,3 Mo ; aucun fichier au-dessus de 5 Mo, aucun nom de machine).
- Le message suit le modèle du dépôt et se termine par « — le jeu ne change pas » puis la ligne Co-Authored-By: Claude Fable 5.2 <[adresse retirée]>.

CE QUI RESTE NON VÉRIFIÉ
- courses.test n'a pas été relancé.
- Rien n'a tourné sur le Ryzen.
- L'effet de sortieOn sur le palier et sur les morts contre le décor n'est pas mesuré. Seul le banc le dira. Les deux vols partis nitro allumée qui finissent mal (grotte 3974100 chez l'auteur, canyon 3974581 chez moi) précèdent chacun la seule mort de la course.
- Le texte du pilote change, donc une nouvelle époque : bb3e37855092 sur ce PC.

Les traces hors git sont dans C:\Users\sacha\code\CASH-CAR-genes-v4\ml\evolution\essais\sortie-reecrite\relecteur\ (preuve-vues.js, preuve-vues.txt, fabriquer.js, courses.sh, les course-*.json et .err, tests\*.log).
