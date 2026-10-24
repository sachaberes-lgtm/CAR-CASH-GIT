# -*- coding: utf-8 -*-
"""LE SIFFLEUR EN 30 PALIERS (2026-10-15, chantier B du pôle SON ; Léo : « transformer tous les sons en 8 paliers, les déconstruire en
30 paliers qui font évoluer le son — pour tous les niveaux à 8 moteurs »). La méthode d'AURA · 30 PALIERS (qu'il a gardée) :
  · LES 8 MARCHES D'ORIGINE RESTENT, aux moteurs 1, 5, 9, 13, 17, 21, 25 et 29 : à ces moteurs-là, le rendu est le palier de
    siffleur_niveau.py note pour note (les mêmes mains, le même hasard) ;
  · ENTRE DEUX MARCHES, chaque élément du palier suivant entre à SON moteur (QUAND) : à chaque moteur, un pas qu'on entend ;
  · LE DROP RESTE AU 13 : le siffleur arrive de loin (10 : la 1re phrase, 11-12 : de plus en plus près), plein au 13 ;
  · LE 30e (« le dernier sur 2 » dans la version à 8) gagne un cran : les cuivres plus présents, le 2e siffleur sur toutes les notes tenues.
La version à 8 (siffleur_niveau.py, rendus/siffleur/) ne change pas : celle-ci se range À CÔTÉ (rendus/siffleur-30/, p1…p30).
Lancer (le serveur de la page tourne : il range la fiche) : <venv>/python atelier-son/siffleur_30.py [port=9200]
"""
import os, sys, time, json, subprocess, urllib.request
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from boucles import SR, Des, passe_bande                                                    # noqa: E402
from petites_musiques import Partition, finir, orgue, sifflet, verifie                     # noqa: E402
from vapeurs import balai, rhodes_p, ride                                                  # noqa: E402
from lobby_chris import Main, basse_ronde, kick_doux, caisse_douce, hat, shaker, snap, clap_doux   # noqa: E402
from boucles8 import crash                                                                 # noqa: E402
from ciel import cuivres, choeur                                                           # noqa: E402
import paliers_figes as PF                                                                 # noqa: E402
import siffleur_niveau as S8                                                               # noqa: E402

BPM, GRAINE, V, RAC, GRILLE, MEL = S8.BPM, S8.GRAINE, S8.V, S8.RAC, S8.GRILLE, S8.MEL

# QUAND : le moteur où chaque élément entre (les marches d'origine : P1 = 1, P2 = 5, P3 = 9, P4 = 13, P5 = 17, P6 = 21, P7 = 25, P8 = 29)
QUAND = dict(cabine=2, rhodes=3, marche=4, balais=5,                                       # → P2 au 5
             caisse=6, kick1=7, kick7=8, kickPlein=9,                                      # → P3 au 9
             sif1=10, sifLoin=11, sifPres=12, sifPlein=13,                                 # → P4 au 13 : LE DROP
             kick10=14, amene=15, claps=16, shaker=17,                                     # → P5 au 17
             ride=18, choeur=19, org2=20, org2Plein=21,                                    # → P6 au 21
             ton=22, crash=23, cuivres=24, sif2=25,                                        # → P7 au 25 : un ton plus haut au 22
             octaves=26, reponses=27, octPlein=28, roulement=29,                           # → P8 au 29
             grandFinal=30)
