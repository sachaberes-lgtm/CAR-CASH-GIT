#!/usr/bin/env python3
# BANC DE LA PASSE « ROYAUME DE FEU » (embellir-volcan, ports 9306/9506) — jamais committé.
#   photos-volcan.py <page> <meteo> <palier> <tag> <pas1,pas2,..> [vues]
# Charge <page> (index.html = après, index-avant.html = avant) en ?carte=volcan&meteo=..&palier=..&pistegraine=12345, clique JOUER,
# FIGE rAF puis fait avancer la boucle à la main (dbgStep, 16 ms) : même piste, même instant de jeu, même caméra avant/après.
# Les prises = la toile WebGL seule (toDataURL juste après le rendu), gardées dans banc/prises-volcan/<tag>-<pas>.jpg
import sys, os, json, base64, time, subprocess, shutil, tempfile, urllib.request
ICI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, ICI)
import photos
REP = os.path.dirname(ICI); JEU = os.path.dirname(REP)
PORT_HTTP, PORT_CDP = 9306, 9506
SAVE = photos.SAVE
SORTIE = os.path.join(ICI, 'prises-volcan'); os.makedirs(SORTIE, exist_ok=True)
SEED = "(function(){var a=0x5EED1234;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();"

class CDPE(photos.CDP):  # garde les évènements (erreurs de console)
    def send(self, method, params=None):
        self.id += 1; mid = self.id
        data = json.dumps({'id': mid, 'method': method, 'params': params or {}}).encode()
        mask = os.urandom(4); ln = len(data)
        import struct
        hdr = bytes([0x81]) + (bytes([0x80 | ln]) if ln < 126 else bytes([0x80 | 126]) + struct.pack('>H', ln) if ln < 65536 else bytes([0x80 | 127]) + struct.pack('>Q', ln))
        self.s.send(hdr + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))
        while True:
            m = self._recv()
            if 'method' in m:
                if not hasattr(self, 'evts'): self.evts = []
                if m['method'] in ('Runtime.exceptionThrown', 'Log.entryAdded', 'Runtime.consoleAPICalled'):
                    p = m.get('params', {})
                    if m['method'] == 'Runtime.consoleAPICalled' and p.get('type') not in ('error', 'warning', 'assert'): continue
                    self.evts.append(json.dumps(p)[:300])
            if m.get('id') == mid:
                if 'error' in m: raise RuntimeError(m['error'])
                return m.get('result', {})

def fabrique(page):  # <page>.html -> <page>-ev.html : __ev (eval dans la fermeture du jeu) inséré avant « la boucle part »
    src = os.path.join(JEU, page); dst = os.path.join(JEU, page.replace('.html', '-ev.html'))
    t = open(src, encoding='utf-8').read(); m = 'window.__gameReady=true; // la boucle part'
    assert t.count(m) == 1
    open(dst, 'w', encoding='utf-8').write(t.replace(m, 'window.__ev=function(__c9){return eval(__c9);};\n' + m))
    return os.path.basename(dst)

