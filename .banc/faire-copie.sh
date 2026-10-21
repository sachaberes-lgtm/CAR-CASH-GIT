#!/bin/sh
# Fabrique la copie de banc : tout VERSION PRINCIPALE en liens, sauf index.html = assemblé + crochet __ev dans la fermeture du jeu
SRC="/Users/sachaberes/cash-car/vol-libre/VERSION PRINCIPALE"
DST="$1"
rm -rf "$DST"; mkdir -p "$DST"
for f in "$SRC"/* "$SRC"/.[!.]*; do [ -e "$f" ] || continue; b=$(basename "$f"); [ "$b" = index.html ] && continue; ln -s "$f" "$DST/$b"; done
python3 - "$SRC/index.html" "$DST/index.html" <<'PY'
import sys
s=open(sys.argv[1],'rb').read().decode('utf-8')
k="window.__gameReady=true; // la boucle part"
assert s.count(k)==1
s=s.replace(k,"window.__ev=function(__c9){return eval(__c9);};\n"+k)
open(sys.argv[2],'wb').write(s.encode('utf-8'))
PY
echo copie faite: "$DST"
