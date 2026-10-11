#!/usr/bin/env python3
"""Le serveur du SIMULATEUR LÉGER.
Sert le dossier du jeu (VERSION PRINCIPALE) SANS cache et SANS le service worker du jeu — une retouche se voit au premier
rechargement.

    cd "VERSION PRINCIPALE" && python3 simulateur/serveur.py 9101
    → http://127.0.0.1:9101/simulateur.html
"""
import http.server, os, socketserver, sys, urllib.parse

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(ICI)


class Main(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RACINE, **k)

    def do_GET(self):
        # le service worker du jeu n'est PAS installé sur cette adresse : il servirait les fichiers du simulateur depuis son cache
        # (une retouche invisible) et rangerait chaque page visitée à la place d'index.html. Le jeu marche très bien sans.
        if urllib.parse.urlparse(self.path).path.endswith('/sw.js'):
            self.send_response(404); self.end_headers(); return
        super().do_GET()

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
