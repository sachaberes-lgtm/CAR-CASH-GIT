# -*- coding: utf-8 -*-
"""LE CHEF D'ORCHESTRE — l'atelier (2026-10-01, Léo : « au début c'était mieux… creuse comment créer une musique adaptée au jeu sans
trop que la personne s'en rende compte, qui prenne en compte quand elle tourne, qu'il y ait de l'évolution ; chaque niveau a sa
musique ; compose en synthèse mais dépasse tes limites ; ce qui manque, c'est l'ÉNERGIE »).

Plus de boucles pré-mixées découpées en couches : chaque niveau a
  · une BANQUE DE SONS rendue ici (une « planche » : un seul fichier, chaque son à sa place) — grosse caisse en couches (sub +
    punch + clic, saturée), clap large, charleys, basse (roulante / 808 / reese), accords supersaw 7 voix, nappe, Rhodes FM, lead,
    arpège, et les effets (montées 1 et 4 mesures, impact, crash, crash inversé, sub-drop) ;
  · une PARTITION (sections INTRO · GROOVE · MONTEE · DROP · BREAK + un ROULEMENT d'une mesure, des variantes par acte) ;
et le JEU joue la partition en direct (musique-chef.js) : il choisit la section selon la course, joue chaque son au seizième près,
fait pomper la basse sous la grosse caisse, et suit les virages, le vol, la nitro, le moteur, le temps.

Le MIXAGE est calibré ici : chaque piste du DROP est rendue seule et son gain est réglé pour viser un niveau cible (CIBLES).
Un APERÇU de chaque section est rendu pour la page d'écoute.

  python atelier-son/compo.py            → assets/audio/music/compo/<niveau>-sons.m4a, <niveau>-apercu.m4a, compo-donnees.js
  python atelier-son/compo.py ville      → un seul niveau
"""
import sys, os, json, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from boucles import *  # noqa: F403  (instruments de base, filtres, réverbe, Des, hz, env, supersaw, fm…)
from boucles8 import crash, shaker, voix_menee

SORTIE_C = os.path.join(RACINE, 'assets', 'audio', 'music', 'compo')

# ======================================================================================== LES INSTRUMENTS
def norm(x, pk=.9):
    m = np.max(np.abs(x)); return x * (pk / m) if m > 0 else x
def st(x, y=None): return (x, x.copy() if y is None else y)

def kick_lourd(de, f0=175, f1=47, dec=.42, drive=2.2, click=.5):
    """trois couches : le SUB (sinus qui tombe de f0 à f1), le PUNCH (bruit filtré 120-260 Hz, 25 ms), le CLIC (5 kHz, 3 ms) — saturé"""
    n = int(.7 * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / .028)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec)
    pun = passe_bande(de.bruit(n), 110, 280) * np.exp(-t / .022) * 2.5
    cli = filtre(de.bruit(n), 'high', 4000) * np.exp(-t / .003) * click + np.sin(2 * np.pi * 1600 * t) * np.exp(-t / .004) * .4
    k = np.tanh((sub + pun * .5 + cli) * drive) / np.tanh(drive)
    return norm(filtre(k, 'high', 28), .95)

def clap_large(de, tail=.35):
    n = int((tail + .4) * SR); t = np.arange(n) / SR; e = np.zeros(n)
    for k, o in enumerate([0, .009, .019, .028]):
        i = int(o * SR); e[i:] += np.exp(-(t[:n - i]) / (.006 if k < 3 else .09)) * (1 - .1 * k)
    c = passe_bande(de.bruit(n), 800, 7000) * e + np.sin(2 * np.pi * 210 * t) * np.exp(-t / .03) * .3
    L, R = reverbe(c * .9, c * .9, tail, 7000, .005, de)
    return norm(c + L * .5), norm(c + R * .5)

def caisse_build(de):
    n = int(.25 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(200 * (1 + .4 * np.exp(-t / .01))) / SR) * np.exp(-t / .05) * .6 + passe_bande(de.bruit(n), 1500, 9000) * np.exp(-t / .06)
    return norm(s)

def hat(de, ouvert=False, clair=8500):
    return norm(charley(de, ouvert, clair))

def ride(de):
    n = int(1.4 * SR); t = np.arange(n) / SR
    met = sum(np.sin(2 * np.pi * f * t + de.u(0, 6)) * a for f, a in [(3150, 1), (4620, .7), (5480, .5), (7130, .4), (8800, .3)])
    s = met * np.exp(-t / .45) * .5 + filtre(de.bruit(n), 'high', 7000) * np.exp(-t / .2) * .4
    return norm(filtre(s, 'high', 2500))

def crash_long(de): return norm(crash(de, 2.4))

def sub_drop(de):
    n = int(1.6 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(70 * 2 ** (-t / .6)) / SR) * np.exp(-t / .7)
    return norm(np.tanh(s * 1.5))

