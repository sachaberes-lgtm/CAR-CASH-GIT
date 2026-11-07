#!/usr/bin/env python3
"""BANC DES MENUS (2026-11-07, Perf 3 — P5) : accueil, garage, inventaire (défilement), boutique (ouverture).
    python3 outils/banc-perf/menus.py [--qs '&menu=max'] [--json f.json] [--shots dossier] [--cpu 4] [--sonde]
Chrome sans fenêtre déguisé en iPhone 390x844 x3 (`?garde=1&palier=2&tel=1`). Par écran : toile, DPR, ombre, VHD, passes, gpu p50 (si la puce
chronomètre : `chrono`), i/s, pire image, images > 100 ms. ⚠ machine chargée = ms faux : lire surtout les PIXELS (px x passes) et les compteurs. Un banc à la fois (verrou-banc.sh)."""
import sys,os,json,time,subprocess,tempfile,shutil,importlib.util,urllib.request
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
sp=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));G=importlib.util.module_from_spec(sp);sp.loader.exec_module(G)
from cdp import CDP
OPT={'qs':'','json':None,'shots':None,'cpu':4,'sonde':False,'js':[]}
LIT="""JSON.stringify((function(){var k=dbgCout(),v=dbgVHD();var q=window.__Fq||[];return {toile:k.toile,dpr:k.dpr,ombre:k.ombre,vhd:k.vhd,passes:k.passes,bloom:k.bloom,gpu:k.gpu,cpu:k.cpu,chrono:k.chrono,calls:k.image&&k.image.calls,tris:k.image&&k.image.tris,ql:k.ql,hc:(typeof dbgCadence==='function')?dbgCadence().on:null}})())"""
def fen(c,sec):
    """images rAF sur sec secondes : i/s, pire, > 100 ms"""
    c.ev("window.__F.length=0;window.__Fon=true;1");c.pump(sec);F=c.ev("window.__Fon=false;window.__F.slice()") or []
    F=F[1:] or [0]
    return {'is':round(len(F)/(sum(F)/1000),1) if sum(F) else 0,'pire':round(max(F)),'longues':sum(1 for x in F if x>100),'n':len(F)}
def lire(c,nom,sec=3):
    c.ev("dbgCout(1);1");c.pump(.5)
    f=fen(c,sec)
    try:d=json.loads(c.ev(LIT))
    except Exception as e:d={'erreur':str(e)}
    c.ev("dbgCout(0);1");d.update(f);d['ecran']=nom;
    d['pixels']=(d.get('toile') or [0,0])[0]*(d.get('toile') or [0,0])[1]
    if OPT['shots']:
        os.makedirs(OPT['shots'],exist_ok=True);c.shot(os.path.join(OPT['shots'],nom+'.png'))
    print(json.dumps(d));sys.stdout.flush();return d
def main():
    av=sys.argv[1:];i=0
    while i<len(av):
        a=av[i]
        if a=='--qs':OPT['qs']=av[i+1];i+=2
        elif a=='--json':OPT['json']=av[i+1];i+=2
        elif a=='--shots':OPT['shots']=av[i+1];i+=2
        elif a=='--js':OPT['js'].append(av[i+1]);i+=2
        elif a=='--cpu':OPT['cpu']=int(av[i+1]);i+=2
        else:i+=1
    http=G.libre();port=G.libre();RAC=os.path.dirname(os.path.dirname(ICI));VP=os.path.join(RAC,'VERSION PRINCIPALE')
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='menus-')
    ch=subprocess.Popen([G.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','--enable-gpu-rasterization','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
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
        while time.time()-t<60 and not c.ev("document.body.className.indexOf('inGarage')>=0||(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];return !!e})()"):
            G.tap(c,195,300);c.pump(1.2)
        G.attend(c,"dbgPrebati().etat==='pret'",60);c.pump(8) # la chauffe du menu passe d'abord
        c.call('Emulation.setCPUThrottlingRate',rate=OPT['cpu'])
        print(c.ev("JSON.stringify({vhdOn:dbgVHD().on,garage:garageOn,ecran:document.getElementById('overlay').dataset.ecran,body:document.body.className.slice(0,60)})"))
        for j in OPT['js']:print('JS>',j[:60],'=>',c.ev(j))
        if OPT['js']:return 0
        R.append(lire(c,'1-accueil'))
        # garage
        print(c.ev("(function(){try{if(!garageOn)openGarage();}catch(e){return String(e)}return 'ok'})()") ) if False else None
        # inventaire
        c.ev("dbgInv('ouvre')");c.pump(2.5)
        R.append(lire(c,'3-inventaire'))
        # défilement de l'inventaire : 24 pas de 120 px en 3 s
        c.ev("window.__F.length=0;window.__Fon=true;(function(){var g=document.getElementById('ivGrille'),n=0;window.__sc=setInterval(function(){g.scrollTop+=60;if(++n>40){clearInterval(window.__sc);}},60);})();1");c.pump(3.2)
        F=(c.ev("window.__Fon=false;window.__F.slice()") or [0])[1:]
        d={'ecran':'3b-defilement','pire':round(max(F or [0])),'longues':sum(1 for x in F if x>100),'n':len(F),'is':round(len(F)/(sum(F)/1000),1) if sum(F) else 0};print(json.dumps(d));R.append(d)
        c.ev("invFerme&&invFerme();1") ;c.pump(1.5)
        # boutique : ouverture
        c.ev("window.__F.length=0;window.__Fon=true;(function(){try{if(garageOn){window.__mRetour='shop';ecranWipe(function(){closeGarage();},function(){window.__mGo('shop');});}else window.__mGo('shop');}catch(e){window.__eb=String(e)}})();1");c.pump(3.5)
        F=(c.ev("window.__Fon=false;window.__F.slice()") or [0])[1:]
        d={'ecran':'4a-boutique-ouverture','pire':round(max(F or [0])),'longues':sum(1 for x in F if x>100),'n':len(F),'is':round(len(F)/(sum(F)/1000),1) if sum(F) else 0,'ecranDom':c.ev("document.getElementById('overlay').dataset.ecran"),'err':c.ev("window.__eb||null")};print(json.dumps(d));R.append(d)
        c.pump(6)
        R.append(lire(c,'4b-boutique'))
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
