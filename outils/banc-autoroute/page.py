#!/usr/bin/env python3
# La page des maquettes : python3 outils/banc-autoroute/page.py <dossier des prises (finales/)> → VERSION PRINCIPALE/maquettes-autoroute/
import os, sys, html
from PIL import Image
SRC = sys.argv[1]; ICI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ICI, '..', '..', 'VERSION PRINCIPALE', 'maquettes-autoroute'); os.makedirs(os.path.join(OUT, 'img'), exist_ok=True)
SCENES = [('paysage/nuages-soir', '0', 'Nuages · soir'), ('paysage/nuages-soir', '18', 'Nuages · soir · côté gauche'), ('paysage/jade-midi', '0', 'Pic de Jade · midi (béton clair)'),
          ('paysage/nuages-nuit', '0', 'Nuages · nuit'), ('portrait/nuages-soir', '0', 'Debout · soir')]
PISTES = [('avant', 'AUJOURD’HUI', 'La route actuelle : une ligne centrale, les rails roses.'),
          ('A', 'A · I-95', 'Un seul sens, 11 voies de 4,5 m. Bord gauche jaune, bord droit blanc, tirets blancs 3 m / 9 m suivis d’une ombre noire (béton de Floride), plots réfléchissants tous les 12 m, bandes rugueuses sur les accotements.'),
          ('B', 'B · TERRE-PLEIN', '2 × 5 voies et, au milieu, un terre-plein peint : double ligne jaune hachurée. La voiture part pile dessus.'),
          ('C', 'C · EXPRESS', 'Comme à Miami : à gauche 2 voies express derrière une double ligne blanche et des poteaux orange (peints à plat ici), « EXPRESS » écrit au sol ; à droite 8 voies.'),
          ('D', 'D · XXL', '5 voies de 10 m, traits gras, longs tirets OR (la signature CASH CAR), plots dorés. Le moins réaliste, le plus lisible à grande vitesse.')]
def img(sc, lat, p):
    f = os.path.join(SRC, sc, '%s-%s.jpg' % (lat, p))
    if not os.path.exists(f): return None
    n = '%s-%s-%s.jpg' % (sc.replace('/', '-'), lat, p); im = Image.open(f).convert('RGB')
    if im.width > 1400: im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
    if im.height > 1500: im = im.resize((round(im.width * 1500 / im.height), 1500), Image.LANCZOS)
    im.save(os.path.join(OUT, 'img', n), quality=84, optimize=True); return n
parts = []
for p, titre, txt in PISTES:
    figs = []
    for sc, lat, lab in SCENES:
        n = img(sc, lat, p)
        if n: figs.append('<figure class="%s"><img src="img/%s" loading="lazy" alt=""><figcaption>%s</figcaption></figure>' % ('deb' if sc.startswith('portrait') else '', n, html.escape(lab)))
    lien = '../index.html?autoroute=%s' % ('A' if p == 'avant' else p)
    essai = '' if p == 'avant' else '<a class="jouer" href="%s">JOUER AVEC %s</a>' % (lien, p)
    parts.append('<section id="%s"><h2>%s</h2><p>%s</p>%s<div class="g">%s</div></section>' % (p, html.escape(titre), html.escape(txt), essai, ''.join(figs)))
page = '''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Autoroute de Floride</title><style>
@font-face{font-family:'Press Start 2P';src:url('../assets/fonts/pressstart2p.woff2') format('woff2');}
:root{--fond:#0d0c10;--encre:#f3f1ea;--or:#ffd75e;--gris:#8d8a93}
body{margin:0;background:var(--fond);color:var(--encre);font-family:'Press Start 2P',monospace;font-size:11px;line-height:1.9}
header,section{padding:28px 16px;max-width:1500px;margin:0 auto}h1{font-size:16px;color:var(--or);margin:0 0 12px}h2{font-size:13px;color:var(--or);margin:0 0 8px}
p{color:var(--gris);max-width:900px;margin:0 0 12px}section{border-top:2px solid #26242c}
.g{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px}figure{margin:0;flex:0 0 auto}figure img{display:block;height:300px;width:auto;border-radius:4px}
figure.deb img{height:300px}figcaption{color:var(--gris);font-size:9px;margin-top:4px}
.jouer{display:inline-block;margin:0 0 12px;padding:8px 12px;border:2px solid var(--or);color:var(--or);text-decoration:none}
@media(max-width:700px){figure img,figure.deb img{height:210px}}
</style></head><body><header><h1>AUTOROUTE DE FLORIDE · 4 MAQUETTES</h1>
<p>La vraie route du jeu, même image figée, peinte de chaque piste. Les vignettes défilent de côté. « JOUER AVEC » lance une partie avec la piste peinte.</p></header>
''' + '\n'.join(parts) + '\n</body></html>\n'
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(page); print(os.path.join(OUT, 'index.html'))
