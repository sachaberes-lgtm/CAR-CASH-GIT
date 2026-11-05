#!/usr/bin/env python3
"""JOUER et REJOUER (2026-11-05, passe perf mobile 2, B1) : les images longues dans les secondes qui suivent le toucher.

    python3 outils/banc-perf/jouer.py [--palier 0] [--n 4] [--json sortie.json] [--menu 8] [--mort 1.5] [carte:météo …]

Par map et par passe : page neuve (?tel=1&palier=N&garde=1&pistegraine=777&carte=…), le menu touchable, processeur ×4 posé, `--menu` s d'attente au menu
(le départ d'avance travaille), `dbgPrebati()` lu, JOUER touché ; 3 s d'images mesurées ; course 5 s ; mort forcée (`dbgBoom`), `--mort` s après l'apparition
de REJOUER, `dbgPrebati()` lu, REJOUER touché ; 3 s d'images mesurées. Relevé par toucher : pire image, images > 100 / > 150 ms, état du départ d'avance,
`pickups.length` + somme des positions (preuve de simulation, avec ?perfrec). Sortie 0 = ok, 2 = le banc n'a pas pu tourner. Verrou : verrou-banc.sh, charge < 8.
"""
import sys,os,json,time,subprocess,socket,urllib.request,tempfile,shutil
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
from cdp import CDP
RACINE=os.path.dirname(os.path.dirname(ICI));VP=os.path.join(RACINE,'VERSION PRINCIPALE')
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
SAVE={'v':2,'sfx':False,'mus':False,'vox':False,'tuto':1,'permis':1,'lang':'fr','facile':0,'q':'net','qChoisi':1,'plq':{'m':0,'x':'BANC 01','ok':1}}
MAPS=['nuages:midi','ville:pluie','jade:midi','foret:midi']
HOOK=r"""(function(){window.__NT=[];document.addEventListener('cc:construction',function(e){if(e.detail.etape==='fin')window.__NT.push(e.detail.ms);});window.__F=[];window.__Fon=false;var l=performance.now();function f(t){if(window.__Fon)window.__F.push([t-l,t]);l=t;requestAnimationFrame(f);}requestAnimationFrame(f);})();"""
BTN=r"""(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return null;var b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,h=document.elementFromPoint(x,y);return (h===e||e.contains(h))?[x,y]:null})()"""
REJ=r"""(function(){var e=[].slice.call(document.querySelectorAll('[data-m="replay"]')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return null;var b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,h=document.elementFromPoint(x,y);return (h===e||e.contains(h))?[x,y]:null})()"""
PREB=r"""JSON.stringify((function(){var p=dbgPrebati();return {etat:p.etat,carte:p.carte,dep:p.dep?1:0,pris:p.prisAuDepart,pasPris:p.annules,echecs:p.echecs,ms:p.ms}})())"""
PICK=r"""JSON.stringify(dbgPick())"""
def libre():
    s=socket.socket();s.bind(('127.0.0.1',0));p=s.getsockname()[1];s.close();return p
def chrome():
    for c in (os.environ.get('CHROME'),'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'):
        if c and os.path.exists(c):return c
    sys.exit('Chrome introuvable')
def tap(c,x,y,hold=.08):
    c.call('Input.dispatchTouchEvent',type='touchStart',touchPoints=[{'x':x,'y':y,'id':1}]);c.pump(hold);c.call('Input.dispatchTouchEvent',type='touchEnd',touchPoints=[])
def attend(c,js,tmax,pas=.3):
    t=time.time()
    while time.time()-t<tmax:
        if c.ev(js) is True:return True
        c.pump(pas)
    return False
def profil(c,nom,opt):
    # (--profil) le profil processeur de la fenêtre : les 14 fonctions les plus lourdes en temps cumulé (inclusif) et propre
    P=c.call('Profiler.stop')['profile'];N={n['id']:n for n in P['nodes']};dt=P['timeDeltas'];ids=P['samples'];own={}
    for i,sid in enumerate(ids):own[sid]=own.get(sid,0)+dt[i]
    par={}
    for n in P['nodes']:
        for ch in n.get('children',[]):par[ch]=n['id']
    inc={}
    for sid,t in own.items():
        seen=set();x=sid
        while x is not None:
            cf=N[x]['callFrame'];k=(cf['functionName'] or '(anon)')+':'+str(cf['lineNumber']+1)
            if k not in seen:inc[k]=inc.get(k,0)+t;seen.add(k)
            x=par.get(x)
    top=sorted(inc.items(),key=lambda a:-a[1])[:40]
    print('--- PROFIL',nom,'(ms cumulés, x4)');[print('  %6.0f %s'%(v/1000,k)) for k,v in top]
def fenetre(c,sec):
    c.ev("window.__F.length=0;window.__Fon=true;1");c.pump(sec);c.ev("window.__Fon=false;1")
    F=json.loads(c.ev("JSON.stringify(window.__F)"))
    d=[x[0] for x in F[1:]]
    return {'pire':round(max(d or [0])),'sup100':sum(1 for x in d if x>100),'sup150':sum(1 for x in d if x>150),'images':len(d),'duree_ms':round(sum(d))}
