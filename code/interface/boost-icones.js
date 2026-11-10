/* ===== LES ICÔNES DU BOUTON BOOST (2026-11-01, Léo : « change l'éclair par un truc intelligent ou stylé, genre une bouteille nitro, on peut tester plusieurs trucs ») ===== ?boost=bouteille|chevrons|anneau (SVG) ou flamme (en pixels, voir plus bas) : un SVG en verre dans #tNitro à la place de l'éclair en pixels (le style vit dans charte-7-details.css) ; rien dans l'URL = l'éclair, comme avant. */
const BV_ICO={"bouteille": "<svg class=\"bvIco bv-bouteille\" viewBox=\"0 0 40 66\" aria-hidden=\"true\"><defs><clipPath id=\"bvCb\"><path d=\"M14 9h12v6q8 2 8 12v27q0 8-8 8H14q-8 0-8-8V27q0-10 8-12z\"/></clipPath></defs><g clip-path=\"url(#bvCb)\"><rect class=\"bvLx\" x=\"0\" y=\"15\" width=\"40\" height=\"52\"/><rect class=\"bvLq\" x=\"0\" y=\"15\" width=\"40\" height=\"52\"/></g><path class=\"bvLn\" d=\"M14 9h12v6q8 2 8 12v27q0 8-8 8H14q-8 0-8-8V27q0-10 8-12z\"/><path class=\"bvLn\" d=\"M11 4h18v5H11z\"/><path class=\"bvBr\" d=\"M10 31h20M10 36h20\"/><path class=\"bvSh\" d=\"M11 22q-2 4-2 10\"/></svg>", "chevrons": "<svg class=\"bvIco bv-chevrons\" viewBox=\"0 0 48 52\" aria-hidden=\"true\"><path class=\"bvCh c3\" d=\"M8 46l16-14 16 14\"/><path class=\"bvCh c2\" d=\"M8 31l16-14 16 14\"/><path class=\"bvCh c1\" d=\"M8 16l16-14 16 14\"/></svg>", "anneau": "<svg class=\"bvIco bv-anneau\" viewBox=\"0 0 64 64\" aria-hidden=\"true\"><circle class=\"bvPi\" cx=\"32\" cy=\"32\" r=\"27\"/><circle class=\"bvRx\" cx=\"32\" cy=\"32\" r=\"27\" pathLength=\"100\"/><circle class=\"bvRq\" cx=\"32\" cy=\"32\" r=\"27\" pathLength=\"100\"/><path class=\"bvCh d2\" d=\"M21 38l11-10 11 10\"/><path class=\"bvCh d1\" d=\"M21 29l11-10 11 10\"/></svg>"};
{const bv=(/[?&]boost=([a-z]+)/.exec(location.search)||[])[1],bt=document.getElementById('tNitro');
 if(!bv||bv==='flamme'){NX3.flame=true;document.body.classList.add('bvF');} // (2026-11-01, Léo : « changer l'icône en haut aussi ») LA FLAMME EST LE BOUTON PAR DÉFAUT ; ?boost=eclair rend l'éclair d'avant
 else if(bv==='eclair'){}
 else if(bv&&BV_ICO[bv]&&bt){bt.insertAdjacentHTML('beforeend',BV_ICO[bv]);document.body.classList.add('bv','bv-'+bv);}}
/* ===== LA FLAMME EN PIXELS (2026-11-01, Léo : « flamme mais plus stylé, qui autour du doigt s'enflamme de plus en plus (couleurs et intensité) quand on maintient, même style que l'éclair actuel mais flamme ») =====
   Même pipeline que l'éclair (grille de cases, contour d'encre, épaisseur dessous, lueur en cases, enfoncement) — seule la FORME change : une flamme qui vacille (tête qui se balance,
   flancs qui bougent), dessinée du bord vers le cœur (bord foncé → plein → clair → cœur blanc). NX3.heat (0 → 1 en 2,2 s de doigt posé, retombe en 0,7 s) la fait GRANDIR, lui donne
   deux langues de chaque côté (> 30 % et > 55 %), des étincelles (> 50 %), un cœur blanc-bleu (> 70 %) et la fait passer de la braise (f0) au blanc brûlant (f3) ; la réserve bleue,
   la nitro infinie (violet) et le « à sec » (gris) gardent leurs palettes. Redessinée 7 à 16 fois par seconde, pas à chaque image. */
