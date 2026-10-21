#!/bin/zsh
# ev.sh 'expr'  |  ev.sh -p nom 'expr renvoyant une data url'
if [ "$1" = "-p" ]; then curl -s -m 180 -X POST "http://127.0.0.1:9822/photo?f=$2" --data-binary "$3"; else curl -s -m 180 -X POST http://127.0.0.1:9822/ev --data-binary "$1"; fi; echo
