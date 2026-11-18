#!/usr/bin/env python3
# LA PLANCHE DES MODULES (2026-11-18, finition des maps) — assemble les prises de banc-modules.py en JPEG ≤ 450 Ko.
#   python3 planche.py <dossier des prises> <sortie.jpg> <format paysage|portrait> <versions avant,apres> <figs a,b,c|*> [titre] [colonnes]
# Une case par (module, version), légende incrustée ; les versions côte à côte (avant | après) pour chaque module.
import sys, os, glob, re
from PIL import Image, ImageDraw, ImageFont
d, out, fmt, vers, figs = sys.argv[1:6]
titre = sys.argv[6] if len(sys.argv) > 6 else ''
ncol_mod = int(sys.argv[7]) if len(sys.argv) > 7 else (2 if fmt == 'paysage' else 4)
vers = vers.split(',')
pr = {}
for f in glob.glob(os.path.join(d, '*-%s.jpg' % fmt)):
    m = re.match(r'(avant|apres|sans)-(.+)-g(\d+)-%s\.jpg$' % fmt, os.path.basename(f))
    if m: pr.setdefault(m.group(2), {})[m.group(1)] = (f, m.group(3))
L = sorted(pr) if figs == '*' else [x for x in figs.split(',') if x in pr]
W, H = (420, 194) if fmt == 'paysage' else (176, 381)
try: fo = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 15); ft = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 20)
except Exception: fo = ft = ImageFont.load_default()
cw = W * len(vers) + 8; nr = (len(L) + ncol_mod - 1) // ncol_mod
top = 34 if titre else 4
im = Image.new('RGB', (cw * ncol_mod + 4, top + nr * (H + 6) + 4), (16, 18, 26)); dr = ImageDraw.Draw(im)
if titre: dr.text((8, 7), titre, fill=(240, 200, 90), font=ft)
for k, fig in enumerate(L):
    x0, y0 = 4 + (k % ncol_mod) * cw, top + (k // ncol_mod) * (H + 6)
    for j, v in enumerate(vers):
        if v not in pr[fig]: continue
        f, g = pr[fig][v]
        t = Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS)
        im.paste(t, (x0 + j * W, y0))
        lab = '%s · g%s · %s' % (fig, g, {'avant': 'AVANT', 'apres': 'APRÈS', 'sans': os.environ.get('LSANS', 'SANS (interrupteur)')}[v])
        dr.rectangle((x0 + j * W, y0, x0 + j * W + dr.textlength(lab, font=fo) + 8, y0 + 20), fill=(0, 0, 0))
        dr.text((x0 + j * W + 4, y0 + 2), lab, fill=(255, 255, 255), font=fo)
q = 86
while True:
    im.save(out, 'JPEG', quality=q, optimize=True)
    if os.path.getsize(out) <= 450 * 1024 or q < 40: break
    q -= 6
print(out, len(L), 'modules', os.path.getsize(out) // 1024, 'Ko', 'q', q)
