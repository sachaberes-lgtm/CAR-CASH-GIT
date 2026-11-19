#!/usr/bin/env python3
"""LE BANC DU LOT « MESURE-RAFALES » (2026-11-17 — voir passation/qualite/mesure-rafales.md).

    python3 outils/banc-perf/rafales.py

Chrome sans fenêtre, MUET, format iPhone 13 Pro (`?tel=1&appareil=iPhone14,2`), comme gels.py (serveur 9931, Chrome 9932).
Prendre le verrou avant (~/cash-car/verrou-banc.sh prendre rafales), le rendre après (lire qui le tient d'abord).
  A. SANS perfrec : 12 s de course ; les COMPTEURS du lot restent à zéro (aucune sous-tranche nommée, aucun appel enveloppé, aucune passe enveloppée),
     les prototypes WebGL / Canvas 2D sont ceux du navigateur ([native code]), pas de window.__MG.
  B. AVEC perfrec=2 et `&sans=rafales` (le mouchard d'avant), puis AVEC perfrec=2 seul : le travail moyen par image (boîte de vol), à ×1 — le coût du lot.
  J. LE JEU ENTIER avec perfrec=2 : menu (aucune sentinelle de début), départ, course, 12 loops lourdes provoquées DANS b4 (dbgMouchard('lourd',90,12)), processeur bridé
     ×CPU (12 par défaut) 8 s, une RAFALE « fil entier » (bridé ×CPU2 + dbgMouchard('fil',FIL) : une image sur 3, +FIL ms à chaque borne b2…rendu, 9 s), fausse sonde
     native (window.__ccSw), portail vers les nuages, pause 5 s (aucune sentinelle de début), reprise, MORT (la course 1 se ferme d'elle-même, relue SANS cacher l'onglet),
     retour au menu par la MAISON (aucune sentinelle), 2e course (loops et sentinelles comptées). La course 1 (M 27, G 51, lignes c.LH, noms c.LHN, passes, SR, SY, Y)
     passe à analyse-vol.py : son bloc RAFALES doit sortir la rafale provoquée.
  N. (BASE=chemin de l'index de origin/qualite-appareil) BASE puis TÊTE SANS DRAPEAU : prototypes natifs dès la page prête et après 10 s de course, rAF par seconde, pannes.
  Pannes de chaque page : exceptions (Runtime.exceptionThrown), console.error, et les pannes que la boucle avale (loopWarnN, console.warn « image · … »).
  Le coût du lot (B) : travail moyen par image avec / sans, et les COMPTEURS (sentinelles et appels enveloppés par image, ms dedans).
Sortie : outils/banc-perf/mesures/rafales.json (+ rafales-vol.json, la course 1 de J, et rafales-analyse.txt).
"""
import sys,os,json,time,subprocess,urllib.request,tempfile,shutil
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
from cdp import CDP
import importlib.util as _iu
_sp=_iu.spec_from_file_location('gels',os.path.join(ICI,'gels.py'));G=_iu.module_from_spec(_sp);_sp.loader.exec_module(G)
CPU=float(os.environ.get('CPU','12'));T=float(os.environ.get('T','25'));CPU2=float(os.environ.get('CPU2','6'));FIL=float(os.environ.get('FIL','14'));NFIL=int(os.environ.get('NFIL','400'))
BASE=os.environ.get('BASE')  # (3e tour) l'index.html de la BASE (origin/qualite-appareil, assemblé ailleurs) : copié le temps du banc sous VERSION PRINCIPALE/_base-rafales.html
R={'cpu':CPU,'T':T,'cpu2':CPU2,'fil':FIL}
NATIF="""(function(){
  var f=function(K,n){try{return /\\[native code\\]/.test(Function.prototype.toString.call(K.prototype[n]));}catch(e){return null;}};
  return JSON.stringify({getError:f(WebGL2RenderingContext,'getError'),drawElements:f(WebGL2RenderingContext,'drawElements'),getParameter1:f(WebGLRenderingContext,'getParameter'),
    putImageData:f(CanvasRenderingContext2D,'putImageData'),drawImage:f(CanvasRenderingContext2D,'drawImage'),MG:typeof window.__MG});})()"""
