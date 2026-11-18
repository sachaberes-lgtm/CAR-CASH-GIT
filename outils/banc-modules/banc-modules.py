#!/usr/bin/env python3
# LE BANC DES MODULES DE L'ESPACE (2026-11-18, finition des maps : « on retravaille les modules de l'espace ») — photos du VRAI jeu, sans fenêtre, MUET.
#
#   python3 banc-modules.py --sortie <dossier> --ports 8650 9650 --graines 1-16 --versions avant,apres,sans [--formats paysage,portrait] [--figs a,b]
#
# avant = l'index.html de /Users/sachaberes/cash-car/finition-lots/avant (lecture seule) ; apres = celui de ce worktree (assemblé) ;
# sans = apres avec ?sans=modulesfinis (l'interrupteur : doit rendre l'image et les comptes d'avant).
# Pour chaque version : charge ?carte=espace&tel=1, JOUER, puis pour chaque graine dbgTrace({graine,palier:0,carte:'espace'}) (la route rebâtie),
# dbgMods() ; pour chaque module (la 1re fois qu'il sort), une caméra de COURSE posée sur la route (40 m derrière, 18 m au-dessus, le haut = la
# normale de la dalle, regard 60 m devant) au 1er tiers du module, la boucle en pause ; renderer.info (une image rendue à la main) ; capture.
# Les vues sont les MÊMES d'une version à l'autre (même suite de graines : la même pioche). À lancer par lancer.sh (le verrou commun).
import socket, json, base64, os, struct, urllib.request, time, sys, subprocess, shutil, tempfile, argparse, signal

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
SAVE = {'v': 2, 'sfx': False, 'mus': False, 'vox': False, 'tuto': 1, 'permis': 1, 'facile': 0, 'ex': {'runs': 5}}
AVANT = '/Users/sachaberes/cash-car/finition-lots/avant/VERSION PRINCIPALE'
HOOK = ("window.__errs=[];window.addEventListener('error',function(e){__errs.push(String(e.message).slice(0,200));});"
        "(function(){var ce=console.error;console.error=function(){__errs.push([].slice.call(arguments).join(' ').slice(0,200));return ce.apply(console,arguments);};})();")
CACHE = ("(function(){var g=null;document.querySelectorAll('body>canvas').forEach(function(x){if(!g||x.width*x.height>g.width*g.height)g=x;});"
         "g.id=g.id||'ccGL';var s=document.getElementById('cc-nu');if(!s){s=document.createElement('style');s.id='cc-nu';document.body.appendChild(s);}"
         "s.textContent='body>*:not(#'+g.id+'){opacity:0!important;transition:none!important}';})()")
MESURE = ("(function(){var d=dbgScene(),r=d.rdr,I=r.info,o={};try{I.autoReset=false;I.reset();r.render(d.scene,d.cam);"
          "o={calls:I.render.calls,tris:I.render.triangles,prog:I.programs?I.programs.length:null,geo:I.memory.geometries,tex:I.memory.textures};}"
          "catch(e){o={err:String(e)};}finally{I.autoReset=true;}return JSON.stringify(o);})()")
# la caméra de course à l'abscisse s (k = recul) ; la boucle en pause (le rendu continue)
VUE = ("(function(s,rec,hau){var R=dbgRoute(),i=Math.max(1,Math.min(R.NP-2,Math.round(s/R.L*(R.NP-1)))),p=R.pts[i],t=R.T[i],n=R.Nn[i];"
       "dbgAudit('vue',{p:[p.x-t.x*rec+n.x*hau,p.y-t.y*rec+n.y*hau,p.z-t.z*rec+n.z*hau],c:[p.x+t.x*60,p.y+t.y*60,p.z+t.z*60],fov:62});"
       "var c=dbgScene().cam;c.up.set(n.x,n.y,n.z);c.lookAt(p.x+t.x*60+n.x*4,p.y+t.y*60+n.y*4,p.z+t.z*60+n.z*4);c.updateMatrixWorld();return 1;})")

class CDP:
    def __init__(self, port):
        tabs = json.load(urllib.request.urlopen('http://127.0.0.1:%d/json' % port))
        tab = next((t for t in tabs if t.get('type') == 'page'), None)
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
        if 'exceptionDetails' in r:
            print('    exception :', str(r['exceptionDetails'].get('exception', {}).get('description', r['exceptionDetails'].get('text')))[:240], flush=True); return None
        return r.get('result', {}).get('value')

