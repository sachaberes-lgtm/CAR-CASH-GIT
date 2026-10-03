"""CINQ LOBBYS (2026-10-03, Léo : « abandonne MÉTRO et FILTRE D'OR ; fais-en 5 nouveaux : un rock américain cyberpunk OLD MONEY NEW GEAR,
un plus chinois bouddhiste DJ tech, un beach club MARGARITA BOSS, un parisien PUNK MONEY, un SAVANE CITY ROBOTICS »).
La règle du lobby (CAHIER-MUSIQUE.md) : 8 mesures dont la 2e moitié RÉPOND à la 1re, et UNE ambiance commune — la bande qui pleure sur
les parties harmoniques, une grande réverbe douce, les aigus adoucis (passe-bas maître ~6,5-8 kHz), la même sonie (−15 dB RMS).
Chaque note est jouée « à la main » (Main : quelques ms, une force qui varie).
Sortie : assets/audio/music/boucles/l5-*.m4a + lobby5-donnees.js (window.LOBBY5), lus par boucles.html (onglet Lobby).
"""
import os, sys, json, subprocess, time
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from boucles import *  # noqa: F403
from boucles8 import chorus, fx_rev, pompe_bus, kicks_de, rim, shaker, guitare, tom, crash, porte
from petits import Main
from vapeurs import bande, melodie, nappe_vapeur

SORTIE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'audio', 'music', 'boucles')


def ambiance(M, harm, gains, lp=7000, rev=(2.8, .38, 4800)):
    bande(M, [k for k in harm if k in M.bus])
    fx_rev(M, [(k, 1) for k in harm] + [('bat', .15)], rev[0], rev[1], rev[2])
    return fin(M, gains, maitre_lp=lp)


# ================================================================================ 1. VIEILLE FORTUNE
def l_fortune():
    """VIEILLE FORTUNE — rock américain cyberpunk, « old money, new gear » : guitares en quintes étouffées à la paume (1re moitié), qui
    s'ouvrent en grands accords tenus (2e), une batterie de rock posée à la réverbe coupée net, une basse en croches ; par-dessus, le
    « new gear » : un arpège de synthé froid en écho, et le « old money » : un piano de salon (FM) qui chante la mélodie."""
    M = Morceau(100, mesures=8, graine=601); de = M.de; h = Main(21, 4); T = 52   # mi mineur
    M.patron('bat', 'x.....x.x.......', lambda: kick(de, 120, 44, .4, .4, 1.4), .9)
    M.patron('sn', '....x.......x...', lambda: caisse(de, 180, 1.1, .2, 1600), .65)
    M.patron('bat', 'x.x.x.x.x.x.x.x.', lambda: charley(de, False, 7500), .12, .3)
    prog = [[52, 59, 64], [48, 55, 60], [55, 62, 67], [50, 57, 62]]          # Mi5 · Do5 · Sol5 · Ré5 (i VI III VII)
    g = M.piste('gtr'); b = M.piste('basse')
    for m in range(8):
        q = prog[m % 4]
        if m < 4:
            for p in range(0, 16, 2): g.pose(h.t(M.t(m, p)), guitare(de, q, M.dc * 1.6, True), h.g(.55), -.35)
        else:
            g.pose(h.t(M.t(m, 0)), guitare(de, q + [q[0] + 12], M.temps * 3.6, False, .8), .5, -.35)
            g.pose(h.t(M.t(m, 0)) + .012, guitare(de, q, M.temps * 3.6, False, .8), .45, .35)
        for p in range(0, 16, 2):
            nn = int(M.dc * 1.7 * SR); s = np.tanh((scie(hz(q[0] - 12), nn) * .6 + sinus(hz(q[0] - 12), nn)) * env(nn, .003, .15, .4) * 1.8)
            b.pose(h.t(M.t(m, p)), filtre(s, 'low', 900), .5)
    ar = M.piste('arp')                                                       # NEW GEAR : l'arpège froid
    for m in range(8):
        q = prog[m % 4]; notes = [q[0] + 24, q[1] + 24, q[2] + 24, q[1] + 36]
        for i in range(16):
            nn = int(.11 * SR); ar.pose(M.t(m, i), filtre(carre(hz(notes[i % 4]), nn, .3) * env(nn, .002, .05), 'low', 3500), .05 if m < 4 else .07, .45 if i % 2 else -.45)
    eL, eR = echo(ar.L, ar.R, M.temps * .75, .4); ar.L += eL * .5; ar.R += eR * .5
    pi = M.piste('piano')                                                     # OLD MONEY : le piano de salon
    for m, p, n, lg in ((4, 0, 76, 6), (4, 8, 74, 4), (4, 12, 71, 4), (5, 0, 72, 8), (5, 10, 74, 6), (6, 0, 79, 6), (6, 8, 78, 4), (6, 12, 76, 4), (7, 0, 74, 14)):
        pi.pose(h.t(M.t(m, p)), plus(fm(n, lg * M.dc + 1., 1, 2.2, .12, .9), .25 * fm(n + 12, .6, 3, 1.2, .03, .25)), h.g(.11), .15)
    sn = M.bus['sn']; rL, rR = reverbe(sn.L, sn.R, 1.8, 6000, de=de); gt = porte(M.n, [M.t(m, p) for m in range(8) for p in (4, 12)])
    M.piste('fx').L += rL * gt * .7; M.piste('fx').R += rR * gt * .7
    return M, ambiance(M, ('piano', 'arp'), {'bat': .9, 'sn': .9, 'gtr': .9, 'basse': 1, 'arp': 1, 'piano': 1, 'fx': 1}, 6300)


