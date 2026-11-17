#!/usr/bin/env python3
# BANC DE CHALEUR v3 — LE PLANCHER (page noire : écran + système), lu dans les REPOS de la série : plancher.py ["AAAA-MM-JJ HH:MM" de départ]
# Pour chaque repos (entre la FIN d'un essai et le DEBUT du suivant, marques.txt) : puissance moyenne des 120 dernières secondes (compteurs de la jauge), charge ou non.
import sys, re, os, statistics as S
from datetime import datetime
R = os.path.expanduser('~/cash-car/ios-ultime-mesures/chaleur')
dep = sys.argv[1] if len(sys.argv) > 1 else '2026-11-17 04:05'
ts = lambda h: datetime.strptime(h[:19], '%Y-%m-%d %H:%M:%S').timestamp()
M = [l.split()[:4] for l in open(R + '/marques.txt') if l[:16] >= dep]
B = []
for l in open(R + '/batterie.txt'):
    if l[:16] < dep: continue
    d = dict(re.findall(r'(\w+)=(-?\d+)', l))
    if 'accn' in d: B.append((ts(l), int(d['accl']), int(d['accn']), int(d.get('charge', 0)), int(d['tbat'])))
out = []
for i in range(len(M) - 1):
    if M[i][2] == 'FIN' and M[i + 1][2] == 'DEBUT':
        a, b = ts(M[i + 1][0] + ' ' + M[i + 1][1]) - 120, ts(M[i + 1][0] + ' ' + M[i + 1][1])
        A = [x for x in B if a <= x[0] <= b]
        if len(A) >= 2 and A[-1][2] > A[0][2]:
            w = (A[-1][1] - A[0][1]) / (A[-1][2] - A[0][2]) / 1000; ch = max(x[3] for x in A)
            out.append((M[i + 1][3], w, ch)); print('%-18s %.2f W%s  tbat %.1f °C' % ('avant ' + M[i + 1][3], w, ' (EN CHARGE)' if ch else '', A[-1][4] / 100))
for ch in (0, 1):
    v = [w for n, w, c in out if c == ch]
    if v: print('plancher %s : %.2f W (n=%d, écart-type %.2f)' % ('en charge' if ch else 'sans charge', S.mean(v), len(v), S.pstdev(v) if len(v) > 1 else 0))
