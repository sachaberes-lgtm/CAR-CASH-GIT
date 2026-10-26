#!/usr/bin/env python3
# BANC VIVANT DES GROTTES (jamais committé) : un Chrome qui reste ouvert (ports 9309/9509), on lui parle par petites commandes.
#   vivant-grottes.py start <page> <meteo> [query] · vivant-grottes.py ev "<js>" · vivant-grottes.py shot <chemin.jpg> · vivant-grottes.py stop
import sys, os, json, time, subprocess, tempfile, base64, urllib.request, importlib.util
ICI = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('pg', os.path.join(ICI, 'photos-grottes.py')); pg = importlib.util.module_from_spec(spec); spec.loader.exec_module(pg)
ETAT = os.path.join(ICI, '.vivant-grottes.json')
PLAY = """typeof dbgState==='function'&&!!document.querySelector('[data-m="play"]')"""
CLIC = """document.querySelector('[data-m="play"]').click()"""

def vivant():
    try:
        urllib.request.urlopen('http://127.0.0.1:%d/json' % pg.PORT_CDP, timeout=3); return True
    except Exception: return False

def start(page, meteo, query):
    if vivant():
        return charge(page, meteo, query)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(pg.PORT_HTTP), '--bind', '127.0.0.1'], cwd=pg.JEU, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    prof = tempfile.mkdtemp(prefix='grottes-chrome-')
    ch = subprocess.Popen(['nice', '-n', '10', pg.CHROME, '--headless=new', '--remote-debugging-port=%d' % pg.PORT_CDP, '--user-data-dir=' + prof, '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    json.dump({'srv': srv.pid, 'ch': ch.pid, 'prof': prof}, open(ETAT, 'w'))
    for _ in range(240):
        time.sleep(1)
        if vivant(): break
    charge(page, meteo, query)

def charge(page, meteo, query):
    c = pg.CDP(pg.PORT_CDP)
    c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True}); c.send('Page.enable'); c.send('Runtime.enable')
    win = c.send('Browser.getWindowForTarget', {'targetId': c.tab['id']})
    c.send('Browser.setWindowBounds', {'windowId': win['windowId'], 'bounds': {'width': 1280, 'height': 720}})
    c.send('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 720, 'deviceScaleFactor': 1, 'mobile': False})
    c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(pg.SAVE))})
    c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/%s?colonne=0&simu=1&carte=grotte&meteo=%s%s' % (pg.PORT_HTTP, page, meteo, query)})
    for _ in range(240):
        time.sleep(.5)
        if c.ev(PLAY) is True: break
    time.sleep(1.5); c.ev(CLIC)
    for _ in range(240):
        time.sleep(.5)
        if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()") is True: break
    for _ in range(240):
        time.sleep(.5)
        if c.ev("(function(){var g=dbgGrotte();return g&&g.pret&&g.file===0})()") is True: break
    print('pret', c.errs[:5])

def stop():
    try: e = json.load(open(ETAT))
    except Exception:
        print('rien'); return
    for k in ('ch', 'srv'):
        try: os.killpg(e[k], 15)
        except Exception: pass
    os.remove(ETAT)

def main():
    a = sys.argv[1:]
    if a[0] == 'start': start(a[1], a[2], a[3] if len(a) > 3 else '&pistegraine=12345')
    elif a[0] == 'stop': stop()
    else:
        c = pg.CDP(pg.PORT_CDP); c.send('Runtime.enable')
        if a[0] == 'ev':
            src = a[1]
            if src.startswith('@'): src = open(src[1:]).read()
            print(json.dumps(c.ev(src))[:8000]); print('errs', c.errs[:5])
        elif a[0] == 'shot':
            c.ev(pg.CACHE); time.sleep(.4)
            r = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 90}); open(a[1], 'wb').write(base64.b64decode(r['data']))
            c.ev("document.getElementById('cc-nu').textContent=''"); print('photo', a[1])

if __name__ == '__main__': main()
