# -*- coding: utf-8 -*-
"""LES BOUCLES DE 8 SECONDES (2026-10-01, Léo : « vise des boucles de 8 secondes, plusieurs inspi différentes pour le lobby,
et ensuite quelques propositions originales pour les niveaux »).

4 mesures (≈ 7,4 à 8,6 s selon le tempo — 120 BPM = 8,0 s pile), même atelier que boucles.py (mêmes instruments, même
repli de la queue : sans couture). Rendu par `python atelier-son/boucles.py` avec les longues, ou `… boucles.py lobby` /
`… niv` pour ce seul lot. Tout est synthétisé ici : aucune mélodie ni échantillon emprunté.
"""
import numpy as np
from boucles import *  # noqa: F403 — les instruments et la table de mixage

GAMMES['maj'] = [0, 2, 4, 5, 7, 9, 11]
GAMMES['mix'] = [0, 2, 4, 5, 7, 9, 10]

def crush(x, bits=5, ds=4):
    """le son des consoles 8 bits : moins de pas d'amplitude, échantillons tenus"""
    q = 2 ** (bits - 1); y = np.round(np.clip(x, -1, 1) * q) / q
    return np.repeat(y[::ds], ds)[:len(x)]

def chorus(L, R, ms=14, prof=3, vit=.6):
    n = len(L); t = np.arange(n) / SR; i = np.arange(n)
    d1 = (ms + prof * np.sin(2 * np.pi * vit * t)) * SR / 1000; d2 = (ms + prof * np.sin(2 * np.pi * vit * t + 2)) * SR / 1000
    return L + .7 * np.interp(i - d1, i, L), R + .7 * np.interp(i - d2, i, R)

def porte(n, temps, ouvert=.22):
    """la réverbe « gated » des années 80 : elle s'ouvre sur la caisse et se ferme net"""
    g = np.zeros(n); lg = int(ouvert * SR)
    for tt in temps:
        i = int(tt * SR); g[i:i + lg] = 1
    return filtre(g, 'low', 60, ordre=1)

def rim(de):
    n = int(.08 * SR); t = np.arange(n) / SR
    return passe_bande(de.bruit(n), 1500, 5000) * np.exp(-t / .006) + .6 * np.sin(2 * np.pi * 1700 * t) * np.exp(-t / .012)

def shaker(de):
    n = int(.09 * SR); t = np.arange(n) / SR
    return filtre(de.bruit(n), 'high', 6000) * (t / .02 * np.exp(1 - t / .02)) * .5

def kick_chip():
    n = int(.18 * SR); t = np.arange(n) / SR
    return crush(carre(90 + 400 * np.exp(-t / .02), n) * np.exp(-t / .07), 4, 6)

def bruit_chip(de, dec=.05):
    n = int((dec + .05) * SR); t = np.arange(n) / SR
    return crush(de.bruit(n) * .6 * np.exp(-t / dec), 4, 8)

def pluck_saw(m, dur, fc0=5000, fc1=500, dec=.12, de=None):
    l, r = supersaw(m, dur, 5, 18, de); nn = len(l); t = np.arange(nn) / SR
    fc = fc1 + (fc0 - fc1) * np.exp(-t / dec); e = env(nn, .003, dec * 1.5, .0)
    return balaye(l * e, fc), balaye(r * e, fc)

def pose_pluck(p, M, m, pas, notes, g, **kw):
    for k, n in enumerate(notes):
        l, r = pluck_saw(n, .6, de=M.de, **kw); p.pose2(M.t(m, pas), l, r, g)

def fx_rev(M, sources, taille, sortie=.4, clair=6000):
    L = sum(M.bus[s].L * g for s, g in sources if s in M.bus); R = sum(M.bus[s].R * g for s, g in sources if s in M.bus)
    rL, rR = reverbe(L, R, taille, clair, de=M.de)
    M.piste('fx').L += rL * sortie; M.piste('fx').R += rR * sortie

def M4(bpm, graine): return Morceau(bpm, mesures=4, graine=graine)
def kicks_de(M, pas=(0, 4, 8, 12)): return [M.t(m, p) for m in range(M.mes) for p in pas]
def pompe_bus(M, noms, kicks, prof=.7, rel=.15):
    g = pompe(M.n, kicks, prof, rel)
    for k in noms:
        if k in M.bus: M.bus[k].L *= g; M.bus[k].R *= g

# ============================================================ LE LOBBY — six inspirations
def lb_coucher():
    """COUCHER DE SOLEIL — outrun : la caisse posée devant l'horizon. Caisse claire à la réverbe coupée net (années 80),
    basse en croches, nappe large, arpège qui scintille."""
    M = M4(116, 101); de = M.de; T = 52  # mi
    prog = [0, 5, 2, 6]
    M.patron('bat', 'x.......x.......', lambda: kick(de, 140, 45, .45, .4, 1.3), 1.)
    M.patron('sn', '....x.......x...', lambda: caisse(de, 190, 1.2, .18, 1800), .7)
    M.patron('bat', '..x...x...x...x.', lambda: charley(de, False, 8500), .12, .3)
    b = M.piste('basse'); pad = M.piste('pad'); ar = M.piste('arp')
    for m in range(4):
        d = prog[m]; r = deg(T - 12, 'min', d)
        for p in range(0, 16, 2):
            nn = int(M.dc * 1.8 * SR); s = scie(hz(r), nn) * env(nn, .003, .12, .35)
            b.pose(M.t(m, p), balaye(s, np.full(nn, 700.)), .45)
        for n in accord(T + 12, 'min', d):
            l, rr = supersaw(n, M.temps * 4 + .4, 5, 14, de); e = env(len(l), .3, 9, 1, .4, M.temps * 4)
            pad.pose2(M.t(m), filtre(l * e, 'low', 2400), filtre(rr * e, 'low', 2400), .13)
        seq = [0, 4, 7, 11, 14, 11, 7, 4]
        for i in range(16):
            n = deg(T + 24, 'min', d) + [0, 3, 7, 10, 12, 10, 7, 3][i % 8]
            nn = int(.1 * SR); ar.pose(M.t(m, i), filtre(carre(hz(n), nn, .25) * env(nn, .002, .03), 'low', 5000), .06, .4 if i % 2 else -.4)
    sn = M.bus['sn']; rL, rR = reverbe(sn.L, sn.R, 1.6, 8000, de=de); g = porte(M.n, [M.t(m, p) for m in range(4) for p in (4, 12)])
    M.piste('fx').L += rL * g * .9; M.piste('fx').R += rR * g * .9
    pompe_bus(M, ('basse', 'pad'), kicks_de(M), .5)
    eL, eR = echo(ar.L, ar.R, M.temps * .75, .4); M.piste('fx').L += eL * .5; M.piste('fx').R += eR * .5
    fx_rev(M, [('pad', 1), ('arp', 1)], 2.5, .3)
    return M, fin(M, {'bat': 1, 'sn': 1, 'basse': 1, 'pad': 1, 'arp': 1, 'fx': 1})

