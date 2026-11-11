#!/usr/bin/env python3
# LE BANC DES PHARES (2026-11-11) — la même image figée du vrai jeu, plusieurs réglages des phares côte à côte.
#
#   python3 outils/banc-lumiere/phares.py grotte:nuit essais.json [secondes avant de figer, défaut 9]
#
# essais.json = {"nom": "du JavaScript à évaluer avant la prise (dbgLum({...}), …)", …} ; l'essai "tel quel" est toujours en tête.
# Sortie : sorties/phares/<carte>-<meteo>/<essai>.jpg + planche.jpg + etat.json (dbgLum() de chaque essai, sans les tableaux).
# Env : TEL=portrait | paysage | (vide = ordi 1280 × 720) ; PARAMS ; PH / PC (ports) ; PAS (images rejouées entre deux essais, défaut 4).
import os, sys, json, time, base64, subprocess, tempfile, shutil, urllib.request
ICI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, ICI)
os.environ.setdefault('PH', '9247'); os.environ.setdefault('PC', '9497')
import photos as P
from PIL import Image, ImageDraw

ETAT = "(function(){var d=dbgLum();return JSON.stringify({nuit:d.nuit,phares:d.phares,route:d.route,halo:d.halo,ph:d.ph,uHlC:d.uHlC,spot:d.spot,hlB:d.hlB})})()"

def main():
    carte, meteo = sys.argv[1].split(':'); essais = json.load(open(sys.argv[2])); T = float(sys.argv[3]) if len(sys.argv) > 3 else 9
    out = os.path.join(os.environ.get('OUT', os.path.join(ICI, 'sorties', 'phares')), '%s-%s' % (carte, meteo)); os.makedirs(out, exist_ok=True)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(P.PORT_HTTP), '--bind', '127.0.0.1'], cwd=P.JEU, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    prof = tempfile.mkdtemp(prefix='phares-chrome-')
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
        c.ev("dbgAuto(1,0,{gl:false})")
        time.sleep(T)
        c.ev("dbgDA({fige:1})"); c.ev(P.CACHE); time.sleep(.4)
        tous = [('tel quel', '')] + list(essais.items()); ims = []; etat = {}
        for k, js in tous:
            if js: print(k, '→', c.ev(js), flush=True)
            c.ev("dbgDA({degele:1});dbgStep(%d,17);dbgDA({fige:1})" % int(os.environ.get('PAS', 4))); c.ev(P.CACHE); time.sleep(.35)
            d = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 90})['data']
            f = os.path.join(out, k.replace(' ', '-') + '.jpg'); open(f, 'wb').write(base64.b64decode(d)); ims.append((k, f))
            try: etat[k] = json.loads(c.ev(ETAT))
            except Exception as e: etat[k] = str(e)
            print(k, etat[k], flush=True)
        json.dump(etat, open(os.path.join(out, 'etat.json'), 'w'), indent=1)
        i0 = Image.open(ims[0][1]); r = i0.height / i0.width; W = 330 if r > 1 else 640; H = int(W * r)
        pl = Image.new('RGB', (W * len(ims), H)); dr = ImageDraw.Draw(pl)
        for i, (k, f) in enumerate(ims):
            pl.paste(Image.open(f).resize((W, H)), (i * W, 0)); dr.rectangle((i * W, 0, i * W + 8 * len(k) + 10, 16), fill=(0, 0, 0)); dr.text((i * W + 5, 3), k, fill=(255, 255, 255))
        pl.save(os.path.join(out, 'planche.jpg'), quality=86); print(os.path.join(out, 'planche.jpg'))
    finally:
        chrome.terminate(); srv.terminate(); shutil.rmtree(prof, ignore_errors=True)

if __name__ == '__main__': main()
