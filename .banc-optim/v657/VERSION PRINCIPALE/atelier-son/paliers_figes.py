"""CIEL ET PENTHOUSE EN 8 PALIERS DE MOTEUR (2026-10-14, Léo : « transforme CIEL en musique 8 paliers moteurs, et PENTHOUSE pareil »).
On garde LEUR vrai son : la même composition (ciel.py · ville_suite.py), les mêmes instruments, les mêmes graines — seulement
ce qui JOUE change d'un palier à l'autre (un instrument de plus à chaque palier, comme les morceaux à paliers de la bibliothèque).
  CIEL (88 BPM, mi♭ majeur, 8 mesures) : les 5 niveaux de ciel.py, avec des pistes coupées pour faire 8 marches. Tout reste à 88 BPM
  (le lecteur cale ses mesures sur la longueur des boucles : le final ne passe plus à 95).
  PENTHOUSE (120 BPM, si m9 · mi9 · la maj9 · fa# m9, 8 mesures) : les pistes de la définition, ajoutées une à une ; au palier 8, une
  section de CUIVRES douce sur les accords (celle de CASH EXPLOSION) et des pièces plus nombreuses.
Chaque palier : une boucle sans couture (la queue repliée sur le début, fin() de boucles.py), sonie −17 dB + 0,6 dB par palier
(même mesure que palSonie de musique-paliers.js : l'énergie au-dessus de ~100 Hz), crête ≤ 0,944, AAC 192 k (afconvert) dans
assets/audio/music/paliers/rendus/<id>/p1…p8.m4a, puis la fiche dans rendus/index.js (POST /fige-index de serveur-moteur.py, lancé).
Lancer : <venv>/python atelier-son/paliers_figes.py ciel|penthouse [port=9141]
"""
import os, sys, json, subprocess, time, urllib.request
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from boucles import SR, ecrit_wav  # noqa: E402

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIBLE, PAS, CRETE = -17., .6, .944
MOTEURS = [4, 4, 4, 4, 4, 4, 4, 2]


def sonie(L, R):   # = palSonie : un passe-haut d'un pôle à ~100 Hz, puis l'énergie moyenne des deux canaux
    k = np.exp(-2 * np.pi * 100 / SR); e = 0.
    from scipy.signal import lfilter
    for d in (L, R):
        y = lfilter([k, -k], [1, -k], d); e += float((y * y).sum())
    return 10 * np.log10(e / (2 * len(L)) + 1e-12)


def limite(L, R, c=CRETE, att=.002, rel=.08):
    """un LIMITEUR à anticipation : le gain baisse 2 ms AVANT chaque crête qui dépasse c, puis remonte en 80 ms (sans lui, les coups de
    grosse caisse bloquaient la montée de sonie : P4-P8 restaient tous à −15,8 dB)"""
    from scipy.ndimage import minimum_filter1d
    pk = np.maximum(np.abs(L), np.abs(R)); g = np.minimum(1., c / np.maximum(pk, 1e-9))
    n = int(att * SR); g = minimum_filter1d(g, 2 * n + 1, origin=0)          # la fenêtre d'anticipation
    a = np.exp(-1 / (rel * SR)); out = g.copy(); y = 1.
    for i in range(len(g)):                                                  # descend tout de suite, remonte lentement
        y = g[i] if g[i] < y else g[i] + (y - g[i]) * a; out[i] = y
    from scipy.signal import lfilter
    out = lfilter([1 - np.exp(-1 / (n or 1))], [1, -np.exp(-1 / (n or 1))], out)   # un lissage court : pas de cassure dans la courbe de gain
    out = np.minimum(out, np.minimum(1., c / np.maximum(pk, 1e-9)))          # le retard du lissage : jamais une crête au-dessus de c
    return L * out, R * out


