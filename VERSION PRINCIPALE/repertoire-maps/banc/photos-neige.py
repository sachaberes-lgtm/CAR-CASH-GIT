#!/usr/bin/env python3
# LE BANC PHOTO DU RÉPERTOIRE DES MAPS (2026-10-15) — photographie les maps du JOUER dans le VRAI jeu, sans fenêtre et sans son.
#
#   python3 repertoire-maps/banc/photos.py volcan            → toutes les météos de la map « volcan » (celles de maps.js)
#   python3 repertoire-maps/banc/photos.py volcan:soir nuages:midi
#   python3 repertoire-maps/banc/photos.py --tout            → les 45 (≈ 30-45 s chacune)
#
# Lancer depuis « VERSION PRINCIPALE ». Pour chaque couple : un chargement de index.html?colonne=0&simu=1&carte=<id>&meteo=<m>
# (sauvegarde muette, auto-école passée), clic sur JOUER, pilote automatique (dbgAuto) au milieu de la route, trois prises à 5, 10 et
# 15 s, HUD masqué (seule la toile WebGL reste, transitions coupées). Les trois prises vont dans banc/prises/ (non commitées) ;
# celle de 10 s est recopiée en img/<id>-<m>.jpg. Si elle est moins belle (carte MOTEUR au-dessus de la caisse, virage serré), recopier
# à la main la prise 0 ou 2. Le serveur (port 9243) et le Chrome sans fenêtre (port 9493) sont lancés ici et ARRÊTÉS à la fin.
# Pas de dépendance : client CDP en Python pur (socket + WebSocket). ⚠ python3 de /usr/bin bloqué par la licence Xcode : prendre
# /Library/Developer/CommandLineTools/usr/bin/python3.
import socket, json, base64, os, struct, urllib.request, time, sys, subprocess, re, shutil, tempfile

ICI = os.path.dirname(os.path.abspath(__file__))
REP = os.path.dirname(ICI)                     # repertoire-maps/
JEU = os.path.dirname(REP)                     # VERSION PRINCIPALE/
PORT_HTTP, PORT_CDP = 9817, 9917
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
SAVE = {'v': 2, 'sfx': False, 'mus': False, 'vox': False, 'tuto': 1, 'permis': 1, 'facile': 0, 'ex': {'runs': 5}}
TEMPS = [3, 6, 9, 12, 15, 18, 22, 26, 30]

class CDP:
    def __init__(self, port):
        tabs = json.load(urllib.request.urlopen('http://127.0.0.1:%d/json' % port))
        tab = next((t for t in tabs if t.get('type') == 'page'), None)
        if tab is None:
            tab = json.load(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:%d/json/new?about:blank' % port, method='PUT')))
        self.tab = tab
        hp = tab['webSocketDebuggerUrl'].split('//')[1].split('/', 1)
        host, p2 = hp[0].split(':')
        self.s = socket.create_connection((host, int(p2))); self.s.settimeout(60)
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
            if m.get('id') == mid:
                if 'error' in m: raise RuntimeError(m['error'])
                return m.get('result', {})
    def ev(self, expr):
        r = self.send('Runtime.evaluate', {'expression': expr, 'awaitPromise': True, 'returnByValue': True})
        return None if 'exceptionDetails' in r else r.get('result', {}).get('value')

# toute la page sauf la toile WebGL du jeu (la plus grande toile, enfant direct de body), sans fondu
CACHE = ("(function(){var g=null;document.querySelectorAll('body>canvas').forEach(function(x){if(!g||x.width*x.height>g.width*g.height)g=x;});"
         "g.id=g.id||'ccGL';var s=document.getElementById('cc-nu');if(!s){s=document.createElement('style');s.id='cc-nu';document.body.appendChild(s);}"
         "s.textContent='body>*:not(#'+g.id+'){opacity:0!important;transition:none!important}';})()")

def garde(prise, carte, meteo):  # la prise retenue → img/, réduite à 1120 × 630 (sips de macOS ; sinon telle quelle)
    out = os.path.join(REP, 'img', '%s-%s.jpg' % (carte, meteo))
    try: subprocess.run(['sips', '-Z', '1120', '-s', 'format', 'jpeg', '-s', 'formatOptions', '62', prise, '--out', out], check=True, stdout=subprocess.DEVNULL)
    except Exception: shutil.copy(prise, out)

def couples_de(args):
    txt = open(os.path.join(REP, 'maps.js'), encoding='utf-8').read()
    cartes = {}
    for m in re.finditer(r"id:\s*'(\w+)'.*?meteos:\s*\[(.*?)\]\s*\}", txt, re.S):
        cartes[m.group(1)] = re.findall(r"\['([\w-]+)',", m.group(2))  # (2026-10-16) une clé peut porter sa TEINTE : « pluie-vert »
    out = []
    for a in (list(cartes) if args == ['--tout'] else args):
        if ':' in a: out.append(tuple(a.split(':', 1)))
        else: out += [(a, k) for k in cartes.get(a, [])]
    return out

def main():
    cp = couples_de(sys.argv[1:])
    if not cp: print(__doc__ or 'usage : photos.py <id>[:<météo>] … | --tout'); return
    prises = os.environ.get('PRISES', os.path.join(ICI, 'prises')); os.makedirs(prises, exist_ok=True)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT_HTTP), '--bind', '127.0.0.1'], cwd=JEU,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    prof = tempfile.mkdtemp(prefix='repertoire-chrome-')
    chrome = subprocess.Popen([CHROME, '--headless=new', '--remote-debugging-port=%d' % PORT_CDP, '--user-data-dir=' + prof,
                               '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        time.sleep(3)
        for carte, meteo in cp:
            c = CDP(PORT_CDP)
            c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
            c.send('Page.enable')
            win = c.send('Browser.getWindowForTarget', {'targetId': c.tab['id']})
            c.send('Browser.setWindowBounds', {'windowId': win['windowId'], 'bounds': {'width': 1280, 'height': 720}})
            c.send('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 720, 'deviceScaleFactor': 1, 'mobile': False})
            c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(SAVE))})
            mt, _, te = meteo.partition('-')  # (2026-10-16) « pluie-vert » = la météo pluie, la teinte verte ; LA VILLE sans teinte dite = la violette (celle de base)
            if not te and carte == 'ville': te = 'violet'
            c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/index.html?colonne=0&simu=1&carte=%s&meteo=%s%s' % (PORT_HTTP, carte, mt, ('&teinte=' + te) if te else '')})
            for _ in range(120):
                time.sleep(.5)
                if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
            time.sleep(1.5)
            c.ev("document.querySelector('[data-m=\"play\"]').click()")
            for _ in range(120):
                time.sleep(.5)
                if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
            c.ev("dbgAuto(1,0,{gl:%s})" % ('true' if carte == 'banquise' else 'false'))  # au GLACIER le pilote lit la glisse
            t1 = time.time()
            for k, t in enumerate(TEMPS):
                while time.time() - t1 < t: time.sleep(.2)
                c.ev(CACHE); time.sleep(.3)
                r = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 86})
                open(os.path.join(prises, '%s-%s-%d.jpg' % (carte, meteo, k)), 'wb').write(base64.b64decode(r['data']))
                c.ev("document.getElementById('cc-nu').textContent=''")
            print(carte, meteo, 'ok', c.ev("JSON.stringify(dbgClassique().niveau)"), flush=True)
            c.s.close()
    finally:
        chrome.terminate(); srv.terminate()
        shutil.rmtree(prof, ignore_errors=True)

if __name__ == '__main__':
    main()