def passe(c,base,carte,opt):
    A=carte.split(':')
    c.call('Page.navigate',url=base+'/index.html?tel=1&palier=%d&garde=1&pistegraine=777&perfrec=1&carte=%s&meteo=%s%s'%(opt['palier'],A[0],A[1] if len(A)>1 else 'midi',opt['extra']))
    if not attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):return {'erreur':'le jeu ne démarre pas'}
    t=time.time();tl=0
    while time.time()-t<240 and not c.ev(BTN):
        if time.time()-tl>.5:tap(c,195,422,.05);tl=time.time()
        c.pump(.1)
    if not c.ev(BTN):return {'erreur':'pas de menu'}
    c.call('Emulation.setCPUThrottlingRate',rate=4)
    c.pump(opt['menu'])
    r={'carte':carte,'palier':opt['palier']}
    r['prebJouer']=json.loads(c.ev(PREB));b=c.ev(BTN)
    if not b:return dict(r,erreur='JOUER introuvable')
    if opt['profil']:c.call('Profiler.enable');c.call('Profiler.setSamplingInterval',interval=500);c.call('Profiler.start')
    tap(c,b[0],b[1],.12)
    c.ev('window.__NT.length=0;1');r['jouer']=fenetre(c,3.0);r['ntJouer']=c.ev('JSON.stringify(window.__NT)')
    if opt['profil']:profil(c,'JOUER',opt)
    if not attend(c,"dbgState().started&&!dbgState().gameOver",60):return dict(r,erreur='JOUER ne part pas')
    r['pickJouer']=json.loads(c.ev(PICK));c.ev("dbgAuto(1,0,{});1");c.pump(5)
    c.ev("dbgBoom();1")
    if not attend(c,"dbgState().gameOver",30):return dict(r,erreur='pas de mort')
    if not attend(c,REJ.replace('return null;','return false;').replace('return (h===e||e.contains(h))?[x,y]:null','return (h===e||e.contains(h))')+"",60):return dict(r,erreur='REJOUER invisible')
    c.pump(opt['mort'])
    r['prebRejouer']=json.loads(c.ev(PREB));b=c.ev(REJ)
    if not b:return dict(r,erreur='REJOUER introuvable')
    if opt['profil']:c.call('Profiler.start')
    tap(c,b[0],b[1],.12)
    c.ev('window.__NT.length=0;1');r['rejouer']=fenetre(c,3.0);r['ntRejouer']=c.ev('JSON.stringify(window.__NT)')
    if opt['profil']:profil(c,'REJOUER',opt)
    attend(c,"dbgState().started&&!dbgState().gameOver",60);c.pump(1)
    r['pickRejouer']=json.loads(c.ev(PICK))
    r['err']=c.ev("window.__loopErr?String(window.__loopErr).slice(0,200):(window.__prebErr?String(window.__prebErr).slice(0,200):null)")
    return r
def main():
    av=sys.argv[1:];opt={'palier':0,'n':4,'json':None,'menu':8.0,'mort':1.5,'extra':'','profil':False};maps=[];i=0
    while i<len(av):
        a=av[i]
        if a=='--palier':opt['palier']=int(av[i+1]);i+=2
        elif a=='--n':opt['n']=int(av[i+1]);i+=2
        elif a=='--json':opt['json']=av[i+1];i+=2
        elif a=='--menu':opt['menu']=float(av[i+1]);i+=2
        elif a=='--mort':opt['mort']=float(av[i+1]);i+=2
        elif a=='--profil':opt['profil']=True;i+=1
        elif a=='--extra':opt['extra']=av[i+1];i+=2
        else:maps.append(a);i+=1
    maps=maps or MAPS
    http=libre();port=libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='jouer-')
    ch=subprocess.Popen([chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    R=[]
    try:
        for k in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        else:return 2
        base='http://127.0.0.1:%d'%http
        c=CDP(port)
        for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
        c.call('Network.setBypassServiceWorker',bypass=True)
        c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
        c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=UA,platform='iPhone')
        c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
        c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(SAVE)))
        c.call('Page.addScriptToEvaluateOnNewDocument',source=HOOK)
        for m in maps:
            for k in range(opt['n']):
                c.call('Emulation.setCPUThrottlingRate',rate=1)
                r=passe(c,base,m,opt);R.append(r)
                if 'erreur' in r:print(m,'passe',k+1,'⛔',r['erreur']);continue
                print('%-13s #%d | JOUER pire %4d ms (>100: %d, >150: %d) dép.avance %s %s | REJOUER pire %4d ms (>100: %d, >150: %d) dép.avance %s %s | newTrack %s/%s | pièces %s→%s'%(m,k+1,r['jouer']['pire'],r['jouer']['sup100'],r['jouer']['sup150'],r['prebJouer']['etat'] or '-',r['prebJouer']['carte'],r['rejouer']['pire'],r['rejouer']['sup100'],r['rejouer']['sup150'],r['prebRejouer']['etat'] or '-',r['prebRejouer']['carte'],r['ntJouer'],r['ntRejouer'],r['pickJouer'],r['pickRejouer']))
    finally:
        for p in (ch,srv):
            try:p.terminate();p.wait(5)
            except Exception:
                try:p.kill()
                except Exception:pass
        try:os.killpg(ch.pid,9)
        except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
        if opt['json']:json.dump({'date':time.strftime('%Y-%m-%d %H:%M'),'opt':opt,'charge':round(os.getloadavg()[0],1),'tempsFiables':os.getloadavg()[0]<8,'cpu':4,'passes':R},open(opt['json'],'w'),indent=1,ensure_ascii=False)
    return 0
if __name__=='__main__':sys.exit(main())
