# LA SALLE BLANCHE — le serveur de la page (2026-10-09, Léo : « quand tu vois que la liste a changé, demande-moi, précise le changement,
# et demande si on pousse sur main »). Il sert le dossier VERSION PRINCIPALE comme `python3 -m http.server`, et il ÉCRIT : chaque
# enregistrement de salle-blanche.html (servie en local) arrive ici et se pose sur le disque — Claude voit la liste changer sans que
# Léo ait à télécharger ni envoyer la fiche.
#   salle-blanche/sauvegarde.json          l'état de la salle (familles, ordre, prix, notes, journal des gestes) + les noms + les écarts avec le jeu
#   salle-blanche/fiche-salle-blanche.txt  la fiche lisible (la même que « Télécharger la fiche »)
#   salle-blanche/sauvegardes/…            une copie datée à chaque NOUVEAU geste (un simple tap sur une voiture n'en fait pas)
# Lancer : python3 salle-blanche/serveur.py 8975   (depuis VERSION PRINCIPALE) puis http://127.0.0.1:8975/salle-blanche.html
# ⚠ garder le port 8975 : le travail de Léo vit aussi dans le navigateur, à CETTE adresse.
import http.server, json, os, sys, datetime, functools

ICI = os.path.dirname(os.path.abspath(__file__))          # …/VERSION PRINCIPALE/salle-blanche
RACINE = os.path.dirname(ICI)                              # …/VERSION PRINCIPALE
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8975

def gestes(etat):
    return [j for j in (etat or {}).get('journal') or [] if j.get('x') != '— fiche téléchargée —']

class Page(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *a):
        pass

    def do_POST(self):
        if self.path.split('?')[0] != '/salle-blanche/sauve':
            self.send_error(404); return
        try:
            n = int(self.headers.get('Content-Length') or 0)
            d = json.loads(self.rfile.read(n).decode('utf-8'))
            etat, fiche = d.get('etat'), d.get('fiche') or ''
            if not isinstance(etat, dict) or not isinstance(etat.get('lanes'), dict): raise ValueError('etat manquant')
            avant = None
            try:
                with open(os.path.join(ICI, 'sauvegarde.json'), encoding='utf-8') as f: avant = json.load(f).get('etat')
            except Exception:
                pass
            txt = json.dumps(d, ensure_ascii=False, indent=1)
            for nom, contenu in (('sauvegarde.json', txt), ('fiche-salle-blanche.txt', fiche)):
                tmp = os.path.join(ICI, nom + '.tmp')
                with open(tmp, 'w', encoding='utf-8') as f: f.write(contenu)
                os.replace(tmp, os.path.join(ICI, nom))       # écriture d'un bloc : jamais un fichier à moitié écrit
            if avant is None or len(gestes(avant)) != len(gestes(etat)):
                os.makedirs(os.path.join(ICI, 'sauvegardes'), exist_ok=True)
                h = datetime.datetime.now().strftime('%Y-%m-%d_%H%M%S')
                with open(os.path.join(ICI, 'sauvegardes', h + '.json'), 'w', encoding='utf-8') as f: f.write(txt)
            rep = json.dumps({'ok': True}).encode()
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
    print('LA SALLE BLANCHE → http://127.0.0.1:%d/salle-blanche.html' % PORT, flush=True)
    srv.serve_forever()