function nxfMasque(fh,fr){
  const gw=15,gh=20,m=NX3.fm||(NX3.fm=new Uint8Array(gw*gh));m.fill(0);
  const fl=function(cx,haut,w,ph,sw){const bas=gh-1;
    for(let y=bas;y>=Math.max(0,bas-haut);y--){const v=(bas-y)/haut,hw=w*Math.pow(1-v,.7)*(.55+.45*Math.sin(Math.min(1,v*3)*1.5708)),
      c=cx+sw*Math.pow(v,1.5)*Math.sin(fr*.9+ph+v*3),j=.35*Math.sin(fr*1.3+ph*2+y*1.1);
      for(let x=0;x<gw;x++)if(Math.abs(x-c)<=hw+j+.35)m[y*gw+x]=1;}};
  fl(7,Math.round(11+8*fh+1.2*Math.sin(fr*.7)),4+.8*fh,0,1.6+fh);
  if(fh>.3)fl(2,Math.round(5+7*fh+1.2*Math.sin(fr+1)),2,2,1);
  if(fh>.55)fl(12,Math.round(5+7*fh+1.2*Math.sin(fr*1.1+4)),2,4,1);
  return m;
}
/* ===== LA BOULE DE FEU-POUCE (2026-11-10, Sacha : « plus gros, la forme d'une boule de feu à l'envers et surtout d'un pouce — la chair en rouge, l'ongle en jaune — que ça se déplace un peu comme un joystick,
   et que la flamme parte dans l'autre sens, comme du vent » ; puis « le pouce doit faire partie des flammes », « plus subtil », « perfectionne l'animation, le debug, l'optimisation ») =====
   Même pipeline que la flamme d'avant (grille de cases, contour d'encre, lueur en cases, palettes selon la chaleur du doigt) — la FORME et le MOUVEMENT changent. Tout est dessiné en « unités »
   (1 unité = 4/3 case ; NXP.Z) pour que la grille puisse être affinée sans refaire la forme.
   LA FORME
   · LA TÊTE : un disque de feu de NXP.R unités dont la lisière ondule (deux harmoniques qui tournent), TÊTE EN HAUT, queue vers le bas — la boule « à l'envers », qui pend sous le pouce comme une comète
     qui monte ; le feu se lit du bord vers le centre (bord foncé → plein → clair → cœur).
   · LE CŒUR : au centre, une goutte de braises debout (rouge sombre → rouge-orangé) et, en haut, un point chaud ovale (orange → jaune pâle) : on y devine un doigt et son ongle sans que la forme le dise.
     Aucun contour : sa lisière est mordue par le même bruit que la flamme, son bas se tramé dans le feu. Appuyer blanchit le point chaud.
   · LA QUEUE : une goutte principale qui ondule en S + 2 à 4 langues (selon la chaleur) + 3 mèches qui montent de la tête, chacune à son rythme.
   LE MOUVEMENT
   · LE FEU COULE : la lisière et les bandes sont mordues par deux bruits (fin et gros) qui DÉFILENT d'une case par image en s'éloignant de la tête — vers le bas dans la queue, vers le haut dans les
     mèches. Le feu a un sens ; avant, un tirage au hasard par image le faisait seulement grésiller.
   · LE VENT : NX3.wx (−1 gauche … 1 droite) courbe la racine des langues, NX3.wx2 leur POINTE — un second ressort, sous-amorti, qui suit wx avec retard : au coup de vent la racine part, la pointe
     fouette et dépasse. NX3.wy (> 0 : la boule monte) allonge la queue. Ils viennent du glissé du doigt (nx3Souffle) : la boule file d'un côté, la flamme part de l'AUTRE.
   · L'APPUI : NX3.p (le ressort de l'appui, continu) tasse la tête de 6 % et la descend ; au lâcher il dépasse — la boule gonfle un instant.
   · L'ALLUMAGE : au départ de la course la flamme naît (NX3.nais, 0 → 1 en 0,5 s, avec dépassement) ; quand la nitro prend (NX3.fl), un éclat d'un cran de chaleur et une gerbe d'étincelles.
   · À SEC : la flamme se ratatine (queue et mèches à 62 %), grise, contour qui clignote rouge.
   · LES ÉTINCELLES : NX3.sp, des cases qui se détachent de la queue et filent dans le sens du vent.
   LE COÛT (mesuré : dbgNitro3().ms) — la forme de chaque langue (axe, largeur) est mise en TABLE par pas de 1/4 d'unité avant la boucle : par case il ne reste que des produits et deux lectures ; seule la
   boîte de ce qui brûle est évaluée, effacée et renvoyée à l'écran (putImageData partiel) ; palettes converties une fois ; aucune allocation par image. 10 à 16 dessins par seconde, 33 au plus pendant un glissé. */
