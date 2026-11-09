# LE SERVEUR DES MUSIQUES (2026-11-09, Léo : « sur le local direct, pas html ») : http://localhost:9461/ ouvre tout de suite la page
# d'écoute de toutes les musiques du jeu (VERSION PRINCIPALE/musiques.html), sans « .html » dans l'adresse. Le reste du dossier est servi
# tel quel (assets/, musique-moteur.json…), comme par `python3 -m http.server`.
# Lancer : python3 outils/serveur-musiques.py   (port : 9461, ou un autre en argument)
import functools, http.server, os, sys

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'VERSION PRINCIPALE')


class Musiques(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0] in ('/', '/musiques'):
            self.path = '/musiques.html' + (self.path[len(self.path.split('?')[0]):])
        return super().do_GET()

    def do_HEAD(self):
        if self.path.split('?')[0] in ('/', '/musiques'):
            self.path = '/musiques.html'
        return super().do_HEAD()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 9461
print('Musiques du jeu : http://localhost:%d/' % port, flush=True)
http.server.ThreadingHTTPServer(('', port), functools.partial(Musiques, directory=RACINE)).serve_forever()