def impact(de):
    n = int(3.5 * SR); t = np.arange(n) / SR; L = np.zeros(n)
    for x, g in ((kick_lourd(de, 150, 38, .9, 2.5, .2), 1.), (crash_long(de), .7), (sub_drop(de), .6)):
        m = min(n, len(x)); L[:m] += x[:m] * g
    nz = filtre(de.bruit(n), 'low', 3000) * np.exp(-t / .25) * .5; L += nz
    rL, rR = reverbe(L, L, 2.8, 5000, .02, de)
    return norm(L + rL * .4), norm(L + rR * .4)

def montee(de, mesures, bpm):
    """une MONTÉE : scie qui monte d'une octave et demie, un souffle discret dont le filtre grimpe — sans trémolo"""
    lg = mesures * 240 / bpm; n = int(lg * SR); t = np.arange(n) / SR; u = t / lg
    nz = balaye(de.bruit(n), 250 * (60 ** u)) * u ** 1.8
    sw = (scie(110 * 2 ** (u * 1.5), n) + scie(110 * 2 ** (u * 1.5) * 1.01, n)) * .3 * u ** 2.5
    # (v4.1) plus de trémolo qui hache le souffle (« vent inversé coupé en morceaux ») : la montée GONFLE, elle ne bégaie pas
    s = nz * .32 + filtre(sw, 'low', 5000)
    L = filtre(s, 'high', 200); R = np.roll(L, 300)
    return norm(L, .8), norm(R, .8)

def descente(de, bpm):
    lg = 240 / bpm; n = int(lg * SR); t = np.arange(n) / SR; u = t / lg
    s = balaye(de.bruit(n), 12000 * (1 / 40) ** u) * np.exp(-u * 2)
    return norm(filtre(s, 'high', 150), .7)

def crash_inverse(de, bpm):
    c = crash_long(de); n = int(240 / bpm * SR); c = c[:n] if len(c) >= n else np.r_[c, np.zeros(n - len(c))]
    return norm(c[::-1] * np.linspace(0, 1, n) ** .5, .8)

def basse_roulante(de, m):
    n = int(.3 * SR); t = np.arange(n) / SR; f = hz(m)
    s = scie(f, n) * .6 + carre(f * 1.004, n, .5) * .4 + sinus(f / 2, n) * .5
    fc = 250 + 1800 * np.exp(-t / .045)
    return norm(np.tanh(balaye(s, fc) * 2.2) * env(n, .002, .12, .4, .03, .2), .85)

def basse_808(de, m, lg=1.8):
    n = int(lg * SR); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * np.cumsum(f * (1 + .5 * np.exp(-t / .015))) / SR)
    s = np.tanh(s * 2.8) * np.exp(-t / .9) * (1 - np.exp(-t / .002))
    return norm(filtre(s, 'low', 1800), .9)

def reese(de, m, lg=.9):
    n = int(lg * SR); t = np.arange(n) / SR; f = hz(m)
    s = scie(f * 1.009, n) + scie(f * .991, n) + .8 * sinus(f / 2, n)
    fc = 300 + 500 * (.5 + .5 * np.sin(2 * np.pi * 1.3 * t))
    s = np.tanh(balaye(s, fc) * 2.5) * env(n, .005, 9, 1, .05, lg - .08)
    return norm(s, .85)

def stab(de, notes, lg=.45, voix=7, ecart=24, fc0=6000):
    L = 0; R = 0
    for m in notes:
        l, r = supersaw(m, lg, voix, ecart, de); L = L + l; R = R + r
    n = len(L); t = np.arange(n) / SR; e = env(n, .003, .09, .25, .05, lg * .6)
    fc = 900 + fc0 * np.exp(-t / .12)
    L = np.tanh(balaye(L * e, fc) * 1.6); R = np.tanh(balaye(R * e, fc) * 1.6)
    return norm(filtre(L, 'high', 150)), norm(filtre(R, 'high', 150))

def nappe(de, notes, lg, fc=2400):
    L = 0; R = 0
    for m in notes:
        l, r = supersaw(m, lg + .8, 5, 14, de); L = L + l; R = R + r
    n = len(L); e = env(n, .35, 9, 1, .6, lg)
    L, R = filtre(L * e, 'low', fc), filtre(R * e, 'low', fc)
    from boucles8 import chorus
    L, R = chorus(L, R, 15, 3, .4)
    return norm(L, .8), norm(R, .8)

def rhodes_acc(de, notes, lg=3.):
    L = 0
    for k, m in enumerate(notes):
        s = plus(fm(m, lg, 1, 2.2, .3, 1.4), .3 * fm(m + 12, lg * .5, 14, 1.2, .05, .4)); s = np.r_[np.zeros(int(k * .012 * SR)), s]
        L = plus(L, s) if not isinstance(L, int) else s
    return norm(L, .8), norm(np.roll(L, 120), .8)

