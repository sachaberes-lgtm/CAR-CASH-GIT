# CASH CAR — LES IMAGES DE LA PAGE ROBLOX, 2/2 : l'icône 512×512 et les vignettes 1920×1080, composées depuis les photos de
# outils/vitrine.sh (python outils/vitrine.py). Le titre en pixels d'or vient de la police Press Start 2P livrée avec Roblox.
import os, glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter
S = os.path.join(os.environ.get('CASHCAR_BANC') or os.path.join(os.environ['TEMP'], 'cashcar-banc'), 'vitrine') + '/'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'publication') + '/'
os.makedirs(OUT, exist_ok=True)
FONT = sorted(glob.glob('C:/Users/sacha/AppData/Local/Roblox/Versions/*/content/fonts/PressStart2P-Regular.ttf'))[-1]

def titre_or(img, texte, x, y, taille, ombre=True):
    """CASH CAR en pixels d'or : contour brun épais, ombre portée, deux tons (or clair dessus, or foncé dessous)."""
    f = ImageFont.truetype(FONT, taille)
    d = ImageDraw.Draw(img)
    ep = max(3, taille // 9)
    if ombre:
        d.text((x + ep, y + ep * 2), texte, font=f, fill=(40, 16, 0))
    for dx in range(-ep, ep + 1, max(1, ep // 2)):
        for dy in range(-ep, ep + 1, max(1, ep // 2)):
            d.text((x + dx, y + dy), texte, font=f, fill=(60, 26, 2))
    # deux tons : on dessine le texte or clair, puis la moitié basse en or foncé (un masque)
    calque = Image.new('RGBA', img.size, (0, 0, 0, 0))
    dc = ImageDraw.Draw(calque)
    dc.text((x, y), texte, font=f, fill=(255, 226, 92, 255))
    bas = Image.new('RGBA', img.size, (0, 0, 0, 0))
    db = ImageDraw.Draw(bas)
    db.text((x, y), texte, font=f, fill=(255, 150, 20, 255))
    masque = Image.new('L', img.size, 0)
    ImageDraw.Draw(masque).rectangle([0, y + int(taille * 0.55), img.size[0], img.size[1]], fill=255)
    calque.paste(bas, (0, 0), Image.composite(bas, Image.new('RGBA', img.size, (0, 0, 0, 0)), masque).split()[3])
    img.alpha_composite(calque) if img.mode == 'RGBA' else img.paste(calque, (0, 0), calque)

# ── L'ICÔNE 512×512 : la caisse du titre qui tombe dans le ciel, CASH CAR en or ──
t = Image.open(S + 'titre.png').convert('RGB')
carre = t.crop((110, 100, 850, 840)).resize((512, 512), Image.LANCZOS)
ic = carre.convert('RGBA')
f = ImageFont.truetype(FONT, 92)
w = ImageDraw.Draw(ic).textlength('CASH', font=f)
titre_or(ic, 'CASH', int((512 - w) / 2), 292, 92)
w2 = ImageDraw.Draw(ic).textlength('CAR', font=f)
titre_or(ic, 'CAR', int((512 - w2) / 2), 400, 92)
ic.convert('RGB').save(OUT + 'icone-512.png')

# ── LES VIGNETTES 1920×1080 : 16:9 au centre (les boutons de Roblox, en haut à gauche, restent dehors) ──
def vignette(src, nom, x0=None, logo=False):
    im = Image.open(S + src).convert('RGB')
    W, H = im.size
    cw = int(H * 16 / 9)
    if x0 is None:
        x0 = (W - cw) // 2
    v = im.crop((x0, 0, x0 + cw, H)).resize((1920, 1080), Image.LANCZOS).convert('RGBA')
    if logo:
        titre_or(v, 'CASH CAR', 70, 60, 140)
    v.convert('RGB').save(OUT + nom)

vignette('nuages-4.png', 'vignette-1-nuages.png', logo=True)
vignette('espace-1.png', 'vignette-2-orbite.png')
vignette('ville-4.png', 'vignette-3-ville.png')
vignette('nuit-3.png', 'vignette-4-minuit.png')
vignette('nuages-3.png', 'vignette-5-vol.png')
print(sorted(os.listdir(OUT)))