# ================================================================================ 2. TEMPLE DE JADE
def bol(m, dur=4.):
    """un bol chantant : quelques partiels inharmoniques qui battent, très longs"""
    nn = int(dur * SR); t = np.arange(nn) / SR; f = hz(m); s = 0
    for r9, a, d in ((1, 1, 2.5), (2.71, .5, 1.8), (5.1, .25, 1.), (1.004, .6, 2.5)):
        s = s + a * np.sin(2 * np.pi * f * r9 * t) * np.exp(-t / d)
    return s * (1 - np.exp(-t / .01)) * .35


def guzheng(m, dur, de, bend=0.):
    """une corde de guzheng : pincée claire, un léger vibrato de la main gauche (et une petite glissade quand bend ≠ 0)"""
    x = karplus(m, dur, .85, .9985, de); nn = len(x); t = np.arange(nn) / SR
    vib = .004 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - .15) / .3, 0, 1) + bend * np.clip(t / .12, 0, 1)
    idx = np.clip(np.cumsum(2 ** (vib / 1)) - 1, 0, nn - 1)              # la hauteur qui bouge = une relecture un peu plus rapide
    return np.interp(idx, np.arange(nn), x) * .8


def bloc(de, f=900):
    nn = int(.08 * SR); t = np.arange(nn) / SR
    return (np.sin(2 * np.pi * f * t) * .8 + passe_bande(de.bruit(nn), f, f * 2) * .3) * np.exp(-t / .018)


def l_temple():
    """TEMPLE DE JADE — DJ tech au temple : un quatre temps feutré de deep tech, le bloc de bois du moine sur les contretemps, une
    sous-basse profonde ; le guzheng égrène une phrase pentatonique (la, do, ré, mi, sol) ; un gong ouvre chaque moitié ; en 2e moitié
    les bols chantants s'installent et une flûte de bambou (souffle + sinus) répond."""
    M = Morceau(118, mesures=8, graine=602); de = M.de; h = Main(22, 4)
    M.patron('bat', 'x...x...x...x...', lambda: kick(de, 110, 42, .4, .1, 1.1), .8)
    M.patron('bat', '..x...x...x...x.', lambda: charley(de, False, 7000), .1, .3)
    M.patron('bat', '...x..x....x..x.', lambda: bloc(de, 820), .35, -.3)
    M.patron('bat', 'o.o.o.o.o.o.o.o.', lambda: shaker(de), .15, .4, mes=range(4, 8))
    b = M.piste('basse')
    for m in range(8):
        r = [33, 33, 38, 31][m % 4]                                           # la · la · ré · sol (tout en bas)
        for p, lg in ((0, 3), (7, 2), (10, 4)):
            nn = int(lg * M.dc * SR); b.pose(h.t(M.t(m, p)), np.tanh(sinus(hz(r), nn) * env(nn, .005, 9, 1, .05, lg * M.dc - .05) * 1.4), .6)
    gz = M.piste('guzheng')
    A = [(0, 0, 69), (0, 3, 72), (0, 6, 74), (0, 10, 76), (1, 0, 74, -.03), (1, 6, 72), (1, 10, 69), (2, 0, 67), (2, 3, 69), (2, 8, 72), (3, 0, 69, .02)]
    for m0 in (0, 4):
        for e9 in A:
            m, p, n = e9[:3]; bd = e9[3] if len(e9) > 3 else 0
            gz.pose(h.t(M.t(m + m0, p)), guzheng(n + (12 if m0 and p in (6, 10) else 0), 1.4, de, bd), h.g(.4), -.2)
    fx = M.piste('gong')
    for m in (0, 4):
        nn = int(5 * SR); t = np.arange(nn) / SR
        gg = sum(a * np.sin(2 * np.pi * f * t) for f, a in ((86, 1), (151, .6), (233, .4), (377, .25))) * np.exp(-t / 2.) * (1 - np.exp(-t / .02))
        fx.pose(M.t(m), filtre(gg, 'low', 2500), .18)
    bols = M.piste('bols')
    for m, n in ((4, 69), (5, 76), (6, 74), (7, 72)): bols.pose(M.t(m, 2), bol(n, 4.5), .5, .3)
    fl = M.piste('flute')
    for m, p, n, lg in ((4, 8, 81, 6), (5, 8, 84, 6), (6, 8, 86, 4), (6, 12, 84, 4), (7, 4, 81, 10)):
        nn = int((lg * M.dc + .4) * SR); t = np.arange(nn) / SR
        s = sinus(hz(n) * (1 + .004 * np.sin(2 * np.pi * 5 * t)), nn) + passe_bande(de.bruit(nn), hz(n) * .9, hz(n) * 1.15) * .25   # le son + le souffle
        fl.pose(h.t(M.t(m, p)), s * env(nn, .08, 9, 1, .2, lg * M.dc), h.g(.08), .2)
    pompe_bus(M, ('basse', 'bols'), kicks_de(M), .35)
    return M, ambiance(M, ('guzheng', 'bols', 'flute', 'gong'), {'bat': .9, 'basse': 1, 'guzheng': 1, 'gong': 1, 'bols': 1, 'flute': 1, 'fx': 1}, 7000, (3.4, .45, 5000))