def lb_ascenseur():
    """ASCENSEUR DORÉ — bossa de salon, le lobby d'un casino : Rhodes en ii-V-I, clave, shaker, basse qui marche.
    On attend dans le fauteuil de cuir que la partie commence, cocktail à la main."""
    M = M4(120, 102); de = M.de
    ch = [[62, 65, 69, 72, 76], [55, 59, 65, 69, 76], [60, 64, 67, 71, 74], [57, 61, 64, 67, 70]]  # Rém9 · Sol13 · Domaj9 · La7(b9)
    M.patron('bat', 'x......x.x......', lambda: kick(de, 100, 45, .3, .1, 1.), .55)
    M.patron('bat', 'x..x..x...x.x...', lambda: rim(de), .35, .35)
    M.patron('bat', 'xoxoxoxoxoxoxoxo', lambda: shaker(de), .5, -.4)
    rh = M.piste('rhodes'); b = M.piste('basse')
    comp = [(0, 1.), (3, .7), (6, .8), (10, .7), (13, .6)]
    for m in range(4):
        for p, v in comp:
            if p == 13 and m % 2: continue
            for k, n in enumerate(ch[m]):
                rh.pose(M.t(m, p) + k * .008, plus(fm(n, 1.2, 1, 1.8, .2, .6), .2 * fm(n + 12, .6, 14, 1, .05, .3)), .07 * v, -.3 + .15 * k)
        r = ch[m][0] - 24 + (12 if m in (1, 3) else 0)
        for p, o in ((0, 0), (6, 7), (8, 7), (14, 12 if m != 3 else 1)):
            nn = int(M.dc * 2.2 * SR); s = (sinus(hz(r + o), nn) + .25 * tri(hz(r + o), nn)) * env(nn, .006, .35, .2)
            b.pose(M.t(m, p), s, .55)
    fx_rev(M, [('rhodes', 1), ('bat', .2)], 1.8, .35, 5000)
    return M, fin(M, {'bat': 1, 'rhodes': 1, 'basse': 1, 'fx': 1}, maitre_lp=12000)

def lb_arcade():
    """PIÈCE D'OR — 8 bits : l'écran titre d'une borne d'arcade. Carré à 12,5 %, basse en triangle qui arpège,
    batterie de bruit. Une mélodie maison qui monte et retombe sur une pièce."""
    M = M4(120, 103); de = M.de; T = 60  # do majeur
    prog = [0, 5, 3, 4]  # I vi IV V
    M.patron('bat', 'x.....x.x.......', lambda: kick_chip(), .8)
    M.patron('bat', '....x.......x...', lambda: bruit_chip(de, .09), .5)
    M.patron('bat', 'x.x.x.x.x.x.x.x.', lambda: bruit_chip(de, .015), .22, .3)
    ld = M.piste('lead'); b = M.piste('basse'); h = M.piste('harmo')
    mel = [(0, 4, 2), (2, 7, 2), (4, 9, 4), (8, 7, 2), (10, 9, 2), (12, 11, 4),
           (16, 12, 2), (18, 11, 2), (20, 9, 4), (24, 7, 3), (27, 4, 1), (28, 5, 4),
           (32, 4, 2), (34, 7, 2), (36, 9, 2), (38, 11, 2), (40, 12, 6), (48, 14, 2), (50, 12, 2), (52, 11, 4), (56, 14, 8)]
    for p, dd, lg in mel:
        m, q = divmod(p, 16)
        if m >= 4: continue
        n = deg(T + 12, 'maj', dd - 4)
        nn = int(lg * M.dc * SR); t = np.arange(nn) / SR
        vib = 1 + .006 * np.sin(2 * np.pi * 6 * t) * (t > .12)
        ld.pose(M.t(m, q), crush(carre(hz(n) * vib, nn, .125) * env(nn, .002, 9, 1, .02, lg * M.dc - .03), 6, 2), .16, .1)
    for m in range(4):
        d = prog[m]
        for i in range(16):
            n = deg(T - 12, 'maj', d) + [0, 12, 7, 12][i % 4]
            nn = int(M.dc * .95 * SR); b.pose(M.t(m, i), crush(tri(hz(n), nn) * env(nn, .001, 9, 1), 5, 2), .4)
        for i in range(0, 16, 4):
            for k, n in enumerate(accord(T + 12, 'maj', d, False)):
                nn = int(M.dc * 1.5 * SR); h.pose(M.t(m, i + 2), crush(carre(hz(n), nn, .5) * env(nn, .002, .06, .2), 5, 2), .04, -.3 + .3 * k)
    eL, eR = echo(ld.L, ld.R, M.dc * 3, .3, 3); M.piste('fx').L += eL * .5; M.piste('fx').R += eR * .5
    return M, fin(M, {'bat': 1, 'lead': 1, 'basse': 1, 'harmo': 1, 'fx': 1})

def lb_luxe():
    """LUXE — trap de palace : cloches de verre, 808 qui tient, charley en rafales de triolets, clap sur le 3.
    La caisse en or tourne sur son socle, les billets pleuvent au ralenti."""
    M = M4(120, 104); de = M.de; T = 54  # fa#
    M.patron('bat', 'x.........x..x..', lambda: kick(de, 160, 48, .3, .6, 1.8), .9)
    M.patron('bat', '........x.......', lambda: clap(de, .3), .75)
    def hats(m):
        return 'x.x.x.xxx.x.x.x.' if m % 2 == 0 else 'x.x.x.x.x.xxxxxx'
    M.patron('bat', '', lambda: charley(de, False, 9500), .18, .35, var=hats)
    cl = M.piste('cloches'); k8 = M.piste('808'); pad = M.piste('pad')
    mel = [0, 2, 4, 7, 4, 2, 9, 7]
    for m in range(4):
        d = [0, 5, 3, 4][m]
        for i, p in enumerate((0, 3, 6, 8, 10, 12, 14)):
            n = deg(T + 24, 'harm' if d == 4 else 'min', d + mel[(i + m) % 8])
            cl.pose(M.t(m, p), fm(n, 1.4, 3.5, 2.5, .15, .5), .12, .3 * (1 if i % 2 else -1))
        r = deg(T - 12, 'min', d); dur = M.temps * 3.6; nn = int(dur * SR); t = np.arange(nn) / SR
        s = np.sin(2 * np.pi * np.cumsum(hz(r) * (1 + 1.5 * np.exp(-t / .03))) / SR) * env(nn, .003, 9, 1, .08, dur - .1)
        k8.pose(M.t(m), np.tanh(s * 2.5) * .6, .9)
        for n in accord(T + 12, 'min', d, False):
            l, rr = supersaw(n, M.temps * 4 + .3, 3, 8, de); e = env(len(l), .4, 9, 1, .3, M.temps * 4)
            pad.pose2(M.t(m), filtre(l * e, 'low', 1400), filtre(rr * e, 'low', 1400), .07)
    fx_rev(M, [('cloches', 1), ('pad', .6)], 2.6, .45)
    return M, fin(M, {'bat': 1, 'cloches': 1, '808': 1, 'pad': 1, 'fx': 1})

