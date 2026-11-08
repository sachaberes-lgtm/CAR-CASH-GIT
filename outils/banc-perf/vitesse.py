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

GRAPHE=r"""(function(){var S=dbgScene(),sc=S.scene,cam=S.cam,R=S.rdr,gl=R.getContext(),T=THREE,res={};
 function reach(f){var ch=sc.children;for(var i=0;i<ch.length;i++){var o=ch[i];if(o.visible===false)continue;(function w(x,prof){f(x,prof);for(var k=0;k<x.children.length;k++)w(x.children[k],prof+1);})(o,1);}}
 var tot=0,auto=0,autoNoParent=0,meshes=0,visMesh=0,prof=0,lights=0,hidDeep=0,types={};
 var autoList=[];
 reach(function(o,p){tot++;if(p>prof)prof=p;if(o.visible===false)hidDeep++;if(o.matrixAutoUpdate){auto++;autoList.push(o);}if(o.isLight)lights++;var t=o.type;types[t]=(types[t]||0)+1;if(o.isMesh||o.isLine||o.isPoints){meshes++;if(o.visible)visMesh++;}});
 var snap=autoList.map(function(o){return o.matrix.elements.slice();});
 var tc=0;sc.children.forEach(function(){tc++;});
 var hidTop=0;sc.children.forEach(function(o){if(o.visible===false)hidTop++;});
 res.recens={objetsAtteints:tot,racine:tc,racineCachee:hidTop,profondeurMax:prof,matrixAutoUpdate:auto,meshs:meshes,meshsVisibles:visMesh,lumieres:lights,cachesProfonds:hidDeep,types:types};
 // compteurs par image
 var C={umw:0,um:0,uni:0,draw:0,prog:0,tex:0,buf:0,vao:0,state:0};
 var P=T.Object3D.prototype,o1=P.updateMatrixWorld,o2=P.updateMatrix;P.updateMatrixWorld=function(f){C.umw++;return o1.call(this,f);};P.updateMatrix=function(){C.um++;return o2.call(this);};
 var wr=[];function wrap(n,k){var f=gl[n];if(typeof f!=='function')return;gl[n]=function(){C[k]++;return f.apply(this,arguments);};wr.push([n,f]);}
 ['uniform1f','uniform1i','uniform2f','uniform3f','uniform4f','uniform1fv','uniform2fv','uniform3fv','uniform4fv','uniformMatrix3fv','uniformMatrix4fv','uniform1iv'].forEach(function(n){wrap(n,'uni');});
 ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced'].forEach(function(n){wrap(n,'draw');});
 wrap('useProgram','prog');wrap('bindTexture','tex');wrap('bindBuffer','buf');wrap('bindVertexArray','vao');wrap('bufferSubData','buf');wrap('enable','state');wrap('disable','state');wrap('blendFunc','state');wrap('depthMask','state');
 window.__GR={C:C,res:res,wr:wr,P:P,o1:o1,o2:o2,snap:snap,autoList:autoList,n:0,t0:performance.now(),info:null};
 function fr(){var G=window.__GR;G.n++;if(G.n===60){G.info={calls:R.info.render.calls,tri:R.info.render.triangles,prog:R.info.programs?R.info.programs.length:0,geo:R.info.memory.geometries,tex:R.info.memory.textures};}
  if(G.n<150)requestAnimationFrame(fr);else G.fini=true;}requestAnimationFrame(fr);return 1;})()"""
