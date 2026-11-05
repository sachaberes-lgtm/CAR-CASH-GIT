#!/usr/bin/env python3
"""LE RELAIS DU VRAI TÉLÉPHONE (2026-11-05, passe perf mobile 2, T0).

    python3 outils/banc-perf/relais.py [--port 8450] [--sortie outils/banc-perf/mesures/2026-11-05-iphone13pro.json] [--racine "VERSION PRINCIPALE"]

Sert le jeu (lecture seule) sur 0.0.0.0 ET reçoit en POST les relevés que le moniteur du jeu envoie toutes les 10 s quand l'URL porte `?perf=1&relais=http://<IP du Mac>:<port>/`
(voir `perfRelais`, code/rendu/nettete-qualite.js). Chaque envoi est ajouté au JSON de sortie (réécrit à chaque fois) ; un résumé par écran/niveau (p50/p90 moyens, à-coups) est calculé en fin.
Protocole : appli/Safari tués et vidés, ouvrir `http://<IP>:<port>/index.html?perf=1&relais=http://<IP>:<port>/` (palier du téléphone, pas de ?palier), attendre le menu (le 1er envoi dit `depuis`/`t`),
JOUER sur nuages, 1 min, portail vers jade, 1 min. Ctrl-C ferme et écrit le résumé. Aucune écriture hors du fichier de sortie.
"""
import sys,os,json,time,socket,http.server,threading
ICI=os.path.dirname(os.path.abspath(__file__));RACINE=os.path.dirname(os.path.dirname(ICI))
port=8450;sortie=os.path.join(ICI,'mesures','2026-11-05-iphone13pro.json');racine=os.path.join(RACINE,'VERSION PRINCIPALE')
av=sys.argv[1:]
for i,a in enumerate(av):
    if a=='--port':port=int(av[i+1])
    elif a=='--sortie':sortie=av[i+1]
    elif a=='--racine':racine=av[i+1]
R=[];verrou=threading.Lock()
def resume():
    par={}
    for r in R:par.setdefault((r.get('ecran'),r.get('niveau')),[]).append(r)
    out=[]
    for (e,n),L in par.items():
        out.append({'ecran':e,'niveau':n,'envois':len(L),'p50_moy':round(sum(x['p50'] for x in L)/len(L),1),'p90_moy':round(sum(x['p90'] for x in L)/len(L),1),'p90_max':max(x['p90'] for x in L),
          'a_coups_50':L[-1]['n50'],'a_coups_100':L[-1]['n100'],'a_coups_250':L[-1]['n250'],'pire_ms':L[-1]['max']})
    return out
def ecrit():
    d={'date':time.strftime('%Y-%m-%d %H:%M'),'appareil':'iPhone 13 Pro (vrai téléphone, Safari/WebKit)','palier':(R[-1].get('palier') if R else None),'ua':(R[-1].get('ua') if R else None),
       'resume':resume(),'envois':R}
    json.dump(d,open(sortie,'w'),indent=1,ensure_ascii=False)
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s,*a,**k):super().__init__(*a,directory=racine,**k)
    def do_POST(s):
        n=int(s.headers.get('Content-Length') or 0);b=s.rfile.read(n)
        try:
            with verrou:
                R.append(json.loads(b.decode('utf-8','replace')));ecrit()
            print('%s · %s %s · palier %s · p50 %s p90 %s · à-coups >100 : %s'%(time.strftime('%H:%M:%S'),R[-1].get('ecran'),R[-1].get('niveau'),R[-1].get('palier'),R[-1].get('p50'),R[-1].get('p90'),R[-1].get('n100')),flush=True)
        except Exception as e:print('envoi illisible',e,flush=True)
        s.send_response(204);s.send_header('Access-Control-Allow-Origin','*');s.end_headers()
    def do_OPTIONS(s):
        s.send_response(204);s.send_header('Access-Control-Allow-Origin','*');s.send_header('Access-Control-Allow-Headers','*');s.end_headers()
    def log_message(s,*a):pass
ip=os.popen('ipconfig getifaddr en0').read().strip() or socket.gethostbyname(socket.gethostname())
print('le jeu : http://%s:%d/index.html?perf=1&relais=http://%s:%d/'%(ip,port,ip,port),flush=True)
try:http.server.ThreadingHTTPServer(('0.0.0.0',port),H).serve_forever()
except KeyboardInterrupt:
    with verrou:ecrit()
    print('écrit :',sortie)
