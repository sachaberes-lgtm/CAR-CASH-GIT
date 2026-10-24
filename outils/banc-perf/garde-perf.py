#!/usr/bin/env python3
"""LA GARDE DE PERF (2026-10-24, passe perf 4e tour — « que les gains ne soient pas défaits sans que personne ne le voie »).

Un banc COURT (3 à 5 minutes, muet, sans fenêtre) à lancer avant de pousser un changement du jeu :

    python3 outils/banc-perf/garde-perf.py            # le tour par défaut : nuages → ville → jade → grotte → dunes → canyon
    python3 outils/banc-perf/garde-perf.py nuages:midi forêt …   # ses propres maps (carte:météo, ids de SF_CARTES)

Ce qu'elle fait : Chrome sans fenêtre déguisé en iPhone (390 × 844 ×3, tactile, processeur ×4 posé APRÈS le menu), le jeu servi depuis
VERSION PRINCIPALE/, `?garde=1&palier=2&pistegraine=777`. Le JOUER de la 1re map, puis un VRAI portail vers chacune des suivantes (la map d'en face
est armée par `dbgClassique`, la caisse posée à 2,6 km par `dbgPortail`, le pré-bâti travaille pendant l'approche). Elle compte :
  · les PROGRAMMES COMPILÉS EN COURSE (`linkProgram`) — la règle du jeu : zéro (un programme compilé fige un iPhone 0,1 à 0,3 s) → ÉCHEC si > 0, quelle que soit la charge ;
  · les erreurs de la page (exceptions, `__loopErr`, `__prebErr`) → ÉCHEC ;
  · les images trop longues autour du passage : la pire > 700 ms → ÉCHEC ; plus de 14 images > 100 ms dans la fenêtre → ÉCHEC ; > 8 → avertissement.
    (Ces chiffres-là dépendent de la machine : si la charge dépasse 8, ou si `GARDE_PERF_TEMPS=0`, seules les deux premières règles comptent.)
Sortie 0 = rien d'abîmé · 1 = un seuil franchi · 2 = le banc n'a pas pu tourner. Elle ne touche à rien : serveur et Chrome sont fermés à la fin.
Les mesures fines (A/B alterné contre origin/main, empreintes du monde, profils) : « LA PASSE PERF DU 24/10 » du JOURNAL et ce dossier (LISEZMOI.txt).
"""
import sys,os,json,time,subprocess,socket,urllib.request,tempfile,shutil,random
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
from cdp import CDP
RACINE=os.path.dirname(os.path.dirname(ICI));VP=os.path.join(RACINE,'VERSION PRINCIPALE')
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
SAVE={'v':2,'sfx':False,'mus':False,'vox':False,'tuto':1,'permis':1,'lang':'fr','facile':0,'q':'net','qChoisi':1,'plq':{'m':0,'x':'BANC 01','ok':1}}
TOUR=['nuages:midi','ville:pluie','jade:midi','grotte:matin','dunes:midi','canyon:midi']
HOOK=r"""(function(){var lp=WebGL2RenderingContext.prototype.linkProgram;window.__LK=0;WebGL2RenderingContext.prototype.linkProgram=function(p){window.__LK++;return lp.call(this,p);};
 window.__F=[];window.__Fon=false;var l=performance.now();function f(t){if(window.__Fon)window.__F.push(t-l);l=t;requestAnimationFrame(f);}requestAnimationFrame(f);})();"""
def libre():
    s=socket.socket();s.bind(('127.0.0.1',0));p=s.getsockname()[1];s.close();return p
def chrome():
    for c in (os.environ.get('CHROME'),'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium','C:/Program Files/Google/Chrome/Application/chrome.exe'):
        if c and os.path.exists(c):return c
    sys.exit('Chrome introuvable : CHROME=/chemin/vers/chrome')
def tap(c,x,y,hold=.08):
    c.call('Input.dispatchTouchEvent',type='touchStart',touchPoints=[{'x':x,'y':y,'id':1}]);c.pump(hold);c.call('Input.dispatchTouchEvent',type='touchEnd',touchPoints=[])
BTN=r"""(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return null;var b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,h=document.elementFromPoint(x,y);return (h===e||e.contains(h))?[x,y]:null})()"""
def attend(c,js,tmax):
    t=time.time()
    while time.time()-t<tmax:
        if c.ev(js) is True:return True
        c.pump(.3)
    return False
