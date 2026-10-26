#!/bin/zsh
# prepare-banc.sh <dossier VERSION PRINCIPALE> : fabrique CC BANC (www de banc + mode banc autonome) et l'installe sur l'iPhone
set -e
export BANC_IP=$(ifconfig | awk '/inet 172\.20\.10\./{print $2; exit}')
echo "IP du Mac pour le banc : $BANC_IP"
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim; A=$B/app-banc; VP="${1:-/Users/sachaberes/cash-car/optim-mobile/VERSION PRINCIPALE}"
rm -rf $A/www
node $A/preparer-www.js --essai "$VP" --sortie "$A/www" | tail -1
node -e '
const fs=require("fs");const b=JSON.parse(JSON.parse(fs.readFileSync(process.argv[1],"utf8")));
const sv=JSON.parse(b.ls);sv.sfx=false;sv.mus=false;sv.vox=false;fs.writeFileSync(process.argv[2]+"/banc-sauv.js","window.__BANC_SAUV="+JSON.stringify(JSON.stringify(sv))+";window.__BANC_IP="+JSON.stringify(process.env.BANC_IP||"172.20.10.3")+";\n");
fs.copyFileSync(process.argv[3],process.argv[2]+"/banc-app.js");
const p=process.argv[2]+"/index.html";let h=fs.readFileSync(p,"utf8");const m=h.match(/<script[^>]*src="natif\.js"[^>]*><\/script>/);
if(!m)throw new Error("natif.js introuvable dans la page");h=h.replace(m[0],m[0]+"<script src=\"banc-sauv.js\"></script><script src=\"banc-app.js\"></script>");fs.writeFileSync(p,h);
console.log("mode banc posé après",m[0]);' $B/sauvegarde-app-sacha.json $A/www $B/banc-app.js
rm -rf $A/ios/App/App/public && cp -R $A/www $A/ios/App/App/public
/usr/libexec/PlistBuddy -c 'Delete :NSAppTransportSecurity' $A/ios/App/App/Info.plist 2>/dev/null || true
/usr/libexec/PlistBuddy -c 'Add :NSAppTransportSecurity dict' -c 'Add :NSAppTransportSecurity:NSAllowsArbitraryLoads bool true' -c 'Add :NSAppTransportSecurity:NSAllowsLocalNetworking bool true' $A/ios/App/App/Info.plist
/usr/libexec/PlistBuddy -c 'Delete :NSLocalNetworkUsageDescription' $A/ios/App/App/Info.plist 2>/dev/null || true; /usr/libexec/PlistBuddy -c 'Add :NSLocalNetworkUsageDescription string CC BANC envoie ses mesures au Mac de Sacha.' $A/ios/App/App/Info.plist
cd $A/ios/App
xcodebuild -project App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -derivedDataPath ../../dd PRODUCT_BUNDLE_IDENTIFIER=com.sachaberes.carcash.banc CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=M532TDYCH2 build > ../../build.log 2>&1 || { tail -20 ../../build.log; exit 1; }
echo "construit"
[ "$2" = "sans-installer" ] && { echo "pas installé"; exit 0; }
xcrun devicectl device install app --device 00008110-000621041468401E ../../dd/Build/Products/Release-iphoneos/App.app 2>&1 | grep -iE "installed|error" | head -3
echo "installé"
