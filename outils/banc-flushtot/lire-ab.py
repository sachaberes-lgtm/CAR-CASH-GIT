#!/usr/bin/env python3
"""LE JUGE DU LOT FLUSHTOT SUR LA BOÎTE DE VOL (2026-11-18).
    python3 outils/banc-flushtot/lire-ab.py vol-XXXX.json [autre.json …] [--th 2]
Range chaque course par son champ `flt` (1 = flush tôt, 0 ou absent = sans : un build d'avant le lot n'a pas le champ) et compare, à état thermique égal
(--th : 0 nominal · 1 fair · 2 serious · 3 critical ; par défaut 2, la séance de Sacha ; --th -1 = toutes) — une course compte si ≥ 80 % de ses secondes y sont :
  · VRAI COÛT R[2] (barrière de la puce, du début de loop à la fin du dessin) : médiane et p90, en ms. Les valeurs répétées d'une seconde à l'autre (même mesure
    encore fraîche) ne comptent qu'une fois ;
  · part des images CALCULÉES au-delà de 34,5 ms (histogrammes B : cases ≥ 34,5 = h[4] + h[5] + h[6]) ;
  · gels par minute et gels HORS boucle par minute (G ; hors boucle = G[5] ≥ ½ G[1] ou G[3] < 40, comme analyse-vol.py ; G plafonne à 63 par course : noté) ;
  · i/s calculées (images / secondes de S).
"""
import sys,json
def med(v,q=.5):
    v=sorted(v);return v[min(len(v)-1,int(len(v)*q))] if v else None
def hors_boucle(g):return g[5]>=g[1]*.5 or g[3]<40
args=[a for a in sys.argv[1:]];th=2
if '--th' in args:i=args.index('--th');th=int(args[i+1]);del args[i:i+2]
C=[]
for f in args:
    d=json.load(open(f));C+=d if isinstance(d,list) else list(d.values())
G={0:[],1:[]}
for c in C:
    if not isinstance(c,dict) or 'S' not in c:continue
    t=c.get('th',[0]*5);tot=sum(t) or 1
    if th>=0 and t[th]<.8*tot:continue
    G[1 if c.get('flt')==1 else 0].append(c)
print('courses retenues (th %s) : sans %d · avec %d'%(th,len(G[0]),len(G[1])))
for k in (0,1):
    L=G[k]
    if not L:print('  %s : aucune course'%('AVEC flush tôt' if k else 'SANS'));continue
    R=[];n=0;lg=0;sec=0;gl=0;hb=0;cap=0;img=0
    for c in L:
        r=c.get('R') or [];prev=None
        for i in range(2,len(r),3):
            v=r[i]
            if v>=0 and v!=prev:R.append(v/10)
            prev=v
        for b in c.get('B',{}).values():
            h=b['h'];n+=sum(h);lg+=h[4]+h[5]+h[6]
        s=c['S'];sec+=len(s)//8;img+=sum(s[i+1] for i in range(0,len(s),8))
        g=c.get('G') or [];gl+=len(g);hb+=sum(1 for x in g if hors_boucle(x));cap+=len(g)>=63
    mn=sec/60 or 1
    print('  %s : %d courses · %d s · %.1f i/s calculées · vrai coût R[2] médiane %s ms · p90 %s ms (%d mesures) · images > 34,5 ms : %.1f %% · gels %.1f/min · hors boucle %.1f/min%s'%(
        'AVEC flush tôt' if k else 'SANS          ',len(L),sec,img/max(1,sec),med(R),med(R,.9),len(R),100*lg/max(1,n),gl/mn,hb/mn,(' · %d courses au plafond de G (sous-comptées)'%cap) if cap else ''))
