#!/bin/bash
# lance.sh scenario carte graine hz [extra] : verrou commun, charge < 40, un seul Chrome (8842 / 9742)
cd "$(dirname "$0")"
/Users/sachaberes/cash-car/verrou-banc.sh prendre "debug-gameplay-cadence" >/dev/null
for i in $(seq 1 60); do l=$(uptime | sed 's/.*load averages*: *//' | awk '{print int($1)}'); [ "$l" -lt 40 ] && break; sleep 20; done
SC=$1; C=$2; G=$3; HZ=$4; EX=$5
M=midi
node pilote.mjs "$SC" "$C" "$M" "$G" "$HZ" "$EX" 2>&1 | tail -5
/Users/sachaberes/cash-car/verrou-banc.sh rendre >/dev/null
pgrep -f "remote-debugging-port=9742" >/dev/null && pkill -f "remote-debugging-port=9742"
exit 0
