export const meta = {
  name: 'avant-le-bord-mesures',
  description: 'Mesures A et C de l etude « avant le bord » : rejouer les 40 courses avec volant, virage et vitesse du jeu ; 16 courses de ville neuves avec prediction ecrite avant ; relecture adverse',
  phases: [
    { title: 'Mesurer', detail: 'un mesureur : outil de diagnostic etendu, preuve d identite, 56 courses a 2 a la fois, analyses' },
    { title: 'Relire', detail: 'un relecteur adverse refait les comptes avec ses scripts et ecrit la suite du LISEZ-MOI' },
  ],
}

const COMMUN = `
CONTEXTE (depot C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie, branche bots-ecurie). Lis d'abord EN ENTIER ml/ecurie/etude/avant-le-bord/LISEZ-MOI.md (l'etude et, au § 9, la decision de la session principale) puis ml/ecurie/etude/sortie-preparee/LISEZ-MOI.md §§ 3, 7, 8 (comment la mesure d'avant a ete jouee et prouvee) et ses outils : course-diag.js, pilote-diag.js, mesurer.js (--preuve), relecture.js.

REGLES DURES
- Une vague du banc tourne sur ce PC (2 courses a la fois) : toi, JAMAIS plus de 2 courses a la fois. Ne lance aucun test de ml/evolution/tests, ne touche pas a ml/evolution/banc/.
- Tu ne modifies RIEN dans ml/evolution/, ml/bot/, ml/reel/, code/, VERSION PRINCIPALE/ (la vague compare le code a son plan : un octet change l'arrete). Tout ce que tu ecris va dans ml/ecurie/etude/avant-le-bord/mesures/ (outils, sorties). Pour etendre le diagnostic, COPIE course-diag.js et pilote-diag.js dans ce dossier et modifie les copies.
- Piege Git Bash : ne passe jamais a node un chemin qui commence par /c/ ; chemins relatifs au depot ou C:/Users/….
- Ne committe rien. Depot public : aucun nom de machine, aucune adresse, aucune cle dans un fichier.
- Chaque chiffre a sa source (un fichier de sorties). Dis ce que tu n'as pas pu savoir. Petits nombres : donne toujours les effectifs, pas seulement des pourcentages.
`

