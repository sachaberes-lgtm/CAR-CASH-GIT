/* ============================================================================
   LES TRAÎNÉES POP (2026-10-14, Sacha : « sois très inventif : invente plusieurs traînées, ailes et trucs cool à acheter, inspirés de la
   pop culture, pour la boutique à différentes raretés ; soigne le design des traînées et des ailes ; une dizaine de chaque »)
   ----------------------------------------------------------------------------
   DIX TRAÎNÉES, UN SEUL MOTEUR (`TRX`) : des quads INSTANCIÉS — deux maillages, l'un ADDITIF (ce qui brille : néon, code, feu, foudre,
   filés), l'autre NORMAL (ce qui a une matière : anneaux, pastilles, fantômes, blocs, pétales, billets) — et UNE planche de 8 × 8 cases
   de 128 px peinte une fois au canvas (`trxPlanche`). Trois façons de poser un quad (`iP.w`) :
     0 · un SPRITE face caméra (rotation, demi-largeur, demi-hauteur) ;
     1 · un TRAIT : un demi-axe dans le monde, la largeur tournée vers l'objectif (filés d'hyperespace, segments de foudre) ;
     2 · un PAN : deux demi-axes dans le monde (le mur de lumière de LA GRILLE).
   Comme l'arc-en-ciel et WOW : elles ne vivent qu'à la NITRO (`loop._arcK`), s'éteignent en réserve bleue, en nitro infinie et à
   l'explosion, et sont coupées avec lui (`rainbowCoupe` → `trxCoupe`). Les particules sont posées dans le MONDE et gardent une part
   de l'élan de la caisse (`vk`) : 0 = elles restent sur place (pastilles, sillons de feu), 1 = elles suivent la caisse.
   LE CHEMIN (`TRX.H`, la tête en 0) : LA GRILLE y dresse son mur, les FANTÔMES y courent, la FOUDRE s'y tord.
   Au garage (onglet TRAÎNÉES) : `trxApercu` — la caisse est posée, on lui invente un élan de 14 m/s (les particules reculent de
   (1 − vk) × 14 m/s) et un chemin qui ondule derrière elle. Bâti à la PREMIÈRE traînée pop portée : zéro coût pour qui n'en a pas.
   Console : `dbgTrx()` (l'état), `dbgTrx('grille')` (la forcer en course, n'importe quelle caisse), `dbgTrx(null)` (rendre la main).
   ========================================================================== */
var TRX=null,TRX_FORCE=null;
const TRX_N=900,TRX_PN=560,TRX_HN=240,TRX_MUR=1.6,TRX_HIST={grille:1,glouton:1,foudre:1};
const TRX_VS='attribute vec4 iP;attribute vec4 iA;attribute vec4 iB;attribute vec4 iC;uniform vec2 uNear;varying vec2 vUv;varying vec4 vC;\n'
 +'void main(){vec2 q=position.xy;vec4 mv;\n'
 +' if(iP.w<.5){float c=cos(iA.x),s=sin(iA.x);vec2 r=vec2(q.x*iA.y,q.y*iA.z);mv=viewMatrix*vec4(iP.xyz,1.);mv.xy+=vec2(r.x*c-r.y*s,r.x*s+r.y*c);}\n'
 +' else{vec3 w;if(iP.w<1.5){vec3 sd=cross(iA.xyz,cameraPosition-iP.xyz);float l=length(sd);sd=l>1e-6?sd*(iA.w/l):vec3(0.);w=iP.xyz+iA.xyz*q.x+sd*q.y;}\n'
 +'  else w=iP.xyz+iA.xyz*q.x+iB.xyz*q.y;mv=viewMatrix*vec4(w,1.);}\n'
 +' gl_Position=projectionMatrix*mv;\n'
 +' float cl=floor(mod(iB.w+.5,8.)),rw=floor((iB.w+.5)/8.);vUv=vec2((cl+q.x*.5+.5)/8.,(7.-rw+q.y*.5+.5)/8.);\n'
 +' vC=iC;vC.a*=smoothstep(uNear.x,uNear.y,-mv.z);}'; // près de l'objectif, tout s'efface : la caméra de poursuite roule DANS la traînée
const TRX_FS='uniform sampler2D uMap;uniform float uInk;varying vec2 vUv;varying vec4 vC;\n'
 +'void main(){vec4 t=texture2D(uMap,vUv);float a=t.a*vC.a;if(a<.004)discard;vec3 c=t.rgb*vC.rgb;\n'
 +' if(uInk>0.){float m=max(max(c.r,c.g),max(c.b,1e-4));gl_FragColor=vec4(clamp(1.05-c/m,0.,1.)*min(1.,m*a*uInk),a);return;}\n'
 +' gl_FragColor=vec4(c*a,a);}'; /* (2026-10-18) uInk : le VOILE DE JOUR du maillage qui brille (voir TRJ) — même programme, un uniforme de plus */ // (2026-10-16, TRAÎNÉES) PRÉMULTIPLIÉ : le mélange se règle sans toucher au programme (additif ↔ encre de la salle blanche, voir trxEncre)
/* LA PLANCHE : 64 cases de 128 px, chacune garde une marge (les mipmaps ne débordent pas chez la voisine).
   0 halo · 1 trait (foudre, filés) · 2 étincelle · 3 mur de lumière · 4-11 glyphes · 12 anneau d'or · 13 pastille · 14 super-pastille ·
   15-18 fantômes (rouge, rose, cyan, orange) · 19 fantôme apeuré · 20-26 les sept pièces de quatre carrés · 27-29 pétales · 30-31 billet
   recto/verso · 32-33 flamme en pixels (deux images) */
