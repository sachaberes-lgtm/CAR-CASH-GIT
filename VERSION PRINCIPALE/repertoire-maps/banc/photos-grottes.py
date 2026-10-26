#!/usr/bin/env python3
# BANC DES GROTTES (embellir-grottes, 2026-10-20) — jamais committé. Ports 9309 (HTTP) / 9509 (CDP).
#   python3 photos-grottes.py plan.json
# plan.json = {"out": "/dossier", "loads":[{"page":"index.html","query":"&pistegraine=12345","meteo":"matin","pret":true,
#    "steps":[{"js":"...","wait":1.0,"shot":"nom","log":"nom"}, ...]}]}
# Chaque chargement : index.html?colonne=0&simu=1&carte=grotte&meteo=<m><query> ; JOUER ; on attend la grotte finie (pret) ; puis les pas.
# "js" : évalué (résultat imprimé) ; "wait" : secondes ; "shot" : capture jpeg (HUD masqué) ; les erreurs console sont comptées et imprimées.
import socket, json, base64, os, struct, urllib.request, time, sys, subprocess, shutil, tempfile

ICI = os.path.dirname(os.path.abspath(__file__))
JEU = os.path.dirname(os.path.dirname(ICI))
PORT_HTTP, PORT_CDP = 9309, 9509
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
SAVE = {'v': 2, 'sfx': False, 'mus': False, 'vox': False, 'tuto': 1, 'permis': 1, 'facile': 0, 'ex': {'runs': 5}}

class CDP:
    def __init__(self, port):
        tabs = json.load(urllib.request.urlopen('http://127.0.0.1:%d/json' % port))
        tab = next((t for t in tabs if t.get('type') == 'page'), None)
        if tab is None:
            tab = json.load(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:%d/json/new?about:blank' % port, method='PUT')))
        self.tab = tab; self.errs = []
        hp = tab['webSocketDebuggerUrl'].split('//')[1].split('/', 1)
        host, p2 = hp[0].split(':')
        self.s = socket.create_connection((host, int(p2)))
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.send(('GET /%s HTTP/1.1\r\nHost: %s\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\n'
                     'Sec-WebSocket-Version: 13\r\n\r\n' % (hp[1], hp[0], key)).encode())
        buf = b''
        while b'\r\n\r\n' not in buf: buf += self.s.recv(4096)
        self.rest = buf.split(b'\r\n\r\n', 1)[1]; self.id = 0
    def _n(self, n):
        while len(self.rest) < n:
            d = self.s.recv(1 << 20)
            if not d: raise EOFError
            self.rest += d
        o, self.rest = self.rest[:n], self.rest[n:]; return o
    def _recv(self):
        msg = b''
        while True:
            h = self._n(2); ln = h[1] & 0x7f
            if ln == 126: ln = struct.unpack('>H', self._n(2))[0]
            elif ln == 127: ln = struct.unpack('>Q', self._n(8))[0]
            msg += self._n(ln)
            if h[0] & 0x80: return json.loads(msg)
    def send(self, method, params=None):
        self.id += 1; mid = self.id
        data = json.dumps({'id': mid, 'method': method, 'params': params or {}}).encode()
        mask = os.urandom(4); ln = len(data)
        hdr = bytes([0x81]) + (bytes([0x80 | ln]) if ln < 126 else bytes([0x80 | 126]) + struct.pack('>H', ln) if ln < 65536
                               else bytes([0x80 | 127]) + struct.pack('>Q', ln))
        self.s.send(hdr + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))
        while True:
            m = self._recv()
            if m.get('method') == 'Runtime.exceptionThrown':
                self.errs.append('EXC ' + json.dumps(m['params'].get('exceptionDetails', {}).get('exception', {}).get('description', m['params']))[:300])
            elif m.get('method') == 'Runtime.consoleAPICalled' and m['params'].get('type') in ('error', 'assert'):
                self.errs.append('CON ' + ' '.join(str(a.get('value', a.get('description', ''))) for a in m['params'].get('args', []))[:300])
            if m.get('id') == mid:
                if 'error' in m: raise RuntimeError(m['error'])
                return m.get('result', {})
    def ev(self, expr):
        r = self.send('Runtime.evaluate', {'expression': expr, 'awaitPromise': True, 'returnByValue': True})
        if 'exceptionDetails' in r:
            return 'EXC: ' + str(r['exceptionDetails'].get('exception', {}).get('description', r['exceptionDetails']))[:400]
        return r.get('result', {}).get('value')

