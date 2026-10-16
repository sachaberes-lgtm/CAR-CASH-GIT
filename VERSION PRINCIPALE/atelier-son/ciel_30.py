# -*- coding: utf-8 -*-
"""CIEL EN 30 PALIERS (2026-10-15, chantier B du pôle SON ; Léo : « transformer tous les sons en 8 paliers, les déconstruire en 30 paliers
qui font évoluer le son »). La méthode d'AURA · 30 PALIERS et du SIFFLEUR · 30 PALIERS :
  · LES 8 MARCHES D'ORIGINE (paliers_figes.CIEL : un niveau de ciel.py et des pistes coupées) restent aux moteurs 1, 5 … 29 — même graine,
    même main, même hasard : à ces moteurs, le rendu est celui de la version à 8, échantillon pour échantillon ;
  · ENTRE DEUX MARCHES, chaque élément entre à SON moteur, ou monte d'un cran (sa piste à −7 dB, puis −3, puis pleine) : un pas à chaque moteur ;
  · le compositeur est celui de ciel.py, ses tests de NIVEAU (`nv >= 3`…) remplacés par un drapeau par élément (F) — même ordre des appels.
La version à 8 (rendus/ciel/) ne change pas : celle-ci se range À CÔTÉ (rendus/ciel-30/, p1…p30).
Lancer (le serveur de la page tourne : il range la fiche) : <venv>/python atelier-son/ciel_30.py [port=9200]   (--essai : rien n'est rangé)
"""
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ciel as C                                                                           # noqa: E402
from boucles import SR, sinus, hz, env, echo, filtre                                       # noqa: E402
from boucles8 import chorus, fx_rev, rim, shaker, crash, pompe_bus                         # noqa: E402
from vapeurs import bande, rhodes_p, cordes, tremolo_stereo                                # noqa: E402
import paliers_figes as PF                                                                 # noqa: E402
from siffleur_30 import fige30                                                             # noqa: E402


def ancre(nv, coupe=()):
    """les drapeaux d'un niveau de ciel.py (une marche d'origine)"""
    return dict(nv=nv, nappe=nv, sub=nv <= 2, rh=nv >= 2, rhSync=nv >= 3, rim=2 if nv == 2 else 0, shaker=nv == 2, kick=nv >= 3, kickG=1.08 if nv == 5 else .95,
                kick5=nv == 5, clap=nv >= 3, hh=nv >= 3, hh16=nv >= 4, hh5=nv == 5, relance=nv in (3, 4), basse=nv >= 3, lead=nv == 4, lead5=nv == 5, ton5=nv == 5,
                snaps=nv == 5, rhc=nv == 5, verre=nv == 5, poids=nv == 5, hhOuv=nv == 5, crash=nv == 5, cordes=nv == 5, fin5=nv == 5, coupe=set(coupe), gm={})


