# Le jury de conception des modules (nuit du 2026-11-18)

Trois propositions indépendantes (le pilote, la ville d abord, le tirage) puis un jury qui a vérifié dans le code. Lecture seule : rien n a été exécuté.

## La synthèse du jury

SYNTHÈSE DU JURY (j'ai vérifié dans le code, rien n'a été édité ni lancé)

**Constats vérifiés qui changent la donne**
- **Le 1er rang a des trous.** Dans `jade-balade.js:188`, les rangs posent la tour à lat = ROAD_HALF+24+hypot/2+vr·16. Mais `tourLibre` (l.60) teste clr = (hypot/2**+5**)+ROAD_HALF+24. Quand vr·16 < 5, soit environ 31 % des tours en ligne droite, le centre tombe dans clr. Le toit est alors rogné à p.y−60, donc sous la route. À l'égalité, les 4 passes ne trouvent pas de solution et la tour disparaît. Résultat : le « mur toujours à yN+30 » (l.129) est édenté au hasard, ce qui alimente en partie le « généré autour ». À mesurer en Node avant tout autre lot. La correction coûte une ligne (+5 sur lat, mêmes tirages `vr`, route intacte).
- **`frole` ne mesure pas un ressenti.** `dbgVilleAudit().frole` (`ville-v3.js:431`) compte les DÉFAUTS (une boîte à moins de 6 m du bord). Qu'il vaille 0 est la norme. Il faut un vrai banc du ressenti (celui du pilote).
- **Le frôlement à la corde existe déjà**, mais seulement dans les scènes : `sFacade` (géante au centre, marge 14 m, dévers 0,6 rad = 34°) et la géante de la boucle (`ville-scenes.js` vsReserve, mg 14). Il reste à le généraliser aux liaisons et aux souffles. Le « mur en face » existe aussi dans `sTraversee` (la ligne de mire).
- **Le squelette par modulos est confirmé** : CLIMAX `[…][graine%4]` (`ville-entree.js:359`), traversée `graine%2===0` (l.508), ouverture `j1=gr9%nL` (l.459), saut des néons `graine&1` (vSaute), décor de la vrille `(gr9>>2)%4`. La proposition « le tirage » a raison.
- **Dévers automatique** : BM = 0,5 rad sous tanh, soit ≤ 28,6° (le commentaire dit 24°). Le dévers scripté monte jusqu'à 34°.
- **⚠ `VS.scenes` entre aussi dans le `MCJ` de Crypto City** (`ville-entree.js:453`). Un module du lot A ajouté à `VS.scenes` change donc l'empreinte de Crypto City. Il faut l'inscrire hors de `VS.scenes`, avec une garde `MC==='ville'`.

**(1) Ce que le lot A doit corriger ou ajouter**
- **Slalom des tours.** La tour « dans la ligne de mire » est l'endroit où atterrit un vol tout droit.
  - Ne poser de tours que côté INTÉRIEUR de chaque arc : en vol, la caisse part sur la tangente, vers l'extérieur.
  - Jamais dans un AIRZ, jamais sur une lèvre de raccourci.
  - Le mur extérieur doit être à plus de 2 s de vol.
  - Le distinguer du « slalom des géantes » déjà au paquet (une tour par intérieur, à 14-20 m), sinon c'est un doublon.
- **Piqué.** La crête d'entrée lance la caisse dès que le rayon vertical est inférieur à v²/g (≈ 1,6 km au palier 0) : c'est un saut.
  - Il faut un cône `FILETMARK.air`, comme `vSaute`, et une piste de réception dans l'axe sur 1,75·vD·t0.
  - Dévers `nul` sur le piqué.
  - Ressource ≥ 3 rP.
  - « Nappes de circulation » : uniquement des instances néon immobiles (lumA, ALLEGE : moitié), aucune animation par image.
- **Montagnes russes des toits.** Chaque crête lance. Un toit 8 m sous la dalle est mortel au retour.
  - Un AIRZ derrière chaque crête (toits à a.y−60).
  - Le creux doit tenir sur la trame (rues de 76×58 m) ou ne pas descendre sous les toits.
  - C'est un doublon de `sCrete`, à marquer du même verbe.
