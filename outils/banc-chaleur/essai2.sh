#!/bin/sh
# BANC DE CHALEUR v3 (2026-11-17, banc fiable) — un essai : sh essai2.sh <nom> "<interrupteurs>" [durée s, 300]
# Il faut : le build de mesure ≥ 1192 (battement CCBANC), le journal système qui tourne (grep avec CCBANC) et le lecteur de puissance batterie.py :
#   cd ~/cash-car/ios-ultime-mesures/chaleur
#   nohup sh -c '~/Library/Python/3.9/bin/pymobiledevice3 syslog live --udid 00008110-000621041468401E 2>>journal.err | grep --line-buffered -E "CCBANC|thermal budget|New state|Budget Trace|thermalLevel,|CLTM|setDetailedThermalPowerBudget" >> journal.txt' &
#   nohup /usr/bin/python3 <dépôt>/outils/banc-chaleur/batterie.py 2 >> batterie.txt 2>> batterie.err &
# 1) REPOS : page noire (chaleur=vide) au moins REPOS_MIN s (240) ET jusqu'à ce que la batterie soit revenue à ≤ TBAT_MAX centièmes de °C (TBAT_MAX, sinon la
#    température de batterie du repos de référence + 0,3 °C, posée par la 1re référence) tenue 60 s ET budget du noyau (clientId 10) ≥ 2950 mW (ou muet) — 25 min au plus.
# 2) ESSAI : l'app relancée avec les interrupteurs, pendant la durée. 3) LE RÉSUMÉ : resume.py (puissance, température, battement, validité).
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17; B=com.sachaberes.carcash; R=~/cash-car/ios-ultime-mesures/chaleur; J=$R/journal.txt; BT=$R/batterie.txt; ICI=$(cd "$(dirname "$0")" && pwd)
NOM=$1; QS=$2; DUR=${3:-300}; RMIN=${REPOS_MIN:-240}
lance(){ xcrun devicectl device process launch --device $D --terminate-existing -e "{\"CC_QS\":\"$1\"}" $B >/dev/null 2>&1 || { sleep 10; xcrun devicectl device process launch --device $D --terminate-existing -e "{\"CC_QS\":\"$1\"}" $B >/dev/null 2>&1; } || { echo "$NOM | LANCEMENT IMPOSSIBLE (téléphone verrouillé ?)"; exit 1; }; }
tbat(){ tail -3 $BT | grep -o "tbat=[0-9]*" | tail -1 | cut -d= -f2; }
noyau(){ tail -3000 $J | grep -o "clientId 10, details [0-9]*, Thermal Budget [0-9]*" | tail -1 | grep -o "[0-9]*$"; }
TMAX=${TBAT_MAX:-$(cat $R/tbat-repos.txt 2>/dev/null)}; TMAX=${TMAX:-9999}
lance "&chaleur=vide"; t0=$(date +%s); ok=0
while :; do sleep 10; el=$(( $(date +%s)-t0 )); tb=$(tbat); nk=$(noyau)
  if [ -n "$tb" ] && [ "$tb" -le "$TMAX" ] && [ "${nk:-3000}" -ge 2950 ]; then ok=$((ok+10)); else ok=0; fi
  [ $el -ge $RMIN ] && [ $ok -ge 60 ] && break; [ $el -ge 1500 ] && { echo "$NOM | repos PLAFONNÉ à 1500 s (tbat $tb > $TMAX)"; break; }
done
echo "$NOM | repos $(( $(date +%s)-t0 )) s, tbat $(tbat) (seuil $TMAX), noyau ${nk:-muet}"
O=$(wc -c < $J | tr -d ' '); OB=$(wc -c < $BT | tr -d ' ')
echo "$(date '+%Y-%m-%d %H:%M:%S') DEBUT $NOM $QS" >> $R/marques.txt; H0=$(date '+%Y-%m-%d %H:%M:%S')
lance "$QS"; sleep $DUR
H1=$(date '+%Y-%m-%d %H:%M:%S'); echo "$H1 FIN $NOM" >> $R/marques.txt
/usr/bin/python3 $ICI/resume.py "$J" $O "$BT" $OB "$H0" "$H1" "$NOM" "$QS"
