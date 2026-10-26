"""L'ANALYSE DES INSPIRATIONS (2026-10-14, Léo dépose ses références dans bibliotheque.html › Inspirations : Ateyaba « Vision » et
« Rock With You », Daft Punk « One More Time », Nirvana « Smells Like Teen Spirit » — « vole les instruments, mélange tout intelligemment
pour avoir un générateur entraîné et original »).
On n'emprunte AUCUN son de ces enregistrements (le jeu sort sur l'App Store) : on les MESURE, et le générateur (musique-trente.js) en
tire ses réglages — tempo, mode, grille, forme, montée d'énergie, couleur du son — puis les mélange.
Mesures (numpy + scipy, sans autre outil) :
  · TEMPO : autocorrélation du flux spectral (les attaques), entre 70 et 180 BPM, préférence douce autour de 110 ;
  · TONALITÉ : chroma de tout le morceau contre les profils de Krumhansl (24 tonalités) ;
  · GRILLE : un accord par mesure (gabarits majeur · mineur · quinte à vide), la suite de 4 mesures la plus jouée ;
  · PARTIES : nouveauté sur la matrice d'auto-similarité des mesures (chroma + bandes d'énergie), lettres A, B, C… pour les parties
    qui reviennent ; pour chacune : niveau (calme · moyen · fort), basse, aigus, densité d'attaques ;
  · PROFIL : brillance (centroïde), poids de la basse, écart de dynamique entre parties, POMPE (creux de niveau après chaque temps).
Lancer : <venv>/python atelier-son/analyse_inspi.py [fichier …]   (sans argument : toutes les inspirations de liste.json qui ont un
fichier et pas encore d'analyse ; `--tout` refait tout) → écrit `analyse` dans assets/audio/music/inspi-generateur/liste.json.
"""
import sys, os, json, subprocess, tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import stft, find_peaks

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LISTE = os.path.join(RACINE, 'assets/audio/music/inspi-generateur/liste.json')
SR, HOP, NFFT = 22050, 512, 4096
FR = SR / HOP
NOTES = ['do', 'do♯', 'ré', 'mi♭', 'mi', 'fa', 'fa♯', 'sol', 'la♭', 'la', 'si♭', 'si']
NOTES_EN = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']
KMAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
KMIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
mmss = lambda s: '%d:%02d' % (int(s) // 60, int(s) % 60)


def charge(f):
    tmp = tempfile.mktemp(suffix='.wav')
    subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@%d' % SR, '-c', '1', f, tmp], check=True, capture_output=True)
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter('ignore'); _, x = wavfile.read(tmp)
    os.remove(tmp)
    return x.astype(np.float32) / 32768


def tempo_de(flux):
    o = flux - np.convolve(flux, np.ones(16) / 16, 'same'); o = np.maximum(o, 0); o = o - o.mean()
    ac = np.correlate(o, o, 'full')[len(o) - 1:]; ac /= ac[0] + 1e-9
    best, bs = None, -1e9
    for bpm in np.arange(70, 180.01, .1):
        lag = FR * 60 / bpm; sc = 0
        for k, w in ((1, 1.), (2, .5), (4, .25)):   # le peigne : un vrai tempo revient aussi à 2 et 4 temps
            l = lag * k; i = int(l); f = l - i
            if i + 1 < len(ac): sc += w * (ac[i] * (1 - f) + ac[i + 1] * f)
        sc *= np.exp(-.5 * (np.log2(bpm / 110) / 1.1) ** 2)
        if sc > bs: bs, best = sc, bpm
    return round(float(best), 1), o


def analyse(f):
    return analyse_x(charge(f))


def analyse_x(x):
    dur = len(x) / SR
    fq, _, Z = stft(x, SR, nperseg=NFFT, noverlap=NFFT - HOP, boundary=None, padded=False); M = np.abs(Z).astype(np.float32)
    S = np.log1p(100 * M); flux = np.maximum(S[:, 1:] - S[:, :-1], 0).sum(0); flux = np.r_[0, flux]
    bpm, onv = tempo_de(flux)
    att = np.maximum(flux - np.convolve(flux, np.ones(16) / 16, 'same'), 0)   # les attaques (positives) : la densité
    beat = FR * 60 / bpm
    # la phase des temps : le décalage qui récolte le plus d'attaques ; le 1er temps de la mesure : celui où la basse frappe le plus
    phases = np.arange(0, beat, .5); sc = [onv[np.clip(np.round(np.arange(p, len(onv), beat)).astype(int), 0, len(onv) - 1)].sum() for p in phases]
    ph = phases[int(np.argmax(sc))]; temps = np.arange(ph, len(onv), beat)
    bas = M[(fq >= 30) & (fq < 150)].sum(0); bflux = np.maximum(np.diff(np.log1p(100 * bas), prepend=0), 0)
    ti = np.clip(np.round(temps).astype(int), 0, len(onv) - 1); d0 = int(np.argmax([bflux[ti[k::4]].sum() for k in range(4)]))
    mesures = temps[d0::4]; mesures = mesures[mesures + 4 * beat < M.shape[1]]
    # par mesure : chroma, bandes, niveau, densité
    ok = (fq >= 60) & (fq <= 2200); pcs = (np.round(12 * np.log2(fq[ok] / 440)) + 9).astype(int) % 12
    bandes = [(20, 90), (90, 250), (250, 1000), (1000, 4000), (4000, 11000)]
    E = M ** 2; ch, bd, rms, dens = [], [], [], []
    for a in mesures:
        i0, i1 = int(a), int(a + 4 * beat); seg = M[ok, i0:i1].sum(1)
        c = np.bincount(pcs, weights=seg, minlength=12); ch.append(c / (c.sum() + 1e-9))
        bd.append([10 * np.log10(E[(fq >= lo) & (fq < hi), i0:i1].mean() + 1e-12) for lo, hi in bandes])
        rms.append(10 * np.log10(E[:, i0:i1].mean() + 1e-12)); dens.append(att[i0:i1].mean())
    ch, bd, rms, dens = np.array(ch), np.array(bd), np.array(rms), np.array(dens)
    # LA TONALITÉ (Krumhansl), pondérée par le niveau
    tot = (ch * (10 ** (rms / 10))[:, None]).sum(0); best = None
    for r in range(12):
        for mode, prof in (('majeur', KMAJ), ('mineur', KMIN)):
            c = np.corrcoef(np.roll(prof, r), tot)[0, 1]
            if best is None or c > best[0]: best = (c, r, mode)
    conf, ton, mode = best
    # LA GRILLE : un accord par mesure, la suite de 4 la plus jouée
    gab = []
    for r in range(12):
        for nom, iv in (('', (0, 4, 7)), ('m', (0, 3, 7)), ('5', (0, 7))):
            v = np.zeros(12); v[[(r + i) % 12 for i in iv]] = 1; v[r] += .3; gab.append((NOTES_EN[r] + nom, v / np.linalg.norm(v)))
    acc = [max(gab, key=lambda g: g[1] @ (c / (np.linalg.norm(c) + 1e-9)))[0] for c in ch]
    quads = {}
    for k in range(0, len(acc) - 3):
        q = tuple(acc[k:k + 4]); quads[q] = quads.get(q, 0) + (2 if k % 4 == 0 else 1)
    grille = ' · '.join(max(quads, key=quads.get)) if quads else ''
    # LES PARTIES : nouveauté (noyau en damier de 8 mesures) sur l'auto-similarité
    F = np.c_[ch * 3, (bd - bd.mean(0)) / (bd.std(0) + 1e-6), (rms - rms.mean()) / (rms.std() + 1e-6) * 1.5]
    Fn = F / (np.linalg.norm(F, axis=1, keepdims=True) + 1e-9); SSM = Fn @ Fn.T; n = len(F); w = 4; nov = np.zeros(n)
    K = np.block([[np.ones((w, w)), -np.ones((w, w))], [-np.ones((w, w)), np.ones((w, w))]])
    for i in range(w, n - w): nov[i] = (SSM[i - w:i + w, i - w:i + w] * K).sum()
    pk, _ = find_peaks(nov, distance=4, height=nov.mean() + .5 * nov.std()) if n > 2 * w else (np.array([], int), None)
    bords = [0] + [int(p) for p in pk] + [n]
    secs, lettres, moy = [], [], []
    rmax = max(rms[bords[k]:bords[k + 1]].mean() for k in range(len(bords) - 1))
    for k in range(len(bords) - 1):
        a, b = bords[k], bords[k + 1]; m = F[a:b].mean(0); m = m / (np.linalg.norm(m) + 1e-9); L = None
        for j, mj in enumerate(moy):
            if m @ mj > .92: L = lettres[j]; break
        if L is None: L = chr(65 + len(set(lettres)))
        lettres.append(L); moy.append(m)
        r = rms[a:b].mean() - rmax
        secs.append({'debut': mmss(mesures[a] / FR), 'mesures': b - a, 'partie': L, 'niveau': 'fort' if r > -3 else 'moyen' if r > -8 else 'calme',
                     'db': round(float(r), 1), 'basse': round(float(bd[a:b, :2].mean() - bd[:, :2].mean()), 1), 'aigus': round(float(bd[a:b, 4].mean() - bd[:, 4].mean()), 1),
                     'densite': round(float(dens[a:b].mean() / (dens.mean() + 1e-9)), 2)})
    # LE PROFIL : brillance, poids de la basse, dynamique, POMPE (le niveau des médiums juste après chaque temps vs juste avant)
    cen = float((fq[:, None] * M).sum(0).mean() / (M.sum(0).mean() + 1e-9))
    med = E[(fq >= 250) & (fq < 2000)].sum(0); creux = []
    for t in temps[2:-2]:
        i = int(t); a = med[i + 1:i + int(beat * .25) + 1].mean(); b9 = med[i + int(beat * .55):i + int(beat * .9)].mean()
        if a > 0 and b9 > 0: creux.append(10 * np.log10(b9 / a))
    pompe = round(float(np.median(creux)), 1) if creux else 0.
    niv = [s['db'] for s in secs]
    res = {'bpm': bpm, 'tonalite': NOTES[ton] + ' ' + mode, 'ton': int(ton), 'mode': mode, 'confiance': round(float(conf), 2), 'duree': mmss(dur), 'grille': grille,
           'forme': ' '.join(s['partie'] for s in secs), 'parties': secs, 'brillance_hz': int(cen), 'basse_db': round(float(bd[:, :2].mean() - bd[:, 2:].mean()), 1),
           'dynamique_db': round(float(max(niv) - min(niv)), 1) if niv else 0., 'pompe_db': pompe, 'mesures': n}
    res['resume'] = '%s BPM · %s · grille %s · forme %s' % (('%g' % bpm), res['tonalite'], grille or '?', res['forme'])
    return res


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; tout = '--tout' in sys.argv
    if args:
        for f in args: print(json.dumps(analyse(f), ensure_ascii=False, indent=1))
    else:
        L = json.load(open(LISTE, encoding='utf-8'))
        for e in L:
            if not e.get('f') or (e.get('analyse') and not tout): continue
            print('…', e['titre'], flush=True); e['analyse'] = analyse(os.path.join(RACINE, e['f'])); print('  ', e['analyse']['resume'], flush=True)
            for s in e['analyse']['parties']: print('    %s  %-2s %3d mes. %-6s %+5.1f dB  basse %+5.1f  aigus %+5.1f  densité %.2f' % (s['debut'], s['partie'], s['mesures'], s['niveau'], s['db'], s['basse'], s['aigus'], s['densite']))
            print('    brillance %d Hz · basse %+.1f dB · dynamique %.1f dB · pompe %+.1f dB' % (e['analyse']['brillance_hz'], e['analyse']['basse_db'], e['analyse']['dynamique_db'], e['analyse']['pompe_db']), flush=True)
            json.dump(L, open(LISTE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
