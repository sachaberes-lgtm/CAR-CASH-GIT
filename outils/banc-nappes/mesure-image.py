#!/usr/bin/env python3
# LA MESURE D'UNE PHOTO DU BANC (2026-11-19, finition des maps, Sacha : « terne la nuit », « trop rouge », « trop éblouissant ») :
#   python3 mesure-image.py photo.png [photo2.png …]
# Par tiers d'image (haut, milieu, bas) et en tout : luminance moyenne (Rec. 709, 0-255), chroma moyen (max-min des canaux), % de pixels BRÛLÉS (un canal > 245),
# % de ROUGE-ORANGE VIF (R > 150, R - B > 90, teinte 0-40°), % de NOIR (luminance < 12). Le HUD n'est pas masqué : comparer des photos de la même vue.
import sys
from PIL import Image

def mesure(px, w, y0, y1):
    n = lum = chro = brule = rouge = noir = 0
    for y in range(y0, y1, 2):
        for x in range(0, w, 2):
            r, g, b = px[x, y][:3]; n += 1
            l = .2126 * r + .7152 * g + .0722 * b; lum += l
            mx, mn = max(r, g, b), min(r, g, b); chro += mx - mn
            if mx > 245: brule += 1
            if l < 12: noir += 1
            if r > 150 and r - b > 90 and r >= g and (g - b) <= .67 * (r - b): rouge += 1
    return {'lum': round(lum / n, 1), 'chroma': round(chro / n, 1), 'brule%': round(100 * brule / n, 2), 'rouge%': round(100 * rouge / n, 2), 'noir%': round(100 * noir / n, 2)}

for f in sys.argv[1:]:
    im = Image.open(f).convert('RGB'); w, h = im.size; px = im.load()
    t = [mesure(px, w, 0, h // 3), mesure(px, w, h // 3, 2 * h // 3), mesure(px, w, 2 * h // 3, h)]
    tout = mesure(px, w, 0, h)
    print(f.split('/')[-1], 'TOUT', tout, '| haut', t[0], '| milieu', t[1], '| bas', t[2])
