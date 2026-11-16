#!/usr/bin/env python3
# (2026-11-12, ios-ultime) LE TABLEAU DE LA BOÎTE DE VOL : python3 outils/banc-perf/analyse-vol.py <vol-*.json> [--depuis AAAA-MM-JJTHH:MM] [--v <version>]
# Par phase (sol / vol / figure) et tranche de vitesse : images, i/s, part d'images en retard (> 21 ms = une image d'écran ratée à 60 ; > 34,5 = ratée à 30 ; > 51),
# travail du jeu (JS + envoi du dessin), part calée sur 30 ; puis les leviers contre la base, l'état thermique, les maps, les images longues.
import sys,json,collections
A=sys.argv[1:];F=A[0];dep=A[A.index('--depuis')+1] if '--depuis' in A else '';ver=A[A.index('--v')+1] if '--v' in A else ''
C=[c for c in json.load(open(F)) if c.get('d','')>=dep and (not ver or ver in c.get('v',''))]
PH=['sol','vol','figure'];VB=['<300','300-600','600-1000','1000-1600','>1600'];HB=[17.5,21,26,34.5,51,101]
def vide():return {'n':0,'ms':0,'w':0,'mx':0,'h':[0]*7,'wh':[0]*6,'c30':0,'pb':0,'npb':0}
def plus(a,b):
    a['n']+=b['n'];a['ms']+=b['ms'];a['w']+=b['w'];a['mx']=max(a['mx'],b['mx']);a['c30']+=b['c30']
    if 'pb' in b:a['pb']+=b['pb'];a['npb']+=b['n']  # (2026-11-13, ios-aide) la part du pré-bâti (vols à partir de v1577)
    for i in range(7):a['h'][i]+=b['h'][i]
    for i in range(6):a['wh'][i]+=b['wh'][i]
def ligne(nom,b):
    n=b['n']
    if not n:return
    h=b['h'];r21=sum(h[2:])/n*100;r34=sum(h[4:])/n*100;r51=sum(h[5:])/n*100;c=b['c30']/n*100
    # « en retard » se lit contre la cadence : calé sur 30, une image normale dure 33 ms
    print('  %-22s %8d img %6.1f s  %5.1f i/s  moy %5.1f ms  >21: %5.1f %%  >34,5: %5.1f %%  >51: %4.1f %%  pire %4d  travail %4.1f ms (>12: %4.1f %%)  calé30 %5.1f %%'%(nom,n,b['ms']/1000,1000*n/b['ms'] if b['ms'] else 0,b['ms']/n,r21,r34,r51,b['mx'],b['w']/n,sum(b['wh'][3:])/n*100,c))
    if b.get('npb'):print('  %-22s %8s     pré-bâti %4.1f ms par image (dans le travail)'%('','',b['pb']/b['npb']))
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
    Cs=[c for c in C if c.get('lev')==lev and (lev in ('fx0','air0','anim0','filtre0','base+gv') or not c.get('gv'))]  # les leviers d'interface ne dépendent pas du gouverneur
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