GRAPHE2=r"""(function(){var G=window.__GR,R=dbgScene().rdr,cam=dbgScene().cam,sc=dbgScene().scene,gl=R.getContext(),n=G.n,res=G.res;
 G.wr.forEach(function(w){gl[w[0]]=w[1];});G.P.updateMatrixWorld=G.o1;G.P.updateMatrix=G.o2;
 var bouge=0,immobile=0;G.autoList.forEach(function(o,i){var a=G.snap[i],b=o.matrix.elements,d=false;for(var k=0;k<16;k++)if(a[k]!==b[k]){d=true;break;}if(d)bouge++;else immobile++;});
 var parType={},stat={};G.autoList.forEach(function(o,i){var a=G.snap[i],b=o.matrix.elements,d=false;for(var k=0;k<16;k++)if(a[k]!==b[k]){d=true;break;}if(!d){var t=o.type+(o.name?':'+o.name.slice(0,18):'');stat[t]=(stat[t]||0)+1;}});
 var top=Object.keys(stat).map(function(k){return [k,stat[k]];}).sort(function(a,b){return b[1]-a[1];}).slice(0,10);
 // champ de vision et matériaux
 var fr=new THREE.Frustum(),m4=new THREE.Matrix4();cam.updateMatrixWorld();m4.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);fr.setFromProjectionMatrix(m4);
 var vis=0,hors=0,sansCull=0,mats=new Set(),sig=new Map(),instances=0;
 sc.traverseVisible(function(o){if(!(o.isMesh||o.isLine||o.isPoints))return;vis++;if(o.isInstancedMesh)instances++;if(o.frustumCulled===false){sansCull++;}else{try{if(!fr.intersectsObject(o))hors++;}catch(e){}}
   var ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(function(m){if(!m)return;mats.add(m);var k=[m.type,m.color&&m.color.getHex(),m.opacity,m.transparent,m.side,m.blending,m.depthWrite,m.depthTest,m.vertexColors,m.map&&m.map.uuid,m.emissive&&m.emissive.getHex(),m.wireframe,m.fog,m.flatShading].join('|');if(m.isShaderMaterial)k+='|S'+m.uuid;sig.set(k,(sig.get(k)||0)+1);});});
 var dup=0;sig.forEach(function(v,k){if(v>1)dup+=v-1;});
 var out={frames:n,parImage:{updateMatrixWorld:+(G.C.umw/n).toFixed(0),updateMatrix:+(G.C.um/n).toFixed(0),uniformes:+(G.C.uni/n).toFixed(0),draw:+(G.C.draw/n).toFixed(0),useProgram:+(G.C.prog/n).toFixed(0),bindTexture:+(G.C.tex/n).toFixed(0),bindBuffer_ou_Sub:+(G.C.buf/n).toFixed(0),bindVAO:+(G.C.vao/n).toFixed(0),etat:+(G.C.state/n).toFixed(0)},rendu:G.info,
  recens:res.recens,autoImmobiles:immobile,autoQuiBougent:bouge,autoImmobilesTop:top,visibles:vis,horsChamp:hors,sansFrustumCulling:sansCull,instancedMesh:instances,materiauxDistincts:mats.size,signaturesDistinctes:sig.size,doublonsIdentiques:dup};
 return JSON.stringify(out);})()"""
def graphe(dossier,idx_cran,plus,qs,carte):
    http,port,srv,ch,prof=lance(dossier)
    try:
        c=CDP(port);c.keep={'Runtime.exceptionThrown'};m=carte.split(':')
        sv=dict(gp.SAVE);sv['vdep']=idx_cran;sv['ex']={'eng':29,'runs':9}
        if not demarre(c,http,'?garde=1&palier=2&tel=1&pistegraine=777&carte=%s&meteo=%s'%(m[0],m[1])+qs,save=sv):return None
        c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{});1")
        for i in range(plus):c.ev("dbgMoteur();1");c.pump(.5)
        c.call('Emulation.setCPUThrottlingRate',rate=4);c.pump(8)
        c.ev(GRAPHE)
        for i in range(60):
            if c.ev("!!window.__GR.fini"):break
            c.pump(1)
        return json.loads(c.ev(GRAPHE2))
    finally:ferme(srv,ch,prof)

