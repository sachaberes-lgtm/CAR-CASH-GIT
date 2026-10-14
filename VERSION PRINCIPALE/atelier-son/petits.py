"""LES PETITS SONS (2026-10-01, Léo : « abandonne le générateur, ramène le premier générateur de sons avec des accords de 8 s,
et rajoute quelques petits sons » — après « beaucoup de son robot, très fade »).
Quatre boucles de ~8 s dans l'esprit des boucles de 8 s, mais JOUÉES plutôt que programmées : des instruments à cordes pincées
(Karplus-Strong : kalimba, guitare, basse slappée) plutôt que des ondes nues, et chaque note est HUMANISÉE (quelques ms d'avance ou de
retard, une force qui varie) — c'est ce qui manquait aux sons « robot ».
Sortie : assets/audio/music/boucles/petit-*.m4a + petits-donnees.js (window.PETITS), lus par boucles.html.
Lancer : <venv>/python atelier-son/petits.py
"""
import os, sys, json, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from boucles import *  # noqa: F403
from boucles8 import rim, shaker, chorus

SORTIE_P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'audio', 'music', 'boucles')


class Main:
    """la main du musicien : chaque note tombe un peu à côté, un peu plus ou moins fort"""
    def __init__(s, graine, ms=5., force=.15): s.r = np.random.default_rng(graine); s.ms = ms; s.f = force
    def t(s, t): return max(0., t + s.r.normal(0, s.ms / 1000))
    def g(s, g): return g * (1 - s.f / 2 + s.f * s.r.random())


def kalimba(m, dur=1.4, de=None):
    x = karplus(m, dur, .9, .9965, de); n = len(x); t = np.arange(n) / SR
    x = x + .25 * np.sin(2 * np.pi * hz(m) * 2.01 * t) * np.exp(-t / .08)      # la lame qui « tinte » à l'attaque
    return filtre(x, 'high', 180) * .8


def guitare_claire(m, dur=2., de=None):
    x = karplus(m, dur, .55, .9975, de)
    return filtre(filtre(x, 'high', 100), 'low', 5200) * .8


def basse_slap(m, dur=.35, de=None, pop=False):
    x = karplus(m, dur + .2, .95 if pop else .7, .992, de)[:int(dur * SR)]
    x = np.tanh(x * (4 if pop else 2.5)) * env(len(x), .001, .12, .45, .04, dur * .8)
    return filtre(x, 'low', 3800 if pop else 1600)


def rhodes(m, dur=1.2):
    return plus(fm(m, dur, 1, 1.6, .25, .9), .18 * fm(m + 12, dur * .5, 14, 1, .04, .25))


def craquement(n, de, dens=6):
    x = np.zeros(n); r = np.random.default_rng(7)
    for i in r.integers(0, n - 200, int(n / SR * dens)): x[i:i + 60] += r.normal(0, .5, 60) * np.exp(-np.arange(60) / 12)
    return filtre(x, 'high', 1500) * .3


# ------------------------------------------------------------------------------------------------ 1. KALIMBA SOLEIL
def p_kalimba():
    """KALIMBA SOLEIL — lo-fi chaloupé : kalimba en pentatonique de la, grosse caisse ronde, rim swingué, craquements de vinyle."""
    M = Morceau(90, mesures=3, graine=301); de = M.de; h = Main(1, 7)
    SW = .28
    M.patron('bat', 'x.........x.....', lambda: kick(de, 110, 44, .35, .2, 1.1), .9)
    M.patron('bat', '....x.......x...', lambda: rim(de), .5, .2, SW)
    M.patron('bat', '..o...o.o.o...o.', lambda: shaker(de), .35, -.35, SW)
    k = M.piste('kal'); b = M.piste('basse')
    motif = [(0, 69), (2, 72), (3, 76), (6, 74), (8, 72), (10, 69), (11, 67), (14, 64)]
    var = {1: [(0, 72), (3, 76), (4, 79), (6, 76), (8, 74), (11, 72), (12, 69)], 2: [(0, 69), (2, 76), (5, 74), (8, 72), (9, 69), (12, 67), (14, 69)]}
    for m in range(3):
        for p, n in var.get(m, motif):
            k.pose(h.t(M.t(m, p, SW)), kalimba(n, 1.3, de), h.g(.5), .25 if n > 71 else -.2)
        for p, n in ((0, 45), (7, 45), (10, 52)):
            nn = int(.7 * SR); b.pose(h.t(M.t(m, p, SW)), sinus(hz(n), nn) * env(nn, .01, .5, .3), h.g(.5))
    L, R = fin(M, {'bat': 1, 'kal': 1, 'basse': .9}, maitre_lp=9000)
    c = craquement(len(L), de); return M, (L + c, R + np.roll(c, 900))


