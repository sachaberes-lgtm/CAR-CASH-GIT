#!/usr/bin/env python3
"""LE BANC DU LOT FLUSHTOT (2026-11-18) : le flush tôt ne change RIEN à l'image.
    ~/cash-car/verrou-banc.sh prendre "auteur-flushtot" ; python3 outils/banc-flushtot/banc.py ; ~/cash-car/verrou-banc.sh rendre
Chrome sans fenêtre, MUET (--mute-audio, sfx/mus/vox faux), déguisé en iPhone 13 Pro (`?tel=1` : ALLEGE vrai, le chemin du téléphone), ports 9961/9962.
1) Défaut : une course (pilote auto), puis la simulation FIGÉE (dbgFlushtot({fige:1}) : la boucle redessine la même image). Images faites à la main (dbgStep(1,33)),
   le flush allumé ou éteint selon un motif 0 0 1 1 0 1 0 1 1 0 : pour chacune, la toile entière lue dans le même rappel (readPixels du tampon par défaut, avant
   présentation), son empreinte (FNV-1a sur tous les octets), et les comptes renderer.info cumulés sur toute l'image (appels, triangles, points, lignes, programmes).
   ⚠ Figée, la simulation ne l'est pas pour les nuanciers animés et les effets d'une image sur deux : deux images de boucle de suite DIFFÈRENT toujours (1re passe
   du 18/11 : dix empreintes pour dix images, flush ou pas). On juge donc la boucle réelle sur ses comptes (les jeux de comptes des images dessinées sont les mêmes
   avec et sans) et sur les flushs (1 par image dessinée allumée, 0 sinon), et L'IMAGE sur « la même image trois fois » : dans un même rappel, rendu A, rendu +
   flush B, rendu C ; A = C (témoin : le rendu se répète au bit près) et A = B (le flush ne change aucun octet), avec les mêmes comptes.
   Les mêmes dix images au menu (garage) après la course.
2) `?sans=flushtot` : 40 images naturelles, FLUSHT.n reste 0 et dbgFlushtot().coupe est vrai.
Sortie : outils/banc-flushtot/mesures/banc.json (petit). Le profil Chrome est effacé à la fin.
"""
import sys,os,json,time,subprocess,urllib.request,tempfile,shutil,importlib.util as iu
ICI=os.path.dirname(os.path.abspath(__file__));BP=os.path.join(os.path.dirname(ICI),'banc-perf');sys.path.insert(0,BP)
sp=iu.spec_from_file_location('gels',os.path.join(BP,'gels.py'));G=iu.module_from_spec(sp);sp.loader.exec_module(G)
from cdp import CDP
G.HTTP,G.PORT=9961,9962
MOTIF=[0,0,1,1,0,1,0,1,1,0]
JS=r"""(function(motif){
 var O=window.__gpuObj;if(!O){try{dbgGpu({n:1});}catch(e){}O=window.__gpuObj;}
 var R=O.renderer,g=R.getContext(),cv=R.domElement,inf=R.info,nf={n:0},f0=g.flush;
 g.flush=function(){nf.n++;return f0.call(g);};
 dbgFlushtot({fige:1});dbgStep(4,33);
 var px=null,out=[];
 for(var i=0;i<motif.length;i++){
  dbgFlushtot({on:motif[i]});var n0=nf.n,m0=dbgFlushtot().n;
  inf.autoReset=false;inf.reset();var p0=inf.programs?inf.programs.length:0;
  dbgStep(1,33);
  var c={calls:inf.render.calls,tri:inf.render.triangles,pts:inf.render.points,lig:inf.render.lines,prog:inf.programs?inf.programs.length:0,geo:inf.memory.geometries,tex:inf.memory.textures};
  inf.autoReset=true;
  R.setRenderTarget(null);var w=g.drawingBufferWidth,h=g.drawingBufferHeight;if(!px||px.length!==w*h*4)px=new Uint8Array(w*h*4);
  g.readPixels(0,0,w,h,g.RGBA,g.UNSIGNED_BYTE,px);
  var hs=2166136261>>>0,nz=0;for(var k=0;k<px.length;k++){hs^=px[k];hs=Math.imul(hs,16777619)>>>0;}for(var k=0;k<px.length;k+=4096)if(px[k]|px[k+1]|px[k+2])nz++;
  out.push({on:motif[i],emp:hs.toString(16),w:w,h:h,nonNoir:nz,comptes:c,flushTous:nf.n-n0,flushLot:dbgFlushtot().n-m0,err:g.getError()});
 }
 /* LA MÊME IMAGE TROIS FOIS (la simulation figée ne l'est pas pour les nuanciers animés : deux images de boucle de suite diffèrent toujours, flush ou pas).
    Dans UN rappel : rendu A · rendu + flush B · rendu C (témoin). A = C prouve que le rendu se répète au bit près ; A = B que le flush n'y change rien. Cinq fois. */
 var C=O.composer,tri=[];function lit(){R.setRenderTarget(null);g.readPixels(0,0,w0,h0,g.RGBA,g.UNSIGNED_BYTE,px);var hs=2166136261>>>0;for(var k=0;k<px.length;k++){hs^=px[k];hs=Math.imul(hs,16777619)>>>0;}return hs.toString(16);}
 var w0=g.drawingBufferWidth,h0=g.drawingBufferHeight;px=new Uint8Array(w0*h0*4);
 /* l'horloge et le hasard GELÉS le temps des trois rendus (des nuanciers lisent performance.now ou Math.random dans onBeforeRender : sans ça, A ≠ C, 2e passe du 18/11) */
 var pn=performance.now,dn=Date.now,mr=Math.random,T0=pn.call(performance);
 function gele(){performance.now=function(){return T0;};Date.now=function(){return 1794970000000;};var q=0;Math.random=function(){q=(q*16807+12345)%2147483647;return q/2147483647;};}
 function degele(){performance.now=pn;Date.now=dn;Math.random=mr;}
 /* HUIT rendus de suite par moment, flush selon P = 0 0 1 1 0 0 1 1 (des effets alternent d'un rendu à l'autre : on compare à parité égale).
    Pour chaque rendu : son empreinte, et ses pixels différents du rendu 0 et du rendu 1. Le flush ne change rien si, à parité égale, un rendu flushé
    ne s'écarte pas plus de son témoin qu'un rendu sans flush (rendu 4 contre 0, 5 contre 1 : témoins ; 2 et 6 contre 0, 3 et 7 contre 1 : flushés). */
 var P=[0,0,1,1,0,0,1,1],r0=null,r1=null;
 function ecart(a){var n=0;for(var k=0;k<px.length;k+=4)if(px[k]!==a[k]||px[k+1]!==a[k+1]||px[k+2]!==a[k+2]||px[k+3]!==a[k+3])n++;return n;}
 function rend(fl){gele();inf.autoReset=false;inf.reset();try{if(C)C.render();else R.render(O.scene,O.camera);}finally{degele();}if(fl)g.flush();var c=[inf.render.calls,inf.render.triangles,inf.render.points,inf.render.lines];inf.autoReset=true;return {e:lit(),c:c};}
 for(var r=0;r<5;r++){dbgStep(1,33);var L=[];for(var i=0;i<8;i++){var x=rend(P[i]);x.f=P[i];x.d0=r0?ecart(r0):0;x.d1=r1?ecart(r1):0;if(i===0)r0=px.slice();if(i===1)r1=px.slice();L.push(x);}r0=r1=null;tri.push(L);}
 g.flush=f0;dbgFlushtot({on:1});dbgFlushtot({fige:0});
 return JSON.stringify({boucle:out,triple:tri,composer:!!C});})(__MOTIF__)"""
