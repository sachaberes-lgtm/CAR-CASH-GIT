#!/usr/bin/env python3
# LE PARCOURS PHOTO (2026-11-13, passe JADE NUIT) — la même map photographiée à PLUSIEURS ENDROITS de sa route, sur le chemin iPhone,
# avec, à chaque endroit, un ou plusieurs réglages d'ambiance essayés sur l'image figée (comme studio.py, mais le long du parcours).
#
#   TEL=paysage python3 outils/banc-lumiere/parcours.py jade:nuit [essais.json]
#
# Env : PALIER=0|1|2 (défaut 2 : le téléphone récent ; 0 = le cran bas, distance de vue réduite) ; POS="300,1400,2600" (abscisses en mètres, posées par ALLER, défaut dbgJadeAller) ; VOL="2600" (abscisses où la caisse saute avant la prise) ;
#       PARAMS (ex. '&jadenuit=0') ; NOM (préfixe des fichiers, défaut le temps) ; OUT ; TEL=portrait|paysage ; PH / PC (ports).
# Sortie : OUT/<NOM>-<tel>-<abscisse>[-<essai>].jpg + mesures. UN Chrome sans tête, muet, fermé à la fin.
import os, sys, json, time, base64, subprocess, tempfile, shutil, urllib.request
os.environ.setdefault('TEL', 'paysage')
ICI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, ICI)
import photos as P

def main():
    carte, meteo = sys.argv[1].split(':'); essais = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else {}
    out = os.environ.get('OUT', os.path.join(ICI, 'sorties', 'parcours')); os.makedirs(out, exist_ok=True)
    pos = [int(x) for x in os.environ.get('POS', '300,1500,3000').split(',')]; vol = [int(x) for x in os.environ.get('VOL', '').split(',') if x]
    aller = os.environ.get('ALLER', 'dbgJadeAller'); nomf = os.environ.get('NOM', meteo); tel = os.environ['TEL']
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(P.PORT_HTTP), '--bind', '127.0.0.1'], cwd=P.JEU, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    prof = tempfile.mkdtemp(prefix='parcours-chrome-')
    chrome = subprocess.Popen([P.CHROME, '--headless=new', '--remote-debugging-port=%d' % P.PORT_CDP, '--user-data-dir=' + prof, '--mute-audio', '--no-first-run',
                               '--window-size=1280,900', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(180):
            time.sleep(1)
            try: urllib.request.urlopen('http://127.0.0.1:%d/json' % P.PORT_CDP); break
            except Exception: pass
        c = P.CDP(P.PORT_CDP)
        c.send('Network.enable'); c.send('Network.setBypassServiceWorker', {'bypass': True}); c.send('Network.setCacheDisabled', {'cacheDisabled': True}); c.send('Page.enable')
        c.send('Emulation.setDeviceMetricsOverride', {'width': P.LW, 'height': P.LH, 'deviceScaleFactor': P.LD, 'mobile': P.LM})
        c.send('Emulation.setTouchEmulationEnabled', {'enabled': True, 'maxTouchPoints': 5})
        c.send('Page.addScriptToEvaluateOnNewDocument', {'source': 'try{localStorage.setItem("cashcarSave",%s)}catch(e){}' % json.dumps(json.dumps(P.SAVE))})
        c.send('Page.navigate', {'url': 'http://127.0.0.1:%d/index.html?colonne=0&simu=1&garde=1&carte=%s&meteo=%s%s' % (P.PORT_HTTP, carte, meteo, os.environ.get('PARAMS', ''))})
        for _ in range(240):
            time.sleep(.5)
            if c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')"): break
        time.sleep(1.5); c.ev("document.querySelector('[data-m=\"play\"]').click()")
        for _ in range(240):
            time.sleep(.5)
            if c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"): break
        c.ev("window.requestAnimationFrame=function(){return 0};dbgAuto(1,0,{})")  # la boucle ne tourne plus que par dbgStep (pas fixe) : les mêmes abscisses donnent les mêmes cadrages d'une prise à l'autre (avant / après)
        for _ in range(int(os.environ.get('T', 6))): c.ev("dbgStep(60,17)"); time.sleep(.3)  # T secondes de jeu : la map finit de se bâtir (ses minuteurs tournent entre deux lots)
        nom = c.ev("dbgCielObj().BIO.name"); print('ambiance', nom, '| sonde', c.ev(os.environ.get('JS', "JSON.stringify({L:Math.round(L),tel:typeof ALLEGE!=='undefined'&&ALLEGE})")), flush=True)
        base = json.loads(c.ev("JSON.stringify(dbgAmb(%s))" % json.dumps(nom))); mes = {}; json.dump(base, open(os.path.join(out, 'base-%s.json' % nomf), 'w'))
        for s in pos:
            c.ev("dbgDA({degele:1})"); print(s, '→', c.ev("%s(%d)" % (aller, s)), flush=True)
            c.ev("dbgStep(%d,17)" % int(os.environ.get('PAS', 50)))
            if s in vol: c.ev("dbgAuto(1,0,{saut:.2,vol:1})"); c.ev("dbgStep(%d,17)" % int(os.environ.get('PASVOL', 45)))
            c.ev("dbgDA({fige:1})")
            for k, v in ([('', {})] + list(essais.items())) if essais else [('', {})]:
                r = {}
                for f, val in v.items():
                    if f[0] == '@': continue
                    if f[0] == '*':
                        b = base.get(f[1:]); r[f[1:]] = [x * val for x in b] if isinstance(b, list) and not isinstance(val, list) else [x * y for x, y in zip(b, val)] if isinstance(b, list) else b * val
                    else: r[f] = val
                if essais:
                    c.ev("dbgAmb(%s,%s)" % (json.dumps(nom), json.dumps(base))); c.ev("dbgAmb(%s,%s)" % (json.dumps(nom), json.dumps(r)))
                    if v.get('@js'): c.ev(v['@js'])
                    c.ev("dbgDA({degele:1});dbgStep(3,1);dbgDA({fige:1})")
                c.ev(P.CACHE); time.sleep(.35)
                d = c.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 90})['data']
                f = os.path.join(out, '%s-%s-%04d%s.jpg' % (nomf, tel, s, ('-' + k) if k else '')); open(f, 'wb').write(base64.b64decode(d))
                try: m = json.loads(c.ev(P.MESURE + '(' + json.dumps(d) + ')')); mes[os.path.basename(f)] = {'L': round(m['L'], 1), 'C': round(m['C'], 1), 'route': round(m['route']['L'], 1), 'ciel': round(m['ciel']['L'], 1), 'noirBas': round(m['noirBas'], 2)}
                except Exception as e: mes[os.path.basename(f)] = str(e)
                print(os.path.basename(f), mes[os.path.basename(f)], flush=True)
            if s in vol: c.ev("dbgAuto(1,0,{})")
        print('erreurs (genres)', c.ev("JSON.stringify(typeof dbgErreurs==='function'?dbgErreurs().map(function(e){return e.g+(/panne|Error|undefined|not defined/i.test(e.k)?' ⚠ '+e.k.slice(0,160):'')}):null)"), flush=True)  # gel / serpent / attente = la machine du banc ; tout le reste se lit
        json.dump(mes, open(os.path.join(out, 'mesures-%s-%s.json' % (nomf, tel)), 'w'), indent=1)
    finally:
        chrome.terminate(); srv.terminate(); shutil.rmtree(prof, ignore_errors=True)

if __name__ == '__main__': main()
