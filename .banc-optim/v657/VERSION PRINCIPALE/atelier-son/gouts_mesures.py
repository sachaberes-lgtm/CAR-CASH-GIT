"""LES GOÛTS MESURÉS (2026-10-14, Léo : « les musiques aimées, il ne faut pas les enregistrer en tant que son mais en soutirer toutes les
données intéressantes pour nourrir [le générateur] ; les petits sons effacés et les sons complets, tu peux comparer et comprendre pourquoi
je ne les ai pas aimés, sinon supprime »).
Chaque son AIMÉ (👍 de la bibliothèque) et chaque son SUPPRIMÉ est mesuré par analyse_inspi.py (les morceaux à couches : les couches
additionnées = le morceau entier ; les morceaux à paliers : le dernier palier, le plus complet) : tempo, mode, grille (boucle d'un ou deux
accords ?), brillance, poids de la basse, contraste, densité. Puis on COMPARE les deux groupes → des leçons lisibles et des POIDS pour le
générateur (mode, boucles d'accords, tempo préféré, son plus ou moins sombre, basse, contraste), écrits dans
assets/audio/music/direct/gouts-mesures.json — la page les fond dans gouts-trente.json (le fichier que le jeu chargera).
Les sons eux-mêmes ne bougent pas (certains jouent dans le jeu) : ils sortent seulement de la bibliothèque.
Lancer : <venv>/python atelier-son/gouts_mesures.py
"""
import os, sys, json, time
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import analyse_inspi as AN

RACINE = AN.RACINE
SORTIE = os.path.join(RACINE, 'assets/audio/music/direct/gouts-mesures.json')
B = 'assets/audio/music/boucles/'
AIMES = [('pal-aura', 'AURA', 'assets/audio/music/paliers/rendus/aura/p8.m4a'), ('pal-neon-noir', 'NÉON NOIR', 'assets/audio/music/paliers/rendus/neon-noir/p8.m4a'),
         ('pal-glisse-fusion', 'GLISSE FUSION', 'assets/audio/music/paliers/rendus/glisse-fusion/p8.m4a'),
         ('cou-neon-drive-2', 'NÉON DRIVE · MOTEUR', [B + 'neon-drive-2--%da.m4a' % k for k in range(1, 8)]),
         ('cou-niv-altitude', 'ALTITUDE', [B + 'niv-altitude--c%d.m4a' % k for k in range(1, 5)]),
         ('pal-nuit-de-velours', 'NUIT DE VELOURS', 'assets/audio/music/paliers/rendus/nuit-de-velours/p8.m4a'), ('ville-n8', 'PENTHOUSE', 'assets/audio/music/ville/ville-n8.m4a'),
         ('a-heymikey', 'IN DA BACK', 'assets/audio/music/heymikey-in-da-back-2.mp3'), ('a-lilb', 'BOR', 'assets/audio/music/lilb-bor.mp3'),
         ('chris-matin', 'PREMIER MATIN', 'assets/audio/music/lobby-chris/chris-matin.m4a'), ('chris-nuit', 'GARAGE DE NUIT', 'assets/audio/music/lobby-chris/chris-nuit.m4a'),
         ('pm-siffleur', 'SIFFLEUR', 'assets/audio/music/lobby-chris/pm-siffleur.m4a')]
