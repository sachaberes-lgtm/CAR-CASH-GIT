"""LA MUSIQUE DU CIEL (2026-10-03, Léo, dans la boîte : « utilise la NAPPE VAPEUR pour faire une musique ciel qui va évoluer beaucoup plus,
genre 5 niveaux ; inspire-toi de l'album EXPONENTIAL GENERATOR de FROLLEN MUSIC LIBRARY — ta source d'inspiration principale en termes de
structure technique »).
L'album (Colemine, janv. 2026) : de la LIBRARY MUSIC soul/hip-hop — des beats hip-hop funky, un RHODES et des percussions, un synthé
MONOPHONIQUE (Korg) qui raconte la mélodie par-dessus des basses rondes d'ARP Odyssey, minimaliste, un peu sombre, cinématographique.
LA FORME : un morceau de library qui S'ÉTOFFE, 5 NIVEAUX de 8 mesures (88 BPM, mi♭ majeur — les accords de VAPEUR) :
  1 · la NAPPE VAPEUR seule (filtrée) + une sous-basse tenue
  2 · + le RHODES qui pose les accords, un rim et un shaker
  3 · + le BEAT hip-hop (grosse caisse poussiéreuse, caisse claire, charley qui swingue) + la BASSE funky façon ARP
  4 · + la MÉLODIE au synthé monophonique (notes qui glissent)
  5 · + les CORDES, des congas, le charley ouvert ; le Rhodes répond à la mélodie
La nappe s'ouvre de niveau en niveau ; une petite relance de caisse claire à la fin des niveaux 3 et 4. L'ambiance du lobby (bande,
réverbe douce, aigus adoucis). Sorties : assets/audio/music/ciel/ciel-complet.m4a (les 5 à la suite) + ciel-n1…n5.m4a (chaque niveau
en boucle) + ciel-donnees.js (window.CIEL), lus par boucles.html (Niveaux → Nuages).
"""
import os, sys, json, subprocess, time
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from boucles import *  # noqa: F403
from boucles8 import chorus, fx_rev, rim, shaker, crash
from petits import Main
from vapeurs import bande, rhodes_p, cordes, tremolo_stereo
from lobby5 import conga

SORTIE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'audio', 'music', 'ciel')
BPM = 88
ACC = [[51, 55, 58, 62, 65], [56, 60, 63, 67, 70], [53, 56, 60, 63, 67], [58, 62, 65, 68, 72]]   # Mi♭maj9 · La♭maj9 · Fa m9 · Si♭7sus (VAPEUR)
RAC = [39, 44, 41, 46]                                                                      # mi♭ · la♭ · fa · si♭
MEL = [[(0, 70, 6), (6, 72, 2), (8, 74, 8)], [(0, 75, 4), (4, 74, 2), (6, 72, 2), (8, 70, 8)],
       [(0, 68, 4), (4, 70, 4), (8, 72, 4), (12, 75, 4)], [(0, 75, 8), (8, 72, 8)],
       [(0, 77, 6), (6, 75, 2), (8, 74, 8)], [(0, 79, 4), (4, 77, 4), (8, 75, 8)],
       [(0, 72, 4), (4, 75, 4), (8, 77, 4), (12, 80, 4)], [(0, 79, 8), (8, 77, 8)]]


def nappe(m, dur, fc, de):
    """LA NAPPE VAPEUR (le son de départ d-nappe) : l'accord en scies douces, filtré"""
    L = 0; R = 0
    for n in m:
        l, r = supersaw(n + 12, dur + .8, 3, 6, de); L = L + l; R = R + r
    e = env(len(L), .35, 9, 1, .9, dur); return filtre(L * e, 'low', fc), filtre(R * e, 'low', fc)


def mono(n, prec, dur):
    """le synthé MONOPHONIQUE : une scie et une carrée, la note GLISSE depuis la précédente (portamento), le filtre s'ouvre à l'attaque"""
    nn = int((dur + .08) * SR); t = np.arange(nn) / SR
    f0 = hz(prec) if prec else hz(n); f = hz(n) + (f0 - hz(n)) * np.exp(-t / .045)
    f = f * (1 + .005 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - .2) / .3, 0, 1))
    s = np.tanh((scie(f, nn) * .6 + carre(f, nn, .45) * .4) * 1.3)
    fc = 900 + 2200 * np.exp(-t / .25)
    return balaye(s * env(nn, .008, .3, .75, .07, dur), fc) * .8


def basse_arp(n, dur):
    """la basse façon ARP : une scie ronde, un coup de filtre à chaque note"""
    nn = int((dur + .03) * SR); t = np.arange(nn) / SR
    s = scie(hz(n), nn) * .55 + sinus(hz(n), nn) * .7
    return balaye(s * env(nn, .004, .15, .55, .04, dur), 180 + 1300 * np.exp(-t / .06))


def caisse_poussiere(de):
    s = caisse(de, 185, 1.05, .19, 1500); return filtre(s, 'low', 5500)


