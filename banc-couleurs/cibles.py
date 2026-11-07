#!/usr/bin/env python3
# LES CIBLES PAR TEMPS et la PROPOSITION de retouche par couple (→ le tableau EQM du morceau rendu/equilibre-maps.js).
#   python3 banc-couleurs/cibles.py            → le tableau des écarts
#   python3 banc-couleurs/cibles.py --js       → le JS des deux pistes A (doux) et B (pop)
import json, os, sys, subprocess, math
ICI = os.path.dirname(os.path.abspath(__file__))
PY = sys.executable
rows = json.loads(subprocess.check_output([PY, os.path.join(ICI, 'tableau.py'), '--json']).decode())
# famille de temps d'un couple
def fam(c, m):
    if c == 'grotte': return 'grotteNuit' if m == 'nuit' else 'grotte'
    if c == 'espace': return 'espace'
    if c == 'ville': return 'ville'
    m = m.split('-')[0]
    if m in ('matin', 'midi'): return 'jour'
    if m == 'soir': return 'soir'
    if m == 'nuit': return 'nuit'
    if m in ('pluie', 'neige', 'glace'): return 'pluie'
    return 'orage'
# cibles : L* moyen [min,max], chroma mini, route L* [min,max], noirs du bas maxi (%)
CIBLE = {
    'jour':      dict(L=(50, 57), C=50, R=(32, 45), noir=4),
    'soir':      dict(L=(42, 48), C=60, R=(24, 34), noir=6),
    'nuit':      dict(L=(21, 27), C=52, R=(15, 23), noir=10),
    'pluie':     dict(L=(44, 50), C=40, R=(30, 42), noir=5),
    'orage':     dict(L=(29, 35), C=52, R=(18, 27), noir=10),
    'grotte':    dict(L=(30, 38), C=48, R=(22, 32), noir=12),
    'grotteNuit':dict(L=(17, 22), C=45, R=(14, 20), noir=20),
    'espace':    dict(L=(28, 36), C=40, R=(28, 40), noir=12),
    'ville':     dict(L=(17, 23), C=70, R=(16, 24), noir=30),
}
POP = dict(C=1.15, con=1.04)  # la piste B : plus de chroma et un cran de contraste en plus
def clamp(v, a, b): return max(a, min(b, v))
def retouche(r, pop):
    f = fam(r['carte'], r['meteo']); T = CIBLE[f]; o = {}
    L = r['L']; Lt = clamp(L, *T['L'])
    if abs(Lt - L) > 1.5:
        o['expo'] = round(clamp((Lt / L) ** 2.0, .7, 1.6), 3)
    Ct = T['C'] * (POP['C'] if pop else 1)
    if r['C'] < Ct - 2:
        k = Ct / max(1, r['C'])
        o['sat'] = round(clamp(k ** .8, 1.0, 1.35), 3)       # la saturation du grade (plafond : le « Cheetos »)
        if k > 1.12: o['chr'] = round(clamp((k - 1) * .6, 0, .45), 2)  # et l'AIR lui-même (brume, ciel, remplissage) moins gris
    elif r['C'] > Ct + 22:
        o['sat'] = round(clamp((Ct + 10) / r['C'], .85, 1.0), 3)
    R = r['route']; Rt = clamp(R, *T['R'])
    if abs(Rt - R) > 3 and R > 2:
        o['rtK'] = round(clamp((Rt / R) ** 1.4, .55, 1.6), 3)
    if r['noir'] > T['noir']:
        k = clamp((r['noir'] - T['noir']) / 40, .1, 1)
        o['lev'] = [round(.004 * k, 4), round(.008 * k, 4), round(.018 * k, 4)]  # un plancher d'encre bleue, jamais gris
        if r['vig'] and r['vig'] > .3: o['vigK'] = round(max(.26, r['vig'] - .12), 2)
        if (r['sunI'] or 0) + (r['hemiI'] or 0) < 1.3: o['lum'] = round(1 + .3 * k, 2)
    if r['Lsd'] < 11: o['con'] = round(1.06 * (POP['con'] if pop else 1), 3)
    elif pop: o['con'] = POP['con']
    return f, o
if '--js' in sys.argv:
    for p, pop in (('A', False), ('B', True)):
        L = []
        for r in rows:
            f, o = retouche(r, pop)
            if o: L.append(" %s:%s /* %s %s · L* %.0f chroma %.0f route %.0f noirs %.0f %% */" % (json.dumps(r['bio']), json.dumps(o, separators=(',', ':')), r['carte'], r['meteo'], r['L'], r['C'], r['route'], r['noir']))
        print('EQM.%s={\n%s};' % (p, ',\n'.join(L)))
else:
    print('%-9s %-12s %-10s | %5s %5s %5s %5s | %s' % ('carte', 'meteo', 'famille', 'L*', 'chrom', 'route', 'noir%', 'retouche A'))
    for r in rows:
        f, o = retouche(r, False)
        T = CIBLE[f]
        print('%-9s %-12s %-10s | %5.0f %5.0f %5.0f %5.0f | %s' % (r['carte'], r['meteo'], f, r['L'], r['C'], r['route'], r['noir'], json.dumps(o)))