function trxPlanche(){
  const S=128,cv=document.createElement('canvas');cv.width=cv.height=S*8;const x=cv.getContext('2d');
  const O=function(i){return [(i%8)*S,((i/8)|0)*S];};
  const pix=function(i,rows,bl,pal,oy){const p=O(i),w=rows[0].length,h=rows.length,ox=p[0]+((S-w*bl)>>1),y0=p[1]+(oy==null?((S-h*bl)>>1):oy);
    for(let y=0;y<h;y++)for(let k=0;k<w;k++){const c=rows[y][k];if(!pal[c])continue;x.fillStyle=pal[c];x.fillRect(ox+k*bl,y0+y*bl,bl,bl);}};
  const img=function(i,f){const p=O(i),id=x.createImageData(S,S),d=id.data;
    for(let j=0;j<S;j++)for(let k=0;k<S;k++){const o=(j*S+k)*4,v=f((k+.5)/S,(j+.5)/S,j);d[o]=d[o+1]=d[o+2]=v[0];d[o+3]=Math.round(255*Math.max(0,Math.min(1,v[1])));}
    x.putImageData(id,p[0],p[1]);};
  // 0 LE HALO : un cœur serré dans une lueur large
  img(0,function(u,v){const r=Math.hypot(u-.5,v-.5)/.46;return [255,r>=1?0:Math.pow(1-r,1.6)*.6+Math.exp(-r*r*26)*.4];});
  // 1 LE TRAIT : un cœur gaussien + une jupe, uniforme sur sa longueur (les segments se raboutent)
  img(1,function(u,v){const y=(v-.5)/.5,ef=Math.min(1,u/.04,(1-u)/.04);return [255,ef*(Math.exp(-y*y*30)+.35*Math.exp(-y*y*4))*(1-Math.pow(Math.abs(y),8))];});
  // 3 LE MUR DE LUMIÈRE : du verre de néon, dense vers le haut, une LIGNE franche au sommet, le pied souligné, des lignes de balayage
  img(3,function(u,v,j){const h=1-v;let a=.12+.4*Math.pow(h,2.4);
    if(h>.88)a=1;else if(h>.82)a=a+(1-a)*(h-.82)/.06;if(h<.06)a=.85;if(j%10===0&&h>.1&&h<.8)a+=.1;if(j<2||j>S-3)a=0;
    return [h>.88||h<.06?255:215,a];});
  // 2 L'ÉTINCELLE : quatre branches qui s'effilent autour d'un point chauffé à blanc
  {const p=O(2),cx=p[0]+64,cy=p[1]+64;x.save();x.globalCompositeOperation='lighter';
   const rg=x.createRadialGradient(cx,cy,0,cx,cy,24);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=rg;x.fillRect(p[0],p[1],S,S);
   for(const r of [[0,58,5],[Math.PI/2,58,5],[Math.PI/4,30,3],[-Math.PI/4,30,3]]){x.save();x.translate(cx,cy);x.rotate(r[0]);
     const lg=x.createLinearGradient(-r[1],0,r[1],0);lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.5,'rgba(255,255,255,1)');lg.addColorStop(1,'rgba(255,255,255,0)');
     x.fillStyle=lg;x.beginPath();x.moveTo(-r[1],0);x.lineTo(0,-r[2]);x.lineTo(r[1],0);x.lineTo(0,r[2]);x.closePath();x.fill();x.restore();}
   x.restore();}
  // 4-11 LES GLYPHES : du code qui tombe, en gros pixels (blancs : la couleur vient de l'instance)
  {const GL=['#####|#...#|....#|...#.|..#..|.#...|#....','#.#.#|#.#.#|....#|....#|...#.|..#..|##...','#...#|#...#|#...#|#...#|....#|...#.|..#..',
     '..#..|#####|..#..|..#..|..#..|.#...|#....','#####|#...#|#...#|#####|#...#|#...#|#####','#####|....#|...#.|..#..|..#..|..#..|..#..',
     '..#..|#####|..#..|#####|..#..|..#..|..#..','#####|#....|#....|####.|#....|#....|#####'];
   x.save();x.shadowColor='#ffffff';x.shadowBlur=10;GL.forEach(function(g,n){pix(4+n,g.split('|'),14,{'#':'#ffffff'});});x.restore();}
  // 12 L'ANNEAU D'OR : vu de face, ombré d'en haut à gauche, deux éclats blancs — on le fait TOURNER en l'écrasant (comme le vrai)
  {const p=O(12),cx=p[0]+64,cy=p[1]+64,g=x.createLinearGradient(cx-52,cy-52,cx+52,cy+52);
   g.addColorStop(0,'#fff8c0');g.addColorStop(.3,'#ffe04a');g.addColorStop(.65,'#f2a800');g.addColorStop(1,'#a86000');
   x.beginPath();x.arc(cx,cy,52,0,Math.PI*2);x.moveTo(cx+32,cy);x.arc(cx,cy,32,0,Math.PI*2,true);x.fillStyle=g;x.fill('evenodd');
   x.lineWidth=3;x.strokeStyle='#7a4400';x.beginPath();x.arc(cx,cy,51,0,Math.PI*2);x.stroke();
   x.strokeStyle='#c07a00';x.beginPath();x.arc(cx,cy,33,0,Math.PI*2);x.stroke();
   x.lineCap='round';x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=6;x.beginPath();x.arc(cx,cy,43,Math.PI*1.08,Math.PI*1.45);x.stroke();
   x.lineWidth=3;x.strokeStyle='rgba(255,255,255,.6)';x.beginPath();x.arc(cx,cy,43,Math.PI*1.56,Math.PI*1.66);x.stroke();}
  // 13-14 LA PASTILLE et LA SUPER-PASTILLE
  for(const q of [[13,20],[14,46]]){const p=O(q[0]),cx=p[0]+64,cy=p[1]+64,r=q[1],g=x.createRadialGradient(cx-r*.3,cy-r*.3,r*.1,cx,cy,r);
    g.addColorStop(0,'#fff3ea');g.addColorStop(.6,'#ffc4b0');g.addColorStop(1,'#f39a86');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.fill();}
  // 15-19 LES FANTÔMES : 14 × 14 pixels, les yeux qui regardent DEVANT (vers la caisse qu'ils poursuivent) ; l'apeuré, bleu, bouche en zigzag
  {const GH=['.....####.....','...########...','..##########..','.############.','.############.','.############.','##############','##############',
     '##############','##############','##############','##############','##.###..###.##','#...##..##...#'];
   const fant=function(i,col,peur){const R=GH.map(function(r){return r.split('');});
     if(!peur)for(const ex of [2,8]){for(let y=3;y<=7;y++)for(let k=0;k<4;k++){if((y===3||y===7)&&(k===0||k===3))continue;R[y][ex+k]='w';}
       for(let y=3;y<=4;y++)for(let k=1;k<=2;k++)R[y][ex+k]='p';}
     else for(const q of [[4,5],[5,5],[4,6],[5,6],[8,5],[9,5],[8,6],[9,6],[2,10],[3,9],[4,9],[5,10],[6,10],[7,9],[8,9],[9,10],[10,10],[11,9]])R[q[1]][q[0]]='w';
     pix(i,R.map(function(r){return r.join('');}),8,{'#':col,'w':peur?'#ffcfb8':'#ffffff','p':'#2a2adf'});};
   fant(15,'#ff1f1f');fant(16,'#ffb8ff');fant(17,'#1ff0ff');fant(18,'#ffb852');fant(19,'#2a3cff',true);}
  // 20-26 LES SEPT PIÈCES : des carrés biseautés façon console 8 bits, cernés de nuit (on les lit sur le ciel clair)
  {const sh=function(h,k){const n=parseInt(h.slice(1),16),f=function(c){return Math.max(0,Math.min(255,Math.round(k>0?c+(255-c)*k:c*(1+k))));};
      return 'rgb('+f(n>>16)+','+f((n>>8)&255)+','+f(n&255)+')';};
   const TT=[['#18e4ff',[[0,0],[1,0],[2,0],[3,0]]],['#ffe11a',[[0,0],[1,0],[0,1],[1,1]]],['#b23cff',[[0,0],[1,0],[2,0],[1,1]]],['#30e04a',[[1,0],[2,0],[0,1],[1,1]]],
     ['#ff3434',[[0,0],[1,0],[1,1],[2,1]]],['#3060ff',[[0,0],[0,1],[1,1],[2,1]]],['#ff9a1a',[[2,0],[0,1],[1,1],[2,1]]]];
   TT.forEach(function(t,n){const p=O(20+n),B=26,L=t[1],w=Math.max.apply(null,L.map(function(c){return c[0];}))+1,h=Math.max.apply(null,L.map(function(c){return c[1];}))+1,
       ox=p[0]+((S-w*B)>>1),oy=p[1]+((S-h*B)>>1);
     for(const c of L){const X=ox+c[0]*B,Y=oy+c[1]*B;x.fillStyle='rgba(12,8,34,.9)';x.fillRect(X-1,Y-1,B+2,B+2);x.fillStyle=t[0];x.fillRect(X+1,Y+1,B-2,B-2);
       x.fillStyle=sh(t[0],.55);x.fillRect(X+1,Y+1,B-2,4);x.fillRect(X+1,Y+1,4,B-2);x.fillStyle=sh(t[0],-.42);x.fillRect(X+1,Y+B-5,B-2,4);x.fillRect(X+B-5,Y+1,4,B-2);
       x.fillStyle=sh(t[0],.22);x.fillRect(X+9,Y+9,B-18,B-18);}});}
  // 27-29 LES PÉTALES DE CERISIER : une goutte échancrée au bout, du rose pâle au cœur plus vif, une nervure
  [['#ffe8f1','#ffb4cf','#f2709f',0,.84],['#fff3f8','#ffc9dc','#f590b4',.5,.78],['#ffd6e6','#ff93bb','#de4d80',-.4,.8]].forEach(function(q,n){const p=O(27+n);
    x.save();x.translate(p[0]+64,p[1]+64);x.rotate(q[3]);x.scale(q[4],q[4]);
    x.beginPath();x.moveTo(0,48);x.bezierCurveTo(-38,30,-44,-20,-21,-46);x.quadraticCurveTo(-10,-54,0,-38);x.quadraticCurveTo(10,-54,21,-46);x.bezierCurveTo(44,-20,38,30,0,48);x.closePath();
    const g=x.createRadialGradient(0,40,2,0,-6,62);g.addColorStop(0,q[2]);g.addColorStop(.38,q[1]);g.addColorStop(1,q[0]);x.fillStyle=g;x.fill();
    x.lineWidth=2;x.strokeStyle='rgba(214,74,124,.45)';x.stroke();
    x.lineWidth=1.6;x.strokeStyle='rgba(255,255,255,.45)';x.beginPath();x.moveTo(0,42);x.quadraticCurveTo(-4,4,0,-32);x.stroke();x.restore();});
  // 30-31 LE BILLET : recto (le dollar), verso (CASH CAR) — il montre l'un puis l'autre en tournoyant
  {const rr=function(X,Y,W,H,R){x.beginPath();x.moveTo(X+R,Y);x.arcTo(X+W,Y,X+W,Y+H,R);x.arcTo(X+W,Y+H,X,Y+H,R);x.arcTo(X,Y+H,X,Y,R);x.arcTo(X,Y,X+W,Y,R);x.closePath();};
   for(const vs of [0,1]){const p=O(30+vs),W=114,H=58;x.save();x.translate(p[0]+64,p[1]+64);
     rr(-W/2,-H/2,W,H,7);const g=x.createLinearGradient(0,-H/2,0,H/2);g.addColorStop(0,vs?'#52bd7c':'#5cc985');g.addColorStop(1,'#2b7f4d');x.fillStyle=g;x.fill();
     x.lineWidth=2;x.strokeStyle='#1d5c37';x.stroke();x.strokeStyle='rgba(220,255,228,.75)';x.lineWidth=1.6;x.strokeRect(-W/2+6,-H/2+6,W-12,H-12);
     x.textAlign='center';x.textBaseline='middle';x.fillStyle='#e8fdec';
     if(!vs){x.beginPath();x.ellipse(0,0,15,20,0,0,Math.PI*2);x.fill();x.fillStyle='#1f6b3f';x.font='24px "Press Start 2P",monospace';x.fillText('$',0,2);
       x.fillStyle='#e8fdec';x.font='8px "Press Start 2P",monospace';x.fillText('100',-W/2+19,-H/2+15);x.fillText('100',W/2-19,H/2-14);}
     else{x.fillStyle='rgba(20,80,45,.9)';x.fillRect(-W/2+6,-8,W-12,16);x.fillStyle='#e8fdec';x.font='8px "Press Start 2P",monospace';x.fillText('CASH CAR',0,1);
       x.beginPath();x.arc(-W/2+18,-H/2+17,6,0,Math.PI*2);x.moveTo(W/2-12,H/2-17);x.arc(W/2-18,H/2-17,6,0,Math.PI*2);x.fill();}
     x.restore();}}
  // 32-33 LA FLAMME EN PIXELS : deux images qui alternent, posées sur le bas de la case (la flamme se tient DEBOUT sur le bitume)
  [['....r.....','...ro..r..','...roo.r..','..royo.ro.','..royyoro.','.royyyyor.','.royywyyor','.roywwwyor','royywwwyor','royywwwyyo','.royywwyor','.rooyyyyor','..rooyyor.','...rrrrr..'],
   ['.....r....','..r..or...','..r.oor...','.or.oyor..','.oroyyor..','.royyyyor.','royyywyor.','royywwwyor','royywwwyor','oyywwwyyor','.royywwyor','.royyyyoor','..royyoor.','...rrrrr..']]
   .forEach(function(f,n){pix(32+n,f,8,{'w':'#fff8d0','y':'#ffd02a','o':'#ff7a12','r':'#d8300c'},S-8-f.length*8);});
  /* (2026-10-16, session TRAÎNÉES) 34 LA BULLE DE SAVON (MENTHE) : presque transparente au milieu, un bord irisé menthe → cyan → rose → or,
     un reflet de fenêtre en haut à gauche et un point de lumière en bas — elle se lit sur le ciel comme sur le bitume */
  {const p=O(34),cx=p[0]+64,cy=p[1]+64,R=54;x.save();
   const b=x.createRadialGradient(cx,cy,R*.55,cx,cy,R);b.addColorStop(0,'rgba(200,255,236,.10)');b.addColorStop(.75,'rgba(170,255,225,.32)');b.addColorStop(1,'rgba(230,255,248,.92)');
   x.fillStyle=b;x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);x.fill();
   const ir=[['#5effc8',0],['#5ee6ff',1.3],['#ff8ad8',2.6],['#ffe46a',3.9],['#5effc8',5.2]];x.lineWidth=5;
   for(let i=0;i<ir.length-1;i++){x.strokeStyle=ir[i][0];x.globalAlpha=.75;x.beginPath();x.arc(cx,cy,R-3,ir[i][1],ir[i+1][1]+.08);x.stroke();}
   x.globalAlpha=1;x.lineCap='round';x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=7;x.beginPath();x.arc(cx,cy,R-14,Math.PI*1.08,Math.PI*1.38);x.stroke();
   x.lineWidth=4;x.beginPath();x.arc(cx,cy,R-14,Math.PI*1.47,Math.PI*1.55);x.stroke();
   x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(cx+R*.42,cy+R*.45,5,0,Math.PI*2);x.fill();x.restore();}
  /* 35 LE CŒUR D'ENSEIGNE (ROSE NÉON) : un TUBE de néon plié en cœur (le trait blanc, la couleur vient de l'instance) et sa lueur */
  {const p=O(35),cx=p[0]+64,cy=p[1]+68;x.save();x.lineJoin='round';x.lineCap='round';
   const coeur=function(){x.beginPath();x.moveTo(cx,cy+36);x.bezierCurveTo(cx-52,cy+2,cx-44,cy-46,cx,cy-20);x.bezierCurveTo(cx+44,cy-46,cx+52,cy+2,cx,cy+36);};
   x.shadowColor='#ffffff';x.shadowBlur=18;x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=16;coeur();x.stroke();
   x.shadowBlur=6;x.strokeStyle='#ffffff';x.lineWidth=7;coeur();x.stroke();x.restore();}
  /* (2026-10-17, TRAÎNÉES) 36 LE PIXEL : un carré plein et son liseré de lueur — ce en quoi LA GRILLE se défait */
  {const p=O(36);x.fillStyle='rgba(255,255,255,.22)';x.fillRect(p[0]+28,p[1]+28,72,72);x.fillStyle='#ffffff';x.fillRect(p[0]+36,p[1]+36,56,56);}
  /* (2026-10-18, HYPERESPACE v2) 37 LE FILÉ D'ÉTOILE : la tête (u = 0, le bout tourné vers la caméra) ronde et pleine, le corps qui s'amincit et
     s'éteint vers le point de fuite (u = 1) — le centre de l'image (la route devant) reste net, les bords flambent */
  img(37,function(u,v){const y=(v-.5)/.5,h=Math.exp(-Math.pow((u-.07)/.06,2)),wf=.5+.5*h,yy=y/wf,ef=Math.min(1,u/.025,(1-u)/.05);
    const lg=.14+.86*Math.pow(1-u,1.25),cs=Math.exp(-yy*yy*26)+.62*Math.exp(-yy*yy*2);return [255,Math.min(1,ef*(cs*lg+h*.55*Math.exp(-y*y*5))*(1-Math.pow(Math.abs(y),8)))];});
  /* 38 L'ÉCLAT DU SAUT : un trait qui s'effile des deux bouts (gaussien sur sa longueur), l'éclat horizontal d'une optique de cinéma */
  img(38,function(u,v){const y=(v-.5)/.5,g=Math.exp(-Math.pow((u-.5)/.2,2)),cs=Math.exp(-y*y*40)+.25*Math.exp(-y*y*5);return [255,Math.min(1,g*cs*(1-Math.pow(Math.abs(y),8)))];});
  return cv;
}
function trxBati(){if(TRX)return TRX;
  const tx=new THREE.CanvasTexture(trxPlanche());tx.minFilter=THREE.LinearMipmapLinearFilter;tx.magFilter=THREE.LinearFilter;
  const mk=function(add){const g=new THREE.InstancedBufferGeometry(),a={};
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3));g.setIndex([0,1,2,0,2,3]);
    for(const k of ['iP','iA','iB','iC']){const at=new THREE.InstancedBufferAttribute(new Float32Array(TRX_N*4),4);at.setUsage(THREE.DynamicDrawUsage);g.setAttribute(k,at);a[k]=at.array;}
    g.instanceCount=0;
    const m=new THREE.Mesh(g,new THREE.ShaderMaterial({uniforms:{uInk:{value:0},uMap:{value:tx},uNear:{value:new THREE.Vector2(.9,2.1)}/* (2026-10-16, TRAÎNÉES) 1,2-3,4 → 0,9-2,1 m : ce qui entoure la caisse est à 3-5 m de la poursuite, il s'effaçait */},vertexShader:TRX_VS,fragmentShader:TRX_FS,
      transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.OneFactor,blendDst:add?THREE.OneFactor:THREE.OneMinusSrcAlphaFactor,side:THREE.DoubleSide}));
    m.frustumCulled=false;m.renderOrder=add?4:3;m.visible=false;scene.add(m);
    let mi=null;if(add){const U=m.material.uniforms;mi=new THREE.Mesh(g,new THREE.ShaderMaterial({uniforms:{uInk:{value:0},uMap:U.uMap,uNear:U.uNear},vertexShader:TRX_VS,fragmentShader:TRX_FS, // (2026-10-18) LE VOILE DE JOUR (voir TRJ) : la même géométrie, sous la lumière
      transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.ZeroFactor,blendDst:THREE.OneMinusSrcColorFactor,side:THREE.DoubleSide}));
      mi.frustumCulled=false;mi.renderOrder=3.5;mi.visible=false;m.add(mi);}
    return {m:m,mi:mi,g:g,a:a,n:0,add:add};};
  const V=function(){return new THREE.Vector3();};
  TRX={L:[mk(false),mk(true)],P:[],pi:0,type:null,n:0,t:0,acc:0,dist:0,cnt:0,kp:0,gk:0,peur:0,boltT:0,ms:0,apercu:false,
    C:{P:V(),F:V(),U:V(),R:V(),V:V(),B:V(),WL:V(),WR:V(),pv:false,dp:0,sol:true},v1:V(),wl0:V(),wr0:V(),pP:V(),bolts:[],
    H:{x:new Float32Array(TRX_HN*3),b:new Float32Array(TRX_HN*3),u:new Float32Array(TRX_HN*3),k:new Float32Array(TRX_HN),t:new Float32Array(TRX_HN),n:0}};
  for(let i=0;i<TRX_PN;i++)TRX.P.push({v:false,L:0,md:0,cu:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,g:0,dr:0,a:0,l:1,w:.2,h:.2,s1:1,r:0,vr:0,sn:0,st:0,sg:1,fl:0,fp:0,
    c:0,c0:0,c2:-1,cf:0,ct:0,cn:0,cr:1,cg:1,cb:1,ca:1,fi:0,fo:.3,bk:0,dx:0,dy:0,dz:1,ln:0,gr:.3,an:false,ux:0,uy:1,uz:0,sw:0,sf:0,sx:0,sy:0,sz:0});
  for(let i=0;i<6;i++)TRX.bolts.push({on:false,a:0,l:0,n:0,bn:0,p:new Float32Array(33),q:new Float32Array(15)});
  tcBati();
  return TRX;}
