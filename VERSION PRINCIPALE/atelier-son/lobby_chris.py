# -*- coding: utf-8 -*-
"""LE LOBBY « CHRIS » (2026-10-14) — Léo : « Chris (C418) ; inspi nouvelle musique lobby, plusieurs versions qui peuvent faire tenir
mon jeu pendant 10 ans » puis « vrm celle de Chris elle est magnifique ».

CHRIS (C418, Minecraft – Volume Alpha, piste 15) est la suite de CLARK : la même tendresse — accords de 7e et de 9e tenus, un piano
doux, une nappe analogique chaude, la bande qui pleure — mais une PERCUSSION douce y entre et finit par groover, presque funky.
Rien n'est repris : ni mélodie, ni grille, ni son. On garde l'IDÉE, et ce qui fait tenir une musique dix ans :
  · des morceaux LONGS (1 min 40 à 2 min 10) qui ne bouclent qu'à la fin — pas huit mesures qui reviennent toutes les 20 s ;
  · de l'air : la mélodie parle peu, se pose, repart ; aucune attaque dure, rien d'aigu ;
  · la forme de Chris : ça commence NU (piano + nappe), la percussion arrive en bois et en shaker, puis le groove, puis il se retire
    (la respiration), puis tout revient — et la dernière mesure retombe dans la première (queue de réverbe repliée : aucune couture) ;
  · la main humaine : chaque note un peu à côté, un peu plus ou moins fort ; le piano roule ses accords ; la mélodie se décale au 2e
    passage (elle « pousse » avant le temps) et s'orne au 3e — on ne l'entend jamais deux fois pareille.
Le PIANO FEUTRÉ est nouveau (aucun échantillon) : partiels inharmoniques, deux cordes qui battent, chaque partiel s'éteint à son
rythme et en deux temps (le coup, puis la résonance), feutre plus rond quand on joue doux, étouffoir ; cuit une fois par (note, force).

  <venv>/python atelier-son/lobby_chris.py            → les cinq
  <venv>/python atelier-son/lobby_chris.py matin      → seulement les ids qui contiennent « matin »
Sortie : assets/audio/music/lobby-chris/chris-*.m4a + chris-donnees.js (window.CHRIS), lus par bibliotheque.html (section « Lobby Chris »,
à part du Lobby — Léo : « ne mets pas ça dans le même dossier que l'autre, fais ça séparément »).
"""
import os, sys, json, subprocess, time
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from boucles import SR, hz, Des, filtre, passe_bande, balaye, env, tri, carre, supersaw, plus, reverbe, echo, pompe, wobble, ecrit_wav, pics
from boucles8 import chorus, rim as rim_sec, shaker as shaker_sec, guitare, crash, voix, crush, pluck_saw
from boucles import clap
from petits import guitare_claire
from vapeurs import balai, contrebasse
from inspi import trompette, basse_808
from petits import basse_slap, craquement
from vapeurs import rhodes_p, vibra

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, 'assets', 'audio', 'music', 'lobby-chris')   # leur dossier à elles (Léo : « fais ça séparément »)
QUEUE = 8.0


class Main:
    """la main du musicien : chaque note tombe un peu à côté, un peu plus ou moins fort"""
    def __init__(s, graine, ms=7., force=.2): s.r = np.random.default_rng(graine); s.ms = ms; s.f = force
    def t(s, t, ms=None): return max(0., t + s.r.normal(0, (s.ms if ms is None else ms) / 1000))
    def g(s, g): return g * (1 - s.f / 2 + s.f * s.r.random())


# ================================================================================ LES INSTRUMENTS
_PN = {}
_FORCES = (.42, .62, .84)


def piano_note(m, vb):
    """le PIANO FEUTRÉ, une note libre (pédale tenue), cuite une fois par (note, force)"""
    k = (m, vb)
    if k in _PN: return _PN[k]
    vel = _FORCES[vb]; f0 = hz(m)
    T = float(np.clip(6.5 * 2 ** (-(m - 52) / 15), 1.5, 9.))          # grave : la note chante longtemps ; aigu : elle s'éteint vite
    L = int((T * 1.1 + .25) * SR); t = np.arange(L) / SR
    r = np.random.default_rng(7000 + m * 5 + vb)
    B = 2e-4 * 2 ** ((m - 60) / 18)                                      # l'inharmonicité de la corde (plus raide dans l'aigu)
    fc = 900 + 3600 * vel ** 1.5                                         # le feutre : plus on joue doux, plus le son est rond
    s = np.zeros(L)
    for kk in range(1, 26):
        fk = kk * f0 * np.sqrt(1 + B * kk * kk)
        if fk > 7000: break
        a = kk ** -1.1 * abs(np.sin(np.pi * kk / 7.4)) ** .6 / (1 + (fk / fc) ** 2)   # marteau à 1/7,4 de la corde : le 7e se tait
        tau = T / (1 + .5 * (kk - 1)) * r.uniform(.85, 1.15)
        dec = .6 * np.exp(-t / (tau * .17)) + .4 * np.exp(-t / tau)                # deux temps : le coup, puis la résonance
        dt = r.uniform(.5, 1.8)                                                    # deux cordes, désaccordées d'un cent : elles battent
        s += a * dec * (np.sin(2 * np.pi * fk * t + r.uniform(0, 6.3)) + .8 * np.sin(2 * np.pi * fk * 2 ** (dt / 1200) * t + r.uniform(0, 6.3)))
    s *= 1 - np.exp(-t / .004)
    s /= np.abs(s).max() + 1e-9
    nn = int(.06 * SR); tt = np.arange(nn) / SR                                    # le « toc » du feutre sur la corde
    s[:nn] += filtre(r.standard_normal(nn), 'low', 500 + 800 * vel) * np.exp(-tt / .009) * .07 + np.sin(2 * np.pi * 95 * tt) * np.exp(-tt / .025) * .05
    s *= vel ** 1.15
    _PN[k] = s
    return s


def piano(m, vel, dur=None):
    vb = 0 if vel < .52 else (1 if vel < .73 else 2)
    s = piano_note(int(m), vb) * (vel / _FORCES[vb])
    if dur is not None and dur * SR < len(s) - .3 * SR:                            # l'étouffoir retombe : le son s'éteint en 0,1 s
        i = int(dur * SR); fin = min(len(s), i + int(.45 * SR)); s = s[:fin].copy()
        s[i:] *= np.exp(-np.arange(fin - i) / SR / .09)
    return s


def nappe(notes, dur, de, fc=1100, att=.8, rel=1.6):
    """la nappe analogique chaude : trois scies par note, à peine désaccordées, très filtrées"""
    nn = int((dur + rel) * SR); L = np.zeros(nn); R = np.zeros(nn)
    for n in notes:
        l, r = supersaw(n, dur + rel, 3, 7, de); L[:len(l)] += l[:nn]; R[:len(r)] += r[:nn]
    e = env(nn, att, 9, 1, rel / 2.5, dur)
    L = filtre(filtre(L * e, 'low', fc), 'low', fc * 1.6); R = filtre(filtre(R * e, 'low', fc), 'low', fc * 1.6)
    return L / max(1, len(notes)) ** .5, R / max(1, len(notes)) ** .5


def celesta(m, dur=1.6):
    nn = int((dur + .8) * SR); t = np.arange(nn) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 1.3) + .28 * np.sin(2 * np.pi * 4.0 * f * t) * np.exp(-t / .16) + .07 * np.sin(2 * np.pi * 10.1 * f * t) * np.exp(-t / .04)
    s *= 1 - np.exp(-t / .002)
    return filtre(s, 'low', 4500) * .55


def lead_doux(m, dur, prec=None):
    """le petit synthé (l'esprit des Moog de C418) : triangle + un peu de carré, glisse depuis la note d'avant, vibrato tardif"""
    nn = int((dur + .4) * SR); t = np.arange(nn) / SR
    f = hz(m) if prec is None else hz(m) + (hz(prec) - hz(m)) * np.exp(-t / .04)
    f = f * (1 + .004 * np.sin(2 * np.pi * 5.1 * t) * np.clip((t - .2) / .35, 0, 1))
    s = tri(f, nn) * .8 + carre(f, nn, .32) * .22
    s = filtre(filtre(s, 'low', 1500), 'low', 2400)
    return s * env(nn, .03, .9, .72, .16, dur) * .75


def basse_ronde(m, dur, glisse=None):
    nn = int((dur + .15) * SR); t = np.arange(nn) / SR
    f = np.full(nn, hz(m)) if glisse is None else hz(m) + (hz(glisse) - hz(m)) * np.exp(-t / .05)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + .2 * np.sin(2 * ph) + .07 * np.sin(3 * ph)
    return filtre(np.tanh(s * env(nn, .007, .8, .55, .06, dur) * 1.4), 'low', 850) * .8


def basse_sub(m, dur, glisse=None):
    nn = int((dur + .2) * SR); t = np.arange(nn) / SR
    ph = 2 * np.pi * hz(m) * t
    return (np.sin(ph) + .1 * np.sin(2 * ph)) * env(nn, .03, 2.5, .7, .12, dur) * .85


def basse_funk(m, dur, de, pop=False):
    return plus(filtre(basse_slap(m, dur, de, pop), 'low', 2200) * .5, basse_ronde(m, dur) * .75)


# --------------------------------------------------------------- la batterie DOUCE (rien ne claque : du bois, du feutre, du sable)
def kick_doux(de):
    n = int(.45 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(48 + 70 * np.exp(-t / .03)) / SR) * np.exp(-t / .2)
    s += filtre(de.bruit(n), 'low', 1600) * np.exp(-t / .003) * .1
    return np.tanh(s * 1.5) * .75


def caisse_douce(de, ton=190):
    n = int(.32 * SR); t = np.arange(n) / SR
    corps = np.sin(2 * np.pi * ton * t) * np.exp(-t / .05) * .5 + np.sin(2 * np.pi * ton * 1.7 * t) * np.exp(-t / .03) * .18
    grain = passe_bande(de.bruit(n), 1100, 6500) * np.exp(-t / .085) * .6
    return filtre(corps + grain, 'low', 6500) * (1 - np.exp(-t / .001))