def pluck(de, m, lg=.55, voix=3, clair=5000):
    l, r = supersaw(m, lg, voix, 10, de); n = len(l); t = np.arange(n) / SR
    fc = 500 + clair * np.exp(-t / .07); e = env(n, .002, .14, 0)
    return norm(balaye(l * e, fc), .8), norm(balaye(r * e, fc), .8)

def cloche(de, m, lg=1.6):
    s = fm(m, lg, 3.5, 2.6, .35, .9); return norm(s, .8), norm(np.roll(s, 90), .8)

def lead_saw(de, m, lg=2.2, voix=5, ecart=14, sale=1.0):
    n = int(lg * SR); t = np.arange(n) / SR
    vib = 1 + .005 * np.sin(2 * np.pi * 5.6 * t) * np.clip((t - .25) / .4, 0, 1)
    L = 0; R = 0
    for k in range(voix):
        c = (k - (voix - 1) / 2) / max(1, (voix - 1) / 2); f = hz(m) * 2 ** (c * ecart / 1200) * vib
        s = scie(f, n); L = L + s * (1 - c * .6); R = R + s * (1 + c * .6)
    sub = sinus(hz(m) / 2 * vib, n) * .35
    e = env(n, .006, 9, 1, .15, lg - .2)
    fc = 2200 + 3500 * np.exp(-t / .3)
    L = np.tanh(balaye((L / voix + sub) * e, fc) * 1.4 * sale); R = np.tanh(balaye((R / voix + sub) * e, fc) * 1.4 * sale)
    return norm(L, .85), norm(R, .85)

def perc_shaker(de): return norm(shaker(de) * 2)

# ======================================================================================== LA PARTITION
"""Événement : [mesure 0-3, pas 0-15 (fractionnaire permis : les triples-croches), son, gain, durée s (0 = la sienne), glissé (demi-tons)]
Une SECTION a ses PISTES ; une piste a des VARIANTES (par acte, ou tirées). MÉTA de piste : bus, sol (se tait en vol), roll (drift),
minI (intensité minimale pour jouer, dans GROOVE et INTRO)."""
def E(b, s, son, g=1., d=0, gl=0): return [b, s, son, round(g, 3), round(d, 3), gl]

def quatre_temps(son='kick', g=1.):
    return [E(b, s, son, g) for b in range(4) for s in (0, 4, 8, 12)]

def motif(pas, son, gains=None, mes=range(4)):
    out = []
    for b in mes:
        for i, s in enumerate(pas):
            g = gains[i % len(gains)] if gains else 1.; out.append(E(b, s, son, g))
    return out

def roulement(son, b=3, debut=8, fin=16, densite=(2, 1, .5), g0=.4, g1=1.):
    """un roulement de caisse claire qui accélère et monte : croches, doubles, triples"""
    out = []; s = debut; tranches = len(densite); lg = (fin - debut) / tranches
    for k, d in enumerate(densite):
        x = debut + k * lg
        while x < debut + (k + 1) * lg - 1e-6:
            u = (x - debut) / (fin - debut); out.append(E(b, round(x, 3), son, g0 + (g1 - g0) * u)); x += d
    return out

def niv_nuages():
    """NUAGES — « ASCENSION » : progressive euphorique, 128 BPM, la mineur / do majeur : la m · fa · do · sol (vi IV I V)."""
    acc = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]]              # la m · fa/la · do/sol · sol (enchaînées au plus court)
    racines = [45, 41, 48, 43]                                                  # la2 fa2 do3 sol2
    arp = [[69, 72, 76], [65, 69, 72], [67, 72, 76], [67, 71, 74]]
    hookA = [(0, 0, 76, 3), (0, 3, 74, 1), (0, 4, 76, 2), (0, 6, 79, 2), (0, 8, 81, 4), (0, 12, 79, 2), (0, 14, 76, 2),
             (1, 0, 77, 3), (1, 3, 76, 1), (1, 4, 77, 2), (1, 6, 81, 2), (1, 8, 84, 6), (1, 14, 81, 2),
             (2, 0, 79, 3), (2, 3, 76, 1), (2, 4, 79, 2), (2, 6, 84, 2), (2, 8, 86, 4), (2, 12, 84, 2), (2, 14, 79, 2),
             (3, 0, 83, 4), (3, 4, 81, 2), (3, 6, 79, 2), (3, 8, 74, 8)]
    hookB = hookA[:-4] + [(3, 0, 83, 2), (3, 2, 84, 2), (3, 4, 86, 4), (3, 8, 88, 8)]   # la fin qui GRIMPE au lieu de retomber
    return dict(bpm=128, ton=-4, cle='la mineur', acc=acc, racines=racines, arp=arp, hooks=[hookA, hookB, hookB],
                basse='roulante', lead='saw', pluck='pluck', timbre=dict(kick=(175, 47, .42), hat=8500),
                notes_lead_oct=0)