- **Tranchée.** Avec un mur à 14 m (42 m de l'axe), un vol droit sort du S après √(2·42·R), soit environ 108 m (1,5 s) à 2,3 rP.
  - R ≥ 4 rP, ou une preuve au simulateur de vol mains libres.
  - C'est un doublon de l'avenue de `sPlongee`, même verbe.
- **Pour les quatre modules :**
  - une entrée dans la table `LONG`/`VS.longueur` (sinon `vPlace` les juge à [8,6] s) ;
  - `?sans=villecyber` rend l'avant au bit près (`d63b36e2af8b`/`fb378a8c6756`) ;
  - crypto `5447610bd8f2` inchangé ;
  - preuve : chacun forcé 50 graines × 3 paliers, 0 refus d'emprise, rmin ≥ 2 rP, R1/R2, 2 raccourcis au palier 0.

**(2) Cahier des charges du lot U**
- **Le plan.** Un nouveau morceau `maps/ville-uniques.js`, interrupteur `?sans=villeuniques`, périmètre `MC==='ville'`. `ruPlan('ville',graine)` remplace TOUS les modulos listés plus haut. Il fixe :
  - l'ordre du sac (`ruOrdre`) : scènes, géantes, lot A, petits modules ;
  - l'ouverture (`ruChoix 'ouv'`) : plongeon en 3 formes, vrille 1 fois sur 6 et jamais au palier ≥ 10, traversée haute, toits d'abord ;
  - le climax, tiré parmi les modules de rôle F et sans rang fixe ;
  - le rang des 2 raccourcis : leur présence reste imposée (R6, `vsMalusRac`), seul leur rang est tiré ;
  - le tempérament d'étage, qui pilote le lot A2-1.
- **Les verbes.** Chaque module porte un verbe : frôler, plonger, crête, traverser, tourner autour. Jamais deux fois le même verbe de suite. On tresse grands et petits modules (jamais 3 du même genre de suite), comme à Jade.
- **Le meilleur-de-N.** Les essais rejouent le MÊME plan (le cache RU.P). `ruMarque` ne se fait que sur la route gardée. `ruDeja` et `ruRefait` (2 au plus) empêchent de rejouer une suite déjà jouée. Une graine `null` revient au repli `rf`.
- **La mesure** (`unicite.cjs carte=ville`, Node, 200 routes × paliers 0/10/20) :
  - suites distinctes 200/200 ;
  - premier module le plus fréquent ≤ 10 % ;
  - paires `ruFormeProche` à moins de 50 m sur 3 km : 0 ; à moins de 100 m : ≤ 5 ;
  - la charte : `ville-torsades`, R1/R2, rayon, R6, `vsCroise` ;
  - empreintes avec l'interrupteur coupé identiques ; crypto, nuages et espace identiques avec l'interrupteur allumé ; même graine = même route (essais, pré-bâti, REJOUER).
- **La boussole de cap** (calage sur des multiples de 90° pilotés) : hors de ce lot.

**(3) Lot A2, dans l'ordre**
1. **L'ÉTAGE QUI CHANGE** (fusion de pilote-1, ville-3 et tirage-3). Uniquement côté décor.
   - **Où :** à `jade-balade.js:129`, la cible du 1er rang dépend d'une phase lue sur l'abscisse de la route : TOITS ou CANYON, alternés toutes les 6-9 s de croisière (longueurs × vD). La proportion vient du tempérament U.
   - **Phase TOITS :** t = yN−8−VS_H·32, hors de clr seulement. Dans clr, `tourLibre` ramène déjà à −60 : c'est cohérent.
   - **Phase CANYON :** l'actuel (yN+30+VS_H·120).
   - **Interdits :** aucun tirage `vr` ajouté ni retiré. Ni AIRZ ni emprise de scène (`vsBloque`).
   - **Volumes :** les mêmes.
   - **Preuves :** empreintes de route identiques au bit près ; `renderer.info` en `?tel=1` ≤ avant ; histogramme route−toit médian ; changements d'étage par minute.
   - **Préalable :** la correction des +5 m.
2. **LA CORDE ET LA FENÊTRE** (pilote-2 et 4).
   - **Ancres :** `liaison` et `souffle` déposent une ancre `corde`/`fenetre` dans FILETMARK. Il faut le faire sans consommer de `rf`, pour que la route reste identique.
   - **Corde :** virages ≥ 35° et ≤ 3 rP, un sur deux, au plus un toutes les 4 s, côté intérieur seulement. Une tour du 1er rang réservée dans `vsReserve`, posée dans `vsBatir`. Distance boîte↔axe ≥ ROAD_HALF+max(14, 0,08·vD), vérifiée par `vsLibre` et non par un cercle. Haut ≥ route+40, AIRZ et lèvres exclus, dévers automatique.
   - **Fenêtre :** après ≥ 4 s de phase CANYON, une emprise vide sur les rangs 1-2, du côté où le virage s'ouvre, pendant 1,5-2 s.
   - **Preuves :** frôlements par minute (boîte à moins de 25 m pendant ≥ 0,3 s) ; vue libre de moins de 400 m à plus de 1 500 m en moins de 0,5 s ; zéro mort de plus au simulateur de vol mains libres (tous les 0,5 s).
3. **LES MURS D'AVENUE** (ville-1).
   - **Règle :** si |cap mod 90°| < 8° sur ≥ 1,2 s, le 1er rang prend lat = ROAD_HALF+29+hd fixe et al = 0, en continuant de consommer les `vr`. On obtient un front et une corniche lisibles.
   - **Garde :** `vsBloque` à l'entrée des scènes.
   - **Preuves :** > 60 % du 1er rang à exactement 24 m dans les droites calées ; écart-type des toits le long d'une avenue < 15 m ; route au bit près.

**(4) À écarter**
- **Les tours-bornes** (ville-2) : mortelles en vol tout droit, et présentées comme « voulues ». C'est contraire à la règle « un saut ou un vol est possible partout ».
- **Les nappes animées** : un coût à chaque image sur iPhone.
- **La boussole de la trame** : elle touche `calage` partout, avec le risque des 10 s et de `vsTenue`.
- **Le changement d'avenue** : un changement de route qui ne vaut qu'après les murs d'avenue. Plus tard.
- **La chute dans la rue** (pilote-6) : à fondre dans les corrections du piqué du lot A, pas un module de plus.
- **Le surplomb** : il faut d'abord mesurer l'apogée des sauts contre VS_HC = 40.
- **La corniche** : plus tard.
- **Le Mac et l'iPhone :** rien n'est vérifiable au téléphone cette nuit. Les preuves se font en Node seulement, et Sacha doit confirmer le périmètre ville seule (Crypto City et vitrée intactes).

Fichiers vérifiés :
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/jade-balade.js (l.60-66, 129, 188)
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/ville-scenes.js
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/ville-entree.js (l.359, 373-403, 453-464, 508)
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/ville-v3.js (l.431)
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/gameplay/route-uniques.js

## Proposition « le pilote »

PROPOSITION « AU VOLANT » — être DANS la ville et pas à côté (lu : VILLE-CYBERPUNK.md, ville-scenes.js, ville-entree.js, buildVoxCityG, route-uniques). Rien n'a été édité ni lancé.

**Ce qui fait qu'on se sent à côté (mesuré dans le code)**
- La route fait 56 m de large (ROAD_HALF=28). `tourLibre` mesure la marge depuis le CENTRE de la tour, avec la demi-diagonale +5 m. Pour une tour de 40 m, la façade est donc à 37-53 m du bord, et à 40-90 m de la caisse selon sa place sur la dalle.
- Au palier 0 (70 m/s), un mur à 60 m défile à environ 1,2 rad/s : c'est du décor. Un mur à 15-20 m défile à 3,5-4,7 rad/s : c'est un frôlement. `dbgVilleAudit().frole` vaut 0 partout.
- Au centre du pare-brise, il n'y a jamais d'immeuble : la route contourne tout.
- Le 1er rang est toujours remonté à yN+30 (même canyon partout).
- Les scènes ne couvrent qu'environ 4-5 moments par route. Le reste, c'est la trame à 24 m.
- **Clé de sécurité :** en vol, la caisse part sur la TANGENTE, vers l'extérieur du virage. L'intérieur d'un virage est donc le côté sûr pour frôler. L'extérieur est le côté mortel. Il faut s'en tenir loin, ou à plus de 2 s.
- **Écran :** en paysage (844×390), le grand angle horizontal sert les flancs (frôlement, mur en face). En portrait (390×844), seul l'axe vertical se lit (toits, plafond, piqué). Chaque module doit donner un signe sur les deux axes.

**Critique du lot A**
- **Slalom des tours :** c'est déjà le « slalom des géantes » (4-5 arcs à 2,2 rP, 12 s). Sans tour dans l'axe, on gagne peu.
- **Piqué à 30-40° « d'un coup » :** une crête vive décolle la caisse (v²/Rc > g). Au palier 20 (340 m/s), c'est forcément un saut. Il faut donc le traiter comme `vSaute` : une piste de réception dans l'axe, sur environ 1,75 vD·t.
- **Nappes de circulation mobiles :** c'est du coût à chaque image. À éviter.
- **Montagnes russes des toits :** une dalle de 56 m ne descend pas dans des rues de la trame (76×58 m). Le creux devient une place vide. Pire, en sortant d'une crête, le toit suivant est mortel.
- **Tranchée à 14 m :** en ligne droite, on sort du S après √(2·42·R). À p0 et 2,3 rP, ça fait 108 m, soit 1,5 s, puis le mur. Il faut le prouver au simulateur de vol, sinon élargir le S (R ≥ 4 rP).

**Les 7 mécanismes**

1. **L'ÉTAGE QUI CHANGE** (sur toute la route)
   - *Ce qu'on voit :* toutes les 6-9 s de croisière, on alterne. Phase TOITS : les toits du 1er rang filent 8-40 m sous le bord de la dalle (en portrait, le bas de l'écran). Phase CANYON : les murs à +30-290 m (l'actuel).
   - *Géométrie :* la route ne change pas. Hauteurs déterministes par `VS_H`, sans tirage `vr`, comme la ligne 129. Toit ≥ yN−8 seulement si la boîte est à ≥ 24 m du bord (précédent : la scène `toit`).
   - *Volumes :* les mêmes, seules les hauteurs changent.
   - *Risques :* une exception à la règle d'or, mais toujours sans aucun contact. Les cônes AIRZ rabattent après.
   - *Preuve :* les empreintes de route restent identiques au bit près (ville, crypto, vitrée). Compter les volumes avant/après dans `renderer.info`. Changements d'étage par minute au banc.

2. **LE FRÔLEMENT À LA CORDE**
   - *Ce qu'on voit :* une arête de tour passe à 14-20 m du bord intérieur au sommet du virage, pendant 0,4-0,7 s. La dalle est couchée vers elle (dévers auto ≤ 24°).
   - *Géométrie :* virages ≥ 35° et ≤ 3 rP, un sur deux, pas plus d'un toutes les 4 s. Distance exacte boîte↔axe (pas un cercle) ≥ ROAD_HALF + max(14, 0,08·vD), soit 20 m à p0 et 41 m à p20 (vitesse angulaire tenue). Haut ≥ route+40.
   - *Volumes :* une tour du 1er rang, posée dans `vsReserve`.
   - *Risques :* aucun en vol (côté intérieur). Caméra : elle est derrière, donc à l'extérieur de l'arc.
   - *Preuve :* frôlements par minute, et zéro mort de plus au simulateur de vol mains libres.

3. **LE MUR EN FACE** (ligne de mire bouchée)
   - *Ce qu'on voit :* à l'entrée d'un virage ≥ 55°, deux tours collées sur la trame (80-120 m de large, haut ≥ route+120) ferment le centre du pare-brise. On tourne et le mur glisse au bord de l'écran.
   - *Géométrie :* sur le prolongement de la tangente, à D = 2,1-2,6 s de croisière. Vérifier √(R²+D²)−R ≥ ROAD_HALF+14+hd. À p0 (R 134 m) : D ≥ 150 m.
   - *Risques :* en vol droit, on sort de toute façon de la dalle à 1,2 s (87 m), donc le mur ne tue pas plus. À prouver. Bonus : les tangentes des `calage` tombent sur les axes de la trame.
   - *Preuve :* part du temps où un volume est à ±8° de l'axe à moins de 2,5 s.

4. **LA FENÊTRE** (révélation)
   - *Ce qu'on voit :* après 4-6 s fermées (CANYON, mur, plafond), le 1er rang manque d'un côté pendant 1,5-2 s, dans un virage qui tourne vers ce côté. La vue s'ouvre sur le vide et la ligne d'horizon de la ville.
   - *Volumes :* une emprise réservée, donc moins de volumes.
   - *Risques :* nuls (zone vide).
   - *Preuve :* la vue libre passe de moins de 400 m à plus de 1 500 m en moins de 0,5 s.

5. **LE SURPLOMB** (passer dessous)
   - *Ce qu'on voit :* un bloc de la famille `corps`, en porte-à-faux depuis une tour du 1er rang, couvre la moitié de la route à route+40 (≥ VS_HC). On passe dessous 0,4-0,8 s, toutes les 8-12 s. Très fort en portrait.
   - *Volumes :* +1 instance chaque fois, `villeAbri` déjà prête.
   - *Risques :* pas plus bas que l'apogée d'un saut, à mesurer. Ne doit pas « flotter » : il prolonge une tour posée.
   - *Preuve :* part du temps avec un plafond à moins de 45 m, et le simulateur de saut sous le bloc.

6. **LA CHUTE DANS LA RUE** (le piqué refait)
   - *Ce qu'on voit :* depuis la phase TOITS, la crête lance la caisse (1 s en l'air). La route reprend en dessous, dans l'axe de la trame, à 30-35° sur 2-3 s. On descend de 120-180 m entre deux murs dont le haut dépasse la crête de 40 m (les murs qui montent devant le pare-brise). Ressource à R ≥ v²/g, puis la rue de `sPlongee`.
   - *Volumes :* deux rangs réservés.
   - *Risques :* touche `genCtrl1` (R1/R2, malus, raccourcis, paliers). Dépassement à la nitro : piste de réception de 1,75 vD·t.
   - *Preuve :* les empreintes crypto et vitrée restent identiques, et le banc de vol à trois vitesses.

