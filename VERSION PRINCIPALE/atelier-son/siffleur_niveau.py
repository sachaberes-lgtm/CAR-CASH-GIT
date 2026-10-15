# -*- coding: utf-8 -*-
"""LE SIFFLEUR EN NIVEAU (2026-10-14, Léo : « tente de faire un niveau avec la matière de SIFFLEUR, elle serait cool en niveau »).
La MATIÈRE du SIFFLEUR (petites_musiques.py) : la ballade soul en 12/8, son orgue à tirettes dans la cabine tournante, son Rhodes
paresseux, ses balais, sa basse ronde, sa grille (mi♭ · sol m7 · la♭ · si♭sus · mi♭ · do m7 · fa m7 · si♭7) et SA mélodie sifflée —
les mêmes fonctions, les mêmes réglages. Ce qui change : elle devient un morceau À PALIERS (8, comme CIEL et PENTHOUSE : un palier
tous les 4 moteurs, le dernier sur 2), un peu plus allant (64 BPM au lieu de 58 : la course), et chaque palier change au moins trois
choses qu'on entend (CONSIGNE-MUSIQUE-PALIERS) — on part de la nuit (l'orgue seul) et on finit en soul de grande salle, un ton plus haut.
  P1 l'orgue seul, cabine lente, la basse tenue, les claquements de doigts sur 2 et 4
  P2 la cabine s'emballe, le Rhodes paresseux, les balais par trois, la basse qui marche (1 · 3 · le dernier triolet)
  P3 la grosse caisse et la caisse douce : le groove du SIFFLEUR au complet
  P4 LE SIFFLEUR : la mélodie sifflée (le drop, au moteur 13)
  P5 ça décolle : grosse caisse sur les contretemps, claps sur 2 et 4, shaker en triolets, la basse qui amène l'accord suivant
  P6 l'église : le chœur « ooh » sur les accords, les coups d'orgue sur 2 et 4, la ride en 12/8
  P7 UN TON PLUS HAUT (fa) : les cuivres soul sur les changements, la cymbale, un 2e siffleur en harmonie
  P8 le grand final : les cuivres répondent à la mélodie, la basse en octaves, le roulement de la dernière mesure
Chaque partie a SA main et SON hasard (graine par partie) : d'un palier à l'autre, ce qui joue déjà joue exactement pareil.
Lancer (le serveur de la page tourne : il range la fiche) : <venv>/python atelier-son/siffleur_niveau.py [port=9200]
"""
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from boucles import SR, Des, filtre, passe_bande                                                        # noqa: E402
from petites_musiques import Partition, finir, orgue, sifflet, verifie                     # noqa: E402
from vapeurs import balai, rhodes_p, ride                                                  # noqa: E402
from lobby_chris import Main, basse_ronde, kick_doux, caisse_douce, hat, shaker, snap, clap_doux   # noqa: E402
from boucles8 import crash                                                                 # noqa: E402
from ciel import cuivres, choeur                                                           # noqa: E402
import paliers_figes as PF                                                                 # noqa: E402

BPM, GRAINE = 64, 5505
V = {'Eb': [51, 55, 58, 62], 'Gm7': [53, 55, 58, 62], 'Ab': [51, 55, 56, 60], 'Bbs': [51, 53, 56, 58], 'Cm7': [51, 55, 58, 60],
     'Fm7': [51, 53, 56, 60], 'Bb7': [50, 53, 56, 58]}
RAC = {'Eb': 39, 'Gm7': 43, 'Ab': 44, 'Bbs': 46, 'Cm7': 36, 'Fm7': 41, 'Bb7': 46}
GRILLE = ['Eb', 'Gm7', 'Ab', 'Bbs', 'Eb', 'Cm7', 'Fm7', 'Bb7']          # la section A du SIFFLEUR : 8 mesures, la boucle
MEL = [(0, 0, 70, 5), (0, 5, 67, 1), (0, 6, 70, 3), (0, 9, 74, 3), (1, 0, 74, 6), (1, 6, 72, 3), (1, 9, 70, 3), (2, 0, 72, 9), (2, 9, 67, 3),
       (3, 0, 68, 6), (3, 6, 70, 6), (4, 0, 70, 5), (4, 5, 67, 1), (4, 6, 70, 3), (4, 9, 75, 3), (5, 0, 74, 6), (5, 6, 72, 3), (5, 9, 70, 3),
       (6, 0, 72, 6), (6, 6, 68, 3), (6, 9, 65, 3), (7, 0, 70, 9), (7, 9, 74, 3)]   # = melA du SIFFLEUR, note pour note

PALIERS = [
    "La nuit : l'orgue seul dans sa cabine qui tourne lentement, la basse tenue, des claquements de doigts sur 2 et 4.",
    "La cabine s'emballe, le Rhodes paresseux sur le dernier triolet, les balais par trois, la basse qui marche.",
    "La grosse caisse et la caisse douce : le groove du SIFFLEUR au complet.",
    "LE SIFFLEUR : la mélodie sifflée, qui glisse d'une note à l'autre.",
    "Ça décolle : grosse caisse sur les contretemps, claps, shaker en triolets, la basse qui amène l'accord suivant.",
    "L'église : le chœur « ooh » sur les accords, les coups d'orgue sur 2 et 4, la ride en 12/8.",
    "Un ton plus haut : les cuivres soul sur les changements, la cymbale, un 2e siffleur en harmonie.",
    "Le grand final : les cuivres répondent à la mélodie, la basse en octaves, le roulement de la dernière mesure.",
]


