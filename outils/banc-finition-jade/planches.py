# LES PLANCHES DE LA FINITION DE JADE (2026-11-18, finition des maps) : AVANT | APRÈS côte à côte, légende incrustée, JPEG ≤ 450 Ko.
#   python3 outils/banc-finition-jade/planches.py <dossier des prises> <dossier de sortie> <graine> <meteo>…
# Une planche par graine et par format : les météos en lignes, avant à gauche, après à droite (prises de photos.cjs : av-… et ap-…).
import sys, os
from PIL import Image, ImageDraw, ImageFont
src, out, g = sys.argv[1], sys.argv[2], sys.argv[3]
mets = sys.argv[4:]
os.makedirs(out, exist_ok=True)
try:
    F = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 22)
except Exception:
    F = ImageFont.load_default()
for fmt, (w, h) in (('couche', (844, 390)), ('debout', (390, 844))):
    if fmt == 'couche':
        k = .62; tw, th = int(w * k), int(h * k)
    else:
        k = .40; tw, th = int(w * k), int(h * k)
    rows = [m for m in mets if os.path.exists(f'{src}/av-{m}-g{g}-{fmt}.png') and os.path.exists(f'{src}/ap-{m}-g{g}-{fmt}.png')]
    if not rows: continue
    if fmt == 'couche':
        W, H = tw * 2 + 6, (th + 4) * len(rows)
        P = Image.new('RGB', (W, H), (10, 10, 20))
        for i, m in enumerate(rows):
            for j, t in enumerate(('av', 'ap')):
                im = Image.open(f'{src}/{t}-{m}-g{g}-{fmt}.png').convert('RGB').resize((tw, th), Image.LANCZOS)
                P.paste(im, (j * (tw + 6), i * (th + 4)))
                d = ImageDraw.Draw(P); x, y = j * (tw + 6) + 8, i * (th + 4) + 6
                lab = f"{m.upper()} g{g} {'AVANT' if t == 'av' else 'APRÈS'}"
                d.text((x + 1, y + 1), lab, font=F, fill=(0, 0, 0)); d.text((x, y), lab, font=F, fill=(255, 230, 120))
    else:
        W, H = (tw * 2 + 10) * len(rows), th + 4
        P = Image.new('RGB', (W, H), (10, 10, 20))
        for i, m in enumerate(rows):
            for j, t in enumerate(('av', 'ap')):
                im = Image.open(f'{src}/{t}-{m}-g{g}-{fmt}.png').convert('RGB').resize((tw, th), Image.LANCZOS)
                x0 = i * (tw * 2 + 10) + j * (tw + 2)
                P.paste(im, (x0, 0))
                d = ImageDraw.Draw(P)
                lab = f"{m} {'AV' if t == 'av' else 'AP'}"
                d.text((x0 + 7, 7), lab, font=F, fill=(0, 0, 0)); d.text((x0 + 6, 6), lab, font=F, fill=(255, 230, 120))
    q = 86
    while True:
        f = f'{out}/jade-g{g}-{fmt}-avant-apres.jpg'
        P.save(f, 'JPEG', quality=q, optimize=True)
        if os.path.getsize(f) <= 450 * 1024 or q < 40: break
        q -= 6
    print(f, os.path.getsize(f) // 1024, 'Ko', 'q', q)
