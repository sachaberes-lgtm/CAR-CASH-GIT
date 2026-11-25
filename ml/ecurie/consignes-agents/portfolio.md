Tu travailles dans C:\Users\sacha\code\CASH-CAR-bots-ecurie, branche bots-ecurie. Tu ecris LA PAGE PORTFOLIO de « l'ecurie » : le chantier ou des bots apprennent a jouer a CASH CAR (le jeu de Sacha, un runner 3D three.js) au niveau des humains, ameliores par Claude via l'API. Commandes courtes seulement : aucune course du jeu, aucun appel payant. Ne touche a rien d'autre que ml/ecurie/portfolio/.

Le lecteur : un recruteur ou un jury technique, qui veut comprendre en 2 minutes ce qui est ingenieux, et pouvoir creuser. Le ton : precis, sobre, des chiffres, pas de superlatifs. En francais.

LES SOURCES (tout chiffre doit en venir ; rien d'invente) : ml/ecurie/PLAN.md, ETAPES.md, CONSIGNES.md, etude/*.md ; ml/bot/README.md (la vue, le radar, la main, le contrat, le determinisme) ; ml/labo/README.md ; node ml/labo/labo.js ; ml/labo/journal/*.jsonl (cerveaux, validations, depenses) ; ml/bot/results/*.json (notes, justesse, appuis) ; ml/ecurie/agents/*.md (les rapports des agents) ; ml/ecurie/comptes-rendus/ ; git log --oneline -- ml (l'histoire).

CE QUE LA PAGE MONTRE (ml/ecurie/portfolio/index.html, une seule page autonome, HTML + CSS + SVG a la main, aucun script exterieur, mode clair et sombre, lisible sur telephone) :
1. En tete : une phrase qui dit le projet, et 4 chiffres (bots vs joueurs : palier median ; courses jouees ; euros d'API depenses ; rejeux exacts).
2. L'ARCHITECTURE en un schema SVG : le vrai jeu sans ecran (ml/reel) -> les yeux (la vue, le radar qui rejoue le vol image par image) -> le cerveau (bac ferme, 10 decisions/s) -> la main (profil humain : reaction, coups de volant, erreurs, hasard a graine) -> le jeu ; et autour, la boucle : autopsie des morts -> Claude ecrit des variantes -> tri sur 6 graines -> note sur 20 -> validation sur 20 graines NEUVES -> le labo (journal, arbre, rejeux).
3. LES IDEES TECHNIQUES qui comptent, une carte chacune, avec le chiffre qui la prouve : le determinisme (meme graine = meme course, l'empreinte a7b3171768ca, les rejeux exacts) ; le radar (issue du vol prevue juste N fois sur N, places au centimetre) ; la main humaine mesuree contre les vrais joueurs (tableau joueurs / main) ; le juge humain-ou-bot (AUC) ; le simulateur rendu fidele (le canyon sans parois decouvert et corrige : la note de depart 9/25 -> 8,5/18) ; la validation sur graines neuves (le surapprentissage evite : citer une variante de Sonnet a 13 au tri qui ne tient pas, 10,5 contre 11) ; le budget tenu (plafond general, journal des depenses).
4. L'ARBRE DES CERVEAUX : un petit arbre SVG redessine depuis ml/labo/journal (les noeuds, les generations, les champions), et 3 ou 4 « raisons » de variantes ecrites par Claude, citees telles quelles (courtes), avec leur verdict.
5. CE QUI N'A PAS MARCHE (honnete, c'est ce qui rend la page credible) : le calibrage sans gagnant clair (6 variantes par modele, dans le bruit), la main encore distinguable par le juge, ce qui tue encore le pilote.
6. Les chiffres du pilote contre la reference et contre les joueurs, en tableau.
7. Une video : la balise <video> qui pointe vers ../../labo/videos/c0003-g910629.webm (relatif), avec une legende.
8. En pied : la pile (Node, three.js, l'API Anthropic, Claude Code), et la date.

Valide dans git le seul dossier ml/ecurie/portfolio/ (git add par nom), message « BOTS-ML : la page portfolio de l'ecurie — le jeu ne change pas ».