const NXP={Z:4/3,GW:60,GH:66,CX:22.5,CY:16,R:10.5,BOX_W:30,BOX_H:48,JR:34,UW:45,UH:49.5,PAS:4,NS:128,
  PALS:['f0','f1','f2','f3','bleu','vio','vioF','sec'],
  /* le cœur de braises [bord, milieu, cœur] · le point chaud [bord, plein, clair, appuyé] — par palette */
  DOIGT:{f0:[['#c42812','#e8401a','#ff6420'],['#ff9a1f','#ffca2e','#fff0a0','#fff8d0']],
         f1:[['#c82a12','#ec461a','#ff6a22'],['#ffa01f','#ffd23f','#fff3a8','#fffbd8']],
         f2:[['#cc2e12','#f04c1c','#ff7424'],['#ffa820','#ffdc4a','#fff6b8','#ffffff']],
         f3:[['#d03412','#f4561e','#ff7e2a'],['#ffb028','#ffe566','#fffad0','#ffffff']],
         bleu:[['#1a2aa0','#2e48d8','#4a68f0'],['#8fa4ff','#c8d4ff','#eef2ff','#ffffff']],
         vio:[['#6e0500','#b00c00','#e01a0a'],['#ff8a7a','#ffc0b8','#ffe8e4','#ffffff']],
         vioF:[['#7a0a00','#c41208','#ff3a2a'],['#ffa090','#ffd0c8','#fff0ee','#ffffff']],
         sec:[['#3a3458','#4a4468','#6e6890'],['#8a84aa','#a49cc4','#c8c2e0','#e0dcf0']]},
  /* les BANDES du feu par palier de chaleur [bord, plein, clair, cœur] — plus orangées que f0-f3 d'avant (le blanc brûlant mangeait le point chaud) ; les autres palettes gardent les leurs */
  BANDES:{f0:['#c8330a','#ff7a1a','#ffb52e','#ffe27a'],f1:['#d8420a','#ff8f1f','#ffc24a','#fff0a0'],f2:['#e85a0c','#ffa21f','#ffd95a','#fff6c0'],f3:['#ff8a1a','#ffc844','#fff0a0','#ffffff']},
  pc:{},B:null,Lc:20};
function nxpInit(){const G=NXP,N=G.GW*G.GH;G.B=new Uint8Array(N);G.E=new Uint8Array(N);G.P=new Int32Array(N);G.T=new Uint8Array(N);G.D=new Uint8Array(N);
  G.N1=new Uint8Array(4096);G.N2=new Uint8Array(4096);let h=0x9e3779b9|0;const tire=function(){h^=h<<13;h^=h>>>17;h^=h<<5;return h&255;}; /* deux bruits 64 × 64 (fin, gros), toujours les mêmes */
  for(let i=0;i<4096;i++){G.N1[i]=tire();G.N2[i]=tire();}
  G.CEN=new Float32Array(8*G.NS);G.WID=new Float32Array(8*G.NS);G.S=new Float32Array(8*9);G.rc=[0,0,-1,-1];}
function nxpPal(pal){let c=NXP.pc[pal];
  if(!c){const P=NX3_PAL[pal]||NX3_PAL.f1,D=NXP.DOIGT[pal]||NXP.DOIGT.f1;
    c=NXP.pc[pal]={bd:(NXP.BANDES[pal]||[P[3],P[1],P[2],P[0]]).map(nx3Rgb),chair:D[0].map(nx3Rgb),ong:D[1].map(nx3Rgb),ink:nx3Rgb(P[7]),rouge:nx3Rgb('#ff5a6e'),lueur:nx3Rgb(pal==='f3'?'#ffb347':P[6])&0x00ffffff};}
  return c;}
