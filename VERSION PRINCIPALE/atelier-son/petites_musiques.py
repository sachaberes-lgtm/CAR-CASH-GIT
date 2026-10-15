# -*- coding: utf-8 -*-
"""LES PETITES MUSIQUES (2026-10-14) — Léo : « faisons d'autres petites musiques ; sois toujours original, ne fais pas les mêmes choses ».
Après le LOBBY « CHRIS » (piano groove · bossa · lo-fi · synthés · ambiant), cinq mondes qu'on n'a JAMAIS faits — chacun sa mesure, ses
instruments, sa forme (aucune ne reprend le déroulé intro/A/A/B/respiration/A des lobbys Chris, ni le piano à l'envers, ni le break) :
  VALSE LENTE — valse musette en 3/4 : accordéon (trois anches désaccordées), harpe « poum-tchak-tchak », contrebasse pincée qui
                descend (ré · do · si♭ · la), glockenspiel au dernier passage.                                     ré mineur → fa, 84
  REFLETS     — minimalisme : deux marimbas jouent la MÊME cellule, l'une décalée d'une double croche, puis de deux, puis de trois
                (elles « déphasent ») ; une clarinette tient de longues notes par-dessus.                        si♭ lydien, 116
  SOLEIL BAS  — dub : une seule frappe au 3e temps (le « one drop »), la guitare qui gratte les contretemps, l'orgue qui « bulle »,
                une basse qui chante, le mélodica ; au milieu, la section DUB : tout se retire, l'écho s'emballe.     sol mineur, 72
  PIXEL DOUX  — berceuse de console 8 bits : carré à 25 % qui chante avec son vibrato, son ÉCHO (la même phrase trois doubles
                croches plus tard, à mi-voix), triangle en 4 bits, bruit en guise de batterie, arpèges éclairs.   fa majeur, 96
  SIFFLEUR    — ballade soul en 12/8 (tout va par trois) : orgue à tirettes dans sa cabine tournante (Leslie), Rhodes paresseux,
                balais ; un homme SIFFLE la mélodie.                                                                mi♭ majeur, 58
Chaque mélodie reste calme, de celles qui reposent (« tu arrives à atteindre une belle mélodie qui repose, joue sur ça »).
Tout est synthétisé ici (aucun échantillon, aucune mélodie empruntée) ; chaque morceau se referme sans couture (queue repliée).
  <venv>/python atelier-son/petites_musiques.py [id…]
Sortie : assets/audio/music/petites-musiques/*.m4a + petites-donnees.js (window.PETITES_MUS) → bibliotheque.html, onglet « Petites musiques ».
"""
import os, sys, json, subprocess, time
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from boucles import SR, hz, Des, filtre, passe_bande, env, tri, carre, scie, karplus, reverbe, echo, wobble, ecrit_wav, pics
from boucles8 import chorus, crush, kick_chip, bruit_chip, rim as rim_sec
from vapeurs import contrebasse, balai, rhodes_p
from lobby_chris import Main, celesta, basse_ronde, kick_doux, caisse_douce, hat, shaker, nappe

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, 'assets', 'audio', 'music', 'petites-musiques')
QUEUE = 7.0


# ================================================================================ LA PARTITION (n'importe quelle mesure)
class Partition:
    """une grille de pas : `pt` pas par temps (4 = doubles croches, 3 = triolets de croches pour le 12/8), `tm` temps par mesure"""
    def __init__(s, bpm, pt, tm, mesures, graine, swing=0.):
        s.bpm = bpm; s.temps = 60 / bpm; s.pt = pt; s.pm = pt * tm; s.dc = s.temps / pt; s.mes = mesures; s.sw = swing
        s.lg = mesures * s.pm * s.dc; s.n = int(round(s.lg * SR)) + int(QUEUE * SR)
        s.de = Des(graine); s.h = Main(graine + 1); s.hb = Main(graine + 2, 5, .25); s.r = np.random.default_rng(graine + 3)
        s.bus = {}; s.acc = []; s.mel = []

    def t(s, m, p=0.):
        sw = s.sw * s.dc if (s.pt == 4 and float(p).is_integer() and int(p) % 2 == 1) else 0.
        return (m * s.pm + p) * s.dc + sw

    def b(s, nom):
        if nom not in s.bus: s.bus[nom] = [np.zeros(s.n), np.zeros(s.n)]
        return s.bus[nom]

    def pose(s, nom, t, sig, g=1., pan=0.):
        i = int(round(t * SR))
        if i >= s.n or g == 0: return
        x = sig[:s.n - i] * g; a = (pan + 1) * np.pi / 4; B = s.b(nom)
        B[0][i:i + len(x)] += x * np.cos(a); B[1][i:i + len(x)] += x * np.sin(a)

    def pose2(s, nom, t, L, R, g=1.):
        i = int(round(t * SR)); k = min(len(L), s.n - i)
        if k <= 0: return
        B = s.b(nom); B[0][i:i + k] += L[:k] * g; B[1][i:i + k] += R[:k] * g

    def note_acc(s, m, p0, p1, notes): s.acc.append((s.t(m, p0), s.t(m, p1), list(notes)))     # pour la vérification d'harmonie
    def note_mel(s, t, n, d): s.mel.append((t, n, d))