def hat(de, ouvert=False):
    n = int((.4 if ouvert else .1) * SR); t = np.arange(n) / SR
    return filtre(filtre(de.bruit(n), 'high', 7000) * np.exp(-t / (.16 if ouvert else .022)), 'low', 11000) * .35


def bois(de, f=820):
    n = int(.12 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / .03) + .3 * np.sin(2 * np.pi * 2.65 * f * t) * np.exp(-t / .01)
            + filtre(de.bruit(n), 'low', 3000) * np.exp(-t / .002) * .2) * .5


def conga(de, f=196):
    n = int(.35 * SR); t = np.arange(n) / SR
    ff = f * (1 + .22 * np.exp(-t / .012))
    return (np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t / .13) + passe_bande(de.bruit(n), 600, 3500) * np.exp(-t / .008) * .25) * .55


def snap(de):
    n = int(.12 * SR); t = np.arange(n) / SR
    return (passe_bande(de.bruit(n), 1400, 5200) * np.exp(-t / .018) + .3 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t / .006)) * .6


def rim(de): return filtre(rim_sec(de), 'low', 4800) * .55
def shaker(de): return filtre(shaker_sec(de), 'low', 9000)


def souffle(dur, de):
    """un souffle qui s'ouvre sur une mesure : il annonce le retour du groove"""
    nn = int(dur * SR); t = np.arange(nn) / SR
    return balaye(de.bruit(nn), 300 * 10 ** (t / dur)) * (t / dur) ** 2 * .22


# --------------------------------------------------------------- v3 : chaque version a SES instruments (« c'est vraiment les mêmes »)
def flute(m, dur, prec=None):
    """la flûte : un son presque pur, le souffle qui l'entoure, le petit « tchi » de l'attaque, un vibrato qui arrive tard"""
    nn = int((dur + .3) * SR); t = np.arange(nn) / SR; rg = np.random.default_rng(int(m) * 7 + 1)
    f = np.full(nn, hz(m)) if prec is None else hz(m) + (hz(prec) - hz(m)) * np.exp(-t / .03)
    f = f * (1 + .005 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - .25) / .3, 0, 1))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + .2 * np.sin(2 * ph) + .05 * np.sin(3 * ph)
    s = s + passe_bande(rg.standard_normal(nn), hz(m) * 1.5, min(hz(m) * 6, 15000)) * .07
    tchi = filtre(rg.standard_normal(nn), 'high', 2000) * np.exp(-t / .02) * .05
    return s * env(nn, .06, .9, .85, .12, dur) * .55 + tchi


def nylon(notes, dur, de, gratte=.012):
    """la guitare nylon de la bossa : l'accord gratté vite, court, la main qui étouffe"""
    nn = int((dur + .25) * SR); x = np.zeros(nn)
    for j, n in enumerate(notes):
        c = guitare_claire(n, dur + .25, de)[:nn - int(j * gratte * SR)]; i = int(j * gratte * SR); x[i:i + len(c)] += c * (1 - .08 * j)
    return x * env(nn, .002, 9, 1, .06, dur) * .55


def pluck(m, dur, de, clair=2600):
    """le petit synthé pincé des arpèges (l'esprit des Moog)"""
    l, r = pluck_saw(m, dur, clair, 380, .085, de); return (l + r) * .5


def basse_carree(m, dur):
    nn = int((dur + .08) * SR)
    return filtre(carre(hz(m), nn, .4), 'low', 650) * env(nn, .004, .25, .5, .04, dur) * .55


def basse_808b(m, dur, prec=None): return basse_808(m, dur, prec) * .9


def clave(de): return bois(de, 1480) * .75
def balai2(de): return balai(de) * .9
def clap_doux(de): return filtre(clap(de, .16), 'low', 6000) * .55
def hat_elec(de):
    n = int(.06 * SR); t = np.arange(n) / SR; return filtre(de.bruit(n), 'high', 8500) * np.exp(-t / .012) * .3
def kick_lofi(de):
    n = int(.5 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(44 + 60 * np.exp(-t / .04)) / SR) * np.exp(-t / .28) + filtre(de.bruit(n), 'low', 1200) * np.exp(-t / .004) * .12
    return filtre(np.tanh(s * 1.8), 'low', 3000) * .8
def caisse_lofi(de):
    n = int(.4 * SR); t = np.arange(n) / SR
    x = np.r_[caisse_douce(de, 180), np.zeros(n)][:n] * 1.1 + passe_bande(de.bruit(n), 800, 4000) * np.exp(-t / .16) * .25
    return filtre(crush(x, 9, 2), 'low', 5000)
def hat_lofi(de): return filtre(hat(de), 'low', 7000) * .8
def pouls(de):
    n = int(.6 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * 52 * t) * np.exp(-t / .3) * (1 - np.exp(-t / .004)) * .8


FRAPPE = {'kick': kick_doux, 'caisse': caisse_douce, 'hat': hat, 'ohat': lambda de: hat(de, True), 'bois': bois,
          'conga': conga, 'snap': snap, 'rim': rim, 'shaker': shaker, 'crash': lambda de: filtre(crash(de, 1.8), 'low', 7000) * .45,
          'clave': clave, 'balai': balai2, 'clap': clap_doux, 'hat_elec': hat_elec, 'kick_lofi': kick_lofi, 'caisse_lofi': caisse_lofi,
          'hat_lofi': hat_lofi, 'pouls': pouls}
FORCE = {'x': 1., 'X': 1.25, 'o': .5, 'g': .22}
BAT = {   # niveau → instrument → seize doubles croches (PREMIER MATIN ; les autres ont leur propre « kit »)
    1: {'bois': '..x.....x..x....', 'shaker': 'x.o.x.o.x.o.x.o.', 'conga': '......x.......x.'},
    2: {'kick': 'x.......x.x.....', 'caisse': '....x.......x...', 'hat': 'x.o.x.o.x.o.x.o.', 'shaker': 'o.o.o.o.o.o.o.o.', 'bois': '..x.........x...'},
    3: {'kick': 'x.....x...x..x..', 'caisse': '....x..g.g..x..g', 'hat': 'xoxoxoxoxoxoxoxo', 'ohat': '..............x.',
        'shaker': 'o.o.o.o.o.o.o.o.', 'conga': '...x..x....x.x..'},
    'h': {'kick': 'x.........x.....', 'caisse': '........x.......', 'hat': 'x.x.x.x.x.x.x.x.', 'shaker': 'o.o.o.o.o.o.o.o.', 'conga': '......x.......x.'},
    -1: {'shaker': 'o...o...o...o...'},
}
KICKS = {2: ['x.......x.x.....', 'x.......x.......', 'x......x..x.....', 'x.......x.x...x.'],
         3: ['x.....x...x..x..', 'x..x......x.....', 'x.....x.x....x..', 'x.......x.x..x..']}


def met(p, i, c): return p[:i] + c + p[i + 1:]


# ================================================================================ LE MORCEAU
class Piece:
    """des mesures de longueur variable (le BREAK de la fin de A1 dure 5 temps, la dernière mesure de la respiration RALENTIT),
    une transposition par section (le dernier passage peut monter d'un ton)."""
    def __init__(s, V):
        s.V = V; s.bpm = V['bpm']; s.temps = 60 / s.bpm; s.dc = s.temps / 4; s.sw = V.get('swing', .1)
        s.plan = []
        for nom, gr, g0, nb, niv, tr in V['forme']:
            for k in range(nb): s.plan.append((nom, niv, gr, g0 + k, tr, k, nb))
        s.mes = len(s.plan); s.pas = [16] * s.mes; s.dcm = [s.dc] * s.mes; s.brk = -1
        for m, (nom, niv, gr, mg, tr, k, nb) in enumerate(s.plan):
            if nom == 'A1' and k == nb - 1 and V.get('break', True): s.pas[m] = 20; s.brk = m
            if nom == 'pause' and k == nb - 1 and V.get('ralenti', True): s.dcm[m] = s.dc * 1.1
        s.t0 = np.r_[0, np.cumsum([p * d for p, d in zip(s.pas, s.dcm)])]
        s.lg = float(s.t0[-1]); s.n = int(round(s.lg * SR)) + int(QUEUE * SR)
        s.de = Des(V['graine']); s.h = Main(V['graine'] + 1); s.hb = Main(V['graine'] + 2, 5, .25); s.r = np.random.default_rng(V['graine'] + 3)
        s.bus = {}; s.kicks = []; s._kick = None
        s.debut = {}
        for m, pl in enumerate(s.plan): s.debut.setdefault(pl[0], m)

    def b(s, nom):
        if nom not in s.bus: s.bus[nom] = [np.zeros(s.n), np.zeros(s.n)]
        return s.bus[nom]

    def norm(s, m, p):
        while p >= s.pas[min(m, s.mes - 1)] and m < s.mes - 1: p -= s.pas[m]; m += 1
        while p < 0 and m > 0: m -= 1; p += s.pas[m]
        return m, p

    def t(s, m, p=0.):
        m, p = s.norm(m, p); mm = min(m, s.mes - 1)
        sw = s.sw * s.dcm[mm] if (float(p).is_integer() and int(p) % 2 == 1) else 0.
        return float(s.t0[m]) + p * s.dcm[mm] + sw

    def pose(s, nom, t, sig, g=1., pan=0.):
        i = int(round(t * SR))
        if i >= s.n or g == 0: return
        x = sig[:s.n - i] * g; a = (pan + 1) * np.pi / 4; B = s.b(nom)
        B[0][i:i + len(x)] += x * np.cos(a); B[1][i:i + len(x)] += x * np.sin(a)

    def pose2(s, nom, t, L, R, g=1.):
        i = int(round(t * SR)); k = min(len(L), s.n - i)
        if k <= 0: return
        if i < 0: L, R, k, i = L[-i:], R[-i:], k + i, 0
        B = s.b(nom); B[0][i:i + k] += L[:k] * g; B[1][i:i + k] += R[:k] * g

    def items(s, m):
        nom, niv, gr, mg, tr, k, nb = s.plan[m]
        it = s.V[gr][mg]
        it = [(0, it)] if isinstance(it[0], (int, np.integer)) else list(it)
        return [(p, [n + tr for n in v]) for p, v in it]

    def accords(s):
        out = []
        for m, pl in enumerate(s.plan):
            it = s.items(m)
            for j, (p, v) in enumerate(it):
                out.append((m, p, v, (it[j + 1][0] if j + 1 < len(it) else s.pas[m]) - p, pl[1], pl[0]))
        return out

    def accord_a(s, m, p):
        m, p = s.norm(m, p); m = min(m, s.mes - 1)
        v = None
        for q, w in s.items(m):
            if q <= p or v is None: v = w
        return v


