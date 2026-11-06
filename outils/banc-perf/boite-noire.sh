#!/bin/sh
# (2026-11-06, passe perf mobile 2) LA BOÎTE NOIRE PAR CÂBLE : lit `cashcarErr` (gels > 1 s, erreurs, lignes `serpent`) dans le localStorage de l'app sur l'iPhone branché.
#   sh outils/banc-perf/boite-noire.sh [bundle] [device]      (défaut : com.sachaberes.carcash · iPhone 13 Pro FE6F8B40-…) — LECTURE SEULE, l'app peut être ouverte.
B=${1:-com.sachaberes.carcash}; D=${2:-FE6F8B40-DCFF-5E04-B578-871A79EDCF17}; T=$(mktemp -d)
P=$(xcrun devicectl device info files --device "$D" --domain-type appDataContainer --domain-identifier "$B" 2>/dev/null | grep -o 'Library/WebKit/WebsiteData/Default/[^ ]*/LocalStorage/localstorage.sqlite3' | head -1)
[ -z "$P" ] && { echo "localstorage introuvable (iPhone verrouillé / débranché / app absente ?)"; exit 1; }
for e in "" -wal -shm; do xcrun devicectl device copy from --device "$D" --domain-type appDataContainer --domain-identifier "$B" --source "$P$e" --destination "$T/localstorage.sqlite3$e" >/dev/null 2>&1; done
sqlite3 "$T/localstorage.sqlite3" "select hex(value) from ItemTable where key='cashcarErr'" | python3 -c "
import sys,binascii,json,time
h=sys.stdin.read().strip()
if not h:print('cashcarErr absent : aucune erreur ni gel enregistré');sys.exit(0)
t=binascii.unhexlify(h).decode('utf-16le','replace')
d=json.loads(t)
print(len(d),'entrées (la plus ancienne en premier)')
for x in sorted(d,key=lambda x:x.get('t0',0)):
    print(time.strftime('%d/%m %H:%M:%S',time.localtime(x.get('t0',0)/1000)),'x%s'%x.get('n',1),x.get('g'),'|',x.get('m'),'|',x.get('o'),'| v',x.get('v'))"
sqlite3 "$T/localstorage.sqlite3" "select key,length(value) from ItemTable" | tr '\n' ' '; echo
rm -rf "$T"
