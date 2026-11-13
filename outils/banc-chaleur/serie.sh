#!/bin/sh
# BANC DE CHALEUR — la série du 13/11 : installe le build donné puis enchaîne les essais (≈ 12 min chacun, repos compris). Résultats : ~/cash-car/ios-ultime-mesures/chaleur/resultats.txt
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17; R=~/cash-car/ios-ultime-mesures/chaleur/resultats.txt; ICI=$(dirname "$0"); C="&chalpal=1&intro=ancien&attente=0&chute=0"
[ -n "$1" ] && xcrun devicectl device install app --device $D "$1" 2>&1 | grep -iE "error|installed" >> $R
un(){ sh $ICI/essai.sh "$1" "$2" 150 >> $R 2>&1; }
un accueil        "&chaleur=accueil&intro=ancien&attente=0"
un course-sans-3d "&chaleur=course&chalrendu=0$C"
un course-dpr-0.5 "&chaleur=course&chaldpr=0.5$C"
un pause          "&chaleur=pause$C"
un course-2       "&chaleur=course$C"
un course-20ips   "&chaleur=course&cadfps=20$C"
un course-son     "&chaleur=course&chalson=1$C"
xcrun devicectl device process launch --device $D --terminate-existing -e '{"CC_QS":"&chaleur=vide"}' com.sachaberes.carcash >/dev/null 2>&1
echo "SERIE FINIE $(date '+%H:%M:%S')" >> $R
