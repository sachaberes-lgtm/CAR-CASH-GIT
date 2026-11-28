export const meta = {
  name: 'echelle-de-bots',
  description: 'Concevoir comment la selection naturelle produit une echelle de bots (niveaux 1 a 30, qui meurent comme des joueurs) et des experts imbattables au palier 30, au lieu d un seul champion : 4 lecteurs, 3 concepteurs rivaux, 3 relecteurs adverses, 1 redacteur. Aucune course.',
  phases: [
    { title: 'Comprendre', detail: 'quatre lecteurs : les joueurs, le palier, la selection, ce qui existe deja pour le matchmaking' },
    { title: 'Concevoir', detail: 'trois concepteurs independants (Fable), une voie chacun' },
    { title: 'Attaquer', detail: 'trois relecteurs adverses : les chiffres, le code, le but de Sacha' },
    { title: 'Ecrire', detail: 'un redacteur range l etude' },
  ],
}

const COMMUN = `
CONTEXTE (depot C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie, branche bots-ecurie).
Le chantier : les bots du jeu CASH CAR (runner arcade 3D). Sacha dirige et ne code pas. Un « pilote » (ml/evolution/modele.js, fabrique par ml/evolution/enfant.js a partir d'un genome de 129 genes, ml/evolution/genome.js) conduit le vrai jeu simule sans ecran (ml/reel) ; il voit par « les yeux » (ml/bot/yeux.js) et agit par « la main » (ml/bot/doigts.js : des delais, des coups de touche, un PROFIL). Depuis le 27/11, une selection naturelle (ml/evolution/ : evoluer.js, INTERFACES.md, README.md, config.json) tourne seule sur le PC de Sacha (« le Ryzen », environ 495 courses a l'heure) : 20 vivants, 6 enfants par generation, 12 graines, le moins bon est vire. Sa note : F = palier - 4 E, ou « palier » est le PALIER MOTEUR atteint dans la partie (1 a 30 : les 30 moteurs de ENGINE_TIERS, gagnes par les pieces ramassees en course ; ml/bot/mesures.js) et E la distance aux vrais joueurs sur 15 mesures (ml/bot/ressemblance.js ; etalon : ml/bot/etalon/, 14 parties de 2 joueurs). Elle ne cherche qu'UN champion. Le champion du moment, c0025, tourne vers le palier 6,8 en 900 s ; apres 18 generations, aucun enfant ne l'a detrone.

LE BUT, REDIT PAR SACHA LE 28/11/2026 (a citer tel quel) : « bah oui il doit mourir comme un joueur mais il faut aussi des pilote expert qui ne peuvent pas perdre du tout au palier moteur 30 il faut differnt niveau de bot qui permetent un match makin adapté au niveau de chaque joueur ». Et le 24/11 : « des bots du record de palier 1 au palier 30 ». Et depuis le debut : « on ne peut pas du tout faire la diff entre un bot et un vrai joueur ».
Donc DEUX FAMILLES, pas un champion : (1) L'ECHELLE HUMAINE : des bots de niveaux differents, du palier 1 au palier 30, chacun conduisant et MOURANT comme un joueur de ce niveau, pour un matchmaking adapte au niveau de chaque joueur ; (2) LES EXPERTS : des pilotes qui ne perdent jamais au palier moteur 30.

CE QU'ON SAIT DEJA (lis-le, ne le refais pas) : ml/ecurie/etude/avant-le-bord/LISEZ-MOI.md (c0025 meurt autant que les joueurs par minute sur decor, 5,5 contre 5,3 morts pour 10 min, mais va 8 a 30 % moins vite et part nitro allumee 5 fois moins souvent ; E ne contient aucune mesure de la mort), ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md, ml/ecurie/etude/prochaines-idees/LISEZ-MOI.md, ml/ecurie/ETAPES.md (l'etape F « le paquet du matchmaking »), ml/ecurie/PASSATION.md, ml/ecurie/portfolio/journal/ (l'histoire), ml/evolution/notes/ (le reglage de la selection : le « mur du hasard », la validation sequentielle, le coffre).

REGLES DURES
- AUCUNE COURSE, aucun test de ml/evolution/tests : le PC est pris par une vague du banc et une mesure. De petits scripts node qui LISENT des fichiers, oui (un processus, court).
- Tu ne modifies RIEN hors de ml/ecurie/etude/echelle-de-bots/ (cree-le ; un sous-dossier a ton role pour tes scripts et sorties). Lecture partout.
- Piege Git Bash : jamais de chemin /c/… passe a node ; chemins relatifs au depot ou C:/Users/….
- Ne committe rien. Depot public : aucun nom de machine, aucune adresse, aucune cle ; les PC s'appellent « le Xeon » et « le Ryzen ».
- Chaque chiffre a sa source (fichier, champ, script laisse dans ton dossier). « On ne sait pas » est une reponse. N'invente rien.
`

