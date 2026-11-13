# Sert la racine du dépôt SANS cache (no-store), ouvert au Wi-Fi (0.0.0.0) : le jeu sous /VERSION%20PRINCIPALE/, la démo sous /outils/pouf-nuage/demo.html
# Usage : python3 outils/pouf-nuage/serveur.py <port>   (depuis la racine du dépôt)
import sys,os,http.server,socketserver
port=int(sys.argv[1]);os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store');super().end_headers()
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
with socketserver.ThreadingTCPServer(('0.0.0.0',port),H) as s:s.serve_forever()