function trxNait(L){const T=TRX;for(let n=0;n<TRX_PN;n++){const i=(T.pi+n)%TRX_PN,p=T.P[i];if(p.v)continue;T.pi=(i+1)%TRX_PN;
  p.v=true;p.L=L;p.md=0;p.vx=p.vy=p.vz=0;p.g=0;p.dr=0;p.a=0;p.l=1;p.s1=1;p.r=0;p.vr=0;p.sn=0;p.st=0;p.sg=1;p.fl=0;p.fp=Math.random()*6.283;
  p.c2=-1;p.cf=0;p.ct=0;p.cn=0;p.cr=p.cg=p.cb=p.ca=1;p.fi=0;p.fo=.3;p.bk=0;p.an=false;p.sw=0;p.ln=0;p.gr=.3;p.fk=0;p.tw=0;p.mo=0;p.cw=0;p.sb=0;p.cu=0;return p;}return null;}
function trxMeurt(p){ // (2026-10-16, TRAÎNÉES) ce qui meurt avec un éclat : la bulle de savon CREVE (un anneau de gouttes qui s'ouvre, une étincelle)
  if(p.mo===1){const s=trxNait(1);if(s){s.x=p.x;s.y=p.y;s.z=p.z;s.vx=p.vx;s.vy=p.vy;s.vz=p.vz;s.l=.13;s.w=s.h=p.w*1.6;s.s1=1.8;s.c=2;s.cr=1.2;s.cg=1.7;s.cb=1.5;s.fo=.1;s.vr=4;}
    for(let i=0;i<4;i++){const d=trxNait(1);if(!d)break;const a=i*1.5708+Math.random()*.6;d.x=p.x;d.y=p.y;d.z=p.z;
      d.vx=p.vx+Math.cos(a)*1.6;d.vy=p.vy+Math.sin(a)*1.6;d.vz=p.vz;d.g=-3;d.l=.22;d.w=d.h=.035;d.c=0;d.cr=.8;d.cg=1.6;d.cb=1.3;d.fo=.12;}}}
