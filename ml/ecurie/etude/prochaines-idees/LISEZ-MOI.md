# Les prochaines idées (28/11/2026, relu le même jour)

## Pour Sacha, en dix lignes

1. **Ce qu'on cherche.** Les petits réglages ne se voient pas : le hasard d'une course vaut 3,26 paliers, l'écart entre deux réglages environ 0,3. On cherche des **changements de structure**, chacun écrit comme un interrupteur éteint à la naissance, puis jugé au banc des gènes.
2. **Trois relecteurs ont attaqué la première version.** Le n° 1 d'alors (freiner au canyon) reposait sur des chiffres de l'ancien pilote. Pour le pilote d'aujourd'hui (c0025), le canyon n'est pas un point faible propre au bot. Les vrais tueurs sont **la grotte** et **la ville**.
3. **N° 1, la sortie préparée** : à la grotte (et dans les autres maps à décor), quand la caisse va sortir par le bord, garder la nitro et choisir le vol plané si c'est le seul rayon qui se pose. C'est bordOn (au banc) étendu aux maps à décor.
4. **N° 2, lâcher la bascule vers « rien »** : dans un vol subi à la grotte, quand le volant lâché promet une pose droite, le pilote continue de braquer. Une ligne interdit aujourd'hui ce choix.
5. **N° 3, la loi fidèle** : la loi « retour » qui copie exactement la loi du pilote existe déjà dans le code (LOI_PILOTE). Il reste à la suivre, ou au moins à juger le vol sur elle.
6. **N° 4, freiner ou drifter au bord** : rétrogradé. Le jeu change ↓ en drift dès que le volant dépasse 0,35, et le volant est fort justement à ce moment-là. Il faut d'abord compter si le cas existe.
7. **Ensuite** : les secours en vol écrits avec les lois « retour » libres (sans toucher aux yeux), une tête de réseau qui apprend vraiment (cher), et la pose suivie au sol (change les yeux).
8. **Tes décisions** : la seconde chance plus tôt **n'est plus une idée du banc** (elle gagne par construction, puisque la note prend le sommet de la partie) : c'est à toi de dire si un palier gagné ainsi compte. Et une note E qui voit le volant en vol.
9. **Le banc doit voir plus finement** : à 96 graines, il ne voit qu'environ 1,1 palier. Il faudrait des courses sur une map imposée, un compteur de déclenchements, et un arrêt séquentiel comme le sacre. Tous les gènes A changent `modele.js` : une seule nouvelle époque pour tout le lot.
10. Rien n'a été couru pour écrire ce dossier : une mesure tourne sur ce PC. Chaque effet sur le palier reste **inconnu** tant que le banc ne l'a pas jugé.

## Comment lire ce dossier

- Les candidats viennent de six lecteurs (morts, ressemblance, vol-et-yeux, défauts, boucle payante, génome et têtes), puis de trois relecteurs (chiffres, code, mesure). Leurs défauts et ce que j'en ai fait sont à la fin, section « Relecture ».
- **Vérifié ici** : ouvert ou recompté par moi le 28/11 (lecture seule, aucune course). Le reste est écrit « (lecteur X) » ou « (relecteur X) » : leur source est citée, je ne l'ai pas refaite.
- **Le pilote concerné est toujours dit.** `pilote.js` = le premier pilote (25/11), qui volait peu. « pilote d'avant » = pilote-voltige avant la loi de vol corrigée (26/11). **c0025** = `ml/ecurie/pilote-voltige.js` d'aujourd'hui.
- Trois familles : **(A)** un gène dans `ml/evolution/modele.js` et `genome.js`, sans toucher aux yeux ; **(B)** les yeux, la main ou la note ; **(C)** les réseaux de neurones.
- ⚠ **A et B changent tous les deux l'époque des courses.** `ml/evolution/commun.js` l.251-252 (FICHIERS_EPOQUE) contient `modele.js`, `yeux.js`, `doigts.js`, `ressemblance.js`, `mesures.js`… Toucher l'un d'eux fait refuser toutes les courses en cache : le banc rejoue le bras « depart » (96 courses), et la sélection du Ryzen repart sur une époque neuve (vérifié ; voir aussi `../banc-des-genes/jouer.js` l.18-19). Il faut donc **écrire tous les gènes A retenus en un seul lot**. B change en plus ce que voient les yeux.
- Ce qui est **déjà au banc** n'est pas reproposé : lacheOn, slalomOn, coupOn, relacheOn, suitOn, fuirVite, bordOn, largeOn, libreOn, et les bras c0026, c0101, gestes5 (`../banc-des-genes/LISEZ-MOI.md`, « Les bras »).

### Combien de graines (règle corrigée)

