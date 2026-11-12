#!/usr/bin/env python3
"""LA COURSE SCÉNARISÉE « PREMIÈRE FOIS » (2026-11-07, passe perf 3, P6 : les gels en course à la première fois).

    python3 outils/banc-perf/premiere-fois.py [--palier N] [--json f.json] [--tel] [--seul etape,etape] [--cpu 4] [--md f.md]

Une SEULE course, profil neuf (`garde=1&palier=2&tel=1&pistegraine=777`, Chrome sans fenêtre déguisé en iPhone, processeur ×4 après le menu), qui
déclenche pour la 1re fois : CHAQUE figure (`dbgFigure`), chaque pouvoir (`dbgPwr`) et chaque fruit-pouvoir ramassé (`dbgPwrDevant`), un orage, un événement
rare, la frénésie, une seconde chance et un VRAI portail vers chaque map. Pour chaque ÉTAPE (= une naissance) il relève : les programmes liés (`linkProgram` + pile),
les appels WebGL > 20 ms (`texImage2D`, `readPixels`, `getProgramParameter`…) avec leur pile, `toDataURL`/`toBlob`/`getImageData`, les `CanvasTexture` créées,
les images > 100 ms (rAF) et les « long-animation-frame » de Chrome avec leurs scripts, la durée de style/mise en page, la variation de textures/géométries/programmes.
Sortie : un tableau (une ligne par naissance) ; `--md` l'écrit en Markdown ; sortie 0 = rien > 100 ms hors portails et 0 programme lié en course, 1 sinon, 2 = le banc n'a pas pu tourner.
"""
import sys,os,json,time,subprocess,importlib.util,tempfile,shutil
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
from cdp import CDP
spec=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(spec);spec.loader.exec_module(gp)

