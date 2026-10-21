#!/bin/zsh
# depart.sh [meteo] [params encodés, ex. %26pistegraine=4242] : recharge le glacier, lance, met en pause, installe les aides
B=/Users/sachaberes/cash-car/neige-decor/.banc-neige; E=$B/ev.sh
curl -s -m 300 "http://127.0.0.1:9822/charge?q=colonne=0%26simu=1%26carte=banquise%26meteo=${1:-midi}${2}"; echo
$E "$(cat $B/aides.js)"
$E "document.querySelector('[data-m=\"play\"]').click();'ok'"
perl -e 'select(undef,undef,undef,1.5)'
$E "(async()=>{for(let k=0;k<150;k++){if(document.body.classList.contains('play')||dbgState().started){dbgAuto(1,0,{gl:true});await new Promise(r=>setTimeout(r,800));__ev('if(!paused)togglePause()');__ev('bkTranches(1e9)');return 'parti+pause '+k;}await new Promise(r=>setTimeout(r,100));}return 'pas parti';})()"
$E "JSON.stringify({plan:dbgBanq().plan,axe:dbgBanq().axe,L:dbgBanq().L,ms:dbgBanq().ms,tq:__ev('BANQ.tq'),err:String(window.__banqErr||''),lerr:String(window.__loopErr||'')})"