function trxVit(p,vk){const C=TRX.C,k=C.pv?(vk>=.999?0:-Math.max(1-vk,.35)):vk;p.vx+=C.V.x*k;p.vy+=C.V.y*k;p.vz+=C.V.z*k;} // l'élan hérité — au garage, le RECUL (la caisse est posée) : au moins 35 % des 14 m/s, sinon ce qui suit la caisse s'entasse sur la poupe
/* ⚠ L'ÉLAN GARDÉ (`vk`) DÉCIDE CE QU'ON VOIT EN COURSE (mesuré au 1er banc) : la caméra de poursuite est à quelques mètres derrière. À 80 m/s,
   une particule qui ne garde que 55 % de l'élan recule de 36 m/s et passe l'objectif en 0,15 s — on ne la voit jamais. Ce qui doit se LIRE
   (code, anneaux, blocs, pétales, billets) garde ~0,86-0,9 de l'élan, comme les mots de WOW : la traînée s'étire doucement derrière la caisse. */
function trxQ(L,md,px,py,pz,a0,a1,a2,a3,b0,b1,b2,cell,r,g,b,al){const Y=TRX.L[L];if(Y.n>=TRX_N||al<=.003)return;const o=Y.n*4,A=Y.a;
  A.iP[o]=px;A.iP[o+1]=py;A.iP[o+2]=pz;A.iP[o+3]=md;A.iA[o]=a0;A.iA[o+1]=a1;A.iA[o+2]=a2;A.iA[o+3]=a3;
  A.iB[o]=b0;A.iB[o+1]=b1;A.iB[o+2]=b2;A.iB[o+3]=cell;A.iC[o]=r;A.iC[o+1]=g;A.iC[o+2]=b;A.iC[o+3]=al;Y.n++;}