HOOK=r"""(function(){
 var P=window.__P={fauxLie:true,ev:[],F:[],lab:'départ',on:false,cv:0,ct:0,up:{tex:0,px:0,buf:0,bytes:0,n:0},loaf:[],t0:performance.now()};
 function pile(n){var s=(new Error()).stack.split('\n').slice(3,3+(n||9)).map(function(l){return l.replace(/^\s*at\s*/,'').replace(/https?:\/\/[^ )\/]*\//g,'').replace(/\(.*[\\/]/,'(');});return s.join(' < ');}
 function note(k,d,x,st){if(P.on)P.ev.push({t:Math.round(performance.now()-P.t0),lab:P.lab,k:k,d:Math.round(d*10)/10,x:x,st:st});}
 ['WebGL2RenderingContext','WebGLRenderingContext'].forEach(function(C){var Q=window[C]&&window[C].prototype;if(!Q)return;
  var lp=Q.linkProgram,LT=new WeakMap();Q.linkProgram=function(p){LT.set(p,performance.now());note('linkProgram',0,'',pile(10));return lp.call(this,p);};
  (function(){var ids=new WeakMap(),nid=0,seenP={},seenK={};
   function pid(p){var i=ids.get(p);if(!i){i=++nid;ids.set(p,i);}return i;}
   function nom(g,p){try{var sh=g.getAttachedShaders(p),src=g.getShaderSource(sh[0])||'',m=/#define SHADER_NAME (\S+)/.exec(src),df=(src.match(/#define (USE_[A-Z_]+|FLAT_SHADED|DOUBLE_SIDED|ALPHATEST|NUM_[A-Z_]+ \d+|DITHERING)/g)||[]).map(function(x){return x.replace('#define ','');}).join(' ');return (m?m[1]:'?')+' ['+df.slice(0,160)+']';}catch(e){return '?';}}
   var ud=Q.useProgram;Q.useProgram=function(p){this.__cp=p;return ud.call(this,p);};
   var en=Q.enable,di=Q.disable;Q.enable=function(c){if(c===3042)this.__bl=1;else if(c===2929)this.__dt=1;else if(c===2884)this.__cu=1;return en.call(this,c);};Q.disable=function(c){if(c===3042)this.__bl=0;else if(c===2929)this.__dt=0;else if(c===2884)this.__cu=0;return di.call(this,c);};
   var dm=Q.depthMask;Q.depthMask=function(b){this.__dm=b?1:0;return dm.call(this,b);};
   var bf=Q.blendFunc;Q.blendFunc=function(a,b){this.__bf=a+','+b;return bf.call(this,a,b);};var bs=Q.blendFuncSeparate;Q.blendFuncSeparate=function(a,b,c,d){this.__bf=a+','+b+','+c+','+d;return bs.call(this,a,b,c,d);};
   var bb=Q.bindFramebuffer;Q.bindFramebuffer=function(t,f){this.__fb=f?1:0;return bb.call(this,t,f);};
   function dessin(g){var p=g.__cp;if(!p)return;var i=pid(p),k=i+'|'+(g.__bl|0)+'|'+(g.__bl?(g.__bf||''):'')+'|'+(g.__dm===0?0:1)+'|'+(g.__dt|0)+'|'+(g.__cu|0)+'|'+(g.__fb|0);
    if(!seenP[i]){seenP[i]=1;seenK[k]=1;if(P.on)note('prem-programme',0,nom(g,p)+' état '+k.split('|').slice(1).join('|')+' ¶ '+(P.qui?P.qui():''),pile(4));}
    else if(!seenK[k]){seenK[k]=1;if(P.on)note('prem-etat',0,nom(g,p)+' état '+k.split('|').slice(1).join('|')+' ¶ '+(P.qui?P.qui():''),pile(4));}}
   ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced','drawRangeElements'].forEach(function(n){var f=Q[n];if(!f)return;Q[n]=function(){dessin(this);return f.apply(this,arguments);};});
  })();
  var ti=Q.texImage2D;Q.texImage2D=function(){var A=arguments,w=A.length>=9?A[3]:(A[5]&&A[5].width)||0,h=A.length>=9?A[4]:(A[5]&&A[5].height)||0;if(P.on&&w*h>=16384){P.up.tex++;P.up.px+=w*h;if(P.up.n<40){P.up.n++;note('envoi-texture',0,w+'x'+h,pile(7));}}return ti.apply(this,arguments);};
  var bd=Q.bufferData;Q.bufferData=function(t,d){var b=d&&d.byteLength?d.byteLength:(typeof d==='number'?d:0);if(P.on&&b>=100000){P.up.buf++;P.up.bytes+=b;if(P.up.n<40){P.up.n++;note('envoi-tampon',0,Math.round(b/1024)+'Ko',pile(7));}}return bd.apply(this,arguments);};
  ['texSubImage2D','readPixels','getProgramParameter','getProgramInfoLog','finish','compileShader','getError','bufferData','generateMipmap','checkFramebufferStatus','getShaderParameter','getUniformLocation'].forEach(function(k){var f=Q[k];if(!f)return;
   Q[k]=function(){if(k==='getProgramParameter'&&arguments[1]===37297&&P.fauxLie){var t0=LT.get(arguments[0]);return t0===undefined||performance.now()-t0>300;} /* (banc headless) COMPLETION_STATUS_KHR ne répond jamais vrai dans ce Chrome (piège connu) : un programme est « lié » 300 ms après sa demande — la vraie liaison se fait au premier appel bloquant */
    var a=performance.now(),r=f.apply(this,arguments),d=performance.now()-a;
    if(d>20){var x='';if(k==='texImage2D'||k==='texSubImage2D'){var A=arguments;x=(A.length>=9?A[3]+'x'+A[4]:(A[5]&&A[5].width?A[5].width+'x'+A[5].height:''));}if(k==='getProgramParameter'&&arguments[1]===35714)x='LINK_STATUS';note(k,d,x,pile(10));}
    return r;};});});
 document.addEventListener('load',function(e){var t=e.target;if(!t||!t.src||!/three/.test(t.src)||!window.THREE||P.thr)return;P.thr=1;
  ['Mesh','InstancedMesh','Points','Sprite','Line','LineSegments','SkinnedMesh'].forEach(function(n){var O=THREE[n];if(!O)return;var W=function(){var o=Reflect.construct(O,arguments,new.target||W);o.__cs=new Error();return o;};W.prototype=O.prototype;THREE[n]=W;});},true);
 var td=HTMLCanvasElement.prototype.toDataURL;HTMLCanvasElement.prototype.toDataURL=function(){var a=performance.now(),r=td.apply(this,arguments);note('toDataURL',performance.now()-a,this.width+'x'+this.height,pile(8));return r;};
 var tb=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(){var a=performance.now(),r=tb.apply(this,arguments);note('toBlob',performance.now()-a,this.width+'x'+this.height,pile(8));return r;};
 var gi=CanvasRenderingContext2D.prototype.getImageData;CanvasRenderingContext2D.prototype.getImageData=function(){var a=performance.now(),r=gi.apply(this,arguments);note('getImageData',performance.now()-a,arguments[2]+'x'+arguments[3],pile(8));return r;};
 var ce=document.createElement.bind(document);document.createElement=function(t){var e=ce.apply(null,arguments);if(P.on&&String(t).toLowerCase()==='canvas'){P.cv++;note('canvas',0,'',pile(6));}return e;};
 var l=performance.now();function f(t){window.__rafN=(window.__rafN|0)+1;var d=t-l;l=t;if(P.on&&d>50)P.F.push([Math.round(t-P.t0),Math.round(d),P.lab]);requestAnimationFrame(f);}requestAnimationFrame(f);
 try{new PerformanceObserver(function(L){L.getEntries().forEach(function(e){if(!P.on||e.duration<80)return;P.loaf.push({t:Math.round(e.startTime-P.t0),d:Math.round(e.duration),bl:Math.round(e.blockingDuration||0),st:Math.round(e.styleAndLayoutStart?e.startTime+e.duration-e.styleAndLayoutStart:0),lab:P.lab,
  sc:(e.scripts||[]).filter(function(s){return s.duration>20;}).map(function(s){return s.invoker+' '+s.sourceFunctionName+' '+(s.sourceURL||'').replace(/.*\//,'')+':'+s.sourceCharPosition+' '+Math.round(s.duration)+'ms (forcé '+Math.round(s.forcedStyleAndLayoutDuration||0)+')';})});});}).observe({type:'long-animation-frame',buffered:true});}catch(e){}
 })();"""
