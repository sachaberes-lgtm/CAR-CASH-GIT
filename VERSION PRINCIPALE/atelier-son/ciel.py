"""LA MUSIQUE DU CIEL (2026-10-03, Léo, dans la boîte : « utilise la NAPPE VAPEUR pour faire une musique ciel qui va évoluer beaucoup plus,
genre 5 niveaux ; inspire-toi de l'album EXPONENTIAL GENERATOR de FROLLEN MUSIC LIBRARY — ta source d'inspiration principale en termes de
structure technique »).
L'album (Colemine, janv. 2026) : de la LIBRARY MUSIC soul/hip-hop — des beats hip-hop funky, un RHODES et des percussions, un synthé
MONOPHONIQUE (Korg) qui raconte la mélodie par-dessus des basses rondes d'ARP Odyssey, minimaliste, un peu sombre, cinématographique.
LA FORME : un morceau de library qui S'ÉTOFFE, 5 NIVEAUX de 8 mesures (88 BPM, mi♭ majeur — les accords de VAPEUR) :
  1 · la NAPPE VAPEUR seule (filtrée) + une sous-basse tenue
  2 · + le RHODES qui pose les accords, un rim et un shaker
  3 · + le BEAT hip-hop (grosse caisse poussiéreuse, caisse claire, charley qui swingue) + la BASSE funky façon ARP
  4 · + la MÉLODIE au synthé monophonique (notes qui glissent)
  5 · + les CORDES, des congas, le charley ouvert ; le Rhodes répond à la mélodie
La nappe s'ouvre de niveau en niveau ; une petite relance de caisse claire à la fin des niveaux 3 et 4. L'ambiance du lobby (bande,
réverbe douce, aigus adoucis). Sorties : assets/audio/music/ciel/ciel-complet.m4a (les 5 à la suite) + ciel-n1…n5.m4a (chaque niveau
en boucle) + ciel-donnees.js (window.CIEL), lus par boucles.html (Niveaux → Nuages).
"""
import os, sys, json, subprocess, time
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from boucles import *  # noqa: F403
from boucles8 import chorus, fx_rev, rim, shaker, crash, pompe_bus
from petits import Main
from vapeurs import bande, rhodes_p, cordes, tremolo_stereo
from lobby5 import conga

SORTIE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'audio', 'music', 'ciel')
BPM = 88
BPM5 = 95   # (2026-10-04, Léo : « accélère légèrement la musique du CIEL 5, pour voir ; si tu vois un moyen d'intensifier, vas-y ») : le final seul, +8 %
ACC = [[51, 55, 58, 62, 65], [56, 60, 63, 67, 70], [53, 56, 60, 63, 67], [58, 62, 65, 68, 72]]   # Mi♭maj9 · La♭maj9 · Fa m9 · Si♭7sus (VAPEUR)
RAC = [39, 44, 41, 46]                                                                      # mi♭ · la♭ · fa · si♭
# (2026-10-04, Léo : « pour le niveau 5, change la trajectoire du lead » puis « par PROFOND je parle de CHANGE : fais ÉVOLUER le lead encore
# plus, aie recours au TALENT D'IMPRO ») : le final a SON solo, écrit comme une improvisation sur la grille (Mi♭maj9 · La♭maj9 · Fa m9 ·
# Si♭7sus), qui RACONTE en 8 mesures — 1-2 l'EXPOSÉ (un motif de 4 notes, de l'air entre les phrases) · 3 le motif DÉPLACÉ d'une croche
# et monté · 4 une CASCADE en doubles croches avec une note de passage chromatique (si ♮ → do) · 5 le SAUT d'octave qui relance · 6 un riff
# syncopé sur une note répétée qui fait monter la pression · 7 le SOMMET : une appoggiature, puis la note tenue qui chante (vibrato) ·
# 8 la RÉSOLUTION qui redescend et laisse de la place avant la reprise. (mesure, pas, note, durée en pas, force)
MEL5 = [[(0, 70, 3, 1.), (3, 72, 1, .7), (4, 70, 2, .85), (6, 67, 4, .9), (12, 74, 4, 1.)],
        [(0, 72, 2, .9), (2, 70, 2, .7), (4, 67, 2, .8), (6, 68, 6, 1.), (14, 70, 2, .7)],
        [(2, 72, 3, 1.), (5, 74, 1, .7), (6, 72, 2, .85), (8, 68, 4, .9), (12, 75, 2, 1.), (14, 74, 2, .75)],
        [(0, 77, 1, 1.), (1, 75, 1, .7), (2, 74, 1, .75), (3, 72, 1, .7), (4, 70, 2, .9), (6, 68, 1, .7), (7, 70, 1, .8), (8, 72, 6, 1.), (14, 71, 1, .6), (15, 72, 1, .7)],
        [(0, 63, 2, .9), (2, 75, 4, 1.), (6, 74, 1, .7), (7, 72, 1, .7), (8, 70, 2, .85), (10, 74, 2, .9), (12, 77, 4, 1.)],
        [(0, 79, 2, 1.), (3, 79, 1, .7), (4, 77, 2, .85), (6, 75, 1, .7), (7, 77, 1, .8), (8, 79, 3, 1.), (11, 80, 1, .8), (12, 79, 2, .9), (14, 77, 2, .8)],
        [(0, 81, 1, .8), (1, 82, 7, 1.1), (8, 80, 2, .9), (10, 79, 2, .85), (12, 77, 1, .8), (13, 79, 1, .8), (14, 80, 2, .9)],
        [(0, 79, 3, 1.), (3, 77, 1, .7), (4, 75, 2, .85), (6, 72, 2, .8), (8, 70, 4, .9), (12, 67, 2, .75), (14, 70, 2, .7)]]


