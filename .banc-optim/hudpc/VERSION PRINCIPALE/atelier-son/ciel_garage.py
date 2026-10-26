# -*- coding: utf-8 -*-
"""LA MUSIQUE DU CIEL ET DU GARAGE (2026-10-14, Léo : « le son de la boutique, c'est incroyable ; le ciel et le garage devraient aussi avoir
une musique légère — prends l'inspi des Lobby Chris, les instruments, les différentes inspi — mais calme ; musique du ciel très discrète, et le
garage aussi, différentes ambiances puisqu'on est dans le garage ; plusieurs, un peu différentes, même registre ; les propositions direct
sur le main, et aussi dans la librairie »).
Le MOTEUR des Lobby Chris (lobby_chris.py : compose / mixe — le piano feutré, la nappe, la main humaine, la mélodie qui se décale et s'orne,
la réponse dans les creux, la boucle sans couture) avec SIX nouvelles fiches : grilles et mélodies neuves, rien de repris des six Chris.
Plus calmes qu'eux : le CIEL sans batterie (au plus un battement de cœur), le GARAGE avec un groove d'atelier qui ne monte jamais au plein.
  CIEL   · NUAGES LENTS    — piano feutré, nappe chaude, le vibraphone répond          ré lydien     60
         · HAUTE ALTITUDE  — vibraphone qui chante, cordes, piano qui roule             si♭ majeur    66
         · APESANTEUR      — Rhodes, célesta qui scintille, un battement de cœur        fa lydien     56
  GARAGE · ATELIER         — piano et Rhodes en contretemps, balais, bois, shaker       sol majeur    84
         · HUILE DE MINUIT — lo-fi : Rhodes, vibraphone, beat feutré, vinyle            la mineur     76
         · CLÉ DE 12       — bossa lente : guitare nylon, vibraphone, contrebasse       la majeur     92
Le GARAGE prend le léger filtre d'atelier des lobbys du main (lobby_main.garage : on l'entend par l'enceinte de l'atelier) ; le CIEL non.
Tout part en boucle AAC sans couture (boucle_aac) dans assets/audio/music/lobby/ (ciel-*.m4a, garage-*.m4a) + menu-donnees.js
(window.MENU_MUS) pour la bibliothèque (onglet « Ciel et garage »).
  <venv>/python atelier-son/ciel_garage.py [id…]
"""
import os, sys, json, time
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lobby_chris as C, boucle_aac                                     # noqa: E402
from boucles import SR, filtre, reverbe, Des                             # noqa: E402

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, 'assets', 'audio', 'music', 'lobby')
TOUT = lambda i: {k: i for k in ('intro', 'A1', 'A2', 'B', 'pause', 'A3', 'retour')}
FORME = [('intro', 'A', 4, 4, 0, 0), ('A1', 'A', 0, 8, 1, 0), ('A2', 'A', 0, 8, 2, 0), ('B', 'B', 0, 8, 3, 0), ('pause', 'B', 4, 4, -1, 0),
         ('A3', 'A', 0, 8, 3, 0), ('retour', 'R', 0, 2, -1, 0)]
FORME_TON = FORME[:5] + [('A3', 'A', 0, 8, 3, 2), ('retour', 'R', 0, 2, -1, 0)]   # le dernier passage un ton plus haut (le geste des Chris)
CIEL_COMMUN = dict(swing=0., rh=False, basse_son='sub', approche=False, kicks={}, kit_intro={}, fills=(), crash=False, souffle=False,
                   **{'break': False}, rev=5.0, rev_g=.55, basse={1: [(0, 0, 16)], 2: [(0, 0, 16)], 3: [(0, 0, 10), (10, 7, 6)], -1: [(0, 0, 14)]})

