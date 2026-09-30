# -*- coding: utf-8 -*-
"""LES BOUCLES DE CASH CAR (2026-10-01, Léo : « génère quelques pistes audio type boucle utilisables en jeu,
avec l'inspi et tes propres idées, prends des libertés — un truc où je peux cliquer sur les sons »).

Tout est SYNTHÉTISÉ ici (aucun échantillon, aucune mélodie empruntée) : les droits sont à nous.
Chaque boucle fait 16 mesures (A = 8 mesures, B = 8 mesures qui varient), et se referme SANS COUTURE :
on rend la boucle + 6 s de queue (réverbe, échos) et la queue est repliée sur le début — au retour,
la réverbe de la fin sonne encore sous la première mesure, comme si le morceau n'avait jamais cessé.

  ./venv/bin/python atelier-son/boucles.py            → assets/audio/music/boucles/*.m4a + boucles-donnees.js
  ./venv/bin/python atelier-son/boucles.py neon       → ne rend que les boucles dont l'id contient « neon »
Les boucles de 8 secondes vivent dans boucles8.py (`… boucles.py lobby` / `… niv`).
Il faut numpy + scipy (un venv suffit) et `afconvert` (macOS) pour l'AAC. La page d'écoute : boucles.html.

`ton` = même échelle que SON_TON dans index.html (la pentatonique de MI décalée de `ton` demi-tons) : les
récompenses de la console de son joueront dans la gamme de la boucle.
"""
import numpy as np, sys, os, json, subprocess, wave
from scipy.signal import butter, sosfilt, sosfilt_zi, fftconvolve

SR = 44100
ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(ICI)
SORTIE = os.path.join(RACINE, 'assets', 'audio', 'music', 'boucles')
QUEUE = 6.0

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# ------------------------------------------------------------------ le hasard reproductible
class Des:
    def __init__(s, g): s.r = np.random.default_rng(g)
    def u(s, a=0., b=1.): return float(s.r.uniform(a, b))
    def ch(s, l): return l[int(s.r.integers(len(l)))]
    def bruit(s, n): return s.r.standard_normal(n)

# ------------------------------------------------------------------ la table de mixage
MUET = set()     # les bus qu'on fait taire (rendu des COUCHES : voir plus bas)
FIN_BRUT = False # vrai : fin() rend le mélange replié SANS normaliser ni limiter (les couches doivent s'additionner)

class Piste:
    """Un bus stéréo : on y POSE des sons (à un temps en secondes), puis on le traite (filtre, pompe, réverbe)."""
    def __init__(s, n, nom=''): s.L = np.zeros(n); s.R = np.zeros(n); s.nom = nom
    def pose(s, t, sig, g=1., pan=0.):
        if s.nom in MUET: return  # ⚠ le son a DÉJÀ été fabriqué (le hasard avance pareil) : on ne le pose pas, c'est tout
        i = int(round(t * SR))
        if i >= len(s.L): return
        sig = sig[:len(s.L) - i] * g
        a = (pan + 1) * np.pi / 4
        s.L[i:i + len(sig)] += sig * np.cos(a); s.R[i:i + len(sig)] += sig * np.sin(a)
    def pose2(s, t, L, R, g=1.):
        if s.nom in MUET: return
        i = int(round(t * SR)); n = min(len(L), len(s.L) - i)
        if n <= 0: return
        s.L[i:i + n] += L[:n] * g; s.R[i:i + n] += R[:n] * g

def filtre(x, typ, f, q=None, ordre=2):
    f = np.clip(np.atleast_1d(f), 20, SR * .45)
    if len(f) == 1: return sosfilt(butter(ordre, f[0], typ, fs=SR, output='sos'), x)
    return x
def passe_bande(x, f1, f2, ordre=2): return sosfilt(butter(ordre, [f1, f2], 'bandpass', fs=SR, output='sos'), x)

def balaye(x, fc, bloc=256, ordre=2):
    """Passe-bas dont la coupure BOUGE (fc = tableau aligné sur x) : filtré par blocs, l'état est gardé."""
    y = np.zeros_like(x); zi = None
    for i in range(0, len(x), bloc):
        f = float(np.clip(fc[min(i, len(fc) - 1)], 30, SR * .45))
        sos = butter(ordre, f, 'low', fs=SR, output='sos')
        if zi is None: zi = sosfilt_zi(sos) * 0
        y[i:i + bloc], zi = sosfilt(sos, x[i:i + bloc], zi=zi)
    return y

def env(n, a, d, s=0., r=None, dur=None):
    """Enveloppe ADSR en échantillons (a, d, r en secondes ; dur = durée tenue avant relâche)."""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    if r is not None and dur is not None:
        e = np.where(t > dur, e * np.exp(-(t - dur) / max(r, 1e-4)), e)
    return e

# ------------------------------------------------------------------ les oscillateurs
def phase(f, n):
    f = np.broadcast_to(np.asarray(f, float), (n,)) if np.ndim(f) else np.full(n, float(f))
    return np.cumsum(f) / SR % 1.0, f / SR
def blep(t, dt):
    c = np.zeros_like(t)
    m = t < dt; x = t[m] / dt[m]; c[m] = x + x - x * x - 1
    m = t > 1 - dt; x = (t[m] - 1) / dt[m]; c[m] = x * x + x + x + 1
    return c
def scie(f, n):
    t, dt = phase(f, n); return 2 * t - 1 - blep(t, dt)
def carre(f, n, pw=.5):
    t, dt = phase(f, n); t2 = (t + 1 - pw) % 1
    return (2 * t - 1 - blep(t, dt)) - (2 * t2 - 1 - blep(t2, dt))
def sinus(f, n):
    t, _ = phase(f, n); return np.sin(2 * np.pi * t)
def tri(f, n):
    t, _ = phase(f, n); return 1 - 4 * np.abs(t - .5)

