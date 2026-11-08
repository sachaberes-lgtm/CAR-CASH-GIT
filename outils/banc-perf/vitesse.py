#!/usr/bin/env python3
"""LE BANC « VITESSE » (2026-11-06, passe vitesse-fluide : saccades à grande vitesse, palier moteur >= 16).
    python3 outils/banc-perf/vitesse.py capture <dossier_jeu> [...]   : une photo (dbgView, pause) par dossier de jeu, hachée — A/B « identique au pixel »
    python3 outils/banc-perf/vitesse.py course <dossier_jeu> [secondes] [?paramètres] : une course (iPhone émulé ×4, ?tel=1&palier=2), p50/p90/pire de la durée d'image par TRANCHE DE VITESSE
Un <dossier_jeu> est un dossier qui contient index.html (VERSION PRINCIPALE/ ou une copie à symlinks). Un seul banc à la fois : sh ~/cash-car/verrou-banc.sh prendre "<qui>" … rendre."""
import sys,os,json,time,subprocess,tempfile,shutil,hashlib,base64,importlib.util
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
spec=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(spec);spec.loader.exec_module(gp)
from cdp import CDP

def lance(dossier):
    http=gp.libre();port=gp.libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=dossier,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='vitesse-')
    ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    for i in range(60):
        time.sleep(.5)
        try:
            import urllib.request;urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
        except Exception:pass
    else:sys.exit('Chrome ne répond pas')
    return http,port,srv,ch,prof
def ferme(srv,ch,prof):
    for p in (ch,srv):
        try:p.terminate();p.wait(5)
        except Exception:
            try:p.kill()
            except Exception:pass
    shutil.rmtree(prof,ignore_errors=True)

def demarre(c,http,qs,hook='',save=None):
    """charge le jeu en iPhone émulé, JOUER, attend la course ; rend True si la course tourne"""
    base='http://127.0.0.1:%d'%http
    for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(save or gp.SAVE)))
    if hook:c.call('Page.addScriptToEvaluateOnNewDocument',source=hook)
    c.call('Page.navigate',url=base+'/index.html'+qs)
    if not gp.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):print('⛔ le jeu ne démarre pas');return False
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
    if not gp.attend(c,"dbgState().started&&!dbgState().gameOver",60):print('⛔ le JOUER ne part pas');return False
    c.pump(2);return True

def capture(dossier,etiquette,sortie):
    http,port,srv,ch,prof=lance(dossier)
    try:
        c=CDP(port);c.keep={'Runtime.exceptionThrown'}
        if not demarre(c,http,'?garde=1&palier=2&pistegraine=777&carte=nuages&meteo=midi'):return None
        c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{});1");c.pump(1.5)
        c.ev("dbgView(.7,9,2.6);1");c.pump(1.0)
        png=base64.b64decode(c.call('Page.captureScreenshot',format='png')['data'])
        h=hashlib.sha256(png).hexdigest()[:16]
        os.makedirs(sortie,exist_ok=True);open(os.path.join(sortie,etiquette+'.png'),'wb').write(png)
        return h
    finally:ferme(srv,ch,prof)

def course(dossier,secondes,qs):
    http,port,srv,ch,prof=lance(dossier)
    try:
        c=CDP(port);c.keep={'Runtime.exceptionThrown'}
        if not demarre(c,http,'?garde=1&palier=2&tel=1&pistegraine=777&carte=nuages&meteo=midi'+qs):return None
        c.call('Emulation.setCPUThrottlingRate',rate=4)
        c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{nit:1});window.__V=[];(function(){var l=performance.now();function f(t){var s=dbgState();window.__V.push([t-l,s.kmh||s.speedKmh||0]);l=t;requestAnimationFrame(f);}requestAnimationFrame(f);})();1")
        t0=time.time();pas=10
        while time.time()-t0<secondes:c.pump(pas)
        return json.loads(c.ev("JSON.stringify(window.__V)"))
    finally:ferme(srv,ch,prof)