# ================================================================================ 3. MARGARITA BOSS
def marimba(m, dur=.8):
    nn = int(dur * SR); t = np.arange(nn) / SR; f = hz(m)
    return (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / .05)) * np.exp(-t / .3) * (1 - np.exp(-t / .002))


def steeldrum(m, dur=1.):
    return fm(m, dur, 1.5, 1.1, .15, .45)


def conga(de, f=210, slap=False):
    nn = int(.35 * SR); t = np.arange(nn) / SR
    s = np.sin(2 * np.pi * np.cumsum(f * (1 + .3 * np.exp(-t / .02))) / SR) * np.exp(-t / (.08 if slap else .18))
    return s + (passe_bande(de.bruit(nn), 1500, 6000) * np.exp(-t / .012) * (.8 if slap else .2))


def l_margarita():
    """MARGARITA BOSS — beach club au coucher du soleil : tropical house, quatre temps doux, congas qui dialoguent, shaker, une guitare
    nylon qui gratte les contretemps, le marimba en motif sautillant ; en 2e moitié le steel-drum chante et une nappe chaude s'ouvre."""
    M = Morceau(112, mesures=8, graine=603); de = M.de; h = Main(23, 5)
    M.patron('bat', 'x...x...x...x...', lambda: kick(de, 115, 45, .35, .2, 1.1), .75)
    M.patron('bat', '....x.......x...', lambda: clap(de, .2), .3)
    M.patron('bat', 'xoxoxoxoxoxoxoxo', lambda: shaker(de), .2, -.35)
    M.patron('perc', '..x..x....x.x...', lambda: conga(de, 210), .35, .3)
    M.patron('perc', '.......x.....x.x', lambda: conga(de, 300, True), .3, -.3)
    prog = [[53, 57, 60, 64], [48, 52, 55, 59], [50, 53, 57, 60], [46, 50, 53, 57]]  # Fa maj7 · Do maj7 · Ré m7 · Si♭ maj7
    gt = M.piste('gtr'); b = M.piste('basse'); mb = M.piste('marimba')
    for m in range(8):
        q = prog[m % 4]
        for p in (2, 6, 10, 14):                                                       # le grattage sur les contretemps
            for k, n in enumerate(q): gt.pose(h.t(M.t(m, p)) + k * .012, filtre(karplus(n + 12, .5, .5, .995, de), 'low', 4000), h.g(.18), -.3)
        r = q[0] - 12
        for p, o in ((0, 0), (6, 7), (8, 12), (11, 7)):
            nn = int(M.dc * 2.2 * SR); b.pose(h.t(M.t(m, p)), (sinus(hz(r + o - 12), nn) + .2 * tri(hz(r + o - 12) * 2, nn)) * env(nn, .006, .3, .3), .55)
        for i, p in enumerate((0, 3, 6, 8, 11, 14)):
            mb.pose(h.t(M.t(m, p)), marimba(q[[3, 2, 1, 3, 2, 0][i]] + 12, .6), h.g(.16), .25 if i % 2 else -.15)
    sd = M.piste('steel')
    for m, p, n, lg in ((4, 0, 81, 4), (4, 4, 79, 2), (4, 6, 76, 6), (5, 0, 79, 6), (5, 8, 76, 4), (6, 0, 77, 4), (6, 4, 81, 4), (6, 10, 79, 4), (7, 0, 77, 8), (7, 10, 76, 6)):
        sd.pose(h.t(M.t(m, p)), steeldrum(n, lg * M.dc + .6), h.g(.12), .2)
    nappe_vapeur(M, de, [[q9 + 12 for q9 in q] for q in prog], 1800, .04, range(4, 8))
    pompe_bus(M, ('basse', 'pad', 'gtr'), kicks_de(M), .35)
    return M, ambiance(M, ('steel', 'marimba', 'pad', 'gtr'), {'bat': .85, 'perc': 1, 'gtr': 1, 'basse': 1, 'marimba': 1, 'steel': 1, 'pad': 1, 'fx': 1}, 8000)


