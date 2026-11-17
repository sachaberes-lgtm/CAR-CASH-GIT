# Branche `qa/gouvlent` — le gouverneur de lenteur (C) et la loupe au chaud (D), mis de côté (17/11)

Cette branche garde l'état complet du lot lenteur au 1er tour (`26b163063` : A + B + C + D).
Décision de la session parente au 2e tour : C et D SORTENT du lot `qa/lenteur`. Ils seront repris APRÈS la fusion du pilote de qualité (`qa/pilote`).
Ce qu'ils font, leurs bancs et leurs chiffres : `passation/qualite/lenteur.md` (version du 1er tour, sur cette branche).
A et B continuent sur `qa/lenteur` (A y est refait au 2e tour : ne pas reprendre l'horloge de cette branche).

## Corrections demandées par le contrôle adverse, à faire AVANT de reprendre C et D

1. **Cadence de C sur un écran à 30 Hz.** `if(GVL.on&&CAD_CRIT20)return 50;` dans `cadPer` passe avant la règle du pilote (`pilTic()<20` : garder 33 sur un écran à 30).
   Sur un écran à 30 (économie, `CAD.eM ≥ 24`), 50 ms donne 33/66 en alternance : ~16 % de ralenti (dt plafonné à 50 ms) pendant toute la tenue (≥ 9 s).
   → Passer par la règle crit20 du pilote, ou ne pas caler à 20 quand la médiane d'écran dépasse 24 ms.
2. **`mobReactif` appelé par C.** `gvlEntre` → `cadPose(true,…,'lent')` → `mobReactif()` : à fair, la retenue du gouverneur thermique est allumée ET sauvegardée
   (`MOB_S.actif=true; mobGouvSauve()`) au-delà de la rafale. → Une autre étiquette de calage, ou un calage sans cadPose.
3. **Le signe « boucles » sans filtre en production.** Hors build de mesure (`MG.on` faux), `fil=true` d'office : deux images ≥ 80 ms en 1 s suffisent, quelle qu'en soit la cause.
   Relu dans les vols (une entrée par tenue de 9 s, hors 2,6 s de départ) : vol 1448 17 entrées (10 avec filtre), vol 1137 31 (3), vol 1116-2058 13 (7).
   Dans le vol 1137, 16 des 31 entrées tombent dans des courses sans économie et sans fair/serious/critical. Chaque faux signe coûte 9 s à 20 i/s et la loupe 9 + 20 s en course.
   → Exiger la sentinelle ou une condition d'état (économie, ou thermique ≥ fair) ; mesurer les faux signes au REJOUER (scripts du contrôle : `rejoue.cjs`, `lance.sh`).
4. **Fusion avec `qa/pilote`, sur le fond** (`git merge-tree` : CONFLIT dans `cadence.js` et `loupe-caisse.js`) :
   - la loupe ne change que sous voile (`loupeChaud(){if(pilOn())return PILO.lpOff;…}`) : le retrait de la loupe EN COURSE par C contredit le pilote ;
     D et le volet loupe de C deviennent du code mort selon la fusion ;
   - le pilote pose `pilImg(now)` sur l'unique `CAD.der=now` : toute sortie « image calculée » doit l'appeler ;
   - une seule médiane d'écran : `CAD.eM` (pilote) et `CAD.em` (lenteur) sont la même.
   La règle « même autorité, le plus bas gagne » n'est pas tenue face au pilote : la reprendre dans le pilote.
5. **Les notes `lenteur`** vont dans la boîte noire (`__ccNote`), sans plafond dans CAPS : une session à rafales chasse les vraies lignes erreur, panne, gel (liste de 80),
   et chaque note fait un `JSON.parse` jusqu'à 20 Ko en course. → Plafond (par exemple 20) dans CAPS, et une colonne GVL dans la boîte de vol pour l'A-B
   (analyse-vol.py ne voit pas les secondes où le gouverneur était allumé).

Mineurs :
- `gvlMin` met `mobPalBase()` en cache une fois pour toutes (`GVL.b`), jamais relu.
- Avec `?cad30=0` (CAD.ok = 0), `cadPose(true)` met `CAD.on` sans que cadSaute tourne : le plafond à 60 saute (120 i/s possibles pendant une rafale). Débogage seulement.
- D : la loupe revient 20 s après le relâchement (`LOUPE.chaudT`) ; si ce relâchement a lieu au menu et que la course part avant, elle réapparaît en pleine course.
- Protocole A-B : ajouter les intervalles calculés > 50 ms par minute et le temps de jeu perdu ; les photos de D sont des recadrages 690×510, pas les toiles entières.