/* (2026-10-15 soir, Sacha : « toutes les traînées désirables ») LES OBJETS DES TRAÎNÉES QU'ON VOIT — VU au banc : de la caméra de poursuite, un pétale
   de 10-16 cm, un anneau de 21 cm, un billet de 30 cm faisaient 2 à 4 pixels : on ne voyait pas ce qu'on avait acheté. En course, les OBJETS (couche 0 :
   pétales, anneaux, billets, blocs, pastilles) ×2,3 et les LUEURS (couche 1 : code, étincelles, éclats) ×1,6 ; les flammes posées au sol (88 À L'HEURE)
   ×1,2. Le garage (l'aperçu) ne bouge pas. `?trainee=signal` rend aussi les tailles d'avant. */
const TRX_GROS=/[?&]trainee=signal\b/.test(location.search)?[1.35,1.35]:[2.3,1.6],TRX_DENSE=!/[?&]trainee=signal\b/.test(location.search); // TRX_DENSE : en course, plus de pétales (×1,6), de billets, d'anneaux et de blocs (×1,4-1,5)
function trxParts(dt){let n=0;const sb9=TRX.C.pv&&silBlanc()?1.7:1,E0=TRX.C.pv?sb9:TRX_GROS[0],E1=TRX.C.pv?sb9:TRX_GROS[1]; /* (2026-10-17, TRAÎNÉES) en BOUTIQUE la caméra est loin de la caisse : un pétale de 12 cm, un anneau de 21 cm n'y faisaient que des points — ×1,7 (l'inventaire, caméra proche, ne bouge pas) */ // en course la caisse est petite dans l'image : les sprites grossissent — (2026-10-15 soir) ×1,35 → les OBJETS ×2,3, les lueurs ×1,6 (voir TRX_GROS)
  for(const p of TRX.P){if(!p.v)continue;p.a+=dt;if(p.a>=p.l){p.v=false;if(p.mo)trxMeurt(p);continue;}n++;
    if(p.dr){const e=Math.exp(-p.dr*dt);p.vx*=e;p.vy*=e;p.vz*=e;}
    p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
    if(p.sw){const s=Math.cos(p.a*p.sf+p.fp)*p.sw*dt;p.x+=p.sx*s;p.y+=p.sy*s;p.z+=p.sz*s;}           // le balancement (pétale, billet)
    p.r+=p.vr*dt;if(p.sn){p.st+=dt;if(p.st>=p.sn){p.st-=p.sn;p.r+=p.sg*1.5708;}}                   // la rotation PAR QUARTS (les pièces de quatre carrés)
    if(p.cf){p.ct+=dt;if(p.ct>=p.cf){p.ct=0;p.c=p.cn?p.c0+((Math.random()*p.cn)|0):(p.c===p.c0?p.c2:p.c0);}} // le code qui change, la flamme qui bat
    const rest=p.l-p.a;let al=p.ca;if(p.fi&&p.a<p.fi)al*=p.a/p.fi;if(rest<p.fo)al*=rest/p.fo;
    if(p.bk&&rest<p.bk&&((p.a*16)|0)%2)al*=.15;                                                      // le CLIGNOTEMENT d'avant la disparition
    if(p.fk&&Math.random()<p.fk)al*=.12;                                                              // (2026-10-16) le néon qui GRÉSILLE
    if(p.tw){const w=Math.max(0,Math.sin(p.a*p.tw+p.fp));al*=.25+.75*w*w*w;}                          // (2026-10-16) la paillette qui SCINTILLE
    const sz=1+(p.s1-1)*p.a/p.l;
    if(p.cu){tcPart(p,al,p.L?E1:E0);continue;}
    if(p.md===1){const ln=p.ln*Math.min(1,p.a/p.gr)*.5,qx=p.x-p.dx*ln,qy=p.y-p.dy*ln,qz=p.z-p.dz*ln,ax=p.dx*ln,ay=p.dy*ln,az=p.dz*ln;
      /* (2026-10-18, HYPERESPACE v2) un filé a deux lumières : la COULEUR et, dedans, le CŒUR chauffé à blanc (`cw` × la largeur, `kr/kg/kb`) — de jour,
         le VOILE DE JOUR commun (TRJ, `uInk`) les pose sur une encre de leur couleur. `sb` : à sa naissance, l'ÉTOILE (case 2) brille à la pointe qui
         s'étire, puis s'éteint en `sb` secondes — on voit l'étoile devenir un trait. */
      trxQ(p.L,1,qx,qy,qz,ax,ay,az,p.w*sz,0,0,0,p.c,p.cr,p.cg,p.cb,al);
      if(p.cw)trxQ(p.L,1,qx,qy,qz,ax,ay,az,p.w*sz*p.cw,0,0,0,p.c,p.kr,p.kg,p.kb,al);
      if(p.sb&&p.a<p.sb){const e=1-p.a/p.sb;trxQ(p.L,0,qx-ax,qy-ay,qz-az,p.fp,p.ss*(.55+.45*e),p.ss*(.55+.45*e),0,0,0,0,2,p.kr,p.kg,p.kb,al*e);}
      continue;}
    let xs=1,cel=p.c;if(p.fl){const c=Math.cos(p.a*p.fl+p.fp);xs=Math.max(.08,Math.abs(c));if(c<0&&p.c2>=0&&!p.cf)cel=p.c2;} // il TOURNE : écrasé, puis son revers
    const E=p.L?(p.an?1.2:E1):E0,hh=p.h*sz*E;let X=p.x,Y=p.y,Z=p.z;if(p.an){X+=p.ux*hh;Y+=p.uy*hh;Z+=p.uz*hh;}               // posé par le pied (la flamme)
    trxQ(p.L,0,X,Y,Z,p.r,p.w*sz*xs*E,hh,0,0,0,0,cel,p.cr,p.cg,p.cb,al);}
  return n;}
