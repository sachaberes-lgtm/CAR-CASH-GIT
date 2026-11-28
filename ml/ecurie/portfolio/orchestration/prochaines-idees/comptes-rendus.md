# Les prochaines idées pour le banc des gènes : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `prochaines-idees-pour-le-banc` (wf_b84c1055-e3c), lancée par la session principale (Claude Fable).
- Agents : 11, tous du modèle claude-opus-5-5.
- Durée : 32 min ; jetons consommés par les agents : 2 432 325 (2,43 millions) ; appels d'outils : 451.
- Message de fin du script : « 6 lecteurs sur 6 ont rendu 31 candidats ; 36 defauts releves par 3 relecteurs ».
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. lecteur « morts » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre (phase « Extraire »)
2. lecteur « ressemblance » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre (phase « Extraire »)
3. lecteur « vol et yeux » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre (phase « Extraire »)
4. lecteur « défauts » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre (phase « Extraire »)
5. lecteur « boucle payante » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre (phase « Extraire »)
6. lecteur « génome et têtes » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre (phase « Extraire »)
7. classeur : fusionne les candidats, retire les doublons, classe et écrit le dossier (phase « Classer »)
8. relecteur « chiffres » : rouvre chaque source citée et recontrôle chaque chiffre (phase « Attaquer »)
9. relecteur « code » : vérifie que chaque idée peut s'écrire dans le code du pilote (phase « Attaquer »)
10. relecteur « mesure » : vérifie que chaque idée peut se mesurer sur le banc des gènes (phase « Attaquer »)
11. correcteur : reprend le dossier d'après les trois attaques (phase « Reprendre »)

## 1. lire:morts

*Rôle : lecteur « morts » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre. Phase : Extraire.*

### Résumé

J'ai lu ml/ecurie/etude/morts.md (rapport du 24/11, en partie périmé : les yeux voient maintenant le décor en vol, les couloirs, l'arrêt et le raisin, ml/bot/yeux.js l.155-162 et l.975), ml/bot/autopsie.js, ml/ecurie/etude/defauts-confirmes.md (§ 2, 6 et 24 pour les morts), ml/ecurie/PASSATION.md (« Défauts connus »), ETAPES.md (soirée et nuit du 26/11), PROPOSITIONS.md (enquêtes 1 et 2), README des yeux et pilote-voltige.js. J'ai compté moi-même, avec deux petits scripts de lecture : (a) 103 courses de c0025 dans les .jsonl (55 du bras « depart » du banc, lignes complètes, plus 48 du coffre, contrôles compris) ; (b) les 20 parties complètes de c0025 avec leurs événements, dans ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json (même sha que pilote-voltige.js, c3e8b819… ; mêmes causes que ml/bot/results/note-pilote-voltige-allege.json) ; (c) les parties des joueurs, dans ml/bot/etalon (18 morceaux après dédoublonnage, 44,8 min, 18 morts).

LES CAUSES DE c0025 (103 courses) : air 23 (22 %), tour 18 (17 %), roche 18 (17 %), vide 16 (16 %), paroi 13 (13 %), pic 11 (11 %), canyon 3, glace 1. Arrêt : 0. Décor 62 %, jauge vide ou chute (air+vide) 38 %. Par durée : sous 40 s, 18 courses (palier 2,3), dont 11 air ou vide ; de 40 à 70 s, 15 (palier 4,3), dont 11 décor ; de 70 à 120 s, 29 (palier 5,3) ; de 120 à 200 s, 32 (palier 8,4) ; au-delà, 9 (palier 11,8). Par palier : du palier 1 au 3, 12 morts sur 20 sont air ou vide ; ensuite le décor domine (paroi 10 sur 43 du palier 4 au 6). 32 % des courses finissent avant 70 s (les joueurs au clavier : 4 sur 10, realisme.md § 1.7). Seconde chance prise dans 4 courses sur 103. Ce que veut dire chaque cause (morts.md, et ml/bot/yeux.js l.523-531) : air = jauge d'air vide (6 s, 5 s dans l'espace) ; vide = 120 m sous la piste, ou perdu sous la route plus de 2,2 s ; roche et glace = grotte (ou roches de l'orbite) ; pic = jade ; tour = ville ; paroi = mur du canyon, mur de couloir au sol, ou géants de l'orbite ; canyon = relief du canyon.

TROIS CHOSES À RETENIR.
1) Toutes les morts arrivent en vol après une sortie par le bord : 22 sur 22 dans les 20 parties (21 par le bord, 1 saut). Elles se rangent en deux familles de même taille. D'un côté, 8 morts sur 22 surviennent moins d'une seconde après la sortie, contre le décor : grotte 5, canyon 2, ville 1. De l'autre, 7 sur 22 sont des vols perdus de 5 à 6 s qui finissent jauge vide : espace 3, nuages 4. Le temps médian entre la sortie et la mort est de 2,5 s (les joueurs : 3,65 s).
2) Le bot n'est pas pire que les joueurs partout. Il est pire : à la grotte, sur les sorties ordinaires (15,4 morts pour 100 contre 2,3) ; dans l'espace (4,8 morts pour 100 décollages contre 1,1) ; en ville (8,8 contre 4,5). Il ne l'est pas : sur les re-sorties qui suivent une pose (8,9 morts pour 100 contre 6,1) ; au canyon (33 contre 30 pour 100 : tout le monde y meurt). Sur la jade, il ne meurt jamais : 0 mort en 9,1 min, contre 5,0 morts par 10 min chez les joueurs. 8 morts sur 22 suivent une re-sortie, mais ce n'est pas là que le bot se distingue des joueurs.
3) Les yeux annoncent le bord mortel environ 0,5 s à l'avance (PROPOSITIONS.md, enquête 2, l.111). Pourtant, la seule réponse du pilote au sol est de déplacer sa ligne et de couper la nitro (pilote-voltige.js l.190-212). Il n'a jamais : armé la nitro à la sortie sur une map à décor, freiné ni drifté (ETAPES.md l.431 : « Non essayé : freiner »). Hors pilotage, le plus gros levier sur le palier est la seconde chance : +2,3 paliers de moyenne d'après mon calcul. Mais CONSIGNES.md l.149 l'écarte, c'est une décision pour Sacha.

### Candidats

- Nom : La sortie préparée sur les maps à décor  
  Constat : 8 des 22 morts de c0025 arrivent moins d'1 s après une sortie par le bord, toutes sur des maps à décor : grotte 5, canyon 2, ville 1. Source : mon compte sur ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json, champ ev (decol puis mort). À la grotte, les sorties qui ne sont pas des re-sorties tuent 6 fois sur 39 (15,4 pour 100), contre 1 fois sur 44 chez les joueurs (2,3 pour 100, ml/bot/etalon). Même sens dans PROPOSITIONS.md (enquête 2, l.97) : 5 sorties sur 58 suivies d'une mort dans la seconde, contre 1 sur 44. Au moment de sortir, les joueurs ont la nitro 64 % du temps à la grotte, le bot 12 % (l.98). Le pilote coupe la nitro dès que la route lâche (pilote-voltige.js l.212 : m.nitro=!lache&&…). L'interrupteur bordOn (c0064) ne joue que hors décor (genome.js, PORTAGE). Pourtant les yeux donnent déjà, 1,5 s avant le bord, les rayons rien, versRoute et plane de la sortie (ml/bot/README.md l.190 : vue.sorties.bord).  
  Mécanisme : Sur la grotte, le canyon et la ville, au sol, quand vue.tenue dit que la route lâche et que le bord arrive dans moins de T s, le pilote lit vue.sorties.bord. Si rien et versRoute finissent en choc et que plane se pose ou atteint la lèvre, il garde la nitro jusqu'au décollage et fixe « ensuite » sur la façon plane pour les 0,3 à 0,5 premières secondes du vol. Sinon, rien ne change. Le choix se fait 0,5 s plus tôt qu'aujourd'hui : à présent le pilote ne bascule qu'en vol, après le retard de la main (0,2 à 0,3 s), alors que la caisse touche la roche 0,1 à 0,6 s après la sortie (dans 5 des 9 morts de la grotte : 0,24 · 0,14 · 0,15 · 0,60 · 0,11 s).  
  Où : Un gène dans genome.js (drapeau sortieOn, éteint à la naissance, plus un réel T entre 0,3 et 1,2 s), et le code dans auSol de modele.js. Pas de changement des yeux, de la main ni du simulateur : tous les champs lus existent déjà.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Inconnu. Plafond grossier : les morts immédiates sur décor font 36 % des morts (8 sur 22). Si un tiers était évité, la survie gagnerait environ 14 %. Dans les 103 courses, passer de 70-120 s à 120-200 s fait monter le palier de 5,3 à 8,4 : on peut donc espérer environ un demi-palier, peut-être un, et seulement sur les graines qui passent par ces maps.  
  Effet attendu sur la ressemblance : Probablement meilleur : la nitro au décollage (nitroDecol) est l'une des mesures de l'écart E (mesures des .jsonl), et les joueurs sortent nitro allumée 64 % du temps à la grotte, contre 12 % pour le bot (PROPOSITIONS.md l.98).  
  Déjà essayé : Pas sous cette forme. Proche : « la nitro gardée au bord et quand la route lâche » (nitroBord, toutes maps, sans regarder les rayons) a donné 161 paliers au lieu de 181 sur 24 courses (ETAPES.md, tableau de « La nitro au sol, refaite après la loi de vol corrigée »). Le plané tenu pendant tout le vol (pQ) a donné 12 à 19 morts pour 100 vols (même fichier, nuit du 26 au 27/11). bordOn, hors décor, est en cours au banc. Ici, la nitro n'est armée que si le rayon plane du bord est le seul à survivre.  
  Coût : Petit : une vingtaine de lignes dans auSol et un drapeau. Ensuite un bras de plus au banc des gènes (96 graines). Il se déclenche rarement, donc la comparaison appariée sera fine.  
  Confiance : Moyenne sur le constat : les comptes sont petits (6 morts sur 39 contre 1 sur 44), mais l'enquête 2 trouve le même sens. Faible sur l'effet : je ne sais pas combien de fois le rayon plane du bord dit « pose » quand les autres disent « choc ». Il faudrait les vues gardées de ces sorties, et README.md l.185 rappelle que l'annonce du sol à la grotte a déjà été fausse.
