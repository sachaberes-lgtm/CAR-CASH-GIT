# MESURE DES ESSAIS DE JADE (2026-11-20, correction 3) : les mêmes nombres que outils/controle-jade/mesure.py (contrôle adverse), par tiers d'image,
# rangés par prise : av (avant), lv (le lot posé à chaud sur avant : doit valoir ap), ap (le lot), k1 k2 k3 (les essais), sa (sans), fi (final).
#   python3 mesure-essais.py <dossier de prises>
# L luminance (Rec.709, 0-255), C chroma (max-min), B % brûlés (> 245), R % rouge-orange vif (teinte < 40° ou > 340°, sat > .6, val > .45), V % vert-jade (90-185°).
import sys, os, glob, colorsys, re
from PIL import Image
def mes(im):
    im = im.convert('RGB'); im = im.resize((im.width // 4, im.height // 4))
    w, h = im.size; px = im.load(); out = []
    for t in range(3):
        n = L = C = B = R = V = 0
        for y in range(t * h // 3, (t + 1) * h // 3):
            for x in range(w):
                r, g, b = px[x, y]; l = .2126 * r + .7152 * g + .0722 * b
                mx, mn = max(r, g, b), min(r, g, b); n += 1; L += l; C += mx - mn
                if l > 245: B += 1
                if mx > 50 and (mx - mn) > .35 * mx:
                    hv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)[0] * 360
                    if 90 <= hv <= 185: V += 1
                if mx > 115 and mx == r and (mx - mn) > .6 * mx:
                    hh = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)[0] * 360
                    if hh < 40 or hh > 340: R += 1
        out.append((L / n, C / n, 100 * B / n, 100 * R / n, 100 * V / n))
    return out
P = sys.argv[1]; G = {}
for f in sorted(glob.glob(P + '/*.png')):
    b = os.path.basename(f)[:-4]; t, rest = b.split('-', 1); G.setdefault(rest, {})[t] = mes(Image.open(f))
ORD = ['av', 'sa', 'lv', 'ap', 'k1', 'k2', 'k3', 'fi']
for rest in sorted(G):
    print('\n##', rest, '   (haut | milieu | bas : L C B R V)')
    for t in sorted(G[rest], key=lambda x: ORD.index(x) if x in ORD else 99):
        print('  %-3s ' % t + ' | '.join('L%5.1f C%5.1f B%4.2f R%5.2f V%5.1f' % q for q in G[rest][t]))
