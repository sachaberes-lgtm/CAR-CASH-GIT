#!/usr/bin/env python3
# (2026-11-12, ios-ultime) LE TABLEAU DE LA BOÎTE DE VOL : python3 outils/banc-perf/analyse-vol.py <vol-*.json> [--depuis AAAA-MM-JJTHH:MM] [--v <version>]
# Par phase (sol / vol / figure) et tranche de vitesse : images, i/s, part d'images en retard (> 21 ms = une image d'écran ratée à 60 ; > 34,5 = ratée à 30 ; > 51),
# travail du jeu (JS + envoi du dessin), part calée sur 30 ; puis les leviers contre la base, l'état thermique, les maps, les images longues.
import sys,json,collections
A=sys.argv[1:];F=A[0];dep=A[A.index('--depuis')+1] if '--depuis' in A else '';ver=A[A.index('--v')+1] if '--v' in A else ''
C=[c for c in json.load(open(F)) if c.get('d','')>=dep and (not ver or ver in c.get('v',''))]
PH=['sol','vol','figure'];VB=['<300','300-600','600-1000','1000-1600','>1600'];HB=[17.5,21,26,34.5,51,101]
def vide():return {'n':0,'ms':0,'w':0,'mx':0,'h':[0]*7,'wh':[0]*6,'c30':0}
def plus(a,b):
    a['n']+=b['n'];a['ms']+=b['ms'];a['w']+=b['w'];a['mx']=max(a['mx'],b['mx']);a['c30']+=b['c30']
    for i in range(7):a['h'][i]+=b['h'][i]
    for i in range(6):a['wh'][i]+=b['wh'][i]
def ligne(nom,b):
    n=b['n']
    if not n:return
    h=b['h'];r21=sum(h[2:])/n*100;r34=sum(h[4:])/n*100;r51=sum(h[5:])/n*100;c=b['c30']/n*100
    # « en retard » se lit contre la cadence : calé sur 30, une image normale dure 33 ms
    print('  %-22s %8d img %6.1f s  %5.1f i/s  moy %5.1f ms  >21: %5.1f %%  >34,5: %5.1f %%  >51: %4.1f %%  pire %4d  travail %4.1f ms (>12: %4.1f %%)  calé30 %5.1f %%'%(nom,n,b['ms']/1000,1000*n/b['ms'] if b['ms'] else 0,b['ms']/n,r21,r34,r51,b['mx'],b['w']/n,sum(b['wh'][3:])/n*100,c))
def table(titre,Cs,par=lambda k:k):
    T=collections.OrderedDict()
    for c in Cs:
        for k,b in c['B'].items():
            g=par(k)
            if g is None:continue
            T.setdefault(g,vide());plus(T[g],b)
    print(titre)
    for g in sorted(T):ligne(g,T[g])
nomme=lambda k:'%s %s km/h'%(PH[int(k[0])],VB[int(k[1])])
print('=== %d courses · %.0f min de course · versions %s · appareils %s'%(len(C),sum(c.get('dur',0) for c in C)/60,sorted(set(c.get('v','?') for c in C)),sorted(set(c.get('app','') or c.get('ecr','') for c in C))))
if not C:sys.exit(0)
table('\n--- TOUT, par phase et vitesse',C,lambda k:k[0]+k[1]+' '+nomme(k))
table('\n--- TOUT, par phase',C,lambda k:k[0]+' '+PH[int(k[0])])
base=[c for c in C if c.get('lev')=='base']
table('\n--- BASE seulement (aucun levier), par phase et vitesse',base,lambda k:k[0]+k[1]+' '+nomme(k))
print('\n--- LES LEVIERS (courses sans bascule du gouverneur), sol puis vol+figure')
for lev in sorted(set(c.get('lev','?') for c in C)):
    Cs=[c for c in C if c.get('lev')==lev and not c.get('gv')]
    print(' levier %s : %d courses'%(lev,len(Cs)))
    S=vide();V=vide();R=vide()
    for c in Cs:
        for k,b in c['B'].items():
            plus(S if k[0]=='0' else V,b)
            if k[0]!='0' and int(k[1])>=2:plus(R,b)
    ligne('sol',S);ligne('vol + figure',V);ligne('vol ≥ 600 km/h',R)
# par seconde : l'état thermique, la cadence
print('\n--- PAR ÉTAT THERMIQUE (secondes de course ; images par seconde et pire image de la seconde)')
TH=collections.defaultdict(lambda:[0,0,0,0,0]) # (th,ph) -> s, images, somme pire, secondes avec pire>50, calé
for c in C:
    S=c.get('S',[])
    for i in range(0,len(S)-7,8):
        s,n,mx,w,ph,v,ql,f=S[i:i+8];th=f>>1;k=(th,min(ph,1))
        t=TH[k];t[0]+=1;t[1]+=n;t[2]+=mx;t[3]+=1 if mx>50 else 0;t[4]+=f&1
for k in sorted(TH):
    t=TH[k];print('  thermique %d %-4s : %6d s  %5.1f i/s  pire moyenne %5.1f ms  secondes avec une image > 50 ms : %5.1f %%  calé30 %5.1f %%'%(k[0],'sol' if k[1]==0 else 'vol',t[0],t[1]/t[0],t[2]/t[0],t[3]/t[0]*100,t[4]/t[0]*100))
print('  secondes par état (0 nominal · 1 fair · 2 serious · 3 critical · 4 sans capteur) :',[sum(c['th'][i] for c in C) for i in range(5)])
print('\n--- PAR MAP (courses d\'une seule map)')
M=collections.defaultdict(list)
for c in C:
    if len(c.get('cartes',[]))==1:M[c['cartes'][0]].append(c)
for m in sorted(M):
    S=vide();V=vide()
    for c in M[m]:
        for k,b in c['B'].items():plus(S if k[0]=='0' else V,b)
    print(' %s (%d courses)'%(m,len(M[m])));ligne('sol',S);ligne('vol + figure',V)
print('\n--- LES 25 PIRES IMAGES (t s, durée ms, travail ms, phase, km/h, cran QL, drapeaux 1 calé30 · 2 reconstruction · 4 portail) — date de la course, levier, cartes')
L=[]
for c in C:
    for l in c.get('L',[]):L.append((l[1],l,c['d'][5:19],c.get('lev'),'>'.join(c.get('cartes',[]))))
for d,l,dd,lev,ca in sorted(L,key=lambda x:-x[0])[:25]:print('  %5d ms travail %4d  %-6s %5d km/h  QL %2d  f%d  à %6.1f s · %s %s %s'%(l[1],l[2],PH[l[3]],l[4],l[5],l[6],l[0],dd,lev,ca))
print('\n--- LES IMAGES LONGUES par phase : nombre pour 1000 s de phase')
for p in range(3):
    n=sum(1 for c in C for l in c.get('L',[]) if l[3]==p);s=sum(b['ms'] for c in C for k,b in c['B'].items() if int(k[0])==p)/1000
    if s:print('  %-6s %5d images longues en %6.0f s → %5.1f / 1000 s'%(PH[p],n,s,n/s*1000))