def finir(P, gains, envois, rev=(2.6, .4), bande=.0016, lp=11000, pre=None):
    """bande qui pleure, réverbe commune, queue repliée sur le début (aucune couture), −15 dB RMS, crête −1 dBFS"""
    B = P.bus
    for k in envois:
        if k in B and bande:
            B[k][0], B[k][1] = wobble(B[k][0], B[k][1], bande, .31)
            B[k][0], B[k][1] = wobble(B[k][0], B[k][1], 4e-5, 5.1)
    if pre: pre(P)
    sL = sum(B[k][0] * g for k, g in envois.items() if k in B); sR = sum(B[k][1] * g for k, g in envois.items() if k in B)
    rL, rR = reverbe(sL, sR, rev[0], 5000, .025, de=P.de)
    L = sum(B[k][0] * g for k, g in gains.items() if k in B) + rL * rev[1]
    R = sum(B[k][1] * g for k, g in gains.items() if k in B) + rR * rev[1]
    L = filtre(filtre(L, 'high', 30), 'low', lp); R = filtre(filtre(R, 'high', 30), 'low', lp)
    lg = int(round(P.lg * SR)); q = P.n - lg
    L[:q] += L[lg:]; R[:q] += R[lg:]; L = L[:lg]; R = R[:lg]
    k = 10 ** (-15 / 20) / max(np.sqrt(((L ** 2 + R ** 2) / 2).mean()), 1e-9); L *= k; R *= k
    plaf = 10 ** (-1 / 20)
    return np.tanh(L / plaf * 1.03) * plaf, np.tanh(R / plaf * 1.03) * plaf


def glisse(m, nn, prec, tau=.04):
    t = np.arange(nn) / SR
    return np.full(nn, hz(m)) if prec is None else hz(m) + (hz(prec) - hz(m)) * np.exp(-t / tau)


def vibrato(f, prof=.005, vit=5.3, retard=.22):
    t = np.arange(len(f)) / SR
    return f * (1 + prof * np.sin(2 * np.pi * vit * t) * np.clip((t - retard) / .3, 0, 1))


def osc_sin(f): return np.sin(2 * np.pi * np.cumsum(f) / SR)


# ================================================================================ LES INSTRUMENTS NOUVEAUX
def accordeon(m, dur):
    """l'accordéon musette : trois anches, l'une juste, une un peu haute, une un peu basse — c'est leur battement, le « mouillé »"""
    nn = int((dur + .15) * SR); t = np.arange(nn) / SR; f = hz(m)
    s = carre(f, nn, .42) * .42 + scie(f * 2 ** (13 / 1200), nn) * .3 + scie(f * 2 ** (-11 / 1200), nn) * .3
    s = filtre(s, 'low', 2700); s = s + .5 * passe_bande(s, 800, 1600)
    return s * env(nn, .045, .7, .85, .09, dur) * (1 + .05 * np.sin(2 * np.pi * 1.1 * t)) * .3


def harpe(m, dur, de):
    return filtre(karplus(m, dur + .8, .78, .9988, de), 'high', 120) * .62


def glock(m, dur=1.4):
    nn = int((dur + .6) * SR); t = np.arange(nn) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 1.1) + .22 * np.sin(2 * np.pi * 2.756 * f * t) * np.exp(-t / .3) + .08 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / .07)
    return filtre(s * (1 - np.exp(-t / .001)), 'low', 7000) * .4


def marimba(m, vel=1.):
    nn = int(1.3 * SR); t = np.arange(nn) / SR; f = hz(m); d = .85 * 2 ** (-(m - 60) / 24)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / d) + .3 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t / (d * .16)) + .06 * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-t / (d * .05))
    s += filtre(np.random.default_rng(int(m)).standard_normal(nn), 'low', 1800) * np.exp(-t / .003) * .05     # la mailloche
    return s * (1 - np.exp(-t / .0015)) * .5 * vel


def clarinette(m, dur, prec=None):
    """la clarinette : presque que des harmoniques impaires (le carré), sombre, un souffle, un vibrato à peine"""
    nn = int((dur + .25) * SR); f = vibrato(glisse(m, nn, prec, .05), .003, 4.8, .35)
    s = filtre(filtre(carre(f, nn, .5), 'low', 1500), 'low', 2600)
    s += passe_bande(np.random.default_rng(int(m) + 9).standard_normal(nn), 1200, 3500) * .025
    return s * env(nn, .06, .8, .82, .12, dur) * .38


def melodica(m, dur, prec=None):
    """le mélodica : l'anche qu'on souffle — nasillard, chaud, un peu d'air"""
    nn = int((dur + .2) * SR); f = vibrato(glisse(m, nn, prec, .03), .004, 5.5, .3)
    s = carre(f, nn, .3) * .5 + scie(f, nn) * .3
    s = filtre(s, 'low', 2600); s = s + .5 * passe_bande(s, 1000, 2200)
    s += passe_bande(np.random.default_rng(int(m) + 3).standard_normal(nn), 1500, 5000) * .03
    return s * env(nn, .025, .7, .8, .1, dur) * .3


def orgue(notes, dur, rotor=6.2, att=.012):
    """l'orgue à tirettes (16', 8', 4', 2⅔') dans sa cabine tournante : le son tourne d'un côté à l'autre et ondule"""
    nn = int((dur + .2) * SR); t = np.arange(nn) / SR; s = np.zeros(nn)
    for n in notes:
        f = hz(n); s += .45 * np.sin(np.pi * f * t) + np.sin(2 * np.pi * f * t) + .55 * np.sin(4 * np.pi * f * t) + .28 * np.sin(6 * np.pi * f * t)
    s = s / max(1, len(notes)) * env(nn, att, 9, 1, .07, dur)
    s[:int(.004 * SR)] += np.random.default_rng(len(notes)).standard_normal(int(.004 * SR)) * .08     # le « clic » de la touche
    w = 2 * np.pi * rotor * t; i = np.arange(nn)
    L = np.interp(i - (.0006 * SR) * np.sin(w), i, s) * (1 + .22 * np.sin(w))
    R = np.interp(i - (.0006 * SR) * np.sin(w + np.pi), i, s) * (1 + .22 * np.sin(w + np.pi))
    return filtre(L, 'low', 4500) * .32, filtre(R, 'low', 4500) * .32


