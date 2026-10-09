# LES MAPS DU CIEL — le serveur de la page (2026-10-09, Léo : « un visuel interactif, avec suppression et sauvegarde des modifs »).
# Il sert le dossier VERSION PRINCIPALE comme `python3 -m http.server`, et il ÉCRIT : le bouton SAUVEGARDER de maps-ciel.html
# envoie l'état de la page ici, qui le pose sur le disque — Claude le relit sans que Léo ait à envoyer un fichier.
#   maps-ciel/sauvegarde.json        l'état de la page (rechargé à l'ouverture, sur n'importe quel navigateur)
#   maps-ciel/fiche-maps-ciel.txt    la fiche lisible (catégories, ordre, noms, à supprimer, changements, notes, journal)
#   maps-ciel/sauvegardes/…          une copie datée de chaque sauvegarde (rien ne se perd)
# Lancer : python3 maps-ciel/serveur.py 9019   (depuis VERSION PRINCIPALE) puis http://127.0.0.1:9019/maps-ciel.html
import http.server, json, os, sys, datetime, functools

ICI = os.path.dirname(os.path.abspath(__file__))          # …/VERSION PRINCIPALE/maps-ciel
RACINE = os.path.dirname(ICI)                              # …/VERSION PRINCIPALE
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 9019

class Page(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')    # la page et sa sauvegarde toujours fraîches (pas de vieille copie)
        super().end_headers()

    def log_message(self, *a):
        pass

    def do_POST(self):
        if self.path.split('?')[0] != '/maps-ciel/sauve':
            self.send_error(404); return
        try:
            n = int(self.headers.get('Content-Length') or 0)
            d = json.loads(self.rfile.read(n).decode('utf-8'))
            etat, fiche = d.get('etat'), d.get('fiche') or ''
            if not isinstance(etat, dict): raise ValueError('etat manquant')
            os.makedirs(os.path.join(ICI, 'sauvegardes'), exist_ok=True)
            txt = json.dumps(etat, ensure_ascii=False, indent=1)
            for nom, contenu in (('sauvegarde.json', txt), ('fiche-maps-ciel.txt', fiche)):
                tmp = os.path.join(ICI, nom + '.tmp')
                with open(tmp, 'w', encoding='utf-8') as f: f.write(contenu)
                os.replace(tmp, os.path.join(ICI, nom))       # écriture d'un bloc : jamais un fichier à moitié écrit
            h = datetime.datetime.now().strftime('%Y-%m-%d_%H%M%S')
            with open(os.path.join(ICI, 'sauvegardes', h + '.json'), 'w', encoding='utf-8') as f: f.write(txt)
            rep = json.dumps({'ok': True, 'quand': h}).encode()
            self.send_response(200)
        except Exception as e:
            rep = json.dumps({'ok': False, 'erreur': str(e)}).encode()
            self.send_response(500)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(rep)))
        self.end_headers()
        self.wfile.write(rep)

if __name__ == '__main__':
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Page, directory=RACINE))
    print('LES MAPS DU CIEL → http://127.0.0.1:%d/maps-ciel.html' % PORT, flush=True)
    srv.serve_forever()
