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
def lh(c):
    # (3e tour) les lignes des loops lourdes : c.LH ; les vols du lot d'avant le 3e tour les mettaient dans c.H (liste de LISTES).
    # c.H du pilote de qualité (qa/pilote) = l'histogramme des intervalles, une liste d'ENTIERS : ce n'est pas une ligne → ignoré.
    L=c.get('LH')
    if L is not None:return L,c.get('LHp'),c.get('LHt'),c.get('LHN'),c.get('LHNp'),c.get('LHNpN')
    H=c.get('H')
    if isinstance(H,list) and H and all(isinstance(h,list) for h in H):return H,c.get('Hp'),c.get('Ht'),c.get('HN'),c.get('HNp'),c.get('HNpN')
    return None,None,None,None,None,None
def g_plein(c,G):
    # G plein : c.Gp (builds du lot MESURE-RAFALES, plafond 1200) ; sinon l'ancien plafond de 240
    return bool(c.get('Gp')) or len(G)>=(1200 if (lh(c)[0] is not None or c.get('SR') is not None) else 240)
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
        # (contrôle du 17/11) la base est une MOYENNE (la plus basse des moyennes par 10 s) : sur iOS l'horloge est au ms, un quantile de mesures isolées vaut 0
        mo=[sum(q)/len(q) for q in ([x[8]/100 for x in m[i:i+10] if x[8]>=0] for i in range(0,len(m),10)) if len(q)>=5] or [sum(sv)/len(sv)]
        # (2026-11-17, lot RETOURPIVOT) LA BASE CORRIGÉE : la plus basse des MOYENNES par 10 s, en ms absolues, avec un PLANCHER de 0,1 ms
        # (sur iOS l'horloge est au ms : 10 mesures « 0 » donnaient une base de 0,02 et des rapports ×14 qui n'étaient que l'arrondi de l'horloge)
        base=max(min(mo),0.1)
        print('    SENTINELLE (par seconde, iOS : horloge au ms → lire les moyennes) : moyenne %.2f ms · base (meilleure moyenne sur 10 s, plancher 0,1) %.2f ms · pire %.2f'%(sum(sv)/len(sv),base,max(sv)))
        # par tranches de 10 s : la moyenne en ms absolues (et le rapport à la base)
        bl=[];
        for i in range(0,len(m),10):
            q=[x[8]/100 for x in m[i:i+10] if x[8]>=0]
            if q:mq=sum(q)/len(q);bl.append('%d:%.2f(×%.1f)'%(i,mq,mq/base))
        print('      par 10 s (moyenne ms, ×base) : '+' '.join(bl))
        sg=[g[35]/100 for g in G if len(g)>35 and g[35]>=0]
        if sg:print('      aux gels : moyenne %.2f ms (%d mesures) → ×%.1f'%(sum(sg)/len(sg),len(sg),(sum(sg)/len(sg))/base))
    gc=[x[9] for x in m if x[9]>=0]
    if gc:
        ag=[x[10] for x in m if x[10]>=0]
        print('    TÉMOIN DU RAMASSE-MIETTES : %d passages en %d s (%.2f /s) · âge médian de l\'appât %s ms'%(sum(gc),len(gc),sum(gc)/len(gc),med(ag) if ag else '—'))
        gg=[g[36] for g in G if len(g)>36 and g[36]>=0]
        if gg:print('      aux gels : dernier passage il y a %d ms (médiane) · gels à moins de 300 ms d\'un passage : %d/%d'%(med(gg),sum(1 for x in gg if x<300),len(gg)))
    na=collections.Counter(x[11] for x in m)
    if na:print('    ÉTAT NATIF (thermique·branché·autre musique·économie, 9 = inconnu ; secondes) : %s'%', '.join('%04d:%d'%(k,v) for k,v in sorted(na.items())))
