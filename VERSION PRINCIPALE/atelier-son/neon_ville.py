"""NÉON COMPLÈTE 1 À 5 — les musiques des NIVEAUX 1 À 5 de la VILLE (2026-10-05, Léo apporte `neon-complete-1-a-5.md` : « voilà les
musiques 1 à 5 de la ville »). Cinq chapitres de sa boucle « Néon » (Studio), recréés depuis leur définition JSON, note pour note :
  1 · NÉON COMPLÈTE   — Néon + les lumières de verre qui scintillent en arpège, la nappe qui respire, une 3e phrase de cuivre.
  2 · le chapitre suivant : trois nouvelles phrases de cuivre plus hautes, accords tenus, basse qui marche vers chaque accord.
  3 · « boom et bulles » : un boom grave rond (bloup à l'attaque), des plocs de goutte sur 2 et 4, des bulles qui éclatent de gauche à
      droite, des grappes de bulles accordées, une ligne de violoncelle, un refrain de trois notes au cuivre.
  4 · le 3 + une frappe métallique grave à la Vangelis (Blade Runner) toutes les 16 s, dans un espace immense.
  5 · le 4 avec une mélodie de cuivre beaucoup plus développée (doubles croches syncopées, passages, sauts), jouée moins fort.
Le moteur : une piste = un instrument (`inst`), sa boucle (`len` mesures), ses variantes pondérées (`w`) tirées à chaque tour
(« evolve »), `vol` (dB, relatif au mixage de Néon), `rev` (envoi vers la salle), `prob` (une note sur… joue), `active` (mesures où
elle joue), `human`/`late` (la main), `pump` (respire sur la grosse caisse, ou sur les temps s'il n'y en a pas), `drift` (la dérive du
filtre de la Juno). Chaque fichier enchaîne 12 tours de 4 mesures (96 s, sans couture). Le souffle de bande (`hiss`) n'est pas rendu.
Sorties : assets/audio/music/ville/ville-n1…n5.m4a + ville-donnees.js. Lancer : <venv>/python atelier-son/neon_ville.py [n]
"""
import os, sys, json, re, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from boucles import *  # noqa: F403
from boucles8 import chorus, fx_rev
from vapeurs import rhodes_p

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(os.path.dirname(ICI), 'assets', 'audio', 'music', 'ville')
SRC = os.path.join(os.path.dirname(os.path.dirname(ICI)), 'neon-complete-1-a-5.md')
TOURS = 12
NOMS = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
# le niveau d'un instrument à `vol` = REF (le mixage de Néon), et la référence de son `vol`
BASE = {'synthbass': .36, 'sub': .17, 'juno': .42, 'rhodes': .1, 'cs80': .56, 'bell': .22, 'swell': .3, 'boomkick': .55,   # (mesuré : la 1re passe noyait
        'cello': .2, 'ploc': .32, 'pop': .26, 'bubble': .22, 'gong': .5}                                                      #  tout dans le grave, −45 dB d'aigus)
# (2026-10-05, Léo : « tu as oublié un LEAD important qui donnait de la vie aux 5 niveaux ») : le cuivre CS-80 était ENTERRÉ (mesuré :
# −10 dB sous la sous-basse aux niveaux 1-2, −22 dB aux niveaux 3-5 — leurs −11/−12 dB du Studio appliqués à la lettre). Son `vol` ne compte
# plus qu'à 30 % (le 5 reste « joué moins fort », sans disparaître) et la sous-basse, qui écrasait tout, descend.
VOL_K = {'cs80': .15}
REF = {'synthbass': 0, 'sub': -18, 'juno': 0, 'rhodes': -17, 'cs80': 0, 'bell': -25, 'swell': -16, 'boomkick': -8, 'cello': 0,
       'ploc': -13, 'pop': -21, 'bubble': 0, 'gong': 0}


def midi(nom):
    b = NOMS[nom[0]]; i = 1
    while i < len(nom) and nom[i] in '#b': b += 1 if nom[i] == '#' else -1; i += 1
    return 12 * (int(nom[i:]) + 1) + b


def lire_defs():
    t = open(SRC).read(); return [json.loads(b) for b in re.findall(r"```json\n(.*?)\n```", t, re.S)]


def notes_de(x): return [midi(n) for n in x] if isinstance(x, list) else [midi(x)]


