"""Photographie la VUE 3D de la copie de test, où qu'elle soit dans la fenêtre de Studio (les panneaux bougent d'un lancement à
l'autre) : la fenêtre entière est prise par studio-photo.ps1, puis on y cherche le rectangle de l'image du jeu — tout ce qui
n'est pas le blanc ou le gris clair de l'interface de Studio. Le dernier cadre trouvé est gardé : un écran tout blanc (le voile
du départ) réutilise le précédent.      python vue.py <sortie.png> [largeur]"""
import sys, os, subprocess, json, warnings
warnings.filterwarnings('ignore')
from PIL import Image

ICI = os.path.dirname(os.path.abspath(__file__))
sortie = sys.argv[1]
largeur = int(sys.argv[2]) if len(sys.argv) > 2 else 1100
tmp = os.path.join(os.environ.get('TEMP', '.'), 'cashcar-banc', 'fenetre.png')
memo = os.path.join(os.environ.get('TEMP', '.'), 'cashcar-banc', 'cadre.json')
r = subprocess.run(['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', os.path.join(ICI, 'studio-photo.ps1'), tmp, '0', '0', '1', '1', '1931'],
                   capture_output=True, text=True)
if not os.path.exists(tmp) or 'absent' in r.stdout:
    print('absent')
    sys.exit(1)
im = Image.open(tmp).convert('RGB')
W, H = im.size
px = im.load()


def ui(p):  # le blanc et les gris clairs de Studio
    return p[0] >= 236 and p[1] >= 236 and p[2] >= 236 and max(p) - min(p) <= 6


def cadre():
    y0, y1 = int(H * 0.2), int(H * 0.75)
    cols = [sum(1 for y in range(y0, y1, 6) if ui(px[x, y])) / len(range(y0, y1, 6)) < 0.6 for x in range(W)]
    # la plus longue suite de colonnes « de jeu »
    best, cur, deb = (0, 0), 0, 0
    for x, c in enumerate(cols + [False]):
        if c:
            if cur == 0: deb = x
            cur += 1
        else:
            if cur > best[1] - best[0]: best = (deb, deb + cur)
            cur = 0
    xa, xb = best
    if xb - xa < W * 0.3: return None
    rows = [sum(1 for x in range(xa, xb, 8) if ui(px[x, y])) / len(range(xa, xb, 8)) < 0.6 for y in range(H)]
    best, cur, deb = (0, 0), 0, 0
    for y, c in enumerate(rows + [False]):
        if c:
            if cur == 0: deb = y
            cur += 1
        else:
            if cur > best[1] - best[0]: best = (deb, deb + cur)
            cur = 0
    ya, yb = best
    if yb - ya < H * 0.25: return None
    return [xa / W, ya / H, xb / W, yb / H]


c = cadre()
if c:
    json.dump(c, open(memo, 'w'))
elif os.path.exists(memo):
    c = json.load(open(memo))
else:
    c = [0.114, 0.1245, 0.927, 0.817]
b = im.crop((int(c[0] * W) + 2, int(c[1] * H) + 2, int(c[2] * W) - 2, int(c[3] * H) - 2))
b = b.resize((largeur, int(b.height * largeur / b.width)), Image.LANCZOS)
b.save(sortie)
print('%d x %d' % b.size)
