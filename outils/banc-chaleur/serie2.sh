#!/bin/sh
# BANC DE CHALEUR — série 2 du 13/11 : qu'est-ce qui chauffe dans le SCRIPT de la course ? (build ≥ 109)
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17; R=~/cash-car/ios-ultime-mesures/chaleur/resultats.txt; ICI=$(dirname "$0"); C="&intro=ancien&attente=0&chute=0"
[ -n "$1" ] && xcrun devicectl device install app --device $D "$1" 2>&1 | grep -iE "error|installed" >> $R
un(){ sh $ICI/essai.sh "$1" "$2" 150 >> $R 2>&1; }
un lente              "&chaleur=course&challent=1$C"
un lente-sans-3d      "&chaleur=course&challent=1&chalrendu=0$C"
un vite-sans-prebati  "&chaleur=course&chalpal=1&prebati=0$C"
un vite-sans3d-sansPB "&chaleur=course&chalpal=1&chalrendu=0&prebati=0$C"
xcrun devicectl device process launch --device $D --terminate-existing -e '{"CC_QS":"&chaleur=vide"}' com.sachaberes.carcash >/dev/null 2>&1
echo "SERIE 2 FINIE $(date '+%H:%M:%S')" >> $R
