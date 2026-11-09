#!/bin/sh
# (2026-11-07, passe 3, P7) LIT LA BOÎTE NOIRE ET LE JOURNAL DU BANC de l'iPhone branché : `cashcarErr` (gels, erreurs, sondes serpent/fluide/memoire) ET
# `cashcarBanc` (une ligne par étape du banc automatique, banc-iphone.js), fondus en UNE sortie triée par l'heure, au format de boite-noire.sh
# (« jj/mm HH:MM:SS xN genre | message | où | v version ») que garde-iphone.cjs sait lire. LECTURE SEULE ; iPhone branché ET déverrouillé.
#   sh outils/banc-perf/lire-banc.sh [bundle] [device]      (défaut : com.sachaberes.carcash · iPhone 13 Pro FE6F8B40-…)    sortie 1 si illisible
B=${1:-com.sachaberes.carcash}; D=${2:-FE6F8B40-DCFF-5E04-B578-871A79EDCF17}; T=$(mktemp -d)
P=$(xcrun devicectl device info files --device "$D" --domain-type appDataContainer --domain-identifier "$B" 2>/dev/null | grep -o 'Library/WebKit/WebsiteData/Default/[^ ]*/LocalStorage/localstorage.sqlite3' | head -1)
[ -z "$P" ] && { echo "localstorage introuvable (iPhone verrouillé / débranché / app absente ?)" >&2; exit 1; }
for e in "" -wal -shm; do xcrun devicectl device copy from --device "$D" --domain-type appDataContainer --domain-identifier "$B" --source "$P$e" --destination "$T/localstorage.sqlite3$e" >/dev/null 2>&1; done
[ -s "$T/localstorage.sqlite3" ] || { echo "copie du localstorage impossible" >&2; rm -rf "$T"; exit 1; }
for K in cashcarErr cashcarBanc; do sqlite3 "$T/localstorage.sqlite3" "select hex(value) from ItemTable where key='$K'" > "$T/$K.hex"; done
python3 - "$T" <<'PY'
import sys,binascii,json,time
T=sys.argv[1];tout=[]
for K in('cashcarErr','cashcarBanc'):
    h=open('%s/%s.hex'%(T,K)).read().strip()
    if not h:continue
    try:
        d=json.loads(binascii.unhexlify(h).decode('utf-16le','replace'))
        for x in d:x['_k']=K
        tout+=d
    except Exception as e:print('# %s illisible : %s'%(K,e),file=sys.stderr)
print('# %d entrées (cashcarErr + cashcarBanc, la plus ancienne en premier)'%len(tout))
for x in sorted(tout,key=lambda x:x.get('t0',0)):
    print(time.strftime('%d/%m %H:%M:%S',time.localtime(x.get('t0',0)/1000)),'x%s'%x.get('n',1),x.get('g'),'|',x.get('m'),'|',x.get('o'),'| v',x.get('v'))
PY
rm -rf "$T"
