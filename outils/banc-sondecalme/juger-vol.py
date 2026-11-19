#!/usr/bin/env python3
# JUGER LE LOT sondecalme SUR UN VOL (2026-11-18). Lit une boîte de vol (le .json de lire-vol.sh : la liste des courses) et dit, course par course puis en tout :
#   · gels hors boucle par minute (G, même règle que analyse-vol.py : hors boucle ≥ ½ intervalle, ou loop d'avant < 40 ms) ;
#   · « à un entier de seconde » : part des gels hors boucle dont un gel précédent (≤ 10 s) est à n s ± 0,15 (le battement à 1 Hz du vol 1118-0416 : ≈ 80 %) ;
#   · BATTEMENT DANS LE TROU (seulement avec le lot : G[51]) : part des gels hors boucle où un battement natif est arrivé dans le trou, contre la part attendue au hasard
#     (somme des trous / 1000 ms) — la PREUVE DIRECTE : avec l'ancien battement sur .main elle doit être bien au-dessus du hasard, avec le lot ≈ le hasard ;
#   · c.SW : attente du fil principal de l'app (µs), retard du battement (ms), sentinelle Swift (temps processeur et horloge) ;
#   · M[25] (sentinelle) et R[0] de la 1re seconde (doit être ≈ 30, plus des milliers).
# Usage : python3 outils/banc-sondecalme/juger-vol.py vol.json [vol2.json …]   (plusieurs vols : un bloc par vol, pour comparer avec / sans le lot)
import json, sys, statistics as st

def q(v, p):
    v = sorted(v)
    return v[min(len(v) - 1, int(len(v) * p))] if v else None

def f(x, fmt='%.0f'):
    return '—' if x is None else fmt % x

def hors_boucle(g):
    return g[5] >= g[1] * .5 or g[3] < 40

def juge(chemin):
    C = json.load(open(chemin))
    if isinstance(C, dict):
        C = C.get('courses') or C.get('c') or []
    print('\n=== %s : %d courses' % (chemin, len(C)))
    T = dict(s=0, ser=0, hb=0, ent=0, dans=0, attendu=0.0, nb51=0, att=[], ret=[], cpu=[], mur=[], m25=[], r0=[])
    for k, c in enumerate(C):
        G = c.get('G')
        if G is None:
            continue
        dur = c.get('dur') or 0
        th = c.get('th') or [0] * 5
        hb = [g for g in G if hors_boucle(g)]
        tt = [g[0] for g in hb]
        ent = 0
        for i, t in enumerate(tt):
            for j in range(i - 1, -1, -1):
                d = t - tt[j]
                if d > 10:
                    break
                if d >= .85 and abs(d - round(d)) <= .15:
                    ent += 1
                    break
        a51 = [g for g in hb if len(g) > 51]
        dans = sum(1 for g in a51 if g[51] >= 0)
        attendu = sum(min(1.0, g[1] / 1000) for g in a51)
        W = c.get('Mw', 0)
        M = c.get('M') or []
        m25 = [M[i + 25] for i in range(0, len(M) - W + 1, W)] if W >= 27 else []
        m25 = [x for x in m25 if x >= 0]
        SW = c.get('SW') or []
        sw = [SW[i:i + 5] for i in range(0, len(SW) - 4, 5)]
        att = [x[3] for x in sw if x[3] >= 0]
        ret = [x[2] / 10 for x in sw if x[2] >= 0]
        cpu = [x[1] for x in sw if x[1] >= 0]
        mur = [x[4] for x in sw if x[4] >= 0]
        R = c.get('R') or []
        r0 = R[0] if R else None
        T['s'] += dur
        T['ser'] += th[2] + th[3]
        T['hb'] += len(hb)
        T['ent'] += ent
        T['dans'] += dans
        T['attendu'] += attendu
        T['nb51'] += len(a51)
        for n in ('att', 'ret', 'cpu', 'mur', 'm25'):
            T[n] += locals()[n]
        if r0 is not None:
            T['r0'].append(r0)
        print('  course %2d  %5.0f s  serious+ %3d s  gels hors boucle %4d (%5.1f/min)  à un entier de s %3.0f %%  battement dans le trou %s  attente fil app q50/q90/pire %s/%s/%s µs  retard q90 %s ms  M[25] q50 %s µs  R[0] 1re s %s' % (
            k, dur, th[2] + th[3], len(hb), len(hb) / dur * 60 if dur else 0, 100 * ent / len(hb) if hb else 0,
            ('%d/%d (hasard %.0f)' % (dans, len(a51), attendu)) if a51 else '— (pas de G[51])',
            f(q(att, .5)), f(q(att, .9)), f(max(att) if att else None), f(q(ret, .9), '%.1f'), f(q(m25, .5)), r0))
    if not T['s']:
        print('  aucune course à mouchard')
        return
    print('  --- EN TOUT : %.0f s de course (dont serious+ %d s) · gels hors boucle %d = %.1f/min · à un entier de seconde %.0f %%' % (
        T['s'], T['ser'], T['hb'], T['hb'] / T['s'] * 60, 100 * T['ent'] / T['hb'] if T['hb'] else 0))
    if T['nb51']:
        print('      battement natif DANS le trou : %d / %d gels = %.0f %% (hasard : %.0f %%)' % (T['dans'], T['nb51'], 100 * T['dans'] / T['nb51'], 100 * T['attendu'] / T['nb51']))
    else:
        print('      battement natif dans le trou : non mesuré (vol d\'avant le lot, ou ?sans=sondecalme)')
    print('      c.SW : %d battements · attente du fil principal de l\'app q50 %s · q90 %s · q99 %s · pire %s µs · retard du battement q50 %s · q90 %s ms · sentinelle processeur q50 %s µs · horloge q50 %s µs' % (
        len(T['ret']), f(q(T['att'], .5)), f(q(T['att'], .9)), f(q(T['att'], .99)), f(max(T['att']) if T['att'] else None),
        f(q(T['ret'], .5), '%.1f'), f(q(T['ret'], .9), '%.1f'), f(q(T['cpu'], .5)), f(q(T['mur'], .5))))
    print('      M[25] q10/q50/q90 %s / %s / %s µs (%d mesures) · R[0] de la 1re seconde : q50 %s, pire %s' % (
        f(q(T['m25'], .1)), f(q(T['m25'], .5)), f(q(T['m25'], .9)), len(T['m25']), f(q(T['r0'], .5)), f(max(T['r0']) if T['r0'] else None)))

for p in sys.argv[1:]:
    juge(p)
