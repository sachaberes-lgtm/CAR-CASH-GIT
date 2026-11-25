Tu travailles dans C:\Users\sacha\code\CASH-CAR-bots-ecurie, branche bots-ecurie (verifie avec git branch --show-current avant chaque commit). Tu fais l'ETAPE C, premier temps : ECRIRE LE PREMIER PILOTE.

A LIRE D'ABORD : ml/ecurie/ETAPES.md (la section « OU ON EN EST »), ml/ecurie/PLAN.md, ml/bot/README.md (§ 2 a 3.8 : la vue, le radar, les gestes, le profil), ml/ecurie/CONSIGNES.md, ml/ecurie/etude/*.md (surtout morts.md, vol.md, conduite.md, economie.md, bot-actuel.md), et les cerveaux existants ml/bot/reference.js et ml/bot/essai-main.js.

CE QUE TU ECRIS : ml/ecurie/pilote.js, UN cerveau a profil (`module.exports={nom, profil, decide(vue, memoire)}`), modele de main `clavier` (le profil est celui que la boucle gardera fixe ensuite : choisis-le avec soin, la boucle payante ne pourra plus le changer). Il est ecrit POUR sa main (temps de reaction, volant par coups : anticiper, ne pas corriger a la derniere image) et il se sert du radar des yeux v2 : en vol, choisir le rayon dont l'issue est une pose propre ; au sol, tenue et sorties, vitesse sure avant les virages, ligne parfaite, nitro demandee la ou elle sert (les joueurs l'ont allumee 60 % du temps), pieces et plaques. En tete du fichier, un commentaire qui dit sa strategie en clair.

LE BUT A BATTRE : le bot de reference AVEC le relief du canyon, version allegee : palier median 8,5, meilleur 18 (ml/bot/results/note-reference-allege.json).

COMMENT TRAVAILLER (une commande ne doit jamais depasser 9 minutes : l'outil Bash coupe a 10) :
- essai rapide : cd ml/bot && node noter.js ..\ecurie\pilote.js --regime allege --coeurs 4 --tmax 300 --graines 4   (environ 4 minutes ; lis l'aide de noter.js) ;
- note de tri : --graines 6 --tmax 600 en deux fois si besoin (--depart pour decaler les graines, lis l'aide) ou en tache de fond : lance-la detachee avec sa sortie dans un fichier (par exemple `node noter.js ... > ..\ecurie\agents\note-pilote.txt 2>&1 &`) puis relis ce fichier avec des commandes courtes d'attente (`node -e "setTimeout(()=>{},480000)"`) ;
- lis les morts : node autopsie.js (lis son aide) ;
- jamais plus de 4 courses du jeu a la fois.
Fais trois a cinq tours (ecrire, noter, lire les morts, corriger). Garde la meilleure version. Ne lance PAS la note de 20 graines de 900 s : la boucle s'en charge en partant de ton pilote.

LE CONTRAT : rien dans code/ ni dans « VERSION PRINCIPALE/ ». Ne modifie pas ml/bot ni ml/labo (si tu y trouves un defaut, ecris-le dans ton rapport). A la fin : cd ml/bot && node -e "require('./piloter')" ne suffit pas : verifie que la boucle accepte ton pilote avec l'essai a blanc (0 €) : cd ml/ecurie && node boucle.js --a-blanc --tours 1 --candidats 2 --depuis pilote.js   (il doit aller au bout).

A LA FIN : mets ml/ecurie/ETAPES.md a jour (l'etape C commencee : le pilote, son profil, sa strategie, ses chiffres de tri contre la reference sur les memes graines et la meme duree, ce qui le tue encore), puis valide dans git (git add par nom : ml/ecurie/pilote.js, ml/ecurie/ETAPES.md, et les petites notes json utiles de ml/bot/results ; jamais les gros fichiers -parties.json), message en francais commencant par « BOTS-ML etape C : le premier pilote — » et finissant par « — le jeu ne change pas ».