def juge(nom,X):
    L=X['boucle'];T=X['triple']
    des=[x for x in L if x['comptes']['calls']>0]
    jeu=lambda on:sorted(set((x['comptes']['calls'],x['comptes']['tri'],x['comptes']['pts'],x['comptes']['lig']) for x in des if x['on']==on))
    fl=all(x['flushLot']==(x['on'] if x['comptes']['calls']>0 else 0) for x in L)
    okc=jeu(0)==jeu(1)
    okt=True;lig=[]
    for M in T:
        tem=[M[4]['d0'],M[5]['d1']];avf=[M[2]['d0'],M[6]['d0'],M[3]['d1'],M[7]['d1']]
        cpt=len(set(json.dumps(x['c']) for x in M[0::2]))==1 and len(set(json.dumps(x['c']) for x in M[1::2]))==1
        b=cpt and max(avf)<=max(tem)
        okt&=b;lig.append('%s témoins %s · flushés %s'%('✔' if b else '✘',tem,avf))
    ok=fl and okt and all(x['err']==0 for x in L) and L[0]['nonNoir']>0
    print('%s %s (toile %dx%d) :'%('✔' if ok else '✘',nom,L[0]['w'],L[0]['h']))
    print('   boucle réelle, %d images (%d dessinées, les autres sautées par la cadence) : comptes des images dessinées SANS %s · AVEC %s · %s'%(len(L),len(des),jeu(0),jeu(1),'mêmes jeux' if okc else 'pas les mêmes images tirées (indicatif : un effet une image sur deux)'))
    print('   flush du lot par image %s (motif %s, 0 si l\'image est sautée) %s'%([x['flushLot'] for x in L],[x['on'] for x in L],'✔' if fl else '✘'))
    print('   même image, 8 rendus de suite par moment (flush 0 0 1 1 0 0 1 1 ; horloge et hasard gelés), pixels différents à parité égale :')
    for k,l in enumerate(lig):print('     moment %d : %s · comptes pair %s impair %s'%(k+1,l,T[k][0]['c'],T[k][1]['c']))
    return ok