def lb_vapeur():
    """VAPEUR — vaporwave : accords de 7e majeure fondus, chorus, bande ralentie qui pleure, batterie lointaine.
    Le souvenir flou d'un centre commercial en 1994 — la vitrine de CASH CAR vue à travers un écran cathodique."""
    M = M4(112, 105); de = M.de
    ch = [[51, 55, 58, 62, 65], [56, 60, 63, 67, 70], [53, 56, 60, 63, 67], [58, 62, 65, 68, 72]]  # Mi♭maj9 · La♭maj9 · Fam9 · Si♭7sus
    M.patron('bat', 'x.......x.x.....', lambda: kick(de, 110, 42, .5, .1, 1.), .7)
    M.patron('sn', '....x.......x...', lambda: caisse(de, 170, 1., .25, 1200), .5)
    pad = M.piste('pad'); b = M.piste('basse'); ld = M.piste('lead')
    for m in range(4):
        for n in ch[m]:
            l, r = supersaw(n, M.temps * 4 + .6, 3, 6, de); e = env(len(l), .08, 9, 1, .5, M.temps * 4)
            pad.pose2(M.t(m), filtre(l * e, 'low', 1800), filtre(r * e, 'low', 1800), .1)
        nn = int(M.temps * 3.5 * SR); b.pose(M.t(m), sinus(hz(ch[m][0] - 12), nn) * env(nn, .02, 9, 1, .1, M.temps * 3.3), .6)
    for m, p, n, lg in ((0, 8, 74, 6), (1, 0, 72, 4), (1, 6, 70, 10), (2, 8, 67, 4), (2, 12, 70, 4), (3, 0, 72, 12)):
        nn = int((lg * M.dc + .4) * SR); t = np.arange(nn) / SR
        s = (tri(hz(n) * (1 + .003 * np.sin(2 * np.pi * 5 * t)), nn) + .3 * sinus(hz(n) * 2, nn)) * env(nn, .05, 9, 1, .2, lg * M.dc)
        ld.pose(M.t(m, p), s, .1, .2)
    pad.L, pad.R = chorus(pad.L, pad.R); pad.L, pad.R = wobble(pad.L, pad.R, .004, .3)
    ld.L, ld.R = wobble(ld.L, ld.R, .004, .3)
    fx_rev(M, [('pad', 1), ('lead', 1), ('sn', 1), ('bat', .3)], 3.5, .5, 4500)
    return M, fin(M, {'bat': .8, 'sn': .8, 'pad': 1, 'basse': 1, 'lead': 1, 'fx': 1}, maitre_lp=7500)

def lb_filtre():
    """FILTRE D'OR — house filtrée à la française : accord de funk haché en croches dont le filtre s'ouvre sur les
    quatre mesures, basse slappée qui saute l'octave, quatre temps. Le hochement de tête garanti."""
    M = M4(124, 106); de = M.de; T = 55  # sol dorien
    M.patron('bat', 'x...x...x...x...', lambda: kick(de, 150, 48, .32, .5, 1.6), 1.)
    M.patron('bat', '....x.......x...', lambda: clap(de, .2), .5)
    M.patron('bat', '..x...x...x...x.', lambda: charley(de, True, 7000), .2, .25)
    M.patron('bat', 'xxxxxxxxxxxxxxxx', lambda: shaker(de), .35, -.35)
    ch = M.piste('accord'); b = M.piste('basse')
    acc = [[67, 70, 74, 77], [65, 69, 72, 76], [67, 70, 74, 77], [70, 74, 77, 81]]
    for m in range(4):
        for i, p in enumerate((0, 2, 3, 6, 8, 10, 11, 14)):
            for n in acc[m]:
                l, r = supersaw(n, M.dc * 1.3, 3, 10, de); e = env(len(l), .002, .07, .2)
                ch.pose2(M.t(m, p), l * e, r * e, .07)
        r = deg(T - 12, 'dor', [0, 6, 0, 2][m])
        for p, o in ((0, 0), (3, 12), (6, 0), (7, 12), (10, 0), (12, 10), (14, 12)):
            nn = int(M.dc * .9 * SR); s = np.tanh((scie(hz(r + o), nn) * .5 + sinus(hz(r + o), nn)) * env(nn, .002, .09, .3) * 2)
            b.pose(M.t(m, p), filtre(s, 'low', 1300), .45)
    lg = int(M.lg * SR); fc = np.r_[400 * (22 ** (np.arange(lg) / lg)), np.full(M.n - lg, 400.)]
    ch.L = balaye(ch.L, fc); ch.R = balaye(ch.R, fc)
    pompe_bus(M, ('accord', 'basse'), kicks_de(M), .65)
    fx_rev(M, [('accord', 1)], 1.4, .25)
    return M, fin(M, {'bat': 1, 'accord': 1.3, 'basse': 1, 'fx': 1})


def guitare(de, notes, dur, etouffe=False, grain=1.):
    """une guitare électrique : cordes pincées (Karplus-Strong) → saturation → baffle (un 4×12 : ni grave qui bave, ni aigu qui pique)"""
    n = int((dur + (.05 if etouffe else .35)) * SR); x = np.zeros(n)
    for k, m in enumerate(notes):
        c = karplus(m, dur + .4, .35 if etouffe else .7, .985 if etouffe else .9985, de)[:n]
        x[:len(c)] += c * (1 - .15 * k)
    e = env(n, .001, .05 if etouffe else 9, 0 if etouffe else 1, .03, dur)
    x = np.tanh(x * e * (9 if etouffe else 7) * grain)
    x = filtre(x, 'high', 90); x = filtre(x, 'low', 2600 if etouffe else 4600, ordre=4)
    x += .35 * passe_bande(x, 1400, 2600)  # la « bosse » du baffle
    return x * .35

def tom(de, f=110):
    n = int(.5 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f * (1 + .6 * np.exp(-t / .03))) / SR) * np.exp(-t / .2) + .15 * filtre(de.bruit(n), 'low', 3000) * np.exp(-t / .03)

def crash(de, dec=1.4):
    n = int(dec * 1.5 * SR); t = np.arange(n) / SR
    met = sum(carre(f, n) for f in [311, 427, 587, 739, 953, 1187]) / 6
    return filtre(met * .5 + de.bruit(n) * .7, 'high', 4500) * np.exp(-t / (dec * .4))

