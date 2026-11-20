#!/usr/bin/env python3
# LE BANC DE LA FINITION DE L'ESPACE (2026-11-18, finition des maps) — d'après outils/banc-embellir.py (embellir-photos), même crochets et même mesure.
#
#   python3 banc.py --avant <racine-avant> --racine <worktree> --sortie <dossier> --ports 8620 9620 [--versions avant,apres,sans] \
#                   [--formats paysage,portrait] [--etapes 240,600] meteo[:graine[:formats+…[:version|version~a=b;c=d|…]]] …     (meteo : matin = Terre, midi = Mars, soir = Saturne)
#
# AVANT = index.html de <racine-avant> (le jeu d'avant, en lecture seule) ; APRÈS = index.html assemblé du worktree ; SANS = le même avec ?sans=espacefini.
# Vrai jeu, ?tel=1, format iPhone (paysage 844×390, portrait 390×844), sauvegarde MUETTE (sfx/mus/vox false), Chrome --mute-audio.
# Boucle figée au 1er instant de course, puis dbgStep = images DÉTERMINISTES ; par prise : renderer.info (une image rendue à la main) + JPEG.
# ⚠ À lancer SOUS LE VERROU (passe.sh). Jamais seul.
import socket, json, base64, os, struct, urllib.request, time, sys, subprocess, shutil, tempfile, argparse, signal

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
SAVE = {'v': 2, 'sfx': False, 'mus': False, 'vox': False, 'tuto': 1, 'permis': 1, 'facile': 0, 'ex': {'runs': 5}}
ETAPES = [300, 500]   # images simulées avant la 1re prise, puis entre la 1re et la 2e
HOOK = ("window.__errs=[];window.__warns=[];window.addEventListener('error',function(e){__errs.push(String(e.message).slice(0,200));});"
        "window.addEventListener('unhandledrejection',function(e){__errs.push('rejet: '+String(e.reason).slice(0,200));});"
        "(function(){var ce=console.error,cw=console.warn;console.error=function(){__errs.push([].slice.call(arguments).join(' ').slice(0,200));return ce.apply(console,arguments);};"
        "console.warn=function(){__warns.push([].slice.call(arguments).join(' ').slice(0,160));return cw.apply(console,arguments);};})();"
        "(function(){var raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=function(cb){return raf(function(t){if(window.__fige)return;cb(t);"
        "try{if(window.__veutFiger&&typeof dbgState==='function'){var s=dbgState();if(s.started&&!s.gameOver)window.__fige=true;}}catch(e){}});};})();")
CACHE = ("(function(){var g=null;document.querySelectorAll('body>canvas').forEach(function(x){if(!g||x.width*x.height>g.width*g.height)g=x;});"
         "g.id=g.id||'ccGL';var s=document.getElementById('cc-nu');if(!s){s=document.createElement('style');s.id='cc-nu';document.body.appendChild(s);}"
         "s.textContent='body>*:not(#'+g.id+'){opacity:0!important;transition:none!important}';})()")
EMPREINTE = ("__ev('(function(){var h=2166136261>>>0;function f(x){h^=(Math.round(x*1000)|0);h=Math.imul(h,16777619)>>>0;}"
             "for(var i=0;i<pts.length;i++){var p=pts[i];f(p.x);f(p.y);f(p.z);}for(var i=0;i<Nn.length;i++){var n=Nn[i];f(n.x);f(n.y);f(n.z);}"
             "for(var i=0;i<T.length;i++){var t=T[i];f(t.x);f(t.y);f(t.z);}f(L);f(NP);return h.toString(16)+\\':\\'+pts.length+\\':\\'+L.toFixed(1);})()')")
MESURE = ("(function(){var d=dbgScene(),r=d.rdr,I=r.info,o={};try{I.autoReset=false;I.reset();r.render(d.scene,d.cam);"
          "o={calls:I.render.calls,tris:I.render.triangles,prog:I.programs?I.programs.length:null,geo:I.memory.geometries,tex:I.memory.textures};}"
          "catch(e){o={err:String(e)};}finally{I.autoReset=true;}return JSON.stringify(o);})()")

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


AMAS = False
FORMATS = {'paysage': (844, 390), 'portrait': (390, 844)}