def pan_note(n): return float(np.clip((n - 62) / 30, -.45, .45))


def dans(notes, bas, haut):
    out = []
    for n in notes:
        while n > haut: n -= 12
        while n < bas: n += 12
        out.append(n)
    return sorted(set(out))


def racine(v):
    r = v[0] % 12 + 36
    return r - 12 if r > 45 else r


def joue(P, inst, t, n, dur, vel, prec=None, g=1.):
    """une note de mélodie, sur l'instrument demandé"""
    h = P.h
    if inst == 'piano': P.pose('piano', h.t(t), piano(n, h.g(vel), dur + .35), .9 * g, pan_note(n))
    elif inst == 'rhodes': P.pose('rh', h.t(t), rhodes_p(n, dur + .7, h.g(vel)), .34 * g, pan_note(n) * .6)
    elif inst == 'celesta': P.pose('celesta', h.t(t), celesta(n, dur), h.g(.5) * g, .3)
    elif inst == 'lead': P.pose('lead', h.t(t, 4), lead_doux(n, dur, prec), h.g(.5) * g, .12)
    elif inst == 'vibra': P.pose('vibra', h.t(t), vibra(n, dur + 1.4), h.g(.3) * g, -.2)
    elif inst == 'flute': P.pose('flute', h.t(t, 5), flute(n, dur, prec), h.g(.55) * g, .1)
    elif inst == 'trompette': P.pose('trompette', h.t(t, 9), trompette(n, dur, prec), h.g(.32) * g, .08)


def varie(mel, k, r, gamme):
    """le 2e passage « pousse » (quelques notes arrivent une double croche avant le temps) ; le 3e s'orne (une note voisine au-dessus)"""
    if k == 0: return [(b, p, n, l, 1.) for (b, p, n, l) in mel]
    out = []
    for (b, p, n, l) in mel:
        q, bb, ll = p, b, l
        if p in (0, 8) and l >= 4 and r.random() < .35:
            if p == 8: q, ll = 7, l + 1
            elif b > 0: bb, q, ll = b - 1, 15, l + 1
        if k >= 2 and l >= 6 and r.random() < .4:
            v = n + 1
            while v % 12 not in gamme: v += 1
            pq, pb = q - 1, bb
            if pq < 0: pb, pq = bb - 1, 15
            if pb >= 0: out.append((pb, pq, v, 1, .7))
        out.append((bb, q, n, ll, 1.))
    return out


def reponse(P, m, p, n, l, inst):
    """L'APPEL ET LA RÉPONSE : pendant que la mélodie TIENT sa note, un 2e instrument répond dans le creux — trois notes de l'accord,
    jamais à moins d'une tierce de la note tenue, et il se tait avant que la mélodie reparte."""
    r = P.r
    q = p + (4 if l < 12 else 6)
    ry = [((0, 2), (2, 2), (4, 4)), ((0, 1), (1, 1), (2, 4)), ((0, 2), (2, 1), (3, 3)), ((0, 3), (3, 3), (6, 2))][int(r.integers(4))]
    if q + ry[-1][0] + 1 > p + l: return
    v = P.accord_a(m, q)
    cand = [x for x in range(n - 9, n + 9) if x % 12 in {y % 12 for y in v} and (x - n) % 12 not in (0, 1, 2, 10, 11)]
    if len(cand) < 3: return
    i = int(r.integers(len(cand) - 2)); fig = cand[i:i + 3]
    if r.random() < .55: fig = fig[::-1]
    for (dq, dl), x in zip(ry, fig):
        joue(P, inst, P.t(m, q + dq), x, dl * P.dc, .42, None, .6)


def envers(P, m_cible, g=.5):
    """le piano À L'ENVERS : l'accord qui arrive, joué puis retourné avec sa réverbe — il aspire l'oreille vers le temps fort"""
    v = P.accord_a(m_cible, 0); notes = dans(v[1:], 55, 76); nn = int(2.2 * SR); x = np.zeros(nn)
    for n in notes:
        s = piano(n, .66); x[:min(nn, len(s))] += s[:nn]
    rL, rR = reverbe(x, x, 2.2, 4200, de=P.de)
    e = np.linspace(0, 1, nn) ** 2
    P.pose2('swell', P.t(m_cible, 0) - nn / SR, ((x * .35 + rL) * e[::-1])[::-1], ((x * .35 + rR) * e[::-1])[::-1], g)


def montee(P, m, depuis, m_cible, vel=.45):
    """quatre doubles croches qui montent vers l'accord suivant (le pianiste qui relance)"""
    nt = dans(P.accord_a(m_cible, 0)[1:], 62, 77)
    while len(nt) < 4: nt = nt + [nt[-1] + 12]
    for j, n in enumerate(nt[:4]):
        P.pose('piano', P.h.t(P.t(m, depuis + j), 3), piano(n, P.h.g(vel + .05 * j), 3 * P.dc), .55, pan_note(n))


def bat_mesure(P, m):
    """les motifs de la mesure : la base du niveau, puis ce qui la rend VIVANTE — le kick change toutes les deux mesures, la 4e mesure
    tourne (charley ouvert, fantôme), quelques fantômes au hasard, des accents qui bougent, la conga qui se décale"""
    V = P.V; r = P.r; nom, niv, gr, mg, tr, k, nb = P.plan[m]
    if nom == 'intro' and niv == 0:
        return dict(V.get('kit_intro', {'shaker': 'o.o.o.o.o.o.o.o.'})) if k >= nb - 2 else {}
    kit = V.get('kit')
    cle = 'h' if (nom == 'B' and niv == 3 and k < 4 and (kit is None or 'h' in kit)) else niv
    if kit is None: pats = dict(BAT.get(cle, {})); pats.update(V.get('bat', {}).get(cle, {}))
    else: pats = dict(kit.get(cle, {}))
    pats = {i: p for i, p in pats.items() if p.strip('.')}
    if not pats: return {}
    ki = V.get('kick_inst', 'kick'); kv = V.get('kicks', KICKS if kit is None else {})
    if niv in kv and ki in pats and cle != 'h' and not (kit is None and V.get('bat', {}).get(niv, {}).get('kick')):
        if k % 2 == 0 or P._kick is None: P._kick = kv[niv][int(r.integers(len(kv[niv])))]
        pats[ki] = P._kick
    hi = next((x for x in ('hat', 'hat_elec', 'hat_lofi') if x in pats), None)
    sn = next((x for x in ('caisse', 'caisse_lofi') if x in pats), None)
    if niv >= 2 and k % 4 == 3:
        if hi == 'hat': pats['ohat'] = met(pats.get('ohat', '.' * 16), 14, 'x')
        if sn and niv == 3: pats[sn] = met(pats[sn], 15, 'g')
    if niv == 3 and sn:
        for i in (3, 7, 9, 11, 15):
            if pats[sn][i] == '.' and r.random() < .14: pats[sn] = met(pats[sn], i, 'g')
    if hi:
        p = pats[hi]
        for i, c in enumerate(p):
            if c == 'o' and r.random() < .15: p = met(p, i, 'x')
            elif c != '.' and i % 4 and r.random() < .06: p = met(p, i, '.')
        pats[hi] = p
    for x in ('conga', 'clave'):
        if x in pats and x == 'conga' and r.random() < .35:
            d = int(r.choice([-2, 2])); p = pats[x]; pats[x] = p[-d:] + p[:-d]
    return pats