SAMPLEUR=r"""(function(){window.__S=[];window.__Son=false;var l=performance.now(),R=dbgScene().rdr;function f(t){if(window.__Son){var i=R.info.render,s=dbgState();window.__S.push([+(t-l).toFixed(1),i.calls,i.triangles,+s.vH,R.info.memory.geometries]);}l=t;requestAnimationFrame(f);}requestAnimationFrame(f);})();1"""
def tier(c):
    r=c.ev("typeof dbgMoteur==='function'?dbgMoteur():null")
    return r
def monte(c,cible):
    """monte le moteur au palier d'index `cible` (dbgMoteur : un palier par appel ; rend l'index lu juste après)"""
    k=0
    for i in range(80):
        if k>=cible:return k
        n=c.ev("(function(){var m=dbgMoteur();return typeof m==='string'?m:'?'})()")
        c.pump(.35)
        try:k=int(str(n).split(' ')[0])
        except Exception:return -1
    return k
def profil(prof,dur_ms):
    nodes={n['id']:n for n in prof['nodes']};S={};tot=0;own={}
    for sid,dt in zip(prof['samples'],prof['timeDeltas']):own[sid]=own.get(sid,0)+dt
    par={}
    for n in prof['nodes']:
        for c in n.get('children',[]):par[c]=n['id']
    I={};
    def nom(n):cf=n['callFrame'];return (cf['functionName'] or '(anon)')+':'+str(cf['lineNumber']+1)
    for sid,dt in own.items():
        n=nodes[sid];k=nom(n);S[k]=S.get(k,0)+dt;tot+=dt
        vu=set();x=sid
        while x is not None:  # inclusif : une fois par fonction et par échantillon (pas de double compte en récursion)
            kx=nom(nodes[x])
            if kx not in vu:vu.add(kx);I[kx]=I.get(kx,0)+dt
            x=par.get(x)
    top=sorted(S.items(),key=lambda x:-x[1])[:90];inc=sorted(I.items(),key=lambda x:-x[1])[:90]
    return {'total_ms':round(tot/1000),'top':[[k,round(v/1000,1)] for k,v in top],'incl':[[k,round(v/1000,1)] for k,v in inc]}
def paliers(dossier,tiers,seconde,qs):
    http,port,srv,ch,prof=lance(dossier)
    try:
        c=CDP(port);c.keep={'Runtime.exceptionThrown'}
        if not demarre(c,http,'?garde=1&palier=2&tel=1&pistegraine=777&carte=nuages&meteo=midi'+qs):return None
        c.call('Emulation.setCPUThrottlingRate',rate=4)
        c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{nit:1});1");c.ev(SAMPLEUR);c.call('Profiler.enable')
        out=[]
        for T in tiers:
            k=monte(c,T);c.pump(6)  # la carte du nouveau moteur, la vitesse qui monte
            c.ev("window.__S.length=0;window.__Son=true;1");c.call('Profiler.start');t0=time.time();c.pump(seconde)
            p=c.call('Profiler.stop')['profile'];c.ev("window.__Son=false;1")
            S=json.loads(c.ev("JSON.stringify(window.__S)"))
            out.append({'tier':T,'atteint':k,'frames':S,'profil':profil(p,seconde*1000),'charge':os.getloadavg()[0],'etat':c.ev("JSON.stringify(dbgState())")[:200]})
        return out
    finally:ferme(srv,ch,prof)

