#!/usr/bin/env python3
"""BANC C1 (2026-11-05, passe perf mobile 2) : profil CPU de 8 s de course (palier 0, tel, processeur x4) + compteurs Layout/RecalcStyle/s
et captures du HUD. Usage : python3 outils/banc-perf/hud-profil.py [--hudcache 0|1] [--couche] [--sortie dossier] [--secs 8]
Lancer sous `sh ~/cash-car/verrou-banc.sh prendre C1` ... `rendre`. Un Chrome, fermé à la fin."""
import sys,os,json,time,subprocess,tempfile,shutil,importlib.util
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
sp=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(sp);sp.loader.exec_module(gp)
from cdp import CDP
def arg(n,d=None):
    return sys.argv[sys.argv.index(n)+1] if n in sys.argv else d
CACHE=arg('--hudcache');COUCHE='--couche' in sys.argv;OUT=arg('--sortie','/tmp/c1');SECS=float(arg('--secs','8'));PAL=arg('--palier','0')
os.makedirs(OUT,exist_ok=True)
def main():
    http=gp.libre();port=gp.libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=gp.VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='c1-')
    ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for i in range(60):
            time.sleep(.5)
            try:gp.urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        return run(http,port)
    finally:
        for p in (ch,srv):
            try:p.terminate();p.wait(5)
            except Exception:
                try:p.kill()
                except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
def run(http,port):
    base='http://127.0.0.1:%d'%http;c=CDP(port)
    for m in ('Network.enable','Page.enable','Runtime.enable','Performance.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    W,H=(844,390) if COUCHE else (390,844)
    c.call('Emulation.setDeviceMetricsOverride',width=W,height=H,deviceScaleFactor=2,mobile=True,screenWidth=W,screenHeight=H,screenOrientation={'type':'landscapePrimary' if COUCHE else 'portraitPrimary','angle':90 if COUCHE else 0})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(gp.SAVE)))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=gp.HOOK)
    u=base+'/index.html?garde=1&palier=%s&tel=1&pistegraine=777&carte=nuages&meteo=midi'%PAL
    if CACHE is not None:u+='&hudcache='+CACHE
    c.call('Page.navigate',url=u)
    if not gp.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):print('jeu ne démarre pas');return 2
    if not gp.attend(c,"(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];return !!e})()",90):
        t=time.time()
        while time.time()-t<60 and not c.ev(gp.BTN):gp.tap(c,W//2,300);c.pump(.8)
    c.call('Emulation.setCPUThrottlingRate',rate=4)
    gp.attend(c,"dbgPrebati().etat==='pret'",60);c.pump(1)
    t=time.time();ok=False
    while time.time()-t<90 and not ok:
        r=c.ev(gp.BTN)
        if r:gp.tap(c,r[0],r[1],.12);ok=True
        elif time.time()-t>25:gp.tap(c,W//2,300);c.pump(3)
        else:c.pump(.5)
    if not gp.attend(c,"dbgState().started&&!dbgState().gameOver",60):print('JOUER ne part pas');return 2
    c.pump(3);c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{});1");c.pump(2)
    # détecteur d'appels forcés : compte getBoundingClientRect/getComputedStyle appelés quand le style/la mise en page est sale
    def m():return {k['name']:k['value'] for k in c.call('Performance.getMetrics')['metrics']}
    c.call('Profiler.enable');c.call('Profiler.setSamplingInterval',interval=200)
    m0=m();c.call('Profiler.start');t0=time.time();c.pump(SECS);p=c.call('Profiler.stop')['profile'];dt=time.time()-t0;m1=m()
    nodes={n['id']:n for n in p['nodes']};self={}
    td=p['timeDeltas'];tot=0
    for sid,d in zip(p['samples'],td):
        n=nodes[sid];f=n['callFrame']['functionName'] or '(anon)';self[f]=self.get(f,0)+d;tot+=d
    cles=['hudColonne','hudColMesure','volgTick','volgMesure','zRect','zK','mepRappel','apresMiseEnPage']
    res={'secs':round(dt,2),'hudcache':CACHE,'couche':COUCHE,'palier':PAL,
      'selfMs':{k:round(self.get(k,0)/1000,1) for k in cles},
      'selfMsParSec':round(sum(self.get(k,0) for k in cles)/1000/dt,2),
      'layout_s':round((m1['LayoutCount']-m0['LayoutCount'])/dt,2),'recalcstyle_s':round((m1['RecalcStyleCount']-m0['RecalcStyleCount'])/dt,2),
      'layoutDur_msParSec':round((m1['LayoutDuration']-m0['LayoutDuration'])*1000/dt,2),'recalcDur_msParSec':round((m1['RecalcStyleDuration']-m0['RecalcStyleDuration'])*1000/dt,2),
      'top':sorted(((round(v/1000,1),k) for k,v in self.items()),reverse=True)[:12]}
    tag='%s-%s'%('couche' if COUCHE else 'debout','cache%s'%CACHE)
    c.ev("dbgAuto(1,0,{});1")
    c.shot(os.path.join(OUT,'hud-%s.png'%tag))
    json.dump(res,open(os.path.join(OUT,'profil-%s.json'%tag),'w'),indent=1,ensure_ascii=False)
    print(json.dumps(res,ensure_ascii=False,indent=1));return 0
sys.exit(main())
