"""OG GINOBILI + CLAUDE (2026-10-01, Léo : « analyse ce son — ce que j'aime : la mélodie, la structure, l'harmonie, les contrastes et
les variations, à la fois chaotiques et cohérentes — rajoute-toi quelques instruments »).

L'ANALYSE (mesurée, voir la passation §5 undecies) : 145,06 BPM, 1er temps à 0,021 s, 72 mesures. Une basse qui oscille d'un DEMI-TON
toutes les 2 mesures : do (do mineur) ↔ do# (ré♭, le 2e degré abaissé, phrygien) — c'est elle qui donne la tension sombre. La mélodie
tourne autour de SOL (la quinte, une pédale) et la brode de notes voisines chromatiques (la♭, fa#, mi♭, ré, si♭) : chaotique en surface,
tenue par le pivot. Structure : A (0-53 s) clairsemée, 808 syncopée, presque pas de charley · B (53 s) la batterie entre (caisse et
charleys doublent) · trou d'une mesure à 77,8 s · C (79,4 s) la mélodie change de registre (ré5, la♭), charleys de plus en plus serrés.

CE QUE J'AJOUTE (synthèse maison, calée à l'échantillon sur sa grille) :
- CORDES : do m ↔ ré♭ en mouvement conjoint (sol→la♭, do→ré♭, mi♭→fa : l'harmonie bouge d'un demi-ton comme la basse), entrent à la
  mesure 8, filtre qui s'ouvre de section en section, une voix aiguë en plus en C.
- CLOCHES DE VERRE : un contre-chant dans les TROUS de sa mélodie, une cellule par 2 mesures qui MUTE (les mêmes notes pivots, l'ordre,
  le registre et la place changent) — plus libre, plus « chaotique » en C, toujours ancré sur sol / la♭.
- CUIVRES : un accord de ré♭ claqué sur chaque bascule vers do# (le contraste souligné), à partir de B.
- ARPÈGE DE VERRE : des doubles croches qui suivent l'accord, discrètes, en C seulement (la 3e couleur du morceau).
- TRANSITIONS : cymbale inversée qui aspire vers B, impact sur B, chute filtrée dans le trou de 77,8 s, impact + sous-grave sur C.
Sorties (hors git) : atelier-son/studio/references/labo/ — l'original ré-encodé, le mix, et chaque instrument SEUL (même calage :
on les remélange dans le studio).
"""
import os, sys, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from compo import *  # noqa: F403

SRC = os.path.expanduser('~/Downloads/Og Ginobili.mp3')
OUT = os.path.join(os.path.dirname(__file__), 'studio', 'references', 'labo')
BPM, B0 = 145.055, 0.021
BAR = 240 / BPM; PAS = BAR / 16
C, DB = 60, 61  # do4, ré♭4


def lit(chemin):
    wav = os.path.join(OUT, '_src.wav')
    subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@44100', chemin, wav], check=True)
    from scipy.io import wavfile
    sr, x = wavfile.read(wav); os.remove(wav)
    x = x.astype(np.float64) / 32768
    return x[:, 0], x[:, 1]


def t_de(b, s=0.): return B0 + b * BAR + s * PAS


def pose(L, R, l, r, t, g=1., pan=0.):
    i = int(t * SR)
    if i >= len(L): return
    m = min(len(l), len(L) - i); gl, gr = g * (1 - max(0, pan)), g * (1 + min(0, pan))
    L[i:i + m] += l[:m] * gl; R[i:i + m] += r[:m] * gr


def accord(b): return 'do' if b % 4 < 2 else 'reb'


def cordes(n, de):
    L = np.zeros(n); R = np.zeros(n)
    V = {'do': [55, 60, 63], 'reb': [56, 61, 65]}           # sol do mi♭ → la♭ ré♭ fa : chaque voix monte d'un demi-ton
    H = {'do': [67, 75], 'reb': [68, 77]}                   # la voix aiguë de C
    for b in range(8, 72, 2):
        fc = 900 if b < 33 else (1700 if b < 48 else 2600)
        l, r = nappe(de, V[accord(b)], 2 * BAR - .1, fc); pose(L, R, l, r, t_de(b), .55 if b < 33 else .7)
        if b >= 48:
            l, r = nappe(de, H[accord(b)], 2 * BAR - .1, 3200); pose(L, R, l, r, t_de(b), .32, .25)
    return L, R