def niv_ville():
    """VILLE — « NUIT ÉLECTRIQUE » : trap sombre en demi-temps, 140 BPM, fa mineur : fa m · ré♭ · la♭ · mi♭ (i VI III VII), 808 qui glisse."""
    acc = [[53, 56, 60], [53, 56, 61], [51, 56, 60], [51, 55, 58]]
    racines = [41, 37, 44, 39]
    arp = [[65, 68, 72], [65, 68, 73], [63, 68, 72], [63, 67, 70]]
    hookA = [(0, 0, 72, 2), (0, 3, 72, 1), (0, 4, 75, 2), (0, 6, 72, 2), (0, 10, 70, 2), (0, 12, 68, 4),
             (1, 0, 68, 2), (1, 3, 68, 1), (1, 4, 70, 2), (1, 6, 68, 2), (1, 10, 65, 6),
             (2, 0, 72, 2), (2, 3, 72, 1), (2, 4, 75, 2), (2, 6, 77, 2), (2, 10, 75, 2), (2, 12, 72, 4),
             (3, 0, 70, 2), (3, 2, 72, 2), (3, 4, 70, 4), (3, 8, 67, 8)]
    hookB = hookA[:-4] + [(3, 0, 75, 2), (3, 2, 77, 2), (3, 4, 79, 4), (3, 8, 80, 8)]
    return dict(bpm=140, ton=4, cle='fa mineur', acc=acc, racines=racines, arp=arp, hooks=[hookA, hookB, hookB],
                basse='808', lead='saw_sale', pluck='cloche', timbre=dict(kick=(160, 45, .5), hat=9500), trap=True)

def niv_orbite():
    """ORBITE — « ATTRACTION » : drum'n'bass, 174 BPM, ré mineur : ré m · si♭ · fa · do (i VI III VII), basse reese, cloches."""
    acc = [[62, 65, 69], [62, 65, 70], [60, 65, 69], [60, 64, 67]]
    racines = [38, 34, 41, 36]
    arp = [[74, 77, 81], [74, 77, 82], [72, 77, 81], [72, 76, 79]]
    hookA = [(0, 0, 81, 6), (0, 6, 79, 2), (0, 8, 77, 4), (0, 12, 74, 4),
             (1, 0, 77, 6), (1, 6, 79, 2), (1, 8, 82, 8),
             (2, 0, 81, 6), (2, 6, 79, 2), (2, 8, 77, 4), (2, 12, 81, 4),
             (3, 0, 79, 8), (3, 8, 76, 8)]
    hookB = hookA[:-2] + [(3, 0, 79, 4), (3, 4, 81, 4), (3, 8, 84, 8)]
    return dict(bpm=174, ton=1, cle='ré mineur', acc=acc, racines=racines, arp=arp, hooks=[hookA, hookB, hookB],
                basse='reese', lead='saw', pluck='cloche', timbre=dict(kick=(170, 50, .3), hat=10000), dnb=True)

NIVEAUX_C = {'nuages': niv_nuages, 'ville': niv_ville, 'orbite': niv_orbite}

