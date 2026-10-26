"""QUATRE BOUCLES INSPI (2026-10-04, Léo : « rajoute-moi quelques sons boucle inspi ; sois redoutable, créatif, cohérent et original »).
Dans les règles apprises (CAHIER-MUSIQUE.md) : 8 mesures dont la 2e moitié RÉPOND à la 1re ; la densité de VAPEUR (des accords tenus qui
bougent peu, une basse par temps fort, une mélodie qu'on retient et qui laisse respirer) ; le registre GRAVE à MÉDIUM (jamais l'aigu
« enfantin », jamais de carré nu) ; UN instrument signature par boucle ; l'ambiance du lobby (la bande qui pleure sur l'harmonie, une
grande réverbe douce, les aigus adoucis, −15 dB RMS). Chaque note jouée « à la main » (Main).
  COFFRE-FORT   — le casse, en noir et blanc : jazz de film, contrebasse qui marche, balais, vibraphone, trompette bouchée ; le cadran du coffre.
  CHROME LIQUIDE — city pop japonaise des années 80 sur la voie express : basse slappée, Rhodes en contretemps, cloches de verre.
  VOL DE NUIT    — la cabine, à 10 000 m : synthwave lente, la nappe, l'arpège de verre du boost, la caisse claire dans une cathédrale.
  POUSSIÈRE D'OR — trap-soul au ralenti : la 808 qui glisse, la guitare claire en arpège, le Rhodes de VAPEUR, des charleys en triolets.
Sortie : assets/audio/music/boucles/inspi-*.m4a + inspi-donnees.js (window.INSPI), lus par boucles.html (onglet Lobby, « INSPI »).
"""
import os, sys, json, subprocess, time
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from boucles import *  # noqa: F403
from boucles8 import chorus, fx_rev, pompe_bus, kicks_de, rim, shaker, crash
from petits import Main, basse_slap, guitare_claire
from vapeurs import bande, rhodes_p, contrebasse, vibra, ride, balai, cordes

SORTIE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'audio', 'music', 'boucles')


def ambiance(M, harm, gains, lp=7200, rev=(2.8, .38, 4800)):
    bande(M, [k for k in harm if k in M.bus])
    fx_rev(M, [(k, 1) for k in harm] + [('bat', .15), ('sn', .3)], rev[0], rev[1], rev[2])
    return fin(M, gains, maitre_lp=lp)


def accord(piste, notes, t, son, g, h, ecart=.012, pan=(-.25, .25)):
    for k, n in enumerate(notes):
        piste.pose(h.t(t) + k * ecart, son(n), h.g(g), pan[0] + (pan[1] - pan[0]) * k / max(1, len(notes) - 1))


def trompette(n, dur, prec=None):
    """la TROMPETTE BOUCHÉE (sourdine harmon) : une scie filtrée par deux formants nasillards, un souffle à l'attaque, le vibrato qui
    arrive tard, la note qui GLISSE un peu depuis la précédente"""
    nn = int((dur + .1) * SR); t = np.arange(nn) / SR
    f0 = hz(prec) if prec else hz(n) * .97; f = hz(n) + (f0 - hz(n)) * np.exp(-t / .04)
    f = f * (1 + .007 * np.sin(2 * np.pi * 5.6 * t) * np.clip((t - .25) / .35, 0, 1))
    s = scie(f, nn); s = passe_bande(s, 900, 1500) * 1.3 + passe_bande(s, 2200, 3200) * .6 + .25 * filtre(s, 'low', 600)
    return np.tanh(s * env(nn, .03, .4, .8, .08, dur) * 1.4) * .7


def cloche_verre(n, dur=.9, clair=3.2):
    return fm(n, dur, clair, 1.6, .05, .35)


def basse_808(n, dur, glisse_de=None):
    """la 808 : une sinusoïde grave, le clic de la frappe, la saturation douce, et la GLISSADE depuis la note d'avant"""
    nn = int((dur + .05) * SR); t = np.arange(nn) / SR
    f = hz(n) if glisse_de is None else hz(n) + (hz(glisse_de) - hz(n)) * np.exp(-t / .07)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(nn, .003, 9, 1, .06, dur) * (.85 + .15 * np.exp(-t / .05))
    return np.tanh(s * 2.) * .75


