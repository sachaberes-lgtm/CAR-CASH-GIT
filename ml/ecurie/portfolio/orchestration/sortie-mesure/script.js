export const meta = {
  name: 'sortie-preparee-mesure',
  description: 'Mesurer les decollages au bord sur les maps a decor pour reecrire la regle sortieOn (muette) et regler rienOn : mesure puis relecture adverse',
  phases: [
    { title: 'Mesure', detail: 'un pilote de diagnostic, des courses a carte tenue, le tableau des decollages' },
    { title: 'Relecture', detail: 'recalcul independant et proposition de regle' },
  ],
}
const COMMUN = `
Tu travailles dans la copie C:\\Users\\sacha\\code\\CASH-CAR-genes-v4 (branche genes-v4, commit 7f85efb38). Commence chaque commande Bash par: cd /c/Users/sacha/code/CASH-CAR-genes-v4
ATTENTION aux chemins : avec node sous Git Bash, n'ecris jamais un chemin /c/... dans un argument lu par node (il devient C:\\c\\...) ; utilise des chemins relatifs ou C:/Users/...
LE CONTEXTE. ml/evolution/ fabrique des pilotes de jeu a partir d'un genome (genome.js, modele.js) ; ml/reel joue de vraies courses sans ecran. Le lot « genes v4 » vient d'etre code (lis ml/evolution/notes/LIVRAISON-GENES-V4.md, puis dans ml/evolution/notes/genes-v4.md les parties 3.1 sortieOn, 3.2 rienOn, 4 compteurs, et la note notes/genes-v4-lot-a.md avec ses relectures). L'idee d'origine est dans la branche bots-ecurie : C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie\\ml\\ecurie\\etude\\prochaines-idees\\LISEZ-MOI.md (a lire seulement, ne rien y ecrire) : le pilote c0025 meurt presque toujours en vol apres etre sorti par le bord de la route ; la grotte et la ville tuent le plus.
LE PROBLEME. La regle sortieOn du contrat (au bord, sur une map a decor : si le rayon « rien » finit en choc ET « versRoute » finit en choc ET « plane » promet une pose propre, garder la nitro et partir en « plane ») ne s'est declenchee dans AUCUNE des 13 vraies courses jouees. Un diagnostic sur 117 vues au bord dit : quand versRoute meurt, plane meurt aussi. Le gene est muet. De meme rienOn (lacher le volant en vol quand « rien » promet une pose plus droite d'au moins rienEcart = 0,2 rad) ne part que 2 fois sur 58 vues ou « rien » pose proprement. Avant de reecrire ces regles, il faut MESURER ce que les yeux voient vraiment aux decollages et ce qui arrive ensuite.
REGLES DURES.
- Ne modifie AUCUN fichier suivi par git de cette copie (ni modele.js, ni genome.js, ni enfant.js, ni rien d'autre) : tu ecris seulement dans un dossier neuf ml/ecurie/etude/sortie-preparee/ (outils, pilotes de diagnostic, lignes de course, sorties, LISEZ-MOI.md). Un pilote de diagnostic = le texte du pilote ne du genome c0025 (v:4, tout a la naissance) plus des lignes qui ENREGISTRENT sans changer aucun ordre ; prouve-le : meme empreinte de course que c0025 sans diagnostic sur au moins 2 graines.
- N'ecris rien dans C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie ni dans ml/evolution/etat.
- Le processeur est partage : au plus 2 courses a la fois. Courses de 180 s au plus (tmax). Graines : prends-les dans la plage de l'essai du banc (numero 0 : 4 000 000 + 37·(1000·(0−1)+i) est negatif, donc lis dans banc/plan.js ou dans la note quelle plage l'essai utilise, par exemple 3963000 + 37 i) et dis laquelle ; jamais une graine des plages reservees (lis ml/evolution/notes/regles.md).
- Pas de git commit, pas de push. Francais, commentaires /* ... */, jamais de // en fin de ligne. Pas de nom de machine dans un fichier.
`
phase('Mesure')
const mesure = await agent(COMMUN + `
TA TACHE (mesureur).
1. Lis dans modele.js comment le pilote lit les rayons au bord (v.sorties.bord.rayons, tn = la tenue de route, decor, lache, jauge, m.sortie, les FACONS, la bascule en vol, les rayons retour<i>, le radar de vol) et dans ml/bot/yeux.js ce que chaque rayon rend (choc, pose, pose propre, libre, temps, axe…). Ecris en dix lignes, dans le LISEZ-MOI de l'etude, ce que le pilote sait a l'instant de quitter la route.
2. Ecris l'outil de mesure (ml/ecurie/etude/sortie-preparee/mesurer.js) qui joue c0025 avec diagnostic sur des courses a carte TENUE (option du lot b : cherche « tenue » dans enfant.js / courses.js / notes/genes-v4-lot-b.md) : grotte, ville, jade, canyon, 8 graines chacune, tmax 180 (32 courses, 2 a la fois), plus 8 courses sans carte imposee pour comparer. Pour CHAQUE decollage (passage du sol au vol), enregistre : la carte, le temps, la vitesse, la jauge, la nitro, si c'est une sortie voulue (raccourci) ou subie par le bord, le temps avant le bord vu aux dernieres vues au sol (tn.t), le resultat de CHAQUE rayon du bord a la derniere vue au sol ou il existe (et a 0,3 s, 0,7 s, 1,2 s avant le bord si disponible), la facon prise au decollage, les bascules en vol, les declenchements de secours possibles, et l'ISSUE du vol : pose (propre ou non, a quel temps), ou mort (cause, temps apres le decollage).
3. Sors les tableaux (sorties/decollages.txt et .json, rejouables sans course a partir des lignes gardees) :
   a. par carte : nombre de decollages subis par le bord, part qui finit en mort, causes ;
   b. la fiabilite des yeux : quand le pilote a suivi une facon que le rayon annoncait « pose propre », combien de fois a-t-il pose ? Et quand le rayon annoncait « choc » ?
   c. pour les decollages MORTELS : a la derniere vue au sol, quels rayons annoncaient une pose (propre ou non) ? La liste complete des combinaisons (rien / versRoute / plane / les autres) avec leurs comptes. Y avait-il une issue annoncee que le pilote n'a pas prise ?
   d. pour les decollages NON mortels : combien une regle candidate aurait-elle changes (le risque) ?
   e. des regles candidates comptees sur ces donnees, au moins : (R1) celle du contrat ; (R2) « plane pose propre et versRoute ne pose pas propre » ; (R3) « plane pose (propre ou non) et la facon par defaut finit en choc » ; (R4) « le meilleur rayon du bord, par ordre pose propre > pose > libre > choc, est pris s'il bat la facon par defaut » ; (R5) la nitro seule : garder la nitro au decollage sans changer de facon (comme bordOn sur les maps sans decor), puisque le banc des genes montre que la nitro au decollage (15 % des vols chez le pilote, 63 % chez les joueurs) est la seconde source d'ecart aux joueurs. Pour chacune : sur combien de decollages elle se declenche (par course de 180 s et par carte), combien de mortels elle toucherait, combien de non mortels.
   f. pour rienOn : en vol, sur les vues ou « rien » promet une pose propre, la distribution de l'ecart d'axe avec la facon tenue (quantiles), et combien de vues par course passeraient pour rienEcart = 0,02 / 0,05 / 0,1 / 0,2 ; dans quel sens va l'ecart (rien plus droit ou plus tordu).
   g. pour le compteur loiFidele.suit : il compte presque chaque vue en « versRoute » parce que les yeux arrondissent leur commande a 0,01 ; mesure la distribution de la difference de commande et propose le seuil qui ne compterait que les vraies differences.
4. Ecris le LISEZ-MOI.md de l'etude (pour un jury qui ne code pas : la question, la mesure, les tableaux courts, ce qu'on peut conclure et ce qu'on ne peut pas). Ne propose pas encore de code.
Rends un compte rendu factuel avec les chiffres cles et les fichiers.`, { label: 'mesureur', phase: 'Mesure', model: 'opus' })

