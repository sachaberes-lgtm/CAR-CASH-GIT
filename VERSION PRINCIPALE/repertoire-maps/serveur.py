#!/usr/bin/env python3
"""Le serveur des MAPS DU JEU (la liste repertoire-maps/ et voir.html).
Sert le dossier du jeu (VERSION PRINCIPALE) SANS cache et SANS le service worker du jeu (16/10, Léo : « je ne vois rien dans la
liste ») : voir.html charge le jeu, qui installait son service worker sur l'adresse ; dans le navigateur du chat ce service worker
faisait échouer maps.js et les photos (net::ERR_FAILED) — la liste restait vide. Le jeu marche très bien sans (comme au simulateur).

LES NOTES DES MAPS (2026-10-17, Léo : « la liste des maps sur une page locale sur laquelle je pourrai retoucher chaque map » → au
questionnaire : « notes seulement ») : dans chaque map, une case où il écrit ce qu'il veut changer. Le serveur les garde sur le
disque, HORS du dépôt (un worktree supprimé ne les emporte pas, et toutes les copies de l'outil voient les mêmes) :
    ~/Downloads/CAR-notes-maps/notes.json      ← la vérité (une liste de notes)
    ~/Downloads/CAR-notes-maps/notes-maps.txt  ← la même chose à lire (map par map, [ ] à faire / [x] fait) — c'est ce que Claude lit
    ~/Downloads/CAR-notes-maps/img/<id>.jpg    ← l'image du jeu au moment où la note a été écrite
    ~/Downloads/CAR-notes-maps/copies/         ← une copie par jour (+ notes.json.bak = l'avant-dernière version)
    GET  /repertoire-maps/notes  → {"v":1,"notes":[…]}
    POST /repertoire-maps/notes  ← une OPÉRATION (jamais le fichier entier : Claude peut cocher « fait » pendant que la page est ouverte)
         {op:'ajoute', carte, meteo, t, photo?}  ·  {op:'fait', id, v}  ·  {op:'retire', id}  ·  {op:'remet', note}
    Claude coche une note faite : `python3 repertoire-maps/serveur.py fait <id>` (serveur lancé ou non : on relit le disque).

    cd "VERSION PRINCIPALE" && python3 repertoire-maps/serveur.py 9244
    → http://127.0.0.1:9244/repertoire-maps/
"""
import base64, datetime, http.server, json, os, random, re, shutil, socketserver, sys, threading, urllib.parse

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTES = os.environ.get('CC_NOTES_MAPS') or os.path.expanduser('~/Downloads/CAR-notes-maps')
VERROU = threading.Lock()
ID_OK = re.compile(r'^[a-z0-9-]{1,40}$')


def noms_des_maps():
    """[(id, nom)] dans l'ordre de maps.js (la liste de la page) — pour ranger le fichier à lire."""
    try:
        with open(os.path.join(RACINE, 'repertoire-maps', 'maps.js'), encoding='utf-8') as f:
            return re.findall(r"id:\s*'([^']+)',\s*nom:\s*'([^']+)'", f.read())
    except OSError:
        return []


