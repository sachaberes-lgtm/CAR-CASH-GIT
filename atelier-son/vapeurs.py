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
    # (2026-10-03, Léo : « enlève les petits bruits dérangeants de VAPEUR — le grésillement — remplace par un autre truc ») : plus de
    # craquements de vinyle ; à la place un CARILLON DE VERRE, rare et doux, qui tinte dans la gamme (mi♭ majeur pentatonique), loin derrière
    ca = M.piste('carillon'); r9 = np.random.default_rng(77); gam = [75, 77, 79, 82, 84, 87, 89, 91]
    for m in range(8):
        for p in (2, 7, 11, 14):
            if r9.random() < .35:
                n = int(gam[r9.integers(len(gam))]); ca.pose(h.t(M.t(m, p, SW)), fm(n, 2.2, 3.5, 1.4, .25, 1.), .035 + .02 * r9.random(), r9.uniform(-.7, .7))
    fx_rev(M, [('carillon', 1.4)], 3.5, .5, 7000)
    L, R = fin(M, {'bat': .8, 'pad': 1, 'rh': 1, 'basse': 1, 'lead': 1, 'carillon': 1, 'fx': 1}, maitre_lp=6500)
    return M, (L, R)


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


# ------------------------------------------------------------------------------------------- LE SALON (2026-10-03)
# Léo : « FILTRE D'OR et MÉTRO doivent être le même type de boucle que VAPEUR et ASCENSEUR DORÉ ». Le MOULE du salon : tempo posé (~105),
# accords jazzy (7e, 9e) au Rhodes, batterie douce (grosse caisse ronde, rim et balais, shaker), basse ronde, 8 mesures dont la 2e moitié
# RÉPOND à la 1re (une mélodie douce entre, la couche s'ouvre). Chacune garde SON idée.
def balai(de):
    nn = int(.18 * SR); return passe_bande(de.bruit(nn), 2500, 9000) * np.exp(-np.arange(nn) / SR / .05) * .6


# ---- (2026-10-03, Léo : « plus premium, MÉTRO et FILTRE D'OR ») : les instruments du salon CHIC
def rhodes_p(m, dur=1.2, vel=1.):
    """Rhodes « premium » : la lame (tine) plus brillante quand on joue fort, le corps, un léger désaccord entre les deux"""
    d = int(dur * SR); t = np.arange(d) / SR
    s = plus(fm(m, dur, 1, .9 + 1.4 * vel, .25, .7 + .6 * vel), .2 * vel * fm(m + 12, dur * .4, 14, 1.2, .03, .2))
    s = plus(s, .35 * fm(m, dur, 1.003, .6, .4, 1.))
    return s[:d] * (.6 + .4 * vel)


def contrebasse(m, dur, de):
    """contrebasse jouée aux doigts : la corde pincée (boisée) + la fondamentale ronde"""
    x = karplus(m, dur + .3, .3, .9975, de)[:int(dur * SR)]; nn = len(x)
    corps = sinus(hz(m), nn) * env(nn, .01, .5, .45, .08, dur * .85)
    return filtre(x * .7 + corps * .8, 'low', 1400)


def vibra(m, dur=2.):
    nn = int(dur * SR); t = np.arange(nn) / SR
    s = fm(m, dur, 4, .7, .2, 1.2)[:nn] * (1 + .25 * np.sin(2 * np.pi * 5.5 * t))   # le moteur du vibraphone
    return s


def ride(de):
    nn = int(1.2 * SR); t = np.arange(nn) / SR
    met = sum(np.sin(2 * np.pi * f * t + k) for k, f in enumerate((3120, 4410, 5230, 6870, 8130))) / 5
    return (passe_bande(de.bruit(nn), 5000, 12000) * .4 + met * .3) * np.exp(-t / .5) * (1 - np.exp(-t / .002))


def cordes(M, de, acc, mes, g=.05, fc=1300):
    c = M.piste('cordes')
    for m in mes:
        for n in acc[m % 4][1:4]:
            l, r = supersaw(n + 12, M.temps * 4 + 1., 4, 9, de); e = env(len(l), .9, 9, 1, .8, M.temps * 4)
            c.pose2(M.t(m), filtre(l * e, 'low', fc), filtre(r * e, 'low', fc), g)


def harpe(M, de, notes, m, p, h, g=.18):
    a = M.piste('harpe')
    for k, n in enumerate(notes):
        a.pose(M.t(m, p) + k * .045, filtre(karplus(n, 1.6, .7, .998, de), 'high', 300), g * (.7 + .3 * k / len(notes)), -.5 + k / len(notes))


def tremolo_stereo(M, nom, vit=4.6, prof=.35):
    if nom not in M.bus: return
    t = np.arange(M.n) / SR; o = np.sin(2 * np.pi * vit * t)
    M.bus[nom].L *= 1 + prof * o; M.bus[nom].R *= 1 - prof * o


