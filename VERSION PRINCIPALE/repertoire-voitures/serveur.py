#!/usr/bin/env python3
# LES VOITURES DU JEU — le petit serveur (2026-10-16).
#   python3 repertoire-voitures/serveur.py [port]      (depuis VERSION PRINCIPALE ; port 9250 par défaut)
# Il sert le dossier du jeu (la liste est dans repertoire-voitures/, le jeu de « VOIR DANS LE JEU » à côté), et toutes les 2 minutes il
# REMET CE DOSSIER SUR LE MAIN : git fetch, puis checkout du dernier origin/main — seulement si la copie est « détachée » (pas une
# branche de travail) et propre (aucune modification) : il n'écrase jamais un travail en cours. La liste, elle, lit le main sur GitHub
# toute seule (moteur.js) ; ceci garde le JEU qu'on ouvre depuis elle au même niveau que la liste.
import http.server, json, os, socketserver, subprocess, sys, threading, time

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 9250
ICI = os.path.dirname(os.path.abspath(__file__))
JEU = os.path.dirname(ICI)                     # VERSION PRINCIPALE
GIT = '/usr/bin/git' if os.path.exists('/usr/bin/git') else 'git'

def git(*a):
    return subprocess.run([GIT, '-C', JEU, *a], capture_output=True, text=True, timeout=120)

def suit_le_main():
    while True:
        try:
            if git('symbolic-ref', '-q', 'HEAD').returncode != 0 and not git('status', '--porcelain', '--untracked-files=no').stdout.strip():
                git('fetch', '-q', 'origin')
                a, b = git('rev-parse', 'HEAD').stdout.strip(), git('rev-parse', 'origin/main').stdout.strip()
                if b and a != b and git('checkout', '-q', '--detach', 'origin/main').returncode == 0:
                    print(time.strftime('%H:%M'), 'le jeu suit le main :', b[:8], flush=True)
        except Exception as e:
            print('suivi du main :', e, flush=True)
        time.sleep(120)

# (2026-10-19, Léo : « fais pareil, optimisé pour les voitures ») LE JEU DE L'OUTIL : /jeu-voitures.html = index.html + DEUX crochets de console posés
# ici, à la volée (le jeu du dépôt n'est pas touché ; le code du jeu est en portée fermée, ses CARS et son garage ne se lisent que de l'intérieur).
#   dbgVoitures()    → { fam : les familles du garage (RAR_FAM : id, nom, couleur), cars : les voitures DU GARAGE dans l'ordre du garage (garageListe) }
#   dbgGarageVa(i)   → équipe la voiture i (dbgEquipe) ET la montre au garage (garageShow : nom, rang, fiche) ; « attends » si une animation du garage tourne
#                      (à rappeler) ; sans argument : l'index montré
# Hors de ce serveur (le jeu servi par l'atelier, par exemple), la page de visite retombe sur dbgEquipe / dbgSpec seuls.
HOOK = ("window.dbgVoitures=function(){return {fam:RAR_FAM.map(function(x){return {id:x.id,n:x.n,c:x.c};}),"
        "cars:garageListe().map(function(i){return {i:i,nom:CARS[i].name,rar:carRar(i),ouv:!!carUnlockedVrai(i)};})};};"
        "window.dbgGarageVa=function(i){if(i==null)return garageI;if(started&&!gameOver)return 'en course';i=i|0;if(!CARS[i])return null;"
        "SAVE.d.equipped=i;level=i;if(garageOn&&GAR.root&&garageListe().indexOf(i)>=0){if(GAR.sw||GAR.go)return 'attends';garageShow(i);}else buildCar(CARS[i]);return CARS[i].name;}; // (outil des voitures)\n")
MARQUE = 'window.dbgEquipe=function(i){'
def jeu_outil():
    t = open(os.path.join(JEU, 'index.html'), encoding='utf-8').read()
    k = t.find(MARQUE)
    if k < 0: return t.encode('utf-8')                    # le jeu a changé de forme : tel quel (la page de visite sait s'en passer)
    fin = t.find('\n', k) + 1
    return (t[:fin] + HOOK + t[fin:]).encode('utf-8')

sys.path.insert(0, ICI)
import notes   # LES NOTES DES VOITURES (17/10) : …/repertoire-voitures/notes, gardées hors du dépôt (voir notes.py)

class Page(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=JEU, **k)
    def _notes(self, methode):
        n = int(self.headers.get('Content-Length') or 0) if methode == 'POST' else 0
        code, d = notes.repond(methode, self.rfile.read(n) if methode == 'POST' else None)
        b = json.dumps(d, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)
    def _jeu(self, corps):
        b = jeu_outil() if corps else b''
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(jeu_outil()) if not corps else len(b)))
        self.end_headers()
        if corps: self.wfile.write(b)
    def do_HEAD(self):
        if self.path.split('?')[0] == '/jeu-voitures.html': return self._jeu(False)   # la sonde de la page de visite
        super().do_HEAD()
    def do_GET(self):
        p = self.path.split('?')[0]
        if p == '/repertoire-voitures/notes':
            return self._notes('GET')
        if p == '/jeu-voitures.html':
            return self._jeu(True)
        if p.endswith('/sw.js'):                       # (19/10) le service worker du jeu fait échouer les pages dans le navigateur du chat (cf. repertoire-maps/serveur.py)
            return self.send_error(404)
        super().do_GET()
    def do_POST(self):
        if self.path.split('?')[0] == '/repertoire-voitures/notes':
            return self._notes('POST')
        self.send_error(404)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, *a):
        pass

class Serveur(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    threading.Thread(target=suit_le_main, daemon=True).start()
    print('les voitures du jeu : http://127.0.0.1:%d/repertoire-voitures/' % PORT, flush=True)
    Serveur(('0.0.0.0', PORT), Page).serve_forever()
