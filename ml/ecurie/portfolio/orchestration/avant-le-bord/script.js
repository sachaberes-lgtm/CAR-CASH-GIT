export const meta = {
  name: 'avant-le-bord',
  description: 'Etude sans course : pourquoi le pilote meurt sur les maps a decor avant meme que le bord soit annonce, puis trois conceptions rivales d un gene « au sol avant le bord », attaquees par trois relecteurs',
  phases: [
    { title: 'Comprendre', detail: 'trois lecteurs : les traces des 40 courses, le code du pilote et des yeux, les joueurs et la ville' },
    { title: 'Concevoir', detail: 'trois concepteurs independants (Fable), un angle chacun' },
    { title: 'Attaquer', detail: 'trois relecteurs adverses : les chiffres, le code, le banc' },
    { title: 'Ecrire', detail: 'un redacteur range l etude dans ml/ecurie/etude/avant-le-bord' },
  ],
}

const COMMUN = `
CONTEXTE (depot C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie, branche bots-ecurie).
Le chantier : les bots du jeu CASH CAR (runner arcade 3D). Un « pilote » (ml/evolution/modele.js, fabrique par ml/evolution/enfant.js a partir d'un genome de 129 genes, ml/evolution/genome.js) conduit dans le vrai jeu simule sans ecran (ml/reel) ; il voit par « les yeux » (ml/bot/yeux.js) et agit par « les doigts » (ml/bot/doigts.js). Le but de Sacha (il ne code pas) : les meilleurs bots possibles, qu'on ne distingue pas d'un vrai joueur, des paliers 1 a 30. Le champion du moment, c0025, tourne autour du palier 6,8 sur 900 s. La note de la selection : F = palier - 4 E, ou E est la distance aux vrais joueurs (ml/bot/ressemblance.js, ml/bot/mesures.js).
Ce qu'on sait deja (LIS-LE, ne le refais pas) : ml/ecurie/etude/sortie-preparee/LISEZ-MOI.md (la mesure des decollages du 28/11 : 40 courses a map tenue, 180 decollages subis distincts, 24 morts ; les yeux ne voient aucune issue aux 24 decollages mortels ; le bord n'est annonce que 0,28 s avant, la main met 0,2 s ; morts par map : canyon 30 %, grotte 24 %, ville 13 %, jade 5 % ; les raccourcis voulus tuent en ville, 5 sur 22). Sa conclusion, la piste de cette etude-ci : « le levier est AU SOL, AVANT LE BORD : la ligne, la marge, la vitesse sur les maps a decor ». Les donnees de cette mesure sont gardees : ml/ecurie/etude/sortie-preparee/sorties/ (decollages.json, relecture.json, et sorties/lignes/*.json + *.jsonl.gz : la trace vue par vue de chaque course ; les scripts mesurer.js, analyser.js, relecture.js disent comment les lire). Autres sources : ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md (ce que valent les interrupteurs), ml/ecurie/etude/prochaines-idees/LISEZ-MOI.md (les idees deja relevees et attaquees ; « freiner au canyon » y a ete descendue : lis pourquoi), ml/evolution/notes/genes-v4.md (le contrat des genes v4 et la forme d'un gene : eteint a la naissance, muet eteint, un compteur de declenchements, des bornes), ml/evolution/banc/README.md (le banc v2 : ce qu'il sait mesurer, courses a map imposee, criteres).

REGLES DURES
- AUCUNE COURSE, aucun test de ml/evolution/tests : une vague du banc et des tests longs occupent tout le PC. Tu peux lancer de petits scripts node qui LISENT des fichiers (un seul processus, court).
- Tu ne modifies RIEN dans ml/evolution/, ml/bot/, ml/reel/, code/, VERSION PRINCIPALE/ (une vague compare le code a son plan : tout changement l'arrete). Tes scripts et tes sorties vont dans ml/ecurie/etude/avant-le-bord/ (cree-le ; sous-dossier a ton nom de role pour tes brouillons).
- Piege Git Bash : ne passe jamais a node un chemin qui commence par /c/ ; chemins relatifs au depot ou C:/Users/….
- Ne committe rien. Depot public : aucun nom de machine, aucune adresse, aucune cle.
- Chaque chiffre que tu rends a sa source (fichier, champ, ou script que tu laisses dans ton dossier). Dis ce que tu n'as pas pu savoir. N'invente rien pour faire joli : « on ne sait pas » est une reponse.
`

