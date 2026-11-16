#!/usr/bin/env python3
# LA PARTITION DE LA ROUTE (2026-11-13) — le scénario d'une piste vu d'avion, redressé : la route monte (on roule vers le haut),
# une colonne par 1 600 m. Lit profil.json + scenario.json (banc route.py) ; écrit partition.png à côté.
#   python3 outils/banc-autoroute/partition.py <dossier d'une map>
import os, sys, json
from PIL import Image, ImageDraw, ImageFont
D = sys.argv[1]; pr = json.load(open(os.path.join(D, 'profil.json'))); sc = json.load(open(os.path.join(D, 'scenario.json')))
L, H = pr['L'], pr['H']; KX, KS, COL = 4.0, .25, 1600   # 4 px par mètre en travers, 1 px pour 4 m le long
NC = int((L + COL - 1) // COL); CW = int(2 * H * KX) + 150; CH = int(COL * KS) + 60
im = Image.new('RGB', (NC * CW + 20, CH), (16, 15, 20)); dr = ImageDraw.Draw(im)
try: F = ImageFont.truetype('/System/Library/Fonts/Supplemental/Courier New Bold.ttf', 12)
except Exception: F = ImageFont.load_default()
COUL = {0: (238, 234, 224), 1: (243, 193, 58), 2: (255, 215, 94)}
NOMS = {'voie+': 'voie +', 'voie-': 'voie −', 'express+': 'express +', 'express-': 'express −', 'acces': 'accès', 'acces-': 'fin accès',
        'ilot': 'îlot', 'ilot-': 'fin îlot', 'centre+': 'terre-plein', 'centre-': 'fin t.-plein', 'large': 'grand large', 'large-': 'fin large',
        'plein': 'lignes pleines', 'plein-': 'fin pleines', 'peinture': 'peinture', 'calme': '', 'depart': 'départ'}
def ou(sv, x):
    c = int(sv // COL); y = CH - 30 - (sv - c * COL) * KS; return c * CW + 130 + (x + H) * KX, y
for c in range(NC):
    x0 = c * CW + 130; dr.rectangle((x0, 30, x0 + 2 * H * KX, CH - 30), fill=(44, 40, 50))
    dr.text((x0, CH - 24), '%d → %d m' % (c * COL, min(L, (c + 1) * COL)), fill=(150, 146, 160), font=F)
for row in pr['rows']:
    sv, tr, zb, zi, postes, g = row[0], row[1], row[2], row[3], row[4], row[5]
    for z in (zb, zi):
        if z:
            xa, ya = ou(sv, z[0] - z[1]); xb, _ = ou(sv, z[0] + z[1])
            if int(sv // 8) % 3 == 0: dr.line((xa, ya, xb, ya - 2), fill=(170, 166, 158), width=1)
    if g > .5:
        for xx in (-H + 3 - .45, H - 3 + .45):
            xa, ya = ou(sv, xx); dr.line((xa - 1, ya, xa + 1, ya), fill=(70, 66, 74))
    for i in range(0, len(tr), 5):
        x, k, a = tr[i], tr[i + 1], tr[i + 2]; cd, ci = k % 4, k // 4; xa, ya = ou(sv, x)
        col = tuple(int(v * (.55 + .45 * min(1, a / .9))) for v in COUL.get(ci, COUL[0]))
        if cd == 1: dr.line((xa, ya, xa, ya - 2), fill=col, width=1)
        elif cd == 2 and int(sv // 8) % 2 == 0: dr.line((xa, ya, xa, ya - 1), fill=col, width=1)
        elif cd == 3 and int(sv // 12) % 3 == 0: dr.line((xa, ya, xa, ya - 3), fill=col, width=2)
    if postes and int(sv // 8) % 3 == 0:
        xa, ya = ou(sv, postes); dr.ellipse((xa - 1.5, ya - 1.5, xa + 1.5, ya + 1.5), fill=(255, 120, 30))
d = pr.get('dec') or []
for i in range(0, len(d), 5):
    s0, s1, x, w, cel = d[i:i + 5]; xa, ya = ou(s0, x - w); xb, yb = ou(s1, x + w)
    dr.rectangle((xa, yb, xb, ya), outline=(255, 255, 255) if cel == 0 else (120, 200, 255))
    dr.text((xb + 2, yb), 'EXPRESS' if cel == 0 else 'flèche', fill=(200, 200, 200), font=F)
for g in sc.get('segments', [])[1:]:
    for sv, pref in ((g['s0'], ''),):
        c = int(sv // COL); y = CH - 30 - (sv - c * COL) * KS
        dr.line((c * CW + 120, y, c * CW + 126, y), fill=(255, 120, 80), width=2)
        dr.text((c * CW + 4, y - 7), NOMS.get(g['ev'], g['ev']), fill=(255, 170, 140), font=F)
        y1 = CH - 30 - (min(g['s1'], (c + 1) * COL) - c * COL) * KS
        dr.line((c * CW + 126, y, c * CW + 126, y1), fill=(255, 120, 80), width=2)
dr.text((10, 8), 'LA PARTITION · %s · %d m · graine %s · %d poteaux' % (sc.get('carte'), L, sc.get('graine'), sc.get('poteaux') or 0), fill=(255, 215, 94), font=F)
im.save(os.path.join(D, 'partition.png')); print(os.path.join(D, 'partition.png'), im.size)
