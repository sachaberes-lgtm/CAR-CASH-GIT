#!/bin/zsh
# serie.sh prefixe : 18 vues fixes le long de la piste (caméra roulée avec la piste) : dans l'axe, à gauche, à droite
E=/Users/sachaberes/cash-car/neige-decor/.banc-neige/ev.sh
for f in .15 .3 .45 .6 .75 .9; do
  $E -p $1-${f}-c "__vueR(dbgBanq().L*$f,{})" >/dev/null
  $E -p $1-${f}-g "__vueR(dbgBanq().L*$f,{lc:-200,av:160})" >/dev/null
  $E -p $1-${f}-d "__vueR(dbgBanq().L*$f,{lc:200,av:160})" >/dev/null
done