phase('Relecture')
const relu = await agent(COMMUN + `
TA TACHE (relecteur adverse, puis proposition). Un mesureur a ecrit ml/ecurie/etude/sortie-preparee/ (outil, lignes, tableaux). Son compte rendu :
<<<
${mesure}
>>>
Par defaut, une affirmation non reverifiee est fausse.
1. Verifie que le pilote de diagnostic ne change aucun ordre (rejoue toi-meme une graine avec et sans : memes empreintes). Recalcule par ton propre script, a partir des lignes gardees, les tableaux b, c et e. Dis ce qui tient et ce qui tombe.
2. Cherche les biais : un decollage « subi par le bord » est-il bien identifie (ne pas compter les tremplins, les rebonds, les raccourcis voulus) ? La derniere vue au sol est-elle a un temps comparable ? Les vols tres courts (une bosse) faussent-ils la fiabilite ? Les morts tardives (10 s apres le decollage, apres une pose) sont-elles attribuees au bon decollage ?
3. A partir des chiffres VERIFIES, propose UNE regle sortieOn reecrite (et, si les chiffres le soutiennent, une valeur de naissance pour rienEcart et un seuil pour le compteur loiFidele.suit), en disant : son texte exact en une phrase puis en pseudo-code avec les noms de variables de modele.js ; sur ces donnees, combien de decollages mortels elle toucherait et combien de non mortels (le risque) ; a quelle frequence elle se declencherait par course ; pourquoi elle n'est pas muette ; ce qu'on ne sait pas (une regle qui change un decollage mortel ne le sauve pas forcement : seul le banc le dira). Si les chiffres disent qu'AUCUNE regle fondee sur les rayons ne peut aider (les yeux ne voient aucune issue aux decollages mortels), dis-le nettement : c'est alors une impasse a ecrire, et la bonne proposition est de retirer l'ambition de la regle (par exemple n'en garder que la nitro au decollage) ou de laisser le gene muet.
Complete le LISEZ-MOI.md de l'etude avec une partie « Relecture » (tes chiffres, les corrections). Rends : confirme / refuse / la proposition chiffree / les fichiers a enregistrer.`, { label: 'relecteur', phase: 'Relecture', model: 'opus' })
return { mesure, relu }
