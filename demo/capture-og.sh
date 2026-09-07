#!/bin/bash
# Régénère demo/cash-car-demo/og.png — l'image que Slack affiche dans sa carte.
# À relancer dès que l'écran d'accueil change : une carte qui montre une version
# périmée du jeu est pire qu'une carte sans image.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
python3 -m http.server 8783 --directory . >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null; pkill -f "Google Chrome.*remote-debugging-port=9222" 2>/dev/null' EXIT
sleep 1
"$CHROME" --headless=new --mute-audio --disable-gpu --use-gl=swiftshader \
  --enable-unsafe-swiftshader --hide-scrollbars --window-size=1506,880 \
  --remote-debugging-port=9222 --user-data-dir=/tmp/cc-shot-profile \
  http://localhost:8783/capture-og.html >/dev/null 2>&1 &
sleep 6
node capture-og.mjs cash-car-demo/og.png 26000
# JPEG : 436 Ko de PNG -> 125 Ko. Slack telecharge cette image a chaque premiere
# resolution du lien ; une capture de rendu 3D ne perd rien en JPEG.
sips -s format jpeg -s formatOptions 82 cash-car-demo/og.png --out cash-car-demo/og.jpg >/dev/null
rm -f cash-car-demo/og.png
echo "og.jpg : $(( $(stat -f%z cash-car-demo/og.jpg) / 1024 )) Ko"
