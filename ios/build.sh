#!/usr/bin/env bash
# build.sh — synchronise le web, compile et installe l'app Capacitor sur l'iPhone connecté.
#
# Usage   : build.sh <chemin-du-dossier-www>      (ex. ~/ios-build/probe/www)
# Env opt : IOS_TEAM_ID  (identifiant de la Personal Team ; sinon pris dans le projet Xcode)
#
# Sortie  : 0 = succès · 2 = usage/chemin · 3 = aucun appareil · 4 = échec build/install
set -euo pipefail

WEB_DIR="${1:-}"
if [ -z "$WEB_DIR" ]; then
  echo "Usage : build.sh <chemin-du-dossier-www>" >&2
  exit 2
fi
if [ ! -d "$WEB_DIR" ]; then
  echo "erreur : dossier web introuvable : $WEB_DIR" >&2
  exit 2
fi

# Racine du projet Capacitor = parent de www/
PROJECT_DIR="$(cd "$(dirname "$WEB_DIR")" && pwd)"
if [ ! -f "$PROJECT_DIR/capacitor.config.json" ]; then
  echo "erreur : 'capacitor.config.json' absent dans $PROJECT_DIR" >&2
  echo "  → passez le dossier www/ d'un projet Capacitor." >&2
  exit 2
fi

IOS_PROJ="$PROJECT_DIR/ios/App/App.xcodeproj"
if [ ! -d "$IOS_PROJ" ]; then
  echo "erreur : projet iOS absent : $IOS_PROJ  (lancez 'npx cap add ios' d'abord)" >&2
  exit 2
fi
SCHEME="App"

# ── 1. appareil connecté ? ────────────────────────────────────────────
DEVLIST="$(xcrun devicectl list devices 2>&1 || true)"
if echo "$DEVLIST" | grep -qiE 'no devices found|^[[:space:]]*$'; then
  echo "erreur : aucun iPhone connecté (devicectl ne voit aucun appareil)." >&2
  echo "  → branchez l'iPhone en USB, déverrouillez-le, acceptez « Faire confiance »." >&2
  exit 3
fi
UDID="$(echo "$DEVLIST" | grep -oE '\b[0-9A-Fa-f]{8}-[0-9A-Fa-f]{16}\b' | head -1)"
if [ -z "$UDID" ]; then
  echo "erreur : impossible de déterminer l'identifiant (UDID) de l'appareil." >&2
  exit 3
fi
echo "→ appareil : $UDID"

# ── 2. synchroniser le web ────────────────────────────────────────────
echo "→ npx cap sync ios …"
( cd "$PROJECT_DIR" && npx cap sync ios )

# ── 3. compiler (device, signature automatique) ───────────────────────
echo "→ xcodebuild (device, signature auto) …"
DERIVED="$PROJECT_DIR/ios/build"
BUILD_ARGS=( -project "$IOS_PROJ" -scheme "$SCHEME"
             -configuration Debug -sdk iphoneos
             -destination 'generic/platform=iOS'
             -derivedDataPath "$DERIVED"
             -allowProvisioningUpdates )
if [ -n "${IOS_TEAM_ID:-}" ]; then
  BUILD_ARGS+=( "DEVELOPMENT_TEAM=$IOS_TEAM_ID" )
fi
xcodebuild "${BUILD_ARGS[@]}" build

# ── 4. localiser le .app et installer ─────────────────────────────────
APP_PATH="$(find "$DERIVED/Build/Products/Debug-iphoneos" -maxdepth 1 -name '*.app' -print -quit 2>/dev/null)"
if [ -z "$APP_PATH" ] || [ ! -d "$APP_PATH" ]; then
  echo "erreur : bundle .app introuvable après le build" >&2
  exit 4
fi
echo "→ installation : $(basename "$APP_PATH")"
xcrun devicectl device install app --device "$UDID" "$APP_PATH"

echo "✓ installé sur $UDID"