function trxHist(k){const H=TRX.H,C=TRX.C,N=TRX_HN; // en course : le chemin s'écrit (la tête en 0)
  const d=H.n?Math.hypot(C.P.x-H.x[0],C.P.y-H.x[1],C.P.z-H.x[2]):1e9;
  if(H.n&&d<.12){if(k>H.k[0])H.k[0]=k;return;}
  if(H.n&&d>12)H.n=0; // téléportée (portail, replacement) : pas de pont jusqu'ici
  H.x.copyWithin(3,0,(N-1)*3);H.b.copyWithin(3,0,(N-1)*3);H.u.copyWithin(3,0,(N-1)*3);H.k.copyWithin(1,0,N-1);H.t.copyWithin(1,0,N-1);
  H.x[0]=C.P.x;H.x[1]=C.P.y;H.x[2]=C.P.z;H.b[0]=C.B.x;H.b[1]=C.B.y;H.b[2]=C.B.z;H.u[0]=C.U.x;H.u[1]=C.U.y;H.u[2]=C.U.z;H.k[0]=k;H.t[0]=TRX.t;H.n=Math.min(N,H.n+1);}
function trxHistApercu(k){const H=TRX.H,C=TRX.C,T=TRX,sp=CARS[garageI]||CARS[0],z0=-(sp.l/2+.2),v=T.v1,n=30,lim=Math.round(n*Math.min(1,k*1.25)); // au garage : 30 pas de 30 cm qui ondulent
  for(let i=0;i<n;i++){const u=Math.min(1,i/12),w=Math.sin(i*.21-T.t*2.4)*.5*u,o=i*3;
    v.set(w,.5+u*.15,z0-i*.3);carGroup.localToWorld(v);H.x[o]=v.x;H.x[o+1]=v.y;H.x[o+2]=v.z;
    v.set(w,.04,z0-i*.3);carGroup.localToWorld(v);H.b[o]=v.x;H.b[o+1]=v.y;H.b[o+2]=v.z;
    H.u[o]=C.U.x;H.u[o+1]=C.U.y;H.u[o+2]=C.U.z;H.k[i]=i<lim?k:0;H.t[i]=T.t-i*.3/14;}
  H.n=n;}
function trxLe(d,out,pied){const H=TRX.H,X=pied?H.b:H.x,C=TRX.C,Q=pied?C.B:C.P;let px=Q.x,py=Q.y,pz=Q.z,acc=0; // le point du chemin à `d` mètres derrière
  for(let i=0;i<H.n;i++){const o=i*3,qx=X[o],qy=X[o+1],qz=X[o+2],l=Math.hypot(qx-px,qy-py,qz-pz);
    if(acc+l>=d&&l>1e-6){const f=(d-acc)/l;out.set(px+(qx-px)*f,py+(qy-py)*f,pz+(qz-pz)*f);return i;}
    acc+=l;px=qx;py=qy;pz=qz;}
  out.set(px,py,pz);return -1;}
function trxRoues(sp){const C=TRX.C,w=(sp&&sp.w||2)*.4,l=sp&&sp.l||4.4; // les deux roues arrière et le pied de la poupe, en monde
  C.WL.set(w,.03,-l*.3);carGroup.localToWorld(C.WL);C.WR.set(-w,.03,-l*.3);carGroup.localToWorld(C.WR);C.B.set(0,.04,-(l/2+.05));carGroup.localToWorld(C.B);}
/* (2026-10-18, Sacha : « améliore largement hyper espace ») HYPERESPACE v2 — UN FILÉ (dessiné par trxParts : encre, couleur, cœur, étoile de naissance).
   Le TUNNEL : plus dense vers l'extérieur (√ du hasard), la caisse reste lisible au milieu ; trois lumières — bleu électrique, cyan, blanc chauffé.
   `sk` : la VITESSE (×1 à 75 m/s, de ×0,75 à ×2) — les filés s'allongent quand NITROOO accélère, la vitesse lumière se SENT. `saut` : l'averse de
   l'allumage — nés plus loin devant, plus longs, ils s'étirent deux fois plus vite. */
function trxHyFile(C,sk,saut){const p=trxNait(1);if(!p)return;const pv=C.pv;
  const a=Math.random()*6.283,r=(pv?1:1.3)+(pv?3:3.9)*Math.sqrt(Math.random()),f=saut?2+Math.random()*14:-1+Math.random()*10,ca=Math.cos(a)*r,sa=Math.sin(a)*r*.8;
  p.x=C.P.x+C.R.x*ca+C.U.x*sa+C.F.x*f;p.y=C.P.y+C.R.y*ca+C.U.y*sa+C.F.y*f;p.z=C.P.z+C.R.z*ca+C.U.z*sa+C.F.z*f;
  trxVit(p,pv?.45:.62);p.md=1;p.dx=C.F.x;p.dy=C.F.y;p.dz=C.F.z;p.ln=(pv?4+Math.random()*10:(6+Math.random()*12)*sk)*(saut?1.45:1);p.gr=saut?.11:.25;
  p.w=pv?.03+Math.random()*.035:.065+Math.random()*.06;p.c=37;p.l=(saut?.55:.45)+Math.random()*.3;p.fi=.04;p.fo=.22;
  const q=Math.random();if(q<.1){p.cr=1.3;p.cg=1.6;p.cb=2.4;p.w*=1.1;}else if(q<.42){p.cr=.2;p.cg=1.35;p.cb=2.6;p.cw=.3;}else{p.cr=.25;p.cg=.55;p.cb=2.6;p.cw=.3;}
  p.kr=1;p.kg=1.4;p.kb=2.4;p.sb=.17;p.ss=pv?.11:.22;}