# ================================================================================ 4. PARIS PUNK CASH
def accordeon(m, dur):
    """l'accordéon musette : deux anches désaccordées (le « battement » de la musette) + une une octave en dessous"""
    nn = int(dur * SR); t = np.arange(nn) / SR; f = hz(m)
    s = carre(f, nn, .4) * .5 + carre(f * 1.012, nn, .4) * .5 + carre(f / 2, nn, .45) * .35
    return filtre(s * env(nn, .03, 9, 1, .05, dur - .05), 'low', 3200) * (1 + .15 * np.sin(2 * np.pi * 6 * t))


def caisse_enreg(de):
    nn = int(1.2 * SR); t = np.arange(nn) / SR
    cloche = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, d in ((2093, .5), (2637, .4), (3136, .3)))
    pieces = passe_bande(de.bruit(nn), 4000, 11000) * np.exp(-((t - .12) / .08) ** 2) * .6
    return (cloche * .35 + pieces) * (1 - np.exp(-t / .002))


def l_paris():
    """PARIS PUNK CASH — le punk qui fonce dans une rue de Montmartre : batterie punk qui alterne, guitares saturées en accords de
    puissance, basse en croches ; un accordéon musette siffle le riff (la mineur, la quinte et la sensible qui grince) ; la caisse
    enregistreuse sonne au bout de chaque moitié. En 2e moitié l'accordéon prend la mélodie et les guitares s'ouvrent."""
    M = Morceau(168, mesures=8, graine=604); de = M.de; h = Main(24, 3)
    M.patron('bat', 'x...x...x...x...', lambda: kick(de, 130, 46, .25, .5, 1.6), .9)
    M.patron('sn', '..x...x...x...x.', lambda: caisse(de, 210, 1.2, .14, 2400), .6)
    M.patron('bat', 'x.x.x.x.x.x.x.x.', lambda: charley(de, False, 8000), .12, .3)
    prog = [[57, 64, 69], [53, 60, 65], [48, 55, 60], [52, 59, 64]]          # La5 · Fa5 · Do5 · Mi5
    g = M.piste('gtr'); b = M.piste('basse')
    for m in range(8):
        q = prog[m % 4]
        for p in range(0, 16, 2):
            g.pose(h.t(M.t(m, p)), guitare(de, q, M.dc * 1.7, m < 4 and p % 4 != 0, 1.1), h.g(.5), -.35 if p % 4 else .35)
        for p in range(0, 16, 2):
            nn = int(M.dc * 1.6 * SR); b.pose(h.t(M.t(m, p)), filtre(np.tanh(scie(hz(q[0] - 12), nn) * env(nn, .003, .1, .5) * 2), 'low', 1000), .45)
    ac = M.piste('accordeon')
    riff = [(0, 0, 76, 2), (0, 2, 75, 2), (0, 4, 76, 4), (0, 8, 72, 4), (0, 12, 69, 4), (1, 0, 72, 4), (1, 4, 71, 2), (1, 6, 69, 2), (1, 8, 68, 8),
            (2, 0, 67, 4), (2, 4, 69, 4), (2, 8, 72, 4), (2, 12, 76, 4), (3, 0, 75, 4), (3, 4, 76, 4), (3, 8, 71, 8)]
    for m0, gain in ((0, .12), (4, .16)):
        for m, p, n, lg in riff:
            ac.pose(h.t(M.t(m + m0, p)), accordeon(n + (12 if m0 and m == 2 else 0), lg * M.dc), h.g(gain), .1)
    cs = M.piste('caisse')
    for m in (3, 7): cs.pose(M.t(m, 12), caisse_enreg(de), .5, -.2)
    M.piste('fx').pose(M.t(4), crash(de, 1.4), .25)
    return M, ambiance(M, ('accordeon',), {'bat': .9, 'sn': .9, 'gtr': .8, 'basse': 1, 'accordeon': 1, 'caisse': 1, 'fx': 1}, 6000, (2.4, .32, 4500))