def lb_rock():
    """BONHOMME — le rock qui roule des mécaniques : riff en accords de quinte, étouffés à la paume entre deux coups
    ouverts, la note bleue (si bémol) qui traîne, batterie de garage, basse qui colle au riff. Le blouson de cuir posé sur
    le capot, les clés qui tournent autour du doigt. Deux guitares, une par oreille, jouées « à la main » (pas pile en même temps)."""
    M = M4(120, 107); de = M.de; E = 40  # mi grave
    # le riff : (pas, décalage depuis mi, durée en doubles-croches, étouffé ?)
    riff_a = [(0, 0, 3, 0), (3, 0, 1, 1), (4, 0, 1, 1), (6, 3, 2, 0), (8, 0, 1, 1), (9, 0, 1, 1), (10, 5, 3, 0), (13, 0, 1, 1), (14, 6, 2, 0)]
    riff_b = [(0, 0, 3, 0), (3, 0, 1, 1), (4, 0, 1, 1), (6, 3, 2, 0), (8, 5, 2, 0), (10, 6, 1, 0), (11, 5, 1, 0), (12, 3, 2, 0), (14, -2, 2, 0)]
    riffs = [riff_a, riff_b, riff_a, riff_b]
    gL = M.piste('guitareG'); gR = M.piste('guitareD'); b = M.piste('basse')
    for m in range(4):
        for p, o, lg, et in riffs[m]:
            if m == 3 and p >= 12: continue  # la fin de la 4e mesure : la batterie parle seule
            r = E + o; acc = [r, r + 7, r + 12] if not et else [r, r + 7]
            dur = lg * M.dc * (.95 if not et else .6)
            for pis, dt, pan in ((gL, 0, -.75), (gR, .007 + .004 * de.u(), .75)):
                pis.pose(M.t(m, p) + dt, guitare(de, acc, dur, bool(et)), .9 if not et else .7, pan)
            nn = int(lg * M.dc * SR)
            s = np.tanh((scie(hz(r - 12), nn) * .6 + sinus(hz(r - 12), nn)) * env(nn, .003, 9, 1, .02, lg * M.dc - .02) * 2)
            b.pose(M.t(m, p), filtre(s, 'low', 1100), .55)
    # la batterie : un vrai batteur, pas une machine — la charleston respire, le 3e temps a sa double grosse caisse
    M.patron('bat', 'x.......x.x.....', lambda: kick(de, 120, 50, .35, .7, 1.5), 1., var=lambda m: 'x.......x.x.....' if m < 3 else 'x.......x.......')
    M.patron('sn', '....x.......x...', lambda: caisse(de, 200, 1.1, .17, 1700), .85, var=lambda m: '....x.......x...' if m < 3 else '....x.......')
    M.patron('bat', 'x.x.x.x.x.x.x.x.', lambda: charley(de, False, 7000), .14, .3, var=lambda m: 'x.x.x.x.x.x.x.x.' if m < 3 else 'x.x.x.x.x.x.')
    M.piste('bat').pose(M.t(0), crash(de), .45, -.4)
    for p, f in ((12, 190), (13, 190), (14, 130), (15, 95)):  # le roulement de toms qui ramène au début
        M.piste('bat').pose(M.t(3, p), tom(de, f), .5, .4 - (p - 12) * .25)
    M.piste('sn').pose(M.t(3, 12), caisse(de, 200, 1.1, .17, 1700), .5)
    # une pièce de garage : réverbe courte, les guitares un peu dedans
    fx_rev(M, [('sn', .8), ('bat', .4), ('guitareG', .15), ('guitareD', .15)], .9, .35, 5000)
    return M, fin(M, {'bat': 1, 'sn': 1, 'guitareG': 1, 'guitareD': 1, 'basse': 1, 'fx': 1})


def bloup(m, dur=.12, monte=True):
    """une bulle d'encre : un sinus qui glisse d'une octave en 60 ms, un trémolo de liquide"""
    n = int(dur * SR); t = np.arange(n) / SR; f0 = hz(m)
    f = f0 * (2 ** ((1 if monte else -1) * (1 - np.exp(-t / .02))))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + .3 * np.sin(2 * np.pi * 38 * t))
    return s * env(n, .002, dur * .35)

def splat(de):
    """l'ENCRE QUI GICLE : un souffle dont le filtre s'effondre, un grave qui plonge, des gouttes"""
    n = int(.35 * SR); t = np.arange(n) / SR
    s = balaye(de.bruit(n), 300 + 5000 * np.exp(-t / .05)) * np.exp(-t / .09)
    s += .8 * np.sin(2 * np.pi * np.cumsum(320 * np.exp(-t / .05) + 70) / SR) * np.exp(-t / .07)
    for k in range(4):
        i = int(de.u(.04, .22) * SR); g = bloup(76 + int(de.u(0, 12)), .06, de.u() < .5) * .25
        s[i:i + len(g)] += g[:n - i]
    return s * .6

def voix(m, dur, voyelle='o', de=None):
    """un « OH ! » de bande : une scie à la hauteur du cri, passée par les formants de la voyelle, trois gorges qui ne sont
    pas tout à fait ensemble"""
    F = {'o': (500, 900, 2400), 'e': (600, 1800, 2600), 'a': (750, 1250, 2600)}[voyelle]
    n = int((dur + .1) * SR); out = np.zeros(n)
    for k in range(3):
        t = np.arange(n) / SR
        f = hz(m + [0, -12, 7][k]) * (1 + .006 * np.sin(2 * np.pi * 5 * t + k)) * (1 - .06 * np.exp(-t / .04))
        sg = scie(f, n) + .3 * filtre(de.bruit(n), 'high', 3000)
        v = sum(passe_bande(sg, a * .85, a * 1.15) * g for a, g in zip(F, (1, .6, .25)))
        d = int(de.u(0, .02) * SR); out[d:] += v[:n - d] * env(n, .015, 9, 1, .05, dur)[:n - d]
    return np.tanh(out * 2.5) * .4

def lb_splat():
    """ENCRE FRAÎCHE — rock punk façon Splatoon : ça saute, ça gicle, ça crie. Accords de quinte ouverts en croches
    (majeur, avec le sol du rock en la), batterie punk qui cavale, basse qui rebondit à l'octave, un synthé-jouet qui
    répond aux guitares, des bulles et des SPLATS d'encre sur les temps forts, un « OH ! » de bande à la fin de la phrase.
    6 mesures à 180 BPM = 8 s pile (A A B A · A C : la dernière relance tout)."""
    M = Morceau(180, mesures=6, graine=108); de = M.de; A = 45  # la grave
    grille = [[0, 0, -2, -2], [0, 0, -2, -2], [-7, -7, -5, -5], [0, 0, -2, -2], [0, 0, 5, 7], [-5, -5, -3, -3]]  # A A G G · D D E E · …
    gL = M.piste('guitareG'); gR = M.piste('guitareD'); b = M.piste('basse')
    for m in range(6):
        for q in range(4):  # quatre temps, deux croches chacun
            r = A + grille[m][q]
            for c in (0, 1):
                p = q * 4 + c * 2
                if m == 5 and q == 3: continue  # la fin : la batterie et le cri
                acc = [r, r + 7, r + 12]; et = c == 1 and q % 2 == 0
                for pis, dt, pan in ((gL, 0, -.8), (gR, .006 + .003 * de.u(), .8)):
                    pis.pose(M.t(m, p) + dt, guitare(de, acc, M.dc * (1.2 if et else 1.9), et, .8), .75, pan)
                nn = int(M.dc * 1.8 * SR); o = 12 if c else 0
                s = np.tanh((sinus(hz(r - 12 + o), nn) + .5 * scie(hz(r - 12 + o), nn)) * env(nn, .002, .12, .4) * 2)
                b.pose(M.t(m, p), filtre(s, 'low', 1500), .5)
    # la batterie punk : grosse caisse sur 1 et 3 (et le « et » avant le 3), caisse claire sur 2 et 4, charley ouverte en croches
    M.patron('bat', 'x.....x.x.......', lambda: kick(de, 130, 52, .25, .8, 1.6), 1., var=lambda m: 'x.....x.x.......' if m < 5 else 'x.....x.x.x.....')
    M.patron('sn', '....x.......x...', lambda: caisse(de, 230, 1.2, .14, 2000), .8, var=lambda m: '....x.......x...' if m < 5 else '....x...x.xxxxxx')
    M.patron('bat', 'x.x.x.x.x.x.x.x.', lambda: charley(de, True, 7500), .16, .3)
    for m in (0, 3):
        M.piste('bat').pose(M.t(m), crash(de, 1.2), .4, -.4)
    # le synthé-jouet : un carré qui glisse d'une note à l'autre, il répond aux guitares (mélodie maison)
    jt = M.piste('jouet')
    rep = [(1, 8, 76, 2), (1, 10, 78, 2), (1, 12, 81, 4), (2, 8, 74, 2), (2, 10, 76, 2), (2, 12, 79, 2), (2, 14, 78, 2),
           (4, 8, 81, 2), (4, 10, 83, 2), (4, 12, 85, 2), (4, 14, 88, 2)]
    prev = None
    for m, p, n, lg in rep:
        nn = int((lg * M.dc + .05) * SR); t = np.arange(nn) / SR
        f = hz(n) if prev is None else hz(n) + (hz(prev) - hz(n)) * np.exp(-t / .025)
        jt.pose(M.t(m, p), carre(f, nn, .3) * env(nn, .003, 9, 1, .03, lg * M.dc) * .5, .22, .2)
        prev = n
    # l'encre : des splats sur les temps forts des mesures 1 et 4, des bulles qui montent en fin de mesure
    ek = M.piste('encre')
    for m, p in ((0, 0), (2, 8), (3, 0), (5, 0)):
        ek.pose(M.t(m, p), splat(de), .55, de.u(-.6, .6))
    for m in range(6):
        for i, p in enumerate((13, 14, 15)):
            if de.u() < .6: ek.pose(M.t(m, p), bloup(84 + i * 3 + int(de.u(0, 4)), .1), .12, de.u(-.8, .8))
    # la bande crie
    vx = M.piste('voix')
    vx.pose(M.t(5, 12), voix(69, M.dc * 3.5, 'o', de), .5)
    vx.pose(M.t(2, 14), voix(71, M.dc * 1.5, 'e', de), .35)
    fx_rev(M, [('sn', .7), ('bat', .3), ('voix', 1), ('jouet', .5), ('encre', .6)], 1., .35, 6000)
    return M, fin(M, {'bat': 1, 'sn': 1, 'guitareG': 1, 'guitareD': 1, 'basse': 1, 'jouet': 1, 'encre': 1, 'voix': 1, 'fx': 1})