function trxBolt(A,n,f,wk){const C=TRX.C; // un éclair : chaque segment, un HALO violet large et un CŒUR blanc-bleu fin (les points sont relatifs à la caisse)
  for(let i=0;i+1<n;i++){const o=i*3,ax=A[o]+C.P.x,ay=A[o+1]+C.P.y,az=A[o+2]+C.P.z,bx=A[o+3]+C.P.x,by=A[o+4]+C.P.y,bz=A[o+5]+C.P.z,
      hx=(bx-ax)*.54,hy=(by-ay)*.54,hz=(bz-az)*.54,cx=(ax+bx)*.5,cy=(ay+by)*.5,cz=(az+bz)*.5;
    trxQ(1,1,cx,cy,cz,hx,hy,hz,.26*wk,0,0,0,1,.55*f,.3*f,1.7*f,.55);trxQ(1,1,cx,cy,cz,hx,hy,hz,.05*wk,0,0,0,1,1.7*f,1.6*f,2.3*f,1);}}
/* ============================================================================
   LES TRAÎNÉES EN CUBES (2026-10-20, Sacha : « passer les traînées en un joli jeu de pixels, comme le nitro ou toutes les flammes du jeu : les
   billets, les éclairs, les feuilles de sakura… toutes les traînées du jeu faites avec le même style pixel qui bouge ») — ÉTAPE 1 : SAKURA,
   BILLETS, FOUDRE DIVINE.
   ----------------------------------------------------------------------------
   Le feu du nitro, l'arc-en-ciel et la porte sont faits de CUBES (faces ombrées, couleurs au-delà de 1, un halo qui s'accumule). Les traînées
   POP, elles, étaient des quads lisses peints sur une planche. Elles prennent la même matière : TROIS piscines de cubes (`TC`), réglées comme
   NFEU / l'arc-en-ciel — donc les MÊMES programmes, zéro compilation de plus :
     · `TC.s` — les cubes PLEINS (opaques, faces ombrées : dessus clair, flancs, dessous sombre) : pétales, billets, cœur des éclairs ;
     · `TC.o` — le CONTOUR : des cubes un peu plus gros, d'une couleur plate, dessinés par leurs faces de DERRIÈRE (la géométrie a ses faces
       retournées : aucun `BackSide`, donc aucun programme de plus). Le cube plein les couvre, il ne reste que le liseré — un cœur blanc sans
       contour disparaît sur un ciel de jour ou dans la salle blanche de la boutique ;
     · `TC.g` — les cubes de LUEUR (additifs, translucides) : l'aura des éclairs, le halo de la tuyère, l'éclair blanc de la frappe.
   Le LANGAGE PIXEL, commun à toutes les traînées :
     · des cubes alignés sur la grille du MONDE, qui sautent de case en case (`TC_K.pas`) — jamais de fondu : le fondu est une TAILLE qui
       fond par crans (1 · ,84 · ,68 · ,5, comme la porte), et près de l'objectif aussi ; une lueur est faite de BANDES de cubes emboîtés ;
     · le mouvement est une SUITE d'images : le pétale bascule (à plat, debout, à plat tourné, debout de côté), le billet se retourne par quarts
       de tour (`TC_PERM`, `TC_SEQ`) — jamais une rotation lisse ;
     · des teintes en PALIERS (trois roses, trois verts), pas de dégradé.
   Chaque particule garde sa physique (`trxParts` : vent, balancement, gravité) : seul son DESSIN change, `p.cu` (1 pétale · 2 billet · 3 étincelle ·
   4 éclair blanc). L'aperçu du garage et la boutique passent par les mêmes émetteurs. `?trainee=lisse` (ou `signal`) rend les quads d'avant.
   Console : `dbgTrx()` rend aussi `cubes` (pleins, contours, lueurs).
   ========================================================================== */
const TC_ON=!/[?&]trainee=(lisse|signal)\b/.test(location.search);
const TC_K={pet:.105,bil:.1,bolt:.09,pas:.5}; // le CÔTÉ d'un cube (m, au garage ; ×2,3 en course pour les objets) : pétale · billet · éclair (× la largeur `wk` de l'éclair) — `pas` : la grille, en part du côté
var TC=null;
const TC_O=new Float32Array(3),TC_S=new Float32Array(3);
const TC_PERM=[[0,2,1],[0,1,2],[2,0,1],[2,1,0]]; // (long, court, épaisseur) en axes du monde : à plat · debout face à z · à plat tourné d'un quart · debout face à x
const TC_SEQ=[0,1,0,2,3,2]; // le billet : à plat, sur la tranche, à plat (le verso), tourné d'un quart…
const TC_PET=[[0,0,0],[1,0,1],[0,1,2]]; // les trois cellules du pétale : (a, b, teinte)
const TC_PETC=[[1.08,.68,.84],[1,.5,.7],[.9,.3,.55]]; // clair · rose · foncé (tops à 1, flancs ombrés par la face)
function tcPool(N,kind,op){ // kind : 's' plein · 'o' contour · 'g' lueur
  const bx=new THREE.BoxGeometry(1,1,1);
  if(kind==='s'){const ps=bx.attributes.position,nm=bx.attributes.normal,cl=new Float32Array(ps.count*3);
    for(let i=0;i<ps.count;i++){const ny=nm.getY(i),nz=nm.getZ(i),v=ny>.5?1:ny<-.5?.42:nz<-.5?.6:nz>.5?.5:.78;cl[i*3]=cl[i*3+1]=cl[i*3+2]=v;} // l'ombrage de la porte, face par face
    bx.setAttribute('color',new THREE.BufferAttribute(cl,3));}
  if(kind==='o'){const ix=bx.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t;}} // faces retournées : seul le DERRIÈRE du cube se dessine
  const mt=kind==='s'?new THREE.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false})
    :kind==='o'?new THREE.MeshBasicMaterial({fog:false,toneMapped:false})
    :new THREE.MeshBasicMaterial({fog:false,toneMapped:false,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}); // ⚠ les réglages EXACTS de NFEU.m / NFEU.h (et de l'arc-en-ciel) : mêmes programmes
  const m=new THREE.InstancedMesh(bx,mt,N);
  m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(N*3),3);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.instanceColor.setUsage(THREE.DynamicDrawUsage);
  m.count=0;m.frustumCulled=false;m.visible=false;if(kind==='g')m.renderOrder=2;scene.add(m);
  return {m:m,M:m.instanceMatrix.array,C:m.instanceColor.array,n:0,N:N};}
function tcBati(){if(!TC)TC={s:tcPool(1500,'s'),o:tcPool(500,'o'),g:tcPool(900,'g',.2)};return TC;}
function tcRaz(){if(TC)TC.s.n=TC.o.n=TC.g.n=0;}
function tcFin(){if(!TC)return;for(const Y of [TC.s,TC.o,TC.g]){const n=Y.n;Y.m.count=n;Y.m.visible=n>0;
  if(n){Y.m.instanceMatrix.updateRange.count=n*16;Y.m.instanceMatrix.needsUpdate=true;Y.m.instanceColor.updateRange.count=n*3;Y.m.instanceColor.needsUpdate=true;}}}