# ================================================================================ 5. SAVANE ROBOTIQUE
def djembe(de, kind='ton'):
    nn = int(.3 * SR); t = np.arange(nn) / SR
    if kind == 'basse': return np.sin(2 * np.pi * np.cumsum(70 * (1 + .5 * np.exp(-t / .02))) / SR) * np.exp(-t / .2)
    if kind == 'ton': return np.sin(2 * np.pi * 330 * t) * np.exp(-t / .07) + passe_bande(de.bruit(nn), 600, 2500) * np.exp(-t / .02) * .3
    return passe_bande(de.bruit(nn), 1800, 7000) * np.exp(-t / .015) * 1.2 + np.sin(2 * np.pi * 520 * t) * np.exp(-t / .03) * .3


def robot(m, dur, vowel=(700, 1200)):
    """une voix de robot : une scie à travers deux formants (une voyelle) qui glissent"""
    nn = int(dur * SR); t = np.arange(nn) / SR
    s = scie(hz(m), nn) * env(nn, .01, 9, 1, .05, dur - .05)
    a = passe_bande(s, vowel[0] * .8, vowel[0] * 1.2) + .6 * passe_bande(s, vowel[1] * .85, vowel[1] * 1.15)
    return a * (1 + .5 * np.sign(np.sin(2 * np.pi * 18 * t)) * .3)


def l_savane():
    """SAVANE ROBOTIQUE — la savane rencontre la ville des robots : un djembé (basse, ton, claqué) et un shaker en polyrythme, une kalimba
    qui égrène un motif de trois contre quatre (sol majeur pentatonique), une basse de synthé ronde ; en 2e moitié une voix de robot
    (formants) chante des accords et des bips de télémétrie répondent d'une oreille à l'autre."""
    M = Morceau(120, mesures=8, graine=605); de = M.de; h = Main(25, 6)
    M.patron('bat', 'x.........x.....', lambda: kick(de, 110, 44, .35, .15, 1.1), .7)
    per = M.piste('perc')
    for m in range(8):
        for i, c in enumerate('b..t.st.b.t.s.t.'):
            if c == '.': continue
            per.pose(h.t(M.t(m, i)), djembe(de, {'b': 'basse', 't': 'ton', 's': 'claque'}[c]), h.g(.45), -.2 if c == 't' else .2)
    M.patron('bat', 'oxoxoxoxoxoxoxox', lambda: shaker(de), .18, .4)
    from petits import kalimba
    kl = M.piste('kalimba'); motif = [67, 71, 74, 79, 76, 74]
    for m in range(8):
        for k in range(0, 16, 3):                                              # trois contre quatre : la kalimba glisse sur la mesure
            n = motif[(k // 3 + m * 2) % len(motif)]
            kl.pose(h.t(M.t(m, k)), kalimba(n + (12 if m >= 4 and k % 2 else 0), 1.1, de), h.g(.3), .35 * np.sin(k + m))
    prog = [[43, 55, 59, 62], [40, 55, 59, 64], [36, 55, 60, 64], [38, 54, 57, 62]]  # Sol · Mi m7 · Do maj7 · Ré
    b = M.piste('basse')
    for m in range(8):
        r = prog[m % 4][0]
        for p, lg in ((0, 3), (6, 2), (10, 2), (14, 2)):
            nn = int(lg * M.dc * SR); s = sinus(hz(r), nn) + .3 * carre(hz(r), nn, .5) * np.exp(-np.arange(nn) / SR / .04)
            b.pose(h.t(M.t(m, p)), filtre(s * env(nn, .004, 9, 1, .03, lg * M.dc - .03), 'low', 700), .55)
    rb = M.piste('robot')
    for m in range(4, 8):
        for k, n in enumerate(prog[m % 4][1:]):
            rb.pose(M.t(m, 0) + k * .01, robot(n, M.temps * 3.5, [(700, 1200), (400, 2000), (600, 1000), (500, 1700)][m % 4]), .1, -.3 + .3 * k)
    bp = M.piste('bips')
    for m in range(4, 8):
        for p in (5, 9, 13):
            nn = int(.06 * SR); bp.pose(M.t(m, p), carre(hz(91 + (p % 4)), nn, .5) * np.exp(-np.arange(nn) / SR / .02), .04, .8 if p % 2 else -.8)
    eL, eR = echo(bp.L, bp.R, M.temps * .75, .45); bp.L += eL * .6; bp.R += eR * .6
    return M, ambiance(M, ('kalimba', 'robot', 'bips'), {'bat': .85, 'perc': 1, 'kalimba': 1, 'basse': 1, 'robot': 1, 'bips': 1, 'fx': 1}, 7200)



# ======================================================================================== v2 : « MOINS DE DÉTAILS, PLUS JEU VIDÉO »
# (2026-10-03, Léo) — LE MOULE JEU VIDÉO : une MÉLODIE qu'on retient au synthé (onde carrée à vibrato, petit écho), une batterie simple
# et franche, une basse claire, des accords COURTS en contretemps, et UN SEUL instrument signature par thème. 8 mesures : la 2e moitié
# reprend le thème une octave plus haut avec la signature. L'ambiance du lobby reste (bande, réverbe douce, aigus doux), même sonie.
def lead_jeu(m, dur, pw=.25, vib=.006):
    nn = int((dur + .05) * SR); t = np.arange(nn) / SR
    f = hz(m) * (1 + vib * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - .12) / .2, 0, 1))
    s = carre(f, nn, pw) * .7 + carre(f * 1.004, nn, pw) * .3
    return filtre(s * env(nn, .005, .2, .7, .05, dur), 'low', 5500)


