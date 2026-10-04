#!/bin/sh
# LES IMAGES DE LA PAGE ROBLOX, 1/2 : les photos (HUD coupé, 2000 px). sh outils/vitrine.sh nuages|ville|nuit|espace — puis python outils/vitrine.py
cd "$(dirname "$0")/.."
S="${CASHCAR_BANC:-$TEMP/cashcar-banc}/vitrine"
mkdir -p "$S"
dort() { python -c "import time; time.sleep($1)"; }
env() { python outils/distant.py envoie "$1" >/dev/null; }
J="$TEMP/cashcar-banc/distant/journal.txt"
NIV="$1"
if [ "$NIV" = "nuages" ]; then sh outils/banc.sh >/dev/null; else NIVEAU="$NIV" sh outils/banc.sh >/dev/null; fi
L0=$(wc -l < "$J" 2>/dev/null || echo 0)
powershell -NoProfile -ExecutionPolicy Bypass -File outils/studio-relance.ps1 60 >/dev/null 2>&1
i=0; while [ $i -lt 300 ]; do tail -n +$((L0 + 1)) "$J" 2>/dev/null | grep -q "menu prêt" && break; dort 0.5; i=$((i+1)); done
if [ "$NIV" = "nuages" ]; then
  dort 18
  powershell -NoProfile -ExecutionPolicy Bypass -File outils/studio-actif.ps1 >/dev/null
  sh outils/vue.sh "$S/titre.png" 2000 >/dev/null
fi
env 'workspace:SetAttribute("DbgAuto", "rail") workspace:SetAttribute("DbgJouer", os.clock()) task.wait(4) workspace:SetAttribute("DbgFx", "mort" .. os.clock()) task.wait(3) workspace:SetAttribute("DbgImmortel", true) workspace:SetAttribute("DbgJouer", os.clock()) return 1'
dort 16
env 'workspace:SetAttribute("DbgNitro", true) return 1'
dort 6
env 'client("prop", "ecran", "ScreenGui", "Enabled", false) return 1'
k=1
while [ $k -le 8 ]; do
  dort 2.2
  powershell -NoProfile -ExecutionPolicy Bypass -File outils/studio-actif.ps1 >/dev/null
  sh outils/vue.sh "$S/$NIV-$k.png" 2000 >/dev/null
  k=$((k+1))
done