def cloches(n, de):
    """le contre-chant : une cellule de 3-5 notes par 2 mesures, sur les contretemps où SA mélodie se tait ; la cellule MUTE"""
    L = np.zeros(n); R = np.zeros(n); rng = np.random.default_rng(161)
    piv = {'do': [79, 80, 79, 75, 74], 'reb': [80, 77, 73, 80, 79]}   # sol la♭ sol mi♭ ré · la♭ fa ré♭ la♭ sol
    places = [3, 6, 10, 13, 14, 19, 22, 27, 30]                         # seizièmes sur 2 mesures (32), loin des temps forts
    cellule = None
    for b in range(16, 72, 2):
        if b in (46,): continue                                          # on laisse respirer le trou de 77,8 s
        chaos = .2 if b < 33 else (.35 if b < 48 else .6)
        if cellule is None or rng.random() < chaos:                     # la mutation : on garde le dessin, on bouge un élément
            k = rng.integers(3, 6 if b >= 48 else 5)
            cellule = sorted(rng.choice(places, k, replace=False).tolist())
        notes = piv[accord(b)][:]
        if rng.random() < chaos: rng.shuffle(notes)
        for j, s in enumerate(cellule):
            m = notes[j % len(notes)] + (12 if (b >= 48 and rng.random() < .25) else 0)
            l, r = cloche(de, m, 1.4)
            pose(L, R, l, r, t_de(b, s), .5 * (.75 + .25 * rng.random()), (-.5, .5)[j % 2] * (.4 if b < 48 else .8))
    return L, R


def cuivres(n, de):
    L = np.zeros(n); R = np.zeros(n)
    for b in range(33, 72):
        if b % 4 == 2 and b != 46:
            l, r = stab(de, [49, 56, 61, 65], .5, 7, 22, 5000); pose(L, R, l, r, t_de(b), .8)
            if b >= 48:
                l, r = stab(de, [61, 65, 68], .3, 5, 18, 7000); pose(L, R, l, r, t_de(b, 10), .45)
    return L, R


def arpege(n, de):
    L = np.zeros(n); R = np.zeros(n)
    A = {'do': [72, 75, 79, 84], 'reb': [73, 77, 80, 85]}
    ordres = [[0, 1, 2, 3], [0, 2, 1, 3], [3, 2, 1, 0], [0, 2, 3, 1]]
    for b in range(48, 72):
        o = ordres[(b // 2) % 4]
        for s in range(16):
            if s % 4 == 0 and s: continue                    # le temps appartient à sa batterie
            m = A[accord(b)][o[s % 4]]
            l, r = pluck(de, m, .22, 3, 6500); pose(L, R, l, r, t_de(b, s), .35 + .1 * (s % 2 == 0), .45 * np.sin(s * .8))
    return L, R


def transitions(n, de):
    L = np.zeros(n); R = np.zeros(n)
    ci = crash_inverse(de, BPM); pose(L, R, ci, ci, t_de(33) - len(ci) / SR, .7)
    for b, g in ((33, .7), (48, .9)):
        l, r = impact(de); pose(L, R, l, r, t_de(b), g)
    sd = sub_drop(de); pose(L, R, sd, sd, t_de(48), .6)
    d = descente(de, BPM); pose(L, R, d, d, t_de(47), .7)
    return L, R


def niveau(L, R, cible):
    rms = np.sqrt(((L ** 2 + R ** 2) / 2)[np.abs(L) + np.abs(R) > 1e-4].mean()) + 1e-9
    k = 10 ** (cible / 20) / rms; return L * k, R * k


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    oL, oR = lit(SRC); n = len(oL); de = Des(1607)
    parts = {'cordes': (cordes, -16), 'cloches': (cloches, -17), 'cuivres': (cuivres, -14), 'arpege': (arpege, -20), 'transitions': (transitions, -15)}
    mixL, mixR = oL * .8, oR * .8                       # son mix est déjà écrasé (−4,5 dB RMS) : on lui fait une place
    for nom, (f, cible) in parts.items():
        L, R = f(n, de); L, R = niveau(L, R, cible)
        mixL += L; mixR += R
        sL, sR = np.tanh(L * 1.0), np.tanh(R * 1.0)
        ecrit_wav(os.path.join(OUT, '_t.wav'), sL, sR)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', os.path.join(OUT, '_t.wav'), os.path.join(OUT, 'og-ginobili--' + nom + '.m4a')], check=True)
        print('  ', nom, 'ok', flush=True)
    mixL, mixR = np.tanh(mixL * 1.3) * .94, np.tanh(mixR * 1.3) * .94   # un limiteur doux : la même sonie que l'original, pas un mix au rabais
    for nom, (L, R) in (('og-ginobili--avec-claude', (mixL, mixR)), ('og-ginobili', (oL, oR))):
        ecrit_wav(os.path.join(OUT, '_t.wav'), L, R)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '256000', os.path.join(OUT, '_t.wav'), os.path.join(OUT, nom + '.m4a')], check=True)
    os.remove(os.path.join(OUT, '_t.wav'))
    print('ok →', OUT)