def hors_boucle(g):return g[5]>=g[1]*.5 or g[3]<40
# (contrôle adverse du 17/11) L'ÉTAT DE SÉANCE : avant / après le PREMIER retour LONG + pivot de la séance (c.ses), et non le dernier retour vu par G[30]/G[31].
# Un retour+pivot = un pivot ≤ 5 s après le retour (pivot s ≤ retour s ≤ pivot s + 5). G et M ne donnent que les SECONDES DEPUIS le dernier retour / pivot :
# la DURÉE de l'arrière-plan n'est que dans c.mg[5] (au départ de la course) et c.mg1[5] / c.x1[1] (à la fin) — un seul chiffre, celui du DERNIER arrière-plan.
# Retour pendant la course → durée lue à la fin (mg1) ; retour avant le départ → durée lue au départ (mg). Plusieurs arrière-plans dans une course : seul le dernier est connu.
LONG=float(A[A.index('--long')+1]) if '--long' in A else 30
def rp_ok(r,p):return r>=0 and p>=0 and p<=r<=p+5
def seance_etat(C):
    E={};vu={}
    for c in sorted(C,key=lambda c:c.get('d','')):
        s=c.get('ses');k=id(c)
        if s in vu:E[k]=0;continue  # la séance est déjà passée par un retour long + pivot : toute la course est « après »
        mg=c.get('mg');mg1=c.get('mg1') or ([0,0,0,-1,-1,c['x1'][1]] if c.get('x1') else None)
        src=[]
        if mg:src.append((0,mg[3],mg[4]))
        W=c.get('Mw',0);M=c.get('M') or []
        if W>=17:src+=[(i,M[j+14],M[j+15]) for i,j in enumerate(range(0,len(M)-W+1,W))]
        src+=[(g[0],g[30],g[31]) for g in (c.get('G') or []) if len(g)>31]
        if mg1:src.append((c.get('dur',0),mg1[3],mg1[4]))
        for t,r,p in sorted(src,key=lambda x:x[0]):
            if not rp_ok(r,p):continue
            bgd=(mg[5] if mg else None) if t-r<=0.5 else (mg1[5] if mg1 else None)
            if bgd is None or bgd<LONG:continue
            E[k]=max(0,t-p);vu[s]=(c.get('d','')[5:19],E[k],bgd);break
        else:E[k]=None
    return E,vu
def retour_pivot(c,m,G):
    # (2026-11-17, lot RETOURPIVOT) M[12] rAF max dans une image d'écran (chaînes vivantes) · M[13] loop max dans une image · M[14] s depuis le retour d'arrière-plan · M[15] s depuis le pivot · M[16] toile/fenêtre %
    # G[37] le plus long silence du pouls pendant le trou (ms, -1 pas de pouls) · G[38] toile/fenêtre % · G[39] gl.drawingBufferWidth
    fm=collections.Counter(x[12] for x in m);lm=collections.Counter(x[13] for x in m);tr=collections.Counter(x[16] for x in m)
    print('    RETOUR + PIVOT : rAF par image d\'écran (max par seconde → secondes) %s · loop par image %s · toile/fenêtre %% %s'%(dict(sorted(fm.items())),dict(sorted(lm.items())),dict(sorted(tr.items()))))
    # les secondes rangées : avant tout retour long suivi d'un pivot, puis après ; un « retour+pivot » = un pivot à moins de 5 s d'un retour (M[15] ≤ M[14] ≤ M[15]+5)
    ap=None
    for i,x in enumerate(m):
        if x[14]>=0 and x[15]>=0 and x[15]<=x[14]<=x[15]+5:ap=i;break
    ec=[x[5] for x in m]
    print('      écouteurs %d → %d (min %d, max %d) · course après un retour+pivot (pivot ≤ 5 s après le retour) dès la seconde %s'%(ec[0],ec[-1],min(ec),max(ec),ap if ap is not None else '—'))
    gp=[g for g in G if len(g)>39]
    if gp:
        # (contrôle adverse du 17/11) le pouls ne se lit que pour les gels HORS boucle (cGap G[5] ≥ ½ intervalle G[1], ou loop d'avant G[3] < 40 ms) :
        # un gel DANS la boucle (loop d'avant lourde) se lit toujours « fil PRIS », puisque c'est notre propre boucle qui tient le fil
        hb=[g for g in gp if hors_boucle(g)];db=len(gp)-len(hb)
        lib=sum(1 for g in hb if 0<=g[37]<=15);pri=sum(1 for g in hb if g[37]>15 and g[37]>=g[5]*.5);mi=sum(1 for g in hb if g[37]>15 and g[37]<g[5]*.5);nb=sum(1 for g in hb if g[37]<0)
        print('      POULS aux gels HORS boucle (%d) : fil LIBRE (silence ≤ 15 ms : image retenue hors du fil) %d · fil PRIS (silence ≥ moitié du trou) %d · entre les deux %d · pas de pouls (G[37] = -1 : le guet n\'a pas battu) %d · silence médian %s ms'%(len(hb),lib,pri,mi,nb,med([g[37] for g in hb if g[37]>=0]) if any(g[37]>=0 for g in hb) else '—'))
        print('      gels DANS la boucle (loop d\'avant ≥ 40 ms et hors boucle < ½ intervalle, pouls non lu) : %d'%db)
        print('      toile aux gels : toile/fenêtre %% %s · tampon (largeur) %s'%(dict(collections.Counter(g[38] for g in gp)),dict(collections.Counter(g[39] for g in gp))))