HOOK_SON=r"""(function(){var C={},S={dem:0,fin:0,stop:0},A={},t0=performance.now(),AC=null;window.__SON={C:C,S:S,A:A,nodes:new Set(),ac:function(){var r=AC;if(window.__SON.acs)window.__SON.acs.forEach(function(a){if(a.state==='running')r=a;});return r;}};
 var P=(window.BaseAudioContext||window.AudioContext).prototype;
 Object.getOwnPropertyNames(P).forEach(function(n){if(n.indexOf('create')!==0||typeof P[n]!=='function')return;var f=P[n];P[n]=function(){var r=f.apply(this,arguments);if(this&&this.state!==undefined&&this.constructor&&(this.constructor.name==='AudioContext'||this.constructor.name==='webkitAudioContext')){if(!window.__SON.acs)window.__SON.acs=new Set();window.__SON.acs.add(this);if(this.state!=='closed')AC=this;}var off=this&&this.constructor&&/Offline/.test(this.constructor.name),nn=(off?'OFF ':'LIVE ')+n;C[nn]=(C[nn]||0)+1;if(n==='createOscillator'||n==='createBufferSource'||n==='createGain'||n==='createBiquadFilter'){try{var st=(new Error()).stack.split(String.fromCharCode(10)),ln=(st[3]||st[2]||'').split('/').pop().trim().slice(0,40);var K=window.__SON.OU||(window.__SON.OU={});K[(off?'OFF ':'LIVE ')+n+' '+ln]=(K[(off?'OFF ':'LIVE ')+n+' '+ln]||0)+1;if(r&&(n==='createOscillator'||n==='createBufferSource')){r.__ou=(off?'OFF ':'LIVE ')+n+' '+ln;}}catch(e){}}try{window.__SON.nodes.add(r);if(r&&r.addEventListener&&(n==='createBufferSource'||n==='createOscillator'||n==='createConstantSource'))r.addEventListener('ended',function(){S.fin++;window.__SON.nodes.delete(r);if(r.__ou){var F=window.__SON.FIN||(window.__SON.FIN={});F[r.__ou]=(F[r.__ou]||0)+1;}});}catch(e){}return r;};});
 ['OscillatorNode','AudioBufferSourceNode','ConstantSourceNode'].forEach(function(k){var N=window[k];if(!N)return;var st=N.prototype.start,sp=N.prototype.stop;N.prototype.start=function(){S.dem++;return st.apply(this,arguments);};N.prototype.stop=function(){S.stop++;return sp.apply(this,arguments);};});
 var an=window.AnalyserNode&&AnalyserNode.prototype;if(an)['getByteFrequencyData','getFloatFrequencyData','getByteTimeDomainData','getFloatTimeDomainData'].forEach(function(n){var f=an[n];an[n]=function(a){A[n]=(A[n]||0)+1;A[n+'_n']=(A[n+'_n']||0)+(a&&a.length||0);return f.apply(this,arguments);};});
 var C2=window.AudioContext||window.webkitAudioContext;
})()"""
SON_MESURE=r"""(function(){try{var W=window.__SON;if(!W)return JSON.stringify({err:"pas de __SON"});var AC=W.ac();var acs=[];if(W.acs)W.acs.forEach(function(a){acs.push(a.state);});var c={ok:!!AC,contextes:acs,etat:AC&&AC.state,mv:(typeof dbgMV==='function')?(function(){try{return JSON.stringify(dbgMV()).slice(0,200);}catch(e){return 'err';}})():null,sr:AC&&AC.sampleRate,base:AC&&AC.baseLatency,sortie:AC&&AC.outputLatency};
 c.creations=Object.assign({},W.C);c.sources={demarres:W.S.dem,finies:W.S.fin,stop:W.S.stop,vivantes_estim:W.S.dem-W.S.fin};c.analyseurs=Object.assign({},W.A);c.noeudsConnus=W.nodes.size;
 var par={};W.nodes.forEach(function(n){var t=n.constructor.name;par[t]=(par[t]||0)+1;});c.noeudsParType=par;
 var vi={};W.nodes.forEach(function(n){if(n.__ou)vi[n.__ou]=(vi[n.__ou]||0)+1;});c.vivantesParAppelant=vi;c.creesParAppelant=W.OU||{};c.rc=AC&&typeof AC.renderCapacity;c.worklet=!!(AC&&AC.audioWorklet);c.mv=(typeof dbgMV==='function')?'dbgMV':null;return JSON.stringify(c);}catch(e){return JSON.stringify({err:String(e&&e.stack||e)});}})()"""
