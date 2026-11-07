#!/usr/bin/env python3
"""LE BANC DE LA MÉMOIRE (2026-11-07, Perf 3 — P1, « une partie ne laisse rien derrière elle »).

    python3 outils/banc-perf/memoire.py [--parties 5] [--json sortie.json] [--tas 2,4] [--qs "&memoire=ancien"] [--carte nuages:midi]

Chrome sans fenêtre déguisé en iPhone (390×844 ×3, `?tel=1&palier=2&garde=1&pistegraine=777`), CPU non bridé. N parties ENCHAÎNÉES :
JOUER (tap) → la caisse roule `--roule` s sous le pilote (dbgAuto) → mort forcée (`dbgBoom`) → écran de fin (pré-bâti fini) → REJOUER (tap).
Après chaque fin de partie (GC forcée) : textures / géométries / programmes (renderer.info), tas JS (usedJSHeapSize + Performance.getMetrics),
toiles rendues (`dbgToiles`), nombre d'objets de la scène, tampons audio décodés (`dbgAudioMem` s'il existe). `--tas 2,4` : un instantané
de tas CDP (HeapProfiler.takeHeapSnapshot) après les parties 2 et 4, comparés par constructeur (self size) dans la sortie.
Sortie 0 = critère tenu (textures/géométries/programmes ±5 %, tas ±15 Mo entre la partie 2 et la dernière, aucune erreur), 1 = franchi, 2 = banc cassé.
"""
import sys,os,json,time,subprocess,socket,urllib.request,tempfile,shutil,importlib.util,collections
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
from cdp import CDP
sp=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(sp);sp.loader.exec_module(gp)
RACINE=os.path.dirname(os.path.dirname(ICI));VP=os.path.join(RACINE,'VERSION PRINCIPALE')
OPT={'tmax':90,'vp':None,'portails':0,'cartes':'nuages:midi,ville:pluie,jade:midi,grotte:matin,dunes:midi,canyon:midi,foret:midi,banquise:midi,espace:matin,crypto:midi','trace':False,'ctrl':0,'parties':5,'json':None,'tas':[],'qs':'','carte':'nuages:midi','roule':8,'dossier':None,'palier':2}
def lire_args():
    av=sys.argv[1:];i=0
    while i<len(av):
        a=av[i]
        if a=='--parties':OPT['parties']=int(av[i+1]);i+=2
        elif a=='--json':OPT['json']=av[i+1];i+=2
        elif a=='--tas':OPT['tas']=[int(x) for x in av[i+1].split(',') if x];i+=2
        elif a=='--qs':OPT['qs']=av[i+1];i+=2
        elif a=='--carte':OPT['carte']=av[i+1];i+=2
        elif a=='--portails':OPT['portails']=int(av[i+1]);i+=2
        elif a=='--cartes':OPT['cartes']=av[i+1];i+=2
        elif a=='--tmax':OPT['tmax']=int(av[i+1]);i+=2
        elif a=='--vp':OPT['vp']=av[i+1];i+=2
        elif a=='--trace':OPT['trace']=True;i+=1
        elif a=='--roule':OPT['roule']=float(av[i+1]);i+=2
        elif a=='--dossier':OPT['dossier']=av[i+1];i+=2
        elif a=='--palier':OPT['palier']=int(av[i+1]);i+=2
        else:i+=1
MESURE=r"""JSON.stringify((function(){var r={};function t(k,f){try{r[k]=f();}catch(e){r[k]='ERR '+String(e).slice(0,80);}}
 var k=null;t('cout',function(){k=dbgCout();return 1;});
 t('tex',function(){return k.tex;});t('geo',function(){return k.geo;});t('progs',function(){return k.progs;});
 t('toiles',function(){return dbgToiles().rendues;});
 t('tasJS',function(){return performance.memory.usedJSHeapSize;});
 t('audio',function(){return window.CCSON?window.CCSON.etat():null;});
 t('scene',function(){return typeof dbgMemoire==='function'?dbgMemoire():null;});
 t('etat',function(){var d=dbgState();return {st:d.started,go:d.gameOver};});
 t('lieu',function(){var d=dbgNiveau();return d.lieu+'/'+d.ciel+' n'+d.niveau;});
 t('trace',function(){return window.__MEMTR?window.__MEMTR.bilan(12):null;});
 t('cpuGeoMo',function(){return window.__MEMTR?window.__MEMTR.cpuTotal():null;});
 return r;})())"""
