#!/usr/bin/env python3
"""LE BANC DU DÉPART ET DE LA MORT (2026-11-08, Perf 3 — P6 « dernière salve » : les gels de 1,2 s au JOUER/REJOUER et de 2,8 s à la mort sur le 13 Pro).

    python3 outils/banc-perf/depart-mort.py [--carte nuages:midi] [--cpu 4] [--parties 2] [--json f.json] [--md f.md] [--qs "&x=0"] [--son 0]

Chrome sans fenêtre déguisé en iPhone (390×844 ×3, `?garde=1&palier=2&tel=1&pistegraine=777`, son ET voix ouverts), processeur ×N posé APRÈS le menu et sa chauffe.
Trois FENÊTRES de 3 s sont profilées (CDP `Profiler`, échantillon 0,5 ms, fil principal) : JOUER (partie 1), la MORT (dbgBoom), REJOUER (partie 2, …).
Pour chacune : les images > 100 ms (rAF) avec l'instant, les « long-animation-frame » avec leurs scripts, et le PROFIL par poste — temps inclusif en ms des fonctions
qui comptent (newTrack, départ d'avance, chauffe, buildTrack, HUD, photos, son/décodage, explosion…) et les 15 fonctions les plus lourdes en temps propre.
Le critère de P6 : aucune image > 100 ms dans les 3 s après JOUER / REJOUER ni après la mort. Sortie 0 = tenu, 1 = franchi, 2 = banc cassé.
Piège du Chrome sans fenêtre : `COMPLETION_STATUS_KHR` ne répond jamais vrai (la chauffe du menu s'arrêterait) — le banc la déclare vraie 300 ms après `linkProgram`.
"""
import sys,os,json,time,subprocess,tempfile,shutil,importlib.util,collections,urllib.request
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
from cdp import CDP
sp=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(sp);sp.loader.exec_module(gp)
RACINE=os.path.dirname(os.path.dirname(ICI));VP=os.path.join(RACINE,'VERSION PRINCIPALE')
OPT={'vp':None,'latence':0,'sans_profil':0,'carte':'nuages:midi','cpu':4,'parties':2,'json':None,'md':None,'qs':'','son':1,'fenetre':3.0,'tas':0}
HOOK=r"""(function(){
 var P=window.__D={F:[],on:false,t0:performance.now(),loaf:[],lab:''};
 ['WebGL2RenderingContext','WebGLRenderingContext'].forEach(function(C){var Q=window[C]&&window[C].prototype;if(!Q)return;
  var lp=Q.linkProgram,LT=new WeakMap(),gpp=Q.getProgramParameter;Q.linkProgram=function(p){LT.set(p,performance.now());if(P.on)P.lk=(P.lk|0)+1;return lp.call(this,p);};
  Q.getProgramParameter=function(p,k){if(k===37297){var t0=LT.get(p);return t0===undefined||performance.now()-t0>300;}return gpp.call(this,p,k);};
  ['texImage2D','readPixels','bufferData','getError'].forEach(function(k){var f=Q[k];if(!f)return;Q[k]=function(){var a=performance.now(),r=f.apply(this,arguments),d=performance.now()-a;if(P.on&&d>15)(P.gl=P.gl||[]).push([Math.round(a-P.t0),Math.round(d),k,P.lab]);return r;};});});
 var l=performance.now();function f(t){var d=t-l;l=t;if(P.on&&d>50)P.F.push([Math.round(t-P.t0),Math.round(d),P.lab]);requestAnimationFrame(f);}requestAnimationFrame(f);
 try{new PerformanceObserver(function(L){L.getEntries().forEach(function(e){if(!P.on||e.duration<80)return;P.loaf.push({t:Math.round(e.startTime-P.t0),d:Math.round(e.duration),lab:P.lab,
  sc:(e.scripts||[]).filter(function(s){return s.duration>15;}).map(function(s){return s.invoker+' '+s.sourceFunctionName+' '+Math.round(s.duration)+'ms (forcé '+Math.round(s.forcedStyleAndLayoutDuration||0)+')';})});});}).observe({type:'long-animation-frame',buffered:true});}catch(e){}
})();"""
# les postes : (nom du poste, expression régulière sur le nom de la fonction du profil)
POSTES=[('newTrack / piste','^(newTrack|buildTrack|trackBuild|pisteBati.*|buildPiste.*)$'),('départ d\'avance','^(prebAvec|prebati.*|prebDep.*|prebStep.*|prebBat.*)$'),('chauffe niveau / divers','^(chauffeDivers|chauffeRendu|engChauffe\\d*|chauffeApres|jadeChauffe.*|.*[Cc]hauffe)$'),
 ('resetGame','^resetGame$'),('startGame/JOUER','^(startGame|lancer|jouer|launch.*|gameStart.*)$'),('rendu three','^(render|renderBufferDirect|WebGLRenderer\\.render|renderer\\.render)$'),('composer / bloom','^(composer.*|EffectComposer.*|bloom.*)$'),
 ('HUD','^(hud.*|figHud.*|hudColonne.*|passeTextes|majHud.*)$'),('son (décodage, bus)','^(decodeAudioData|sfx|.*[Dd]ecod.*|.*[Ss]on[A-Z].*|CCSON.*|musique.*|mus[A-Z].*)$'),('photos / vignettes','^(carPhoto|photoTour|photoDev|figFilm|engVig.*|homeCielPrise|vitrine.*)$'),
 ('mort / explosion','^(explode|boom.*|mort.*|spawnBill|billsTick|fin.*Partie|gameOver.*)$'),('GC / natif','^\\((garbage collector|program|idle)\\)$'),('setSize / DPR','^(applyDPR|setSize|setPixelRatio|qlPose|qlReprise|applyQ)$')]
