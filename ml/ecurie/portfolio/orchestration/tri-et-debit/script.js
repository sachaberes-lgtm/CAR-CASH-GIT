export const meta = {
  name: 'tri-des-courses-et-critere-de-debit',
  description: 'Deux travaux en parallele : (1) le test B de l echelle (une course de c0025 qui meurt tot passe-t-elle pour une partie de joueur ? critere ecrit avant, 1 course a la fois) ; (2) un critere de debit de pieces pour le banc des genes v2, sur une branche a part. Chacun relu par un adversaire.',
  phases: [
    { title: 'Test B', detail: 'mesureur puis relecteur : le tri des courses passe au discerneur' },
    { title: 'Critere de debit', detail: 'auteur puis relecteur, dans la copie banc-debit' },
  ],
}

const REGLES = `
REGLES DURES
- Une vague du banc tourne sur ce PC (4 courses a la fois) dans C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie : dans CET arbre, ne modifie RIEN dans ml/evolution/, ml/bot/, ml/reel/, code/, VERSION PRINCIPALE/ (la vague compare le code a son plan), ne touche pas a ml/evolution/banc/etat ni a ml/evolution/banc/vagues, ne cree jamais de fichier STOP.
- Piege Git Bash : jamais de chemin /c/… passe a node ; chemins relatifs au depot ou C:/Users/….
- Depot public : aucun nom de machine, adresse ou cle dans un fichier. Les PC s'appellent « le Xeon » et « le Ryzen ».
- Chaque chiffre a sa source et son effectif. « On ne sait pas » est une reponse.
`

const CTX_B = `
CONTEXTE (depot C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie, branche bots-ecurie). Lis d'abord ml/ecurie/etude/echelle-de-bots/LISEZ-MOI.md (en entier ; § 6.3 « la voie libre », § 7.5, § 11 la decision) et ml/bot/discerner.js (l'en-tete : comment le juge marche, ce que vaut son verdict, comment produire des parties de bot avec noter.js --parties). Le but de Sacha : des bots de chaque niveau qu'on ne distingue pas d'un joueur. L'idee a tester (« le tri ») : chez les joueurs, une partie faible est une partie qui meurt tot ; donc une course du pilote c0025 qui finit au palier k pourrait servir d'adversaire de niveau k, sans fabriquer un autre pilote.
${REGLES}
- Les courses : UNE SEULE a la fois (le PC est charge), jamais plus. Tout ce que tu ecris va dans ml/ecurie/etude/echelle-de-bots/tri/ (outils, sorties, parties). Ne committe rien.
`

const CTX_D = `
CONTEXTE : tu travailles dans la COPIE C:\\Users\\sacha\\code\\CASH-CAR-genes-v4 (branche banc-debit, creee depuis bots-ecurie ; ne touche a aucun autre arbre). Lis d'abord ml/evolution/banc/README.md, banc.js, criteres.js, plan.js, rapport.js, tests/banc.test.js, et ml/ecurie/etude/echelle-de-bots/pieces/LISEZ-MOI.md (pourquoi : le pilote ramasse moitie moins de pieces par minute que les joueurs, et aucun critere du banc ne voit un debit).
${REGLES}
- AUCUNE COURSE : ni dans la copie ni ailleurs. Les tests du banc (ml/evolution/banc/tests/banc.test.js) sont sans course : tu peux les lancer dans la copie. Ne lance pas evoluer.test, identite.test ni courses.test.
- Tu ne modifies que ml/evolution/banc/ (et ses tests, son README, bras.json) dans la copie. Pas modele.js, pas genome.js, pas courses.js, pas enfant.js, pas ml/bot : l'epoque des courses ne doit PAS changer (verifie-le : l'empreinte que banc.js --verifier ecrit dans plan.json doit rester ad6cc000299a pour les courses).
`