PALIERS = [
    "L'orgue seul dans sa cabine qui tourne lentement, la basse tenue, les claquements de doigts.",
    "La cabine s'emballe.", "Le Rhodes paresseux sur le dernier triolet.", "La basse se met à marcher.",
    "Les balais par trois (les doigts se taisent).",
    "La caisse douce sur 2 et 4.", "La grosse caisse sur le 1.", "La grosse caisse sur le dernier triolet.", "La grosse caisse à plein : le groove du SIFFLEUR.",
    "Au loin, la 1re phrase sifflée.", "Le siffleur, toute la mélodie, encore loin.", "Le siffleur s'approche.", "LE SIFFLEUR : la mélodie sifflée, tout près.",
    "La grosse caisse sur les contretemps.", "La basse amène l'accord suivant.", "Les claps sur 2 et 4.", "Le shaker en triolets et le charley : ça décolle.",
    "La ride en 12/8, les balais plus doux.", "Le chœur « ooh » sur les accords.", "Les coups d'orgue sur 2 et 4, au loin.", "L'église : les coups d'orgue à plein.",
    "UN TON PLUS HAUT (fa).", "La cymbale à chaque tour.", "Les cuivres soul sur les changements.", "Un 2e siffleur en harmonie.",
    "La basse double à l'octave, doucement.", "Les cuivres répondent à la mélodie.", "Les octaves de la basse à plein.", "Le roulement de la dernière mesure : le grand final.",
    "Le grand final, plus large : les cuivres devant, le 2e siffleur sur toutes les notes tenues.",
]


