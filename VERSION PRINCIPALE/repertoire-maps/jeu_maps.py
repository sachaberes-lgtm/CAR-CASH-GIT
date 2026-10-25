#!/usr/bin/env python3
"""LA LISTE DES MAPS, LUE DANS LE JEU (2026-10-25, Léo : « que cette page soit reliée et refresh sur ce qui est disponible sur le jeu »).

Plus de liste écrite à la main : on lit `index.html` (le vrai jeu, celui du dossier servi) — `SF_CARTES` (les maps et leurs météos), `SF_HORS` (ce que
JOUER ne tire pas), `SF_FUSION` (les cartes rangées sous une seule map : CRYPTOVILLE), `SF_METEOS` (les noms des météos). Une map ajoutée, une météo
retirée, un renommage dans le jeu = la page le montre au prochain « Actualiser », sans toucher à maps.js.

    python3 repertoire-maps/jeu_maps.py            → affiche la liste lue
    python3 repertoire-maps/jeu_maps.py --js       → le texte de maps.js (window.REPERTOIRE = …)

Servi par serveur.py (GET /repertoire-maps/maps.js) ; lu aussi par banc/photos.py (quelles photos prendre).
Ne dépend de rien (python seul). Si le jeu change tellement de forme que la lecture échoue, serveur.py retombe sur le maps.js du dossier.
"""
import json, os, re, sys

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(ICI)  # VERSION PRINCIPALE/

# la météo de la photo qui représente la map dans la liste (sinon : la 1re)
COUVERTURE = {'nuages': 'matin', 'jade': 'matin', 'foret': 'soir', 'banquise': 'nuit', 'espace': 'matin', 'canyon': 'matin',
              'grotte': 'matin', 'dunes': 'soir', 'crypto': 'midi'}
TEINTE_NOM = {'vert': 'NÉONS VERTS', 'jaune': 'NÉONS JAUNES', 'bleu': 'BLEU ÉLECTRIQUE', 'violet': 'NÉONS VIOLETS', 'rose': 'NÉONS ROSES'}


def _sans_commentaires(t):
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
    return re.sub(r'(?m)(?<![:\'"])//[^\n]*', '', t)


def _fin(t, i):
    """l'index de l'accolade qui ferme celle de t[i] (les chaînes 'x' et "x" sont sautées)."""
    d, q, k = 0, None, i
    while k < len(t):
        c = t[k]
        if q:
            if c == '\\': k += 1
            elif c == q: q = None
        elif c in '\'"`': q = c
        elif c == '{': d += 1
        elif c == '}':
            d -= 1
            if d == 0: return k
        k += 1
    raise ValueError('accolade non fermée')


def _chaine(o, cle):
    m = re.search(r"\b%s:\s*(?:'([^']*)'|\"([^\"]*)\")" % cle, o)
    return (m.group(1) if m.group(1) is not None else m.group(2)) if m else None


def _entrees(o):
    """[(clé, texte de l'objet)] au niveau 1 de l'objet {a:{…},b:{…}} donné (o commence par « { »)."""
    out, k = [], 1
    while k < len(o):
        m = re.compile(r"[\s,]*(\w+):\{").match(o, k)
        if not m: break
        i = m.end() - 1
        j = _fin(o, i)
        out.append((m.group(1), o[i:j + 1]))
        k = j + 1
    return out


