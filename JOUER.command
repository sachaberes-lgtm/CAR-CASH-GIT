#!/bin/bash
# CASH CAR — lanceur macOS / Linux (jumeau de JOUER.bat).
#
# POURQUOI UN SERVEUR ET PAS UN DOUBLE-CLIC SUR index.html : en file:// le navigateur REFUSE de
# charger les mp3 (musique + voix de l'annonceur). Le jeu se lance quand même, mais MUET. Il faut
# donc le servir en HTTP, et c'est tout ce que fait ce script.
#
# L'URL est UNIQUE à chaque lancement (?v=aléatoire) : ça contourne le cache du navigateur, qui
# resservait de vieilles copies — le piège classique du projet.
cd "$(dirname "$0")" || exit 1

PORT=8000
while lsof -i :$PORT >/dev/null 2>&1; do PORT=$((PORT+1)); done   # port déjà pris ? on prend le suivant

PY=$(command -v python3 || command -v python)
if [ -z "$PY" ]; then
  echo "Python n'est pas installé. Installe-le depuis https://www.python.org puis relance."
  read -r -p "Entrée pour fermer…"; exit 1
fi

"$PY" -m http.server $PORT >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT INT TERM
sleep 1

URL="http://localhost:$PORT/?v=$RANDOM$RANDOM"
command -v open >/dev/null 2>&1 && open "$URL" || xdg-open "$URL" 2>/dev/null || echo "Ouvre : $URL"

echo ""
echo "  CASH CAR tourne sur $URL"
echo "  L'atelier du fond : http://localhost:$PORT/atelier-fond.html"
echo ""
echo "  Laisse cette fenêtre OUVERTE pendant que tu joues."
echo "  Ferme-la (ou Ctrl+C) pour arrêter le serveur."
echo ""
wait $SRV
