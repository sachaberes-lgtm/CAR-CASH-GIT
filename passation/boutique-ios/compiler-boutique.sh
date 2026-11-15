#!/bin/sh
# Build de l'app (jeu complet, comme compiler.sh) depuis le worktree boutique-ios, sans toucher au dossier de compilation de la session qualité.
#   sh compiler-boutique.sh <numéro>
set -e
N="$1"
W=/Users/sachaberes/cash-car/boutique-ios
DD=/Users/sachaberes/cash-car/boutique-ios-dd
mkdir -p "$DD"
cd "$W/app-ios"
[ -d node_modules ] || cp -Rc /Users/sachaberes/cash-car/finition-build/app-ios/node_modules ./node_modules
COMPLET=1 node preparer-www.js --maj http://127.0.0.1:1/ --qs "&perfrec=2"
npx cap sync ios
cd ios/App
xcodebuild -project App.xcodeproj -scheme App -configuration Debug -destination generic/platform=iOS -derivedDataPath "$DD/dd" -allowProvisioningUpdates CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=M532TDYCH2 CURRENT_PROJECT_VERSION="$N" build > "$DD/xcb-$N.log" 2>&1
tail -3 "$DD/xcb-$N.log"
rm -rf "$DD/build$N.app"
cp -Rc "$DD/dd/Build/Products/Debug-iphoneos/App.app" "$DD/build$N.app"
cd "$W" && git status --porcelain | grep -v '^??' | head -8
echo "BUILD $N PRÊT : $DD/build$N.app"
