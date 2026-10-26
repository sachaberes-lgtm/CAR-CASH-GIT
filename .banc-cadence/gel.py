#!/usr/bin/env python3
"""Preuve : cadence 30 (gel) vs 60 — la qualité remonte-t-elle ? iPhone simulé, palier 2, sans ralentissement du processeur."""
import sys,os,json,time,subprocess,socket,urllib.request,tempfile,shutil
RAC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,os.path.join(RAC,'outils','banc-perf'))
import importlib.util
sp=importlib.util.spec_from_file_location('gp',os.path.join(RAC,'outils','banc-perf','garde-perf.py'));gp=importlib.util.module_from_spec(sp);sp.loader.exec_module(gp)
from cdp import CDP
VP=gp.VP
def main():
    http=gp.libre();port=gp.libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    prof=tempfile.mkdtemp(prefix='gel-')
    ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    try:
        for i in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        return run(http,port)
    finally:
        for p in (ch,srv):
            try:os.killpg(p.pid,15)
            except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
def run(http,port):
    base='http://127.0.0.1:%d'%http
    c=CDP(port)
    for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(gp.SAVE)))
    c.call('Page.navigate',url=base+'/index.html?palier=2&pistegraine=777&carte=nuages&meteo=midi'+(sys.argv[1] if len(sys.argv)>1 else ''))
    if not gp.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):print('jeu ne démarre pas');return 2
    if not gp.attend(c,"(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];return !!e})()",90):
        t=time.time()
        while time.time()-t<60 and not c.ev(gp.BTN):gp.tap(c,195,300);c.pump(.8)
    gp.attend(c,"dbgPrebati().etat==='pret'",60);c.pump(1)
    t=time.time();ok=False
    while time.time()-t<90 and not ok:
        r=c.ev(gp.BTN)
        if r:gp.tap(c,r[0],r[1],.12);ok=True
        else:
            g=c.ev("(function(){var e=document.getElementById('gJouer');if(!e)return null;var b=e.getBoundingClientRect();return b.width>0?[b.left+b.width/2,b.top+b.height/2]:null})()")
            if g:gp.tap(c,g[0],g[1],.12);ok=True
            elif time.time()-t>25:gp.tap(c,195,300);c.pump(3)
            else:c.pump(.5)
    if not gp.attend(c,"dbgState().started&&!dbgState().gameOver",60):print('JOUER ne part pas');return 2
    c.pump(3);c.ev("dbgAuto(1,0,{});1")
    print('TEL_NATIF/palier :',c.ev("JSON.stringify({pal:dbgPalier().n,cad:dbgCadence(),q:dbgQual().k})"))
    def phase(nom,cad,sec=24):
        c.ev("dbgQual(9);dbgPin(false);dbgCadence(%d);1"%cad)
        t=time.time();s=[]
        while time.time()-t<sec:
            c.pump(3);s.append(c.ev("(function(){var q=dbgQual();return q.k+'@'+q.dpr+(dbgCadence().on?'(30)':'(60)')+(dbgCadence().gel?'G':'')})()"))
        print('%-28s cran@dpr :'%nom,' '.join(s))
    phase('cadence 30 calée (gel)',30)
    phase('cadence 60 (sans gel)',60)
    phase('cadence 30 calée (gel) bis',30)
    return 0
if __name__=='__main__':sys.exit(main())
