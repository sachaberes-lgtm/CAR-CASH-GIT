# -*- coding: utf-8 -*-
"""LE LOBBY « CHRIS » POUR LE MAIN (2026-10-14) : rend les six boucles du lobby (lobby_chris.py ×5 + le SIFFLEUR de petites_musiques.py)
et les encode SANS COUTURE (boucle_aac.py : débord + liste d'édition) dans le dossier lobby du jeu.
  <venv>/python atelier-son/lobby_main.py "<…>/VERSION PRINCIPALE/assets/audio/music/lobby" [id…]"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import lobby_chris as C, petites_musiques as PM, boucle_aac
from boucles import filtre, reverbe, Des, SR


def garage(L, R):
    """LE LÉGER FILTRE DU GARAGE (2026-10-14, Léo : « la musique se lance quand j'appuie sur le mode garage — appliquer un léger filtre
    adapté ») : dans le jeu le lobby ne joue plus qu'au garage (le ciel a la chute libre douce) ; on l'entend comme par l'enceinte de
    l'atelier — les aigus adoucis (−4,4 dB au-dessus de ~3,5 kHz, le grave intact) et une petite pièce (0,7 s, mate), à 15 %. La musique
    ne passe pas par Web Audio (iPhone) : le filtre est CUIT dans le fichier. Traité en boucle (les 2 dernières secondes devant) : la
    queue de la pièce retombe sur le début, sans couture. Même sonie qu'avant le filtre."""
    q = 2 * SR; out = []
    rms0 = np.sqrt(((L ** 2 + R ** 2) / 2).mean())
    x = [np.r_[L[-q:], L], np.r_[R[-q:], R]]
    doux = [.6 * c + .4 * filtre(c, 'low', 3500) for c in x]
    rL, rR = reverbe(doux[0], doux[1], .7, 4000, .012, de=Des(77))
    y = [doux[0] + .15 * rL, doux[1] + .15 * rR]
    y = [c[q:] for c in y]
    k = rms0 / max(np.sqrt(((y[0] ** 2 + y[1] ** 2) / 2).mean()), 1e-9)
    pl = 10 ** (-1 / 20)
    return np.tanh(y[0] * k / pl) * pl, np.tanh(y[1] * k / pl) * pl

dest = sys.argv[1]; filtres = sys.argv[2:]
for V in C.VERSIONS + [{'id': 'chris-siffleur'}]:
    if filtres and not any(f in V['id'] for f in filtres): continue
    if V['id'] == 'chris-siffleur': _, (L, R) = PM.siffleur()
    else: L, R = C.mixe(C.compose(V))
    L, R = garage(L, R)
    r = boucle_aac.encode(L, R, os.path.join(dest, V['id'] + '.m4a'))
    print(V['id'], r, '%.3f s' % (r['N'] / 44100))