def chrome_demarre(http,port,cpu,carte):
    base='http://127.0.0.1:%d'%http
    c=CDP(port);c.keep={'Runtime.exceptionThrown'}
    for m in ('Network.enable','Page.enable','Runtime.enable','Performance.enable','Profiler.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    sv=dict(gp.SAVE,sfx=bool(OPT['son']),vox=bool(OPT['son']),mus=False)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(sv)))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=HOOK)
    A=carte.split(':')
    c.call('Page.navigate',url=base+'/index.html?garde=1&palier=2&tel=1&pistegraine=777&carte=%s&meteo=%s%s'%(A[0],A[1] if len(A)>1 else 'midi',OPT['qs']))
    if not gp.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):print('⛔ le jeu ne démarre pas');return None
    t=time.time();n=0
    while time.time()-t<150 and not c.ev(gp.BTN): # un toucher de l'intro seulement tant que l'accueil n'est pas là
        if c.ev("!!window.__intro"):gp.tap(c,195,300);n+=1;c.pump(4) # l'intro (window.__intro : 'attente' puis la boule) attend un toucher, puis un second après 4,6 s
        else:c.pump(1)
    gp.attend(c,"dbgPrebati().etat==='pret'",120);c.pump(1)
    t=time.time()
    while time.time()-t<120: # la chauffe du menu (divers → moteurs → rendu) doit être finie : sinon le JOUER la subit
        d=json.loads(c.ev("JSON.stringify(typeof dbgChauffe==='function'?dbgChauffe():{})") or '{}')
        if d.get('rendu'):break
        c.pump(3)
    print('toucher(s) d\'intro :',n,'· chauffe du menu :',c.ev("JSON.stringify(typeof dbgChauffe==='function'?dbgChauffe():null)"),flush=True)
    c.pump(2)
    return c
def profil_demarre(c):
    c.call('Profiler.setSamplingInterval',interval=500);c.call('Profiler.start')
def profil_arrete(c):
    return c.call('Profiler.stop')['profile']
def analyse(prof,t0_us=None):
    nodes={n['id']:n for n in prof['nodes']};parent={}
    for n in prof['nodes']:
        for ch in n.get('children',[]):parent[ch]=n['id']
    S=prof['samples'];D=prof['timeDeltas'];nm=lambda n:(n['callFrame']['functionName'] or '(anonyme)')
    selft=collections.Counter();incl=collections.Counter();lieu={}
    for i,sid in enumerate(S):
        dt=(D[i+1] if i+1<len(D) else D[i])/1000.0
        n=nodes[sid];f=nm(n);selft[f]+=dt;lieu.setdefault(f,'%s:%d'%((n['callFrame']['url'] or '').split('/')[-1].split('?')[0],n['callFrame']['lineNumber']+1))
        vu=set();x=sid
        while x is not None:
            g=nm(nodes[x])
            if g not in vu:vu.add(g);incl[g]+=dt
            x=parent.get(x)
    return selft,incl,lieu