def pose_melodie(piste, M, h, phrase, son, g, pan=0.):
    prec = None
    for m, p, n, lg in phrase:
        if m >= M.mes: continue
        piste.pose(h.t(M.t(m, p)), son(n, lg * M.dc, prec), h.g(g), pan); prec = n


# ================================================================================ 1. COFFRE-FORT
def i_coffre():
    M = Morceau(84, mesures=8, graine=901); de = M.de; h = Main(91, 6); sw = .28
    acc = [[50, 57, 60, 64, 65], [46, 53, 57, 60, 62], [43, 50, 53, 57, 58], [45, 52, 55, 59, 61]]   # Ré m9 · Si♭maj9 · Sol m9 · La7(♭9)sus
    bat = M.piste('bat'); vb = M.piste('vibra'); b = M.piste('basse'); pi = M.piste('piano'); ld = M.piste('lead')
    for m in range(8):
        q = acc[m % 4]
        for p in range(0, 16, 4): bat.pose(h.t(M.t(m, p, sw)), balai(de), h.g(.3), -.2)               # les BALAIS qui tournent
        for p in (2, 6, 10, 14): bat.pose(h.t(M.t(m, p, sw)), balai(de), h.g(.16), .2)
        if m >= 4:                                                                                    # 2e moitié : la RIDE s'invite
            for p in (0, 4, 7, 8, 12, 15): bat.pose(h.t(M.t(m, p, sw)), ride(de), h.g(.1 if p % 4 else .14), .35)
        for k, (p, o) in enumerate(((0, 0), (4, 7), (8, 12), (12, 10 if m % 4 != 3 else 11))):         # la CONTREBASSE marche
            b.pose(h.t(M.t(m, p, sw)), contrebasse(q[0] - 12 + o, M.temps * .95, de), h.g(.55))
        accord(vb, q[1:], M.t(m, 0, sw), lambda n: vibra(n, 2.4), .07, h)                              # le VIBRAPHONE pose l'accord
        if m % 2: accord(vb, q[2:], M.t(m, 10, sw), lambda n: vibra(n, 1.2), .05, h)
        for p in (3, 11): bat.pose(h.t(M.t(m, p, sw)), filtre(rim(de), 'high', 2500) * .6, h.g(.12), .5)  # le CADRAN du coffre : un cliquetis sec
    # la TROMPETTE BOUCHÉE : une question (mesures 1-3), la réponse un ton plus haut et plus longue (5-7)
    phrase = [(0, 4, 62, 2), (0, 6, 65, 2), (0, 8, 69, 6), (1, 2, 67, 2), (1, 4, 65, 4), (1, 8, 64, 8), (2, 6, 62, 2), (2, 8, 60, 2), (2, 10, 62, 10),
              (4, 4, 65, 2), (4, 6, 69, 2), (4, 8, 72, 6), (5, 2, 70, 2), (5, 4, 69, 4), (5, 8, 67, 4), (5, 12, 69, 4), (6, 0, 64, 4), (6, 4, 65, 4), (6, 8, 62, 12)]
    pose_melodie(ld, M, h, phrase, trompette, .2, .1)
    for m in (3, 7):                                                                                   # le PIANO répond, deux accords secs
        for p in (0, 3): accord(pi, acc[m % 4][1:], M.t(m, p, sw), lambda n: rhodes_p(n + 12, .5, .8), .045, h, .006)
    eL, eR = echo(ld.L, ld.R, M.temps * .75, .3); ld.L += eL * .25; ld.R += eR * .25
    return M, ambiance(M, ('vibra', 'lead', 'piano'), {'bat': .85, 'basse': 1, 'vibra': 1, 'lead': 1, 'piano': 1, 'fx': 1}, 7000)


