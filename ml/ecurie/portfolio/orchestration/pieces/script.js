export const meta = {
  name: 'pieces-des-joueurs',
  description: 'D ou viennent les pieces des joueurs, et pourquoi c0025 en ramasse moitie moins par minute : deux lecteurs, un concepteur des leviers (Fable), un relecteur adverse qui ecrit. Aucune course.',
  phases: [
    { title: 'Compter', detail: 'les pieces des joueurs et celles de c0025, source par source, minute par minute' },
    { title: 'Concevoir', detail: 'les leviers pour ramasser comme un joueur (Fable)' },
    { title: 'Relire', detail: 'recomptage adverse et redaction' },
  ],
}

const COMMUN = `
CONTEXTE (depot C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie, branche bots-ecurie). Lis d'abord ml/ecurie/etude/echelle-de-bots/LISEZ-MOI.md (en entier : §§ 2, 3 et la decision § 11) et ml/ecurie/etude/avant-le-bord/LISEZ-MOI.md (§ 4). Le fait a expliquer : le palier du jeu = les pieces ramassees en course (30 seuils, code/gameplay/pickups-fruits.js ENGINE_TIERS) ; le pilote c0025 meurt a peu pres aussi tot que les 2 joueurs enregistres mais ramasse MOITIE MOINS de pieces par minute (227 contre 416 ; a duree egale 527 contre 1 003). D'ou vient l'ecart ?
Sources : les parties des joueurs ml/bot/etalon/*.json (lues par ml/bot/mesures.js : partiesJoueurs, les evenements 'piece', les figures, les vols, la nitro, la vitesse ; code/moteur/enregistreur-jeu.js dit ce qui est enregistre) ; pour c0025 : ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl (1 250 lignes, bras « depart » = c0025, 96 courses ; champs pieces, pieces_ramassees, mesures…), les 40 traces vue par vue de ml/ecurie/etude/sortie-preparee/sorties/lignes/*.jsonl.gz (evenements du jeu compris), ml/ecurie/agents/*/note-*.json s'ils existent ; l'economie des pieces : ml/ecurie/economie.md, ml/ecurie/humains.md, code/gameplay/pickups-fruits.js, code/gameplay (figures, ramassage, aimant, combo, frenesie, flow), code/economie.
REGLES DURES : AUCUNE COURSE, aucun test de ml/evolution/tests (le PC est pris). De petits scripts node qui LISENT, oui. Tu n'ecris que dans ml/ecurie/etude/echelle-de-bots/pieces/ (un sous-dossier a ton role). Rien d'autre n'est modifie. Jamais de chemin /c/… passe a node. Ne committe rien. Depot public : aucun nom de machine, adresse ou cle. Chaque chiffre a sa source et son effectif (14 parties de joueurs seulement : donne les fourchettes, dis ce qui ne se demontre pas). « On ne sait pas » est une reponse.
`

phase('Compter')
const [joueurs, bot] = await parallel([
  () => agent(`ROLE : COMPTEUR DES JOUEURS. Decompose les pieces des 14 parties de joueurs, partie par partie et minute par minute : (1) par SOURCE : pieces ramassees sur la route (une par une), pieces en l'air, figures posees (combien de figures, combien de pieces chacune), bonus (frenesie, flow, combo, aimant, contrats, raccourcis payes ou qui rapportent, seconde chance), tout autre gain : lis dans code/ ce qui fait monter coinsGot et retrouve chaque source dans les enregistrements ; (2) par CAUSE MECANIQUE : km parcourus par minute (la vitesse), pieces par km de route, part du temps en l'air, vols par minute, figures par vol, nitro ; (3) l'effet du palier lui-meme : le debit monte-t-il parce que le moteur va plus vite (plus de km) ou parce que les pieces sont plus denses plus loin ? Rends les tableaux, et « la recette d'un joueur » : sur 100 pieces d'un joueur, combien viennent de chaque source, a la minute 1, 2, 3 et au-dela.
${COMMUN}
Rapport en francais, 1 400 mots au plus, tableaux, effectifs.`, { label: 'compter:joueurs', phase: 'Compter', model: 'opus' }),
  () => agent(`ROLE : COMPTEUR DU BOT. Decompose les pieces de c0025 de la MEME facon que pour un joueur (lis ml/bot/mesures.js pour utiliser les memes definitions que l'etalon) : (1) par SOURCE : pieces de la route, pieces en l'air, figures posees (c0025 fait-il des figures ? combien par vol ? combien rapportent-elles ?), bonus (frenesie, flow, combo, aimant, raccourcis), d'apres les lignes du banc (96 courses du bras « depart ») et les 40 traces vue par vue (evenements du jeu) ; (2) par CAUSE MECANIQUE : km par minute, pieces par km, part du temps en l'air, vols par minute, figures par vol, nitro, a la minute 1, 2, 3 et au-dela ; (3) ce que le pilote FAIT pour les pieces : lis ml/evolution/modele.js (la ligne vers les pieces, piecesLoin, l'avidite, les genes qui reglent le ramassage et les figures, leurs bornes et valeurs chez c0025 : ml/evolution/genome.js) et ml/bot/yeux.js (quelles pieces la vue montre : sur la route, en l'air, a quelle distance) : quelles pieces le pilote voit-il sans les viser, lesquelles ne voit-il pas du tout ? ; (4) dans les 13 bras du banc des genes, un bras change-t-il le debit de pieces (pieces par minute par bras, avec l'intervalle) ? Rends les tableaux et « la recette de c0025 » : sur 100 pieces, combien de chaque source.
${COMMUN}
Rapport en francais, 1 400 mots au plus, tableaux, effectifs.`, { label: 'compter:bot', phase: 'Compter', model: 'opus' }),
])
const FAITS = `===== LES JOUEURS =====\n${joueurs || '(pas de rapport)'}\n\n===== LE BOT c0025 =====\n${bot || '(pas de rapport)'}`