phase('Comprendre')
const LECTEURS = [
  { cle: 'joueurs', consigne: `ROLE : lecteur des JOUEURS. Que sait-on des vrais joueurs, niveau par niveau ? Lis ml/bot/etalon/ (LISEZ-MOI et les fichiers de parties), ml/bot/mesures.js, ml/bot/ressemblance.js. Rends : combien de joueurs, de parties, de minutes ; pour chaque partie : palier atteint, pieces, pieces par minute, duree, cause et map de la mort, vitesse, voiture ; la distribution des paliers des joueurs (mediane, record) ; ce qui change chez un MEME joueur entre ses parties faibles et ses parties fortes (est-ce la survie, les pieces par minute, la vitesse ?) ; les 15 mesures de E et lesquelles dependent du niveau. Question centrale : avec ces donnees, peut-on dire a quoi ressemble « un joueur de palier 3 », « de palier 10 », « de palier 20 » ? Jusqu'a quel palier a-t-on des donnees de joueurs ? Que faudrait-il enregistrer de plus chez de vrais joueurs (et combien de parties) pour etalonner une echelle ? Le jeu enregistre-t-il deja des parties (code/moteur/enregistreur-jeu.js) et comment Sacha en recupere ?` },
  { cle: 'palier', consigne: `ROLE : lecteur du PALIER. De quoi est fait un palier, et que faut-il pour le palier 30 ? Lis code/gameplay/pickups-fruits.js (ENGINE_TIERS : seuils de pieces, push, res), code/economie/achat-carte-moteur.js, code/gameplay/seconde-chance.js, ml/bot/mesures.js, ml/reel. Rends : les 30 seuils ; ce que chaque moteur change (vitesse, poussee) ; combien de pieces par minute il faut pour le palier 10, 20, 30 en 5, 10, 15, 30 minutes ; combien c0025 en ramasse par minute et combien de temps il survit (lis les notes existantes : ml/ecurie/agents/*/note-*.json s'ils existent, les lignes des courses de ml/ecurie/etude/banc-des-genes/etat/courses-*.jsonl, 1 250 courses) : sa distribution de paliers, de survie, de pieces par minute, et la part de courses coupees par la limite de 900 s. Le palier de c0025 est-il borne par la MORT ou par le TEMPS (tmax 900 s) ou par le DEBIT de pieces ? A debit et survie actuels, quel palier atteindrait-il sans limite de temps ? Quelle est la piece la plus rentable (pieces par km selon la ligne, les vols, les raccourcis) ? Le palier 30 est-il atteignable par un pilote parfait qui ne meurt jamais (pieces disponibles par km × vitesse) et en combien de minutes ? La vitesse du jeu monte-t-elle avec le palier au point de rendre la conduite impossible pour ces yeux et cette main (delais de doigts.js contre la vitesse au palier 30) ?` },
  { cle: 'selection', consigne: `ROLE : lecteur de la SELECTION. Que faudrait-il changer dans ml/evolution pour qu'elle garde une ECHELLE (plusieurs niveaux) et une famille d'EXPERTS au lieu d'un champion ? Lis ml/evolution/evoluer.js, INTERFACES.md, README.md, config.json, note.js ou l'equivalent, greffes.js, les pages (tableau, arbre, histoire, resume), les epoques (FICHIERS_EPOQUE, l'epoque de la note distincte de l'epoque des courses), le cache des courses, la validation, le coffre, le temoin. Rends : ou la note F est calculee et si elle peut etre recalculee depuis le cache sans rejouer (que gardent les lignes des courses : palier, pieces, survie, causes des morts, cartes, mesures ?) ; ce que couterait une seconde note (par exemple « expert » = palier ou survie seuls) : nouvelle epoque de note ? courses rejouees ? ; si la population peut porter plusieurs « iles » ou « niches » (une par niveau) et ce que cela casse (le temoin, le coffre, la validation, les pages, la reprise, la migration des etats du Ryzen) ; les genes qui reglent deja le NIVEAU d'un pilote sans toucher a son style (les genes de la main / du PROFIL : delais, erreurs, palier de la seconde chance ; lesquels sont figes) ; la puissance statistique : avec 495 courses a l'heure et un bruit de ±0,7 sur F en 12 graines, combien de niveaux peut-on tenir a la fois ? Dis franchement ce qui est simple, ce qui est lourd, ce qui est dangereux pour l'etat du Ryzen.` },
  { cle: 'existant', consigne: `ROLE : lecteur de L'EXISTANT. Qu'est-ce qui a deja ete pense ou construit pour le matchmaking et les niveaux ? Lis ml/ecurie/ETAPES.md (toutes les etapes, surtout F), PLAN.md, PASSATION.md, CONSIGNES.md, ml/ecurie/portfolio/journal/*.md (cherche : palier, niveau, matchmaking, echelle, paquet, fantome, expert, seconde chance), ml/bot/mesures.js (« l'echelle du matchmaking »), ml/labo/ (jalons, cerveaux : les anciens champions c0026, c0064, c0072, c0087, c0101 et leurs paliers), ml/ecurie/agents/. Rends : la liste datee de ce que Sacha a dit sur les niveaux et le matchmaking (ses mots, ou ils sont ecrits) ; ce qui a ete promis (le paquet : pour chaque palier, ses pilotes, ses courses rejouables en fantome) et ce qui existe vraiment ; les pilotes deja connus et leur palier mesure (un tableau : pilote, palier median, record, E, sur combien de courses, quelle epoque) : couvrent-ils deja une partie de l'echelle (des bots faibles existent-ils : anciens pilotes, generations zero) ? ; comment un bot serait utilise par le jeu (un fantome rejoue ? un adversaire en direct ? rien n'est branche : dis-le) et ce que « ne peut pas perdre » veut dire dans ce cadre (une course contre un joueur se gagne comment : distance, argent, survie ? cherche dans code/ s'il existe un mode a plusieurs ou un classement).` },
]
const lectures = await parallel(LECTEURS.map(l => () =>
  agent(`${l.consigne}\n${COMMUN}\nRends un rapport en francais, phrases courtes, tableaux pour les chiffres, 1 600 mots au plus, qui finit par « Ce que cela impose a la conception de l'echelle » (4 a 8 lignes).`, { label: 'lire:' + l.cle, phase: 'Comprendre', model: 'opus' })))
