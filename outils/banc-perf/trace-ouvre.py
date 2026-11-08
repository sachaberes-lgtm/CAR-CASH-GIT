#!/usr/bin/env python3
"""TRACE-OUVRE (trace Chrome rendering/painting de l'ouverture ; modèle : OUVRE-PROFIL (2026-11-08, Perf 3 — P5) : profil processeur x4 de l'OUVERTURE de la boutique (`shop`) ou de l'inventaire (`inv`), du toucher à 3 s après.
    python3 outils/banc-perf/ouvre-profil.py shop|inv [--qs '&x=1'] [--cpu 4] [--top 25]
Sortie : images > 50 ms (durée, instant), puis les fonctions par temps PROPRE (ms) avec leur ligne d'index.html."""
import sys,os,json,time,subprocess,tempfile,shutil,importlib.util,urllib.request,collections
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
sp=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));G=importlib.util.module_from_spec(sp);sp.loader.exec_module(G)
from cdp import CDP
def main():
    av=sys.argv[1:];quoi=av[0] if av else 'shop';qs='';cpu=4;top=25;att=10
    for i,a in enumerate(av):
        if a=='--qs':qs=av[i+1]
        if a=='--cpu':cpu=int(av[i+1])
        if a=='--top':top=int(av[i+1])
        if a=='--attente':att=int(av[i+1])
    http=G.libre();port=G.libre();RAC=os.path.dirname(os.path.dirname(ICI));VP=os.path.join(RAC,'VERSION PRINCIPALE')
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='ouvre-')
    ch=subprocess.Popen([G.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for k in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        c=CDP(port);c.keep={'Runtime.exceptionThrown'}
        for m in ('Network.enable','Page.enable','Runtime.enable','Profiler.enable'):c.call(m)
        c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
        try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
        except Exception:pass
        c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
        c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=G.UA,platform='iPhone')
        base='http://127.0.0.1:%d'%http
        c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
        c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(dict(G.SAVE,cash=900000000))))
        c.call('Page.addScriptToEvaluateOnNewDocument',source=G.HOOK)
        c.call('Page.navigate',url=base+'/index.html?garde=1&palier=2&tel=1&pistegraine=777'+qs)
        if not G.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):print('jeu ne demarre pas');return 2
        t=time.time()
        while time.time()-t<120 and not c.ev("!window.__introCouvre&&(window.__imagesJeu|0)>5"):
            G.tap(c,195,300);c.pump(1.5)
        G.attend(c,"dbgPrebati().etat==='pret'",60);c.pump(att)
        print('photos gardées :',c.ev('dbgPhotoFile().gardees'),'cache :',c.ev('dbgPhotoMem&&JSON.stringify(dbgPhotoMem()).slice(0,80)'))
        c.call('Emulation.setCPUThrottlingRate',rate=cpu)
        if quoi=='inv':
            g=c.ev("(function(){var e=[].slice.call(document.querySelectorAll('[data-m=garage]')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return null;var b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()")
            if g:G.tap(c,g[0],g[1],.12)
            c.pump(6)
            act="(function(){var e=document.getElementById('gvCof');if(!e)return 'sans bouton';e.click();return INVOK()})()".replace('INVOK()',"document.getElementById('gInv')?'ok':'?'")
            pt=None
        else:
            pt=c.ev("(function(){var e=[].slice.call(document.querySelectorAll('[data-m=shop]')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return null;var b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()")
        c.ev("window.__F.length=0;window.__Fon=true;1")
        c.keep={'Tracing.dataCollected','Tracing.tracingComplete'}
        c.call('Tracing.start',categories='devtools.timeline,disabled-by-default-devtools.timeline,cc,gpu,viz',transferMode='ReportEvents')
        if quoi=='inv':c.ev(act)
        elif pt:G.tap(c,pt[0],pt[1],.12)
        c.pump(3.5)
        print('inventaire ouvert :',c.ev("document.getElementById('gInv').className+' | '+(document.body.className.slice(0,80))"))
        print('ecran DOM :',c.ev("document.getElementById('overlay').dataset.ecran"),'pt',pt)
        try:c.call('Tracing.end')
        except Exception as e:print('end',e)
        c.pump(6)
        print('rAF>50ms:',[round(x) for x in (c.ev('window.__F.slice()') or []) if x>50])
        E=[]
        for ev in c.events:
            if ev.get('method')=='Tracing.dataCollected':E+=ev['params']['value']
        T0=min((e['ts'] for e in E if e.get('ph')=='X' and e.get('name')=='RunTask'),default=0)
        print('événements',len(E))
        agg=collections.Counter();big=[]
        for e in E:
            if e.get('ph')!='X':continue
            d=e.get('dur',0)/1000;n=e['name'];agg[n]+=d
            if d>40:big.append((round((e['ts']-T0)/1000),round(d),n,e.get('tid'),e.get('args',{}).get('data',{}).get('functionName','') if isinstance(e.get('args',{}).get('data'),dict) else ''))
        for n,ms in agg.most_common(30):print('%8.0f ms  %s'%(ms,n))
        print('--- événements > 40 ms (t, durée, nom) ---')
        for b in sorted(big)[:50]:print(b)
        return 0
    finally:
        for p in (ch,srv):
            try:p.terminate();p.wait(5)
            except Exception:
                try:p.kill()
                except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
sys.exit(main())
