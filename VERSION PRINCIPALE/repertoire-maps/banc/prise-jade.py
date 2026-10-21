#!/usr/bin/env python3
# banc Jade (embellir-jade) : prises DETERMINISTES (dbgStep) + comptes. usage : prise-jade.py <dossierJeu> <prefixe> <meteo>[,<meteo>...] [palier=2] [pas=450] [vues=1]
import importlib.util, sys, os, json, time, subprocess, tempfile, shutil, base64
spec = importlib.util.spec_from_file_location('ph', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'photos-jade.py'))
ph = importlib.util.module_from_spec(spec); spec.loader.exec_module(ph)
JEU, PRE, METEOS = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
PAL = sys.argv[4] if len(sys.argv) > 4 else '2'
PAS = [x for x in (sys.argv[5] if len(sys.argv) > 5 else '450').split(';')]
EXTRA = sys.argv[6] if len(sys.argv) > 6 else ''
OUT = '/Users/sachaberes/cash-car/embellir-photos/jade'
os.makedirs(OUT, exist_ok=True)
HOOK = """(function(){window.__errs=[];var oe=console.error;console.error=function(){try{window.__errs.push('E:'+Array.prototype.join.call(arguments,' ').slice(0,200));}catch(e){}return oe.apply(console,arguments);};
window.addEventListener('error',function(e){window.__errs.push('X:'+(e.message||'')+' '+(e.filename||'')+':'+(e.lineno||''));});
window.addEventListener('unhandledrejection',function(e){window.__errs.push('P:'+String(e.reason).slice(0,200));});})();"""
srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(ph.PORT_HTTP), '--bind', '127.0.0.1'], cwd=JEU, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
prof = tempfile.mkdtemp(prefix='jade-chrome-')
chrome = subprocess.Popen(['nice', '-n', '10', ph.CHROME, '--headless=new', '--remote-debugging-port=%d' % ph.PORT_CDP, '--user-data-dir=' + prof,
                           '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    import urllib.request
    for _ in range(120):
        try:
            urllib.request.urlopen('http://127.0.0.1:%d/json' % ph.PORT_CDP); break
        except Exception: time.sleep(1)
    for meteo in METEOS:
        c = ph.CDP(ph.PORT_CDP)
        c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
        c.send('Page.enable')
        win = c.send('Browser.getWindowForTarget', {'targetId': c.tab['id']})
        c.send('Browser.setWindowBounds', {'windowId': win['windowId'], 'bounds': {'width': 1280, 'height': 720}})
        c.send('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 720, 'deviceScaleFactor': 1, 'mobile': False})
        c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(ph.SAVE))})
        c.send('Page.addScriptToEvaluateOnNewDocument', {'source': HOOK})
        t0 = time.time()
        c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/index.html?colonne=0&simu=1&carte=jade&meteo=%s&pistegraine=12345&palier=%s%s' % (ph.PORT_HTTP, meteo, PAL, EXTRA)})
        for _ in range(400):
            time.sleep(.5)
            if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
        time.sleep(1.5)
        c.ev("document.querySelector('[data-m=\"play\"]').click()")
        for _ in range(400):
            time.sleep(.5)
            if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
        print(meteo, 'charge en %.0fs' % (time.time() - t0), flush=True)
        c.ev("dbgAuto(1,0,{})")
        done = 0
        for k, p in enumerate(PAS):
            if p.startswith('J:'):
                c.ev("dbgJadeVue(%s)" % p[2:]); time.sleep(.5); c.ev(ph.CACHE); time.sleep(.4); c.ev("dbgJadeVue(%s)" % p[2:]); time.sleep(.4)
            else:
                n = int(p); c.ev("dbgStep(%d)" % (n - done)); done = n
                time.sleep(.5)
                c.ev(ph.CACHE); time.sleep(.4)
                c.ev("dbgStep(1)"); time.sleep(.4)
            r = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 88})
            nom = '%s-%s%s.jpg' % (PRE, meteo, ('-v%d' % k) if len(PAS) > 1 else '')
            open(os.path.join(OUT, nom), 'wb').write(base64.b64decode(r['data']))
            c.ev("document.getElementById('cc-nu').textContent=''")
            cnt = c.ev("(function(){var r=dbgScene().rdr;var o=dbgJadePoste('cout');return JSON.stringify({s:Math.round(dbgState().s),cout:o,prog:r.info.programs.length,tex:r.info.memory.textures,geo:r.info.memory.geometries,err:(window.__errs||[]).slice(0,5),loopErr:String(window.__loopErr||''),jadeErr:String(window.__jadeErr||'')})})()")
            print(nom, cnt, flush=True)
        c.s.close()
finally:
    chrome.terminate(); srv.terminate(); shutil.rmtree(prof, ignore_errors=True)
