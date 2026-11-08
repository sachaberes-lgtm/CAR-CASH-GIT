#!/usr/bin/env python3
"""P3 (2026-11-07, passe 3) L'IMAGE EST-ELLE LA MÊME ? — comme familles.py (mêmes portails, mêmes maps, instant fixe), mais dans UNE SEULE tâche JavaScript :
état A (avant) → image relue deux fois (témoin de déterminisme) → état B (après) → image relue deux fois → retour à A. Rend les appels de dessin et les empreintes FNV
(image finale, carte d'ombre). Les bascules A et B sont des expressions JS passées en variables d'environnement :
    P3_A="dbgMobaOmbre(false)" P3_B="dbgMobaOmbre(true)" python3 outils/banc-perf/p3-egal.py --palier 2 --tel --json sortie.json [carte:météo …]
Plusieurs positions (m avant la fin de la piste) : P3_POS="1800,900,2800". Machine calme, un seul banc (verrou-banc.sh)."""
import sys,os,json,time,importlib.util
ICI=os.path.dirname(os.path.abspath(__file__))
sp=importlib.util.spec_from_file_location('gp',os.path.join(ICI,'garde-perf.py'));gp=importlib.util.module_from_spec(sp);sp.loader.exec_module(gp)
POS=[int(x) for x in os.environ.get('P3_POS','1800').split(',')]
A=os.environ.get('P3_A','1');B=os.environ.get('P3_B','1')
JS="""(function(){var r={};function ap(){return dbgAppels(0).appels;}function tr(){return dbgChamp().dessines;}
 (function(){%s})();r.appelsA=ap();r.triA=tr();r.a1=dbgImgEmpreinte();r.a2=dbgImgEmpreinte();
 (function(){%s})();r.appelsB=ap();r.triB=tr();r.b1=dbgImgEmpreinte();r.b2=dbgImgEmpreinte();
 (function(){%s})();r.dAA=dbgImgDiff(0,1);r.dBB=dbgImgDiff(2,3);r.dAB=dbgImgDiff(0,2);return JSON.stringify(r);})()"""%(A,B,A)
def mesure(c,nom,F,V,passe=None,lk=None):
    R=[]
    for d in POS:
        c.ev("dbgAuto(1,0,{});1");pos=c.ev("dbgPortail(%d)"%d);s0=pos.get('s',0) if isinstance(pos,dict) else 0
        t=time.time()
        while time.time()-t<40 and (c.ev("dbgEco().s") or 0)<s0+80:c.pump(.02)
        c.ev("dbgCout(0);1");c.pump(.25)
        if os.environ.get('P3_SONDE') and d==POS[0]:
            try:o_s=json.loads(c.ev('JSON.stringify(dbgAppelsBrut())'))
            except Exception as e:o_s=[]
        else:o_s=None
        r=c.ev(JS)
        try:o=json.loads(r)
        except Exception:o={'erreur':str(r)[:500]}
        o['d']=d;R.append(o)
        if o_s is not None:o['sonde']=o_s
        if 'erreur' in o:print(nom,d,o);continue
        ok=(o['a1']==o['a2'])and(o['b1']==o['b2'])
        print('%-14s d=%4d appels %3d → %3d · tri %7d → %7d | témoin A %s B %s | image %s | ombre %s'%(nom,d,o['appelsA'],o['appelsB'],o['triA'],o['triB'],'ok' if o['a1']['img']==o['a2']['img'] else 'VARIE','ok' if o['b1']['img']==o['b2']['img'] else 'VARIE',
          ('IDENTIQUE' if o['a1']['img']==o['b1']['img'] else 'DIFFÉRENTE')+' [px≠ bruit A %d B %d · A/B %d (max %d)]'%(o['dAA']['n'],o['dBB']['n'],o['dAB']['n'],o['dAB']['max']),'identique' if o['a1']['ombre']==o['b1']['ombre'] else 'différente'))
    return {'map':nom,'mesures':R}
gp.mesure=mesure
sys.exit(gp.main())
