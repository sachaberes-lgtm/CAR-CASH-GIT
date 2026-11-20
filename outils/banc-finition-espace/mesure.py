#!/usr/bin/env python3
# LA MESURE DES TROIS DÉFAUTS (2026-11-19, finition des maps : « terne la nuit, des fois trop rouge, des fois trop éblouissant ») — mesure.py <image> [<image>…]
#   Par image et par TIERS (haut, milieu, bas) : L = luminance moyenne (Rec.709 sur le sRGB, 0-255) · C = chroma moyen (max − min des canaux, 0-255)
#   · brûlé = % de pixels dont les trois canaux dépassent 245 (l'éblouissement) · rouge = % de rouge-orange VIF (teinte 0-40°, saturation > .55, R > 150, R − B > 80)
#   · noir = % de pixels bouchés (tous les canaux < 8). Sans numpy : l'image est réduite à 422 px de large d'abord (les pourcentages n'en dépendent presque pas).
#   Sortie : une ligne par image, puis `--json` pour la machine.
import sys, json, colorsys
from PIL import Image

def mesure(chemin):
    im = Image.open(chemin).convert('RGB')
    w = 422; h = max(1, round(im.height * w / im.width)); im = im.resize((w, h), Image.BOX)
    px = list(im.getdata()); tiers = []
    for t in range(3):
        a, b = t * h // 3, (t + 1) * h // 3
        n = 0; sL = sC = br = rg = nr = 0
        for y in range(a, b):
            for r, g, bb in px[y * w:(y + 1) * w]:
                n += 1; mx = max(r, g, bb); mn = min(r, g, bb)
                sL += .2126 * r + .7152 * g + .0722 * bb; sC += mx - mn
                if mn > 245: br += 1
                if mx < 8: nr += 1
                if r > 150 and r - bb > 80 and mx > 0 and (mx - mn) / mx > .55:
                    hh = colorsys.rgb_to_hsv(r / 255, g / 255, bb / 255)[0] * 360
                    if hh <= 40 or hh >= 350: rg += 1
        tiers.append({'L': round(sL / n, 1), 'C': round(sC / n, 1), 'brule': round(100 * br / n, 2), 'rouge': round(100 * rg / n, 2), 'noir': round(100 * nr / n, 2)})
    tout = {k: round(sum(t[k] for t in tiers) / 3, 2) for k in tiers[0]}
    return {'image': chemin, 'tout': tout, 'tiers': tiers}

if __name__ == '__main__':
    js = '--json' in sys.argv; res = [mesure(p) for p in sys.argv[1:] if p != '--json']
    if js: print(json.dumps(res, ensure_ascii=False))
    else:
        for r in res:
            t = r['tout']
            print('%-48s L %5.1f  C %5.1f  brûlé %5.2f %%  rouge %5.2f %%  noir %5.2f %%   | tiers L %s' % (r['image'].split('/')[-1][:48], t['L'], t['C'], t['brule'], t['rouge'], t['noir'],
                  '/'.join('%.0f' % x['L'] for x in r['tiers'])))
