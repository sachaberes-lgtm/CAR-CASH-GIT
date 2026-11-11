#!/usr/bin/env python3
# LE STUDIO LUMIÈRE (2026-11-10) — essayer des réglages d'ambiance sur LA MÊME IMAGE FIGÉE du vrai jeu (chemin iPhone par défaut).
#
#   python3 outils/banc-lumiere/studio.py nuages:midi essais.json [secondes avant de figer, défaut 9]
#
# essais.json = {"nom de l'essai": {champ d'ambiance: valeur, …}, …} ; l'essai "avant" (l'ambiance telle quelle) est toujours ajouté en tête.
# Un champ préfixé par « * » MULTIPLIE la valeur de base (nombre ou triplet) : {"*sunI": 1.2}. Les champs sont ceux de BIOMES (dbgAmb).
# Sortie : sorties/studio/<carte>-<meteo>/<essai>.jpg + planche.jpg (tous les essais côte à côte) + mesures.json (L*, chroma, route, ciel).
# Env : TEL=portrait (défaut) | paysage | ordi ; PARAMS ; PH / PC (ports).
import os, sys, json, time, base64, subprocess, tempfile, shutil, urllib.request
os.environ.setdefault('TEL', 'portrait')
if os.environ['TEL'] == 'ordi': os.environ['TEL'] = ''
ICI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, ICI)
import photos as P
from PIL import Image, ImageDraw

def main():
    carte, meteo = sys.argv[1].split(':'); essais = json.load(open(sys.argv[2])); T = float(sys.argv[3]) if len(sys.argv) > 3 else 9
    out = os.path.join(os.environ.get('OUT', os.path.join(ICI, 'sorties', 'studio')), '%s-%s' % (carte, meteo)); os.makedirs(out, exist_ok=True)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(P.PORT_HTTP), '--bind', '127.0.0.1'], cwd=P.JEU, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    prof = tempfile.mkdtemp(prefix='studio-chrome-')
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
        mt, _, te = meteo.partition('-')
        if not te and carte == 'ville': te = 'violet'
        c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/index.html?colonne=0&simu=1&garde=1&carte=%s&meteo=%s%s%s' % (P.PORT_HTTP, carte, mt, ('&teinte=' + te) if te else '', os.environ.get('PARAMS', ''))})
        for _ in range(120):
            time.sleep(.5)
            if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
        time.sleep(1.5); c.ev("document.querySelector('[data-m=\"play\"]').click()")
        for _ in range(120):
            time.sleep(.5)
            if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
        c.ev("dbgAuto(1,0,{gl:%s})" % ('true' if carte == 'banquise' else 'false'))
        time.sleep(T)
        nom = c.ev("dbgCielObj().BIO.name"); c.ev("dbgDA({fige:1})"); c.ev(P.CACHE); time.sleep(.4)
        if os.environ.get('JS'): print('JS →', c.ev(os.environ['JS']), flush=True)  # une sonde avant tout réglage
        base = json.loads(c.ev("JSON.stringify(dbgAmb(%s))" % json.dumps(nom)))
        json.dump(base, open(os.path.join(out, 'base.json'), 'w'), indent=0)
        tous = [('avant', {})] + [(k, v) for k, v in essais.items()]; mes = {}; ims = []
        for k, v in tous:
            r = {}
            arc = v.get('@arc'); v = {f: x for f, x in v.items() if f != '@arc'}  # '@arc' : les réglages du ciel photo des nuages (CIEL_ARC, via dbgCielArc) — à redonner en entier dans chaque essai
            for f, val in v.items():
                if f[0] == '*':
                    b = base.get(f[1:]); r[f[1:]] = [x * val for x in b] if isinstance(b, list) and not isinstance(val, list) else [x * y for x, y in zip(b, val)] if isinstance(b, list) else b * val
                else: r[f] = val
            c.ev("dbgAmb(%s,%s)" % (json.dumps(nom), json.dumps(base))); c.ev("dbgAmb(%s,%s)" % (json.dumps(nom), json.dumps(r)))
            if arc: c.ev("dbgCielArc(undefined,%s)" % json.dumps(arc))
            c.ev("dbgDA({degele:1});dbgStep(%d,17);dbgDA({fige:1})" % int(os.environ.get("PAS", 4))); c.ev(P.CACHE); time.sleep(.35)  # la brume, la mer et le ciel sont posés par la boucle : quelques images de 1 ms, d'un seul trait (la caisse ne bouge pas)
            d = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 90})['data']
            f = os.path.join(out, k + '.jpg'); open(f, 'wb').write(base64.b64decode(d)); ims.append((k, f))
            try: m = json.loads(c.ev(P.MESURE + '(' + json.dumps(d) + ')')); mes[k] = {'L': round(m['L'], 1), 'C': round(m['C'], 1), 'route': round(m['route']['L'], 1), 'ciel': round(m['ciel']['L'], 1), 'noirBas': round(m['noirBas'], 2)}
            except Exception as e: mes[k] = str(e)
            print(k, mes[k], flush=True)
        json.dump({'ambiance': nom, 'mesures': mes, 'essais': essais}, open(os.path.join(out, 'mesures.json'), 'w'), indent=1)
        i0 = Image.open(ims[0][1]); r = i0.height / i0.width; W = 330 if r > 1 else 640; H = int(W * r)
        pl = Image.new('RGB', (W * len(ims), H)); dr = ImageDraw.Draw(pl)
        for i, (k, f) in enumerate(ims):
            pl.paste(Image.open(f).resize((W, H)), (i * W, 0)); dr.rectangle((i * W, 0, i * W + 8 * len(k) + 10, 16), fill=(0, 0, 0)); dr.text((i * W + 5, 3), k, fill=(255, 255, 255))
        pl.save(os.path.join(out, 'planche.jpg'), quality=86); print(nom, os.path.join(out, 'planche.jpg'))
    finally:
        chrome.terminate(); srv.terminate(); shutil.rmtree(prof, ignore_errors=True)

if __name__ == '__main__': main()