def stab_jeu(notes, dur=.18):
    nn = int(dur * SR); s = 0
    for n in notes: s = s + carre(hz(n), nn, .5)
    return filtre(s / len(notes) * env(nn, .002, .08, .3), 'low', 3000)


def basse_jeu(m, dur, onde='tri'):
    nn = int(dur * SR); f = hz(m)
    s = tri(f, nn) if onde == 'tri' else (scie(f, nn) * .5 + sinus(f, nn))
    return filtre(s * env(nn, .003, .12, .6, .03, dur - .03), 'low', 1200)


def jeu_video(bpm, graine, prog, hook, bat, basse_pas, accords_pas, signature=None, lp=7000, onde='tri', gl=.13):
    M = Morceau(bpm, mesures=8, graine=graine); de = M.de; h = Main(graine, 3)
    for nom, motif, son, g in bat: M.patron('bat' if nom != 'sn' else 'sn', motif, son(de), g)
    b = M.piste('basse'); ac = M.piste('accords'); ld = M.piste('lead')
    for m in range(8):
        q = prog[m % 4]
        for p, o, lg9 in basse_pas: b.pose(h.t(M.t(m, p)), basse_jeu(q[0] - 12 + o, lg9 * M.dc, onde), .6)
        for p in accords_pas: ac.pose(h.t(M.t(m, p)), stab_jeu(q[1:]), .14 if m < 4 else .17)
    for m0, o in ((0, 0), (4, 12)):                                        # le thème, puis le thème une octave plus haut
        for m, pas in enumerate(hook):
            for p, n, lg9 in pas: ld.pose(h.t(M.t(m + m0, p)), lead_jeu(n + o - (12 if o and n > 84 else 0), lg9 * M.dc * .95), h.g(gl))
    eL, eR = echo(ld.L, ld.R, M.temps * .75, .3); ld.L += eL * .35; ld.R += eR * .35
    if signature: signature(M, de, h)
    # (Léo : « mais l'ambiance pas mal ») : L'AMBIANCE DU LOBBY gardée — la bande qui pleure, la grande réverbe douce, les aigus adoucis
    return M, ambiance(M, ('lead', 'accords', 'sig'), {'bat': .9, 'sn': .9, 'basse': 1, 'accords': 1, 'lead': 1, 'sig': 1, 'fx': 1}, lp)


def l_fortune():
    def sig(M, de, h):                                                    # la guitare : des accords de puissance sur la 2e moitié
        g = M.piste('sig')
        for m in range(4, 8): g.pose(M.t(m), guitare(de, [[52, 59, 64], [48, 55, 60], [55, 62, 67], [50, 57, 62]][m % 4], M.temps * 1.8, False, .9), .35, -.3)
    hook = [[(0, 76, 4), (4, 79, 2), (6, 83, 4), (10, 81, 6)], [(0, 79, 4), (4, 76, 4), (8, 74, 8)],
            [(0, 79, 4), (4, 81, 2), (6, 83, 4), (10, 86, 6)], [(0, 81, 4), (4, 78, 4), (8, 76, 8)]]
    return jeu_video(100, 611, [[40, 64, 67, 71], [36, 64, 67, 72], [43, 62, 67, 71], [38, 62, 66, 69]], hook,
                     [('bat', 'x.....x.x.......', lambda de: (lambda: kick(de, 120, 44, .35, .4, 1.4)), .9),
                      ('sn', '....x.......x...', lambda de: (lambda: caisse(de, 190, 1., .15, 2000)), .6),
                      ('bat', 'x.x.x.x.x.x.x.x.', lambda de: (lambda: charley(de, False, 8000)), .1)],
                     ((0, 0, 3), (4, 0, 2), (6, 12, 2), (8, 0, 3), (12, 0, 2), (14, 12, 2)), (2, 10), sig, onde='scie')


