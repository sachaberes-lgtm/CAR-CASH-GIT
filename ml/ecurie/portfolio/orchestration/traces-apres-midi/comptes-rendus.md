# Les traces de l'après-midi du 28/11 (les huit orchestrations du jour, le journal, la passation) : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu en texte libre ; l'outil le recopie sans rien réécrire, en descendant seulement ses titres sous celui de l'agent. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `traces-du-28-apres-midi` (wf_87e4cc26-065), lancée par la session principale (Claude Fable).
- Agents : 3, tous du modèle claude-opus-5-5.
- Durée : 20 min ; jetons consommés par les agents : 728 027 (0,73 millions) ; appels d'outils : 198.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. rédacteur des traces des orchestrations : range les huit travaux du 28/11 avec l'outil orchestration.js (phase « Ecrire »)
2. rédacteur du journal : écrit la suite du 28/11, la passation et le registre des impasses (phase « Ecrire »)
3. relecteur : cherche les erreurs et les détails privés des deux autres, corrige, fait le commit (phase « Relire »)

## 1. ranger les 8 orchestrations

*Rôle : rédacteur des traces des orchestrations : range les huit travaux du 28/11 avec l'outil orchestration.js. Phase : Ecrire.*

Les huit orchestrations du 28/11 sont rangées dans ml/ecurie/portfolio/orchestration/, avec l'outil ml/ecurie/portfolio/outils/orchestration.js, comme les huit déjà rangées. Rien n'est commité. Je n'ai rien touché hors de ml/ecurie/ et je n'ai lancé aucune course ni aucun test.