def compose(V):
    P = Piece(V); de, h, r = P.de, P.h, P.r
    acc = P.accords(); derniere = P.mes - 1; brk = P.brk
    basse_ici = lambda m: m == derniere or P.plan[m][0] == 'retour' or bool(V.get('basse', {}).get(P.plan[m][1]))
    comp = V.get('comp', 'piano')

    # ---------------------------------------------------------------- la NAPPE (et les CORDES)
    pad = V.get('pad', {})
    gp = {0: .95, 1: .8, 2: .6, 3: .55, -1: 1.15}
    for (m, p, v, d, niv, nom) in acc:
        k, nb = P.plan[m][5], P.plan[m][6]; fc = pad.get('fc', 1100)
        if nom == 'A2': fc *= .6 + .7 * k / max(1, nb - 1)
        elif niv == -1: fc *= .75
        elif nom == 'A3': fc *= 1.25
        if pad.get('g', 1.) > 0:
            l, rr = nappe(dans(v[1:], 52, 72), d * P.dcm[m] + .15, de, fc, pad.get('att', .9 if niv in (0, -1) else .4), pad.get('rel', 1.6))
            P.pose2('pad', P.t(m, p), l, rr, gp[niv] * pad.get('g', 1.))
        if nom in V.get('cordes_sec', ()):
            l, rr = nappe(dans(v[2:], 64, 79), d * P.dcm[m] + .3, de, 2600, 1.3, 2.2)
            P.pose2('cordes', P.t(m, p), l, rr, .5)

    # ---------------------------------------------------------------- L'ACCOMPAGNEMENT, propre à chaque version
    MIX = V.get('comp_mix', {'roule': .3, 'pousse': .2, 'charleston': .3, 'roule+': .2})
    mk, mp = list(MIX), np.array(list(MIX.values()), float) / sum(MIX.values())

    def roule(t0, notes, dur, gc, v0=.4):
        ec = r.uniform(.018, .034)
        for j, n in enumerate(notes):
            P.pose('piano', h.t(t0 + j * ec, 3), piano(n, h.g(v0 + .06 * j), dur - j * ec), gc, pan_note(n))

    for (m, p, v, d, niv, nom) in acc:
        nv = sorted(v) if not basse_ici(m) else [n for n in sorted(v) if n >= 48]
        dur = d * P.dcm[m] + .35; t0 = P.t(m, p); nu = niv in (0, -1)
        if comp == 'piano':                                       # le piano feutré : chaque mesure tire SA façon de jouer
            gc = {0: .6, -1: .55}.get(niv, .5) * V.get('g_comp', 1.)
            mode = 'roule' if (nu or d != 16) else mk[int(r.choice(len(mk), p=mp))]
            if mode == 'pousse' and not (m > 0 and P.plan[m - 1][0] == nom and m - 1 != brk): mode = 'roule'
            if mode == 'roule': roule(t0, nv, dur, gc)
            elif mode == 'pousse': roule(P.t(m, p - 2), nv, dur + 2 * P.dcm[m], gc, .44)
            elif mode == 'charleston':
                roule(t0, nv, 6 * P.dcm[m] + .2, gc)
                for j, n in enumerate(nv[-3:]): P.pose('piano', h.t(P.t(m, 6) + j * .01, 3), piano(n, h.g(.38), 10 * P.dcm[m] + .3), gc * .85, pan_note(n))
            elif mode == 'roule+':
                roule(t0, nv, dur, gc)
                for j, n in enumerate(nv[-3:]): P.pose('piano', h.t(P.t(m, 10) + j * .012, 3), piano(n, h.g(.34), 5 * P.dcm[m]), gc * .8, pan_note(n))
        elif comp == 'bossa':                                     # la guitare nylon de la bossa, ses accords syncopés
            notes = dans(v[1:], 55, 69)[-4:]
            pas_b = ((0, 3, 6, 10, 13) if m % 2 == 0 else (2, 6, 10, 13))
            for i in pas_b:
                if not (p <= i < p + d) or (m == brk and i > 8) or (nu and r.random() < .4): continue
                P.pose('gtr', h.t(P.t(m, i), 4), nylon(notes, 1.6 * P.dcm[m] + .05, de), h.g(.75 if i in (0, 2) else .6) * (.8 if nu else 1.), .25)
        elif comp == 'rhodes':                                    # le Rhodes de la nuit : l'accord tenu, une relance paresseuse
            notes = dans(v[1:], 55, 72)
            for j, n in enumerate(notes):
                P.pose('rh', h.t(t0 + j * .01, 6), rhodes_p(n, dur + .3, h.g(.5)), .2, -.3 + .15 * j)
            if not nu and d == 16 and r.random() < .55:
                for j, n in enumerate(notes[-3:]):
                    P.pose('rh', h.t(P.t(m, int(r.choice([7, 10, 11]))) + j * .008, 6), rhodes_p(n, 4 * P.dcm[m], h.g(.4)), .16, .2)
        elif comp == 'synth':                                     # l'arpège de synthé en doubles croches, qui monte et redescend
            nt = dans(v[1:], 60, 79)
            seq = nt + nt[-2:0:-1]
            for i in range(p, p + d):
                if m == brk and i > 8: break
                if nu and i % 2: continue
                n = seq[(i + m * 3) % len(seq)]
                P.pose('arp', P.t(m, i), pluck(n, 2.2 * P.dcm[m], de, 1800 + 1400 * (niv >= 2)), (.42 if i % 4 == 0 else .3) * (.75 if nu else 1.), .35 * np.sin(i * .9))

    # ---------------------------------------------------------------- le RHODES qui répond en contretemps (PREMIER MATIN)
    if V.get('rh'):
        pat = V.get('rh_pat', '..x...x...x..x..')
        for m, pl in enumerate(P.plan):
            if pl[1] < V.get('rh_niv', 2) or m == derniere: continue
            for i, c in enumerate(pat):
                if c == '.' or (m == brk and i >= 8) or r.random() < .12: continue
                vel = h.g(.5 if c == 'o' else .68)
                for j, n in enumerate(dans(P.accord_a(m, i)[1:], 57, 72)[-4:]):
                    P.pose('rh', h.t(P.t(m, i), 4) + j * .006, rhodes_p(n, 1.7 * P.dc + .12, vel), .16 * V.get('g_rhc', 1.), -.3 + .2 * j)

    # ---------------------------------------------------------------- la BASSE (et sa note d'approche vers l'accord suivant)
    bs = V.get('basse_son', 'ronde'); prec_b = [None]
    def son(n, d):
        if bs == 'sub': return basse_sub(n, d)
        if bs == 'contrebasse': return contrebasse(n, d, de) * 1.3
        if bs == '808': x = basse_808b(n, d, prec_b[0] if (prec_b[0] and r.random() < .35 and prec_b[0] != n) else None); return x
        if bs == 'carree': return basse_carree(n, d)
        if bs == 'funk': return basse_funk(n, d, de, r.random() < .25)
        return basse_ronde(n, d)
    for m, pl in enumerate(P.plan):
        nom, niv = pl[0], pl[1]
        motif = [(0, 0, P.pas[m] - 2)] if (m == derniere or nom == 'retour') else V.get('basse', {}).get(niv)
        if not motif: continue
        motif = list(motif)
        if m == brk: motif = [x for x in motif if x[0] < 8] + [(8, 0, 2)]
        nxt = P.accord_a(m + 1, 0) if m + 1 < P.mes else None
        if niv == 3 and nxt and m != brk and racine(nxt) != racine(P.accord_a(m, 14)) and r.random() < .7 and V.get('approche', True):
            motif = [x for x in motif if x[0] < 14] + [(14, 'app', 2)]
        for (st, iv, ln) in motif:
            if iv == 'app': note = racine(nxt) - 1
            else:
                v = P.accord_a(m, st); rac = racine(v)
                if iv == 7 and (v[0] + 7) % 12 not in {x % 12 for x in v}: iv = 12
                note = rac + iv
            P.pose('basse', P.hb.t(P.t(m, st)), son(note, ln * P.dcm[m] * .92), P.hb.g(.62), 0); prec_b[0] = note

    # ---------------------------------------------------------------- la MÉLODIE : la belle phrase qui repose — elle se décale, s'orne, peut monter d'un ton
    vus = {}
    for nom, gr, g0, nb, niv, tr in V['forme']:
        inst = V['voix'].get(nom, 'piano'); m0 = P.debut[nom]
        frag = nom in ('intro', 'pause')
        mel = [(b - g0, p, n + tr, l) for (b, p, n, l) in V.get('mel' + gr, []) if g0 <= b < g0 + nb]
        if frag: mel = [(b, p, n, l, 1.) for (b, p, n, l) in mel if p < 6 or l >= 8]
        else:
            k = vus.get(gr, 0); vus[gr] = k + 1
            mel = varie(mel, min(k, 2), r, [(x + tr) % 12 for x in V['gamme']])
        prec = None
        vb = .5 if frag else (.55 if nom == 'retour' else V.get('vel_mel', .7) + (.05 if nom == 'A3' else 0))
        for (b, p, n, l, f) in mel:
            t = P.t(m0 + b, p); dur = l * P.dcm[min(m0 + b, P.mes - 1)]
            joue(P, inst, t, n, dur, vb * f, prec, .8 if frag else 1.)
            dbl = V.get('double', {}).get(nom)
            if dbl and f == 1.: joue(P, dbl[0], t + .004, n + dbl[1], dur, vb * f, prec, dbl[2])
            if f == 1. and l >= 8 and nom in V.get('choeur_sec', ()):
                P.pose('choeur', h.t(t), voix(n - 12, dur, 'o', de), h.g(.32), -.15)
            if f == 1. and l >= 8 and nom in V.get('rep_sec', ('A2', 'B', 'A3')) and r.random() < V.get('rep_p', .6):
                reponse(P, m0 + b, p, n, l, V.get('rep', 'celesta'))
            prec = n

    # ---------------------------------------------------------------- le CONTRE-CHANT (au dernier passage : ça scintille)
    for m, pl in enumerate(P.plan):
        if pl[0] not in V.get('contre', ()) or m == derniere: continue
        notes = dans(P.accord_a(m, 0)[1:], 67, 81)
        for j, st in enumerate(V.get('contre_pat', (2, 7, 11))):
            if r.random() < .25: continue
            joue(P, V.get('contre_inst', 'celesta'), P.t(m, st), notes[(j + m) % len(notes)], 2 * P.dc, .5, None, .5)

    # ---------------------------------------------------------------- les ENTRÉES : on aspire vers les grands passages
    for nom in V.get('entrees', ('A2', 'A3')):
        if nom not in P.debut: continue
        mc = P.debut[nom]
        envers(P, mc, .45)
        if V.get('crash', True): P.pose('bat', P.hb.t(P.t(mc, 0)), FRAPPE['crash'](de), .5, .3)
        if comp == 'piano': montee(P, mc - 1, P.pas[mc - 1] - 4, mc)

    # ---------------------------------------------------------------- la BATTERIE, qui ne joue jamais deux fois la même mesure
    FILLS = V.get('fills', ('conga', 'caisse', 'stop', 'tom'))
    for m, pl in enumerate(P.plan):
        nom, niv, k, nb = pl[0], pl[1], pl[5], pl[6]
        pats = bat_mesure(P, m)
        if m == derniere: pats = V.get('kit_fin', {'kick': 'x...............', 'shaker': 'o.o.o.o.........'})
        if not pats: continue
        fin_sec = k == nb - 1 and m != brk and m != derniere
        crescendo = (.8 + .2 * k / max(1, nb - 1)) if nom == 'A2' else 1.
        for inst, pat in pats.items():
            for i, c in enumerate(pat):
                if c == '.': continue
                if m == brk and i > 8: continue
                if fin_sec and niv >= 2 and i >= 12 and inst not in ('hat', 'shaker', 'hat_elec', 'hat_lofi', 'clave'): continue
                t = P.hb.t(P.t(m, i))
                if inst in ('kick', 'kick_lofi', 'pouls'): P.kicks.append(t)
                P.pose('bat', t, FRAPPE[inst](de), P.hb.g(FORCE[c] * V.get('g_' + inst, 1.) * crescendo),
                       {'hat': .25, 'ohat': .25, 'shaker': -.3, 'bois': .35, 'conga': -.35, 'rim': .2, 'clave': .35, 'hat_elec': .3, 'hat_lofi': .25}.get(inst, 0))
        if m == brk:
            ki = V.get('kick_inst', 'kick'); P.pose('bat', P.hb.t(P.t(m, 8)), FRAPPE[ki](de), 1.1, 0)
            if V.get('caisse_brk', 'caisse'): P.pose('bat', P.hb.t(P.t(m, 8)), FRAPPE[V.get('caisse_brk', 'caisse')](de), .7, 0)
            P.kicks.append(P.t(m, 8))
        if fin_sec and niv >= 2 and FILLS:
            f = FILLS[0] if r.random() < .5 else FILLS[int(r.integers(len(FILLS)))]
            for j, i in enumerate((12, 13, 14, 15)):
                tt = P.hb.t(P.t(m, i))
                if f == 'conga': P.pose('bat', tt, conga(de, 180 + 22 * j), P.hb.g(.55 + .1 * j), -.35 + .2 * j)
                elif f == 'tom': P.pose('bat', tt, conga(de, 230 - 28 * j), P.hb.g(.6 + .08 * j), .3 - .2 * j)
                elif f == 'caisse': P.pose('bat', tt, caisse_douce(de), P.hb.g(.18 + .07 * j), 0)
                elif f == 'lofi': P.pose('bat', tt, caisse_lofi(de), P.hb.g(.12 + .06 * j), 0)
                elif f == 'clave' and i in (12, 14, 15): P.pose('bat', tt, clave(de), P.hb.g(.6), .35)
                elif f == 'stop' and i == 15: P.pose('bat', tt, snap(de), .6, .1)
        if m + 1 < P.mes and P.plan[m + 1][1] == 3 and niv == -1 and V.get('souffle', True):
            P.pose('fx2', P.t(m), souffle(4 * P.temps * 1.1, de), .8, 0)

    # ---------------------------------------------------------------- la bande : un souffle constant, et le vinyle pour qui le veut
    nn = P.n
    P.pose2('bruit', 0, filtre(filtre(de.bruit(nn), 'low', 7000), 'high', 300) * 10 ** (-56 / 20), filtre(de.bruit(nn), 'low', 7000) * 10 ** (-56 / 20))
    if V.get('vinyle'): c = craquement(nn, de, 5); P.pose2('bruit', 0, c * .5 * V.get('vinyle_g', 1.), np.roll(c, 1777) * .5 * V.get('vinyle_g', 1.))
    return P