def lit():
    try:
        with open(os.path.join(NOTES, 'notes.json'), encoding='utf-8') as f:
            d = json.load(f)
        if isinstance(d, dict) and isinstance(d.get('notes'), list):
            return {'v': 1, 'notes': [n for n in d['notes'] if isinstance(n, dict) and n.get('id') and n.get('carte')]}
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
    # le fichier à lire : map par map (ordre de la liste), les notes à faire d'abord, chacune avec sa météo, son heure et son image
    noms = noms_des_maps()
    ids = [i for i, _ in noms]
    ordre = ids + sorted({n['carte'] for n in d['notes']} - set(ids))
    nom = dict(noms)
    afaire = sum(1 for n in d['notes'] if not n.get('fait'))
    L = ['LES NOTES DES MAPS — écrites par Léo dans repertoire-maps/voir.html',
         'mis à jour le %s · %d à faire · %d faites' % (datetime.datetime.now().strftime('%d/%m à %H:%M'), afaire, len(d['notes']) - afaire)]
    for c in ordre:
        ns = sorted((n for n in d['notes'] if n['carte'] == c), key=lambda n: (bool(n.get('fait')), n.get('quand', '')))
        if not ns:
            continue
        L += ['', '%s  (%s)' % (nom.get(c, c.upper()), c)]
        for n in ns:
            L.append('  [%s] %s · %s — %s' % ('x' if n.get('fait') else ' ', (n.get('meteo') or '?').upper(),
                                               n.get('quand', '')[:16].replace('T', ' '), n.get('t', '').replace('\n', ' / ')))
            L.append('        id %s%s' % (n['id'], ('  · image ' + os.path.join(NOTES, n['photo'])) if n.get('photo') else ''))
    with open(os.path.join(NOTES, 'notes-maps.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(L) + '\n')


def applique(op):
    """Une opération sur les notes du disque (relues à chaque fois : ce que Claude a coché entre-temps n'est jamais écrasé)."""
    with VERROU:
        d = lit()
        k = op.get('op')
        if k == 'ajoute':
            carte, meteo, t = str(op.get('carte', '')), str(op.get('meteo', '')), str(op.get('t', '')).strip()
            if not ID_OK.match(carte) or not t or len(t) > 4000 or (meteo and not ID_OK.match(meteo)):
                raise ValueError('note refusée')
            now = datetime.datetime.now()
            n = {'id': now.strftime('%m%d-%H%M%S-') + '%03d' % random.randrange(1000), 'carte': carte, 'meteo': meteo,
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
        elif k == 'remet':  # l'ANNULER de la suppression : la note revient telle qu'elle était (son image n'a pas été effacée)
            n = op.get('note')
            if not isinstance(n, dict) or not ID_OK.match(str(n.get('id', ''))) or not ID_OK.match(str(n.get('carte', ''))):
                raise ValueError('note refusée')
            if not any(m['id'] == n['id'] for m in d['notes']):
                d['notes'].append({c: n[c] for c in ('id', 'carte', 'meteo', 't', 'quand', 'fait', 'photo') if c in n})
        else:
            raise ValueError('opération inconnue')
        ecrit(d)
        return d


AVIS = os.path.join(NOTES, 'avis.json')


def lit_avis():
    try:
        with open(AVIS, encoding='utf-8') as f:
            d = json.load(f)
        return d if isinstance(d, dict) else {}
    except (OSError, ValueError):
        return {}


def ecrit_avis(d):
    """avis.json = la vérité ; avis-maps.txt = la même chose à lire (c'est ce que Claude lit quand Léo dit « j'ai fini »)."""
    os.makedirs(NOTES, exist_ok=True)
    tmp = AVIS + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    os.replace(tmp, AVIS)
    noms = dict(noms_des_maps())
    L = {'garder': [], 'virer': [], 'vide': []}
    for k, v in noms.items():
        a = d.get(k) or {}
        L[a.get('s') if a.get('s') in ('garder', 'virer') else 'vide'].append(k)
    out = ['AVIS DE LÉO SUR LES MAPS (%s)' % datetime.datetime.now().strftime('%d/%m %H:%M'), '']
    for t, titre in (('garder', 'À GARDER'), ('virer', 'À VIRER'), ('vide', 'PAS ENCORE VU')):
        out.append('%s : %s' % (titre, ', '.join(noms[k] for k in L[t]) or '—'))
    out.append('')
    for k, nom in noms.items():
        m = [x for x, v in ((d.get(k) or {}).get('m') or {}).items() if v == 'virer']
        if m:
            out.append('  %s — météos à virer : %s' % (nom, ', '.join(m)))
    with open(os.path.join(NOTES, 'avis-maps.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')


def applique_avis(op):
    """une opération : {carte, s:'garder'|'virer'|''} ou {carte, meteo, v:'virer'|''} — jamais le fichier entier."""
    k = op.get('carte')
    if not isinstance(k, str) or not ID_OK.match(k):
        raise ValueError('carte ?')
    d = lit_avis()
    a = d.setdefault(k, {'s': '', 'm': {}})
    if 's' in op:
        a['s'] = op['s'] if op['s'] in ('garder', 'virer') else ''
    if 'meteo' in op:
        m = str(op['meteo'])
        if not ID_OK.match(m):
            raise ValueError('météo ?')
        if op.get('v') == 'virer':
            a.setdefault('m', {})[m] = 'virer'
        else:
            a.setdefault('m', {}).pop(m, None)
    ecrit_avis(d)
    return d


class Main(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RACINE, **k)

    def envoie(self, code, b, typ):
        self.send_response(code)
        self.send_header('Content-Type', typ)
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def json(self, code, d):
        self.envoie(code, json.dumps(d, ensure_ascii=False).encode('utf-8'), 'application/json; charset=utf-8')

    def do_GET(self):
        p = urllib.parse.urlparse(self.path).path
        if p.endswith('/sw.js'):
            self.send_response(404); self.end_headers(); return
        if p == '/repertoire-maps/notes':
            with VERROU:
                return self.json(200, lit())
        if p == '/repertoire-maps/avis':
            with VERROU:
                return self.json(200, lit_avis())
        if p.startswith('/repertoire-maps/notes-img/'):  # l'image d'une note (elle vit hors du dossier servi)
            f = os.path.join(NOTES, 'img', os.path.basename(p))
            if os.path.isfile(f):
                with open(f, 'rb') as fh:
                    return self.envoie(200, fh.read(), 'image/jpeg')
            self.send_response(404); self.end_headers(); return
        super().do_GET()

    def do_POST(self):
        pp = urllib.parse.urlparse(self.path).path
        if pp == '/repertoire-maps/avis':
            try:
                n = int(self.headers.get('Content-Length') or 0)
                if n > 100_000:
                    raise ValueError('trop gros')
                with VERROU:
                    return self.json(200, applique_avis(json.loads(self.rfile.read(n).decode('utf-8'))))
            except Exception as e:
                return self.json(400, {'erreur': str(e)})
        if pp != '/repertoire-maps/notes':
            self.send_response(404); self.end_headers(); return
        try:
            n = int(self.headers.get('Content-Length') or 0)
            if n > 4_000_000:
                raise ValueError('trop gros')
            self.json(200, applique(json.loads(self.rfile.read(n).decode('utf-8'))))
        except Exception as e:  # la page dit « pas enregistré » : le disque garde la version d'avant
            self.json(400, {'erreur': str(e)})

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')  # une retouche du jeu se voit au premier rechargement
        super().end_headers()

    def log_message(self, *a):
        pass


class Serveur(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'fait':  # Claude : `serveur.py fait <id> [<id>…]` coche des notes faites
        for i in sys.argv[2:]:
            applique({'op': 'fait', 'id': i, 'v': True})
        print(open(os.path.join(NOTES, 'notes-maps.txt'), encoding='utf-8').read())
        sys.exit(0)
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9244
    print('http://127.0.0.1:%d/repertoire-maps/' % port, flush=True)
    Serveur(('127.0.0.1', port), Main).serve_forever()