LEAD5_OCT = -12   # (2026-10-04, Léo : « rapproche la tonalité de la DEUXIÈME version, le lead est trop cool » — le registre du lead profond)


def lead5(n, prec, dur, v=1.):
    """le LEAD du final, MODERNE : deux scies désaccordées ±9 cents + une carrée une octave dessous (le corps), la note qui GLISSE depuis
    la précédente, un filtre qui CLAQUE à chaque note (plus ouvert quand la note est forte) puis se pose, une saturation douce"""
    nn = int((dur + .12) * SR); t = np.arange(nn) / SR
    f0 = hz(prec) if prec else hz(n); f = hz(n) + (f0 - hz(n)) * np.exp(-t / .03)
    if dur > .35:                                                        # la note LONGUE se chante : elle arrive par en dessous, puis vibre
        f = f * 2 ** ((-45 * np.exp(-t / .07)) / 1200) * (1 + .009 * np.sin(2 * np.pi * 5.4 * t) * np.clip((t - .22) / .3, 0, 1))
    s = scie(f * 2 ** (9 / 1200), nn) * .5 + scie(f * 2 ** (-9 / 1200), nn) * .5 + carre(f / 2, nn, .5) * .2   # (Léo : « aussi éclairé que le lead du 4 ») moins de corps grave…
    fc = 1900 + (1600 + 3000 * v) * np.exp(-t / .22) + 700 * np.clip(t / .6, 0, 1)                         # …et le filtre OUVERT comme celui du 4 (il partait de 650 Hz)
    s = balaye(s * env(nn, .006, .25, .7, .06, dur), fc)
    return np.tanh(s * 1.8) * .55


MEL = [[(0, 70, 6), (6, 72, 2), (8, 74, 8)], [(0, 75, 4), (4, 74, 2), (6, 72, 2), (8, 70, 8)],
       [(0, 68, 4), (4, 70, 4), (8, 72, 4), (12, 75, 4)], [(0, 75, 8), (8, 72, 8)],
       [(0, 77, 6), (6, 75, 2), (8, 74, 8)], [(0, 79, 4), (4, 77, 4), (8, 75, 8)],
       [(0, 72, 4), (4, 75, 4), (8, 77, 4), (12, 80, 4)], [(0, 79, 8), (8, 77, 8)]]


def nappe(m, dur, fc, de):
    """LA NAPPE VAPEUR (le son de départ d-nappe) : l'accord en scies douces, filtré"""
    L = 0; R = 0
    for n in m:
        l, r = supersaw(n + 12, dur + .8, 3, 6, de); L = L + l; R = R + r
    e = env(len(L), .35, 9, 1, .9, dur); return filtre(L * e, 'low', fc), filtre(R * e, 'low', fc)