def composer(N):
    """la partition complète d'un niveau, construite d'après ses accords et ses hooks"""
    acc, rac, arp, hooks = N['acc'], N['racines'], N['arp'], N['hooks']
    trap, dnb = N.get('trap'), N.get('dnb')
    def basse(var):
        out = []
        for b in range(4):
            r = rac[b]
            if N['basse'] == 'roulante':
                for s in range(16):
                    if s % 4 == 0: continue
                    note = r + (12 if (var == 1 and s % 4 == 2) else 0); out.append(E(b, s, 'basse_%d' % note, .8 if s % 4 == 2 else 1))
            elif N['basse'] == '808':
                pat = [(0, 1., 0), (7, .8, 0), (10, .9, 0)] if var == 0 else [(0, 1., 0), (6, .8, 0), (8, .9, 0), (11, .8, 12 if b % 2 else 0)]
                for s, g, o in pat:
                    gl = (-12 if (b == 3 and s >= 10) else 0)
                    out.append(E(b, s, 'basse_%d' % (r + o), g, 0, gl))
            else:  # reese en blanches + relances
                out.append(E(b, 0, 'basse_%d' % r, 1., 240 / N['bpm'] * .48)); out.append(E(b, 10, 'basse_%d' % r, .8, 240 / N['bpm'] * .3))
        return out
    def arpeges(dense):
        out = []
        for b in range(4):
            ch = arp[b]; seq = [0, 1, 2, 1] if not dense else [0, 1, 2, 3, 2, 1, 0, 1]
            for s in range(0, 16, 1 if dense else 2):
                k = seq[(s if dense else s // 2) % len(seq)]; note = ch[k % 3] + (12 if k == 3 else 0)
                out.append(E(b, s, 'pluck_%d' % note, .55 + .45 * (s % 4 == 0)))
        return out
    def hook_ev(h, son='lead', g=1.):
        return [E(b, s, '%s_%d' % (son, m), g, l * 60 / N['bpm'] / 4) for b, s, m, l in h]
    nappe_ev = [E(b, 0, 'nappe_%d' % b, 1.) for b in range(4)]
    rhodes_ev = [E(b, 0, 'rhodes_%d' % b, 1.) for b in range(4)] + [E(b, 10, 'rhodes_%d' % b, .45) for b in range(4)]
    stabs = [E(b, s, 'stab_%d' % b, 1. if s in (2, 10) else .8) for b in range(4) for s in (2, 6, 10, 14)]
    # —— la BATTERIE selon le genre
    if trap:
        kick_g = [E(b, s, 'kick', g) for b in range(4) for s, g in ((0, 1), (7, .8), (10, .9))] + [E(3, 14, 'kick', .7)]
        kick_groove = [E(b, s, 'kick', g) for b in range(4) for s, g in ((0, 1), (10, .8))]
        clap = [E(b, 8, 'clap', 1.) for b in range(4)] + [E(b, 8, 'caisse', .5) for b in range(4)]
        hats = motif(range(0, 16, 2), 'hat', [1, .55])
        hats_d = []
        for b in range(4):
            for s in range(0, 16, 2): hats_d.append(E(b, s, 'hat', .9 if s % 4 == 0 else .55))
            for k in range(3): hats_d.append(E(b, 12 + k * 4 / 3, 'hat', .5 + .1 * k))      # triolets en fin de mesure
        ohat = [E(b, 14, 'ohat', .6) for b in range(4)]
    elif dnb:
        brk = [(0, 'kick', 1), (4, 'clap', 1), (10, 'kick', .9), (12, 'clap', 1), (7, 'caisse', .3), (15, 'caisse', .35)]
        kick_g = [E(b, s, son, g) for b in range(4) for s, son, g in brk if son == 'kick']
        kick_groove = kick_g
        clap = [E(b, s, son, g) for b in range(4) for s, son, g in brk if son != 'kick']
        hats = motif(range(0, 16, 2), 'hat', [1, .6])
        hats_d = motif(range(16), 'hat', [1, .45, .7, .45])
        ohat = [E(b, 6, 'ohat', .5) for b in range(4)]
    else:
        kick_g = quatre_temps(); kick_groove = kick_g
        clap = [E(b, s, 'clap', 1.) for b in range(4) for s in (4, 12)]
        hats = motif((2, 6, 10, 14), 'ohat', [.8])
        hats_d = motif(range(16), 'hat', [.9, .45, .7, .45])
        ohat = motif((2, 6, 10, 14), 'ohat', [.75])
    rides = motif(range(0, 16, 2), 'ride', [.8, .5])
    shak = motif(range(16), 'shaker', [.8, .4, .6, .4])
    fill = roulement('caisse', 3, 0, 16, (4, 2, 1, .5), .25, 1.) + [E(3, 0, 'montee1', 1.)]
    fill_kick = [E(3, s, 'kick', 1.) for s in (0, 4)]
    roll = [E(b, s + k * .5, 'hat', .35 + .1 * k) for b in range(4) for s in (6, 14) for k in range(4)]   # le DRIFT : des roulements
    build = (roulement('caisse', 0, 0, 16, (4,), .3, .45) + roulement('caisse', 1, 0, 16, (2,), .45, .6) +
             roulement('caisse', 2, 0, 16, (1,), .6, .8) + roulement('caisse', 3, 0, 16, (.5,), .8, 1.))
    build_kick = [E(b, s, 'kick', .9) for b in range(3) for s in ((0, 4, 8, 12) if b < 2 else (0, 2, 4, 6, 8, 10, 12, 14))]
    S = {
        'INTRO': {'rhodes': (0, [rhodes_ev]), 'nappe': (0, [nappe_ev]), 'shaker': (.3, [shak]), 'arp': (.35, [arpeges(False)]),
                  'basse': (.5, [[e for e in basse(0) if e[1] in (0, 8)] if N['basse'] != '808' else [E(b, 0, 'basse_%d' % rac[b], .8) for b in range(4)]])},
        'GROOVE': {'kick': (0, [kick_groove]), 'clap': (.3, [clap]), 'hat': (.45, [hats]), 'ohat': (.3, [ohat]),
                   'basse': (0, [basse(0)]), 'arp': (.4, [arpeges(False), arpeges(True)]), 'nappe': (0, [nappe_ev]),
                   'stab': (.7, [stabs]), 'shaker': (.55, [shak]), 'roll': (0, [roll])},
        'MONTEE': {'caisse': (0, [build]), 'kick': (0, [build_kick]), 'nappe': (0, [nappe_ev]), 'arp': (0, [arpeges(True)]),
                   'fx': (0, [[E(0, 0, 'montee4', 1.)]]), 'hat': (0, [hats_d])},
        'DROP': {'kick': (0, [kick_g]), 'clap': (0, [clap]), 'hat': (0, [hats_d]), 'ohat': (0, [ohat]), 'ride': (0, [[], rides, rides]),
                 'basse': (0, [basse(0), basse(1), basse(1)]), 'stab': (0, [stabs]), 'nappe': (0, [nappe_ev]),
                 'lead': (0, [hook_ev(hooks[0]), hook_ev(hooks[1]), hook_ev(hooks[2]) + hook_ev(hooks[2], 'leadh', .55)]),
                 'arp': (0, [arpeges(True)]), 'fx': (0, [[E(0, 0, 'crash', .8)]]), 'roll': (0, [roll])},
        'BREAK': {'rhodes': (0, [rhodes_ev]), 'nappe': (0, [nappe_ev]), 'pluck': (0, [hook_ev(hooks[0], 'pluck', .9), hook_ev(hooks[1], 'pluck', .9)]),
                  'fx': (0, [[E(0, 0, 'descente', .7)]])},
        'ROULEMENT': {'caisse': (0, [fill]), 'kick': (0, [fill_kick]), 'nappe': (0, [nappe_ev])},
    }
    META = {'kick': ('bat', 1, 0), 'clap': ('bat', 1, 0), 'caisse': ('bat', 1, 0), 'hat': ('bat', 0, 0), 'ohat': ('bat', 0, 0),
            'ride': ('bat', 0, 0), 'shaker': ('bat', 0, 0), 'roll': ('bat', 0, 1), 'basse': ('basse', 1, 0), 'stab': ('harm', 0, 0),
            'nappe': ('harm', 0, 0), 'rhodes': ('harm', 0, 0), 'arp': ('arp', 0, 0), 'pluck': ('arp', 0, 0), 'lead': ('lead', 0, 0),
            'fx': ('fx', 0, 0)}
    sections = {}
    for nom, pistes in S.items():
        sections[nom] = {p: {'minI': mi, 'variantes': vs} for p, (mi, vs) in pistes.items()}
    meta = {p: {'bus': b, 'sol': bool(so), 'roll': bool(ro)} for p, (b, so, ro) in META.items()}
    return sections, meta

# ======================================================================================== LA BANQUE DE SONS
def sons_requis(sections):
    noms = set()
    for sec in sections.values():
        for p in sec.values():
            for v in p['variantes']:
                for e in v: noms.add(e[2])
    return noms

def fabrique(nom, N, de):
    """un son de la banque d'après son nom (« basse_45 », « stab_2 », « lead_81 »…)"""
    bpm = N['bpm']; lgM = 240 / bpm
    k0 = N['timbre']['kick']
    if nom == 'kick': return st(kick_lourd(de, *k0))
    if nom == 'clap': return clap_large(de)
    if nom == 'caisse': return st(caisse_build(de))
    if nom == 'hat': return st(hat(de, False, N['timbre']['hat']))
    if nom == 'ohat': return st(hat(de, True, N['timbre']['hat'] - 1000))
    if nom == 'ride': return st(ride(de))
    if nom == 'shaker': return st(perc_shaker(de))
    if nom == 'crash': return st(crash_long(de))
    if nom == 'montee1': return montee(de, 1, bpm)
    if nom == 'montee4': return montee(de, 4, bpm)
    if nom == 'descente': return st(descente(de, bpm))
    if nom == 'impact': return impact(de)
    if nom == 'crashinv': return st(crash_inverse(de, bpm))
    if nom == 'subdrop': return st(sub_drop(de))
    typ, _, x = nom.partition('_'); x = int(x)
    if typ == 'basse':
        if N['basse'] == '808': return st(basse_808(de, x))
        if N['basse'] == 'reese': return st(reese(de, x))
        return st(basse_roulante(de, x))
    if typ == 'stab': return stab(de, N['acc'][x] + [N['acc'][x][0] + 12])
    if typ == 'nappe': return nappe(de, N['acc'][x] + [N['acc'][x][0] - 12], lgM)
    if typ == 'rhodes': return rhodes_acc(de, N['acc'][x], lgM * 1.5)
    if typ == 'pluck':
        return cloche(de, x) if N['pluck'] == 'cloche' else pluck(de, x)
    if typ in ('lead', 'leadh'):
        m = x + (12 if typ == 'leadh' else 0)
        return lead_saw(de, m, 2.4, 5, 16, 1.8 if N['lead'] == 'saw_sale' else 1.0)
    raise ValueError(nom)

def planche(N, noms):
    """tous les sons bout à bout (60 ms de silence entre deux), avec leur adresse"""
    de = Des(700 + len(noms)); morceaux = []; index = {}; t = 0.; gap = int(.06 * SR)
    for nom in sorted(noms):
        L, R = fabrique(nom, N, de); L = np.asarray(L, float); R = np.asarray(R, float)
        f = int(.004 * SR); L[-f:] *= np.linspace(1, 0, f); R[-f:] *= np.linspace(1, 0, f)
        index[nom] = [round(t, 5), round(len(L) / SR, 5)]
        morceaux.append((L, R)); t += (len(L) + gap) / SR
    PL = np.concatenate([np.r_[l, np.zeros(gap)] for l, r in morceaux]); PR = np.concatenate([np.r_[r, np.zeros(gap)] for l, r in morceaux])
    sons = {nom: morceaux[i] for i, nom in enumerate(sorted(noms))}
    return PL, PR, index, sons

# ======================================================================================== L'APERÇU + LE CALIBRAGE
CIBLES = {'kick': -15, 'clap': -21, 'caisse': -26, 'hat': -29, 'ohat': -29, 'ride': -31, 'shaker': -32, 'roll': -33,
          'basse': -18, 'stab': -23, 'nappe': -27, 'rhodes': -24, 'arp': -28, 'pluck': -25, 'lead': -20, 'fx': -26}

def rendre_section(N, sections, meta, sons, sec, act=0, gains=None, pistes=None, mesures=4, I=1.):
    bpm = N['bpm']; pas = 15 / bpm; n = int((mesures * 240 / bpm + 4) * SR)
    B = {k: [np.zeros(n), np.zeros(n)] for k in ('bat', 'basse', 'harm', 'arp', 'lead', 'fx')}; kicks = []
    for p, P in sections[sec].items():
        if pistes and p not in pistes: continue
        if meta[p]['roll']: continue
        if P['minI'] > I: continue
        v = P['variantes'][min(act, len(P['variantes']) - 1)]; g0 = (gains or {}).get(p, 1.)
        for rep in range(mesures // 4):
            for b, s, son, g, d, gl in v:
                t = (rep * 4 + b) * 240 / bpm + s * pas; L, R = sons[son]
                if d > 0:
                    m = min(len(L), int((d + .06) * SR)); e = np.ones(m); r = int(.06 * SR); e[-r:] = np.linspace(1, 0, r); L = L[:m] * e; R = R[:m] * e
                i = int(t * SR); m = min(len(L), n - i); bus = B[meta[p]['bus']]
                bus[0][i:i + m] += L[:m] * g * g0; bus[1][i:i + m] += R[:m] * g * g0
                if son == 'kick': kicks.append(t)
    duck = pompe(n, kicks, .6, .12)
    for k in ('basse', 'harm', 'arp', 'lead'): B[k][0] *= duck; B[k][1] *= duck
    L = sum(B[k][0] for k in B); R = sum(B[k][1] for k in B)
    sL = B['harm'][0] * .5 + B['lead'][0] * .35 + B['arp'][0] * .5; sR = B['harm'][1] * .5 + B['lead'][1] * .35 + B['arp'][1] * .5
    rL, rR = reverbe(sL, sR, 2.2, 6000, .025, Des(9)); L = L + rL * .3; R = R + rR * .3
    return L, R

def calibrer(N, sections, meta, sons):
    gains = {}
    for p in meta:
        sec = 'DROP' if p in sections['DROP'] else next((s for s in ('GROOVE', 'BREAK', 'INTRO', 'MONTEE') if p in sections[s]), None)
        if sec is None or meta[p]['roll']: continue
        vs = sections[sec][p]['variantes']; act = next((i for i, v in enumerate(vs) if v), 0)   # la 1re variante qui joue (la ride est muette à l'acte 0)
        L, R = rendre_section(N, sections, meta, sons, sec, act, None, [p])
        r = np.sqrt(((L ** 2 + R ** 2) / 2).mean()) + 1e-9
        gains[p] = round(float(10 ** (CIBLES.get(p, -26) / 20) / r), 4)
    gains['roll'] = gains.get('hat', .3) * .8
    return gains

def ecrit_m4a(nom, L, R, debit=160000):
    wav = os.path.join(SORTIE_C, nom + '.wav'); ecrit_wav(wav, L, R)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', str(debit), '-q', '127', wav, os.path.join(SORTIE_C, nom + '.m4a')], check=True)
    os.remove(wav); return 'assets/audio/music/compo/' + nom + '.m4a'

def soft(L, R, cible=-12):
    rms = np.sqrt(((L ** 2 + R ** 2) / 2).mean()) + 1e-9; k = 10 ** (cible / 20) / rms
    return np.tanh(L * k * 1.1) * .92, np.tanh(R * k * 1.1) * .92

# (2026-10-01) LES TIGES : chaque composition découpée en COUCHES de 4 mesures sans couture, pour LE STUDIO (studio.html) —
# on y mélange la batterie d'un niveau avec la basse d'un autre, le DÉ les tire par rôle. Même facteur pour toutes les tiges d'un
# niveau : leurs volumes relatifs restent ceux du morceau.
TIGES = [('DROP', 1, ('kick', 'clap', 'hat', 'ohat', 'ride'), 'BATTERIE', 'rythme'),
         ('GROOVE', 0, ('kick', 'clap', 'hat', 'ohat', 'shaker'), 'BATTERIE GROOVE', 'rythme'),
         ('DROP', 1, ('basse',), 'BASSE', 'basse'),
         ('DROP', 1, ('stab', 'nappe'), 'ACCORDS', 'harmonie'),
         ('BREAK', 0, ('rhodes', 'nappe'), 'RHODES', 'harmonie'),
         ('DROP', 1, ('arp',), 'ARPEGE', 'melodie'),
         ('DROP', 1, ('lead',), 'LEAD', 'melodie'),
         ('BREAK', 0, ('pluck',), 'PLUCK', 'melodie')]

def tiges(nom, N, sections, meta, sons, gains):
    lg = int(4 * 240 / N['bpm'] * SR)
    def boucle(L, R):   # la queue (réverbe, notes tenues) repliée sur le début : la boucle ne coupe rien
        L = L.copy(); R = R.copy(); q = len(L) - lg; L[:q] += L[lg:]; R[:q] += R[lg:]; return L[:lg], R[:lg]
    Lm, Rm = boucle(*rendre_section(N, sections, meta, sons, 'DROP', 1, gains, None, 4, 1.))
    k = 10 ** (-14 / 20) / (np.sqrt(((Lm ** 2 + Rm ** 2) / 2).mean()) + 1e-9)
    out = []
    for sec, act, pistes, titre, role in TIGES:
        pistes = [p for p in pistes if p in sections[sec]]
        if not pistes: continue
        L, R = boucle(*rendre_section(N, sections, meta, sons, sec, act, gains, pistes, 4, 1.))
        if np.abs(L).max() < 1e-4: continue
        L = np.tanh(L * k * 1.05) * .95; R = np.tanh(R * k * 1.05) * .95
        f = ecrit_m4a('%s-tige-%s' % (nom, titre.lower().replace(' ', '-')), L, R)
        out.append({'nom': titre, 'role': role, 'f': f, 'dur': lg / SR})
    print('   tiges : ' + ', '.join(t['nom'] for t in out))
    return out

def rendre(nom):
    os.makedirs(SORTIE_C, exist_ok=True)
    N = NIVEAUX_C[nom](); sections, meta = composer(N)
    noms = sons_requis(sections) | {'impact', 'crashinv', 'subdrop', 'montee1', 'crash'}
    print('…', nom, len(noms), 'sons', flush=True)
    PL, PR, index, sons = planche(N, noms)
    f_sons = ecrit_m4a(nom + '-sons', PL, PR, 192000)
    gains = calibrer(N, sections, meta, sons)
    # l'APERÇU : INTRO → GROOVE → MONTÉE → DROP (acte 0) → DROP (acte 1) → BREAK : la chanson, telle que la course la jouerait
    morceaux = [rendre_section(N, sections, meta, sons, s, a, gains, None, 4, I) for s, a, I in
                (('INTRO', 0, .6), ('GROOVE', 0, 1), ('MONTEE', 0, 1), ('DROP', 0, 1), ('DROP', 1, 1), ('BREAK', 0, 1))]
    lg = int(4 * 240 / N['bpm'] * SR); L = np.zeros(lg * len(morceaux) + 4 * SR); R = np.zeros_like(L)
    for k, (l, r) in enumerate(morceaux): L[k * lg:k * lg + len(l)] += l; R[k * lg:k * lg + len(r)] += r
    L, R = soft(L, R, -12); f_ap = ecrit_m4a(nom + '-apercu', L, R)
    print('   planche %.1f s · aperçu %.1f s · gains %s' % (len(PL) / SR, len(L) / SR, ', '.join('%s %.2f' % kv for kv in sorted(gains.items()))))
    tg = tiges(nom, N, sections, meta, sons, gains)
    return {'tiges': tg, 'id': 'compo-' + nom, 'niveau': nom, 'bpm': N['bpm'], 'ton': N['ton'], 'cle': N['cle'], 'sons': f_sons, 'index': index,
            'apercu': f_ap, 'sections': sections, 'meta': meta, 'gains': gains}

if __name__ == '__main__':
    os.makedirs(SORTIE_C, exist_ok=True)
    fdon = os.path.join(SORTIE_C, 'compo-donnees.js'); tout = {}
    if os.path.exists(fdon):
        try: tout = json.loads(open(fdon).read().split('=', 1)[1].rstrip().rstrip(';'))
        except Exception: tout = {}
    for nom in (sys.argv[1:] or list(NIVEAUX_C)): tout[nom] = rendre(nom)
    open(fdon, 'w').write('window.COMPO=' + json.dumps(tout, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('ok →', fdon)
