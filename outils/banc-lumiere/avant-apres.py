#!/usr/bin/env python3
# PLANCHE AVANT / APRÈS (2026-11-13) : les prises de parcours.py (NOM=avant puis NOM=apres) côte à côte, une ligne par abscisse.
#   python3 outils/banc-lumiere/avant-apres.py <dossier des prises> <paysage|portrait> <sortie.jpg> [abscisses séparées par des virgules]
import sys, os, glob
from PIL import Image, ImageDraw
d, tel, out = sys.argv[1:4]
pos = sys.argv[4].split(',') if len(sys.argv) > 4 else sorted(os.path.basename(f).split('-')[2][:4] for f in glob.glob(os.path.join(d, 'avant-%s-*.jpg' % tel)))
W, H = (640, 296) if tel == 'paysage' else (300, 649)
if tel == 'paysage':
    pl = Image.new('RGB', (W * 2 + 4, (H + 4) * len(pos)), (255, 255, 255))
    for i, s in enumerate(pos):
        for j, k in enumerate(('avant', 'apres')): pl.paste(Image.open(os.path.join(d, '%s-%s-%s.jpg' % (k, tel, s))).resize((W, H)), (j * (W + 4), i * (H + 4)))
else:
    pl = Image.new('RGB', ((W * 2 + 10) * len(pos), H), (255, 255, 255))
    for i, s in enumerate(pos):
        for j, k in enumerate(('avant', 'apres')): pl.paste(Image.open(os.path.join(d, '%s-%s-%s.jpg' % (k, tel, s))).resize((W, H)), (i * (W * 2 + 10) + j * (W + 2), 0))
dr = ImageDraw.Draw(pl); dr.rectangle((0, 0, 50, 14), fill=(0, 0, 0)); dr.text((4, 2), 'AVANT', fill=(255, 255, 255)); dr.rectangle((W + 4, 0, W + 54, 14), fill=(0, 0, 0)); dr.text((W + 8, 2), 'APRES', fill=(255, 255, 255))
pl.save(out, quality=82); print(out, pl.size)
