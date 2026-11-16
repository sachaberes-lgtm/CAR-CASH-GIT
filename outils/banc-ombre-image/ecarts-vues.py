#!/usr/bin/env python3
# Les écarts d'une vue à la suivante sur la MÊME image (sortie de banc.cjs : <tag>-<vue>.png), et le témoin (deux vues identiques) qui mesure le bruit du banc.
#   python3 outils/banc-ombre-image/ecarts-vues.py <dossier> [N1 N2] [--crop x,y,l,h]
import sys, os, subprocess
a = sys.argv[1:]; d = a.pop(0); crop = None
if '--crop' in a: i = a.index('--crop'); crop = a[i + 1]; del a[i:i + 2]
tags = a or ['N1', 'N2']
E = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ecart.py')
P = [('avant', 'temoin', 'bruit du banc (deux rendus identiques)'), ('temoin', 'ombre', 'ombre PCF9'), ('ombre', 'arete', 'arêtes de la loupe'),
     ('arete', 'trame', 'trame à l\'écran'), ('trame', 'efface', 'effacement tardif (doit être nul)')]
for t in tags:
    for x, y, nom in P:
        fa, fb = os.path.join(d, f'{t}-{x}.png'), os.path.join(d, f'{t}-{y}.png')
        if not (os.path.exists(fa) and os.path.exists(fb)): continue
        cmd = ['python3', E, fa, fb, '--carte', os.path.join(d, f'{t}-ecart-{y}.png'), '--k', '12'] + (['--crop', crop] if crop else [])
        r = subprocess.run(cmd, capture_output=True, text=True).stdout.strip()
        print(f'{t} {x}→{y} ({nom}) : {r}')
