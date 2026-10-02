"""ÉTAPE 1 — LE SON DE DÉPART (2026-10-02, nouveau départ : CAHIER-MUSIQUE.md).
Huit sons très courts (une note ou un accord, 2-3 s), tous en MI♭ (la tonalité de VAPEUR, la boucle que Léo aime) pour pouvoir
s'assembler ensuite. Léo écoute sur boucles.html (onglet « Étape 1 ») et garde ceux qui lui parlent (♥ → rangement.json).
Lancer : <venv>/python atelier-son/depart.py
"""
import os, sys, json, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from boucles import *  # noqa: F403
from boucles8 import chorus

SORTIE_D = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'audio', 'music', 'depart')
EB = 63  # mi♭4
MAJ9 = [51, 58, 62, 65, 70]          # mi♭ · si♭ · ré · fa · si♭ : mi♭maj9 ouvert (la couleur de VAPEUR)


def pose(x, s, t, g=1.):
    i = int(t * SR); m = min(len(s), len(x) - i)
    if m > 0: x[i:i + m] += s[:m] * g


def espace(L, R=None, taille=2., part=.25, clair=6000, de=None):
    R = L.copy() if R is None else R
    rL, rR = reverbe(L, R, taille, clair, .02, de or Des(5))
    return L + rL * part, R + rR * part


def finir(L, R, dur):
    n = int(dur * SR); L = np.r_[L, np.zeros(max(0, n - len(L)))][:n]; R = np.r_[R, np.zeros(max(0, n - len(R)))][:n]
    f = int(.25 * SR); L[-f:] *= np.linspace(1, 0, f); R[-f:] *= np.linspace(1, 0, f)
    k = 10 ** (-17 / 20) / (np.sqrt(((L ** 2 + R ** 2) / 2).mean()) + 1e-9)   # même sonie pour tous, les attaques arrondies en douceur
    return np.tanh(L * k / .89) * .89, np.tanh(R * k / .89) * .89


def s_piano(de):
    """PIANO DOUX — un piano électrique (Rhodes) qui pose l'accord, les notes à peine décalées comme sous les doigts"""
    n = int(3.2 * SR); L = np.zeros(n)
    for k, m in enumerate(MAJ9):
        pose(L, plus(fm(m + 12, 2.8, 1, 1.5, .3, 1.2), .15 * fm(m + 24, 1., 14, 1, .04, .3)), .018 * k, .5)
    L, R = chorus(L, np.roll(L, 200), 12, 2, .5); return espace(L, R, 1.8, .22, 5000, de)


def s_nylon(de):
    """GUITARE NYLON — l'accord égrené du pouce, cordes pincées"""
    n = int(3.2 * SR); L = np.zeros(n)
    for k, m in enumerate(MAJ9):
        c = karplus(m + 12, 3., .45, .9982, de); pose(L, filtre(c, 'low', 4200), .035 * k, .55)
    return espace(filtre(L, 'high', 90), None, 1.6, .2, 4500, de)


def s_kalimba(de):
    """KALIMBA — trois lames, la quinte et la tierce, petit tintement à l'attaque"""
    n = int(2.6 * SR); L = np.zeros(n); t = np.arange(int(1.6 * SR)) / SR
    for k, m in enumerate([75, 82, 79]):
        x = karplus(m, 1.6, .9, .9965, de); x = x + .25 * np.sin(2 * np.pi * hz(m) * 2.01 * t[:len(x)]) * np.exp(-t[:len(x)] / .08)
        pose(L, x, .11 * k, .6)
    return espace(filtre(L, 'high', 200), None, 1.4, .25, 7000, de)


def s_cloche(de):
    """CLOCHE DE VERRE — une seule note, longue, qui chante"""
    x = fm(EB + 12, 3., 3.5, 2.4, .5, 1.2); L, R = x, np.roll(x, 90)
    return espace(L, R, 2.6, .3, 9000, de)


def s_nappe(de):
    """NAPPE VAPEUR — l'accord de VAPEUR : scies douces, filtrées, chorus et bande qui pleure"""
    L = 0; R = 0
    for m in MAJ9:
        l, r = supersaw(m + 12, 3.4, 3, 6, de); L = L + l; R = R + r
    e = env(len(L), .35, 9, 1, 1., 2.2); L = filtre(L * e, 'low', 1800); R = filtre(R * e, 'low', 1800)
    L, R = chorus(L, R); L, R = wobble(L, R, .004, .3); return espace(L, R, 3., .3, 4500, de)