def fige(id_, fiche, rendus, port):
    """rendus : [(L, R)] un par palier → p1…pN.m4a normalisés + la fiche"""
    dos = os.path.join(RACINE, 'assets/audio/music/paliers/rendus', id_); os.makedirs(dos, exist_ok=True)
    fichiers = []
    for k, (L, R) in enumerate(rendus):
        vise = CIBLE + PAS * k; l0 = sonie(L, R); g = 10 ** ((vise - l0) / 20)
        for _ in range(3):                                                   # le gain vers la cible, le limiteur, on corrige ce qu'il a mangé
            L2, R2 = limite(L * g, R * g); l = sonie(L2, R2)
            if abs(l - vise) < .15: break
            g *= 10 ** ((vise - l) / 20)
        pk = max(np.abs(L2).max(), np.abs(R2).max())
        if pk > .985: L2 *= .985 / pk; R2 *= .985 / pk                      # filet : le lissage ne dépasse jamais 0,985
        L, R = L2, R2; g = 1.
        wav = os.path.join(dos, 'p%d.wav' % (k + 1)); m4a = wav[:-4] + '.m4a'; ecrit_wav(wav, L, R)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', wav, m4a], check=True); os.remove(wav)
        fichiers.append(os.path.relpath(m4a, RACINE)); print('  P%d  %.1f dB (visé %.1f)  crête %.3f' % (k + 1, sonie(L, R), vise, max(np.abs(L).max(), np.abs(R).max())), flush=True)
    fiche = dict(fiche, id=id_, mesures=8, intro=0, introTxt='', moteurs=MOTEURS, fichiers=fichiers, introF=None,
                 dur=round(len(rendus[0][0]) / SR, 5), fige=time.strftime('%Y-%m-%dT%H:%M'))
    q = urllib.request.Request('http://127.0.0.1:%d/fige-index' % port, data=json.dumps(fiche, ensure_ascii=False).encode(), method='POST')
    urllib.request.urlopen(q).read(); print('fiche ok :', id_)


# ------------------------------------------------------------------------------------------------ CIEL
CIEL = [  # (niveau de ciel.py, pistes coupées, ce qu'on entend)
    (1, [], 'La nappe vapeur seule, filtrée, et la sous-basse tenue.'),
    (2, ['bat'], 'La nappe s’ouvre, le Rhodes pose les accords.'),
    (2, [], 'Le rim et le shaker entrent.'),
    (3, ['basse', 'sn'], 'La grosse caisse moderne et les charleys.'),
    (3, [], 'Le clap et la basse funky façon ARP : le beat complet.'),
    (4, [], 'La mélodie au synthé monophonique, les notes qui glissent.'),
    (5, ['verre', 'cordes'], 'Le final : un ton plus haut, le solo improvisé, la grosse caisse qui pousse, les claquements de doigts.'),
    (5, [], 'Le grand écran : les cordes amples et l’arpège de verre.'),
]


def ciel_rendus():
    import ciel as C
    orig = C.fin; rendus = []
    for nv, coupe, _ in CIEL:
        def fin2(M, gains, **k):
            return orig(M, {p: (0 if p in coupe else g) for p, g in gains.items()}, **k)
        C.fin = fin2
        try:
            M = C.Morceau(C.BPM, mesures=8, graine=710 + nv); h = C.Main(710 + nv, 4)
            rendus.append(C.composer(M, lambda m, nv=nv: nv, M.de, h))
        finally:
            C.fin = orig
        print('  CIEL niveau %d %s : %.2f s' % (nv, ('− ' + ' '.join(coupe)) if coupe else '', len(rendus[-1][0]) / SR), flush=True)
    return rendus


