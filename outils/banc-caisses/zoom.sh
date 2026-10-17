#!/bin/sh
# zoom.sh in out  : recadre la caisse du studio (720x440) et l'agrandit x2
sips -c 250 380 --cropOffset 110 170 "$1" --out "$2" >/dev/null && sips -z 500 760 "$2" --out "$2" >/dev/null