def ouvre(c,qs,page='index.html'):
    base='http://127.0.0.1:%d'%G.HTTP
    for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    G.pivot(c,False);c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=G.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(G.SAVE)))
    c.call('Page.navigate',url=base+'/'+page+'?garde=1&tel=1&appareil=iPhone14,2&pistegraine=777&carte=ville&meteo=midi'+qs)
    if not G.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):sys.exit('le jeu ne démarre pas')
    c.pump(3)
def travail(vol):
    n=w=ms=0
    for k in vol:
        for b in k['B'].values():n+=b['n'];w+=b['w'];ms+=b['ms']
    return {'images':n,'travail_moy_ms':round(w/max(n,1),2),'i_s':round(1000*n/max(ms,1),1)}
def page_a(c):
    ouvre(c,'&perfrec=0');R['A_avant']=json.loads(c.ev(NATIF))
    if not G.jouer(c):sys.exit('JOUER ne part pas (A)')
    G.course(c,12)
    R['A']={'natif':json.loads(c.ev(NATIF)),'rafales':raf(c),'mouchard':json.loads(c.ev("JSON.stringify(dbgMouchard())")),
            'pannes':pannes(c),'loopErr':c.ev("window.__loopErr||null")}
    print('A',json.dumps(R['A'],ensure_ascii=False)[:900]);sys.stdout.flush()
def page_cout(c,cle,qs):
    ouvre(c,'&perfrec=2'+qs)
    if not G.jouer(c):sys.exit('JOUER ne part pas (%s)'%cle)
    c.ev("dbgBoiteVol('vide');1");G.course(c,T)
    c.ev(G.CACHE%'true');c.pump(.5)
    rf=raf(c);vol=json.loads(c.ev("JSON.stringify(dbgBoiteVol('tout'))"));R[cle]=travail(vol);R[cle]['charge']=round(os.getloadavg()[0],1);R[cle]['pannes']=pannes(c)
    n=max(1,R[cle]['images']);R[cle]['compteurs']={'sentinelles_debut':rf['senDebutN'],'ms_sentinelles_debut_par_image':round(rf['senDebutMs']/n,3),'sentinelles_rendu':rf['senRenduN'],
        'ms_sentinelles_rendu_par_image':round(rf['senRenduMs']/n,3),'appels_enveloppes_par_image':round(rf['appelsN']/n,1),'ms_dans_appels_par_image':round(rf['appelsMs']/n,2),'images':n,'dwM':rf.get('dwM')}
    print(cle,json.dumps(R[cle]));sys.stdout.flush()
    c.ev(G.CACHE%'false')
    return vol
def pannes(c):
    # les exceptions (Runtime.exceptionThrown) ET les pannes que la boucle avale (loopWarnN : console.warn « image · … », console.error)
    o=[]
    for m in c.events:
        if m.get('method')=='Runtime.exceptionThrown':o.append('EXC '+((m['params'].get('exceptionDetails') or {}).get('exception') or {}).get('description','?')[:200])
        elif m.get('method')=='Runtime.consoleAPICalled' and m['params'].get('type') in ('error','warning'):
            a=' '.join(str(x.get('value',x.get('description','')))[:160] for x in m['params'].get('args',[])[:2])
            if a.startswith('image ·') or m['params'].get('type')=='error':o.append(m['params']['type']+' '+a)
    c.events=[];return o
def raf(c):return json.loads(c.ev("JSON.stringify(dbgMouchard('rafales'))"))
def etape(c,J,nom,extra=None):
    r=raf(c);st=json.loads(c.ev("JSON.stringify((function(s){return {started:s.started,running:s.running,paused:s.paused,gameOver:s.gameOver,mode:s.mode}})(dbgState()))") or '{}')
    e={'etape':nom,'senDebutN':r['senDebutN'],'senRenduN':r['senRenduN'],'loops':r['loops'],'appelsN':r['appelsN'],'etat':st,'pannes':pannes(c),'loopErr':c.ev("window.__loopErr||null")}
    if extra:e.update(extra)
    J['etapes'].append(e);print('J',nom,json.dumps(e,ensure_ascii=False)[:400]);sys.stdout.flush();return r