def palier30(mo):
    """mo = 1…30 → (Partition, (L, R)) — aux moteurs 1, 5 … 29, exactement siffleur_niveau.palier(k)"""
    q = lambda nom: mo >= QUAND[nom]
    k8 = 1 + (mo - 1) // 4                                                       # la marche d'origine dont on part (pour les gains)
    T = 2 if q('ton') else 0
    P = Partition(BPM, 3, 4, 8, GRAINE)
    H = {nom: Main(GRAINE + 11 * i, 7. if nom != 'bas' else 5., .2 if nom != 'bas' else .25)
         for i, nom in enumerate(('org', 'bas', 'rh', 'bat', 'sif', 'per', 'ch', 'cu', 'sif2'))}
    D = {nom: Des(GRAINE + 101 + i) for i, nom in enumerate(('bat', 'per', 'cu'))}
    rr = np.random.default_rng(GRAINE + 7)
    dc = P.dc; tm = P.pm * dc
    for m, nom in enumerate(GRILLE):
        ch = [x + T for x in V[nom]]; rac = RAC[nom] + T; suiv = RAC[GRILLE[(m + 1) % 8]] + T
        P.note_acc(m, 0, 12, ch + [rac])
        l, r = orgue(ch, tm + .05, 6.0 if q('cabine') else 1.2, .02 if q('cabine') else .25)
        P.pose2('org', P.t(m, 0), l, r, .55 if q('cabine') else .5)
        hb = H['bas']
        if not q('marche'):
            P.pose('basse', hb.t(P.t(m, 0)), basse_ronde(rac, 11 * dc), hb.g(.6), 0)
        else:
            P.pose('basse', hb.t(P.t(m, 0)), basse_ronde(rac, 5 * dc), hb.g(.7), 0)
            qq = rac + 7 if (rac + 7) % 12 in {x % 12 for x in ch} else rac
            P.pose('basse', hb.t(P.t(m, 6)), basse_ronde(qq, 2.5 * dc), hb.g(.5), 0)
            if q('amene'):
                ap = suiv - 1 if (suiv - 1) % 12 != (rac % 12) else suiv + 2
                P.pose('basse', hb.t(P.t(m, 9)), basse_ronde(rac + 12 if q('octaves') else rac, 1.5 * dc), hb.g(.35), 0)
                P.pose('basse', hb.t(P.t(m, 11)), basse_ronde(ap, .9 * dc), hb.g(.42), 0)
            else:
                P.pose('basse', hb.t(P.t(m, 11)), basse_ronde(rac, .9 * dc), hb.g(.35), 0)
            if q('octaves'): P.pose('basse', hb.t(P.t(m, 0)), basse_ronde(rac + 12, 2 * dc), hb.g(.22 if q('octPlein') else .12), .1)
        if q('rhodes'):
            h = H['rh']
            for i in (2, 5, 8, 11):
                if rr.random() < .2: continue
                for j, n in enumerate(ch[1:]): P.pose('rh', h.t(P.t(m, i), 8) + j * .007, rhodes_p(n + 12, 1.5 * dc, h.g(.45)), .13, -.25 + .2 * j)
        hb2, db = H['bat'], D['bat']
        for i in (3, 9):
            if not q('balais'): P.pose('per', hb2.t(P.t(m, i)), snap(db), hb2.g(.45), .2)
        if q('balais'):
            for i in range(12): P.pose('bat', hb2.t(P.t(m, i)), balai(db), hb2.g((.22 if i % 3 == 0 else .1) * (.7 if q('ride') else 1)), .3)
        if q('caisse'):
            for i in (3, 9): P.pose('bat', hb2.t(P.t(m, i)), caisse_douce(db) * .6, hb2.g(.62 if q('shaker') else .5 if q('kick1') else .35), -.05)
        if q('kick1'):
            for i in (0, 7):
                if i == 7 and not q('kick7'): hb2.g(0); continue                 # (la main avance pareil : le hasard des autres coups ne bouge pas)
                P.pose('bat', hb2.t(P.t(m, i)), kick_doux(db), hb2.g((.6 if i == 0 else .35) * (1 if q('kickPlein') else .7)), 0)
        if q('kick10'):
            hp, dp = H['per'], D['per']
            P.pose('bat', hb2.t(P.t(m, 10)), kick_doux(db), hb2.g(.32), 0)
            if q('claps'):
                for i in (3, 9): P.pose('per', hp.t(P.t(m, i)), clap_doux(dp), hp.g(.5), .08)
            if q('shaker'):
                for i in range(12): P.pose('per', hp.t(P.t(m, i)), shaker(dp), hp.g(.11 if i % 3 == 1 else .06), -.35)
                P.pose('per', hp.t(P.t(m, 11)), hat(dp, True), hp.g(.16), .4)
        if q('ride'):
            hp, dp = H['per'], D['per']
            for i in (0, 2, 3, 5, 6, 8, 9, 11): P.pose('per', hp.t(P.t(m, i)), ride(dp), hp.g(.16 if i % 3 == 0 else .09), .45)
        if q('crash') and m == 0: P.pose('per', P.t(m, 0), crash(D['per'], 1.6), .32, .3)
        if q('roulement') and m == 7:
            for j, i in enumerate((9, 10, 11)): P.pose('bat', hb2.t(P.t(m, i)), caisse_douce(db) * .6, .35 + .12 * j, -.05)
        if q('choeur'): P.pose('ch', P.t(m, 0), choeur(ch, tm * .97), .4, 0)
        if q('org2'):
            for i in (3, 9):
                l, r = orgue([x + 12 for x in ch[1:]], 1.4 * dc, 6.0, .005)
                P.pose2('org2', H['org'].t(P.t(m, i)), l, r, H['org'].g(.4 if q('org2Plein') else .22))
        if q('cuivres'):
            hc = H['cu']
            P.pose('cu', hc.t(P.t(m, 0)), cuivres(ch[1:], 2.2 * dc), hc.g(.42), -.15)
            if q('reponses') and m % 2 == 1: P.pose('cu', hc.t(P.t(m, 9)), cuivres([x + 12 for x in ch[1:3]], 1.6 * dc), hc.g(.34), .2)
    if q('sif1'):
        h, h2, prec = H['sif'], H['sif2'], None
        gs = .85 if q('sifPlein') else .62 if q('sifPres') else .45 if q('sifLoin') else .4
        for (b, p, n, l) in MEL:
            n = n + T; t = P.t(b, p); d = l * dc
            if q('sifLoin') or b < 4:                                            # au 10 : la 1re phrase seulement (mesures 1-4)
                P.note_mel(t, n, d); P.pose('sif', h.t(t, 12), sifflet(n + 12, d * .96, prec + 12 if prec else None), h.g(gs), .05)
            else: h.t(t, 12); h.g(gs)
            if q('sif2') and (l >= 3 or (q('grandFinal') and l >= 2)):
                hn = S8.harmonie(n, [x + T for x in V[GRILLE[b]]])
                if hn is not None: P.note_mel(t, hn, d); P.pose('sif2', h2.t(t, 14), sifflet(hn + 12, d * .9), h2.g(.5), -.35)
            prec = n
    gains = dict(org=1., org2=1., basse=.6 if q('amene') else .5 if q('marche') else .55, rh=1., bat=.45, per=.5, sif=1., sif2=1., ch=.5,
                 cu=.6 * (1.3 if q('grandFinal') else 1))
    envois = dict(org=.3, org2=.35, rh=.4, sif=.45, sif2=.5, bat=.15, per=.15, ch=.55, cu=.35)
    return P, finir(P, gains, envois, rev=(2.8, .42), bande=.0018, lp=10000, pre=S8.creuse_boue)


