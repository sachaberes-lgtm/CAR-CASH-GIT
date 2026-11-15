#!/usr/bin/env python3
# Compare les sources de shader relevées par banc.cjs --sources 1 (deux fichiers <tag>-sources.json : {empreinte: source}).
#   python3 outils/banc-ombre-image/compare-sources.py A-sources.json B-sources.json [--motif lpS(]
# Rend : le nombre de sources de chaque côté, celles qui n'existent que d'un côté (avec leur 1re ligne distinctive), et pour le motif (par défaut la loupe, « lpS( »)
# l'égalité exacte des sources qui le contiennent.
import sys, json, difflib
a = sys.argv[1:]; motif = 'lpS('
if '--motif' in a: i = a.index('--motif'); motif = a[i + 1]; del a[i:i + 2]
A = json.load(open(a[0])); B = json.load(open(a[1]))
print('A', a[0], len(A), 'sources uniques ; B', a[1], len(B))
seulA = [k for k in A if k not in B]; seulB = [k for k in B if k not in A]
print('identiques :', len(set(A) & set(B)), '· seulement A :', len(seulA), '· seulement B :', len(seulB))
def resume(s):
    L = [l for l in s.split('\n') if l.strip() and not l.startswith('#') and 'precision' not in l]
    return (L[0] if L else '')[:140]
for k in seulA: print('  A seul', k, len(A[k]), resume(A[k]))
for k in seulB: print('  B seul', k, len(B[k]), resume(B[k]))
la = sorted([A[k] for k in A if motif in A[k]]); lb = sorted([B[k] for k in B if motif in B[k]])
print('motif', repr(motif), ': A', len(la), 'B', len(lb), '· égales au caractère près :', la == lb)
if la != lb and la and lb:
    for l in list(difflib.unified_diff(la[0].split('\n'), lb[0].split('\n'), lineterm='', n=0))[:40]: print('   ', l[:220])
# les paires « seulement A / seulement B » les plus proches : où est l'écart ?
for k in seulA[:6]:
    best = None
    for j in seulB:
        r = difflib.SequenceMatcher(None, A[k][:4000], B[j][:4000]).quick_ratio()
        if best is None or r > best[0]: best = (r, j)
    if best and best[0] > .9:
        d = [l for l in difflib.unified_diff(A[k].split('\n'), B[best[1]].split('\n'), lineterm='', n=0) if l[:1] in '+-' and l[:3] not in ('+++', '---')]
        print('  écart', k, '↔', best[1], ':', len(d), 'lignes ;', ' | '.join(x[:160] for x in d[:6]))
