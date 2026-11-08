#!/usr/bin/env python3
"""P2 — L'IMAGE ADAPTÉE SUR TÉLÉPHONE RÉCENT (2026-11-07, passe perf 3). Mesure GPU + capture, un Chrome par (map, variante).
    python3 outils/banc-perf/p2-image.py --tag avant --maps nuages:midi,ville:pluie [--qs '&img=max'] [--ordi] [--cpu 4] [--sortie dossier]
iPhone 13 Pro émulé (390×844 ×3, tactile → TEL_NATIF vrai), `?garde=1&palier=2&pistegraine=777`, JOUER, échelle QL figée (dbgPin) à son cran de départ,
caisse posée à 1 800 m (dbgPortail) puis 80 m de route : 6 s de `dbgCout()` (gpu p50/p90 de la puce, passes, toile, ombre, halo) + une capture à l'instant fixe.
--vp <dossier> : servir ce dossier (ex. l'index d'origin/main pour l'AVANT du pixel) · --ordi : pas d'émulation tactile (TEL_NATIF faux), fenêtre 844×390 ×2 : l'ordinateur jouant la version téléphone (?tel=1), souris. Sortie JSON sur stdout.
Un seul banc à la fois : sh ~/cash-car/verrou-banc.sh prendre "P2" … rendre."""
import sys,os,json,time,subprocess,tempfile,shutil,urllib.request,importlib.util,base64
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
spec=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(spec);spec.loader.exec_module(gp)
from cdp import CDP
def arg(n,d=None):
    a=sys.argv
    return a[a.index(n)+1] if n in a else d
def souris(c,x,y):
    for t in ('mousePressed','mouseReleased'):
        c.call('Input.dispatchMouseEvent',type=t,x=x,y=y,button='left',clickCount=1);c.pump(.08)