def fenetre(c,nom,action,duree):
    """Profil + images lentes d'une fenêtre : `action` (js) lancée à t=0, on profile `duree` s."""
    c.ev("__D.lab=%s;__D.F.length=0;__D.loaf.length=0;__D.gl=[];__D.lk=0;__D.on=true;1"%json.dumps(nom))
    if not OPT['sans_profil']:profil_demarre(c)
    t0=time.time()
    r=action() if callable(action) else c.ev(action)
    c.pump(max(0.2,duree-(time.time()-t0)))
    prof=profil_arrete(c) if not OPT['sans_profil'] else {'nodes':[{'id':1,'callFrame':{'functionName':'(root)','url':'','lineNumber':0},'children':[]}],'samples':[1],'timeDeltas':[0]}
    c.ev("__D.on=false;1")
    D=json.loads(c.ev("JSON.stringify({F:__D.F,loaf:__D.loaf,gl:__D.gl,lk:__D.lk|0})"))
    selft,incl,lieu=analyse(prof)
    tot=sum(selft.values())
    postes=[]
    for pn,rx in POSTES:
        import re
        m=re.compile(rx)
        s=sum(v for k,v in incl.items() if m.match(k))
        # le total d'un poste = la plus grosse fonction correspondante (l'inclusif des sous-appels se recouvre)
        mx=max([(v,k) for k,v in incl.items() if m.match(k)] or [(0,'')])
        postes.append((pn,round(mx[0]),mx[1]))
    top_incl=[(k,round(v),lieu.get(k,'')) for k,v in incl.most_common(60) if k not in('(root)','(program)','(idle)')][:30]
    top_self=[(k,round(v),lieu.get(k,'')) for k,v in selft.most_common(16)]
    pire=max([f[1] for f in D['F']] or [0]);n100=sum(1 for f in D['F'] if f[1]>100)
    res={'fenetre':nom,'duree':duree,'pire_image_ms':pire,'images_sup100':n100,'images_lentes':D['F'][:20],'loaf':D['loaf'][:10],'gl_lents':D['gl'][:10],'programmes_lies':D['lk'],
         'total_ms':round(tot),'idle_ms':round(selft.get('(idle)',0)),'postes':postes,'incl_top':top_incl,'self_top':top_self,'retour':str(r)[:80] if r is not None else None}
    print('\n== %s : pire image %d ms · %d images > 100 ms · %d programmes liés · occupé %d ms / %d'%(nom,pire,n100,D['lk'],tot-selft.get('(idle)',0),tot))
    print('   images lentes (t ms depuis le début de page, durée) :',[(a,b) for a,b,_ in D['F'][:12]])
    for l in D['loaf'][:6]:print('   LoAF',l['t'],l['d'],'ms',l['sc'][:3])
    for g in D['gl'][:6]:print('   GL lent',g)
    print('   postes (inclusif ms) :',', '.join('%s %d'%(p,v) for p,v,_ in postes if v>0))
    print('   top inclusif :',', '.join('%s %d'%(k,v) for k,v,_ in top_incl[:14]))
    print('   top propre   :',', '.join('%s %d'%(k,v) for k,v,_ in top_self[:10]))
    return res
def jouer(c):
    t=time.time();ok=False
    while time.time()-t<90 and not ok:
        r=c.ev(gp.BTN)
        if r:gp.tap(c,r[0],r[1],.12);ok=True
        else:
            g=c.ev("(function(){var e=document.getElementById('gJouer');if(!e)return null;var b=e.getBoundingClientRect();return b.width>0?[b.left+b.width/2,b.top+b.height/2]:null})()")
            if g:gp.tap(c,g[0],g[1],.12);ok=True
            else:c.pump(.5)
    return ok
def rejouer(c):
    t=time.time()
    while time.time()-t<40:
        r=c.ev("""(function(){var e=[].slice.call(document.querySelectorAll('#mDead [data-m="replay"]')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return null;var b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,h=document.elementFromPoint(x,y);return (h===e||e.contains(h))?[x,y]:null})()""")
        if r:gp.tap(c,r[0],r[1],.12);return True
        c.pump(.4)
    c.ev("dbgEco('rejouer');1");return False