# Enveloppe des CanvasTexture : posée APRÈS le chargement du jeu (THREE est global, le jeu écrit `new THREE.CanvasTexture(...)` à chaque appel)
HOOK2=r"""(function(){var P=window.__P;if(P.ctW)return 'déjà';var O=THREE.CanvasTexture;THREE.CanvasTexture=function(){P.ct++;if(P.on)P.ev.push({t:Math.round(performance.now()-P.t0),lab:P.lab,k:'CanvasTexture',d:0,x:(arguments[0]&&arguments[0].width?arguments[0].width+'x'+arguments[0].height:''),st:(new Error()).stack.split('\n').slice(2,9).map(function(l){return l.replace(/^\s*at\s*/,'').replace(/https?:\/\/[^ )\/]*\//g,'');}).join(' < ')});return Reflect.construct(O,arguments,THREE.CanvasTexture);};THREE.CanvasTexture.prototype=O.prototype;P.ctW=1;var R=dbgScene().rdr,rb=R.renderBufferDirect;R.renderBufferDirect=function(c,sc,g,m,o,gr){P.cO=o;P.cM=m;P.cG=g;return rb.apply(this,arguments);};
 P.qui=function(){var o=P.cO,m=P.cM,g=P.cG;if(!o)return '';var ch=[],q=o;for(var i=0;q&&i<5;i++){ch.push((q.name||'')+'/'+q.type+(q.userData&&q.userData.pow?'#'+q.userData.pow:''));q=q.parent;}
  return 'objet '+ch.join(' ‹ ')+' | mat '+m.type+' '+(m.name||'')+(m.color?' #'+m.color.getHexString():'')+(m.map?' map '+(m.map.image&&m.map.image.width)+'px':'')+(m.transparent?' transp':'')+(m.blending===2?' ADD':'')+(m.vertexColors?' vc':'')+' | géo '+g.type+' '+(g.attributes.position?g.attributes.position.count:0)+'v '+(g.index?g.index.count/3|0:0)+'t'+(o.isInstancedMesh?' inst '+o.count:'')+' | créé par '+(o.__cs?o.__cs.stack.split('\n').slice(2,6).map(function(l){return l.replace(/^\s*at\s*/,'').replace(/\(.*[\/:]([^:]+:\d+):\d+\)/,'($1)').replace(/https?:[^ ]*\//,'');}).join(' < '):'?');};
 return 'ok';})()"""