phase('Comprendre')
const LECTEURS = [
  { cle: 'traces', consigne: `ROLE : lecteur des TRACES. Question : que se passe-t-il AU SOL dans les 3 dernieres secondes avant chaque decollage subi sur une map a decor (canyon, grotte, ville, jade), et qu'est-ce qui separe les 24 decollages mortels des autres (environ 156) ? A partir des traces vue par vue (sorties/lignes/*.jsonl.gz) et de decollages.json / relecture.json : la vitesse, la position laterale sur la route et la distance au bord de la dalle, le cap par rapport a l'axe de la route, le volant, la nitro, la jauge, ce que les yeux annoncaient (le temps avant que la route lache, la suite de la route, les rayons), le type d'endroit (fin de dalle, trou, virage, portail, raccourci), le palier et la vitesse du jeu a ce moment, la map. Cherche des SEPARATEURS : une grandeur lisible au sol au moins 0,6 s avant le decollage (la main met 0,2 s, il faut de la marge) dont la valeur distingue les mortels des autres ; donne pour chacune le tableau croise (seuil, mortels au-dessus / en dessous, non mortels au-dessus / en dessous) et dis honnetement si 24 morts suffisent a y croire. Regarde aussi : les memes endroits du decor tuent-ils plusieurs fois (meme map, meme distance) ? Les morts arrivent-elles tot dans la visite de la map ou a un palier donne ? Combien de decollages subis etaient EVITABLES (la route continuait, la caisse est sortie par le cote) contre IMPOSES (la route s'arrete, il faut voler) ? C'est la distinction la plus importante : rends-la chiffree, avec ta definition.` },
  { cle: 'code', consigne: `ROLE : lecteur du CODE. Question : que fait le pilote au sol sur une map a decor quand la route va lacher, et que pourrait-il savoir de plus ? Lis ml/evolution/modele.js (auSol : la ligne, le cap, le slalom, les pieces, la nitro, la marge, les raccourcis, ce qui change quand « decor » est vrai ; enVol : ce que le vol herite du sol), ml/bot/yeux.js (TOUT ce que la vue au sol contient : la route devant, ses bords, sa largeur, sa courbure, le temps avant le lache tn.t, les sorties, les rayons, le decor : parois, roches, pics, tours ; a quelle distance et depuis quand), ml/bot/doigts.js (les delais de la main, ce que la main ne peut pas faire). Rends : (1) la liste de ce que la vue au sol offre et que le pilote N'UTILISE PAS avant un bord sur decor ; (2) la liste de ce que les yeux NE DONNENT PAS et qu'il faudrait (par exemple ou la route reprend apres le trou, la position de la paroi en face) — attention : changer yeux.js change l'epoque de toutes les courses et oblige a re-noter le champion du Ryzen, c'est un cout a dire ; (3) les genes existants qui touchent deja la ligne, la marge et la vitesse au sol sur decor (noms, bornes, valeurs de c0025) et si la selection peut deja les regler seule (auquel cas une regle nouvelle ne sert a rien : dis-le) ; (4) les leviers reels au sol : le jeu a-t-il un frein ? peut-on ralentir (lacher la nitro, autre) ? de combien change la vitesse en 1 s ? peut-on choisir de quel cote on quitte la dalle ? Verifie dans ml/reel et dans code/gameplay (lecture seule).` },
  { cle: 'joueurs', consigne: `ROLE : lecteur des JOUEURS et de la VILLE. Deux questions. (A) Que font les vrais joueurs avant un bord sur les maps a decor ? Cherche les donnees des joueurs (ml/bot/ressemblance.js, ml/bot/mesures.js, les fichiers de parties de joueurs que ces modules lisent, ml/ecurie/etude/*, ml/labo) : leur vitesse, leur nitro au decollage, leur position sur la route, leur taux de mort par map et la cause, la duree de leurs parties, le palier atteint ; compare a c0025 map par map si les donnees le permettent ; dis ce que les donnees des joueurs ne contiennent pas. Les joueurs meurent-ils aussi au canyon et a la grotte, autant ? Si les joueurs meurent au meme rythme, un bot qui ne meurt plus serait MOINS humain : dis-le chiffres a l'appui, c'est une tension que Sacha devra trancher. (B) Les raccourcis voulus en ville : 5 morts sur 22 contre 1 sur 45 ailleurs (ml/ecurie/etude/sortie-preparee). Quelles cartes de raccourci, quelle cause de mort, a quel moment du vol, que disait le radar au sol quand le pilote a choisi ? Le gene raccCartes_ville existe : que vaut-il chez c0025, que fait la valeur 0, et la selection sur le Ryzen vient de faire naitre une greffe raccCartes_ville = 0 (enfant 2e9b5cc4c924, generation 17) : lis son sort s'il est deja ecrit (git fetch origin evolution-ryzen puis git show origin/evolution-ryzen:ml/evolution/etat/resume.txt, population.json, histoire.md ; sinon dis « pas encore »).` },
]
const lectures = await parallel(LECTEURS.map(l => () =>
  agent(`${l.consigne}\n${COMMUN}\nRends un rapport en francais, phrases courtes, tableaux pour les chiffres, 1 500 mots au plus, qui finit par « Ce que cela dit pour un gene au sol avant le bord » (3 a 6 lignes).`, { label: 'lire:' + l.cle, phase: 'Comprendre', model: 'opus' })))
