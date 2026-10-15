# plan.py <trace.json> <dossier> : dessine chaque piste vue du ciel (couleur = altitude) + son profil
import json,sys,os,math
from PIL import Image,ImageDraw
T=json.load(open(sys.argv[1]));out=sys.argv[2];os.makedirs(out,exist_ok=True)
for tr in T:
    p=tr['p'];n=len(p)//3;pas=tr['pas'];st=max(1,round(8/pas))
    P=[(p[3*i],p[3*i+1],p[3*i+2]) for i in range(0,n,st)]
    xs=[q[0] for q in P];zs=[q[2] for q in P];ys=[q[1] for q in P]
    x0,x1,z0,z1,y0,y1=min(xs),max(xs),min(zs),max(zs),min(ys),max(ys)
    W=1000;M=60;sc=(W-2*M)/max(x1-x0,z1-z0);Hp=int((z1-z0)*sc+2*M);Wp=int((x1-x0)*sc+2*M);HP=220
    im=Image.new('RGB',(max(Wp,1000),Hp+HP+30),(16,18,20));d=ImageDraw.Draw(im)
    def col(y):
        u=(y-y0)/max(1,y1-y0)
        if u<.5: a=u/.5; return (int(30+30*a),int(80+150*a),int(230-60*a))
        a=(u-.5)/.5; return (int(60+195*a),int(230-150*a),int(170-140*a))
    segs=sorted(range(len(P)-1),key=lambda i:P[i][1])
    w=max(2,int(56*sc))
    for i in segs:
        a=P[i];b=P[i+1]
        X=lambda q:(q[0]-x0)*sc+M;Z=lambda q:Hp-((q[2]-z0)*sc+M)
        d.line([(X(a),Z(a)),(X(b),Z(b))],fill=(0,0,0),width=w+4)
        d.line([(X(a),Z(a)),(X(b),Z(b))],fill=col(a[1]),width=w)
    for f,c in [(0,(0,255,0)),(.25,(255,255,255)),(.5,(255,255,255)),(.75,(255,255,255)),(1,(255,0,255))]:
        i=min(len(P)-1,round(f*(len(P)-1)));q=P[i];X=(q[0]-x0)*sc+M;Z=Hp-((q[2]-z0)*sc+M)
        d.ellipse([X-7,Z-7,X+7,Z+7],fill=c);d.text((X+9,Z-6),str(round(f*tr['L'])),fill=(255,255,255))
    # échelle 500 m
    d.line([(M,Hp-20),(M+500*sc,Hp-20)],fill=(255,255,255),width=3);d.text((M,Hp-36),'500 m',fill=(255,255,255))
    pel=tr.get('pel',{})
    d.text((10,8),'graine %s  L %d m  croisements %s  dyMin %s  note %s  y %d..%d'%(tr['graine'],tr['L'],pel.get('croise'),pel.get('dyMin'),pel.get('note'),y0,y1),fill=(255,255,255))
    # profil
    py0=Hp+30;L=tr['L'];ww=im.size[0]-2*M
    d.rectangle([M,py0,M+ww,py0+HP-20],outline=(80,80,80))
    pts=[(M+i*st*pas/L*ww, py0+HP-20-(P[i][1]-y0)/max(1,y1-y0)*(HP-30)) for i in range(len(P))]
    d.line(pts,fill=(255,220,120),width=2)
    im.save(os.path.join(out,'plan-%s-p%s.png'%(tr['graine'],tr.get('eng',0))))
