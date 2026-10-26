#!/usr/bin/env python3
"""Ce que le jeu rend VRAIMENT sur PC (fenêtre 1440×900 ×2, cadre téléphone par défaut) : constantes de rendu, et une capture de l'accueil."""
import sys,os,json,time,subprocess,tempfile,shutil,urllib.request,base64
RAC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,os.path.join(RAC,'outils','banc-perf'));sys.path.insert(0,os.path.join(RAC,'.banc-cadence'))
import importlib.util
sp=importlib.util.spec_from_file_location('gp',os.path.join(RAC,'outils','banc-perf','garde-perf.py'));gp=importlib.util.module_from_spec(sp);sp.loader.exec_module(gp)
sp2=importlib.util.spec_from_file_location('cst',os.path.join(RAC,'.banc-cadence','constantes.py'));cst=importlib.util.module_from_spec(sp2);sp2.loader.exec_module(cst)
from cdp import CDP
EXPR="JSON.stringify({iw:innerWidth,ih:innerHeight,dprFen:devicePixelRatio,DPR_CAP:DPR_CAP,curDPR:curDPR,q:SAVE.d.q,qk:QL.k,ombre:sun.shadow.mapSize.x,bloom:!!(bloomPass&&bloomPass.enabled),aa:renderer.getContext().getContextAttributes().antialias,FXAA:FXAA_ON,IS_LOW_END:IS_LOW_END,GRADE_ACES:GRADE_ACES,ACES_N:ACES_N,pal:PAL.n,vhd:VHD.on})"
def run(html,out,w=1440,h=900,dpr=2,extra=''):
    tmp=tempfile.mkdtemp(prefix='pcr-');d=os.path.join(tmp,'site');cst.copie(html,d)
    http=gp.libre();port=gp.libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=d,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+tmp+'/p','--mute-audio','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    try:
        for i in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        c=CDP(port);c.keep={'Runtime.exceptionThrown'}
        for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
        c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
        c.call('Emulation.setDeviceMetricsOverride',width=w,height=h,deviceScaleFactor=dpr,mobile=False)
        base='http://127.0.0.1:%d'%http
        c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
        c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(gp.SAVE)))
        c.call('Page.navigate',url=base+'/index.html?pistegraine=777'+extra)
        gp.attend(c,"!!document.getElementById('colonne')&&!!document.getElementById('colonne').contentWindow.__ev&&!!document.getElementById('colonne').contentWindow.__gameReady",240)
        c.pump(12)
        F="document.getElementById('colonne').contentWindow.__ev(%s)"%json.dumps(EXPR)
        r=c.ev(F);print('accueil',r)
        for i in range(12):  # l'intro 1.61 attend un appui : clic souris au centre jusqu'à voir JOUER
            if c.ev("(function(){var w=document.getElementById('colonne').contentWindow;return [].slice.call(w.document.querySelectorAll('.mPlay')).some(function(x){return x.getBoundingClientRect().width>0})})()"):break
            c.call('Input.dispatchMouseEvent',type='mousePressed',x=720,y=450,button='left',clickCount=1);c.call('Input.dispatchMouseEvent',type='mouseReleased',x=720,y=450,button='left',clickCount=1);c.ev("(function(){var w=document.getElementById('colonne').contentWindow,d=w.document;['pointerdown','pointerup','click'].forEach(function(t){var e=new w.PointerEvent(t,{bubbles:true,cancelable:true,clientX:400,clientY:200,pointerType:'touch',isPrimary:true});(d.elementFromPoint(400,200)||d.body).dispatchEvent(e);d.dispatchEvent(new w.PointerEvent(t,{bubbles:true,clientX:400,clientY:200,pointerType:'touch'}));});return 1})()");c.pump(2.5)
        c.ev("(function(){var w=document.getElementById('colonne').contentWindow;var b=[].slice.call(w.document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(b)b.click();return !!b})()")
        t=time.time()
        while time.time()-t<60 and not c.ev("(function(){var w=document.getElementById('colonne').contentWindow;return w.dbgState&&w.dbgState().started===true})()"):c.pump(.5)
        c.pump(6)
        r=c.ev(F);print('course',r)
        print('exceptions',[e['params']['exceptionDetails'].get('text','')+' '+str((e['params']['exceptionDetails'].get('exception') or {}).get('description',''))[:140] for e in c.events][:4])
        shot=c.call('Page.captureScreenshot',format='jpeg',quality=80)
        open(out,'wb').write(base64.b64decode(shot['data']))
    finally:
        for p in (ch,srv):
            try:os.killpg(p.pid,15)
            except Exception:pass
        shutil.rmtree(tmp,ignore_errors=True)
if __name__=='__main__':
    run(sys.argv[1],sys.argv[2],extra=(sys.argv[3] if len(sys.argv)>3 else ''))
