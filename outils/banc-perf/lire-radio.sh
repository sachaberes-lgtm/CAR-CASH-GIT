#!/bin/sh
# (2026-11-13, ios-ultime) LIT LA RADIO de l'iPhone branché : le dernier tableau du banc embarqué (`?banc=1`, clé `ccBancDernier` du localStorage de l'app),
# même partiel (chaque ligne finie est gardée). LECTURE SEULE ; iPhone branché ET déverrouillé. Même chemin que lire-banc.sh.
#   sh outils/banc-perf/lire-radio.sh [bundle] [device]      sortie 1 si illisible
# Build de radio : preparer-www.js … --qs "&banc=1&refaire=1&carte=<map>" ; lancer l'app, ne rien toucher ~5 min (« FINI » s'affiche), puis lire.
B=${1:-com.sachaberes.carcash}; D=${2:-FE6F8B40-DCFF-5E04-B578-871A79EDCF17}; T=$(mktemp -d)
P=$(xcrun devicectl device info files --device "$D" --domain-type appDataContainer --domain-identifier "$B" 2>/dev/null | grep -o 'Library/WebKit/WebsiteData/Default/[^ ]*/LocalStorage/localstorage.sqlite3' | head -1)
[ -z "$P" ] && { echo "localstorage introuvable (iPhone verrouillé / débranché / app absente ?)" >&2; exit 1; }
for e in "" -wal -shm; do xcrun devicectl device copy from --device "$D" --domain-type appDataContainer --domain-identifier "$B" --source "$P$e" --destination "$T/localstorage.sqlite3$e" >/dev/null 2>&1; done
[ -s "$T/localstorage.sqlite3" ] || { echo "copie du localstorage impossible" >&2; rm -rf "$T"; exit 1; }
sqlite3 "$T/localstorage.sqlite3" "select hex(value) from ItemTable where key='ccBancDernier'" > "$T/r.hex"
python3 - "$T" <<'PY'
import sys,binascii,json
h=open(sys.argv[1]+'/r.hex').read().strip()
if not h:print('pas de radio sur le téléphone (ccBancDernier vide : le banc n\'a pas tourné)');sys.exit(1)
d=json.loads(binascii.unhexlify(h).decode('utf-16le','replace'))
print('# radio du',d.get('d'),'— complète' if d.get('fin') else '— INCOMPLÈTE (page quittée avant la fin)')
if d.get('err'):print('# ERREUR :',d['err'])
print(d.get('t',''))
PY
r=$?; rm -rf "$T"; exit $r
