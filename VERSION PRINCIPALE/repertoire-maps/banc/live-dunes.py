#!/usr/bin/env python3
# BANC VIVANT DES DUNES (jamais committé ; ports 9311 / 9511) : un Chrome qui reste ouvert, des commandes qui s'y branchent.
#   live-dunes.py mkdev                  → fabrique $DEV (liens vers VERSION PRINCIPALE + index.html assemblé + window.__ev)
#   live-dunes.py start <meteo> [palier] → serveur + Chrome + page + JOUER + pilote, puis la course est mise en pause
#   live-dunes.py ev '<js>'              → évalue dans la page ; __ev("<js>") dans la fermeture du jeu
#   live-dunes.py hot                    → relit les shaders des dunes dans code/maps/dunes-2.js et les recompile sur place
#   live-dunes.py shot <nom> '<js>'      → js (rend le cadre) puis toDataURL → OUT/<nom>.jpg
#   live-dunes.py stop
import json, os, sys, re, time, base64, subprocess, tempfile, urllib.request, importlib.util, shutil
ICI = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('ph', os.path.join(ICI, 'photos.py')); ph = importlib.util.module_from_spec(spec); spec.loader.exec_module(ph)
JEU = os.path.dirname(os.path.dirname(ICI))
WT = os.path.dirname(JEU)
SP = os.environ.get('SP', '/private/tmp/claude-501/-Users-sachaberes-cash-car-foret/5e162bcd-dd97-4a13-bd87-7ab4d41f7cff/scratchpad')
DEV = os.path.join(SP, 'dunes-dev'); ETAT = os.path.join(SP, 'live-dunes.json')
OUT = os.environ.get('OUT', os.path.join(SP, 'live'))
PH, PC = 9311, 9511
SAVE = {'v': 2, 'sfx': False, 'mus': False, 'vox': False, 'tuto': 1, 'permis': 1, 'facile': 0, 'ex': {'runs': 5}, 'plq': {'m': 'fr', 'x': 'CC-161-RZ', 'ok': 1}}

def mkdev():
    os.makedirs(DEV, exist_ok=True)
    for f in os.listdir(JEU):
        if f == 'index.html': continue
        d = os.path.join(DEV, f)
        if os.path.lexists(d): os.remove(d)
        os.symlink(os.path.join(JEU, f), d)
    h = open(os.path.join(JEU, 'index.html'), encoding='utf-8').read()
    k = 'window.__gameReady=true; // la boucle part'
    assert k in h
    open(os.path.join(DEV, 'index.html'), 'w', encoding='utf-8').write(h.replace(k, 'window.__ev=function(__c9){return eval(__c9);};' + k, 1))
    print('dev ok', DEV)

def cdp():
    c = ph.CDP(PC); c.s.settimeout(240); return c

def start(meteo, pal=''):
    os.makedirs(OUT, exist_ok=True)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PH), '--bind', '127.0.0.1'], cwd=DEV, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    prof = tempfile.mkdtemp(prefix='dunes-live-')
    chrome = subprocess.Popen([ph.CHROME, '--headless=new', '--remote-debugging-port=%d' % PC, '--user-data-dir=' + prof, '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    json.dump({'srv': srv.pid, 'chrome': chrome.pid, 'prof': prof}, open(ETAT, 'w'))
    for _ in range(120):
        time.sleep(1)
        try: urllib.request.urlopen('http://127.0.0.1:%d/json' % PC, timeout=3); break
        except Exception: pass
    c = cdp()
    c.send('Page.enable'); c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
    c.send('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 720, 'deviceScaleFactor': 1, 'mobile': False})
    c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(SAVE))})
    c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/index.html?colonne=0&simu=1&carte=dunes&meteo=%s&pistegraine=12345%s' % (PH, meteo, ('&palier=' + pal) if pal else '')})
    for _ in range(400):
        time.sleep(.5)
        if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
    time.sleep(1.5)
    c.ev("document.querySelector('[data-m=\"play\"]').click()")
    for _ in range(400):
        time.sleep(.5)
        if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
    c.ev("dbgAuto(1,0)")
    print('prêt', c.ev("typeof __ev"), c.ev("JSON.stringify(dbgDunes().on)"))

def ev(js):
    c = cdp(); r = c.ev(js); print(json.dumps(r, ensure_ascii=False) if not isinstance(r, str) else r)

def hot():
    src = open(os.path.join(WT, 'code/maps/dunes-2.js'), encoding='utf-8').read()
    def arr(nom):
        m = re.search(r'const %s=(\[.*?\])\.join\(\'\\n\'\);' % nom, src, re.S)
        return m.group(1)
    fs, vs = arr('DN_FS'), arr('DN_VS')
    js = "(function(){DN.mat.fragmentShader=(%s).join('\\n');DN.mat.vertexShader=(%s).join('\\n');DN.mat.needsUpdate=true;return 'ok';})()" % (fs, vs)
    c = cdp(); print(c.ev('__ev(%s)' % json.dumps(js)))

def shot(nom, js):
    os.makedirs(OUT, exist_ok=True)
    c = cdp()
    r = c.ev("(function(){%s;return dbgScene().rdr.domElement.toDataURL('image/jpeg',0.9);})()" % js)
    if not r or not str(r).startswith('data:'): print('ratée'); return
    p = os.path.join(OUT, nom + '.jpg'); open(p, 'wb').write(base64.b64decode(r.split(',', 1)[1])); print(p)

def stop():
    try: e = json.load(open(ETAT))
    except Exception: return
    for k in ('chrome', 'srv'):
        try: os.killpg(e[k], 15)
        except Exception: pass
    shutil.rmtree(e.get('prof', ''), ignore_errors=True)
    print('arrêté')

if __name__ == '__main__':
    a = sys.argv[1:]
    {'mkdev': lambda: mkdev(), 'start': lambda: start(*a[1:3]), 'ev': lambda: ev(a[1]), 'hot': lambda: hot(), 'shot': lambda: shot(a[1], a[2]), 'stop': lambda: stop()}[a[0]]()
