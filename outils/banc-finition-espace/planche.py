#!/usr/bin/env python3
# LA PLANCHE AVANT | APRÈS (2026-11-18, finition des maps) — planche.py <dossier du banc> <sortie.jpg> <légende> <prise> [<prise>…]
#   <prise> = « meteo-g<graine>-<format>-<k> » (ex. midi-g7-paysage-1) : met côte à côte avant-<prise>.png et apres-<prise>.png (ou les colonnes de VERSIONS), une rangée par prise,
#   la légende incrustée. JPEG ≤ 450 Ko (la qualité baisse jusqu'à tenir).
import sys, os, io
from PIL import Image, ImageDraw, ImageFont

def police(t):
    for f in ('/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/System/Library/Fonts/Helvetica.ttc'):
        try: return ImageFont.truetype(f, t)
        except Exception: pass
    return ImageFont.load_default()

VERS = os.environ.get('VERSIONS', 'avant,apres').split(',')   # (tour 2) VERSIONS=avant,n1,apres,n3 : d'autres colonnes
NOMS = {'avant': 'AVANT', 'apres': 'APRÈS', 'sans': 'SANS (?sans=espacefini)'}

def main():
    dos, sortie, leg = sys.argv[1], sys.argv[2], sys.argv[3]
    rangs = []
    for p in sys.argv[4:]:
        ims = [Image.open(os.path.join(dos, '%s-%s.png' % (v, p))).convert('RGB') for v in VERS]
        a = ims[0]; w = (760 if a.width > a.height else 380) * 2 // len(VERS) if len(VERS) > 2 and a.width > a.height else (760 if a.width > a.height else 380)
        h = round(a.height * w / a.width)
        rangs.append((p, [x.resize((w, h), Image.LANCZOS) for x in ims]))
    G, T = 8, 30
    W = max(len(VERS) * r[1][0].width + (len(VERS) + 1) * G for r in rangs)
    H = sum(r[1][0].height + T + G for r in rangs) + T + G
    pl = Image.new('RGB', (W, H), (10, 12, 22))
    d = ImageDraw.Draw(pl); f = police(18); fp = police(15)
    d.text((G, 6), leg, fill=(232, 238, 242), font=f)
    y = T + G
    for p, ims in rangs:
        for i, (v, im) in enumerate(zip(VERS, ims)):
            x = G + i * (im.width + G)
            d.text((x, y + 4), NOMS.get(v, v.upper()) + '  ' + p, fill=(200, 205, 215) if i == 0 else (255, 215, 94), font=fp)
            pl.paste(im, (x, y + T))
        y += T + ims[0].height + G
    for q in (88, 82, 76, 70, 64, 58):
        buf = io.BytesIO(); pl.save(buf, 'JPEG', quality=q, optimize=True)
        if buf.tell() <= 450 * 1024: break
    open(sortie, 'wb').write(buf.getvalue())
    print(sortie, buf.tell() // 1024, 'Ko', 'q', q)

if __name__ == '__main__':
    main()
