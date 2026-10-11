#!/usr/bin/env python3
"""Le serveur du SIMULATEUR LÉGER.
Sert le dossier du jeu (VERSION PRINCIPALE) SANS cache — une retouche se voit au premier rechargement — et reçoit les photos des
maps (course.html?map=<id>&photo=1 les envoie ici → simulateur/photos/<id>.jpg).

    cd "VERSION PRINCIPALE" && python3 simulateur/serveur.py 9101
    → http://127.0.0.1:9101/simulateur.html
"""
import base64, http.server, os, re, socketserver, sys, urllib.parse

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(ICI)
PHOTOS = os.path.join(ICI, 'photos')


class Main(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RACINE, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        nom = (urllib.parse.parse_qs(u.query).get('id') or [''])[0]
        n = int(self.headers.get('Content-Length') or 0)
        if u.path.endswith('/photo') and re.fullmatch(r'[a-z0-9-]{1,40}', nom) and 0 < n < 12_000_000:
            data = self.rfile.read(n).decode('ascii', 'ignore')
            if data.startswith('data:image/jpeg;base64,'):
                os.makedirs(PHOTOS, exist_ok=True)
                with open(os.path.join(PHOTOS, nom + '.jpg'), 'wb') as f:
                    f.write(base64.b64decode(data.split(',', 1)[1]))
                self.send_response(200); self.end_headers(); self.wfile.write(b'ok')
                return
        self.send_response(400); self.end_headers()

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9101
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('127.0.0.1', port), Main) as s:
        print(f'simulateur : http://127.0.0.1:{port}/simulateur.html', flush=True)
        s.serve_forever()
