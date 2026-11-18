#!/usr/bin/env python3
"""LE BANC DES TRANSITIONS (2026-11-18, lot qualité « transitions » — Sacha : « quand on relance une partie, il y a une jolie animation, mais elle pourrait être moins buggée »).

    python3 outils/banc-transitions/transitions.py [--tours 5] [--cpu 4] [--qs "&sans=transitions"] [--json f.json] [--film dossier] [--profil]
            [--seules JOUER,REJOUER,...] [--vp dossier]

Chrome sans fenêtre déguisé en iPhone 13 Pro EN PAYSAGE (844×390 ×3, tactile, `?garde=1&palier=2&tel=1&pistegraine=777&carte=nuages&meteo=midi`),
MUET (--mute-audio, sfx/mus/vox à false dans la sauvegarde), processeur ×N posé après la chauffe du menu.
Chaque tour joue les transitions dans l'ordre d'un joueur : JOUER (accueil → course), PAUSE (ouvre, ferme), PORTAIL, MORT (→ écran de fin),
REJOUER (écran de fin → course), MENU (écran de fin → accueil). Puis GARAGE et BOUTIQUE (accueil → écran → retour).
Dans la page, chaque image (rAF) est notée : instant, intervalle, classe du volet (#wipe), started/gameOver/paused ; le doigt (pointerdown) aussi.
Par transition : la pire image, le nombre d'images > 50 ms, les images du BALAYAGE (phase « in » : 150 ms, phase « out » : 280 ms) et leur pire intervalle
(le balayage est minuté : une image de 120 ms = un saut d'un tiers de l'écran), le temps appui → volet levé, appui → course.
--film : les images de la relance (Page.startScreencast) dans ce dossier, sur un tour À PART (le film coûte : jamais mesuré en même temps).
--profil : le profil (échantillon 0,5 ms) de la relance, postes par fonction.
Sortie : un résumé par transition (médiane des tours, pire), JSON complet avec --json.
"""
import sys,os,json,time,subprocess,tempfile,shutil,importlib.util,urllib.request,base64,statistics,collections
ICI=os.path.dirname(os.path.abspath(__file__));RACINE=os.path.dirname(os.path.dirname(ICI));BP=os.path.join(RACINE,'outils','banc-perf')
sys.path.insert(0,BP)
from cdp import CDP
sp=importlib.util.spec_from_file_location('gp',os.path.join(BP,'garde-perf.py'));gp=importlib.util.module_from_spec(sp);sp.loader.exec_module(gp)
VP=os.path.join(RACINE,'VERSION PRINCIPALE')
OPT={'tours':5,'cpu':4,'qs':'','json':None,'film':None,'profil':0,'seules':None,'vp':None,'carte':'nuages:midi'}
W,H=844,390
HOOK=r"""(function(){
 var T=window.__T={F:[],E:[],on:false,t0:performance.now(),loaf:[]};
 var l=performance.now(),wc='',st='';
 function etat(){try{var d=dbgState();return (d.started?'S':'s')+(d.gameOver?'G':'g')+(d.paused?'P':'p');}catch(e){return '?';}}
 function f(t){var d=t-l;l=t;if(T.on){var w=document.getElementById('wipe'),c=w?w.className:'';var e=etat();
   T.F.push([+(t).toFixed(1),+d.toFixed(1),c.indexOf('out')>=0?'o':c.indexOf('in')>=0?'i':'-']);
   if(e!==st){T.E.push([+t.toFixed(1),'etat',e]);st=e;}}
  requestAnimationFrame(f);}requestAnimationFrame(f);
 addEventListener('pointerdown',function(e){if(!T.on)return;var x=e.target&&e.target.closest&&e.target.closest('[data-m]');T.E.push([+performance.now().toFixed(1),'doigt',x?x.getAttribute('data-m'):'?']);},{capture:true});
 addEventListener('keydown',function(e){if(T.on)T.E.push([+performance.now().toFixed(1),'touche',e.key]);},{capture:true});
 document.addEventListener('DOMContentLoaded',function(){
  var mo=new MutationObserver(function(L){if(!T.on)return;L.forEach(function(m){var w=m.target;if(w.id==='wipe')T.E.push([+performance.now().toFixed(1),'volet',w.className]);else if(w.id==='voileSerpent')T.E.push([+performance.now().toFixed(1),'serpent',w.className]);});});
  var arme=function(){var w=document.getElementById('wipe');if(w&&!w.__vu){w.__vu=1;mo.observe(w,{attributes:true,attributeFilter:['class']});}var v=document.getElementById('voileSerpent');if(v&&!v.__vu){v.__vu=1;mo.observe(v,{attributes:true,attributeFilter:['class']});}};
  setInterval(arme,200);});
 try{new PerformanceObserver(function(L){L.getEntries().forEach(function(e){if(!T.on||e.duration<50)return;T.loaf.push({t:+e.startTime.toFixed(1),d:Math.round(e.duration),bl:Math.round(e.blockingDuration||0),
  sc:(e.scripts||[]).filter(function(s){return s.duration>8;}).map(function(s){return (s.invoker||'')+' '+(s.sourceFunctionName||'')+' '+Math.round(s.duration)+'ms forcé '+Math.round(s.forcedStyleAndLayoutDuration||0);}),
  rendu:Math.round((e.renderStart&&e.styleAndLayoutStart)?(e.styleAndLayoutStart-e.renderStart):0),style:Math.round(e.styleAndLayoutStart?(e.startTime+e.duration-e.styleAndLayoutStart):0)});});}).observe({type:'long-animation-frame',buffered:false});}catch(e){}
})();"""
VIS=r"""(function(sel){var e=[].slice.call(document.querySelectorAll(sel)).filter(function(x){var b=x.getBoundingClientRect();return b.width>0&&b.height>0})[0];if(!e)return null;var b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,h=document.elementFromPoint(x,y);return (h===e||e.contains(h))?[x,y]:null})(%s)"""
def vis(c,sel):return c.ev(VIS%json.dumps(sel))
def tape(c,sel,tmax=30):
    t=time.time()
    while time.time()-t<tmax:
        r=vis(c,sel)
        if r:gp.tap(c,r[0],r[1],.1);return True
        c.pump(.3)
    return False