def un_job(c, job, t00):
    page, meteo, palier, tag, vues, extra = (job.split(':') + [''])[:6]
    vues = [int(x) for x in vues.split(',')]
    page = fabrique(page)
    c.evts = []
    c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/%s?colonne=0&simu=1&carte=volcan&meteo=%s&pistegraine=12345&palier=%s%s' % (PORT_HTTP, page, meteo, palier, extra)})
    for _ in range(1200):
        time.sleep(.5)
        if c.ev("typeof dbgState==='function'&&typeof __ev==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
    time.sleep(1.5)
    c.ev("document.querySelector('[data-m=\"play\"]').click()")
    for _ in range(1200):
        time.sleep(.5)
        if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
    print(tag, 'lancé', round(time.time() - t00), 's', flush=True)
    c.ev("window.requestAnimationFrame=function(){return 0};try{dbgQual(0);dbgDPR(1)}catch(e){};dbgAuto(1,0,{gl:false});1")
    fait = 0
    for k in range(300):
        r = c.ev("dbgStep(20,16);JSON.stringify([dbgVolcan().pret,dbgVolcan().file])"); fait += 20
        r = json.loads(r) if r else [False, 1]
        if r[0] and r[1] == 0: break
    print(tag, 'construit après', fait, 'pas', round(time.time() - t00), 's', flush=True)
    print(tag, 'INFO', c.ev("(function(){var v=dbgVolcan();return JSON.stringify({L:v.L,sSp:v.sSp,bancs:v.bancs,sauts:v.sauts,n:v.n,msTot:v.msTot,NP:__ev('NP'),hasard:v.hasard})})()"), flush=True)
    print(tag, 'PISTE', c.ev("__ev(\"(function(){function H(a){var h=2166136261;for(var i=0;i<a.length;i++){h^=(Math.round(a[i]*1000)|0);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}"
        "var P=[],G=[],Q=[],N={};for(var i=0;i<NP;i++)P.push(pts[i].x,pts[i].y,pts[i].z,T[i].x,T[i].z);"
        "for(var k=0;k<VOLCAN.aig.length;k++){var g=VOLCAN.aig[k];G.push(g.x,g.y,g.z,g.ry,g.sy,g.sxz,g.i);}"
        "for(var k=0;k<VOLCAN.gey.length;k++){var g=VOLCAN.gey[k];Q.push(g.x,g.y,g.z,g.per,g.ph,g.v);}"
        "for(var k in VOLCAN.n)if(k!=='cretes')N[k]=VOLCAN.n[k];"
        "return JSON.stringify({NP:NP,L:L,pts:H(P),aig:H(G),gey:H(Q),n:N,col:VOLCAN.gcol&&VOLCAN.gcol.n,deco:VOLCAN.deco,cretes:VOLCAN.n.cretes});})()\")"), flush=True)
    for sv in vues:
        c.ev("__ev(\"mode='drive';s=%d;lat=0;side=1;psi=0;yawR=0;slipB=0;driftYaw=0;vA=100;nitroR=1;0\");dbgStep(4,16);__ev(\"psi=0;yawR=0;0\");dbgAuto(1,0);1" % sv)
        c.ev("dbgStep(110,16);1")
        r = c.ev("(function(){dbgStep(1,16);var cv=dbgScene().rdr.domElement,q=dbgState();var u=cv.toDataURL('image/jpeg',.9);return JSON.stringify({u:u,w:cv.width,h:cv.height,s:q.s,st:[q.started,q.running,q.paused,q.gameOver,q.mode,q.vA,q.lat]})})()")
        d = json.loads(r); open(os.path.join(SORTIE, '%s-%d.jpg' % (tag, sv)), 'wb').write(base64.b64decode(d['u'].split(',')[1]))
        cout = c.ev("(function(){var r=dbgScene().rdr,i=r.info;i.autoReset=false;i.reset();r.render(dbgScene().scene,dbgScene().cam);i.autoReset=true;return JSON.stringify([i.render.calls,i.render.triangles])})()")
        print('prise', tag, sv, 'toile', d['w'], 'x', d['h'], 's =', d['s'], d['st'], 'COUT appels/triangles', cout, round(time.time() - t00), 's', flush=True)
    cout = c.ev("(function(){var r=dbgScene().rdr,i=r.info;return JSON.stringify({programmes:i.programs.length,textures:i.memory.textures,geometries:i.memory.geometries,palier:dbgPalier().n,loopErr:window.__loopErr||null,volcanErr:window.__volcanErr?String(window.__volcanErr):null})})()")
    print('COUT', tag, cout, flush=True)
    ev = [e for e in c.evts if 'flatShading' not in e and 'AudioContext' not in e]
    print('ERREURS', tag, len(c.evts), 'messages dont', len(ev), 'utiles', json.dumps(ev[:6]), flush=True)

def main():
    jobs = sys.argv[1:]
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT_HTTP), '--bind', '127.0.0.1'], cwd=JEU, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    prof = tempfile.mkdtemp(prefix='volcan-chrome-')
    chrome = subprocess.Popen(['nice', '-n', '10', photos.CHROME, '--headless=new', '--remote-debugging-port=%d' % PORT_CDP, '--user-data-dir=' + prof,
                               '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    t00 = time.time()
    try:
        for _ in range(240):
            time.sleep(.5)
            try: urllib.request.urlopen('http://127.0.0.1:%d/json' % PORT_CDP, timeout=2); break
            except Exception: pass
        c = CDPE(PORT_CDP)
        c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
        c.send('Page.enable'); c.send('Runtime.enable'); c.send('Log.enable')
        win = c.send('Browser.getWindowForTarget', {'targetId': c.tab['id']})
        c.send('Browser.setWindowBounds', {'windowId': win['windowId'], 'bounds': {'width': 1280, 'height': 720}})
        c.send('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 720, 'deviceScaleFactor': 1, 'mobile': False})
        c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(SAVE)) + SEED})
        for job in jobs:
            try: un_job(c, job, t00)
            except Exception as e: print('ECHEC', job, repr(e)[:300], flush=True)
        c.s.close()
    finally:
        import signal
        for pr in (chrome, srv):
            try: os.killpg(pr.pid, signal.SIGTERM)
            except Exception: pass
        time.sleep(2)
        for pr in (chrome, srv):
            try: os.killpg(pr.pid, signal.SIGKILL)
            except Exception: pass
        shutil.rmtree(prof, ignore_errors=True)
        print('reste de Chrome (profil):', subprocess.run(['pgrep', '-f', prof], capture_output=True, text=True).stdout.split() or 'aucun', flush=True)

if __name__ == '__main__':
    main()