# ================================================================================ 2. CHROME LIQUIDE
def i_chrome():
    M = Morceau(108, mesures=8, graine=902); de = M.de; h = Main(92, 4); sw = .12
    acc = [[53, 57, 60, 64, 67], [50, 53, 57, 60, 64], [46, 50, 53, 57, 60], [48, 52, 55, 58, 62]]   # Famaj9 · Ré m9 · Si♭maj9 · Do9
    bat = M.piste('bat'); sn = M.piste('sn'); b = M.piste('basse'); rh = M.piste('rh'); cl = M.piste('cloche')
    for m in range(8):
        q = acc[m % 4]
        for p in (0, 6, 10) if m % 2 == 0 else (0, 6, 8, 13): bat.pose(h.t(M.t(m, p)), kick(de, 115, 46, .32, .35, 1.3), h.g(.8))
        for p in (4, 12):
            sn.pose(h.t(M.t(m, p)), clap(de, .14), h.g(.45), .05); sn.pose(M.t(m, p), caisse(de, 210, .7, .1, 2400), .18, -.05)   # clap + une caisse claire claire
        for p in range(0, 16, 2): bat.pose(h.t(M.t(m, p, sw)), shaker(de), h.g(.15 if p % 4 else .2), -.35)
        for k, (p, o, pop) in enumerate(((0, 0, 0), (3, 12, 1), (6, 0, 0), (8, 7, 0), (10, 12, 1), (11, 10, 0), (14, 0, 0))):  # la BASSE SLAPPÉE
            b.pose(h.t(M.t(m, p, sw)), basse_slap(q[0] - 12 + o, .3 if not pop else .18, de, bool(pop)), h.g(.5 if not pop else .38))
        for p in (2, 6, 10, 14) if m < 4 else (2, 5, 10, 13):                                         # le RHODES en contretemps (2e moitié : syncopé)
            accord(rh, q[1:], M.t(m, p, sw), lambda n: rhodes_p(n + 12, .35, .75), .05, h, .007)
    # les CLOCHES DE VERRE : un motif de 5 notes qui revient, la 2e moitié le monte d'une quarte et le prolonge
    mot = [(0, 72, 3), (3, 74, 3), (6, 77, 2), (8, 76, 4), (12, 72, 4)]
    for m in range(8):
        if m % 2: continue
        tr = 5 if m >= 4 else 0
        for p, n, lg in mot: cl.pose(h.t(M.t(m, p, sw)), cloche_verre(n + tr - 12, lg * M.dc + .6), h.g(.12), .25)
    cordes(M, de, acc, range(4, 8), .045, 1800)                                                          # 2e moitié : les cordes gonflent
    pompe_bus(M, ('rh', 'cordes'), kicks_de(M, (0, 8)), .3, .14)
    eL, eR = echo(cl.L, cl.R, M.temps * .75, .35); cl.L += eR * .3; cl.R += eL * .3
    return M, ambiance(M, ('rh', 'cloche', 'cordes'), {'bat': .85, 'sn': .85, 'basse': 1, 'rh': 1, 'cloche': 1, 'cordes': 1, 'fx': 1}, 8000)


