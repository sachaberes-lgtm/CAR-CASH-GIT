# Les photos du banc du menu au chaud : la caisse (rognée autour d'elle) et l'image entière, froid / froid encore (le bruit) / chaud / froid de retour.
#   python3 outils/banc-menuchaud/compare.py <dossier des prises> <essai> [<dossier de sortie de la planche>]
# Pour chaque paire : pixels différents (sur 255, seuil 0 et seuil 8) et écart moyen. Une ligne JSON. Planche JPEG (petite) si un dossier de sortie est donné.
import sys, os, json
from PIL import Image, ImageChops, ImageDraw
src, essai = sys.argv[1], sys.argv[2]
def im(tag, quoi): return Image.open(os.path.join(src, f'{essai}-{tag}-{quoi}.png')).convert('RGB')
def ecart(a, b):
    d = ImageChops.difference(a, b).convert('L'); h = d.histogram(); n = a.width * a.height
    return {'px': n, 'diff0': n - h[0], 'diff8': sum(h[9:]), 'moyen': round(sum(i * c for i, c in enumerate(h)) / n, 3), 'max': max(i for i, c in enumerate(h) if c)}
R = {}
for quoi in ('caisse', 'jeu'):
    R[quoi] = {'bruit froid1/froid2': ecart(im('froid1', quoi), im('froid2', quoi)), 'froid1/chaud': ecart(im('froid1', quoi), im('chaud', quoi)), 'froid1/froid3 (retour)': ecart(im('froid1', quoi), im('froid3', quoi))}
if len(sys.argv) > 3:
    dst = sys.argv[3]; os.makedirs(dst, exist_ok=True)
    a, b = im('froid1', 'caisse'), im('chaud', 'caisse'); d = ImageChops.difference(a, b).point(lambda v: min(255, v * 8))
    w, h = a.size; P = Image.new('RGB', (w * 3 + 40, h + 30), (20, 20, 24)); g = ImageDraw.Draw(P)
    for j, (t, x) in enumerate((('froid', a), ('chaud', b), ('ecart x8', d))): g.text((10 + j * (w + 10), 4), t, fill=(255, 255, 255)); P.paste(x, (10 + j * (w + 10), 22))
    P.save(os.path.join(dst, 'planche-caisse.jpg'), quality=85)
    j1, j2 = im('froid1', 'jeu'), im('chaud', 'jeu'); s = (j1.width // 4, j1.height // 4)
    Q = Image.new('RGB', (s[0] * 2 + 30, s[1] + 30), (20, 20, 24)); g = ImageDraw.Draw(Q)
    for j, (t, x) in enumerate((('froid', j1), ('chaud', j2))): g.text((10 + j * (s[0] + 10), 4), t, fill=(255, 255, 255)); Q.paste(x.resize(s, Image.LANCZOS), (10 + j * (s[0] + 10), 22))
    Q.save(os.path.join(dst, 'planche-decor.jpg'), quality=80)
print(json.dumps(R))