DOSSIERS CRÉÉS (chacun avec script.js et comptes-rendus.md ; aucun n'était déjà rangé)
- prochaines-idees/ (wf_b84c1055-e3c)
- traces-du-28/ (wf_e7c9c530-0ea)
- contrat-v4/ (wf_a8860828-eec)
- code-v4/ (wf_97cc59d9-d7e)
- lecture-du-banc/ (wf_f91dd3e4-3e4)
- greffes/ (wf_3dbb33d5-4d2)
- sortie-mesure/ (wf_e9f81f3f-6ec)
- sortie-reecrite/ (wf_a86ae302-f88)

L'outil est relancé sur les seize travaux. Les huit dossiers déjà rangés sortent à l'identique : `git diff` est vide sur eux, seuls des avertissements de fins de ligne s'affichent.

CE QUI A CHANGÉ DANS orchestration.js
- Huit entrées de plus dans TRAVAUX, dans l'ordre où elles ont démarré, avec le drapeau `nouveau`. Le rôle de chaque agent vient des étiquettes et des phases des scripts.
- Les noms de champs nouveaux en français (candidats, constat, mecanisme, decisions, etc.).
- Les accents remis dans les noms d'angles (« au bit près », « sémantique », « défauts », etc.).
- Une règle de nettoyage nouvelle, MOTS_CACHES, décrite dans l'en-tête de l'outil. Le nom propre de l'assistant du Ryzen devient « l'assistant de Sacha sur le Ryzen ». L'outil ne contient pas ce nom, seulement son empreinte SHA-256, à laquelle chaque mot est comparé.

TABLEAU FINAL (bilans workflows/<id>.json ; tous les agents sur claude-opus-5-5)

| Travail | Agents | Durée | Jetons | Appels d'outils |
|---|---|---|---|---|
| prochaines-idees | 11 | 32 min | 2 432 325 | 451 |
| traces-du-28 | 4 | 17 min | 761 477 | 178 |
| contrat-v4 | 5 | 42 min | 1 349 564 | 244 |
| code-v4 | 8 | 3 h 38 | 2 490 163 | 681 |
| lecture-du-banc | 3 | 15 min | 481 454 | 53 |
| greffes | 2 | 1 h 59 | 427 841 | 142 |
| sortie-mesure | 2 | 43 min | 503 584 | 101 |
| sortie-reecrite | 2 | 1 h 44 | 495 749 | 165 |
| sous-total du 28/11 | 37 | | 8 942 157 | 2 015 |
| sous-total du 27/11 | 53 | | 9 300 742 | 2 180 |
| sous-total de la nuit | 31 | | 7 192 979 | 2 018 |
| total | 121 | | 25 435 878 | 6 213 |

Horaires (heure de Paris), tirés de startTime + durationMs : 7 h 20–7 h 53, 7 h 24–7 h 42, 7 h 55–8 h 37, 8 h 39–12 h 17, 10 h 47–11 h 02, 11 h 04–13 h 03, 12 h 19–13 h 02, 13 h 03–14 h 47.

Fable : aucun des 37 agents n'a tourné sur Fable. Les bilans indiquent claude-opus-5-5 pour chacun, et tous les scripts disent `model: 'opus'`. Seul le `defaultModel` des bilans vaut claude-fable-5-2, c'est-à-dire la session principale. Le LISEZ-MOI le dit.

LE LISEZ-MOI (ml/ecurie/portfolio/orchestration/LISEZ-MOI.md)
- L'introduction annonce seize travaux (27/11, la nuit, puis huit le 28/11 de 7 h 20 à 14 h 47).
- Le tableau a huit lignes de plus, un sous-total du 28/11 et un nouveau total.
- Le paragraphe sur les deux orchestrations « pas encore rangées » est mis à jour, avec les chevauchements entre équipes. L'orchestration qui a fait ce rangement (wf_87e4cc26-065) n'est pas rangée.
- Une nouvelle section « Le 28/11 : ce qui se passe autour des huit équipes » :
  - le banc fini et lu (46842ee77) ;
  - le Ryzen : commits horaires, première mise à jour à 13 h 11 (98db666ae), état de 14 h, première greffe ;
  - la consigne de Sacha sur Fable, citée telle quelle, retrouvée dans la conversation à 12 h 07 heure universelle ;
  - la fusion 77083d123 et la vague 15c7f1cb3.
- Les sections 9 à 16, une par travail : le but, l'équipe, ce que les relecteurs ont trouvé et corrigé (pris dans les comptes rendus), et ce que la session principale a fait après (pris dans les messages de commit).
  - L'impasse de la sortie préparée est dite telle quelle dans la section 15.
  - Les tests identite.test, evoluer.test et courses.test sont écrits « en cours ».
  - La vague 1 n'a aucun résultat écrit.
  - Ce qui attend est écrit : la mise à jour n° 2 du Ryzen, la migration v:4 à sens unique avec la copie de etat\ et champions\ avant, et les trois questions laissées à Sacha.
- Six puces de plus dans « Ce que cette méthode ne garantit pas ». L'une dit que 3 des 37 comptes rendus sont en anglais, tous dans code-v4 (lot-b:courses, relire:bit-pres, relire:semantique).
- Le paragraphe sur le nettoyage du 28/11 après-midi, et le paragraphe sur qui a écrit quoi, sont mis à jour.

CE QUE J'AI MASQUÉ (14 remplacements dans les huit nouveaux dossiers)
- **8 chemins vers le dossier temporaire de Claude Code**, devenus « <dossier temporaire> » : 1 dans prochaines-idees, 1 dans traces-du-28, 3 dans lecture-du-banc, 3 dans greffes.
- **2 noms de PC dans traces-du-28** (le-xeon et le-xeon), devenus « le-xeon ». Ce sont des noms d'exemple, pas le vrai nom : j'ai vérifié qu'aucun ne correspond au nom de ce PC.
- **3 adresses e-mail** : [adresse retirée] des lignes Co-Authored-By, 1 dans code-v4 et 2 dans sortie-reecrite, devenues « [adresse retirée] ».
- **1 nom propre de l'assistant du Ryzen**, dans traces-du-28/comptes-rendus.md, ligne 155. Le vérificateur l'avait écrit dans la liste de ce qu'il avait cherché (« ni <nom>, ni identifiant de PC… »). Il est remplacé par « l'assistant de Sacha sur le Ryzen ».

Une recherche à la main sur les huit dossiers ne trouve plus ce nom, ni clé ou jeton, ni nom de PC réel, ni AppData. Le seul autre fichier qui contient ce nom est ml/ecurie/agents/tmp-voltige/paroles-sacha.md, un fichier de travail, auquel je n'ai pas touché.

CE QUE JE N'AI PAS PU VÉRIFIER
- **L'envoi du Ryzen « échoué de 2 h à 13 h », faute de connexion à Internet.** Je n'en ai trouvé la source nulle part dans le dépôt. Les commits horaires de evolution-ryzen se suivent bien (génération 3 à 4 h, …, 16 à 14 h), mais on ne voit pas quand ils sont arrivés sur GitHub. C'est écrit « d'après la session principale ». « Identité vérifiée 3 fois » n'est pas repris.
- **« Ce qui attend »** (mise à jour n° 2, migration à sens unique, les trois questions à Sacha) est aussi marqué « d'après la session principale ».
- **L'heure de fin du banc (vers 10 h 45)** est prise au rédacteur de lecture-du-banc. L'intégrateur de code-v4 dit 10 h 44. Je n'ai pas relu jouer.log.
- **L'école.** Le compte rendu de traces-du-28 signale qu'un fichier déjà rangé (journal/comptes-rendus.md) nomme une école. Je n'y ai pas touché : c'est hors de mes huit dossiers, et le régénérer changerait un dossier déjà rangé.
- **Le dossier C:\c\Users existe**, vide, créé à 9 h 59 (le piège de Git Bash). Il n'est pas de moi : je ne l'ai pas supprimé.
- **Des fichiers modifiés par un autre travail**, que je n'ai pas touchés : ml/ecurie/portfolio/journal/LEXIQUE.md, journal/LISEZ-MOI.md et journal/2026-11-28_suite.md (non suivi).

Fichiers à relire avant le commit :
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\orchestration\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\outils\orchestration.js
- les huit dossiers ci-dessus, sous C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\orchestration\

## 2. journal, passation, impasses

*Rôle : rédacteur du journal : écrit la suite du 28/11, la passation et le registre des impasses. Phase : Ecrire.*

##### Ce que j'ai fait
J'ai écrit la suite du 28/11 dans un fichier à part, `2026-11-28_suite.md`, comme on l'avait fait pour le 25/11 avec `2026-11-25_suite.md`. Le chapitre du matin faisait déjà 2 365 mots et je n'y ai pas touché. Je n'ai rien commité et je n'ai lancé aucune course ni aucun test. Hors de `ml/ecurie/`, je me suis contenté de lire.

##### Fichiers modifiés
- **Créé** : `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-28_suite.md` (environ 4 100 mots). Il contient :
  - l'en-tête habituel (en une phrase, en une minute, la question du moment) ;
  - cinq sous-chapitres : les greffes ; le silence du Ryzen et sa mise à jour ; le lot « gènes v4 » ; l'impasse de la sortie préparée ; la fusion et la vague 1 ;
  - puis les rubriques fixes (ce qu'on a appris, les décisions, les chiffres, ce qu'on peut montrer, les sources).
  - Chaque sous-chapitre dit ce qu'on voulait savoir, ce qu'on a fait, ce qu'on a trouvé, ce qu'on a décidé et pourquoi, et ce qu'on ne sait pas.
- **Modifié** : `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\LISEZ-MOI.md`
  - la ligne des heures ;
  - § 1, point 9 : le Ryzen ;
  - § 2 : l'après-midi ajouté à la puce du 28/11 ;
  - § 3 : une ligne au registre, « La sortie préparée par les rayons du bord » ;
  - § 4 : deux messages de Sacha (12:07 et 12:17 UTC) ;
  - § 5 : trois lignes de chiffres ;
  - § 6 : la ligne du banc des gènes mise à jour (il est dans git depuis `46842ee77`), et trois lignes de plus (sortie-preparee, notes greffes et v4 avec le README du banc v2, vague v001) ;
  - § 7 : la ligne du nouveau chapitre.
- **Modifié** : `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\LEXIQUE.md`
  - huit mots nouveaux, rangés à leur place alphabétique : « Banc des gènes v2, vague, bras », « Carte tenue, course à map imposée », « Compteur de déclenchements », « Contrat (d'un lot) », « Greffe (de la sélection) », « « Net », « trop rare », « futilité », « plafond » », « Regard », « Sortie préparée » ;
  - l'entrée « Génome » complétée : v:4, 129 gènes.
- **Modifié** : `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\PASSATION.md` : une nouvelle partie en tête, « L'état au 28/11/2026 vers 15 h » (ce qui tourne, ce qui est poussé ou non, la mise à jour n° 2, les décisions, ce qui attend Sacha, la suite, le texte à coller). La partie du matin est gardée en dessous.
- **Modifié** : `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\ETAPES.md` : la ligne S du tableau, le titre « OÙ ON EN EST » (vers 15 h), et une nouvelle section « L'après-midi du 28/11/2026 » au-dessus de « La nuit du 27 au 28/11 ».
- **Pas moi** : `git diff` montre aussi des changements dans `ml/ecurie/portfolio/orchestration/LISEZ-MOI.md` et `ml/ecurie/portfolio/outils/orchestration.js`. Je n'y ai pas touché : une autre session y travaille sans doute.

##### La frise : pas régénérée
`frise.js` se refait sans jouer de course, mais elle ne dessine que les changements de méthode, un par jour. Les jalons de l'après-midi (greffes, lot v4, impasse, vague 1) n'en sont pas. Le virage du 28/11 lui-même avait été laissé hors de la frise exprès (LISEZ-MOI § 2). L'y ajouter demanderait de refaire l'axe, le titre et le texte de remplacement, ce qui dépasse la consigne. C'est réversible si la session principale le veut.

##### Tous les chiffres écrits, avec leur source
- **De 11 h à 15 h, heures des commits** (`git log`) : 46842ee77 à 11:02, 7f85efb38 à 12:16, 5e7f311aa à 13:05, d30db9519 à 14:46, 77083d123 à 14:59, 15c7f1cb3 à 15:01, ddca156d8 à 7:53 (11 agents Opus, d'après son message). Sur `origin/evolution-ryzen` : c3a61e821 (3:00, génération 1), 4eea1a540 (13:00, génération 15), 98db666ae (13:11), 9fcfbd2a0 (14:00).
- **« Une fois sur 33 environ »** : `ml/evolution/notes/greffes.md`, ligne 11.
- **Greffes** :
  - cinq essais, cycle de 6 générations : `git show 5e7f311aa:ml/evolution/config.json`, ligne 51 (la même sur origin/evolution-ryzen) ;
  - 3 générations et 56 courses, 6 générations sans course, 5 générations avec greffes, 70/70 : greffes.md, lignes 87, 100 à 104, 122, 130 ;
  - 71/71 : message de 77083d123 ;
  - 2 agents Opus : message de 5e7f311aa.
- **Ryzen, résumé de 14 h** (`git show origin/evolution-ryzen:ml/evolution/etat/resume.txt`) :
  - génération 17, époque 3c3d44e8bd9b (depuis la 16), 495 courses à l'heure (génération 16 : 352 courses en 43 min), 10 à la fois ;
  - validation de la génération 15 : +0,03 ± 0,56 sur 24 graines ;
  - mutations : 109 enfants sur 191, r 0,17, τ 0,45 [0,00 ; 0,77].
  - Le 495 est celui de resume.txt ; `generations.jsonl` dit `debit_h` 494,8.
- **Ryzen, récit** (`histoire.md`, même branche) : 3 tentatives de sacre, 0 réussie ; fonte moyenne de 1,58 point de note ; +1,25 à l'entraînement pour la génération 15 ; « Contrôle d'identité réussi » à la génération 16 ; greffe `2e9b5cc4` (raccCartes_ville = 0) à la génération 17.
- **Ryzen, population** (`population.json`) : regle6 2 ; vivant 2e9b5cc4c924, né à la génération 17, greffe {raccCartes_ville:0} ; 26 vivants, tous en v:3.
- **Ryzen, compte rendu collé par Sacha** (transcript de la session principale, 12:17 UTC) : relance à 13:11, `29ae5fffc2b9 -> 3c3d44e8bd9b`, IDENTIQUE ×3 (910000, 910037, 910074), l'assistant qui guettait une greffe bordOn.
- **Message de Sacha à 12:07 UTC** : même transcript.
- **Rang de la première greffe** : rang = (17 − 1) mod 6 = 4, soit le cinquième essai, calculé avec la règle de greffes.md, lignes 46 à 49.
- **Lot v4** :
  - 129 gènes et 8 nouveaux : genes-v4.md § 2.1, lignes 38 à 63 ;
  - chancePalierMin à 12 : idem, ligne 47 ;
  - 25 compteurs : genes-v4.md, ligne 479 ;
  - identifiants c0025 19e3767cc346 et c0101 f70ddcb5a565, 26 vivants : LIVRAISON-GENES-V4.md, lignes 18 et 19 ;
  - 24 suites, identité 9/9, evoluer.test 78 contrôles (2 720 s), courses.test 9/9, 26/26 en v:4, 18 courses : message de 7f85efb38 et LIVRAISON lignes 39 à 62 et 92 ;
  - 4 auteurs, 3 relecteurs, 1 intégrateur : message de 7f85efb38 ;
  - 0 déclenchement en 13 courses : LIVRAISON, ligne 267 ;
  - rienOn 2 fois sur 4 courses, loiFidele.suit 39 à 58 : LIVRAISON, lignes 101 et 104.
- **Banc v2** :
  - 1 à 5 bras, regards à 24 puis toutes les 24 jusqu'à 192, moins de 5 %, 4,2 % sur 2 000 vagues : banc/README.md, lignes 10 à 14 ;
  - environ 29 h pour 5 bras au plafond, 2 à la fois : LIVRAISON, ligne 123.
- **Sortie préparée** (`ml/ecurie/etude/sortie-preparee/LISEZ-MOI.md`) :
  - 40 courses de 180 s, 8 graines par map : § 3, ligne 35 ;
  - 180 décollages subis distincts et 24 morts (au lieu de 185 et 27), 3 courses comptées deux fois : lignes 173 à 175 ;
  - R1 à 0 : ligne 203 ;
  - aucune issue vue sur 24 : ligne 223 ;
  - bord annoncé 0,28 s avant, main 0,2 s : ligne 224 ;
  - « plane » contre le décor dans 57 vols posés, aucun des 17 mortels sauvé : ligne 212 ;
  - « choc » sans bascule juste 15 fois sur 16 : ligne 191 ;
  - 0 décollage nitro allumée sur 253 : ligne 208 ;
  - joueurs 0,625 : banc des gènes (dans 2026-11-28.md), et LIVRAISON ligne 189 qui écrit 0,625 ;
  - dernier recours du relecteur à 0,85 décollage par course : ligne 252 ;
  - R5 : 115 décollages sur 180, 5,2 par course, 17 des 24 mortels : `sorties/relecture.txt`, ligne 109 (5,17 par 180 s, arrondi à 5,2 comme dans l'étude, ligne 304) ;
  - 13 morts choc/choc/choc dès la première annonce : ligne 226 ;
  - raccourcis voulus en ville, 5 morts sur 22 contre 1 sur 45 ailleurs : ligne 53 ;
  - morts 0,26 s (grotte) et 0,24 s (canyon) après le décollage : ligne 205 ;
  - 13 vraies courses : § 1, ligne 10.
- **Règle réécrite** :
  - 510 300 décisions identiques, 126 pilotes, 4 050 vues : LIVRAISON, lignes 173 à 177 ;
  - 8 courses de 120 s, agit dans 7 : LIVRAISON, ligne 211 ;
  - grotte 0 → 0,50, jade 0,17 → 0,625 : LIVRAISON, ligne 193. Le message du commit d30db9519 écrit 0,63 ; j'ai gardé 0,625.
  - les 2 vols nitro qui finissent mal : LIVRAISON, lignes 194 à 196.
- **Fusion** : 10 ensembles, cycle de 11, cinq ensembles v4 : `ml/evolution/config.json`, ligne 51, et message de 77083d123.
- **Vague 1** : 5 bras, graines 4000000 à 4007067, regards 24 à 192, alpha 0,05, alphaBras 0,01, époque ad6cc000299a, garde de 0,75 : `plan.json` et `vague.json`.
- **Crédits d'API** : environ 141 € au matin, `b1ff8af89` (200 − 58,53 = 141,47).

##### Ce que je n'ai pas pu vérifier
- **La cause du silence du Ryzen** (« sa connexion à Internet a coupé ») n'est ni dans git ni dans les messages de Sacha : elle ne vient que de la consigne. Je l'ai écrite comme « d'après la session principale (non vérifié dans git) ». Ce qui est vérifié : les comptes rendus horaires, datés de 3 h à 13 h, sont tous arrivés sur la branche, donc la sélection n'a pas arrêté.
- **« Identité vérifiée 3 fois »** ne vient que du compte rendu collé par Sacha ; `sortie.log` n'est pas dans git. Le récit envoyé dit seulement « Contrôle d'identité réussi ».
- **Le message de Sacha de 12:07 UTC** : je l'ai cité en orthographe rectifiée, selon la règle du journal (LISEZ-MOI § 4), et pas tel quel. Sa phrase brute est : « tu utilise plus de opus de sonnet haiku que fable on est a 34% contre 22, tu peux utiliser plus de fable si tu as besoin, c'est pas forcer fait le seulement si y'a des tache que fable peut vraiment faire mieu ». Le sens de « 34 % contre 22 » n'est pas expliqué ; je ne l'ai pas interprété.
- **L'état poussé** : `origin/bots-ecurie` est à 5e7f311aa d'après la référence locale, lue sans `git fetch`. Les 4 commits 7f85efb38, d30db9519, 77083d123 et 15c7f1cb3 apparaissent comme non poussés.
- **Ce que je n'ai pas lu** : ni l'état des tests longs ni les résultats de la vague 1. J'ai écrit « en cours » et « aucun résultat ». Je ne sais pas non plus dans quel dossier ni avec combien de courses à la fois la vague tourne.
- **Les relectures des sous-lots** : je n'ai pas lu `genes-v4-lot-a/b/c.md` en détail ; je me suis fondé sur le contrat, la livraison et les messages de commit.

## 3. relecture adverse et commit

*Rôle : relecteur : cherche les erreurs et les détails privés des deux autres, corrige, fait le commit. Phase : Relire.*

Commit : 332a12a67 sur bots-ecurie. Il contient seulement ml/ecurie/ et n'est pas poussé. ml/evolution/banc/vagues/INDEX.md et ml/bot/results/note-essai-main-allege-t120-parties.json restent non suivis, je n'y ai pas touché. Je n'ai lancé aucune course ni aucun test.

DÉFAUTS TROUVÉS ET CORRIGÉS
1. Vie privée (le plus grave). ml/ecurie/portfolio/outils/orchestration.js gardait l'empreinte SHA-256 du nom de l'assistant du Ryzen. Un prénom se retrouve en quelques secondes à partir de son empreinte, avec une liste de prénoms. Le LISEZ-MOI disait au contraire qu'« on ne peut pas le relire dedans ».
   - L'empreinte est retirée.
   - L'outil lit maintenant le nom dans ml/ecurie/agents/tmp-portfolio/mots-caches.json. Ce fichier est local et ignoré par git (motif tmp-* du .gitignore, vérifié par git check-ignore), et il n'est pas dans le commit.
   - Sans ce fichier, l'outil refuse d'écrire.
   - Je l'ai relancé sur les seize travaux, vers le scratchpad : les seize dossiers sortent identiques au caractère près, fins de ligne mises à part. Le nom est toujours masqué une fois, dans traces-du-28.
   - L'en-tête de l'outil et le paragraphe du LISEZ-MOI des orchestrations sont réécrits.
2. Consigne de Sacha (LISEZ-MOI des orchestrations). Le texte interprétait « 34 % contre 22 » comme l'usage de l'abonnement par modèle.
   - La phrase est maintenant citée telle quelle, en entier, et le texte dit que ce que mesurent ces deux chiffres n'est pas dit.
   - J'ai ajouté que les huit équipes avaient toutes démarré avant ce message : la dernière à 13 h 03 heure de Paris, le message à 13 h 07.
3. « Une greffe = un seul interrupteur allumé » était faux : la première greffe éteint les raccourcis de la ville (raccCartes_ville = 0), et un ensemble peut forcer plusieurs gènes. Corrigé dans 2026-11-28_suite.md (« En une minute »), dans journal/LISEZ-MOI.md § 1 point 9 et dans l'entrée « Greffe » du LEXIQUE.
4. Entrée « Compteur de déclenchements » du LEXIQUE. « A vraiment changé une décision » devient « a vraiment agi » : loiFidele.desaccord compte un désaccord, pas un ordre changé (genes-v4.md § 4).
5. journal/LISEZ-MOI.md § 6. La ligne de la branche origin/evolution-ryzen était périmée (« dernier envoi à 2 h, 71e7c7c2c »). Elle dit maintenant : rien n'est arrivé après 2 h jusqu'à l'envoi de 14 h (9fcfbd2a0), et elle nomme population.json et histoire.md, envoyés depuis 1 h. J'ai aussi ajouté 2026-11-28_suite.md aux sources des dix lignes.
6. PASSATION.md.
   - Le « code 4 » de la vague était attribué à banc/README.md, qui ne le dit pas. La source est maintenant banc.js et le tableau des codes de sortie de genes-v4.md.
   - « Pas encore commités » devient « commités ensemble, non poussés », avec les orchestrations.
7. LISEZ-MOI des orchestrations : « génération 0 (2 h) » devient « (1 h et 2 h) ». Il y a bien deux commits de génération 0 sur evolution-ryzen, à 1 h et à 2 h.

VÉRIFIÉ À LA SOURCE, SANS ÉCART
- Les heures des commits 46842ee77, 7f85efb38, 5e7f311aa, d30db9519, 77083d123, 15c7f1cb3, ddca156d8, 98db666ae et 9fcfbd2a0.
- resume.txt de 14 h : génération 17, époque 3c3d44e8bd9b, 495 courses à l'heure, +0,03 ± 0,56, 109 sur 191, r 0,17, τ 0,45 [0,00 ; 0,77].
- population.json : regle6 2, 26 vivants en v:3, la greffe 2e9b5cc4c924 née à la génération 17 avec {raccCartes_ville:0}.
- histoire.md : 3 tentatives, la fonte de 1,58, le +1,25, « Contrôle d'identité réussi ».
- Le rang de la première greffe (16 mod 6 = 4) et le cycle des greffes, dans config.json à 5e7f311aa et aujourd'hui (5 puis 10 ensembles).
- Les messages de Sacha de 12:07 et 12:17 UTC, dans la conversation de la session principale : IDENTIQUE ×3 sur les graines 910000, 910037 et 910074, 29ae5fffc2b9 → 3c3d44e8bd9b, relance à 13:11.
- L'étude de la sortie préparée : 40 courses, 180 et 24, 13 morts sur 24 « choc partout », 0,28 s, 57 vols, 15 sur 16, 0 sur 253, 0,85, R5 115 / 5,17 / 17, 0,26 et 0,24 s, 5 sur 22 contre 1 sur 45.
- LIVRAISON-GENES-V4.md : 0 en 13 courses, rienOn 2 sur 4, 39 à 58, 510 300 / 126 / 4 050, agit dans 7 sur 8, grotte 0 → 0,50 et jade 0,17 → 0,625, environ 29 h.
- genes-v4.md : 129 gènes, 8 nouveaux, chancePalierMin à 12, 25 noms.
- banc/README.md : 4,2 % sur 2 000 vagues.
- vague.json et plan.json : 5 bras, graines 4000000 à 4007067, regards 24 à 192, alpha 0,05 et 0,01 par bras, époque ad6cc000299a, garde de 0,75.
- Les 141 € (PASSATION du matin, b1ff8af89).
- Les fichiers cités sont dans git (git ls-files).
- Les huit bilans recalculés : 37 agents, 8 942 157 jetons, 2 015 appels ; total 121 agents, 25 435 878 jetons, 6 213 appels ; tous en claude-opus-5-5.
- Les comptes du comptes-rendus de prochaines-idees : 36 défauts, dont 4 bloquants, 22 sérieux et 10 mineurs. Le 37/1/14/22 de contrat-v4, le 4,67 % et le 68 → 70.
- Vie privée : aucun nom Windows de ce PC (cherché par COMPUTERNAME, sans l'écrire), aucun l'assistant de Sacha sur le Ryzen, sk-ant, AppData, adresse e-mail réelle, partage de connexion ou téléphone. Aucun nom d'école ajouté.
- Aucun résultat de la vague 1 ni des tests longs n'est écrit : ils sont tous « en cours ».

NON VÉRIFIÉ
- La cause du silence du Ryzen (« sa connexion à Internet a coupé ») ne vient que de la session principale. Les textes la donnent comme telle, ou « d'après la session principale ».
- « 3 des 37 comptes rendus en anglais » n'est pas recompté.
- Les heures de début et de fin des orchestrations peuvent différer d'une minute de mon calcul, par arrondi (par exemple 12 h 19 contre 12 h 18 et 13 h 02 contre 13 h 01).
- Le détail des relectures dans les sections 9 à 16 n'est pas relu ligne par ligne, hors les chiffres cités plus haut.
- La citation de Sacha dans le journal et dans PASSATION reste en orthographe rectifiée, selon la règle écrite au § 4 du journal (« orthographe rectifiée, jamais leur sens »). Le LISEZ-MOI des orchestrations la cite brute.
- Le dossier C:\c\Users\… n'est pas supprimé. Le fichier déjà rangé journal/comptes-rendus.md, qui nomme une école, n'est pas touché : la décision revient à Sacha, comme le dit PASSATION.