# ================================================================================ 3. VOL DE NUIT
def i_vol():
    M = Morceau(92, mesures=8, graine=903); de = M.de; h = Main(93, 3)
    acc = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62], [40, 47, 52, 55, 59]]   # La m · Fa maj7 · Sol · Mi m7
    pd = M.piste('pad'); b = M.piste('basse'); bat = M.piste('bat'); sn = M.piste('sn'); ar = M.piste('verre'); ld = M.piste('lead')
    for m in range(8):
        q = acc[m % 4]; L = 0; R = 0
        for n in q[1:]:
            l, r = supersaw(n + 12, M.temps * 4 + .8, 4, 10, de); L = L + l; R = R + r
        e = env(len(L), .5, 9, 1, .8, M.temps * 4); fc = 1200 if m < 4 else 1900
        pd.pose2(M.t(m), filtre(L * e, 'low', fc), filtre(R * e, 'low', fc), .07)
        for p in range(0, 16, 2): b.pose(M.t(m, p), filtre(scie(hz(q[0] - 12), int(M.dc * 1.8 * SR)) * env(int(M.dc * 1.8 * SR), .004, .12, .3), 'low', 700), h.g(.4))
        for p in (0, 8) if m < 4 else (0, 7, 8, 11): bat.pose(h.t(M.t(m, p)), kick(de, 100, 42, .45, .2, 1.2), h.g(.75))
        for p in (4, 12): sn.pose(h.t(M.t(m, p)), caisse(de, 190, 1., .14, 1800), h.g(.42), .0)
        if m >= 4:
            for p in range(0, 16, 2): bat.pose(h.t(M.t(m, p)), charley(de, False, 9000), h.g(.07), .3)
        notes = sorted(q[1:]) + [q[1] + 12]                                                            # l'ARPÈGE DE VERRE du boost, en doubles croches
        for i in range(16):
            n9 = notes[[0, 1, 2, 3, 4, 3, 2, 1][i % 8]] + 12
            ar.pose(h.t(M.t(m, i)), cloche_verre(n9, .55, 4), h.g(.05 if i % 4 else .07), .55 if i % 2 else -.55)
    sl = sn.L.copy(); sr = sn.R.copy(); rL, rR = reverbe(sl, sr, 3.6, 5000, .02, de); sn.L += rL * .9; sn.R += rR * .9   # la caisse claire dans une CATHÉDRALE
    # la MÉLODIE grave au synthé (triangle chaud), qui ne commence qu'à la 3e mesure : la nuit d'abord, puis la voix
    phrase = [(2, 0, 64, 6), (2, 6, 67, 2), (2, 8, 69, 8), (3, 0, 67, 8), (3, 8, 64, 8),
              (6, 0, 72, 6), (6, 6, 71, 2), (6, 8, 69, 8), (7, 0, 71, 4), (7, 4, 67, 4), (7, 8, 69, 8)]
    pose_melodie(ld, M, h, phrase, lambda n, d, pr: (tri(hz(n), int((d + .3) * SR)) + .25 * sinus(hz(n) * 2, int((d + .3) * SR))) * env(int((d + .3) * SR), .06, 9, 1, .25, d), .14)
    pompe_bus(M, ('pad', 'basse'), kicks_de(M, (0, 8)), .45, .2)
    eL, eR = echo(ar.L, ar.R, M.temps * .75, .4); ar.L += eR * .35; ar.R += eL * .35
    M.bus['pad'].L, M.bus['pad'].R = chorus(M.bus['pad'].L, M.bus['pad'].R)
    return M, ambiance(M, ('pad', 'verre', 'lead'), {'pad': 1, 'basse': 1, 'bat': .85, 'sn': .8, 'verre': 1, 'lead': 1, 'fx': 1}, 7600, (3.4, .45, 4500))


# ================================================================================ 4. POUSSIÈRE D'OR
def i_poussiere():
    M = Morceau(70, mesures=8, graine=904); de = M.de; h = Main(94, 5)
    acc = [[51, 55, 58, 62, 65], [48, 55, 58, 63, 67], [44, 51, 55, 60, 63], [46, 53, 56, 60, 62]]   # Mi♭maj9 · Do m9 · La♭maj7 · Si♭7sus (la couleur de VAPEUR)
    bat = M.piste('bat'); sn = M.piste('sn'); b = M.piste('808'); gt = M.piste('gtr'); rh = M.piste('rh'); hh = M.piste('hh')
    prec = None
    for m in range(8):
        q = acc[m % 4]
        for p in ((0, 10) if m % 2 == 0 else (0, 7, 10)): bat.pose(h.t(M.t(m, p)), kick(de, 90, 38, .3, .3, 1.2), h.g(.7))
        for p in (8,): sn.pose(h.t(M.t(m, p)), clap(de, .18), h.g(.55), .05)                         # demi-temps : le clap sur le 3
        for p in range(0, 16, 2):                                                                       # les charleys, et des TRIOLETS qui roulent
            if m % 2 == 1 and p == 12:
                for j in range(3): hh.pose(M.t(m, 12) + j * M.dc * 2 / 3, charley(de, False, 9500), .08 + .02 * j, .3)
                continue
            if m % 2 == 1 and p == 14:
                for j in range(4): hh.pose(M.t(m, 14) + j * M.dc / 2, charley(de, False, 9500), .06 + .02 * j, .3)
                continue
            hh.pose(h.t(M.t(m, p)), charley(de, False, 9000), h.g(.1 if p % 4 else .13), .3)
        for p, o, lg in ((0, 0, 6), (6, 0, 2), (8, 7, 4), (13, 12, 3)):                                 # la 808 qui GLISSE
            n = q[0] - 12 + o; b.pose(M.t(m, p), basse_808(n, lg * M.dc * .95, prec), .5); prec = n
        accord(rh, q[1:], M.t(m, 0), lambda n: rhodes_p(n + 12, M.temps * 3, .7), .055, h, .02)          # le RHODES de VAPEUR, tenu
        arp = [q[1] + 12, q[2] + 12, q[3] + 12, q[4] + 12, q[3] + 12, q[2] + 12]                         # la GUITARE CLAIRE égrène (2e moitié : une octave… plus bas, plus chaud)
        for i, p in enumerate((2, 4, 6, 9, 11, 14)):
            gt.pose(h.t(M.t(m, p)), guitare_claire(arp[i] - (12 if m >= 4 and i % 2 else 0), 1.6, de), h.g(.16), -.35 + .14 * i)
    pompe_bus(M, ('rh', 'gtr'), kicks_de(M, (0, 10)), .25, .18)
    eL, eR = echo(gt.L, gt.R, M.temps * .5, .35); gt.L += eR * .3; gt.R += eL * .3
    return M, ambiance(M, ('rh', 'gtr'), {'bat': .85, 'sn': .85, 'hh': .8, '808': 1, 'rh': 1, 'gtr': 1, 'fx': 1}, 7400, (3., .4, 4600))