7. **LE SAC DES GESTES** (lot U, appliqué à 1-5)
   - Le sac de `route-uniques.js` tire, par route, un tempérament urbain (dense, aérien, profond, alterné) qui pèse l'étage, les frôlements, les fenêtres et les plafonds. Deux routes de suite ne se ressemblent pas, même sur un tracé voisin.

**Outil préalable (2-3 h) : le banc du RESSENTI**
- En Node, sur les vrais générateurs avec les volumes extraits (la recette existe).
- Mesures par route : ligne de mire, frôlements par minute, plafond, changements d'étage, révélations, et morts au simulateur de vol mains libres tous les 0,5 s.
- Sans lui, aucun module n'est prouvé.

**Les 3 à faire cette nuit**
1. **L'ÉTAGE QUI CHANGE :** le plus de couverture, route intacte.
2. **LE FRÔLEMENT À LA CORDE :** sûr en vol par construction.
3. **LE MUR EN FACE + LA FENÊTRE :** fermer puis ouvrir, la respiration de la visite.

Ces trois-là ne touchent que le décor (`vsReserve` et la hauteur du 1er rang), avec un interrupteur `?sans=` qui rend l'avant au bit près.

**Ce qui n'est pas faisable cette nuit**
- **La chute dans la rue :** il lui faut une nuit seule, avec la preuve de vol.
- **Le surplomb :** il faut d'abord mesurer l'apogée des sauts.
- **Le vrai iPhone :** aucune vérification possible cette nuit.
- **La décision Crypto City / vitrée :** à confirmer par Sacha.