- Nom : Les rayons de vol de secours (vols perdus)  
  Constat : 7 morts sur 22 sont des vols perdus : 5 « air » et 2 « vide », tous de 5,0 à 6,0 s, tous après une sortie par le bord, tous sur l'espace ou les nuages, à 509 à 1 178 km/h au décollage (note-voltige4-t900.json, ev). Dans les 103 courses de c0025, air et vide font 39 morts (38 %), dont 11 des 18 morts survenues avant 40 s. Par décollage, le bot meurt de jauge vide 2 fois plus que les joueurs : 8 fois sur 271 (3,0 pour 100) contre 5 sur 333 (1,5 pour 100). ETAPES.md (nuit du 26 au 27/11, tableau) : vols de plus de 5 s partis du dessus, 3 morts sur 14 pour le bot, 1 sur 11 pour les joueurs. Le radar de vol n'essaie que 10 façons (ml/bot/yeux.js l.765-767) : gauche, droite, cabre, pique et planeCabre seulement sur l'horizon court ; aucun volant intermédiaire, aucun enchaînement (planer puis revenir), aucune façon « vers la tranche ». Or un bump sur la tranche rend 3 s d'air (morts.md, code/gameplay/demi-tour.js:405).  
  Mécanisme : Quand tous les rayons annoncent air, vide ou choc, les yeux tirent une seconde famille de rayons : volant ±0,5 tenu ; plane pendant 0,5 à 1 s puis versRoute ; versRoute avec manche cabre (pour gagner du temps d'air) ; un rayon qui vise la tranche la plus proche pour un bump. Le pilote prend celui qui se pose, ou celui qui finit sur un bump. La tête RAYON de la sélection pourrait ensuite apprendre à les classer.  
  Où : Les yeux, ml/bot/yeux.js (radarVol, la liste des rayons, sous le budget BUDGET.vol), puis les façons correspondantes dans modele.js (FACONS) derrière un drapeau de genome.js. verifier.js et justesse.js sont à repasser.  
  Change ce que voient les yeux : oui  
  Effet attendu sur le palier : Inconnu. Les vols perdus font 32 à 38 % des morts et la majorité des morts avant 40 s (palier moyen 2,3). En éviter la moitié allongerait la survie d'environ 20 %, et c'est là que se trouvent les courses les plus courtes. Mais rien ne prouve qu'un rayon sauveur existait.  
  Effet attendu sur la ressemblance : Inconnu. Les joueurs aussi perdent des vols (5 morts sur 18 en jauge vide) ; n'en perdre que moitié moins resterait dans leur ordre de grandeur.  
  Déjà essayé : Jamais avec de nouveaux rayons. Ce qui a été essayé sur ces vols : la loi « vers la route » corrigée (volAvance, volDemiTour), gardée (ETAPES.md, fin de soirée du 26/11 : 9 morts sur 21 tombés à 3 sur 14) ; le plané tenu (pQ), écarté ; les coups de nitro à l'aveugle, −3 paliers (ETAPES.md l.168) ; changer de façon dès qu'un rayon promet mieux, pire, avec deux morts jauge vide (ETAPES.md l.422).  
  Coût : Gros : il faut toucher aux yeux. Tout est rejoué (verifier.js, justesse.js, empreintes), le temps des yeux grandit en vol, et il faut prévenir Sacha.  
  Confiance : Faible. Les vues de ces vols n'ont pas été gardées : je ne sais pas si une trajectoire vivable existait hors des 10 façons. Il faudrait d'abord des autopsies de ces 7 morts (interdit pendant la mesure en cours), ou rejouer leurs vues avec les rayons proposés.
- Nom : Le drift de sauvetage au bord mortel  
  Constat : C'est la même réserve de morts que la sortie préparée : 8 morts sur 22 moins d'1 s après la sortie, sur décor. Vue par vue (PROPOSITIONS.md, enquête 2, l.111), les yeux disent « LACHE » 0,5 à 0,57 s avant le bord (grotte 910185, canyon 910222), mais la main met 9 à 20 images à obéir et le cap continue de grandir. Au moment de sortir à la grotte, le cap vaut 0,49 rad pour le bot et 0,31 pour les joueurs (l.99). Le jeu offre deux gestes que le pilote n'utilise jamais. Le drift (↓ avec plus de 0,35 de volant) fait tourner la trajectoire 1,15 fois plus et pivoter le nez jusqu'à 0,47 rad (ml/ecurie/etude/conduite.md l.58). Le frein (↓ seul) donne −1,5·acc9 (l.60). Le bot drifte 0,1 % du temps au sol (realisme.md § 1.5).  
  Mécanisme : Sur une map à décor, quand vue.tenue annonce le bord dans moins de T s, que le bord est mortel ou que sorties.bord dit choc, et que le volant est déjà à fond vers la route, le pilote ajoute manche +1 (↓). La caisse part en drift et tourne plus serré. Si le volant est faible, le même ↓ freine. On relâche dès que la route tient de nouveau.  
  Où : Un gène dans genome.js (drapeau et seuil T), le code dans auSol de modele.js. La main sait déjà le faire : manche au sol, drift « flèche d'abord, ↓ ensuite » (ml/bot/doigts.js l.473-481, README.md l.330 et 493).  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Inconnu. Limite : vue.tenue est une estimation « sans drift » (README.md l.104), donc les yeux ne prévoient pas l'effet du drift.  
  Effet attendu sur la ressemblance : Neutre à faible : un drift rare, et seulement en urgence. Sacha au clavier drifte 0,1 % du sol, Léo 15,8 % (realisme.md § 1.5). Les touches ↑ ↓ des joueurs ne sont pas enregistrées (realisme.md l.393) : on ne sait pas s'ils freinent.  
  Déjà essayé : Jamais sur pilote-voltige : « ni drift, ni frein » (pilote-voltige.js l.21), « Non essayé : freiner » (ETAPES.md l.431). Sur l'ancien pilote, c0005 (Haiku, 25/11) freinait avant un virage trop rapide : 11 · 20 · 215 s, exactement le parent (ETAPES.md l.700) ; ce frein ne s'est probablement presque jamais déclenché. Proche : viser au sol depuis l'écart à venir (faire-pY) a donné 180, 192 et 177 paliers contre 193, sans effet (ETAPES.md, nuit du 26 au 27/11).  
  Coût : Petit : quelques lignes et un drapeau. À juger au banc, en le séparant bien de la sortie préparée (deux bras distincts).  
  Confiance : Faible. Le mécanisme vient des règles du jeu (×1,15) ; son effet sur ces sorties n'a jamais été vu.
- Nom : La seconde chance prise plus tôt (décision de Sacha)  
  Constat : Le profil prend la seconde chance seulement à partir du palier 12 (modele.js l.50 : chance:{prend:1,palierMin:12}). c0025 ne la prend que dans 4 courses sur 103. Le jeu la donne une fois par partie, après 20 s de course, gratuite dans l'app, au prix d'une pub sur le web, et elle coûte un palier de moteur (code/gameplay/seconde-chance.js l.91-102 ; morts.md). Mon calcul sur les 103 courses : on rejoue une seconde vie à partir du seuil du palier perdu (SEUILS de ml/bot/mesures.js l.14), avec les pièces d'une autre course de c0025. Le palier moyen passerait de 6,16 à 8,42, soit +2,46 en moyenne pour les courses concernées.  
  Mécanisme : Le pilote ne change pas. La main touche CONTINUER à chaque première mort après 20 s, au lieu d'attendre le palier 12 : palierMin passe de 12 à 1 ou 2, ou devient un gène entier de 1 à 30.  
  Où : Le PROFIL dans modele.js (lu par doigts.js l.500, qui ne change pas), ou un gène entier dans genome.js. Rien dans les yeux ni le simulateur : la seconde chance y tourne déjà (des courses à 2 morts existent dans les .jsonl).  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Environ +2,3 paliers en moyenne d'après mon calcul. C'est une approximation : la seconde vie est supposée aussi longue qu'une vie neuve ; en vrai elle part avec un moteur plus fort, 3 s d'invulnérabilité et 2 s de nitro offerte, mais sans chaîne ni pouvoirs.  
  Effet attendu sur la ressemblance : Pire pour un juge qui regarde le compte : les joueurs la prennent dans 2 parties sur 10 au clavier (realisme.md § 1.7), et l'ancien pilote qui la prenait 7 fois sur 12 était reconnu par là (realisme.md l.11). L'écart E ne la regarde pas.  
  Déjà essayé : Volontairement écartée : CONSIGNES.md l.149, « prendre la seconde chance à chaque mort n'est pas mieux conduire » ; la boucle refusait toute variante qui change le profil (ETAPES.md l.513-514). palierMin 12 a été choisi pour imiter les deux joueurs (paliers 14 et 28).  
  Coût : Petit à écrire. Gros comme décision : cela change le sens du palier mesuré.  
  Confiance : Moyenne sur le signe et l'ordre de grandeur, faible sur le chiffre exact. Surtout, ce n'est pas un changement de conduite : c'est à Sacha de dire si un palier gagné ainsi compte.
- Nom : Le cap de rentrée borné quand le contact approche  
  Constat : 8 des 22 morts de c0025 suivent un décollage survenu moins de 0,8 s après une pose (note-voltige4-t900.json). À la grotte, un tiers des sorties sont en chaîne, contre 14 % chez les joueurs (PROPOSITIONS.md, enquête 2, l.101). La loi « vers la route » vise jusqu'à 0,6 rad au moment du contact ; elle est collée à cette borne dans 37 % des poses (l.163, l.177). Mais par re-sortie, le bot ne meurt guère plus que les joueurs : 8,9 morts pour 100 contre 6,1 (mon compte).  
  Mécanisme : Dans versRoute, quand le rayon tenu annonce un contact dans moins de 0,9 s, le cap visé est borné à 0,3 rad au lieu de 0,6 (enquête 2, l.121-124). La caisse doit alors prendre son cap plus tôt.  
  Où : Un gène dans genome.js (drapeau et deux réels : capRentree, rentreeT), le code dans versRoute de modele.js. Les rayons versRoute des yeux jouent toujours l'ancienne loi.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Probablement petit : les re-sorties ne sont pas là où le bot est pire que les joueurs.  
  Effet attendu sur la ressemblance : Possible gain sur la glisse après la pose (0,38 rad pour le bot, 0,13 pour les joueurs, PROPOSITIONS.md l.12) et sur les sorties en chaîne. Non mesuré.  
  Déjà essayé : Pas sous cette forme, et ce n'est pas l'un des cinq gestes du banc. Proches et décevants : volRetour 0,8 a donné 186 paliers contre 193 (ETAPES.md, fin de soirée du 26/11) ; pX2, pX3 et pQ2 ne changent pas l'angle d'arrivée (0,48 à 0,51 contre 0,50, PROPOSITIONS.md l.41 et l.86) ; pZ, qui bornait le cap une fois au-dessus de la dalle : 193, 186, 223 et 163 (ETAPES.md, nuit du 26 au 27/11).  
  Coût : Petit : un drapeau et deux réels, puis un bras au banc.  
  Confiance : Faible. Le vérificateur de l'enquête 1 a mesuré qu'un cap visé plus doux ne se transmet pas à l'angle d'arrivée. À garder derrière les gestes lacheOn et suitOn, déjà au banc, qui visent la même chose.

### Trous

- Le détail de chaque mort (la map, le temps depuis la sortie, la pose d'avant) n'existe que pour 20 courses de c0025 (note-voltige4-t900.json, 22 morts). Les lignes .jsonl du banc et du coffre ne donnent ni la map ni le moment : sur les 103 courses, je n'ai que les causes. La part « mort moins d'1 s après la sortie » (8 sur 22) repose donc sur 22 morts.
- Le banc des gènes est en cours (55 graines sur 96 lues pour le bras depart). Ses causes changent avec les graines : tour fait 27 % des morts du départ au banc, 6 % au coffre ; paroi et canyon 25 % au coffre, 7 % au banc. Les parts par cause dépendent beaucoup des maps tirées.
- Les morts « tour » en ville (17 % des morts sur les 103 courses ; 8,8 morts pour 100 décollages contre 4,5 chez les joueurs) : je n'ai pas trouvé pourquoi. Les rayons voient les tours (villeHeurt). Il faudrait des autopsies, interdites pendant la mesure.
- Pour les 7 vols perdus : aucune vue gardée. Je ne sais pas si un rayon sauveur existait hors des 10 façons du radar, ni si un bump était à portée.
- L'étalon des joueurs est petit : 18 morceaux, 18 morts, 2 joueurs ; les fichiers contiennent des parties en double, que j'ai écartées. Les touches ↑ ↓ ne sont pas enregistrées : on ne sait pas si les joueurs freinent avant le bord.
- Je n'ai pas vérifié que les trois sha de c0025 jouent pareil : 3fabdc8b au coffre, 6e05036f pour depart au banc, c3e8b819 pour pilote-voltige.js dans la note aux événements. Je m'appuie sur l'identité annoncée dans genome.js (identite.js).
- Les effets sur le palier sont des extrapolations (plus de survie donne plus de paliers, d'après les tranches de durée des 103 courses), pas des mesures. Le +2,3 de la seconde chance suppose une seconde vie aussi longue qu'une vie neuve.
- Je ne sais pas si le frein de c0005 (25/11) s'est déclenché une seule fois : ses chiffres sont exactement ceux du parent.
- La jade : le bot n'y meurt jamais (0 mort en 9,1 min, contre 5,0 par 10 min chez les joueurs) et y décolle moitié moins (42 contre 92). C'est un écart de ressemblance lié au gène raccCartes_jade, qui vaut 0, pas un changement de structure. Rouvrir la grotte a déjà coûté 1 à 1,5 palier (ETAPES.md l.117).
- La justesse des rayons de vue.sorties.bord à la grotte et au canyon n'est pas mesurée (justesse.js ne les tire pas, PASSATION.md, « Défauts connus ») ; elle conditionne la sortie préparée.

## 2. lire:ressemblance

*Rôle : lecteur « ressemblance » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre. Phase : Extraire.*

### Résumé

J'ai lu ml/ecurie/etude/realisme.md (les 26 écarts, § 4), humains.md, ressemblance.js, note.js (§ « L'écart dans la foule »), le haut de discerner.js, doigts.js (MAIN_CLAVIER, l.99-114), pilote-voltige.js, genome.js (les 121 gènes), ETAPES.md (soirée du 26/11) et l'historique git depuis le 26/11. J'ai recalculé E à partir du champ « mesures » des courses déjà écrites : 54 courses du bras depart du banc (etat/courses-2026-48.jsonl, dont 41 de plus de 60 s) et 40 courses c0025 du coffre (sorties/courses-coffre.jsonl, dont 29). Pour cela j'ai utilisé un script de lecture, rangé dans le scratchpad (contrib.js), avec les poids et la zone morte de config.json « note ».

TROIS CHOSES IMPORTANTES.

(1) Deux mesures font plus de la moitié de E. E de c0025 vaut 0,903 sur le banc et 0,910 au coffre. Part de chaque mesure dans E (banc) :
- aller du slalom : 0,29 (0,99 s contre 0,58 s, z +4,8) ;
- nitro au décollage : 0,24 (16 % contre 62 %, z −4,1) ;
- raccourcis : 0,10 (0,73 contre 3,2 par minute) ;
- part du temps en l'air : 0,10 (18 % contre 31 %) ;
- hauteur des vols : 0,06 (8,9 m contre 40 m) ;
- vols par minute : 0,045 (4,8 contre 7,9).
Le reste pèse moins de 0,03 chacun. Six mesures tombent dans la zone morte (|z| < 1). À titre de repère, une seule partie de joueur comparée aux autres donne un E de 0,03 à 0,50.

(2) Où en sont les 26 écarts.
- FERMÉS : n°1 le dessous (c72d25ecf ; aujourd'hui 3,6 % du sol contre 2,2 %, z +0,67) ; n°11 le départ (dd807f338) ; n°13 les vols courts (z +0,67) ; n°18 la vitesse (z −0,6).
- EN PARTIE FERMÉS : n°4 les portails en vol (dd807f338 : 13 sur 23 contre 56 %) ; n°9 la nitro au sol (1ee936e15 : 62 % contre 78 %, z −1,3) ; n°16 la régularité (coefficient de variation du palier 0,44, 16 courses sur 54 sous 70 s ; les joueurs 4 sur 10).
- FERMÉ PAR HASARD : n°17 la seconde chance (prend:1 n'a pas changé, mais le pilote atteint rarement le palier 12 : morts>1 dans 1 course sur 54 au banc et 3 sur 40 au coffre).
- EN COURS SUR LE BANC : n°2 la nitro au décollage (bordOn) ; n°3 les figures (largeOn) ; n°5 le slalom (slalomOn) ; n°6 les coups de nitro en vol (coupOn) ; n°8 la pose (lacheOn, relacheOn, suitOn). Ce sont des chiffres partiels, à 53 graines : rien n'est conclu.
- OUVERTS SANS AUCUN GÈNE : n°7 le volant braqué en vol ; la hauteur des vols (part de n°2) ; n°10 et n°20 les raccourcis et le nombre de vols ; n°14 la frénésie ; n°15 le drift ; n°21 les morts au canyon et en ville ; n°19, 22, 23 (non mesurés aujourd'hui) ; n°24 le compte ; n°25 la fiche ; n°26 le juge (discerner.js n'a pas bougé depuis le 25/11).

(3) E ne voit pas plusieurs défauts. Il ne mesure ni le volant braqué en vol (c0025 : 59 %, sur une seule course que j'ai mesurée ; les joueurs : 31 %), ni les allumages de nitro en vol (0,38 par seconde contre 0,88). Le gain de coupOn sur la ressemblance est donc invisible pour la note F. Les figures (0,6 contre 3,3 par minute) restent sous la zone morte, parce que l'écart-type des joueurs est énorme (2,38). Côté données : l'étalon n'a pas bougé depuis le 24/11 (8 parties au clavier de plus de 60 s, 3 au doigt) et l'enregistreur n'a pas été changé. Les 8 lignes et les 28 parties du § 5 restent à faire : c'est une décision de Sacha, puisque cela change le jeu.

### Candidats

- Nom : Le décollage qui monte  
  Constat : Les vols du pilote ne montent pas. Hauteur médiane d'un vol posé : 8,9 m contre 39,9 m (z −1,78, part de E 0,06). Part du temps en l'air : 0,177 contre 0,309 (z −2,27, part 0,10). Vols par minute : 4,79 contre 7,86 (z −2,17, part 0,045). Source : le bras depart du banc, ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl, champ « mesures », recalculé avec ressemblance.reference(joueurs('clavier')). Le coffre donne la même chose (8,6 m, 0,18, 4,9). Chez les joueurs, 71,5 % des vols montent de plus de 10 m, contre 19,5 % (realisme.md § 1.3, sur l'ancien pilote). Dans le code, le pilote ne cabre jamais : le manche ne sert qu'à PIQUER vers la route dès que la caisse est à plus de 10 m et que la descente prendrait plus de 2 s (ml/ecurie/pilote-voltige.js l.265-267, versRoute). Le rayon planeCabre existe déjà dans les yeux (ml/ecurie/CONSIGNES.md l.32 ; pilote-voltige.js l.277), mais aucune sortie voulue ne le choisit.  
  Mécanisme : Quand le pilote sort exprès (raccourci, portail, bordOn), il tient le manche cabré avec la nitro pendant une durée-gène (0,3 à 1 s) après le décollage. Il ne le fait que si le rayon planeCabre de cette sortie promet une pose. Dans ces vols voulus, la loi « piquer au-dessus de 10 m » est coupée tant que la jauge d'air garde une marge-gène.  
  Où : Un gène dans ml/evolution/genome.js (un interrupteur cabreOn, plus cabreT et cabreAir) et le code dans ml/evolution/modele.js, à côté de raccourci() et versRoute(). Rien dans les yeux : planeCabre existe déjà.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Inconnu, plutôt un risque. Un essai proche a été retiré : 3 morts sur 10 (ETAPES.md, « ouvrir les cibles à hauteur égale ou plus hautes avec nitro à l'engagement »). De plus, 12 des 20 morts du pilote sont des vols de 5 à 6 s qui ne se posent jamais (commit c72d25ecf), et un vol plus haut dure plus longtemps.  
  Effet attendu sur la ressemblance : Si la hauteur médiane atteint 20 à 25 m (z vers −0,9), sa part de E (0,06) disparaît. L'air et les vols par minute (0,10 + 0,045) baisseraient un peu aussi. Gain plausible sur E : 0,05 à 0,15. Ce n'est mesuré nulle part.  
  Déjà essayé : En partie. ETAPES.md (soirée du 26/11) : ouvrir les cibles plus hautes avec la nitro à l'engagement donnait 3 morts sur 10, retiré (agents/tmp-voltige/yeux-haut.js). bordOn, en cours sur le banc, ne fait que la nitro au bord : nitroDecol passe de z −4,08 à −3,09 et volHaut de −1,78 à −1,67 (partiel, 53 graines). Cabrer à la sortie : jamais.  
  Coût : Moyen : un bloc de code dans modele.js gardé par un interrupteur, puis un bras du banc.  
  Confiance : Faible. Je ne sais pas de combien de mètres un cabré de 0,5 s fait monter la caisse dans le simulateur, ni si planeCabre est juste sur ces trajectoires (justesse.js ne le dit pas).
- Nom : Un E qui voit tout ce que le juge voit  
  Constat : E (ml/bot/ressemblance.js l.28-33) a 15 mesures. Il ne compte ni le volant braqué en vol (pouvoir de séparation 0,919, z +3,7 dans realisme.md § 3), ni les allumages de nitro par seconde de vol (0,893, z −1,85), ni la largeur d'un aller du slalom (0,754), ni l'écart au milieu à la pose (0,750). Sur la seule trajectoire récente de c0025 (ml/ecurie/agents/tmp-voltige/labo-video/trajectoires/c0025-g910407.json.gz), je mesure 59,4 % du vol volant braqué (joueurs 30,6 %) et 0,38 allumage par seconde de vol (joueurs 0,875). Les figures (0,60 par minute contre 3,26) restent sous la zone morte parce que σ vaut 2,38 (z −1,12, part 0,009). discerner.js n'a pas changé depuis le 25/11 (git log). Le juge « à l'instant » et le juge « du compte » (realisme.md § 3, points 2 et 3) n'existent pas.  
  Mécanisme : Le pilote ne conduit pas autrement. C'est la note qui change : elle verrait enfin ce que coupOn (les coups de nitro en vol), lacheOn et un futur gène « volant lâché en vol » corrigent. Sans cela, la sélection et le banc ne récompensent pas ces progrès, et un génome peut améliorer E en dégradant ce qui n'est pas mesuré. Il faut ajouter à MESURES au moins le volant braqué en vol, les allumages de nitro en vol et la largeur d'un aller. Pour les figures, on peut prendre une mesure plus serrée, comme la part des vols de plus de 1,5 s qui ont une figure (19,7 % contre 0 %, realisme.md § 1.4).  
  Où : ml/bot/ressemblance.js (MESURES, mesuresPartie), ml/evolution/note.js (poidsMesures) et config.json « note ». C'est la note, pas le pilote.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Aucun direct. C'est un changement de la règle du jeu de la sélection.  
  Effet attendu sur la ressemblance : E va d'abord MONTER pour c0025, avec trois mesures à |z| de 2 à 4. Ensuite, chaque gène de geste deviendra visible. Le chiffre ne vaut rien seul, c'est la mesure qui devient honnête.  
  Déjà essayé : Proposé le 26/11 (realisme.md § 3, juge étendu : AUC 0,989 sur l'ancien pilote ; PASSATION.md l.196-197). Jamais intégré : seule la borne 4 → 8 a changé (c72d25ecf).  
  Coût : Moyen. Le champ « mesures » des courses est calculé par l'enfant (ml/evolution/enfant.js l.25). Les anciennes lignes n'auraient pas les nouvelles mesures et compteraient au pire (note.js l.101). Toutes les notes sont donc à refaire. C'est une décision à grouper avec une époque, pas pendant la mesure du banc.  
  Confiance : Forte sur le constat. Moyenne sur le choix des mesures : elles ont été choisies après avoir vu les écarts (realisme.md, « Non vérifié »).
- Nom : Lâcher le volant en vol une fois le cap pris  
  Constat : Volant braqué (|steer| > 0,3) : 59,4 % du temps de vol sur la trajectoire c0025-g910407 (mon calcul, une seule course de 279 s). L'ancien pilote faisait 61,1 % ; les joueurs au clavier 30,6 % et Léo 40,1 % (realisme.md § 1.3, ligne n°7 du plan, séparation 0,919). Dans le code, versRoute braque à chaque vue, proportionnellement à l'écart de cap, sans zone morte (pilote-voltige.js l.262-264 : o.volant = (cl(−lat/portée) − axe) × 1,6). lacheOn (sur le banc) ne coupe le volant que dans les 0,35 s avant la pose (genome.js l.73-75).  
  Mécanisme : En vol, si l'erreur de cap est sous un seuil-gène (par exemple 0,1 à 0,3 rad), le volant reste à 0 au lieu d'une petite correction. Il ne repart que si l'erreur dépasse un second seuil (une hystérésis). Le cap est donc pris d'un coup franc, puis tenu, comme un joueur.  
  Où : Un gène dans genome.js (volLacheOn, volLacheCap, volLacheRepart) et le code dans versRoute de modele.js.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Inconnu. Les rayons des yeux rejouent la loi versRoute du pilote (pilote-voltige.js l.253, « recopiée »). Un pilote qui s'en écarte se pose donc ailleurs que là où les yeux l'annoncent : un risque sur les poses. Peut-être un léger mieux sur la glisse à la pose (0,33 rad contre 0,13 chez les joueurs, commit 224363ea3), mais rien ne le montre.  
  Effet attendu sur la ressemblance : Invisible dans E aujourd'hui (la mesure n'y est pas, voir le candidat précédent). Pour le juge, c'est une des trois mesures qui séparent le mieux (0,919).  
  Déjà essayé : Jamais, en tant que tel. Trois remèdes de pose ont été essayés et écartés (avance au sol, redressement au-dessus de la dalle, plané réacteur tenu : commit 224363ea3), mais aucun ne touchait le volant en plein vol.  
  Coût : Petit côté code. Moyen pour le juger, puisqu'il faut d'abord la mesure dans E ou une mesure à part sur les trajectoires.  
  Confiance : Moyenne sur le constat (une seule course récente mesurée). Faible sur le palier.
- Nom : Rouvrir les raccourcis des cartes à décor par des rayons du sol justes  
  Constat : Raccourcis : 0,73 par minute contre 3,22 (z −2,31, part de E 0,10, la 3e plus grosse ; banc depart). Le pilote n'en cherche jamais sur trois des six cartes : raccCartes:{grotte:0,canyon:0,jade:0} (pilote-voltige.js l.65-69), parce que « l'annonce du rayon du sol est fausse » (4 sorties sur 4 contre la roche à la grotte, 3 sur 4 à la jade : ETAPES.md, « Ce que les essais ont appris »). Les joueurs y coupent 4 à 5 fois par minute (même source).  
  Mécanisme : Corriger le rayon du sol des yeux sur ces cartes : la caisse doit entrer en collision avec la roche, la paroi et les pics pendant le vol simulé. Le gène raccCartes_* (déjà dans le génome) pourrait alors s'ouvrir sans tuer.  
  Où : Les yeux, ml/bot/yeux.js (le rayon du sol et sa collision avec le décor), puis verifier.js et justesse.js. Les gènes raccCartes_grotte, raccCartes_canyon et raccCartes_jade existent déjà.  
  Change ce que voient les yeux : oui  
  Effet attendu sur le palier : Négatif avec les yeux d'aujourd'hui. La grotte rouverte a été mesurée sur 24 courses : 2 morts sur 24 plongeons, 0,83 à 0,90 raccourci par minute, et un palier à un palier et demi de moins (ETAPES.md, « La grotte rouverte, pour voir »). Avec des yeux justes : inconnu.  
  Effet attendu sur la ressemblance : Avec des yeux justes, si les trois cartes passaient de 0 au rythme des autres cartes, les raccourcis et les vols par minute monteraient. La part 0,10 + 0,045 pourrait baisser de moitié : c'est une hypothèse, non mesurée.  
  Déjà essayé : Oui, côté pilote seulement : la grotte rouverte, laissée fermée (commit 1eea0a44e). La justesse des rayons du sol par carte à décor n'a pas été mesurée ici.  
  Coût : Gros : changer les yeux rejoue tout. Il faut prévenir Sacha.  
  Confiance : Faible. Je n'ai pas mesuré moi-même où les rayons se trompent, et ETAPES.md dit que le 26/11 la grotte ne donnait plus « 4 sur 4 » mais 2 morts sur 24.
- Nom : Un compte de bot crédible (seconde chance tirée, sauvegarde cohérente)  
  Constat : La seconde chance a une règle fixe : prend:1 au palier 12 et plus (pilote-voltige.js l.28 et ml/evolution/modele.js l.48-50, hors du génome). Aujourd'hui elle ne sert presque jamais, parce que le pilote dépasse rarement le palier 12 : morts>1 dans 1 course sur 54 (banc) et 3 sur 40 (coffre). Les joueurs : 2 parties sur 10 (realisme.md § 1.7). Dès que le palier montera, on retrouvera les 7 parties sur 12 de l'ancien pilote. Le palier le plus haut est 14, contre 28 chez les joueurs. Enfin, le simulateur repart d'une sauvegarde neuve, avec LA HONTE et les deux figures du débutant (realisme.md § 1.10, ligne n°24).  
  Mécanisme : La probabilité de prendre la seconde chance devient un gène (0,1 à 0,4) au lieu de 1. Plus tard, chaque bot aurait une sauvegarde à lui : voiture, figures, nombre de parties, morts par cause, cohérents avec son palier.  
  Où : Le PROFIL de ml/evolution/modele.js (chance.prend en gène dans genome.js) ; la sauvegarde de départ dans ml/bot/piloter.js et ml/reel/jeu-reel.js (le simulateur) pour le compte.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Légèrement négatif quand le palier monte : la seconde chance compte dans le meilleur palier (ETAPES.md l.411). Presque rien aujourd'hui.  
  Effet attendu sur la ressemblance : Aucun sur E (il ne voit rien du compte). Utile seulement pour l'observateur « b » (les chiffres d'un compte), dont Sacha n'a pas dit s'il existera (realisme.md § 1.10 : « c'est la première décision à prendre »).  
  Déjà essayé : Jamais. Proposé dans realisme.md (ligne n°17 : chance.prend de 1 à environ 0,3) et dans PASSATION.md l.202 (« c'est la main, donc l'étape D »).  
  Coût : Petit pour la seconde chance. Gros pour le compte (le simulateur).  
  Confiance : Forte sur le constat. Faible sur l'intérêt tant que ce qu'un joueur verra d'un bot n'est pas décidé.

### Trous

- Le slalom, la plus grosse part de E (0,29), n'est pas tranché. ETAPES.md l.111 dit que « c'est la main qui le fixe ». doigts.js l.104-105 dit le contraire : les changements de sens « ne bougent ni avec le retard du suivi ni avec les erreurs — il tient à la trajectoire du cerveau ». Le bras slalomOn du banc fait passer l'aller de z +4,81 à +2,85 (0,82 s environ), avec un palier de 5,76 contre 6,54 (partiel, 54 graines). La vitesse de la ligne visée est bornée par le gène glisse (0,12 rad, pilote-voltige.js l.36 et l.197), soit environ 14 m/s de côté, proche des 16,6 m/s d'un aller du pilote. Je ne propose rien de plus avant le verdict de slalomOn. La main n'a aucun gène : PROFIL est figé dans modele.js l.48.
- Le volant braqué en vol et les allumages de nitro en vol de c0025 reposent sur UNE course (c0025-g910407). Le banc et le coffre ne gardent que les 15 mesures de E, pas les trajectoires. Pour mesurer ces deux chiffres sur 20 courses ou plus, il faudrait garder des trajectoires (option --parties), ce que je n'ai pas le droit de lancer.
- Les chiffres du banc sont partiels : 53 à 54 graines sur 96, mesure en cours. Je ne cite que des moyennes, aucun verdict.
- Pas mesurable sur les lignes du banc ou du coffre : portails en vol (n°4), poses qui paient (n°22), nitro avant le portail (n°23), pièces par minute (n°19), morts par carte (n°21 : les lignes ne disent pas la carte de la mort), la forme minute par minute (realisme.md § 1.2).
- La frénésie (n°14) : l'enregistreur ne la note pas chez les joueurs. Changer l'enregistreur, code/moteur/enregistreur-jeu.js, change le jeu : c'est une décision de Sacha. J'ai vérifié qu'elle ne fait pas monter le palier : le palier vient de coinsGot, augmenté de 1 par pièce (code/gameplay/ramassage.js l.174) et de 2 à 18 par pose en chaîne (figures-route.js l.64), pas de l'argent multiplié.
- L'étalon n'a pas bougé depuis le 24/11 : 8 parties au clavier de plus de 60 s, 3 au doigt (joueurs('clavier') et joueurs('doigt')). La référence de E repose sur un seul joueur au clavier. Les 28 parties et les 8 lignes d'enregistreur de realisme.md § 5 ne sont pas faites. Elles demandent une décision de Sacha (changer l'enregistreur) et du temps de jeu de Sacha, de Léo, d'un débutant. Ajouter des parties change aussi l'époque (le sha de l'étalon entre dans l'époque, ml/evolution/courses.js l.36-43).
- Contre la référence « doigt » (3 parties), E de c0025 tombe à 0,572, contre 0,903 au clavier. Un bot de style Léo (drift bref, n°15) serait peut-être plus facile à rendre humain, mais 3 parties ne suffisent pas pour en faire une cible.
- Ce qu'un adversaire verra d'un bot (la course entière, un fantôme, ou un pseudo et un palier) n'est toujours pas décidé (realisme.md § 1.10). C'est ce qui dit si les indices du compte (n°16, 17, 24, 25) comptent.
- Je ne sais pas de combien un cabré au décollage fait monter la caisse, ni si le rayon planeCabre est juste : justesse.js ne le dit pas, et je n'ai lancé aucune course.

## 3. lire:vol-et-yeux

*Rôle : lecteur « vol et yeux » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre. Phase : Extraire.*

### Résumé

J'ai lu : ml/ecurie/etude/vol.md, conduite.md, morts.md ; ml/ecurie/PASSATION.md (« Défauts connus », points ouverts du 27/11) ; ml/ecurie/ETAPES.md (étape C deuxième temps, soir et nuit du 26/11, étape B) ; ml/bot/yeux.js (versRoute l.537-547, viser l.562-583, retour l.584-632, rendre l.729-741, LISTE_BORD et LISTE_COTE l.948-953) ; ml/bot/README.md § 2 bis et § 2 ter ; ml/ecurie/pilote-voltige.js (auSol, enVol, vaut) ; ml/evolution/genome.js (RETOUR, GESTES, PORTAGE, GARDES) ; ml/ecurie/etude/selection-naturelle/PROPOSITIONS.md (enquêtes 1 et 2 avec leurs vérificateurs) et mesures-27nov/out-*.txt ; ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md ; ml/ecurie/etude/boucle-payante-ryzen/coffre/sorties/resultats.json et courses-coffre.jsonl ; les causes de mort des lignes déjà écrites du bras « depart » dans banc-des-genes/etat/courses-2026-48.jsonl (lecture seule, aucune course lancée).

Les trois choses les plus importantes :
1) Toutes les courses finissent par une mort, et les deux tiers des morts sont un choc contre le décor en vol. Pour c0025 au coffre (40 graines, resultats.json, « causes ») : décor 27 (paroi 9, roche 7, pic 6, tour 3, canyon 2), air 7, vide 6, survie médiane 94,8 s. Bras « depart » du banc (54 courses déjà écrites) : décor 36 (tour 15, roche 11, pic 5, paroi 4, glace 1), air 12, vide 6. Beaucoup de ces morts suivent de près une sortie de route : 10 morts sur 20 « dans la seconde qui suit une sortie » (ETAPES.md, fin de soirée du 26/11) ; 7 morts sur 12 dans des vols de moins de 1 s (out-pDiag-930000.txt, tableau E).
2) La pose en travers est mesurée, mais sa cause n'est pas trouvée. La glisse après la pose vaut 0,38 chez le bot contre 0,13 chez les joueurs, et l'arrivée 0,47 rad contre 0,22. Aucun réglage déjà essayé ne change l'arrivée : elle reste entre 0,44 et 0,56 rad (PROPOSITIONS.md, enquête 1, « Mesures »). Chez le bot, l'arrivée prédit mal la glisse (corrélation 0,26, contre 0,77 chez les joueurs) : une partie de la glisse se fait au contact. Or les yeux s'arrêtent au contact : aucun rayon ne donne le lacet (la vitesse de rotation) à la pose, ni ce qui se passe 0,8 s après sur la route.
3) Les rayons « versRoute » des yeux ne jouent pas la loi que le pilote suit vraiment. Le pilote braque aussi au-delà de 1,6 rad (volDemiTour) et anticipe de 0,25 s (volAvance). Le rayon, lui, garde la zone morte de 1,6 rad et ne compte pas le retard de la main (yeux.js l.546 ; PASSATION.md, « Le biais des rayons versRoute »). Le radar dit donc « air » pour des vols qui se posent : 28 vols sur 171 (commentaire de yeux.js, loi « retour »), et 10 vols sur 12 annoncés « air/air » se posent (out-pDiag-930000.txt, tableau C). La loi « retour » des yeux, qui existe depuis le 27/11, compte déjà ce retard. Elle permet de corriger ce biais sans toucher à yeux.js.
À noter : vol.md l.44 dit que l'impact prédit et le centre ne sont pas exposés. C'est périmé : rendre() donne note, impact et centre (yeux.js l.735-737).

### Candidats

- Nom : La pose suivie au sol (les yeux voient la seconde d'après)  
  Constat : Les poses du bot ressortent souvent de la route. Re-sorties en moins de 0,8 s : 36 % (6 mortelles, dont 5 à la grotte) contre 29 % chez les joueurs (ETAPES.md, « La nuit du 26 au 27/11 », tableau). À la grotte : 33 % (19 sur 58, 3 mortelles) contre 14 % (PROPOSITIONS.md, enquête 2, mesure « Sorties en chaîne »). Glisse après la pose : 0,38 contre 0,13 (enquête 1). Le radar ne donne que l'axe au contact (yeux.js l.735, rendre). Il ne donne pas le lacet, alors que la caisse tourne encore à 1,85 rad/s au contact quand la main tenait le volant à fond (enquête 2). « À la dernière vue, on lit 0,29 pour une glisse réelle de 0,36, et 0,60 pour 0,64 » (enquête 2, « Les yeux : le lacet au contact »). La corrélation arrivée/glisse vaut 0,26 chez le bot contre 0,77 chez les joueurs (enquête 1, « Point nouveau »).  
  Mécanisme : Les yeux font deux choses de plus. (1) Chaque rayon qui se pose porte le lacet au contact et l'axe à +0,3 s (axe + (lacet + lacetRoute) × 0,3 : la proposition de l'enquête 2). (2) Le rayon ne s'arrête plus au contact : il prolonge la pose de 0,8 s au sol, avec la cinématique de route que les yeux ont déjà (rouler, loi 0 : tenir la route). Il dit alors si la caisse « tient » ou « ressort », et de quel côté. On ajoute aussi un rayon « lâche » : la loi du pilote jusqu'à 0,35 s du contact, puis volant 0. Le pilote classe ensuite les façons sur « tient » ou « ressort » au lieu de l'axe seul (vaut(), pilote-voltige.js l.288-303), et lâche le volant quand le rayon « lâche » tient mieux.  
  Où : ml/bot/yeux.js : rendre(), rayon(), rouler() ; puis un gène éteint dans genome.js et le code dans modele.js (le nouveau classement, et le rayon « lâche » demandé)  
  Change ce que voient les yeux : oui  
  Effet attendu sur le palier : Inconnu, avec une borne haute. Une re-sortie juste après la pose est la forme principale des morts dans la seconde qui suit une sortie, et ces morts font la moitié des morts (10 sur 20, ETAPES.md). Si la moitié d'entre elles disparaissait, la survie médiane (94,8 s au coffre) monterait nettement. Je n'ai pas de chiffre direct entre survie et palier.  
  Effet attendu sur la ressemblance : Indirect. La glisse et la re-sortie ne font pas partie des quinze mesures de E (ressemblance.js : nitro, vols, raccourcis, figures, poseCentre, dessous, aller, ondulation, vitesse…). Seule poseCentre peut bouger. Sur l'AUC du juge et sur l'œil de Sacha, en revanche, c'est l'écart le plus visible des poses.  
  Déjà essayé : Proposé le 27/11 (PROPOSITIONS.md, enquête 2, « Les yeux : le lacet au contact »), jamais écrit : yeux.js ne contient ni lacet au contact ni rayon « lâche » (rendre l.729-741). Trois remèdes « de pilote » essayés le 26-27/11 n'ont pas changé la glisse : faire-pY, faire-pZ, faire-pQ (0,34 à 0,37 ; ETAPES.md, nuit du 26 au 27/11). La passation dit : « la suite passe par les yeux ».  
  Coût : Gros : changer yeux.js veut dire repasser verifier.js et justesse.js, refaire l'empreinte et les rejeux, ouvrir une nouvelle époque de la sélection et prévenir Sacha. Le budget du radar monte aussi (environ 48 images de route par rayon qui se pose).  
  Confiance : Moyenne. Le constat est sûr (plusieurs centaines de poses, deux vérificateurs). Le gain ne l'est pas : on ne sait pas si le pilote trouvera, parmi ses façons, une pose qui tient quand le rayon le lui dit. Il faut d'abord compter, sur les vols de vols-pDiag, combien de vols avaient un autre rayon qui aurait « tenu ».
- Nom : La loi fidèle : un rayon qui joue exactement la loi du pilote  
  Constat : Le rayon « versRoute » des yeux (yeux.js l.546) ne braque pas au-delà de 1,6 rad, n'anticipe pas et ne compte pas le retard de la main. La loi du pilote, elle, braque au-delà (volDemiTour 1), anticipe de 0,25 s (volAvance) et obéit 0,2 à 0,35 s plus tard (pilote-voltige.js l.253-266 ; PASSATION.md, « Le biais des rayons versRoute »). Mesuré : ce rayon dit « air » pour 28 vols sur 171 qui se posent (yeux.js, commentaire de la loi « retour », rayons-vol.js). À la première vue, 10 vols sur 12 annoncés « air/air » se posent (out-pDiag-930000.txt, tableau C). Depuis le dessous de la dalle, il annonce 5 à 6 s de vol quand il en faut 2 à 4 (ETAPES.md, soir du 26/11). La toupie qui suit est mesurée : 45 vols sur 299 passent par « gauche » ou « droite » à fond, avec 7 morts et 16 tours complets (PROPOSITIONS.md, enquête 2).  
  Mécanisme : Sans toucher à yeux.js. La loi « retour » des yeux (l.614-628) avec marge ≥ la demi-largeur de route donne bord = 0. Elle devient la loi « vers la route » : cap borné de −lat/portée, sans zone morte (« par le plus court chemin »), avec l'avance tau et les retards rv, rm, rn de la main. Le pilote demande cette loi (marge 200, cap 0,6, gain 1,6, porteeMin 40, avance 0,25, et une jumelle avec nitro:1 pour versRoutePlane). Il la suit par vue.vol.retours[i] à la place de versRoute, et juge sa façon sur le rayon retour<i>. Il juge donc enfin ce qu'il fait vraiment.  
  Où : Un gène (drapeau « loiFidele », éteint à la naissance) dans genome.js et le code dans modele.js. Les bornes actuelles bloquent : retMarge va de 4 à 14 (genome.js, RETOUR). Il faut un gène à part, ou une borne plus large. lireRetours accepte marge jusqu'à 200 (yeux.js).  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Inconnu. Ce qui est en jeu : les vols « air » et « vide » (13 morts sur 40 au coffre, 18 sur 54 au bras départ du banc) et les toupies, que le radar déclenche à tort quand il se trompe.  
  Effet attendu sur la ressemblance : Faible sur E : le volant en vol et les toupies n'y sont pas. Peut-être sur volDuree et vols, si moins de vols finissent jauge vide.  
  Déjà essayé : Jamais sous cette forme. La loi « retour » (marge 8, cap 0,6 ou 0,8) a été essayée à la main le 27/11 : glisse 0,32 contre 0,38, morts dans le bruit, « pas franchement meilleure » (portfolio/journal/2026-11-27.md l.31). Elle vise une ligne près du bord, ce n'est pas la loi du pilote rendue fidèle. La correction du biais dans les yeux est notée « à faire » dans PASSATION.md (point 5), jamais faite.  
  Coût : Petit à moyen : une quarantaine de lignes dans modele.js, un gène, des tests d'identité. Pas d'époque des yeux. La sélection change d'époque parce que modele.js change.  
  Confiance : Moyenne. La lecture du code dit bien que marge ≥ demi-largeur ramène retour() à la loi « vers la route ». Il reste deux choses à vérifier : que l'avance de retour() (lt + vB × tau, axe + volant × lacet × tau) suit d'assez près la différence d'une vue à l'autre du pilote, et que le budget « retour » (1 460 images) suffit pour deux lois de 6 s.
- Nom : La loi « retour » au banc des gènes  
  Constat : Le gène retourOn (avec volMieux) existe depuis la v:1 du génome (genome.js, RETOUR), éteint à la naissance. Il ne fait pas partie des 13 bras du banc (banc-des-genes/LISEZ-MOI.md, « Les bras »). Mesures du 27/11 (deux lots de 12 courses de 300 s ; mesures-27nov/out-pR2*.txt contre out-pDiag-930000.txt, mêmes graines 930000) : glisse médiane 0,28 contre 0,35, morts 9,0 contre 9,4 pour 100 vols, re-sorties 31 % contre 26 %, somme des paliers 77 contre 83. À la première vue, le rayon retour0 annonce des poses à 0,12 rad en médiane, contre 0,32 à 0,36 pour versRoute (tableau R). Une pose annoncée sous 0,2 rad glisse de 0,10 à 0,21 ; à 0,35 rad ou plus, de 0,43 à 0,57 (tableau G).  
  Mécanisme : Aucun code neuf : un bras de plus au banc, retourOn 0 → 1 et volMieux 0 → 1, réglages à leur naissance (marge 8, cap 0,8, gain 0,8, avance 0,15), contre « depart » sur les mêmes 96 graines.  
  Où : ml/ecurie/etude/banc-des-genes/jouer.js (la liste des bras), quand la mesure en cours sera finie. Rien dans genome.js ni modele.js.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Rien de net dans les mesures du 27/11 (somme des paliers 77 contre 83 sur 12 courses, dans le bruit de ± 20 noté par ETAPES.md). Le banc dira s'il y a un effet de plus d'un palier.  
  Effet attendu sur la ressemblance : Faible sur E (la glisse n'y est pas). Les vols sans nitro passent de 32 % à 46-52 % (tableau H), ce qui éloigne des joueurs (un vol sur 25 sans nitro chez eux, ETAPES.md).  
  Déjà essayé : Oui, à la main le 27/11 (faire-pR.js, out-pR2*.txt) : gardé comme brique, pas comme progrès (journal 2026-11-27 l.31). Jamais sur 96 graines appariées.  
  Coût : Petit : 96 courses de plus (environ 1/13 de la mesure en cours).  
  Confiance : Forte sur le coût, faible sur le gain. C'est surtout la base de mesure des candidats 2 et 5.
- Nom : Rouvrir la grotte, la jade et le canyon aux raccourcis  
  Constat : Les sorties voulues sont interdites sur trois maps (raccCartes, pilote-voltige.js l.65) depuis « 4 sorties sur 4 contre la roche à la grotte, 3 sur 4 ratées sur la jade » (PASSATION.md, Défauts connus). Mais la grotte rouverte avec les règles du 26/11 au soir donne 24 plongeons voulus et 2 morts (8 %) ; les sorties voulues doublent (1,1 à 1,3 par minute) et le palier médian baisse d'un palier à un palier et demi (8 et 5 contre 9 et 6,5, sur 24 courses) (ETAPES.md, « La grotte rouverte, pour voir »). Les joueurs y coupent 4 à 5 fois par minute (5 raccourcis par minute à la grotte). Le bot fait 0,93 raccourci par minute toutes maps, contre 3,49 chez les joueurs (ETAPES.md, nitro au sol).  
  Mécanisme : Allumer raccCartes_grotte (puis raccCartes_jade, raccCartes_canyon) : le pilote prend les raccourcis promis deux vues de suite par un rayon du sol, sur ces maps aussi. raccJumeau (déjà à 1 pour la jade et la ville) exige que les deux rayons viser et viserPlane se posent.  
  Où : Des gènes qui existent déjà dans genome.js (NON_REELS, raccCartes_* nés à 0). Un ou trois bras de plus au banc.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Négatif ou nul d'après la seule mesure : −1 à −1,5 palier médian sur 24 courses (dans le bruit, mais dans le même sens sur les deux lots).  
  Effet attendu sur la ressemblance : Positif probable : la mesure « raccourcis » de E est l'une des plus éloignées (0,93 contre 3,49 par minute), et les sorties voulues doublent à la grotte. L'ampleur sur E n'est pas mesurée.  
  Déjà essayé : Oui, la grotte seule, le 26/11 (lot-pGr.txt, lot-pGr-neuves.txt, 24 courses) : laissée fermée « parce que c'est un arbitrage palier contre ressemblance, donc l'affaire de la boucle ». La jade et le canyon n'ont jamais été rouverts. La justesse des rayons « viser » du sol n'a jamais été mesurée (README § 2 bis et § 2 ter ; PASSATION.md).  
  Coût : Petit : des bras au banc, aucun code.  
  Confiance : Moyenne pour E, faible pour le palier. Avant la jade et le canyon, il faudrait la justesse des rayons viser du sol (justesse.js ne les tire pas).
- Nom : Le cap de rentrée borné quand le contact approche  
  Constat : Au contact, la loi « vers la route » demande encore 0,5 rad vers l'intérieur en médiane : -lat/40 est borné à 0,6, et la borne est atteinte dans 37 % des poses (PROPOSITIONS.md, enquête 2, « Ce que l'enquête n'a pas vu », verif/v3-cap-approche.js). Cap d'approche au-dessus de 0,4 rad : 60 % des poses du bot, contre 27 % chez les joueurs. Dans la moitié des vols (82 sur 163), la loi vise la borne de 0,55 à 0,6 à la dernière vue (enquête 1, proposition 2, vérificateur).  
  Mécanisme : Dans versRoute (modele.js) : quand le rayon tenu annonce une pose dans moins de rentreeT (0,9 s), la borne du cap passe de 0,6 à capRentree (0,3, réglé sur les joueurs : médiane 0,12 à 0,17, 90 % sous 0,38 à 0,45). Ce n'est pas pZ, qui ne bornait qu'au-dessus de la dalle, donc trop tard.  
  Où : Un gène (drapeau rentreeOn, avec capRentree et rentreeT) dans genome.js et modele.js.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Inconnu. Risque noté par l'enquête : la caisse rentre plus lentement, d'où plus de vols longs et de morts « air ».  
  Effet attendu sur la ressemblance : Faible sur E (la glisse n'y est pas).  
  Déjà essayé : Jamais sous cette forme (ni dans genome.js ni dans modele.js). Mais une forme voisine contredit l'idée : volRetour 0,8 ou 1,2 (pX2, pX3, pQ2) adoucit déjà le cap près du bord vers 0,3 rad, et l'arrivée ne bouge pas (0,48 à 0,51 contre 0,50), la glisse gagnant au plus 0,03 à 0,04 (enquête 1, proposition 2, vérificateur et « Mesures refaites »).  
  Coût : Petit : une dizaine de lignes, trois gènes.  
  Confiance : Faible. Le premier vérificateur l'a classé n° 1, le second montre qu'un cap plus doux ne passe pas dans l'arrivée. À ne faire que si le banc montre un effet de lacheOn (le volant lâché avant le contact), qui touche le même défaut par l'autre bout.
- Nom : Le frein d'urgence avant une sortie vers le décor  
  Constat : Une bonne part des morts tombe dans la seconde qui suit une sortie : 7 morts sur 12 dans des vols de moins de 1 s (out-pDiag-930000.txt, tableau E), 10 sur 20 dans la grande note (ETAPES.md). Deux formes : la pose en travers, et un zigzag au sol qui grossit vers 550 km/h (ETAPES.md, fin de soirée du 26/11). Le cas grotte 910185 : « tenue LACHE 0,57 s avant », tous les rayons du bord disent choc, mort contre la roche (PROPOSITIONS.md, enquête 2, mesure « Vue par vue »). Quand la route lâche, le pilote vise le côté opposé et coupe la nitro, mais il ne freine jamais : auSol ne rend que {ligne, nitro} (pilote-voltige.js l.195-239). La main sait freiner : au sol, manche +1 freine, et drifte si le volant est tenu (doigts.js l.5 ; README tableau des ordres). Au canyon : « Non essayé : freiner » (ETAPES.md, étape C, « Ce qui le tue encore »).  
  Mécanisme : Sur une map à décor, quand tenue.tient vaut faux et que les rayons de sorties.bord ne promettent ni pose ni lèvre, le pilote tient ↓ (manche +1, volant sous 0,35) jusqu'à ce que tenue redise « tient ». Moins de vitesse veut dire moins de lacet par coup de main, et une sortie plus lente et plus courte si elle arrive quand même.  
  Où : Un gène (freinOn, avec un seuil de temps avant le bord) dans genome.js et modele.js. Pour bien juger, les yeux devraient un jour rouler tenue aussi avec le frein (rouler, yeux.js l.797, tient la vitesse) : sans cela le pilote freine à l'aveugle.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Inconnu. Risque : moins de vitesse, donc moins de pièces par minute.  
  Effet attendu sur la ressemblance : Inconnu, risque négatif sur « vitesse » (joueurs 585 km/h à la sortie à la grotte, bot 487 : enquête 2). Le frein des joueurs n'est pas enregistré (realisme.md l.393 et l.429 : les touches ↑ ↓ ne sont pas notées).  
  Déjà essayé : Jamais (ETAPES.md : « Non essayé : freiner »). Essayé sans effet au même endroit : rouler dans l'axe sans nitro, une avance de cap plus forte (1,35 et 1,74 sortie par minute contre 1,54).  
  Coût : Petit pour le gène. Moyen si l'on veut aussi le rayon « tenue avec frein » dans les yeux.  
  Confiance : Faible. Aucune mesure ne dit que freiner 0,5 s avant le bord suffit à rester sur la route.
- Nom : Pas de toupie : gauche ou droite seulement vers une pose propre  
  Constat : Quand le radar ne promet rien, le bot prend « gauche » ou « droite » à fond. 45 vols sur 299 (7 morts), 16 tours complets sur soi-même (canyon 910111 posé à 1,26 rad) ; volant à fond 0,5 s ou plus : 29 % de ses vols contre 4 % chez les joueurs (PROPOSITIONS.md, enquête 2, mesure « Toupies »). Le vérificateur corrige deux points : dans 12 cas sur 44, versRoute promettait encore une pose à la vue d'avant la bascule, et 38 vols sur 45 ont survécu.  
  Mécanisme : Dans enVol (modele.js), la boucle des façons saute « gauche » et « droite » sauf si leur rayon promet une pose propre à moins de raccAxe. On les quitte aussi au-delà de 1,2 rad d'axe ou après 0,6 s. C'est la proposition de l'enquête 2, jamais écrite.  
  Où : Un gène (toupieOn) dans genome.js et modele.js.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Petit, peut-être négatif : la façon qui « meurt le plus tard » gagnait parfois quelques dixièmes, et 38 de ces 45 vols survivaient (vérificateur).  
  Effet attendu sur la ressemblance : Hors de E (le volant en vol n'y est pas), mais très visible à l'œil : un tour complet en l'air ne ressemble à aucun joueur.  
  Déjà essayé : Jamais (aucune trace dans genome.js ni modele.js).  
  Coût : Petit.  
  Confiance : Faible pour le palier, moyenne pour la ressemblance à l'œil. Une partie des toupies vient du rayon versRoute trop pessimiste : le candidat 2 (la loi fidèle) peut les faire disparaître sans ce gène. À juger après lui.

### Trous

- Je n'ai pas le partage entre les deux formes de mort « dans la seconde qui suit une sortie » (pose en travers puis re-sortie, contre zigzag au sol vers le bord). ETAPES.md ne donne que le total (10 sur 20), et courses-*.jsonl ne garde ni la map ni la durée du dernier vol.
- Les morts « tour » (la ville) font 15 des 54 morts du bras « depart » du banc, mais seulement 3 sur 40 au coffre. Je ne sais pas si c'est la plage de graines ou un défaut propre à la ville. Les yeux ne voient pas la ville vitrée au-delà de son sol (README § 2, « Ce que les yeux ne voient toujours pas »), et l'effet de ce manque n'est mesuré nulle part.
- Les montagnes de la jade qui tombent sont vues à leur place du moment (README § 2) : c'est un défaut connu des yeux, jamais chiffré. Les morts « pic » font 6 sur 40 au coffre et 5 sur 54 au banc, sans savoir combien viennent d'une montagne en chute.
- La justesse des rayons « viser » (les raccourcis voulus) n'a jamais été mesurée : justesse.js ne les tire pas (README § 2 ter ; PASSATION.md, Défauts connus). Les fichiers results/justesse-*.json datent du 25/11, avant les rayons viser, avant la loi retour et avant les réglages du 26/11.
- Le lien entre une mort en moins et un palier de plus n'est pas chiffré (aucune table survie → palier lue).
- Les vols hauts des joueurs (38 m contre 4 m ; arrivée 0,09 rad après un vol de 40 à 100 m contre 0,34 pour le bot, enquête 1) seraient peut-être la meilleure façon de poser droit. Mais l'essai d'ouvrir des cibles plus hautes avec nitro a donné 3 morts sur 10 (ETAPES.md, yeux-haut.js), et la montée passe par la nitro en vol, déjà au banc (bordOn, coupOn). Je ne l'ai donc pas proposé.
- Je ne cite pas de résultats du banc en cours : seules les causes de mort du bras « depart » (54 courses déjà écrites) sont reprises, comme portrait des morts, pas comme comparaison entre bras.
- Le raisin : vue.vol.reste vaut encore 99 quand pwrAirT > 0 (yeux.js l.98), mais le radar utilise resteAir avec RAI.stage, et le pilote lit d'abord f.air.reste. Je n'ai pas vérifié si un cerveau peut encore lire la mauvaise valeur.

## 4. lire:defauts

*Rôle : lecteur « défauts » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre. Phase : Extraire.*

### Résumé

J'ai lu en entier ml/ecurie/etude/defauts-confirmes.md (28 défauts), record.md, bot-actuel.md, economie.md, maps-a.md et maps-b.md. J'ai aussi lu morts.md, ETAPES.md (§ C, B, soirée du 26/11), realisme.md § 1.7, humains.md, selection-naturelle/PROPOSITIONS.md, le LISEZ-MOI du coffre et celui du banc. J'ai écrit trois petits scripts de lecture, rangés dans le scratchpad hors du dépôt. Ils comptent les morts par map dans ml/labo/journal/validations.jsonl et cerveaux.jsonl : 1 052 courses de c0025 et de ses descendants (c0025 et au-delà), régime allégé, tmax 900. Ils lisent aussi coffre/sorties/courses-coffre.jsonl. Je n'ai lancé aucune course.

Les trois choses les plus importantes :

(1) Les 28 défauts confirmés touchent presque tous la mesure ou le labo, pas la conduite, et ils sont presque tous corrigés. Le commit 1528cecf2 en corrige 24. Le palier se compte au sommet de la partie (mesures.js:18-23 et :123, défaut 2). L'explosion ne compte plus (défaut 6). Le tmax est à 900 (défaut 17). Les défauts des yeux relevés dans morts.md et maps-a/b sont corrigés par les yeux V2 : RAI.stage, MIR.t, idleT, CHANCE.inv, couloirs, radar du décor sondé à chaque image (yeux.js:15, 154-160, 969-981). Il ne reste ouvert que le filet des raccourcis (mesures.js:101-102), sans effet sur le palier. Les défauts ne donnent donc pas de gros candidat. Les maps et le record, si.

(2) LE CANYON TUE PRESQUE À COUP SÛR. Sur 1 052 courses, le pilote passe 248 fois par le canyon et n'en sort vivant que 4 fois (2 %). Ces 248 passages viennent de 15 graines différentes, et toutes y ont une mort. Il y a 245 morts « paroi », toutes en vol. Les autres maps se traversent dans 42 à 78 % des cas. Ce n'est pas propre aux descendants : c0025 seul meurt 5 fois sur 5 au canyon. ETAPES.md:429-431 dit la même chose (7 courses sur 8 forcées au canyon y meurent en 36 à 85 s). Les joueurs y meurent 5,9 fois pour 10 minutes, contre 16,0 (realisme.md:180). Les joueurs le traversent 2 fois sur 3 (humains.md:44-51). La VILLE vient ensuite : 42 % de traversées réussies, 177 morts « tour », 16,2 morts pour 10 minutes contre 6,2. Les joueurs la traversent environ 8 fois sur 10. La grotte (57 %) est à peu près au niveau des joueurs (environ 6 sur 10).

(3) CE QUI FAIT UNE COURSE RECORD. record.md ne parle que des records de la sauvegarde, pas de ceux du bot. Je l'ai donc mesuré dans les journaux. Les 68 courses au palier 14 ou plus ont TOUTES pris la seconde chance (100 %). Celles au palier 9 à 13 l'ont prise à 21 %, les 668 courses au palier 8 ou moins jamais (0 %). Les courses record traversent 4,6 maps en moyenne, les ordinaires 1,7. 38 % des courses record finissent au canyon. La seconde chance n'est prise qu'à partir du palier 12 (PROFIL.chance.palierMin:12, pilote-voltige.js:28). Or le palier moyen est de 6, donc la plupart des courses n'ont qu'une vie. Les deux meilleures parties des joueurs (paliers 22 et 28) ont elles aussi une seconde chance (defauts-confirmes.md § 19).

### Candidats

- Nom : La seconde chance à chaque mort après 20 s  
  Constat : La seconde chance n'est prise qu'au palier 12 ou plus : PROFIL chance:{prend:1,palierMin:12} dans ml/ecurie/pilote-voltige.js:28 et ml/evolution/modele.js:50. Sur 1 052 courses de la famille c0025 (ml/labo/journal/validations.jsonl et cerveaux.jsonl), 134 seulement l'ont prise (12,7 %), alors que 1 026 durent plus de 20 s. Les 68 courses au palier 14 ou plus l'ont toutes prise, les 668 courses au palier 8 ou moins jamais. Après une reprise, la course dure encore 41 s en médiane (palier final moyen 13,8). Dans le jeu, la reprise coûte un palier et ramène les pièces au seuil (code/gameplay/seconde-chance.js:91 et :188, cité dans economie.md et morts.md). Mais la note prend le SOMMET (ml/bot/mesures.js:18-23 et :123, défaut 2 corrigé) : une reprise ne peut donc jamais baisser le palier mesuré. La seconde chance est gratuite dans l'app iOS (record.md, « Les faits »).  
  Mécanisme : Prendre la seconde chance à toute mort, dès que le jeu l'offre (après 20 s de course, une fois par partie). Le pilote repart au même endroit avec un palier de moins, 3 s d'invulnérabilité et un sursis de 2,2 s (morts.md, « Effets de la reprise »). Concrètement, palierMin passe de 12 à 1 et devient un gène. On peut aussi faire un drapeau « chanceToujours ».  
  Où : Un gène dans ml/evolution/genome.js (chancePalierMin, entier de 1 à 30, naissance 12) plus son écriture dans le PROFIL de ml/evolution/modele.js. La main (ml/bot/doigts.js:87 et :97) accepte déjà palierMin de 1 à 30 : doigts.js ne change pas. Attention, le PROFIL est la « main », que la boucle payante gardait fixe (ETAPES.md:605). Il faut vérifier que ml/evolution/identite.js accepte un profil qui change.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Gros : environ +2 paliers par course, estimation optimiste. Je l'ai calculé sur les 40 courses du coffre de c0025 (coffre/sorties/courses-coffre.jsonl, palier moyen 6,15). Hypothèse : une course reprise au palier p-1 se comporte ensuite comme une course qui a atteint p-1. Le gain moyen est alors de +2,12 paliers. L'estimation est trop haute : la reprise repart dans la map qui vient de tuer. Au canyon, la graine 950037 meurt « paroi » à 213,9 s, reprend, puis meurt encore « paroi » à 224,0 s (validations.jsonl, c0010). Le banc le verrait sans peine : l'idée touche presque toutes les courses, et un effet de 1 à 2 paliers dépasse le seuil d'environ 1 palier à 96 graines.  
  Effet attendu sur la ressemblance : Plutôt pire si l'on compare aux joueurs du web. Au clavier, 2 parties sur 10 ont une seconde chance, et le pilote en est déjà à 7 sur 12 (realisme.md:183). Pour un joueur de l'app, où elle est gratuite, ce serait plus juste. Je ne sais pas si E (ml/evolution/note.js, ressemblance.js) compte les reprises : je n'ai pas vu de mesure « chances » dans la liste des mesures de ml/bot/ressemblance.js:31.  
  Déjà essayé : Jamais baissée. Le seuil de 12 a été choisi le 25/11 pour imiter les deux meilleures parties des joueurs (pilote-voltige.js:25 et :28 ; ETAPES.md:411-413 : 7 courses sur 12 l'avaient prise, « ce qu'elles auraient fait sans elle n'est pas mesuré »).  
  Coût : Petit : un gène et une ligne dans modele.js. Mais changer modele.js change l'époque : tout est rejoué (coffre/LISEZ-MOI.md, « Relecture » point 2). Les courses durent aussi plus longtemps, donc la sélection et le banc tournent plus lentement.  
  Confiance : Moyenne pour le sens et la taille (l'estimation repose sur une hypothèse de Markov). Faible pour la règle : c'est à Sacha de dire si un palier gagné après une reprise compte pour « aller le plus loin ». Les records des joueurs en contiennent (defauts-confirmes.md § 19 : sans les deux parties reprises, le record des joueurs tombe de 28 à 21).
- Nom : Le frein avant les virages, au canyon  
  Constat : Le canyon tue presque à coup sûr. Sur 1 052 courses de la famille c0025, 248 traversées du canyon donnent 4 sorties vivantes (2 %) et 253 morts, dont 245 « paroi », toutes en vol. Les passages viennent de 15 graines distinctes, et toutes y meurent (validations.jsonl et cerveaux.jsonl, champs cartes et morts[].carte). c0025 seul : 0 traversée réussie sur 5. Sur le coffre, c0025 meurt 9 fois « paroi » et 2 fois « canyon » sur 40 courses (courses-coffre.jsonl : la map n'y est pas écrite, mais toutes les « paroi » de c0025 au journal sont au canyon). Pour comparer, les autres maps : nuages 78 %, jade 73 %, espace 69 %, grotte 57 %, ville 42 %. Les joueurs meurent 5,9 fois pour 10 min au canyon, contre 16,0 pour le pilote (ml/ecurie/etude/realisme.md:180). Selon ETAPES.md:429-431, le pilote sort 1,5 fois par minute et la paroi est à une dizaine de mètres du bord. PROPOSITIONS.md:93 lit la graine 910222 vue par vue : le S se perd parce que la main est en retard, et tenue et sorties.bord ne l'annoncent que 0,5 s avant. Le pilote ne freine jamais (pilote-voltige.js:21 : « ni drift, ni frein »).  
  Mécanisme : Au canyon seulement, pas dans les virages eux-mêmes : quand vue.route ou vue.virage annonce un virage serré ou un S dans les 1 à 2 s, et que la vitesse dépasse vSure × k, le pilote met manche +1 au sol avec |volant| < 0,35. Avec les gaz automatiques, c'est le frein : −1,5 × acc9 (ml/ecurie/etude/conduite.md:20 et :60). Au-delà de 0,35 de volant, ↓ part en drift : il faut donc freiner AVANT le virage et relâcher dès que le volant mord. L'idée : le retard de la main (0,2 à 0,45 s) coûte moins de mètres et de radians à vitesse plus basse.  
  Où : Un interrupteur dans genome.js (freinOn, naissance 0), avec ses réglages (freinK, freinAvance) et une liste de maps (freinCartes, canyon par défaut). Le code va dans auSol() de modele.js. La main sait déjà freiner : manche +1 au sol, doigts.js:5 et :7. Les yeux donnent déjà virage.vSure (yeux.js:916) et la route à 8 distances.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Inconnu, peut-être gros sur les courses touchées. Si le canyon se traversait comme la moyenne des maps (environ 60 %), une course qui y meurt gagnerait de l'ordre de +1,6 palier. Mon estimation : une course qui passe le canyon finit en moyenne 2,66 paliers plus haut que celle qui y meurt (palier moyen des courses qui atteignent la map suivante, moins le palier à la mort). Rapporté à toutes les courses, cela fait environ +0,4 palier, car 24 % des courses de la famille (248 sur 1 052) et environ 25 % de celles de c0025 sur le coffre passent par le canyon. Au banc, l'idée ne se déclenche que sur ces graines-là : le reste des courses est identique, donc la comparaison est fine. Ce que le frein coûte en pièces par minute ailleurs : rien, s'il est réservé au canyon.  
  Effet attendu sur la ressemblance : Un peu pire au canyon. Les joueurs y sortent PLUS vite que le pilote : 613 km/h contre 520 (PROPOSITIONS.md:98). Freiner éloigne la vitesse au sol des joueurs, mais sur une petite part du temps de jeu. On ne sait pas si les joueurs freinent : les touches ↑ ↓ sont invisibles chez Sacha (realisme.md:393).  
  Déjà essayé : Jamais : « Non essayé : freiner » (ETAPES.md:431). Essayé sans effet net au canyon, et à ne pas reproposer : rouler dans l'axe sans nitro (1,35 sortie par minute contre 1,54) et une avance de cap plus forte (1,74) (ETAPES.md:430-431). raccCartes canyon:0 (pas de sortie voulue) est déjà en place. Un point contre : à l'étape C, aucun décollage ne venait d'un virage trop rapide pour la caisse (« vSure gardait 300 m/s de marge », ETAPES.md:418-419). La cause est la main en retard, pas la physique : le frein n'aidera que si la vitesse plus basse réduit l'effet de ce retard.  
  Coût : Moyen : un comportement neuf au sol, à régler pour ne pas déclencher le drift et ne pas tomber sous 22 km/h (mort « arret », morts.md). Il faut une dizaine de courses forcées au canyon (--carte canyon) pour le régler, puis un bras du banc.  
  Confiance : Faible à moyenne. Le constat est sûr : 248 traversées, 15 graines. Que le frein le corrige n'est pas établi, et la mesure de l'étape C (pas de virage trop rapide) va contre. Chez les joueurs, 3 passages au canyon seulement.
- Nom : Le même frein étendu à la ville  
  Constat : La ville est la deuxième map la plus meurtrière. Sur 1 052 courses de la famille c0025, il y a 358 traversées, dont 149 réussies (42 %), et 233 morts : « tour » 177 (en vol), « air » 34, « paroi » 13 (au sol, dans les couloirs des tours), « vide » 9. Les joueurs : 16,2 morts pour 10 min passées en ville contre 6,2 (realisme.md:180). Ils traversent la ville environ 8 fois sur 10 (humains.md:41-57 : 10 passages, 2 morts). Dans les courses ordinaires (palier 8 ou moins), la ville est la fin la plus fréquente : 175 sur 668. Le gain estimé si la ville était passée est le plus gros des six maps, à égalité avec la grotte : +4,55 paliers par course qui y meurt, soit +0,90 rapporté à toutes les courses (même calcul que pour le canyon).  
  Mécanisme : Le même frein qu'au canyon, avec la ville dans la liste freinCartes. Ce serait un second bras du banc (freinOn plus ville), pour séparer l'effet des deux maps.  
  Où : Le même gène que le frein du canyon (freinCartes), dans genome.js et modele.js.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Inconnu. Le plafond est d'environ +0,9 palier par course si la ville ne tuait plus. Le vrai gain dépend de la part des morts « tour » qui suivent une sortie par le bord due à la vitesse. Je ne l'ai pas établi.  
  Effet attendu sur la ressemblance : Un peu pire : les joueurs roulent à 590-700 km/h, le pilote à 390-460 (ETAPES.md:177-178).  
  Déjà essayé : Jamais pour le frein. Les sorties VOULUES en ville ne sont pas en cause : 0 plongeon voulu mal fini sur 13 aux nuages, en ville et dans l'espace (pilote-voltige.js:68-69, ETAPES.md:94).  
  Coût : Petit si le frein du canyon est écrit : une valeur de plus dans la liste.  
  Confiance : Faible : le constat est sûr (358 traversées), le mécanisme ne l'est pas. Il faudrait d'abord autopsier une dizaine de morts « tour » (ml/bot/autopsie.js) pour savoir si elles suivent une sortie par le bord à grande vitesse, un vol de portail ou une toupie.

### Trous

- Les 1 052 courses du journal ne sont pas indépendantes. Elles rejouent environ 40 graines (910000 + 37 j et 950000 + 37 j, 20 chacune) avec des dizaines de pilotes proches. Les comptes par map sont donc gonflés : au canyon, 15 graines distinctes seulement. Le nombre de graines distinctes est donné pour le canyon, mais les intervalles de confiance n'ont pas été calculés.
- Le temps passé sur chaque map n'est écrit nulle part dans les journaux : il n'y a que la liste des maps et la position s à la mort. J'ai mesuré la traversée réussie ou non par map, pas des morts par minute. Les morts pour 10 min (16,0 contre 5,9) viennent de realisme.md:180, sur peu de parties.
- Les gains « si la map était passée » sont une estimation grossière : le palier moyen des courses qui atteignent la map suivante, moins le palier à la mort. Elle ignore que la map suivante est plus rapide (palier plus haut). C'est un ordre de grandeur, pas une mesure.
- Dans le coffre (courses-coffre.jsonl), la map de la mort n'est pas écrite. J'ai supposé que les 9 morts « paroi » de c0025 sont au canyon, comme toutes ses « paroi » des journaux. Elles pourraient venir des couloirs de la ville (13 « paroi » en ville dans la famille).
- La VILLE : je n'ai pas pu établir ce qui produit les 177 morts « tour ». Sortie subie à grande vitesse, vol de portail (portailVol:1 est permis en ville), toupie quand tous les rayons annoncent la mort (PROPOSITIONS.md:93 et :108) ? Il faut une autopsie, que je n'avais pas le droit de lancer.
- L'ESPACE : 163 morts « air » (jauge de 5 s, gravité × 0,5), 69 % de traversées réussies. Les joueurs y meurent très peu (une fin « air » sur 14 parties, Léo). Je n'ai pas trouvé de mécanisme sourcé qui ne soit pas déjà dans le radar : piquer, bump et lèvre sont déjà des rayons (yeux.js:458-491).
- La seconde chance : je n'ai pas vérifié si le simulateur gère bien une reprise au palier 1 à 11. La main l'accepte (doigts.js:97, palierMin de 1 à 30), mais elle n'a été jouée qu'au palier 12 ou plus. Je n'ai pas vérifié non plus si ml/evolution/identite.js ou l'époque refusent un PROFIL qui change.
- record.md n'étudie pas les courses record du bot, seulement les records de la sauvegarde. La comparaison course ordinaire / course record vient de mon comptage des journaux, qui confond l'effet de la seconde chance (prise seulement au palier 12 ou plus) et celui des maps traversées.
- Les figures achetées (aura 50 à 220, de 2 à 18 pièces par pose ; record.md) et le départ boosté (spinBoost, p = 0,07) sont des écarts de sauvegarde entre joueurs et bot. Leur poids en paliers n'est mesuré nulle part (record.md, « Non vérifié »). Le pilote pose peu de figures, donc le gain est probablement faible : je ne l'ai pas compté parmi les candidats.
- La pomme dorée en priorité (sphère de 50 m, 12 s ; economie.md) : aucun chiffre sur la part de pièces que le pilote manque hors de sa ligne. Le pilote ramasse déjà plus de pièces par km que Sacha (realisme.md:166). Le gain est probablement petit et non chiffré.
- Déjà essayé et écarté, à ne pas reproposer. Plus de nitro : 38 % du temps donne un palier médian de 8 à 8,5 au lieu de 9,5, 53 % donne 7 (ETAPES.md:108-110). La grotte rouverte aux sorties voulues : un palier à un palier et demi de moins (ETAPES.md:116-119), déjà le gène raccCartes_grotte. Le slalom de la ligne visée : un palier et demi de moins (ETAPES.md:111-112). Sortir du dessous en biais doux, tenir la nitro en sortant du dessous (ETAPES.md:165-170). Les coups de nitro en vol dans leur version du 26/11 : palier médian de 5 au lieu de 8 (ETAPES.md:167-168 ; la version actuelle, coupOn, est au banc).

## 5. lire:boucle-payante

*Rôle : lecteur « boucle payante » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre. Phase : Extraire.*

### Résumé

Lu : ml/labo/journal/cerveaux.jsonl (112 pilotes, avec leur « raison » et leurs courses graine par graine), generations.jsonl, ml/ecurie/etude/boucle-payante-ryzen/LISEZ-MOI.md, ml/ecurie/ETAPES.md (calibrage K, l.690-730), ml/evolution/genome.js (BORNES, GESTES, PORTAGE), ml/evolution/notes/portage.md, ml/evolution/modele.js (l.261-334), ml/ecurie/etude/realisme.md (l.90-104, l.334), selection-naturelle/PROPOSITIONS.md (l.319-325), et les fichiers des pilotes c0052, c0077, c0108 comparés à leur parent (diff). J'ai recalculé moi-même, par un petit script de lecture, pour chaque variante : enfant moins parent sur les MÊMES graines (palier, courses changées par empreinte, raccourcis, figures et vols par minute). Je n'ai joué aucune course.

Les 87 variantes de C2 (c0026 à c0112), regroupées par idée. Le nombre entre parenthèses est l'écart de palier moyen sur les 6 graines du tri, sauf mention « 20 g ».
- Dessous de la dalle (dessousMax, dessousPose) : 12 versions. Déjà des gènes.
- dessousNitro : 4 versions (c0032 −0,17, c0056 +0,17, c0097 −3,00). Déjà un gène.
- Nitro au sol (seuils de jauge, maintien, allumage, hors décor) : environ 14 versions. libreOn et les gènes jaugeAllume et jaugeCoupe existent déjà. c0093 −4,33, c0075 −2,00.
- Nitro coupée avant le virage selon le temps qui reste (« anticip ») : c0027 −1,17, c0033 −0,17, c0039 −0,83, c0045 +0,50, et avant elles c0012 et c0019. Rien au-dessus du hasard.
- bordNitro (c0070, c0088, c0094, c0105) : un gène.
- Partir en montant au début d'un vol subi (cabré, versRoutePlane, nitro tenue 0,6 s) : 6 versions, toutes négatives. c0034 −0,67, c0040 −0,75 (20 g), c0076 identique au parent, c0082 −0,50, c0099 −2,00, c0111 −0,67. Écartée.
- Choix de la façon qui pénalise une pose loin de l'axe : c0037 −1,67, c0061 −1,00, c0102 −0,83, c0091 −1,83, et avant elles c0016 −2,33 et c0023 −1,33. Toutes négatives. Écartée.
- Lâcher le volant en fin de vol : c0049, c0073, c0079, c0091, c0096. C'est lacheOn, en cours de mesure.
- Une autre loi d'arrivée en vol : c0031, c0043, c0055, c0067, c0085, c0108 (candidat 1).
- Figures à marge large étendues à la ville : c0078, c0090, c0095 (20 g), c0107. Aucune course changée sur 38 : la règle ne se déclenche jamais. Écartée.
- Raccourcis : 13 versions (seuils, fenêtres, filtres hors décor, une seule vue, grotte rouverte, jumeau en ville, route qui lâche). Les seuils sont déjà des gènes.

Les trois choses les plus importantes :
(1) Au tri sur 6 graines, une variante qui change au moins 3 courses perd en moyenne 0,73 palier contre son parent (49 variantes, 15 positives seulement). Sur la 5e graine, elle perd 2,73 en moyenne : le parent y avait eu de la chance. Une note de tri est donc un nouveau tirage moins la chance du parent. Aucune idée ne s'y lit sans un banc apparié.
(2) Les 13 versions « raccourcis » n'ont pas augmenté les raccourcis par minute, sur les mêmes graines : de 0,54 à 1,05, contre 0,70 à 0,97 pour le parent. La seule exception est c0041 (la grotte rouverte, 1,29 contre 0,97), qui perd 2,17 paliers. Les joueurs en font 3,2 par minute. Le manque ne vient donc pas des filtres : il vient de ce que le radar propose.
(3) Peu d'idées hors gènes ont un signal positif, même faible : la nouvelle loi d'arrivée de c0108 (+0,85 ± 0,82 sur 20 graines), le réacteur reconnu dans les sorties voulues (c0052 +1,33 et c0058 +0,83 sur 6 graines), et le raccourci quand la route lâche (c0077 +0,20 sur 20 graines, 2 courses changées). Dans modele.js, le premier défaut n'est corrigé que si retourOn est allumé (l.272 et l.290).

### Candidats

- Nom : Réacteur reconnu dans les sorties voulues  
  Constat : Dans ml/evolution/modele.js, l.272 et l.290, la nitro d'un raccourci n'est tenue que si la façon vaut 'plane' : (R.retours.length?avecNitro(...):facon==='plane'). Si retourOn est éteint, ce qui est le cas à la naissance, les façons viserPlane et versRoutePlane décollent donc nitro éteinte (même test dans ml/ecurie/pilote-voltige.js l.230 et l.248). c0052 corrige ce test et ajoute un bonus de 15 points à viserPlane hors décor. Sur les 6 graines du tri, il fait +1,33 palier contre c0026, avec 2 courses changées sur 6 ([-3 0 +11 0 0 0], calcul à moi depuis cerveaux.jsonl). Sur ces mêmes graines : vols/min 6,27 contre 4,97, figures/min 3,39 contre 2,58, raccourcis/min 0,94 contre 0,97. c0058 (le même correctif, plus la nitro tenue pendant toute sortie voulue hors décor) fait +0,83 avec 4 courses changées. Un écart sur 6 graines vient presque tout entier d'une seule course (+11) : c'est surtout du hasard.  
  Mécanisme : Quand le pilote s'engage dans un raccourci avec une façon à réacteur (viserPlane, versRoutePlane), il tient la nitro dès le décollage. Aujourd'hui, il ne la rallume qu'en vol. En option, un bonus à ces façons quand la jauge le permet, hors décor.  
  Où : Un drapeau dans genome.js (par exemple reacteurOn, éteint à la naissance) et dans modele.js, l.272 et l.290 : (R.reacteurOn>0||R.retours.length)?avecNitro(f):f==='plane'. Un réel raccPlane (0..30) pour le bonus de c0052. Rien à changer dans les yeux.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Inconnu, probablement faible : +1,33 et +0,83 sur 6 graines, portés par une ou deux courses. L'idée se déclenche rarement (environ 0,8 raccourci par minute), donc le banc apparié de 96 graines peut voir un petit effet.  
  Effet attendu sur la ressemblance : Faible attendu. Les joueurs décollent nitro allumée dans 63 % des vols, le pilote dans 27 % (ecart_detail de c0108, nitroDecol). Mais les sorties voulues sont rares (environ 1 par minute, PROPOSITIONS.md l.323), donc la part ne peut monter que de quelques points.  
  Déjà essayé : Oui, deux fois, par la boucle payante le 27/11 : c0052 (gén. 5) et c0058 (gén. 6), parent c0026. Notés sur le tri seulement (mixte -1,63 et -1,46, contre -1,49 pour c0026 sur 20 graines), donc jamais notés en grand. Jamais porté comme gène. Le correctif existe dans modele.js, mais seulement sous retourOn.  
  Coût : Petit : un drapeau et deux tests à changer, une ligne chacun.  
  Confiance : Faible pour le gain, forte pour le défaut (lu dans le code). Il manque une mesure appariée sur beaucoup de graines.
- Nom : Loi d'arrivée en vol réglée sur le temps avant la pose  
  Constat : Sept versions ont touché la fin de la loi « vers la route ». Six sont négatives ou nulles sur 6 graines : c0031 0,00 ; c0043 -1,33 ; c0055 -2,00 ; c0067 -0,67 ; c0085 -3,83 ; c0096 -0,67. Seule c0108 (gén. 14, parent c0101) a été notée sur 20 graines : +0,85 ± 0,82 palier (t environ 1), 19 courses changées sur 20 (calcul à moi depuis cerveaux.jsonl). Son écart aux joueurs se dégrade : 1,525 → 1,636. Son but n'est pas atteint : poses près de l'axe 0,234 contre 0,25 pour c0101, et vols de moins de 0,7 s 0,226 contre 0,151 (ecart_detail). Elle a été refusée sur la note mixte.  
  Mécanisme : Quand la caisse descend vers la dalle, près d'elle et tête en haut, la portée du cap n'est plus 40 m fixes. Elle devient vitesse × temps avant la pose (tgo = hauteur / vitesse de rapprochement, borné à [0,4 ; 1,5] s). L'écart à l'axe s'annule à la pose, avec un cap faible.  
  Où : Un drapeau volTgoOn et deux réels tgoMin et tgoMax dans genome.js. Dans modele.js, le bloc de la loi « vers la route » (l.305, à côté de volRetour), tel qu'écrit dans ml/labo/cerveaux/c0108-pilote.js. Attention : les rayons versRoute du radar recopient cette loi, mais la variante n'agit que pour le pilote (m donné), pas pour le radar.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Inconnu. +0,85 sur 20 graines, mais avec 19 courses changées c'est un nouveau tirage (le hasard d'une course vaut 3,26 paliers). Au banc de 96 graines, un effet de cette taille reste à la limite du visible.  
  Effet attendu sur la ressemblance : Plutôt négatif d'après la seule mesure : E 1,525 → 1,636, plus de vols courts, pas plus de poses près de l'axe.  
  Déjà essayé : Oui, sept fois (c0031, c0043, c0055, c0067, c0085, c0096, c0108), boucle payante, du 27/11 au 28/11. Aucune n'a survécu. lacheOn (en cours au banc) couvre seulement le volant lâché avant la pose, pas cette loi.  
  Coût : Petit : environ 6 lignes déjà écrites dans c0108.  
  Confiance : Faible. C'est le seul signal positif de palier sur 20 graines hors des sacres, mais il s'accompagne d'un écart aux joueurs plus mauvais. Il faudrait le banc apparié.
- Nom : Raccourci cherché quand la route lâche  
  Constat : Le pilote ne cherche un raccourci que si la route tient (modele.js l.284 : if(regarde&&!lache&&...)). c0077 (gén. 9, parent c0072) le permet quand la route lâche, du côté du bord qui arrive. Sur 20 graines : +0,20 palier, seulement 2 courses changées ([+2] et [+2]). E 1,588 contre 1,570. Raccourcis par minute 0,81 contre 0,80 : presque rien ne change. Refusée sur la note mixte (-1,53 contre -1,42).  
  Mécanisme : Quand un virage trop rapide rend la sortie inévitable, le pilote demande au radar une sortie voulue du côté du bord et choisit un plongeon promis, au lieu d'un vol subi.  
  Où : Un drapeau raccLacheOn dans genome.js. Dans modele.js, l.284, le test !lache devient (!lache || (R.raccLacheOn>0 && !sortir && coteBord!==0)), et raccourci() prend un paramètre « seul » (code complet dans ml/labo/cerveaux/c0077-pilote.js).  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Faible attendu : +0,20 sur 20 graines, 2 courses sur 20. Comme il se déclenche rarement, le banc à 96 graines le mesure finement.  
  Effet attendu sur la ressemblance : Quasi nul mesuré : raccourcis par minute 0,81 contre 0,80, E +0,018.  
  Déjà essayé : Oui, une fois : c0077, boucle payante, 27/11. Pas un gène.  
  Coût : Petit : une dizaine de lignes déjà écrites.  
  Confiance : Faible. Le seul gain est deux courses à +2.
- Nom : Un radar de raccourcis qui propose plus de sorties  
  Constat : Treize versions ont élargi les filtres des raccourcis : c0029, c0035, c0053, c0059, c0065, c0071, c0083, c0089, c0100, c0106, c0112, c0041, c0047. Sur les mêmes graines, aucune n'a augmenté les raccourcis par minute (0,54 à 1,05 contre 0,70 à 0,97), sauf c0041, la grotte rouverte (1,29 contre 0,97), qui perd 2,17 paliers sur 6 graines (calcul à moi). Quatre étaient identiques au parent course pour course (c0059, c0106, c0112, c0047). C'est pourtant l'écart aux joueurs le plus grand après le slalom : z -2,27 chez c0101 (raccourcis 0,77 contre 3,2 par minute, ecart_detail). Le radar ne simule que « volant à fond dès maintenant », pour les façons rien, plane et versRoute (modele.js l.145, et le commentaire de raccourci() dans c0077).  
  Mécanisme : Le radar des sorties proposerait aussi d'autres plongeons : départ un peu plus tard, demi-volant, ou un coup de nitro dans le plongeon. PROPOSITIONS.md l.319-325 propose déjà la loi viser plus un coup, avec 0,93 → 1,5 raccourci par minute attendu, jamais couru. Le pilote verrait alors des occasions que les filtres ne peuvent pas créer.  
  Où : Les yeux : ml/bot/yeux.js, rayon() et vue.sorties (PROPOSITIONS.md l.319 : un paramètre coup sur les lois 3 et 4). Puis un drapeau dans genome.js et modele.js pour s'en servir.  
  Change ce que voient les yeux : oui  
  Effet attendu sur le palier : Inconnu. Aucun chiffre ne dit qu'il y a des paliers au bout. Les raccourcis rapportent de la piste (médiane 413 m chez les joueurs, realisme.md l.102), mais c0041 montre qu'ouvrir des plongeons risqués coûte cher.  
  Effet attendu sur la ressemblance : Potentiellement gros, car c'est l'un des plus grands z (-2,27). Mais rien de mesuré.  
  Déjà essayé : Les filtres : treize fois, par la boucle payante le 27/11, sans effet sur le nombre de raccourcis. Le radar élargi lui-même : jamais (proposé dans PROPOSITIONS.md, « je ne l'ai pas fait »).  
  Coût : Gros : il faut changer les yeux, donc tout est rejoué (verifier.js, justesse.js) et Sacha doit être prévenu.  
  Confiance : Moyenne pour le diagnostic (les filtres ne sont pas le goulot, mesuré sur 13 versions). Faible pour le gain.
- Nom : En vol, préférer les ordres pleins tenus à la loi dosée  
  Constat : À l'étape de calibrage (K-sonnet, autre pilote de départ : ml/ecurie/pilote.js), c0011 fait préférer en vol les ordres constants (gauche, droite, pique, cabre, plane), que le radar prévoit juste, à la loi « vers la route » dosée. Sur les 20 graines d'entraînement : +1,60 ± 1,07 palier (20 courses changées, calcul à moi). En validation : médiane 10,5 contre 11 pour le parent, donc refusé (ETAPES.md l.700-712 : « tombé à −0,5 sur des graines neuves »). Deux idées voisines sont négatives sur 6 graines : c0023 (K-opus) -1,33 et c0018 -2,00.  
  Mécanisme : Ne plus croire une promesse de pose de la loi dosée tant que la main ne la tient pas. Préférer une façon constante que le radar simule exactement.  
  Où : Le choix des façons dans enVol (modele.js). Un drapeau et un ou deux réels dans genome.js.  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : Probablement nul : +1,60 à l'entraînement, effacé en validation. Ce n'est pas le même pilote de départ.  
  Effet attendu sur la ressemblance : Inconnu (pas d'écart aux joueurs mesuré à l'étape K).  
  Déjà essayé : Oui : c0011 (K-sonnet, 25/11), refusé en validation. c0018 et c0023 (K-opus), négatifs au tri. Jamais essayé sur pilote-voltige.  
  Coût : Moyen : il faut réécrire la règle pour pilote-voltige.  
  Confiance : Faible. Le seul gain a disparu sur des graines neuves.

### Trous

- Les notes du tri (6 graines, 600 s) ne donnent pas d'écart aux joueurs comparable : celui de l'enfant est calculé sur 6 parties, celui du parent sur 20. Je n'ai donc comparé E que pour les variantes notées sur 20 graines (c0029, c0040, c0057, c0077, c0083, c0089, c0108...).
- Je n'ai pas ouvert les échanges (ml/labo/journal/echanges/*.json.gz) ni les rapports ml/ecurie/agents/*.md un par un. Les « angles » demandés au modèle ne sont vérifiés que par la relecture citée dans boucle-payante-ryzen/LISEZ-MOI.md.
- Pourquoi c0052 gagne 11 paliers sur une seule graine (910074, 3e du tri) : je n'ai pas rejoué la course, donc je ne sais pas si c'est le réacteur ou le hasard d'une trajectoire.
- Je ne sais pas combien de fois par minute une sortie voulue se fait avec viserPlane ou versRoutePlane : le chiffre manque pour prédire l'effet du candidat 1.
- Je n'ai pas vérifié si le coffre (boucle-payante-ryzen/coffre/) contient des courses de c0108, c0052 ou c0077 : a priori non (seuls c0025, c0026, c0064 et c0101 y sont).
- Les idées anciennes (K, c0004 à c0023) partaient d'un autre pilote (pilote.js). Leurs écarts ne se transposent pas directement à pilote-voltige.
- Pour les idées écartées (envol au début du vol subi, pose loin de l'axe dans le choix des façons, nitro anticipée), le seul chiffre est le tri sur 6 graines, que le biais de -0,73 palier rend sévère. Elles sont écartées faute de signal positif, pas prouvées nuisibles.

## 6. lire:genome-et-tetes

*Rôle : lecteur « génome et têtes » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre. Phase : Extraire.*

### Résumé

J'ai lu en entier ml/evolution/modele.js et genome.js, puis config.json, INTERFACES.md § 5.3 à 5.7, SPECIFICATION.md (§ 0, 1, 4, 11, 12) et PROPOSITIONS.md (enquête 2). J'ai aussi lu reglage-de-la-selection/LISEZ-MOI.md, le LISEZ-MOI du banc des gènes, ETAPES.md (l.23-450), ressemblance.js, appuis.js, enregistreur-jeu.js, les étalons et les raisons des 88 pilotes de la boucle payante (ml/labo/journal/cerveaux.jsonl).

J'ai écrit trois petits scripts de lecture, sans lancer une seule course :
- l'écart E mesure par mesure de c0025 sur le coffre ;
- les morts du bras « depart » du banc (54 courses déjà écrites) ;
- l'effet réel d'une mutation des têtes, avec les vrais W1 (graine 161) et la vraie règle de mutation de la phase B, sur l'exemple de vue de l'inventaire : <dossier temporaire>\pi\tetes.js.

Les trois choses les plus importantes :

(1) Les têtes ne peuvent presque rien changer, par construction.
- La tête SOL ne fait que multiplier deux seuils qui ont déjà leur gène (braqueNitro, raccGain) et décaler la ligne de ±5 m au plus.
- La tête RAYON n'est lue que dans la branche de bascule (modele.js l.399-421). Or la règle écrite en dur « tant que la façon tenue mène à une pose, on n'en change pas » (l.363, l.407) l'empêche justement d'agir sur une pose mauvaise : une pose en travers, qui ressort 53 fois sur 100.
- Mon calcul : après UNE naissance en phase B, le seuil de nitro bouge de 0,995 à 1,005 (p10-p90). Après 10 mutations de tête cumulées dans une lignée : de 0,90 à 1,11, la ligne de ±1,7 m, et l'écart RAYON entre deux rayons vaut 8 points en médiane (la bascule en demande 10).
- C'est la taille d'UNE mutation de réglage ordinaire (braqueNitro : σ 0,15 × étendue 1,0). Et ces mutations sont déjà invisibles (τ 0,32 contre un hasard de 3,26).

(2) Rien n'est appris aujourd'hui par les réseaux.
- W2 vaut 0 à la naissance. Les phases B et C ne s'ouvrent qu'après 20 générations sans sacre ou à la génération 60 (config.json, phases.passage).
- Le Ryzen était à la génération 1 (commit 2a3bea3c1).
- Ensuite, ce serait une marche au hasard sur 24 puis 312 poids, sous un bruit dix fois plus grand que l'effet.
- Pour que « apprentissage neuronal par itération » soit plus qu'un mot, il faut une vraie cible apprise par descente de gradient : par exemple l'issue réelle des poses du bot, enregistrée vue par vue. Le cycle serait : récolter, ajuster les poids, juger au banc, recommencer. La sélection ne sert plus qu'à juger.

(3) Les données qui existent vraiment :
- Côté joueurs : 10 parties au clavier, 30,1 min, 16 471 échantillons (10 998 au sol, 5 473 en vol), 256 vols dont 193 de plus de 1,5 s. Pas de jauge, pas de touches (seulement la flamme et le volant lissé), pas de graine : on ne peut pas les rejouer dans le simulateur.
- Côté bot : ml/ecurie/agents/tmp-voltige/vols-*.json (hors git, sur ce PC seulement) contient 2 704 vols, 63 293 vues avec rayons et issue, 683 re-sorties, avec beaucoup de doublons et des pilotes du 26-27/11.

Le plus gros défaut mesuré qui reste : la pose en travers puis la re-sortie. 10 morts sur 20 arrivent dans la seconde qui suit une sortie (ETAPES.md l.214).

### Candidats

- Nom : La valeur apprise d'une pose (la tête RAYON entraînée sur les vols du bot)  
  Constat : L'issue réelle d'une pose dépend de son angle annoncé : axe annoncé ≥ 0,35 rad → glisse 0,57 et 53 % de re-sorties (40 poses) ; axe < 0,2 → glisse 0,21 et 13 % de re-sorties (31 poses) (ml/ecurie/etude/selection-naturelle/mesures-27nov/out-pR2-930000.txt, l.103). Le bot : 36 % de poses suivies d'une re-sortie en moins de 0,8 s, dont 6 mortelles ; les joueurs : 29 %, 1 mortelle (ml/ecurie/ETAPES.md l.227). « 10 des 20 morts arrivent dans la seconde qui suit une sortie de route » (l.214). Pourtant vaut() note encore une pose à 0,5 rad environ 90 points (modele.js l.347 : 100 − 20 × |axe| − 3t…). Et la règle écrite en dur « tant que le radar dit que la façon tenue mène à une pose, on n'en change pas » (l.363 ; condition l.407) ferme la seule porte par laquelle la tête RAYON agit (sMien et les candidats ne servent que dans ce if, l.399-421).  
  Mécanisme : 1) Hors du jeu, ajuster par descente de gradient les 222 poids de WV pour prédire l'issue réelle du rayon de la façon tenue (0 = pose sans re-sortie, 1 = re-sortie en moins de 0,8 s ou mort). Les entrées sont les 36 déjà définies, plus des champs que le rayon porte et que personne ne lit (imp, note, air, bumps : voir une vue de vols-pDiag-930000.json). 2) Un drapeau « valeurOn » (éteint à la naissance) : WV appris + une bascule « pour mieux » ouverte quand la tête annonce une pose tenue mauvaise et qu'un autre rayon de retour annonce une pose propre dessus. C'est le geste volMieux (déjà un gène, l.404) avec la tête comme juge, au lieu de la seule différence de vaut(). 3) Le banc juge l'idée allumée contre c0025 sur 96 graines. 4) On recommence : on récolte les vols du nouveau pilote, on réajuste, on rejuge. C'est le seul endroit du système où quelque chose serait vraiment appris.  
  Où : ml/evolution/modele.js (le branchement de teteRayon dans enVol et la bascule) + un gène dans genome.js (drapeau + WV appris comme naissance d'une variante) + un petit outil d'ajustement hors du jeu (node, lecture des vols enregistrés)  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : inconnu. Plafond grossier : la moitié des morts suit une sortie dans la seconde (ETAPES.md l.214), mais une partie sont des premières sorties, que la pose ne touche pas. Aucun chiffre ne permet de dire combien la tête en sauverait.  
  Effet attendu sur la ressemblance : probablement favorable mais petit : moins de re-sorties = moins de vols courts. volsCourts vaut 0,257 contre 0,138 chez les joueurs, z +1,64 (mon calcul sur les 29 courses mesurées de c0025 au coffre, ml/ecurie/etude/boucle-payante-ryzen/coffre/sorties/courses-coffre.jsonl). Pour E, une mesure ramenée d'un écart-type vaut environ 1/15 ≈ 0,07.  
  Déjà essayé : Jamais appris. Repondéré à la main par la boucle payante (une pose loin de l'axe perd des points) : c0037, c0061, c0091, c0102 (ml/labo/journal/cerveaux.jsonl). Aucune n'a été sacrée (ml/ecurie/etude/boucle-payante-ryzen/donnees/tableaux.md), et toutes ont été jugées sur 6 graines au tri. « Quitter une pose annoncée de travers… » : verdict « douteux » (PROPOSITIONS.md, enquête 1, proposition 3).  
  Coût : moyen à gros. Le code du pilote : une vingtaine de lignes. L'ajustement : un petit script, sans course. Mais les données de vols du bot actuel sont à refaire : celles de tmp-voltige datent de pilotes d'avant les gestes, sont hors git, avec beaucoup de doublons (plusieurs fichiers ont exactement 171 vols et 3 802 vues), et ne gardent que 6 façons par vue. Il faut environ 100 courses avec une sortie vue par vue, puis 96 × 2 au banc.  
  Confiance : moyenne sur le constat (deux mesures concordantes), faible sur le gain. Il manque : (a) le nombre de vues où la bascule s'ouvre dans le pilote actuel ; (b) si l'issue observée d'une façon tenue suffit à juger les autres façons (on ne voit jamais ce qu'aurait donné la façon non jouée).
- Nom : Le frein au sol sur les maps à décor (canyon d'abord)  
  Constat : Au canyon, 57 % des vols du pilote finissent par une mort, contre 20 % chez les joueurs (ETAPES.md l.178). Sur le coffre, c0025 meurt 9 fois contre la paroi et 2 fois « canyon » sur 40 courses (mon compte sur courses-coffre.jsonl) ; les joueurs : paroi 2 sur 14 (ml/bot/results/etalon.json, causes). « Essayé sans effet mesurable : rouler dans l'axe sans nitro (1,35 sortie par minute contre 1,54)… Non essayé : freiner » (ETAPES.md l.429-431). La main sait freiner (ml/bot/doigts.js l.5 : « au sol ↓ freine, et drifte si le volant est tenu »). Le pilote ne demande jamais de manche au sol : « ni saut, ni figure… ni drift, ni frein », écrit en dur (modele.js l.43 ; aucun ordre manche dans auSol). Le header de pilote-voltige dit qu'à 400 km/h un coup long tourne la caisse d'un demi-radian (modele.js l.27-28) : l'écart dû à la main grandit avec la vitesse.  
  Mécanisme : Un drapeau « freinOn » (éteint à la naissance) et 2 ou 3 réglages. Sur une map à décor, quand vue.tenue annonce le bord (tient === false, t sous un seuil) ou que le cap dépasse un seuil, le pilote ajoute manche:+1 à son ordre au sol, sans volant demandé, pour ne pas partir en drift. On peut aussi en faire une 4e sortie de la tête SOL, muette à la naissance. vue.virage.vSure et vSureDrift sont déjà dans la vue et ne sont pas lus (modele.js ne lit que vg.d et vg.marge).  
  Où : ml/evolution/modele.js (auSol, l'ordre rendu) + genome.js (drapeau et réglages, dans GARDES)  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : inconnu. Le canyon pèse de 7 % (banc, bras depart : paroi 4 sur 54) à 27 % (coffre : 11 sur 40) des morts de c0025 selon la plage de graines. Freiner coûte aussi des pièces par minute (moins de piste parcourue).  
  Effet attendu sur la ressemblance : inconnu, plutôt défavorable : la vitesse des deux premières minutes est déjà basse (413 contre 450 km/h, z −0,55, mon calcul). Freiner en tenant le volant donne un drift, et les joueurs ne driftent presque jamais (drift_pct 0,1 %, ml/bot/results/appuis-essai-main-allege-t120.json). On ne sait pas si les joueurs freinent : l'enregistreur ne garde pas les touches (code/moteur/enregistreur-jeu.js l.88-89).  
  Déjà essayé : Une fois, autrement : c0005 (K-haiku, parent c0003 = pilote.js) freinait seulement au-dessus de la vitesse sûre du virage. Sur 20 graines, ses paliers sont ceux du parent à une course près (5 → 4, ml/labo/journal/cerveaux.jsonl) : le frein ne se déclenchait presque jamais, puisque « vSure gardait 300 m/s de marge » (ETAPES.md l.418-419). Jamais essayé comme frein contre la sortie au canyon. c0015 (bande étroite ±13 m et nitro rare au canyon) : médian 11 contre 11.  
  Coût : petit (une quinzaine de lignes, deux ou trois gènes), puis un bras du banc. Le banc est fin ici : l'idée ne se déclenche que sur les maps à décor, donc beaucoup de courses resteront identiques.  
  Confiance : faible. Il manque une mesure : combien des sorties au canyon partent d'une vitesse où freiner aurait le temps d'agir (la main met 0,15 à 0,38 s à obéir au manche, doigts.js, reaction.manche du clavier).
- Nom : Le lacet au contact donné aux rayons (une information qui manque)  
  Constat : Le radar annonce l'angle de la caisse au contact, pas celui qu'elle aura après la glisse. À la dernière vue, on lit 0,29 pour une glisse réelle de 0,36, et 0,60 pour 0,64 (PROPOSITIONS.md, enquête 2, « Les yeux : le lacet au contact », l.138-141). Sous volant fort, l'axe grandit dans les 0,2 s avant le contact pour 75 poses sur 108 (même fichier, « Mesures refaites »). Aucun champ de ce genre dans ml/bot/yeux.js (aucune trace de axe03 ou de lacet au contact).  
  Mécanisme : Dans les yeux, chaque rayon qui se pose porte en plus le lacet de la caisse au contact et le cap estimé 0,3 s après. vaut() et la tête RAYON (candidat 1) lisent ce cap au lieu de l'axe brut. Sans ce champ, la tête RAYON apprise ne peut pas distinguer deux poses au même axe dont l'une va tourner.  
  Où : ml/bot/yeux.js (les rayons), puis modele.js (vaut et une entrée de plus pour la tête RAYON, donc une tête plus large : 37 entrées)  
  Change ce que voient les yeux : oui  
  Effet attendu sur le palier : inconnu. Seul, il ne change rien : il ne vaut que par ce que le pilote en fait (candidat 1, ou une pénalité de vaut()).  
  Effet attendu sur la ressemblance : inconnu  
  Déjà essayé : jamais (proposé par l'enquête 2 le 27/11, renvoyé « à l'agent qui occupe les yeux »)  
  Coût : gros : changer yeux.js change l'époque. Toutes les courses sont rejouées, verifier.js et justesse.js sont à repasser, les rejeux exacts à contrôler. Sacha doit être prévenu.  
  Confiance : moyenne sur le manque d'information (mesuré), faible sur le gain
- Nom : La loi d'arrivée en vol, écrite enfin comme un gène  
  Constat : La loi « vers la route » vise −lat/40 m, bornée à 0,6 rad, avec un gain de 1,6, écrits en dur (modele.js l.305-306 ; LOI_PILOTE l.60). Le vérificateur de l'enquête 2 : « au contact, elle demande 0,5 rad vers l'intérieur en médiane (la borne dans 37 % des poses) : c'est la cause directe des arrivées à plus de 0,5 rad » (PROPOSITIONS.md, enquête 2, « Ce que l'enquête n'a pas vu »). Son premier choix, « le cap de rentrée borné quand le contact approche » (capRentree 0,3, rentreeT 0,9 s, l.121-124), n'est devenu ni un geste ni un gène (absent de GESTES et PORTAGE, genome.js l.72-135). volRetour ne change que la portée, et retCap (0,45 à 0,9) ne règle que la loi « retour » des yeux.  
  Mécanisme : Un drapeau « rentreeOn » : à moins de rentreeT secondes du contact annoncé par le rayon de la façon tenue, le cap visé est borné à capRentree au lieu de 0,6. On peut aussi écrire la loi de c0108 (vitesse latérale visée = écart / temps restant avant la pose) comme second interrupteur. Le banc juge chaque version à 96 graines.  
  Où : ml/evolution/modele.js (versRoute) + genome.js (un drapeau, deux réglages, dans GARDES)  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : inconnu. Aucune des variantes déjà jouées ne s'est détachée au-delà du bruit d'un tri à 6 graines (environ ±2 paliers, ETAPES.md l.713).  
  Effet attendu sur la ressemblance : inconnu. Peut-être poseCentre (0,274 contre 0,409, z −1,10, mon calcul sur le coffre).  
  Déjà essayé : Oui, souvent, par hauteur et non par temps. La boucle payante en a écrit 11 variantes : c0031, c0043, c0049, c0055, c0067 (cap 0,35 sous 30 m), c0073, c0079, c0085, c0091, c0096 (cap 0,3 sous 30 m), c0108 (ml/labo/journal/cerveaux.jsonl). Aucune n'a été sacrée (tableaux.md) ; c0108, la seule notée sur 20 graines, fait un palier médian de 8,5. faire-pZ.js (cap borné une fois au-dessus de la dalle) : 193, 186, 223, 163 paliers contre 193 (ETAPES.md l.236-237). La loi « retour » réglée à la main : glisse 0,32 contre 0,38, morts dans le bruit (commit 49012f2d9).  
  Coût : petit (dix lignes, trois gènes), un ou deux bras du banc  
  Confiance : faible : l'idée a été jouée 11 fois sans gain visible. Elle ne mérite le banc que parce que ces essais étaient trop petits (6 graines) pour voir moins de deux paliers.
- Nom : La loi de vol des joueurs, apprise sur l'étalon (une nouvelle sortie de tête)  
  Constat : Dans la dernière demi-seconde avant la pose, le volant médian vaut 0,03 chez les joueurs et 0,51 chez le bot. Le volant à fond tenu 0,54 s ou plus : 6 % des vols contre 39 % (PROPOSITIONS.md, enquête 2, vérificateur, « Mesures refaites »). Les données existent : 10 parties au clavier, 256 vols dont 193 de plus de 1,5 s, 5 473 échantillons en vol à 10 par seconde (mon compte avec ml/bot/mesures.js et voltige.js sur ml/bot/etalon/). Chaque échantillon a lat, h, x, y, z, kmh et le volant lissé, et la géométrie de la route (cap, pente, dévers tous les 20 m) est dans l'export (enregistreur-jeu.js l.34, l.88-89).  
  Mécanisme : Ajuster hors du jeu une petite tête « volant en vol ». Les entrées se reconstruisent depuis l'étalon : écart et angle à la route, hauteur, vitesse latérale, temps jusqu'à la pose (lu après coup dans l'événement « pose »). La cible est le volant lissé des joueurs. On la branche, muette à la naissance, à la place du volant de versRoute (un drapeau), puis on la juge au banc.  
  Où : ml/evolution/modele.js (une 3e tête, ou des sorties de plus) + genome.js ; un outil d'ajustement sur ml/bot/etalon/  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : inconnu, et risqué. Les rayons versRoute des yeux jouent la loi des yeux, pas celle-ci : le radar ne prédirait plus la façon tenue, sauf par le rayon « tenu » après 0,45 s (modele.js l.390). Il faudrait sans doute un rayon de plus dans les yeux.  
  Effet attendu sur la ressemblance : probablement favorable sur le vol (volant, glisse) ; aucune des 15 mesures de E ne lit directement le volant en vol (ml/bot/ressemblance.js l.28-33)  
  Déjà essayé : Jamais par imitation. SPECIFICATION.md § 11 repousse l'imitation (DAgger, environ 600 courses selon § 1) parce qu'elle « ne donne au mieux… que pilote-voltige » quand on imite le pilote. Ici on imiterait les joueurs, pas le pilote.  
  Coût : gros : un outil de reconstitution (route, angle à la route), une tête nouvelle, probablement un rayon de plus dans les yeux, puis le banc  
  Confiance : faible. 193 vols de 2 joueurs, c'est peu. La correspondance entre l'export et la vue n'est pas vérifiée (SPECIFICATION.md § 11).
- Nom : La nitro au sol des joueurs, apprise par la tête SOL  
  Constat : La nitro au sol : 0,631 chez c0025 contre 0,779 chez les joueurs (z −1,27) ; la nitro sur tout le temps : z −0,85 (mon calcul sur le coffre). L'étalon au clavier donne 10 998 échantillons au sol (mon compte). Sur les 12 entrées de la tête SOL (INTERFACES.md § 5.6), environ 6 se reconstruisent depuis l'export : l'écart, le cap (par x, z et le cap de la route), la vitesse, le palier (cumul des événements « piece » et seuils ENGINE_TIERS, code/gameplay/pickups-fruits.js l.557), la map, la route à 400 m. Manquent : la jauge (l'export ne garde que la flamme), la marge du virage (vSure est interne au jeu), la tenue, le couloir, la force (lacetMax).  
  Mécanisme : Ajuster W2 (et W1) de la tête SOL pour que sa sortie « seuil de nitro » reproduise la flamme des joueurs sur les entrées reconstruites, les entrées manquantes mises à 0. Puis la brancher comme variante éteinte à la naissance et la juger au banc.  
  Où : ml/evolution/modele.js (rien à changer si l'on garde la sortie actuelle) + les poids comme naissance d'une variante ; outil d'ajustement sur ml/bot/etalon/  
  Change ce que voient les yeux : non  
  Effet attendu sur le palier : probablement négatif. Plus de nitro a déjà coûté des paliers : 38 % du temps → palier médian 8 à 8,5 au lieu de 9,5 ; 53 % → 7 (ETAPES.md l.108-110) ; « nitro presque partout » → 2 paliers et les figures en moins (l.258-266).  
  Effet attendu sur la ressemblance : petit : au mieux nitroSol et nitro ramenées près de 0, soit environ (1,27 + 0,85) / 15 ≈ 0,14 sur l'écart classique  
  Déjà essayé : Jamais par imitation (SPECIFICATION.md § 11 : « tête nitro des joueurs… correspondance export ↔ vue non vérifiée »). À la main, une dizaine de fois : c0027, c0033, c0039, c0045, c0051, c0057, c0063, c0075, c0093 (cerveaux.jsonl), et faire-pN.js (ETAPES.md l.250-267). La variante c0087 (libreOn) est déjà au banc.  
  Coût : moyen (la reconstitution des entrées est le gros du travail)  
  Confiance : faible : c'est faisable avec les données qui existent, mais le gain le plus probable est petit et va contre le palier. C'est surtout la démonstration qu'on peut apprendre des joueurs.

### Trous

- Le nombre de vues où la bascule en vol s'ouvre vraiment dans le pilote actuel : c'est la seule porte de la tête RAYON. Le seul indice date d'un pilote plus ancien (out-pDiag-930000.txt, table A : à la 4e vue, environ 48 vols sur 128 avaient un rayon tenu qui ne sauvait pas).
- Les vols enregistrés vue par vue (ml/ecurie/agents/tmp-voltige/vols-*.json : 2 704 vols, 63 293 vues) sont hors git, sur ce PC seulement. Ils viennent de pilotes du 26-27/11, contiennent beaucoup de doublons et ne gardent que 6 façons par vue. Pour apprendre sur c0025 tel qu'il est, il faut les refaire (environ 100 courses avec une sortie vue par vue).
- Les parties des joueurs ne gardent ni la jauge, ni les touches (seulement la flamme et le volant lissé), ni la graine : on ne peut ni les rejouer dans le simulateur, ni savoir si les joueurs freinent.
- Mon écart E de c0025 (1,80 sur 29 courses mesurées du coffre) est l'écart « classique » de ressemblance.js. L'E de la sélection (0,91) est calculé autrement (note.js, zone morte et poids). Je n'ai pas refait l'E de la sélection mesure par mesure.
- La cause « tour » pèse 15 morts sur 54 dans le bras depart du banc, mais 3 sur 40 au coffre. Les lignes de courses ne disent pas sur quelle map on meurt : je ne peux pas dire si c'est la ville ou la jade, ni pourquoi.
- Le manque de pièces par minute (224 dans le bras depart du banc, 436 chez les joueurs) vient en partie de la vitesse, et la vitesse monte avec le palier (push 1,34 au palier 6, 1,78 au palier 11, ENGINE_TIERS). Je n'ai pas pu séparer la part qui ne dépend pas du palier.
- L'effet des mutations de tête est calculé sur UNE seule vue d'exemple (inventaire/vue-exemple.json), sol et vol. Sur d'autres vues, les tanh peuvent saturer autrement.
- Les résultats du banc des gènes ne sont pas encore écrits (LISEZ-MOI : « à venir »). Si largeOn, lacheOn ou suitOn changent la pose, l'intérêt des candidats 1 et 4 change aussi.

## 7. classer

*Rôle : classeur : fusionne les candidats, retire les doublons, classe et écrit le dossier. Phase : Classer.*

### Résumé

J'ai fusionné les candidats des six lecteurs en 12 idées pour la liste courte et 14 pour la liste longue, dans ml/ecurie/etude/prochaines-idees/. Aucune course n'a été jouée et rien n'a été commité. J'ai vérifié moi-même :
- les lignes de code citées : modele.js l.43, 50, 250, 254, 272, 284, 290, 300-307, 334, 407 ; yeux.js l.765-767 et 789 ; ressemblance.js l.28-33 ; doigts.js l.5 et 97 ; genome.js l.52 et 208 ;
- deux comptes, refaits par un script de lecture. Dans les journaux de la famille c0025 (1 052 courses), le canyon n'est traversé vivant que 4 fois sur 248 passages, avec des morts au canyon sur 15 graines différentes, et les 68 courses au palier 14 ou plus ont toutes pris la seconde chance. Au bras « depart » du banc (56 courses), les causes de mort sont : tour 15, roche 12, air 12, vide 7, pic 5, paroi 4, glace 1 ; palier moyen 6,57.

Les autres chiffres viennent des lecteurs et sont marqués comme tels dans le dossier. Pour le nombre de graines, j'ai tiré une règle du LISEZ-MOI du banc : n ≈ 96 / (f × d²), où f est la part des courses que l'idée change et d l'effet sur ces courses. C'est une approximation, et elle est écrite comme telle.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\prochaines-idees\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\prochaines-idees\candidats.json

### Retenus

- 1 (A) Le frein d'urgence au sol sur les maps à décor (le canyon d'abord), avec une variante drift. Gènes freinOn, freinAvance, freinVmin, freinCanyon, freinVille, freinGrotte, freinDrift. Quatre lecteurs le proposent. Environ 150 graines si l'idée vaut 1,6 palier sur le quart des courses qui passent par le canyon.
- 2 (B, la main) La seconde chance prise dès la première mort après 20 s. Gène chancePalierMin, entier de 1 à 30, naissance 12. Gain estimé de +2,1 à +2,5 paliers, de façon optimiste. Décision de Sacha (CONSIGNES.md l.149).
- 3 (A) La sortie préparée sur les maps à décor : la nitro gardée et la façon plane choisie quand le rayon plane du bord est le seul à se poser. Gènes sortieOn et sortieT.
- 4 (A) La loi « retour » mise au banc : retourOn et volMieux existent déjà mais ne font pas partie des 13 bras. Aucun code neuf.
- 5 (A) Le réacteur reconnu : un défaut lu dans le code. Avec retourOn éteint, viserPlane et versRoutePlane décollent nitro éteinte (modele.js l.272 et l.290, contre avecNitro l.334). Gène reacteurOn.
- 6 (A) La loi fidèle : une loi « retour » réglée pour jouer la loi du pilote, et jugée sur son propre rayon. Gène loiFidele.
- 7 (B, la note) Une note E qui voit le volant braqué en vol, la nitro en vol et la largeur d'un aller. Décision de Sacha, à grouper avec une nouvelle époque.
- 8 (A) Le volant lâché en vol une fois le cap pris, avec une hystérésis. Gènes volLacheOn, volLacheCap, volLacheRepart.
- 9 (B, les yeux) La pose suivie au sol : le lacet au contact et 0,8 s de route simulée après la pose. Gène poseSuivieOn. Sacha prévenu.
- 10 (C) La tête RAYON qui apprend l'issue des poses par descente de gradient. Gène valeurOn. Il faut d'abord une récolte d'environ 100 courses enregistrées vue par vue.
- 11 (B, les yeux) Les rayons de secours en vol, quand tous les rayons annoncent la mort. Gène secoursOn. Sacha prévenu.
- 12 (A) Pas de toupie : gauche ou droite seulement vers une pose propre. Gènes toupieOn, toupieAxe, toupieT. À juger après la loi fidèle.

### Problèmes

- La plupart des chiffres de constat viennent des lecteurs et je ne les ai pas revérifiés : ils sont marqués « (lecteur X) » dans le LISEZ-MOI. Seuls les comptes du canyon, de la seconde chance au palier 14 ou plus, des causes du bras depart, et les lignes de code citées ont été refaits par moi.
- Mon compte des traversées par map (ville 35 %, jade 64 %, grotte 53 %) diffère un peu de celui du lecteur défauts (42 %, 73 %, 57 %), parce que je compte une map comme mortelle dès qu'une mort y a lieu. Le chiffre du canyon (4 sur 248) est le même.
- Les journaux rejouent environ 40 graines avec des pilotes proches : les comptes ne sont pas indépendants.
- Le banc est en cours (55 à 56 graines par bras) : aucun verdict n'est utilisé.
- Les bornes et les naissances des réglages proposés (freinAvance 0,6, sortieT 0,7, etc.) sont des choix raisonnables, non mesurés.
- La règle n ≈ 96/(f d²) est une approximation déduite de la phrase du banc « un effet d'environ 1 palier à 96 graines ».
- Je n'ai pas vérifié si identite.js accepte un PROFIL dans le génome (candidat 2), ni si lireRetours accepte une marge jusqu'à 200 (candidat 6, affirmation du lecteur vol-et-yeux).

## 8. attaquer:chiffres

*Rôle : relecteur « chiffres » : rouvre chaque source citée et recontrôle chaque chiffre. Phase : Attaquer.*

### Résumé

J'ai relu la liste courte en allant aux chiffres à la source. Je n'ai joué aucune course : j'ai seulement relu les journaux et les fichiers .json, et refait des comptes avec de petits scripts de lecture dans le scratchpad. Ce qui tient : les lignes de code citées (modele.js l.43, 50, 250, 254, 272, 290, 334, 407 ; yeux.js l.765-767 et 789 ; doigts.js l.5 et 97 ; ressemblance.js l.28-33 ; CONSIGNES.md l.149) ; le défaut du réacteur ; le compte des journaux (1 052 courses, 88 pilotes, canyon 4 sur 248 et 15 graines, 68 courses au palier 14 ou plus, toutes avec deux morts) ; le bras depart (56 courses, palier 6,57, causes exactes) ; le pilote de note-voltige4-t900.json, qui est bien c0025 (sha c3e8b819… = pilote-voltige.js actuel), avec 22 morts, dont 8 moins d'1 s après une sortie par le bord (grotte 5, canyon 2, ville 1) et 7 vols perdus de 5 à 6 s. Ce qui cloche, et c'est grave : le n° 1 (le frein au canyon) repose sur un chiffre mesuré sur l'ancien pilote.js. Son « 4 sur 248 » oublie que le canyon est deux fois plus long que les autres maps. Et la source la plus récente sur le pilote actuel dit en toutes lettres qu'il ne faut pas chercher le gain au canyon. Pour c0025, les grands tueurs sont la grotte (dans sa grande note) et la ville (au banc), pas le canyon. Toutes les lignes citées dans ETAPES.md sont décalées de 68 : l'agent a lu une version d'avant la mise à jour du 28/11. D'autres chiffres viennent du mauvais pilote ou de la mauvaise variante : le 53 % du n° 10 (variante pR2), les pouvoirs de séparation du n° 7 (pilote.js), et c0058, cité pour le n° 5 alors qu'il porte l'idée bordOn. Enfin, le n° 8 a déjà été jugé « douteux » le 27/11, ce que le dossier ne dit pas.

### Défauts relevés

- Idée : n° 1 Le frein d'urgence au sol (constat « le canyon tue presque toujours »)  
  Défaut : Le constat central est périmé et trompeur. (a) Le chiffre « joueurs 5,9 contre pilote 16,0 morts pour 10 min au canyon » vient de l'ancien pilote.js, pas de c0025. (b) Le « 4 traversées sur 248 » compare des maps de longueurs différentes : le canyon fait 16,3 à 16,8 km, les autres 6 à 11 km. Il vient de 15 graines rejouées par 88 pilotes proches, et la seule graine 910111 donne 78 des 253 morts au canyon, au même endroit (s ≈ 13 400 m). (c) La source sur le pilote actuel conclut le contraire du dossier, qui ne le dit pas. (d) Sur les courses de c0025 lui-même, le canyon pèse peu : f ≈ 0,25 et « environ 150 graines » sont surestimés. (e) « Non essayé : freiner » et « vSure gardait 300 m/s de marge » décrivent pilote.js (25/11), sans que ce soit précisé.  
  Preuve : (a) ml/ecurie/etude/realisme.md l.25 (source : note-pilote-v1.json, pilote.js) et l.180. (b) Longueurs des routes dans ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json : canyon 16 291 à 16 820 m ; espace 9 139 à 10 955 ; nuages 6 275 à 7 889 ; grotte 9 324 à 13 293 ; ville 6 636 à 7 807. Recompte des journaux ml/labo/journal/*.jsonl (c0025 et après) : 253 morts au canyon (paroi 245, toutes en vol, air 8), dont 78 à la graine 910111 vers s 13 400. En morts pour 100 km (approché avec les longueurs médianes) : canyon 15,6, ville 12,7, grotte 6,5, espace 4,7, jade 4,4, nuages 3,7. (c) ml/ecurie/etude/selection-naturelle/PROPOSITIONS.md l.93 : « Le canyon n'est pas un point faible propre au bot… 2 sorties sur 9 mortelles dans la seconde des deux côtés… Il ne faut donc pas y chercher le gain » ; l.97 : canyon identique. (d) note-voltige4 (c0025, 20 courses) : 3 morts au canyon sur 22 contre 10 à la grotte ; 9 sorties par le bord au canyon, 58 à la grotte. Bras depart du banc (etat/courses-2026-48.jsonl, 56 courses) : paroi 4 sur 56. (e) ml/ecurie/ETAPES.md l.487 et l.499, section « L'étape C, premier temps : le premier pilote (25/11/2026) » (l.438).  
  Gravité : bloquant  
  Correction proposée : Réécrire le constat à partir de c0025. Partir de PROPOSITIONS.md enquête 2 l.93-97 et de note-voltige4 (canyon 2 sorties mortelles sur 9, comme chez les joueurs), et dire que le canyon est le plus long. Comparer les maps en morts par km ou par minute, pas en « traversées ». Retirer realisme.md l.180, ou le marquer « pilote.js ». Préciser que les morts au canyon arrivent toutes en vol, contre la paroi : le frein doit donc empêcher la sortie elle-même, ce qui demande de mesurer d'abord combien de vitesse il retire en 0,5 s. Recalculer f sur le banc (paroi 4 sur 56, soit un plafond de f vers 0,07) plutôt que sur 15 graines rejouées. Donner le bras freinGrotte (la grotte : 10 morts sur 22 de c0025) avant freinCanyon, ou rétrograder l'idée sous le n° 3.
- Idée : Toutes les idées qui citent ml/ecurie/ETAPES.md (n° 1, 3, 11 et la liste longue)  
  Défaut : Chaque numéro de ligne cité dans ETAPES.md est faux, décalé de +68. L'agent a lu une version antérieure, sans doute avant l'ajout de « OÙ ON EN EST… mis à jour le 28/11 ». La règle « chemin + ligne » n'est donc tenue nulle part pour ce fichier.  
  Preuve : Dans ETAPES.md actuel : « Non essayé : freiner » est l.499 (cité l.431) ; « 10 des 20 morts… » l.282 (cité l.214) ; « vSure gardait 300 m/s » l.487 (cité l.418-419) ; c0005 l.768 (cité l.700) ; coups de nitro « à l'aveugle » l.235-236 (cité l.168) ; « changer de façon… pire » l.490 (cité l.422) ; « 38 % → 8 à 8,5 » l.177 (cité l.108-110). Les lignes citées tombent sur la chaîne payante (l.418-431) ou la boucle C bis (l.700).  
  Gravité : serieux  
  Correction proposée : Remplacer tous les numéros de ligne d'ETAPES.md par les bons, ou par le titre de section. Ajouter à côté de chaque citation le pilote concerné (pilote.js, pilote-voltige d'avant la loi corrigée, ou c0025).
- Idée : n° 10 La tête RAYON qui apprend l'issue des poses  
  Défaut : Le chiffre « une pose annoncée à 0,35 rad ou plus ressort 53 fois sur 100 » vient de la variante pR2, la loi « retour » allumée, pas de c0025. Sur c0025, mêmes graines, c'est 33 %. (Mineur : la tête RAYON entre aussi au choix du départ, l.383, quand les lois retour sont allumées.)  
  Preuve : ml/ecurie/etude/selection-naturelle/mesures-27nov/out-pR2-930000.txt l.103 : « axe annonce >= 0,35 (40) : glisse 0.57, re-sorties 53 % » (pR2 = retourOn). out-pDiag-930000.txt l.115 (pDiag = pilote-voltige plus une ligne de trace) : « >= 0,35 (58) : glisse 0.57, re-sorties 33 % » ; out-bA.txt l.110 : 25 %. modele.js l.383 : teteRayon dans le choix du départ.  
  Gravité : bloquant  
  Correction proposée : Citer 33 % sur 58 poses (out-pDiag-930000.txt l.115) pour c0025, et garder 53 % seulement comme chiffre de la loi retour. Dire que la tête agit aussi l.383 quand retourOn = 1.
- Idée : n° 7 Une note qui voit ce que voit le juge  
  Défaut : Les pouvoirs de séparation 0,919, 0,893 et 0,754 ont été mesurés sur l'ancien pilote.js, qui ne volait presque pas, pas sur c0025. « Proposé le 26/11, jamais intégré » est en partie faux : quatre mesures de la même liste sont déjà dans E (aller, nitroSol, dessous, poseCentre).  
  Preuve : ml/ecurie/etude/realisme.md l.261 (discerner.js sur note-pilote-v1.json, pilote.js) et l.287-296 ; ml/bot/ressemblance.js l.28-33 : 'aller', 'nitroSol', 'dessous', 'poseCentre' y figurent. Chiffres de c0025 disponibles : PROPOSITIONS.md enquête 2 l.104, |volant| moyen en vol 0,48 à 0,57 contre 0,21 à 0,27 chez les joueurs, 206 vols de chaque côté.  
  Gravité : bloquant  
  Correction proposée : Remplacer les pouvoirs de séparation par les écarts mesurés sur c0025 (PROPOSITIONS l.104 plutôt que la seule course à 59 %), ou refaire juge-etendu.js sur note-voltige4 sans jouer. Écrire « 4 des 16 mesures de realisme § 3 intégrées le 26/11, pas le volant en vol ni les allumages de nitro en vol ».
- Idée : n° 5 Le réacteur reconnu dans les sorties voulues  
  Défaut : c0058 est cité à l'appui (+0,83) alors qu'il ne corrige pas le test du réacteur. Il garde la nitro pendant les sorties voulues sur les maps sans décor : c'est l'idée bordOn, déjà au banc. Seul c0052 porte la correction. Son +1,33 compare aussi un tri de 600 s à son parent c0026 joué en 900 s.  
  Preuve : ml/labo/journal/cerveaux.jsonl : c0058, raison « sur les maps sans décor (nuages, espace), si la jauge dépasse 0,5, la nitro reste tenue pendant toute la sortie voulue », tri tmax 600, paliers 7,11,10,8,13,3. c0052 : tri tmax 600, paliers 7,10,16,8,11,3 (somme 55). c0026 : entraînement tmax 900, mêmes 6 graines 10,10,5,8,11,3 (somme 47). +1,33 vient de la seule graine 910074 (16 contre 5).  
  Gravité : serieux  
  Correction proposée : Retirer c0058 du dossier du n° 5, ou le citer comme preuve que l'effet est confondu avec bordOn. Signaler l'écart de tmax (600 contre 900 s). Ajouter qu'un bras reacteurOn et le bras bordOn agissent au même moment : lire les deux ensemble.
- Idée : n° 8 Le volant lâché en vol une fois le cap pris  
  Défaut : « Déjà essayé : jamais » cache un verdict déjà rendu. La même idée, une bande morte en vol, a été proposée et jugée « douteux » par le vérificateur du 27/11. Selon lui, le volant fort vient du cap borné à 0,6 rad au bord, pas des petites erreurs, et la main écrase déjà les petits ordres.  
  Preuve : ml/ecurie/etude/selection-naturelle/PROPOSITIONS.md enquête 2, « Une bande morte en vol, comme la main d'un joueur — VERDICT : douteux », l.126-131 (« peu d'effet sur le volant à fond et sur la glisse, avec un risque de dérive dans les vols longs »).  
  Gravité : serieux  
  Correction proposée : Citer ce verdict. Dire en quoi l'hystérésis 0,15/0,35 rad diffère de la bande de 0,12 rad, et pourquoi l'objection du cap borné à 0,6 ne s'applique plus. Sinon, descendre l'idée dans la liste longue.
- Idée : n° 3 La sortie préparée sur les maps à décor  
  Défaut : (a) « À la grotte, une sortie ordinaire tue 6 fois sur 39 » ne se retrouve pas : le même fichier donne 5 sur 58, comme PROPOSITIONS l.97, qui ajoute « dans le bruit pris seul (p ≈ 0,2) ». (b) La nitro au moment de sortir (joueurs 64 %, bot 12 %) est citée à l'appui, alors que la source dit en toutes lettres que ce n'est pas une cause.  
  Preuve : Recompte de note-voltige4-t900.json (c0025) : sorties « decol bord » à la grotte 58, dont 5 suivies d'une mort en moins d'1 s ; canyon 9 et 2 ; ville 34 et 1 ; espace, nuages et jade 166 et 0. PROPOSITIONS.md l.97 (5 sur 58, p ≈ 0,2) et l.98 (« sûr ; ce n'est pas une cause : les joueurs sortent plus vite et meurent moins »).  
  Gravité : serieux  
  Correction proposée : Citer 5 sur 58 contre 1 sur 44, avec la réserve p ≈ 0,2, ou dire d'où vient 6 sur 39. Présenter la nitro de sortie comme un gain de ressemblance (nitroDecol), pas comme une cause de mort. Le constat solide reste : 8 morts sur 22 moins d'1 s après la sortie (vérifié).
- Idée : Liste longue : la nitro au sol apprise par la tête SOL  
  Défaut : L'idée est écartée sur un chiffre périmé : « 38 % du temps, palier médian 8 à 8,5 au lieu de 9,5 » a été mesuré sur le pilote d'avant la loi de vol corrigée. La mesure a été refaite après : 53 % du temps pour un demi-palier, et ce réglage a été gardé. C'est celui de c0025.  
  Preuve : ml/ecurie/ETAPES.md l.177 (soir du 26/11, pilote d'avant) contre l.315-324 (« La nitro au sol, refaite après la loi de vol corrigée » : 53 %, 181 paliers, gardé). note-voltige4 (c0025) : nitro_pct 52,6.  
  Gravité : serieux  
  Correction proposée : Écarter l'idée, si on l'écarte, avec ETAPES l.315-327 : nitro presque partout, 143 à 147 paliers contre 181, et libreOn au banc. Ne plus citer la mesure d'avant la correction.
- Idée : n° 2 La seconde chance prise plus tôt  
  Défaut : Les chiffres vérifiables tiennent : palierMin 12 ; 68 courses sur 68 au palier 14 ou plus avec deux morts ; 1 course sur 56 au bras depart ; joueurs 2 sur 10 ; record 28 → 21. Le dossier ne dit pas ce que la reprise coûte dans le jeu : un palier de moteur perdu, et tout l'encaissé de la partie. Il ne dit pas non plus d'où vient « après 20 s » (CHANCE.tMin). L'estimation « 6,16 → 8,42 sur 103 courses » n'a pas de source ouvrable.  
  Preuve : code/gameplay/seconde-chance.js l.77-80 (prix = tout l'encaissé, jamais sous CHANCE.tMin secondes) et l.91 (tMin:20, moteurPerte:1) ; ml/bot/mesures.js l.18-23 (le sommet de la partie, pas la fin) ; ml/ecurie/etude/realisme.md l.183 (2 sur 10 au clavier).  
  Gravité : mineur  
  Correction proposée : Ajouter le coût de la reprise et la source du seuil de 20 s. Donner le fichier et le script des deux estimations des lecteurs, ou les marquer « non vérifié ».
- Idée : n° 6 La loi fidèle  
  Défaut : « 10 vols sur 12 annoncés air/air à la première vue se posent » : 5 de ces 10 se posent SOUS la dalle, ce qui n'est pas un retour réussi pour le pilote.  
  Preuve : ml/ecurie/etude/selection-naturelle/mesures-27nov/out-pDiag-930000.txt, tableau C, ligne « air / air » : pose dessus 5, pose DESSOUS 5, portail 0, MORT 2.  
  Gravité : mineur  
  Correction proposée : Écrire « 5 se posent dessus, 5 dessous, 2 meurent ».

### Oublis

- La ville (« tour ») est le premier tueur sur les graines neuves du banc : 15 morts sur 56 au bras depart (etat/courses-2026-48.jsonl, recompté). Par km, elle est presque aussi mortelle que le canyon : 12,7 contre 15,6 morts pour 100 km (journaux ml/labo/journal/*.jsonl, approché). ETAPES.md l.246 relevait déjà 17 % de morts par vol en ville (pilote du 26/11). La liste n'a pour elle qu'un sous-bras du frein (freinVille), et une ligne dans « Les trous ».
- La grotte est le premier tueur de c0025 dans sa propre grande note : 10 morts sur 22, 5 sorties mortelles sur 58 (note-voltige4-t900.json, recompté). Ses sorties en chaîne valent 33 % contre 14 % chez les joueurs (PROPOSITIONS.md enquête 2 l.101), et son cap au sol dépasse 0,35 rad 9,7 % du temps contre 4,2 % (l.110). Aucun bras de la liste ne vise d'abord la grotte ; freinGrotte naît à 0 et n'a pas de bras.
- Le zigzag au sol qui s'amplifie vers 550 km/h, deuxième forme des morts juste après une sortie (ETAPES.md l.282-284). Sa cause n'est pas le retard de la main : faire-pY n'a rien donné (l.302-303, « à chercher dans les coups de volant de la main et la ligne qui glisse »). C'est un défaut de structure de la loi au sol, et aucune idée ne le reprend.
- Les morts « pic » (la jade) : 5 sur 56 au bras depart du banc, alors que l'ancien pilote n'y mourait jamais (realisme.md l.179 et l.188). C'est une cause nouvelle chez c0025, ni expliquée ni visée.

## 9. attaquer:code

*Rôle : relecteur « code » : vérifie que chaque idée peut s'écrire dans le code du pilote. Phase : Attaquer.*

### Résumé

J'ai relu la liste courte sous l'angle de la faisabilité dans le code. J'ai ouvert modele.js, genome.js, yeux.js, doigts.js, README.md du bot, commun.js et courses.js, la table du banc, les fiches de cerveaux.jsonl et les passages cités d'ETAPES.md et de PROPOSITIONS.md. Je n'ai lancé aucune course.

La plupart des idées s'écrivent, mais six cachent un problème de code.
- **Le frein (n° 1)** ne se déclenche presque jamais tel qu'il est écrit. Quand la route lâche, la main braque fort. Or le jeu transforme ↓ en drift dès que le volant dépasse 0,35 et que la vitesse est assez haute.
- **Le réacteur (n° 5) est déjà mêlé au bras « retour » (n° 4).** Allumer retourOn change déjà le test des lignes 272 et 290 : les deux bras mesurent la même correction.
- **La loi fidèle (n° 6) existe déjà** : c'est LOI_PILOTE (modele.js l.60), que les yeux jouent déjà quand coupOn est allumé.
- **La seconde chance plus tôt (n° 2)** casse le chargement si on l'écrit telle quelle : PROFIL est lu avant que REGLAGES existe.
- **La tête qui apprend (n° 10)** ne peut pas loger ses poids dans WV sans agir quand l'interrupteur est éteint. Il faut une troisième tête, donc un génome v:4.
- **Les rayons de secours (n° 11)** sont mal classés en B : une bonne part se fait avec les lois « retour » libres, sans toucher aux yeux.

Un défaut traverse toute la famille A. Chaque gène A modifie modele.js, qui fait partie de l'époque des courses. Il faut donc tout rejouer au banc et faire repartir la sélection du Ryzen sur une nouvelle époque. Le dossier ne le dit que pour la famille B.

Enfin, les numéros de ligne d'ETAPES.md cités sont tous décalés d'environ 68 lignes.

### Défauts relevés

- Idée : 1. Le frein d'urgence au sol (A)  
  Défaut : La condition « volant sous 0,35 » ne peut presque jamais tenir au moment où le frein servirait. Quand la route lâche, le pilote vise le côté opposé au bord (cible = −cote × max × 0,5) et la main, qui tient la ligne par coups, braque fort. Le jeu ne freine sur ↓ que si |steer| ≤ 0,35. Au-dessus, et au-delà de 42 % de la vitesse maximale, ↓ devient un DRIFT. Le bras « freinCanyon » sera donc surtout un drift involontaire, la trajectoire tournant 1,15 fois plus et le nez pivotant jusqu'à 0,47 rad. De plus, la variante « freinDrift » est mal décrite : le drift n'est pas « même manche, volant à fond ». C'est un ordre à part, `drift:±1`, que la main joue elle-même : la flèche, puis ↓, le tout pendant au moins 0,45 s sous peine de perdre l'élan.  
  Preuve : ml/ecurie/etude/conduite.md l.58 et l.60 (« ↓ avec |steer| > 0,35 à bonne vitesse devient un DRIFT, pas un freinage ») ; ml/evolution/modele.js l.204 (`if(lache)cible=-tn.cote*max*.5`) ; ml/bot/doigts.js l.29-33 (la ligne devient un volant) et l.481 ; ml/bot/README.md § 3.4 l.490-496 (l'ordre drift, la règle des 42 %) ; PROPOSITIONS.md (selection-naturelle) l.111, cas 910222 : « ordres ligne −13 à −3 », cap +0,14 → +0,61 juste avant la sortie au canyon.  
  Gravité : serieux  
  Correction proposée : Lire `vue.volant` (le braquage du jeu, README l.84) dans la condition. Dire qu'avec la ligne tenue le frein ne part que si |volant| < 0,35, puis compter d'abord, sur les vues déjà enregistrées, combien de vues « tenue lâche » au canyon ont |volant| < 0,35. Sinon, assumer un seul bras « ↓ au bord » dont le jeu décide s'il freine ou s'il drifte. Réécrire freinDrift avec l'ordre `drift`. Donner freinVmin en m/s, car vue.vitesse est en m/s (README l.84).
- Idée : Toute la famille A (n° 1, 3, 5, 6, 8, 12)  
  Défaut : Le dossier dit que la famille B veut dire « tout est rejoué », ce qui laisse croire que la famille A ne l'est pas. C'est faux. Chaque gène A s'écrit dans ml/evolution/modele.js, qui fait partie des fichiers de l'époque. Toucher ce fichier change l'empreinte, et toutes les courses du cache sont refusées. Le banc rejoue donc le bras « depart » et tous les bras. La sélection du Ryzen change aussi d'époque : sa population repart sur des courses neuves. Le dernier lot avait été fait exprès sans toucher modele.js pour éviter cela.  
  Preuve : ml/evolution/commun.js l.251-252 (FICHIERS_EPOQUE contient ml/evolution/modele.js et ml/bot/yeux.js) ; ml/evolution/courses.js l.87 (« jouee avec d'autres fichiers du bot ») ; ml/ecurie/etude/banc-des-genes/jouer.js l.18-19 (« si modele.js … changent, l'époque change et tout se rejoue ») ; en-tête de modele.js (« Changer ce fichier change l'epoque des courses ») ; commit 3b1bf15e5 (« ce lot ne change aucune epoque (modele.js et enfant.js intacts) »).  
  Gravité : serieux  
  Correction proposée : Écrire dans « Comment lire » que A et B rejouent tous les deux le bras « depart » (96 courses) ; seule la famille B change aussi ce que voient les yeux. Proposer d'écrire tous les gènes A retenus en un seul lot, donc une seule nouvelle époque, et de compter dans le coût la reprise du bras depart et le redémarrage de la sélection sur le Ryzen.
- Idée : 4. La loi « retour » au banc et 5. Le réacteur reconnu  
  Défaut : Les deux bras sont mêlés. Avec retourOn = 1, R.retours contient une loi, donc R.retours.length vaut 1. Les lignes 272 et 290 utilisent alors avecNitro(f) : la correction du réacteur s'allume toute seule. Le choix du départ (l.379) et la tête RAYON qui va avec s'allument aussi. Un écart du bras retourOn ne pourra pas être attribué à la loi retour.  
  Preuve : ml/evolution/genome.js l.456 (retourOn écrit une seule loi, sans nitro) ; ml/evolution/modele.js l.272 et l.290 (`R.retours.length?avecNitro(...):...==='plane'`), l.379 (`if(!m.choix&&R.retours.length&&estRetour(m.facon))`).  
  Gravité : serieux  
  Correction proposée : Dire dans les deux fiches que le bras retourOn contient déjà le réacteur. Passer reacteurOn au banc d'abord (ou seul), puis comparer retourOn à reacteurOn plutôt qu'au départ. Écrire le nouveau test comme le propose la fiche (`(R.reacteurOn>0||R.retours.length)?…`), pour que retourOn garde son comportement d'aujourd'hui.
- Idée : 5. Le réacteur reconnu dans les sorties voulues  
  Défaut : « versRoutePlane décolle nitro éteinte » ne peut pas arriver. Les sorties gauche et droite ne portent que les rayons rien, plane et versRoute, plus viser et viserPlane : versRoutePlane n'est jamais la façon d'un raccourci. Seul viserPlane est concerné, ce qui rend le cas encore plus rare. La fiche oublie aussi deux essais proches : c0058, qui faisait la même correction plus la nitro tenue sur les sorties voulues sans décor (tri sur 6 graines : [3,7,8,10,11,13]), et c0028, qui tenait la nitro jusqu'au décollage sur c0025 (tri : [3,3,6,8,8,12], moyenne 6,67).  
  Preuve : ml/bot/yeux.js l.953 (LISTE_COTE = rien, plane, versRoute) et l.879 (viser et viserPlane ajoutés aux sorties) ; ml/bot/README.md l.191-192 ; ml/labo/journal/cerveaux.jsonl, fiches c0028 et c0058 (champ note.paliers, recompté le 28/11).  
  Gravité : mineur  
  Correction proposée : Écrire « viserPlane seulement » ; citer c0028 et c0058 dans « Déjà essayé » ; avant le banc, compter les engagements viserPlane dans les journaux pour estimer f.
- Idée : 6. La loi fidèle  
  Défaut : Elle existe déjà. LOI_PILOTE (modele.js l.60) a exactement les réglages proposés : marge 28 (la demi-largeur, donc bord à 0 et cap −lat/40 comme versRoute), cap 0,6, gain 1,6, portée minimale 40, avance 0,25, retard de la main 0,2. Les yeux la jouent déjà comme rayon retour<b> dès que coupOn vaut 1 (l.61-62). La loi « retour » des yeux n'a pas de zone morte, ne lâche pas le volant au-delà de 1,6 rad (le demi-tour est compris) et joue le retard de la main. « Les bornes de retMarge bloquent, il faut un gène à part » ne tient donc pas. Le coût est plus petit que dit : il ne s'agit pas d'écrire une loi, seulement de suivre ou de juger ce rayon.  
  Preuve : ml/evolution/modele.js l.60-62 (LOI_PILOTE, COUP_LOIS, RETOURS_DEMANDES) et l.411 (les rayons retour i ≥ R.retours.length sont sautés) ; ml/bot/yeux.js l.588-603 (« le volant tient ce cap par le plus court chemin, meme caisse a contresens (pas de zone morte) », retard rv/rm/rn, avance) et l.611 (marge acceptée de −50 à 200).  
  Gravité : serieux  
  Correction proposée : Réécrire le n° 6 : loiFidele demande LOI_PILOTE (déjà écrite) et suit le rayon retour correspondant. Ajouter une variante moins chère qui garde versRoute en vol mais juge la façon tenue sur ce rayon au lieu du rayon versRoute du radar (c'est là qu'est le biais). Gérer l'indice b quand coupOn est aussi allumé.
- Idée : 2. La seconde chance prise plus tôt  
  Défaut : Écrite comme proposé, elle ne se charge pas. PROFIL est déclaré l.48-51, avant la balise /*@GENOME@*/ (l.52) où genome.js écrit `const REGLAGES`. Un `palierMin:REGLAGES.chancePalierMin` dans PROFIL lève donc une ReferenceError (une const lue avant sa ligne). Le classement est faux aussi : rien ne change dans doigts.js ni dans les yeux, la main sait déjà prendre un palierMin de 1 à 30. C'est un gène A qui demande une décision de Sacha, pas une idée B (la main).  
  Preuve : ml/evolution/modele.js l.48-52 ; ml/bot/doigts.js l.97 (`palierMin:['e',1,30]`) et l.500 (le test au moment de la mort) ; code/gameplay/seconde-chance.js l.91 (CHANCE.tMin 20, moteurPerte 1) et l.102.  
  Gravité : mineur  
  Correction proposée : Déplacer PROFIL sous la balise du génome, ou le faire écrire par genome.js, puis vérifier que identite.js retrouve c0025 au bit près avec palierMin 12. Reclasser en « A, décision de Sacha ». Rappeler que la reprise coûte un palier au moteur (moteurPerte 1) et que seul le sommet compte.
- Idée : 3. La sortie préparée sur les maps à décor  
  Défaut : Trois points. (a) L'idée repose sur les rayons du sol à la grotte et au canyon. Le dossier dit leur justesse « non mesurée », alors qu'il existe une mesure négative : « à la grotte et au canyon l'annonce du sol est fausse », 4 sorties sur 4 contre la roche en moins de 1,5 s. À l'inverse, les « trous » disent la justesse de sorties.bord non mesurée, alors que son rayon versRoute est mesuré juste 9 fois sur 10. (b) Fixer « plane dès la première vue » en passant par m.sortie rendrait m.voulu vrai (l.368) : les figures (parentOk, figPlongeon) et la bascule vers viser changeraient aussi. Il faut une mémoire à part. (c) C'est bordOn étendu aux maps à décor (l.254, `!decor`), avec une condition sur les rayons. La fiche ne le dit pas.  
  Preuve : ml/bot/README.md l.185 (4 sur 4) et l.280 (versRoute de la sortie bord : 9/10) ; ml/evolution/modele.js l.368 (`m.voulu=!!m.sortie`), l.445 et l.451 (parentOk, tSeuil), l.414 (les façons viser sautées seulement si !m.voulu), l.254 (bordOn) ; ml/bot/yeux.js l.948 (LISTE_BORD : rien, versRoute, plane) et l.862 (la nitro du décollage = l'état du moment).  
  Gravité : serieux  
  Correction proposée : Citer README l.185 comme preuve contre et l'écrire dans « Ce qui la réfuterait ». Corriger le trou sur sorties.bord. Préciser l'écriture : un drapeau m.planeBord lu au début de enVol, sans toucher m.sortie. Présenter le gène comme une extension de bordOn, en réutilisant bordJauge si possible.
- Idée : 10. La tête RAYON qui apprend l'issue des poses (C)  
  Défaut : Les poids appris ne peuvent pas aller dans WV « comme naissance d'une variante » sans agir quand valeurOn vaut 0. WV est lue pour chaque candidat du choix du départ et de la bascule (l.383, l.399, l.419), et la sélection la mute. Il faut donc une troisième tête, ce qui demande de modifier TETES et LONGUEUR dans genome.js, de passer à un génome v:4, d'écrire une migration et de protéger ces poids des mutations. C'est plus cher que « moyen ». Le constat est aussi incomplet : la tête n'agit pas « que dans la bascule », elle agit aussi au choix du départ quand des lois retour sont demandées.  
  Preuve : ml/evolution/modele.js l.383, l.399, l.419 (teteRayon), l.379 ; ml/evolution/genome.js l.190-191 (TETES, LONGUEUR WV 222, WS 90) et l.192 (VERSION 3).  
  Gravité : serieux  
  Correction proposée : Écrire une tête « valeur » à part (ses propres poids, hors de l'urne des mutations), gardée par valeurOn, et compter dans le coût le génome v:4 et sa migration. Corriger le constat sur l.383.
- Idée : 11. Les rayons de secours en vol (B, les yeux)  
  Défaut : C'est mal classé et le coût est surestimé. Les yeux jouent déjà jusqu'à 4 lois « retour » à la demande, avec cabre, pique et quatre façons de tenir la nitro. « Plane puis versRoute » (nitro 2 ou 3) et « versRoute cabré » (le réglage cabre) s'écrivent donc comme des lois retour, sans toucher yeux.js : c'est de la famille A. Seul le « volant ±0,5 » fixe demande un rayon neuf. Autre point que la fiche ne dit pas : un rayon ajouté au radar d'office fait lever « YEUX CHANGES » à tout pilote déjà écrit, c0025 du Ryzen compris. Un rayon neuf doit donc venir seulement à la demande et passer controleRayons.  
  Preuve : ml/bot/yeux.js l.593-596 (nitro 0 à 3, cabre, pique, « 4 lois au plus ») et l.610 (`RET.length<4`) ; ml/evolution/modele.js l.118-127 (controleRayons : 10 rayons, la paire viser, puis retour0… et rien d'autre).  
  Gravité : serieux  
  Correction proposée : Couper l'idée en deux : un gène A, secoursOn, qui demande deux lois retour de secours quand tous les rayons sont perdus (et compter les places : coupOn en prend 2, retourOn 1). Seul le volant ±0,5 reste en B, à la demande, avec controleRayons mis à jour.
- Idée : 9. La pose suivie au sol (B)  
  Défaut : Une partie existe déjà. Chaque rayon qui se pose porte son axe d'arrivée, et vaut() calcule déjà la position 0,3 s après le contact : glisse = lat + vitesse × sin(axe) × derive, avec derive (un gène, 0,3 à la naissance). Ce qui est vraiment neuf, c'est le lacet en rad/s au contact (axe03) et le prolongement de 0,8 s au sol.  
  Preuve : ml/evolution/modele.js l.345 (vaut, `glisse=(+r.lat||0)+v.vitesse*Math.sin(cl(axe,-1.5,1.5))*REGLAGES.derive`) ; ml/evolution/genome.js l.33 (derive, 0 à 0,6, naissance 0,3) ; ml/bot/README.md l.151 ; PROPOSITIONS.md l.139.  
  Gravité : mineur  
  Correction proposée : Dire ce qui existe (l'axe, derive) et limiter le neuf au lacet au contact et au rayon prolongé au sol.
- Idée : 8. Le volant lâché en vol une fois le cap pris  
  Défaut : « Sans zone morte » n'est vrai que pour la loi. La main en a déjà une : sous 0,08 de volant, elle n'appuie pas, soit environ 0,05 rad d'erreur de cap avec le gain 1,6. Le gène élargit donc une zone qui existe. Il recoupe aussi lacheOn (au banc), qui met le volant à 0 dans les 0,35 s avant la pose.  
  Preuve : ml/bot/doigts.js l.83 (`mort:.08`, que la main clavier ne change pas, l.114) ; ml/bot/README.md l.409 ; ml/evolution/modele.js l.306 et l.430.  
  Gravité : mineur  
  Correction proposée : Écrire « élargir la zone morte de la main (0,08 aujourd'hui) » et choisir des bornes de volLacheCap qui dépassent nettement 0,05 rad, ce que font déjà 0,1 à 0,3.
- Idée : Les citations d'ETAPES.md (n° 1, 2, 3, 11 et la liste longue)  
  Défaut : Les numéros de ligne d'ETAPES.md sont décalés d'environ 68 lignes. Le texte cité existe, mais ailleurs. C'est contraire à la règle « chaque chiffre cité par son chemin et sa ligne ».  
  Preuve : ml/ecurie/ETAPES.md : « Non essayé : freiner » est l.499 (cité l.431) ; « 10 des 20 morts… » l.282 (cité l.214) ; « vSure gardait 300 m/s de marge » l.487 (cité l.418-419) ; c0005 au tableau l.768 (cité l.700) ; « 38 % du temps → palier médian 8 à 8,5 » l.177 (cité l.108-110) ; nitroBord 161 · 7 l.325. Les l.414-432 parlent de chaine.js.  
  Gravité : mineur  
  Correction proposée : Refaire toutes les références à ETAPES.md avec un grep sur le texte cité, et citer le titre de section en plus du numéro de ligne.

### Oublis

- Laisser la bascule « pour mieux » aller vers « rien » (gène A, informations déjà dans la vue). Aujourd'hui pourMieux ne bascule que vers une loi de retour (ml/evolution/modele.js l.404 et l.418, `if(pourMieux&&!estRetour(nom))continue`). Or, à la grotte, dans 23 vols subis sur 75, le rayon « rien » annonçait une pose droite (axe 0,09) qui ne retraverse pas la route, et le bot a continué de braquer pour se poser à 0,44 (ml/ecurie/etude/selection-naturelle/PROPOSITIONS.md l.109). Ce n'est pas lacheOn, qui ne coupe le volant que dans les 0,35 s avant la pose.
- Borner le cap au sol sur les maps à décor (gène A). La borne ±0,4 est écrite en dur (ml/evolution/modele.js l.237, `cl(...,-.4,.4)`). Les joueurs ont un cap au-dessus de 0,35 rad pendant 4,2 % du sol à la grotte, le bot 9,7 % ; au 90e centile, 0,26 et 0,20 chez les joueurs contre 0,35 et 0,28 chez le bot (PROPOSITIONS.md l.110 et l.143-144). L'idée n'est ni dans la liste courte ni dans la liste longue, alors que la grotte et le canyon sont les premières causes de mort.
- La variante la moins chère du n° 6 : garder versRoute en vol mais juger la façon tenue sur le rayon LOI_PILOTE (déjà demandé aux yeux quand coupOn vaut 1, ml/evolution/modele.js l.60-62) au lieu du rayon versRoute du radar, qui ignore le demi-tour et le retard de la main (ml/bot/yeux.js l.585-589). C'est le biais lui-même qui est corrigé, sans changer la conduite.
- Les places libres des lois « retour » (4 au plus, ml/bot/yeux.js l.610) donnent au pilote des trajectoires de secours (nitro tenue, cabre, autre marge) sans toucher aux yeux, donc sans époque des yeux : de quoi réaliser l'essentiel du n° 11 en famille A.

## 10. attaquer:mesure

*Rôle : relecteur « mesure » : vérifie que chaque idée peut se mesurer sur le banc des gènes. Phase : Attaquer.*

### Résumé

Relecture « peut-on le mesurer » de ml/ecurie/etude/prochaines-idees (LISEZ-MOI.md et candidats.json). Aucune course jouée. J'ai seulement lu les 737 lignes déjà écrites du banc (etat/courses-2026-48.jsonl, 56 à 57 graines par bras) et les 1 052 courses de la famille c0025 (ml/labo/journal/validations.jsonl + cerveaux.jsonl). Ce que j'ai recalculé : (1) sur les courses qui diffèrent du départ, l'écart-type de la différence de palier vaut 3,93 (403 courses, tous bras confondus). Il va de 2,3 (libreOn) à 4,8 (bordOn) selon le bras. Avec la règle du dossier, n ≈ 96/(f d²), on suppose 3,5 : il faut plutôt n ≈ 121/(f d²), voire 180 pour les bras les plus bruités. Quand toutes les courses changent, l'effet minimal visible à 96 graines vaut 1,0 à 1,15 palier (slalomOn 1,02 ; gestes5 1,05 ; suitOn 1,15). (2) Le débit mesuré est de 737 courses en 249 min, soit environ 178 par heure (et non 190). (3) Les chiffres de base du dossier tiennent : canyon traversé 248 fois pour 244 morts sur place, soit 4 traversées vivantes, sur 15 graines ; 24 % des courses passent par le canyon, 33 % par la ville ; 134 courses ont pris la chance, exactement les 134 au palier 12 ou plus. Mais plusieurs fréquences de déclenchement annoncées « rares » sont fausses. Le pilote fait 10 vols par course en moyenne au bras départ, et 74 % des courses de la famille (775 sur 1 052) ont au moins un raccourci. La toupie, les rayons de secours et le réacteur touchent donc la plupart des courses, pas quelques-unes. Leur effet attendu (« petit », « faible ») ne se jugera pas en moins de 1 000 courses. Les défauts les plus graves sont : la seconde chance, gagnante par construction au banc ; le réacteur, confondu avec la loi « retour » ; volLache, dont le but n'est pas mesuré par le banc ; valeurOn, qui dépend de retourOn et risque de s'ajuster sur les graines du banc. Enfin, le dossier ne dit rien du risque de regarder 13 à 14 nouveaux bras d'un coup.

### Défauts relevés

- Idée : Toutes (la règle des graines)  
  Défaut : La règle n ≈ 96/(f × d²) sous-estime le nombre de graines. Elle suppose un écart-type de 3,5 palier sur les courses changées (7,84 × 3,5² ≈ 96). Le banc mesure davantage. En plus, le dossier et candidats.json appliquent la règle au PLAFOND du lecteur, pas à un effet probable.  
  Preuve : Recalcul sur ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl (737 lignes, 28/11 à 07:37). L'écart-type de la différence de palier sur les courses non identiques vaut 3,93, sur 403 courses tous bras. Par bras : lacheOn 4,53 ; suitOn 4,29 ; bordOn 4,76 ; slalomOn 3,57 ; libreOn 2,30. D'où n ≈ 7,84 × 3,93² / (f d²) ≈ 121/(f d²), et jusqu'à 178/(f d²) pour un bras comme bordOn. Pour le frein (n° 1), avec f = 0,24 et un effet moyen de 0,4 (le plafond) : environ 180 graines, pas 150. Avec la moitié du plafond (0,2) : environ 730 graines, soit environ 4 h à 178 courses par heure (jouer.log : 737 courses en 249 min).  
  Gravité : serieux  
  Correction proposée : Remplacer la constante 96 par 121, et dire qu'elle va de 96 à 180 selon le bras. Chiffrer chaque candidat à deux effets, le plafond ET la moitié du plafond. Le débit est de 178 courses par heure, pas 190.
- Idée : La liste courte entière (13 à 14 bras nouveaux)  
  Défaut : Le dossier ne parle pas du risque de regarder plusieurs idées à la fois. Il propose freinCanyon, freinVille, freinDrift, chance1, sortieOn, retourOn, reacteurOn, loiFidele, volLacheOn, poseSuivieOn, valeurOn, secoursOn et toupieOn, soit 13 bras. Le banc lit de plus deux intervalles par bras (palier et dF). Il lit aussi ses chiffres pendant la mesure : le dossier cite le bras départ à 56 graines.  
  Preuve : Avec 13 bras : 1 − 0,95^13 = 49 % de chances d'au moins un faux « aide » ou « nuit » (même calcul que analyser.js, hasardAuMoinsUn). Au seuil corrigé 0,05/13 = 0,38 %, z vaut environ 2,9 : l'effet minimal visible grandit de (2,9 + 0,84)/(1,96 + 0,84) = 1,34 fois. Quand toutes les courses changent, on passe d'environ 1,1 à environ 1,5 palier à 96 graines. Voir ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md, « Ce qu'on ne pourra pas conclure ».  
  Gravité : serieux  
  Correction proposée : Juger par vagues de 3 à 5 bras au plus, en annonçant le seuil corrigé avant de jouer. Annoncer à l'avance le critère principal (palier OU dF, pas les deux). Ne rien conclure d'une lecture en cours de mesure ; sinon, passer à un plan séquentiel déclaré, comme le sacre (24 graines, puis 12 par 12).
- Idée : n° 2 La seconde chance prise plus tôt  
  Défaut : Au banc, ce bras gagne par construction : le banc ne peut pas le juger. Le palier noté est le SOMMET de la partie. Jusqu'à la première mort, la course est identique à celle du départ. La reprise ne peut donc qu'ajouter des paliers. La différence appariée vaut toujours 0 ou plus, et le verdict « aide » est automatique. Il ne dit rien de la conduite. De plus, la chance allongerait la course et grossirait le hasard d'une course, ce qui rendrait plus chers tous les bancs suivants.  
  Preuve : ml/bot/mesures.js l.18-21 : « LE SOMMET, pas la fin » (le palier vient du plus haut nombre de pièces). ml/bot/doigts.js l.500 : la chance est offerte dès que le palier atteint palierMin. Au bras départ, 55 courses sur 57 dépassent 20 s : environ 96 % des courses seraient changées. Dans les journaux, 134 courses ont pris la chance, exactement les 134 au palier 12 ou plus (recompte). Voir aussi ml/ecurie/CONSIGNES.md l.149.  
  Gravité : bloquant  
  Correction proposée : Ne pas en faire un bras du banc. C'est une décision de Sacha sur la définition du palier, pas une mesure. Si Sacha la veut : la chiffrer une seule fois, hors du banc, et la tenir allumée (ou éteinte) dans TOUS les bras, pour ne pas mélanger deux définitions du palier. Mesurer d'abord son effet sur l'écart-type d'une course.
- Idée : n° 5 Le réacteur reconnu  
  Défaut : (a) Le déclenchement n'est pas rare. Le pilote fait 1,93 raccourci par course, et 74 % des courses en ont au moins un. Dès qu'un raccourci part avec viserPlane ou versRoutePlane, toute la suite de la course diverge. f peut donc approcher 0,7, et la comparaison ne sera pas fine. Avec un effet « probablement faible » de 0,2 palier et f = 0,5, il faut 121 × 0,5 / 0,2² ≈ 1 500 graines. (b) L'idée est confondue avec la n° 4 : quand retourOn vaut 1, R.retours n'est pas vide et le test des l.272 et l.290 utilise déjà avecNitro. reacteurOn ne fait alors plus rien, et le bras retourOn contient déjà la correction du réacteur.  
  Preuve : Recompte sur ml/labo/journal (1 052 courses c0025 et après) : 1,93 raccourci par course en moyenne, 775 courses sur 1 052 avec au moins un raccourci. ml/evolution/modele.js l.272 et l.290 : `nitro:(R.retours.length?avecNitro(...):...=='plane')`. ml/evolution/genome.js l.456 : retours n'est rempli que si retourOn vaut 1. c0052 : +1,33 sur 6 graines, porté par une seule course (dossier, n° 5).  
  Gravité : serieux  
  Correction proposée : Avant tout bras, compter dans les traces existantes la part des raccourcis en viserPlane ou versRoutePlane. Si l'effet attendu reste sous 0,4 palier, le sortir de la liste courte : on ne saura pas le juger en moins de 1 000 courses. Sinon, le juger AVANT retourOn, ou comparer retourOn à reacteurOn (et non au départ) pour séparer les deux effets.
- Idée : n° 12 Pas de toupie  
  Défaut : Le dossier dit « rare, comparaison fine ». C'est faux. Une toupie touche 15 % des vols (45 sur 299), et le pilote fait environ 10 vols par course. Environ 1 − 0,85^10 ≈ 80 % des courses auraient au moins une toupie, et donc divergeraient. Avec un effet « petit, peut-être négatif » (disons 0,2 palier) : 121 × 0,8 / 0,04 ≈ 2 400 graines.  
  Preuve : ml/ecurie/etude/selection-naturelle/PROPOSITIONS.md l.108 (45 vols sur 299). Bras départ du banc : 10,0 vols par course en moyenne (de 1 à 35), sur 57 courses (recompte de courses-2026-48.jsonl).  
  Gravité : serieux  
  Correction proposée : Retirer f = « rare ». Annoncer f ≈ 0,8. Son but est la ressemblance à l'œil, que ni le palier ni E ne voient : le juger seulement avec une mesure de ressemblance qui la voit (n° 7), ou le sortir de la liste courte.
- Idée : n° 11 Les rayons de secours en vol  
  Défaut : Le dossier dit « f faible, comparaison fine ». Mais le déclencheur (« tous les rayons annoncent air, vide ou choc ») est la situation même où naît la toupie (n° 12) : environ 80 % des courses. La n° 11 et la n° 12 se disputent le même instant et ne peuvent pas être jugées l'une sans l'autre. En plus, les yeux changent : il faut une nouvelle époque, donc rejouer le départ (96 courses de plus), et les 13 bras en cours ne se comparent plus aux nouveaux.  
  Preuve : LISEZ-MOI.md du dossier, l.156 (toupie : « quand le radar ne promet rien ») et l.147 (secours : « quand tous les rayons annoncent air, vide ou choc »). Fréquence : voir le défaut de la n° 12. ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md, « Reprendre » : un changement des yeux fait tout rejouer.  
  Gravité : serieux  
  Correction proposée : Faire d'abord le test hors course que le dossier propose déjà : rejouer les vues de vols perdus avec les nouveaux rayons. Ne jouer un bras que s'il trouve des rayons qui se posent. Puis juger secoursOn et toupieOn ensemble : un bras secoursOn, un bras secoursOn + toupieOn. Corriger f.
- Idée : n° 8 Le volant lâché en vol  
  Défaut : Le but est la ressemblance, et le banc ne la mesure pas. E n'a pas de mesure « volant braqué en vol ». Côté palier, le geste touche tous les vols (f = 1) : l'effet minimal visible vaut environ 1,1 palier à 96 graines (environ 1,5 au seuil corrigé), alors que l'effet attendu est « inconnu, risque sur les poses ». Quant au constat lui-même (59 % du vol volant braqué, contre 31 % chez les joueurs), il vient d'UNE course.  
  Preuve : ml/bot/ressemblance.js l.28-33 (les 15 mesures de E, rien sur le volant en vol). ml/ecurie/etude/realisme.md l.291 : le volant braqué en vol sépare les joueurs du bot à 0,919, mais il n'est pas dans E. Effet minimal : 2,8 × 3,93 / √96 = 1,12.  
  Gravité : serieux  
  Correction proposée : Le grouper avec la n° 7 (la nouvelle note) : ne le juger qu'une fois la mesure du volant en vol dans E. Côté palier, en faire un garde-fou (« ne pas perdre plus d'un palier »), pas un critère de gain. Refaire le compte 59 % contre 31 % sur les 57 courses du bras départ avant d'écrire le code.
- Idée : n° 4 La loi « retour » au banc  
  Défaut : Le dossier écrit « 96 graines voient 1 palier » alors que son propre effet attendu est « rien de net ». Le seul chiffre connu (77 contre 83 paliers sur 12 courses, soit −0,5 par course) est sous ce qu'on voit à 96 graines (environ 1,1). Le bras allume aussi deux gènes (retourOn et volMieux) et la correction du réacteur (voir la n° 5). Un résultat nul ou négatif ne dira pas lequel des trois en est la cause.  
  Preuve : Dossier l.77 et l.81. Effet minimal à 96 graines quand toutes les courses changent : 1,02 à 1,15 (slalomOn, gestes5, suitOn, recompte). Pour voir 0,5 palier : 7,84 × 3,93² / 0,25 ≈ 480 graines (2,7 h). Pour 0,3 : environ 1 350 graines. ml/evolution/modele.js l.404 : volMieux agit aussi sans retourOn, puisque versRoute compte comme une loi de retour (estRetour).  
  Gravité : serieux  
  Correction proposée : Annoncer que 96 graines ne sert ici qu'à vérifier qu'on ne perd pas plus d'un palier. Pour un vrai verdict à ±0,5 : environ 480 graines. Prévoir trois bras (retourOn seul, volMieux seul, les deux) ou dire franchement que le bras ne séparera rien.
- Idée : n° 6 La loi fidèle  
  Défaut : f = 1 et effet attendu « inconnu ». Ce qu'on connaît déjà de proche (la loi retour à marge 8, « pas franchement meilleure » ; −0,5 palier sur 12 courses) pointe vers un effet sous un palier. 96 graines ne verront donc probablement rien. En plus, la loi fidèle s'appuie sur la n° 4 (retours non vides) et emporte avec elle la correction du réacteur (n° 5).  
  Preuve : Dossier l.101-103. ml/ecurie/portfolio/journal/2026-11-27.md l.31, cité par le dossier. Effet minimal à 96 graines : 1,12 palier. Pour 0,5 palier : environ 480 graines.  
  Gravité : serieux  
  Correction proposée : Faire d'abord le test hors course (l'avance de retour() suit-elle celle du pilote ?). Puis la juger CONTRE le bras retourOn, sur ~480 graines, en prenant pour critère principal la part des morts air et vide. Il en faut 19 sur 56 au bras départ : une baisse de moitié se voit mieux sur ce compte que sur le palier.
- Idée : n° 10 La tête RAYON qui apprend  
  Défaut : (a) Elle dépend de la n° 4. Elle ne bascule que si « une autre loi de retour annonce une pose propre », et les lois retour0 à retour3 n'existent que si retourOn vaut 1. (b) Le plan « on récolte, on réajuste, on rejuge » sur le même banc ouvre la porte à un ajustement sur les 96 graines du banc. C'est le piège de la boucle payante : +2 paliers sur ses graines de validation, +0,03 sur 40 graines neuves. (c) On ne sait pas combien de vues ouvrent la bascule : f est inconnu.  
  Preuve : ml/evolution/modele.js l.410-411 : `if(nom.indexOf('retour')===0&&+nom.slice(6)>=R.retours.length)continue`. ml/evolution/genome.js l.456. ml/ecurie/etude/boucle-payante-ryzen (coffre) : +0,03 [−1,18 ; +1,38].  
  Gravité : serieux  
  Correction proposée : La juger contre le bras retourOn, pas contre le départ. Récolter et ajuster sur des graines d'entraînement (910 000…), et réserver une plage de graines neuve, jouée une seule fois, pour le verdict. Compter d'abord, dans les vues enregistrées, combien de fois la bascule s'ouvre.
- Idée : n° 1 Le frein d'urgence  
  Défaut : (a) Les 150 graines sont calculées sur le PLAFOND (+0,4) et avec la constante 96. Avec 121 et la moitié du plafond, il en faut environ 730 par bras. (b) Les trois bras (freinCanyon, freinVille, freinDrift) pèsent sur le seuil corrigé. freinDrift n'a de sens que frein allumé : il faut le comparer à freinCanyon, pas au départ, et on ne sait pas à quelle fréquence le volant est déjà à fond. (c) La part de canyon dans les graines du banc (3 000 000…) n'est pas connue : les lignes du banc ne disent pas les maps. Et les 248 passages des journaux ne viennent que de 15 graines sur 40.  
  Preuve : Recompte de ml/labo/journal : le canyon est sur la route de 248 courses sur 1 052 (24 %), 244 y meurent, 15 graines différentes ; la ville sur 352 courses (33 %), 30 graines. Les lignes de banc-des-genes/etat/courses-2026-48.jsonl n'ont pas de champ « cartes » (seulement cause, morts, vols…). n = 121 × 0,24 / 0,2² ≈ 730.  
  Gravité : serieux  
  Correction proposée : Commencer par un seul bras, freinOn sur canyon et ville à la fois (f ≈ 0,5), pour garder un f grand. Tirer freinDrift seulement si ce premier bras aide, et le comparer à lui. Juger sur un critère ciblé, plus fin que le palier : la traversée vivante du canyon, aujourd'hui 4 sur 248 (voir les oublis : des courses à map imposée).
- Idée : n° 3 La sortie préparée  
  Défaut : Le dossier écrit f = null. On peut pourtant le borner. Le cas visé tue au plus 8 fois en 20 parties (morts moins d'une seconde après une sortie sur décor), et la grotte est sur la route de 48 % des courses. L'effet n'est mesurable qu'au plafond du lecteur. Avec f ≈ 0,3 et un effet moyen de 0,5 : 121 × 0,3 / 0,25 ≈ 145 graines. Avec la moitié (0,25) : environ 580. Le dossier dit aussi que la justesse du rayon plane au bord n'est pas mesurée : un « aide » ou un « nuit » ne dira pas si le rayon ment.  
  Preuve : Dossier l.65 (8 morts sur 22, note-voltige4-t900.json, lecteur morts). Recompte de ml/labo/journal : la grotte est sur la route de 504 courses sur 1 052 (48 %), dont 230 y meurent.  
  Gravité : mineur  
  Correction proposée : Mettre f ≈ 0,2 à 0,4 et le coût, 145 à 580 graines. Ajouter au bras le compte des sorties préparées qui meurent quand même : c'est ce qui teste le rayon, plus fin que le palier.
- Idée : n° 9 La pose suivie au sol  
  Défaut : Les yeux changent : il faut une nouvelle époque. Le départ est à rejouer (96 courses de plus), les 13 bras en cours ne se comparent plus aux nouveaux, et f = 1 avec un effet inconnu : environ 1,1 palier minimal à 96 graines. Le coût réel est donc d'au moins 192 courses pour un verdict probablement « on ne sait pas ».  
  Preuve : ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md, « Reprendre » : si les yeux changent, tout est rejoué. Effet minimal : 2,8 × 3,93 / √96 = 1,12.  
  Gravité : mineur  
  Correction proposée : Faire d'abord le compte hors course que le dossier propose déjà (les vols enregistrés où un autre rayon aurait tenu). Grouper les deux idées qui changent les yeux (n° 9 et n° 11) dans UNE seule époque, avec un départ rejoué une seule fois.
- Idée : n° 7 La note qui voit ce que voit le juge  
  Défaut : Le critère de réfutation (« les nouvelles mesures séparent-elles mieux joueurs et bot ? ») repose sur un étalon de 2 joueurs et 8 parties au clavier de plus de 60 s. Le pouvoir de séparation (0,919, 0,893, 0,754) n'a pas d'intervalle à cette taille. Rien ne garantit que la mesure tienne sur d'autres joueurs.  
  Preuve : Dossier l.188 (l'étalon : 2 joueurs, 8 parties de plus de 60 s). ml/ecurie/etude/realisme.md l.291-293 (les trois pouvoirs de séparation, sans intervalle).  
  Gravité : mineur  
  Correction proposée : Donner un intervalle aux trois pouvoirs de séparation par bootstrap sur les parties (lecture seule). Garder seulement les mesures dont la borne basse reste au-dessus de 0,7.

### Oublis

- Des courses à map imposée pour les idées liées à une map (frein au canyon ou en ville, sortie préparée à la grotte). ml/bot/noter.js accepte déjà --carte (usage, l.6), ml/bot/justesse.js --cartes, et validations.jsonl porte un champ « carte ». Sur le canyon imposé, f passe de 0,24 à environ 1 : il faut environ 4 fois moins de graines. On peut juger un critère binaire bien plus fin que le palier : la traversée vivante, aujourd'hui 4 sur 248 (recompte de ml/labo/journal). Le banc (jouer.js) ne le sait pas faire aujourd'hui : il faudrait une option à ajouter.
- Un compteur de déclenchements par gène dans chaque ligne de course. Aujourd'hui, seul le champ « identiques » donne f, et seulement après coup (banc-des-genes/analyser.js l.117). c0005 a déjà eu le cas d'un frein qui ne partait jamais (ETAPES.md l.700, cité par le dossier). Avec un compteur, 24 graines suffiraient pour savoir si un bras vaut 96 graines ou plus.
- Un banc séquentiel, comme le sacre : 24 graines, puis 12 par 12, avec un arrêt annoncé à l'avance. ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md l.39 et § sacre : la validation séquentielle reconnaît un +1 palier 33 fois sur 100 contre 15. Appliquée au banc, elle arrêterait vite les bras « identiques » (largeOn : 53 sur 56 identiques ; libreOn : 47 sur 56) et donnerait plus de graines aux bras qui changent tout.
- Des critères ciblés au lieu du seul palier. La part des morts air et vide (19 sur 56 au bras départ) pour la loi fidèle et les secours. Les sorties préparées qui meurent pour la n° 3. Le volant braqué en vol pour la n° 8. Un compte de morts sur la partie touchée varie bien moins que le palier (écart-type de 3,9 sur les courses changées).

## 11. reprendre

*Rôle : correcteur : reprend le dossier d'après les trois attaques. Phase : Reprendre.*

### Résumé

J'ai relu les trois relectures, vérifié leurs preuves moi-même en lecture seule (aucune course jouée), puis réécrit LISEZ-MOI.md et candidats.json.

Points vérifiés :
- Les lignes d'ETAPES.md citées étaient décalées de 68 (bonnes lignes : l.499, 282, 487, 177, 768). Elles sont toutes refaites, avec le pilote concerné à côté.
- Les chiffres du canyon venaient de pilote.js. Pour c0025, PROPOSITIONS.md l.93 dit que le canyon n'est pas un point faible propre au bot.
- La grande note de c0025, recomptée : la grotte fait 9 morts sur 22 (10 pour le relecteur, selon le découpage des routes). Les sorties mortelles à moins d'1 s sont 5 sur 58 à la grotte, pas « 6 sur 39 ».
- Le 33 % de c0025 (out-pDiag l.115) remplace le 53 % de pR2.
- Côté code : LOI_PILOTE existe déjà (modele.js l.60-62) ; le réacteur et retourOn sont mêlés (l.272, l.290, l.379) ; PROFIL est écrit avant la balise du génome (l.48-52). L'époque contient aussi modele.js, ressemblance.js et mesures.js (commun.js l.251-252). Le frein devient un drift au-delà de |steer| 0,35 (conduite.md l.58 et l.60).
- c0058 fait deux choses à la fois, l'idée bordOn et la correction du réacteur : ses effets sont confondus.
- Le banc à 59-60 graines : écart-type 3,92 sur 418 courses changées, d'où la règle n ≈ 121/(f d²). Débit d'environ 180 courses par heure (jouer.log). Au bras depart, « tour » fait 18 morts sur 60. Je ne lis aucune différence entre bras pendant la mesure.

Changements :
- **Retirés de la liste courte** : la seconde chance (elle gagne au banc par construction, puisque la note prend le sommet : c'est une décision de Sacha) et la nouvelle note (décision de Sacha).
- **Descendus dans la liste longue** : le réacteur (pas rare, effet trop petit pour être vu), le volant lâché en vol (jugé « douteux » le 27/11) et la toupie (à juger avec les secours).
- **Fusionné** : la loi retour n'est plus qu'un bras de référence dans la loi fidèle.
- **Rétrogradé** : le frein passe du n° 1 au n° 4, avec un compte à faire d'abord.
- **Ajoutés** : la bascule vers « rien » (n° 2), le cap au sol borné (liste longue), et dans les trous la ville, les morts « pic » et le zigzag au sol. Une section propose ce que le banc devrait savoir faire : maps imposées, compteur de déclenchements, banc séquentiel, critères ciblés, et une seule époque pour la vague 1.
- **En fin de LISEZ-MOI.md**, une section « Relecture » répond défaut par défaut. Les dix lignes pour Sacha en tête sont à jour. Il n'y avait pas de dossier brouillons/ à supprimer.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\prochaines-idees\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\prochaines-idees\candidats.json

### Retenus

- La sortie préparée sur les maps à décor (extension de bordOn, grotte d'abord)
- Laisser la bascule « pour mieux » aller vers « rien »
- La loi fidèle (LOI_PILOTE jugée, puis suivie)
- Freiner ou drifter au bord sur les maps à décor (après un compte préalable)
- Les secours en vol par les lois « retour » libres (avec la toupie)
- Une tête « valeur » apprise hors du jeu (C, génome v:4)
- La pose suivie au sol (B, les yeux)

### Problèmes

- Non refaits par moi, donc cités comme venant du relecteur : les morts par 100 km par map, les 78 morts au canyon de la graine 910111, les 1,93 raccourci par course et les 74 % de courses avec un raccourci, la part de grotte (48 %), les 134 secondes chances.
- La grotte : je compte 9 morts sur 22 dans note-voltige4, le relecteur 10 ; l'écart tient au découpage par l'événement « route ». Les deux chiffres sont écrits.
- Le relecteur chiffres disait que c0058 ne corrige pas le test du réacteur : c'est faux en partie. Sa raison dit qu'il fait les deux, donc ses effets sont confondus. C'est corrigé dans ce sens.
- Le banc avait avancé pendant la relecture (59 à 60 graines au lieu de 56) : les chiffres du bras depart sont mis à jour (tour 18, air 13, palier moyen 6,65). Ils restent partiels.
- Les propositions sur le banc (maps imposées, compteur de déclenchements, banc séquentiel) touchent ml/ecurie/etude/banc-des-genes et ml/bot. Elles sont seulement écrites, pas faites, puisque ces dossiers sont hors de ma part.
- La décision sur la seconde chance et sur la nouvelle note E reste à Sacha.