def menu_js(c):
    # le VRAI retour à l'accueil (comme banc-iphone.js) : la modale éventuelle (seconde chance…), puis la MAISON de l'écran de mort ; vrai si l'accueil est affiché
    return c.ev("""(function(){try{var m=document.getElementById('modale');if(m&&m.classList.contains('on')){var b=m.querySelectorAll('.modB .pbtn');if(b.length)b[b.length-1].click();}}catch(e){}
      var e=[].slice.call(document.querySelectorAll('#mDead [data-m="menu"],[data-m="menu"]')).filter(function(x){var r=x.getBoundingClientRect();return r.width>0&&r.height>0})[0];if(e)e.click();
      var h=document.getElementById('mHome'),d=document.getElementById('mDead');return !!(h&&h.classList.contains('on')&&!(d&&d.classList.contains('on')));})()""")
def page_j(c):
    # LE JEU ENTIER sous ?perfrec=2 : menu, départ, course (12 loops lourdes, processeur bridé, RAFALE « fil entier » provoquée, fausse sonde native), portail, pause, reprise,
    # MORT (la course 1 se ferme d'elle-même : bvFinit sur gameOver — on la relit SANS cacher l'onglet, le jeu n'est jamais mis en pause par le banc), retour au menu, 2e course
    J=R['J']={'etapes':[]}
    ouvre(c,'&perfrec=2');J['natif']=json.loads(c.ev(NATIF))
    c.pump(6);r0=etape(c,J,'menu (6 s)')
    J['etapes'][0]['sentinelles_debut_au_menu']=r0['senDebutN']
    if not G.jouer(c):sys.exit('JOUER ne part pas (J)')
    etape(c,J,'départ')
    c.ev("dbgBoiteVol('vide');window.__bancSw=setInterval(function(){window.__ccSw=[0,25+((Math.random()*3)|0),3];window.__ccSwN=(window.__ccSwN|0)+1;},1000);1")
    t0=time.time();G.course(c,8);etape(c,J,'course 8 s')
    J['lourd']=c.ev("dbgMouchard('lourd',90,12)");c.pump(6);etape(c,J,'12 loops lourdes provoquées (b4)')
    c.call('Emulation.setCPUThrottlingRate',rate=CPU);c.pump(8);c.call('Emulation.setCPUThrottlingRate',rate=1);c.pump(3);etape(c,J,'processeur bridé ×%g, 8 s'%CPU)
    # LA RAFALE « FIL ENTIER » : processeur bridé ET, une image sur 3, +FIL ms à chaque borne b2…rendu (dbgMouchard('fil')) — toutes les tranches gonflent, comme au vol 1448
    a=time.time()-t0;c.call('Emulation.setCPUThrottlingRate',rate=CPU2);J['fil']=c.ev("dbgMouchard('fil',%g,%d,3)"%(FIL,NFIL));c.pump(9)
    c.call('Emulation.setCPUThrottlingRate',rate=1);J['fil_stop']=c.ev("dbgMouchard('fil',1,0)");b=time.time()-t0;c.pump(3);etape(c,J,'RAFALE fil entier (bridé ×%g + %g ms × 6 bornes, 1 image sur 3)'%(CPU2,FIL),{'fenetre_s':[round(a,1),round(b,1)]})
    J['portail']=c.ev("dbgClassique('nuages',null);dbgPortail(2600)");c.pump(12);etape(c,J,'portail → nuages')
    # (le JS du jeu est une seule fonction : rien n'est global) la pause passe par le VRAI panneau, comme la touche P
    c.ev("window.__panBascule();1");c.pump(1.5);a=raf(c);c.pump(5);b=etape(c,J,'pause 5 s (panneau)')
    J['etapes'][-1]['sentinelles_debut_en_pause']=b['senDebutN']-a['senDebutN']
    c.ev("window.__panBascule();1");c.pump(5);a=raf(c);c.pump(3);b=etape(c,J,'reprise (3-2-1) + 3 s');J['etapes'][-1]['sentinelles_debut_reprise']=b['senDebutN']-a['senDebutN']
    nv0=c.ev("dbgBoiteVol('tout').length")
    # (3e tour) une VRAIE mort : dbgDeathNow ne fait que lire le son de la mort (au 2e passage du banc la caisse ne mourait pas) ; dbgBoom() fait exploser la caisse,
    # la modale éventuelle (seconde chance) est refusée par son dernier bouton, et on attend gameOver
    J['mort']=[]
    for i in range(6):
        if c.ev("dbgState().gameOver"):break
        J['mort'].append(c.ev("""(function(){try{var m=document.getElementById('modale');if(m&&m.classList.contains('on')){var b=m.querySelectorAll('.modB .pbtn');if(b.length){b[b.length-1].click();return 'modale refusée';}}}catch(e){}
          dbgImmortel(false);dbgAuto(0);try{return JSON.stringify(dbgBoom())}catch(e){return 'x '+e}})()"""));c.pump(4)
    J['mort_ok']=c.ev("dbgState().gameOver");c.pump(4);etape(c,J,'mort (gameOver) + 4 s')
    vol=json.loads(c.ev("JSON.stringify(dbgBoiteVol('tout'))"));J['course1_fermee']={'courses_avant':nv0,'courses_apres':len(vol),'onglet_cache':c.ev("document.hidden")}
    ok=False
    for i in range(8):
        if menu_js(c):ok=True;break
        c.pump(2)
    c.pump(3);a=raf(c);c.pump(6);b=etape(c,J,'retour au menu 6 s',{'accueil_affiche':ok})
    J['etapes'][-1]['sentinelles_debut_au_menu']=b['senDebutN']-a['senDebutN'];J['etapes'][-1]['sentinelles_rendu_au_menu']=b['senRenduN']-a['senRenduN']
    if not G.jouer(c):J['course2']='JOUER ne repart pas'
    else:
        a=raf(c);G.course(c,10);b=etape(c,J,'2e course 10 s')
        J['course2']={'loops':b['loops']-a['loops'],'sentinelles_debut':b['senDebutN']-a['senDebutN'],'etat':J['etapes'][-1]['etat']}
    J['fin']=raf(c)
    return vol
