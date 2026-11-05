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
JEU = os.path.expanduser('~/cash-car/couleurs/VERSION PRINCIPALE')
REP = os.path.join(JEU, 'repertoire-maps')
OUT = os.environ.get('OUT', ICI)
PORT_HTTP, PORT_CDP = int(os.environ.get('PH',9243)), int(os.environ.get('PC',9493))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
SAVE = {'v': 2, 'sfx': False, 'mus': False, 'vox': False, 'tuto': 1, 'permis': 1, 'facile': 0, 'ex': {'runs': 5}}
TEMPS = [5, 10, 15]

MESURE = """(function(b64){return new Promise(function(res){var im=new Image();im.onload=function(){var W=320,H=180,cv=document.createElement('canvas');cv.width=W;cv.height=H;var g=cv.getContext('2d');g.drawImage(im,0,0,W,H);var d=g.getImageData(0,0,W,H).data;
function lin(c){c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);}function Lst(y){return y<=.008856?903.3*y:116*Math.pow(y,1/3)-16;}
var n=0,sL=0,sL2=0,sS=0,sC=0,noirBas=0,nBas=0,zones={ciel:[0,0,0],route:[0,0,0],gauche:[0,0,0],droite:[0,0,0]},zn={ciel:0,route:0,gauche:0,droite:0},hist=new Array(10).fill(0),hue=new Array(12).fill(0);
for(var y=0;y<H;y++)for(var x=0;x<W;x++){var i=(y*W+x)*4,r=d[i],gg=d[i+1],b=d[i+2];var Y=.2126*lin(r)+.7152*lin(gg)+.0722*lin(b);var L=Lst(Y);var mx=Math.max(r,gg,b),mn=Math.min(r,gg,b);var S=mx?(mx-mn)/mx:0;var C=mx-mn;
n++;sL+=L;sL2+=L*L;sS+=S;sC+=C;hist[Math.min(9,Math.floor(L/10))]++;
if(C>24){var h;if(mx===r)h=((gg-b)/C+6)%6;else if(mx===gg)h=(b-r)/C+2;else h=(r-gg)/C+4;hue[Math.floor(h*2)%12]++;}
if(y>=H*2/3){nBas++;if(L<6)noirBas++;}
var z=null;if(y<H*.28&&x>W*.25&&x<W*.75)z='ciel';else if(y>H*.72&&x>W*.38&&x<W*.62)z='route';else if(y>H*.45&&x<W*.2)z='gauche';else if(y>H*.45&&x>W*.8)z='droite';
if(z){zones[z][0]+=L;zones[z][1]+=S;zones[z][2]+=C;zn[z]++;}}
var o={L:sL/n,Lsd:Math.sqrt(sL2/n-(sL/n)*(sL/n)),S:sS/n,C:sC/n,noirBas:noirBas/nBas,hist:hist.map(function(v){return v/n;}),hue:hue};for(var k in zones)o[k]={L:zones[k][0]/zn[k],S:zones[k][1]/zn[k],C:zones[k][2]/zn[k]};res(JSON.stringify(o));};im.src='data:image/jpeg;base64,'+b64;});})"""


class CDP:
    def __init__(self, port):
        tabs = json.load(urllib.request.urlopen('http://127.0.0.1:%d/json' % port))
        tab = next((t for t in tabs if t.get('type') == 'page'), None)
        if tab is None:
            tab = json.load(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:%d/json/new?about:blank' % port, method='PUT')))
        self.tab = tab
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
    out = os.path.join(OUT, 'img', '%s-%s.jpg' % (carte, meteo)); os.makedirs(os.path.dirname(out), exist_ok=True)
    try: subprocess.run(['sips', '-Z', '1120', '-s', 'format', 'jpeg', '-s', 'formatOptions', '62', prise, '--out', out], check=True, stdout=subprocess.DEVNULL)
    except Exception: shutil.copy(prise, out)

def version_du_jeu():  # le n° de cache du jeu (sw.js) : de quelle version est chaque photo
    try: return int(re.search(r"const CACHE = 'cashcar-v(\d+)'", open(os.path.join(JEU, 'sw.js'), encoding='utf-8').read()).group(1))
    except Exception: return None

def note_version(carte, meteo):  # img/versions.json : « crypto-midi » → 919 (la page signale les photos d'une version plus ancienne que le jeu)
    f = os.path.join(OUT, 'img', 'versions.json')
    try: V = json.load(open(f, encoding='utf-8'))
    except Exception: V = {}
    V['%s-%s' % (carte, meteo)] = version_du_jeu()
    json.dump(V, open(f, 'w', encoding='utf-8'), indent=1, sort_keys=True)

def couples_de(args):
    cartes = {}
    try:  # (2026-10-25) la liste vient du JEU (jeu_maps.py : SF_CARTES, SF_HORS, SF_FUSION), plus d'une liste écrite à la main
        sys.path.insert(0, REP)
        import jeu_maps
        for c in jeu_maps.lit(JEU)['cartes']: cartes[c['id']] = [m[0] for m in c['meteos']]
    except Exception:
        txt = open(os.path.join(REP, 'maps.js'), encoding='utf-8').read()
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
    prises = os.path.join(OUT, 'prises'); os.makedirs(prises, exist_ok=True); os.makedirs(os.path.join(OUT, 'etal'), exist_ok=True)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT_HTTP), '--bind', '127.0.0.1'], cwd=JEU,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    prof = tempfile.mkdtemp(prefix='repertoire-chrome-')
    chrome = subprocess.Popen([CHROME, '--headless=new', '--remote-debugging-port=%d' % PORT_CDP, '--user-data-dir=' + prof,
                               '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(180):
            time.sleep(1)
            try: urllib.request.urlopen('http://127.0.0.1:%d/json' % PORT_CDP); break
            except Exception: pass
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
            c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/index.html?colonne=0&simu=1&garde=1&carte=%s&meteo=%s%s%s' % (PORT_HTTP, carte, mt, ('&teinte=' + te) if te else '', os.environ.get('PARAMS', ''))})
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
                if k == 1:
                    try: mes = c.ev(MESURE + '(' + json.dumps(r['data']) + ')')
                    except Exception as e: mes = None; print('mesure ?', e)
                c.ev("document.getElementById('cc-nu').textContent=''")
            garde(os.path.join(prises, '%s-%s-1.jpg' % (carte, meteo)), carte, meteo)
            note_version(carte, meteo)
            try:
                et = c.ev("JSON.stringify({etal:dbgChaine().etal, niveau:dbgClassique().niveau, bio:(function(){var s=dbgCielObj();return {name:s.BIO.name, cur:s.BIO.cur};})()})")
                J = json.loads(et) if et else {}
                J['mesure'] = json.loads(mes) if mes else None
                open(os.path.join(OUT, 'etal', '%s-%s.json' % (carte, meteo)), 'w').write(json.dumps(J))
            except Exception as e: print('etal ?', e)
            print(carte, meteo, 'ok', c.ev("JSON.stringify(dbgClassique().niveau)"), flush=True)
            c.s.close()
    finally:
        chrome.terminate(); srv.terminate()
        shutil.rmtree(prof, ignore_errors=True)

if __name__ == '__main__':
    main()