def l_temple():
    def sig(M, de, h):                                                    # (Léo : « le gong est chelou ») → la CLOCHE DU TEMPLE : claire, accordée
        g = M.piste('sig')                                                # sur la (la tonique), deux coups qui se répondent au début de chaque moitié
        for m in (0, 4):
            for p, n, gg in ((0, 81, .2), (8, 88, .13)):
                g.pose(M.t(m, p), fm(n, 2.5, 3.5, 1.6, .2, 1.1), gg, -.2 if p else .2)
    hook = [[(0, 81, 2), (2, 84, 2), (4, 86, 4), (8, 88, 4), (12, 86, 4)], [(0, 84, 4), (4, 81, 4), (8, 79, 8)],
            [(0, 81, 2), (2, 84, 2), (4, 86, 2), (6, 88, 2), (8, 91, 4), (12, 88, 4)], [(0, 86, 4), (4, 84, 4), (8, 81, 8)]]
    return jeu_video(118, 612, [[45, 69, 72, 76], [41, 69, 72, 77], [43, 67, 71, 74], [45, 69, 72, 76]], hook,
                     [('bat', 'x...x...x...x...', lambda de: (lambda: kick(de, 120, 44, .35, .2, 1.2)), .85),
                      ('sn', '....x.......x...', lambda de: (lambda: clap(de, .18)), .4),
                      ('bat', '..x...x...x...x.', lambda de: (lambda: charley(de, False, 8000)), .12)],
                     ((0, 0, 3), (6, 0, 2), (10, 7, 3)), (2, 6, 10, 14), sig)


def l_margarita():
    def sig(M, de, h):                                                    # les congas, sur la 2e moitié
        g = M.piste('sig')
        for m in range(4, 8):
            for p, f, sl in ((2, 210, 0), (5, 210, 0), (10, 300, 1), (13, 210, 0)): g.pose(h.t(M.t(m, p)), conga(de, f, bool(sl)), .3, .3)
    hook = [[(0, 77, 2), (2, 81, 2), (4, 84, 4), (10, 81, 2), (12, 79, 4)], [(0, 79, 4), (4, 76, 2), (6, 79, 2), (8, 84, 8)],
            [(0, 81, 2), (2, 77, 2), (4, 81, 4), (8, 86, 4), (12, 84, 4)], [(0, 82, 4), (4, 81, 4), (8, 77, 8)]]
    M, (L, R) = jeu_video(112, 613, [[41, 65, 69, 72], [36, 64, 67, 72], [38, 65, 69, 74], [34, 65, 70, 74]], hook,
                          [('bat', 'x...x...x...x...', lambda de: (lambda: kick(de, 115, 45, .3, .2, 1.1)), .8),
                           ('sn', '....x.......x...', lambda de: (lambda: clap(de, .2)), .35),
                           ('bat', '..x...x...x...x.', lambda de: (lambda: charley(de, True, 8500)), .1)],
                          ((0, 0, 3), (6, 7, 2), (8, 12, 2), (11, 7, 3)), (2, 6, 10, 14), sig, gl=.11)
    return M, (L, R)


def l_paris():
    def sig(M, de, h):                                                    # la caisse enregistreuse au bout de chaque moitié
        g = M.piste('sig')
        for m in (3, 7): g.pose(M.t(m, 12), caisse_enreg(de), .45, -.2)
    riff = [[(0, 76, 2), (2, 75, 2), (4, 76, 4), (8, 72, 4), (12, 69, 4)], [(0, 72, 4), (4, 71, 2), (6, 69, 2), (8, 69, 8)],
            [(0, 67, 4), (4, 69, 4), (8, 72, 4), (12, 76, 4)], [(0, 75, 4), (4, 76, 4), (8, 71, 8)]]
    M = Morceau(168, mesures=8, graine=614); de = M.de; h = Main(614, 3)
    M.patron('bat', 'x...x...x...x...', lambda: kick(de, 130, 46, .25, .5, 1.5), .85)
    M.patron('sn', '..x...x...x...x.', lambda: caisse(de, 210, 1.1, .12, 2400), .55)
    M.patron('bat', 'x.x.x.x.x.x.x.x.', lambda: charley(de, False, 8000), .1)
    prog = [[45, 64, 69, 72], [41, 65, 69, 72], [36, 64, 67, 72], [40, 64, 68, 71]]
    b = M.piste('basse'); ac = M.piste('accords'); ld = M.piste('lead')
    for m in range(8):
        q = prog[m % 4]
        for p in range(0, 16, 2): b.pose(h.t(M.t(m, p)), basse_jeu(q[0] - 12 + (12 if p % 4 else 0), M.dc * 1.8, 'scie'), .55)
        for p in (2, 6, 10, 14): ac.pose(h.t(M.t(m, p)), stab_jeu(q[1:], .12), .13)
    for m0, o, gn in ((0, 0, .14), (4, 12, .15)):
        for m, pas in enumerate(riff):
            for p, n, lg9 in pas: ld.pose(h.t(M.t(m + m0, p)), accordeon(n + o, lg9 * M.dc * .95), h.g(gn))
    sig(M, de, h)
    return M, ambiance(M, ('lead', 'accords', 'sig'), {'bat': .9, 'sn': .9, 'basse': 1, 'accords': 1, 'lead': 1, 'sig': 1, 'fx': 1}, 6300)