function tcCoupe(){if(!TC)return;for(const Y of [TC.s,TC.o,TC.g]){Y.n=0;Y.m.count=0;Y.m.visible=false;}}
function tcBox(Y,x,y,z,sx,sy,sz,r,g,b){if(Y.n>=Y.N)return;const o=Y.n*16,M=Y.M,c=Y.n*3; // un cube posé dans le MONDE : centre, côtés sur les axes du monde, couleur
  M[o]=sx;M[o+1]=M[o+2]=M[o+3]=M[o+4]=0;M[o+5]=sy;M[o+6]=M[o+7]=M[o+8]=M[o+9]=0;M[o+10]=sz;M[o+11]=0;M[o+12]=x;M[o+13]=y;M[o+14]=z;M[o+15]=1;
  Y.C[c]=r;Y.C[c+1]=g;Y.C[c+2]=b;Y.n++;}
function tcGlow(x,y,z,s,r,g,b){ // une LUEUR en pixels : trois cubes emboîtés qui s'additionnent — des bandes, pas un dégradé
  const G=TC.g;tcBox(G,x,y,z,s,s,s,r*.8,g*.8,b*.8);tcBox(G,x,y,z,s*.62,s*.62,s*.62,r,g,b);tcBox(G,x,y,z,s*.3,s*.3,s*.3,r,g,b);}
function tcLocal(Y,pm,ox,oy,oz,la,lb,ln,sa,sb,sn,r,g,b){ // un cube dans le repère (long, court, épaisseur) d'une pièce, dont `pm` donne les axes du monde
  TC_O[0]=ox;TC_O[1]=oy;TC_O[2]=oz;TC_O[pm[0]]+=la;TC_O[pm[1]]+=lb;TC_O[pm[2]]+=ln;TC_S[pm[0]]=sa;TC_S[pm[1]]=sb;TC_S[pm[2]]=sn;
  tcBox(Y,TC_O[0],TC_O[1],TC_O[2],TC_S[0],TC_S[1],TC_S[2],r,g,b);}
function tcPart(p,al,E){const T=TC,pv=TRX.C.pv;
  let f=al>=.8?1:al>=.55?.84:al>=.36?.68:al>=.18?.5:0;if(!f)return; // l'ancienne OPACITÉ devient la TAILLE : les cubes fondent par crans
  if(!pv){const c=camera.position,dx=p.x-c.x,dy=p.y-c.y,dz=p.z-c.z,d=Math.sqrt(dx*dx+dy*dy+dz*dz);f*=d<1.8?0:d<2.7?.5:d<3.8?.8:1;if(!f)return;} // près de l'objectif : par crans aussi
  const k=p.cu;
  if(k===1){ // LE PÉTALE : trois cubes plats, qui basculent
    const u0=TC_K.pet*E*(p.c===29?1.45:1),gq=u0*TC_K.pas,ox=Math.round(p.x/gq)*gq,oy=Math.round(p.y/gq)*gq,oz=Math.round(p.z/gq)*gq,
      pm=TC_PERM[((p.a*p.fl*.6+p.fp)|0)&3],mir=((p.fp*13)|0)&1?-1:1,v=p.c-27,s=u0*f*.96;
    for(let i=0;i<3;i++){const c=TC_PET[i],pc=TC_PETC[(c[2]+v)%3];
      tcLocal(T.s,pm,ox,oy,oz,(c[0]-.33)*u0*mir,(c[1]-.33)*u0,0,s,s,s*.42,pc[0]*p.cr,pc[1]*p.cg,pc[2]*p.cb);}
  }else if(k===2){ // LE BILLET : un cadre, un panneau, le médaillon — il se retourne par quarts de tour
    const u=TC_K.bil*E,gq=u*TC_K.pas,ox=Math.round(p.x/gq)*gq,oy=Math.round(p.y/gq)*gq,oz=Math.round(p.z/gq)*gq,pm=TC_PERM[TC_SEQ[((p.a*p.fl*.5+p.fp)|0)%6]],uf=u*f;
    tcLocal(T.s,pm,ox,oy,oz,0,0,0,4.4*uf,2.4*uf,.5*uf,.12,.46,.26);
    tcLocal(T.s,pm,ox,oy,oz,0,0,0,3.6*uf,1.5*uf,.8*uf,.28,.8,.46);
    tcLocal(T.s,pm,ox,oy,oz,0,0,0,1.1*uf,1.1*uf,.98*uf,.8,1.15,.85);
  }else if(k===3){ // L'ÉTINCELLE : une croix de cubes, à la couleur de la particule
    const u=p.w*E*.3,gq=u*TC_K.pas*2,x=Math.round(p.x/gq)*gq,y=Math.round(p.y/gq)*gq,z=Math.round(p.z/gq)*gq,s=u*f,a=s*1.5,r=p.cr*1.1,g=p.cg*1.1,b=p.cb*1.1,s7=s*.7,r7=r*.8,g7=g*.8,b7=b*.8;
    tcBox(T.s,x,y,z,s,s,s,r,g,b);tcBox(T.s,x+a,y,z,s7,s7,s7,r7,g7,b7);tcBox(T.s,x-a,y,z,s7,s7,s7,r7,g7,b7);
    tcBox(T.s,x,y+a,z,s7,s7,s7,r7,g7,b7);tcBox(T.s,x,y-a,z,s7,s7,s7,r7,g7,b7);tcBox(T.s,x,y,z+a,s7,s7,s7,r7,g7,b7);tcBox(T.s,x,y,z-a,s7,s7,s7,r7,g7,b7);
  }else if(k===4)tcGlow(p.x,p.y,p.z,p.w*E*1.3*f,p.cr*.5,p.cg*.5,p.cb*.5);} // L'ÉCLAIR BLANC : une lueur en bandes
function tcBolt(A,n,f,wk){ // UN ÉCLAIR EN CUBES : la ligne brisée posée case par case sur la grille du monde — cœur clair, contour violet, aura
  const C=TRX.C,T=TC,u=TC_K.bolt*wk,gq=1/u,q=f>.75?1:f>.5?.8:f>.3?.62:0;if(!q)return;let lx=1e9,ly=0,lz=0;
  for(let i=0;i+1<n;i++){const o=i*3,ax=A[o]+C.P.x,ay=A[o+1]+C.P.y,az=A[o+2]+C.P.z,dx=A[o+3]+C.P.x-ax,dy=A[o+4]+C.P.y-ay,dz=A[o+5]+C.P.z-az,
      m=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz))*gq));
    for(let s=i?1:0;s<=m;s++){const t=s/m,x=Math.round((ax+dx*t)*gq)/gq,y=Math.round((ay+dy*t)*gq)/gq,z=Math.round((az+dz*t)*gq)/gq;
      if(x===lx&&y===ly&&z===lz)continue;lx=x;ly=y;lz=z;
      tcBox(T.s,x,y,z,u*q,u*q,u*q,1.9,1.75,2.4);tcBox(T.o,x,y,z,u*q*1.75,u*q*1.75,u*q*1.75,.38,.1,.95);tcBox(T.g,x,y,z,u*3.4,u*3.4,u*3.4,.5,.25,1.4);}}}
