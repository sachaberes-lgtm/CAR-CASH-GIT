"""LES VRAIS INSTRUMENTS (2026-10-14, Léo : « c'est toujours générique, toujours les mêmes sons » → « vrais instruments libres »).
Source : VSCO-2 Community Edition (github.com/sgossner/VSCO-2-CE), licence CC0 1.0 — libre, utilisable dans une appli de l'App Store,
sans attribution obligatoire (créditée quand même dans LISEZMOI.txt). 212 échantillons choisis (vsco-choix.json : quelques notes par
instrument + 34 percussions), téléchargés hors du projet, puis ici :
  · la VRAIE hauteur de chaque note mesurée (YIN) — les noms de fichiers de VSCO ne suivent pas tous la même numérotation d'octave ;
  · le silence de tête retiré (l'attaque au début), la durée bornée par famille (tenues 2,4 s, pincées/piquées 1,4 s, percussions 1,2 s,
    cymbales et gong 3 s), un fondu de fin, la crête à −1 dBFS ;
  · stéréo gardée pour piano, harpe, cordes, cymbales ; mono pour le reste ; AAC 96 kbit/s (afconvert) → assets/audio/music/direct/vrais/
    + vrais-index.json (instrument → notes [MIDI, fichier, durée] ou percussion → fichier).
⚠ L'AAC d'afconvert porte ~50 ms de silence d'amorce : le lecteur (musique-trente.js) recale l'attaque au décodage.
Lancer : <venv>/python atelier-son/vrais_instruments.py <dossier des WAV> <vsco-choix.json>
"""
import os, sys, json, subprocess, re, warnings
warnings.filterwarnings('ignore')
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, 'assets/audio/music/direct/vrais')
STEREO = {'piano', 'harpe', 'violons', 'celli', 'crash', 'cymbaleMontee', 'carillon', 'gong', 'pianoQueue', 'vibraphone', 'verres', 'arbreCloches', 'ocean', 'cymbaleMontee2', 'cymbaleMontee4'}
TENUES = {'violons', 'violonSolo', 'celli', 'trompette', 'trompetteSourd', 'cor', 'trombone', 'flute', 'clarinette', 'hautbois', 'saxo', 'harmonica', 'ocarina', 'flutebec', 'verres'}
LONGS = {'crash', 'cymbaleMontee', 'carillon', 'gong', 'timbale1', 'timbale3', 'timbale5', 'tambourGeant', 'piano', 'harpe', 'glock', 'marimba', 'pianoQueue', 'vibraphone', 'clochesTub',
         'carillonMain', 'clavecin', 'ocean', 'arbreCloches', 'sireneVraie', 'didgeridoo', 'cymbaleMontee2', 'cymbaleMontee4'}

def charge(f):
    sr, x = wavfile.read(f); x = x.astype(np.float64)
    if x.dtype.kind in 'iu' or np.abs(x).max() > 2: x /= max(1.0, float(2 ** (8 * wavfile.read(f)[1].dtype.itemsize - 1)))
    if x.ndim == 1: x = x[:, None]
    return sr, x

def yin(x, sr, fmin=25, fmax=2400):
    """la fondamentale (Hz) d'un extrait mono, méthode YIN ; None si rien de clair"""
    W = min(len(x) // 2, int(sr * .08)); tmax = int(sr / fmin); tmin = int(sr / fmax)
    if W < 256 or tmax >= len(x) - W: tmax = len(x) - W - 1
    if tmax <= tmin + 2: return None
    d = np.array([np.sum((x[:W] - x[t:t + W]) ** 2) for t in range(tmax)])
    cm = d.copy(); cm[1:] = d[1:] * np.arange(1, tmax) / np.maximum(np.cumsum(d[1:]), 1e-12); cm[0] = 1
    for t in range(tmin, tmax - 1):
        if cm[t] < .15 and cm[t] <= cm[t + 1]:
            a, b, c = cm[t - 1], cm[t], cm[t + 1]; p = t + .5 * (a - c) / (a - 2 * b + c + 1e-12)
            return sr / p
    t = tmin + int(np.argmin(cm[tmin:tmax])); return sr / t if cm[t] < .35 else None

def justesse(y, sr, m):
    """l'écart en cents de la note m : le pic du spectre au plus près de sa fondamentale (ou de son 2e harmonique si la fondamentale est
    faible), affiné par interpolation parabolique ; None si rien de net"""
    a9 = int(.05 * sr); seg = y[a9:a9 + int(.6 * sr)].mean(axis=1)
    if len(seg) < 2048: return None
    N = 1 << 18; sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), N)); fr = np.fft.rfftfreq(N, 1 / sr); f0 = 440 * 2 ** ((m - 69) / 12)
    for h in (1, 2):
        lo, hi = np.searchsorted(fr, f0 * h * 2 ** (-.6 / 12)), np.searchsorted(fr, f0 * h * 2 ** (.6 / 12))
        if hi - lo < 3: continue
        i = lo + int(np.argmax(sp[lo:hi]))
        if sp[i] < sp.max() * .08 or i in (lo, hi - 1): continue
        a, b, c = np.log(sp[i - 1] + 1e-12), np.log(sp[i] + 1e-12), np.log(sp[i + 1] + 1e-12); d = .5 * (a - c) / (a - 2 * b + c + 1e-12)
        f = (fr[i] + d * (fr[1] - fr[0])) / h; ct = 1200 * np.log2(f / f0)
        if abs(ct) < 50: return int(round(ct))
    return None

