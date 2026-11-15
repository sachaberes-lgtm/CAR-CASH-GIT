#!/usr/bin/env python3
"""LE BANC DES GELS (2026-11-15, lot GELS — Sacha, build 117 : « quelques freezes » après un retour dans l'app, un pivot et des changements de map).

    python3 outils/banc-perf/gels.py verif        # le mouchard attribue-t-il un gel provoqué exprès (une minuterie qui bloque 120 ms) ?
    python3 outils/banc-perf/gels.py scenario     # course → page cachée 80 s (pause) → retour → deux pivots → reprise avec changements de map
    python3 outils/banc-perf/gels.py temoin       # la même chose sans arrière-plan ni pivot (une pause seulement) · pivot : sans arrière-plan · cache : caché 80 s sans gel de page, sans pivot · gele : page gelée 80 s sans les événements, sans pivot

Chrome sans fenêtre, MUET, déguisé en iPhone 13 Pro (390 × 844 ×3, `?tel=1&appareil=iPhone14,2&perfrec=2`), processeur bridé ×CPU (5 par défaut, après le menu).
Serveur sur le port 9931, Chrome sur 9932. Prendre le verrou avant (~/cash-car/verrou-banc.sh prendre « gels »), le rendre après.
« page cachée » : la page est GELÉE (Page.setWebLifecycleState frozen, comme une app en arrière-plan : plus aucune image ni minuterie), entourée des événements que
l'app reçoit (visibilitychange caché/visible avec document.hidden simulé, `pause` / `resume` de Capacitor). « pivot » : la fenêtre passe en paysage puis revient.
Il relève, avant et après : minuteries, intervalles, écouteurs (dbgMouchard), images de loop par seconde contre images d'écran, et la boîte de vol de chaque course
(lue par analyse-vol.py : la table « LES GELS : qui »). Sortie : outils/banc-perf/mesures/gels-<mode>.json.
"""
import sys,os,json,time,subprocess,urllib.request,tempfile,shutil
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
from cdp import CDP
import importlib.util as _iu
_sp=_iu.spec_from_file_location('garde_perf',os.path.join(ICI,'garde-perf.py'));_gp=_iu.module_from_spec(_sp);_sp.loader.exec_module(_gp)
chrome,tap,attend,BTN,UA=_gp.chrome,_gp.tap,_gp.attend,_gp.BTN,_gp.UA
RACINE=os.path.dirname(os.path.dirname(ICI));VP=os.path.join(RACINE,'VERSION PRINCIPALE')
HTTP,PORT=9931,9932;CPU=float(os.environ.get('CPU','5'))
SAVE={'v':2,'sfx':False,'mus':False,'vox':False,'tuto':1,'permis':1,'lang':'fr','facile':0,'q':'net','qChoisi':1,'plq':{'m':0,'x':'BANC 01','ok':1}}
CACHE=r"""(function(h){Object.defineProperty(document,'hidden',{configurable:true,get:function(){return h;}});
 Object.defineProperty(document,'visibilityState',{configurable:true,get:function(){return h?'hidden':'visible';}});
 document.dispatchEvent(new Event('visibilitychange'));if(h)document.dispatchEvent(new Event('pause'));else document.dispatchEvent(new Event('resume'));return 1;})(%s)"""
def etat(c):return c.ev("JSON.stringify(Object.assign(dbgMouchard(),{toiles:[].slice.call(document.querySelectorAll('canvas')).filter(function(v){return v.width>300}).map(function(v){return v.id+' '+v.width+'x'+v.height+' '+v.clientWidth+'x'+v.clientHeight}),dpr:(window.dbgDPR?String(JSON.stringify(dbgDPR())).slice(0,120):null)}))")
def jouer(c):
    attend(c,"dbgPrebati().etat==='pret'",60);c.pump(1);t=time.time()
    while time.time()-t<120:
        if c.ev("dbgState().started&&!dbgState().gameOver"):return True
        r=c.ev(BTN)
        if r:tap(c,r[0],r[1],.12);c.pump(3);continue
        g=c.ev("(function(){var e=document.getElementById('gJouer');if(!e)return null;var b=e.getBoundingClientRect();return b.width>0?[b.left+b.width/2,b.top+b.height/2]:null})()")
        if g:tap(c,g[0],g[1],.12);c.pump(3);continue
        r=c.ev("""(function(){var e=[].slice.call(document.querySelectorAll('#mDead [data-m="replay"]')).filter(function(x){return x.getBoundingClientRect().width>0})[0];if(!e)return null;var b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()""")
        if r:tap(c,r[0],r[1],.12);c.pump(3);continue
        if c.ev("dbgState().gameOver"):c.ev("dbgEco('rejouer');1");c.pump(4);continue # l'écran de mort sans bouton visible (banc sans fenêtre) : le REJOUER du banc
        if time.time()-t>20:tap(c,195,300);c.pump(3)
        else:c.pump(.5)
    print('état',c.ev("JSON.stringify(dbgState())")[:300]);return False
