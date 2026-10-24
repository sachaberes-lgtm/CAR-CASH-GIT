"""PENTHOUSE · V2 — LES INSTRUMENTS REMPLACÉS (2026-10-15, pôle SON ; Léo, dans sa note sur PENTHOUSE : « tenter avec des instruments
différents, remplacer complètement »). La MÊME composition (ville_suite.py, niveau 8 : si m9 · mi9 · la maj9 · fa# m9, 120 BPM), les
MÊMES 8 paliers (PENT de paliers_figes.py), les mêmes graines — seuls les INSTRUMENTS changent, tous :
  la nappe Juno      → un CHŒUR (« ah », trois voix désaccordées par note, formants de voix)
  le Rhodes          → un PIANO FEUTRÉ (partiels un peu inharmoniques, le feutre qui adoucit, le marteau)
  les cloches de verre → un VIBRAPHONE (l'octave double et le partiel ×4, le moteur qui fait trembler)
  la harpe (glissandos) → une BOÎTE À MUSIQUE (les lames d'acier, égrenées sur deux octaves)
  les cordes         → des FLÛTES (le souffle, le vibrato ; en staccato, des cordes pincées)
  le lead CS-80      → un SAXOPHONE de minuit (scie dans les formants du sax, le souffle, le vibrato qui arrive tard)
  les pièces         → des VERRES de champagne qui trinquent (« tchin » en grappe)
  les cuivres        → des CORS feutrés
  la 808             → une BASSE RONDE qui glisse (triangle et sinus, un grognement doux)
  la batterie        → une grosse caisse sèche, des CLAQUEMENTS DE DOIGTS, un SHAKER
Chaque instrument neuf est rendu à la sonie de celui qu'il remplace (mesurée sur une note de référence) : l'équilibre du mixage reste.
Lancer : <venv>/python atelier-son/penthouse_v2.py [port du serveur-moteur]
"""
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from boucles import SR, hz, filtre, env, scie, carre, passe_bande, karplus  # noqa: E402
import neon_ville as NV  # noqa: E402
import ville_suite as VS  # noqa: E402
import paliers_figes as PF  # noqa: E402

R0 = np.random.default_rng(1508)


def creuse(x, k=.45):
    """le bas-médium (220-480 Hz) creusé de k : ce qui fait « boue » sous les voix et le piano"""
    return x - k * passe_bande(x, 220, 480)


def rms(x): x = np.asarray(x[0] if isinstance(x, tuple) else x, float); return float(np.sqrt(np.mean(x * x)) + 1e-12)


def cale(neuf, vieux):
    """la sonie de l'ancien instrument, mesurée une fois sur une note de référence : le neuf est rendu au même niveau"""
    k = [None]
    def f(*a, **kw):
        y = neuf(*a, **kw)
        if k[0] is None:
            try: k[0] = rms(vieux(*a, **kw)) / rms(y)
            except Exception: k[0] = 1.
        return (y[0] * k[0], None if y[1] is None else y[1] * k[0]) if isinstance(y, tuple) else y * k[0]
    return f


# ------------------------------------------------------------------------------------------------ les instruments neufs
def choeur(notes, dur, v, de, P, t0=0.):
    nn = int((dur + .9) * SR); t = np.arange(nn) / SR; L = np.zeros(nn); R = np.zeros(nn)
    for n in notes:
        for k, (dt, pan) in enumerate(((-9, -.65), (0, 0.), (9, .65))):
            f = hz(n) * 2 ** (dt / 1200) * (1 + .004 * np.sin(2 * np.pi * (4.7 + .5 * k) * t + n + k))
            s = scie(f, nn)
            vx = passe_bande(s, 650, 900) + .6 * passe_bande(s, 1050, 1300) + .14 * passe_bande(s, 2500, 3100)   # « ah » (en « oh », le 1er formant à 450 Hz faisait la boue)
            L += vx * (.5 - .5 * pan); R += vx * (.5 + .5 * pan)
    e = env(nn, .5, 9, 1, .8, dur) / len(notes)
    L, R = L * e, R * e
    return creuse(L), creuse(R)   # (mesuré : la boue 200-500 Hz montait à 11 % — la règle de Léo : ~9 %)


