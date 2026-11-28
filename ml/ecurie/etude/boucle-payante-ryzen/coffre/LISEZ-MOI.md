LE RESULTAT (28/11/2026, 3 h, la session principale : la mesure est finie, 40 graines sur 40, 160 courses, aucune ratee)

Sur les 40 courses du coffre, que personne n'avait jamais utilisees pour choisir un pilote, les champions de la boucle payante ne vont pas plus loin que le pilote de depart :
- c0064 contre c0025 : +0,03 palier en moyenne, intervalle a 95 % [-1,18 ; +1,38] ; 12 graines mieux, 19 pareil, 9 moins bien.
- c0101 contre c0025 : +0,03 palier [-1,18 ; +1,23] ; 13 mieux, 19 pareil, 8 moins bien.
- c0026 contre c0025 : -0,63 palier [-1,48 ; +0,20].
- c0101 contre c0064 : 0,00 [-0,42 ; +0,45] ; 34 courses sur 40 sont exactement les memes.
Le « +2 paliers » vu sur les 20 graines de validation de la boucle ne se retrouve donc pas : ces 20 graines avaient servi a chaque sacre, et le champion etait celui que le hasard y favorisait (la « malediction du gagnant »).
Ce qui reste peut-etre : une conduite un peu plus proche des joueurs (l'ecart E de la selection : 0,84 pour c0064 et 0,85 pour c0101 contre 0,91 pour c0025, difference -0,07 avec une erreur-type de 0,06 ; l'ecart classique : 1,69 contre 1,80). C'est dans le meme sens que sur la validation, mais trop petit pour etre sur avec 40 courses. La note de la selection (F = palier - 4 x E) : 2,79 et 2,75 contre 2,48, difference +0,3 avec une erreur-type de 0,7 : pas de sacre.
La decision : le temoin de la selection reste c0025. Les quatre idees de la boucle payante restent dans le genome, eteintes a la naissance : la selection les essaiera une par une, sur bien plus de courses.
La lecon : 20 graines ne suffisent pas a reconnaitre un progres d'un ou deux paliers, et des graines de validation qui resservent ne valident plus rien. Le tableau complet est dans sorties/resume.txt.

----- ce qui suit est le texte ecrit pendant la mesure (4 puis 10 graines), garde pour l'histoire -----

En une minute

On voulait savoir si les derniers champions de la boucle payante (c0064, c0101) conduisent vraiment mieux que le pilote de depart (c0025), sur 40 courses que personne n'a jamais utilisees pour choisir un pilote (le « coffre » de la selection). LA MESURE N'EST PAS FINIE : seules 4 graines sur 40 ont ete jouees par les quatre pilotes avant l'arret de l'agent. Sur ces 4 graines on ne peut rien conclure. (28/11, le relecteur : 6 graines de plus, jouees a part, voir « Relecture » en bas : sur les 10 premieres graines du coffre, c0064 et c0101 ne font PAS mieux que c0025, ils font plutot moins bien ; rien n'est encore tranche.)

Ce qui est sur des maintenant :
- Le Xeon rejoue exactement les memes courses que le Ryzen (4 courses de controle, empreintes identiques a celles de ml/labo/journal/validations.jsonl).
- Sur les 20 graines de validation de la boucle, c0064 et c0101 jouent EXACTEMENT les memes 20 courses (memes empreintes, pas seulement les memes paliers). Sur les 4 premieres graines du coffre aussi. ~~Les changements de c0072, c0087 et c0101 ne se declenchent presque jamais.~~ (28/11, le relecteur : FAUX sur le coffre. Sur les 10 premieres graines, c0101 et c0064 jouent 2 courses differentes sur 10 : 990148, 12 contre 13 ; 990333, 8 contre 4. Sur la validation, c0072 et c0087 jouent aussi les memes 20 courses que c0064.)
- Sur la validation de la boucle (20 graines), c0064 fait mieux que c0025 : +2,0 paliers en moyenne, intervalle a 95 % [+0,8 ; +3,4], 10 graines mieux, 8 pareil, 2 moins bien. c0026 contre c0025 : +0,9 [-0,1 ; +2,1], pas net. Attention : ces 20 graines ont servi a sacrer chacun de ces champions, la mesure est donc optimiste.

Pour finir la mesure (25 a 45 minutes a 4 courses a la fois : les graines suivantes ont des courses plus longues, jusqu'a 284 s de jeu) :

    node ml/ecurie/etude/boucle-payante-ryzen/coffre/jouer.js --travailleurs 4
    node ml/ecurie/etude/boucle-payante-ryzen/coffre/analyser.js

jouer.js reprend ou il s'est arrete (les courses deja faites viennent du cache de ./etat) (28/11, le relecteur : SEULEMENT si ml/evolution/modele.js et enfant.js n'ont pas change. Le 28/11 au soir le lot « portage » a retouche modele.js : l'epoque est passee de fd590bd3db3d a 66f66d2ae1c2, les 20 courses deja faites seront REJOUEES ; jouer.js le dit maintenant au lancement. analyser.js prend l'epoque du jour si elle a des courses, sinon la plus fournie, ou --epoque <id>.) analyser.js ecrit sorties/resultats.json, sorties/resume.txt et sorties/courses-coffre.jsonl (une ligne par course : graine, palier, survie, cause, mesures de ressemblance, empreintes).

Les fichiers
- jouer.js : les 4 pilotes x 40 graines du coffre (990000, pas 37), tmax 900, regime allege, par l'ordonnanceur de ml/evolution/courses.js, etat dans ./etat ; plus 4 courses de controle sur les graines 950000 et 950037.
- analyser.js : la note de la selection (ml/evolution/note.js : noter, comparer ; F = â - 4 E), les differences appariees graine par graine avec bootstrap (4000 tirages, hasard de graines.rngDe), le test du signe, les courses identiques, la meme chose sur validations.jsonl.
- jouer.log : le journal du lancement.

Relecture (2026-11-28, le relecteur)

En une phrase : le gain de c0064 / c0101 sur c0025 vu en validation (+2 paliers) ne se retrouve PAS sur les 10 premieres graines du coffre (-1,2 palier pour c0064, IC 95 % [-3,2 ; +0,4]) ; le verdict provisoire « le temoin doit etre c0064 » n'est pas soutenu par les donnees, et c0101 n'est pas une copie de c0064 hors de la validation.

Ce qui a ete recontrole, et tient :
- Les chiffres de la validation (validations.jsonl) refaits par un script a part (bootstrap et test du signe maison) : c0064 - c0025 +2,00 [+0,75 ; +3,40], 10/8/2, p = 0,039 ; c0026 - c0025 +0,90 ; c0064 - c0026 +1,10 [-0,30 ; +2,55]. Memes valeurs.
- L'observation de Fable : c0064, c0072, c0087 et c0101 jouent les MEMES 20 courses de validation (20/20 empreintes, les quatre ; l'auteur n'avait compare que c0064 et c0101).
- La reproductibilite, par un second chemin : les 12 courses de l'auteur sur 990000 a 990111 (c0025, c0064, c0101) rejouees par ml/bot/noter.js (sans l'ordonnanceur de ml/evolution, apres la retouche de modele.js) : 12/12 empreintes identiques.
- Les graines du coffre (990000 + 37 j) n'apparaissent dans aucun journal de la boucle (cerveaux.jsonl : 910000 a 910703 ; validations.jsonl : 950000 a 950703).

