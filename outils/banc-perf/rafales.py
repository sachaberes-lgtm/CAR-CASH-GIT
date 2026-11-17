#!/usr/bin/env python3
"""LE BANC DU LOT « MESURE-RAFALES » (2026-11-17 — voir passation/qualite/mesure-rafales.md).

    python3 outils/banc-perf/rafales.py

Chrome sans fenêtre, MUET, format iPhone 13 Pro (`?tel=1&appareil=iPhone14,2`), comme gels.py (serveur 9931, Chrome 9932).
Prendre le verrou avant (~/cash-car/verrou-banc.sh prendre rafales), le rendre après (lire qui le tient d'abord).
  A. SANS perfrec : 12 s de course ; les COMPTEURS du lot restent à zéro (aucune sous-tranche nommée, aucun appel enveloppé, aucune passe enveloppée),
     les prototypes WebGL / Canvas 2D sont ceux du navigateur ([native code]), pas de window.__MG.
  B. AVEC perfrec=2 et `&sans=rafales` (le mouchard d'avant), puis C. AVEC perfrec=2 : le travail moyen par image (boîte de vol), à ×1 — le coût du lot.
  C (suite). 12 images lourdes provoquées DANS b4 (dbgMouchard('lourd',90,12)), puis quelques secondes au processeur bridé ×CPU (12 par défaut),
     une fausse sonde native (window.__ccSw posé chaque seconde comme le ferait JeuViewController.swift) ; la course finie, la boîte de vol est relue :
     largeur de M (27), lignes G (51 colonnes), lignes H, noms des sous-tranches, référence SR, appels par nom (Y). Le vol est passé à analyse-vol.py.
  Exceptions de la page : comptées (Runtime.exceptionThrown) sur les trois pages.
Sortie : outils/banc-perf/mesures/rafales.json (+ rafales-vol.json, la boîte de vol de C, et rafales-analyse.txt).
"""
import sys,os,json,time,subprocess,urllib.request,tempfile,shutil
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
from cdp import CDP
import importlib.util as _iu
_sp=_iu.spec_from_file_location('gels',os.path.join(ICI,'gels.py'));G=_iu.module_from_spec(_sp);_sp.loader.exec_module(G)
CPU=float(os.environ.get('CPU','12'));T=float(os.environ.get('T','25'));R={'cpu':CPU,'T':T}
NATIF="""(function(){
  var f=function(K,n){try{return /\\[native code\\]/.test(Function.prototype.toString.call(K.prototype[n]));}catch(e){return null;}};
  return JSON.stringify({getError:f(WebGL2RenderingContext,'getError'),drawElements:f(WebGL2RenderingContext,'drawElements'),getParameter1:f(WebGLRenderingContext,'getParameter'),
    putImageData:f(CanvasRenderingContext2D,'putImageData'),drawImage:f(CanvasRenderingContext2D,'drawImage'),MG:typeof window.__MG});})()"""
def ouvre(c,qs):
    base='http://127.0.0.1:%d'%G.HTTP
    for m in ('Network.enable','Page.enable','Runtime.enable'):c.call(m)
    c.call('Network.setBypassServiceWorker',bypass=True);c.call('Network.setCacheDisabled',cacheDisabled=True)
    try:c.call('Emulation.setFocusEmulationEnabled',enabled=True)
    except Exception:pass
    G.pivot(c,False);c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=5);c.call('Emulation.setUserAgentOverride',userAgent=G.UA,platform='iPhone')
    c.call('Page.navigate',url=base+'/icon.svg');time.sleep(1)
    c.ev("localStorage.clear();localStorage.setItem('cashcarSave',%s);1"%json.dumps(json.dumps(G.SAVE)))
    c.call('Page.navigate',url=base+'/index.html?garde=1&tel=1&appareil=iPhone14,2&pistegraine=777&carte=ville&meteo=midi'+qs)
    if not G.attend(c,"!!window.__gameReady&&typeof dbgState==='function'",240):sys.exit('le jeu ne démarre pas')
    c.pump(3)
def travail(vol):
    n=w=ms=0
    for k in vol:
        for b in k['B'].values():n+=b['n'];w+=b['w'];ms+=b['ms']
    return {'images':n,'travail_moy_ms':round(w/max(n,1),2),'i_s':round(1000*n/max(ms,1),1)}
def exc(c):
    e=[m for m in c.events if m.get('method')=='Runtime.exceptionThrown'];c.events=[]
    return [((m['params'].get('exceptionDetails') or {}).get('exception') or {}).get('description','?')[:200] for m in e]
