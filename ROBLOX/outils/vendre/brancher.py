# CASH CAR — branche les numéros d'ids.json (rendus par vendre.py) dans Config.REVENUS : passes, produits, packs d'argent,
# caisses légendaires, badges. Ne touche qu'aux valeurs à 0 ou déjà numériques des clés présentes dans ids.json.
#   python -I outils/vendre/brancher.py          (depuis n'importe où ; à lancer SOUS le verrou des bancs : banc.sh réécrit Config)
import json, os, re, sys

sys.stdout.reconfigure(encoding='utf-8')
ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.normpath(os.path.join(ICI, '..', '..'))
C = os.path.join(RACINE, 'src', 'ReplicatedStorage', 'CashCar', 'Config.luau')
ids = json.load(open(os.path.join(ICI, 'ids.json'), encoding='utf-8'))
src = open(C, 'rb').read().decode('utf-8')
a = src.index('Config.REVENUS = {')
b = src.index('\n}', a)
bloc = src[a:b]
fait = []


def dans_table(bloc, table, cle, valeur):
    # « table = { …, cle = 123, … } » sur une ligne
    m = re.search(r'(\b' + table + r' = \{[^}\n]*?\b' + re.escape(cle) + r' = )(\d+)', bloc)
    if not m:
        return bloc, False
    return bloc[:m.start(2)] + str(valeur) + bloc[m.end(2):], True


for k, v in ids.items():
    groupe, cle = k.split('.', 1)
    ok = False
    if groupe in ('passes', 'produits', 'badges'):
        bloc, ok = dans_table(bloc, groupe, cle, v)
    elif groupe == 'argent':
        # le k-ième « { id = …, v = … } » de la table argent
        t0 = bloc.index('argent = {')
        t1 = bloc.index('\n\t},', t0)
        sous = bloc[t0:t1]
        lignes = list(re.finditer(r'\{ id = (\d+), v = \d+ \}', sous))
        n = int(cle)
        if 1 <= n <= len(lignes):
            m = lignes[n - 1]
            sous = sous[:m.start(1)] + str(v) + sous[m.end(1):]
            bloc = bloc[:t0] + sous + bloc[t1:]
            ok = True
    elif groupe == 'caisses':
        t0 = bloc.index('caisses = {')
        t1 = bloc.index('\n\t},', t0)
        sous = bloc[t0:t1]
        m = re.search(r'(\[' + cle + r'\] = )(\d+)', sous)
        if m:
            sous = sous[:m.start(2)] + str(v) + sous[m.end(2):]
            bloc = bloc[:t0] + sous + bloc[t1:]
            ok = True
    fait.append((k, v, ok))

open(C, 'wb').write((src[:a] + bloc + src[b:]).encode('utf-8'))
for k, v, ok in fait:
    print(f"  {k:<22} {v:<14} {'branché' if ok else '⚠ INTROUVABLE dans Config.REVENUS'}")
if not all(ok for _, _, ok in fait):
    sys.exit(1)