def finition(M, pistes, lp=9000):
    """la colle : une compression douce du mélange (les crêtes arrondies, le corps tient), puis la fin habituelle"""
    for k in pistes:
        if k in M.bus: M.bus[k].L = np.tanh(M.bus[k].L * 1.2) / 1.2; M.bus[k].R = np.tanh(M.bus[k].R * 1.2) / 1.2
    return fin(M, pistes, maitre_lp=lp)


# (2026-10-03, 3e passe — Léo : « un peu trop complexe à l'oreille ; les nouveaux instruments sont cool ; crée une meilleure harmonie tout en
# simplifiant, vraiment au niveau de VAPEUR ») : LA FORME DE VAPEUR — quatre accords TENUS qui s'enchaînent en mouvement conjoint
# (I · IV · ii · V sus, comme Mi♭maj9 · La♭maj9 · Fa m9 · Si♭7sus), une basse par mesure, une mélodie RARE, une batterie lointaine.
# On garde : le Rhodes à trémolo, la contrebasse, le vibraphone, les cordes, la harpe qui ouvre la 2e moitié. On retire : l'accord haché,
# la ride, les 11e/13e, l'accord altéré de retour, la moitié des coups de batterie.
def salon_simple(M, de, h, acc, basses, mel, rh_pas, sw, filtre_dor=False, harpe_notes=None):
    rh = M.piste('rh')
    for m in range(8):
        for p, lg in rh_pas:
            v = .6 + .3 * h.r.random()
            for k, n in enumerate(acc[m % 4]):
                rh.pose(h.t(M.t(m, p, sw)) + k * .008, rhodes_p(n + 12, lg * M.dc, v), h.g(.07), -.25 + .12 * k)
    if filtre_dor:                                                    # LE FILTRE D'OR : il s'ouvre sur la 1re moitié, puis reste ouvert
        lg = int(M.lg * SR); u = np.clip(np.arange(M.n) / max(1, lg // 2), 0, 1)
        fc = 700 * (12 ** (u ** 1.2)); rh.L = balaye(rh.L, fc); rh.R = balaye(rh.R, fc)
    tremolo_stereo(M, 'rh', 4.2, .2)
    b = M.piste('basse')
    for m in range(8):
        r = basses[m % 4]
        b.pose(h.t(M.t(m, 0, sw)), contrebasse(r, 3.2 * M.temps, de), h.g(.6))
        b.pose(h.t(M.t(m, 14, sw)), contrebasse(r + 7, .45 * M.temps, de), h.g(.35))
    vb = M.piste('vibra')
    for m, p, n, lg in mel:
        vb.pose(h.t(M.t(m, p, sw)), vibra(n, lg * M.dc + 1.), h.g(.06 if m < 4 else .08), .25)
    if harpe_notes: harpe(M, de, harpe_notes, 3, 10, h, .14)
    cordes(M, de, acc, range(4, 8), .045, 1200)
    nappe_vapeur(M, de, acc, 1500, .04)
    M.bus['pad'].L, M.bus['pad'].R = chorus(M.bus['pad'].L, M.bus['pad'].R); bande(M, ('pad',))
    fx_rev(M, [('rh', .7), ('vibra', 1.2), ('cordes', 1), ('harpe', 1), ('pad', 1), ('bat', .25)], 3.2, .45, 5000)
    return finition(M, {'bat': .75, 'rh': 1, 'basse': 1, 'cordes': 1, 'vibra': 1, 'harpe': 1, 'pad': 1, 'fx': 1}, 8500)


def v_filtre_salon():
    """FILTRE D'OR · SALON — Sol m9 · Mi♭ maj9 · Do m9 · Fa7sus : le Rhodes tient l'accord (deux coups par mesure) et son filtre s'ouvre
    sur la 1re moitié ; contrebasse, vibraphone rare, la harpe ouvre la 2e moitié où entrent les cordes."""
    M = morceau(106, 505); de = M.de; h = Main(15, 5); SW = .12
    M.patron('bat', 'x.......x.......', lambda: kick(de, 95, 42, .45, .03, 1.), .5)
    M.patron('bat', '....x.......x...', lambda: rim(de), .22, .15, SW)
    M.patron('bat', '..o...o...o...o.', lambda: balai(de), .22, -.2, SW, mes=range(4, 8))
    acc = [[58, 62, 65, 69], [55, 58, 62, 65], [58, 62, 63, 67], [58, 60, 63, 67]]       # voix qui bougent d'un ton au plus
    basses = [43, 39, 36, 41]                                                              # sol · mi♭ · do · fa
    mel = [(0, 8, 86, 6), (1, 6, 82, 8), (2, 8, 82, 4), (2, 12, 79, 4), (3, 0, 84, 12),
           (4, 4, 89, 4), (4, 8, 86, 6), (5, 6, 86, 8), (6, 8, 87, 4), (6, 12, 84, 4), (7, 0, 82, 14)]
    L, R = salon_simple(M, de, h, acc, basses, mel, ((0, 7), (10, 5)), SW, True, [62, 65, 69, 74, 77, 81])
    return M, (L, R)


def v_metro_salon():
    """MÉTRO · SALON — Fa m9 · Ré♭ maj9 · Si♭ m9 · Do m7 : le rebond 2-step reste dans la batterie (douce), le Rhodes tient l'accord sur
    deux coups décalés ; contrebasse, vibraphone rare, la harpe ouvre la 2e moitié où entrent les cordes."""
    M = morceau(104, 506); de = M.de; h = Main(16, 5); sw = .2
    M.patron('bat', 'x.......x.x.....', lambda: kick(de, 95, 42, .4, .03, 1.), .48, swing=sw,
             var=lambda m: 'x.......x.x.....' if m % 2 == 0 else 'x.....x....x....')
    M.patron('bat', '....x.......x...', lambda: rim(de), .22, .15, sw)
    M.patron('bat', '..o...o...o...o.', lambda: balai(de), .2, -.25, sw, mes=range(4, 8))
    acc = [[56, 60, 63, 67], [56, 60, 63, 65], [56, 60, 61, 65], [58, 60, 63, 67]]
    basses = [41, 37, 34, 36]                                                              # fa · ré♭ · si♭ · do
    mel = [(0, 8, 84, 6), (1, 6, 84, 8), (2, 8, 80, 4), (2, 12, 84, 4), (3, 0, 82, 12),
           (4, 4, 91, 4), (4, 8, 87, 6), (5, 6, 84, 8), (6, 8, 85, 4), (6, 12, 84, 4), (7, 0, 79, 14)]
    L, R = salon_simple(M, de, h, acc, basses, mel, ((0, 6), (7, 8)), sw, False, [60, 63, 67, 72, 75, 79])
    return M, (L, R)

VAPEURS = [
    ('vapeur-salon', v_salon, {'titre': 'VAPEUR · SALON', 'style': 'Vaporwave lounge', 'bpm': 100, 'cle': 'mi♭ majeur', 'onglet': 'lobby',
                               'idee': "VAPEUR pour l'accueil : plus lente, un Rhodes qui égrène les accords, des balais, du vinyle. En 2e moitié la mélodie répond."}),
    ('vapeur-nuages', v_nuages, {'titre': 'VAPEUR · NUAGES', 'style': 'Vaporwave élaborée', 'bpm': 112, 'cle': 'mi♭ majeur', 'onglet': 'niv', 'niv': 'nuages',
                                 'idee': "L'originale, élaborée : mêmes accords fondus, la mélodie et sa réponse, une pulsation douce qui roule et un arpège de verre en 2e moitié."}),
    ('vapeur-orage', v_orage, {'titre': 'VAPEUR ORAGE', 'style': 'Vaporwave · orage', 'bpm': 112, 'cle': 'do mineur', 'onglet': 'niv', 'niv': 'nuages',
                               'idee': "Le même ciel qui se couvre : accords assombris, pluie, tonnerre au loin, caisse lourde à mi-tempo."}),
    ('vapeur-ciel', v_ciel, {'titre': 'VAPEUR CIEL', 'style': 'Vaporwave · ciel', 'bpm': 120, 'cle': 'fa majeur', 'onglet': 'niv', 'niv': 'nuages',
                             'idee': "Au-dessus des nuages : un ton plus haut, plus clair, des arpèges qui scintillent, la mélodie à l'octave."}),
    ('filtre-salon', v_filtre_salon, {'titre': "FILTRE D'OR · SALON", 'style': 'Lounge · filtre', 'bpm': 106, 'cle': 'sol mineur', 'onglet': 'lobby',
                                      'idee': "Dans la forme de VAPEUR : quatre accords tenus au Rhodes à trémolo, le filtre d'or qui s'ouvre, contrebasse, vibraphone rare ; la harpe ouvre la 2e moitié."}),
    ('metro-salon', v_metro_salon, {'titre': 'MÉTRO · SALON', 'style': 'Lounge · 2-step', 'bpm': 104, 'cle': 'fa mineur', 'onglet': 'lobby',
                                    'idee': "Dans la forme de VAPEUR : quatre accords tenus au Rhodes à trémolo, le rebond 2-step dans la batterie douce, contrebasse, vibraphone rare ; la harpe ouvre la 2e moitié."}),
]

if __name__ == '__main__':
    out = []
    for vid, fn, info in VAPEURS:
        M, (L, R) = fn(); wav = os.path.join(SORTIE_V, vid + '.wav'); ecrit_wav(wav, L, R)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(SORTIE_V, vid + '.m4a')], check=True)
        os.remove(wav); print('  %-15s %.2f s' % (vid, len(L) / SR), flush=True)
        out.append(dict(info, id=vid, f='assets/audio/music/boucles/' + vid + '.m4a?v=%d' % int(__import__('time').time()), dur=round(len(L) / SR, 5)))  # ?v= : le navigateur reprend le son refait
    open(os.path.join(SORTIE_V, 'vapeurs-donnees.js'), 'w').write('window.VAPEURS=' + json.dumps(out, ensure_ascii=False) + ';\n')
    print('ok')