def depart(dossier,crans,seconde,qs,carte='nuages:midi'):
    """pour chaque cran de VITESSE DE DÉPART (0..5 = paliers 1, 6, 11, 16, 21, 26) : une course neuve sur la même map, 25 s mesurées après 8 s de mise en vitesse"""
    http,port,srv,ch,prof=lance(dossier)
    try:
        c=CDP(port);c.keep={'Runtime.exceptionThrown'};out=[]
        m=carte.split(':')
        for n in crans:
            sv=dict(gp.SAVE);sv['vdep']=n;sv['ex']={'eng':29,'runs':9}
            if not demarre(c,http,'?garde=1&palier=2&tel=1&pistegraine=777&carte=%s&meteo=%s'%(m[0],m[1])+qs,save=sv):out.append(None);continue
            c.call('Emulation.setCPUThrottlingRate',rate=4)
            c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{});1");c.ev(SAMPLEUR);c.call('Profiler.enable');c.pump(8)
            c.ev("window.__S.length=0;window.__Son=true;1");c.call('Profiler.start');c.pump(seconde)
            p=c.call('Profiler.stop')['profile'];c.ev("window.__Son=false;1")
            S=json.loads(c.ev("JSON.stringify(window.__S)"))
            out.append({'cran':n,'frames':S,'profil':profil(p,seconde*1000),'charge':os.getloadavg()[0],'lieu':c.ev("JSON.stringify(typeof dbgPrebati==='function'?dbgPrebati().etat:0)"),'etat':c.ev("JSON.stringify(dbgState())")[:160]})
            c.call('Emulation.setCPUThrottlingRate',rate=1)
        return out
    finally:ferme(srv,ch,prof)

def profil_paliers(dossier,cibles,seconde,qs,carte='nuages:midi'):
    """cibles : [(index_palier_moteur, cran_de_depart, dbgMoteur_en_plus)] — une page neuve par cible, 6 s de mise en vitesse puis `seconde` s de profil CPU (iPhone émulé ×4)"""
    http,port,srv,ch,prof=lance(dossier)
    try:
        c=CDP(port);c.keep={'Runtime.exceptionThrown'};out=[];m=carte.split(':')
        for (idx,n,plus) in cibles:
            sv=dict(gp.SAVE);sv['vdep']=n;sv['ex']={'eng':29,'runs':9}
            if not demarre(c,http,'?garde=1&palier=2&tel=1&pistegraine=777&carte=%s&meteo=%s'%(m[0],m[1])+qs,save=sv):out.append(None);continue
            c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{});1")
            for i in range(plus):c.ev("dbgMoteur();1");c.pump(.5)
            c.call('Emulation.setCPUThrottlingRate',rate=4);c.ev(SAMPLEUR);c.call('Profiler.enable');c.pump(6)
            c.ev("window.__S.length=0;window.__Son=true;1");c.call('Profiler.start');c.pump(seconde)
            p=c.call('Profiler.stop')['profile'];c.ev("window.__Son=false;1")
            S=json.loads(c.ev("JSON.stringify(window.__S)"))
            out.append({'idx':idx,'carte':carte,'frames':S,'profil':profil(p,seconde*1000),'charge':os.getloadavg()[0],'etat':c.ev("JSON.stringify(dbgState())")[:200],'tier':c.ev("(function(){try{return dbgEco().eng}catch(e){return null}})()")})
            c.call('Emulation.setCPUThrottlingRate',rate=1)
        return out
    finally:ferme(srv,ch,prof)

