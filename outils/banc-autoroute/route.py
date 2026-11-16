#!/usr/bin/env python3
# LE BANC DE L'AUTOROUTE VIVANTE (2026-11-13) — une vraie course, puis des prises le long du scénario de la route.
#
#   TEL=portrait python3 outils/banc-autoroute/route.py nuages:soir [n prises]
#
# Écrit dans $OUT/<carte>-<meteo>/ : scenario.json (dbgAutoroute()), profil.json (dbgAutoroute('profil',8)),
# NN-<s>-<événement>.jpg (la caisse placée juste avant chaque transition / au milieu de chaque palier), avant.jpg (?autoroute coupé, même image).
# Env : PARAMS (ex. &argraine=3), LAT (la latérale de la caisse, défaut 0), PH / PC. Prendre ~/cash-car/verrou-banc.sh avant.
import os, sys, json, time, base64, subprocess, tempfile, shutil, urllib.request
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'banc-lumiere'))
os.environ.setdefault('PH', '9265'); os.environ.setdefault('PC', '9515')
import photos as P

def main():
    carte, meteo = sys.argv[1].split(':'); n = int(sys.argv[2]) if len(sys.argv) > 2 else 8
    out = os.path.join(os.environ.get('OUT', 'sorties'), '%s-%s' % (carte, meteo)); os.makedirs(out, exist_ok=True)
    LAT = float(os.environ.get('LAT', 0))
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
        c.send('Runtime.enable')
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
        c.ev("dbgAuto(1,%g,{gl:false})" % LAT); time.sleep(3)
        print('erreurs :', c.ev("JSON.stringify((window.dbgErreurs&&dbgErreurs())||window.__loopErr||null)"), flush=True)
        sc = json.loads(c.ev("JSON.stringify(dbgAutoroute())")); json.dump(sc, open(os.path.join(out, 'scenario.json'), 'w'), indent=1)
        print('scénario :', json.dumps({k: sc.get(k) for k in ('carte', 'L', 'graine', 'stats', 'poteaux', 'or')}), flush=True)
        for g in sc.get('segments') or []: print('  ', g, flush=True)
        try: print('coût du dessin :', c.ev("JSON.stringify(dbgAutoroute('cout'))"), flush=True)
        except Exception as e: print('coût :', e)
        pr = c.ev("JSON.stringify(dbgAutoroute('profil',8))"); open(os.path.join(out, 'profil.json'), 'w').write(pr)
        segs = sc.get('segments') or []; L = sc.get('L') or 0; pos = []
        for g in segs[1:]:
            pos.append((g['s0'] + 30, g['ev']))
        for i, g in enumerate(segs):
            fin = segs[i + 1]['s0'] if i + 1 < len(segs) else L - 200
            if fin - g['s1'] > 700: pos.append(((g['s1'] + fin) // 2, 'palier-' + g['ev']))
        mods = sc.get('mods') or []; print('figures :', mods, flush=True)
        dansFig = lambda x: any(m[0] - 120 < x < m[1] + 40 for m in mods)
        pos.sort(); pos = [p for p in pos if 150 < p[0] < L - 250]
        if len(pos) > n: pos = [pos[round(i * (len(pos) - 1) / (n - 1))] for i in range(n)]
        # la caisse ROULE (pilote automatique) : on fige l'image quand elle passe à chaque abscisse voulue
        k = 0; t0 = time.time(); avant = False
        while k < len(pos) and time.time() - t0 < float(os.environ.get('DUREE', 240)):
            o = json.loads(c.ev("JSON.stringify(dbgAutoroute('ou'))"))
            if o.get('go'): print('  mort à', o.get('s'), '— arrêt', flush=True); break
            if o['s'] > L - 120: print('  fin de piste', flush=True); break
            if o['s'] >= pos[k][0]:
                sv, ev = pos[k]
                c.ev("dbgDA({fige:1})"); c.ev(P.CACHE); time.sleep(.4)
                d = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 90})['data']
                open(os.path.join(out, '%02d-%d-%s.jpg' % (k, o['s'], ev)), 'wb').write(base64.b64decode(d)); print(k, o['s'], ev, o['mode'], flush=True)
                if not avant:
                    c.ev("dbgAutoroute(0)"); c.ev("dbgDA({degele:1});dbgStep(1,17);dbgDA({fige:1})"); c.ev(P.CACHE); time.sleep(.35)
                    d = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 90})['data']; open(os.path.join(out, 'avant.jpg'), 'wb').write(base64.b64decode(d))
                    c.ev("dbgAutoroute(1)"); avant = True
                c.ev("dbgDA({degele:1})"); k += 1
                while k < len(pos) and pos[k][0] <= o['s'] + 30: k += 1
            time.sleep(.12)
        print('fini', out, flush=True)
    finally:
        try: chrome.terminate(); chrome.wait(5)
        except Exception: chrome.kill()
        srv.terminate(); shutil.rmtree(prof, ignore_errors=True)

if __name__ == '__main__': main()
