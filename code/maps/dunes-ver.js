/* ===== LE VER DES SABLES (2026-11-05, Sacha : « rajoute des modules, bien aléatoire à chaque fois » — clin d'œil à Arrakis) =====
   Un ver géant qui perce le sable et RETOMBE de l'autre côté de la route : une arche d'anneaux (un anneau sur deux plus gros, deux teintes de peau), la queue enfouie d'un côté, la tête de l'autre, la gueule ouverte sur un cercle de dents.
   Modèle unitaire (span x ∈ [−1, 1], l'apex à 0,74, l'axe z de la route) : dunes-4.js (dnScenesG, `ver`) le pose au-dessus de la dalle, à l'échelle `s` (60-100 m), dans un creux calme ; la route passe sous le ventre, à plus de 30 m. Matière peinte (aK 0), sans collision (on passe dessous). */
DN_MOD.ver=function(){const g=dnKit(77),A=.74,n=40,th0=-.16*Math.PI,th1=.9*Math.PI,peau=[[.66,.54,.46],[.52,.42,.37]],secs=[],cols=[];let fin=null;
  for(let i=0;i<=n;i++){const t=i/n,th=th0+(th1-th0)*t,x=-Math.cos(th),y=A*Math.sin(th),tx=Math.sin(th),ty=A*Math.cos(th),tl=Math.hypot(tx,ty),
      r=(.095+.075*t)*(i&1?1.10:1)*(i>n-4?1+(i-(n-4))*.12:1); // la queue fine, le corps qui s'épaissit, les trois derniers anneaux qui s'évasent en gueule
    secs.push({p:[x,y,0],u:[-ty/tl*r,tx/tl*r,0],w:[0,0,r],n:2.2});cols.push(peau[i&1]);if(i===n)fin={x:x,y:y,tx:tx/tl,ty:ty/tl,r:r};}
  g.loft(secs,14,cols,0,1);
  const ux=-fin.ty*fin.r,uy=fin.tx*fin.r; // l'intérieur de la gueule : un fond sombre, un peu en retrait ; puis les dents (des cônes crème, couronne de seize)
  g.sph(fin.x-fin.tx*.05,fin.y-fin.ty*.05,0,fin.r*.9,fin.r*.9,fin.r*.5,5,12,[.22,.07,.06],0);
  for(let j=0;j<16;j++){const a=j/16*6.28319,c=Math.cos(a),s=Math.sin(a),bx=fin.x+ux*c*.96,by=fin.y+uy*c*.96,bz=fin.r*s*.96,l=.10+.03*((j*5)%3);
    g.tube([bx,by,bz],[bx+fin.tx*l-ux*c*.12,by+fin.ty*l-uy*c*.12,bz-fin.r*s*.12],.016,0,5,[.96,.92,.82],0);}
  return g.fin();};
