#!/bin/sh
# CASH CAR — fabrique l'archive App Store (version Release, signée par l'équipe M532TDYCH2) et, SUR DEMANDE, l'envoie à Apple.
#   sh archiver.sh             www/ refait depuis VERSION PRINCIPALE, puis l'archive et le .ipa dans build/ — RIEN n'est envoyé
#   sh archiver.sh --envoyer   pareil, puis ENVOI à App Store Connect (la fiche de l'app doit y exister ; c'est le compte Apple
#                              enregistré dans Xcode qui signe et envoie). Le build apparaît dans TestFlight ~15 min plus tard.
# Avant un 2e envoi : monter le numéro de build (CURRENT_PROJECT_VERSION dans ios/App/App.xcodeproj, ou Xcode › App › General › Build).
# ⚠ Lourd pour le Mac (10 à 20 min, tous les cœurs) : à lancer machine calme.
set -e
cd "$(dirname "$0")"
DEST=export; [ "$1" = "--envoyer" ] && DEST=upload
B="$PWD/build"; ARCHIVE="$B/CASH-CAR.xcarchive"
npm run sync
rm -rf "$B"; mkdir -p "$B"
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' \
  -derivedDataPath "$B/DerivedData" -archivePath "$ARCHIVE" -allowProvisioningUpdates archive
cat > "$B/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>method</key><string>app-store-connect</string>
	<key>destination</key><string>$DEST</string>
	<key>teamID</key><string>M532TDYCH2</string>
	<key>signingStyle</key><string>automatic</string>
	<key>uploadSymbols</key><true/>
	<key>manageAppVersionAndBuildNumber</key><false/>
</dict>
</plist>
PLIST
xcodebuild -exportArchive -archivePath "$ARCHIVE" -exportOptionsPlist "$B/ExportOptions.plist" -exportPath "$B/ipa" -allowProvisioningUpdates
if [ "$DEST" = upload ]; then echo "✓ envoyé à App Store Connect — le build apparaît dans TestFlight d'ici un quart d'heure"
else echo "✓ archive : $ARCHIVE"; ls -lh "$B/ipa"/*.ipa 2>/dev/null || true; echo "  (rien n'a été envoyé — sh archiver.sh --envoyer pour l'envoi)"; fi
