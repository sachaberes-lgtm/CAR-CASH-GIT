#!/usr/bin/env python3
"""LA BOÎTE À CLAUDE (2026-10-01, Léo : « mets-moi une petite fenêtre où soumettre des MP3 ou un message écrit, à te soumettre dans le chat »).
Un tout petit serveur qui reçoit ce que la fenêtre « Envoyer à Claude » de boucles.html dépose, et l'écrit là où Claude le lit :
  atelier-son/boite/MESSAGES.md   les messages, du plus récent au plus ancien, avec le nom des MP3 joints
  atelier-son/boite/mp3/          les MP3 (hors git)
  atelier-son/boite/rangement.json le tri de boucles.html (sons déplacés d'un onglet à l'autre, corbeille)
Dans le chat, il suffit de dire « regarde la boîte ».
Lancer :  python3 atelier-son/boite.py      (écoute sur http://localhost:8768, accepte la page servie sur :8765)
"""
import http.server, json, os, re, time, urllib.parse

ICI = os.path.dirname(os.path.abspath(__file__))
BOITE = os.path.join(ICI, 'boite'); MP3 = os.path.join(BOITE, 'mp3'); MSG = os.path.join(BOITE, 'MESSAGES.md')
RANGE = os.path.join(BOITE, 'rangement.json')   # le tri de Léo dans boucles.html : sons déplacés d'onglet, sons supprimés
PORT = 8768
SUR = re.compile(r'[^A-Za-z0-9._ ()-]+')


def propre(nom):
    nom = SUR.sub('_', os.path.basename(nom or '')).strip(' .')
    return nom[:120] or 'son.mp3'


class Boite(http.server.BaseHTTPRequestHandler):
    def entetes(self, code, typ='application/json'):
        self.send_response(code)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', typ); self.end_headers()

    def rend(self, obj, code=200):
        self.entetes(code); self.wfile.write(json.dumps(obj, ensure_ascii=False).encode())

    def do_OPTIONS(self): self.entetes(204)

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        if u.path == '/boite/rangement':
            d = json.load(open(RANGE, encoding='utf-8')) if os.path.exists(RANGE) else {}
            return self.rend({'ok': True, 'rangement': d})
        if u.path == '/boite/liste':
            items = []
            if os.path.exists(MSG):
                for bloc in open(MSG, encoding='utf-8').read().split('\n## ')[1:13]:
                    items.append(bloc.split('\n', 1)[0] + ' — ' + bloc.split('\n', 1)[1].strip().replace('\n', ' ')[:90])
            return self.rend({'ok': True, 'items': items})
        self.rend({'ok': True})

    def do_POST(self):
        u = urllib.parse.urlparse(self.path); q = urllib.parse.parse_qs(u.query)
        n = int(self.headers.get('Content-Length') or 0); corps = self.rfile.read(n) if n else b''
        os.makedirs(MP3, exist_ok=True)
        if u.path == '/boite/rangement':
            d = json.loads(corps.decode('utf-8') or '{}')
            with open(RANGE, 'w', encoding='utf-8') as f: json.dump(d, f, ensure_ascii=False, indent=1)
            return self.rend({'ok': True})
        if u.path == '/boite/mp3':
            nom = propre((q.get('nom') or ['son.mp3'])[0]); base, ext = os.path.splitext(nom); k = 1
            while os.path.exists(os.path.join(MP3, nom)): k += 1; nom = '%s (%d)%s' % (base, k, ext)
            with open(os.path.join(MP3, nom), 'wb') as f: f.write(corps)
            return self.rend({'ok': True, 'nom': nom})
        if u.path == '/boite/message':
            d = json.loads(corps.decode('utf-8') or '{}')
            texte = (d.get('texte') or '').strip(); fichiers = d.get('fichiers') or []
            if not texte and not fichiers: return self.rend({'ok': False, 'err': 'vide'}, 400)
            entree = '## %s\n\n%s\n' % (time.strftime('%d/%m/%Y %H:%M'), texte or '(sans texte)')
            if fichiers: entree += '\n' + '\n'.join('- MP3 : atelier-son/boite/mp3/' + f for f in fichiers) + '\n'
            ancien = open(MSG, encoding='utf-8').read().split('\n', 2)[2] if os.path.exists(MSG) else ''
            with open(MSG, 'w', encoding='utf-8') as f:
                f.write('# LA BOÎTE À CLAUDE — messages de Léo (le plus récent en haut)\n\n' + entree + ('\n' + ancien if ancien else ''))
            return self.rend({'ok': True})
        self.rend({'ok': False}, 404)

    def log_message(self, *a): pass


if __name__ == '__main__':
    try:
        serveur = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Boite)
    except OSError:   # déjà lancée (par Claude ou dans un autre terminal) : rien à faire, elle reçoit déjà
        print('LA BOÎTE est déjà ouverte sur http://localhost:%d — rien à faire, tu peux envoyer.' % PORT); raise SystemExit(0)
    print('LA BOÎTE → http://localhost:%d (messages : %s)' % (PORT, MSG))
    serveur.serve_forever()
