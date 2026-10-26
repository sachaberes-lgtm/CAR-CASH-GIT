#!/usr/bin/env python3
"""Lit les constantes de qualité DANS le vrai jeu (copie servie avec __ev), PC puis iPhone, ancien (origin/main) puis neuf."""
import sys,os,json,time,subprocess,tempfile,shutil,urllib.request
RAC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,os.path.join(RAC,'outils','banc-perf'))
import importlib.util
sp=importlib.util.spec_from_file_location('gp',os.path.join(RAC,'outils','banc-perf','garde-perf.py'));gp=importlib.util.module_from_spec(sp);sp.loader.exec_module(gp)
from cdp import CDP
VP=gp.VP
def copie(src_html,dest):
    os.makedirs(dest)
    for n in os.listdir(VP):
        if n!='index.html':os.symlink(os.path.join(VP,n),os.path.join(dest,n))
    h=open(src_html,encoding='utf-8').read()
    m='window.__gameReady=true; // la boucle part'
    assert h.count(m)==1,h.count(m)
    open(os.path.join(dest,'index.html'),'w',encoding='utf-8').write(h.replace(m,'window.__ev=function(__c9){return eval(__c9);};'+m))
EXPR="JSON.stringify({IS_MOBILE:IS_MOBILE,TEL_NATIF:TEL_NATIF,FORCE_TEL:FORCE_TEL,pal:PAL.n,SF_HORS:SF_HORS,JADE_SOBRE:JADE_SOBRE,SAT_MAX:SAT_MAX,SAT_PASS:SAT_PASS,SAT_TRAINS:SAT_TRAINS,DPR_CAP:DPR_CAP})"
def mesure(html,tel):
    tmp=tempfile.mkdtemp(prefix='cst-');d=os.path.join(tmp,'site');copie(html,d)
    http=gp.libre();port=gp.libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=d,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+tmp+'/p','--mute-audio','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    try:
        for i in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        c=CDP(port)
        for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
        c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
        if tel:
            c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
            c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
        else:
            c.call('Emulation.setDeviceMetricsOverride',width=1440,height=900,deviceScaleFactor=2,mobile=False)
        base='http://127.0.0.1:%d'%http
        c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
        c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(gp.SAVE)))
        c.call('Page.navigate',url=base+'/index.html?colonne=0&pistegraine=777')
        ok=gp.attend(c,"!!window.__gameReady&&typeof window.__ev==='function'",240)
        return c.ev("window.__ev(%s)"%json.dumps(EXPR)) if ok else 'JEU NON PRÊT'
    finally:
        for p in (ch,srv):
            try:os.killpg(p.pid,15)
            except Exception:pass
        shutil.rmtree(tmp,ignore_errors=True)
if __name__=='__main__':
    nouv=os.path.join(VP,'index.html');anc=os.path.join(RAC,'.banc-cadence','index-origin.html')
    for nom,h in (('ANCIEN (origin/main)',anc),('NEUF (correctif)',nouv)):
        for tel in (False,True):
            print('%-22s %-7s'%(nom,'iPhone' if tel else 'PC'),mesure(h,tel))