def lit(racine=RACINE):
    """→ {'cartes': [REPERTOIRE…], 'jeu': n° de cache (sw.js), 'fusion': {…}} — ou lève une erreur si le jeu n'a plus la forme attendue."""
    with open(os.path.join(racine, 'index.html'), encoding='utf-8') as f:
        t = f.read()
    a = t.index('const SF_CARTES={')
    i = t.index('{', a)
    j = t.index('\n};', a)
    bloc = _sans_commentaires(t[i:j + 3])
    meteos = dict(re.findall(r"(\w+):'([^']+)'", re.search(r"const SF_METEOS=\{(.*?)\};", t, re.S).group(1)))
    fus = re.search(r"const SF_FUSION=\{(.*?)\};", t, re.S)
    fusion = dict(re.findall(r"(\w+):'(\w+)'", fus.group(1))) if fus else {}
    hors = {}
    mh = re.search(r"const SF_HORS=\{(.*?)\};", t)
    if mh:
        for k, ex in re.findall(r"(\w+):(.*?)(?=,\w+:|$)", mh.group(1)):
            hors[k] = 'pc' if 'ALLEGE' in ex else 'hors'  # pc = tiré sur l'ordi seulement ; hors = jamais tiré par JOUER

    cartes = []
    for mm in re.finditer(r"(\w+):\{nm:", bloc):
        cid, i0 = mm.group(1), mm.end() - 4  # « {nm: » : l'accolade
        i0 = bloc.index('{', mm.start())
        o = bloc[i0:_fin(bloc, i0) + 1]
        nom = _chaine(o, 'nm')
        tm = re.search(r"teintes:\[([^\]]*)\]", o)
        teintes = re.findall(r"'(\w+)'", tm.group(1)) if tm else []
        im = re.search(r"\bm:\{", o)
        if not nom or not im: continue
        mo = o[im.end() - 1:_fin(o, im.end() - 1) + 1]
        ms = []
        for k, ob in _entrees(mo):
            ms.append([k, _chaine(ob, 'mt') or meteos.get(k) or k.upper()])
        if hors.get(cid) == 'hors': continue  # la map n'est pas dans JOUER : elle n'est pas « disponible »
        cartes.append({'id': cid, 'nom': nom, 'teintes': teintes, 'pc': hors.get(cid) == 'pc', 'meteos': ms})

    # les cartes d'un même groupe (CRYPTOVILLE) : celle qui a un midi (le jour) en tête, la couverture de la liste en vient
    out, vus = [], {}
    for c in cartes:
        g = fusion.get(c['id'])
        if g: c['groupe'] = g
    for c in cartes:
        cov = COUVERTURE.get(c['id'])
        ks = [m[0] for m in c['meteos']]
        c['couverture'] = cov if cov in ks else ks[0]
        if c['teintes']:  # une photo par couleur (sauf la 1re, celle de base) pour la météo de couverture
            for te in c['teintes'][1:]:
                c['meteos'].append(['%s-%s' % (c['couverture'], te), '%s · %s' % (dict(c['meteos'])[c['couverture']], TEINTE_NOM.get(te, te.upper()))])
        del c['teintes']
    ordre = []
    for c in cartes:
        g = c.get('groupe') or c['id']
        if g not in vus:
            vus[g] = []; ordre.append(g)
        vus[g].append(c)
    for g in ordre:
        L = sorted(vus[g], key=lambda c: 0 if any(m[0] == 'midi' for m in c['meteos']) else 1) if len(vus[g]) > 1 else vus[g]
        out += L
    jeu = None
    try:
        with open(os.path.join(racine, 'sw.js'), encoding='utf-8') as f:
            jeu = int(re.search(r"const CACHE = 'cashcar-v(\d+)'", f.read()).group(1))
    except Exception:
        pass
    return {'cartes': out, 'jeu': jeu, 'fusion': fusion}


def en_js(d):
    return ("/* LA LISTE DES MAPS DU JEU — générée (jeu_maps.py) à partir d'index.html, jeu v%s : ne pas éditer à la main */\n"
            "window.REPERTOIRE = %s;\nwindow.REPERTOIRE_JEU = %s;\n" % (
                d['jeu'], '[\n' + ',\n'.join(' ' + json.dumps(c, ensure_ascii=False) for c in d['cartes']) + '\n]', json.dumps(d['jeu'])))


if __name__ == '__main__':
    d = lit()
    if '--js' in sys.argv:
        sys.stdout.write(en_js(d))
    else:
        print('jeu v%s' % d['jeu'])
        for c in d['cartes']:
            print('%-9s %-14s %s%s' % (c['id'], c['nom'], ','.join(m[0] for m in c['meteos']), '  [PC seulement]' if c['pc'] else ''), ('  groupe=' + c['groupe']) if c.get('groupe') else '')
