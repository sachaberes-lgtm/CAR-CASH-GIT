#!/usr/bin/env python3
"""P3 (2026-11-07, passe 3) SONDE DES APPELS : comme familles.py (mêmes portails, même instant fixe), mais lit chaque appel de dessin SANS le regrouper :
objet, parent(s), géométrie, matière, drapeaux, userData, position monde — pour trouver qui est derrière les familles « sans nom ».
    python3 outils/banc-perf/p3-sonde.py --palier 2 --tel --json sortie.json [carte:météo …]
Machine calme, un seul banc (verrou-banc.sh)."""
import sys,os,json,time,importlib.util
ICI=os.path.dirname(os.path.abspath(__file__))
sp=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(sp);sp.loader.exec_module(gp)
JS="JSON.stringify(dbgAppelsBrut())"
def mesure(c,nom,F,V,passe=None,lk=None):
    c.ev("dbgAuto(1,0,{});1");pos=c.ev("dbgPortail(1800)");s0=pos.get('s',0) if isinstance(pos,dict) else 0
    t=time.time()
    while time.time()-t<40 and (c.ev("dbgEco().s") or 0)<s0+80:c.pump(.02)
    c.ev("dbgCout(1);1");c.pump(.25)
    r=c.ev(JS)
    try:L=json.loads(r)
    except Exception:print('ÉCHEC sonde :',str(r)[:600]);raise
    cout=json.loads(c.ev("JSON.stringify((function(){var k=dbgCout();return {appels:k.image&&k.image.calls,triangles:k.image&&k.image.tris}})())"))
    return {'map':nom,'cout':cout,'appels':L}
gp.mesure=mesure
sys.exit(gp.main())
