# LA PLANCHE DU BANC DES FLAMMES : les images d'un film (banc.cjs) en grille, recadrées autour de la caisse, une rangée par scène.
#   python3 outils/banc-flammesnitro/planche.py <dossier> <sortie.jpg> <motif1> [<motif2> …]   (motif : préfixe d'images, ex. avant-c4-tonneau)
#   options d'environnement : PL_N (images par rangée, 8), PL_DE (première image, 0), PL_PAS (pas entre images, 2), PL_L (largeur d'une case, 300)
import sys, os, glob
from PIL import Image, ImageDraw
d, out, motifs = sys.argv[1], sys.argv[2], sys.argv[3:]
N, DE, PAS, L = int(os.environ.get('PL_N', 8)), int(os.environ.get('PL_DE', 0)), int(os.environ.get('PL_PAS', 2)), int(os.environ.get('PL_L', 300))
rangs = []
for m in motifs:
    fs = sorted(glob.glob(os.path.join(d, m + '-[0-9][0-9][0-9].jpg')))
    fs = [f for f in fs if int(f[-7:-4]) >= DE][::max(1, PAS // 2)][:N]
    rangs.append((m, fs))
im0 = Image.open(rangs[0][1][0]); W, H = im0.size
cx0, cy0, cw, chh = int(W * .22), int(H * .22), int(W * .56), int(H * .7)  # la caisse est au milieu, un peu bas
h = int(L * chh / cw)
P = Image.new('RGB', (N * L, len(rangs) * (h + 18)), (16, 16, 20)); dr = ImageDraw.Draw(P)
for r, (m, fs) in enumerate(rangs):
    dr.text((4, r * (h + 18) + 2), m, fill=(255, 220, 160))
    for i, f in enumerate(fs):
        c = Image.open(f).crop((cx0, cy0, cx0 + cw, cy0 + chh)).resize((L, h), Image.LANCZOS)
        P.paste(c, (i * L, r * (h + 18) + 18)); dr.text((i * L + 4, r * (h + 18) + 20), os.path.basename(f)[-7:-4], fill=(255, 255, 255))
P.save(out, quality=82); print(out, P.size)
