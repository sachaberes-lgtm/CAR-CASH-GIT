#!/bin/zsh
# pont.sh arrete|demarre : le pont CDP vers l'app (pymobiledevice3), le mien seulement (port 9881)
cd /Users/sachaberes/cash-car/optim-mobile/.banc-optim
case "$1" in
  arrete) for p in $(lsof -tiTCP:9881 -sTCP:LISTEN); do kill $p; done; sleep 1; lsof -iTCP:9881 -sTCP:LISTEN >/dev/null && echo "pont toujours là" || echo "pont arrêté";;
  demarre) lsof -iTCP:9881 -sTCP:LISTEN >/dev/null || (nohup ./venv/bin/pymobiledevice3 webinspector cdp --port 9881 > cdp.log 2>&1 &); for i in {1..30}; do curl -s -m 5 http://127.0.0.1:9881/json/list | grep -q capacitor && { echo "pont prêt"; exit 0; }; sleep 1; done; echo "pont : app invisible";;
esac
