# CASH CAR — les ICÔNES 512×512 des passes, produits et badges (Roblox) : fond dégradé violet → rose, texte jaune gras cerné
# d'encre, un pictogramme dessiné ; pour une caisse, SA vignette du garage (Caisses/Vignettes/Vxx.luau) agrandie au pixel près.
#   python -I outils/vendre/icones.py <dossier de sortie>      (depuis ROBLOX/)
import base64, json, math, os, re, struct, sys
from PIL import Image, ImageDraw, ImageFont

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.normpath(os.path.join(ICI, '..', '..'))
SORTIE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, 'icones')
os.makedirs(SORTIE, exist_ok=True)
T = 512
OR, ENCRE, ROSE = (255, 215, 94), (26, 6, 40), (255, 62, 200)
POLICE = 'C:/Windows/Fonts/ariblk.ttf'

def police(taille):
    return ImageFont.truetype(POLICE, taille)

def fond():
    im = Image.new('RGB', (T, T))
    px = im.load()
    for y in range(T):
        for x in range(T):
            # le dégradé en diagonale : nuit violette en haut à gauche, rose néon en bas à droite
            k = min(1, max(0, (x * 0.35 + y * 0.9) / (T * 1.25)))
            a, b = (42, 12, 78), (214, 46, 160)
            px[x, y] = tuple(int(a[i] + (b[i] - a[i]) * k) for i in range(3))
    d = ImageDraw.Draw(im)
    # le liseré néon et le cadre octogonal du jeu (coins coupés)
    c = 34
    oct_ = [(c, 6), (T - c, 6), (T - 6, c), (T - 6, T - c), (T - c, T - 6), (c, T - 6), (6, T - c), (6, c)]
    d.polygon(oct_, outline=OR, width=10)
    return im

def texte(d, xy, s, taille, ancre='mm', couleur=OR, largeurMax=T - 70):
    f = police(taille)
    while d.textlength(s, font=f) > largeurMax and taille > 20:
        taille -= 4
        f = police(taille)
    d.text(xy, s, font=f, fill=couleur, anchor=ancre, stroke_width=max(4, taille // 9), stroke_fill=ENCRE)

def coeur(d, cx, cy, r, couleur=(255, 70, 110)):
    pts = []
    for i in range(64):
        t = i / 64 * 2 * math.pi
        x = 16 * math.sin(t) ** 3
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        pts.append((cx + x * r / 17, cy + y * r / 17))
    d.polygon(pts, fill=couleur, outline=ENCRE, width=6)

def etoile(d, cx, cy, r):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=OR, outline=ENCRE, width=7)

def eclair(d, cx, cy, r):
    pts = [(0.15, -1), (-0.55, 0.12), (-0.02, 0.12), (-0.25, 1), (0.6, -0.2), (0.05, -0.2), (0.35, -1)]
    d.polygon([(cx + x * r, cy + y * r) for x, y in pts], fill=(255, 160, 40), outline=ENCRE, width=7)

def piece(d, cx, cy, r):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=OR, outline=ENCRE, width=7)
    d.ellipse([cx - r * 0.72, cy - r * 0.72, cx + r * 0.72, cy + r * 0.72], outline=(200, 140, 30), width=5)
    d.text((cx, cy + 2), '$', font=police(int(r * 1.1)), fill=(150, 95, 10), anchor='mm')

def billet(d, cx, cy, r):
    d.rectangle([cx - r * 1.5, cy - r * 0.75, cx + r * 1.5, cy + r * 0.75], fill=(98, 224, 98), outline=ENCRE, width=7)
    d.ellipse([cx - r * 0.5, cy - r * 0.5, cx + r * 0.5, cy + r * 0.5], outline=(30, 110, 40), width=6)
    d.text((cx, cy + 2), '$', font=police(int(r * 0.8)), fill=(30, 110, 40), anchor='mm')

def roue(d, cx, cy, r):
    coul = [(255, 62, 200), (0, 234, 255), (255, 215, 94), (98, 224, 98), (255, 140, 40), (150, 90, 255)]
    for i in range(12):
        d.pieslice([cx - r, cy - r, cx + r, cy + r], i * 30, (i + 1) * 30, fill=coul[i % 6], outline=ENCRE, width=4)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=ENCRE, width=8)
    d.ellipse([cx - r * 0.18, cy - r * 0.18, cx + r * 0.18, cy + r * 0.18], fill=OR, outline=ENCRE, width=5)
    d.polygon([(cx - 20, cy - r - 24), (cx + 20, cy - r - 24), (cx, cy - r + 14)], fill=(255, 255, 255), outline=ENCRE, width=5)