phase('Mesurer')
const mesure = await agent(`ROLE : MESUREUR.
${COMMUN}
A FAIRE, DANS L'ORDRE
0. LE PALIER (aucune course) : lis dans code/ (gameplay, moteur, maps/niveaux) et ml/reel comment le palier du jeu monte : avec la distance, le temps, l'argent, autre chose ? et comment la vitesse de la caisse et la vitesse du jeu (vitMult ou son equivalent) dependent du palier. Cite fichiers et lignes. Question a trancher : un pilote qui va plus vite monte-t-il de palier plus tot ? Un pilote qui coupe la nitro perd-il du palier mecaniquement ?
1. L'OUTIL : etends la copie du diagnostic pour garder, a chaque vue AU SOL : le volant demande par le pilote et le volant reellement applique par la main si on peut le lire, la nitro demandee, virage (vSure, rayon, marge de vitesse, ce que yeux.js donne), vitMult, lacetRoute, lacetMax (ou leurs equivalents : cherche les noms exacts dans yeux.js / modele.js / jeu-reel.js), tenue, la position laterale, la vitesse, le palier, le manche. Si un champ n'existe pas, dis-le. PREUVE obligatoire avant toute mesure : sur 4 graines (une par map a decor), la course avec ton diagnostic a la meme empreinte de course, de vues et de touches que sans diagnostic (comme mesurer.js --preuve) ; et l'empreinte des 40 courses rejouees est celle de la mesure d'avant (le pilote c0025 n'a pas change de conduite depuis ; si une empreinte differe, ARRETE-TOI et rends ce constat : c'est plus important que la suite).
2. LA PREDICTION DE LA VILLE, ECRITE AVANT DE JOUER : ecris mesures/prediction-ville.md AVANT de lancer les 16 courses de ville neuves : la definition exacte de « cote borde » / « cote ouvert » (celle de concepteur-libre/cote-borde.js, sans la retoucher), la prediction (« au moins trois fois plus de morts par sortie voulue cote borde que cote ouvert »), ce qui la confirmerait, ce qui la refuterait, et la puissance : avec 16 courses, combien de sorties voulues et de morts attend-on, et quelle chance de voir un rapport de 3 s'il est vrai (calcule-le, meme grossierement). Les graines neuves : 3963000 + 37 × i pour i = 400 a 415 (verifie qu'aucune n'a deja servi dans sortie-preparee/sorties).
3. JOUER (2 a la fois) : les 40 courses de la mesure d'avant (memes graines, memes cartes tenues, tmax 180) avec le diagnostic etendu ; puis les 16 courses de ville tenue neuves.
4. ANALYSER (scripts dans mesures/, sorties en .txt et .json) :
   a. VITESSE OU PALIER : avec vitMult et le palier a chaque vue, la vitesse 1,5 s avant le decollage separe-t-elle encore les morts des poses une fois le palier (ou vitMult) retire ? Utilise la vitesse relative a la vitesse sure du virage (v / vSure) si elle existe : les morts depassent-ils la vitesse sure, depuis quand, de combien ? (c'etait LA grandeur nommee par l'etude : dis franchement si elle separe.)
   b. LE VOLANT : dans la derniere seconde avant chaque decollage subi, le volant applique etait-il deja a fond vers l'interieur (la caisse est emportee malgre le pilote), ou le pilote braquait-il vers le bord, ou ne braquait-il pas ? Effectifs morts / poses.
   c. LE FREIN : dans les 2 s avant les decollages mortels, a combien de vues le volant est-il sous 0,35 (frein possible sans drift) ? Combien de morts ont au moins 0,5 s continues de frein possible entre 2 s et 0,6 s avant ?
   d. LE VIRAGE : les morts suivent-elles une entree de virage (courbure qui monte) ? de quel cote sort la caisse par rapport au virage (exterieur / interieur) ?
   e. LA VILLE : sur les 16 courses neuves SEULES, puis sur l'ensemble, sorties voulues cote borde / cote ouvert, morts de chaque cote, vrais raccourcis et sorties du dessous separes ; la prediction est-elle confirmee, refutee, ou indecise ?
   f. Ce que tu vois d'autre d'important et que personne n'a demande.
Rends un rapport (2 000 mots au plus) : le palier (point 0), la preuve, les effectifs, les tableaux a-e, et pour finir « Ce que cela change » : pour plafOn (ralentir), pour le frein, pour ouvertOn, et pour l'idee inverse (aller plus vite sur decor comme les joueurs). Liste tes fichiers.`, { label: 'mesurer A et C', phase: 'Mesurer', model: 'opus' })

phase('Relire')
const relu = await agent(`ROLE : RELECTEUR ADVERSE puis REDACTEUR de la suite de l'etude.
${COMMUN}
LE RAPPORT DU MESUREUR (par defaut, une affirmation non retrouvee est fausse) :
${mesure || '(aucun rapport : regarde ml/ecurie/etude/avant-le-bord/mesures/ et dis ce qui manque)'}

A FAIRE
1. Verifie la PREUVE d'identite (relis les empreintes toi-meme dans les fichiers ; ne rejoue une course que si un doute le demande, 2 a la fois au plus) et que mesures/prediction-ville.md a bien ete ecrit AVANT les courses de ville (dates des fichiers) et n'a pas ete retouche apres.
2. Refais avec TES scripts (mesures/relecteur/) les tableaux a (vitesse ou palier, v / vSure), b (volant), c (frein), e (ville). Compte combien de decoupages ont ete regardes et dis ce que le hasard donnerait (permutations a carte egale). Cherche les biais : decollages doubles, courses coupees a 180 s, vues manquantes juste avant le decollage, definition qui arrange.
3. Verifie le point 0 (comment le palier monte) dans le code, lignes citees.
4. Ecris la suite dans ml/ecurie/etude/avant-le-bord/LISEZ-MOI.md : un § 11 « Les mesures A et C (28/11/2026) », dans le ton du reste (jury qui ne code pas, phrases courtes, chaque chiffre avec son fichier, effectifs), avec TA version quand elle differe de celle du mesureur (et dis-le) ; mets a jour le tableau des fichiers (§ 10) et le point 8 de « En une minute ». N'ecris AUCUNE decision : finis par « Ce que la session principale doit trancher » (cinq lignes au plus). Ne touche pas au § 9.
Rends : ce qui tient, ce qui tombe, les chiffres cles (effectifs), et les cinq lignes a trancher.`, { label: 'relire et ecrire', phase: 'Relire', model: 'opus' })

return { mesure, relu }