SUPPRIMES = [('seq-ville-addictive', 'VILLE · ADDICTIVE LOOP (phrases)', B + 'ville--phrases.m4a'), ('seq-nuages-noite', 'NUAGES · NOITE (phrases)', B + 'nuages--phrases.m4a'),
         ('cou-niv-gravite', 'GRAVITÉ ZÉRO', [B + 'niv-gravite--c%d.m4a' % k for k in range(1, 5)]), ('pal-moteur-glisse', 'MOTEUR GLISSE', 'assets/audio/music/paliers/rendus/moteur-glisse/p5.m4a'),
         ('l5-margarita', 'MARGARITA BOSS', B + 'l5-margarita.m4a'), ('l5-paris', 'PARIS PUNK CASH', B + 'l5-paris.m4a'), ('l5-fortune', 'VIEILLE FORTUNE', B + 'l5-fortune.m4a'),
         ('l5-savane', 'SAVANE ROBOTIQUE', B + 'l5-savane.m4a'), ('inspi-chrome', 'CHROME LIQUIDE', B + 'inspi-chrome.m4a'), ('lobby-luxe', 'LUXE', B + 'lobby-luxe.m4a'),
         ('lobby-rock', 'BONHOMME', B + 'lobby-rock.m4a'), ('lobby-filtre', "FILTRE D'OR", B + 'lobby-filtre.m4a'), ('lobby-splat', 'ENCRE FRAÎCHE', B + 'lobby-splat.m4a'),
         ('lobby-vapeur', 'VAPEUR', B + 'lobby-vapeur.m4a'), ('lobby-arcade', "PIÈCE D'OR", B + 'lobby-arcade.m4a'), ('lobby-ascenseur', 'ASCENSEUR DORÉ', B + 'lobby-ascenseur.m4a'),
         ('lobby-coucher', 'COUCHER DE SOLEIL', B + 'lobby-coucher.m4a'), ('a-neon3', 'NEON CASH CAR v3', 'assets/audio/music/lvl1-neon-cash-car-v3.mp3'),
         ('a-neon', 'NEON CASH CAR', 'assets/audio/music/lvl1-neon-cash-car.mp3'), ('a-noite', 'NOITE DE VELOCIDADE', 'assets/audio/music/noite-de-velocidade.mp3'),
         ('a-vitesse', 'CASH CAR VITESSE', 'assets/audio/music/lvl2-cash-car-vitesse.mp3'), ('a-addictive', 'ADDICTIVE LOOP', 'assets/audio/music/addictive-loop.m4a'),
         ('a-chrome', 'CHROME LEDGER', 'assets/audio/music/lvl1-chrome-ledger.mp3'), ('a-ascension', 'ASCENSION', 'assets/audio/music/compo/nuages-apercu.m4a'),
         ('a-nuit', 'NUIT ÉLECTRIQUE', 'assets/audio/music/compo/ville-apercu.m4a'), ('a-attraction', 'ATTRACTION', 'assets/audio/music/compo/orbite-apercu.m4a'),
         ('pm-valse', 'VALSE LENTE', 'assets/audio/music/petites-musiques/pm-valse.m4a'), ('pm-reflets', 'REFLETS', 'assets/audio/music/petites-musiques/pm-reflets.m4a'),
         ('pm-soleil', 'SOLEIL BAS', 'assets/audio/music/petites-musiques/pm-soleil.m4a'), ('pm-pixel', 'PIXEL DOUX', 'assets/audio/music/petites-musiques/pm-pixel.m4a'),
         ('inspi-poussiere', "POUSSIÈRE D'OR", B + 'inspi-poussiere.m4a'), ('inspi-vol', 'VOL DE NUIT', B + 'inspi-vol.m4a'), ('vapeur-salon', 'VAPEUR · SALON', B + 'vapeur-salon.m4a'),
         ('inspi-coffre', 'COFFRE-FORT', B + 'inspi-coffre.m4a'), ('d-kalimba', 'KALIMBA (départ)', 'assets/audio/music/depart/d-kalimba.m4a'),
         ('d-cloche', 'CLOCHE DE VERRE (départ)', 'assets/audio/music/depart/d-cloche.m4a'), ('petit-kalimba', 'KALIMBA SOLEIL', B + 'petit-kalimba.m4a'),
         ('petit-guitare', 'GUITARE DE NUIT', B + 'petit-guitare.m4a'), ('petit-funk', "FUNK D'OR", B + 'petit-funk.m4a')]


def mesure(f):
    if isinstance(f, list):   # les couches additionnées = le morceau entier
        xs = [AN.charge(os.path.join(RACINE, g)) for g in f if os.path.exists(os.path.join(RACINE, g))]
        n = min(len(x) for x in xs); x = sum(x[:n] for x in xs)
    else:
        x = AN.charge(os.path.join(RACINE, f))
    if len(x) / AN.SR < 3: return None
    while len(x) / AN.SR < 24: x = np.concatenate([x, x])   # une boucle courte : redite (assez de mesures pour lire la forme)
    a = AN.analyse_x(x); g = a['grille'].split(' · ') if a['grille'] else []
    a['vamp'] = len(set(g)) <= 2 if g else False
    a['densite'] = round(float(np.mean([p['densite'] for p in a['parties']])), 2) if a['parties'] else 0
    for k in ('parties',): a.pop(k, None)
    return a


def med(L, k):
    v = [x[k] for x in L if x.get(k) is not None]; return round(float(np.median(v)), 2) if v else None


def bpm_plie(b):   # la double / demi-vitesse : on ramène tout dans 85-170
    while b < 85: b *= 2
    while b > 170: b /= 2
    return b


