#!/usr/bin/env python3
"""LE DÉMARRAGE À FROID (2026-11-04, passe perf mobile 2, T0).

    python3 outils/banc-perf/demarrage.py --palier 0 [--json sortie.json] [--n 3]

Chrome NEUF (profil temporaire, cache vide), iPhone 390×844 ×3, processeur ×4 posé AVANT la navigation, `?tel=1&palier=N&garde=1`.
Relève : l'instant où `.mPlay` est visible et touchable (le menu), les tâches longues (> 50 ms, `PerformanceObserver('longtask')` posé avant
la page) jusque-là, `Performance.getMetrics` (ScriptDuration, JSHeapUsedSize, LayoutDuration, RecalcStyleDuration), puis 10 s au menu :
images > 100 ms, programmes liés (`dbgProgs().length`), toiles (`dbgToiles()`). Avec --n 3 : trois passes, la MÉDIANE (sur l'instant du menu) est gardée,
les trois sont dans le JSON. Sortie 0 = ok, 2 = le banc n'a pas pu tourner. Même précaution que garde-perf : charge < 8, verrou-banc.sh.
"""
import sys,os,json,time,subprocess,tempfile,shutil,urllib.request,socket,statistics
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
from cdp import CDP
RACINE=os.path.dirname(os.path.dirname(ICI));VP=os.path.join(RACINE,'VERSION PRINCIPALE')
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
SAVE={'v':2,'sfx':False,'mus':False,'vox':False,'tuto':1,'permis':1,'lang':'fr','facile':0,'q':'net','qChoisi':1,'plq':{'m':0,'x':'BANC 01','ok':1}}
HOOK=r"""(function(){window.__LT=[];try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){window.__LT.push([Math.round(e.startTime),Math.round(e.duration)]);});}).observe({type:'longtask',buffered:true});}catch(e){}
 window.__F=[];window.__Fon=false;var l=performance.now();function f(t){if(window.__Fon)window.__F.push(t-l);l=t;requestAnimationFrame(f);}requestAnimationFrame(f);})();"""
BTN=r"""(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return null;var b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,h=document.elementFromPoint(x,y);return (h===e||e.contains(h))?[x,y]:null})()"""
def libre():
    s=socket.socket();s.bind(('127.0.0.1',0));p=s.getsockname()[1];s.close();return p
def chrome():
    for c in (os.environ.get('CHROME'),'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium'):
        if c and os.path.exists(c):return c
    sys.exit('Chrome introuvable : CHROME=/chemin/vers/chrome')
def tap(c,x,y,hold=.08):
    c.call('Input.dispatchTouchEvent',type='touchStart',touchPoints=[{'x':x,'y':y,'id':1}]);c.pump(hold);c.call('Input.dispatchTouchEvent',type='touchEnd',touchPoints=[])
def une(palier,http,port):
    base='http://127.0.0.1:%d'%http
    c=CDP(port)
    for m in ('Network.enable','Page.enable','Runtime.enable','Performance.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True)
    c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(SAVE)))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=HOOK)
    c.call('Emulation.setCPUThrottlingRate',rate=4) # ×4 AVANT la navigation : tout le chargement est ralenti
    t0=time.time()
    c.call('Page.navigate',url=base+'/index.html?tel=1&palier=%d&garde=1&pistegraine=777'%palier)
    menu=None;tlast=0
    while time.time()-t0<240:
        r=c.ev(BTN)
        if r:menu=time.time()-t0;break
        if time.time()-t0>20 and time.time()-tlast>4:tap(c,195,300);tlast=time.time() # l'écran titre attend un toucher (loin de JOUER)
        c.pump(.2)
    if menu is None:return None
    tmenu=c.ev("Math.round(performance.now())")
    LT=c.ev("JSON.stringify(window.__LT)");LT=json.loads(LT) if isinstance(LT,str) else []
    M={m['name']:m['value'] for m in c.call('Performance.getMetrics')['metrics']}
    c.ev("window.__F.length=0;window.__Fon=true;1");c.pump(10);c.ev("window.__Fon=false;1")
    F=json.loads(c.ev("JSON.stringify(window.__F)"))
    ap=c.ev("JSON.stringify({progs:typeof dbgProgs==='function'?dbgProgs().length:null,toiles:typeof dbgToiles==='function'?dbgToiles().rendues:null,lt2:window.__LT.length})")
    ap=json.loads(ap)
    lt=[x for x in LT if x[0]<=tmenu]
    return {'menu_s':round(menu,2),'menu_ms_page':tmenu,'taches_50':len(lt),'taches':[{'t':x[0],'ms':x[1]} for x in lt],'taches_ms':sum(x[1] for x in lt),'pire_tache':max([x[1] for x in lt] or [0]),
      'script_s':round(M.get('ScriptDuration',0),3),'layout_s':round(M.get('LayoutDuration',0),3),'style_s':round(M.get('RecalcStyleDuration',0),3),'tas_mo':round(M.get('JSHeapUsedSize',0)/1048576,1),
      'menu10s':{'pire':round(max(F[1:] or [0])),'longues':sum(1 for x in F[1:] if x>100),'images':len(F)},'programmes':ap['progs'],'toiles':ap['toiles'],'taches_apres':ap['lt2']-len(LT)}
def passe(palier):
    http=libre();port=libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='demarrage-') # profil neuf = cache vide
    ch=subprocess.Popen([chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    try:
        for i in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        else:return None
        return une(palier,http,port)
    finally:
        for p in (ch,srv):
            try:p.terminate();p.wait(5)
            except Exception:
                try:p.kill()
                except Exception:pass
        try:os.killpg(ch.pid,9)
        except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
def main():
    av=sys.argv[1:];palier=0;sortie=None;n=1;i=0
    while i<len(av):
        if av[i]=='--palier':palier=int(av[i+1]);i+=2
        elif av[i]=='--json':sortie=av[i+1];i+=2
        elif av[i]=='--n':n=int(av[i+1]);i+=2
        else:i+=1
    R=[]
    for k in range(n):
        r=passe(palier)
        if r is None:print('⛔ passe %d : le menu n\'est jamais apparu'%(k+1));continue
        R.append(r);print('passe %d : menu à %.1f s · %d tâches > 50 ms (%d ms, pire %d) · ScriptDuration %.2f s · tas %.0f Mo · 10 s au menu : pire %d ms, %d images > 100 ms · %s programmes'%(k+1,r['menu_s'],r['taches_50'],r['taches_ms'],r['pire_tache'],r['script_s'],r['tas_mo'],r['menu10s']['pire'],r['menu10s']['longues'],r['programmes']))
    if not R:return 2
    med=sorted(R,key=lambda r:r['menu_s'])[len(R)//2]
    if sortie:json.dump({'date':time.strftime('%Y-%m-%d %H:%M'),'palier':palier,'cpu':4,'charge':round(os.getloadavg()[0],1),'mediane':med,'passes':R},open(sortie,'w'),indent=1,ensure_ascii=False)
    return 0
if __name__=='__main__':sys.exit(main())