def sifflet(m, dur, prec=None):
    """un homme qui siffle : une note presque pure, l'air autour, il glisse d'une note à l'autre et vibre sur les longues"""
    nn = int((dur + .2) * SR); f = vibrato(glisse(m, nn, prec, .06), .009, 5.6, .25)
    s = osc_sin(f) + .04 * osc_sin(2 * f)
    rg = np.random.default_rng(int(m) + 21)
    air = passe_bande(rg.standard_normal(nn), hz(m) * .8, hz(m) * 1.3) * .35 + filtre(rg.standard_normal(nn), 'high', 3000) * .02
    return (s + air) * env(nn, .07, .9, .8, .12, dur) * .38


def skank(notes, de, dur=.13):
    """la guitare du reggae : l'accord gratté sec, étouffé aussitôt, sur le contretemps"""
    nn = int((dur + .05) * SR); x = np.zeros(nn)
    for j, n in enumerate(notes):
        c = karplus(n, dur + .05, .65, .995, de)[:nn - int(j * .006 * SR)]; i = int(j * .006 * SR); x[i:i + len(c)] += c
    return filtre(x * env(nn, .001, 9, 1, .02, dur), 'high', 350) * .3


def pulse(m, dur, duty=.25, prec=None, vib=True):
    """le canal carré d'une console : l'enveloppe en 16 marches, le vibrato qui arrive, un peu de grain"""
    nn = int((dur + .05) * SR); f = glisse(m, nn, prec, .02)
    if vib: f = vibrato(f, .006, 6., .16)
    e = np.floor(env(nn, .004, .5, .6, .03, dur) * 15) / 15
    return filtre(crush(carre(f, nn, duty) * e, 7, 2), 'low', 6000) * .22


def tri_chip(m, dur):
    nn = int((dur + .02) * SR); x = np.round(tri(hz(m), nn) * 7.5) / 7.5
    return filtre(x * env(nn, .002, 9, 1, .02, dur), 'low', 4000) * .4


# ================================================================================ 1. VALSE LENTE (3/4)
def valse():
    """la valse musette, lente : la basse descend d'un demi-ton en demi-ton (ré · do · si♭ · la, la complainte), la harpe fait
    « poum » … « tchak, tchak », l'accordéon chante ; 2e partie en fa majeur ; au dernier passage le glockenspiel double et la harpe s'égrène"""
    P = Partition(84, 4, 3, 32, 5101); de, h, r = P.de, P.h, P.r
    A = [(38, [57, 62, 65]), (36, [57, 62, 65]), (34, [57, 62, 65]), (33, [55, 61, 64]),
         (38, [57, 62, 65]), (43, [58, 62, 64]), (33, [55, 62, 64]), (33, [55, 61, 64])]
    A2 = A[:6] + [(33, [55, 61, 64]), (38, [57, 62, 65])]                                   # le 2e A se pose sur ré
    Bg = [(41, [57, 60, 65]), (40, [55, 60, 64]), (38, [57, 62, 65]), (45, [57, 60, 64]),
          (46, [58, 62, 65]), (45, [57, 60, 65]), (43, [58, 62, 65]), (33, [55, 61, 64])]
    melA = [(0, 0, 69, 8), (0, 8, 74, 4), (1, 0, 72, 8), (1, 8, 69, 4), (2, 0, 70, 4), (2, 4, 69, 4), (2, 8, 65, 4), (3, 0, 64, 12),
            (4, 0, 69, 8), (4, 8, 74, 4), (5, 0, 76, 8), (5, 8, 74, 4), (6, 0, 74, 4), (6, 4, 69, 4), (6, 8, 67, 4), (7, 0, 73, 12)]
    melA2 = melA[:12] + [(6, 0, 76, 4), (6, 4, 73, 4), (6, 8, 67, 4), (7, 0, 74, 12)]
    melB = [(0, 0, 69, 4), (0, 4, 72, 4), (0, 8, 77, 4), (1, 0, 76, 12), (2, 0, 74, 8), (2, 8, 69, 4), (3, 0, 72, 12),
            (4, 0, 74, 4), (4, 4, 77, 4), (4, 8, 74, 4), (5, 0, 72, 12), (6, 0, 70, 8), (6, 8, 74, 4), (7, 0, 73, 8), (7, 8, 76, 4)]
    forme = [(A, melA, 'a'), (A2, melA2, 'a2'), (Bg, melB, 'b'), (A, melA, 'a3')]
    for s_i, (gr, mel, nom) in enumerate(forme):
        m0 = s_i * 8
        for k, (ba, ch) in enumerate(gr):
            m = m0 + k; P.note_acc(m, 0, 12, [ba] + ch)
            P.pose('basse', P.hb.t(P.t(m, 0)), contrebasse(ba + (12 if ba < 36 else 0), 1.4 * P.temps, de) * 1.3, P.hb.g(.7), 0)   # la contrebasse pincée, le « poum »
            if nom == 'a3' or (nom == 'b' and k % 2): P.pose('basse', P.hb.t(P.t(m, 8)), contrebasse(ba + (12 if ba < 36 else 0) + 7, .8 * P.temps, de) * 1.3, P.hb.g(.4), 0)
            if nom != 'a3':                                                                      # la harpe : « tchak, tchak » sur 2 et 3
                for p in (4, 8):
                    for j, n in enumerate(ch): P.pose('harpe', h.t(P.t(m, p) + j * .018, 4), harpe(n, P.temps * 1.2, de), h.g(.42 if p == 4 else .34), -.2 + .2 * j)
            else:                                                                                 # au dernier passage : elle s'égrène
                arp = [ch[0], ch[1], ch[2], ch[1] + 12, ch[2], ch[1]]
                for i, n in enumerate(arp): P.pose('harpe', h.t(P.t(m, 2 * i), 4), harpe(n, P.temps * 1.6, de), h.g(.38 + .05 * (i == 0)), -.3 + .12 * i)
            if nom != 'a':
                for p in (4, 8): P.pose('bat', P.hb.t(P.t(m, p)), balai(de), P.hb.g(.22 if p == 4 else .16), .3)
        prec = None
        for (b, p, n, l) in mel:
            t = P.t(m0 + b, p); d = l * P.dc; P.note_mel(t, n, d)
            P.pose('acc', h.t(t, 6), accordeon(n, d * .96), h.g(.8 if nom != 'a3' else .9), .1)
            if nom == 'a3': P.pose('glock', h.t(t, 3), glock(n, d + .5), h.g(.32), .35)
            if nom == 'b' and l >= 12:                                                              # la 2e partie : le glock répond sur les tenues
                for j, x in enumerate(sorted({c for c in gr[b][1] if (c - n) % 12 not in (0, 1, 2, 10, 11)})[-2:]):
                    P.pose('glock', h.t(P.t(m0 + b, p + 4 + 3 * j), 3), glock(x + 12, .8), h.g(.2), .35)
            prec = n
    return P, finir(P, dict(acc=2., harpe=1., basse=.4, glock=1., bat=.7),
                    dict(acc=.35, harpe=.45, glock=.6, bat=.2), rev=(2.4, .38), bande=.0015, lp=10000)