def son(dossier,cran,qs,carte,secondes):
    http,port,srv,ch,prof=lance(dossier)
    try:
        c=CDP(port);c.keep={'Runtime.exceptionThrown'};m=carte.split(':')
        sv=dict(gp.SAVE);sv['vdep']=cran;sv['ex']={'eng':29,'runs':9};sv['sfx']=True;sv['mus']=True;sv['vox']=True
        base='http://127.0.0.1:%d'%http
        for mm in ('Network.enable','Page.enable','Runtime.enable'):c.call(mm)
        if not demarre(c,http,'?garde=1&palier=2&tel=1&pistegraine=777&carte=%s&meteo=%s'%(m[0],m[1])+qs,save=sv,hook=HOOK_SON):return None
        c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{nit:1});1");c.pump(3)
        out={'t0':json.loads(c.ev(SON_MESURE) or '{"err":"vide"}')}
        c.ev("(function(){var AC=window.__SON.ac();if(AC&&AC.renderCapacity){window.__RC=[];AC.renderCapacity.addEventListener('update',function(e){window.__RC.push([e.averageLoad,e.peakLoad,e.underrunRatio]);});AC.renderCapacity.start({updateInterval:1});}return 1})()")
        c.call('Emulation.setCPUThrottlingRate',rate=4);c.call('Profiler.enable');c.call('Profiler.start');c.ev(SAMPLEUR)
        c.ev("window.__S.length=0;window.__Son=true;1")
        c.pump(secondes)
        out['profil']=profil(c.call('Profiler.stop')['profile'],secondes*1000);c.ev("window.__Son=false;1");out['frames']=json.loads(c.ev("JSON.stringify(window.__S)"));c.call('Emulation.setCPUThrottlingRate',rate=1)
        out['t1']=json.loads(c.ev(SON_MESURE) or '{"err":"vide"}');out['rc']=json.loads(c.ev("JSON.stringify(window.__RC||null)"));out['secondes']=secondes
        return out
    finally:ferme(srv,ch,prof)

OMBRE_JS=r"""(function(mode){var S=dbgScene(),R=S.rdr,gl=R.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');if(!ext)return 'pas de chrono GPU';
 var W=window.__OM={ms:[],ombreCalls:0,ombreTri:0,frames:0,dep:[],q:[],mode:mode,n:0};
 var sm=R.shadowMap,o=sm.render.bind(sm),dc=0,tri=0,inS=false;
 ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced'].forEach(function(n){var f=gl[n];gl[n]=function(m,c){if(inS){W.ombreCalls++;if(m===gl.TRIANGLES)W.ombreTri+=(c/3)|0;}return f.apply(this,arguments);};});
 W.srcalls=0;if(mode==='ombre'){sm.render=function(a,b){W.srcalls++;var Q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,Q);inS=true;o(a,b);inS=false;gl.endQuery(ext.TIME_ELAPSED_EXT);W.q.push(Q);};}
 else{sm.render=function(a,b){W.srcalls++;inS=true;o(a,b);inS=false;};}
 var last=null,car=S.car,p0=car.position.clone();
 function fr(){W.frames++;
  if(mode==='plein'){if(last)gl.endQuery(ext.TIME_ELAPSED_EXT);var Q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,Q);W.q.push(Q);last=Q;}
  var d=car.position.distanceTo(p0);if(d<500)W.dep.push(d);p0.copy(car.position);
  for(var i=W.q.length-1;i>=0;i--){var Q2=W.q[i];if(Q2===last)continue;if(gl.getQueryParameter(Q2,gl.QUERY_RESULT_AVAILABLE)){if(!gl.getParameter(ext.GPU_DISJOINT_EXT))W.ms.push(gl.getQueryParameter(Q2,gl.QUERY_RESULT)/1e6);gl.deleteQuery(Q2);W.q.splice(i,1);}}
  if(W.frames<240)requestAnimationFrame(fr);else W.fini=true;}requestAnimationFrame(fr);return 'ok';})"""
def ombre(dossier,cran,plus,mode,qs):
    http,port,srv,ch,prof=lance(dossier)
    try:
        c=CDP(port);c.keep={'Runtime.exceptionThrown'}
        sv=dict(gp.SAVE);sv['vdep']=cran;sv['ex']={'eng':29,'runs':9}
        if not demarre(c,http,'?garde=1&palier=2&tel=1&pistegraine=777&carte=nuages&meteo=midi'+qs,save=sv):return None
        c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{nit:1});1")
        for i in range(plus):c.ev("dbgMoteur();1");c.pump(.5)
        c.pump(6)
        r=c.ev("("+OMBRE_JS+")(%s)"%json.dumps(mode))
        for i in range(40):
            if c.ev("!!window.__OM.fini"):break
            c.pump(1)
        c.pump(1)
        return {'mode':mode,'retour':r,'om':json.loads(c.ev("JSON.stringify((function(){var W=window.__OM;return {ms:W.ms,frames:W.frames,ombreCalls:W.ombreCalls,ombreTri:W.ombreTri,dep:W.dep,sm:[dbgScene().rdr.shadowMap.enabled,dbgScene().rdr.shadowMap.autoUpdate,dbgScene().rdr.shadowMap.type,W.srcalls,W.ombreCalls]}})())")),'nette':c.ev("JSON.stringify(dbgNette())")}
    finally:ferme(srv,ch,prof)

