"""L'HARMONIE DES MORCEAUX (2026-10-03, Léo : « tente un truc encore plus harmonieux et accordé à CHAQUE musique de la liste (important),
parce que ça va au début mais c'est pire à la fin »). La phrase du boost devait deviner l'accord du morceau : elle le LIT désormais.
Pour chaque morceau du jeu : le TEMPO et la position des temps (flux spectral + autocorrélation), puis, temps par temps, les NOTES qui
sonnent (chroma 55 Hz – 2 kHz) → un masque de 12 bits par temps. Le jeu (bloc « LA PHRASE DU BOOST ») lit le masque à la position de
lecture du morceau et ne joue que ces notes.
Lancer : <venv>/python atelier-son/harmonie.py <dossier VERSION PRINCIPALE>  → écrit assets/audio/music/harmonie.js
"""
import os, sys, json, subprocess, tempfile
import numpy as np
from scipy.io import wavfile

SR = 22050
MORCEAUX = ['lobby/vapeur-salon.m4a', 'lobby/lobby-ascenseur.m4a', 'ciel/ciel-n1.m4a', 'ciel/ciel-n2.m4a', 'ciel/ciel-n3.m4a',
            'ciel/ciel-n4.m4a', 'ciel/ciel-n5.m4a', 'ciel/ciel-complet.m4a', 'lvl1-neon-cash-car-v3.mp3', 'lvl2-cash-car-vitesse.mp3',
            'addictive-loop.m4a', 'noite-de-velocidade.mp3', 'nocturnal-groove.mp3', 'swag-cash-car-2.m4a', 'glassy-plucks-boucle.m4a']
# les tempos CONNUS (morceaux composés à l'atelier) : on ne les devine pas
BPM_SUR = {'vapeur-salon': 100, 'lobby-ascenseur': 120, 'ciel-n5': 95, 'ciel': 88, 'glassy-plucks': 150.335}  # GLASSY : mesuré à l'échantillon (44 mesures exactes)


def lire(f):
    with tempfile.TemporaryDirectory() as d:
        w = os.path.join(d, 'x.wav')
        subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@%d' % SR, '-c', '1', f, w], check=True, capture_output=True)
        sr, x = wavfile.read(w)
    return x.astype(np.float32) / 32768


def spectre(x, n=8192, h=512):
    w = np.hanning(n).astype(np.float32); k = 1 + (len(x) - n) // h
    fr = np.lib.stride_tricks.as_strided(x, (k, n), (x.strides[0] * h, x.strides[0]))
    return np.abs(np.fft.rfft(fr * w, axis=1)), h / SR


def tempo(S, dt, bpm_sur=None):
    flux = np.maximum(0, np.diff(np.log1p(S[:, 5:400] * 10), axis=0)).sum(1)
    flux = flux - np.convolve(flux, np.ones(16) / 16, 'same'); flux = np.maximum(flux, 0)
    if bpm_sur: bpm = bpm_sur
    else:
        ac = np.correlate(flux, flux, 'full')[len(flux) - 1:]
        lags = np.arange(len(ac)) * dt; ok = (lags > 60 / 170) & (lags < 60 / 75)
        cand = np.where(ok)[0]; L = cand[np.argmax(ac[cand])]; bpm = 60 / (L * dt)
        # affine : on cherche le tempo qui aligne le mieux une grille sur TOUT le morceau
        best = (0, bpm)
        for b in np.linspace(bpm * .985, bpm * 1.015, 61):
            per = 60 / b / dt; idx = np.arange(0, len(flux) - 1, per)
            for ph in np.linspace(0, per, 24, endpoint=False):
                v = flux[np.minimum(len(flux) - 1, (idx + ph).astype(int))].sum()
                if v > best[0]: best = (v, b)
        bpm = best[1]
    per = 60 / bpm / dt; best = (-1, 0)
    for ph in np.linspace(0, per, 64, endpoint=False):
        idx = (np.arange(ph, len(flux) - 1, per)).astype(int); v = flux[idx].sum()
        if v > best[0]: best = (v, ph)
    return bpm, best[1] * dt


def chroma(S, dt, bpm, phase, duree):
    f = np.fft.rfftfreq(8192, 1 / SR); sel = (f > 140) & (f < 2500)
    pc = (np.round(12 * np.log2(f[sel] / 440)) + 9) % 12
    M = np.zeros((12, sel.sum()), np.float32)
    for i in range(12): M[i] = pc == i
    from scipy.ndimage import median_filter
    Lg = np.log1p(S[:, sel] * 20)
    fond = median_filter(Lg, size=(1, 41), mode='nearest')   # le spectre BLANCHI : on ne garde que ce qui dépasse son voisinage (les notes,
    Pk = np.maximum(0, Lg - fond - .15)                       # pas la batterie ni la pente des graves)
    Pk = Pk * (Lg >= np.maximum(np.roll(Lg, 1, 1), np.roll(Lg, -1, 1)))  # les SOMMETS seulement
    C = Pk @ M.T                                              # (trames, 12)
    tb = 60 / bpm; nb = int((duree - phase) / tb); out = []
    for b in range(nb):
        a = int((phase + b * tb) / dt); z = int((phase + (b + 1) * tb) / dt)
        v = C[a:max(a + 1, z)].mean(0); v = v - v.min(); out.append(v / (v.max() + 1e-9))
    return np.array(out)


def masques(Ch, glob):
    """par temps : les notes nettement présentes (≥ 62 % du plus fort, 5 au plus), filtrées par la gamme du morceau"""
    gamme = set(np.argsort(glob)[-7:])
    res = []
    for v in Ch:
        o = [i for i in np.argsort(v)[::-1][:5] if v[i] >= .62 and i in gamme]
        m = 0
        for i in o: m |= 1 << int(i)
        res.append(m)
    return res, sorted(int(i) for i in gamme)


if __name__ == '__main__':
    racine = sys.argv[1]; mus = os.path.join(racine, 'assets', 'audio', 'music'); data = {}
    for r in MORCEAUX:
        f = os.path.join(mus, r)
        if not os.path.exists(f): print('  absent', r); continue
        x = lire(f); duree = len(x) / SR; S, dt = spectre(x)
        nom = os.path.basename(r).rsplit('.', 1)[0]
        sur = next((v for k, v in BPM_SUR.items() if nom.startswith(k)), None)
        bpm, ph = tempo(S, dt, sur)
        Ch = chroma(S, dt, bpm, ph, duree); glob = Ch.mean(0)
        m, gamme = masques(Ch, glob)
        data[nom] = {'bpm': round(float(bpm), 3), 'ph': round(float(ph), 3), 'gamme': gamme, 'm': m}
        noms = ['do', 'do#', 'ré', 'mi♭', 'mi', 'fa', 'fa#', 'sol', 'la♭', 'la', 'si♭', 'si']
        print('  %-26s %6.2f BPM  phase %.3f s  %4d temps  gamme %s' % (nom, bpm, ph, len(m), ' '.join(noms[i] for i in gamme)), flush=True)
    js = '// généré par atelier-son/harmonie.py — ne pas éditer à la main\nwindow.CC_HARMONIE=' + json.dumps(data, separators=(',', ':')) + ';\n'
    open(os.path.join(mus, 'harmonie.js'), 'w').write(js); print('ok', len(js), 'octets')