def page_a(c):
    ouvre(c,'&perfrec=0');R['A_avant']=json.loads(c.ev(NATIF))
    if not G.jouer(c):sys.exit('JOUER ne part pas (A)')
    G.course(c,12)
    R['A']={'natif':json.loads(c.ev(NATIF)),'rafales':json.loads(c.ev("JSON.stringify(dbgMouchard('rafales'))")),'mouchard':json.loads(c.ev("JSON.stringify(dbgMouchard())")),
            'boite':json.loads(c.ev("JSON.stringify(dbgBoiteVol())")),'exceptions':exc(c),'loopErr':c.ev("window.__loopErr||null")}
    print('A',json.dumps(R['A'],ensure_ascii=False)[:900]);sys.stdout.flush()
def page_cout(c,cle,qs):
    ouvre(c,'&perfrec=2'+qs)
    if not G.jouer(c):sys.exit('JOUER ne part pas (%s)'%cle)
    c.ev("dbgBoiteVol('vide');1");G.course(c,T)
    c.ev(G.CACHE%'true');c.pump(.5)
    vol=json.loads(c.ev("JSON.stringify(dbgBoiteVol('tout'))"));R[cle]=travail(vol);R[cle]['charge']=round(os.getloadavg()[0],1);R[cle]['exceptions']=exc(c)
    print(cle,json.dumps(R[cle]));sys.stdout.flush()
    c.ev(G.CACHE%'false')
    return vol
def page_c(c):
    ouvre(c,'&perfrec=2')
    R['C_natif']=json.loads(c.ev(NATIF))
    if not G.jouer(c):sys.exit('JOUER ne part pas (C)')
    c.ev("dbgBoiteVol('vide');window.__bancSw=setInterval(function(){window.__ccSw=[0,25+((Math.random()*3)|0),3];window.__ccSwN=(window.__ccSwN|0)+1;},1000);1")
    G.course(c,10)
    R['C_lourd']=c.ev("dbgMouchard('lourd',90,12)");c.pump(6)
    c.call('Emulation.setCPUThrottlingRate',rate=CPU);c.pump(10);c.call('Emulation.setCPUThrottlingRate',rate=1);c.pump(4)
    R['C_rafales']=json.loads(c.ev("JSON.stringify(dbgMouchard('rafales'))"))
    c.ev(G.CACHE%'true');c.pump(.5)
    vol=json.loads(c.ev("JSON.stringify(dbgBoiteVol('tout'))"))
    k=vol[-1] if vol else {}
    W=k.get('Mw');M=k.get('M') or [];Gs=k.get('G') or [];H=k.get('H') or []
    R['C']={'Mw':W,'M_secondes':len(M)//max(1,W or 1),'M_multiple':(len(M)%(W or 1)==0),'G_lignes':len(Gs),'G_largeurs':sorted(set(len(g) for g in Gs)),'H_lignes':len(H),
            'H_loop_ms':[h[1]/10 for h in H][:30],'HN':k.get('HN'),'SRn':k.get('SRn'),'Y':k.get('Y'),'M_natif_24_26':[M[i+24:i+27] for i in range(0,len(M)-26,W)][:6] if W else None,
            'M_17_23':[M[i+17:i+24] for i in range(0,len(M)-23,W)][-8:] if W else None,'G_40_50':[g[40:51] for g in Gs][:12],
            'H_exemples':H[:3],'exceptions':exc(c),'loopErr':c.ev("window.__loopErr||null")}
    print('C',json.dumps(R['C'],ensure_ascii=False)[:2500]);sys.stdout.flush()
    c.ev(G.CACHE%'false')
    return vol
def page_pouls(c,qs,cle):
    # (SEUL=pouls) l'interrupteur `?sans=pouls` : sans lui le pouls existe (MessageChannel) ; avec, rien n'est posé et G[37] reste à -1
    ouvre(c,'&perfrec=2'+qs)
    if not G.jouer(c):sys.exit('JOUER ne part pas (%s)'%cle)
    c.ev("dbgBoiteVol('vide');1");G.course(c,6);c.ev("dbgMouchard('gel',150)");c.pump(3);c.ev("dbgMouchard('gel',150)");c.pump(3)
    pc=c.ev("window.__MG.pc!==null");c.ev(G.CACHE%'true');c.pump(.5)
    vol=json.loads(c.ev("JSON.stringify(dbgBoiteVol('tout'))"));Gs=[g for k in vol for g in (k.get('G') or [])]
    R[cle]={'pouls_pose':pc,'G37':[g[37] for g in Gs],'exceptions':exc(c)};print(cle,json.dumps(R[cle]));sys.stdout.flush();c.ev(G.CACHE%'false')
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
        c=CDP(G.PORT);c.keep={'Runtime.exceptionThrown'}
        if os.environ.get('SEUL')=='pouls':
            page_pouls(c,'','P_avec_pouls');page_pouls(c,'&sans=pouls','P_sans_pouls');return fin_seul()
        page_a(c)
        if not os.environ.get('SANS_COUT'):
            page_cout(c,'B_sans_rafales','&sans=rafales');page_cout(c,'B_avec_rafales','')
        vol=page_c(c)
    finally:
        ch.kill();srv.kill();shutil.rmtree(prof,ignore_errors=True)
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
