#!/usr/bin/env python3
"""LE BANC DU LOT FLUSHTOT (2026-11-18) : le flush tôt ne change RIEN à l'image.
    ~/cash-car/verrou-banc.sh prendre "auteur-flushtot" ; python3 outils/banc-flushtot/banc.py ; ~/cash-car/verrou-banc.sh rendre
Chrome sans fenêtre, MUET (--mute-audio, sfx/mus/vox faux), déguisé en iPhone 13 Pro (`?tel=1` : ALLEGE vrai, le chemin du téléphone), ports 9961/9962.
1) Défaut : une course (pilote auto), puis la simulation FIGÉE (dbgFlushtot({fige:1}) : la boucle redessine la même image). Images faites à la main (dbgStep(1,33)),
   le flush allumé ou éteint selon un motif 0 0 1 1 0 1 0 1 1 0 : pour chacune, la toile entière lue dans le même rappel (readPixels du tampon par défaut, avant
   présentation), son empreinte (FNV-1a sur tous les octets), et les comptes renderer.info cumulés sur toute l'image (appels, triangles, points, lignes, programmes).
   Attendu : une seule empreinte et un seul jeu de comptes pour les dix images ; flush comptés = 1 par image allumée, 0 éteinte.
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
 g.flush=f0;dbgFlushtot({on:1});dbgFlushtot({fige:0});
 return JSON.stringify(out);})(%s)"""
def juge(nom,L):
    emp=set(x['emp'] for x in L);cpt=set(json.dumps(x['comptes'],sort_keys=True) for x in L)
    fl=all(x['flushLot']==x['on'] for x in L);ok=len(emp)==1 and len(cpt)==1 and fl and all(x['err']==0 for x in L) and L[0]['nonNoir']>0
    print('%s %s : %d images, empreintes %s, comptes %s, flush du lot par image %s, toile %dx%d (%d points non noirs sur %d sondés)'%('✔' if ok else '✘',nom,len(L),sorted(emp),[json.loads(c) for c in cpt],[x['flushLot'] for x in L],L[0]['w'],L[0]['h'],L[0]['nonNoir'],L[0]['w']*L[0]['h']//1024))
    return ok
def main():
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
        R['course']=json.loads(c.ev(JS%json.dumps(MOTIF),timeout=240));ok&=juge('course figée',R['course'])
        c.ev("dbgImmortel(false);try{dbgDeathNow()}catch(e){};1");c.pump(10)
        R['vol']=c.ev("JSON.stringify(dbgBoiteVol('tout'))") or '[]';R['vol']=[{'flt':x.get('flt'),'dur':x.get('dur')} for x in (json.loads(R['vol']) if isinstance(json.loads(R['vol']),list) else [])]
        R['menu']=json.loads(c.ev(JS%json.dumps(MOTIF),timeout=240));ok&=juge('après la course (écran de mort / menu)',R['menu'])
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
