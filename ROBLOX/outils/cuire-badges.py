# CASH CAR — les ICÔNES DES 7 BADGES Roblox, en pixel art : le motif sort de Icones.luau (la même grille 9 × 9 que les icônes du jeu),
# centré dans un DISQUE (Roblox recadre les badges en rond), fond transparent. Tout est dessiné sur une toile de 64 × 64 cases puis
# agrandi ×8 au pixel près (512 × 512) : le disque a des marches de pixel, comme le reste du jeu.
#   python -I outils/cuire-badges.py            (depuis ROBLOX/) → badges/*.png + une planche badges/_planche.png
import os, re
from PIL import Image

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.normpath(os.path.join(ICI, '..'))
SORTIE = os.path.join(RACINE, 'badges')
os.makedirs(SORTIE, exist_ok=True)
src = open(os.path.join(RACINE, 'src', 'ReplicatedStorage', 'CashCar', 'Icones.luau'), encoding='utf-8').read()
ICONES = dict(re.findall(r'^\s*(\w+) = "([.#|]+)"', src, re.M))

ENCRE = (26, 6, 40, 255)
# nom du fichier → (motif de Icones.luau, couleur du disque [clair, sombre], couleur du motif)
BADGES = {
    'bienvenue':    ('voiture', [(255, 120, 150), (168, 33, 60)],  (255, 255, 255)),
    'permis':       ('volant',  [(80, 170, 255), (18, 63, 153)],   (255, 255, 255)),
    'zone6':        ('drapeau', [(150, 110, 255), (58, 29, 158)],  (255, 255, 255)),
    'moteur10':     ('eclair',  [(255, 150, 50), (184, 74, 0)],    (255, 230, 90)),
    'aura1000':     ('etoile',  [(255, 90, 210), (154, 20, 117)],  (255, 255, 255)),
    'millionnaire': ('piece',   [(70, 210, 120), (14, 107, 55)],   (255, 215, 94)),
    'serie7':       ('flamme',  [(70, 80, 150), (20, 22, 60)],     (255, 140, 40)),
}
N, K = 64, 8          # la toile en cases, et la taille d'une case en pixels
C = (N - 1) / 2       # le centre


def melange(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (255,)


def dessine(motif, disque, couleur):
    im = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    px = im.load()
    R = 30.5
    for y in range(N):
        for x in range(N):
            d = ((x - C) ** 2 + (y - C) ** 2) ** 0.5
            if d <= R:
                if d > R - 2.2:
                    px[x, y] = ENCRE                                          # le cerne d'encre
                elif d > R - 4.2:
                    px[x, y] = melange(disque[0], (255, 255, 255), 0.35)        # l'anneau clair
                else:
                    # le dégradé : clair en haut à gauche, sombre en bas à droite (la lumière du jeu)
                    t = min(1, max(0, ((x - C) * 0.5 + (y - C)) / (R * 1.4) + 0.5))
                    px[x, y] = melange(disque[0], disque[1], t)
    # le motif 9 × 9, chaque pixel = 4 × 4 cases, centré ; une ombre d'encre décalée de 2 cases en bas à droite, puis le motif
    lignes = ICONES[motif].split('|')
    T = 4
    x0, y0 = int(C - 9 * T / 2 + 0.5), int(C - 9 * T / 2 + 0.5)
    for passe in ('ombre', 'motif'):
        for j, l in enumerate(lignes):
            for i, ch in enumerate(l):
                if ch != '#':
                    continue
                for dy in range(T):
                    for dx in range(T):
                        if passe == 'ombre':
                            px[x0 + i * T + dx + 2, y0 + j * T + dy + 2] = ENCRE
                        else:
                            # un liseré clair sur le HAUT de la forme seulement (le pixel du dessus est vide) : l'éclat du pixel
                            # art, sans le quadrillage de points qu'un biseau par pixel dessinait
                            c = couleur + (255,)
                            dessus_vide = j == 0 or lignes[j - 1][i] != '#'
                            if dessus_vide and dy == 0:
                                c = melange(couleur, (255, 255, 255), 0.6)
                            px[x0 + i * T + dx, y0 + j * T + dy] = c
    return im.resize((N * K, N * K), Image.NEAREST)


if __name__ == '__main__':
    for nom, (motif, disque, couleur) in BADGES.items():
        dessine(motif, disque, couleur).save(os.path.join(SORTIE, nom + '.png'))
    pl = Image.new('RGBA', (7 * 180, 180), (40, 40, 48, 255))
    for k, nom in enumerate(BADGES):
        pl.alpha_composite(Image.open(os.path.join(SORTIE, nom + '.png')).resize((170, 170), Image.LANCZOS), (k * 180 + 5, 5))
    pl.save(os.path.join(SORTIE, '_planche.png'))
    print(len(BADGES), 'badges dans', SORTIE)
