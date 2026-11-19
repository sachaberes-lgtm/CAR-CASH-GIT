# (2026-11-18, rôle VOIR) quelques images côte à côte, à 300 px de large : python3 outils/banc-espace/voir-cote.py <sortie.jpg> <img1> <img2> … [larg=300]
import sys
from PIL import Image, ImageDraw
a = [x for x in sys.argv[2:] if not x.startswith('larg=')]; W = int(([x[5:] for x in sys.argv[2:] if x.startswith('larg=')] or ['300'])[0]); H = int(W * 1688 / 780)
P = Image.new('RGB', (W * len(a), H + 16), (0, 0, 0)); d = ImageDraw.Draw(P)
for i, f in enumerate(a):
    P.paste(Image.open(f).convert('RGB').resize((W, H)), (i * W, 16)); d.text((i * W + 3, 2), f.split('/')[-1][:44], fill=(255, 255, 255))
P.save(sys.argv[1], quality=85)