CACHE = ("(function(){var g=null;document.querySelectorAll('body>canvas').forEach(function(x){if(!g||x.width*x.height>g.width*g.height)g=x;});"
         "g.id=g.id||'ccGL';var s=document.getElementById('cc-nu');if(!s){s=document.createElement('style');s.id='cc-nu';document.body.appendChild(s);}"
         "s.textContent='body>*:not(#'+g.id+'){opacity:0!important;transition:none!important}';})()")

def main():
    plan = json.load(open(sys.argv[1]))
    out = plan['out']; os.makedirs(out, exist_ok=True)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT_HTTP), '--bind', '127.0.0.1'], cwd=JEU,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    prof = tempfile.mkdtemp(prefix='grottes-chrome-')
    flags = plan.get('flags', [])
    chrome = subprocess.Popen(['nice', '-n', '10', CHROME, '--headless=new', '--remote-debugging-port=%d' % PORT_CDP, '--user-data-dir=' + prof,
                               '--mute-audio', '--no-first-run', '--window-size=1280,720'] + flags + ['about:blank'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    try:
        for _ in range(60):
            time.sleep(1)
            try:
                urllib.request.urlopen('http://127.0.0.1:%d/json' % PORT_CDP, timeout=2); break
            except Exception: pass
        for ld in plan['loads']:
            t0 = time.time()
            c = CDP(PORT_CDP)
            c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
            c.send('Page.enable'); c.send('Runtime.enable')
            win = c.send('Browser.getWindowForTarget', {'targetId': c.tab['id']})
            W, H = ld.get('w', 1280), ld.get('h', 720)
            c.send('Browser.setWindowBounds', {'windowId': win['windowId'], 'bounds': {'width': W, 'height': H}})
            c.send('Emulation.setDeviceMetricsOverride', {'width': W, 'height': H, 'deviceScaleFactor': 1, 'mobile': False})
            c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(SAVE))})
            url = 'http://127.0.0.1:%d/%s?colonne=0&simu=1&carte=grotte&meteo=%s%s' % (PORT_HTTP, ld.get('page', 'index.html'), ld['meteo'], ld.get('query', ''))
            c.send('Page.navigate', {'url': url})
            for _ in range(240):
                time.sleep(.5)
                if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')") is True: break
            time.sleep(1.5)
            c.ev("document.querySelector('[data-m=\"play\"]').click()")
            for _ in range(240):
                time.sleep(.5)
                if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()") is True: break
            if ld.get('pret', True):
                for _ in range(240):
                    time.sleep(.5)
                    g = c.ev("(function(){var g=dbgGrotte();return g&&g.pret&&g.file===0})()")
                    if g is True: break
            print('== charge', ld['meteo'], ld.get('page', 'index.html'), ld.get('query', ''), '%.0fs' % (time.time() - t0), flush=True)
            for st in ld['steps']:
                if 'js' in st:
                    r = c.ev(st['js'])
                    if st.get('log') is not None or r is not None: print('  [%s]' % st.get('log', ''), json.dumps(r)[:1500], flush=True)
                if st.get('wait'): time.sleep(st['wait'])
                if 'shot' in st:
                    c.ev(CACHE); time.sleep(.4)
                    r = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 90})
                    open(os.path.join(out, st['shot'] + '.jpg'), 'wb').write(base64.b64decode(r['data']))
                    c.ev("document.getElementById('cc-nu').textContent=''")
                    print('  photo', st['shot'], flush=True)
            print('  erreurs console:', len(c.errs), c.errs[:6], ' __loopErr:', c.ev('window.__loopErr') , flush=True)
            c.s.close()
            c2 = CDP(PORT_CDP); c2.send('Page.navigate', {'url': 'about:blank'}); c2.s.close()
    finally:
        for p9 in (chrome, srv):
            try: os.killpg(p9.pid, 15)
            except Exception: pass
        time.sleep(1)
        for p9 in (chrome, srv):
            try: os.killpg(p9.pid, 9)
            except Exception: pass
        shutil.rmtree(prof, ignore_errors=True)

if __name__ == '__main__':
    main()
