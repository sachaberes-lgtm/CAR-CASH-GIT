#!/bin/sh
# (2026-11-12, ios-ultime) LIT LA BOÎTE DE VOL de l'iPhone branché : les courses rangées par l'enregistreur `?perfrec=2` (clés `ccBV<n>` du localStorage de l'app,
# voir code/moteur/enregistreur-perf.js, BV) → un fichier JSON daté, puis le tableau d'analyse-vol.py. LECTURE SEULE ; iPhone branché ET déverrouillé (30 à 90 s).
#   sh outils/banc-perf/lire-vol.sh [dossier de sortie] [bundle] [device]     défaut : ~/cash-car/ios-ultime-mesures/vol · com.sachaberes.carcash · iPhone 13 Pro
O=${1:-$HOME/cash-car/ios-ultime-mesures/vol}; B=${2:-com.sachaberes.carcash}; D=${3:-FE6F8B40-DCFF-5E04-B578-871A79EDCF17}; T=$(mktemp -d); mkdir -p "$O"
P=$(xcrun devicectl device info files --device "$D" --domain-type appDataContainer --domain-identifier "$B" 2>/dev/null | grep -o 'Library/WebKit/WebsiteData/Default/[^ ]*/LocalStorage/localstorage.sqlite3' | head -1)
[ -z "$P" ] && { echo "localstorage introuvable (iPhone verrouillé / débranché / app absente ?)" >&2; exit 1; }
for e in "" -wal -shm; do xcrun devicectl device copy from --device "$D" --domain-type appDataContainer --domain-identifier "$B" --source "$P$e" --destination "$T/localstorage.sqlite3$e" >/dev/null 2>&1; done
[ -s "$T/localstorage.sqlite3" ] || { echo "copie du localstorage impossible" >&2; rm -rf "$T"; exit 1; }
F="$O/vol-$(date +%m%d-%H%M).json"
sqlite3 "$T/localstorage.sqlite3" "select key||'|'||hex(value) from ItemTable where key like 'ccBV%' and key<>'ccBVn'" | python3 -c '
import sys,binascii,json
C=[]
for l in sys.stdin:
    k,h=l.strip().split("|",1)
    try:c=json.loads(binascii.unhexlify(h).decode("utf-16le","replace"));c["_k"]=int(k[4:]);C.append(c)
    except Exception as e:print("# illisible",k,e,file=sys.stderr)
C.sort(key=lambda c:c["_k"]);json.dump(C,open(sys.argv[1],"w"));print("%d courses → %s"%(len(C),sys.argv[1]))' "$F"
rm -rf "$T"
python3 "$(dirname "$0")/analyse-vol.py" "$F"