def main():
    import signal
    def trop(*a):raise SystemExit('banc trop long (11,5 min) : arrêté, Chrome tué')
    signal.signal(signal.SIGALRM,trop);signal.alarm(690) # passe de moins de 12 min (le verrou est repris après 15)
    R={'charge0':round(os.getloadavg()[0],1)};ok=True
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(G.HTTP),'--bind','127.0.0.1'],cwd=G.VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='banc-flushtot-')
    ch=subprocess.Popen([G.chrome(),'--headless=new','--remote-debugging-port=%d'%G.PORT,'--user-data-dir='+prof,'--mute-audio','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    t0=time.time()
    try:
        for i in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%G.PORT,timeout=2).read();break
            except Exception:pass
        c=CDP(G.PORT);c.keep={'Runtime.exceptionThrown'};G.ouvre(c,'&carte=nuages')
        R['etat0']=c.ev("JSON.stringify(dbgFlushtot())");print('chargé',round(time.time()-t0),'s',R['etat0'])
        if not G.jouer(c):raise SystemExit('JOUER ne part pas')
        c.ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1");c.pump(8)
        R['course']=json.loads(c.ev(JS.replace('__MOTIF__',json.dumps(MOTIF)),timeout=240));ok&=juge('course figée',R['course'])
        c.ev("dbgImmortel(false);try{dbgDeathNow()}catch(e){};1");c.pump(10)
        R['vol']=c.ev("JSON.stringify(dbgBoiteVol('tout'))") or '[]';R['vol']=[{'flt':x.get('flt'),'dur':x.get('dur')} for x in (json.loads(R['vol']) if isinstance(json.loads(R['vol']),list) else [])]
        R['menu']=json.loads(c.ev(JS.replace('__MOTIF__',json.dumps(MOTIF)),timeout=240));ok&=juge('après la course (écran de mort / menu)',R['menu'])
        R['etat1']=c.ev("JSON.stringify(dbgFlushtot())")
        c.call('Page.navigate',url='http://127.0.0.1:%d/index.html?garde=1&tel=1&appareil=iPhone14,2&perfrec=2&carte=nuages&sans=flushtot'%G.HTTP)
        if not G.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):raise SystemExit('?sans=flushtot ne démarre pas')
        c.pump(2);a=c.ev("dbgFlushtot().n");c.pump(3);e=json.loads(c.ev("JSON.stringify(Object.assign(dbgFlushtot(),{img:window.__imagesJeu|0}))"))
        R['sans']=e;b=e['coupe'] and e['n']==0 and not e['on'];ok&=b
        print('%s ?sans=flushtot : %s'%('✔' if b else '✘',e))
        R['exceptions']=[(x['params']['exceptionDetails'].get('exception',{}).get('description') or '')[:200] for x in c.events if x['method']=='Runtime.exceptionThrown']
    finally:
        for p in (ch,srv):
            try:p.terminate();p.wait(5)
            except Exception:
                try:p.kill()
                except Exception:pass
        shutil.rmtree(prof,ignore_errors=True)
    R['ok']=bool(ok);R['duree_s']=round(time.time()-t0);R['charge1']=round(os.getloadavg()[0],1)
    os.makedirs(os.path.join(ICI,'mesures'),exist_ok=True);json.dump(R,open(os.path.join(ICI,'mesures','banc.json'),'w'),indent=1,ensure_ascii=False)
    print('exceptions',len(R.get('exceptions',[])),R.get('exceptions',[])[:3],'· vol',R.get('vol'),'·',R['duree_s'],'s ·',('TOUT BON' if ok else 'ÉCHEC'))
if __name__=='__main__':main()
