#!/bin/sh
# BANC DE CHALEUR (2026-11-13, ios-fond) — un essai : sh essai.sh <nom> "<interrupteurs>" [durée s]
# Il faut : l'app de dev (build ≥ 107) sur l'iPhone branché et déverrouillé, et le journal qui tourne :
#   pymobiledevice3 syslog live --udid … | grep --line-buffered -E "thermal budget|New state|Budget Trace|thermalLevel,|CLTM|setDetailedThermalPowerBudget" >> ~/cash-car/ios-ultime-mesures/chaleur/journal.txt
# 1) REPOS : page noire (chaleur=vide) jusqu'à ce que le budget thermique d'iOS (audiomxd, en watts, 2,5 = aucune pression) soit ≥ 2,49 pendant 20 s (10 min au plus) ;
# 2) ESSAI : l'app relancée avec les interrupteurs, pendant la durée ; 3) le résumé : budget toutes les 15 s, niveau thermique, secondes avant 2,0 / 1,5 / 1,0 W.
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17; B=com.sachaberes.carcash; R=~/cash-car/ios-ultime-mesures/chaleur; J=$R/journal.txt
NOM=$1; QS=$2; DUR=${3:-120}
budget(){ tail -60 $J | grep -o "budget of [0-9.]* watts" | tail -1 | grep -o "[0-9.]*" | head -1; }
lance(){ xcrun devicectl device process launch --device $D --terminate-existing -e "{\"CC_QS\":\"$1\"}" $B >/dev/null 2>&1 || { echo "LANCEMENT IMPOSSIBLE (téléphone verrouillé ?)"; exit 1; }; }
lance "&chaleur=vide"; n=0; ok=0; t0=$(date +%s)
while [ $n -lt 120 ]; do sleep 5; n=$((n+1)); b=$(budget); if [ "$(echo "${b:-0} >= 2.49" | bc)" = 1 ]; then ok=$((ok+1)); else ok=0; fi; [ $ok -ge 4 ] && break; done
echo "$NOM | repos $(( $(date +%s)-t0 )) s, budget $(budget) W"
H0=$(date '+%H:%M:%S'); echo "$(date '+%Y-%m-%d %H:%M:%S') DEBUT $NOM $QS" >> $R/marques.txt
lance "$QS"; sleep $DUR
H1=$(date '+%H:%M:%S'); echo "$(date '+%Y-%m-%d %H:%M:%S') FIN $NOM" >> $R/marques.txt
python3 - "$J" "$H0" "$H1" "$NOM" <<'PY'
import sys,re
J,h0,h1,nom=sys.argv[1:5]
def s(h):a=h.split(':');return int(a[0])*3600+int(a[1])*60+float(a[2])
t0=s(h0);B=[];lv=[];st=[]
for l in open(J,errors='replace'):
    h=l[11:19]
    if len(h)<8 or h<h0 or h>h1:continue
    t=s(l[11:26])-t0
    m=re.search(r'budget of ([\d.]+) watts',l)
    if m:B.append((t,float(m.group(1))))
    m=re.search(r'thermalLevel,(\d+)',l)
    if m:lv.append((t,int(m.group(1))))
    m=re.search(r'New state : (\d)',l)
    if m:st.append((t,int(m.group(1))))
def a(seuil):
    for t,b in B:
        if b<seuil:return '%3d s'%t
    return '  —  '
pas=' '.join('%.2f'%min(B,key=lambda x:abs(x[0]-k))[1] for k in range(0,int(B[-1][0])+1,15)) if B else 'aucun budget lu'
print('%-22s budget/15 s : %s | <2,0 W à %s · <1,5 W à %s · <1,0 W à %s | niveau max %s · fin %.2f W'%(nom,pas,a(2.0),a(1.5),a(1.0),max([x[1] for x in lv] or [0]),B[-1][1] if B else -1))
PY
