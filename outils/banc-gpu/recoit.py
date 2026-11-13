# Récepteur des captures du banc de la puce : python3 recoit.py 8912 <dossier> ; la page POSTe un dataURL PNG sur http://127.0.0.1:8912/<nom>.png
import sys,os,base64,http.server,socketserver
port=int(sys.argv[1]);dossier=sys.argv[2]
class H(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200);self.send_header('Access-Control-Allow-Origin','*');self.send_header('Access-Control-Allow-Headers','*');self.end_headers()
    def do_POST(self):
        n=int(self.headers['Content-Length']);d=self.rfile.read(n).decode()
        nom=os.path.basename(self.path.strip('/')) or 'capture.png'
        b=d.split(',',1)[1] if ',' in d else d
        open(os.path.join(dossier,nom),'wb').write(base64.b64decode(b))
        self.send_response(200);self.send_header('Access-Control-Allow-Origin','*');self.end_headers();self.wfile.write(b'ok')
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
with socketserver.TCPServer(('127.0.0.1',port),H) as s:s.serve_forever()