# ------------------------------------------------------------------------------------------------ 2. GUITARE DE NUIT
def p_guitare():
    """GUITARE DE NUIT — une guitare claire en arpèges (la m9 · fa maj7 · do · sol6), claquements de doigts, sous-basse : la ville
    à 3 h du matin, la caisse qui glisse sans bruit."""
    M = Morceau(120, mesures=4, graine=302); de = M.de; h = Main(2, 6)
    acc = [[45, 52, 55, 59, 60, 64], [41, 48, 52, 55, 57, 64], [48, 52, 55, 60, 64, 67], [43, 50, 55, 59, 64, 67]]
    ordre = [0, 3, 2, 4, 1, 5, 3, 4]
    g = M.piste('gtr'); b = M.piste('basse'); bat = M.piste('bat')
    for m in range(4):
        for i in range(8):
            n = acc[m][ordre[i]]
            g.pose(h.t(M.t(m, i * 2)), guitare_claire(n + 12 if ordre[i] else n, 2.2, de), h.g(.45), -.35 + .1 * ordre[i])
        nn = int(M.temps * 3.8 * SR); b.pose(M.t(m), sinus(hz(acc[m][0] - 12), nn) * env(nn, .02, 9, 1, .2, M.temps * 3.4), .55)
        for p in (4, 12):
            nn = int(.12 * SR); cl = passe_bande(de.bruit(nn), 1400, 3200)   # le claquement de doigts
            bat.pose(h.t(M.t(m, p)), cl * np.exp(-np.arange(nn) / SR / .025), h.g(.6), .3)
        bat.pose(M.t(m), kick(de, 90, 40, .45, .05, 1.), .5)
    rL, rR = reverbe(g.L, g.R, 2.6, 5000, .03, de); g.L += rL * .35; g.R += rR * .35
    return M, fin(M, {'gtr': 1, 'basse': 1, 'bat': 1})


# ------------------------------------------------------------------------------------------------ 3. FUNK D'OR
def p_funk():
    """FUNK D'OR — basse slappée (le pouce et le « pop »), Rhodes en contretemps, charley qui swingue : la caisse en or qui frime."""
    M = Morceau(112, mesures=4, graine=303); de = M.de; h = Main(3, 5); SW = .18
    M.patron('bat', 'x.....x...x.....', lambda: kick(de, 150, 48, .3, .5, 1.3), 1.)
    M.patron('bat', '....x.......x...', lambda: caisse(de, 210, .9, .14, 2400), .75)
    M.patron('bat', 'x.xox.xox.xox.xo', lambda: charley(de, False, 9000), .2, .3, SW)
    b = M.piste('basse'); rh = M.piste('rh')
    T = 43  # sol
    slap = [(0, 0, 0), (3, 12, 1), (4, 0, 0), (6, 10, 0), (7, 12, 1), (10, 3, 0), (11, 5, 0), (14, 12, 1)]
    for m in range(4):
        tr = 5 if m == 2 else 0
        for p, o, pop in slap:
            b.pose(h.t(M.t(m, p, SW)), basse_slap(T + o + tr, .3 if pop else .4, de, pop), h.g(.6 if pop else .7))
        ch = [[67, 70, 74, 77], [67, 70, 74, 77], [72, 75, 79, 82], [69, 72, 76, 79]][m]
        for p in (2, 7, 10, 15) if m % 2 else (2, 6, 10, 13):
            for k, n in enumerate(ch): rh.pose(h.t(M.t(m, p, SW)) + k * .006, rhodes(n, .5), h.g(.11), -.2 + .13 * k)
    rL, rR = chorus(rh.L, rh.R, 12, 2.5, .5); rh.L, rh.R = rL, rR
    return M, fin(M, {'bat': 1, 'basse': 1, 'rh': 1})