function nxfDessine(d,pal,a,clig){
  const G=NXP;if(!G.B)nxpInit();
  const Z=G.Z,W=G.GW,H=G.GH,u=NX3.u32,B=G.B,N1=G.N1,N2=G.N2,pc=nxpPal(pal),bd=pc.bd,ink=clig?pc.rouge:pc.ink,
    fh=NX3.fh||0,fr=NX3.ft||0,wx=NX3.wx||0,wx2=NX3.wx2||0,wy=NX3.wy||0,p=NX3.p||0,fl=NX3.fl||0,na=NX3.nais==null?1:NX3.nais,
    e9=na>=1?1:1+2.2*Math.pow(na-1,3)+1.2*Math.pow(na-1,2),sc=.25+.75*e9,sec=pal==='sec'?.62:1; /* la naissance : une sortie « élastique » (dépasse puis se pose) */
  /* on efface le rectangle de l'image d'avant, pas toute la toile */
  const rc=G.rc;for(let y=rc[1];y<=rc[3];y++){const o=y*W;u.fill(0,o+rc[0],o+rc[2]+1);B.fill(0,o+rc[0],o+rc[2]+1);}
  const cx=G.CX,cy=G.CY+.8*Math.max(0,p),R=(G.R*(1-.06*p)+.5*Math.sin(fr*.9)*(.3+fh))*sc,
    L=Math.max(8,Math.min(22.5,(20+2.5*fh+2.5*Math.max(0,wy)-5*Math.max(0,-wy))*(1-.16*Math.abs(wx2))))*sc*sec,sw=(2.2+2.2*fh)*sc,KW=15*sc,lk=sc*sec;
  G.Lc=L;
  /* les langues : [x et y de la racine, dx, dy, longueur, rayon de base, phase, part du vent, part de l'ondulation] — la principale, les côtés, (chaud) deux de plus, puis les trois mèches de la tête */
  const S=G.S;let ns=0;
  const aj=function(ox,oy,dx,dy,Ls,r0,ph,kf,kk){const o=ns*9;S[o]=ox;S[o+1]=oy;S[o+2]=dx;S[o+3]=dy;S[o+4]=Ls;S[o+5]=r0;S[o+6]=ph;S[o+7]=kf;S[o+8]=kk;ns++;};
  aj(cx,cy,0,1,L,R,0,1,1);
  aj(cx-6.8*sc,cy+2.5*sc,0,1,L*.66,3.7*sc,2.1,1,.65);aj(cx+6.8*sc,cy+2.5*sc,0,1,L*.58,3.3*sc,4.2,1,.65);
  if(fh>.42){aj(cx-3.4*sc,cy+5*sc,0,1,L*.7,3.4*sc,1,1,.65);aj(cx+3.4*sc,cy+5*sc,0,1,L*.64,3*sc,5,1,.65);} /* plus courtes que la principale : rien ne dépasse sa pointe (le bas de l'écran est à 16 px) */
  aj(cx-5.6*sc,cy-8*sc,-.3,-.95,(4.2+2.5*fh+1.4*Math.sin(fr*1.3))*lk,3*sc,3.3,.3,.5);
  aj(cx+.4*sc,cy-9.5*sc,.04,-1,(5+2.8*fh+1.6*Math.sin(fr*1.1+2))*lk,3.2*sc,.9,.3,.5);
  aj(cx+6*sc,cy-8.2*sc,.42,-.9,(3.9+2.5*fh+1.4*Math.sin(fr*1.7+4))*lk,2.8*sc,5.1,.3,.5);
  /* LES TABLES : pour chaque langue, par pas de 1/4 d'unité le long de son axe — l'écart de l'axe (vent de la racine, vent de la pointe, ondulation) et la demi-largeur (la pente de l'axe élargit la
     coupe : sinon une queue très penchée se réduit à des points). Et la boîte de tout ce qui peut brûler. */
  const PAS=G.PAS,NS=G.NS,CEN=G.CEN,WID=G.WID;let ux0=1e9,ux1=-1e9,uy0=1e9,uy1=-1e9;
  for(let k=0;k<ns;k++){const o=k*9,ox=S[o],oy=S[o+1],dx=S[o+2],dy=S[o+3],Ls=S[o+4],r0=S[o+5],ph=S[o+6],kf=S[o+7],kk=S[o+8],n=Math.min(NS-1,Math.ceil(Ls*PAS)),b=k*NS;let c0=0,c1=0;
    for(let i=0;i<=n;i++){const s=(i+.5)/PAS,t=s<Ls?s/Ls:1,c=KW*kf*(wx*1.4*Math.pow(t,1.5)*(1-t)+wx2*Math.pow(t,1.9))*dy+sw*kk*Math.sin(ph+fr*.9+s*.42)*t;CEN[b+i]=c;if(c<c0)c0=c;if(c>c1)c1=c;}
    for(let i=0;i<=n;i++){const s=(i+.5)/PAS,t=s<Ls?s/Ls:1,m=(CEN[b+(i<n?i+1:n)]-CEN[b+(i>0?i-1:0)])*PAS/2;WID[b+i]=r0*(1-Math.pow(t,1.1))*Math.sqrt(1+m*m);}
    const lo=c0-1.5*r0,hi=c1+1.5*r0,ex=ox+dx*Ls,ey=oy+dy*Ls,ax=dy,ay=-dx;
    ux0=Math.min(ux0,ox-1.2*r0,ox+lo*ax,ox+hi*ax,ex+lo*ax,ex+hi*ax);ux1=Math.max(ux1,ox+1.2*r0,ox+lo*ax,ox+hi*ax,ex+lo*ax,ex+hi*ax);
    uy0=Math.min(uy0,oy-1.2*r0,oy+lo*ay,oy+hi*ay,ey+lo*ay,ey+hi*ay);uy1=Math.max(uy1,oy+1.2*r0,oy+lo*ay,oy+hi*ay,ey+lo*ay,ey+hi*ay);}
  const bx0=Math.max(4,Math.floor(ux0*Z)-1),bx1=Math.min(W-5,Math.ceil(ux1*Z)+1),by0=Math.max(4,Math.floor(uy0*Z)-1),by1=Math.min(H-5,Math.ceil(uy1*Z)+1),cyc=Math.round(cy*Z),ecl=fl*.25;
  for(let y=by0;y<=by1;y++){const py=(y+.5)/Z,yy=y-cyc,fy=(yy<0?-yy:yy)-fr,l1=(fy&63)<<6,l2=((fy>>1)&63)<<6; /* le bruit défile en s'éloignant de la tête */
    for(let x=bx0;x<=bx1;x++){
      let q=-1;const px=(x+.5)/Z;
      for(let k=0;k<ns;k++){const o=k*9,vx=px-S[o],vy=py-S[o+1],dx=S[o+2],dy=S[o+3],r0=S[o+5],s=vx*dx+vy*dy;
        if(s<-1.15*r0||s>=S[o+4])continue;
        const lat=vx*dy-vy*dx;let qk;
        if(s<0){const r=Math.sqrt(s*s+lat*lat);let rr=r0;
          if(k===0&&r>.3*r0){const th=Math.atan2(lat,s);rr=r0*(1+.07*Math.sin(3*th+fr*.55)+.05*Math.sin(5*th-fr*.8));}
          qk=1-r/rr;}
        else{const i=k*NS+((s*PAS)|0),w=WID[i];let uu=lat-CEN[i];if(uu<0)uu=-uu;if(uu>=w)continue;qk=1-uu/w;}
        if(qk>q)q=qk;}
      if(q<-.2)continue;
      const nz=(N1[(x&63)|l1]-128)/255,ng=(N2[((x>>1)&63)|l2]-128)/255;
      if(q+nz*.14+ng*.2>0){const qq=q+nz*.2+ng*.5+ecl,i=y*W+x; /* le gros bruit pèse sur les BANDES : des veines plus sombres coulent dans le feu clair */B[i]=1;u[i]=qq<.14?bd[0]:qq<.3?bd[1]:qq<.62?bd[2]:bd[3];}
    }}
  /* les trous de 1-2 cases entre deux langues se bouchent (un trou d'encre isolé, dans le feu, faisait un œil)… */
  for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){const i=y*W+x;if(B[i])continue;
    const n=(B[i-W-1]&1)+(B[i-W]&1)+(B[i-W+1]&1)+(B[i-1]&1)+(B[i+1]&1)+(B[i+W-1]&1)+(B[i+W]&1)+(B[i+W+1]&1);if(n>=6){B[i]=2;u[i]=bd[0];}}
  for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++)if(B[y*W+x]===2)B[y*W+x]=1;
  /* …et tout vide ENCLOS (non relié au bord de la boîte) se remplit : une langue qui se replie sur la queue laissait une tache d'encre au milieu du feu */
  {const E=G.E,pile=G.P;let np=0;
   for(let y=by0;y<=by1;y++)E.fill(0,y*W+bx0,y*W+bx1+1);
   const pousse=function(i){if(!B[i]&&!E[i]){E[i]=1;pile[np++]=i;}};
   for(let x=bx0;x<=bx1;x++){pousse(by0*W+x);pousse(by1*W+x);}for(let y=by0;y<=by1;y++){pousse(y*W+bx0);pousse(y*W+bx1);}
   while(np>0){const i=pile[--np],x=i%W,y=(i/W)|0;if(x>bx0)pousse(i-1);if(x<bx1)pousse(i+1);if(y>by0)pousse(i-W);if(y<by1)pousse(i+W);}
   for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){const i=y*W+x;if(!B[i]&&!E[i]){B[i]=1;u[i]=bd[1];}}}
  /* LE CŒUR DE BRAISES et son POINT CHAUD (le doigt et l'ongle, à deviner) : incliné (le vent le penche), mordu par le même bruit qui coule, tramé dans le feu vers le bas */
  if(sc>.5){const chair=pc.chair,ong=pc.ong,press=p>.55,phi=-.14-.2*wx,cf=Math.cos(phi),sf=Math.sin(phi),tx=cx+wx*.8,ty=cy+.5*sc,
      hx0=Math.max(bx0,Math.floor((tx-6.2*sc)*Z)),hx1=Math.min(bx1,Math.ceil((tx+6.2*sc)*Z)),hy0=Math.max(by0,Math.floor((ty-10.6*sc)*Z)),hy1=Math.min(by1,Math.ceil((ty+11.6*sc)*Z));
    for(let y=hy0;y<=hy1;y++){const dyu=((y+.5)/Z-ty)/sc,yy=y-cyc,fy=(yy<0?-yy:yy)-fr+31,l1=(fy&63)<<6,l2=((fy>>1)&63)<<6;
      for(let x=hx0;x<=hx1;x++){const dxu=((x+.5)/Z-tx)/sc,xl=cf*dxu+sf*dyu,yl=-sf*dxu+cf*dyu;if(yl<-9.4||yl>10.8)continue;
        const t=(yl-1.2)/9.2,axl=4.6*(t>0?1-.5*t:1),r=Math.sqrt(xl*xl/(axl*axl)+t*t);let dp=(1-r)*4.2;
        if(yl>4.2){const m=(10.8-yl)*.7;if(m<dp)dp=m;}
        if(dp<-1)continue;
        const nz=(N1[((x+17)&63)|l1]-128)/255,nsw=.4*Math.sin(yl*.85+fr*.8+xl*.3);
        dp+=nz*.9+nsw;if(yl>4.2)dp-=(yl-4.2)*.22*(1+N2[(x&63)|l2]/255);
        if(dp<=0)continue;
        const i=y*W+x,ro=Math.sqrt(xl*xl/9.61+(yl+4.7)*(yl+4.7)/15.21),od=(1-ro)*3+nz*.9+nsw*.6;B[i]=1;
        if(od>0)u[i]=press?(od<.8?ong[1]:ong[3]):(od<.7?ong[0]:od<1.5?ong[1]:ong[2]);
        else{const sh=dp-xl*.08;u[i]=sh<.9?chair[0]:sh<2.2?chair[1]:chair[2];}
      }}}
  /* le rectangle de l'image : la boîte + 4 cases (contour et lueur), élargi aux étincelles */
  let rx0=bx0-4,rx1=bx1+4,ry0=by0-4,ry1=by1+4;if(rx0<1)rx0=1;if(ry0<1)ry0=1;if(rx1>W-2)rx1=W-2;if(ry1>H-2)ry1=H-2;
  /* le contour d'encre (1 case) et la lueur en cases (2 anneaux) : trois dilations successives du feu (carré 3 × 3, deux passes séparables), sans toucher les cases déjà peintes */
  const T=G.T,D=G.D,g1=(pc.lueur|Math.round(a*.78*255)<<24)>>>0,g2=(pc.lueur|Math.round(a*.36*255)<<24)>>>0,tours=a>.02?3:1;
  for(let y=ry0-1;y<=ry1+1;y++){const o=y*W;for(let x=rx0-1;x<=rx1+1;x++)D[o+x]=B[o+x];}
  for(let r=1;r<=tours;r++){const c=r===1?ink:r===2?g1:g2;
    for(let y=ry0-1;y<=ry1+1;y++){const o=y*W;for(let x=rx0;x<=rx1;x++){const i=o+x;T[i]=D[i-1]|D[i]|D[i+1];}}
    for(let y=ry0;y<=ry1;y++){const o=y*W;for(let x=rx0;x<=rx1;x++){const i=o+x;if(!D[i]&&(T[i-W]|T[i]|T[i+W])){u[i]=c;D[i]=1;}}}
  }
  /* les étincelles (positions en unités, relatives à la toile) : une case chacune, du clair au foncé, hors du feu */
  let sx0=rx0-1,sx1=rx1+1,sy0=ry0-1,sy1=ry1+1;
  const sp=NX3.sp;if(sp&&sp.length)for(let k=0;k<sp.length;k++){const e=sp[k],X=Math.round(e.x*Z),Y=Math.round(e.y*Z);
    if(X>=0&&Y>=0&&X<W&&Y<H&&!B[Y*W+X]){u[Y*W+X]=e.l>.55?bd[3]:e.l>.28?bd[2]:bd[1];if(X<sx0)sx0=X;if(X>sx1)sx1=X;if(Y<sy0)sy0=Y;if(Y>sy1)sy1=Y;}}
  /* à l'écran : seulement l'union de l'ancien rectangle et du nouveau */
  let px0=sx0,px1=sx1,py0=sy0,py1=sy1;if(rc[2]>=rc[0]){if(rc[0]<px0)px0=rc[0];if(rc[2]>px1)px1=rc[2];if(rc[1]<py0)py0=rc[1];if(rc[3]>py1)py1=rc[3];}
  rc[0]=sx0;rc[1]=sy0;rc[2]=sx1;rc[3]=sy1;
  NX3.cx.putImageData(NX3.img,0,0,px0,py0,px1-px0+1,py1-py0+1);
}
/* LE GLISSÉ ET LE VENT (même demande) : la boule se déplace sous le pouce dans un rayon de NXP.JR px, comme un joystick, SEULEMENT pendant l'appui (le point d'appui = le centre) ; la flamme part
   dans l'autre sens. Un ressort suit le doigt (légèrement amorti), au lâcher il revient en dépassant son point de repos — la flamme fouette. Pure décoration : la nitro, la figure au glissé (GLI)
   et le volant ne voient rien de ce déplacement (écouteurs à part, passifs). Réduire les animations : pas de dépassement, pas de fouet, pas d'étincelles, pas de souffle ambiant. */