TR=['b1 début','b2 conduite','b3 physique','b4 effets','b5 sons','b6 HUD','rendu','après rendu']
ACN={0:'aucun',1:'running',2:'suspended',3:'interrupted',4:'closed',5:'?',11:'running HORLOGE ARRÊTÉE'}
ETAT,VU=seance_etat(C)
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
    t9=ETAT.get(id(c));print(tete+'  %d gels (G%s) · séance %s : %s'%(len(G),(', PLAFONNÉ à %d'%len(G))+(' (%d gels perdus)'%c['Gp'] if c.get('Gp') else '') if g_plein(c,G) else '',c.get('ses'),'avant tout retour long (≥ %.0f s) + pivot'%LONG if t9 is None else ('après le premier retour long + pivot de la séance dès le départ' if t9==0 else 'après le premier retour long + pivot de la séance dès %.0f s'%t9)))
    av=[g for g in G if t9 is None or g[0]<t9];print('    gels avant / après (état de séance) : %d / %d · dont hors boucle %d / %d'%(len(av),len(G)-len(av),sum(1 for g in av if hors_boucle(g)),sum(1 for g in G if hors_boucle(g))-sum(1 for g in av if hors_boucle(g))))
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
        if W>=17:retour_pivot(c,m,G)
    if c.get('mg') and c.get('mg1'):print('    départ → fin : minuteries/intervalles/écouteurs %s → %s'%(c['mg'][:3],c['mg1'][:3]))
    if c.get('x0') and c.get('x1'):print('    séance départ → fin [âge vue web s, dernier arrière-plan s, textures, géométries, programmes] : %s → %s'%(c['x0'],c['x1']))
    D=c.get('D') or []
    if D:
        d=[D[i:i+3] for i in range(0,len(D)-2,3)];gt=[g[0] for g in G]
        pres=sum(1 for x in d if any(0<=t-x[0]/10<=1.0 for t in gt))
        print('    décodages de musique : %d (durée médiane %d ms, pire %d, %d Ko au total) · suivis d\'un gel dans la seconde : %d'%(len(d),med([x[1] for x in d]),max(x[1] for x in d),sum(x[2] for x in d),pres))


