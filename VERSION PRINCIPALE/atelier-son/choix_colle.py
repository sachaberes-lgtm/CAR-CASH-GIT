"""LES CHOIX DE LÉO COLLÉS DANS LA DISCUSSION → musique-moteur.json (2026-10-15, pôle SON).
   En ligne, la bibliothèque garde sur l'appareil de Léo l'ÉCART à l'instantané publié (suppressions, retraits de Pouce bleu, notes,
   pouces, rangements) ; « Copier mes choix » le met dans le presse-papiers sous la forme  CHOIX BIBLIOTHÈQUE {…}.
   Léo le colle dans la discussion ; on le rejoue ici sur musique-moteur.json (le même rejeu que ecartPose dans bibliotheque.html).
   python3 atelier-son/choix_colle.py <fichier contenant le texte collé>      (depuis VERSION PRINCIPALE ; --essai = montrer sans écrire)
   ⚠ musique-moteur.json est la donnée de Léo : jamais depuis un onglet ouvert sur une vieille copie ; un écart se rejoue sans risque
   (les mêmes retraits deux fois = une fois)."""
import json, os, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIER = os.path.join(RACINE, 'musique-moteur.json')
cle = lambda e: '%s|%s' % (e.get('n'), e.get('titre'))


def pose(p, d):
    for k in ('noms', 'place', 'notes', 'paliers'):
        o = d.get(k)
        if not o: continue
        p.setdefault(k, {})
        for x, v in o.items():
            if v is None: p[k].pop(x, None)
            else: p[k][x] = v
    for k in ('suppr', 'pouces'):
        o = d.get(k)
        if not o: continue
        L = list(p.get(k) or [])
        for x in o.get('plus') or []:
            if x not in L: L.append(x)
        moins = set(o.get('moins') or [])
        p[k] = [x for x in L if x not in moins]
    p.setdefault('gen', [])
    if d.get('genMoins'):
        m = set(d['genMoins']); p['gen'] = [e for e in p['gen'] if cle(e) not in m]
    for e in p['gen']:
        if cle(e) in (d.get('avis') or {}): e['avis'] = d['avis'][cle(e)]
    for e in d.get('genPlus') or []:
        i = next((j for j, x in enumerate(p['gen']) if cle(x) == cle(e)), -1)
        if i >= 0: p['gen'][i] = e
        else: p['gen'].append(e)
    if 'cats' in d: p['cats'] = d['cats']
    return p


if __name__ == '__main__':
    texte = open(sys.argv[1], encoding='utf-8').read()
    i = texte.find('{')
    if 'CHOIX BIBLIOTH' not in texte or i < 0: sys.exit('pas de « CHOIX BIBLIOTHÈQUE {…} » dans ce texte')
    d, _ = json.JSONDecoder().raw_decode(texte[i:])
    p = json.load(open(FICHIER, encoding='utf-8'))
    avant = json.dumps(p, sort_keys=True)
    pose(p, d)
    print('écart :', ', '.join('%s (%d)' % (k, len(v) if hasattr(v, '__len__') else 1) for k, v in d.items()))
    if json.dumps(p, sort_keys=True) == avant: print('rien de neuf : déjà dans musique-moteur.json'); sys.exit(0)
    if '--essai' in sys.argv: print('(essai : rien écrit)'); sys.exit(0)
    with open(FICHIER, 'w', encoding='utf-8') as o: json.dump(p, o, ensure_ascii=False, indent=1)
    print('écrit :', FICHIER)
