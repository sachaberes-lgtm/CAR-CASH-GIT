#!/usr/bin/env python3
# LA PLANCHE DE LA TRAME (2026-11-15) : un dégradé de ciel recadré, agrandi au plus proche voisin, en deux rangées : tel quel, puis CONTRASTE ÉTIRÉ (×k autour de
# la moyenne du recadrage) pour rendre visibles les marches de 1/255 et le grain (une photo ne les montre pas à l'œil). PNG sans perte.
#   python3 outils/banc-ombre-image/planche-trame.py sortie.png --crop x,y,l,h [--zoom 4] [--k 10] etiquette=photo.png …
import sys
from PIL import Image, ImageDraw, ImageFont, ImageStat
a = sys.argv[1:]; out = a.pop(0); crop = None; zoom = 4; k = 10; items = []
while a:
    x = a.pop(0)
    if x == '--crop': crop = [int(v) for v in a.pop(0).split(',')]
    elif x == '--zoom': zoom = int(a.pop(0))
    elif x == '--k': k = float(a.pop(0))
    else: e, _, f = x.partition('='); items.append((e, f))
ims = [(e, Image.open(f).convert('RGB').crop((crop[0], crop[1], crop[0] + crop[2], crop[1] + crop[3]))) for e, f in items]
m = ImageStat.Stat(ims[0][1]).mean
def etire(im): return Image.merge('RGB', [c.point(lambda v, mu=mu: max(0, min(255, int(round((v - mu) * k + 128))))) for c, mu in zip(im.split(), m)])
w, h = crop[2] * zoom, crop[3] * zoom; B = 24; G = 6
P = Image.new('RGB', (len(ims) * (w + G) + G, 2 * (h + B + G) + G), (18, 14, 28)); d = ImageDraw.Draw(P)
try: ft = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 16)
except Exception: ft = ImageFont.load_default()
for i, (e, im) in enumerate(ims):
    x = G + i * (w + G)
    for r, (lab, j) in enumerate([(e, im), (e + f' · contraste ×{k:g}', etire(im))]):
        y = G + r * (h + B + G); d.text((x + 4, y + 3), lab, fill=(255, 235, 200), font=ft); P.paste(j.resize((w, h), Image.NEAREST), (x, y + B))
P.save(out); print(out, P.size)