def metr(c):
    m={x['name']:x['value'] for x in c.call('Performance.getMetrics')['metrics']}
    return {k:m.get(k,0) for k in ('ScriptDuration','LayoutDuration','RecalcStyleDuration','TaskDuration')}
COUT="""JSON.stringify((function(){try{var k=dbgCout();return {progs:k.progs,tex:k.tex,geo:k.geo}}catch(e){return {}}})())"""
def etat(c):
    try:return json.loads(c.ev(COUT)) or {}
    except Exception:return {}

def demarre(tel=True,palier=2,carte='nuages',meteo='midi',cpu=4):
    http=gp.libre();port=gp.libre();VP=gp.VP
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(http),'--bind','127.0.0.1'],cwd=VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='premiere-fois-')
    ch=subprocess.Popen([gp.chrome(),'--headless=new','--remote-debugging-port=%d'%port,'--user-data-dir='+prof,'--mute-audio','--autoplay-policy=no-user-gesture-required','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    def fin():
        for p in (ch,srv):
            try:p.terminate();p.wait(5)
            except Exception:
                try:p.kill()
                except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
    for i in range(60):
        time.sleep(.5)
        try:
            import urllib.request;urllib.request.urlopen('http://127.0.0.1:%d/json/version'%port,timeout=2).read();break
        except Exception:pass
    else:fin();sys.exit('Chrome ne répond pas')
    base='http://127.0.0.1:%d'%http
    c=CDP(port);c.keep={'Runtime.exceptionThrown','Runtime.consoleAPICalled'}
    for m in ('Network.enable','Page.enable','Runtime.enable','Performance.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=3,mobile=True,screenWidth=390,screenHeight=844,screenOrientation={'type':'portraitPrimary','angle':0})
    c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=gp.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(gp.SAVE)))
    c.call('Page.addScriptToEvaluateOnNewDocument',source=HOOK)
    c.call('Page.navigate',url=base+'/index.html?garde=1&palier=%d%s&pistegraine=777&carte=%s&meteo=%s'%(palier,'&tel=1' if tel else '',carte,meteo)+os.environ.get('PF_QS',''))
    if not gp.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):fin();print('⛔ le jeu ne démarre pas');sys.exit(2)
    t=time.time();n=0
    while time.time()-t<150 and not c.ev(gp.BTN): # (P6) un toucher de l'intro ne se pose QUE tant que l'écran d'accueil n'est pas là : un toucher de plus ouvrait l'atelier, où la chauffe du menu ne tourne pas
        if n<3 and not c.ev("document.body.classList.contains('inGarage')||(document.getElementById('overlay')||{dataset:{}}).dataset.ecran==='home'"):gp.tap(c,195,300);n+=1;c.pump(6)
        else:c.pump(1)
    gp.attend(c,"dbgPrebati().etat==='pret'",120);c.pump(1)
    t=time.time()
    while time.time()-t<30:
        if c.ev("typeof dbgPremiere!=='function'||!dbgPremiere().on||dbgPremiere().moteurs.fini")is True:break
        c.pump(15);print('  … chauffe',c.ev("JSON.stringify(dbgChauffe())")[:160],flush=True)
        if os.environ.get('PF_DIAG'):
            for e in c.events[-400:]:
                if e['method']=='Runtime.consoleAPICalled' and e['params']['type'] in('warning','error'):print('  console',e['params']['type'],' '.join(str(a.get('value') or a.get('description') or '')[:200] for a in e['params']['args'])[:300],flush=True)
            c.events.clear()
        if os.environ.get('PF_DIAG'):print('  diag',c.ev("JSON.stringify({font:document.fonts.check('26px \"Press Start 2P\"'),fonts:document.fonts.status,imgs:window.__imagesJeu,raf:window.__rafN,st:dbgState().started,vis:document.visibilityState,ov:(document.getElementById('overlay')||{dataset:{}}).dataset.ecran,body:document.body.className.slice(0,100),dep:typeof dbgDepart==='function'?dbgDepart():null,gar:typeof dbgGarage==='function'?1:0})")[:900],flush=True) # la chauffe du menu (divers → moteurs → rendu) puis ma chaîne des moteurs de l'écran de mort
    c.call('Emulation.setCPUThrottlingRate',rate=cpu) # le processeur ×4 n'est posé qu'APRÈS le menu et sa chauffe (comme garde-perf.py)
    print('chauffe des premières fois :',c.ev("typeof dbgPremiere==='function'?JSON.stringify(dbgPremiere()):'absent'"))
    t=time.time();ok=False
    while time.time()-t<90 and not ok:
        r=c.ev(gp.BTN)
        if r:gp.tap(c,r[0],r[1],.12);ok=True
        else:
            g=c.ev("(function(){var e=document.getElementById('gJouer');if(!e)return null;var b=e.getBoundingClientRect();return b.width>0?[b.left+b.width/2,b.top+b.height/2]:null})()")
            if g:gp.tap(c,g[0],g[1],.12);ok=True
            elif time.time()-t>25:gp.tap(c,195,300);c.pump(3)
            else:c.pump(.5)
    if not gp.attend(c,"dbgState().started&&!dbgState().gameOver",60):fin();print('⛔ le JOUER ne part pas');sys.exit(2)
    c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{});1");c.pump(2);c.ev(HOOK2)
    if os.environ.get('PF_CHAUFFE'):print('chauffe forcée :',c.ev("JSON.stringify(dbgPremiere('tout'))"),flush=True);c.pump(2)
    return c,fin