# ---------------------------------------------------------------------------- les instruments
def synthbass(n, dur, v, de, P):
    nn = int((dur + .05) * SR); t = np.arange(nn) / SR; f = hz(n)
    s = scie(f, nn) * .6 + carre(f, nn, .4) * .4
    s = balaye(s * env(nn, .004, .18, .5, .03, dur), 220 + (700 + 1300 * v) * np.exp(-t / .09))
    return np.tanh(s * 1.6) * .8


def sub(n, dur, v, de, P):
    nn = int((dur + .1) * SR); return sinus(hz(n), nn) * env(nn, .03, 9, 1, .08, dur)


def cs80(n, dur, v, de, P):
    nn = int((dur + .8) * SR); t = np.arange(nn) / SR
    f = hz(n) * (1 + .006 * np.sin(2 * np.pi * 5.3 * t) * np.clip((t - .35) / .4, 0, 1))
    s = scie(f * 2 ** (7 / 1200), nn) * .5 + scie(f * 2 ** (-7 / 1200), nn) * .5
    a = .03 if dur < .3 else .12                                                   # les phrases rapides attaquent plus franc
    fc = 700 + 4200 * (1 - np.exp(-t / (.12 if dur < .3 else .3))) * (.6 + .4 * v)   # (le cuivre s'ouvre plus haut : la brillance de Vangelis)
    return balaye(s * env(nn, a, 9, 1, .5, dur), fc) * .8


def bell(n, dur, v, de, P):
    """les LUMIÈRES DE VERRE : une cloche FM claire, courte, qui tinte tout en haut"""
    return plus(fm(n, .9, 3.5, 2.6, .05, .32), .3 * fm(n + 12, .4, 4, 1.2, .02, .1))   # le verre : un éclat à l'octave au contact


def cello(n, dur, v, de, P):
    """le VIOLONCELLE : une scie à l'archet (attaque lente, vibrato), filtrée par le corps de l'instrument"""
    nn = int((dur + .3) * SR); t = np.arange(nn) / SR
    f = hz(n) * (1 + .005 * np.sin(2 * np.pi * 5. * t) * np.clip((t - .25) / .4, 0, 1))
    s = scie(f, nn) * env(nn, .16, 9, 1, .25, dur)
    return passe_bande(s, 120, 1800) * 1.1 + .25 * passe_bande(s, 2200, 3200)


def bubble(n, dur, v, de, P):
    """une BULLE accordée : la note qui monte en éclatant"""
    nn = int(.16 * SR); t = np.arange(nn) / SR; f = hz(n) * (.62 + .38 * (1 - np.exp(-t / .018)))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .05) * (1 - np.exp(-t / .002))


def swell(notes, dur, v, de, P):
    L = 0; R = 0
    for n in notes:
        l, r = supersaw(n, dur, 3, 12, de); L = L + l; R = R + r
    nn = len(L); e = (np.arange(nn) / nn) ** 2.2
    return filtre(L * e / len(notes), 'low', 3500), filtre(R * e / len(notes), 'low', 3500)


def juno(notes, dur, v, de, P, t0=0.):
    L = 0; R = 0
    for n in notes:
        l, r = supersaw(n, dur + .7, 4, 18, de); L = L + l; R = R + r
    nn = len(L); t = np.arange(nn) / SR; dr = P.get('drift', {'min': 1200, 'max': 3200, 'period': 16})
    e = env(nn, .35, 9, 1, .6, dur); L = L * e / len(notes); R = R * e / len(notes)
    per = dr['period'] * .5                                                           # la période en temps (16 temps = 8 s à 120)
    fc = dr['min'] + (dr['max'] - dr['min']) * (.5 + .5 * np.sin(2 * np.pi * (t0 + t) / per))
    return balaye(L, fc), balaye(R, fc)


def gong(notes, dur, v, de, P):
    """la FRAPPE à la Vangelis : un métal grave aux partiels inharmoniques qui s'éteint très lentement, un boom grave dessous"""
    nn = int(7. * SR); t = np.arange(nn) / SR; s = 0
    for n in notes:
        f = hz(n)
        for r, a, d in ((1, 1, 3.5), (2.76, .55, 2.4), (5.4, .3, 1.5), (8.93, .16, .9), (13.3, .08, .5)):
            s = s + a * np.sin(2 * np.pi * f * r * t * (1 + .0015 * np.sin(2 * np.pi * .7 * t))) * np.exp(-t / d)
    boom = np.sin(2 * np.pi * np.cumsum(55 * 2 ** (-t / .4)) / SR) * np.exp(-t / .6)
    att = passe_bande(de.bruit(nn), 300, 2500) * np.exp(-t / .03) * .3
    return (s / len(notes) * .6 + boom * .7 + att) * (1 - np.exp(-t / .003))


