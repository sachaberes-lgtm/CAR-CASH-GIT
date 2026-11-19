# LA MESURE DES COULEURS (2026-11-19, finition des maps, lot couleurs : « des maps ternes la nuit ou quand il pleut, des fois trop rouge, des fois trop éblouissant »).
#   python3 outils/banc-finition-couleurs/mesure.py <image.png|jpg>…   → une ligne TSV par image : l'image entière puis ses tiers (haut, milieu, bas)
# L    : luminance moyenne (Rec.709 sur les valeurs sRGB, 0-255)        → TERNE si basse la nuit / sous la pluie
# C    : chroma moyen (max − min des canaux, 0-255)                      → TERNE si bas (gris)
# brul : % de pixels BRÛLÉS (luminance > 245)                            → ÉBLOUISSANT
# rouge: % de pixels ROUGE-ORANGE VIFS (teinte 345°-45°, saturation ≥ 0,55, max ≥ 110) → TROP ROUGE
# RB   : R − B moyen (la température : > 0 chaud, < 0 froid)
# noir : % de pixels quasi noirs (luminance < 12)                         → masse noire
# Le HUD est masqué par le banc (photos.cjs) : seule l'image 3D compte. L'image est réduite ×1/3 (boîte) avant la mesure.
import sys, os
from PIL import Image
def mesure(px, w, y0, y1):
    n = 0; sL = sC = sRB = 0.0; br = ro = no = 0
    for y in range(y0, y1):
        for x in range(w):
            r, g, b = px[x, y]
            L = .2126 * r + .7152 * g + .0722 * b
            mx = max(r, g, b); mn = min(r, g, b); c = mx - mn
            sL += L; sC += c; sRB += r - b; n += 1
            if L > 245: br += 1
            if L < 12: no += 1
            if mx >= 110 and c >= .55 * mx and mx == r:
                h = 60 * ((g - b) / c) if c else 0   # teinte autour du rouge : −60..60
                if -15 <= h <= 45: ro += 1
    return (sL / n, sC / n, 100 * br / n, 100 * ro / n, sRB / n, 100 * no / n)
print('\t'.join(['image'] + [f'{k}{t}' for t in ('', '_h', '_m', '_b') for k in ('L', 'C', 'brul', 'rouge', 'RB', 'noir')]))
for f in sys.argv[1:]:
    im = Image.open(f).convert('RGB'); im = im.resize((max(1, im.width // 3), max(1, im.height // 3)), Image.BOX)
    w, h = im.size; px = im.load()
    v = list(mesure(px, w, 0, h))
    for k in range(3): v += mesure(px, w, h * k // 3, h * (k + 1) // 3)
    print('\t'.join([os.path.basename(f)] + [f'{x:.1f}' for x in v]))
