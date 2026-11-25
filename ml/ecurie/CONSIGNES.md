# Les consignes du pilote — ce que la boucle dit à Claude avant chaque variante

Ce texte est la partie FIXE de la demande envoyée à l'API (`boucle.js` y ajoute le mode d'emploi de `ml/bot/README.md`, puis le pilote
parent, sa note et ses morts). Il ne change pas d'un tour à l'autre : c'est ce qui permet de le mettre en cache. Le modifier, c'est
changer ce que toute la boucle sait du jeu — une ligne dans `ETAPES.md` quand ça arrive.

## Le jeu, en ce qui compte pour un pilote

CASH CAR est un runner : une caisse roule sur une route suspendue dans le ciel, de portail en portail, d'une map à l'autre.
Le pilote est un programme `decide(vue, memoire)` appelé environ dix fois par seconde. Il ne touche jamais au jeu : il lit une vue,
il rend un ordre, des doigts appuient sur les touches d'un joueur.

**Le but : le PALIER.** Un palier est un moteur gagné en ramassant des pièces pendant la course (40 pièces pour le palier 2, 860 pour
le 11, 1 585 pour le 16, 4 385 pour le 30). Seules deux choses donnent des pièces : une pièce ramassée (1) et une figure posée (2 à 18).
L'argent, les fruits, les plaques, le flow n'en donnent pas.

**Ce qui décide du palier : survivre.** Un joueur ramasse environ 420 pièces par minute quel que soit son niveau. Palier 10 : deux à trois
minutes de course. Palier 20 : quatre à six. Palier 28 : huit à neuf. La densité des pièces monte à chaque portail franchi.

**La vitesse monte avec le palier**, jusqu'à six fois celle du départ, et les virages s'agrandissent avec elle. Ce qui passait au palier 5
ne passe plus au palier 20 sans anticiper.

## Comment on meurt

- **Presque toujours en vol.** Sortir par le bord ne tue pas : la caisse passe en vol. Elle meurt si elle touche le décor (roche de la
  grotte, pic de la jade, tour de la ville, paroi du canyon), si la jauge d'air se vide (6 s, 5 s dans l'espace), ou si elle tombe sous
  le fond du monde. Une pose, même lourde, ne tue jamais.
- **Au sol**, rien ne tue sur la dalle, sauf le mur d'un couloir touché à plus de 30° et plus de 200 km/h, et rester presque à l'arrêt 6 s.
- **Dans la grotte**, quitter la route c'est tomber sous sa dalle : la roche est à quelques dizaines de mètres. Jamais de sortie par le
  bord, jamais de saut dans un boyau.
- Le **radar** de la vue (yeux v2) prévoit l'issue d'un vol pour plusieurs façons de piloter. En vol : `vue.vol.radar.rayons`, **un TABLEAU**
  d'objets `{ m, issue, t, … }` où `m` est le nom du rayon (`tenu`, `rien`, `gauche`, `droite`, `cabre`, `pique`, `plane`, `planeCabre`,
  `versRoute`, `versRoutePlane`) ; `issue` — pose, levre, choc, air, fond, portail, libre, coupe (le calcul s'est arrêté avant l'horizon : comme
  libre) —, `t` en secondes, et pour une pose `s`, `lat`, `axe`, `note`, `propre`. **`rayons.versRoute` n'existe pas** (toujours `undefined`,
  sans erreur) : on cherche par le nom, en testant chaque étage —
  `const R = vue.vol && vue.vol.radar && vue.vol.radar.rayons; const r = Array.isArray(R) ? R.find(x => x.m === 'versRoute') : null;`
  puis `if (r && r.issue === 'pose') …` (`radar` vaut `null` caisse tenue au portail, ou `{ erreur }` sans `rayons`). Au sol, même chose pour
  `vue.sorties.bord.rayons` : `vue.sorties` vaut `null` le plus souvent, chaque sortie peut valoir `null`, et une sortie qui n'a pas lieu est
  `{ issue }` sans `rayons`. Au sol : `vue.tenue` (la route se tient-elle ?),
  `vue.sorties` (le même radar depuis le bord ; à gauche, à droite — avec le rayon `versRoute`, celui qui dit si l'on revient — ou par un saut
  si l'ordre d'avant porte `regarder:'sorties'`), `vue.virage.vSure` (la vitesse au-delà de laquelle le prochain virage ne se tient plus).
  Le détail : `ml/bot/README.md` § 2 bis. **Ce qui est mesuré, et ce qui ne l'est pas** (README § 2 ter) : en vol, quand la main tient la façon
  du rayon, l'issue annoncée est la bonne (141 vols sur 141 avec une main de machine, 107 sur 108 avec la main « clavier ») ; à la toute
  première vue d'un vol, avec une main à profil, seulement 7 fois sur 10 ; depuis le sol c'est une estimation, moins sûre, et le premier saut
  de la course est annoncé 0,4 s trop court. **Aucun pilote n'a encore décidé en lisant le radar** : qu'il fasse survivre est une
  hypothèse à vérifier, pas un fait. La loi `versRoute` (README § 2 bis) est la seule façon de revenir qui ait été mesurée après une sortie
  par le bord : après une sortie franche (volant à fond), elle n'a ramené la caisse qu'une fois sur trois.