def supersaw(m, dur, voix=5, ecart=14, de=None):
    n = int(dur * SR); L = np.zeros(n); R = np.zeros(n)
    for k in range(voix):
        c = (k - (voix - 1) / 2) / max(1, (voix - 1) / 2)
        f = hz(m) * 2 ** (c * ecart / 1200)
        s = scie(f, n)
        s = np.roll(s, int((de.u() if de else .3) * SR / hz(m)))
        L += s * (1 - c) * .5; R += s * (1 + c) * .5
    return L / voix, R / voix

def plus(a, b):
    """additionne deux sons de longueurs différentes"""
    if len(a) < len(b): a, b = b, a
    a = a.copy(); a[:len(b)] += b; return a

def fm(m, dur, ratio, indice, dec_i, dec):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    I = indice * np.exp(-t / dec_i)
    return np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t)) * np.exp(-t / dec)

def karplus(m, dur, clair=.5, amort=.996, de=None):
    n = int(dur * SR); N = max(2, int(SR / hz(m)))
    y = np.zeros(n + N)
    y[:N] = (de.bruit(N) if de else np.random.standard_normal(N))
    y[:N] = filtre(y[:N], 'low', 800 + 7000 * clair, ordre=1)
    for i in range(N, n + N, N):  # par blocs de N : chaque échantillon ne dépend que du bloc d'avant
        j = min(i + N, n + N)
        a = y[i - N:j - N]; b = y[i - N - 1:j - N - 1] if i - N - 1 >= 0 else np.r_[0, a[:-1]]
        y[i:j] = amort * .5 * (a + b[:len(a)])
    return y[N:] * env(n, .002, 9, 1)

# ------------------------------------------------------------------ la batterie
def kick(de, f0=160, f1=46, dec=.38, click=.6, drive=1.4):
    n = int((dec + .1) * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / .032)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (dec * .45))
    s += click * filtre(de.bruit(n), 'high', 2500) * np.exp(-t / .004)
    return np.tanh(s * drive) / np.tanh(drive)
def caisse(de, ton=190, bruit=.8, dec=.16, clair=1900):
    n = int((dec + .15) * SR); t = np.arange(n) / SR
    corps = np.sin(2 * np.pi * np.cumsum(ton * (1 + .5 * np.exp(-t / .01))) / SR) * np.exp(-t / .05)
    nz = passe_bande(de.bruit(n), clair * .5, min(clair * 3.5, 16000)) * np.exp(-t / dec)
    return corps * .6 + nz * bruit * 1.4
def clap(de, dec=.2):
    n = int((dec + .1) * SR); t = np.arange(n) / SR
    e = np.zeros(n)
    for k, o in enumerate([0, .011, .022, .031]):
        i = int(o * SR); e[i:] += np.exp(-(t[:n - i]) / (.007 if k < 3 else dec))
    return passe_bande(de.bruit(n), 900, 5000) * e * .9
def charley(de, ouvert=False, clair=8000):
    d = .22 if ouvert else .045
    n = int((d + .05) * SR); t = np.arange(n) / SR
    # un vrai métal : six carrés inharmoniques, plus du bruit
    met = sum(carre(f, n) for f in [205.3, 304.4, 369.6, 522.7, 540, 800]) / 6
    s = filtre(met * .6 + de.bruit(n) * .5, 'high', clair) * np.exp(-t / (d * .35))
    return s
def cloche_vache(de, m=None, dec=.32):
    """la cowbell du phonk : deux carrés à 540/800 Hz, un passe-bande, une queue courte — ici ACCORDÉE sur une note."""
    n = int((dec + .1) * SR); t = np.arange(n) / SR
    f = hz(m) if m else 540
    s = carre(f, n) * .6 + carre(f * 1.48, n) * .4
    s = passe_bande(s, f * .8, f * 5) * (np.exp(-t / .03) * .7 + np.exp(-t / dec) * .3)
    return s
