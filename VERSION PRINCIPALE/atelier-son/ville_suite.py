"""LA VILLE, NIVEAUX 6 À 10 (2026-10-05, Léo : « fais les 4 prochains niveaux en t'inspirant de la base, prends des libertés et fais
évoluer ; le but final : qu'à la cinq on ressente dans la musique EXPLOSION, ARGENT, BOOMIN, LUXURY »). La suite de NÉON COMPLÈTE : même
tonalité (la majeur / fa# mineur), même monde (Juno, cuivre CS-80, cloches de verre, boom et plocs), puis l'histoire monte vers l'argent :
  6 · PLUIE D'OR      — la base de NÉON 5, des charleys en croches, des pièces qui tintent sur les contretemps, une mélodie neuve.
  7 · SOUS-SOL        — on descend : fa# m · ré · mi · do# m, demi-tempo trap (clap sur le 3), une 808 qui glisse, des roulements de charleys,
                         violoncelle, le lead plus sombre et plus rare.
  8 · PENTHOUSE       — le luxe : si m9 · mi9 · la maj9 · fa# m9, Rhodes généreux, glissandos de HARPE, cordes, pièces, le lead qui s'élève.
  9 · CHAMBRE FORTE   — la tension avant le butin : les cordes en STACCATO qui martèlent (façon Metro Boomin), 808, gong, le motif qui grimpe.
 10 · CASH EXPLOSION — le final : tout explose — une fanfare de CUIVRES de luxe qui double le lead, cordes, 808 qui gronde, roulements,
                         la CAISSE ENREGISTREUSE sur le 1er temps, une PLUIE DE PIÈCES à chaque tour, le gong, les cloches.
Même moteur que neon_ville.py (les mêmes champs que les JSON du Studio : instruments, variantes pondérées, vol, rev, prob, pump…), plus
de nouveaux instruments : bass808, clap, hat (x fermé · o ouvert · r roulement en triolets), strings, harp, brass, coins, kaching.
Les définitions sont aussi écrites en JSON dans `ville-6-10.json` (pour les reprendre dans le Studio).
Sorties : assets/audio/music/ville/ville-n6…n10.m4a. Lancer : <venv>/python atelier-son/ville_suite.py [n]
"""
import os, sys, json, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import neon_ville as NV
from boucles import *  # noqa: F403

SORTIE = NV.SORTIE
m = NV.midi

# ---------------------------------------------------------------------------- les nouveaux instruments
def bass808(n, dur, v, de, P, prec=[None]):
    nn = int((dur + .06) * SR); t = np.arange(nn) / SR; f1 = hz(n); f0 = hz(prec[0]) if prec[0] else f1
    f = f1 + (f0 - f1) * np.exp(-t / .06); prec[0] = n
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(nn, .003, 9, 1, .07, dur) * (.85 + .15 * np.exp(-t / .05))
    return np.tanh(s * 2.2) * .75


def strings(notes, dur, v, de, P):
    stac = dur < .3; L = 0; R = 0
    for n in notes:
        l, r = supersaw(n, dur + (.15 if stac else .6), 3, 10, de); L = L + l; R = R + r
    nn = len(L); e = env(nn, .006 if stac else .12, .08 if stac else 9, .0 if stac else 1, .08 if stac else .5, dur)
    fc = 3200 if stac else 2200
    return filtre(L * e / len(notes), 'low', fc), filtre(R * e / len(notes), 'low', fc)


def harp(notes, dur, v, de, P):
    """un GLISSANDO de harpe : les notes de l'accord sur deux octaves, égrenées vite (Karplus)"""
    seq = sorted(notes) + [x + 12 for x in sorted(notes)]; out = np.zeros(int((dur + 2.5) * SR))
    for i, n in enumerate(seq):
        k = karplus(n, 2.2, .6, .9975, de); a = int(i * .045 * SR); out[a:a + len(k)] += k[:len(out) - a] * (.6 + .4 * i / len(seq))
    return filtre(out, 'high', 150), None


