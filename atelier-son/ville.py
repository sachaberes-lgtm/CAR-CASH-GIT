# -*- coding: utf-8 -*-
"""LA VILLE QUI SUIT LA COURSE (2026-10-01, Léo : « fais pareil avec la musique de la VILLE sur la map — produis en samplant et en
réorganisant, tu as plus de matière ; ajoute ta touche, même avec des sons d'avant que tu as générés »).

LA MATIÈRE : ADDICTIVE LOOP (assets/audio/music/addictive-loop.m4a, le morceau de Léo sur la ville), mesuré :
129,92 BPM, mesure 1,847 s, cycle d'accords de 4 mesures FA · RÉ m · LA m · LA m (la mineur) presque partout. On le DÉCOUPE en
PHRASES de 4 mesures (chacune + 0,3 s de queue pour fondre le raccord) rangées par niveau d'intensité :
  CALME (l'intro, sans basse) · GROOVE · PLEIN · GROS · SOMMET  + MONTÉE (le passage tendu sur SOL : la nitro tenue).
Le jeu (musique-vitesse.js, mode SÉQUENCE) enchaîne les phrases toutes les 2 mesures en gardant la position dans la grille :
l'harmonie continue quel que soit le saut.

MA TOUCHE, au même tempo, dans la même grille (FA · RÉ m · LA m · LA m) : la PLUIE + le vinyle (de PLUIE NÉON), une NAPPE de
Rhodes (pour les niveaux calmes), un ARPÈGE et des rafales de CHARLEY trap (de LUXE) que l'ÉLAN ouvre ; l'ACCALMIE de la ville
(Rhodes, cloche, pluie), la FLORAISON (la m add9 en Rhodes), la TRANSITION (montée + crash à 130 BPM).

  python atelier-son/ville.py      (numpy + scipy + afconvert) → assets/audio/music/boucles/ville--*.m4a + met à jour
                                    couches-jeu.js et boucles-donnees.js (l'entrée « ville-addictive »)
"""
import sys, os, json, subprocess
import numpy as np
from scipy.io import wavfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from boucles import *  # noqa: F403
import boucles8  # noqa: F401  (GAMMES, chorus…)
from boucles8 import chorus, voix_menee, shaker

SOURCE = os.path.join(RACINE, 'assets', 'audio', 'music', 'addictive-loop.m4a')
BPM = 129.92; MESURE = 240 / BPM; BAR0 = .681; QUEUE_P = .3
# (nom, niveau, mesures de départ des phrases de 4) — mesuré : les sections changent sur les multiples de 4 depuis la mesure 0
SECTIONS = [('CALME', 0, [0, 4]), ('GROOVE', 1, [8, 16]), ('PLEIN', 2, [24, 28]), ('GROS', 3, [40, 44]),
            ('SOMMET', 4, [80, 84]), ('MONTEE', 5, [64, 68])]
T = 57  # la
PROG = [5, 3, 0, 0]  # FA (VI) · RÉ m (iv) · LA m (i) · LA m

def m4a(nom, L, R, debit=160000):
    wav = os.path.join(SORTIE, nom + '.wav'); ecrit_wav(wav, L, R)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', str(debit), '-q', '127', wav, os.path.join(SORTIE, nom + '.m4a')], check=True)
    os.remove(wav); return 'assets/audio/music/boucles/' + nom + '.m4a'

def rms(L, R): return float(np.sqrt(((L ** 2 + R ** 2) / 2).mean()))
def niveau(L, R, cible_db):
    k = 10 ** (cible_db / 20) / max(rms(L, R), 1e-9); return L * k, R * k

def lire_source():
    tmp = os.path.join(SORTIE, '_src.wav')
    subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@44100', SOURCE, tmp], check=True)
    sr, x = wavfile.read(tmp); os.remove(tmp); x = x.astype(np.float32) / 32768
    return x[:, 0].astype(np.float64), x[:, 1].astype(np.float64)

