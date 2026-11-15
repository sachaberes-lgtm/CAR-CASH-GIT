#!/usr/bin/env python3
# LE BANC DE LA CAISSE — la planche des traînées achetées : pour chaque traînée et vitesse, AVANT | APRÈS | VÉRITÉ (écran plein, sans loupe), recadrées sur
# la zone où l'avant et l'après diffèrent le plus (fenêtre l×h en pixels d'écran), agrandies au plus proche voisin (les pixels restent des pixels).
#   python3 outils/banc-caisse/planche-trx.py <dossier des toiles> <sortie.jpg> "<traînée-vitesse> …" [l h zoom]
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFont
src, out, keys = sys.argv[1], sys.argv[2], sys.argv[3].split()
L = int(sys.argv[4]) if len(sys.argv) > 4 else 420; Hh = int(sys.argv[5]) if len(sys.argv) > 5 else 260; Z = float(sys.argv[6]) if len(sys.argv) > 6 else 2
try: ft = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 18)
except Exception: ft = ImageFont.load_default()
rows = []
for k in keys:
    I = {n: Image.open(f'{src}/trx-{k}-{n}.png').convert('RGB') for n in ('avant', 'apres', 'verite')}
    d = ImageChops.difference(I['avant'], I['apres']).convert('L')
    W, H = d.size; s = d.resize((W // 20, H // 20), Image.BOX); best = (0, 0, 0)
    for y in range(0, s.height - Hh // 20):
        for x in range(0, s.width - L // 20):
            v = sum(s.crop((x, y, x + L // 20, y + Hh // 20)).getdata())
            if v > best[0]: best = (v, x * 20, y * 20)
    x0, y0 = best[1], best[2]; cr = (x0, y0, x0 + L, y0 + Hh)
    rows.append((k, [(n, I[n].crop(cr).resize((round(L * Z), round(Hh * Z)), Image.NEAREST)) for n in ('avant', 'apres', 'verite')], cr))
w, h = round(L * Z), round(Hh * Z); G, B = 6, 28
P = Image.new('RGB', (3 * w + 4 * G, len(rows) * (h + B + G) + G), (18, 14, 28)); dr = ImageDraw.Draw(P)
for r, (k, ims, cr) in enumerate(rows):
    for c, (n, im) in enumerate(ims):
        x = G + c * (w + G); y = G + r * (h + B + G)
        dr.text((x + 4, y + 4), f'{k} km/h · {n.upper()}' + (f'  (x{cr[0]} y{cr[1]}, ×{Z:g})' if c == 0 else ''), fill=(255, 235, 200), font=ft); P.paste(im, (x, y + B))
P.save(out, quality=88, optimize=True); print(out, P.size)
