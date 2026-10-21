#!/bin/zsh
# fumee.sh nom largeur hauteur mobile(0/1) 'params' : charge, JOUER, attend la course, photo d'écran, erreurs
B=/Users/sachaberes/cash-car/neige-decor/.banc-neige; E=$B/ev.sh; C="http://127.0.0.1:9822"
cdp(){ curl -s -m 60 -X POST $C/cdp --data-binary "$1" >/dev/null; }
if [ "$4" = 1 ]; then cdp "{\"method\":\"Emulation.setDeviceMetricsOverride\",\"params\":{\"width\":$2,\"height\":$3,\"deviceScaleFactor\":2,\"mobile\":true,\"screenWidth\":$2,\"screenHeight\":$3}}"; cdp '{"method":"Emulation.setTouchEmulationEnabled","params":{"enabled":true,"maxTouchPoints":5}}'
else cdp "{\"method\":\"Emulation.setDeviceMetricsOverride\",\"params\":{\"width\":$2,\"height\":$3,\"deviceScaleFactor\":1,\"mobile\":false}}"; cdp '{"method":"Emulation.setTouchEmulationEnabled","params":{"enabled":false}}'; fi
curl -s -m 20 $C/erreurs >/dev/null
curl -s -m 300 "$C/charge?q=$5"; echo
W="(document.getElementById('colonne')&&document.getElementById('colonne').contentWindow)||window"
$E "(async()=>{const w=$W;for(let k=0;k<100;k++){const s=w.document.getElementById('splash');if(!s||getComputedStyle(s).display==='none'||getComputedStyle(s).opacity==='0')break;s.dispatchEvent(new w.PointerEvent('pointerdown',{bubbles:true}));s.click();await new Promise(r=>setTimeout(r,200));}const b=w.document.querySelector('[data-m=\"play\"]');if(b)b.click();for(let k=0;k<200;k++){if(w.document.body.classList.contains('play')){if(w.dbgAuto)w.dbgAuto(1,0,{gl:true});return 'course partie '+k;}await new Promise(r=>setTimeout(r,150));}return 'PAS de course : '+(b?'bouton ok':'pas de bouton');})()"
perl -e 'select(undef,undef,undef,6)'
$E "(()=>{const w=$W;return JSON.stringify({carte:w.dbgClassique&&w.dbgClassique().niveau&&w.dbgClassique().niveau.carte,mode:w.dbgState&&w.dbgState().started,banqErr:String(w.__banqErr||''),loopErr:String(w.__loopErr||''),banq:w.dbgBanq&&w.dbgBanq().on,taille:innerWidth+'x'+innerHeight,cadre:!!document.getElementById('colonne')});})()"
curl -s -m 60 -X POST $C/cdp --data-binary '{"method":"Page.captureScreenshot","params":{"format":"jpeg","quality":70}}' | python3 -c "import sys,json,base64;open('$B/photos/fumee-$1.jpg','wb').write(base64.b64decode(json.load(sys.stdin)['data']))"
echo "erreurs: $(curl -s -m 20 $C/erreurs)"