def drapeaux(mo):
    """moteur 1…30 → les drapeaux (les marches : 1 = P1, 5 = P2 … 29 = P8 — paliers_figes.CIEL)"""
    a = lambda nv, coupe=(), **k: dict(ancre(nv, coupe), **k)
    E = {
        1: a(1),
        2: a(1, nappe=2),                                                          # la nappe s'ouvre
        3: a(2, ['bat'], gm={'rh': .45}),                                          # le Rhodes arrive, de loin
        4: a(2, ['bat'], gm={'rh': .7}),
        5: a(2, ['bat']),                                                          # P2 : le Rhodes pose les accords
        6: a(2, rim=0, gm={'bat': .55}),                                           # le shaker, doucement
        7: a(2, rim=0),                                                            # le shaker à plein
        8: a(2, rim=1),                                                            # le rim sur le 2
        9: a(2),                                                                   # P3 : le rim sur 2 et 4
        10: a(3, ['basse', 'sn'], sub=True, rim=2, shaker=True, kick=False, hh=False),   # le Rhodes se met à syncoper, la nappe s'ouvre encore
        11: a(3, ['basse', 'sn'], sub=True, rim=2, shaker=True, hh=False),         # LA GROSSE CAISSE tombe
        12: a(3, ['basse', 'sn'], sub=True),                                       # les charleys remplacent le rim et le shaker
        13: a(3, ['basse', 'sn']),                                                 # P4 : la sous-basse tenue s'efface, le beat moderne
        14: a(3, ['basse'], gm={'sn': .5}),                                        # le clap sur 2 et 4, en retrait
        15: a(3, gm={'basse': .45}),                                               # la basse funky façon ARP, de loin ; le clap à plein
        16: a(3, gm={'basse': .7}),
        17: a(3),                                                                  # P5 : le beat complet
        18: a(4, nappe=3, lead=False),                                             # les charleys en doubles croches
        19: a(4, lead=False),                                                      # la nappe s'ouvre
        20: a(4, gm={'lead': .5}),                                                 # la mélodie au synthé mono, de loin
        21: a(4),                                                                  # P6 : la mélodie
        22: a(4, ton5=True, nappe=5, kickG=1.08),                                   # UN TON PLUS HAUT (fa), le beat qui pousse
        23: a(5, ['verre', 'cordes'], snaps=False, rhc=False, hhOuv=False, poids=False, crash=False, kick5=False, hh5=False),   # le lead profond, improvisé
        24: a(5, ['verre', 'cordes'], poids=False, crash=False, kick5=False, hh5=False),   # les claquements de doigts, le Rhodes qui répond, les charleys ouverts
        25: a(5, ['verre', 'cordes']),                                             # P7 : la grosse caisse double, la cymbale, le poids sous la basse
        26: a(5, ['verre'], gm={'cordes': .45}),                                   # les cordes amples, de loin
        27: a(5, ['verre']),                                                       # les cordes à plein
        28: a(5, gm={'verre': .5}),                                                # l'arpège de verre, de loin
        29: a(5),                                                                  # P8 : le grand écran
        30: a(5, gm={'verre': 1.25, 'cordes': 1.2, 'lead5': 1.12}),                 # un cran de plus : l'arpège, les cordes et le lead devant
    }
    return E[mo]


PALIERS = ["La nappe vapeur seule, filtrée, et la sous-basse tenue.", "La nappe s'ouvre.", "Le Rhodes arrive, de loin.", "Le Rhodes s'approche.",
           "Le Rhodes pose les accords.", "Le shaker, doucement.", "Le shaker à plein.", "Le rim sur le 2.", "Le rim sur 2 et 4.",
           "Le Rhodes se met à syncoper, la nappe s'ouvre encore.", "La grosse caisse moderne tombe.", "Les charleys remplacent le rim et le shaker.",
           "La sous-basse tenue s'efface : le beat moderne.", "Le clap sur 2 et 4, en retrait.", "La basse funky façon ARP, de loin ; le clap à plein.",
           "La basse s'approche.", "Le beat complet.", "Les charleys en doubles croches.", "La nappe s'ouvre encore.", "La mélodie au synthé mono, de loin.",
           "La mélodie, les notes qui glissent.", "UN TON PLUS HAUT, la grosse caisse qui pousse.", "Le lead profond, improvisé, à la place de la mélodie.",
           "Les claquements de doigts, le Rhodes qui répond, les charleys ouverts.", "La grosse caisse double, la cymbale, le poids sous la basse.",
           "Les cordes amples, de loin.", "Les cordes à plein.", "L'arpège de verre, de loin.", "Le grand écran : l'arpège de verre à plein.",
           "Un cran de plus : l'arpège, les cordes et le lead devant."]