def page_n(c,page,cle):
    # BASE / TÊTE SANS DRAPEAU (ni perfrec ni sans=) : les prototypes WebGL / 2D DÈS la page prête, puis après 10 s de course ; images par seconde (rAF compté) et pannes
    ouvre(c,'',page);R[cle]={'pret':json.loads(c.ev(NATIF))}
    if not G.jouer(c):R[cle]['jouer']=False;return
    c.ev("window.__nR=0;(function f(){window.__nR++;requestAnimationFrame(f);})();1");n0=c.ev("window.__nR");t=time.time();G.course(c,10);n1=c.ev("window.__nR")
    R[cle].update({'course':json.loads(c.ev(NATIF)),'raf_i_s':round((n1-n0)/(time.time()-t),1),'mouchard_on':c.ev("dbgMouchard().on"),
        'rafales':c.ev("(function(){try{var r=dbgMouchard('rafales');return [r.on,r.senDebutN,r.appelsN,r.loops]}catch(e){return 'x'}})()"),'pannes':pannes(c),'loopErr':c.ev("window.__loopErr||null")})
    print(cle,json.dumps(R[cle],ensure_ascii=False));sys.stdout.flush()
def resume_vol(vol):
    k=vol[-1] if vol else {}
    W=k.get('Mw');M=k.get('M') or [];Gs=k.get('G') or [];H=k.get('LH') or [];HN=k.get('LHN') or []
    m=[M[i:i+W] for i in range(0,len(M)-W+1,W)] if W else []
    imgs=sum(x[0] for x in m) or 1
    o={'Mw':W,'M_secondes':len(m),'M_multiple':(len(M)%(W or 1)==0),'G_lignes':len(Gs),'G_largeurs':sorted(set(len(g) for g in Gs)),'LH_lignes':len(H),
       'LH_loop_ms':[h[1]/10 for h in H][:30],'LH_avec_banc_lourd':sum(1 for h in H if any(HN[h[22+2*j]]=='banc · lourd exprès' for j in range(h[21]) if h[22+2*j]<len(HN))),
       'LH_avec_fil_entier':sum(1 for h in H if any(HN[h[22+2*j]]=='banc · fil entier exprès' for j in range(h[21]) if h[22+2*j]<len(HN))),'H_du_pilote':(type(k.get('H')).__name__,len(k.get('H') or [])),
       'HN':HN,'passes':[n for n in HN if n.startswith('passe ') or n.startswith('dont ')],'SRn':k.get('SRn'),'SY':k.get('SY'),'LHp':k.get('LHp'),'Gp':k.get('Gp'),'LHNp':k.get('LHNp'),
       'Y_top':sorted(((a,b) for a,b in (k.get('Y') or {}).items()),key=lambda z:-z[1][1])[:10],
       'M_natif_24_26':[x[24:27] for x in m][:6],'G_40_50':[g[40:51] for g in Gs][:8],'LH_exemples':H[:2],
       # le coût du lot par image (compteurs) : appels enveloppés par image de loop, sentinelle de début (moyenne M[23]) — par seconde de course
       'YR_reposes':k.get('YR'),'envois_par_seconde':[x[22] for x in m],'secondes_sans_envoi':sum(1 for x in m if x[22]==0),
       'appels_par_image':round(sum(x[18]+x[20]+x[22] for x in m)/imgs,1),'ms_appels_par_image':round(sum(x[17]+x[19]+x[21] for x in m)/10/imgs,2),
       'sentinelle_debut_moy_ms':round(sum(x[23] for x in m if x[23]>=0)/100/max(1,sum(1 for x in m if x[23]>=0)),3)}
    return o