def brass(notes, dur, v, de, P):
    """les CUIVRES DE LUXE : scies passées dans deux formants de cuivre (1,1 et 2,6 kHz), le souffle à l'attaque, un trombone dessous"""
    L = 0; nn = int((dur + .35) * SR); t = np.arange(nn) / SR
    for n in notes:
        f = hz(n) * (1 + .004 * np.sin(2 * np.pi * 5.6 * t + n))
        s = scie(f, nn) + .5 * scie(f * 1.004, nn) + .35 * scie(f / 2, nn)
        L = L + passe_bande(s, 700, 1600) * 1.2 + passe_bande(s, 2200, 3200) * .5 + filtre(s, 'low', 500) * .4
    e = env(nn, .025, .2, .75, .12, dur); souf = passe_bande(de.bruit(nn), 1500, 5000) * np.exp(-t / .03) * .15
    return np.tanh((L / len(notes) * e + souf) * 1.4) * .6, None


def coins(de, P, rng):
    """une PLUIE DE PIÈCES : de petites cloches de métal aux hauteurs de la gamme qui tombent en grappe"""
    nn = int(1.1 * SR); out = np.zeros(nn); gam = [81, 83, 85, 88, 90, 93, 95, 97]
    for i in range(int(P.get('nb', 9))):
        n = gam[rng.integers(len(gam))]; a = int((i * .055 + rng.random() * .03) * SR)
        x = fm(n, .35, 5.2, 2.2, .01, .07)[:nn - a]; out[a:a + len(x)] += x * (.5 + .5 * rng.random())
    return filtre(out, 'high', 1500) * .7


def kaching(de, P):
    """la CAISSE ENREGISTREUSE : le tiroir qui claque (bruit + coup grave) et la double sonnette d'or"""
    nn = int(1.4 * SR); t = np.arange(nn) / SR
    tir = passe_bande(de.bruit(nn), 200, 1800) * np.exp(-t / .025) * .8 + np.sin(2 * np.pi * 90 * t) * np.exp(-t / .06) * .6
    ding = np.zeros(nn); a = int(.07 * SR)
    for k, n in enumerate((93, 98)):
        x = fm(n, 1.1, 2.76, 1.4, .02, .45); o = a + int(k * .09 * SR); ding[o:o + len(x)] += x[:nn - o] * .7
    return tir + ding


def hat(de, ouvert=False):
    return filtre(charley(de, ouvert, 9500), 'high', 7000) * (1.3 if not ouvert else .9)


NV.NOTE_INST.update({'bass808': bass808})
NV.BASE.update({'bass808': .5, 'strings': .55, 'harp': .2, 'brass': .8, 'coins': .26, 'kaching': .55, 'clap': .45, 'hat': .2})   # (mesuré : cordes, cuivres et pièces étaient enterrés à −27/−34 dB)


