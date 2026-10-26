# LES NIVEAUX — le serveur de la page maps-ciel.html (2026-10-09/10, Léo : « un visuel interactif, avec suppression et sauvegarde des
# modifs » · « je dois pouvoir y attacher une musique, puisque chaque niveau aura une musique »).
# Il sert le dossier VERSION PRINCIPALE comme `python3 -m http.server`, et en plus :
#   POST /maps-ciel/sauve            l'état de la page → maps-ciel/sauvegarde.json + maps-ciel/fiche-maps-ciel.txt
#                                    (+ une copie datée dans maps-ciel/sauvegardes/ : rien ne se perd) — Claude les relit tels quels
#   GET  /maps-ciel/bibliotheque     les musiques qu'on peut attacher : assets/audio/music/** et maps-ciel/musiques/*
#   POST /maps-ciel/musique?nom=…    une musique importée depuis la page → maps-ciel/musiques/<nom propre>
# Lancer : python3 maps-ciel/serveur.py 9019   (depuis VERSION PRINCIPALE) puis http://127.0.0.1:9019/maps-ciel.html
import http.server, json, os, re, sys, datetime, functools, urllib.parse

ICI = os.path.dirname(os.path.abspath(__file__))          # …/VERSION PRINCIPALE/maps-ciel
RACINE = os.path.dirname(ICI)                              # …/VERSION PRINCIPALE
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 9019
SONS = ('.m4a', '.mp3', '.wav', '.ogg', '.aac', '.flac')
MAX_IMPORT = 80 * 1024 * 1024

def bibliotheque():
    out = []
    for base in ('assets/audio/music', 'maps-ciel/musiques'):
        d = os.path.join(RACINE, base)
        for dp, dn, fn in os.walk(d):
            dn.sort()
            for f in sorted(fn):
                if f.lower().endswith(SONS):
                    rel = os.path.relpath(os.path.join(dp, f), RACINE).replace(os.sep, '/')
                    out.append({'f': rel, 'importee': base.startswith('maps-ciel')})
    return out

class Page(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')    # la page et sa sauvegarde toujours fraîches (pas de vieille copie)
        super().end_headers()

    def log_message(self, *a):
        pass

    def repond(self, code, obj):
        rep = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(rep)))
        self.end_headers()
        self.wfile.write(rep)

    def do_GET(self):
        if self.path.split('?')[0] == '/maps-ciel/bibliotheque':
            return self.repond(200, {'musiques': bibliotheque()})
        return super().do_GET()

    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        try:
            n = int(self.headers.get('Content-Length') or 0)
            if u.path == '/maps-ciel/sauve':
                d = json.loads(self.rfile.read(n).decode('utf-8'))
                etat, fiche = d.get('etat'), d.get('fiche') or ''
                if not isinstance(etat, dict): raise ValueError('etat manquant')
                os.makedirs(os.path.join(ICI, 'sauvegardes'), exist_ok=True)
                txt = json.dumps(etat, ensure_ascii=False, indent=1)
                for nom, contenu in (('sauvegarde.json', txt), ('fiche-maps-ciel.txt', fiche)):
                    tmp = os.path.join(ICI, nom + '.tmp')
                    with open(tmp, 'w', encoding='utf-8') as f: f.write(contenu)
                    os.replace(tmp, os.path.join(ICI, nom))   # écriture d'un bloc : jamais un fichier à moitié écrit
                h = datetime.datetime.now().strftime('%Y-%m-%d_%H%M%S')
                with open(os.path.join(ICI, 'sauvegardes', h + '.json'), 'w', encoding='utf-8') as f: f.write(txt)
                return self.repond(200, {'ok': True, 'quand': h})
            if u.path == '/maps-ciel/musique':
                if n <= 0 or n > MAX_IMPORT: raise ValueError('fichier vide ou trop gros')
                brut = (urllib.parse.parse_qs(u.query).get('nom') or ['musique.m4a'])[0]
                base, ext = os.path.splitext(os.path.basename(brut))
                ext = ext.lower() if ext.lower() in SONS else '.m4a'
                base = re.sub(r'[^a-z0-9]+', '-', base.lower()).strip('-') or 'musique'
                d = os.path.join(ICI, 'musiques'); os.makedirs(d, exist_ok=True)
                nom, k = base + ext, 2
                while os.path.exists(os.path.join(d, nom)): nom, k = '%s-%d%s' % (base, k, ext), k + 1   # jamais d'écrasement
                data = self.rfile.read(n)
                with open(os.path.join(d, nom), 'wb') as f: f.write(data)
                return self.repond(200, {'ok': True, 'f': 'maps-ciel/musiques/' + nom})
            self.send_error(404)
        except Exception as e:
            self.repond(500, {'ok': False, 'erreur': str(e)})

if __name__ == '__main__':
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Page, directory=RACINE))
    print('LES NIVEAUX → http://127.0.0.1:%d/maps-ciel.html' % PORT, flush=True)
    srv.serve_forever()