def cadeau(d, cx, cy, r):
    d.rectangle([cx - r, cy - r * 0.55, cx + r, cy + r * 0.9], fill=(150, 90, 255), outline=ENCRE, width=7)
    d.rectangle([cx - r * 1.1, cy - r * 0.85, cx + r * 1.1, cy - r * 0.45], fill=(170, 110, 255), outline=ENCRE, width=7)
    d.rectangle([cx - r * 0.16, cy - r * 0.85, cx + r * 0.16, cy + r * 0.9], fill=OR, outline=ENCRE, width=5)

def vignette(indice):
    # le format de cuire-vignettes.js : base64 de mots u16 ; bit 15 = une SUITE de pixels transparents, sinon RGB555
    src = open(os.path.join(RACINE, 'src', 'ReplicatedStorage', 'CashCar', 'Caisses', 'Vignettes', 'V%02d.luau' % indice), encoding='utf-8').read()
    w, h = int(re.search(r'w = (\d+)', src).group(1)), int(re.search(r'h = (\d+)', src).group(1))
    data = base64.b64decode(re.search(r'd = "([^"]+)"', src).group(1))
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    px = im.load()
    k = 0
    for o in range(0, len(data) - 1, 2):
        m = struct.unpack_from('<H', data, o)[0]
        if m >= 0x8000:
            k += m - 0x8000
        elif k < w * h:
            r, g, b = (m >> 10) & 31, (m >> 5) & 31, m & 31
            px[k % w, k // w] = ((r * 255 + 15) // 31, (g * 255 + 15) // 31, (b * 255 + 15) // 31, 255)
            k += 1
    return im

def dessine(a):
    im = fond()
    d = ImageDraw.Draw(im)
    ic = a['icone']
    if 'vignette' in ic:
        v = vignette(ic['vignette'])
        f = 3
        v = v.resize((v.width * f, v.height * f), Image.NEAREST)
        # le plateau lumineux sous la caisse (la boutique fait pareil)
        d.ellipse([T / 2 - 200, 300, T / 2 + 200, 350], fill=(255, 140, 220))
        im.paste(v, (int(T / 2 - v.width / 2), int(318 - v.height * 0.88)), v)
        texte(d, (T / 2, 90), 'LEGENDARY', 46, couleur=(255, 255, 255))
        texte(d, (T / 2, 430), ic['petit'], 58)
    else:
        p = ic.get('picto')
        if p == 'coeur':
            n = ic.get('n', 1)
            for i in range(n):
                dx = (i - (n - 1) / 2) * 78
                coeur(d, T / 2 + dx, 170 - abs(dx) * 0.25, 74 if n == 1 else 58)
        elif p == 'etoile':
            etoile(d, T / 2, 160, 96)
        elif p == 'eclair':
            eclair(d, T / 2, 165, 100)
        elif p == 'pieces':
            n = ic.get('n', 1)
            for i in range(n):
                piece(d, T / 2 + (i - (n - 1) / 2) * 56, 175 - (i % 2) * 22, 60)
        elif p == 'billet':
            billet(d, T / 2, 165, 72)
        elif p == 'roue':
            roue(d, T / 2, 180, 105)
        elif p == 'cadeau':
            cadeau(d, T / 2, 175, 90)
        texte(d, (T / 2, 345), ic['gros'], 132)
        texte(d, (T / 2, 448), ic['petit'], 54, couleur=(255, 255, 255))
    return im

if __name__ == '__main__':
    arts = json.load(open(os.path.join(ICI, 'articles.json'), encoding='utf-8'))['articles']
    for a in arts:
        chemin = os.path.join(SORTIE, a['cle'] + '.png')
        dessine(a).save(chemin)
    # une planche pour juger d'un coup d'œil
    n = len(arts)
    col = 7
    pl = Image.new('RGB', (col * 170, ((n + col - 1) // col) * 170), (10, 6, 20))
    for i, a in enumerate(arts):
        pl.paste(Image.open(os.path.join(SORTIE, a['cle'] + '.png')).resize((160, 160)), ((i % col) * 170 + 5, (i // col) * 170 + 5))
    pl.save(os.path.join(SORTIE, '_planche.png'))
    print(n, 'icones dans', SORTIE)