def main():
    maps=[a for a in sys.argv[1:] if not a.startswith('-')] or TOUR
    cartes=[m.split(':') for m in maps]
    http=libre();port=libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='garde-perf-')
    ch=subprocess.Popen([chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for i in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        else:sys.exit('Chrome ne répond pas')
        return tour(http,port,cartes)
    finally:
        for p in (ch,srv):
            try:p.terminate();p.wait(5)
            except Exception:
                try:p.kill()
                except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
def tour(http,port,cartes):
    base='http://127.0.0.1:%d'%http
    c=CDP(port);c.keep={'Runtime.exceptionThrown'}
    for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(SAVE)))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=HOOK)
    A=cartes[0]
    c.call('Page.navigate',url=base+'/index.html?garde=1&palier=2&pistegraine=777&carte=%s&meteo=%s'%(A[0],A[1] if len(A)>1 else 'midi'))
    if not attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):print('⛔ le jeu ne démarre pas');return 2
    echecs=[];avert=[];lignes=[]
    if not attend(c,"(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];return !!e})()",90):
        t=time.time()
        while time.time()-t<60 and not c.ev(BTN):tap(c,195,300);c.pump(.8)
    c.call('Emulation.setCPUThrottlingRate',rate=4)
    attend(c,"dbgPrebati().etat==='pret'",60);c.pump(1)
    t=time.time();ok=False
    while time.time()-t<90 and not ok:
        r=c.ev(BTN)
        if r:tap(c,r[0],r[1],.12);ok=True
        else:
            g=c.ev("(function(){var e=document.getElementById('gJouer');if(!e)return null;var b=e.getBoundingClientRect();return b.width>0?[b.left+b.width/2,b.top+b.height/2]:null})()")
            if g:tap(c,g[0],g[1],.12);ok=True # le garage s'est ouvert : son JOUER lance la même partie
            elif time.time()-t>25:tap(c,195,300);c.pump(3) # l'écran titre / la plaque attendent un toucher (loin de JOUER) — après 25 s seulement
            else:c.pump(.5)
    if not attend(c,"dbgState().started&&!dbgState().gameOver",60):
        print('⛔ le JOUER ne part pas — état :',c.ev("JSON.stringify({st:dbgState().started,go:dbgState().gameOver,body:document.body.className.slice(0,80),ov:(document.getElementById('overlay')||{dataset:{}}).dataset.ecran,btn:%s})"%BTN.replace('\n',' ')))
        return 2
    c.pump(2);c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{});1")
    charge0=os.getloadavg()[0] if hasattr(os,'getloadavg') else 0
    for nxt in cartes[1:]:
        nom=':'.join(nxt);z0=c.ev("dbgEco().zones")
        c.ev("dbgClassique(%s,%s);1"%(json.dumps(nxt[0]),json.dumps(nxt[1] if len(nxt)>1 else None)));c.ev("dbgPortail(2600);1");c.pump(1)
        lk0=c.ev("window.__LK");c.ev("window.__F.length=0;window.__Fon=true;1");t=time.time()
        while time.time()-t<80 and c.ev("dbgEco().zones")==z0:c.pump(.3)
        passe=c.ev("dbgEco().zones")!=z0
        c.pump(3.0);c.ev("window.__Fon=false;1")
        F=json.loads(c.ev("JSON.stringify(window.__F)"));lk=c.ev("window.__LK")-lk0
        c.ev("dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1");c.ev("window.__F.length=0;window.__Fon=true;1");c.pump(4);c.ev("window.__Fon=false;1")
        V=json.loads(c.ev("JSON.stringify(window.__F)"));c.ev("dbgAuto(1,0,{});1")
        lk2=c.ev("window.__LK")-lk0
        pire=max(F[1:] or [0]);n100=sum(1 for x in F[1:] if x>100);pireV=max(V[2:] or [0]);n100V=sum(1 for x in V[2:] if x>100)
        lignes.append('%-18s portail %s | pire %4.0f ms · %2d images > 100 ms | en vol : pire %4.0f ms · %2d > 100 | compilations %d'%(nom,'ok ' if passe else 'RATÉ',pire,n100,pireV,n100V,lk2))
        if not passe:echecs.append('%s : le portail n\'a pas été franchi en 80 s — %s'%(nom,c.ev("JSON.stringify({e:dbgEco(),vis:document.visibilityState,m:dbgState().mode,p:dbgState().paused,r:dbgState().running})")))
        if lk2>0:echecs.append('%s : %d programme(s) compilé(s) EN COURSE (la règle : zéro)'%(nom,lk2))
        if os.environ.get('GARDE_PERF_TEMPS')!='0' and charge0<8 and (os.getloadavg()[0] if hasattr(os,'getloadavg') else 0)<8:
            if pire>700 or pireV>700:echecs.append('%s : une image de %d ms (seuil 700)'%(nom,max(pire,pireV)))
            if n100>14 or n100V>14:echecs.append('%s : %d images > 100 ms (seuil 14)'%(nom,max(n100,n100V)))
            elif n100>8 or n100V>8:avert.append('%s : %d images > 100 ms (avertissement à 8)'%(nom,max(n100,n100V)))
    err=c.ev("JSON.stringify({l:window.__loopErr?String(window.__loopErr).slice(0,200):null,p:window.__prebErr?String(window.__prebErr).slice(0,200):null,d:window.__dnErr?String(window.__dnErr).slice(0,120):null,g:window.__grotteErr?String(window.__grotteErr).slice(0,120):null})")
    for k,v in json.loads(err).items():
        if v:echecs.append('erreur de page (%s) : %s'%(k,v))
    for e in c.events:
        if e['method']=='Runtime.exceptionThrown':echecs.append('exception : '+(e['params']['exceptionDetails'].get('exception',{}).get('description') or '')[:160])
    print('\n'.join(lignes))
    if (os.getloadavg()[0] if hasattr(os,'getloadavg') else 0)>=8:print('ⓘ charge machine ≥ 8 : seuils de temps ignorés (compilations et erreurs comptent toujours)')
    for a in avert:print('⚠',a)
    if echecs:
        print('✘ GARDE DE PERF : '+str(len(echecs))+' problème(s)');[print('  -',e) for e in echecs];return 1
    print('✔ garde de perf : 0 compilation en course, 0 erreur, passages sans gel');return 0
if __name__=='__main__':sys.exit(main())
