#!/usr/bin/env python3
"""Profil du chargement à froid (palier 0, iPhone émulé) + compteurs par famille et captures sur 3 maps au palier 0."""
import sys,os,json,time,subprocess,tempfile,shutil,urllib.request,socket
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
from cdp import CDP
VP=os.path.join(ICI,'jeu');OUT=ICI
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
SAVE={'v':2,'sfx':False,'mus':False,'vox':False,'tuto':1,'permis':1,'lang':'fr','facile':0,'q':'net','qChoisi':1,'plq':{'m':0,'x':'BANC 01','ok':1}}
HOOK=r"""(function(){window.__LT=[];try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){window.__LT.push([Math.round(e.startTime),Math.round(e.duration)]);});}).observe({type:'longtask',buffered:true});}catch(e){}})();"""
BTN=r"""(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return null;var b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,h=document.elementFromPoint(x,y);return (h===e||e.contains(h))?[x,y]:null;})()"""
def libre():
    s=socket.socket();s.bind(('127.0.0.1',0));p=s.getsockname()[1];s.close();return p
def tap(c,x,y,hold=.08):
    c.call('Input.dispatchTouchEvent',type='touchStart',touchPoints=[{'x':x,'y':y,'id':1}]);c.pump(hold);c.call('Input.dispatchTouchEvent',type='touchEnd',touchPoints=[])
def charge():
    try:return float(os.getloadavg()[0])
    except Exception:return -1
def attend_menu(c,t0,tmax=300):
    tlast=0
    while time.time()-t0<tmax:
        r=c.ev(BTN)
        if r:return r
        if time.time()-t0>20 and time.time()-tlast>4:tap(c,195,300);tlast=time.time()
        c.pump(.3)
    return None
http=libre();port=libre()
srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
prof=tempfile.mkdtemp(prefix='fable-profil-')
CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
ch=subprocess.Popen([CH,'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
R={'charge_debut':charge(),'t':time.strftime('%Y-%m-%d %H:%M')}
try:
    for i in range(60):
        time.sleep(.5)
        try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
        except Exception:pass
    else:sys.exit('Chrome ne répond pas')
    base='http://127.0.0.1:%d'%http
    c=CDP(port)
    for m in ('Network.enable','Page.enable','Runtime.enable','Performance.enable','Profiler.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True)
    c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(SAVE)))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=HOOK)
    # ---- 1. le profil du chargement (×1 : la machine est chargée, on veut des PROPORTIONS) ----
    c.call('Profiler.setSamplingInterval',interval=250)
    c.call('Profiler.start')
    t0=time.time()
    c.call('Page.navigate',url=base+'/index.html?tel=1&palier=0&garde=1&pistegraine=777')
    r=attend_menu(c,t0)
    menu=time.time()-t0 if r else None
    P=c.call('Profiler.stop')['profile']
    json.dump(P,open(os.path.join(OUT,'chargement.cpuprofile'),'w'))
    LT=c.ev("JSON.stringify(window.__LT)");LT=json.loads(LT) if isinstance(LT,str) else []
    M={m['name']:m['value'] for m in c.call('Performance.getMetrics')['metrics']}
    R['chargement']={'menu_s':menu,'taches_50':LT,'script_s':M.get('ScriptDuration'),'tas_mo':round(M.get('JSHeapUsedSize',0)/1048576,1),'charge':charge()}
    c.shot(os.path.join(OUT,'menu-p0.png'))
    if r:
        # ---- 2. trois maps au palier 0 : compteurs par famille + capture ----
        for carte,meteo in (('nuages','midi'),('dunes','soir'),('foret','midi')):
            t0=time.time()
            c.call('Page.navigate',url=base+'/index.html?tel=1&palier=0&garde=1&pistegraine=777&carte=%s&meteo=%s'%(carte,meteo))
            b=attend_menu(c,t0)
            if not b:R[carte]={'err':'pas de menu'};continue
            tap(c,b[0],b[1]);c.pump(2)
            for k in range(60):  # attendre la course
                st=c.ev("JSON.stringify({started:typeof dbgState==='function'?!!dbgState().started:null,s:typeof dbgState==='function'?(dbgState().s|0):null})")
                st=json.loads(st) if isinstance(st,str) else {}
                if st.get('started') and (st.get('s') or 0)>300:break
                if k==20:tap(c,195,420)  # une fenêtre éventuelle
                c.pump(1)
            c.ev("try{dbgCout(1)}catch(e){};1");c.pump(1.5)
            cout=c.ev("JSON.stringify((function(){try{return dbgCout()}catch(e){return {err:String(e)}}})())")
            app=c.ev("JSON.stringify((function(){try{return dbgAppels()}catch(e){return {err:String(e)}}})())")
            st=c.ev("JSON.stringify((function(){try{var s=dbgState();return {s:s.s|0,started:s.started,carte:s.carte||null}}catch(e){return {err:String(e)}}})())")
            R[carte]={'cout':json.loads(cout) if isinstance(cout,str) else cout,'appels':json.loads(app) if isinstance(app,str) else app,'etat':json.loads(st) if isinstance(st,str) else st,'charge':charge()}
            c.shot(os.path.join(OUT,'course-%s-p0.png'%carte))
            # la même image au palier 2, pour comparer à l'œil
            t0=time.time()
            c.call('Page.navigate',url=base+'/index.html?tel=1&palier=2&garde=1&pistegraine=777&carte=%s&meteo=%s'%(carte,meteo))
            b=attend_menu(c,t0)
            if b:
                tap(c,b[0],b[1]);c.pump(2)
                for k in range(60):
                    st=c.ev("JSON.stringify({started:typeof dbgState==='function'?!!dbgState().started:null,s:typeof dbgState==='function'?(dbgState().s|0):null})")
                    st=json.loads(st) if isinstance(st,str) else {}
                    if st.get('started') and (st.get('s') or 0)>300:break
                    if k==20:tap(c,195,420)
                    c.pump(1)
                c.ev("try{dbgCout(1)}catch(e){};1");c.pump(1.5)
                cout=c.ev("JSON.stringify((function(){try{return dbgCout()}catch(e){return {err:String(e)}}})())")
                app=c.ev("JSON.stringify((function(){try{return dbgAppels()}catch(e){return {err:String(e)}}})())")
                R[carte]['p2']={'cout':json.loads(cout) if isinstance(cout,str) else cout,'appels':json.loads(app) if isinstance(app,str) else app}
                c.shot(os.path.join(OUT,'course-%s-p2.png'%carte))
finally:
    R['charge_fin']=charge()
    json.dump(R,open(os.path.join(OUT,'resultat.json'),'w'),indent=1,ensure_ascii=False)
    try:ch.terminate();ch.wait(5)
    except Exception:
        try:ch.kill()
        except Exception:pass
    srv.terminate();shutil.rmtree(prof,ignore_errors=True)
print('fini',json.dumps({k:(v if k!='chargement' else {'menu_s':v['menu_s'],'script_s':v['script_s']}) for k,v in R.items() if k in('chargement','charge_debut','charge_fin')}))
