#!/usr/bin/env python3
"""P3 (2026-11-07) LE NIVEAU À GRANDE VITESSE : pour une map, la voiture lancée (dbgAuto nitro) aux paliers moteur demandés (dbgMoteur monte d'un cran à la fois), on relève par palier
dbgCout (appels et triangles de l'IMAGE ENTIÈRE) et dbgChamp (triangles dessinés / dans le champ / DERRIÈRE la caméra / au-delà du brouillard réel, par famille).
    python3 outils/banc-perf/p3-vitesse.py --json sortie.json [--tel0] [--paliers 4,10,16] [--qs '&x=1'] nuages:midi canyon:matin
Réutilise le lanceur de vitesse.py (autre branche : VITESSE_PY=chemin). Machine calme, un seul banc (verrou-banc.sh)."""
import sys,os,json,time,importlib.util
V=os.environ.get('VITESSE_PY',os.path.expanduser('~/cash-car/perf3/wt/banc2/outils/banc-perf/vitesse.py'))
sp=importlib.util.spec_from_file_location('vit',V);vit=importlib.util.module_from_spec(sp);sp.loader.exec_module(vit)
from cdp import CDP
gp=vit.gp
RACINE=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOSSIER=os.path.join(RACINE,'VERSION PRINCIPALE')
def lecture(c):
    c.ev("dbgCout(1);1");c.pump(.6)
    cout=json.loads(c.ev("JSON.stringify((function(){var k=dbgCout();return {appels:k.image&&k.image.calls,triangles:k.image&&k.image.tris}})())"))
    ch=json.loads(c.ev("JSON.stringify(dbgChamp())"))
    om=json.loads(c.ev("JSON.stringify(dbgOmbre())"))
    rr=c.ev("JSON.stringify(dbgRemplissage())")
    try:rm=json.loads(rr)
    except Exception:print('ÉCHEC dbgRemplissage :',str(rr)[:700]);raise
    st=json.loads(c.ev("JSON.stringify((function(){var s=dbgState();return {kmh:s.kmh||s.speedKmh,vH:s.vH}})())"))
    return {'image':cout,'champ':ch,'ombre':om,'remplissage':rm,'etat':st}
def main(av):
    tel0='--tel0' in av;pal=2;paliers=[4,10,16];qs='';js=None;cartes=[]
    i=0
    while i<len(av):
        a=av[i]
        if a=='--json':js=av[i+1];i+=2
        elif a=='--paliers':paliers=[int(x) for x in av[i+1].split(',')];i+=2
        elif a=='--qs':qs=av[i+1];i+=2
        elif a=='--pal':pal=int(av[i+1]);i+=2
        elif a=='--tel0':i+=1
        else:cartes.append(a.split(':'));i+=1
    res=[]
    http,port,srv,ch,prof=vit.lance(DOSSIER)
    try:
        c=CDP(port);c.keep={'Runtime.exceptionThrown'}
        for m in cartes:
            q='?garde=1&palier=%d%s&pistegraine=777&carte=%s&meteo=%s'%(pal,'' if tel0 else '&tel=1',m[0],m[1] if len(m)>1 else 'midi')+qs
            if not vit.demarre(c,http,q):res.append({'map':':'.join(m),'erreur':'démarrage'});continue
            c.ev("dbgSable(1);dbgQual(0);dbgAuto(1,0,{nit:1});1")
            for T in paliers:
                k=vit.monte(c,T);c.pump(6)
                L=[lecture(c) for _ in range(3)]
                r={'map':':'.join(m),'palier':T,'atteint':k,'lectures':L}
                res.append(r)
                p=L[-1]
                print('%-14s palier %2d (atteint %d) %3.0f km/h | image %3d appels %7d tri | dessinés %7d champ %7d DERRIÈRE %7d AU-DELÀ du brouillard (%.0f m) %7d'%(':'.join(m),T,k,p['etat'].get('kmh') or 0,p['image']['appels'],p['image']['triangles'],p['champ']['dessines'],p['champ']['dansLeChamp'],p['champ']['derriere'],p['champ']['brouillard'],p['champ']['auDelaDuBrouillard']))
                o=p['ombre'];print('      OMBRE : %d appels %d tri · par distance caisse (≤50 · 50-150 · 150-500 · 500+) %s · maillages %s'%(o['appels'],o['triangles'],o['parDistance'],o['maillagesParDistance']));[print('         ombre %-40s n=%3d tri %7d'%(f['k'][:40],f['n'],f['t'])) for f in o['fam'][:6]]
                R=p['remplissage'];tot=sum((q['ecrans'] or 0) for q in R['passes'])+R['ombre']['ecrans'];print('      REMPLISSAGE écran %dx%d (%.2f Mpx) : ombre %d² = %.2f écran ; passes : %s ; TOTAL cibles ≈ %.2f écrans + transparents scène %.2f écrans'%(R['ecran'][0],R['ecran'][1],R['mpx'],R['ombre']['carte'],R['ombre']['ecrans'],' '.join('%dx%d(%.2f%s)'%(q['w'],q['h'],q['ecrans'],'*' if q['scene'] else '') for q in R['passes']),tot,sum((q['aireTransparents'] or 0) for q in R['passes'] if q['scene'])));[print('         transp %-52s n=%3d %.2f écran'%(f['k'][:52],f['n'],f['ecrans'])) for f in R['transp'][:7]]
                print('      transparents : surface écran (clippée) par passe scène %s ; dont couleur nulle %s'%([q['aireTransparents'] for q in R['passes'] if q['scene'] and q['appels']>0],[q.get('aireCouleurNulle') for q in R['passes'] if q['scene'] and q['appels']>0]));print('      par distance (0-500 · 500-1000 · 1-2k · 2-3,5k · 3,5k+) :',p['champ']['parDistance'])
                for f in p['champ']['fam'][:5]:print('      %-46s n=%2d dessinés %7d champ %7d derrière %3d'%(f['k'][:46],f['n'],f['dr'],f['di'],f['derriere']))
    finally:
        vit.ferme(srv,ch,prof)
        if js:json.dump({'date':time.strftime('%Y-%m-%d %H:%M'),'charge':os.getloadavg()[0],'mesures':res},open(js,'w'),indent=1,ensure_ascii=False)
main(sys.argv[1:])