# ------------------------------------------------------------------------------------------------ PENTHOUSE
PENT = [  # (pistes de la définition qui jouent, réglages de volume en dB, ce qu'on entend)
    (['juno', 'sub', 'bell'], {}, 'Le hall : la nappe Juno, la sous-basse et les cloches de verre.'),
    (['juno', 'sub', 'bell', 'rhodes', 'harp'], {}, 'Le Rhodes généreux et les glissandos de harpe.'),
    (['juno', 'sub', 'bell', 'rhodes', 'harp', 'bass808', 'hat'], {'hat': -8}, 'La 808 qui glisse, les charleys feutrés.'),
    (['juno', 'bell', 'rhodes', 'harp', 'bass808', 'hat', 'boomkick', 'clap'], {'hat': -4}, 'Le beat trap : grosse caisse, clap sur le 3.'),
    (['juno', 'bell', 'rhodes', 'harp', 'bass808', 'hat', 'boomkick', 'clap', 'strings'], {}, 'Les cordes, les charleys à plein.'),
    (['juno', 'bell', 'rhodes', 'harp', 'bass808', 'hat', 'boomkick', 'clap', 'strings', 'cs80'], {}, 'Le lead qui s’élève.'),
    (['juno', 'bell', 'rhodes', 'harp', 'bass808', 'hat', 'boomkick', 'clap', 'strings', 'cs80', 'coins', 'sub'], {}, 'Les pièces qui tintent, la sous-basse revient sous la 808.'),
    (None, {}, 'Le luxe total : les cuivres posent les accords, plus de pièces, tout pousse.'),
]


def penthouse_rendus():
    import ville_suite as VS
    NV = VS.NV; D0 = VS.SUITE[2]; tours = NV.TOURS; NV.TOURS = 2   # 4 mesures × 2 = la boucle de 8 mesures
    rendus = []
    try:
        for garde, vol, _ in PENT:
            D = dict(D0); tr = []
            for t in D0['tracks']:
                if garde is not None and t['inst'] not in garde: continue
                t = dict(t)
                if t['inst'] in vol: t['vol'] = t.get('vol', 0) + vol[t['inst']]
                if garde is None and t['inst'] == 'coins': t['prob'] = .75
                tr.append(t)
            if not any(t['inst'] in ('strings', 'harp', 'brass', 'coins', 'kaching', 'clap', 'hat') for t in tr):   # (rendre_suite plante sans piste « neuve » : une piste muette)
                tr.append({'inst': 'coins', 'len': 4, 'rev': .45, 'vol': -60, 'prob': 0., 'variants': [{'pattern': 'c' + '.' * 15}]})
            if garde is None:   # le final : une section de cuivres douce sur les accords (celle de CASH EXPLOSION), la poussée un cran au-dessus
                tr.append({'inst': 'brass', 'len': 4, 'rev': .45, 'vol': -9, 'variants': [{'notes': [[p, [VS.nom_oct(x, 1) for x in ch[1:4]], 3, .8] for p, ch, l, b in VS.PROG['luxe']]}]})
                D['drive'] = 1.2
            D['tracks'] = tr; NV._kicks = []
            rendus.append(VS.rendre_suite(D, 1308)); print('  PENTHOUSE %d pistes : %.2f s' % (len(tr), len(rendus[-1][0]) / SR), flush=True)
    finally:
        NV.TOURS = tours
    return rendus


if __name__ == '__main__':
    quoi = sys.argv[1]; port = int(sys.argv[2]) if len(sys.argv) > 2 else 9141
    if quoi == 'ciel':
        fige('ciel', {'titre': 'CIEL', 'style': 'Library soul / hip-hop · la nappe vapeur qui s’étoffe (tes niveaux du CIEL, en 8 paliers)',
                      'bpm': 88, 'ton': 'mi♭ majeur', 'paliers': [x[2] for x in CIEL]}, ciel_rendus(), port)
    elif quoi == 'penthouse':
        fige('penthouse', {'titre': 'PENTHOUSE', 'style': 'Trap de luxe · Rhodes, harpe, cordes, pièces (ville niveau 8, en 8 paliers)',
                           'bpm': 120, 'ton': 'si m9 · mi9 · la maj9 · fa# m9', 'paliers': [x[2] for x in PENT]}, penthouse_rendus(), port)
