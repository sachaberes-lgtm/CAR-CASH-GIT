"""CASH CAR — ROBLOX : LE BANC À DISTANCE, côté PC (voir outils/distant/BancDistant.server.luau).
Sacha se sert de son PC pendant les essais : on pilote la copie de TEST sans cliquer dedans.

  python distant.py serveur            le relais (http://127.0.0.1:8799) : le Studio de test vient y chercher ses ordres
  python distant.py envoie "<luau>"    un ordre (exécuté côté serveur de la partie de test)
  python distant.py fichier x.luau     pareil, depuis un fichier (dès qu'il y a des apostrophes)
  python distant.py journal            ce que la partie a répondu depuis la dernière lecture

La file d'attente et le journal vivent dans %TEMP%/cashcar-banc/distant/."""
import sys, os, io, time, glob
from http.server import BaseHTTPRequestHandler, HTTPServer

D = os.path.join(os.environ.get('TEMP', '/tmp'), 'cashcar-banc', 'distant')
FILE = os.path.join(D, 'file')
JOURNAL = os.path.join(D, 'journal.txt')
LU = os.path.join(D, 'lu.txt')
os.makedirs(FILE, exist_ok=True)


class Relais(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        corps = b''
        if self.path.startswith('/suivant'):
            f = sorted(glob.glob(os.path.join(FILE, '*.luau')))
            if f:
                corps = open(f[0], 'rb').read()
                os.remove(f[0])
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Content-Length', str(len(corps)))
        self.end_headers()
        self.wfile.write(corps)

    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0)
        t = self.rfile.read(n).decode('utf8', 'replace')
        with io.open(JOURNAL, 'a', encoding='utf8') as j:
            j.write(time.strftime('%H:%M:%S ') + t.replace('\n', ' ⏎ ') + '\n')
        self.send_response(200)
        self.send_header('Content-Length', '0')
        self.end_headers()


def envoie(code):
    nom = os.path.join(FILE, '%017d.luau' % int(time.time() * 1000))
    io.open(nom, 'w', encoding='utf8', newline='\n').write(code)


def journal():
    if not os.path.exists(JOURNAL):
        return
    vu = int(open(LU).read() or 0) if os.path.exists(LU) else 0
    with io.open(JOURNAL, encoding='utf8') as j:
        j.seek(vu)
        sys.stdout.buffer.write(j.read().encode('utf8', 'replace'))
        open(LU, 'w').write(str(j.tell()))


if __name__ == '__main__':
    quoi = sys.argv[1] if len(sys.argv) > 1 else ''
    if quoi == 'serveur':
        for f in glob.glob(os.path.join(FILE, '*.luau')):
            os.remove(f)
        for f in (JOURNAL, LU):
            if os.path.exists(f):
                os.remove(f)
        HTTPServer(('127.0.0.1', 8799), Relais).serve_forever()
    elif quoi == 'envoie':
        envoie(sys.argv[2])
    elif quoi == 'fichier':
        envoie(io.open(sys.argv[2], encoding='utf8').read())
    elif quoi == 'journal':
        journal()
    else:
        print(__doc__)
