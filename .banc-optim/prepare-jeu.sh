#!/bin/zsh
# prepare-jeu.sh <VERSION PRINCIPALE> : fabrique CC JEU = le jeu à jouer À LA MAIN, sans mode banc, avec la sauvegarde de Sacha (copiée une fois) et l'enregistreur de parties allumé (ccPerfRecOn). N'écrase PAS CASH CAR ni CC BANC.
set -e
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim; A=$B/app-banc; VP="${1:-/Users/sachaberes/cash-car/mobile-perf/VERSION PRINCIPALE}"
rm -rf $A/www
node $A/preparer-www.js --essai "$VP" --sortie "$A/www" | tail -1
node -e '
const fs=require("fs");const b=JSON.parse(JSON.parse(fs.readFileSync(process.argv[1],"utf8")));
fs.writeFileSync(process.argv[2]+"/jeu-sauv.js","(function(){try{if(!localStorage.getItem(\"cashcarSave\"))localStorage.setItem(\"cashcarSave\","+JSON.stringify(b.ls)+");localStorage.setItem(\"ccPerfRecOn\",\"1\");}catch(e){}})();\n");
const p=process.argv[2]+"/index.html";let h=fs.readFileSync(p,"utf8");const m=h.match(/<script[^>]*src="natif\.js"[^>]*><\/script>/);
if(!m)throw new Error("natif.js introuvable");h=h.replace(m[0],m[0]+"<script src=\"jeu-sauv.js\"></script>");fs.writeFileSync(p,h);console.log("sauvegarde + enregistreur posés après",m[0]);' $B/sauvegarde-app-sacha.json $A/www
rm -rf $A/ios/App/App/public && cp -R $A/www $A/ios/App/App/public
/usr/libexec/PlistBuddy -c 'Set :CFBundleDisplayName CC JEU' $A/ios/App/App/Info.plist
cd $A/ios/App
restaure(){ /usr/libexec/PlistBuddy -c 'Set :CFBundleDisplayName CC BANC' $A/ios/App/App/Info.plist; }
trap restaure EXIT
xcodebuild -project App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -derivedDataPath ../../dd PRODUCT_BUNDLE_IDENTIFIER=com.sachaberes.carcash.jeu CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=M532TDYCH2 build > ../../build-jeu.log 2>&1 || { tail -20 ../../build-jeu.log; exit 1; }
echo "construit"
xcrun devicectl device install app --device 00008110-000621041468401E ../../dd/Build/Products/Release-iphoneos/App.app 2>&1 | grep -iE "installed|error" | head -3
echo "installé (CC JEU)"