def arret_bande(L, R, i0, lent, i1):
    """l'ARRÊT DE BANDE : la lecture ralentit jusqu'à zéro en `lent` échantillons, silence, puis elle repart à i1"""
    for X in (L, R):
        seg = X[i0:i0 + lent * 2].copy(); j = np.arange(lent)
        pos = np.cumsum((1 - j / lent) ** 1.6); pos = np.clip(pos, 0, len(seg) - 1)
        X[i0:i0 + lent] = np.interp(pos, np.arange(len(seg)), seg) * (1 - j / lent) ** .3
        X[i0 + lent:i1] = 0
        f = min(int(.03 * SR), len(X) - i1); X[i1:i1 + f] *= np.linspace(0, 1, f)


def mixe(P):
    V = P.V; B = P.bus
    if P.kicks:
        g = pompe(P.n, P.kicks, V.get('pompe', .2), .22)
        for k in ('pad', 'rh', 'cordes', 'arp'):
            if k in B: B[k][0] *= g; B[k][1] *= g
    for k in ('pad', 'cordes'):
        if k in B:
            B[k][0], B[k][1] = chorus(B[k][0], B[k][1], 12, 2.5, .4)
            B[k][0] = filtre(B[k][0], 'high', 220); B[k][1] = filtre(B[k][1], 'high', 220)
    if 'rh' in B:
        t = np.arange(P.n) / SR; o = np.sin(2 * np.pi * 4.3 * t) * .18; B['rh'][0] *= 1 + o; B['rh'][1] *= 1 - o
    wb = V.get('bande', .0017)
    for k in ('piano', 'pad', 'rh', 'lead', 'celesta', 'vibra', 'cordes', 'choeur', 'flute', 'trompette', 'gtr', 'arp'):
        if k in B:
            B[k][0], B[k][1] = wobble(B[k][0], B[k][1], wb, .33)
            B[k][0], B[k][1] = wobble(B[k][0], B[k][1], 4e-5, 5.3)
    for k in ('lead', 'celesta', 'vibra', 'flute', 'trompette', 'arp'):
        if k in B:
            eL, eR = echo(B[k][0], B[k][1], P.temps * .75, .3, 4, True, 2600); g = .3 if k != 'arp' else .18
            B[k][0] += eL * g; B[k][1] += eR * g
    if 'piano' in B: B['piano'][0] = filtre(B['piano'][0], 'low', 9000); B['piano'][1] = filtre(B['piano'][1], 'low', 9000)
    if 'bat' in B:
        for i in (0, 1): B['bat'][i] = filtre(np.tanh(B['bat'][i] * 1.3) / 1.3, 'low', V.get('bat_lp', 8500))
        rL, rR = reverbe(B['bat'][0], B['bat'][1], .8, 5000, de=P.de); B['bat'][0] += rL * .14; B['bat'][1] += rR * .14
    env_ = {'piano': .5, 'rh': .45, 'lead': .55, 'celesta': .75, 'vibra': .6, 'pad': .55, 'cordes': .6, 'choeur': .6, 'gtr': .3, 'swell': .3,
            'flute': .5, 'trompette': .35, 'arp': .35}
    sL = sum(B[k][0] * g for k, g in env_.items() if k in B); sR = sum(B[k][1] * g for k, g in env_.items() if k in B)
    rL, rR = reverbe(sL, sR, V.get('rev', 3.6), 5200, .03, de=P.de)
    G = dict(piano=1., rh=1., lead=1., celesta=1., vibra=1., pad=.55, basse=.6, bat=.4, fx2=1., bruit=1., cordes=.45, choeur=.5, gtr=.5,
             flute=1., trompette=1., arp=.5)
    G.update(V.get('mix', {}))
    L = sum(B[k][0] * g for k, g in G.items() if k in B) + rL * V.get('rev_g', .42)
    R = sum(B[k][1] * g for k, g in G.items() if k in B) + rR * V.get('rev_g', .42)
    if V.get('arret_bande') and P.brk >= 0:
        arret_bande(L, R, int(round(P.t(P.brk, 9) * SR)), int(.6 * SR), int(round(P.t(P.brk + 1, 0) * SR)))
    if 'swell' in B: L += B['swell'][0] * .9; R += B['swell'][1] * .9
    lp = V.get('maitre_lp', 12000)
    L = filtre(filtre(L, 'high', 28), 'low', lp); R = filtre(filtre(R, 'high', 28), 'low', lp)   # AVANT le repli : un filtre
    lg = int(round(P.lg * SR)); q = P.n - lg                        # qui partirait de zéro au début casserait la couture
    L[:q] += L[lg:]; R[:q] += R[lg:]; L = L[:lg]; R = R[:lg]        # la queue repliée sur le début : aucune couture
    rms = np.sqrt(((L ** 2 + R ** 2) / 2).mean()); k = 10 ** (-15 / 20) / max(rms, 1e-9); L *= k; R *= k
    plaf = 10 ** (-1 / 20)
    return np.tanh(L / plaf * 1.03) * plaf, np.tanh(R / plaf * 1.03) * plaf


# ================================================================================ LES CINQ VERSIONS
FORME = [('intro', 'A', 4, 4, 0), ('A1', 'A', 0, 8, 1), ('A2', 'A', 0, 8, 2), ('B', 'B', 0, 8, 3), ('pause', 'B', 4, 4, -1), ('A3', 'A', 0, 8, 3)]