def page_pouls(c,qs,cle):
    # (SEUL=pouls) l'interrupteur `?sans=pouls` : sans lui le pouls existe (MessageChannel) ; avec, rien n'est posé et G[37] reste à -1
    ouvre(c,'&perfrec=2'+qs)
    if not G.jouer(c):sys.exit('JOUER ne part pas (%s)'%cle)
    c.ev("dbgBoiteVol('vide');1");G.course(c,6);c.ev("dbgMouchard('gel',150)");c.pump(3);c.ev("dbgMouchard('gel',150)");c.pump(3)
    pc=c.ev("window.__MG.pc!==null");c.ev(G.CACHE%'true');c.pump(.5)
    vol=json.loads(c.ev("JSON.stringify(dbgBoiteVol('tout'))"));Gs=[g for k in vol for g in (k.get('G') or [])]
    R[cle]={'pouls_pose':pc,'G37':[g[37] for g in Gs],'pannes':pannes(c)};print(cle,json.dumps(R[cle]));sys.stdout.flush();c.ev(G.CACHE%'false')
def main():
    R['charge0']=round(os.getloadavg()[0],1)
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(G.HTTP),'--bind','127.0.0.1'],cwd=G.VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='banc-rafales-')
    ch=subprocess.Popen([G.chrome(),'--headless=new','--remote-debugging-port=%d'%G.PORT,'--user-data-dir='+prof,'--mute-audio','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    vol=None
    try:
        for i in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%G.PORT,timeout=2).read();break
            except Exception:pass
        c=CDP(G.PORT);c.keep={'Runtime.exceptionThrown','Runtime.consoleAPICalled'}
        if os.environ.get('SEUL')=='pouls':
            page_pouls(c,'','P_avec_pouls');page_pouls(c,'&sans=pouls','P_sans_pouls');return fin_seul()
        page_a(c)
        if not os.environ.get('SANS_COUT'):
            page_cout(c,'B_sans_rafales','&sans=rafales');page_cout(c,'B_avec_rafales','')
        vol=page_j(c);R['J']['vol']=resume_vol(vol);print('J vol',json.dumps(R['J']['vol'],ensure_ascii=False)[:2500]);sys.stdout.flush()
        if BASE:
            shutil.copyfile(BASE,os.path.join(G.VP,'_base-rafales.html'))
            page_n(c,'_base-rafales.html','N_base');page_n(c,'index.html','N_tete')
    finally:
        ch.kill();srv.kill();shutil.rmtree(prof,ignore_errors=True)
        try:os.remove(os.path.join(G.VP,'_base-rafales.html'))
        except Exception:pass
    ecrit(vol)
def fin_seul():
    out=os.path.join(ICI,'mesures','rafales-pouls.json');json.dump(R,open(out,'w'),ensure_ascii=False,indent=1);print('→',out)
def ecrit(vol):
    os.makedirs(os.path.join(ICI,'mesures'),exist_ok=True)
    out=os.path.join(ICI,'mesures','rafales.json');json.dump(R,open(out,'w'),ensure_ascii=False,indent=1)
    if vol:
        pv=os.path.join(ICI,'mesures','rafales-vol.json');json.dump(vol,open(pv,'w'),ensure_ascii=False)
        a=subprocess.run([sys.executable,os.path.join(ICI,'analyse-vol.py'),pv],capture_output=True,text=True)
        open(os.path.join(ICI,'mesures','rafales-analyse.txt'),'w').write(a.stdout+a.stderr)
        print('analyse-vol.py : code %d · %d lignes'%(a.returncode,len(a.stdout.splitlines())));print(a.stderr[-1500:])
    print('→',out)
if __name__=='__main__':main()
