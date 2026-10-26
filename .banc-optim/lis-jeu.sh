#!/bin/bash
# lis-jeu.sh : lit l'enregistreur de parties de CC JEU (jouée à la main) par le pont inspecteur (USB obligatoire, CC JEU ouverte ou en arrière-plan récent). Écrit res-app/jeu-<heure>.json.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
cd $B
$B/venv/bin/pymobiledevice3 webinspector cdp --port 9881 >/dev/null 2>&1 &
BR=$!
sleep 8
F=res-app/jeu-$(date +%H%M).json
node cdp.mjs -e "JSON.stringify({resume:dbgPerfRec('resume'),gouv:(window.dbgGouv?dbgGouv():null),cad:dbgCadence(),tout:dbgPerfRec()})" > $F 2>&1
kill $BR 2>/dev/null
echo "écrit $F ($(wc -c < $F) octets)"
node -e 'try{const t=JSON.parse(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")));console.log((t.resume||[]).join("\n"));console.log("gouverneur:",JSON.stringify(t.gouv));}catch(e){console.log("lecture impossible :",e.message)}' $F