def run(http,port,carte,qs,ordi,cpu,dossier,tag,regle=None):
    base='http://127.0.0.1:%d'%http
    c=CDP(port);c.keep={'Runtime.exceptionThrown'}
    for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    if ordi:
        W,H,D=844,390,2
        c.call('Emulation.setDeviceMetricsOverride',width=W,height=H,deviceScaleFactor=D,mobile=False)
    else:
        W,H,D=390,844,3
        c.call('Emulation.setDeviceMetricsOverride',width=W,height=H,deviceScaleFactor=D,mobile=True,screenWidth=W,screenHeight=H,screenOrientation={'type':'portraitPrimary','angle':0})
        c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(gp.SAVE)))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=gp.HOOK)
    if '--gltex' in sys.argv:c.call('Page.addScriptToEvaluateOnNewDocument',source="(function(){var L=window.__TX=[];var P=WebGL2RenderingContext.prototype;\nfunction note(k,w,h,f,lv){if(w>=512||h>=512){var st=(new Error().stack||'').split('\\n').slice(2,6).map(function(x){return x.replace(/^\\s*at /,'').replace(/https?:\\/\\/[^ )]*\\//,'').slice(0,70)}).join(' < ');L.push([k,w,h,f,lv|0,st]);}}\nvar o1=P.texStorage2D;P.texStorage2D=function(t,lv,f,w,h){note('storage',w,h,f,lv);return o1.apply(this,arguments)};\nvar o2=P.texImage2D;P.texImage2D=function(){var a=arguments;if(a.length>=9&&a[1]===0)note('image',a[3],a[4],a[2],0);else if(a.length===6&&a[1]===0&&a[5]&&a[5].width&&a[0]!==undefined)note('image6',a[5].width,a[5].height,a[2],0);return o2.apply(this,arguments)};\n})();")
    c.call('Page.navigate',url=base+'/index.html?garde=1&palier=2%s&pistegraine=777&carte=%s&meteo=%s%s'%('&tel=1' if ordi else '',carte[0],carte[1] if len(carte)>1 else 'midi',qs))
    if not gp.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):return {'err':'ne démarre pas','exc':[(e['params']['exceptionDetails'].get('exception',{}).get('description') or e['params']['exceptionDetails'].get('text') or '')[:300] for e in c.events if e['method']=='Runtime.exceptionThrown']}
    def clic(x,y,h=.12):
        if ordi:souris(c,x,y)
        else:gp.tap(c,x,y,h)
    if not gp.attend(c,"(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];return !!e})()",90):
        t=time.time()
        while time.time()-t<60 and not c.ev(gp.BTN):clic(W//2,H//3);c.pump(.8)
    if cpu>1:c.call('Emulation.setCPUThrottlingRate',rate=cpu)
    gp.attend(c,"dbgPrebati().etat==='pret'",60);c.pump(1)
    t=time.time();ok=False
    while time.time()-t<90 and not ok:
        r=c.ev(gp.BTN)
        if r:clic(r[0],r[1]);ok=True
        else:
            g=c.ev("(function(){var e=document.getElementById('gJouer');if(!e)return null;var b=e.getBoundingClientRect();return b.width>0?[b.left+b.width/2,b.top+b.height/2]:null})()")
            if g:clic(g[0],g[1]);ok=True
            elif time.time()-t>25:clic(W//2,H//3);c.pump(3)
            else:c.pump(.5)
    if not gp.attend(c,"dbgState().started&&!dbgState().gameOver",60):return {'err':'JOUER ne part pas'}
    c.pump(2);c.ev("dbgSable(1);dbgPin(true);dbgAuto(1,0,{});1")
    pos=c.ev("dbgPortail(1800)");s0=pos.get('s',0) if isinstance(pos,dict) else 0
    t=time.time()
    while time.time()-t<60 and (c.ev("dbgEco().s") or 0)<s0+80:c.pump(.05)
    if '--gouv' in sys.argv: # le gouverneur de paliers piloté par dbgGouv(dose) : 0 → 70 → 110 → 150 → 70 ; par étape : images > 100 ms, pire image, allocations GL (textures, renderbuffers, pixels, toile redimensionnée), programmes compilés
        c.ev("""(function(){var G=window.__G={tex:0,texPx:0,rb:0,rbPx:0,cw:0};var P=WebGL2RenderingContext.prototype;
          ['texStorage2D'].forEach(function(n){var o=P[n];P[n]=function(t,l,f,w,h){G.tex++;G.texPx+=w*h;return o.apply(this,arguments)}});
          var t2=P.texImage2D;P.texImage2D=function(){if(arguments.length>=9&&arguments[8]!==undefined&&arguments[8]===null||arguments.length===9&&arguments[8]===null){G.tex++;G.texPx+=arguments[3]*arguments[4]}return t2.apply(this,arguments)};
          var r1=P.renderbufferStorage;P.renderbufferStorage=function(t,f,w,h){G.rb++;G.rbPx+=w*h;return r1.apply(this,arguments)};
          var r2=P.renderbufferStorageMultisample;P.renderbufferStorageMultisample=function(t,s,f,w,h){G.rb++;G.rbPx+=w*h*s;return r2.apply(this,arguments)};
          var d=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,'width');Object.defineProperty(HTMLCanvasElement.prototype,'width',{get:d.get,set:function(v){G.cw++;return d.set.call(this,v)},configurable:true});return 1})()""")
        res=[];dose0=[0,70,110,150,70]
        for dose in dose0:
            c.ev("window.__F.length=0;window.__Fon=true;1");g0=json.loads(c.ev("JSON.stringify(window.__G)"));lk=c.ev('window.__LK')
            t0=time.time();c.ev('dbgGouv(%d)'%dose);c.pump(float(arg('--tenue','12')))
            F=json.loads(c.ev("JSON.stringify(window.__F)"));c.ev("window.__Fon=false;1");g1=json.loads(c.ev("JSON.stringify(window.__G)"))
            st=c.ev("JSON.stringify({p:typeof dbgGouvPaliers==='function'?dbgGouvPaliers():null,img:imgRegle()})")
            F=F[1:] or [0]
            res.append({'dose':dose,'images>100ms':sum(1 for x in F if x>100),'pire_ms':round(max(F)),'allocs_tex':g1['tex']-g0['tex'],'px_tex':g1['texPx']-g0['texPx'],'allocs_rb':g1['rb']-g0['rb'],'px_rb':g1['rbPx']-g0['rbPx'],'toile_redim':g1['cw']-g0['cw'],'compilations':c.ev('window.__LK')-lk,'etat':json.loads(st)})
        return {'gouv':res,'cout':{'gpu':None}}
    if '--bascule' in sys.argv: # le coût de CHAQUE réglage à chaud, dans les deux sens : durée de l'appel + pire image dans la seconde qui suit + programmes compilés
        B=[('halo demi',{'halo':'demi'},{'halo':'tout'}),('mips 3',{'mips':3},{'mips':4}),('ombre 768',{'ombre':768},{'ombre':1024}),('ombre 512',{'ombre':512},{'ombre':1024}),('dpr 1,25',{'dpr':1.25},{'dpr':1.5}),('dpr 1',{'dpr':1},{'dpr':1.25}),('ciel 1/2',{'ciel':2},{'ciel':0}),('stries .5',{'stries':.5},{'stries':None})]
        res=[]
        for nom,a,b in B:
            for sens,o in (('baisse',a),('remonte',b)):
                c.ev("window.__F.length=0;window.__Fon=true;1");lk=c.ev('window.__LK')
                ms=c.ev('(function(){var t=performance.now();imgRegle(%s);return performance.now()-t})()'%json.dumps(o));c.pump(1.2)
                F=json.loads(c.ev("JSON.stringify(window.__F)"));c.ev("window.__Fon=false;1")
                res.append({'reglage':nom,'sens':sens,'appel_ms':round(ms,1),'pire_image_ms':round(max(F[1:] or [0])),'compilations':c.ev('window.__LK')-lk})
        return {'bascule':res,'cout':{'gpu':None}}
    if '--js' in sys.argv: # --js "<expression>" : évalue dans la page, en course, et rend le résultat (sonde)
        return {'js':c.ev('JSON.stringify('+arg('--js')+')'),'cout':{'gpu':None}}
    lk0=c.ev('window.__LK');rg=None
    def cliche():
        if not dossier:return
        os.makedirs(dossier,exist_ok=True)
        d=c.call('Page.captureScreenshot',format='jpeg',quality=88)['data']
        open(os.path.join(dossier,'%s-%s-%s.jpg'%(tag,carte[0],carte[1] if len(carte)>1 else 'midi')),'wb').write(base64.b64decode(d))
    if '--tot' in sys.argv:cliche() # --tot : la capture est prise À L'INSTANT (caisse à 80 m du portail posé), avant les 7 s de mesure : même position de route d'une variante à l'autre
    if regle:rg=c.ev('JSON.stringify(imgRegle(%s))'%regle);c.pump(1.5)
    c.ev("dbgCout(1);1");c.pump(7)
    R=json.loads(c.ev("JSON.stringify({cout:dbgCout(),img:dbgImg(),pal:dbgPalier().n,nette:dbgNette(),perf:dbgPerf(),lk:window.__LK,txMo:(window.__TX?Math.round(window.__TX.reduce(function(a,x){return a+(x[0]==='image6'?x[1]*x[2]*4*1.33:0)},0)/1e5)/10:null),rg:(typeof imgRegle==='function'?imgRegle():null)})"));R['lk0']=lk0;R['lib']=c.ev("(function(){var m=(document.body.innerText||'').match(/[A-ZÉ' ]+ — [A-ZÉ]+/);return m?m[0]:null})()");R['regle']=rg
    if dossier and '--tot' not in sys.argv:
        c.ev("dbgCout(0);1");cliche()
    for e in c.events:
        if e['method']=='Runtime.exceptionThrown':R.setdefault('exc',[]).append((e['params']['exceptionDetails'].get('exception',{}).get('description') or '')[:160])
    return R
def main():
    maps=[m.split(':') for m in arg('--maps','nuages:midi,ville:pluie,foret:midi,dunes:midi').split(',')]
    qs=arg('--qs','');ordi='--ordi' in sys.argv;cpu=int(arg('--cpu','4'));dossier=arg('--sortie');tag=arg('--tag','x')
    http=gp.libre();srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=arg('--vp',gp.VP),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    out=[]
    try:
        for m in maps:
            prof=tempfile.mkdtemp(prefix='p2-');pt=gp.libre()
            ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%pt,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                for i in range(400):
                    time.sleep(.5)
                    try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%pt,timeout=2).read();break
                    except Exception:pass
                R=run(http,pt,m,qs,ordi,cpu,dossier,tag,arg('--regle'))
            finally:
                ch.terminate()
                try:ch.wait(5)
                except Exception:ch.kill()
                shutil.rmtree(prof,ignore_errors=True)
            if 'gouv' in R:
                for x in R['gouv']:print({k:v for k,v in x.items() if k!='etat'},'palier',((x['etat'].get('p') or {}).get('palier')),'etat',x['etat'].get('img'),flush=True)
            if 'js' in R:print(R['js'][:6000],flush=True)
            if 'bascule' in R:
                for x in R['bascule']:print(x)
            R['map']=':'.join(m);R['tag']=tag;R['qs']=qs;R['charge']=round(os.getloadavg()[0],1)
            out.append(R)
            k=R.get('cout') or {}
            g=k.get('gpu') or {}
            print('%-12s %-8s gpu p50 %s p90 %s | appels %s tri %s | passes %s px %s ombre %s bloom %s | tel %s | tex>=512 Mo %s'%(tag,':'.join(m),g.get('p50'),g.get('p90'),(k.get('image') or {}).get('calls'),(k.get('image') or {}).get('tris'),k.get('passes'),k.get('px'),k.get('ombre'),k.get('bloom'),(R.get('img') or {}).get('telNatif'),R.get('txMo')),flush=True)
        f=arg('--json')
        if f:json.dump(out,open(f,'w'),indent=1)
    finally:srv.terminate()
if __name__=='__main__':main()
