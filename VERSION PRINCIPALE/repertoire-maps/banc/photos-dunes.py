#!/usr/bin/env python3
# BANC DES DUNES (copie élargie de photos.py ; ports 9311 / 9511 ; jamais committée).
#   photos-dunes.py <racine> <préfixe> <météo>[@palier] ...   ex. photos-dunes.py "VERSION PRINCIPALE" avant soir midi nuit
# Un chargement par météo : ?pistegraine=12345&carte=dunes&meteo=<m>[&palier=n], JOUER, dbgAuto(1,0), puis des prises à des images EXACTES
# (dbgStep) et des vues figées (dbgDunes('vueA')), chacune lue par toDataURL dans la même tâche ; + le coût (appels, triangles, programmes).
import socket, json, base64, os, struct, urllib.request, time, sys, subprocess, tempfile, shutil, importlib.util
ICI = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('ph', os.path.join(ICI, 'photos.py')); ph = importlib.util.module_from_spec(spec); spec.loader.exec_module(ph)
PORT_HTTP, PORT_CDP = 9311, 9511
CHROME = ph.CHROME
SAVE = {'v': 2, 'sfx': False, 'mus': False, 'vox': False, 'tuto': 1, 'permis': 1, 'facile': 0, 'ex': {'runs': 5}, 'plq': {'m': 'fr', 'x': 'CC-161-RZ', 'ok': 1}}
OUT = '/Users/sachaberes/cash-car/embellir-photos/dunes'
# les prises : (nom, JS) — chaque JS rend une URL de données ou un objet
COUT = "(function(){var d=dbgScene(),r=d.rdr,i=r.info;i.autoReset=false;i.reset();r.render(d.scene,d.cam);i.autoReset=true;return {calls:i.render.calls,tri:i.render.triangles,prog:i.programs.length,tex:i.memory.textures,geo:i.memory.geometries};})()"
def photo(js): return "(function(){%s;return dbgScene().rdr.domElement.toDataURL('image/jpeg',0.9);})()" % js

def main():
    racine, pre = sys.argv[1], sys.argv[2]
    mets = sys.argv[3:]
    vues = os.environ.get('VUES', 'c1,c2,haut').split(',')
    os.makedirs(OUT, exist_ok=True)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT_HTTP), '--bind', '127.0.0.1'], cwd=racine, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    prof = tempfile.mkdtemp(prefix='dunes-chrome-')
    chrome = subprocess.Popen([CHROME, '--headless=new', '--remote-debugging-port=%d' % PORT_CDP, '--user-data-dir=' + prof, '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    try:
        for _ in range(60):
            time.sleep(1)
            try: urllib.request.urlopen('http://127.0.0.1:%d/json' % PORT_CDP, timeout=3); break
            except Exception: pass
        for m9 in mets:
            meteo, _, pal = m9.partition('@')
            c = ph.CDP(PORT_CDP); c.s.settimeout(120)
            c.send('Page.enable'); c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True})
            c.send('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 720, 'deviceScaleFactor': 1, 'mobile': False})
            c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(SAVE))})
            url = 'http://127.0.0.1:%d/index.html?colonne=0&simu=1&carte=dunes&meteo=%s&pistegraine=12345%s' % (PORT_HTTP, meteo, ('&palier=' + pal) if pal else '')
            c.send('Page.navigate', {'url': url})
            for _ in range(240):
                time.sleep(.5)
                if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
            time.sleep(1.5)
            c.ev("document.querySelector('[data-m=\"play\"]').click()")
            for _ in range(240):
                time.sleep(.5)
                if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
            c.ev("dbgAuto(1,0)")
            c.ev("dbgDunes()") # (réchauffe)
            tag = '%s-%s%s' % (pre, meteo, ('-palier' + pal) if pal else '')
            info = {'palier': c.ev('JSON.stringify(typeof dbgPalier==="function"?dbgPalier():null)'), 'rd': c.ev("(function(){var d=dbgDunes();return {on:d.on,noeuds:d.noeuds,acacias:d.acacias,palmiers:d.palmiers,L:d.L}})()")}
            def prise(nom, js):
                r = c.ev(photo(js))
                if not r or not r.startswith('data:'): print('  prise ratée', nom, flush=True); return
                open(os.path.join(OUT, '%s-%s.jpg' % (tag, nom)), 'wb').write(base64.b64decode(r.split(',', 1)[1]))
            for v in vues:
                if v == 'c1':   c.ev("dbgStep(420,16)"); prise('c1', "dbgStep(1,16)"); info['cout_c1'] = c.ev(COUT)
                elif v == 'c2': c.ev("dbgStep(360,16)"); prise('c2', "dbgStep(1,16)"); info['cout_c2'] = c.ev(COUT)
                elif v == 'haut': prise('haut', "dbgDunes('vueA',1500,40,0,.06)"); info['cout_haut'] = c.ev(COUT)
                elif v.startswith('v:'):  # v:s,h,cap,pente
                    a = v[2:].replace(';', ',')
                    prise('v' + a.split(',')[0], "dbgDunes('vueA',%s)" % a); info['cout_v'+a.split(',')[0]] = c.ev(COUT)
            info['err'] = c.ev("JSON.stringify({loop:window.__loopErr&&String(window.__loopErr),dn:window.__dnErr&&String(window.__dnErr)})")
            info['progs'] = c.ev("dbgScene().rdr.info.programs.length")
            print(tag, json.dumps(info, ensure_ascii=False), flush=True)
            c.s.close()
    finally:
        for p in (chrome, srv):
            try: os.killpg(p.pid, 15)
            except Exception: pass
        shutil.rmtree(prof, ignore_errors=True)

if __name__ == '__main__':
    main()
