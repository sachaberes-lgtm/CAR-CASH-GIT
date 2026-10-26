#!/bin/bash
# base.sh : attend le déverrouillage du 13 Pro, monte l'image développeur, installe CC BANC, prend le verrou commun, lance file-base.json (25/10, perf mobile)
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
APP=$B/app-banc/dd/Build/Products/Release-iphoneos/App.app
V=/Users/sachaberes/cash-car/verrou-banc.sh
L=/private/tmp/cashcar-banc.lock
log(){ echo "$(date +%H:%M:%S) $*"; }
if lsof -iTCP:8931 -sTCP:LISTEN >/dev/null 2>&1; then log "ÉCHEC : le port 8931 est pris par un autre banc"; exit 1; fi
log "j'attends que le 13 Pro soit déverrouillé (15 min au plus)"
ok=0
for i in $(seq 1 90); do
  out=$(xcrun devicectl device info ddiServices --device $D 2>&1)
  if ! echo "$out" | grep -q "kAMDMobileImageMounterDeviceLocked\|ERROR"; then ok=1; break; fi
  sleep 10
done
[ $ok = 1 ] || { log "ÉCHEC : le téléphone est resté verrouillé"; exit 1; }
log "image développeur montée"
r=$(xcrun devicectl device install app --device $D "$APP" 2>&1)
echo "$r" | grep -qi "installed" || { log "ÉCHEC de l'installation :"; echo "$r" | tail -6; exit 1; }
log "CC BANC installée (bundle com.sachaberes.carcash.banc)"
$V prendre "perf mobile : base v897 sur le 13 Pro"
( while true; do sleep 300; echo "$$ $(date +%s) perf mobile base" > $L/qui; done ) & HB=$!
trap 'kill $HB 2>/dev/null; $V rendre' EXIT
cd $B && node chef.mjs file-base.json 37
log "chef terminé"