# (2026-11-12, vague 2) L'ÉCRAN ET LA PUCE : par phase, images d'écran reçues par seconde (rAF bruts), plus petit intervalle, vrai coût d'une image (barrière de la puce)
G={}
for c in C:
    S=c.get('S',[]);R=c.get('R',[])
    for i in range(min(len(S)//8,len(R)//3)):
        ph=min(S[i*8+4],1);rn,rmin,vrai=R[i*3:i*3+3]
        g=G.setdefault(ph,[0,0,0,[],[]]);g[0]+=1;g[1]+=rn;g[2]+=S[i*8+1];g[3].append(rmin/10)
        if vrai>=0:g[4].append(vrai/10)
if G:
    print("\n--- L'ÉCRAN ET LA PUCE (builds ≥ 52) : images d'écran reçues, images calculées, plus petit intervalle médian, vrai coût médian d'une image")
    for ph in sorted(G):
        n,rn,im,mi,vr=G[ph];mi.sort();vr.sort()
        print('  %-4s %5d s   écran %.1f /s   calculées %.1f /s   intervalle mini médian %.1f ms   vrai coût médian %s (p90 %s, %d mesures)'%(('sol','vol')[ph],n,rn/n,im/n,mi[len(mi)//2],('%.1f ms'%vr[len(vr)//2]) if vr else '—',('%.1f'%vr[int(len(vr)*.9)]) if vr else '—',len(vr)))


# (2026-11-12, build 56) LE CYCLE : les réglages du HUD tournent toutes les 6 s dans la même course (c.V = le réglage de chaque seconde)
CYC=['base','filtre0','anim0','texte0','fig0','fx0'];G={}
for c in C:
    S=c.get('S',[]);R=c.get('R',[]);V=c.get('V',[])
    for i in range(min(len(S)//8,len(R)//3,len(V))):
        if i%6==0: continue  # la seconde du changement de réglage
        ph=S[i*8+4];g=G.setdefault((('sol','vol','figure')[ph],CYC[V[i]]),[0,0,0,0]);g[0]+=1;g[1]+=min(R[i*3],70);g[2]+=S[i*8+1];g[3]+=S[i*8+3]/10*S[i*8+1]
if G:
    print("\n--- LE CYCLE (builds ≥ 56) : par phase et par réglage — secondes, images d'écran reçues, images calculées, travail JS moyen")
    for ph in ('sol','vol','figure'):
        for v in CYC:
            g=G.get((ph,v))
            if g: print('  %-7s %-8s %4d s   écran %.1f /s   calculées %.1f /s   travail %.1f ms'%(ph,v,g[0],g[1]/g[0],g[2]/g[0],g[3]/max(1,g[2])))


# (2026-11-14, qualité par appareil) PAR NIVEAU D'IMAGE : chaque seconde rangée sous le couple réglage/niveau qu'elle avait (c.prf au départ, puis c.prfC
# [seconde, q 0 BASSE · 1 HAUTE, niveau, plafond ×100, fps, dpr ×100] à chaque changement en course). Images calculées par seconde, vrai coût médian (barrière
# de la puce, builds ≥ 52), secondes par état thermique (0 nominal · 1 fair · 2 serious · 3 critical). Courses sans profil (ordinateur, avant le build du profil) : ignorées.
G={}
for c in C:
    p=c.get('prf')
    if not p: continue
    S=c.get('S',[]);R=c.get('R',[]);ch=c.get('prfC',[]);ev=[(ch[j],ch[j+1],ch[j+2],ch[j+4]) for j in range(0,len(ch)-5,6)]
    q,n,f=(1 if p.get('q')=='haute' else 0),p.get('n'),p.get('fps');e=0
    for i in range(len(S)//8):
        while e<len(ev) and ev[e][0]<=i: q,n,f=ev[e][1],ev[e][2],ev[e][3];e+=1
        k=('HAUTE' if q else 'BASSE','N%s'%n,f,c.get('app','') or '?');g=G.setdefault(k,[0,0,[],[0,0,0,0,0],0])
        g[0]+=1;g[1]+=S[i*8+1];th=S[i*8+7]>>1;g[3][min(4,th)]+=1;g[4]+=1 if S[i*8+4] else 0
        if i<len(R)//3 and R[i*3+2]>=0:g[2].append(R[i*3+2]/10)
if G:
    print("\n--- PAR NIVEAU D'IMAGE (réglage, niveau, cadence visée, appareil) : secondes, part en vol, images calculées /s, vrai coût médian, secondes par état thermique")
    for k in sorted(G):
        s,im,vr,th,vol=G[k];vr.sort()
        print('  %-5s %-2s %2s i/s %-11s %5d s (vol %3.0f %%)  %5.1f i/s  vrai coût médian %s  thermique nominal %d · fair %d · serious %d · critical %d s'%(k[0],k[1],k[2],k[3],s,vol/s*100,im/s,('%.1f ms'%vr[len(vr)//2]) if vr else '—',th[0],th[1],th[2],th[3]))
    nch=[c.get('prfN',0) for c in C if c.get('prf')]
    print('  changements de réglage en course : %d (sur %d courses profilées)'%(sum(nch),len(nch)))


# (2026-11-15, lot GELS) LES GELS : QUI. Une image de course de plus de 80 ms entre deux images calculées.
# Builds avec le mouchard (c.G, ?perfrec=2 à partir du lot GELS) : chaque gel est rangé sous son coupable —
#   « rappel <nom> » : un rappel posé par le jeu (minuterie T:, intervalle I:, image R:, écouteur E:, observateur O:) a pris au moins 40 % du temps hors boucle ;
#   « boucle d'avant · <tranche> » : l'image calculée juste avant a pris au moins la moitié de l'intervalle (sa tranche la plus lourde) ;
#   « hors boucle, non attribué » : ni l'un ni l'autre — ramasse-miettes, système, puce qui retient l'image, promesses / messages natifs (non enveloppés).
# Builds sans mouchard : seulement « travail dans la boucle » (travail ≥ moitié de l'intervalle) contre « hors boucle ».
# (2026-11-16, lot SENTINELLE) LE FIL ENTIER. « b4 effets » sortait coupable parce que c'est la tranche la plus lourde EN TEMPS NORMAL : on compare
# désormais chaque tranche à SA référence (images légères de la course, loop < 25 ms : c.TR si le build la note, sinon la médiane tirée des tranches de G).
# Si 4 tranches au moins dépassent ×3 (et 3 ms), ce n'est pas une tranche : c'est TOUT le fil qui ralentit → « fil entier ralenti ×N ».
def med(v):
    v=sorted(v);return v[len(v)//2] if v else 0
def reference(c,G):
    T=c.get('TR')
    if T and len(T)>8 and T[8]>=20:return [T[i]/T[8] for i in range(8)]
    L=[g[10:18] for g in G if g[3]<25]+[g[18:26] for g in G if g[4]<25]
    if len(L)<5:L=sorted([g[10:18] for g in G]+[g[18:26] for g in G],key=sum)[:max(5,len(G)//2)]
    return [med([l[i] for l in L]) for i in range(8)]
def fil_entier(tr,ref):
    n=sum(1 for i in range(8) if tr[i]>=3 and tr[i]>=3*max(ref[i],1))
    if n<4:return 0
    return sum(tr)/max(1,sum(max(r,0.5) for r in ref))
def sentinelle_temoin(c,m,G):
    # (lot SENTINELLE) M[8] sentinelle ms×100 · M[9] passages du ramasse-miettes · M[10] âge de l'appât · M[11] état natif (thermique·branché·autre musique·économie, 9 inconnu)
    sv=[x[8]/100 for x in m if x[8]>=0]
    if sv:
        b=sorted(sv)[:max(1,len(sv)//4)];base=sum(b)/len(b)
        print('    SENTINELLE (par seconde, iOS : horloge au ms → lire les moyennes) : moyenne %.2f ms · quart le plus rapide %.2f ms · pire %.2f'%(sum(sv)/len(sv),base,max(sv)))
        # par tranches de 10 s : la moyenne, rapportée au quart le plus rapide
        bl=[];
        for i in range(0,len(m),10):
            q=[x[8]/100 for x in m[i:i+10] if x[8]>=0]
            if q:bl.append('%d:%.1f'%(i,(sum(q)/len(q))/max(base,0.01)))
        print('      par 10 s (×rapport au quart rapide) : '+' '.join(bl))
        sg=[g[35]/100 for g in G if len(g)>35 and g[35]>=0]
        if sg:print('      aux gels : moyenne %.2f ms (%d mesures) → ×%.1f'%(sum(sg)/len(sg),len(sg),(sum(sg)/len(sg))/max(base,0.01)))
    gc=[x[9] for x in m if x[9]>=0]
    if gc:
        ag=[x[10] for x in m if x[10]>=0]
        print('    TÉMOIN DU RAMASSE-MIETTES : %d passages en %d s (%.2f /s) · âge médian de l\'appât %s ms'%(sum(gc),len(gc),sum(gc)/len(gc),med(ag) if ag else '—'))
        gg=[g[36] for g in G if len(g)>36 and g[36]>=0]
        if gg:print('      aux gels : dernier passage il y a %d ms (médiane) · gels à moins de 300 ms d\'un passage : %d/%d'%(med(gg),sum(1 for x in gg if x<300),len(gg)))
    na=collections.Counter(x[11] for x in m)
    if na:print('    ÉTAT NATIF (thermique·branché·autre musique·économie, 9 = inconnu ; secondes) : %s'%', '.join('%04d:%d'%(k,v) for k,v in sorted(na.items())))
TR=['b1 début','b2 conduite','b3 physique','b4 effets','b5 sons','b6 HUD','rendu','après rendu']
ACN={0:'aucun',1:'running',2:'suspended',3:'interrupted',4:'closed',5:'?',11:'running HORLOGE ARRÊTÉE'}
print("\n--- LES GELS : QUI (images > 80 ms, par course)")
for c in C:
    G=c.get('G');L=c.get('L',[]);S=c.get('S',[])
    rows=[S[i:i+8] for i in range(0,len(S)-7,8)];ws=sorted(r[3]/10 for r in rows)
    tete=' %s %s %5.0f s  %s'%(c.get('d','')[5:16],c.get('v',''),c.get('dur',0),'>'.join(c.get('cartes',[])))
    if G is None:
        gl=[l for l in L if l[1]>80]
        if not gl:continue
        dans=sum(1 for l in gl if l[2]>=l[1]/2)
        sec=sum(1 for r in rows if r[2]>120)
        print(tete+'  (sans mouchard) %d gels dans L (L plafonné à 80) · %d dans la boucle · %d hors boucle · secondes avec une image > 120 ms : %d/%d · travail médian %.1f ms'%(len(gl),dans,len(gl)-dans,sec,len(rows),ws[len(ws)//2] if ws else 0))
        continue
    if not G:continue
    N=c.get('GN',[]);K=collections.Counter();Ms=collections.Counter();FX=[];SG={}
    ref=reference(c,G)
    for g in G:
        # l'intervalle (horloge) = boucle de l'image d'avant + hors boucle (rappels attribués + reste) + loop sautés : le plus gros morceau est le coupable
        dw,lAv,gap,cS,ti,top=g[1],g[3],g[5],g[6],g[8],g[9];saut=g[33] if len(g)>33 else 0
        parts={'boucle':lAv-33,'rappels':cS,'reste':gap-cS-20,'sautes':saut}
        p=max(parts,key=parts.get)
        if p=='rappels':k='rappel '+(N[ti][:60] if ti>=0 else '?')
        elif p=='boucle':
            tr=g[10:18];x=fil_entier(tr,ref)
            if x:k='fil entier ralenti (toutes les tranches ×3 et plus)';FX.append(x)
            else:j=max(range(8),key=lambda i:tr[i]/max(ref[i],1));k="boucle d'avant · "+TR[j]+' (×%.0f sa référence)'%(tr[j]/max(ref[j],1))
        elif p=='sautes':k='images sautées (cadence)'
        else:k='hors boucle, non attribué'
        K[k]+=1;Ms[k]+=dw
        if len(g)>35 and g[35]>=0:SG.setdefault(k,[]).append(g[35]/100)
    print(tete+'  %d gels (G)'%len(G))
    print('    référence des tranches (images de loop < 25 ms%s) : %s ms'%(', c.TR' if c.get('TR') and c['TR'][8] else ', tirée de G',' · '.join('%s %.1f'%(TR[i].split()[0],ref[i]) for i in range(8))))
    for k,n in K.most_common(12):
        sg=SG.get(k);print('    %4d gels  %6.0f ms  %s%s%s'%(n,Ms[k],k,('  ×%.1f médian (%.1f-%.1f)'%(med(FX),min(FX),max(FX))) if k.startswith('fil entier') else '',('  · sentinelle moy. %.2f ms (%d mesures)'%(sum(sg)/len(sg),len(sg))) if sg else ''))
    hb=[g[5]-g[6] for g in G];print('    hors boucle non attribué médian %.0f ms · contexte audio %s · retour d\'arrière-plan à %s s · pivot à %s s · minuteries %s · intervalles %s · tas %s Mo'%(
        sorted(hb)[len(hb)//2],dict(collections.Counter(ACN.get(g[29],g[29]) for g in G)),G[0][30],G[0][31],sorted(set(g[27] for g in G))[:6],sorted(set(g[28] for g in G))[:6],G[-1][32]))
    Q=c.get('Q',{})
    if Q:
        print('    rappels > 8 ms de la course (nombre, ms, pire) :')
        for nm,q in sorted(Q.items(),key=lambda x:-x[1][1])[:10]:print('      %4d  %6d ms  pire %4d  %s'%(q[0],q[1],q[2],nm[:90]))
    M=c.get('M',[])
    if M:
        W=c.get('Mw',8);m=[M[i:i+W] for i in range(0,len(M)-W+1,W)];nl=sorted(x[0] for x in m);nr=sorted(x[1] for x in m);hs=sorted(x[2] for x in m)
        print('    par seconde (médianes) : images de loop %d · autres rAF %d · rappels hors boucle %d ms · intervalles %d→%d · écouteurs %d→%d'%(nl[len(nl)//2],nr[len(nr)//2],hs[len(hs)//2],m[0][4],m[-1][4],m[0][5],m[-1][5]))
        if W>=12:sentinelle_temoin(c,m,G)
    if c.get('mg') and c.get('mg1'):print('    départ → fin : minuteries/intervalles/écouteurs %s → %s'%(c['mg'][:3],c['mg1'][:3]))
    if c.get('x0') and c.get('x1'):print('    séance départ → fin [âge vue web s, dernier arrière-plan s, textures, géométries, programmes] : %s → %s'%(c['x0'],c['x1']))
    D=c.get('D') or []
    if D:
        d=[D[i:i+3] for i in range(0,len(D)-2,3)];gt=[g[0] for g in G]
        pres=sum(1 for x in d if any(0<=t-x[0]/10<=1.0 for t in gt))
        print('    décodages de musique : %d (durée médiane %d ms, pire %d, %d Ko au total) · suivis d\'un gel dans la seconde : %d'%(len(d),med([x[1] for x in d]),max(x[1] for x in d),sum(x[2] for x in d),pres))