def main():
    av=sys.argv[1:];i=0
    while i<len(av):
        a=av[i]
        if a in('--carte','--json','--md','--qs'):OPT[a[2:]]=av[i+1];i+=2
        elif a in('--cpu','--parties','--son'):OPT[a[2:]]=int(av[i+1]);i+=2
        elif a=='--vp':OPT['vp']=av[i+1];i+=2
        elif a=='--latence':OPT['latence']=1;i+=1
        elif a=='--sans-profil':OPT['sans_profil']=1;i+=1
        elif a=='--fenetre':OPT['fenetre']=float(av[i+1]);i+=2
        else:i+=1
    http=gp.libre();port=gp.libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=OPT['vp'] or VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='banc-depart-')
    ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for _ in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        else:sys.exit('Chrome ne répond pas')
        c=chrome_demarre(http,port,OPT['cpu'],OPT['carte'])
        if not c:return 2
        c.call('Emulation.setCPUThrottlingRate',rate=OPT['cpu']);c.pump(1)
        if OPT['latence']:return latences(c)
        sortie={'date':time.strftime('%Y-%m-%d %H:%M'),'carte':OPT['carte'],'cpu':OPT['cpu'],'qs':OPT['qs'],'charge':os.getloadavg()[0],'fenetres':[]}
        F=sortie['fenetres']
        for p in range(OPT['parties']):
            etiq='JOUER' if p==0 else 'REJOUER %d'%p
            F.append(fenetre(c,etiq+' (3 s)',lambda:jouer(c) if p==0 else rejouer(c),OPT['fenetre']))
            if not gp.attend(c,"dbgState().started&&!dbgState().gameOver",60):print('⛔ la partie ne part pas');break
            c.ev("dbgSable(0);dbgAuto(1,0,{});1");c.pump(6)
            F.append(fenetre(c,'MORT %d (3 s)'%(p+1),"dbgAuto(0);dbgBoom();1",OPT['fenetre']))
            gp.attend(c,"dbgState().gameOver",30);c.pump(5)
            F.append(fenetre(c,'ÉCRAN DE MORT %d (3 s, 8 s après)'%(p+1),"1",OPT['fenetre']))
            gp.attend(c,"(function(){var e=document.querySelector('#mDead [data-m=\"replay\"]');return !!e&&e.getBoundingClientRect().width>0})()",40) # le bouton est là avant d'ouvrir la fenêtre REJOUER
        err=c.ev("JSON.stringify({l:window.__loopErr?String(window.__loopErr).slice(0,200):null,p:window.__prebErr?String(window.__prebErr).slice(0,200):null})")
        sortie['erreurs']=[v for v in json.loads(err).values() if v]

        mauvais=[f for f in F if f['images_sup100']>0]
        sortie['verdict']='tenu' if not mauvais and not sortie['erreurs'] else 'franchi : '+', '.join('%s (%d images, pire %d ms)'%(f['fenetre'],f['images_sup100'],f['pire_image_ms']) for f in mauvais)
        print('\nVERDICT :',sortie['verdict'],'· erreurs :',sortie['erreurs'] or 'aucune','· charge machine %.0f'%sortie['charge'])
        if OPT['json']:json.dump(sortie,open(OPT['json'],'w'),indent=1,ensure_ascii=False)
        if OPT['md']:ecrit_md(sortie,OPT['md'])
        return 0 if sortie['verdict']=='tenu' else 1
    finally:
        for p in (ch,srv):
            try:p.terminate();p.wait(5)
            except Exception:
                try:p.kill()
                except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
REC=r"""(function(){var R=window.__LAT={t0:performance.now(),go:null,dead:null,btn:null,pret:null,geo:[],fin:false};
 function btn(){var e=[].slice.call(document.querySelectorAll('#mDead [data-m="replay"]')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return false;var b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,h=document.elementFromPoint(x,y);return h===e||e.contains(h);}
 function vu(){var d=document.getElementById('mDead');return !!d&&d.classList.contains('on')&&d.getBoundingClientRect().width>0;}
 (function f(){var n=performance.now()-R.t0;if(R.go===null&&dbgState().gameOver)R.go=Math.round(n);if(R.dead===null&&vu())R.dead=Math.round(n);if(R.btn===null&&btn())R.btn=Math.round(n);if(R.pret===null&&typeof dbgPrebati==='function'&&dbgPrebati().etat==='pret')R.pret=Math.round(n);if(!R.fin)requestAnimationFrame(f);})();return 1;})()"""
