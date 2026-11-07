#!/usr/bin/env python3
"""LES FAMILLES PAR MAP (2026-11-05, passe perf mobile 2, C3.a) : comme garde-perf.py (mêmes portails, même instant fixe 1800 m / +80 m, même graine),
mais la lecture est `dbgAppels(60)` avec `__appelsDetail=1` (appels et triangles par famille nommée) + `dbgCout()`.
    python3 outils/banc-perf/familles.py --palier 0 --json sortie.json [carte:météo …]
Utilise garde-perf.py (cdp.py) ; machine calme (charge < 8), un seul banc (verrou-banc.sh)."""
import sys,os,json,time,importlib.util
ICI=os.path.dirname(os.path.abspath(__file__))
sp=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(sp);sp.loader.exec_module(gp)
POS=[1800,900,2800] # les trois instants (m avant la fin de la piste) : la pire des trois compte
def mesure(c,nom,F,V,passe=None,lk=None):
    R=[]
    for d in POS:
        c.ev("dbgAuto(1,0,{});1");pos=c.ev("dbgPortail(%d)"%d);s0=pos.get('s',0) if isinstance(pos,dict) else 0
        t=time.time()
        while time.time()-t<40 and (c.ev("dbgEco().s") or 0)<s0+80:c.pump(.02)
        c.ev("dbgCout(1);1");c.pump(.25)
        if os.environ.get('CAPTURE') and d==POS[0]:
            try:c.ev("dbgAuto(1,0,{});1");c.shot(os.environ['CAPTURE']+'-'+nom.replace(':','-')+'.png',{'x':0,'y':0,'width':390,'height':844,'scale':1})
            except Exception as e:print('capture ratée',e)
        cout=json.loads(c.ev("JSON.stringify((function(){var k=dbgCout();return {appels:k.image&&k.image.calls,triangles:k.image&&k.image.tris,dpr:k.dpr,px:k.px}})())"))
        c.ev("dbgCout(0);window.__appelsDetail=1;1")
        fam=json.loads(c.ev("JSON.stringify(dbgAppels(70))"))
        R.append({'d':d,'cout':cout,'appels':fam['appels'],'triangles':fam['triangles'],'familles':fam['liste']})
    pire=max(R,key=lambda r:int(r['triangles'][:-1]))
    return {'map':nom,'palier':gp.OPT['palier'],'appels':max(r['cout']['appels'] for r in R),'triangles':max(r['cout']['triangles'] for r in R),'dbgAppels':max(r['appels'] for r in R),'dbgTri':pire['triangles'],'positions':R,'familles':pire['familles']}
gp.mesure=mesure
sys.exit(gp.main())
