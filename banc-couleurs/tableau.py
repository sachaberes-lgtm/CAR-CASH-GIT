#!/usr/bin/env python3
# Le TABLEAU des mesures : une ligne par couple map × météo (banc-couleurs/etal/*.json) — L* moyen, écart, saturation, noirs du bas, zones, étalonnage effectif.
import json, os, sys, glob
ICI = os.path.dirname(os.path.abspath(__file__))
ORDRE = ['nuages','crypto','ville','jade','foret','banquise','espace','grotte','canyon','dunes']
MET = ['matin','midi','soir','nuit','pluie','orage','orage-vert','orage-jaune','neige','glace']
rows = []
for f in glob.glob(os.path.join(ICI, os.environ.get('ETAL', 'etal'), '*.json')):
    n = os.path.basename(f)[:-5]; c, _, m = n.partition('-')
    try: J = json.load(open(f))
    except Exception: continue
    if not J or not J.get('mesure'): continue
    M = J['mesure']; E = J.get('etal') or {}; B = (J.get('bio') or {}).get('cur') or {}
    rows.append(dict(carte=c, meteo=m, bio=(J.get('bio') or {}).get('name'), L=M['L'], Lsd=M['Lsd'], S=M['S']*100, C=M['C'], noir=M['noirBas']*100,
        ciel=M['ciel']['L'], route=M['route']['L'], routeS=M['route']['S']*100, bords=(M['gauche']['L']+M['droite']['L'])/2,
        expo=E.get('expo'), sat=E.get('sat'), con=E.get('con'), vig=E.get('vigK'), sunI=B.get('sunI'), hemiI=B.get('hemiI'), hist=M['hist']))
rows.sort(key=lambda r: (ORDRE.index(r['carte']) if r['carte'] in ORDRE else 99, MET.index(r['meteo']) if r['meteo'] in MET else 99))
if '--json' in sys.argv: print(json.dumps(rows)); sys.exit()
print('%-9s %-12s %-18s %5s %5s %5s %5s %5s | %5s %5s %5s %5s | %5s %5s %5s %4s %5s %5s' % ('carte','meteo','ambiance','L*','ecart','sat%','chrom','noir%','ciel','route','rtS%','bords','expo','sat','con','vig','sunI','hemiI'))
for r in rows:
    print('%-9s %-12s %-18s %5.1f %5.1f %5.1f %5.1f %5.1f | %5.1f %5.1f %5.1f %5.1f | %5.2f %5.2f %5.2f %4.2f %5.2f %5.2f' % (r['carte'], r['meteo'], (r['bio'] or '')[:18], r['L'], r['Lsd'], r['S'], r['C'], r['noir'], r['ciel'], r['route'], r['routeS'], r['bords'], r['expo'] or 0, r['sat'] or 0, r['con'] or 0, r['vig'] or 0, r['sunI'] or 0, r['hemiI'] or 0))
