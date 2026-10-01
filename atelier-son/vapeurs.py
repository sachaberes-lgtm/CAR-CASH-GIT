"""LES VAPEURS (2026-10-01, Léo : « trois versions de VAPEUR pour la map NUAGES — VAPEUR original un peu plus élaboré, VAPEUR ORAGE… »
puis « une VAPEUR version LOBBY : j'aime beaucoup comment elle est structurée, sa différence, c'est beau »).
Ce qu'on garde de VAPEUR (lobby-vapeur, boucles8.py) : les accords de 7e majeure FONDUS (Mi♭maj9 · La♭maj9 · Fam9 · Si♭7sus), le chorus,
la bande qui pleure (wobble), la batterie lointaine, une mélodie RARE en triangle qui laisse respirer, la grande réverbe.
Ce qui change : 8 mesures au lieu de 4 — la 2e moitié RÉPOND à la 1re (la mélodie continue, une couche entre) : c'est ça, la « différence ».
  · VAPEUR · SALON (lobby)   : plus lente, Rhodes qui égrène, balais, vinyle — on attend dans le fauteuil.
  · VAPEUR (nuages)          : l'originale élaborée — même chanson, mais une pulsation douce qui roule, un arpège de verre en 2e moitié.
  · VAPEUR ORAGE (nuages)    : le même ciel qui se couvre — accords assombris, pluie, tonnerre au loin, caisse lourde à mi-tempo.
  · VAPEUR CIEL (nuages)     : au-dessus des nuages — un ton plus haut, plus clair, arpèges qui scintillent, mélodie à l'octave.
Sortie : assets/audio/music/boucles/vapeur-*.m4a + vapeurs-donnees.js (window.VAPEURS), lus par boucles.html.
"""
import os, sys, json, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from boucles import *  # noqa: F403
from boucles8 import M4, chorus, fx_rev, pompe_bus, kicks_de, rim, shaker, porte
from petits import Main, craquement, rhodes

SORTIE_V = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'audio', 'music', 'boucles')
ACC = [[51, 55, 58, 62, 65], [56, 60, 63, 67, 70], [53, 56, 60, 63, 67], [58, 62, 65, 68, 72]]   # Mi♭maj9 · La♭maj9 · Fam9 · Si♭7sus
# la mélodie de VAPEUR (1re moitié), et sa RÉPONSE (2e moitié) : mêmes notes pivots, la phrase se résout plus bas
MEL_A = [(0, 8, 74, 6), (1, 0, 72, 4), (1, 6, 70, 10), (2, 8, 67, 4), (2, 12, 70, 4), (3, 0, 72, 12)]
MEL_B = [(4, 4, 79, 4), (4, 8, 77, 6), (5, 0, 75, 4), (5, 6, 74, 8), (6, 8, 72, 4), (6, 12, 70, 4), (7, 0, 67, 14)]


def morceau(bpm, graine, mesures=8): M = Morceau(bpm, mesures=mesures, graine=graine); return M


def nappe_vapeur(M, de, acc, fc=1800, g=.1, mes=range(8)):
    pad = M.piste('pad')
    for m in mes:
        for n in acc[m % 4]:
            l, r = supersaw(n, M.temps * 4 + .6, 3, 6, de); e = env(len(l), .08, 9, 1, .5, M.temps * 4)
            pad.pose2(M.t(m), filtre(l * e, 'low', fc), filtre(r * e, 'low', fc), g)


def basse_vapeur(M, acc, g=.6, tr=0):
    b = M.piste('basse')
    for m in range(M.mes):
        nn = int(M.temps * 3.5 * SR); b.pose(M.t(m), sinus(hz(acc[m % 4][0] - 12 + tr), nn) * env(nn, .02, 9, 1, .1, M.temps * 3.3), g)


def melodie(M, phrases, h, g=.1, oct=0, piste='lead'):
    ld = M.piste(piste)
    for m, p, n, lg in phrases:
        if m >= M.mes: continue
        n += oct; nn = int((lg * M.dc + .4) * SR); t = np.arange(nn) / SR
        s = (tri(hz(n) * (1 + .003 * np.sin(2 * np.pi * 5 * t)), nn) + .3 * sinus(hz(n) * 2, nn)) * env(nn, .05, 9, 1, .2, lg * M.dc)
        ld.pose(h.t(M.t(m, p)), s, h.g(g), .2)