# ---- le scénario : (nom, famille, [js à lancer], attente en secondes après) -------------------------------------------------------------------------
VOL="dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1"
SOL="dbgAuto(1,0,{});1"
FIGS=['tailwhip','tonneau','toupie','shimmy','chandelle','salto','double','tirebouchon','helico','penche','rodeo','cosmique','derive','g']
def scenario():
    S=[('calme','ref',[SOL],3)]
    S.append(('mise en vol','vol',[VOL],4))
    for f in FIGS:
        S.append(('figure '+f,'figure',["dbgFigure(%s)"%json.dumps(f)],2.2))
    for k in 'navmx':
        S.append(('cristal %s posé devant'%k,'fruit-pouvoir',["dbgPwrDevant(%s,60,0)"%json.dumps(k)],3.5))
    for k in 'navmx':
        S.append(('pouvoir %s pris'%k,'pouvoir',["dbgPwr(%s)"%json.dumps(k)],2.5))
    S.append(('pouvoir + figure en l\'air (hPwr figVol hAirPie)','pouvoir+figure',["dbgPwr('n');dbgPwr('a')","dbgFigure('salto')"],4))
    S.append(('éclair coup','orage',["dbgEclair('coup')"],2))
    S.append(('éclair nuage','orage',["dbgEclair('nuage')"],2))
    S.append(('événement rare : armer','evenement-rare',["dbgEvt('arme')"],3))
    S.append(('événement rare : caisse','evenement-rare',["dbgEvt('caisse')"],6))
    S.append(('frénésie : jauge pleine','frenesie',["dbgFren('v',100)"],3))
    S.append(('frénésie : entre','frenesie',["dbgFren('entre')"],5))
    S.append(('seconde chance : mort','seconde-chance',["dbgSable(0)","dbgChance('mort')"],4))
    S.append(('seconde chance : joue','seconde-chance',["dbgChance('joue')"],5))
    return S

