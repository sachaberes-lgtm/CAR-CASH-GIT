# -*- coding: utf-8 -*-
"""LA BOUCLE AAC SANS COUTURE (2026-10-14) — pour le lobby du main (« applique les lobby Chris dans la musique lobby du main »).
Le lobby du jeu joue un seul <audio loop>. Un AAC sorti tel quel d'afconvert ne déclare son amorce (2112 échantillons de démarrage du
codeur) qu'à la façon d'Apple (iTunSMPB) : à chaque tour, un lecteur peut rejouer ce blanc — la musique « coupée bizarrement ». Même
méthode que LES BOUCLES DU LOBBY RECOUSUES du main (VERSION PRINCIPALE/CLAUDE.md), sans ffmpeg :
  1. on encode la boucle AVEC DÉBORD : la fin de la boucle devant, son début derrière — le codeur voit une boucle continue, et la
     couture fin → début vaut une couture du milieu ;
  2. on recoud le MP4 à la main : seuls les paquets utiles restent (un paquet d'avance pour l'amorce du décodeur), et une LISTE
     D'ÉDITION (`elst`) dit « saute 1024 échantillons, joue exactement N échantillons » ; l'iTunSMPB d'Apple est retiré (il dirait autre chose).
  boucle_aac.encode(L, R, 'sortie.m4a')  (L, R : la boucle exacte, en flottants, 44,1 kHz)
"""
import os, struct, subprocess, tempfile
import numpy as np

