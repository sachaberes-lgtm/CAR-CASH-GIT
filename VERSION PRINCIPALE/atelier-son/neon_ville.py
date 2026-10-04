"""NÉON — la musique du NIVEAU 1 de la VILLE (2026-10-05, Léo apporte `studio-musique.md` : « musique pour niveau 1 ville »).
La boucle « Néon » de son Studio, recréée note pour note depuis sa définition JSON : 120 BPM, 4 mesures, la ville la nuit avec la
brillance années 80 (The Weeknd) — basse de synthé en croches régulières comme un moteur, sub propre dessous, grande nappe Juno qui
ondule (filtre qui dérive 1,2 → 3,2 kHz, chorus très large), piano électrique discret, le cuivre synthétique à la Vangelis (CS-80) qui
s'ouvre et flotte, un souffle d'accord qui relance chaque tour. Sans batterie. Fa# → sol dans la basse : Ré maj7/fa# · Sol maj7 · Mi/fa#.
« evolve » : chaque tour de 4 mesures tire SA variante (poids du JSON) — le fichier enchaîne 12 tours (96 s) qui ne se répètent pas
exactement, sans couture (la queue est repliée sur le début). Le crépitement et le souffle de bande du JSON sont laissés de côté (Léo
avait fait retirer le grésillement de VAPEUR).
Sortie : assets/audio/music/ville/ville-n1.m4a. Lancer : <venv>/python atelier-son/neon_ville.py
"""
import os, sys, json, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from boucles import *  # noqa: F403
from boucles8 import chorus, fx_rev
from vapeurs import rhodes_p

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(os.path.dirname(ICI), 'assets', 'audio', 'music', 'ville')
JSON_SRC = os.path.join(os.path.dirname(os.path.dirname(ICI)), 'studio-musique.md')
TOURS = 12
NOMS = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def midi(nom):
    """« F#2 » → 42"""
    b = NOMS[nom[0]]; i = 1
    while i < len(nom) and nom[i] in '#b': b += 1 if nom[i] == '#' else -1; i += 1
    return 12 * (int(nom[i:]) + 1) + b


def lire_def():
    t = open(JSON_SRC).read(); a = t.index('```json') + 7; z = t.index('```', a)
    return json.loads(t[a:z])


# ---------------------------------------------------------------------------- les instruments
def synthbass(n, dur, v):
    nn = int((dur + .05) * SR); t = np.arange(nn) / SR; f = hz(n)
    s = scie(f, nn) * .6 + carre(f, nn, .4) * .4
    s = balaye(s * env(nn, .004, .18, .5, .03, dur), 220 + (700 + 1300 * v) * np.exp(-t / .09))
    return np.tanh(s * 1.6) * .8


def sub(n, dur):
    nn = int((dur + .1) * SR); return sinus(hz(n), nn) * env(nn, .03, 9, 1, .08, dur)


def juno(notes, dur, de, t0, lfo_s):
    L = 0; R = 0
    for n in notes:
        l, r = supersaw(n, dur + .7, 4, 18, de); L = L + l; R = R + r
    nn = len(L); t = np.arange(nn) / SR
    e = env(nn, .35, 9, 1, .6, dur); L = L * e / len(notes); R = R * e / len(notes)
    fc = 1200 + 2000 * (.5 + .5 * np.sin(2 * np.pi * (t0 + t) / lfo_s))   # la DÉRIVE du filtre (1,2 → 3,2 kHz)
    return balaye(L, fc), balaye(R, fc)


def cs80(n, dur, v):
    """le cuivre synthétique façon CS-80 : deux scies désaccordées, l'attaque qui gonfle, le filtre qui S'OUVRE puis flotte, vibrato tardif"""
    nn = int((dur + .8) * SR); t = np.arange(nn) / SR
    f = hz(n) * (1 + .006 * np.sin(2 * np.pi * 5.3 * t) * np.clip((t - .35) / .4, 0, 1))
    s = scie(f * 2 ** (7 / 1200), nn) * .5 + scie(f * 2 ** (-7 / 1200), nn) * .5
    fc = 500 + 2600 * (1 - np.exp(-t / .3)) * (.6 + .4 * v)
    return balaye(s * env(nn, .14, 9, 1, .7, dur), fc) * .8


