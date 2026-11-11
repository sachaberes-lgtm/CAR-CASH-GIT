#!/usr/bin/env python3
# planche.py <dossier> [<dossier2> …] : colle les img/*.jpg en planches de 6 (deux dossiers = avant au-dessus, après en dessous)
import sys, glob, os
from PIL import Image, ImageDraw
D = sys.argv[1:]
noms = sorted(os.path.basename(f) for f in glob.glob(os.path.join(D[0], 'img', '*.jpg')))
if os.environ.get('SEUL'): noms = [n for n in noms if any(s in n for s in os.environ['SEUL'].split(','))]
N = int(os.environ.get('N', 6))
for k in range(0, len(noms), N):
    lot = noms[k:k+N]; im0 = Image.open(os.path.join(D[0], 'img', lot[0])); r = im0.height / im0.width
    W = 300 if r > 1 else 640; H = int(W * r)
    pl = Image.new('RGB', (W * len(lot), H * len(D)), (20, 20, 20)); dr = ImageDraw.Draw(pl)
    for j, d in enumerate(D):
        for i, n in enumerate(lot):
            f = os.path.join(d, 'img', n)
            if os.path.exists(f): pl.paste(Image.open(f).resize((W, H)), (i * W, j * H))
            dr.text((i * W + 6, j * H + 4), n[:-4] + ' · ' + os.path.basename(d.rstrip('/')), fill=(255, 255, 255))
    out = os.path.join(D[-1], 'planche-%d.jpg' % (k // N)); pl.save(out, quality=84); print(out)
