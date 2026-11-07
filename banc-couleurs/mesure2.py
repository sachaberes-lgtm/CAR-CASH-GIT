#!/usr/bin/env python3
# REMESURE des photos (sans relancer le jeu) : un Chrome sans fenêtre lit chaque JPEG et calcule L*, chroma, zones — zones v2 (la voiture exclue de la route).
#   python3 banc-couleurs/mesure2.py <dossier img> <dossier etal>   → réécrit `mesure` dans chaque etal/<carte>-<meteo>.json
import os, sys, json, base64, subprocess, tempfile, shutil, time, urllib.request, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import photos2
PORT = int(os.environ.get('PC2', 9497))
MESURE = """(function(b64){return new Promise(function(res){var im=new Image();im.onload=function(){var W=320,H=180,cv=document.createElement('canvas');cv.width=W;cv.height=H;var g=cv.getContext('2d');g.drawImage(im,0,0,W,H);var d=g.getImageData(0,0,W,H).data;
function lin(c){c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);}function Lst(y){return y<=.008856?903.3*y:116*Math.pow(y,1/3)-16;}
var n=0,sL=0,sL2=0,sS=0,sC=0,noirBas=0,nBas=0,zones={ciel:[0,0,0],route:[0,0,0],gauche:[0,0,0],droite:[0,0,0]},zn={ciel:0,route:0,gauche:0,droite:0},hist=new Array(10).fill(0),hue=new Array(12).fill(0);
for(var y=0;y<H;y++)for(var x=0;x<W;x++){var i=(y*W+x)*4,r=d[i],gg=d[i+1],b=d[i+2];var Y=.2126*lin(r)+.7152*lin(gg)+.0722*lin(b);var L=Lst(Y);var mx=Math.max(r,gg,b),mn=Math.min(r,gg,b);var S=mx?(mx-mn)/mx:0;var C=mx-mn;
n++;sL+=L;sL2+=L*L;sS+=S;sC+=C;hist[Math.min(9,Math.floor(L/10))]++;
if(C>24){var h;if(mx===r)h=((gg-b)/C+6)%6;else if(mx===gg)h=(b-r)/C+2;else h=(r-gg)/C+4;hue[Math.floor(h*2)%12]++;}
if(y>=H*2/3){nBas++;if(L<6)noirBas++;}
var fx=x/W,fy=y/H,z=null;if(fy<.28&&fx>.25&&fx<.75)z='ciel';else if(fy>.82&&((fx>.12&&fx<.34)||(fx>.66&&fx<.88)))z='route';else if(fy>.35&&fy<.7&&fx<.18)z='gauche';else if(fy>.35&&fy<.7&&fx>.82)z='droite';
if(z){zones[z][0]+=L;zones[z][1]+=S;zones[z][2]+=C;zn[z]++;}}
var o={L:sL/n,Lsd:Math.sqrt(sL2/n-(sL/n)*(sL/n)),S:sS/n,C:sC/n,noirBas:noirBas/nBas,hist:hist.map(function(v){return v/n;}),hue:hue,v:2};for(var k in zones)o[k]={L:zones[k][0]/zn[k],S:zones[k][1]/zn[k],C:zones[k][2]/zn[k]};res(JSON.stringify(o));};im.src='data:image/jpeg;base64,'+b64;});})"""
def main():
    dimg, detal = sys.argv[1], sys.argv[2]
    prof = tempfile.mkdtemp(prefix='mesure2-chrome-')
    chrome = subprocess.Popen([photos2.CHROME, '--headless=new', '--remote-debugging-port=%d' % PORT, '--user-data-dir=' + prof, '--no-first-run', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(180):
            time.sleep(1)
            try: urllib.request.urlopen('http://127.0.0.1:%d/json' % PORT); break
            except Exception: pass
        c = photos2.CDP(PORT); c.send('Page.enable'); n = 0
        for f in sorted(glob.glob(os.path.join(dimg, '*.jpg'))):
            nom = os.path.basename(f)[:-4]; b64 = base64.b64encode(open(f, 'rb').read()).decode()
            mes = c.ev(MESURE + '(' + json.dumps(b64) + ')')
            if not mes: print('?', nom); continue
            fe = os.path.join(detal, nom + '.json')
            try: J = json.load(open(fe))
            except Exception: J = {}
            J['mesure'] = json.loads(mes); os.makedirs(detal, exist_ok=True)
            json.dump(J, open(fe, 'w')); n += 1
        print('mesuré', n); c.s.close()
    finally:
        chrome.terminate(); shutil.rmtree(prof, ignore_errors=True)
if __name__ == '__main__': main()
