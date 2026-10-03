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
    # (2026-10-03, Léo : « pourquoi tu as changé VAPEUR · SALON, reviens sur avant ») : le carillon est retiré — la boucle d'avant,
    # à l'identique, SANS le grésillement (les craquements de vinyle restent retirés : c'était sa demande précédente).
    L, R = fin(M, {'bat': .8, 'pad': 1, 'rh': 1, 'basse': 1, 'lead': 1, 'fx': 1}, maitre_lp=6500)
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


# (2026-10-03, 4e passe — Léo : « refais-les complètement ; je ne parlais pas du STYLE, seulement de la DURÉE des boucles — mais toutes les
# musiques doivent suivre UNE ambiance ») : FILTRE D'OR et MÉTRO retrouvent LEUR style (house filtrée, 2-step garage) mais prennent la
# DURÉE de VAPEUR · SALON — 8 mesures dont la 2e moitié répond à la 1re — et l'AMBIANCE du lobby : la même bande qui pleure (wobble),
# la même grande réverbe douce, les aigus adoucis (passe-bas maître ~7 kHz), la même sonie.
def ambiance(M, harmoniques, rev=(3., .4, 4500), lp=7200, gains=None):
    bande(M, harmoniques)
    fx_rev(M, [(k, 1) for k in harmoniques] + [('bat', .15)], rev[0], rev[1], rev[2])
    return fin(M, gains, maitre_lp=lp)