- **Sous la dalle** (`vue.dessous` : les joueurs y roulent 7 % du temps au sol, et une pose dessous paie double), le `lat` des pièces, des
  fruits et des orbes est en miroir : lire **`latC`**, partout, à la place de `lat` (README § 2).

## Ce qui rapporte

- **Le fil des pièces** : rouler dessus, le braquage doux (l'élan se perd dès qu'on tourne fort).
- **La ligne parfaite** : le jeu pose devant la caisse un fruit puis une plaque en alternance. Chacun rend de la nitro ; les prendre tous
  permet de tenir la nitro presque sans arrêt. Sans elle, la nitro ne se tient que 20 % du temps.
- **L'aimant** (pomme dorée, puis moteur à partir du palier 16) : il élargit ce qu'on ramasse.
- **Les figures** : rares chez les joueurs (85 % des vols n'en ont pas), mais une figure posée au centre, proprement, vaut des pièces.
- **Un raccourci** ne donne ni pièce ni argent : du flow, un peu de nitro, et du temps gagné vers le portail.

## Ce qu'un vrai joueur fait, et qu'un pilote doit faire pour lui ressembler

Mesuré sur 14 parties de deux joueurs :
- un slalom permanent sur toute la largeur de la route, 1,1 à 1,6 changement de sens par seconde (1,24 en moyenne au clavier) — la main
  réglée n'en donne que 0,9 sur une ligne lisse : **le slalom est au pilote de le demander**, la main ne l'invente pas ;
- le volant par petits coups de 0,1 à 0,4 s, une centaine par minute, à intervalles irréguliers (la main `clavier` le fait déjà : 99,9 par minute) ;
- la nitro allumée 76 % du temps au sol, par tenues d'une seconde environ (0,3 à 4 s) ; jauge vide, la flamme bat toute seule, touche tenue. Ce
  n'est pas la main qui la demande : c'est le pilote (le cerveau d'essai ne la demande que 15 % du temps) ;
- 8 vols par minute, presque tous en sortant par le bord, 2 s chacun, 30 à 50 m de haut ;
- la seconde chance, une fois, dans les longues parties.

Le niveau d'un pilote ne se règle PAS par des réflexes surhumains (les limites d'une main — 67 ms par touche, deux gestes par seconde — sont
tenues par les doigts, hors du cerveau), ni par un rythme de ramassage anormal. Il se règle par ce qu'il regarde, sa prudence, sa qualité de
vol — et, plus tard, par son temps de réaction et ses erreurs : ceux-là sont dans `profil`, qui ne se règle pas à cette étape (voir plus bas).

## Les règles d'écriture d'un pilote

- Un fichier JavaScript qui pose `module.exports = { nom, profil, decide }`. Pas de `require`, pas d'horloge, pas de `Math.random`
  (retiré) : même graine, même course. Un hasard, s'il en faut un, est un générateur à graine rangé dans `memoire`.
- `profil` ne règle QUE la main (temps de réaction, volant par coups, nitro hachée, drift, seconde chance, erreurs : README § 3.1) ; un champ
  qu'il ne connaît pas REFUSE le pilote au chargement. Les réglages de la conduite restent des constantes nommées en tête du fichier. Sans
  `profil`, la main est une machine ; avec un profil, les ordres arrivent en retard et le volant ondule : le pilote doit être écrit pour sa main.
- **Ne change pas `profil` : la main est fixée pour cette étape.** Recopie celui du parent tel quel (ou son absence). La boucle compare l'empreinte
  du profil de chaque variante à celle du parent : une variante dont la main change est refusée avant d'être notée, et elle est payée quand même.
  Monter le palier en rendant la main plus vive, ou en prenant la seconde chance à chaque mort, n'est pas mieux conduire.
- Avec un profil, la vue porte `vue.main` : `attente` (dans combien d'images chaque ordre donné atteindra la main), `geste` (`'attend'`,
  `'joue'` ou `null`) et `refuse` (le dernier geste demandé n'est pas parti). Lire `refuse` avant de compter sur un saut.
- Un volant chiffré (`volant: ±1`) reste tenu quand le mode change : en vol, donner `ensuite: { ligne: 0 }` (ou `{ volant: 0 }`) avec l'ordre,
  sinon le plein volant du vol reste enfoncé 0,1 à 0,5 s au sol après la pose (README § 3.2).
- Lisible : des réglages nommés en tête, des fonctions courtes, un commentaire qui dit POURQUOI devant chaque règle, avec la mesure qui la
  justifie quand il y en a une (« MESURE : … »). Commentaires en français, sans accents dans le code, `/* … */`.
- Une vue peut manquer d'un champ selon la map ou le moment : ne jamais supposer qu'un tableau a une case, tester avant de lire.
  Une erreur dans `decide` rend un ordre vide pour cette décision : la caisse file tout droit.
- Changer UNE idée à la fois par rapport au parent, et dire laquelle. Une variante qui change dix choses n'apprend rien à personne.
