#!/usr/bin/env python3
# LA PLANCHE (2026-11-13, banc « la caisse nette ») : des photos du banc côte à côte, étiquetées, en JPEG léger.
#   python3 outils/banc-finition/planche.py sortie.jpg [--crop x,y,l,h] [--zoom 2] [--col 3] etiquette=photo.png …
# --crop : le même recadrage pour toutes (pixels de la photo) ; --zoom : agrandissement au plus proche voisin (les pixels restent des pixels).
import sys
from PIL import Image, ImageDraw, ImageFont
a = sys.argv[1:]; out = a.pop(0); crop = None; zoom = 1; col = 0; q = 86; items = []
while a:
    x = a.pop(0)
    if x == '--crop': crop = [int(v) for v in a.pop(0).split(',')]
    elif x == '--zoom': zoom = float(a.pop(0))
    elif x == '--col': col = int(a.pop(0))
    elif x == '--q': q = int(a.pop(0))
    else: k, _, f = x.partition('='); items.append((k, f))
ims = []
for k, f in items:
    im = Image.open(f).convert('RGB')
    if crop: im = im.crop((crop[0], crop[1], crop[0] + crop[2], crop[1] + crop[3]))
    if zoom != 1: im = im.resize((round(im.width * zoom), round(im.height * zoom)), Image.NEAREST)
    ims.append((k, im))
col = col or len(ims); rows = (len(ims) + col - 1) // col
w = max(i.width for _, i in ims); h = max(i.height for _, i in ims); B = 26; G = 6
P = Image.new('RGB', (col * w + (col + 1) * G, rows * (h + B) + (rows + 1) * G), (18, 14, 28)); d = ImageDraw.Draw(P)
try: ft = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 17)
except Exception: ft = ImageFont.load_default()
for n, (k, im) in enumerate(ims):
    x = G + (n % col) * (w + G); y = G + (n // col) * (h + B + G)
    d.text((x + 4, y + 3), k, fill=(255, 235, 200), font=ft); P.paste(im, (x, y + B))
P.save(out, quality=q, optimize=True); print(out, P.size)
