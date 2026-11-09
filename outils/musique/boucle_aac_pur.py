# -*- coding: utf-8 -*-
"""LA BOUCLE AAC SANS COUTURE, À LA FAÇON D'APPLE, SANS NUMPY (2026-11-09, chaîne de rendu de la musique de course figée).
La boucle est encodée AVEC DÉBORD (sa fin devant, son début derrière : le codeur voit une boucle continue, la couture vaut une couture du
milieu), puis le marqueur GAPLESS d'Apple `iTunSMPB` est RÉÉCRIT : amorce = 2112 + débord, durée = N exactement. C'est le mécanisme que lisent
CoreAudio (afconvert, AVFoundation, WebKit decodeAudioData) ET le démultiplexeur de Chrome : le décodeur saute l'amorce et rend EXACTEMENT N échantillons.
(La variante à liste d'édition `elst` de atelier-son/boucle_aac.py n'est PAS lue par le décodeur d'Apple : afconvert rend 632 768 échantillons au lieu de 631 881.)
  usage : python3 boucle_aac_pur.py <entrée.f32> <N> <sortie.m4a> [kbps]
  l'entrée : N échantillons flottants (little-endian) du canal gauche, puis N du droit, à 44,1 kHz."""
import json, os, subprocess, sys, tempfile, wave
from array import array
SR = 44100
AMORCE = 2112

def encode(L, R, sortie, debord=8128, kbps=96000):
    N = len(L)
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, 'b.wav'); m4a = os.path.join(d, 'b.m4a')
        gl = L[-debord:] + L + L[:debord]; dr = R[-debord:] + R + R[:debord]
        x = array('h', bytes(4 * len(gl)))
        for i in range(len(gl)):
            a = gl[i]; b = dr[i]
            x[2 * i] = 32767 if a >= 1 else (-32767 if a <= -1 else int(a * 32767))
            x[2 * i + 1] = 32767 if b >= 1 else (-32767 if b <= -1 else int(b * 32767))
        if sys.byteorder == 'big': x.byteswap()
        w = wave.open(wav, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(x.tobytes()); w.close()
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', str(kbps), '-q', '127', wav, m4a], check=True)
        b = bytearray(open(m4a, 'rb').read())
    i = b.find(b'iTunSMPB')
    if i < 0: raise RuntimeError('pas de iTunSMPB dans la sortie d\'afconvert')
    j = b.find(b' 00000000 ', i)
    champs = bytes(b[j:j + 90]).decode('latin1').split()          # [00000000, amorce, reste, durée(16 chiffres), …]
    amorce, reste, valides = int(champs[1], 16), int(champs[2], 16), int(champs[3], 16)
    total = amorce + valides + reste                              # ce que le décodeur produit en tout
    na = amorce + debord; nr = total - na - N
    if nr < 0: raise RuntimeError('reste négatif')
    neuf = (' 00000000 %08X %08X %016X' % (na, nr, N)).encode('latin1')
    b[j:j + len(neuf)] = neuf
    open(sortie, 'wb').write(bytes(b))
    return {'amorce': na, 'reste': nr, 'valides': N, 'total': total}

if __name__ == '__main__':
    f, N, sortie = sys.argv[1], int(sys.argv[2]), sys.argv[3]
    kbps = int(sys.argv[4]) if len(sys.argv) > 4 else 96000
    a = array('f'); a.frombytes(open(f, 'rb').read(8 * N))
    if sys.byteorder == 'big': a.byteswap()
    print(json.dumps(encode(a[:N], a[N:2 * N], sortie, kbps=kbps)))
