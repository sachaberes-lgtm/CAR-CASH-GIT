# Banc gabarits - rapport interrompu (disque plein, ENOSPC)

Aucune course de la matrice n'a ete jouee. Arret demande par le coordinateur.

## Mesure unique (mise au point, 390x844 @3, palier 2, map nuages, 20 s reelles)
- Course 1 : s = 1641 m, vmax 227 km/h, 45 i/s.
- Course 2 (apres REJOUER) : s = 3848 m, vmax 226 km/h, 50 i/s.
- 0 NaN, caisse non figee, pas de mort, 0 exception, 0 requete en echec.
- Console : seulement "Blocked call to navigator.vibrate" et le "READ-usage" deja connu.

## Methode
- Banc : preuves/banc-gabarits/gab.cjs, lot.sh (verrou + charge < 40), chaine.sh (4 configs).
- Pilote dbgAuto(1,0,{vol:true}), graine Math.random fixe par map, muet, mode --reel 1.
- dbgStep(30,33) inutilisable (s=3 apres 15 it.). ?tel=1 n'abaisse pas le palier : forcer ?palier=0|1|2.

## Non teste
Matrice gabarit x map x resultat, 12 maps, paliers 0 et 1, paysage 844x390, portail, REJOUER hors nuages.

## Reprise
Liberer le disque, puis depuis preuves/banc-gabarits/ : nohup ./chaine.sh &  (~20 min par config).
Verifier avant : pgrep -fl "chaine|lot.sh|gab.cjs" ; Chrome du banc sur port 9741, serveur 8841.
