#!/usr/bin/env python3
"""MENUS-CHALEUR (2026-11-07, Perf 3 — P5) : le TRAVAIL PAR SECONDE de chaque écran de menu, téléphone émulé (`?tel=1&palier=2`), sans toucher.
    python3 outils/banc-perf/menus-chaleur.py [--qs '&menu=max'] [--sec 10] [--json f] [--shots dossier]
Par écran (accueil, inventaire, boutique) sur `sec` secondes : images 3D rendues/s (`__imagesJeu`), rAF/s, appels et triangles par image,
appels/s et triangles/s, JS (cpu p50 x images/s = ms de JS par seconde), et l'état (dbgHC : HC, VHD, cadence). Un banc à la fois (verrou)."""
import sys,os,json,time,subprocess,tempfile,shutil,importlib.util,urllib.request
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
sp=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));G=importlib.util.module_from_spec(sp);sp.loader.exec_module(G)
from cdp import CDP
OPT={'qs':'','json':None,'shots':None,'sec':10}
def lire(c,nom):
    c.ev("dbgCout(1);window.__F.length=0;window.__Fon=true;window.__i0=window.__imagesJeu|0;window.__t0=performance.now();1")
    c.pump(OPT['sec'])
    r=json.loads(c.ev("""(function(){var k=dbgCout(),dt=(performance.now()-window.__t0)/1000,n=(window.__imagesJeu|0)-window.__i0;window.__Fon=false;
      var img=k.image||{};var cp=k.cpu?k.cpu.p50:0;
      return JSON.stringify({sec:+dt.toFixed(1),imagesParS:+(n/dt).toFixed(1),rafParS:+(window.__F.length/dt).toFixed(1),appelsImg:img.calls,trisImg:img.tris,
        appelsParS:Math.round((img.calls||0)*n/dt),trisKParS:Math.round((img.tris||0)*n/dt/1000),jsMsImg:cp,jsMsParS:Math.round((cp||0)*n/dt),
        toile:k.toile,dpr:k.dpr,ombre:k.ombre,vhd:k.vhd,passes:k.passes,bloom:k.bloom,hc:window.dbgHC&&dbgHC()})})()"""))
    c.ev("dbgCout(0);1");r['ecran']=nom
    if OPT['shots']:
        os.makedirs(OPT['shots'],exist_ok=True);c.shot(os.path.join(OPT['shots'],nom+'.png'))
    print(json.dumps(r));sys.stdout.flush();return r
def main():
    av=sys.argv[1:];i=0
    while i<len(av):
        a=av[i]
        if a=='--qs':OPT['qs']=av[i+1];i+=2
        elif a=='--json':OPT['json']=av[i+1];i+=2
        elif a=='--shots':OPT['shots']=av[i+1];i+=2
        elif a=='--sec':OPT['sec']=int(av[i+1]);i+=2
        else:i+=1
    http=G.libre();port=G.libre();RAC=os.path.dirname(os.path.dirname(ICI));VP=os.path.join(RAC,'VERSION PRINCIPALE')
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='chaleur-')
    ch=subprocess.Popen([G.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    R=[]
    try:
        for k in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        c=CDP(port);c.keep={'Runtime.exceptionThrown'}
        for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
        c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
        try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
        except Exception:pass
        c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
        c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=G.UA,platform='iPhone')
        base='http://127.0.0.1:%d'%http
        c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
        c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(dict(G.SAVE,cash=900000000))))
        c.call('Page.addScriptToEvaluateOnNewDocument',source=G.HOOK)
        c.call('Page.navigate',url=base+'/index.html?garde=1&palier=2&tel=1&pistegraine=777'+OPT['qs'])
        if not G.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):print('jeu ne demarre pas');return 2
        t=time.time()
        while time.time()-t<120 and not c.ev("!window.__introCouvre&&(window.__imagesJeu|0)>5"):
            G.tap(c,195,300);c.pump(1.5)
        G.attend(c,"dbgPrebati().etat==='pret'",60);c.pump(10)
        R.append(lire(c,'1-accueil'))
        c.ev("dbgInv('ouvre')");c.pump(3)
        R.append(lire(c,'2-inventaire'))
        c.ev("dbgInv('ferme');1");c.pump(2)
        pt=c.ev("(function(){var e=[].slice.call(document.querySelectorAll('[data-m=shop]')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return null;var b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()")
        if pt:G.tap(c,pt[0],pt[1],.12)
        c.pump(8)
        R.append(lire(c,'3-boutique'))
        if OPT['json']:json.dump(R,open(OPT['json'],'w'),indent=1)
        return 0
    finally:
        for p in (ch,srv):
            try:p.terminate();p.wait(5)
            except Exception:
                try:p.kill()
                except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
sys.exit(main())