def main(*paires):   # dossier choix [dossier choix …] : plusieurs bibliothèques fondues dans la même banque
    C = []
    for dossier, choix in zip(paires[::2], paires[1::2]): C += [(k, m, p, dossier) for k, m, p in json.load(open(choix))]
    os.makedirs(SORTIE, exist_ok=True); index = {}; lot = []
    for f9 in os.listdir(SORTIE): os.remove(os.path.join(SORTIE, f9))
    for k, m_nom, p, dossier in C:
        f = os.path.join(dossier, p.replace('/', '__'))
        sr, x = charge(f)
        if sr != 44100: x = resample_poly(x, 44100, sr, axis=0); sr = 44100
        mono = x.mean(axis=1)
        env = np.abs(mono); seuil = env.max() * .02; i0 = int(np.argmax(env > seuil)); i0 = max(0, i0 - int(.003 * sr))
        lim = 3.0 if k in LONGS and m_nom is None else 2.4 if (k in TENUES or k in LONGS) else 1.4 if m_nom is not None else 1.2
        y = x[i0:i0 + int(lim * sr)]
        # la fin : sous −60 dB de la crête, on coupe ; puis un fondu
        e2 = np.abs(y).max(axis=1); pk = e2.max(); dern = np.nonzero(e2 > pk * 1e-3)[0]; fin = int(dern[-1]) + int(.02 * sr) if len(dern) else len(y)
        y = y[:max(int(.05 * sr), min(len(y), fin))]
        fo = min(len(y) // 3, int(.12 * sr)); y[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
        y = y / (np.abs(y).max() + 1e-12) * .89
        if k not in STEREO: y = y.mean(axis=1, keepdims=True)
        mm = None
        if m_nom is not None:   # la hauteur mesurée (sert à trouver le décalage d'octave des noms de CET instrument)
            a9 = int(.05 * sr); seg = y[a9:a9 + int(.5 * sr)].mean(axis=1); f0 = yin(seg, sr)
            if f0: mm = 69 + 12 * np.log2(f0 / 440)
        lot.append((k, m_nom, y, mm))
    # LE DÉCALAGE D'OCTAVE par instrument : le plus fréquent parmi les notes mesurées avec confiance (les maillets et les pincés trompent
    # YIN note à note ; le nom, lui, est juste à l'octave près)
    dec = {}
    for k in {x[0] for x in lot}:
        o9 = [round((mm - m0) / 12) for k2, m0, y, mm in lot if k2 == k and mm is not None and m0 is not None and abs((mm - m0) / 12 - round((mm - m0) / 12)) < .05]
        dec[k] = 12 * max(set(o9), key=o9.count) if o9 else 0
    dec.update({'glock': 12, 'xylo': 12, 'marimba': 12, 'clavisynth': 24})   # (le clavisynth du TX81Z sonne deux octaves au-dessus de son nom : vérifié au spectre)   # les lames : partiels inharmoniques, vérifié au pic du spectre (le nom est une octave sous le son)
    vu = set()
    for k, m_nom, y, mm in lot:
        m = m_nom + dec[k] if m_nom is not None else None
        if (k, m) in vu: continue
        vu.add((k, m))
        nom = '%s-%s' % (k, m if m is not None else 'x'); wav = os.path.join(SORTIE, nom + '.wav'); m4a = wav[:-4] + '.m4a'
        wavfile.write(wav, sr, (y * 32767).astype(np.int16))
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '96000' if y.shape[1] == 2 else '64000', wav, m4a], check=True); os.remove(wav)
        e = index.setdefault(k, {'type': 'note' if m is not None else 'perc', 'notes': []})
        ct = justesse(y, sr, m) if m is not None and k not in ('clochesTub',) else None   # l'accordage exact (cents) : le lecteur le rattrape
        e['notes'].append([m, os.path.basename(m4a), round(len(y) / sr, 3)] + ([ct] if ct else []))
        print('%-15s %-4s (nom %s, mesuré %s, décalage %+d) %.2f s %s' % (k, m, m_nom, None if mm is None else round(mm, 1), dec[k], len(y) / sr, 'stéréo' if y.shape[1] == 2 else ''), flush=True)
    for e in index.values(): e['notes'].sort(key=lambda n: (n[0] or 0))
    json.dump(index, open(os.path.join(SORTIE, 'vrais-index.json'), 'w'), ensure_ascii=False, indent=0)
    open(os.path.join(SORTIE, 'LISEZMOI.txt'), 'w').write("Vrais instruments : échantillons de VSCO-2 Community Edition et de la Versilian Community Sample Library (VCSL)\n"
        "(Versilian Studios, Sam Gossner) — github.com/sgossner/VSCO-2-CE et github.com/sgossner/VCSL — licence CC0 1.0 (domaine public).\n"
        "Retaillés et compressés par atelier-son/vrais_instruments.py.\n")
    tot = sum(os.path.getsize(os.path.join(SORTIE, f)) for f in os.listdir(SORTIE)); print('banque : %d fichiers, %.1f Mo' % (len(os.listdir(SORTIE)), tot / 1e6))

if __name__ == '__main__': main(*sys.argv[1:])
