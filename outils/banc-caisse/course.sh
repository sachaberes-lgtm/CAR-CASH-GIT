#!/bin/sh
# LE BANC DE LA CAISSE — recharge la page de l'hôte et lance une course figée (boucle menée à la main, comme banc-finition/caisse.cjs).
#   [GRAINE=161] [SAVEJ='{"equipped":61,"owned":[0,61]}'] sh outils/banc-caisse/course.sh "<paramètres d'URL en plus>" [nitro 1|0]
D=$(cd "$(dirname "$0")" && pwd); EV="node $D/ev.cjs"; [ -z "$SAVEJ" ] && SAVEJ='{}'
$EV --nav "index.html?appareil=iPhone14,2&colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=nuages&pistegraine=7${1:+&$1}" "$SAVEJ" --graine ${GRAINE:-0} >/dev/null
for i in $(seq 1 120); do r=$($EV "!!window.__gameReady&&typeof dbgJouer==='function'" 2>/dev/null); [ "$r" = "true" ] && break; sleep 1; done
sleep 2
$EV "(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()" >/dev/null
sleep 2
for i in $(seq 1 120); do [ $((i % 8)) = 1 ] && $EV "dbgJouer()" >/dev/null 2>&1; r=$($EV "(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()" 2>/dev/null); [ "$r" = "true" ] && break; sleep 1; done
echo "course $r"
$EV "window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:${2:-1}});dbgQual(1);1" >/dev/null