phase('Concevoir')
const leviers = await agent(`ROLE : CONCEPTEUR DES LEVIERS. Deux compteurs viennent de decomposer les pieces des joueurs et celles de c0025. A toi de dire, source par source, ce qui fait l'ecart de moitie, et par quoi le combler pour que le pilote ramasse COMME un joueur (pas plus : le but est la ressemblance et le palier d'un joueur).
${COMMUN}
LES FAITS (verifie dans les fichiers ce sur quoi tu t'appuies ; relance leurs scripts si un chiffre te semble douteux) :
${FAITS}

A RENDRE : (1) le tableau de l'ecart : pour chaque source et chaque cause mecanique, joueurs / c0025 / part de l'ecart total expliquee (la somme doit faire le total ; dis ce qui reste inexplique) ; (2) pour chacune des deux ou trois plus grosses parts : le levier — un gene EXISTANT a regler (nom, bornes, valeur de c0025 ; dans ce cas la selection ou une greffe peut le faire sans code : dis quel ensemble de greffe ecrire dans ml/evolution/config.json "greffes", qui n'accepte que des interrupteurs, des choix et des entiers) ou une regle NOUVELLE (pseudo-code sur les champs qui existent dans la vue, dans la forme du contrat ml/evolution/notes/genes-v4.md : eteinte a la naissance, muette eteinte, un compteur) ; ce que cela risque (mourir plus tot ? la figure qui tue ?) ; (3) ce que la mesure E (ml/bot/ressemblance.js) voit deja de cet ecart et ce qu'elle ne voit pas (faut-il une mesure « pieces par minute a duree egale » dans la note ?) ; (4) la premiere experience a jouer au banc v2 (ml/evolution/banc/README.md), critere ecrit d'avance (par exemple le critere « mesure » ou « palier »), nombre de graines ; (5) ce qui te ferait abandonner. Sois dur : dis si l'ecart vient surtout d'une chose que le pilote ne PEUT pas faire avec ses yeux et sa main. 1 500 mots au plus.`, { label: 'concevoir:leviers', phase: 'Concevoir' })

phase('Relire')
const relu = await agent(`ROLE : RELECTEUR ADVERSE puis REDACTEUR.
${COMMUN}
LES FAITS DES DEUX COMPTEURS :
${FAITS}

LES LEVIERS PROPOSES :
${leviers || '(pas de proposition)'}

A FAIRE : (1) refais avec TES scripts (pieces/relecteur/) le tableau de l'ecart, source par source : les deux decompositions utilisent-elles les MEMES definitions pour les joueurs et pour le bot (sinon l'ecart est un artefact) ? la somme des sources fait-elle le total des pieces de chaque partie (a combien pres) ? l'ecart tient-il a duree egale et a palier egal (le moteur plus rapide des joueurs qui durent) ? combien repose sur les 2 parties a seconde chance ? (2) pour chaque levier : le gene existe-t-il avec ces bornes, la regle lit-elle des champs reels, la greffe proposee est-elle acceptee par ml/evolution/greffes.js (lis lireGreffes) ? (3) ecris ml/ecurie/etude/echelle-de-bots/pieces/LISEZ-MOI.md dans la forme de ml/ecurie/etude/echelle-de-bots/LISEZ-MOI.md (jury qui ne code pas, « en une minute », phrases courtes, chaque chiffre avec son fichier et son effectif, ta version quand elle differe et tu le dis, ce qu'on ne sait pas). N'ecris aucune decision : finis par « Ce que la session principale doit trancher » (cinq lignes au plus). Rends : ce qui tient, ce qui tombe, le tableau de l'ecart final, et ces cinq lignes.`, { label: 'relire et ecrire', phase: 'Relire', model: 'opus' })

return { relu, leviers }