def clic_sur(c,sel,hold=.12):
    r=c.ev("""(function(){var e=[].slice.call(document.querySelectorAll(%s)).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return null;
      var b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,h=document.elementFromPoint(x,y);return (h===e||e.contains(h))?[x,y]:null})()"""%json.dumps(sel))
    if r:gp.tap(c,r[0],r[1],hold);return True
    return False
def gc(c):
    for _ in range(3):
        try:c.call('HeapProfiler.collectGarbage')
        except Exception:pass
        c.pump(.3)
def metriques_cdp(c):
    try:
        d={m['name']:m['value'] for m in c.call('Performance.getMetrics')['metrics']}
        return {k:d.get(k) for k in ('JSHeapUsedSize','JSHeapTotalSize','Nodes','JSEventListeners','Documents')}
    except Exception as e:return {'err':str(e)[:80]}
def instantane(c,fichier):
    """HeapProfiler.takeHeapSnapshot → fichier .heapsnapshot ; rend le tableau constructeur → (self size, nombre) par lecture du JSON."""
    c.keep.add('HeapProfiler.addHeapSnapshotChunk');c.events=[]
    c.call('HeapProfiler.takeHeapSnapshot',reportProgress=False)
    chunks=[e['params']['chunk'] for e in c.events if e['method']=='HeapProfiler.addHeapSnapshotChunk'];c.events=[]
    open(fichier,'w').write(''.join(chunks))
    return fichier
def resume_instantane(fichier):
    """self size par constructeur (nom du nœud, type) — lecture du format V8 : snapshot.meta.node_fields + nodes[] + strings[]."""
    d=json.load(open(fichier));m=d['snapshot']['meta'];F=m['node_fields'];nf=len(F);T=m['node_types'][0]
    it,inom,iss=F.index('type'),F.index('name'),F.index('self_size');S=d['strings'];N=d['nodes'];tot=collections.Counter();cnt=collections.Counter()
    for i in range(0,len(N),nf):
        ty=T[N[i+it]];nom=S[N[i+inom]]
        if ty in('hidden','native','synthetic','code','concatenated string','sliced string'):k='('+ty+')'
        elif ty=='string':k='(string)'
        elif ty=='object' or ty=='closure':k=nom if ty=='object' else '(closure)'
        elif ty=='array':k='(array)'
        elif ty=='number':k='(number)'
        else:k='('+ty+')'
        tot[k]+=N[i+iss];cnt[k]+=1
    return {k:[tot[k],cnt[k]] for k in tot}
def partie(c,i):
    t0=time.time()
    if i==0:
        # JOUER depuis l'accueil (même geste que la garde de perf)
        t=time.time();ok=False
        while time.time()-t<90 and not ok:
            r=c.ev(gp.BTN)
            if r:gp.tap(c,r[0],r[1],.12);ok=True
            else:
                g=c.ev("(function(){var e=document.getElementById('gJouer');if(!e)return null;var b=e.getBoundingClientRect();return b.width>0?[b.left+b.width/2,b.top+b.height/2]:null})()")
                if g:gp.tap(c,g[0],g[1],.12);ok=True
                elif time.time()-t>25:gp.tap(c,195,300);c.pump(3)
                else:c.pump(.5)
    else:
        # REJOUER (le bouton de l'écran de fin)
        t=time.time();ok=False
        while time.time()-t<30 and not ok:
            ok=clic_sur(c,'[data-a="replay"]')
            if not ok:c.pump(.5)
        if not ok:
            c.ev("dbgEco('rejouer');1")
    if not gp.attend(c,"dbgState().started&&!dbgState().gameOver",OPT['tmax']):
        return {'erreur':'la partie %d ne part pas'%(i+1)}
    c.ev("dbgSable(0);dbgAuto(1,0,{});1");c.pump(OPT['roule'])
    return {'depart_s':round(time.time()-t0,1)}