const SAVOIR = LECTEURS.map((l, i) => `===== LECTEUR ${l.cle} =====\n${lectures[i] || '(pas de rapport)'}`).join('\n\n')

phase('Concevoir')
const ANGLES = [
  { cle: 'vitesse', dit: 'L\'angle VITESSE ET ENERGIE : arriver au bord autrement (plus lent, plus vite, nitro ou pas, jauge gardee), pour que le vol qui suit ait une issue.' },
  { cle: 'ligne', dit: 'L\'angle LIGNE ET PLACEMENT : ou etre sur la dalle et dans quel cap avant qu\'elle lache (cote, marge au bord, alignement sur la suite de la route), et ne pas sortir par le cote quand la route continue.' },
  { cle: 'libre', dit: 'L\'angle LIBRE : la meilleure idee que les lectures suggerent et que les deux autres angles ne couvrent pas (par exemple choisir ou l\'on quitte la route, refuser un raccourci, une memoire des endroits qui tuent, ou conclure qu\'aucun gene au sol ne vaut le cout et dire quoi faire a la place).' },
]
const conceptions = await parallel(ANGLES.map(a => () =>
  agent(`ROLE : CONCEPTEUR d'une regle de pilote. ${a.dit}
${COMMUN}
CE QUE LES TROIS LECTEURS ONT TROUVE (verifie dans les fichiers ce sur quoi tu t'appuies) :
${SAVOIR}

A RENDRE : UNE proposition (ou deux si elles sont vraiment differentes), concue comme un gene v5 dans la forme du contrat ml/evolution/notes/genes-v4.md : (1) l'idee en trois phrases pour quelqu'un qui ne code pas ; (2) la regle exacte en pseudo-code sur les champs qui EXISTENT dans la vue et la memoire du pilote (cite les lignes de modele.js et de yeux.js) — si elle demande un champ nouveau aux yeux, dis-le et chiffre le cout (nouvelle epoque, re-noter le champion) ; (3) les genes : noms, types, bornes, valeurs de naissance (eteint a la naissance, muet quand eteint, c0025 inchange au bit pres) ; (4) le compteur de declenchements ; (5) sur les 180 decollages et les 24 morts mesures, combien de fois la regle aurait agi, sur combien de mortels et combien de non mortels, et ce qu'elle risque de casser (les vols qui se posaient) — calcule-le sur les traces si c'est faisable sans course, sinon dis comment le mesurer ; (6) les interactions avec les genes existants (bordOn, sortieOn, slalomOn, les raccourcis, la marge) ; (7) le critere a ecrire AVANT de jouer au banc (map imposee ? morts de quelle famille ? palier ? F ?) et le nombre de graines qu'il faudrait pour le voir ; (8) ce qui te ferait abandonner l'idee. Sois dur avec ta propre idee : la precedente (la sortie preparee) est morte parce que sa condition n'arrivait jamais. 1 500 mots au plus.`, { label: 'concevoir:' + a.cle, phase: 'Concevoir' })))
const IDEES = ANGLES.map((a, i) => `===== CONCEPTION ${a.cle} =====\n${conceptions[i] || '(pas de proposition)'}`).join('\n\n')