# ------------------------------------------------------------------------------------------------ 4. PLUIE DE PIÈCES
def p_pieces():
    """PLUIE DE PIÈCES — la couleur de GLASSY PLUCKS (do# dorien, 150 BPM) : un arpège de verre qui ruisselle, une guitare qui répond,
    un 2-step léger. Le son de l'or qui tombe en cascade."""
    M = Morceau(150, mesures=5, graine=304); de = M.de; h = Main(4, 4)
    M.patron('bat', 'x......x..x.....', lambda: kick(de, 130, 45, .3, .3, 1.2), .85)
    M.patron('bat', '....x.......x...', lambda: rim(de), .45, -.1)
    M.patron('bat', '..x...x...x..xx.', lambda: charley(de, False, 10000), .16, .35)
    T = 61  # do#
    acc = [[0, 3, 7, 10, 14], [-2, 2, 5, 9, 12], [0, 3, 7, 10, 14], [5, 9, 12, 16, 19], [3, 7, 10, 14, 17]]
    ar = M.piste('verre'); g = M.piste('gtr'); b = M.piste('basse')
    for m in range(5):
        a = acc[m]
        for i in range(16):
            n = T + 12 + a[[0, 2, 4, 3, 1, 2, 4, 3][i % 8]]
            s = fm(n, .5, 3.5, 2.2, .08, .25); ar.pose(h.t(M.t(m, i)), s, h.g(.13 if i % 2 else .18), .5 * np.sin(i * .9))
        for p in (0, 6, 11):
            g.pose(h.t(M.t(m, p)), guitare_claire(T - 12 + a[p % 5], 1.2, de), h.g(.35), -.3)
        nn = int(M.temps * 3.7 * SR); b.pose(M.t(m), sinus(hz(T - 24 + a[0]), nn) * env(nn, .01, 9, 1, .15, M.temps * 3.3), .5)
    eL, eR = echo(ar.L, ar.R, M.temps * .75, .35); ar.L += eL * .4; ar.R += eR * .4
    rL, rR = reverbe(ar.L + g.L, ar.R + g.R, 2.2, 7000, .02, de); ar.L += rL * .3; ar.R += rR * .3
    return M, fin(M, {'bat': 1, 'verre': 1, 'gtr': 1, 'basse': 1})


PETITS = [
    ('petit-kalimba', p_kalimba, {'titre': 'KALIMBA SOLEIL', 'style': 'Lo-fi chaloupé', 'bpm': 90, 'cle': 'la mineur',
                                  'idee': "Une kalimba en pentatonique, une grosse caisse ronde, un rim qui swingue, des craquements de vinyle."}),
    ('petit-guitare', p_guitare, {'titre': 'GUITARE DE NUIT', 'style': 'Guitare claire', 'bpm': 120, 'cle': 'la mineur',
                                  'idee': "Une guitare claire en arpèges, des claquements de doigts, une sous-basse. La ville à 3 h du matin."}),
    ('petit-funk', p_funk, {'titre': "FUNK D'OR", 'style': 'Funk', 'bpm': 112, 'cle': 'sol mineur',
                            'idee': "Basse slappée, Rhodes en contretemps, charley qui swingue. La caisse en or qui frime."}),
    ('petit-pieces', p_pieces, {'titre': 'PLUIE DE PIÈCES', 'style': 'Verre et guitare', 'bpm': 150, 'cle': 'do# dorien',
                                'idee': "La couleur de Glassy Plucks : un arpège de verre qui ruisselle, une guitare qui répond, un 2-step léger."}),
]

if __name__ == '__main__':
    filtre_id = sys.argv[1] if len(sys.argv) > 1 else ''
    out = []
    for pid, fn, info in PETITS:
        f = 'assets/audio/music/boucles/' + pid + '.m4a'
        if not filtre_id or filtre_id in pid:
            M, (L, R) = fn(); wav = os.path.join(SORTIE_P, pid + '.wav'); ecrit_wav(wav, L, R)
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(SORTIE_P, pid + '.m4a')], check=True)
            os.remove(wav); print('  %-14s %.2f s' % (pid, len(L) / SR), flush=True)
            dur = round(len(L) / SR, 5)
        else:
            dur = None
        out.append(dict(info, id=pid, f=f, dur=dur))
    anciens = {}
    fd = os.path.join(SORTIE_P, 'petits-donnees.js')
    if os.path.exists(fd):
        try: anciens = {d['id']: d for d in json.loads(open(fd).read().split('=', 1)[1].rstrip().rstrip(';'))}
        except Exception: pass
    for d in out:
        if d['dur'] is None and d['id'] in anciens: d['dur'] = anciens[d['id']]['dur']
    open(fd, 'w').write('window.PETITS=' + json.dumps(out, ensure_ascii=False) + ';\n')
    print('ok →', fd)