def ouvre(c,lab):
    c.ev("__T.F.length=0;__T.E.length=0;__T.loaf.length=0;__T.on=true;__T.lab=%s;1"%json.dumps(lab))
    return c.ev("performance.now()")
def ferme(c):
    d=json.loads(c.ev("__T.on=false;JSON.stringify({F:__T.F,E:__T.E,loaf:__T.loaf})"));return d
def attend(c,js,tmax):return gp.attend(c,js,tmax)
EN_COURSE="(function(){var d=dbgState();return d.started&&!d.gameOver&&!d.paused})()"
VOLET_LIBRE="(function(){var w=document.getElementById('wipe');return !w||w.className===''})()"
def bilan(nom,t0,D,fin_js_t=None):
    F=D['F'];E=D['E']
    F=[f for f in F if f[0]>=t0]
    # les phases du volet (posées par ecranWipe : 'in' puis 'out' puis '')
    vin=next((e[0] for e in E if e[1]=='volet' and 'in' in e[2].split()),None)
    vout=next((e[0] for e in E if e[1]=='volet' and 'out' in e[2].split()),None)
    vfin=next((e[0] for e in E if e[1]=='volet' and e[2]=='' and vout and e[0]>vout),None)
    doigt=next((e[0] for e in E if e[1] in('doigt','touche')),t0)
    go=next((e[0] for e in E if e[1]=='etat' and e[2].startswith('Sg') and e[0]>=doigt),None)
    ser=[e for e in E if e[1]=='serpent']
    dts=[f[1] for f in F[1:]]
    def phase(a,b):
        if a is None:return None
        L=[f[1] for f in F if a<f[0]<=(b if b else a+300)]
        return {'images':len(L),'pire':round(max(L or [0])),'sup50':sum(1 for x in L if x>50)}
    r={'transition':nom,'images':len(dts),'pire':round(max(dts or [0])),'sup50':sum(1 for x in dts if x>50),'sup100':sum(1 for x in dts if x>100),
       'volet_in':phase(vin,vin+160) if vin else None,'volet_couvert':phase(vin+160,vout) if vin and vout else None,'volet_out':phase(vout,vout+290) if vout else None,
       'appui_a_leve_ms':round(vout-doigt) if vout else None,'appui_a_course_ms':round(go-doigt) if go else None,'serpent':bool(ser),
       'lentes':[[round(f[0]-doigt),round(f[1]),f[2]] for f in F if f[1]>50][:30],
       'loaf':[dict(l,t=round(l['t']-doigt)) for l in D['loaf'] if l['t']>=t0-50][:12]}
    return r
