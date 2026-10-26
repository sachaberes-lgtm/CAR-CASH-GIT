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
PORT_HTTP, PORT_CDP = 9302, 9502
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
SAVE = {'v': 2, 'sfx': False, 'mus': False, 'vox': False, 'tuto': 1, 'permis': 1, 'facile': 0, 'ex': {'runs': 5}}
TEMPS = [5, 10, 15]

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
        self.rest = buf.split(b'\r\n\r\n', 1)[1]; self.id = 0; self.evs = []
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
            mm = m.get('method')
            if mm == 'Runtime.exceptionThrown': self.evs.append(('exception', json.dumps(m['params'])[:400]))
            elif mm == 'Runtime.consoleAPICalled' and m['params'].get('type') in ('error', 'warning', 'assert'):
                self.evs.append((m['params']['type'], ' '.join(str(a.get('value', a.get('description', ''))) for a in m['params'].get('args', []))[:300]))
            elif mm == 'Log.entryAdded' and m['params']['entry'].get('level') in ('error', 'warning'): self.evs.append(('log-' + m['params']['entry']['level'], m['params']['entry'].get('text', '')[:300] + ' ' + m['params']['entry'].get('url', '')[-60:]))
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

ATLAS = """(function(){var C=128,cv=document.createElement('canvas');cv.width=cv.height=C;var x=cv.getContext('2d');var p=['\\u20bf','#fff0b0','#c08a14','CASH CAR'],ox=0,oy=0;
 x.imageSmoothingEnabled=false;var g=x.createLinearGradient(0,oy,0,oy+C);g.addColorStop(0,p[2]);g.addColorStop(1,'#08061a');x.fillStyle=g;x.fillRect(ox+4,oy+4,C-8,C-8);
 x.strokeStyle=p[1];x.lineWidth=4;x.strokeRect(ox+8,oy+8,C-16,C-16);x.fillStyle=p[1];x.textAlign='center';x.textBaseline='middle';
 var u=7,x0=ox+C/2-18,y0=oy+Math.round(C*.42)-24,B9=['11110','10001','10001','11110','10001','10001','11110'];
 for(var r=0;r<7;r++)for(var c=0;c<5;c++)if(B9[r][c]==='1')x.fillRect(x0+c*u,y0+r*u,u,u);
 x.fillRect(x0+u+2,y0-7,3,7);x.fillRect(x0+3*u-1,y0-7,3,7);x.fillRect(x0+u+2,y0+49,3,7);x.fillRect(x0+3*u-1,y0+49,3,7);
 x.font='8px "Press Start 2P",monospace';x.fillStyle='#ffffff';x.fillText(p[3],ox+C/2,oy+C*.74);
 for(var i=0;i<5;i++){x.fillStyle=p[1];x.globalAlpha=.55;x.fillRect(ox+14+i*20,oy+C-22,12,4);}x.globalAlpha=1;
 var o=document.createElement('canvas');o.width=o.height=512;var y=o.getContext('2d');y.imageSmoothingEnabled=false;y.drawImage(cv,0,0,512,512);return o.toDataURL('image/png');})()"""

MESURE = """(function(){var R={};try{R.palier=dbgPalier();}catch(e){}
 var em=typeof dbgVilleEmb==='function';
 try{var a=dbgVille();if(em)dbgVilleEmb('rais',0);var b=dbgVille();if(em)dbgVilleEmb('rais',1);R.avec=a;R.sansRais=b;}catch(e){R.errMesure=String(e);}
 try{R.emb=em?dbgVilleEmb():null;}catch(e){}
 try{R.progs=dbgVitre('progs');}catch(e){}
 try{var P=dbgVitre('pts',6);R.L=P.L;R.NP=P.NP;R.pts=P.p;}catch(e){}
 try{R.verre=dbgVilleVerre();}catch(e){}
 try{R.cityN=dbgVilleEmb&&dbgVilleEmb().ville;}catch(e){}
 R.err=window.__loopErr?String(window.__loopErr.stack||window.__loopErr).slice(0,400):null;
 return JSON.stringify(R);})()"""

