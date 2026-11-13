#!/usr/bin/env python3
# LE BANC DES MAQUETTES D'AUTOROUTE (2026-11-13) — la même image figée du vrai jeu, peinte des quatre pistes (?autoroute=tout).
#
#   TEL=portrait python3 outils/banc-autoroute/maquettes.py nuages:midi [lat1,lat2,…]
#
# Pour chaque position latérale (m, défaut 0) : le pilote automatique y conduit, l'image se fige, puis une prise par piste
# (avant = la route d'aujourd'hui, A, B, C, D). Sortie : $OUT/<carte>-<meteo>/<lat>-<piste>.jpg (+ planche-<lat>.jpg).
# Prendre le verrou commun avant : ~/cash-car/verrou-banc.sh prendre <qui> … rendre.
import os, sys, json, time, base64, subprocess, tempfile, shutil, urllib.request
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'banc-lumiere'))
os.environ.setdefault('PH', '9263'); os.environ.setdefault('PC', '9513')
os.environ['PARAMS'] = os.environ.get('PARAMS', '') + '&autoroute=tout'
import photos as P
from PIL import Image, ImageDraw

PISTES = ['avant', 'A', 'B', 'C', 'D']

def main():
    carte, meteo = sys.argv[1].split(':'); lats = [float(x) for x in (sys.argv[2] if len(sys.argv) > 2 else '0').split(',')]
    T = float(os.environ.get('T', 6))
    out = os.path.join(os.environ.get('OUT', 'sorties'), '%s-%s' % (carte, meteo)); os.makedirs(out, exist_ok=True)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(P.PORT_HTTP), '--bind', '127.0.0.1'], cwd=P.JEU, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    prof = tempfile.mkdtemp(prefix='autoroute-chrome-')
    chrome = subprocess.Popen([P.CHROME, '--headless=new', '--remote-debugging-port=%d' % P.PORT_CDP, '--user-data-dir=' + prof, '--mute-audio', '--no-first-run',
                               '--window-size=1280,900', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(180):
            time.sleep(1)
            try: urllib.request.urlopen('http://127.0.0.1:%d/json' % P.PORT_CDP); break
            except Exception: pass
        c = P.CDP(P.PORT_CDP)
        c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True}); c.send('Page.enable')
        c.send('Emulation.setDeviceMetricsOverride', {'width': P.LW, 'height': P.LH, 'deviceScaleFactor': P.LD, 'mobile': P.LM})
        if P.TEL: c.send('Emulation.setTouchEmulationEnabled', {'enabled': True, 'maxTouchPoints': 5})
        c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(P.SAVE))})
        c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/index.html?colonne=0&simu=1&garde=1&carte=%s&meteo=%s%s' % (P.PORT_HTTP, carte, meteo, os.environ.get('PARAMS', ''))})
        for _ in range(120):
            time.sleep(.5)
            if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
        time.sleep(1.5); c.ev("document.querySelector('[data-m=\"play\"]').click()")
        for _ in range(120):
            time.sleep(.5)
            if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
        for li, lat in enumerate(lats):
            c.ev("dbgDA({degele:1});dbgAuto(1,%g,{gl:false})" % lat)
            time.sleep(T if li == 0 else float(os.environ.get('T2', 4)))
            c.ev("dbgDA({fige:1})"); c.ev(P.CACHE); time.sleep(.4)
            ims = []
            for k in PISTES:
                print(lat, k, c.ev("JSON.stringify(dbgAutoroute(%s))" % json.dumps('' if k == 'avant' else k)), flush=True)
                c.ev("dbgDA({degele:1});dbgStep(1,17);dbgDA({fige:1})"); c.ev(P.CACHE); time.sleep(.35)
                d = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 92})['data']
                f = os.path.join(out, '%g-%s.jpg' % (lat, k)); open(f, 'wb').write(base64.b64decode(d)); ims.append((k, f))
            i0 = Image.open(ims[0][1]); r = i0.height / i0.width; W = 330 if r > 1 else 640; H = int(W * r)
            pl = Image.new('RGB', (W * len(ims), H)); dr = ImageDraw.Draw(pl)
            for i, (k, f) in enumerate(ims):
                pl.paste(Image.open(f).resize((W, H)), (i * W, 0)); dr.rectangle((i * W, 0, i * W + 8 * len(k) + 10, 16), fill=(0, 0, 0)); dr.text((i * W + 5, 3), k, fill=(255, 255, 255))
            pl.save(os.path.join(out, 'planche-%g.jpg' % lat), quality=86); print(os.path.join(out, 'planche-%g.jpg' % lat), flush=True)
    finally:
        try: chrome.terminate(); chrome.wait(5)
        except Exception: chrome.kill()
        srv.terminate(); shutil.rmtree(prof, ignore_errors=True)

if __name__ == '__main__': main()