function nx3Pouce(){
  const J=NX3.J={id:null,x0:0,y0:0,tx:0,ty:0,ox:0,oy:0,vx:0,vy:0};
  const dn=function(id,x,y){if(J.id!=null)return;J.id=id;J.x0=x;J.y0=y;J.tx=J.ty=0;},
    mv=function(id,x,y){if(J.id!==id)return;let dx=x-J.x0,dy=y-J.y0;const r=Math.hypot(dx,dy),R=NXP.JR;if(r>R){dx*=R/r;dy*=R/r;}J.tx=dx;J.ty=dy;},
    up=function(id){if(J.id!==id)return;J.id=null;J.tx=J.ty=0;},
    lache=function(){J.id=null;J.tx=J.ty=0;};
  [document.getElementById('tNitro'),document.getElementById('tNitroZone')].forEach(function(el){if(!el)return;
    el.addEventListener('touchstart',function(e){const t=e.changedTouches[0];if(t)dn('t'+t.identifier,t.clientX,t.clientY);},{passive:true});
    el.addEventListener('touchmove',function(e){for(let i=0;i<e.changedTouches.length;i++){const t=e.changedTouches[i];mv('t'+t.identifier,t.clientX,t.clientY);}},{passive:true});
    el.addEventListener('touchend',function(e){for(let i=0;i<e.changedTouches.length;i++)up('t'+e.changedTouches[i].identifier);},{passive:true});
    el.addEventListener('touchcancel',lache,{passive:true});
    el.addEventListener('mousedown',function(e){dn('m',e.clientX,e.clientY);});});
  addEventListener('mousemove',function(e){if(J.id==='m')mv('m',e.clientX,e.clientY);});
  addEventListener('mouseup',function(){up('m');});
  addEventListener('blur',lache);
  document.addEventListener('visibilitychange',function(){if(document.hidden)lache();}); /* l'appli part derrière en plein appui : iOS n'envoie pas toujours touchcancel (même piège que le volant) */
}
function nx3Souffle(dt,appui,rm,fh){
  const J=NX3.J;if(!J)return;
  if(J.id!=null&&!appui&&NX3.pF==null)J.id=null; /* le doigt n'appuie plus (lâché ailleurs, pause, fin de course) : la boule ne reste jamais accrochée */
  const tenu=J.id!=null,h=Math.min(dt,.05)/2,k=tenu?520:760,c=tenu?42:(rm?60:17);
  for(let i=0;i<2;i++){J.vx+=(k*((tenu?J.tx:0)-J.ox)-c*J.vx)*h;J.vy+=(k*((tenu?J.ty:0)-J.oy)-c*J.vy)*h;J.ox+=J.vx*h;J.oy+=J.vy*h;}
  if(!tenu&&Math.abs(J.ox)<.05&&Math.abs(J.oy)<.05&&Math.abs(J.vx)<1&&Math.abs(J.vy)<1){J.ox=J.oy=J.vx=J.vy=0;}
  const R=NXP.JR,cl=function(v){return v<-1?-1:v>1?1:v;},vF=NX3.vF,
    wxT=vF?vF[0]:cl(-J.ox/R*1.05-J.vx/(R*16))+(rm?0:.07*Math.sin(NX3.t*1.9)),wyT=vF?vF[1]:cl(-J.oy/R*.85-J.vy/(R*20)),f=Math.min(1,dt*16);
  NX3.wx=(NX3.wx||0)+(wxT-(NX3.wx||0))*f;NX3.wy=(NX3.wy||0)+(wyT-(NX3.wy||0))*f;
  /* la POINTE de la queue : un second ressort sous-amorti (≈ 1,3 Hz, amortissement 0,45) qui suit le vent de la racine avec retard */
  if(rm){NX3.wx2=NX3.wx;NX3.wv2=0;}
  else{let w2=NX3.wx2||0,v2=NX3.wv2||0;for(let i=0;i<2;i++){v2+=(70*(NX3.wx-w2)-7.5*v2)*h;w2+=v2*h;}NX3.wx2=w2<-1.3?-1.3:w2>1.3?1.3:w2;NX3.wv2=v2;}
  const ox=Math.round(J.ox*2)/2,oy=Math.round(J.oy*2)/2;
  if(ox!==NX3.trX||oy!==NX3.trY){NX3.trX=ox;NX3.trY=oy;NX3.cv.style.transform=(ox||oy)?'translate('+ox+'px,'+oy+'px)':'';}
  /* les étincelles : 4 à 10 par seconde selon la chaleur, qui se détachent de la queue (le long de son axe) et filent dans le sens du vent — positions en unités */
  const sp=NX3.sp||(NX3.sp=[]),veut=rm?0:(appui?10:(NX3.k>.5?7:(fh>.2?4:0))),w2=NX3.wx2||0;
  NX3.spT=(NX3.spT||0)+dt*veut;if(NX3.spT>2)NX3.spT=0;
  while(NX3.spT>=1&&sp.length<16){NX3.spT-=1;const t=.45+.55*Math.random();
    sp.push({x:NXP.CX+15*w2*t*t+(Math.random()-.5)*7*(1-t*.6),y:NXP.CY+NXP.Lc*t,vx:(Math.random()-.5)*7+w2*22,vy:8+Math.random()*10,l:1});}
  for(let i=sp.length-1;i>=0;i--){const e=sp[i];e.l-=dt*1.5;e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx+=(w2*26-e.vx*1.2)*dt;if(e.l<=0||e.y>=NXP.UH-1||e.y<1||e.x<1||e.x>=NXP.UW-1)sp.splice(i,1);}
}
/* la gerbe : n étincelles qui partent de la tête en couronne (l'instant où la nitro prend) */
function nxfGerbe(n){const sp=NX3.sp||(NX3.sp=[]);for(let i=0;i<n&&sp.length<24;i++){const an=6.283*(i+Math.random()*.6)/n,v=20+Math.random()*14;
  sp.push({x:NXP.CX+Math.cos(an)*9,y:NXP.CY+Math.sin(an)*9,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:.5+Math.random()*.25});}}
