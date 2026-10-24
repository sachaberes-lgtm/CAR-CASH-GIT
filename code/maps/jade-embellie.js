/* ===== LES CRISTAUX DE JADE (2026-10-21, Sacha : « chaque map un peu plus belle, sans que ce soit trop gourmand pour le téléphone ») =====
   Le clin d'œil de la map : de petites grappes de jade vert (#4FE0A8, l'accent de Jade) qui sortent des corniches et des cimes, du côté de la route ;
   l'une porte un fil d'or (le kintsugi : le CASH dans la pierre), un éclat rose au bout d'un pic. Ils n'ajoutent NI appel de dessin NI programme NI
   texture : ce sont des instances de plus dans la famille des arbres peints (même maillage de deux triangles, même matière JADE_ARB), dessinées dans
   les cases 5 et 7 de la planche des arbres (la 2e touffe et la 2e liane n'étaient que des doubles : le sommet les renvoie sur 4 et 6) ; la case
   d'une instance vaut 8 (grappe de jade) ou 9 (grappe veinée d'or). Leur lueur et leur scintillement sont dans JADE_ARB_FS (uTime, aucun travail par
   instance). Posés par un générateur LOCAL (voir jadeCristaux dans jadeBatit) : le hasard de la piste et celui des montagnes n'y sont pas touchés. */
PAL.B.jadeCristaux=[.35,.65,1]; /* la part des montagnes qui portent des cristaux, par palier (ANCIEN 35 % · MOYEN 65 % · RÉCENT 100 %) */
function jadeCristalPeint(c,W,v){ /* v : 0 la grappe de jade · 1 la grappe veinée d'or, un éclat rose */
  const rg=mulberry32(0xC215+v*131);
  const FA=v?[['#052e24','#0f7a5a'],['#0f8a68','#46d9a2'],['#2cc088','#a4ffe0']]:[['#07382c','#0f7f60'],['#12936f','#4fe0a8'],['#36cf96','#b8ffe6']]; /* [pied, tête] de la face gauche, centrale, droite — la clé vient d'en haut à gauche */
  const n=4+((rg()*2)|0),E=[];
  for(let k=0;k<n;k++){const f=k/(n-1)-.5;E.push({x:W/2+f*W*.46+(rg()-.5)*14,h:W*(.34+.58*(1-Math.abs(f)*1.2))*(.82+.22*rg()),w:W*(.11+.05*rg()),t:f*.5+(rg()-.5)*.22});}
  E.sort(function(a,b){return b.h-a.h;}); /* les plus hauts derrière */
  const y0=W-4;
  for(const e of E){
    const bx=[e.x-e.w/2,e.x-e.w/6,e.x+e.w/6,e.x+e.w/2],sh=e.h*.74,sw=e.w*.9,sx=[e.x+e.t*sh-sw/2,e.x+e.t*sh-sw/6,e.x+e.t*sh+sw/6,e.x+e.t*sh+sw/2],ty=y0-e.h,tx=e.x+e.t*e.h,ys=y0-sh;
    const face=function(i){c.beginPath();c.moveTo(bx[i],y0);c.lineTo(bx[i+1],y0);c.lineTo(sx[i+1],ys);c.lineTo(sx[i],ys);c.closePath();
      const g=c.createLinearGradient(0,y0,0,ys);g.addColorStop(0,FA[i][0]);g.addColorStop(1,FA[i][1]);c.fillStyle=g;c.fill();};
    for(let i=0;i<3;i++)face(i);
    /* la pointe : trois facettes qui se rejoignent au sommet */
    for(let i=0;i<3;i++){c.beginPath();c.moveTo(sx[i],ys);c.lineTo(sx[i+1],ys);c.lineTo(tx+(i-1)*.8,ty);c.closePath();c.fillStyle=FA[i][1];c.fill();}
    c.lineJoin='round';c.strokeStyle='rgba(2,34,26,.85)';c.lineWidth=1.6;
    c.beginPath();c.moveTo(bx[0],y0);c.lineTo(sx[0],ys);c.lineTo(tx,ty);c.lineTo(sx[3],ys);c.lineTo(bx[3],y0);c.stroke();
    c.strokeStyle='rgba(214,255,238,.7)';c.lineWidth=1.2; /* l'arête vive : entre la face gauche et la centrale, et la pointe */
    c.beginPath();c.moveTo(bx[1],y0);c.lineTo(sx[1],ys);c.lineTo(tx,ty);c.stroke();
    c.strokeStyle='rgba(120,230,190,.45)';c.beginPath();c.moveTo(bx[2],y0);c.lineTo(sx[2],ys);c.lineTo(tx,ty);c.stroke();
    if(v&&e.h>W*.5){ /* le fil d'or : un trait qui monte en zigzag dans la face centrale */
      c.strokeStyle='#ffd75e';c.lineWidth=2.4;c.lineCap='round';c.beginPath();let y=y0-6,x=(bx[1]+bx[2])/2;c.moveTo(x,y);
      for(let q=0;q<5;q++){y-=sh*.17;x=(bx[1]+bx[2])/2+(sx[1]+sx[2]-bx[1]-bx[2])/2*((y0-y)/sh)+(q%2?-1:1)*e.w*.13;c.lineTo(x,y);}
      c.stroke();c.strokeStyle='#fff3c0';c.lineWidth=.9;c.stroke();}
  }
  if(v){ /* l'éclat rose, au bout du pic le plus haut : une étincelle à quatre branches */
    const e=E[0],x=e.x+e.t*e.h,y=y0-e.h+6;c.strokeStyle='#ff7fc4';c.lineWidth=2;c.lineCap='round';
    c.beginPath();c.moveTo(x-9,y);c.lineTo(x+9,y);c.moveTo(x,y-9);c.lineTo(x,y+9);c.stroke();c.strokeStyle='#ffe3f2';c.lineWidth=1;c.stroke();}
}