# ================================================================================ 2. REFLETS (minimalisme, marimbas qui déphasent)
def reflets():
    """deux marimbas jouent la MÊME cellule de huit doubles croches ; la 2e entre décalée d'un pas, puis glisse de deux, puis de
    trois : le motif change de forme sans qu'une note change. Les accords tournent toutes les deux mesures ; la clarinette tient
    ses notes longues ; tout se retire à la fin pour que la 1re marimba reparte seule."""
    P = Partition(116, 4, 4, 32, 5202); de, h, r = P.de, P.h, P.r
    CH = [[62, 65, 69, 70, 72, 74, 77], [62, 65, 67, 69, 70, 74, 77], [63, 65, 67, 69, 70, 74, 79], [62, 65, 67, 69, 72, 74, 77]]   # B♭maj9 · Sol m9 · Mi♭maj9(#11) · Fa 6/9
    RAC = [34, 43, 39, 41]
    CELL = [0, 3, 1, 4, 2, 3, 1, 5]
    mel1 = [(0, 0, 74, 12), (0, 12, 72, 4), (1, 0, 70, 16), (2, 0, 69, 8), (2, 8, 70, 8), (3, 0, 74, 16),
            (4, 0, 79, 8), (4, 8, 77, 8), (5, 0, 74, 16), (6, 0, 72, 8), (6, 8, 69, 8), (7, 0, 67, 16)]
    mel2 = [(0, 0, 77, 4), (0, 4, 74, 4), (0, 8, 72, 8), (1, 0, 74, 16), (2, 0, 70, 4), (2, 4, 74, 4), (2, 8, 77, 8), (3, 0, 77, 16),
            (4, 0, 79, 8), (4, 4, 77, 4), (4, 8, 74, 8), (5, 0, 70, 16), (6, 0, 69, 8), (6, 8, 72, 8), (7, 0, 74, 16)]
    for m in range(32):
        c = (m // 2) % 4; ch = CH[c]; P.note_acc(m, 0, 16, ch + [RAC[c]])
        dec2 = 0 if m < 4 else (1 if m < 16 else (2 if m < 24 else 3))
        fin = m >= 30
        for i in range(16):
            n = ch[CELL[i % 8] % len(ch)]
            P.pose('mar1', h.t(P.t(m, i), 3), marimba(n, .8 if i % 4 else 1.), h.g(.55), -.45)
            if m >= 4 and not fin:
                n2 = ch[CELL[(i - dec2) % 8] % len(ch)]
                P.pose('mar2', h.t(P.t(m, i), 3), marimba(n2 - (12 if m >= 16 and i % 8 == 0 else 0), .75), h.g(.45), .45)
        if 8 <= m < 30 and m % 2 == 0:                                                          # la clarinette basse : une fondamentale qui tient
            P.pose('clar', P.t(m, 0), clarinette(RAC[c] + 12, 2 * P.pm * P.dc * .95), .55, -.1)
        if m >= 8 and not fin:
            for i in range(16):
                P.pose('bat', P.hb.t(P.t(m, i)), shaker(de), P.hb.g(.35 if i % 4 == 2 else .18), -.3)
        if m >= 16 and not fin:
            P.pose('bat', P.hb.t(P.t(m, 0)), kick_doux(de), .55, 0)
            if m % 2: P.pose('bat', P.hb.t(P.t(m, 10)), kick_doux(de), .35, 0)
        if m >= 16 and m < 30 and m % 2 == 0:
            l, rr = nappe([x for x in ch if x < 72][-3:], 2 * P.pm * P.dc, de, 1300, 1.2, 2.)
            P.pose2('pad', P.t(m, 0), l, rr, .5)
    for m0, mel, glk in ((8, mel1, False), (16, mel2, False), (24, mel1, True)):
        prec = None
        for (b, p, n, l) in mel:
            if m0 + b >= 31: continue
            t = P.t(m0 + b, p); d = l * P.dc; P.note_mel(t, n, d)
            P.pose('clar', h.t(t, 8), clarinette(n, d * .97, prec), h.g(.85), .1)
            if glk and p == 0: P.pose('glock', h.t(t, 3), glock(n, 1.2), h.g(.22), .3)
            prec = n
    return P, finir(P, dict(mar1=1., mar2=1., clar=1., bat=.45, pad=.5, glock=1.),
                    dict(mar1=.3, mar2=.3, clar=.4, pad=.5, glock=.6), rev=(3., .4), bande=.0012, lp=11500)


# ================================================================================ 3. SOLEIL BAS (dub)
def soleil_bas():
    """le dub : la grosse caisse et le rim ensemble sur le 3e temps (le « one drop »), la guitare sur les contretemps, l'orgue qui
    « bulle », la basse qui CHANTE. Au milieu, la section dub : la mélodie se tait, la guitare part dans l'écho, l'orgue frappe une
    fois par mesure et l'écho s'emballe ; puis tout revient."""
    P = Partition(72, 4, 4, 24, 5303, swing=.2); de, h, r = P.de, P.h, P.r
    CH = [[58, 62, 65, 69], [58, 62, 63, 67], [55, 58, 62, 63], [57, 60, 62, 66]]      # Sol m9 · Mi♭maj7 · Do m9 · Ré7
    BAS = [[(2, 43, 2), (4, 46, 2), (6, 50, 4), (12, 48, 2), (14, 46, 2)], [(2, 39, 2), (4, 43, 2), (6, 46, 4), (12, 46, 2), (14, 43, 2)],
           [(2, 36, 2), (4, 39, 2), (6, 43, 4), (12, 41, 2), (14, 39, 2)], [(2, 38, 2), (4, 42, 2), (6, 45, 4), (10, 48, 2), (12, 45, 2), (14, 42, 2)]]
    RAC = [43, 39, 36, 38]
    mel = [(0, 2, 74, 2), (0, 4, 77, 6), (0, 12, 74, 4), (1, 0, 75, 8), (1, 8, 74, 4), (1, 12, 70, 4),
           (2, 2, 72, 2), (2, 4, 75, 4), (2, 8, 74, 8), (3, 0, 72, 8), (3, 8, 69, 4), (3, 12, 66, 4),
           (4, 2, 70, 2), (4, 4, 74, 4), (4, 8, 77, 4), (4, 12, 79, 4), (5, 0, 79, 8), (5, 8, 77, 4), (5, 12, 74, 4),
           (6, 0, 75, 6), (6, 6, 74, 2), (6, 8, 72, 8), (7, 0, 69, 8), (7, 8, 66, 8)]
    dub = lambda m: 12 <= m < 16
    for m in range(24):
        c = m % 4; ch = CH[c]; P.note_acc(m, 0, 16, ch + [RAC[c]])
        for (st, n, ln) in BAS[c]:                                                                # la basse qui chante (sauf la 1re mesure)
            if m == 0 and st < 8: continue
            P.pose('basse', P.hb.t(P.t(m, st)), basse_ronde(n - 12, ln * P.dc * .95), P.hb.g(.8), 0)
        t3 = P.hb.t(P.t(m, 8))                                                                     # le one drop
        P.pose('bat', t3, kick_doux(de), .9, 0); P.pose('bat', t3, rim_sec(de) * .5, .7, .2)
        if dub(m): P.pose('dub', t3, rim_sec(de) * .5, .9, .2)
        if not dub(m) or m % 2:
            for i in range(0, 16, 2): P.pose('bat', P.hb.t(P.t(m, i)), hat(de), P.hb.g(.35 if i % 4 else .2), .3)
            if r.random() < .4: P.pose('bat', P.hb.t(P.t(m, 15)), hat(de), .2, .3)
        if m >= 1:                                                                                  # la guitare sur les contretemps
            for i in (4, 12):
                sk = skank(ch, de)
                if dub(m): P.pose('dub', h.t(P.t(m, i), 3), sk, h.g(.8), .45)
                else: P.pose('gtr', h.t(P.t(m, i), 3), sk, h.g(.8), .45)
        if not dub(m):                                                                              # l'orgue qui bulle
            for i in (6, 7, 14, 15):
                l, rr = orgue([n - 12 for n in ch[1:]], .09, 6.5, .004); P.pose2('org', h.t(P.t(m, i), 3), l, rr, .55 if i % 2 == 0 else .4)
        else:
            l, rr = orgue(ch, 1.4 * P.temps); P.pose2('dub', P.t(m, 0), l, rr, .7)
        if m == 15: P.pose('dub', P.t(m, 12), souffle_dub(de), .5, 0)
    for m0, var in ((4, 0), (16, 1)):
        prec = None
        for (b, p, n, l) in mel:
            t = P.t(m0 + b, p); d = l * P.dc; P.note_mel(t, n, d)
            P.pose('mel', h.t(t, 10), melodica(n, d * .95, prec), h.g(.85), -.1)
            if var: P.pose('mel', h.t(t, 10) + .006, melodica(n - 12, d * .95, prec - 12 if prec else None), h.g(.3), .2)
            prec = n
    for (b, p, n, l) in mel[:3]:                                                                      # dans la section dub, la mélodie n'est qu'un écho
        P.pose('dub', P.t(13 + b, p), melodica(n, l * P.dc * .9), .6, -.2)

    def bain_dub(P):
        B = P.bus
        if 'dub' in B:
            eL, eR = echo(B['dub'][0], B['dub'][1], P.temps * .75, .62, 9, True, 1900); B['dub'][0] += eL; B['dub'][1] += eR
        for k in ('gtr', 'bat'):
            if k in B:
                eL, eR = echo(B[k][0], B[k][1], P.temps * .75, .25, 3, True, 2200); B[k][0] += eL * .35; B[k][1] += eR * .35
    return P, finir(P, dict(basse=.75, bat=.45, gtr=1., org=1., mel=1.4, dub=.9),
                    dict(gtr=.25, org=.3, mel=.35, dub=.5, bat=.12), rev=(1.6, .35), bande=.0018, lp=9500, pre=bain_dub)


def souffle_dub(de):
    nn = int(1.5 * SR); t = np.arange(nn) / SR
    return passe_bande(de.bruit(nn), 600, 3000) * (t / 1.5) ** 2 * .15


# ================================================================================ 4. PIXEL DOUX (berceuse 8 bits)
def pixel_doux():
    """la console qui chante une berceuse : le carré à 25 % porte la mélodie et son vibrato ; l'autre canal la répète trois doubles
    croches plus tard, à mi-voix (le vieux truc des musiciens de cartouche pour faire une réverbe) ; le triangle tient la basse ;
    dans la 2e partie le 2e canal égrène des arpèges éclair ; au dernier passage il chante à la tierce."""
    P = Partition(96, 4, 4, 24, 5404); de, h, r = P.de, P.h, P.r
    A = [[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55], [53, 57, 60], [50, 53, 57], [43, 46, 50], [48, 52, 55]]      # Fa Rém Si♭ Do Fa Rém Solm Do
    Bg = [[46, 50, 53], [48, 52, 55], [45, 48, 52], [50, 53, 57], [43, 46, 50], [45, 48, 52], [46, 50, 53], [48, 52, 55]]     # Si♭ Do Lam Rém Solm Lam Si♭ Do
    melA = [(0, 0, 69, 4), (0, 4, 72, 4), (0, 8, 77, 6), (0, 14, 76, 2), (1, 0, 74, 8), (1, 8, 69, 8), (2, 0, 70, 4), (2, 4, 74, 4), (2, 8, 77, 4),
            (2, 12, 74, 4), (3, 0, 72, 12), (3, 12, 67, 4), (4, 0, 69, 4), (4, 4, 72, 4), (4, 8, 77, 6), (4, 14, 79, 2), (5, 0, 77, 8), (5, 8, 74, 8),
            (6, 0, 70, 4), (6, 4, 74, 4), (6, 8, 74, 4), (6, 12, 70, 4), (7, 0, 76, 8), (7, 8, 72, 8)]
    melB = [(0, 0, 74, 12), (0, 12, 72, 4), (1, 0, 67, 8), (1, 8, 72, 8), (2, 0, 76, 8), (2, 8, 72, 8), (3, 0, 69, 12), (3, 12, 65, 4),
            (4, 0, 70, 8), (4, 8, 74, 8), (5, 0, 72, 8), (5, 8, 76, 8), (6, 0, 77, 6), (6, 6, 74, 2), (6, 8, 70, 8), (7, 0, 72, 8), (7, 8, 67, 8)]
    GAMME = [5, 7, 9, 10, 0, 2, 4]

    def tierce_dessous(n):
        k = 0; x = n - 1
        while k < 2:
            if x % 12 in GAMME: k += 1
            if k < 2: x -= 1
        return x
    for s_i, (gr, mel, nom) in enumerate(((A, melA, 'a'), (Bg, melB, 'b'), (A, melA, 'a2'))):
        m0 = s_i * 8
        for k, ch in enumerate(gr):
            m = m0 + k; P.note_acc(m, 0, 16, ch)
            ra = ch[0] - 12
            for i in range(0, 16, 2):                                                             # le triangle : la basse qui marche en croches
                P.pose('tri', P.t(m, i), tri_chip(ra + (12 if i % 4 == 2 else 0) + (7 if i in (6, 14) and nom != 'a' else 0), P.dc * 1.7), .9, 0)
            if nom == 'b':                                                                         # les arpèges éclair (doubles-croches de l'accord)
                for i in range(16):
                    P.pose('ch2', P.t(m, i), pulse(ch[i % 3] + 12, P.dc * .9, .125, vib=False), .32, .35)
            if nom != 'a' or k >= 4:                                                               # le bruit : charley, et la caisse aux 2e et 4e temps
                for i in range(0, 16, 2): P.pose('bruit', P.hb.t(P.t(m, i)), bruit_chip(de, .02), .16 if i % 4 else .1, .2)
                if nom != 'a':
                    for i in (4, 12): P.pose('bruit', P.hb.t(P.t(m, i)), bruit_chip(de, .09), .35, 0)
                    for i in (0, 8): P.pose('bruit', P.hb.t(P.t(m, i)), kick_chip() * .5, .5, 0)
        prec = None
        for (b, p, n, l) in mel:
            t = P.t(m0 + b, p); d = l * P.dc; P.note_mel(t, n, d)
            P.pose('ch1', t, pulse(n, d * .92, .25, prec), 1., -.15)
            if nom != 'b': P.pose('ch2', t + 3 * P.dc, pulse(n, d * .92, .125, prec), .42, .35)         # l'écho de cartouche
            if nom == 'a2' and l >= 4: P.pose('ch2', t, pulse(tierce_dessous(n), d * .92, .5, None), .4, .35)   # la tierce
            prec = n
    return P, finir(P, dict(ch1=1., ch2=1., tri=.45, bruit=.6), dict(ch1=.15, ch2=.2, tri=0.), rev=(1.4, .3), bande=0, lp=7500)


# ================================================================================ 5. SIFFLEUR (ballade soul en 12/8)
def siffleur():
    """tout va par trois : quatre temps par mesure, chacun coupé en triolets. L'orgue à tirettes tourne dans sa cabine, le Rhodes
    joue paresseusement le dernier triolet de chaque temps, les balais frottent, la basse se pose sur le 1 et sur le 3 —
    et quelqu'un siffle la mélodie, en glissant d'une note à l'autre."""
    P = Partition(58, 3, 4, 18, 5505); de, h, r = P.de, P.h, P.r
    V = {'Eb': [51, 55, 58, 62], 'Gm7': [53, 55, 58, 62], 'Ab': [51, 55, 56, 60], 'Bbs': [51, 53, 56, 58], 'Cm7': [51, 55, 58, 60],
         'Fm7': [51, 53, 56, 60], 'Bb7': [50, 53, 56, 58]}
    RAC = {'Eb': 39, 'Gm7': 43, 'Ab': 44, 'Bbs': 46, 'Cm7': 36, 'Fm7': 41, 'Bb7': 46}
    grille = ['Ab', 'Bbs'] + ['Eb', 'Gm7', 'Ab', 'Bbs', 'Eb', 'Cm7', 'Fm7', 'Bb7'] + ['Ab', 'Gm7', 'Fm7', 'Bbs'] + ['Eb', 'Gm7', 'Ab', 'Bbs']
    melA = [(0, 0, 70, 5), (0, 5, 67, 1), (0, 6, 70, 3), (0, 9, 74, 3), (1, 0, 74, 6), (1, 6, 72, 3), (1, 9, 70, 3), (2, 0, 72, 9), (2, 9, 67, 3),
            (3, 0, 68, 6), (3, 6, 70, 6), (4, 0, 70, 5), (4, 5, 67, 1), (4, 6, 70, 3), (4, 9, 75, 3), (5, 0, 74, 6), (5, 6, 72, 3), (5, 9, 70, 3),
            (6, 0, 72, 6), (6, 6, 68, 3), (6, 9, 65, 3), (7, 0, 70, 9), (7, 9, 74, 3)]
    melB = [(0, 0, 75, 6), (0, 6, 72, 6), (1, 0, 74, 9), (1, 9, 70, 3), (2, 0, 72, 6), (2, 6, 68, 3), (2, 9, 72, 3), (3, 0, 70, 12)]
    for m, nom in enumerate(grille):
        ch = V[nom]; P.note_acc(m, 0, 12, ch + [RAC[nom]])
        l, rr = orgue(ch, P.pm * P.dc + .05, 6.0 if m >= 2 else 1.2, .25 if m < 2 else .02)        # l'intro : la cabine tourne lentement
        P.pose2('org', P.t(m, 0), l, rr, .55 if m >= 2 else .4 + .1 * m)
        if m >= 2:
            P.pose('basse', P.hb.t(P.t(m, 0)), basse_ronde(RAC[nom] - 12 + 12, 5 * P.dc), P.hb.g(.7), 0)
            P.pose('basse', P.hb.t(P.t(m, 6)), basse_ronde(RAC[nom] - 12 + 12 + 7 if (RAC[nom] + 7) % 12 in {x % 12 for x in ch} else RAC[nom], 2.5 * P.dc), P.hb.g(.5), 0)
            P.pose('basse', P.hb.t(P.t(m, 11)), basse_ronde(RAC[nom] - 12 + 12, .9 * P.dc), P.hb.g(.35), 0)
            for i in (2, 5, 8, 11):                                                                   # le Rhodes : le dernier triolet de chaque temps
                if r.random() < .2: continue
                for j, n in enumerate(ch[1:]): P.pose('rh', h.t(P.t(m, i), 8) + j * .007, rhodes_p(n + 12, 1.5 * P.dc, h.g(.45)), .13, -.25 + .2 * j)
            for i in range(12):                                                                       # les balais par trois, la caisse sur 2 et 4
                P.pose('bat', P.hb.t(P.t(m, i)), balai(de), P.hb.g(.22 if i % 3 == 0 else .1), .3)
            for i in (3, 9): P.pose('bat', P.hb.t(P.t(m, i)), caisse_douce(de) * .6, P.hb.g(.5), -.05)
            for i in (0, 7): P.pose('bat', P.hb.t(P.t(m, i)), kick_doux(de), P.hb.g(.6 if i == 0 else .35), 0)
    for m0, mel, g in ((2, melA, 1.), (10, melB, .9), (14, melA[:11], 1.)):
        prec = None
        for (b, p, n, l) in mel:
            t = P.t(m0 + b, p); d = l * P.dc; P.note_mel(t, n, d)
            P.pose('sif', h.t(t, 12), sifflet(n + 12, d * .96, prec + 12 if prec else None), h.g(.85) * g, .05)
            prec = n
    return P, finir(P, dict(org=1., basse=.5, rh=1., bat=.45, sif=1.), dict(org=.3, rh=.4, sif=.45, bat=.15), rev=(2.8, .42), bande=.0018, lp=10000)


# ================================================================================ LE CATALOGUE
MORCEAUX = [
    dict(id='pm-valse', fn=valse, titre='VALSE LENTE', style='Valse musette en 3/4 · accordéon, harpe, contrebasse', bpm=84, cle='ré mineur', ton=-2,
         idee="La basse descend d'un demi-ton à chaque mesure (ré · do · si♭ · la), la harpe fait « poum … tchak, tchak », l'accordéon chante ; la 2e partie passe en fa majeur ; au dernier passage le glockenspiel double et la harpe s'égrène."),
    dict(id='pm-reflets', fn=reflets, titre='REFLETS', style='Minimalisme · deux marimbas qui déphasent, clarinette', bpm=116, cle='si♭ lydien', ton=-2,
         idee="Deux marimbas jouent la même cellule de huit notes ; la 2e entre décalée d'une double croche, puis glisse de deux, puis de trois — le motif change de forme sans qu'une note change. Une clarinette tient de longues notes."),
    dict(id='pm-soleil', fn=soleil_bas, titre='SOLEIL BAS', style='Dub · one drop, guitare en contretemps, mélodica, écho', bpm=72, cle='sol mineur', ton=-6,
         idee="Une seule frappe au 3e temps, la guitare sur les contretemps, l'orgue qui « bulle », une basse qui chante, le mélodica ; au milieu la section dub : tout se retire et l'écho s'emballe."),
    dict(id='pm-pixel', fn=pixel_doux, titre='PIXEL DOUX', style='Berceuse 8 bits · carré, triangle, écho de cartouche', bpm=96, cle='fa majeur', ton=1,
         idee="Le carré chante avec son vibrato, l'autre canal le répète trois doubles croches plus tard (la réverbe des vieilles consoles), le triangle marche ; arpèges éclair dans la 2e partie, chant à la tierce à la fin."),
    dict(id='pm-siffleur', fn=siffleur, rangement='chris', titre='SIFFLEUR', style='Ballade soul en 12/8 · orgue Leslie, Rhodes, balais, sifflement', bpm=58, cle='mi♭ majeur', ton=-1,
         idee="Tout va par trois. L'orgue à tirettes tourne dans sa cabine, le Rhodes joue paresseusement le dernier triolet de chaque temps, les balais frottent — et quelqu'un siffle la mélodie."),
]


def verifie(P):
    """une note de mélodie tenue qui n'est pas dans l'accord ET frotte d'un demi-ton contre lui"""
    pb = 0
    for (t, n, d) in P.mel:
        if d < P.dc * 1.5: continue
        ch = next((a[2] for a in P.acc if a[0] - 1e-6 <= t < a[1]), None)
        if ch is None: continue
        pcs = {x % 12 for x in ch}
        if n % 12 not in pcs and any((n - x) % 12 in (1, 11) for x in pcs): pb += 1
    return pb


# (14/10, Léo : « SIFFLEUR top pour lobby Chris ») : un morceau peut être RANGÉ ailleurs — son fichier part dans le dossier de ce
# rangement et la bibliothèque l'affiche dans cet onglet (`sec`), il quitte « Petites musiques ».
RANGEMENTS = {'chris': 'lobby-chris'}


def rendre(M):
    t0 = time.time(); os.makedirs(SORTIE, exist_ok=True)
    P, (L, R) = M['fn']()
    dos = RANGEMENTS.get(M.get('rangement'), 'petites-musiques'); ici = os.path.join(os.path.dirname(SORTIE), dos)
    wav = os.path.join(ici, M['id'] + '.wav'); m4a = os.path.join(ici, M['id'] + '.m4a')
    ecrit_wav(wav, L, R)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '160000', '-q', '127', wav, m4a], check=True); os.remove(wav)
    dur = len(L) / SR
    print('%-12s %3d BPM  %2d mesures  %5.1f s  crête %.1f dB  frottements %d  (%.0f s)' % (M['id'], M['bpm'], P.mes, dur,
          20 * np.log10(max(np.abs(L).max(), np.abs(R).max())), verifie(P), time.time() - t0))
    return {'id': M['id'], 'titre': M['titre'], 'style': M['style'], 'bpm': M['bpm'], 'cle': M['cle'], 'ton': M['ton'], 'idee': M['idee'],
            'f': 'assets/audio/music/%s/%s.m4a?v=%d' % (dos, M['id'], int(time.time())), 'dur': round(dur, 5), 'pics': pics(L, R, 300),
            'sec': M.get('rangement', 'pm')}


if __name__ == '__main__':
    filtres = sys.argv[1:]
    js = os.path.join(SORTIE, 'petites-donnees.js'); faits = {}
    if os.path.exists(js):
        try: faits = {p['id']: p for p in json.loads(open(js).read().split('=', 1)[1].rstrip().rstrip(';'))}
        except Exception: faits = {}
    for M in MORCEAUX:
        if filtres and not any(f in M['id'] for f in filtres): continue
        faits[M['id']] = rendre(M)
    os.makedirs(SORTIE, exist_ok=True)
    open(js, 'w').write('window.PETITES_MUS=' + json.dumps([faits[M['id']] for M in MORCEAUX if M['id'] in faits], ensure_ascii=False) + ';\n')
    print('→', js)
