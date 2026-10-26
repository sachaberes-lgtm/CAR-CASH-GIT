cd /Users/sachaberes/cash-car/tableau-voitures
/Users/sachaberes/cash-car/verrou-banc.sh prendre "verif-peintures-7"
( cd "/Users/sachaberes/cash-car/tableau-voitures/outils/banc-caisses/.copie/VERSION PRINCIPALE" && python3 -m http.server 9387 --bind 127.0.0.1 >/dev/null 2>&1 & echo $! > /Users/sachaberes/cash-car/tableau-voitures/outils/banc-caisses/.copie/srv.pid ); sleep 1
PORT=9387 node outils/banc-caisses/verif-peintures.mjs 2>&1 | cut -c1-900
kill $(cat /Users/sachaberes/cash-car/tableau-voitures/outils/banc-caisses/.copie/srv.pid) 2>/dev/null; /Users/sachaberes/cash-car/verrou-banc.sh rendre
