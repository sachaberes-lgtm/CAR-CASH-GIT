# LA PLANCHE AVANT / APRÈS (2026-11-21, lot « boutiquefluide ») : les captures du même écran (parcours.cjs --photo 1), et l'écart pixel par pixel
# (moyenne sur 255, part des pixels qui bougent de plus de 8, de plus de 32). La caisse du plateau vit (reflets, roues, halo) : deux essais « avant » entre eux
# ne sont pas identiques non plus — la planche donne aussi cet écart-là (le bruit), à comparer.
#   python3 outils/banc-boutiquefluide/planche.py <sortie.png> <préfixe avant> <préfixe après> [<préfixe avant n°2>]
#   ex. : … planche.png /chemin/ab2/2-sans /chemin/ab2/3-avec /chemin/ab3/3-sans      (les fichiers : <préfixe>-boutique.png, -peinture, -aile, -figure)
import sys, os
from PIL import Image, ImageChops, ImageDraw
sortie, A, B = sys.argv[1], sys.argv[2], sys.argv[3]; C = sys.argv[4] if len(sys.argv) > 4 else None
def ecart(a, b):
    df = ImageChops.difference(a, b).convert('L'); h = df.histogram(); n = sum(h)
    return df, sum(i * c for i, c in enumerate(h)) / n, sum(h[9:]) / n, sum(h[33:]) / n
lignes = []
for e in ['boutique', 'peinture', 'aile', 'figure']:
    fa, fb = A + '-' + e + '.png', B + '-' + e + '.png'
    if not (os.path.exists(fa) and os.path.exists(fb)): continue
    a, b = Image.open(fa).convert('RGB'), Image.open(fb).convert('RGB')
    df, moy, p8, p32 = ecart(a, b)
    t = f'{e}: avant/après écart moyen {moy:.2f}/255 · > 8 : {p8*100:.2f} % · > 32 : {p32*100:.2f} %'
    if C and os.path.exists(C + '-' + e + '.png'):
        _, m2, q8, q32 = ecart(a, Image.open(C + '-' + e + '.png').convert('RGB')); t += f'   |   avant/avant (bruit) {m2:.2f}/255 · > 8 : {q8*100:.2f} % · > 32 : {q32*100:.2f} %'
    print(t); lignes.append((e, a, b, df.point(lambda v: min(255, v * 4)).convert('RGB'), t))
if lignes:
    w, h0 = lignes[0][1].size; s = 0.4; W, H = int(w * s), int(h0 * s)
    P = Image.new('RGB', (W * 3 + 40, (H + 34) * len(lignes)), (20, 20, 24)); D = ImageDraw.Draw(P)
    for k, (e, a, b, df, t) in enumerate(lignes):
        y = k * (H + 34)
        for j, im in enumerate([a, b, df]): P.paste(im.resize((W, H)), (j * (W + 20), y + 30))
        D.text((6, y + 4), 'avant (sans=boutiquefluide) | après | écart ×4', fill=(235, 235, 235)); D.text((6, y + 16), t[:200], fill=(200, 200, 120))
    P.save(sortie); print('planche :', sortie)