Fichiers lus :
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/jade-balade.js (règle d'or l. 60, 1er rang l. 129 et 188)
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/ville-scenes.js (`vsReserve` l. 272)
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/ville-entree.js (`vSaute` l. 373)

## Proposition « la ville »

PROPOSITION « LA VILLE D'ABORD » (lecture seule, rien édité)

Repères chiffrés (p0) : vD = 70 m/s de croisière (126 m/s ressentis avec l'élan ×1,8), rP = 40 + 0,3·vD = 61 m, 2 rP = 122 m. Trame : VS_PER = 76,34 m (x) / 57,80 m (z), VOX_CITY = 6,4 m.

CRITIQUE DU LOT A
- Ses quatre modules restent des SCÈNES : la route est tirée, une emprise est réservée (vsReserve), les volumes sont posés ensuite. Entre deux scènes, c'est-à-dire pendant les liaisons, les souffles et les raccourcis, la ville reste le ruban générique de buildVoxCityG : trois rangs à 24/84/176 m, `lat` et `al` dispersés au hasard. Or c'est précisément ce qui fait dire à Sacha « des immeubles générés autour ». Il faut mesurer la part du temps passée hors scène avant de croire que le lot A y répond.
- Les montagnes russes des toits sont dangereuses en vol. Une crête lance la caisse dès que son rayon vertical est inférieur à v²/g, soit 1,6 km à p0 et environ 12 km à p20. Les crêtes lancent donc presque toujours, et un toit posé 8 m sous la dalle est mortel au retour. Il faut une zone d'air (AIRZ) derrière chaque crête, avec les toits rabattus 60 m sous la parabole.
- Pour le slalom, la tour « dans la ligne de mire » est exactement l'endroit où atterrit un joueur qui vole tout droit. La borne doit se trouver au-delà de la portée d'un petit saut, ou sur un virage qui n'est jamais la lèvre d'un raccourci.

LES MODULES

1. LES MURS D'AVENUE (côté décor, buildVoxCityG)
- Ce que voit le joueur : un front de façades continu, une ligne de corniche, une rue qui se lit.
- Règle : là où le cap tient la trame (|cap mod 90°| < 8° sur au moins 1,2 s), le 1er rang prend lat = ROAD_HALF + 24 + hd fixe et al = 0. La largeur w est calée pour que les façades se touchent au pas pasC (54 m) : w = snap(54/|t·axe|). Le toit vaut yToit(quartier) + VS_H × 30 m.
- Les tirages `vr` restent consommés et seule leur valeur est ignorée : aucun décalage pour le reste de la ville, et le pré-bâti par tranches est intact.
- Volumes : les mêmes corps du 1er rang, pas un de plus (BUD inchangé).
- Risques : tourLibre rogne dans les courbes, d'où le seuil de cap ; un mur au droit d'une entrée de scène est bloqué par vsBloque.
- Preuve : empreinte de ROUTE identique (la route ne change pas) ; part du 1er rang posée à exactement 24 m (cible > 60 % des droites calées) ; renderer.info en ?tel=1 ≤ avant ; ?sans=villeavenue rend l'avant au bit près.

2. LES TOURS-BORNES (perspective fermée, côté décor)
- Ce que voit le joueur : on fonce sur une tour, et la route plie au dernier moment.
- Géométrie : pour chaque virage d'au moins 50°, lu sur T, on DÉPLACE la tour du 1er rang la plus proche (on n'en ajoute pas) vers le prolongement de la tangente d'entrée. Pour un virage de 90° à 2,2 rP (134 m), elle se place à R + ROAD_HALF + 24 + hd, soit environ 190 m, 1,5 s de croisière. Hauteur ×1,4, toujours bornée par la règle d'or.
- Exclusions : lèvres de saut (AIRZ), virages de raccourci, palier ≥ 10 si la distance est inférieure à 1 s de vol.
- Risque : mortel en vol tout droit, ce qui est voulu mais doit être signalé à Sacha.
- Preuve : nombre de bornes par route (cible 4-8), zéro dans une zone AIRZ, route identique.

3. LES ÉTAGES (rue / mi-hauteur / toits, côté décor)
- Ce que voit le joueur : la hauteur des tours suit la ville et non plus la route (aujourd'hui t = yN − 50 + …). Chaque quartier, case de 5×76,34 × 7×57,80 m ≈ 382 × 405 m tirée par VS_H(case), porte un yRue et un yToit absolus.
- Effet : quand la route descend, on plonge dans le canyon ; quand elle remonte, on émerge au-dessus d'une ligne de toits plate. Les montagnes russes naissent ainsi sans nouvelle scène.
- Volumes : aucun de plus.
- Risque : un quartier « bas » sous une route qui remonte vide le décor. Plancher : le 1er rang reste à au moins yN + 30 (la règle existante).
- Preuve : écart-type du toit le long d'une avenue inférieur à 15 m (contre environ 90 m aujourd'hui, à mesurer).

4. LE CHANGEMENT D'AVENUE (côté route, vsModules)
- Ce que voit le joueur : la liaison saute d'une avenue à la parallèle voisine.
- Géométrie : deux arcs opposés de 42° à 2,4 rP (146 m) décalent la route de 2R(1 − cos 42°) = 75,6 m, une période VS_PER.x, sur 214 m, soit 3,1 s de croisière (1,7 s ressentie). Sur l'axe z, 34° donnent 57,8 m. Pente de 0 à −8 %. Il est suivi d'au plus 2,5 s de croisière tout droit, ce qui reste sous t8 ≤ 4,3 s ressenties (R1/R2 tenues).
- À p10/p20 : R × kL et angle / √kL, comme `liaison` ; le décalage passe alors à deux périodes.
- Volumes : aucun ; ce sont les murs d'avenue (n° 1) qui le rendent lisible.
- Risque : changement d'empreinte, ville seulement (MC === 'ville', crypto et vitrée intactes).
- Preuve : vsTenue, rmin ≥ 2 rP, 2 raccourcis à p0 au juge.

5. LE PIQUÉ DE QUARTIER (version ville d'abord du piqué du lot A)
- Le piqué n'est plus tiré au hasard : il se déclenche au passage d'un quartier TOITS à un quartier AVENUE (yToit − yRue > 150 m).
- Géométrie : −30° pendant 1,2 s ressentie, puis une ressource verticale d'au moins 3 rP. Dévers nul (`nul`). Sortie calée sur l'avenue.
- Volumes : ceux du lot A.
- Preuve : la chute ne coupe aucun volume (vsLibre), saut possible avant la ressource.

6. LES NAPPES DE CIRCULATION (le petit élément cyberpunk)
- Ce que voit le joueur : dans les avenues, deux ou trois files de lucioles à yRue + 40 et yRue + 90, en lumA (instances de la matière néon déjà présente, comme la scène 'rue').
- Coût : 0 appel de dessin, environ 150 instances par route. Immobiles cette nuit.
- Preuve : renderer.info, nombre d'instances néon (ALLEGE : moitié).

7. LE PLAN DE VILLE PAR GRAINE (l'unicité)
- ruPlan('ville', graine) tire un ordre de quartiers (avenue, toits, bas-fond, place, forêt), un tempérament de cap (serpent sur un axe de trame, crochet, zigzag d'avenues) et une ouverture, avec le sac à mémoire de route-uniques.js. Les modules du lot A et les scènes vont dans le même sac.
- Preuve : sur 200 routes, nombre de suites distinctes (cible 200) et écart de forme sur 3 km (ruFormeProche).

LES 3 À FAIRE CETTE NUIT
1. Murs d'avenue + tours-bornes (1 et 2). Uniquement côté décor : route au bit près, aucun conflit avec le lot A, et c'est le gain le plus direct sur la plainte de Sacha. Environ 80 lignes dans buildVoxCityG.
2. Les étages (3). Toujours côté décor, une seule fonction de hauteur, sans tirage ajouté.
3. Le changement d'avenue (4), comme variante de `liaison` : de toutes les propositions, c'est le seul changement de route, et il est petit et mesurable au juge.

Infaisable honnêtement en une nuit :
- Le vrai graphe de quartiers qui guide genCtrl1 (route aimantée vers les avenues, nouveaux critères du meilleur-de-N).
- Les nappes animées.
- Le plan RU complet (7). Le sac est réutilisable tel quel, mais le refaire à la vitesse demande les bancs Node, que le Mac saturé ne permet pas de faire tourner proprement cette nuit.

Fichiers lus : /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/jade-balade.js (lignes 46-212), code/maps/ville-scenes.js, code/maps/ville-entree.js (lignes 355-464), code/gameplay/route-uniques.js, code/maps/jade-uniques.js, passation/VILLE-CYBERPUNK.md, passation/ROUTES-UNIQUES.md, passation/MAPS-PRO-VILLE.md.

## Proposition « le tirage »

# LA VILLE UNIQUE : proposition (angle unicité)

## Critique du plan et du lot A
- Le squelette n'est pas dans la phrase, il est dans les **modulos de graine**. Le climax vient de `[…][graine%4]` (CLIMAX). La traversée d'entrée sort sur `graine%2`, la vrille sur `graine%4===1`, le plongeon sur `graine%3`. Les deux premières scènes avancent d'un cran par graine (`w9`, mcTire). Le début d'une route n'a donc que 24 combinaisons environ : deux graines voisines diffèrent, mais 12 graines plus loin le début revient à l'identique. C'est exactement le « squelette » mesuré à Jade avant le sac.
- **Le lot A ajoute 4 grandes scènes (5 à 10 s)**, alors qu'une route n'en tient que 4 ou 5. Leçon de Jade : c'est la tresse des **petits modules** (1,5 à 3,5 s) qui a donné « 200/200 », pas le nombre de grandes scènes. Deux scènes du lot A font doublon : la tranchée ressemble à l'avenue de la plongée (12 m au-dessus de la rue), et les montagnes russes à la crête jouée plusieurs fois. Je propose de leur donner un **verbe** commun (comme `JAV_VERBE`) : jamais deux scènes du même verbe de suite.
- Le **calage sur la trame** ramène le cap à un multiple de 90°. Vus du dessus, les tracés se ressemblent (un Manhattan). Il faut donc que le cap soit tiré, pas seulement le calage subi.
- La ville joue le **meilleur de N essais**. Sans plan figé par graine (`ruPlan`), les essais rendent la route la plus « typique ».

## Les 7 mécanismes

**1. Le plan de la ville** (`maps/ville-uniques.js`, `?sans=villeuniques`)
- Mécanisme : `ruPlan('ville', graine)`. Il remplace tous les modulos : ordre du sac (`ruOrdre`), ouverture, tempéraments, climax choisi parmi les modules de rôle F (plongée, phare, géante, rond-point, nœud, piqué du lot A), placé dans les 3 premières grandes scènes.
- Les deux raccourcis (`vPetit`, `vSaut`, R6) restent imposés, mais leur rang est tiré.
- Périmètre : `MC==='ville'` seulement, pour que crypto et vitrée gardent leur empreinte.
- Risque : R6 au palier 0 (`vsMalusRac`), et une graine `null` (repli sur `rf`).
- Preuves :
  - empreinte avec `sans=villeuniques` = `d63b36e2af8b` / `fb378a8c6756` au bit près ;
  - crypto, nuages et espace inchangés, interrupteur allumé ;
  - même graine régénérée = même route (essais, pré-bâti, REJOUER).

**2. Les six ouvertures** (`ruChoix 'ouv'`)
- Le plongeon (ses 3 formes) et la vrille (une sur six, jamais au palier 10 ou plus).
- La traversée haute.
- **Les toits d'abord** : on reste au ras des toits ; la crête vient à 1,5 s, la plongée attend le 2e module.
- **Le piqué direct** : au bout de la droite (≤ 2,6 s), 1,2 s à −35°, ressource sur 1,5 s jusqu'à 0 %, virage à 2,4 rP.
- **La corniche** : 110 à 140° à 2,8 rP au bord de la ville, dévers 20°, la ville en contrebas, puis on y entre.
- Risque : le piqué direct finit en crête à décoller, à arrondir à la vitesse comme à Jade.
- Preuve : écart-type de la pente à 300 m ≥ 10° (avant : une constante) ; altitude à 1 km.

**3. La ligne des toits** (tempérament d'étage, coût nul)
- Ce que voit le joueur :
  - **Haute** : les toits 10 à 40 m sous la route, le vertige de Coruscant ;
  - **Rasante** : les toits à ±8 m ;
  - **Canyon** : les toits 60 à 200 m au-dessus ;
  - **Par étages** : la consigne change à chaque grande scène, par marches de 1,5 s.
- Géométrie : un coefficient tiré par tronçon de 2 km, posé dans `CITY`. Il multiplie seulement la hauteur des tours ordinaires calée sur la route (`yN`, l. 222 de jade-balade : **à vérifier dans les 3 rangs `ROWS`**).
- Coût : aucun tirage `vr` en plus, mêmes familles, mêmes appels de dessin.
- Risque : un toit sous un saut. Tout volume est déjà mortel en vol ; garder `routeAuDessus` et `tourLibre` (24 m).
- Preuve : histogramme « route moins toit médian » par route ; `renderer.info` en `?tel=1` égal à avant (triangles ±5 %).

**4. La boussole de la trame** (tempérament de cap)
- Le calage choisit sa cible parmi les multiples de 90° selon le tempérament, au lieu du plus proche :
  - **dérive** (le grand tour d'un quartier : quarts du même côté, coupés de contre-virages de 30 à 40° pour R1) ;
  - **serpent** (un axe tenu à ±90°) ;
  - **zigzag** (x, z, x…) ;
  - **crochet** (un serpent qui tourne de 180° au milieu).
- Risque : la règle des 10 s et `vsTenue`/`vsMalusBoucle` en dérive.
- Preuve : direction de fin vue du départ, médiane et écart-type ; tenue `t30 ≤ 8,5 s`.

**5. Les petits modules de la ville** (6, de 1,2 à 3 s, tressés comme à Jade : jamais 3 grands ni 3 petits de suite)
- **La ruelle** : calage, 1,2 s presque plat entre deux tours à 14 m du bord de dalle, calées sur `VS_PER`.
- **Le coin de rue** : 90° à 2,2 rP, dévers 24°, une tour d'angle à 14 m dans l'intérieur du virage.
- **L'enjambée** : +8 % sur 0,6 s, 0,5 s à 8 m au-dessus d'un toit, −18 % sur 0,7 s.
- **La chicane des façades** : 2 × 35° à 2,2 rP, une tour dans chaque intérieur.
- **La marche** : 1 s de palier, puis 0,7 s à −28°.
- **Le surplomb** : un bloc haut d'une tour en porte-à-faux au-dessus de la route, 40 m libres (`VS_HC`), côtés ouverts.
- Volumes : des ancres `vsReserve`/`vsBatir`, familles existantes. Le surplomb seul ajoute une instance.
- Risque : rayon tenu après Catmull-Rom (0,88 : dessiner à 2,3 rP), recoupe (`vsCroise`), emprise refusée (`non('route')`), à compter.
- Preuve : chaque module forcé un par un (`?villesceneu=`) sur 50 graines × 3 paliers : 0 refus d'emprise, rayon ≥ 2 rP, dévers ≤ 34°.

**6. Le temps fort libre**
- Le climax n'a plus de rang : ni toujours en fin de phrase ni toujours le même par quart de graine.
- Au palier 20, 6 fois sur 10 il prend la place d'un raccourci (règle existante), en gardant les longueurs `VS.longueur` × LV.

**7. La mesure** (`unicite.cjs carte=ville`, 200 routes de suite × paliers 0/10/20, en Node)
- Suites de modules distinctes : 200/200.
- Premier module le plus fréquent ≤ 10 %.
- Paires de tracés à moins de 50 m / 100 m sur 3 km (mesure de l'adverse, miroir compris) : 0 / ≤ 5 au palier 0.
- Formes de dessus ≥ 40, écart-type de l'altitude relative au toit.
- Plus la charte : `ville-torsades`, R1/R2, rayon, R6, croisements.

## Les 3 à faire cette nuit
1. **Le plan de la ville** (1), avec les ouvertures existantes seulement (2 sans le piqué direct ni la corniche), et la mesure (7). C'est le cœur de la demande, prouvable en Node.
2. **La ligne des toits** (3) : le plus gros effet sur « je visite une ville » pour un coût nul, si `yN` se confirme dans les trois rangs.
3. **Trois petits modules** (5) : la ruelle, le coin de rue, l'enjambée. Les autres plus tard.

## Infaisable en une nuit, honnêtement
- La boussole (4) touche `calage` partout ; avec la règle des 10 s, c'est un risque.
- La corniche et le surplomb.
- Le jeu dans Chrome : le Mac est saturé, donc Node seulement, rien vu sur iPhone.
- La fusion avec le lot A : mêmes fichiers (`ville-scenes.js`, `ville-entree.js`). Il faut faire U dans un nouveau morceau à crochets, après la fusion de A, et inscrire ses 4 scènes au sac avec leurs rôles.

Fichiers lus :
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/ville-entree.js (l. 359, 453-464, 500-592)
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/ville-scenes.js
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/jade-balade.js (l. 56-60, 188, 222)
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/gameplay/route-uniques.js
- /Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/jade-uniques.js