def main():
    args = sys.argv[1:]
    avant = '--avant' in args; ab = '--ab' in args
    palier = next((a.split('=')[1] for a in args if a.startswith('--palier=')), None)
    temps = [int(t) for t in os.environ.get('TEMPS', '5,10,15').split(',')]
    brut = [a for a in args if not a.startswith('--')]
    opts = {a.split('@')[0]: a.split('@')[1:] for a in brut}
    cp = couples_de([a.split('@')[0] for a in brut])
    if not cp: print('usage : photos-ville.py [--avant] [--ab] [--palier=N] <id>:<meteo>[-teinte] …'); return
    prises = os.path.join(ICI, 'prises'); os.makedirs(prises, exist_ok=True)
    T0 = time.time()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT_HTTP), '--bind', '127.0.0.1'], cwd=JEU,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    prof = tempfile.mkdtemp(prefix='ville-chrome-')
    chrome = subprocess.Popen([CHROME, '--headless=new', '--remote-debugging-port=%d' % PORT_CDP, '--user-data-dir=' + prof,
                               '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    try:
        for _ in range(240):
            time.sleep(.5)
            try:
                urllib.request.urlopen('http://127.0.0.1:%d/json' % PORT_CDP, timeout=2); break
            except Exception: pass
        for carte, meteo in cp:
            o9 = opts.get('%s:%s' % (carte, meteo), []); avant = 'avant' in o9 or '--avant' in args
            palier = next((x[1:] for x in o9 if x[0] == 'p' and x[1:].isdigit()), None)
            temps9 = [10] if 't10' in o9 else temps
            pre = ('avant' if avant else 'apres') + ('-p%s' % palier if palier is not None else '')
            page = 'index-avant-ville.html' if avant else 'index.html'
            if time.time() - T0 > 540: print('TEMPS ECOULE, on arrete avant', carte, meteo, flush=True); break
            c = CDP(PORT_CDP)
            c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
            c.send('Page.enable'); c.send('Runtime.enable'); c.send('Log.enable')
            win = c.send('Browser.getWindowForTarget', {'targetId': c.tab['id']})
            c.send('Browser.setWindowBounds', {'windowId': win['windowId'], 'bounds': {'width': 1280, 'height': 720}})
            c.send('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 720, 'deviceScaleFactor': 1, 'mobile': False})
            c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(SAVE))})
            mt, _, te = meteo.partition('-')
            if not te and carte == 'ville': te = 'violet'
            c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/%s?colonne=0&simu=1&pistegraine=12345&carte=%s&meteo=%s%s%s' % (PORT_HTTP, page, carte, mt, ('&teinte=' + te) if te else '', ('&palier=' + palier) if palier is not None else '')})
            for _ in range(160):
                time.sleep(.5)
                if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')&&document.readyState==='complete'"): break
            time.sleep(1.5)
            c.ev("document.querySelector('[data-m=\"play\"]').click()")
            for _ in range(160):
                time.sleep(.5)
                if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
            c.ev("dbgAuto(1,0,{gl:false})")
            t1 = time.time(); nom = '%s-%s-%s' % (pre, carte, meteo)
            for k, t in enumerate(temps9):
                while time.time() - t1 < t: time.sleep(.2)
                c.ev(CACHE); time.sleep(.3)
                r = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 86})
                open(os.path.join(prises, '%s-%d.jpg' % (nom, k)), 'wb').write(base64.b64decode(r['data']))
                if ab and t == 10 and not avant:  # la MEME image sans les ajouts (rais cachés, façades comme avant) : l'oeil juge chaque ajout
                    c.ev("dbgVilleEmb('rais',0);dbgVilleEmb('fac',0)"); time.sleep(.4)
                    r = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 86})
                    open(os.path.join(prises, '%s-sans.jpg' % nom), 'wb').write(base64.b64decode(r['data']))
                    c.ev("dbgVilleEmb('rais',1);dbgVilleEmb('fac',1)")
                c.ev("document.getElementById('cc-nu').textContent=''")
            if os.environ.get('ATLAS') and not avant and palier is None:
                u = c.ev(ATLAS)
                if u: open(os.path.join(prises, 'atlas-btc.png'), 'wb').write(base64.b64decode(u.split(',')[1]))
            mes = c.ev(MESURE)
            o = {'mesure': json.loads(mes) if mes else None, 'console': c.evs[:30], 'url': page}
            json.dump(o, open(os.path.join(prises, '%s.json' % nom), 'w'))
            m9 = o['mesure'] or {}
            print(nom, 'ok  appels/tri avec:', (m9.get('avec') or {}).get('appels'), (m9.get('avec') or {}).get('triangles'), 'sans rais:', (m9.get('sansRais') or {}).get('appels'), (m9.get('sansRais') or {}).get('triangles'),
                  'progs:', len(m9.get('progs') or []), 'palier:', (m9.get('palier') or {}).get('n') if isinstance(m9.get('palier'), dict) else m9.get('palier'), 'err:', m9.get('err'), 'console:', len(c.evs), '%ds' % (time.time() - T0), flush=True)
            c.s.close()
    finally:
        for p in (chrome, srv):
            try: os.killpg(os.getpgid(p.pid), 15)
            except Exception: pass
        time.sleep(1.5)
        for p in (chrome, srv):
            try: os.killpg(os.getpgid(p.pid), 9)
            except Exception: pass
        shutil.rmtree(prof, ignore_errors=True)

if __name__ == '__main__':
    main()
