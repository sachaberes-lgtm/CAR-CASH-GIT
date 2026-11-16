#!/usr/bin/env python3
"""LE BANC DE LA SENTINELLE (2026-11-16, lot SENTINELLE — voir passation/qualite/sentinelle.md).

    python3 outils/banc-perf/sentinelle.py            # la sentinelle suit-elle le bridage du processeur (×1 puis ×6) ? coûte-t-elle quelque chose ?

Chrome sans fenêtre, MUET, format iPhone 13 Pro (`?tel=1&appareil=iPhone14,2&perfrec=2`), comme outils/banc-perf/gels.py (même serveur 9931, Chrome 9932).
Prendre le verrou avant (~/cash-car/verrou-banc.sh prendre sentinelle), le rendre après.
  1. DEUX PAGES : `&sans=sentinelle,mgtemoin` (A) puis sans rien (B), chacune une course de T s au processeur ×1 :
     travail moyen par image (boîte de vol), images calculées /s → le coût (A, B, A2, B2 : B2 est allumée sans les sondes, à ×1 tout du long).
  2. Dans la page B, en course : 40 mesures de la sentinelle (dbgMouchard('sentinelle',40)) à ×1, puis ×6, puis ×1 ;
     et les colonnes M (sentinelle par seconde, passages du ramasse-miettes) de la course rangée.
Sortie : outils/banc-perf/mesures/sentinelle.json.
"""
import sys,os,json,time,subprocess,urllib.request,tempfile,shutil,statistics as st
ICI=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,ICI)
from cdp import CDP
import importlib.util as _iu
_sp=_iu.spec_from_file_location('gels',os.path.join(ICI,'gels.py'));G=_iu.module_from_spec(_sp);_sp.loader.exec_module(G)
T=float(os.environ.get('T','40'));R={}
def travail(vol):
    n=w=ms=0
    for c in vol:
        for b in c['B'].values():n+=b['n'];w+=b['w'];ms+=b['ms']
    return {'images':n,'travail_moy_ms':round(w/max(n,1),2),'i_s':round(1000*n/max(ms,1),1)}
def page(c,qs,cle,sondes):
    G.ouvre(c,qs)
    if not G.jouer(c):sys.exit('JOUER ne part pas')
    c.ev("dbgBoiteVol('vide');1");G.course(c,4)
    c.ev("dbgImmortel(true);1")
    t0=time.time()
    if sondes:
        for rate in (1,6,1):
            c.call('Emulation.setCPUThrottlingRate',rate=rate);c.pump(3)
            v=c.ev("JSON.stringify(dbgMouchard('sentinelle',40))");v=json.loads(v)
            R.setdefault('sondes',[]).append({'cpu':rate,'mediane_ms':round(st.median(v),3),'min':min(v),'max':max(v)})
            print('cpu ×%d : sentinelle médiane %.3f ms (min %.3f · max %.3f)'%(rate,st.median(v),min(v),max(v)));sys.stdout.flush()
            if rate==6:c.ev("window.__ccDecode&&window.__ccDecode(42.4,512);1");c.pump(T/3) # quelques secondes de M au bridage ×6 (+ un décodage simulé)
        c.call('Emulation.setCPUThrottlingRate',rate=1)
    c.pump(max(1,T-(time.time()-t0)))
    c.ev(G.CACHE%'true');c.pump(.5)
    vol=json.loads(c.ev("JSON.stringify(dbgBoiteVol('tout'))"))
    R[cle]=travail(vol);R[cle]['charge']=round(os.getloadavg()[0],1)
    if sondes and vol:
        k=vol[-1];W=k.get('Mw',8);M=k.get('M',[]);m=[M[i:i+W] for i in range(0,len(M)-W+1,W)]
        R['M']=[[x[8],x[9],x[10],x[11]] for x in m];R['x0']=k.get('x0');R['x1']=k.get('x1');R['D']=k.get('D');R['TR']=k.get('TR')
        R['vol']=vol
    print(cle,json.dumps(R[cle]));sys.stdout.flush()
    c.ev(G.CACHE%'false')
def main():
    global R;R={'T':T,'charge0':round(os.getloadavg()[0],1)}
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(G.HTTP),'--bind','127.0.0.1'],cwd=G.VP,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    prof=tempfile.mkdtemp(prefix='banc-sentinelle-')
    ch=subprocess.Popen([G.chrome(),'--headless=new','--remote-debugging-port=%d'%G.PORT,'--user-data-dir='+prof,'--mute-audio','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for i in range(60):
            time.sleep(.5)
            try:urllib.request.urlopen('http://127.0.0.1:%d/json/version'%G.PORT,timeout=2).read();break
            except Exception:pass
        c=CDP(G.PORT);c.keep={'Runtime.exceptionThrown'}
        if os.environ.get('COUT'): # (COUT=1) le coût seul, ordre alterné : B2 A B3 A2 (allumée, ×1 tout du long, contre coupée)
            for cle,qs in (('B2_avec',''),('A_sans','&sans=sentinelle,mgtemoin'),('B3_avec',''),('A2_sans','&sans=sentinelle,mgtemoin')):page(c,'&carte=ville&meteo=midi'+qs,cle,False)
        else:
            page(c,'&carte=ville&meteo=midi&sans=sentinelle,mgtemoin','A_sans',False)
            page(c,'&carte=ville&meteo=midi','B_avec',True)
            page(c,'&carte=ville&meteo=midi&sans=sentinelle,mgtemoin','A2_sans',False)
            page(c,'&carte=ville&meteo=midi','B2_avec',False) # le coût : B2 (allumée, ×1 tout du long) contre A / A2 (coupée)
        R['erreurs']=[m for m in getattr(c,'events',[]) if m.get('method')=='Runtime.exceptionThrown'][:5]
    finally:
        ch.kill();srv.kill();shutil.rmtree(prof,ignore_errors=True)
    os.makedirs(os.path.join(ICI,'mesures'),exist_ok=True)
    out=os.path.join(ICI,'mesures','sentinelle%s.json'%('-cout' if os.environ.get('COUT') else ''));json.dump(R,open(out,'w'),ensure_ascii=False)
    print('→',out)
if __name__=='__main__':main()
