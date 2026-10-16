#!/usr/bin/env python3
# LES VOITURES DU JEU — le petit serveur (2026-10-16).
#   python3 repertoire-voitures/serveur.py [port]      (depuis VERSION PRINCIPALE ; port 9250 par défaut)
# Il sert le dossier du jeu (la liste est dans repertoire-voitures/, le jeu de « VOIR DANS LE JEU » à côté), et toutes les 2 minutes il
# REMET CE DOSSIER SUR LE MAIN : git fetch, puis checkout du dernier origin/main — seulement si la copie est « détachée » (pas une
# branche de travail) et propre (aucune modification) : il n'écrase jamais un travail en cours. La liste, elle, lit le main sur GitHub
# toute seule (moteur.js) ; ceci garde le JEU qu'on ouvre depuis elle au même niveau que la liste.
import http.server, os, socketserver, subprocess, sys, threading, time

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

class Page(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=JEU, **k)
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