/* hors course (accueil, garage, écran de fin) : tout revient au repos, la flamme renaîtra au prochain départ */
function nxfRepos(){if(NX3.repos)return;NX3.repos=true;const J=NX3.J;if(J){J.id=null;J.tx=J.ty=J.ox=J.oy=J.vx=J.vy=0;}
  NX3.wx=NX3.wx2=NX3.wv2=NX3.wy=0;NX3.nais=0;NX3.fl=0;NX3.heat=0;NX3.brule=false;if(NX3.sp)NX3.sp.length=0;NX3.k1=-1;
  if(NX3.cv&&(NX3.trX||NX3.trY)){NX3.trX=NX3.trY=0;NX3.cv.style.transform='';}}
/* L'IMAGE DE LA FLAMME : ce qui change la clé (deux entiers, aucune chaîne) déclenche un dessin — 10 à 16 par seconde au repos (le pas de l'animation), 33 au plus pendant un glissé ou un ressort ;
   l'appui, lui, se redessine à l'instant. Régime chaud du téléphone (mobhChaud) : au plus un dessin toutes les 66 ms hors appui, comme avant. */
function nxfTick(dt,d,pal,aQ,clig,appui,rm,fh){
  NX3.repos=false;
  NX3.nais=rm?1:Math.min(1,(NX3.nais||0)+dt/.5);
  const brule=NX3.k>.5;if(brule&&!NX3.brule&&!rm){NX3.fl=1;nxfGerbe(10);}NX3.brule=brule;NX3.fl=Math.max(0,(NX3.fl||0)-dt/.22);
  NX3.fh=Math.round(fh*20)/20;NX3.ft=rm?0:Math.floor(NX3.t*(10+6*fh));
  nx3Souffle(dt,appui,rm,fh);
  const palI=NXP.PALS.indexOf(pal)&15,
    k1=(d+2)|(palI<<3)|(Math.round(aQ*6)<<7)|((clig?1:0)<<10)|(Math.round(NX3.fh*20)<<11)|(Math.round((NX3.p+.4)*8)<<16)|(Math.round(NX3.fl*4)<<21)|(Math.round(NX3.nais*16)<<24),
    k2=NX3.ft*32768+(Math.round(NX3.wx*14)+16)*1024+(Math.round((NX3.wx2||0)*12)+16)*32+Math.round(NX3.wy*10)+12+((NX3.sp&&NX3.sp.length)?.5:0);
  if(k1===NX3.k1&&k2===NX3.k2)return;
  const tn=performance.now();
  if(mobhChaud()){if(d===MOBH_nx3D&&tn-MOBH_nx3T<MOBH_R.nx3Ms)return;MOBH_nx3T=tn;}
  else if(d===MOBH_nx3D&&pal===NX3.palD&&tn-(NX3.tD||0)<29)return;
  MOBH_nx3D=d;NX3.palD=pal;NX3.tD=tn;NX3.k1=k1;NX3.k2=k2;
  nxfDessine(d,pal,aQ,clig);NX3.ms=(NX3.ms||0)*.9+(performance.now()-tn)*.1;NX3.nD=(NX3.nD||0)+1;
}
function nxfRows(){const m=nxfMasque(.35,2),r=[];for(let y=0;y<20;y++){let t='';for(let x=0;x<15;x++)t+=m[y*15+x]?'#':'.';r.push(t);}return r;} // la flamme en lignes de cases, pour le dessin SVG du réglage des figures (même forme que NX3_G)