def montre(r):
    ph=lambda p:('%d img, pire %d'%(p['images'],p['pire'])) if p else '—'
    print('  %-14s pire %4d ms · >50 : %2d · >100 : %2d · in [%s] · out [%s] · appui→levé %s · appui→course %s%s'%(r['transition'],r['pire'],r['sup50'],r['sup100'],ph(r['volet_in']),ph(r['volet_out']),r['appui_a_leve_ms'],r['appui_a_course_ms'],' · serpent' if r['serpent'] else ''),flush=True)
class Film:
    def __init__(s,c,dossier):s.c=c;s.d=dossier;s.n=0;os.makedirs(dossier,exist_ok=True);s.meta=[]
    def start(s):
        s.c.keep.add('Page.screencastFrame');s.c.events=[e for e in s.c.events if e.get('method')!='Page.screencastFrame']
        s.c.call('Page.startScreencast',format='jpeg',quality=60,maxWidth=W,maxHeight=H,everyNthFrame=1)
    def pompe(s,sec):
        fin=time.time()+sec
        while time.time()<fin:
            s.c.pump(.03)
            ev=[e for e in s.c.events if e.get('method')=='Page.screencastFrame'];s.c.events=[e for e in s.c.events if e.get('method')!='Page.screencastFrame']
            for e in ev:
                p=e['params'];s.n+=1;f=os.path.join(s.d,'%03d.jpg'%s.n);open(f,'wb').write(base64.b64decode(p['data']))
                s.meta.append({'n':s.n,'ts':p['metadata'].get('timestamp')})
                try:s.c.call('Page.screencastFrameAck',sessionId=p['sessionId'])
                except Exception:pass
    def stop(s):
        try:s.c.call('Page.stopScreencast')
        except Exception:pass
        json.dump(s.meta,open(os.path.join(s.d,'images.json'),'w'))
