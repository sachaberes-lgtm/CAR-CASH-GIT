#!/bin/sh
# BANC DE CHALEUR v3 (2026-11-17, banc fiable) — une série : sh serie-v3.sh <liste> [durée s]
# <liste> = un fichier, une ligne par essai : « nom|interrupteurs » (les interrupteurs COMMUNS sont ajoutés ici). Résultats : resultats.txt (section SERIE V3) et essais.jsonl.
# Tout essai de course : même carte et même météo à chaque portail (carte=nuages&meteo=midi, tenues par dbgBancCarte), moteur 15 dès le départ (chalpal=1), film d'intro sauté.
ICI=$(cd "$(dirname "$0")" && pwd); R=~/cash-car/ios-ultime-mesures/chaleur; LISTE=$1; DUR=${2:-300}
caffeinate -dimsu -w $$ &  # (17/11) le Mac s'est endormi de 06 h 48 à 09 h en pleine série : plus de journal, et le téléphone a roulé 2 h sur sa batterie
C="&intro=ancien&attente=0&chute=0&carte=nuages&meteo=midi"
echo "SERIE V3 DEBUT $(date '+%Y-%m-%d %H:%M:%S') liste=$(basename $LISTE) durée=$DUR repos_min=${REPOS_MIN:-240} tbat_max=${TBAT_MAX:-auto}" >> $R/resultats.txt
while IFS='|' read -r NOM QS; do
  [ -z "$NOM" ] && continue; case "$NOM" in \#*) continue;; esac
  [ -f $R/STOP ] && { echo "SERIE V3 ARRETEE (fichier STOP) $(date '+%H:%M:%S')" >> $R/resultats.txt; break; }
  sh $ICI/essai2.sh "$NOM" "$QS$C" $DUR >> $R/resultats.txt 2>&1 < /dev/null
done < $LISTE
xcrun devicectl device process launch --device FE6F8B40-DCFF-5E04-B578-871A79EDCF17 --terminate-existing -e '{"CC_QS":"&chaleur=vide"}' com.sachaberes.carcash >/dev/null 2>&1
echo "SERIE V3 FINIE $(date '+%Y-%m-%d %H:%M:%S')" >> $R/resultats.txt
