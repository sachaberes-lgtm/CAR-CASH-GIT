#!/usr/bin/env python3
# La page de la ROUTE VIVANTE : python3 outils/banc-autoroute/page-vivante.py <dossier du tour (une map par sous-dossier)> → VERSION PRINCIPALE/maquettes-autoroute/index.html
import os, sys, html, json, glob, re
from PIL import Image
SRC = sys.argv[1]; ICI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ICI, '..', '..', 'VERSION PRINCIPALE', 'maquettes-autoroute'); os.makedirs(os.path.join(OUT, 'vivante'), exist_ok=True)
NOMS = {'voie+': 'une voie s’ouvre', 'voie-': 'une voie se ferme', 'express+': 'l’express revient', 'express-': 'fin de l’express', 'acces': 'accès express',
        'acces-': 'fin de l’accès', 'ilot': 'l’îlot s’ouvre', 'ilot-': 'l’îlot se referme', 'centre+': 'terre-plein', 'centre-': 'fin du terre-plein',
        'large': 'grand large', 'large-': 'fin du grand large', 'plein': 'lignes pleines', 'plein-': 'fin des lignes pleines', 'peinture': 'peinture refaite',
        'calme': 'palier', 'depart': 'départ'}
CARTES = {'nuages': 'Nuages', 'ville': 'Ville', 'canyon': 'Canyon', 'grotte': 'Grotte', 'jade': 'Pic de Jade', 'espace': 'Orbite', 'dunes': 'Dunes', 'orage': 'Orage'}
def petit(f, n, h=520):
    im = Image.open(f).convert('RGB')
    if im.height > h: im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    im.save(os.path.join(OUT, 'vivante', n), quality=84, optimize=True); return n
parts = []
DIRS = sys.argv[1:] if len(sys.argv) > 2 else sorted(glob.glob(os.path.join(SRC, '*')))  # plusieurs dossiers : dans cet ordre (un nom « carte-météo libellé »)
for d in DIRS:
    if not os.path.isdir(d) or not os.path.exists(os.path.join(d, 'scenario.json')): continue
    base = os.path.basename(os.path.normpath(d)); carte, meteo = base.split('-', 1); sc = json.load(open(os.path.join(d, 'scenario.json'))); base = re.sub(r'[^a-z0-9-]+', '-', base.lower())
    st = sc.get('stats') or {}
    evs = [NOMS.get(g['ev'], g['ev']) for g in sc.get('segments', [])[1:] if g['ev'] not in ('calme', 'peinture')]
    figs = []
    av = os.path.join(d, 'avant.jpg')
    if os.path.exists(av): figs.append('<figure><img src="vivante/%s" loading="lazy" alt=""><figcaption>avant (la ligne centrale)</figcaption></figure>' % petit(av, base + '-avant.jpg'))
    for f in sorted(glob.glob(os.path.join(d, '[0-9][0-9]-*.jpg'))):
        m = re.match(r'(\d+)-(\d+)-(.*)\.jpg', os.path.basename(f)); sv, ev = int(m.group(2)), m.group(3)
        lab = ('palier · ' + NOMS.get(ev[7:], ev[7:])) if ev.startswith('palier-') else NOMS.get(ev, ev)
        figs.append('<figure><img src="vivante/%s" loading="lazy" alt=""><figcaption>%d m · %s</figcaption></figure>' % (petit(f, base + '-' + os.path.basename(f)), sv, html.escape(lab)))
    pa = os.path.join(d, 'partition.png'); part = ''
    if os.path.exists(pa):
        Image.open(pa).save(os.path.join(OUT, 'vivante', base + '-partition.png')); part = '<img class="part" src="vivante/%s-partition.png" loading="lazy" alt="">' % base
    parts.append('<section><h2>%s · %s</h2><p>%d m · %s</p>%s<div class="g">%s</div></section>' % (
        html.escape(CARTES.get(carte, carte).upper()), html.escape(meteo), round(sc.get('L', 0)), html.escape(' → '.join(evs) or 'un seul palier'), part, ''.join(figs)))
page = '''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>La route vivante</title><style>
@font-face{font-family:'Press Start 2P';src:url('../assets/fonts/pressstart2p.woff2') format('woff2');}
:root{--fond:#0d0c10;--encre:#f3f1ea;--or:#ffd75e;--gris:#8d8a93}
body{margin:0;background:var(--fond);color:var(--encre);font-family:'Press Start 2P',monospace;font-size:11px;line-height:1.9}
header,section{padding:24px 16px;max-width:1600px;margin:0 auto}h1{font-size:16px;color:var(--or);margin:0 0 12px}h2{font-size:12px;color:var(--or);margin:0 0 6px}
p{color:var(--gris);max-width:980px;margin:0 0 12px}section{border-top:2px solid #26242c}
.part{display:block;max-width:100%;height:auto;margin:0 0 10px;border-radius:4px}
.g{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px}figure{margin:0;flex:0 0 auto}figure img{display:block;height:260px;width:auto;border-radius:4px}
figcaption{color:var(--gris);font-size:9px;margin-top:4px}
.liens a{display:inline-block;margin:0 10px 10px 0;padding:8px 12px;border:2px solid var(--or);color:var(--or);text-decoration:none}
@media(max-width:700px){figure img{height:180px}}
</style></head><body><header><h1>LA ROUTE VIVANTE</h1>
<p>La C (95 Express) est la base. Tous les 1 à 2 km, la route change UNE seule chose, en douceur sur 400 à 650 m : une voie s’ouvre ou se ferme, un accès express (la double ligne en tirets, sans poteaux), l’îlot hachuré, le terre-plein au milieu, le grand large (tirets longs, dorés sur les maps à la signature), les lignes pleines. La peinture vit aussi : plus ou moins usée, ombre noire ou non, plots, bandes rugueuses. Chaque map a son caractère, chaque piste son scénario.</p>
<p>La partition : la piste vue d’avion et redressée, on roule vers le haut ; orange = poteaux, hachures = îlots, cadres = mots et flèches peints au sol.</p>
<div class="liens"><a href="../index.html">JOUER</a><a href="../index.html?autoroute=0">AVANT</a><a href="../index.html?autoroute=fige">LA C SEULE</a><a href="maquettes.html">LES 4 MAQUETTES</a></div></header>
''' + '\n'.join(parts) + '\n</body></html>\n'
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(page); print(os.path.join(OUT, 'index.html'))