def mono(n, prec, dur):
    """le synthé MONOPHONIQUE : une scie et une carrée, la note GLISSE depuis la précédente (portamento), le filtre s'ouvre à l'attaque"""
    nn = int((dur + .08) * SR); t = np.arange(nn) / SR
    f0 = hz(prec) if prec else hz(n); f = hz(n) + (f0 - hz(n)) * np.exp(-t / .045)
    f = f * (1 + .005 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - .2) / .3, 0, 1))
    s = np.tanh((scie(f, nn) * .6 + carre(f, nn, .45) * .4) * 1.3)
    fc = 1900 + 3600 * np.exp(-t / .3)                               # (Léo : « mélodies, lead un peu étouffés — fais ressortir ») plus ouvert
    return balaye(s * env(nn, .008, .3, .75, .07, dur), fc) * .8


def basse_arp(n, dur):
    """la basse façon ARP : une scie ronde, un coup de filtre à chaque note"""
    nn = int((dur + .03) * SR); t = np.arange(nn) / SR
    s = scie(hz(n), nn) * .55 + sinus(hz(n), nn) * .7
    return balaye(s * env(nn, .004, .15, .55, .04, dur), 180 + 1300 * np.exp(-t / .06))


def caisse_poussiere(de):
    s = caisse(de, 185, 1.05, .19, 1500); return filtre(s, 'low', 5500)


# (2026-10-03, Léo : « change les percussions des niveaux 3, 4, 5 — ça fait vieillot, un peu hors contexte ») : LA BATTERIE MODERNE.
# Fini la grosse caisse poussiéreuse, la caisse claire filtrée et les congas : une grosse caisse SERRÉE (clic + sous-grave qui tombe
# vite), un CLAP doublé d'une caisse claire claire, des charleys fins et droits (presque sans swing), des roulements de charleys en
# triolets dans le final, des CLAQUEMENTS DE DOIGTS à la place des congas, et la nappe/le Rhodes/la basse qui RESPIRENT sur la grosse caisse.
def kick_moderne(de):
    n = int(.5 * SR); t = np.arange(n) / SR
    f = 48 + 130 * np.exp(-t / .028)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (np.exp(-t / .22) * .85 + .15 * np.exp(-t / .05))
    s += .5 * filtre(de.bruit(n), 'high', 4000) * np.exp(-t / .0025)          # le clic qui perce sur un téléphone
    return np.tanh(s * 1.8) / np.tanh(1.8)


def clap_moderne(de):
    c = clap(de, .16); n = len(c); t = np.arange(n) / SR
    cs = caisse(de, 220, .9, .11, 2600)[:n]; cs = np.r_[cs, np.zeros(n - len(cs))]
    s = c * 1.1 + filtre(cs, 'high', 180) * .55
    return filtre(s, 'high', 300)


def hat_moderne(de, ouvert=False):
    return filtre(charley(de, ouvert, 9500), 'high', 7000) * (1.4 if not ouvert else 1.)


def snap(de):
    n = int(.12 * SR); t = np.arange(n) / SR
    return passe_bande(de.bruit(n), 1800, 6500) * (np.exp(-t / .008) + .25 * np.exp(-t / .04)) * 1.2


# (2026-10-03, Léo : « réserve un truc encore plus spectaculaire pour le 5 ») : LE FINAL — le morceau MONTE D'UN TON (mi♭ → fa),
# une demi-mesure de SILENCE à la fin du niveau 4 (la nappe et la relance seules), puis l'IMPACT (sous-basse qui gronde, cymbale,
# accord de CUIVRES) ; dans le niveau 5 : section de cuivres qui claque, CHŒUR « ooh », cordes qui doublent la mélodie, charleys serrés.
TON5 = 2


def cuivres(notes, dur):
    """une section de cuivres de soul : des scies qui gonflent (attaque 30 ms), le filtre qui s'ouvre puis se pose, un vibrato léger"""
    nn = int((dur + .1) * SR); t = np.arange(nn) / SR; s = 0
    for k, n in enumerate(notes):
        f = hz(n) * (1 + .004 * np.sin(2 * np.pi * 5.5 * t + k))
        s = s + scie(f, nn) + .5 * scie(f * 1.006, nn)
    fc = 700 + 2600 * np.exp(-t / .18) + 600
    return balaye(s / len(notes) * env(nn, .03, .25, .55, .08, dur), fc) * .7


