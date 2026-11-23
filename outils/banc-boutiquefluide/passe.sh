#!/bin/bash
# Une passe du banc du parcours de la boutique sous le verrou commun. Rend SON verrou seulement, même en cas d'échec ; tue son Chrome, efface son profil.
#   sh outils/banc-boutiquefluide/passe.sh <dossier de sortie> <dossier parent des profils> <essais : avec,sans,...> [options de parcours.cjs]
# ⚠ Le verrou reprend une place tenue plus de 15 min : garder une passe sous ~12 min (4 essais au plus, ~2 min 30 chacun).
D="$(cd "$(dirname "$0")/../.." && pwd)"; OUT="$1"; PROF="$2"; LISTE="$3"; shift 3; mkdir -p "$OUT" "$PROF"
QUI="auteur-boutiquefluide-$$"
~/cash-car/verrou-banc.sh prendre "$QUI"
rendre() {
  [ -n "$P" ] && kill $P 2>/dev/null
  for L in /private/tmp/cashcar-banc.lock /private/tmp/cashcar-banc.lock.2; do
    if grep -q "$QUI" "$L/qui" 2>/dev/null; then rm -rf "$L"; echo "verrou rendu ($L)"; fi
  done
  rm -rf "$PROF"/banc-bf-prof-* 2>/dev/null
}
trap rendre EXIT
cd "$D"
echo "== passe $LISTE $(date +%T)"
node outils/banc-boutiquefluide/parcours.cjs --essais "$LISTE" --out "$OUT" --prof "$PROF" "$@" > "$OUT/sortie.jsonl" 2> "$OUT/journal.txt" &
P=$!
( exec >/dev/null 2>&1; sleep 780; kill $P ) & G=$!
wait $P; pkill -P $G 2>/dev/null; kill $G 2>/dev/null
echo "   fini $(date +%T) : $(wc -l < "$OUT/sortie.jsonl") essais"