def piano_feutre(m, dur=1.2, vel=1.):
    nn = int((dur + .8) * SR); t = np.arange(nn) / SR; f = hz(m); s = np.zeros(nn)
    for k in range(1, 10):
        fk = f * k * np.sqrt(1 + .00035 * k * k)
        s += (1 / k ** 1.4) * np.sin(2 * np.pi * fk * t + k) * np.exp(-t / (2.2 / (1 + .4 * k)))
    marteau = filtre(R0.standard_normal(nn), 'low', 1800) * np.exp(-t / .012) * .08
    s = creuse(filtre(filtre(s + marteau, 'low', 2400), 'high', 160))               # le feutre : l'aigu tombe vite ; le bas-médium creusé
    return s * env(nn, .004, 9, 1, .4, dur) * (.5 + .5 * vel)


def vibraphone(n, dur, v, de, P):
    nn = int(2.8 * SR); t = np.arange(nn) / SR; f = hz(n)
    s = np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / .5) + .08 * np.sin(2 * np.pi * f * 10 * t) * np.exp(-t / .12)
    trem = 1 - .35 * (.5 + .5 * np.sin(2 * np.pi * 5.6 * t))                         # le moteur du vibraphone
    return s * trem * np.exp(-t / 1.8) * (1 - np.exp(-t / .002)) * .5


def boite_a_musique(notes, dur, v, de, P):
    seq = sorted(notes) + [x + 12 for x in sorted(notes)]; out = np.zeros(int((dur + 2.) * SR))
    for i, n in enumerate(seq):
        nn = int(1.6 * SR); t = np.arange(nn) / SR; f = hz(n + 12)
        lame = (np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / .05)) * np.exp(-t / .9) * (1 - np.exp(-t / .001))
        a = int(i * .05 * SR); out[a:a + nn] += lame[:len(out) - a] * (.55 + .45 * i / len(seq))
    return filtre(out, 'high', 300), None


def flutes(notes, dur, v, de, P):
    stac = dur < .3; nn = int((dur + (.25 if stac else .7)) * SR); t = np.arange(nn) / SR; L = np.zeros(nn); R = np.zeros(nn)
    for j, n in enumerate(notes):
        if stac:                                                                     # en staccato : des cordes PINCÉES
            k = karplus(n, (dur + .25), .55, .993, de)[:nn]; x = np.zeros(nn); x[:len(k)] = k
        else:
            f = hz(n + 12) * (1 + .005 * np.sin(2 * np.pi * 5.2 * t + j) * np.clip((t - .3) / .4, 0, 1))   # (les flûtes une octave au-dessus des cordes : en bas, des sinus purs faisaient la boue)
            x = np.sin(2 * np.pi * np.cumsum(f) / SR) + .18 * np.sin(4 * np.pi * np.cumsum(f) / SR)
            x = x + passe_bande(R0.standard_normal(nn), hz(n + 12) * 1.5, min(hz(n + 12) * 4, 16000)) * .12   # le souffle
        pan = -.5 + j / max(1, len(notes) - 1); L += x * (.5 - .5 * pan); R += x * (.5 + .5 * pan)
    e = env(nn, .006 if stac else .14, .1 if stac else 9, 0 if stac else 1, .08 if stac else .45, dur) / len(notes)
    return creuse(L * e), creuse(R * e)


def saxo(n, dur, v, de, P):
    nn = int((dur + .5) * SR); t = np.arange(nn) / SR
    f = hz(n) * (1 + .007 * np.sin(2 * np.pi * 5.4 * t) * np.clip((t - .3) / .4, 0, 1))
    s = scie(f, nn) * .8 + carre(f, nn, .35) * .25
    corps = creuse(passe_bande(s, 500, 1600) * 1.2 + .6 * passe_bande(s, 2300, 3200), .6)   # (sans le bas du corps : il faisait la boue)
    souffle = passe_bande(R0.standard_normal(nn), 1800, 6000) * (np.exp(-t / .05) * .25 + .03)
    return np.tanh((corps * env(nn, .05 if dur > .3 else .02, 9, 1, .25, dur) + souffle * env(nn, .02, 9, 1, .2, dur)) * 1.3) * .6


def verres(de, P, rng):
    nn = int(1.2 * SR); out = np.zeros(nn); gam = [81, 85, 88, 90, 93, 97]
    for i in range(int(P.get('nb', 7))):
        n = gam[rng.integers(len(gam))]; a = int((i * .07 + rng.random() * .03) * SR); m = nn - a; t = np.arange(m) / SR; f = hz(n)
        tchin = (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.32 * t) + .25 * np.sin(2 * np.pi * f * 4.25 * t)) * np.exp(-t / .35) * (1 - np.exp(-t / .0008))
        out[a:] += tchin * (.4 + .5 * rng.random())
    return filtre(out, 'high', 1200) * .6