def boomkick(de, P):
    k0 = kick(de, 130, P.get('kickPitch', 44), .5, .15, 1.3); nn = int(.04 * SR); t = np.arange(nn) / SR
    bl = np.sin(2 * np.pi * np.cumsum(700 * 2 ** (-t / .012) + 220) / SR) * np.exp(-t / .012) * .35   # le « bloup » de l'attaque
    k0[:nn] += bl; return k0


def ploc(de, P):
    """la GOUTTE : un petit clic, un corps rond qui remonte, un éclat brillant — accordée (plocPitch)"""
    f0 = P.get('plocPitch', 370); nn = int(.25 * SR); t = np.arange(nn) / SR
    f = f0 * (.72 + .28 * (1 - np.exp(-t / .03)))
    corps = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .09)
    eclat = np.sin(2 * np.pi * f0 * 3.01 * t) * np.exp(-t / .012) * .35
    clic = filtre(de.bruit(nn), 'high', 4000) * np.exp(-t / .0015) * .4
    return (corps + eclat + clic) * (1 - np.exp(-t / .001))


def pop(de, P, rng):
    """une petite BULLE qui éclate (popPitch ± popSpread)"""
    f0 = P.get('popPitch', 1150) * (1 + (rng.random() * 2 - 1) * P.get('popSpread', .5) * .5)
    nn = int(.05 * SR); t = np.arange(nn) / SR; f = f0 * (.7 + .3 * (1 - np.exp(-t / .006)))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .014) * (1 - np.exp(-t / .0008))


NOTE_INST = {'synthbass': synthbass, 'sub': sub, 'cs80': cs80, 'bell': bell, 'cello': cello, 'bubble': bubble}
ACCORD_INST = {'swell': swell, 'juno': juno, 'gong': gong}


def tirer(variants, rng):
    w = np.array([v.get('w', 1) for v in variants], float); return variants[rng.choice(len(variants), p=w / w.sum())]


