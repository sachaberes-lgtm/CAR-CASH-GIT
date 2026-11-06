#!/usr/bin/env python3
"""LES PASSES ET LECTURES DE LA PUCE PAR IMAGE (2026-11-05, passe perf mobile 2, C4).
    python3 outils/banc-perf/passes.py [palier,palier] [carte:météo …] [-- ?paramètres_url_en_plus]
Piège bindFramebuffer / readPixels / getBufferSubData / fenceSync / clientWaitSync AVANT la page ; compte, par image en course (5 s, processeur ×4),
les passes (framebuffers distincts liés par image, toile comprise) et les lectures synchrones, avec la pile du 1er appelant de chaque lecture.
Un seul banc à la fois : sh ~/cash-car/verrou-banc.sh prendre "C4" … rendre."""
import sys,os,json,time,subprocess,socket,urllib.request,tempfile,shutil,importlib.util
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
spec=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(spec);spec.loader.exec_module(gp)
from cdp import CDP
HOOK=r"""(function(){var P=WebGL2RenderingContext.prototype,ids=new WeakMap(),n=0;function id(f){if(!f)return 'T';if(!ids.has(f))ids.set(f,'F'+(++n));return ids.get(f);}
 window.__P={on:false,fr:0,fbs:[],cur:[],lect:{},seq:[]};var Q=window.__P;
 function wrap(nom,lecture){var o=P[nom];P[nom]=function(){if(Q.on){if(lecture){var k=nom;var st=(new Error()).stack.split('\n').slice(2,5).map(function(s){return s.replace(/^\s*at /,'').replace(/https?:\/\/[^\/]+\//,'').slice(0,90)}).join(' < ');var L=Q.lect[k+' @ '+st]||(Q.lect[k+' @ '+st]=0);Q.lect[k+' @ '+st]=L+1;Q.cur.push(nom);}}
   return o.apply(this,arguments);};}
 var bf=P.bindFramebuffer;P.bindFramebuffer=function(t,f){if(Q.on){var i=id(f);if(Q.cur.length==0||Q.cur[Q.cur.length-1]!=='B:'+i)Q.cur.push('B:'+i);}return bf.call(this,t,f);};
 ['readPixels','getBufferSubData','fenceSync','clientWaitSync'].forEach(function(x){wrap(x,true)});
 function f(){if(Q.on){Q.fr++;Q.seq.push(Q.cur);}Q.cur=[];requestAnimationFrame(f);}requestAnimationFrame(f);})();"""
def run(http,port,palier,carte,extra):
    base='http://127.0.0.1:%d'%http
    c=CDP(port);c.keep={'Runtime.exceptionThrown'}
    for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(gp.SAVE)))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=HOOK)
    A=carte
    c.call('Page.navigate',url=base+'/index.html?garde=1&tel=1&palier=%d&pistegraine=777&carte=%s&meteo=%s%s'%(palier,A[0],A[1] if len(A)>1 else 'midi',extra))
    if not gp.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):return {'err':'ne démarre pas'}
    if not gp.attend(c,"(function(){var e=[].slice.call(document.querySelectorAll('.mPlay')).filter(function(x){return x.getBoundingClientRect().width>0})[0];return !!e})()",90):
        t=time.time()
        while time.time()-t<60 and not c.ev(gp.BTN):gp.tap(c,195,300);c.pump(.8)
    c.call('Emulation.setCPUThrottlingRate',rate=4)
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
    if not gp.attend(c,"dbgState().started&&!dbgState().gameOver",60):return {'err':'JOUER ne part pas'}
    c.pump(2);c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{});1");c.pump(3)
    c.ev("window.__P.on=true;window.__P.fr=0;window.__P.seq=[];window.__P.lect={};1");c.pump(5);c.ev("window.__P.on=false;1")
    R=json.loads(c.ev("JSON.stringify({fr:__P.fr,seq:__P.seq,lect:__P.lect,cout:dbgCout(),pal:dbgPalier()})"))
    return R
def main():
    a=[x for x in sys.argv[1:]]
    extra=''
    if '--' in a:i=a.index('--');extra=a[i+1];a=a[:i]
    pal=[int(x) for x in (a[0] if a and a[0][0].isdigit() and ':' not in a[0] else '0,2').split(',')]
    maps=[x.split(':') for x in a if ':' in x] or [['nuages','midi'],['ville','pluie'],['foret','midi'],['canyon','midi']]
    http=gp.libre();port=gp.libre()
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=gp.VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    out=[]
    try:
        for p in pal:
            for m in maps:
                prof=tempfile.mkdtemp(prefix='passes-');pt=gp.libre()
                ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%pt,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
                try:
                    for i in range(60):
                        time.sleep(.5)
                        try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%pt,timeout=2).read();break
                        except Exception:pass
                    R=run(http,pt,p,m,extra)
                finally:
                    ch.terminate()
                    try:ch.wait(5)
                    except Exception:ch.kill()
                    shutil.rmtree(prof,ignore_errors=True)
                if 'err' in R:print(p,m,R);continue
                seq=R['seq'];n=max(1,len(seq))
                fbs=[len(set(x for x in s if x.startswith('B:'))) for s in seq]
                nb=[sum(1 for x in s if x.startswith('B:')) for s in seq]
                lec=[sum(1 for x in s if not x.startswith('B:')) for s in seq]
                print('palier %d %-14s images %3d | framebuffers distincts/image moy %.2f (max %d) | liaisons/image moy %.2f | lectures/image moy %.2f'%(p,':'.join(m),n,sum(fbs)/n,max(fbs or [0]),sum(nb)/n,sum(lec)/n))
                print('   séquence type :',seq[len(seq)//2] if seq else None)
                for k,v in sorted(R['lect'].items(),key=lambda x:-x[1]):print('   %5d × %s'%(v,k))
                out.append({'palier':p,'carte':m,'n':n,'fbs':sum(fbs)/n,'lect':sum(lec)/n,'lectures':R['lect'],'seqtype':seq[len(seq)//2] if seq else None,'pal':R['pal'],'cout':R['cout']})
        json.dump(out,open(os.environ.get('SORTIE','/tmp/passes.json'),'w'),indent=1)
    finally:
        srv.terminate()
if __name__=='__main__':main()