def cpu_types(prof):
    """secondes de processeur cumulées par type de processus Chrome de CE banc (renderer, gpu, utility, browser)"""
    out=subprocess.run(['ps','-axo','pid=,cputime=,command='],capture_output=True,text=True).stdout.splitlines()
    R={}
    for l in out:
        if prof not in l:continue
        parts=l.strip().split(None,2)
        if len(parts)<3:continue
        t=parts[1];h=0
        try:
            segs=t.split(':');sec=float(segs[-1])+60*int(segs[-2])+(3600*int(segs[-3]) if len(segs)>2 else 0)
        except Exception:continue
        m=[x for x in parts[2].split() if x.startswith('--type=')]
        k=m[0][7:] if m else 'browser'
        if 'audio' in parts[2] and k=='utility':k='utility-audio'
        R[k]=R.get(k,0)+sec
    return R
def energie(dossier,cran,qs,carte,secondes,sfx,mus,vox):
    http,port,srv,ch,prof=lance(dossier)
    try:
        c=CDP(port);c.keep={'Runtime.exceptionThrown'};m=carte.split(':')
        sv=dict(gp.SAVE);sv['vdep']=cran;sv['ex']={'eng':29,'runs':9};sv['sfx']=bool(sfx);sv['mus']=bool(mus);sv['vox']=bool(vox)
        if not demarre(c,http,'?garde=1&palier=2&tel=1&pistegraine=777&carte=%s&meteo=%s'%(m[0],m[1])+qs,save=sv):return None
        c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{nit:1});1");c.pump(8)
        c.ev(SAMPLEUR);a=cpu_types(os.path.basename(prof));c.ev("window.__S.length=0;window.__Son=true;1");t0=time.time();c.pump(secondes)
        b=cpu_types(os.path.basename(prof));dt=time.time()-t0;c.ev("window.__Son=false;1")
        F=json.loads(c.ev("JSON.stringify(window.__S)"))
        ac=c.ev("JSON.stringify((function(){var W=window.__SON;return W?[W.S.dem,W.S.fin]:null})())")
        return {'sfx':sfx,'mus':mus,'vox':vox,'duree':round(dt,1),'cpu_s_par_s':{k:round((b.get(k,0)-a.get(k,0))/dt,3) for k in set(a)|set(b)},'images':len(F),'p50':sorted(f[0] for f in F)[len(F)//2] if F else None,'charge':os.getloadavg()[0]}
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
    elif m=='graphe':
        r=graphe(sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),sys.argv[5],sys.argv[6])
        json.dump(r,open(os.environ.get('SORTIE','/tmp/vitesse-graphe.json'),'w'),indent=1);print('ok')
    elif m=='son':
        r=son(sys.argv[2],int(sys.argv[3]),sys.argv[4],sys.argv[5],float(sys.argv[6]))
        json.dump(r,open(os.environ.get('SORTIE','/tmp/vitesse-son.json'),'w'),indent=1);print('ok')
    elif m=='ombre':
        r=ombre(sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),sys.argv[5],sys.argv[6] if len(sys.argv)>6 else '')
        json.dump(r,open(os.environ.get('SORTIE','/tmp/vitesse-ombre.json'),'w'));print('ok')
    elif m=='energie':
        r=energie(sys.argv[2],int(sys.argv[3]),sys.argv[4],sys.argv[5],float(sys.argv[6]),int(sys.argv[7]),int(sys.argv[8]),int(sys.argv[9]))
        json.dump(r,open(os.environ.get('SORTIE','/tmp/vitesse-energie.json'),'w'));print('ok',r)
    elif m=='course':
        r=course(sys.argv[2],float(sys.argv[3]) if len(sys.argv)>3 else 180,sys.argv[4] if len(sys.argv)>4 else '')
        json.dump(r,open(os.environ.get('SORTIE','/tmp/vitesse-course.json'),'w'));print(len(r or []),'images')