def rendre(D, graine):
    bars = D['bars'] * TOURS; M = Morceau(D['bpm'], mesures=bars, graine=graine); de = M.de; dc = M.dc; rng = np.random.default_rng(graine)
    kicks = []; pompes = []; envois = []; envoi_gong = []
    for tr in D['tracks']:
        ins = tr['inst']
        if ins in ('hiss', 'crackle'): continue
        lg = tr.get('len', 4); cyc = bars // lg; g = BASE.get(ins, .2) * 10 ** (VOL_K.get(ins, 1.) * (tr.get('vol', REF.get(ins, 0)) - REF.get(ins, 0)) / 20)
        P = tr; pst = M.piste(ins); act = tr.get('active'); prob = tr.get('prob', 1.); hum = tr.get('human', 0); late = tr.get('late', 0)
        for c in range(cyc):
            base = c * lg * 16 * dc; var = tirer(tr['variants'], rng)
            if 'pattern' in var:
                pat = var['pattern']; reps = max(1, lg * 16 // len(pat))
                for rep in range(reps):
                    for i, ch in enumerate(pat):
                        if ch == '.' or rng.random() > prob: continue
                        t = base + (rep * len(pat) + i) * dc + late
                        if ins == 'boomkick': pst.pose(t, boomkick(de, P), g); kicks.append(t)
                        elif ins == 'ploc': pst.pose(t, ploc(de, P), g, .1)
                        elif ins == 'pop': pst.pose(t, pop(de, P, rng), g, -.8 + 1.6 * ((rep * len(pat) + i) % 16) / 15)   # de GAUCHE à DROITE sur la mesure
                continue
            for p, nm, ln, v in var['notes']:
                if act and act[int(p // 16) % len(act)] == '0': continue
                if prob < 1 and rng.random() > prob: continue
                t = max(0., base + p * dc + late + (rng.normal(0, hum / 2) if hum else 0)); d = ln * dc
                if ins == 'gong': pst.pose(t, gong(notes_de(nm), d, v, de, P), g * v); continue
                if ins in ('juno', 'swell'):
                    l, r = juno(notes_de(nm), d, v, de, P, t) if ins == 'juno' else swell(notes_de(nm), d, v, de, P)
                    pst.pose2(t, l, r, g * v); continue
                if ins == 'rhodes':
                    for j, x in enumerate(notes_de(nm)): pst.pose(max(0., t + j * .006), rhodes_p(x, d + .5, v), g * v, -.3 + .2 * j)
                    continue
                for j, x in enumerate(notes_de(nm)):
                    pan = {'bell': .35 if (p // 2) % 2 else -.35, 'bubble': .5 * np.sin(p), 'cello': -.2, 'cs80': .12}.get(ins, 0.)
                    pst.pose(t, NOTE_INST[ins](x, d, v, de, P), g * v, pan)
        if tr.get('pump'): pompes.append((ins, tr['pump']))
        if tr.get('rev'): (envoi_gong if ins == 'gong' else envois).append((ins, tr['rev']))
    tk = kicks if kicks else [M.t(m, p) for m in range(bars) for p in (0, 4, 8, 12)]       # sans grosse caisse : la nappe respire sur chaque temps
    for nom, pr in pompes:
        if nom in M.bus: gp = pompe(M.n, tk, pr, .16); M.bus[nom].L *= gp; M.bus[nom].R *= gp
    if 'juno' in M.bus: M.bus['juno'].L, M.bus['juno'].R = chorus(M.bus['juno'].L, M.bus['juno'].R, 18, 4, .45)
    if 'rhodes' in M.bus: M.bus['rhodes'].L, M.bus['rhodes'].R = wobble(M.bus['rhodes'].L, M.bus['rhodes'].R, .003, .5)
    if 'cs80' in M.bus:
        eL, eR = echo(M.bus['cs80'].L, M.bus['cs80'].R, M.temps * .75, .35); M.bus['cs80'].L += eL * .3; M.bus['cs80'].R += eR * .3
    fx_rev(M, envois, 3.4, .42, 5200)
    if envoi_gong:                                                                      # le GONG : un espace immense (et la pluie dessous)
        gb = M.bus['gong']; rL, rR = reverbe(gb.L, gb.R, 7., 4000, .04, de); gb.L += rL * 1.2; gb.R += rR * 1.2
    gains = {k: 1 for k in M.bus}; gains['fx'] = 1
    L, R = fin(M, gains, maitre_lp=12000)
    k = D.get('drive', 1.)
    if k > 1: L = np.tanh(L * k) / np.tanh(k); R = np.tanh(R * k) / np.tanh(k)        # le DRIVE du JSON : une saturation douce du tout
    rms = np.sqrt(((L ** 2 + R ** 2) / 2).mean()); g9 = 10 ** (-15 / 20) / max(rms, 1e-9); L *= g9; R *= g9   # …puis la même sonie que les autres
    pl = 10 ** (-1 / 20); return np.tanh(L / pl * 1.05) * pl, np.tanh(R / pl * 1.05) * pl


if __name__ == '__main__':
    os.makedirs(SORTIE, exist_ok=True); defs = lire_defs(); seul = int(sys.argv[1]) if len(sys.argv) > 1 else 0; out = []
    for k, D in enumerate(defs, 1):
        nom = 'ville-n%d' % k
        if not seul or seul == k:
            L, R = rendre(D, 1200 + k); wav = os.path.join(SORTIE, nom + '.wav'); ecrit_wav(wav, L, R)
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(SORTIE, nom + '.m4a')], check=True)
            os.remove(wav); print('  %-9s %-18s %.1f s' % (nom, D['name'], len(L) / SR), flush=True)
        out.append({'id': nom, 'titre': D['name'].upper(), 'style': 'Ville · niveau %d · années 80 (Studio de Léo)' % k, 'bpm': D['bpm'], 'cle': 'la majeur',
                    'dur': 96, 'f': 'assets/audio/music/ville/%s.m4a?v=%d' % (nom, 2), 'idee': D.get('desc', '')[:240]})
    open(os.path.join(SORTIE, 'ville-donnees.js'), 'w').write('window.VILLE_N=' + json.dumps(out, ensure_ascii=False) + ';\n'); print('ok')