def fige30(id_, fiche, rendus, port):
    """paliers_figes.fige, en 30 marches : la sonie monte d'un quart de palier par moteur (la même pente que la version à 8)"""
    dos = os.path.join(PF.RACINE, 'assets/audio/music/paliers/rendus', id_); os.makedirs(dos, exist_ok=True)
    fichiers = []
    for k, (L, R) in enumerate(rendus):
        vise = PF.CIBLE + PF.PAS * k / 4; l0 = PF.sonie(L, R); g = 10 ** ((vise - l0) / 20)
        for _ in range(3):
            L2, R2 = PF.limite(L * g, R * g); l = PF.sonie(L2, R2)
            if abs(l - vise) < .15: break
            g *= 10 ** ((vise - l) / 20)
        pk = max(np.abs(L2).max(), np.abs(R2).max())
        if pk > .985: L2 *= .985 / pk; R2 *= .985 / pk
        wav = os.path.join(dos, 'p%d.wav' % (k + 1)); m4a = wav[:-4] + '.m4a'; PF.ecrit_wav(wav, L2, R2)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '128000', wav, m4a], check=True); os.remove(wav)
        fichiers.append(os.path.relpath(m4a, PF.RACINE)); print('  M%d  %.1f dB (visé %.1f)' % (k + 1, PF.sonie(L2, R2), vise), flush=True)
    fiche = dict(fiche, id=id_, mesures=8, intro=0, introTxt='', moteurs=[1] * len(rendus), fichiers=fichiers, introF=None,
                 dur=round(len(rendus[0][0]) / SR, 5), fige=time.strftime('%Y-%m-%dT%H:%M'))
    q = urllib.request.Request('http://127.0.0.1:%d/fige-index' % port, data=json.dumps(fiche, ensure_ascii=False).encode(), method='POST')
    urllib.request.urlopen(q).read(); print('fiche ok :', id_)


if __name__ == '__main__':
    port = int(([a for a in sys.argv[1:] if a.isdigit()] or ['9200'])[0])
    rendus = []
    for mo in range(1, 31):
        P, (L, R) = palier30(mo); rendus.append((L, R))
        print('  M%-2d %.2f s  frottements %d  brillance %d Hz' % (mo, len(L) / SR, verifie(P), S8.brillance(L, R)), flush=True)
    if '--essai' in sys.argv:
        np.save(os.environ.get('SORTIE', 'siffleur30.npy'), np.array([np.stack(x) for x in rendus], dtype=np.float32)); sys.exit(0)
    fige30('siffleur-30', {'titre': 'SIFFLEUR · 30 PALIERS', 'style': 'le SIFFLEUR · NIVEAU en 30 moteurs : un élément de plus à chaque moteur, les 8 marches d’origine aux moteurs 1, 5 … 29 (la version à 8 reste à côté)',
                           'bpm': BPM, 'ton': 'mi♭ majeur → fa', 'paliers': PALIERS}, rendus, port)