À 96 graines, le banc voit un effet d'environ 1 palier quand toutes les courses changent (`../banc-des-genes/LISEZ-MOI.md`, « Ce qu'on ne pourra pas conclure »). Si l'idée ne change qu'une part **f** des courses et y vaut **d** paliers, il faut environ **n ≈ 121 / (f × d²)** graines (soit 121 × f / e², avec e = f × d l'effet moyen sur toutes les courses).

- Le 121 vient de l'écart-type de la différence de palier sur les courses changées : **3,92** sur 418 courses, tous bras (recompté ici sur `../banc-des-genes/etat/courses-2026-48.jsonl`, 59 à 60 graines par bras) ; 7,84 × 3,92² ≈ 121. Il va de 2,97 (libreOn, coupOn) à 4,78 (bordOn) : la constante va donc de 70 à 180 selon le bras.
- Quand toutes les courses changent : 2,8 × 3,92 / √96 ≈ **1,1 palier** visible à 96 graines.
- Débit du banc : 783 courses en 259 min (`../banc-des-genes/jouer.log`, dernière ligne lue), soit **environ 180 courses par heure**.
- Chaque candidat est chiffré **à deux effets** : le plafond du lecteur, et la moitié du plafond.
- **Plusieurs bras à la fois** : avec k bras, le seuil corrigé est 5 % / k (comme `analyser.js`). À 5 bras, l'effet visible grandit d'environ 1,25 fois ; à 13 bras, de 1,34 fois (relecteur mesure). D'où : **des vagues de 3 à 5 bras**, un critère principal annoncé avant de jouer, et aucune conclusion tirée d'une lecture en cours de mesure.

## Ce que j'ai vérifié moi-même

- **Bras « depart » du banc**, 60 courses lues le 28/11 vers 7 h 45 (`../banc-des-genes/etat/courses-2026-48.jsonl`, pilote 6e05036f) : causes **tour 18**, air 13, roche 12, vide 7, pic 5, paroi 4, glace 1 ; palier moyen 6,65 ; 9,8 vols par course ; 2 courses avec deux morts. Chiffres partiels : je ne lis aucune différence entre bras (la mesure n'est pas finie). Seuls les « identiques » servent ici, comme mesure de f : largeOn 56 sur 59, libreOn 49, fuirVite 39, coupOn 37, relacheOn 32 ; gestes5 0, slalomOn 1.
- **La grande note de c0025** (`ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json`, 20 parties de 900 s, 22 morts). Morts par map (mon découpage par l'événement « route ») : **grotte 9**, nuages 4, espace 3, canyon 3, ville 3 (le relecteur chiffres en compte 10 à la grotte : la différence tient au découpage). Sorties par le bord, et morts moins d'1 s après : grotte 58 et 5, canyon 9 et 2, ville 34 et 1, espace 60, nuages 64, jade 42 et 0. Longueur des routes : canyon 16 291 à 16 820 m ; grotte 9 324 à 13 293 ; espace 9 139 à 10 955 ; jade 8 717 à 10 869 ; nuages 6 275 à 7 889 ; ville 6 636 à 7 807.
- **Le canyon chez c0025** : `ml/ecurie/etude/selection-naturelle/PROPOSITIONS.md`, enquête 2, l.93 : « Le canyon n'est pas un point faible propre au bot » ; 2 sorties sur 9 mortelles dans la seconde, des deux côtés (l.97).
- **Code** : `ml/evolution/modele.js` l.43 (« ni drift, ni frein ») ; l.48-52 (PROFIL est écrit AVANT la balise du génome) ; l.60-62 (LOI_PILOTE et les lois du coup) ; l.237 (cap au sol borné à ±0,4 en dur) ; l.250 (nitro coupée quand la route lâche) ; l.254 (bordOn exige `!decor`) ; l.272 et l.290 (le test du réacteur dépend de `R.retours.length`) ; l.404 et l.418 (la bascule « pour mieux » ne va que vers une loi de retour). `ml/evolution/genome.js` l.191-193 (TETES, LONGUEUR, VERSION 3) et l.456 (retours n'est rempli que si retourOn vaut 1). `ml/bot/yeux.js` l.608-613 (lireRetours : 4 lois au plus, marge de −50 à 200). `ml/bot/doigts.js` l.83 (zone morte de la main `mort:.08`) et l.97 (palierMin de 1 à 30). `ml/ecurie/etude/conduite.md` l.58 et l.60 (↓ avec |steer| > 0,35 à bonne vitesse = drift, pas frein). `code/gameplay/seconde-chance.js` l.75-80 et l.91 (tMin 20 s, moteurPerte 1, prix = tout l'encaissé). `ml/bot/mesures.js` l.18 (le palier est le sommet de la partie).
- **Boucle payante** (`ml/labo/journal/cerveaux.jsonl`, champ note.paliers) : c0028 [3,3,6,8,8,12] ; c0052 [3,7,8,10,11,16] ; c0058 [3,7,8,10,11,13]. La raison de c0058 dit qu'il fait **deux** choses : la nitro tenue sur les sorties voulues sans décor (l'idée bordOn) **et** la correction du test du réacteur.

## LA LISTE COURTE

Classée par (effet attendu × confiance) / coût, en tenant compte de ce que le banc peut voir. Tous les gènes naissent « éteint » : le pilote joue au bit près comme c0025 tant que le drapeau vaut 0.

### 1. La sortie préparée sur les maps à décor (A, extension de bordOn)

- **Constat (c0025, vérifié).** 8 des 22 morts de la grande note arrivent moins d'1 s après une sortie par le bord, toutes sur décor : grotte 5, canyon 2, ville 1. La grotte est le premier tueur de c0025 (9 ou 10 morts sur 22). À la grotte, 5 sorties sur 58 tuent dans la seconde, contre 1 sur 44 chez les joueurs : « dans le bruit pris seul (p ≈ 0,2) », mais même sens sur deux jeux de données (PROPOSITIONS.md l.97). Le pilote coupe la nitro dès que la route lâche (modele.js l.250) et bordOn ne joue que hors décor (l.254).
- **Ce que ferait le pilote.** Au sol, sur une map à décor, quand la route lâche dans moins de `sortieT` s, il lit `vue.sorties.bord`. Si rien et versRoute finissent en choc et que plane se pose ou atteint la lèvre, il garde la nitro jusqu'au décollage et pose un drapeau **`m.planeBord`**, lu au début de enVol pour prendre la façon plane. Il ne touche pas `m.sortie` : sinon `m.voulu` deviendrait vrai (l.368) et les figures et la bascule vers viser changeraient aussi (relecteur code).
- **Gènes.** `sortieOn` drapeau, naissance 0 ; `sortieT` réel 0,3..1,2 s (proposé 0,7). Réutiliser `bordJauge` pour le seuil de jauge.
- **Le banc.** f ≈ 0,2 à 0,4 (la grotte est sur la route de 48 % des courses de la famille, relecteur mesure). Effet moyen au plafond 0,5 : n ≈ 121 × 0,3 / 0,25 ≈ **145** graines ; à 0,25 : ≈ **580**. Critère ciblé à compter dans le même bras : **les sorties préparées qui meurent quand même** (c'est ce qui teste le rayon plane du bord).
- **Effet attendu.** Inconnu. Plafond du lecteur morts : un demi-palier, peut-être un. Ressemblance : la nitro au décollage, un **gain de ressemblance** (nitroDecol, part 0,24 de E, lecteur ressemblance), et non une cause de mort : « ce n'est pas une cause : les joueurs sortent plus vite et meurent moins » (PROPOSITIONS.md l.98).
- **Déjà essayé, proche et négatif.** La nitro gardée au bord partout (`nitroBord`), sans regarder les rayons : 161 paliers au lieu de 181 sur 24 courses (`ml/ecurie/ETAPES.md` l.325, pilote de la fin de soirée du 26/11). c0028 (nitro tenue jusqu'au décollage, sur c0025) : [3,3,6,8,8,12] sur 6 graines.
- **Ce qui la réfuterait.** Presque tout « identiques » (le cas n'arrive pas), ou des sorties préparées qui meurent quand même. **Preuve contre déjà connue** : « à la grotte et au canyon l'annonce du sol est fausse » (4 sorties sur 4 contre la roche, 26/11, `ml/bot/README.md` l.185) ; refait avec les règles d'aujourd'hui, 2 morts sur 24 plongeons voulus (`ml/ecurie/ETAPES.md` l.184-185). Ces deux mesures portent sur les rayons viser des sorties gauche et droite, pas sur le rayon plane du bord, dont la justesse n'est pas mesurée. Le rayon versRoute du bord, lui, est juste 9 fois sur 10 (README l.280).

### 2. Laisser la bascule « pour mieux » aller vers « rien » (A, oubli du relecteur code)

- **Constat.** Dans les vols subis à la grotte, le rayon « rien » (volant lâché) a annoncé au moins une fois une pose droite (axe 0,09) qui ne retraverse pas, dans 23 vols sur 75 ; le bot a continué de braquer et s'est posé à 0,44 (PROPOSITIONS.md l.109, « plausible : la promesse ne tient que 4 % des vues, puisque le bot braque »). Aujourd'hui la bascule « pour mieux » ne va que vers une loi de retour (modele.js l.404 et l.418, `if(pourMieux&&!estRetour(nom))continue`). Les poses glissent à 0,45 rad à la grotte, 0,12 chez les joueurs (PROPOSITIONS.md l.103).
- **Ce que ferait le pilote.** Quand la façon tenue se pose en travers et que « rien » annonce une pose propre sur la dalle, plus droite d'au moins `rienEcart` rad, il lâche le volant (bascule vers « rien »).
- **En quoi ce n'est pas lacheOn.** lacheOn ne coupe le volant que dans les 0,35 s avant la pose ; ici, la décision est prise dès que « rien » promet mieux, plus tôt dans le vol.
- **Gènes.** `rienOn` drapeau, naissance 0 ; `rienEcart` réel 0,1..0,4 rad. Il demande que la bascule pour mieux s'ouvre sans volMieux : un test à part, pour ne pas toucher volMieux.
- **Le banc.** Cas plutôt rare (une promesse qui ne tient que 4 % des vues) : f petit, beaucoup de courses identiques, comparaison fine. Critère ciblé : la glisse après la pose et les sorties en chaîne à la grotte (33 % contre 14 % chez les joueurs, PROPOSITIONS.md l.101), plus fins que le palier (ETAPES.md l.312-313 : « Les mesures par vol tranchent avec deux lots ; le palier, non »).
- **Effet attendu.** Inconnu. Confiance faible : le constat est « plausible », pas « sûr ».
- **Ce qui la réfuterait.** Plus de poses sous la dalle ou de vols qui ratent la dalle (la loi « rien » ne vise rien).

### 3. La loi fidèle : le pilote vole avec une loi que les yeux jouent exactement (A)

- **Constat.** Le rayon versRoute du radar ne compte ni volDemiTour, ni volAvance, ni le retard de la main (`ml/ecurie/PASSATION.md`, « Le biais des rayons versRoute », lecteur vol-et-yeux ; `ml/bot/yeux.js` l.585-589). Il dit « air » pour 28 vols sur 171 qui se posent en fait (même commentaire, mesure sur le pilote qui vole). Dans `out-pDiag-930000.txt` (c0025 plus une ligne de trace), tableau C, ligne « air / air » : **5 se posent dessus, 5 dessous, 2 meurent** (l.62).
- **Ce qui existe déjà (relecteur code, vérifié).** `LOI_PILOTE` (modele.js l.60) : marge 28, cap 0,6, gain 1,6, portée 40, avance 0,25, retard de la main 0,2. Les yeux la jouent comme rayon retour<b> dès que coupOn vaut 1 (l.61-62). La loi « retour » des yeux n'a pas de zone morte, comprend le demi-tour et joue le retard (yeux.js l.590-602), et accepte une marge jusqu'à 200 (l.611). Il n'y a donc **pas de loi à écrire**.
- **Deux variantes.** (a) **la moins chère** : garder versRoute en vol, mais juger la façon tenue sur le rayon LOI_PILOTE au lieu du rayon versRoute du radar. Le biais est corrigé sans changer la conduite. (b) suivre LOI_PILOTE en vol (le pilote fait alors exactement ce que le rayon a joué). Les deux demandent LOI_PILOTE aux yeux même sans coupOn, et de gérer l'indice b quand coupOn est aussi allumé.
- **Gène.** `loiFidele` entier 0..2 (0 éteint, 1 = juger, 2 = suivre), naissance 0.
- **Mêlé à retourOn et au réacteur.** Dès que `R.retours` n'est pas vide, les l.272 et l.290 tiennent la nitro des raccourcis à réacteur, et le choix du départ s'ouvre (l.379). Si loiFidele passe par R.retours, il emporte tout cela. Il faut donc le faire passer par RETOURS_DEMANDES (comme coupOn), qui ne change pas `R.retours.length`.
- **Le banc.** f = 1, effet probablement sous un palier : 96 graines ne verront rien sur le palier (0,5 palier demande ≈ 480 graines, 2,7 h). Critère principal annoncé : **la part des morts air et vide** (20 sur 60 au bras depart, vérifié). Faire d'abord le test hors course : l'avance de retour() suit-elle celle du pilote ?
- **Déjà essayé.** La loi retour à marge 8 le 27/11 : « pas franchement meilleure » (`ml/ecurie/portfolio/journal/2026-11-27.md` l.31, lecteur vol-et-yeux). Mesure du 27/11 (`mesures-27nov/out-pR2*.txt`, 12 courses de 300 s, retourOn allumé) : somme des paliers 77 contre 83, glisse 0,28 contre 0,35 (lecteur vol-et-yeux).
- **La loi « retour » seule (l'ancien n° 4)** n'a plus de fiche à part : c'est le bras de référence de cette fiche, et il contient déjà la correction du réacteur (l.272, l.290) et le choix du départ (l.379). Un bras `retourOn` seul ne séparera rien ; il ne sert qu'à vérifier qu'on ne perd pas plus d'un palier.

### 4. Freiner ou drifter au bord sur les maps à décor (A) — rétrogradé, à compter d'abord

- **Constat corrigé.** Le pilote ne freine jamais (modele.js l.43). « Non essayé : freiner » (ETAPES.md l.499, section « L'étape C, premier temps », **pilote.js**). Le canyon n'est **pas** un point faible propre à c0025 (PROPOSITIONS.md l.93 et l.97 : 2 sorties sur 9 mortelles, comme chez les joueurs). Par km, le canyon et la ville restent les plus mortels : 15,6 et 12,7 morts pour 100 km, contre grotte 6,5 (relecteur chiffres, approché avec les longueurs médianes, journaux `ml/labo/journal`). La ville est la première cause du bras depart (« tour » 18 sur 60, vérifié). Dans les journaux, toutes les morts au canyon sont en vol, contre la paroi (relecteur chiffres) : le frein doit empêcher la sortie elle-même.
- **Le défaut de code (relecteur code).** Le jeu ne freine sur ↓ que si |steer| ≤ 0,35 ; au-dessus, et au-delà de 42 % de la vitesse maximale, ↓ devient un **drift** (conduite.md l.58 et l.60). Or quand la route lâche, le pilote vise le côté opposé (modele.js l.204) et la main braque fort (cas 910222 : ordres ligne −13 à −3, PROPOSITIONS.md l.111). Écrit tel quel, le frein serait surtout un drift involontaire. Le drift est un ordre à part (`drift:±1`, `ml/bot/README.md` § 3.4 l.490-496), tenu au moins 0,45 s.
- **Avant tout code** : compter, sur les vues déjà enregistrées, combien de vues « route qui lâche » sur décor ont |vue.volant| < 0,35. Si presque aucune : un seul bras « ↓ au bord », dont le jeu décide s'il freine ou s'il drifte.
- **Gènes.** `freinOn` drapeau, naissance 0 ; `freinAvance` 0,2..1,2 s ; `freinVmin` en **m/s** (vue.vitesse est en m/s, README l.84), 40..125 (≈ 150 à 450 km/h). Les maps visées : grotte, ville et canyon **ensemble** (un seul bras, f ≈ 0,5) ; pas de sous-bras.
- **Le banc.** e = 0,4 : 121 × 0,5 / 0,16 ≈ **380** graines ; e = 0,2 : ≈ **1 500**. Avec des courses à map imposée (voir plus bas), f passe vers 1 et un critère binaire (la sortie mortelle au bord) devient lisible.
- **Effet attendu.** Inconnu. Le plafond du lecteur défauts (+0,4 au canyon, +0,9 en ville) supposait que le canyon tue plus que chez les joueurs : la mesure sur c0025 dit le contraire pour le canyon.
- **Contre l'idée.** À l'étape C, aucun décollage ne venait d'un virage trop rapide, « vSure gardait 300 m/s de marge » (ETAPES.md l.487, **pilote.js**). c0005 (25/11, pilote.js) freinait au-dessus de la vitesse sûre et n'a presque jamais déclenché : 11 · 20 · 215 s, comme son parent (ETAPES.md l.768).

### 5. Les secours en vol, écrits avec les lois « retour » libres (A ; seul le volant ±0,5 serait B)

- **Constat.** 7 morts sur 22 de c0025 sont des vols perdus de 5 à 6 s (lecteur morts, grande note). Air et vide : 20 des 60 morts du bras depart (vérifié). Le radar n'essaie que 10 façons (yeux.js l.765-767, vérifié à la première version).
- **Ce qui existe (relecteur code, vérifié).** Les yeux jouent jusqu'à 4 lois « retour » à la demande, avec cabre, pique et quatre façons de tenir la nitro (yeux.js l.593-596, l.610). « Plane puis versRoute » (nitro 2 ou 3) et « versRoute cabré » s'écrivent donc comme des lois retour, **sans toucher aux yeux**. Places : coupOn en prend 2, retourOn 1.
- **Ce que ferait le pilote.** `secoursOn` : quand tous ses rayons annoncent air, vide ou choc, il demande deux lois de secours et prend celle qui se pose. Comme pour la loi fidèle, passer par RETOURS_DEMANDES pour ne pas allumer le réacteur.
- **À juger avec la toupie.** Le déclencheur est l'instant même où naît la toupie : 45 vols sur 299 (PROPOSITIONS.md l.108), soit au moins une toupie dans la plupart des courses (9,8 vols par course au bras depart). f ≈ 0,8, pas « rare ».
- **Avant le banc** : rejouer hors course les vues de vols perdus avec ces lois. Ne jouer un bras que si elles trouvent des poses.
- **Effet attendu.** Inconnu ; rien ne prouve qu'un rayon sauveur existait. Critère principal : la part des morts air et vide.
- **Déjà essayé, proche.** Les coups de nitro « à l'aveugle » (pilote d'avant), le plané tenu (`faire-pQ.js`), la sortie du dessous : « la troisième fois que la nitro en vol tue » (ETAPES.md l.306-310).

### 6. Une tête « valeur » apprise hors du jeu (C)

- **Constat.** Une pose annoncée à 0,35 rad ou plus ressort **33 fois sur 100** chez c0025 (58 poses, `mesures-27nov/out-pDiag-930000.txt` l.115) ; 53 % sur 40 poses avec la loi retour allumée (`out-pR2-930000.txt` l.103). La tête RAYON agit dans la bascule (modele.js l.399, l.419) et au choix du départ quand des lois retour sont demandées (l.379, l.383). Après dix mutations, l'écart RAYON entre deux rayons vaut 8 points en médiane, la bascule en demande 10 (calcul du lecteur génome).
- **Le défaut de code (relecteur code).** Les poids appris ne peuvent pas aller dans WV : WV est lue pour chaque candidat et la sélection la mute. Il faut une **troisième tête** à part, gardée par `valeurOn`, hors de l'urne des mutations : TETES et LONGUEUR à changer dans genome.js (l.191-192), **génome v:4** et sa migration.
- **Le piège à éviter.** Récolter et ajuster sur les graines d'entraînement (910 000…), et garder une plage de graines neuve, jouée une seule fois, pour le verdict. Sinon on refait la boucle payante : +2 paliers sur ses graines de validation, +0,03 [−1,18 ; +1,38] sur 40 graines neuves (`../boucle-payante-ryzen/LISEZ-MOI.md`).
- **Dépend de** la loi fidèle ou des lois retour (la bascule ne va que vers une loi de retour, l.404 et l.418) : la juger contre ce bras-là, pas contre le départ.
- **Coût.** Gros : environ 100 courses enregistrées vue par vue (lecteur génome), un outil d'ajustement, le génome v:4. Compter d'abord combien de vues ouvrent la bascule.

### 7. La pose suivie au sol (B, les yeux) — Sacha prévenu

- **Constat.** Re-sorties en moins de 0,8 s : 36 % contre 29 % (ETAPES.md l.295, pilote de la grande note du 26/11) ; 33 % contre 14 % à la grotte (PROPOSITIONS.md l.101, c0025). À la dernière vue, le radar lit 0,29 pour une glisse réelle de 0,36 (PROPOSITIONS.md l.140).
- **Ce qui existe déjà (relecteur code, vérifié en partie).** Chaque rayon qui se pose porte son axe d'arrivée, et `vaut()` calcule déjà une glisse avec le gène `derive` (modele.js l.345 ; genome.js l.33). Le neuf : **le lacet au contact** (en rad/s) et un rayon prolongé 0,8 s au sol (PROPOSITIONS.md l.139).
- **Le banc.** Nouvelle époque des yeux : bras depart rejoué. À grouper avec tout autre changement des yeux, en **une seule** époque.
- **Ce qui la réfuterait, sans course.** Sur les vols déjà enregistrés, compter combien avaient un autre rayon qui aurait tenu. Si presque aucun : inutile.

## Ce qui demande une décision de Sacha (hors classement)

### La seconde chance prise plus tôt — pas une idée du banc

- **Pourquoi elle sort du banc (relecteur mesure).** Le palier noté est le **sommet** de la partie (`ml/bot/mesures.js` l.18). Jusqu'à la première mort, la course est identique ; la reprise ne peut qu'ajouter. La différence vaut toujours 0 ou plus : « aide » serait automatique et ne dirait rien de la conduite. Elle allongerait aussi les courses et grossirait le hasard de tous les bancs suivants.
- **Ce qu'elle coûte dans le jeu.** Le moteur perd un palier (`moteurPerte:1`) et la reprise coûte **tout l'encaissé de la partie** ; elle n'est jamais offerte avant **20 s** (`CHANCE.tMin`) (`code/gameplay/seconde-chance.js` l.75-80 et l.91).
- **Ce qu'on sait.** palierMin 12 aujourd'hui (modele.js l.50). Dans les journaux, les courses au palier 12 ou plus sont exactement celles qui l'ont prise (134 sur 134, relecteur mesure). Les joueurs la prennent dans 2 parties sur 10 (`ml/ecurie/etude/realisme.md` l.183). CONSIGNES.md l.149 : la prendre à chaque mort « n'est pas mieux conduire ». Sans reprises, le record des joueurs tombe de 28 à 21 (`ml/ecurie/etude/defauts-confirmes.md` § 19, lecteur défauts).
- **Les estimations de gain** (+2,1 à +2,5 paliers, lecteurs morts et défauts) : **non vérifiées**, aucun fichier ni script ouvrable.
- **Si tu la veux** : la chiffrer une fois, hors du banc, puis la tenir allumée (ou éteinte) dans **tous** les bras. Côté code : PROFIL est écrit avant la balise du génome (modele.js l.48-52) ; un gène `chancePalierMin` y lèverait une erreur. Il faut déplacer PROFIL sous la balise, puis vérifier que `ml/evolution/identite.js` retrouve c0025 au bit près.

### Une note E qui voit le volant en vol (B, la note)

- **Constat.** E a 15 mesures (`ml/bot/ressemblance.js` l.28-33). Quatre des mesures proposées le 26/11 y sont déjà (aller, nitroSol, dessous, poseCentre) ; **pas** le volant en vol ni les allumages de nitro en vol. Chez c0025 : |volant| moyen en vol 0,48 à 0,57 contre 0,21 à 0,27 chez les joueurs, volant à fond tenu 0,5 s ou plus dans 29 % des vols contre 4 % (PROPOSITIONS.md l.104, 206 vols de plus de 1 s de chaque côté). Les pouvoirs de séparation 0,919 et 0,893 (`realisme.md` l.291-292) ont été mesurés sur **pilote.js** (realisme.md l.261) : à refaire sur c0025.
- **Coût caché.** `ressemblance.js` et `mesures.js` font partie de l'époque (commun.js l.251-252) : toutes les notes sont à refaire.
- **Ce qui la réfuterait.** Un intervalle (bootstrap par partie, en lecture seule) dont la borne basse tombe sous 0,7 : l'étalon n'a que 2 joueurs et 8 parties au clavier de plus de 60 s.

## Avant de jouer : ce que le banc devrait savoir faire

Ce sont des changements de `../banc-des-genes/` ou de `ml/bot/`, hors de ce dossier : à proposer, pas faits.

- **Des courses à map imposée.** `ml/bot/noter.js` accepte déjà `--carte` (relecteur mesure) ; `jouer.js` du banc ne le sait pas. Pour les n° 1 et 4, f passe vers 1 : environ 4 fois moins de graines.
- **Un compteur de déclenchements par gène** dans chaque ligne de course. Aujourd'hui, seul « identiques » donne f, après coup. c0005 avait un frein qui ne partait jamais (ETAPES.md l.768). 24 graines diraient si un bras mérite 96 graines ou plus.
- **Un banc séquentiel**, comme le sacre (24 graines, puis 12 par 12, arrêt annoncé à l'avance) : il arrêterait vite les bras presque identiques (largeOn 56 sur 59, vérifié) et donnerait les graines aux bras qui changent tout. Voir `../reglage-de-la-selection/LISEZ-MOI.md`.
- **Des critères ciblés** annoncés avant de jouer : morts air et vide (n° 3, 5), sorties préparées mortes (n° 1), glisse et sorties en chaîne à la grotte (n° 2).
- **Une seule époque pour un lot.** Vague 1 proposée (tous des gènes A, un seul changement de `modele.js`) : sortieOn, rienOn, loiFidele (1 puis 2), freinOn si le compte préalable le justifie, plus le bras depart rejoué. Seuil corrigé 5 % / 5 = 1 %.

## LA LISTE LONGUE (écartés ou remis à plus tard)

- **Le réacteur reconnu dans les sorties voulues** (ancien n° 5) : remis à plus tard. Le défaut de code est réel (modele.js l.272 et l.290 : avec R.retours vide, seule la façon « plane » décolle nitro tenue). Mais seul **viserPlane** est concerné : versRoutePlane n'est jamais la façon d'un raccourci (`ml/bot/yeux.js` l.879 et l.953, relecteur code). Et le cas n'est pas rare : 1,93 raccourci par course, 74 % des courses en ont au moins un (relecteur mesure, journaux). Avec un effet probable sous 0,4 palier, il faudrait plus de 1 000 courses. Déjà essayé : c0052 (la correction plus un bonus de 15 points) [3,7,8,10,11,16] ; c0058 (la correction **et** l'idée bordOn, confondues) [3,7,8,10,11,13] ; c0028 [3,3,6,8,8,12] ; tous sur 6 graines, en tri de 600 s quand le parent c0026 a été noté en 900 s (relecteur chiffres). Il est déjà contenu dans tout bras qui remplit R.retours. À rouvrir : compter d'abord les engagements viserPlane dans les traces.
- **Le volant lâché en vol une fois le cap pris** (ancien n° 8) : descendu. La même idée (une bande morte en vol de 0,12 rad) a été jugée **« douteux »** le 27/11 : le volant fort vient de la consigne bornée à 0,6 au bord, pas des petites erreurs, et la main a déjà une zone morte (PROPOSITIONS.md l.126-131 ; `ml/bot/doigts.js` l.83, `mort:.08`). Le 59 % contre 31 % venait d'une seule course. Son but est la ressemblance, que E ne voit pas : à rouvrir seulement avec la nouvelle note, et seulement si lacheOn n'a pas déjà réduit l'écart.
- **Pas de toupie** (ancien n° 12) : à juger avec les secours (n° 5), jamais seul. Pas rare : f ≈ 0,8. Son but est la ressemblance à l'œil, invisible au palier et à E.
- **Le cap au sol borné sur les maps à décor** (oubli du relecteur code) : remis à plus tard. La borne ±0,4 est en dur (modele.js l.237) ; à la grotte, cap au-dessus de 0,35 rad 9,7 % du sol contre 4,2 % chez les joueurs (PROPOSITIONS.md l.110). Mais c'est un réglage déguisé, déjà classé « faible priorité » : « Le zigzag vient surtout de la main (faire-pY.js n'a rien donné), le gain peut être nul » (PROPOSITIONS.md l.143-146).
- **Le cap de rentrée borné quand le contact approche** : écarté. Un cap visé plus doux ne passe pas dans l'angle d'arrivée (0,48 à 0,51 contre 0,50, PROPOSITIONS.md enquête 1) ; onze variantes de la boucle payante, aucune sacrée. À rouvrir si lacheOn ou suitOn aident au banc.
- **La loi d'arrivée selon le temps avant la pose (c0108)** : écartée. c0108 +0,85 ± 0,82 sur 20 graines, E plus mauvais (1,525 → 1,636) (lecteur boucle-payante).
- **Le raccourci cherché quand la route lâche (c0077)** : écarté pour l'instant. +0,20 palier, 2 courses sur 20 changées (lecteur boucle-payante).
- **Préférer en vol les ordres pleins (c0011)** : écarté. +2 en grand, ne tient pas en validation (10,5 contre 11), sur **pilote.js** (ETAPES.md l.767-769, l.780).
- **Le décollage qui monte** : écarté. Cibles plus hautes avec nitro : 3 morts sur 10, retiré (ETAPES.md l.172-173, pilote d'avant) ; « partir en montant » dans les vols subis : 6 versions, toutes négatives (lecteur boucle-payante).
- **Rouvrir la grotte aux raccourcis** : déjà essayé, un palier à un palier et demi de moins sur 24 courses (ETAPES.md l.184-187).
- **Corriger le rayon du sol des yeux sur les maps à décor** : remis à plus tard ; justesse.js ne tire pas ces rayons (README l.185). À mesurer d'abord.
- **Un radar de raccourcis qui propose plus de sorties** (lecteur boucle-payante) : remis à plus tard (B).
- **Le compte de bot crédible** : remis à plus tard ; utile seulement si un joueur voit le compte d'un bot (realisme.md § 1.10).
- **La loi de vol des joueurs apprise sur l'étalon** (C) : remis à plus tard ; 193 vols de 2 joueurs (lecteur génome).
- **La nitro au sol apprise par la tête SOL** (C) : écartée, avec le bon chiffre. Refait après la loi de vol corrigée : 53 % du temps (le réglage gardé, celui de c0025) donne 181 paliers ; la nitro presque partout, 143 à 147 paliers (ETAPES.md l.315-327). libreOn est au banc. (L'ancien chiffre « 38 % → 8 à 8,5 », ETAPES.md l.177, était celui du pilote d'avant.)
- **Les figures achetées, le départ boosté, la pomme dorée** (lecteur défauts) : écartés, aucun chiffre.
- **La jade où l'ancien pilote ne mourait jamais** : voir « Les trous » (les morts « pic » de c0025).

## Les trous

- **La ville** : « tour » est la première cause du bras depart (18 sur 60, vérifié), et 12,7 morts pour 100 km (relecteur chiffres). On ne sait pas pourquoi. ETAPES.md l.246 relevait 17 % de morts par vol en ville (pilote du 26/11). Aucune idée de la liste ne la vise d'abord, sauf le frein (n° 4). Il faut des autopsies, interdites pendant la mesure.
- **Les morts « pic »** : 5 sur 60 au bras depart (vérifié), alors que pilote.js ne mourait jamais sur un pic (realisme.md l.188). Une cause nouvelle chez c0025, ni expliquée ni visée.
- **Le zigzag au sol qui s'amplifie vers 550 km/h**, deuxième forme des morts juste après une sortie (ETAPES.md l.282-284). Viser depuis l'écart futur n'a rien donné : « le zigzag a une autre cause que le retard de la main » (l.302-303). Un défaut de structure de la loi au sol, sans idée pour l'instant.
- **Le détail de chaque mort** (map, temps depuis la sortie, pose d'avant) n'existe que pour les 20 courses de la grande note de c0025. Les lignes du banc ne disent pas la map de la mort.
- **La justesse des rayons** de `vue.sorties.bord` (le rayon plane), des rayons viser et de planeCabre n'est pas mesurée. Le n° 1 en dépend.
- **Les vols enregistrés vue par vue** sont hors git, anciens, avec des doublons. Les n° 5, 6 et 7 demandent d'abord une récolte neuve.
- **Les comptes des journaux** (1 052 courses) rejouent environ 40 graines avec des pilotes proches : pas indépendants. Une seule graine (910111) fait 78 des 253 morts au canyon (relecteur chiffres).
- **L'étalon des joueurs** est petit (2 joueurs, 8 parties au clavier de plus de 60 s) et ne garde pas ↑ ↓ (realisme.md l.393, lecteur) : on ne sait pas si les joueurs freinent.
- **Le banc est en cours** (59 à 60 graines sur 96 par bras). Si lacheOn, suitOn ou bordOn changent la pose ou la sortie, l'intérêt des n° 1, 2 et 6 change aussi.

## Relecture (28/11/2026)

Trois relecteurs (chiffres, code, mesure). Pour chaque défaut : ce que j'ai vérifié, ce qui a changé.

### Relecteur « chiffres »

- **N° 1, le frein, constat périmé (bloquant).** Tient. realisme.md l.25 et l.180 sont bien sur pilote.js ; PROPOSITIONS.md l.93 dit l'inverse pour c0025 ; les routes du canyon font 16,3 à 16,8 km (vérifié). → Le frein passe du n° 1 au n° 4, avec la grotte, la ville et le canyon en un seul bras ; « traversées » remplacé par les morts par km (chiffres du relecteur, cités comme tels) ; realisme.md l.180 retiré ; « pilote.js » écrit à côté de chaque citation d'ETAPES. Je trouve 9 morts à la grotte, pas 10 (découpage des routes) : les deux sont dits.
- **Lignes d'ETAPES.md décalées de 68 (sérieux).** Tient (vérifié par grep : l.499, l.282, l.487, l.177, l.768). → Toutes les références refaites, avec le pilote concerné.
- **N° 10, le 53 % vient de pR2 (bloquant).** Tient (out-pR2 l.103 contre out-pDiag l.115 : 33 % sur 58). → Corrigé ; ajouté que la tête agit aussi au choix du départ (l.379, l.383).
- **N° 7, les pouvoirs de séparation sur pilote.js (bloquant).** Tient (realisme.md l.261). → Remplacés par PROPOSITIONS.md l.104 (c0025) ; « 4 des mesures intégrées, pas le volant en vol » écrit.
- **N° 5, c0058 cité à tort (sérieux).** Tient en partie. La raison de c0058 dit qu'il fait les deux choses : l'idée bordOn **et** la correction du test. → c0058 cité comme preuve confondue ; l'écart de tmax (600 contre 900 s) signalé ; le réacteur descend dans la liste longue.
- **N° 8, verdict « douteux » oublié (sérieux).** Tient (PROPOSITIONS.md l.126-131). → Descendu dans la liste longue avec ce verdict.
- **N° 3, « 6 sur 39 » introuvable et nitro de sortie prise pour une cause (sérieux).** Tient : mon recompte donne 5 sur 58 (comme PROPOSITIONS.md l.97). → Corrigé, avec p ≈ 0,2 ; la nitro de sortie présentée comme un gain de ressemblance (l.98).
- **La nitro au sol écartée sur un chiffre périmé (sérieux).** Tient (ETAPES.md l.177 contre l.315-327). → Écartée avec les chiffres refaits.
- **N° 2, coût et seuil de 20 s oubliés (mineur).** Tient (seconde-chance.js l.75-80, l.91). → Ajoutés ; les deux estimations de gain marquées « non vérifiées ».
- **N° 6, « 10 sur 12 se posent » (mineur).** Tient (out-pDiag l.62). → « 5 dessus, 5 dessous, 2 meurent ».
- **Oublis.** La ville : ajoutée aux trous et au frein (18 sur 60 au bras depart, vérifié). La grotte : elle devient la cible du n° 1, et le n° 2 (vers « rien ») la vise aussi. Le zigzag au sol : ajouté aux trous (ETAPES.md l.282-284, l.302-303). Les morts « pic » : ajoutées aux trous (5 sur 60, vérifié ; realisme.md l.188).

### Relecteur « code »

- **N° 1, le frein devient un drift (sérieux).** Tient (conduite.md l.58, l.60 ; modele.js l.204). → Un compte préalable de |vue.volant| < 0,35 ; freinDrift supprimé ; freinVmin en m/s.
- **Toute la famille A change l'époque (sérieux).** Tient (commun.js l.251-252). → Écrit dans « Comment lire » ; un seul lot, une seule époque ; ajouté que ressemblance.js et mesures.js en font aussi partie.
- **N° 4 et 5 mêlés (sérieux).** Tient (modele.js l.272, l.290, l.379 ; genome.js l.456). → La loi retour n'a plus de fiche à part ; la loi fidèle et les secours passent par RETOURS_DEMANDES ; le réacteur descend.
- **N° 5, versRoutePlane impossible (mineur).** Tient (yeux.js l.953 : LISTE_COTE = rien, plane, versRoute ; l.879 : viser ajouté aux sorties). → « viserPlane seulement » ; c0028 et c0058 cités.
- **N° 6, LOI_PILOTE existe déjà (sérieux).** Tient (modele.js l.60-62 ; yeux.js l.590-611). → Fiche réécrite : pas de loi à écrire, deux variantes (juger, suivre) ; « les bornes de retMarge bloquent » retiré.
- **N° 2, PROFIL avant le génome (mineur).** Tient (modele.js l.48-52). → Écrit dans la fiche de décision ; reclassée « A, décision de Sacha » et sortie du banc (voir relecteur mesure).
- **N° 3, preuve contre et m.voulu (sérieux).** Tient : README l.185 (4 sur 4, 26/11) et l.280 (versRoute du bord 9 sur 10). J'ajoute ETAPES.md l.184-185 : avec les règles d'aujourd'hui, 2 morts sur 24 plongeons, sur les rayons viser. → Un drapeau `m.planeBord` à part ; présenté comme une extension de bordOn ; « Ce qui la réfuterait » complété ; le trou sur sorties.bord corrigé (seul le rayon plane n'est pas mesuré).
- **N° 10, WV ne peut pas porter les poids appris (sérieux).** Tient (modele.js l.383, l.399, l.419 ; genome.js l.191-193). → Une tête à part, génome v:4, coût « gros ».
- **N° 11, mal classé en B (sérieux).** Tient (yeux.js l.593-596, l.610). → Devient le n° 5, famille A, avec les places libres ; le volant ±0,5 seul resterait B.
- **N° 9, une partie existe déjà (mineur).** Tient (modele.js l.345 ; genome.js l.33, derive 0..0,6, naissance 0,3). → Le neuf limité au lacet au contact et au rayon prolongé au sol.
- **N° 8, la main a déjà une zone morte (mineur).** Tient (doigts.js l.83). → Écrit dans la liste longue.
- **Lignes d'ETAPES (mineur).** Même défaut que chez le relecteur chiffres : corrigé.
- **Oublis.** La bascule vers « rien » : ajoutée, n° 2 (PROPOSITIONS.md l.109 ; modele.js l.404, l.418). Le cap au sol borné : ajouté à la liste longue (c'est un réglage, déjà classé « faible priorité »). La variante la moins chère de la loi fidèle : ajoutée (variante a du n° 3). Les places libres des lois retour : c'est le n° 5.

### Relecteur « mesure »

- **La règle des graines sous-estime (sérieux).** Tient : je trouve 3,92 sur 418 courses changées (la mesure a avancé depuis : 59 à 60 graines). → 121 au lieu de 96, de 70 à 180 selon le bras ; chaque candidat chiffré au plafond et à la moitié ; débit 180 par heure (783 courses en 259 min, jouer.log).
- **13 bras d'un coup (sérieux).** Tient. Le banc corrige déjà ses 12 bras (Bonferroni, `../banc-des-genes/LISEZ-MOI.md`), mais pas une vague future. → Vagues de 3 à 5 bras, seuil et critère annoncés avant ; plus aucun chiffre de différence entre bras lu pendant la mesure (le dossier ne cite que les « identiques »).
- **La seconde chance gagne par construction (bloquant).** Tient (mesures.js l.18). → Sortie du banc et du classement ; décision de Sacha, à tenir pareille dans tous les bras.
- **Le réacteur n'est pas rare (sérieux).** Tient (chiffres du relecteur, non refaits). → Liste longue.
- **La toupie n'est pas rare (sérieux).** Tient (45 sur 299, PROPOSITIONS.md l.108 ; 9,8 vols par course, vérifié). → Liste longue, liée aux secours.
- **Les secours et la toupie au même instant (sérieux).** Tient. → À juger ensemble ; test hors course d'abord ; f ≈ 0,8. La critique « nouvelle époque des yeux » ne tient plus, puisque les secours passent en famille A.
- **Le volant lâché, but non mesuré (sérieux).** Tient. → Liste longue, lié à la nouvelle note.
- **La loi retour, 96 graines ne verront rien (sérieux).** Tient. → Elle n'est plus qu'un bras de référence, qui sert à vérifier qu'on ne perd pas plus d'un palier.
- **La loi fidèle, effet sous le seuil (sérieux).** Tient. → Critère principal : morts air et vide ; test hors course d'abord ; 480 graines pour 0,5 palier.
- **La tête apprise, ajustement sur le banc (sérieux).** Tient. → Graines d'entraînement pour ajuster, une plage neuve jouée une fois pour juger, comparaison contre le bras retour.
- **Le frein, coût sous-estimé (sérieux).** Tient. → Un seul bras sur trois maps (f ≈ 0,5), 380 à 1 500 graines, et des courses à map imposée.
- **La sortie préparée, f bornable (mineur).** Tient. → f ≈ 0,2 à 0,4, 145 à 580 graines, et le compte des sorties préparées mortes.
- **La pose suivie, coût réel (mineur).** Tient. → Une seule époque des yeux pour tout le lot B, et le compte hors course d'abord.
- **La note, étalon petit (mineur).** Tient. → Bootstrap par partie ; borne basse au-dessus de 0,7.
- **Oublis.** Les maps imposées, le compteur de déclenchements, le banc séquentiel, les critères ciblés : regroupés dans « Avant de jouer : ce que le banc devrait savoir faire ».