def arpege_verre(M, acc, h, mes, g=.08, oct=24, clair=3.5):
    a = M.piste('arp')
    for m in mes:
        notes = sorted(acc[m % 4])
        for i in range(16):
            if i % 2: continue
            n = notes[[0, 2, 4, 3, 1, 3, 4, 2][(i // 2) % 8]] + oct - 12
            a.pose(h.t(M.t(m, i)), fm(n, .6, clair, 2, .06, .3), h.g(g), .45 * np.sin(i + m))


def bande(M, noms):
    for k in noms:
        if k in M.bus: M.bus[k].L, M.bus[k].R = wobble(M.bus[k].L, M.bus[k].R, .004, .3)


# ------------------------------------------------------------------------------------------- LOBBY
def v_salon():
    M = morceau(100, 501); de = M.de; h = Main(11, 6); SW = .2
    M.patron('bat', 'x.......x.x.....', lambda: kick(de, 100, 42, .5, .05, 1.), .55)
    M.patron('bat', '....x.......x...', lambda: rim(de), .32, .15, SW)
    M.patron('bat', 'o.o.o.o.o.o.o.o.', lambda: shaker(de), .22, -.4, SW, mes=range(4, 8))
    nappe_vapeur(M, de, ACC, 1500, .08)
    rh = M.piste('rh')
    for m in range(8):                                   # le Rhodes égrène l'accord (en 2e moitié il le joue en contretemps)
        notes = ACC[m % 4]
        pas = (0, 3, 6, 10) if m < 4 else (2, 6, 9, 14)
        for k, p in enumerate(pas):
            rh.pose(h.t(M.t(m, p, SW)), rhodes(notes[(k + m) % 5] + 12, 1.4), h.g(.09), -.3 + .2 * k)
    basse_vapeur(M, ACC, .5)
    melodie(M, MEL_A, h, .08); melodie(M, MEL_B, h, .08)
    M.bus['pad'].L, M.bus['pad'].R = chorus(M.bus['pad'].L, M.bus['pad'].R); bande(M, ('pad', 'lead', 'rh'))
    fx_rev(M, [('pad', 1), ('lead', 1), ('rh', .7), ('bat', .2)], 3.2, .45, 4200)
    L, R = fin(M, {'bat': .8, 'pad': 1, 'rh': 1, 'basse': 1, 'lead': 1, 'fx': 1}, maitre_lp=6500)
    c = craquement(len(L), de, 9) * .8; return M, (L + c, R + np.roll(c, 700))


# ------------------------------------------------------------------------------------------- NUAGES
def v_nuages():
    M = morceau(112, 502); de = M.de; h = Main(12, 4)
    M.patron('bat', 'x...x...x...x...', lambda: kick(de, 120, 44, .4, .15, 1.1), .7, mes=range(4, 8))
    M.patron('bat', 'x.......x.x.....', lambda: kick(de, 110, 42, .5, .1, 1.), .7, mes=range(4))
    M.patron('sn', '....x.......x...', lambda: caisse(de, 170, 1., .25, 1200), .5)
    M.patron('bat', '..x...x...x...x.', lambda: charley(de, True, 7000), .12, .3)
    nappe_vapeur(M, de, ACC, 1900, .1)
    basse_vapeur(M, ACC, .6)
    melodie(M, MEL_A, h, .1); melodie(M, MEL_B, h, .1)
    arpege_verre(M, ACC, h, range(4, 8), .07)
    pompe_bus(M, ('pad', 'basse'), kicks_de(M, (0, 4, 8, 12))[16:], .35)   # la 2e moitié respire avec la grosse caisse
    M.bus['pad'].L, M.bus['pad'].R = chorus(M.bus['pad'].L, M.bus['pad'].R); bande(M, ('pad', 'lead'))
    eL, eR = echo(M.bus['arp'].L, M.bus['arp'].R, M.temps * .75, .4); M.bus['arp'].L += eL * .4; M.bus['arp'].R += eR * .4
    fx_rev(M, [('pad', 1), ('lead', 1), ('sn', 1), ('arp', .8), ('bat', .3)], 3.5, .5, 4500)
    return M, fin(M, {'bat': .85, 'sn': .8, 'pad': 1, 'basse': 1, 'lead': 1, 'arp': 1, 'fx': 1}, maitre_lp=8000)


ACC_ORAGE = [[48, 55, 58, 62, 63], [56, 60, 63, 67, 74], [53, 56, 60, 63, 67], [55, 59, 62, 65, 68]]  # Do m9 · La♭maj7♯11 · Fa m9 · Sol7♭9


def v_orage():
    M = morceau(112, 503); de = M.de; h = Main(13, 4)
    M.patron('bat', 'x.........x.....', lambda: kick(de, 90, 38, .7, .1, 1.6), .9)
    M.patron('sn', '........x.......', lambda: caisse(de, 150, 1.3, .35, 900), .9)                       # mi-tempo, lourde
    M.patron('bat', '..x...x...x...x.', lambda: charley(de, False, 6000), .1, .3, mes=range(4, 8))
    nappe_vapeur(M, de, ACC_ORAGE, 1300, .11)
    basse_vapeur(M, ACC_ORAGE, .75)
    orage_mel = [(m, p, n - (1 if n % 12 in (2, 7) else 0), lg) for m, p, n, lg in MEL_A + MEL_B]      # les notes pivots s'assombrissent
    melodie(M, orage_mel, h, .09)
    # la pluie : un bruit filtré qui respire, et deux grondements de tonnerre au loin
    fx = M.piste('pluie'); n = M.n; t = np.arange(n) / SR
    pl = filtre(filtre(de.bruit(n), 'high', 1800), 'low', 7000) * (.6 + .4 * np.sin(2 * np.pi * .07 * t)) * .05
    fx.L += pl; fx.R += np.roll(pl, 1500)
    for m0 in (2.5, 6.2):
        nn = int(3.5 * SR); tt = np.arange(nn) / SR
        gr = filtre(de.bruit(nn), 'low', 160) * np.exp(-tt / 1.1) * (1 - np.exp(-tt / .25)) * .9
        fx.pose(M.t(0) + m0 * 4 * M.temps, gr, .8, -.3)
    sn = M.bus['sn']; rL, rR = reverbe(sn.L, sn.R, 2.4, 3000, de=de); g = porte(M.n, [M.t(m, 8) for m in range(8)], .35)
    M.piste('fx').L += rL * g * .7; M.piste('fx').R += rR * g * .7
    M.bus['pad'].L, M.bus['pad'].R = chorus(M.bus['pad'].L, M.bus['pad'].R, 18, 4, .35); bande(M, ('pad', 'lead'))
    fx_rev(M, [('pad', 1), ('lead', 1.2), ('bat', .2)], 4.5, .55, 3200)
    return M, fin(M, {'bat': .9, 'sn': .9, 'pad': 1, 'basse': 1, 'lead': 1, 'pluie': 1, 'fx': 1}, maitre_lp=6000)


def v_ciel():
    M = morceau(120, 504); de = M.de; h = Main(14, 4); T = 2
    acc = [[n + T for n in a] for a in ACC]
    M.patron('bat', 'x.......x.......', lambda: kick(de, 120, 46, .35, .2, 1.), .6)
    M.patron('sn', '....x.......x...', lambda: clap(de, .25), .35)
    M.patron('bat', '..o...o...o...o.', lambda: charley(de, True, 9500), .1, .35)
    M.patron('bat', 'xoxoxoxoxoxoxoxo', lambda: shaker(de), .18, -.4, mes=range(4, 8))
    nappe_vapeur(M, de, acc, 2600, .09)
    basse_vapeur(M, acc, .5)
    melodie(M, [(m, p, n + T, lg) for m, p, n, lg in MEL_A + MEL_B], h, .09, 12)
    arpege_verre(M, acc, h, range(8), .06, 24, 4.5)
    M.bus['pad'].L, M.bus['pad'].R = chorus(M.bus['pad'].L, M.bus['pad'].R); bande(M, ('pad',))
    eL, eR = echo(M.bus['arp'].L, M.bus['arp'].R, M.temps * .75, .45); M.bus['arp'].L += eL * .5; M.bus['arp'].R += eR * .5
    fx_rev(M, [('pad', 1), ('lead', 1), ('arp', 1), ('sn', .6)], 4., .55, 8000)
    return M, fin(M, {'bat': .8, 'sn': .8, 'pad': 1, 'basse': 1, 'lead': 1, 'arp': 1, 'fx': 1}, maitre_lp=12000)


VAPEURS = [
    ('vapeur-salon', v_salon, {'titre': 'VAPEUR · SALON', 'style': 'Vaporwave lounge', 'bpm': 100, 'cle': 'mi♭ majeur', 'onglet': 'lobby',
                               'idee': "VAPEUR pour l'accueil : plus lente, un Rhodes qui égrène les accords, des balais, du vinyle. En 2e moitié la mélodie répond."}),
    ('vapeur-nuages', v_nuages, {'titre': 'VAPEUR · NUAGES', 'style': 'Vaporwave élaborée', 'bpm': 112, 'cle': 'mi♭ majeur', 'onglet': 'niv', 'niv': 'nuages',
                                 'idee': "L'originale, élaborée : mêmes accords fondus, la mélodie et sa réponse, une pulsation douce qui roule et un arpège de verre en 2e moitié."}),
    ('vapeur-orage', v_orage, {'titre': 'VAPEUR ORAGE', 'style': 'Vaporwave · orage', 'bpm': 112, 'cle': 'do mineur', 'onglet': 'niv', 'niv': 'nuages',
                               'idee': "Le même ciel qui se couvre : accords assombris, pluie, tonnerre au loin, caisse lourde à mi-tempo."}),
    ('vapeur-ciel', v_ciel, {'titre': 'VAPEUR CIEL', 'style': 'Vaporwave · ciel', 'bpm': 120, 'cle': 'fa majeur', 'onglet': 'niv', 'niv': 'nuages',
                             'idee': "Au-dessus des nuages : un ton plus haut, plus clair, des arpèges qui scintillent, la mélodie à l'octave."}),
]

if __name__ == '__main__':
    out = []
    for vid, fn, info in VAPEURS:
        M, (L, R) = fn(); wav = os.path.join(SORTIE_V, vid + '.wav'); ecrit_wav(wav, L, R)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(SORTIE_V, vid + '.m4a')], check=True)
        os.remove(wav); print('  %-15s %.2f s' % (vid, len(L) / SR), flush=True)
        out.append(dict(info, id=vid, f='assets/audio/music/boucles/' + vid + '.m4a', dur=round(len(L) / SR, 5)))
    open(os.path.join(SORTIE_V, 'vapeurs-donnees.js'), 'w').write('window.VAPEURS=' + json.dumps(out, ensure_ascii=False) + ';\n')
    print('ok')
