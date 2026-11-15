#!/usr/bin/env python3
# L'ÉCART ENTRE DEUX PHOTOS DE LA MÊME IMAGE (banc de l'ombre et de l'image reconstruite, 2026-11-15) : pixels qui diffèrent, écart maximal et moyen (sur 255),
# et au choix une image de l'écart amplifiée. Sans numpy (PIL seul).
#   python3 outils/banc-ombre-image/ecart.py a.png b.png [--crop x,y,l,h] [--seuil 2] [--carte ecart.png] [--k 8]
import sys
from PIL import Image, ImageChops
a = sys.argv[1:]; A = a.pop(0); B = a.pop(0); crop = None; seuil = 2; carte = None; k = 8
while a:
    x = a.pop(0)
    if x == '--crop': crop = [int(v) for v in a.pop(0).split(',')]
    elif x == '--seuil': seuil = int(a.pop(0))
    elif x == '--carte': carte = a.pop(0)
    elif x == '--k': k = float(a.pop(0))
ia = Image.open(A).convert('RGB'); ib = Image.open(B).convert('RGB')
if crop: bx = (crop[0], crop[1], crop[0] + crop[2], crop[1] + crop[3]); ia = ia.crop(bx); ib = ib.crop(bx)
d = ImageChops.difference(ia, ib)
px = list(d.getdata()); n = len(px)
m = [max(p) for p in px]
diff = sum(1 for v in m if v > 0); fort = sum(1 for v in m if v > seuil)
print(f'{n} px · différents {diff} ({100*diff/n:.3f} %) · > {seuil}/255 : {fort} ({100*fort/n:.3f} %) · max {max(m)} · moyen {sum(m)/n:.4f}')
if carte: d.point(lambda v: min(255, int(v * k))).save(carte)