def lis(c,P0):
    r=json.loads(c.ev("JSON.stringify(window.__P)"));return r

def run(c,etapes,seul=None):
    res=[];c.ev("__P.on=true;1")
    for nom,fam,js,att in etapes:
        if seul and not any(s in nom for s in seul):continue
        m0=metr(c);e0=etat(c)
        c.ev("__P.lab=%s;__P.ev.length=0;__P.F.length=0;__P.loaf.length=0;__P.cv=0;__P.ct=0;__P.up={tex:0,px:0,buf:0,bytes:0,n:0};1"%json.dumps(nom))
        t0=time.time();ret=[]
        if fam in('figure','pouvoir+figure'):
            if not gp.attend(c,"dbgState().mode==='fall'",12):print('   (pas en vol)')
        for j in js:
            try:ret.append(c.ev(j))
            except Exception as e:ret.append('ERR '+str(e)[:80])
            c.pump(.35)
        c.pump(max(0,att-(time.time()-t0)))
        m1=metr(c);e1=etat(c)
        P=json.loads(c.ev("JSON.stringify(window.__P)"))
        st=json.loads(c.ev("JSON.stringify({m:dbgState().mode,go:dbgState().gameOver,b:document.body.className.replace(/\\b(touch|play|hd|c6)\\b/g,'').trim().slice(0,90)})"))
        d={'etape':nom,'famille':fam,'ret':[str(x)[:40] for x in ret],'ev':P['ev'],'F':P['F'],'loaf':P['loaf'],'cv':P['cv'],'ct':P['ct'],'up':P['up'],'etat':st,
           'delta':{k:e1.get(k,0)-e0.get(k,0) for k in ('progs','tex','geo')},
           'ms':{k:round((m1[k]-m0[k])*1000) for k in m1}}
        res.append(d);ligne(d)
    return res