Ce qui etait faux, et est corrige :
1. analyser.js ne gardait que les courses de l'epoque du jour. modele.js ayant change (lot « portage », non commite), il n'en gardait plus AUCUNE, reecrivait sorties/resultats.json et sorties/courses-coffre.jsonl VIDES, puis plantait. Corrige (choix de l'epoque, --epoque, rien n'est ecrit sans graine commune) ; rejoue sur les donnees de l'auteur : resume.txt et courses-coffre.jsonl identiques a avant (seule la ligne d'en-tete change).
2. « jouer.js reprend par le cache » : faux des que modele.js ou enfant.js changent. jouer.js le signale maintenant ; ce texte le dit.
3. « Les changements de c0072, c0087, c0101 ne se declenchent presque jamais » : faux sur le coffre (2 courses differentes sur 10).

Les 6 graines de plus (990148 a 990333, jouees par le relecteur avec noter.js, 2 a la fois ; fichiers dans relecture/, recalcul : node ml/ecurie/etude/boucle-payante-ryzen/coffre/relecture/verifier.js) :

    graine  c0025  c0064  c0101   (palier)
    990000    6      7      7
    990037    3      3      3
    990074    6      6      6
    990111    5      4      4
    990148   11     13     12
    990185    2      2      2
    990222   12      3      3
    990259    9      5      5
    990296    3      3      3
    990333    5      4      8
    moyenne 6,2    5,0    5,3

    c0064 - c0025 : -1,20 palier, IC 95 % [-3,20 ; +0,40], mieux/pareil/moins 2/4/4 ; survie -15 s [-62 ; +23]
    c0101 - c0025 : -0,90 palier, IC 95 % [-3,10 ; +0,80], 3/4/3
    c0101 - c0064 : +0,30 palier, IC 95 % [-0,30 ; +1,20], 1/8/1 ; courses identiques 8/10

Ce que cela veut dire : sur 10 graines jamais vues, on ne voit aucun gain des champions sur c0025, plutot une perte (2 grosses : 990222, 12 contre 3 ; 990259, 9 contre 5). 10 graines ne tranchent pas (l'intervalle va de -3 a +0,4), mais c'est ce qu'annonce la malediction du gagnant : les +2 paliers de la validation ont ete obtenus en choisissant, sur ces memes 20 graines, le meilleur de dizaines de candidats.

Ce qui reste :
- Finir le coffre (40 graines x 4 pilotes) puis analyser.js. Jusque-la, le verdict honnete est : « le temoin reste c0025 ; rien ne montre que c0064 ou c0101 fassent mieux sur des graines jamais vues ». Si le coffre complet donne un gain net, alors c0101 et c0064 seront a departager sur le coffre (ils different sur 2 graines sur 10), pas sur la validation.
- E et F de la selection : non verifies par le relecteur (il faut au moins 5 parties de plus de 60 s par pilote ; noter.js ne rend pas les mesures de ressemblance).
- Prendre un autre temoin que c0025 demande aussi que le genome sache l'ecrire au bit pres (le lot « portage », en cours, non commite : genome.js, modele.js) et un controle d'identite refait pour ce pilote : rien de cela n'est fait ici.
- Les 6 graines jouees par le relecteur font partie du coffre : elles n'ont servi a choisir personne, mais personne ne doit choisir un pilote sur elles.
- Note : sur le coffre, beaucoup de courses courtes (moins de 60 s) n'ont pas de mesures de ressemblance (mesures null) ; E ne compte que les autres.
