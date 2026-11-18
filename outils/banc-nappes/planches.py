#!/usr/bin/env python3
# Les planches avant | après du banc photo des nappes (2026-11-18, finition des maps) :
#   python3 planches.py <dossier des PNG de banc.cjs grottevues> <dossier des planches> graine:palier:vue …   (vue = pire | lave)
# Les PNG : v-matin-g<graine>-<paysage|portrait>-<vue>-<avant|apres>.png (banc.cjs grottevues --suf=-avant / -apres, vues de outils/banc-nappes).
# Une planche par graine et par vue : en haut le PAYSAGE 844×390 (avant | après), en bas le PORTRAIT 390×844 (avant | après), légende incrustée ; JPEG ≤ 450 Ko.
import sys, os
from PIL import Image, ImageDraw, ImageFont
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
try: F = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 20)
except Exception: F = ImageFont.load_default()
def tag(im, t):
    d = ImageDraw.Draw(im); w = d.textlength(t, font=F); d.rectangle([6, 6, 18 + w, 36], fill=(0, 0, 0)); d.text((12, 9), t, fill=(255, 230, 120), font=F); return im
TITRE = {'pire': 'vue du pire mur peint (banc Node)', 'lave': 'au ras du lac de lave'}
for sc in sys.argv[3:]:
    g, pal, vue = sc.split(':')
    nom = lambda fmt, ver: os.path.join(src, 'v-matin-g%s-%s-%s-%s.png' % (g, fmt, vue, ver))
    try: P = {(f, v): Image.open(nom(f, v)).convert('RGB') for f in ('paysage', 'portrait') for v in ('avant', 'apres')}
    except FileNotFoundError as e: print('manque', e.filename); continue
    W = 844 * 2 + 12; H = 40 + 390 + 12 + 844
    pl = Image.new('RGB', (W, H), (14, 12, 18))
    pl.paste(tag(P['paysage', 'avant'], 'AVANT'), (0, 40)); pl.paste(tag(P['paysage', 'apres'], 'APRÈS (la rive)'), (856, 40))
    pl.paste(tag(P['portrait', 'avant'], 'AVANT'), (844 - 390 - 30, 40 + 390 + 12)); pl.paste(tag(P['portrait', 'apres'], 'APRÈS'), (856 + 30, 40 + 390 + 12))
    d = ImageDraw.Draw(pl)
    d.text((12, 8), 'GROTTE, nappes : graine %s, palier %s, matin, ?tel=1 — %s — iPhone paysage (haut), portrait (bas)' % (g, pal, TITRE.get(vue, vue)), fill=(235, 235, 245), font=F)
    out = os.path.join(dst, 'nappes-g%s-p%s-%s.jpg' % (g, pal, vue))
    for q in (86, 80, 74, 68, 62, 56, 50):
        pl.save(out, 'JPEG', quality=q, optimize=True)
        if os.path.getsize(out) <= 450 * 1024: break
    print(out, os.path.getsize(out) // 1024, 'Ko')