# (contrôle adverse du 17/11) LA CHALEUR CONFOND LE CONSTAT : gels par minute selon l'état thermique (M[11] : chiffre des milliers ; 9 inconnu)
# ET selon l'état de séance (avant / après le premier retour long + pivot). Courses à mouchard avec M ≥ 12 colonnes. Un gel est rangé sous la seconde int(G[0]).
# ⚠ G est plafonné (240 gels par course avant le lot MESURE-RAFALES, 1200 depuis, c.Gp compte les perdus) : une course plafonnée sous-compte (signalée).
X={};cap=0;nc=0
for c in C:
    W=c.get('Mw',0);M=c.get('M') or [];G=c.get('G')
    if W<12 or G is None:continue
    nc+=1;cap+=1 if g_plein(c,G) else 0
    m=[M[i:i+W] for i in range(0,len(M)-W+1,W)]
    if not m:continue
    t9=ETAT.get(id(c))
    cle=lambda i:(m[i][11]//1000 if m[i][11]>=0 else 9,'avant' if t9 is None or i<t9 else 'après')
    for i in range(len(m)):X.setdefault(cle(i),[0,0,0])[0]+=1
    for g in G:
        i=min(max(int(g[0]),0),len(m)-1);x=X.setdefault(cle(i),[0,0,0]);x[1]+=1;x[2]+=1 if hors_boucle(g) else 0
if X:
    THN={0:'nominal',1:'fair',2:'serious',3:'critical',9:'inconnu'}
    print("\n--- GELS × CHALEUR × RETOUR+PIVOT (%d courses à mouchard%s ; retour long ≥ %.0f s, --long pour changer) : secondes · gels · gels/min · hors boucle/min"%(nc,', %d au plafond de G (sous-comptées)'%cap if cap else '',LONG))
    for s9,v in sorted(VU.items(),key=lambda x:x[1][0]):print('  séance %s : premier retour long + pivot dans la course du %s, à %.0f s (arrière-plan de %d s)'%(s9,v[0],v[1],v[2]))
    print('  %-9s | %-36s | %-36s | %s'%('thermique','AVANT','APRÈS','TOUT'))
    f9=lambda x:'%5d s %4d gels %5.1f/min (hb %5.1f)'%(x[0],x[1],x[1]/x[0]*60,x[2]/x[0]*60) if x and x[0] else '%36s'%'—'
    for th in sorted(set(k[0] for k in X)):
        a=X.get((th,'avant'));p=X.get((th,'après'));t=[sum(z[j] for z in (a,p) if z) for j in range(3)]
        print('  %-9s | %s | %s | %s'%(THN.get(th,th),f9(a),f9(p),f9(t)))
    for ph in ('avant','après'):
        t=[sum(X[k][j] for k in X if k[1]==ph) for j in range(3)]
        if t[0]:print('  %-9s   %s'%('tout '+ph,f9(t)))


# (2026-11-17, lot MESURE-RAFALES) LES RAFALES : des paquets de secondes où le fil entier ralentit (vol 1448 : une image sur 3-4 pèse ~115 ms, tranches de montant FIXE).
# Détection : une seconde est « en rafale » si elle porte ≥ 2 loops ≥ 80 ms dont ≥ 4 tranches dépassent ×3 leur référence (fil_entier) ; deux secondes de rafale à ≤ 2 s
# l'une de l'autre = la même rafale. Source : c.LH (loops > 60 ms, builds du lot ; c.H avant le 3e tour) ; sinon G (loop d'avant G[3], tranches G[10:18], seconde G[0] : l'ancien format).
# Par rafale (builds du lot) : la PART D'ATTENTE DE LA PUCE (appels WebGL synchrones + Canvas 2D + envois WebGL, en % de la loop lourde), les sous-tranches dominantes
# (ms par loop lourde contre leur référence c.SR sur les images légères), les sentinelles début / après rendu / fin (contre la base de la course), la sentinelle Swift et
# le retard du battement natif, la pression mémoire. Puis le croisement économie × thermique × branché en gels « fil entier » par minute (tous formats, M ≥ 12 colonnes).
# Lecture : passation/qualite/mesure-rafales.md.
def classe_gel(g,ref):
    dw,lAv,gap,cS=g[1],g[3],g[5],g[6];saut=g[33] if len(g)>33 else 0
    parts={'boucle':lAv-33,'rappels':cS,'reste':gap-cS-20,'sautes':saut}
    return max(parts,key=parts.get)=='boucle' and bool(fil_entier(g[10:18],ref))
def lourdes(c,ref):
    # [(t s, loop ms, ligne H ou None, tranches)] des loops « fil entier » ≥ 80 ms
    # (contrôle du lot) LH PLEIN (c.LHp loops perdues dès c.LHt) : après c.LHt on se REPLIE sur G (loop d'avant G[3], tranches G[10:18]) — sans sentinelles ni sous-tranches
    H,Hp,Ht=lh(c)[:3]
    if H is not None:
        o=[]
        for h in H:
            tr=[x/10 for x in h[13:21]]
            if h[1]/10>=80 and fil_entier(tr,ref):o.append((h[0]/10,h[1]/10,h,tr))
        if Hp:
            tH=(Ht if Ht is not None else (H[-1][0] if H else 0))/10
            o+=[(g[0],g[3],None,g[10:18]) for g in (c.get('G') or []) if g[0]>=tH and g[3]>=80 and fil_entier(g[10:18],ref)]
        return o,True
    return [(g[0],g[3],None,g[10:18]) for g in (c.get('G') or []) if g[3]>=80 and fil_entier(g[10:18],ref)],False
def rafales(ev):
    sec=collections.Counter(int(e[0]) for e in ev);S=sorted(s for s,n in sec.items() if n>=2);R=[]
    for s in S:
        if R and s-R[-1][1]<=2:R[-1][1]=s
        else:R.append([s,s])
    return R
def moy(v):return sum(v)/len(v) if v else None
def f2(v,fmt='%.2f'):return fmt%v if v is not None else '—'
def base_sentinelle(m):
    q=[[x[8]/100 for x in m[i:i+10] if x[8]>=0] for i in range(0,len(m),10)];mo=[sum(a)/len(a) for a in q if len(a)>=5]
    sv=[x[8]/100 for x in m if x[8]>=0]
    return max(min(mo),0.1) if mo else (max(sum(sv)/len(sv),0.1) if sv else None)
print("\n--- LES RAFALES (≥ 2 loops ≥ 80 ms « fil entier » dans la même seconde ; voir passation/qualite/mesure-rafales.md)")
NR=0
for c in C:
    G=c.get('G')
    if not G and lh(c)[0] is None:continue
    ref=reference(c,G or [[0]*40]) if G else [0.5]*8
    ev,neuf=lourdes(c,ref)
    R=rafales(ev)
    if not R:continue
    W=c.get('Mw',0);M=c.get('M') or [];m=[M[i:i+W] for i in range(0,len(M)-W+1,W)] if W else []
    base=base_sentinelle(m) if W>=12 and m else None
    _,Hp,Ht,HN,HNp,HNpN=lh(c);HN=HN or [];SR=c.get('SR') or [];SRn=c.get('SRn') or 0
    print(' %s %s %5.0f s  %s  · %d rafale(s)%s · sentinelle de base %s ms'%(c.get('d','')[5:16],c.get('v',''),c.get('dur',0),'>'.join(c.get('cartes',[])),len(R),'' if neuf else ' (ancien format : G seulement)',f2(base)))
    if Hp:print('  ⚠ LH PLEIN à %.0f s : %d loops lourdes perdues ; après, repli sur G (tranches seulement : ni sentinelles, ni attente puce, ni sous-tranches)'%((Ht or 0)/10,Hp))
    if c.get('Gp'):print('  ⚠ G PLEIN : %d gels perdus — le repli et les fils/min sous-comptent la fin de course'%c['Gp'])
    if c.get('Mp'):print('  ⚠ M PLEIN : %d secondes perdues en fin de course'%c['Mp'])
    if HNp:print('  ⚠ %d nom(s) de sous-tranche PERDUS (plus de case) : %s — leur temps ne s\'écrit nulle part'%(HNp,', '.join(HNpN or [])))
    SY=c.get('SY');ry=None
    if SY and SRn and SY[6]>0:ry=((SY[0]+SY[2]+SY[4])/SY[6],SY[0]/10/SRn,SY[2]/10/SRn,SY[4]/10/SRn,SY[1]/SRn,SY[3]/SRn,SY[5]/SRn)
    for a,b in R:
        NR+=1;e=[x for x in ev if a<=x[0]<b+1];lm=[x[1] for x in e]
        print('  RAFALE %d-%d s (%d s) : %d loops lourdes, médiane %.0f ms (min %.0f · max %.0f)'%(a,b,b-a+1,len(e),med(lm),min(lm),max(lm)))
        print('    tranches moyennes (ms) : %s'%' · '.join('%s %.1f'%(TR[i].split()[0],moy([x[3][i] for x in e])) for i in range(8)))
        hs=[x[2] for x in e if x[2] is not None]
        if hs:
            L=[h[1]/10 for h in hs];gs=[h[7]/10 for h in hs];c2=[h[9]/10 for h in hs];en=[h[11]/10 for h in hs]
            puce=[(h[7]+h[9]+h[11])/max(1,h[1]) for h in hs]
            print('    ATTENTE PUCE (part de la loop lourde) : %.0f %% en moyenne (max %.0f %%) · WebGL synchrones %.1f ms (%.1f appels) · Canvas 2D %.1f ms (%.1f appels) · envois WebGL %.1f ms (%.0f appels) par loop lourde'%(
                100*moy(puce),100*max(puce),moy(gs),moy([h[8] for h in hs]),moy(c2),moy([h[10] for h in hs]),moy(en),moy([h[12] for h in hs])))
            # ⚠ « ATTENTE PUCE » compte aussi l'ENCODAGE des appels (le processeur) et drawImage : à lire CONTRE la même part sur les images légères, jamais dans l'absolu
            if ry:print('      référence, images légères (%d) : %.0f %% de la loop · synchrones %.2f ms (%.1f appels) · 2D %.2f ms (%.1f) · envois %.2f ms (%.0f) par image  → rafale ×%s'%(
                SRn,100*ry[0],ry[1],ry[4],ry[2],ry[5],ry[3],ry[6],('%.1f'%(moy(puce)/ry[0])) if ry[0]>0 else '—'))
            else:print('      référence des images légères : absente (vol d\'avant le 2e tour du lot) — comparer aux ms/s hors rafale ci-dessous')
            sd=[h[3]/100 for h in hs if h[3]>=0];sr=[h[4]/100 for h in hs if h[4]>=0];sf=[h[5]/100 for h in hs if h[5]>=0]
            x=lambda v:(' (×%.1f)'%(moy(v)/base)) if v and base else ''
            print('    SENTINELLES des loops lourdes (ms) : début %s%s [%d] · après rendu %s%s [%d] · fin %s%s [%d]'%(f2(moy(sd)),x(sd),len(sd),f2(moy(sr)),x(sr),len(sr),f2(moy(sf)),x(sf),len(sf)))
            S=collections.defaultdict(float)
            for h in hs:
                k=21
                n=h[k] if len(h)>k else 0
                for j in range(n):S[h[k+1+2*j]]+=h[k+2+2*j]/10
            top=sorted(S.items(),key=lambda z:-z[1])[:10]
            if top:
                print('    SOUS-TRANCHES dominantes (ms par loop lourde · référence sur les images légères · écart) :')
                for i,v in top:
                    r9=(SR[i]/10/SRn) if SRn and i<len(SR) and SR[i] else 0;v9=v/len(hs)
                    print('      %6.1f ms  réf %5.2f  %s  %s'%(v9,r9,('×%.0f'%(v9/r9)) if r9>=0.05 else '   ',HN[i] if i<len(HN) else '#%d'%i))
        if W>=27 and m:
            dans=[x for i,x in enumerate(m) if a<=i<=b];hors=[x for i,x in enumerate(m) if not (a-3<=i<=b+3)]
            def col(L,j,k=1):
                v=[x[j]/k for x in L if x[j]>=0];return moy(v)
            print('    PAR SECONDE dans / hors rafale : sentinelle début %s / %s ms · Swift %s / %s µs · retard du battement natif %s / %s ms · WebGL sync %s / %s ms/s · 2D %s / %s ms/s · envois %s / %s ms/s · pression mémoire %s'%(
                f2(col(dans,23,100)),f2(col(hors,23,100)),f2(col(dans,25),'%.0f'),f2(col(hors,25),'%.0f'),f2(col(dans,26,10),'%.1f'),f2(col(hors,26,10),'%.1f'),
                f2(col(dans,17,10),'%.1f'),f2(col(hors,17,10),'%.1f'),f2(col(dans,19,10),'%.1f'),f2(col(hors,19,10),'%.1f'),f2(col(dans,21,10),'%.1f'),f2(col(hors,21,10),'%.1f'),
                dict(collections.Counter(x[24] for x in dans))))
    Y=c.get('Y')
    if Y:print('    appels à la puce de la course (les 8 plus coûteux : nombre, ms, pire ms) : '+' · '.join('%s %d/%.0f/%.1f'%(k,v[0],v[1]/10,v[2]/10) for k,v in sorted(Y.items(),key=lambda z:-z[1][1])[:8]))
if not NR:print('  aucune rafale')
# le croisement : chaque seconde de course (M[11] : thermique ×1000 + branché ×100 + autre musique ×10 + économie) × gels « fil entier » (G, classés comme dans « LES GELS : QUI »)
X=collections.OrderedDict();BR={0:'?',1:'non',2:'oui',3:'oui',9:'?'}
for c in C:
    W=c.get('Mw',0);M=c.get('M') or [];G=c.get('G')
    if W<12 or G is None:continue
    m=[M[i:i+W] for i in range(0,len(M)-W+1,W)]
    if not m:continue
    ref=reference(c,G) if G else [0.5]*8
    ev,_=lourdes(c,ref);rs=set()
    for a,b in rafales(ev):rs.update(range(a,b+1))
    k=lambda v:('oui' if v%10==1 else 'non' if v%10==0 else '?',{0:'nominal',1:'fair',2:'serious',3:'critical'}.get(v//1000,'?'),BR.get((v//100)%10,'?'))
    for i,x in enumerate(m):
        z=X.setdefault(k(x[11]),[0,0,0]);z[0]+=1;z[2]+=1 if i in rs else 0
    for g in G:
        if classe_gel(g,ref):
            i=min(max(int(g[0]),0),len(m)-1);X.setdefault(k(m[i][11]),[0,0,0])[1]+=1
if X:
    print('\n--- FILS ENTIERS × ÉCONOMIE × THERMIQUE × BRANCHÉ (gels « fil entier » de G par minute ; secondes en rafale)')
    print('  %-8s %-9s %-8s %8s %6s %9s %10s'%('économie','thermique','branché','secondes','fils','fils/min','en rafale'))
    O={'nominal':0,'fair':1,'serious':2,'critical':3,'?':4}
    for kk in sorted(X,key=lambda z:(z[0],O[z[1]],z[2])):
        s,n,r=X[kk];print('  %-8s %-9s %-8s %8d %6d %9.1f %9.0f %%'%(kk[0],kk[1],kk[2],s,n,n/s*60 if s else 0,100*r/s if s else 0))
