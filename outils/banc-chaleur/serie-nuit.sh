#!/bin/sh
# BANC DE CHALEUR — série de nuit du 17/11 (build 119, téléphone branché au Mac, mode économie tel que Sacha le laisse) : où part l'énergie, poste par poste.
# Chaque essai : repos jusqu'à budget ≥ 2,25 W (12 min au plus) puis 300 s. Deux tours, la référence répétée pour voir le bruit.
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17; R=~/cash-car/ios-ultime-mesures/chaleur/resultats.txt; ICI=$(dirname "$0"); C="&chalpal=1&intro=ancien&attente=0&chute=0"  # intro=ancien : sans lui le film d'intro attend un toucher et la course reste figée dessous
un(){ sh $ICI/essai.sh "$1" "$2" ${3:-300} >> $R 2>&1; }
echo "SERIE NUIT DEBUT $(date '+%Y-%m-%d %H:%M:%S')" >> $R
for T in 1 2; do
un n$T-ref-a        "&chaleur=course&chalson=1$C"
un n$T-sans-rendu   "&chaleur=course&chalson=1&chalrendu=0$C"
un n$T-ref-b        "&chaleur=course&chalson=1$C"
un n$T-dpr100       "&chaleur=course&chalson=1&chaldpr=1$C"
un n$T-dpr075       "&chaleur=course&chalson=1&chaldpr=0.75$C"
un n$T-sans-son     "&chaleur=course$C"
un n$T-ref-c        "&chaleur=course&chalson=1$C"
un n$T-20ips        "&chaleur=course&chalson=1&cadfps=20$C"
un n$T-lent         "&chaleur=course&chalson=1&challent=1$C"
un n$T-accueil      "&chaleur=accueil&chalson=1$C"
un n$T-pause        "&chaleur=pause&chalson=1$C"
un n$T-vide         "&chaleur=vide"
un n$T-sans-jsimage "&chaleur=course&chalson=1&sans=jsimage$C"
un n$T-sans-progdbl "&chaleur=course&chalson=1&sans=progdouble$C"
un n$T-ref-d        "&chaleur=course&chalson=1$C"
done
xcrun devicectl device process launch --device $D --terminate-existing -e '{"CC_QS":"&chaleur=vide"}' com.sachaberes.carcash >/dev/null 2>&1
echo "SERIE NUIT FINIE $(date '+%Y-%m-%d %H:%M:%S')" >> $R