def s_boite(de):
    """BOÎTE À MUSIQUE — les lames d'acier, l'accord égrené vite, très haut"""
    n = int(2.8 * SR); L = np.zeros(n)
    for k, m in enumerate([82, 87, 89, 94]):
        pose(L, fm(m, 1.8, 7, 1.8, .03, .7) + .3 * fm(m, 1.8, 1, .4, .1, .9), .07 * k, .45)
    return espace(L, None, 1.8, .28, 9000, de)


def s_basse(de):
    """BASSE RONDE — une note grave, douce à l'attaque, qui tient"""
    nn = int(2.6 * SR); t = np.arange(nn) / SR; f = hz(EB - 24)
    x = (sinus(f, nn) + .25 * tri(f * 2, nn)) * env(nn, .02, .9, .6, .5, 1.8)
    x = np.tanh(x * 1.6); return espace(filtre(x, 'low', 900), None, 1., .08, 3000, de)


def s_synthe(de):
    """SYNTHÉ CHAUD — une note qui s'ouvre lentement, vibrato tardif"""
    nn = int(3. * SR); t = np.arange(nn) / SR; vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - .6) / .6, 0, 1)
    L = 0; R = 0
    for k in range(5):
        c = (k - 2) / 2; f = hz(EB + 7) * 2 ** (c * 10 / 1200) * vib; s = scie(f, nn); L = L + s * (1 - c * .6); R = R + s * (1 + c * .6)
    fc = 600 + 3200 * np.clip(t / 1.4, 0, 1) ** 2
    e = env(nn, .25, 9, 1, .6, 2.2); L = balaye(L / 5 * e, fc); R = balaye(R / 5 * e, fc)
    return espace(L, R, 2.2, .25, 6000, de)


DEPART = [
    ('d-piano', s_piano, 'PIANO DOUX', 'Piano électrique · accord', "Un Rhodes qui pose l'accord de VAPEUR, notes à peine décalées."),
    ('d-nylon', s_nylon, 'GUITARE NYLON', 'Guitare · accord égrené', "L'accord égrené du pouce, cordes pincées."),
    ('d-kalimba', s_kalimba, 'KALIMBA', 'Lames · 3 notes', "Trois lames qui tintent, la quinte et la tierce."),
    ('d-cloche', s_cloche, 'CLOCHE DE VERRE', 'Cloche · 1 note', "Une seule note longue, claire, qui chante."),
    ('d-nappe', s_nappe, 'NAPPE VAPEUR', 'Nappe · accord', "L'accord de VAPEUR en nappe : flou, chorus, la bande qui pleure."),
    ('d-boite', s_boite, 'BOÎTE À MUSIQUE', 'Lames d’acier · accord', "Les petites lames d'une boîte à musique, très haut."),
    ('d-basse', s_basse, 'BASSE RONDE', 'Basse · 1 note', "Une note grave et ronde, qui tient."),
    ('d-synthe', s_synthe, 'SYNTHÉ CHAUD', 'Synthé · 1 note', "Une note qui s'ouvre lentement, vibrato tardif."),
]

if __name__ == '__main__':
    os.makedirs(SORTIE_D, exist_ok=True); out = []
    for i, (did, fn, titre, style, idee) in enumerate(DEPART):
        L, R = fn(Des(700 + i)); L, R = finir(L, R, max(len(L) / SR, 2.4))
        wav = os.path.join(SORTIE_D, did + '.wav'); ecrit_wav(wav, L, R)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(SORTIE_D, did + '.m4a')], check=True)
        os.remove(wav); print('  %-10s %.2f s' % (did, len(L) / SR), flush=True)
        out.append({'id': did, 'titre': titre, 'style': style, 'idee': idee, 'cle': 'mi♭', 'f': 'assets/audio/music/depart/' + did + '.m4a', 'dur': round(len(L) / SR, 3)})
    open(os.path.join(SORTIE_D, 'depart-donnees.js'), 'w').write('window.DEPART=' + json.dumps(out, ensure_ascii=False) + ';\n')
    print('ok')