def portail(dossier,cran,dist,suivante,qs):
    """portail approché vite : la course au palier de départ `cran`, la map d'en face = `suivante` (carte:météo), la caisse posée à `dist` m du portail ; durée d'image de l'approche et du passage, ce que le pré-bâti a fait (finisAuPassage, msFin, msSousVoile)"""
    http,port,srv,ch,prof=lance(dossier)
    try:
        c=CDP(port);c.keep={'Runtime.exceptionThrown'};m=suivante.split(':')
        sv=dict(gp.SAVE);sv['vdep']=cran;sv['ex']={'eng':29,'runs':9}
        if not demarre(c,http,'?garde=1&palier=2&tel=1&pistegraine=777&carte=nuages&meteo=midi'+qs,save=sv):return None
        c.call('Emulation.setCPUThrottlingRate',rate=4)
        c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{});1");c.pump(3)
        c.ev(SAMPLEUR);z0=c.ev("dbgEco().zones")
        c.ev("dbgClassique(%s,%s);1"%(json.dumps(m[0]),json.dumps(m[1] if len(m)>1 else None)));c.ev("window.__S.length=0;window.__Son=true;dbgPortail(%d);1"%dist)
        prof_on=os.environ.get('PROFIL')=='1'
        if prof_on:c.call('Profiler.enable');c.call('Profiler.start')
        t=time.time();passe=False
        while time.time()-t<90:
            c.pump(1)
            if c.ev("dbgEco().zones")!=z0:passe=True;break
        PR=profil(c.call('Profiler.stop')['profile'],1000) if prof_on else None
        c.pump(4)
        for i in range(30):
            g=c.ev("(function(){try{return !!dbgGrotteHash().pretMailles}catch(e){return true}})()")
            if g:break
            c.pump(2)
        c.ev("window.__Son=false;1")
        S=json.loads(c.ev("JSON.stringify(window.__S)"))
        return {'profil':PR,'cran':cran,'dist':dist,'suivante':suivante,'passe':passe,'secondes':round(time.time()-t,1),'frames':S,'prebati':json.loads(c.ev("JSON.stringify(dbgPrebati())")),'grotte':json.loads(c.ev("JSON.stringify(typeof dbgGrotteHash==='function'?[dbgGrotteHash(),dbgGrotteTrav()]:null)")),'charge':os.getloadavg()[0]}
    finally:ferme(srv,ch,prof)

if __name__=='__main__':
    m=sys.argv[1]
    if m=='capture':
        sortie=os.environ.get('SORTIE','/tmp/vitesse-captures')
        for i,d in enumerate(sys.argv[2:]):
            print(d,'->',capture(d,'cap%d'%i,sortie))
    elif m=='paliers':
        r=paliers(sys.argv[2],[int(x) for x in sys.argv[3].split(',')],float(sys.argv[4]) if len(sys.argv)>4 else 15,sys.argv[5] if len(sys.argv)>5 else '')
        json.dump(r,open(os.environ.get('SORTIE','/tmp/vitesse-paliers.json'),'w'));print('ok',[(x['tier'],x['atteint'],len(x['frames'])) for x in (r or [])])
    elif m=='depart':
        r=depart(sys.argv[2],[int(x) for x in sys.argv[3].split(',')],float(sys.argv[4]) if len(sys.argv)>4 else 25,sys.argv[5] if len(sys.argv)>5 else '',sys.argv[6] if len(sys.argv)>6 else 'nuages:midi')
        json.dump(r,open(os.environ.get('SORTIE','/tmp/vitesse-depart.json'),'w'));print('ok',[(x or {}).get('cran') for x in r])
    elif m=='profil':
        r=profil_paliers(sys.argv[2],[(3,0,3),(9,1,4),(15,3,0)],float(sys.argv[3]) if len(sys.argv)>3 else 10,sys.argv[4] if len(sys.argv)>4 else '',sys.argv[5] if len(sys.argv)>5 else 'nuages:midi')
        json.dump(r,open(os.environ.get('SORTIE','/tmp/vitesse-profil.json'),'w'));print('ok',[(x or {}).get('idx') for x in r])
    elif m=='portail':
        r=portail(sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),sys.argv[5],sys.argv[6] if len(sys.argv)>6 else '')
        json.dump(r,open(os.environ.get('SORTIE','/tmp/vitesse-portail.json'),'w'));print('ok',r and r['passe'])
    elif m=='course':
        r=course(sys.argv[2],float(sys.argv[3]) if len(sys.argv)>3 else 180,sys.argv[4] if len(sys.argv)>4 else '')
        json.dump(r,open(os.environ.get('SORTIE','/tmp/vitesse-course.json'),'w'));print(len(r or []),'images')