# ============================================================ LES NIVEAUX — propositions originales
def nv_altitude():
    """NUAGES · ALTITUDE — l'euphorie au-dessus du coton : accords pincés à contretemps (trance), basse qui roule en
    doubles-croches, la cymbale qui plane. Majeur, lumineux, pour le jour."""
    M = M4(128, 201); de = M.de; T = 62  # ré majeur
    prog = [0, 4, 5, 3]  # I V vi IV
    M.patron('kick', 'x...x...x...x...', lambda: kick(de, 155, 48, .3, .5, 1.6), 1.)
    M.patron('bat', '....x.......x...', lambda: clap(de, .22), .45)
    M.patron('bat', '..x...x...x...x.', lambda: charley(de, True, 8000), .18, .3)
    pl = M.piste('pluck'); b = M.piste('basse')
    for m in range(4):
        d = prog[m]
        for p in (2, 6, 10, 14, 15):
            pose_pluck(pl, M, m, p, accord(T, 'maj', d, False), .15, fc0=6500, dec=.09)  # (couches) .05 → .15 : seuls à l'arrêt, les accords doivent chanter
        r = deg(T - 24, 'maj', d)
        for p in range(16):
            if p % 4 == 0: continue
            nn = int(M.dc * .85 * SR); s = scie(hz(r), nn) * env(nn, .002, .06, .3)
            b.pose(M.t(m, p), filtre(s, 'low', 900), .4)
    pompe_bus(M, ('pluck', 'basse'), kicks_de(M), .7)
    eL, eR = echo(pl.L, pl.R, M.temps * .75, .45); M.piste('fx').L += eL * .5; M.piste('fx').R += eR * .5
    fx_rev(M, [('pluck', 1)], 2.8, .35)
    return M, fin(M, {'kick': 1, 'bat': 1, 'pluck': 1, 'basse': 1, 'fx': 1})

def nv_neon_noir():
    """VILLE · NÉON NOIR — darksynth : basse saturée en doubles-croches qui grogne, caisse claire énorme et coupée net,
    nappe menaçante. Les tours te regardent passer ; la police n'est pas loin."""
    M = M4(120, 202); de = M.de; T = 48  # do mineur
    M.patron('bat', 'x.....x.x.......', lambda: kick(de, 150, 42, .4, .6, 2.), 1.)
    M.patron('sn', '....x.......x...', lambda: caisse(de, 160, 1.3, .2, 1500), .8)
    M.patron('bat', 'x.x.x.x.x.x.x.x.', lambda: charley(de, False, 9000), .1, .3)
    b = M.piste('basse'); pad = M.piste('pad')
    riff = [0, 0, 12, 0, 0, 1, 0, 0, 12, 0, 3, 0, 0, 1, 0, -2]  # la seconde mineure qui grince (phrygien)
    for m in range(4):
        base = T - 12 + [0, 0, -4, -2][m]
        for p in range(16):
            nn = int(M.dc * .9 * SR); s = scie(hz(base + riff[p]), nn) + scie(hz(base + riff[p]) * 1.01, nn)
            s = np.tanh(balaye(s * env(nn, .002, .07, .4), np.full(nn, 600 + 1400 * (p % 4 == 0))) * 3) * .5
            b.pose(M.t(m, p), s, .5)
        for n in [base + 24, base + 27, base + 31]:
            l, r = supersaw(n, M.temps * 4 + .4, 5, 20, de); e = env(len(l), .6, 9, 1, .4, M.temps * 4)
            pad.pose2(M.t(m), filtre(l * e, 'low', 1600), filtre(r * e, 'low', 1600), .2)  # (couches) .07 → .2
    sn = M.bus['sn']; rL, rR = reverbe(sn.L, sn.R, 2., 7000, de=de); g = porte(M.n, [M.t(m, p) for m in range(4) for p in (4, 12)], .28)
    M.piste('fx').L += rL * g; M.piste('fx').R += rR * g
    pompe_bus(M, ('basse', 'pad'), kicks_de(M, (0, 6, 8)), .5)
    return M, fin(M, {'bat': 1, 'sn': 1, 'basse': 1, 'pad': 1, 'fx': 1})

def nv_metro():
    """VILLE · MÉTRO — UK garage en 2-step : grosse caisse qui saute, charley qui boite, orgue en accords courts,
    sous-basse ronde. Le dernier métro sous la pluie, rythme décalé pour se faufiler dans le trafic."""
    M = M4(132, 203); de = M.de; T = 53  # fa mineur
    sw = .22
    M.patron('bat', 'x.......x.x.....', lambda: kick(de, 150, 46, .3, .4, 1.5), 1., swing=sw,
             var=lambda m: 'x.......x.x.....' if m % 2 == 0 else 'x.....x....x....')
    M.patron('bat', '....x.......x...', lambda: caisse(de, 200, 1., .13, 2200), .6, swing=sw)
    M.patron('bat', '..x.x.xx..x.x.xx', lambda: charley(de, False, 9000), .13, .3, swing=sw)
    org = M.piste('orgue'); b = M.piste('basse')
    for m in range(4):
        d = [0, 5, 3, 4][m]
        for p in (0, 3, 7, 10):
            for k, n in enumerate(accord(T + 12, 'harm' if d == 4 else 'min', d)):
                s = plus(fm(n, .35, 1, 1.4, .05, .12), .4 * sinus(hz(n) * 2, int(.2 * SR)) * np.exp(-np.arange(int(.2 * SR)) / SR / .06))
                org.pose(M.t(m, p, sw), s, .08, -.3 + .2 * k)
        r = deg(T - 12, 'min', d)
        for p, lg in ((0, 3), (6, 2), (11, 4)):
            nn = int(lg * M.dc * SR); b.pose(M.t(m, p, sw), np.tanh(sinus(hz(r), nn) * env(nn, .005, 9, 1, .04, lg * M.dc - .04) * 1.5), .6)
    fx_rev(M, [('orgue', 1), ('bat', .15)], 1.5, .3)
    return M, fin(M, {'bat': 1, 'orgue': 1, 'basse': 1, 'fx': 1})

