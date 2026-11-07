#!/usr/bin/env python3
# AVANT → PISTE : L* / chroma / route / noirs côte à côte.  python3 banc-couleurs/compare.py A [B]
import json, os, sys, subprocess
ICI = os.path.dirname(os.path.abspath(__file__)); PY = sys.executable
def lit(d):
    env = dict(os.environ, ETAL=d); return {(r['carte'], r['meteo']): r for r in json.loads(subprocess.check_output([PY, os.path.join(ICI, 'tableau.py'), '--json'], env=env).decode())}
A = lit('etal'); P = {p: lit('etal-' + p) for p in sys.argv[1:]}
print('%-9s %-12s | %-22s' % ('carte', 'meteo', 'AVANT L* chr route noir') + ''.join(' | %-22s' % ('PISTE ' + p + ' L* chr rte noir') for p in P))
for k, r in A.items():
    s = '%-9s %-12s | %4.0f %4.0f %4.0f %4.0f     ' % (k[0], k[1], r['L'], r['C'], r['route'], r['noir'])
    for p in P:
        q = P[p].get(k); s += ' | ' + ('%4.0f %4.0f %4.0f %4.0f     ' % (q['L'], q['C'], q['route'], q['noir']) if q else '      —')
    print(s)
