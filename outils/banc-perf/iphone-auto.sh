#!/bin/sh
# (2026-11-07, passe 3 « au max », P7) LE BANC iPHONE AUTOMATIQUE, côté Mac : lance l'app de BANC déjà installée (construite avec `preparer-www.js --banc`), la laisse se jouer
# toute seule (banc-iphone.js : titre, menu, garage, inventaire, boutique, 2 parties de 5 min, palier 16, morts), puis lit la boîte noire par câble et juge les seuils P7.
#   sh outils/banc-perf/iphone-auto.sh <N° de build> [--attente 780] [--max 1020] [--sans-lancer] [--appareil UUID] [--bundle ID]
#   Sortie 0 = tous les seuils tiennent ET le scénario est allé au bout ; 1 = un seuil franchi / scénario incomplet ; 2 = mauvais appel / iPhone illisible.
#   Écrit outils/banc-perf/mesures/<date>-iphone13pro-build<N>-brut.txt (la boîte noire) et …build<N>.md (le résumé + le tableau des étapes).
# PRÉREQUIS (sinon rien ne se lit) : l'iPhone est BRANCHÉ et DÉVERROUILLÉ au lancement, et RÉGLAGES › Affichage › Verrouillage auto = JAMAIS (rien ne touche l'écran pendant 13 min :
#   un écran qui se verrouille suspend l'app et la lecture par câble échoue). L'INSTALLATION est faite avant (xcrun devicectl device install app …).
# Un run précédent arrêté à la main fait remonter un « ⚠ PLANTAGE OU RECHARGEMENT » au lancement suivant (banc-iphone.js le voit par cashcarBancEtat) : relancer une 2e fois pour une lecture propre.
ICI=$(cd "$(dirname "$0")" && pwd); N=""; ATT=780; MAX=1020; LANCE=1; D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17; B=com.sachaberes.carcash
while [ $# -gt 0 ]; do case "$1" in
  --attente) ATT=$2; shift 2;; --max) MAX=$2; shift 2;; --sans-lancer) LANCE=0; shift;; --appareil) D=$2; shift 2;; --bundle) B=$2; shift 2;;
  -*) echo "option inconnue : $1" >&2; exit 2;; *) N=$1; shift;; esac; done
[ -z "$N" ] && { sed -n '2,9p' "$0" | cut -c3-; exit 2; }
DATE=$(date +%Y-%m-%d); MES="$ICI/mesures"; mkdir -p "$MES"; BASE="$MES/$DATE-iphone13pro-build$N"; BRUT="$BASE-brut.txt"; MD="$BASE.md"
DEPUIS=$(date +"%d/%m %H:%M"); T0=$(date +%s)
if [ "$LANCE" = 1 ]; then
  echo "▶ lancement de $B sur l'iPhone ($DEPUIS)…"
  xcrun devicectl device process launch --device "$D" --terminate-existing "$B" >/dev/null 2>"$MES/.lancement.err" || { echo "✗ lancement impossible (iPhone déverrouillé ? app installée ?) :"; cat "$MES/.lancement.err"; exit 2; }
fi
echo "… le banc se joue seul ; première lecture dans $ATT s, au plus tard à $MAX s (il écrit « banc: fini » à la fin)"
sleep "$ATT"
while :; do
  sh "$ICI/lire-banc.sh" "$B" "$D" > "$BRUT" 2>"$MES/.lecture.err" && grep -q 'banc: fini' "$BRUT" && break
  [ $(( $(date +%s) - T0 )) -ge "$MAX" ] && break
  echo "… pas encore fini ($(( $(date +%s) - T0 )) s), nouvelle lecture dans 60 s"; sleep 60
