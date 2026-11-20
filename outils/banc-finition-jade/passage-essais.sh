#!/bin/sh
# UN PASSAGE DES ESSAIS DE JADE (2026-11-20, correction 3) : le mutex du groupe « finition des maps » (une place à la fois pour le groupe),
# puis le verrou commun « finition-jade » ; à la fin, ne rend QUE sa place (le dossier qui porte « finition-jade »), retire le mutex, efface le profil.
#   sh passage-essais.sh <dossier de sortie> <script .cjs> <arguments…>
V=/Users/sachaberes/cash-car/verrou-banc.sh
MX=/private/tmp/finition-maps-banc.mutex
O="$1"; shift; JS="$1"; shift
mkdir -p "$O"; J="$O/journal.txt"; P="$O/profil"; mkdir -p "$P"
PN=""; MXA=0
rend() {
  [ -n "$PN" ] && kill "$PN" 2>/dev/null; PN=""
  rm -rf "$P"
  for L in /private/tmp/cashcar-banc.lock /private/tmp/cashcar-banc.lock.2; do
    if grep -q "finition-jade" "$L/qui" 2>/dev/null; then rm -rf "$L"; echo "place rendue : $L" >> "$J"; fi
  done
  [ "$MXA" = 1 ] && rmdir "$MX" 2>/dev/null && echo "mutex rendu" >> "$J"; MXA=0
}
trap 'rend; exit 1' INT TERM
trap 'rend' EXIT
echo "=== attente du mutex $(date +%H:%M:%S)" >> "$J"
until mkdir "$MX" 2>/dev/null; do
  if [ -d "$MX" ]; then a=$(( $(date +%s) - $(stat -f %m "$MX" 2>/dev/null || date +%s) )); if [ "$a" -gt 1500 ]; then echo "mutex abandonné ($a s) : retiré" >> "$J"; rmdir "$MX" 2>/dev/null; continue; fi; fi
  sleep 20
done
MXA=1
echo "=== mutex pris $(date +%H:%M:%S)" >> "$J"
"$V" prendre "finition-jade" >> "$J" 2>&1 || exit 1
echo "=== verrou pris $(date +%H:%M:%S) ; df $(df -h / | tail -1 | awk '{print $4}')" >> "$J"
TMPDIR="$P" node "$JS" "$@" >> "$J" 2>&1 &
PN=$!; wait "$PN"; PN=""
echo "=== fini $(date +%H:%M:%S)" >> "$J"
rend
trap - EXIT INT TERM  # (vu au banc le 20/11) sinon le trap de sortie rejoue « rend » après la pause et efface le profil d'un passage suivant
sleep 40