def souffle(notes, dur, de):
    """le SOUFFLE d'accord qui relance le tour : la nappe qui gonfle très vite et s'arrête net sur le 1er temps"""
    L = 0; R = 0
    for n in notes:
        l, r = supersaw(n, dur, 3, 12, de); L = L + l; R = R + r
    nn = len(L); e = (np.arange(nn) / nn) ** 2.2
    return filtre(L * e / len(notes), 'low', 3500), filtre(R * e / len(notes), 'low', 3500)


def tirer(variants, rng):
    w = np.array([v.get('w', 1) for v in variants], float); return variants[rng.choice(len(variants), p=w / w.sum())]


def composer():
    D = lire_def(); bpm = D['bpm']; pas_loop = 16 * D['bars']
    M = Morceau(bpm, mesures=D['bars'] * TOURS, graine=1205); de = M.de; dc = M.dc; rng = np.random.default_rng(1205)
    tr = {x['inst']: x for x in D['tracks']}
    for k in range(TOURS):
        base = k * pas_loop * dc
        for p, nom, lg, v in tirer(tr['synthbass']['variants'], rng)['notes']:
            M.piste('basse').pose(base + p * dc, synthbass(midi(nom), lg * dc * .9, v), .5 * v)
        for p, nom, lg, v in tirer(tr['sub']['variants'], rng)['notes']:
            M.piste('sub').pose(base + p * dc, sub(midi(nom), lg * dc), .55)
        for p, notes, lg, v in tirer(tr['juno']['variants'], rng)['notes']:
            l, r = juno([midi(x) for x in notes], lg * dc, de, base + p * dc, 8.); M.piste('juno').pose2(base + p * dc, l, r, .5 * v)
        for p, notes, lg, v in tirer(tr['rhodes']['variants'], rng)['notes']:
            for j, x in enumerate(notes):
                M.piste('rh').pose(max(0., base + p * dc + rng.normal(0, .008) + j * .006), rhodes_p(midi(x), lg * dc + .5, v), .09 * v, -.3 + .2 * j)
        for p, nom, lg, v in tirer(tr['cs80']['variants'], rng)['notes']:
            M.piste('cs80').pose(base + p * dc, cs80(midi(nom), lg * dc, v), .26 * v, .12)
        for p, notes, lg, v in tirer(tr['swell']['variants'], rng)['notes']:
            l, r = souffle([midi(x) for x in notes], lg * dc, de); M.piste('souffle').pose2(base + p * dc, l, r, .35)
    M.bus['juno'].L, M.bus['juno'].R = chorus(M.bus['juno'].L, M.bus['juno'].R, 18, 4, .45)   # le chorus TRÈS large de la Juno
    M.bus['rh'].L, M.bus['rh'].R = wobble(M.bus['rh'].L, M.bus['rh'].R, .003, .5)             # la bande qui pleure sur le piano
    eL, eR = echo(M.bus['cs80'].L, M.bus['cs80'].R, M.temps * .75, .35); M.bus['cs80'].L += eL * .3; M.bus['cs80'].R += eR * .3
    fx_rev(M, [('juno', .45), ('rh', .35), ('cs80', .7), ('souffle', .5)], 3.4, .42, 5200)
    return M, fin(M, {'basse': 1, 'sub': .9, 'juno': 1, 'rh': .9, 'cs80': 1, 'souffle': .8, 'fx': 1}, maitre_lp=11000)


if __name__ == '__main__':
    os.makedirs(SORTIE, exist_ok=True)
    M, (L, R) = composer(); wav = os.path.join(SORTIE, 'ville-n1.wav'); ecrit_wav(wav, L, R)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(SORTIE, 'ville-n1.m4a')], check=True)
    os.remove(wav); print('  ville-n1  %.1f s' % (len(L) / SR)); print('ok')