done
[ -s "$BRUT" ] || { echo "✗ boîte noire illisible :"; cat "$MES/.lecture.err"; exit 2; }
# ---- le jugement ----
RES=$(mktemp); rc=0
python3 - "$BRUT" "$DEPUIS" > "$RES" <<'PY'
import sys,re
brut,depuis=sys.argv[1],sys.argv[2]
cle=lambda s:(lambda m:m.group(2)+m.group(1)+m.group(3) if m else '')(re.match(r'^(\d\d)/(\d\d) (\d\d:\d\d:\d\d)',s))
L=[l.rstrip('\n') for l in open(brut,encoding='utf-8') if re.match(r'^\d\d/\d\d ',l)]
L=[l for l in L if cle(l)>=cle(depuis+':00')]
B=[l for l in L if ' banc |' in l]
ko=[];ok=[]
def note(b,m):(ok if b else ko).append(m)
note(any('banc: fini' in l for l in B),'scénario : '+('allé au bout (« banc: fini »)' if any('banc: fini' in l for l in B) else 'PAS FINI — dernière ligne : '+(B[-1][:160] if B else 'aucune ligne banc (le drapeau n\'est pas posé ? app sans --banc ?)')))
ech=[l for l in B if 'ÉCHEC' in l]
note(not ech,'étapes en échec : '+(str(len(ech))+' — '+' || '.join(re.sub(r'^.*? banc \| banc: ','',l)[:90] for l in ech[:4]) if ech else '0'))
pl=[l for l in B if 'PLANTAGE OU RECHARGEMENT' in l]
note(not pl,'plantage / rechargement détecté par le banc : '+(str(len(pl))+' — '+' || '.join(re.sub(r'^.*? banc \| banc: ','',l)[:140] for l in pl[:3]) if pl else '0'))
pal=[int(m.group(1)) for l in B for m in [re.search(r'palier max (\d+)',l)] if m]
if pal and max(pal)<16:ok.append('⚠ palier 16 NON atteint (palier max de la partie 2 : %d) — le seuil « fluide » à haute vitesse n\'est pas couvert'%max(pal))
elif pal:ok.append('palier moteur max atteint : %d'%max(pal))
open(sys.argv[1]+'.verdict','w').write('\n'.join(['✔ '+m for m in ok]+['✘ '+m for m in ko])+'\n')
sys.exit(1 if ko else 0)
PY
r1=$?; cat "$BRUT.verdict" 2>/dev/null > "$RES.b"
if [ -f "$ICI/garde-iphone.cjs" ]; then node "$ICI/garde-iphone.cjs" "$BRUT" --depuis "$DEPUIS" --plantages "$(grep -c 'PLANTAGE OU RECHARGEMENT' "$BRUT" 2>/dev/null || true)" > "$RES.g" 2>&1; r2=$?; else echo "(garde-iphone.cjs absent : seuils serpent/fluide/mémoire/gels non jugés)" > "$RES.g"; r2=1; fi
rm -f "$BRUT.verdict"
{
  echo "# iPhone 13 Pro — build $N — banc automatique du $DATE"; echo
  echo "Lancé à $DEPUIS par \`outils/banc-perf/iphone-auto.sh $N\` (l'app se joue seule : banc-iphone.js ; brut : \`$(basename "$BRUT")\`)."; echo
  echo "## Le scénario"; cat "$RES.b"; echo
  echo "## Les seuils P7 (garde-iphone.cjs)"; echo '```'; cat "$RES.g"; echo '```'; echo
  echo "## Les étapes (pire image depuis l'étape d'avant)"; echo '```'
  grep ' banc |' "$BRUT" | sed 's/ x1 banc | banc: / /; s/ | *| v .*$//'
  echo '```'; echo
  echo "## Les gels, erreurs et sondes de la boîte noire"; echo '```'; grep -v ' banc |' "$BRUT" | grep -E ' (gel|erreur|promesse|boucle|panne|contexte|memoire) \|' | cut -c1-260; echo '```'
} > "$MD"
cat "$RES.b"; cat "$RES.g"; rm -f "$RES" "$RES.b" "$RES.g"
[ "$r1" -ne 0 ] || [ "$r2" -ne 0 ] && rc=1
echo "→ $MD"; exit $rc