const SAVOIR = LECTEURS.map((l, i) => `===== LECTEUR ${l.cle} =====\n${lectures[i] || '(pas de rapport)'}`).join('\n\n')

phase('Concevoir')
const VOIES = [
  { cle: 'niches', dit: 'LA VOIE DES NICHES (qualite-diversite) : la selection garde, au lieu d\'un classement unique, une case par niveau (par palier ou par bande de paliers) ; dans chaque case survit le pilote le plus ressemblant aux joueurs ; les enfants naissent de toutes les cases. Les experts sont la case du haut, jugee autrement.' },
  { cle: 'handicap', dit: 'LA VOIE DU HANDICAP : on ne fait evoluer que le meilleur pilote possible (l\'expert), puis on DERIVE les niveaux inferieurs en reglant sa main et ses choix (delais, erreurs, prudence, nitro, avidite pour les pieces) pour qu\'il atteigne et meure comme un joueur du niveau vise ; un niveau = un jeu de reglages etalonne, pas une lignee.' },
  { cle: 'libre', dit: 'LA VOIE LIBRE : la meilleure conception que les lectures suggerent et que les deux autres ne couvrent pas (par exemple deux selections separees avec deux notes ; un pilote unique qui prend le niveau vise en entree ; partir des parties des joueurs eux-memes ; ou montrer que l\'echelle complete est hors de portee avec les donnees actuelles et dire quelle partie faire d\'abord).' },
]
const conceptions = await parallel(VOIES.map(a => () =>
  agent(`ROLE : CONCEPTEUR. ${a.dit}
${COMMUN}
CE QUE LES QUATRE LECTEURS ONT TROUVE (verifie dans les fichiers ce sur quoi tu t'appuies) :
${SAVOIR}

A RENDRE : UNE conception complete de ta voie, pour quelqu'un qui devra la construire : (1) l'idee en cinq phrases pour Sacha, qui ne code pas ; (2) ce que la selection garde, comment elle note, qui est vire, qui se reproduit — regles exactes ; (3) la definition mesurable d'« un bot de niveau k » (distribution des paliers ? palier median ? sur combien de courses ?) et de « meurt comme un joueur » (quelles mesures de mort ajouter a la ressemblance, avec quelles donnees de joueurs, et que faire quand il n'y a pas de joueur a ce niveau) ; (4) la definition mesurable d'« expert qui ne perd jamais au palier 30 » et le chemin depuis le palier 7 d'aujourd'hui : est-ce une affaire de reglage, de nouveaux genes, de temps de calcul, ou d'une limite du jeu ? chiffre ce que tu peux ; (5) ce que cela change dans ml/evolution, fichier par fichier, et ce que cela coute au Ryzen (epoques, courses rejouees, etat a migrer) ; (6) le budget : combien de courses pour obtenir une premiere echelle credible de 5 niveaux, puis de 30 ; (7) la PREMIERE ETAPE faisable en une journee qui prouve ou tue l'idee, et le critere ecrit d'avance ; (8) ce qui te ferait abandonner. Sois dur avec ta propre voie. 1 800 mots au plus.`, { label: 'concevoir:' + a.cle, phase: 'Concevoir' })))
const IDEES = VOIES.map((a, i) => `===== CONCEPTION ${a.cle} =====\n${conceptions[i] || '(pas de proposition)'}`).join('\n\n')