def demarre(http,port):
    base='http://127.0.0.1:%d'%http
    c=CDP(port);c.keep={'Runtime.exceptionThrown'}
    for m in ('Network.enable','Page.enable','Runtime.enable','Profiler.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    c.call('Emulation.setDeviceMetricsOverride',width=W,height=H,deviceScaleFactor=3,mobile=True,screenWidth=W,screenHeight=H,screenOrientation={'type':'landscapePrimary','angle':90})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    sv=dict(gp.SAVE,sfx=False,vox=False,mus=False)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(sv)))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=HOOK)
    A=OPT['carte'].split(':')
    c.call('Page.navigate',url=base+'/index.html?garde=1&palier=2&tel=1&pistegraine=777&carte=%s&meteo=%s%s'%(A[0],A[1],OPT['qs']))
    if not attend(c,"!!window.__gameReady&&typeof dbgState==='function'",300):print('⛔ le jeu ne démarre pas');return None
    t=time.time()
    while time.time()-t<180 and not c.ev(gp.BTN):
        if c.ev("!!window.__intro"):gp.tap(c,W/2,H*.6);c.pump(4)
        else:c.pump(1)
    attend(c,"dbgPrebati().etat==='pret'",150)
    t=time.time()
    while time.time()-t<150:
        d=json.loads(c.ev("JSON.stringify(typeof dbgChauffe==='function'?dbgChauffe():{})") or '{}')
        if d.get('rendu'):break
        c.pump(3)
    print('menu prêt · chauffe',c.ev("JSON.stringify(dbgChauffe())"),flush=True)
    c.pump(2);return c
def profile(c,fn):
    c.call('Profiler.setSamplingInterval',interval=500);c.call('Profiler.start')
    fn()
    p=c.call('Profiler.stop')['profile']
    nodes={n['id']:n for n in p['nodes']};par={}
    for n in p['nodes']:
        for ch in n.get('children',[]):par[ch]=n['id']
    inc=collections.Counter();slf=collections.Counter();lieu={}
    for i,sid in enumerate(p['samples']):
        dt=p['timeDeltas'][i]/1000.0;n=nodes[sid];nm=n['callFrame']['functionName'] or '(anonyme)';slf[nm]+=dt;lieu.setdefault(nm,n['callFrame']['lineNumber']+1)
        vu=set();x=sid
        while x is not None:
            g=nodes[x]['callFrame']['functionName'] or '(anonyme)'
            if g not in vu:vu.add(g);inc[g]+=dt
            x=par.get(x)
    return {'inclusif':[(k,round(v)) for k,v in inc.most_common(45) if k not in('(root)','(idle)','(program)')][:35],'propre':[(k,round(v)) for k,v in slf.most_common(20)]}
def tour(c,k,R,film=None):
    S=OPT['seules']
    def veut(n):return not S or n in S
    def mesure(nom,action,fin_js,apres=0.6,tmax=40):
        t0=ouvre(c,nom)
        if film:film.start()
        action()
        t=time.time()
        while time.time()-t<tmax:
            if c.ev(fin_js) is True:break
            (film.pompe if film else c.pump)(.1)
        (film.pompe if film else c.pump)(apres)
        if film:film.stop()
        r=bilan(nom,t0,ferme(c));r['tour']=k;R.append(r);montre(r);return r
    # JOUER depuis l'accueil
    if not vis(c,'.mPlay'):attend(c,"!!(%s)"%(VIS%json.dumps('.mPlay')),40)
    mesure('JOUER',lambda:tape(c,'.mPlay'),"(%s)&&(%s)"%(EN_COURSE,VOLET_LIBRE),apres=1.0,tmax=60)
    c.ev("dbgSable(0);dbgAuto(1,0,{});1");c.pump(3)
    if veut('PAUSE'):
        def P():
            c.call('Input.dispatchKeyEvent',type='keyDown',key='p',code='KeyP',windowsVirtualKeyCode=80);c.call('Input.dispatchKeyEvent',type='keyUp',key='p',code='KeyP',windowsVirtualKeyCode=80)
        mesure('PAUSE ouvre',P,"dbgState().paused",apres=1.0,tmax=5)
        mesure('PAUSE ferme',P,EN_COURSE,apres=1.5,tmax=8)
        c.pump(1)
    if veut('PORTAIL'):
        lieu0=c.ev("(function(){try{var d=dbgNiveau();return d.lieu+'/'+d.ciel}catch(e){return ''}})()")
        mesure('PORTAIL',lambda:c.ev("dbgPortail(260);1"),"(function(){try{var d=dbgNiveau();return d.lieu+'/'+d.ciel!==%s}catch(e){return false}})()"%json.dumps(lieu0),apres=2.0,tmax=25)
        c.pump(1)
    c.ev("dbgAuto(0);1")
    mesure('MORT',lambda:c.ev("dbgBoom();1"),"(function(){var d=document.getElementById('mDead');return !!d&&d.classList.contains('on')})()",apres=1.0,tmax=30)
    attend(c,"!!(%s)"%(VIS%json.dumps('#mDead [data-m="replay"]')),40);c.pump(2.5)
    mesure('REJOUER',lambda:tape(c,'#mDead [data-m="replay"]'),"(%s)&&(%s)"%(EN_COURSE,VOLET_LIBRE),apres=1.0,tmax=40)
    c.ev("dbgSable(0);dbgAuto(1,0,{});1");c.pump(3);c.ev("dbgAuto(0);dbgBoom();1")
    attend(c,"!!(%s)"%(VIS%json.dumps('#mDead [data-m="menu"]')),40);c.pump(2.5)
    mesure('MENU',lambda:tape(c,'#mDead [data-m="menu"]'),"(%s)&&!!(%s)"%(VOLET_LIBRE,VIS%json.dumps('.mPlay')),apres=0.8,tmax=30)
def main():
    import signal
    signal.signal(signal.SIGTERM,lambda *a:sys.exit(3)) # timeout / kill : le finally tue quand même le groupe de MON Chrome
    av=sys.argv[1:];i=0
    while i<len(av):
        a=av[i]
        if a in('--qs','--json','--film','--vp','--carte'):OPT[a[2:]]=av[i+1];i+=2
        elif a in('--tours','--cpu'):OPT[a[2:]]=int(av[i+1]);i+=2
        elif a=='--seules':OPT['seules']=set(av[i+1].split(','));i+=2
        elif a=='--profil':OPT['profil']=1;i+=1
        else:i+=1
    http=gp.libre();port=gp.libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=OPT['vp'] or VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    prof=tempfile.mkdtemp(prefix='banc-transitions-')
    ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','--window-size=%d,%d'%(W,H),'about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    open(os.path.join(prof,'..','banc-transitions-pgid-%d'%os.getpid()),'w').write(str(ch.pid))
    R=[];out={'date':time.strftime('%Y-%m-%d %H:%M'),'qs':OPT['qs'],'cpu':OPT['cpu'],'charge0':os.getloadavg()[0],'mesures':R}
    try:
        for _ in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
            except Exception:pass
        else:sys.exit('Chrome ne répond pas')
        c=demarre(http,port)
        if not c:return 2
        c.call('Emulation.setCPUThrottlingRate',rate=OPT['cpu']);c.pump(2)
        if OPT['film']:
            # un tour à part : le film de JOUER et de REJOUER (pas de chiffres retenus)
            print('— film —')
            fr=[];
            def filme(nom,act,fin):
                f=Film(c,os.path.join(OPT['film'],nom));t0=ouvre(c,nom);f.start();act();t=time.time()
                while time.time()-t<40:
                    if c.ev(fin) is True:break
                    f.pompe(.1)
                f.pompe(1.0);f.stop();r=bilan(nom,t0,ferme(c));montre(r);json.dump(r,open(os.path.join(OPT['film'],nom,'bilan.json'),'w'),indent=1)
            filme('JOUER',lambda:tape(c,'.mPlay'),"(%s)&&(%s)"%(EN_COURSE,VOLET_LIBRE))
            c.ev("dbgSable(0);dbgAuto(1,0,{});1");c.pump(3);c.ev("dbgAuto(0);dbgBoom();1")
            attend(c,"!!(%s)"%(VIS%json.dumps('#mDead [data-m="replay"]')),40);c.pump(2.5)
            filme('REJOUER',lambda:tape(c,'#mDead [data-m="replay"]'),"(%s)&&(%s)"%(EN_COURSE,VOLET_LIBRE))
            return 0
        if OPT['profil']:
            tape(c,'.mPlay');attend(c,EN_COURSE,60);c.pump(1);c.ev("dbgSable(0);dbgAuto(1,0,{});1");c.pump(3);c.ev("dbgAuto(0);dbgBoom();1")
            attend(c,"!!(%s)"%(VIS%json.dumps('#mDead [data-m="replay"]')),40);c.pump(2.5)
            t0=ouvre(c,'REJOUER')
            def fn():
                tape(c,'#mDead [data-m="replay"]');attend(c,"(%s)&&(%s)"%(EN_COURSE,VOLET_LIBRE),40);c.pump(1)
            P=profile(c,fn);r=bilan('REJOUER',t0,ferme(c));montre(r);r['profil']=P;R.append(r)
            print('  inclusif :',', '.join('%s %d'%x for x in P['inclusif'][:30]));print('  propre :',', '.join('%s %d'%x for x in P['propre'][:14]))
        else:
            for k in range(OPT['tours']):
                print('— tour %d —'%(k+1),flush=True);tour(c,k,R)
        out['charge1']=os.getloadavg()[0]
        out['erreurs']=c.ev("JSON.stringify({l:window.__loopErr?String(window.__loopErr).slice(0,300):null,p:window.__prebErr?String(window.__prebErr).slice(0,300):null})")
        # résumé
        print('\n== RÉSUMÉ (%s, CPU ×%d, charge %.0f → %.0f) =='%(OPT['qs'] or 'défaut',OPT['cpu'],out['charge0'],out['charge1']))
        par=collections.OrderedDict()
        for r in R:par.setdefault(r['transition'],[]).append(r)
        out['resume']={}
        for n,L in par.items():
            med=lambda k:statistics.median([x[k] for x in L if x.get(k) is not None] or [0])
            o=lambda ph,k:[x[ph][k] for x in L if x.get(ph)]
            s={'n':len(L),'pire_max':max(x['pire'] for x in L),'pire_med':med('pire'),'sup50_med':med('sup50'),'sup50_tot':sum(x['sup50'] for x in L),
               'out_pire':o('volet_out','pire'),'out_images':o('volet_out','images'),'in_pire':o('volet_in','pire'),'leve_ms':[x['appui_a_leve_ms'] for x in L],'course_ms':[x['appui_a_course_ms'] for x in L]}
            out['resume'][n]=s
            print('  %-12s n=%d · pire max %d / méd %d · >50 méd %s (total %d) · out pire %s · out images %s · in pire %s · appui→levé %s · appui→course %s'%(n,s['n'],s['pire_max'],s['pire_med'],s['sup50_med'],s['sup50_tot'],s['out_pire'],s['out_images'],s['in_pire'],s['leve_ms'],s['course_ms']))
        print('erreurs :',out['erreurs'])
        return 0
    finally:
        if OPT['json']:json.dump(out,open(OPT['json'],'w'),indent=1,ensure_ascii=False)
        for p in (ch,srv):
            try:os.killpg(p.pid,15)
            except Exception:pass
        time.sleep(1)
        for p in (ch,srv):
            try:os.killpg(p.pid,9)
            except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
if __name__=='__main__':sys.exit(main())
