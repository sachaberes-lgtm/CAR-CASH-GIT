# LES PLANCHES DU LOT COULEURS (2026-11-19, finition des maps) : AVANT | APRÈS côte à côte, légende incrustée, JPEG ≤ 450 Ko.
#   python3 outils/banc-finition-couleurs/planches.py <sortie.jpg> <couche|debout> <titre> <avant.png> <après.png> [<avant.png> <après.png> …]
# Une ligne par paire (couché) ou une colonne par paire (debout) ; la légende = le nom du fichier d'après, sans le préfixe.
import sys, os
from PIL import Image, ImageDraw, ImageFont
out, fmt, titre = sys.argv[1], sys.argv[2], sys.argv[3]
paires = list(zip(sys.argv[4::2], sys.argv[5::2]))
try: F = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 20)
except Exception: F = ImageFont.load_default()
w, h = (844, 390) if fmt == 'couche' else (390, 844)
k = .62 if fmt == 'couche' else .42
tw, th = int(w * k), int(h * k)
if fmt == 'couche': W, H = tw * 2 + 6, (th + 4) * len(paires)
else: W, H = (tw * 2 + 10) * len(paires), th + 4
P = Image.new('RGB', (W, H), (10, 10, 20)); d = ImageDraw.Draw(P)
for i, (a, b) in enumerate(paires):
    for j, f in enumerate((a, b)):
        im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
        x, y = (j * (tw + 6), i * (th + 4)) if fmt == 'couche' else (i * (tw * 2 + 10) + j * (tw + 2), 0)
        P.paste(im, (x, y))
        lab = os.path.basename(b).split('-', 1)[1].rsplit('-', 1)[0] + ('  AVANT' if j == 0 else '  APRÈS')
        if fmt != 'couche': lab = lab.replace('nuages-', '').replace('ville-', 'ville ')
        d.text((x + 7, y + 7), lab, font=F, fill=(0, 0, 0)); d.text((x + 6, y + 6), lab, font=F, fill=(255, 230, 120))
q = 88
while True:
    P.save(out, 'JPEG', quality=q, optimize=True)
    if os.path.getsize(out) <= 450 * 1024 or q < 40: break
    q -= 6
print(out, os.path.getsize(out) // 1024, 'Ko', 'q', q, titre)
