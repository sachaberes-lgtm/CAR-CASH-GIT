#!/bin/sh
# UNE LONGUE PARTIE AU BANC : sur rails, immortelle, les portails franchis pour de vrai — pour débusquer les erreurs qui ne sortent
# qu'en jouant longtemps (un niveau entier, le passage d'un monde à l'autre, les morts de chaque sorte).
#   sh ROBLOX/outils/longue.sh [minutes, 5 par défaut] [nitro]      (« nitro » : la nitro tenue enfoncée — vitesse, vols, morts)
# Il faut le relais (python outils/distant.py serveur) et un écran allumé (outils/ecran-allume.ps1). Le bilan : les zones
# traversées, les morts évitées par cause, les erreurs de la Sortie. Une photo par minute dans $TEMP/cashcar-banc/longue-N.png.
cd "$(dirname "$0")/.."
T="${CASHCAR_BANC:-$TEMP/cashcar-banc}"
dort() { python -c "import time; time.sleep($1)"; }
env() { python outils/distant.py envoie "$1" >/dev/null; }
J="$T/distant/journal.txt"
sh outils/banc.sh >/dev/null || exit 1
L0=$(wc -l < "$J" 2>/dev/null || echo 0)
powershell -NoProfile -ExecutionPolicy Bypass -File outils/studio-relance.ps1 60 >/dev/null 2>&1
i=0; while [ $i -lt 40 ]; do tail -n +$((L0 + 1)) "$J" 2>/dev/null | grep -q "menu prêt" && break; sleep 3; i=$((i+1)); done
dort 4
powershell -NoProfile -ExecutionPolicy Bypass -File outils/studio-actif.ps1 >/dev/null
# la première partie d'une session est l'auto-école : on la quitte par une vraie mort, puis on repart immortel
env 'workspace:SetAttribute("DbgAuto", "rail") workspace:SetAttribute("DbgJouer", os.clock()) task.wait(5) workspace:SetAttribute("DbgFx", "mort" .. os.clock()) task.wait(4) workspace:SetAttribute("DbgImmortel", true) workspace:SetAttribute("DbgJouer", os.clock()) return 1'
dort 12
[ -n "$2" ] && env 'workspace:SetAttribute("DbgNitro", true) return 1'
n=$(( ${1:-5} * 3 )); k=1
while [ $k -le $n ]; do
  dort 18
  env 'client("etat") return 1'
  powershell -NoProfile -ExecutionPolicy Bypass -File outils/studio-actif.ps1 >/dev/null
  if [ $((k % 3)) -eq 0 ]; then sh outils/vue.sh "$T/longue-$((k / 3)).png" 800 >/dev/null; fi
  k=$((k+1))
done
echo "--- les zones traversées (un relevé toutes les 18 s)"
tail -n +$((L0 + 1)) "$J" | grep "etat " | sed 's/.*mode=\([a-z]*\).*zone=\([0-9]*\).*/\1 zone \2/' | uniq -c
echo "--- les morts évitées"
tail -n +$((L0 + 1)) "$J" | grep "IMMORTEL" | sed 's/.*IMMORTEL //' | awk '{print $1, $2}' | sort | uniq -c
echo "--- les erreurs"
tail -n +$((L0 + 1)) "$J" | grep "atelier\|refus\|ERREUR\|sortie\]" | grep -v "IMMORTEL\|memory budget" | cut -c1-230 | awk '{k=$0; sub(/^[0-9:]+ /,"",k); c[k]++} END{for(k in c) print c[k] " x " k}' | head -12
