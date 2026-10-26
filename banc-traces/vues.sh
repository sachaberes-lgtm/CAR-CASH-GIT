for g in 101 202 303; do
  for v in avant apres; do D="../VERSION PRINCIPALE"; [ $v = avant ] && D="/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-relaxed-dhawan-a78f07/d17cc035-59b2-4b1e-a6a3-b35b59c19fb4/scratchpad/avant-jeu"
    node jeu.cjs "$D" vue volcan soir photos/vue-$v-volcan-$g $g 2>&1 | tail -1 | cut -c1-300
    node jeu.cjs "$D" vue grotte matin photos/vue-$v-grotte-$g $g 2>&1 | tail -1 | cut -c1-300
  done
done
echo FINI