def l_savane():
    def sig(M, de, h):                                                    # les bips de robot, sur la 2e moitié
        g = M.piste('sig')
        for m in range(4, 8):
            for p in (3, 7, 11, 15):
                nn = int(.07 * SR); g.pose(M.t(m, p), carre(hz(95 + (p % 3)), nn, .5) * np.exp(-np.arange(nn) / SR / .025), .07, .7 if p % 2 else -.7)
    hook = [[(0, 79, 2), (3, 83, 2), (6, 86, 2), (8, 88, 4), (12, 86, 4)], [(0, 83, 3), (3, 79, 3), (6, 76, 2), (8, 79, 8)],
            [(0, 84, 2), (3, 88, 2), (6, 91, 2), (8, 88, 4), (12, 84, 4)], [(0, 86, 3), (3, 81, 3), (6, 78, 2), (8, 79, 8)]]
    return jeu_video(120, 615, [[43, 67, 71, 74], [40, 67, 71, 76], [36, 67, 72, 76], [38, 66, 69, 74]], hook,
                     [('bat', 'x.....x...x.....', lambda de: (lambda: kick(de, 115, 44, .35, .2, 1.2)), .85),
                      ('sn', '....x.......x...', lambda de: (lambda: rim(de)), .45),
                      ('bat', '...t..t....t..t.'.replace('t', 'x'), lambda de: (lambda: djembe(de, 'ton')), .3)],
                     ((0, 0, 3), (6, 0, 2), (10, 7, 2), (14, 12, 2)), (2, 10), sig)

LOBBY5 = [
    ('l5-fortune', l_fortune, "VIEILLE FORTUNE", 'Rock américain cyberpunk · old money, new gear', 100, 'mi mineur',
     "Façon jeu vidéo : une mélodie de synthé qu'on retient, batterie rock simple ; en 2e moitié le thème monte et les guitares claquent."),
    ('l5-temple', l_temple, "TEMPLE DE JADE", 'DJ tech · temple bouddhiste', 118, 'la pentatonique',
     "Façon jeu vidéo : un thème pentatonique au synthé sur un quatre temps ; un gong ouvre chaque moitié."),
    ('l5-margarita', l_margarita, "MARGARITA BOSS", 'Beach club · tropical house', 112, 'fa majeur',
     "Façon jeu vidéo : un thème ensoleillé au synthé, accords en contretemps ; en 2e moitié les congas entrent."),
    ('l5-paris', l_paris, "PARIS PUNK CASH", 'Punk parisien · musette', 168, 'la mineur',
     "Façon jeu vidéo : l'accordéon musette joue le riff sur une batterie punk ; la caisse enregistreuse au bout de chaque moitié."),
    ('l5-savane', l_savane, "SAVANE ROBOTIQUE", 'Savane · ville des robots', 120, 'sol majeur',
     "Façon jeu vidéo : un thème au synthé sur un groove de djembé ; en 2e moitié des bips de robot répondent."),
]

if __name__ == '__main__':
    seul = sys.argv[1] if len(sys.argv) > 1 else ''
    fd = os.path.join(SORTIE, 'lobby5-donnees.js'); anc = {}
    if os.path.exists(fd):
        try: anc = {d['id']: d for d in json.loads(open(fd).read().split('=', 1)[1].rstrip().rstrip(';'))}
        except Exception: pass
    out = []
    for lid, fn, titre, style, bpm, cle, idee in LOBBY5:
        d = {'id': lid, 'titre': titre, 'style': style, 'bpm': bpm, 'cle': cle, 'idee': idee, 'onglet': 'lobby'}
        if seul and seul not in lid and lid in anc: out.append(anc[lid]); continue
        M, (L, R) = fn(); wav = os.path.join(SORTIE, lid + '.wav'); ecrit_wav(wav, L, R)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(SORTIE, lid + '.m4a')], check=True)
        os.remove(wav); print('  %-14s %.2f s' % (lid, len(L) / SR), flush=True)
        d.update(f='assets/audio/music/boucles/%s.m4a?v=%d' % (lid, int(time.time())), dur=round(len(L) / SR, 5)); out.append(d)
    open(fd, 'w').write('window.LOBBY5=' + json.dumps(out, ensure_ascii=False) + ';\n'); print('ok')