def choeur(notes, dur):
    """un chœur « ooh » : des scies douces à travers les formants d'un O (300 et 870 Hz), qui gonflent lentement"""
    nn = int((dur + .5) * SR); t = np.arange(nn) / SR; s = 0
    for n in notes:
        for d9 in (-.006, .006): s = s + scie(hz(n) * (1 + d9) * (1 + .003 * np.sin(2 * np.pi * 4.8 * t)), nn)
    a = passe_bande(s, 250, 400) + .5 * passe_bande(s, 750, 1000)
    return a * env(nn, .45, 9, 1, .5, dur) * .5


def impact_final(de):
    nn = int(1.6 * SR); t = np.arange(nn) / SR
    boom = np.sin(2 * np.pi * np.cumsum(62 * 2 ** (-t / .5)) / SR) * np.exp(-t / .55)
    return np.tanh(boom * 1.6) * .9 + passe_bande(de.bruit(nn), 60, 400) * np.exp(-t / .12) * .3


def souffle_inverse(acc, dur, de, fc=1800):
    """la nappe de l'accord SUIVANT jouée à l'envers, très doucement : elle « aspire » d'une mesure vers la suivante sans bruit de montée"""
    l, r = nappe(acc, dur, fc, de); n = int(dur * SR); l = l[:n][::-1]; r = r[:n][::-1]
    e = np.linspace(0, 1, n) ** 2; return l * e, r * e


def transition(M, m, nv, de, h, sw):
    """(Léo : « sur les niveaux d'avant, un petit grain de changement entre chacun : que la transition soit cohérente mais satisfaisante »)
    un geste DIFFÉRENT à chaque passage, toujours dans l'harmonie (Si♭7sus → Mi♭maj9) :
    1→2 trois notes de Rhodes qui montent + le souffle inversé de l'accord qui arrive ·
    2→3 la 2e demi-mesure se vide (rim et shaker se taisent) puis le beat TOMBE avec une cymbale ·
    3→4 la basse glisse d'une octave vers le grave, un charley s'ouvre, le souffle inversé ·
    4→5 la relance de caisse claire (déjà là) + la cymbale à l'arrivée + les notes de Rhodes qui montent."""
    rh = M.piste('trans'); t9 = M.t(m + 1)
    if nv in (1, 4):
        for k, (p, n) in enumerate(((10, 70), (12, 75), (14, 77)) if nv == 1 else ((10, 72), (12, 77), (14, 79))):
            rh.pose(h.t(M.t(m, p, sw)), rhodes_p(n + 12, .5, .5 + .15 * k), .07 + .015 * k, -.2 + .2 * k)
    if nv in (1, 3, 4):
        acc9 = [n + TON5 for n in ACC[0]] if nv == 4 else ACC[0]
        l, r = souffle_inverse(acc9, M.temps * 2, de); rh.pose2(t9 - len(l) / SR, l, r, .07 if nv < 4 else .11)
    if nv == 4:                                                           # L'IMPACT du final : sous-basse, accord de cuivres
        rh.pose(t9, impact_final(de), .55)
    if nv in (2, 4):
        cr = crash(de, 1.8); rh.pose(t9, filtre(cr, 'low', 9000), .14, .3)
    if nv == 3:
        nn = int(M.temps * 1.5 * SR); t = np.arange(nn) / SR; f = hz(RAC[3] - 12) * 2 ** (-t / (M.temps * 1.5))   # si♭ qui glisse vers le si♭ grave
        s = (scie(f, nn) * .5 + sinus(f, nn) * .7) * env(nn, .004, 9, 1, .1, M.temps * 1.4)
        M.piste('basse').pose(M.t(m, 10, sw), filtre(s, 'low', 900), .45)
        M.piste('bat').pose(M.t(m, 14, sw), charley(de, True, 7000), .25, .3)


KICKS = []


