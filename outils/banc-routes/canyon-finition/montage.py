# LES PLANCHES DE LA FINITION DU CANYON (2026-11-18) : des lignes d'images côte à côte, une légende incrustée par case, en JPEG sous un plafond d'octets.
# python3 montage.py sortie.jpg largeur_case "légende1|fichier1;légende2|fichier2" "…ligne 2…" …   (une ligne = un argument ; les cases d'une ligne : « ; »)
import sys,io
from PIL import Image,ImageDraw,ImageFont
out,W=sys.argv[1],int(sys.argv[2]);lignes=[[c.split('|',1) for c in a.split(';')] for a in sys.argv[3:]]
try:fo=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf',max(13,W//34))
except Exception:fo=ImageFont.load_default()
rows=[]
for L in lignes:
  ims=[]
  for leg,f in L:
    im=Image.open(f).convert('RGB');im=im.resize((W,round(im.height*W/im.width)),Image.LANCZOS);d=ImageDraw.Draw(im)
    b=d.textbbox((0,0),leg,font=fo);d.rectangle([4,4,b[2]+14,b[3]+12],fill=(10,14,30));d.text((9,7),leg,font=fo,fill=(255,215,94));ims.append(im)
  h=max(i.height for i in ims);r=Image.new('RGB',(sum(i.width for i in ims)+4*(len(ims)-1),h),(0,0,0));x=0
  for i in ims:r.paste(i,(x,0));x+=i.width+4
  rows.append(r)
T=Image.new('RGB',(max(r.width for r in rows),sum(r.height for r in rows)+4*(len(rows)-1)),(0,0,0));y=0
for r in rows:T.paste(r,(0,y));y+=r.height+4
for q in (88,82,76,70,64,58,52):
  b=io.BytesIO();T.save(b,'JPEG',quality=q,optimize=True)
  if b.tell()<=450*1024:break
open(out,'wb').write(b.getvalue());print(out,T.size,b.tell()//1024,'Ko q',q)