phase('Attaquer')
const ATTAQUES = [
  { cle: 'chiffres', dit: 'LES CHIFFRES : refais avec TES scripts (dans ton dossier) chaque comptage sur lequel une proposition s\'appuie (combien de decollages touches, mortels, non mortels, separateurs des lecteurs). Un separateur trouve sur 24 morts en regardant beaucoup de grandeurs est suspect : compte combien de grandeurs ont ete essayees et dis ce que le hasard seul donnerait.' },
  { cle: 'code', dit: 'LE CODE : pour chaque proposition, la condition peut-elle arriver avec les champs reels (la precedente regle ne s\'est jamais declenchee) ? le champ existe-t-il a l\'instant voulu ? la main a-t-elle le temps (delais de doigts.js) ? le jeu permet-il le geste (y a-t-il un frein, la vitesse baisse-t-elle si on lache la nitro) ? eteint, est-ce muet au bit pres ? qu\'est-ce que cela casse dans auSol / enVol ?' },
  { cle: 'banc', dit: 'LE BANC ET LE BUT : chaque proposition est-elle mesurable au banc v2 avec le nombre de graines dit (le banc voit environ un palier a 192 graines) ? le critere gagne-t-il par construction ? rapproche-t-elle ou eloigne-t-elle des vrais joueurs (E) ? vaut-elle mieux que laisser la selection regler seule les genes existants ? Classe les propositions de la plus prometteuse a la moins prometteuse, et dis laquelle tu ne ferais pas.' },
]
const attaques = await parallel(ATTAQUES.map(t => () =>
  agent(`ROLE : RELECTEUR ADVERSE. ${t.dit}
${COMMUN}
LES LECTURES :
${SAVOIR}

LES PROPOSITIONS A ATTAQUER :
${IDEES}

Par defaut, une affirmation non retrouvee est fausse. Rends : pour chaque proposition, ce qui tient, ce qui tombe (avec la preuve), et un verdict (a faire / a mesurer d'abord / a ne pas faire). 1 200 mots au plus.`, { label: 'attaquer:' + t.cle, phase: 'Attaquer', model: 'opus' })))
const CRITIQUES = ATTAQUES.map((t, i) => `===== ATTAQUE ${t.cle} =====\n${attaques[i] || '(pas de rapport)'}`).join('\n\n')

phase('Ecrire')
const ecrit = await agent(`ROLE : REDACTEUR de l'etude. Tu ranges tout dans ml/ecurie/etude/avant-le-bord/LISEZ-MOI.md, dans la forme de ml/ecurie/etude/sortie-preparee/LISEZ-MOI.md et de ml/ecurie/etude/prochaines-idees/LISEZ-MOI.md (pour un jury qui ne code pas : phrases courtes, mots simples, « en une minute » en tete, chaque chiffre avec sa source, ce qu'on ne sait pas dit tel quel). Plan : la question ; ce que les traces disent ; ce que le code permet ; ce que font les joueurs et la ville ; les propositions (une fiche chacune) ; ce que les relecteurs ont fait tomber ; le classement des relecteurs ; ce qui reste a mesurer et combien de courses cela couterait ; les fichiers. N'ecris AUCUNE decision : elle revient a la session principale, laisse un titre « Ce que l'on en fait » avec la mention « a ecrire par la session principale ». Quand une attaque contredit une lecture ou une proposition, ecris la version du relecteur et dis-le. Range les brouillons utiles (scripts, sorties) et supprime de ce dossier ce qui ne sert pas (dans ml/ecurie/etude/avant-le-bord/ seulement).
${COMMUN}
LES LECTURES :
${SAVOIR}

LES PROPOSITIONS :
${IDEES}

LES ATTAQUES :
${CRITIQUES}

Rends : le chemin du fichier, la liste des fichiers gardes, et en dix lignes ce que la session principale doit trancher.`, { label: 'rediger', phase: 'Ecrire', model: 'opus' })

return { lectures: SAVOIR, conceptions: IDEES, attaques: CRITIQUES, ecrit }