def main():
    lire_args()
    http=gp.libre();port=gp.libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=OPT['vp'] or VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='banc-memoire-')
    ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','--enable-precise-memory-info','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for _ in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        else:sys.exit('Chrome ne répond pas')
        return corps(http,port)
    finally:
        for p in (ch,srv):
            try:p.terminate();p.wait(5)
            except Exception:
                try:p.kill()
                except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
def corps(http,port):
    base='http://127.0.0.1:%d'%http
    c=CDP(port);c.keep={'Runtime.exceptionThrown','Runtime.consoleAPICalled'}
    for m in ('Network.enable','Page.enable','Runtime.enable','HeapProfiler.enable','Performance.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(dict(gp.SAVE,sfx=True,vox=True))))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=gp.HOOK)
    if OPT['trace']:c.call('Page.addScriptToEvaluateOnNewDocument',source=open(os.path.join(ICI,'traceur-memoire.js')).read())
    A=OPT['carte'].split(':')
    c.call('Page.navigate',url=base+'/index.html?garde=1&tel=1&palier=%d&pistegraine=777&carte=%s&meteo=%s%s'%(OPT['palier'],A[0],A[1] if len(A)>1 else 'midi',OPT['qs']))
    if not gp.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):print('⛔ le jeu ne démarre pas');return 2
    if not gp.attend(c,"(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];return !!e})()",90):
        t=time.time()
        while time.time()-t<60 and not c.ev(gp.BTN):gp.tap(c,195,300);c.pump(.8)
    gp.attend(c,"dbgPrebati().etat==='pret'",60);c.pump(1)
    gc(c);raw=c.ev(MESURE)
    if not str(raw).startswith('{'):print('MESURE :',raw);return 2
    base0=json.loads(raw);base0['cdp']=metriques_cdp(c)
    sortie={'date':time.strftime('%Y-%m-%d %H:%M'),'qs':OPT['qs'],'carte':OPT['carte'],'palier':OPT['palier'],'accueil':base0,'parties':[]}
    print('accueil   tex %s geo %s prog %s tas %.1f Mo toiles %s audio %s'%(base0['tex'],base0['geo'],base0['progs'],(base0['tasJS'] or 0)/1048576,base0['toiles'],base0['audio']))
    erreurs=[]
    for i in range(OPT['parties']):
        r=partie(c,i)
        if 'erreur' in r:print('⛔',r['erreur']);erreurs.append(r['erreur']);break
        # K portails franchis (chacun reconstruit la piste et le décor) — un relevé après chacun
        cartes=[x.split(':') for x in OPT['cartes'].split(',') if x]
        for k in range(OPT['portails']):
            nxt=cartes[(i*OPT['portails']+k+1)%len(cartes)];z0=c.ev("dbgEco().zones")
            c.ev("dbgClassique(%s,%s);1"%(json.dumps(nxt[0]),json.dumps(nxt[1] if len(nxt)>1 else None)));c.ev("dbgPortail(2600);1");c.pump(1)
            t=time.time()
            while time.time()-t<OPT['tmax'] and c.ev("dbgEco().zones")==z0:c.pump(.3)
            c.pump(4);gc(c);raw=c.ev(MESURE)
            if str(raw).startswith('{'):
                q=json.loads(raw);au=q['audio'] if isinstance(q['audio'],dict) else {}
                sortie.setdefault('portails',[]).append(dict(q,partie=i+1,k=k+1,voulu=':'.join(nxt)))
                print('   portail %d.%d → %-14s tex %s geo %s prog %s tas %.1f Mo audio %s Mo %s'%(i+1,k+1,q.get('lieu'),q['tex'],q['geo'],q['progs'],(q['tasJS'] or 0)/1048576,au.get('mo'),('· CPU géo %s Mo, hors scène %s géo/%s Mo'%(q['cpuGeoMo'],q['trace']['geoHorsScene'],q['trace']['cpuHorsSceneMo'])) if isinstance(q.get('trace'),dict) else ''))
        # mort forcée → écran de fin → pré-bâti prêt
        c.ev("dbgAuto(0);1");c.ev("dbgBoom();1")
        if not gp.attend(c,"dbgState().gameOver",30):erreurs.append('partie %d : pas de fin'%(i+1));break
        c.pump(6)
        gp.attend(c,"dbgPrebati().etat==='pret'||dbgPrebati().etat===''",40);c.pump(1.5)
        gc(c);m=json.loads(c.ev(MESURE));m['cdp']=metriques_cdp(c);m['partie']=i+1;m.update(r)
        sortie['parties'].append(m)
        au=m['audio'] if isinstance(m['audio'],dict) else {}
        print('partie %d  %s  tex %s geo %s prog %s tas %.1f Mo toiles %s audio %s Mo (%s) %s'%(i+1,m.get('lieu'),m['tex'],m['geo'],m['progs'],(m['tasJS'] or 0)/1048576,m['toiles'],au.get('mo'),au.get('residents'),('· horsScene geo %s (%s Mo CPU) tex %s · cpuGeo %s Mo'%(m['trace']['geoHorsScene'],m['trace']['cpuHorsSceneMo'],m['trace']['texHorsScene'],m['cpuGeoMo'])) if isinstance(m.get('trace'),dict) else ''))
        if (i+1) in OPT['tas']:
            d=OPT['dossier'] or tempfile.gettempdir();f=os.path.join(d,'tas-partie%d.heapsnapshot'%(i+1))
            instantane(c,f);sortie.setdefault('instantanes',{})[str(i+1)]=f;print('   instantané →',f,'%.0f Mo'%(os.path.getsize(f)/1048576))
    err=c.ev("JSON.stringify({l:window.__loopErr?String(window.__loopErr).slice(0,200):null,p:window.__prebErr?String(window.__prebErr).slice(0,200):null,d:window.__dnErr?String(window.__dnErr).slice(0,120):null,g:window.__grotteErr?String(window.__grotteErr).slice(0,120):null})")
    for k,v in json.loads(err).items():
        if v:erreurs.append('erreur de page (%s) : %s'%(k,v))
    for e in c.events:
        if e['method']=='Runtime.exceptionThrown':erreurs.append('exception : '+(e['params']['exceptionDetails'].get('exception',{}).get('description') or '')[:160])
    sortie['erreurs']=erreurs
    P=sortie['parties'];verdict=[]
    if len(P)>=3:
        a,b=P[1],P[-1]
        for k in('tex','geo','progs'):
            if a[k] and abs(b[k]-a[k])/a[k]>.05:verdict.append('%s : %s → %s (> 5 %%)'%(k,a[k],b[k]))
        dt=((b['tasJS'] or 0)-(a['tasJS'] or 0))/1048576
        sortie['deltaTasMo']=round(dt,1)
        if abs(dt)>15:verdict.append('tas : %+.1f Mo entre la partie 2 et la %d (> 15 Mo)'%(dt,len(P)))
    sortie['verdict']=verdict
    if OPT['json']:json.dump(sortie,open(OPT['json'],'w'),indent=1,ensure_ascii=False)
    print('erreurs :',erreurs or 'aucune');print('verdict :','✘ '+' · '.join(verdict) if verdict else '✔ critère tenu')
    return 1 if (erreurs or verdict) else 0
if __name__=='__main__':sys.exit(main())