if __name__ == '__main__':
    res = {'aimes': [], 'supprimes': []}
    for grp, L in (('aimes', AIMES), ('supprimes', SUPPRIMES)):
        for id_, titre, f in L:
            try:
                a = mesure(f)
            except Exception as e:
                print('  !', titre, e); continue
            if not a: continue
            a.update(id=id_, titre=titre); res[grp].append(a)
            print('%-10s %-34s %6.1f BPM  %-14s %-26s brill %4d  basse %+5.1f  dyn %4.1f  dens %.2f%s' % (grp[:6], titre[:34], a['bpm'], a['tonalite'], a['grille'][:26], a['brillance_hz'], a['basse_db'], a['dynamique_db'], a['densite'], '  BOUCLE' if a['vamp'] else ''), flush=True)
    A, S = res['aimes'], res['supprimes']
    for L in (A, S):
        for x in L: x['bpm_plie'] = round(bpm_plie(x['bpm']), 1)
    comp = {}
    for k in ('bpm_plie', 'brillance_hz', 'basse_db', 'dynamique_db', 'densite'):
        comp[k] = {'aimes': med(A, k), 'supprimes': med(S, k)}
    comp['mineur'] = {'aimes': round(sum(x['mode'] == 'mineur' for x in A) / max(1, len(A)), 2), 'supprimes': round(sum(x['mode'] == 'mineur' for x in S) / max(1, len(S)), 2)}
    comp['boucle'] = {'aimes': round(sum(x['vamp'] for x in A) / max(1, len(A)), 2), 'supprimes': round(sum(x['vamp'] for x in S) / max(1, len(S)), 2)}
    # LES LEÇONS (lisibles) et LES POIDS (pour le générateur)
    L, P = [], {}
    dm = comp['mineur']['aimes'] - comp['mineur']['supprimes']
    if abs(dm) > .1: L.append('%s : %d %% de tes sons aimés sont en mineur, contre %d %% des sons supprimés' % ('le MINEUR' if dm > 0 else 'le MAJEUR', comp['mineur']['aimes'] * 100, comp['mineur']['supprimes'] * 100))
    P['mineur'] = round(float(np.clip(1 + dm * 2, .5, 2.5)), 2)
    db = comp['boucle']['aimes'] - comp['boucle']['supprimes']
    if abs(db) > .1: L.append('les BOUCLES d’un ou deux accords : %d %% des aimés, %d %% des supprimés' % (comp['boucle']['aimes'] * 100, comp['boucle']['supprimes'] * 100))
    P['vamp'] = round(float(np.clip(1 + db * 2, .5, 2.5)), 2)
    P['bpm'] = comp['bpm_plie']['aimes']
    dbr = (comp['brillance_hz']['aimes'] or 0) - (comp['brillance_hz']['supprimes'] or 0)
    L.append('la couleur du son : tes aimés brillent à %d Hz, les supprimés à %d Hz (%s)' % (comp['brillance_hz']['aimes'], comp['brillance_hz']['supprimes'], 'tu préfères PLUS SOMBRE' if dbr < -150 else 'tu préfères PLUS BRILLANT' if dbr > 150 else 'pareil'))
    P['clarte'] = round(float(np.clip(1 + dbr / 3000, .7, 1.3)), 2)
    # LA LEÇON LA PLUS NETTE : les extrêmes. Aucun son aimé n'est très brillant ; les supprimés les plus clinquants (vieilles musiques Suno,
    # aperçus du chef d'orchestre, boucles de lobby) passent 2 800 Hz
    hA = sum(x['brillance_hz'] > 2800 for x in A); hS = sum(x['brillance_hz'] > 2800 for x in S); P['brillance_max'] = int(max(x['brillance_hz'] for x in A)) if A else 2600
    L.insert(0, 'JAMAIS CLINQUANT : %d de tes %d sons aimés dépassent 2 800 Hz de brillance (le plus brillant : %d Hz), contre %d des %d supprimés' % (hA, len(A), P['brillance_max'], hS, len(S)))
    dba = (comp['basse_db']['aimes'] or 0) - (comp['basse_db']['supprimes'] or 0)
    L.append('la basse : %+.1f dB chez tes aimés par rapport aux supprimés (%s)' % (dba, 'tu aimes la basse LOURDE' if dba > 1.5 else 'tu aimes une basse plus légère' if dba < -1.5 else 'pareil'))
    P['basse_db'] = round(float(np.clip(dba / 2, -3, 3)), 1)
    dd = (comp['dynamique_db']['aimes'] or 0) - (comp['dynamique_db']['supprimes'] or 0)
    L.append('le contraste entre les parties : %.1f dB chez tes aimés, %.1f chez les supprimés (%s)' % (comp['dynamique_db']['aimes'], comp['dynamique_db']['supprimes'], 'tu aimes que ça BOUGE' if dd > 1.5 else 'tu aimes plus égal' if dd < -1.5 else 'pareil'))
    P['contraste'] = round(float(np.clip(1 + dd / 10, .7, 1.5)), 2)
    dde = (comp['densite']['aimes'] or 0) - (comp['densite']['supprimes'] or 0)
    L.append('la densité d’attaques : %.2f chez tes aimés, %.2f chez les supprimés (%s)' % (comp['densite']['aimes'], comp['densite']['supprimes'], 'tu aimes plus CHARGÉ' if dde > .1 else 'tu aimes plus aéré' if dde < -.1 else 'pareil'))
    L.append('le tempo : tes aimés autour de %d BPM, les supprimés autour de %d BPM' % (comp['bpm_plie']['aimes'], comp['bpm_plie']['supprimes']))
    out = {'maj': time.strftime('%Y-%m-%d %H:%M'), 'comparaison': comp, 'lecons': L, 'poids': P, 'aimes': A, 'supprimes': S}
    json.dump(out, open(SORTIE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('\nLEÇONS'); [print(' ·', l) for l in L]; print('POIDS', P)
