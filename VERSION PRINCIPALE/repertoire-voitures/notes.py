#!/usr/bin/env python3
"""LES NOTES DES VOITURES (2026-10-17, Léo : « ajoute une option note à côté de chaque petite voiture ; quand je te le demande, tu lis,
tu mets tout ce que j'ai écrit en liste, tu le retranscris en ce que tu comprends, et tu lances direct ce que j'ai dit »).

Même mécanique que les notes des maps (repertoire-maps/serveur.py) : la page envoie des OPÉRATIONS, le disque garde la vérité, HORS du
dépôt (un worktree supprimé ne les emporte pas, toutes les copies de l'outil voient les mêmes) :
    ~/Downloads/CAR-notes-voitures/notes.json          ← la vérité (une liste de notes)
    ~/Downloads/CAR-notes-voitures/notes-voitures.txt  ← la même chose à lire, voiture par voiture ([ ] à faire / [x] fait) — CLAUDE LIT CELUI-LÀ
    ~/Downloads/CAR-notes-voitures/img/<id>.jpg        ← la photo de la voiture au moment de la note (ce que Léo avait sous les yeux)
    ~/Downloads/CAR-notes-voitures/copies/             ← une copie par jour (+ notes.json.bak = l'avant-dernière version)
    GET  …/repertoire-voitures/notes  → {"v":1,"notes":[…]}
    POST …/repertoire-voitures/notes  ← {op:'ajoute', voiture, i, t, photo?} · {op:'fait', id, v} · {op:'retire', id} · {op:'remet', note}
Servi par repertoire-voitures/serveur.py ET par l'atelier de Léo (CASH CAR ATELIER, qui importe ce fichier).

    python3 repertoire-voitures/notes.py              → affiche notes-voitures.txt
    python3 repertoire-voitures/notes.py fait <id>…   → Claude coche des notes faites (la page ouverte le voit au prochain coup d'œil)
"""
import base64, datetime, json, os, random, re, shutil, sys, threading

NOTES = os.environ.get('CC_NOTES_VOITURES') or os.path.expanduser('~/Downloads/CAR-notes-voitures')
VERROU = threading.Lock()
ID_OK = re.compile(r'^[a-z0-9-]{1,40}$')


def lit():
    try:
        with open(os.path.join(NOTES, 'notes.json'), encoding='utf-8') as f:
            d = json.load(f)
        if isinstance(d, dict) and isinstance(d.get('notes'), list):
            return {'v': 1, 'notes': [n for n in d['notes'] if isinstance(n, dict) and n.get('id') and n.get('voiture')]}
    except (OSError, ValueError):
        pass
    return {'v': 1, 'notes': []}


def ecrit(d):
    os.makedirs(os.path.join(NOTES, 'copies'), exist_ok=True)
    vrai = os.path.join(NOTES, 'notes.json')
    if os.path.exists(vrai):
        shutil.copyfile(vrai, vrai + '.bak')
    tmp = vrai + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    os.replace(tmp, vrai)
    shutil.copyfile(vrai, os.path.join(NOTES, 'copies', 'notes-%s.json' % datetime.date.today().isoformat()))
    # le fichier à lire : voiture par voiture (dans l'ordre de CARS du jeu), les notes à faire d'abord, chacune avec son heure et sa photo
    afaire = sum(1 for n in d['notes'] if not n.get('fait'))
    L = ['LES NOTES DES VOITURES — écrites par Léo dans la liste des voitures (CASH CAR ATELIER › Voitures)',
         'mis à jour le %s · %d à faire · %d faites' % (datetime.datetime.now().strftime('%d/%m à %H:%M'), afaire, len(d['notes']) - afaire)]
    voitures = sorted({n['voiture'] for n in d['notes']},
                      key=lambda v: min((n.get('i', 999) for n in d['notes'] if n['voiture'] == v), default=999))
    for v in voitures:
        ns = sorted((n for n in d['notes'] if n['voiture'] == v), key=lambda n: (bool(n.get('fait')), n.get('quand', '')))
        i = ns[0].get('i')
        L += ['', '%s  (CARS[%s])' % (v, i if i is not None else '?')]
        for n in ns:
            L.append('  [%s] %s — %s' % ('x' if n.get('fait') else ' ', n.get('quand', '')[:16].replace('T', ' '), n.get('t', '').replace('\n', ' / ')))
            L.append('        id %s%s' % (n['id'], ('  · photo ' + os.path.join(NOTES, n['photo'])) if n.get('photo') else ''))
    with open(os.path.join(NOTES, 'notes-voitures.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(L) + '\n')


def applique(op):
    """Une opération sur les notes du disque (relues à chaque fois : ce que Claude a coché entre-temps n'est jamais écrasé)."""
    with VERROU:
        d = lit()
        k = op.get('op')
        if k == 'ajoute':
            v, t = str(op.get('voiture', '')).strip()[:60], str(op.get('t', '')).strip()
            i = op.get('i')
            if not v or not t or len(t) > 4000 or not (isinstance(i, int) and 0 <= i < 1000):
                raise ValueError('note refusée')
            now = datetime.datetime.now()
            n = {'id': now.strftime('%m%d-%H%M%S-') + '%03d' % random.randrange(1000), 'voiture': v, 'i': i,
                 't': t, 'quand': now.isoformat(timespec='seconds'), 'fait': False}
            ph = op.get('photo')
            if isinstance(ph, str) and ph.startswith('data:image/jpeg;base64,') and len(ph) < 3_000_000:
                os.makedirs(os.path.join(NOTES, 'img'), exist_ok=True)
                with open(os.path.join(NOTES, 'img', n['id'] + '.jpg'), 'wb') as f:
                    f.write(base64.b64decode(ph.split(',', 1)[1]))
                n['photo'] = 'img/' + n['id'] + '.jpg'
            d['notes'].append(n)
        elif k == 'fait':
            for n in d['notes']:
                if n['id'] == op.get('id'):
                    n['fait'] = bool(op.get('v'))
        elif k == 'retire':
            d['notes'] = [n for n in d['notes'] if n['id'] != op.get('id')]
        elif k == 'remet':  # l'ANNULER de la suppression : la note revient telle qu'elle était (sa photo n'a pas été effacée)
            n = op.get('note')
            if not isinstance(n, dict) or not ID_OK.match(str(n.get('id', ''))) or not str(n.get('voiture', '')).strip():
                raise ValueError('note refusée')
            if not any(m['id'] == n['id'] for m in d['notes']):
                d['notes'].append({c: n[c] for c in ('id', 'voiture', 'i', 't', 'quand', 'fait', 'photo') if c in n})
        else:
            raise ValueError('opération inconnue')
        ecrit(d)
        return d


def repond(methode, corps=None):
    """Pour un serveur : (code, objet JSON) d'un GET ou d'un POST sur …/notes."""
    if methode == 'GET':
        with VERROU:
            return 200, lit()
    try:
        if corps is None or len(corps) > 4_000_000:
            raise ValueError('trop gros')
        return 200, applique(json.loads(corps.decode('utf-8')))
    except Exception as e:  # la page dit « pas enregistré » : le disque garde la version d'avant
        return 400, {'erreur': str(e)}


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'fait':
        for x in sys.argv[2:]:
            applique({'op': 'fait', 'id': x, 'v': True})
    f = os.path.join(NOTES, 'notes-voitures.txt')
    print(open(f, encoding='utf-8').read() if os.path.exists(f) else 'aucune note pour l’instant (%s)' % f)
