#!/usr/bin/env python3
"""LES BASCULES DU GOUVERNEUR (2026-11-07, passe 3) : le coût à chaud d'un changement de palier (imgRegle) — images > 100 ms et pire image dans les 4 s qui suivent chaque bascule de dose.
    python3 outils/banc-perf/bascules.py [--qs '&gouv=max'] [--doses 0,70,110,150,70] [--attente 25] [--json f.json] [--cpu 4]
iPhone émulé (390×844 ×3, `?tel=1&palier=2&garde=1&pistegraine=777`), JOUER, pilote automatique (dbgAuto), puis `dbgGouv(dose)` pour chaque dose (une tous les --attente s) ; relevé des images rAF (HOOK de garde-perf).
Machine chargée = ms faux : lire les COMPTES d'images longues et leur place (juste après la bascule ou non)."""
import sys,os,json,time,subprocess,tempfile,shutil,importlib.util,urllib.request
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
sp=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));G=importlib.util.module_from_spec(sp);sp.loader.exec_module(G)
from cdp import CDP
def arg(n,d=None):
    a=sys.argv;return a[a.index(n)+1] if n in a else d
qs=arg('--qs','');doses=[float(x) for x in arg('--doses','0,70,110,150,70').split(',')];att=float(arg('--attente','25'));cpu=int(arg('--cpu','4'));sortie=arg('--json')
http=G.libre();port=G.libre()
srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=G.VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
prof=tempfile.mkdtemp(prefix='bascules-')
ch=subprocess.Popen([G.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
res={'qs':qs,'doses':doses,'bascules':[]}
try:
    for i in range(60):
        time.sleep(.5)
        try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
        except Exception:pass
    c=CDP(port);base='http://127.0.0.1:%d'%http
    for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True)
    c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=G.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(G.SAVE)))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=G.HOOK)
    c.call('Page.navigate',url=base+'/index.html?garde=1&palier=2&tel=1&pistegraine=777&carte=nuages&meteo=midi'+qs)
    if not G.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):print('le jeu ne démarre pas');sys.exit(2)
    t=time.time()
    while time.time()-t<90 and not c.ev(G.BTN):G.tap(c,195,422);c.pump(.6)
    c.call('Emulation.setCPUThrottlingRate',rate=cpu)
    G.attend(c,"dbgPrebati().etat==='pret'",60);c.pump(1)
    r=c.ev(G.BTN)
    if r:G.tap(c,r[0],r[1],.12)
    if not G.attend(c,"dbgState().started&&!dbgState().gameOver",60):print('JOUER ne part pas');sys.exit(2)
    c.pump(3);c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{});1")
    c.ev("window.__F.length=0;window.__Fon=true;1");c.pump(8);F0=c.ev("window.__F.slice()") or [];res['avant']={'pire':round(max(F0[1:] or [0])),'longues':sum(1 for x in F0[1:] if x>100),'n':len(F0)}
    for d in doses:
        c.ev("dbgGouv(%s);1"%d);c.ev("window.__F.length=0;window.__Fon=true;1")
        c.pump(4);F1=c.ev("window.__F.slice()") or [];c.pump(max(1,att-4));F2=c.ev("window.__Fon=false;window.__F.slice()") or []
        res['bascules'].append({'dose':d,'apres4s':{'pire':round(max(F1[1:] or [0])),'longues':sum(1 for x in F1[1:] if x>100),'n':len(F1)},'fenetre':{'pire':round(max(F2[1:] or [0])),'longues':sum(1 for x in F2[1:] if x>100),'n':len(F2)},'reglage':c.ev("typeof dbgGouv==='function'?JSON.stringify(dbgGouv()):null")})
        print('dose %5.0f : 4 s après %2d images > 100 ms (pire %4d) · fenêtre %2d (pire %4d) · %s'%(d,res['bascules'][-1]['apres4s']['longues'],res['bascules'][-1]['apres4s']['pire'],res['bascules'][-1]['fenetre']['longues'],res['bascules'][-1]['fenetre']['pire'],str(res['bascules'][-1]['reglage'])[:90]),flush=True)
finally:
    for p in (ch,srv):
        try:p.terminate()
        except Exception:pass
    try:os.killpg(ch.pid,9)
    except Exception:pass
    shutil.rmtree(prof,ignore_errors=True)
    if sortie:json.dump(res,open(sortie,'w'),indent=1,ensure_ascii=False)