VERSIONS = [
    dict(id='chris-matin', titre='PREMIER MATIN', bpm=90, swing=.1, graine=4101, cle='ré majeur', ton=-2, gamme=[2, 4, 6, 7, 9, 11, 1],
         style='Esprit Chris (C418) · piano feutré, puis le groove arrive',
         idee="Le piano feutré et la nappe chaude, seuls ; le bois et le shaker entrent, puis la basse et le Rhodes en contretemps — ça finit par groover, et ça retombe dans le début.",
         A=[[50, 57, 61, 64, 66], [47, 54, 57, 62, 64], [43, 50, 54, 57, 59], [45, 52, 57, 61, 66],
            [50, 57, 61, 64, 66], [42, 49, 52, 57, 61], [43, 50, 54, 57, 59], [(0, [52, 55, 59, 62, 66]), (8, [45, 55, 57, 61, 64])]],
         B=[[43, 50, 54, 57, 59], [43, 52, 57, 61, 64], [42, 49, 52, 57, 61], [47, 54, 57, 61, 62],
            [52, 55, 59, 62, 66], [42, 49, 52, 57, 61], [43, 50, 54, 57, 59], [(0, [45, 52, 55, 57, 62]), (8, [45, 55, 57, 61, 64])]],
         melA=[(0, 0, 69, 6), (0, 6, 66, 2), (0, 8, 64, 4), (0, 12, 66, 4), (1, 0, 71, 6), (1, 6, 69, 2), (1, 8, 66, 8),
               (2, 0, 67, 6), (2, 6, 69, 2), (2, 8, 71, 4), (2, 12, 74, 4), (3, 0, 73, 8), (3, 8, 71, 4), (3, 12, 69, 4),
               (4, 0, 69, 6), (4, 6, 66, 2), (4, 8, 64, 4), (4, 12, 66, 4), (5, 0, 73, 6), (5, 6, 71, 2), (5, 8, 69, 8),
               (6, 0, 71, 6), (6, 6, 74, 2), (6, 8, 78, 4), (6, 12, 76, 4), (7, 0, 74, 8), (7, 8, 73, 4), (7, 12, 69, 4)],
         melB=[(0, 0, 74, 4), (0, 4, 76, 4), (0, 8, 78, 8), (1, 0, 76, 12), (1, 12, 73, 4), (2, 0, 73, 6), (2, 6, 71, 2), (2, 8, 69, 8),
               (3, 4, 66, 4), (3, 8, 69, 4), (3, 12, 73, 4), (4, 0, 74, 12), (4, 12, 71, 4), (5, 0, 73, 8), (5, 8, 69, 8),
               (6, 0, 71, 6), (6, 6, 69, 2), (6, 8, 67, 4), (6, 12, 66, 4), (7, 0, 62, 6), (7, 6, 64, 2), (7, 8, 61, 8)],
         voix={'intro': 'piano', 'A1': 'piano', 'A2': 'rhodes', 'B': 'piano', 'pause': 'piano', 'A3': 'piano'},
         comp='roule+', rh=True, rh_pat='..x...x...x..x..', basse_son='ronde',
         basse={2: [(0, 0, 6), (7, 0, 1), (8, 7, 4), (14, 12, 2)],
                3: [(0, 0, 3), (3, 0, 1), (6, 12, 1), (8, 7, 2), (10, 0, 2), (13, 12, 1), (14, 7, 2)]},
         contre=('A3',), forme=FORME),

    dict(id='chris-dimanche', titre='DIMANCHE', bpm=98, swing=.16, graine=4202, cle='fa majeur', ton=1, gamme=[5, 7, 9, 10, 0, 2, 4],
         style='Esprit Chris (C418) · Rhodes, basse slappée, ça groove au soleil',
         idee="Le Rhodes chante et répond à lui-même en contretemps ; la basse slappée entre dès la percussion ; le vibraphone prend la 2e partie. La version la plus funky.",
         A=[[43, 53, 57, 58, 62], [48, 55, 58, 62, 65], [43, 53, 57, 58, 62], [48, 55, 58, 62, 65],
            [41, 52, 55, 57, 60], [50, 53, 57, 60, 64], [46, 53, 57, 60, 62], [48, 53, 55, 58, 62]],
         B=[[46, 53, 57, 60, 62], [45, 52, 55, 60, 64], [50, 53, 57, 60, 64], [48, 55, 58, 62, 65],
            [46, 53, 57, 60, 62], [45, 52, 55, 60, 64], [43, 53, 57, 58, 62], [(0, [48, 53, 55, 58, 62]), (8, [48, 52, 58, 62, 67])]],
         melA=[(0, 2, 70, 2), (0, 4, 72, 2), (0, 6, 74, 4), (0, 12, 72, 2), (0, 14, 70, 2), (1, 0, 69, 6), (1, 8, 67, 2), (1, 10, 65, 6),
               (2, 2, 70, 2), (2, 4, 72, 2), (2, 6, 74, 2), (2, 8, 77, 6), (2, 14, 74, 2), (3, 0, 72, 10), (3, 12, 70, 2), (3, 14, 69, 2),
               (4, 0, 67, 4), (4, 4, 69, 4), (4, 8, 72, 8), (5, 0, 74, 6), (5, 6, 72, 2), (5, 8, 69, 8),
               (6, 2, 65, 2), (6, 4, 69, 2), (6, 6, 72, 4), (6, 10, 74, 6), (7, 0, 72, 8), (7, 8, 70, 4), (7, 12, 67, 4)],
         melB=[(0, 0, 77, 6), (0, 6, 76, 2), (0, 8, 74, 8), (1, 0, 72, 12), (1, 12, 69, 4), (2, 0, 76, 6), (2, 6, 74, 2), (2, 8, 72, 4),
               (2, 12, 69, 4), (3, 0, 70, 8), (3, 8, 67, 8), (4, 2, 74, 2), (4, 4, 77, 12), (5, 0, 76, 8), (5, 8, 72, 8),
               (6, 0, 74, 6), (6, 6, 72, 2), (6, 8, 70, 4), (6, 12, 69, 4), (7, 0, 67, 8), (7, 8, 64, 8)],
         voix={'intro': 'rhodes', 'A1': 'rhodes', 'A2': 'rhodes', 'B': 'vibra', 'pause': 'rhodes', 'A3': 'rhodes'},
         double={'A3': ('vibra', 0, .45)},
         comp='rien', rh=True, rh_niv=1, rh_pat='..x..x....x..x..', basse_son='funk', g_rhc=.9,
         basse={1: [(0, 0, 6), (10, 7, 2), (14, 12, 2)],
                2: [(0, 0, 3), (3, 12, 1), (6, 0, 2), (8, 7, 3), (11, 12, 1), (14, 0, 2)],
                3: [(0, 0, 2), (2, 12, 1), (3, 0, 1), (6, 7, 1), (7, 12, 1), (8, 0, 2), (10, 7, 1), (11, 12, 1), (13, 0, 1), (14, 7, 2)]},
         bat={2: {'conga': '......x.......x.'}}, contre=('A3',), contre_inst='celesta', mix={'rh': 1.1}, forme=FORME),

    dict(id='chris-nuit', titre='GARAGE DE NUIT', bpm=82, swing=.08, graine=4303, cle='do mineur', ton=-1, gamme=[0, 2, 3, 5, 7, 8, 10],
         style='Esprit Chris (C418) · nappe sombre, piano grave, batterie feutrée',
         idee="Do mineur, accords de 9e et une touche lydienne ; la nappe est plus grande et plus sombre, le vibraphone reprend le thème quand le beat arrive ; batterie feutrée, rim au lieu du bois.",
         A=[[48, 55, 58, 62, 63], [44, 51, 55, 60, 63], [51, 55, 58, 62, 67], [(0, [46, 53, 56, 58, 63]), (8, [46, 53, 56, 58, 62])],
            [48, 55, 58, 62, 63], [44, 51, 55, 58, 60], [41, 51, 55, 56, 60], [(0, [43, 50, 53, 55, 60]), (8, [43, 50, 53, 59, 62])]],
         B=[[44, 51, 55, 58, 60], [46, 53, 55, 58, 62], [43, 50, 53, 58, 62], [48, 55, 58, 62, 63],
            [44, 51, 55, 58, 60], [46, 53, 55, 58, 62], [43, 51, 55, 58, 62], [(0, [43, 50, 53, 55, 60]), (8, [43, 50, 53, 59, 62])]],
         melA=[(0, 0, 67, 6), (0, 6, 70, 2), (0, 8, 74, 8), (1, 0, 72, 8), (1, 8, 70, 4), (1, 12, 67, 4), (2, 0, 70, 6), (2, 6, 67, 2), (2, 8, 65, 8),
               (3, 0, 63, 8), (3, 8, 62, 8), (4, 0, 67, 6), (4, 6, 70, 2), (4, 8, 75, 8), (5, 0, 74, 8), (5, 8, 72, 8),
               (6, 0, 72, 4), (6, 4, 70, 4), (6, 8, 68, 8), (7, 0, 67, 8), (7, 8, 65, 4), (7, 12, 62, 4)],
         melB=[(0, 0, 72, 6), (0, 6, 74, 2), (0, 8, 75, 8), (1, 0, 74, 12), (1, 12, 70, 4), (2, 0, 70, 6), (2, 6, 72, 2), (2, 8, 74, 8),
               (3, 0, 75, 8), (3, 8, 74, 4), (3, 12, 70, 4), (4, 0, 72, 8), (4, 8, 67, 8), (5, 0, 70, 6), (5, 6, 67, 2), (5, 8, 65, 8),
               (6, 0, 67, 6), (6, 6, 63, 2), (6, 8, 62, 8), (7, 0, 60, 8), (7, 8, 59, 8)],
         voix={'intro': 'piano', 'A1': 'piano', 'A2': 'vibra', 'B': 'piano', 'pause': 'piano', 'A3': 'piano'},
         double={'A2': ('piano', -12, .35)},
         comp='roule+', pad_fc=850, rev=4.2, basse_son='sub', fill='caisse',
         basse={2: [(0, 0, 10), (10, 7, 2), (12, 0, 4)], 3: [(0, 0, 6), (6, 0, 2), (8, 7, 4), (13, 12, 1), (14, 0, 2)]},
         bat={1: {'rim': '....x.......x...', 'shaker': 'o.o.o.o.o.o.o.o.', 'bois': '................', 'conga': '................'},
              2: {'kick': 'x.........x.....', 'bois': '................'},
              3: {'kick': 'x.....x...x.....', 'conga': '................', 'rim': '..x.......x.....', 'ohat': '................'}},
         contre=('A3',), contre_pat=(3, 10), mix={'pad': .7}, forme=FORME),

    dict(id='chris-polaroid', titre='POLAROÏD', bpm=86, swing=.14, graine=4404, cle='sol majeur', ton=3, gamme=[7, 9, 11, 0, 2, 4, 6],
         style='Esprit Chris (C418) · petit synthé, piano qui marche, vinyle',
         idee="La main gauche du piano marche en croches ; un petit synthé doux (l'esprit des Moog de C418) prend le thème quand le groove arrive ; le célesta scintille à la fin ; un vinyle qui crépite.",
         A=[[43, 50, 54, 59, 62], [48, 52, 55, 59, 62], [52, 55, 59, 62, 66], [(0, [50, 55, 57, 59, 64]), (8, [50, 54, 57, 59, 66])],
            [43, 50, 54, 59, 62], [47, 54, 57, 62, 66], [48, 52, 55, 59, 62], [(0, [45, 52, 55, 60, 64]), (8, [50, 54, 57, 60, 66])]],
         B=[[48, 52, 55, 59, 62], [50, 54, 57, 59, 64], [47, 54, 57, 62, 66], [52, 55, 59, 62, 66],
            [48, 52, 55, 59, 62], [50, 54, 57, 59, 64], [52, 55, 59, 62, 66], [(0, [45, 52, 55, 60, 64]), (8, [50, 54, 57, 60, 66])]],
         melA=[(0, 0, 62, 4), (0, 4, 66, 4), (0, 8, 69, 6), (0, 14, 71, 2), (1, 0, 71, 8), (1, 8, 69, 4), (1, 12, 67, 4),
               (2, 0, 66, 6), (2, 6, 67, 2), (2, 8, 71, 8), (3, 0, 69, 8), (3, 8, 66, 8),
               (4, 0, 62, 4), (4, 4, 66, 4), (4, 8, 69, 4), (4, 12, 74, 4), (5, 0, 74, 8), (5, 8, 71, 8),
               (6, 0, 76, 6), (6, 6, 74, 2), (6, 8, 71, 4), (6, 12, 67, 4), (7, 0, 69, 8), (7, 8, 66, 4), (7, 12, 62, 4)],
         melB=[(0, 0, 76, 8), (0, 8, 74, 4), (0, 12, 71, 4), (1, 0, 69, 12), (1, 12, 66, 4), (2, 0, 74, 6), (2, 6, 71, 2), (2, 8, 69, 8),
               (3, 0, 67, 8), (3, 8, 66, 8), (4, 0, 74, 4), (4, 4, 76, 4), (4, 8, 79, 8), (5, 0, 78, 8), (5, 8, 76, 8),
               (6, 0, 74, 6), (6, 6, 71, 2), (6, 8, 67, 8), (7, 0, 69, 8), (7, 8, 72, 4), (7, 12, 66, 4)],
         voix={'intro': 'piano', 'A1': 'piano', 'A2': 'lead', 'B': 'lead', 'pause': 'piano', 'A3': 'lead'},
         double={'A3': ('piano', -12, .45)},
         comp='arp', vinyle=True, basse_son='ronde', g_comp=.9,
         basse={2: [(0, 0, 6), (6, 7, 2), (8, 12, 4), (12, 7, 4)], 3: [(0, 0, 3), (3, 0, 1), (6, 7, 2), (8, 12, 2), (10, 7, 2), (12, 0, 2), (14, 12, 2)]},
         bat={2: {'caisse': '................', 'snap': '....x.......x...'}}, contre=('B', 'A3'), forme=FORME),

    dict(id='chris-ciel', titre='GRAND CIEL', bpm=74, swing=.06, graine=4505, cle='mi♭ majeur', ton=-1, gamme=[3, 5, 7, 8, 10, 0, 2],
         style='Esprit Chris (C418) · lent, grandes nappes, piano en octaves',
         idee="La plus calme et la plus « Minecraft » : grandes nappes, piano en octaves, une touche lydienne ; la percussion reste légère (bois, shaker, un kick lointain), la basse tient de longues notes.",
         A=[[51, 58, 62, 65, 67], [50, 53, 58, 62, 65], [48, 55, 58, 62, 63], [44, 51, 55, 60, 62],
            [51, 58, 62, 65, 67], [43, 50, 53, 58, 62], [44, 51, 55, 58, 60], [(0, [46, 53, 56, 58, 63]), (8, [46, 53, 56, 58, 62])]],
         B=[[48, 55, 58, 62, 63], [43, 50, 53, 58, 62], [44, 51, 55, 58, 60], [43, 51, 55, 58, 62],
            [48, 55, 58, 62, 63], [50, 53, 58, 62, 65], [44, 51, 55, 60, 62], [(0, [46, 53, 56, 58, 63]), (8, [46, 53, 56, 58, 62])]],
         melA=[(0, 0, 70, 8), (0, 8, 67, 8), (1, 0, 65, 8), (1, 8, 70, 8), (2, 0, 74, 12), (2, 12, 72, 4), (3, 0, 70, 8), (3, 8, 67, 8),
               (4, 0, 70, 8), (4, 8, 75, 8), (5, 0, 74, 12), (5, 12, 70, 4), (6, 0, 72, 8), (6, 8, 70, 4), (6, 12, 67, 4), (7, 0, 68, 8), (7, 8, 65, 8)],
         melB=[(0, 0, 75, 8), (0, 8, 74, 8), (1, 0, 70, 12), (1, 12, 74, 4), (2, 0, 75, 6), (2, 6, 74, 2), (2, 8, 72, 8), (3, 0, 70, 16),
               (4, 0, 67, 8), (4, 8, 70, 8), (5, 0, 74, 8), (5, 8, 77, 8), (6, 0, 75, 8), (6, 8, 74, 8), (7, 0, 72, 8), (7, 8, 70, 8)],
         voix={'intro': 'piano', 'A1': 'piano', 'A2': 'piano', 'B': 'piano', 'pause': 'piano', 'A3': 'piano'},
         double={'A2': ('piano', -12, .55), 'B': ('piano', -12, .5), 'A3': ('piano', -12, .6)},
         comp='roule', pad_fc=1300, rev=4.4, rev_g=.5, basse_son='sub', basse_niv=1,
         basse={1: [(0, 0, 16)], 2: [(0, 0, 10), (10, 7, 6)], 3: [(0, 0, 10), (10, 7, 6)]},
         bat={1: {'bois': '........x.......', 'shaker': 'o...o...o...o...', 'conga': '................'},
              3: {'kick': 'x.......x.......', 'caisse': '................', 'snap': '....x.......x...', 'hat': '................',
                  'ohat': '................', 'conga': '..x.........x...', 'bois': '......x.......x.', 'shaker': 'o.o.o.o.o.o.o.o.'}},
         contre=('A3',), mix={'pad': .75}, forme=[('intro', 'A', 4, 4, 0), ('A1', 'A', 0, 8, 1), ('A2', 'A', 0, 8, 1), ('B', 'B', 0, 8, 3),
                                                  ('pause', 'B', 4, 4, -1), ('A3', 'A', 0, 8, 3)]),
]


