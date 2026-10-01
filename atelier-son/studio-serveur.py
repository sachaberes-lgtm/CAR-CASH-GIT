#!/usr/bin/env python3
"""LE STUDIO — le serveur (2026-10-01, Léo : « que je puisse mélanger différentes boucles, les niveaux à côté, une note,
puis t'insérer un MP3 et te demander de générer une nouvelle musique »).

Sert tout le dépôt (comme python3 -m http.server) ET écrit le travail du studio SUR LE DISQUE, là où Claude le relit :
  atelier-son/studio/studio.json         l'état complet (mixes par niveau, notes, épingles) — la page le recharge au démarrage
  atelier-son/studio/BRIEF.md            le même, lisible : c'est ce fichier qu'on donne à Claude (« regarde le brief »)
  atelier-son/studio/references/<niveau>/ les MP3 glissés dans un niveau (références d'ambiance)

Lancer :  python3 atelier-son/studio-serveur.py   puis http://localhost:8767/studio.html
"""
import http.server, json, os, re, sys, time, urllib.parse

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STUDIO = os.path.join(RACINE, 'atelier-son', 'studio')
REFS = os.path.join(STUDIO, 'references')
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8767
SUR = re.compile(r'[^A-Za-z0-9._ -]+')


def propre(nom):
    nom = SUR.sub('_', os.path.basename(nom or '')).strip(' .')
    return nom[:120] or 'reference'


class Studio(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RACINE, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def json(self, code, obj):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code); self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)

    def corps(self):
        n = int(self.headers.get('Content-Length') or 0)
        return self.rfile.read(n) if n else b''

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        if u.path == '/studio/ping':
            return self.json(200, {'ok': True})
        if u.path == '/studio/refs':
            out = {}
            if os.path.isdir(REFS):
                for niv in sorted(os.listdir(REFS)):
                    d = os.path.join(REFS, niv)
                    if os.path.isdir(d):
                        out[niv] = [f for f in sorted(os.listdir(d)) if not f.startswith('.')]
            return self.json(200, out)
        return super().do_GET()

    def do_POST(self):
        u = urllib.parse.urlparse(self.path); q = urllib.parse.parse_qs(u.query)
        os.makedirs(STUDIO, exist_ok=True)
        if u.path == '/studio/sauve':
            try:
                d = json.loads(self.corps().decode('utf-8'))
            except Exception as e:
                return self.json(400, {'ok': False, 'err': str(e)})
            etat, brief = d.get('etat'), d.get('brief', '')
            tmp = os.path.join(STUDIO, 'studio.json.tmp')
            with open(tmp, 'w', encoding='utf-8') as f: json.dump(etat, f, ensure_ascii=False, indent=1)
            os.replace(tmp, os.path.join(STUDIO, 'studio.json'))
            with open(os.path.join(STUDIO, 'BRIEF.md'), 'w', encoding='utf-8') as f: f.write(brief)
            return self.json(200, {'ok': True, 't': time.strftime('%H:%M:%S')})
        if u.path == '/studio/ref':
            niv = propre((q.get('niveau') or ['divers'])[0]); nom = propre((q.get('nom') or ['ref.mp3'])[0])
            d = os.path.join(REFS, niv); os.makedirs(d, exist_ok=True)
            with open(os.path.join(d, nom), 'wb') as f: f.write(self.corps())
            return self.json(200, {'ok': True, 'f': 'atelier-son/studio/references/%s/%s' % (niv, nom)})
        if u.path == '/studio/ref-efface':
            niv = propre((q.get('niveau') or [''])[0]); nom = propre((q.get('nom') or [''])[0])
            p = os.path.join(REFS, niv, nom)
            if os.path.isfile(p): os.remove(p)   # une référence qu'on a soi-même glissée : la retirer du niveau
            return self.json(200, {'ok': True})
        self.json(404, {'ok': False})

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    print('LE STUDIO → http://localhost:%d/studio.html' % PORT)
    http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Studio).serve_forever()
