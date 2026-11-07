#!/usr/bin/env python3
"""P2 — L'IMAGE ADAPTÉE SUR TÉLÉPHONE RÉCENT (2026-11-07, passe perf 3). Mesure GPU + capture, un Chrome par (map, variante).
    python3 outils/banc-perf/p2-image.py --tag avant --maps nuages:midi,ville:pluie [--qs '&img=max'] [--ordi] [--cpu 4] [--sortie dossier]
iPhone 13 Pro émulé (390×844 ×3, tactile → TEL_NATIF vrai), `?garde=1&palier=2&pistegraine=777`, JOUER, échelle QL figée (dbgPin) à son cran de départ,
caisse posée à 1 800 m (dbgPortail) puis 80 m de route : 6 s de `dbgCout()` (gpu p50/p90 de la puce, passes, toile, ombre, halo) + une capture à l'instant fixe.
--vp <dossier> : servir ce dossier (ex. l'index d'origin/main pour l'AVANT du pixel) · --ordi : pas d'émulation tactile (TEL_NATIF faux), fenêtre 844×390 ×2 : l'ordinateur jouant la version téléphone (?tel=1), souris. Sortie JSON sur stdout.
Un seul banc à la fois : sh ~/cash-car/verrou-banc.sh prendre "P2" … rendre."""
import sys,os,json,time,subprocess,tempfile,shutil,urllib.request,importlib.util,base64
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
spec=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(spec);spec.loader.exec_module(gp)
from cdp import CDP
def arg(n,d=None):
    a=sys.argv
    return a[a.index(n)+1] if n in a else d
def souris(c,x,y):
    for t in ('mousePressed','mouseReleased'):
        c.call('Input.dispatchMouseEvent',type=t,x=x,y=y,button='left',clickCount=1);c.pump(.08)
def run(http,port,carte,qs,ordi,cpu,dossier,tag,regle=None):
    base='http://127.0.0.1:%d'%http
    c=CDP(port);c.keep={'Runtime.exceptionThrown'}
    for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    if ordi:
        W,H,D=844,390,2
        c.call('Emulation.setDeviceMetricsOverride',width=W,height=H,deviceScaleFactor=D,mobile=False)
    else:
        W,H,D=390,844,3
        c.call('Emulation.setDeviceMetricsOverride',width=W,height=H,deviceScaleFactor=D,mobile=True,screenWidth=W,screenHeight=H,screenOrientation={'type':'portraitPrimary','angle':0})
        c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(gp.SAVE)))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=gp.HOOK)
    c.call('Page.navigate',url=base+'/index.html?garde=1&palier=2%s&pistegraine=777&carte=%s&meteo=%s%s'%('&tel=1' if ordi else '',carte[0],carte[1] if len(carte)>1 else 'midi',qs))
    if not gp.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):return {'err':'ne démarre pas'}
    def clic(x,y,h=.12):
        if ordi:souris(c,x,y)
        else:gp.tap(c,x,y,h)
    if not gp.attend(c,"(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];return !!e})()",90):
        t=time.time()
        while time.time()-t<60 and not c.ev(gp.BTN):clic(W//2,H//3);c.pump(.8)
    if cpu>1:c.call('Emulation.setCPUThrottlingRate',rate=cpu)
    gp.attend(c,"dbgPrebati().etat==='pret'",60);c.pump(1)
    t=time.time();ok=False
    while time.time()-t<90 and not ok:
        r=c.ev(gp.BTN)
        if r:clic(r[0],r[1]);ok=True
        else:
            g=c.ev("(function(){var e=document.getElementById('gJouer');if(!e)return null;var b=e.getBoundingClientRect();return b.width>0?[b.left+b.width/2,b.top+b.height/2]:null})()")
            if g:clic(g[0],g[1]);ok=True
            elif time.time()-t>25:clic(W//2,H//3);c.pump(3)
            else:c.pump(.5)
    if not gp.attend(c,"dbgState().started&&!dbgState().gameOver",60):return {'err':'JOUER ne part pas'}
    c.pump(2);c.ev("dbgSable(1);dbgPin(true);dbgAuto(1,0,{});1")
    pos=c.ev("dbgPortail(1800)");s0=pos.get('s',0) if isinstance(pos,dict) else 0
    t=time.time()
    while time.time()-t<60 and (c.ev("dbgEco().s") or 0)<s0+80:c.pump(.05)
    lk0=c.ev('window.__LK');rg=None
    if regle:rg=c.ev('JSON.stringify(imgRegle(%s))'%regle);c.pump(1.5)
    c.ev("dbgCout(1);1");c.pump(7)
    R=json.loads(c.ev("JSON.stringify({cout:dbgCout(),img:dbgImg(),pal:dbgPalier().n,nette:dbgNette(),perf:dbgPerf(),lk:window.__LK,rg:(typeof imgRegle==='function'?imgRegle():null)})"));R['lk0']=lk0;R['regle']=rg
    if dossier:
        os.makedirs(dossier,exist_ok=True)
        c.ev("dbgCout(0);1")
        d=c.call('Page.captureScreenshot',format='jpeg',quality=88)['data']
        open(os.path.join(dossier,'%s-%s-%s.jpg'%(tag,carte[0],carte[1] if len(carte)>1 else 'midi')),'wb').write(base64.b64decode(d))
    for e in c.events:
        if e['method']=='Runtime.exceptionThrown':R.setdefault('exc',[]).append((e['params']['exceptionDetails'].get('exception',{}).get('description') or '')[:160])
    return R
def main():
    maps=[m.split(':') for m in arg('--maps','nuages:midi,ville:pluie,foret:midi,dunes:midi').split(',')]
    qs=arg('--qs','');ordi='--ordi' in sys.argv;cpu=int(arg('--cpu','4'));dossier=arg('--sortie');tag=arg('--tag','x')
    http=gp.libre();srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=arg('--vp',gp.VP),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    out=[]
    try:
        for m in maps:
            prof=tempfile.mkdtemp(prefix='p2-');pt=gp.libre()
            ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%pt,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                for i in range(60):
                    time.sleep(.5)
                    try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%pt,timeout=2).read();break
                    except Exception:pass
                R=run(http,pt,m,qs,ordi,cpu,dossier,tag,arg('--regle'))
            finally:
                ch.terminate()
                try:ch.wait(5)
                except Exception:ch.kill()
                shutil.rmtree(prof,ignore_errors=True)
            R['map']=':'.join(m);R['tag']=tag;R['qs']=qs;R['charge']=round(os.getloadavg()[0],1)
            out.append(R)
            k=R.get('cout') or {}
            g=k.get('gpu') or {}
            print('%-12s %-8s gpu p50 %s p90 %s | appels %s tri %s | passes %s px %s ombre %s bloom %s | tel %s'%(tag,':'.join(m),g.get('p50'),g.get('p90'),(k.get('image') or {}).get('calls'),(k.get('image') or {}).get('tris'),k.get('passes'),k.get('px'),k.get('ombre'),k.get('bloom'),(R.get('img') or {}).get('telNatif')),flush=True)
        f=arg('--json')
        if f:json.dump(out,open(f,'w'),indent=1)
    finally:srv.terminate()
if __name__=='__main__':main()
