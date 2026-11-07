#!/usr/bin/env python3
# LA PLANCHE DE COMPARAISON : banc-couleurs/planche.html — une ligne par couple map × météo, les colonnes = les jeux de photos (img/ = avant, img-A/, img-B/…),
# avec les mesures sous chaque photo (L* moyen · chroma · route · noirs). python3 banc-couleurs/planche.py [img img-A img-B]
import os, sys, json, glob
ICI = os.path.dirname(os.path.abspath(__file__))
jeux = sys.argv[1:] or [d for d in ('img', 'img-A', 'img-B') if os.path.isdir(os.path.join(ICI, d))]
TITRES = {'img': 'AVANT (le jeu actuel)', 'img-A': 'PISTE A · équilibre doux', 'img-B': 'PISTE B · pop franc'}
ORDRE = ['nuages', 'crypto', 'ville', 'jade', 'foret', 'banquise', 'espace', 'grotte', 'canyon', 'dunes']
MET = ['matin', 'midi', 'soir', 'nuit', 'pluie', 'orage', 'orage-vert', 'orage-jaune', 'neige', 'glace']
NOMS = {'nuages': 'MER DE NUAGES', 'crypto': 'CRYPTO CITY', 'ville': 'CRYPTO CITY (nuit)', 'jade': 'PICS DE JADE', 'foret': 'LA FORÊT NOIRE', 'banquise': 'LE GLACIER', 'espace': 'EN ORBITE', 'grotte': 'LES PROFONDEURS', 'canyon': 'CANYON DES GÉANTS', 'dunes': "LES DUNES D'OR"}
def mes(jeu, nom):
    d = 'etal' if jeu == 'img' else 'etal-' + jeu[4:]
    try: M = json.load(open(os.path.join(ICI, d, nom + '.json')))['mesure']
    except Exception: return ''
    return 'L* %.0f · chroma %.0f · route L* %.0f · noirs %.0f %%' % (M['L'], M['C'], M['route']['L'], M['noirBas'] * 100)
couples = sorted({os.path.basename(f)[:-4] for j in jeux for f in glob.glob(os.path.join(ICI, j, '*.jpg'))},
                 key=lambda n: (ORDRE.index(n.split('-', 1)[0]) if n.split('-', 1)[0] in ORDRE else 99, MET.index(n.split('-', 1)[1]) if n.split('-', 1)[1] in MET else 99))
H = ['<!doctype html><meta charset=utf-8><title>Équilibre des maps — avant / après</title><style>body{background:#111;color:#eee;font:13px/1.4 -apple-system,Helvetica,sans-serif;margin:0;padding:12px}',
     'h1{font-size:18px;margin:0 0 8px}.row{display:grid;grid-template-columns:150px repeat(%d,1fr);gap:8px;align-items:center;margin-bottom:10px;border-top:1px solid #333;padding-top:8px}' % len(jeux),
     '.row img{width:100%;display:block;border-radius:4px}.m{font-size:11px;color:#aaa;margin-top:3px}.c{font-weight:600}.c small{display:block;color:#999;font-weight:400}.head{position:sticky;top:0;background:#111;z-index:2;padding:6px 0}.head .row{border:0;margin:0}.head b{font-size:14px}</style>',
     '<h1>Équilibre des maps — chaque couple map × météo, avant et après</h1>',
     '<div class=head><div class=row><div></div>' + ''.join('<div><b>%s</b></div>' % TITRES.get(j, j) for j in jeux) + '</div></div>']
for n in couples:
    c, m = n.split('-', 1)
    H.append('<div class=row><div class=c>%s<small>%s</small></div>' % (NOMS.get(c, c), m.upper()))
    for j in jeux:
        f = os.path.join(j, n + '.jpg')
        H.append('<div>%s<div class=m>%s</div></div>' % ('<img src="%s" loading=lazy>' % f if os.path.exists(os.path.join(ICI, f)) else '<div style="aspect-ratio:16/9;background:#222"></div>', mes(j, n)))
    H.append('</div>')
open(os.path.join(ICI, 'planche.html'), 'w', encoding='utf-8').write('\n'.join(H))
print('planche.html :', len(couples), 'couples ×', len(jeux), 'jeux')