phase('Test B')
const pipeB = (async () => {
  const mesure = await agent(`ROLE : MESUREUR du test B.
${CTX_B}
A FAIRE, DANS L'ORDRE
1. LE CRITERE, ECRIT AVANT DE JOUER : ecris tri/prediction.md AVANT toute course : la question ; l'echantillon (40 courses de c0025 dont le palier final est entre 4 et 8 : choisis les graines dans ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl, bras « depart », en prenant les premieres par ordre de graine sans regarder autre chose que le palier final ; ecris la liste) ; comment le juge est employe (discerner.js, humains « clavier », fenetres de 10 s ; les memes fenetres de temps chez les joueurs : compare aussi en ne gardant des joueurs que les fenetres avant la duree mediane de ces courses, pour ne pas juger « meurt tot » contre « dure longtemps ») ; le temoin humains contre humains ; le verdict annonce : AUC ≤ 0,75 : le tri vaut pour le bas de l'echelle ; AUC ≥ 0,90 : l'idee est morte ; entre les deux : indecis ; et la puissance : avec 14 parties de 2 joueurs, que vaut l'AUC du temoin et son incertitude (dis-le avant).
2. PRODUIRE LES PARTIES : rejoue ces 40 courses avec l'enregistrement des parties (le chemin que discerner.js attend : regarde ml/bot/noter.js --parties ; le pilote c0025 de la selection est fabrique par ml/evolution : regarde comment ml/ecurie/etude/sortie-preparee/course-diag.js et pilote-diag.js chargent c0025, ou ml/ecurie/pilote-voltige.js qui est le meme pilote au bit pres ; verifie sur 2 graines que la course rejouee a le meme palier final, la meme survie et la meme cause que la ligne du banc — si ce n'est pas le cas, ARRETE et dis-le : l'epoque a pu changer, et il faut alors choisir les 40 courses sur un lot rejoue). Une course a la fois.
3. JUGER : lance le discerneur ; rends l'AUC, le temoin, l'AUC a fenetres de temps egales, et CE QUI TRAHIT (les mesures les plus bavardes, valeur humaine et valeur du bot). Refais-le par tranche de palier final (4-5, 6-8) si les effectifs le permettent.
4. EN PLUS, sans course : le meme juge sur les 20 parties de la note ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json si elle se lit (c0025 tout-venant), pour comparer « courses mortes tot » et « courses ordinaires ».
Rends un rapport (1 500 mots au plus) : la prediction (et l'heure du fichier), la preuve d'identite, les effectifs, les AUC, ce qui trahit, le verdict selon la regle ecrite, et ce que tu n'as pas pu savoir. Liste tes fichiers.`, { label: 'testB:mesurer', phase: 'Test B', model: 'opus' })
  const relu = await agent(`ROLE : RELECTEUR ADVERSE du test B, puis REDACTEUR.
${CTX_B}
LE RAPPORT DU MESUREUR (par defaut, une affirmation non retrouvee est fausse) :
${mesure || '(aucun rapport : regarde ml/ecurie/etude/echelle-de-bots/tri/ et dis ce qui manque)'}

A FAIRE : (1) verifie que tri/prediction.md a ete ecrit avant les courses (dates des fichiers) et pas retouche ; que les 40 graines ont ete choisies comme dit ; que les courses rejouees sont bien celles du banc (palier, survie, cause). (2) Attaque le juge : l'AUC depend-elle du nombre de parties, de la duree des fenetres, des versions du jeu differentes entre joueurs et simulateur (une mesure qui trahit peut trahir le SIMULATEUR ou la VERSION, pas le pilote : cherche lesquelles), du fait que le juge apprend « ces 2 joueurs » ? Refais le calcul avec tes propres reglages (fenetres de 5 et 20 s, humains « tous ») sans rejouer de course. Le temoin humains contre humains : que vaut-il vraiment ? (3) Ecris ml/ecurie/etude/echelle-de-bots/tri/LISEZ-MOI.md, dans la forme de ml/ecurie/etude/echelle-de-bots/pieces/LISEZ-MOI.md (jury qui ne code pas, « en une minute », phrases courtes, chaque chiffre avec son fichier et son effectif, ta version quand elle differe). N'ecris aucune decision : finis par « Ce que la session principale doit trancher » (cinq lignes au plus). Ne committe rien. Rends : ce qui tient, ce qui tombe, le verdict selon la regle ecrite d'avance, ces cinq lignes.`, { label: 'testB:relire', phase: 'Test B', model: 'opus' })
  return { mesure, relu }
})()