phase('Attaquer')
const ATTAQUES = [
  { cle: 'chiffres', dit: 'LES CHIFFRES : refais avec TES scripts les comptes sur lesquels les conceptions s\'appuient (paliers des joueurs, pieces par minute, survie, ce que borne le palier de c0025, le budget en courses, la puissance statistique par niveau). Les donnees des joueurs sont minces (14 parties, 2 joueurs) : pour chaque conception, dis ce qu\'elle PRETEND savoir des joueurs et que ces donnees ne peuvent pas porter.' },
  { cle: 'code', dit: 'LE CODE ET LE RYZEN : pour chaque conception, est-ce constructible dans ml/evolution tel qu\'il est (cite les fonctions) ? qu\'est-ce que cela casse (temoin, coffre, validation, reprise, pages, cache, epoques, identite) ? l\'etat du Ryzen survit-il ? le reglage de niveau par la main existe-t-il vraiment dans doigts.js / le PROFIL, et un bot handicape conduit-il comme un debutant ou comme un expert sabote (dis ce qui permettrait de le savoir) ?' },
  { cle: 'but', dit: 'LE BUT DE SACHA : relis ses mots. Chaque conception donne-t-elle vraiment (a) des bots qu\'on ne distingue pas d\'un joueur A CHAQUE niveau, (b) des experts qui ne perdent jamais au palier 30, (c) un matchmaking adapte ? Laquelle livre quelque chose d\'utilisable le plus tot ? Laquelle repose sur une donnee qu\'on n\'a pas ? Que faut-il demander a Sacha (donnees de joueurs a enregistrer, sens de « ne pas perdre », nombre de niveaux utiles) — au plus trois questions, chacune fermee. Classe les conceptions et dis si la meilleure est un melange.' },
]
const attaques = await parallel(ATTAQUES.map(t => () =>
  agent(`ROLE : RELECTEUR ADVERSE. ${t.dit}
${COMMUN}
LES LECTURES :
${SAVOIR}

LES CONCEPTIONS A ATTAQUER :
${IDEES}

Par defaut, une affirmation non retrouvee est fausse. Rends : pour chaque conception, ce qui tient, ce qui tombe (avec la preuve), un verdict (a faire / a mesurer d'abord / a ne pas faire), puis ton classement. 1 300 mots au plus.`, { label: 'attaquer:' + t.cle, phase: 'Attaquer', model: 'opus' })))
const CRITIQUES = ATTAQUES.map((t, i) => `===== ATTAQUE ${t.cle} =====\n${attaques[i] || '(pas de rapport)'}`).join('\n\n')

phase('Ecrire')
const ecrit = await agent(`ROLE : REDACTEUR. Tu ranges tout dans ml/ecurie/etude/echelle-de-bots/LISEZ-MOI.md, dans la forme de ml/ecurie/etude/avant-le-bord/LISEZ-MOI.md (pour un jury qui ne code pas : « en une minute » en tete, phrases courtes, chaque chiffre avec sa source, ce qu'on ne sait pas dit tel quel). Plan : le but dans les mots de Sacha (cites tels quels, dates) ; ce qu'on sait des joueurs ; de quoi est fait un palier et ce qui borne c0025 ; ce que la selection sait faire et ne sait pas ; ce qui existait deja ; les trois conceptions (une fiche chacune) ; ce que les relecteurs ont fait tomber ; leur classement ; les questions pour Sacha ; ce qui reste a mesurer et son cout ; les fichiers. N'ecris AUCUNE decision : un titre « Ce que l'on en fait » avec « a ecrire par la session principale ». Quand une attaque contredit une lecture ou une conception, ecris la version du relecteur et dis-le.
${COMMUN}
LES LECTURES :
${SAVOIR}

LES CONCEPTIONS :
${IDEES}

LES ATTAQUES :
${CRITIQUES}

Rends : le chemin du fichier, la liste des fichiers gardes, et en dix lignes ce que la session principale doit trancher.`, { label: 'rediger', phase: 'Ecrire', model: 'opus' })

return { ecrit, attaques: CRITIQUES }