def rendre_suite(D, graine):
    """le moteur de neon_ville + les pistes neuves (posées ici, puis le reste par NV.rendre)"""
    base_tr = [t for t in D['tracks'] if t['inst'] in NV.BASE and t['inst'] not in ('strings', 'harp', 'brass', 'coins', 'kaching', 'clap', 'hat')]
    neuves = [t for t in D['tracks'] if t not in base_tr]
    D2 = dict(D); D2['tracks'] = base_tr
    # on capte le Morceau de NV.rendre pour y poser les pistes neuves avant le mixage
    orig_fin = NV.fin; reg = {}
    def fin2(M, gains, **k):
        de = M.de; dc = M.dc; rng = np.random.default_rng(graine + 7); bars = M.mes
        for tr in neuves:
            ins = tr['inst']; lg = tr.get('len', 4); g = NV.BASE[ins] * 10 ** (tr.get('vol', 0) / 20); pst = M.piste(ins); prob = tr.get('prob', 1.)
            for c in range(bars // lg):
                base = c * lg * 16 * dc; var = NV.tirer(tr['variants'], rng)
                if 'pattern' in var:
                    pat = var['pattern']; reps = max(1, lg * 16 // len(pat))
                    for rep in range(reps):
                        for i, ch in enumerate(pat):
                            if ch == '.' or rng.random() > prob: continue
                            t = base + (rep * len(pat) + i) * dc
                            if ins == 'hat':
                                if ch == 'r':
                                    for j in range(3): pst.pose(t + j * dc / 3, hat(de), g * (.55 + .2 * j), .3)
                                else: pst.pose(max(0., t + rng.normal(0, .003)), hat(de, ch == 'o'), g * (1 if (i % 4 == 0) else .75), .3)
                            elif ins == 'clap': pst.pose(t, clap(de, .2) * 1.1, g, .05); pst.pose(t, caisse(de, 200, .8, .12, 2400), g * .35, -.05)
                            elif ins == 'coins': pst.pose(t, coins(de, tr, rng), g, .3 * np.sin(c + i))
                            elif ins == 'kaching': pst.pose(t, kaching(de, tr), g, .15)
                    continue
                for p, nm, ln, v in var['notes']:
                    if prob < 1 and rng.random() > prob: continue
                    t = base + p * dc; d = ln * dc; ns = NV.notes_de(nm)
                    l, r = {'strings': strings, 'harp': harp, 'brass': brass}[ins](ns, d, v, de, tr)
                    if r is None: pst.pose(t, l, g * v, {'harp': -.35, 'brass': .1}.get(ins, 0))
                    else: pst.pose2(t, l, r, g * v)
            reg[ins] = tr
        for ins, tr in reg.items():
            if tr.get('pump') and ins in M.bus:
                gp = pompe(M.n, NV._kicks if NV._kicks else [M.t(mm, p) for mm in range(bars) for p in (0, 8)], tr['pump'], .16); M.bus[ins].L *= gp; M.bus[ins].R *= gp
        if 'brass' in M.bus:
            eL, eR = echo(M.bus['brass'].L, M.bus['brass'].R, M.temps * .75, .3); M.bus['brass'].L += eL * .25; M.bus['brass'].R += eR * .25
        from boucles8 import fx_rev
        fx_rev(M, [(i, tr.get('rev', 0)) for i, tr in reg.items() if tr.get('rev')], 3., .4, 5000)
        g2 = dict(gains); g2.update({i: 1 for i in reg}); g2['fx'] = 1
        return orig_fin(M, g2, **k)
    NV.fin = fin2
    try: return NV.rendre(D2, graine)
    finally: NV.fin = orig_fin


# ---------------------------------------------------------------------------- l'écriture : progressions, basses, mélodies
PROG = {
    'base': [(0, ['F#3', 'A3', 'D4', 'E4'], 32, 'F#1'), (32, ['G3', 'B3', 'D4', 'F#4'], 16, 'G1'), (48, ['E3', 'G#3', 'B3', 'E4'], 16, 'F#1')],
    'sombre': [(0, ['F#3', 'A3', 'C#4', 'E4'], 16, 'F#1'), (16, ['D3', 'F#3', 'A3', 'C#4'], 16, 'D1'), (32, ['E3', 'G#3', 'B3', 'D4'], 16, 'E1'), (48, ['C#3', 'E3', 'G#3', 'B3'], 16, 'C#1')],
    'luxe': [(0, ['B2', 'D3', 'F#3', 'A3', 'C#4'], 16, 'B1'), (16, ['E3', 'G#3', 'D4', 'F#4'], 16, 'E1'), (32, ['A2', 'C#3', 'E3', 'G#3', 'B3'], 16, 'A1'), (48, ['F#2', 'A2', 'C#3', 'E3', 'G#3'], 16, 'F#1')],
}


def nom_oct(n, d):  # « F#1 » → « F#2 » (d octaves)
    return n[:-1] + str(int(n[-1]) + d)


def juno_de(pr, vol=0, rev=.45, pump=.3): return {'inst': 'juno', 'len': 4, 'rev': rev, 'vol': vol, 'pump': pump, 'drift': {'min': 1400, 'max': 3800, 'period': 16},
                                                  'variants': [{'notes': [[p, ch, l, .5] for p, ch, l, b in PROG[pr]]}]}
def sub_de(pr, vol=-18): return {'inst': 'sub', 'vol': vol, 'len': 4, 'variants': [{'notes': [[p, b, l, .7] for p, ch, l, b in PROG[pr]]}]}
def bass808_de(pr, vol=0):
    v1 = []; v2 = []
    for p, ch, l, b in PROG[pr]:
        r = nom_oct(b, 1)
        for bar in range(l // 16):
            o = p + bar * 16
            v1 += [[o, r, 6, .9], [o + 6, r, 2, .7], [o + 8, nom_oct(r, 1) if bar % 2 else r, 4, .8], [o + 14, r, 2, .7]]
            v2 += [[o, r, 8, .9], [o + 10, nom_oct(r, 1), 2, .7], [o + 12, r, 4, .8]]
    return {'inst': 'bass808', 'len': 4, 'vol': vol, 'variants': [{'w': 2, 'notes': v1}, {'w': 1, 'notes': v2}]}
def synthbass_de(pr, vol=-6):
    v = []
    for p, ch, l, b in PROG[pr]:
        r = nom_oct(b, 1)
        for s in range(p, p + l, 2): v.append([s, r, 2, .8 if s % 8 == 0 else .56])
    return {'inst': 'synthbass', 'len': 4, 'vol': vol, 'variants': [{'notes': v}]}
def rhodes_de(pr, vol=-17, souple=False):
    v = []
    for p, ch, l, b in PROG[pr]:
        for s in range(p, p + l, 16 if souple else 8): v.append([s + (0 if souple else 2), [nom_oct(x, 1) for x in ch[1:]], 6 if souple else 3, .5])
    return {'inst': 'rhodes', 'len': 4, 'rev': .35, 'human': .016, 'vol': vol, 'pump': .2, 'variants': [{'notes': v}]}
def strings_de(pr, stac=True, vol=0):
    v = []
    for p, ch, l, b in PROG[pr]:
        if stac:
            for s in range(p, p + l, 2): v.append([s, [nom_oct(x, 1) for x in ch[:3]], 1, .9 if s % 4 == 0 else .6])
        else: v.append([p, [nom_oct(x, 1) for x in ch[:4]], l, .6])
    return {'inst': 'strings', 'len': 4, 'rev': .5, 'vol': vol, 'pump': .25 if stac else .15, 'variants': [{'notes': v}]}
def harp_de(pr): return {'inst': 'harp', 'len': 4, 'rev': .6, 'variants': [{'notes': [[p, [nom_oct(x, 1) for x in ch], 16, .7] for p, ch, l, b in PROG[pr]]}]}
def bell_de(pr, vol=-25):
    v = []
    for p, ch, l, b in PROG[pr]:
        tons = [nom_oct(x, 2) for x in ch]
        for s in range(p, p + l, 2): v.append([s, tons[(s // 2) % len(tons)], 2, .32 if s % 8 == 0 else .24])
    return {'inst': 'bell', 'vol': vol, 'len': 4, 'rev': .6, 'prob': .8, 'variants': [{'notes': v}]}
def lead_de(variantes, vol=0, inst='cs80'):
    return {'inst': inst, 'len': 4, 'rev': .6 if inst == 'cs80' else .4, 'vol': vol, 'variants': [{'w': w, 'notes': [[p, n, l, .62 if i % 2 == 0 else .55] for i, (p, n, l) in enumerate(ns)]} for w, ns in variantes]}
def motif(*xs): return list(xs)
PAT = lambda s: {'pattern': s}
def pat_de(inst, pats, vol=0, rev=.2, prob=1., **k):
    d = {'inst': inst, 'len': 4, 'vol': vol, 'rev': rev, 'prob': prob, 'variants': [dict(PAT(p), w=w) for w, p in pats]}; d.update(k); return d

L6 = [(2, motif((0, 'F#5', 4), (4, 'E5', 2), (6, 'C#5', 2), (8, 'E5', 4), (12, 'F#5', 4), (16, 'A5', 6), (22, 'F#5', 2), (24, 'E5', 8), (32, 'D5', 4), (36, 'F#5', 2), (38, 'B5', 6), (44, 'A5', 4), (48, 'G#5', 6), (54, 'E5', 2), (56, 'B4', 8))),
      (1, motif((0, 'C#5', 2), (2, 'E5', 2), (4, 'F#5', 4), (8, 'A5', 2), (10, 'F#5', 2), (12, 'E5', 4), (16, 'C#5', 8), (24, 'A4', 2), (26, 'C#5', 2), (28, 'E5', 4), (32, 'D5', 2), (34, 'F#5', 2), (36, 'A5', 4), (40, 'B5', 8), (48, 'G#5', 4), (52, 'F#5', 2), (54, 'E5', 2), (56, 'E5', 8)))]
L7 = [(2, motif((0, 'F#4', 6), (6, 'A4', 2), (8, 'C#5', 8), (16, 'D5', 4), (20, 'C#5', 2), (22, 'A4', 2), (24, 'F#4', 8), (32, 'E4', 4), (36, 'G#4', 4), (40, 'B4', 8), (48, 'C#5', 6), (54, 'B4', 2), (56, 'G#4', 8))),
      (1, motif((2, 'C#5', 2), (4, 'A4', 2), (6, 'F#4', 10), (16, 'F#5', 4), (20, 'E5', 4), (24, 'D5', 8), (34, 'B4', 2), (36, 'E5', 4), (40, 'D5', 2), (42, 'C#5', 2), (44, 'B4', 4), (48, 'C#5', 4), (52, 'E5', 4), (56, 'G#4', 8)))]
L8 = [(2, motif((0, 'F#5', 4), (4, 'D5', 2), (6, 'C#5', 2), (8, 'B4', 8), (16, 'G#5', 4), (20, 'F#5', 2), (22, 'E5', 2), (24, 'D5', 8), (32, 'C#5', 4), (36, 'E5', 4), (40, 'A5', 4), (44, 'G#5', 4), (48, 'F#5', 6), (54, 'E5', 2), (56, 'C#5', 8))),
      (1, motif((0, 'B4', 2), (2, 'D5', 2), (4, 'F#5', 2), (6, 'A5', 6), (12, 'G#5', 4), (16, 'F#5', 2), (18, 'E5', 2), (20, 'D5', 4), (24, 'B4', 8), (32, 'E5', 2), (34, 'G#5', 2), (36, 'B5', 4), (40, 'A5', 8), (48, 'C#6', 4), (52, 'B5', 4), (56, 'A5', 8)))]
L9 = [(2, motif((0, 'C#5', 2), (2, 'D5', 2), (4, 'C#5', 4), (8, 'A4', 8), (16, 'D5', 2), (18, 'E5', 2), (20, 'D5', 4), (24, 'A4', 8), (32, 'E5', 2), (34, 'F#5', 2), (36, 'E5', 4), (40, 'B4', 8), (48, 'F#5', 2), (50, 'G#5', 2), (52, 'F#5', 4), (56, 'E5', 8))),
      (1, motif((0, 'E5', 2), (2, 'F#5', 2), (4, 'E5', 4), (8, 'C#5', 8), (16, 'F#5', 2), (18, 'G#5', 2), (20, 'F#5', 4), (24, 'D5', 8), (32, 'G#5', 2), (34, 'A5', 2), (36, 'G#5', 4), (40, 'E5', 8), (48, 'A5', 2), (50, 'B5', 2), (52, 'A5', 4), (56, 'G#5', 8)))]
L10 = [(2, motif((0, 'F#5', 2), (2, 'F#5', 2), (4, 'A5', 4), (8, 'B5', 4), (12, 'A5', 2), (14, 'F#5', 2), (16, 'G#5', 4), (20, 'B5', 4), (24, 'E5', 8), (32, 'A5', 2), (34, 'A5', 2), (36, 'C#6', 4), (40, 'E6', 4), (44, 'C#6', 4), (48, 'F#6', 6), (54, 'E6', 2), (56, 'C#6', 8))),
       (1, motif((0, 'B5', 4), (4, 'F#5', 2), (6, 'B5', 2), (8, 'D6', 8), (16, 'E6', 2), (18, 'D6', 2), (20, 'B5', 4), (24, 'G#5', 8), (32, 'A5', 4), (36, 'C#6', 2), (38, 'E6', 2), (40, 'A6', 8), (48, 'F#6', 4), (52, 'E6', 2), (54, 'C#6', 2), (56, 'A5', 8)))]
def bas(lead): return [(w, [(p, nom_oct(n, -1), l) for p, n, l in ns]) for w, ns in lead]

TRAP = [(3, 'x.........x.....x.........x...x.x........x......x.........x.....'), (1, 'x.........x.x...x.........x.....x.........x.....x...x.....x.....')]
HAT16 = [(3, 'x.xxx.x.x.xrx.x.'), (1, 'x.x.x.xrx.x.xxo.')]
NEON_KICK = [(3, 'x.....x.........x.....x...x.....x.....x.........x.....x.....x...')]

SUITE = [
    {'name': "Pluie d'or", 'bpm': 120, 'bars': 4, 'drive': 1.15, 'tracks': [
        pat_de('boomkick', NEON_KICK, -8, 0, kickPitch=44), synthbass_de('base', -9), sub_de('base'), juno_de('base', 0, .45, .35), rhodes_de('base', -17, True),
        lead_de(L6, -2), bell_de('base'), pat_de('ploc', [(1, '....x.......x...')], -13, .32, plocPitch=370),
        pat_de('hat', [(1, 'x.x.x.x.x.x.x.x.')], -4, .1), pat_de('coins', [(1, '..c.......c.....')], -2, .4, prob=.55, nb=6)]},
    {'name': 'Sous-sol', 'bpm': 120, 'bars': 4, 'drive': 1.2, 'tracks': [
        pat_de('boomkick', TRAP, -7, 0, kickPitch=40), bass808_de('sombre', 0), juno_de('sombre', -3, .5, .4), pat_de('clap', [(1, '........x.......')], 0, .35),
        pat_de('hat', HAT16, 0, .1), {'inst': 'cello', 'len': 4, 'rev': .45, 'vol': -2, 'variants': [{'notes': [[p, nom_oct(b, 2), l, .55] for p, ch, l, b in PROG['sombre']]}]},
        lead_de(L7, -3), bell_de('sombre', -27)]},
    {'name': 'Penthouse', 'bpm': 120, 'bars': 4, 'drive': 1.15, 'tracks': [
        pat_de('boomkick', TRAP, -8, 0, kickPitch=42), bass808_de('luxe', -1), sub_de('luxe', -22), juno_de('luxe', -4, .5, .3), rhodes_de('luxe', -14, True),
        harp_de('luxe'), strings_de('luxe', False, -2), pat_de('clap', [(1, '........x.......')], -1, .4), pat_de('hat', HAT16, -1, .1),
        lead_de(L8, -1), pat_de('coins', [(1, 'c.......c.......')], -3, .45, prob=.5, nb=8), bell_de('luxe', -26)]},
    {'name': 'Chambre forte', 'bpm': 120, 'bars': 4, 'drive': 1.2, 'tracks': [
        pat_de('boomkick', TRAP, -6, 0, kickPitch=40), bass808_de('sombre', 0), strings_de('sombre', True, 0), juno_de('sombre', -6, .5, .45),
        pat_de('clap', [(1, '........x.......')], 0, .35), pat_de('hat', HAT16, 0, .1), lead_de(L9, -2),
        {'inst': 'gong', 'len': 8, 'rev': .9, 'vol': -4, 'variants': [{'notes': [[0, ['F#2', 'C#3'], 32, .7]]}]}]},
    {'name': 'Cash explosion', 'bpm': 120, 'bars': 4, 'drive': 1.25, 'tracks': [
        pat_de('boomkick', TRAP, -5, 0, kickPitch=38), bass808_de('luxe', 1), sub_de('luxe', -20), strings_de('luxe', True, 1), juno_de('luxe', -6, .5, .45),
        pat_de('clap', [(1, '........x.......')], 1, .35), pat_de('hat', HAT16, 1, .1), lead_de(L10, 0),
        lead_de(bas(L10), -1, 'brass'), {'inst': 'brass', 'len': 4, 'rev': .4, 'vol': 0, 'variants': [{'notes': [[p, [nom_oct(x, 1) for x in ch[1:4]], 3, .9] for p, ch, l, b in PROG['luxe']]}]},
        pat_de('kaching', [(1, 'k...............' + '.' * 48)], 0, .3), pat_de('coins', [(1, '.' * 56 + 'c.......')], 2, .5, nb=14),
        pat_de('coins', [(1, '....c.......c...')], -4, .45, prob=.6, nb=6),
        {'inst': 'gong', 'len': 8, 'rev': .9, 'vol': -3, 'variants': [{'notes': [[0, ['F#2', 'C#3'], 32, .8]]}]}, bell_de('luxe', -24)]},
]

IDEES = ["La base de NÉON 5 qui s'éclaire : charleys en croches, pièces qui tintent sur les contretemps, une mélodie neuve.",
         "On descend au sous-sol : fa# m · ré · mi · do# m, demi-tempo trap, 808 qui glisse, violoncelle, le lead plus sombre.",
         "Le luxe : si m9 · mi9 · la maj9 · fa# m9, Rhodes généreux, glissandos de harpe, cordes, pièces, le lead qui s'élève.",
         "La tension avant le butin : cordes en staccato qui martèlent, 808, gong, le motif qui grimpe.",
         "Le final : fanfare de cuivres de luxe, cordes, 808 qui gronde, caisse enregistreuse, pluie de pièces, gong."]
# le moteur de neon_ville ne connaît pas `kickPitch` posé ainsi ni les kicks de pompe : on les lui rend
_orig_rendre = NV.rendre
NV._kicks = []

if __name__ == '__main__':
    seul = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    json.dump(SUITE, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ville-6-10.json'), 'w'), ensure_ascii=False, indent=1)
    don = os.path.join(SORTIE, 'ville-donnees.js'); prev = json.loads(open(don).read().split('=', 1)[1].rstrip().rstrip(';'))
    prev = [d for d in prev if int(d['id'].split('-n')[1]) <= 5]
    for k, D in enumerate(SUITE, 6):
        nom = 'ville-n%d' % k
        if not seul or seul == k:
            L, R = rendre_suite(D, 1300 + k); wav = os.path.join(SORTIE, nom + '.wav'); ecrit_wav(wav, L, R)
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(SORTIE, nom + '.m4a')], check=True)
            os.remove(wav); print('  %-10s %-16s %.1f s' % (nom, D['name'], len(L) / SR), flush=True)
        prev.append({'id': nom, 'titre': D['name'].upper(), 'style': 'Ville · niveau %d · la suite de NÉON' % k, 'bpm': 120, 'cle': 'la majeur / fa# mineur', 'dur': 96,
                     'f': 'assets/audio/music/ville/%s.m4a?v=1' % nom, 'idee': IDEES[k - 6]})
    open(don, 'w').write('window.VILLE_N=' + json.dumps(prev, ensure_ascii=False) + ';\n'); print('ok')