phase('Critere de debit')
const pipeD = (async () => {
  const ecrit = await agent(`ROLE : AUTEUR du critere de debit.
${CTX_D}
A FAIRE
1. Ajoute au banc v2 un type de critere « debit » : les pieces ramassees par minute de survie d'une course (pieces ÷ survie_s × 60). Lis d'abord ce que les lignes des courses gardent (pieces = celles de la fin ? pieces_max ? pieces_ramassees ? regarde ml/bot/mesures.js et le resultat compact de ml/evolution/enfant.js, SANS les modifier) et choisis le champ qui compte les pieces vraiment ramassees (une seconde chance en reprend) ; dis lequel et pourquoi ; si le bon champ n'est pas dans les lignes, prends le meilleur disponible, dis la limite, et n'ajoute RIEN aux lignes (cela changerait l'epoque). Une course de moins de 20 s de survie : debit non mesure (null), pour ne pas diviser par presque rien — justifie le seuil ou propose mieux. Sens « haut » ou « bas » comme les autres.
2. Le critere se lit dans vague.json comme { "type": "debit", "sens": "haut" } ; il s'affiche en francais dans resume.txt, journal.md et le --verifier comme les autres ; il figure dans les mesures secondaires de TOUTES les vagues (meme quand il n'est pas le critere) sans changer les verdicts ni les fichiers d'une vague deja jouee : la vague v001-confirmation-gestes, en cours dans l'autre arbre, doit pouvoir etre reprise avec ton code et donner les memes decisions (verifie par un test : meme regards.json sur un etat d'essai, avec et sans ton changement, hors le champ ajoute s'il y en a un — si ajouter un champ a regards.json ou resultat.json d'une vague en cours pose un risque de reprise refusee (code 4), ne l'ajoute qu'aux vagues nouvelles et dis-le).
3. Ajoute aussi une GARDE optionnelle par bras dans vague.json : "gardes": [ { "type": "survie", "sens": "haut", "pasPire": 15 } ] = le bras ne peut etre dit « NET : aide » que si, sur ses graines lues, l'ecart au temoin sur cette mesure n'est pas pire que la valeur annoncee (ici : pas plus de 15 s de survie perdue) ; sinon le verdict s'ecrit « net sur le critere, garde non tenue ». La garde ne change PAS la regle d'arret (pas de risque statistique en plus dans le sens « aide ») ; dis-le dans le README. Si tu juges cette garde mal definie statistiquement, propose mieux et fais-le.
4. Cinq bras de plus dans bras.json (dit en francais simple) : "nitro-sol" { capMax 0.6, jaugeAllume 0.25, jaugeCoupe 0.1 }, "vise-large" { marge 5 }, "racc-fermes" { raccCartes_grotte 1, raccJumeau_grotte 1, raccCartes_canyon 1, raccJumeau_canyon 1, raccCartes_jade 1 }, "fig3" { figMax 3 }, "nitro-decor" { nitroDecor 1.5 } ; verifie chaque gene et ses bornes dans ml/evolution/genome.js (BORNES) et que banc.js --verifier fabrique ces pilotes (ecris une vague d'essai numero 0 dans un dossier d'essai, pas dans vagues/).
5. Les tests : complete tests/banc.test.js (le critere debit sur des lignes fabriquees : valeur, null sous le seuil, sens ; la garde tenue et non tenue ; la non-regression des vagues sans debit ; le taux de faux « net » inchange). Lance-les. Mets a jour le README du banc (la liste des criteres, la garde, un exemple de vague « debit »).
6. Committe dans la copie, sur la branche banc-debit (message en francais, une longue ligne « BOTS-ML : … — le jeu ne change pas », puis une ligne vide et « Co-Authored-By: Claude Fable 5.2 <[adresse retirée]> »). Ne pousse pas, ne fusionne pas.
Rends : ce que tu as change fichier par fichier, le champ de pieces choisi et sa limite, les resultats des tests (nombres), l'empreinte d'epoque inchangee, le hash du commit, ce que tu n'as pas verifie.`, { label: 'debit:ecrire', phase: 'Critere de debit', model: 'opus' })
  const relu = await agent(`ROLE : RELECTEUR ADVERSE du critere de debit.
${CTX_D}
CE QUE L'AUTEUR DIT AVOIR FAIT (par defaut, une affirmation non verifiee est fausse) :
${ecrit || '(aucun rapport : regarde git log et git diff bots-ecurie..banc-debit dans la copie)'}

A FAIRE : relis le diff (git diff bots-ecurie..HEAD dans la copie). Cherche : (1) un changement qui toucherait l'epoque des courses ou de la note (aucun fichier hors ml/evolution/banc/ ne doit changer) ; (2) la reprise de la vague en cours : copie ml/evolution/banc/vagues/v001-confirmation-gestes (vague.json, plan.json, regards.json s'il existe) et le cache C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/evolution/banc/etat/courses-2026-48.jsonl dans un dossier d'ESSAI de la copie (lecture seule sur l'original, jamais d'ecriture la-bas), et verifie avec --verifier ou --resume (SANS jouer de course : si la commande veut jouer, arrete-la) que le nouveau code accepte cette vague sans code 4 et rend les memes decisions au regard 1 ; (3) le critere debit : le champ de pieces est-il le bon (relis mesures.js et enfant.js), le seuil de survie biaise-t-il (un bras qui meurt plus tot perd-il des graines « non mesurees » d'une facon qui l'avantage ? compte-le sur les 1 250 lignes de ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl : distribution du debit, part de courses sous le seuil par bras, ecart-type apparie du debit entre graines, et donc l'effet detectable a 96 et 192 graines) ; (4) la garde : peut-elle laisser passer un bras nuisible ou bloquer un bras utile par simple bruit (calcule sur les memes lignes le bruit de l'ecart de survie a 96 graines : la garde « pas pire que 15 s » a-t-elle un sens ? propose le bon seuil) ; (5) le taux de faux « net » est-il vraiment inchange. Corrige toi-meme ce qui est faux, relance les tests du banc, committe (meme forme de message). Rends : les defauts trouves et corriges, les chiffres du point (3) et (4), les tests (nombres), le hash final, ce qui reste non verifie.`, { label: 'debit:relire', phase: 'Critere de debit', model: 'opus' })
  return { ecrit, relu }
})()

const [B, D] = await Promise.all([pipeB, pipeD])
return { testB: B.relu, debit: D.relu }