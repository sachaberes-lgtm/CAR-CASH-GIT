#!/usr/bin/env python3
# LA PLANCHE AVANT | APRÈS (2026-11-18, finition des maps) — planche.py <dossier du banc> <sortie.jpg> <légende> <prise> [<prise>…]
#   <prise> = « meteo-g<graine>-<format>-<k> » (ex. midi-g7-paysage-1) : met côte à côte avant-<prise>.png et apres-<prise>.png, une rangée par prise,
#   la légende incrustée. JPEG ≤ 450 Ko (la qualité baisse jusqu'à tenir).
import sys, os, io
from PIL import Image, ImageDraw, ImageFont

def police(t):
    for f in ('/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/System/Library/Fonts/Helvetica.ttc'):
        try: return ImageFont.truetype(f, t)
        except Exception: pass
    return ImageFont.load_default()

def main():
    dos, sortie, leg = sys.argv[1], sys.argv[2], sys.argv[3]
    rangs = []
    for p in sys.argv[4:]:
        a = Image.open(os.path.join(dos, 'avant-%s.png' % p)).convert('RGB')
        b = Image.open(os.path.join(dos, 'apres-%s.png' % p)).convert('RGB')
        w = 760 if a.width > a.height else 380
        h = round(a.height * w / a.width)
        rangs.append((p, a.resize((w, h), Image.LANCZOS), b.resize((w, h), Image.LANCZOS)))
    G, T = 8, 30
    W = max(2 * r[1].width + 3 * G for r in rangs)
    H = sum(r[1].height + T + G for r in rangs) + T + G
    pl = Image.new('RGB', (W, H), (10, 12, 22))
    d = ImageDraw.Draw(pl); f = police(18); fp = police(15)
    d.text((G, 6), leg, fill=(232, 238, 242), font=f)
    y = T + G
    for p, a, b in rangs:
        d.text((G, y + 4), 'AVANT  ' + p, fill=(200, 205, 215), font=fp)
        d.text((2 * G + a.width, y + 4), 'APRÈS  ' + p, fill=(255, 215, 94), font=fp)
        y += T
        pl.paste(a, (G, y)); pl.paste(b, (2 * G + a.width, y))
        y += a.height + G
    for q in (88, 82, 76, 70, 64, 58):
        buf = io.BytesIO(); pl.save(buf, 'JPEG', quality=q, optimize=True)
        if buf.tell() <= 450 * 1024: break
    open(sortie, 'wb').write(buf.getvalue())
    print(sortie, buf.tell() // 1024, 'Ko', 'q', q)

if __name__ == '__main__':
    main()