def attaque(m, t, fen=.04):
    """recale un début de phrase sur la vraie attaque à ±40 ms (le flux spectral le plus fort)"""
    N = 512; H = 64; win = np.hanning(N); i0 = int((t - fen) * SR); i1 = int((t + fen) * SR)
    F = np.array([np.abs(np.fft.rfft(m[i:i + N] * win)) for i in range(i0, i1, H)])
    fl = np.maximum(0, np.diff(np.log1p(F * 10), axis=0)).sum(1)
    k = int(np.argmax(fl)); return (i0 + (k + 1) * H + N // 2) / SR - .006

def phrases():
    L, R = lire_source(); m = (L + R) / 2
    lgP = 4 * MESURE; lgT = lgP + QUEUE_P; n = int(round(lgT * SR))
    out, info = [], []
    for nom, niv, debuts in SECTIONS:
        idx = []
        for b in debuts:
            t = attaque(m, BAR0 + b * MESURE); i = int(round(t * SR))
            pl, pr = L[i:i + n].copy(), R[i:i + n].copy()
            f = int(.004 * SR); pl[:f] *= np.linspace(0, 1, f); pr[:f] *= np.linspace(0, 1, f)  # 4 ms d'entrée : pas de clic
            out.append((pl, pr)); idx.append(len(out) - 1)
        info.append({'nom': nom, 'niveau': niv, 'phrases': idx})
    PL = np.concatenate([p[0] for p in out]); PR = np.concatenate([p[1] for p in out])
    return PL, PR, info, lgT

# ---------------------------------------------------------------- ma touche (4 mesures, la grille du morceau)
def M4v(g): return Morceau(BPM, mesures=4, graine=g)

def ville_pluie():
    M = M4v(301); de = M.de; p = M.piste('pluie'); z = souffle_pluie(de, M.n) + craquement(de, M.n) * .7
    p.L += z; p.R += np.roll(z, 2311)
    return M, fin(M, {'pluie': 1})

def rhodes(n, dur, g=1.):
    return plus(fm(n, dur, 1, 2.2, .25, 1.2), .3 * fm(n + 12, dur * .5, 14, 1.2, .05, .45)) * g

def ville_nappe():
    """la NAPPE de Rhodes : l'accord sur le 1, un rappel sur le « et » du 3, enchaîné au plus court ; un pad doux dessous"""
    M = M4v(302); de = M.de; rh = M.piste('rhodes'); pad = M.piste('pad'); prec = None
    for m in range(4):
        notes = voix_menee(accord(T, 'min', PROG[m], True, True), prec, 64); prec = notes
        for p, v in ((0, 1.), (10, .55)):
            for k, n in enumerate(notes):
                rh.pose(M.t(m, p) + k * .01, rhodes(n, 2.2), .07 * v, -.3 + .15 * k)
        for n in notes[:3]:
            l, r = supersaw(n - 12, MESURE + .4, 3, 8, de); e = env(len(l), .3, 9, 1, .3, MESURE)
            pad.pose2(M.t(m), filtre(l * e, 'low', 1200), filtre(r * e, 'low', 1200), .05)
    rh.L, rh.R = wobble(rh.L, rh.R, .0015, .4)
    fx_rev = boucles8.fx_rev; fx_rev(M, [('rhodes', 1), ('pad', .5)], 2.6, .45, 5000)
    return M, fin(M, {'rhodes': 1, 'pad': 1, 'fx': 1})

def ville_arpege():
    """l'ARPÈGE de l'élan : triangle en doubles-croches sur les notes de l'accord, qui monte d'octave à mi-mesure, en écho"""
    M = M4v(303); de = M.de; ar = M.piste('arp')
    for m in range(4):
        ch = accord(T + 12, 'min', PROG[m], False)
        for p in range(16):
            n = ch[p % 3] + (12 if p >= 8 else 0) + (12 if p % 4 == 3 else 0); nn = int(.12 * SR)
            s = (.8 * tri(hz(n), nn) + .2 * carre(hz(n), nn, .25)) * env(nn, .002, .045)
            ar.pose(M.t(m, p), filtre(s, 'low', 3400), .16, .5 * np.sin(p * .9 + m))
    eL, eR = echo(ar.L, ar.R, M.temps * .75, .4, 4, clair=3000); M.piste('fx').L += eL * .5; M.piste('fx').R += eR * .5
    return M, fin(M, {'arp': 1, 'fx': 1})

def ville_trap():
    """les RAFALES de charley trap (l'idée de LUXE) : croches, puis des triolets et des triples-croches qui roulent en fin de
    mesure, une charley ouverte sur le 4 — par-dessus la batterie du morceau, elles poussent sans la doubler"""
    M = M4v(304); de = M.de; h = M.piste('hats')
    for m in range(4):
        for p in range(0, 12, 2): h.pose(M.t(m, p), charley(de, False, 9500), .2, .35)
        if m % 2 == 0:
            for k in range(6): h.pose(M.t(m, 12) + k * M.temps / 3, charley(de, False, 10000), .16 + .02 * k, .35 - .12 * k)
        else:
            for k in range(8): h.pose(M.t(m, 12) + k * M.dc / 2, charley(de, False, 10000), .12 + .02 * k, -.3 + .08 * k)
        h.pose(M.t(m, 14), charley(de, True, 8000), .18, -.4)
    return M, fin(M, {'hats': 1})

def ville_calme():
    """l'ACCALMIE de la ville : la pluie, des accords de Rhodes tenus (FA · RÉ m · LA m · LA m), une cloche qui répond en haut,
    une réverbe longue. On s'arrête sous la pluie, les néons clignotent, la ville respire."""
    M = M4v(305); de = M.de; rh = M.piste('rhodes'); cl = M.piste('cloche'); pl = M.piste('pluie'); prec = None
    for m in range(4):
        notes = voix_menee(accord(T, 'min', PROG[m], True, True), prec, 64); prec = notes
        for k, n in enumerate(notes): rh.pose(M.t(m) + k * .03, rhodes(n, 3.), .08, -.3 + .15 * k)
        for p, dd in ((6, 4), (12, 2)): cl.pose(M.t(m, p), fm(deg(T + 24, 'min', PROG[m] + dd), 2.5, 3.5, 1.6, .4, 1.), .06, .4)
    z = souffle_pluie(de, M.n) + craquement(de, M.n) * .5; pl.L += z; pl.R += np.roll(z, 1777)
    boucles8.fx_rev(M, [('rhodes', 1), ('cloche', 1)], 3.8, .5, 4500)
    return M, fin(M, {'rhodes': 1, 'cloche': 1, 'pluie': .7, 'fx': 1})

def ville_floraison():
    de = Des(306); n = int(4.5 * SR); L = np.zeros(n); R = np.zeros(n)
    for k, note in enumerate((57, 64, 67, 71, 72)):  # la m add9 en Rhodes, égrené
        s = rhodes(note, 4.2, .25); i = int(k * .05 * SR); L[i:i + len(s)] += s[:n - i] * (1 - .1 * k); R[i:i + len(s)] += s[:n - i] * (.6 + .1 * k)
    z = souffle_pluie(de, n) * np.clip(np.arange(n) / SR / .4, 0, 1) * np.exp(-np.arange(n) / SR / 2.5); L += z * .6; R += np.roll(z, 900) * .6
    rL, rR = reverbe(L, R, 4., 4500, .03, de); L = L + rL * .6; R = R + rR * .6
    pk = max(np.abs(L).max(), np.abs(R).max()); return L * .7 / pk, R * .7 / pk

def ville_transition():
    M = Morceau(BPM, mesures=2, graine=307); de = M.de
    nn = int(MESURE * SR); t = np.arange(nn) / SR; u = t / t[-1]
    up = balaye(de.bruit(nn), 300 * (40 ** u)) * u ** 2 * .5 + scie(hz(57) * (2 ** u), nn) * u ** 3 * .1
    fx = M.piste('fx'); fx.pose(0, up, 1)
    fx.pose(M.t(1), boucles8.crash(de, 2.), .8, -.3); fx.pose(M.t(1), boucles8.crash(de, 1.6), .6, .3)
    fx.pose(M.t(1), kick(de, 120, 38, .9, .3, 2.), .8)
    L, R = fx.L.copy(), fx.R.copy(); rL, rR = reverbe(L, R, 2.5, 6000, de=de); L = L + rL * .5; R = R + rR * .5
    pk = max(np.abs(L).max(), np.abs(R).max()); return L * .7 / pk, R * .7 / pk

# (nom, fonction, niveau RMS visé en dB, règles : élan minimum, niveau de section maximum)
# v3.1 (Léo : « la musique c'était un peu bof, trop superposé ») : LE MORCEAU PORTE SEUL. Ma touche ne sort plus que dans SES
# moments : la pluie à l'arrêt (CALME), les rafales de charley pendant la MONTÉE en nitro. La nappe et l'arpège (toujours là
# par-dessus le morceau) sont retirés ; le Rhodes vit dans l'ACCALMIE. + niveau minimum de section (niveauMin).
COUCHES_VILLE = [('PLUIE', ville_pluie, -30, 0, 0, 0), ('CHARLEY TRAP', ville_trap, -28, .75, 9, 5)]

def souffle_passage(monte=True):
    """LE PASSAGE DE MARCHE (v3.1, la musique suit la BOÎTE) : un souffle d'un temps qui MONTE vers la section suivante (bruit dont
    le filtre s'ouvre + une cymbale à l'envers), ou qui DESCEND quand on redescend. Joué pour finir PILE sur la marche."""
    de = Des(310 if monte else 311); n = int(MESURE / 2 * SR); t = np.arange(n) / SR; u = t / t[-1]
    if monte:
        s = balaye(de.bruit(n), 500 * (24 ** u)) * u ** 2.2 * .5
        c = boucles8.crash(de, 1.)[:n][::-1]; c = np.r_[np.zeros(n - len(c)), c] if len(c) < n else c[-n:]
        s = s + c * .35 * u
    else:
        s = balaye(de.bruit(n), 9000 * (1 / 30) ** u) * np.exp(-u * 2.5) * .45
    L = filtre(s, 'high', 300); R = np.roll(L, 200)
    pk = max(np.abs(L).max(), 1e-9); return L * .5 / pk, R * .5 / pk

def rendre():
    os.makedirs(SORTIE, exist_ok=True)
    print('… phrases d\'ADDICTIVE LOOP')
    PL, PR, sections, lgT = phrases()
    f_src = m4a('ville--phrases', PL, PR, 192000)
    print('   %d phrases de %.3f s (%s)' % (len(PL) / SR / lgT, lgT, ', '.join(s['nom'] for s in sections)))
    couches = []
    for nom, fn, cible, elanMin, nivMax, nivMin in COUCHES_VILLE:
        M, (L, R) = fn(); L, R = niveau(L, R, cible)
        f = m4a('ville--' + nom.lower().replace(' ', '-'), L, R)
        couches.append({'nom': nom, 'seuil': 0, 'sol': False, 'temps': 0, 'elanMin': elanMin, 'niveauMax': nivMax, 'niveauMin': nivMin, 'rms': round(rms(L, R), 5),
                        'variantes': [{'v': 'A', 'f': f, 'moteur': 0, 'rms': round(rms(L, R), 5)}]})
        print('   %-13s RMS %.1f dB  élan ≥ %.2f  niveau ≤ %d' % (nom, cible, elanMin, nivMax))
    M, (cL, cR) = ville_calme(); cL, cR = niveau(cL, cR, -21); f_calme = m4a('ville--accalmie', cL, cR)
    f_flo = m4a('ville--floraison', *ville_floraison()); f_tr = m4a('ville--transition', *ville_transition())
    f_mo = m4a('ville--monte', *souffle_passage(True)); f_de = m4a('ville--descend', *souffle_passage(False))
    d = {'titre': 'VILLE · ADDICTIVE LOOP', 'bpm': BPM, 'ton': 1, 'mesures': 4, 'dur': round(4 * MESURE, 5),
         'sequence': {'f': f_src, 'phrase': round(lgT, 5), 'mesures': 4, 'queue': QUEUE_P, 'sections': sections},
         'couches': couches, 'transition': {'f': f_tr, 'avance': round(MESURE, 5)}, 'rupture': {'f': f_flo}, 'accalmie': {'f': f_calme},
         'passages': {'monte': {'f': f_mo, 'avance': round(MESURE / 2, 5)}, 'descend': {'f': f_de}}, 'boite': True}
    # couches-jeu.js
    fj = os.path.join(SORTIE, 'couches-jeu.js'); jeu = json.loads(open(fj).read().split('=', 1)[1].rstrip().rstrip(';'))
    jeu['ville-addictive'] = d
    open(fj, 'w').write('window.COUCHES_JEU=' + json.dumps(jeu, ensure_ascii=False) + ';\n')
    # boucles-donnees.js (la page)
    fd = os.path.join(SORTIE, 'boucles-donnees.js'); liste = json.loads(open(fd).read().split('=', 1)[1].rstrip().rstrip(';'))
    liste = [b for b in liste if b['id'] != 'ville-addictive']
    e = dict(d); e.update({'id': 'ville-addictive', 'groupe': 'MUSIQUE DE JEU · VITESSE + MOTEUR', 'pour': 'VILLE · EN JEU', 'cle': 'la mineur',
        'f': f_src, 'pics': pics(PL[:int(4 * MESURE * SR) * 4], PR[:int(4 * MESURE * SR) * 4]),
        'idee': "ADDICTIVE LOOP échantillonné et réorganisé en 12 phrases (CALME, GROOVE, PLEIN, GROS, SOMMET, MONTÉE). La BOÎTE DE VITESSES mène : chaque rapport fait monter le morceau d'une marche (avec un souffle qui y mène), le moteur respire sur le temps. Le morceau porte seul ; ma touche n'arrive qu'à ses moments : la pluie à l'arrêt, les rafales de charley en nitro, l'accalmie Rhodes."})
    liste.insert(1, e)
    open(fd, 'w').write('window.BOUCLES=' + json.dumps(liste, ensure_ascii=False) + ';\n')
    print('ok → ville-addictive')

if __name__ == '__main__':
    rendre()
