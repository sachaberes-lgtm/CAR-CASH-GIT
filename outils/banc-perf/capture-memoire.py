#!/usr/bin/env python3
"""capture-memoire.py (2026-11-07, Perf 3 — P1) : « la mémoire ne change pas l'image ». Pour chaque carte, deux constructions (AVANT = un VERSION PRINCIPALE d'origin/main, APRÈS = celui du worktree),
chacune deux fois : iPhone émulé p2, `?tel=1&palier=2&pistegraine=777`, JOUER, pilote, `dbgPortailPhoto(900)` (une image de course sans HUD à 900 m du portail).
Sort les JPEG (.95) dans --dossier et la différence moyenne par pixel (0-255) entre : AVANT/AVANT (le bruit du banc : nuages animés, 1 image près), APRÈS/APRÈS, AVANT/APRÈS.
Usage : python3 capture-memoire.py --avant <dossier VP> --apres <dossier VP> --dossier <sortie> [carte:météo …]"""
import sys,os,json,time,subprocess,tempfile,urllib.request,base64,importlib.util
ICI=os.path.dirname(os.path.abspath(__file__))
sp=importlib.util.spec_from_file_location('m',os.path.join(ICI,'memoire.py'));m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);gp=m.gp;CDP=m.CDP
av=sys.argv[1:];A={'avant':None,'apres':m.VP,'dossier':'.'};maps=[];i=0
while i<len(av):
    if av[i] in('--avant','--apres','--dossier'):A[av[i][2:]]=av[i+1];i+=2
    else:maps.append(av[i]);i+=1
maps=maps or['nuages:midi','canyon:matin']
os.makedirs(A['dossier'],exist_ok=True)
def serveur(vp):
    p=gp.libre();s=subprocess.Popen([sys.executable,'-m','http.server',str(p),'--bind','127.0.0.1'],cwd=vp,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);return p,s
port=gp.libre();prof=tempfile.mkdtemp()
ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
S={k:serveur(A[k]) for k in('avant','apres')}
def une(c,k,carte,n):
    base='http://127.0.0.1:%d'%S[k][0];cm=carte.split(':')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(gp.SAVE)))
    c.call('Page.navigate',url=base+'/index.html?garde=1&tel=1&palier=2&pistegraine=777&carte=%s&meteo=%s'%(cm[0],cm[1]))
    gp.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",300);gp.attend(c,"dbgPrebati().etat==='pret'",120);c.pump(1)
    m.OPT['roule']=3;m.partie(c,0)
    c.ev("dbgSable(1);dbgAuto(1,0,{});1");c.ev("dbgPortail(2600);1");c.pump(2)
    r=c.ev("dbgPortailPhoto(900,.95).then(function(x){return x&&x.url?x.url:String(x)})",120)
    f=os.path.join(A['dossier'],'%s-%s-%s-%d.jpg'%(cm[0],cm[1],k,n))
    if r and str(r).startswith('data:'):open(f,'wb').write(base64.b64decode(r.split(',',1)[1]));return f
    print('⛔',k,carte,'pas d\'image :',str(r)[:80]);return None
DIFF="""(async function(a,b){async function px(u){const bm=await createImageBitmap(await (await fetch(u)).blob());const c=new OffscreenCanvas(bm.width,bm.height),x=c.getContext('2d');x.drawImage(bm,0,0);return x.getImageData(0,0,bm.width,bm.height).data}
const A=await px(a),B=await px(b);let s=0,n=0,g=0;for(let i=0;i<A.length;i+=4){const d=(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2]))/3;s+=d;n++;if(d>16)g++;}return {moy:+(s/n).toFixed(3),pxGrands:+(100*g/n).toFixed(3)}})"""
try:
    for _ in range(60):
        time.sleep(.5)
        try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
        except Exception:pass
    c=CDP(port)
    for x in('Network.enable','Page.enable','Runtime.enable'):c.call(x)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844)
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
    res={}
    for carte in maps:
        F={}
        for n in(1,2):
            for k in('avant','apres'):F[(k,n)]=une(c,k,carte,n)
        # la comparaison, dans une page vide (data: URLs lues par fetch)
        c.call('Page.navigate',url='about:blank');c.pump(.5)
        def d(p,q):
            if not F[p] or not F[q]:return None
            ua='data:image/jpeg;base64,'+base64.b64encode(open(F[p],'rb').read()).decode();ub='data:image/jpeg;base64,'+base64.b64encode(open(F[q],'rb').read()).decode()
            return c.ev('(%s)(%s,%s)'%(DIFF,json.dumps(ua),json.dumps(ub)),120)
        res[carte]={'avant/avant':d(('avant',1),('avant',2)),'apres/apres':d(('apres',1),('apres',2)),'avant/apres':d(('avant',1),('apres',1)),'avant2/apres2':d(('avant',2),('apres',2))}
        print(carte,json.dumps(res[carte]))
    json.dump(res,open(os.path.join(A['dossier'],'differences.json'),'w'),indent=1)
finally:
    for p in(ch,S['avant'][1],S['apres'][1]):
        try:p.terminate()
        except Exception:pass