FICHES = [
    # ------------------------------------------------------------------------------------------------ LE CIEL
    dict(id='ciel-nuages', lieu='ciel', titre='NUAGES LENTS', bpm=60, graine=6101, cle='ré majeur (lydien)', ton=-2, gamme=[2, 4, 6, 8, 9, 11, 1],
         style='Ciel · piano feutré, nappe chaude, le vibraphone répond',
         idee="Le piano feutré roule ses accords sous une nappe chaude ; la mélodie se pose, longue ; le vibraphone répond dans les creux. Une touche lydienne (le sol dièse) : le ciel qui s'ouvre.",
         A=[[50, 57, 61, 64, 66], [50, 56, 59, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 59, 62],
            [50, 57, 61, 64, 66], [42, 49, 52, 57, 61], [43, 50, 54, 57, 59], [(0, [45, 52, 57, 59, 62]), (8, [45, 52, 55, 57, 61])]],
         B=[[43, 50, 54, 59, 62], [45, 52, 54, 57, 61], [42, 49, 52, 57, 61], [47, 54, 57, 62, 66],
            [40, 50, 54, 55, 59], [45, 52, 55, 57, 62], [42, 50, 54, 57, 61], [(0, [43, 50, 54, 57, 59]), (8, [45, 52, 55, 57, 61])]],
         R=[[43, 50, 54, 59, 62], [(0, [45, 52, 57, 59, 62]), (8, [45, 52, 55, 57, 61])]],
         melA=[(0, 0, 69, 8), (0, 8, 66, 8), (1, 0, 68, 12), (1, 12, 71, 4), (2, 0, 73, 8), (2, 8, 69, 8), (3, 0, 71, 12), (3, 12, 66, 4),
               (4, 0, 69, 6), (4, 6, 71, 2), (4, 8, 74, 8), (5, 0, 73, 12), (5, 12, 69, 4), (6, 0, 71, 8), (6, 8, 66, 4), (6, 12, 69, 4),
               (7, 0, 69, 8), (7, 8, 67, 8)],
         melB=[(0, 0, 74, 8), (0, 8, 71, 8), (1, 0, 73, 12), (1, 12, 69, 4), (2, 0, 69, 8), (2, 8, 73, 8), (3, 0, 74, 16),
               (4, 0, 71, 8), (4, 8, 67, 8), (5, 0, 69, 8), (5, 8, 74, 8), (6, 0, 73, 8), (6, 8, 69, 8), (7, 0, 71, 8), (7, 8, 69, 8)],
         melR=[(0, 0, 71, 8), (0, 8, 74, 8), (1, 0, 71, 8), (1, 8, 73, 8)],
         comp='piano', comp_mix={'roule': .7, 'pousse': .3}, pad={'g': 1.15, 'fc': 1100, 'att': 1.6, 'rel': 2.4},
         voix=TOUT('piano'), double={}, rep='vibra', rep_sec=('A2', 'B', 'A3'), rep_p=.55, contre=(),
         kit={}, kit_fin={}, entrees=('A3',), forme=FORME, mix={'pad': .7}, **CIEL_COMMUN),

    dict(id='ciel-altitude', lieu='ciel', titre='HAUTE ALTITUDE', bpm=66, graine=6202, cle='si♭ majeur', ton=-6, gamme=[10, 0, 2, 3, 5, 7, 9],
         style='Ciel · le vibraphone chante, les cordes gonflent, le piano roule',
         idee="Le vibraphone chante la mélodie, le piano roule doucement dessous, des cordes gonflent à la 2e partie ; le dernier passage monte d'un ton, comme une éclaircie.",
         A=[[46, 53, 57, 60, 62], [43, 50, 53, 57, 58], [39, 50, 55, 58, 62], [41, 50, 53, 57, 60],
            [46, 53, 57, 60, 62], [38, 48, 53, 57, 60], [39, 50, 53, 55, 58], [(0, [41, 48, 53, 55, 58]), (8, [41, 51, 53, 57, 60])]],
         B=[[43, 50, 53, 58, 62], [39, 50, 55, 58, 62], [36, 46, 51, 55, 62], [41, 48, 53, 57, 60],
            [38, 48, 53, 57, 60], [43, 50, 53, 57, 58], [39, 50, 55, 58, 62], [(0, [41, 48, 53, 55, 58]), (8, [41, 51, 53, 57, 60])]],
         R=[[39, 50, 55, 58, 62], [(0, [41, 48, 53, 55, 58]), (8, [41, 51, 53, 57, 60])]],
         melA=[(0, 0, 65, 8), (0, 8, 69, 8), (1, 0, 70, 12), (1, 12, 67, 4), (2, 0, 67, 8), (2, 8, 70, 8), (3, 0, 69, 12), (3, 12, 65, 4),
               (4, 0, 72, 8), (4, 8, 69, 8), (5, 0, 69, 8), (5, 8, 65, 8), (6, 0, 67, 8), (6, 8, 70, 4), (6, 12, 74, 4),
               (7, 0, 72, 8), (7, 8, 69, 8)],
         melB=[(0, 0, 74, 8), (0, 8, 70, 8), (1, 0, 67, 12), (1, 12, 70, 4), (2, 0, 70, 8), (2, 8, 67, 8), (3, 0, 69, 16),
               (4, 0, 72, 8), (4, 8, 69, 8), (5, 0, 70, 8), (5, 8, 74, 8), (6, 0, 74, 8), (6, 8, 70, 8), (7, 0, 67, 8), (7, 8, 69, 8)],
         melR=[(0, 0, 70, 8), (0, 8, 67, 8), (1, 0, 65, 8), (1, 8, 69, 8)],
         comp='piano', comp_mix={'roule': .8, 'pousse': .2}, g_comp=.8, pad={'g': 1.0, 'fc': 1250, 'att': 1.8, 'rel': 2.6},
         cordes_sec=('B', 'A3'), voix=dict(TOUT('vibra'), pause='piano'), double={'A3': ('piano', -12, .35)},
         rep='piano', rep_sec=('A2', 'B'), rep_p=.45, contre=(), kit={}, kit_fin={}, entrees=('A3',), forme=FORME_TON, mix={'pad': .7, 'vibra': 1.25},
         **CIEL_COMMUN),

    dict(id='ciel-apesanteur', lieu='ciel', titre='APESANTEUR', bpm=56, graine=6303, cle='fa majeur (lydien)', ton=1, gamme=[5, 7, 9, 11, 0, 2, 4],
         style='Ciel · Rhodes, célesta qui scintille, un battement de cœur',
         idee="Le Rhodes tient ses accords et chante la mélodie, très lentement ; le célesta scintille au dernier passage ; au sommet, rien qu'un battement de cœur lointain. La touche lydienne (le si naturel) : on flotte.",
         A=[[41, 52, 55, 57, 60], [41, 50, 55, 59, 62], [40, 50, 55, 59, 62], [45, 52, 55, 60, 64],
            [41, 52, 55, 57, 60], [38, 48, 53, 57, 64], [41, 50, 55, 59, 62], [(0, [36, 48, 52, 55, 59]), (8, [36, 47, 52, 55, 57])]],
         B=[[38, 48, 53, 57, 60], [43, 50, 55, 59, 62], [40, 50, 55, 59, 62], [45, 52, 55, 59, 60],
            [41, 52, 55, 57, 60], [40, 50, 55, 59, 62], [38, 48, 53, 57, 64], [(0, [43, 50, 55, 59, 62]), (8, [36, 47, 52, 55, 57])]],
         R=[[38, 48, 53, 57, 64], [(0, [43, 50, 55, 59, 62]), (8, [36, 47, 52, 55, 57])]],
         melA=[(0, 0, 67, 8), (0, 8, 64, 8), (1, 0, 71, 12), (1, 12, 67, 4), (2, 0, 67, 8), (2, 8, 71, 8), (3, 0, 72, 12), (3, 12, 69, 4),
               (4, 0, 69, 8), (4, 8, 72, 8), (5, 0, 74, 8), (5, 8, 69, 8), (6, 0, 71, 8), (6, 8, 67, 8), (7, 0, 64, 8), (7, 8, 67, 8)],
         melB=[(0, 0, 69, 8), (0, 8, 72, 8), (1, 0, 74, 12), (1, 12, 71, 4), (2, 0, 71, 8), (2, 8, 67, 8), (3, 0, 72, 16),
               (4, 0, 69, 8), (4, 8, 67, 8), (5, 0, 67, 8), (5, 8, 64, 8), (6, 0, 65, 8), (6, 8, 69, 8), (7, 0, 67, 8), (7, 8, 64, 8)],
         melR=[(0, 0, 69, 8), (0, 8, 65, 8), (1, 0, 67, 8), (1, 8, 64, 8)],
         comp='rhodes', pad={'g': 1.25, 'fc': 1000, 'att': 2.0, 'rel': 2.8}, voix=TOUT('rhodes'), double={},
         rep='celesta', rep_sec=('B',), rep_p=.4, contre=('A3',), contre_inst='celesta', contre_pat=(3, 11),
         kit={3: {'pouls': 'x.......x.......'}}, kit_fin={'pouls': 'x...............'}, g_pouls=.55, entrees=(), forme=FORME,
         mix={'pad': .75, 'rh': 1.15, 'celesta': .8}, **CIEL_COMMUN),

    # ------------------------------------------------------------------------------------------------ LE GARAGE
    dict(id='garage-atelier', lieu='garage', titre='ATELIER', bpm=84, swing=.1, graine=6404, cle='sol majeur', ton=3, gamme=[7, 9, 11, 0, 2, 4, 6],
         style="Garage · piano feutré, Rhodes en contretemps, balais, bois et shaker",
         idee="Le piano feutré, la basse ronde ; le bois et le shaker entrent, puis les balais et un kick lointain — le groove d'un atelier où l'on bricole, qui ne monte jamais au plein ; le vibraphone prend la 2e partie.",
         A=[[43, 50, 54, 57, 59], [40, 50, 54, 55, 59], [36, 47, 52, 55, 59], [38, 50, 54, 57, 59],
            [43, 50, 54, 57, 59], [47, 54, 57, 62, 66], [36, 47, 50, 52, 55], [(0, [38, 50, 55, 57, 60]), (8, [38, 48, 54, 57, 60])]],
         B=[[36, 47, 52, 55, 59], [47, 54, 57, 62, 66], [45, 52, 55, 59, 60], [38, 50, 54, 57, 62],
            [40, 50, 55, 59, 62], [36, 47, 52, 55, 59], [45, 52, 55, 60, 64], [(0, [38, 50, 55, 57, 60]), (8, [38, 48, 54, 57, 60])]],
         R=[[36, 47, 52, 55, 59], [(0, [38, 50, 55, 57, 60]), (8, [38, 48, 54, 57, 60])]],
         melA=[(0, 0, 71, 6), (0, 6, 69, 2), (0, 8, 66, 4), (0, 12, 67, 4), (1, 0, 66, 8), (1, 8, 67, 4), (1, 12, 71, 4),
               (2, 0, 72, 6), (2, 6, 71, 2), (2, 8, 67, 8), (3, 0, 69, 12), (3, 12, 66, 4),
               (4, 0, 71, 6), (4, 6, 74, 2), (4, 8, 74, 4), (4, 12, 71, 4), (5, 0, 69, 8), (5, 8, 66, 8),
               (6, 0, 67, 6), (6, 6, 64, 2), (6, 8, 62, 4), (6, 12, 64, 4), (7, 0, 67, 8), (7, 8, 66, 8)],
         melB=[(0, 0, 76, 8), (0, 8, 74, 4), (0, 12, 71, 4), (1, 0, 74, 12), (1, 12, 69, 4), (2, 0, 72, 8), (2, 8, 71, 8), (3, 0, 69, 16),
               (4, 0, 71, 8), (4, 8, 67, 8), (5, 0, 67, 6), (5, 6, 69, 2), (5, 8, 71, 8), (6, 0, 72, 8), (6, 8, 69, 8), (7, 0, 67, 8), (7, 8, 66, 8)],
         melR=[(0, 0, 71, 8), (0, 8, 67, 8), (1, 0, 69, 8), (1, 8, 66, 8)],
         comp='piano', comp_mix={'roule': .45, 'roule+': .35, 'pousse': .2}, rh=True, rh_niv=2, rh_pat='..x.....x.x.....', g_rhc=.75,
         pad={'g': .6, 'fc': 1200}, basse_son='ronde', approche=True,
         basse={1: [(0, 0, 6), (8, 7, 6)], 2: [(0, 0, 6), (7, 0, 1), (8, 7, 4), (14, 12, 2)], 3: [(0, 0, 6), (7, 0, 1), (8, 7, 4), (14, 12, 2)], -1: [(0, 0, 14)]},
         voix=dict(TOUT('piano'), B='vibra'), double={}, rep='celesta', rep_sec=('A2', 'A3'), rep_p=.45, contre=('A3',),
         kit={1: {'bois': '........x.......', 'shaker': 'o.o.o.o.o.o.o.o.'},
              2: {'kick': 'x.......x.......', 'balai': '....x.......x...', 'shaker': 'o.o.o.o.o.o.o.o.', 'bois': '..........x.....'},
              3: {'kick': 'x.......x.x.....', 'balai': 'o.o.x.o.o.o.x.o.', 'shaker': 'o.o.o.o.o.o.o.o.', 'conga': '......x.......x.'},
              -1: {'shaker': 'o...o...o...o...'}},
         kit_intro={'shaker': 'o.o.o.o.o.o.o.o.'}, kicks={}, fills=('conga', 'stop'), crash=False, souffle=False, **{'break': False},
         entrees=('A3',), forme=FORME, rev=3.4, mix={'pad': .5}),

    dict(id='garage-huile', lieu='garage', titre='HUILE DE MINUIT', bpm=76, swing=.2, graine=6505, cle='la mineur', ton=-4, gamme=[9, 11, 0, 2, 4, 5, 7],
         style='Garage · lo-fi : Rhodes, vibraphone, beat feutré, vinyle',
         idee="Le Rhodes tient ses accords, le vinyle crépite ; le vibraphone chante, le beat poussiéreux arrive tout doucement (grosse caisse feutrée, rim, charley lo-fi), en retard sur le temps ; le piano répond dans les creux.",
         A=[[45, 52, 55, 59, 60], [41, 52, 55, 57, 60], [38, 48, 53, 57, 64], [40, 50, 55, 59, 62],
            [45, 52, 55, 59, 60], [36, 47, 52, 55, 59], [41, 52, 55, 57, 60], [(0, [40, 50, 55, 59, 62]), (8, [40, 50, 56, 59, 62])]],
         B=[[41, 52, 55, 57, 60], [43, 50, 52, 55, 59], [40, 50, 55, 59, 62], [45, 52, 55, 59, 60],
            [38, 48, 53, 57, 64], [43, 50, 52, 55, 59], [36, 47, 52, 55, 59], [(0, [40, 50, 55, 59, 62]), (8, [40, 50, 56, 59, 62])]],
         R=[[41, 52, 55, 57, 60], [(0, [40, 50, 55, 59, 62]), (8, [40, 50, 56, 59, 62])]],
         melA=[(0, 0, 64, 8), (0, 8, 67, 4), (0, 12, 71, 4), (1, 0, 69, 12), (1, 12, 67, 4), (2, 0, 65, 8), (2, 8, 69, 8), (3, 0, 67, 12), (3, 12, 62, 4),
               (4, 0, 64, 8), (4, 8, 72, 8), (5, 0, 71, 8), (5, 8, 67, 8), (6, 0, 69, 8), (6, 8, 64, 4), (6, 12, 65, 4), (7, 0, 67, 8), (7, 8, 68, 8)],
         melB=[(0, 0, 72, 8), (0, 8, 69, 8), (1, 0, 71, 12), (1, 12, 67, 4), (2, 0, 67, 8), (2, 8, 71, 8), (3, 0, 72, 16),
               (4, 0, 69, 8), (4, 8, 65, 8), (5, 0, 67, 8), (5, 8, 64, 8), (6, 0, 64, 8), (6, 8, 67, 8), (7, 0, 71, 8), (7, 8, 68, 8)],
         melR=[(0, 0, 69, 8), (0, 8, 72, 8), (1, 0, 71, 8), (1, 8, 68, 8)],
         comp='rhodes', rh=False, pad={'g': .55, 'fc': 850}, basse_son='sub', approche=False,
         basse={2: [(0, 0, 7), (10, 7, 4)], 3: [(0, 0, 6), (7, 0, 2), (10, 7, 3), (14, 12, 2)], -1: [(0, 0, 14)]},
         voix=dict(TOUT('vibra'), intro='rhodes', pause='rhodes'), double={}, rep='piano', rep_sec=('B', 'A3'), rep_p=.5, contre=(),
         kit={2: {'kick_lofi': 'x.........x.....', 'hat_lofi': 'x.x.x.x.x.x.x.x.', 'rim': '....x.......x...'},
              3: {'kick_lofi': 'x......x..x.....', 'hat_lofi': 'x.xox.xox.xox.xo', 'rim': '....x.......x...', 'shaker': 'o.o.o.o.o.o.o.o.'},
              -1: {'hat_lofi': 'x...x...x...x...'}},
         kit_intro={'hat_lofi': 'x...x...x...x...'}, kick_inst='kick_lofi', kicks={}, fills=('lofi', 'stop'), crash=False, souffle=False,
         **{'break': False}, caisse_brk=None, vinyle=True, vinyle_g=1.1, bat_lp=6000, maitre_lp=8500, bande=.0026, pompe=.18,
         entrees=(), forme=FORME, rev=3.6, mix={'pad': .6, 'rh': .95, 'vibra': 1.2, 'bat': .32}),

    dict(id='garage-cle', lieu='garage', titre='CLÉ DE 12', bpm=92, swing=.03, graine=6606, cle='la majeur', ton=5, gamme=[9, 11, 1, 2, 4, 6, 8],
         style='Garage · bossa lente : guitare nylon, vibraphone, contrebasse, clave',
         idee="Une bossa à l'heure de la sieste : la guitare nylon gratte ses accords, la contrebasse se pose, la clave et le shaker, rien qui presse ; le vibraphone chante, le piano prend la 2e partie, le célesta répond.",
         A=[[45, 52, 56, 59, 61], [42, 52, 56, 57, 61], [38, 49, 54, 57, 61], [40, 52, 56, 59, 61],
            [45, 52, 56, 59, 61], [37, 49, 52, 56, 59], [38, 49, 52, 54, 57], [(0, [40, 52, 57, 59, 62]), (8, [40, 50, 56, 59, 62])]],
         B=[[38, 49, 54, 57, 61], [37, 49, 52, 56, 59], [47, 54, 57, 61, 62], [40, 52, 56, 59, 64],
            [42, 52, 57, 61, 64], [38, 49, 54, 57, 61], [47, 54, 57, 62, 66], [(0, [40, 52, 57, 59, 62]), (8, [40, 50, 56, 59, 62])]],
         R=[[38, 49, 54, 57, 61], [(0, [40, 52, 57, 59, 62]), (8, [40, 50, 56, 59, 62])]],
         melA=[(0, 0, 68, 6), (0, 6, 69, 2), (0, 8, 71, 8), (1, 0, 69, 8), (1, 8, 68, 4), (1, 12, 64, 4), (2, 0, 66, 6), (2, 6, 69, 2), (2, 8, 73, 8),
               (3, 0, 71, 12), (3, 12, 68, 4), (4, 0, 71, 6), (4, 6, 73, 2), (4, 8, 76, 8), (5, 0, 73, 8), (5, 8, 68, 8),
               (6, 0, 69, 6), (6, 6, 66, 2), (6, 8, 64, 8), (7, 0, 69, 8), (7, 8, 68, 8)],
         melB=[(0, 0, 73, 8), (0, 8, 69, 8), (1, 0, 68, 12), (1, 12, 64, 4), (2, 0, 66, 8), (2, 8, 69, 8), (3, 0, 68, 16),
               (4, 0, 69, 8), (4, 8, 73, 8), (5, 0, 74, 8), (5, 8, 73, 8), (6, 0, 71, 8), (6, 8, 66, 8), (7, 0, 71, 8), (7, 8, 68, 8)],
         melR=[(0, 0, 69, 8), (0, 8, 73, 8), (1, 0, 71, 8), (1, 8, 68, 8)],
         comp='bossa', rh=False, pad={'g': .35, 'fc': 1300}, basse_son='contrebasse', approche=False,
         basse={1: [(0, 0, 7), (8, 7, 7)], 2: [(0, 0, 5), (6, 0, 2), (8, 7, 6)], 3: [(0, 0, 5), (6, 0, 2), (8, 7, 6)], -1: [(0, 0, 14)]},
         voix=dict(TOUT('vibra'), B='piano'), double={}, rep='celesta', rep_sec=('A2', 'A3'), rep_p=.4, contre=(),
         kit={1: {'shaker': 'x.o.x.o.x.o.x.o.'},
              2: {'clave': 'x..x..x...x..x..', 'shaker': 'x.o.x.o.x.o.x.o.', 'balai': '....x.......x...'},
              3: {'clave': 'x..x..x...x..x..', 'shaker': 'x.o.x.o.x.o.x.o.', 'balai': 'o.o.x.o.o.o.x.o.', 'kick': 'x.......x.......'},
              -1: {'shaker': 'o.o.o.o.o.o.o.o.'}},
         kit_intro={}, kicks={}, fills=('clave', 'stop'), crash=False, souffle=False, **{'break': False},
         entrees=(), forme=FORME, rev=3.2, mix={'gtr': .8, 'pad': .5, 'basse': .45, 'vibra': 1.15}),
]