def composer30(M, F, de, h):
    """= ciel.composer, une boucle d'UN niveau (ni transition ni demi-mesure de silence), ses tests de niveau remplacés par F"""
    sw = .2; nb = M.mes
    pd = M.piste('nappe'); sb = M.piste('sub'); rh = M.piste('rh'); b = M.piste('basse'); ld = M.piste('lead')
    bat = M.piste('bat'); sn = M.piste('sn'); pc = M.piste('perc'); ca = M.piste('rhc')
    prec = None; C.KICKS.clear(); KICKS = C.KICKS
    for m in range(nb):
        tr = C.TON5 if F['ton5'] else 0; q = [n + tr for n in C.ACC[m % 4]]; r = C.RAC[m % 4] + tr
        l9, r9 = C.nappe(q, M.temps * 4, [900, 1300, 1700, 2100, 2500][F['nappe'] - 1], de)
        pd.pose2(M.t(m), l9, r9, [.16, .13, .11, .1, .09][F['nappe'] - 1])
        if F['sub']:
            nn = int(M.temps * 3.8 * SR); sb.pose(M.t(m), sinus(hz(r - 12), nn) * env(nn, .2, 9, 1, .3, M.temps * 3.4), .16)
        if F['rh']:
            pas = ((0, 7), (10, 5)) if F['rhSync'] else ((0, 12),)
            for p, lg in pas:
                v = .55 + .3 * h.r.random()
                for k, n in enumerate(q[1:]): rh.pose(h.t(M.t(m, p, sw)) + k * .009, rhodes_p(n + 12, lg * M.dc, v), h.g(.07), -.25 + .12 * k)
        if F['rim'] or F['shaker']:
            for p in (4, 12):
                if F['rim'] == 2 or (F['rim'] == 1 and p == 4): bat.pose(h.t(M.t(m, p, sw)), rim(de), h.g(.25), .15)
            if F['shaker']:
                for p in range(0, 16, 2): bat.pose(h.t(M.t(m, p, sw)), shaker(de), h.g(.12 if p % 4 else .18), -.4)
        sd = .06
        if F['kick']:
            for p in ((0, 7, 10) if m % 2 == 0 else (0, 3, 10)):
                bat.pose(h.t(M.t(m, p, sd)), C.kick_moderne(de), h.g(F['kickG'])); KICKS.append(M.t(m, p, sd))
            if F['kick5']:
                if m % 2 == 1: bat.pose(h.t(M.t(m, 14, sd)), C.kick_moderne(de), h.g(.7)); KICKS.append(M.t(m, 14, sd))
                sn.pose(h.t(M.t(m, 15, sd)), C.clap_moderne(de), h.g(.16), .2)
        if F['clap']:
            for p in (4, 12): sn.pose(h.t(M.t(m, p, sd)), C.clap_moderne(de), h.g(.62))
        if F['hh']:
            hh = M.piste('hh')
            for p in range(0, 16, 1 if F['hh16'] else 2):
                if F['hh5'] and m % 2 == 1 and p == 14:
                    for j in range(3): hh.pose(M.t(m, 14, sd) + j * M.dc * 2 / 3, C.hat_moderne(de), .1 + .03 * j, .3)
                    continue
                if F['hh5'] and m % 2 == 1 and p == 15: continue
                hh.pose(h.t(M.t(m, p, sd)), C.hat_moderne(de, F['hh5'] and p == 6), h.g(.16 if p % 4 == 0 else (.11 if p % 2 == 0 else .07)), .3)
        if F['relance'] and F['clap'] and m % 8 == 7:
            for k, p in enumerate((13, 14, 15)): sn.pose(M.t(m, p, sd), C.clap_moderne(de), .22 + .1 * k)
        if F['basse']:
            for p, o, lg in ((0, 0, 3), (3, 12, 1), (6, 7, 2), (8, 0, 3), (11, 0, 1), (12, 10, 2), (14, 7, 2)):
                b.pose(h.t(M.t(m, p, sw)), C.basse_arp(r - 12 + o, lg * M.dc * .9), h.g(.5))
        if F['lead5']:
            for p, n, lg, v in C.MEL5[m % 8]:
                n = n + tr + C.LEAD5_OCT; M.piste('lead5').pose(h.t(M.t(m, p, .06)), C.lead5(n, prec, lg * M.dc * .92, v), h.g(.44 * v)); prec = n
        if F['lead']:
            for p, n, lg in C.MEL[m % 8]:
                n = n + tr; ld.pose(h.t(M.t(m, p, sw)), C.mono(n, prec, lg * M.dc * .95), h.g(.36)); prec = n
        if F['snaps']:
            for p in (6, 14): pc.pose(h.t(M.t(m, p, .06)), C.snap(de), h.g(.3), -.35)
        if F['rhc']:
            for p, n, lg in C.MEL[m % 8][1:2]: ca.pose(h.t(M.t(m, p + 2, sw)), rhodes_p(n + tr - 5, 1., .8), .07, -.3)
        if F['verre']:
            notes9 = sorted(q)
            for i in range(16):
                n9 = notes9[[0, 2, 4, 3, 1, 3, 4, 2, 0, 1, 3, 4, 2, 4, 3, 1][i]] + 12
                M.piste('verre').pose(h.t(M.t(m, i, .06)), C.fm(n9, .5, 4, 1.3, .04, .2), h.g(.08 if i % 4 == 0 else .058), .8 if i % 2 else -.8)
        if F['poids']:
            nn9 = int(M.temps * 3.6 * SR); sb.pose(M.t(m), sinus(hz(r - 24), nn9) * env(nn9, .05, 9, 1, .25, M.temps * 3.4), .12)
        if F['hhOuv']:
            hh = M.piste('hh')
            for p in (2, 6, 10, 14):
                if not (p == 14 and m % 2 == 1): hh.pose(h.t(M.t(m, p, .06)), C.hat_moderne(de, True), h.g(.045), -.3)
        if F['crash'] and m % 4 == 0: M.piste('trans').pose(M.t(m), filtre(crash(de, 2.2), 'low', 10000), .09, -.3)
    cordes(M, de, [[n + C.TON5 for n in a] for a in C.ACC], list(range(nb)) if F['cordes'] else [], .075, 2300)
    fin5 = F['fin5']
    if KICKS: pompe_bus(M, ('nappe', 'rh', 'basse', 'cordes') if fin5 else ('nappe', 'rh', 'basse'), KICKS, .4 if fin5 else .28, .14 if fin5 else .16)
    if 'lead5' in M.bus:
        l5 = M.bus['lead5']; eL, eR = echo(l5.L, l5.R, M.temps * .75, .3); l5.L += eL * .22; l5.R += eR * .3
    for b9 in ('lead', 'lead5', 'cordes_m', 'cuivres'):
        k9 = .75 if b9 == 'lead5' else .45
        if b9 in M.bus: M.bus[b9].L = M.bus[b9].L + k9 * filtre(M.bus[b9].L, 'high', 2200); M.bus[b9].R = M.bus[b9].R + k9 * filtre(M.bus[b9].R, 'high', 2200)
    tremolo_stereo(M, 'rh', 4.2, .2)
    M.bus['nappe'].L, M.bus['nappe'].R = chorus(M.bus['nappe'].L, M.bus['nappe'].R)
    bande(M, ('nappe', 'rh', 'cordes', 'rhc', 'trans', 'choeur'))
    eL, eR = echo(ld.L, ld.R, M.temps * .75, .3); ld.L += eL * .3; ld.R += eR * .3
    if 'verre' in M.bus:
        vb = M.bus['verre']; eL, eR = echo(vb.L, vb.R, M.temps * .75, .35); vb.L += eR * .35; vb.R += eL * .35
    fx_rev(M, [('nappe', 1), ('rh', .7), ('lead', .45), ('cordes', 1), ('rhc', 1), ('trans', 1), ('cuivres', .6), ('choeur', 1), ('cordes_m', 1), ('cloche', .6), ('verre', .45), ('lead5', .35), ('sn', .35), ('bat', .1)], 3., .4, 4800)
    g = {'nappe': 1, 'sub': 1, 'rh': 1, 'basse': 1, 'lead': 1, 'bat': .9, 'sn': .9, 'hh': .85, 'perc': 1, 'rhc': 1, 'cordes': 1, 'trans': 1, 'cuivres': 1, 'choeur': 1, 'cordes_m': 1, 'cloche': 1, 'verre': 1, 'lead5': 1, 'fx': 1}
    g = {p: (0 if p in F['coupe'] else v * F['gm'].get(p, 1)) for p, v in g.items()}   # (= paliers_figes.ciel_rendus : les pistes coupées à zéro)
    return C.fin(M, g, maitre_lp=12000)


def palier30(mo):
    F = drapeaux(mo); M = C.Morceau(C.BPM, mesures=8, graine=710 + F['nv']); h = C.Main(710 + F['nv'], 4)
    return composer30(M, F, M.de, h)


if __name__ == '__main__':
    port = int(([a for a in sys.argv[1:] if a.isdigit()] or ['9200'])[0])
    rendus = []
    for mo in range(1, 31):
        rendus.append(palier30(mo)); print('  M%-2d %.2f s' % (mo, len(rendus[-1][0]) / SR), flush=True)
    if '--essai' in sys.argv:
        np.save(os.environ.get('SORTIE', 'ciel30.npy'), np.array([np.stack(x) for x in rendus], dtype=np.float32)); sys.exit(0)
    fige30('ciel-30', {'titre': 'CIEL · 30 PALIERS', 'style': 'le CIEL à paliers en 30 moteurs : un élément de plus (ou un cran) à chaque moteur, les 8 marches d’origine aux moteurs 1, 5 … 29 (la version à 8 reste à côté)',
                       'bpm': C.BPM, 'ton': 'mi♭ majeur → fa', 'paliers': PALIERS}, rendus, port)