INSPI = [
    ('inspi-coffre', i_coffre, 'COFFRE-FORT', 'Jazz de film · le casse en noir et blanc', 84, 'ré mineur',
     "Contrebasse qui marche, balais, vibraphone ; une trompette bouchée pose la question, puis répond un ton plus haut. Le cliquetis du cadran du coffre."),
    ('inspi-chrome', i_chrome, 'CHROME LIQUIDE', 'City pop 80 · la voie express de nuit', 108, 'fa majeur',
     "Basse slappée, Rhodes en contretemps, cloches de verre qui reviennent ; en 2e moitié le Rhodes se syncope et les cordes gonflent."),
    ('inspi-vol', i_vol, 'VOL DE NUIT', 'Synthwave lente · la cabine à 10 000 m', 92, 'la mineur',
     "La nappe, l'arpège de verre du boost en doubles croches, la caisse claire dans une cathédrale ; la mélodie grave n'arrive qu'à la 3e mesure."),
    ('inspi-poussiere', i_poussiere, "POUSSIÈRE D'OR", 'Trap-soul au ralenti · la couleur de VAPEUR', 70, 'mi♭ majeur',
     "La 808 qui glisse, la guitare claire en arpège, le Rhodes tenu de VAPEUR, des charleys qui roulent en triolets."),
]

if __name__ == '__main__':
    seul = sys.argv[1] if len(sys.argv) > 1 else ''
    fd = os.path.join(SORTIE, 'inspi-donnees.js'); anc = {}
    if os.path.exists(fd):
        try: anc = {d['id']: d for d in json.loads(open(fd).read().split('=', 1)[1].rstrip().rstrip(';'))}
        except Exception: pass
    out = []
    for lid, fn, titre, style, bpm, cle, idee in INSPI:
        d = {'id': lid, 'titre': titre, 'style': style, 'bpm': bpm, 'cle': cle, 'idee': idee, 'onglet': 'lobby'}
        if seul and seul not in lid and lid in anc: out.append(anc[lid]); continue
        M, (L, R) = fn(); wav = os.path.join(SORTIE, lid + '.wav'); ecrit_wav(wav, L, R)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(SORTIE, lid + '.m4a')], check=True)
        os.remove(wav); print('  %-16s %.2f s' % (lid, len(L) / SR), flush=True)
        d.update(f='assets/audio/music/boucles/%s.m4a?v=%d' % (lid, int(time.time())), dur=round(len(L) / SR, 5)); out.append(d)
    open(fd, 'w').write('window.INSPI=' + json.dumps(out, ensure_ascii=False) + ';\n'); print('ok')
