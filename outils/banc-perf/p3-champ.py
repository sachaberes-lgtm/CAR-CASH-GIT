#!/usr/bin/env python3
"""P3 (2026-11-07) LE CHAMP : triangles dessinés contre triangles dans le champ de la caméra, par famille (dbgChamp), + la sonde brute (dbgAppelsBrut, avec paramètres de géométrie, texture, échelle).
    python3 outils/banc-perf/p3-champ.py --palier 2 --tel --json sortie.json [carte:météo …]     (P3_POS="1800,900,2800")"""
import sys,os,json,time,importlib.util
ICI=os.path.dirname(os.path.abspath(__file__))
sp=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(sp);sp.loader.exec_module(gp)
POS=[int(x) for x in os.environ.get('P3_POS','1800,900,2800').split(',')]
def mesure(c,nom,F,V,passe=None,lk=None):
    R=[]
    for d in POS:
        c.ev("dbgAuto(1,0,{});1");pos=c.ev("dbgPortail(%d)"%d);s0=pos.get('s',0) if isinstance(pos,dict) else 0
        t=time.time()
        while time.time()-t<40 and (c.ev("dbgEco().s") or 0)<s0+80:c.pump(.02)
        c.ev("dbgCout(0);1");c.pump(.25)
        ch=c.ev("JSON.stringify(dbgChamp())")
        br=c.ev("JSON.stringify(dbgAppelsBrut())") if d==POS[0] else None
        try:o={'d':d,'champ':json.loads(ch)}
        except Exception:o={'d':d,'erreur':str(ch)[:400]};R.append(o);print(nom,d,o);continue
        if br:
            try:o['sonde']=json.loads(br)
            except Exception:pass
        R.append(o);k=o['champ']
        print('%-14s d=%4d appels %3d | triangles dessinés %7d dans le champ %7d (%.0f %%)'%(nom,d,k['appels'],k['dessines'],k['dansLeChamp'],100*k['dansLeChamp']/max(1,k['dessines'])))
        for f in k['fam'][:8]:print('      %-52s n=%2d dessinés %7d champ %7d derrière %3d'%(f['k'][:52],f['n'],f['dr'],f['di'],f['derriere']))
    return {'map':nom,'mesures':R}
gp.mesure=mesure
sys.exit(gp.main())
