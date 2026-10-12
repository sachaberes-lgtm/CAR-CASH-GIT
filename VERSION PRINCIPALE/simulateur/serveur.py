#!/usr/bin/env python3
"""Le serveur du SIMULATEUR LÉGER.
Sert le dossier du jeu (VERSION PRINCIPALE) SANS cache et SANS le service worker du jeu — une retouche se voit au premier
rechargement. Et trois choses en plus, pour la musique des niveaux :
  · GET  simulateur/musiques.json         → la BIBLIOTHÈQUE : tout ce qui est dans simulateur/musiques/ (.html à jauge, .js module) ;
  · GET/POST simulateur/choix-musiques.json → LE CHOIX niveau → musique, écrit sur le DISQUE (pas dans le navigateur) ;
  · GET/POST simulateur/play.json         → L'ORGANISATEUR DU PLAY : { pool: {niveau: dans le tirage ?}, noms: {niveau | map:id: nom} } ;
  · POST simulateur/musiques/<fichier>    → ajoute une musique glissée sur la page des maps.

    cd "VERSION PRINCIPALE" && python3 simulateur/serveur.py 9101
    → http://127.0.0.1:9101/simulateur.html
"""
import http.server, json, os, re, socketserver, sys, urllib.parse

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(ICI)
MUSIQUES = os.path.join(ICI, 'musiques')
CHOIX = os.path.join(ICI, 'choix-musiques.json')
PLAY = os.path.join(ICI, 'play.json')


def nom_de(fichier):
    """Le nom affiché : le <title> d'une page (sans « Moteur »), sinon le nom du fichier (sans « musique- »)."""
    if fichier.endswith('.html'):
        try:
            with open(os.path.join(MUSIQUES, fichier), encoding='utf-8', errors='ignore') as f:
                m = re.search(r'<title>([^<]+)</title>', f.read(20000), re.I)
            if m:
                return re.sub(r'^\s*moteur\s+', '', m.group(1).strip(), flags=re.I) or fichier
        except OSError:
            pass
    base = re.sub(r'\.(html|js)$', '', fichier)
    base = re.sub(r'^musique[-_ ]', '', base, flags=re.I)
    return base.replace('-', ' ').replace('_', ' ').strip().title() or fichier


class Main(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RACINE, **k)

    def _json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False, indent=1).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        p = urllib.parse.urlparse(self.path).path
        # le service worker du jeu n'est PAS installé sur cette adresse : il servirait les fichiers du simulateur depuis son cache
        # (une retouche invisible) et rangerait chaque page visitée à la place d'index.html. Le jeu marche très bien sans.
        if p.endswith('/sw.js'):
            self.send_response(404); self.end_headers(); return
        if p == '/simulateur/musiques.json':
            liste = sorted(f for f in os.listdir(MUSIQUES) if f.endswith(('.html', '.js')) and not f.startswith('.'))
            return self._json([{'fichier': 'musiques/' + f, 'nom': nom_de(f)} for f in liste])
        if (p == '/simulateur/choix-musiques.json' and not os.path.exists(CHOIX)) or (p == '/simulateur/play.json' and not os.path.exists(PLAY)):
            return self._json({})
        super().do_GET()

    def do_POST(self):
        p = urllib.parse.unquote(urllib.parse.urlparse(self.path).path)
        n = int(self.headers.get('Content-Length') or 0)
        corps = self.rfile.read(n) if n else b''
        if p == '/simulateur/choix-musiques.json':
            try:
                d = json.loads(corps.decode('utf-8'))
                assert isinstance(d, dict) and all(isinstance(k, str) and isinstance(v, str) for k, v in d.items())
            except Exception:
                return self._json({'ok': False, 'erreur': 'choix illisible'}, 400)
            return self._ecrit(CHOIX, d)
        if p == '/simulateur/play.json':
            try:
                d = json.loads(corps.decode('utf-8'))
                pool, noms = d.get('pool', {}), d.get('noms', {})
                assert isinstance(pool, dict) and all(isinstance(k, str) and isinstance(v, bool) for k, v in pool.items())
                assert isinstance(noms, dict) and all(isinstance(k, str) and isinstance(v, str) and len(v) <= 60 for k, v in noms.items())
            except Exception:
                return self._json({'ok': False, 'erreur': 'organisation illisible'}, 400)
            return self._ecrit(PLAY, {'pool': pool, 'noms': noms})
        m = re.fullmatch(r'/simulateur/musiques/([^/]+\.(?:html|js))', p)
        if m and corps:
            nom = re.sub(r'[^\w.\- ]', '', m.group(1)).strip().replace(' ', '-').lower()
            if not nom or nom.startswith('.'):
                return self._json({'ok': False, 'erreur': 'nom de fichier'}, 400)
            with open(os.path.join(MUSIQUES, nom), 'wb') as f:
                f.write(corps)
            return self._json({'ok': True, 'fichier': 'musiques/' + nom, 'nom': nom_de(nom)})
        self._json({'ok': False}, 404)

    def _ecrit(self, chemin, d):
        with open(chemin + '.tmp', 'w', encoding='utf-8') as f:
            json.dump(d, f, ensure_ascii=False, indent=1, sort_keys=True); f.write('\n')
        os.replace(chemin + '.tmp', chemin)
        return self._json({'ok': True})

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9101
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('127.0.0.1', port), Main) as s:
        print(f'simulateur : http://127.0.0.1:{port}/simulateur.html', flush=True)
        s.serve_forever()