def composer(M, niveau_de, de, h):
    """pose les instruments mesure par mesure selon le NIVEAU de chaque mesure"""
    sw = .2; nb = M.mes
    pd = M.piste('nappe'); sb = M.piste('sub'); rh = M.piste('rh'); b = M.piste('basse'); ld = M.piste('lead')
    bat = M.piste('bat'); sn = M.piste('sn'); pc = M.piste('perc'); ca = M.piste('rhc')
    prec = None; KICKS.clear()
    for m in range(nb):
        nv = niveau_de(m); tr = TON5 if nv == 5 else 0; q = [n + tr for n in ACC[m % 4]]; r = RAC[m % 4] + tr
        coupe = m % 8 == 7 and m + 1 < nb and niveau_de(m + 1) == 5   # la demi-mesure de SILENCE avant le final
        l9, r9 = nappe(q, M.temps * 4, [900, 1300, 1700, 2100, 2500][nv - 1], de)
        pd.pose2(M.t(m), l9, r9, [.16, .13, .11, .1, .09][nv - 1])
        if nv <= 2:                                                        # la sous-basse tenue (avant la basse funky)
            nn = int(M.temps * 3.8 * SR); sb.pose(M.t(m), sinus(hz(r - 12), nn) * env(nn, .2, 9, 1, .3, M.temps * 3.4), .16)
        if nv >= 2:                                                        # le RHODES pose l'accord
            pas = ((0, 12),) if nv == 2 else ((0, 7), (10, 5))
            for p, lg in pas:
                if coupe and p >= 8: continue
                v = .55 + .3 * h.r.random()
                for k, n in enumerate(q[1:]): rh.pose(h.t(M.t(m, p, sw)) + k * .009, rhodes_p(n + 12, lg * M.dc, v), h.g(.07), -.25 + .12 * k)
        dernier = m % 8 == 7 and m + 1 < nb and niveau_de(m + 1) > nv     # la dernière mesure avant un niveau plus haut
        if nv == 2:
            for p in (4, 12):
                if not (dernier and p >= 8): bat.pose(h.t(M.t(m, p, sw)), rim(de), h.g(.25), .15)
            for p in range(0, 16, 2):
                if not (dernier and p >= 8): bat.pose(h.t(M.t(m, p, sw)), shaker(de), h.g(.12 if p % 4 else .18), -.4)
        if nv >= 3:                                                        # LE BEAT MODERNE (voir kick_moderne)
            sd = .06                                                       # la batterie presque droite (le Rhodes et la basse gardent le swing)
            for p in ((0, 7, 10) if m % 2 == 0 else (0, 3, 10)):
                if not (coupe and p >= 8): bat.pose(h.t(M.t(m, p, sd)), kick_moderne(de), h.g(1.08 if nv == 5 else .95)); KICKS.append(M.t(m, p, sd))
            if nv == 5:                                                    # le final : la grosse caisse POUSSE (une double sur la fin de chaque 2e mesure) et un clap fantôme
                if m % 2 == 1: bat.pose(h.t(M.t(m, 14, sd)), kick_moderne(de), h.g(.7)); KICKS.append(M.t(m, 14, sd))
                sn.pose(h.t(M.t(m, 15, sd)), clap_moderne(de), h.g(.16), .2)
            for p in (4, 12):
                if not (coupe and p >= 8): sn.pose(h.t(M.t(m, p, sd)), clap_moderne(de), h.g(.62))
            hh = M.piste('hh')
            for p in range(0, 16, 1 if nv >= 4 else 2):
                if coupe and p >= 8: continue
                if nv == 5 and m % 2 == 1 and p == 14:                     # le final : un roulement de charleys en triolets
                    for j in range(3): hh.pose(M.t(m, 14, sd) + j * M.dc * 2 / 3, hat_moderne(de), .1 + .03 * j, .3)
                    continue
                if nv == 5 and m % 2 == 1 and p == 15: continue
                hh.pose(h.t(M.t(m, p, sd)), hat_moderne(de, nv == 5 and p == 6), h.g(.16 if p % 4 == 0 else (.11 if p % 2 == 0 else .07)), .3)
            if nv in (3, 4) and m % 8 == 7:                               # la petite relance vers le niveau suivant : des claps qui montent
                for k, p in enumerate((13, 14, 15)): sn.pose(M.t(m, p, sd), clap_moderne(de), .22 + .1 * k)
            for p, o, lg in ((0, 0, 3), (3, 12, 1), (6, 7, 2), (8, 0, 3), (11, 0, 1), (12, 10, 2), (14, 7, 2)):   # la BASSE funky façon ARP
                if coupe and p >= 8: continue
                b.pose(h.t(M.t(m, p, sw)), basse_arp(r - 12 + o, lg * M.dc * .9), h.g(.5))
        if nv == 5:                                                        # LE FINAL : le LEAD PROFOND (voir lead5 / MEL5)
            for p, n, lg, v in MEL5[m % 8]:
                if coupe and p >= 8: continue
                n = n + tr + LEAD5_OCT; M.piste('lead5').pose(h.t(M.t(m, p, .06)), lead5(n, prec, lg * M.dc * .92, v), h.g(.44 * v)); prec = n   # (Léo : « le lead du 5 s'entend moins que celui du 4 ») : à l'octave grave il porte moins — .34 → .44, + présence
        if nv == 4:                                                        # LA MÉLODIE au synthé monophonique
            for p, n, lg in MEL[m % 8]:
                if coupe and p >= 8: continue
                n = n + tr; ld.pose(h.t(M.t(m, p, sw)), mono(n, prec, lg * M.dc * .95), h.g(.36)); prec = n
                if nv == 5: M.piste('cordes_m').pose(h.t(M.t(m, p, sw)), filtre(sum(supersaw(n - 12, lg * M.dc + .3, 4, 9, de)) * env(int((lg * M.dc + .3) * SR), .08, 9, 1, .15, lg * M.dc), 'low', 3400), .06, -.25)   # (Léo : « augmente le son de la boucle ajoutée au niveau 4 »)
        if dernier: transition(M, m, nv, de, h, sw)
        if nv == 5:
            for p in (6, 14):                                              # des claquements de doigts (à la place des congas)
                pc.pose(h.t(M.t(m, p, .06)), snap(de), h.g(.3), -.35)
            for p, n, lg in MEL[m % 8][1:2]:                               # le Rhodes RÉPOND à la mélodie
                ca.pose(h.t(M.t(m, p + 2, sw)), rhodes_p(n + tr - 5, 1., .8), .07, -.3)
            # (2026-10-04, Léo : « le 5 n'est pas ouf, le 4 a l'air plus abouti ; premiumise le 5, un vrai effet de NIVEAU DE FIN ») :
            # les cuivres et le chœur en scies (le côté « synthé bon marché ») sont retirés ; le final BRILLE au lieu de s'empiler :
            notes9 = sorted(q)
            for i in range(16):                                            # L'ARPÈGE DE VERRE en doubles croches, l'accord en cours, en ping-pong
                n9 = notes9[[0, 2, 4, 3, 1, 3, 4, 2, 0, 1, 3, 4, 2, 4, 3, 1][i]] + 12
                M.piste('verre').pose(h.t(M.t(m, i, .06)), fm(n9, .5, 4, 1.3, .04, .2), h.g(.08 if i % 4 == 0 else .058), .8 if i % 2 else -.8)
            nn9 = int(M.temps * 3.6 * SR)                                  # LE POIDS : la fondamentale tenue sous la basse funky
            sb.pose(M.t(m), sinus(hz(r - 24), nn9) * env(nn9, .05, 9, 1, .25, M.temps * 3.4), .12)
            for p in (2, 6, 10, 14):                                       # les charleys OUVERTS en contretemps : l'énergie du final
                if not (p == 14 and m % 2 == 1): hh.pose(h.t(M.t(m, p, .06)), hat_moderne(de, True), h.g(.045), -.3)
            if m % 4 == 0:                                                 # une cymbale tous les 4 mesures : le grand écran
                M.piste('trans').pose(M.t(m), filtre(crash(de, 2.2), 'low', 10000), .09, -.3)
    cordes(M, de, [[n + TON5 for n in a] for a in ACC], [m for m in range(nb) if niveau_de(m) == 5], .075, 2300)   # (final) plus amples et plus claires
    fin5 = all(niveau_de(m) == 5 for m in range(nb))                    # la boucle du FINAL seul (pas le morceau entier)
    if KICKS: pompe_bus(M, ('nappe', 'rh', 'basse', 'cordes') if fin5 else ('nappe', 'rh', 'basse'), KICKS, .4 if fin5 else .28, .14 if fin5 else .16)   # tout respire sur la grosse caisse (le final : plus fort)
    if 'lead5' in M.bus:                                                 # le lead du final : un écho en croche pointée, ouvert en stéréo
        l5 = M.bus['lead5']; eL, eR = echo(l5.L, l5.R, M.temps * .75, .3); l5.L += eL * .22; l5.R += eR * .3
    for b9 in ('lead', 'lead5', 'cordes_m', 'cuivres'):                     # LA PRÉSENCE : un peu d'aigu ajouté aux voix qui chantent
        k9 = .75 if b9 == 'lead5' else .45                                 # le lead du final : un cran de présence en plus (il est une octave plus bas)
        if b9 in M.bus: M.bus[b9].L = M.bus[b9].L + k9 * filtre(M.bus[b9].L, 'high', 2200); M.bus[b9].R = M.bus[b9].R + k9 * filtre(M.bus[b9].R, 'high', 2200)
    tremolo_stereo(M, 'rh', 4.2, .2)
    M.bus['nappe'].L, M.bus['nappe'].R = chorus(M.bus['nappe'].L, M.bus['nappe'].R)
    bande(M, ('nappe', 'rh', 'cordes', 'rhc', 'trans', 'choeur'))   # la bande qui pleure : plus sur la mélodie (elle la floutait)
    eL, eR = echo(ld.L, ld.R, M.temps * .75, .3); ld.L += eL * .3; ld.R += eR * .3
    if 'verre' in M.bus:                                               # l'arpège de verre : un écho en croche pointée
        vb = M.bus['verre']; eL, eR = echo(vb.L, vb.R, M.temps * .75, .35); vb.L += eR * .35; vb.R += eL * .35
    fx_rev(M, [('nappe', 1), ('rh', .7), ('lead', .45), ('cordes', 1), ('rhc', 1), ('trans', 1), ('cuivres', .6), ('choeur', 1), ('cordes_m', 1), ('cloche', .6), ('verre', .45), ('lead5', .35), ('sn', .35), ('bat', .1)], 3., .4, 4800)
    return fin(M, {'nappe': 1, 'sub': 1, 'rh': 1, 'basse': 1, 'lead': 1, 'bat': .9, 'sn': .9, 'hh': .85, 'perc': 1, 'rhc': 1, 'cordes': 1, 'trans': 1, 'cuivres': 1, 'choeur': 1, 'cordes_m': 1, 'cloche': 1, 'verre': 1, 'lead5': 1, 'fx': 1}, maitre_lp=12000)