def v_filtre_or():
    """FILTRE D'OR — house filtrée à la française, 8 mesures : l'accord de funk haché en croches, son filtre s'ouvre sur les 4 premières
    mesures ; la basse saute l'octave, quatre temps, ça pompe. La 2e moitié : filtre ouvert, charley ouvert, une nappe et un petit
    gimmick au synthé doux répondent."""
    M = morceau(124, 507); de = M.de; h = Main(17, 3); T = 55   # sol dorien
    M.patron('bat', 'x...x...x...x...', lambda: kick(de, 140, 46, .32, .3, 1.4), .85)
    M.patron('bat', '....x.......x...', lambda: clap(de, .2), .4)
    M.patron('bat', '..x...x...x...x.', lambda: charley(de, True, 6500), .14, .25, mes=range(4, 8))
    M.patron('bat', 'xxxxxxxxxxxxxxxx', lambda: shaker(de), .22, -.35)
    ch = M.piste('accord'); b = M.piste('basse')
    acc = [[67, 70, 74, 77], [65, 69, 72, 76], [67, 70, 74, 77], [70, 74, 77, 81]]     # Sol m7 · Fa maj7 · Sol m7 · Si♭ maj7 (celui d'origine)
    for m in range(8):
        for p in (0, 2, 3, 6, 8, 10, 11, 14):
            for n in acc[m % 4]:
                l, r = supersaw(n, M.dc * 1.3, 3, 10, de); e = env(len(l), .002, .07, .2)
                ch.pose2(h.t(M.t(m, p)), l * e, r * e, h.g(.065))
        r = deg(T - 12, 'dor', [0, 6, 0, 2][m % 4])
        for p, o in ((0, 0), (3, 12), (6, 0), (7, 12), (10, 0), (12, 10), (14, 12)):
            nn = int(M.dc * .9 * SR); s = np.tanh((scie(hz(r + o), nn) * .5 + sinus(hz(r + o), nn)) * env(nn, .002, .09, .3) * 2)
            b.pose(h.t(M.t(m, p)), filtre(s, 'low', 1100), .45)
    lg = int(M.lg * SR); u = np.clip(np.arange(M.n) / max(1, lg // 2), 0, 1)
    fc = 380 * (18 ** (u ** 1.4)); ch.L = balaye(ch.L, fc); ch.R = balaye(ch.R, fc)          # LE FILTRE D'OR : fermé → ouvert en 4 mesures
    nappe_vapeur(M, de, [[55, 58, 62, 65, 69], [53, 57, 60, 64, 67], [55, 58, 62, 65, 69], [58, 62, 65, 69, 72]], 1600, .05, range(4, 8))
    melodie(M, [(4, 2, 74, 2), (4, 6, 77, 2), (4, 10, 74, 4), (5, 2, 72, 2), (5, 6, 76, 6), (6, 2, 74, 2), (6, 6, 77, 2), (6, 10, 79, 4), (7, 2, 77, 4), (7, 8, 74, 6)], h, .07)
    pompe_bus(M, ('accord', 'basse', 'pad'), kicks_de(M), .55)
    M.bus['accord'].L, M.bus['accord'].R = chorus(M.bus['accord'].L, M.bus['accord'].R, 12, 2, .5)
    return M, ambiance(M, ('accord', 'pad', 'lead'), (2.8, .4, 4500), 6200, {'bat': .9, 'accord': 1.2, 'basse': 1, 'pad': 1, 'lead': 1, 'fx': 1})


def v_metro():
    """MÉTRO — UK garage en 2-step, 8 mesures : la grosse caisse qui saute, le charley qui boite, l'orgue en accords courts, la sous-basse
    ronde. La 2e moitié : le charley se dédouble, une nappe sombre s'étend et une petite mélodie d'orgue répond."""
    M = morceau(132, 508); de = M.de; h = Main(18, 3); T = 53; sw = .22   # fa mineur
    M.patron('bat', 'x.......x.x.....', lambda: kick(de, 145, 46, .3, .3, 1.4), .85, swing=sw,
             var=lambda m: 'x.......x.x.....' if m % 2 == 0 else 'x.....x....x....')
    M.patron('bat', '....x.......x...', lambda: caisse(de, 200, 1., .13, 2200), .5, swing=sw)
    M.patron('bat', '..x.x.xx..x.x.xx', lambda: charley(de, False, 7000), .09, .3, swing=sw,
             var=lambda m: '..x.x.xx..x.x.xx' if m < 4 else '.xx.xxxx.xx.x.xx')
    org = M.piste('orgue'); b = M.piste('basse')
    for m in range(8):
        d = [0, 5, 3, 4][m % 4]
        for p in (0, 3, 7, 10):
            for k, n in enumerate(accord(T + 12, 'harm' if d == 4 else 'min', d)):
                s9 = plus(fm(n, .35, 1, 1.4, .05, .12), .4 * sinus(hz(n) * 2, int(.2 * SR)) * np.exp(-np.arange(int(.2 * SR)) / SR / .06))
                org.pose(h.t(M.t(m, p, sw)), s9, h.g(.075), -.3 + .2 * k)
        r = deg(T - 12, 'min', d)
        for p, lg9 in ((0, 3), (6, 2), (11, 4)):
            nn = int(lg9 * M.dc * SR); b.pose(M.t(m, p, sw), np.tanh(sinus(hz(r), nn) * env(nn, .005, 9, 1, .04, lg9 * M.dc - .04) * 1.5), .6)
    nappe_vapeur(M, de, [[53, 56, 60, 63, 67], [49, 53, 56, 60, 63], [58, 61, 65, 68, 72], [55, 59, 62, 65, 68]], 1300, .05, range(4, 8))
    ld = M.piste('lead')
    for m, p, n in ((4, 3, 75), (4, 7, 72), (5, 3, 77), (5, 10, 75), (6, 3, 72), (6, 7, 68), (7, 3, 71), (7, 10, 72)):
        ld.pose(h.t(M.t(m, p, sw)), plus(fm(n + 12, .5, 1, 1.2, .05, .2), .3 * fm(n + 24, .3, 1, .6, .03, .1)), h.g(.07), .25)
    return M, ambiance(M, ('orgue', 'pad', 'lead'), (2.8, .4, 4500), 6000, {'bat': .9, 'orgue': 1, 'basse': 1, 'pad': 1, 'lead': 1, 'fx': 1})

VAPEURS = [
    ('vapeur-salon', v_salon, {'titre': 'VAPEUR · SALON', 'style': 'Vaporwave lounge', 'bpm': 100, 'cle': 'mi♭ majeur', 'onglet': 'lobby',
                               'idee': "VAPEUR pour l'accueil : plus lente, un Rhodes qui égrène les accords, des balais, du vinyle. En 2e moitié la mélodie répond."}),
    ('vapeur-nuages', v_nuages, {'titre': 'VAPEUR · NUAGES', 'style': 'Vaporwave élaborée', 'bpm': 112, 'cle': 'mi♭ majeur', 'onglet': 'niv', 'niv': 'nuages',
                                 'idee': "L'originale, élaborée : mêmes accords fondus, la mélodie et sa réponse, une pulsation douce qui roule et un arpège de verre en 2e moitié."}),
    ('vapeur-orage', v_orage, {'titre': 'VAPEUR ORAGE', 'style': 'Vaporwave · orage', 'bpm': 112, 'cle': 'do mineur', 'onglet': 'niv', 'niv': 'nuages',
                               'idee': "Le même ciel qui se couvre : accords assombris, pluie, tonnerre au loin, caisse lourde à mi-tempo."}),
    ('vapeur-ciel', v_ciel, {'titre': 'VAPEUR CIEL', 'style': 'Vaporwave · ciel', 'bpm': 120, 'cle': 'fa majeur', 'onglet': 'niv', 'niv': 'nuages',
                             'idee': "Au-dessus des nuages : un ton plus haut, plus clair, des arpèges qui scintillent, la mélodie à l'octave."}),
    # (2026-10-03) FILTRE D'OR et MÉTRO ABANDONNÉS par Léo — v_filtre_or / v_metro restent écrits ci-dessus, hors de la liste.
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