def piece(de):
    """LE « CHING » : une pièce qui tombe — trois partiels de métal inharmoniques, un rebond."""
    n = int(.7 * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f, a, d in [(3120, 1, .18), (4980, .6, .11), (7250, .4, .07), (2050, .35, .3)]:
        s += a * np.sin(2 * np.pi * f * t + de.u(0, 6)) * np.exp(-t / d)
    r = int(.085 * SR); s[r:] += .45 * s[:n - r] * np.exp(-t[:n - r] / .05)
    return s * .5
def souffle_pluie(de, n):
    x = de.bruit(n); x = passe_bande(x, 500, 9000)
    gouttes = (de.r.random(n) < .0009) * de.bruit(n) * 4
    gouttes = filtre(gouttes, 'high', 3000)
    return x * .12 + gouttes * .5
def craquement(de, n):
    c = (de.r.random(n) < .00035) * de.bruit(n) * 3
    return filtre(c, 'high', 1500) + filtre(de.bruit(n), 'low', 400) * .02

# ------------------------------------------------------------------ les effets
def reverbe(L, R, taille=2.2, clair=6000, pre=.02, de=None):
    n = int(taille * SR); t = np.arange(n) / SR
    dz = de or Des(7)
    irL = dz.bruit(n) * np.exp(-t * 6.9 / taille); irR = dz.bruit(n) * np.exp(-t * 6.9 / taille)
    irL = filtre(irL, 'low', clair); irR = filtre(irR, 'low', clair)
    p = int(pre * SR); irL = np.r_[np.zeros(p), irL]; irR = np.r_[np.zeros(p), irR]
    nrm = 1 / np.sqrt((irL ** 2).sum())
    return fftconvolve(L, irL)[:len(L)] * nrm, fftconvolve(R, irR)[:len(R)] * nrm
def echo(L, R, d, fb=.4, n=6, pingpong=True, clair=3500):
    oL = np.zeros_like(L); oR = np.zeros_like(R); i = int(d * SR)
    xL = filtre(L, 'low', clair); xR = filtre(R, 'low', clair)
    for k in range(1, n + 1):
        g = fb ** k; s = i * k
        if s >= len(L): break
        a, b = (xR, xL) if (pingpong and k % 2) else (xL, xR)
        oL[s:] += a[:len(L) - s] * g; oR[s:] += b[:len(R) - s] * g
    return oL, oR
def pompe(n, temps, profondeur=.7, rel=.16):
    """Le sidechain : chaque grosse caisse creuse le bus, qui remonte en `rel` secondes."""
    g = np.ones(n); t = np.arange(int(rel * 3 * SR)) / SR
    creux = 1 - profondeur * np.exp(-t / (rel * .5))
    for tt in temps:
        i = int(tt * SR); m = min(len(creux), n - i)
        if m > 0: g[i:i + m] = np.minimum(g[i:i + m], creux[:m])
    return g
def wobble(L, R, prof=.0025, vit=.55):
    """la bande qui pleure (lo-fi) : la lecture accélère et ralentit un peu."""
    n = len(L); t = np.arange(n) / SR
    pos = np.arange(n) - prof * SR * np.sin(2 * np.pi * vit * t) / (2 * np.pi * vit) * 2 * np.pi * vit
    pos = np.clip(pos, 0, n - 1)
    return np.interp(pos, np.arange(n), L), np.interp(pos, np.arange(n), R)

# ------------------------------------------------------------------ la musique
GAMMES = {'min': [0, 2, 3, 5, 7, 8, 10], 'dor': [0, 2, 3, 5, 7, 9, 10], 'phr': [0, 1, 3, 5, 7, 8, 10], 'harm': [0, 2, 3, 5, 7, 8, 11]}
def deg(tonique, gam, d, oct=0):
    g = GAMMES[gam]; return tonique + g[d % 7] + 12 * (d // 7 + oct)
def accord(tonique, gam, d, sept=True, neuf=False):
    notes = [deg(tonique, gam, d + k) for k in ([0, 2, 4, 6] if sept else [0, 2, 4])]
    if neuf: notes.append(deg(tonique, gam, d + 8))
    return notes

class Morceau:
    def __init__(s, bpm, mesures=16, graine=1):
        s.bpm = bpm; s.temps = 60 / bpm; s.dc = s.temps / 4; s.mes = mesures
        s.lg = mesures * 4 * s.temps; s.n = int(round(s.lg * SR)) + int(QUEUE * SR)
        s.de = Des(graine); s.bus = {}
    def piste(s, nom):
        if nom not in s.bus: s.bus[nom] = Piste(s.n, nom)
        return s.bus[nom]
    def t(s, mes, pas=0, swing=0.):
        """le temps d'une double-croche (mesure, pas 0-15) ; swing retarde les pas impairs"""
        return mes * 4 * s.temps + pas * s.dc + (swing * s.dc if pas % 2 else 0)
    def patron(s, nom, motif, son, g=1., pan=0., swing=0., mes=None, var=None):
        p = s.piste(nom)
        for m in (range(s.mes) if mes is None else mes):
            mot = var(m) if var else motif
            for i, c in enumerate(mot):
                if c == '.': continue
                k = {'x': 1., 'X': 1.25, 'o': .45, 'g': .25}.get(c, 1.)
                p.pose(s.t(m, i, swing), son() if callable(son) else son, g * k, pan)

def fin(M, pistes_gains, rev=None, maitre_lp=None):
    """somme les bus, replie la queue sur le début, normalise, limite."""
    L = np.zeros(M.n); R = np.zeros(M.n)
    for nom, g in pistes_gains.items():
        if nom in M.bus and nom not in MUET: L += M.bus[nom].L * g; R += M.bus[nom].R * g
    if maitre_lp: L = filtre(L, 'low', maitre_lp); R = filtre(R, 'low', maitre_lp)
    lg = int(round(M.lg * SR)); q = M.n - lg
    L[:q] += L[lg:]; R[:q] += R[lg:]; L = L[:lg]; R = R[:lg]
    L = filtre(L, 'high', 25); R = filtre(R, 'high', 25)
    if FIN_BRUT: return L, R
    # sonie ~ -16 dB RMS, puis un limiteur doux (crête -1 dBFS)
    rms = np.sqrt(((L ** 2 + R ** 2) / 2).mean()); k = 10 ** (-15 / 20) / max(rms, 1e-9)
    L *= k; R *= k
    plaf = 10 ** (-1 / 20)
    L = np.tanh(L / plaf * 1.05) * plaf; R = np.tanh(R / plaf * 1.05) * plaf
    return L, R

# ================================================================== LES SEPT BOUCLES
def neon_drive():
    """NÉON DRIVE — synthwave de course. La moto de Drive dans un ciel de coton : quatre temps, basse en octaves pompée,
    supersaw large, arpège en écho ping-pong ; en B, un lead qui chante au-dessus (mélodie maison)."""
    M = Morceau(118, graine=11); de = M.de; T = 57  # la2 → LA mineur
    prog = [0, 5, 2, 6]  # i VI III VII
    M.patron('kick', 'x...x...x...x...', lambda: kick(de), 1.0)
    M.patron('bat', '....x.......x...', lambda: clap(de), .55, .1)
    M.patron('bat', '..x...x...x...x.', lambda: charley(de, True), .22, .2)
    M.patron('bat', 'x.o.x.o.x.o.x.oo', lambda: charley(de), .16, -.25, mes=range(8, 16))
    kicks = [M.t(m, p) for m in range(16) for p in (0, 4, 8, 12)]
    b = M.piste('basse'); pad = M.piste('pad'); arp = M.piste('arp'); lead = M.piste('lead')
    for m in range(16):
        d = prog[(m // 2) % 4]; r = deg(T - 12, 'min', d)
        for p in range(16):
            if p % 2 == 1 or m < 16:
                n = r + (12 if p % 2 else 0); dur = M.dc * .9
                s = scie(hz(n), int(dur * SR)) * env(int(dur * SR), .003, .08, .3)
                b.pose(M.t(m, p), balaye(s, np.full(len(s), 380 + 900 * (p % 4 == 2))), .5)
        if m % 2 == 0:
            for note in accord(T, 'min', d):
                l, r2 = supersaw(note, M.temps * 8 + .3, 5, 16, de)
                e = env(len(l), .25, 9, 1, .35, M.temps * 8 - .1)
                pad.pose2(M.t(m), filtre(l * e, 'low', 2600), filtre(r2 * e, 'low', 2600), .16)
        motif = [0, 2, 4, 7, 9, 7, 4, 2]
        for p in range(0, 16, 2):
            n = deg(T + 12, 'min', d + motif[(p // 2 + m) % 8])
            s = carre(hz(n), int(.14 * SR), .3) * env(int(.14 * SR), .002, .05)
            arp.pose(M.t(m, p), filtre(s, 'low', 3800), .13, .3 * (1 if p % 4 else -1))
    melodie = [(0, 0, 7, 6), (0, 6, 9, 2), (0, 8, 11, 6), (0, 14, 9, 2), (1, 0, 7, 8), (1, 8, 4, 8),
               (2, 0, 7, 6), (2, 6, 9, 2), (2, 8, 11, 4), (2, 12, 14, 4), (3, 0, 11, 12), (3, 12, 9, 4)]
    for rep in (8, 12):
        for mm, p, dd, lg in melodie:
            m = rep + mm; n = deg(T + 12, 'min', dd)
            dur = lg * M.dc; nn = int((dur + .3) * SR); t = np.arange(nn) / SR
            vib = 1 + .004 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / .3, 0, 1)
            s = (scie(hz(n) * vib, nn) + scie(hz(n) * vib * 1.006, nn)) * .5 * env(nn, .02, 9, 1, .12, dur)
            lead.pose(M.t(m, p), balaye(s, 1200 + 2500 * np.exp(-t / .25)), .22)
    g = pompe(M.n, kicks, .75)
    for k in ('basse', 'pad', 'arp'): M.bus[k].L *= g; M.bus[k].R *= g
    eL, eR = echo(arp.L + lead.L * .5, arp.R + lead.R * .5, M.temps * .75, .45)
    rL, rR = reverbe(pad.L + lead.L + eL * .5 + M.bus['bat'].L * .15, pad.R + lead.R + eR * .5 + M.bus['bat'].R * .15, 2.8, de=de)
    M.piste('fx').L += eL * .7 + rL * .35; M.piste('fx').R += eR * .7 + rR * .35
    return M, fin(M, {'kick': 1, 'bat': 1, 'basse': 1, 'pad': 1, 'arp': 1, 'lead': 1, 'fx': 1})

def pluie_neon():
    """PLUIE NÉON — la ville la nuit, sous la pluie. Rhodes en FM, accords de 9e, batterie boom-bap swinguée qui
    traîne, sous-basse ronde, la pluie et le vinyle. En B, le Rhodes répond par petites phrases."""
    M = Morceau(88, graine=22); de = M.de; T = 53  # fa2 → FA mineur
    prog = [0, 5, 3, 4]
    sw = .28
    M.patron('bat', 'x.......x.x.....', lambda: kick(de, 120, 44, .45, .3, 1.2), .95, swing=sw)
    M.patron('bat', '....x.......x...', lambda: caisse(de, 180, 1, .2, 1500), .6, swing=sw)
    M.patron('bat', 'x.x.x.x.x.x.x.xo', lambda: charley(de, False, 6000), .14, .3, swing=sw)
    rh = M.piste('rhodes'); sb = M.piste('basse')
    for m in range(16):
        d = prog[(m // 2) % 4]
        if d == 4: notes = [deg(T, 'harm', 4), deg(T, 'harm', 6), deg(T, 'harm', 8), deg(T, 'harm', 10)]  # V7 harmonique
        else: notes = accord(T, 'min', d, True, True)
        for hit, dt in ((0, 1.0), (7, .6)) if m % 2 == 0 else ((10, .5),):
            for k, n in enumerate(notes):
                s = plus(fm(n, 2.4, 1, 2.2, .25, 1.3), .3 * fm(n + 12, 1.2, 14, 1.2, .05, .5))
                rh.pose(M.t(m, hit, sw) + k * .012, s, .09 * dt, -.3 + .2 * k)
        if m % 2 == 0:
            r = deg(T - 12, 'min', d if d != 4 else 4)
            for p, lg in ((0, 7), (10, 5)):
                nn = int(lg * M.dc * SR); s = sinus(hz(r), nn) * env(nn, .01, 9, 1, .06, lg * M.dc - .06)
                sb.pose(M.t(m, p, sw), np.tanh(s * 1.6) * .6, .7)
    phrases = [(8, 12, [4, 6, 7]), (10, 12, [9, 7, 4]), (12, 8, [2, 4, 6, 4]), (14, 12, [7, 6, 4, 2])]
    for m, p, ds in phrases:
        for i, dd in enumerate(ds):
            rh.pose(M.t(m, p + i * 2, sw), fm(deg(T + 12, 'min', dd), 1.6, 1, 2.6, .2, .9), .13, .35)
    tr = M.piste('pluie'); z = souffle_pluie(de, M.n) + craquement(de, M.n) * .6
    tr.L += z; tr.R += np.roll(z, 1337)
    wl, wr = wobble(rh.L, rh.R, .0018, .45); rh.L, rh.R = wl, wr
    rL, rR = reverbe(rh.L + M.bus['bat'].L * .3, rh.R + M.bus['bat'].R * .3, 2.4, 5000, de=de)
    M.piste('fx').L += rL * .45; M.piste('fx').R += rR * .45
    return M, fin(M, {'bat': 1, 'rhodes': 1, 'basse': 1, 'pluie': .55, 'fx': 1}, maitre_lp=11000)

def apesanteur():
    """APESANTEUR — l'orbite. Pas de caisse claire : des cloches FM en pentatonique qui tombent au hasard (graine fixe),
    une nappe qui s'ouvre lentement, un cœur de sous-basse, une réverbe immense. On flotte, la Lune regarde."""
    M = Morceau(96, graine=33); de = M.de; T = 50  # ré2 → RÉ mineur
    prog = [0, 5, 3, 6]; penta = [0, 2, 4, 7, 9]
    pad = M.piste('pad'); cl = M.piste('cloches'); sb = M.piste('basse')
    fc_all = 500 + 2500 * (.5 - .5 * np.cos(2 * np.pi * np.arange(M.n) / SR / (M.lg / 2)))
    for m in range(0, 16, 2):
        d = prog[(m // 2) % 4]
        for note in accord(T + 12, 'dor', d):
            l, r = supersaw(note, M.temps * 8 + 1.5, 3, 7, de)
            e = env(len(l), 1.2, 9, 1, 1.0, M.temps * 8)
            i = int(M.t(m) * SR); fc = fc_all[i:i + len(l)]
            if len(fc) < len(l): fc = np.r_[fc, np.full(len(l) - len(fc), fc[-1] if len(fc) else 800)]
            pad.pose2(M.t(m), balaye(l * e, fc), balaye(r * e, fc), .14)
        r = deg(T - 12, 'dor', d)
        for p in (0, 3, 16, 19):  # le cœur : toum-toum, deux fois par accord
            nn = int(.5 * SR); t = np.arange(nn) / SR
            s = np.sin(2 * np.pi * np.cumsum(hz(r) * (1 + .6 * np.exp(-t / .02))) / SR) * np.exp(-t / .22)
            sb.pose(M.t(m) + p * M.dc, s, .55 if p in (0, 16) else .35)
    for m in range(16):
        for p in range(0, 16):
            if de.u() < (.22 if m < 8 else .34):
                d = prog[(m // 2) % 4]
                n = deg(T + 24, 'dor', 0) + penta[int(de.u() * 5)] + (12 if de.u() < .25 else 0) + [0, 9, 5, 10][(m // 2) % 4] % 12
                cl.pose(M.t(m, p), fm(n, 3.5, 3.5, 3.0, .6, 1.4), .07 + de.u() * .05, de.u(-.8, .8))
    M.patron('bat', '..........x.....', lambda: charley(de, True, 9000), .07, .5)
    eL, eR = echo(cl.L, cl.R, M.temps * 1.5, .5, 5)
    rL, rR = reverbe(cl.L + pad.L + eL, cl.R + pad.R + eR, 6.0, 7000, .06, de)
    M.piste('fx').L += rL * .75 + eL * .5; M.piste('fx').R += rR * .75 + eR * .5
    return M, fin(M, {'pad': 1, 'cloches': 1, 'basse': 1, 'bat': 1, 'fx': 1})

def dark_triad():
    """DARK TRIAD — la frénésie, en phonk. Cowbell accordée qui joue le riff (mélodie maison, en phrygien : la seconde
    mineure qui grince), 808 qui glisse et sature, charley en rafales de trap, clap Memphis. Ça doit faire peur et donner envie."""
    M = Morceau(140, graine=44); de = M.de; T = 49  # do#2 → DO# phrygien
    k808 = M.piste('808'); cb = M.piste('cowbell')
    M.patron('bat', 'x......x..x.....', lambda: kick(de, 180, 50, .25, 1, 2.2), 1.0)
    M.patron('bat', '....X.......X...', lambda: clap(de, .28), .7)
    def hats(m):
        if m % 4 == 3: return 'x.x.x.xxx.x.xxxx'
        return 'x.x.x.x.x.xxx.x.'
    M.patron('bat', '', lambda: charley(de, False, 9000), .2, .35, var=hats)
    riff = [(0, 0), (3, 1), (6, 0), (8, 3), (10, 1), (12, 0), (14, -2)]
    riff_b = [(0, 7), (3, 6), (6, 4), (8, 3), (10, 1), (12, 0), (14, 1)]
    for m in range(16):
        r = riff if (m < 8 or m % 2 == 0) else riff_b
        for p, dd in r:
            cb.pose(M.t(m, p), cloche_vache(de, deg(T + 24, 'phr', dd)), .45, .15)
    ligne = [(0, 0, 6), (7, 0, 3), (10, 5, 4), (14, 4, 2)]
    prev = None
    for m in range(16):
        for p, dd, lg in ligne:
            n = deg(T - 12, 'phr', dd) + (12 if (m % 4 == 3 and p == 14) else 0)
            dur = lg * M.dc; nn = int((dur + .15) * SR); t = np.arange(nn) / SR
            f0 = hz(prev) if prev is not None else hz(n)
            f = hz(n) + (f0 - hz(n)) * np.exp(-t / .045)
            s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(nn, .004, 9, 1, .05, dur)
            k808.pose(M.t(m, p), np.tanh(s * 3.2) * .55, .9)
            prev = n
    # la montée de la mesure 8 : un bruit qui grimpe
    nn = int(M.temps * 4 * SR); t = np.arange(nn) / SR
    up = balaye(de.bruit(nn), 300 * (30 ** (t / t[-1]))) * (t / t[-1]) ** 2 * .25
    M.piste('fx').pose(M.t(7), up, 1)
    rL, rR = reverbe(cb.L * .6 + M.bus['bat'].L * .2, cb.R * .6 + M.bus['bat'].R * .2, 1.4, 6000, de=de)
    M.piste('fx').L += rL * .4; M.piste('fx').R += rR * .4
    return M, fin(M, {'bat': 1, '808': 1, 'cowbell': .9, 'fx': 1})

def caisse_enregistreuse():
    """CAISSE ENREGISTREUSE — house de boutique / missions. Orgue de house en accords piqués (esprit M1, synthèse FM),
    charley qui swingue, basse qui rebondit, et des PIÈCES qui tombent comme percussion : l'argent fait le groove."""
    M = Morceau(124, graine=55); de = M.de; T = 55  # sol2 → SOL mineur (dorien)
    prog = [0, 3, 0, 4]; sw = .12
    M.patron('bat', 'x...x...x...x...', lambda: kick(de, 150, 48, .3, .5, 1.6), 1.0)
    M.patron('bat', '....x.......x...', lambda: clap(de, .18), .45, swing=sw)
    M.patron('bat', '..x...x...x...x.', lambda: charley(de, True, 7000), .2, .25, swing=sw)
    M.patron('bat', 'oxoxoxoxoxoxoxox', lambda: charley(de, False, 10000), .09, -.3, swing=sw, mes=range(4, 16))
    M.patron('cash', '.......x......x.', lambda: piece(de), .35, .5, swing=sw, var=lambda m: '.......x......x.' if m % 2 else '..........x.....')
    org = M.piste('orgue'); b = M.piste('basse')
    stabs = [(0, 1), (3, .7), (6, .9), (10, .7), (12, .5)]
    kicks = [M.t(m, p) for m in range(16) for p in (0, 4, 8, 12)]
    for m in range(16):
        d = prog[m % 4]
        for p, v in stabs:
            if m < 4 and p not in (0, 6): continue
            for k, n in enumerate(accord(T + 12, 'dor', d)):
                s = plus(fm(n, .5, 2, 1.8, .06, .18), .5 * fm(n + 12, .4, 1, .8, .1, .12))
                org.pose(M.t(m, p, sw), s, .1 * v, -.4 + k * .25)
        r = deg(T - 12, 'dor', d)
        for p, o in ((2, 0), (6, 12), (10, 0), (13, 12), (14, 7)):
            nn = int(M.dc * 1.2 * SR); s = (sinus(hz(r + o), nn) + .3 * scie(hz(r + o), nn)) * env(nn, .003, .1, .4)
            b.pose(M.t(m, p, sw), filtre(s, 'low', 900), .55)
    g = pompe(M.n, kicks, .55, .12)
    for k in ('orgue', 'basse'): M.bus[k].L *= g; M.bus[k].R *= g
    rL, rR = reverbe(org.L + M.bus['cash'].L, org.R + M.bus['cash'].R, 1.8, 7000, de=de)
    M.piste('fx').L += rL * .35; M.piste('fx').R += rR * .35
    return M, fin(M, {'bat': 1, 'orgue': 1, 'basse': 1, 'cash': .8, 'fx': 1})

def garage_lofi():
    """GARAGE — lo-fi pour bricoler sa caisse. Guitare en cordes pincées (Karplus-Strong), accords de 7e en arpège lent,
    batterie étouffée, bande qui pleure, vinyle. La clé à molette posée sur l'établi, deux heures du matin."""
    M = Morceau(82, graine=66); de = M.de; T = 52  # mi2 → MI mineur (dorien)
    prog = [0, 3, 6, 2]; sw = .33
    M.patron('bat', 'x......x..x.....', lambda: kick(de, 110, 42, .4, .2, 1.1), .9, swing=sw)
    M.patron('bat', '....x.......x..o', lambda: caisse(de, 170, .9, .14, 1200), .45, swing=sw)
    M.patron('bat', 'x.x.x.x.x.x.x.x.', lambda: charley(de, False, 5500), .11, .3, swing=sw)
    gt = M.piste('guitare'); b = M.piste('basse')
    for m in range(16):
        d = prog[(m // 2) % 4]; notes = accord(T + 12, 'dor', d)
        ordre = [0, 1, 2, 3, 2, 1] if m % 2 == 0 else [3, 2, 1, 0]
        for i, k in enumerate(ordre):
            p = i * (16 // len(ordre))
            gt.pose(M.t(m, p, sw), karplus(notes[k], 2.2, .35, .995, de), .32, -.35 + .2 * k)
        if m % 2 == 0:
            r = deg(T - 12, 'dor', d); nn = int(M.temps * 3 * SR)
            b.pose(M.t(m, 0, sw), filtre(tri(hz(r), nn) * env(nn, .01, .8, .3), 'low', 500), .6)
            b.pose(M.t(m + 1, 4, sw), filtre(tri(hz(r + 7), int(M.temps * SR)) * env(int(M.temps * SR), .01, .3, .2), 'low', 500), .4)
    for m in (9, 11, 13, 15):  # en B, une petite phrase de guitare qui répond
        for i, dd in enumerate([4, 6, 7, 6]):
            gt.pose(M.t(m, 8 + i * 2, sw), karplus(deg(T + 24, 'dor', dd), 1.4, .55, .994, de), .22, .45)
    wl, wr = wobble(gt.L, gt.R, .003, .35); gt.L, gt.R = wl, wr
    cr = M.piste('vinyle'); z = craquement(de, M.n); cr.L += z; cr.R += np.roll(z, 911)
    rL, rR = reverbe(gt.L, gt.R, 1.6, 4000, de=de)
    M.piste('fx').L += rL * .3; M.piste('fx').R += rR * .3
    return M, fin(M, {'bat': 1, 'guitare': 1, 'basse': 1, 'vinyle': .7, 'fx': 1}, maitre_lp=9000)

def hypervitesse():
    """HYPERVITESSE — drum'n'bass pour la nitro et le vide. Un break en double-croches (grosse caisse, caisse claire,
    fantômes), basse REESE (scies désaccordées qui battent) dont le filtre respire, nappe haute. 174 BPM : ça file."""
    M = Morceau(174, graine=77); de = M.de; T = 54  # fa#2 → FA# mineur
    prog = [0, 5, 3, 4]
    brk = ['x.........x.....', 'x.x.......x.....']
    sn = ['....x..o.o..x...', '....x..o.o..x.xo']
    for m in range(16):
        M.patron('bat', brk[m % 2], lambda: kick(de, 170, 50, .22, .8, 1.8), 1.0, mes=[m])
        M.patron('bat', sn[m % 4 == 3], lambda: caisse(de, 210, 1.1, .12, 2200), .7, mes=[m])
    M.patron('bat', 'x.x.x.x.x.x.x.x.', lambda: charley(de, False, 9500), .13, .3, mes=range(4, 16))
    M.patron('bat', '..............x.', lambda: charley(de, True, 8000), .15, -.3)
    re = M.piste('reese'); pad = M.piste('pad')
    for m in range(0, 16, 2):
        d = prog[(m // 2) % 4]; r = deg(T - 12, 'min', d); dur = M.temps * 8
        nn = int(dur * SR); t = np.arange(nn) / SR
        s = scie(hz(r) * 1.007, nn) + scie(hz(r) * .993, nn) + .6 * sinus(hz(r) / 2, nn)
        fc = 250 + 900 * (.5 + .5 * np.sin(2 * np.pi * t / (M.temps * 2)))
        re.pose(M.t(m), np.tanh(balaye(s, fc) * 1.8) * env(nn, .01, 9, 1, .05, dur - .05), .45)
        for note in accord(T + 24, 'min', d, False):
            l, rr = supersaw(note, dur + .4, 3, 10, de)
            e = env(len(l), .6, 9, 1, .4, dur)
            pad.pose2(M.t(m), filtre(l * e, 'low', 4000), filtre(rr * e, 'low', 4000), .07)
    rL, rR = reverbe(pad.L + M.bus['bat'].L * .15, pad.R + M.bus['bat'].R * .15, 2.5, 7000, de=de)
    M.piste('fx').L += rL * .5; M.piste('fx').R += rR * .5
    return M, fin(M, {'bat': 1, 'reese': 1, 'pad': 1, 'fx': 1})

BOUCLES = [
    ('neon-drive', neon_drive, {'titre': 'NÉON DRIVE', 'bpm': 118, 'cle': 'la mineur', 'ton': -4, 'pour': 'COURSE · NUAGES',
        'idee': "Synthwave de course : quatre temps, basse en octaves qui pompe, supersaw large, arpège en ping-pong. En B, un lead maison chante au-dessus."}),
    ('pluie-neon', pluie_neon, {'titre': 'PLUIE NÉON', 'bpm': 88, 'cle': 'fa mineur', 'ton': 4, 'pour': 'COURSE · VILLE',
        'idee': "La ville la nuit sous la pluie : Rhodes FM en accords de 9e, boom-bap qui traîne, sous-basse ronde, pluie et vinyle."}),
    ('apesanteur', apesanteur, {'titre': 'APESANTEUR', 'bpm': 96, 'cle': 'ré dorien', 'ton': 1, 'pour': 'COURSE · ORBITE',
        'idee': "Sans caisse claire : des cloches FM qui tombent au hasard (graine fixe), une nappe qui s'ouvre, un cœur de sous-basse, une réverbe immense."}),
    ('dark-triad', dark_triad, {'titre': 'DARK TRIAD', 'bpm': 140, 'cle': 'do# phrygien', 'ton': 0, 'pour': 'FRÉNÉSIE',
        'idee': "Phonk : cowbell accordée qui joue le riff, 808 qui glisse et sature, charley en rafales, clap Memphis, montée à la mesure 8."}),
    ('caisse-enregistreuse', caisse_enregistreuse, {'titre': 'CAISSE ENREGISTREUSE', 'bpm': 124, 'cle': 'sol dorien', 'ton': -2, 'pour': 'BOUTIQUE · MISSIONS',
        'idee': "House de boutique : orgue en accords piqués, charley qui swingue, basse qui rebondit — et des PIÈCES qui tombent comme percussion."}),
    ('garage-lofi', garage_lofi, {'titre': 'GARAGE', 'bpm': 82, 'cle': 'mi dorien', 'ton': 3, 'pour': 'GARAGE',
        'idee': "Lo-fi d'atelier : guitare en cordes pincées (Karplus-Strong), batterie étouffée, bande qui pleure, vinyle. Deux heures du matin sur l'établi."}),
    ('hypervitesse', hypervitesse, {'titre': 'HYPERVITESSE', 'bpm': 174, 'cle': 'fa# mineur', 'ton': 5, 'pour': 'NITRO · ORBITE',
        'idee': "Drum'n'bass : break en doubles-croches, basse REESE dont le filtre respire, nappe haute. Ça file."}),
]

def ecrit_wav(chemin, L, R):
    x = np.stack([L, R], 1); x = (np.clip(x, -1, 1) * 32767).astype('<i2')
    w = wave.open(chemin, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes()); w.close()

# ================================================================== LES COUCHES (la musique qui suit la vitesse)
"""(2026-10-01, Léo : « qu'au début, quand c'est lent, on ait quelques notes, mélodieux, harmonieux — puis que la musique
évolue en parallèle de la vitesse »). Une boucle se rend aussi en COUCHES (stems) : des fichiers de même longueur, calés
à l'échantillon, qui s'ADDITIONNENT exactement pour redonner le morceau. Le jeu les joue toutes ensemble et monte chacune
quand la vitesse passe son SEUIL (fraction de la vitesse de croisière). La 1re couche est toujours HARMONIQUE (nappe,
accords, cloches) : à l'arrêt on entend la couleur du morceau, jamais un tambour tout seul.
Méthode : la boucle est rendue une fois par couche, les bus des couches suivantes MUETS (le hasard avance à l'identique,
les réverbes ne reçoivent que ce qui joue) ; couche n = mélange(1..n) − mélange(1..n−1). Un seul gain pour toutes (celui
du morceau complet), pas de limiteur (il casserait l'addition) : le jeu limite en sortie.
`sol` : la couche se tait EN VOL (la grosse caisse — on flotte, et elle retombe à la pose : le drop). """
COUCHES = {
    'neon-drive': [('NAPPE', ['pad'], 0), ('ARPEGE', ['arp'], .3), ('BASSE', ['basse'], .5), ('RYTHME', ['bat'], .7),
                   ('GROSSE CAISSE', ['kick'], .82, 'sol'), ('LEAD', ['lead'], .97)],
    'pluie-neon': [('RHODES', ['rhodes', 'pluie'], 0), ('BASSE', ['basse'], .45), ('BATTERIE', ['bat'], .72, 'sol')],
    'niv-altitude': [('ACCORDS', ['pluck'], 0), ('BASSE', ['basse'], .4), ('RYTHME', ['bat'], .65), ('GROSSE CAISSE', ['kick'], .85, 'sol')],
    'niv-neon-noir': [('NAPPE', ['pad'], 0), ('BASSE', ['basse'], .4), ('CAISSE', ['sn'], .62), ('BATTERIE', ['bat'], .82, 'sol')],
    'niv-gravite': [('NAPPE', ['pad'], 0), ('CLOCHES', ['cloches'], .35), ('POULS', ['basse'], .6), ('SOUFFLE', ['vide', 'bat'], .85)],
}

def rendre_couches(bid, fn, couches):
    # ⚠ les boucles de boucles8.py vivent dans le module `boucles` (importé), celles d'ici dans `__main__` : on règle
    # MUET / FIN_BRUT dans le module de la FONCTION, sinon les couches de 8 s sortaient toutes pleines
    mod = sys.modules[fn.__globals__['fin'].__module__]; MUET = mod.MUET  # le module qui porte fin() et Piste
    mod.FIN_BRUT = True; MUET.clear()
    try:
        M, (L, R) = fn()
        k = 10 ** (-15 / 20) / max(np.sqrt(((L ** 2 + R ** 2) / 2).mean()), 1e-9)
        tous = set(M.bus) - {'fx'}
        cum = []; av = set()
        for c in couches:
            av |= set(c[1]); MUET.clear(); MUET.update(tous - av)
            _, (l, r) = fn(); cum.append((l * k, r * k))
        MUET.clear()
        pk = max(np.abs(cum[-1][0]).max(), np.abs(cum[-1][1]).max()); g = min(1., .89 / pk)  # le tout ne dépasse pas −1 dBFS
        sorties = []; prec = (0, 0)
        for i, (c, (l, r)) in enumerate(zip(couches, cum)):
            sl, sr = (l - prec[0]) * g, (r - prec[1]) * g; prec = (l, r)
            nom = '%s--c%d' % (bid, i + 1); wav = os.path.join(SORTIE, nom + '.wav'); m4a = os.path.join(SORTIE, nom + '.m4a')
            ecrit_wav(wav, sl, sr)
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '160000', '-q', '127', wav, m4a], check=True); os.remove(wav)
            sorties.append({'nom': c[0], 'f': 'assets/audio/music/boucles/' + nom + '.m4a', 'seuil': c[2], 'sol': len(c) > 3 and c[3] == 'sol',
                            'rms': round(float(np.sqrt(((sl ** 2 + sr ** 2) / 2).mean())), 5), 'pics': pics(sl, sr, 200)})
            print('   couche %d %-14s seuil %.2f  RMS %.1f dB' % (i + 1, c[0], c[2], 20 * np.log10(np.sqrt(((sl ** 2 + sr ** 2) / 2).mean()) + 1e-9)))
        return sorties
    finally:
        mod.FIN_BRUT = False; MUET.clear()

def pics(L, R, n=600):
    m = np.maximum(np.abs(L), np.abs(R)); k = len(m) // n
    return [round(float(v), 3) for v in m[:k * n].reshape(n, k).max(1)]

if __name__ == '__main__':
    filtre_id = sys.argv[1] if len(sys.argv) > 1 else ''
    os.makedirs(SORTIE, exist_ok=True)
    donnees_f = os.path.join(SORTIE, 'boucles-donnees.js')
    anciennes = {}
    if os.path.exists(donnees_f):
        try: anciennes = {b['id']: b for b in json.loads(open(donnees_f).read().split('=', 1)[1].rstrip().rstrip(';'))}
        except Exception: anciennes = {}
    liste = []
    from boucles8 import BOUCLES8  # les boucles de 8 secondes (lobby, niveaux)
    for b in BOUCLES: b[2].setdefault('groupe', 'LONGUES · 16 MESURES')
    TOUTES = BOUCLES + BOUCLES8
    for bid, fn, info in TOUTES:
        if filtre_id and filtre_id not in bid:
            if bid in anciennes: liste.append(anciennes[bid])
            continue
        print('…', bid, flush=True)
        M, (L, R) = fn()
        wav = os.path.join(SORTIE, bid + '.wav'); m4a = os.path.join(SORTIE, bid + '.m4a')
        ecrit_wav(wav, L, R)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, m4a], check=True)
        os.remove(wav)
        crete = 20 * np.log10(max(np.abs(L).max(), np.abs(R).max()))
        rms = 20 * np.log10(np.sqrt(((L ** 2 + R ** 2) / 2).mean()))
        print('   %.1f s · crête %.1f dBFS · RMS %.1f dB' % (len(L) / SR, crete, rms))
        d = dict(info); d.update({'id': bid, 'f': 'assets/audio/music/boucles/' + bid + '.m4a', 'dur': round(len(L) / SR, 5),
                                  'mesures': M.mes, 'pics': pics(L, R)})
        if bid in COUCHES: d['couches'] = rendre_couches(bid, fn, COUCHES[bid])
        liste.append(d)
    ordre = [b[0] for b in TOUTES]; liste.sort(key=lambda d: ordre.index(d['id']))
    open(donnees_f, 'w').write('window.BOUCLES=' + json.dumps(liste, ensure_ascii=False) + ';\n')
    print('ok →', SORTIE)
