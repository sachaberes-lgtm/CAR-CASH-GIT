#!/bin/bash
# CAR CASH — Public AI Edition
# Double-click to play locally: starts a tiny local web server and opens the game in your browser.
# (macOS may ask for confirmation the first time: right-click > Open.)
cd "$(dirname "$0")" || exit 1
if command -v python3 >/dev/null 2>&1; then
  for PORT in 8642 8643 8644 8645 8646; do
    if ! lsof -i ":$PORT" >/dev/null 2>&1; then
      python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
      SRV=$!
      sleep 1
      URL="http://localhost:$PORT/index.html"
      open "$URL"
      echo ""
      echo "  CAR CASH — Public AI Edition is running at $URL"
      echo "  Close this window (or press Ctrl+C) to stop it."
      echo ""
      trap 'kill $SRV 2>/dev/null' EXIT INT TERM
      wait $SRV
      exit 0
    fi
  done
fi
# no python3 (or no free port): the game also runs straight from the file
open "index.html"
