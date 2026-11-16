/* ===== PORTUGAL — L'AUTOESTRADA (maquette du 2026-11-15) =====
   Le vrai marquage (Regulamento de Sinalização do Trânsito, Decreto Regulamentar 22-A/98 : « as marcas rodoviárias terão sempre a cor
   branca ») : tout BLANC ; séparation des voies M2 (linha descontínua) ; rives continues. Sur autoestrada, la pratique courante est un
   tiret de 4 m pour 10 m de vide (de mémoire : la norme de marcação de l'IP n'a pas pu être lue en ligne).
   LA SIGNATURE : la VIA VERDE (Brisa, 1991, le premier péage électronique intégré du monde) : la voie qu'on prend sans s'arrêter,
   annoncée en VERT, et son logo, le carré vert au « V » blanc. Ici, par épisodes de quelques centaines de mètres, une voie se
   borde de deux liserés verts, et porte le carré au V (un par épisode, 100 m après son début ; second regard : vert un peu adouci, 0x3c9660, liserés .64, carré .74).
   Liberté prise : sur une vraie autoestrada la Via Verde n'existe qu'à l'approche des praças de portagem ; le vert peint au sol
   et le logo couché sur la chaussée sont une transposition (le vrai logo est sur les portiques). */
arPaysDef('pt',{nom:'Portugal — autoestrada',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,V=0x3c9660,N=10,lw=(d-g)/N;
  /* les rives continues */
  K.trait(g,{l:.24,c:B,op:.88});
  K.trait(d,{l:.24,c:B,op:.88});
  /* LA VIA VERDE : les épisodes, et la voie qui la porte (la 4e depuis la gauche) */
  const EP=[[380,760],[2350,2750],[4300,4700]],iv=3,xa=g+iv*lw,xb=xa+lw,xm=(xa+xb)*.5;
  /* M2 : 4 m peints, 10 m vides ; les deux séparations de la Via Verde s'effacent dans l'épisode (les liserés verts prennent le relais) */
  for(let i=1;i<N;i++){const x=g+i*lw;
    if(i!==iv&&i!==iv+1){K.trait(x,{l:.2,c:B,op:.86,per:14,on:4,ph:3});continue;}
    let s=0;for(const e of EP){K.trait(x,{l:.2,c:B,op:.86,per:14,on:4,ph:3,s0:s,s1:e[0]});s=e[1];}
    K.trait(x,{l:.2,c:B,op:.86,per:14,on:4,ph:3,s0:s});}
  EP.forEach(function(e){
    /* les liserés : un tiret vert long (le vert « qu'on prend sans s'arrêter ») ; ils naissent où la M2 blanche s'arrête */
    K.trait(xa+.3,{l:.22,c:V,op:.64,per:14,on:10,ph:3,s0:e[0],s1:e[1]});
    K.trait(xb-.3,{l:.22,c:V,op:.64,per:14,on:10,ph:3,s0:e[0],s1:e[1]});});
  /* le logo : le carré vert aux coins arrondis et son V blanc ; deux cases de la même toile, posées au même endroit (le V vert découpé,
     le V blanc peint exactement dans la découpe) */
  const leV=function(c,W,H){c.beginPath();c.moveTo(W*.2,H*.17);c.lineTo(W*.36,H*.17);c.lineTo(W*.5,H*.66);c.lineTo(W*.64,H*.17);c.lineTo(W*.8,H*.17);
    c.lineTo(W*.58,H*.84);c.lineTo(W*.42,H*.84);c.closePath();c.fill();};
  K.dessin('vv',function(c,W,H){
    const r=46,x0=8,y0=8,x1=W-8,y1=H-8;c.beginPath();c.moveTo(x0+r,y0);c.lineTo(x1-r,y0);c.quadraticCurveTo(x1,y0,x1,y0+r*2);
    c.lineTo(x1,y1-r*2);c.quadraticCurveTo(x1,y1,x1-r,y1);c.lineTo(x0+r,y1);c.quadraticCurveTo(x0,y1,x0,y1-r*2);c.lineTo(x0,y0+r*2);
    c.quadraticCurveTo(x0,y0,x0+r,y0);c.closePath();c.fill();
    c.globalCompositeOperation='destination-out';leV(c,W,H);c.globalCompositeOperation='source-over';});
  K.dessin('vv-v',leV);
  EP.forEach(function(e){for(let s=e[0]+100;s<e[1]-60;s+=350){K.decal(s,xm,{d:'vv',l:1.8,long:9,c:V,op:.74});K.decal(s,xm,{d:'vv-v',l:1.8,long:9,c:B,op:.82});}});
}});
