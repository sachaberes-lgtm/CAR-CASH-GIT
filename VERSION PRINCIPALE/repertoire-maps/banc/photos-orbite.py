#!/usr/bin/env python3
# BANC DE L'AGENT « EMBELLIR ORBITE » (jamais committé) — ports 9308 / 9508.
#   photos-orbite.py <tag> <météo>[:palier[:graine]] ...   → photos dans embellir-photos/orbite/<tag>-<météo>[-palierN].jpg + comptes
# Un chargement par scénario, JOUER, pilote auto, dbgStep jusqu'à N images, pause, photo + relevé de coût (une image rendue à la main).
import sys, os, json, time, base64, subprocess, tempfile, shutil, importlib.util, urllib.request

ICI = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('ph', os.path.join(ICI, 'photos.py'))
ph = importlib.util.module_from_spec(spec); spec.loader.exec_module(ph)
PORT_HTTP, PORT_CDP = 9308, 9508
JEU = ph.JEU
SORTIE = '/Users/sachaberes/cash-car/embellir-photos/orbite'
SAVE = dict(ph.SAVE); SAVE['plq'] = {'m': 'fr', 'x': 'CC-161-RZ', 'ok': 1}
STEPS = int(os.environ.get('STEPS', '420'))

COUT = """(function(){var R=dbgScene().rdr,I=R.info;I.autoReset=false;I.reset();
 try{if(typeof POST_ON!=='undefined'&&0){}}catch(e){}
 R.render(dbgScene().scene,dbgScene().cam);var o={appels:I.render.calls,triangles:I.render.triangles,programmes:I.programs?I.programs.length:null,textures:I.memory.textures,geometries:I.memory.geometries};
 I.autoReset=true;return JSON.stringify(o);})()"""

def libre(port):
    r = subprocess.run(['lsof', '-iTCP:%d' % port, '-sTCP:LISTEN'], capture_output=True, text=True)
    return not r.stdout.strip()

def main():
    tag = sys.argv[1]; cas = sys.argv[2:]
    os.makedirs(SORTIE, exist_ok=True)
    if not (libre(PORT_HTTP) and libre(PORT_CDP)):
        print('ports pris'); return
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT_HTTP), '--bind', '127.0.0.1'], cwd=JEU,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    prof = tempfile.mkdtemp(prefix='orbite-chrome-')
    chrome = subprocess.Popen(['nice', '-n', '10', ph.CHROME, '--headless=new', '--remote-debugging-port=%d' % PORT_CDP, '--user-data-dir=' + prof,
                               '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    try:
        for _ in range(60):
            time.sleep(1)
            try: urllib.request.urlopen('http://127.0.0.1:%d/json' % PORT_CDP, timeout=3); break
            except Exception: pass
        for c1 in cas:
            p = c1.split(':'); meteo = p[0]; pal = p[1] if len(p) > 1 and p[1] != '' else '2'; graine = p[2] if len(p) > 2 else '12345'
            extra = os.environ.get('EVAL', '')
            c = ph.CDP(PORT_CDP); c.s.settimeout(120)
            c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
            c.send('Page.enable')
            c.send('Browser.setWindowBounds', {'windowId': c.send('Browser.getWindowForTarget', {'targetId': c.tab['id']})['windowId'], 'bounds': {'width': 1280, 'height': 720}})
            W, H = (int(x) for x in os.environ.get('VUE', '1280x720').split('x'))
            c.send('Emulation.setDeviceMetricsOverride', {'width': W, 'height': H, 'deviceScaleFactor': 1, 'mobile': False})
            c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(SAVE))})
            url = 'http://127.0.0.1:%d/index.html?colonne=0&simu=1&carte=espace&meteo=%s&pistegraine=%s&palier=%s' % (PORT_HTTP, meteo, graine, pal)
            t0 = time.time()
            c.send('Page.navigate', {'url': url})
            for _ in range(240):
                time.sleep(.5)
                if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
            time.sleep(1)
            c.ev("document.querySelector('[data-m=\"play\"]').click()")
            for _ in range(240):
                time.sleep(.5)
                if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
            c.ev("dbgAuto(1,0,{gl:false})")
            c.ev("dbgStep(%d,16)" % STEPS)
            c.ev("dbgOrbite('rendu')")
            vues = os.environ.get('VUES')
            if vues:
                for v in json.loads(vues):
                    nm = v.pop('nom')
                    d = c.ev("dbgBeau('photo',%s)" % json.dumps(v))
                    if d and d.startswith('data:'):
                        open(os.path.join(SORTIE, '%s-%s-%s.jpg' % (tag, meteo, nm)), 'wb').write(base64.b64decode(d.split(',', 1)[1]))
                print('vues', meteo, 'ok', c.ev("JSON.stringify(dbgBeau())"), flush=True)
            st = c.ev("JSON.stringify(dbgState())")
            if extra: print('EVAL ->', c.ev(extra))
            c.ev(ph.CACHE); time.sleep(.5)
            r = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 90})
            nom = '%s-%s%s.jpg' % (tag, meteo, '' if pal == '2' else '-palier' + pal)
            open(os.path.join(SORTIE, nom), 'wb').write(base64.b64decode(r['data']))
            cout = c.ev(COUT)
            err = c.ev("JSON.stringify({loop:window.__loopErr||null,banq:window.__banqErr||null})")
            print(nom, 'cout', cout, 'err', err, 'etat', (st or '')[:160], '%.0fs' % (time.time() - t0), flush=True)
            c.s.close()
    finally:
        for pr in (chrome, srv):
            try: os.killpg(pr.pid, 15)
            except Exception: pass
        shutil.rmtree(prof, ignore_errors=True)

main()