def garage(L, R):
    """LE LÉGER FILTRE DU GARAGE — celui des lobbys du main (lobby_main.garage, recopié : lobby_main se lance à l'import) : l'enceinte de
    l'atelier (aigus −4,4 dB au-dessus de ~3,5 kHz, une petite pièce mate à 15 %), traité en boucle, même sonie"""
    q = 2 * SR; rms0 = np.sqrt(((L ** 2 + R ** 2) / 2).mean())
    x = [np.r_[L[-q:], L], np.r_[R[-q:], R]]
    doux = [.6 * c + .4 * filtre(c, 'low', 3500) for c in x]
    rL, rR = reverbe(doux[0], doux[1], .7, 4000, .012, de=Des(77))
    y = [(doux[0] + .15 * rL)[q:], (doux[1] + .15 * rR)[q:]]
    k = rms0 / max(np.sqrt(((y[0] ** 2 + y[1] ** 2) / 2).mean()), 1e-9); pl = 10 ** (-1 / 20)
    return np.tanh(y[0] * k / pl) * pl, np.tanh(y[1] * k / pl) * pl


def frottements(V):
    """une note de mélodie d'au moins une noire, hors de l'accord, à un demi-ton d'une note de l'accord (la règle de petites_musiques)"""
    pb = []
    for gr in ('A', 'B', 'R'):
        for (b, p, n, l) in V['mel' + gr]:
            if l < 4: continue
            it = V[gr][b]; it = [(0, it)] if isinstance(it[0], (int, np.integer)) else it
            ch = next(v for q, v in reversed(it) if q <= p); pcs = {x % 12 for x in ch}
            if n % 12 not in pcs and any((n - x) % 12 in (1, 11) for x in pcs): pb.append((gr, b, p, n))
    return pb


