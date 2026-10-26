#!/usr/bin/env python3
# banc Jade (embellir-jade) : UN passage sous verrou. usage : passage-jade.py <srv> <delai_s> <job>...   job = dossier:meteo:palier:vues   (vues séparées par ; — un nombre = dbgStep jusque là · J:... = dbgJadeVue(...))
import importlib.util, sys, os, json, time, subprocess, tempfile, shutil, base64, signal, urllib.request
spec = importlib.util.spec_from_file_location('ph', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'photos-jade.py'))
ph = importlib.util.module_from_spec(spec); spec.loader.exec_module(ph)
SRV, DELAI, JOBS = sys.argv[1], float(sys.argv[2]), sys.argv[3:]
FIN = time.time() + DELAI
OUT = '/Users/sachaberes/cash-car/embellir-photos/jade'
os.makedirs(OUT, exist_ok=True)
HOOK = """(function(){window.__errs=[];var oe=console.error;console.error=function(){try{window.__errs.push('E:'+Array.prototype.join.call(arguments,' ').slice(0,300));}catch(e){}return oe.apply(console,arguments);};
var ow=console.warn;console.warn=function(){try{window.__errs.push('W:'+Array.prototype.join.call(arguments,' ').slice(0,200));}catch(e){}return ow.apply(console,arguments);};
window.addEventListener('error',function(e){window.__errs.push('X:'+(e.message||'')+' '+(e.filename||'')+':'+(e.lineno||''));});
window.addEventListener('unhandledrejection',function(e){window.__errs.push('P:'+String(e.reason).slice(0,200));});})();"""
COMPTES = "(function(){var r=dbgScene().rdr;var o=dbgJadePoste('cout');var d=dbgJade();var n={};['montagnes','rochers','arbres','cristaux','cascades','brume','quartiers','L','merY','eauY','trempees','temples'].forEach(function(k){n[k]=d[k];});return JSON.stringify({s:Math.round(dbgState().s),cout:o,prog:r.info.programs.length,tex:r.info.memory.textures,geo:r.info.memory.geometries,n:n,err:(window.__errs||[]).slice(0,6),loopErr:String(window.__loopErr||''),jadeErr:String(window.__jadeErr||'')})})()"
PREUVE = "(function(){var o=[];[800,2000,3500,5000,6500].forEach(function(k){dbgJadeAller(k);o.push(dbgJadeVue('route',0,8).cam);});return JSON.stringify(o)})()"
def tuer(p):
    try: os.killpg(p.pid, signal.SIGTERM)
    except Exception: pass
    time.sleep(1)
    try: os.killpg(p.pid, signal.SIGKILL)
    except Exception: pass
srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(ph.PORT_HTTP), '--bind', '127.0.0.1'], cwd=SRV, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
prof = tempfile.mkdtemp(prefix='jade-chrome-')
chrome = subprocess.Popen(['nice', '-n', '10', ph.CHROME, '--headless=new', '--remote-debugging-port=%d' % ph.PORT_CDP, '--user-data-dir=' + prof,
                           '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
try:
    for _ in range(120):
        try:
            urllib.request.urlopen('http://127.0.0.1:%d/json' % ph.PORT_CDP); break
        except Exception: time.sleep(1)
    for job in JOBS:
        if time.time() > FIN: print('DELAI ATTEINT avant', job, flush=True); break
        dossier, meteo, pal, vues = job.split(':', 3)
        suf = '-palier%s' % pal if pal != '2' else ''
        c = ph.CDP(ph.PORT_CDP)
        c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
        c.send('Page.enable')
        win = c.send('Browser.getWindowForTarget', {'targetId': c.tab['id']})
        c.send('Browser.setWindowBounds', {'windowId': win['windowId'], 'bounds': {'width': 1280, 'height': 720}})
        c.send('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 720, 'deviceScaleFactor': 1, 'mobile': False})
        c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(ph.SAVE))})
        c.send('Page.addScriptToEvaluateOnNewDocument', {'source': HOOK})
        t0 = time.time()
        c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/%s/index.html?colonne=0&simu=1&carte=jade&meteo=%s&pistegraine=12345&palier=%s' % (ph.PORT_HTTP, dossier, meteo, pal)})
        for _ in range(300):
            time.sleep(.5)
            if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
        time.sleep(1.5)
        c.ev("document.querySelector('[data-m=\"play\"]').click()")
        for _ in range(300):
            time.sleep(.5)
            if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
        print(job, 'charge en %.0fs' % (time.time() - t0), flush=True)
        c.ev("dbgAuto(1,0,{})")
        done = 0
        for k, p in enumerate(vues.split(';')):
            if time.time() > FIN + 60: print('DELAI DEPASSE', flush=True); break
            if p.startswith('K:'):
                c.ev("dbgJadeAller(%s);dbgStep(3)" % p[2:]); c.ev("dbgJadeVue('route',0,8)"); time.sleep(.4); c.ev(ph.CACHE); time.sleep(.3); c.ev("dbgJadeVue('route',0,8)"); time.sleep(.3)
            elif p.startswith('J:'):
                c.ev("dbgJadeVue(%s)" % p[2:]); time.sleep(.4); c.ev(ph.CACHE); time.sleep(.3); c.ev("dbgJadeVue(%s)" % p[2:]); time.sleep(.3)
            else:
                n = int(p); c.ev("dbgStep(%d)" % (n - done)); done = n
                time.sleep(.3); c.ev(ph.CACHE); time.sleep(.3); c.ev("dbgStep(1)"); time.sleep(.3)
            r = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 88})
            nom = '%s-%s%s-v%d.jpg' % (dossier, meteo, suf, k)
            open(os.path.join(OUT, nom), 'wb').write(base64.b64decode(r['data']))
            c.ev("document.getElementById('cc-nu')&&(document.getElementById('cc-nu').textContent='')")
            print(nom, c.ev(COMPTES), flush=True)
        print('PREUVE', job, c.ev(PREUVE), flush=True)
        c.s.close()
finally:
    tuer(chrome); tuer(srv); shutil.rmtree(prof, ignore_errors=True)
