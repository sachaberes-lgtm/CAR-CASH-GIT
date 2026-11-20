# PLANCHES DE LA CORRECTION 3 DE JADE (2026-11-20) : grilles de prises légendées, JPEG <= 450 Ko.
#   python3 planches-c3.py <dossier de prises> <sortie.jpg> <largeur d'une case> <colonnes> <prise sans .png> …
import sys, os
from PIL import Image, ImageDraw, ImageFont
P, out, W, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]); cells = sys.argv[5:]
F = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 15)
NOM = {'av': 'AVANT', 'fi': 'APRES', 'sa': 'SANS', 'ap': 'LOT e24873', 'k1': 'ESSAI 1', 'k2': 'ESSAI 2', 'k3': 'ESSAI 3'}
ims = []
for c in cells:
    f = os.path.join(P, c + '.png')
    if not os.path.exists(f): print('absent', c); continue
    im = Image.open(f).convert('RGB'); im = im.resize((W, int(im.height * W / im.width)), Image.LANCZOS)
    t, rest = c.split('-', 1); lab = NOM.get(t, t) + ' ' + rest.replace('-couche', '').replace('-debout', '')
    ImageDraw.Draw(im).text((6, 4), lab, font=F, fill=(255, 230, 120), stroke_width=2, stroke_fill=(0, 0, 0)); ims.append(im)
h = max(i.height for i in ims); rows = (len(ims) + cols - 1) // cols
C = Image.new('RGB', (cols * W + 4 * (cols - 1), rows * (h + 4)), (20, 20, 30))
for k, im in enumerate(ims): C.paste(im, ((k % cols) * (W + 4), (k // cols) * (h + 4)))
q = 84
while True:
    C.save(out, quality=q)
    if os.path.getsize(out) <= 450000 or q < 40: break
    q -= 6
print(os.path.basename(out), C.size, os.path.getsize(out) // 1024, 'Ko')