SR = 44100
PAQ = 1024
CONTENEURS = {'moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'dinf'}


def lit(b, o, e):
    out = []
    while o < e:
        sz, t = struct.unpack('>I4s', b[o:o + 8]); h = 8
        if sz == 1: sz = struct.unpack('>Q', b[o + 8:o + 16])[0]; h = 16
        t = t.decode('latin1')
        out.append([t, lit(b, o + h, o + sz) if t in CONTENEURS else b[o + h:o + sz]])
        o += sz
    return out


def ecrit(arbre):
    out = b''
    for t, c in arbre:
        corps = ecrit(c) if isinstance(c, list) else c
        out += struct.pack('>I4s', 8 + len(corps), t.encode('latin1')) + corps
    return out


def trouve(arbre, t):
    for x in arbre:
        if x[0] == t: return x
    return None


def chemin(noeud, *ts):
    """noeud = [type, enfants] ; rend le noeud au bout du chemin"""
    for t in ts: noeud = trouve(noeud[1], t)
    return noeud


def encode(L, R, sortie, debord=8128, kbps=192000):
    N = len(L)
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, 'b.wav'); m4a = os.path.join(d, 'b.m4a')
        x = np.stack([np.r_[L[-debord:], L, L[:debord]], np.r_[R[-debord:], R, R[:debord]]], 1)
        import wave
        w = wave.open(wav, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()); w.close()
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', str(kbps), '-q', '127', wav, m4a], check=True)
        b = open(m4a, 'rb').read()
    A = lit(b, 0, len(b))
    moov = trouve(A, 'moov'); ftyp = trouve(A, 'ftyp')
    # l'amorce déclarée par afconvert (iTunSMPB : « 00000000 00000840 … » = 2112)
    i = b.find(b'iTunSMPB'); amorce = 2112
    if i >= 0:
        txt = b[i:i + 200].decode('latin1', 'ignore').split()
        h = [w for w in txt if len(w) in (8, 16) and all(c in '0123456789ABCDEFabcdef' for c in w)]
        if len(h) >= 2: amorce = int(h[1], 16)
    S = amorce + debord                                       # l'échantillon où commence la boucle, dans le flux décodé
    k0 = max(0, S // PAQ - 1); saut = S - k0 * PAQ            # un paquet d'avance (le décodeur a besoin du précédent)
    k1 = -(-(S + N) // PAQ) + 1                               # …et un après la fin
    trak = trouve(moov[1], 'trak'); stbl = chemin(trak, 'mdia', 'minf', 'stbl')
    stsz = trouve(stbl[1], 'stsz')[1]; taille_fixe, n = struct.unpack('>II', stsz[4:12])
    tailles = [taille_fixe] * n if taille_fixe else list(struct.unpack('>%dI' % n, stsz[12:12 + 4 * n]))
    co = trouve(stbl[1], 'stco') or trouve(stbl[1], 'co64'); large = co[0] == 'co64'; nc = struct.unpack('>I', co[1][4:8])[0]
    offs = list(struct.unpack('>%d%s' % (nc, 'Q' if large else 'I'), co[1][8:8 + nc * (8 if large else 4)]))
    stsc = trouve(stbl[1], 'stsc')[1]; ns = struct.unpack('>I', stsc[4:8])[0]
    ent = [struct.unpack('>III', stsc[8 + 12 * j:20 + 12 * j]) for j in range(ns)]
    pos = []                                                   # l'adresse de chaque paquet dans le fichier
    for c in range(nc):
        spc = [e[1] for e in ent if e[0] <= c + 1][-1]; o = offs[c]
        for _ in range(spc):
            if len(pos) < n: pos.append(o); o += tailles[len(pos) - 1]
    k1 = min(k1, n); garde = range(k0, k1); K = len(garde)
    donnees = b''.join(b[pos[k]:pos[k] + tailles[k]] for k in garde)
    # la table des échantillons : K paquets de 1024, un seul bloc, une seule adresse
    trouve(stbl[1], 'stts')[1] = struct.pack('>IIII', 0, 1, K, PAQ)
    trouve(stbl[1], 'stsc')[1] = struct.pack('>IIIII', 0, 1, 1, K, 1)
    trouve(stbl[1], 'stsz')[1] = struct.pack('>III', 0, 0, K) + struct.pack('>%dI' % K, *[tailles[k] for k in garde])
    stbl[1] = [x for x in stbl[1] if x[0] not in ('stco', 'co64', 'sgpd', 'sbgp')] + [['stco', struct.pack('>III', 0, 1, 0)]]
    # les durées : le film à 44 100 par seconde, la piste joue N échantillons après en avoir sauté `saut`
    mvhd = trouve(moov[1], 'mvhd'); v = mvhd[1][0]
    if v == 0: mvhd[1] = mvhd[1][:12] + struct.pack('>II', SR, N) + mvhd[1][20:]
    else: mvhd[1] = mvhd[1][:20] + struct.pack('>IQ', SR, N) + mvhd[1][32:]
    tkhd = trouve(trak[1], 'tkhd'); v = tkhd[1][0]
    if v == 0: tkhd[1] = tkhd[1][:20] + struct.pack('>I', N) + tkhd[1][24:]
    else: tkhd[1] = tkhd[1][:28] + struct.pack('>Q', N) + tkhd[1][36:]
    mdhd = chemin(trak, 'mdia', 'mdhd'); v = mdhd[1][0]
    if v == 0: mdhd[1] = mdhd[1][:12] + struct.pack('>II', SR, K * PAQ) + mdhd[1][20:]
    else: mdhd[1] = mdhd[1][:20] + struct.pack('>IQ', SR, K * PAQ) + mdhd[1][32:]
    elst = ['edts', [['elst', struct.pack('>IIIiHH', 0, 1, N, saut, 1, 0)]]]
    trak[1] = [x for x in trak[1] if x[0] != 'edts']; trak[1].insert(1, elst)
    moov[1] = [x for x in moov[1] if x[0] != 'udta']             # plus d'iTunSMPB : la liste d'édition fait foi
    tete = ecrit([ftyp]); m = ecrit([moov])
    adresse = len(tete) + len(m) + 8                             # (la taille de stco ne change pas en y écrivant l'adresse)
    trouve(stbl[1], 'stco')[1] = struct.pack('>III', 0, 1, adresse); m = ecrit([moov])
    assert len(tete) + len(m) + 8 == adresse
    open(sortie, 'wb').write(tete + m + struct.pack('>I4s', 8 + len(donnees), b'mdat') + donnees)
    return {'amorce': amorce, 'saut': saut, 'paquets': K, 'N': N}