# ================================================================================ v3 (14/10) — CINQ UNIVERS
# v2 (« on s'endort un peu… c'est juste trop régulier ») : break suspendu, piano à l'envers, +1 ton au dernier passage puis retour,
# appel et réponse, batterie qui change à chaque mesure. v3 (« mais c'est vraiment les mêmes, c'est fou ça, change ça ») : les cinq
# avaient le même piano, la même nappe, la même batterie, la même forme — on entendait cinq fois le même morceau. Chacune a désormais
# SON monde : ses instruments, son groove, son tempo, son déroulé. Ce qui reste commun : une belle mélodie calme qui repose
# (« tu arrives à atteindre une belle mélodie qui repose, joue sur ça ») et la boucle sans couture.
#   PREMIER MATIN — piano feutré + groove doux (la plus proche de Chris)       DIMANCHE — BOSSA : guitare nylon, flûte, contrebasse, clave
#   GARAGE DE NUIT — LO-FI hip-hop : Rhodes, trompette bouchée, 808, vinyle   POLAROÏD — SYNTHÉS : arpège, basse carrée, petit Moog, sans piano
#   GRAND CIEL — AMBIANT : sans batterie, nappes immenses, cordes, un battement de cœur au sommet
FORME2 = [('intro', 'A', 4, 4, 0, 0), ('A1', 'A', 0, 8, 1, 0), ('A2', 'A', 0, 8, 2, 0), ('B', 'B', 0, 8, 3, 0), ('pause', 'B', 4, 4, -1, 0),
          ('A3', 'A', 0, 8, 3, 2), ('retour', 'R', 0, 2, -1, 0)]
