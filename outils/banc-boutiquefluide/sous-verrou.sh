#!/bin/bash
# Lance UNE commande de banc sous le verrou commun (~/cash-car/verrou-banc.sh), 12 min au plus ; rend SA place seulement, même en cas d'échec.
#   sh outils/banc-boutiquefluide/sous-verrou.sh node outils/banc-boutiquefluide/trace.cjs --essai avec --out <dossier>
QUI="auteur-boutiquefluide-$$"
~/cash-car/verrou-banc.sh prendre "$QUI"
rendre() { [ -n "$P" ] && kill $P 2>/dev/null; for L in /private/tmp/cashcar-banc.lock /private/tmp/cashcar-banc.lock.2; do if grep -q "$QUI" "$L/qui" 2>/dev/null; then rm -rf "$L"; echo "verrou rendu ($L)"; fi; done; }
trap rendre EXIT
cd "$(dirname "$0")/../.."
"$@" &
P=$!
( exec >/dev/null 2>&1; sleep 720; kill $P ) & G=$!
wait $P; pkill -P $G 2>/dev/null; kill $G 2>/dev/null