def cors(notes, dur, v, de, P):
    nn = int((dur + .4) * SR); t = np.arange(nn) / SR; L = np.zeros(nn)
    for n in notes:
        f = hz(n) * (1 + .003 * np.sin(2 * np.pi * 4.9 * t + n))
        L += filtre(scie(f, nn) * .7 + np.sin(2 * np.pi * f * t) * .5, 'low', 900)
    return np.tanh(L / len(notes) * env(nn, .09, .3, .8, .2, dur) * 1.2) * .7, None


def basse_ronde(n, dur, v, de, P, prec=[None]):
    nn = int((dur + .06) * SR); t = np.arange(nn) / SR; f1 = hz(n); f0 = hz(prec[0]) if prec[0] else f1
    f = f1 + (f0 - f1) * np.exp(-t / .07); prec[0] = n; ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + .2 * (2 / np.pi) * np.arcsin(np.sin(ph * 2))                   # le sinus et un triangle à l'octave
    return filtre(filtre(np.tanh(s * 1.4), 'low', 280), 'low', 280) * env(nn, .006, 9, 1, .08, dur) * .8   # (le grognement gardé sous 280 Hz : au-dessus, il faisait la boue)


def gc_seche(de, P):
    nn = int(.35 * SR); t = np.arange(nn) / SR; f = 50 + 110 * np.exp(-t / .035)
    corps = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .16); clic = filtre(de.bruit(nn), 'high', 3000) * np.exp(-t / .004) * .3
    return np.tanh((corps + clic) * 1.5) * .9


def claquement(de, dec=.2):
    nn = int(.18 * SR); t = np.arange(nn) / SR
    return (passe_bande(de.bruit(nn), 1800, 4200) * np.exp(-t / .018) + np.sin(2 * np.pi * 2100 * t) * np.exp(-t / .01) * .2) * 1.4


def caisse_douce(de, ton=200, bruit=.8, dec=.12, clair=2400):
    nn = int(.15 * SR); t = np.arange(nn) / SR
    return passe_bande(de.bruit(nn), 700, 2600) * np.exp(-t / .03) * .3


def shaker(de, ouvert=False):
    nn = int((.16 if ouvert else .07) * SR); t = np.arange(nn) / SR
    return passe_bande(de.bruit(nn), 5000, 11000) * (1 - np.exp(-t / .008)) * np.exp(-t / (.06 if ouvert else .025)) * 1.3


def remplace():
    """pose les instruments neufs dans les deux moteurs (neon_ville et ville_suite), chacun calé sur la sonie de l'ancien"""
    NV.juno = cale(choeur, NV.juno)
    NV.rhodes_p = cale(piano_feutre, NV.rhodes_p)
    NV.NOTE_INST['bell'] = cale(vibraphone, NV.NOTE_INST['bell'])
    NV.NOTE_INST['cs80'] = cale(saxo, NV.NOTE_INST['cs80'])
    NV.NOTE_INST['bass808'] = cale(basse_ronde, VS.bass808)
    NV.boomkick = cale(gc_seche, NV.boomkick)
    VS.harp = cale(boite_a_musique, VS.harp); VS.strings = cale(flutes, VS.strings); VS.brass = cale(cors, VS.brass)
    VS.coins = cale(verres, VS.coins); VS.hat = cale(shaker, VS.hat)
    VS.clap = cale(claquement, VS.clap); VS.caisse = cale(caisse_douce, VS.caisse)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9200
    remplace()
    PF.fige('penthouse-v2', {'titre': 'PENTHOUSE · V2', 'style': 'la même composition, d’autres instruments : chœur, piano feutré, vibraphone, boîte à musique, flûtes, saxophone, verres qui trinquent, cors, basse ronde',
                             'bpm': 120, 'ton': 'si m9 · mi9 · la maj9 · fa# m9',
                             'paliers': ['Le hall : le chœur, la sous-basse et le vibraphone.', 'Le piano feutré et les glissandos de la boîte à musique.',
                                         'La basse ronde qui glisse, le shaker.', 'Le beat : la grosse caisse sèche, les claquements de doigts sur le 3.',
                                         'Les flûtes, le shaker à plein.', 'Le saxophone qui s’élève.', 'Les verres qui trinquent, la sous-basse revient.',
                                         'Le luxe total : les cors posent les accords, plus de verres, tout pousse.']}, PF.penthouse_rendus(), port)