def harmonie(n, ch):
    """le 2e siffleur : la note de l'accord juste en dessous de la mélodie (une tierce ou une quarte), sinon rien"""
    for d in (3, 4, 5):
        if (n - d) % 12 in {x % 12 for x in ch}: return n - d
    return None


def creuse_boue(P):
    """(mesuré : au final la zone 250-430 Hz montait à 20 % de l'énergie, contre 7 % dans le SIFFLEUR d'origine et ~9 % dans les sons que
    Léo aime) — le creux de BOUE, piste par piste, sur ce qui a été AJOUTÉ (chœur, cuivres, coups d'orgue) ; la matière d'origine n'y passe pas"""
    for nom in ('ch', 'cu', 'org2'):
        if nom in P.bus:
            for c in (0, 1): P.bus[nom][c] = P.bus[nom][c] - .75 * passe_bande(P.bus[nom][c], 250, 430)


def palier(k):
    """k = 1…8 → (Partition, (L, R))"""
    T = 2 if k >= 7 else 0                                                     # P7-P8 : un ton plus haut (mi♭ → fa)
    P = Partition(BPM, 3, 4, 8, GRAINE)
    H = {nom: Main(GRAINE + 11 * i, 7. if nom != 'bas' else 5., .2 if nom != 'bas' else .25)
         for i, nom in enumerate(('org', 'bas', 'rh', 'bat', 'sif', 'per', 'ch', 'cu', 'sif2'))}   # une main par partie
    D = {nom: Des(GRAINE + 101 + i) for i, nom in enumerate(('bat', 'per', 'cu'))}                   # un hasard de bruit par partie
    rr = np.random.default_rng(GRAINE + 7)
    dc = P.dc; tm = P.pm * dc
    for m, nom in enumerate(GRILLE):
        ch = [x + T for x in V[nom]]; rac = RAC[nom] + T; suiv = RAC[GRILLE[(m + 1) % 8]] + T
        P.note_acc(m, 0, 12, ch + [rac])
        # L'ORGUE — P1 la cabine lente et l'attaque qui gonfle (l'intro du SIFFLEUR), puis la cabine rapide
        l, r = orgue(ch, tm + .05, 1.2 if k == 1 else 6.0, .25 if k == 1 else .02)
        P.pose2('org', P.t(m, 0), l, r, .5 if k == 1 else .55)
        # LA BASSE — P1 tenue ; P2+ comme le SIFFLEUR (1, la quinte sur le 3, le dernier triolet) ; P5+ elle amène l'accord suivant
        hb = H['bas']
        if k == 1:
            P.pose('basse', hb.t(P.t(m, 0)), basse_ronde(rac, 11 * dc), hb.g(.6), 0)
        else:
            P.pose('basse', hb.t(P.t(m, 0)), basse_ronde(rac, 5 * dc), hb.g(.7), 0)
            q = rac + 7 if (rac + 7) % 12 in {x % 12 for x in ch} else rac
            P.pose('basse', hb.t(P.t(m, 6)), basse_ronde(q, 2.5 * dc), hb.g(.5), 0)
            if k >= 5:
                ap = suiv - 1 if (suiv - 1) % 12 != (rac % 12) else suiv + 2       # la note qui amène (un demi-ton sous la suivante)
                P.pose('basse', hb.t(P.t(m, 9)), basse_ronde(rac + 12 if k >= 8 else rac, 1.5 * dc), hb.g(.35), 0)
                P.pose('basse', hb.t(P.t(m, 11)), basse_ronde(ap, .9 * dc), hb.g(.42), 0)
            else:
                P.pose('basse', hb.t(P.t(m, 11)), basse_ronde(rac, .9 * dc), hb.g(.35), 0)
            if k >= 8: P.pose('basse', hb.t(P.t(m, 0)), basse_ronde(rac + 12, 2 * dc), hb.g(.22), .1)   # les octaves du final
        # LE RHODES PARESSEUX (P2+) : le dernier triolet de chaque temps
        if k >= 2:
            h = H['rh']
            for i in (2, 5, 8, 11):
                if rr.random() < .2: continue
                for j, n in enumerate(ch[1:]): P.pose('rh', h.t(P.t(m, i), 8) + j * .007, rhodes_p(n + 12, 1.5 * dc, h.g(.45)), .13, -.25 + .2 * j)
        # LA BATTERIE — P1 les doigts ; P2 les balais ; P3+ grosse caisse et caisse douce ; P5+ ça pousse
        hb2, db = H['bat'], D['bat']
        for i in (3, 9):
            if k == 1: P.pose('per', hb2.t(P.t(m, i)), snap(db), hb2.g(.45), .2)
        if k >= 2:
            for i in range(12): P.pose('bat', hb2.t(P.t(m, i)), balai(db), hb2.g((.22 if i % 3 == 0 else .1) * (.7 if k >= 6 else 1)), .3)
        if k >= 3:
            for i in (3, 9): P.pose('bat', hb2.t(P.t(m, i)), caisse_douce(db) * .6, hb2.g(.5 if k < 5 else .62), -.05)
            for i in (0, 7): P.pose('bat', hb2.t(P.t(m, i)), kick_doux(db), hb2.g(.6 if i == 0 else .35), 0)
        if k >= 5:
            hp, dp = H['per'], D['per']
            P.pose('bat', hb2.t(P.t(m, 10)), kick_doux(db), hb2.g(.32), 0)
            for i in (3, 9): P.pose('per', hp.t(P.t(m, i)), clap_doux(dp), hp.g(.5), .08)
            for i in range(12): P.pose('per', hp.t(P.t(m, i)), shaker(dp), hp.g(.11 if i % 3 == 1 else .06), -.35)
            P.pose('per', hp.t(P.t(m, 11)), hat(dp, True), hp.g(.16), .4)
        if k >= 6:
            hp, dp = H['per'], D['per']
            for i in (0, 2, 3, 5, 6, 8, 9, 11): P.pose('per', hp.t(P.t(m, i)), ride(dp), hp.g(.16 if i % 3 == 0 else .09), .45)
        if k >= 7 and m == 0: P.pose('per', P.t(m, 0), crash(D['per'], 1.6), .32, .3)
        if k >= 8 and m == 7:                                                                   # le roulement : les triolets du 4e temps
            for j, i in enumerate((9, 10, 11)): P.pose('bat', hb2.t(P.t(m, i)), caisse_douce(db) * .6, .35 + .12 * j, -.05)
        # L'ÉGLISE (P6+) : le chœur sur les accords, les coups d'orgue sur 2 et 4
        if k >= 6:
            P.pose('ch', P.t(m, 0), choeur(ch, tm * .97), .4, 0)
            for i in (3, 9):
                l, r = orgue([x + 12 for x in ch[1:]], 1.4 * dc, 6.0, .005)
                P.pose2('org2', H['org'].t(P.t(m, i)), l, r, H['org'].g(.4))
        # LES CUIVRES (P7+) : sur le changement d'accord ; P8 : ils répondent dans les silences de la mélodie
        if k >= 7:
            hc = H['cu']
            P.pose('cu', hc.t(P.t(m, 0)), cuivres(ch[1:], 2.2 * dc), hc.g(.42), -.15)
            if k >= 8 and m % 2 == 1: P.pose('cu', hc.t(P.t(m, 9)), cuivres([x + 12 for x in ch[1:3]], 1.6 * dc), hc.g(.34), .2)
    # LE SIFFLEUR (P4+) — sa mélodie, telle quelle ; P7+ un 2e siffleur en harmonie sur les notes longues
    if k >= 4:
        h, h2, prec = H['sif'], H['sif2'], None
        for (b, p, n, l) in MEL:
            n = n + T; t = P.t(b, p); d = l * dc; P.note_mel(t, n, d)
            P.pose('sif', h.t(t, 12), sifflet(n + 12, d * .96, prec + 12 if prec else None), h.g(.85), .05)
            if k >= 7 and l >= 3:
                hn = harmonie(n, [x + T for x in V[GRILLE[b]]])
                if hn is not None: P.note_mel(t, hn, d); P.pose('sif2', h2.t(t, 14), sifflet(hn + 12, d * .9), h2.g(.5), -.35)
            prec = n
    gains = dict(org=1., org2=1., basse=.6 if k >= 5 else .5 if k > 1 else .55, rh=1., bat=.45, per=.5, sif=1., sif2=1., ch=.5, cu=.6)
    envois = dict(org=.3, org2=.35, rh=.4, sif=.45, sif2=.5, bat=.15, per=.15, ch=.55, cu=.35)
    return P, finir(P, gains, envois, rev=(2.8, .42), bande=.0018, lp=10000, pre=creuse_boue)


def brillance(L, R):
    """le centre de gravité du spectre (Hz) — ses sons aimés restent sous ~2 800 Hz (« jamais clinquant »)"""
    x = (L + R) / 2; S = np.abs(np.fft.rfft(x * np.hanning(len(x)))); f = np.fft.rfftfreq(len(x), 1 / SR)
    return float((S * f).sum() / (S.sum() + 1e-12))


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9200
    rendus = []
    for k in range(1, 9):
        P, (L, R) = palier(k); rendus.append((L, R))
        print('  P%d  %.2f s  frottements %d  brillance %d Hz' % (k, len(L) / SR, verifie(P), brillance(L, R)), flush=True)
    PF.fige('siffleur', {'titre': 'SIFFLEUR · NIVEAU', 'style': 'Soul en 12/8 · la matière du SIFFLEUR (orgue Leslie, Rhodes, balais, sifflement) en 8 paliers',
                         'bpm': BPM, 'ton': 'mi♭ majeur → fa', 'paliers': PALIERS}, rendus, port)