def ligne(d):
    ev=d['ev'];lk=sum(1 for e in ev if e['k']=='linkProgram');pire=max([f[1] for f in d['F']] or [0]);n100=sum(1 for f in d['F'] if f[1]>100)
    gros=[e for e in ev if e['k'] not in('linkProgram','canvas','CanvasTexture','envoi-texture','envoi-tampon','prem-programme','prem-etat')]
    u=d.get('up',{});pp=sum(1 for e in ev if e['k']=='prem-programme');pe=sum(1 for e in ev if e['k']=='prem-etat')
    print('%-46s lie %2d | CT %2d cv %2d | pire img %4d ms (%d>100) | GL>20ms: %s | 1er dessin prog %d état %d | envoi tex %d (%d kpx) tampons %d (%d Ko) | Δprog %+d tex %+d geo %+d | style+page %d ms | %s'%(d['etape'][:46],lk,d['ct'],d['cv'],pire,n100,
        ','.join('%s%d'%(e['k'][:8],e['d']) for e in gros[:5]) or '-',pp,pe,u.get('tex',0),u.get('px',0)//1000,u.get('buf',0),u.get('bytes',0)//1024,d['delta']['progs'],d['delta']['tex'],d['delta']['geo'],d['ms']['LayoutDuration']+d['ms']['RecalcStyleDuration'],d['etat']['m']))

def md(res,chemin):
    L=['# Première fois — course scénarisée (banc `outils/banc-perf/premiere-fois.py`)','','| étape | programmes liés | CanvasTexture | canvas | pire image (ms) | images > 100 ms | appels GL > 20 ms | Δ programmes / textures / géométries | style+page (ms) |','|---|---|---|---|---|---|---|---|---|']
    for d in res:
        ev=d['ev'];lk=sum(1 for e in ev if e['k']=='linkProgram');pire=max([f[1] for f in d['F']] or [0]);n100=sum(1 for f in d['F'] if f[1]>100)
        gros=[e for e in ev if e['k'] not in('linkProgram','canvas','CanvasTexture')]
        L.append('| %s | %d | %d | %d | %d | %d | %s | %+d / %+d / %+d | %d |'%(d['etape'],lk,d['ct'],d['cv'],pire,n100,', '.join('%s %d ms %s'%(e['k'],e['d'],e['x']) for e in gros[:4]) or '—',d['delta']['progs'],d['delta']['tex'],d['delta']['geo'],d['ms']['LayoutDuration']+d['ms']['RecalcStyleDuration']))
    open(chemin,'w').write('\n'.join(L)+'\n')

def main():
    av=sys.argv[1:];o={'palier':2,'tel':True,'json':None,'seul':None,'cpu':4,'md':None,'portails':True}
    i=0
    while i<len(av):
        a=av[i]
        if a=='--palier':o['palier']=int(av[i+1]);i+=2
        elif a=='--json':o['json']=av[i+1];i+=2
        elif a=='--md':o['md']=av[i+1];i+=2
        elif a=='--cpu':o['cpu']=int(av[i+1]);i+=2
        elif a=='--seul':o['seul']=av[i+1].split(',');i+=2
        elif a=='--sans-tel':o['tel']=False;i+=1
        elif a=='--sans-portails':o['portails']=False;i+=1
        elif a=='--portails-seuls':o['seul']=['__aucune__'];o['portails']=True;i+=1
        else:i+=1
    c,fin=demarre(o['tel'],o['palier'],cpu=o['cpu'])
    try:
        res=run(c,scenario(),o['seul'])
        if o['portails'] and (not o['seul'] or o['seul']==['__aucune__']):
            for m in ('ville:pluie','jade:midi','grotte:matin','dunes:midi','canyon:midi','nuages:orage'):
                a=m.split(':');z0=c.ev("dbgEco().zones")
                c.ev(SOL);c.ev("dbgClassique(%s,%s);1"%(json.dumps(a[0]),json.dumps(a[1])));c.ev("dbgPortail(2600);1")
                c.ev("__P.lab=%s;__P.ev.length=0;__P.F.length=0;__P.loaf.length=0;__P.cv=0;__P.ct=0;__P.up={tex:0,px:0,buf:0,bytes:0,n:0};1"%json.dumps('portail → '+m))
                e0=etat(c);m0=metr(c);t=time.time()
                while time.time()-t<80 and c.ev("dbgEco().zones")==z0:c.pump(.3)
                c.pump(3.0);e1=etat(c);m1=metr(c);P=json.loads(c.ev("JSON.stringify(window.__P)"))
                d={'etape':'portail → '+m,'famille':'portail','ret':[],'ev':P['ev'],'F':P['F'],'loaf':P['loaf'],'cv':P['cv'],'ct':P['ct'],'up':P['up'],'etat':{'m':c.ev("dbgState().mode")},
                   'delta':{k:e1.get(k,0)-e0.get(k,0) for k in ('progs','tex','geo')},'ms':{k:round((m1[k]-m0[k])*1000) for k in m1}}
                res.append(d);ligne(d)
        if o['json']:json.dump(res,open(o['json'],'w'),indent=1,ensure_ascii=False)
        if o['md']:md(res,o['md'])
        err=c.ev("JSON.stringify({l:window.__loopErr?String(window.__loopErr).slice(0,200):null,p:window.__prebErr?String(window.__prebErr).slice(0,200):null})")
        print('erreurs de page :',err)
        bad=[d for d in res if d['famille']!='portail' and (any(e['k']=='linkProgram' for e in d['ev']) or any(f[1]>100 for f in d['F']))]
        print('étapes fautives (hors portails) :',len(bad),[d['etape'] for d in bad])
        return 1 if bad else 0
    finally:fin()
if __name__=='__main__':sys.exit(main())