def preparer(racine, serve):
    jeu = os.path.join(racine, 'VERSION PRINCIPALE')
    subprocess.run(['node', 'code/assembler.cjs', '--depuis-morceaux'], cwd=racine, check=True, stdout=subprocess.DEVNULL)
    shutil.rmtree(serve, ignore_errors=True)
    for nom, src in (('avant', AVANT), ('apres', jeu)):
        d = os.path.join(serve, nom); os.makedirs(d)
        for e in os.listdir(src):
            if e != 'index.html': os.symlink(os.path.join(src, e), os.path.join(d, e))
        t = open(os.path.join(src, 'index.html'), 'rb').read(); mq = b'window.__gameReady=true; // la boucle part'
        assert t.count(mq) == 1, 'repère __gameReady'
        open(os.path.join(d, 'index.html'), 'wb').write(t.replace(mq, b'window.__ev=function(__c9){return eval(__c9);};' + mq))   # crochet de banc : lire ALLEGE

FMT = {'paysage': (844, 390), 'portrait': (390, 844)}

def taille(c, f):
    w, h = FMT[f]
    c.send('Emulation.setDeviceMetricsOverride', {'width': w, 'height': h, 'deviceScaleFactor': 2, 'mobile': True})
    c.ev("window.dispatchEvent(new Event('resize'))"); time.sleep(1.2)

