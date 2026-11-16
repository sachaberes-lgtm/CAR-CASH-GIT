#!/bin/sh
# BANC DE CHALEUR — série 3 du 13/11 : les témoins batterie pleine (la charge ne chauffe plus) : la course à 30 i/s, à 20 i/s, avec le son.
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17; R=~/cash-car/ios-ultime-mesures/chaleur/resultats.txt; ICI=$(dirname "$0"); C="&chalpal=1&intro=ancien&attente=0&chute=0"
un(){ sh $ICI/essai.sh "$1" "$2" ${3:-150} >> $R 2>&1; }
un course-3-pleine  "&chaleur=course$C" 240
un course-20ips-bis "&chaleur=course&cadfps=20$C" 240
un course-4-pleine  "&chaleur=course$C" 240
un course-son       "&chaleur=course&chalson=1$C" 150
xcrun devicectl device process launch --device $D --terminate-existing -e '{"CC_QS":"&chaleur=vide"}' com.sachaberes.carcash >/dev/null 2>&1
echo "SERIE 3 FINIE $(date '+%H:%M:%S')" >> $R