def brillance(L, R):
    x = (L + R) / 2; S = np.abs(np.fft.rfft(x * np.hanning(len(x)))); f = np.fft.rfftfreq(len(x), 1 / SR)
    return float((S * f).sum() / (S.sum() + 1e-12))


def rendre(V):
    t0 = time.time()
    pb = frottements(V)
    if pb: print('  ⚠ frottements', V['id'], pb)
    L, R = C.mixe(C.compose(V))
    if V['lieu'] == 'garage': L, R = garage(L, R)
    r = boucle_aac.encode(L, R, os.path.join(SORTIE, V['id'] + '.m4a'))
    dur = r['N'] / 44100
    print('%-16s %3d BPM  %5.1f s  crête %.1f dB  brillance %4d Hz  (%.0f s)' % (V['id'], V['bpm'], dur,
          20 * np.log10(max(np.abs(L).max(), np.abs(R).max())), brillance(L, R), time.time() - t0), flush=True)
    return {'id': V['id'], 'lieu': V['lieu'], 'titre': V['titre'], 'style': V['style'], 'bpm': V['bpm'], 'cle': V['cle'], 'ton': V['ton'],
            'idee': V['idee'], 'f': 'assets/audio/music/lobby/%s.m4a?v=%d' % (V['id'], int(time.time())), 'dur': round(dur, 5)}


if __name__ == '__main__':
    filtres = sys.argv[1:]
    js = os.path.join(SORTIE, 'menu-donnees.js'); faits = {}
    if os.path.exists(js):
        try: faits = {p['id']: p for p in json.loads(open(js).read().split('=', 1)[1].rstrip().rstrip(';'))}
        except Exception: faits = {}
    for V in FICHES:
        if filtres and not any(f in V['id'] for f in filtres): continue
        faits[V['id']] = rendre(V)
    open(js, 'w').write('/* LA MUSIQUE DU CIEL ET DU GARAGE (atelier-son/ciel_garage.py) — pour la bibliothèque ; le jeu lit les .m4a (MUSIC_CIEL, MUSIC_GARAGE) */\n'
                        'window.MENU_MUS=' + json.dumps([faits[V['id']] for V in FICHES if V['id'] in faits], ensure_ascii=False) + ';\n')
    print('→', js)