def version(c, port, ver, graines, formats, figs, sortie, t0):
    rep, q = ('avant', '') if ver == 'avant' else ('apres', '&sans=modulesfinis' if ver == 'sans' else '')   # ab : la page d'après, la finition basculée en place
    w, h = FMT[formats[0]]   # un VRAI téléphone émulé (tactile + écran < 600) : TEL_NATIF, donc ALLEGE — le chemin de l'iPhone (?tel=1 en haut de page = le cadre de l'ordi, le jeu dans une iframe)
    c.send('Emulation.setDeviceMetricsOverride', {'width': w, 'height': h, 'deviceScaleFactor': 2, 'mobile': True}); c.send('Emulation.setTouchEmulationEnabled', {'enabled': True, 'maxTouchPoints': 5})
    c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/%s/index.html?colonne=0&simu=1&intro=ancien&attente=0&prebati=0&carte=espace%s' % (port, rep, q)})
    pret = False
    for k in range(240):
        time.sleep(.5)
        if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): pret = True; break
        if k % 40 == 39: print('    attente', c.ev("JSON.stringify({rs:document.readyState,three:typeof THREE,ready:!!window.__gameReady,intro:String(window.__intro),err:window.__errs,le:String(window.__loopErr||''),url:location.href.slice(-60),play:!!document.querySelector('[data-m=\"play\"]')})"), flush=True)
    if not pret:
        r = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 70}); open(os.path.join(sortie, 'echec-%s.jpg' % ver), 'wb').write(base64.b64decode(r['data']))
        raise RuntimeError('le jeu ne se charge pas')
    time.sleep(1.5)
    for _ in range(8):   # le splash (le bouton par toucher ne marche pas sans fenêtre : dbgJouer, comme banc-maps)
        if not c.ev("!!document.getElementById('splash')"): break
        c.ev("(function(){var e=document.getElementById('splash');try{e.click();}catch(x){}})()"); time.sleep(.6)
    ok = False
    for k in range(3):
        print('  jouer', c.ev("JSON.stringify(dbgJouer())"), flush=True)
        for _ in range(90):
            time.sleep(.5)
            if c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver);})()"): ok = True; break
        if ok: break
    print('  %s départ %s · carte %s' % (ver, ok, c.ev("(function(){try{return dbgRoute().niveau.id+' ALLEGE '+__ev('ALLEGE')}catch(e){return String(e)}})()")), flush=True)
    if not ok: raise RuntimeError('pas de départ')
    time.sleep(3); c.ev("dbgAuto&&dbgAuto(1,0,{nit:0})")
    vus, res = {}, []
    for g in graines:
        if time.time() - t0 > 520: print('  (temps : arrêt)', flush=True); break
        # le hasard de newTrack (l'ambiance : planète, moment, géants) tiré d'un générateur à graine le temps de dbgTrace : la même scène dans chaque version
        tr = c.ev("(function(){var raV=Math.random,a=(%d*2654435761)>>>0;Math.random=function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};"
                  "try{var r=dbgTrace({graine:%d,palier:0,carte:'espace'});}finally{Math.random=raV;}return JSON.stringify({L:r.L,ok:r.graineOk});})()" % (g, g))
        time.sleep(2.5)
        mods = json.loads(c.ev("JSON.stringify(dbgMods())") or '[]')
        voy = c.ev("JSON.stringify(window.dbgVoyage?dbgVoyage().decor.info:[])")
        print('  %s g%d %s %s %s' % (ver, g, tr, ' '.join(m['fig'] for m in mods), voy), flush=True)
        vues = []
        for m in mods:
            f = m['fig']
            if f.endswith('-entree') or f.endswith('-sortie') or f in vus: continue
            if figs and f not in figs: continue
            vus[f] = g; a, b = m['s0'], m['s1']
            vues.append((f, a + (b - a) * (.5 if f in ('roue', 'lune', 'asteroide', 'nebuleuse') else .3)))
        try: larges = json.loads(c.ev("JSON.stringify(window.dbgVoyage?dbgVoyage().vues:[])") or '[]')
        except Exception: larges = []
        for v in larges:   # la vue large d'un décor de voyage (roue, lune, astéroïde, nébuleuse) : 'nom x,y,z:cx,cy,cz'
            nom, _, pc = v.partition(' ')
            if nom + '-large' in vus or (figs and nom not in figs): continue
            vus[nom + '-large'] = g; vues.append((nom + '-large', pc))
        for fm in formats:
            taille(c, fm)
            for f, s in vues:
                # ab : la MÊME scène rebâtie sans puis avec la finition (dbgModulesFinis) — sinon une prise de la version chargée
                for v2, fl in ((('sans', 'false'), ('apres', 'true')) if ver == 'ab' else ((ver, None),)):
                    if fl: etat = c.ev("JSON.stringify(dbgModulesFinis(%s))" % fl)
                    if isinstance(s, str):
                        p9, _, c9 = s.partition(':'); c.ev("dbgAudit('vue',{p:[%s],c:[%s],fov:62})" % (p9, c9))
                    else: c.ev(VUE + "(%f,40,18)" % s)
                    c.ev(CACHE); time.sleep(.9)
                    me = c.ev(MESURE)
                    r = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 84})
                    nom = '%s-%s-g%d-%s.jpg' % (v2, f, g, fm)
                    open(os.path.join(sortie, nom), 'wb').write(base64.b64decode(r['data']))
                    res.append({'v': v2, 'fig': f, 'g': g, 's': s if isinstance(s, str) else round(s), 'fmt': fm, 'info': json.loads(me) if me else None, 'decor': etat if fl else None})
                    c.ev("document.getElementById('cc-nu').textContent=''")
        taille(c, formats[0])
    err = c.ev("JSON.stringify({errs:window.__errs,loop:String(window.__loopErr||'')})")
    print('  %s erreurs %s' % (ver, err), flush=True)
    return res, err

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sortie', required=True); ap.add_argument('--ports', nargs=2, type=int, required=True)
    ap.add_argument('--graines', default='1-16'); ap.add_argument('--versions', default='avant')
    ap.add_argument('--formats', default='paysage,portrait'); ap.add_argument('--figs', default='')
    a = ap.parse_args()
    racine = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
    g0, _, g1 = a.graines.partition('-'); graines = list(range(int(g0), int(g1 or g0) + 1)) if '-' in a.graines else [int(x) for x in a.graines.split(',')]
    os.makedirs(a.sortie, exist_ok=True)
    serve = os.path.join(racine, '.banc-modules', 'serve'); preparer(racine, serve)
    hp, cp = a.ports
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(hp), '--bind', '127.0.0.1'], cwd=serve, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    prof = tempfile.mkdtemp(prefix='modules-chrome-')
    chrome = subprocess.Popen([CHROME, '--headless=new', '--remote-debugging-port=%d' % cp, '--user-data-dir=' + prof, '--mute-audio', '--no-first-run',
                               '--window-size=1280,720', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    open(os.path.join(a.sortie, 'pids'), 'w').write('%d %d' % (chrome.pid, srv.pid))
    tout, t0 = {'vues': [], 'err': {}}, time.time()
    try:
        time.sleep(3); c = CDP(cp)
        c.send('Page.enable'); c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
        c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(SAVE)) + ';' + HOOK})
        figs = set(x for x in a.figs.split(',') if x)
        for v in a.versions.split(','):
            try:
                r, e = version(c, hp, v, graines, a.formats.split(','), figs, a.sortie, t0); tout['vues'] += r; tout['err'][v] = e
            except Exception as ex: print('  ÉCHEC', v, repr(ex)[:300], flush=True)
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
    print('fini en %d s' % (time.time() - t0))

main()