def rendu(nom, mesures, niveau_de, graine, bpm=BPM, gain_db=0.):
    M = Morceau(bpm, mesures=mesures, graine=graine); h = Main(graine, 4)
    L, R = composer(M, niveau_de, M.de, h)
    if gain_db: k9 = 10 ** (gain_db / 20); L = L * k9; R = R * k9
    wav = os.path.join(SORTIE, nom + '.wav'); ecrit_wav(wav, L, R)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(SORTIE, nom + '.m4a')], check=True)
    os.remove(wav); print('  %-12s %.1f s' % (nom, len(L) / SR), flush=True); return round(len(L) / SR, 5)


if __name__ == '__main__':
    os.makedirs(SORTIE, exist_ok=True); v = int(time.time()); out = []
    d = rendu('ciel-complet', 40, lambda m: m // 8 + 1, 701)
    out.append({'id': 'ciel-complet', 'titre': 'CIEL · LES 5 NIVEAUX', 'style': 'Library soul / hip-hop · le morceau entier', 'bpm': BPM, 'cle': 'mi♭ majeur',
                'f': 'assets/audio/music/ciel/ciel-complet.m4a?v=%d' % v, 'dur': d,
                'idee': "La nappe vapeur qui s'étoffe en 5 niveaux de 8 mesures : nappe seule · Rhodes · beat hip-hop et basse ARP · mélodie au synthé mono · cordes et congas."})
    noms = ['la nappe seule', 'le Rhodes', 'le beat et la basse', 'la mélodie', 'le final : un ton plus haut, cuivres, chœur']
    for k in range(1, 6):
        d = rendu('ciel-n%d' % k, 8, lambda m, k=k: k, 710 + k, BPM5 if k == 5 else BPM)
        out.append({'id': 'ciel-n%d' % k, 'titre': 'CIEL · NIVEAU %d' % k, 'style': 'Niveau %d · %s' % (k, noms[k - 1]), 'bpm': BPM5 if k == 5 else BPM, 'cle': 'fa majeur' if k == 5 else 'mi♭ majeur',
                    'f': 'assets/audio/music/ciel/ciel-n%d.m4a?v=%d' % (k, v), 'dur': d, 'idee': "Le niveau %d du CIEL, en boucle." % k})
    open(os.path.join(SORTIE, 'ciel-donnees.js'), 'w').write('window.CIEL=' + json.dumps(out, ensure_ascii=False) + ';\n'); print('ok')
