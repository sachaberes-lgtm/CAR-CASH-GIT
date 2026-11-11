#!/bin/bash
# Audit de la boutique : pour chaque format (taille + marges de sécurité) et chaque rayon, une photo et les mesures.
#   audit.sh <port contrôle> <dossier de sortie> [formats...]
P=$1; OUT=$2; shift; shift
SP="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$OUT"
# nom:largeur:hauteur:haut:bas:gauche:droite:tactile
TOUS="i15d:393:852:59:34:0:0:1 i15c:852:393:0:21:59:59:1 sed:375:667:20:0:0:0:1 sec:667:375:0:0:0:0:1 pmd:430:932:59:34:0:0:1 pmc:932:430:0:21:59:59:1 pcc:844:390:0:0:0:0:0 pcd:390:844:0:0:0:0:0"
FMT="${*:-$TOUS}"
ouvre() { # ouvre la boutique depuis l'accueil
  curl -s -X POST --data "__mGo('shop')" localhost:$P/ev >/dev/null; sleep 2
  curl -s -X POST --data "__mGo('home')" localhost:$P/ev >/dev/null; sleep 2
  curl -s "localhost:$P/tap?sel=%23mHome%20%5Bdata-m%3D%22garage%22%5D" >/dev/null; sleep 13
  curl -s "localhost:$P/tap?sel=%23gShopBas&fx=.82&fy=.84" >/dev/null; sleep 13
}
dans=$(curl -s -X POST --data "document.documentElement.classList.contains('bqIndus')&&!!document.querySelector('#gBq.pan')" localhost:$P/ev)
[ "$dans" != "true" ] && ouvre
: > "$OUT/mesures.txt"
for f in $FMT; do
  IFS=: read n w h t b l r m <<< "$f"
  curl -s "localhost:$P/size?w=$w&h=$h&mob=$m" >/dev/null
  curl -s -X POST --data "(function(){var s=document.documentElement.style;s.setProperty('--ccT','${t}px');s.setProperty('--ccB','${b}px');s.setProperty('--ccL','${l}px');s.setProperty('--ccR','${r}px');window.dispatchEvent(new Event('resize'));return 1})()" localhost:$P/ev >/dev/null
  sleep 3
  for c in voiture achat peinture aile trainee figure; do
    curl -s "localhost:$P/tap?sel=%23gBqCats%20%5Bdata-c%3D%22$c%22%5D" >/dev/null; sleep 4.5
    curl -s -m 30 "localhost:$P/shot?f=$(cygpath -m "$OUT")/${n}_$c.jpg&jpg=80" >/dev/null
    echo "$n $c $(curl -s -m 20 -X POST --data-binary @"$SP/mes.js" localhost:$P/ev)" >> "$OUT/mesures.txt"
  done
done
echo "erreurs: $(curl -s localhost:$P/err)" >> "$OUT/mesures.txt"
node -e "
const L=require('fs').readFileSync(process.argv[1],'utf8').split('\n').filter(Boolean);
for(const l of L){const m=/^(\S+) (\S+) (.*)$/.exec(l);if(!m||m[1]==='erreurs:'){console.log(l.slice(0,400));continue;}let o;try{o=JSON.parse(JSON.parse(m[3]))}catch(e){console.log(m[1],m[2],'??',m[3].slice(0,120));continue}
const d=o.d||{},c=d.caisse||[],z=d.zone||{};console.log(m[1].padEnd(5),m[2].padEnd(9),'caisse',(c[2]-c[0])+'x'+(c[3]-c[1]),'@'+c[0]+','+c[1],'| zone y',Math.round(z.y0)+'-'+Math.round(z.y1),'| cartes',o.vis+'/'+o.n,'ent',o.ent,'| c0',o.carte0?o.carte0.w+'x'+o.carte0.h:'-',o.pb.length?'| ⚠ '+o.pb.join(' ; '):'');}
" "$(cygpath -m "$OUT")/mesures.txt"
