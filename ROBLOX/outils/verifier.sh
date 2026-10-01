#!/bin/sh
# Compile TOUT le Luau du portage comme Roblox Studio le fait (-O1 -g2). Sans -g2, le compilateur laisse passer un script
# qui depasse 200 variables locales, et Studio le refuse au lancement (« Out of local registers »).
#   sh ROBLOX/outils/verifier.sh [chemin de luau-compile]      (par defaut : $LUAU_COMPILE, sinon luau-compile dans le PATH)
cd "$(dirname "$0")/.."
C="${1:-${LUAU_COMPILE:-luau-compile}}"
ko=0; n=0
for f in $(find src -name "*.luau"); do
  n=$((n+1))
  e=$("$C" --binary -O1 -g2 "$f" 2>&1 >/dev/null | head -2)
  if [ -n "$e" ]; then echo "ECHEC $f"; echo "  $e"; ko=$((ko+1)); fi
done
echo "$n scripts compiles, $ko en echec"
[ "$ko" -eq 0 ]
