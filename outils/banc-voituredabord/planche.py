# Planches du banc voituredabord : caisse (pixels de l'écran ×3 en plus proche voisin) et décor (image entière réduite), crans 0 / 5 / effondré, avec et sans le lot.
#   python3 outils/banc-voituredabord/planche.py <dossier des prises> <dossier de sortie>
import sys, os
from PIL import Image, ImageDraw
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
crans = [('cran0', 'cran 0'), ('cran5', 'cran 5'), ('effondre', 'effondre')]
def grille(suffixe, f, nom):
    ims = {(e, c): Image.open(os.path.join(src, f'{e}-{c}-{suffixe}.png')).convert('RGB') for e in ('avec', 'sans') for c, _ in crans}
    w, h = f(next(iter(ims.values()))).size; P = Image.new('RGB', (w * 3 + 70, h * 2 + 70), (20, 20, 24)); d = ImageDraw.Draw(P)
    for j, (c, t) in enumerate(crans): d.text((50 + j * (w + 10), 6), t, fill=(255, 255, 255))
    for i, e in enumerate(('avec', 'sans')):
        d.text((4, 30 + i * (h + 20)), 'LOT' if e == 'avec' else 'AVANT', fill=(255, 220, 120))
        for j, (c, _) in enumerate(crans): P.paste(f(ims[(e, c)]), (50 + j * (w + 10), 24 + i * (h + 20)))
    P.save(os.path.join(dst, nom), quality=88)
grille('caisse', lambda im: im.resize((im.width * 3 // 2, im.height * 3 // 2), Image.NEAREST), 'planche-caisse.jpg')
grille('jeu', lambda im: im.resize((im.width // 3, im.height // 3), Image.LANCZOS), 'planche-decor.jpg')
print('ok')