def nv_gravite():
    """ORBITE · GRAVITÉ ZÉRO — à mi-tempo (on flotte à 60 BPM de ressenti) : pouls de sous-basse, cloches de verre qui
    tombent lentement, nappe spatiale, un souffle de vide. Deux mesures d'accord, rien ne presse."""
    M = M4(120, 204); de = M.de; T = 50  # ré dorien
    pad = M.piste('pad'); cl = M.piste('cloches'); sb = M.piste('basse')
    for m in (0, 2):
        d = [0, 3][m // 2]
        for n in accord(T + 12, 'dor', d):
            l, r = supersaw(n, M.temps * 8 + 1., 3, 7, de); e = env(len(l), 1., 9, 1, 1., M.temps * 8)
            pad.pose2(M.t(m), filtre(l * e, 'low', 1500), filtre(r * e, 'low', 1500), .12)
        for p in (0, 16):
            nn = int(.9 * SR); t = np.arange(nn) / SR; rr = deg(T - 12, 'dor', d)
            sb.pose(M.t(m) + p * M.dc, np.sin(2 * np.pi * np.cumsum(hz(rr) * (1 + .5 * np.exp(-t / .03))) / SR) * np.exp(-t / .35), .7)
    for m, p, dd in ((0, 0, 7), (0, 6, 9), (0, 12, 11), (1, 4, 14), (1, 10, 11), (2, 0, 9), (2, 8, 7), (3, 2, 11), (3, 8, 14), (3, 12, 16)):
        cl.pose(M.t(m, p), fm(deg(T + 12, 'dor', dd), 4., 3.5, 3., .6, 1.5), .08, (-1) ** p * .5)
    M.patron('bat', '........x.......', lambda: charley(de, True, 10000), .15, .5, mes=[1, 3])
    vide = M.piste('vide'); z = filtre(de.bruit(M.n), 'low', 700) * .05; vide.L += z; vide.R += np.roll(z, 5000)
    eL, eR = echo(cl.L, cl.R, M.temps * 1.5, .5, 4)
    rL, rR = reverbe(cl.L + pad.L + eL, cl.R + pad.R + eR, 5.5, 7000, .06, de)
    M.piste('fx').L += rL * .7 + eL * .5; M.piste('fx').R += rR * .7 + eR * .5
    return M, fin(M, {'pad': 1, 'cloches': 1, 'basse': 1, 'bat': 1, 'vide': 1, 'fx': 1})

def nv_satellite():
    """ORBITE · SATELLITE — techno minimale : grosse caisse profonde et son grondement, des BIPS de télémétrie qui
    passent d'une oreille à l'autre (les trains Starlink), charley métallique. Froid, précis, hypnotique."""
    M = M4(126, 205); de = M.de; T = 50
    M.patron('bat', 'x...x...x...x...', lambda: kick(de, 130, 42, .4, .3, 1.4), 1.)
    M.patron('bat', '..x...x...x...x.', lambda: charley(de, False, 11000), .16, .25)
    M.patron('bat', '.......x.......x', lambda: rim(de), .2, -.4)
    bp = M.piste('bips'); gr = M.piste('gronde')
    penta = [0, 3, 5, 7, 10, 12, 15]
    for m in range(4):
        for p in range(16):
            if de.u() < .45:
                n = T + 36 + penta[int(de.u() * 7)]; nn = int(.09 * SR); t = np.arange(nn) / SR
                bp.pose(M.t(m, p), np.sin(2 * np.pi * hz(n) * t) * np.exp(-t / .025), .12, np.sin(p * .8 + m))
    k = M.bus['bat']; rL, _ = reverbe(k.L, k.R, 3., 300, de=de)
    gr.L += filtre(rL, 'low', 180) * .6; gr.R += filtre(rL, 'low', 180) * .6
    eL, eR = echo(bp.L, bp.R, M.dc * 3, .5, 5); M.piste('fx').L += eL * .6; M.piste('fx').R += eR * .6
    return M, fin(M, {'bat': 1, 'bips': 1, 'gronde': 1, 'fx': 1})

def nv_monstre():
    """FRÉNÉSIE · TRIPLE MONSTRE — drift phonk : cowbell en arpège qui ne lâche pas, 808 saturée, grosse caisse qui cogne,
    clap sale. Plus rapide et plus méchant que DARK TRIAD, pour les 8 secondes où tout part en vrille."""
    M = M4(120, 206); de = M.de; T = 53  # fa phrygien
    M.patron('bat', 'x..x..x...x..x..', lambda: kick(de, 190, 50, .22, 1., 2.6), 1.)
    M.patron('bat', '....X.......X...', lambda: clap(de, .25), .75)
    M.patron('bat', 'x.xxx.xxx.xxx.xx', lambda: charley(de, False, 9500), .16, .35)
    cb = M.piste('cowbell'); k8 = M.piste('808')
    arp = [0, 3, 7, 12, 7, 3, 1, 3]
    for m in range(4):
        base = T + 24 + [0, 0, -2, 1][m]
        for p in range(16):
            cb.pose(M.t(m, p), cloche_vache(de, base + arp[(p + m * 2) % 8], .18), .32 if p % 2 == 0 else .2, .2 * np.sin(p))
        r = T - 12 + [0, 0, -2, 1][m]
        for p, lg in ((0, 5), (6, 4), (10, 6)):
            nn = int(lg * M.dc * SR); t = np.arange(nn) / SR
            s = np.sin(2 * np.pi * np.cumsum(hz(r) * (1 + 1.2 * np.exp(-t / .02))) / SR) * env(nn, .002, 9, 1, .03, lg * M.dc - .03)
            k8.pose(M.t(m, p), np.tanh(s * 4) * .5, .9)
    fx_rev(M, [('cowbell', .5), ('bat', .15)], 1.2, .35)
    return M, fin(M, {'bat': 1, 'cowbell': .85, '808': 1, 'fx': 1})

def I(t, pour, bpm, cle, ton, idee, groupe): return {'titre': t, 'pour': pour, 'bpm': bpm, 'cle': cle, 'ton': ton, 'idee': idee, 'groupe': groupe}
LOB = 'LOBBY · 8 SECONDES'; NIV = 'NIVEAUX · 8 SECONDES'
BOUCLES8 = [
    ('lobby-coucher', lb_coucher, I('COUCHER DE SOLEIL', 'LOBBY · OUTRUN', 116, 'mi mineur', 1, "Outrun : caisse claire à la réverbe coupée net façon années 80, basse en croches, nappe large, arpège qui scintille.", LOB)),
    ('lobby-ascenseur', lb_ascenseur, I('ASCENSEUR DORÉ', 'LOBBY · BOSSA LOUNGE', 120, 'do majeur', -4, "Bossa de salon de casino : Rhodes en ii-V-I, clave, shaker, basse qui marche. Cocktail à la main en attendant la partie.", LOB)),
    ('lobby-arcade', lb_arcade, I("PIÈCE D'OR", 'LOBBY · 8 BITS', 120, 'do majeur', -4, "L'écran titre d'une borne d'arcade : carré à 12,5 %, basse en triangle qui arpège, batterie de bruit, mélodie maison.", LOB)),
    ('lobby-luxe', lb_luxe, I('LUXE', 'LOBBY · TRAP', 120, 'fa# mineur', 5, "Trap de palace : cloches de verre, 808 qui tient, charley en rafales, clap sur le 3. La caisse en or sur son socle.", LOB)),
    ('lobby-vapeur', lb_vapeur, I('VAPEUR', 'LOBBY · VAPORWAVE', 112, 'mi♭ majeur', -1, "Accords de 7e majeure fondus, chorus, bande qui pleure : la vitrine de CASH CAR vue à travers un écran cathodique.", LOB)),
    ('lobby-filtre', lb_filtre, I("FILTRE D'OR", 'LOBBY · FRENCH HOUSE', 124, 'sol dorien', -2, "Accord de funk haché dont le filtre s'ouvre sur les quatre mesures, basse slappée, quatre temps.", LOB)),
    ('lobby-rock', lb_rock, I('BONHOMME', 'LOBBY · ROCK', 120, 'mi mineur', 1, "Rock qui roule des mécaniques : riff en quintes étouffées à la paume, la note bleue qui traîne, deux guitares (une par oreille), batterie de garage et roulement de toms.", LOB)),
    ('lobby-splat', lb_splat, I('ENCRE FRAÎCHE', 'LOBBY · ROCK SPLATOON', 180, 'la majeur', 5, "Rock punk qui saute et qui gicle : quintes ouvertes en croches, batterie punk, basse qui rebondit, synthé-jouet qui répond, bulles et SPLATS d'encre, un « OH ! » de bande. 6 mesures à 180 BPM.", LOB)),
    ('niv-altitude', nv_altitude, I('ALTITUDE', 'NUAGES', 128, 'ré majeur', -2, "L'euphorie au-dessus du coton : accords pincés à contretemps, basse qui roule, cymbale qui plane. Lumineux.", NIV)),
    ('niv-neon-noir', nv_neon_noir, I('NÉON NOIR', 'VILLE', 120, 'do mineur', -1, "Darksynth : basse saturée qui grogne (la seconde mineure qui grince), caisse claire énorme coupée net, nappe menaçante.", NIV)),
    ('niv-metro', nv_metro, I('MÉTRO', 'VILLE', 132, 'fa mineur', 4, "UK garage en 2-step : grosse caisse qui saute, charley qui boite, orgue court, sous-basse. Pour se faufiler dans le trafic.", NIV)),
    ('niv-gravite', nv_gravite, I('GRAVITÉ ZÉRO', 'ORBITE', 120, 'ré dorien', 1, "À mi-tempo : pouls de sous-basse, cloches de verre qui tombent lentement, nappe spatiale, le souffle du vide.", NIV)),
    ('niv-satellite', nv_satellite, I('SATELLITE', 'ORBITE', 126, 'ré mineur', 1, "Techno minimale : grosse caisse profonde qui gronde, bips de télémétrie d'une oreille à l'autre (les trains Starlink).", NIV)),
    ('niv-monstre', nv_monstre, I('TRIPLE MONSTRE', 'FRÉNÉSIE', 120, 'fa phrygien', 4, "Drift phonk : cowbell en arpège qui ne lâche pas, 808 saturée, grosse caisse qui cogne. Plus méchant que DARK TRIAD.", NIV)),
]

# ============================================================ NÉON DRIVE « MOTEUR » — la musique qui évolue
"""(2026-10-01, Léo : « que la musique puisse évoluer encore plus — ni trop vite ni trop lentement, pas casse-tête, bien
rythmée, en fonction de la vitesse ET du moteur, un mélange des deux pour une expérience fluide »).
NÉON DRIVE refaite en 8 mesures (16,3 s) dont chaque partie a des VARIANTES que le jeu échange aux fins de phrase :
la répétition ne s'entend plus, et le moteur débloque des variantes plus riches + la couche ÉNERGIE.
`sel` choisit la variante de chaque partie ; le rendu en couches (boucles.py, VARIANTES) fait une piste par (partie, variante)."""
def neon2(sel=None):
    S = {'pad': 'A', 'arp': 'A', 'basse': 'A', 'bat': 'A', 'lead': 'A', 'energie': 'A'}; S.update(sel or {})
    M = Morceau(118, mesures=8, graine=12); de = M.de; T = 57  # la mineur
    prog = [0, 0, 5, 5, 2, 2, 6, 6]  # i · VI · III · VII, deux mesures chacun
    M.patron('kick', 'x...x...x...x...', lambda: kick(de), 1.0)
    # RYTHME — A : clap + charley ouverte · B : + doubles-croches fantômes, shaker, roulement en mesure 8
    M.patron('bat', '....x.......x...', lambda: clap(de), .55, .1)
    M.patron('bat', '..x...x...x...x.', lambda: charley(de, True), .22, .2)
    if S['bat'] == 'B':
        M.patron('bat', 'oxoxoxoxoxoxoxox', lambda: charley(de), .13, -.3)
        M.patron('bat', 'xxxxxxxxxxxxxxxx', lambda: shaker(de), .3, .35)
        M.patron('bat', '........x.x.xxxx', lambda: caisse(de, 210, 1., .1, 2200), .35, mes=[7])
    kicks = [M.t(m, p) for m in range(8) for p in (0, 4, 8, 12)]
    pad = M.piste('pad'); arp = M.piste('arp'); b = M.piste('basse'); ld = M.piste('lead'); en = M.piste('energie')
    for m in range(8):
        d = prog[m]; r = deg(T - 12, 'min', d)
        # BASSE — A : octaves en doubles-croches · B : galop (1 · 3-4 · …) qui pousse
        pas_b = range(16) if S['basse'] == 'A' else (0, 3, 4, 7, 8, 11, 12, 14, 15)
        for p in pas_b:
            n = r + (12 if (S['basse'] == 'A' and p % 2) or (S['basse'] == 'B' and p in (4, 12)) else 0) + (7 if S['basse'] == 'B' and p == 14 else 0)
            dur = M.dc * .9; nn = int(dur * SR)
            s = scie(hz(n), nn) * env(nn, .003, .08, .3)
            b.pose(M.t(m, p), balaye(s, np.full(nn, 380 + 900 * (p % 4 == 2))), .5 if S['basse'] == 'A' else .62)
        # NAPPE — A : l'accord · B : ouverte (9e, octave en haut, filtre qui s'ouvre sur les deux mesures)
        if m % 2 == 0:
            notes = accord(T, 'min', d) + ([deg(T + 12, 'min', d + 1), deg(T + 12, 'min', d + 4)] if S['pad'] == 'B' else [])
            for note in notes:
                l, r2 = supersaw(note, M.temps * 8 + .3, 5, 16, de)
                e = env(len(l), .25, 9, 1, .35, M.temps * 8 - .1)
                if S['pad'] == 'B':
                    fc = 1800 + 3200 * np.clip(np.arange(len(l)) / (M.temps * 8 * SR), 0, 1)
                    pad.pose2(M.t(m), balaye(l * e, fc), balaye(r2 * e, fc), .13)
                else:
                    pad.pose2(M.t(m), filtre(l * e, 'low', 2600), filtre(r2 * e, 'low', 2600), .16)
        # ARPÈGE — A : croches · B : doubles-croches à l'octave · C : syncopé, accords pincés
        if S['arp'] == 'A':
            motif = [0, 2, 4, 7, 9, 7, 4, 2]
            for p in range(0, 16, 2):
                n = deg(T + 12, 'min', d + motif[(p // 2 + m) % 8]); nn = int(.14 * SR)
                arp.pose(M.t(m, p), filtre(carre(hz(n), nn, .3) * env(nn, .002, .05), 'low', 3800), .13, .3 * (1 if p % 4 else -1))
        elif S['arp'] == 'B':
            for p in range(16):
                n = deg(T + 12, 'min', d + [0, 4, 7, 4][p % 4]) + (12 if p % 8 >= 4 else 0); nn = int(.09 * SR)
                arp.pose(M.t(m, p), filtre(carre(hz(n), nn, .25) * env(nn, .002, .03), 'low', 5000), .1, .45 * np.sin(p * .7))
        else:
            for p in (0, 3, 6, 10, 12, 14):
                for k, n in enumerate(accord(T + 12, 'min', d, False)):
                    l, r2 = supersaw(n, .35, 3, 12, de); e = env(len(l), .002, .07, 0)
                    arp.pose2(M.t(m, p), filtre(l * e, 'low', 4200), filtre(r2 * e, 'low', 4200), .2)  # .06 → .2 : au niveau des deux autres
        # ÉNERGIE (débloquée par le moteur) : ride en croches, stabs à contretemps, montée en fin de boucle
        if S['energie'] == 'A':
            for p in range(0, 16, 2):
                en.pose(M.t(m, p), charley(de, True, 10000), .18, -.5)
            for p in (2, 6, 10, 14):
                for n in accord(T + 12, 'min', d, False):
                    l, r2 = supersaw(n, .22, 5, 20, de); e = env(len(l), .002, .06, 0)
                    en.pose2(M.t(m, p), filtre(l * e, 'low', 5500), filtre(r2 * e, 'low', 5500), .14)
    if S['energie'] == 'A':
        nn = int(M.temps * 4 * SR); t = np.arange(nn) / SR
        en.pose(M.t(7), balaye(de.bruit(nn), 400 * (25 ** (t / t[-1]))) * (t / t[-1]) ** 2 * .22, 1)
    # LEAD — trois mélodies maison (mesure, pas, degré, durée) ; C = plus haut, notes tenues (moteur fort)
    mel = {'A': [(0, 0, 7, 6), (0, 6, 9, 2), (0, 8, 11, 6), (0, 14, 9, 2), (1, 0, 7, 8), (1, 8, 4, 8),
                 (4, 0, 7, 6), (4, 6, 9, 2), (4, 8, 11, 4), (4, 12, 14, 4), (5, 0, 11, 12), (5, 12, 9, 4)],
           'B': [(2, 0, 4, 4), (2, 4, 6, 4), (2, 8, 7, 8), (3, 0, 9, 4), (3, 4, 7, 4), (3, 8, 6, 8),
                 (6, 0, 4, 4), (6, 4, 6, 4), (6, 8, 7, 4), (6, 12, 9, 4), (7, 0, 11, 12)],
           'C': [(0, 0, 14, 16), (2, 0, 12, 16), (4, 0, 11, 8), (4, 8, 12, 8), (6, 0, 14, 12), (7, 12, 16, 4)]}[S['lead']]
    for mm, p, dd, lg in mel:
        n = deg(T + 12, 'min', dd); dur = lg * M.dc; nn = int((dur + .3) * SR); t = np.arange(nn) / SR
        vib = 1 + .004 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / .3, 0, 1)
        s = (scie(hz(n) * vib, nn) + scie(hz(n) * vib * 1.006, nn)) * .5 * env(nn, .02, 9, 1, .12, dur)
        ld.pose(M.t(mm, p), balaye(s, 1200 + 2500 * np.exp(-t / .25)), .22)
    g = pompe(M.n, kicks, .75)
    for k in ('basse', 'pad', 'arp', 'energie'): M.bus[k].L *= g; M.bus[k].R *= g
    eL, eR = echo(arp.L + ld.L * .5, arp.R + ld.R * .5, M.temps * .75, .45)
    rL, rR = reverbe(pad.L + ld.L + eL * .5 + M.bus['bat'].L * .15, pad.R + ld.R + eR * .5 + M.bus['bat'].R * .15, 2.8, de=de)
    M.piste('fx').L += eL * .7 + rL * .35; M.piste('fx').R += eR * .7 + rR * .35
    return M, fin(M, {'kick': 1, 'bat': 1, 'basse': 1, 'pad': 1, 'arp': 1, 'lead': 1, 'energie': 1, 'fx': 1})

def neon2_transition():
    """le PASSAGE DE PALIER : une mesure de montée (bruit qui grimpe + scie qui monte d'une octave), puis sur le temps fort
    un crash, une grosse caisse de fond et une queue de réverbe. Joué une mesure AVANT la barre visée."""
    M = Morceau(118, mesures=2, graine=13); de = M.de
    nn = int(M.temps * 4 * SR); t = np.arange(nn) / SR; u = t / t[-1]
    up = balaye(de.bruit(nn), 300 * (40 ** u)) * u ** 2 * .5
    up += scie(hz(57) * (2 ** u), nn) * u ** 3 * .12
    fx = M.piste('fx'); fx.pose(0, up, 1)
    fx.pose(M.t(1), crash(de, 2.), .8, -.3); fx.pose(M.t(1), crash(de, 1.6), .6, .3)
    fx.pose(M.t(1), kick(de, 120, 38, .9, .3, 2.), .9)
    L, R = fx.L.copy(), fx.R.copy(); rL, rR = reverbe(L, R, 2.5, 6000, de=de)
    L = L + rL * .5; R = R + rR * .5
    pk = max(np.abs(L).max(), np.abs(R).max()); return L * .7 / pk, R * .7 / pk

VARIANTES = {  # (nom, bus, seuil, sol, clé de variante, [(variante, moteur minimum)])
    'neon-drive-2': dict(fn=neon2, transition=neon2_transition, titre='NÉON DRIVE · MOTEUR', bpm=118, ton=-4, couches=[
        ('NAPPE', ['pad'], 0, False, 'pad', [('A', 0), ('B', .35)]),
        ('ARPEGE', ['arp'], .3, False, 'arp', [('A', 0), ('C', 0), ('B', .25)]),
        ('BASSE', ['basse'], .5, False, 'basse', [('A', 0), ('B', .2)]),
        ('RYTHME', ['bat'], .68, False, 'bat', [('A', 0), ('B', .3)]),
        ('GROSSE CAISSE', ['kick'], .8, True, None, [('A', 0)]),
        ('LEAD', ['lead'], .95, False, 'lead', [('A', 0), ('B', 0), ('C', .5)]),
        ('ENERGIE', ['energie'], .9, False, 'energie', [('A', .45)]),
    ]),
}