def souffle_inverse(acc, dur, de, fc=1800):
    """la nappe de l'accord SUIVANT jouée à l'envers, très doucement : elle « aspire » d'une mesure vers la suivante sans bruit de montée"""
    l, r = nappe(acc, dur, fc, de); n = int(dur * SR); l = l[:n][::-1]; r = r[:n][::-1]
    e = np.linspace(0, 1, n) ** 2; return l * e, r * e


def transition(M, m, nv, de, h, sw):
    """(Léo : « sur les niveaux d'avant, un petit grain de changement entre chacun : que la transition soit cohérente mais satisfaisante »)
    un geste DIFFÉRENT à chaque passage, toujours dans l'harmonie (Si♭7sus → Mi♭maj9) :
    1→2 trois notes de Rhodes qui montent + le souffle inversé de l'accord qui arrive ·
    2→3 la 2e demi-mesure se vide (rim et shaker se taisent) puis le beat TOMBE avec une cymbale ·
    3→4 la basse glisse d'une octave vers le grave, un charley s'ouvre, le souffle inversé ·
    4→5 la relance de caisse claire (déjà là) + la cymbale à l'arrivée + les notes de Rhodes qui montent."""
    rh = M.piste('trans'); t9 = M.t(m + 1)
    if nv in (1, 4):
        for k, (p, n) in enumerate(((10, 70), (12, 75), (14, 77))):
            rh.pose(h.t(M.t(m, p, sw)), rhodes_p(n + 12, .5, .5 + .15 * k), .07 + .015 * k, -.2 + .2 * k)
    if nv in (1, 3):
        l, r = souffle_inverse(ACC[0], M.temps * 2, de); rh.pose2(t9 - len(l) / SR, l, r, .07)
    if nv in (2, 4):
        cr = crash(de, 1.8); rh.pose(t9, filtre(cr, 'low', 9000), .14, .3)
    if nv == 3:
        nn = int(M.temps * 1.5 * SR); t = np.arange(nn) / SR; f = hz(RAC[3] - 12) * 2 ** (-t / (M.temps * 1.5))   # si♭ qui glisse vers le si♭ grave
        s = (scie(f, nn) * .5 + sinus(f, nn) * .7) * env(nn, .004, 9, 1, .1, M.temps * 1.4)
        M.piste('basse').pose(M.t(m, 10, sw), filtre(s, 'low', 900), .45)
        M.piste('bat').pose(M.t(m, 14, sw), charley(de, True, 7000), .25, .3)