TOUT = lambda i: {k: i for k in ('intro', 'A1', 'A2', 'B', 'pause', 'A3', 'retour')}
V3 = {
    'chris-matin': dict(bpm=94, comp='piano', rep='celesta', forme=FORME2,
        voix={'intro': 'piano', 'A1': 'piano', 'A2': 'rhodes', 'B': 'piano', 'pause': 'piano', 'A3': 'piano', 'retour': 'piano'},
        R=[[52, 55, 59, 62, 66], [(0, [45, 52, 55, 57, 62]), (8, [45, 55, 57, 61, 64])]],
        melR=[(0, 0, 71, 8), (0, 8, 74, 8), (1, 0, 74, 6), (1, 8, 73, 8)],
        style='Piano feutré + groove doux · la plus proche de Chris',
        idee="La mélodie qui repose, au piano feutré ; le bois et le shaker entrent, break suspendu, le Rhodes reprend et répond en contretemps, le célesta répond — le dernier passage monte d'un ton."),
    'chris-dimanche': dict(bpm=104, swing=.03, comp='bossa', rh=False, pad={'g': .35, 'fc': 1400}, basse_son='contrebasse',
        basse={1: [(0, 0, 7), (8, 7, 7)], 2: [(0, 0, 5), (6, 0, 2), (8, 7, 6)], 3: [(0, 0, 5), (6, 0, 2), (8, 7, 5), (13, 7, 1)], -1: [(0, 0, 14)]},
        voix={'intro': 'flute', 'A1': 'flute', 'B': 'vibra', 'A2': 'flute', 'pause': 'vibra', 'A3': 'flute', 'retour': 'flute'},
        double={}, rep='vibra', rep_sec=('A1', 'A2', 'A3'), contre=(), mix={'gtr': .9, 'pad': .5, 'basse': .45},
        kit={1: {'clave': 'x..x..x...x..x..', 'shaker': 'x.o.x.o.x.o.x.o.'},
             2: {'clave': 'x..x..x...x..x..', 'shaker': 'x.o.x.o.x.o.x.o.', 'kick': 'x.....x.x.....x.', 'balai': '....x.......x...'},
             3: {'clave': 'x..x..x...x..x..', 'shaker': 'x.o.x.o.x.o.x.o.', 'kick': 'x.....x.x.....x.', 'balai': 'o.o.x.o.o.o.x.o.', 'conga': '..x....x..x...x.'},
             -1: {'shaker': 'o.o.o.o.o.o.o.o.'}},
        kicks={}, fills=('clave', 'conga', 'stop'), crash=False, entrees=('A3',), souffle=False,
        forme=[('intro', 'A', 4, 4, 1, 0), ('A1', 'A', 0, 8, 2, 0), ('B', 'B', 0, 8, 3, 0), ('A2', 'A', 0, 8, 3, 0), ('pause', 'B', 4, 4, -1, 0),
               ('A3', 'A', 0, 8, 3, 2), ('retour', 'R', 0, 2, -1, 0)], **{'break': False},
        R=[[43, 53, 57, 58, 62], [(0, [48, 55, 58, 62, 65]), (8, [48, 52, 58, 62, 67])]],
        melR=[(0, 0, 74, 6), (0, 6, 72, 2), (0, 8, 70, 8), (1, 0, 67, 8), (1, 8, 64, 8)],
        style='BOSSA au soleil · guitare nylon, flûte, contrebasse, clave',
        idee="Une bossa : la guitare nylon gratte ses accords syncopés dès la 1re seconde, la clave et le shaker, la contrebasse ; la flûte chante, le vibraphone répond puis prend la 2e partie ; un ton plus haut à la fin."),
    'chris-nuit': dict(bpm=74, swing=.3, comp='rhodes', rh=False, pad={'g': .5, 'fc': 800}, basse_son='808',
        basse={2: [(0, 0, 7), (10, 7, 4)], 3: [(0, 0, 6), (7, 0, 2), (10, 7, 3), (14, 12, 2)], -1: [(0, 0, 14)]},
        voix={'intro': 'trompette', 'A1': 'trompette', 'A2': 'vibra', 'B': 'trompette', 'pause': 'rhodes', 'A3': 'trompette', 'retour': 'trompette'},
        double={}, rep='vibra', rep_sec=('A1', 'B', 'A3'), choeur_sec=('B',), contre=(),
        kit={2: {'kick_lofi': 'x......x..x.....', 'caisse_lofi': '....x.......x...', 'hat_lofi': 'x.x.x.x.x.x.x.x.', 'rim': '..........x.....'},
             3: {'kick_lofi': 'x......x..x..x..', 'caisse_lofi': '....x..g....x...', 'hat_lofi': 'x.xox.xox.xox.xo', 'rim': '..x.......x.....', 'shaker': 'o.o.o.o.o.o.o.o.'},
             -1: {'hat_lofi': 'x...x...x...x...'}},
        kit_intro={'hat_lofi': 'x...x...x...x...'}, kick_inst='kick_lofi',
        kicks={2: ['x......x..x.....', 'x.........x.....', 'x......x..x...x.'], 3: ['x......x..x..x..', 'x..x......x.....', 'x......x.x....x.']},
        fills=('lofi', 'stop'), crash=False, caisse_brk='caisse_lofi', arret_bande=True, bande=.0032, maitre_lp=7500, vinyle=True, vinyle_g=1.6,
        bat_lp=6000, pompe=.3, entrees=('A2',), souffle=False, mix={'pad': .6, 'rh': 1.1, 'trompette': 2.},
        forme=[('intro', 'A', 4, 4, 0, 0), ('A1', 'A', 0, 8, 2, 0), ('A2', 'A', 0, 8, 2, 0), ('B', 'B', 0, 8, 3, 0), ('pause', 'B', 4, 4, -1, 0),
               ('A3', 'A', 0, 8, 3, 0), ('retour', 'R', 0, 2, -1, 0)],
        R=[[50, 53, 56, 60, 65], [(0, [43, 50, 53, 55, 60]), (8, [43, 50, 53, 56, 59])]],
        melR=[(0, 0, 68, 8), (0, 8, 65, 8), (1, 0, 67, 8), (1, 8, 59, 8)],
        style='LO-FI hip-hop de nuit · Rhodes, trompette bouchée, 808, vinyle',
        idee="Le Rhodes et le vinyle ; le beat poussiéreux tombe à la 5e mesure, très en retard (swing lourd) ; la trompette bouchée chante, la bande s'arrête au break et repart ; un chœur sombre sur les notes tenues de la 2e partie."),
    'chris-polaroid': dict(bpm=108, swing=0., comp='synth', rh=False, pad={'g': .75, 'fc': 1600}, basse_son='carree', pompe=.35, approche=False,
        basse={1: [(0, 0, 3), (4, 0, 3), (8, 0, 3), (12, 0, 3)], 2: [(0, 0, 1), (2, 12, 1), (4, 0, 1), (6, 12, 1), (8, 0, 1), (10, 12, 1), (12, 0, 1), (14, 12, 1)],
               3: [(0, 0, 1), (2, 12, 1), (4, 7, 1), (6, 12, 1), (8, 0, 1), (10, 12, 1), (12, 7, 1), (14, 12, 1)], -1: [(0, 0, 14)]},
        voix={'intro': 'celesta', 'A1': 'lead', 'A2': 'lead', 'B': 'lead', 'pause': 'celesta', 'A3': 'lead', 'retour': 'lead'},
        double={'A2': ('celesta', 0, .3), 'A3': ('celesta', 0, .35)}, rep='celesta', rep_sec=('B',), contre=(),
        kit={1: {'hat_elec': '..x...x...x...x.'}, 2: {'kick': 'x.......x.......', 'clap': '....x.......x...', 'hat_elec': '..x...x...x...x.'},
             3: {'kick': 'x.......x.......', 'clap': '....x.......x...', 'hat_elec': 'x.x.x.x.x.x.x.x.', 'ohat': '..............x.', 'conga': '...x.......x....'},
             -1: {'hat_elec': '..x...x...x...x.'}},
        kit_intro={}, kicks={3: ['x.......x.......', 'x.......x.x.....', 'x..x....x.......']}, fills=('tom', 'stop'), caisse_brk='clap',
        vinyle=False, mix={'pad': .5, 'arp': 3.5},
        forme=FORME2, R=[[45, 52, 55, 59, 60], [(0, [50, 55, 57, 60, 64]), (8, [50, 54, 57, 60, 66])]],
        melR=[(0, 0, 71, 8), (0, 8, 67, 8), (1, 0, 67, 8), (1, 8, 66, 8)],
        style='SYNTHÉS · arpège, basse carrée, petit Moog — sans piano',
        idee="Tout en synthés : l'arpège en doubles croches part dès la 1re seconde, la basse carrée rebondit en octaves, le petit Moog chante (doublé du célesta), beat électro léger ; break, puis un ton plus haut."),
    'chris-ciel': dict(bpm=64, swing=0., comp='piano', comp_mix={'roule': .6, 'pousse': .4}, rh=False, pad={'g': 1.35, 'fc': 1200, 'att': 1.8, 'rel': 2.6},
        cordes_sec=('A2', 'B', 'A3'), basse_son='sub', basse={1: [(0, 0, 16)], 3: [(0, 0, 10), (10, 7, 6)], -1: [(0, 0, 14)]}, approche=False,
        voix=TOUT('piano'), double={'A2': ('piano', -12, .5), 'B': ('piano', -12, .5), 'A3': ('piano', -12, .6)}, rep='celesta', rep_p=.5, contre=('A3',),
        kit={3: {'pouls': 'x.......x.......'}}, kit_intro={}, kicks={}, fills=(), crash=False, rev=5.0, rev_g=.55, kit_fin={'pouls': 'x...............'},
        forme=[('intro', 'A', 4, 4, 0, 0), ('A1', 'A', 0, 8, 1, 0), ('A2', 'A', 0, 8, 1, 0), ('B', 'B', 0, 8, 3, 0), ('pause', 'B', 4, 4, -1, 0),
               ('A3', 'A', 0, 8, 3, 2), ('retour', 'R', 0, 2, -1, 0)], **{'break': False},
        R=[[41, 51, 55, 56, 60], [(0, [46, 53, 56, 58, 63]), (8, [46, 53, 56, 58, 62])]],
        melR=[(0, 0, 72, 8), (0, 8, 68, 8), (1, 0, 70, 8), (1, 8, 65, 8)],
        style='AMBIANT · sans batterie, nappes immenses, cordes, piano en octaves',
        idee="Aucune batterie : des nappes immenses, le piano en octaves qui tombe lentement, des cordes qui gonflent ; au sommet un simple battement de cœur ; le dernier passage monte d'un ton."),
}
for V in VERSIONS: V.update(V3.get(V['id'], {}))

def rendre(V):
    t0 = time.time()
    P = compose(V); L, R = mixe(P)
    nom = V['id']; wav = os.path.join(SORTIE, nom + '.wav'); m4a = os.path.join(SORTIE, nom + '.m4a')
    ecrit_wav(wav, L, R)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '160000', '-q', '127', wav, m4a], check=True); os.remove(wav)
    dur = len(L) / SR
    print('%-16s %3d BPM  %d mesures  %5.1f s  crête %.1f dB  (%.0f s de calcul)' % (nom, V['bpm'], P.mes, dur,
          20 * np.log10(max(np.abs(L).max(), np.abs(R).max())), time.time() - t0))
    return {'id': nom, 'titre': V['titre'], 'style': V['style'], 'bpm': V['bpm'], 'cle': V['cle'], 'ton': V['ton'], 'idee': V['idee'],
            'onglet': 'lobby', 'f': 'assets/audio/music/lobby-chris/%s.m4a?v=%d' % (nom, int(time.time())), 'dur': round(dur, 5), 'pics': pics(L, R, 300)}


if __name__ == '__main__':
    filtres = sys.argv[1:]
    js = os.path.join(SORTIE, 'chris-donnees.js'); avant = []
    if os.path.exists(js):
        try: avant = json.loads(open(js).read().split('=', 1)[1].rstrip().rstrip(';'))
        except Exception: avant = []
    faits = {p['id']: p for p in avant}
    for V in VERSIONS:
        if filtres and not any(f in V['id'] for f in filtres): continue
        faits[V['id']] = rendre(V)
    sortie = [faits[V['id']] for V in VERSIONS if V['id'] in faits]
    open(js, 'w').write('window.CHRIS=' + json.dumps(sortie, ensure_ascii=False) + ';\n')
    print('→', js)