def course(c,s,cartes=()):
    c.pump(2);c.ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1")
    pas=s/(len(cartes)+1)
    c.pump(pas)
    for m in cartes:
        c.ev("dbgClassique(%s,null);dbgPortail(2600);1"%json.dumps(m));c.pump(pas)
def mort(c):
    c.ev("dbgImmortel(false);try{dbgDeathNow()}catch(e){};1");c.pump(12)
    c.pump(3)
def pivot(c,pays):
    w,h=(844,390) if pays else (390,844)
    c.call('Emulation.setDeviceMetricsOverride',width=w,height=h,deviceScaleFactor=3,mobile=True,screenWidth=w,screenHeight=h,
           screenOrientation={'type':'landscapePrimary' if pays else 'portraitPrimary','angle':90 if pays else 0})
    c.ev("dispatchEvent(new Event('orientationchange'));1")
def ouvre(c,qs):
    base='http://127.0.0.1:%d'%HTTP
    for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    pivot(c,False);c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(SAVE)))
    c.call('Page.navigate',url=base+'/index.html?garde=1&tel=1&appareil=iPhone14,2&perfrec=2&pistegraine=777'+qs)
    if not attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):sys.exit('le jeu ne démarre pas')
    c.pump(3)
def main():
    mode=(sys.argv[1:] or ['verif'])[0];R={'mode':mode,'cpu':CPU,'charge0':round(os.getloadavg()[0],1),'etapes':[]}
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(HTTP),'--bind','127.0.0.1'],cwd=VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='banc-gels-')
    ch=subprocess.Popen([chrome(),'--headless=new','--remote-debugging-port=%d'%PORT,'--user-data-dir='+prof,'--mute-audio','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for i in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%PORT,timeout=2).read();break
            except Exception:pass
        c=CDP(PORT);c.keep={'Runtime.exceptionThrown'};ouvre(c,'&carte=ville&meteo=midi')
        def note(n):e=json.loads(etat(c));e['etape']=n;e['t']=round(time.time(),1);R['etapes'].append(e);print(n,json.dumps(e,ensure_ascii=False)[:400]);sys.stdout.flush()
        note('menu')
        c.call('Emulation.setCPUThrottlingRate',rate=CPU)
        if not jouer(c):sys.exit('JOUER ne part pas')
        if mode=='verif':
            course(c,8);note('course 8 s')
            for k in range(3):c.ev("dbgMouchard('gel',120)");c.pump(3)
            c.ev("dbgMouchard('gelI',90)");c.pump(4.5)
            note('après les gels provoqués');mort(c)
        else:
            # (l'écran de mort ne rend pas la main dans Chrome sans fenêtre : la course 1 est mise en arrière-plan EN COURS, comme une app quittée, puis reprise)
            course(c,30,['nuages']);note('course 1, 30 s')
            if mode in('scenario','cache','gele'):
                if mode!='gele':c.ev(CACHE%'true')
                else:c.ev("try{window.__panBascule()}catch(e){};1") # la pause seule
                c.pump(.5)
                if mode=='cache':c.pump(80) # caché 80 s, la page tourne encore (Chrome continue les images)
                else:c.call('Page.setWebLifecycleState',state='frozen');time.sleep(80);c.call('Page.setWebLifecycleState',state='active')
                if mode!='gele':c.ev(CACHE%'false')
                c.pump(1.5);note('retour après 80 s')
            if mode in('scenario','pivot'):pivot(c,True);c.pump(2);pivot(c,False);c.pump(2);note('après deux pivots')
            if mode=='temoin':c.ev("try{window.__panBascule()}catch(e){};1");c.pump(3) # la même pause, sans arrière-plan ni pivot
            for k in range(10):
                if not c.ev("dbgState().paused"):break
                c.ev("try{window.__panBascule()}catch(e){};1");c.pump(4)
            R['reprise']=not c.ev("dbgState().paused")
            course(c,120,['grotte','jade','nuages']);note('course reprise, 120 s')
        R['etat_fin']=c.ev("JSON.stringify(dbgState())")[:200];c.ev(CACHE%'true');c.pump(.5) # la course encore ouverte se range (bvFinit sur hidden)
        R['vol']=c.ev("JSON.stringify(dbgBoiteVol('tout'))")
        R['exceptions']=[(e['params']['exceptionDetails'].get('exception',{}).get('description') or '')[:200] for e in c.events if e['method']=='Runtime.exceptionThrown']
        R['charge1']=round(os.getloadavg()[0],1)
    finally:
        for p in (ch,srv):
            try:p.terminate();p.wait(5)
            except Exception:
                try:p.kill()
                except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
    os.makedirs(os.path.join(ICI,'mesures'),exist_ok=True);out=os.path.join(ICI,'mesures','gels-%s.json'%mode)
    vol=json.loads(R.pop('vol') or '[]');json.dump(vol,open(out.replace('.json','-vol.json'),'w'),ensure_ascii=False)
    json.dump(R,open(out,'w'),indent=1,ensure_ascii=False);print('→',out,'· exceptions',len(R['exceptions']),R['exceptions'][:3])
if __name__=='__main__':main()