def latences(c):
    """Mode --latence : mort (dbgBoom) → écran de mort affiché (#mDead.on) → bouton REJOUER cliquable ; N parties. Tout est mesuré DANS la page (rAF), sans profileur."""
    R=[]
    for p in range(OPT['parties']):
        if p==0:
            jouer(c)
            if not gp.attend(c,"dbgState().started&&!dbgState().gameOver",60):print('⛔ la partie ne part pas');break
        c.ev("dbgSable(0);dbgAuto(1,0,{});1");c.pump(6)
        c.ev("dbgAuto(0);1");c.ev(REC);c.ev("dbgBoom();1")
        t=time.time()
        while time.time()-t<45 and c.ev("window.__LAT.btn")is None:c.pump(.25)
        t=time.time()
        while time.time()-t<45 and c.ev("window.__LAT.pret")is None:c.pump(.25) # le pré-bâti de la partie suivante est prêt
        m=json.loads(c.ev("JSON.stringify(Object.assign({},window.__LAT,{fin:true}))"));c.ev("window.__LAT.fin=true;1")
        # REJOUER tapé : combien de temps jusqu'à la partie lancée ?
        tt=time.time();rejouer(c)
        if gp.attend(c,"dbgState().started&&!dbgState().gameOver",60):m['rejouer_a_depart_ms']=round((time.time()-tt)*1000)
        else:m['rejouer_a_depart_ms']=None
        try:m['lieu_suivant']=c.ev("(function(){var d=dbgNiveau();return d.lieu+'/'+d.ciel})()")
        except Exception:m['lieu_suivant']=None
        try:m['geo_fin']=json.loads(c.ev("JSON.stringify(typeof dbgCout==='function'?dbgCout().geo:null)"))
        except Exception:m['geo_fin']=None
        R.append(m);print('partie %d : mort→game over %s ms · mort→écran de mort affiché %s ms · mort→REJOUER cliquable %s ms · mort→pré-bâti prêt %s ms · REJOUER→partie lancée %s ms · géométries %s · lieu suivant %s'%(p+1,m['go'],m['dead'],m['btn'],m['pret'],m.get('rejouer_a_depart_ms'),m['geo_fin'],m.get('lieu_suivant')),flush=True)
        c.pump(3)
    out={'vp':OPT['vp'] or VP,'qs':OPT['qs'],'carte':OPT['carte'],'cpu':OPT['cpu'],'charge':os.getloadavg()[0],'parties':R}
    if OPT['json']:json.dump(out,open(OPT['json'],'w'),indent=1)
    return 0
def ecrit_md(s,chemin):
    L=['# Départ et mort — profil des fenêtres de 3 s (%s, CPU ×%d, charge machine %.0f)'%(s['carte'],s['cpu'],s['charge']),'','| fenêtre | pire image (ms) | images > 100 ms | programmes liés | occupé (ms) | postes principaux (inclusif ms) |','|---|---|---|---|---|---|']
    for f in s['fenetres']:
        L.append('| %s | %d | %d | %d | %d | %s |'%(f['fenetre'],f['pire_image_ms'],f['images_sup100'],f['programmes_lies'],f['total_ms']-f['idle_ms'],', '.join('%s %d'%(p,v) for p,v,_ in f['postes'] if v>=20)))
    for f in s['fenetres']:
        L+=['','## '+f['fenetre'],'','Top inclusif : '+', '.join('`%s` %d (%s)'%(k,v,l) for k,v,l in f['incl_top'][:16]),'','Top propre : '+', '.join('`%s` %d (%s)'%(k,v,l) for k,v,l in f['self_top'][:10])]
        if f['loaf']:L.append('\nLoAF : '+' ; '.join('%d ms [%s]'%(l['d'],' | '.join(l['sc'][:2])) for l in f['loaf'][:5]))
    open(chemin,'w').write('\n'.join(L)+'\n')
if __name__=='__main__':sys.exit(main())
