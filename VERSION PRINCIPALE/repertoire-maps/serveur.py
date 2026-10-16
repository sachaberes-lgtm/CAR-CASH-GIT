#!/usr/bin/env python3
"""Le serveur des MAPS DU JEU (la liste repertoire-maps/ et voir.html).
Sert le dossier du jeu (VERSION PRINCIPALE) SANS cache et SANS le service worker du jeu (16/10, Léo : « je ne vois rien dans la
liste ») : voir.html charge le jeu, qui installait son service worker sur l'adresse ; dans le navigateur du chat ce service worker
faisait échouer maps.js et les photos (net::ERR_FAILED) — la liste restait vide. Le jeu marche très bien sans (comme au simulateur).

    cd "VERSION PRINCIPALE" && python3 repertoire-maps/serveur.py 9244
    → http://127.0.0.1:9244/repertoire-maps/
"""
import http.server, os, socketserver, sys, urllib.parse

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Main(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RACINE, **k)

    def do_GET(self):
        if urllib.parse.urlparse(self.path).path.endswith('/sw.js'):
            self.send_response(404); self.end_headers(); return
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')  # une retouche du jeu se voit au premier rechargement
        super().end_headers()

    def log_message(self, *a):
        pass


class Serveur(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9244
    print('http://127.0.0.1:%d/repertoire-maps/' % port, flush=True)
    Serveur(('127.0.0.1', port), Main).serve_forever()
