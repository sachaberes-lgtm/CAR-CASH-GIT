# LE SERVEUR DES MUSIQUES (2026-11-09, Léo : « sur le local direct, pas html ») : http://localhost:9461/ ouvre tout de suite la page
# d'écoute de toutes les musiques du jeu (VERSION PRINCIPALE/musiques.html), sans « .html » dans l'adresse. Le reste du dossier est servi
# tel quel (assets/, musique-moteur.json…), comme par `python3 -m http.server`.
# Lancer : python3 outils/serveur-musiques.py   (port : 9461, ou un autre en argument)
import functools, http.server, json, os, sys

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

    def do_POST(self):
        # (2026-11-09, Léo : « pourquoi Fire Prime est sélectionné ? ») les ★ de la page SONT la liste du tirage : chaque clic réécrit
        # assets/audio/music/favoris.json (ids = les morceaux du jeu, extras = les versions « avant:… »), le reste du fichier (note, noms) est gardé.
        if self.path.split('?')[0] != '/favoris':
            self.send_error(404); return
        try:
            n = int(self.headers.get('Content-Length', 0)); d = json.loads(self.rfile.read(n) or b'{}')
            f = os.path.join(RACINE, 'assets', 'audio', 'music', 'favoris.json')
            cur = json.load(open(f, encoding='utf-8')) if os.path.exists(f) else {}
            cur['ids'] = [x for x in d.get('ids', []) if isinstance(x, str)]; cur['extras'] = [x for x in d.get('extras', []) if isinstance(x, str)]
            json.dump(cur, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(b'{"ok":true}')
        except Exception as e:
            self.send_error(400, str(e))

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 9461
print('Musiques du jeu : http://localhost:%d/' % port, flush=True)
http.server.ThreadingHTTPServer(('', port), functools.partial(Musiques, directory=RACINE)).serve_forever()