def preparer(avant, racine, serve):
    jeu = os.path.join(racine, 'VERSION PRINCIPALE')
    shutil.rmtree(serve, ignore_errors=True)
    for nom, src in (('avant', os.path.join(avant, 'VERSION PRINCIPALE', 'index.html')), ('apres', os.path.join(jeu, 'index.html'))):
        d = os.path.join(serve, nom); os.makedirs(d)
        for e in os.listdir(jeu):
            if e == 'index.html': continue
            os.symlink(os.path.join(jeu, e), os.path.join(d, e))
        contenu = open(src, 'rb').read()
        marque = b'window.__gameReady=true; // la boucle part'
        assert contenu.count(marque) == 1, 'repère __gameReady introuvable dans %s' % nom
        contenu = contenu.replace(marque, b'window.__ev=function(__c9){return eval(__c9);};' + marque)
        open(os.path.join(d, 'index.html'), 'wb').write(contenu)

def scenario(c, port_http, version, meteo, graine, fmt, etapes, sortie):
    w, h = FORMATS[fmt]
    # un VRAI téléphone (tactile, écran < 600 px) : la page ne monte pas le cadre-iframe de l'ordi (code/page/tete.html), le jeu EST la page
    c.send('Emulation.setDeviceMetricsOverride', {'width': w, 'height': h, 'deviceScaleFactor': 2, 'mobile': True, 'screenWidth': w, 'screenHeight': h})
    c.send('Emulation.setTouchEmulationEnabled', {'enabled': True, 'maxTouchPoints': 5})
    # une version = « nom » (avant, apres, sans) ou « nom~a=b;c=d » : la même version d'APRÈS avec des paramètres de banc en plus (ex. n1~espnuit=.02/.03/.08)
    version, _, extra = version.partition('~')
    dossier = 'avant' if version == 'avant' else 'apres'
    u = ('http://127.0.0.1:%d/%s/index.html?colonne=0&simu=1&garde=1&tel=1&pistegraine=%d&carte=espace&meteo=%s%s%s'
         % (port_http, dossier, graine, meteo, '&sans=espacefini' if version == 'sans' else '', ('&' + extra.replace(';', '&')) if extra else ''))
    c.send('Page.navigate', {'url': u})
    time.sleep(2)
    for _ in range(240):
        time.sleep(.5)
        if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
    else: raise RuntimeError('le jeu ne s\'est pas présenté (cadre ? chargement ?)')
    time.sleep(1.5)
    c.ev("(function(){var s=document.getElementById('splash');if(s)['pointerdown','pointerup','click'].forEach(function(t){s.dispatchEvent(new PointerEvent(t,{bubbles:true}));});})()")
    time.sleep(1)
    c.ev("window.__veutFiger=true")
    c.ev("document.querySelector('[data-m=\"play\"]').click()")
    for _ in range(600):
        time.sleep(.2)
        if c.ev("!!window.__fige"): break
    else: raise RuntimeError('la course n\'a pas démarré')
    c.ev("dbgAuto(1,0,{gl:false})")
    emp = c.ev(EMPREINTE)
    c.ev("dbgStep(60,40)")
    time.sleep(3)
    nom = '%s-%s-g%d-%s' % (version, meteo, graine, fmt)
    res = {'version': version, 'meteo': meteo, 'graine': graine, 'format': fmt, 'piste': emp, 'prises': []}
    for k, n in enumerate(etapes):
        etat = c.ev("JSON.stringify(dbgStep(%d,40))" % n)
        c.ev(CACHE); time.sleep(.4)
        m = c.ev(MESURE)
        r = c.send('Page.captureScreenshot', {'format': 'png'})
        f = '%s-%d.png' % (nom, k)
        open(os.path.join(sortie, f), 'wb').write(base64.b64decode(r['data']))
        c.ev("document.getElementById('cc-nu').textContent=''")
        res['prises'].append({'fichier': f, 'mesure': json.loads(m) if m else None, 'etat': etat})
    if AMAS:   # (2026-11-19) LES AMAS : la caisse est posée à 300 m puis 120 m avant le 1er amas de la route (ORB.amas, à l'écart), une prise à chaque fois
        am = c.ev("__ev('JSON.stringify(ORB.amas||[])')")
        am = json.loads(am) if am else []
        res['amas'] = am
        for k, rec in enumerate((300, 120)):
            if not am: break
            cible = am[0]['s'] - rec
            # dbgStep n'avance presque pas la caisse au départ (≈ 1 m pour 600 images) : on la POSE à l'abscisse voulue (banc seulement), puis trois images pour la caméra
            c.ev("__ev('s=%d')" % cible); c.ev("dbgStep(3,40)"); time.sleep(1.5)
            c.ev(CACHE); time.sleep(.4)
            m = c.ev(MESURE)
            r = c.send('Page.captureScreenshot', {'format': 'png'})
            f = '%s-a%d.png' % (nom, k)
            open(os.path.join(sortie, f), 'wb').write(base64.b64decode(r['data']))
            c.ev("document.getElementById('cc-nu').textContent=''")
            res['prises'].append({'fichier': f, 'mesure': json.loads(m) if m else None, 'etat': json.dumps({'s': c.ev("__ev('s')"), 'amas_s': am[0]['s']})})
    res['erreurs'] = c.ev("JSON.stringify({errs:window.__errs,warns:(window.__warns||[]).slice(0,8),loop:String(window.__loopErr||''),rate:(function(){try{return __ev('OBEAU.rate.join(\\'|\\')');}catch(e){return '?';}})()})")
    print('  %s ok %s' % (nom, json.dumps([p['mesure'] for p in res['prises']])), flush=True)
    return res

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--avant', required=True); ap.add_argument('--racine', required=True); ap.add_argument('--sortie', required=True)
    ap.add_argument('--ports', nargs=2, type=int, required=True); ap.add_argument('scenarios', nargs='+')
    ap.add_argument('--versions', default='avant,apres,sans'); ap.add_argument('--formats', default='paysage,portrait')
    ap.add_argument('--etapes', default='240,600'); ap.add_argument('--amas', action='store_true')
    a = ap.parse_args()
    global AMAS; AMAS = a.amas
    http_p, cdp_p = a.ports
    os.makedirs(a.sortie, exist_ok=True)
    serve = os.path.join(a.sortie, '_serve')
    preparer(a.avant, a.racine, serve)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(http_p), '--bind', '127.0.0.1'], cwd=serve,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    prof = tempfile.mkdtemp(prefix='finition-espace-chrome-')
    chrome = subprocess.Popen([CHROME, '--headless=new', '--remote-debugging-port=%d' % cdp_p, '--user-data-dir=' + prof,
                               '--mute-audio', '--no-first-run', '--window-size=1000,1000', 'about:blank'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    open(os.path.join(a.sortie, '_pids'), 'w').write('%d %d\n' % (chrome.pid, srv.pid))
    tout = []; t0 = time.time()
    etapes = [int(x) for x in a.etapes.split(',')]
    try:
        time.sleep(4)
        c = CDP(cdp_p)
        c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
        c.send('Page.enable')
        c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(SAVE)) + ';' + HOOK})
        for sc in a.scenarios:
            p = sc.split(':'); meteo = p[0]; graine = int(p[1]) if len(p) > 1 else 12345
            fmts = p[2].split('+') if len(p) > 2 and p[2] else a.formats.split(',')
            vers = p[3].split('|') if len(p) > 3 else a.versions.split(',')   # meteo:graine:formats:versions (séparées par |)
            for fmt in fmts:
                for version in vers:
                    if time.time() - t0 > 540: break
                    try: tout.append(scenario(c, http_p, version, meteo, graine, fmt, etapes, a.sortie))
                    except Exception as e: print('  ÉCHEC', version, sc, fmt, repr(e)[:200], flush=True)
            if time.time() - t0 > 540: print('  (9 min : arrêt)', flush=True); break
    finally:
        for pr in (chrome, srv):
            try: os.killpg(pr.pid, signal.SIGTERM)
            except Exception: pass
        time.sleep(2)
        for pr in (chrome, srv):
            try: os.killpg(pr.pid, signal.SIGKILL)
            except Exception: pass
        shutil.rmtree(prof, ignore_errors=True)
        json.dump(tout, open(os.path.join(a.sortie, 'resultats.json'), 'w'), indent=1, ensure_ascii=False)
    for r in tout:
        er = json.loads(r['erreurs'] or '{}') if r.get('erreurs') else {}
        for k, pr in enumerate(r['prises']):
            m = pr['mesure'] or {}
            print('%-6s %-6s g%-6d %-8s #%d calls=%s tris=%s prog=%s geo=%s tex=%s piste=%s err=%d loop=%s' % (r['version'], r['meteo'], r['graine'], r['format'], k,
                  m.get('calls'), m.get('tris'), m.get('prog'), m.get('geo'), m.get('tex'), r['piste'], len(er.get('errs', [])), er.get('loop') or 'ok'))

if __name__ == '__main__':
    main()
