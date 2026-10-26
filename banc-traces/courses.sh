for r in 1 2 3; do for c in volcan:soir grotte:matin; do for v in "/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-relaxed-dhawan-a78f07/d17cc035-59b2-4b1e-a6a3-b35b59c19fb4/scratchpad/avant-jeu" "../VERSION PRINCIPALE"; do
  node jeu.cjs "$v" course ${c%%:*} ${c##*:} >/dev/null 2>&1
  node -e "const o=require('./sortie-course-${c%%:*}.json').res;console.log('${c%%:*}',('$v'.includes('avant')?'AVANT':'APRÈS'),o.fin,o.sec+'s','L0',o.L0,'v',o.vMoy,'mort:',o.cause,'err',JSON.stringify(o.erreurs.filter(e=>!/dark-triad|navigator.vibrate/.test(e))),'loop',o.loopErr,(o.hasard||'').slice(0,120))"
done; done; done