def composer(M, niveau_de, de, h):
    """pose les instruments mesure par mesure selon le NIVEAU de chaque mesure"""
    sw = .2; nb = M.mes
    pd = M.piste('nappe'); sb = M.piste('sub'); rh = M.piste('rh'); b = M.piste('basse'); ld = M.piste('lead')
    bat = M.piste('bat'); sn = M.piste('sn'); pc = M.piste('perc'); ca = M.piste('rhc')
    prec = None
    for m in range(nb):
        nv = niveau_de(m); q = ACC[m % 4]; r = RAC[m % 4]
        l9, r9 = nappe(q, M.temps * 4, [900, 1300, 1700, 2100, 2500][nv - 1], de)
        pd.pose2(M.t(m), l9, r9, [.16, .13, .11, .1, .09][nv - 1])
        if nv <= 2:                                                        # la sous-basse tenue (avant la basse funky)
            nn = int(M.temps * 3.8 * SR); sb.pose(M.t(m), sinus(hz(r - 12), nn) * env(nn, .2, 9, 1, .3, M.temps * 3.4), .16)
        if nv >= 2:                                                        # le RHODES pose l'accord
            pas = ((0, 12),) if nv == 2 else ((0, 7), (10, 5))
            for p, lg in pas:
                v = .55 + .3 * h.r.random()
                for k, n in enumerate(q[1:]): rh.pose(h.t(M.t(m, p, sw)) + k * .009, rhodes_p(n + 12, lg * M.dc, v), h.g(.07), -.25 + .12 * k)
        dernier = m % 8 == 7 and m + 1 < nb and niveau_de(m + 1) > nv     # la dernière mesure avant un niveau plus haut
        if nv == 2:
            for p in (4, 12):
                if not (dernier and p >= 8): bat.pose(h.t(M.t(m, p, sw)), rim(de), h.g(.25), .15)
            for p in range(0, 16, 2):
                if not (dernier and p >= 8): bat.pose(h.t(M.t(m, p, sw)), shaker(de), h.g(.12 if p % 4 else .18), -.4)
        if nv >= 3:                                                        # LE BEAT hip-hop
            for p in ((0, 7, 10) if m % 2 == 0 else (0, 3, 10)): bat.pose(h.t(M.t(m, p, sw)), kick(de, 105, 42, .42, .25, 1.4), h.g(.9))
            for p in (4, 12): sn.pose(h.t(M.t(m, p, sw)), caisse_poussiere(de), h.g(.6))
            for p in range(0, 16, 2): bat.pose(h.t(M.t(m, p, sw)), charley(de, nv == 5 and p % 8 == 6, 7500), h.g(.13 if p % 4 else .17), .3)
            if nv in (3, 4) and m % 8 == 7:                               # la petite relance vers le niveau suivant
                for k, p in enumerate((13, 14, 15)): sn.pose(M.t(m, p, sw), caisse_poussiere(de), .2 + .1 * k)
            for p, o, lg in ((0, 0, 3), (3, 12, 1), (6, 7, 2), (8, 0, 3), (11, 0, 1), (12, 10, 2), (14, 7, 2)):   # la BASSE funky façon ARP
                b.pose(h.t(M.t(m, p, sw)), basse_arp(r - 12 + o, lg * M.dc * .9), h.g(.5))
        if nv >= 4:                                                        # LA MÉLODIE au synthé monophonique
            for p, n, lg in MEL[m % 8]:
                ld.pose(h.t(M.t(m, p, sw)), mono(n, prec, lg * M.dc * .95), h.g(.28)); prec = n   # (Léo : « augmente le son de la boucle ajoutée au niveau 4 »)
        if dernier: transition(M, m, nv, de, h, sw)
        if nv == 5:
            for p, f, slap in ((2, 210, 0), (6, 300, 1), (9, 210, 0), (11, 210, 0), (14, 300, 1)):
                pc.pose(h.t(M.t(m, p, sw)), conga(de, f, bool(slap)), h.g(.22), .35)
            for p, n, lg in MEL[m % 8][1:2]:                               # le Rhodes RÉPOND à la mélodie
                ca.pose(h.t(M.t(m, p + 2, sw)), rhodes_p(n - 5, 1., .8), .07, -.3)
    cordes(M, de, ACC, [m for m in range(nb) if niveau_de(m) == 5], .05, 1300)
    tremolo_stereo(M, 'rh', 4.2, .2)
    M.bus['nappe'].L, M.bus['nappe'].R = chorus(M.bus['nappe'].L, M.bus['nappe'].R)
    bande(M, ('nappe', 'rh', 'lead', 'cordes', 'rhc', 'trans'))
    eL, eR = echo(ld.L, ld.R, M.temps * .75, .3); ld.L += eL * .3; ld.R += eR * .3
    fx_rev(M, [('nappe', 1), ('rh', .7), ('lead', .8), ('cordes', 1), ('rhc', 1), ('trans', 1), ('sn', .35), ('bat', .1)], 3., .4, 4800)
    return fin(M, {'nappe': 1, 'sub': 1, 'rh': 1, 'basse': 1, 'lead': 1, 'bat': .9, 'sn': .9, 'perc': 1, 'rhc': 1, 'cordes': 1, 'trans': 1, 'fx': 1}, maitre_lp=7500)


def rendu(nom, mesures, niveau_de, graine):
    M = Morceau(BPM, mesures=mesures, graine=graine); h = Main(graine, 4)
    L, R = composer(M, niveau_de, M.de, h)
    wav = os.path.join(SORTIE, nom + '.wav'); ecrit_wav(wav, L, R)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000', '-q', '127', wav, os.path.join(SORTIE, nom + '.m4a')], check=True)
    os.remove(wav); print('  %-12s %.1f s' % (nom, len(L) / SR), flush=True); return round(len(L) / SR, 5)


if __name__ == '__main__':
    os.makedirs(SORTIE, exist_ok=True); v = int(time.time()); out = []
    d = rendu('ciel-complet', 40, lambda m: m // 8 + 1, 701)
    out.append({'id': 'ciel-complet', 'titre': 'CIEL · LES 5 NIVEAUX', 'style': 'Library soul / hip-hop · le morceau entier', 'bpm': BPM, 'cle': 'mi♭ majeur',
                'f': 'assets/audio/music/ciel/ciel-complet.m4a?v=%d' % v, 'dur': d,
                'idee': "La nappe vapeur qui s'étoffe en 5 niveaux de 8 mesures : nappe seule · Rhodes · beat hip-hop et basse ARP · mélodie au synthé mono · cordes et congas."})
    noms = ['la nappe seule', 'le Rhodes', 'le beat et la basse', 'la mélodie', 'tout ouvert']
    for k in range(1, 6):
        d = rendu('ciel-n%d' % k, 8, lambda m, k=k: k, 710 + k)
        out.append({'id': 'ciel-n%d' % k, 'titre': 'CIEL · NIVEAU %d' % k, 'style': 'Niveau %d · %s' % (k, noms[k - 1]), 'bpm': BPM, 'cle': 'mi♭ majeur',
                    'f': 'assets/audio/music/ciel/ciel-n%d.m4a?v=%d' % (k, v), 'dur': d, 'idee': "Le niveau %d du CIEL, en boucle." % k})
    open(os.path.join(SORTIE, 'ciel-donnees.js'), 'w').write('window.CIEL=' + json.dumps(out, ensure_ascii=False) + ';\n'); print('ok')
