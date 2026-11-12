#!/bin/sh
# publie la branche grotte-vertige sur main d'un trait (main bouge toutes les minutes) : repart d'origin/main, fusionne, sw.js = origin + 1, réassemble, vérifie, pousse
cd ~/cash-car/grotte-vertige || exit 1
for essai in 1 2 3 4 5; do
  git fetch -q origin || exit 1
  BASE=$(git rev-parse origin/main)
  git checkout -q -B pub-vertige origin/main || exit 1
  git merge --no-commit --no-ff grotte-vertige >/dev/null 2>&1
  AUTRES=$(git diff --name-only --diff-filter=U | grep -v "sw.js" | grep -v "index.html")
  if [ -n "$AUTRES" ]; then echo "CONFLIT ailleurs : $AUTRES"; git merge --abort; exit 2; fi
  git show origin/main:"VERSION PRINCIPALE/sw.js" > "VERSION PRINCIPALE/sw.js"
  python3 - <<'PY' || exit 3
import io,re
p='VERSION PRINCIPALE/sw.js';s=io.open(p,encoding='utf-8',newline='').read()
m=re.search(r"const CACHE = 'cashcar-v(\d+)';[^\n]*",s);n=int(m.group(1))+1
s=s.replace(m.group(0),"const CACHE = 'cashcar-v%d'; /* v%d (2026-11-12, Sacha : « les mêmes modules en boucle dans les grottes ; qu'on ne sache plus si on est à l'endroit ou à l'envers ; qu'on descende ») LE VERTIGE : le plan de grotte au hasard, les passages qui plongent, les salles au plafond et sur les murs, 26 modules sans redite */"%(n,n))
assert s.count('const CACHE =')==1;io.open(p,'w',encoding='utf-8',newline='').write(s);io.open('/tmp/vertige-v','w').write(str(n))
PY
  git checkout -q --theirs "VERSION PRINCIPALE/index.html" 2>/dev/null
  node code/assembler.cjs --depuis-morceaux >/dev/null || exit 4
  node code/assembler.cjs --verifier | tail -1
  [ "$(grep -c planVertige 'VERSION PRINCIPALE/index.html')" = "3" ] && [ "$(grep -c planVertige code/maps/grottes-1.js)" = "3" ] || { echo "MON CODE A DISPARU"; exit 5; }
  node --check code/maps/grottes-1.js || exit 6
  V=$(cat /tmp/vertige-v)
  git add -A "VERSION PRINCIPALE/sw.js" "VERSION PRINCIPALE/index.html" code outils
  git commit -q -m "Grotte : LE VERTIGE — une grotte différente à chaque entrée (plan au hasard, salles au plafond sous le lac et sur les murs, passages qui plongent, 26 modules sans redite) — cache v$V

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>" || exit 7
  git fetch -q origin
  if [ "$(git rev-parse origin/main)" = "$BASE" ]; then
    git push origin pub-vertige:main 2>&1 | tail -2
    git fetch -q origin
    if [ "$(git rev-parse origin/main)" = "$(git rev-parse HEAD)" ]; then echo "PUBLIE v$V $(git rev-parse --short HEAD) (essai $essai)"; exit 0; fi
    echo "push refusé, on recommence"
  else echo "main a bougé pendant l'essai $essai, on recommence"; fi
done
echo "ECHEC après 5 essais"; exit 9
