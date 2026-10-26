#!/usr/bin/env python3
# UN PASSAGE DE BANC DES DUNES (jamais committé ; ports 9311 / 9511 ; à lancer SOUS LE VERROU : verrou-banc.sh prendre … ; ce script ; verrou-banc.sh rendre).
#   passe-dunes.py <racine> <sortie> <tag>:<page>:<meteo>[@palier]:<vues> ...
#   <racine> contient les dossiers de pages a/ (avant) et b/ (après), chacun un index.html + __ev ; vues séparées par « + » :
#     c1 c2 (la course, images exactes) · bas haut (vues figées) · off (bas+haut avec l'embellissement coupé) · preuve (somme de contrôle du tracé) · cout (appels, triangles, programmes)
# Un seul Chrome, tué avec ses Helper (groupe de processus) à la fin ; le serveur aussi.
import json, os, sys, time, base64, subprocess, tempfile, urllib.request, importlib.util, shutil, signal
ICI = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('ph', os.path.join(ICI, 'photos.py')); ph = importlib.util.module_from_spec(spec); spec.loader.exec_module(ph)
PH, PC = 9311, 9511
T0 = time.time(); BUDGET = float(os.environ.get('BUDGET', 540))
SAVE = {'v': 2, 'sfx': False, 'mus': False, 'vox': False, 'tuto': 1, 'permis': 1, 'facile': 0, 'ex': {'runs': 5}, 'plq': {'m': 'fr', 'x': 'CC-161-RZ', 'ok': 1}}
HOOK = ('window.__cons=[];(function(){var o={e:console.error,w:console.warn};console.error=function(){try{__cons.push("E:"+Array.prototype.slice.call(arguments).join(" ").slice(0,300))}catch(x){}o.e.apply(console,arguments)};'
        'console.warn=function(){try{__cons.push("W:"+Array.prototype.slice.call(arguments).join(" ").slice(0,300))}catch(x){}o.w.apply(console,arguments)};'
        'window.addEventListener("error",function(e){__cons.push("X:"+e.message)});window.addEventListener("unhandledrejection",function(e){__cons.push("R:"+e.reason)});})();'
        'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(SAVE)))
COUT = "(function(){var d=dbgScene(),r=d.rdr,i=r.info;i.autoReset=false;i.reset();r.render(d.scene,d.cam);i.autoReset=true;return {calls:i.render.calls,tri:i.render.triangles,prog:i.programs.length,tex:i.memory.textures,geo:i.memory.geometries};})()"
PREUVE = ("__ev('(function(){var h=2166136261>>>0,n=0;function mx(v){var u=new Uint32Array(new Float64Array([v]).buffer);for(var k=0;k<2;k++){h=Math.imul(h^u[k],16777619)>>>0;}n++;}"
          "for(var i=0;i<pts.length;i++){mx(pts[i].x);mx(pts[i].y);mx(pts[i].z);}return {h:h,n:n,L:Math.round(L*1000)/1000,sQ:JSON.stringify(DN.sQ).length,hz:JSON.stringify(DN.hz)}})()')")
def photo(js): return "(function(){%s;return dbgScene().rdr.domElement.toDataURL('image/jpeg',0.9);})()" % js
def reste(): return BUDGET - (time.time() - T0)

def main():
    racine, sortie, specs = sys.argv[1], sys.argv[2], sys.argv[3:]
    os.makedirs(sortie, exist_ok=True)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PH), '--bind', '127.0.0.1'], cwd=racine, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    prof = tempfile.mkdtemp(prefix='dunes-passe-')
    chrome = subprocess.Popen([ph.CHROME, '--headless=new', '--remote-debugging-port=%d' % PC, '--user-data-dir=' + prof, '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    out = {}
    try:
        for _ in range(90):
            time.sleep(1)
            try: urllib.request.urlopen('http://127.0.0.1:%d/json' % PC, timeout=3); break
            except Exception: pass
        c = ph.CDP(PC); c.s.settimeout(150)
        c.send('Page.enable'); c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
        c.send('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 720, 'deviceScaleFactor': 1, 'mobile': False})
        c.send('Page.addScriptToEvaluateOnNewDocument', {'source': HOOK})
        for sp in specs:
            tag, page, mp, vues = sp.split(':')
            meteo, _, pal = mp.partition('@')
            if reste() < 60: print('budget épuisé, on saute', sp, flush=True); continue
            c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/%s/index.html?colonne=0&simu=1&carte=dunes&meteo=%s&pistegraine=12345%s' % (PH, page, meteo, ('&palier=' + pal) if pal else '')})
            for _ in range(400):
                time.sleep(.5)
                if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
            time.sleep(1.5)
            c.ev("document.querySelector('[data-m=\"play\"]').click()")
            for _ in range(400):
                time.sleep(.5)
                if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
            c.ev("dbgAuto(1,0)")
            r = {'palier': c.ev('dbgPalier().n'), 'dunes': c.ev("(function(){var d=dbgDunes();return {on:d.on,L:d.L,emb:d.emb,acacias:d.acacias,palmiers:d.palmiers}})()")}
            def prise(nom, js):
                v = c.ev(photo(js))
                if not v or not str(v).startswith('data:'): print('  prise ratée', nom, flush=True); return
                open(os.path.join(sortie, '%s-%s.jpg' % (tag, nom)), 'wb').write(base64.b64decode(v.split(',', 1)[1]))
            for v in vues.split('+'):
                if reste() < 30: print('budget : on saute', v, flush=True); break
                if v == 'preuve': r['preuve'] = c.ev(PREUVE)
                elif v == 'c1': c.ev("dbgStep(300,16)"); prise('c1', "dbgStep(1,16)"); r['cout_c1'] = c.ev(COUT)
                elif v == 'c2': c.ev("dbgStep(300,16)"); prise('c2', "dbgStep(1,16)"); r['cout_c2'] = c.ev(COUT)
                elif v == 'bas': prise('bas', "dbgDunes('vueA',900,5,0,.02)"); r['cout_bas'] = c.ev(COUT)
                elif v == 'haut': prise('haut', "dbgDunes('vueA',1500,40,0,.06)"); r['cout_haut'] = c.ev(COUT)
                elif v == 'off':
                    c.ev("dbgDunes('regle',{ex:[0,0,0,0],sp:[1,.8,.45,0]})")
                    prise('bas-off', "dbgDunes('vueA',900,5,0,.02)"); prise('haut-off', "dbgDunes('vueA',1500,40,0,.06)")
                    c.ev("dbgDunes('regle',null)")
                elif v == 'cout': r['cout'] = c.ev(COUT)
            r['console'] = c.ev('JSON.stringify(window.__cons)'); r['loopErr'] = c.ev('String(window.__loopErr||"")'); r['dnErr'] = c.ev('String(window.__dnErr||"")')
            out['%s' % tag] = r
            print(tag, json.dumps(r, ensure_ascii=False), flush=True)
    finally:
        for p in (chrome, srv):
            try: os.killpg(os.getpgid(p.pid), signal.SIGTERM)
            except Exception: pass
        time.sleep(2)
        for p in (chrome, srv):
            try: os.killpg(os.getpgid(p.pid), signal.SIGKILL)
            except Exception: pass
        shutil.rmtree(prof, ignore_errors=True)
        json.dump(out, open(os.path.join(sortie, 'passe-%d.json' % int(T0)), 'w'), ensure_ascii=False, indent=1)
        print('fin, %.0f s' % (time.time() - T0), flush=True)

if __name__ == '__main__':
    main()
