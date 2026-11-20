# (2026-11-18, rôle VOIR) planche-contact d'une suite d'images du banc voir-course.cjs, avec les relevés sous chaque vignette
#   python3 -I outils/banc-espace/voir-planche.py <resultat.json> <cas> <module> <sortie.jpg> [colonnes=8] [pas=1] [debut=0] [fin=999]
import json, sys, os
from PIL import Image, ImageDraw
res, cas, mod, sortie = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
opt = dict(a.split('=') for a in sys.argv[5:])
COL, PAS, DEB, FIN = int(opt.get('colonnes', 6)), int(opt.get('pas', 1)), int(opt.get('debut', 0)), int(opt.get('fin', 999))
R = json.load(open(res))
racine = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
C = [c for c in R['cas'] if c['nom'] == cas][0]
M = [m for m in C['modules'] if m['g'] == mod][0]
imgs = [r for r in M['images'] if DEB <= r['k'] <= FIN][::PAS]
TW = int(opt.get('larg', 150)); TH = int(TW * 844 / 390)
lig = (len(imgs) + COL - 1) // COL
P = Image.new('RGB', (COL * TW, lig * (TH + 46) + 30), (20, 20, 24))
d = ImageDraw.Draw(P)
d.text((6, 8), f"{cas} {mod} s{M['s0']}-{M['s1']} parts={','.join(M['parts'])} sauts={[(x[0], x[1], (x[2] or {}).get('ok') if isinstance(x[2], dict) else x[2]) for x in M['sauts']]} morts={len(M['morts'])}", fill=(255, 255, 255))
for i, r in enumerate(imgs):
    x, y = (i % COL) * TW, 30 + (i // COL) * (TH + 46)
    try:
        im = Image.open(os.path.join(racine, r['img'])).convert('RGB').resize((TW, TH))
        P.paste(im, (x, y))
    except Exception as e:
        d.text((x + 4, y + 4), str(e)[:30], fill=(255, 0, 0))
    t1 = f"{r['k']} t{r['t']} s{r['s']} {r['mode']} {r.get('mod') or 'liaison'}"
    t2 = f"h{r['h']} b{r['b']} up{r['carUpN']} ny{r['nyC']} cU{r['camUpN']} ch{r['champ']}"
    t3 = f"{r.get('obs','')[:22]} {('L'+str(r['camDansLune'])) if 'camDansLune' in r else ''} {('nb'+str(r['dNeb'])) if 'dNeb' in r else ''} {r.get('refus','')} {('vu'+str(r['volUN'])) if 'volUN' in r else ''}"
    col = (255, 120, 120) if (r.get('obs') or not r['champ'] or (r['mode'] == 'drive' and r['h'] < -0.6)) else (230, 230, 230)
    d.text((x + 3, y + TH + 2), t1, fill=col); d.text((x + 3, y + TH + 16), t2, fill=col); d.text((x + 3, y + TH + 30), t3, fill=col)
P.save(sortie, quality=80)
print(sortie, len(imgs), 'images')
